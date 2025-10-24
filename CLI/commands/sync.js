const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const inquirer = require('inquirer')

/**
 * Sync Command
 *
 * Automatically syncs your project with the latest ai-dev-standards:
 * - Updates claude.md with new skills
 * - Updates .cursorrules with new patterns
 * - Adds new MCP servers to config
 * - Updates .gitignore with best practices
 * - Pulls latest tools and integrations
 *
 * ADHD-friendly: Set it once, forget it!
 */
async function syncCommand(options) {
  console.log(chalk.blue('\n🔄 Syncing with ai-dev-standards...\n'))

  const projectPath = process.cwd()

  try {
    // 1. Check if project is tracked
    let config = await loadProjectConfig(projectPath)

    if (!config) {
      console.log(chalk.yellow('⚠️  Project not initialized for auto-sync\n'))

      if (!options.yes) {
        const { init } = await inquirer.prompt([{
          type: 'confirm',
          name: 'init',
          message: 'Initialize auto-sync for this project?',
          default: true
        }])

        if (!init) {
          console.log(chalk.gray('Skipped.\n'))
          return
        }
      }

      config = await initializeSync(projectPath, options)
    }

    // 2. Check for updates
    const spinner = ora('Checking for updates...').start()
    const updates = await checkForUpdates(config)
    spinner.succeed(`Found ${updates.length} updates`)

    if (updates.length === 0) {
      console.log(chalk.green('\n✅ Everything is up to date!\n'))
      return
    }

    // 3. Show what will be updated
    console.log(chalk.bold('\n📦 Available Updates:\n'))
    for (const update of updates) {
      console.log(chalk.cyan(`  • ${update.type}: ${update.name}`))
      if (update.description) {
        console.log(chalk.gray(`    ${update.description}`))
      }
    }

    // 4. Confirm update
    if (!options.yes) {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Apply these updates?',
        default: true
      }])

      if (!confirm) {
        console.log(chalk.gray('\nCancelled.\n'))
        return
      }
    }

    // 5. Apply updates
    console.log(chalk.bold('\n🔧 Applying updates...\n'))

    for (const update of updates) {
      const updateSpinner = ora(update.name).start()

      try {
        await applyUpdate(projectPath, update, config)
        updateSpinner.succeed(update.name)
      } catch (error) {
        updateSpinner.fail(`${update.name} - ${error.message}`)
      }
    }

    // 6. Save updated config
    config.lastSync = new Date().toISOString()
    config.version = await getLatestVersion()
    await saveProjectConfig(projectPath, config)

    console.log(chalk.green('\n✅ Sync complete!\n'))

    // 7. Show summary
    showSyncSummary(updates)

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Initialize sync for project
 */
async function initializeSync(projectPath, options = {}) {
  const spinner = ora('Initializing auto-sync...').start()

  let answers

  // If --yes flag is provided, use defaults
  if (options.yes) {
    answers = {
      track: ['skills', 'mcps', 'cursorrules', 'gitignore', 'tools', 'components', 'integrations'],
      frequency: 'git-hook'
    }
    spinner.text = 'Using default sync settings...'
  } else {
    // Ask what to track
    answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'track',
        message: 'What should be auto-synced?',
        choices: [
          { name: 'Skills (claude.md)', value: 'skills', checked: true },
          { name: 'MCP Servers', value: 'mcps', checked: true },
          { name: 'Tools', value: 'tools', checked: true },
          { name: 'Components', value: 'components', checked: true },
          { name: 'Integrations', value: 'integrations', checked: true },
          { name: 'Cursor Rules (.cursorrules)', value: 'cursorrules', checked: true },
          { name: 'Git Ignore (.gitignore)', value: 'gitignore', checked: true },
          { name: 'Templates', value: 'templates', checked: false }
        ]
      },
      {
        type: 'list',
        name: 'frequency',
        message: 'Auto-sync frequency:',
        choices: [
          { name: 'On every git pull (recommended)', value: 'git-hook' },
          { name: 'Daily', value: 'daily' },
          { name: 'Weekly', value: 'weekly' },
          { name: 'Manual only', value: 'manual' }
        ],
        default: 'git-hook'
      }
    ])
  }

  const config = {
    version: await getLatestVersion(),
    lastSync: new Date().toISOString(),
    tracking: answers.track,
    frequency: answers.frequency,
    installed: {
      skills: [],
      mcps: [],
      tools: [],
      scripts: [],
      components: [],
      integrations: []
    }
  }

  // Setup git hook if requested
  if (answers.frequency === 'git-hook') {
    await setupGitHook(projectPath)
    spinner.text = 'Setting up git hook...'
  }

  await saveProjectConfig(projectPath, config)

  spinner.succeed('Auto-sync initialized')

  return config
}

