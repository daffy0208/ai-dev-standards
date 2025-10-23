const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')

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
async function updateCommand(target, options) {
  console.log(chalk.blue(`\n🔄 Updating ${target}...\n`))

  const projectPath = process.cwd()

  try {
    switch (target) {
      case 'skills':
        await updateSkills(projectPath, options)
        break

      case 'mcps':
      case 'mcp-servers':
        await updateMcpServers(projectPath, options)
        break

      case 'cursorrules':
      case 'cursor-rules':
        await updateCursorRules(projectPath, options)
        break

      case 'gitignore':
        await updateGitignore(projectPath, options)
        break

      case 'tools':
        await updateTools(projectPath, options)
        break

      case 'all':
        await updateAll(projectPath, options)
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
        process.exit(1)
    }

    console.log(chalk.green(`\n✅ ${target} updated successfully!\n`))

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Update skills
 */
async function updateSkills(projectPath, options) {
  const spinner = ora('Fetching available skills...').start()

  // Get available skills
  const availableSkills = await fetchAvailableSkills()

  spinner.succeed(`Found ${availableSkills.length} skills`)

  // Get currently installed
  const config = await loadConfig(projectPath)
  const installed = config?.installed?.skills || []

  // Show new skills
  const newSkills = availableSkills.filter(skill => !installed.includes(skill.name))

  if (newSkills.length === 0) {
    console.log(chalk.green('✅ All skills are already installed'))
    return
  }

  console.log(chalk.bold(`\n📦 ${newSkills.length} new skills available:\n`))

  // Let user select which to install
  const { selected } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selected',
    message: 'Select skills to add:',
    choices: newSkills.map(skill => ({
      name: `${skill.name} - ${skill.description}`,
      value: skill.name,
      checked: options.all || false
    })),
    pageSize: 15
  }])

  if (selected.length === 0) {
    console.log(chalk.gray('No skills selected'))
    return
  }

  // Add selected skills
  const addSpinner = ora('Adding skills...').start()

  for (const skillName of selected) {
    const skill = newSkills.find(s => s.name === skillName)
    await addSkillReference(projectPath, skill)
    installed.push(skillName)
  }

  // Update config
  if (!config.installed) config.installed = {}
  config.installed.skills = installed
  await saveConfig(projectPath, config)

  addSpinner.succeed(`Added ${selected.length} skills`)
}

/**
 * Update MCP servers
 */
async function updateMcpServers(projectPath, options) {
  const spinner = ora('Fetching available MCP servers...').start()

  const availableMcps = await fetchAvailableMcps()

  spinner.succeed(`Found ${availableMcps.length} MCP servers`)

  const config = await loadConfig(projectPath)
  const installed = config?.installed?.mcps || []

  const newMcps = availableMcps.filter(mcp => !installed.includes(mcp.name))

  if (newMcps.length === 0) {
    console.log(chalk.green('✅ All MCP servers are already configured'))
    return
  }

  console.log(chalk.bold(`\n📦 ${newMcps.length} new MCP servers available:\n`))

  const { selected } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selected',
    message: 'Select MCP servers to configure:',
    choices: newMcps.map(mcp => ({
      name: `${mcp.name} - ${mcp.description}`,
      value: mcp.name,
      checked: options.all || false
    }))
  }])

  if (selected.length === 0) {
    console.log(chalk.gray('No MCPs selected'))
    return
  }

  // Add to MCP settings
  const settingsPath = path.join(projectPath, '.claude', 'mcp-settings.json')
  let settings = {}

  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJson(settingsPath)
  }

  if (!settings.mcpServers) settings.mcpServers = {}

  for (const mcpName of selected) {
    const mcp = newMcps.find(m => m.name === mcpName)
    settings.mcpServers[mcpName] = {
      command: 'node',
      args: [mcp.path],
      env: mcp.env || {}
    }
    installed.push(mcpName)
  }

  await fs.ensureDir(path.dirname(settingsPath))
  await fs.writeJson(settingsPath, settings, { spaces: 2 })

  // Update config
  if (!config.installed) config.installed = {}
  config.installed.mcps = installed
  await saveConfig(projectPath, config)

  console.log(chalk.green(`\n✅ Configured ${selected.length} MCP servers`))
}

