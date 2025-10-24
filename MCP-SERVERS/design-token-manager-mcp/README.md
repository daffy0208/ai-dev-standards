# Design Token Manager MCP Server

Manage design tokens, generate theme configurations, and maintain design system consistency.

## What This MCP Does

- 🎨 **Token Management** - Colors, typography, spacing, shadows
- 🔄 **Multi-Format Export** - CSS, SCSS, JS, JSON, Tailwind
- 📦 **Token Sets** - Light/dark themes, brand variations
- ✅ **Validation** - Check token usage and consistency
- 🔍 **Token Discovery** - Find all token usages in code
- 📊 **Token Analytics** - Usage statistics and insights

## Installation

```bash
cd MCP-SERVERS/design-token-manager-mcp
npm install && npm run build
```

## Tools

### 1. configure
```typescript
{
  projectPath: string;
  tokenFormat?: 'design-tokens' | 'style-dictionary';
}
```

### 2. create_tokens
Create design token set.
```typescript
{
  name: string;
  tokens: {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
    spacing?: Record<string, string>;
    shadows?: Record<string, string>;
    radii?: Record<string, string>;
  }
}
```

### 3. export_tokens
Export tokens to format.
```typescript
{
  tokenSet: string;
  format: 'css' | 'scss' | 'js' | 'json' | 'tailwind';
  outputPath?: string;
}
```

### 4. create_theme
Create theme from token set.
```typescript
{
  name: string;
  baseTokens: string;
  overrides?: Record<string, any>;
}
```

### 5. validate_tokens
Check token usage and consistency.
```typescript
{
  tokenSet: string;
  checkUnused?: boolean;
  checkContrast?: boolean;  // for colors
}
```

### 6. find_token_usage
Find where tokens are used.
```typescript
{
  tokenName: string;
  searchPath?: string;
}
```

### 7. generate_tailwind_config
Create Tailwind config from tokens.
```typescript
{
  tokenSet: string;
  outputPath?: string;
}
```

## Usage Example

```javascript
await tokenManager.configure({ projectPath: './design-system' });

// Create token set
await tokenManager.create_tokens({
  name: 'brand',
  tokens: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      error: '#EF4444'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '2rem'
    }
  }
});

// Export as CSS variables
await tokenManager.export_tokens({
  tokenSet: 'brand',
  format: 'css',
  outputPath: './src/tokens.css'
});

// Create dark theme
await tokenManager.create_theme({
  name: 'dark',
  baseTokens: 'brand',
  overrides: {
    colors: {
      primary: '#60A5FA',
      secondary: '#34D399'
    }
  }
});
```

## Token Categories

- **Colors** - Primary, secondary, semantic colors
- **Typography** - Font families, sizes, weights, line heights
- **Spacing** - Margins, paddings, gaps
- **Shadows** - Box shadows, text shadows
- **Radii** - Border radius values
- **Breakpoints** - Responsive breakpoints
- **Z-Index** - Layering system

## Export Formats

- **CSS** - CSS custom properties (variables)
- **SCSS** - Sass variables
- **JS** - JavaScript objects
- **JSON** - Structured data
- **Tailwind** - Tailwind config format

## Related

- **Enables:** design-system-architect skill
- **Use case:** Design systems, theming, brand consistency
