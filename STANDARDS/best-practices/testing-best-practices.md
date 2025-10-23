# Testing Best Practices

**Last Updated:** 2025-10-22
**Category:** Quality
**Audience:** All developers

---

## Overview

Comprehensive testing best practices for writing maintainable, reliable tests.

**Goal:** Write tests that give you confidence to ship without slowing you down.

---

## The Golden Rules

1. **Test behavior, not implementation**
2. **Follow the testing pyramid (70/20/10)**
3. **Keep tests fast and isolated**
4. **Write tests you can trust**
5. **Maintain tests like production code**

---

## Testing Pyramid Targets

```
E2E (10%)        → 5-20 tests  → Critical user journeys only
Integration (20%) → 50-100 tests → API + database operations
Unit (70%)       → 200+ tests  → Business logic, components, utilities
```

---

## What to Test (and What to Skip)

### ✅ DO Test

**Business Logic:**
```typescript
// ✅ Test calculations, transformations, validations
function calculateDiscount(price: number, tier: string) {
  // Test this!
}

function validateEmail(email: string) {
  // Test this!
}
```

**API Endpoints:**
```typescript
// ✅ Test request → response flow
POST /api/users → 201 Created
GET /api/users/:id → 200 OK or 404
DELETE /api/users/:id → requires auth
```

**Edge Cases:**
```typescript
// ✅ Test boundaries and errors
calculateTotal([]) // empty array
calculateTotal(null) // null input
parseDate('invalid') // invalid format
```

**User Interactions:**
```typescript
// ✅ Test critical user flows
- User can complete checkout
- User can update profile
- User can reset password
```

### ❌ DON'T Test

**Third-Party Code:**
```typescript
// ❌ Don't test React, Next.js, libraries
// They have their own tests
```

**Implementation Details:**
```typescript
// ❌ Don't test private methods
// ❌ Don't test internal state
// Test public API only
```

**Simple Getters/Setters:**
```typescript
// ❌ Don't test trivial code
get name() { return this._name }
set name(value) { this._name = value }
```

---

## Test Naming Conventions

### Good Test Names

```typescript
// ✅ Descriptive, readable
describe('calculateTotal', () => {
  it('returns sum of all item prices', () => {})
  it('returns 0 for empty array', () => {})
  it('applies discount correctly', () => {})
  it('throws error for negative prices', () => {})
})

// ✅ BDD style (given-when-then)
describe('User login', () => {
  it('should redirect to dashboard when credentials are valid', () => {})
  it('should show error message when password is incorrect', () => {})
  it('should lock account after 5 failed attempts', () => {})
})
```

### Bad Test Names

```typescript
// ❌ Vague, not descriptive
it('works', () => {})
it('test1', () => {})
it('should work correctly', () => {})
```

---

## Test Structure: AAA Pattern

**Arrange → Act → Assert**

```typescript
it('calculates order total correctly', () => {
  // ARRANGE: Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ]

  // ACT: Execute the function
  const total = calculateTotal(items)

  // ASSERT: Verify the result
  expect(total).toBe(35)
})
```

---

## Test Independence

### ✅ Good: Isolated Tests

```typescript
describe('User creation', () => {
  beforeEach(async () => {
    // Each test gets fresh database
    await db.user.deleteMany()
  })

  it('creates user with valid data', async () => {
    const user = await createUser({ email: 'test@example.com' })
    expect(user).toBeDefined()
  })

  it('throws error for duplicate email', async () => {
    await createUser({ email: 'test@example.com' })
    await expect(
      createUser({ email: 'test@example.com' })
    ).rejects.toThrow()
  })
})
```

### ❌ Bad: Dependent Tests

```typescript
// ❌ Tests depend on order (brittle!)
describe('User flow', () => {
  let userId

  it('creates user', async () => {
    const user = await createUser({ email: 'test@example.com' })
    userId = user.id // Shared state!
  })

  it('updates user', async () => {
    await updateUser(userId, { name: 'Updated' }) // Depends on previous test
  })
})
```

