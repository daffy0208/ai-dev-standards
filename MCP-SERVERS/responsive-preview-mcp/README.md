# Responsive Preview MCP Server

Preview and test responsive designs across device breakpoints with pre-configured device presets.

## Features

- Preview at specific breakpoints
- Capture all breakpoints
- Compare URLs side-by-side
- 12 device presets (mobile, tablet, desktop)

## Tools

| Tool                      | Description               |
| ------------------------- | ------------------------- |
| `preview_at_breakpoint`   | Preview URL at breakpoint |
| `capture_all_breakpoints` | Capture all breakpoints   |
| `compare_breakpoints`     | Compare two URLs          |

## Resources

| Resource            | Description         |
| ------------------- | ------------------- |
| `devices://presets` | Common device sizes |

## Supported Skills

- `frontend-builder` - Test responsive layouts
- `ux-designer` - Preview across devices

## Device Presets

**Mobile:**

- iPhone SE (375x667)
- iPhone 12/13/14 (390x844)
- iPhone 14 Pro Max (430x932)
- Samsung Galaxy S21 (360x800)

**Tablet:**

- iPad Mini (768x1024)
- iPad Pro 11" (834x1194)
- iPad Pro 12.9" (1024x1366)

**Desktop:**

- MacBook Air (1280x800)
- MacBook Pro 14" (1512x982)
- Desktop HD (1920x1080)
- Desktop 4K (3840x2160)

## Example Usage

```typescript
// Preview at breakpoint
{ "url": "https://example.com", "breakpoint": "iPhone 14" }

// Capture all
{ "url": "https://example.com" }

// Compare
{ "url1": "https://v1.example.com", "url2": "https://v2.example.com", "breakpoint": "iPad Pro 11\"" }
```

## Integration

For actual screenshot capture, integrate with Playwright or Puppeteer.

## Running

```bash
npm install && npm run build && npm start
```
