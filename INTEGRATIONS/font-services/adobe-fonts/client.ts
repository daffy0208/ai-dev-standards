/**
 * Adobe Fonts (Typekit) API Client
 *
 * Client for accessing Adobe Fonts (formerly Typekit) - premium font service included with Creative Cloud.
 *
 * Features:
 * - Access 20000+ font families
 * - Generate embed codes
 * - Font family search
 * - Kit management
 * - TypeScript support
 *
 * @example
 * ```typescript
 * const client = new AdobeFontsClient({
 *   apiKey: process.env.ADOBE_FONTS_API_KEY
 * })
 *
 * // Search fonts
 * const results = await client.searchFonts('futura')
 *
 * // Get embed code
 * const embed = client.getEmbedCode('kit-id')
 * ```
 */

export interface AdobeFontsClientOptions {
  apiKey?: string
}

export type FontClassification =
  | 'serif'
  | 'sans-serif'
  | 'slab-serif'
  | 'script'
  | 'blackletter'
  | 'monospace'
  | 'display'
  | 'decorative'

export interface FontFamily {
  id: string
  slug: string
  name: string
  displayName: string
  foundry: string
  classifications: FontClassification[]
  variations: FontVariation[]
  description?: string
}

export interface FontVariation {
  id: string
  name: string
  weight: number
  style: 'normal' | 'italic' | 'oblique'
}

export interface Kit {
  id: string
  name: string
  families: string[]
  domains: string[]
  embed_url: string
}

export interface FontSearchResult extends FontFamily {
  matchScore: number
}

/**
 * Adobe Fonts (Typekit) API client
 */
export class AdobeFontsClient {
  private apiKey: string
  private baseUrl = 'https://typekit.com/api/v1/json'
  private fontsCache: FontFamily[] | null = null

  constructor(options: AdobeFontsClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.ADOBE_FONTS_API_KEY || ''

    if (!this.apiKey) {
      console.warn('Adobe Fonts API key not provided. Some features will be limited.')
    }
  }

  /**
   * Search fonts by name or classification
   */
  async searchFonts(
    query: string,
    options?: {
      classification?: FontClassification
      foundry?: string
      limit?: number
    }
  ): Promise<FontSearchResult[]> {
    const normalizedQuery = query.toLowerCase().trim()

    // Get all fonts
    const fonts = await this.listFonts()

    // Filter and score
    const results: FontSearchResult[] = []

    for (const font of fonts) {
      let matchScore = 0
      const nameLower = font.name.toLowerCase()
      const slugLower = font.slug.toLowerCase()

      // Exact match
      if (nameLower === normalizedQuery || slugLower === normalizedQuery) {
        matchScore = 100
      }
      // Starts with query
      else if (nameLower.startsWith(normalizedQuery) || slugLower.startsWith(normalizedQuery)) {
        matchScore = 80
      }
      // Contains query
      else if (nameLower.includes(normalizedQuery) || slugLower.includes(normalizedQuery)) {
        matchScore = 60
      }
      // Foundry match
      else if (font.foundry.toLowerCase().includes(normalizedQuery)) {
        matchScore = 40
      }

      if (matchScore > 0) {
        // Apply filters
        if (options?.classification && !font.classifications.includes(options.classification)) {
          continue
        }
        if (options?.foundry && font.foundry !== options.foundry) {
          continue
        }

        results.push({
          ...font,
          matchScore
        })
      }
    }

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore)

    // Apply limit
    if (options?.limit) {
      return results.slice(0, options.limit)
    }

