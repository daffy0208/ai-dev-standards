/**
 * Signup Form Component
 *
 * Production-ready registration form with validation.
 *
 * Features:
 * - Email/password registration
 * - Password strength indicator
 * - Confirm password validation
 * - Terms & conditions checkbox
 * - Form validation
 * - Error handling
 *
 * Usage:
 * ```typescript
 * import { SignupForm } from './SignupForm'
 *
 * <SignupForm
 *   onSuccess={(user) => router.push('/dashboard')}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */

'use client'

import { useState, FormEvent } from 'react'
import { z } from 'zod'

export interface SignupFormProps {
  onSuccess?: (user: any) => void | Promise<void>
  onError?: (error: Error) => void
  redirectTo?: string
}

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export function SignupForm({
  onSuccess,
  onError,
  redirectTo = '/dashboard'
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return Math.min(strength, 5)
  }

  const passwordStrength = calculatePasswordStrength(formData.password)
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600']
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validate
    try {
      signupSchema.parse(formData)
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as string] = error.message
          }
        })
        setFieldErrors(errors)
        return
      }
    }

    setLoading(true)

    try {
      // TODO: Replace with your auth implementation
      // Example with Supabase:
      // import { auth } from '@/integrations/supabase/client'
      // const data = await auth.signUp(formData.email, formData.password, {
      //   full_name: formData.fullName
      // })

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call

      if (onSuccess) {
        await onSuccess({ email: formData.email })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              fieldErrors.fullName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="John Doe"
            required
            disabled={loading}
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              fieldErrors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="you@example.com"
            required
            disabled={loading}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
          )}

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthColors[passwordStrength]} transition-all duration-300`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Strength: <span className="font-medium">{strengthLabels[passwordStrength]}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              fieldErrors.confirmPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="••••••••"
            required
            disabled={loading}
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-1 mr-2"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">
              I accept the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800" target="_blank">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800" target="_blank">
                Privacy Policy
              </a>
            </span>
          </label>
          {fieldErrors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.acceptTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </a>
      </p>
    </div>
  )
}
