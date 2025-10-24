/**
 * CrewAI Code Analyzer Tool
 *
 * Tool for analyzing code quality, complexity, and potential issues.
 * Compatible with CrewAI agents.
 *
 * @example
 * ```typescript
 * import { CodeAnalyzerTool } from './code-analyzer-tool'
 *
 * const tool = new CodeAnalyzerTool()
 *
 * // Use in CrewAI agent
 * const agent = new Agent({
 *   role: 'Code Reviewer',
 *   tools: [tool]
 * })
 * ```
 */

import { Tool } from '@crewai/crewai'

export interface CodeAnalysisResult {
  complexity: {
    cyclomatic: number
    cognitive: number
    halstead: {
      difficulty: number
      volume: number
      effort: number
    }
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    line: number
    column: number
    rule: string
  }>
  metrics: {
    linesOfCode: number
    commentLines: number
    blankLines: number
    functions: number
    classes: number
  }
  suggestions: string[]
}

export class CodeAnalyzerTool extends Tool {
  name = 'code_analyzer'
  description = `Analyze code for quality, complexity, and potential issues.
Input should be source code as a string.
Returns detailed analysis including complexity metrics, issues, and suggestions.`

  async _run(code: string): Promise<string> {
    try {
      const analysis = this.analyzeCode(code)
      return this.formatAnalysis(analysis)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error analyzing code: ${errorMessage}`
    }
  }

  /**
   * Analyze code
   */
  private analyzeCode(code: string): CodeAnalysisResult {
    return {
      complexity: this.calculateComplexity(code),
      issues: this.findIssues(code),
      metrics: this.calculateMetrics(code),
      suggestions: this.generateSuggestions(code),
    }
  }

  /**
   * Calculate code complexity metrics
   */
  private calculateComplexity(code: string): CodeAnalysisResult['complexity'] {
    // Cyclomatic complexity (simplified)
    const decisionPoints = (code.match(/\bif\b|\bfor\b|\bwhile\b|\bcase\b|\bcatch\b/g) || []).length
    const cyclomatic = decisionPoints + 1

    // Cognitive complexity (simplified)
    const nestingLevel = this.calculateMaxNesting(code)
    const cognitive = cyclomatic + nestingLevel

    // Halstead complexity (simplified)
    const operators = (code.match(/[+\-*/%=<>!&|^~]/g) || []).length
    const operands = (code.match(/\b[a-zA-Z_]\w*\b/g) || []).length
    const vocabulary = operators + operands
    const length = code.length

    const halstead = {
      difficulty: (operators / 2) * (operands / vocabulary),
      volume: length * Math.log2(vocabulary),
      effort: 0,
    }
    halstead.effort = halstead.difficulty * halstead.volume

    return {
      cyclomatic,
      cognitive,
      halstead,
    }
  }

  /**
   * Calculate maximum nesting level
   */
  private calculateMaxNesting(code: string): number {
    let maxNesting = 0
    let currentNesting = 0

    for (const char of code) {
      if (char === '{') {
        currentNesting++
        maxNesting = Math.max(maxNesting, currentNesting)
      } else if (char === '}') {
        currentNesting--
      }
    }

    return maxNesting
  }

  /**
   * Find code issues
   */
  private findIssues(code: string): CodeAnalysisResult['issues'] {
    const issues: CodeAnalysisResult['issues'] = []
    const lines = code.split('\n')

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for console.log
      if (line.includes('console.log')) {
        issues.push({
          type: 'warning',
          message: 'Remove console.log statement',
          line: lineNumber,
          column: line.indexOf('console.log'),
          rule: 'no-console',
        })
      }

      // Check for var usage
      if (line.match(/\bvar\b/)) {
        issues.push({
          type: 'warning',
          message: 'Use const or let instead of var',
          line: lineNumber,
          column: line.indexOf('var'),
          rule: 'no-var',
        })
      }

      // Check for long lines
      if (line.length > 100) {
        issues.push({
          type: 'info',
          message: 'Line exceeds 100 characters',
          line: lineNumber,
          column: 100,
          rule: 'max-len',
        })
      }

      // Check for == instead of ===
      if (line.match(/[^=!]==(?!=)/)) {
        issues.push({
          type: 'warning',
          message: 'Use === instead of ==',
          line: lineNumber,
          column: line.search(/[^=!]==(?!=)/),
          rule: 'eqeqeq',
        })
      }

      // Check for missing semicolon (simplified)
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        const lastChar = line.trim().slice(-1)
        if (![',', ':', ')', ']'].includes(lastChar)) {
          issues.push({
            type: 'info',
            message: 'Consider adding semicolon',
            line: lineNumber,
            column: line.length,
            rule: 'semi',
          })
        }
      }
    })

    return issues
  }

  /**
   * Calculate code metrics
   */
  private calculateMetrics(code: string): CodeAnalysisResult['metrics'] {
    const lines = code.split('\n')

    const linesOfCode = lines.filter(line => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('//')
    }).length

    const commentLines = lines.filter(line => {
      const trimmed = line.trim()
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')
    }).length

    const blankLines = lines.filter(line => !line.trim()).length

    const functions = (code.match(/\bfunction\b|\b=>\b/g) || []).length
    const classes = (code.match(/\bclass\b/g) || []).length

    return {
      linesOfCode,
      commentLines,
      blankLines,
      functions,
      classes,
    }
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(code: string): string[] {
    const suggestions: string[] = []
    const metrics = this.calculateMetrics(code)
    const complexity = this.calculateComplexity(code)

    // Comment ratio
    const commentRatio = metrics.commentLines / (metrics.linesOfCode + metrics.commentLines)
    if (commentRatio < 0.1) {
      suggestions.push('Consider adding more comments to improve code documentation')
    }

    // Complexity warnings
    if (complexity.cyclomatic > 10) {
      suggestions.push('High cyclomatic complexity detected. Consider refactoring into smaller functions')
    }

    if (complexity.cognitive > 15) {
      suggestions.push('High cognitive complexity. Simplify logic or reduce nesting')
    }

    // Function count
    if (metrics.functions > 20 && metrics.classes === 0) {
      suggestions.push('Consider organizing functions into classes or modules')
    }

    // Line count
    if (metrics.linesOfCode > 300) {
      suggestions.push('File is large. Consider splitting into multiple smaller files')
    }

    return suggestions
  }

  /**
   * Format analysis results as string
   */
  private formatAnalysis(analysis: CodeAnalysisResult): string {
    const parts: string[] = []

    // Complexity
    parts.push('COMPLEXITY METRICS:')
    parts.push(`  Cyclomatic: ${analysis.complexity.cyclomatic}`)
    parts.push(`  Cognitive: ${analysis.complexity.cognitive}`)
    parts.push(`  Halstead Difficulty: ${analysis.complexity.halstead.difficulty.toFixed(2)}`)
    parts.push('')

    // Metrics
    parts.push('CODE METRICS:')
    parts.push(`  Lines of Code: ${analysis.metrics.linesOfCode}`)
    parts.push(`  Comment Lines: ${analysis.metrics.commentLines}`)
    parts.push(`  Functions: ${analysis.metrics.functions}`)
    parts.push(`  Classes: ${analysis.metrics.classes}`)
    parts.push('')

    // Issues
    if (analysis.issues.length > 0) {
      parts.push('ISSUES FOUND:')
      analysis.issues.forEach(issue => {
        parts.push(`  [${issue.type.toUpperCase()}] Line ${issue.line}: ${issue.message} (${issue.rule})`)
      })
      parts.push('')
    }

    // Suggestions
    if (analysis.suggestions.length > 0) {
      parts.push('SUGGESTIONS:')
      analysis.suggestions.forEach((suggestion, index) => {
        parts.push(`  ${index + 1}. ${suggestion}`)
      })
    }

    return parts.join('\n')
  }
}

/**
 * Create code analyzer tool
 */
export function createCodeAnalyzerTool(): CodeAnalyzerTool {
  return new CodeAnalyzerTool()
}
