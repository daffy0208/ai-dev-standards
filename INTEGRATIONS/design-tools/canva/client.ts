/**
 * Canva API Client
 *
 * Complete Canva Connect API integration for accessing designs and brand assets.
 *
 * Features:
 * - Access Canva designs via API
 * - Get design templates
 * - Export designs (PNG, PDF, SVG, JPG)
 * - Brand kit access (colors, fonts, logos)
 * - Create designs from templates
 * - Folder management
 *
 * @example
 * ```typescript
 * const client = new CanvaClient({
 *   accessToken: process.env.CANVA_ACCESS_TOKEN
 * })
 *
 * // Get design
 * const design = await client.getDesign('design-id')
 *
 * // Export design
 * const exportUrl = await client.exportDesign('design-id', {
 *   format: 'png',
 *   quality: 'high'
 * })
 * ```
 */

export interface CanvaClientOptions {
  /**
   * Canva access token
   */
  accessToken?: string

  /**
   * Request timeout in ms
   */
  timeout?: number

  /**
   * Base API URL
   */
  baseUrl?: string
}

export interface CanvaDesign {
  id: string
  title: string
  created_at: string
  updated_at: string
  thumbnail_url: string
  urls: {
    edit_url: string
    view_url: string
  }
  width: number
  height: number
  pages: number
}

export interface CanvaFolder {
  id: string
  name: string
  created_at: string
  items_count: number
}

export interface CanvaBrandKit {
  id: string
  name: string
  colors: CanvaColor[]
  fonts: CanvaFont[]
  logos: CanvaLogo[]
}

export interface CanvaColor {
  id: string
  name: string
  hex: string
}

export interface CanvaFont {
  id: string
  name: string
  family: string
  weight: string
  style: string
}

export interface CanvaLogo {
  id: string
  name: string
  url: string
  width: number
  height: number
}

export interface ExportOptions {
  format?: 'png' | 'jpg' | 'pdf' | 'svg' | 'pptx' | 'mp4' | 'gif'
  quality?: 'low' | 'medium' | 'high'
  pages?: number[] | 'all'
  width?: number
  height?: number
}

export interface ExportResult {
  id: string
  format: string
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface CreateDesignOptions {
  title?: string
  template_id?: string
  width?: number
  height?: number
  folder_id?: string
}

export class CanvaClient {
  private options: Required<CanvaClientOptions>

  constructor(options: CanvaClientOptions = {}) {
    this.options = {
      accessToken: options.accessToken || process.env.CANVA_ACCESS_TOKEN || '',
      timeout: options.timeout || 30000,
      baseUrl: options.baseUrl || 'https://api.canva.com/v1',
    }

    if (!this.options.accessToken) {
      throw new Error('Canva access token is required')
    }
  }

  /**
   * Get design by ID
   */
  async getDesign(designId: string): Promise<CanvaDesign> {
    const response = await this.request(`/designs/${designId}`)
    return response.design
  }

  /**
   * List user designs
   */
  async listDesigns(options: {
    folder_id?: string
    limit?: number
    continuation?: string
  } = {}): Promise<{ designs: CanvaDesign[]; continuation?: string }> {
    const params = new URLSearchParams()
    if (options.folder_id) params.set('folder_id', options.folder_id)
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.continuation) params.set('continuation', options.continuation)

    const response = await this.request(`/designs?${params}`)
    return response
  }

  /**
   * Create new design
   */
  async createDesign(options: CreateDesignOptions): Promise<CanvaDesign> {
    const response = await this.request('/designs', {
      method: 'POST',
      body: JSON.stringify({
        title: options.title || 'Untitled Design',
        template_id: options.template_id,
        width: options.width,
        height: options.height,
        folder_id: options.folder_id,
      }),
    })
    return response.design
  }

  /**
   * Export design
   */
  async exportDesign(designId: string, options: ExportOptions = {}): Promise<ExportResult> {
    const format = options.format || 'png'
    const quality = options.quality || 'high'
    const pages = options.pages || 'all'

    const response = await this.request(`/designs/${designId}/export`, {
      method: 'POST',
      body: JSON.stringify({
        format,
        quality,
        pages,
        width: options.width,
        height: options.height,
      }),
    })

    return {
      id: response.export.id,
      format,
      url: response.export.url,
      status: response.export.status,
    }
  }

