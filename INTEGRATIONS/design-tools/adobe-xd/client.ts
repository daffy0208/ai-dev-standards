/**
 * Adobe XD API Client
 *
 * Complete Adobe XD Cloud API integration for accessing design documents.
 *
 * Features:
 * - Access XD cloud documents
 * - Extract design specs
 * - Get components and symbols
 * - Export assets
 * - Access shared links
 *
 * @example
 * ```typescript
 * const client = new AdobeXDClient({
 *   accessToken: process.env.ADOBE_ACCESS_TOKEN
 * })
 *
 * // Get document
 * const document = await client.getDocument('doc-id')
 *
 * // Export artboard
 * const rendition = await client.exportArtboard('doc-id', 'artboard-id', {
 *   format: 'png',
 *   scale: 2
 * })
 * ```
 */

export interface AdobeXDClientOptions {
  /**
   * Adobe access token
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

export interface XDDocument {
  id: string
  name: string
  created: string
  modified: string
  version: number
  artboards: XDArtboard[]
  colors: XDColor[]
  characterStyles: XDCharacterStyle[]
  components: XDComponent[]
}

export interface XDArtboard {
  id: string
  name: string
  width: number
  height: number
  backgroundColor: XDColor
  children: XDNode[]
}

export interface XDNode {
  id: string
  name: string
  type: string
  transform: XDTransform
  style?: XDStyle
  text?: XDText
  children?: XDNode[]
}

export interface XDTransform {
  tx: number
  ty: number
  a: number
  b: number
  c: number
  d: number
}

export interface XDStyle {
  fill?: XDFill
  stroke?: XDStroke
  opacity?: number
  filters?: XDFilter[]
}

export interface XDFill {
  type: 'solid' | 'gradient' | 'pattern'
  color?: XDColor
  gradient?: any
}

export interface XDStroke {
  type: 'solid'
  color: XDColor
  width: number
}

export interface XDFilter {
  type: 'dropShadow' | 'blur' | 'backgroundBlur'
  params: any
}

export interface XDColor {
  r: number
  g: number
  b: number
  a: number
  name?: string
}

export interface XDText {
  rawText: string
  paragraphs: XDParagraph[]
}

export interface XDParagraph {
  lines: XDLine[]
}

export interface XDLine {
  from: number
  to: number
  x: number
  y: number
  baseline: number
  height: number
}

export interface XDCharacterStyle {
  name: string
  fontFamily: string
  fontStyle: string
  fontSize: number
  fill: XDFill
  charSpacing: number
  lineSpacing: number
  underline: boolean
}

export interface XDComponent {
  id: string
  name: string
  description: string
  isPublished: boolean
}

export interface ExportOptions {
  format?: 'png' | 'jpg' | 'svg' | 'pdf'
  scale?: number
  quality?: number
}

export interface ExportResult {
  id: string
  name: string
  url: string
  format: string
}

export class AdobeXDClient {
  private options: Required<AdobeXDClientOptions>

  constructor(options: AdobeXDClientOptions = {}) {
    this.options = {
      accessToken: options.accessToken || process.env.ADOBE_ACCESS_TOKEN || '',
      timeout: options.timeout || 30000,
      baseUrl: options.baseUrl || 'https://cc-api-storage.adobe.io/v1/xd',
    }

    if (!this.options.accessToken) {
      throw new Error('Adobe access token is required')
    }
  }

  /**
   * Get document metadata
   */
  async getDocument(documentId: string): Promise<XDDocument> {
    const response = await this.request(`/documents/${documentId}`)
    return this.parseDocument(response)
  }

  /**
   * Get artboards from document
   */
  async getArtboards(documentId: string): Promise<XDArtboard[]> {
    const document = await this.getDocument(documentId)
    return document.artboards
  }

  /**
   * Get specific artboard
   */
  async getArtboard(documentId: string, artboardId: string): Promise<XDArtboard | null> {
    const artboards = await this.getArtboards(documentId)
    return artboards.find((a) => a.id === artboardId) || null
  }

  /**
   * Export artboard as image
   */
  async exportArtboard(
    documentId: string,
    artboardId: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const format = options.format || 'png'
    const scale = options.scale || 1
    const quality = options.quality || 100

    const response = await this.request(
      `/documents/${documentId}/artboards/${artboardId}/renditions`,
      {
        method: 'POST',
        body: JSON.stringify({
          type: format,
          scale,
          quality,
        }),
      }
    )

    const artboard = await this.getArtboard(documentId, artboardId)

    return {
      id: artboardId,
      name: artboard?.name || artboardId,
      url: response.rendition.href,
      format,
    }
  }

