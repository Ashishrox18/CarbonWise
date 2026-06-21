/**
 * @fileoverview Local carbon footprint estimator.
 *
 * Provides fast, deterministic CO₂e estimates from check-in answers
 * without requiring an AI call. Used as the fallback and for pre-filling
 * the Gemini prompt with accurate numbers.
 */

import type { CheckInAnswers, EmissionCategory } from '@/types';
import { CARBON_FACTORS, SCORE_THRESHOLDS, MAX_DAILY_KG_CO2E } from './constants';

/** Result of a local carbon footprint estimate. */
export interface LocalEstimate {
  /** Total kg CO₂e across all categories. */
  totalKg: number;
  /** Per-category kg CO₂e values. */
  breakdown: Record<EmissionCategory, number>;
  /** Normalised score from 0 (best) to 100 (worst). */
  score: number;
  /** Human-readable footprint level derived from the score. */
  level: 'Low' | 'Medium' | 'High';
}

/**
 * Estimates daily CO₂e emissions from check-in answers.
 *
 * Score is normalised against `MAX_DAILY_KG_CO2E` (25 kg) so that an
 * extremely high-emission day reaches ~100 and a zero-emission day is 0.
 *
 * @param answers - The user's completed check-in form.
 * @returns A structured estimate with category breakdown and normalised score.
 */
export function estimateFootprint(answers: CheckInAnswers): LocalEstimate {
  const breakdown: Record<EmissionCategory, number> = {
    Transportation: CARBON_FACTORS.transport[answers.transport],
    Food:           CARBON_FACTORS.meal[answers.meal],
    Electricity:    CARBON_FACTORS.electricity[answers.electricity],
    Shopping:       CARBON_FACTORS.shopping[answers.shopping],
    Waste:          CARBON_FACTORS.waste[answers.waste],
  };

  const totalKg = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  const score   = Math.min(100, Math.round((totalKg / MAX_DAILY_KG_CO2E) * 100));

  const level: LocalEstimate['level'] =
    score <= SCORE_THRESHOLDS.LOW_MAX    ? 'Low'    :
    score <= SCORE_THRESHOLDS.MEDIUM_MAX ? 'Medium' :
    'High';

  return { totalKg, breakdown, score, level };
}

/**
 * Returns the emission category with the highest kg CO₂e value.
 *
 * @param breakdown - Per-category emission values from `estimateFootprint`.
 * @returns The category responsible for the largest share of today's footprint.
 */
export function getLargestContributor(
  breakdown: Record<EmissionCategory, number>
): EmissionCategory {
  return (Object.entries(breakdown) as [EmissionCategory, number][])
    .sort(([, a], [, b]) => b - a)[0][0];
}
