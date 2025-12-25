import React, { useMemo } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

/**
 * Pagination Component
 *
 * A fully accessible pagination component for navigating through pages of content.
 * Includes first/last, prev/next buttons, page numbers with intelligent ellipsis handling.
 *
 * @example
 * // Basic usage
 * ```tsx
 * const [currentPage, setCurrentPage] = useState(1);
 *
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={10}
 *   onPageChange={setCurrentPage}
 * />
 * ```
 *
 * @example
 * // With custom sibling count
 * ```tsx
 * <Pagination
 *   currentPage={5}
 *   totalPages={20}
 *   onPageChange={(page) => console.log('Navigate to page:', page)}
 *   siblingCount={2}
 *   showFirstLast
 * />
 * ```
 *
 * @example
 * // Compact variant
 * ```tsx
 * <Pagination
 *   currentPage={3}
 *   totalPages={15}
 *   onPageChange={handlePageChange}
 *   variant="compact"
 *   siblingCount={1}
 * />
 * ```
 *
 * @example
 * // With custom styling
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={5}
 *   onPageChange={handlePageChange}
 *   className="justify-center"
 *   showFirstLast={false}
 * />
 * ```
 */

const paginationVariants = cva('flex items-center', {
  variants: {
    variant: {
      default: 'space-x-1',
      compact: 'space-x-0.5'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const paginationButtonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'h-9 min-w-[36px] rounded-md text-sm',
        compact: 'h-8 min-w-[32px] rounded text-xs'
      },
      state: {
        default: 'bg-transparent hover:bg-gray-100 text-gray-700',
        active: 'bg-blue-600 text-white hover:bg-blue-700',
        disabled: 'opacity-50 cursor-not-allowed'
      }
    },
    defaultVariants: {
      variant: 'default',
      state: 'default'
    }
  }
)

export interface PaginationProps extends VariantProps<typeof paginationVariants> {
  /** Current active page (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Callback fired when page changes */
  onPageChange: (page: number) => void
  /** Number of page buttons to show on each side of current page */
  siblingCount?: number
  /** Whether to show first/last page buttons */
  showFirstLast?: boolean
  /** Whether to show previous/next page buttons */
  showPrevNext?: boolean
  /** Additional CSS classes */
  className?: string
}

const ELLIPSIS = '...'

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showFirstLast = true,
      showPrevNext = true,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    // Generate page numbers array with ellipsis
    const pageNumbers = useMemo(() => {
      const totalNumbers = siblingCount * 2 + 3 // siblings on each side + current + first + last
      const totalBlocks = totalNumbers + 2 // + 2 ellipsis

      if (totalPages <= totalBlocks) {
        // Show all pages if total pages is less than total blocks
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

      const shouldShowLeftEllipsis = leftSiblingIndex > 2
      const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1

      const firstPageIndex = 1
      const lastPageIndex = totalPages

      if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        const leftItemCount = 3 + 2 * siblingCount
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
        return [...leftRange, ELLIPSIS, lastPageIndex]
      }

      if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
        const rightItemCount = 3 + 2 * siblingCount
        const rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        )
        return [firstPageIndex, ELLIPSIS, ...rightRange]
      }

      if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        const middleRange = Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        )
        return [firstPageIndex, ELLIPSIS, ...middleRange, ELLIPSIS, lastPageIndex]
      }

      return []
    }, [currentPage, totalPages, siblingCount])

    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages

    const handlePageClick = (page: number | string) => {
      if (typeof page === 'number' && page !== currentPage) {
        onPageChange(page)
      }
    }

    const handlePrevious = () => {
      if (canGoPrevious) {
        onPageChange(currentPage - 1)
      }
    }

    const handleNext = () => {
      if (canGoNext) {
        onPageChange(currentPage + 1)
      }
    }

    const handleFirst = () => {
      onPageChange(1)
    }

    const handleLast = () => {
      onPageChange(totalPages)
    }

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination navigation"
        className={cn('flex items-center justify-start', className)}
        {...props}
      >
        <ul className={cn(paginationVariants({ variant }))}>
          {/* First page button */}
          {showFirstLast && (
            <li>
              <button
                type="button"
                onClick={handleFirst}
                disabled={!canGoPrevious}
                aria-label="Go to first page"
                className={cn(
                  paginationButtonVariants({
                    variant,
                    state: !canGoPrevious ? 'disabled' : 'default'
                  }),
                  'px-2'
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
              </button>
            </li>
          )}

          {/* Previous page button */}
          {showPrevNext && (
            <li>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                aria-label="Go to previous page"
                className={cn(
                  paginationButtonVariants({
                    variant,
                    state: !canGoPrevious ? 'disabled' : 'default'
                  }),
                  'px-2'
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </li>
          )}

          {/* Page numbers */}
          {pageNumbers.map((pageNumber, index) => {
            const isEllipsis = pageNumber === ELLIPSIS
            const isActive = pageNumber === currentPage
            const key = isEllipsis ? `ellipsis-${index}` : `page-${pageNumber}`

            return (
              <li key={key}>
                {isEllipsis ? (
                  <span
                    className={cn(
                      paginationButtonVariants({ variant }),
                      'cursor-default hover:bg-transparent'
                    )}
                    aria-hidden="true"
                  >
                    {ELLIPSIS}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePageClick(pageNumber)}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      paginationButtonVariants({
                        variant,
                        state: isActive ? 'active' : 'default'
                      })
                    )}
                  >
                    {pageNumber}
                  </button>
                )}
              </li>
            )
          })}

          {/* Next page button */}
          {showPrevNext && (
            <li>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Go to next page"
                className={cn(
                  paginationButtonVariants({
                    variant,
                    state: !canGoNext ? 'disabled' : 'default'
                  }),
                  'px-2'
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </li>
          )}

          {/* Last page button */}
          {showFirstLast && (
            <li>
              <button
                type="button"
                onClick={handleLast}
                disabled={!canGoNext}
                aria-label="Go to last page"
                className={cn(
                  paginationButtonVariants({
                    variant,
                    state: !canGoNext ? 'disabled' : 'default'
                  }),
                  'px-2'
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </button>
            </li>
          )}
        </ul>
      </nav>
    )
  }
)

Pagination.displayName = 'Pagination'

export { Pagination, paginationButtonVariants }
