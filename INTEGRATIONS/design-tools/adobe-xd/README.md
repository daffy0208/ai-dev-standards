# Adobe XD Integration

Complete Adobe XD Cloud API integration for accessing design documents and assets.

## Features

- ✅ **Document Access** - Get XD cloud documents
- ✅ **Artboards** - Access artboards and nodes
- ✅ **Asset Export** - Export artboards as images
- ✅ **Components** - Get component definitions
- ✅ **Design Tokens** - Extract colors and typography
- ✅ **Shared Links** - Create collaborative links
- ✅ **CSS/JSON Export** - Export tokens

---

## Setup

### 1. Get Adobe Access Token

1. Go to [Adobe Developer Console](https://console.adobe.io/)
2. Create a new project or select existing
3. Add "XD API" to your project
4. Generate OAuth 2.0 credentials
5. Get access token using OAuth flow

### 2. Environment Variables

```bash
ADOBE_ACCESS_TOKEN=eyJ...
ADOBE_API_KEY=your-api-key
```

### 3. OAuth Setup

```typescript
// OAuth flow (simplified)
const authUrl = `https://ims-na1.adobelogin.com/ims/authorize/v2?client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid,creative_sdk&response_type=code`

// Exchange code for token
const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code: authCode,
    redirect_uri: redirectUri
  })
})
```

---

## Usage

### Get Document

```typescript
import { AdobeXDClient } from './client'

const client = new AdobeXDClient({
  accessToken: process.env.ADOBE_ACCESS_TOKEN
})

const document = await client.getDocument('doc-id')

console.log('Document:', document.name)
console.log('Artboards:', document.artboards.length)
console.log('Colors:', document.colors.length)
console.log('Components:', document.components.length)
```

### Get Artboards

```typescript
const artboards = await client.getArtboards('doc-id')

for (const artboard of artboards) {
  console.log(`${artboard.name}: ${artboard.width}x${artboard.height}`)
}
```

### Export Artboard

```typescript
const rendition = await client.exportArtboard(
  'doc-id',
  'artboard-id',
  {
    format: 'png',
    scale: 2,
    quality: 100
  }
)

console.log('Download URL:', rendition.url)

// Download the image
const response = await fetch(rendition.url)
const buffer = await response.arrayBuffer()
await fs.writeFile(`${rendition.name}.png`, Buffer.from(buffer))
```

### Export Multiple Artboards

```typescript
const artboards = await client.getArtboards('doc-id')
const artboardIds = artboards.map(a => a.id)

const renditions = await client.exportArtboards('doc-id', artboardIds, {
  format: 'png',
  scale: 2
})

for (const rendition of renditions) {
  console.log(`${rendition.name}: ${rendition.url}`)
}
```

---

## Design Tokens

### Extract Tokens

```typescript
const tokens = await client.extractDesignTokens('doc-id')

console.log('Colors:', tokens.colors)
// [
//   {
//     name: 'Primary',
//     value: '#0066cc',
//     rgba: { r: 0, g: 0.4, b: 0.8, a: 1 }
//   }
// ]

console.log('Typography:', tokens.typography)
// [
//   {
//     name: 'Heading',
//     fontFamily: 'SF Pro Display',
//     fontSize: 48,
//     fontWeight: 'Bold'
//   }
// ]
```

### Export as CSS

```typescript
const css = await client.exportTokensAsCSS('doc-id')

await fs.writeFile('tokens.css', css)
```

**Output:**

```css
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-secondary: #10b981;

  /* Typography */
  --font-heading-family: SF Pro Display;
  --font-heading-size: 48px;
  --font-heading-weight: Bold;
}
```

### Export as JSON

```typescript
const json = await client.exportTokensAsJSON('doc-id')

await fs.writeFile('tokens.json', json)
```

---

## Components

### Get All Components

```typescript
const components = await client.getComponents('doc-id')

for (const component of components) {
  console.log(`${component.name}:`)
  console.log(`  Description: ${component.description}`)
  console.log(`  Published: ${component.isPublished}`)
}
```

---

## Colors

### Get Color Assets

```typescript
const colors = await client.getColors('doc-id')

for (const color of colors) {
  const hex = rgbaToHex(color)
  console.log(`${color.name || 'Unnamed'}: ${hex}`)
}

function rgbaToHex(color: any): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0')
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0')
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}
```

---

## Typography

### Get Character Styles

```typescript
const styles = await client.getCharacterStyles('doc-id')

for (const style of styles) {
  console.log(`${style.name}:`)
  console.log(`  Font: ${style.fontFamily} ${style.fontStyle}`)
  console.log(`  Size: ${style.fontSize}px`)
  console.log(`  Line Spacing: ${style.lineSpacing}`)
}
```

---

## Sharing

### Create Shared Link

```typescript
const link = await client.createSharedLink('doc-id', {
  accessLevel: 'view',
  allowComments: true,
  expiresAt: '2024-12-31T23:59:59Z'
})

