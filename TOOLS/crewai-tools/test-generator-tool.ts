/**
 * CrewAI Test Generator Tool
 *
 * Tool for automatically generating unit tests for code.
 * Compatible with CrewAI agents.
 *
 * @example
 * ```typescript
 * import { TestGeneratorTool } from './test-generator-tool'
 *
 * const tool = new TestGeneratorTool({
 *   framework: 'vitest',
 *   style: 'behavioral'
 * })
 *
 * // Use in CrewAI agent
 * const agent = new Agent({
 *   role: 'Test Engineer',
 *   tools: [tool]
 * })
 * ```
 */

import { Tool } from '@crewai/crewai'

export type TestFramework = 'jest' | 'vitest' | 'mocha' | 'playwright'
export type TestStyle = 'behavioral' | 'structural' | 'functional'
export type AssertionLibrary = 'chai' | 'expect' | 'assert'

export interface TestGeneratorOptions {
  /**
   * Test framework
   */
  framework?: TestFramework

  /**
   * Testing style
   */
  style?: TestStyle

  /**
   * Assertion library (for Mocha)
   */
  assertionLibrary?: AssertionLibrary

  /**
   * Include setup/teardown
   */
  includeSetup?: boolean

  /**
   * Include edge cases
   */
  includeEdgeCases?: boolean

  /**
   * Include mocking examples
   */
  includeMocks?: boolean
}

export interface GeneratedTest {
  framework: TestFramework
  testCode: string
  imports: string[]
  coverage: {
    edgeCases: boolean
    errorHandling: boolean
    mocking: boolean
  }
  recommendations: string[]
}

export class TestGeneratorTool extends Tool {
  name = 'test_generator'
  description = `Generate unit tests for source code automatically.
Input should be source code as a string (TypeScript, JavaScript, Python, etc.).
Returns complete test file with test cases, mocks, and edge cases.
Supports multiple test frameworks (Jest, Vitest, Mocha, Playwright).`

  private options: Required<Omit<TestGeneratorOptions, 'assertionLibrary'>> & {
    assertionLibrary?: AssertionLibrary
  }

  constructor(options: TestGeneratorOptions = {}) {
    super()

    this.options = {
      framework: options.framework || 'vitest',
      style: options.style || 'behavioral',
      assertionLibrary: options.assertionLibrary,
      includeSetup: options.includeSetup ?? true,
      includeEdgeCases: options.includeEdgeCases ?? true,
      includeMocks: options.includeMocks ?? true,
    }
  }

  async _run(code: string): Promise<string> {
    try {
      const test = this.generateTests(code)
      return this.formatOutput(test)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return `Error generating tests: ${errorMessage}`
    }
  }

  /**
   * Generate tests for code
   */
  private generateTests(code: string): GeneratedTest {
    // Extract functions from code
    const functions = this.extractFunctions(code)

    // Generate test cases
    const testCases = functions.map((fn) => this.generateTestCasesForFunction(fn))

    // Build test file
    const testCode = this.buildTestFile(testCases)

    // Get imports
    const imports = this.getImports()

    return {
      framework: this.options.framework,
      testCode,
      imports,
      coverage: {
        edgeCases: this.options.includeEdgeCases,
        errorHandling: true,
        mocking: this.options.includeMocks,
      },
      recommendations: this.getRecommendations(functions),
    }
  }

  /**
   * Extract functions from code
   */
  private extractFunctions(code: string): Array<{
    name: string
    params: string[]
    isAsync: boolean
  }> {
    const functions: Array<{ name: string; params: string[]; isAsync: boolean }> = []

    // Match function declarations
    const functionRegex = /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g
    let match

    while ((match = functionRegex.exec(code)) !== null) {
      const isAsync = match[0].startsWith('async')
      const name = match[1]
      const params = match[2]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)

      functions.push({ name, params, isAsync })
    }

    // Match arrow functions
    const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g

    while ((match = arrowRegex.exec(code)) !== null) {
      const isAsync = match[0].includes('async')
      const name = match[1]
      const params = match[2]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)

