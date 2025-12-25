#!/usr/bin/env node

/**
 * Generator Test Suite
 * Tests all code generators to ensure they produce valid, working code
 */

const fs = require('fs-extra')
const path = require('path')
const ComponentGenerator = require('./CLI/generators/component-generator')
const McpGenerator = require('./CLI/generators/mcp-generator')
const IntegrationGenerator = require('./CLI/generators/integration-generator')
const ToolGenerator = require('./CLI/generators/tool-generator')

// Test results
const testResults = {
  component: { passed: 0, failed: 0, tests: [] },
  mcp: { passed: 0, failed: 0, tests: [] },
  integration: { passed: 0, failed: 0, tests: [] },
  tool: { passed: 0, failed: 0, tests: [] }
}

// Test output directory
const TEST_OUTPUT_DIR = path.join(__dirname, 'test-output')

/**
 * Setup test environment
 */
async function setup() {
  console.log('Setting up test environment...\n')
  await fs.ensureDir(TEST_OUTPUT_DIR)
  await fs.emptyDir(TEST_OUTPUT_DIR)
}

/**
 * Cleanup test environment
 */
async function cleanup() {
  console.log('\nCleaning up...')
  // Keep test output for inspection
  // await fs.remove(TEST_OUTPUT_DIR)
}

/**
 * Test Component Generator
 */
async function testComponentGenerator() {
  console.log('==================================================')
  console.log('Testing Component Generator')
  console.log('==================================================\n')

  const generator = new ComponentGenerator()

  // Test 1: Generate basic component with props
  try {
    console.log('Test 1: Generate TestButton with props...')
    const files = await generator.generate({
      name: 'TestButton',
      props: {
        label: 'string',
        onClick: 'function'
      },
      withTests: true,
      withStorybook: false
    })

    // Verify files
    const expectedFiles = [
      'components/TestButton/TestButton.tsx',
      'components/TestButton/index.ts',
      'components/TestButton/TestButton.test.tsx'
    ]

    for (const file of files) {
      console.log(`  ✓ Generated: ${file.path}`)

      // Write to test output
      const outputPath = path.join(TEST_OUTPUT_DIR, file.path)
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, file.content)

      // Verify file has content
      if (!file.content || file.content.length === 0) {
        throw new Error(`File ${file.path} has no content`)
      }

      // Verify TypeScript syntax (basic check)
      if (file.path.endsWith('.tsx') || file.path.endsWith('.ts')) {
        if (!file.content.includes('import') && !file.content.includes('export')) {
          throw new Error(`File ${file.path} appears to be missing imports/exports`)
        }
      }
    }

    // Check for specific fixes
    const testFile = files.find(f => f.path.includes('.test.tsx'))
    if (!testFile.content.includes('renders without crashing')) {
      throw new Error('Test file missing basic test case')
    }

    testResults.component.passed++
    testResults.component.tests.push({
      name: 'Generate TestButton with props',
      status: 'PASS',
      files: files.map(f => f.path)
    })
    console.log('  ✓ Test 1 PASSED\n')
  } catch (error) {
    testResults.component.failed++
    testResults.component.tests.push({
      name: 'Generate TestButton with props',
      status: 'FAIL',
      error: error.message
    })
    console.log(`  ✗ Test 1 FAILED: ${error.message}\n`)
  }
}

/**
 * Test MCP Generator
 */
