/**
 * POST /api/analyze
 *
 * Accepts check-in answers, calls Gemini for structured analysis,
 * and returns a validated CarbonAnalysis JSON object.
 *
 * Security:
 * - API key is server-only (never sent to client)
 * - All inputs validated with Zod before processing
 * - Rate limited per IP (10 req/min)
 * - Falls back to local estimator on AI failure
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/validators';
import { analyzeWithGemini, buildFallbackAnalysis } from '@/services/gemini';
import { checkRateLimit } from '@/services/rateLimiter';
import { RATE_LIMIT } from '@/lib/constants';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Rate limiting ────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
  const allowed = checkRateLimit(`analyze:${ip}`, RATE_LIMIT.MAX_AI_PER_MIN);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  // ── Input validation ─────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data.', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { answers } = parsed.data;

  // ── AI Analysis (with fallback) ──────────────────────────────────
  try {
    const analysis = await analyzeWithGemini(answers);
    return NextResponse.json({ analysis, provider: 'gemini', fallback: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/analyze] Gemini failed, using fallback:', message);

    const fallback = buildFallbackAnalysis(answers);
    return NextResponse.json({ analysis: fallback, provider: 'local', fallback: true });
  }
}
