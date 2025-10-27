#!/usr/bin/env node

/**
 * TEST VALID GENERATION
 *
 * Ensures that legitimate use cases still work after security fixes
 */

const ComponentGenerator = require('./generators/component-generator')
const McpGenerator = require('./generators/mcp-generator')
const IntegrationGenerator = require('./generators/integration-generator')
const ToolGenerator = require('./generators/tool-generator')

const chalk = require('chalk')

async function testValidGeneration() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════╗'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('║        VALID GENERATION TEST SUITE            ║'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════╝\n'))

  console.log(chalk.yellow('Testing that legitimate use cases still work...\n'))

  let passed = 0
  let failed = 0

  // Test 1: Valid component with hyphen
  try {
    console.log(chalk.blue('🧪 Test 1: Valid component with hyphen (my-button)'))
    const componentGen = new ComponentGenerator()
    const files = await componentGen.generate({
      name: 'my-button',
      props: { onClick: 'function', label: 'string' }
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    console.log(chalk.gray(`     Component name: MyButton`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Test 2: Valid component with underscore
  try {
    console.log(chalk.blue('\n🧪 Test 2: Valid component with underscore (user_card)'))
    const componentGen = new ComponentGenerator()
    const files = await componentGen.generate({
      name: 'user_card',
      props: { name: 'string', email: 'string' }
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    console.log(chalk.gray(`     Component name: UserCard`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Test 3: Valid PascalCase component
  try {
    console.log(chalk.blue('\n🧪 Test 3: Valid PascalCase component (SecurityButton)'))
    const componentGen = new ComponentGenerator()
    const files = await componentGen.generate({
      name: 'SecurityButton',
      props: { variant: 'string', disabled: 'boolean' }
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    console.log(chalk.gray(`     Component name: SecurityButton`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Test 4: Valid MCP server
  try {
    console.log(chalk.blue('\n🧪 Test 4: Valid MCP server (security-audit)'))
    const mcpGen = new McpGenerator()
    const files = await mcpGen.generate({
      name: 'security-audit',
      description: 'Security audit MCP server',
      features: ['tools']
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Test 5: Valid integration
  try {
    console.log(chalk.blue('\n🧪 Test 5: Valid integration (auth-provider)'))
    const integrationGen = new IntegrationGenerator()
    const files = await integrationGen.generate({
      name: 'auth-provider',
      provider: 'custom',
      withTypes: true
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Test 6: Valid LangChain tool
  try {
    console.log(chalk.blue('\n🧪 Test 6: Valid LangChain tool (web-search)'))
    const toolGen = new ToolGenerator()
    const files = await toolGen.generate({
      name: 'web-search',
      framework: 'langchain',
      category: 'search'
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Test 7: Valid CrewAI tool (Python)
  try {
    console.log(chalk.blue('\n🧪 Test 7: Valid CrewAI tool (database_query)'))
    const toolGen = new ToolGenerator()
    const files = await toolGen.generate({
      name: 'database_query',
      framework: 'crewai',
      category: 'database'
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Test 8: Component with valid special props
  try {
    console.log(chalk.blue('\n🧪 Test 8: Component with valid special props ($state, _private)'))
    const componentGen = new ComponentGenerator()
    const files = await componentGen.generate({
      name: 'StateManager',
      props: {
        $state: 'object',
        _private: 'boolean',
        onChange: 'function'
      }
    })
    console.log(chalk.green(`  ✅ PASS - Generated ${files.length} files`))
    passed++
  } catch (error) {
    console.log(chalk.red(`  ❌ FAIL - ${error.message}`))
    failed++
  }

  // Summary
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════╗'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('║                  SUMMARY                      ║'))
  console.log(chalk.bold.cyan('║                                               ║'))
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════╝\n'))

  console.log(chalk.bold(`Total Tests: ${passed + failed}`))
  console.log(chalk.green(`Passed: ${passed}`))
  console.log(chalk.red(`Failed: ${failed}`))
  console.log(chalk.bold(`Pass Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`))

  if (failed === 0) {
    console.log(chalk.bold.green('✅ ALL VALID GENERATION TESTS PASSED!'))
    console.log(chalk.green('Legitimate use cases work correctly.\n'))
  } else {
    console.log(chalk.bold.red('❌ SOME TESTS FAILED!'))
    console.log(chalk.red('Security fixes may have broken legitimate functionality.\n'))
  }

  process.exit(failed > 0 ? 1 : 0)
}

testValidGeneration().catch(error => {
  console.error(chalk.red('\n❌ Test suite failed:'))
  console.error(error)
  process.exit(1)
})
