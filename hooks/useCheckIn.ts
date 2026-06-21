'use client';

/**
 * @fileoverview Hook encapsulating the daily check-in submission flow.
 *
 * Handles the API call, error recovery, and local store update.
 * On AI failure, the hook falls back to the local carbon estimator so
 * the user always receives a result.
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { CheckInAnswers, CheckInRecord, CarbonAnalysis } from '@/types';
import { useCarbonStore } from '@/store/useCarbonStore';
import { buildFallbackAnalysis } from '@/services/gemini';

/** Return type of {@link useCheckIn}. */
export interface UseCheckInReturn {
  /** Whether a submission is in progress. */
  submitting: boolean;
  /** Non-fatal error message (e.g. AI unavailable), or `null`. */
  error: string | null;
  /**
   * Submits the check-in answers and returns the resulting record.
   * Always resolves — never rejects. Returns `null` only on unexpected errors.
   */
  submit: (answers: CheckInAnswers, date: string) => Promise<CheckInRecord | null>;
}

/**
 * Manages the daily check-in submission lifecycle.
 *
 * @returns Submitting state, non-fatal error, and submit callback.
 */
export function useCheckIn(): UseCheckInReturn {
  const { addCheckIn } = useCarbonStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const submit = useCallback(
    async (answers: CheckInAnswers, date: string): Promise<CheckInRecord | null> => {
      setSubmitting(true);
      setError(null);

      let analysis: CarbonAnalysis;

      try {
        const res = await fetch('/api/analyze', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ answers }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error ?? `Server error ${res.status}`);
        }

        const data = await res.json() as { analysis: CarbonAnalysis };
        analysis = data.analysis;
      } catch (err) {
        // Use the local estimator so the user always sees a result
        console.warn('[useCheckIn] AI unavailable, using local fallback:', err);
        analysis = buildFallbackAnalysis(answers);
        setError('AI analysis unavailable — showing estimated results.');
      }

      const record: CheckInRecord = {
        id:                    uuidv4(),
        date,
        answers,
        analysis,
        completedChallengeIds: [],
        co2SavedKg:            0,
      };

      addCheckIn(record);
      setSubmitting(false);
      return record;
    },
    [addCheckIn]
  );

  return { submitting, error, submit };
}
