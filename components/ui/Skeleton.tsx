/**
 * @fileoverview Loading skeleton placeholder.
 */

import { memo, type HTMLAttributes } from 'react';

/**
 * Animated pulse placeholder used while content is loading.
 * Hidden from assistive technologies via `aria-hidden`.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-24 w-full rounded-2xl" />
 * ```
 */
const Skeleton = memo(({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
    aria-hidden="true"
    {...props}
  />
));
Skeleton.displayName = 'Skeleton';

export default Skeleton;
