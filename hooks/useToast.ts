'use client';

/**
 * @fileoverview Hook for managing a queue of auto-dismissing toast notifications.
 */

import { useState, useCallback } from 'react';
import { TOAST_DURATION_MS } from '@/lib/constants';

/** Visual variant for a toast notification. */
export type ToastVariant = 'success' | 'error' | 'info';

/** A single toast notification. */
export interface Toast {
  /** Unique identifier used as the React key. */
  id: string;
  /** Message text displayed in the toast. */
  message: string;
  /** Determines the icon and colour scheme. */
  variant: ToastVariant;
}

/** Return type of {@link useToast}. */
export interface UseToastReturn {
  /** All currently visible toasts. */
  toasts: Toast[];
  /**
   * Displays a new toast. Auto-dismisses after `TOAST_DURATION_MS`.
   *
   * @param message - Text to display.
   * @param variant - Visual variant (default: `'info'`).
   */
  show: (message: string, variant?: ToastVariant) => void;
  /**
   * Immediately removes a toast by ID.
   *
   * @param id - The toast's unique identifier.
   */
  dismiss: (id: string) => void;
}

/**
 * Manages a queue of auto-dismissing toast notifications.
 *
 * @returns Toast list, show callback, and dismiss callback.
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}
