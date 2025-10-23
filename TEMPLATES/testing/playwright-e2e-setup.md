# Playwright E2E Testing Setup

Complete setup guide for end-to-end testing with Playwright.

---

## Installation

```bash
npm init playwright@latest
```

This will:
- Install Playwright
- Create `playwright.config.ts`
- Create example test in `tests/`
- Install browsers

Or install manually:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

---

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail build on CI if accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI
  retries: process.env.CI ? 2 : 0,

  // Parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html'],
    ['list'],
    process.env.CI ? ['github'] : ['list'],
  ],

  // Shared settings
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

### package.json scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:chrome": "playwright test --project=chromium",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Example Tests

### Authentication Flow

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/')
  })

  test('user can sign up', async ({ page }) => {
    await page.click('text=Sign Up')

    // Fill form
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePass123!')
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!')

    // Submit
    await page.click('[data-testid="signup-button"]')

    // Verify redirect
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome')
  })

  test('user can log in', async ({ page }) => {
    await page.click('text=Log In')

    await page.fill('[data-testid="email-input"]', 'existing@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')

    await page.click('[data-testid="login-button"]')

    await expect(page).toHaveURL('/dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.click('text=Log In')

    await page.fill('[data-testid="email-input"]', 'wrong@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')

    await page.click('[data-testid="login-button"]')

    // Should show error
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials')
  })

  test('user can log out', async ({ page, context }) => {
    // Login first (using API for speed)
    await context.addCookies([{
      name: 'auth-token',
      value: 'test-token',
      domain: 'localhost',
      path: '/',
    }])

    await page.goto('/dashboard')

    // Logout
    await page.click('[data-testid="logout-button"]')

    // Should redirect to home
    await expect(page).toHaveURL('/')
  })
})
```

### E-Commerce Checkout

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('user can complete purchase', async ({ page }) => {
    // 1. Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button:text("Login")')

    // 2. Browse products
    await page.goto('/products')

    // 3. Add to cart
    await page.click('[data-testid="product-1"] button:text("Add to Cart")')

    // Verify cart badge
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1')

    // 4. Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page).toHaveURL('/cart')

    // 5. Proceed to checkout
    await page.click('button:text("Checkout")')

    // 6. Fill shipping
    await page.fill('[name="address"]', '123 Main St')
    await page.fill('[name="city"]', 'San Francisco')
    await page.fill('[name="zip"]', '94103')
    await page.click('button:text("Continue")')

    // 7. Fill payment (test mode)
    const cardNumberInput = page.frameLocator('iframe').locator('[name="cardnumber"]')
    await cardNumberInput.fill('4242 4242 4242 4242')

    const expiryInput = page.frameLocator('iframe').locator('[name="exp-date"]')
    await expiryInput.fill('12/25')

    const cvcInput = page.frameLocator('iframe').locator('[name="cvc"]')
    await cvcInput.fill('123')

    // 8. Place order
    await page.click('button:text("Place Order")')

    // 9. Verify confirmation
    await expect(page).toHaveURL(/\/orders\/\d+/)
    await expect(page.locator('h1')).toContainText('Order Confirmed')

    // Verify order details
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible()
  })
})
```

### Search Functionality

```typescript
// tests/e2e/search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test('searches and displays results', async ({ page }) => {
    await page.goto('/')

    // Type in search
    await page.fill('[data-testid="search-input"]', 'laptop')

    // Wait for debounce
    await page.waitForTimeout(500)

    // Verify results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-result"]')).toHaveCount(5)
  })

  test('shows no results message', async ({ page }) => {
    await page.goto('/')

    await page.fill('[data-testid="search-input"]', 'xyznonexistent')
    await page.waitForTimeout(500)

    await expect(page.locator('text=No results found')).toBeVisible()
  })
})
```

---

## Best Practices

### Use Stable Selectors

```typescript
// ✅ Good: data-testid
await page.click('[data-testid="submit-button"]')

// ✅ Good: ARIA roles
await page.click('button[name="submit"]')

// ❌ Bad: Text content (changes with i18n)
await page.click('text=Submit')

// ❌ Bad: CSS classes (change with styling)
await page.click('.btn-primary')

// ❌ Bad: nth-child (fragile)
await page.click('div > div > button:nth-child(3)')
```

