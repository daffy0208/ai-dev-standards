/**
 * Toast Notification System
 *
 * Production-ready toast notifications with queue management.
 *
 * Features:
 * - Success, error, warning, info types
 * - Auto-dismiss with configurable duration
 * - Manual dismiss
 * - Multiple toasts with queue
 * - Position control
 * - Animations
 * - Icon support
 *
 * Usage:
 * ```typescript
 * import { toast, ToastProvider } from './Toast'
 *
 * // In root layout
 * <ToastProvider>
 *   {children}
 * </ToastProvider>
 *
 * // Anywhere in your app
 * toast.success('Operation successful!')
 * toast.error('Something went wrong')
 * toast.warning('Please be careful')
 * toast.info('Here's some information')
 * ```
 */

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  duration?: number
  dismissible?: boolean
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 3
}: {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
}) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => {
      const updated = [...prev, newToast]
      // Keep only maxToasts
      return updated.slice(-maxToasts)
    })

    // Auto-dismiss
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 max-w-sm w-full`}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const style = styles[toast.type]

  return (
    <div
      className={`${style.bg} ${style.border} ${style.text} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in-right`}
      role="alert"
    >
      <div className="flex-shrink-0">{style.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{toast.message}</p>
        {toast.description && (
          <p className="mt-1 text-sm opacity-90">{toast.description}</p>
        )}
      </div>
      {(toast.dismissible !== false) && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

/**
 * Hook to use toast
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

/**
 * Toast helper functions
 */
export const toast = {
  success: (message: string, description?: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: { type: 'success', message, description, duration }
        })
      )
    }
  },
  error: (message: string, description?: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: { type: 'error', message, description, duration }
        })
      )
    }
  },
  warning: (message: string, description?: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: { type: 'warning', message, description, duration }
        })
      )
    }
  },
  info: (message: string, description?: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: { type: 'info', message, description, duration }
        })
      )
    }
  }
}

/**
 * Enhanced ToastProvider with event listener
 */
export function ToastProviderWithEvents({
  children,
  position,
  maxToasts
}: {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
}) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => {
      const updated = [...prev, newToast]
      return updated.slice(-(maxToasts || 3))
    })

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Listen for toast events
  useCallback(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent
      addToast(customEvent.detail)
    }

    window.addEventListener('toast', handleToast)
    return () => window.removeEventListener('toast', handleToast)
  }, [addToast])()

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className={`fixed ${positionClasses[position || 'top-right']} z-50 flex flex-col gap-2 max-w-sm w-full`}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

/**
 * Example usage
 */
export function ToastExamples() {
  return (
    <div className="space-y-4 p-6">
      <button
        onClick={() => toast.success('Changes saved successfully!')}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Show Success Toast
      </button>

      <button
        onClick={() => toast.error('Failed to save changes', 'Please try again later')}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Show Error Toast
      </button>

      <button
        onClick={() => toast.warning('Your session will expire soon')}
        className="px-4 py-2 bg-yellow-600 text-white rounded"
      >
        Show Warning Toast
      </button>

      <button
        onClick={() => toast.info('New features available!', 'Check out what's new')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Show Info Toast
      </button>
    </div>
  )
}
