const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')

const defaultDeps = {
  chalk,
  ora,
  fs,
  path,
  inquirer,
  cwd: () => process.cwd(),
  fetchAvailableSkills: async () => {
    const { fetchSkills } = require('../utils/github-fetch')
    return await fetchSkills()
  },
  fetchAvailableMcps: async () => {
    const { fetchMCPs } = require('../utils/github-fetch')
    return await fetchMCPs()
  },
  fetchAvailableTools: async () => [],
  fetchLatestCursorRules: async () => `# Cursor Rules

## AI Development Standards

Follow patterns from ai-dev-standards.

## Code Style

- TypeScript strict mode
- Functional components
- Zod validation
- Tailwind CSS

## Testing

- Jest + React Testing Library
- Test coverage > 80%

## Accessibility

- WCAG AA compliance
- Semantic HTML
- ARIA labels
`,
  fetchLatestGitignore: async () => `node_modules/
.env
.env.local
.DS_Store
dist/
build/
coverage/
.next/
.turbo/
.vercel/
.ai-dev.json
*.log
`,
  exit: code => process.exit(code)
}

function createUpdateCommand(overrides = {}) {
  const deps = { ...defaultDeps, ...overrides }
  return async function runUpdate(target, options) {
    return updateCommandInternal(target, options, deps)
  }
}

/**
 * Update Command
 *
 * Update specific parts of your project:
 * - Update skills list
 * - Update MCP servers
 * - Update cursor rules
 * - Update specific integrations
 *
 * Fine-grained control over what gets updated
 */
async function updateCommandInternal(target, options, deps) {
  const { chalk } = deps
  console.log(chalk.blue(`\n🔄 Updating ${target}...\n`))

  const projectPath = deps.cwd ? deps.cwd() : process.cwd()

  try {
    switch (target) {
      case 'skills':
        await updateSkills(projectPath, options, deps)
        break

      case 'mcps':
      case 'mcp-servers':
        await updateMcpServers(projectPath, options, deps)
        break

      case 'cursorrules':
      case 'cursor-rules':
        await updateCursorRules(projectPath, deps)
        break

      case 'gitignore':
        await updateGitignore(projectPath, deps)
        break

      case 'tools':
        await updateTools(projectPath, options, deps)
        break

      case 'all':
        await updateAll(projectPath, deps)
        break

      default:
        console.log(chalk.red(`❌ Unknown target: ${target}`))
        console.log(chalk.yellow('\nAvailable targets:'))
        console.log(chalk.gray('  - skills'))
        console.log(chalk.gray('  - mcps'))
        console.log(chalk.gray('  - cursorrules'))
        console.log(chalk.gray('  - gitignore'))
        console.log(chalk.gray('  - tools'))
        console.log(chalk.gray('  - all\n'))
        throw new Error('Unknown target')
    }

    console.log(chalk.green(`\n✅ ${target} updated successfully!\n`))
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    deps.exit(1)
    throw error
  }
}

/**
 * Update skills
 */
async function updateSkills(projectPath, options, deps) {
  const { ora, chalk, inquirer } = deps
  const spinner = ora('Fetching available skills...').start()

  const availableSkills = await deps.fetchAvailableSkills()

  spinner.succeed(`Found ${availableSkills.length} skills`)

  // Get currently installed
  const config = await loadConfig(projectPath, deps)
  const installed = config?.installed?.skills || []

  // Show new skills
  const newSkills = availableSkills.filter(skill => !installed.includes(skill.name))

  if (newSkills.length === 0) {
    console.log(chalk.green('✅ All skills are already installed'))
    return
  }

  console.log(chalk.bold(`\n📦 ${newSkills.length} new skills available:\n`))

  // Let user select which to install
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select skills to add:',
      choices: newSkills.map(skill => ({
        name: `${skill.name} - ${skill.description}`,
        value: skill.name,
        checked: options.all || false
      })),
      pageSize: 15
    }
  ])

  if (selected.length === 0) {
    console.log(chalk.gray('No skills selected'))
    return
  }

  // Add selected skills
  const addSpinner = ora('Adding skills...').start()

  for (const skillName of selected) {
    const skill = newSkills.find(s => s.name === skillName)
    await addSkillReference(projectPath, skill, deps)
    installed.push(skillName)
  }

  // Update config
  if (!config.installed) config.installed = {}
  config.installed.skills = installed
  await saveConfig(projectPath, config, deps)

  addSpinner.succeed(`Added ${selected.length} skills`)
}

