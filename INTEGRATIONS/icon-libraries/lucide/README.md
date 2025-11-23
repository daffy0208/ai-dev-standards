# Lucide Icons Integration

TypeScript client for Lucide - a beautiful & consistent icon toolkit with over 1000 icons. Fork of Feather Icons with active community maintenance.

## Features

- 1000+ icons with comprehensive search
- Customizable size, color, and stroke width
- Category-based organization
- Tag-based search with scoring
- SVG and data URL output
- Automatic caching
- Zero runtime dependencies
- Full TypeScript support

## Installation

No external dependencies required - uses native `fetch` API.

```bash
# Just copy the client.ts file to your project
cp client.ts your-project/lib/lucide.ts
```

## Usage

### Basic Setup

```typescript
import { LucideClient } from './lib/lucide'

// Create client
const lucide = new LucideClient()

// Search for icons
const results = await lucide.searchIcons('arrow')

// Get specific icon
const icon = await lucide.getIcon('arrow-right', {
  size: 24,
  color: '#000',
  strokeWidth: 2
})

console.log(icon.svg) // SVG content
console.log(icon.dataUrl) // data:image/svg+xml;base64,...
```

### Search Icons

```typescript
// Simple search
const arrows = await lucide.searchIcons('arrow')

// Search with category filter
const fileIcons = await lucide.searchIcons('document', {
  category: 'files',
  limit: 20
})

// Results are scored and sorted by relevance
for (const icon of fileIcons) {
  console.log(`${icon.displayName} - Score: ${icon.matchScore}`)
  console.log(`  Category: ${icon.category}`)
  console.log(`  Tags: ${icon.tags.join(', ')}`)
}
```

### Get Icon SVG

```typescript
// Get icon with default options
const icon = await lucide.getIcon('heart')

// Customize icon appearance
const customIcon = await lucide.getIcon('heart', {
  size: 32,
  color: '#ff0000',
  strokeWidth: 3,
  fill: 'currentColor',
  className: 'icon-heart'
})

console.log('SVG:', customIcon.svg)
console.log('Data URL:', customIcon.dataUrl)
```

### Icon Options

```typescript
interface IconOptions {
  size?: number // Icon size (default: 24)
  color?: string // Stroke color (default: 'currentColor')
  strokeWidth?: number // Stroke width (default: 2)
  fill?: string // Fill color (default: 'none')
  className?: string // CSS class name
}
```

### Batch Fetch Icons

```typescript
const icons = await lucide.getIcons([
  { name: 'home' },
  { name: 'user', options: { size: 32, color: '#4299e1' } },
  { name: 'settings', options: { strokeWidth: 3 } }
])

for (const icon of icons) {
  console.log(`Loaded: ${icon.name}`)
}
```

### List Icons by Category

```typescript
// Get all categories
const categories = await lucide.getCategories()
console.log('Categories:', categories)

// List all icons
const allIcons = await lucide.listIcons()

// List icons in specific category
const arrowIcons = await lucide.listIcons({ category: 'arrows' })
const fileIcons = await lucide.listIcons({ category: 'files' })
```

### React Integration

```tsx
import { LucideClient } from './lib/lucide'
import { useEffect, useState } from 'react'

function LucideIcon({ name, size = 24, color = 'currentColor', strokeWidth = 2 }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const client = new LucideClient()

    client.getIcon(name, { size, color, strokeWidth }).then(icon => {
      setSvg(icon.svg)
    })
  }, [name, size, color, strokeWidth])

  return <span dangerouslySetInnerHTML={{ __html: svg }} className="inline-flex items-center" />
}

// Usage
;<LucideIcon name="heart" size={24} color="#e53e3e" />
```

### Using Data URLs

```tsx
// Use as img src
function IconImage({ name }) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    const client = new LucideClient()
    client.getIcon(name).then(icon => {
      setDataUrl(icon.dataUrl)
    })
  }, [name])

  return <img src={dataUrl} alt={name} />
}

// Use as background image
;<div style={{ backgroundImage: `url(${dataUrl})` }} />
```

## API Reference

### LucideClient

#### searchIcons(query, options?)

Search icons by name or tags with relevance scoring.

```typescript
await lucide.searchIcons('arrow', {
  category?: string,
  limit?: number
})
```

Returns: `Promise<IconSearchResult[]>`

#### getIcon(name, options?)

Get icon SVG content with customization.

```typescript
await lucide.getIcon('arrow-right', {
  size?: number,
  color?: string,
  strokeWidth?: number,
  fill?: string,
  className?: string
})
```

Returns: `Promise<GetIconResult>`

#### getIcons(icons)

Fetch multiple icons at once.

```typescript
await lucide.getIcons([
  { name: 'home', options: { size: 24 } },
  { name: 'user', options: { color: '#000' } }
])
```

Returns: `Promise<GetIconResult[]>`

#### listIcons(options?)

List all available icons.

```typescript
await lucide.listIcons({
  category?: string
})
```

Returns: `Promise<IconMetadata[]>`

#### getCategories()

Get all icon categories.

```typescript
await lucide.getCategories()
```

Returns: `Promise<string[]>`

#### clearCache()

Clear the icon cache.

```typescript
lucide.clearCache()
```

## Icon Categories

Lucide icons are organized into categories:

### arrows

Arrow and chevron icons for navigation