async function testMcpGenerator() {
  console.log('==================================================')
  console.log('Testing MCP Generator')
  console.log('==================================================\n')

  const generator = new McpGenerator()

  // Test 1: Generate MCP with tools
  try {
    console.log('Test 1: Generate testvalidation MCP...')
    const files = await generator.generate({
      name: 'testvalidation',
      description: 'Test validation MCP server',
      features: ['tools', 'resources']
    })

    // Verify files
    const expectedFiles = [
      'mcp-servers/testvalidation-mcp/index.js',
      'mcp-servers/testvalidation-mcp/package.json',
      'mcp-servers/testvalidation-mcp/README.md',
      'mcp-servers/testvalidation-mcp/.env.example'
    ]

    for (const file of files) {
      console.log(`  ✓ Generated: ${file.path}`)

      // Write to test output
      const outputPath = path.join(TEST_OUTPUT_DIR, file.path)
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, file.content)

      // Verify file has content
      if (!file.content || file.content.length === 0) {
        throw new Error(`File ${file.path} has no content`)
      }
    }

    // Check for Phase 1 & 2 fixes
    const indexFile = files.find(f => f.path.includes('index.js'))
    if (!indexFile.content.includes('args ?? {}')) {
      throw new Error('Missing fix for handling missing arguments')
    }

    const packageFile = files.find(f => f.path.includes('package.json'))
    const pkg = JSON.parse(packageFile.content)
    if (!pkg.bin) {
      throw new Error('package.json missing bin field')
    }

    testResults.mcp.passed++
    testResults.mcp.tests.push({
      name: 'Generate testvalidation MCP',
      status: 'PASS',
      files: files.map(f => f.path)
    })
    console.log('  ✓ Test 1 PASSED\n')
  } catch (error) {
    testResults.mcp.failed++
    testResults.mcp.tests.push({
      name: 'Generate testvalidation MCP',
      status: 'FAIL',
      error: error.message
    })
    console.log(`  ✗ Test 1 FAILED: ${error.message}\n`)
  }
}

/**
 * Test Integration Generator
 */
async function testIntegrationGenerator() {
  console.log('==================================================')
  console.log('Testing Integration Generator')
  console.log('==================================================\n')

  const generator = new IntegrationGenerator()

  // Test 1: Generate integration with types and env
  try {
    console.log('Test 1: Generate testapi integration...')
    const files = await generator.generate({
      name: 'testapi',
      provider: 'custom',
      withAuth: false,
      withTypes: true,
      withEnv: true
    })

    for (const file of files) {
      console.log(`  ✓ Generated: ${file.path}`)

      // Write to test output
      const outputPath = path.join(TEST_OUTPUT_DIR, file.path)
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, file.content)

      // Verify file has content
      if (!file.content || file.content.length === 0) {
        throw new Error(`File ${file.path} has no content`)
      }
    }

    // Check for Phase 1 & 2 fixes
    const clientFile = files.find(f => f.path.includes('-client.ts'))
    if (!clientFile.content.includes('response.status === 204')) {
      throw new Error('Missing fix for handling 204 responses')
    }

    if (!clientFile.content.includes('Headers instance to plain object')) {
      throw new Error('Missing fix for Headers instance handling')
    }

    const indexFile = files.find(f => f.path.endsWith('index.ts'))
    if (!indexFile.content.includes('export type * from')) {
      throw new Error('Missing type exports in index file')
    }

    testResults.integration.passed++
    testResults.integration.tests.push({
      name: 'Generate testapi integration',
      status: 'PASS',
      files: files.map(f => f.path)
    })
    console.log('  ✓ Test 1 PASSED\n')
  } catch (error) {
    testResults.integration.failed++
    testResults.integration.tests.push({
      name: 'Generate testapi integration',
      status: 'FAIL',
      error: error.message
    })
    console.log(`  ✗ Test 1 FAILED: ${error.message}\n`)
  }
}

/**
 * Test Tool Generator
 */
