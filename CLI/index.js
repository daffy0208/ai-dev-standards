#!/usr/bin/env node

/**
 * AI Dev Standards CLI
 *
 * Automatically generate production-ready code:
 * - React components with tests + Storybook
 * - MCP servers with full implementations
 * - API integrations with type safety
 * - Complete project starters
 * - Smart analysis and recommendations
 *
 * ADHD-friendly: One command does everything!
 */

const { Command } = require('commander')
const chalk = require('chalk')
const packageJson = require('./package.json')

// Commands
const addCommand = require('./commands/add')
const initCommand = require('./commands/init')
const generateCommand = require('./commands/generate')
const analyzeCommand = require('./commands/analyze')
const doctorCommand = require('./commands/doctor')
const setupCommand = require('./commands/setup')
const syncCommand = require('./commands/sync')
const updateCommand = require('./commands/update')

const program = new Command()

// ASCII Art Banner
const banner = chalk.cyan(`
╔═══════════════════════════════════════╗
║                                       ║
║        ${chalk.bold('AI Dev Standards CLI')}         ║
║                                       ║
║   ${chalk.gray('Auto-Generate Production Code')}   ║
║                                       ║
╚═══════════════════════════════════════╝
`)

// Only show banner if not running in silent mode
if (!process.argv.includes('--silent')) {
  console.log(banner)
}

program
  .name('ai-dev')
  .description('AI-powered development standards CLI - Generate production-ready code automatically')
  .version(packageJson.version)

// ===========================
// ADD COMMAND
// ===========================
program
  .command('add <type> <name>')
  .description('Add a new component, MCP server, integration, or tool')
  .option('-t, --with-tests', 'Generate tests')
  .option('-s, --with-storybook', 'Generate Storybook stories')
  .option('-f, --framework <framework>', 'Framework to use (langchain, crewai, etc.)')
  .option('-p, --props <props>', 'Component props (comma-separated)')
  .option('--template <template>', 'Use specific template')
  .action(addCommand)

// ===========================
// INIT COMMAND
// ===========================
program
  .command('init <project-type> [name]')
  .description('Initialize a complete project from scratch')
  .option('--auth <provider>', 'Auth provider (supabase, clerk, auth0)')
  .option('--payments <provider>', 'Payment provider (stripe, paddle)')
  .option('--email <provider>', 'Email provider (resend, postmark)')
  .option('--analytics <provider>', 'Analytics provider (posthog, mixpanel)')
  .option('--vector-db <db>', 'Vector database (pinecone, weaviate, qdrant)')
  .option('--skip-install', 'Skip npm install')
  .option('--skip-git', 'Skip git initialization')
  .action(initCommand)

// ===========================
// GENERATE COMMAND
// ===========================
program
  .command('generate')
  .description('Generate from YAML config file')
  .option('-c, --config <file>', 'Config file path', 'ai-dev.config.yaml')
  .option('-o, --output <dir>', 'Output directory', '.')
  .option('--dry-run', 'Preview without creating files')
  .action(generateCommand)

// ===========================
// ANALYZE COMMAND
// ===========================
program
  .command('analyze')
  .description('Analyze your project and suggest improvements')
  .option('-d, --directory <dir>', 'Directory to analyze', '.')
  .option('--fix', 'Auto-fix issues')
  .option('--report <file>', 'Save report to file')
  .action(analyzeCommand)

// ===========================
// DOCTOR COMMAND
// ===========================
program
  .command('doctor')
  .description('Check project health and detect missing dependencies')
  .option('--fix-all', 'Auto-install all missing dependencies')
  .option('--verbose', 'Show detailed information')
  .action(doctorCommand)

// ===========================
// SETUP COMMAND
// ===========================
program
  .command('setup <integration>')
  .description('Setup an integration (supabase, stripe, etc.)')
  .option('--with-auth', 'Include authentication setup')
  .option('--with-rag', 'Include RAG pipeline setup')
  .option('--env <file>', 'Environment file path', '.env.local')
  .action(setupCommand)

// ===========================
// SYNC COMMAND
// ===========================
program
  .command('sync')
  .description('Auto-sync project with latest ai-dev-standards')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--silent', 'Suppress output')
  .action(syncCommand)

// ===========================
// UPDATE COMMAND
// ===========================
program
  .command('update <target>')
  .description('Update specific parts (skills, mcps, cursorrules, gitignore, tools, all)')
  .option('--all', 'Update all items of this type')
  .action(updateCommand)

// ===========================
// HELP EXAMPLES
// ===========================
program.addHelpText('after', `

${chalk.bold('Examples:')}

  ${chalk.cyan('# Add components')}
  $ ai-dev add component Button --with-tests --with-storybook
  $ ai-dev add component Card --props "title,description,image,onClick"

  ${chalk.cyan('# Add MCP servers')}
  $ ai-dev add mcp-server accessibility-checker
  $ ai-dev add mcp-server component-generator

  ${chalk.cyan('# Add integrations')}
  $ ai-dev add integration supabase --with-auth
  $ ai-dev add integration stripe --with-webhooks

  ${chalk.cyan('# Add tools')}
  $ ai-dev add tool web-search --framework langchain
  $ ai-dev add tool database-query --framework crewai

  ${chalk.cyan('# Initialize complete projects')}
  $ ai-dev init saas-starter my-app --auth supabase --payments stripe
  $ ai-dev init rag-system docs-qa --vector-db pinecone

  ${chalk.cyan('# Generate from config')}
  $ ai-dev generate --config components.yaml
  $ ai-dev generate --dry-run

  ${chalk.cyan('# Analyze and fix')}
  $ ai-dev analyze
  $ ai-dev doctor --fix-all
  $ ai-dev analyze --fix

  ${chalk.cyan('# Setup integrations')}
  $ ai-dev setup supabase --with-auth
  $ ai-dev setup pinecone --with-rag

  ${chalk.cyan('# Auto-sync with latest standards')}
  $ ai-dev sync
  $ ai-dev update skills
  $ ai-dev update all

${chalk.bold('Documentation:')}
  https://github.com/ai-dev-standards/cli

${chalk.bold('ADHD-Friendly:')}
  ${chalk.green('✓')} One command does everything
  ${chalk.green('✓')} No manual configuration
  ${chalk.green('✓')} Auto-detects what you need
  ${chalk.green('✓')} Instant working code
`)

// Parse arguments
program.parse(process.argv)

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
