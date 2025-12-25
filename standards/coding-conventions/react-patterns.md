# React Patterns and Best Practices

**Purpose:** Standard React patterns for modern React 18+ applications

**Last Updated:** 2025-10-24
**React Version:** 18+
**Focus:** Hooks, Server Components, Performance, Type Safety

---

## Table of Contents

1. [Component Patterns](#component-patterns)
2. [Hook Patterns](#hook-patterns)
3. [State Management](#state-management)
4. [Performance Optimization](#performance-optimization)
5. [Error Handling](#error-handling)
6. [Testing Patterns](#testing-patterns)

---

## Component Patterns

### Functional Components Only

```typescript
// ✅ GOOD: Functional component with TypeScript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// ❌ BAD: Class component
class Button extends React.Component { }
```

### Component File Structure

```typescript
// UserProfile.tsx

// 1. Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Types
interface UserProfileProps {
  userId: string
}

interface User {
  id: string
  name: string
  email: string
}

// 3. Main component
export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [userId])

  async function fetchUser() {
    // implementation
  }

  if (loading) return <LoadingSpinner />
  if (!user) return <NotFound />

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// 4. Helper components (if small and only used here)
function LoadingSpinner() {
  return <div className="spinner" />
}

function NotFound() {
  return <div>User not found</div>
}
```

### Server vs Client Components (Next.js App Router)

```typescript
// ✅ GOOD: Server Component (default)
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store' // or 'force-cache' or { next: { revalidate: 60 }}
  })
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

// ✅ GOOD: Client Component (when needed)
// components/PostCard.tsx
'use client'

import { useState } from 'react'

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)

  return (
    <div>
      <h3>{post.title}</h3>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
```

### Composition Over Props Drilling

```typescript
// ✅ GOOD: Composition pattern
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="card-content">{children}</div>
}

// Usage
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>

// ❌ BAD: Too many props
interface CardProps {
  title: string
  subtitle?: string
  content: string
  footer?: string
  headerClassName?: string
  contentClassName?: string
  // ... endless props
}
```

### Render Props Pattern

```typescript
// ✅ GOOD: Render props for flexible rendering
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(error => {
        setError(error)
        setLoading(false)
      })
  }, [url])

  return <>{children(data, loading, error)}</>
}

// Usage
<DataFetcher<User> url="/api/user">
  {(user, loading, error) => {
    if (loading) return <Spinner />
    if (error) return <Error error={error} />
    if (!user) return null
    return <UserProfile user={user} />
  }}
</DataFetcher>
```

---

## Hook Patterns

### Custom Hooks Structure

```typescript
// ✅ GOOD: Well-structured custom hook
interface UseUserOptions {
  suspense?: boolean
  refetchInterval?: number
}

interface UseUserReturn {
  user: User | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  update: (data: Partial<User>) => Promise<void>
}

export function useUser(userId: string, options: UseUserOptions = {}): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      setUser(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated = await response.json()
      setUser(updated)
    } catch (err) {
      setError(err as Error)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Auto-refetch interval
  useEffect(() => {
    if (options.refetchInterval) {
      const interval = setInterval(fetchUser, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchUser, options.refetchInterval])

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    update: updateUser,
  }
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error, update } = useUser(userId, {
    refetchInterval: 30000 // refetch every 30s
  })

  if (loading) return <Spinner />
  if (error) return <Error error={error} />
  if (!user) return null

  return <div>{user.name}</div>
}
```

### useEffect Best Practices

```typescript
// ✅ GOOD: Proper cleanup
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()

    // Cleanup function
    return () => {
      connection.disconnect()
    }
  }, [roomId]) // Only re-run when roomId changes

  return <div>Chat Room</div>
}

// ✅ GOOD: Separate effects for separate concerns
function UserDashboard({ userId }: { userId: string }) {
  // Effect 1: Fetch user
  useEffect(() => {
    fetchUser(userId)
  }, [userId])

  // Effect 2: Track analytics
  useEffect(() => {
    analytics.track('dashboard_view', { userId })
  }, [userId])

  // Don't combine unrelated effects
}

// ❌ BAD: Missing dependencies
function BadComponent({ userId }: { userId: string }) {
  useEffect(() => {
    fetchUser(userId)
  }, []) // Missing userId dependency!
}

// ❌ BAD: Effect that should be in event handler
function BadForm() {
  const [text, setText] = useState('')

  useEffect(() => {
    // Don't do this!
    saveToLocalStorage(text)
  }, [text])

  // ✅ GOOD: Save on submit instead
  const handleSubmit = () => {
    saveToLocalStorage(text)
  }
}
```

### useMemo and useCallback

```typescript
// ✅ GOOD: Memoize expensive computations
function DataTable({ data }: { data: Item[] }) {
  const sortedData = useMemo(() => {
    return data.sort((a, b) => a.name.localeCompare(b.name))
  }, [data]) // Only re-sort when data changes

  return <Table data={sortedData} />
}

// ✅ GOOD: Memoize callbacks passed to children
function ParentComponent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, []) // Empty deps - function never changes

  return <ExpensiveChild onClick={handleClick} />
}

// ❌ BAD: Unnecessary memoization
function BadComponent({ name }: { name: string }) {
  // Don't memoize simple operations
  const greeting = useMemo(() => `Hello, ${name}`, [name])
  return <div>{greeting}</div>
}

// ✅ GOOD: Just compute it directly
function GoodComponent({ name }: { name: string }) {
  const greeting = `Hello, ${name}`
  return <div>{greeting}</div>
}
```

---

## State Management

### Local State with useState

```typescript
// ✅ GOOD: Simple local state
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

// ✅ GOOD: Functional updates for state based on previous state
function Counter() {
  const [count, setCount] = useState(0)

  const increment = () => setCount(c => c + 1) // Functional update
  const decrement = () => setCount(c => c - 1)

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

### Complex State with useReducer

```typescript
// ✅ GOOD: useReducer for complex state logic
type State = {
  loading: boolean
  error: Error | null
  data: User | null
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User }
  | { type: 'FETCH_ERROR'; payload: Error }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { loading: false, error: null, data: action.payload }
    case 'FETCH_ERROR':
      return { loading: false, error: action.payload, data: null }
    default:
      return state
  }
}

function UserProfile({ userId }: { userId: string }) {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    error: null,
    data: null,
  })

  useEffect(() => {
    dispatch({ type: 'FETCH_START' })
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(error => dispatch({ type: 'FETCH_ERROR', payload: error }))
  }, [userId])

  if (state.loading) return <Spinner />
  if (state.error) return <Error error={state.error} />
  if (!state.data) return null

  return <div>{state.data.name}</div>
}
```

### Context for Shared State

```typescript
// ✅ GOOD: Context with TypeScript
interface AuthContextType {
  user: User | null
  signIn: (credentials: Credentials) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(credentials: Credentials) {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    const user = await response.json()
    setUser(user)
  }

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Usage
function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}

function Dashboard() {
  const { user, signOut } = useAuth()
  return <div>Welcome {user?.name}</div>
}
```

### Zustand for Global State (Recommended)

```typescript
// ✅ GOOD: Zustand store
import { create } from 'zustand'

interface TodoStore {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  removeTodo: (id: string) => void
  toggleTodo: (id: string) => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  removeTodo: (id) => set((state) => ({
    todos: state.todos.filter(t => t.id !== id)
  })),
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )
  })),
}))

