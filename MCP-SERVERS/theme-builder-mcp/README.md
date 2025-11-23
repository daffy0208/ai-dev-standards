# Theme Builder MCP Server

Generate complete design system themes with automatic color scales, dark mode, accessibility validation, and multi-format export.

## Features

### Tools

#### `generateTheme`

Generate complete theme from base brand colors.

**Parameters:**

- `baseColors` (object, required):
  - `primary` (string): Primary brand color
  - `secondary` (string): Secondary brand color
  - `neutral` (string): Neutral/gray color
- `preferences` (object):
  - `style` (string): modern, classic, playful, minimal, bold
  - `colorScale` (number): Number of shades (5-11)
  - `includeSemanticColors` (boolean): Add success/warning/error
  - `roundness` (string): sharp, slightly-rounded, rounded, very-rounded
  - `density` (string): compact, comfortable, spacious

**Example:**

```typescript
{
  baseColors: {
    primary: "#4F46E5",
    secondary: "#EC4899",
    neutral: "#6B7280"
  },
  preferences: {
    style: "modern",
    colorScale: 9,
    includeSemanticColors: true,
    roundness: "rounded",
    density: "comfortable"
  }
}
```

#### `createDarkMode`

Generate dark mode variant from light theme.

**Parameters:**

- `lightTheme` (object, required): Light theme to convert
- `strategy` (string): invert, shift, custom
- `preserveColors` (array): Colors to keep unchanged

**Example:**

```typescript
{
  lightTheme: { /* theme object */ },
  strategy: "shift",
  preserveColors: ["#4F46E5"]
}
```

#### `validateThemeAccessibility`

Validate theme for WCAG compliance.

**Parameters:**

- `theme` (object, required): Theme to validate
- `level` (string): AA or AAA
- `checkAspects` (array): contrast, color-blindness, touch-targets, focus-indicators

**Example:**

```typescript
{
  theme: { /* theme object */ },
  level: "AA",
  checkAspects: ["contrast", "color-blindness", "touch-targets"]
}
```

#### `exportThemeTokens`

Export theme as design tokens.

**Parameters:**

- `theme` (object, required): Theme to export
- `format` (string, required): css, scss, js, json, tailwind, style-dictionary, figma-tokens
- `includeComments` (boolean): Include usage comments

**Example:**

```typescript
{
  theme: { /* theme object */ },
  format: "tailwind",
  includeComments: true
}
```

### Resources

#### `theme-builder://presets`

Curated theme presets for quick start.

#### `theme-builder://guide`

Comprehensive theme design best practices guide.

## Setup

```bash
cd MCP-SERVERS/theme-builder-mcp
npm install
npm run build
```

### Configuration

```json
{
  "mcpServers": {
    "theme-builder": {
      "command": "node",
      "args": ["path/to/theme-builder-mcp/dist/index.js"]
    }
  }
}
```

## Supported Skills

- **visual-designer**: Color theory and theme design
- **design-system-architect**: Systematic design token management

## Complete Theme Generation Workflow

### 1. Define Base Colors

```typescript
const baseColors = {
  primary: '#4F46E5', // Indigo - trust, professionalism
  secondary: '#EC4899', // Pink - creativity, energy
  neutral: '#6B7280' // Gray - balance, sophistication
}
```

### 2. Generate Complete Theme

```typescript
const theme = await generateTheme({
  baseColors,
  preferences: {
    style: 'modern',
    colorScale: 9, // 50, 100, 200, ... 900
    includeSemanticColors: true,
    roundness: 'rounded',
    density: 'comfortable'
  }
})

// Result: Complete theme with:
// - 9 shades per color
// - Typography scale
// - Spacing system
// - Border radius
// - Shadows and effects
// - Accessibility settings
```

### 3. Create Dark Mode

```typescript
const darkTheme = await createDarkMode({
  lightTheme: theme,
  strategy: 'shift',
  preserveColors: [baseColors.primary] // Keep brand color
})

// Result: Accessible dark mode variant
```

### 4. Validate Accessibility

```typescript
const validation = await validateThemeAccessibility({
  theme: darkTheme,
  level: 'AA',
  checkAspects: ['contrast', 'color-blindness', 'touch-targets']
})

// Result: Issues and score
// - Contrast ratios
// - Color blindness simulation
// - Touch target sizes
// - Focus indicators
```

### 5. Export Tokens

```typescript
const tokens = await exportThemeTokens({
  theme: darkTheme,
  format: 'tailwind',
  includeComments: true
})

// Result: Ready-to-use design tokens
```

## Color Scale Generation

### How It Works

From a single base color, generates 9 shades:

**Lightness Progression:**

- 50: 95% - Lightest backgrounds
- 100: 90% - Subtle backgrounds
- 200: 80% - Hover states
- 300: 70% - Borders
- 400: 60% - Disabled states
- 500: 50% - **Base color** (your input)
- 600: 40% - Hover states
- 700: 30% - Active states
- 800: 20% - Text on light
- 900: 10% - Darkest text

### Usage Guidelines

```css
/* Backgrounds */
background: colors.primary.50; /* Subtle highlight */
background: colors.primary.100; /* Card background */

/* Borders */
border-color: colors.primary.300;

/* Interactive */
color: colors.primary.600; /* Default */
color: colors.primary.700; /* Hover */
color: colors.primary.800; /* Active */

/* Text */
color: colors.primary.900; /* High emphasis */
```

## Dark Mode Strategies

### Shift Strategy (Recommended)

Reduces lightness by shifting on HSL scale:

