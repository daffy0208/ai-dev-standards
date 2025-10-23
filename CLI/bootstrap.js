#!/usr/bin/env node

/**
 * AI Dev Standards Bootstrap
 *
 * Automatically installs and initializes ai-dev CLI for any project.
 *
 * Usage:
 *   npx @ai-dev-standards/bootstrap
 *   curl -fsSL https://ai-dev-standards.com/bootstrap.sh | bash
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const chalk = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
}

console.log(chalk.blue('\n🚀 AI Dev Standards Bootstrap\n'))

async function main() {
  try {
    // 1. Check if ai-dev is already installed
    const hasAiDev = checkAiDevInstalled()

    if (!hasAiDev) {
      console.log(chalk.yellow('📦 ai-dev CLI not found. Installing...\n'))
      await installAiDev()
      console.log(chalk.green('✅ ai-dev CLI installed!\n'))
    } else {
      console.log(chalk.green('✅ ai-dev CLI already installed\n'))
    }

    // 2. Check if current directory is a project
    const isProject = fs.existsSync('package.json') || fs.existsSync('.git')

    if (!isProject) {
      console.log(chalk.yellow('⚠️  Not a project directory (no package.json or .git)'))
      console.log(chalk.gray('Run this in your project directory to auto-sync.\n'))
      return
    }

    // 3. Check if project is already initialized
    const isInitialized = fs.existsSync('.ai-dev.json')

    if (isInitialized) {
      console.log(chalk.green('✅ Project already initialized for auto-sync\n'))

      // Run sync to check for updates
      console.log(chalk.blue('🔄 Checking for updates...\n'))
      execSync('ai-dev sync --yes', { stdio: 'inherit' })

    } else {
      console.log(chalk.yellow('📋 Project not initialized. Setting up auto-sync...\n'))

      // Initialize with defaults
      await initializeProject()

      console.log(chalk.green('\n✅ Auto-sync enabled!\n'))
    }

    // 4. Show next steps
    showNextSteps()

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Check if ai-dev is installed
 */
function checkAiDevInstalled() {
  try {
    execSync('ai-dev --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/**
 * Install ai-dev CLI
 */
async function installAiDev() {
  try {
    // Try global install
    console.log(chalk.gray('  Installing globally...'))
    execSync('npm install -g @ai-dev-standards/cli', { stdio: 'inherit' })
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Global install failed. Trying local install...\n'))

    // Fallback to local install
    execSync('npm install --save-dev @ai-dev-standards/cli', { stdio: 'inherit' })

    // Add to package.json scripts
    addNpmScripts()
  }
}

/**
 * Initialize project for auto-sync
 */
async function initializeProject() {
  // Create .ai-dev.json with defaults
  const config = {
    version: '1.0.0',
    lastSync: new Date().toISOString(),
    tracking: [
      'skills',           // AI development skills
      'mcps',             // MCP server configurations
      'components',       // Reusable code components
      'integrations',     // Third-party integrations
      'standards',        // Architecture patterns & best practices
      'utils',            // Utility functions and scripts
      'tools',            // Development tools
      'examples',         // Example implementations
      'cursorrules',      // Cursor IDE rules
      'gitignore'         // Git ignore patterns
    ],
    frequency: 'git-hook',
    installed: {
      skills: [],
      mcps: [],
      components: [],
      integrations: [],
      standards: [],
      utils: [],
      tools: [],
      examples: []
    },
    preferences: {
      autoApprove: false,
      notifications: true,
      backupBeforeSync: true
    }
  }

  fs.writeFileSync('.ai-dev.json', JSON.stringify(config, null, 2))
  console.log(chalk.gray('  Created: .ai-dev.json'))

  // Setup git hook
  setupGitHook()

  // Add to .gitignore
  addToGitignore('.ai-dev.json')
  addToGitignore('.ai-dev-cache/')

  // Run initial sync
  console.log(chalk.blue('\n🔄 Running initial sync...\n'))
  execSync('ai-dev sync --yes', { stdio: 'inherit' })
}

/**
 * Setup git hook for auto-sync
 */
function setupGitHook() {
  const gitDir = path.join(process.cwd(), '.git')

  if (!fs.existsSync(gitDir)) {
    console.log(chalk.yellow('  No .git directory found. Skipping git hook setup.'))
    return
  }

  const hooksDir = path.join(gitDir, 'hooks')
  fs.mkdirSync(hooksDir, { recursive: true })

  const hookPath = path.join(hooksDir, 'post-merge')

  const hookContent = `#!/bin/sh
# AI Dev Standards auto-sync
# Runs after 'git pull'

echo "🔄 Auto-syncing with ai-dev-standards..."
ai-dev sync --yes --silent || echo "⚠️  Auto-sync failed. Run 'ai-dev sync' manually."
`

  fs.writeFileSync(hookPath, hookContent, { mode: 0o755 })
  console.log(chalk.gray('  Created: .git/hooks/post-merge'))
}

/**
 * Add to .gitignore
 */
function addToGitignore(pattern) {
  const gitignorePath = path.join(process.cwd(), '.gitignore')

  let content = ''
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf8')
  }

  if (!content.includes(pattern)) {
    content += `\n${pattern}`
    fs.writeFileSync(gitignorePath, content)
    console.log(chalk.gray(`  Added to .gitignore: ${pattern}`))
  }
}

/**
 * Add npm scripts
 */
function addNpmScripts() {
  const packageJsonPath = path.join(process.cwd(), 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }

  // Add ai-dev scripts
  if (!packageJson.scripts['ai-dev']) {
    packageJson.scripts['ai-dev'] = 'ai-dev'
    packageJson.scripts['sync'] = 'ai-dev sync'
    packageJson.scripts['postinstall'] = packageJson.scripts['postinstall']
      ? `${packageJson.scripts['postinstall']} && ai-dev sync --yes --silent`
      : 'ai-dev sync --yes --silent'

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log(chalk.gray('  Added scripts to package.json'))
  }
}

/**
 * Show next steps
 */
function showNextSteps() {
  console.log(chalk.blue('📚 What happens now:\n'))
  console.log(chalk.gray('  • Auto-sync runs after every git pull'))
  console.log(chalk.gray('  • Skills, MCPs, and configs stay up-to-date'))
  console.log(chalk.gray('  • Run manually: ai-dev sync'))
  console.log(chalk.gray('  • Update specific: ai-dev update skills\n'))

  console.log(chalk.green('✨ Your project is now auto-synced with ai-dev-standards!\n'))
}

// Run
main()