  /**
   * Wait for export to complete
   */
  async waitForExport(exportId: string, maxWaitTime = 60000): Promise<ExportResult> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const response = await this.request(`/exports/${exportId}`)
      const exportResult = response.export

      if (exportResult.status === 'completed') {
        return {
          id: exportResult.id,
          format: exportResult.format,
          url: exportResult.url,
          status: exportResult.status,
        }
      }

      if (exportResult.status === 'failed') {
        throw new Error(`Export failed: ${exportResult.error || 'Unknown error'}`)
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    throw new Error('Export timeout exceeded')
  }

  /**
   * Export and wait for completion
   */
  async exportDesignAndWait(
    designId: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const exportResult = await this.exportDesign(designId, options)
    return this.waitForExport(exportResult.id)
  }

  /**
   * Get brand kit
   */
  async getBrandKit(brandKitId?: string): Promise<CanvaBrandKit> {
    const endpoint = brandKitId ? `/brand-kits/${brandKitId}` : '/brand-kits'
    const response = await this.request(endpoint)

    if (brandKitId) {
      return response.brand_kit
    } else {
      // Return first brand kit
      return response.brand_kits?.[0] || { id: '', name: '', colors: [], fonts: [], logos: [] }
    }
  }

  /**
   * Get brand colors
   */
  async getBrandColors(brandKitId?: string): Promise<CanvaColor[]> {
    const brandKit = await this.getBrandKit(brandKitId)
    return brandKit.colors || []
  }

  /**
   * Get brand fonts
   */
  async getBrandFonts(brandKitId?: string): Promise<CanvaFont[]> {
    const brandKit = await this.getBrandKit(brandKitId)
    return brandKit.fonts || []
  }

  /**
   * Get brand logos
   */
  async getBrandLogos(brandKitId?: string): Promise<CanvaLogo[]> {
    const brandKit = await this.getBrandKit(brandKitId)
    return brandKit.logos || []
  }

  /**
   * List folders
   */
  async listFolders(): Promise<CanvaFolder[]> {
    const response = await this.request('/folders')
    return response.folders || []
  }

  /**
   * Create folder
   */
  async createFolder(name: string): Promise<CanvaFolder> {
    const response = await this.request('/folders', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    return response.folder
  }

  /**
   * Export brand colors as CSS
   */
  async exportBrandColorsAsCSS(brandKitId?: string): Promise<string> {
    const colors = await this.getBrandColors(brandKitId)

    let css = ':root {\n'
    css += '  /* Brand Colors */\n'

    for (const color of colors) {
      const name = this.tokenizeName(color.name)
      css += `  --color-${name}: ${color.hex};\n`
    }

    css += '}\n'

    return css
  }

  /**
   * Export brand fonts as CSS
   */
  async exportBrandFontsAsCSS(brandKitId?: string): Promise<string> {
    const fonts = await this.getBrandFonts(brandKitId)

    let css = ':root {\n'
    css += '  /* Brand Fonts */\n'

    for (const font of fonts) {
      const name = this.tokenizeName(font.name)
      css += `  --font-${name}-family: ${font.family};\n`
      css += `  --font-${name}-weight: ${font.weight};\n`
      css += `  --font-${name}-style: ${font.style};\n`
    }

    css += '}\n'

    return css
  }

  /**
   * Export brand kit as JSON
   */
  async exportBrandKitAsJSON(brandKitId?: string): Promise<string> {
    const brandKit = await this.getBrandKit(brandKitId)
    return JSON.stringify(brandKit, null, 2)
  }

  /**
   * Tokenize name (convert to kebab-case)
   */
  private tokenizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Make API request
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.options.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.options.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.options.timeout),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Canva API error: ${response.status} ${response.statusText} - ${error.message || 'Unknown error'}`
      )
    }

    return response.json()
  }
}

/**
 * Create Canva client from environment variables
 */
export function createCanvaClient(options: CanvaClientOptions = {}): CanvaClient {
  return new CanvaClient(options)
}
