# Figma Integration

Complete Figma API integration for accessing design files, components, styles, and assets.

## Features

- ✅ **File Access** - Get file data, nodes, components, and styles
- ✅ **Design Tokens** - Extract colors, typography, spacing
- ✅ **Asset Export** - Export images, icons, SVGs, PDFs
- ✅ **Component Sets** - Access component variations
- ✅ **Team Libraries** - Get shared components and styles
- ✅ **Version History** - Access file versions
- ✅ **Comments** - Read file comments
- ✅ **CSS/JSON Export** - Export tokens as CSS variables or JSON

---

## Setup

### 1. Get Access Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Name it (e.g., "Development")
5. Copy the token

### 2. Environment Variables

```bash
FIGMA_ACCESS_TOKEN=figd_...
```

### 3. Install Dependencies

```bash
npm install node-fetch
```

---

## Usage

### Basic File Access

```typescript
import { FigmaClient } from './client'

const client = new FigmaClient({
  accessToken: process.env.FIGMA_ACCESS_TOKEN
})

// Get file data
const file = await client.getFile('abc123xyz')

console.log(file.name)
console.log(file.lastModified)
console.log(file.components)
console.log(file.styles)
```

### Extract Design Tokens

```typescript
// Get all design tokens
const tokens = await client.extractDesignTokens('abc123xyz')

console.log('Colors:', tokens.colors)
// [
//   { name: 'Primary/Blue', value: '#0066cc', rgb: {...} },
//   { name: 'Secondary/Green', value: '#10b981', rgb: {...} }
// ]

console.log('Typography:', tokens.typography)
// [
//   {
//     name: 'Heading/Large',
//     fontFamily: 'Inter',
//     fontSize: 48,
//     fontWeight: 700,
//     lineHeight: 56
//   }
// ]

console.log('Spacing:', tokens.spacing)
// [
//   { name: 'spacing-8', value: 8 },
//   { name: 'spacing-16', value: 16 }
// ]
```

### Export as CSS Variables

```typescript
// Generate CSS custom properties
const css = await client.exportTokensAsCSS('abc123xyz')

// Save to file
await fs.writeFile('tokens.css', css)
```

**Output:**

```css
:root {
  /* Colors */
  --color-primary-blue: #0066cc;
  --color-secondary-green: #10b981;
  --color-neutral-gray: #6b7280;

  /* Typography */
  --font-heading-large-family: Inter;
  --font-heading-large-size: 48px;
  --font-heading-large-weight: 700;
  --font-heading-large-line-height: 56px;

  /* Spacing */
  --space-small: 8px;
  --space-medium: 16px;
  --space-large: 32px;
}
```

### Export as JSON

```typescript
const json = await client.exportTokensAsJSON('abc123xyz')

await fs.writeFile('tokens.json', json)
```

**Output:**

```json
{
  "colors": [
    {
      "name": "Primary/Blue",
      "value": "#0066cc",
      "rgb": { "r": 0, "g": 0.4, "b": 0.8, "a": 1 }
    }
  ],
  "typography": [
    {
      "name": "Heading/Large",
      "fontFamily": "Inter",
      "fontSize": 48,
      "fontWeight": 700,
      "lineHeight": 56
    }
  ],
  "spacing": [
    { "name": "spacing-8", "value": 8 },
    { "name": "spacing-16", "value": 16 }
  ]
}
```

---

## Export Assets

### Export Images

```typescript
// Export specific nodes as images
const images = await client.exportImages(
  'abc123xyz',
  ['node-id-1', 'node-id-2'],
  {
    format: 'png',
    scale: 2 // 2x resolution
  }
)

for (const image of images) {
  console.log(`${image.name}: ${image.url}`)

  // Download the image
  const response = await fetch(image.url)
  const buffer = await response.arrayBuffer()
  await fs.writeFile(`${image.name}.png`, Buffer.from(buffer))
}
```

### Export SVGs

```typescript
const svgs = await client.exportImages(
  'abc123xyz',
  ['icon-1', 'icon-2'],
  { format: 'svg' }
)

for (const svg of svgs) {
  const response = await fetch(svg.url)
  const svgContent = await response.text()
  await fs.writeFile(`${svg.name}.svg`, svgContent)
}
```

---

## Components

### Get All Components

```typescript
const components = await client.getFileComponents('abc123xyz')

for (const [key, component] of Object.entries(components)) {
  console.log(`${component.name}:`, component.description)
}
```

### Get Component Sets (Variants)

```typescript
const componentSets = await client.getComponentSets('abc123xyz')

for (const [setId, variants] of Object.entries(componentSets)) {
  console.log('Component Set:', setId)
  console.log('Variants:')

  for (const variant of variants) {
    console.log(`  - ${variant.name}`)
  }
}
```

---

## Team Libraries

### Get Team Components

```typescript
const teamComponents = await client.getTeamComponents('team-id')

console.log('Shared components:', Object.keys(teamComponents).length)
```

### Get Team Styles

```typescript
const teamStyles = await client.getTeamStyles('team-id')

console.log('Shared styles:', Object.keys(teamStyles).length)
```

---

## Version History

