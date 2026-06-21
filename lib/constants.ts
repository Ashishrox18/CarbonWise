/**
 * @fileoverview Application-wide constants.
 *
 * Centralising these values eliminates magic numbers throughout the codebase.
 * All constants are `as const` to enable strict literal type inference.
 */

// ─── Storage Keys ──────────────────────────────────────────────────
/** localStorage keys used across the application. */
export const STORAGE_KEYS = {
  CHECK_INS:  'cw_checkins',
  CHAT:       'cw_chat',
  CHALLENGES: 'cw_challenges',
} as const;

// ─── Carbon Estimation (kg CO₂e per unit) ─────────────────────────
/** Emission factors per transport mode, meal type, etc. */
export const CARBON_FACTORS = {
  transport: {
    walk:   0,
    cycle:  0,
    bus:    1.5,
    metro:  0.8,
    car:    4.6,
    bike:   0.1,
  },
  meal: {
    vegetarian: 1.5,
    mixed:      3.0,
    chicken:    4.5,
    beef:       9.0,
  },
  electricity: {
    low:    0.5,
    medium: 1.5,
    high:   3.0,
  },
  shopping: {
    none:    0,
    one:     3.0,
    several: 7.0,
  },
  waste: {
    recycled: 0.2,
    mixed:    0.8,
    none:     1.5,
  },
} as const;

// ─── Score Thresholds ──────────────────────────────────────────────
/** Boundary values used to classify footprint levels. */
export const SCORE_THRESHOLDS = {
  LOW_MAX:    33,
  MEDIUM_MAX: 66,
} as const;

// ─── Rate Limiting ─────────────────────────────────────────────────
/** Sliding-window rate limit settings for AI API routes. */
export const RATE_LIMIT = {
  WINDOW_MS:        60_000,
  MAX_AI_PER_MIN:   10,
  MAX_CHAT_PER_MIN: 20,
} as const;

// ─── Data Retention ───────────────────────────────────────────────
/** Maximum record counts persisted in localStorage. */
export const RETENTION = {
  MAX_CHECK_INS: 90, // ~3 months of daily check-ins
  MAX_CHAT_MSGS: 50,
} as const;

// ─── UI ────────────────────────────────────────────────────────────
/** Duration (ms) before a toast auto-dismisses. */
export const TOAST_DURATION_MS = 3_500;

/**
 * CO₂ savings in kg for each available eco challenge.
 * Keyed by challenge ID to allow O(1) lookup.
 */
export const CHALLENGE_CO2_SAVINGS: Readonly<Record<string, number>> = {
  reusable_bottle:  0.05,
  walk_15_min:      0.50,
  standby_off:      0.30,
  plant_based_meal: 2.00,
  skip_delivery:    0.80,
  cold_wash:        0.50,
  short_shower:     0.20,
  local_produce:    1.00,
};

/** Maximum realistic daily CO₂e (kg) used for score normalisation. */
export const MAX_DAILY_KG_CO2E = 25;
