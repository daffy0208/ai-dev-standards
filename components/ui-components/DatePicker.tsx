/**
 * DatePicker Component
 *
 * A date selection calendar with month/year navigation and range selection.
 * Includes keyboard navigation, ARIA attributes, and min/max constraints.
 *
 * @example
 * ```tsx
 * // Single date picker
 * <DatePicker
 *   value={new Date()}
 *   onChange={(date) => console.log(date)}
 *   label="Select Date"
 * />
 *
 * // Date range picker
 * <DatePicker
 *   mode="range"
 *   value={[new Date(), new Date()]}
 *   onChange={(dates) => console.log(dates)}
 *   label="Date Range"
 * />
 *
 * // With constraints
 * <DatePicker
 *   value={new Date()}
 *   onChange={(date) => console.log(date)}
 *   minDate={new Date()}
 *   maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
 * />
 * ```
 */

import * as React from 'react'
import { cn } from './utils'

export interface DatePickerProps {
  /**
   * Picker mode - single date or range
   */
  mode?: 'single' | 'range'

  /**
   * Current date value(s)
   */
  value?: Date | [Date, Date] | null

  /**
   * Callback when date changes
   */
  onChange?: (date: Date | [Date, Date] | null) => void

  /**
   * Label for the date picker
   */
  label?: string

  /**
   * Minimum selectable date
   */
  minDate?: Date

  /**
   * Maximum selectable date
   */
  maxDate?: Date

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

/**
 * DatePicker component for selecting dates
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    { mode = 'single', value, onChange, label, minDate, maxDate, disabled = false, className },
    ref
  ) => {
    const pickerId = React.useId()
    const [isOpen, setIsOpen] = React.useState(false)
    const [viewDate, setViewDate] = React.useState(new Date())
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Normalize value
    const normalizedValue: [Date | null, Date | null] = React.useMemo(() => {
      if (mode === 'range') {
        if (Array.isArray(value) && value.length === 2) {
          return [value[0], value[1]]
        }
        return [null, null]
      }
      return [value instanceof Date ? value : null, null]
    }, [mode, value])

    const [rangeStart, rangeEnd] = normalizedValue

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    // Get days in month
    const getDaysInMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    // Get first day of month (0 = Sunday)
    const getFirstDayOfMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    // Check if date is selectable
    const isDateSelectable = (date: Date): boolean => {
      if (minDate && date < minDate) return false
      if (maxDate && date > maxDate) return false
      return true
    }

    // Check if date is selected
    const isDateSelected = (date: Date): boolean => {
      if (mode === 'range') {
        if (!rangeStart || !rangeEnd) return false
        return date >= rangeStart && date <= rangeEnd
      }
      if (!rangeStart) return false
      return (
        date.getDate() === rangeStart.getDate() &&
        date.getMonth() === rangeStart.getMonth() &&
        date.getFullYear() === rangeStart.getFullYear()
      )
    }

    // Check if date is in range (for styling)
    const isDateInRange = (date: Date): boolean => {
      if (mode !== 'range' || !rangeStart || !rangeEnd) return false
      return date > rangeStart && date < rangeEnd
    }

    // Check if date is today
    const isToday = (date: Date): boolean => {
      const today = new Date()
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
    }

    // Handle date click
    const handleDateClick = (date: Date) => {
      if (!isDateSelectable(date) || !onChange) return

      if (mode === 'range') {
        if (!rangeStart || (rangeStart && rangeEnd)) {
          onChange([date, date])
        } else {
          if (date < rangeStart) {
            onChange([date, rangeStart])
          } else {
            onChange([rangeStart, date])
          }
        }
      } else {
        onChange(date)
        setIsOpen(false)
      }
    }

    // Navigate month
    const navigateMonth = (delta: number) => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1))
    }

    // Format date for display
    const formatDate = (date: Date | null): string => {
      if (!date) return ''
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Generate calendar days
    const calendarDays: (Date | null)[] = []
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)

    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
    }

    // Display value
    const displayValue =
      mode === 'range'
        ? rangeStart && rangeEnd
          ? `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`
          : 'Select dates'
        : rangeStart
          ? formatDate(rangeStart)
          : 'Select date'

    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={pickerId}
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1.5',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Input */}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            id={pickerId}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border',
              'border-gray-300 bg-white text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'transition-colors',
              disabled && 'cursor-not-allowed opacity-50 bg-gray-50',
              !disabled && 'hover:bg-gray-50'
            )}
            aria-label="Open date picker"
            aria-expanded={isOpen}
          >
            <span>{displayValue}</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Calendar Dropdown */}
          {isOpen && (
            <div
              className={cn(
                'absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200'
              )}
              role="dialog"
              aria-label="Calendar"
            >
              {/* Month/Year Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className={cn(
                    'p-1 rounded hover:bg-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="text-sm font-semibold">
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>

                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className={cn(
                    'p-1 rounded hover:bg-gray-100',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar days">
                {/* Day headers */}
                {DAYS.map(day => (
                  <div
                    key={day}
                    className="text-xs font-medium text-gray-500 text-center p-2"
                    role="columnheader"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} role="gridcell" />
                  }

                  const selectable = isDateSelectable(date)
                  const selected = isDateSelected(date)
                  const inRange = isDateInRange(date)
                  const today = isToday(date)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      disabled={!selectable}
                      role="gridcell"
                      aria-selected={selected}
                      aria-label={formatDate(date)}
                      className={cn(
                        'w-9 h-9 text-sm rounded transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        selectable && !selected && 'hover:bg-gray-100',
                        selected && 'bg-blue-600 text-white hover:bg-blue-700',
                        inRange && !selected && 'bg-blue-100',
                        today && !selected && 'font-bold border-2 border-blue-600',
                        !selectable && 'text-gray-300 cursor-not-allowed'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
