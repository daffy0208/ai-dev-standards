/**
 * Error Fallback Components
 *
 * Reusable error display components for different error scenarios.
 *
 * Features:
 * - API error display
 * - Network error display
 * - Permission error display
 * - Generic error display
 * - Retry functionality
 * - User-friendly messages
 *
 * Usage:
 * ```typescript
 * import { APIError, NetworkError } from './ErrorFallback'
 *
 * {error && <APIError error={error} onRetry={handleRetry} />}
 * {!online && <NetworkError />}
 * ```
 */

'use client'

export interface ErrorFallbackProps {
  error: Error | string
  onRetry?: () => void | Promise<void>
  title?: string
  message?: string
}

/**
 * Generic error display
 */
export function ErrorFallback({
  error,
  onRetry,
  title = "Something went wrong",
  message
}: ErrorFallbackProps) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message || errorMessage}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * API error display
 */
export function APIError({
  error,
  onRetry,
  statusCode
}: ErrorFallbackProps & { statusCode?: number }) {
  const getTitle = () => {
    if (statusCode === 401) return "Authentication Required"
    if (statusCode === 403) return "Access Denied"
    if (statusCode === 404) return "Not Found"
    if (statusCode === 429) return "Too Many Requests"
    if (statusCode && statusCode >= 500) return "Server Error"
    return "Request Failed"
  }

  const getMessage = () => {
    if (statusCode === 401) return "Please sign in to continue"
    if (statusCode === 403) return "You don't have permission to access this resource"
    if (statusCode === 404) return "The requested resource could not be found"
    if (statusCode === 429) return "Please slow down and try again in a moment"
    if (statusCode && statusCode >= 500) return "Our servers are experiencing issues. Please try again later"
    return typeof error === 'string' ? error : error.message
  }

  return (
    <ErrorFallback
      error={error}
      onRetry={statusCode !== 401 && statusCode !== 403 ? onRetry : undefined}
      title={getTitle()}
      message={getMessage()}
    />
  )
}

/**
 * Network error display
 */
export function NetworkError({ onRetry }: { onRetry?: () => void | Promise<void> }) {
  return (
    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">No Internet Connection</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Please check your internet connection and try again.</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Permission error display
 */
export function PermissionError({ resource }: { resource?: string }) {
  return (
    <div className="rounded-lg bg-orange-50 border border-orange-200 p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-orange-800">Permission Denied</h3>
          <div className="mt-2 text-sm text-orange-700">
            <p>
              You don't have permission to access {resource || 'this resource'}.
              Please contact your administrator if you believe this is an error.
            </p>
          </div>
          <div className="mt-4">
            <a
              href="/"
              className="text-sm font-medium text-orange-800 hover:text-orange-900 underline"
            >
              Go to homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading error (with skeleton)
 */
export function LoadingError({ onRetry }: { onRetry?: () => void | Promise<void> }) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-800">Failed to Load</h3>
          <div className="mt-2 text-sm text-gray-700">
            <p>The content failed to load. This might be due to a network issue or server error.</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="text-sm font-medium text-gray-800 hover:text-gray-900 underline"
              >
                Reload
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Inline error (smaller, less intrusive)
 */
export function InlineError({ error, onRetry }: ErrorFallbackProps) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="flex-1">{errorMessage}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-700 hover:text-red-800 font-medium underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}

/**
 * Empty state (when no data is available)
 */
export function EmptyState({
  title = "No data",
  message = "There's nothing here yet",
  icon,
  action
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
        {icon || (
          <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {action}
    </div>
  )
}

/**
 * Example usage
 */
export function Examples() {
  return (
    <div className="space-y-6 p-6">
      <ErrorFallback
        error={new Error("Something went wrong")}
        onRetry={() => console.log('Retrying...')}
      />

      <APIError
        error={new Error("Unauthorized")}
        statusCode={401}
      />

      <NetworkError onRetry={() => console.log('Checking connection...')} />

      <PermissionError resource="admin dashboard" />

      <LoadingError onRetry={() => console.log('Reloading...')} />

      <InlineError
        error="Invalid email format"
        onRetry={() => console.log('Retrying...')}
      />

      <EmptyState
        title="No messages"
        message="You don't have any messages yet"
        action={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Compose Message
          </button>
        }
      />
    </div>
  )
}
