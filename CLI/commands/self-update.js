const chalk = require('chalk')
const ora = require('ora')
const execa = require('execa')
const fs = require('fs-extra')
const path = require('path')

/**
 * Self Update Command
 *
 * Update ai-dev-standards to the latest version from Git
 * Pulls latest changes and re-installs CLI
 */
async function selfUpdateCommand(options) {
  console.log(chalk.blue('\n🔄 Updating ai-dev-standards...\n'))

  try {
    // Get ai-dev-standards root directory from config
    const config = await loadProjectConfig()
    const aiDevRoot = config.aiDevStandardsRoot || process.env.AI_DEV_STANDARDS_ROOT || path.join(require('os').homedir(), 'ai-dev-standards')

    if (!await fs.pathExists(aiDevRoot)) {
      console.log(chalk.red('❌ ai-dev-standards directory not found'))
      console.log(chalk.gray(`   Expected location: ${aiDevRoot}`))
      console.log(chalk.yellow('\n💡 Run setup-project.sh to install ai-dev-standards'))
      return
    }

    // Check for uncommitted changes
    const spinner = ora('Checking for local changes...').start()
    
    try {
      const { stdout } = await execa('git', ['status', '--porcelain'], { cwd: aiDevRoot })
      if (stdout.trim().length > 0 && !options.force) {
        spinner.fail('Local changes detected')
        console.log(chalk.yellow('\n⚠️  You have uncommitted changes in ai-dev-standards'))
        console.log(chalk.gray('   Commit or stash your changes before updating'))
        console.log(chalk.cyan(`\n💡 Use ${chalk.bold('--force')} to update anyway (stashes changes)\n`))
        return
      }
      spinner.succeed('No local changes')
    } catch (error) {
      spinner.fail('Failed to check status')
      return
    }

    // Stash if forced
    if (options.force) {
      const stashSpinner = ora('Stashing local changes...').start()
      try {
        await execa('git', ['stash'], { cwd: aiDevRoot })
        stashSpinner.succeed('Local changes stashed')
      } catch (error) {
        stashSpinner.warn('No changes to stash')
      }
    }

    // Get current version
    const beforeVersion = await getLocalVersion(aiDevRoot)
    console.log(chalk.gray(`\n  Current: ${beforeVersion.version} (${beforeVersion.commit})`))

    // Pull latest
    const pullSpinner = ora('Pulling latest changes...').start()
    
    try {
      const { stdout } = await execa('git', ['pull', 'origin', 'main'], { cwd: aiDevRoot })
      
      if (stdout.includes('Already up to date')) {
        pullSpinner.succeed('Already up to date')
        console.log(chalk.green('\n✅ No updates available\n'))
        return
      }
      
      pullSpinner.succeed('Pulled latest changes')
    } catch (error) {
      pullSpinner.fail('Failed to pull changes')
      console.log(chalk.red(`   ${error.message}`))
      return
    }

    // Get new version
    const afterVersion = await getLocalVersion(aiDevRoot)
    console.log(chalk.gray(`  Updated:  ${afterVersion.version} (${afterVersion.commit})\n`))

    // Re-install CLI
    const installSpinner = ora('Re-installing CLI...').start()
    
    try {
      const cliPath = path.join(aiDevRoot, 'CLI')
      await execa('npm', ['install'], { cwd: cliPath })
      installSpinner.succeed('CLI re-installed')
    } catch (error) {
      installSpinner.fail('Failed to re-install CLI')
      console.log(chalk.yellow('   You may need to run: cd ~/ai-dev-standards/CLI && npm install'))
    }

    // Install hooks if they exist
    const hooksPath = path.join(aiDevRoot, '.claude/hooks')
    if (await fs.pathExists(hooksPath)) {
      const hooksSpinner = ora('Updating hooks...').start()
      
      try {
        const hookPackageJson = path.join(hooksPath, 'package.json')
        if (await fs.pathExists(hookPackageJson)) {
          await execa('npm', ['install'], { cwd: hooksPath })
          hooksSpinner.succeed('Hooks updated')
        } else {
          hooksSpinner.succeed('No hooks to update')
        }
      } catch (error) {
        hooksSpinner.warn('Failed to update hooks')
      }
    }

    // Show what changed
    console.log(chalk.bold('\n📝 What\'s new:\n'))
    const changes = await getChangesSince(aiDevRoot, beforeVersion.commit)
    changes.forEach(change => {
      console.log(chalk.gray(`  • ${change}`))
    })

    console.log(chalk.green('\n✅ Update complete!\n'))

    // Run health check to analyze repository
    console.log(chalk.blue('🏥 Running health check on your repository...\n'))
    
    try {
      // Import and run doctor command
      const doctorCommand = require('./doctor')
      await doctorCommand({ verbose: false })
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  Health check failed, you can run it manually with: ai-dev doctor\n'))
    }

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Get local version
 */
async function getLocalVersion(aiDevRoot) {
  const packageJsonPath = path.join(aiDevRoot, 'package.json')
  const packageJson = await fs.readJson(packageJsonPath)
  
  const { stdout: commit } = await execa('git', ['rev-parse', '--short', 'HEAD'], { cwd: aiDevRoot })
  
  return {
    version: packageJson.version,
    commit: commit.trim()
  }
}

/**
 * Get changes since commit
 */
async function getChangesSince(aiDevRoot, since) {
  try {
    const { stdout } = await execa('git', [
      'log',
      '--oneline',
      '--no-decorate',
      `-n5`,
      `${since}..HEAD`
    ], { cwd: aiDevRoot })
    
    const lines = stdout.split('\n').filter(line => line.trim().length > 0)
    return lines.length > 0 ? lines : ['No recent changes']
  } catch (error) {
    return ['Unable to fetch changes']
  }
}

/**
 * Load project config
 */
async function loadProjectConfig() {
  const configPath = path.join(process.cwd(), '.ai-dev.json')
  
  if (!await fs.pathExists(configPath)) {
    return {}
  }
  
  return await fs.readJson(configPath)
}

module.exports = selfUpdateCommand
