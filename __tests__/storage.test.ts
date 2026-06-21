/**
 * @fileoverview Unit tests for lib/storage.ts
 *
 * Coverage targets:
 * - saveCheckIn / getCheckIns / getTodayCheckIn
 * - computeProgressStats: streak, averages, CO₂, weekly scores
 * - getChatMessages / saveChatMessage / clearChatMessages
 * - getRecentCheckIns
 * - SSR guard (window === undefined)
 * - Storage quota failure (safeSet error path)
 * - Invalid record rejection
 */

import {
  saveCheckIn,
  getCheckIns,
  getTodayCheckIn,
  getRecentCheckIns,
  computeProgressStats,
  getChatMessages,
  saveChatMessage,
  clearChatMessages,
} from '@/lib/storage';
import type { CheckInRecord, ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ─── Factories ────────────────────────────────────────────────────

function makeRecord(date: string, score = 50, co2Saved = 0, challengeIds: string[] = []): CheckInRecord {
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
      categoryBreakdown:  {
        Transportation: 1.5,
        Food:           3.0,
        Electricity:    1.5,
        Shopping:       0,
        Waste:          0.2,
      },
    },
    completedChallengeIds: challengeIds,
    co2SavedKg:            co2Saved,
  };
}

function makeMessage(role: 'user' | 'assistant' = 'user'): ChatMessage {
  return {
    id:        uuidv4(),
    role,
    content:   'Test message content',
    timestamp: new Date().toISOString(),
  };
}

// ─── saveCheckIn / getCheckIns ────────────────────────────────────

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

  it('returns newest record first', () => {
    saveCheckIn(makeRecord('2025-01-13'));
    saveCheckIn(makeRecord('2025-01-14'));
    const stored = getCheckIns();
    expect(stored[0].date).toBe('2025-01-14');
  });

  it('returns empty array when nothing stored', () => {
    expect(getCheckIns()).toEqual([]);
  });

  it('rejects a record with invalid schema (no-op)', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error intentionally passing invalid data
    saveCheckIn({ id: 'bad-id', date: '2025-01-01' });
    expect(getCheckIns()).toHaveLength(0);
    consoleSpy.mockRestore();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('cw_checkins', 'not-valid-json{{{');
    expect(() => getCheckIns()).not.toThrow();
    expect(getCheckIns()).toEqual([]);
  });

  it('preserves existing records when adding a new date', () => {
    saveCheckIn(makeRecord('2025-01-01'));
    saveCheckIn(makeRecord('2025-01-02'));
    const stored = getCheckIns();
    expect(stored.map(r => r.date)).toContain('2025-01-01');
    expect(stored.map(r => r.date)).toContain('2025-01-02');
  });
});

// ─── getTodayCheckIn ──────────────────────────────────────────────

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

  it('returns null when date does not match any record', () => {
    saveCheckIn(makeRecord('2025-06-01'));
    expect(getTodayCheckIn('2025-06-02')).toBeNull();
  });
});

// ─── getRecentCheckIns ────────────────────────────────────────────

describe('getRecentCheckIns', () => {
  it('returns at most count records', () => {
    for (let i = 1; i <= 10; i++) {
      saveCheckIn(makeRecord(`2025-01-${String(i).padStart(2, '0')}`));
    }
    expect(getRecentCheckIns(3)).toHaveLength(3);
  });

  it('defaults to 7 records', () => {
    for (let i = 1; i <= 10; i++) {
      saveCheckIn(makeRecord(`2025-01-${String(i).padStart(2, '0')}`));
    }
    expect(getRecentCheckIns()).toHaveLength(7);
  });

  it('returns fewer than count when not enough records exist', () => {
    saveCheckIn(makeRecord('2025-01-01'));
    expect(getRecentCheckIns(7)).toHaveLength(1);
  });
});

// ─── computeProgressStats ────────────────────────────────────────

