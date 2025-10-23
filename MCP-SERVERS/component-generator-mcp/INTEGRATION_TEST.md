# Component Generator MCP - Integration Testing Guide

This guide shows how to test the Component Generator MCP with Claude Desktop.

## Setup

1. **Build the MCP:**
   ```bash
   cd MCP-SERVERS/component-generator-mcp
   npm install
   npm run build
   ```

2. **Add to Claude Desktop MCP Settings:**

   Open Claude Desktop MCP settings and add:

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

3. **Restart Claude Desktop**

## Test Scenarios

### Test 1: Configure Generator

**Prompt to Claude:**
```
Configure the component generator to output to ./src/components with Next.js framework and Tailwind styling
```

**Expected Result:**
- Configuration updated successfully
- Shows current settings

**MCP Tool Used:** `configure`

---

### Test 2: Generate Basic Component

**Prompt to Claude:**
```
Generate a Button component with these props:
- variant: string enum ['primary', 'secondary', 'outline'] with default 'primary'
- size: string enum ['sm', 'md', 'lg'] with default 'md'
- disabled: boolean with default false
- onClick: function (optional)
```

**Expected Result:**
- Creates `components/Button/` directory
- Generates `Button.tsx` with TypeScript + Zod validation
- Generates `Button.test.tsx` with basic tests
- Generates `index.ts` for exports
- All files properly formatted

**MCP Tool Used:** `generate_component`

**Generated Files:**
```
components/Button/
├── Button.tsx         # Component with Zod validation
├── Button.test.tsx    # Vitest tests
└── index.ts          # Exports
```

---

### Test 3: Generate Component with Stories

**Prompt to Claude:**
```
Generate a Card component with Storybook stories. Props:
- title: string (required)
- description: string (optional)
- image: string (optional)
- onClick: function (optional)
```

**Expected Result:**
- Creates component directory
- Generates component, test, story, and index files
- Story includes variants

**MCP Tool Used:** `generate_component` with `includeStories: true`

**Generated Files:**
```
components/Card/
├── Card.tsx
├── Card.test.tsx
├── Card.stories.tsx   # Storybook stories
└── index.ts
```

---

### Test 4: Generate Test for Existing Component

**Prompt to Claude:**
```
Generate a test file for the existing LoginForm component at ./components/LoginForm/LoginForm.tsx
```

**Expected Result:**
- Creates `LoginForm.test.tsx` in same directory
- Includes basic test structure

**MCP Tool Used:** `generate_test`

---

### Test 5: Generate Story for Existing Component

**Prompt to Claude:**
```
Generate a Storybook story for the existing Header component at ./components/Header/Header.tsx
```

**Expected Result:**
- Creates `Header.stories.tsx` in same directory
- Includes story template with variants

**MCP Tool Used:** `generate_story`

---

### Test 6: List Available Templates

**Prompt to Claude:**
```
What component templates are available?
```

**Expected Result:**
- Lists all available templates (component, test, story, index)
- Shows description for each

**MCP Tool Used:** `list_templates`

---

## Validation Checklist

After running tests, verify:

### Generated Component File (`Button.tsx`)
- [ ] Includes proper TypeScript types
- [ ] Uses Zod schema for prop validation
- [ ] Exports component and types
- [ ] Properly formatted (Prettier)
- [ ] Includes JSDoc comments if description provided

### Generated Test File (`Button.test.tsx`)
- [ ] Imports from vitest
- [ ] Imports component correctly
- [ ] Includes basic render test
- [ ] Includes tests for testable props (onClick, etc.)
- [ ] Properly formatted

### Generated Story File (`Button.stories.tsx`)
- [ ] Imports Storybook types
- [ ] Includes meta configuration
- [ ] Includes Default story
- [ ] Includes variant stories
- [ ] Properly formatted

### Generated Index File (`index.ts`)
- [ ] Exports component
- [ ] Exports types
- [ ] Clean barrel export

## Example Generated Component

**Button.tsx:**
```typescript
import { z } from 'zod'

const buttonPropsSchema = z.object({
  variant: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  disabled: z.boolean().default(false),
  onClick: z.function().optional(),
  children: z.any().optional(),
})

export type ButtonProps = z.infer<typeof buttonPropsSchema>

export function Button(props: ButtonProps) {
  const { variant, size, disabled, onClick, children } = buttonPropsSchema.parse(props)

  return <div className="button">{children}</div>
}
```

## Troubleshooting

### MCP Not Found
- Verify MCP is built: `npm run build`
- Check path in MCP settings is absolute
- Restart Claude Desktop

### Permission Errors
- Ensure output directory is writable
- Check file system permissions
- Try running with sudo (not recommended)

### Template Errors
- Verify templates exist in `src/templates/`
- Check Handlebars syntax
- Review error message for specific template issue

### Formatting Errors
- Prettier may fail on invalid TypeScript
- Check generated content manually
- Update Prettier config if needed

## Advanced Usage

### Custom Props Example

**Prompt to Claude:**
```
Generate a DataTable component with:
- columns: array (required)
- data: array (required)
- sortable: boolean default true
- filterable: boolean default true
- onRowClick: function (optional)
- pageSize: number default 10
```

### Form Component Example

**Prompt to Claude:**
```
Generate a LoginForm component with:
- onSubmit: function (required)
- loading: boolean default false
- error: string (optional)
- showForgotPassword: boolean default true
```

### Modal Component Example

**Prompt to Claude:**
```
Generate a Modal component with:
- isOpen: boolean (required)
- onClose: function (required)
- title: string (required)
- size: enum ['sm', 'md', 'lg', 'xl'] default 'md'
- closeOnOverlayClick: boolean default true
```

## Integration with Project

After generating components:

1. **Install in Project:**
   ```bash
   # If using the generated components in a React project
   cd your-project
   npm install zod  # For prop validation
   ```

2. **Import Generated Component:**
   ```typescript
   import { Button } from './components/Button'
   
   function App() {
     return <Button variant="primary" onClick={() => console.log('clicked')}>
       Click me
     </Button>
   }
   ```

3. **Run Tests:**
   ```bash
   npm test  # Run generated tests
   ```

4. **View Stories:**
   ```bash
   npm run storybook  # If Storybook is configured
   ```

## Next Steps

1. Customize generated components as needed
2. Add custom styling (Tailwind classes, CSS modules, etc.)
3. Extend Zod schemas for more complex validation
4. Add additional tests
5. Create custom templates for your project

## Support

For issues or feature requests, see the main repository documentation.
