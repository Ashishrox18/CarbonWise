/**
 * @fileoverview Unit tests for store/useCarbonStore.ts
 *
 * Coverage targets:
 * - loadData: populates checkIns, todayCheckIn, chatMessages
 * - addCheckIn: adds to store and localStorage
 * - completeChallenge: updates co2SavedKg and completedChallengeIds
 * - completeChallenge: no-op when todayCheckIn is null
 * - completeChallenge: no-op when challenge already completed
 * - addChatMessage: appends to store
 * - clearChat: empties store and localStorage
 * - setLoading / setError
 * - selectProgressStats selector
 */

import { act, renderHook } from '@testing-library/react';
import { useCarbonStore, selectProgressStats } from '@/store/useCarbonStore';
import { saveCheckIn } from '@/lib/storage';
import type { CheckInRecord, ChatMessage } from '@/types';
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
      summary:            'Test summary with enough words here.',
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
    completedChallengeIds: [],
    co2SavedKg:            0,
  };
}

function makeMessage(role: 'user' | 'assistant' = 'user'): ChatMessage {
  return {
    id:        uuidv4(),
    role,
    content:   'Test message',
    timestamp: new Date().toISOString(),
  };
}

// Reset the Zustand store between tests
beforeEach(() => {
  useCarbonStore.setState({
    checkIns:     [],
    todayCheckIn: null,
    chatMessages: [],
    isLoading:    false,
    error:        null,
  });
  localStorage.clear();
});

// ─── loadData ─────────────────────────────────────────────────────

describe('loadData', () => {
  it('populates checkIns from localStorage', () => {
    const record = makeRecord('2025-01-01');
    saveCheckIn(record);

    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.loadData('2025-01-01'));

    expect(result.current.checkIns).toHaveLength(1);
  });

  it('sets todayCheckIn when date matches', () => {
    const record = makeRecord('2025-01-01');
    saveCheckIn(record);

    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.loadData('2025-01-01'));

    expect(result.current.todayCheckIn?.date).toBe('2025-01-01');
  });

  it('sets todayCheckIn to null when no match', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.loadData('2099-12-31'));
    expect(result.current.todayCheckIn).toBeNull();
  });

  it('populates chatMessages from localStorage', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => {
      result.current.addChatMessage(makeMessage());
    });
    act(() => result.current.loadData('2025-01-01'));
    expect(result.current.chatMessages).toHaveLength(1);
  });
});

// ─── addCheckIn ───────────────────────────────────────────────────

describe('addCheckIn', () => {
  it('adds a record to checkIns', () => {
    const { result } = renderHook(() => useCarbonStore());
    const record = makeRecord('2025-01-01');
    act(() => result.current.addCheckIn(record));
    expect(result.current.checkIns).toHaveLength(1);
  });

  it('sets todayCheckIn', () => {
    const { result } = renderHook(() => useCarbonStore());
    const record = makeRecord('2025-01-01');
    act(() => result.current.addCheckIn(record));
    expect(result.current.todayCheckIn?.id).toBe(record.id);
  });

  it('replaces existing record for the same date', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.addCheckIn(makeRecord('2025-01-01', 40)));
    act(() => result.current.addCheckIn(makeRecord('2025-01-01', 80)));
    expect(result.current.checkIns).toHaveLength(1);
    expect(result.current.checkIns[0].analysis.score).toBe(80);
  });
});

// ─── completeChallenge ────────────────────────────────────────────

