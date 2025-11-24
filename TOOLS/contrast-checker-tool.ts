/**
 * LangChain Contrast Checker Tool
 *
 * Validate WCAG color contrast ratios for accessibility compliance.
 * Provides recommendations for accessible color alternatives.
 *
 * @example
 * ```typescript
 * import { ContrastCheckerTool } from './contrast-checker-tool'
 *
 * const tool = new ContrastCheckerTool()
 *
 * // Check contrast between two colors
 * const result = await tool._call('#3B82F6 #FFFFFF')
 * console.log(result) // Returns contrast ratio and WCAG compliance
 * ```
 */

import { Tool } from 'langchain/tools'

export interface ContrastResult {
  foreground: string
  background: string
  contrastRatio: number
  wcagLevel: string
  normalText: WcagCompliance
  largeText: WcagCompliance
  uiComponents: WcagCompliance
  suggestions?: ColorSuggestion[]
}

export interface WcagCompliance {
  aa: boolean
  aaa: boolean
  status: string
}

export interface ColorSuggestion {
  color: string
  contrastRatio: number
  description: string
}

export class ContrastCheckerTool extends Tool {
  name = 'contrast_checker'
  description = `Check WCAG contrast ratio between foreground and background colors.
Input should be two hex colors separated by space (e.g., "#3B82F6 #FFFFFF").
Returns contrast ratio, WCAG compliance levels, and suggestions for improvement.

WCAG Standards:
- Normal text: 4.5:1 (AA), 7:1 (AAA)
- Large text (18pt+): 3:1 (AA), 4.5:1 (AAA)
- UI components: 3:1 (AA minimum)`

