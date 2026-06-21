// ─────────────────────────────────────────────────────────────────
// CarbonWise — Core Domain Types
// ─────────────────────────────────────────────────────────────────

/** Transport mode chosen during check-in */
export type TransportMode = 'walk' | 'cycle' | 'bus' | 'metro' | 'car' | 'bike';

/** Meal type chosen during check-in */
export type MealType = 'vegetarian' | 'mixed' | 'chicken' | 'beef';

/** Electricity usage level */
export type ElectricityUsage = 'low' | 'medium' | 'high';

/** Shopping level */
export type ShoppingLevel = 'none' | 'one' | 'several';

/** Waste handling */
export type WasteHandling = 'recycled' | 'mixed' | 'none';

/** Emission category enum */
export type EmissionCategory =
  | 'Transportation'
  | 'Food'
  | 'Electricity'
  | 'Shopping'
  | 'Waste';

/** Footprint level label */
export type FootprintLevel = 'Low' | 'Medium' | 'High';

// ─── Check-In ─────────────────────────────────────────────────────

/** Raw answers from the daily carbon check-in form */
export interface CheckInAnswers {
  transport: TransportMode;
  meal: MealType;
  electricity: ElectricityUsage;
  shopping: ShoppingLevel;
  waste: WasteHandling;
}

// ─── AI Analysis ──────────────────────────────────────────────────

/** Structured analysis returned by Gemini (validated by Zod) */
export interface CarbonAnalysis {
  footprint: FootprintLevel;
  largestContributor: EmissionCategory;
  score: number;           // 0–100 (higher = more carbon)
  summary: string;
  topActions: [string, string, string];
  weeklyGoal: string;
  categoryBreakdown: Record<EmissionCategory, number>; // kg CO₂e each
}

// ─── Check-In Record ──────────────────────────────────────────────

/** A complete daily check-in stored in localStorage */
export interface CheckInRecord {
  id: string;
  date: string;            // ISO YYYY-MM-DD
  answers: CheckInAnswers;
  analysis: CarbonAnalysis;
  completedChallengeIds: string[];
  co2SavedKg: number;
}

// ─── Challenges ───────────────────────────────────────────────────

/** A single eco challenge */
export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  category: EmissionCategory;
  co2SavedKg: number;
  icon: string;
}

// ─── Chat ─────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

// ─── Progress / Dashboard ─────────────────────────────────────────

/** Aggregated stats shown on the dashboard */
export interface ProgressStats {
  totalCo2SavedKg: number;
  currentStreak: number;
  completedChallenges: number;
  averageScore: number;
  weeklyScores: Array<{ date: string; score: number }>;
}