### Auto-Waiting

```typescript
// Playwright automatically waits for:
// - Element to be visible
// - Element to be stable (not animating)
// - Element to receive events

// ✅ This just works
await page.click('button')

// ❌ Don't add manual waits
await page.waitForTimeout(1000) // Anti-pattern!
```

### Page Object Model

```typescript
// tests/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email)
    await this.page.fill('[data-testid="password"]', password)
    await this.page.click('[data-testid="login-button"]')
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator('[role="alert"]')).toContainText(message)
  }
}

// Usage in test
test('login fails with wrong password', async ({ page }) => {
  const loginPage = new LoginPage(page)

  await loginPage.goto()
  await loginPage.login('test@example.com', 'wrongpassword')
  await loginPage.expectErrorMessage('Invalid credentials')
})
```

### Test Fixtures (Reusable Setup)

```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Setup: Login
    await context.addCookies([{
      name: 'auth-token',
      value: 'test-token',
      domain: 'localhost',
      path: '/',
    }])

    await page.goto('/dashboard')

    // Use the authenticated page
    await use(page)

    // Teardown happens automatically
  },
})

// Usage
import { test } from './fixtures/auth'

test('user can view profile', async ({ authenticatedPage }) => {
  await authenticatedPage.click('[data-testid="profile-link"]')
  // Test continues...
})
```

---

## API Testing with Playwright

```typescript
import { test, expect } from '@playwright/test'

test('API: create user', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(201)

  const body = await response.json()
  expect(body).toMatchObject({
    email: 'test@example.com',
    name: 'Test User',
  })
})
```

---

## Visual Regression Testing

```typescript
test('homepage looks correct', async ({ page }) => {
  await page.goto('/')

  // Take screenshot and compare to baseline
  await expect(page).toHaveScreenshot('homepage.png')
})

// First run: Creates baseline
// Subsequent runs: Compares to baseline
```

---

## Debugging

### UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Debug Mode (Step Through)

```bash
npx playwright test --debug
```

### Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Codegen (Record Tests)

```bash
npx playwright codegen http://localhost:3000
```

### Trace Viewer (After Test)

```typescript
// Already configured in playwright.config.ts
// Traces saved on first retry

// View trace
npx playwright show-trace trace.zip
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Parallel Execution

```typescript
// Run tests in parallel (default)
test.describe.configure({ mode: 'parallel' })

// Run tests serially
test.describe.configure({ mode: 'serial' })

// Control workers in playwright.config.ts
workers: process.env.CI ? 2 : 4
```

---

## Common Patterns

### Waiting for API Calls

```typescript
test('loads data after clicking button', async ({ page }) => {
  // Wait for API response
  const responsePromise = page.waitForResponse('/api/users')

  await page.click('[data-testid="load-button"]')

  const response = await responsePromise
  expect(response.status()).toBe(200)

  await expect(page.locator('[data-testid="user-list"]')).toBeVisible()
})
```

### File Upload

```typescript
test('uploads file', async ({ page }) => {
  await page.goto('/upload')

  // Set file input
  await page.setInputFiles('[data-testid="file-input"]', 'path/to/file.pdf')

  await page.click('[data-testid="upload-button"]')

  await expect(page.locator('text=Upload successful')).toBeVisible()
})
```

### Testing Mobile Viewports

```typescript
test('mobile menu works', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })

  await page.goto('/')

  // Mobile menu should be visible
  await page.click('[data-testid="mobile-menu-button"]')
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
})
```

---

## Troubleshooting

### Tests are flaky

**Cause:** Race conditions, animations
**Solution:**
- Use `waitFor` with specific conditions
- Disable animations in test mode
- Increase timeout for specific actions

### Element not found

**Cause:** Selector changed or element not loaded
**Solution:**
- Use stable selectors (data-testid)
- Check element exists before interacting
- Verify page loaded correctly

### Tests timeout

**Cause:** Element never appears, API never responds
**Solution:**
- Increase timeout in config
- Check if dev server is running
- Verify network requests complete

---

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# Specific browser
npm run test:e2e:chrome

# Specific test file
npx playwright test auth.spec.ts

# View report
npm run test:e2e:report
```

---

## Related Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