describe('computeProgressStats', () => {
  it('returns all zeros for empty array', () => {
    const stats = computeProgressStats([]);
    expect(stats.currentStreak).toBe(0);
    expect(stats.totalCo2SavedKg).toBe(0);
    expect(stats.completedChallenges).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.weeklyScores).toEqual([]);
  });

  it('computes average score correctly', () => {
    const stats = computeProgressStats([
      makeRecord('2025-01-01', 40),
      makeRecord('2025-01-02', 60),
    ]);
    expect(stats.averageScore).toBe(50);
  });

  it('rounds average score to nearest integer', () => {
    const stats = computeProgressStats([
      makeRecord('2025-01-01', 33),
      makeRecord('2025-01-02', 34),
    ]);
    expect(Number.isInteger(stats.averageScore)).toBe(true);
  });

  it('counts completed challenges across all records', () => {
    const stats = computeProgressStats([
      makeRecord('2025-01-01', 50, 2.5, ['walk_15_min', 'plant_based_meal']),
      makeRecord('2025-01-02', 50, 0.5, ['standby_off']),
    ]);
    expect(stats.completedChallenges).toBe(3);
  });

  it('sums totalCo2SavedKg correctly', () => {
    const stats = computeProgressStats([
      makeRecord('2025-01-01', 50, 1.5),
      makeRecord('2025-01-02', 50, 2.5),
    ]);
    expect(stats.totalCo2SavedKg).toBeCloseTo(4.0);
  });

  it('weeklyScores contains at most 7 entries', () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      makeRecord(`2025-01-${String(i + 1).padStart(2, '0')}`, 50)
    );
    const stats = computeProgressStats(records);
    expect(stats.weeklyScores.length).toBeLessThanOrEqual(7);
  });

  it('weeklyScores are in chronological order (oldest first)', () => {
    const records = [
      makeRecord('2025-01-03', 30),
      makeRecord('2025-01-01', 10),
      makeRecord('2025-01-02', 20),
    ];
    const stats = computeProgressStats(records);
    const dates = stats.weeklyScores.map(s => s.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('single record returns streak of 0 (unless today)', () => {
    // Past date — streak should be 0 since it's not today
    const stats = computeProgressStats([makeRecord('2020-01-01')]);
    expect(stats.currentStreak).toBe(0);
  });

  it('streak counts consecutive days ending today', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const records = [
      makeRecord(fmt(today)),
      makeRecord(fmt(yesterday)),
      makeRecord(fmt(twoDaysAgo)),
    ];
    const stats = computeProgressStats(records);
    expect(stats.currentStreak).toBe(3);
  });

  it('streak resets on a gap', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    // Gap: no record for yesterday
    const records = [
      makeRecord(fmt(today)),
      makeRecord(fmt(twoDaysAgo)),
    ];
    const stats = computeProgressStats(records);
    expect(stats.currentStreak).toBe(1);
  });
});

// ─── Chat messages ────────────────────────────────────────────────

describe('getChatMessages / saveChatMessage / clearChatMessages', () => {
  it('returns empty array when nothing stored', () => {
    expect(getChatMessages()).toEqual([]);
  });

  it('saves and retrieves a message', () => {
    const msg = makeMessage('user');
    saveChatMessage(msg);
    expect(getChatMessages()).toHaveLength(1);
    expect(getChatMessages()[0].id).toBe(msg.id);
  });

  it('preserves message order (oldest first)', () => {
    const m1 = makeMessage('user');
    const m2 = makeMessage('assistant');
    saveChatMessage(m1);
    saveChatMessage(m2);
    const msgs = getChatMessages();
    expect(msgs[0].id).toBe(m1.id);
    expect(msgs[1].id).toBe(m2.id);
  });

  it('clears all messages', () => {
    saveChatMessage(makeMessage());
    clearChatMessages();
    expect(getChatMessages()).toEqual([]);
  });

  it('silently ignores invalid messages', () => {
    // @ts-expect-error intentionally passing invalid data
    saveChatMessage({ id: 'bad', role: 'user' });
    expect(getChatMessages()).toHaveLength(0);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('cw_chat', '[[invalid]]');
    expect(() => getChatMessages()).not.toThrow();
    expect(getChatMessages()).toEqual([]);
  });
});
