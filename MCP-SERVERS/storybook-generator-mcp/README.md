# Storybook Generator MCP Server

Automate generation of Storybook stories for React components. Supports design system development and component documentation workflows.

## Features

- Generate Storybook stories from React components
- Multiple story templates (basic, with-variants)
- Batch generation for entire directories
- Storybook configuration management
- Template customization

## Installation

```bash
npm install
npm run build
```

## Usage

### Generate Single Story

```typescript
{
  "componentPath": "./src/components/Button.tsx",
  "template": "with-variants",
  "category": "UI/Buttons"
}
```

### Generate Stories for Directory

```typescript
{
  "componentDir": "./src/components",
  "template": "basic",
  "category": "Components"
}
```

### Update Storybook Config

```typescript
{
  "projectPath": "./",
  "options": {
    "stories": ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
    "addons": [
      "@storybook/addon-links",
      "@storybook/addon-essentials",
      "@storybook/addon-a11y"
    ]
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `generate_story` | Generate story for single component |
| `generate_all_stories` | Generate stories for all components in directory |
| `update_storybook_config` | Create/update Storybook configuration |

## Resources

| Resource | Description |
|----------|-------------|
| `storybook://templates/list` | Available story templates |

## Story Templates

### Basic Template
Simple story with default args and autodocs.

### With Variants Template
Story with multiple variants:
- Primary/Secondary/Outline variants
- Size variations (sm, md, lg)
- Comprehensive controls

## Supported Skills

- `design-system-architect` - Document design system components
- `frontend-builder` - Generate component documentation
- `technical-writer` - Create component guides

## Example Workflow

```bash
# 1. Generate stories for all components
generate_all_stories({
  componentDir: "./src/components",
  template: "with-variants"
})

# 2. Update Storybook config
update_storybook_config({
  projectPath: "./",
  options: {
    addons: ["@storybook/addon-a11y"]
  }
})

# 3. Run Storybook
npm run storybook
```

## Generated Story Example

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
```

## Running

```bash
npm start
```

## Testing

```bash
npm test
```
