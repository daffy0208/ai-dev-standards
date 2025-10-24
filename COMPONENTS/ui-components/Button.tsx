/**
 * Button Component
 *
 * Reusable button component with variants, sizes, and states.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * <Button variant="secondary" size="lg" loading>
 *   Loading...
 * </Button>
 *
 * <Button variant="outline" size="sm" disabled>
 *   Disabled
 * </Button>
 * ```
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
        secondary:
          'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-600',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400',
        ghost:
          'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        link:
          'bg-transparent underline-offset-4 hover:underline text-blue-600',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Show loading spinner
   */
  loading?: boolean

  /**
   * Icon to display before children
   */
  leftIcon?: React.ReactNode

  /**
   * Icon to display after children
   */
  rightIcon?: React.ReactNode

  /**
   * Make button full width
   */
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
