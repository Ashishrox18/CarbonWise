# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Yes    |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

To report a vulnerability, email: **security@carbonwise.app** (or open a private GitHub Security Advisory).

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You will receive an acknowledgement within **48 hours** and a status update within **7 days**.

We follow [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure): once a fix is released, we will publicly credit the reporter (unless you prefer to remain anonymous).

---

## Security Architecture

### API Key Protection

All AI API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`) are:
- Stored in `.env.local` — never committed to version control
- Read server-side only via `process.env`
- Never prefixed with `NEXT_PUBLIC_` — they never reach the client bundle

### Input Validation

Every API route validates all inputs with [Zod](https://zod.dev) before processing:

```typescript
const parsed = AnalyzeRequestSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: 'Invalid request.' }, { status: 422 });
}
```

### AI Output Validation

Every AI response is re-validated through Zod before being stored or returned to the client. Invalid AI output triggers the local fallback — it is never passed through raw.

### Rate Limiting

All AI endpoints use an in-memory sliding-window rate limiter per IP address:
- `/api/analyze`: 10 requests/minute
- `/api/chat`: 20 requests/minute

### Security Headers

Configured in `next.config.mjs` for all routes:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### Data Privacy

- **No server-side storage** — all user data is stored in `localStorage` in the user's own browser
- No analytics, tracking, or telemetry
- No PII is ever sent to or stored on any server

---

## Dependency Policy

- Dependencies are pinned to exact or patch-level ranges in `package.json`
- Dependabot is configured to open PRs for security updates automatically
- Run `npm audit` before any release
