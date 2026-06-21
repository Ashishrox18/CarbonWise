'use client';

/**
 * @fileoverview Global Zustand store for CarbonWise.
 *
 * Keeps React state in sync with localStorage.
 * All mutations validate data before persisting via the storage layer.
 */

import { create } from 'zustand';
import type { CheckInRecord, ChatMessage, ProgressStats } from '@/types';
import {
  getCheckIns,
  getTodayCheckIn,
  saveCheckIn,
  getChatMessages,
  saveChatMessage,
  clearChatMessages,
  computeProgressStats,
} from '@/lib/storage';

/** Shape of the global carbon store. */
interface CarbonStore {
  // ── State ─────────────────────────────────────────────────────
  /** All stored check-in records, newest first. */
  checkIns: CheckInRecord[];
  /** Today's check-in, or `null` if the user hasn't checked in yet. */
  todayCheckIn: CheckInRecord | null;
  /** Full chat history with the AI coach. */
  chatMessages: ChatMessage[];
  /** Whether an async operation is in progress. */
  isLoading: boolean;
  /** Current error message, or `null`. */
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────
  /** Loads all data from localStorage for the given date. */
  loadData: (date: string) => void;
  /** Adds or replaces a check-in record (by date). */
  addCheckIn: (record: CheckInRecord) => void;
  /** Marks a challenge as complete and increments CO₂ saved. */
  completeChallenge: (challengeId: string, co2SavedKg: number) => void;
  /** Appends a chat message to the history. */
  addChatMessage: (message: ChatMessage) => void;
  /** Clears all chat history. */
  clearChat: () => void;
  /** Sets the global loading flag. */
  setLoading: (value: boolean) => void;
  /** Sets or clears the global error message. */
  setError: (value: string | null) => void;
}

export const useCarbonStore = create<CarbonStore>((set, get) => ({
  checkIns:     [],
  todayCheckIn: null,
  chatMessages: [],
  isLoading:    false,
  error:        null,

  loadData: (date) => {
    const checkIns     = getCheckIns();
    const todayCheckIn = getTodayCheckIn(date);
    const chatMessages = getChatMessages();
    set({ checkIns, todayCheckIn, chatMessages });
  },

  addCheckIn: (record) => {
    saveCheckIn(record);
    set(state => ({
      checkIns:     [record, ...state.checkIns.filter(r => r.date !== record.date)],
      todayCheckIn: record,
    }));
  },

  completeChallenge: (challengeId, co2SavedKg) => {
    const { todayCheckIn } = get();
    if (!todayCheckIn) return;
    if (todayCheckIn.completedChallengeIds.includes(challengeId)) return;

    const updated: CheckInRecord = {
      ...todayCheckIn,
      completedChallengeIds: [...todayCheckIn.completedChallengeIds, challengeId],
      co2SavedKg:            todayCheckIn.co2SavedKg + co2SavedKg,
    };

    saveCheckIn(updated);
    set(state => ({
      todayCheckIn: updated,
      checkIns:     state.checkIns.map(r => r.date === updated.date ? updated : r),
    }));
  },

  addChatMessage: (message) => {
    saveChatMessage(message);
    set(state => ({ chatMessages: [...state.chatMessages, message] }));
  },

  clearChat: () => {
    clearChatMessages();
    set({ chatMessages: [] });
  },

  setLoading: (value) => set({ isLoading: value }),
  setError:   (value) => set({ error: value }),
}));

/**
 * Selector that computes aggregated progress statistics from the store.
 * Intended to be called inside `useMemo` to avoid redundant recalculation.
 *
 * @param store - The current CarbonStore state.
 * @returns Computed {@link ProgressStats}.
 */
export function selectProgressStats(store: CarbonStore): ProgressStats {
  return computeProgressStats(store.checkIns);
}
