# Sketch Integration

Complete Sketch integration for parsing .sketch files and extracting design data.

## Features

- ✅ **File Parsing** - Parse .sketch files (ZIP archives)
- ✅ **Design Tokens** - Extract colors, typography, spacing, shadows
- ✅ **Artboards** - Access all artboards and layers
- ✅ **Styles** - Get text styles and layer styles
- ✅ **Asset Export** - Export artboards as images (requires Sketch CLI)
- ✅ **CSS/JSON Export** - Export tokens as CSS variables or JSON

---

## Setup

### 1. Install Dependencies

```bash
npm install jszip
```

### 2. Install Sketch CLI (Optional, for exports)

```bash
# macOS only
brew install sketch
```

Or download from: [Sketch CLI](https://www.sketch.com/docs/cli/)

---

## Usage

### Parse Sketch File

```typescript
import { SketchClient } from './client'

const client = new SketchClient()

// Parse entire file
const document = await client.parseFile('./design.sketch')

console.log('Version:', document.meta.version)
console.log('Pages:', document.pages.length)
console.log('Colors:', document.colors.length)
console.log('Text Styles:', document.textStyles.length)
```

### Extract Design Tokens

```typescript
const tokens = await client.extractDesignTokens('./design.sketch')

console.log('Colors:', tokens.colors)
// [
//   {
//     name: 'Primary Blue',
//     value: '#0066cc',
//     rgba: { r: 0, g: 0.4, b: 0.8, a: 1 }
//   }
// ]

console.log('Typography:', tokens.typography)
// [
//   {
//     name: 'Heading Large',
//     fontFamily: 'SF Pro Display',
//     fontSize: 48,
//     fontWeight: 700
//   }
// ]

console.log('Spacing:', tokens.spacing)
// [
//   { name: 'spacing-8', value: 8 },
//   { name: 'spacing-16', value: 16 }
// ]

console.log('Shadows:', tokens.shadows)
// [
//   {
//     name: 'Card Shadow',
//     offsetX: 0,
//     offsetY: 4,
//     blur: 12,
//     spread: 0,
//     color: '#00000026'
//   }
// ]
```

### Export as CSS Variables

```typescript
const css = await client.exportTokensAsCSS('./design.sketch')

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
  --font-heading-large-family: SF Pro Display;
  --font-heading-large-size: 48px;
  --font-heading-large-weight: 700;

  /* Spacing */
  --space-8: 8px;
  --space-16: 16px;
  --space-24: 24px;

  /* Shadows */
  --shadow-card: 0px 4px 12px 0px #00000026;
}
```

### Export as JSON

```typescript
const json = await client.exportTokensAsJSON('./design.sketch')

await fs.writeFile('tokens.json', json)
```

---

## Artboards

### Get All Artboards

```typescript
const artboards = await client.getArtboards('./design.sketch')

for (const artboard of artboards) {
  console.log(`${artboard.name}:`)
  console.log(`  Size: ${artboard.frame.width}x${artboard.frame.height}`)
  console.log(`  Layers: ${artboard.layers.length}`)
}
```

### Get Specific Artboard

```typescript
const artboard = await client.getArtboard('./design.sketch', 'Homepage')

if (artboard) {
  console.log('Found artboard:', artboard.name)
  console.log(
    'Layers:',
    artboard.layers.map(l => l.name)
  )
}
```

### Export Artboards as Images

```typescript
// Requires Sketch CLI
const exports = await client.exportArtboards('./design.sketch', ['Homepage', 'About', 'Contact'], {
  format: 'png',
  scale: 2, // 2x resolution
  outputDir: './exports'
})

console.log('Exported:', exports)
// ['./exports/Homepage.png', './exports/About.png', './exports/Contact.png']
```

---

## Layers

### Access Layer Hierarchy

```typescript
const document = await client.parseFile('./design.sketch')

function printLayers(layers: any[], indent = 0) {
  for (const layer of layers) {
    console.log('  '.repeat(indent) + `${layer.name} (${layer.type})`)
    if (layer.layers) {
      printLayers(layer.layers, indent + 1)
    }
  }
}

for (const page of document.pages) {
  console.log(`Page: ${page.name}`)
  for (const artboard of page.artboards) {
    console.log(`  Artboard: ${artboard.name}`)
    printLayers(artboard.layers, 2)
  }
}
```

---

## Styles

### Get Text Styles

```typescript
const document = await client.parseFile('./design.sketch')

for (const textStyle of document.textStyles) {
  console.log(`${textStyle.name}:`)
  console.log(`  Font: ${textStyle.fontFamily} ${textStyle.fontWeight}`)
  console.log(`  Size: ${textStyle.fontSize}px`)
}
```

### Get Layer Styles

```typescript
for (const layerStyle of document.layerStyles) {
  console.log(`${layerStyle.name}:`)

  if (layerStyle.style?.fills) {
    console.log('  Fills:', layerStyle.style.fills.length)
  }

  if (layerStyle.style?.borders) {
    console.log('  Borders:', layerStyle.style.borders.length)
  }

  if (layerStyle.style?.shadows) {
    console.log('  Shadows:', layerStyle.style.shadows.length)
  }
}
```

---

## Common Patterns

### Sync Design Tokens

```typescript
// Automatically sync tokens from Sketch to your project
async function syncDesignTokens(sketchFile: string) {
  const client = new SketchClient()

  // Export as CSS
  const css = await client.exportTokensAsCSS(sketchFile)
  await fs.writeFile('src/styles/design-tokens.css', css)

  // Export as JSON
  const json = await client.exportTokensAsJSON(sketchFile)
  await fs.writeFile('src/styles/design-tokens.json', json)

  console.log('Design tokens synced!')
}

await syncDesignTokens('./design.sketch')
```

### Export All Artboards

```typescript
async function exportAllArtboards(sketchFile: string) {
  const client = new SketchClient()
  const artboards = await client.getArtboards(sketchFile)

  const artboardNames = artboards.map(a => a.name)

  await client.exportArtboards(sketchFile, artboardNames, {
    format: 'png',
    scale: 2,
    outputDir: './exports'
  })

  console.log(`Exported ${artboards.length} artboards`)
}
```

### Generate Color Palette

```typescript
async function generateColorPalette(sketchFile: string) {
  const client = new SketchClient()
  const tokens = await client.extractDesignTokens(sketchFile)

  console.log('# Color Palette\n')

  for (const color of tokens.colors) {
    console.log(`## ${color.name}`)
    console.log(`- Hex: ${color.value}`)
    console.log(
      `- RGB: rgb(${Math.round(color.rgba.r * 255)}, ${Math.round(color.rgba.g * 255)}, ${Math.round(color.rgba.b * 255)})`
    )
    console.log()
  }
}
```

---

## Sketch File Format

Sketch files (.sketch) are ZIP archives containing:

```
design.sketch/
├── document.json       # Document structure
├── meta.json          # Metadata
├── user.json          # User settings
└── pages/
    ├── page-1.json    # Page 1 data
    └── page-2.json    # Page 2 data
