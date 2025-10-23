const chalk = require('chalk')
const ora = require('ora')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')

// Generators
const ComponentGenerator = require('../generators/component-generator')
const McpGenerator = require('../generators/mcp-generator')
const IntegrationGenerator = require('../generators/integration-generator')
const ToolGenerator = require('../generators/tool-generator')

/**
 * Add Command
 *
 * Generates new code artifacts:
 * - components: React/Next.js components with tests + Storybook
 * - mcp-server: MCP servers with full implementation
 * - integration: API integrations with type safety
 * - tool: Reusable tools for agents (LangChain, CrewAI)
 */
async function addCommand(type, name, options) {
  console.log(chalk.blue(`\n🚀 Adding ${type}: ${chalk.bold(name)}\n`))

  try {
    switch (type) {
      case 'component':
        await addComponent(name, options)
        break

      case 'mcp-server':
      case 'mcp':
        await addMcpServer(name, options)
        break

      case 'integration':
        await addIntegration(name, options)
        break

      case 'tool':
        await addTool(name, options)
        break

      default:
        console.log(chalk.red(`❌ Unknown type: ${type}`))
        console.log(chalk.yellow(`\nSupported types: component, mcp-server, integration, tool`))
        process.exit(1)
    }

    console.log(chalk.green(`\n✅ Successfully added ${type}: ${chalk.bold(name)}\n`))

    // Show next steps
    showNextSteps(type, name)

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Add Component
 */
async function addComponent(name, options) {
  const spinner = ora('Generating component...').start()

  // Parse props
  let props = {}
  if (options.props) {
    const propList = options.props.split(',').map(p => p.trim())

    // Ask for prop types
    spinner.stop()
    const answers = await inquirer.prompt([{
      type: 'checkbox',
      name: 'propTypes',
      message: 'Select prop types:',
      choices: propList.map(prop => ({
        name: `${prop} (string)`,
        value: { name: prop, type: 'string' },
        checked: true
      }))
    }])

    props = answers.propTypes.reduce((acc, prop) => {
      acc[prop.name] = prop.type
      return acc
    }, {})

    spinner.start()
  } else {
    // Default props if none specified
    props = {
      className: 'string',
      children: 'ReactNode'
    }
  }

  const generator = new ComponentGenerator()
  const files = await generator.generate({
    name,
    props,
    withTests: options.withTests !== false, // Default true
    withStorybook: options.withStorybook || false,
    template: options.template || 'default'
  })

  spinner.succeed('Component generated')

  // Write files
  const writeSpinner = ora('Writing files...').start()
  for (const file of files) {
    await fs.ensureDir(path.dirname(file.path))
    await fs.writeFile(file.path, file.content)
    console.log(chalk.gray(`  Created: ${file.path}`))
  }
  writeSpinner.succeed('Files written')
}

/**
 * Add MCP Server
 */
async function addMcpServer(name, options) {
  const spinner = ora('Generating MCP server...').start()

  // Ask for MCP server details
  spinner.stop()
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Choose MCP server template:',
      choices: [
        { name: 'Custom MCP Server', value: 'custom' },
        { name: 'Accessibility Checker', value: 'accessibility-checker' },
        { name: 'Component Generator', value: 'component-generator' },
        { name: 'Screenshot Testing', value: 'screenshot-testing' },
        { name: 'API Client', value: 'api-client' },
        { name: 'Database Query Tool', value: 'database-query' }
      ],
      default: 'custom'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Brief description:',
      default: `MCP server for ${name}`
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [
        { name: 'Tools (functions)', value: 'tools', checked: true },
        { name: 'Resources (data)', value: 'resources', checked: false },
        { name: 'Prompts (templates)', value: 'prompts', checked: false }
      ]
    }
  ])

  spinner.start()

  const generator = new McpGenerator()
  const files = await generator.generate({
    name,
    template: options.template || answers.template,
    description: answers.description,
    features: answers.features
  })

  spinner.succeed('MCP server generated')

  // Write files
  const writeSpinner = ora('Writing files...').start()
  for (const file of files) {
    await fs.ensureDir(path.dirname(file.path))
    await fs.writeFile(file.path, file.content)
    console.log(chalk.gray(`  Created: ${file.path}`))
  }
  writeSpinner.succeed('Files written')
}

