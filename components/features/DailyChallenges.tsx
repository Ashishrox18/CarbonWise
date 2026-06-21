'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Leaf } from 'lucide-react';
import type { EmissionCategory } from '@/types';
import { useCarbonStore } from '@/store/useCarbonStore';
import { selectDailyChallenges } from '@/lib/challenges';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

interface DailyChallengesProps {
  date: string;
}

/**
 * Displays today's three eco challenges with completion toggles.
 * Challenges are derived from today's largest emission contributor.
 */
const DailyChallenges = memo(({ date }: DailyChallengesProps) => {
  const { todayCheckIn, completeChallenge } = useCarbonStore();

  const challenges = useMemo(() => {
    const category: EmissionCategory = todayCheckIn?.analysis.largestContributor ?? 'Transportation';
    return selectDailyChallenges(category, date);
  }, [todayCheckIn, date]);

  if (!todayCheckIn) {
    return (
      <Card>
        <EmptyState
          icon="🌱"
          title="No challenges yet"
          description="Complete today's check-in to unlock your personalised eco challenges."
        />
      </Card>
    );
  }

  const completed = todayCheckIn.completedChallengeIds;
  const allDone   = challenges.every(c => completed.includes(c.id));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-brand-600" aria-hidden="true" />
            Today&apos;s Eco Challenges
          </h2>
          {allDone && (
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400">All done! 🎉</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3" aria-label="Daily eco challenges">
          {challenges.map((challenge, i) => {
            const isDone = completed.includes(challenge.id);
            return (
              <motion.li
                key={challenge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  onClick={() => !isDone && completeChallenge(challenge.id, challenge.co2SavedKg)}
                  disabled={isDone}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    isDone
                      ? 'border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 opacity-75 cursor-default'
                      : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-gray-900'
                  }`}
                  aria-pressed={isDone}
                  aria-label={`${challenge.title}: ${isDone ? 'Completed' : 'Mark as complete'}`}
                >
                  <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">{challenge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDone ? 'text-brand-700 dark:text-brand-300 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                      {challenge.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {challenge.description}
                    </p>
                    <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-1">
                      Saves ~{challenge.co2SavedKg} kg CO₂
                    </p>
                  </div>
                  <AnimatePresence>
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="shrink-0"
                      >
                        <CheckCircle className="w-5 h-5 text-brand-500" />
                      </motion.div>
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                    )}
                  </AnimatePresence>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
});
DailyChallenges.displayName = 'DailyChallenges';

export default DailyChallenges;
