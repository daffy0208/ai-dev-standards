/**
 * LangChain Touch Target Validator Tool
 *
 * Validate touch target sizes for mobile accessibility.
 * Ensures interactive elements meet WCAG minimum size requirements.
 *
 * @example
 * ```typescript
 * import { TouchTargetValidatorTool } from './touch-target-validator-tool'
 *
 * const tool = new TouchTargetValidatorTool()
 *
 * // Validate HTML/component file
 * const result = await tool._call('/path/to/component.tsx')
 * console.log(result) // Returns touch target analysis
 * ```
 */

import { Tool } from 'langchain/tools'
import * as fs from 'fs'

export interface TouchTarget {
  element: string
  selector: string
  width?: number
  height?: number
  location: string
  compliant: boolean
  issue?: string
}

export interface TouchTargetAnalysis {
  filePath: string
  totalTargets: number
  compliantTargets: number
  nonCompliantTargets: TouchTarget[]
  recommendations: string[]
  summary: {
    passRate: number
    wcagLevel: string
  }
}

export class TouchTargetValidatorTool extends Tool {
  name = 'touch_target_validator'
  description = `Validate touch target sizes for mobile accessibility.
Input should be a file path (HTML, JSX, TSX, Vue, Svelte).
Returns analysis of interactive elements and WCAG compliance.

WCAG 2.5.5 Requirements:
- Minimum size: 44x44px (CSS pixels)
- Level AAA standard
- Applies to: buttons, links, form controls, interactive elements`

  private readonly minWidth = 44
  private readonly minHeight = 44

