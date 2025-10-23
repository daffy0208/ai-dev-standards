const fs = require('fs-extra')
const path = require('path')
const prettier = require('prettier')

/**
 * Project Generator
 *
 * Generates complete project starters:
 * - saas-starter: Full SaaS application
 * - rag-system: RAG pipeline
 * - api-service: REST/GraphQL API
 * - dashboard: Analytics dashboard
 * - mobile-app: React Native app
 */
class ProjectGenerator {
  async generate(config) {
    const { type, name, ...options } = config

    const projectPath = path.join(process.cwd(), name)

    // Create project directory
    await fs.ensureDir(projectPath)

    switch (type) {
      case 'saas-starter':
      case 'saas':
        await this.generateSaasStarter(projectPath, name, options)
        break

      case 'rag-system':
      case 'rag':
        await this.generateRagSystem(projectPath, name, options)
        break

      case 'api-service':
      case 'api':
        await this.generateApiService(projectPath, name, options)
        break

      case 'dashboard':
        await this.generateDashboard(projectPath, name, options)
        break

      case 'mobile-app':
      case 'mobile':
        await this.generateMobileApp(projectPath, name, options)
        break

      default:
        throw new Error(`Unknown project type: ${type}`)
    }

    return projectPath
  }

  /**
   * Generate SaaS Starter
   */
  async generateSaasStarter(projectPath, name, options) {
    const { auth = 'supabase', payments = 'stripe', email = 'resend', features = [] } = options

    // package.json
    await this.writeFile(projectPath, 'package.json', JSON.stringify({
      "name": name,
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "test": "jest"
      },
      "dependencies": {
        "next": "14.0.4",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "@supabase/supabase-js": auth === 'supabase' ? "^2.38.4" : undefined,
        "stripe": payments === 'stripe' ? "^14.8.0" : undefined,
        "resend": email === 'resend' ? "^2.0.0" : undefined,
        "zod": "^3.22.4",
        "tailwindcss": "^3.3.6"
      },
      "devDependencies": {
        "typescript": "^5.3.3",
        "@types/node": "^20.10.5",
        "@types/react": "^18.2.45",
        "jest": "^29.7.0",
        "eslint": "^8.55.0"
      }
    }, null, 2))

    // tsconfig.json
    await this.writeFile(projectPath, 'tsconfig.json', JSON.stringify({
      "compilerOptions": {
        "target": "ES2020",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "jsx": "preserve",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "allowJs": true,
        "strict": true,
        "noEmit": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "paths": {
          "@/*": ["./*"]
        }
      },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      "exclude": ["node_modules"]
    }, null, 2))

    // next.config.js
    await this.writeFile(projectPath, 'next.config.js', `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
`)

    // tailwind.config.js
    await this.writeFile(projectPath, 'tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`)

    // .env.example
    const envContent = `# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

${auth === 'supabase' ? `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
` : ''}

${payments === 'stripe' ? `# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
` : ''}

${email === 'resend' ? `# Resend
RESEND_API_KEY=your-resend-api-key
` : ''}
`
    await this.writeFile(projectPath, '.env.example', envContent)

    // app/layout.tsx
    await this.writeFile(projectPath, 'app/layout.tsx', `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${name}',
  description: 'Full-stack SaaS application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`)

    // app/page.tsx
    await this.writeFile(projectPath, 'app/page.tsx', `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">${name}</h1>
      <p className="text-gray-600">Your SaaS application is ready!</p>
    </main>
  )
}
`)

    // app/globals.css
    await this.writeFile(projectPath, 'app/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;
`)

    // README.md
    await this.writeFile(projectPath, 'README.md', `# ${name}

Full-stack SaaS application built with:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ${auth} (Authentication)
- ${payments} (Payments)
- ${email} (Email)

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Copy environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

3. Fill in your API keys in \`.env.local\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Features

${features.includes('landing') ? '- Landing page' : ''}
${features.includes('blog') ? '- Blog (MDX)' : ''}
${features.includes('admin') ? '- Admin dashboard' : ''}
${features.includes('settings') ? '- User settings' : ''}
${features.includes('teams') ? '- Team management' : ''}
${features.includes('api') ? '- API endpoints' : ''}

## Deployment

Deploy to Vercel:
\`\`\`bash
vercel
\`\`\`
`)
  }

