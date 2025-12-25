# Dark Mode Converter MCP Server

Convert light mode designs to accessible dark mode with automatic color adjustments, contrast validation, and palette generation.

## Features

### Tools

#### `convertToDarkMode`

Convert complete light mode palette to dark mode.

**Parameters:**

- `lightColors` (object, required):
  - `background` (string): Background color
  - `surface` (string): Surface/card color
  - `text` (string): Text color
  - `primary` (string): Primary brand color
  - `secondary` (string): Secondary color
- `strategy` (string): auto, invert, desaturate, shift-hue, custom
- `preserveBrand` (boolean): Keep brand colors unchanged
- `contrastTarget` (number): Target contrast ratio (default: 4.5)

**Example:**

```typescript
{
  lightColors: {
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#111827",
    primary: "#4F46E5",
    secondary: "#EC4899"
  },
  strategy: "auto",
  preserveBrand: true,
  contrastTarget: 4.5
}
```

#### `suggestDarkVariant`

Suggest optimal dark mode variant for a single color.

**Parameters:**

- `lightColor` (string, required): Hex color to convert
- `role` (string, required): background, surface, text, primary, accent
- `adjacentColors` (array): Nearby colors for contrast checking

**Example:**

```typescript
{
  lightColor: "#4F46E5",
  role: "primary",
  adjacentColors: ["#FFFFFF", "#F9FAFB"]
}
```

#### `validateDarkContrast`

Validate dark mode for WCAG accessibility compliance.

**Parameters:**

- `darkTheme` (object, required): Dark mode theme to validate
- `wcagLevel` (string): AA or AAA
- `checkCombinations` (array): Specific color pairs to check

**Example:**

```typescript
{
  darkTheme: { /* theme object */ },
  wcagLevel: "AA",
  checkCombinations: [
    { foreground: "#E3E4E6", background: "#0D1117", usage: "body text" }
  ]
}
```

#### `generateDarkPalette`

Generate complete dark mode palette from brand color.

**Parameters:**

- `brandColor` (string, required): Primary brand color
- `style` (string): pure-black, true-dark, soft-dark, blue-tinted, warm-dark
- `includeSemantics` (boolean): Include success/warning/error colors

**Example:**

```typescript
{
  brandColor: "#4F46E5",
  style: "true-dark",
  includeSemantics: true
}
```

### Resources

#### `dark-mode://examples`

Curated examples of excellent dark mode implementations.

#### `dark-mode://guide`

Comprehensive guide to dark mode design principles.

## Setup

```bash
cd mcp-servers/dark-mode-converter-mcp
npm install
npm run build
```

### Configuration

```json
{
  "mcpServers": {
    "dark-mode-converter": {
      "command": "node",
      "args": ["path/to/dark-mode-converter-mcp/dist/index.js"]
    }
  }
}
```

## Supported Skills

- **visual-designer**: Dark mode color theory and conversion
- **design-system-architect**: Systematic dark mode implementation

## Quick Start

### 1. Convert Existing Light Theme

```typescript
const darkColors = await convertToDarkMode({
  lightColors: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    primary: '#4F46E5',
    secondary: '#EC4899'
  },
  strategy: 'auto',
  preserveBrand: true
})

// Result:
// {
//   background: "#0D1117",
//   surface: "#161B22",
//   text: "#C9D1D9",
//   primary: "#4F46E5",      // Preserved
//   secondary: "#EC4899"      // Preserved
// }
```

### 2. Generate From Scratch

```typescript
const palette = await generateDarkPalette({
  brandColor: '#4F46E5',
  style: 'true-dark',
  includeSemantics: true
})

// Result: Complete dark mode palette
```

### 3. Validate Accessibility

```typescript
const validation = await validateDarkContrast({
  darkTheme: palette,
  wcagLevel: 'AA'
})

// Check if passes: validation.data.passed
```

## Dark Mode Styles

### Pure Black (#000000)

**Use for:** OLED optimization, maximum battery savings
**Pros:** Best for OLED, high contrast, modern
**Cons:** Can be harsh, stark
**Example:** Twitter, Reddit

### True Dark (#0D1117)

**Use for:** General purpose, reduced eye strain
**Pros:** Balanced, professional, GitHub-style
**Cons:** None, most versatile
**Example:** GitHub, Linear

### Soft Dark (#1A1A1A)

**Use for:** Warmer feel, less technical
**Pros:** Comfortable, approachable
**Cons:** Less "dark mode" feel
**Example:** Spotify, Medium

### Blue Tinted (#0A1929)

**Use for:** Technical products, professional tools
**Pros:** Distinctive, reduces yellow light
**Cons:** Can tint other colors
**Example:** Material-UI dark

### Warm Dark (#1A1612)

**Use for:** Creative apps, reading apps
**Pros:** Cozy, reduces blue light
**Cons:** May feel dated
**Example:** Notion, Bear

## Color Conversion Strategies

### Auto Strategy (Recommended)

Intelligently converts based on color role:

- **Backgrounds:** Inverts to dark
- **Text:** Inverts to light (not pure white)
- **Brand colors:** Preserves or slightly adjusts
- **Borders:** Subtle lightness increase

### Invert Strategy

Flips lightness on HSL scale:

- Light (90%) → Dark (10%)
- Dark (10%) → Light (90%)
- Maintains hue and saturation

### Desaturate Strategy

Reduces color intensity for dark mode:

- Decreases saturation 10-30%
- Useful for vibrant light themes
- Prevents oversaturation

### Shift Hue Strategy

Rotates hue for dark mode feel:

- Shifts toward cooler tones
- Adds blue tint
- Creates cohesive dark feel

### Custom Strategy

Hand-pick each color:

- Full control
- Brand-specific
- Most work required

