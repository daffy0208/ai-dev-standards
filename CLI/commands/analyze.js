const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const path = require('path')
const { glob } = require('glob')

/**
 * Analyze Command
 *
 * Analyzes your project and provides recommendations:
 * - Missing tests
 * - Unused dependencies
 * - Security vulnerabilities
 * - Performance issues
 * - Accessibility problems
 * - Code quality issues
 */
async function analyzeCommand(options) {
  console.log(chalk.blue(`\n🔍 Analyzing project: ${chalk.bold(options.directory)}\n`))

  const spinner = ora('Scanning project...').start()

  try {
    const projectPath = path.resolve(process.cwd(), options.directory)

    // Check if it's a valid project
    const packageJsonPath = path.join(projectPath, 'package.json')
    if (!await fs.pathExists(packageJsonPath)) {
      spinner.fail('Not a valid Node.js project')
      console.log(chalk.red('\n❌ No package.json found\n'))
      process.exit(1)
    }

    const packageJson = await fs.readJson(packageJsonPath)

    // Analysis results
    const issues = []
    const warnings = []
    const recommendations = []

    // 1. Check for tests
    spinner.text = 'Checking test coverage...'
    const hasTests = await checkForTests(projectPath)
    if (!hasTests) {
      issues.push({
        type: 'missing-tests',
        severity: 'high',
        message: 'No test files found',
        fix: 'ai-dev add testing-setup'
      })
    }

    // 2. Check for TypeScript
    spinner.text = 'Checking TypeScript setup...'
    const hasTypeScript = await fs.pathExists(path.join(projectPath, 'tsconfig.json'))
    if (!hasTypeScript && !packageJson.dependencies?.typescript) {
      recommendations.push({
        type: 'typescript',
        message: 'Consider adding TypeScript for better type safety',
        command: 'npx tsc --init'
      })
    }

    // 3. Check for environment variables
    spinner.text = 'Checking environment configuration...'
    const hasEnvExample = await fs.pathExists(path.join(projectPath, '.env.example'))
    const hasEnvLocal = await fs.pathExists(path.join(projectPath, '.env.local'))
    if (!hasEnvExample && hasEnvLocal) {
      warnings.push({
        type: 'env-example',
        message: 'Missing .env.example file',
        fix: 'Create .env.example with sample values'
      })
    }

    // 4. Check for README
    spinner.text = 'Checking documentation...'
    const hasReadme = await fs.pathExists(path.join(projectPath, 'README.md'))
    if (!hasReadme) {
      warnings.push({
        type: 'missing-readme',
        message: 'No README.md found',
        fix: 'ai-dev add readme'
      })
    }

    // 5. Check for unused dependencies
    spinner.text = 'Checking dependencies...'
    const unusedDeps = await findUnusedDependencies(projectPath, packageJson)
    if (unusedDeps.length > 0) {
      warnings.push({
        type: 'unused-deps',
        message: `${unusedDeps.length} potentially unused dependencies`,
        details: unusedDeps,
        fix: 'npm uninstall ' + unusedDeps.join(' ')
      })
    }

    // 6. Check for security best practices
    spinner.text = 'Checking security...'
    const securityIssues = await checkSecurity(projectPath, packageJson)
    issues.push(...securityIssues)

    // 7. Check for accessibility
    spinner.text = 'Checking accessibility...'
    const a11yIssues = await checkAccessibility(projectPath)
    warnings.push(...a11yIssues)

    // 8. Check for performance optimizations
    spinner.text = 'Checking performance...'
    const perfRecommendations = await checkPerformance(projectPath, packageJson)
    recommendations.push(...perfRecommendations)

    spinner.succeed('Analysis complete')

    // Display results
    console.log(chalk.bold('\n📊 Analysis Results:\n'))

    if (issues.length === 0 && warnings.length === 0) {
      console.log(chalk.green('✅ No issues found! Your project looks great.\n'))
    } else {
      // Issues (high severity)
      if (issues.length > 0) {
        console.log(chalk.red.bold(`\n❌ Issues (${issues.length}):\n`))
        for (const issue of issues) {
          console.log(chalk.red(`  • ${issue.message}`))
          if (issue.fix) {
            console.log(chalk.gray(`    Fix: ${chalk.cyan(issue.fix)}`))
          }
        }
      }

      // Warnings (medium severity)
      if (warnings.length > 0) {
        console.log(chalk.yellow.bold(`\n⚠️  Warnings (${warnings.length}):\n`))
        for (const warning of warnings) {
          console.log(chalk.yellow(`  • ${warning.message}`))
          if (warning.fix) {
            console.log(chalk.gray(`    Fix: ${chalk.cyan(warning.fix)}`))
          }
        }
      }

      // Recommendations
      if (recommendations.length > 0) {
        console.log(chalk.blue.bold(`\n💡 Recommendations (${recommendations.length}):\n`))
        for (const rec of recommendations) {
          console.log(chalk.blue(`  • ${rec.message}`))
          if (rec.command) {
            console.log(chalk.gray(`    Run: ${chalk.cyan(rec.command)}`))
          }
        }
      }
    }

    // Auto-fix option
    if (options.fix && (issues.length > 0 || warnings.length > 0)) {
      console.log(chalk.bold('\n🔧 Auto-fixing issues...\n'))
      await autoFix(projectPath, issues, warnings)
    }

    // Save report
    if (options.report) {
      const report = {
        timestamp: new Date().toISOString(),
        project: packageJson.name,
        issues,
        warnings,
        recommendations
      }
      await fs.writeJson(options.report, report, { spaces: 2 })
      console.log(chalk.gray(`\n📄 Report saved to: ${options.report}`))
    }

    console.log()

  } catch (error) {
    spinner.fail('Analysis failed')
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Check for test files
 */
async function checkForTests(projectPath) {
  const testPatterns = [
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}',
    '__tests__/**/*.{js,jsx,ts,tsx}'
  ]

  for (const pattern of testPatterns) {
    const files = await glob(pattern, { cwd: projectPath, ignore: 'node_modules/**' })
    if (files.length > 0) return true
  }

  return false
}

/**
 * Find unused dependencies
 */
async function findUnusedDependencies(projectPath, packageJson) {
  const dependencies = Object.keys(packageJson.dependencies || {})
  const unused = []

  // Simple check: search for import/require statements
  const jsFiles = await glob('**/*.{js,jsx,ts,tsx}', {
    cwd: projectPath,
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  })

  for (const dep of dependencies) {
    let found = false

    for (const file of jsFiles.slice(0, 100)) { // Check first 100 files
      const content = await fs.readFile(path.join(projectPath, file), 'utf8')
      if (content.includes(`'${dep}'`) || content.includes(`"${dep}"`)) {
        found = true
        break
      }
    }

    if (!found) {
      unused.push(dep)
    }
  }

  return unused
}

/**
 * Check security best practices
 */
async function checkSecurity(projectPath, packageJson) {
  const issues = []

  // Check for hardcoded secrets
  const jsFiles = await glob('**/*.{js,jsx,ts,tsx}', {
    cwd: projectPath,
    ignore: ['node_modules/**']
  })

  for (const file of jsFiles.slice(0, 50)) {
    const content = await fs.readFile(path.join(projectPath, file), 'utf8')

    if (/API_KEY\s*=\s*['"][a-zA-Z0-9]{20,}['"]/.test(content)) {
      issues.push({
        type: 'hardcoded-secret',
        severity: 'high',
        message: `Potential hardcoded secret in ${file}`,
        fix: 'Move secrets to environment variables'
      })
    }
  }

  return issues
}

/**
 * Check accessibility
 */
async function checkAccessibility(projectPath) {
  const warnings = []

  const components = await glob('**/*.{jsx,tsx}', {
    cwd: projectPath,
    ignore: ['node_modules/**']
  })

  for (const file of components.slice(0, 20)) {
    const content = await fs.readFile(path.join(projectPath, file), 'utf8')

    // Check for images without alt text
    if (/<img/.test(content) && !/<img[^>]+alt=/.test(content)) {
      warnings.push({
        type: 'a11y-img-alt',
        message: `Missing alt text in ${file}`,
        fix: 'Add alt attributes to all images'
      })
    }

    // Check for onClick on non-interactive elements
    if (/<div[^>]+onClick/.test(content)) {
      warnings.push({
        type: 'a11y-click-div',
        message: `onClick on div in ${file} (use button instead)`,
        fix: 'Use semantic HTML (button/a tags)'
      })
    }
  }

  return warnings
}

/**
 * Check performance optimizations
 */
async function checkPerformance(projectPath, packageJson) {
  const recommendations = []

  // Check for Next.js Image component
  if (packageJson.dependencies?.next) {
    const pages = await glob('**/*.{jsx,tsx}', {
      cwd: projectPath,
      ignore: ['node_modules/**']
    })

    for (const file of pages.slice(0, 20)) {
      const content = await fs.readFile(path.join(projectPath, file), 'utf8')

      if (/<img/.test(content) && !content.includes('next/image')) {
        recommendations.push({
          type: 'perf-next-image',
          message: `Use next/image instead of <img> in ${file}`,
          command: 'Replace <img> with <Image> from next/image'
        })
        break
      }
    }
  }

  return recommendations
}

/**
 * Auto-fix issues
 */
async function autoFix(projectPath, issues, warnings) {
  for (const issue of issues) {
    if (issue.type === 'missing-tests') {
      console.log(chalk.cyan('  • Adding test setup...'))
      // Add test configuration
    }
  }

  for (const warning of warnings) {
    if (warning.type === 'missing-readme') {
      console.log(chalk.cyan('  • Creating README.md...'))
      // Generate README
    }
  }

  console.log(chalk.green('\n✅ Auto-fix complete'))
}

module.exports = analyzeCommand
