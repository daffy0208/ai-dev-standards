# Design Handoff MCP Server

Streamline design-to-development handoff with automated spec extraction, code generation, and design-code comparison.

## Features

### Tools

#### `extractSpecs`

Extract detailed specifications from design files (Figma, Sketch, Adobe XD).

**Parameters:**

- `designFile` (string, required): URL or path to design file
- `componentName` (string): Specific component (optional)
- `includeAnnotations` (boolean): Include designer comments
- `format` (string): Output format - json, markdown, html

**Example:**

```typescript
{
  designFile: "https://www.figma.com/file/abc123/MyDesign",
  componentName: "Button",
  includeAnnotations: true,
  format: "json"
}
```

#### `generateCode`

Generate component code from design specifications.

**Parameters:**

- `component` (string, required): Component name or spec ID
- `framework` (string, required): react, vue, svelte, angular, html, react-native
- `styleApproach` (string): css-modules, styled-components, tailwind, emotion, sass
- `typescript` (boolean): Generate TypeScript
- `responsive` (boolean): Include responsive breakpoints

**Example:**

```typescript
{
  component: "Button",
  framework: "react",
  styleApproach: "tailwind",
  typescript: true,
  responsive: true
}
```

#### `compareDesignVsCode`

Compare implemented code against design specifications.

**Parameters:**

- `designFile` (string, required): URL or path to design
- `codeFile` (string, required): Path to component code
- `checkAspects` (array): Aspects to compare - colors, typography, spacing, dimensions, layout
- `tolerance` (number): Tolerance in pixels

**Example:**

```typescript
{
  designFile: "https://www.figma.com/file/abc123/MyDesign",
  codeFile: "./src/components/Button.tsx",
  checkAspects: ["colors", "typography", "spacing"],
  tolerance: 2
}
```

#### `generateStyleGuide`

Generate comprehensive style guide documentation.

**Parameters:**

- `designFile` (string, required): URL or path to design
- `sections` (array): colors, typography, components, spacing, icons, patterns
- `format` (string): markdown, html, pdf, storybook

**Example:**

```typescript
{
  designFile: "https://www.figma.com/file/abc123/MyDesign",
  sections: ["colors", "typography", "components"],
  format: "markdown"
}
```

### Resources

#### `design-handoff://specs`

All extracted design specifications with metadata.

#### `design-handoff://workflow`

Best practices for design-to-development handoff process.

## Setup

```bash
cd MCP-SERVERS/design-handoff-mcp
npm install
npm run build
```

### Configuration

```json
{
  "mcpServers": {
    "design-handoff": {
      "command": "node",
      "args": ["path/to/design-handoff-mcp/dist/index.js"]
    }
  }
}
```

## Supported Skills

- **frontend-builder**: Automated component generation
- **design-system-architect**: Design system documentation and consistency

## Complete Handoff Workflow

### 1. Extract Design Specs

```typescript
const specs = await extractSpecs({
  designFile: 'https://www.figma.com/file/abc/Design',
  includeAnnotations: true,
  format: 'json'
})

// Result: Complete specifications including:
// - Colors: #4F46E5, #EC4899, #10B981
// - Typography: sizes, weights, line heights
// - Spacing: padding, margins, gaps
// - Dimensions: widths, heights
// - Assets: images, icons
```

### 2. Generate Component Code

```typescript
const code = await generateCode({
  component: 'Button',
  framework: 'react',
  styleApproach: 'tailwind',
  typescript: true,
  responsive: true
})

// Result: Production-ready component code
```

### 3. Compare Design vs Implementation

```typescript
const comparison = await compareDesignVsCode({
  designFile: 'https://www.figma.com/file/abc/Design',
  codeFile: './src/components/Button.tsx',
  checkAspects: ['colors', 'typography', 'spacing'],
  tolerance: 2
})

// Result: List of differences with severity levels
```

### 4. Generate Documentation

```typescript
const styleGuide = await generateStyleGuide({
  designFile: 'https://www.figma.com/file/abc/Design',
  sections: ['colors', 'typography', 'components'],
  format: 'markdown'
})

// Result: Comprehensive style guide
```

## Design Specifications

### What Gets Extracted

**Colors:**

- Brand colors with hex values
- Color roles (primary, secondary, etc.)
- Dark mode variants
- Accessibility contrast ratios