## Contrast Requirements

### WCAG AA (Minimum)

**Normal text (< 18px):** 4.5:1
**Large text (≥ 18px):** 3:1
**UI components:** 3:1

### WCAG AAA (Enhanced)

**Normal text:** 7:1
**Large text:** 4.5:1
**UI components:** 4.5:1

### Common Combinations

```typescript
// Body text on background
text: "#C9D1D9" on background: "#0D1117" = 11.3:1 ✓

// Secondary text on background
textSecondary: "#9DA3A7" on background: "#0D1117" = 6.2:1 ✓

// Primary button text
white: "#FFFFFF" on primary: "#4F46E5" = 8.2:1 ✓

// Border on surface
border: "#30363D" on surface: "#161B22" = 1.5:1 ✓ (non-text)
```

## Surface Elevation

Dark mode uses lightness, not shadows, for elevation:

```css
/* Background layer */
background: #0d1117;

/* Surface layer (cards, panels) */
surface-1: #161b22; /* +2% lightness */

/* Elevated surface (dialogs, popovers) */
surface-2: #21262d; /* +4% lightness */

/* Highest surface (tooltips) */
surface-3: #30363d; /* +6% lightness */
```

## Color Adjustments

### Background Colors

```typescript
// Light mode
background: '#FFFFFF'(100 % lightness)
surface: '#F9FAFB'(98 % lightness)

// Dark mode
background: '#0D1117'(5 % lightness)
surface: '#161B22'(8 % lightness)
```

### Text Colors

```typescript
// Light mode
text: "#111827"        (10% lightness)
textSecondary: "#6B7280"  (50% lightness)

// Dark mode
text: "#C9D1D9"        (85% lightness) - NOT pure white
textSecondary: "#9DA3A7"  (65% lightness)
```

### Brand Colors

```typescript
// Light mode
primary: "#4F46E5"     (HSL: 239, 84%, 60%)

// Dark mode (adjusted)
primary: "#6366F1"     (HSL: 239, 84%, 67%)
// Increased lightness by 7% for better visibility
```

## Semantic Colors

### Success (Green)

- Light: `#10B981`
- Dark: `#3FB950`

### Warning (Amber)

- Light: `#F59E0B`
- Dark: `#D29922`

### Error (Red)

- Light: `#EF4444`
- Dark: `#F85149`

### Info (Blue)

- Light: `#3B82F6`
- Dark: `#58A6FF`

## Implementation

### CSS Custom Properties

```css
/* Light mode */
:root {
  --color-background: #ffffff;
  --color-text: #111827;
  --color-primary: #4f46e5;
}

/* Dark mode */
:root[data-theme='dark'] {
  --color-background: #0d1117;
  --color-text: #c9d1d9;
  --color-primary: #6366f1;
}

/* Or with media query */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0d1117;
    --color-text: #c9d1d9;
    --color-primary: #6366f1;
  }
}
```

### React Implementation

```tsx
import { useState, useEffect } from 'react'

function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () =>
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return [isDark, setIsDark] as const
}

function App() {
  const [isDark, setIsDark] = useDarkMode()

  return <button onClick={() => setIsDark(!isDark)}>{isDark ? '☀️' : '🌙'} Toggle Theme</button>
}
```

### Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        // Light mode (default)
        background: '#FFFFFF',
        text: '#111827',

        // Dark mode
        'dark-background': '#0D1117',
        'dark-text': '#C9D1D9'
      }
    }
  }
}
```

```tsx
<div className="bg-background dark:bg-dark-background text-text dark:text-dark-text">Content</div>
```

## Best Practices

### Do's

1. **Test in low light:** Design in actual dark conditions
2. **Use semantic roles:** Background, surface, text, primary, etc.
3. **Respect system preference:** Check `prefers-color-scheme`
4. **Provide toggle:** Let users choose
5. **Save preference:** Use localStorage or backend
6. **Smooth transitions:** 200-300ms color transitions
7. **Adjust images:** Reduce brightness in dark mode

### Don'ts

1. **Pure black:** Use slightly lighter (#0D1117, not #000000)
2. **Pure white text:** Use light gray (#C9D1D9, not #FFFFFF)
3. **Forget states:** Hover, focus, active, disabled
4. **Ignore elevation:** Use lightness for depth
5. **Over-saturate:** Reduce vibrant colors
6. **Heavy shadows:** Use subtle borders instead
7. **Same brand colors:** Adjust lightness for dark mode

## Testing Checklist

- [ ] All text readable
- [ ] Contrast ratios meet WCAG AA/AAA
- [ ] Brand colors recognizable
- [ ] Semantic colors distinct
- [ ] All interactive states visible
- [ ] Focus indicators clear
- [ ] Images not too bright
- [ ] Icons readable
- [ ] Borders visible
- [ ] No pure black or white
- [ ] Smooth theme transition
- [ ] System preference respected
- [ ] User preference saved
- [ ] Test in actual darkness

## Common Issues & Solutions

### Issue: Text too bright

**Problem:** Pure white text (#FFFFFF) causes eye strain
**Solution:** Use light gray (#C9D1D9 or #E3E4E6)

### Issue: Colors look washed out

**Problem:** Not adjusting brand colors for dark mode
**Solution:** Increase saturation and lightness by 10-15%

### Issue: Poor contrast

**Problem:** Not enough difference between colors
**Solution:** Use contrast checker, aim for 4.5:1 minimum

### Issue: Borders invisible

**Problem:** Border color too close to background
**Solution:** Increase border lightness by 10-15%

### Issue: Images too bright

**Problem:** Light mode images not adjusted
**Solution:** Apply `filter: brightness(0.8)` in dark mode

## Development

```bash
npm install
npm run build
npm test
npm run dev
```

## License

MIT
