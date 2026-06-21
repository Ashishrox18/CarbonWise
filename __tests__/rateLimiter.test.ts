/**
 * @fileoverview Unit tests for services/rateLimiter.ts
 *
 * Coverage targets:
 * - checkRateLimit: within limit, at limit, over limit
 * - getRemainingRequests: fresh key, partial use, exhausted
 * - Key isolation
 * - Window expiry (requires fake timers)
 */

import { checkRateLimit, getRemainingRequests } from '@/services/rateLimiter';

describe('checkRateLimit', () => {
  it('allows first request', () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 1)).toBe(true);
  });

  it('allows requests within the limit', () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 5)).toBe(true);
    expect(checkRateLimit(key, 5)).toBe(true);
    expect(checkRateLimit(key, 5)).toBe(true);
  });

  it('allows exactly maxRequests requests', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, 3)).toBe(true);
    }
  });

  it('blocks the request that exceeds the limit', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3);
    expect(checkRateLimit(key, 3)).toBe(false);
  });

  it('continues blocking after being over the limit', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3);
    expect(checkRateLimit(key, 3)).toBe(false);
    expect(checkRateLimit(key, 3)).toBe(false);
  });

  it('tracks different keys independently', () => {
    const key1 = `test:${Math.random()}`;
    const key2 = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key1, 3);
    expect(checkRateLimit(key1, 3)).toBe(false);
    expect(checkRateLimit(key2, 3)).toBe(true);
  });

  it('allows 1 request for limit of 1', () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 1)).toBe(true);
    expect(checkRateLimit(key, 1)).toBe(false);
  });

  it('allows many requests for a high limit', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(key, 100)).toBe(true);
    }
  });

  it('expires old timestamps after window passes', () => {
    jest.useFakeTimers();
    const key = `test:${Math.random()}`;

    for (let i = 0; i < 3; i++) checkRateLimit(key, 3);
    expect(checkRateLimit(key, 3)).toBe(false);

    // Advance past the 60-second window
    jest.advanceTimersByTime(61_000);

    // Should be allowed again
    expect(checkRateLimit(key, 3)).toBe(true);
    jest.useRealTimers();
  });
});

describe('getRemainingRequests', () => {
  it('returns max when no requests have been made', () => {
    const key = `test:${Math.random()}`;
    expect(getRemainingRequests(key, 10)).toBe(10);
  });

  it('decrements by 1 after one request', () => {
    const key = `test:${Math.random()}`;
    checkRateLimit(key, 10);
    expect(getRemainingRequests(key, 10)).toBe(9);
  });

  it('decrements correctly after multiple requests', () => {
    const key = `test:${Math.random()}`;
    checkRateLimit(key, 10);
    checkRateLimit(key, 10);
    checkRateLimit(key, 10);
    expect(getRemainingRequests(key, 10)).toBe(7);
  });

  it('returns 0 when limit is fully exhausted', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 5; i++) checkRateLimit(key, 5);
    expect(getRemainingRequests(key, 5)).toBe(0);
  });

  it('never returns negative', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 10; i++) checkRateLimit(key, 3);
    expect(getRemainingRequests(key, 3)).toBeGreaterThanOrEqual(0);
  });

  it('resets after window expires', () => {
    jest.useFakeTimers();
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 5; i++) checkRateLimit(key, 5);
    expect(getRemainingRequests(key, 5)).toBe(0);

    jest.advanceTimersByTime(61_000);
    expect(getRemainingRequests(key, 5)).toBe(5);
    jest.useRealTimers();
  });
});
