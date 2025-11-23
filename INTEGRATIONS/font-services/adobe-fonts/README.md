# Adobe Fonts Integration

TypeScript client for Adobe Fonts (formerly Typekit) - premium font service with 20000+ font families included with Creative Cloud.

## Features

- 20000+ premium font families
- Search and filter fonts
- Generate embed codes
- Kit management
- CSS and JavaScript embed options
- TypeScript support

## Installation

```bash
cp client.ts your-project/lib/adobe-fonts.ts
```

## Usage

### Basic Setup

```typescript
import { AdobeFontsClient } from './lib/adobe-fonts'

// Create client
const fonts = new AdobeFontsClient({
  apiKey: process.env.ADOBE_FONTS_API_KEY
})

// Search fonts
const results = await fonts.searchFonts('futura')

// Get embed code
const embed = fonts.getEmbedCode('your-kit-id')
```

### Search Fonts

```typescript
// Simple search
const futura = await fonts.searchFonts('futura')

// Search with filters
const serif = await fonts.searchFonts('garamond', {
  classification: 'serif',
  limit: 20
})

// List all fonts
const all = await fonts.listFonts({ classification: 'sans-serif' })
```

### Generate Embed Codes

```typescript
// CSS link tag
const linkTag = fonts.getEmbedCode('abc123')
// <link rel="stylesheet" href="https://use.typekit.net/abc123.css">

// CSS @import
const cssImport = fonts.getCssImport('abc123')
// @import url("https://use.typekit.net/abc123.css");

// JavaScript embed (advanced loading)
const jsEmbed = fonts.getJsEmbedCode('abc123')
```

### Get Font Family

```typescript
const font = await fonts.getFontFamily('proxima-nova')

console.log(font.displayName) // "Proxima Nova"
console.log(font.foundry) // "Mark Simonson"
console.log(font.variations) // Array of weights and styles
```

## API Reference

### AdobeFontsClient

#### searchFonts(query, options?)

```typescript
await fonts.searchFonts('futura', {
  classification?: 'serif' | 'sans-serif' | 'slab-serif' | 'script' | 'monospace' | etc,
  foundry?: string,
  limit?: number
})
```

#### getFontFamily(idOrSlug)

Get font family by ID or slug.

#### listFonts(options?)

List all available fonts.

#### getEmbedCode(kitId)

Generate CSS link tag.

#### getJsEmbedCode(kitId)

Generate JavaScript embed code.

#### getCssImport(kitId)

Generate @import statement.

## Popular Adobe Fonts

### Sans-Serif

- Proxima Nova - Modern geometric-humanist hybrid
- Futura PT - Classic geometric sans
- Myriad Pro - Adobe's brand font
- Source Sans Pro - Adobe's first open source font

### Serif

- Adobe Garamond - Classic old-style serif
- Minion Pro - Elegant book typeface
- Adobe Caslon Pro - Transitional serif

### Display

- Trajan Pro - Classical inscriptional capitals
- Bodoni - High contrast modern serif

## Using Adobe Fonts

### 1. Create a Kit

1. Sign in to [Adobe Fonts](https://fonts.adobe.com/)
2. Browse and select fonts
3. Add to a new or existing kit
4. Add your website domains
5. Copy the kit ID

### 2. Embed in Your Site

```html
<!-- Add to <head> -->
<link rel="stylesheet" href="https://use.typekit.net/abc123.css" />
```

### 3. Use in CSS

```css
body {
  font-family: 'proxima-nova', sans-serif;
}

h1 {
  font-family: 'futura-pt', sans-serif;
  font-weight: 700;
}
```

## Best Practices

1. **Create kits by project** - Organize fonts per website
2. **Limit fonts per kit** - Only include fonts you use
3. **Add all domains** - Include dev, staging, and production
4. **Use CSS embed** - Faster than JavaScript
5. **Specify weights** - Only load weights you need
6. **Creative Cloud required** - Needs active subscription

## Resources

- [Adobe Fonts](https://fonts.adobe.com/)
- [Typekit Documentation](https://helpx.adobe.com/fonts/using/use-fonts-web.html)
- [Creative Cloud](https://www.adobe.com/creativecloud.html)

## License

Requires Adobe Creative Cloud subscription
