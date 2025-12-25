# Font Awesome Integration

TypeScript client for Font Awesome - the web's most popular icon toolkit with 2000+ free icons and 16000+ pro icons.

## Features

- 2000+ free icons, 16000+ pro icons (with license)
- Multiple styles: solid, regular, light, duotone, brands
- Category and tag-based search with scoring
- SVG and CSS class generation
- Customizable size and color
- Automatic caching
- Zero runtime dependencies
- Full TypeScript support

## Installation

```bash
# Just copy the client.ts file to your project
cp client.ts your-project/lib/font-awesome.ts
```

## Usage

### Basic Setup

```typescript
import { FontAwesomeClient } from './lib/font-awesome'

// Create client (free tier)
const fa = new FontAwesomeClient()

// Or with pro tier
const faPro = new FontAwesomeClient({ tier: 'pro' })

// Search for icons
const results = await fa.searchIcons('arrow')

// Get specific icon
const icon = await fa.getIcon('arrow-right', 'solid')
console.log(icon.svg) // SVG content
console.log(icon.cssClass) // "fas fa-arrow-right"
```

### Search Icons

```typescript
// Simple search
const arrows = await fa.searchIcons('arrow')

// Search with filters
const solidIcons = await fa.searchIcons('heart', {
  style: 'solid',
  category: 'ui',
  limit: 20
})

for (const icon of solidIcons) {
  console.log(`${icon.displayName} - Score: ${icon.matchScore}`)
  console.log(`  Styles: ${icon.styles.join(', ')}`)
}
```

### Get Icon SVG

```typescript
// Get solid icon (default)
const solidIcon = await fa.getIcon('heart', 'solid')

// Get regular (outline) icon
const regularIcon = await fa.getIcon('heart', 'regular')

// Customize icon
const customIcon = await fa.getIcon('star', 'solid', {
  size: 32,
  color: '#fbbf24',
  className: 'icon-star'
})
```

### Icon Styles

```typescript
// solid - filled icons (default)
await fa.getIcon('heart', 'solid')

// regular - outline icons
await fa.getIcon('heart', 'regular')

// light - lighter weight (Pro only)
await fa.getIcon('heart', 'light')

// duotone - two-tone icons (Pro only)
await fa.getIcon('heart', 'duotone')

// brands - brand logos
await fa.getIcon('github', 'brands')
```

### Batch Fetch Icons

```typescript
const icons = await fa.getIcons([
  { name: 'home', style: 'solid' },
  { name: 'user', style: 'regular', options: { size: 24 } },
  { name: 'github', style: 'brands' }
])
```

### List Icons

```typescript
// Get all categories
const categories = await fa.getCategories()

// List all icons
const allIcons = await fa.listIcons()

// List by category
const arrowIcons = await fa.listIcons({ category: 'arrows' })

// List by style
const brandIcons = await fa.listIcons({ style: 'brands' })
```

### CSS Classes

```typescript
// Get CSS class for icon
const cssClass = fa.getCssClass('arrow-right', 'solid')
console.log(cssClass) // "fas fa-arrow-right"

// Use in HTML
<i className={cssClass}></i>
```

## API Reference

### FontAwesomeClient

#### constructor(options?)

```typescript
new FontAwesomeClient({
  tier?: 'free' | 'pro',     // Default: 'free'
  version?: string           // Default: '6.5.1'
})
```

#### searchIcons(query, options?)

```typescript
await fa.searchIcons('arrow', {
  category?: string,
  style?: 'solid' | 'regular' | 'light' | 'duotone' | 'brands',
  limit?: number
})
```

#### getIcon(name, style?, options?)

```typescript
await fa.getIcon('arrow-right', 'solid', {
  size?: number,
  color?: string,
  className?: string
})
```

#### getIcons(icons)

```typescript
await fa.getIcons([{ name: 'home', style: 'solid', options: { size: 24 } }])
```

#### listIcons(options?)

```typescript
await fa.listIcons({
  category?: string,
  style?: 'solid' | 'regular' | 'light' | 'duotone' | 'brands'
})
```

#### getCssClass(name, style)

```typescript
fa.getCssClass('arrow-right', 'solid')
// Returns: "fas fa-arrow-right"
```

## Categories

- **arrows** - Arrow and chevron icons
- **actions** - Common action icons (plus, minus, check, x)
- **interface** - UI control icons (menu, search, settings)
- **files** - File and folder icons
- **communication** - Email, chat, phone icons
- **users** - User and people icons
- **ui** - Common UI elements (home, heart, star)
- **status** - Status indicators (check, warning, info)
- **brands** - Brand logos (GitHub, Twitter, etc.)

## Icon Styles

### Solid (fas)

Default filled style, available in free tier.

### Regular (far)

Outline style, available in free tier for some icons.

### Light (fal)

Lighter weight outline, Pro only.

### Duotone (fad)

Two-tone icons with primary and secondary colors, Pro only.

### Brands (fab)

Brand logos, available in free tier.

## React Integration

```tsx
import { FontAwesomeClient } from './lib/font-awesome'
import { useEffect, useState } from 'react'

function FAIcon({ name, style = 'solid', size = 24 }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const client = new FontAwesomeClient()
    client.getIcon(name, style, { size }).then(icon => {
      setSvg(icon.svg)
    })
  }, [name, style, size])

  return <span dangerouslySetInnerHTML={{ __html: svg }} />
}

// Usage
;<FAIcon name="heart" style="solid" size={24} />
```

## Best Practices

1. **Use solid by default** - Most versatile, available in free tier
2. **Regular for variety** - Outline versions for lighter feel
3. **Brands for logos** - Always use 'brands' style
4. **Consistent sizing** - Stick to 16, 20, 24, 32 for consistency
5. **Cache instances** - Client automatically caches fetched icons
6. **Pro tier** - Requires Font Awesome Pro license
7. **CSS classes** - Use for web fonts, SVG for more control

## Resources

- [Font Awesome](https://fontawesome.com/)
- [Icon Search](https://fontawesome.com/icons)
- [Font Awesome Pro](https://fontawesome.com/plans)
- [CDN](https://www.jsdelivr.com/package/npm/@fortawesome/fontawesome-free)

## License

Font Awesome Free is free, Font Awesome Pro requires a license.
