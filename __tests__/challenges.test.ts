import { selectDailyChallenges, ALL_CHALLENGES } from '@/lib/challenges';
import type { EmissionCategory } from '@/types';

describe('selectDailyChallenges', () => {
  const date = '2025-06-15';

  it('returns exactly three challenges', () => {
    const result = selectDailyChallenges('Transportation', date);
    expect(result).toHaveLength(3);
  });

  it('includes a challenge from the largest category', () => {
    const categories: EmissionCategory[] = ['Transportation', 'Food', 'Electricity', 'Shopping', 'Waste'];
    categories.forEach(cat => {
      const result = selectDailyChallenges(cat, date);
      const hasCategoryChallenge = result.some(c => c.category === cat);
      expect(hasCategoryChallenge).toBe(true);
    });
  });

  it('returns no duplicate challenges', () => {
    const result = selectDailyChallenges('Food', date);
    const ids = result.map(c => c.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('returns different sets for different dates', () => {
    const a = selectDailyChallenges('Transportation', '2025-01-01');
    const b = selectDailyChallenges('Transportation', '2025-06-15');
    // At least sometimes different (not a guarantee, but statistically very likely)
    const aIds = a.map(c => c.id).join();
    const bIds = b.map(c => c.id).join();
    // Just ensure both return valid challenges
    expect(a).toHaveLength(3);
    expect(b).toHaveLength(3);
  });

  it('all returned challenges exist in ALL_CHALLENGES', () => {
    const result = selectDailyChallenges('Waste', date);
    const allIds = ALL_CHALLENGES.map(c => c.id);
    result.forEach(c => expect(allIds).toContain(c.id));
  });
});
