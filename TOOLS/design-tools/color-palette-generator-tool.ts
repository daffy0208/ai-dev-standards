/**
 * LangChain Color Palette Generator Tool
 *
 * Generate comprehensive color palettes with harmonious combinations.
 * Supports complementary, analogous, triadic, and tetradic schemes.
 * Includes WCAG contrast checking and shade generation.
 *
 * @example
 * ```typescript
 * import { ColorPaletteGeneratorTool } from './color-palette-generator-tool'
 *
 * const tool = new ColorPaletteGeneratorTool()
 *
 * // Use in agent
 * const result = await tool._call('#3B82F6')
 * console.log(result) // Returns color palette with schemes
 * ```
 */

import { Tool } from 'langchain/tools'

export interface ColorPaletteOptions {
  generateShades?: boolean
  checkContrast?: boolean
  includeMeta?: boolean
}

export interface ColorShade {
  shade: number
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}

export interface ColorScheme {
  name: string
  colors: string[]
  description: string
}

export interface ColorPalette {
  baseColor: string
  schemes: ColorScheme[]
  shades?: ColorShade[]
  contrastRatios?: Record<string, number>
  wcagCompliance?: Record<string, string>
}

export class ColorPaletteGeneratorTool extends Tool {
  name = 'color_palette_generator'
  description = `Generate comprehensive color palettes from a base color.
Input should be a hex color code (e.g., #3B82F6 or 3B82F6).
Returns complementary, analogous, triadic, and tetradic color schemes.
Optionally includes 10-shade scales and WCAG contrast ratios.

Options can be passed as JSON string after color (optional):
{"generateShades": true, "checkContrast": true, "includeMeta": true}`

  async _call(input: string): Promise<string> {
    try {
      // Parse input
      const parts = input.trim().split(/\s+/)
      let baseColor = parts[0]
      let options: ColorPaletteOptions = {
        generateShades: true,
        checkContrast: true,
        includeMeta: true,
      }

      // Parse options if provided
      if (parts.length > 1) {
        try {
          options = { ...options, ...JSON.parse(parts.slice(1).join(' ')) }
        } catch {
          // Ignore invalid JSON, use defaults
        }
      }

      // Normalize color input
      baseColor = baseColor.startsWith('#') ? baseColor : `#${baseColor}`

      // Validate hex color
      if (!/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
        return `Invalid hex color format: ${baseColor}. Expected format: #RRGGBB`
      }

      // Generate palette
      const palette = this.generatePalette(baseColor, options)

      // Format output
      return this.formatPalette(palette, options)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error generating color palette: ${errorMessage}`
    }
  }

  private generatePalette(baseColor: string, options: ColorPaletteOptions): ColorPalette {
    const rgb = this.hexToRgb(baseColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)

    const palette: ColorPalette = {
      baseColor,
      schemes: [],
    }

    // Generate color schemes
    palette.schemes.push({
      name: 'Complementary',
      colors: [baseColor, this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)],
      description: 'Colors opposite on the color wheel',
    })

    palette.schemes.push({
      name: 'Analogous',
      colors: [
        this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
        baseColor,
        this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      ],
      description: 'Colors adjacent on the color wheel',
    })

    palette.schemes.push({
      name: 'Triadic',
      colors: [
        baseColor,
        this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
      ],
      description: 'Colors evenly spaced on the color wheel',
    })

    palette.schemes.push({
      name: 'Tetradic',
      colors: [
        baseColor,
        this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
      ],
      description: 'Two complementary color pairs',
    })

    // Generate shades if requested
    if (options.generateShades) {
      palette.shades = this.generateShades(baseColor)
    }

    // Check contrast if requested
    if (options.checkContrast) {
      palette.contrastRatios = this.calculateContrastRatios(baseColor)
      palette.wcagCompliance = this.checkWcagCompliance(palette.contrastRatios)
    }

    return palette
  }

  private generateShades(baseColor: string): ColorShade[] {
    const rgb = this.hexToRgb(baseColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)

    const shades: ColorShade[] = []
    const lightnesses = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]

    for (const lightness of lightnesses) {
      const shade = Math.round((lightness / 100) * 10) * 100
      const shadeHex = this.hslToHex(hsl.h, hsl.s, lightness)
      const shadeRgb = this.hexToRgb(shadeHex)

      shades.push({
        shade,
        hex: shadeHex,
        rgb: shadeRgb,
        hsl: { h: hsl.h, s: hsl.s, l: lightness },
      })
    }

    return shades
  }

  private calculateContrastRatios(baseColor: string): Record<string, number> {
    const white = '#FFFFFF'
    const black = '#000000'

    return {
      white: this.getContrastRatio(baseColor, white),
      black: this.getContrastRatio(baseColor, black),
    }
  }

  private checkWcagCompliance(ratios: Record<string, number>): Record<string, string> {
    const compliance: Record<string, string> = {}

    for (const [bg, ratio] of Object.entries(ratios)) {
      if (ratio >= 7) {
        compliance[bg] = 'AAA (Enhanced)'
      } else if (ratio >= 4.5) {
        compliance[bg] = 'AA (Minimum)'
      } else if (ratio >= 3) {
        compliance[bg] = 'AA Large (18pt+)'
      } else {
        compliance[bg] = 'Fail'
      }
    }

    return compliance
  }

  private getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1)
    const lum2 = this.getLuminance(color2)

    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  private getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex)
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      const normalized = val / 255
      return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`)
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  private hslToHex(h: number, s: number, l: number): string {
    h /= 360
    s /= 100
    l /= 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
  }

  private formatPalette(palette: ColorPalette, options: ColorPaletteOptions): string {
    const output: string[] = []

    output.push(`COLOR PALETTE FOR ${palette.baseColor}`)
    output.push('='.repeat(50))
    output.push('')

    // Color schemes
    output.push('COLOR SCHEMES:')
    output.push('')
    for (const scheme of palette.schemes) {
      output.push(`${scheme.name}:`)
      output.push(`  ${scheme.description}`)
      output.push(`  Colors: ${scheme.colors.join(', ')}`)
      output.push('')
    }

    // Shades
    if (palette.shades) {
      output.push('COLOR SHADES (10-step scale):')
      output.push('')
      for (const shade of palette.shades) {
        output.push(`  ${shade.shade}: ${shade.hex}`)
        if (options.includeMeta) {
          output.push(`    RGB: rgb(${shade.rgb.r}, ${shade.rgb.g}, ${shade.rgb.b})`)
          output.push(`    HSL: hsl(${shade.hsl.h}, ${shade.hsl.s}%, ${shade.hsl.l}%)`)
        }
      }
      output.push('')
    }

    // Contrast ratios
    if (palette.contrastRatios && palette.wcagCompliance) {
      output.push('WCAG CONTRAST COMPLIANCE:')
      output.push('')
      for (const [bg, ratio] of Object.entries(palette.contrastRatios)) {
        const compliance = palette.wcagCompliance[bg]
        output.push(`  On ${bg}: ${ratio.toFixed(2)}:1 - ${compliance}`)
      }
      output.push('')
    }

    output.push('='.repeat(50))
    output.push('Use these colors in your design system!')

    return output.join('\n')
  }
}

/**
 * Create color palette generator tool with simplified interface
 */
export function createColorPaletteGeneratorTool(): ColorPaletteGeneratorTool {
  return new ColorPaletteGeneratorTool()
}
