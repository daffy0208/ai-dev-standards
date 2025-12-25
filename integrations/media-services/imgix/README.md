# Imgix Integration

Complete TypeScript client for Imgix real-time image processing and optimization.

## Features

- Real-time image processing via URL parameters
- Format conversion (WebP, AVIF, auto)
- Responsive images with srcset generation
- Advanced transformations (crop, resize, effects)
- Device pixel ratio support
- Lazy loading and blur-up placeholders
- Secure URL signing

## Installation

```bash
npm install
```

## Environment Variables

```bash
IMGIX_DOMAIN=your-domain.imgix.net
IMGIX_TOKEN=your_secure_token # Optional, for signed URLs
```

## Usage

### Initialize Client

```typescript
import { ImgixClient, createImgixClient } from './client'

// From environment variables
const client = createImgixClient()

// Or with explicit options
const client = new ImgixClient({
  domain: 'your-domain.imgix.net',
  secureUrlToken: 'your_token', // Optional
  useHttps: true
})
```

### Basic URL Generation

```typescript
// Simple URL
const url = client.buildUrl('path/to/image.jpg')

// With transformations
const url = client.buildUrl('image.jpg', {
  w: 800,
  h: 600,
  fit: 'crop',
  auto: 'format,compress'
})
```

### Responsive Images

```typescript
// Generate srcset
const srcset = client.buildSrcSet('image.jpg', {
  w: 1200,
  fit: 'crop',
  auto: 'format,compress'
})

// Returns: "https://domain.imgix.net/image.jpg?w=100... 100w, ..."

// Custom widths
const srcset = client.buildSrcSet(
  'image.jpg',
  { fit: 'crop' },
  {
    widths: [320, 640, 1024, 1920]
  }
)

// DPR-based srcset
const srcset = client.buildSrcSet(
  'image.jpg',
  { w: 800 },
  {
    devicePixelRatios: [1, 2, 3]
  }
)
```

### Format Conversion

```typescript
// Auto format selection
const url = client.buildUrl('image.jpg', {
  auto: 'format'
})

// Specific format
const webp = client.buildUrl('image.jpg', {
  fm: 'webp',
  q: 85
})

// All formats
const formats = client.buildFormatUrls('image.jpg', {
  w: 800,
  h: 600
})

console.log(formats.webp) // WebP URL
console.log(formats.avif) // AVIF URL
console.log(formats.jpg) // JPG URL
console.log(formats.png) // PNG URL
```

### Blur Placeholders

```typescript
// Generate low-quality placeholder
const placeholder = client.buildPlaceholder('image.jpg')

// Custom placeholder
const placeholder = client.buildUrl('image.jpg', {
  w: 64,
  blur: 200,
  q: 30,
  auto: 'format,compress'
})
```

### Crop & Resize

```typescript
// Fit modes
const crop = client.buildUrl('image.jpg', {
  w: 800,
  h: 600,
  fit: 'crop' // Fill area, crop excess
})

const scale = client.buildUrl('image.jpg', {
  w: 800,
  h: 600,
  fit: 'scale' // Exact dimensions, may distort
})

const max = client.buildUrl('image.jpg', {
  w: 800,
  h: 600,
  fit: 'max' // Fit within bounds
})

// Smart crop with face detection
const faces = client.buildUrl('portrait.jpg', {
  w: 400,
  h: 400,
  fit: 'facearea'
})

// Crop modes
const topCrop = client.buildUrl('image.jpg', {
  w: 800,
  h: 600,
  fit: 'crop',
  crop: 'top'
})

const facesCrop = client.buildUrl('group.jpg', {
  w: 800,
  h: 600,
  fit: 'crop',
  crop: 'faces'
})
```

### Effects & Filters

```typescript
// Blur
const blur = client.buildUrl('image.jpg', {
  blur: 100
})

// Brightness, contrast, saturation
const adjusted = client.buildUrl('image.jpg', {
  bri: 20, // Brightness
  con: 10, // Contrast
  sat: -20 // Saturation
})

// Sharpen
const sharp = client.buildUrl('image.jpg', {
  sharp: 50
})

// Rotation
const rotated = client.buildUrl('image.jpg', {
  rot: 90
})

// Flip
const flipped = client.buildUrl('image.jpg', {
  flip: 'h' // horizontal
})
```

### Overlays & Watermarks

```typescript
// Text overlay
const withText = client.buildUrl('image.jpg', {
  txt: 'Hello World',
  'txt-font': 'Helvetica',
  'txt-size': 48,
  'txt-color': 'ffffff'
})

// Watermark
const watermarked = client.buildUrl('image.jpg', {
  mark: 'logo.png',
  'mark-align': 'bottom,right',
  'mark-pad': 20
})

// Blend layers
const blended = client.buildUrl('base.jpg', {
  blend: 'overlay.png',
  'blend-mode': 'overlay'
})
```

