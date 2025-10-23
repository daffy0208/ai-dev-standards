# Component Generator MCP Server

Intelligent React/Next.js component scaffolding with best practices built-in.

## What This MCP Does

- 🧩 Generates React/Next.js components
- 📝 Creates TypeScript interfaces
- 🎨 Includes Tailwind CSS styling
- ✅ Adds prop validation (Zod)
- 📖 Generates Storybook stories
- 🧪 Creates test files

## Installation

```bash
# Create MCP server
mkdir -p MCP-SERVERS/component-generator-mcp
cd MCP-SERVERS/component-generator-mcp

# Install dependencies
npm init -y
npm install @modelcontextprotocol/sdk handlebars prettier
```

## Setup

```json
// Add to Claude Code MCP settings
{
  "mcpServers": {
    "component-generator": {
      "command": "node",
      "args": ["/path/to/component-generator-mcp/index.js"],
      "env": {
        "COMPONENTS_DIR": "./components"
      }
    }
  }
}
```

## Features

### 1. Component Scaffolding

```javascript
// Generate a component
await componentGenerator.create({
  name: 'Button',
  type: 'component',
  props: {
    variant: ['primary', 'secondary', 'outline'],
    size: ['sm', 'md', 'lg'],
    disabled: 'boolean',
    onClick: 'function'
  }
})

// Creates:
// components/Button/
// ├── Button.tsx
// ├── Button.test.tsx
// ├── Button.stories.tsx
// └── index.ts
```

### 2. Auto-Generated Component

```typescript
// components/Button/Button.tsx (generated)
import { z } from 'zod'

const buttonPropsSchema = z.object({
  variant: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  disabled: z.boolean().default(false),
  onClick: z.function().args(z.any()).returns(z.void()).optional(),
  children: z.any()
})

export type ButtonProps = z.infer<typeof buttonPropsSchema>

export function Button(props: ButtonProps) {
  const { variant, size, disabled, onClick, children } = buttonPropsSchema.parse(props)

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded font-medium transition ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  )
}
```

### 3. Auto-Generated Tests

```typescript
// components/Button/Button.test.tsx (generated)
import { render, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    const { getByText } = render(<Button>Click me</Button>)
    expect(getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    const { getByText } = render(<Button onClick={onClick}>Click</Button>)

    fireEvent.click(getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(<Button disabled>Disabled</Button>)
    expect(getByText('Disabled')).toBeDisabled()
  })
})
```

## Usage in Claude Code

```
User: "Generate a Card component with title, description, image, and onClick props"