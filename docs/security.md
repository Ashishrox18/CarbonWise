# Security

## Threat Model

| Threat | Mitigation |
|---|---|
| API key exposure | Keys in `process.env` only, server-side routes only, never in client bundle |
| Prompt injection | Input length-bounded by Zod (500 chars), AI response re-validated by Zod |
| Rate abuse | Sliding window rate limiter per IP on all AI endpoints |
| XSS | React's built-in escaping + `X-XSS-Protection` header |
| Clickjacking | `X-Frame-Options: DENY` header |
| MIME sniffing | `X-Content-Type-Options: nosniff` header |
| Data breach | No server-side storage — all data stays in user's browser |

## API Key Protection

```typescript
// ✅ CORRECT — server-side only
const apiKey = process.env.GEMINI_API_KEY;

// ❌ NEVER — would expose key in client bundle
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
```

## Input Validation

Every API route validates inputs before processing:

```typescript
const parsed = AnalyzeRequestSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: 'Invalid.' }, { status: 422 });
```

## AI Output Validation

Every AI response is parsed through Zod before use:

```typescript
const result = parseCarbonAnalysis(parsed);
if (!result.success) throw new Error('AI response validation failed');
```