- Light backgrounds (50-200) → Dark backgrounds (800-900)
- Dark text (800-900) → Light text (50-200)
- Middle shades swap positions

**Best for:** Maintaining brand recognition

### Invert Strategy

Flips lightness values completely:

- 50 ↔ 950
- 100 ↔ 900
- etc.

**Best for:** Maximum contrast

### Custom Strategy

Hand-pick specific colors for dark mode.

**Best for:** Fine-tuned control, brand-specific dark modes

## Accessibility Validation

### WCAG Contrast Requirements

**Level AA (Minimum):**

- Normal text (< 18px): 4.5:1
- Large text (≥ 18px): 3:1
- UI components: 3:1

**Level AAA (Enhanced):**

- Normal text: 7:1
- Large text: 4.5:1
- UI components: 4.5:1

### What Gets Checked

1. **Contrast Ratios**
   - Text on backgrounds
   - Interactive elements
   - Focus indicators

2. **Color Blindness**
   - Protanopia (red-blind)
   - Deuteranopia (green-blind)
   - Tritanopia (blue-blind)
   - Ensure information not color-only

3. **Touch Targets**
   - Minimum 44x44px (iOS)
   - Minimum 48x48dp (Android)
   - Adequate spacing

4. **Focus Indicators**
   - Visible focus ring
   - 2px minimum width
   - High contrast color

## Export Formats

### CSS Custom Properties

```css
:root {
  --color-primary-50: #eef2ff;
  --color-primary-500: #4f46e5;
  --color-primary-900: #312e81;

  --font-sans: 'Inter', sans-serif;
  --spacing-md: 1rem;
  --radius-md: 0.5rem;
}
```

### Tailwind Config

```javascript
module.exports = {
  theme: {
    colors: {
      primary: {
        50: '#EEF2FF',
        500: '#4F46E5',
        900: '#312E81'
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif']
    },
    spacing: {
      md: '1rem'
    }
  }
}
```

### Style Dictionary

```json
{
  "color": {
    "primary": {
      "50": { "value": "#EEF2FF" },
      "500": { "value": "#4F46E5" },
      "900": { "value": "#312E81" }
    }
  }
}
```

### Figma Tokens

```json
{
  "colors": {
    "primary": {
      "50": { "value": "#EEF2FF", "type": "color" },
      "500": { "value": "#4F46E5", "type": "color" }
    }
  }
}
```

## Theme Presets

### Modern Tech

- Primary: Indigo (#4F46E5)
- Secondary: Pink (#EC4899)
- Style: Clean, professional
- Use: SaaS, tech startups

### Classic Professional

- Primary: Navy (#1E40AF)
- Secondary: Gold (#F59E0B)
- Style: Traditional, trustworthy
- Use: Finance, legal, corporate

### Playful Creative

- Primary: Purple (#A855F7)
- Secondary: Orange (#FB923C)
- Style: Fun, energetic
- Use: Creative agencies, entertainment

### Minimal Elegant

- Primary: Black (#000000)
- Secondary: Gray (#6B7280)
- Style: Sophisticated, simple
- Use: Fashion, luxury, design

### Bold Vibrant

- Primary: Magenta (#EC4899)
- Secondary: Cyan (#06B6D4)
- Style: High energy, modern
- Use: Marketing, events, youth

## Best Practices

### Color Selection

1. **Brand Alignment:** Choose colors reflecting brand personality
2. **Color Psychology:** Consider emotional impact
3. **Market Research:** Analyze competitor colors
4. **Cultural Sensitivity:** Consider global meanings
5. **Accessibility First:** Test with tools early

### Theme Structure

```typescript
{
  colors: {
    primary: { 50-900 },
    secondary: { 50-900 },
    neutral: { 50-900 },
    success: { 50-900 },
    warning: { 50-900 },
    error: { 50-900 }
  },
  typography: {
    fontFamily: { sans, serif, mono },
    fontSize: { xs, sm, base, lg, xl, 2xl, ... },
    fontWeight: { normal, medium, semibold, bold },
    lineHeight: { tight, normal, relaxed }
  },
  spacing: {
    xs, sm, md, lg, xl, 2xl, ...
  },
  borderRadius: {
    none, sm, md, lg, full
  },
  effects: {
    shadow: { sm, md, lg },
    opacity: { 0-100 },
    blur: { sm, md, lg }
  }
}
```

### Testing Themes

1. **Multiple Devices:** Test on various screens
2. **Light Conditions:** Test in bright and dark environments
3. **Color Blindness:** Use simulators
4. **Contrast Checkers:** Verify all combinations
5. **User Feedback:** Get real user input

## Integration Examples

### React + Tailwind

```typescript
// theme.config.ts
export const theme = await generateTheme({ baseColors })
export const tokens = await exportThemeTokens({
  theme,
  format: 'tailwind'
})

// tailwind.config.js
module.exports = {
  theme: tokens
}
```

### Vue + CSS Variables

```typescript
// Generate theme
const theme = await generateTheme({ baseColors })
const css = await exportThemeTokens({
  theme,
  format: 'css'
})

// Write to file
fs.writeFileSync('./src/styles/theme.css', css)
```

### Storybook Integration

```typescript
// .storybook/preview.js
import { generateTheme, createDarkMode } from '@/lib/theme-builder'

const lightTheme = await generateTheme({ baseColors })
const darkTheme = await createDarkMode({ lightTheme })

export const parameters = {
  themes: {
    list: [
      { name: 'Light', class: 'theme-light', color: '#fff' },
      { name: 'Dark', class: 'theme-dark', color: '#000' }
    ]
  }
}
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
