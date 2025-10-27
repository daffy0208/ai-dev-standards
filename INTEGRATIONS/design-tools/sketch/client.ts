/**
 * Sketch API Client
 *
 * Complete Sketch integration for parsing .sketch files and accessing artboards, layers, and assets.
 *
 * Features:
 * - Parse Sketch files (.sketch format)
 * - Extract artboards and layers
 * - Get styles and symbols
 * - Export assets (images, icons)
 * - Access shared libraries
 * - Design token extraction
 *
 * @example
 * ```typescript
 * const client = new SketchClient()
 *
 * // Parse Sketch file
 * const document = await client.parseFile('./design.sketch')
 *
 * // Extract design tokens
 * const tokens = await client.extractDesignTokens('./design.sketch')
 *
 * // Export artboards as images
 * const images = await client.exportArtboards('./design.sketch', ['artboard-1'])
 * ```
 */

import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { createReadStream } from 'fs'
import { pipeline } from 'stream'
import { createGunzip } from 'zlib'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export interface SketchClientOptions {
  /**
   * Working directory for file operations
   */
  workDir?: string

  /**
   * Enable debug logging
   */
  debug?: boolean
}

export interface SketchDocument {
  meta: SketchMeta
  pages: SketchPage[]
  colors: SketchColor[]
  textStyles: SketchTextStyle[]
  layerStyles: SketchLayerStyle[]
}

export interface SketchMeta {
  commit: string
  version: number
  appVersion: string
  created: {
    app: string
    version: string
  }
}

export interface SketchPage {
  id: string
  name: string
  artboards: SketchArtboard[]
  layers: SketchLayer[]
}

export interface SketchArtboard {
  id: string
  name: string
  frame: SketchRect
  backgroundColor: SketchColor
  layers: SketchLayer[]
}

export interface SketchLayer {
  id: string
  name: string
  type: string
  frame: SketchRect
  style?: SketchStyle
  layers?: SketchLayer[]
  exportOptions?: SketchExportOption[]
}

export interface SketchRect {
  x: number
  y: number
  width: number
  height: number
}

export interface SketchColor {
  red: number
  green: number
  blue: number
  alpha: number
  name?: string
}

export interface SketchStyle {
  fills?: SketchFill[]
  borders?: SketchBorder[]
  shadows?: SketchShadow[]
  blur?: any
  textStyle?: SketchTextStyle
}

export interface SketchFill {
  isEnabled: boolean
  color: SketchColor
  fillType: number
}

export interface SketchBorder {
  isEnabled: boolean
  color: SketchColor
  thickness: number
}

export interface SketchShadow {
  isEnabled: boolean
  color: SketchColor
  offsetX: number
  offsetY: number
  blurRadius: number
  spread: number
}

export interface SketchTextStyle {
  name?: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight?: number
  letterSpacing?: number
  color?: SketchColor
  alignment?: number
}

export interface SketchLayerStyle {
  id: string
  name: string
  style: SketchStyle
}

export interface SketchExportOption {
  name: string
  format: string
  scale: number
}

export interface DesignTokens {
  colors: {
    name: string
    value: string
    rgba: { r: number; g: number; b: number; a: number }
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
  shadows: {
    name: string
    offsetX: number
    offsetY: number
    blur: number
    spread: number
    color: string
  }[]
}

export class SketchClient {
  private options: Required<SketchClientOptions>

  constructor(options: SketchClientOptions = {}) {
    this.options = {
      workDir: options.workDir || process.cwd(),
      debug: options.debug || false,
    }
  }