/**
 * Check for updates
 */
async function checkForUpdates(config) {
  const updates = []

  // Get latest standards
  const latest = await fetchLatestStandards()

  // Check skills
  if (config.tracking.includes('skills')) {
    const newSkills = latest.skills.filter(skill =>
      !config.installed.skills.includes(skill.id)
    )

    for (const skill of newSkills) {
      updates.push({
        type: 'skill',
        name: skill.name,
        description: skill.description,
        data: skill
      })
    }
  }

  // Check MCPs
  if (config.tracking.includes('mcps')) {
    const newMcps = latest.mcps.filter(mcp =>
      !config.installed.mcps.includes(mcp.id)
    )

    for (const mcp of newMcps) {
      updates.push({
        type: 'mcp',
        name: mcp.name,
        description: mcp.description,
        data: mcp
      })
    }
  }

  // Check tools
  if (config.tracking.includes('tools')) {
    const newTools = latest.tools.filter(tool =>
      !config.installed.tools.includes(tool.id)
    )

    for (const tool of newTools) {
      updates.push({
        type: 'tool',
        name: tool.name,
        description: tool.description,
        data: tool
      })
    }

    // Check scripts
    const newScripts = latest.scripts.filter(script =>
      !config.installed.scripts.includes(script.id)
    )

    for (const script of newScripts) {
      updates.push({
        type: 'script',
        name: script.name,
        description: script.description,
        data: script
      })
    }
  }

  // Check components
  if (config.tracking.includes('components')) {
    const newComponents = latest.components.filter(comp =>
      !config.installed.components.includes(comp.id)
    )

    for (const comp of newComponents) {
      updates.push({
        type: 'component',
        name: comp.name,
        description: comp.description,
        data: comp
      })
    }
  }

  // Check integrations
  if (config.tracking.includes('integrations')) {
    const newIntegrations = latest.integrations.filter(int =>
      !config.installed.integrations.includes(int.id)
    )

    for (const integration of newIntegrations) {
      updates.push({
        type: 'integration',
        name: integration.name,
        description: integration.description,
        data: integration
      })
    }
  }

  // Check config file updates
  if (config.tracking.includes('cursorrules')) {
    const currentVersion = config.version
    const latestVersion = latest.version

    if (currentVersion !== latestVersion) {
      updates.push({
        type: 'config',
        name: '.cursorrules',
        description: 'Updated with latest best practices',
        data: latest.cursorrules
      })
    }
  }

  if (config.tracking.includes('gitignore')) {
    updates.push({
      type: 'config',
      name: '.gitignore',
      description: 'Updated with latest patterns',
      data: latest.gitignore
    })
  }

  return updates
}

/**
 * Apply update
 */
async function applyUpdate(projectPath, update, config) {
  switch (update.type) {
    case 'skill':
      await addSkillToProject(projectPath, update.data)
      config.installed.skills.push(update.data.id)
      break

    case 'mcp':
      await addMcpToProject(projectPath, update.data)
      config.installed.mcps.push(update.data.id)
      break

    case 'tool':
      await addToolToProject(projectPath, update.data)
      config.installed.tools.push(update.data.id)
      break

    case 'script':
      await addScriptToProject(projectPath, update.data)
      config.installed.scripts.push(update.data.id)
      break

    case 'component':
      await addComponentToProject(projectPath, update.data)
      config.installed.components.push(update.data.id)
      break

    case 'integration':
      await addIntegrationToProject(projectPath, update.data)
      config.installed.integrations.push(update.data.id)
      break

    case 'config':
      await updateConfigFile(projectPath, update.name, update.data)
      break
  }
}

