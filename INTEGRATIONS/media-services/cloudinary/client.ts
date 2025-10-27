/**
 * Cloudinary API Client
 *
 * Complete Cloudinary integration for image upload, transformation, and optimization.
 *
 * Features:
 * - Image upload with automatic optimization
 * - URL-based transformations (resize, crop, format, quality)
 * - Cloud storage with CDN delivery
 * - Video and raw file upload support
 * - Advanced transformations (effects, overlays, face detection)
 * - Asset management and organization
 *
 * @example
 * ```typescript
 * const client = new CloudinaryClient({
 *   cloudName: process.env.CLOUDINARY_CLOUD_NAME,
 *   apiKey: process.env.CLOUDINARY_API_KEY,
 *   apiSecret: process.env.CLOUDINARY_API_SECRET
 * })
 *
 * // Upload image
 * const result = await client.upload({
 *   file: imageBuffer,
 *   folder: 'products',
 *   publicId: 'product-123'
 * })
 *
 * // Generate optimized URL
 * const url = client.url('product-123', {
 *   width: 800,
 *   height: 600,
 *   crop: 'fill',
 *   quality: 'auto',
 *   format: 'auto'
 * })
 * ```
 */

export interface CloudinaryClientOptions {
  /**
   * Cloudinary cloud name
   */
  cloudName: string

  /**
   * API key for authentication
   */
  apiKey: string

  /**
   * API secret for authentication
   */
  apiSecret: string

  /**
   * Secure URLs (HTTPS)
   */
  secure?: boolean

  /**
   * Request timeout in ms
   */
  timeout?: number
}

export interface UploadOptions {
  /**
   * File to upload (Buffer, base64, or URL)
   */
  file: Buffer | string

  /**
   * Public ID for the asset
   */
  publicId?: string

  /**
   * Folder path
   */
  folder?: string

  /**
   * Resource type
   */
  resourceType?: 'image' | 'video' | 'raw' | 'auto'

  /**
   * Tags for organization
   */
  tags?: string[]

  /**
   * Transformation to apply on upload
   */
  transformation?: TransformOptions

  /**
   * Overwrite existing asset
   */
  overwrite?: boolean

  /**
   * Use filename as public ID
   */
  useFilename?: boolean

  /**
   * Unique filename
   */
  uniqueFilename?: boolean

  /**
   * Context metadata
   */
  context?: Record<string, string>
}

export interface UploadResponse {
  publicId: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resourceType: string
  createdAt: string
  bytes: number
  type: string
  url: string
  secureUrl: string
}

export interface TransformOptions {
  /**
   * Width in pixels
   */
  width?: number

  /**
   * Height in pixels
   */
  height?: number

  /**
   * Crop mode
   */
  crop?:
    | 'scale'
    | 'fit'
    | 'limit'
    | 'mfit'
    | 'fill'
    | 'lfill'
    | 'pad'
    | 'lpad'
    | 'mpad'
    | 'crop'
    | 'thumb'

  /**
   * Aspect ratio
   */
  aspectRatio?: string

  /**
   * Gravity for cropping
   */
  gravity?:
    | 'auto'
    | 'center'
    | 'face'
    | 'faces'
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'north_east'
    | 'north_west'
    | 'south_east'
    | 'south_west'

  /**
   * Quality (1-100 or 'auto')
   */
  quality?: number | 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low'

  /**
   * Format (jpg, png, webp, avif, auto)
   */
  format?: 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'auto'

  /**
   * Fetch format (automatic format selection)
   */
  fetchFormat?: 'auto'

  /**
   * DPR (device pixel ratio)
   */
  dpr?: number | 'auto'

  /**
   * Effects
   */
  effect?: string

  /**
   * Background color
   */
  background?: string

  /**
   * Border
   */
  border?: string

  /**
   * Overlay image
   */
  overlay?: string

  /**
   * Radius (rounded corners)
   */
  radius?: number | 'max'

  /**
   * Angle (rotation)
   */
  angle?: number

  /**
   * Opacity (0-100)
   */
  opacity?: number

  /**
   * Flags
   */
  flags?: string[]
}

export interface DeleteOptions {
  /**
   * Public ID to delete
   */
  publicId: string

  /**
   * Resource type
   */
  resourceType?: 'image' | 'video' | 'raw'

  /**
   * Invalidate CDN cache
   */
  invalidate?: boolean
}

export interface DeleteResponse {
  result: 'ok' | 'not found'
}

export class CloudinaryClient {
  private options: Required<CloudinaryClientOptions>
  private baseUrl: string
  private uploadUrl: string

  constructor(options: CloudinaryClientOptions) {
    this.options = {
      cloudName: options.cloudName,
      apiKey: options.apiKey,
      apiSecret: options.apiSecret,
      secure: options.secure ?? true,
      timeout: options.timeout ?? 30000,
    }

    if (!this.options.cloudName || !this.options.apiKey || !this.options.apiSecret) {
      throw new Error('Cloudinary cloud name, API key, and API secret are required')
    }

    const protocol = this.options.secure ? 'https' : 'http'
    this.baseUrl = `${protocol}://res.cloudinary.com/${this.options.cloudName}`
    this.uploadUrl = `${protocol}://api.cloudinary.com/v1_1/${this.options.cloudName}`
  }

  /**
   * Upload an asset to Cloudinary
   */
  async upload(options: UploadOptions): Promise<UploadResponse> {
    const resourceType = options.resourceType || 'auto'
    const url = `${this.uploadUrl}/${resourceType}/upload`

    const formData = new FormData()

    // Add file
    if (Buffer.isBuffer(options.file)) {
      const blob = new Blob([options.file])
      formData.append('file', blob)
    } else {
      formData.append('file', options.file)
    }

    // Add authentication
    formData.append('api_key', this.options.apiKey)
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString())

