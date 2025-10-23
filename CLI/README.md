# AI Dev CLI

**Automatically generate production-ready code with one command!**

No more copy-pasting. No more manual setup. Just instant, working code.

## 🎯 What This Does

The `ai-dev` CLI automatically generates:

- 🧩 **React components** with tests + Storybook
- 🔧 **MCP servers** with full implementations
- 🔌 **API integrations** with TypeScript types
- 🛠️ **Agent tools** for LangChain/CrewAI
- 🚀 **Complete projects** ready to deploy

**ADHD-friendly:** One command does everything. No configuration needed.

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @ai-dev-standards/cli
```

### Quick Start (NPX)

```bash
# Create complete projects instantly
npx @ai-dev-standards/create-saas my-app
npx @ai-dev-standards/create-rag-system docs-qa

# Or use the CLI directly
npx @ai-dev-standards/cli add component Button
```

## 🚀 Quick Start

### Add a Component

```bash
ai-dev add component Button --with-tests --with-storybook --props "variant,size,onClick"
```

Creates:
```
components/Button/
├── Button.tsx          # Component with Zod validation
├── Button.test.tsx     # Jest + React Testing Library tests
├── Button.stories.tsx  # Storybook stories
└── index.ts            # Exports
```

### Create a Complete SaaS App

```bash
ai-dev init saas-starter my-app \
  --auth supabase \
  --payments stripe \
  --email resend \
  --analytics posthog
```

Creates a **complete, working SaaS** with:
- ✅ Authentication (Supabase)
- ✅ Payments (Stripe)
- ✅ Email (Resend)
- ✅ Analytics (Posthog)
- ✅ Landing page
- ✅ Admin dashboard
- ✅ User settings
- ✅ API endpoints

### Add an MCP Server

```bash
ai-dev add mcp-server accessibility-checker
```

Creates:
```
MCP-SERVERS/accessibility-checker-mcp/
├── index.js         # Full MCP server implementation
├── package.json     # Dependencies configured
├── README.md        # Setup instructions
└── .env.example     # Environment variables
```

### Setup an Integration

```bash
ai-dev setup supabase --with-auth
```

Creates:
```
lib/
├── supabase.ts      # Supabase client
└── auth.ts          # Auth functions (signIn, signUp, signOut)
```

## 📚 Commands

### `ai-dev add`

Add components, MCP servers, integrations, or tools.

```bash
# Add component
ai-dev add component Card --props "title,description,image"

# Add MCP server
ai-dev add mcp-server screenshot-testing

# Add integration
ai-dev add integration stripe --with-webhooks

# Add tool
ai-dev add tool web-search --framework langchain
```

### `ai-dev init`

Initialize complete projects from scratch.

```bash
# SaaS starter
ai-dev init saas-starter my-app

# RAG system
ai-dev init rag-system docs-qa --vector-db pinecone

# API service
ai-dev init api-service my-api --database postgresql

# Dashboard
ai-dev init dashboard analytics-dashboard

# Mobile app
ai-dev init mobile-app my-mobile-app
```

### `ai-dev generate`

Generate from YAML config file.

```yaml
# ai-dev.config.yaml
components:
  - name: Button
    props:
      variant: [primary, secondary]
      size: [sm, md, lg]
    tests: true
    storybook: true

  - name: Card
    props:
      title: string
      description: string
    tests: true

integrations:
  - name: supabase
    provider: supabase
    withAuth: true
```

```bash
ai-dev generate --config ai-dev.config.yaml
```

### `ai-dev analyze`

Analyze your project and get recommendations.

```bash
# Analyze project
ai-dev analyze

# Auto-fix issues
ai-dev analyze --fix

# Save report
ai-dev analyze --report analysis.json
```

Checks for:
- ❌ Missing tests
- ❌ Security vulnerabilities
- ❌ Accessibility issues
- ❌ Performance problems
- ❌ Unused dependencies

### `ai-dev doctor`

Check project health.

```bash
# Check health
ai-dev doctor

# Auto-fix all issues
ai-dev doctor --fix-all

# Verbose output
ai-dev doctor --verbose
```

Checks:
- ✅ Node.js version
- ✅ Dependencies installed
- ✅ Git initialized
- ✅ Environment variables
- ✅ TypeScript configuration
- ✅ Linting setup

### `ai-dev setup`

Setup integrations with full configuration.

```bash
# Setup Supabase with auth
ai-dev setup supabase --with-auth

