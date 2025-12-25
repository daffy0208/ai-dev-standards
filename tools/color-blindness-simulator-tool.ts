/**
 * LangChain Color Blindness Simulator Tool
 *
 * Simulate how colors appear with various color vision deficiencies.
 * Helps ensure designs are accessible to users with color blindness.
 *
 * @example
 * ```typescript
 * import { ColorBlindnessSimulatorTool } from './color-blindness-simulator-tool'
 *
 * const tool = new ColorBlindnessSimulatorTool()
 *
 * // Simulate color blindness
 * const result = await tool._call('#3B82F6')
 * console.log(result) // Returns how color appears with different CVDs
 * ```
 */

import { Tool } from '@langchain/core/tools'

export type ColorVisionDeficiency =
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly'

export interface CVDSimulation {
  type: ColorVisionDeficiency
  name: string
  description: string
  affectedPopulation: string
  originalColor: string
  simulatedColor: string
  difference: number
}

export interface CVDAnalysis {
  originalColor: string
  simulations: CVDSimulation[]
  recommendations: string[]
  contrastIssues: string[]
}

export class ColorBlindnessSimulatorTool extends Tool {
  name = 'color_blindness_simulator'
  description = `Simulate color vision deficiencies (color blindness).
Input should be a hex color code (e.g., #3B82F6).
Returns simulated colors for various types of color blindness.
Includes accessibility recommendations.

Types simulated:
- Protanopia (red-blind, ~1% males)
- Deuteranopia (green-blind, ~1% males)
- Tritanopia (blue-blind, ~0.001%)
- Achromatopsia (total color blindness, rare)`

  private readonly cvdTypes: Array<{
    type: ColorVisionDeficiency
    name: string
    description: string
    affectedPopulation: string
  }> = [
    {
      type: 'protanopia',
      name: 'Protanopia',
      description: 'Red-blind (missing L-cones)',
      affectedPopulation: '~1% of males'
    },
    {
      type: 'protanomaly',
      name: 'Protanomaly',
      description: 'Red-weak (anomalous L-cones)',
      affectedPopulation: '~1% of males'
    },
    {
      type: 'deuteranopia',
      name: 'Deuteranopia',
      description: 'Green-blind (missing M-cones)',
      affectedPopulation: '~1% of males'
    },
    {
      type: 'deuteranomaly',
      name: 'Deuteranomaly',
      description: 'Green-weak (anomalous M-cones)',
      affectedPopulation: '~5% of males'
    },
    {
      type: 'tritanopia',
      name: 'Tritanopia',
      description: 'Blue-blind (missing S-cones)',
      affectedPopulation: '~0.001% of population'
    },
    {
      type: 'tritanomaly',
      name: 'Tritanomaly',
      description: 'Blue-weak (anomalous S-cones)',
      affectedPopulation: '~0.01% of population'
    },
    {
      type: 'achromatopsia',
      name: 'Achromatopsia',
      description: 'Complete color blindness (no cones)',
      affectedPopulation: '~0.003% of population'
    },
    {
      type: 'achromatomaly',
      name: 'Achromatomaly',
      description: 'Partial color blindness (weak cones)',
      affectedPopulation: 'Rare'
    }
  ]

