import { checkRateLimit, getRemainingRequests } from '@/services/rateLimiter';

describe('checkRateLimit', () => {
  it('allows requests within the limit', () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 5)).toBe(true);
    expect(checkRateLimit(key, 5)).toBe(true);
    expect(checkRateLimit(key, 5)).toBe(true);
  });

  it('blocks requests that exceed the limit', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3);
    expect(checkRateLimit(key, 3)).toBe(false);
  });

  it('different keys are tracked independently', () => {
    const key1 = `test:${Math.random()}`;
    const key2 = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key1, 3);
    // key1 is exhausted, key2 should still be allowed
    expect(checkRateLimit(key1, 3)).toBe(false);
    expect(checkRateLimit(key2, 3)).toBe(true);
  });
});

describe('getRemainingRequests', () => {
  it('returns max when no requests made', () => {
    const key = `test:${Math.random()}`;
    expect(getRemainingRequests(key, 10)).toBe(10);
  });

  it('decrements correctly after requests', () => {
    const key = `test:${Math.random()}`;
    checkRateLimit(key, 10);
    checkRateLimit(key, 10);
    expect(getRemainingRequests(key, 10)).toBe(8);
  });
});