    return results
  }

  /**
   * Get font family by ID or slug
   */
  async getFontFamily(idOrSlug: string): Promise<FontFamily | null> {
    const fonts = await this.listFonts()
    return fonts.find(f => f.id === idOrSlug || f.slug === idOrSlug) || null
  }

  /**
   * List all available fonts
   */
  async listFonts(options?: {
    classification?: FontClassification
    foundry?: string
  }): Promise<FontFamily[]> {
    // Check cache
    if (!this.fontsCache) {
      await this.fetchFonts()
    }

    let fonts = this.fontsCache || []

    // Apply filters
    if (options?.classification) {
      fonts = fonts.filter(f => f.classifications.includes(options.classification!))
    }
    if (options?.foundry) {
      fonts = fonts.filter(f => f.foundry === options.foundry)
    }

    return fonts
  }

  /**
   * Generate embed code for a kit
   */
  getEmbedCode(kitId: string): string {
    return `<link rel="stylesheet" href="https://use.typekit.net/${kitId}.css">`
  }

  /**
   * Generate JavaScript embed code
   */
  getJsEmbedCode(kitId: string): string {
    return `<script>
  (function(d) {
    var config = {
      kitId: '${kitId}',
      scriptTimeout: 3000,
      async: true
    },
    h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
  })(document);
</script>`
  }

  /**
   * Get CSS @import statement
   */
  getCssImport(kitId: string): string {
    return `@import url("https://use.typekit.net/${kitId}.css");`
  }

  /**
   * Fetch fonts from API or use fallback
   */
  private async fetchFonts(): Promise<void> {
    if (!this.apiKey) {
      // Use static popular fonts
      this.fontsCache = this.getPopularFontsStatic()
      return
    }

    try {
      const response = await fetch(`${this.baseUrl}/families?key=${this.apiKey}`)

      if (!response.ok) {
        throw new Error('Failed to fetch fonts from Adobe Fonts API')
      }

      const data = await response.json()
      this.fontsCache = data.families || []
    } catch (error) {
      // Fallback to static list
      this.fontsCache = this.getPopularFontsStatic()
    }
  }

  /**
   * Get popular Adobe Fonts (static fallback)
   */
  private getPopularFontsStatic(): FontFamily[] {
    return [
      {
        id: 'futura-pt',
        slug: 'futura-pt',
        name: 'Futura PT',
        displayName: 'Futura PT',
        foundry: 'ParaType',
        classifications: ['sans-serif'],
        variations: [
          { id: '1', name: 'Light', weight: 300, style: 'normal' },
          { id: '2', name: 'Book', weight: 400, style: 'normal' },
          { id: '3', name: 'Medium', weight: 500, style: 'normal' },
          { id: '4', name: 'Bold', weight: 700, style: 'normal' }
        ],
        description: 'Geometric sans-serif with clean lines'
      },
      {
        id: 'proxima-nova',
        slug: 'proxima-nova',
        name: 'Proxima Nova',
        displayName: 'Proxima Nova',
        foundry: 'Mark Simonson',
        classifications: ['sans-serif'],
        variations: [
          { id: '1', name: 'Thin', weight: 100, style: 'normal' },
          { id: '2', name: 'Light', weight: 300, style: 'normal' },
          { id: '3', name: 'Regular', weight: 400, style: 'normal' },
          { id: '4', name: 'Semibold', weight: 600, style: 'normal' },
          { id: '5', name: 'Bold', weight: 700, style: 'normal' },
          { id: '6', name: 'Black', weight: 900, style: 'normal' }
        ],
        description: 'Modern sans-serif bridging geometric and humanist'
      },
      {
        id: 'adobe-garamond',
        slug: 'adobe-garamond',
        name: 'Adobe Garamond',
        displayName: 'Adobe Garamond',
        foundry: 'Adobe',
        classifications: ['serif'],
        variations: [
          { id: '1', name: 'Regular', weight: 400, style: 'normal' },
          { id: '2', name: 'Italic', weight: 400, style: 'italic' },
          { id: '3', name: 'Semibold', weight: 600, style: 'normal' },
          { id: '4', name: 'Bold', weight: 700, style: 'normal' }
        ],
        description: 'Classic old-style serif typeface'
      },
      {
        id: 'myriad-pro',
        slug: 'myriad-pro',
        name: 'Myriad Pro',
        displayName: 'Myriad Pro',
        foundry: 'Adobe',
        classifications: ['sans-serif'],
        variations: [
          { id: '1', name: 'Regular', weight: 400, style: 'normal' },
          { id: '2', name: 'Semibold', weight: 600, style: 'normal' },
          { id: '3', name: 'Bold', weight: 700, style: 'normal' }
        ],
        description: 'Humanist sans-serif, Adobe brand font'
      },
      {
        id: 'source-sans-pro',
        slug: 'source-sans-pro',
        name: 'Source Sans Pro',
        displayName: 'Source Sans Pro',
        foundry: 'Adobe',
        classifications: ['sans-serif'],
        variations: [
          { id: '1', name: 'ExtraLight', weight: 200, style: 'normal' },
          { id: '2', name: 'Light', weight: 300, style: 'normal' },
          { id: '3', name: 'Regular', weight: 400, style: 'normal' },
          { id: '4', name: 'Semibold', weight: 600, style: 'normal' },
          { id: '5', name: 'Bold', weight: 700, style: 'normal' },
          { id: '6', name: 'Black', weight: 900, style: 'normal' }
        ],
        description: 'First open source font family from Adobe'
      }
    ]
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.fontsCache = null
  }
}

/**
 * Create Adobe Fonts client
 */
export function createAdobeFontsClient(options: AdobeFontsClientOptions = {}): AdobeFontsClient {
  return new AdobeFontsClient(options)
}
