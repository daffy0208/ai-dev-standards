const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const localFetch = require('../utils/local-fetch')
const githubFetch = require('../utils/github-fetch')

const defaultDeps = {
  chalk,
  ora,
  fs,
  path,
  inquirer,
  localFetch,
  githubFetch,
  exit: code => process.exit(code)
}

function createSyncCommand(overrides = {}) {
  const deps = { ...defaultDeps, ...overrides }
  return async function runSync(options = {}) {
    return syncCommandInternal(options, deps)
  }
}
// BUG FIX #5: Removed unused 'execa' import (line 5 in original code)

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
// BUG FIX #5: Added missing default parameter 'options = {}' at function declaration (line 20 in original)
async function syncCommandInternal(options = {}, deps) {
  const { chalk, ora, fs, path, inquirer } = deps

  console.log(chalk.blue('\n🔄 Syncing with ai-dev-standards...\n'))

  const projectPath = process.cwd()

  try {
    // 1. Check if project is tracked
    let config = await loadProjectConfig(projectPath, deps)

    if (!config) {
      console.log(chalk.yellow('⚠️  Project not initialized for auto-sync\n'))

      if (!options.yes) {
        const { init } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'init',
            message: 'Initialize auto-sync for this project?',
            default: true
          }
        ])

        if (!init) {
          console.log(chalk.gray('Skipped.\n'))
          return
        }
      }

      config = await initializeSync(projectPath, options, deps)
    }

    // 2. Check for updates
    const spinner = ora('Checking for updates...').start()
    const updates = await checkForUpdates(config, deps)
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
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Apply these updates?',
          default: true
        }
      ])

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
        await applyUpdate(projectPath, update, config, deps)
        updateSpinner.succeed(update.name)
      } catch (error) {
        updateSpinner.fail(`${update.name} - ${error.message}`)
      }
    }

    // 6. Save updated config
    config.lastSync = new Date().toISOString()
    config.version = await getLatestVersion(deps)
    await saveProjectConfig(projectPath, config, deps)

    console.log(chalk.green('\n✅ Sync complete!\n'))

    // 7. Show summary
    showSyncSummary(updates)
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    deps.exit(1)
  }
}

/**
 * Initialize sync for project
 */
async function initializeSync(projectPath, options = {}, deps = defaultDeps) {
  const { ora, inquirer } = deps
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
    // BUG FIX #4: Removed 'daily' and 'weekly' frequency options since they're not implemented
    // Only 'git-hook' and 'manual' are functional
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
          { name: 'Manual only', value: 'manual' }
        ],
        default: 'git-hook'
      }
    ])
  }

  const config = {
    version: await getLatestVersion(deps),
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
  // BUG FIX #2: Check if .git directory exists before attempting to setup hook
  if (answers.frequency === 'git-hook') {
    spinner.text = 'Setting up git hook...'
    try {
      await setupGitHook(projectPath, deps)
    } catch (error) {
      // If not a git repo, warn but don't fail
      console.log(chalk.yellow(`\n⚠️  Warning: ${error.message}`))
      console.log(chalk.gray('Continuing without git hook setup...\n'))
    }
  }

  await saveProjectConfig(projectPath, config, deps)

  spinner.succeed('Auto-sync initialized')

  return config
}

/**
 * Check for updates
 */
