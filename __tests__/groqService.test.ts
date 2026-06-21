/**
 * @fileoverview Unit tests for services/groq.ts
 *
 * Coverage targets:
 * - Missing API key
 * - HTTP 429 rate-limited response
 * - Non-200 HTTP error
 * - Empty response body
 * - Successful response
 * - Network failure
 */

import { chatWithGroq } from '@/services/groq';
import type { ChatTurn } from '@/services/groq';

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  jest.restoreAllMocks();
});

afterAll(() => {
  process.env = originalEnv;
});

describe('chatWithGroq', () => {
  const history: ChatTurn[] = [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' },
  ];

  it('throws if GROQ_API_KEY is not set', async () => {
    delete process.env.GROQ_API_KEY;
    await expect(chatWithGroq('test', [])).rejects.toThrow('GROQ_API_KEY is not configured');
  });

  it('throws RATE_LIMITED on HTTP 429', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    await expect(chatWithGroq('test', [])).rejects.toThrow('RATE_LIMITED');
  });

  it('throws on non-429 HTTP error', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(chatWithGroq('test', [])).rejects.toThrow('Groq API error: 503');
  });

  it('throws when choices array is empty', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({ choices: [] }),
    });
    await expect(chatWithGroq('test', [])).rejects.toThrow('empty response');
  });

  it('throws when content is missing from response', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({ choices: [{ message: {} }] }),
    });
    await expect(chatWithGroq('test', [])).rejects.toThrow('empty response');
  });

  it('returns trimmed content on success', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({
        choices: [{ message: { content: '  Great question!  ' } }],
      }),
    });
    const result = await chatWithGroq('How do I reduce emissions?', []);
    expect(result).toBe('Great question!');
  });

  it('sends history truncated to last 10 turns', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    let capturedBody: { messages: unknown[] } | undefined;
    global.fetch = jest.fn().mockImplementation((_url: string, opts: RequestInit) => {
      capturedBody = JSON.parse(opts.body as string);
      return Promise.resolve({
        ok:   true,
        json: async () => ({ choices: [{ message: { content: 'OK' } }] }),
      });
    });

    const longHistory: ChatTurn[] = Array.from({ length: 15 }, (_, i) => ({
      role:    i % 2 === 0 ? 'user' : 'assistant',
      content: `message ${i}`,
    }));

    await chatWithGroq('final message', longHistory);
    // system prompt + last 10 history turns + 1 user message = 12
    expect(capturedBody?.messages.length).toBe(12);
  });

  it('sends history when provided', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({ choices: [{ message: { content: 'Response' } }] }),
    });
    const result = await chatWithGroq('Tell me more', history);
    expect(result).toBe('Response');
  });

  it('throws on network failure', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    global.fetch = jest.fn().mockRejectedValue(new Error('fetch failed'));
    await expect(chatWithGroq('test', [])).rejects.toThrow();
  });
});
