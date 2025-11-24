# SVG Generator MCP Server

Generate, optimize, and manage SVG graphics for icons, illustrations, and patterns.

## Features

### Tools

#### `generateSvgIcon`

Generate SVG icons from text descriptions with customizable styles.

**Parameters:**

- `description` (string, required): Icon description
- `style` (string): Icon style - line, solid, duotone, outline
- `size` (number): Icon size in pixels (default: 24)
- `color` (string): Icon color (hex, rgb, or currentColor)
- `strokeWidth` (number): Stroke width for outline styles (default: 2)

**Example:**

```typescript
{
  description: "shopping cart",
  style: "line",
  size: 24,
  color: "currentColor",
  strokeWidth: 2
}
```

#### `generateSvgIllustration`

Generate SVG illustrations from text prompts with various styles.

**Parameters:**

- `prompt` (string, required): Illustration description
- `style` (string): Style - flat, minimalist, geometric, isometric, abstract
- `colorScheme` (array): Array of colors to use
- `complexity` (string): Complexity level - simple, medium, detailed

**Example:**

```typescript
{
  prompt: "A person working on a laptop",
  style: "flat",
  colorScheme: ["#4F46E5", "#EC4899", "#10B981"],
  complexity: "medium"
}
```

#### `generateSvgPattern`

Generate SVG patterns for backgrounds and fills.

**Parameters:**

- `type` (string, required): Pattern type - dots, lines, grid, waves, hexagons, triangles
- `colors` (array): Pattern colors
- `density` (string): Pattern density - low, medium, high
- `size` (number): Pattern tile size in pixels

**Example:**

```typescript
{
  type: "dots",
  colors: ["#4F46E5"],
  density: "medium",
  size: 20
}
```

#### `optimizeSvg`

Optimize SVG code by removing unnecessary elements and reducing file size.

**Parameters:**

- `svgContent` (string, required): SVG code to optimize
- `options` (object): Optimization options
  - `removeComments` (boolean): Remove XML comments
  - `removeMetadata` (boolean): Remove metadata
  - `removeHiddenElements` (boolean): Remove hidden elements
  - `convertToPathData` (boolean): Convert shapes to paths
  - `precision` (number): Decimal precision

**Example:**

```typescript
{
  svgContent: "<svg>...</svg>",
  options: {
    removeComments: true,
    removeMetadata: true,
    precision: 2
  }
}
```

### Resources

#### `svg-generator://templates`

JSON collection of common SVG shapes, icons, and patterns.

#### `svg-generator://guide`

Best practices guide for SVG generation and optimization.

## Setup

### Installation

```bash
cd MCP-SERVERS/svg-generator-mcp
npm install
npm run build
```

### Configuration

Add to your MCP settings:

```json
{
  "mcpServers": {
    "svg-generator": {
      "command": "node",
      "args": ["path/to/svg-generator-mcp/dist/index.js"]
    }
  }
}
```

## Supported Skills

- **visual-designer**: Generate icons, illustrations, and design elements
- **brand-designer**: Create brand graphics and visual identity
- **frontend-builder**: Generate UI components and interface elements

## Use Cases

1. **Icon Libraries**: Generate consistent icon sets
2. **Background Patterns**: Create repeating patterns for backgrounds
3. **Illustrations**: Generate simple to complex illustrations
4. **Data Visualizations**: Create custom chart elements
5. **UI Components**: Generate decorative SVG elements
6. **Logo Concepts**: Quick logo and symbol generation

## SVG Styles

### Icon Styles

**Line Icons**

- Simple outlines
- 2px stroke width
- Best for: UI navigation, actions

**Solid Icons**

- Filled shapes
- No stroke
- Best for: Emphasis, primary actions

**Duotone Icons**

- Two-color combinations
- Depth and hierarchy
- Best for: Feature illustrations

**Outline Icons**

- Detailed strokes
- Varying widths
- Best for: Complex representations

### Illustration Styles

**Flat**

- Simple shapes, solid colors
- No gradients or shadows
- Best for: Modern, clean designs

**Minimalist**

- Essential elements only
- Limited color palette
- Best for: Elegant, focused designs

**Geometric**

- Shapes and angles
- Mathematical precision
- Best for: Technical, abstract concepts

**Isometric**

- 3D perspective
- Consistent angles
- Best for: Architecture, diagrams

**Abstract**

- Non-representational
- Creative freedom
- Best for: Backgrounds, decorative

## Pattern Types

### Dots

- Repeating circles
- Adjustable spacing
- Use for: Subtle backgrounds

### Lines

- Parallel or diagonal lines
- Various angles
- Use for: Texture, depth

### Grid

- Intersecting lines
- Graph paper effect
- Use for: Technical backgrounds

### Waves

- Sinusoidal curves
- Flowing motion
- Use for: Dynamic backgrounds

### Geometric

- Triangles, hexagons
- Tessellation
- Use for: Modern patterns

## Optimization

### File Size Reduction

The `optimizeSvg` tool can reduce SVG file sizes by:

- Removing comments and metadata (5-10%)
- Simplifying paths (10-30%)
- Reducing precision (5-15%)
- Removing hidden elements (varies)
- Converting shapes to paths (5-10%)

**Typical savings: 30-50%**

### Best Practices

1. **ViewBox Usage**

   ```svg
   <svg viewBox="0 0 24 24" width="24" height="24">
   ```

2. **Color Management**

   ```svg
   <path stroke="currentColor" />
   ```

3. **Path Optimization**
   - Use relative commands (l, m, c)
   - Round to 2 decimal places
   - Combine consecutive commands

4. **Grouping**
   - Group related elements
   - Apply transforms to groups
   - Minimize nesting depth

## Accessibility

### Required Attributes

```svg
<svg role="img" aria-labelledby="title">
  <title id="title">Icon description</title>
  <desc>Detailed description if needed</desc>
  <!-- icon content -->
</svg>
```

### Color Contrast

- Ensure 4.5:1 contrast ratio for text
- 3:1 for graphical objects
- Test with accessibility tools

## Integration Examples

### React Component

```tsx
import { generateSvgIcon } from '@/lib/svg-generator'

function Icon({ name }: { name: string }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    generateSvgIcon({
      description: name,
      style: 'line',
      size: 24
    }).then(result => setSvg(result.data.svg))
  }, [name])

  return <div dangerouslySetInnerHTML={{ __html: svg }} />
}
```

### CSS Background Pattern

```css
.pattern-background {
  background-image: url('data:image/svg+xml,...');
  background-repeat: repeat;
}
```

### Inline SVG

```html
<!-- Direct inline for best performance -->
<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M..." stroke="currentColor" />
</svg>
```

## Performance Tips

1. **Keep file sizes small** (< 10KB)
2. **Minimize DOM nodes** (< 100 elements)
3. **Use CSS for styling** (not inline attributes)
4. **Consider sprite sheets** (for multiple icons)
5. **Lazy load** large illustrations
6. **Cache generated SVGs**

## Limitations

- AI generation requires additional services
- Complex illustrations may need manual refinement
- Pattern complexity affects performance
- Browser support varies for advanced features

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

## Advanced Usage

### Custom Templates

Add custom SVG templates to the templates array in index.ts:

```typescript
{
  name: 'My Custom Icon',
  category: 'custom',
  svg: '<svg>...</svg>',
  tags: ['custom', 'icon']
}
```

### SVGO Integration

For production-grade optimization, integrate SVGO:

```typescript
import { optimize } from 'svgo'

const result = optimize(svgString, {
  plugins: ['preset-default']
})
```

## License

MIT