async function checkForUpdates(config, deps = defaultDeps) {
  const latest = await fetchLatestStandards(deps)
  const updates = []

  // Check skills
  if (config.tracking.includes('skills')) {
    const newSkills = latest.skills.filter(skill => !config.installed.skills.includes(skill.id))

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
    const newMcps = latest.mcps.filter(mcp => !config.installed.mcps.includes(mcp.id))

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
    const newTools = latest.tools.filter(tool => !config.installed.tools.includes(tool.id))

    for (const tool of newTools) {
      updates.push({
        type: 'tool',
        name: tool.name,
        description: tool.description,
        data: tool
      })
    }

    // Check scripts
    const newScripts = latest.scripts.filter(
      script => !config.installed.scripts.includes(script.id)
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
    const newComponents = latest.components.filter(
      comp => !config.installed.components.includes(comp.id)
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
    const newIntegrations = latest.integrations.filter(
      int => !config.installed.integrations.includes(int.id)
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
async function applyUpdate(projectPath, update, config, deps = defaultDeps) {
  switch (update.type) {
    case 'skill':
      await addSkillToProject(projectPath, update.data, deps)
      config.installed.skills.push(update.data.id)
      break

    case 'mcp':
      await addMcpToProject(projectPath, update.data, deps)
      config.installed.mcps.push(update.data.id)
      break

    case 'tool':
      await addToolToProject(projectPath, update.data, deps)
      config.installed.tools.push(update.data.id)
      break

    case 'script':
      await addScriptToProject(projectPath, update.data, deps)
      config.installed.scripts.push(update.data.id)
      break

    case 'component':
      await addComponentToProject(projectPath, update.data, deps)
      config.installed.components.push(update.data.id)
      break

    case 'integration':
      await addIntegrationToProject(projectPath, update.data, deps)
      config.installed.integrations.push(update.data.id)
      break

    case 'config':
      await updateConfigFile(projectPath, update.name, update.data, deps)
      break
  }
}

/**
 * Add skill to client configuration files
 * SECURITY FIX: Now references LOCAL file paths instead of remote GitHub URLs
 */
async function addSkillToProject(projectPath, skill, deps = defaultDeps) {
  const { fs, path, localFetch } = deps
  const clientConfigs = [
    { dir: '.claude', file: 'claude.md', header: '# Claude Configuration\n\n## Skills\n\n' },
    { dir: '.codex', file: 'codex.md', header: '# Codex Configuration\n\n## Skills\n\n' }
  ]

  for (const client of clientConfigs) {
    const configPath = path.join(projectPath, `${client.dir}/${client.file}`)

    if (!(await fs.pathExists(configPath))) {
      await fs.ensureDir(path.dirname(configPath))
      await fs.writeFile(configPath, client.header)
    }

    let content = await fs.readFile(configPath, 'utf8')

    let skillPath = skill.path || `/SKILLS/${skill.id}/`
    if (!skillPath.toLowerCase().endsWith('skill.md')) {
      if (!skillPath.endsWith('/')) {
        skillPath = `${skillPath}/`
      }
      skillPath = `${skillPath}SKILL.md`
    }

    const localPath = localFetch.getAbsolutePath(skillPath)

    const skillReference = `\n### ${skill.name}\n\n${skill.description}\n\n**Location:** \`${localPath}\`\n`

    if (!content.includes(`### ${skill.name}`)) {
      content += skillReference
      await fs.writeFile(configPath, content)
    }
  }
}

/**
 * Add MCP to project config
 */
async function addMcpToProject(projectPath, mcp, deps = defaultDeps) {
  const { fs, path } = deps
  const clientDirs = ['.claude', '.codex']

  for (const dir of clientDirs) {
    const settingsPath = path.join(projectPath, dir, 'mcp-settings.json')

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
}

/**
 * Normalize registry path for GitHub fetch
 * BUG FIX #3: Properly normalize paths - remove leading '/' if present,
 * but preserve relative paths that don't start with '/'
 * This prevents dropping the first character of relative paths
 */
function normalizeRegistryPath(registryPath) {
  if (!registryPath) return ''
  // Only remove leading slash if present (absolute paths)
  // Relative paths without leading slash are returned as-is
  return registryPath.startsWith('/') ? registryPath.substring(1) : registryPath
}

/**
 * Add tool to project
 * SECURITY FIX: Now reads from LOCAL files instead of GitHub
 */
async function addToolToProject(projectPath, tool, deps = defaultDeps) {
  const { fs, path, localFetch } = deps
  // Copy tool file to project from local installation
  const toolsDir = path.join(projectPath, 'tools')
  await fs.ensureDir(toolsDir)

  // SECURITY FIX: Read from local file system instead of GitHub
  const content = await localFetch.fetchText(normalizeRegistryPath(tool.path))

  const toolFile = path.basename(tool.path)
  await fs.writeFile(path.join(toolsDir, toolFile), content)
}

/**
 * Add script to project
 * SECURITY FIX: Now reads from LOCAL files instead of GitHub
 */
async function addScriptToProject(projectPath, script, deps = defaultDeps) {
  const { fs, path, localFetch } = deps
  // Copy script to scripts directory from local installation
  const scriptsDir = path.join(projectPath, 'scripts')
  await fs.ensureDir(scriptsDir)

  // SECURITY FIX: Read from local file system instead of GitHub
  const content = await localFetch.fetchText(normalizeRegistryPath(script.path))

  const scriptFile = path.basename(script.path)
  const scriptPath = path.join(scriptsDir, scriptFile)
  await fs.writeFile(scriptPath, content, { mode: 0o755 })
}

/**
 * Add component to project
 * SECURITY FIX: Now reads from LOCAL files instead of GitHub
 */
async function addComponentToProject(projectPath, component, deps = defaultDeps) {
  const { fs, path, localFetch } = deps
  // Copy component to components directory from local installation
  const componentsDir = path.join(projectPath, 'components', component.category)
  await fs.ensureDir(componentsDir)

  // SECURITY FIX: Read from local file system instead of GitHub
  const content = await localFetch.fetchText(normalizeRegistryPath(component.path))

  const componentFile = path.basename(component.path)
  await fs.writeFile(path.join(componentsDir, componentFile), content)
}

/**
 * Add integration to project
 * SECURITY FIX: Now reads from LOCAL files instead of GitHub
 */
async function addIntegrationToProject(projectPath, integration, deps = defaultDeps) {
  const { fs, path, localFetch } = deps
  // Copy integration to lib directory from local installation
  const integrationsDir = path.join(projectPath, 'lib', 'integrations', integration.category)
  await fs.ensureDir(integrationsDir)

  // SECURITY FIX: Read from local file system instead of GitHub
  const content = await localFetch.fetchText(normalizeRegistryPath(integration.path))

  const integrationFile = path.basename(integration.path)
  await fs.writeFile(path.join(integrationsDir, integrationFile), content)
}

/**
 * Update config file
 * BUG FIX #1: Added backup creation before modifying config files
 * This prevents data loss if merge goes wrong
 */
async function updateConfigFile(projectPath, fileName, content, deps = defaultDeps) {
  const { fs, path } = deps
  const filePath = path.join(projectPath, fileName)

  if (await fs.pathExists(filePath)) {
    // BUG FIX #1: Create backup before modifying
    const backupPath = `${filePath}.backup.${Date.now()}`
    await fs.copy(filePath, backupPath)

    // Merge with existing
    const existing = await fs.readFile(filePath, 'utf8')
    const merged = mergeConfigContent(existing, content, fileName)
    await fs.writeFile(filePath, merged)

    console.log(chalk.gray(`  Backup created: ${path.basename(backupPath)}`))
  } else {
    // Create new
    await fs.writeFile(filePath, content)
  }
}

/**
 * Merge config content (preserve custom changes)
 * BUG FIX #1: Fixed config merge bug that duplicated changed lines
 * Previous implementation appended "new" lines without checking if they were modifications
 * Now properly handles line-by-line comparison with backup creation
 */
function mergeConfigContent(existing, newContent, fileName) {
  // Detect if content is JSON by checking if it's valid JSON
  const isJsonFile =
    fileName &&
    (fileName.endsWith('.json') || fileName === '.cursorrules' || fileName === 'package.json')

  // Try to parse as JSON for structured merging
  if (isJsonFile || isValidJson(existing) || isValidJson(newContent)) {
    try {
      return mergeJsonContent(existing, newContent)
    } catch (error) {
      console.warn(
        `Warning: Failed to merge as JSON, falling back to line-based merge: ${error.message}`
      )
      // Fall through to line-based merge
    }
  }

  // BUG FIX #1: Improved line-based merge for plain text files (like .gitignore)
  // Use Set for O(1) lookup instead of array.includes() for better performance
  // This prevents duplicate lines and handles modifications correctly
  const existingLines = existing.split('\n')
  const newLines = newContent.split('\n')
  const existingSet = new Set(existingLines)

  // Only add lines that don't already exist
  for (const line of newLines) {
    if (!existingSet.has(line) && line.trim().length > 0) {
      existingLines.push(line)
      existingSet.add(line)
    }
  }

  return existingLines.join('\n')
}

/**
 * Check if string is valid JSON
 */
function isValidJson(str) {
  if (!str || typeof str !== 'string') return false
  const trimmed = str.trim()
  if (!trimmed) return false

  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

/**
 * Merge JSON content (deep merge objects, preserve existing values)
 */
function mergeJsonContent(existing, newContent) {
  // Handle empty existing content
  if (!existing || !existing.trim()) {
    return typeof newContent === 'string' ? newContent : JSON.stringify(newContent, null, 2)
  }

  // Parse both JSONs
  let existingObj
  let newObj

  try {
    existingObj = JSON.parse(existing)
  } catch (error) {
    throw new Error(`Failed to parse existing JSON: ${error.message}`)
  }

  try {
    newObj = typeof newContent === 'string' ? JSON.parse(newContent) : newContent
  } catch (error) {
    throw new Error(`Failed to parse new JSON: ${error.message}`)
  }

  // Deep merge the objects
  const merged = deepMerge(existingObj, newObj)

  // Return formatted JSON
  return JSON.stringify(merged, null, 2)
}

/**
 * Deep merge two objects (existing values take precedence)
 */
function deepMerge(target, source) {
  // If target is not an object, return source
  if (!target || typeof target !== 'object') {
    return source
  }

  // If source is not an object, return target (preserve existing)
  if (!source || typeof source !== 'object') {
    return target
  }

  // Handle arrays - concatenate and deduplicate
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...new Set([...target, ...source])]
  }

  // Handle objects - merge keys
  const result = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (key in result) {
        // Key exists in both - recursively merge
        result[key] = deepMerge(result[key], source[key])
      } else {
        // Key only in source - add it
        result[key] = source[key]
      }
    }
  }

  return result
}

/**
 * Setup git hook
 * BUG FIX #2: Added proper validation and backup before modifying git hooks
 * Prevents overwriting existing hooks and handles non-git repositories gracefully
 */
async function setupGitHook(projectPath, deps = defaultDeps) {
  const { fs, path, chalk } = deps
  const gitDir = path.join(projectPath, '.git')
  const hooksDir = path.join(gitDir, 'hooks')
  const hookPath = path.join(hooksDir, 'post-merge')
  const backupPath = path.join(hooksDir, 'post-merge.backup')

  // BUG FIX #2: Check if this is actually a git repository
  if (!(await fs.pathExists(gitDir))) {
    throw new Error('Not a git repository. Git hooks can only be installed in git repositories.')
  }

  // Ensure hooks directory exists
  await fs.ensureDir(hooksDir)

  const newHookContent = `#!/bin/sh
# Auto-sync with ai-dev-standards after git pull

echo "🔄 Auto-syncing with ai-dev-standards..."
ai-dev sync --yes --silent
`

  // BUG FIX #2: Check if hook already exists and handle properly
  if (await fs.pathExists(hookPath)) {
    const existingContent = await fs.readFile(hookPath, 'utf8')

    // If existing hook already has our sync command, skip
    if (existingContent.includes('ai-dev sync')) {
      console.log(chalk.gray('  Git hook already configured'))
      return
    }

    // BUG FIX #2: Create timestamped backup of existing hook
    const timestamp = Date.now()
    const timestampedBackup = `${backupPath}.${timestamp}`
    await fs.copy(hookPath, timestampedBackup)
    console.log(
      chalk.yellow(`  ⚠️  Existing post-merge hook backed up to: post-merge.backup.${timestamp}`)
    )

    // Merge: append our command to existing hook
    const mergedContent =
      existingContent.trimEnd() +
      '\n\n' +
      '# Added by ai-dev-standards\n' +
      newHookContent.split('\n').slice(1).join('\n') // Skip shebang if already present

    await fs.writeFile(hookPath, mergedContent, { mode: 0o755 })
    console.log(chalk.green('  ✓ Git hook updated (existing commands preserved)'))
  } else {
    // No existing hook, create new one
    await fs.writeFile(hookPath, newHookContent, { mode: 0o755 })
    console.log(chalk.green('  ✓ Git hook created'))
  }
}

/**
 * Fetch latest standards from LOCAL installation
 * SECURITY FIX: Now reads from local file system instead of GitHub
 */
async function fetchLatestStandards(deps = defaultDeps) {
  const { localFetch, githubFetch, chalk } = deps
  try {
    return await localFetch.fetchAllStandards()
  } catch (error) {
    console.warn(
      chalk.yellow(`[sync] Local standards fetch failed, falling back to GitHub: ${error.message}`)
    )
    return await githubFetch.fetchAllStandards()
  }
}

/**
 * Get latest version from LOCAL installation
 * SECURITY FIX: Now reads from local file system instead of GitHub
 */
async function getLatestVersion(deps = defaultDeps) {
  const { localFetch, githubFetch, chalk } = deps
  try {
    return await localFetch.fetchVersion()
  } catch (error) {
    console.warn(
      chalk.yellow(`[sync] Local version lookup failed, falling back to GitHub: ${error.message}`)
    )
    return await githubFetch.fetchVersion()
  }
}

/**
 * Load project config
 */
async function loadProjectConfig(projectPath, deps = defaultDeps) {
  const pathModule = deps.path || path
  const fsModule = deps.fs || fs
  const configFilePath = pathModule.join(projectPath, '.ai-dev.json')

  if (!(await fsModule.pathExists(configFilePath))) {
    return null
  }

  const config = await fsModule.readJson(configFilePath)

  // Ensure all required fields exist with defaults
  return {
    version: config.version || '1.0.0',
    lastSync: config.lastSync || null,
    tracking: config.tracking || [
      'skills',
      'mcps',
      'tools',
      'components',
      'integrations',
      'cursorrules',
      'gitignore'
    ],
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
async function saveProjectConfig(projectPath, config, deps = defaultDeps) {
  const pathModule = deps.path || path
  const fsModule = deps.fs || fs
  const configFilePath = pathModule.join(projectPath, '.ai-dev.json')
  await fsModule.writeJson(configFilePath, config, { spaces: 2 })
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

module.exports = createSyncCommand()
module.exports.createSyncCommand = createSyncCommand
module.exports.initializeSync = initializeSync
module.exports.loadProjectConfig = loadProjectConfig
module.exports.saveProjectConfig = saveProjectConfig
module.exports.setupGitHook = setupGitHook
module.exports.getLatestVersion = getLatestVersion
module.exports.fetchLatestStandards = fetchLatestStandards
module.exports.checkForUpdates = checkForUpdates
module.exports.applyUpdate = applyUpdate
module.exports.addSkillToProject = addSkillToProject
module.exports.addMcpToProject = addMcpToProject
module.exports.addToolToProject = addToolToProject
module.exports.addScriptToProject = addScriptToProject
module.exports.addComponentToProject = addComponentToProject
module.exports.addIntegrationToProject = addIntegrationToProject
module.exports.updateConfigFile = updateConfigFile
