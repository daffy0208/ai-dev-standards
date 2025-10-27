/**
 * Figma API Client
 *
 * Complete Figma integration for accessing design files, components, and assets.
 *
 * Features:
 * - Get file data (nodes, styles, components)
 * - Extract design tokens (colors, typography, spacing)
 * - Export assets (images, icons, SVGs)
 * - Get component sets and variants
 * - Access team libraries
 * - Version history
 *
 * @example
 * ```typescript
 * const client = new FigmaClient({
 *   accessToken: process.env.FIGMA_ACCESS_TOKEN
 * })
 *
 * // Get file data
 * const file = await client.getFile('abc123')
 *
 * // Extract design tokens
 * const tokens = await client.extractDesignTokens('abc123')
 *
 * // Export assets
 * const images = await client.exportImages('abc123', ['node-id-1', 'node-id-2'])
 * ```
 */

export interface FigmaClientOptions {
  /**
   * Figma personal access token
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

export interface FigmaFile {
  name: string
  lastModified: string
  thumbnailUrl: string
  version: string
  document: FigmaNode
  components: Record<string, FigmaComponent>
  styles: Record<string, FigmaStyle>
  schemaVersion: number
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  backgroundColor?: FigmaColor
  fills?: FigmaFill[]
  strokes?: FigmaStroke[]
  effects?: FigmaEffect[]
  style?: FigmaTextStyle
  absoluteBoundingBox?: FigmaBoundingBox
  [key: string]: any
}

export interface FigmaComponent {
  key: string
  name: string
  description: string
  componentSetId?: string
  documentationLinks?: string[]
}

export interface FigmaStyle {
  key: string
  name: string
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
  description: string
}

export interface FigmaColor {
  r: number
  g: number
  b: number
  a: number
}

export interface FigmaFill {
  type: string
  color?: FigmaColor
  opacity?: number
}

export interface FigmaStroke {
  type: string
  color?: FigmaColor
  opacity?: number
}

export interface FigmaEffect {
  type: string
  visible: boolean
  radius?: number
  color?: FigmaColor
}

export interface FigmaTextStyle {
  fontFamily: string
  fontWeight: number
  fontSize: number
  lineHeightPx?: number
  letterSpacing?: number
}

export interface FigmaBoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface DesignTokens {
  colors: {
    name: string
    value: string
    rgb: { r: number; g: number; b: number; a: number }
  }[]
  typography: {
    name: string
    fontFamily: string
    fontSize: number
    fontWeight: number
    lineHeight?: number
    letterSpacing?: number
  }[]
  spacing: {
    name: string
    value: number
  }[]
  effects: {
    name: string
    type: string
    value: any
  }[]
}

export interface ExportOptions {
  format?: 'png' | 'jpg' | 'svg' | 'pdf'
  scale?: number
  constraint?: {
    type: 'SCALE' | 'WIDTH' | 'HEIGHT'
    value: number
  }
}

export interface ExportResult {
  id: string
  name: string
  url: string
  format: string
}

export class FigmaClient {
  private options: Required<FigmaClientOptions>

  constructor(options: FigmaClientOptions = {}) {
    this.options = {
      accessToken: options.accessToken || process.env.FIGMA_ACCESS_TOKEN || '',
      timeout: options.timeout || 30000,
      baseUrl: options.baseUrl || 'https://api.figma.com/v1',
    }

    if (!this.options.accessToken) {
      throw new Error('Figma access token is required')
    }
  }

  /**
   * Get file data including nodes, components, and styles
   */
  async getFile(fileKey: string): Promise<FigmaFile> {
    const response = await this.request(`/files/${fileKey}`)
    return response
  }

  /**
   * Get specific nodes from a file
   */
  async getNodes(fileKey: string, nodeIds: string[]): Promise<Record<string, FigmaNode>> {
    const ids = nodeIds.join(',')
    const response = await this.request(`/files/${fileKey}/nodes?ids=${ids}`)
    return response.nodes
  }

  /**
   * Get file components
   */
  async getFileComponents(fileKey: string): Promise<Record<string, FigmaComponent>> {
    const file = await this.getFile(fileKey)
    return file.components
  }

  /**
   * Get file styles
   */
  async getFileStyles(fileKey: string): Promise<Record<string, FigmaStyle>> {
    const file = await this.getFile(fileKey)
    return file.styles
  }

  /**
   * Export images from nodes
   */
  async exportImages(
    fileKey: string,
    nodeIds: string[],
    options: ExportOptions = {}
  ): Promise<ExportResult[]> {
    const format = options.format || 'png'
    const scale = options.scale || 1
    const ids = nodeIds.join(',')

    const response = await this.request(
      `/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`
    )

    const results: ExportResult[] = []
    for (const [id, url] of Object.entries(response.images as Record<string, string>)) {
      const nodes = await this.getNodes(fileKey, [id])
      const node = nodes[id]

      results.push({
        id,
        name: node?.name || id,
        url,
        format,
      })
    }

    return results
  }

