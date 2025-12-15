// Review caching system with commit hash validation
// For POC: In-memory cache (resets on cold start)
// For Production: Replace with Redis/Vercel KV

import { ReviewResult } from '@/types';
import { logger } from './logger';

export interface CachedReview {
  review: ReviewResult;
  commitHash: string;
  url: string;
  cachedAt: string;
  expiresAt: string;
}

interface CacheStore {
  [key: string]: CachedReview;
}

// In-memory cache store
const cacheStore: CacheStore = {};

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate cache key from URL
 */
export function getCacheKey(url: string): string {
  const normalized = url
    .toLowerCase()
    .replace(/\/$/, '')
    .replace(/^https?:\/\/(www\.)?/, '');

  return `review:${normalized}`;
}

/**
 * Get cached review if valid
 */
export function getCachedReview(
  url: string,
  currentCommitHash: string
): CachedReview | null {
  const key = getCacheKey(url);
  const cached = cacheStore[key];

  if (!cached) {
    logger.cache.debug('MISS - No entry', { url });
    return null;
  }

  // Check expiration
  if (new Date(cached.expiresAt) < new Date()) {
    logger.cache.debug('EXPIRED - Entry has expired', { url });
    delete cacheStore[key];
    return null;
  }

  // Check commit hash
  if (cached.commitHash !== currentCommitHash) {
    logger.cache.info('STALE - Commit hash changed', {
      url,
      cached: cached.commitHash.substring(0, 7),
      current: currentCommitHash.substring(0, 7),
    });
    delete cacheStore[key];
    return null;
  }

  logger.cache.info('HIT - Returning cached review', { url });
  return cached;
}

/**
 * Store review in cache
 */
export function setCachedReview(
  url: string,
  commitHash: string,
  review: ReviewResult
): void {
  const key = getCacheKey(url);
  const now = new Date();

  cacheStore[key] = {
    review,
    commitHash,
    url,
    cachedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
  };

  logger.cache.info('SET - Cached review', {
    url,
    commit: commitHash.substring(0, 7),
    judges: review.metadata.judgesUsed?.length || 0,
  });
}

/**
 * Invalidate cache entry
 */
export function invalidateCache(url: string): boolean {
  const key = getCacheKey(url);
  if (cacheStore[key]) {
    delete cacheStore[key];
    logger.cache.info('INVALIDATED - Removed entry', { url });
    return true;
  }
  return false;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  entries: number;
  urls: string[];
} {
  const entries = Object.keys(cacheStore).length;
  const urls = Object.values(cacheStore).map(c => c.url);
  return { entries, urls };
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  Object.keys(cacheStore).forEach(key => delete cacheStore[key]);
  logger.cache.info('CLEARED - All entries removed');
}
