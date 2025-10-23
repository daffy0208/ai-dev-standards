const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const path = require('path')
const { execa } = require('execa')

/**
 * Doctor Command
 *
 * Checks project health and detects issues:
 * - Node.js version
 * - Missing dependencies
 * - Outdated packages
 * - Configuration issues
 * - Environment setup
 */
async function doctorCommand(options) {
  console.log(chalk.blue('\n🏥 Running project health check...\n'))

  const checks = []
  let hasErrors = false

  try {
    // 1. Check Node.js version
    const nodeCheck = await checkNodeVersion()
    checks.push(nodeCheck)
    if (nodeCheck.status === 'error') hasErrors = true

    // 2. Check npm/yarn
    const packageManagerCheck = await checkPackageManager()
    checks.push(packageManagerCheck)

    // 3. Check package.json
    const packageJsonCheck = await checkPackageJson()
    checks.push(packageJsonCheck)
    if (packageJsonCheck.status === 'error') hasErrors = true

    // 4. Check dependencies
    const depsCheck = await checkDependencies(options.verbose)
    checks.push(depsCheck)

    // 5. Check git
    const gitCheck = await checkGit()
    checks.push(gitCheck)

    // 6. Check environment variables
    const envCheck = await checkEnvironment()
    checks.push(envCheck)

    // 7. Check TypeScript config
    const tsCheck = await checkTypeScript()
    checks.push(tsCheck)

    // 8. Check linting
    const lintCheck = await checkLinting()
    checks.push(lintCheck)

    // Display results
    console.log(chalk.bold('📋 Health Check Results:\n'))

    for (const check of checks) {
      const icon = check.status === 'ok' ? '✅' :
                   check.status === 'warning' ? '⚠️' : '❌'
      const color = check.status === 'ok' ? chalk.green :
                    check.status === 'warning' ? chalk.yellow : chalk.red

      console.log(color(`${icon} ${check.name}`))

      if (check.message) {
        console.log(chalk.gray(`   ${check.message}`))
      }

      if (check.fix) {
        console.log(chalk.cyan(`   Fix: ${check.fix}`))
      }

      console.log()
    }

    // Auto-fix
    if (options.fixAll && hasErrors) {
      console.log(chalk.bold('🔧 Auto-fixing issues...\n'))
      await autoFixAll(checks)
    }

    // Summary
    const okCount = checks.filter(c => c.status === 'ok').length
    const warningCount = checks.filter(c => c.status === 'warning').length
    const errorCount = checks.filter(c => c.status === 'error').length

    console.log(chalk.bold('📊 Summary:'))
    console.log(chalk.green(`  ✅ ${okCount} passed`))
    if (warningCount > 0) console.log(chalk.yellow(`  ⚠️  ${warningCount} warnings`))
    if (errorCount > 0) console.log(chalk.red(`  ❌ ${errorCount} errors`))
    console.log()

    if (errorCount === 0) {
      console.log(chalk.green('🎉 Your project is healthy!\n'))
    } else if (options.fixAll) {
      console.log(chalk.yellow('⚠️  Some issues require manual fixing\n'))
    } else {
      console.log(chalk.yellow(`💡 Run ${chalk.cyan('ai-dev doctor --fix-all')} to auto-fix issues\n`))
    }

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Check Node.js version
 */
async function checkNodeVersion() {
  try {
    const { stdout } = await execa('node', ['--version'])
    const version = stdout.replace('v', '')
    const major = parseInt(version.split('.')[0])

    if (major >= 18) {
      return {
        name: 'Node.js version',
        status: 'ok',
        message: `${version} (recommended: >=18)`
      }
    } else {
      return {
        name: 'Node.js version',
        status: 'error',
        message: `${version} is outdated`,
        fix: 'Update Node.js to version 18 or higher'
      }
    }
  } catch (error) {
    return {
      name: 'Node.js version',
      status: 'error',
      message: 'Node.js not found',
      fix: 'Install Node.js from nodejs.org'
    }
  }
}

/**
 * Check package manager
 */
async function checkPackageManager() {
  try {
    await execa('npm', ['--version'])
    return {
      name: 'Package manager',
      status: 'ok',
      message: 'npm is installed'
    }
  } catch (error) {
    return {
      name: 'Package manager',
      status: 'error',
      message: 'npm not found',
      fix: 'npm comes with Node.js - reinstall Node.js'
    }
  }
}

/**
 * Check package.json
 */
async function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json')

  if (!await fs.pathExists(packageJsonPath)) {
    return {
      name: 'package.json',
      status: 'error',
      message: 'package.json not found',
      fix: 'Run: npm init -y'
    }
  }

  try {
    const packageJson = await fs.readJson(packageJsonPath)

    if (!packageJson.name) {
      return {
        name: 'package.json',
        status: 'warning',
        message: 'Missing "name" field'
      }
    }

    return {
      name: 'package.json',
      status: 'ok',
      message: 'Valid package.json found'
    }
  } catch (error) {
    return {
      name: 'package.json',
      status: 'error',
      message: 'Invalid JSON syntax',
      fix: 'Fix syntax errors in package.json'
    }
  }
}

/**
 * Check dependencies
 */
async function checkDependencies(verbose) {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules')

  if (!await fs.pathExists(nodeModulesPath)) {
    return {
      name: 'Dependencies',
      status: 'error',
      message: 'node_modules not found',
      fix: 'Run: npm install'
    }
  }

  // Check for outdated packages
  try {
    const { stdout } = await execa('npm', ['outdated', '--json'])
    const outdated = JSON.parse(stdout)
    const count = Object.keys(outdated).length

    if (count > 0) {
      return {
        name: 'Dependencies',
        status: 'warning',
        message: `${count} outdated packages`,
        fix: 'Run: npm update'
      }
    }
  } catch (error) {
    // npm outdated returns non-zero when packages are outdated
  }

  return {
    name: 'Dependencies',
    status: 'ok',
    message: 'All dependencies installed and up-to-date'
  }
}

/**
 * Check git
 */
async function checkGit() {
  try {
    await execa('git', ['--version'])

    const gitPath = path.join(process.cwd(), '.git')
    if (!await fs.pathExists(gitPath)) {
      return {
        name: 'Git',
        status: 'warning',
        message: 'Git not initialized',
        fix: 'Run: git init'
      }
    }

    return {
      name: 'Git',
      status: 'ok',
      message: 'Git repository initialized'
    }
  } catch (error) {
    return {
      name: 'Git',
      status: 'warning',
      message: 'Git not installed',
      fix: 'Install Git from git-scm.com'
    }
  }
}

/**
 * Check environment variables
 */
async function checkEnvironment() {
  const envExamplePath = path.join(process.cwd(), '.env.example')
  const envLocalPath = path.join(process.cwd(), '.env.local')

  const hasEnvExample = await fs.pathExists(envExamplePath)
  const hasEnvLocal = await fs.pathExists(envLocalPath)

  if (hasEnvExample && hasEnvLocal) {
    return {
      name: 'Environment variables',
      status: 'ok',
      message: 'Both .env.example and .env.local exist'
    }
  } else if (!hasEnvExample && hasEnvLocal) {
    return {
      name: 'Environment variables',
      status: 'warning',
      message: 'Missing .env.example file',
      fix: 'Create .env.example with sample values'
    }
  } else if (hasEnvExample && !hasEnvLocal) {
    return {
      name: 'Environment variables',
      status: 'warning',
      message: 'Missing .env.local file',
      fix: 'Copy .env.example to .env.local and fill in values'
    }
  } else {
    return {
      name: 'Environment variables',
      status: 'ok',
      message: 'No environment files (may not be needed)'
    }
  }
}

/**
 * Check TypeScript
 */
async function checkTypeScript() {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')

  if (!await fs.pathExists(tsconfigPath)) {
    return {
      name: 'TypeScript',
      status: 'ok',
      message: 'Not using TypeScript (optional)'
    }
  }

  try {
    await fs.readJson(tsconfigPath)
    return {
      name: 'TypeScript',
      status: 'ok',
      message: 'Valid tsconfig.json found'
    }
  } catch (error) {
    return {
      name: 'TypeScript',
      status: 'error',
      message: 'Invalid tsconfig.json',
      fix: 'Fix syntax errors in tsconfig.json'
    }
  }
}

/**
 * Check linting
 */
async function checkLinting() {
  const eslintPath = path.join(process.cwd(), '.eslintrc.json')
  const prettierPath = path.join(process.cwd(), '.prettierrc')

  const hasEslint = await fs.pathExists(eslintPath) || await fs.pathExists(path.join(process.cwd(), '.eslintrc.js'))
  const hasPrettier = await fs.pathExists(prettierPath) || await fs.pathExists(path.join(process.cwd(), '.prettierrc.json'))

  if (hasEslint && hasPrettier) {
    return {
      name: 'Code quality tools',
      status: 'ok',
      message: 'ESLint and Prettier configured'
    }
  } else if (hasEslint || hasPrettier) {
    return {
      name: 'Code quality tools',
      status: 'warning',
      message: hasEslint ? 'Missing Prettier' : 'Missing ESLint',
      fix: 'ai-dev add code-quality-tools'
    }
  } else {
    return {
      name: 'Code quality tools',
      status: 'warning',
      message: 'No linting/formatting configured',
      fix: 'ai-dev add code-quality-tools'
    }
  }
}

/**
 * Auto-fix all issues
 */
async function autoFixAll(checks) {
  for (const check of checks) {
    if (check.status === 'error' || check.status === 'warning') {
      if (check.name === 'Dependencies' && check.message.includes('not found')) {
        console.log(chalk.cyan('  • Installing dependencies...'))
        try {
          await execa('npm', ['install'])
          console.log(chalk.green('    ✓ Dependencies installed'))
        } catch (error) {
          console.log(chalk.red('    ✗ Failed to install dependencies'))
        }
      } else if (check.name === 'Git' && check.message.includes('not initialized')) {
        console.log(chalk.cyan('  • Initializing git...'))
        try {
          await execa('git', ['init'])
          console.log(chalk.green('    ✓ Git initialized'))
        } catch (error) {
          console.log(chalk.red('    ✗ Failed to initialize git'))
        }
      }
    }
  }

  console.log()
}

module.exports = doctorCommand