/**
 * Update MCP servers
 */
async function updateMcpServers(projectPath, options, deps) {
  const { ora, chalk, inquirer, fs, path } = deps
  const spinner = ora('Fetching available MCP servers...').start()

  const availableMcps = await deps.fetchAvailableMcps()

  spinner.succeed(`Found ${availableMcps.length} MCP servers`)

  const config = await loadConfig(projectPath, deps)
  const installed = config?.installed?.mcps || []

  const newMcps = availableMcps.filter(mcp => !installed.includes(mcp.name))

  if (newMcps.length === 0) {
    console.log(chalk.green('✅ All MCP servers are already configured'))
    return
  }

  console.log(chalk.bold(`\n📦 ${newMcps.length} new MCP servers available:\n`))

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select MCP servers to configure:',
      choices: newMcps.map(mcp => ({
        name: `${mcp.name} - ${mcp.description}`,
        value: mcp.name,
        checked: options.all || false
      }))
    }
  ])

  if (selected.length === 0) {
    console.log(chalk.gray('No MCPs selected'))
    return
  }

  const CLIENT_MCP_DIRS = ['.claude', '.codex']

  for (const mcpName of selected) {
    const mcp = newMcps.find(m => m.name === mcpName)

    for (const clientDir of CLIENT_MCP_DIRS) {
      const settingsPath = path.join(projectPath, clientDir, 'mcp-settings.json')
      let settings = {}

      if (await fs.pathExists(settingsPath)) {
        settings = await fs.readJson(settingsPath)
      }

      if (!settings.mcpServers) settings.mcpServers = {}

      settings.mcpServers[mcpName] = {
        command: 'node',
        args: [mcp.path],
        env: mcp.env || {}
      }

      await fs.ensureDir(path.dirname(settingsPath))
      await fs.writeJson(settingsPath, settings, { spaces: 2 })
    }

    if (!installed.includes(mcpName)) {
      installed.push(mcpName)
    }
  }

  // Update config
  if (!config.installed) config.installed = {}
  config.installed.mcps = installed
  await saveConfig(projectPath, config, deps)

  console.log(chalk.green(`\n✅ Configured ${selected.length} MCP servers`))
}

/**
 * Update cursor rules
 */
async function updateCursorRules(projectPath, deps) {
  const { ora, chalk, fs, path, inquirer } = deps
  const spinner = ora('Fetching latest cursor rules...').start()

  const latestRules = await deps.fetchLatestCursorRules()

  spinner.stop()

  const cursorrulePath = path.join(projectPath, '.cursorrules')

  let existing = ''
  if (await fs.pathExists(cursorrulePath)) {
    existing = await fs.readFile(cursorrulePath, 'utf8')
  }

  if (existing === latestRules) {
    console.log(chalk.green('✅ Cursor rules are already up to date'))
    return
  }

  // Show diff
  console.log(chalk.bold('📝 Cursor rules will be updated\n'))

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Update .cursorrules with latest best practices?',
      default: true
    }
  ])

  if (!confirm) {
    console.log(chalk.gray('Cancelled'))
    return
  }

  // Backup existing
  if (existing) {
    await fs.writeFile(cursorrulePath + '.backup', existing)
    console.log(chalk.gray('  Backup saved to .cursorrules.backup'))
  }

  // Write new rules
  await fs.writeFile(cursorrulePath, latestRules)

  console.log(chalk.green('✅ Cursor rules updated'))
}

/**
 * Update gitignore
 */
async function updateGitignore(projectPath, deps) {
  const { ora, fs, path, chalk } = deps
  const spinner = ora('Fetching latest .gitignore patterns...').start()

  const latestPatterns = await deps.fetchLatestGitignore()

  spinner.stop()

  const gitignorePath = path.join(projectPath, '.gitignore')

  let existing = ''
  if (await fs.pathExists(gitignorePath)) {
    existing = await fs.readFile(gitignorePath, 'utf8')
  }

  // Merge patterns (don't duplicate)
  const existingLines = existing.split('\n')
  const newLines = latestPatterns.split('\n')

  const merged = [...new Set([...existingLines, ...newLines])]
    .filter(line => line.trim().length > 0)
    .join('\n')

  await fs.writeFile(gitignorePath, merged + '\n')

  console.log(chalk.green('✅ .gitignore updated with latest patterns'))
}

