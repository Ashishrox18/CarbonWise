'use client';

/**
 * @fileoverview Hook encapsulating the check-in submission flow.
 * Handles the API call, local state, and error recovery.
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CheckInAnswers, CheckInRecord, CarbonAnalysis } from '@/types';
import { useCarbonStore } from '@/store/useCarbonStore';
import { buildFallbackAnalysis } from '@/services/gemini';

interface UseCheckInReturn {
  submitting:  boolean;
  error:       string | null;
  submit:      (answers: CheckInAnswers, date: string) => Promise<CheckInRecord | null>;
}

/**
 * Manages the daily check-in submission.
 *
 * @returns submitting state, error message, and submit function.
 */
export function useCheckIn(): UseCheckInReturn {
  const { addCheckIn } = useCarbonStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Use local fallback so the user always gets a result
        console.warn('[useCheckIn] AI failed, using local fallback:', err);
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