    // Add options
    if (options.publicId) formData.append('public_id', options.publicId)
    if (options.folder) formData.append('folder', options.folder)
    if (options.tags) formData.append('tags', options.tags.join(','))
    if (options.overwrite !== undefined)
      formData.append('overwrite', options.overwrite.toString())
    if (options.useFilename !== undefined)
      formData.append('use_filename', options.useFilename.toString())
    if (options.uniqueFilename !== undefined)
      formData.append('unique_filename', options.uniqueFilename.toString())
    if (options.context) formData.append('context', this.encodeContext(options.context))

    // Add transformation
    if (options.transformation) {
      const transformStr = this.buildTransformationString(options.transformation)
      if (transformStr) formData.append('transformation', transformStr)
    }

    // Generate signature
    const signature = await this.generateSignature(formData)
    formData.append('signature', signature)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(this.options.timeout),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Cloudinary upload failed: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      publicId: data.public_id,
      version: data.version,
      signature: data.signature,
      width: data.width,
      height: data.height,
      format: data.format,
      resourceType: data.resource_type,
      createdAt: data.created_at,
      bytes: data.bytes,
      type: data.type,
      url: data.url,
      secureUrl: data.secure_url,
    }
  }

  /**
   * Generate optimized URL for an asset
   */
  url(publicId: string, options: TransformOptions = {}): string {
    const resourceType = 'image'
    const transformStr = this.buildTransformationString(options)
    const format = options.format === 'auto' ? '' : options.format || ''

    const parts = [this.baseUrl, resourceType, 'upload']

    if (transformStr) {
      parts.push(transformStr)
    }

    parts.push(publicId)

    let url = parts.join('/')

    if (format) {
      // Replace or add extension
      const lastDot = url.lastIndexOf('.')
      if (lastDot > url.lastIndexOf('/')) {
        url = url.substring(0, lastDot) + '.' + format
      } else {
        url += '.' + format
      }
    }

    return url
  }

  /**
   * Delete an asset
   */
  async delete(options: DeleteOptions): Promise<DeleteResponse> {
    const resourceType = options.resourceType || 'image'
    const url = `${this.uploadUrl}/${resourceType}/destroy`

    const formData = new FormData()
    formData.append('public_id', options.publicId)
    formData.append('api_key', this.options.apiKey)
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString())

    if (options.invalidate !== undefined) {
      formData.append('invalidate', options.invalidate.toString())
    }

    const signature = await this.generateSignature(formData)
    formData.append('signature', signature)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(this.options.timeout),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Cloudinary delete failed: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    return {
      result: data.result,
    }
  }

  /**
   * Generate responsive image URLs
   */
  responsive(
    publicId: string,
    options: {
      widths: number[]
      baseOptions?: TransformOptions
    }
  ): Array<{ url: string; width: number }> {
    return options.widths.map((width) => ({
      url: this.url(publicId, {
        ...options.baseOptions,
        width,
        crop: options.baseOptions?.crop || 'scale',
      }),
      width,
    }))
  }

  /**
   * Build transformation string from options
   */
  private buildTransformationString(options: TransformOptions): string {
    const parts: string[] = []

    if (options.width) parts.push(`w_${options.width}`)
    if (options.height) parts.push(`h_${options.height}`)
    if (options.crop) parts.push(`c_${options.crop}`)
    if (options.aspectRatio) parts.push(`ar_${options.aspectRatio}`)
    if (options.gravity) parts.push(`g_${options.gravity}`)
    if (options.quality) parts.push(`q_${options.quality}`)
    if (options.format) parts.push(`f_${options.format}`)
    if (options.fetchFormat) parts.push(`f_${options.fetchFormat}`)
    if (options.dpr) parts.push(`dpr_${options.dpr}`)
    if (options.effect) parts.push(`e_${options.effect}`)
    if (options.background) parts.push(`b_${options.background}`)
    if (options.border) parts.push(`bo_${options.border}`)
    if (options.overlay) parts.push(`l_${options.overlay}`)
    if (options.radius) parts.push(`r_${options.radius}`)
    if (options.angle) parts.push(`a_${options.angle}`)
    if (options.opacity) parts.push(`o_${options.opacity}`)
    if (options.flags && options.flags.length > 0) {
      parts.push(`fl_${options.flags.join('.')}`)
    }

    return parts.join(',')
  }

  /**
   * Generate signature for authenticated requests
   */
  private async generateSignature(formData: FormData): Promise<string> {
    const params: Record<string, string> = {}

    for (const [key, value] of formData.entries()) {
      if (key !== 'file' && key !== 'api_key') {
        params[key] = value.toString()
      }
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&')

    const stringToSign = sortedParams + this.options.apiSecret

    // Use Web Crypto API for SHA-1
    const encoder = new TextEncoder()
    const data = encoder.encode(stringToSign)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    return hashHex
  }

  /**
   * Encode context metadata
   */
  private encodeContext(context: Record<string, string>): string {
    return Object.entries(context)
      .map(([key, value]) => `${key}=${value}`)
      .join('|')
  }
}

/**
 * Create Cloudinary client from environment variables
 */
export function createCloudinaryClient(
  options: Partial<CloudinaryClientOptions> = {}
): CloudinaryClient {
  return new CloudinaryClient({
    cloudName: options.cloudName || process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: options.apiKey || process.env.CLOUDINARY_API_KEY || '',
    apiSecret: options.apiSecret || process.env.CLOUDINARY_API_SECRET || '',
    secure: options.secure,
    timeout: options.timeout,
  })
}
