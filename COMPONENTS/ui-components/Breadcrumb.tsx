/**
 * Breadcrumb Component
 *
 * Navigation breadcrumbs for showing the current page location.
 * Supports customizable separators, current page indication, and truncation.
 *
 * @example
 * ```tsx
 * // Basic breadcrumb
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Electronics', href: '/products/electronics' },
 *     { label: 'Laptop' }
 *   ]}
 * />
 *
 * // Custom separator
 * <Breadcrumb
 *   items={items}
 *   separator=">"
 * />
 *
 * // With max items (truncation)
 * <Breadcrumb
 *   items={longItems}
 *   maxItems={3}
 * />
 *
 * // Custom separator element
 * <Breadcrumb
 *   items={items}
 *   separator={<ChevronRightIcon />}
 * />
 * ```
 */

import * as React from 'react'
import { cn } from './utils'

export interface BreadcrumbItem {
  /**
   * Display label
   */
  label: string

  /**
   * Link href (if omitted, item is not clickable and treated as current)
   */
  href?: string

  /**
   * Click handler (alternative to href)
   */
  onClick?: () => void
}

export interface BreadcrumbProps {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[]

  /**
   * Separator between items (string or React element)
   */
  separator?: React.ReactNode

  /**
   * Maximum number of items to show (rest will be collapsed)
   */
  maxItems?: number

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Default separator icon
 */
const DefaultSeparator = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

/**
 * Breadcrumb component for navigation
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, maxItems, className }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false)

    // Determine if we need to truncate
    const shouldTruncate = maxItems && items.length > maxItems
    const displayItems = React.useMemo(() => {
      if (!shouldTruncate || isExpanded) {
        return items
      }

      // Show first item, ellipsis, and last (maxItems - 1) items
      const firstItem = items[0]
      const lastItems = items.slice(-(maxItems - 1))

      return [firstItem, { label: '...', isEllipsis: true }, ...lastItems]
    }, [items, maxItems, shouldTruncate, isExpanded])

    // Render separator
    const renderSeparator = () => {
      if (separator === undefined) {
        return <DefaultSeparator />
      }
      if (typeof separator === 'string') {
        return (
          <span className="mx-2 text-gray-400" aria-hidden="true">
            {separator}
          </span>
        )
      }
      return (
        <span className="mx-2" aria-hidden="true">
          {separator}
        </span>
      )
    }

    return (
      <nav ref={ref} aria-label="Breadcrumb" className={cn('flex items-center', className)}>
        <ol className="flex items-center flex-wrap gap-y-2">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1
            const isCurrent = isLast || !item.href
            const isEllipsis = 'isEllipsis' in item && item.isEllipsis

            return (
              <li key={index} className="flex items-center">
                {/* Item */}
                {isEllipsis ? (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className={cn(
                      'text-sm font-medium text-gray-500 hover:text-gray-700',
                      'focus:outline-none focus:underline',
                      'transition-colors'
                    )}
                    aria-label="Show all breadcrumb items"
                  >
                    {item.label}
                  </button>
                ) : isCurrent ? (
                  <span className="text-sm font-medium text-gray-900" aria-current="page">
                    {item.label}
                  </span>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      'text-sm font-medium text-gray-500 hover:text-gray-700',
                      'focus:outline-none focus:underline',
                      'transition-colors'
                    )}
                  >
                    {item.label}
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className={cn(
                      'text-sm font-medium text-gray-500 hover:text-gray-700',
                      'focus:outline-none focus:underline',
                      'transition-colors'
                    )}
                  >
                    {item.label}
                  </a>
                )}

                {/* Separator */}
                {!isLast && <div className="flex items-center">{renderSeparator()}</div>}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'
