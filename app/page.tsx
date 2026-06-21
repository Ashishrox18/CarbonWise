'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Leaf, TrendingDown, Shield, Zap, ArrowRight, RotateCcw } from 'lucide-react';
import type { CheckInAnswers, CheckInRecord } from '@/types';
import { useCarbonStore } from '@/store/useCarbonStore';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import ToastContainer from '@/components/ui/ToastContainer';

// Dynamic imports for heavy feature components
const CheckInForm    = dynamic(() => import('@/components/features/CheckInForm'),    { loading: () => <FormSkeleton /> });
const AnalysisCard   = dynamic(() => import('@/components/features/AnalysisCard'),   { loading: () => <AnalysisSkeleton /> });
const DailyChallenges = dynamic(() => import('@/components/features/DailyChallenges'), { ssr: false });

// ─── Skeleton helpers ─────────────────────────────────────────────

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

// ─── Landing Hero ──────────────────────────────────────────────────

function LandingHero({ onStart }: { onStart: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center gap-8 py-16 px-4"
      aria-labelledby="hero-title"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
          <Leaf className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">CarbonWise</span>
      </div>

      {/* Headline */}
      <div className="max-w-xl">
        <h1 id="hero-title" className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          Small daily actions.<br />
          <span className="text-brand-500">Big climate impact.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Understand your carbon footprint in under 3 minutes and get AI-powered recommendations tailored to your lifestyle.
        </p>
      </div>

      <Button onClick={onStart} size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
        Start Today's Check-In
      </Button>

      {/* Value props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl mt-4">
        {[
          { icon: <Zap     className="w-5 h-5 text-amber-500"  />, label: 'Under 3 minutes',       desc: 'Quick daily habit' },
          { icon: <TrendingDown className="w-5 h-5 text-brand-500" />, label: 'AI-powered insights',  desc: 'Personalised for you' },
          { icon: <Shield  className="w-5 h-5 text-blue-500"   />, label: '100% private',           desc: 'Stored locally only' },
        ].map(({ icon, label, desc }) => (
          <Card key={label}>
            <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                {icon}
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

type PageView = 'landing' | 'checkin' | 'result';

export default function HomePage() {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { loadData, todayCheckIn } = useCarbonStore();
  const { submitting, error: checkInError, submit } = useCheckIn();
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  const [view, setView] = useState<PageView>('landing');
  const [result, setResult] = useState<CheckInRecord | null>(null);

  useEffect(() => {
    loadData(today);
  }, [loadData, today]);

  // If already checked in today, jump straight to result
  useEffect(() => {
    if (todayCheckIn) {
      setResult(todayCheckIn);
      setView('result');
    }
  }, [todayCheckIn]);

  // Surface AI errors as toasts (non-blocking)
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
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <Leaf className="w-5 h-5 text-brand-600" aria-hidden="true" />
            CarbonWise
          </Link>
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              Dashboard
            </Link>
            <Link href="/coach" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              AI Coach
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Carbon Check-In</h1>
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
                    {new Date(today).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRedo} leftIcon={<RotateCcw className="w-4 h-4" />}>
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
