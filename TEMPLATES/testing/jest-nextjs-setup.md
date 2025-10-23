# Jest + Next.js Testing Setup

Complete setup guide for testing Next.js applications with Jest and React Testing Library.

---

## Installation

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

---

## Configuration Files

### 1. jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (matches tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_*.{js,jsx,ts,tsx}', // Exclude private files
    '!src/app/layout.tsx', // Exclude layout (tested via E2E)
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### 2. jest.setup.js

```javascript
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
```

### 3. package.json scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## Example Tests

### Testing a React Component

```typescript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="secondary">Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-secondary')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Testing API Routes

```typescript
// app/api/users/route.test.ts
import { GET, POST } from './route'
import { db } from '@/lib/db'

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns all users', async () => {
      const mockUsers = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ]

      ;(db.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const response = await GET()
      const data = await response.json()

      expect(data).toEqual(mockUsers)
      expect(response.status).toBe(200)
    })
  })

  describe('POST', () => {
    it('creates a new user', async () => {
      const newUser = { name: 'John', email: 'john@example.com' }
      const createdUser = { id: '1', ...newUser }

      ;(db.user.create as jest.Mock).mockResolvedValue(createdUser)

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toEqual(createdUser)
      expect(response.status).toBe(201)
    })

    it('returns 400 for invalid data', async () => {
      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // Invalid: missing email
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})
```

### Testing Server Actions

```typescript
// app/actions/user.test.ts
import { createUser } from './user'
import { db } from '@/lib/db'

jest.mock('@/lib/db')

describe('createUser action', () => {
  it('creates user and returns success', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test' }
    ;(db.user.create as jest.Mock).mockResolvedValue(mockUser)

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('name', 'Test')

    const result = await createUser(formData)

    expect(result).toEqual({ success: true, user: mockUser })
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        name: 'Test',
      },
    })
  })

  it('returns error for invalid email', async () => {
    const formData = new FormData()
    formData.append('email', 'invalid-email')
    formData.append('name', 'Test')

    const result = await createUser(formData)

    expect(result).toEqual({
      success: false,
      error: 'Invalid email address',
    })
  })
})
```

### Testing Custom Hooks

```typescript
// src/hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })

    // Value should not update immediately
    expect(result.current).toBe('initial')

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Value should now be updated
    expect(result.current).toBe('updated')
  })
})
```

---

## Testing Utilities

### Test Helpers

```typescript
// src/test-utils/render.tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={null}>
      {children}
    </SessionProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
```

### Mock Data Factories

```typescript
// src/test-utils/factories.ts
import { faker } from '@faker-js/faker'

export function createMockUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    ...overrides,
  }
}

export function createMockPost(overrides = {}) {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
    authorId: faker.string.uuid(),
    createdAt: new Date(),
    ...overrides,
  }
}
```

---

## Common Testing Patterns

### Testing Forms

```typescript
import userEvent from '@testing-library/user-event'

it('submits form with valid data', async () => {
  const handleSubmit = jest.fn()
  const user = userEvent.setup()

  render(<LoginForm onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Login' }))

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
})
```

### Testing Async Components

```typescript
import { waitFor } from '@testing-library/react'

it('loads and displays user data', async () => {
  render(<UserProfile userId="123" />)

  expect(screen.getByText('Loading...')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})
```

### Testing Error States

```typescript
it('displays error message on failed fetch', async () => {
  // Mock failed API call
  global.fetch = jest.fn(() =>
    Promise.reject(new Error('Network error'))
  )

  render(<UserList />)

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

---

## Troubleshooting

### Issue: "Cannot find module '@/...'"

**Solution:** Update jest.config.js:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Issue: "TextEncoder is not defined"

**Solution:** Add to jest.setup.js:
```javascript
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
```

### Issue: "Next.js Image component breaks tests"

**Solution:** Already mocked in jest.setup.js above

---

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage

# CI mode
npm test:ci
```

---

## Related Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing Docs](https://nextjs.org/docs/testing)
