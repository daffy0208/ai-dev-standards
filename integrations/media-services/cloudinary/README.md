# Cloudinary Integration

Complete TypeScript client for Cloudinary image and video management.

## Features

- Image upload with automatic optimization
- URL-based transformations (resize, crop, format, quality)
- Cloud storage with CDN delivery
- Video and raw file upload support
- Advanced transformations (effects, overlays, face detection)
- Asset management and organization

## Installation

```bash
npm install
```

## Environment Variables

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage

### Initialize Client

```typescript
import { CloudinaryClient, createCloudinaryClient } from './client'

// From environment variables
const client = createCloudinaryClient()

// Or with explicit options
const client = new CloudinaryClient({
  cloudName: 'your_cloud_name',
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret'
})
```

### Upload Images

```typescript
// Upload from buffer
const result = await client.upload({
  file: imageBuffer,
  folder: 'products',
  publicId: 'product-123',
  tags: ['ecommerce', 'featured']
})

// Upload from URL
const result = await client.upload({
  file: 'https://example.com/image.jpg',
  folder: 'imported',
  useFilename: true
})

// Upload with transformation
const result = await client.upload({
  file: imageBuffer,
  transformation: {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  }
})
```

### Generate URLs

```typescript
// Basic URL
const url = client.url('product-123')

// Optimized URL with transformations
const url = client.url('product-123', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'auto',
  fetchFormat: 'auto'
})

// Thumbnail with face detection
const thumbnail = client.url('portrait-photo', {
  width: 200,
  height: 200,
  crop: 'thumb',
  gravity: 'face'
})

// Responsive images
const responsive = client.responsive('product-123', {
  widths: [320, 640, 1024, 1920],
  baseOptions: {
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  }
})

// Returns array of URLs with widths
responsive.forEach(({ url, width }) => {
  console.log(`${width}w: ${url}`)
})
```

### Advanced Transformations

```typescript
// Add effects
const url = client.url('photo', {
  effect: 'blur:300',
  quality: 'auto'
})

// Rounded corners
const url = client.url('avatar', {
  width: 200,
  height: 200,
  crop: 'fill',
  radius: 'max' // Circular
})

// Overlay text or image
const url = client.url('base-image', {
  overlay: 'text:Arial_60:Hello%20World',
  gravity: 'north'
})

// Multiple transformations
const url = client.url('product', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto:best',
  format: 'auto',
  dpr: 'auto',
  flags: ['progressive', 'lossy']
})
```

### Delete Assets

```typescript
// Delete image
const result = await client.delete({
  publicId: 'product-123',
  invalidate: true // Invalidate CDN cache
})

// Delete video
const result = await client.delete({
  publicId: 'video-id',
  resourceType: 'video'
})
```

## Transformation Options

### Resize & Crop

- `width`, `height`: Dimensions in pixels
- `crop`: `scale`, `fit`, `fill`, `limit`, `pad`, `crop`, `thumb`
- `aspectRatio`: Target aspect ratio (e.g., `16:9`)
- `gravity`: Focus point - `auto`, `face`, `center`, etc.

### Quality & Format

- `quality`: `1-100`, `auto`, `auto:best`, `auto:good`, `auto:eco`, `auto:low`
- `format`: `jpg`, `png`, `webp`, `avif`, `auto`
- `dpr`: Device pixel ratio (`1`, `2`, `auto`)

### Effects & Styling

- `effect`: Apply effects (e.g., `blur:300`, `grayscale`, `sepia`)
- `background`: Background color for padding
- `border`: Border around image
- `radius`: Rounded corners (pixels or `max` for circle)
- `angle`: Rotation angle
- `opacity`: Transparency (0-100)

### Overlays

- `overlay`: Add text or image overlay
- Combine with `gravity` for positioning

### Flags

- `progressive`: Progressive JPEG
- `lossy`: Allow lossy compression for PNG/GIF
- `strip_profile`: Remove metadata
- `preserve_transparency`: Keep PNG transparency

## Best Practices

### Optimization

```typescript
// Automatic format and quality
const optimized = client.url('image', {
  quality: 'auto',
  format: 'auto',
  fetchFormat: 'auto'
})

// Responsive with DPR
const responsive = client.url('image', {
  width: 800,
  crop: 'scale',
  dpr: 'auto',
  quality: 'auto'
})
```

### Face Detection

```typescript
// Thumbnail focused on faces
const thumbnail = client.url('group-photo', {
  width: 300,
  height: 300,
  crop: 'thumb',
  gravity: 'faces'
})

// Auto-crop to faces
const cropped = client.url('portrait', {
  width: 500,
  height: 500,
  crop: 'fill',
  gravity: 'auto:faces'
})
```

### Progressive Loading

```typescript
// Low-quality placeholder
const placeholder = client.url('image', {
  width: 50,
  quality: 'auto:low',
  format: 'auto'
})

// Full-quality image
const fullImage = client.url('image', {
  width: 1200,
  quality: 'auto',
  format: 'auto',
  flags: ['progressive']
})
```

## Error Handling

```typescript
try {
  const result = await client.upload({
    file: imageBuffer,
    folder: 'products'
  })
  console.log('Upload successful:', result.secureUrl)
} catch (error) {
  console.error('Upload failed:', error.message)
}
```

## API Reference

### `CloudinaryClient`

#### Constructor

```typescript
new CloudinaryClient(options: CloudinaryClientOptions)
```

#### Methods

- `upload(options: UploadOptions): Promise<UploadResponse>`
- `url(publicId: string, options?: TransformOptions): string`
- `delete(options: DeleteOptions): Promise<DeleteResponse>`
- `responsive(publicId: string, options): Array<{url, width}>`

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Optimization Best Practices](https://cloudinary.com/documentation/image_optimization)
