/**
 * Type Scale Generator Tool
 *
 * LangChain tool for generating modular type scales based on base size and ratio.
 * Creates harmonious typography systems using mathematical ratios.
 *
 * @example
 * ```typescript
 * import { TypeScaleGeneratorTool } from './type-scale-generator-tool'
 *
 * const tool = new TypeScaleGeneratorTool()
 * const result = await tool._call('base=16,ratio=1.25')
 * ```
 */

import { Tool } from '@langchain/core/tools'

export interface TypeScale {
  name: string
  size: number
  rem: string
  px: string
  lineHeight: string
  usage: string
}

export interface TypeScaleResult {
  baseSize: number
  ratio: number
  ratioName: string
  scale: TypeScale[]
  cssVariables: string
  tailwindConfig: string
}

export type TypographicRatio =
  | 'minor-second'
  | 'major-second'
  | 'minor-third'
  | 'major-third'
  | 'perfect-fourth'
  | 'augmented-fourth'
  | 'perfect-fifth'
  | 'golden-ratio'

/**
 * Type Scale Generator Tool for LangChain
 */
export class TypeScaleGeneratorTool extends Tool {
  name = 'type_scale_generator'
  description = `Generate modular type scale for typography systems.
Input format: "base=<number>,ratio=<number|name>"
Example: "base=16,ratio=1.25" or "base=16,ratio=major-third"
Returns complete type scale with CSS variables and Tailwind config.`

  private ratios: Record<TypographicRatio, number> = {
    'minor-second': 1.067,
    'major-second': 1.125,
    'minor-third': 1.2,
    'major-third': 1.25,
    'perfect-fourth': 1.333,
    'augmented-fourth': 1.414,
    'perfect-fifth': 1.5,
    'golden-ratio': 1.618
  }

