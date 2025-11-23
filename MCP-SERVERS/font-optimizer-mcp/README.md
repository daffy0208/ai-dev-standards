# Font Optimizer MCP Server

MCP server for font optimization including subsetting, format conversion, and usage analysis.

## Features

- Create font subsets with specific characters
- Convert between font formats
- Analyze font usage in projects
- Generate optimization recommendations

## Tools

### subsetFont

Create a font subset containing only specified characters.

**Arguments:**

- `fontFile` (string, required): Path to input font file
- `characters` (string, required): Characters to include in subset
- `outputFile` (string, optional): Path to output file

**Returns:**

```json
{
  "success": true,
  "inputFile": "font.ttf",
  "outputFile": "font-subset.ttf",
  "characterCount": 52,
  "characters": "ABCabc123...",
  "unicodes": [65, 66, 67, ...]
}
```

### convertFontFormat

Convert font between formats (TTF, WOFF, WOFF2).

**Arguments:**

- `inputFile` (string, required): Path to input font file
- `outputFormat` (string, required): Target format ('ttf', 'woff', 'woff2')
- `outputFile` (string, optional): Path to output file

**Returns:**

```json
{
  "success": true,
  "inputFile": "font.ttf",
  "outputFile": "font.woff2",
  "inputFormat": "ttf",
  "outputFormat": "woff2"
}
```

### analyzeFontUsage

Analyze font usage in HTML/CSS files.

**Arguments:**

- `files` (array, required): Array of file paths to analyze
- `includeStats` (boolean, optional): Include detailed statistics (default: true)

**Returns:**

```json
{
  "success": true,
  "filesAnalyzed": 5,
  "fontFamilies": ["Roboto", "Open Sans"],
  "stats": {
    "totalFamilies": 2,
    "weights": ["400", "700"],
    "styles": ["normal", "italic"],
    "recommendations": [...]
  }
}
```

## Usage

```bash
# Start server
node index.ts
```

## Supported Skills

- visual-designer
- performance-optimizer
- frontend-builder

## License

MIT
