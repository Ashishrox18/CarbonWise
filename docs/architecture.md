# Architecture

## System Overview

CarbonWise is a Next.js 14 App Router application with a clean separation between
client state, server-side AI calls, and local data persistence.

---

## Folder Structure

```
carbonwise/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── analyze/route.ts    # POST: Gemini carbon analysis
│   │   └── chat/route.ts       # POST: Groq AI coach proxy
│   ├── dashboard/page.tsx      # Progress dashboard page
│   ├── coach/page.tsx          # AI coach chat page
│   ├── page.tsx                # Landing + check-in + results
│   ├── layout.tsx              # Root layout (font, metadata, skip link)
│   └── globals.css             # Tailwind base + design tokens
│
├── components/
│   ├── features/               # Domain-specific components
│   │   ├── AiCoach.tsx         # Chat interface (Groq)
│   │   ├── AnalysisCard.tsx    # AI analysis results display
│   │   ├── CheckInForm.tsx     # 5-step multi-step form
│   │   ├── DailyChallenges.tsx # Challenge completion toggles
│   │   ├── LandingHero.tsx     # Landing page hero section
│   │   └── ProgressDashboard.tsx # Score trend + KPI grid
│   ├── layout/
│   │   └── AppHeader.tsx       # Shared sticky header (extracted to avoid duplication)
│   └── ui/                     # Pure presentational primitives
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx            # Card + CardHeader + CardContent + CardFooter
│       ├── EmptyState.tsx
│       ├── ScoreRing.tsx
│       ├── Skeleton.tsx
│       └── ToastContainer.tsx
│
├── hooks/                      # Custom React hooks
│   ├── useChat.ts              # AI coach message dispatch
│   ├── useCheckIn.ts           # Check-in submission + fallback
│   ├── useDebounce.ts          # Generic debounce utility
│   └── useToast.ts             # Auto-dismissing toast queue
│
├── lib/                        # Pure business logic (no React dependencies)
│   ├── carbonEstimator.ts      # Deterministic CO₂e estimator
│   ├── challenges.ts           # Challenge definitions + selection logic
│   ├── constants.ts            # App-wide constants (factors, limits, keys)
│   ├── storage.ts              # Type-safe localStorage wrapper
│   └── validators.ts           # Zod schemas for all domain types
│
├── services/                   # Server-side AI service wrappers
│   ├── gemini.ts               # Gemini 1.5 Flash analysis + fallback
│   ├── groq.ts                 # Groq Llama 3.1 8B chat
│   └── rateLimiter.ts          # In-memory sliding-window rate limiter
│
├── store/
│   └── useCarbonStore.ts       # Zustand global store (synced to localStorage)
│
├── types/
│   └── index.ts                # All domain TypeScript types
│
├── __tests__/                  # Jest unit tests
└── e2e/                        # Playwright end-to-end tests
```

---

## Component Tree

```
app/page.tsx (Landing → Check-In → Results)
     ├── AppHeader           — Shared navigation bar
     ├── LandingHero         — CTA + value props
     ├── CheckInForm         — 5-step form (dynamic)
     ├── AnalysisCard        — AI results (dynamic)
     └── DailyChallenges     — Challenge list (dynamic)

app/dashboard/page.tsx
     ├── AppHeader
     ├── ProgressDashboard   — KPI grid + line chart (dynamic)
     └── DailyChallenges     — (dynamic)

app/coach/page.tsx
     ├── AppHeader
     └── AiCoach             — Chat interface (dynamic)
```

---

## Data Flow

```
1. User answers 5 check-in questions (pure client state in CheckInForm)
2. useCheckIn hook calls POST /api/analyze
3. API route: validates input (Zod) → calls Gemini → validates output (Zod)
4. If Gemini fails → buildFallbackAnalysis() (local estimator, no AI call)
5. CheckInRecord saved to localStorage via useCarbonStore → saveCheckIn()
6. Components read derived state from Zustand store selectors
```

---

## Server / Client Boundary

```
CLIENT                     SERVER (Next.js API Routes)
──────                     ───────────────────────────
CheckInForm          →     POST /api/analyze  →  Gemini 1.5 Flash
AiCoach              →     POST /api/chat     →  Groq Llama 3.1 8B
useCarbonStore
localStorage
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Server-side AI proxy | API keys never reach the browser. All AI calls route through Next.js API routes. |
| Local-first data | All user data lives in `localStorage`. No server-side storage = no data breach risk. |
| Gemini for analysis, Groq for chat | Gemini's structured JSON mode for deep analysis; Groq's Llama 3.1 8B for low-latency conversational responses. |
| Local fallback | If Gemini is unavailable, `buildFallbackAnalysis()` provides instant deterministic results. The user always gets a result. |
| Zod everywhere | Every API input and AI response is validated with Zod schemas before use — never trust external data. |
| AppHeader extraction | All three pages share identical navigation. Extracting it to `components/layout/AppHeader.tsx` eliminates the duplication. |
| selectProgressStats selector | `computeProgressStats` is a pure function in `lib/storage.ts`. The Zustand selector delegates to it, keeping the store thin and testable. |
