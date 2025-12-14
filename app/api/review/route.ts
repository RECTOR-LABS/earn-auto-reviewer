import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl } from '@/lib/github';
import { getReview } from '@/lib/review-service';

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

    // Get review (handles caching, commit hash validation, and AI generation)
    try {
      const result = await getReview(parsed);

      // Return review with cache info
      return NextResponse.json(
        {
          ...result.review,
          _cache: {
            hit: result.cached,
            commitHash: result.commitHash.substring(0, 7),
            ...(result.cacheInfo && {
              cachedAt: result.cacheInfo.cachedAt,
              expiresAt: result.cacheInfo.expiresAt,
            }),
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      // Handle specific error types
      const errorMessage = error.message || 'Unknown error';

      // GitHub errors
      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          {
            error: errorMessage,
            code: 'GITHUB_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (errorMessage.includes('Access denied') || errorMessage.includes('private')) {
        return NextResponse.json(
          {
            error: errorMessage,
            code: 'GITHUB_FORBIDDEN',
          },
          { status: 403 }
        );
      }

      if (errorMessage.includes('empty')) {
        return NextResponse.json(
          {
            error: 'Repository is empty (no commits to review)',
            code: 'GITHUB_EMPTY',
          },
          { status: 400 }
        );
      }

      // AI/API errors
      if (errorMessage.includes('API key') || errorMessage.includes('OPENROUTER')) {
        return NextResponse.json(
          {
            error: 'AI service configuration error. Please contact support.',
            code: 'AI_CONFIG_ERROR',
          },
          { status: 500 }
        );
      }

      if (errorMessage.includes('credits')) {
        return NextResponse.json(
          {
            error: 'AI service credits depleted. Please try again later.',
            code: 'AI_CREDITS_ERROR',
          },
          { status: 503 }
        );
      }

      if (errorMessage.includes('Invalid review response') || errorMessage.includes('invalid format')) {
        return NextResponse.json(
          {
            error: 'AI returned an invalid response. Please try again.',
            code: 'AI_PARSE_ERROR',
          },
          { status: 500 }
        );
      }

      // Re-throw for generic handler
      throw error;
    }
  } catch (error: any) {
    // Generic error handler
    console.error('[API] Review error:', error);
    return NextResponse.json(
      {
        error: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check cache status (useful for debugging)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter required' },
      { status: 400 }
    );
  }

  // Import cache stats
  const { getCacheStats } = await import('@/lib/cache');
  const stats = getCacheStats();

  return NextResponse.json({
    cacheEntries: stats.entries,
    cachedUrls: stats.urls,
  });
}
