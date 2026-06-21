import { saveCheckIn, getCheckIns, getTodayCheckIn, computeProgressStats } from '@/lib/storage';
import type { CheckInRecord } from '@/types';
import { v4 as uuidv4 } from 'uuid';

function makeRecord(date: string, score = 50): CheckInRecord {
  return {
    id:   uuidv4(),
    date,
    answers: {
      transport:   'bus',
      meal:        'mixed',
      electricity: 'medium',
      shopping:    'none',
      waste:       'recycled',
    },
    analysis: {
      footprint:          'Medium',
      largestContributor: 'Transportation',
      score,
      summary:            'Test summary with enough words.',
      topActions:         ['Action 1', 'Action 2', 'Action 3'],
      weeklyGoal:         'This is a weekly goal sentence.',
      categoryBreakdown:  { Transportation: 1.5, Food: 3.0, Electricity: 1.5, Shopping: 0, Waste: 0.2 },
    },
    completedChallengeIds: [],
    co2SavedKg:            0,
  };
}

beforeEach(() => localStorage.clear());

describe('saveCheckIn / getCheckIns', () => {
  it('saves and retrieves a check-in', () => {
    const record = makeRecord('2025-01-15');
    saveCheckIn(record);
    const stored = getCheckIns();
    expect(stored).toHaveLength(1);
    expect(stored[0].date).toBe('2025-01-15');
  });

  it('replaces a record with the same date', () => {
    saveCheckIn(makeRecord('2025-01-15', 40));
    saveCheckIn(makeRecord('2025-01-15', 70));
    const stored = getCheckIns();
    expect(stored).toHaveLength(1);
    expect(stored[0].analysis.score).toBe(70);
  });

  it('stores multiple different dates', () => {
    saveCheckIn(makeRecord('2025-01-13'));
    saveCheckIn(makeRecord('2025-01-14'));
    saveCheckIn(makeRecord('2025-01-15'));
    expect(getCheckIns()).toHaveLength(3);
  });
});

describe('getTodayCheckIn', () => {
  it('returns null when no check-in exists for date', () => {
    expect(getTodayCheckIn('2099-12-31')).toBeNull();
  });

  it('returns the record matching the given date', () => {
    saveCheckIn(makeRecord('2025-06-01'));
    const result = getTodayCheckIn('2025-06-01');
    expect(result).not.toBeNull();
    expect(result?.date).toBe('2025-06-01');
  });
});

describe('computeProgressStats', () => {
  it('returns zeros for empty array', () => {
    const stats = computeProgressStats([]);
    expect(stats.currentStreak).toBe(0);
    expect(stats.totalCo2SavedKg).toBe(0);
    expect(stats.completedChallenges).toBe(0);
    expect(stats.averageScore).toBe(0);
  });

  it('computes average score correctly', () => {
    const records = [
      makeRecord('2025-01-01', 40),
      makeRecord('2025-01-02', 60),
    ];
    const stats = computeProgressStats(records);
    expect(stats.averageScore).toBe(50);
  });

  it('counts completed challenges', () => {
    const record = makeRecord('2025-01-01');
    record.completedChallengeIds = ['walk_15_min', 'plant_based_meal'];
    record.co2SavedKg = 2.5;
    const stats = computeProgressStats([record]);
    expect(stats.completedChallenges).toBe(2);
    expect(stats.totalCo2SavedKg).toBe(2.5);
  });
});
