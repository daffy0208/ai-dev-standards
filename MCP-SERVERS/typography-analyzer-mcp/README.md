# Typography Analyzer MCP Server

Analyze typography usage, suggest type scales, and check readability metrics for accessible design.

## Features

- Analyze typography in CSS files
- Detect font usage across projects
- Suggest harmonious type scales
- Check readability metrics
- Typography best practices resource

## Tools

| Tool | Description |
|------|-------------|
| `analyze_typography` | Analyze typography usage in CSS |
| `detect_font_usage` | Detect all fonts used in project |
| `suggest_type_scale` | Generate harmonious type scale |
| `check_readability` | Check text readability metrics |

## Resources

| Resource | Description |
|----------|-------------|
| `typography://best-practices` | Typography guidelines |

## Supported Skills

- `visual-designer` - Typography and type scales
- `accessibility-engineer` - Readability and WCAG compliance

## Type Scale Ratios

- Minor Second: 1.067
- Major Second: 1.125
- Minor Third: 1.2
- Major Third: 1.25
- Perfect Fourth: 1.333
- Perfect Fifth: 1.5
- Golden Ratio: 1.618

## Readability Guidelines

**Line Height:**
- Body text: 1.5 - 1.8
- Headings: 1.2 - 1.5

**Line Length:**
- Ideal: 66 characters
- Range: 45-75 characters

**Font Size:**
- Minimum body text: 16px

## Example Usage

```typescript
// Analyze typography
{
  "cssFiles": ["./src/styles/global.css", "./src/styles/typography.css"]
}

// Detect fonts
{
  "projectPath": "./src"
}

// Suggest type scale
{
  "currentSizes": [12, 14, 16, 20, 24, 32],
  "ratio": "majorThird"
}

// Check readability
{
  "fontSize": 16,
  "lineHeight": 1.6,
  "lineLength": 66
}
```

## Running

```bash
npm install
npm run build
npm start
```
