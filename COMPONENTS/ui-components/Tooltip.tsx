/**
 * Tooltip Component
 *
 * An accessible tooltip with hover trigger, positioning, and portal rendering.
 * Follows ARIA describedby pattern for accessibility.
 *
 * @example
 * ```tsx
 * // Basic tooltip
 * <Tooltip content="This is a tooltip">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * // Tooltip with different placements
 * <Tooltip content="Top tooltip" placement="top">
 *   <span>Top</span>
 * </Tooltip>
 *
 * <Tooltip content="Right tooltip" placement="right" delay={500}>
 *   <span>Right (with delay)</span>
 * </Tooltip>
 *
 * // Tooltip with custom arrow
 * <Tooltip
 *   content="Custom tooltip with arrow"
 *   placement="bottom"
 *   showArrow={true}
 * >
 *   <Button>Bottom with arrow</Button>
 * </Tooltip>
 * ```
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode

  /**
   * Element that triggers the tooltip
   */
  children: React.ReactElement

  /**
   * Tooltip placement
   */
  placement?: 'top' | 'bottom' | 'left' | 'right'

  /**
   * Delay before showing tooltip (ms)
   */
  delay?: number

  /**
   * Whether to show arrow pointing to trigger
   */
  showArrow?: boolean

  /**
   * Additional CSS classes for tooltip
   */
  className?: string

  /**
   * Disable the tooltip
   */
  disabled?: boolean
}

/**
 * Tooltip with hover trigger and positioning
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = 'top',
      delay = 200,
      showArrow = true,
      className,
      disabled = false
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [position, setPosition] = React.useState({ top: 0, left: 0 })
    const triggerRef = React.useRef<HTMLElement>(null)
    const tooltipRef = React.useRef<HTMLDivElement>(null)
    const timeoutRef = React.useRef<NodeJS.Timeout>()
    const tooltipId = React.useId()

    // Handle mounting for portal
    React.useEffect(() => {
      setMounted(true)
      return () => setMounted(false)
    }, [])

    // Calculate tooltip position
    const updatePosition = React.useCallback(() => {
      if (!triggerRef.current || !visible) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipWidth = 200 // Default max width
      const tooltipHeight = 40 // Estimated height
      const gap = showArrow ? 12 : 8 // Gap between trigger and tooltip

      let top = 0
      let left = 0

      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipHeight - gap
          left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2
          break
        case 'bottom':
          top = triggerRect.bottom + gap
          left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2
          break
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2
          left = triggerRect.left - tooltipWidth - gap
          break
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2
          left = triggerRect.right + gap
          break
      }

      // Keep tooltip within viewport
      const padding = 8
      if (left < padding) left = padding
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding
      }
      if (top < padding) top = padding

      setPosition({ top, left })
    }, [visible, placement, showArrow])

    React.useEffect(() => {
      if (visible) {
        updatePosition()
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition)
        return () => {
          window.removeEventListener('scroll', updatePosition, true)
          window.removeEventListener('resize', updatePosition)
        }
      }
    }, [visible, updatePosition])

    // Show tooltip with delay
    const handleMouseEnter = () => {
      if (disabled) return
      timeoutRef.current = setTimeout(() => {
        setVisible(true)
      }, delay)
    }

    // Hide tooltip
    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setVisible(false)
    }

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    // Clone child element with event handlers
    const trigger = React.cloneElement(children, {
      ref: triggerRef,
      onMouseEnter: (e: React.MouseEvent) => {
        handleMouseEnter()
        children.props.onMouseEnter?.(e)
      },
      onMouseLeave: (e: React.MouseEvent) => {
        handleMouseLeave()
        children.props.onMouseLeave?.(e)
      },
      onFocus: (e: React.FocusEvent) => {
        if (!disabled) setVisible(true)
        children.props.onFocus?.(e)
      },
      onBlur: (e: React.FocusEvent) => {
        setVisible(false)
        children.props.onBlur?.(e)
      },
      'aria-describedby': visible ? tooltipId : undefined
    })

    const tooltipContent = visible && mounted && (
      <div
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className={cn(
          'fixed z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg',
          'animate-in fade-in-50 zoom-in-95',
          'max-w-xs break-words',
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        {content}
        {showArrow && (
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 rotate-45',
              placement === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
              placement === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
              placement === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
              placement === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
            )}
          />
        )}
      </div>
    )

    return (
      <>
        {trigger}
        {mounted && createPortal(tooltipContent, document.body)}
      </>
    )
  }
)

Tooltip.displayName = 'Tooltip'
