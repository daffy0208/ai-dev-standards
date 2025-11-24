/**
 * Slider Component
 *
 * A range slider input component with single and range modes.
 * Includes keyboard support, ARIA attributes, and customizable min/max/step values.
 *
 * @example
 * ```tsx
 * // Single value slider
 * <Slider
 *   value={50}
 *   onChange={(value) => console.log(value)}
 *   min={0}
 *   max={100}
 *   step={1}
 *   label="Volume"
 * />
 *
 * // Range slider
 * <Slider
 *   mode="range"
 *   value={[25, 75]}
 *   onChange={(value) => console.log(value)}
 *   min={0}
 *   max={100}
 *   label="Price Range"
 *   showValue
 * />
 *
 * // Disabled slider
 * <Slider
 *   value={50}
 *   onChange={() => {}}
 *   disabled
 * />
 * ```
 */

import * as React from 'react'
import { cn } from './utils'

export interface SliderProps {
  /**
   * Slider mode - single value or range
   */
  mode?: 'single' | 'range'

  /**
   * Current value(s)
   */
  value?: number | [number, number]

  /**
   * Callback when value changes
   */
  onChange?: (value: number | [number, number]) => void

  /**
   * Minimum value
   */
  min?: number

  /**
   * Maximum value
   */
  max?: number

  /**
   * Step increment
   */
  step?: number

  /**
   * Label for the slider
   */
  label?: string

  /**
   * Show current value(s)
   */
  showValue?: boolean

  /**
   * Whether the slider is disabled
   */
  disabled?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Slider component for selecting numeric values
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      mode = 'single',
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      showValue = false,
      disabled = false,
      className
    },
    ref
  ) => {
    const sliderId = React.useId()
    const trackRef = React.useRef<HTMLDivElement>(null)

    // Normalize value
    const normalizedValue: [number, number] = React.useMemo(() => {
      if (mode === 'range') {
        return Array.isArray(value) ? value : [min, max]
      }
      return [typeof value === 'number' ? value : min, max]
    }, [mode, value, min, max])

    const [isDragging, setIsDragging] = React.useState<number | null>(null)

    // Calculate percentage position
    const getPercentage = (val: number): number => {
      return ((val - min) / (max - min)) * 100
    }

    // Get value from position
    const getValueFromPosition = (clientX: number): number => {
      if (!trackRef.current) return min

      const rect = trackRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    }

    // Handle mouse/touch move
    const handleMove = React.useCallback(
      (clientX: number) => {
        if (isDragging === null || !onChange) return

        const newValue = getValueFromPosition(clientX)

        if (mode === 'range') {
          const [low, high] = normalizedValue
          if (isDragging === 0) {
            onChange([Math.min(newValue, high), high])
          } else {
            onChange([low, Math.max(newValue, low)])
          }
        } else {
          onChange(newValue)
        }
      },
      [isDragging, normalizedValue, mode, onChange, getValueFromPosition]
    )

    // Mouse events
    const handleMouseDown = (index: number) => {
      if (disabled) return
      setIsDragging(index)
    }

    React.useEffect(() => {
      if (isDragging === null) return

      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX)
      }

      const handleMouseUp = () => {
        setIsDragging(null)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, handleMove])

    // Touch events
    const handleTouchMove = (e: React.TouchEvent) => {
      if (isDragging !== null && e.touches.length > 0) {
        handleMove(e.touches[0].clientX)
      }
    }

    // Keyboard events
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (disabled || !onChange) return

      let delta = 0
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        delta = step
        e.preventDefault()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        delta = -step
        e.preventDefault()
      } else if (e.key === 'Home') {
        delta = min - normalizedValue[index]
        e.preventDefault()
      } else if (e.key === 'End') {
        delta = max - normalizedValue[index]
        e.preventDefault()
      } else if (e.key === 'PageUp') {
        delta = (max - min) * 0.1
        e.preventDefault()
      } else if (e.key === 'PageDown') {
        delta = -(max - min) * 0.1
        e.preventDefault()
      }

      if (delta !== 0) {
        const currentValue = normalizedValue[index]
        const newValue = Math.max(min, Math.min(max, currentValue + delta))

        if (mode === 'range') {
          const [low, high] = normalizedValue
          if (index === 0) {
            onChange([Math.min(newValue, high), high])
          } else {
            onChange([low, Math.max(newValue, low)])
          }
        } else {
          onChange(newValue)
        }
      }
    }

    const leftPercentage = getPercentage(normalizedValue[0])
    const rightPercentage = mode === 'range' ? getPercentage(normalizedValue[1]) : 100

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className={cn('text-sm font-medium text-gray-700', disabled && 'opacity-50')}>
              {label}
            </label>
            {showValue && (
              <span className="text-sm text-gray-500">
                {mode === 'range'
                  ? `${normalizedValue[0]} - ${normalizedValue[1]}`
                  : normalizedValue[0]}
              </span>
            )}
          </div>
        )}

        {/* Slider Track */}
        <div
          ref={trackRef}
          className={cn(
            'relative h-2 rounded-full bg-gray-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onTouchMove={handleTouchMove}
        >
          {/* Active Range */}
          <div
            className={cn(
              'absolute h-full rounded-full bg-blue-600 transition-all',
              disabled && 'bg-gray-400'
            )}
            style={{
              left: `${mode === 'range' ? leftPercentage : 0}%`,
              right: `${100 - rightPercentage}%`
            }}
          />

          {/* Thumb(s) */}
          {mode === 'range' && (
            <div
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={normalizedValue[0]}
              aria-valuetext={`${normalizedValue[0]}`}
              aria-label={label ? `${label} minimum` : 'Minimum value'}
              aria-disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                'w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-md',
                'transition-transform hover:scale-110 focus:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
                disabled
                  ? 'cursor-not-allowed border-gray-400'
                  : 'cursor-grab active:cursor-grabbing'
              )}
              style={{ left: `${leftPercentage}%` }}
              onMouseDown={() => handleMouseDown(0)}
              onTouchStart={() => setIsDragging(0)}
              onTouchEnd={() => setIsDragging(null)}
              onKeyDown={e => handleKeyDown(e, 0)}
            />
          )}

          <div
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={mode === 'range' ? normalizedValue[1] : normalizedValue[0]}
            aria-valuetext={`${mode === 'range' ? normalizedValue[1] : normalizedValue[0]}`}
            aria-label={
              label
                ? mode === 'range'
                  ? `${label} maximum`
                  : label
                : mode === 'range'
                  ? 'Maximum value'
                  : 'Value'
            }
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
              'w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-md',
              'transition-transform hover:scale-110 focus:scale-110',
              'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
              disabled ? 'cursor-not-allowed border-gray-400' : 'cursor-grab active:cursor-grabbing'
            )}
            style={{
              left: `${mode === 'range' ? rightPercentage : leftPercentage}%`
            }}
            onMouseDown={() => handleMouseDown(mode === 'range' ? 1 : 0)}
            onTouchStart={() => setIsDragging(mode === 'range' ? 1 : 0)}
            onTouchEnd={() => setIsDragging(null)}
            onKeyDown={e => handleKeyDown(e, mode === 'range' ? 1 : 0)}
          />
        </div>
      </div>
    )
  }
)

Slider.displayName = 'Slider'
