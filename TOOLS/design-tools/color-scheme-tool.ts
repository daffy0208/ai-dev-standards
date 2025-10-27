/**
 * LangChain Color Scheme Tool
 *
 * Generate complete, production-ready color schemes for design systems.
 * Creates primary, secondary, accent, neutral, and semantic color sets.
 *
 * @example
 * ```typescript
 * import { ColorSchemeTool } from './color-scheme-tool'
 *
 * const tool = new ColorSchemeTool()
 *
 * // Generate comprehensive color scheme
 * const result = await tool._call('#3B82F6')
 * console.log(result) // Returns full color system
 * ```
 */

import { Tool } from 'langchain/tools'

export interface ColorSystemOutput {
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  neutrals: ColorScale
  semantic: SemanticColors
  cssVariables: string
  tailwindConfig: string
}

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string // Base color
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface SemanticColors {
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale
}

export class ColorSchemeTool extends Tool {
  name = 'color_scheme_generator'
  description = `Generate a complete color scheme for design systems.
Input should be a primary hex color (e.g., #3B82F6).
Returns primary, secondary, accent, neutral, and semantic color scales.
Includes CSS variables and Tailwind configuration.`

  async _call(input: string): Promise<string> {
    try {
      // Parse and normalize color
      let primaryColor = input.trim()
      primaryColor = primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`

      // Validate hex color
      if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
        return `Invalid hex color format: ${primaryColor}. Expected format: #RRGGBB`
      }

      // Generate complete color system
      const colorSystem = this.generateColorSystem(primaryColor)

      // Format output
      return this.formatColorSystem(colorSystem)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error generating color scheme: ${errorMessage}`
    }
  }

  private generateColorSystem(primaryColor: string): ColorSystemOutput {
    // Generate primary scale
    const primary = this.generateScale(primaryColor)

    // Generate secondary (analogous)
    const primaryHsl = this.hexToHsl(primaryColor)
    const secondaryColor = this.hslToHex((primaryHsl.h + 30) % 360, primaryHsl.s, primaryHsl.l)
    const secondary = this.generateScale(secondaryColor)

    // Generate accent (complementary)
    const accentColor = this.hslToHex((primaryHsl.h + 180) % 360, primaryHsl.s, primaryHsl.l)
    const accent = this.generateScale(accentColor)

    // Generate neutrals (desaturated primary)
    const neutralColor = this.hslToHex(primaryHsl.h, 10, 50)
    const neutrals = this.generateScale(neutralColor)

    // Generate semantic colors
    const semantic: SemanticColors = {
      success: this.generateScale('#10B981'), // Green
      warning: this.generateScale('#F59E0B'), // Amber
      error: this.generateScale('#EF4444'), // Red
      info: this.generateScale('#3B82F6'), // Blue
    }

    // Generate CSS variables
    const cssVariables = this.generateCssVariables({
      primary,
      secondary,
      accent,
      neutrals,
      semantic,
    })

    // Generate Tailwind config
    const tailwindConfig = this.generateTailwindConfig({
      primary,
      secondary,
      accent,
      neutrals,
      semantic,
    })

    return {
      primary,
      secondary,
      accent,
      neutrals,
      semantic,
      cssVariables,
      tailwindConfig,
    }
  }

  private generateScale(baseColor: string): ColorScale {
    const hsl = this.hexToHsl(baseColor)

    return {
      50: this.hslToHex(hsl.h, hsl.s, 95),
      100: this.hslToHex(hsl.h, hsl.s, 90),
      200: this.hslToHex(hsl.h, hsl.s, 80),
      300: this.hslToHex(hsl.h, hsl.s, 70),
      400: this.hslToHex(hsl.h, hsl.s, 60),
      500: baseColor, // Base
      600: this.hslToHex(hsl.h, hsl.s, 40),
      700: this.hslToHex(hsl.h, hsl.s, 30),
      800: this.hslToHex(hsl.h, hsl.s, 20),
      900: this.hslToHex(hsl.h, hsl.s, 10),
      950: this.hslToHex(hsl.h, hsl.s, 5),
    }
  }

  private generateCssVariables(colors: Omit<ColorSystemOutput, 'cssVariables' | 'tailwindConfig'>): string {
    const lines: string[] = [':root {']

    // Primary
    lines.push('  /* Primary Colors */')
    for (const [shade, color] of Object.entries(colors.primary)) {
      lines.push(`  --color-primary-${shade}: ${color};`)
    }
    lines.push('')

    // Secondary
    lines.push('  /* Secondary Colors */')
    for (const [shade, color] of Object.entries(colors.secondary)) {
      lines.push(`  --color-secondary-${shade}: ${color};`)
    }
    lines.push('')

    // Accent
    lines.push('  /* Accent Colors */')
    for (const [shade, color] of Object.entries(colors.accent)) {
      lines.push(`  --color-accent-${shade}: ${color};`)
    }
    lines.push('')

    // Neutrals
    lines.push('  /* Neutral Colors */')
    for (const [shade, color] of Object.entries(colors.neutrals)) {
      lines.push(`  --color-neutral-${shade}: ${color};`)
    }
    lines.push('')

    // Semantic
    lines.push('  /* Semantic Colors */')
    for (const [name, scale] of Object.entries(colors.semantic)) {
      for (const [shade, color] of Object.entries(scale)) {
        lines.push(`  --color-${name}-${shade}: ${color};`)
      }
    }

    lines.push('}')
    return lines.join('\n')
  }

  private generateTailwindConfig(
    colors: Omit<ColorSystemOutput, 'cssVariables' | 'tailwindConfig'>
  ): string {
    const config = {
      theme: {
        extend: {
          colors: {
            primary: colors.primary,
            secondary: colors.secondary,
            accent: colors.accent,
            neutral: colors.neutrals,
            success: colors.semantic.success,
            warning: colors.semantic.warning,
            error: colors.semantic.error,
            info: colors.semantic.info,
          },
        },
      },
    }

    return JSON.stringify(config, null, 2)
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const rgb = this.hexToRgb(hex)
    let r = rgb.r / 255
    let g = rgb.g / 255
    let b = rgb.b / 255

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

  private formatColorSystem(system: ColorSystemOutput): string {
    const output: string[] = []

    output.push('COMPLETE COLOR SYSTEM')
    output.push('='.repeat(50))
    output.push('')

    // Primary colors
    output.push('PRIMARY COLORS:')
    for (const [shade, color] of Object.entries(system.primary)) {
      output.push(`  ${shade}: ${color}`)
    }
    output.push('')

    // Secondary colors
    output.push('SECONDARY COLORS:')
    for (const [shade, color] of Object.entries(system.secondary)) {
      output.push(`  ${shade}: ${color}`)
    }
    output.push('')

    // Accent colors
    output.push('ACCENT COLORS:')
    for (const [shade, color] of Object.entries(system.accent)) {
      output.push(`  ${shade}: ${color}`)
    }
    output.push('')

    // Neutral colors
    output.push('NEUTRAL COLORS:')
    for (const [shade, color] of Object.entries(system.neutrals)) {
      output.push(`  ${shade}: ${color}`)
    }
    output.push('')

    // Semantic colors
    output.push('SEMANTIC COLORS:')
    for (const [name, scale] of Object.entries(system.semantic)) {
      output.push(`  ${name.toUpperCase()}:`)
      output.push(`    Base: ${scale[500]}`)
    }
    output.push('')

    output.push('='.repeat(50))
    output.push('')
    output.push('CSS VARIABLES:')
    output.push('')
    output.push(system.cssVariables)
    output.push('')
    output.push('='.repeat(50))
    output.push('')
    output.push('TAILWIND CONFIG:')
    output.push('')
    output.push(system.tailwindConfig)

    return output.join('\n')
  }
}

/**
 * Create color scheme tool with simplified interface
 */
export function createColorSchemeTool(): ColorSchemeTool {
  return new ColorSchemeTool()
}
