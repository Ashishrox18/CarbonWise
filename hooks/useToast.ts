'use client';

import { useState, useCallback } from 'react';
import { TOAST_DURATION_MS } from '@/lib/constants';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id:      string;
  message: string;
  variant: ToastVariant;
}

/**
 * Manages a queue of toast notifications.
 * Toasts auto-dismiss after TOAST_DURATION_MS.
 */
export function useToast() {
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