**Typography:**

- Font families and weights
- Font sizes and scales
- Line heights
- Letter spacing

**Spacing:**

- Padding values
- Margin values
- Gap sizes
- Grid systems

**Components:**

- Component dimensions
- States (default, hover, active, disabled)
- Variants
- Composition rules

**Assets:**

- Icons (SVG preferred)
- Images (optimized formats)
- Illustrations
- Logos

## Code Generation

### Supported Frameworks

**React:**

```tsx
import React from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children }) => {
  return <button className={`${styles.button} ${styles[variant]}`}>{children}</button>
}
```

**Vue:**

```vue
<template>
  <button :class="['button', variant]">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary'
})
</script>
```

**Svelte:**

```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<button class="button {variant}">
  <slot />
</button>
```

### Styling Approaches

**CSS Modules:**

```css
.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.primary {
  background: var(--color-primary);
  color: white;
}
```

**Tailwind:**

```tsx
<button className="px-6 py-3 rounded-lg font-semibold bg-primary text-white">{children}</button>
```

**Styled Components:**

```tsx
const Button = styled.button<{ variant: string }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  background: ${props => (props.variant === 'primary' ? 'var(--color-primary)' : 'transparent')};
`
```

## Design vs Code Comparison

### Comparison Aspects

**Colors:**

- Exact hex matching
- Color role verification
- Dark mode consistency

**Typography:**

- Font family matching
- Size accuracy (±1px tolerance)
- Weight matching
- Line height verification

**Spacing:**

- Padding accuracy
- Margin consistency
- Gap sizes
- Tolerance-based matching (default 2px)

**Dimensions:**

- Width/height matching
- Aspect ratios
- Min/max constraints

**Layout:**

- Flexbox properties
- Grid layouts
- Positioning

### Difference Severity Levels

- **Critical:** Completely wrong (wrong color, missing element)
- **High:** Significantly off (>10px difference)
- **Medium:** Noticeably off (5-10px difference)
- **Low:** Slightly off (2-5px difference)
- **Minor:** Within tolerance (<2px difference)

## Style Guide Generation

### Sections

**Colors:**

- Swatches with hex codes
- Usage guidelines
- Accessibility notes
- Dark mode variants

**Typography:**

- Type scale visualization
- Font pairing rules
- Line length recommendations
- Responsive sizing

**Components:**

- Component previews
- Props/API documentation
- Usage examples
- Do's and don'ts

**Spacing:**

- Spacing scale
- Grid system
- Layout patterns
- Responsive rules

**Icons:**

- Icon library
- Usage guidelines
- Sizes and variants
- Accessibility labels

## Best Practices

### For Designers

1. **Use Components:** Create reusable components, not frames
2. **Name Consistently:** Use clear, descriptive names
3. **Document States:** Include all interactive states
4. **Add Annotations:** Explain complex interactions
5. **Design Tokens:** Use styles, not hard-coded values
6. **Responsive Design:** Provide all breakpoints
7. **Accessibility:** Include ARIA labels and contrast checks

### For Developers

1. **Review First:** Study design before coding
2. **Use Tokens:** Never hard-code values from design
3. **All States:** Implement hover, active, disabled, etc.
4. **Responsive:** Test all breakpoints
5. **Accessibility:** Add proper semantics
6. **Compare Often:** Use comparison tool during development
7. **Document Deviations:** Note any changes from design

## Common Handoff Issues

### Design Issues

- Missing states (hover, disabled)
- Inconsistent spacing
- No responsive specs
- Missing dark mode
- Unclear interactions

### Development Issues

- Hard-coded values
- Wrong colors
- Missing states
- Poor accessibility
- Non-responsive

### Solutions

- Use this MCP for automated extraction
- Compare design vs code regularly
- Maintain design token library
- Document all deviations
- Iterate with designer

## Integration Examples

### CI/CD Pipeline

```yaml
# .github/workflows/design-qa.yml
name: Design QA

on: [pull_request]

jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Compare Design vs Code
        run: |
          npm run design:compare
          # Fails if differences exceed threshold
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Compare component against design
npm run design:compare -- --component Button

if [ $? -ne 0 ]; then
  echo "Design mismatch detected. Review differences."
  exit 1
fi
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