  async _call(input: string): Promise<string> {
    try {
      // Parse input colors
      const colors = input.trim().split(/\s+/)
      if (colors.length !== 2) {
        return 'Invalid input. Expected two hex colors separated by space (e.g., "#3B82F6 #FFFFFF")'
      }

      let [foreground, background] = colors

      // Normalize color input
      foreground = foreground.startsWith('#') ? foreground : `#${foreground}`
      background = background.startsWith('#') ? background : `#${background}`

      // Validate hex colors
      if (!/^#[0-9A-Fa-f]{6}$/.test(foreground) || !/^#[0-9A-Fa-f]{6}$/.test(background)) {
        return `Invalid hex color format. Expected format: #RRGGBB`
      }

      // Calculate contrast
      const result = this.checkContrast(foreground, background)

      // Format output
      return this.formatResult(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error checking contrast: ${errorMessage}`
    }
  }

  private checkContrast(foreground: string, background: string): ContrastResult {
    const contrastRatio = this.getContrastRatio(foreground, background)

    const result: ContrastResult = {
      foreground,
      background,
      contrastRatio,
      wcagLevel: this.getWcagLevel(contrastRatio),
      normalText: this.checkCompliance(contrastRatio, 4.5, 7),
      largeText: this.checkCompliance(contrastRatio, 3, 4.5),
      uiComponents: this.checkCompliance(contrastRatio, 3, 3)
    }

    // Generate suggestions if not AAA compliant for normal text
    if (!result.normalText.aaa) {
      result.suggestions = this.generateSuggestions(foreground, background)
    }

    return result
  }

  private checkCompliance(
    ratio: number,
    aaThreshold: number,
    aaaThreshold: number
  ): WcagCompliance {
    const aa = ratio >= aaThreshold
    const aaa = ratio >= aaaThreshold

    let status: string
    if (aaa) {
      status = 'Pass AAA (Enhanced)'
    } else if (aa) {
      status = 'Pass AA (Minimum)'
    } else {
      status = 'Fail'
    }

    return { aa, aaa, status }
  }

  private getWcagLevel(ratio: number): string {
    if (ratio >= 7) return 'AAA'
    if (ratio >= 4.5) return 'AA'
    if (ratio >= 3) return 'AA Large'
    return 'Fail'
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
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      const normalized = val / 255
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4)
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
      b: parseInt(result[3], 16)
    }
  }

  private generateSuggestions(foreground: string, background: string): ColorSuggestion[] {
    const suggestions: ColorSuggestion[] = []
    const fgRgb = this.hexToRgb(foreground)
    const bgRgb = this.hexToRgb(background)

    // Try darker foreground
    const darkerFg = this.adjustBrightness(fgRgb, 0.7)
    const darkerFgHex = this.rgbToHex(darkerFg)
    const darkerContrast = this.getContrastRatio(darkerFgHex, background)
    if (darkerContrast >= 4.5) {
      suggestions.push({
        color: darkerFgHex,
        contrastRatio: darkerContrast,
        description: 'Darker foreground color'
      })
    }

    // Try lighter foreground
    const lighterFg = this.adjustBrightness(fgRgb, 1.3)
    const lighterFgHex = this.rgbToHex(lighterFg)
    const lighterContrast = this.getContrastRatio(lighterFgHex, background)
    if (lighterContrast >= 4.5) {
      suggestions.push({
        color: lighterFgHex,
        contrastRatio: lighterContrast,
        description: 'Lighter foreground color'
      })
    }

    // Try pure black or white foreground
    const blackContrast = this.getContrastRatio('#000000', background)
    if (blackContrast >= 4.5) {
      suggestions.push({
        color: '#000000',
        contrastRatio: blackContrast,
        description: 'Pure black foreground'
      })
    }

    const whiteContrast = this.getContrastRatio('#FFFFFF', background)
    if (whiteContrast >= 4.5) {
      suggestions.push({
        color: '#FFFFFF',
        contrastRatio: whiteContrast,
        description: 'Pure white foreground'
      })
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  private adjustBrightness(
    rgb: { r: number; g: number; b: number },
    factor: number
  ): { r: number; g: number; b: number } {
    return {
      r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
      g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
      b: Math.min(255, Math.max(0, Math.round(rgb.b * factor)))
    }
  }

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (x: number) => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
  }

  private formatResult(result: ContrastResult): string {
    const output: string[] = []

    output.push('WCAG CONTRAST ANALYSIS')
    output.push('='.repeat(50))
    output.push('')
    output.push(`Foreground: ${result.foreground}`)
    output.push(`Background: ${result.background}`)
    output.push(`Contrast Ratio: ${result.contrastRatio.toFixed(2)}:1`)
    output.push(`Overall Level: ${result.wcagLevel}`)
    output.push('')

    output.push('COMPLIANCE:')
    output.push(`  Normal Text (< 18pt):`)
    output.push(`    AA (4.5:1):  ${result.normalText.aa ? '✓ Pass' : '✗ Fail'}`)
    output.push(`    AAA (7:1):   ${result.normalText.aaa ? '✓ Pass' : '✗ Fail'}`)
    output.push(`  Large Text (>= 18pt):`)
    output.push(`    AA (3:1):    ${result.largeText.aa ? '✓ Pass' : '✗ Fail'}`)
    output.push(`    AAA (4.5:1): ${result.largeText.aaa ? '✓ Pass' : '✗ Fail'}`)
    output.push(`  UI Components:`)
    output.push(`    AA (3:1):    ${result.uiComponents.aa ? '✓ Pass' : '✗ Fail'}`)
    output.push('')

    if (result.suggestions && result.suggestions.length > 0) {
      output.push('SUGGESTIONS FOR IMPROVEMENT:')
      output.push('')
      for (const suggestion of result.suggestions) {
        output.push(`  ${suggestion.color}`)
        output.push(`    ${suggestion.description}`)
        output.push(`    Contrast: ${suggestion.contrastRatio.toFixed(2)}:1`)
        output.push('')
      }
    }

    output.push('='.repeat(50))

    if (result.normalText.aaa) {
      output.push('Status: Excellent! AAA compliant for all text sizes.')
    } else if (result.normalText.aa) {
      output.push('Status: Good! AA compliant for all text sizes.')
    } else if (result.largeText.aa) {
      output.push('Status: Limited use. Only suitable for large text (18pt+).')
    } else {
      output.push('Status: Not accessible. Consider using suggested alternatives.')
    }

    return output.join('\n')
  }
}

/**
 * Create contrast checker tool with simplified interface
 */
export function createContrastCheckerTool(): ContrastCheckerTool {
  return new ContrastCheckerTool()
}
