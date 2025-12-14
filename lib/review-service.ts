// Review service - orchestrates caching, GitHub fetching, and AI review
import { ReviewResult } from '@/types';
import { ParsedGitHubUrl } from '@/types';
import {
  fetchPullRequest,
  fetchRepository,
  fetchPRFiles,
  fetchPRCommitHash,
  fetchRepoCommitHash,
  fetchCommitHash,
  fetchBranchCommitHash,
} from './github';
import { generateReview } from './reviewer';
import { getCachedReview, setCachedReview, CachedReview } from './cache';

export interface ReviewServiceResult {
  review: ReviewResult;
  cached: boolean;
  commitHash: string;
  cacheInfo?: {
    cachedAt: string;
    expiresAt: string;
  };
}

/**
 * Get commit hash based on URL type
 */
async function getCommitHash(parsed: ParsedGitHubUrl): Promise<string> {
  const { owner, repo, type, identifier } = parsed;

  switch (type) {
    case 'pr':
      return fetchPRCommitHash(owner, repo, identifier as number);

    case 'repo':
      return fetchRepoCommitHash(owner, repo);

    case 'commit':
      return fetchCommitHash(owner, repo, identifier as string);

    case 'branch':
      return fetchBranchCommitHash(owner, repo, identifier as string);

    default:
      throw new Error(`Unsupported URL type: ${type}`);
  }
}

/**
 * Fetch content for review based on URL type
 */
async function fetchReviewContent(
  parsed: ParsedGitHubUrl
): Promise<{
  type: 'pr' | 'repo';
  content: string;
  metadata: Record<string, any>;
}> {
  const { owner, repo, type, identifier } = parsed;

  if (type === 'pr') {
    const prData = await fetchPullRequest(owner, repo, identifier as number);
    const prFiles = await fetchPRFiles(owner, repo, identifier as number);

    const content = `
# Pull Request: ${prData.title}

## Description
${prData.body || 'No description provided.'}

## Changes Summary
- Files changed: ${prData.changedFiles}
- Additions: +${prData.additions}
- Deletions: -${prData.deletions}
- Commits: ${prData.commits}
- Status: ${prData.isDraft ? 'DRAFT' : 'Ready'}

## File Changes
${prFiles}
`.trim();

    return {
      type: 'pr',
      content,
      metadata: {
        author: prData.author,
        filesChanged: prData.changedFiles,
        additions: prData.additions,
        deletions: prData.deletions,
        isDraft: prData.isDraft,
        commits: prData.commits,
        prNumber: prData.number,
      },
    };
  }

  // For repo, branch, commit - treat as repo review
  const repoData = await fetchRepository(owner, repo);

  const content = `
# Repository: ${repoData.name}

## Description
${repoData.description || 'No description provided.'}

## Repository Info
- Primary Language: ${repoData.language || 'Not specified'}
- Stars: ${repoData.stars}
- Has Tests: ${repoData.hasTests ? 'Yes' : 'No or not detected'}

## README
${repoData.readmeContent || 'No README found.'}
`.trim();

  return {
    type: 'repo',
    content,
    metadata: {
      name: repoData.name,
      language: repoData.language,
      stars: repoData.stars,
      hasTests: repoData.hasTests,
    },
  };
}

/**
 * Main review service function
 * Handles caching, commit hash validation, and review generation
 */
export async function getReview(
  parsed: ParsedGitHubUrl
): Promise<ReviewServiceResult> {
  const url = parsed.url;

  // Step 1: Get current commit hash
  console.log(`[ReviewService] Fetching commit hash for ${url}`);
  const currentCommitHash = await getCommitHash(parsed);
  console.log(`[ReviewService] Current commit: ${currentCommitHash.substring(0, 7)}`);

  // Step 2: Check cache
  const cached = getCachedReview(url, currentCommitHash);

  if (cached) {
    console.log(`[ReviewService] Returning cached review`);
    return {
      review: cached.review,
      cached: true,
      commitHash: cached.commitHash,
      cacheInfo: {
        cachedAt: cached.cachedAt,
        expiresAt: cached.expiresAt,
      },
    };
  }

  // Step 3: Fetch content and generate new review
  console.log(`[ReviewService] Cache miss - generating new review`);
  const { type, content, metadata } = await fetchReviewContent(parsed);

  const review = await generateReview({
    type,
    content,
    metadata,
    url,
  });

  // Step 4: Store in cache
  setCachedReview(url, currentCommitHash, review);

  return {
    review,
    cached: false,
    commitHash: currentCommitHash,
  };
}
