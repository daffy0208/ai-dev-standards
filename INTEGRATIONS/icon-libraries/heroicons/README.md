# Heroicons Integration

TypeScript client for Heroicons - beautiful hand-crafted SVG icons by the makers of Tailwind CSS.

## Features

- Search icons by name or tags
- Get SVG content for outline and solid variants
- Support for 24x24 and 20x20 sizes
- Icon metadata and categories
- Batch fetching
- Automatic caching
- Zero runtime dependencies
- Full TypeScript support

## Installation

No external dependencies required - uses native `fetch` API.

```bash
# Just copy the client.ts file to your project
cp client.ts your-project/lib/heroicons.ts
```

## Usage

### Basic Setup

```typescript
import { HeroiconsClient } from './lib/heroicons'

// Create client
const heroicons = new HeroiconsClient()

// Search for icons
const results = await heroicons.searchIcons('arrow')

// Get specific icon
const icon = await heroicons.getIcon('arrow-right', '24', 'outline')
console.log(icon.svg) // SVG content
```

### Search Icons

```typescript
// Simple search
const arrows = await heroicons.searchIcons('arrow')

// Search with filters
const solidIcons = await heroicons.searchIcons('check', {
  variant: 'solid',
  size: '24',
  limit: 10
})

for (const icon of solidIcons) {
  console.log(`${icon.displayName} - ${icon.variant} ${icon.size}x${icon.size}`)
}
```

### Get Icon SVG

```typescript
// Get outline icon (default)
const outlineIcon = await heroicons.getIcon('heart')

// Get solid icon
const solidIcon = await heroicons.getIcon('heart', '24', 'solid')

// Get small icon
const smallIcon = await heroicons.getIcon('heart', '20', 'outline')

console.log('SVG content:', solidIcon.svg)
console.log('Source URL:', solidIcon.url)
```

### Batch Fetch Icons

```typescript
const icons = await heroicons.getIcons([
  { name: 'home', variant: 'outline', size: '24' },
  { name: 'user', variant: 'solid', size: '24' },
  { name: 'cog-6-tooth', variant: 'outline', size: '20' }
])

for (const icon of icons) {
  console.log(`Loaded: ${icon.name}`)
}
```

### List All Icons

```typescript
// List all icons
const allIcons = await heroicons.listIcons()

// List with filters
const outlineIcons = await heroicons.listIcons({
  variant: 'outline',
  size: '24'
})

console.log(`Found ${outlineIcons.length} outline icons`)
```

### React Integration

```tsx
import { HeroiconsClient } from './lib/heroicons'
import { useEffect, useState } from 'react'

function Icon({ name, variant = 'outline', size = '24' }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const client = new HeroiconsClient()

    client.getIcon(name, size, variant).then(icon => {
      setSvg(icon.svg)
    })
  }, [name, variant, size])

  return <span dangerouslySetInnerHTML={{ __html: svg }} className="inline-block" />
}

// Usage
;<Icon name="heart" variant="solid" size="24" />
```

### Clear Cache

```typescript
// Clear cached icons
heroicons.clearCache()

// Useful when updating icon versions or switching between variants
```

## API Reference

### HeroiconsClient

#### searchIcons(query, options?)

Search icons by name or tags.

```typescript
await heroicons.searchIcons('arrow', {
  variant?: 'outline' | 'solid' | 'mini',
  size?: '24' | '20',
  limit?: number
})
```

Returns: `Promise<IconSearchResult[]>`

#### getIcon(name, size?, variant?)

Get icon SVG content.

```typescript
await heroicons.getIcon(
  'arrow-right',
  '24', // size: '24' | '20'
  'outline' // variant: 'outline' | 'solid' | 'mini'
)
```

Returns: `Promise<GetIconResult>`

#### getIcons(icons)

Fetch multiple icons at once.

```typescript
await heroicons.getIcons([
  { name: 'home', size: '24', variant: 'outline' },
  { name: 'user', size: '20', variant: 'solid' }
])
```

Returns: `Promise<GetIconResult[]>`

#### listIcons(options?)

List all available icons.

```typescript
await heroicons.listIcons({
  variant?: 'outline' | 'solid' | 'mini',
  size?: '24' | '20'
})
```

