# Asset Library MCP Server

Manage design assets with searchable catalog, optimization, and variant generation.

## Features
- Add assets to searchable library
- Search by query, type, and tags
- Optimize assets (compression, format)
- Generate size/format variants

## Tools
| Tool | Description |
|------|-------------|
| `add_asset` | Add asset to library |
| `search_assets` | Search assets by query/filters |
| `optimize_asset` | Optimize asset file |
| `generate_variants` | Generate size variants |

## Resources
| Resource | Description |
|----------|-------------|
| `assets://catalog` | Searchable asset catalog |

## Supported Skills
- `visual-designer` - Manage design assets
- `frontend-builder` - Image optimization

## Example Usage
```typescript
// Add asset
{ "filePath": "./logo.svg", "tags": ["logo", "brand"], "metadata": { "author": "Designer" } }

// Search
{ "query": "logo", "filters": { "type": "svg", "tags": ["brand"] } }

// Generate variants
{ "assetId": "uuid", "sizes": [{ "width": 32, "height": 32, "name": "sm" }] }
```

## Running
```bash
npm install && npm run build && npm start
```
