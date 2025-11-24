/**
 * Drawer Component
 *
 * A slide-out drawer/sidebar with backdrop, focus trap, and body scroll lock.
 * Follows ARIA dialog pattern for accessibility.
 *
 * @example
 * ```tsx
 * // Basic drawer from right
 * const [open, setOpen] = useState(false);
 * <Drawer open={open} onClose={() => setOpen(false)}>
 *   <DrawerHeader>
 *     <DrawerTitle>Drawer Title</DrawerTitle>
 *     <DrawerDescription>Drawer description</DrawerDescription>
 *   </DrawerHeader>
 *   <DrawerBody>
 *     <p>Drawer content goes here</p>
 *   </DrawerBody>
 *   <DrawerFooter>
 *     <Button onClick={() => setOpen(false)}>Close</Button>
 *   </DrawerFooter>
 * </Drawer>
 *
 * // Drawer from left with size
 * <Drawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   position="left"
 *   size="lg"
 * >
 *   <DrawerBody>Content</DrawerBody>
 * </Drawer>
 *
 * // Drawer from top
 * <Drawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   position="top"
 * >
 *   <DrawerBody>Top drawer content</DrawerBody>
 * </Drawer>
 *
 * // Drawer without backdrop click to close
 * <Drawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   closeOnBackdropClick={false}
 * >
 *   <DrawerBody>Must use close button</DrawerBody>
 * </Drawer>
 * ```
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'

export interface DrawerProps {
  /**
   * Whether the drawer is open
   */
  open: boolean

  /**
   * Callback when drawer should close
   */
  onClose: () => void

  /**
   * Drawer content
   */
  children: React.ReactNode

  /**
   * Position of the drawer
   */
  position?: 'left' | 'right' | 'top' | 'bottom'

  /**
   * Size of the drawer
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /**
   * Whether clicking the backdrop closes the drawer
   */
  closeOnBackdropClick?: boolean

  /**
   * Additional CSS classes for drawer
   */
  className?: string
}

export interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

export interface DrawerTitleProps {
  children: React.ReactNode
  className?: string
}

export interface DrawerDescriptionProps {
  children: React.ReactNode
  className?: string
}

export interface DrawerBodyProps {
  children: React.ReactNode
  className?: string
}

export interface DrawerFooterProps {
  children: React.ReactNode
  className?: string
}

/**
 * Drawer with slide-out animation and accessibility
 */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      children,
      position = 'right',
      size = 'md',
      closeOnBackdropClick = true,
      className
    },
    ref
  ) => {
    const [mounted, setMounted] = React.useState(false)
    const drawerRef = React.useRef<HTMLDivElement>(null)

    // Handle mounting for portal
    React.useEffect(() => {
      setMounted(true)
      return () => setMounted(false)
    }, [])

    // Lock body scroll when drawer is open
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

    // ESC to close
    React.useEffect(() => {
      if (!open) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, onClose])

    // Focus trap
    React.useEffect(() => {
      if (!open || !drawerRef.current) return

      const drawer = drawerRef.current
      const focusableElements = drawer.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Focus first element when drawer opens
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
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose()
      }
    }

    if (!mounted || !open) return null

    // Size classes
    const getSizeClass = () => {
      const isHorizontal = position === 'left' || position === 'right'
      if (isHorizontal) {
        switch (size) {
          case 'sm':
            return 'w-80'
          case 'md':
            return 'w-96'
          case 'lg':
            return 'w-[32rem]'
          case 'xl':
            return 'w-[48rem]'
          case 'full':
            return 'w-full'
          default:
            return 'w-96'
        }
      } else {
        switch (size) {
          case 'sm':
            return 'h-1/4'
          case 'md':
            return 'h-1/3'
          case 'lg':
            return 'h-1/2'
          case 'xl':
            return 'h-3/4'
          case 'full':
            return 'h-full'
          default:
            return 'h-1/3'
        }
      }
    }

    // Animation classes
    const getAnimationClass = () => {
      switch (position) {
        case 'left':
          return 'animate-in slide-in-from-left'
        case 'right':
          return 'animate-in slide-in-from-right'
        case 'top':
          return 'animate-in slide-in-from-top'
        case 'bottom':
          return 'animate-in slide-in-from-bottom'
        default:
          return ''
      }
    }

    // Position classes
    const getPositionClass = () => {
      switch (position) {
        case 'left':
          return 'top-0 left-0 h-full'
        case 'right':
          return 'top-0 right-0 h-full'
        case 'top':
          return 'top-0 left-0 w-full'
        case 'bottom':
          return 'bottom-0 left-0 w-full'
        default:
          return ''
      }
    }

    const drawerContent = (
      <div
        className="fixed inset-0 z-50 flex"
        aria-labelledby="drawer-title"
        aria-describedby="drawer-description"
        aria-modal="true"
        role="dialog"
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

        {/* Drawer */}
        <div
          ref={drawerRef}
          className={cn(
            'fixed bg-white shadow-xl',
            'flex flex-col',
            'transition-all duration-300',
            getPositionClass(),
            getSizeClass(),
            getAnimationClass(),
            className
          )}
        >
          {children}
        </div>
      </div>
    )

    return createPortal(drawerContent, document.body)
  }
)

Drawer.displayName = 'Drawer'

/**
 * Drawer header
 */
export const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between px-6 py-4 border-b border-gray-200',
          className
        )}
      >
        {children}
      </div>
    )
  }
)

DrawerHeader.displayName = 'DrawerHeader'

/**
 * Drawer title
 */
export const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ children, className }, ref) => {
    return (
      <h2
        ref={ref}
        id="drawer-title"
        className={cn('text-xl font-semibold text-gray-900', className)}
      >
        {children}
      </h2>
    )
  }
)

DrawerTitle.displayName = 'DrawerTitle'

/**
 * Drawer description
 */
export const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ children, className }, ref) => {
    return (
      <p ref={ref} id="drawer-description" className={cn('mt-1 text-sm text-gray-500', className)}>
        {children}
      </p>
    )
  }
)

DrawerDescription.displayName = 'DrawerDescription'

/**
 * Drawer body
 */
export const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex-1 overflow-y-auto px-6 py-4', className)}>
        {children}
      </div>
    )
  }
)

DrawerBody.displayName = 'DrawerBody'

/**
 * Drawer footer
 */
export const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50',
          className
        )}
      >
        {children}
      </div>
    )
  }
)

DrawerFooter.displayName = 'DrawerFooter'
