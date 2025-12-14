// GitHub API integration
import { Octokit } from '@octokit/rest';
import { ParsedGitHubUrl, GitHubPR, GitHubRepo } from '@/types';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Parse GitHub URL to extract owner, repo, and type
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl {
  try {
    // Normalize URL - handle with/without https, www
    const normalizedUrl = url.trim().replace(/^(https?:\/\/)?(www\.)?/, 'https://');
    const urlObj = new URL(normalizedUrl);

    // Only accept github.com URLs
    if (urlObj.hostname !== 'github.com') {
      return {
        type: 'invalid',
        owner: '',
        repo: '',
        url,
      };
    }

    // Parse path: /owner/repo/[type]/[identifier]
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Need at least owner and repo
    if (pathParts.length < 2) {
      return {
        type: 'invalid',
        owner: '',
        repo: '',
        url,
      };
    }

    const [owner, repo, ...rest] = pathParts;

    // PR URL: /owner/repo/pull/123
    if (rest[0] === 'pull' && rest[1]) {
      const prNumber = parseInt(rest[1], 10);
      if (isNaN(prNumber)) {
        return { type: 'invalid', owner, repo, url };
      }
      return {
        type: 'pr',
        owner,
        repo,
        identifier: prNumber,
        url: normalizedUrl,
      };
    }

    // Commit URL: /owner/repo/commit/abc123
    if (rest[0] === 'commit' && rest[1]) {
      return {
        type: 'commit',
        owner,
        repo,
        identifier: rest[1],
        url: normalizedUrl,
      };
    }

    // Branch URL: /owner/repo/tree/branch-name
    if (rest[0] === 'tree' && rest[1]) {
      return {
        type: 'branch',
        owner,
        repo,
        identifier: rest.slice(1).join('/'), // Handle branches with slashes
        url: normalizedUrl,
      };
    }

    // Repo URL: /owner/repo (no additional path or only .git extension)
    if (rest.length === 0 || (rest.length === 1 && rest[0] === '')) {
      return {
        type: 'repo',
        owner,
        repo: repo.replace(/\.git$/, ''), // Remove .git if present
        url: normalizedUrl,
      };
    }

    // Default to repo if we can't determine type
    return {
      type: 'repo',
      owner,
      repo: repo.replace(/\.git$/, ''),
      url: normalizedUrl,
    };
  } catch (error) {
    // Invalid URL format
    return {
      type: 'invalid',
      owner: '',
      repo: '',
      url,
    };
  }
}

/**
 * Fetch pull request data from GitHub
 */
