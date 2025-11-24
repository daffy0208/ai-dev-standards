# Props Documenter MCP Server

Automate documentation of React component props with TypeScript type extraction and JSDoc generation.

## Features

- Extract prop types from React components
- Generate markdown prop tables
- Add JSDoc comments automatically
- Support TypeScript interfaces and types
- Common prop type patterns

## Installation

```bash
npm install
npm run build
```

## Tools

| Tool                   | Description                             |
| ---------------------- | --------------------------------------- |
| `extract_props`        | Extract prop definitions from component |
| `generate_props_table` | Generate markdown props documentation   |
| `add_jsdoc`            | Add JSDoc comments to props             |

## Resources

| Resource                        | Description               |
| ------------------------------- | ------------------------- |
| `props://prop-type-definitions` | Common prop type patterns |

## Supported Skills

- `technical-writer` - Document component APIs
- `frontend-builder` - Generate component documentation

## Example Usage

```typescript
// Extract props
{
  "componentPath": "./src/components/Button.tsx"
}

// Result:
{
  "success": true,
  "componentName": "Button",
  "props": [
    {
      "name": "variant",
      "type": "\"primary\" | \"secondary\"",
      "required": false
    },
    {
      "name": "children",
      "type": "React.ReactNode",
      "required": true
    }
  ]
}

// Generate props table
{
  "componentPath": "./src/components/Button.tsx",
  "outputPath": "./docs/Button.md"
}

// Add JSDoc
{
  "componentPath": "./src/components/Button.tsx",
  "propDescriptions": {
    "variant": "Visual style variant of the button",
    "children": "Button content"
  }
}
```

## Generated Documentation Example

```markdown
# Button Props

| Prop       | Type                       | Required | Default | Description          |
| ---------- | -------------------------- | -------- | ------- | -------------------- |
| `variant`  | `"primary" \| "secondary"` |          | -       | Visual style variant |
| `size`     | `"sm" \| "md" \| "lg"`     |          | `"md"`  | Button size          |
| `children` | `React.ReactNode`          | ✓        | -       | Button content       |
```

## Common Prop Types

The resource `props://prop-type-definitions` provides:

- **Common props**: children, className, style, event handlers
- **Variant props**: size, variant, color enums
- **State props**: disabled, loading, error, required

## Running

```bash
npm start
```

## Testing

```bash
npm test
```