# Setup Pinecone with RAG
ai-dev setup pinecone --with-rag

# Setup Stripe
ai-dev setup stripe

# Setup Resend
ai-dev setup resend
```

## 🎨 Examples

### Example 1: Build a SaaS in 2 Minutes

```bash
# 1. Create SaaS
npx @ai-dev-standards/create-saas my-startup

# 2. Add environment variables
cd my-startup
cp .env.example .env.local
# Fill in your API keys

# 3. Run
npm run dev

# ✅ Complete SaaS with auth, payments, email running!
```

### Example 2: Generate Multiple Components

```yaml
# components.yaml
components:
  - name: Button
    props:
      variant: [primary, secondary, outline]
      size: [sm, md, lg]
    tests: true
    storybook: true

  - name: Card
    props:
      title: string
      description: string
      image: string
    tests: true

  - name: Modal
    props:
      isOpen: boolean
      onClose: function
    tests: true
    storybook: true
```

```bash
ai-dev generate --config components.yaml
# ✅ Creates all 3 components with tests!
```

### Example 3: Add RAG to Existing Project

```bash
# 1. Setup vector database
ai-dev setup pinecone --with-rag

# 2. Creates:
#    - lib/pinecone.ts (Pinecone client)
#    - lib/rag.ts (RAG functions)
#    - .env.local (with PINECONE_API_KEY)

# 3. Use it
import { queryDocuments } from './lib/rag'

const results = await queryDocuments('What is RAG?')
```

### Example 4: Generate MCP Server

```bash
ai-dev add mcp-server custom-checker

# Creates working MCP server with:
# - Tools, Resources, Prompts
# - Full implementation
# - Ready to use with Claude Code
```

## 🎯 Use Cases

### For SaaS Builders

```bash
# Complete SaaS stack
ai-dev init saas-starter my-saas \
  --auth supabase \
  --payments stripe \
  --email resend
```

### For AI Developers

```bash
# RAG system
ai-dev init rag-system docs-qa --vector-db pinecone

# Add tools
ai-dev add tool document-search --framework langchain
```

### For Frontend Developers

```bash
# Components
ai-dev add component Button --with-storybook
ai-dev add component Card
ai-dev add component Modal

# Generate from config
ai-dev generate --config components.yaml
```

### For API Developers

```bash
# API service
ai-dev init api-service my-api \
  --type rest \
  --database postgresql \
  --orm prisma
```

## 🔧 Configuration

### Config File: `ai-dev.config.yaml`

```yaml
# Generate components
components:
  - name: Button
    props:
      variant: [primary, secondary]
    tests: true

# Generate MCPs
mcpServers:
  - name: accessibility-checker
    template: accessibility-checker
    features: [tools]

# Generate integrations
integrations:
  - name: supabase
    provider: supabase
    withAuth: true

# Generate tools
tools:
  - name: web-search
    framework: langchain
    category: data-retrieval
```

## 🧠 ADHD-Friendly Features

**Why this CLI is perfect for ADHD developers:**

✅ **One command does everything** - No multi-step processes
✅ **Instant results** - See working code immediately
✅ **No configuration needed** - Smart defaults
✅ **Auto-detects what you need** - `ai-dev doctor` finds missing pieces
✅ **Auto-fixes issues** - `--fix-all` repairs problems
✅ **Clear next steps** - Shows exactly what to do next

Example workflow:
```bash
# 1. Create project (1 command)
npx @ai-dev-standards/create-saas my-app

# 2. Run it (1 command)
cd my-app && npm run dev

# ✅ Working SaaS in 2 commands!
```

## 📖 Documentation

- [Full Documentation](https://github.com/ai-dev-standards/cli/docs)
- [Examples](https://github.com/ai-dev-standards/cli/examples)
- [API Reference](https://github.com/ai-dev-standards/cli/api)

## 🤝 Contributing

```bash
# Clone repo
git clone https://github.com/ai-dev-standards/cli

# Install dependencies
npm install

# Run locally
npm link
ai-dev --help
```

## 📝 License

MIT

## 🎉 Summary

**Before:**
```bash
# Manual component creation
mkdir -p components/Button
touch components/Button/Button.tsx
touch components/Button/Button.test.tsx
touch components/Button/Button.stories.tsx
touch components/Button/index.ts
# ... spend 30 minutes writing code
```

**After:**
```bash
ai-dev add component Button --with-tests --with-storybook
# ✅ Done in 5 seconds!
```

**Stop copying. Start generating!** 🚀
