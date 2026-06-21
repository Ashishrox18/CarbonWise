# Performance

## Bundle Optimisation

- All heavy feature components use `next/dynamic` with loading skeletons
- Tree-shaken imports from `lucide-react` and `recharts`
- `next/font` for zero-FOIT font loading

## Rendering Optimisation

| Component | Technique | Reason |
|---|---|---|
| `Button`, `Card`, `Badge`, `Skeleton` | `React.memo` | Pure presentational — no state |
| `ScoreRing`, `EmptyState` | `React.memo` | Expensive SVG animation |
| `Navigation` (header) | `React.memo` | Renders on every page |
| `ProgressDashboard` | `useMemo` for stats | Computed from full check-in history |
| `DailyChallenges` | `useMemo` for challenges | Derived from today's analysis |
| All event handlers | `useCallback` | Prevents child re-renders |

## AI Response Caching

- Today's carbon analysis is persisted to `localStorage` immediately after generation
- On page reload, the stored result is served instantly — Gemini is not called again
- Daily quests derived from today's analysis (no additional API call)

## Web Vitals Targets

| Metric | Target |
|---|---|
| FCP | < 1.2s |
| LCP | < 2.0s |
| TBT | < 150ms |
| CLS | 0 (skeleton loaders prevent layout shift) |
| INP | < 200ms |