/**
 * Update tools
 */
async function updateTools(projectPath, options, deps) {
  const { ora, chalk, inquirer, fs, path } = deps
  const spinner = ora('Fetching available tools...').start()

  const availableTools = await deps.fetchAvailableTools()

  spinner.succeed(`Found ${availableTools.length} tools`)

  const config = await loadConfig(projectPath, deps)
  const installed = config?.installed?.tools || []

  const newTools = availableTools.filter(tool => !installed.includes(tool.name))

  if (newTools.length === 0) {
    console.log(chalk.green('✅ All tools are already installed'))
    return
  }

  console.log(chalk.bold(`\n📦 ${newTools.length} new tools available:\n`))

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select tools to add:',
      choices: newTools.map(tool => ({
        name: `${tool.name} (${tool.framework}) - ${tool.description}`,
        value: tool.name,
        checked: options.all || false
      }))
    }
  ])

  if (selected.length === 0) {
    console.log(chalk.gray('No tools selected'))
    return
  }

  // Add tools
  const toolsDir = path.join(projectPath, 'tools')
  await fs.ensureDir(toolsDir)

  for (const toolName of selected) {
    const tool = newTools.find(t => t.name === toolName)
    const toolPath = path.join(toolsDir, `${toolName}.ts`)
    await fs.writeFile(toolPath, tool.content)
    installed.push(toolName)
  }

  // Update config
  if (!config.installed) config.installed = {}
  config.installed.tools = installed
  await saveConfig(projectPath, config, deps)

  console.log(chalk.green(`\n✅ Added ${selected.length} tools`))
}

/**
 * Update all
 */
async function updateAll(projectPath, deps) {
  const { chalk } = deps
  console.log(chalk.bold('Updating everything...\n'))

  await updateSkills(projectPath, { all: true }, deps)
  await updateMcpServers(projectPath, { all: true }, deps)
  await updateCursorRules(projectPath, deps)
  await updateGitignore(projectPath, deps)
  await updateTools(projectPath, { all: true }, deps)
}

const CLIENT_SKILL_DOCS = [
  {
    dir: '.claude',
    file: 'claude.md',
    header: '# Claude Configuration\n\n## Skills\n\n',
    locationLabel: '**Location:**'
  },
  {
    dir: '.codex',
    file: 'codex.md',
    header: '# Codex Configuration\n\n## Skills\n\n',
    locationLabel: '**Location:**'
  }
]

/**
 * Add skill reference to client configuration files
 */
async function addSkillReference(projectPath, skill, deps = defaultDeps) {
  const { fs, path } = deps
  for (const client of CLIENT_SKILL_DOCS) {
    const targetPath = path.join(projectPath, client.dir, client.file)
    await fs.ensureDir(path.dirname(targetPath))

    let content = ''
    if (await fs.pathExists(targetPath)) {
      content = await fs.readFile(targetPath, 'utf8')
    } else {
      content = client.header
    }

    if (!content.includes(`### ${skill.name}`)) {
      content += `\n### ${skill.name}\n\n${skill.description}\n\n${client.locationLabel} \`skills/${skill.name}/SKILL.md\`\n`
      await fs.writeFile(targetPath, content)
    }
  }
}

/**
 * Load config
 */
async function loadConfig(projectPath, deps = defaultDeps) {
  const { fs, path } = deps
  const configPath = path.join(projectPath, '.ai-dev.json')

  if (!(await fs.pathExists(configPath))) {
    return { installed: { skills: [], mcps: [], tools: [], integrations: [] } }
  }

  return await fs.readJson(configPath)
}

/**
 * Save config
 */
async function saveConfig(projectPath, config, deps = defaultDeps) {
  const { fs, path } = deps
  const configPath = path.join(projectPath, '.ai-dev.json')
  await fs.writeJson(configPath, config, { spaces: 2 })
}

module.exports = createUpdateCommand()
module.exports.createUpdateCommand = createUpdateCommand
