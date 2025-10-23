/**
 * Form Hook
 *
 * Type-safe form management with validation.
 *
 * Features:
 * - Zod schema validation
 * - Type-safe form state
 * - Error handling
 * - Submit handling
 * - Reset functionality
 * - Dirty state tracking
 *
 * Usage:
 * ```typescript
 * const form = useForm({
 *   schema: userSchema,
 *   onSubmit: async (data) => {
 *     await api.createUser(data)
 *   }
 * })
 *
 * <form onSubmit={form.handleSubmit}>
 *   <input {...form.register('email')} />
 *   {form.errors.email && <span>{form.errors.email}</span>}
 *   <button disabled={form.isSubmitting}>Submit</button>
 * </form>
 * ```
 */

'use client'

import { useState, useCallback, FormEvent, ChangeEvent } from 'react'
import { z } from 'zod'

export interface UseFormOptions<T extends z.ZodTypeAny> {
  schema: T
  defaultValues?: Partial<z.infer<T>>
  onSubmit: (data: z.infer<T>) => Promise<void> | void
  onError?: (errors: Record<string, string>) => void
}

export interface UseFormReturn<T> {
  values: Partial<T>
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  register: (name: keyof T) => {
    name: string
    value: any
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    onBlur: () => void
  }
  handleSubmit: (e: FormEvent) => Promise<void>
  setValue: (name: keyof T, value: any) => void
  setError: (name: keyof T, error: string) => void
  clearErrors: () => void
  reset: (values?: Partial<T>) => void
  validate: () => boolean
}

export function useForm<T extends z.ZodTypeAny>({
  schema,
  defaultValues = {},
  onSubmit,
  onError
}: UseFormOptions<T>): UseFormReturn<z.infer<T>> {
  type FormData = z.infer<T>

  const [values, setValues] = useState<Partial<FormData>>(defaultValues)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Register field
  const register = useCallback((name: keyof FormData) => {
    return {
      name: String(name),
      value: values[name] ?? '',
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value

        setValues(prev => ({ ...prev, [name]: value }))
        setIsDirty(true)

        // Clear error on change
        if (errors[name]) {
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[name]
            return newErrors
          })
        }
      },
      onBlur: () => {
        setTouched(prev => ({ ...prev, [name]: true }))

        // Validate field on blur
        try {
          if (schema instanceof z.ZodObject) {
            const fieldSchema = schema.shape[name as string]
            if (fieldSchema) {
              fieldSchema.parse(values[name])
            }
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            setErrors(prev => ({
              ...prev,
              [name]: error.errors[0].message
            }))
          }
        }
      }
    }
  }, [values, errors, schema])

  // Set field value programmatically
  const setValue = useCallback((name: keyof FormData, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setIsDirty(true)
  }, [])

  // Set field error
  const setError = useCallback((name: keyof FormData, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  // Validate form
  const validate = useCallback((): boolean => {
    try {
      schema.parse(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message
          }
        })
        setErrors(newErrors)

        if (onError) {
          onError(newErrors as Record<string, string>)
        }
      }
      return false
    }
  }, [values, schema, onError])

  // Handle form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof FormData] = true
      return acc
    }, {} as Partial<Record<keyof FormData, boolean>>)
    setTouched(allTouched)

    // Validate
    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(values as FormData)
    } catch (error) {
      console.error('Form submission error:', error)

      if (error instanceof Error) {
        setErrors({ _form: error.message } as any)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit, isSubmitting])

  // Reset form
  const reset = useCallback((newValues?: Partial<FormData>) => {
    setValues(newValues || defaultValues)
    setErrors({})
    setTouched({})
    setIsDirty(false)
    setIsSubmitting(false)
  }, [defaultValues])

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    validate
  }
}

/**
 * Example usage
 */
export function ExampleForm() {
  const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
  })

  const form = useForm({
    schema: userSchema,
    defaultValues: {
      email: '',
      password: '',
      name: ''
    },
    onSubmit: async (data) => {
      console.log('Submitting:', data)
      // await api.createUser(data)
    }
  })

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <div>
        <label>Email</label>
        <input
          type="email"
          {...form.register('email')}
          className="border rounded px-3 py-2 w-full"
        />
        {form.errors.email && form.touched.email && (
          <span className="text-red-600 text-sm">{form.errors.email}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          {...form.register('password')}
          className="border rounded px-3 py-2 w-full"
        />
        {form.errors.password && form.touched.password && (
          <span className="text-red-600 text-sm">{form.errors.password}</span>
        )}
      </div>

      <div>
        <label>Name</label>
        <input
          type="text"
          {...form.register('name')}
          className="border rounded px-3 py-2 w-full"
        />
        {form.errors.name && form.touched.name && (
          <span className="text-red-600 text-sm">{form.errors.name}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={form.isSubmitting || !form.isValid}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {form.isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