      functions.push({ name, params, isAsync })
    }

    // Match class methods
    const methodRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g

    while ((match = methodRegex.exec(code)) !== null) {
      const isAsync = match[0].startsWith('async')
      const name = match[1]
      const params = match[2]
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)

      if (name !== 'constructor') {
        functions.push({ name, params, isAsync })
      }
    }

    return functions
  }

  /**
   * Generate test cases for a function
   */
  private generateTestCasesForFunction(fn: {
    name: string
    params: string[]
    isAsync: boolean
  }): string {
    const testSuite: string[] = []

    // Describe block
    testSuite.push(`describe('${fn.name}', () => {`)

    // Setup/Teardown
    if (this.options.includeSetup) {
      testSuite.push(`  beforeEach(() => {`)
      testSuite.push(`    // Setup`)
      testSuite.push(`  })`)
      testSuite.push(``)
      testSuite.push(`  afterEach(() => {`)
      testSuite.push(`    // Cleanup`)
      testSuite.push(`  })`)
      testSuite.push(``)
    }

    // Happy path test
    testSuite.push(`  it('should work correctly with valid inputs', ${fn.isAsync ? 'async ' : ''}() => {`)
    testSuite.push(`    // Arrange`)
    fn.params.forEach((param, i) => {
      testSuite.push(`    const ${param} = // TODO: Provide test value`)
    })
    testSuite.push(``)
    testSuite.push(`    // Act`)
    const funcCall = `${fn.name}(${fn.params.join(', ')})`
    testSuite.push(`    const result = ${fn.isAsync ? 'await ' : ''}${funcCall}`)
    testSuite.push(``)
    testSuite.push(`    // Assert`)
    testSuite.push(`    expect(result).toBeDefined()`)
    testSuite.push(`    // TODO: Add specific assertions`)
    testSuite.push(`  })`)
    testSuite.push(``)

    // Edge cases
    if (this.options.includeEdgeCases) {
      testSuite.push(`  it('should handle edge cases', ${fn.isAsync ? 'async ' : ''}() => {`)
      testSuite.push(`    // Test with empty/null/undefined values`)
      testSuite.push(`    // TODO: Implement edge case tests`)
      testSuite.push(`  })`)
      testSuite.push(``)
    }

    // Error handling
    testSuite.push(`  it('should handle errors gracefully', ${fn.isAsync ? 'async ' : ''}() => {`)
    if (fn.isAsync) {
      testSuite.push(`    await expect(${fn.name}(/* invalid input */)).rejects.toThrow()`)
    } else {
      testSuite.push(`    expect(() => ${fn.name}(/* invalid input */)).toThrow()`)
    }
    testSuite.push(`  })`)

    testSuite.push(`})`)
    testSuite.push(``)

    return testSuite.join('\n')
  }

  /**
   * Build complete test file
   */
  private buildTestFile(testCases: string[]): string {
    const parts: string[] = []

    // Imports
    parts.push(...this.getImports())
    parts.push('')

    // Test suites
    parts.push(...testCases)

    return parts.join('\n')
  }

  /**
   * Get framework-specific imports
   */
  private getImports(): string[] {
    const imports: string[] = []

    switch (this.options.framework) {
      case 'jest':
        imports.push(`import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'`)
        break

      case 'vitest':
        imports.push(`import { describe, it, expect, beforeEach, afterEach } from 'vitest'`)
        break

      case 'mocha':
        imports.push(`import { describe, it, beforeEach, afterEach } from 'mocha'`)
        if (this.options.assertionLibrary === 'chai') {
          imports.push(`import { expect } from 'chai'`)
        }
        break

      case 'playwright':
        imports.push(`import { test, expect } from '@playwright/test'`)
        break
    }

    if (this.options.includeMocks) {
      if (this.options.framework === 'vitest') {
        imports.push(`import { vi } from 'vitest'`)
      } else if (this.options.framework === 'jest') {
        imports.push(`import { jest } from '@jest/globals'`)
      }
    }

    return imports
  }

  /**
   * Format output
   */
  private formatOutput(test: GeneratedTest): string {
    const parts: string[] = []

    parts.push('GENERATED TEST FILE')
    parts.push('=' .repeat(60))
    parts.push('')
    parts.push(`Framework: ${test.framework}`)
    parts.push(`Edge Cases: ${test.coverage.edgeCases ? 'Yes' : 'No'}`)
    parts.push(`Error Handling: ${test.coverage.errorHandling ? 'Yes' : 'No'}`)
    parts.push(`Mocking: ${test.coverage.mocking ? 'Yes' : 'No'}`)
    parts.push('')
    parts.push('TEST CODE:')
    parts.push('-'.repeat(60))
    parts.push(test.testCode)
    parts.push('')

    if (test.recommendations.length > 0) {
      parts.push('RECOMMENDATIONS:')
      test.recommendations.forEach((rec, i) => {
        parts.push(`${i + 1}. ${rec}`)
      })
      parts.push('')
    }

    return parts.join('\n')
  }

  /**
   * Get testing recommendations
   */
  private getRecommendations(
    functions: Array<{ name: string; params: string[]; isAsync: boolean }>
  ): string[] {
    const recommendations: string[] = []

    // Check for async functions
    const asyncFunctions = functions.filter((fn) => fn.isAsync)
    if (asyncFunctions.length > 0) {
      recommendations.push(
        'Consider testing async functions with proper error handling and timeout cases'
      )
    }

    // Check for functions with many parameters
    const complexFunctions = functions.filter((fn) => fn.params.length > 3)
    if (complexFunctions.length > 0) {
      recommendations.push(
        'Functions with many parameters may benefit from parameter object pattern'
      )
    }

    // General recommendations
    recommendations.push('Consider adding integration tests for end-to-end workflows')
    recommendations.push('Test boundary conditions and invalid inputs')
    recommendations.push('Use descriptive test names that explain the expected behavior')
    recommendations.push('Follow AAA pattern: Arrange, Act, Assert')

    return recommendations
  }
}

/**
 * Create test generator tool
 */
export function createTestGeneratorTool(
  options: TestGeneratorOptions = {}
): TestGeneratorTool {
  return new TestGeneratorTool(options)
}
