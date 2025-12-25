# Figma Sync MCP Server

Sync Figma designs with your codebase - import components, extract design tokens, and automate design-to-code workflow.

## Features

### Tools

#### `importFigmaDesign`

Import complete Figma design file with components, styles, and assets.

**Parameters:**

- `fileUrl` (string, required): Figma file URL
- `options` (object):
  - `includeComponents` (boolean): Import components
  - `includeStyles` (boolean): Import styles
  - `includeAssets` (boolean): Import images/icons
  - `format` (string): Export format - json, css, react, vue

**Example:**

```typescript
{
  fileUrl: "https://www.figma.com/file/abc123/MyDesign",
  options: {
    includeComponents: true,
    includeStyles: true,
    format: "react"
  }
}
```

#### `extractDesignTokens`

Extract design tokens (colors, typography, spacing) from Figma.

**Parameters:**

- `fileUrl` (string, required): Figma file URL
- `tokenTypes` (array): Types to extract - colors, typography, spacing, effects, grids
- `format` (string): Output format - json, css, scss, tailwind, style-dictionary

**Example:**

```typescript
{
  fileUrl: "https://www.figma.com/file/abc123/MyDesign",
  tokenTypes: ["colors", "typography", "spacing"],
  format: "tailwind"
}
```

#### `exportComponents`

Export specific Figma components as framework code.

**Parameters:**

- `fileUrl` (string, required): Figma file URL
- `componentNames` (array, required): Component names to export
- `framework` (string, required): Target framework - react, vue, svelte, html, angular
- `includeStyles` (boolean): Include inline styles

**Example:**

```typescript
{
  fileUrl: "https://www.figma.com/file/abc123/MyDesign",
  componentNames: ["Button", "Card", "Input"],
  framework: "react",
  includeStyles: true
}
```

#### `syncStyles`

Continuously sync Figma styles with codebase design tokens.

**Parameters:**

- `fileUrl` (string, required): Figma file URL
- `targetPath` (string, required): Path to write design tokens
- `format` (string): Output file format - css, scss, js, json, ts
- `watch` (boolean): Watch for changes and auto-sync

**Example:**

```typescript
{
  fileUrl: "https://www.figma.com/file/abc123/MyDesign",
  targetPath: "./src/styles/tokens.css",
  format: "css",
  watch: true
}
```

### Resources

#### `figma-sync://files`

List of accessible Figma files.

#### `figma-sync://setup`

Complete setup guide for Figma API integration.

## Setup

### 1. Get Figma Access Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal Access Tokens"
3. Click "Generate new token"
4. Copy token securely

### 2. Configure Environment

```bash
export FIGMA_ACCESS_TOKEN="figd_your_token_here"
```

### 3. Installation

```bash
cd mcp-servers/figma-sync-mcp
npm install
npm run build
```

### 4. MCP Configuration

```json
{
  "mcpServers": {
    "figma-sync": {
      "command": "node",
      "args": ["path/to/figma-sync-mcp/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_token_here"
      }
    }
  }
}
```

## Supported Skills

- **figma-developer**: Direct Figma-to-code workflow
- **design-system-architect**: Automated design token management

## Workflow Examples

### Complete Design Import

```typescript
// 1. Import full design
const design = await importFigmaDesign({
  fileUrl: 'https://www.figma.com/file/abc123/MyApp',
  options: {
    includeComponents: true,
    includeStyles: true,
    includeAssets: true,
    format: 'react'
  }
})

// Result: Components, styles, and assets ready for development
```

### Design Tokens Workflow

```typescript
// 1. Extract design tokens
const tokens = await extractDesignTokens({
  fileUrl: 'https://www.figma.com/file/abc123/MyApp',
  tokenTypes: ['colors', 'typography', 'spacing'],
  format: 'tailwind'
})

// 2. Sync to codebase
await syncStyles({
  fileUrl: 'https://www.figma.com/file/abc123/MyApp',
  targetPath: './src/styles/design-tokens.css',
  format: 'css',
  watch: true // Auto-update on changes
})
```

