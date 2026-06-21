'use client';

/**
 * @fileoverview Accessible, multi-variant button component.
 */

import { memo, forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

/** Visual style variants for the Button. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Size variants for the Button. */
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant (default: `'primary'`). */
  variant?: ButtonVariant;
  /** Size variant (default: `'md'`). */
  size?: ButtonSize;
  /** When `true`, shows a spinner and sets `aria-busy`. Disables the button. */
  isLoading?: boolean;
  /** Icon rendered to the left of the label text. */
  leftIcon?: ReactNode;
  /** Icon rendered to the right of the label text. */
  rightIcon?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
  secondary: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750',
  ghost:     'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

const BASE_STYLES =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:pointer-events-none';

/**
 * Primary button component. Supports variants, sizes, loading state, and icons.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleSubmit} isLoading={submitting}>
 *   Submit
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size    = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      aria-busy={isLoading ?? undefined}
      disabled={isLoading ?? disabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  )
);
Button.displayName = 'Button';

export default memo(Button);
