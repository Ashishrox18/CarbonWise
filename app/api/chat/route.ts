/**
 * POST /api/chat
 *
 * Proxies user messages to Groq Llama 3.1 for the AI Coach feature.
 *
 * Security:
 * - API key is read server-side only — never sent to the client
 * - Input is length-bounded and validated with Zod before processing
 * - Rate limited per IP address (20 req/min)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/lib/validators';
import { chatWithGroq } from '@/services/groq';
import { checkRateLimit } from '@/services/rateLimiter';
import { RATE_LIMIT } from '@/lib/constants';

/**
 * Handles POST /api/chat.
 *
 * @param req - Incoming Next.js request.
 * @returns JSON response with `{ response }` on success or `{ error }` on failure.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Rate limiting ────────────────────────────────────────────────
  const ip      = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
  const allowed = checkRateLimit(`chat:${ip}`, RATE_LIMIT.MAX_CHAT_PER_MIN);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait a moment.' },
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

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { message, history } = parsed.data;

  // ── AI Response ──────────────────────────────────────────────────
  try {
    const response = await chatWithGroq(message, history);
    return NextResponse.json({ response });
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Unknown error';

    if (errMessage === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'AI is busy right now. Please try again in a moment.' },
        { status: 429 }
      );
    }

    console.error('[/api/chat] Groq error:', errMessage);
    return NextResponse.json(
      { error: 'Could not reach the AI coach right now. Please try again.' },
      { status: 503 }
    );
  }
}