/**
 * Update cursor rules
 */
async function updateCursorRules(projectPath, options) {
  const spinner = ora('Fetching latest cursor rules...').start()

  const latestRules = await fetchLatestCursorRules()

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

  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Update .cursorrules with latest best practices?',
    default: true
  }])

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
async function updateGitignore(projectPath, options) {
  const spinner = ora('Fetching latest .gitignore patterns...').start()

  const latestPatterns = await fetchLatestGitignore()

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
async function updateTools(projectPath, options) {
  const spinner = ora('Fetching available tools...').start()

  const availableTools = await fetchAvailableTools()

  spinner.succeed(`Found ${availableTools.length} tools`)

  const config = await loadConfig(projectPath)
  const installed = config?.installed?.tools || []

  const newTools = availableTools.filter(tool => !installed.includes(tool.name))

  if (newTools.length === 0) {
    console.log(chalk.green('✅ All tools are already installed'))
    return
  }

  console.log(chalk.bold(`\n📦 ${newTools.length} new tools available:\n`))

  const { selected } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selected',
    message: 'Select tools to add:',
    choices: newTools.map(tool => ({
      name: `${tool.name} (${tool.framework}) - ${tool.description}`,
      value: tool.name,
      checked: options.all || false
    }))
  }])

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
  await saveConfig(projectPath, config)

  console.log(chalk.green(`\n✅ Added ${selected.length} tools`))
}

/**
 * Update all
 */
async function updateAll(projectPath, options) {
  console.log(chalk.bold('Updating everything...\n'))

  await updateSkills(projectPath, { all: true })
  await updateMcpServers(projectPath, { all: true })
  await updateCursorRules(projectPath, options)
  await updateGitignore(projectPath, options)
  await updateTools(projectPath, { all: true })
}

/**
 * Fetch available skills
 */
async function fetchAvailableSkills() {
  // TODO: Fetch from actual ai-dev-standards repo
  return [
    { name: 'data-visualizer', description: 'Create charts and dashboards' },
    { name: 'iot-developer', description: 'IoT and sensor integration' },
    { name: 'spatial-developer', description: 'AR/VR development' }
  ]
}

/**
 * Fetch available MCPs
 */
async function fetchAvailableMcps() {
  return [
    {
      name: 'accessibility-checker',
      description: 'WCAG compliance checking',
      path: './MCP-SERVERS/accessibility-checker-mcp/index.js'
    },
    {
      name: 'component-generator',
      description: 'Generate React components',
      path: './MCP-SERVERS/component-generator-mcp/index.js'
    }
  ]
}

/**
 * Fetch available tools
 */
async function fetchAvailableTools() {
  return []
}

/**
 * Fetch latest cursor rules
 */
async function fetchLatestCursorRules() {
  return `# Cursor Rules

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
`
}

/**
 * Fetch latest gitignore
 */
async function fetchLatestGitignore() {
  return `node_modules/
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
`
}

/**
 * Add skill reference to claude.md
 */
async function addSkillReference(projectPath, skill) {
  const claudeMdPath = path.join(projectPath, '.claude', 'claude.md')

  await fs.ensureDir(path.dirname(claudeMdPath))

  let content = ''
  if (await fs.pathExists(claudeMdPath)) {
    content = await fs.readFile(claudeMdPath, 'utf8')
  } else {
    content = '# Claude Configuration\n\n## Skills\n\n'
  }

  if (!content.includes(skill.name)) {
    content += `\n### ${skill.name}\n\n${skill.description}\n\n**Path:** \`SKILLS/${skill.name}/SKILL.md\`\n`
    await fs.writeFile(claudeMdPath, content)
  }
}

/**
 * Load config
 */
async function loadConfig(projectPath) {
  const configPath = path.join(projectPath, '.ai-dev.json')

  if (!await fs.pathExists(configPath)) {
    return { installed: { skills: [], mcps: [], tools: [], integrations: [] } }
  }

  return await fs.readJson(configPath)
}

/**
 * Save config
 */
async function saveConfig(projectPath, config) {
  const configPath = path.join(projectPath, '.ai-dev.json')
  await fs.writeJson(configPath, config, { spaces: 2 })
}

module.exports = updateCommand