  async _call(input: string): Promise<string> {
    try {
      const params = this.parseInput(input)
      const result = this.generateTypeScale(params.baseSize, params.ratio)
      return JSON.stringify(result, null, 2)
    } catch (error) {
      return `Error generating type scale: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  /**
   * Parse input string
   */
  private parseInput(input: string): { baseSize: number; ratio: number } {
    const params = new Map<string, string>()

    input.split(',').forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim())
      if (key && value) {
        params.set(key, value)
      }
    })

    const baseSize = params.get('base') ? parseFloat(params.get('base')!) : 16
    let ratio: number

    const ratioInput = params.get('ratio')
    if (!ratioInput) {
      ratio = 1.25 // Default to major-third
    } else if (ratioInput in this.ratios) {
      ratio = this.ratios[ratioInput as TypographicRatio]
    } else {
      ratio = parseFloat(ratioInput)
    }

    if (isNaN(baseSize) || baseSize <= 0) {
      throw new Error('Invalid base size')
    }

    if (isNaN(ratio) || ratio <= 1) {
      throw new Error('Invalid ratio (must be > 1)')
    }

    return { baseSize, ratio }
  }

  /**
   * Generate type scale
   */
  private generateTypeScale(baseSize: number, ratio: number): TypeScaleResult {
    const ratioName = this.getRatioName(ratio)

    // Generate scale levels
    const levels = [
      { name: 'xs', steps: -2, usage: 'Small text, captions, labels' },
      { name: 'sm', steps: -1, usage: 'Secondary text, metadata' },
      { name: 'base', steps: 0, usage: 'Body text, paragraphs' },
      { name: 'lg', steps: 1, usage: 'Lead paragraphs, large body text' },
      { name: 'xl', steps: 2, usage: 'H4 headings' },
      { name: '2xl', steps: 3, usage: 'H3 headings' },
      { name: '3xl', steps: 4, usage: 'H2 headings' },
      { name: '4xl', steps: 5, usage: 'H1 headings' },
      { name: '5xl', steps: 6, usage: 'Hero headings, display text' },
      { name: '6xl', steps: 7, usage: 'Extra large display text' }
    ]

    const scale: TypeScale[] = levels.map(level => {
      const size = baseSize * Math.pow(ratio, level.steps)
      const rem = size / 16
      const lineHeight = this.calculateLineHeight(size)

      return {
        name: level.name,
        size: Math.round(size * 100) / 100,
        rem: `${Math.round(rem * 1000) / 1000}rem`,
        px: `${Math.round(size)}px`,
        lineHeight: lineHeight.toFixed(2),
        usage: level.usage
      }
    })

    return {
      baseSize,
      ratio,
      ratioName,
      scale,
      cssVariables: this.generateCssVariables(scale),
      tailwindConfig: this.generateTailwindConfig(scale)
    }
  }

  /**
   * Get ratio name
   */
  private getRatioName(ratio: number): string {
    const entries = Object.entries(this.ratios)

    for (const [name, value] of entries) {
      if (Math.abs(value - ratio) < 0.001) {
        return name
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      }
    }

    return `Custom (${ratio.toFixed(3)})`
  }

  /**
   * Calculate line height
   */
  private calculateLineHeight(fontSize: number): number {
    // Larger text needs less line height
    if (fontSize >= 32) {
      return 1.2
    } else if (fontSize >= 24) {
      return 1.3
    } else if (fontSize >= 18) {
      return 1.4
    } else if (fontSize >= 14) {
      return 1.5
    } else {
      return 1.6
    }
  }

  /**
   * Generate CSS variables
   */
  private generateCssVariables(scale: TypeScale[]): string {
    const vars = scale.map(s => `  --font-size-${s.name}: ${s.rem};`).join('\n')
    const lineHeights = scale.map(s => `  --line-height-${s.name}: ${s.lineHeight};`).join('\n')

    return `:root {\n${vars}\n\n${lineHeights}\n}`
  }

  /**
   * Generate Tailwind config
   */
  private generateTailwindConfig(scale: TypeScale[]): string {
    const sizes = scale
      .map(s => `    ${s.name}: ['${s.rem}', { lineHeight: '${s.lineHeight}' }],`)
      .join('\n')

    return `module.exports = {
  theme: {
    extend: {
      fontSize: {
${sizes}
      }
    }
  }
}`
  }
}

/**
 * Create type scale generator tool
 */
export function createTypeScaleGeneratorTool(): TypeScaleGeneratorTool {
  return new TypeScaleGeneratorTool()
}

/**
 * Named ratio constants
 */
export const TYPOGRAPHIC_RATIOS = {
  MINOR_SECOND: 1.067,
  MAJOR_SECOND: 1.125,
  MINOR_THIRD: 1.2,
  MAJOR_THIRD: 1.25,
  PERFECT_FOURTH: 1.333,
  AUGMENTED_FOURTH: 1.414,
  PERFECT_FIFTH: 1.5,
  GOLDEN_RATIO: 1.618
} as const

/**
 * Quick scale generators
 */
export function generateMinorThirdScale(baseSize: number = 16): TypeScaleResult {
  const tool = new TypeScaleGeneratorTool()
  const result = tool['generateTypeScale'](baseSize, TYPOGRAPHIC_RATIOS.MINOR_THIRD)
  return result
}

export function generateMajorThirdScale(baseSize: number = 16): TypeScaleResult {
  const tool = new TypeScaleGeneratorTool()
  const result = tool['generateTypeScale'](baseSize, TYPOGRAPHIC_RATIOS.MAJOR_THIRD)
  return result
}

export function generatePerfectFourthScale(baseSize: number = 16): TypeScaleResult {
  const tool = new TypeScaleGeneratorTool()
  const result = tool['generateTypeScale'](baseSize, TYPOGRAPHIC_RATIOS.PERFECT_FOURTH)
  return result
}

export function generateGoldenRatioScale(baseSize: number = 16): TypeScaleResult {
  const tool = new TypeScaleGeneratorTool()
  const result = tool['generateTypeScale'](baseSize, TYPOGRAPHIC_RATIOS.GOLDEN_RATIO)
  return result
}
