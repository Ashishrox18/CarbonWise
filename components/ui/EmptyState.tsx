/**
 * @fileoverview Empty state placeholder for sections with no data.
 */

import { memo, type ReactNode } from 'react';

interface EmptyStateProps {
  /** Icon or emoji displayed prominently in the centre. */
  icon: ReactNode;
  /** Short title describing why the section is empty. */
  title: string;
  /** Longer description with guidance on how to populate the section. */
  description: string;
  /** Optional CTA button or link rendered below the description. */
  action?: ReactNode;
}

/**
 * Centred empty state with icon, title, description, and optional action.
 * Used in dashboard sections before the user has any check-in data.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<TrendingDown className="w-8 h-8" />}
 *   title="No data yet"
 *   description="Complete your first check-in to see your progress."
 * />
 * ```
 */
const EmptyState = memo(({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
    <div
      className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl"
      aria-hidden="true"
    >
      {icon}
    </div>
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
));
EmptyState.displayName = 'EmptyState';

export default EmptyState;
