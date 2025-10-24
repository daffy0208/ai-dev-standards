/**
 * Table Component
 *
 * Reusable data table with sorting, pagination, and selection.
 *
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'email', label: 'Email' },
 *   { key: 'role', label: 'Role', render: (user) => user.role.toUpperCase() }
 * ]
 *
 * <Table
 *   data={users}
 *   columns={columns}
 *   sortBy="name"
 *   sortOrder="asc"
 *   onSort={(key, order) => console.log(key, order)}
 *   selectable
 *   onSelectionChange={(selected) => console.log(selected)}
 * />
 * ```
 */

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export type SortOrder = 'asc' | 'desc'

export interface Column<T> {
  /**
   * Column key (matches data property)
   */
  key: keyof T | string

  /**
   * Column label
   */
  label: string

  /**
   * Column is sortable
   */
  sortable?: boolean

  /**
   * Column width
   */
  width?: string

  /**
   * Custom cell render
   */
  render?: (item: T, index: number) => React.ReactNode

  /**
   * Cell alignment
   */
  align?: 'left' | 'center' | 'right'

  /**
   * Custom class for cells
   */
  className?: string
}

export interface TableProps<T> {
  /**
   * Table data
   */
  data: T[]

  /**
   * Column definitions
   */
  columns: Column<T>[]

  /**
   * Current sort column
   */
  sortBy?: keyof T | string

  /**
   * Current sort order
   */
  sortOrder?: SortOrder

  /**
   * Sort handler
   */
  onSort?: (key: keyof T | string, order: SortOrder) => void

  /**
   * Enable row selection
   */
  selectable?: boolean

  /**
   * Selected row IDs
   */
  selectedIds?: Set<string>

  /**
   * Selection change handler
   */
  onSelectionChange?: (selectedIds: Set<string>) => void

  /**
   * Row ID getter
   */
  getRowId?: (item: T) => string

  /**
   * Row click handler
   */
  onRowClick?: (item: T) => void

  /**
   * Empty state message
   */
  emptyMessage?: string

  /**
   * Loading state
   */
  loading?: boolean

  /**
   * Striped rows
   */
  striped?: boolean

  /**
   * Hover effect
   */
  hoverable?: boolean

  /**
   * Compact size
   */
  compact?: boolean

  /**
   * Custom class
   */
  className?: string
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  sortBy,
  sortOrder,
  onSort,
  selectable,
  selectedIds = new Set(),
  onSelectionChange,
  getRowId = (item) => item.id,
  onRowClick,
  emptyMessage = 'No data available',
  loading,
  striped,
  hoverable = true,
  compact,
  className,
}: TableProps<T>) {
  const [internalSelection, setInternalSelection] = React.useState(new Set<string>())

  const selection = selectable ? selectedIds : internalSelection

  const toggleRow = (id: string) => {
    const newSelection = new Set(selection)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }

    if (selectable && onSelectionChange) {
      onSelectionChange(newSelection)
    } else {
      setInternalSelection(newSelection)
    }
  }

  const toggleAll = () => {
    if (selection.size === data.length) {
      // Deselect all
      const newSelection = new Set<string>()
      if (selectable && onSelectionChange) {
        onSelectionChange(newSelection)
      } else {
        setInternalSelection(newSelection)
      }
    } else {
      // Select all
      const newSelection = new Set(data.map(getRowId))
      if (selectable && onSelectionChange) {
        onSelectionChange(newSelection)
      } else {
        setInternalSelection(newSelection)
      }
    }
  }

  const handleSort = (key: keyof T | string) => {
    if (!onSort) return

    const newOrder: SortOrder =
      sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc'

    onSort(key, newOrder)
  }

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full border-collapse">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {/* Selection column */}
            {selectable && (
              <th
                className={cn(
                  'text-left font-medium text-gray-700',
                  compact ? 'px-3 py-2' : 'px-6 py-3'
                )}
              >
                <input
                  type="checkbox"
                  checked={selection.size === data.length && data.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
            )}

            {/* Data columns */}
            {columns.map((column, index) => (
              <th
                key={String(column.key)}
                className={cn(
                  'text-left text-sm font-medium text-gray-700',
                  compact ? 'px-3 py-2' : 'px-6 py-3',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer select-none hover:bg-gray-100',
                  column.className
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortBy === column.key && (
                    <span className="text-gray-400">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={cn(
                  'text-center text-gray-500',
                  compact ? 'px-3 py-8' : 'px-6 py-12'
                )}
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={cn(
                  'text-center text-gray-500',
                  compact ? 'px-3 py-8' : 'px-6 py-12'
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const rowId = getRowId(item)
              const isSelected = selection.has(rowId)

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'border-b border-gray-100',
                    striped && rowIndex % 2 === 1 && 'bg-gray-50',
                    hoverable && 'hover:bg-gray-50',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-blue-50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <td
                      className={cn(compact ? 'px-3 py-2' : 'px-6 py-4')}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(rowId)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => {
                    const value = column.render
                      ? column.render(item, rowIndex)
                      : (item[column.key as keyof T] as React.ReactNode)

                    return (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'text-sm text-gray-900',
                          compact ? 'px-3 py-2' : 'px-6 py-4',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                      >
                        {value}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

Table.displayName = 'Table'

/**
 * Table Pagination Component
 */
export interface TablePaginationProps {
  /**
   * Current page (0-indexed)
   */
  currentPage: number

  /**
   * Total pages
   */
  totalPages: number

  /**
   * Page change handler
   */
  onPageChange: (page: number) => void

  /**
   * Items per page
   */
  pageSize?: number

  /**
   * Total items
   */
  totalItems?: number

  /**
   * Page size options
   */
  pageSizeOptions?: number[]

  /**
   * Page size change handler
   */
  onPageSizeChange?: (pageSize: number) => void

  /**
   * Compact size
   */
  compact?: boolean

  /**
   * Custom class
   */
  className?: string
}

export const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  compact,
  className,
}: TablePaginationProps) => {
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems || 0)

  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-gray-200',
        compact ? 'px-3 py-2' : 'px-6 py-4',
        className
      )}
    >
      {/* Info */}
      <div className="flex items-center gap-4">
        {totalItems !== undefined && (
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        )}

        {/* Page size selector */}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border-gray-300 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter((page) => {
              // Show first, last, current, and adjacent pages
              return (
                page === 0 ||
                page === totalPages - 1 ||
                Math.abs(page - currentPage) <= 1
              )
            })
            .map((page, index, array) => {
              // Show ellipsis
              const prevPage = array[index - 1]
              if (prevPage !== undefined && page - prevPage > 1) {
                return (
                  <React.Fragment key={`ellipsis-${page}`}>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => onPageChange(page)}
                      className={cn(
                        'rounded-md px-3 py-1 text-sm',
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {page + 1}
                    </button>
                  </React.Fragment>
                )
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'rounded-md px-3 py-1 text-sm',
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {page + 1}
                </button>
              )
            })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

TablePagination.displayName = 'TablePagination'
