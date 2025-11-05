/**
 * Supabase Server Integration
 *
 * Server-side Supabase client for Next.js App Router, API routes, and server components.
 *
 * Features:
 * - Cookie-based auth
 * - Server-side data fetching
 * - Middleware integration
 * - Admin operations
 *
 * Usage in Server Components:
 * ```typescript
 * import { createServerClient } from './server'
 *
 * export default async function Page() {
 *   const supabase = createServerClient()
 *   const { data } = await supabase.from('users').select()
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 *
 * Usage in API Routes:
 * ```typescript
 * import { createServerClient } from './server'
 *
 * export async function GET(request: Request) {
 *   const supabase = createServerClient()
 *   const { data } = await supabase.from('users').select()
 *   return Response.json(data)
 * }
 * ```
 */

import { createServerClient as createClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './client'

/**
 * Create Supabase client for Next.js Server Components
 */
export function createServerClient() {
  const cookieStore = cookies()

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies() error in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookies() error in Server Components
          }
        },
      },
    }
  )
}

/**
 * Create Supabase client for Next.js Route Handlers
 */
export function createRouteHandlerClient() {
  const cookieStore = cookies()

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

/**
 * Create Supabase middleware client
 */
export function createMiddlewareClient(req: Request, res: Response) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookie(req, name)
        },
        set(name: string, value: string, options: CookieOptions) {
          setCookie(res, name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          setCookie(res, name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
}

/**
 * Helper: Get cookie from request
 */
function getCookie(req: Request, name: string): string | undefined {
  const cookies = req.headers.get('cookie')
  if (!cookies) return undefined

  const cookie = cookies.split(';').find((c) => c.trim().startsWith(`${name}=`))
  return cookie?.split('=')[1]
}

/**
 * Helper: Set cookie in response
 */
function setCookie(
  res: Response,
  name: string,
  value: string,
  options: CookieOptions
) {
  const cookie = `${name}=${value}; Path=${options.path || '/'}; ${
    options.maxAge ? `Max-Age=${options.maxAge};` : ''
  } ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} ${
    options.sameSite ? `SameSite=${options.sameSite};` : ''
  }`

  res.headers.append('Set-Cookie', cookie)
}

/**
 * Server-side auth helpers
 */
export const serverAuth = {
  /**
   * Get current user on server
   */
  async getUser() {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Get current session on server
   */
  async getSession() {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Require authenticated user (throws if not authenticated)
   */
  async requireUser() {
    const user = await this.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }
    return user
  },

  /**
   * Check if user has specific role
   */
  async hasRole(role: string): Promise<boolean> {
    const user = await this.getUser()
    if (!user) return false

    // Assuming roles are stored in user metadata
    const userRoles = user.user_metadata?.roles as string[] || []
    return userRoles.includes(role)
  },

  /**
   * Require specific role (throws if not authorized)
   */
  async requireRole(role: string) {
    const hasAccess = await this.hasRole(role)
    if (!hasAccess) {
      throw new Error('Forbidden')
    }
  }
}

/**
 * Example: Protected API Route
 */
export async function protectedApiExample() {
  try {
    // Require authentication
    const user = await serverAuth.requireUser()

    // Require admin role
    await serverAuth.requireRole('admin')

    const supabase = createRouteHandlerClient()
    const { data } = await supabase.from('users').select()

    return Response.json({ data })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return Response.json({ error: 'Please sign in' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return Response.json({ error: 'Access denied' }, { status: 403 })
      }
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Example: Server Component with auth
 */
export async function serverComponentExample() {
  const user = await serverAuth.getUser()

  if (!user) {
    return <div>Please sign in</div>
  }

  const supabase = createServerClient()
  const { data: users } = await supabase.from('users').select()

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  )
}