export async function fetchPullRequest(
  owner: string,
  repo: string,
  prNumber: number
): Promise<GitHubPR> {
  try {
    // Fetch PR details
    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Fetch commits count (already in PR data)
    const commitsCount = pr.commits;

    return {
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || 'unknown',
      url: pr.html_url,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changed_files || 0,
      commits: commitsCount,
      body: pr.body || null,
      isDraft: pr.draft || false,
      createdAt: pr.created_at,
    };
  } catch (error: unknown) {
    // Handle common errors
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Pull request #${prNumber} not found in ${owner}/${repo}`);
    }
    if (err.status === 403) {
      throw new Error(`Access denied to ${owner}/${repo}. Repository may be private.`);
    }
    if (err.status === 401) {
      throw new Error('GitHub authentication failed. Check GITHUB_TOKEN.');
    }

    throw new Error(`Failed to fetch PR: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Fetch repository data from GitHub
 */
export async function fetchRepository(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  try {
    // Fetch repo details
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Fetch README content
    let readmeContent: string | null = null;
    try {
      const { data: readme } = await octokit.rest.repos.getReadme({
        owner,
        repo,
      });
      // Decode base64 content
      if (readme.content) {
        readmeContent = Buffer.from(readme.content, 'base64').toString('utf-8');
      }
    } catch {
      // README not found - that's okay
      readmeContent = null;
    }

    // Check for test directories
    let hasTests = false;
    try {
      const { data: contents } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '',
      });

      if (Array.isArray(contents)) {
        // Look for common test directory names
        const testDirs = ['test', 'tests', '__tests__', 'spec', 'specs', 'e2e'];
        hasTests = contents.some(
          (item) => item.type === 'dir' && testDirs.includes(item.name.toLowerCase())
        );

        // Also check for test files in root
        if (!hasTests) {
          const testFilePatterns = ['.test.', '.spec.', '_test.', '.test-'];
          hasTests = contents.some(
            (item) =>
              item.type === 'file' &&
              testFilePatterns.some((pattern) => item.name.includes(pattern))
          );
        }
      }
    } catch {
      // Can't determine test presence
      hasTests = false;
    }

    return {
      name: repoData.name,
      owner: repoData.owner.login,
      url: repoData.html_url,
      description: repoData.description || null,
      stars: repoData.stargazers_count || 0,
      language: repoData.language || null,
      hasTests,
      readmeContent,
    };
  } catch (error: unknown) {
    // Handle common errors
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    }
    if (err.status === 403) {
      throw new Error(`Access denied to ${owner}/${repo}. Repository may be private.`);
    }
    if (err.status === 401) {
      throw new Error('GitHub authentication failed. Check GITHUB_TOKEN.');
    }

    throw new Error(`Failed to fetch repository: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Fetch the latest commit hash for a PR (head SHA)
 */
export async function fetchPRCommitHash(
  owner: string,
  repo: string,
  prNumber: number
): Promise<string> {
  try {
    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return pr.head.sha;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Pull request #${prNumber} not found in ${owner}/${repo}`);
    }
    throw new Error(`Failed to fetch PR commit hash: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Fetch the latest commit hash for a repository (default branch)
 */
export async function fetchRepoCommitHash(
  owner: string,
  repo: string
): Promise<string> {
  try {
    // Get repo info to find default branch
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Get the latest commit on default branch
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: repoData.default_branch,
      per_page: 1,
    });

    if (commits.length === 0) {
      throw new Error('No commits found in repository');
    }

    return commits[0].sha;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    }
    if (err.status === 409) {
      // Empty repository
      throw new Error('Repository is empty (no commits)');
    }
    throw new Error(`Failed to fetch repo commit hash: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Fetch commit hash for a specific commit URL
 */
export async function fetchCommitHash(
  owner: string,
  repo: string,
  commitSha: string
): Promise<string> {
  try {
    // Verify the commit exists and get full SHA
    const { data: commit } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: commitSha,
    });

    return commit.sha;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Commit ${commitSha} not found in ${owner}/${repo}`);
    }
    throw new Error(`Failed to fetch commit: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Fetch commit hash for a branch
 */
export async function fetchBranchCommitHash(
  owner: string,
  repo: string,
  branch: string
): Promise<string> {
  try {
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    return ref.object.sha;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Branch '${branch}' not found in ${owner}/${repo}`);
    }
    throw new Error(`Failed to fetch branch: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Fetch PR files and diff for review (optimized for LLM token usage)
 */
export async function fetchPRFiles(
  owner: string,
  repo: string,
  prNumber: number,
  maxDiffSize: number = 50000 // Limit to ~50k chars to avoid token overflow
): Promise<string> {
  try {
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    let diff = '';
    let currentSize = 0;

    // Prioritize actual code files over generated/config files
    const sortedFiles = files.sort((a, b) => {
      const aIsCode = !/(package-lock|yarn\.lock|\.min\.|\.map|dist\/|build\/)/.test(a.filename);
      const bIsCode = !/(package-lock|yarn\.lock|\.min\.|\.map|dist\/|build\/)/.test(b.filename);
      if (aIsCode && !bIsCode) return -1;
      if (!aIsCode && bIsCode) return 1;
      return 0;
    });

    for (const file of sortedFiles) {
      if (currentSize >= maxDiffSize) {
        diff += '\n\n... (additional files truncated to save tokens) ...\n';
        break;
      }

      const fileHeader = `\n\n## File: ${file.filename}\n`;
      const fileStatus = `Status: ${file.status} (+${file.additions} -${file.deletions})\n`;
      const filePatch = file.patch || '(Binary or too large to display)';

      const fileContent = fileHeader + fileStatus + '\n```diff\n' + filePatch + '\n```\n';

      if (currentSize + fileContent.length <= maxDiffSize) {
        diff += fileContent;
        currentSize += fileContent.length;
      } else {
        // Truncate this file
        const remainingSpace = maxDiffSize - currentSize;
        diff += fileContent.substring(0, remainingSpace);
        diff += '\n\n... (truncated) ...\n';
        break;
      }
    }

    return diff || 'No file changes available.';
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(`Failed to fetch PR files: ${err.message || 'Unknown error'}`);
  }
}