/**
 * Add skill to claude.md
 */
async function addSkillToProject(projectPath, skill) {
  const claudeMdPath = path.join(projectPath, '.claude/claude.md')

  if (!await fs.pathExists(claudeMdPath)) {
    await fs.ensureDir(path.dirname(claudeMdPath))
    await fs.writeFile(claudeMdPath, '# Claude Configuration\n\n## Skills\n\n')
  }

  let content = await fs.readFile(claudeMdPath, 'utf8')

  // Use the skill path from the registry, or construct it
  const skillPath = skill.path || `/SKILLS/${skill.id}/SKILL.md`
  const githubBaseUrl = 'https://raw.githubusercontent.com/daffy0208/ai-dev-standards/main'
  const fullPath = `${githubBaseUrl}${skillPath}`

  // Add skill reference
  const skillReference = `\n### ${skill.name}\n\n${skill.description}\n\n**Location:** \`${fullPath}\`\n`

  if (!content.includes(skill.name)) {
    content += skillReference
    await fs.writeFile(claudeMdPath, content)
  }
}

/**
 * Add MCP to project config
 */
async function addMcpToProject(projectPath, mcp) {
  // Add to Claude Code MCP settings
  const settingsPath = path.join(projectPath, '.claude', 'mcp-settings.json')

  let settings = {}
  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJson(settingsPath)
  }

  if (!settings.mcpServers) {
    settings.mcpServers = {}
  }

  settings.mcpServers[mcp.name] = {
    command: 'node',
    args: [mcp.path],
    env: mcp.env || {}
  }

  await fs.ensureDir(path.dirname(settingsPath))
  await fs.writeJson(settingsPath, settings, { spaces: 2 })
}

/**
 * Add tool to project
 */
async function addToolToProject(projectPath, tool) {
  // Fetch and copy tool file to project
  const toolsDir = path.join(projectPath, 'tools')
  await fs.ensureDir(toolsDir)

  // Fetch tool file from GitHub
  const { fetchText } = require('../utils/github-fetch')
  const content = await fetchText(tool.path.substring(1)) // Remove leading /

  const toolFile = path.basename(tool.path)
  await fs.writeFile(path.join(toolsDir, toolFile), content)
}

/**
 * Add script to project
 */
async function addScriptToProject(projectPath, script) {
  // Copy script to scripts directory
  const scriptsDir = path.join(projectPath, 'scripts')
  await fs.ensureDir(scriptsDir)

  const { fetchText } = require('../utils/github-fetch')
  const content = await fetchText(script.path.substring(1))

  const scriptFile = path.basename(script.path)
  const scriptPath = path.join(scriptsDir, scriptFile)
  await fs.writeFile(scriptPath, content, { mode: 0o755 })
}

/**
 * Add component to project
 */
async function addComponentToProject(projectPath, component) {
  // Copy component to components directory
  const componentsDir = path.join(projectPath, 'components', component.category)
  await fs.ensureDir(componentsDir)

  // Fetch component file from GitHub
  const { fetchText } = require('../utils/github-fetch')
  const content = await fetchText(component.path.substring(1)) // Remove leading /

  const componentFile = path.basename(component.path)
  await fs.writeFile(path.join(componentsDir, componentFile), content)
}

/**
 * Add integration to project
 */
async function addIntegrationToProject(projectPath, integration) {
  // Copy integration to lib directory
  const integrationsDir = path.join(projectPath, 'lib', 'integrations', integration.category)
  await fs.ensureDir(integrationsDir)

  // Fetch integration file from GitHub
  const { fetchText } = require('../utils/github-fetch')
  const content = await fetchText(integration.path.substring(1))

  const integrationFile = path.basename(integration.path)
  await fs.writeFile(path.join(integrationsDir, integrationFile), content)
}

/**
 * Update config file
 */
