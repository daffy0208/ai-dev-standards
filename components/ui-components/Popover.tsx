/**
 * Popover Component
 *
 * A floating content container with click trigger, positioning, and rich content support.
 * Follows ARIA dialog pattern for accessibility.
 *
 * @example
 * ```tsx
 * // Basic popover
 * <Popover
 *   trigger={<Button>Click me</Button>}
 *   content={<div>Popover content</div>}
 * />
 *
 * // Popover with title and positioning
 * <Popover
 *   trigger={<Button>Show Info</Button>}
 *   title="Information"
 *   placement="bottom-end"
 *   content={
 *     <div className="space-y-2">
 *       <p>This is a popover with rich content.</p>
 *       <Button size="sm">Action</Button>
 *     </div>
 *   }
 * />
 *
 * // Controlled popover
 * const [open, setOpen] = useState(false);
 * <Popover
 *   trigger={<Button>Toggle</Button>}
 *   content={<div>Controlled popover</div>}
 *   open={open}
 *   onOpenChange={setOpen}
 * />
 * ```
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'

export interface PopoverProps {
  /**
   * Trigger element
   */
  trigger: React.ReactNode

  /**
   * Popover content
   */
  content: React.ReactNode

  /**
   * Optional title
   */
  title?: string

  /**
   * Placement relative to trigger
   */
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'

  /**
   * Controlled open state
   */
  open?: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Show close button
   */
  showClose?: boolean

  /**
   * Additional CSS classes for popover
   */
  className?: string
}

/**
 * Popover with click trigger and rich content
 */
export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      trigger,
      content,
      title,
      placement = 'bottom',
      open: controlledOpen,
      onOpenChange,
      showClose = true,
      className
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [position, setPosition] = React.useState({ top: 0, left: 0 })
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const popoverRef = React.useRef<HTMLDivElement>(null)
    const popoverId = React.useId()

    // Use controlled or internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = (value: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(value)
      }
      onOpenChange?.(value)
    }

    // Handle mounting for portal
    React.useEffect(() => {
      setMounted(true)
      return () => setMounted(false)
    }, [])

    // Calculate popover position
    const updatePosition = React.useCallback(() => {
      if (!triggerRef.current || !open) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverWidth = 320 // Default width
      const popoverHeight = 200 // Estimated height
      const gap = 8

      let top = 0
      let left = 0

      switch (placement) {
        case 'top':
          top = triggerRect.top - popoverHeight - gap
          left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2
          break
        case 'top-start':
          top = triggerRect.top - popoverHeight - gap
          left = triggerRect.left
          break
        case 'top-end':
          top = triggerRect.top - popoverHeight - gap
          left = triggerRect.right - popoverWidth
          break
        case 'bottom':
          top = triggerRect.bottom + gap
          left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2
          break
        case 'bottom-start':
          top = triggerRect.bottom + gap
          left = triggerRect.left
          break
        case 'bottom-end':
          top = triggerRect.bottom + gap
          left = triggerRect.right - popoverWidth
          break
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - popoverHeight / 2
          left = triggerRect.left - popoverWidth - gap
          break
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - popoverHeight / 2
          left = triggerRect.right + gap
          break
      }

      // Keep within viewport
      const padding = 8
      if (left < padding) left = padding
      if (left + popoverWidth > window.innerWidth - padding) {
        left = window.innerWidth - popoverWidth - padding
      }
      if (top < padding) top = padding
      if (top + popoverHeight > window.innerHeight - padding) {
        top = window.innerHeight - popoverHeight - padding
      }

      setPosition({ top, left })
    }, [open, placement])

    React.useEffect(() => {
      if (open) {
        updatePosition()
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition)
        return () => {
          window.removeEventListener('scroll', updatePosition, true)
          window.removeEventListener('resize', updatePosition)
        }
      }
    }, [open, updatePosition])

    // Toggle popover
    const handleToggle = () => {
      setOpen(!open)
    }

    // Close popover
    const handleClose = () => {
      setOpen(false)
    }

    // ESC to close
    React.useEffect(() => {
      if (!open) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose()
          triggerRef.current?.focus()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open])

    // Click outside to close
    React.useEffect(() => {
      if (!open) return

      const handleClickOutside = (event: MouseEvent) => {
        if (
          !popoverRef.current?.contains(event.target as Node) &&
          !triggerRef.current?.contains(event.target as Node)
        ) {
          handleClose()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    // Focus trap
    React.useEffect(() => {
      if (!open || !popoverRef.current) return

      const popover = popoverRef.current
      const focusableElements = popover.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Focus first element when popover opens
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

    const popoverContent = open && mounted && (
      <div
        ref={popoverRef}
        id={popoverId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={title ? `${popoverId}-title` : undefined}
        className={cn(
          'fixed z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-lg',
          'animate-in fade-in-50 zoom-in-95 slide-in-from-top-2',
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            {title && (
              <h3 id={`${popoverId}-title`} className="text-sm font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {showClose && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close popover"
                className={cn(
                  'p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'transition-colors',
                  !title && 'ml-auto'
                )}
              >
                <svg
                  className="h-4 w-4"
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
            )}
          </div>
        )}
        <div className="px-4 py-3">{content}</div>
      </div>
    )

    return (
      <>
        <div
          ref={triggerRef}
          onClick={handleToggle}
          className="inline-block"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {trigger}
        </div>
        {mounted && createPortal(popoverContent, document.body)}
      </>
    )
  }
)

Popover.displayName = 'Popover'
