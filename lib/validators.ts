/**
 * @fileoverview Zod validation schemas for all domain types and API contracts.
 *
 * These schemas serve as the single source of truth for:
 * - API request/response validation
 * - AI output sanitisation
 * - localStorage read validation
 */

import { z } from 'zod';

// ─── Primitive Enums ──────────────────────────────────────────────

/** Valid transport modes for the check-in form. */
export const TransportModeSchema = z.enum(['walk', 'cycle', 'bus', 'metro', 'car', 'bike']);

/** Valid meal types for the check-in form. */
export const MealTypeSchema = z.enum(['vegetarian', 'mixed', 'chicken', 'beef']);

/** Valid electricity usage levels. */
export const ElectricitySchema = z.enum(['low', 'medium', 'high']);

/** Valid shopping levels. */
export const ShoppingSchema = z.enum(['none', 'one', 'several']);

/** Valid waste handling choices. */
export const WasteSchema = z.enum(['recycled', 'mixed', 'none']);

/** Valid footprint level labels. */
export const FootprintSchema = z.enum(['Low', 'Medium', 'High']);

/** Valid emission category names. */
export const EmissionCategorySchema = z.enum([
  'Transportation', 'Food', 'Electricity', 'Shopping', 'Waste',
]);

// ─── Check-In ─────────────────────────────────────────────────────

/** Schema for the 5 daily check-in answers. */
export const CheckInAnswersSchema = z.object({
  transport:   TransportModeSchema,
  meal:        MealTypeSchema,
  electricity: ElectricitySchema,
  shopping:    ShoppingSchema,
  waste:       WasteSchema,
});

// ─── AI Analysis ─────────────────────────────────────────────────

/** Schema for the structured JSON response from Gemini. */
export const CarbonAnalysisSchema = z.object({
  footprint:          FootprintSchema,
  largestContributor: EmissionCategorySchema,
  score:              z.number().int().min(0).max(100),
  summary:            z.string().min(10).max(300),
  topActions:         z.tuple([z.string(), z.string(), z.string()]),
  weeklyGoal:         z.string().min(10).max(200),
  categoryBreakdown:  z.object({
    Transportation: z.number().min(0),
    Food:           z.number().min(0),
    Electricity:    z.number().min(0),
    Shopping:       z.number().min(0),
    Waste:          z.number().min(0),
  }),
});

// ─── Check-In Record ─────────────────────────────────────────────

/** Schema for a complete persisted check-in record. */
export const CheckInRecordSchema = z.object({
  id:                    z.string().uuid(),
  date:                  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answers:               CheckInAnswersSchema,
  analysis:              CarbonAnalysisSchema,
  completedChallengeIds: z.array(z.string()),
  co2SavedKg:            z.number().min(0),
});

// ─── Chat ─────────────────────────────────────────────────────────

/** Schema for a single chat message. */
export const ChatMessageSchema = z.object({
  id:        z.string().uuid(),
  role:      z.enum(['user', 'assistant']),
  content:   z.string().min(1).max(2_000),
  timestamp: z.string(),
});

// ─── API Request Schemas ──────────────────────────────────────────

/** Schema for POST /api/analyze request body. */
export const AnalyzeRequestSchema = z.object({
  answers: CheckInAnswersSchema,
});

/** Schema for POST /api/chat request body. */
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(
    z.object({
      role:    z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).max(20),
});

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Safely parses an AI JSON response against the CarbonAnalysisSchema.
 * Returns a Zod SafeParseReturnType — never throws.
 *
 * @param raw - Unknown value to validate (typically parsed JSON).
 */
export function parseCarbonAnalysis(raw: unknown) {
  return CarbonAnalysisSchema.safeParse(raw);
}

/**
 * Strips markdown code fences from an AI text output before `JSON.parse`.
 * Some models wrap JSON in ```json ... ``` despite being instructed not to.
 *
 * @param raw - Raw text output from the AI.
 * @returns The cleaned string ready for `JSON.parse`.
 */
export function stripCodeFences(raw: string): string {
  return raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
}