  async _call(input: string): Promise<string> {
    try {
      // Parse and normalize color
      let color = input.trim()
      color = color.startsWith('#') ? color : `#${color}`

      // Validate hex color
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return `Invalid hex color format: ${color}. Expected format: #RRGGBB`
      }

      // Simulate CVDs
      const analysis = this.simulateCVDs(color)

      // Format output
      return this.formatAnalysis(analysis)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error simulating color blindness: ${errorMessage}`
    }
  }

  private simulateCVDs(color: string): CVDAnalysis {
    const simulations: CVDSimulation[] = []

    for (const cvdType of this.cvdTypes) {
      const simulatedColor = this.applyColorBlindness(color, cvdType.type)
      const difference = this.calculateColorDifference(color, simulatedColor)

      simulations.push({
        type: cvdType.type,
        name: cvdType.name,
        description: cvdType.description,
        affectedPopulation: cvdType.affectedPopulation,
        originalColor: color,
        simulatedColor,
        difference
      })
    }

    const recommendations = this.generateRecommendations(simulations)
    const contrastIssues = this.identifyContrastIssues(simulations)

    return {
      originalColor: color,
      simulations,
      recommendations,
      contrastIssues
    }
  }

  private applyColorBlindness(hex: string, type: ColorVisionDeficiency): string {
    const rgb = this.hexToRgb(hex)

    // Convert to linear RGB
    const linear = {
      r: this.srgbToLinear(rgb.r / 255),
      g: this.srgbToLinear(rgb.g / 255),
      b: this.srgbToLinear(rgb.b / 255)
    }

    // Apply CVD transformation matrices
    let transformed: { r: number; g: number; b: number }

    switch (type) {
      case 'protanopia': // Red-blind
        transformed = {
          r: 0.567 * linear.r + 0.433 * linear.g,
          g: 0.558 * linear.r + 0.442 * linear.g,
          b: 0.242 * linear.g + 0.758 * linear.b
        }
        break

      case 'protanomaly': // Red-weak
        transformed = {
          r: 0.817 * linear.r + 0.183 * linear.g,
          g: 0.333 * linear.r + 0.667 * linear.g,
          b: 0.125 * linear.g + 0.875 * linear.b
        }
        break

      case 'deuteranopia': // Green-blind
        transformed = {
          r: 0.625 * linear.r + 0.375 * linear.g,
          g: 0.7 * linear.r + 0.3 * linear.g,
          b: 0.3 * linear.g + 0.7 * linear.b
        }
        break

      case 'deuteranomaly': // Green-weak
        transformed = {
          r: 0.8 * linear.r + 0.2 * linear.g,
          g: 0.258 * linear.r + 0.742 * linear.g,
          b: 0.142 * linear.g + 0.858 * linear.b
        }
        break

      case 'tritanopia': // Blue-blind
        transformed = {
          r: 0.95 * linear.r + 0.05 * linear.g,
          g: 0.433 * linear.g + 0.567 * linear.b,
          b: 0.475 * linear.g + 0.525 * linear.b
        }
        break

      case 'tritanomaly': // Blue-weak
        transformed = {
          r: 0.967 * linear.r + 0.033 * linear.g,
          g: 0.733 * linear.g + 0.267 * linear.b,
          b: 0.183 * linear.g + 0.817 * linear.b
        }
        break

      case 'achromatopsia': {
        // Complete color blindness
        const gray = 0.299 * linear.r + 0.587 * linear.g + 0.114 * linear.b
        transformed = { r: gray, g: gray, b: gray }
        break
      }

      case 'achromatomaly': {
        // Partial color blindness
        const grayPartial = 0.299 * linear.r + 0.587 * linear.g + 0.114 * linear.b
        transformed = {
          r: 0.618 * linear.r + 0.382 * grayPartial,
          g: 0.618 * linear.g + 0.382 * grayPartial,
          b: 0.618 * linear.b + 0.382 * grayPartial
        }
        break
      }

      default:
        transformed = linear
    }

    // Convert back to sRGB
    const srgb = {
      r: Math.round(this.linearToSrgb(transformed.r) * 255),
      g: Math.round(this.linearToSrgb(transformed.g) * 255),
      b: Math.round(this.linearToSrgb(transformed.b) * 255)
    }

    return this.rgbToHex(srgb)
  }

  private srgbToLinear(value: number): number {
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  }

  private linearToSrgb(value: number): number {
    return value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055
  }

  private calculateColorDifference(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)

    // Calculate Euclidean distance in RGB space
    const rDiff = rgb1.r - rgb2.r
    const gDiff = rgb1.g - rgb2.g
    const bDiff = rgb1.b - rgb2.b

    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
  }

  private generateRecommendations(simulations: CVDSimulation[]): string[] {
    const recommendations: string[] = []

    // Check for significant changes
    const significantChanges = simulations.filter(sim => sim.difference > 50)

    if (significantChanges.length > 0) {
      recommendations.push(
        `Color appears significantly different for ${significantChanges.length} CVD types`
      )
      recommendations.push('Consider adding non-color indicators (icons, patterns, text labels)')
    }

    // Check for near-complete desaturation
    const desaturated = simulations.filter(
      sim => sim.type === 'achromatopsia' || sim.type === 'achromatomaly'
    )
    if (desaturated.length > 0) {
      recommendations.push(
        'Ensure sufficient contrast ratios for users with complete color blindness'
      )
    }

    // General recommendations
    recommendations.push('Use texture, patterns, or labels in addition to color')
    recommendations.push('Test with sufficient contrast ratios (WCAG AA/AAA)')
    recommendations.push('Avoid red-green and blue-yellow as sole differentiators')

    return recommendations
  }

  private identifyContrastIssues(simulations: CVDSimulation[]): string[] {
    const issues: string[] = []

    // Check if colors become too similar
    const protanSimulations = simulations.filter(s => s.type.startsWith('protan'))
    const deutanSimulations = simulations.filter(s => s.type.startsWith('deutan'))

    if (protanSimulations.some(s => s.difference > 75)) {
      issues.push('Significant color shift for red-blind users (protanopia/protanomaly)')
    }

    if (deutanSimulations.some(s => s.difference > 75)) {
      issues.push('Significant color shift for green-blind users (deuteranopia/deuteranomaly)')
    }

    return issues
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

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (x: number) => {
      const clamped = Math.max(0, Math.min(255, x))
      const hex = Math.round(clamped).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
  }

  private formatAnalysis(analysis: CVDAnalysis): string {
    const output: string[] = []

    output.push('COLOR VISION DEFICIENCY SIMULATION')
    output.push('='.repeat(50))
    output.push('')
    output.push(`Original Color: ${analysis.originalColor}`)
    output.push('')

    output.push('SIMULATIONS:')
    output.push('')
    for (const sim of analysis.simulations) {
      output.push(`${sim.name} (${sim.affectedPopulation}):`)
      output.push(`  ${sim.description}`)
      output.push(`  Simulated Color: ${sim.simulatedColor}`)
      output.push(`  Color Difference: ${sim.difference.toFixed(2)}`)
      output.push('')
    }

    if (analysis.contrastIssues.length > 0) {
      output.push('POTENTIAL ISSUES:')
      output.push('')
      for (const issue of analysis.contrastIssues) {
        output.push(`  ⚠ ${issue}`)
      }
      output.push('')
    }

    output.push('RECOMMENDATIONS:')
    output.push('')
    for (const rec of analysis.recommendations) {
      output.push(`  • ${rec}`)
    }
    output.push('')

    output.push('='.repeat(50))
    output.push('Designing for color blindness ensures 8-10% of males can use your product!')

    return output.join('\n')
  }
}

/**
 * Create color blindness simulator tool with simplified interface
 */
export function createColorBlindnessSimulatorTool(): ColorBlindnessSimulatorTool {
  return new ColorBlindnessSimulatorTool()
}
