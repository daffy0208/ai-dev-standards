#!/usr/bin/env node

/**
 * SECURITY TEST SUITE
 *
 * Tests all security fixes from Phase 1:
 * - Path traversal attacks
 * - Code injection attempts
 * - Invalid identifiers
 *
 * All tests should FAIL with clear error messages
 */

const ComponentGenerator = require('./generators/component-generator')
const McpGenerator = require('./generators/mcp-generator')
const IntegrationGenerator = require('./generators/integration-generator')
const ToolGenerator = require('./generators/tool-generator')

const chalk = require('chalk')

// Test results
let testResults = []

function runTest(testName, testFn) {
  console.log(chalk.blue(`\n🧪 ${testName}`))
  try {
    testFn()
    console.log(chalk.red('  ❌ FAIL - Attack was not blocked!'))
    testResults.push({ test: testName, result: 'FAIL', reason: 'Attack succeeded' })
    return false
  } catch (error) {
    console.log(chalk.green('  ✅ PASS - Attack blocked'))
    console.log(chalk.gray(`  Error: ${error.message}`))
    testResults.push({ test: testName, result: 'PASS', error: error.message })
    return true
  }
}

async function runAsyncTest(testName, testFn) {
  console.log(chalk.blue(`\n🧪 ${testName}`))
  try {
    await testFn()
    console.log(chalk.red('  ❌ FAIL - Attack was not blocked!'))
    testResults.push({ test: testName, result: 'FAIL', reason: 'Attack succeeded' })
    return false
  } catch (error) {
    console.log(chalk.green('  ✅ PASS - Attack blocked'))
    console.log(chalk.gray(`  Error: ${error.message}`))
    testResults.push({ test: testName, result: 'PASS', error: error.message })
    return true
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════╗'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('║      SECURITY VULNERABILITY TEST SUITE        ║'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════╝\n'))

  console.log(chalk.yellow('Testing security fixes from Phase 1...'))
  console.log(chalk.gray('All tests should PASS (attacks should be blocked)\n'))

  // ============================================================================
  // PATH TRAVERSAL TESTS
  // ============================================================================

  console.log(chalk.bold('\n📂 PATH TRAVERSAL PROTECTION'))
  console.log(chalk.gray('━'.repeat(50)))

  const componentGen = new ComponentGenerator()
  const mcpGen = new McpGenerator()
  const integrationGen = new IntegrationGenerator()

  // Test 1: Unix-style path traversal
  await runAsyncTest(
    'Test 1: Component with Unix path traversal (../../../etc/passwd)',
    async () => {
      await componentGen.generate({ name: '../../../etc/passwd' })
    }
  )

  // Test 2: Windows-style path traversal
  await runAsyncTest(
    'Test 2: Component with Windows path traversal (..\\\\windows\\\\system32)',
    async () => {
      await componentGen.generate({ name: '..\\windows\\system32' })
    }
  )

  // Test 3: Absolute path
  await runAsyncTest(
    'Test 3: MCP with absolute path (/etc/shadow)',
    async () => {
      await mcpGen.generate({ name: '/etc/shadow' })
    }
  )

  // Test 4: Relative path in middle
  await runAsyncTest(
    'Test 4: Integration with relative path (test/../../../tmp/evil)',
    async () => {
      await integrationGen.generate({ name: 'test/../../../tmp/evil' })
    }
  )

  // Test 5: Parent directory reference
  await runAsyncTest(
    'Test 5: Component with parent reference (..)',
    async () => {
      await componentGen.generate({ name: '..' })
    }
  )

  // Test 6: Hidden file attempt
  await runAsyncTest(
    'Test 6: Component starting with dot (.hidden)',
    async () => {
      await componentGen.generate({ name: '.hidden' })
    }
  )

  // ============================================================================
  // CODE INJECTION TESTS
  // ============================================================================

  console.log(chalk.bold('\n💉 CODE INJECTION PREVENTION'))
  console.log(chalk.gray('━'.repeat(50)))

  // Test 7: Reserved keyword - class
  await runAsyncTest(
    'Test 7: Component with reserved keyword (class)',
    async () => {
      await componentGen.generate({ name: 'class' })
    }
  )

  // Test 8: Reserved keyword - function
  await runAsyncTest(
    'Test 8: Component with reserved keyword (function)',
    async () => {
      await componentGen.generate({ name: 'function' })
    }
  )

  // Test 9: Reserved keyword - return
  await runAsyncTest(
    'Test 9: Integration with reserved keyword (return)',
    async () => {
      await integrationGen.generate({ name: 'return' })
    }
  )

  // Test 10: Invalid identifier - starts with number
  await runAsyncTest(
    'Test 10: Component starting with number (123test)',
    async () => {
      await componentGen.generate({ name: '123test' })
    }
  )

  // Test 11: Invalid identifier - special characters
  await runAsyncTest(
    'Test 11: Component with special characters (test@component)',
    async () => {
      await componentGen.generate({ name: 'test@component' })
    }
  )

  // Test 12: Invalid identifier - spaces
  await runAsyncTest(
    'Test 12: Component with spaces (my component)',
    async () => {
      await componentGen.generate({ name: 'my component' })
    }
  )

  // Test 13: SQL injection attempt
  await runAsyncTest(
    "Test 13: Component with SQL injection ('; DROP TABLE users;--)",
    async () => {
      await componentGen.generate({ name: "'; DROP TABLE users;--" })
    }
  )

  // Test 14: Script injection attempt
  await runAsyncTest(
    'Test 14: Component with script injection (<script>alert(1)</script>)',
    async () => {
      await componentGen.generate({ name: '<script>alert(1)</script>' })
    }
  )

  // ============================================================================
  // PROP VALIDATION TESTS
  // ============================================================================

  console.log(chalk.bold('\n🔧 PROP VALIDATION'))
  console.log(chalk.gray('━'.repeat(50)))

  // Test 15: Invalid prop name - reserved keyword
  await runAsyncTest(
    'Test 15: Component with reserved keyword prop (class)',
    async () => {
      await componentGen.generate({
        name: 'TestComponent',
        props: { 'class': 'string' }
      })
    }
  )

  // Test 16: Invalid prop name - starts with number
  await runAsyncTest(
    'Test 16: Component with number-starting prop (1name)',
    async () => {
      await componentGen.generate({
        name: 'TestComponent',
        props: { '1name': 'string' }
      })
    }
  )

  // Test 17: Invalid prop name - special characters
  await runAsyncTest(
    'Test 17: Component with special character prop (on@click)',
    async () => {
      await componentGen.generate({
        name: 'TestComponent',
        props: { 'on@click': 'string' }
      })
    }
  )

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  console.log(chalk.bold('\n⚠️  EDGE CASES'))
  console.log(chalk.gray('━'.repeat(50)))

  // Test 18: Empty name
  await runAsyncTest(
    'Test 18: Component with empty name',
    async () => {
      await componentGen.generate({ name: '' })
    }
  )

  // Test 19: Whitespace only
  await runAsyncTest(
    'Test 19: Component with whitespace only',
    async () => {
      await componentGen.generate({ name: '   ' })
    }
  )

  // Test 20: Very long name (over 100 chars)
  await runAsyncTest(
    'Test 20: Component with very long name (>100 chars)',
    async () => {
      await componentGen.generate({ name: 'A'.repeat(101) })
    }
  )

  // Test 21: Null input
  await runAsyncTest(
    'Test 21: Component with null name',
    async () => {
      await componentGen.generate({ name: null })
    }
  )

  // Test 22: Undefined input
  await runAsyncTest(
    'Test 22: Component with undefined name',
    async () => {
      await componentGen.generate({ name: undefined })
    }
  )

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================

  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════╗'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('║              TEST RESULTS SUMMARY             ║'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════╝\n'))

  const totalTests = testResults.length
  const passed = testResults.filter(r => r.result === 'PASS').length
  const failed = testResults.filter(r => r.result === 'FAIL').length
  const passRate = ((passed / totalTests) * 100).toFixed(1)

  console.log(chalk.bold(`Total Tests: ${totalTests}`))
  console.log(chalk.green(`Passed: ${passed}`))
  console.log(chalk.red(`Failed: ${failed}`))
  console.log(chalk.bold(`Pass Rate: ${passRate}%\n`))

  if (failed === 0) {
    console.log(chalk.bold.green('✅ ALL SECURITY TESTS PASSED!'))
    console.log(chalk.green('All vulnerabilities are properly blocked.\n'))
  } else {
    console.log(chalk.bold.red('❌ SOME TESTS FAILED!'))
    console.log(chalk.red('Some attacks were not blocked. Review the failures above.\n'))

    console.log(chalk.bold.red('\nFailed Tests:'))
    testResults.filter(r => r.result === 'FAIL').forEach(r => {
      console.log(chalk.red(`  ❌ ${r.test}`))
      console.log(chalk.gray(`     Reason: ${r.reason}`))
    })
  }

  // Print detailed error messages for passed tests (proof of blocking)
  console.log(chalk.bold.cyan('\n📋 VALIDATION ERROR MESSAGES (Proof of Protection)'))
  console.log(chalk.gray('━'.repeat(50)))
  testResults.filter(r => r.result === 'PASS').slice(0, 5).forEach(r => {
    console.log(chalk.blue(`\n${r.test}:`))
    console.log(chalk.gray(`  ${r.error}`))
  })
  console.log(chalk.gray('\n... (showing first 5 error messages)\n'))

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(error => {
  console.error(chalk.red('\n❌ Test suite failed:'))
  console.error(error)
  process.exit(1)
})
