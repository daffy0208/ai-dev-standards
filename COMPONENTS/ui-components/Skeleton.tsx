/**
 * Skeleton Component
 *
 * Loading skeleton screens for better perceived performance.
 * Supports multiple variants with animated pulse effect.
 *
 * @example
 * ```tsx
 * // Text skeleton
 * <Skeleton variant="text" />
 *
 * // Circle skeleton (for avatars)
 * <Skeleton variant="circle" size="lg" />
 *
 * // Rectangle skeleton (for images, cards)
 * <Skeleton variant="rectangle" width={300} height={200} />
 *
 * // Custom dimensions
 * <Skeleton width="100%" height="40px" />
 *
 * // Without animation
 * <Skeleton variant="text" animation={false} />
 *
 * // Building a skeleton layout
 * <div className="space-y-4">
 *   <div className="flex items-center gap-4">
 *     <Skeleton variant="circle" size="lg" />
 *     <div className="flex-1 space-y-2">
 *       <Skeleton variant="text" width="60%" />
 *       <Skeleton variant="text" width="40%" />
 *     </div>
 *   </div>
 *   <Skeleton variant="rectangle" width="100%" height={200} />
 * </div>
 * ```
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const skeletonVariants = cva('bg-gray-200', {
  variants: {
    variant: {
      text: 'rounded h-4',
      circle: 'rounded-full',
      rectangle: 'rounded-md'
    },
    animation: {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: ''
    },
    size: {
      sm: '',
      md: '',
      lg: '',
      xl: ''
    }
  },
  defaultVariants: {
    variant: 'text',
    animation: 'pulse',
    size: 'md'
  }
})

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof skeletonVariants> {
  /**
   * Width of the skeleton (CSS value)
   */
  width?: string | number

  /**
   * Height of the skeleton (CSS value)
   */
  height?: string | number

  /**
   * Number of lines (for text variant)
   */
  lines?: number
}

// Size maps for circle variant
const circleSizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

// Height maps for text variant
const textHeightMap = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-5',
  xl: 'h-6'
}

/**
 * Skeleton component for loading states
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      animation = 'pulse',
      size = 'md',
      width,
      height,
      lines = 1,
      style,
      ...props
    },
    ref
  ) => {
    // Build inline styles
    const inlineStyles: React.CSSProperties = {
      ...style
    }

    if (width !== undefined) {
      inlineStyles.width = typeof width === 'number' ? `${width}px` : width
    }

    if (height !== undefined) {
      inlineStyles.height = typeof height === 'number' ? `${height}px` : height
    }

    // Apply size-based dimensions for circle variant
    const circleClass = variant === 'circle' ? circleSizeMap[size!] : ''
    const textHeightClass = variant === 'text' ? textHeightMap[size!] : ''

    // Single skeleton
    if (lines <= 1) {
      return (
        <div
          ref={ref}
          className={cn(
            skeletonVariants({ variant, animation }),
            variant === 'circle' && circleClass,
            variant === 'text' && textHeightClass,
            className
          )}
          style={inlineStyles}
          aria-busy="true"
          aria-live="polite"
          role="status"
          {...props}
        >
          <span className="sr-only">Loading...</span>
        </div>
      )
    }

    // Multiple lines (text variant only)
    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          aria-busy="true"
          aria-live="polite"
          role="status"
          {...props}
        >
          <span className="sr-only">Loading...</span>
          {Array.from({ length: lines }, (_, index) => {
            // Make last line shorter (80% width)
            const isLastLine = index === lines - 1
            const lineWidth = isLastLine ? '80%' : width || '100%'

            return (
              <div
                key={index}
                className={cn(skeletonVariants({ variant, animation }), textHeightClass)}
                style={{ width: lineWidth, ...style }}
              />
            )
          })}
        </div>
      )
    }

    return null
  }
)

Skeleton.displayName = 'Skeleton'

/**
 * Pre-built skeleton compositions
 */

/**
 * Avatar skeleton with text
 */
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}> = ({ size = 'md', showText = true, className }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <Skeleton variant="circle" size={size} animation="pulse" />
    {showText && (
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    )}
  </div>
)

SkeletonAvatar.displayName = 'SkeletonAvatar'

/**
 * Card skeleton
 */
export const SkeletonCard: React.FC<{
  className?: string
}> = ({ className }) => (
  <div className={cn('border border-gray-200 rounded-lg p-4 space-y-4', className)}>
    <Skeleton variant="rectangle" width="100%" height={200} />
    <div className="space-y-2">
      <Skeleton variant="text" width="80%" size="lg" />
      <Skeleton variant="text" lines={3} />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="text" width="20%" />
    </div>
  </div>
)

SkeletonCard.displayName = 'SkeletonCard'

/**
 * Table row skeleton
 */
export const SkeletonTableRow: React.FC<{
  columns?: number
  className?: string
}> = ({ columns = 4, className }) => (
  <div className={cn('flex items-center gap-4 py-3', className)}>
    {Array.from({ length: columns }, (_, index) => (
      <Skeleton key={index} variant="text" className="flex-1" />
    ))}
  </div>
)

SkeletonTableRow.displayName = 'SkeletonTableRow'

/**
 * List item skeleton
 */
export const SkeletonListItem: React.FC<{
  showAvatar?: boolean
  className?: string
}> = ({ showAvatar = true, className }) => (
  <div className={cn('flex items-center gap-3 py-3', className)}>
    {showAvatar && <Skeleton variant="circle" size="md" />}
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="50%" size="sm" />
    </div>
  </div>
)

SkeletonListItem.displayName = 'SkeletonListItem'

// Add shimmer animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    .animate-shimmer {
      background: linear-gradient(
        90deg,
        #e5e7eb 0%,
        #f3f4f6 50%,
        #e5e7eb 100%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite linear;
    }
  `
  document.head.appendChild(style)
}
