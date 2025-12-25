/**
 * Google Fonts API Client
 *
 * Client for accessing Google Fonts - the largest free font library with 1400+ font families.
 *
 * Features:
 * - Search 1400+ font families
 * - Generate font URLs and CSS imports
 * - Font metadata (weights, styles, categories)
 * - Font pairing suggestions
 * - Subset support (latin, latin-ext, etc.)
 * - TypeScript support
 *
 * @example
 * ```typescript
 * const client = new GoogleFontsClient({
 *   apiKey: process.env.GOOGLE_FONTS_API_KEY
 * })
 *
 * // Search fonts
 * const results = await client.searchFonts('roboto')
 *
 * // Get font URL
 * const url = client.getFontUrl('Roboto', {
 *   weights: [400, 700],
 *   styles: ['normal', 'italic']
 * })
 * ```
 */

export interface GoogleFontsClientOptions {
  apiKey?: string
}

export type FontCategory = 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace'
export type FontSubset =
  | 'latin'
  | 'latin-ext'
  | 'cyrillic'
  | 'cyrillic-ext'
  | 'greek'
  | 'greek-ext'
  | 'vietnamese'

export interface FontMetadata {
  family: string
  category: FontCategory
  variants: string[]
  subsets: FontSubset[]
  version: string
  lastModified: string
  popularity: number
  files: Record<string, string>
}

export interface FontSearchResult extends FontMetadata {
  matchScore: number
}

export interface FontUrlOptions {
  weights?: number[]
  styles?: ('normal' | 'italic')[]
  subset?: FontSubset
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
}

export interface FontPairing {
  heading: string
  body: string
  reason: string
  contrast: 'high' | 'medium' | 'low'
}

/**
 * Google Fonts API client
 */
export class GoogleFontsClient {
  private apiKey: string
  private baseUrl = 'https://www.googleapis.com/webfonts/v1/webfonts'
  private fontsCache: FontMetadata[] | null = null
  private cdnBase = 'https://fonts.googleapis.com/css2'

  constructor(options: GoogleFontsClientOptions = {}) {
    this.apiKey = options.apiKey || process.env.GOOGLE_FONTS_API_KEY || ''
  }

