/**
 * Heroicons API Client
 *
 * Client for accessing Heroicons - beautiful hand-crafted SVG icons by the makers of Tailwind CSS.
 *
 * Features:
 * - Search icons by name
 * - Get SVG content for outline and solid variants
 * - 24x24 and 20x20 sizes
 * - TypeScript support
 * - Zero runtime dependencies
 *
 * @example
 * ```typescript
 * const client = new HeroiconsClient()
 *
 * // Search for icons
 * const results = await client.searchIcons('arrow')
 *
 * // Get icon SVG
 * const svg = await client.getIcon('arrow-right', '24', 'outline')
 * ```
 */

export type IconSize = '24' | '20'
export type IconVariant = 'outline' | 'solid' | 'mini'

export interface IconMetadata {
  name: string
  variants: IconVariant[]
  sizes: IconSize[]
  category?: string
  tags: string[]
}

export interface IconSearchResult {
  name: string
  displayName: string
  variant: IconVariant
  size: IconSize
  category?: string
}

export interface GetIconOptions {
  size?: IconSize
  variant?: IconVariant
}

export interface GetIconResult {
  name: string
  variant: IconVariant
  size: IconSize
  svg: string
  url: string
}

/**
 * Heroicons icon library client
 */
export class HeroiconsClient {
  private baseUrl = 'https://api.github.com/repos/tailwindlabs/heroicons/contents'
  private iconCache = new Map<string, string>()
  private metadataCache: IconMetadata[] | null = null

  /**
   * Search icons by name or tags
   */
  async searchIcons(
    query: string,
    options?: {
      variant?: IconVariant
      size?: IconSize
      limit?: number
    }
  ): Promise<IconSearchResult[]> {
    const normalizedQuery = query.toLowerCase().trim()

    // Get all available icons
    const metadata = await this.getIconMetadata()

    // Filter by query
    const results = metadata.filter(icon => {
      const nameMatch = icon.name.toLowerCase().includes(normalizedQuery)
      const tagMatch = icon.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      return nameMatch || tagMatch
    })

    // Convert to search results
    const searchResults: IconSearchResult[] = []

    for (const icon of results) {
      for (const variant of icon.variants) {
        for (const size of icon.sizes) {
          // Apply filters
          if (options?.variant && variant !== options.variant) continue
          if (options?.size && size !== options.size) continue

          searchResults.push({
            name: icon.name,
            displayName: this.toDisplayName(icon.name),
            variant,
            size,
            category: icon.category
          })
        }
      }
    }

    // Apply limit
    if (options?.limit) {
      return searchResults.slice(0, options.limit)
    }

    return searchResults
  }

  /**
   * Get icon SVG content
   */
  async getIcon(
    name: string,
    size: IconSize = '24',
    variant: IconVariant = 'outline'
  ): Promise<GetIconResult> {
    const cacheKey = `${name}-${size}-${variant}`

    // Check cache
    if (this.iconCache.has(cacheKey)) {
      return {
        name,
        variant,
        size,
        svg: this.iconCache.get(cacheKey)!,
        url: this.getIconUrl(name, size, variant)
      }
    }

    // Fetch from GitHub
    const url = this.getIconUrl(name, size, variant)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Icon not found: ${name} (${variant}, ${size}x${size})`)
      }

      const svg = await response.text()

      // Cache the result
      this.iconCache.set(cacheKey, svg)

      return {
        name,
        variant,
        size,
        svg,
        url
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch icon: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Get multiple icons at once
   */
  async getIcons(
    icons: Array<{
      name: string
      size?: IconSize
      variant?: IconVariant
    }>
  ): Promise<GetIconResult[]> {
    const results = await Promise.allSettled(
      icons.map(icon => this.getIcon(icon.name, icon.size || '24', icon.variant || 'outline'))
    )

    return results
      .filter(
        (result): result is PromiseFulfilledResult<GetIconResult> => result.status === 'fulfilled'
      )
      .map(result => result.value)
  }

  /**
   * List all available icons
   */
  async listIcons(options?: {
    variant?: IconVariant
    size?: IconSize
  }): Promise<IconSearchResult[]> {
    const metadata = await this.getIconMetadata()
    const results: IconSearchResult[] = []

    for (const icon of metadata) {
      for (const variant of icon.variants) {
        for (const size of icon.sizes) {
          // Apply filters
          if (options?.variant && variant !== options.variant) continue
          if (options?.size && size !== options.size) continue

          results.push({
            name: icon.name,
            displayName: this.toDisplayName(icon.name),
            variant,
            size,
            category: icon.category
          })
        }
      }
    }

    return results
  }

  /**
   * Get icon metadata
   */
  private async getIconMetadata(): Promise<IconMetadata[]> {
    if (this.metadataCache) {
      return this.metadataCache
    }

    // Heroicons has a predictable structure
    // For production, you'd want to fetch the actual directory listing
    // This is a simplified implementation with common icons
    const commonIcons = [
      'arrow-right',
      'arrow-left',
      'arrow-up',
      'arrow-down',
      'check',
      'x-mark',
      'chevron-right',
      'chevron-left',
      'chevron-up',
      'chevron-down',
      'plus',
      'minus',
      'magnifying-glass',
      'bars-3',
      'ellipsis-horizontal',
      'ellipsis-vertical',
      'heart',
      'star',
      'bell',
      'envelope',
      'user',
      'users',
      'home',
      'cog-6-tooth',
      'trash',
      'pencil',
      'document',
      'folder',
      'photo',
      'calendar',
      'clock',
      'map-pin',
      'globe-alt',
      'link',
      'share',
      'download',
      'upload',
      'eye',
      'eye-slash',
      'lock-closed',
      'lock-open',
      'key',
      'shield-check',
      'exclamation-triangle',
      'information-circle',
      'question-mark-circle',
      'check-circle',
      'x-circle'
    ]

    this.metadataCache = commonIcons.map(name => ({
      name,
      variants: ['outline', 'solid'] as IconVariant[],
      sizes: ['24', '20'] as IconSize[],
      tags: name.split('-')
    }))

    return this.metadataCache
  }

  /**
   * Get icon URL
   */
  private getIconUrl(name: string, size: IconSize, variant: IconVariant): string {
    const sizeFolder = variant === 'mini' ? '20/solid' : `${size}/${variant}`
    return `https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/${sizeFolder}/${name}.svg`
  }

  /**
   * Convert kebab-case to Display Name
   */
  private toDisplayName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.iconCache.clear()
    this.metadataCache = null
  }
}

/**
 * Create Heroicons client
 */
export function createHeroiconsClient(): HeroiconsClient {
  return new HeroiconsClient()
}
