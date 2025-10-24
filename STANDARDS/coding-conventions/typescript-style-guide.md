# TypeScript Style Guide

**Purpose:** Standard TypeScript coding conventions for consistent, maintainable code

**Last Updated:** 2025-10-24

---

## Table of Contents

1. [File Organization](#file-organization)
2. [Naming Conventions](#naming-conventions)
3. [Type Definitions](#type-definitions)
4. [Functions and Methods](#functions-and-methods)
5. [Classes and Interfaces](#classes-and-interfaces)
6. [Imports and Exports](#imports-and-exports)
7. [Error Handling](#error-handling)
8. [Comments and Documentation](#comments-and-documentation)
9. [Best Practices](#best-practices)

---

## File Organization

### File Structure

```typescript
// 1. Imports (grouped and sorted)
import { useState } from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

import type { User } from '@/types'

// 2. Type definitions
type Props = {
  user: User
  onSave: (data: FormData) => Promise<void>
}

// 3. Constants
const MAX_RETRIES = 3
const DEFAULT_TIMEOUT = 5000

// 4. Main component/function
export function UserForm({ user, onSave }: Props) {
  // implementation
}

// 5. Helper functions (not exported)
function validateForm(data: unknown): FormData {
  // implementation
}
```

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `UserProfile.tsx`, `LoginForm.tsx` |
| **Utilities** | camelCase | `formatDate.ts`, `apiClient.ts` |
| **Types** | PascalCase | `User.ts`, `ApiResponse.ts` |
| **Constants** | camelCase | `config.ts`, `constants.ts` |
| **Tests** | Match source + `.test` | `UserProfile.test.tsx` |
| **Hooks** | camelCase + `use` prefix | `useAuth.ts`, `useForm.ts` |

---

## Naming Conventions

### Variables and Functions

```typescript
// ✅ GOOD: camelCase for variables and functions
const userName = 'John'
const isAuthenticated = true
function calculateTotal(items: Item[]): number { }

// ❌ BAD: snake_case or PascalCase
const user_name = 'John'
const IsAuthenticated = true
function CalculateTotal(items: Item[]): number { }
```

### Constants

```typescript
// ✅ GOOD: UPPER_SNAKE_CASE for true constants
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = 'https://api.example.com'

// ✅ GOOD: camelCase for configuration objects
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const

// ❌ BAD: Mixed conventions
const max_retry_attempts = 3
const apiBaseUrl = 'https://api.example.com' // not a constant
```

### Types and Interfaces

```typescript
// ✅ GOOD: PascalCase, descriptive names
interface UserProfile {
  id: string
  name: string
  email: string
}

type ApiResponse<T> = {
  data: T
  error?: string
}

// ❌ BAD: Prefixing with I, generic names
interface IUserProfile { }
interface Data { }
```

### Classes

```typescript
// ✅ GOOD: PascalCase, noun-based names
class UserService {
  private apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  async getUser(id: string): Promise<User> {
    // implementation
  }
}

// ❌ BAD: camelCase, verb-based names
class userService { }
class GetUsers { }
```

### Booleans

```typescript
// ✅ GOOD: is/has/should prefix
const isLoading = true
const hasPermission = false
const shouldRetry = true

// ❌ BAD: No prefix, unclear meaning
const loading = true
const permission = false
const retry = true
```

---

## Type Definitions

### Prefer Type Over Interface (When Possible)

```typescript
// ✅ GOOD: Use type for objects, unions, intersections
type User = {
  id: string
  name: string
  email: string
}

type Result<T> = Success<T> | Failure

type UserWithRoles = User & {
  roles: string[]
}

// ✅ ACCEPTABLE: Use interface when you need extension
interface BaseUser {
  id: string
  name: string
}

interface AdminUser extends BaseUser {
  permissions: string[]
}
```

### Avoid `any`

```typescript
// ✅ GOOD: Use specific types or unknown
function processData(data: unknown): Result {
  if (typeof data === 'string') {
    return { success: true, value: data }
  }
  return { success: false, error: 'Invalid data' }
}

// ❌ BAD: Using any
function processData(data: any): Result {
  // no type safety
}
```

### Use Discriminated Unions

```typescript
// ✅ GOOD: Discriminated unions for state management
type LoadingState = {
  status: 'loading'
}

type SuccessState<T> = {
  status: 'success'
  data: T
}

type ErrorState = {
  status: 'error'
  error: string
}

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState

// Usage
function handleState(state: AsyncState<User>) {
  switch (state.status) {
    case 'loading':
      return <Spinner />
    case 'success':
      return <UserProfile user={state.data} />
    case 'error':
      return <Error message={state.error} />
  }
}
```

### Readonly by Default

```typescript
// ✅ GOOD: Use readonly for immutability
type User = {
  readonly id: string
  readonly name: string
  email: string // mutable
}

// ✅ GOOD: Use Readonly utility for entire objects
type ImmutableUser = Readonly<User>

// ✅ GOOD: ReadonlyArray or readonly[]
function processUsers(users: readonly User[]): Result {
  // users cannot be modified
}
```

---

## Functions and Methods

### Function Declarations

```typescript
// ✅ GOOD: Named functions for reusability
function calculateTax(amount: number, rate: number): number {
  return amount * rate
}

// ✅ GOOD: Arrow functions for callbacks/inline
const users = data.map(user => ({ ...user, active: true }))

// ❌ BAD: Arrow functions when named is clearer
const calculateTax = (amount: number, rate: number): number => {
  return amount * rate
}
```

### Return Type Annotations

```typescript
// ✅ GOOD: Always annotate return types for public functions
export function getUser(id: string): Promise<User> {
  return api.get(`/users/${id}`)
}

// ✅ ACCEPTABLE: Omit for simple, obvious returns
function add(a: number, b: number) {
  return a + b // clearly returns number
}

// ❌ BAD: No return type for public API
export function getUser(id: string) {
  return api.get(`/users/${id}`) // what does this return?
}
```

### Parameter Objects

```typescript
// ✅ GOOD: Object parameter for 3+ params
type CreateUserParams = {
  name: string
  email: string
  role: string
  department?: string
}

function createUser(params: CreateUserParams): User {
  // implementation
}

// ❌ BAD: Too many positional parameters
function createUser(
  name: string,
  email: string,
  role: string,
  department?: string
): User {
  // hard to remember parameter order
}
```

### Async/Await Over Promises

```typescript
// ✅ GOOD: Use async/await for readability
async function fetchUserData(id: string): Promise<UserData> {
  try {
    const user = await api.getUser(id)
    const posts = await api.getUserPosts(id)
    return { user, posts }
  } catch (error) {
    throw new Error(`Failed to fetch user data: ${error}`)
  }
}

// ❌ BAD: Promise chains
function fetchUserData(id: string): Promise<UserData> {
  return api.getUser(id)
    .then(user => api.getUserPosts(id)
      .then(posts => ({ user, posts })))
    .catch(error => {
      throw new Error(`Failed to fetch user data: ${error}`)
    })
}
```

---

## Classes and Interfaces

### Class Structure

```typescript
// ✅ GOOD: Consistent class organization
class UserService {
  // 1. Static properties
  private static instance: UserService

  // 2. Instance properties
  private apiClient: ApiClient
  private cache: Map<string, User>

  // 3. Constructor
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
    this.cache = new Map()
  }

  // 4. Static methods
  static getInstance(apiClient: ApiClient): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(apiClient)
    }
    return UserService.instance
  }

  // 5. Public methods
  async getUser(id: string): Promise<User> {
    const cached = this.cache.get(id)
    if (cached) return cached

    const user = await this.fetchUser(id)
    this.cache.set(id, user)
    return user
  }

  // 6. Private methods
  private async fetchUser(id: string): Promise<User> {
    return this.apiClient.get(`/users/${id}`)
  }
}
```

### Prefer Composition Over Inheritance

```typescript
// ✅ GOOD: Composition
class UserService {
  constructor(
    private apiClient: ApiClient,
    private logger: Logger
  ) {}
}

// ❌ BAD: Deep inheritance
class BaseService { }
class ApiService extends BaseService { }
class UserService extends ApiService { }
```

---

## Imports and Exports

### Import Organization

```typescript
// ✅ GOOD: Organized imports
// 1. External dependencies
import { useState, useEffect } from 'react'
import { z } from 'zod'

// 2. Internal absolute imports
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

// 3. Internal relative imports
import { formatDate } from './utils'
import { UserCard } from './UserCard'

// 4. Type imports
import type { User, Post } from '@/types'

// ❌ BAD: Mixed, unsorted imports
import { UserCard } from './UserCard'
import type { User } from '@/types'
import { z } from 'zod'
import { useState } from 'react'
```

### Named Exports Over Default

```typescript
// ✅ GOOD: Named exports
export function calculateTax(amount: number): number {
  return amount * 0.2
}

export const TAX_RATE = 0.2

// ❌ BAD: Default exports (harder to refactor)
export default function calculateTax(amount: number): number {
  return amount * 0.2
}
```

---

## Error Handling

### Use Custom Error Classes

```typescript
// ✅ GOOD: Custom error classes
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Usage
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)

  if (!response.ok) {
    throw new ApiError(
      'Failed to fetch user',
      response.status
    )
  }

  return response.json()
}
```

### Never Swallow Errors

```typescript
// ✅ GOOD: Handle or re-throw
async function fetchData(): Promise<Data> {
  try {
    return await api.getData()
  } catch (error) {
    logger.error('Failed to fetch data', error)
    throw error // re-throw or handle appropriately
  }
}

// ❌ BAD: Silently catch and ignore
async function fetchData(): Promise<Data | undefined> {
  try {
    return await api.getData()
  } catch {
    return undefined // error lost!
  }
}
```

---

## Comments and Documentation

### JSDoc for Public APIs

```typescript
/**
 * Calculates the total price including tax
 *
 * @param amount - The base amount before tax
 * @param taxRate - Tax rate as decimal (0.2 for 20%)
 * @returns The total amount including tax
 *
 * @example
 * ```typescript
 * const total = calculateTotal(100, 0.2)
 * // returns 120
 * ```
 */
export function calculateTotal(amount: number, taxRate: number): number {
  return amount * (1 + taxRate)
}
```

### Explain Why, Not What

```typescript
// ✅ GOOD: Explains reasoning
// Use debounce to prevent API spam during rapid typing
const debouncedSearch = debounce(searchUsers, 300)

// ❌ BAD: States the obvious
// Call the debounce function
const debouncedSearch = debounce(searchUsers, 300)
```

---

## Best Practices

### Use Strict TypeScript Config

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Avoid Type Assertions

```typescript
// ✅ GOOD: Use type guards
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}

if (isUser(data)) {
  console.log(data.name) // type-safe
}

// ❌ BAD: Type assertion
const user = data as User
console.log(user.name) // unsafe
```

### Use Const Assertions

```typescript
// ✅ GOOD: Const assertion for literal types
const STATUSES = ['pending', 'active', 'completed'] as const
type Status = typeof STATUSES[number] // 'pending' | 'active' | 'completed'

// ❌ BAD: Manual type definition
type Status = 'pending' | 'active' | 'completed'
const STATUSES: Status[] = ['pending', 'active', 'completed']
```

---

## Related Resources

- [React Patterns](./react-patterns.md) - React-specific conventions
- [Naming Conventions](./naming-conventions.md) - Comprehensive naming guide
- [Code Organization](./code-organization.md) - Project structure standards

---

**Remember:** Consistency is more important than perfection. Follow these conventions for maintainable, type-safe TypeScript code.
