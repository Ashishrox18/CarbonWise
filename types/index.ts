/**
 * @fileoverview CarbonWise core domain types.
 *
 * All types are derived from or mirrored by the Zod schemas in `lib/validators.ts`.
 * If you modify a type here, update the corresponding schema too — and vice versa.
 */

// ─── Check-In Primitives ──────────────────────────────────────────

/** Transport mode chosen during check-in. */
export type TransportMode = 'walk' | 'cycle' | 'bus' | 'metro' | 'car' | 'bike';

/** Meal type chosen during check-in. */
export type MealType = 'vegetarian' | 'mixed' | 'chicken' | 'beef';

/** Electricity usage level. */
export type ElectricityUsage = 'low' | 'medium' | 'high';

/** Shopping activity level. */
export type ShoppingLevel = 'none' | 'one' | 'several';

/** Waste handling method. */
export type WasteHandling = 'recycled' | 'mixed' | 'none';

/** Emission category name. Matches the keys in `CarbonAnalysis.categoryBreakdown`. */
export type EmissionCategory =
  | 'Transportation'
  | 'Food'
  | 'Electricity'
  | 'Shopping'
  | 'Waste';

/** Human-readable footprint level label derived from the carbon score. */
export type FootprintLevel = 'Low' | 'Medium' | 'High';

// ─── Check-In ─────────────────────────────────────────────────────

/** Raw answers submitted via the 5-step daily check-in form. */
export interface CheckInAnswers {
  transport:   TransportMode;
  meal:        MealType;
  electricity: ElectricityUsage;
  shopping:    ShoppingLevel;
  waste:       WasteHandling;
}

// ─── AI Analysis ──────────────────────────────────────────────────

/**
 * Structured analysis returned by Gemini (or the local fallback).
 * Validated against `CarbonAnalysisSchema` before use.
 */
export interface CarbonAnalysis {
  /** Overall footprint classification. */
  footprint: FootprintLevel;
  /** The emission category contributing the most CO₂e today. */
  largestContributor: EmissionCategory;
  /** Normalised score 0–100 where 100 is the worst possible day. */
  score: number;
  /** 1–2 sentence human-readable summary of today's impact. */
  summary: string;
  /** Exactly three personalised action tips. */
  topActions: [string, string, string];
  /** One achievable weekly improvement goal. */
  weeklyGoal: string;
  /** Per-category kg CO₂e values. */
  categoryBreakdown: Record<EmissionCategory, number>;
}

// ─── Check-In Record ──────────────────────────────────────────────

/**
 * A complete daily check-in as stored in localStorage.
 * Validated against `CheckInRecordSchema` on every save.
 */
export interface CheckInRecord {
  /** UUID v4 identifier. */
  id: string;
  /** ISO date string in `YYYY-MM-DD` format. */
  date: string;
  /** The user's raw answers. */
  answers: CheckInAnswers;
  /** The AI (or fallback) analysis result. */
  analysis: CarbonAnalysis;
  /** IDs of eco challenges the user has completed today. */
  completedChallengeIds: string[];
  /** Total kg CO₂e saved via completed challenges. */
  co2SavedKg: number;
}

// ─── Challenges ───────────────────────────────────────────────────

/** A single eco challenge surfaced on the dashboard and results page. */
export interface EcoChallenge {
  /** Unique challenge identifier (used as the React key). */
  id: string;
  /** Short display title. */
  title: string;
  /** One-sentence description of the challenge. */
  description: string;
  /** The emission category this challenge targets. */
  category: EmissionCategory;
  /** Estimated kg CO₂e saved by completing this challenge. */
  co2SavedKg: number;
  /** Emoji icon displayed alongside the challenge. */
  icon: string;
}

// ─── Chat ─────────────────────────────────────────────────────────

/** Role of a participant in the AI Coach conversation. */
export type ChatRole = 'user' | 'assistant';

/** A single message in the AI Coach chat history. */
export interface ChatMessage {
  /** UUID v4 identifier. */
  id: string;
  /** Participant role. */
  role: ChatRole;
  /** Message text content. */
  content: string;
  /** ISO 8601 timestamp string. */
  timestamp: string;
}

// ─── Progress / Dashboard ─────────────────────────────────────────

/** Aggregated statistics displayed on the progress dashboard. */
export interface ProgressStats {
  /** Total kg CO₂e saved across all completed challenges. */
  totalCo2SavedKg: number;
  /** Number of consecutive days with a check-in (ending today). */
  currentStreak: number;
  /** Total number of eco challenges completed across all check-ins. */
  completedChallenges: number;
  /** Average carbon score across all check-ins (rounded). */
  averageScore: number;
  /** Score data for the most recent 7 days, oldest first. */
  weeklyScores: Array<{ date: string; score: number }>;
}
