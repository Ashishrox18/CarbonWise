# API Reference

CarbonWise exposes two server-side API routes. Both are Next.js App Router route handlers
located in `app/api/`.

---

## POST /api/analyze

Accepts a user's check-in answers, calls Gemini 1.5 Flash for structured analysis, and
returns a validated `CarbonAnalysis` object.

### Request

```http
POST /api/analyze
Content-Type: application/json
```

```json
{
  "answers": {
    "transport":   "car",
    "meal":        "beef",
    "electricity": "high",
    "shopping":    "none",
    "waste":       "recycled"
  }
}
```

**Field constraints** (validated by Zod):

| Field | Type | Allowed values |
|---|---|---|
| `transport` | string | `walk` `cycle` `bus` `metro` `car` `bike` |
| `meal` | string | `vegetarian` `mixed` `chicken` `beef` |
| `electricity` | string | `low` `medium` `high` |
| `shopping` | string | `none` `one` `several` |
| `waste` | string | `recycled` `mixed` `none` |

### Response — 200 OK

```json
{
  "analysis": {
    "footprint": "High",
    "largestContributor": "Food",
    "score": 82,
    "summary": "Your food choices are the main driver of today's footprint...",
    "topActions": ["...", "...", "..."],
    "weeklyGoal": "...",
    "categoryBreakdown": {
      "Transportation": 4.6,
      "Food": 9.0,
      "Electricity": 3.0,
      "Shopping": 0,
      "Waste": 0.2
    }
  },
  "provider": "gemini",
  "fallback": false
}
```

When `fallback: true`, `provider` will be `"local"` — this means Gemini was unavailable
and the local carbon estimator was used instead.

### Error Responses

| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "Invalid JSON body." }` | Malformed request body |
| 422 | `{ "error": "Invalid request data.", "details": {...} }` | Zod validation failure |
| 429 | `{ "error": "Too many requests. Please wait a moment." }` | Rate limit exceeded (10 req/min) |

---

## POST /api/chat

Proxies a chat message to Groq Llama 3.1 8B Instant for the AI Coach feature.

### Request

```http
POST /api/chat
Content-Type: application/json
```

```json
{
  "message": "How can I reduce my food emissions?",
  "history": [
    { "role": "user",      "content": "Hi!" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ]
}
```

**Field constraints**:

| Field | Constraint |
|---|---|
| `message` | 1–500 characters |
| `history` | Array of `{ role, content }` objects, max 20 items |

### Response — 200 OK

```json
{
  "response": "The biggest food-related emission reducers are..."
}
```

### Error Responses

| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "Invalid JSON body." }` | Malformed request body |
| 422 | `{ "error": "Invalid request." }` | Zod validation failure |
| 429 | `{ "error": "Too many messages. Please wait a moment." }` | Rate limit exceeded (20 req/min) OR Groq rate-limited |
| 503 | `{ "error": "Could not reach the AI coach right now." }` | Groq API unavailable |

---

## Rate Limiting

Both routes use an in-memory sliding-window rate limiter keyed by IP address.

| Route | Limit |
|---|---|
| `/api/analyze` | 10 requests per minute |
| `/api/chat` | 20 requests per minute |

See `services/rateLimiter.ts` for implementation details and upgrade guidance.

---

## Security

- API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`) are read server-side only and never
  included in any response.
- All inputs are Zod-validated before any processing occurs.
- All AI outputs are Zod-validated before being returned to the client.
- See [`docs/security.md`](security.md) for the full threat model.