  private readonly interactiveElements = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    'summary',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[role="tab"]',
    '[onclick]',
    '[ng-click]',
    '[@click]'
  ]

  async _call(input: string): Promise<string> {
    try {
      const filePath = input.trim()

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return `File not found: ${filePath}`
      }

      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8')

      // Analyze touch targets
      const analysis = this.analyzeTouchTargets(filePath, content)

      // Format output
      return this.formatAnalysis(analysis)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error validating touch targets: ${errorMessage}`
    }
  }

  private analyzeTouchTargets(filePath: string, content: string): TouchTargetAnalysis {
    const targets: TouchTarget[] = []
    const nonCompliantTargets: TouchTarget[] = []

    // Find all interactive elements
    for (const selector of this.interactiveElements) {
      const elements = this.findElements(content, selector)

      for (const element of elements) {
        const dimensions = this.extractDimensions(content, element)
        const compliant = this.isCompliant(dimensions)

        const target: TouchTarget = {
          element: element.tag,
          selector: element.selector,
          width: dimensions.width,
          height: dimensions.height,
          location: element.location,
          compliant,
          issue: compliant ? undefined : this.getIssueDescription(dimensions)
        }

        targets.push(target)

        if (!compliant) {
          nonCompliantTargets.push(target)
        }
      }
    }

    const compliantTargets = targets.filter(t => t.compliant).length
    const passRate = targets.length > 0 ? (compliantTargets / targets.length) * 100 : 100

    const recommendations = this.generateRecommendations(nonCompliantTargets, passRate)

    return {
      filePath,
      totalTargets: targets.length,
      compliantTargets,
      nonCompliantTargets,
      recommendations,
      summary: {
        passRate,
        wcagLevel: passRate === 100 ? 'AAA' : passRate >= 80 ? 'Partial' : 'Fail'
      }
    }
  }

  private findElements(
    content: string,
    selector: string
  ): Array<{ tag: string; selector: string; location: string; fullMatch: string }> {
    const elements: Array<{ tag: string; selector: string; location: string; fullMatch: string }> =
      []

    // Simple regex patterns for different element types
    const patterns: Record<string, RegExp> = {
      button: /<button[^>]*>/gi,
      a: /<a[^>]*>/gi,
      input: /<input[^>]*>/gi,
      select: /<select[^>]*>/gi,
      textarea: /<textarea[^>]*>/gi,
      summary: /<summary[^>]*>/gi,
      '[role="button"]': /<[^>]+role=["']button["'][^>]*>/gi,
      '[onclick]': /<[^>]+onclick=/gi
    }

    const pattern = patterns[selector]
    if (!pattern) return elements

    const matches = content.matchAll(pattern)

    for (const match of matches) {
      elements.push({
        tag: selector.replace(/[[\]"']/g, ''),
        selector,
        location: this.getLineNumber(content, match.index || 0),
        fullMatch: match[0]
      })
    }

    return elements
  }

  private extractDimensions(
    content: string,
    element: { fullMatch: string }
  ): { width?: number; height?: number } {
    const dimensions: { width?: number; height?: number } = {}

    // Extract inline style dimensions
    const styleMatch = element.fullMatch.match(/style=["']([^"']+)["']/i)
    if (styleMatch) {
      const style = styleMatch[1]

      const widthMatch = style.match(/(?:width|min-width):\s*(\d+)px/i)
      if (widthMatch) {
        dimensions.width = parseInt(widthMatch[1])
      }

      const heightMatch = style.match(/(?:height|min-height):\s*(\d+)px/i)
      if (heightMatch) {
        dimensions.height = parseInt(heightMatch[1])
      }
    }

    // Extract className and look for Tailwind classes
    const classMatch = element.fullMatch.match(/className=["']([^"']+)["']/i)
    if (classMatch) {
      const classes = classMatch[1]

      // Tailwind width classes
      const widthClasses: Record<string, number> = {
        'w-8': 32,
        'w-10': 40,
        'w-12': 48,
        'w-16': 64,
        'w-20': 80
      }

      // Tailwind height classes
      const heightClasses: Record<string, number> = {
        'h-8': 32,
        'h-10': 40,
        'h-12': 48,
        'h-16': 64,
        'h-20': 80
      }

      for (const [className, pixels] of Object.entries(widthClasses)) {
        if (classes.includes(className)) {
          dimensions.width = pixels
          break
        }
      }

      for (const [className, pixels] of Object.entries(heightClasses)) {
        if (classes.includes(className)) {
          dimensions.height = pixels
          break
        }
      }

      // Check for padding classes that might meet minimum
      if (classes.match(/p-\d+|px-\d+|py-\d+/)) {
        if (!dimensions.width) dimensions.width = 44 // Assume compliant with padding
        if (!dimensions.height) dimensions.height = 44
      }
    }

    return dimensions
  }

  private isCompliant(dimensions: { width?: number; height?: number }): boolean {
    // If no dimensions found, assume it needs review (not compliant)
    if (dimensions.width === undefined || dimensions.height === undefined) {
      return false
    }

    return dimensions.width >= this.minWidth && dimensions.height >= this.minHeight
  }

  private getIssueDescription(dimensions: { width?: number; height?: number }): string {
    if (dimensions.width === undefined && dimensions.height === undefined) {
      return 'Dimensions not specified or detectable'
    }

    const issues: string[] = []

    if (dimensions.width !== undefined && dimensions.width < this.minWidth) {
      issues.push(`width ${dimensions.width}px < ${this.minWidth}px`)
    }

    if (dimensions.height !== undefined && dimensions.height < this.minHeight) {
      issues.push(`height ${dimensions.height}px < ${this.minHeight}px`)
    }

    if (
      issues.length === 0 &&
      (dimensions.width === undefined || dimensions.height === undefined)
    ) {
      return 'Missing dimension specification'
    }

    return issues.join(', ')
  }

  private generateRecommendations(nonCompliantTargets: TouchTarget[], passRate: number): string[] {
    const recommendations: string[] = []

    if (nonCompliantTargets.length === 0) {
      recommendations.push('All detected interactive elements meet WCAG 2.5.5 AAA requirements!')
      return recommendations
    }

    recommendations.push(`Found ${nonCompliantTargets.length} non-compliant touch targets`)
    recommendations.push('Ensure all interactive elements are at least 44x44px')

    // Group issues by type
    const missingDimensions = nonCompliantTargets.filter(
      t => t.width === undefined || t.height === undefined
    )
    const tooSmall = nonCompliantTargets.filter(
      t => t.width !== undefined && t.height !== undefined
    )

    if (missingDimensions.length > 0) {
      recommendations.push(
        `${missingDimensions.length} elements missing explicit dimensions - add min-width and min-height`
      )
    }

    if (tooSmall.length > 0) {
      recommendations.push(
        `${tooSmall.length} elements are smaller than 44x44px - increase size or padding`
      )
    }

    // CSS recommendations
    recommendations.push(
      'CSS solution: Add min-width: 44px; min-height: 44px; to interactive elements'
    )
    recommendations.push('Tailwind solution: Use w-12 h-12 (48x48px) or larger classes')

    // Specific element recommendations
    const buttons = nonCompliantTargets.filter(t => t.element.includes('button'))
    if (buttons.length > 0) {
      recommendations.push(`${buttons.length} buttons need size adjustment`)
    }

    const links = nonCompliantTargets.filter(t => t.element.includes('a'))
    if (links.length > 0) {
      recommendations.push(
        `${links.length} links need padding or display: inline-block with dimensions`
      )
    }

    return recommendations
  }

  private getLineNumber(content: string, index: number): string {
    const lines = content.substring(0, index).split('\n')
    return `Line ${lines.length}`
  }

  private formatAnalysis(analysis: TouchTargetAnalysis): string {
    const output: string[] = []

    output.push('TOUCH TARGET VALIDATION (WCAG 2.5.5)')
    output.push('='.repeat(50))
    output.push('')
    output.push(`File: ${analysis.filePath}`)
    output.push(`Total Interactive Elements: ${analysis.totalTargets}`)
    output.push(`Compliant: ${analysis.compliantTargets}`)
    output.push(`Non-Compliant: ${analysis.nonCompliantTargets.length}`)
    output.push(`Pass Rate: ${analysis.summary.passRate.toFixed(1)}%`)
    output.push(`WCAG Level: ${analysis.summary.wcagLevel}`)
    output.push('')

    if (analysis.nonCompliantTargets.length > 0) {
      output.push('NON-COMPLIANT ELEMENTS:')
      output.push('')
      for (const target of analysis.nonCompliantTargets) {
        output.push(`  ${target.element} (${target.location})`)
        output.push(`    Selector: ${target.selector}`)
        if (target.width !== undefined) {
          output.push(`    Width: ${target.width}px ${target.width < this.minWidth ? '✗' : '✓'}`)
        } else {
          output.push(`    Width: Not specified ✗`)
        }
        if (target.height !== undefined) {
          output.push(
            `    Height: ${target.height}px ${target.height < this.minHeight ? '✗' : '✓'}`
          )
        } else {
          output.push(`    Height: Not specified ✗`)
        }
        output.push(`    Issue: ${target.issue}`)
        output.push('')
      }
    }

    output.push('RECOMMENDATIONS:')
    output.push('')
    for (const rec of analysis.recommendations) {
      output.push(`  • ${rec}`)
    }
    output.push('')

    output.push('='.repeat(50))
    output.push('Minimum touch target: 44x44px (WCAG 2.5.5 Level AAA)')
    output.push('Larger targets (48x48px+) provide better user experience')

    return output.join('\n')
  }
}

/**
 * Create touch target validator tool with simplified interface
 */
export function createTouchTargetValidatorTool(): TouchTargetValidatorTool {
  return new TouchTargetValidatorTool()
}
