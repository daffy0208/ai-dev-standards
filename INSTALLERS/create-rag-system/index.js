#!/usr/bin/env node

/**
 * NPX Installer: create-rag-system
 *
 * Usage: npx @ai-dev-standards/create-rag-system my-rag-app
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process')

const projectName = process.argv[2] || 'my-rag-system'

console.log(`\n🚀 Creating RAG system: ${projectName}\n`)

// Check if ai-dev CLI is installed
try {
  execSync('ai-dev --version', { stdio: 'ignore' })
} catch (error) {
  console.log('📦 Installing ai-dev CLI globally...\n')
  execSync('npm install -g @ai-dev-standards/cli', { stdio: 'inherit' })
}

// Run ai-dev init
console.log('🏗️  Initializing RAG system...\n')
execSync(`ai-dev init rag-system ${projectName} --vector-db pinecone`, {
  stdio: 'inherit',
  cwd: process.cwd()
})

console.log(`\n✅ Successfully created ${projectName}!\n`)
console.log('📚 Next steps:\n')
console.log(`  cd ${projectName}`)
console.log('  cp .env.example .env.local')
console.log('  # Add your API keys to .env.local')
console.log('  npm run ingest  # Ingest your documents')
console.log('  npm run dev\n')