/**
 * Add Integration
 */
async function addIntegration(name, options) {
  const spinner = ora('Generating integration...').start()

  spinner.stop()
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Choose provider:',
      choices: [
        'supabase',
        'stripe',
        'resend',
        'openai',
        'anthropic',
        'pinecone',
        'weaviate',
        'custom'
      ]
    },
    {
      type: 'confirm',
      name: 'withTypes',
      message: 'Generate TypeScript types?',
      default: true
    },
    {
      type: 'confirm',
      name: 'withEnv',
      message: 'Generate .env.example?',
      default: true
    }
  ])

  spinner.start()

  const generator = new IntegrationGenerator()
  const files = await generator.generate({
    name,
    provider: answers.provider,
    withAuth: options.withAuth || false,
    withRag: options.withRag || false,
    withTypes: answers.withTypes,
    withEnv: answers.withEnv
  })

  spinner.succeed('Integration generated')

  // Write files
  const writeSpinner = ora('Writing files...').start()
  for (const file of files) {
    await fs.ensureDir(path.dirname(file.path))
    await fs.writeFile(file.path, file.content)
    console.log(chalk.gray(`  Created: ${file.path}`))
  }
  writeSpinner.succeed('Files written')
}

/**
 * Add Tool
 */
async function addTool(name, options) {
  const spinner = ora('Generating tool...').start()

  const framework = options.framework || 'custom'

  const generator = new ToolGenerator()
  const files = await generator.generate({
    name,
    framework,
    category: 'custom'
  })

  spinner.succeed('Tool generated')

  // Write files
  const writeSpinner = ora('Writing files...').start()
  for (const file of files) {
    await fs.ensureDir(path.dirname(file.path))
    await fs.writeFile(file.path, file.content)
    console.log(chalk.gray(`  Created: ${file.path}`))
  }
  writeSpinner.succeed('Files written')
}

/**
 * Show Next Steps
 */
function showNextSteps(type, name) {
  console.log(chalk.bold('\n📚 Next Steps:\n'))

  switch (type) {
    case 'component':
      console.log(chalk.gray(`  1. Import the component: ${chalk.cyan(`import { ${name} } from './components/${name}'`)}`))
      console.log(chalk.gray(`  2. Use it in your app: ${chalk.cyan(`<${name} />`)}`))
      console.log(chalk.gray(`  3. Run tests: ${chalk.cyan(`npm test ${name}`)}`))
      break

    case 'mcp-server':
      console.log(chalk.gray(`  1. Install dependencies: ${chalk.cyan(`cd MCP-SERVERS/${name}-mcp && npm install`)}`))
      console.log(chalk.gray(`  2. Test the server: ${chalk.cyan(`npm test`)}`))
      console.log(chalk.gray(`  3. Add to Claude Code config`))
      break

    case 'integration':
      console.log(chalk.gray(`  1. Add environment variables to ${chalk.cyan(`.env.local`)}`))
      console.log(chalk.gray(`  2. Import the client: ${chalk.cyan(`import { ${name}Client } from './integrations/${name}'`)}`))
      console.log(chalk.gray(`  3. Initialize and use`))
      break

    case 'tool':
      console.log(chalk.gray(`  1. Import the tool: ${chalk.cyan(`import { ${name}Tool } from './tools/${name}'`)}`))
      console.log(chalk.gray(`  2. Add to your agent's tools array`))
      console.log(chalk.gray(`  3. Test the tool`))
      break
  }
}

module.exports = addCommand
