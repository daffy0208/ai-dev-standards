# Test Suite

Comprehensive test coverage for ai-dev-standards.

## 🎯 Coverage Status

**Current Coverage:** ~75% (Target: 80%)

| Category | Coverage | Status |
|----------|----------|--------|
| **Utils** | 95% | ✅ Excellent |
| **Tools** | 85% | ✅ Very Good |
| **Components** | 60% | ⚠️ Good |
| **Integrations** | 50% | ⚠️ Acceptable |

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run in watch mode (auto-rerun on changes)
npm run test:watch

# Run with UI (visual test runner)
npm run test:ui

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

---

## 📁 Test Structure

```
tests/
├── setup.ts                 # Global test setup
├── unit/                    # Unit tests (isolated, fast)
│   ├── utils/              # Utility function tests
│   │   ├── validation.test.ts     # ✅ Zod schemas
│   │   └── errorHandler.test.ts   # ✅ Error classes
│   ├── tools/              # Tool tests
│   │   ├── api-caller.test.ts     # ✅ HTTP client
│   │   └── filesystem.test.ts     # ✅ File operations
│   └── components/         # Component tests
│       └── forms/          # Form components
└── integration/            # Integration tests (external services)
    ├── supabase.test.ts    # Supabase integration
    ├── openai.test.ts      # OpenAI integration
    └── stripe.test.ts      # Stripe integration
```

---

## ✅ What's Tested

### Utils (95% coverage)

#### Validation Schemas (`validation.test.ts`)
- ✅ Email validation (lowercase, trim, format)
- ✅ Password schemas (regular, strong)
- ✅ URL validation
- ✅ Phone number (E.164 format)
- ✅ Slug format
- ✅ UUID v4
- ✅ Numeric schemas (positive int, percentage, price)
- ✅ User schemas (create, login, password update)
- ✅ Pagination schema
- ✅ Helper functions (validate, validateSafe)

**74 tests** covering all validation patterns

#### Error Handler (`errorHandler.test.ts`)
- ✅ Error classes (ApiError, ValidationError, etc.)
- ✅ HTTP status code mapping
- ✅ Error serialization
- ✅ Response formatting
- ✅ Rate limiting errors
- ✅ isApiError type guard

**29 tests** covering all error scenarios

### Tools (85% coverage)

#### API Caller (`api-caller.test.ts`)
- ✅ GET/POST/PUT/PATCH/DELETE requests
- ✅ Query parameters
- ✅ Authentication (Bearer, API Key, Basic)
- ✅ Custom headers
- ✅ Timeout handling
- ✅ Retry logic with exponential backoff
- ✅ Batch requests
- ✅ Response type handling (JSON, text)
- ✅ Error handling

**32 tests** covering all HTTP operations

#### File System (`filesystem.test.ts`)
- ✅ Path validation & security
- ✅ Read operations (text, JSON)
- ✅ Write operations (with directory creation)
- ✅ Append operations
- ✅ Directory listing (recursive, hidden files)
- ✅ File search (glob patterns)
- ✅ File metadata (size, dates, permissions)
- ✅ File operations (copy, move, delete)
- ✅ Compression (gzip/gunzip)
- ✅ Safety features (path traversal prevention)

**28 tests** covering all file operations

---

## 🔜 Coming Soon

### Components (In Progress)
- `useForm.test.ts` - Form hook tests
- `auth/LoginForm.test.ts` - Login component
- `auth/SignupForm.test.ts` - Signup component
- `errors/ErrorBoundary.test.ts` - Error boundary

### Integrations (Planned)
- `supabase.test.ts` - Auth & database operations
- `openai.test.ts` - Chat completions & embeddings
- `stripe.test.ts` - Payment processing
- `pinecone.test.ts` - Vector operations
- `resend.test.ts` - Email sending

### Tools (Planned)
- `web-scraper.test.ts` - Web scraping with Playwright
- `database-query.test.ts` - SQL query execution

---

## 🛠️ Writing Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  describe('SubFeature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = myFunction(input)

      // Assert
      expect(result).toBe('expected')
    })

    it('should handle errors', () => {
      expect(() => myFunction(null)).toThrow('error message')
    })
  })
})
```

### Mocking

```typescript
import { vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({ data: 'test' })
})

// Mock file system
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('file content')
}))
```

### Async Tests

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})
```

### Error Testing

```typescript
it('should throw on invalid input', () => {
  expect(() => myFunction(null)).toThrow('Invalid input')
})

it('should reject promise', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error')
})
```

---

## 📊 Coverage Reports

### View Coverage

After running `npm run test:coverage`:

```bash
# View in terminal
cat coverage/text

# View HTML report
open coverage/index.html

# View LCOV report (for CI tools)
cat coverage/lcov.info
```

### Coverage Thresholds

Set in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80
  }
}
```

Tests will fail if coverage drops below these thresholds.

---

## 🚨 Continuous Integration

### GitHub Actions

Tests run automatically on:
- Every push to `main`
- Every pull request
- Scheduled daily builds

Example workflow (`.github/workflows/ci.yml`):

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## 💡 Best Practices

### 1. Test Naming

✅ **Good:**
```typescript
it('should validate email and return lowercase')
it('should throw ValidationError when password is too short')
it('should retry 3 times before failing')
```

❌ **Bad:**
```typescript
it('works')
it('test email')
it('should work correctly')
```

### 2. Test Organization

- Group related tests with `describe`
- One assertion concept per `it` block
- Use `beforeEach`/`afterEach` for setup/cleanup

### 3. Assertions

✅ **Good:**
```typescript
expect(result).toBe(expected)
expect(result).toEqual(expectedObject)
expect(result).toHaveLength(3)
expect(() => fn()).toThrow('error')
```

❌ **Bad:**
```typescript
expect(result).toBeTruthy() // Too vague
expect(result == expected).toBe(true) // Use toBe directly
```

### 4. Mocking

- Mock external dependencies (APIs, file system, databases)
- Don't mock internal logic you're testing
- Clean up mocks in `afterEach`

### 5. Test Independence

- Tests should not depend on each other
- Each test should be able to run in isolation
- Use fresh state for each test

---

## 🐛 Debugging Tests

### Run Single Test File

```bash
vitest run tests/unit/utils/validation.test.ts
```

### Run Single Test

```bash
vitest run -t "should validate email"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal"
}
```

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

## 🎯 Goals

### Short-term (Current Sprint)
- [ ] Reach 80% code coverage
- [ ] Add component tests
- [ ] Add integration tests

### Long-term (v1.0)
- [ ] 90% code coverage
- [ ] E2E tests for CLI
- [ ] Performance benchmarks
- [ ] Security tests

---

**Tests are not just code validation - they're living documentation of how the system works.** Write tests that explain your intentions. 🚀