---

## Mocking Best Practices

### When to Mock

- ✅ External APIs (slow, unreliable, costs money)
- ✅ Time/randomness (make tests deterministic)
- ✅ File system operations
- ✅ Email/SMS services
- ❌ Don't mock your own code (test real behavior)
- ❌ Don't mock in integration tests (defeats purpose)

### Good Mocking

```typescript
// ✅ Mock external API
import { fetchUserFromAPI } from '@/lib/api'

jest.mock('@/lib/api')
const mockFetch = fetchUserFromAPI as jest.MockedFunction<typeof fetchUserFromAPI>

it('displays user data', async () => {
  mockFetch.mockResolvedValue({
    id: '1',
    name: 'John Doe'
  })

  const user = await getUserProfile('1')
  expect(user.name).toBe('John Doe')
})

// ✅ Mock Date for deterministic tests
beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2024-01-01'))
})

afterAll(() => {
  jest.useRealTimers()
})
```

### Bad Mocking

```typescript
// ❌ Over-mocking makes tests brittle
jest.mock('@/lib/database')
jest.mock('@/lib/validation')
jest.mock('@/lib/formatting')
// Now testing nothing real!

// ❌ Mocking what you own
jest.mock('./UserService') // Don't mock your own code!
```

---

## Code Coverage Guidelines

### Target Coverage by Code Type

