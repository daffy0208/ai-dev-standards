# Icon Library MCP Server

MCP server providing icon search and retrieval across multiple icon libraries (Heroicons, Lucide, Font Awesome).

## Features

- Search icons across multiple libraries
- Get SVG content for specific icons
- Support for multiple icon variants
- Resource listing all available libraries

## Tools

### searchIcons

Search for icons by name across libraries.

**Arguments:**
- `query` (string, required): Search query for icon name or keywords
- `library` (string, optional): Icon library to search ('heroicons', 'lucide', 'font-awesome', 'all')
- `limit` (number, optional): Maximum results (default: 20)

**Returns:**
```json
{
  "success": true,
  "query": "arrow",
  "library": "all",
  "total": 12,
  "icons": [
    {
      "name": "arrow-right",
      "displayName": "Arrow Right",
      "library": "heroicons"
    }
  ]
}
```

### getIconSvg

Get SVG content for a specific icon.

**Arguments:**
- `name` (string, required): Icon name (kebab-case)
- `library` (string, required): Icon library
- `variant` (string, optional): Icon variant (e.g., 'outline', 'solid')
- `size` (number, optional): Icon size in pixels (default: 24)

**Returns:**
```json
{
  "success": true,
  "name": "arrow-right",
  "library": "heroicons",
  "variant": "outline",
  "size": 24,
  "svg": "<svg>...</svg>",
  "url": "https://..."
}
```

## Resources

### icon-collections

URI: `icon://collections`

Lists all available icon libraries with metadata.

## Usage

```bash
# Start server
node index.ts
```

## Supported Skills

- visual-designer
- frontend-builder
- brand-designer
- ux-designer

## License

MIT
