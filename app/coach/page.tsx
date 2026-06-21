'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';
import { useCarbonStore } from '@/store/useCarbonStore';
import Skeleton from '@/components/ui/Skeleton';

const AiCoach = dynamic(
  () => import('@/components/features/AiCoach'),
  { loading: () => <Skeleton className="h-[600px] rounded-2xl" />, ssr: false }
);

export default function CoachPage() {
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
            <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

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
