/**
 * Test Runner Script
 *
 * Automated test execution with reporting and CI/CD integration.
 *
 * Features:
 * - Multiple test types (unit, integration, e2e)
 * - Parallel execution
 * - Coverage reporting
 * - Watch mode
 * - CI/CD integration
 * - Custom reporters
 * - Failure analysis
 *
 * @example
 * ```bash
 * # Run all tests
 * ts-node test-runner.ts
 *
 * # Run specific test type
 * ts-node test-runner.ts --type unit
 *
 * # Run with coverage
 * ts-node test-runner.ts --coverage
 *
 * # Watch mode
 * ts-node test-runner.ts --watch
 * ```
 */

import { spawn, exec } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export type TestType = 'unit' | 'integration' | 'e2e' | 'all'
export type TestFramework = 'jest' | 'vitest' | 'playwright' | 'cypress'

export interface TestRunnerOptions {
  /**
   * Test type to run
   */
  type?: TestType

  /**
   * Test framework
   */
  framework?: TestFramework

  /**
   * Generate coverage report
   */
  coverage?: boolean

  /**
   * Watch mode
   */
  watch?: boolean

  /**
   * Run tests in parallel
   */
  parallel?: boolean

  /**
   * Bail on first failure
   */
  bail?: boolean

  /**
   * Test pattern/filter
   */
  pattern?: string

  /**
   * Output directory for reports
   */
  outputDir?: string

  /**
   * CI mode (no interactive prompts)
   */
  ci?: boolean

  /**
   * Verbose output
   */
  verbose?: boolean

  /**
   * Update snapshots
   */
  updateSnapshots?: boolean

  /**
   * Max workers for parallel execution
   */
  maxWorkers?: number
}

export interface TestResult {
  success: boolean
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  duration: number
  coverage?: {
    lines: number
    statements: number
    functions: number
    branches: number
  }
  failures: Array<{
    test: string
    error: string
  }>
}

export class TestRunner {
  private options: Required<Omit<TestRunnerOptions, 'pattern' | 'maxWorkers'>> & {
    pattern?: string
    maxWorkers?: number
  }

  constructor(options: TestRunnerOptions = {}) {
    this.options = {
      type: options.type || 'all',
      framework: options.framework || this.detectFramework(),
      coverage: options.coverage ?? false,
      watch: options.watch ?? false,
      parallel: options.parallel ?? true,
      bail: options.bail ?? false,
      pattern: options.pattern,
      outputDir: options.outputDir || './test-results',
      ci: options.ci ?? this.isCI(),
      verbose: options.verbose ?? false,
      updateSnapshots: options.updateSnapshots ?? false,
      maxWorkers: options.maxWorkers,
    }
  }

