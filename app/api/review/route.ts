import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseGitHubUrl } from '@/lib/github';
import { getReview } from '@/lib/review-service';
import { JudgeId, PANEL_PRESETS, JUDGES, ModelId, MODELS, DEFAULT_MODEL, MODEL_ORDER } from '@/types';
import { logger } from '@/lib/logger';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

// Valid judge IDs
const VALID_JUDGES = Object.keys(JUDGES) as JudgeId[];

// Valid model IDs
const VALID_MODELS = Object.keys(MODELS) as ModelId[];

// Zod schema for request validation
const ReviewRequestSchema = z.object({
  url: z.string().min(1, 'GitHub URL is required').url('Invalid URL format'),
  judges: z.array(z.string()).optional(),
  preset: z.enum(['quick', 'standard', 'comprehensive', 'custom']).optional(),
  model: z.string().optional(),
});

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: rateLimit.reset - Math.floor(Date.now() / 1000),
      },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          ...getRateLimitHeaders(rateLimit),
          'Retry-After': (rateLimit.reset - Math.floor(Date.now() / 1000)).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = ReviewRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Invalid request body';
      return NextResponse.json(
        { error: errorMessage, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { url, judges: requestedJudges, preset, model: requestedModel } = validation.data;

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

    // Determine which model to use
    let model: ModelId = DEFAULT_MODEL;
    if (requestedModel && VALID_MODELS.includes(requestedModel as ModelId)) {
      model = requestedModel as ModelId;
    }

    logger.api.info('Review request', { url, judges: judges.length, model });

    try {
      const result = await getReview(parsed, judges, model);

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
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            ...getRateLimitHeaders(rateLimit),
          },
        }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal error';
    logger.api.error('Review error', { error: errorMessage });
    return NextResponse.json(
      { error: errorMessage, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET: Return available judges, presets, and models
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
    models: MODELS,
    modelOrder: MODEL_ORDER,
    defaultModel: DEFAULT_MODEL,
  });
}
