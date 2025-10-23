const chalk = require('chalk')
const ora = require('ora')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const { execa } = require('execa')

/**
 * Setup Command
 *
 * Sets up integrations with full configuration:
 * - supabase: Database + Auth
 * - stripe: Payments + Webhooks
 * - pinecone: Vector DB + RAG
 * - resend: Email sending
 * - anthropic/openai: LLM integration
 */
async function setupCommand(integration, options) {
  console.log(chalk.blue(`\n🔧 Setting up ${chalk.bold(integration)}...\n`))

  try {
    switch (integration.toLowerCase()) {
      case 'supabase':
        await setupSupabase(options)
        break

      case 'stripe':
        await setupStripe(options)
        break

      case 'pinecone':
        await setupPinecone(options)
        break

      case 'weaviate':
        await setupWeaviate(options)
        break

      case 'resend':
        await setupResend(options)
        break

      case 'openai':
        await setupOpenAI(options)
        break

      case 'anthropic':
        await setupAnthropic(options)
        break

      default:
        console.log(chalk.red(`❌ Unknown integration: ${integration}`))
        console.log(chalk.yellow('\nSupported integrations:'))
        console.log(chalk.gray('  - supabase'))
        console.log(chalk.gray('  - stripe'))
        console.log(chalk.gray('  - pinecone'))
        console.log(chalk.gray('  - weaviate'))
        console.log(chalk.gray('  - resend'))
        console.log(chalk.gray('  - openai'))
        console.log(chalk.gray('  - anthropic\n'))
        process.exit(1)
    }

    console.log(chalk.green(`\n✅ Successfully set up ${integration}!\n`))

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`))
    process.exit(1)
  }
}

/**
 * Setup Supabase
 */
async function setupSupabase(options) {
  const spinner = ora('Installing Supabase...').start()

  // Install dependencies
  await execa('npm', ['install', '@supabase/supabase-js'])
  if (options.withAuth) {
    await execa('npm', ['install', '@supabase/auth-helpers-nextjs'])
  }

  spinner.succeed('Supabase installed')

  // Prompt for credentials
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Supabase Project URL:',
      validate: (input) => input.includes('supabase.co') || 'Invalid Supabase URL'
    },
    {
      type: 'password',
      name: 'anonKey',
      message: 'Supabase Anon Key:',
      validate: (input) => input.length > 0 || 'Anon key is required'
    }
  ])

  // Create client file
  const clientCode = `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      // Add your table types here
    }
  }
}
`

  await fs.ensureDir('lib')
  await fs.writeFile('lib/supabase.ts', clientCode)
  console.log(chalk.gray('  Created: lib/supabase.ts'))

  // Add to .env.local
  const envContent = `
# Supabase
NEXT_PUBLIC_SUPABASE_URL=${answers.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${answers.anonKey}
`

  await fs.appendFile(options.env, envContent)
  console.log(chalk.gray(`  Updated: ${options.env}`))

  // Setup auth if requested
  if (options.withAuth) {
    const authCode = `import { supabase } from './supabase'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
`

    await fs.writeFile('lib/auth.ts', authCode)
    console.log(chalk.gray('  Created: lib/auth.ts'))
  }
}

/**
 * Setup Stripe
 */
async function setupStripe(options) {
  const spinner = ora('Installing Stripe...').start()

  await execa('npm', ['install', 'stripe', '@stripe/stripe-js'])

  spinner.succeed('Stripe installed')

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'secretKey',
      message: 'Stripe Secret Key:',
      validate: (input) => input.startsWith('sk_') || 'Invalid Stripe secret key'
    },
    {
      type: 'input',
      name: 'publicKey',
      message: 'Stripe Publishable Key:',
      validate: (input) => input.startsWith('pk_') || 'Invalid Stripe publishable key'
    }
  ])

  // Create Stripe client
  const clientCode = `import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})
`

  await fs.ensureDir('lib')
  await fs.writeFile('lib/stripe.ts', clientCode)
  console.log(chalk.gray('  Created: lib/stripe.ts'))

  // Create checkout session helper
  const checkoutCode = `import { stripe } from './stripe'

export async function createCheckoutSession(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cancel\`,
    metadata: {
      userId
    }
  })

  return session
}
`

  await fs.writeFile('lib/checkout.ts', checkoutCode)
  console.log(chalk.gray('  Created: lib/checkout.ts'))

  // Add to .env.local
  const envContent = `
# Stripe
STRIPE_SECRET_KEY=${answers.secretKey}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${answers.publicKey}
`

  await fs.appendFile(options.env, envContent)
  console.log(chalk.gray(`  Updated: ${options.env}`))
}

/**
 * Setup Pinecone
 */
