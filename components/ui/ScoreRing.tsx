'use client';

/**
 * @fileoverview Animated circular carbon score ring.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  /** Score value from 0 (best) to 100 (worst). */
  score: number;
  /** Diameter of the ring in pixels (default: 140). */
  size?: number;
  /** Width of the ring stroke in pixels (default: 10). */
  strokeWidth?: number;
  /** Optional caption rendered below the ring. */
  label?: string;
}

/** Returns the brand colour for a given score value. */
function getScoreColor(score: number): string {
  if (score <= 33) return '#22c55e';
  if (score <= 66) return '#f59e0b';
  return '#ef4444';
}

/** Returns a human-readable impact level label for a given score. */
function getScoreLevel(score: number): string {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
}

/**
 * Animated SVG ring that visualises a carbon score from 0 to 100.
 * Respects `prefers-reduced-motion` via the global CSS override.
 *
 * @param score - The carbon score (0–100).
 * @param size - Ring diameter in pixels.
 * @param strokeWidth - Ring stroke width in pixels.
 * @param label - Optional figcaption text below the ring.
 */
const ScoreRing = memo(({ score, size = 140, strokeWidth = 10, label }: ScoreRingProps) => {
  const radius       = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (score / 100) * circumference;
  const color        = getScoreColor(score);
  const level        = getScoreLevel(score);

  return (
    <figure
      className="flex flex-col items-center gap-2"
      aria-label={`Carbon score: ${score} — ${level} impact`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-hidden="true">
          {/* Track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              filter: `drop-shadow(0 0 6px ${color}60)`,
            }}
          />
        </svg>

        {/* Centre label */}
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
