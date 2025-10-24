/**
 * Input Component
 *
 * Reusable input component with various types, sizes, and states.
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error="Invalid email address"
 *   leftIcon={<MailIcon />}
 *   required
 * />
 * ```
 */

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Input variant
   */
  variant?: 'default' | 'filled' | 'flushed'

  /**
   * Error message
   */
  error?: string

  /**
   * Helper text
   */
  helperText?: string

  /**
   * Label text
   */
  label?: string

  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode

  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode

  /**
   * Full width
   */
  fullWidth?: boolean

  /**
   * Container class name
   */
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type = 'text',
      size = 'md',
      variant = 'default',
      error,
      helperText,
      label,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = React.useId()

    return (
      <div className={cn(fullWidth && 'w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1',
              disabled && 'text-gray-400',
              error && 'text-red-600'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400',
                size === 'sm' && 'pl-2 w-8',
                size === 'md' && 'pl-3 w-10',
                size === 'lg' && 'pl-4 w-12'
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              'block w-full rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',

              // Size variants
              size === 'sm' && 'px-3 py-1.5 text-sm',
              size === 'md' && 'px-4 py-2 text-base',
              size === 'lg' && 'px-5 py-3 text-lg',

              // Padding for icons
              leftIcon && size === 'sm' && 'pl-9',
              leftIcon && size === 'md' && 'pl-11',
              leftIcon && size === 'lg' && 'pl-14',
              rightIcon && size === 'sm' && 'pr-9',
              rightIcon && size === 'md' && 'pr-11',
              rightIcon && size === 'lg' && 'pr-14',

              // Variant styles
              variant === 'default' &&
                cn(
                  'border border-gray-300 bg-white',
                  'focus:border-blue-500 focus:ring-blue-500',
                  error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                ),
              variant === 'filled' &&
                cn(
                  'border-0 bg-gray-100',
                  'focus:bg-white focus:ring-blue-500',
                  error && 'bg-red-50 focus:ring-red-500'
                ),
              variant === 'flushed' &&
                cn(
                  'border-0 border-b-2 border-gray-300 rounded-none px-0',
                  'focus:border-blue-500 focus:ring-0',
                  error && 'border-red-500 focus:border-red-500'
                ),

              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400',
                size === 'sm' && 'pr-2 w-8',
                size === 'md' && 'pr-3 w-10',
                size === 'lg' && 'pr-4 w-12'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text / Error */}
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1 text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

/**
 * Textarea Component (similar to Input but for multiline text)
 */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled'
  error?: string
  helperText?: string
  label?: string
  fullWidth?: boolean
  containerClassName?: string
  resize?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      size = 'md',
      variant = 'default',
      error,
      helperText,
      label,
      fullWidth,
      disabled,
      required,
      resize = true,
      ...props
    },
    ref
  ) => {
    const textareaId = React.useId()

    return (
      <div className={cn(fullWidth && 'w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1',
              disabled && 'text-gray-400',
              error && 'text-red-600'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={cn(
            // Base styles
            'block w-full rounded-md transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !resize && 'resize-none',

            // Size variants
            size === 'sm' && 'px-3 py-1.5 text-sm',
            size === 'md' && 'px-4 py-2 text-base',
            size === 'lg' && 'px-5 py-3 text-lg',

            // Variant styles
            variant === 'default' &&
              cn(
                'border border-gray-300 bg-white',
                'focus:border-blue-500 focus:ring-blue-500',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              ),
            variant === 'filled' &&
              cn(
                'border-0 bg-gray-100',
                'focus:bg-white focus:ring-blue-500',
                error && 'bg-red-50 focus:ring-red-500'
              ),

            className
          )}
          {...props}
        />

        {/* Helper Text / Error */}
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1 text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
