'use client';

/**
 * @fileoverview Generic debounce hook.
 */

import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of inactivity. Useful for deferring expensive operations (e.g. search).
 *
 * @param value - The value to debounce.
 * @param delay - Debounce delay in milliseconds (default: `300`).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