| Code Type | Coverage Target | Rationale |
|-----------|----------------|-----------|
| Business logic | 90%+ | Critical, high value |
| Auth/security | 95%+ | Cannot fail |
| API routes | 80%+ | Integration tests cover |
| UI components | 70%+ | Test behavior, not rendering |
| Utils/helpers | 80%+ | High reuse, must work |
| Config files | 0% | No logic to test |

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/types/**'
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Critical paths need higher coverage
    './src/lib/auth/**': {
      lines: 90
    },
    './src/lib/payment/**': {
      lines: 95
    }
  }
}
```

---

## Performance Best Practices

### Keep Tests Fast

**Unit tests:** < 100ms each
**Integration tests:** < 1s each
**E2E tests:** < 10s each

```typescript
// ✅ Fast: Minimal setup
it('adds two numbers', () => {
  expect(add(1, 2)).toBe(3)
})

// ❌ Slow: Unnecessary async
it('adds two numbers', async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  expect(add(1, 2)).toBe(3)
})
```

### Parallel Execution

```bash
# Jest: Run tests in parallel (default)
npm test

# Playwright: Run in parallel
npx playwright test --workers=4
```

### Optimize Database Tests

```typescript
// ✅ Use transactions (rollback instead of delete)
beforeEach(async () => {
  await db.$executeRaw`BEGIN`
})

afterEach(async () => {
  await db.$executeRaw`ROLLBACK`
})

// ✅ Seed once, not per test
beforeAll(async () => {
  await seedTestData()
})
```

---

## Common Anti-Patterns

### Anti-Pattern 1: Testing Implementation

```typescript
// ❌ Bad: Testing internal state
it('increments counter', () => {
  const component = new Counter()
  component.increment()
  expect(component._internalCount).toBe(1) // Don't test private!
})

// ✅ Good: Testing behavior
it('displays incremented count', () => {
  render(<Counter />)
  fireEvent.click(screen.getByText('Increment'))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### Anti-Pattern 2: Fragile Selectors (E2E)

```typescript
// ❌ Bad: Fragile selectors
await page.click('div > div > button:nth-child(3)')
await page.click('button:text("Submit")') // Text changes

// ✅ Good: Stable selectors
await page.click('[data-testid="submit-button"]')
await page.click('[aria-label="Submit form"]')
```

### Anti-Pattern 3: Shared Test State

```typescript
// ❌ Bad: Shared mutable state
const testData = { count: 0 }

it('increments count', () => {
  testData.count++
  expect(testData.count).toBe(1)
})

it('increments count again', () => {
  testData.count++ // Depends on test order!
  expect(testData.count).toBe(2)
})

// ✅ Good: Fresh state per test
it('increments count', () => {
  const data = { count: 0 }
  data.count++
  expect(data.count).toBe(1)
})
```

### Anti-Pattern 4: Ignoring Flaky Tests

```typescript
// ❌ Bad: Skipping flaky tests
it.skip('sometimes fails', async () => {
  // Fix or remove, don't skip!
})

// ✅ Good: Fix the race condition
it('loads user data', async () => {
  render(<UserProfile />)

  // Don't use arbitrary timeouts
  // await new Promise(r => setTimeout(r, 1000))

  // Use proper waiting
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

---

## Test Data Management

### Factories & Fixtures

```typescript
// factories/user.ts
export function createTestUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    ...overrides
  }
}

// Usage
it('displays user info', () => {
  const user = createTestUser({ name: 'John Doe' })
  render(<UserCard user={user} />)
  expect(screen.getByText('John Doe')).toBeInTheDocument()
})
```

### Database Seeding

```typescript
// tests/helpers/seed.ts
export async function seedDatabase() {
  await db.user.createMany({
    data: [
      { email: 'admin@example.com', role: 'ADMIN' },
      { email: 'user@example.com', role: 'USER' }
    ]
  })
}

beforeAll(async () => {
  await seedDatabase()
})
```

---

## CI/CD Integration

### Run Tests in Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm install
      - run: npm test -- --coverage
      - run: npx playwright test

      # Upload coverage
      - uses: codecov/codecov-action@v3
```

### Fail Pipeline on Low Coverage

```javascript
// jest.config.js
module.exports = {
  coverageThresholds: {
    global: {
      lines: 70
    }
  }
}
// Pipeline fails if coverage < 70%
```

---

## Testing Checklist

### Before Merging PR

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Code coverage ≥ 70%
- [ ] No skipped/disabled tests
- [ ] Tests run in CI/CD
- [ ] E2E tests pass (for UI changes)

### Monthly Review

- [ ] Review flaky tests (fix or remove)
- [ ] Update dependencies (including test libraries)
- [ ] Check test performance (identify slow tests)
- [ ] Review coverage report (fill gaps)

---

## Framework-Specific Tips

### React Testing Library

```typescript
// ✅ Query by role (accessible)
screen.getByRole('button', { name: 'Submit' })
screen.getByRole('textbox', { name: 'Email' })

// ✅ Use user-event (simulates real interactions)
import userEvent from '@testing-library/user-event'
await userEvent.click(button)
await userEvent.type(input, 'text')

// ❌ Don't query by class or test internals
screen.getByClassName('btn-primary') // Fragile
expect(component.state.count).toBe(1) // Implementation detail
```

### Playwright

```typescript
// ✅ Use auto-waiting
await page.click('button') // Waits until clickable

// ✅ Use data-testid
await page.click('[data-testid="submit"]')

// ✅ Take screenshots on failure
test('checkout', async ({ page }, testInfo) => {
  // ...
  if (testInfo.status === 'failed') {
    await page.screenshot({ path: 'failure.png' })
  }
})
```

---

## Common Testing Commands

```bash
# Jest
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm test Button.test.ts    # Run specific file

# Playwright
npx playwright test                  # Run all E2E tests
npx playwright test --ui             # UI mode (interactive)
npx playwright test --debug         # Debug mode
npx playwright test --headed        # See browser
npx playwright codegen example.com   # Record test
```

---

## Related Resources

**Skills:**
- `/SKILLS/testing-strategist/` - Testing methodology
- `/SKILLS/security-engineer/` - Security testing
- `/SKILLS/api-designer/` - API testing

**Templates:**
- `/TEMPLATES/testing/jest-nextjs-setup.md`
- `/TEMPLATES/testing/playwright-e2e-setup.md`

**External:**
- [Jest Best Practices](https://jestjs.io/docs/testing-best-practices)
- [React Testing Library Guide](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

**Good tests are worth the investment.** ✅