### Styling

```typescript
// Background color (for padding)
const withBg = client.buildUrl('image.png', {
  w: 800,
  h: 600,
  fit: 'fill',
  bg: 'ffffff'
})

// Border
const withBorder = client.buildUrl('image.jpg', {
  border: '10,ff0000' // 10px red border
})

// Rounded corners
const rounded = client.buildUrl('image.jpg', {
  'corner-radius': 20
})

// Circular
const circular = client.buildUrl('avatar.jpg', {
  w: 200,
  h: 200,
  fit: 'crop',
  'corner-radius': '100'
})
```

## Parameter Reference

### Size & Fit

- `w`: Width in pixels
- `h`: Height in pixels
- `dpr`: Device pixel ratio (1, 2, 3)
- `fit`: Fit mode (`crop`, `scale`, `max`, `min`, etc.)
- `crop`: Crop focus (`faces`, `edges`, `entropy`, etc.)
- `ar`: Aspect ratio (e.g., `16:9`)

### Format & Quality

- `fm`: Format (`jpg`, `png`, `webp`, `avif`)
- `q`: Quality (0-100)
- `auto`: Auto enhancements (`format`, `compress`, `redeye`)
- `lossless`: Lossless compression (boolean)

### Effects

- `blur`: Blur amount (0-2000)
- `bri`: Brightness (-100 to 100)
- `con`: Contrast (-100 to 100)
- `sat`: Saturation (-100 to 100)
- `sharp`: Sharpen (0-100)

### Styling

- `bg`: Background color (hex without #)
- `border`: Border width and color
- `corner-radius`: Corner radius
- `rot`: Rotation (0-359)
- `flip`: Flip (`h`, `v`, `hv`)

### Overlays

- `txt`: Text overlay
- `txt-font`: Font family
- `txt-size`: Font size
- `txt-color`: Text color
- `mark`: Watermark image
- `mark-align`: Watermark position
- `blend`: Blend layer
- `blend-mode`: Blend mode

## Best Practices

### Optimization

```typescript
// Automatic optimization
const optimized = client.buildUrl('image.jpg', {
  auto: 'format,compress',
  q: 85
})

// Responsive with DPR
const responsive = client.buildSrcSet('image.jpg', {
  w: 1200,
  auto: 'format,compress'
})
```

### Progressive Loading

```typescript
// Tiny placeholder
const placeholder = client.buildPlaceholder('image.jpg')

// Full image
const full = client.buildUrl('image.jpg', {
  w: 1920,
  auto: 'format,compress'
})
```

### Responsive Images

```typescript
// Picture element with format support
const formats = client.buildFormatUrls('image.jpg', {
  w: 1200,
  fit: 'crop'
})

const srcset = client.buildSrcSet('image.jpg', {
  fit: 'crop'
})
```

## HTML Examples

### Basic Image

```html
<img
  src="https://domain.imgix.net/image.jpg?w=800&auto=format,compress"
  srcset="
    https://domain.imgix.net/image.jpg?w=400&auto=format,compress   400w,
    https://domain.imgix.net/image.jpg?w=800&auto=format,compress   800w,
    https://domain.imgix.net/image.jpg?w=1200&auto=format,compress 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Description"
  loading="lazy"
/>
```

### Picture Element

```html
<picture>
  <source type="image/avif" srcset="https://domain.imgix.net/image.jpg?w=800&fm=avif" />
  <source type="image/webp" srcset="https://domain.imgix.net/image.jpg?w=800&fm=webp" />
  <img src="https://domain.imgix.net/image.jpg?w=800&fm=jpg" alt="Description" />
</picture>
```

## API Reference

### `ImgixClient`

#### Constructor

```typescript
new ImgixClient(options: ImgixClientOptions)
```

#### Methods

- `buildUrl(path: string, params?: ImgixParams): string`
- `buildSrcSet(path: string, params?: ImgixParams, options?: SrcSetOptions): string`
- `buildPlaceholder(path: string, params?: ImgixParams): string`
- `buildFormatUrls(path: string, params?: ImgixParams): {webp, avif, jpg, png}`

## Resources

- [Imgix Documentation](https://docs.imgix.com/)
- [URL API Reference](https://docs.imgix.com/apis/rendering)
- [Best Practices](https://docs.imgix.com/best-practices)
- [Responsive Images](https://docs.imgix.com/tutorials/responsive-images)