```

### Manual Parsing

```typescript
import JSZip from 'jszip'
import fs from 'fs'

const zip = await JSZip.loadAsync(fs.readFileSync('./design.sketch'))

// List all files
for (const filename of Object.keys(zip.files)) {
  console.log(filename)
}

// Read document
const documentJson = await zip.file('document.json')?.async('text')
const document = JSON.parse(documentJson!)

console.log('Document:', document)
```

---

## Limitations

### 1. Export Requires Sketch CLI

Image export requires the Sketch CLI (`sketchtool`):

- Only available on macOS
- Requires Sketch app to be installed
- Alternative: Parse file and render programmatically

### 2. Complex Styles

Some advanced Sketch features may not be fully supported:

- Gradients
- Pattern fills
- Complex blend modes
- Advanced effects

### 3. Plugins

Sketch plugins are not accessible through this client.

---

## Troubleshooting

### "Invalid Sketch file"

Ensure the file is a valid .sketch file (not .sketch.zip or other format).

### "JSZip is required"

Install jszip:

```bash
npm install jszip
```

### "sketchtool: command not found"

Export features require Sketch CLI. Install from [Sketch CLI](https://www.sketch.com/docs/cli/).

### Missing Colors/Styles

Colors and styles must be saved to the document. Ensure they're in:

- Document Colors (not layer colors)
- Text Styles (not inline styles)
- Layer Styles

---

## Comparison with Figma

| Feature       | Sketch       | Figma          |
| ------------- | ------------ | -------------- |
| File Access   | Local files  | API (cloud)    |
| Export        | Requires CLI | API endpoint   |
| Real-time     | No           | Yes (webhooks) |
| Collaboration | Limited      | Built-in       |
| Platform      | macOS only   | Cross-platform |

---

## Migration to Figma

```typescript
// Convert Sketch tokens to Figma format
async function convertToFigmaFormat(sketchFile: string) {
  const client = new SketchClient()
  const tokens = await client.extractDesignTokens(sketchFile)

  const figmaTokens = {
    colors: tokens.colors.map(c => ({
      name: c.name,
      color: {
        r: c.rgba.r,
        g: c.rgba.g,
        b: c.rgba.b,
        a: c.rgba.a
      }
    })),
    typography: tokens.typography.map(t => ({
      name: t.name,
      fontName: { family: t.fontFamily, style: 'Regular' },
      fontSize: t.fontSize,
      fontWeight: t.fontWeight
    }))
  }

  return figmaTokens
}
```

---

## Resources

- [Sketch File Format](https://developer.sketch.com/file-format/)
- [Sketch CLI](https://www.sketch.com/docs/cli/)
- [Sketch API](https://developer.sketch.com/api/)
- [JSZip Documentation](https://stuk.github.io/jszip/)

---

**Parse and extract from Sketch files with ease** ✨