  /**
   * Search fonts by name or category
   */
  async searchFonts(
    query: string,
    options?: {
      category?: FontCategory
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
      const familyLower = font.family.toLowerCase()

      // Exact match
      if (familyLower === normalizedQuery) {
        matchScore = 100
      }
      // Starts with query
      else if (familyLower.startsWith(normalizedQuery)) {
        matchScore = 80
      }
      // Contains query
      else if (familyLower.includes(normalizedQuery)) {
        matchScore = 60
      }
      // Category match
      else if (options?.category && font.category === options.category) {
        matchScore = 40
      }

      if (matchScore > 0) {
        // Apply category filter
        if (options?.category && font.category !== options.category) {
          continue
        }

        results.push({
          ...font,
          matchScore
        })
      }
    }

    // Sort by match score, then popularity
    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore
      }
      return b.popularity - a.popularity
    })

    // Apply limit
    if (options?.limit) {
      return results.slice(0, options.limit)
    }

    return results
  }

  /**
   * Get font by family name
   */
  async getFont(family: string): Promise<FontMetadata | null> {
    const fonts = await this.listFonts()
    return fonts.find(f => f.family.toLowerCase() === family.toLowerCase()) || null
  }

  /**
   * List all fonts
   */
  async listFonts(options?: {
    category?: FontCategory
    sort?: 'popularity' | 'trending' | 'alpha'
  }): Promise<FontMetadata[]> {
    // Check cache
    if (!this.fontsCache) {
      await this.fetchFonts()
    }

    let fonts = this.fontsCache || []

    // Apply category filter
    if (options?.category) {
      fonts = fonts.filter(f => f.category === options.category)
    }

    // Apply sorting
    if (options?.sort === 'alpha') {
      fonts = fonts.sort((a, b) => a.family.localeCompare(b.family))
    } else if (options?.sort === 'popularity') {
      fonts = fonts.sort((a, b) => b.popularity - a.popularity)
    }

    return fonts
  }

  /**
   * Generate font URL for CSS import
   */
  getFontUrl(family: string, options?: FontUrlOptions): string {
    const params = new URLSearchParams()

    // Build family param with weights and styles
    let familyParam = family.replace(/ /g, '+')

    if (options?.weights || options?.styles) {
      const weights = options.weights || [400]
      const styles = options.styles || ['normal']
      const includeItalicAxis = styles.includes('italic')
      const variants: string[] = []

      for (const style of styles) {
        const italicFlag = style === 'italic' ? 1 : 0
        for (const weight of weights) {
          variants.push(includeItalicAxis ? `${italicFlag},${weight}` : `${weight}`)
        }
      }

      const axisPrefix = includeItalicAxis ? 'ital,' : ''
      const axisLabel = includeItalicAxis ? `${axisPrefix}wght` : 'wght'
      familyParam += `:${axisLabel}@${variants.join(';')}`
    }

    params.set('family', familyParam)

    // Add display
    if (options?.display) {
      params.set('display', options.display)
    }

    // Add subset
    if (options?.subset) {
      params.set('subset', options.subset)
    }

    return `${this.cdnBase}?${params.toString()}`
  }

  /**
   * Generate CSS @import statement
   */
  getCssImport(family: string, options?: FontUrlOptions): string {
    const url = this.getFontUrl(family, options)
    return `@import url('${url}');`
  }

  /**
   * Generate HTML link tag
   */
  getLinkTag(family: string, options?: FontUrlOptions): string {
    const url = this.getFontUrl(family, options)
    return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`
  }

  /**
   * Get font pairings suggestions
   */
  async getFontPairings(family: string): Promise<FontPairing[]> {
    const font = await this.getFont(family)
    if (!font) return []

    const pairings: FontPairing[] = []

    // Get opposite category fonts for contrast
    if (font.category === 'serif') {
      pairings.push(
        {
          heading: family,
          body: 'Open Sans',
          reason: 'Classic serif heading with clean sans-serif body',
          contrast: 'high'
        },
        {
          heading: family,
          body: 'Roboto',
          reason: 'Traditional serif with modern geometric sans',
          contrast: 'high'
        },
        {
          heading: family,
          body: 'Lato',
          reason: 'Elegant serif paired with friendly humanist sans',
          contrast: 'medium'
        }
      )
    } else if (font.category === 'sans-serif') {
      pairings.push(
        {
          heading: family,
          body: 'Merriweather',
          reason: 'Modern sans heading with readable serif body',
          contrast: 'high'
        },
        {
          heading: family,
          body: 'Lora',
          reason: 'Clean sans with elegant serif for readability',
          contrast: 'high'
        },
        {
          heading: family,
          body: family,
          reason: 'Same font family with weight contrast',
          contrast: 'low'
        }
      )
    } else if (font.category === 'display') {
      pairings.push(
        {
          heading: family,
          body: 'Open Sans',
          reason: 'Distinctive display with neutral sans body',
          contrast: 'high'
        },
        {
          heading: family,
          body: 'Roboto',
          reason: 'Bold display with clean geometric sans',
          contrast: 'high'
        }
      )
    } else if (font.category === 'monospace') {
      pairings.push(
        {
          heading: family,
          body: 'Inter',
          reason: 'Technical monospace with professional sans',
          contrast: 'medium'
        },
        {
          heading: 'Inter',
          body: family,
          reason: 'Clean heading with monospace for code',
          contrast: 'medium'
        }
      )
    }

    return pairings
  }

  /**
   * Get popular fonts by category
   */
  async getPopularFonts(category?: FontCategory, limit: number = 10): Promise<FontMetadata[]> {
    const fonts = await this.listFonts({ category, sort: 'popularity' })
    return fonts.slice(0, limit)
  }

  /**
   * Fetch fonts from API
   */
  private async fetchFonts(): Promise<void> {
    if (!this.apiKey) {
      // Return popular fonts without API key
      this.fontsCache = this.getPopularFontsStatic()
      return
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}&sort=popularity`)

      if (!response.ok) {
        throw new Error('Failed to fetch fonts from Google Fonts API')
      }

      const data = await response.json()
      this.fontsCache = data.items.map((item: any, index: number) => ({
        family: item.family,
        category: item.category,
        variants: item.variants,
        subsets: item.subsets,
        version: item.version,
        lastModified: item.lastModified,
        popularity: index + 1,
        files: item.files
      }))
    } catch (error) {
      // Fallback to static list
      this.fontsCache = this.getPopularFontsStatic()
    }
  }

  /**
   * Get popular fonts (static fallback)
   */
  private getPopularFontsStatic(): FontMetadata[] {
    return [
      {
        family: 'Roboto',
        category: 'sans-serif',
        variants: [
          '100',
          '300',
          '400',
          '500',
          '700',
          '900',
          '100italic',
          '300italic',
          '400italic',
          '500italic',
          '700italic',
          '900italic'
        ],
        subsets: [
          'latin',
          'latin-ext',
          'cyrillic',
          'cyrillic-ext',
          'greek',
          'greek-ext',
          'vietnamese'
        ],
        version: 'v30',
        lastModified: '2023-03-09',
        popularity: 1,
        files: {}
      },
      {
        family: 'Open Sans',
        category: 'sans-serif',
        variants: [
          '300',
          '400',
          '500',
          '600',
          '700',
          '800',
          '300italic',
          '400italic',
          '500italic',
          '600italic',
          '700italic',
          '800italic'
        ],
        subsets: [
          'latin',
          'latin-ext',
          'cyrillic',
          'cyrillic-ext',
          'greek',
          'greek-ext',
          'vietnamese'
        ],
        version: 'v34',
        lastModified: '2023-04-26',
        popularity: 2,
        files: {}
      },
      {
        family: 'Montserrat',
        category: 'sans-serif',
        variants: [
          '100',
          '200',
          '300',
          '400',
          '500',
          '600',
          '700',
          '800',
          '900',
          '100italic',
          '200italic',
          '300italic',
          '400italic',
          '500italic',
          '600italic',
          '700italic',
          '800italic',
          '900italic'
        ],
        subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'],
        version: 'v25',
        lastModified: '2023-03-21',
        popularity: 3,
        files: {}
      },
      {
        family: 'Lato',
        category: 'sans-serif',
        variants: [
          '100',
          '300',
          '400',
          '700',
          '900',
          '100italic',
          '300italic',
          '400italic',
          '700italic',
          '900italic'
        ],
        subsets: ['latin', 'latin-ext'],
        version: 'v24',
        lastModified: '2023-03-21',
        popularity: 4,
        files: {}
      },
      {
        family: 'Inter',
        category: 'sans-serif',
        variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
        subsets: [
          'latin',
          'latin-ext',
          'cyrillic',
          'cyrillic-ext',
          'greek',
          'greek-ext',
          'vietnamese'
        ],
        version: 'v12',
        lastModified: '2023-05-02',
        popularity: 5,
        files: {}
      },
      {
        family: 'Poppins',
        category: 'sans-serif',
        variants: [
          '100',
          '200',
          '300',
          '400',
          '500',
          '600',
          '700',
          '800',
          '900',
          '100italic',
          '200italic',
          '300italic',
          '400italic',
          '500italic',
          '600italic',
          '700italic',
          '800italic',
          '900italic'
        ],
        subsets: ['latin', 'latin-ext'],
        version: 'v20',
        lastModified: '2023-01-06',
        popularity: 6,
        files: {}
      },
      {
        family: 'Merriweather',
        category: 'serif',
        variants: ['300', '400', '700', '900', '300italic', '400italic', '700italic', '900italic'],
        subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'],
        version: 'v30',
        lastModified: '2023-03-29',
        popularity: 20,
        files: {}
      },
      {
        family: 'Playfair Display',
        category: 'serif',
        variants: [
          '400',
          '500',
          '600',
          '700',
          '800',
          '900',
          '400italic',
          '500italic',
          '600italic',
          '700italic',
          '800italic',
          '900italic'
        ],
        subsets: ['latin', 'latin-ext', 'cyrillic'],
        version: 'v30',
        lastModified: '2023-03-21',
        popularity: 25,
        files: {}
      },
      {
        family: 'Source Code Pro',
        category: 'monospace',
        variants: [
          '200',
          '300',
          '400',
          '500',
          '600',
          '700',
          '800',
          '900',
          '200italic',
          '300italic',
          '400italic',
          '500italic',
          '600italic',
          '700italic',
          '800italic',
          '900italic'
        ],
        subsets: [
          'latin',
          'latin-ext',
          'cyrillic',
          'cyrillic-ext',
          'greek',
          'greek-ext',
          'vietnamese'
        ],
        version: 'v22',
        lastModified: '2023-03-21',
        popularity: 30,
        files: {}
      },
      {
        family: 'Dancing Script',
        category: 'handwriting',
        variants: ['400', '500', '600', '700'],
        subsets: ['latin', 'latin-ext', 'vietnamese'],
        version: 'v24',
        lastModified: '2023-03-21',
        popularity: 35,
        files: {}
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
 * Create Google Fonts client
 */
export function createGoogleFontsClient(options: GoogleFontsClientOptions = {}): GoogleFontsClient {
  return new GoogleFontsClient(options)
}