console.log('Share URL:', link.url)
console.log('Link ID:', link.id)
```

**Access Levels:**
- `view` - View only (default)
- `edit` - Can edit (requires permissions)

---

## Common Patterns

### Sync Design Tokens

```typescript
async function syncDesignTokens(documentId: string) {
  const client = new AdobeXDClient()

  // Export as CSS
  const css = await client.exportTokensAsCSS(documentId)
  await fs.writeFile('src/styles/design-tokens.css', css)

  // Export as JSON
  const json = await client.exportTokensAsJSON(documentId)
  await fs.writeFile('src/styles/design-tokens.json', json)

  console.log('Design tokens synced!')
}
```

### Export All Artboards

```typescript
async function exportAllArtboards(documentId: string) {
  const client = new AdobeXDClient()
  const artboards = await client.getArtboards(documentId)

  const artboardIds = artboards.map(a => a.id)

  const renditions = await client.exportArtboards(documentId, artboardIds, {
    format: 'png',
    scale: 2
  })

  // Download all
  for (const rendition of renditions) {
    const response = await fetch(rendition.url)
    const buffer = await response.arrayBuffer()
    await fs.writeFile(`exports/${rendition.name}.png`, Buffer.from(buffer))
  }

  console.log(`Exported ${renditions.length} artboards`)
}
```

---

## Finding Document IDs

### From XD Cloud URL

```
https://xd.adobe.com/view/abc-123-def/
                          ^^^^^^^^^^^
                          Document ID
```

### From Share Link

```
https://xd.adobe.com/view/abc-123-def/screen/xyz
                          ^^^^^^^^^^^
                          Document ID
```

---

## Error Handling

```typescript
try {
  const document = await client.getDocument('invalid-id')
} catch (error) {
  if (error.message.includes('404')) {
    console.error('Document not found')
  } else if (error.message.includes('401')) {
    console.error('Invalid access token')
  } else if (error.message.includes('403')) {
    console.error('Access denied')
  } else {
    console.error('Error:', error.message)
  }
}
```

---

## Rate Limits

Adobe XD API has rate limits:
- **100 requests per minute** per user
- **1000 requests per hour** per user

Handle rate limits:

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## Limitations

### 1. Cloud Documents Only

- Only works with documents saved to Creative Cloud
- Local .xd files not accessible via API

### 2. Limited Export Formats

- Supported: PNG, JPG, SVG, PDF
- No direct access to raw design data

### 3. Authentication Complexity

- Requires OAuth 2.0 flow
- Access tokens expire (typically 24 hours)
- Refresh tokens needed for long-running apps

### 4. API Coverage

- Not all XD features exposed via API
- Some advanced effects may not be accessible
- Plugin APIs separate from Cloud APIs

---

## Comparison with Other Tools

| Feature | Adobe XD | Figma | Sketch |
|---------|----------|-------|--------|
| File Access | Cloud only | Cloud | Local |
| Export | API | API | CLI required |
| Auth | OAuth 2.0 | Access token | N/A |
| Real-time | No | Yes | No |
| Platform | Cross-platform | Web/Desktop | macOS only |

---

## OAuth 2.0 Implementation

### Full OAuth Flow

```typescript
import express from 'express'

const app = express()

// Step 1: Redirect to Adobe login
app.get('/auth/adobe', (req, res) => {
  const authUrl = new URL('https://ims-na1.adobelogin.com/ims/authorize/v2')
  authUrl.searchParams.set('client_id', process.env.ADOBE_CLIENT_ID!)
  authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/auth/callback')
  authUrl.searchParams.set('scope', 'openid,creative_sdk')
  authUrl.searchParams.set('response_type', 'code')

  res.redirect(authUrl.toString())
})

// Step 2: Handle callback and exchange code for token
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string

  const tokenResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ADOBE_CLIENT_ID!,
      client_secret: process.env.ADOBE_CLIENT_SECRET!,
      code,
      redirect_uri: 'http://localhost:3000/auth/callback'
    })
  })

  const tokens = await tokenResponse.json()

  // Store tokens securely
  // tokens.access_token, tokens.refresh_token

  res.send('Authenticated!')
})

app.listen(3000)
```

---

## Troubleshooting

### Invalid Access Token
Ensure token is not expired. Implement refresh token flow.

### Document Not Found
Check document ID and ensure it's saved to Creative Cloud.

### Export URLs Expire
Rendition URLs are temporary. Download immediately.

### Missing Resources
Ensure colors/styles are saved as document assets.

---

## Resources

- [Adobe XD API Docs](https://developer.adobe.com/xd/docs/)
- [Adobe Developer Console](https://console.adobe.io/)
- [OAuth 2.0 Guide](https://developer.adobe.com/developer-console/docs/guides/authentication/)
- [Adobe XD Plugin API](https://developer.adobe.com/xd/docs/plugins/)

---

**Access Adobe XD designs programmatically** 🎨