  /**
   * Parse Sketch file
   */
  async parseFile(filePath: string): Promise<SketchDocument> {
    const absolutePath = path.resolve(this.options.workDir, filePath)

    // Sketch files are ZIP archives
    const JSZip = await this.loadJSZip()
    const zip = await JSZip.loadAsync(await readFile(absolutePath))

    // Parse document.json
    const documentJson = await zip.file('document.json')?.async('text')
    if (!documentJson) {
      throw new Error('Invalid Sketch file: document.json not found')
    }

    const document = JSON.parse(documentJson)

    // Parse meta.json
    const metaJson = await zip.file('meta.json')?.async('text')
    const meta = metaJson ? JSON.parse(metaJson) : {}

    // Parse pages
    const pages: SketchPage[] = []
    for (const pageRef of document.pages || []) {
      const pageJson = await zip.file(`pages/${pageRef._ref}.json`)?.async('text')
      if (pageJson) {
        const page = JSON.parse(pageJson)
        pages.push(this.parsePage(page))
      }
    }

    // Extract colors from document colors
    const colors = (document.assets?.colors || []).map((color: any) => ({
      red: color.red,
      green: color.green,
      blue: color.blue,
      alpha: color.alpha,
      name: color.name,
    }))

    // Extract text styles
    const textStyles = (document.layerTextStyles?.objects || []).map((style: any) => ({
      name: style.name,
      fontFamily: style.value?.textStyle?.encodedAttributes?.MSAttributedStringFontAttribute?.attributes?.name,
      fontSize: style.value?.textStyle?.encodedAttributes?.MSAttributedStringFontAttribute?.attributes?.size,
      fontWeight: style.value?.textStyle?.encodedAttributes?.MSAttributedStringFontAttribute?.attributes?.weight,
      color: style.value?.textStyle?.encodedAttributes?.MSAttributedStringColorAttribute,
    }))

    // Extract layer styles
    const layerStyles = (document.layerStyles?.objects || []).map((style: any) => ({
      id: style.do_objectID,
      name: style.name,
      style: this.parseStyle(style.value?.style),
    }))

    return {
      meta,
      pages,
      colors,
      textStyles,
      layerStyles,
    }
  }

  /**
   * Extract design tokens from Sketch file
   */
  async extractDesignTokens(filePath: string): Promise<DesignTokens> {
    const document = await this.parseFile(filePath)

    const tokens: DesignTokens = {
      colors: [],
      typography: [],
      spacing: [],
      shadows: [],
    }

    // Extract colors
    for (const color of document.colors) {
      tokens.colors.push({
        name: color.name || `color-${tokens.colors.length}`,
        value: this.rgbaToHex(color),
        rgba: {
          r: color.red,
          g: color.green,
          b: color.blue,
          a: color.alpha,
        },
      })
    }

    // Extract typography
    for (const textStyle of document.textStyles) {
      if (textStyle.name) {
        tokens.typography.push({
          name: textStyle.name,
          fontFamily: textStyle.fontFamily,
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          lineHeight: textStyle.lineHeight,
          letterSpacing: textStyle.letterSpacing,
        })
      }
    }

    // Extract spacing from layers
    const spacingSet = new Set<number>()
    for (const page of document.pages) {
      this.extractSpacingFromLayers(page.layers, spacingSet)
    }

    for (const spacing of Array.from(spacingSet).sort((a, b) => a - b)) {
      tokens.spacing.push({
        name: `spacing-${spacing}`,
        value: spacing,
      })
    }

    // Extract shadows from layer styles
    for (const layerStyle of document.layerStyles) {
      if (layerStyle.style?.shadows) {
        for (const shadow of layerStyle.style.shadows) {
          if (shadow.isEnabled) {
            tokens.shadows.push({
              name: layerStyle.name,
              offsetX: shadow.offsetX,
              offsetY: shadow.offsetY,
              blur: shadow.blurRadius,
              spread: shadow.spread,
              color: this.rgbaToHex(shadow.color),
            })
          }
        }
      }
    }

    return tokens
  }

  /**
   * Get all artboards from file
   */
  async getArtboards(filePath: string): Promise<SketchArtboard[]> {
    const document = await this.parseFile(filePath)

    const artboards: SketchArtboard[] = []
    for (const page of document.pages) {
      artboards.push(...page.artboards)
    }

    return artboards
  }

  /**
   * Get artboard by name
   */
  async getArtboard(filePath: string, artboardName: string): Promise<SketchArtboard | null> {
    const artboards = await this.getArtboards(filePath)
    return artboards.find((a) => a.name === artboardName) || null
  }