async function testToolGenerator() {
  console.log('==================================================')
  console.log('Testing Tool Generator')
  console.log('==================================================\n')

  const generator = new ToolGenerator()

  // Test 1: Generate LangChain tool
  try {
    console.log('Test 1: Generate testsearch LangChain tool...')
    const files = await generator.generate({
      name: 'testsearch',
      framework: 'langchain',
      category: 'search'
    })

    for (const file of files) {
      console.log(`  ✓ Generated: ${file.path}`)

      // Write to test output
      const outputPath = path.join(TEST_OUTPUT_DIR, file.path)
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, file.content)

      // Verify file has content
      if (!file.content || file.content.length === 0) {
        throw new Error(`File ${file.path} has no content`)
      }
    }

    // Verify correct extension
    const toolFile = files.find(f => f.path.includes('-tool'))
    if (!toolFile.path.endsWith('.ts')) {
      throw new Error('LangChain tool should have .ts extension')
    }

    testResults.tool.passed++
    testResults.tool.tests.push({
      name: 'Generate testsearch LangChain tool',
      status: 'PASS',
      files: files.map(f => f.path)
    })
    console.log('  ✓ Test 1 PASSED\n')
  } catch (error) {
    testResults.tool.failed++
    testResults.tool.tests.push({
      name: 'Generate testsearch LangChain tool',
      status: 'FAIL',
      error: error.message
    })
    console.log(`  ✗ Test 1 FAILED: ${error.message}\n`)
  }

  // Test 2: Generate CrewAI tool
  try {
    console.log('Test 2: Generate testcrew CrewAI tool...')
    const files = await generator.generate({
      name: 'testcrew',
      framework: 'crewai',
      category: 'custom'
    })

    for (const file of files) {
      console.log(`  ✓ Generated: ${file.path}`)

      // Write to test output
      const outputPath = path.join(TEST_OUTPUT_DIR, file.path)
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, file.content)

      // Verify file has content
      if (!file.content || file.content.length === 0) {
        throw new Error(`File ${file.path} has no content`)
      }
    }

    // Verify correct extension
    const toolFile = files.find(f => f.path.includes('-tool.py'))
    if (!toolFile) {
      throw new Error('CrewAI tool should have .py extension')
    }

    // Check for datetime import (Phase 2 fix)
    if (!toolFile.content.includes('from datetime import datetime')) {
      throw new Error('CrewAI tool missing datetime import')
    }

    testResults.tool.passed++
    testResults.tool.tests.push({
      name: 'Generate testcrew CrewAI tool',
      status: 'PASS',
      files: files.map(f => f.path)
    })
    console.log('  ✓ Test 2 PASSED\n')
  } catch (error) {
    testResults.tool.failed++
    testResults.tool.tests.push({
      name: 'Generate testcrew CrewAI tool',
      status: 'FAIL',
      error: error.message
    })
    console.log(`  ✗ Test 2 FAILED: ${error.message}\n`)
  }
}

/**
 * Print test results
 */
function printResults() {
  console.log('\n==================================================')
  console.log('TEST RESULTS SUMMARY')
  console.log('==================================================\n')

  const categories = ['component', 'mcp', 'integration', 'tool']
  let totalPassed = 0
  let totalFailed = 0

  for (const category of categories) {
    const results = testResults[category]
    totalPassed += results.passed
    totalFailed += results.failed

    const status = results.failed === 0 ? '✓ PASS' : '✗ FAIL'
    console.log(`${category.toUpperCase()} Generator: ${status}`)
    console.log(`  Passed: ${results.passed}`)
    console.log(`  Failed: ${results.failed}`)

    // Show individual test results
    for (const test of results.tests) {
      if (test.status === 'FAIL') {
        console.log(`    ✗ ${test.name}: ${test.error}`)
      } else {
        console.log(`    ✓ ${test.name}`)
      }
    }
    console.log()
  }

  console.log('--------------------------------------------------')
  console.log(`Total Tests: ${totalPassed + totalFailed}`)
  console.log(`Passed: ${totalPassed}`)
  console.log(`Failed: ${totalFailed}`)
  console.log('--------------------------------------------------\n')

  console.log(`Test output saved to: ${TEST_OUTPUT_DIR}\n`)

  if (totalFailed > 0) {
    console.log('❌ Some tests failed. Please review the errors above.\n')
    process.exit(1)
  } else {
    console.log('✅ All tests passed!\n')
    process.exit(0)
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║                                                ║')
  console.log('║        Generator Validation Test Suite        ║')
  console.log('║                                                ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log('\n')

  try {
    await setup()
    await testComponentGenerator()
    await testMcpGenerator()
    await testIntegrationGenerator()
    await testToolGenerator()
    printResults()
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await cleanup()
  }
}

// Run tests
main()
