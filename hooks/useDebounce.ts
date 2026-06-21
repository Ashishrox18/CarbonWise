'use client';

import { useState, useEffect } from 'react';

/**
 * Debounces a value, updating only after the specified delay has elapsed
 * since the last change.
 *
 * @param value - The value to debounce.
 * @param delay - Delay in milliseconds (default 300ms).
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
