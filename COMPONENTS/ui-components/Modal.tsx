/**
 * Modal Component
 *
 * An accessible modal dialog with overlay, animations, focus trap, and keyboard support.
 * Supports multiple sizes and renders via portal to document.body.
 *
 * @example
 * ```tsx
 * // Basic modal
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Welcome"
 * >
 *   <p>This is a modal dialog.</p>
 * </Modal>
 *
 * // Modal with footer actions
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 *   footer={
 *     <>
 *       <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *         Cancel
 *       </Button>
 *       <Button variant="primary" onClick={handleConfirm}>
 *         Confirm
 *       </Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 *
 * // Full-screen modal
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Full Screen"
 *   size="full"
 * >
 *   <p>This modal takes up most of the screen.</p>
 * </Modal>
 * ```
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from './utils';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when the modal should close
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Footer content (typically buttons)
   */
  footer?: React.ReactNode;

  /**
   * Modal size
   * - sm: 384px max width
   * - md: 512px max width (default)
   * - lg: 768px max width
   * - full: 95% of viewport width and height
   */
  size?: 'sm' | 'md' | 'lg' | 'full';

  /**
   * Additional CSS classes for the modal
   */
  className?: string;
}

/**
 * Modal dialog with overlay and animations
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, children, footer, size = 'md', className }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = React.useState(false);

    // Handle mounting for portal
    React.useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    // Handle ESC key to close
    React.useEffect(() => {
      if (!open) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    // Lock body scroll when modal is open
    React.useEffect(() => {
      if (open) {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }, [open]);

    // Focus trap implementation
    React.useEffect(() => {
      if (!open || !modalRef.current) return;

      const modal = modalRef.current;
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Focus first element when modal opens
      firstElement?.focus();

      const handleTab = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }, [open]);

    // Click outside to close
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    if (!mounted || !open) return null;

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-modal="true"
        role="dialog"
      >
        {/* Overlay with fade animation */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            'transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal with slide-in animation */}
        <div
          ref={modalRef}
          className={cn(
            'relative bg-white rounded-lg shadow-xl',
            'transition-all duration-200',
            open
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4',
            // Size variants
            size === 'sm' && 'w-full max-w-sm',
            size === 'md' && 'w-full max-w-lg',
            size === 'lg' && 'w-full max-w-3xl',
            size === 'full' && 'w-[95vw] h-[95vh]',
            // Max height for scrolling
            size !== 'full' && 'max-h-[90vh]',
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className={cn(
                  'p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'transition-colors'
                )}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Body */}
          <div
            className={cn(
              'px-6 py-4 overflow-y-auto',
              size === 'full' ? 'flex-1' : 'max-h-[60vh]'
            )}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';
