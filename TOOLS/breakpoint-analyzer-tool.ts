/**
 * LangChain Breakpoint Analyzer Tool
 *
 * Analyze responsive design breakpoint usage in CSS and component files.
 * Identifies missing breakpoints and suggests responsive improvements.
 *
 * @example
 * ```typescript
 * import { BreakpointAnalyzerTool } from './breakpoint-analyzer-tool'
 *
 * const tool = new BreakpointAnalyzerTool()
 *
 * // Analyze CSS file
 * const result = await tool._call('/path/to/styles.css')
 * console.log(result) // Returns breakpoint analysis
 * ```
 */

import { Tool } from 'langchain/tools'
import * as fs from 'fs'
import * as path from 'path'

export interface BreakpointUsage {
  breakpoint: string
  minWidth?: string
  maxWidth?: string
  occurrences: number
  locations: string[]
}

export interface BreakpointAnalysis {
  filePath: string
  totalBreakpoints: number
  uniqueBreakpoints: BreakpointUsage[]
  standardBreakpoints: StandardBreakpoint[]
  missingBreakpoints: string[]
  customBreakpoints: BreakpointUsage[]
  recommendations: string[]
}

export interface StandardBreakpoint {
  name: string
  minWidth: string
  found: boolean
}

export class BreakpointAnalyzerTool extends Tool {
  name = 'breakpoint_analyzer'
  description = `Analyze responsive breakpoint usage in CSS/component files.
Input should be a file path (CSS, SCSS, styled-components, Tailwind).
Returns comprehensive breakpoint analysis with recommendations.

Standard breakpoints checked:
- Mobile: 320px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px
- Ultra Wide: 1536px`

