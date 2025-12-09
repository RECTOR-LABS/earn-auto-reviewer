import { NextRequest, NextResponse } from 'next/server';
import {
  parseGitHubUrl,
  fetchPullRequest,
  fetchRepository,
  fetchPRFiles,
} from '@/lib/github';
import { generateReview } from '@/lib/reviewer';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate URL presence
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          error: 'GitHub URL is required',
          code: 'MISSING_URL',
        },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(url);

    if (parsed.type === 'invalid') {
      return NextResponse.json(
        {
          error: 'Invalid GitHub URL. Please provide a valid GitHub repository or pull request URL.',
          code: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    // Handle different GitHub resource types
    let reviewData;
    let content = '';
    let metadata: Record<string, any> = {};

    if (parsed.type === 'pr' && typeof parsed.identifier === 'number') {
      // Fetch PR data
      try {
        const prData = await fetchPullRequest(
          parsed.owner,
          parsed.repo,
          parsed.identifier
        );

        // Fetch PR files and diff
        const prFiles = await fetchPRFiles(
          parsed.owner,
          parsed.repo,
          parsed.identifier
        );

        // Prepare content for LLM
        content = `
# Pull Request: ${prData.title}

**Author:** ${prData.author}
**Status:** ${prData.isDraft ? 'Draft' : 'Ready for Review'}

## Description
${prData.body || 'No description provided'}

## Changes Summary
- Files Changed: ${prData.changedFiles}
- Additions: +${prData.additions}
- Deletions: -${prData.deletions}
- Commits: ${prData.commits}

## Code Changes
${prFiles}
        `.trim();

        metadata = {
          prNumber: prData.number,
          author: prData.author,
          filesChanged: prData.changedFiles,
          additions: prData.additions,
          deletions: prData.deletions,
          isDraft: prData.isDraft,
        };
      } catch (error: any) {
        // Handle GitHub API errors
        if (error.message.includes('not found')) {
          return NextResponse.json(
            {
              error: error.message,
              code: 'GITHUB_NOT_FOUND',
            },
            { status: 404 }
          );
        }
        if (error.message.includes('Access denied') || error.message.includes('private')) {
          return NextResponse.json(
            {
              error: error.message,
              code: 'GITHUB_FORBIDDEN',
            },
            { status: 403 }
          );
        }
        throw error;
      }
    } else if (parsed.type === 'repo' || parsed.type === 'commit' || parsed.type === 'branch') {
      // For repo/commit/branch, treat as repository review
      try {
        const repoData = await fetchRepository(parsed.owner, parsed.repo);

        // Prepare content for LLM
        content = `
# Repository: ${repoData.name}

**Owner:** ${repoData.owner}
**Language:** ${repoData.language || 'Not specified'}
**Stars:** ${repoData.stars}

## Description
${repoData.description || 'No description provided'}

## README
${repoData.readmeContent || 'No README available'}

## Project Analysis
- Has Tests: ${repoData.hasTests ? 'Yes' : 'No'}
        `.trim();

        metadata = {
          name: repoData.name,
          language: repoData.language,
          stars: repoData.stars,
          hasTests: repoData.hasTests,
        };
      } catch (error: any) {
        // Handle GitHub API errors
        if (error.message.includes('not found')) {
          return NextResponse.json(
            {
              error: error.message,
              code: 'GITHUB_NOT_FOUND',
            },
            { status: 404 }
          );
        }
        if (error.message.includes('Access denied') || error.message.includes('private')) {
          return NextResponse.json(
            {
              error: error.message,
              code: 'GITHUB_FORBIDDEN',
            },
            { status: 403 }
          );
        }
        throw error;
      }
    }

    // Generate AI review
    try {
      reviewData = await generateReview({
        type: parsed.type === 'pr' ? 'pr' : 'repo',
        content,
        metadata,
        url: parsed.url,
      });

      return NextResponse.json(reviewData, { status: 200 });
    } catch (error: any) {
      // Handle AI review errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            error: 'AI service configuration error. Please contact support.',
            code: 'AI_CONFIG_ERROR',
          },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    // Generic error handler
    console.error('Review API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
