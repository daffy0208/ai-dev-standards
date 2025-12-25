/**
 * Badge Component
 *
 * Status badges and labels for displaying tags, counts, and status indicators.
 * Supports multiple variants, sizes, and styles.
 *
 * @example
 * ```tsx
 * // Basic badge
 * <Badge>New</Badge>
 *
 * // Status variants
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="error">Failed</Badge>
 *
 * // Sizes
 * <Badge size="sm">Small</Badge>
 * <Badge size="lg">Large</Badge>
 *
 * // Dot variant
 * <Badge variant="success" dot>Online</Badge>
 *
 * // Pill shape
 * <Badge pill>Badge</Badge>
 *
 * // With icon
 * <Badge>
 *   <CheckIcon className="w-3 h-3 mr-1" />
 *   Verified
 * </Badge>
 * ```
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const badgeVariants = cva('inline-flex items-center justify-center font-medium transition-colors', {
  variants: {
    variant: {
      default: 'bg-gray-100 text-gray-800 border border-gray-200',
      primary: 'bg-blue-100 text-blue-800 border border-blue-200',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
      outline: 'bg-transparent border border-gray-300 text-gray-700'
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    },
    shape: {
      rounded: 'rounded',
      pill: 'rounded-full'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    shape: 'rounded'
  }
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Show status dot indicator
   */
  dot?: boolean

  /**
   * Pill shape (fully rounded)
   */
  pill?: boolean
}

/**
 * Badge component for status indicators and labels
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      shape = 'rounded',
      dot = false,
      pill = false,
      children,
      ...props
    },
    ref
  ) => {
    const finalShape = pill ? 'pill' : shape

    // Dot color map
    const dotColorMap = {
      default: 'bg-gray-500',
      primary: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-cyan-500',
      outline: 'bg-gray-500'
    }

    // Dot size map
    const dotSizeMap = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5'
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, shape: finalShape }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn('rounded-full mr-1.5', dotSizeMap[size!], dotColorMap[variant!])}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
