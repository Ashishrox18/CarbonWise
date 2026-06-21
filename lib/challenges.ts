/**
 * @fileoverview Daily eco challenge definitions and selection logic.
 */

import type { EcoChallenge, EmissionCategory } from '@/types';
import { CHALLENGE_CO2_SAVINGS } from './constants';

/** All available eco challenges across every emission category. */
export const ALL_CHALLENGES: EcoChallenge[] = [
  {
    id:          'reusable_bottle',
    title:       'Bring a Reusable Bottle',
    description: 'Skip single-use plastic today by carrying your own bottle.',
    category:    'Waste',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.reusable_bottle,
    icon:        '🫙',
  },
  {
    id:          'walk_15_min',
    title:       'Walk for 15 Minutes',
    description: 'Replace a short car or ride-share trip with a walk.',
    category:    'Transportation',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.walk_15_min,
    icon:        '🚶',
  },
  {
    id:          'standby_off',
    title:       'Turn Off Standby Devices',
    description: 'Unplug TVs, chargers, and appliances not in use.',
    category:    'Electricity',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.standby_off,
    icon:        '🔌',
  },
  {
    id:          'plant_based_meal',
    title:       'Eat One Plant-Based Meal',
    description: 'Choose a vegetarian or vegan option for one meal today.',
    category:    'Food',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.plant_based_meal,
    icon:        '🥗',
  },
  {
    id:          'skip_delivery',
    title:       'Skip One Online Delivery',
    description: 'Consolidate orders or visit a local shop instead.',
    category:    'Shopping',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.skip_delivery,
    icon:        '📦',
  },
  {
    id:          'cold_wash',
    title:       'Cold Wash Your Laundry',
    description: '90% of washing machine energy goes to heating water.',
    category:    'Electricity',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.cold_wash,
    icon:        '🧺',
  },
  {
    id:          'short_shower',
    title:       'Take a 5-Minute Shower',
    description: 'Cutting 5 minutes from your shower saves water and energy.',
    category:    'Electricity',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.short_shower,
    icon:        '🚿',
  },
  {
    id:          'local_produce',
    title:       'Buy Local Produce',
    description: 'Choose locally grown food to cut food-miles emissions.',
    category:    'Food',
    co2SavedKg:  CHALLENGE_CO2_SAVINGS.local_produce,
    icon:        '🛒',
  },
];

/**
 * Selects three daily challenges, prioritising the user's largest emission
 * category and then filling with a date-seeded diverse mix.
 *
 * The selection is deterministic for a given `(largestCategory, date)` pair
 * so challenges remain stable on page reload.
 *
 * @param largestCategory - The category contributing most to today's footprint.
 * @param date - ISO date string (`YYYY-MM-DD`) used as a deterministic seed.
 * @returns Exactly three non-duplicate challenges for the day.
 */
export function selectDailyChallenges(
  largestCategory: EmissionCategory,
  date: string
): [EcoChallenge, EcoChallenge, EcoChallenge] {
  const seed   = date.replace(/-/g, '').slice(-4);
  const offset = parseInt(seed, 10) % ALL_CHALLENGES.length;

  // Always include one challenge from the user's largest category
  const primary = ALL_CHALLENGES.find(c => c.category === largestCategory)
    ?? ALL_CHALLENGES[0];

  // Fill the remaining two slots with a date-rotated diverse selection
  const others = ALL_CHALLENGES
    .filter(c => c.id !== primary.id)
    .sort((a, b) => {
      const ai = (ALL_CHALLENGES.indexOf(a) + offset) % ALL_CHALLENGES.length;
      const bi = (ALL_CHALLENGES.indexOf(b) + offset) % ALL_CHALLENGES.length;
      return ai - bi;
    })
    .slice(0, 2);

  return [primary, others[0], others[1]];
}
