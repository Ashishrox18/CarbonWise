'use client';

/**
 * @fileoverview Progress dashboard showing score trend, streak, CO₂ saved, and challenge count.
 */

import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  type TooltipProps,
} from 'recharts';
import { Flame, Award, CloudOff, TrendingDown } from 'lucide-react';
import { useCarbonStore } from '@/store/useCarbonStore';
import { computeProgressStats } from '@/lib/storage';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

// ─── Sub-components ───────────────────────────────────────────────

interface StatCardProps {
  label:  string;
  value:  string;
  icon:   React.ReactNode;
  sub?:   string;
  color?: string;
}

/** A single KPI tile displaying a label, bold value, optional sub-text, and icon. */
const StatCard = memo(({ label, value, icon, sub, color = 'text-brand-600' }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center gap-4 py-4">
      <div className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = 'StatCard';

/** Custom tooltip component for the Recharts LineChart. */
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <p className="text-brand-600 font-bold">{payload[0].value} score</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

/**
 * Full progress dashboard: KPI grid and 7-day carbon score trend chart.
 */
const ProgressDashboard = memo(() => {
  const checkIns = useCarbonStore(s => s.checkIns);
  const stats    = useMemo(() => computeProgressStats(checkIns), [checkIns]);
  const hasData  = checkIns.length > 0;

  const chartData = useMemo(
    () => stats.weeklyScores.map(d => ({
      date:  new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      score: d.score,
    })),
    [stats.weeklyScores]
  );

  if (!hasData) {
    return (
      <Card>
        <EmptyState
          icon={<TrendingDown className="w-8 h-8" />}
          title="No data yet"
          description="Complete your first daily check-in to start tracking your progress."
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Streak"
          value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`}
          icon={<Flame className="w-5 h-5" />}
          sub={stats.currentStreak > 0 ? 'Keep it up!' : 'Start today'}
          color="text-orange-500"
        />
        <StatCard
          label="CO₂ Saved"
          value={`${stats.totalCo2SavedKg.toFixed(1)} kg`}
          icon={<CloudOff className="w-5 h-5" />}
          sub="from challenges"
          color="text-brand-600"
        />
        <StatCard
          label="Challenges Done"
          value={String(stats.completedChallenges)}
          icon={<Award className="w-5 h-5" />}
          sub="eco actions taken"
          color="text-purple-600"
        />
        <StatCard
          label="Avg Score"
          value={`${stats.averageScore}/100`}
          icon={<TrendingDown className="w-5 h-5" />}
          sub="lower is better"
          color="text-blue-600"
        />
      </div>

      {/* Score Trend Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            7-Day Carbon Score Trend
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Lower is better</p>
        </CardHeader>
        <CardContent>
          {chartData.length < 2 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              Check in for 2 more days to see your trend.
            </p>
          ) : (
            <div className="h-48" aria-label="Carbon score trend chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
ProgressDashboard.displayName = 'ProgressDashboard';

export default ProgressDashboard;
