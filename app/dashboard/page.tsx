'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';
import { useCarbonStore } from '@/store/useCarbonStore';
import Skeleton from '@/components/ui/Skeleton';

const ProgressDashboard = dynamic(
  () => import('@/components/features/ProgressDashboard'),
  { loading: () => <DashboardSkeleton />, ssr: false }
);
const DailyChallenges = dynamic(
  () => import('@/components/features/DailyChallenges'),
  { ssr: false }
);

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export default function DashboardPage() {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { loadData } = useCarbonStore();

  useEffect(() => {
    loadData(today);
  }, [loadData, today]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-brand-600 transition-colors">
            <Leaf className="w-5 h-5 text-brand-600" aria-hidden="true" />
            CarbonWise
          </Link>
          <nav aria-label="Secondary navigation" className="flex gap-1">
            <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Check-In
            </Link>
            <Link href="/coach" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              AI Coach
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your carbon footprint trend and eco challenge streak.
          </p>
        </div>

        <ProgressDashboard />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today&apos;s Challenges</h2>
          <DailyChallenges date={today} />
        </div>
      </div>
    </div>
  );
}
