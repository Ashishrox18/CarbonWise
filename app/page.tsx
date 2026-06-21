'use client';

/**
 * @fileoverview Home page — landing, check-in form, and results view.
 */

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import type { CheckInAnswers, CheckInRecord } from '@/types';
import { useCarbonStore } from '@/store/useCarbonStore';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ToastContainer from '@/components/ui/ToastContainer';
import AppHeader from '@/components/layout/AppHeader';
import LandingHero from '@/components/features/LandingHero';

// Dynamic imports for heavy feature components
const CheckInForm     = dynamic(() => import('@/components/features/CheckInForm'),    { loading: () => <FormSkeleton /> });
const AnalysisCard    = dynamic(() => import('@/components/features/AnalysisCard'),   { loading: () => <AnalysisSkeleton /> });
const DailyChallenges = dynamic(() => import('@/components/features/DailyChallenges'), { ssr: false });

// ─── Skeleton Placeholders ────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}

// ─── Page View State ──────────────────────────────────────────────

type PageView = 'landing' | 'checkin' | 'result';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/coach',     label: 'AI Coach' },
];

// ─── Main Page ────────────────────────────────────────────────────

/** Home page — manages the three-view flow: landing → check-in → results. */
export default function HomePage() {
  const today                                 = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { loadData, todayCheckIn }            = useCarbonStore();
  const { submitting, error: checkInError, submit } = useCheckIn();
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  const [view,   setView]   = useState<PageView>('landing');
  const [result, setResult] = useState<CheckInRecord | null>(null);

  useEffect(() => {
    loadData(today);
  }, [loadData, today]);

  // If already checked in today, jump straight to the result view
  useEffect(() => {
    if (todayCheckIn) {
      setResult(todayCheckIn);
      setView('result');
    }
  }, [todayCheckIn]);

  // Surface non-fatal AI errors as informational toasts
  useEffect(() => {
    if (checkInError) showToast(checkInError, 'info');
  }, [checkInError, showToast]);

  async function handleCheckInComplete(answers: CheckInAnswers) {
    const record = await submit(answers, today);
    if (record) {
      setResult(record);
      setView('result');
      showToast('Analysis complete! Here are your insights.', 'success');
    } else {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  function handleRedo() {
    setView('checkin');
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader navLinks={NAV_LINKS} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LandingHero onStart={() => setView('checkin')} />
            </motion.div>
          )}

          {view === 'checkin' && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-4"
            >
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Today&apos;s Carbon Check-In
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Answer 5 quick questions about your day.
                </p>
              </div>
              <CheckInForm onComplete={handleCheckInComplete} isSubmitting={submitting} />
            </motion.div>
          )}

          {view === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Results</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(today).toLocaleDateString('en', {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Redo
                </Button>
              </div>

              <AnalysisCard analysis={result.analysis} />
              <DailyChallenges date={today} />

              <div className="flex gap-3 pt-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="secondary" className="w-full">View Progress Dashboard</Button>
                </Link>
                <Link href="/coach" className="flex-1">
                  <Button className="w-full">Chat with AI Coach</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}