  /**
   * Extract design tokens from file
   */
  async extractDesignTokens(fileKey: string): Promise<DesignTokens> {
    const file = await this.getFile(fileKey)

    const tokens: DesignTokens = {
      colors: [],
      typography: [],
      spacing: [],
      effects: [],
    }

    // Extract color styles
    for (const [key, style] of Object.entries(file.styles)) {
      if (style.styleType === 'FILL') {
        // Find the node with this style
        const node = this.findNodeByStyle(file.document, key)
        if (node?.fills?.[0]?.color) {
          const color = node.fills[0].color
          tokens.colors.push({
            name: style.name,
            value: this.rgbToHex(color),
            rgb: color,
          })
        }
      }

      if (style.styleType === 'TEXT') {
        const node = this.findNodeByStyle(file.document, key)
        if (node?.style) {
          tokens.typography.push({
            name: style.name,
            fontFamily: node.style.fontFamily,
            fontSize: node.style.fontSize,
            fontWeight: node.style.fontWeight,
            lineHeight: node.style.lineHeightPx,
            letterSpacing: node.style.letterSpacing,
          })
        }
      }

      if (style.styleType === 'EFFECT') {
        const node = this.findNodeByStyle(file.document, key)
        if (node?.effects) {
          tokens.effects.push({
            name: style.name,
            type: style.styleType,
            value: node.effects,
          })
        }
      }
    }

    // Extract spacing from auto-layout
    this.extractSpacing(file.document, tokens.spacing)

    return tokens
  }

  /**
   * Get component variations (component sets)
   */
  async getComponentSets(fileKey: string): Promise<Record<string, FigmaComponent[]>> {
    const components = await this.getFileComponents(fileKey)
    const componentSets: Record<string, FigmaComponent[]> = {}

    for (const component of Object.values(components)) {
      if (component.componentSetId) {
        if (!componentSets[component.componentSetId]) {
          componentSets[component.componentSetId] = []
        }
        componentSets[component.componentSetId].push(component)
      }
    }

    return componentSets
  }

  /**
   * Get team components (library)
   */
  async getTeamComponents(teamId: string): Promise<Record<string, FigmaComponent>> {
    const response = await this.request(`/teams/${teamId}/components`)
    return response.meta.components
  }

  /**
   * Get team styles (library)
   */
  async getTeamStyles(teamId: string): Promise<Record<string, FigmaStyle>> {
    const response = await this.request(`/teams/${teamId}/styles`)
    return response.meta.styles
  }

  /**
   * Get file version history
   */
  async getVersions(fileKey: string): Promise<any[]> {
    const response = await this.request(`/files/${fileKey}/versions`)
    return response.versions
  }

  /**
   * Get comments on file
   */
  async getComments(fileKey: string): Promise<any[]> {
    const response = await this.request(`/files/${fileKey}/comments`)
    return response.comments
  }

  /**
   * Export design tokens as CSS variables
   */
  async exportTokensAsCSS(fileKey: string): Promise<string> {
    const tokens = await this.extractDesignTokens(fileKey)

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
      if (typo.lineHeight) {
        css += `  --font-${name}-line-height: ${typo.lineHeight}px;\n`
      }
    }

    // Spacing
    css += '\n  /* Spacing */\n'
    for (const space of tokens.spacing) {
      const name = this.tokenizeName(space.name)
      css += `  --space-${name}: ${space.value}px;\n`
    }

    css += '}\n'

    return css
  }

  /**
   * Export design tokens as JSON
   */
  async exportTokensAsJSON(fileKey: string): Promise<string> {
    const tokens = await this.extractDesignTokens(fileKey)
    return JSON.stringify(tokens, null, 2)
  }

  /**
   * Convert RGB to Hex
   */
  private rgbToHex(color: FigmaColor): string {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)
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
   * Find node by style ID
   */
  private findNodeByStyle(node: FigmaNode, styleId: string): FigmaNode | null {
    if ((node as any).styles) {
      for (const value of Object.values((node as any).styles)) {
        if (value === styleId) {
          return node
        }
      }
    }

    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeByStyle(child, styleId)
        if (found) return found
      }
    }

    return null
  }

  /**
   * Extract spacing values from auto-layout
   */
  private extractSpacing(
    node: FigmaNode,
    spacing: DesignTokens['spacing'],
    visited = new Set<number>()
  ): void {
    const layoutProps = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing']

    for (const prop of layoutProps) {
      if (node[prop] && typeof node[prop] === 'number') {
        const value = node[prop] as number
        if (!visited.has(value) && value > 0) {
          visited.add(value)
          spacing.push({
            name: `spacing-${value}`,
            value,
          })
        }
      }
    }

    if (node.children) {
      for (const child of node.children) {
        this.extractSpacing(child, spacing, visited)
      }
    }
  }

  /**
   * Make API request
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.options.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Figma-Token': this.options.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.options.timeout),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Figma API error: ${response.status} ${response.statusText} - ${error.message || 'Unknown error'}`
      )
    }

    return response.json()
  }
}

/**
 * Create Figma client from environment variables
 */
export function createFigmaClient(options: FigmaClientOptions = {}): FigmaClient {
  return new FigmaClient(options)
}
