/**
 * Loading Spinner Components
 *
 * Collection of loading indicators for different use cases.
 *
 * Features:
 * - Multiple spinner styles
 * - Size variants
 * - Color variants
 * - Full-screen overlay
 * - Inline loading
 * - ADHD-friendly (clear, not distracting)
 *
 * Usage:
 * ```typescript
 * import { Spinner, LoadingOverlay, InlineLoading } from './LoadingSpinner'
 *
 * {loading && <Spinner />}
 * {loading && <LoadingOverlay message="Saving..." />}
 * <InlineLoading text="Loading data..." />
 * ```
 */

'use client'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerColor = 'blue' | 'green' | 'red' | 'gray' | 'white'

export interface SpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  className?: string
}

/**
 * Basic spinner
 */
export function Spinner({ size = 'md', color = 'blue', className = '' }: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  }

  const colorClasses = {
    blue: 'border-blue-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    red: 'border-red-500 border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Spinner with text
 */
export function SpinnerWithText({
  text = 'Loading...',
  size = 'md',
  color = 'blue'
}: SpinnerProps & { text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Spinner size={size} color={color} />
      <span className="text-gray-600">{text}</span>
    </div>
  )
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({
  message = 'Loading...',
  transparent = false
}: {
  message?: string
  transparent?: boolean
}) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      transparent ? 'bg-white/60 backdrop-blur-sm' : 'bg-white'
    }`}>
      <div className="text-center">
        <Spinner size="lg" color="blue" />
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
}

/**
 * Inline loading (for content areas)
 */
export function InlineLoading({
  text = 'Loading...',
  size = 'md'
}: {
  text?: string
  size?: SpinnerSize
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size={size} color="blue" />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  )
}

/**
 * Button loading state
 */
export function LoadingButton({
  loading,
  children,
  disabled,
  ...props
}: {
  loading: boolean
  children: React.ReactNode
  disabled?: boolean
  [key: string]: any
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`relative ${props.className || ''}`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="white" />
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  )
}

/**
 * Dots loading indicator (alternative style)
 */
export function DotsLoading({ color = 'blue' }: { color?: SpinnerColor }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
    white: 'bg-white'
  }

  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`h-2 w-2 rounded-full ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`h-2 w-2 rounded-full ${colorClasses[color]} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  )
}

/**
 * Pulse loading indicator (alternative style)
 */
export function PulseLoading() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="h-3 w-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="h-3 w-3 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  )
}

/**
 * Progress bar loading
 */
export function ProgressBar({
  progress,
  color = 'blue'
}: {
  progress: number
  color?: SpinnerColor
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
    white: 'bg-white'
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full ${colorClasses[color]} transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

/**
 * Examples
 */
export function LoadingExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="font-medium mb-4">Basic Spinners</h3>
        <div className="flex items-center gap-4">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Colors</h3>
        <div className="flex items-center gap-4">
          <Spinner color="blue" />
          <Spinner color="green" />
          <Spinner color="red" />
          <Spinner color="gray" />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">With Text</h3>
        <SpinnerWithText text="Loading data..." />
      </div>

      <div>
        <h3 className="font-medium mb-4">Inline Loading</h3>
        <div className="border rounded-lg">
          <InlineLoading text="Fetching results..." />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Dots Loading</h3>
        <DotsLoading />
      </div>

      <div>
        <h3 className="font-medium mb-4">Pulse Loading</h3>
        <PulseLoading />
      </div>

      <div>
        <h3 className="font-medium mb-4">Progress Bar</h3>
        <ProgressBar progress={65} />
      </div>

      <div>
        <h3 className="font-medium mb-4">Loading Button</h3>
        <LoadingButton
          loading={true}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Save Changes
        </LoadingButton>
      </div>
    </div>
  )
}
