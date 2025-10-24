/**
 * Modal Component
 *
 * Accessible modal dialog with overlay, animations, and flexible content.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmation"
 *   size="md"
 * >
 *   <p>Are you sure you want to proceed?</p>
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={() => setIsOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button onClick={handleConfirm}>
 *       Confirm
 *     </Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'

export interface ModalProps {
  /**
   * Modal open state
   */
  isOpen: boolean

  /**
   * Close handler
   */
  onClose: () => void

  /**
   * Modal title
   */
  title?: string

  /**
   * Modal description
   */
  description?: string

  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /**
   * Close on overlay click
   */
  closeOnOverlayClick?: boolean

  /**
   * Close on escape key
   */
  closeOnEscape?: boolean

  /**
   * Show close button
   */
  showCloseButton?: boolean

  /**
   * Custom class for modal content
   */
  className?: string

  /**
   * Custom class for overlay
   */
  overlayClassName?: string

  /**
   * Children content
   */
  children: React.ReactNode

  /**
   * Initial focus ref
   */
  initialFocusRef?: React.RefObject<HTMLElement>

  /**
   * Final focus ref (element to focus on close)
   */
  finalFocusRef?: React.RefObject<HTMLElement>
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  children,
  initialFocusRef,
  finalFocusRef,
}: ModalProps) => {
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle initial focus
  React.useEffect(() => {
    if (isOpen && initialFocusRef?.current) {
      initialFocusRef.current.focus()
    }
  }, [isOpen, initialFocusRef])

  // Handle final focus on close
  React.useEffect(() => {
    if (!isOpen && finalFocusRef?.current) {
      finalFocusRef.current.focus()
    }
  }, [isOpen, finalFocusRef])

  // Focus trap
  React.useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm',
          'animate-in fade-in duration-200',
          overlayClassName
        )}
        onClick={handleOverlayClick}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-lg shadow-xl',
          'max-h-[90vh] overflow-auto',
          'animate-in zoom-in-95 fade-in duration-200',
          // Size variants
          size === 'sm' && 'w-full max-w-sm',
          size === 'md' && 'w-full max-w-md',
          size === 'lg' && 'w-full max-w-lg',
          size === 'xl' && 'w-full max-w-xl',
          size === 'full' && 'w-[95vw] h-[95vh]',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-gray-500"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

Modal.displayName = 'Modal'

/**
 * Modal Footer Component
 */
export interface ModalFooterProps {
  className?: string
  children: React.ReactNode
}

export const ModalFooter = ({ className, children }: ModalFooterProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  )
}

ModalFooter.displayName = 'ModalFooter'

/**
 * Confirmation Modal (convenience wrapper)
 */
export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-700">{message}</p>

      <ModalFooter>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50',
            variant === 'danger' && 'bg-red-600 hover:bg-red-700',
            variant === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
            variant === 'info' && 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  )
}

ConfirmModal.displayName = 'ConfirmModal'
