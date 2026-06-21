'use client';

/**
 * @fileoverview Progress dashboard page.
 *
 * Shows a 7-day carbon score trend, KPI stats, and today's eco challenges.
 */

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { useCarbonStore } from '@/store/useCarbonStore';
import Skeleton from '@/components/ui/Skeleton';
import AppHeader from '@/components/layout/AppHeader';

const ProgressDashboard = dynamic(
  () => import('@/components/features/ProgressDashboard'),
  { loading: () => <DashboardSkeleton />, ssr: false }
);
const DailyChallenges = dynamic(
  () => import('@/components/features/DailyChallenges'),
  { ssr: false }
);

/** Skeleton placeholder while ProgressDashboard loads. */
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

const NAV_LINKS = [
  { href: '/',       label: 'Check-In', icon: <ArrowLeft className="w-3.5 h-3.5" /> },
  { href: '/coach',  label: 'AI Coach' },
];

/** Dashboard page — loads store data and renders progress components. */
export default function DashboardPage() {
  const today      = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { loadData } = useCarbonStore();

  useEffect(() => {
    loadData(today);
  }, [loadData, today]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader navLinks={NAV_LINKS} />

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your carbon footprint trend and eco challenge streak.
          </p>
        </div>

        <ProgressDashboard />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today&apos;s Challenges
          </h2>
          <DailyChallenges date={today} />
        </div>
      </div>
    </div>
  );
}