### Component Export

```typescript
// Export specific components
const components = await exportComponents({
  fileUrl: 'https://www.figma.com/file/abc123/MyApp',
  componentNames: ['Button', 'Card', 'Modal', 'Input'],
  framework: 'react',
  includeStyles: true
})

// Components ready to integrate
```

## Design Token Formats

### JSON Format

```json
{
  "colors": {
    "primary": "#4F46E5",
    "secondary": "#EC4899"
  },
  "spacing": {
    "sm": "0.5rem",
    "md": "1rem"
  }
}
```

### CSS Format

```css
:root {
  --color-primary: #4f46e5;
  --color-secondary: #ec4899;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}
```

### Tailwind Format

```javascript
module.exports = {
  theme: {
    colors: {
      primary: '#4F46E5',
      secondary: '#EC4899'
    },
    spacing: {
      sm: '0.5rem',
      md: '1rem'
    }
  }
}
```

### Style Dictionary Format

```json
{
  "color": {
    "primary": { "value": "#4F46E5" }
  }
}
```

## Component Export Examples

### React Component

```tsx
// Button.tsx
export function Button({ children, variant = 'primary' }) {
  return <button className={`btn btn-${variant}`}>{children}</button>
}
```

### Vue Component

```vue
<!-- Button.vue -->
<template>
  <button :class="`btn btn-${variant}`">
    <slot />
  </button>
</template>

<script setup>
defineProps(['variant'])
</script>
```

### Svelte Component

```svelte
<!-- Button.svelte -->
<script>
  export let variant = 'primary';
</script>

<button class="btn btn-{variant}">
  <slot />
</button>
```

## Best Practices

### 1. Design Token Naming

**Figma:**

- Use consistent naming: `color/primary/500`
- Organize in folders
- Document usage

**Code:**

- Match Figma structure
- Use semantic names
- Version control tokens

### 2. Component Organization

- Use Figma components, not frames
- Name components clearly
- Group related components
- Document variants

### 3. Sync Strategy

**One-time sync:**

- Initial project setup
- Major redesigns
- Prototyping

**Continuous sync:**

- Active development
- Design iteration
- Component libraries

### 4. Version Control

```bash
# Commit design tokens
git add src/styles/tokens.css
git commit -m "Update design tokens from Figma"

# Track Figma file versions in README
```

## Figma API Limits

- **Rate limit:** 1000 requests/hour
- **File size:** No explicit limit
- **Asset export:** 500 items per request

## Troubleshooting

### 401 Unauthorized

- Token invalid or expired
- Regenerate token in Figma settings

### 403 Forbidden

- Missing file permissions
- Check file sharing settings
- Verify team access

### 404 Not Found

- Invalid file URL
- File deleted or moved
- Check file ID format

### 429 Rate Limited

- Too many requests
- Wait 1 hour or use caching
- Batch operations

## Advanced Features

### Watch Mode

Monitor Figma for changes and auto-sync:

```typescript
await syncStyles({
  fileUrl: '...',
  targetPath: './src/styles/tokens.css',
  watch: true
})

// Terminal output:
// ✓ Synced: 12 colors, 8 typography tokens
// 👀 Watching for changes...
```

### Selective Import

Import only what you need:

```typescript
await importFigmaDesign({
  fileUrl: '...',
  options: {
    includeComponents: true,
    includeStyles: false, // Skip styles
    includeAssets: false // Skip assets
  }
})
```

### Multi-File Sync

Sync multiple Figma files:

```typescript
const files = ['https://www.figma.com/file/abc/Components', 'https://www.figma.com/file/def/Tokens']

for (const fileUrl of files) {
  await syncStyles({ fileUrl, targetPath: '...' })
}
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Sync Figma Designs

on:
  schedule:
    - cron: '0 0 * * *' # Daily
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Sync Figma
        env:
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_TOKEN }}
        run: |
          npm run figma:sync
          git add .
          git commit -m "Update from Figma"
          git push
```

## Development

```bash
npm install
npm run build
npm test
npm run dev
```

## License

MIT
