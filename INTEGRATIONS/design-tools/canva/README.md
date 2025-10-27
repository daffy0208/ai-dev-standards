# Canva Integration

Complete Canva Connect API integration for programmatic design access and brand management.

## Features

- ✅ **Design Access** - Get and list Canva designs
- ✅ **Design Creation** - Create designs from templates
- ✅ **Export** - Export designs in multiple formats (PNG, PDF, SVG, etc.)
- ✅ **Brand Kit** - Access brand colors, fonts, and logos
- ✅ **Folders** - Organize designs in folders
- ✅ **CSS/JSON Export** - Export brand assets as code

---

## Setup

### 1. Get API Access

1. Go to [Canva Developer Portal](https://www.canva.dev/)
2. Create an app
3. Get your API credentials
4. Enable required scopes:
   - `design:read`
   - `design:write`
   - `brandkit:read`
   - `folder:read`
   - `folder:write`

### 2. OAuth Setup

```typescript
// Redirect user to Canva authorization
const authUrl = `https://www.canva.com/api/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=design:read design:write brandkit:read&response_type=code`

// Exchange code for token
const tokenResponse = await fetch('https://api.canva.com/oauth/token', {
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

const { access_token } = await tokenResponse.json()
```

### 3. Environment Variables

```bash
CANVA_ACCESS_TOKEN=your-access-token
CANVA_CLIENT_ID=your-client-id
CANVA_CLIENT_SECRET=your-client-secret
```

---

## Usage

### Get Design

```typescript
import { CanvaClient } from './client'

const client = new CanvaClient({
  accessToken: process.env.CANVA_ACCESS_TOKEN
})

const design = await client.getDesign('design-id')

console.log('Title:', design.title)
console.log('Size:', `${design.width}x${design.height}`)
console.log('Pages:', design.pages)
console.log('Edit URL:', design.urls.edit_url)
```

### List Designs

```typescript
const result = await client.listDesigns({
  limit: 20
})

for (const design of result.designs) {
  console.log(`${design.title} - ${design.updated_at}`)
}

// Pagination
if (result.continuation) {
  const nextPage = await client.listDesigns({
    limit: 20,
    continuation: result.continuation
  })
}
```

### Create Design

```typescript
// Create blank design
const design = await client.createDesign({
  title: 'My Design',
  width: 1920,
  height: 1080
})

console.log('Created:', design.id)
console.log('Edit URL:', design.urls.edit_url)

// Create from template
const templatedDesign = await client.createDesign({
  title: 'From Template',
  template_id: 'template-id'
})
```

---

## Export Designs

### Export as PNG

```typescript
// Start export
const exportResult = await client.exportDesign('design-id', {
  format: 'png',
  quality: 'high'
})

console.log('Export started:', exportResult.id)

// Wait for completion
const completed = await client.waitForExport(exportResult.id)

console.log('Download URL:', completed.url)

// Download the file
const response = await fetch(completed.url)
const buffer = await response.arrayBuffer()
await fs.writeFile('design.png', Buffer.from(buffer))
```

### Export and Wait (Convenience Method)

```typescript
const result = await client.exportDesignAndWait('design-id', {
  format: 'png',
  quality: 'high'
})

console.log('Ready to download:', result.url)
```

### Export Multiple Formats

```typescript
const formats = ['png', 'pdf', 'jpg'] as const

for (const format of formats) {
  const result = await client.exportDesignAndWait('design-id', {
    format,
    quality: 'high'
  })

  const response = await fetch(result.url)
  const buffer = await response.arrayBuffer()
  await fs.writeFile(`design.${format}`, Buffer.from(buffer))
}
```

### Export Specific Pages

```typescript
// Export pages 1 and 3
const result = await client.exportDesignAndWait('design-id', {
  format: 'pdf',
  pages: [1, 3]
})

// Export all pages
const allPages = await client.exportDesignAndWait('design-id', {
  format: 'pdf',
  pages: 'all'
})
```

---

## Brand Kit

### Get Brand Kit

```typescript
const brandKit = await client.getBrandKit()

console.log('Brand:', brandKit.name)
console.log('Colors:', brandKit.colors.length)
console.log('Fonts:', brandKit.fonts.length)
console.log('Logos:', brandKit.logos.length)
```

### Get Brand Colors

```typescript
const colors = await client.getBrandColors()

for (const color of colors) {
  console.log(`${color.name}: ${color.hex}`)
}
```

### Get Brand Fonts

```typescript
const fonts = await client.getBrandFonts()

for (const font of fonts) {
  console.log(`${font.name}: ${font.family} ${font.weight}`)
}
```

### Get Brand Logos

```typescript
const logos = await client.getBrandLogos()

for (const logo of logos) {
  console.log(`${logo.name}: ${logo.url}`)

  // Download logo
  const response = await fetch(logo.url)
  const buffer = await response.arrayBuffer()
  await fs.writeFile(`${logo.name}.png`, Buffer.from(buffer))
}
```

---

## Export Brand Assets

### Export Brand Colors as CSS

```typescript
const css = await client.exportBrandColorsAsCSS()

await fs.writeFile('brand-colors.css', css)
```

**Output:**

```css
:root {
  /* Brand Colors */
  --color-primary: #0066cc;
  --color-secondary: #10b981;
  --color-accent: #f59e0b;
}
```

### Export Brand Fonts as CSS

```typescript
const css = await client.exportBrandFontsAsCSS()

await fs.writeFile('brand-fonts.css', css)
```

**Output:**

```css
:root {
  /* Brand Fonts */
  --font-heading-family: Inter;
  --font-heading-weight: 700;
  --font-heading-style: normal;

  --font-body-family: Open Sans;
  --font-body-weight: 400;
  --font-body-style: normal;
}
```

### Export Brand Kit as JSON

```typescript
const json = await client.exportBrandKitAsJSON()

await fs.writeFile('brand-kit.json', json)
```

---

## Folders

### List Folders

```typescript
const folders = await client.listFolders()

for (const folder of folders) {
  console.log(`${folder.name} (${folder.items_count} items)`)
}
```

### Create Folder

```typescript
const folder = await client.createFolder('Marketing Materials')

console.log('Folder created:', folder.id)
```

### List Designs in Folder

```typescript
const result = await client.listDesigns({
  folder_id: 'folder-id',
  limit: 20
})

console.log(`${result.designs.length} designs in folder`)
```

---

## Common Patterns

### Sync Brand Colors

```typescript
async function syncBrandColors() {
  const client = new CanvaClient()

  // Export as CSS
  const css = await client.exportBrandColorsAsCSS()
  await fs.writeFile('src/styles/brand-colors.css', css)

  // Export as JSON
  const json = await client.exportBrandKitAsJSON()
  await fs.writeFile('src/styles/brand-kit.json', json)

  console.log('Brand colors synced!')
}
```

### Batch Export Designs

```typescript
async function exportAllDesigns(folderName: string) {
  const client = new CanvaClient()

  // Get folder
  const folders = await client.listFolders()
  const folder = folders.find(f => f.name === folderName)

  if (!folder) {
    throw new Error(`Folder not found: ${folderName}`)
  }

  // Get designs in folder
  const result = await client.listDesigns({
    folder_id: folder.id
  })

  // Export each design
  for (const design of result.designs) {
    console.log(`Exporting: ${design.title}`)

    const exportResult = await client.exportDesignAndWait(design.id, {
      format: 'png',
      quality: 'high'
    })

    const response = await fetch(exportResult.url)
    const buffer = await response.arrayBuffer()
    await fs.writeFile(`exports/${design.title}.png`, Buffer.from(buffer))
  }

  console.log(`Exported ${result.designs.length} designs`)
}
```

### Auto-generate Social Media Graphics

```typescript
async function generateSocialGraphic(text: string, templateId: string) {
  const client = new CanvaClient()

  // Create design from template
  const design = await client.createDesign({
    title: `Social - ${text}`,
    template_id: templateId
  })

  // Note: Canva API doesn't support text replacement yet
  // You'll need to manually edit or use Canva's autofill features

  console.log('Edit design:', design.urls.edit_url)

  // Wait for manual editing, then export
  // In production, you could poll for updates or use webhooks
}
```

---

## Finding IDs

### Design ID

From Canva URL:
```
https://www.canva.com/design/ABC123XYZ/edit
                          ^^^^^^^^^
                          Design ID
```

### Template ID

Templates are provided by Canva or can be created as reusable designs.

---

## Error Handling

```typescript
try {
  const design = await client.getDesign('invalid-id')
} catch (error) {
  if (error.message.includes('404')) {
    console.error('Design not found')
  } else if (error.message.includes('401')) {
    console.error('Invalid access token')
  } else if (error.message.includes('403')) {
    console.error('Access denied - check scopes')
  } else {
    console.error('Error:', error.message)
  }
}
```

---

## Rate Limits

Canva API rate limits:
- **100 requests per minute**
- **1000 requests per hour**

Handle rate limits:

```typescript
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.message.includes('429') && i < 2) {
        await new Promise(resolve => setTimeout(resolve, 5000))
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

### 1. Limited Design Manipulation

- Cannot programmatically edit text/images in designs
- Must use Canva editor or autofill features
- API is primarily for access and export

### 2. OAuth Required

- All API access requires OAuth 2.0
- User must authorize your app
- Tokens expire and need refresh

### 3. Template Access

- Public templates not directly accessible
- Must create own templates or use team templates

### 4. Export Processing Time

- Exports are asynchronous
- Can take 10-30 seconds for complex designs
- Must poll for completion

---

## Comparison with Other Tools

| Feature | Canva | Figma | Adobe XD |
|---------|-------|-------|----------|
| Target Audience | Everyone | Designers | Designers |
| API Complexity | Simple | Medium | Complex |
| Export Formats | Many | Limited | Medium |
| Design Control | Limited | Full | Medium |
| Templates | Extensive | Limited | Medium |

---

## Use Cases

### Perfect For:
- Automated social media graphics
- Marketing material generation
- Brand asset distribution
- Design exports for websites
- Non-technical users creating designs

### Not Ideal For:
- Complex design programmatic manipulation
- Component-based design systems
- Developer handoff workflows
- Version control

---

## OAuth Implementation

```typescript
import express from 'express'

const app = express()

app.get('/auth/canva', (req, res) => {
  const authUrl = new URL('https://www.canva.com/api/oauth/authorize')
  authUrl.searchParams.set('client_id', process.env.CANVA_CLIENT_ID!)
  authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/auth/callback')
  authUrl.searchParams.set('scope', 'design:read design:write brandkit:read')
  authUrl.searchParams.set('response_type', 'code')

  res.redirect(authUrl.toString())
})

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string

  const tokenResponse = await fetch('https://api.canva.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CANVA_CLIENT_ID!,
      client_secret: process.env.CANVA_CLIENT_SECRET!,
      code,
      redirect_uri: 'http://localhost:3000/auth/callback'
    })
  })

  const tokens = await tokenResponse.json()
  // Store tokens.access_token, tokens.refresh_token

  res.send('Authenticated!')
})

app.listen(3000)
```

---

## Troubleshooting

### Invalid Access Token
Check token expiry. Implement refresh token flow.

### Design Not Found
Ensure design ID is correct and user has access.

### Export Timeout
Increase `maxWaitTime` in `waitForExport()`.

### Missing Brand Assets
Ensure brand kit is set up in Canva account settings.

---

## Resources

- [Canva Developers](https://www.canva.dev/)
- [Canva Connect API Docs](https://www.canva.dev/docs/connect/)
- [OAuth Guide](https://www.canva.dev/docs/connect/authentication/)
- [API Reference](https://www.canva.dev/docs/connect/api-reference/)

---

**Automate Canva design workflows** 🎨
