/**
 * @fileoverview Unit tests for services/gemini.ts
 *
 * Coverage targets:
 * - buildFallbackAnalysis: all answer combinations
 * - analyzeWithGemini: missing API key, network error, invalid JSON,
 *   Zod validation failure, rate-limited response, successful response
 */

import { buildFallbackAnalysis, analyzeWithGemini } from '@/services/gemini';
import type { CheckInAnswers } from '@/types';

// ─── Fixtures ─────────────────────────────────────────────────────

const HIGH_ANSWERS: CheckInAnswers = {
  transport:   'car',
  meal:        'beef',
  electricity: 'high',
  shopping:    'several',
  waste:       'none',
};

const LOW_ANSWERS: CheckInAnswers = {
  transport:   'walk',
  meal:        'vegetarian',
  electricity: 'low',
  shopping:    'none',
  waste:       'recycled',
};

// ─── buildFallbackAnalysis ────────────────────────────────────────

describe('buildFallbackAnalysis', () => {
  it('returns a valid CarbonAnalysis shape for high-impact answers', () => {
    const result = buildFallbackAnalysis(HIGH_ANSWERS);
    expect(result.footprint).toMatch(/Low|Medium|High/);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.topActions).toHaveLength(3);
    expect(result.summary.length).toBeGreaterThan(10);
    expect(result.weeklyGoal.length).toBeGreaterThan(10);
  });

  it('identifies Food as largest contributor for beef + walk', () => {
    expect(buildFallbackAnalysis(HIGH_ANSWERS).largestContributor).toBe('Food');
  });

  it('returns categoryBreakdown with all five categories', () => {
    const breakdown = buildFallbackAnalysis(HIGH_ANSWERS).categoryBreakdown;
    expect(Object.keys(breakdown)).toEqual(
      expect.arrayContaining(['Transportation', 'Food', 'Electricity', 'Shopping', 'Waste'])
    );
  });

  it('returns Low footprint for fully sustainable choices', () => {
    const result = buildFallbackAnalysis(LOW_ANSWERS);
    expect(result.footprint).toBe('Low');
    expect(result.score).toBeLessThanOrEqual(33);
  });

  it('returns High footprint for worst-case choices', () => {
    const result = buildFallbackAnalysis(HIGH_ANSWERS);
    expect(result.footprint).toBe('High');
  });

  it('summary mentions the largest contributor', () => {
    const result = buildFallbackAnalysis(HIGH_ANSWERS);
    // Summary should reference the largest category in lowercase
    expect(result.summary.toLowerCase()).toContain('food');
  });

  it('weeklyGoal mentions the largest contributor', () => {
    const result = buildFallbackAnalysis(HIGH_ANSWERS);
    expect(result.weeklyGoal.toLowerCase()).toContain('food');
  });

  it('all topActions are non-empty strings', () => {
    buildFallbackAnalysis(HIGH_ANSWERS).topActions.forEach(action => {
      expect(typeof action).toBe('string');
      expect(action.length).toBeGreaterThan(0);
    });
  });

  it('works for every transport mode without throwing', () => {
    const modes = ['walk', 'cycle', 'bus', 'metro', 'car', 'bike'] as const;
    modes.forEach(transport => {
      expect(() => buildFallbackAnalysis({ ...LOW_ANSWERS, transport })).not.toThrow();
    });
  });

  it('works for every meal type without throwing', () => {
    const meals = ['vegetarian', 'mixed', 'chicken', 'beef'] as const;
    meals.forEach(meal => {
      expect(() => buildFallbackAnalysis({ ...LOW_ANSWERS, meal })).not.toThrow();
    });
  });

  it('categoryBreakdown values are all non-negative', () => {
    const result = buildFallbackAnalysis(HIGH_ANSWERS);
    Object.values(result.categoryBreakdown).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });
});

// ─── analyzeWithGemini ────────────────────────────────────────────

describe('analyzeWithGemini', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('throws if GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(analyzeWithGemini(LOW_ANSWERS)).rejects.toThrow('GEMINI_API_KEY is not configured');
  });

  it('throws RATE_LIMITED on HTTP 429', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    await expect(analyzeWithGemini(LOW_ANSWERS)).rejects.toThrow('RATE_LIMITED');
  });

  it('throws on non-429 HTTP error', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(analyzeWithGemini(LOW_ANSWERS)).rejects.toThrow('Gemini API error: 500');
  });

  it('throws on invalid JSON response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'not-json{{' }] } }],
      }),
    });
    await expect(analyzeWithGemini(LOW_ANSWERS)).rejects.toThrow('invalid JSON');
  });

  it('throws on Zod validation failure for valid JSON but wrong shape', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"score": 999}' }] } }],
      }),
    });
    await expect(analyzeWithGemini(LOW_ANSWERS)).rejects.toThrow('validation failed');
  });

  it('returns validated analysis on a successful response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const validAnalysis = {
      footprint:          'Low',
      largestContributor: 'Food',
      score:              10,
      summary:            'Great eco-friendly choices today.',
      topActions:         ['Action one here', 'Action two here', 'Action three here'],
      weeklyGoal:         'Keep making plant-based food choices.',
      categoryBreakdown:  {
        Transportation: 0,
        Food:           1.5,
        Electricity:    0.5,
        Shopping:       0,
        Waste:          0.2,
      },
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify(validAnalysis) }] } }],
      }),
    });
    const result = await analyzeWithGemini(LOW_ANSWERS);
    expect(result.score).toBe(10);
    expect(result.footprint).toBe('Low');
  });

  it('handles JSON wrapped in code fences', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const validAnalysis = {
      footprint:          'Low',
      largestContributor: 'Food',
      score:              10,
      summary:            'Great eco-friendly choices today.',
      topActions:         ['Action one here', 'Action two here', 'Action three here'],
      weeklyGoal:         'Keep making plant-based food choices.',
      categoryBreakdown:  {
        Transportation: 0,
        Food:           1.5,
        Electricity:    0.5,
        Shopping:       0,
        Waste:          0.2,
      },
    };
    const fenced = `\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``;
    global.fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: fenced }] } }],
      }),
    });
    const result = await analyzeWithGemini(LOW_ANSWERS);
    expect(result.score).toBe(10);
  });

  it('throws on network failure', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    await expect(analyzeWithGemini(LOW_ANSWERS)).rejects.toThrow();
  });
});
