import { memo, ReactNode } from 'react';

interface EmptyStateProps {
  icon:        ReactNode;
  title:       string;
  description: string;
  action?:     ReactNode;
}

/** Beautiful empty state for dashboard sections with no data yet. */
const EmptyState = memo(({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl" aria-hidden="true">
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
