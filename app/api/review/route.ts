import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl } from '@/lib/github';
import { getReview } from '@/lib/review-service';
import { JudgeId, PANEL_PRESETS, JUDGES } from '@/types';

// Valid judge IDs
const VALID_JUDGES = Object.keys(JUDGES) as JudgeId[];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, judges: requestedJudges, preset } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'GitHub URL is required', code: 'MISSING_URL' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(url);

    if (parsed.type === 'invalid') {
      return NextResponse.json(
        { error: 'Invalid GitHub URL', code: 'INVALID_URL' },
        { status: 400 }
      );
    }

    // Determine which judges to use
    let judges: JudgeId[];

    if (preset && preset in PANEL_PRESETS) {
      // Use preset
      judges = PANEL_PRESETS[preset as keyof typeof PANEL_PRESETS];
    } else if (requestedJudges && Array.isArray(requestedJudges)) {
      // Use custom selection
      judges = requestedJudges.filter((j: string) =>
        VALID_JUDGES.includes(j as JudgeId)
      ) as JudgeId[];

      if (judges.length === 0) {
        judges = PANEL_PRESETS.comprehensive;
      }
    } else {
      // Default to comprehensive
      judges = PANEL_PRESETS.comprehensive;
    }

    console.log(`[API] Review request for ${url}`);
    console.log(`[API] Using ${judges.length} judges: ${judges.join(', ')}`);

    try {
      const result = await getReview(parsed, judges);

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
      const errorMessage = error.message || 'Unknown error';

      // GitHub errors
      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          { error: errorMessage, code: 'GITHUB_NOT_FOUND' },
          { status: 404 }
        );
      }

      if (errorMessage.includes('Access denied') || errorMessage.includes('private')) {
        return NextResponse.json(
          { error: errorMessage, code: 'GITHUB_FORBIDDEN' },
          { status: 403 }
        );
      }

      if (errorMessage.includes('empty')) {
        return NextResponse.json(
          { error: 'Repository is empty', code: 'GITHUB_EMPTY' },
          { status: 400 }
        );
      }

      // AI errors
      if (errorMessage.includes('API key') || errorMessage.includes('OPENROUTER')) {
        return NextResponse.json(
          { error: 'AI service configuration error', code: 'AI_CONFIG_ERROR' },
          { status: 500 }
        );
      }

      if (errorMessage.includes('credits')) {
        return NextResponse.json(
          { error: 'AI service credits depleted', code: 'AI_CREDITS_ERROR' },
          { status: 503 }
        );
      }

      if (errorMessage.includes('Invalid review response')) {
        return NextResponse.json(
          { error: 'AI returned invalid response', code: 'AI_PARSE_ERROR' },
          { status: 500 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error('[API] Review error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET: Return available judges and presets
export async function GET() {
  return NextResponse.json({
    judges: JUDGES,
    presets: {
      quick: {
        name: 'Quick Review',
        description: '3 essential judges for fast feedback',
        judges: PANEL_PRESETS.quick,
      },
      standard: {
        name: 'Standard Review',
        description: '5 judges covering key areas',
        judges: PANEL_PRESETS.standard,
      },
      comprehensive: {
        name: 'Comprehensive Review',
        description: 'All 8 expert judges for thorough analysis',
        judges: PANEL_PRESETS.comprehensive,
      },
    },
  });
}