  /**
   * Generate RAG System
   */
  async generateRagSystem(projectPath, name, options) {
    const { vectorDb = 'pinecone', llmProvider = 'openai', framework = 'langchain', features = [] } = options

    // package.json
    await this.writeFile(projectPath, 'package.json', JSON.stringify({
      "name": name,
      "version": "0.1.0",
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "ingest": "tsx scripts/ingest.ts",
        "query": "tsx scripts/query.ts"
      },
      "dependencies": {
        "next": "14.0.4",
        "react": "^18.2.0",
        "langchain": framework === 'langchain' ? "^0.1.0" : undefined,
        "@pinecone-database/pinecone": vectorDb === 'pinecone' ? "^1.1.3" : undefined,
        "openai": llmProvider === 'openai' ? "^4.20.1" : undefined,
        "@anthropic-ai/sdk": llmProvider === 'anthropic' ? "^0.9.1" : undefined,
        "pdf-parse": "^1.1.1"
      },
      "devDependencies": {
        "typescript": "^5.3.3",
        "tsx": "^4.7.0"
      }
    }, null, 2))

    // .env.example
    const envContent = `# Vector Database
${vectorDb.toUpperCase()}_API_KEY=your-api-key
${vectorDb === 'pinecone' ? 'PINECONE_INDEX_NAME=documents\n' : ''}

# LLM Provider
${llmProvider.toUpperCase()}_API_KEY=your-api-key
`
    await this.writeFile(projectPath, '.env.example', envContent)

    // scripts/ingest.ts
    await this.writeFile(projectPath, 'scripts/ingest.ts', `import { readFile } from 'fs/promises'
import { createVectorStore, ingestDocument } from '../lib/rag'

async function main() {
  console.log('Starting document ingestion...')

  // TODO: Add your documents here
  const documents = [
    { path: './docs/document1.txt', metadata: { source: 'document1' } }
  ]

  for (const doc of documents) {
    console.log(\`Ingesting \${doc.path}...\`)
    const content = await readFile(doc.path, 'utf-8')
    await ingestDocument(content, doc.metadata)
  }

  console.log('Ingestion complete!')
}

main()
`)

    // lib/rag.ts
    await this.writeFile(projectPath, 'lib/rag.ts', `import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
})

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

export async function createVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
  })

  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index
  })
}

export async function ingestDocument(content: string, metadata: any) {
  const vectorStore = await createVectorStore()
  await vectorStore.addDocuments([{ pageContent: content, metadata }])
}

export async function queryDocuments(query: string, topK = 5) {
  const vectorStore = await createVectorStore()
  return await vectorStore.similaritySearch(query, topK)
}
`)

    // README.md
    await this.writeFile(projectPath, 'README.md', `# ${name}

RAG System built with:
- ${framework}
- ${vectorDb} (Vector Database)
- ${llmProvider} (LLM)

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Configure environment:
\`\`\`bash
cp .env.example .env.local
\`\`\`

3. Ingest documents:
\`\`\`bash
npm run ingest
\`\`\`

4. Query:
\`\`\`bash
npm run query
\`\`\`

## Features

${features.includes('ingestion') ? '- Document ingestion pipeline' : ''}
${features.includes('conversational') ? '- Conversational retrieval' : ''}
${features.includes('hybrid') ? '- Hybrid search' : ''}
${features.includes('citations') ? '- Citation tracking' : ''}
${features.includes('ui') ? '- Web UI' : ''}
`)
  }

  /**
   * Generate API Service (placeholder for other types)
   */
  async generateApiService(projectPath, name, options) {
    // TODO: Implement full API service generator
    await this.writeFile(projectPath, 'README.md', `# ${name}\n\nAPI Service - Coming soon!`)
  }

  async generateDashboard(projectPath, name, options) {
    // TODO: Implement dashboard generator
    await this.writeFile(projectPath, 'README.md', `# ${name}\n\nDashboard - Coming soon!`)
  }

  async generateMobileApp(projectPath, name, options) {
    // TODO: Implement mobile app generator
    await this.writeFile(projectPath, 'README.md', `# ${name}\n\nMobile App - Coming soon!`)
  }

  /**
   * Helper: Write file
   */
  async writeFile(basePath, filePath, content) {
    const fullPath = path.join(basePath, filePath)
    await fs.ensureDir(path.dirname(fullPath))
    await fs.writeFile(fullPath, content)
  }
}

module.exports = ProjectGenerator