// Usage - automatically subscribes to changes
function TodoList() {
  const todos = useTodoStore(state => state.todos) // Only re-renders when todos change
  const removeTodo = useTodoStore(state => state.removeTodo)

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
```

---

## Performance Optimization

### React.memo for Expensive Components

```typescript
// ✅ GOOD: Memo for expensive list items
interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
}: TodoItemProps) {
  console.log('TodoItem rendered:', todo.id)

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  )
})

// ❌ BAD: Memo without stable references
function Parent() {
  const [todos, setTodos] = useState([])

  // This creates a new function on every render!
  const handleToggle = (id: string) => {
    // toggle logic
  }

  return (
    <>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle} // New function every time = memo useless
        />
      ))}
    </>
  )
}

// ✅ GOOD: Memo with useCallback
function Parent() {
  const [todos, setTodos] = useState([])

  const handleToggle = useCallback((id: string) => {
    setTodos(todos => todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }, []) // Stable function reference

  return (
    <>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle} // Same function reference
        />
      ))}
    </>
  )
}
```

### Code Splitting with Lazy Loading

```typescript
// ✅ GOOD: Lazy load heavy components
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))
const HeavyEditor = lazy(() => import('./HeavyEditor'))

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
      <Suspense fallback={<EditorSkeleton />}>
        <HeavyEditor />
      </Suspense>
    </div>
  )
}
```

### Virtual Lists for Long Lists

```typescript
// ✅ GOOD: Use react-window for long lists
import { FixedSizeList } from 'react-window'

function VirtualizedList({ items }: { items: string[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {items[index]}
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

---

## Error Handling

### Error Boundaries

```typescript
// ✅ GOOD: Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <Dashboard />
</ErrorBoundary>
```

---

## Testing Patterns

### Component Testing with React Testing Library

```typescript
// ✅ GOOD: Test user interactions, not implementation
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  it('displays user name after loading', async () => {
    render(<UserProfile userId="123" />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Check user name is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('handles edit button click', async () => {
    const mockUpdate = jest.fn()
    render(<UserProfile userId="123" onUpdate={mockUpdate} />)

    // Find and click edit button
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    // Check edit mode is active
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
```

---

## Related Resources

- [TypeScript Style Guide](./typescript-style-guide.md)
- [Next.js App Structure](../project-structure/nextjs-app-structure.md)
- [Testing Best Practices](../best-practices/testing-best-practices.md)

---

**Follow these patterns for modern, performant React applications.**
