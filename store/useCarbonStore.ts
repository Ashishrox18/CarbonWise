'use client';

/**
 * @fileoverview Global Zustand store for CarbonWise.
 *
 * Keeps UI state in sync with localStorage.
 * All mutations validate data before persisting.
 */

import { create } from 'zustand';
import { CheckInRecord, ChatMessage } from '@/types';
import {
  getCheckIns,
  getTodayCheckIn,
  saveCheckIn,
  getChatMessages,
  saveChatMessage,
  clearChatMessages,
  computeProgressStats,
} from '@/lib/storage';

interface CarbonStore {
  // ── State ──────────────────────────────────────────────────────
  checkIns:       CheckInRecord[];
  todayCheckIn:   CheckInRecord | null;
  chatMessages:   ChatMessage[];
  isLoading:      boolean;
  error:          string | null;

  // ── Actions ────────────────────────────────────────────────────
  loadData:               (date: string) => void;
  addCheckIn:             (record: CheckInRecord) => void;
  completeChallenge:      (challengeId: string, co2SavedKg: number) => void;
  addChatMessage:         (message: ChatMessage) => void;
  clearChat:              () => void;
  setLoading:             (v: boolean) => void;
  setError:               (v: string | null) => void;
}

export const useCarbonStore = create<CarbonStore>((set, get) => ({
  checkIns:      [],
  todayCheckIn:  null,
  chatMessages:  [],
  isLoading:     false,
  error:         null,

  loadData: (date) => {
    const checkIns    = getCheckIns();
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
      co2SavedKg: todayCheckIn.co2SavedKg + co2SavedKg,
    };

    saveCheckIn(updated);
    set(state => ({
      todayCheckIn: updated,
      checkIns: state.checkIns.map(r => r.date === updated.date ? updated : r),
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

  setLoading: (v) => set({ isLoading: v }),
  setError:   (v) => set({ error: v }),
}));

/** Selector: computed progress stats (memoised outside component via derived state) */
export function selectProgressStats(store: CarbonStore) {
  return computeProgressStats(store.checkIns);
}
