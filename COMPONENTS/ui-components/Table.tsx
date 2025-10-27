/**
 * Table component with sorting and pagination
 *
 * @example
 * ```tsx
 * // Basic table with sorting
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   role: string;
 * }
 *
 * const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
 *
 * const columns: TableColumn<User>[] = [
 *   { key: 'id', label: 'ID', sortable: true, width: '80px' },
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'email', label: 'Email', sortable: true },
 *   {
 *     key: 'role',
 *     label: 'Role',
 *     sortable: true,
 *     render: (value) => (
 *       <span className={cn(
 *         'px-2 py-1 rounded-full text-xs font-medium',
 *         value === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
 *       )}>
 *         {value}
 *       </span>
 *     )
 *   }
 * ];
 *
 * const users: User[] = [
 *   { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
 *   { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
 * ];
 *
 * // Sort data
 * const sortedData = React.useMemo(() => {
 *   if (!sortConfig) return users;
 *
 *   return [...users].sort((a, b) => {
 *     const aValue = a[sortConfig.key as keyof User];
 *     const bValue = b[sortConfig.key as keyof User];
 *
 *     if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
 *     if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
 *     return 0;
 *   });
 * }, [users, sortConfig]);
 *
 * <Table
 *   columns={columns}
 *   data={sortedData}
 *   sortable
 *   onSort={setSortConfig}
 *   striped
 *   hoverable
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Table with custom rendering and row clicks
 * const columns: TableColumn[] = [
 *   { key: 'product', label: 'Product', sortable: true },
 *   {
 *     key: 'price',
 *     label: 'Price',
 *     sortable: true,
 *     align: 'right',
 *     render: (value) => `$${value.toFixed(2)}`
 *   },
 *   {
 *     key: 'stock',
 *     label: 'Stock',
 *     align: 'center',
 *     render: (value) => value > 0 ? (
 *       <span className="text-green-600">In Stock</span>
 *     ) : (
 *       <span className="text-red-600">Out of Stock</span>
 *     )
 *   }
 * ];
 *
 * <Table
 *   columns={columns}
 *   data={products}
 *   onRowClick={(row) => console.log('Clicked:', row)}
 *   bordered
 *   compact
 * />
 * ```
 */

import React from 'react';
import { cn } from './utils';

/**
 * Table column configuration
 */
export interface TableColumn<T = any> {
  /** Unique key for the column (maps to data object key) */
  key: string;
  /** Column header label */
  label: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom className for cells */
  className?: string;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Table component props
 */
export interface TableProps<T = any> {
  /** Array of column configurations */
  columns: TableColumn<T>[];
  /** Array of data objects */
  data: T[];
  /** Enable sorting functionality */
  sortable?: boolean;
  /** Sort change handler */
  onSort?: (sortConfig: SortConfig | null) => void;
  /** Custom className */
  className?: string;
  /** Enable striped rows */
  striped?: boolean;
  /** Enable bordered cells */
  bordered?: boolean;
  /** Enable compact spacing */
  compact?: boolean;
  /** Enable hover effect on rows */
  hoverable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Custom row className */
  rowClassName?: string | ((row: T, index: number) => string);
}

export function Table<T = any>({
  columns,
  data,
  sortable = false,
  onSort,
  className,
  striped = false,
  bordered = false,
  compact = false,
  hoverable = true,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowClassName,
}: TableProps<T>) {
  const [internalSortConfig, setInternalSortConfig] = React.useState<SortConfig | null>(null);

  const currentSortConfig = onSort ? undefined : internalSortConfig;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const newSortConfig: SortConfig =
      currentSortConfig?.key === columnKey && currentSortConfig.direction === 'asc'
        ? { key: columnKey, direction: 'desc' }
        : { key: columnKey, direction: 'asc' };

    if (onSort) {
      onSort(newSortConfig);
    } else {
      setInternalSortConfig(newSortConfig);
    }
  };

  const getSortIcon = (columnKey: string, isSortable: boolean) => {
    if (!sortable || !isSortable) return null;

    const isActive = currentSortConfig?.key === columnKey;
    const direction = currentSortConfig?.direction;

    return (
      <span className="ml-1 inline-flex flex-col" aria-hidden="true">
        <svg
          className={cn(
            'h-3 w-3 -mb-1',
            isActive && direction === 'asc' ? 'text-blue-600' : 'text-gray-400'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 10l5-5 5 5H5z" />
        </svg>
        <svg
          className={cn(
            'h-3 w-3',
            isActive && direction === 'desc' ? 'text-blue-600' : 'text-gray-400'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M15 10l-5 5-5-5h10z" />
        </svg>
      </span>
    );
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getRowClassName = (row: T, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName;
  };

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table
        className={cn(
          'w-full border-collapse',
          bordered && 'border border-gray-300'
        )}
        role="table"
      >
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: column.width }}
                className={cn(
                  'font-medium text-gray-700',
                  compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
                  getAlignmentClass(column.align),
                  bordered && 'border border-gray-300',
                  column.sortable && sortable && 'cursor-pointer select-none hover:bg-gray-100',
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.key)}
                aria-sort={
                  currentSortConfig?.key === column.key
                    ? currentSortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                tabIndex={column.sortable && sortable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (column.sortable && sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(column.key);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{column.label}</span>
                  {getSortIcon(column.key, column.sortable || false)}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  'text-center text-gray-500',
                  compact ? 'px-3 py-8 text-sm' : 'px-4 py-12'
                )}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-5 w-5 animate-spin text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  'text-center text-gray-500',
                  compact ? 'px-3 py-8 text-sm' : 'px-4 py-12'
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  striped && rowIndex % 2 === 1 && 'bg-gray-50',
                  hoverable && 'transition-colors hover:bg-gray-100',
                  onRowClick && 'cursor-pointer',
                  getRowClassName(row, rowIndex)
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row, rowIndex);
                  }
                }}
              >
                {columns.map((column) => {
                  const value = (row as any)[column.key];
                  const content = column.render
                    ? column.render(value, row, rowIndex)
                    : value;

                  return (
                    <td
                      key={column.key}
                      className={cn(
                        'text-gray-900',
                        compact ? 'px-3 py-2 text-sm' : 'px-4 py-3',
                        getAlignmentClass(column.align),
                        bordered && 'border border-gray-300',
                        column.className
                      )}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

Table.displayName = 'Table';

/**
 * Hook for managing table sorting state
 *
 * @example
 * ```tsx
 * const { sortedData, sortConfig, handleSort } = useTableSort(data);
 *
 * <Table
 *   columns={columns}
 *   data={sortedData}
 *   sortable
 *   onSort={handleSort}
 * />
 * ```
 */
export function useTableSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  return {
    sortedData,
    sortConfig,
    handleSort: setSortConfig,
  };
}
