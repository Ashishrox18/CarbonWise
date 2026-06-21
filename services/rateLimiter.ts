/**
 * @fileoverview Simple in-memory rate limiter for API routes.
 *
 * Uses a sliding window keyed by IP address.
 * Not shared across serverless instances — suitable for edge-case protection
 * in a single-instance or low-traffic deployment.
 */

import { RATE_LIMIT } from '@/lib/constants';

interface WindowRecord {
  timestamps: number[];
}

const store = new Map<string, WindowRecord>();

/**
 * Checks whether a given key has exceeded the allowed request rate.
 *
 * @param key - Identifier (e.g. IP address + endpoint).
 * @param maxRequests - Maximum requests allowed within the window.
 * @returns true if the request is allowed, false if rate-limited.
 */
export function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.WINDOW_MS;

  const record = store.get(key) ?? { timestamps: [] };
  record.timestamps = record.timestamps.filter(t => t > windowStart);

  if (record.timestamps.length >= maxRequests) return false;

  record.timestamps.push(now);
  store.set(key, record);
  return true;
}

/**
 * Returns the number of remaining requests for a key in the current window.
 */
export function getRemainingRequests(key: string, maxRequests: number): number {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.WINDOW_MS;
  const record = store.get(key);
  if (!record) return maxRequests;
  const recent = record.timestamps.filter(t => t > windowStart).length;
  return Math.max(0, maxRequests - recent);
}
