#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * NPX Installer: create-saas
 *
 * Usage: npx @ai-dev-standards/create-saas my-app
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const logInfo = (...messages) => {
  const formatted = messages.map(message =>
    typeof message === 'string' ? message : JSON.stringify(message, null, 2)
  )
  process.stdout.write(`${formatted.join(' ')}\n`)
}

const projectName = process.argv[2] || 'my-saas-app'

logInfo(`\n🚀 Creating SaaS application: ${projectName}\n`)

// Check if ai-dev CLI is installed
let hasAiDevCLI = false
try {
  execSync('ai-dev --version', { stdio: 'ignore' })
  hasAiDevCLI = true
} catch (error) {
  logInfo('📦 Installing ai-dev CLI globally...\n')
  execSync('npm install -g @ai-dev-standards/cli', { stdio: 'inherit' })
}

// Run ai-dev init
logInfo('🏗️  Initializing SaaS starter...\n')
execSync(
  `ai-dev init saas-starter ${projectName} --auth supabase --payments stripe --email resend`,
  {
    stdio: 'inherit',
    cwd: process.cwd()
  }
)

logInfo(`\n✅ Successfully created ${projectName}!\n`)
logInfo('📚 Next steps:\n')
logInfo(`  cd ${projectName}`)
logInfo('  cp .env.example .env.local')
logInfo('  # Add your API keys to .env.local')
logInfo('  npm run dev\n')
