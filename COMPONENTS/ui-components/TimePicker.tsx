/**
 * TimePicker Component
 *
 * A time selection component with 12/24 hour format support.
 * Includes keyboard input, dropdown selection, and ARIA attributes.
 *
 * @example
 * ```tsx
 * // 24-hour format
 * <TimePicker
 *   value="14:30"
 *   onChange={(time) => console.log(time)}
 *   label="Select Time"
 * />
 *
 * // 12-hour format
 * <TimePicker
 *   value="02:30 PM"
 *   onChange={(time) => console.log(time)}
 *   format="12"
 *   label="Appointment Time"
 * />
 *
 * // Inline variant
 * <TimePicker
 *   value="14:30"
 *   onChange={(time) => console.log(time)}
 *   variant="inline"
 * />
 * ```
 */

import * as React from 'react';
import { cn } from './utils';

export interface TimePickerProps {
  /**
   * Current time value (HH:MM or HH:MM AM/PM)
   */
  value?: string;

  /**
   * Callback when time changes
   */
  onChange?: (time: string) => void;

  /**
   * Label for the time picker
   */
  label?: string;

  /**
   * Time format (12 or 24 hour)
   */
  format?: '12' | '24';

  /**
   * Display variant
   */
  variant?: 'dropdown' | 'inline';

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TimePicker component for selecting time
 */
export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value = '12:00',
      onChange,
      label,
      format = '24',
      variant = 'dropdown',
      disabled = false,
      className,
    },
    ref
  ) => {
    const pickerId = React.useId();
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Parse time value
    const parseTime = (
      timeStr: string
    ): { hours: number; minutes: number; period?: 'AM' | 'PM' } => {
      const match =
        format === '12'
          ? timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
          : timeStr.match(/(\d{1,2}):(\d{2})/);

      if (!match) return { hours: 12, minutes: 0, period: 'PM' };

      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period =
        format === '12' ? (match[3]?.toUpperCase() as 'AM' | 'PM') : undefined;

      return { hours, minutes, period };
    };

    const { hours, minutes, period } = parseTime(value);

    // Format time for display
    const formatTime = (h: number, m: number, p?: 'AM' | 'PM'): string => {
      const paddedHours = h.toString().padStart(2, '0');
      const paddedMinutes = m.toString().padStart(2, '0');

      if (format === '12') {
        return `${paddedHours}:${paddedMinutes} ${p || 'AM'}`;
      }
      return `${paddedHours}:${paddedMinutes}`;
    };

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle hour change
    const handleHourChange = (newHours: number) => {
      onChange?.(formatTime(newHours, minutes, period));
    };

    // Handle minute change
    const handleMinuteChange = (newMinutes: number) => {
      onChange?.(formatTime(hours, newMinutes, period));
    };

    // Handle period change (AM/PM)
    const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
      onChange?.(formatTime(hours, minutes, newPeriod));
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const regex =
        format === '12'
          ? /^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i
          : /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

      if (regex.test(inputValue)) {
        onChange?.(inputValue);
      }
    };

    // Generate hour options
    const hourOptions =
      format === '12'
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : Array.from({ length: 24 }, (_, i) => i);

    // Generate minute options (0, 15, 30, 45)
    const minuteOptions = [0, 15, 30, 45];

    // Render time controls
    const renderTimeControls = () => (
      <div className="flex items-center gap-2">
        {/* Hours */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Hours
          </label>
          <select
            value={hours}
            onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
            disabled={disabled}
            className={cn(
              'w-full px-2 py-1.5 text-sm rounded-md border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              disabled && 'cursor-not-allowed opacity-50 bg-gray-50'
            )}
            aria-label="Hours"
          >
            {hourOptions.map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <div className="text-2xl font-bold text-gray-400 mt-5">:</div>

        {/* Minutes */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Minutes
          </label>
          <select
            value={minutes}
            onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10))}
            disabled={disabled}
            className={cn(
              'w-full px-2 py-1.5 text-sm rounded-md border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              disabled && 'cursor-not-allowed opacity-50 bg-gray-50'
            )}
            aria-label="Minutes"
          >
            {minuteOptions.map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* Period (AM/PM) for 12-hour format */}
        {format === '12' && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={period}
              onChange={(e) =>
                handlePeriodChange(e.target.value as 'AM' | 'PM')
              }
              disabled={disabled}
              className={cn(
                'w-full px-2 py-1.5 text-sm rounded-md border border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                disabled && 'cursor-not-allowed opacity-50 bg-gray-50'
              )}
              aria-label="Period"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        )}
      </div>
    );

    if (variant === 'inline') {
      return (
        <div ref={ref} className={cn('w-full', className)}>
          {label && (
            <label
              className={cn(
                'block text-sm font-medium text-gray-700 mb-1.5',
                disabled && 'opacity-50'
              )}
            >
              {label}
            </label>
          )}
          {renderTimeControls()}
        </div>
      );
    }

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
            aria-label="Open time picker"
            aria-expanded={isOpen}
          >
            <span>{value}</span>
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div
              className={cn(
                'absolute z-50 mt-2 w-full p-4 bg-white rounded-lg shadow-lg border border-gray-200'
              )}
              role="dialog"
              aria-label="Time picker"
            >
              {renderTimeControls()}

              {/* Manual Input */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Or type time
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={handleInputChange}
                  placeholder={format === '12' ? '12:00 PM' : '14:30'}
                  disabled={disabled}
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-md border border-gray-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    disabled && 'cursor-not-allowed opacity-50 bg-gray-50'
                  )}
                  aria-label="Time input"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';
