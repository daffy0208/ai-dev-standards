# Unsplash Integration

Complete TypeScript client for Unsplash stock photo search and download.

## Features

- Photo search with advanced filters
- Random photos by category/query
- High-quality image downloads
- User attribution support
- Collection browsing
- Photo statistics and tracking
- Compliant with Unsplash API guidelines

## Installation

```bash
npm install
```

## Environment Variables

```bash
UNSPLASH_ACCESS_KEY=your_access_key
```

## Getting Started

1. Create an account at [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application to get your Access Key
3. Follow [API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)

## Usage

### Initialize Client

```typescript
import { UnsplashClient, createUnsplashClient } from './client'

// From environment variables
const client = createUnsplashClient()

// Or with explicit options
const client = new UnsplashClient({
  accessKey: 'your_access_key',
})
```

### Search Photos

```typescript
// Basic search
const results = await client.search('nature')

// Advanced search
const results = await client.search('mountain', {
  perPage: 20,
  page: 1,
  orientation: 'landscape',
  color: 'blue',
  orderBy: 'relevant',
})

console.log(`Found ${results.total} photos`)
results.results.forEach((photo) => {
  console.log(photo.urls.regular)
  console.log(client.getAttribution(photo))
})
```

### Random Photos

```typescript
// Single random photo
const photo = await client.random()

// Random photo by query
const photo = await client.random({
  query: 'mountain',
  orientation: 'landscape',
})

// Multiple random photos
const photos = await client.random({
  query: 'nature',
  count: 10,
})

// Random from collection
const photo = await client.random({
  collections: '1163637', // Collection ID
})
```

### Get Photo Details

```typescript
// Get photo by ID
const photo = await client.getPhoto('photo-id')

console.log(photo.description)
console.log(photo.user.name)
console.log(photo.urls.regular)
```

### Collections

```typescript
// List collections
const collections = await client.listCollections({
  perPage: 10,
  page: 1,
})

// Get photos from collection
const photos = await client.getCollectionPhotos('collection-id', {
  perPage: 20,
})
```

### Download Photos

```typescript
// Get download URL
const downloadUrl = client.downloadUrl(photo)

// Track download (REQUIRED by Unsplash API)
await client.trackDownload(photo.links.downloadLocation)

// Download photo
const response = await fetch(downloadUrl)
const blob = await response.blob()
```

### Optimized URLs

```typescript
// Get URL with specific size
const url = client.getUrl(photo, {
  size: 'regular', // raw, full, regular, small, thumb
})

// Custom dimensions
const url = client.getUrl(photo, {
  width: 800,
  height: 600,
  crop: true,
  quality: 85,
  format: 'webp',
})
```

### Attribution

```typescript
// Get attribution text
const attribution = client.getAttribution(photo)
// "Photo by John Doe on Unsplash"

// Get attribution HTML (with UTM parameters)
const html = client.getAttributionHtml(photo)
// <a href="...?utm_source=...">John Doe</a> on <a href="...">Unsplash</a>
```

### Photo Statistics

```typescript
// Get photo stats
const stats = await client.getPhotoStats('photo-id')

console.log('Total downloads:', stats.downloads.total)
console.log('Total views:', stats.views.total)
console.log('Total likes:', stats.likes.total)
```

## Search Options

### Filters

```typescript
interface SearchOptions {
  page?: number // Page number (default: 1)
  perPage?: number // Results per page (default: 10, max: 30)
  orderBy?: 'relevant' | 'latest' // Sort order
  color?:
    | 'black_and_white'
    | 'black'
    | 'white'
    | 'yellow'
    | 'orange'
    | 'red'
    | 'purple'
    | 'magenta'
    | 'green'
    | 'teal'
    | 'blue'
  orientation?: 'landscape' | 'portrait' | 'squarish'
  contentFilter?: 'low' | 'high' // Content safety
}
```

### Examples

```typescript
// Landscape photos
const results = await client.search('beach', {
  orientation: 'landscape',
})

// Black and white photos
const results = await client.search('architecture', {
  color: 'black_and_white',
})

// Blue tones
const results = await client.search('ocean', {
  color: 'blue',
})

// Latest photos
const results = await client.search('technology', {
  orderBy: 'latest',
})
```

## Best Practices

### 1. Always Provide Attribution

Unsplash requires attribution for all photos:

```typescript
// Text attribution
console.log(client.getAttribution(photo))

// HTML attribution (recommended)
const html = client.getAttributionHtml(photo)
```

### 2. Track Downloads

When users download photos, track it:

```typescript
// Before downloading
await client.trackDownload(photo.links.downloadLocation)

// Then download
const response = await fetch(client.downloadUrl(photo))
```

### 3. Use UTM Parameters

Include UTM parameters in attribution links:

```typescript
// The getAttributionHtml method includes these automatically
const html = client.getAttributionHtml(photo)
```

### 4. Optimize Images

Use URL parameters to optimize:

```typescript
// Responsive images
const small = client.getUrl(photo, { width: 400 })
const medium = client.getUrl(photo, { width: 800 })
const large = client.getUrl(photo, { width: 1200 })

// WebP format
const webp = client.getUrl(photo, {
  width: 800,
  format: 'webp',
  quality: 85,
})
```

### 5. Handle Errors

```typescript
try {
  const results = await client.search('nature')
} catch (error) {
  console.error('Search failed:', error.message)
}
```

## React Example

```tsx
import { useState, useEffect } from 'react'
import { createUnsplashClient, Photo } from './client'

const client = createUnsplashClient()

function PhotoSearch() {
  const [query, setQuery] = useState('nature')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function search() {
      setLoading(true)
      try {
        const results = await client.search(query, {
          perPage: 20,
          orientation: 'landscape',
        })
        setPhotos(results.results)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query])

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search photos..."
      />

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id}>
            <img
              src={client.getUrl(photo, { width: 400 })}
              alt={photo.altDescription || photo.description || ''}
            />
            <p
              dangerouslySetInnerHTML={{
                __html: client.getAttributionHtml(photo),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## API Limits

- **Demo:** 50 requests per hour
- **Production:** 5,000 requests per hour

[Apply for production access](https://unsplash.com/oauth/applications)

## API Reference

### `UnsplashClient`

#### Constructor

```typescript
new UnsplashClient(options: UnsplashClientOptions)
```

#### Methods

- `search(query: string, options?: SearchOptions): Promise<SearchResponse>`
- `random(options?: RandomOptions): Promise<Photo | Photo[]>`
- `getPhoto(id: string): Promise<Photo>`
- `getPhotoStats(id: string): Promise<PhotoStats>`
- `listCollections(options?): Promise<Collection[]>`
- `getCollectionPhotos(id: string, options?): Promise<Photo[]>`
- `trackDownload(downloadLocation: string): Promise<void>`
- `downloadUrl(photo: Photo | string): string`
- `getUrl(photo: Photo, options?): string`
- `getAttribution(photo: Photo): string`
- `getAttributionHtml(photo: Photo): string`

## Resources

- [Unsplash API Documentation](https://unsplash.com/documentation)
- [API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)
- [API Terms](https://unsplash.com/api-terms)
- [Developer Portal](https://unsplash.com/developers)
