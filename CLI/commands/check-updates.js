const chalk = require('chalk')
const ora = require('ora')
const execa = require('execa')
const fs = require('fs-extra')
const path = require('path')

/**
 * Check Updates Command
 *
 * Check if ai-dev-standards has updates available
 * Compares local version with remote Git repository
 */
async function checkUpdatesCommand(options) {
  console.log(chalk.blue('\n🔍 Checking for updates...\n'))

  try {
    // Get ai-dev-standards root directory from config
    const config = await loadProjectConfig()
    const aiDevRoot =
      config.aiDevStandardsRoot ||
      process.env.AI_DEV_STANDARDS_ROOT ||
      path.join(require('os').homedir(), 'ai-dev-standards')

    if (!(await fs.pathExists(aiDevRoot))) {
      console.log(chalk.red('❌ ai-dev-standards directory not found'))
      console.log(chalk.gray(`   Expected location: ${aiDevRoot}`))
      console.log(chalk.yellow('\n💡 Run setup-project.sh to install ai-dev-standards'))
      return
    }

    const spinner = ora('Fetching remote updates...').start()

    // Fetch latest from remote
    try {
      await execa('git', ['fetch', 'origin'], { cwd: aiDevRoot })
      spinner.succeed('Fetched latest from remote')
    } catch (error) {
      spinner.fail('Failed to fetch from remote')
      console.log(chalk.red(`   ${error.message}`))
      return
    }

    // Get local version
    const localVersion = await getLocalVersion(aiDevRoot)

    // Get remote version
    const remoteVersion = await getRemoteVersion(aiDevRoot)

    // Check if behind
    const behind = await getCommitsBehind(aiDevRoot)

    console.log(chalk.bold('\n📊 Version Info:\n'))
    console.log(chalk.gray(`  Local version:  ${localVersion.version} (${localVersion.commit})`))
    console.log(chalk.gray(`  Remote version: ${remoteVersion.version} (${remoteVersion.commit})`))

    if (behind > 0) {
      console.log(chalk.yellow(`\n⚠️  You are ${behind} commit${behind > 1 ? 's' : ''} behind`))
      console.log(chalk.cyan(`\n💡 Run ${chalk.bold('ai-dev self-update')} to update\n`))
    } else if (localVersion.commit === remoteVersion.commit) {
      console.log(chalk.green('\n✅ You are up to date!\n'))
    } else {
      console.log(chalk.yellow('\n⚠️  Your version differs from remote'))
      console.log(chalk.gray('   You may have local changes\n'))
    }

    // Show recent changes if behind
    if (behind > 0 && !options.silent) {
      console.log(chalk.bold('📝 Recent changes:\n'))
      const changes = await getRecentChanges(aiDevRoot, behind)
      changes.forEach(change => {
        console.log(chalk.gray(`  • ${change}`))
      })
      console.log()
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

  const { stdout: commit } = await execa('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: aiDevRoot
  })

  return {
    version: packageJson.version,
    commit: commit.trim()
  }
}

/**
 * Get remote version
 */
async function getRemoteVersion(aiDevRoot) {
  const { stdout: commit } = await execa('git', ['rev-parse', '--short', 'origin/main'], {
    cwd: aiDevRoot
  })

  // Try to get package.json from remote
  try {
    const { stdout: content } = await execa('git', ['show', 'origin/main:package.json'], {
      cwd: aiDevRoot
    })
    const packageJson = JSON.parse(content)

    return {
      version: packageJson.version,
      commit: commit.trim()
    }
  } catch (error) {
    return {
      version: 'unknown',
      commit: commit.trim()
    }
  }
}

/**
 * Get commits behind
 */
async function getCommitsBehind(aiDevRoot) {
  try {
    const { stdout } = await execa('git', ['rev-list', '--count', 'HEAD..origin/main'], {
      cwd: aiDevRoot
    })
    return parseInt(stdout.trim())
  } catch (error) {
    return 0
  }
}

/**
 * Get recent changes
 */
async function getRecentChanges(aiDevRoot, count) {
  try {
    const { stdout } = await execa(
      'git',
      [
        'log',
        '--oneline',
        '--no-decorate',
        `-n${Math.min(count, 5)}`,
        'origin/main',
        '--not',
        'HEAD'
      ],
      { cwd: aiDevRoot }
    )

    return stdout.split('\n').filter(line => line.trim().length > 0)
  } catch (error) {
    return []
  }
}

/**
 * Load project config
 */
async function loadProjectConfig() {
  const configPath = path.join(process.cwd(), '.ai-dev.json')

  if (!(await fs.pathExists(configPath))) {
    return {}
  }

  return await fs.readJson(configPath)
}

module.exports = checkUpdatesCommand
