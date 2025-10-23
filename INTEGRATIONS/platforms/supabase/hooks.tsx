/**
 * Supabase React Hooks
 *
 * React hooks for easy Supabase integration in client components.
 *
 * Features:
 * - useUser - Get current user
 * - useSession - Get current session
 * - useAuth - Auth state and methods
 * - useQuery - Type-safe database queries
 * - useSubscription - Real-time subscriptions
 *
 * Usage:
 * ```typescript
 * import { useUser, useAuth } from './hooks'
 *
 * function Profile() {
 *   const user = useUser()
 *   const { signOut } = useAuth()
 *
 *   if (!user) return <div>Not signed in</div>
 *
 *   return (
 *     <div>
 *       <p>{user.email}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, auth, Database } from './client'

/**
 * Hook to get current user
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    auth.getUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

/**
 * Hook to get current session
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    auth.getSession().then((session) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}

/**
 * Hook for auth state and methods
 */
export function useAuth() {
  const { user, loading } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    setIsLoading(true)
    setError(null)
    try {
      await auth.signUp(email, password, metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await auth.signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await auth.signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await auth.resetPassword(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    loading: loading || isLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user
  }
}

/**
 * Hook for type-safe database queries
 */
export function useQuery<T extends keyof Database['public']['Tables']>(
  table: T,
  query?: (builder: any) => any
) {
  type Row = Database['public']['Tables'][T]['Row']

  const [data, setData] = useState<Row[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        let builder = supabase.from(table).select('*')

        if (query) {
          builder = query(builder)
        }

        const { data, error } = await builder

        if (error) throw error
        setData(data as Row[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query failed')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [table, query])

  return { data, loading, error }
}

/**
 * Hook for real-time subscriptions
 */
export function useSubscription<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: any) => void,
  filter?: { column: string; value: any }
) {
  useEffect(() => {
    let channel = supabase.channel(`${table}_subscription`)

    if (filter) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        callback
      )
    } else {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        callback
      )
    }

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [table, callback, filter])
}

/**
 * Hook for paginated queries
 */
export function usePaginatedQuery<T extends keyof Database['public']['Tables']>(
  table: T,
  pageSize: number = 10
) {
  type Row = Database['public']['Tables'][T]['Row']

  const [data, setData] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const { data: newData, error } = await supabase
        .from(table)
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) throw error

      if (!newData || newData.length < pageSize) {
        setHasMore(false)
      }

      setData((prev) => [...prev, ...(newData as Row[])])
      setPage((p) => p + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed')
    } finally {
      setLoading(false)
    }
  }, [table, page, pageSize, loading, hasMore])

  const reset = useCallback(() => {
    setData([])
    setPage(0)
    setHasMore(true)
  }, [])

  useEffect(() => {
    loadMore()
  }, []) // Only load on mount

  return { data, loading, error, hasMore, loadMore, reset }
}

/**
 * Example components using hooks
 */
export function UserProfile() {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  )
}

export function UserList() {
  const { data, loading, error } = useQuery('users')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return <div>No data</div>

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  )
}

export function RealtimeUsers() {
  const [users, setUsers] = useState<any[]>([])

  // Initial data
  useQuery('users')

  // Subscribe to changes
  useSubscription('users', (payload) => {
    console.log('Change received!', payload)
    // Update local state based on payload
  })

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  )
}

export function SignInForm() {
  const { signIn, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
