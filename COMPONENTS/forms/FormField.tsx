/**
 * Form Field Components
 *
 * Reusable form field components with labels, errors, and help text.
 *
 * Features:
 * - Consistent styling
 * - Error display
 * - Help text
 * - Required indicator
 * - Multiple input types
 * - Accessible (ARIA labels)
 *
 * Usage:
 * ```typescript
 * <FormField
 *   label="Email"
 *   error={errors.email}
 *   required
 * >
 *   <input type="email" {...register('email')} />
 * </FormField>
 * ```
 */

'use client'

import { ReactNode } from 'react'

export interface FormFieldProps {
  label: string
  children: ReactNode
  error?: string
  helpText?: string
  required?: boolean
  className?: string
}

/**
 * Basic form field wrapper
 */
export function FormField({
  label,
  children,
  error,
  helpText,
  required,
  className = ''
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

/**
 * Input field with built-in styling
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
}

export function Input({ label, error, helpText, required, className = '', ...props }: InputProps) {
  return (
    <FormField label={label} error={error} helpText={helpText} required={required}>
      <input
        {...props}
        required={required}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        } ${className}`}
      />
    </FormField>
  )
}

/**
 * Textarea field
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helpText?: string
}

export function Textarea({ label, error, helpText, required, className = '', ...props }: TextareaProps) {
  return (
    <FormField label={label} error={error} helpText={helpText} required={required}>
      <textarea
        {...props}
        required={required}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-vertical ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        } ${className}`}
      />
    </FormField>
  )
}

/**
 * Select field
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Array<{ value: string; label: string }>
  error?: string
  helpText?: string
  placeholder?: string
}

export function Select({
  label,
  options,
  error,
  helpText,
  required,
  placeholder,
  className = '',
  ...props
}: SelectProps) {
  return (
    <FormField label={label} error={error} helpText={helpText} required={required}>
      <select
        {...props}
        required={required}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

/**
 * Checkbox field
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
}

export function Checkbox({ label, error, helpText, className = '', ...props }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...props}
          className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className}`}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

/**
 * Radio group
 */
export interface RadioGroupProps {
  label: string
  options: Array<{ value: string; label: string }>
  name: string
  value?: string
  onChange: (value: string) => void
  error?: string
  helpText?: string
  required?: boolean
}

export function RadioGroup({
  label,
  options,
  name,
  value,
  onChange,
  error,
  helpText,
  required
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

/**
 * File input
 */
export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  helpText?: string
  accept?: string
  maxSize?: number // in bytes
}

export function FileInput({
  label,
  error,
  helpText,
  required,
  accept,
  maxSize,
  onChange,
  className = '',
  ...props
}: FileInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file && maxSize && file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      e.target.value = ''
      return
    }

    if (onChange) {
      onChange(e)
    }
  }

  return (
    <FormField label={label} error={error} helpText={helpText} required={required}>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        } ${className}`}
      />
    </FormField>
  )
}

/**
 * Toggle switch
 */
export interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  helpText?: string
}

export function Toggle({ label, checked, onChange, helpText }: ToggleProps) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <label className="ml-3 text-sm text-gray-700">{label}</label>
      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

/**
 * Example: Complete form with all field types
 */
export function ExampleCompleteForm() {
  return (
    <form className="space-y-6 max-w-2xl">
      <Input
        label="Email"
        type="email"
        name="email"
        required
        helpText="We'll never share your email"
      />

      <Input
        label="Password"
        type="password"
        name="password"
        required
        error="Password must be at least 8 characters"
      />

      <Textarea
        label="Bio"
        name="bio"
        rows={4}
        helpText="Tell us about yourself"
      />

      <Select
        label="Country"
        name="country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' }
        ]}
        placeholder="Select a country"
      />

      <Checkbox
        label="I accept the terms and conditions"
        name="acceptTerms"
      />

      <RadioGroup
        label="Subscription Plan"
        name="plan"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro - $9.99/mo' },
          { value: 'enterprise', label: 'Enterprise - $99/mo' }
        ]}
        value="pro"
        onChange={(value) => console.log(value)}
      />

      <FileInput
        label="Profile Picture"
        name="avatar"
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        helpText="Max file size: 5MB"
      />

      <Toggle
        label="Email notifications"
        checked={true}
        onChange={(checked) => console.log(checked)}
        helpText="Receive email updates about your account"
      />

      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  )
}
