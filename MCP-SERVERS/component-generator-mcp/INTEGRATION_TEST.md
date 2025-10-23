# Component Generator MCP - Integration Test

## Test Status: ✅ Ready for Testing

## Setup

1. Build the MCP server:
```bash
cd MCP-SERVERS/component-generator-mcp
npm install
npm run build
```

2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "component-generator": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-SERVERS/component-generator-mcp/dist/index.js"],
      "env": {
        "COMPONENTS_DIR": "./components"
      }
    }
  }
}
```

3. Restart Claude Desktop

## Test Cases

### Test 1: Generate Basic Component

**Tool:** `generate_component`

**Input:**
```json
{
  "name": "Card",
  "includeTests": true,
  "includeStories": true
}
```

**Expected Output:**
- Component file with Card.tsx
- Test file with basic tests
- Storybook story file
- Index.ts export file

### Test 2: Generate Component with Props

**Tool:** `generate_component`

**Input:**
```json
{
  "name": "Button",
  "props": [
    {
      "name": "variant",
      "type": "enum",
      "enumValues": ["primary", "secondary", "outline"],
      "required": true,
      "description": "Button style variant"
    },
    {
      "name": "size",
      "type": "enum",
      "enumValues": ["sm", "md", "lg"],
      "defaultValue": "md"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "defaultValue": false
    },
    {
      "name": "onClick",
      "type": "function",
      "description": "Click handler"
    }
  ],
  "styling": "tailwind",
  "framework": "react"
}
```

**Expected Output:**
- Component with proper TypeScript interface
- Enum props with union types
- Tailwind CSS styling classes
- Default values for optional props
- Test file with prop validation tests
- Storybook story with example args

### Test 3: Generate Custom Hook

**Tool:** `generate_hook`

**Input:**
```json
{
  "name": "useLocalStorage",
  "parameters": [
    {
      "name": "key",
      "type": "string"
    },
    {
      "name": "initialValue",
      "type": "any"
    }
  ],
  "returnType": "[any, (value: any) => void]"
}
```

**Expected Output:**
- Hook file starting with "use"
- Proper TypeScript types
- useState and useEffect imports

### Test 4: Generate Next.js Page

**Tool:** `generate_page`

**Input:**
```json
{
  "name": "Dashboard",
  "route": "/dashboard",
  "includeMetadata": true
}
```

**Expected Output:**
- Page component with Next.js Metadata export
- Proper page structure with Tailwind classes
- Route information in comments

### Test 5: Preview Component

**Tool:** `preview_component`

**Input:**
```json
{
  "name": "Alert",
  "props": [
    {
      "name": "type",
      "type": "enum",
      "enumValues": ["info", "success", "warning", "error"]
    }
  ]
}
```

**Expected Output:**
- Formatted TypeScript component code
- No files created (preview only)

## Integration Checklist

- [ ] Server starts successfully
- [ ] All 4 tools are listed in Claude Desktop
- [ ] generate_component creates valid React components
- [ ] Generated code is properly formatted with Prettier
- [ ] TypeScript interfaces are correct
- [ ] Enum props create union types
- [ ] Test files include basic tests
- [ ] Storybook stories have proper structure
- [ ] generate_hook validates "use" prefix
- [ ] generate_page creates Next.js pages with metadata
- [ ] preview_component shows code without creating files
- [ ] Error handling works for invalid inputs

## Known Limitations

- File creation is simulated (returns code, doesn't write files)
- Prettier formatting may fail silently (returns unformatted code)
- Component logic is basic (template only)
- Test files need manual enhancement

## Next Steps

1. Add actual file system writing capability
2. Support more frameworks (Vue, Svelte, Angular)
3. Add CSS Modules and Styled Components support
4. Generate more comprehensive test coverage
5. Add component composition (composite components)
6. Support TypeScript generics in components
7. Add React Server Components support
