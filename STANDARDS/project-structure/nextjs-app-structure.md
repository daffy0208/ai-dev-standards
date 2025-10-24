# Next.js App Structure (App Router)

**Purpose:** Standard Next.js project structure using App Router

**Last Updated:** 2025-10-24
**Next.js Version:** 14+ (App Router)

---

## Directory Structure

```
project-root/
├── .env.local                    # Local environment variables
├── .env.example                  # Example environment variables
├── .gitignore
├── next.config.js                # Next.js configuration
├── package.json
├── tsconfig.json
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.js
├── README.md
│
├── public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── src/
│   ├── app/                      # App Router pages and layouts
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── loading.tsx           # Loading UI
│   │   ├── error.tsx             # Error UI
│   │   ├── not-found.tsx         # 404 page
│   │   │
│   │   ├── (auth)/               # Route group (auth pages)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── dashboard/            # Dashboard section
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── [id]/             # Dynamic route
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                  # API routes
│   │       ├── auth/
│   │       │   └── route.ts
│   │       └── users/
│   │           └── route.ts
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── index.ts          # Barrel export
│   │   │
│   │   ├── forms/                # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── features/             # Feature-specific components
│   │       └── dashboard/
│   │           ├── DashboardCard.tsx
│   │           └── DashboardStats.tsx
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── api/                  # API clients
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   │
│   │   ├── auth/                 # Authentication utilities
│   │   │   ├── session.ts
│   │   │   └── middleware.ts
│   │   │
│   │   ├── db/                   # Database utilities
│   │   │   ├── client.ts         # Prisma/Drizzle client
│   │   │   └── queries.ts
│   │   │
│   │   ├── utils/                # General utilities
│   │   │   ├── cn.ts             # className utility
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── constants.ts          # App constants
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useForm.ts
│   │   └── useFetch.ts
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── index.ts              # Main type exports
│   │   ├── api.ts                # API types
│   │   ├── database.ts           # Database types
│   │   └── components.ts         # Component prop types
│   │
│   ├── styles/                   # Global styles
│   │   └── globals.css
│   │
│   ├── config/                   # App configuration
│   │   ├── site.ts               # Site metadata
│   │   └── navigation.ts         # Navigation config
│   │
│   └── middleware.ts             # Next.js middleware
│
└── tests/                        # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Key Directories Explained

### `/src/app` - App Router

```typescript
// app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// app/page.tsx - Home page
export default function HomePage() {
  return <div>Home Page</div>
}

// app/dashboard/layout.tsx - Dashboard layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}

// app/dashboard/[id]/page.tsx - Dynamic route
export default function DashboardDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <div>Dashboard {params.id}</div>
}
```

### `/src/components` - React Components

```
components/
├── ui/                    # Base UI components (Button, Input, etc.)
├── forms/                 # Form-specific components
├── layout/                # Layout components (Header, Footer)
└── features/              # Feature-specific components
    ├── dashboard/
    ├── profile/
    └── settings/
```

**Component Organization:**
- `ui/` - Reusable, generic UI components
- `forms/` - Form components with validation
- `layout/` - Page layout components
- `features/` - Feature-specific, domain components

### `/src/lib` - Utilities and Libraries

```
lib/
├── api/                   # API clients and utilities
├── auth/                  # Authentication logic
├── db/                    # Database client and queries
├── utils/                 # General utilities
└── constants.ts           # App-wide constants
```

### `/src/hooks` - Custom React Hooks

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const session = useSession()
  const signIn = async (credentials: Credentials) => { }
  const signOut = async () => { }
  return { session, signIn, signOut }
}

// hooks/useFetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  // ... implementation
  return { data, loading, error }
}
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Pages** | lowercase | `app/dashboard/page.tsx` |
| **Layouts** | lowercase | `app/dashboard/layout.tsx` |
| **Components** | PascalCase | `LoginForm.tsx`, `Button.tsx` |
| **Utilities** | camelCase | `formatDate.ts`, `cn.ts` |
| **Hooks** | camelCase + `use` | `useAuth.ts`, `useForm.ts` |
| **Types** | camelCase | `api.ts`, `database.ts` |
| **API Routes** | lowercase | `app/api/users/route.ts` |

---

## App Router Patterns

### Route Groups

```
app/
├── (marketing)/           # Route group (no /marketing in URL)
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/
│       └── page.tsx       # URL: /about
│
└── (dashboard)/           # Route group (no /dashboard in URL)
    ├── layout.tsx
    └── settings/
        └── page.tsx       # URL: /settings
```

### Parallel Routes

```
app/
└── dashboard/
    ├── @analytics/        # Parallel route slot
    │   └── page.tsx
    ├── @notifications/    # Parallel route slot
    │   └── page.tsx
    └── layout.tsx         # Renders both slots
```

```typescript
// dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  notifications,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <div>
      {children}
      <aside>
        {analytics}
        {notifications}
      </aside>
    </div>
  )
}
```

### Intercepting Routes

```
app/
├── photos/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx       # URL: /photos/123
│
└── @modal/
    └── (.)photos/          # Intercepts /photos/[id]
        └── [id]/
            └── page.tsx    # Opens as modal
```

---

## Configuration Files

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.example.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `.env.example`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# APIs
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...

# Feature Flags
FEATURE_NEW_DASHBOARD=true
```

---

## Server Components vs Client Components

### Server Components (Default)

```typescript
// app/posts/page.tsx - Server Component
async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### Client Components

```typescript
// components/PostCard.tsx - Client Component
'use client'

import { useState } from 'react'

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)

  return (
    <div>
      <h3>{post.title}</h3>
      <button onClick={() => setLiked(!liked)}>
        {liked ? 'Unlike' : 'Like'}
      </button>
    </div>
  )
}
```

---

## API Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = await db.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}

// Dynamic route: app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  })
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
  return NextResponse.json(user)
}
```

---

## Server Actions

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await db.post.create({
    data: { title, content }
  })

  revalidatePath('/posts')
}

// Usage in component
// app/posts/new/page.tsx
import { createPost } from '@/app/actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>
    </form>
  )
}
```

---

## Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

---

## Best Practices

### 1. Use Server Components by Default

Server Components are the default in App Router. Only use Client Components when you need:
- Browser APIs (localStorage, etc.)
- Event handlers
- React hooks (useState, useEffect)
- Third-party libraries that require client-side rendering

### 2. Colocation

Keep related files close together:

```
app/
└── dashboard/
    ├── page.tsx              # Dashboard page
    ├── DashboardCard.tsx     # Component used only here
    ├── actions.ts            # Server actions for dashboard
    └── utils.ts              # Utilities used only here
```

### 3. Type Safety

```typescript
// types/index.ts
export type User = {
  id: string
  name: string
  email: string
}

// Use types everywhere
async function getUser(id: string): Promise<User> {
  // implementation
}
```

### 4. Environment Variables

- Prefix client-side variables with `NEXT_PUBLIC_`
- Keep secrets server-side only

```typescript
// Server-side only
const apiKey = process.env.API_KEY

// Client-side accessible
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL
```

---

## Related Resources

- [React Patterns](../coding-conventions/react-patterns.md)
- [TypeScript Style Guide](../coding-conventions/typescript-style-guide.md)
- [API Design Patterns](../architecture-patterns/api-design-pattern.md)

---

**Follow this structure for consistent, scalable Next.js applications.**