describe('completeChallenge', () => {
  it('adds challengeId and increments co2SavedKg', () => {
    const { result } = renderHook(() => useCarbonStore());
    const record = makeRecord('2025-01-01');
    act(() => result.current.addCheckIn(record));
    act(() => result.current.completeChallenge('walk_15_min', 0.5));

    expect(result.current.todayCheckIn?.completedChallengeIds).toContain('walk_15_min');
    expect(result.current.todayCheckIn?.co2SavedKg).toBeCloseTo(0.5);
  });

  it('is a no-op when todayCheckIn is null', () => {
    const { result } = renderHook(() => useCarbonStore());
    expect(() => {
      act(() => result.current.completeChallenge('walk_15_min', 0.5));
    }).not.toThrow();
    expect(result.current.todayCheckIn).toBeNull();
  });

  it('does not double-count an already-completed challenge', () => {
    const { result } = renderHook(() => useCarbonStore());
    const record = makeRecord('2025-01-01');
    act(() => result.current.addCheckIn(record));
    act(() => result.current.completeChallenge('walk_15_min', 0.5));
    act(() => result.current.completeChallenge('walk_15_min', 0.5));

    expect(result.current.todayCheckIn?.completedChallengeIds).toHaveLength(1);
    expect(result.current.todayCheckIn?.co2SavedKg).toBeCloseTo(0.5);
  });

  it('can complete multiple different challenges', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.addCheckIn(makeRecord('2025-01-01')));
    act(() => result.current.completeChallenge('walk_15_min', 0.5));
    act(() => result.current.completeChallenge('plant_based_meal', 2.0));

    expect(result.current.todayCheckIn?.completedChallengeIds).toHaveLength(2);
    expect(result.current.todayCheckIn?.co2SavedKg).toBeCloseTo(2.5);
  });
});

// ─── addChatMessage / clearChat ───────────────────────────────────

describe('addChatMessage', () => {
  it('appends message to chatMessages', () => {
    const { result } = renderHook(() => useCarbonStore());
    const msg = makeMessage('user');
    act(() => result.current.addChatMessage(msg));
    expect(result.current.chatMessages).toHaveLength(1);
    expect(result.current.chatMessages[0].id).toBe(msg.id);
  });

  it('preserves order', () => {
    const { result } = renderHook(() => useCarbonStore());
    const m1 = makeMessage('user');
    const m2 = makeMessage('assistant');
    act(() => result.current.addChatMessage(m1));
    act(() => result.current.addChatMessage(m2));
    expect(result.current.chatMessages[0].id).toBe(m1.id);
    expect(result.current.chatMessages[1].id).toBe(m2.id);
  });
});

describe('clearChat', () => {
  it('empties chatMessages', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.addChatMessage(makeMessage()));
    act(() => result.current.clearChat());
    expect(result.current.chatMessages).toHaveLength(0);
  });
});

// ─── setLoading / setError ────────────────────────────────────────

describe('setLoading', () => {
  it('sets isLoading to true', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.setLoading(true));
    expect(result.current.isLoading).toBe(true);
  });

  it('sets isLoading to false', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.setLoading(true));
    act(() => result.current.setLoading(false));
    expect(result.current.isLoading).toBe(false);
  });
});

describe('setError', () => {
  it('sets error message', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.setError('Something went wrong'));
    expect(result.current.error).toBe('Something went wrong');
  });

  it('clears error with null', () => {
    const { result } = renderHook(() => useCarbonStore());
    act(() => result.current.setError('Error'));
    act(() => result.current.setError(null));
    expect(result.current.error).toBeNull();
  });
});

// ─── selectProgressStats ─────────────────────────────────────────

describe('selectProgressStats', () => {
  it('returns zero stats for empty store', () => {
    const stats = selectProgressStats(useCarbonStore.getState());
    expect(stats.currentStreak).toBe(0);
    expect(stats.totalCo2SavedKg).toBe(0);
    expect(stats.averageScore).toBe(0);
  });

  it('computes stats from store checkIns', () => {
    useCarbonStore.setState({
      checkIns: [makeRecord('2025-01-01', 60, 0)],
      todayCheckIn: null,
      chatMessages: [],
      isLoading: false,
      error: null,
    });
    const stats = selectProgressStats(useCarbonStore.getState());
    expect(stats.averageScore).toBe(60);
    expect(stats.totalCo2SavedKg).toBeCloseTo(0);
  });
});
