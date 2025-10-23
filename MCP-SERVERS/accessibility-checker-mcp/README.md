# Accessibility Checker MCP Server

Automated WCAG compliance checking for web applications.

## What This MCP Does

- ✅ Checks WCAG AA/AAA compliance
- 🎨 Validates color contrast ratios
- 🏷️ Verifies semantic HTML
- ⌨️ Tests keyboard navigation
- 📱 Checks screen reader compatibility
- 🖼️ Validates alt text for images

## Installation

```bash
# Clone or create the MCP server
mkdir -p MCP-SERVERS/accessibility-checker-mcp
cd MCP-SERVERS/accessibility-checker-mcp

# Install dependencies
npm init -y
npm install @modelcontextprotocol/sdk axe-core pa11y lighthouse
```

## Setup

```json
// Add to Claude Code MCP settings
{
  "mcpServers": {
    "accessibility-checker": {
      "command": "node",
      "args": ["/path/to/accessibility-checker-mcp/index.js"]
    }
  }
}
```

## Features

### 1. Automated WCAG Checks

```javascript
// Check a URL for accessibility issues
const results = await accessibilityChecker.check('https://example.com')

// Returns:
{
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Text has insufficient contrast',
      nodes: [...]
    }
  ],
  passes: 45,
  violations: 3,
  incomplete: 0
}
```

### 2. Color Contrast Validation

```javascript
// Check specific colors
const contrast = await accessibilityChecker.checkContrast('#000000', '#FFFFFF')
// Returns: { ratio: 21, passes: 'AAA' }

const badContrast = await accessibilityChecker.checkContrast('#777777', '#888888')
// Returns: { ratio: 1.3, passes: 'fail', recommendation: '#333333' }
```

### 3. Semantic HTML Validation

```javascript
// Validate HTML structure
const semantic = await accessibilityChecker.validateSemantics(`
  <div>
    <span onClick="handleClick()">Click me</span>
  </div>
`)
// Returns warnings about missing button element
```

## Usage in Claude Code

```
User: "Check this page for accessibility issues: components/LoginForm.tsx"