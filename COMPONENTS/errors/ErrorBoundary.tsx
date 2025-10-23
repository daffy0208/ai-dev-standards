/**
 * Error Boundary Component
 *
 * React error boundary to catch and handle errors gracefully.
 *
 * Features:
 * - Catches React component errors
 * - Custom error display
 * - Error logging integration
 * - Reset functionality
 * - Development vs production modes
 *
 * Usage:
 * ```typescript
 * import { ErrorBoundary } from './ErrorBoundary'
 *
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */

'use client'

import { Component, ReactNode, ErrorInfo } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: any[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo)
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to error tracking service (e.g., Sentry)
    // Example:
    // import * as Sentry from '@sentry/react'
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })

    this.setState({
      errorInfo
    })
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error boundary when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys![index])
    ) {
      this.resetError()
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetError)
        }
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-center text-gray-600 mb-6">
              We're sorry, but an unexpected error occurred. Please try again.
            </p>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6">
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="font-medium text-gray-900 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Error:</p>
                      <pre className="mt-1 text-xs bg-red-50 text-red-900 p-2 rounded overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Component Stack:</p>
                        <pre className="mt-1 text-xs bg-gray-100 text-gray-900 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    {this.state.error.stack && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Stack Trace:</p>
                        <pre className="mt-1 text-xs bg-gray-100 text-gray-900 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.resetError}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-md transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Support Link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              If this problem persists,{' '}
              <a href="/support" className="text-blue-600 hover:text-blue-800 font-medium">
                contact support
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Functional wrapper for error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function ComponentWithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * Example: Custom error fallback
 */
export function CustomErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error.message}</p>
        <button
          onClick={resetError}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

/**
 * Example usage with custom logging
 */
export function AppWithErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to error tracking service
    console.error('Application error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // Send to backend
    // fetch('/api/errors', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     error: error.message,
    //     stack: error.stack,
    //     componentStack: errorInfo.componentStack
    //   })
    // })
  }

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}
