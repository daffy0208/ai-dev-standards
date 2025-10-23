# CLI Quick Start Guide

Get started with the `ai-dev` CLI in 5 minutes!

## Installation

```bash
npm install -g @ai-dev-standards/cli
```

Or use NPX (no installation needed):

```bash
npx @ai-dev-standards/cli --help
```

## Your First Component

```bash
ai-dev add component Button \
  --props "variant,size,onClick" \
  --with-tests \
  --with-storybook
```

This creates:
- ✅ `Button.tsx` - Component with Zod validation
- ✅ `Button.test.tsx` - Tests with React Testing Library
- ✅ `Button.stories.tsx` - Storybook stories
- ✅ `index.ts` - Export file

**Result:** Production-ready component in 5 seconds!

## Your First Project

### Create a SaaS Application

```bash
# One command creates everything!
npx @ai-dev-standards/create-saas my-startup

# What you get:
# ✅ Next.js 14 + TypeScript
# ✅ Supabase authentication
# ✅ Stripe payments
# ✅ Resend email
# ✅ Landing page
# ✅ Dashboard
# ✅ Complete, working app!
```

### Create a RAG System

```bash
npx @ai-dev-standards/create-rag-system docs-qa

# What you get:
# ✅ Pinecone vector database
# ✅ OpenAI embeddings
# ✅ LangChain RAG pipeline
# ✅ Document ingestion scripts
# ✅ Query interface
# ✅ Ready to use!
```

## Common Commands

### Add Components

```bash
# Basic component
ai-dev add component Card

# With props
ai-dev add component UserProfile --props "name,email,avatar"

# With everything
ai-dev add component DataTable \
  --props "data,columns,onSort" \
  --with-tests \
  --with-storybook
```

### Add MCP Servers

```bash
# Accessibility checker
ai-dev add mcp-server accessibility-checker

# Custom MCP
ai-dev add mcp-server my-custom-mcp
```

### Add Integrations

```bash
# Supabase with auth
ai-dev setup supabase --with-auth

# Stripe
ai-dev setup stripe

# Pinecone with RAG
ai-dev setup pinecone --with-rag
```

### Generate from Config

Create `ai-dev.config.yaml`:

```yaml
components:
  - name: Button
    props:
      variant: [primary, secondary]
    tests: true

  - name: Card
    props:
      title: string
      description: string
    tests: true

integrations:
  - name: supabase
    withAuth: true
```

Then run:

```bash
ai-dev generate
# ✅ Generates all components and integrations!
```

## Check Project Health

```bash
# Analyze project
ai-dev analyze

# Check health
ai-dev doctor

# Auto-fix issues
ai-dev doctor --fix-all
```

## Real-World Workflow

### Scenario: Build a SaaS Dashboard

```bash
# 1. Create project
ai-dev init saas-starter dashboard-app \
  --auth supabase \
  --payments stripe

# 2. Add components
cd dashboard-app
ai-dev add component DashboardCard --with-tests
ai-dev add component ChartWidget --with-tests
ai-dev add component UserTable --with-tests

# 3. Setup integrations
ai-dev setup posthog  # Analytics

# 4. Check health
ai-dev doctor

# 5. Run
npm run dev

# ✅ Complete dashboard in 5 minutes!
```

### Scenario: Add AI Features

```bash
# 1. Setup vector database
ai-dev setup pinecone --with-rag

# 2. Add AI tools
ai-dev add tool semantic-search --framework langchain
ai-dev add tool document-qa --framework langchain

# 3. Add MCP server
ai-dev add mcp-server ai-assistant

# ✅ AI-powered features added!
```

## Tips & Tricks

### Tip 1: Dry Run

Preview what will be generated:

```bash
ai-dev generate --config ai-dev.config.yaml --dry-run
```

### Tip 2: Batch Generation

Create multiple things at once with a config file:

```yaml
components:
  - name: Button
  - name: Card
  - name: Modal
  - name: Table
  - name: Form
```

```bash
ai-dev generate  # Creates all 5 components!
```

### Tip 3: Project Analysis

Get recommendations for your project:

```bash
ai-dev analyze --report report.json
```

### Tip 4: Auto-Fix Everything

```bash
ai-dev doctor --fix-all
ai-dev analyze --fix
```

## Troubleshooting

### Command not found

```bash
# Install globally
npm install -g @ai-dev-standards/cli

# Or use NPX
npx @ai-dev-standards/cli add component Button
```

### Permission errors

```bash
# On macOS/Linux
sudo npm install -g @ai-dev-standards/cli

# Or use NPX (no sudo needed)
npx @ai-dev-standards/cli add component Button
```

### Generated code has errors

Check your Node.js version:

```bash
node --version
# Should be >= 18.0.0

# Check health
ai-dev doctor
```

## Next Steps

1. **Read the full docs:** [CLI/README.md](../CLI/README.md)
2. **Try the examples:** Generate a complete SaaS or RAG system
3. **Explore skills:** Check out [SKILLS/](../SKILLS/) for patterns
4. **Join the community:** Share your generated projects!

## ADHD-Friendly Reminders

- ✅ **One command does everything** - No multi-step processes
- ✅ **Instant results** - See working code immediately
- ✅ **Auto-fix** - Use `--fix-all` to repair issues
- ✅ **Smart defaults** - No configuration needed

**Just type the command and let AI Dev do the rest!** 🚀
