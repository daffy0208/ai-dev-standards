/**
 * Unsplash API Client
 *
 * Complete Unsplash integration for stock photo search and download.
 *
 * Features:
 * - Photo search with advanced filters
 * - Random photos by category/query
 * - High-quality image downloads
 * - User attribution support
 * - Collection browsing
 * - Photo statistics and tracking
 *
 * @example
 * ```typescript
 * const client = new UnsplashClient({
 *   accessKey: process.env.UNSPLASH_ACCESS_KEY
 * })
 *
 * // Search photos
 * const results = await client.search('nature', {
 *   perPage: 20,
 *   orientation: 'landscape'
 * })
 *
 * // Get random photo
 * const photo = await client.random({
 *   query: 'mountain',
 *   orientation: 'landscape'
 * })
 *
 * // Download photo
 * const url = client.downloadUrl(photo.id)
 * ```
 */

export interface UnsplashClientOptions {
  /**
   * Unsplash access key
   */
  accessKey: string

  /**
   * Request timeout in ms
   */
  timeout?: number

  /**
   * API base URL
   */
  baseUrl?: string
}

export interface SearchOptions {
  /**
   * Search query
   */
  query: string

  /**
   * Page number (default: 1)
   */
  page?: number

  /**
   * Results per page (default: 10, max: 30)
   */
  perPage?: number

  /**
   * Sort order
   */
  orderBy?: 'relevant' | 'latest'

  /**
   * Color filter
   */
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

  /**
   * Orientation filter
   */
  orientation?: 'landscape' | 'portrait' | 'squarish'

  /**
   * Content filter
   */
  contentFilter?: 'low' | 'high'
}

export interface RandomOptions {
  /**
   * Search query for random photo
   */
  query?: string

  /**
   * Username for user-specific random
   */
  username?: string

  /**
   * Collection IDs (comma-separated)
   */
  collections?: string

  /**
   * Orientation filter
   */
  orientation?: 'landscape' | 'portrait' | 'squarish'

  /**
   * Content filter
   */
  contentFilter?: 'low' | 'high'

  /**
   * Number of photos (max: 30)
   */
  count?: number
}

export interface Photo {
  id: string
  createdAt: string
  updatedAt: string
  width: number
  height: number
  color: string
  blurHash: string
  likes: number
  likedByUser: boolean
  description: string | null
  altDescription: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links: {
    self: string
    html: string
    download: string
    downloadLocation: string
  }
  user: {
    id: string
    username: string
    name: string
    portfolioUrl: string | null
    bio: string | null
    location: string | null
    profileImage: {
      small: string
      medium: string
      large: string
    }
    links: {
      self: string
      html: string
      photos: string
      likes: string
    }
  }
}

export interface SearchResponse {
  total: number
  totalPages: number
  results: Photo[]
}

export interface Collection {
  id: string
  title: string
  description: string | null
  publishedAt: string
  updatedAt: string
  curated: boolean
  featured: boolean
  totalPhotos: number
  private: boolean
  shareKey: string
  coverPhoto: Photo
  user: Photo['user']
  links: {
    self: string
    html: string
    photos: string
  }
}

export interface PhotoStats {
  id: string
  downloads: {
    total: number
    historical: {
      change: number
      average: number
      resolution: string
      quantity: number
      values: Array<{ date: string; value: number }>
    }
  }
  views: {
    total: number
    historical: {
      change: number
      average: number
      resolution: string
      quantity: number
      values: Array<{ date: string; value: number }>
    }
  }
  likes: {
    total: number
    historical: {
      change: number
      average: number
      resolution: string
      quantity: number
      values: Array<{ date: string; value: number }>
    }
  }
}

export class UnsplashClient {
  private options: Required<UnsplashClientOptions>
  private baseUrl: string

  constructor(options: UnsplashClientOptions) {
    this.options = {
      accessKey: options.accessKey,
      timeout: options.timeout ?? 30000,
      baseUrl: options.baseUrl ?? 'https://api.unsplash.com',
    }

    if (!this.options.accessKey) {
      throw new Error('Unsplash access key is required')
    }

    this.baseUrl = this.options.baseUrl
  }

  /**
   * Search photos
   */
  async search(query: string, options: Omit<SearchOptions, 'query'> = {}): Promise<SearchResponse> {
    const params = new URLSearchParams({
      query,
      page: String(options.page || 1),
      per_page: String(options.perPage || 10),
      order_by: options.orderBy || 'relevant',
    })

    if (options.color) params.append('color', options.color)
    if (options.orientation) params.append('orientation', options.orientation)
    if (options.contentFilter) params.append('content_filter', options.contentFilter)

    const response = await this.fetch(`/search/photos?${params}`)
    const data = await response.json()

    return {
      total: data.total,
      totalPages: data.total_pages,
      results: data.results.map((photo: any) => this.transformPhoto(photo)),
    }
  }

  /**
   * Get random photo(s)
   */
  async random(options: RandomOptions = {}): Promise<Photo | Photo[]> {
    const params = new URLSearchParams()

    if (options.query) params.append('query', options.query)
    if (options.username) params.append('username', options.username)
    if (options.collections) params.append('collections', options.collections)
    if (options.orientation) params.append('orientation', options.orientation)
    if (options.contentFilter) params.append('content_filter', options.contentFilter)
    if (options.count) params.append('count', String(options.count))

    const response = await this.fetch(`/photos/random?${params}`)
    const data = await response.json()

    if (Array.isArray(data)) {
      return data.map((photo) => this.transformPhoto(photo))
    }

    return this.transformPhoto(data)
  }

