'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Target, Lightbulb } from 'lucide-react';
import type { CarbonAnalysis, EmissionCategory } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import ScoreRing from '@/components/ui/ScoreRing';
import Badge from '@/components/ui/Badge';

interface AnalysisCardProps {
  analysis: CarbonAnalysis;
}

const CATEGORY_COLORS: Record<EmissionCategory, string> = {
  Transportation: '#3b82f6',
  Food:           '#f97316',
  Electricity:    '#eab308',
  Shopping:       '#8b5cf6',
  Waste:          '#6b7280',
};

/**
 * Displays the full Gemini carbon analysis result.
 * Includes score ring, category breakdown, top actions, and weekly goal.
 */
const AnalysisCard = memo(({ analysis }: AnalysisCardProps) => {
  const totalKg = Object.values(analysis.categoryBreakdown).reduce((s, v) => s + v, 0);

  const footprintVariant = {
    Low:    'low',
    Medium: 'medium',
    High:   'high',
  }[analysis.footprint] as 'low' | 'medium' | 'high';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      {/* Score + Summary */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={analysis.score} label="Carbon Score" />
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Today&apos;s Footprint</h2>
              <Badge variant={footprintVariant}>{analysis.footprint} Impact</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Largest contributor: <span className="font-semibold text-gray-700 dark:text-gray-300">{analysis.largestContributor}</span>
              {' · '}{totalKg.toFixed(1)} kg CO₂e today
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-brand-600" aria-hidden="true" />
            Emission Breakdown
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3" role="list" aria-label="Emission categories">
            {(Object.entries(analysis.categoryBreakdown) as [EmissionCategory, number][])
              .sort(([, a], [, b]) => b - a)
              .map(([category, kg]) => {
                const pct = totalKg > 0 ? (kg / totalKg) * 100 : 0;
                return (
                  <div key={category} role="listitem">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                        {kg.toFixed(1)} kg CO₂e
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden" aria-hidden="true">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[category] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Top Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
            Personalised Recommendations
          </h3>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-3" aria-label="Recommended actions">
            {analysis.topActions.map((action, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{action}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card className="border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
        <CardContent className="flex gap-3">
          <Target className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide mb-1">
              Your Weekly Goal
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.weeklyGoal}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
AnalysisCard.displayName = 'AnalysisCard';

export default AnalysisCard;
