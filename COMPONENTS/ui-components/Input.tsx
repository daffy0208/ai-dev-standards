/**
 * Input Component
 *
 * A form input component with label, error states, and accessibility features.
 * Includes show/hide password toggle for password inputs.
 *
 * @example
 * ```tsx
 * // Basic text input
 * <Input
 *   label="Username"
 *   placeholder="Enter your username"
 *   required
 * />
 *
 * // Email input with error
 * <Input
 *   type="email"
 *   label="Email"
 *   error="Please enter a valid email address"
 *   placeholder="you@example.com"
 * />
 *
 * // Password input with toggle
 * <Input
 *   type="password"
 *   label="Password"
 *   placeholder="Enter your password"
 *   required
 * />
 *
 * // Number input disabled
 * <Input
 *   type="number"
 *   label="Age"
 *   placeholder="Enter your age"
 *   disabled
 * />
 * ```
 */

import * as React from 'react'
import { cn } from './utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Input label text
   */
  label?: string

  /**
   * Error message to display
   */
  error?: string

  /**
   * Input type
   */
  type?: 'text' | 'password' | 'email' | 'number'

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Whether the input is disabled
   */
  disabled?: boolean

  /**
   * Whether the input is required
   */
  required?: boolean

  /**
   * Additional CSS classes for the input
   */
  className?: string
}

/**
 * Input component with label and error states
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      type = 'text',
      placeholder,
      disabled,
      required,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`

    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev)
    }

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block text-sm font-medium mb-1.5',
              error ? 'text-red-600' : 'text-gray-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              // Base styles
              'w-full px-3 py-2 text-sm rounded-md border transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'placeholder:text-gray-400',

              // Default state
              'border-gray-300 bg-white text-gray-900',
              'focus:border-blue-500 focus:ring-blue-500',

              // Error state
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',

              // Disabled state
              disabled && 'cursor-not-allowed opacity-50 bg-gray-50',

              // Add padding for password toggle button
              isPassword && 'pr-10',

              className
            )}
            {...props}
          />

          {/* Password Toggle Button */}
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={cn(
                'absolute right-0 top-0 h-full px-3',
                'text-gray-400 hover:text-gray-600',
                'focus:outline-none focus:text-gray-600',
                'transition-colors',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {showPassword ? (
                // Eye slash icon (hide)
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                // Eye icon (show)
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