  /**
   * Get photo by ID
   */
  async getPhoto(id: string): Promise<Photo> {
    const response = await this.fetch(`/photos/${id}`)
    const data = await response.json()
    return this.transformPhoto(data)
  }

  /**
   * Get photo statistics
   */
  async getPhotoStats(id: string): Promise<PhotoStats> {
    const response = await this.fetch(`/photos/${id}/statistics`)
    const data = await response.json()

    return {
      id: data.id,
      downloads: data.downloads,
      views: data.views,
      likes: data.likes,
    }
  }

  /**
   * List collections
   */
  async listCollections(options: {
    page?: number
    perPage?: number
  } = {}): Promise<Collection[]> {
    const params = new URLSearchParams({
      page: String(options.page || 1),
      per_page: String(options.perPage || 10),
    })

    const response = await this.fetch(`/collections?${params}`)
    const data = await response.json()

    return data.map((collection: any) => this.transformCollection(collection))
  }

  /**
   * Get collection photos
   */
  async getCollectionPhotos(
    id: string,
    options: { page?: number; perPage?: number } = {}
  ): Promise<Photo[]> {
    const params = new URLSearchParams({
      page: String(options.page || 1),
      per_page: String(options.perPage || 10),
    })

    const response = await this.fetch(`/collections/${id}/photos?${params}`)
    const data = await response.json()

    return data.map((photo: any) => this.transformPhoto(photo))
  }

  /**
   * Track photo download (required by Unsplash API guidelines)
   */
  async trackDownload(downloadLocation: string): Promise<void> {
    const url = downloadLocation.replace(this.baseUrl, '')
    await this.fetch(url)
  }

  /**
   * Get download URL for a photo
   */
  downloadUrl(photo: Photo | string): string {
    if (typeof photo === 'string') {
      return `${this.baseUrl}/photos/${photo}/download`
    }
    return photo.links.download
  }

  /**
   * Get optimized URL for a photo
   */
  getUrl(
    photo: Photo,
    options: {
      size?: 'raw' | 'full' | 'regular' | 'small' | 'thumb'
      width?: number
      height?: number
      crop?: boolean
      quality?: number
      format?: 'jpg' | 'png' | 'webp'
    } = {}
  ): string {
    const size = options.size || 'regular'
    let url = photo.urls[size]

    // Add parameters
    const params = new URLSearchParams()
    if (options.width) params.append('w', String(options.width))
    if (options.height) params.append('h', String(options.height))
    if (options.crop) params.append('fit', 'crop')
    if (options.quality) params.append('q', String(options.quality))
    if (options.format) params.append('fm', options.format)

    const queryString = params.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }

    return url
  }

  /**
   * Get attribution text for a photo
   */
  getAttribution(photo: Photo): string {
    return `Photo by ${photo.user.name} on Unsplash`
  }

  /**
   * Get attribution HTML for a photo
   */
  getAttributionHtml(photo: Photo): string {
    return `Photo by <a href="${photo.user.links.html}?utm_source=your_app&utm_medium=referral">${photo.user.name}</a> on <a href="https://unsplash.com?utm_source=your_app&utm_medium=referral">Unsplash</a>`
  }

  /**
   * Make authenticated API request
   */
  private async fetch(path: string): Promise<Response> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${this.options.accessKey}`,
        'Accept-Version': 'v1',
      },
      signal: AbortSignal.timeout(this.options.timeout),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [response.statusText] }))
      throw new Error(
        `Unsplash API error: ${error.errors?.join(', ') || response.statusText}`
      )
    }

    return response
  }

  /**
   * Transform API photo response to Photo type
   */
  private transformPhoto(data: any): Photo {
    return {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      width: data.width,
      height: data.height,
      color: data.color,
      blurHash: data.blur_hash,
      likes: data.likes,
      likedByUser: data.liked_by_user,
      description: data.description,
      altDescription: data.alt_description,
      urls: data.urls,
      links: {
        self: data.links.self,
        html: data.links.html,
        download: data.links.download,
        downloadLocation: data.links.download_location,
      },
      user: {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        portfolioUrl: data.user.portfolio_url,
        bio: data.user.bio,
        location: data.user.location,
        profileImage: data.user.profile_image,
        links: data.user.links,
      },
    }
  }

  /**
   * Transform API collection response to Collection type
   */
  private transformCollection(data: any): Collection {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      publishedAt: data.published_at,
      updatedAt: data.updated_at,
      curated: data.curated,
      featured: data.featured,
      totalPhotos: data.total_photos,
      private: data.private,
      shareKey: data.share_key,
      coverPhoto: this.transformPhoto(data.cover_photo),
      user: {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        portfolioUrl: data.user.portfolio_url,
        bio: data.user.bio,
        location: data.user.location,
        profileImage: data.user.profile_image,
        links: data.user.links,
      },
      links: data.links,
    }
  }
}

/**
 * Create Unsplash client from environment variables
 */
export function createUnsplashClient(
  options: Partial<UnsplashClientOptions> = {}
): UnsplashClient {
  return new UnsplashClient({
    accessKey: options.accessKey || process.env.UNSPLASH_ACCESS_KEY || '',
    timeout: options.timeout,
    baseUrl: options.baseUrl,
  })
}
