/**
 * Protected Route Component
 *
 * Route protection wrapper for authenticated pages.
 *
 * Features:
 * - Automatic authentication check
 * - Redirect to login if not authenticated
 * - Loading state while checking auth
 * - Role-based access control
 * - Custom unauthorized handler
 *
 * Usage:
 * ```typescript
 * // Client Component
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 *
 * // With role check
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * // Server Component (use in layout.tsx)
 * import { ProtectedLayout } from './ProtectedRoute'
 *
 * export default async function DashboardLayout({ children }) {
 *   return <ProtectedLayout>{children}</ProtectedLayout>
 * }
 * ```
 */

'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  fallback?: ReactNode
  redirectTo?: string
  onUnauthorized?: () => void
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
  redirectTo = '/auth/login',
  onUnauthorized
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true)

      try {
        // TODO: Replace with your auth implementation
        // Example with Supabase:
        // import { auth } from '@/integrations/supabase/client'
        // const user = await auth.getUser()

        // Simulated auth check
        const user = null // Replace with actual user check

        if (!user) {
          setIsAuthorized(false)
          // Store intended destination for redirect after login
          const returnUrl = `${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`
          router.push(returnUrl)
          return
        }

        // Check role if required
        if (requiredRole) {
          // TODO: Replace with your role check implementation
          // Example:
          // const userRoles = user.user_metadata?.roles as string[] || []
          // const hasRole = userRoles.includes(requiredRole)

          const hasRole = false // Replace with actual role check

          if (!hasRole) {
            setIsAuthorized(false)
            if (onUnauthorized) {
              onUnauthorized()
            } else {
              router.push('/unauthorized')
            }
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthorized(false)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, requiredRole, redirectTo, router, onUnauthorized])

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthorized) {
    return null
  }

  // Render protected content
  return <>{children}</>
}

/**
 * Server Component version for Next.js App Router layouts
 */
import { redirect } from 'next/navigation'

export async function ProtectedLayout({
  children,
  requiredRole
}: {
  children: ReactNode
  requiredRole?: string
}) {
  // TODO: Replace with your server-side auth implementation
  // Example with Supabase:
  // import { serverAuth } from '@/integrations/supabase/server'
  // const user = await serverAuth.getUser()

  const user = null // Replace with actual server-side auth check

  if (!user) {
    redirect('/auth/login')
  }

  // Check role if required
  if (requiredRole) {
    // TODO: Replace with your role check
    // const userRoles = user.user_metadata?.roles as string[] || []
    // if (!userRoles.includes(requiredRole)) {
    //   redirect('/unauthorized')
    // }
  }

  return <>{children}</>
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: string
    redirectTo?: string
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        requiredRole={options?.requiredRole}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Hook for auth-gated functionality
 */
export function useRequireAuth(requiredRole?: string) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // TODO: Replace with your auth implementation
        // const user = await auth.getUser()

        const user = null // Replace with actual check

        if (!user) {
          router.push('/auth/login')
          return
        }

        if (requiredRole) {
          // Check role
          // const hasRole = user.user_metadata?.roles?.includes(requiredRole)
          // if (!hasRole) {
          //   router.push('/unauthorized')
          //   return
          // }
        }

        setUser(user)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, router])

  return { user, loading }
}

/**
 * Example: Protected page component
 */
export function ExampleDashboard() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>This content is only visible to authenticated users.</p>
      </div>
    </ProtectedRoute>
  )
}

/**
 * Example: Admin-only page
 */
export function ExampleAdminPanel() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p>This content is only visible to administrators.</p>
      </div>
    </ProtectedRoute>
  )
}

/**
 * Example: Using HOC
 */
function DashboardContent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  )
}

export const ProtectedDashboard = withAuth(DashboardContent)

/**
 * Example: Using hook
 */
export function ProfilePage() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p>Email: {user?.email}</p>
    </div>
  )
}
