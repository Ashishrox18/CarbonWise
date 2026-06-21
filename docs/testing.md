# Testing

## Overview

CarbonWise uses a two-tier testing strategy:

| Tier | Tool | Scope | Run command |
|---|---|---|---|
| Unit / Integration | Jest + ts-jest | Pure logic, services, hooks, store | `npm test` |
| End-to-end | Playwright | Full browser flows, accessibility | `npm run test:e2e` |

---

## Unit & Integration Tests (`__tests__/`)

### Coverage targets

| File | What is tested |
|---|---|
| `carbonEstimator.test.ts` | All transport modes, meal types, electricity levels, shopping levels, waste options; score boundaries; `getLargestContributor` for every winning category |
| `challenges.test.ts` | Catalogue integrity (unique IDs, valid categories, positive CO₂); `selectDailyChallenges` for all categories; determinism; no duplicates; date variation |
| `validators.test.ts` | Every Zod schema (valid + invalid); all enum values; boundary conditions; `parseCarbonAnalysis`; `stripCodeFences` edge cases; `ChatMessageSchema`; `CheckInRecordSchema` |
| `storage.test.ts` | `saveCheckIn`/`getCheckIns` (save, replace, multiple); `getTodayCheckIn`; `getRecentCheckIns`; `computeProgressStats` (streak, average, CO₂, weekly scores, gap reset); chat message CRUD; corrupted data recovery |
| `geminiService.test.ts` | `buildFallbackAnalysis` for all answer combinations; `analyzeWithGemini` — missing key, 429, 500, invalid JSON, Zod failure, success, code fence stripping |
| `groqService.test.ts` | `chatWithGroq` — missing key, 429, 503, empty response, success, history truncation |
| `rateLimiter.test.ts` | Within limit; at limit; over limit; key isolation; window expiry (fake timers); `getRemainingRequests` accuracy |
| `useCarbonStore.test.ts` | `loadData`, `addCheckIn`, `completeChallenge` (normal, no-op, idempotent), `addChatMessage`, `clearChat`, `setLoading`, `setError`, `selectProgressStats` |

### Running tests

```bash
# All unit tests
npm test

# With coverage report
npm run test:ci

# Single file
node node_modules/jest/bin/jest.js __tests__/storage.test.ts
```

### Coverage configuration

Configured in `jest.config.js`:

```js
collectCoverageFrom: [
  'lib/**/*.ts',
  'services/**/*.ts',
  'hooks/**/*.ts',
  'store/**/*.ts',
  'components/**/*.tsx',
  'app/api/**/*.ts',
]
```

Thresholds (enforced in CI): **80% lines, functions, statements; 75% branches**.

---

## End-to-End Tests (`e2e/`)

All E2E tests use Playwright and require the dev server running on `localhost:3000`.

### Test suites

#### `Daily Carbon Check-In`
- Landing page renders heading and CTA button
- All 5 steps of the check-in form render in sequence
- Correct text prompt shown at each step
- Progress bar `aria-valuenow` advances with each step

#### `Navigation`
- `/dashboard` renders "Progress Dashboard" heading
- `/coach` renders "AI Coach" heading

#### `Accessibility`
- Skip link is focusable on first `Tab` from page load
- `#main-content` landmark exists on all pages

### Running E2E tests

```bash
# Requires dev server: npm run dev
npm run test:e2e

# View HTML report
npx playwright show-report
```

### CI configuration

E2E tests do NOT run in the standard CI pipeline (they require a live server and real API keys).
They are intended to be run manually before releases or in a dedicated E2E pipeline with secrets injected.

---

## Test Design Decisions

### Why Jest + ts-jest (not Vitest)?

The project predates the Next.js Vitest integration. Jest with ts-jest works reliably with the existing Next.js + TypeScript setup and has no configuration migration cost.

### Why no React Testing Library for component tests?

The components are thin UI wrappers over pure logic in `lib/` and `services/`. The business-critical paths (carbon estimation, challenge selection, storage, AI services) are exercised through unit tests of the pure functions. Component rendering tests would add significant complexity (mocking Zustand, framer-motion, recharts) for marginal benefit given the existing Playwright E2E coverage.

### Why fake timers for rate limiter tests?

The rate limiter uses real `Date.now()`. Testing window expiry with `jest.useFakeTimers()` and `jest.advanceTimersByTime()` is the only reliable way to test time-based behaviour without flaky sleeps.

### Why not mock localStorage in the store tests?

The `jest.setup.ts` provides a full in-memory localStorage mock that works identically to the real API. This lets the store tests exercise the actual save/load path without needing extra mocking.

### Why test `buildFallbackAnalysis` separately from `analyzeWithGemini`?

`buildFallbackAnalysis` is the critical safety net that ensures users always get a result. It must work correctly in isolation. `analyzeWithGemini` tests focus on the HTTP/validation layer.

---

## Continuous Integration

The CI pipeline (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

1. **TypeScript type check** — `npm run typecheck`
2. **ESLint** — `npm run lint`
3. **Unit tests with coverage** — `npm run test:ci`
4. **Production build** — `npm run build`
5. **Dependency security audit** — `npm audit --audit-level=high`

All steps must pass before a PR can be merged.
