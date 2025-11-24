/**
 * Dialog Component
 *
 * An advanced alert/confirm dialog with backdrop, focus trap, and accessibility.
 * Follows ARIA alertdialog pattern for critical interactions.
 *
 * @example
 * ```tsx
 * // Alert dialog
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Alert"
 *   description="This is an important message."
 *   type="alert"
 * >
 *   <DialogFooter>
 *     <Button onClick={() => setOpen(false)}>OK</Button>
 *   </DialogFooter>
 * </Dialog>
 *
 * // Confirm dialog
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   type="confirm"
 *   onConfirm={handleConfirm}
 *   confirmText="Yes, proceed"
 *   cancelText="Cancel"
 * />
 *
 * // Destructive confirm dialog
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Delete Item"
 *   description="This action cannot be undone."
 *   type="confirm"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 *   confirmText="Delete"
 *   cancelText="Cancel"
 * />
 *
 * // Custom dialog with size
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Custom Dialog"
 *   size="lg"
 *   closeOnBackdropClick={false}
 * >
 *   <DialogBody>
 *     <p>Custom content here</p>
 *   </DialogBody>
 *   <DialogFooter>
 *     <Button variant="secondary" onClick={() => setOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button onClick={handleAction}>Confirm</Button>
 *   </DialogFooter>
 * </Dialog>
 * ```
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'

export interface DialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean

  /**
   * Callback when dialog should close
   */
  onClose: () => void

  /**
   * Dialog title
   */
  title?: string

  /**
   * Dialog description
   */
  description?: string

  /**
   * Dialog content (children)
   */
  children?: React.ReactNode

  /**
   * Dialog type
   * - alert: Single action dialog (OK button)
   * - confirm: Two action dialog (Cancel/Confirm buttons)
   * - custom: Custom content and actions
   */
  type?: 'alert' | 'confirm' | 'custom'

  /**
   * Dialog variant
   */
  variant?: 'default' | 'destructive'

  /**
   * Callback when confirm button is clicked (type: confirm)
   */
  onConfirm?: () => void

  /**
   * Confirm button text
   */
  confirmText?: string

  /**
   * Cancel button text
   */
  cancelText?: string

  /**
   * Dialog size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Whether clicking backdrop closes dialog
   */
  closeOnBackdropClick?: boolean

  /**
   * Loading state for confirm button
   */
  loading?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

export interface DialogBodyProps {
  children: React.ReactNode
  className?: string
}

export interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

/**
 * Dialog with alert/confirm patterns
 */
export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      children,
      type = 'custom',
      variant = 'default',
      onConfirm,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      size = 'md',
      closeOnBackdropClick = true,
      loading = false,
      className
    },
    ref
  ) => {
    const [mounted, setMounted] = React.useState(false)
    const dialogRef = React.useRef<HTMLDivElement>(null)

    // Handle mounting for portal
    React.useEffect(() => {
      setMounted(true)
      return () => setMounted(false)
    }, [])

    // Lock body scroll when dialog is open
    React.useEffect(() => {
      if (open) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
        document.body.style.overflow = 'hidden'
        document.body.style.paddingRight = `${scrollbarWidth}px`
      } else {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }

      return () => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }
    }, [open])

    // ESC to close (only if not loading)
    React.useEffect(() => {
      if (!open || loading) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, onClose, loading])

    // Focus trap
    React.useEffect(() => {
      if (!open || !dialogRef.current) return

      const dialog = dialogRef.current
      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Focus first element when dialog opens
      firstElement?.focus()

      const handleTab = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      return () => document.removeEventListener('keydown', handleTab)
    }, [open])

    // Click backdrop to close
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && !loading && event.target === event.currentTarget) {
        onClose()
      }
    }

    // Handle confirm
    const handleConfirm = async () => {
      if (onConfirm) {
        await onConfirm()
      }
      onClose()
    }

    if (!mounted || !open) return null

    // Size classes
    const getSizeClass = () => {
      switch (size) {
        case 'sm':
          return 'w-full max-w-sm'
        case 'md':
          return 'w-full max-w-md'
        case 'lg':
          return 'w-full max-w-lg'
        case 'xl':
          return 'w-full max-w-2xl'
        default:
          return 'w-full max-w-md'
      }
    }

    // Icon based on variant
    const getIcon = () => {
      if (type === 'alert' && variant === 'default') {
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
      }
      if ((type === 'confirm' || type === 'alert') && variant === 'destructive') {
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        )
      }
      return null
    }

    const dialogContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        aria-modal="true"
        role={type === 'alert' ? 'alertdialog' : 'dialog'}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            'transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        {/* Dialog */}
        <div
          ref={dialogRef}
          className={cn(
            'relative bg-white rounded-lg shadow-xl',
            'transition-all duration-200',
            open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4',
            getSizeClass(),
            'max-h-[90vh] flex flex-col',
            className
          )}
        >
          {/* Header with icon (for alert/confirm) */}
          {(type === 'alert' || type === 'confirm') && (
            <div className="px-6 pt-6">
              <div className="flex items-start gap-4">
                {getIcon()}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="dialog-description" className="mt-2 text-sm text-gray-600">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom header (for custom type) */}
          {type === 'custom' && title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              {description && (
                <p id="dialog-description" className="mt-1 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Body */}
          {type === 'custom' && children && (
            <div className="flex-1 overflow-y-auto">{children}</div>
          )}

          {/* Footer */}
          {type === 'alert' && (
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
                  'bg-blue-600 text-white hover:bg-blue-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  'transition-colors'
                )}
              >
                OK
              </button>
            </div>
          )}

          {type === 'confirm' && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
                  'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  'transition-colors'
                )}
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  'transition-colors',
                  variant === 'default' &&
                    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
                  variant === 'destructive' &&
                    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                )}
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
                {confirmText}
              </button>
            </div>
          )}

          {type === 'custom' &&
            !React.Children.toArray(children).some(
              child => React.isValidElement(child) && child.type === DialogFooter
            ) && <div className="px-6 py-4" />}
        </div>
      </div>
    )

    return createPortal(dialogContent, document.body)
  }
)

Dialog.displayName = 'Dialog'

/**
 * Dialog body
 */
export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('px-6 py-4', className)}>
        {children}
      </div>
    )
  }
)

DialogBody.displayName = 'DialogBody'

/**
 * Dialog footer
 */
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg',
          className
        )}
      >
        {children}
      </div>
    )
  }
)

DialogFooter.displayName = 'DialogFooter'