  /**
   * Export multiple artboards
   */
  async exportArtboards(
    documentId: string,
    artboardIds: string[],
    options: ExportOptions = {}
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = []

    for (const artboardId of artboardIds) {
      try {
        const result = await this.exportArtboard(documentId, artboardId, options)
        results.push(result)
      } catch (error) {
        console.error(`Failed to export artboard ${artboardId}:`, error)
      }
    }

    return results
  }

  /**
   * Get components from document
   */
  async getComponents(documentId: string): Promise<XDComponent[]> {
    const document = await this.getDocument(documentId)
    return document.components
  }

  /**
   * Get color assets
   */
  async getColors(documentId: string): Promise<XDColor[]> {
    const document = await this.getDocument(documentId)
    return document.colors
  }

  /**
   * Get character styles (typography)
   */
  async getCharacterStyles(documentId: string): Promise<XDCharacterStyle[]> {
    const document = await this.getDocument(documentId)
    return document.characterStyles
  }

  /**
   * Get shared link for document
   */
  async createSharedLink(
    documentId: string,
    options: {
      accessLevel?: 'view' | 'edit'
      allowComments?: boolean
      expiresAt?: string
    } = {}
  ): Promise<{ url: string; id: string }> {
    const response = await this.request(`/documents/${documentId}/share`, {
      method: 'POST',
      body: JSON.stringify({
        accessLevel: options.accessLevel || 'view',
        allowComments: options.allowComments ?? true,
        expiresAt: options.expiresAt,
      }),
    })

    return {
      url: response.url,
      id: response.id,
    }
  }

  /**
   * Extract design tokens from document
   */
  async extractDesignTokens(documentId: string): Promise<{
    colors: { name: string; value: string; rgba: XDColor }[]
    typography: {
      name: string
      fontFamily: string
      fontSize: number
      fontWeight: string
      lineHeight?: number
    }[]
  }> {
    const document = await this.getDocument(documentId)

    const colors = document.colors.map((color, index) => ({
      name: color.name || `color-${index}`,
      value: this.rgbaToHex(color),
      rgba: color,
    }))

    const typography = document.characterStyles.map((style) => ({
      name: style.name,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontStyle,
      lineHeight: style.lineSpacing,
    }))

    return { colors, typography }
  }

  /**
   * Export design tokens as CSS
   */
  async exportTokensAsCSS(documentId: string): Promise<string> {
    const tokens = await this.extractDesignTokens(documentId)

    let css = ':root {\n'

    // Colors
    css += '  /* Colors */\n'
    for (const color of tokens.colors) {
      const name = this.tokenizeName(color.name)
      css += `  --color-${name}: ${color.value};\n`
    }

    // Typography
    css += '\n  /* Typography */\n'
    for (const typo of tokens.typography) {
      const name = this.tokenizeName(typo.name)
      css += `  --font-${name}-family: ${typo.fontFamily};\n`
      css += `  --font-${name}-size: ${typo.fontSize}px;\n`
      css += `  --font-${name}-weight: ${typo.fontWeight};\n`
    }

    css += '}\n'

    return css
  }

  /**
   * Export design tokens as JSON
   */
  async exportTokensAsJSON(documentId: string): Promise<string> {
    const tokens = await this.extractDesignTokens(documentId)
    return JSON.stringify(tokens, null, 2)
  }

  /**
   * Parse document response
   */
  private parseDocument(data: any): XDDocument {
    return {
      id: data.id,
      name: data.name,
      created: data.created,
      modified: data.modified,
      version: data.version,
      artboards: data.artboards?.resources || [],
      colors: data.resources?.colors || [],
      characterStyles: data.resources?.characterStyles || [],
      components: data.resources?.components || [],
    }
  }

  /**
   * Convert RGBA to hex
   */
  private rgbaToHex(color: XDColor): string {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
    const a = color.a

    if (a < 1) {
      const alpha = Math.round(a * 255)
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${alpha.toString(16).padStart(2, '0')}`
    }

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
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
        'Authorization': `Bearer ${this.options.accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': process.env.ADOBE_API_KEY || '',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.options.timeout),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Adobe XD API error: ${response.status} ${response.statusText} - ${error.message || 'Unknown error'}`
      )
    }

    return response.json()
  }
}

/**
 * Create Adobe XD client from environment variables
 */
export function createAdobeXDClient(options: AdobeXDClientOptions = {}): AdobeXDClient {
  return new AdobeXDClient(options)
}