```typescript
const versions = await client.getVersions('abc123xyz')

for (const version of versions) {
  console.log(`${version.label} - ${version.created_at}`)
  console.log(`  by ${version.user.handle}`)
  console.log(`  description: ${version.description}`)
}
```

---

## Comments

```typescript
const comments = await client.getComments('abc123xyz')

for (const comment of comments) {
  console.log(`${comment.user.handle}: ${comment.message}`)
  console.log(`  at node: ${comment.client_meta.node_id}`)
}
```

---

## Common Patterns

### Sync Design Tokens

```typescript
// Generate tokens and save to project
async function syncDesignTokens(fileKey: string) {
  const client = new FigmaClient()

  // Export as CSS
  const css = await client.exportTokensAsCSS(fileKey)
  await fs.writeFile('src/styles/design-tokens.css', css)

  // Export as JSON
  const json = await client.exportTokensAsJSON(fileKey)
  await fs.writeFile('src/styles/design-tokens.json', json)

  console.log('Design tokens synced!')
}

await syncDesignTokens('abc123xyz')
```

### Export All Icons

```typescript
// Find all icon nodes and export as SVGs
async function exportAllIcons(fileKey: string) {
  const client = new FigmaClient()
  const file = await client.getFile(fileKey)

  // Find icon frame
  const iconFrame = findNodeByName(file.document, 'Icons')

  if (iconFrame?.children) {
    const iconIds = iconFrame.children.map(child => child.id)

    const svgs = await client.exportImages(fileKey, iconIds, {
      format: 'svg'
    })

    // Save each SVG
    for (const svg of svgs) {
      const response = await fetch(svg.url)
      const content = await response.text()
      await fs.writeFile(`icons/${svg.name}.svg`, content)
    }

    console.log(`Exported ${svgs.length} icons`)
  }
}

function findNodeByName(node: any, name: string): any {
  if (node.name === name) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByName(child, name)
      if (found) return found
    }
  }
  return null
}
```

### Generate React Components from Figma

```typescript
// Generate React component from Figma component
async function generateReactComponent(fileKey: string, componentId: string) {
  const client = new FigmaClient()
  const nodes = await client.getNodes(fileKey, [componentId])
  const component = nodes[componentId]

  // Export as SVG
  const [svg] = await client.exportImages(fileKey, [componentId], {
    format: 'svg'
  })

  const response = await fetch(svg.url)
  const svgContent = await response.text()

  // Generate React component
  const reactComponent = `
import React from 'react'

export function ${component.name}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${svgContent.replace('<svg', '<svg {...props}')}
  )
}
  `.trim()

  await fs.writeFile(`components/${component.name}.tsx`, reactComponent)
  console.log(`Generated ${component.name}.tsx`)
}
```

---

## Finding File Keys

The file key is in the Figma URL:

```
https://www.figma.com/file/ABC123XYZ/My-Design-File
                            ^^^^^^^^^
                            File Key
```

Finding node IDs:
1. Select a node in Figma
2. Right-click → "Copy/Paste as" → "Copy link"
3. The node ID is in the URL: `?node-id=123-456`
4. Convert format: `123-456` → `123:456`

---

## Error Handling

```typescript
try {
  const file = await client.getFile('invalid-key')
} catch (error) {
  if (error.message.includes('404')) {
    console.error('File not found. Check your file key.')
  } else if (error.message.includes('403')) {
    console.error('Access denied. Check your access token.')
  } else {
    console.error('Error:', error.message)
  }
}
```

---

## Rate Limits

Figma API has rate limits:
- **Free plans**: 100 requests per minute
- **Paid plans**: 400 requests per minute

Handle rate limits:

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        // Rate limited, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

// Usage
const file = await withRetry(() => client.getFile('abc123xyz'))
```

---

## Best Practices

### 1. Cache File Data

```typescript
// Cache file data to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>()

async function getCachedFile(fileKey: string) {
  const cached = cache.get(fileKey)
  const now = Date.now()

  if (cached && now - cached.timestamp < 60000) { // 1 minute cache
    return cached.data
  }

  const file = await client.getFile(fileKey)
  cache.set(fileKey, { data: file, timestamp: now })
  return file
}
```

### 2. Batch Export

```typescript
// Export multiple assets in one request
const allNodeIds = ['1:1', '1:2', '1:3', '1:4', '1:5']
const images = await client.exportImages(fileKey, allNodeIds)
```

### 3. Use Webhooks

Set up webhooks for file updates:
1. Figma → File → "Setup webhooks"
2. Get notified when design changes
3. Auto-sync tokens when designers update

---

## Troubleshooting

### Invalid Access Token
Ensure your token is valid and has access to the file.

### Node Not Found
Check node ID format: use `123:456` not `123-456`.

### Export URLs Expire
Export URLs are temporary. Download immediately.

### Missing Styles
Styles must be published in team library to be accessible.

---

## Resources

- [Figma API Docs](https://www.figma.com/developers/api)
- [Figma Plugin API](https://www.figma.com/plugin-docs/api/api-reference/)
- [Figma Community](https://www.figma.com/community)
- [Design Tokens Format](https://design-tokens.github.io/community-group/format/)

---

**Bridge the gap between design and code** 🎨
