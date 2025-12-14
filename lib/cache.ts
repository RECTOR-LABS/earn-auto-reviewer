// Review caching system with commit hash validation
// For POC: In-memory cache (resets on cold start)
// For Production: Replace with Redis/Vercel KV

import { ReviewResult } from '@/types';

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
// Note: This resets on serverless cold starts
// Production should use Redis or Vercel KV
const cacheStore: CacheStore = {};

// Cache TTL: 24 hours (even with same commit, reviews might need refresh)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate cache key from URL
 * Normalizes URLs to avoid duplicates
 */
export function getCacheKey(url: string): string {
  // Normalize URL: remove trailing slashes, lowercase
  const normalized = url
    .toLowerCase()
    .replace(/\/$/, '')
    .replace(/^https?:\/\/(www\.)?/, '');

  return `review:${normalized}`;
}

/**
 * Get cached review if valid
 * Returns null if:
 * - No cache entry exists
 * - Cache has expired
 * - Commit hash doesn't match (code changed)
 */
export function getCachedReview(
  url: string,
  currentCommitHash: string
): CachedReview | null {
  const key = getCacheKey(url);
  const cached = cacheStore[key];

  if (!cached) {
    console.log(`[Cache] MISS - No entry for ${url}`);
    return null;
  }

  // Check expiration
  if (new Date(cached.expiresAt) < new Date()) {
    console.log(`[Cache] EXPIRED - Entry for ${url} has expired`);
    delete cacheStore[key];
    return null;
  }

  // Check commit hash - if code changed, invalidate cache
  if (cached.commitHash !== currentCommitHash) {
    console.log(`[Cache] STALE - Commit hash changed for ${url}`);
    console.log(`[Cache]   Cached: ${cached.commitHash.substring(0, 7)}`);
    console.log(`[Cache]   Current: ${currentCommitHash.substring(0, 7)}`);
    delete cacheStore[key];
    return null;
  }

  console.log(`[Cache] HIT - Returning cached review for ${url}`);
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

  console.log(`[Cache] SET - Cached review for ${url}`);
  console.log(`[Cache]   Commit: ${commitHash.substring(0, 7)}`);
  console.log(`[Cache]   Expires: ${cacheStore[key].expiresAt}`);
}

/**
 * Invalidate cache entry for URL
 */
export function invalidateCache(url: string): boolean {
  const key = getCacheKey(url);
  if (cacheStore[key]) {
    delete cacheStore[key];
    console.log(`[Cache] INVALIDATED - Removed entry for ${url}`);
    return true;
  }
  return false;
}

/**
 * Get cache statistics (for debugging/monitoring)
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
 * Clear all cache entries
 */
export function clearCache(): void {
  Object.keys(cacheStore).forEach(key => delete cacheStore[key]);
  console.log('[Cache] CLEARED - All entries removed');
}
