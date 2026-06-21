# Engineering Decisions

A record of the non-obvious technical choices made in this project and the reasoning behind them.

---

## 1. Next.js App Router (not Pages Router)

**Decision:** Use Next.js 14 App Router.

**Reasoning:**
- Co-located API routes in `app/api/` keep server-side code close to the pages that use it.
- React Server Components reduce client JS bundle size for static page shell.
- Async `layout.tsx` metadata API is cleaner than the Pages Router `<Head>` approach.

---

## 2. localStorage-first data persistence

**Decision:** All user data is stored in `localStorage` only — no backend database.

**Reasoning:**
- Zero infrastructure cost.
- Zero data breach risk (no server stores PII).
- Still provides a full offline experience.
- Trade-off: data is not synced across devices. Documented as a future improvement.

---

## 3. Two AI providers (Gemini + Groq)

**Decision:** Use Gemini 1.5 Flash for analysis and Groq Llama 3.1 8B for chat.

**Reasoning:**
- Gemini's `responseMimeType: 'application/json'` mode reliably returns structured JSON, making it ideal for the check-in analysis that requires a strict schema.
- Groq's free tier provides very low latency for conversational responses (~300ms), which is critical for a chat interface. Gemini is slower for multi-turn chat.
- Having two providers also means if one is down, only half the app is affected.

---

## 4. Zod for AI output validation

**Decision:** Every AI response is validated with a Zod schema before being used.

**Reasoning:**
- LLMs can return malformed JSON or unexpected field values even when instructed not to.
- Without validation, a bad AI response would cause a runtime crash or corrupt stored data.
- With Zod, a bad response triggers the local fallback gracefully.

---

## 5. Local carbon estimator as AI prompt seed

**Decision:** The Gemini prompt is pre-populated with locally-computed CO₂e estimates.

**Reasoning:**
- LLMs hallucinate numeric values. By providing accurate pre-computed numbers, we constrain the model to return consistent, accurate estimates.
- This also means the fallback path produces identical numbers to what Gemini would have returned — no jarring switch between AI and non-AI modes.

---

## 6. In-memory rate limiter (not Redis)

**Decision:** Use a simple `Map`-based in-memory rate limiter rather than Redis.

**Reasoning:**
- CarbonWise is a single-instance hobby/demo app. A Redis dependency adds cost and operational complexity.
- The in-memory limiter is sufficient as a first line of defence against abuse.
- The limitation (not shared across serverless instances) is documented in `services/rateLimiter.ts` with guidance on how to replace it.

---

## 7. Zustand over Redux or Context

**Decision:** Use Zustand for global state management.

**Reasoning:**
- Much smaller bundle size than Redux (~1KB vs ~15KB).
- No boilerplate (no actions, reducers, or dispatch).
- Direct localStorage integration without middleware.
- Store is a single file — easy to reason about and test.

---

## 8. React.memo + useCallback everywhere

**Decision:** Wrap all pure components in `React.memo` and all event handlers in `useCallback`.

**Reasoning:**
- The check-in form re-renders on every keystroke/selection — aggressive memoisation keeps it smooth.
- The dashboard renders a Recharts chart which is expensive — memoisation prevents unnecessary re-renders.
- Trade-off: slight verbosity. Justified by the measurable performance benefit.

---

## 9. AppHeader extracted as a shared component

**Decision:** Extract the sticky header into `components/layout/AppHeader.tsx`.

**Reasoning:**
- All three pages (home, dashboard, coach) had an identical header implementation copy-pasted three times.
- Any change (e.g. adding a new nav link) had to be made in three places.
- Extraction eliminated the duplication and the associated maintenance risk.

---

## 10. Dynamic imports for all heavy components

**Decision:** Use `next/dynamic` for `CheckInForm`, `AnalysisCard`, `ProgressDashboard`, and `AiCoach`.

**Reasoning:**
- Framer Motion, Recharts, and the large option config arrays add ~80KB to the JS bundle.
- Dynamic imports split these into separate chunks loaded only when needed.
- Loading skeletons prevent layout shift (CLS = 0) while chunks load.
