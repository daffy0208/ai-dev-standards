/**
 * Rating Component
 *
 * Star rating component for displaying and collecting ratings.
 * Supports read-only and interactive modes with half-star precision.
 *
 * @example
 * ```tsx
 * // Read-only rating display
 * <Rating value={4.5} readOnly />
 *
 * // Interactive rating
 * <Rating
 *   value={rating}
 *   onChange={(value) => setRating(value)}
 *   label="Rate this product"
 * />
 *
 * // Custom max rating
 * <Rating
 *   value={3}
 *   onChange={(value) => setRating(value)}
 *   max={10}
 * />
 *
 * // With half-star support
 * <Rating
 *   value={3.5}
 *   onChange={(value) => setRating(value)}
 *   allowHalf
 * />
 *
 * // Custom size
 * <Rating
 *   value={4}
 *   readOnly
 *   size="lg"
 * />
 * ```
 */

import * as React from 'react';
import { cn } from './utils';

export interface RatingProps {
  /**
   * Current rating value
   */
  value?: number;

  /**
   * Callback when rating changes
   */
  onChange?: (value: number) => void;

  /**
   * Maximum rating value
   */
  max?: number;

  /**
   * Allow half-star ratings
   */
  allowHalf?: boolean;

  /**
   * Read-only mode (no interaction)
   */
  readOnly?: boolean;

  /**
   * Label for the rating
   */
  label?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the rating is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Rating component for star ratings
 */
export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value = 0,
      onChange,
      max = 5,
      allowHalf = false,
      readOnly = false,
      label,
      size = 'md',
      disabled = false,
      className,
    },
    ref
  ) => {
    const ratingId = React.useId();
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const [isHovering, setIsHovering] = React.useState(false);

    const displayValue = isHovering && hoverValue !== null ? hoverValue : value;

    // Size map
    const sizeMap = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    // Handle star click
    const handleClick = (starValue: number) => {
      if (readOnly || disabled || !onChange) return;
      onChange(starValue);
    };

    // Handle mouse move (for half-star)
    const handleMouseMove = (
      e: React.MouseEvent<HTMLButtonElement>,
      starIndex: number
    ) => {
      if (readOnly || disabled || !allowHalf) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isLeftHalf = x < rect.width / 2;

      setHoverValue(starIndex + (isLeftHalf ? 0.5 : 1));
    };

    // Handle mouse enter/leave
    const handleMouseEnter = () => {
      if (!readOnly && !disabled) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setHoverValue(null);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
      if (readOnly || disabled || !onChange) return;

      let newValue = value;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newValue = Math.min(max, value + (allowHalf ? 0.5 : 1));
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newValue = Math.max(0, value - (allowHalf ? 0.5 : 1));
        e.preventDefault();
      } else if (e.key === 'Home') {
        newValue = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        newValue = max;
        e.preventDefault();
      }

      if (newValue !== value) {
        onChange(newValue);
      }
    };

    // Generate star elements
    const stars = Array.from({ length: max }, (_, index) => {
      const starValue = index + 1;
      const fillPercentage = Math.min(100, Math.max(0, (displayValue - index) * 100));

      const isFilled = fillPercentage === 100;
      const isHalfFilled = fillPercentage > 0 && fillPercentage < 100;
      const isEmpty = fillPercentage === 0;

      return (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(starValue)}
          onMouseMove={(e) => handleMouseMove(e, index)}
          onMouseEnter={handleMouseEnter}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={readOnly || disabled}
          className={cn(
            'relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded',
            'transition-transform',
            !readOnly && !disabled && 'hover:scale-110',
            readOnly || disabled ? 'cursor-default' : 'cursor-pointer'
          )}
          aria-label={`Rate ${starValue} out of ${max}`}
          tabIndex={readOnly || disabled ? -1 : 0}
        >
          {/* Background star (empty) */}
          <svg
            className={cn(sizeMap[size], 'text-gray-300')}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {/* Filled star */}
          {(isFilled || isHalfFilled) && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                width: `${fillPercentage}%`,
              }}
            >
              <svg
                className={cn(
                  sizeMap[size],
                  'text-yellow-400',
                  isHovering && 'text-yellow-500'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </button>
      );
    });

    return (
      <div ref={ref} className={cn('inline-flex flex-col', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={ratingId}
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1.5',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Stars */}
        <div
          id={ratingId}
          role="radiogroup"
          aria-label={label || 'Rating'}
          aria-readonly={readOnly}
          aria-disabled={disabled}
          className="flex items-center gap-1"
          onMouseLeave={handleMouseLeave}
        >
          {stars}

          {/* Value display */}
          {readOnly && (
            <span className="ml-2 text-sm text-gray-600">
              {value.toFixed(allowHalf ? 1 : 0)} / {max}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Rating.displayName = 'Rating';
