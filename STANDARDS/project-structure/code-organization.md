# Code Organization Best Practices

Guidelines for organizing code at the file, directory, and module level.

## Table of Contents

- [Directory Structure](#directory-structure)
- [File Organization](#file-organization)
- [Module Organization](#module-organization)
- [Import Organization](#import-organization)
- [Code Grouping](#code-grouping)
- [Separation of Concerns](#separation-of-concerns)
- [Design Patterns](#design-patterns)

---

## Directory Structure

### Frontend (React/Next.js)

```
src/
├── app/                    # Next.js app directory (App Router)
│   ├── (auth)/            # Route groups
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── page.tsx       # Dashboard page
│   │   └── layout.tsx     # Dashboard layout
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── modal.tsx
│   ├── features/         # Feature-specific components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       └── RecentActivity.tsx
│   └── layout/           # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/                  # Utilities and helpers
│   ├── api/             # API clients
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── hooks/           # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useUser.ts
│   ├── utils/           # Utility functions
│   │   ├── formatting.ts
│   │   └── validation.ts
│   └── store/           # State management
│       ├── auth.ts
│       └── user.ts
├── types/               # TypeScript types
│   ├── api.ts
│   ├── models.ts
│   └── index.ts
└── styles/              # Global styles
    └── globals.css
```

### Backend (Node.js/Express)

```
src/
├── controllers/         # Request handlers
│   ├── auth.controller.ts
│   └── user.controller.ts
├── services/           # Business logic
│   ├── auth.service.ts
│   └── user.service.ts
├── repositories/       # Data access layer
│   ├── user.repository.ts
│   └── post.repository.ts
├── models/            # Data models
│   ├── user.model.ts
│   └── post.model.ts
├── middleware/        # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── routes/            # API routes
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── index.ts
├── utils/             # Utilities
│   ├── logger.ts
│   ├── errors.ts
│   └── validation.ts
├── config/            # Configuration
│   ├── database.ts
│   └── environment.ts
└── types/             # TypeScript types
    └── index.ts
```

### Python (FastAPI)

```
src/
├── api/               # API routes
│   ├── v1/
│   │   ├── auth.py
│   │   └── users.py
│   └── __init__.py
├── core/              # Core application code
│   ├── config.py
│   ├── security.py
│   └── database.py
├── models/            # Database models
│   ├── user.py
│   └── post.py
├── schemas/           # Pydantic schemas
│   ├── user.py
│   └── post.py
├── services/          # Business logic
│   ├── auth_service.py
│   └── user_service.py
├── repositories/      # Data access
│   ├── user_repository.py
│   └── post_repository.py
├── utils/             # Utilities
│   ├── formatting.py
│   └── validation.py
└── tests/             # Tests
    ├── unit/
    └── integration/
```

---

## File Organization

### General Principles

1. **Single Responsibility**: One main purpose per file
2. **Size Limit**: Keep files under 300 lines
3. **Related Code**: Group related functionality
4. **Clear Naming**: Name files after their primary export

### File Structure Template

```typescript
/**
 * File description and purpose
 */

// 1. Third-party imports
import React from 'react'
import { useState } from 'react'

// 2. Internal imports
import { Button } from '@/components/ui'
import { formatDate } from '@/lib/utils'

// 3. Types and interfaces
export interface UserProfile {
  id: string
  name: string
  email: string
}

// 4. Constants
const MAX_NAME_LENGTH = 50

// 5. Helper functions
function validateEmail(email: string): boolean {
  // Implementation
  return true
}

// 6. Main component/function
export function UserProfile({ user }: { user: UserProfile }) {
  // Implementation
}

// 7. Utility exports (if needed)
export { validateEmail }
```

---

## Module Organization

### Feature-Based Organization

Group code by feature rather than by type:

```
✅ Good - Feature-based
src/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── types.ts
│   └── user-profile/
│       ├── components/
│       ├── hooks/
│       └── services/

❌ Bad - Type-based
src/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── UserProfile.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useUser.ts
└── services/
    ├── auth.service.ts
    └── user.service.ts
```

### Barrel Exports

Use `index.ts` files to simplify imports:

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Modal } from './modal'

// Usage
import { Button, Input, Modal } from '@/components/ui'
```

---

## Import Organization

### Import Ordering

```typescript
// 1. React imports (if React project)
import React, { useState, useEffect } from 'react'

// 2. Third-party library imports
import { z } from 'zod'
import axios from 'axios'

// 3. Absolute imports (aliased)
import { Button } from '@/components/ui'
import { useAuth } from '@/lib/hooks'

// 4. Relative imports (same feature)
import { validateForm } from './utils'
import { UserForm } from './UserForm'

// 5. Type imports (last)
import type { User, Post } from '@/types'

// 6. CSS/style imports (very last)
import styles from './component.module.css'
```

### Import Grouping Best Practices

```typescript
✅ Good
import React from 'react'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/lib/hooks'
import type { User } from '@/types'

❌ Bad - Mixed ordering
import { Button } from '@/components/ui'
import React from 'react'
import type { User } from '@/types'
import { useAuth } from '@/lib/hooks'
```

---

## Code Grouping

### Class Organization

```typescript
export class UserService {
  // 1. Static properties
  static readonly MAX_USERS = 1000

  // 2. Instance properties
  private cache: Map<string, User>
  private readonly apiClient: APIClient

  // 3. Constructor
  constructor(apiClient: APIClient) {
    this.apiClient = apiClient
    this.cache = new Map()
  }

  // 4. Public methods (most important first)
  async getUser(id: string): Promise<User> {
    // Implementation
  }

  async createUser(data: CreateUserData): Promise<User> {
    // Implementation
  }

  // 5. Private methods
  private validateUser(user: User): boolean {
    // Implementation
  }

  private cacheUser(user: User): void {
    // Implementation
  }

  // 6. Static methods
  static create(config: Config): UserService {
    // Factory method
  }
}
```

### Component Organization

```typescript
export function UserProfile({ userId }: { userId: string }) {
  // 1. Hooks (order matters!)
  const { user, loading } = useUser(userId)
  const [editing, setEditing] = useState(false)
  const navigate = useNavigate()

  // 2. Computed values
  const displayName = user?.name || 'Anonymous'

  // 3. Effects
  useEffect(() => {
    // Track page view
  }, [userId])

  // 4. Event handlers
  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async (data: UserData) => {
    // Save logic
  }

  // 5. Early returns
  if (loading) return <Spinner />
  if (!user) return <NotFound />

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

---

## Separation of Concerns

### Layer Architecture

```
Presentation Layer (UI)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (Repositories)
    ↓
Database
```

### Example: User Feature

```typescript
// 1. Presentation Layer - Component
export function UserList() {
  const { users, loading, error } = useUsers()

  if (loading) return <Spinner />
  if (error) return <Error message={error} />

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}

// 2. Business Logic Layer - Service
export class UserService {
  constructor(private repository: UserRepository) {}

  async getUsers(): Promise<User[]> {
    const users = await this.repository.findAll()
    return users.filter(user => user.isActive)
  }

  async createUser(data: CreateUserData): Promise<User> {
    // Validation
    if (!this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email')
    }

    // Business logic
    const user = await this.repository.create({
      ...data,
      createdAt: new Date(),
    })

    // Side effects
    await this.sendWelcomeEmail(user)

    return user
  }

  private isValidEmail(email: string): boolean {
    // Validation logic
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    // Email logic
  }
}

// 3. Data Access Layer - Repository
export class UserRepository {
  constructor(private db: Database) {}

  async findAll(): Promise<User[]> {
    return this.db.query('SELECT * FROM users')
  }

  async findById(id: string): Promise<User | null> {
    return this.db.query('SELECT * FROM users WHERE id = ?', [id])
  }

  async create(data: CreateUserData): Promise<User> {
    return this.db.query('INSERT INTO users ...', data)
  }
}
```

---

## Design Patterns

### Repository Pattern

```typescript
// Generic repository interface
interface Repository<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

// Implementation
export class UserRepository implements Repository<User> {
  constructor(private db: Database) {}

  async findAll(): Promise<User[]> {
    return this.db.users.findMany()
  }

  async findById(id: string): Promise<User | null> {
    return this.db.users.findUnique({ where: { id } })
  }

  // ... other methods
}
```

### Factory Pattern

```typescript
// Factory for creating services
export class ServiceFactory {
  private static instances = new Map<string, any>()

  static createUserService(): UserService {
    if (!this.instances.has('UserService')) {
      const repository = new UserRepository(db)
      const service = new UserService(repository)
      this.instances.set('UserService', service)
    }
    return this.instances.get('UserService')
  }
}

// Usage
const userService = ServiceFactory.createUserService()
```

### Adapter Pattern

```typescript
// Adapter for different API clients
interface APIAdapter {
  get<T>(url: string): Promise<T>
  post<T>(url: string, data: any): Promise<T>
}

export class AxiosAdapter implements APIAdapter {
  async get<T>(url: string): Promise<T> {
    const response = await axios.get(url)
    return response.data
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await axios.post(url, data)
    return response.data
  }
}

export class FetchAdapter implements APIAdapter {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url)
    return response.json()
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  }
}
```

### Dependency Injection

```typescript
// Services with DI
export class UserService {
  constructor(
    private repository: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}

  async createUser(data: CreateUserData): Promise<User> {
    this.logger.info('Creating user', { email: data.email })

    const user = await this.repository.create(data)
    await this.emailService.sendWelcomeEmail(user)

    return user
  }
}

// DI Container
export class Container {
  private services = new Map()

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory)
  }

  resolve<T>(name: string): T {
    const factory = this.services.get(name)
    if (!factory) {
      throw new Error(`Service not found: ${name}`)
    }
    return factory()
  }
}

// Setup
const container = new Container()
container.register('UserRepository', () => new UserRepository(db))
container.register('EmailService', () => new EmailService())
container.register('Logger', () => new Logger())
container.register('UserService', () => {
  return new UserService(
    container.resolve('UserRepository'),
    container.resolve('EmailService'),
    container.resolve('Logger')
  )
})

// Usage
const userService = container.resolve<UserService>('UserService')
```

---

## Summary Checklist

### Directory Structure
- [ ] Feature-based organization
- [ ] Clear separation of concerns
- [ ] Consistent naming conventions
- [ ] Logical grouping of related files

### File Organization
- [ ] Single responsibility per file
- [ ] Clear file naming
- [ ] Proper import organization
- [ ] Files under 300 lines

### Module Organization
- [ ] Use barrel exports
- [ ] Group by feature, not type
- [ ] Clear module boundaries
- [ ] Proper dependency management

### Code Quality
- [ ] Separation of concerns
- [ ] Appropriate design patterns
- [ ] Dependency injection where needed
- [ ] Clear abstraction layers

---

## Resources

- [Clean Architecture by Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Domain-Driven Design by Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
