import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getRateLimitHeaders } from '../rate-limit';

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    api: {
      debug: vi.fn(),
      warn: vi.fn(),
    },
  },
}));

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset the rate limit store by using a fresh identifier each test
    vi.clearAllMocks();
  });

  it('allows first request', () => {
    const id = `test-${Date.now()}-first`;
    const result = checkRateLimit(id);

    expect(result.success).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(9);
  });

  it('decrements remaining count on subsequent requests', () => {
    const id = `test-${Date.now()}-decrement`;

    const first = checkRateLimit(id);
    expect(first.remaining).toBe(9);

    const second = checkRateLimit(id);
    expect(second.remaining).toBe(8);

    const third = checkRateLimit(id);
    expect(third.remaining).toBe(7);
  });

  it('blocks requests after limit exceeded', () => {
    const id = `test-${Date.now()}-exceed`;

    // Use up all 10 requests
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(id);
      expect(result.success).toBe(true);
    }

    // 11th request should be blocked
    const blocked = checkRateLimit(id);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('tracks different identifiers separately', () => {
    const id1 = `test-${Date.now()}-user1`;
    const id2 = `test-${Date.now()}-user2`;

    // Use up requests for user1
    for (let i = 0; i < 10; i++) {
      checkRateLimit(id1);
    }

    // User1 is blocked
    expect(checkRateLimit(id1).success).toBe(false);

    // User2 should still work
    expect(checkRateLimit(id2).success).toBe(true);
  });

  it('returns reset timestamp in the future', () => {
    const id = `test-${Date.now()}-reset`;
    const now = Math.floor(Date.now() / 1000);

    const result = checkRateLimit(id);

    expect(result.reset).toBeGreaterThan(now);
    // Should be within 60 seconds (our window)
    expect(result.reset).toBeLessThanOrEqual(now + 61);
  });
});

describe('getRateLimitHeaders', () => {
  it('returns correct headers for successful request', () => {
    const result = {
      success: true,
      limit: 10,
      remaining: 5,
      reset: 1700000000,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers['X-RateLimit-Limit']).toBe('10');
    expect(headers['X-RateLimit-Remaining']).toBe('5');
    expect(headers['X-RateLimit-Reset']).toBe('1700000000');
  });

  it('returns correct headers for blocked request', () => {
    const result = {
      success: false,
      limit: 10,
      remaining: 0,
      reset: 1700000060,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers['X-RateLimit-Limit']).toBe('10');
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['X-RateLimit-Reset']).toBe('1700000060');
  });

  it('returns string values for all headers', () => {
    const result = {
      success: true,
      limit: 100,
      remaining: 99,
      reset: 9999999999,
    };

    const headers = getRateLimitHeaders(result);

    expect(typeof headers['X-RateLimit-Limit']).toBe('string');
    expect(typeof headers['X-RateLimit-Remaining']).toBe('string');
    expect(typeof headers['X-RateLimit-Reset']).toBe('string');
  });
});