- arrow-right, arrow-left, arrow-up, arrow-down
- chevron-right, chevron-left, chevron-up, chevron-down

### actions

Common action icons

- plus, minus, check, x
- trash-2, edit-2, copy, save

### interface

UI control icons

- menu, search, settings, filter
- more-horizontal, more-vertical

### files

File and folder icons

- file, folder, file-text
- download, upload

### communication

Communication icons

- mail, message-square, bell, phone

### users

User and people icons

- user, users, user-plus

### ui

Common UI element icons

- home, heart, star, eye, eye-off

### status

Status indicator icons

- check-circle, x-circle, alert-circle, info

### media

Media playback icons

- image, video, music, play, pause

### security

Security and privacy icons

- lock, unlock, key, shield

### navigation

Navigation and location icons

- external-link, link, map-pin, compass

### time

Time and calendar icons

- calendar, clock

## Search Algorithm

The search uses a scoring system:

- **100 points**: Exact name match
- **80 points**: Name starts with query
- **70 points**: Exact tag match
- **60 points**: Name contains query
- **50 points**: Display name contains query
- **40 points**: Tag contains query

Results are sorted by score descending.

```typescript
const results = await lucide.searchIcons('arrow')
// Returns icons sorted by relevance
// arrow-right: 100 (exact match for "arrow")
// arrow-left: 80 (starts with "arrow")
// ...
```

## Customization Examples

### Different Sizes

```typescript
const small = await lucide.getIcon('heart', { size: 16 })
const medium = await lucide.getIcon('heart', { size: 24 })
const large = await lucide.getIcon('heart', { size: 32 })
const huge = await lucide.getIcon('heart', { size: 64 })
```

### Colors

```typescript
// Use CSS color names
const red = await lucide.getIcon('heart', { color: 'red' })

// Use hex colors
const blue = await lucide.getIcon('star', { color: '#4299e1' })

// Use currentColor (adapts to text color)
const adaptive = await lucide.getIcon('home', { color: 'currentColor' })
```

### Stroke Width

```typescript
// Thin lines
const thin = await lucide.getIcon('circle', { strokeWidth: 1 })

// Default
const normal = await lucide.getIcon('circle', { strokeWidth: 2 })

// Bold lines
const bold = await lucide.getIcon('circle', { strokeWidth: 3 })
```

### Filled Icons

```typescript
// Outline (default)
const outline = await lucide.getIcon('heart', { fill: 'none' })

// Filled
const filled = await lucide.getIcon('heart', {
  fill: '#e53e3e',
  color: '#e53e3e'
})

// Filled with current color
const currentFilled = await lucide.getIcon('star', {
  fill: 'currentColor'
})
```

## Best Practices

1. **Use currentColor** - Makes icons inherit text color
2. **Consistent sizing** - Stick to 16, 20, 24, 32 for consistency
3. **Cache icons** - Client automatically caches, reuse instances
4. **Stroke width** - 2 is default, 1.5 for lighter, 2.5+ for emphasis
5. **Category filtering** - Use categories for large icon sets
6. **Batch loading** - Use `getIcons()` for multiple icons
7. **Search scoring** - Trust the relevance scores for best matches
8. **Data URLs** - Use for img tags and CSS backgrounds

## Examples

### Icon Button Component

```tsx
function IconButton({ icon, size = 20, onClick }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const client = new LucideClient()
    client
      .getIcon(icon, {
        size,
        strokeWidth: 2,
        className: 'icon'
      })
      .then(result => {
        setSvg(result.svg)
      })
  }, [icon, size])

  return (
    <button
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-100 transition"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
```

### Icon Grid Showcase

```tsx
function IconGrid({ category }) {
  const [icons, setIcons] = useState([])

  useEffect(() => {
    const client = new LucideClient()
    client.listIcons({ category }).then(setIcons)
  }, [category])

  return (
    <div className="grid grid-cols-8 gap-4">
      {icons.map(icon => (
        <div key={icon.name} className="flex flex-col items-center">
          <LucideIcon name={icon.name} size={32} />
          <span className="text-xs mt-2">{icon.displayName}</span>
        </div>
      ))}
    </div>
  )
}
```

### Search with Preview

```tsx
function IconSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!query) return

    const client = new LucideClient()
    client.searchIcons(query, { limit: 50 }).then(setResults)
  }, [query])

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search icons..."
        className="w-full p-2 border rounded"
      />

      <div className="mt-4 grid grid-cols-6 gap-3">
        {results.map(icon => (
          <div key={icon.name} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
            <LucideIcon name={icon.name} size={24} />
            <p className="text-xs mt-1">{icon.displayName}</p>
            <p className="text-xs text-gray-500">Score: {icon.matchScore}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Comparison with Other Libraries

### vs Heroicons

- **Lucide**: 1000+ icons, more variety
- **Heroicons**: Simpler, Tailwind-native

### vs Font Awesome

- **Lucide**: Lightweight, SVG-only, free
- **Font Awesome**: More icons, but many require Pro

### vs Feather Icons

- **Lucide**: Fork of Feather with more icons and active maintenance
- **Feather**: Original, smaller set

## Resources

- [Lucide Official Site](https://lucide.dev/)
- [Lucide GitHub](https://github.com/lucide-icons/lucide)
- [Icon Search Tool](https://lucide.dev/icons/)
- [Feather Icons](https://feathericons.com/) (original inspiration)

## License

MIT