  private readonly standardBreakpoints: StandardBreakpoint[] = [
    { name: 'Mobile', minWidth: '320px', found: false },
    { name: 'Tablet', minWidth: '768px', found: false },
    { name: 'Desktop', minWidth: '1024px', found: false },
    { name: 'Wide Desktop', minWidth: '1280px', found: false },
    { name: 'Ultra Wide', minWidth: '1536px', found: false },
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

      // Analyze breakpoints
      const analysis = this.analyzeBreakpoints(filePath, content)

      // Format output
      return this.formatAnalysis(analysis)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error analyzing breakpoints: ${errorMessage}`
    }
  }

  private analyzeBreakpoints(filePath: string, content: string): BreakpointAnalysis {
    const breakpointMap = new Map<string, BreakpointUsage>()

    // Match media queries: @media (min-width: 768px), (max-width: 1024px), etc.
    const mediaQueryRegex = /@media[^{]*\((min-width|max-width):\s*(\d+(?:\.\d+)?)(px|em|rem)\)[^{]*/gi
    const matches = content.matchAll(mediaQueryRegex)

    // Extract breakpoints
    for (const match of matches) {
      const [fullMatch, type, value, unit] = match
      const key = `${value}${unit}`

      if (!breakpointMap.has(key)) {
        breakpointMap.set(key, {
          breakpoint: key,
          minWidth: type === 'min-width' ? key : undefined,
          maxWidth: type === 'max-width' ? key : undefined,
          occurrences: 0,
          locations: [],
        })
      }

      const usage = breakpointMap.get(key)!
      usage.occurrences++
      usage.locations.push(this.getLineNumber(content, match.index || 0))
    }

    // Check Tailwind responsive classes
    const tailwindRegex = /\b(sm|md|lg|xl|2xl):/g
    const tailwindMatches = content.matchAll(tailwindRegex)

    for (const match of tailwindMatches) {
      const [, breakpoint] = match
      const key = this.tailwindToPixels(breakpoint)

      if (!breakpointMap.has(key)) {
        breakpointMap.set(key, {
          breakpoint: `${breakpoint} (${key})`,
          minWidth: key,
          occurrences: 0,
          locations: [],
        })
      }

      const usage = breakpointMap.get(key)!
      usage.occurrences++
      usage.locations.push(this.getLineNumber(content, match.index || 0))
    }

    const uniqueBreakpoints = Array.from(breakpointMap.values())
    const standardBreakpoints = this.checkStandardBreakpoints(uniqueBreakpoints)
    const missingBreakpoints = standardBreakpoints.filter((bp) => !bp.found).map((bp) => bp.name)
    const customBreakpoints = this.findCustomBreakpoints(uniqueBreakpoints, standardBreakpoints)
    const recommendations = this.generateRecommendations(standardBreakpoints, customBreakpoints)

    return {
      filePath,
      totalBreakpoints: uniqueBreakpoints.reduce((sum, bp) => sum + bp.occurrences, 0),
      uniqueBreakpoints,
      standardBreakpoints,
      missingBreakpoints,
      customBreakpoints,
      recommendations,
    }
  }

  private tailwindToPixels(breakpoint: string): string {
    const map: Record<string, string> = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    }
    return map[breakpoint] || breakpoint
  }

  private checkStandardBreakpoints(uniqueBreakpoints: BreakpointUsage[]): StandardBreakpoint[] {
    return this.standardBreakpoints.map((standard) => {
      const found = uniqueBreakpoints.some((bp) => {
        const bpValue = parseInt(bp.minWidth || bp.maxWidth || '0')
        const standardValue = parseInt(standard.minWidth)
        return Math.abs(bpValue - standardValue) <= 50 // Allow 50px tolerance
      })

      return { ...standard, found }
    })
  }

  private findCustomBreakpoints(
    uniqueBreakpoints: BreakpointUsage[],
    standardBreakpoints: StandardBreakpoint[]
  ): BreakpointUsage[] {
    return uniqueBreakpoints.filter((bp) => {
      const bpValue = parseInt(bp.minWidth || bp.maxWidth || '0')
      return !standardBreakpoints.some((standard) => {
        const standardValue = parseInt(standard.minWidth)
        return Math.abs(bpValue - standardValue) <= 50
      })
    })
  }

  private generateRecommendations(
    standardBreakpoints: StandardBreakpoint[],
    customBreakpoints: BreakpointUsage[]
  ): string[] {
    const recommendations: string[] = []

    // Missing standard breakpoints
    const missing = standardBreakpoints.filter((bp) => !bp.found)
    if (missing.length > 0) {
      recommendations.push(
        `Add missing standard breakpoints: ${missing.map((bp) => `${bp.name} (${bp.minWidth})`).join(', ')}`
      )
    }

    // Too many custom breakpoints
    if (customBreakpoints.length > 3) {
      recommendations.push(
        `Consider consolidating ${customBreakpoints.length} custom breakpoints into standard ones for consistency`
      )
    }

    // No mobile-first approach
    const mobileFirst = standardBreakpoints[0].found
    if (!mobileFirst) {
      recommendations.push('Consider implementing mobile-first responsive design starting at 320px')
    }

    // Suggest Tailwind classes
    if (customBreakpoints.length > 0) {
      recommendations.push(
        'Consider using Tailwind responsive classes (sm:, md:, lg:, xl:, 2xl:) for consistency'
      )
    }

    return recommendations
  }

  private getLineNumber(content: string, index: number): string {
    const lines = content.substring(0, index).split('\n')
    return `Line ${lines.length}`
  }

  private formatAnalysis(analysis: BreakpointAnalysis): string {
    const output: string[] = []

    output.push('BREAKPOINT ANALYSIS')
    output.push('='.repeat(50))
    output.push('')
    output.push(`File: ${analysis.filePath}`)
    output.push(`Total Breakpoint Uses: ${analysis.totalBreakpoints}`)
    output.push(`Unique Breakpoints: ${analysis.uniqueBreakpoints.length}`)
    output.push('')

    // Standard breakpoints
    output.push('STANDARD BREAKPOINTS:')
    output.push('')
    for (const bp of analysis.standardBreakpoints) {
      const status = bp.found ? '✓' : '✗'
      output.push(`  ${status} ${bp.name} (${bp.minWidth})`)
    }
    output.push('')

    // Unique breakpoints used
    if (analysis.uniqueBreakpoints.length > 0) {
      output.push('BREAKPOINTS FOUND:')
      output.push('')
      for (const bp of analysis.uniqueBreakpoints) {
        output.push(`  ${bp.breakpoint}`)
        output.push(`    Type: ${bp.minWidth ? 'min-width' : 'max-width'}`)
        output.push(`    Occurrences: ${bp.occurrences}`)
        output.push(`    Locations: ${bp.locations.slice(0, 3).join(', ')}${bp.locations.length > 3 ? '...' : ''}`)
        output.push('')
      }
    }

    // Custom breakpoints
    if (analysis.customBreakpoints.length > 0) {
      output.push('CUSTOM BREAKPOINTS:')
      output.push('')
      for (const bp of analysis.customBreakpoints) {
        output.push(`  ${bp.breakpoint} (${bp.occurrences} uses)`)
      }
      output.push('')
    }

    // Missing breakpoints
    if (analysis.missingBreakpoints.length > 0) {
      output.push('MISSING BREAKPOINTS:')
      output.push('')
      for (const bp of analysis.missingBreakpoints) {
        output.push(`  - ${bp}`)
      }
      output.push('')
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      output.push('RECOMMENDATIONS:')
      output.push('')
      for (const rec of analysis.recommendations) {
        output.push(`  • ${rec}`)
      }
      output.push('')
    }

    output.push('='.repeat(50))

    return output.join('\n')
  }
}

/**
 * Create breakpoint analyzer tool with simplified interface
 */
export function createBreakpointAnalyzerTool(): BreakpointAnalyzerTool {
  return new BreakpointAnalyzerTool()
}
