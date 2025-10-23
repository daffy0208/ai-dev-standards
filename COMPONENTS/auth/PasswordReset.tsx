/**
 * Password Reset Component
 *
 * Two-step password reset flow: request reset email, then update password.
 *
 * Features:
 * - Email verification
 * - Password update form
 * - Password strength indicator
 * - Token validation
 * - Error handling
 *
 * Usage:
 * ```typescript
 * // Request reset page
 * <PasswordResetRequest onSuccess={() => showMessage('Check your email')} />
 *
 * // Update password page (with token from email)
 * <PasswordResetUpdate token={token} onSuccess={() => router.push('/login')} />
 * ```
 */

'use client'

import { useState, FormEvent } from 'react'
import { z } from 'zod'

// Request Reset Email Component
export interface PasswordResetRequestProps {
  onSuccess?: () => void | Promise<void>
  onError?: (error: Error) => void
}

const emailSchema = z.object({
  email: z.string().email('Invalid email address')
})

export function PasswordResetRequest({
  onSuccess,
  onError
}: PasswordResetRequestProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validate
    try {
      emailSchema.parse({ email })
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
      // await auth.resetPassword(email)

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call

      setSuccess(true)
      if (onSuccess) {
        await onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email'
      setError(errorMessage)
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage))
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in the email to reset your password. The link expires in 1 hour.
          </p>
          <a
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to sign in
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
      <p className="text-gray-600 mb-6 text-center">
        Enter your email and we'll send you a reset link
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <a href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </a>
      </p>
    </div>
  )
}

// Update Password Component
export interface PasswordResetUpdateProps {
  token: string
  onSuccess?: () => void | Promise<void>
  onError?: (error: Error) => void
}

const passwordUpdateSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export function PasswordResetUpdate({
  token,
  onSuccess,
  onError
}: PasswordResetUpdateProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

  const passwordStrength = calculatePasswordStrength(password)
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600']
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validate
    try {
      passwordUpdateSchema.parse({ password, confirmPassword })
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
      // await auth.updatePassword(password)

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call

      setSuccess(true)
      if (onSuccess) {
        await onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password'
      setError(errorMessage)
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage))
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated.
          </p>
          <a
            href="/auth/login"
            className="inline-block py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Set New Password</h2>
      <p className="text-gray-600 mb-6 text-center">
        Choose a strong password for your account
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Password Strength */}
          {password && (
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
