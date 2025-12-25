#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * NPX Installer: create-rag-system
 *
 * Usage: npx @ai-dev-standards/create-rag-system my-rag-app
 */

const { execSync } = require('child_process')

const logInfo = (...messages) => {
  const formatted = messages.map(message =>
    typeof message === 'string' ? message : JSON.stringify(message, null, 2)
  )
  process.stdout.write(`${formatted.join(' ')}\n`)
}

const projectName = process.argv[2] || 'my-rag-system'

logInfo(`\n🚀 Creating RAG system: ${projectName}\n`)

// Check if ai-dev CLI is installed
try {
  execSync('ai-dev --version', { stdio: 'ignore' })
} catch (error) {
  logInfo('📦 Installing ai-dev CLI globally...\n')
  execSync('npm install -g @ai-dev-standards/cli', { stdio: 'inherit' })
}

// Run ai-dev init
logInfo('🏗️  Initializing RAG system...\n')
execSync(`ai-dev init rag-system ${projectName} --vector-db pinecone`, {
  stdio: 'inherit',
  cwd: process.cwd()
})

logInfo(`\n✅ Successfully created ${projectName}!\n`)
logInfo('📚 Next steps:\n')
logInfo(`  cd ${projectName}`)
logInfo('  cp .env.example .env.local')
logInfo('  # Add your API keys to .env.local')
logInfo('  npm run ingest  # Ingest your documents')
logInfo('  npm run dev\n')
