/**
 * @fileoverview Server-side Gemini API service.
 *
 * Runs exclusively in Next.js API routes — the API key is never sent to the browser.
 *
 * Responsibilities:
 * - Build a structured, pre-seeded prompt for Gemini 1.5 Flash
 * - Call the Gemini REST API with a 10-second timeout
 * - Validate the response with Zod before returning
 * - Expose `buildFallbackAnalysis` for use when Gemini is unavailable
 */

import type { CheckInAnswers, CarbonAnalysis, EmissionCategory } from '@/types';
import { parseCarbonAnalysis, stripCodeFences } from '@/lib/validators';
import { estimateFootprint, getLargestContributor } from '@/lib/carbonEstimator';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/** Action suggestions keyed by emission category, used in the fallback path. */
const FALLBACK_ACTIONS: Record<EmissionCategory, string> = {
  Transportation: 'Try public transport or cycling for your next commute.',
  Food:           'Swap one meat meal for a plant-based alternative.',
  Electricity:    'Turn off standby devices and switch to LED bulbs.',
  Shopping:       'Consider buying second-hand or delaying non-essential purchases.',
  Waste:          'Sort your recycling carefully and reduce single-use plastics.',
};

/**
 * Builds a structured, constrained prompt for Gemini.
 * The local estimate is injected so the model returns accurate numbers
 * rather than hallucinating values.
 *
 * @param answers - The user's check-in answers.
 * @returns A prompt string that instructs Gemini to return a strict JSON object.
 */
function buildPrompt(answers: CheckInAnswers): string {
  const estimate = estimateFootprint(answers);
  const largest  = getLargestContributor(estimate.breakdown);

  return `You are a carbon footprint analyst. Analyze this person's daily habits and return ONLY a valid JSON object — no markdown, no explanation, no prose.

Daily habits:
- Transport: ${answers.transport}
- Meal: ${answers.meal}
- Electricity usage: ${answers.electricity}
- Shopping: ${answers.shopping}
- Waste handling: ${answers.waste}

Pre-calculated estimates (kg CO₂e):
${JSON.stringify(estimate.breakdown, null, 2)}
Largest contributor: ${largest}
Total: ${estimate.totalKg.toFixed(2)} kg CO₂e
Score (0-100 where 100 = worst): ${estimate.score}

Return this exact JSON structure with real values (no placeholders):
{
  "footprint": "${estimate.level}",
  "largestContributor": "${largest}",
  "score": ${estimate.score},
  "summary": "<1-2 sentence insight about today's impact, specific to their habits>",
  "topActions": [
    "<specific actionable tip for ${largest}>",
    "<specific actionable tip for their second biggest category>",
    "<a general sustainable living tip>"
  ],
  "weeklyGoal": "<one specific, achievable weekly improvement goal>",
  "categoryBreakdown": ${JSON.stringify(estimate.breakdown)}
}`;
}

/** Shape of the raw response from the Gemini REST API. */
interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

/**
 * Calls Gemini 1.5 Flash to generate a structured carbon analysis.
 *
 * @param answers - The user's check-in answers.
 * @returns A Zod-validated {@link CarbonAnalysis} object.
 * @throws {Error} If `GEMINI_API_KEY` is missing, the request fails, or the response is invalid.
 */
export async function analyzeWithGemini(answers: CheckInAnswers): Promise<CarbonAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(answers) }] }],
      generationConfig: {
        temperature:      0.2,
        maxOutputTokens:  512,
        responseMimeType: 'application/json',
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('RATE_LIMITED');
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json() as GeminiApiResponse;
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = stripCodeFences(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned invalid JSON');
  }

  const result = parseCarbonAnalysis(parsed);
  if (!result.success) {
    throw new Error(`Gemini response validation failed: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Builds a local fallback analysis from the deterministic estimator.
 * Used when Gemini is unavailable or rate-limited — guarantees the user
 * always sees a result.
 *
 * @param answers - The user's check-in answers.
 * @returns A fully-formed {@link CarbonAnalysis} derived from local estimates.
 */
export function buildFallbackAnalysis(answers: CheckInAnswers): CarbonAnalysis {
  const estimate = estimateFootprint(answers);
  const largest  = getLargestContributor(estimate.breakdown);
  const largestKg = estimate.breakdown[largest];
  const largestPct = Math.round((largestKg / Math.max(estimate.totalKg, 0.1)) * 100);

  return {
    footprint:          estimate.level,
    largestContributor: largest,
    score:              estimate.score,
    summary: `Your ${largest.toLowerCase()} habits are your biggest carbon contributor today, accounting for roughly ${largestPct}% of your footprint.`,
    topActions: [
      FALLBACK_ACTIONS[largest],
      'Turn off standby devices and shorten your shower by 2 minutes.',
      "Plan tomorrow's meals to include at least one plant-based option.",
    ],
    weeklyGoal: `Reduce your ${largest.toLowerCase()} footprint by making one small change each day this week.`,
    categoryBreakdown: estimate.breakdown,
  };
}