async function setupPinecone(options) {
  const spinner = ora('Installing Pinecone...').start()

  await execa('npm', ['install', '@pinecone-database/pinecone'])

  if (options.withRag) {
    await execa('npm', ['install', 'langchain', 'openai'])
  }

  spinner.succeed('Pinecone installed')

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Pinecone API Key:',
      validate: (input) => input.length > 0 || 'API key is required'
    },
    {
      type: 'input',
      name: 'environment',
      message: 'Pinecone Environment:',
      default: 'us-east-1-aws'
    },
    {
      type: 'input',
      name: 'indexName',
      message: 'Index name:',
      default: 'documents'
    }
  ])

  // Create Pinecone client
  const clientCode = `import { Pinecone } from '@pinecone-database/pinecone'

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
})

export const index = pinecone.index('${answers.indexName}')
`

  await fs.ensureDir('lib')
  await fs.writeFile('lib/pinecone.ts', clientCode)
  console.log(chalk.gray('  Created: lib/pinecone.ts'))

  // Add RAG setup if requested
  if (options.withRag) {
    const ragCode = `import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { index } from './pinecone'

export async function createVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
  })

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index
  })

  return vectorStore
}

export async function queryDocuments(query: string, topK = 5) {
  const vectorStore = await createVectorStore()
  const results = await vectorStore.similaritySearch(query, topK)
  return results
}
`

    await fs.writeFile('lib/rag.ts', ragCode)
    console.log(chalk.gray('  Created: lib/rag.ts'))
  }

  // Add to .env.local
  const envContent = `
# Pinecone
PINECONE_API_KEY=${answers.apiKey}
PINECONE_ENVIRONMENT=${answers.environment}
PINECONE_INDEX_NAME=${answers.indexName}
`

  await fs.appendFile(options.env, envContent)
  console.log(chalk.gray(`  Updated: ${options.env}`))
}

/**
 * Setup Weaviate
 */
async function setupWeaviate(options) {
  const spinner = ora('Installing Weaviate...').start()

  await execa('npm', ['install', 'weaviate-ts-client'])

  spinner.succeed('Weaviate installed')

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Weaviate URL:',
      default: 'http://localhost:8080'
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'Weaviate API Key (optional):',
      when: (answers) => answers.url.includes('weaviate.cloud')
    }
  ])

  const scheme = answers.url.startsWith('https') ? 'https' : 'http'
  const host = answers.url.replace(/^https?:\/\//, '')

  const clientCode = `import weaviate from 'weaviate-ts-client'

export const client = weaviate.client({
  scheme: '${scheme}',
  host: '${host}',
  ${answers.apiKey ? `apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!)` : ''}
})
`

  await fs.ensureDir('lib')
  await fs.writeFile('lib/weaviate.ts', clientCode)
  console.log(chalk.gray('  Created: lib/weaviate.ts'))

  const envContent = `
# Weaviate
WEAVIATE_URL=${answers.url}
${answers.apiKey ? `WEAVIATE_API_KEY=${answers.apiKey}` : ''}
`

  await fs.appendFile(options.env, envContent)
  console.log(chalk.gray(`  Updated: ${options.env}`))
}

/**
 * Setup Resend
 */
async function setupResend(options) {
  const spinner = ora('Installing Resend...').start()

  await execa('npm', ['install', 'resend'])

  spinner.succeed('Resend installed')

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Resend API Key:',
      validate: (input) => input.startsWith('re_') || 'Invalid Resend API key'
    }
  ])

  const clientCode = `import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    html
  })

  if (error) throw error
  return data
}
`

  await fs.ensureDir('lib')
  await fs.writeFile('lib/email.ts', clientCode)
  console.log(chalk.gray('  Created: lib/email.ts'))

  const envContent = `
# Resend
RESEND_API_KEY=${answers.apiKey}
`

  await fs.appendFile(options.env, envContent)
  console.log(chalk.gray(`  Updated: ${options.env}`))
}

/**
 * Setup OpenAI
 */
async function setupOpenAI(options) {
  const spinner = ora('Installing OpenAI...').start()

  await execa('npm', ['install', 'openai'])

  spinner.succeed('OpenAI installed')

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'OpenAI API Key:',
      validate: (input) => input.startsWith('sk-') || 'Invalid OpenAI API key'
    }
  ])

  const clientCode = `import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateCompletion(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  })

  return completion.choices[0].message.content
}
`

  await fs.ensureDir('lib')
  await fs.writeFile('lib/openai.ts', clientCode)
  console.log(chalk.gray('  Created: lib/openai.ts'))

  const envContent = `
# OpenAI
OPENAI_API_KEY=${answers.apiKey}
`

  await fs.appendFile(options.env, envContent)
  console.log(chalk.gray(`  Updated: ${options.env}`))
}

/**
 * Setup Anthropic
 */
async function setupAnthropic(options) {
  const spinner = ora('Installing Anthropic...').start()

  await execa('npm', ['install', '@anthropic-ai/sdk'])

  spinner.succeed('Anthropic installed')

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Anthropic API Key:',
      validate: (input) => input.startsWith('sk-ant-') || 'Invalid Anthropic API key'
    }
  ])

  const clientCode = `import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function generateMessage(prompt: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })

  return message.content[0].text
}
`

  await fs.ensureDir('lib')
  await fs.writeFile('lib/anthropic.ts', clientCode)
  console.log(chalk.gray('  Created: lib/anthropic.ts'))

  const envContent = `
# Anthropic
ANTHROPIC_API_KEY=${answers.apiKey}
`

  await fs.appendFile(options.env, envContent)
  console.log(chalk.gray(`  Updated: ${options.env}`))
}

module.exports = setupCommand
