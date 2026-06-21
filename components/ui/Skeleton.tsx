import { memo, HTMLAttributes } from 'react';

/** Skeleton loading placeholder. */
const Skeleton = memo(({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
    aria-hidden="true"
    {...props}
  />
));
Skeleton.displayName = 'Skeleton';

export default Skeleton;
