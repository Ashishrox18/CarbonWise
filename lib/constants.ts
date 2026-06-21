/**
 * Application-wide constants.
 * Centralising these values eliminates magic numbers throughout the codebase.
 */

// ─── Storage ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  CHECK_INS:    'cw_checkins',
  CHAT:         'cw_chat',
  CHALLENGES:   'cw_challenges',
} as const;

// ─── Carbon Estimation (kg CO₂e per unit) ─────────────────────────
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
export const SCORE_THRESHOLDS = {
  LOW_MAX:    33,
  MEDIUM_MAX: 66,
} as const;

// ─── Rate Limiting ─────────────────────────────────────────────────
export const RATE_LIMIT = {
  WINDOW_MS:       60_000,
  MAX_AI_PER_MIN:  10,
  MAX_CHAT_PER_MIN: 20,
} as const;

// ─── Data Retention ───────────────────────────────────────────────
export const RETENTION = {
  MAX_CHECK_INS: 90,   // ~3 months
  MAX_CHAT_MSGS: 50,
} as const;

// ─── UI ────────────────────────────────────────────────────────────
export const TOAST_DURATION_MS = 3500;

export const CHALLENGE_CO2_SAVINGS: Record<string, number> = {
  reusable_bottle:    0.05,
  walk_15_min:        0.50,
  standby_off:        0.30,
  plant_based_meal:   2.00,
  skip_delivery:      0.80,
  cold_wash:          0.50,
  short_shower:       0.20,
  local_produce:      1.00,
};
