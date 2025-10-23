# Design System Architect - Quick Start

**Version:** 1.0.0
**Category:** UX & Design
**Difficulty:** Advanced

## What This Skill Does

Helps you build scalable, maintainable design systems with design tokens, component libraries, Storybook documentation, and governance processes.

## When to Use

Use this skill when you need to:
- Build a component library
- Establish design tokens
- Set up Storybook documentation
- Create multi-brand theming
- Version design system releases
- Govern design system contributions
- Scale design consistency across products

## Quick Start

**Fastest path to design system:**

1. **Create design tokens:**
   ```bash
   npm install --save-dev style-dictionary
   ```
   - Define primitives (colors, spacing, typography)
   - Define semantic tokens (background-primary, text-secondary)
   - Build to CSS variables

2. **Set up component library:**
   - Use atomic design (atoms → molecules → organisms)
   - TypeScript for type safety
   - CSS modules for scoping

3. **Add Storybook:**
   ```bash
   npx storybook@latest init
   ```
   - Document all components
   - Show all variants and states
   - Add accessibility addon

4. **Test everything:**
   - Unit tests (Jest + RTL)
   - Accessibility tests (jest-axe)
   - Visual regression (Chromatic)

**Time to build:** 4-8 weeks for MVP design system

## Success Criteria

You've successfully used this skill when:
- ✅ Design tokens are version controlled
- ✅ All components have TypeScript types
- ✅ Storybook is deployed and accessible
- ✅ Components are accessible (WCAG 2.1 AA)
- ✅ Tests cover 70%+ of code
- ✅ Package is published to NPM
- ✅ Documentation is comprehensive
- ✅ Contribution process is clear

## Key Concepts

**Design Tokens:**
- Single source of truth for design decisions
- Platform-agnostic (JSON → CSS, iOS, Android)
- Three levels: Primitives → Semantic → Component

**Atomic Design:**
- Atoms (Button, Input)
- Molecules (FormField = Label + Input + Error)
- Organisms (LoginForm = FormFields + Button)
- Templates (Layout structures)
- Pages (Real content)

**Component API Design:**
- Sensible defaults (works with minimal props)
- Composition over configuration
- Controlled & uncontrolled modes
- Polymorphic components (render as different elements)

**Semantic Versioning:**
- MAJOR: Breaking changes (v1 → v2)
- MINOR: New features (v1.0 → v1.1)
- PATCH: Bug fixes (v1.0.0 → v1.0.1)

## Quick Reference

### Design Token Structure
```
tokens/
├── primitives/
│   ├── colors.json       # Raw values
│   ├── spacing.json
│   └── typography.json
├── semantic/
│   ├── colors.json       # Named by purpose
│   └── spacing.json
└── components/
    ├── button.json       # Component-specific
    └── input.json
```

### Component Structure
```
components/
└── Button/
    ├── Button.tsx           # Implementation
    ├── Button.module.css    # Styles
    ├── Button.stories.tsx   # Storybook
    ├── Button.test.tsx      # Tests
    ├── Button.types.ts      # Types
    ├── index.ts             # Exports
    └── README.md            # Docs
```

### Token Transformation
```bash
# Install Style Dictionary
npm install --save-dev style-dictionary

# Build tokens
npx style-dictionary build

# Output: CSS variables, JS constants, etc.
```

### Component Example
```typescript
// Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

// Button.tsx
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button ${variant} ${size} ${fullWidth ? 'full' : ''}`}
      disabled={isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
```

### Storybook Story
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}
```

## Tools

**Token Management:**
- Style Dictionary (token transformation)
- Figma Tokens (Figma → code sync)

**Component Development:**
- React + TypeScript
- CSS Modules or styled-components
- Rollup or tsup (bundling)

**Documentation:**
- Storybook (component explorer)
- MDX (rich documentation)
- Docusaurus (documentation site)

**Testing:**
- Jest + React Testing Library
- jest-axe (accessibility)
- Chromatic (visual regression)

**Distribution:**
- NPM (package registry)
- Changesets (versioning)
- GitHub Actions (CI/CD)

## Common Commands

```bash
# Initialize Storybook
npx storybook@latest init

# Start Storybook dev server
npm run storybook

# Build Storybook for deployment
npm run build-storybook

# Build design tokens
npx style-dictionary build

# Run tests
npm test

# Build package
npm run build

# Publish to NPM
npm version patch  # or minor, major
npm publish

# Visual regression testing
npx chromatic --project-token=YOUR_TOKEN
```

## Component Priority

**P0 (Must Have):**
- Button, Input, Label, Text, Icon
- FormField, Card, Modal

**P1 (Should Have):**
- Select, Checkbox, Radio, Switch
- Tabs, Dropdown, Tooltip

**P2 (Nice to Have):**
- DatePicker, Slider, Toggle
- Toast, Drawer, Popover

**P3 (Future):**
- DataTable, Calendar, FileUpload
- Charts, Stepper

## Design System Governance

**Contribution Flow:**
1. **Proposal** - GitHub issue with problem statement
2. **Design Review** - Figma mockup approval
3. **API Design** - TypeScript interface agreement
4. **Implementation** - PR with tests + stories
5. **Documentation** - README + Storybook docs
6. **Release** - Version bump + changelog

**Versioning Strategy:**
- Breaking changes → MAJOR version
- New features → MINOR version
- Bug fixes → PATCH version

**Deprecation Process:**
1. Mark prop as deprecated with JSDoc
2. Support both old and new (with warning)
3. Remove in next major version

## Example Workflow

### 1. Create Design Tokens
```json
// tokens/colors.json
{
  "color": {
    "brand": {
      "primary": { "value": "#3b82f6" },
      "secondary": { "value": "#8b5cf6" }
    }
  }
}
```

### 2. Build Tokens to CSS
```bash
npx style-dictionary build
```

### 3. Create Component
```typescript
// components/Button/Button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}
```

### 4. Document in Storybook
```typescript
// components/Button/Button.stories.tsx
export const Primary: Story = {
  args: { children: 'Button' }
}
```

### 5. Test Component
```typescript
// components/Button/Button.test.tsx
it('renders children', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### 6. Publish Package
```bash
npm version minor
npm publish
```

## Common Mistakes to Avoid

❌ **Skipping design tokens** - Components won't be themeable
❌ **Too many component variants** - Keep it simple
❌ **No TypeScript** - Harder to maintain at scale
❌ **Missing tests** - Components will break
❌ **Poor documentation** - Developers won't use it
❌ **No versioning strategy** - Breaking changes will cause chaos
❌ **Building everything at once** - Start with P0 components

## Maintenance

**Weekly:**
- Triage new component requests
- Review and merge PRs
- Update documentation

**Monthly:**
- Release new version
- Update changelog
- Audit accessibility

**Quarterly:**
- Review component usage analytics
- Deprecate unused components
- Plan major version updates

## Version History

- **1.0.0** (2025-10-22): Initial release with comprehensive design system architecture

## License

Part of ai-dev-standards repository.
