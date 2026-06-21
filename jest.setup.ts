/**
 * @fileoverview Jest global test setup.
 *
 * - Provides a full localStorage mock (jsdom's built-in is incomplete)
 * - Extends Jest matchers with @testing-library/jest-dom
 * - Stubs window.matchMedia (not implemented in jsdom)
 * - Stubs console.error to surface unexpected errors without noise
 */

import '@testing-library/jest-dom';

// ─── localStorage mock ────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (key: string): string | null => store[key] ?? null,
    setItem:    (key: string, value: string): void => { store[key] = value; },
    removeItem: (key: string): void => { delete store[key]; },
    clear:      (): void => { store = {}; },
    get length(): number { return Object.keys(store).length; },
    key:        (index: number): string | null => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value:    localStorageMock,
  writable: true,
});

// ─── matchMedia stub (required by framer-motion / recharts) ───────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches:             false,
    media:               query,
    onchange:            null,
    addListener:         jest.fn(),
    removeListener:      jest.fn(),
    addEventListener:    jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent:       jest.fn(),
  }),
});

// ─── ResizeObserver stub (required by recharts) ───────────────────
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe:   jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// ─── AbortSignal.timeout stub (not implemented in jsdom) ─────────
if (typeof AbortSignal.timeout !== 'function') {
  AbortSignal.timeout = (ms: number): AbortSignal => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

// ─── Reset localStorage before every test ────────────────────────
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
