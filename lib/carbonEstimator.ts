/**
 * @fileoverview Local carbon footprint estimator.
 *
 * Provides fast, deterministic CO₂e estimates from check-in answers
 * without requiring an AI call. Used as the fallback and for pre-filling
 * the Gemini prompt with accurate numbers.
 */

import { CheckInAnswers, EmissionCategory } from '@/types';
import { CARBON_FACTORS, SCORE_THRESHOLDS } from './constants';

export interface LocalEstimate {
  totalKg: number;
  breakdown: Record<EmissionCategory, number>;
  score: number;
  level: 'Low' | 'Medium' | 'High';
}

/**
 * Estimates daily CO₂e emissions from check-in answers.
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

  // Normalise: max realistic daily total ≈ 25 kg CO₂e → score 0–100
  const score = Math.min(100, Math.round((totalKg / 25) * 100));

  const level: 'Low' | 'Medium' | 'High' =
    score <= SCORE_THRESHOLDS.LOW_MAX    ? 'Low'    :
    score <= SCORE_THRESHOLDS.MEDIUM_MAX ? 'Medium' :
    'High';

  return { totalKg, breakdown, score, level };
}

/**
 * Returns the emission category with the highest kg CO₂e value.
 */
export function getLargestContributor(
  breakdown: Record<EmissionCategory, number>
): EmissionCategory {
  return (Object.entries(breakdown) as [EmissionCategory, number][])
    .sort(([, a], [, b]) => b - a)[0][0];
}
