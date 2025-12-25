/**
 * Progress Component
 *
 * Progress bars and circular indicators for showing completion status.
 * Supports determinate and indeterminate states with multiple variants.
 *
 * @example
 * ```tsx
 * // Linear progress bar
 * <Progress
 *   value={75}
 *   label="Upload Progress"
 * />
 *
 * // Circular progress
 * <Progress
 *   variant="circular"
 *   value={60}
 *   size="lg"
 * />
 *
 * // Indeterminate (loading)
 * <Progress
 *   indeterminate
 *   label="Loading..."
 * />
 *
 * // With percentage label
 * <Progress
 *   value={45}
 *   showValue
 *   color="success"
 * />
 * ```
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const progressVariants = cva('transition-all duration-300', {
  variants: {
    variant: {
      linear: 'w-full',
      circular: 'flex items-center justify-center'
    },
    color: {
      primary: '',
      success: '',
      warning: '',
      error: '',
      info: ''
    },
    size: {
      sm: '',
      md: '',
      lg: ''
    }
  },
  defaultVariants: {
    variant: 'linear',
    color: 'primary',
    size: 'md'
  }
})

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressVariants> {
  /**
   * Progress value (0-100)
   */
  value?: number

  /**
   * Label for the progress
   */
  label?: string

  /**
   * Show percentage value
   */
  showValue?: boolean

  /**
   * Indeterminate (loading) state
   */
  indeterminate?: boolean
}

// Color maps for linear progress
const linearColorMap = {
  primary: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
  info: 'bg-cyan-600'
}

// Color maps for circular progress
const circularColorMap = {
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-cyan-600'
}

// Size maps for circular progress
const circularSizeMap = {
  sm: { size: 40, strokeWidth: 4 },
  md: { size: 64, strokeWidth: 6 },
  lg: { size: 96, strokeWidth: 8 }
}

/**
 * Progress component for showing completion status
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      variant = 'linear',
      color = 'primary',
      size = 'md',
      value = 0,
      label,
      showValue = false,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const progressId = React.useId()
    const normalizedValue = Math.max(0, Math.min(100, value))

    // Linear progress variant
    if (variant === 'linear') {
      const heightMap = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
      }

      return (
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {/* Label and value */}
          {(label || showValue) && (
            <div className="flex items-center justify-between mb-2">
              {label && (
                <label htmlFor={progressId} className="text-sm font-medium text-gray-700">
                  {label}
                </label>
              )}
              {showValue && !indeterminate && (
                <span className="text-sm text-gray-500">{normalizedValue}%</span>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div
            id={progressId}
            role="progressbar"
            aria-valuenow={indeterminate ? undefined : normalizedValue}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label || 'Progress'}
            className={cn('w-full rounded-full bg-gray-200 overflow-hidden', heightMap[size!])}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                linearColorMap[color!],
                indeterminate && 'animate-pulse'
              )}
              style={{
                width: indeterminate ? '100%' : `${normalizedValue}%`,
                animation: indeterminate ? 'indeterminate 1.5s ease-in-out infinite' : undefined
              }}
            />
          </div>

          {/* Indeterminate animation */}
          {indeterminate && (
            <style>{`
              @keyframes indeterminate {
                0% {
                  transform: translateX(-100%);
                }
                50% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
            `}</style>
          )}
        </div>
      )
    }

    // Circular progress variant
    if (variant === 'circular') {
      const { size: svgSize, strokeWidth } = circularSizeMap[size!]
      const radius = (svgSize - strokeWidth) / 2
      const circumference = 2 * Math.PI * radius
      const offset = circumference - (normalizedValue / 100) * circumference

      return (
        <div
          ref={ref}
          className={cn(
            progressVariants({ variant, color, size }),
            'relative inline-flex',
            className
          )}
          {...props}
        >
          <svg
            width={svgSize}
            height={svgSize}
            className="transform -rotate-90"
            role="progressbar"
            aria-valuenow={indeterminate ? undefined : normalizedValue}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label || 'Progress'}
          >
            {/* Background circle */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-gray-200"
            />

            {/* Progress circle */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={indeterminate ? 0 : offset}
              strokeLinecap="round"
              className={cn(
                circularColorMap[color!],
                'transition-all duration-300',
                indeterminate && 'animate-spin'
              )}
              style={{
                strokeDasharray: indeterminate
                  ? `${circumference * 0.25} ${circumference * 0.75}`
                  : circumference
              }}
            />
          </svg>

          {/* Value label */}
          {showValue && !indeterminate && (
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center font-semibold',
                circularColorMap[color!],
                {
                  'text-xs': size === 'sm',
                  'text-sm': size === 'md',
                  'text-base': size === 'lg'
                }
              )}
            >
              {normalizedValue}%
            </span>
          )}

          {/* Label below */}
          {label && (
            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
              {label}
            </p>
          )}
        </div>
      )
    }

    return null
  }
)

Progress.displayName = 'Progress'
