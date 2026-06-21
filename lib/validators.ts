import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────
export const TransportModeSchema = z.enum(['walk', 'cycle', 'bus', 'metro', 'car', 'bike']);
export const MealTypeSchema      = z.enum(['vegetarian', 'mixed', 'chicken', 'beef']);
export const ElectricitySchema   = z.enum(['low', 'medium', 'high']);
export const ShoppingSchema      = z.enum(['none', 'one', 'several']);
export const WasteSchema         = z.enum(['recycled', 'mixed', 'none']);
export const FootprintSchema     = z.enum(['Low', 'Medium', 'High']);
export const EmissionCategorySchema = z.enum([
  'Transportation', 'Food', 'Electricity', 'Shopping', 'Waste',
]);

// ─── Check-In ─────────────────────────────────────────────────────
export const CheckInAnswersSchema = z.object({
  transport:   TransportModeSchema,
  meal:        MealTypeSchema,
  electricity: ElectricitySchema,
  shopping:    ShoppingSchema,
  waste:       WasteSchema,
});

// ─── AI Analysis (Gemini response shape) ─────────────────────────
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
export const CheckInRecordSchema = z.object({
  id:                     z.string().uuid(),
  date:                   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answers:                CheckInAnswersSchema,
  analysis:               CarbonAnalysisSchema,
  completedChallengeIds:  z.array(z.string()),
  co2SavedKg:             z.number().min(0),
});

// ─── Chat ─────────────────────────────────────────────────────────
export const ChatMessageSchema = z.object({
  id:        z.string().uuid(),
  role:      z.enum(['user', 'assistant']),
  content:   z.string().min(1).max(2000),
  timestamp: z.string(),
});

// ─── API Request Schemas ──────────────────────────────────────────
export const AnalyzeRequestSchema = z.object({
  answers: CheckInAnswersSchema,
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(
    z.object({ role: z.enum(['user', 'assistant']), content: z.string() })
  ).max(20),
});

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Safely parses an AI JSON response against the CarbonAnalysisSchema.
 * Returns null on failure instead of throwing.
 */
export function parseCarbonAnalysis(raw: unknown) {
  return CarbonAnalysisSchema.safeParse(raw);
}

/**
 * Strips markdown code fences from AI output before JSON.parse.
 */
export function stripCodeFences(raw: string): string {
  return raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
}
