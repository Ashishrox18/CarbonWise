/**
 * @fileoverview Small status badge component.
 */

import { memo, type HTMLAttributes } from 'react';

/** Visual variant that determines the badge's colour scheme. */
export type BadgeVariant = 'low' | 'medium' | 'high' | 'neutral' | 'success';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour scheme variant (default: `'neutral'`). */
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  low:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium:  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
};

/**
 * Inline status badge. Typically used for footprint level labels.
 *
 * @example
 * ```tsx
 * <Badge variant="high">High Impact</Badge>
 * ```
 */
const Badge = memo(({ variant = 'neutral', className = '', children, ...props }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_STYLES[variant]} ${className}`}
    {...props}
  >
    {children}
  </span>
));
Badge.displayName = 'Badge';

export default Badge;
