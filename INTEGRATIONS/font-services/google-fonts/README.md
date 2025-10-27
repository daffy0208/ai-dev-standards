# Google Fonts Integration

TypeScript client for Google Fonts - the world's largest free font library with 1400+ font families.

## Features

- 1400+ font families
- Search and filter fonts
- Generate font URLs and CSS imports
- Font pairing suggestions
- Subset and display options
- Popularity rankings
- TypeScript support

## Installation

```bash
cp client.ts your-project/lib/google-fonts.ts
```

## Usage

### Basic Setup

```typescript
import { GoogleFontsClient } from './lib/google-fonts'

// Create client (works without API key for popular fonts)
const fonts = new GoogleFontsClient()

// Or with API key for full access
const fonts = new GoogleFontsClient({
  apiKey: process.env.GOOGLE_FONTS_API_KEY
})

// Search fonts
const results = await fonts.searchFonts('roboto')

// Get font URL
const url = fonts.getFontUrl('Roboto', {
  weights: [400, 700],
  styles: ['normal', 'italic']
})
```

### Search Fonts

```typescript
// Simple search
const roboto = await fonts.searchFonts('roboto')

// Search with filters
const serif = await fonts.searchFonts('', {
  category: 'serif',
  limit: 20
})

// Get popular fonts
const popular = await fonts.getPopularFonts('sans-serif', 10)
```

### Generate Font URLs

```typescript
// Basic URL
const url = fonts.getFontUrl('Roboto')
// https://fonts.googleapis.com/css2?family=Roboto

// With weights and styles
const url = fonts.getFontUrl('Open Sans', {
  weights: [300, 400, 600, 700],
  styles: ['normal', 'italic'],
  display: 'swap',
  subset: 'latin'
})

// CSS import
const css = fonts.getCssImport('Roboto', { weights: [400, 700] })
// @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700');

// HTML link tag
const html = fonts.getLinkTag('Roboto', { weights: [400, 700] })
```

### Font Pairings

```typescript
// Get pairing suggestions
const pairings = await fonts.getFontPairings('Montserrat')

for (const pairing of pairings) {
  console.log(`${pairing.heading} + ${pairing.body}`)
  console.log(`Reason: ${pairing.reason}`)
  console.log(`Contrast: ${pairing.contrast}`)
}
```

## API Reference

### GoogleFontsClient

#### searchFonts(query, options?)

```typescript
await fonts.searchFonts('roboto', {
  category?: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace',
  limit?: number
})
```

#### getFontUrl(family, options?)

```typescript
fonts.getFontUrl('Roboto', {
  weights?: number[],
  styles?: ('normal' | 'italic')[],
  subset?: 'latin' | 'latin-ext' | 'cyrillic' | etc,
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
})
```

#### getCssImport(family, options?)

Generate @import statement.

#### getLinkTag(family, options?)

Generate HTML link tags with preconnect.

#### getFontPairings(family)

Get font pairing suggestions.

#### getPopularFonts(category?, limit?)

Get popular fonts by category.

## Popular Fonts

### Sans-Serif
- Roboto
- Open Sans
- Montserrat
- Lato
- Inter
- Poppins

### Serif
- Merriweather
- Playfair Display
- Lora
- Crimson Text

### Monospace
- Source Code Pro
- Roboto Mono
- JetBrains Mono

### Display
- Bebas Neue
- Pacifico

### Handwriting
- Dancing Script
- Shadows Into Light

## Best Practices

1. **Use font-display: swap** - Prevents invisible text during load
2. **Limit weights** - Only load weights you use
3. **Subset optimization** - Use specific subsets (e.g., latin)
4. **Preconnect** - Use link tags with preconnect
5. **Popular fonts** - Better caching, faster loads
6. **Font pairings** - Combine different categories for contrast

## Resources

- [Google Fonts](https://fonts.google.com/)
- [API Documentation](https://developers.google.com/fonts/docs/developer_api)
- [Font Pairing Guide](https://fonts.google.com/knowledge)

## License

MIT
