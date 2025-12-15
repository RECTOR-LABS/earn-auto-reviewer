// Simple in-memory rate limiter for POC
// For production: Replace with @upstash/ratelimit + Redis

import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // 10 requests per window

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    logger.api.debug('Rate limit cleanup', { cleaned, remaining: store.size });
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // No entry or window expired - create new entry
  if (!entry || entry.resetAt < now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      success: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS - 1,
      reset: Math.ceil((now + WINDOW_MS) / 1000),
    };
  }

  // Within window - check count
  if (entry.count >= MAX_REQUESTS) {
    logger.api.warn('Rate limit exceeded', { identifier, count: entry.count });
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: Math.ceil(entry.resetAt / 1000),
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - entry.count,
    reset: Math.ceil(entry.resetAt / 1000),
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}
