import { estimateFootprint, getLargestContributor } from '@/lib/carbonEstimator';
import type { CheckInAnswers } from '@/types';

describe('estimateFootprint', () => {
  const lowImpact: CheckInAnswers = {
    transport:   'walk',
    meal:        'vegetarian',
    electricity: 'low',
    shopping:    'none',
    waste:       'recycled',
  };

  const highImpact: CheckInAnswers = {
    transport:   'car',
    meal:        'beef',
    electricity: 'high',
    shopping:    'several',
    waste:       'none',
  };

  it('returns zero emissions for fully sustainable choices', () => {
    const result = estimateFootprint(lowImpact);
    expect(result.breakdown.Transportation).toBe(0);
    expect(result.breakdown.Food).toBe(1.5);
    expect(result.score).toBeLessThanOrEqual(33);
    expect(result.level).toBe('Low');
  });

  it('returns high emissions for car + beef + high electricity', () => {
    const result = estimateFootprint(highImpact);
    expect(result.breakdown.Transportation).toBe(4.6);
    expect(result.breakdown.Food).toBe(9.0);
    expect(result.level).toBe('High');
    expect(result.score).toBeGreaterThan(66);
  });

  it('score is bounded between 0 and 100', () => {
    const result = estimateFootprint(highImpact);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('totalKg equals sum of all breakdown categories', () => {
    const result = estimateFootprint(highImpact);
    const sum = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
    expect(result.totalKg).toBeCloseTo(sum);
  });
});

describe('getLargestContributor', () => {
  it('identifies Food as largest when beef is chosen', () => {
    const result = estimateFootprint({
      transport:   'walk',
      meal:        'beef',
      electricity: 'low',
      shopping:    'none',
      waste:       'recycled',
    });
    const largest = getLargestContributor(result.breakdown);
    expect(largest).toBe('Food');
  });

  it('identifies Transportation when car is chosen with minimal other impact', () => {
    const result = estimateFootprint({
      transport:   'car',
      meal:        'vegetarian',
      electricity: 'low',
      shopping:    'none',
      waste:       'recycled',
    });
    const largest = getLargestContributor(result.breakdown);
    expect(largest).toBe('Transportation');
  });
});
