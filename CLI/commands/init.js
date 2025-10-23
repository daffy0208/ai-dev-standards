const chalk = require('chalk')
const ora = require('ora')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')

const ProjectGenerator = require('../generators/project-generator')

/**
 * Init Command
 *
 * Initialize complete projects from templates:
 * - saas-starter: Full SaaS with auth, payments, email
 * - rag-system: RAG pipeline with vector DB
 * - api-service: REST/GraphQL API
 * - dashboard: Analytics dashboard
 * - mobile-app: React Native app
 */
async function initCommand(projectType, projectName, options) {
  console.log(chalk.blue(`\n🚀 Initializing ${projectType}: ${chalk.bold(projectName || 'my-project')}\n`))

  const name = projectName || `my-${projectType}`

  try {
    // Ask for project configuration
    const config = await promptProjectConfig(projectType, options)

    // Generate project
    const spinner = ora('Generating project...').start()
    const generator = new ProjectGenerator()
    const projectPath = await generator.generate({
      type: projectType,
      name,
      ...config
    })
    spinner.succeed('Project generated')

    // Install dependencies
    if (!options.skipInstall) {
      const installSpinner = ora('Installing dependencies...').start()
      try {
        await execa('npm', ['install'], { cwd: projectPath })
        installSpinner.succeed('Dependencies installed')
      } catch (error) {
        installSpinner.fail('Failed to install dependencies')
        console.log(chalk.yellow(`\nRun: ${chalk.cyan(`cd ${name} && npm install`)}`))
      }
    }

    // Initialize git
    if (!options.skipGit) {
      const gitSpinner = ora('Initializing git...').start()
      try {
        await execa('git', ['init'], { cwd: projectPath })
        await execa('git', ['add', '.'], { cwd: projectPath })
        await execa('git', ['commit', '-m', 'Initial commit from ai-dev CLI'], { cwd: projectPath })
        gitSpinner.succeed('Git initialized')
      } catch (error) {
        gitSpinner.warn('Git initialization skipped')
      }
    }

    console.log(chalk.green(`\n✅ Successfully initialized ${projectType}: ${chalk.bold(name)}\n`))

    // Show next steps
    showNextSteps(projectType, name, config)

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Prompt for project configuration
 */
async function promptProjectConfig(projectType, options) {
  const config = {}

  switch (projectType) {
    case 'saas-starter':
    case 'saas':
      return await promptSaasConfig(options)

    case 'rag-system':
    case 'rag':
      return await promptRagConfig(options)

    case 'api-service':
    case 'api':
      return await promptApiConfig(options)

    case 'dashboard':
      return await promptDashboardConfig(options)

    case 'mobile-app':
    case 'mobile':
      return await promptMobileConfig(options)

    default:
      console.log(chalk.yellow(`\n⚠️  Unknown project type: ${projectType}`))
      console.log(chalk.gray('Available types: saas-starter, rag-system, api-service, dashboard, mobile-app\n'))
      process.exit(1)
  }
}

/**
 * SaaS Starter Config
 */
async function promptSaasConfig(options) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'auth',
      message: 'Authentication provider:',
      choices: ['supabase', 'clerk', 'auth0', 'none'],
      default: options.auth || 'supabase'
    },
    {
      type: 'list',
      name: 'payments',
      message: 'Payment provider:',
      choices: ['stripe', 'paddle', 'lemon-squeezy', 'none'],
      default: options.payments || 'stripe',
      when: (answers) => answers.auth !== 'none'
    },
    {
      type: 'list',
      name: 'email',
      message: 'Email provider:',
      choices: ['resend', 'postmark', 'sendgrid', 'none'],
      default: options.email || 'resend'
    },
    {
      type: 'list',
      name: 'analytics',
      message: 'Analytics provider:',
      choices: ['posthog', 'mixpanel', 'amplitude', 'none'],
      default: options.analytics || 'posthog'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Additional features:',
      choices: [
        { name: 'Landing page', value: 'landing', checked: true },
        { name: 'Blog (MDX)', value: 'blog', checked: false },
        { name: 'Admin dashboard', value: 'admin', checked: true },
        { name: 'User settings', value: 'settings', checked: true },
        { name: 'Team management', value: 'teams', checked: false },
        { name: 'API endpoints', value: 'api', checked: true }
      ]
    }
  ])

  return answers
}

/**
 * RAG System Config
 */
async function promptRagConfig(options) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'vectorDb',
      message: 'Vector database:',
      choices: ['pinecone', 'weaviate', 'qdrant', 'chroma', 'pgvector'],
      default: options.vectorDb || 'pinecone'
    },
    {
      type: 'list',
      name: 'llmProvider',
      message: 'LLM provider:',
      choices: ['openai', 'anthropic', 'together', 'local'],
      default: 'openai'
    },
    {
      type: 'list',
      name: 'framework',
      message: 'RAG framework:',
      choices: ['langchain', 'llamaindex', 'custom'],
      default: 'langchain'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Features:',
      choices: [
        { name: 'Document ingestion pipeline', value: 'ingestion', checked: true },
        { name: 'Conversational retrieval', value: 'conversational', checked: true },
        { name: 'Hybrid search (dense + sparse)', value: 'hybrid', checked: false },
        { name: 'Citation tracking', value: 'citations', checked: true },
        { name: 'Multi-query generation', value: 'multi-query', checked: false },
        { name: 'Web UI', value: 'ui', checked: true }
      ]
    }
  ])

  return answers
}

