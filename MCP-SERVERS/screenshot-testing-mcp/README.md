# Screenshot Testing MCP Server

Visual regression testing for web applications using Percy, Chromatic, or Playwright.

## What This MCP Does

- 📸 Captures component screenshots
- 👀 Detects visual regressions
- 🎨 Compares against baseline images
- 📱 Tests responsive layouts
- 🌓 Validates dark mode
- ✅ Auto-approves or flags changes

## Installation

```bash
# Create MCP server
mkdir -p MCP-SERVERS/screenshot-testing-mcp
cd MCP-SERVERS/screenshot-testing-mcp

# Install dependencies
npm init -y
npm install @modelcontextprotocol/sdk playwright pixelmatch pngjs
```

## Setup

```json
// Add to Claude Code MCP settings
{
  "mcpServers": {
    "screenshot-testing": {
      "command": "node",
      "args": ["/path/to/screenshot-testing-mcp/index.js"],
      "env": {
        "BASELINE_DIR": "./.screenshots/baseline",
        "CURRENT_DIR": "./.screenshots/current",
        "DIFF_DIR": "./.screenshots/diff"
      }
    }
  }
}
```

## Features

### 1. Component Screenshot Capture

```javascript
// Capture a component
await screenshotTester.capture({
  url: 'http://localhost:3000/components/Button',
  name: 'button-primary',
  viewport: { width: 1280, height: 720 }
})

// Creates baseline screenshot if it doesn't exist
// Compares against baseline if it does
```

### 2. Visual Regression Detection

```javascript
// Compare screenshots
const result = await screenshotTester.compare({
  baseline: 'button-primary-baseline.png',
  current: 'button-primary-current.png'
})

// Returns:
{
  pixelDifference: 156,
  percentageDifference: 0.02,
  passed: true, // < 0.1% difference threshold
  diffImagePath: './diff/button-primary-diff.png'
}
```

### 3. Responsive Testing

```javascript
// Test multiple viewports
await screenshotTester.captureResponsive({
  url: 'http://localhost:3000/components/Header',
  name: 'header',
  viewports: [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' }
  ]
})

// Creates: header-mobile.png, header-tablet.png, header-desktop.png
```

### 4. Dark Mode Testing

```javascript
// Test light and dark modes
await screenshotTester.captureThemes({
  url: 'http://localhost:3000/components/Card',
  name: 'card',
  themes: ['light', 'dark']
})

// Creates: card-light.png, card-dark.png
```

## Integration with Playwright

```typescript
// tests/visual.spec.ts
import { test, expect } from '@playwright/test'

test('Button visual regression', async ({ page }) => {
  await page.goto('http://localhost:3000/components/Button')

  // Capture screenshot
  await expect(page).toHaveScreenshot('button-primary.png', {
    maxDiffPixels: 100
  })
})

test('Button states', async ({ page }) => {
  await page.goto('http://localhost:3000/components/Button')

  // Hover state
  await page.locator('button').hover()
  await expect(page).toHaveScreenshot('button-hover.png')

  // Focus state
  await page.locator('button').focus()
  await expect(page).toHaveScreenshot('button-focus.png')

  // Disabled state
  await page.evaluate(() => {
    document.querySelector('button')?.setAttribute('disabled', 'true')
  })
  await expect(page).toHaveScreenshot('button-disabled.png')
})
```

## CI/CD Integration

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on: [pull_request]

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

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run visual tests
        run: npx playwright test --project=visual

      - name: Upload diff images
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-diffs
          path: .screenshots/diff/
```

## Usage in Claude Code

```
User: "Run visual regression tests on the Button component"

Claude: *Uses screenshot-testing MCP to capture and compare*

Results:
✅ button-primary.png - No changes
⚠️ button-hover.png - 0.05% difference (minor change detected)
❌ button-disabled.png - 2.3% difference (regression detected!)

Diff images saved to: .screenshots/diff/
```

## Configuration

```javascript
// screenshot-testing.config.js
module.exports = {
  baselineDir: './.screenshots/baseline',
  currentDir: './.screenshots/current',
  diffDir: './.screenshots/diff',

  threshold: {
    pixels: 100,
    percentage: 0.1
  },

  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  },

  themes: ['light', 'dark'],

  // Auto-approve if difference is below threshold
  autoApprove: true,

  // Ignore specific elements
  ignore: [
    '.dynamic-timestamp',
    '.random-id'
  ]
}
```

## Best Practices

1. **Baseline Management**
   - Commit baseline images to git
   - Update baselines when UI intentionally changes
   - Review diffs carefully before approving

2. **Threshold Tuning**
   - Start with strict threshold (0.1%)
   - Adjust based on font rendering differences
   - Use pixel count for small components

3. **Performance**
   - Run visual tests on key components only
   - Use parallel execution
   - Cache baseline images

4. **CI/CD**
   - Fail builds on regressions
   - Upload diff images as artifacts
   - Allow manual approval for intentional changes

## Related Tools

- **Percy** - Automated visual testing platform
- **Chromatic** - Storybook visual testing
- **Playwright** - Browser automation + screenshots
- **BackstopJS** - Visual regression testing

Let's catch visual bugs before they reach production!
