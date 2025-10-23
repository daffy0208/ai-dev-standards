# Supabase Integration

Complete Supabase integration for authentication, database, storage, and real-time features.

## Features

- ✅ **Authentication** - Email, OAuth, magic links, password reset
- ✅ **Database** - Type-safe queries with TypeScript
- ✅ **Real-time** - Live data subscriptions
- ✅ **Storage** - File upload and management
- ✅ **Server-side** - Next.js App Router support
- ✅ **React Hooks** - Easy client-side integration
- ✅ **Row-level Security** - Built-in authorization

---

## Setup

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your project URL and anon key

### 3. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

Update `Database` type in `client.ts` with your generated types.

---

## Usage

### Client-Side (React Components)

```typescript
import { useUser, useAuth } from './hooks'

function Profile() {
  const { user, loading } = useUser()
  const { signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Server-Side (Server Components)

```typescript
import { createServerClient, serverAuth } from './server'

export default async function DashboardPage() {
  const user = await serverAuth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = createServerClient()
  const { data: users } = await supabase.from('users').select()

  return <div>{JSON.stringify(users)}</div>
}
```

### API Routes

```typescript
import { createRouteHandlerClient, serverAuth } from './server'

export async function GET() {
  const user = await serverAuth.requireUser()

  const supabase = createRouteHandlerClient()
  const { data } = await supabase.from('users').select()

  return Response.json(data)
}
```

---

## Authentication

### Sign Up

```typescript
import { auth } from './client'

await auth.signUp('user@example.com', 'password123', {
  full_name: 'John Doe'
})
```

### Sign In

```typescript
await auth.signIn('user@example.com', 'password123')
```

### OAuth

```typescript
await auth.signInWithOAuth('google')
```

### Magic Link

```typescript
await auth.signInWithMagicLink('user@example.com')
```

### Password Reset

```typescript
// Send reset email
await auth.resetPassword('user@example.com')

// Update password
await auth.updatePassword('newPassword123')
```

### Get Current User

```typescript
const user = await auth.getUser()
```

---

## Database

### Query Data

```typescript
import { db } from './client'

// Get all
const users = await db.getAll('users')

// Get by ID
const user = await db.getById('users', 'user-id')

// Insert
const newUser = await db.insert('users', {
  email: 'new@example.com',
  full_name: 'Jane Doe'
})

// Update
await db.update('users', 'user-id', {
  full_name: 'Jane Smith'
})

// Delete
await db.delete('users', 'user-id')
```

### Custom Queries

```typescript
import { supabase } from './client'

const { data, error } = await supabase
  .from('users')
  .select('*, posts(*)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10)

if (error) throw error
```

### Real-time Subscriptions

```typescript
// Subscribe to changes
const subscription = db.subscribe('users', (payload) => {
  console.log('Change:', payload)
})

// Unsubscribe
subscription.unsubscribe()
```

---

## Storage

### Upload File

```typescript
import { storage } from './client'

const file = new File(['content'], 'avatar.jpg')
await storage.upload('avatars', 'user-123.jpg', file)
```

### Get Public URL

```typescript
const url = storage.getPublicUrl('avatars', 'user-123.jpg')
```

### Download File

```typescript
const blob = await storage.download('avatars', 'user-123.jpg')
```

### Delete File

```typescript
await storage.delete('avatars', ['user-123.jpg'])
```

---

## React Hooks

### useUser

```typescript
function Profile() {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>

  return <div>{user.email}</div>
}
```

### useAuth

```typescript
function LoginForm() {
  const { signIn, loading, error } = useAuth()

  const handleSubmit = async (email: string, password: string) => {
    await signIn(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <p>{error}</p>}
    </form>
  )
}
```

### useQuery

```typescript
function UserList() {
  const { data, loading, error } = useQuery('users', (builder) =>
    builder.eq('status', 'active').order('created_at')
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {data?.map(user => <li key={user.id}>{user.email}</li>)}
    </ul>
  )
}
```

### useSubscription

```typescript
function LiveUsers() {
  const [users, setUsers] = useState([])

  useSubscription('users', (payload) => {
    // Handle INSERT, UPDATE, DELETE
    if (payload.eventType === 'INSERT') {
      setUsers(prev => [...prev, payload.new])
    }
  })

  return <ul>{/* render users */}</ul>
}
```

---

## Row-Level Security (RLS)

Enable RLS in your Supabase project:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

## Middleware (Next.js)

```typescript
import { createMiddlewareClient } from './server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  const { data: { session } } = await supabase.auth.getSession()

  // Protect routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

---

## Best Practices

### 1. Use Row-Level Security
Always enable RLS and create policies for data access control.

### 2. Type Safety
Generate TypeScript types from your database schema.

### 3. Error Handling
Always handle errors from Supabase operations.

### 4. Server-Side Auth
Use server-side auth checks for protected routes and API endpoints.

### 5. Real-time Subscriptions
Unsubscribe from channels when components unmount.

---

## Common Patterns

### Protected Route Component

```typescript
import { redirect } from 'next/navigation'
import { serverAuth } from './server'

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await serverAuth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
```

### Form with Validation

```typescript
import { useAuth } from './hooks'
import { useState } from 'react'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

function SignUpForm() {
  const { signUp, loading, error } = useAuth()
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const data = signUpSchema.parse({
        email: formData.get('email'),
        password: formData.get('password')
      })

      await signUp(data.email, data.password)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFormError(err.errors[0].message)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {(error || formError) && <p>{error || formError}</p>}
    </form>
  )
}
```

---

## Troubleshooting

### "Invalid API key" error
Check that environment variables are set correctly and restart dev server.

### RLS blocking queries
Check your RLS policies. Use service role key for admin operations.

### Real-time not working
Ensure real-time is enabled in Supabase dashboard for your table.

### TypeScript errors
Regenerate types after schema changes: `npx supabase gen types typescript`

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://github.com/supabase/supabase-js)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**Built for production-ready authentication and data management** 🔐
