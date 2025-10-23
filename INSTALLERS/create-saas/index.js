#!/usr/bin/env node

/**
 * NPX Installer: create-saas
 *
 * Usage: npx @ai-dev-standards/create-saas my-app
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const projectName = process.argv[2] || 'my-saas-app'

console.log(`\n🚀 Creating SaaS application: ${projectName}\n`)

// Check if ai-dev CLI is installed
let hasAiDevCLI = false
try {
  execSync('ai-dev --version', { stdio: 'ignore' })
  hasAiDevCLI = true
} catch (error) {
  console.log('📦 Installing ai-dev CLI globally...\n')
  execSync('npm install -g @ai-dev-standards/cli', { stdio: 'inherit' })
}

// Run ai-dev init
console.log('🏗️  Initializing SaaS starter...\n')
execSync(`ai-dev init saas-starter ${projectName} --auth supabase --payments stripe --email resend`, {
  stdio: 'inherit',
  cwd: process.cwd()
})

console.log(`\n✅ Successfully created ${projectName}!\n`)
console.log('📚 Next steps:\n')
console.log(`  cd ${projectName}`)
console.log('  cp .env.example .env.local')
console.log('  # Add your API keys to .env.local')
console.log('  npm run dev\n')
