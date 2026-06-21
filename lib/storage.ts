/**
 * @fileoverview Type-safe localStorage wrapper.
 *
 * All reads return null on SSR or parse failure — never throws.
 * All writes are validated before storage.
 */

import { CheckInRecord, ChatMessage } from '@/types';
import { CheckInRecordSchema, ChatMessageSchema } from './validators';
import { STORAGE_KEYS, RETENTION } from './constants';

// ─── Generic helpers ──────────────────────────────────────────────

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[CarbonWise] Storage write failed for key "${key}":`, err);
  }
}

// ─── Check-Ins ────────────────────────────────────────────────────

/** Returns all stored check-in records, newest first. */
export function getCheckIns(): CheckInRecord[] {
  return safeGet<CheckInRecord[]>(STORAGE_KEYS.CHECK_INS) ?? [];
}

/** Returns the check-in for today (YYYY-MM-DD) if it exists. */
export function getTodayCheckIn(date: string): CheckInRecord | null {
  return getCheckIns().find(r => r.date === date) ?? null;
}

/** Persists a check-in after Zod validation. Keeps max 90 records. */
export function saveCheckIn(record: CheckInRecord): void {
  const result = CheckInRecordSchema.safeParse(record);
  if (!result.success) {
    console.error('[CarbonWise] Invalid check-in record:', result.error.issues);
    return;
  }
  const existing = getCheckIns().filter(r => r.date !== record.date);
  safeSet(STORAGE_KEYS.CHECK_INS, [record, ...existing].slice(0, RETENTION.MAX_CHECK_INS));
}

/** Returns the last N check-ins (default 7). */
export function getRecentCheckIns(count = 7): CheckInRecord[] {
  return getCheckIns().slice(0, count);
}

// ─── Chat ─────────────────────────────────────────────────────────

export function getChatMessages(): ChatMessage[] {
  return safeGet<ChatMessage[]>(STORAGE_KEYS.CHAT) ?? [];
}

export function saveChatMessage(message: ChatMessage): void {
  const result = ChatMessageSchema.safeParse(message);
  if (!result.success) return;
  const msgs = getChatMessages();
  safeSet(STORAGE_KEYS.CHAT, [...msgs, message].slice(-RETENTION.MAX_CHAT_MSGS));
}

export function clearChatMessages(): void {
  safeSet(STORAGE_KEYS.CHAT, []);
}

// ─── Progress Stats ───────────────────────────────────────────────

/**
 * Computes progress statistics from all stored check-ins.
 * Pure function — no side effects.
 */
export function computeProgressStats(records: CheckInRecord[]) {
  if (records.length === 0) {
    return {
      totalCo2SavedKg: 0,
      currentStreak: 0,
      completedChallenges: 0,
      averageScore: 0,
      weeklyScores: [] as Array<{ date: string; score: number }>,
    };
  }

  const totalCo2SavedKg = records.reduce((s, r) => s + r.co2SavedKg, 0);
  const completedChallenges = records.reduce(
    (s, r) => s + r.completedChallengeIds.length, 0
  );
  const averageScore = Math.round(
    records.reduce((s, r) => s + r.analysis.score, 0) / records.length
  );

  // Streak: consecutive days ending today
  const today = new Date();
  let streak = 0;
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (sorted[i].date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  const weeklyScores = sorted
    .slice(0, 7)
    .reverse()
    .map(r => ({ date: r.date, score: r.analysis.score }));

  return { totalCo2SavedKg, currentStreak: streak, completedChallenges, averageScore, weeklyScores };
}
