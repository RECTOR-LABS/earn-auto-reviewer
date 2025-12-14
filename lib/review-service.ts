// Review service - orchestrates caching, GitHub fetching, and AI review
// Multi-Judge Panel System

import { ReviewResult, JudgeId, ParsedGitHubUrl, PANEL_PRESETS, ModelId, DEFAULT_MODEL } from '@/types';
import {
  fetchPullRequest,
  fetchRepository,
  fetchPRFiles,
  fetchPRCommitHash,
  fetchRepoCommitHash,
  fetchCommitHash,
  fetchBranchCommitHash,
} from './github';
import { generateMultiJudgeReview } from './reviewer';
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
 * Generate cache key including judges
 */
function getJudgesCacheKey(judges: JudgeId[]): string {
  return judges.sort().join(',');
}

/**
 * Main review service function
 * Handles caching, commit hash validation, and review generation
 */
export async function getReview(
  parsed: ParsedGitHubUrl,
  judges: JudgeId[] = PANEL_PRESETS.comprehensive,
  model: ModelId = DEFAULT_MODEL
): Promise<ReviewServiceResult> {
  const url = parsed.url;
  const judgeKey = getJudgesCacheKey(judges);

  // Step 1: Get current commit hash
  console.log(`[ReviewService] Fetching commit hash for ${url}`);
  const currentCommitHash = await getCommitHash(parsed);
  console.log(`[ReviewService] Current commit: ${currentCommitHash.substring(0, 7)}`);

  // Step 2: Check cache (include judges in cache key consideration)
  // For now, we cache based on URL + commit hash only
  // Different judge selections will share cache if same URL/commit
  const cached = getCachedReview(url, currentCommitHash);

  // If cached and has same or more judges, return cached
  if (cached) {
    const cachedJudges = cached.review.metadata.judgesUsed || [];
    const hasAllJudges = judges.every(j => cachedJudges.includes(j));

    if (hasAllJudges) {
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
    } else {
      console.log(`[ReviewService] Cache exists but missing judges, regenerating`);
    }
  }

  // Step 3: Fetch content and generate new review
  console.log(`[ReviewService] Generating new review with ${judges.length} judges using ${model}`);
  const { type, content, metadata } = await fetchReviewContent(parsed);

  const review = await generateMultiJudgeReview({
    type,
    content,
    metadata,
    url,
    judges,
    model,
  });

  // Step 4: Store in cache
  setCachedReview(url, currentCommitHash, review);

  return {
    review,
    cached: false,
    commitHash: currentCommitHash,
  };
}
