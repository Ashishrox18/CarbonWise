/**
 * @fileoverview Server-side Groq API service (Llama 3.1 8B Instant).
 *
 * Provides the AI Coach chat functionality.
 * Runs exclusively in Next.js API routes — the API key never reaches the browser.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are CarbonWise Coach, a friendly and knowledgeable sustainability assistant.

Your role:
- Help users understand and reduce their carbon footprint
- Answer questions about climate impact, sustainable living, and eco-friendly choices
- Provide simple, actionable, non-judgmental guidance
- Be encouraging and positive — celebrate small wins

Rules:
- Keep responses concise (under 150 words)
- Always be practical and specific
- Never be preachy or guilt-inducing
- If you don't know something, say so honestly
- Focus on what individuals CAN do, not what they've done wrong`;

/** A single turn in the conversation history sent to Groq. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Shape of the raw Groq API response (OpenAI-compatible). */
interface GroqApiResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
}

/**
 * Sends a chat message to Groq Llama 3.1 8B and returns the assistant's response.
 *
 * @param message - The user's latest message.
 * @param history - Previous conversation turns for context (at most 10 are sent).
 * @returns The assistant's response text.
 * @throws {Error} If `GROQ_API_KEY` is missing, the request fails, or the response is empty.
 */
export async function chatWithGroq(message: string, history: ChatTurn[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  const response = await fetch(GROQ_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       'llama-3.1-8b-instant',
      messages,
      max_tokens:  256,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('RATE_LIMITED');
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json() as GroqApiResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned empty response');

  return content.trim();
}
