/**
 * @fileoverview In-memory sliding-window rate limiter for API routes.
 *
 * Keyed by an arbitrary string (typically `endpoint:ip`).
 *
 * Limitations:
 * - State is not shared across serverless instances.
 * - Suitable for single-instance deployments or as a first line of defence.
 * - For multi-instance deployments, replace with a Redis-backed implementation.
 */

import { RATE_LIMIT } from '@/lib/constants';

/** Internal record tracking request timestamps within the current window. */
interface WindowRecord {
  timestamps: number[];
}

const store = new Map<string, WindowRecord>();

/**
 * Checks whether a given key has exceeded the allowed request rate.
 * Advances the sliding window on every call.
 *
 * @param key - Unique identifier for this rate-limit bucket (e.g. `"analyze:1.2.3.4"`).
 * @param maxRequests - Maximum number of requests allowed within `RATE_LIMIT.WINDOW_MS`.
 * @returns `true` if the request is allowed, `false` if it should be rejected.
 */
export function checkRateLimit(key: string, maxRequests: number): boolean {
  const now         = Date.now();
  const windowStart = now - RATE_LIMIT.WINDOW_MS;

  const record = store.get(key) ?? { timestamps: [] };
  // Evict timestamps outside the current window
  record.timestamps = record.timestamps.filter(t => t > windowStart);

  if (record.timestamps.length >= maxRequests) return false;

  record.timestamps.push(now);
  store.set(key, record);
  return true;
}

/**
 * Returns the number of remaining allowed requests for a key within the current window.
 *
 * @param key - The rate-limit bucket identifier.
 * @param maxRequests - The maximum requests allowed per window.
 * @returns Remaining request quota (0 or above).
 */
export function getRemainingRequests(key: string, maxRequests: number): number {
  const now         = Date.now();
  const windowStart = now - RATE_LIMIT.WINDOW_MS;
  const record      = store.get(key);
  if (!record) return maxRequests;
  const activeCount = record.timestamps.filter(t => t > windowStart).length;
  return Math.max(0, maxRequests - activeCount);
}