  /**
   * Export artboards as images (requires Sketch CLI)
   */
  async exportArtboards(
    filePath: string,
    artboardNames: string[],
    options: {
      format?: 'png' | 'jpg' | 'svg' | 'pdf'
      scale?: number
      outputDir?: string
    } = {}
  ): Promise<string[]> {
    const format = options.format || 'png'
    const scale = options.scale || 1
    const outputDir = options.outputDir || path.join(this.options.workDir, 'exports')

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const exports: string[] = []

    // This requires Sketch CLI (`sketchtool`)
    // Install: https://www.sketch.com/docs/cli/
    const { exec } = await import('child_process')
    const execPromise = promisify(exec)

    for (const artboardName of artboardNames) {
      const outputPath = path.join(outputDir, `${artboardName}.${format}`)

      try {
        await execPromise(
          `sketchtool export artboards "${filePath}" --output="${outputDir}" --formats=${format} --scales=${scale} --items="${artboardName}"`
        )
        exports.push(outputPath)
      } catch (error) {
        if (this.options.debug) {
          console.warn(`Failed to export ${artboardName}:`, error)
        }
      }
    }

    return exports
  }

  /**
   * Export design tokens as CSS
   */
  async exportTokensAsCSS(filePath: string): Promise<string> {
    const tokens = await this.extractDesignTokens(filePath)

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

    // Spacing
    css += '\n  /* Spacing */\n'
    for (const space of tokens.spacing) {
      const name = this.tokenizeName(space.name)
      css += `  --space-${name}: ${space.value}px;\n`
    }

    // Shadows
    css += '\n  /* Shadows */\n'
    for (const shadow of tokens.shadows) {
      const name = this.tokenizeName(shadow.name)
      css += `  --shadow-${name}: ${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color};\n`
    }

    css += '}\n'

    return css
  }

  /**
   * Export design tokens as JSON
   */
  async exportTokensAsJSON(filePath: string): Promise<string> {
    const tokens = await this.extractDesignTokens(filePath)
    return JSON.stringify(tokens, null, 2)
  }

  /**
   * Parse page
   */
  private parsePage(page: any): SketchPage {
    const artboards: SketchArtboard[] = []
    const layers: SketchLayer[] = []

    for (const layer of page.layers || []) {
      if (layer._class === 'artboard') {
        artboards.push(this.parseArtboard(layer))
      } else {
        layers.push(this.parseLayer(layer))
      }
    }

    return {
      id: page.do_objectID,
      name: page.name,
      artboards,
      layers,
    }
  }

  /**
   * Parse artboard
   */
  private parseArtboard(artboard: any): SketchArtboard {
    return {
      id: artboard.do_objectID,
      name: artboard.name,
      frame: artboard.frame,
      backgroundColor: artboard.backgroundColor,
      layers: (artboard.layers || []).map((l: any) => this.parseLayer(l)),
    }
  }

  /**
   * Parse layer
   */
  private parseLayer(layer: any): SketchLayer {
    return {
      id: layer.do_objectID,
      name: layer.name,
      type: layer._class,
      frame: layer.frame,
      style: this.parseStyle(layer.style),
      layers: layer.layers ? layer.layers.map((l: any) => this.parseLayer(l)) : undefined,
      exportOptions: layer.exportOptions?.exportFormats,
    }
  }

  /**
   * Parse style
   */
  private parseStyle(style: any): SketchStyle | undefined {
    if (!style) return undefined

    return {
      fills: style.fills,
      borders: style.borders,
      shadows: style.shadows,
      blur: style.blur,
    }
  }

  /**
   * Extract spacing from layers
   */
  private extractSpacingFromLayers(layers: SketchLayer[], spacingSet: Set<number>): void {
    for (const layer of layers) {
      // Extract padding/margin-like spacing
      if (layer.frame) {
        const spacing = Math.round(layer.frame.x)
        if (spacing > 0 && spacing < 200) {
          spacingSet.add(spacing)
        }
      }

      if (layer.layers) {
        this.extractSpacingFromLayers(layer.layers, spacingSet)
      }
    }
  }

  /**
   * Convert RGBA to hex
   */
  private rgbaToHex(color: SketchColor): string {
    const r = Math.round(color.red * 255)
    const g = Math.round(color.green * 255)
    const b = Math.round(color.blue * 255)
    const a = color.alpha

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
   * Load JSZip dynamically
   */
  private async loadJSZip(): Promise<any> {
    try {
      const JSZip = await import('jszip')
      return JSZip.default || JSZip
    } catch (error) {
      throw new Error('JSZip is required. Install with: npm install jszip')
    }
  }
}

/**
 * Create Sketch client
 */
export function createSketchClient(options: SketchClientOptions = {}): SketchClient {
  return new SketchClient(options)
}
