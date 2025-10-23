/**
 * Supabase Client Integration
 *
 * Complete Supabase integration for auth, database, storage, and real-time.
 *
 * Features:
 * - Authentication (email, OAuth, magic links)
 * - Type-safe database queries
 * - Real-time subscriptions
 * - File storage
 * - Row-level security support
 * - Error handling
 *
 * Setup:
 * ```bash
 * npm install @supabase/supabase-js
 * ```
 *
 * Environment variables:
 * ```
 * NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 * SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 * ```
 *
 * Usage:
 * ```typescript
 * import { supabase } from './client'
 *
 * // Sign up
 * const { data, error } = await supabase.auth.signUp({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 *
 * // Query database
 * const { data: users } = await supabase
 *   .from('users')
 *   .select('*')
 *   .eq('status', 'active')
 * ```
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

// Database types (generate with: npx supabase gen types typescript)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      // Add more tables here
    }
  }
}

/**
 * Create Supabase client for browser/client-side
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Create Supabase admin client for server-side with elevated permissions
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Export singleton instance
export const supabase = createSupabaseClient()

/**
 * Authentication helpers
 */
export const auth = {
  /**
   * Sign up new user with email and password
   */
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) throw new Error(`Sign up failed: ${error.message}`)
    return data
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw new Error(`Sign in failed: ${error.message}`)
    return data
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'gitlab' | 'bitbucket') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw new Error(`OAuth sign in failed: ${error.message}`)
    return data
  },

  /**
   * Send magic link to email
   */
  async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw new Error(`Magic link failed: ${error.message}`)
    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(`Sign out failed: ${error.message}`)
  },

  /**
   * Get current user
   */
  async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw new Error(`Password reset failed: ${error.message}`)
    return data
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw new Error(`Password update failed: ${error.message}`)
    return data
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}

/**
 * Database query helpers
 */
export const db = {
  /**
   * Get all rows from a table
   */
  async getAll<T extends keyof Database['public']['Tables']>(
    table: T
  ): Promise<Database['public']['Tables'][T]['Row'][]> {
    const { data, error } = await supabase
      .from(table)
      .select('*')

    if (error) throw new Error(`Query failed: ${error.message}`)
    return data as Database['public']['Tables'][T]['Row'][]
  },

  /**
   * Get single row by ID
   */
  async getById<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ): Promise<Database['public']['Tables'][T]['Row'] | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Query failed: ${error.message}`)
    }
    return data as Database['public']['Tables'][T]['Row'] | null
  },

  /**
   * Insert row
   */
  async insert<T extends keyof Database['public']['Tables']>(
    table: T,
    data: Database['public']['Tables'][T]['Insert']
  ): Promise<Database['public']['Tables'][T]['Row']> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Insert failed: ${error.message}`)
    return result as Database['public']['Tables'][T]['Row']
  },

  /**
   * Update row
   */
  async update<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string,
    updates: Database['public']['Tables'][T]['Update']
  ): Promise<Database['public']['Tables'][T]['Row']> {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Update failed: ${error.message}`)
    return data as Database['public']['Tables'][T]['Row']
  },

  /**
   * Delete row
   */
  async delete<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Delete failed: ${error.message}`)
  },

  /**
   * Subscribe to real-time changes
   */
  subscribe<T extends keyof Database['public']['Tables']>(
    table: T,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe()
  }
}

/**
 * Storage helpers
 */
export const storage = {
  /**
   * Upload file to storage bucket
   */
  async upload(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw new Error(`Upload failed: ${error.message}`)
    return data
  },

  /**
   * Get public URL for file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  },

  /**
   * Download file
   */
  async download(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    if (error) throw new Error(`Download failed: ${error.message}`)
    return data
  },

  /**
   * Delete file
   */
  async delete(bucket: string, paths: string[]) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) throw new Error(`Delete failed: ${error.message}`)
    return data
  },

  /**
   * List files in bucket
   */
  async list(bucket: string, path?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)

    if (error) throw new Error(`List failed: ${error.message}`)
    return data
  }
}

/**
 * Example usage
 */
export async function examples() {
  // Auth examples
  await auth.signUp('user@example.com', 'password123', {
    full_name: 'John Doe'
  })

  await auth.signIn('user@example.com', 'password123')

  const user = await auth.getUser()
  console.log('Current user:', user)

  // Database examples
  const users = await db.getAll('users')
  console.log('All users:', users)

  const newUser = await db.insert('users', {
    email: 'new@example.com',
    full_name: 'Jane Doe'
  })

  await db.update('users', newUser.id, {
    full_name: 'Jane Smith'
  })

  // Real-time subscription
  const subscription = db.subscribe('users', (payload) => {
    console.log('Change received!', payload)
  })

  // Storage examples
  const file = new File(['content'], 'test.txt')
  await storage.upload('avatars', 'user-123.jpg', file)

  const url = storage.getPublicUrl('avatars', 'user-123.jpg')
  console.log('Public URL:', url)
}
