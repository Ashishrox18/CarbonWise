/**
 * @fileoverview Unit tests for lib/challenges.ts
 *
 * Coverage targets:
 * - ALL_CHALLENGES catalogue integrity
 * - selectDailyChallenges for every EmissionCategory
 * - Determinism (same inputs → same outputs)
 * - No duplicates across any selection
 * - Edge cases: every category should be represented at least once across calls
 */

import { selectDailyChallenges, ALL_CHALLENGES } from '@/lib/challenges';
import type { EmissionCategory, EcoChallenge } from '@/types';

const ALL_CATEGORIES: EmissionCategory[] = [
  'Transportation', 'Food', 'Electricity', 'Shopping', 'Waste',
];

// ─── ALL_CHALLENGES catalogue ─────────────────────────────────────

describe('ALL_CHALLENGES catalogue', () => {
  it('contains at least one challenge per emission category', () => {
    ALL_CATEGORIES.forEach(cat => {
      const hasCategory = ALL_CHALLENGES.some(c => c.category === cat);
      expect(hasCategory).toBe(true);
    });
  });

  it('every challenge has a unique id', () => {
    const ids = ALL_CHALLENGES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every challenge has non-empty title and description', () => {
    ALL_CHALLENGES.forEach(c => {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
    });
  });

  it('every challenge has a positive co2SavedKg', () => {
    ALL_CHALLENGES.forEach(c => {
      expect(c.co2SavedKg).toBeGreaterThan(0);
    });
  });

  it('every challenge has an icon', () => {
    ALL_CHALLENGES.forEach(c => {
      expect(c.icon.length).toBeGreaterThan(0);
    });
  });

  it('every challenge category is a valid EmissionCategory', () => {
    ALL_CHALLENGES.forEach(c => {
      expect(ALL_CATEGORIES).toContain(c.category);
    });
  });
});

// ─── selectDailyChallenges ────────────────────────────────────────

describe('selectDailyChallenges', () => {
  const DATE = '2025-06-15';

  it('always returns exactly three challenges', () => {
    ALL_CATEGORIES.forEach(cat => {
      expect(selectDailyChallenges(cat, DATE)).toHaveLength(3);
    });
  });

  it('first challenge always belongs to the specified category', () => {
    ALL_CATEGORIES.forEach(cat => {
      const [first] = selectDailyChallenges(cat, DATE);
      expect(first.category).toBe(cat);
    });
  });

  it('returns no duplicate challenge ids', () => {
    ALL_CATEGORIES.forEach(cat => {
      const result = selectDailyChallenges(cat, DATE);
      const ids = result.map(c => c.id);
      expect(new Set(ids).size).toBe(3);
    });
  });

  it('all returned challenges exist in ALL_CHALLENGES', () => {
    const allIds = new Set(ALL_CHALLENGES.map(c => c.id));
    ALL_CATEGORIES.forEach(cat => {
      selectDailyChallenges(cat, DATE).forEach(c => {
        expect(allIds.has(c.id)).toBe(true);
      });
    });
  });

  it('is deterministic — same inputs yield same outputs', () => {
    ALL_CATEGORIES.forEach(cat => {
      const a = selectDailyChallenges(cat, DATE);
      const b = selectDailyChallenges(cat, DATE);
      expect(a.map(c => c.id)).toEqual(b.map(c => c.id));
    });
  });

  it('varies selection across different dates', () => {
    // Not guaranteed to differ every single time, but with different seeds
    // it is statistically very unlikely to match for all dates
    const dates = ['2025-01-01', '2025-03-15', '2025-06-15', '2025-09-01', '2025-12-31'];
    const selections = dates.map(d => selectDailyChallenges('Transportation', d).map(c => c.id).join(','));
    // At least two of the five dates should produce different selections
    const unique = new Set(selections);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('handles every category without throwing', () => {
    ALL_CATEGORIES.forEach(cat => {
      expect(() => selectDailyChallenges(cat, DATE)).not.toThrow();
    });
  });

  it('works for date 2025-01-01 (low seed)', () => {
    const result = selectDailyChallenges('Food', '2025-01-01');
    expect(result).toHaveLength(3);
    expect(result[0].category).toBe('Food');
  });

  it('works for date 2099-12-31 (high seed)', () => {
    const result = selectDailyChallenges('Waste', '2099-12-31');
    expect(result).toHaveLength(3);
    expect(result[0].category).toBe('Waste');
  });

  it('returned challenges have all required EcoChallenge fields', () => {
    selectDailyChallenges('Electricity', DATE).forEach((c: EcoChallenge) => {
      expect(typeof c.id).toBe('string');
      expect(typeof c.title).toBe('string');
      expect(typeof c.description).toBe('string');
      expect(typeof c.co2SavedKg).toBe('number');
      expect(typeof c.icon).toBe('string');
    });
  });
});