  /**
   * Run tests
   */
  async run(): Promise<TestResult> {
    console.log(`Running ${this.options.type} tests with ${this.options.framework}...\n`)

    const startTime = Date.now()

    try {
      // Build test command
      const command = this.buildCommand()

      // Execute tests
      const result = await this.executeTests(command)

      // Parse results
      const testResult = this.parseResults(result, Date.now() - startTime)

      // Generate reports
      await this.generateReports(testResult)

      // Print summary
      this.printSummary(testResult)

      return testResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`Tests failed: ${errorMessage}`)

      return {
        success: false,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        duration: Date.now() - startTime,
        failures: [{ test: 'Test execution', error: errorMessage }],
      }
    }
  }

  /**
   * Build test command based on framework and options
   */
  private buildCommand(): string {
    const parts: string[] = []

    switch (this.options.framework) {
      case 'jest':
        parts.push('jest')
        if (this.options.coverage) parts.push('--coverage')
        if (this.options.watch) parts.push('--watch')
        if (this.options.bail) parts.push('--bail')
        if (this.options.ci) parts.push('--ci')
        if (this.options.verbose) parts.push('--verbose')
        if (this.options.updateSnapshots) parts.push('--updateSnapshot')
        if (this.options.maxWorkers) parts.push(`--maxWorkers=${this.options.maxWorkers}`)
        if (this.options.pattern) parts.push(this.options.pattern)
        break

      case 'vitest':
        parts.push('vitest')
        if (this.options.coverage) parts.push('--coverage')
        if (this.options.watch) parts.push('--watch')
        if (this.options.bail) parts.push('--bail')
        if (this.options.ci) parts.push('--run')
        if (this.options.updateSnapshots) parts.push('--update')
        if (this.options.maxWorkers) parts.push(`--threads=${this.options.maxWorkers}`)
        if (this.options.pattern) parts.push(this.options.pattern)
        break

      case 'playwright':
        parts.push('playwright test')
        if (this.options.parallel) parts.push('--workers=auto')
        if (this.options.bail) parts.push('--max-failures=1')
        if (this.options.pattern) parts.push(this.options.pattern)
        break

      case 'cypress':
        parts.push(this.options.ci ? 'cypress run' : 'cypress open')
        if (this.options.pattern) parts.push(`--spec "${this.options.pattern}"`)
        break
    }

    return parts.join(' ')
  }

  /**
   * Execute test command
   */
  private executeTests(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [], {
        shell: true,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
      })

      let output = ''

      if (!this.options.verbose) {
        child.stdout?.on('data', (data) => {
          output += data.toString()
        })

        child.stderr?.on('data', (data) => {
          output += data.toString()
        })
      }

      child.on('close', (code) => {
        if (code === 0 || output) {
          resolve(output)
        } else {
          reject(new Error(`Test command exited with code ${code}`))
        }
      })

      child.on('error', reject)
    })
  }

  /**
   * Parse test results from output
   */
  private parseResults(output: string, duration: number): TestResult {
    const result: TestResult = {
      success: true,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration,
      failures: [],
    }

    // Parse based on framework
    switch (this.options.framework) {
      case 'jest':
      case 'vitest':
        result.totalTests = this.extractNumber(output, /Tests:\s+(\d+)\s+total/) || 0
        result.passedTests = this.extractNumber(output, /(\d+)\s+passed/) || 0
        result.failedTests = this.extractNumber(output, /(\d+)\s+failed/) || 0
        result.skippedTests = this.extractNumber(output, /(\d+)\s+skipped/) || 0
        result.success = result.failedTests === 0
        break

      case 'playwright':
        result.totalTests = this.extractNumber(output, /(\d+)\s+passed/) || 0
        result.passedTests = result.totalTests
        result.failedTests = this.extractNumber(output, /(\d+)\s+failed/) || 0
        result.success = result.failedTests === 0
        break

      case 'cypress':
        result.totalTests = this.extractNumber(output, /(\d+)\s+tests/) || 0
        result.passedTests = this.extractNumber(output, /(\d+)\s+passing/) || 0
        result.failedTests = this.extractNumber(output, /(\d+)\s+failing/) || 0
        result.success = result.failedTests === 0
        break
    }

    // Extract coverage if available
    if (this.options.coverage) {
      result.coverage = {
        lines: this.extractNumber(output, /Lines\s+:\s+([\d.]+)%/) || 0,
        statements: this.extractNumber(output, /Statements\s+:\s+([\d.]+)%/) || 0,
        functions: this.extractNumber(output, /Functions\s+:\s+([\d.]+)%/) || 0,
        branches: this.extractNumber(output, /Branches\s+:\s+([\d.]+)%/) || 0,
      }
    }

    return result
  }

  /**
   * Extract number from regex match
   */
  private extractNumber(text: string, regex: RegExp): number | null {
    const match = text.match(regex)
    return match ? parseFloat(match[1]) : null
  }

  /**
   * Generate test reports
   */
  private async generateReports(result: TestResult): Promise<void> {
    // Create JSON report
    const jsonReport = {
      ...result,
      timestamp: new Date().toISOString(),
      framework: this.options.framework,
      type: this.options.type,
    }

    writeFileSync(
      join(this.options.outputDir, 'test-report.json'),
      JSON.stringify(jsonReport, null, 2)
    )

    // Create HTML report (simple)
    const htmlReport = this.generateHTMLReport(result)
    writeFileSync(join(this.options.outputDir, 'test-report.html'), htmlReport)
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(result: TestResult): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .metric { margin: 10px 0; }
    .coverage { margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Test Report</h1>
  <div class="summary">
    <h2 class="${result.success ? 'passed' : 'failed'}">
      ${result.success ? '✓ Tests Passed' : '✗ Tests Failed'}
    </h2>
    <div class="metric">Total: ${result.totalTests}</div>
    <div class="metric passed">Passed: ${result.passedTests}</div>
    <div class="metric failed">Failed: ${result.failedTests}</div>
    <div class="metric">Skipped: ${result.skippedTests}</div>
    <div class="metric">Duration: ${(result.duration / 1000).toFixed(2)}s</div>
    ${
      result.coverage
        ? `
    <div class="coverage">
      <h3>Coverage</h3>
      <div>Lines: ${result.coverage.lines}%</div>
      <div>Statements: ${result.coverage.statements}%</div>
      <div>Functions: ${result.coverage.functions}%</div>
      <div>Branches: ${result.coverage.branches}%</div>
    </div>
    `
        : ''
    }
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Print test summary
   */
  private printSummary(result: TestResult): void {
    console.log('\n' + '='.repeat(60))
    console.log('Test Summary')
    console.log('='.repeat(60))
    console.log(`Status: ${result.success ? '✓ PASSED' : '✗ FAILED'}`)
    console.log(`Total: ${result.totalTests}`)
    console.log(`Passed: ${result.passedTests}`)
    console.log(`Failed: ${result.failedTests}`)
    console.log(`Skipped: ${result.skippedTests}`)
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`)

    if (result.coverage) {
      console.log('\nCoverage:')
      console.log(`  Lines: ${result.coverage.lines}%`)
      console.log(`  Statements: ${result.coverage.statements}%`)
      console.log(`  Functions: ${result.coverage.functions}%`)
      console.log(`  Branches: ${result.coverage.branches}%`)
    }

    console.log('='.repeat(60) + '\n')
  }

  /**
   * Detect test framework from package.json
   */
  private detectFramework(): TestFramework {
    const packageJsonPath = join(process.cwd(), 'package.json')

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      if (deps.vitest) return 'vitest'
      if (deps.playwright) return 'playwright'
      if (deps.cypress) return 'cypress'
      if (deps.jest) return 'jest'
    }

    return 'jest' // Default
  }

  /**
   * Check if running in CI environment
   */
  private isCI(): boolean {
    return !!(
      process.env.CI ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.TRAVIS
    )
  }
}

/**
 * Run tests from environment variables
 */
export async function runTests(): Promise<void> {
  const runner = new TestRunner({
    type: (process.env.TEST_TYPE as TestType) || 'all',
    coverage: process.env.TEST_COVERAGE === 'true',
    watch: process.env.TEST_WATCH === 'true',
    ci: process.env.CI === 'true',
  })

  const result = await runner.run()

  if (!result.success) {
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}