Returns: `Promise<IconSearchResult[]>`

#### clearCache()

Clear the icon cache.

```typescript
heroicons.clearCache()
```

## Types

### IconVariant

```typescript
type IconVariant = 'outline' | 'solid' | 'mini'
```

### IconSize

```typescript
type IconSize = '24' | '20'
```

### IconSearchResult

```typescript
interface IconSearchResult {
  name: string // kebab-case name
  displayName: string // Display Name
  variant: IconVariant
  size: IconSize
  category?: string
}
```

### GetIconResult

```typescript
interface GetIconResult {
  name: string
  variant: IconVariant
  size: IconSize
  svg: string // SVG content
  url: string // Source URL
}
```

## Common Icons

Heroicons includes over 200 icons including:

**Navigation:**

- arrow-right, arrow-left, arrow-up, arrow-down
- chevron-right, chevron-left, chevron-up, chevron-down
- bars-3 (menu), x-mark (close)

**Actions:**

- plus, minus, check, x-mark
- pencil (edit), trash (delete)
- magnifying-glass (search)
- share, download, upload

**UI Elements:**

- heart, star, bell
- home, user, users
- cog-6-tooth (settings)
- ellipsis-horizontal, ellipsis-vertical

**Content:**

- document, folder, photo
- calendar, clock, envelope
- link, globe-alt, map-pin

**Status:**

- check-circle, x-circle
- exclamation-triangle (warning)
- information-circle, question-mark-circle
- shield-check

**Security:**

- lock-closed, lock-open, key
- eye, eye-slash

## Icon Variants

### Outline (default)

- Lighter weight
- 1.5px stroke
- Best for UI elements
- More versatile

```typescript
await heroicons.getIcon('heart', '24', 'outline')
```

### Solid

- Filled version
- More emphasis
- Better for small sizes
- Good for selected states

```typescript
await heroicons.getIcon('heart', '24', 'solid')
```

### Mini

- 20x20 solid icons
- Optimized for small UI
- Dense layouts

```typescript
await heroicons.getIcon('heart', '20', 'mini')
```

## Best Practices

1. **Cache icons** - The client automatically caches fetched icons
2. **Use outline by default** - More versatile for most UI needs
3. **Solid for emphasis** - Use solid variants for selected/active states
4. **Consistent sizing** - Stick to either 24 or 20 throughout your app
5. **Meaningful names** - Heroicons uses descriptive kebab-case names
6. **Batch loading** - Use `getIcons()` for multiple icons
7. **Error handling** - Handle missing icons gracefully

## Examples

### Icon Button

```tsx
function IconButton({ icon, onClick, variant = 'outline' }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const client = new HeroiconsClient()
    client.getIcon(icon, '24', variant).then(result => {
      setSvg(result.svg)
    })
  }, [icon, variant])

  return (
    <button
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-100"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
```

### Icon Picker

```tsx
function IconPicker({ onSelect }) {
  const [icons, setIcons] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const client = new HeroiconsClient()

    if (search) {
      client.searchIcons(search, { limit: 50 }).then(setIcons)
    } else {
      client.listIcons({ variant: 'outline' }).then(setIcons)
    }
  }, [search])

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search icons..."
      />
      <div className="grid grid-cols-6 gap-2">
        {icons.map(icon => (
          <button key={`${icon.name}-${icon.variant}`} onClick={() => onSelect(icon)}>
            {icon.displayName}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Dynamic Icon Component

```tsx
function DynamicIcon({ name, className = 'w-6 h-6' }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const client = new HeroiconsClient()
    client.getIcon(name).then(result => {
      // Add className to SVG
      const parser = new DOMParser()
      const doc = parser.parseFromString(result.svg, 'image/svg+xml')
      const svgEl = doc.querySelector('svg')

      if (svgEl) {
        svgEl.setAttribute('class', className)
        setSvg(svgEl.outerHTML)
      }
    })
  }, [name, className])

  return <span dangerouslySetInnerHTML={{ __html: svg }} />
}
```

## Resources

- [Heroicons Official Site](https://heroicons.com/)
- [Heroicons GitHub](https://github.com/tailwindlabs/heroicons)
- [Tailwind CSS](https://tailwindcss.com/)

## License

MIT
