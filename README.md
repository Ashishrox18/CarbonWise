# 🌿 CarbonWise

> **Small daily actions. Big climate impact.**

[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Playwright-orange?style=flat-square)](https://jestjs.io)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-0053A0?style=flat-square)](https://www.w3.org/WAI/WCAG21)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-Local--First-22c55e?style=flat-square)](docs/security.md)

CarbonWise is a production-grade, AI-powered web application that helps individuals understand, track, and reduce their daily carbon footprint through simple check-ins and personalised insights.

---

## 🎯 Problem Alignment

| Challenge Requirement | Implementation | File |
|---|---|---|
| Understand daily carbon footprint | 5-step check-in with real CO₂e estimates | `lib/carbonEstimator.ts` |
| Identify highest-impact habits | AI analysis with category breakdown | `services/gemini.ts` |
| AI-generated personalised recommendations | Gemini structured JSON analysis | `app/api/analyze/route.ts` |
| Track progress over time | 7-day score trend + streak | `components/features/ProgressDashboard.tsx` |
| Build sustainable habits | Daily eco challenges with CO₂ savings | `lib/challenges.ts` |
| AI coach / chatbot | Groq Llama 3.1 conversational coach | `app/api/chat/route.ts` |
| Structured AI responses | Zod-validated JSON schema | `lib/validators.ts` |
| Simple under-3-minute experience | 5 questions, one answer per step | `components/features/CheckInForm.tsx` |

---

## 🏗️ Architecture

```
carbonwise/
├── app/                    # Next.js App Router pages
│   ├── api/
│   │   ├── analyze/        # POST: Gemini carbon analysis
│   │   └── chat/           # POST: Groq AI coach
│   ├── dashboard/          # Progress dashboard page
│   ├── coach/              # AI coach chat page
│   └── page.tsx            # Landing + check-in + results
├── components/
│   ├── features/           # Domain components (CheckIn, Analysis, Challenges, Coach)
│   └── ui/                 # Pure presentational components (Button, Card, Badge, etc.)
├── hooks/                  # Custom React hooks (useCheckIn, useChat, useToast, useDebounce)
├── lib/                    # Pure business logic (estimator, challenges, storage, constants)
├── services/               # Server-side AI services (Gemini, Groq, rate limiter)
├── store/                  # Zustand global state
├── types/                  # TypeScript domain types
├── __tests__/              # Jest unit tests
└── e2e/                    # Playwright end-to-end tests
```

### Key Design Decisions

1. **Server-side AI proxy** — All AI calls route through Next.js API routes. API keys never reach the browser.
2. **Local-first data** — All user data lives in `localStorage`. Zero server-side persistence means zero data breach risk.
3. **Gemini for analysis, Groq for chat** — Gemini's structured JSON mode for deep analysis; Groq's Llama 3.1 8B for low-latency conversational responses.
4. **AI fallback** — If Gemini is unavailable, the local `carbonEstimator` provides instant deterministic results — the user always gets a result.
5. **Zod everywhere** — Every API input and AI response is validated with Zod schemas before use.

---

## 🤖 AI Decision Engine

```
User Check-In Answers
       ↓
Local Carbon Estimator (deterministic, instant)
       ↓
Gemini 1.5 Flash (structured JSON prompt)
       ↓ (validates with Zod)
CarbonAnalysis { score, breakdown, topActions, weeklyGoal }
       ↓
Daily Challenge Generator (category-aware selection)
       ↓
Progress Store (localStorage persistence)
       ↓
Dashboard + Trend Chart
```

The Gemini prompt is pre-seeded with the local estimate, constraining the model to return consistent, accurate numbers rather than hallucinating values.

---

## 🔒 Security

- **No API key exposure** — `GEMINI_API_KEY` and `GROQ_API_KEY` are read from `process.env` server-side only
- **Input validation** — All API endpoints validate requests with Zod before processing
- **Output validation** — All AI responses are parsed and validated with Zod; invalid responses trigger the fallback
- **Rate limiting** — In-memory sliding window per IP: 10 req/min for analysis, 20 req/min for chat
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`
- **No PII collected** — Only carbon habit data stored locally

See [`docs/security.md`](docs/security.md) for the full threat model.

---

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm test              # Run all unit tests
npm run test:ci       # CI mode with coverage
```

**Coverage areas:**
- Carbon estimator (score calculation, contributor identification)
- Zod validators (valid/invalid inputs for all schemas)
- Storage layer (save, retrieve, compute stats)
- Challenge selection (deduplication, category priority)
- Gemini service (fallback analysis, response shape)
- Rate limiter (window tracking, key isolation)

### End-to-End Tests (Playwright)
```bash
npm run test:e2e      # Run E2E tests (requires `npm run dev` running)
npx playwright show-report  # View HTML report
```

**E2E flows covered:**
- Landing page renders
- Full 5-step check-in completion
- Progress bar advancement
- Dashboard page accessibility
- AI coach page accessibility
- Skip link keyboard navigation
- ARIA landmark presence

---

## ♿ Accessibility

- **WCAG 2.1 AA** target throughout
- Skip-to-content link on every page
- All interactive elements have `aria-label` or semantic labels
- `role="progressbar"` with `aria-valuenow/min/max` on check-in stepper
- `aria-pressed` on toggle-style buttons
- `aria-live="polite"` on toast notification container
- `role="alert"` on error messages
- `fieldset` + `legend` on all option groups
- `role="list"` / `role="listitem"` on challenge lists
- Full keyboard navigation (Tab, Enter, Space)
- Visible focus rings on all interactive elements (2px brand-colored outline)
- `prefers-reduced-motion` respected — all Framer Motion animations disabled

See [`docs/accessibility.md`](docs/accessibility.md) for full audit.

---

## ⚡ Performance

- Dynamic imports for all heavy feature components (`CheckInForm`, `AnalysisCard`, `ProgressDashboard`, `AiCoach`)
- `React.memo` on all pure components (`Button`, `Card`, `Badge`, `ScoreRing`, `Navigation`, etc.)
- `useMemo` for derived state (progress stats, challenge selection, chart data)
- `useCallback` for all event handlers in feature components
- AI responses cached in localStorage (today's analysis reused, not re-fetched)
- Tree-shaken imports from `lucide-react` and `recharts`
- `next/font` with `display: swap` prevents FOIT
- Security headers via `next.config.ts` (no runtime overhead)

See [`docs/performance.md`](docs/performance.md) for full analysis.

---

## 📦 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your keys:
# GEMINI_API_KEY=...
# GROQ_API_KEY=...

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔧 Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm test           # Jest unit tests
npm run test:e2e   # Playwright E2E tests
```

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Set `GEMINI_API_KEY` and `GROQ_API_KEY` in environment variables
4. Deploy

### Docker
```bash
docker build -t carbonwise .
docker run -p 3000:3000 -e GEMINI_API_KEY=... -e GROQ_API_KEY=... carbonwise
```

---

## 🗺️ Future Improvements

- **Offline mode** — Service Worker for full PWA support
- **Annual footprint calculator** — Compare against country averages
- **Social sharing** — Share weekly progress cards
- **Household mode** — Aggregate footprint for multiple users
- **Carbon offsetting links** — Trusted offset provider integrations
- **Persistent storage** — Optional cloud sync with end-to-end encryption

---

## 📄 License

MIT © 2025 CarbonWise. Open-source sustainability tooling.
