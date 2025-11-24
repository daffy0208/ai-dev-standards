const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')
const path = require('path')
const yaml = require('yaml')
const Joi = require('joi')

const ComponentGenerator = require('../generators/component-generator')
const McpGenerator = require('../generators/mcp-generator')
const IntegrationGenerator = require('../generators/integration-generator')

const defaultDeps = {
  chalk,
  ora,
  fs,
  path,
  yaml,
  Joi,
  componentGeneratorFactory: () => new ComponentGenerator(),
  mcpGeneratorFactory: () => new McpGenerator(),
  integrationGeneratorFactory: () => new IntegrationGenerator(),
  exit: code => process.exit(code)
}

function createGenerateCommand(overrides = {}) {
  const deps = { ...defaultDeps, ...overrides }
  return async function runGenerate(options) {
    return generateCommandInternal(options, deps)
  }
}

/**
 * Generate Command
 *
 * Generate multiple artifacts from a YAML config file:
 *
 * Example config (ai-dev.config.yaml):
 * ```yaml
 * components:
 *   - name: Button
 *     props:
 *       variant: ['primary', 'secondary']
 *       size: ['sm', 'md', 'lg']
 *     tests: true
 *     storybook: true
 *
 * integrations:
 *   - name: supabase
 *     withAuth: true
 *
 * mcpServers:
 *   - name: accessibility-checker
 *     template: accessibility-checker
 * ```
 */
async function generateCommandInternal(options, deps) {
  const {
    chalk,
    ora,
    fs,
    path,
    yaml,
    Joi,
    componentGeneratorFactory,
    mcpGeneratorFactory,
    integrationGeneratorFactory,
    exit
  } = deps

  console.log(chalk.blue(`\n🚀 Generating from config: ${chalk.bold(options.config)}\n`))

  try {
    // Read config file
    const configPath = path.resolve(process.cwd(), options.config)
    if (!(await fs.pathExists(configPath))) {
      console.log(chalk.red(`❌ Config file not found: ${options.config}`))
      console.log(
        chalk.yellow(`\nCreate ${chalk.cyan('ai-dev.config.yaml')} with your configuration.`)
      )
      console.log(chalk.gray('\nExample:\n'))
      console.log(chalk.gray('components:'))
      console.log(chalk.gray('  - name: Button'))
      console.log(chalk.gray('    props:'))
      console.log(chalk.gray('      variant: [primary, secondary]'))
      console.log(chalk.gray('    tests: true\n'))
      exit(1)
    }

    const configContent = await fs.readFile(configPath, 'utf8')
    const config = yaml.parse(configContent)

    // Validate config
    const validationError = validateConfig(config, Joi)
    if (validationError) {
      console.log(chalk.red(`❌ Invalid config: ${validationError.message}`))
      exit(1)
    }

    // Dry run?
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 DRY RUN - No files will be created\n'))
      await previewGeneration(config, { chalk })
      return
    }

    // Generate all artifacts
    let totalFiles = 0

    if (config.components) {
      const spinner = ora('Generating components...').start()
      const generator = componentGeneratorFactory()

      for (const componentConfig of config.components) {
        const files = await generator.generate(componentConfig)

        for (const file of files) {
          const filePath = path.join(options.output, file.path)
          await fs.ensureDir(path.dirname(filePath))
          await fs.writeFile(filePath, file.content)
          console.log(chalk.gray(`  Created: ${filePath}`))
          totalFiles++
        }
      }

      spinner.succeed(`Generated ${config.components.length} components`)
    }

    if (config.mcpServers) {
      const spinner = ora('Generating MCP servers...').start()
      const generator = mcpGeneratorFactory()

      for (const mcpConfig of config.mcpServers) {
        const files = await generator.generate(mcpConfig)

        for (const file of files) {
          const filePath = path.join(options.output, file.path)
          await fs.ensureDir(path.dirname(filePath))
          await fs.writeFile(filePath, file.content)
          console.log(chalk.gray(`  Created: ${filePath}`))
          totalFiles++
        }
      }

      spinner.succeed(`Generated ${config.mcpServers.length} MCP servers`)
    }

    if (config.integrations) {
      const spinner = ora('Generating integrations...').start()
      const generator = integrationGeneratorFactory()

      for (const integrationConfig of config.integrations) {
        const files = await generator.generate(integrationConfig)

        for (const file of files) {
          const filePath = path.join(options.output, file.path)
          await fs.ensureDir(path.dirname(filePath))
          await fs.writeFile(filePath, file.content)
          console.log(chalk.gray(`  Created: ${filePath}`))
          totalFiles++
        }
      }

      spinner.succeed(`Generated ${config.integrations.length} integrations`)
    }

    console.log(chalk.green(`\n✅ Successfully generated ${totalFiles} files\n`))
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    if (error.stack) {
      console.error(chalk.gray(error.stack))
    }
    exit(1)
  }
}

/**
 * Validate config schema
 */
function validateConfig(config, JoiInstance) {
  const schema = JoiInstance.object({
    components: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        props: Joi.object().pattern(Joi.string(), Joi.any()),
        tests: Joi.boolean(),
        storybook: Joi.boolean(),
        template: Joi.string()
      })
    ),
    mcpServers: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        template: Joi.string(),
        description: Joi.string(),
        features: Joi.array().items(Joi.string())
      })
    ),
    integrations: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        provider: Joi.string(),
        withAuth: Joi.boolean(),
        withRag: Joi.boolean()
      })
    ),
    tools: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        framework: Joi.string(),
        category: Joi.string()
      })
    )
  })

  const { error } = schema.validate(config)
  return error
}

/**
 * Preview what will be generated
 */
async function previewGeneration(config, deps) {
  const { chalk } = deps
  console.log(chalk.bold('📋 Generation Preview:\n'))

  if (config.components) {
    console.log(chalk.cyan('Components:'))
    for (const comp of config.components) {
      console.log(chalk.gray(`  • ${comp.name}`))
      console.log(chalk.gray(`    - Component file`))
      if (comp.tests) console.log(chalk.gray(`    - Test file`))
      if (comp.storybook) console.log(chalk.gray(`    - Storybook file`))
    }
    console.log()
  }

  if (config.mcpServers) {
    console.log(chalk.cyan('MCP Servers:'))
    for (const mcp of config.mcpServers) {
      console.log(chalk.gray(`  • ${mcp.name}`))
      console.log(chalk.gray(`    - index.js`))
      console.log(chalk.gray(`    - package.json`))
      console.log(chalk.gray(`    - README.md`))
    }
    console.log()
  }

  if (config.integrations) {
    console.log(chalk.cyan('Integrations:'))
    for (const integration of config.integrations) {
      console.log(chalk.gray(`  • ${integration.name}`))
      console.log(chalk.gray(`    - Client file`))
      console.log(chalk.gray(`    - Types file`))
      console.log(chalk.gray(`    - .env.example`))
    }
    console.log()
  }

  console.log(chalk.yellow(`Run without ${chalk.cyan('--dry-run')} to create files.\n`))
}

module.exports = createGenerateCommand()
module.exports.createGenerateCommand = createGenerateCommand
