'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;  // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function scoreColor(score: number): string {
  if (score <= 33) return '#22c55e';
  if (score <= 66) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
}

/**
 * Animated circular score ring.
 * Respects prefers-reduced-motion via CSS.
 */
const ScoreRing = memo(({ score, size = 140, strokeWidth = 10, label }: ScoreRingProps) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  const level = scoreLabel(score);

  return (
    <figure className="flex flex-col items-center gap-2" aria-label={`Carbon score: ${score} — ${level} impact`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-hidden="true">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{level}</span>
        </div>
      </div>
      {label && (
        <figcaption className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {label}
        </figcaption>
      )}
    </figure>
  );
});
ScoreRing.displayName = 'ScoreRing';

export default ScoreRing;
