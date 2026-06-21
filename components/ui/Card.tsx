/**
 * @fileoverview Card layout primitives — surface container, header, content, and footer.
 */

import { memo, type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Base card container with consistent surface styling.
 * Accepts all native `div` props for maximum flexibility.
 */
export const Card = memo(({ className = '', children, ...props }: CardProps) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

/**
 * Card header section with a bottom border.
 * Typically used for titles and actions.
 */
export const CardHeader = memo(({ className = '', children, ...props }: CardProps) => (
  <div
    className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

/**
 * Main card body with standard horizontal and vertical padding.
 */
export const CardContent = memo(({ className = '', children, ...props }: CardProps) => (
  <div className={`px-6 py-5 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

/**
 * Card footer section with a top border and subtle background.
 * Typically used for secondary actions or metadata.
 */
export const CardFooter = memo(({ className = '', children, ...props }: CardProps) => (
  <div
    className={`px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
