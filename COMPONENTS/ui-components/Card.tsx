/**
 * Card Component
 *
 * A flexible card component with header, body, and footer sections.
 * Supports multiple variants including default, bordered, and elevated styles.
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card title="Welcome" footer={<Button>Action</Button>}>
 *   <p>This is the card content.</p>
 * </Card>
 *
 * // Bordered variant
 * <Card
 *   title="Settings"
 *   variant="bordered"
 *   footer={<Button variant="primary">Save</Button>}
 * >
 *   <p>Your settings content here.</p>
 * </Card>
 *
 * // Elevated card with no footer
 * <Card title="Notifications" variant="elevated">
 *   <p>You have 3 new notifications.</p>
 * </Card>
 * ```
 */

import * as React from 'react'
import { cn } from './utils'

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Card title displayed in the header
   */
  title?: string

  /**
   * Footer content (buttons, actions, etc.)
   */
  footer?: React.ReactNode

  /**
   * Card variant
   * - default: white background with light border and subtle shadow
   * - bordered: white background with prominent border
   * - elevated: white background with strong shadow effect
   */
  variant?: 'default' | 'bordered' | 'elevated'

  /**
   * Additional CSS classes for the card
   */
  className?: string

  /**
   * Card body content
   */
  children: React.ReactNode
}

/**
 * Card component with header, body, and footer sections
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className, variant = 'default', title, footer, children, ...props }, ref) => {
    return (
      <article
        ref={ref}
        className={cn(
          'rounded-lg bg-white text-gray-900',
          // Variant styles
          variant === 'default' && 'border border-gray-200 shadow-sm',
          variant === 'bordered' && 'border-2 border-gray-300',
          variant === 'elevated' && 'border border-gray-100 shadow-lg',
          className
        )}
        {...props}
      >
        {/* Header */}
        {title && (
          <header className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 leading-none">{title}</h3>
          </header>
        )}

        {/* Body */}
        <section className="px-6 py-4">{children}</section>

        {/* Footer */}
        {footer && (
          <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footer}
          </footer>
        )}
      </article>
    )
  }
)

Card.displayName = 'Card'
