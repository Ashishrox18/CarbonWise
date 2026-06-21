import { buildFallbackAnalysis } from '@/services/gemini';
import type { CheckInAnswers } from '@/types';

const answers: CheckInAnswers = {
  transport:   'car',
  meal:        'beef',
  electricity: 'high',
  shopping:    'several',
  waste:       'none',
};

describe('buildFallbackAnalysis', () => {
  it('returns a valid CarbonAnalysis shape', () => {
    const result = buildFallbackAnalysis(answers);
    expect(result.footprint).toMatch(/Low|Medium|High/);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.topActions).toHaveLength(3);
    expect(result.summary.length).toBeGreaterThan(10);
    expect(result.weeklyGoal.length).toBeGreaterThan(10);
  });

  it('identifies the correct largest contributor', () => {
    const result = buildFallbackAnalysis(answers);
    // Beef (9 kg) > Car (4.6 kg) > Shopping (7 kg)
    // Shopping: 7 > Car: 4.6, but Food (beef): 9 is highest
    expect(result.largestContributor).toBe('Food');
  });

  it('returns categoryBreakdown with all five categories', () => {
    const result = buildFallbackAnalysis(answers);
    const categories = Object.keys(result.categoryBreakdown);
    expect(categories).toContain('Transportation');
    expect(categories).toContain('Food');
    expect(categories).toContain('Electricity');
    expect(categories).toContain('Shopping');
    expect(categories).toContain('Waste');
  });

  it('returns Low footprint for sustainable choices', () => {
    const sustainable: CheckInAnswers = {
      transport:   'walk',
      meal:        'vegetarian',
      electricity: 'low',
      shopping:    'none',
      waste:       'recycled',
    };
    const result = buildFallbackAnalysis(sustainable);
    expect(result.footprint).toBe('Low');
    expect(result.score).toBeLessThanOrEqual(33);
  });
});
