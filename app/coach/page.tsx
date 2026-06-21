'use client';

/**
 * @fileoverview AI Coach page.
 */

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { useCarbonStore } from '@/store/useCarbonStore';
import Skeleton from '@/components/ui/Skeleton';
import AppHeader from '@/components/layout/AppHeader';

const AiCoach = dynamic(
  () => import('@/components/features/AiCoach'),
  { loading: () => <Skeleton className="h-[600px] rounded-2xl" />, ssr: false }
);

const NAV_LINKS = [
  { href: '/',          label: 'Check-In',  icon: <ArrowLeft className="w-3.5 h-3.5" /> },
  { href: '/dashboard', label: 'Dashboard' },
];

/** AI Coach page — loads store data and renders the chat interface. */
export default function CoachPage() {
  const today      = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { loadData } = useCarbonStore();

  useEffect(() => {
    loadData(today);
  }, [loadData, today]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader navLinks={NAV_LINKS} />

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Coach</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ask anything about sustainability, carbon reduction, and eco habits.
          </p>
        </div>
        <AiCoach />
      </div>
    </div>
  );
}
