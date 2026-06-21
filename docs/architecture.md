# Architecture

## System Overview

CarbonWise is a Next.js 14 App Router application with a clear separation between client state, server-side AI calls, and local data persistence.

## Component Architecture

```
app/page.tsx (Landing + CheckIn + Results)
     ├── CheckInForm       — Multi-step form (dynamic import)
     ├── AnalysisCard      — AI results display (dynamic import)
     └── DailyChallenges   — Challenge completion (dynamic import)

app/dashboard/page.tsx
     └── ProgressDashboard — Score trend + KPIs (dynamic import)

app/coach/page.tsx
     └── AiCoach           — Chat interface (dynamic import)
```

## Data Flow

1. User answers 5 check-in questions (pure client state)
2. `useCheckIn` hook calls `POST /api/analyze`
3. API route validates input with Zod, calls Gemini, validates response with Zod
4. If Gemini fails → local `buildFallbackAnalysis()` is used
5. `CheckInRecord` stored in `localStorage` via `useCarbonStore`
6. Components read from store via Zustand selectors

## Server / Client Boundary

```
CLIENT                    SERVER (API Routes)
──────                    ───────────────────
CheckInForm         →     /api/analyze  →  Gemini 1.5 Flash
AiCoach             →     /api/chat     →  Groq Llama 3.1
useCarbonStore
localStorage
```