async function updateConfigFile(projectPath, fileName, content) {
  const filePath = path.join(projectPath, fileName)

  if (await fs.pathExists(filePath)) {
    // Merge with existing
    const existing = await fs.readFile(filePath, 'utf8')
    const merged = mergeConfigContent(existing, content)
    await fs.writeFile(filePath, merged)
  } else {
    // Create new
    await fs.writeFile(filePath, content)
  }
}

/**
 * Merge config content (preserve custom changes)
 */
function mergeConfigContent(existing, newContent) {
  // Simple merge - append new content if not present
  const lines = existing.split('\n')
  const newLines = newContent.split('\n')

  for (const line of newLines) {
    if (!lines.includes(line) && line.trim().length > 0) {
      lines.push(line)
    }
  }

  return lines.join('\n')
}

/**
 * Setup git hook
 */
async function setupGitHook(projectPath) {
  const hookPath = path.join(projectPath, '.git', 'hooks', 'post-merge')

  const hookContent = `#!/bin/sh
# Auto-sync with ai-dev-standards after git pull

echo "🔄 Auto-syncing with ai-dev-standards..."
ai-dev sync --yes --silent
`

  await fs.writeFile(hookPath, hookContent, { mode: 0o755 })
}

/**
 * Fetch latest standards from GitHub
 */
async function fetchLatestStandards() {
  const { fetchAllStandards } = require('../utils/github-fetch')
  return await fetchAllStandards()
}

/**
 * Get latest version from GitHub
 */
async function getLatestVersion() {
  const { fetchVersion } = require('../utils/github-fetch')
  return await fetchVersion()
}

/**
 * Load project config
 */
async function loadProjectConfig(projectPath) {
  const configPath = path.join(projectPath, '.ai-dev.json')

  if (!await fs.pathExists(configPath)) {
    return null
  }

  const config = await fs.readJson(configPath)

  // Ensure all required fields exist with defaults
  return {
    version: config.version || '1.0.0',
    lastSync: config.lastSync || null,
    tracking: config.tracking || ['skills', 'mcps', 'tools', 'components', 'integrations', 'cursorrules', 'gitignore'],
    frequency: config.frequency || 'git-hook',
    installed: {
      skills: config.installed?.skills || [],
      mcps: config.installed?.mcps || [],
      tools: config.installed?.tools || [],
      scripts: config.installed?.scripts || [],
      components: config.installed?.components || [],
      integrations: config.installed?.integrations || []
    }
  }
}

/**
 * Save project config
 */
async function saveProjectConfig(projectPath, config) {
  const configPath = path.join(projectPath, '.ai-dev.json')
  await fs.writeJson(configPath, config, { spaces: 2 })
}

/**
 * Show sync summary
 */
function showSyncSummary(updates) {
  const skillCount = updates.filter(u => u.type === 'skill').length
  const mcpCount = updates.filter(u => u.type === 'mcp').length
  const toolCount = updates.filter(u => u.type === 'tool').length
  const scriptCount = updates.filter(u => u.type === 'script').length
  const componentCount = updates.filter(u => u.type === 'component').length
  const integrationCount = updates.filter(u => u.type === 'integration').length
  const configCount = updates.filter(u => u.type === 'config').length

  console.log(chalk.bold('📊 Summary:\n'))
  if (skillCount > 0) console.log(chalk.gray(`  • ${skillCount} skills added`))
  if (mcpCount > 0) console.log(chalk.gray(`  • ${mcpCount} MCPs configured`))
  if (toolCount > 0) console.log(chalk.gray(`  • ${toolCount} tools added`))
  if (scriptCount > 0) console.log(chalk.gray(`  • ${scriptCount} scripts added`))
  if (componentCount > 0) console.log(chalk.gray(`  • ${componentCount} components added`))
  if (integrationCount > 0) console.log(chalk.gray(`  • ${integrationCount} integrations added`))
  if (configCount > 0) console.log(chalk.gray(`  • ${configCount} config files updated`))

  console.log(chalk.bold('\n💡 Tip:'))
  console.log(chalk.gray('  Auto-sync runs automatically on git pull'))
  console.log(chalk.gray('  Or run manually: ai-dev sync\n'))
}

module.exports = syncCommand