/**
 * API Service Config
 */
async function promptApiConfig(options) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'API type:',
      choices: ['rest', 'graphql', 'trpc'],
      default: 'rest'
    },
    {
      type: 'list',
      name: 'database',
      message: 'Database:',
      choices: ['postgresql', 'mysql', 'mongodb', 'none'],
      default: 'postgresql'
    },
    {
      type: 'list',
      name: 'orm',
      message: 'ORM/Query builder:',
      choices: ['prisma', 'drizzle', 'typeorm', 'none'],
      default: 'prisma',
      when: (answers) => answers.database !== 'none'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Features:',
      choices: [
        { name: 'Authentication (JWT)', value: 'auth', checked: true },
        { name: 'Rate limiting', value: 'rate-limit', checked: true },
        { name: 'API documentation (Swagger)', value: 'docs', checked: true },
        { name: 'Request validation', value: 'validation', checked: true },
        { name: 'Error tracking (Sentry)', value: 'error-tracking', checked: false },
        { name: 'Background jobs', value: 'jobs', checked: false }
      ]
    }
  ])

  return answers
}

/**
 * Dashboard Config
 */
async function promptDashboardConfig(options) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'chartLibrary',
      message: 'Chart library:',
      choices: ['recharts', 'chart.js', 'd3', 'plotly'],
      default: 'recharts'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Features:',
      choices: [
        { name: 'Real-time updates', value: 'realtime', checked: true },
        { name: 'Data export (CSV/PDF)', value: 'export', checked: true },
        { name: 'Custom date ranges', value: 'date-ranges', checked: true },
        { name: 'User filters', value: 'filters', checked: true },
        { name: 'Shareable reports', value: 'sharing', checked: false }
      ]
    }
  ])

  return answers
}

/**
 * Mobile App Config
 */
async function promptMobileConfig(options) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Framework:',
      choices: ['expo', 'react-native-cli'],
      default: 'expo'
    },
    {
      type: 'list',
      name: 'navigation',
      message: 'Navigation:',
      choices: ['expo-router', 'react-navigation'],
      default: 'expo-router'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Features:',
      choices: [
        { name: 'Authentication', value: 'auth', checked: true },
        { name: 'Push notifications', value: 'notifications', checked: true },
        { name: 'Offline support', value: 'offline', checked: false },
        { name: 'Camera/Photos', value: 'camera', checked: false },
        { name: 'Location services', value: 'location', checked: false }
      ]
    }
  ])

  return answers
}

/**
 * Show Next Steps
 */
function showNextSteps(projectType, name, config) {
  console.log(chalk.bold('📚 Next Steps:\n'))

  console.log(chalk.gray(`  1. ${chalk.cyan(`cd ${name}`)}`))

  if (projectType === 'saas-starter' || projectType === 'saas') {
    console.log(chalk.gray(`  2. Copy ${chalk.cyan(`.env.example`)} to ${chalk.cyan(`.env.local`)}`))
    if (config.auth !== 'none') {
      console.log(chalk.gray(`  3. Add ${chalk.cyan(config.auth.toUpperCase())} credentials to .env.local`))
    }
    if (config.payments !== 'none') {
      console.log(chalk.gray(`  4. Add ${chalk.cyan(config.payments.toUpperCase())} keys to .env.local`))
    }
    console.log(chalk.gray(`  5. ${chalk.cyan(`npm run dev`)}`))
    console.log(chalk.gray(`  6. Open ${chalk.cyan(`http://localhost:3000`)}`))
  } else if (projectType === 'rag-system' || projectType === 'rag') {
    console.log(chalk.gray(`  2. Add API keys to ${chalk.cyan(`.env.local`)}:`))
    console.log(chalk.gray(`     - ${config.vectorDb.toUpperCase()}_API_KEY`))
    console.log(chalk.gray(`     - ${config.llmProvider.toUpperCase()}_API_KEY`))
    console.log(chalk.gray(`  3. ${chalk.cyan(`npm run ingest`)} - Ingest your documents`))
    console.log(chalk.gray(`  4. ${chalk.cyan(`npm run dev`)} - Start the server`))
    console.log(chalk.gray(`  5. Test queries at ${chalk.cyan(`http://localhost:3000`)}`))
  } else {
    console.log(chalk.gray(`  2. ${chalk.cyan(`npm run dev`)}`))
    console.log(chalk.gray(`  3. Open ${chalk.cyan(`http://localhost:3000`)}`))
  }

  console.log(chalk.bold(`\n🎉 Your ${projectType} is ready! Happy coding!\n`))
}

module.exports = initCommand
