# Project Installers

**Automated setup scripts** for quickly bootstrapping ai-dev-standards in your projects.

---

## Available Installers

### 1. bootstrap
**Purpose:** Complete ai-dev-standards setup in any project

**What It Installs:**
- ✅ All 36 skills
- ✅ All 3 MCPs (with more coming)
- ✅ Selected components
- ✅ Common integrations
- ✅ Config files (.cursorrules, .gitignore, etc.)
- ✅ Project structure (.ai-dev/, .claude/)

**When to Use:**
- Starting a new project
- Adding ai-dev-standards to existing project
- Want full feature set

**Usage:**
```bash
npx @ai-dev-standards/bootstrap
```

**What It Creates:**
```
your-project/
├── .ai-dev/
│   ├── skills/           # All 36 skills
│   ├── mcps/             # All MCPs
│   ├── components/       # Selected components
│   └── integrations/     # Selected integrations
├── .claude/
│   ├── claude.md         # Skill references
│   └── mcp-settings.json # MCP configuration
├── .cursorrules          # AI assistant rules
├── .gitignore           # Updated ignore patterns
└── .env.example         # Environment template
```

**Time:** ~2-3 minutes

---

### 2. create-rag-system
**Purpose:** Set up complete RAG system from scratch

**What It Installs:**
- ✅ rag-implementer skill
- ✅ Vector database MCPs (when available)
- ✅ Embedding generator MCPs (when available)
- ✅ RAG pipeline components
- ✅ Vector database integrations (Pinecone, Weaviate, Chroma)
- ✅ LLM provider integrations (OpenAI, Anthropic)
- ✅ RAG project template

**When to Use:**
- Building document search system
- Adding semantic search to application
- Creating knowledge base chatbot
- Implementing AI-powered Q&A

**Usage:**
```bash
npx @ai-dev-standards/create-rag-system
```

**Interactive Prompts:**
- Select vector database (Pinecone, Weaviate, Chroma, pgvector)
- Select LLM provider (OpenAI, Anthropic, Cohere)
- Select RAG architecture (Naive, Advanced, Modular)
- Configure embedding model
- Set up API keys

**What It Creates:**
```
your-rag-project/
├── .ai-dev/
│   ├── skills/
│   │   └── rag-implementer/
│   ├── components/
│   │   └── rag-pipelines/
│   └── integrations/
│       ├── vector-databases/
│       └── llm-providers/
├── src/
│   ├── rag/
│   │   ├── pipeline.ts
│   │   ├── embeddings.ts
│   │   ├── retrieval.ts
│   │   └── generation.ts
│   └── config/
│       └── rag.config.ts
├── .cursorrules          # RAG-specific rules
└── .env.example         # API keys template
```

**Enables:**
- rag-implementer skill → AI guidance on RAG implementation
- RAG components → Pre-built pipeline code
- Vector DB integrations → Connect to your chosen database
- Full RAG workflow → Ingest → Embed → Store → Retrieve → Generate

**Time:** ~5 minutes

**Cost:** Setup is free, but runtime costs apply:
- Embeddings: ~$0.0001 per 1K tokens (OpenAI)
- Vector DB: $0-70/month (depends on provider)
- LLM queries: $0.001-0.03 per 1K tokens

**Next Steps After Install:**
1. Add API keys to `.env`
2. Run embedding pipeline: `npm run embed-documents`
3. Test search: `npm run test-search`
4. Integrate into application

---

### 3. create-saas
**Purpose:** Complete SaaS project setup with all essentials

**What It Installs:**
- ✅ **Product Skills:** mvp-builder, product-strategist
- ✅ **Development Skills:** frontend-builder, api-designer, deployment-advisor
- ✅ **Integrations:** Auth (Clerk/Supabase), Payments (Stripe), Email (Resend)
- ✅ **Components:** UI components, auth components, form components
- ✅ **SaaS Template:** Full project structure

**When to Use:**
- Starting new SaaS product
- Building subscription-based application
- Need user management + payments
- Want production-ready starter

**Usage:**
```bash
npx @ai-dev-standards/create-saas
```

**Interactive Prompts:**
- Select stack (Next.js, Remix, Astro)
- Select auth provider (Clerk, Supabase, Auth0)
- Select database (Supabase, Neon, Planet Scale)
- Select payment provider (Stripe, Paddle)
- Select email provider (Resend, SendGrid)
- Configure deployment (Vercel, Railway, Fly.io)

**What It Creates:**
```
your-saas-project/
├── .ai-dev/
│   ├── skills/
│   │   ├── mvp-builder/
│   │   ├── product-strategist/
│   │   ├── frontend-builder/
│   │   ├── api-designer/
│   │   └── deployment-advisor/
│   ├── components/
│   │   ├── auth/
│   │   ├── ui-components/
│   │   └── forms/
│   └── integrations/
│       ├── auth/ (Clerk/Supabase)
│       ├── payments/ (Stripe)
│       └── email/ (Resend)
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── settings/
│   │   └── billing/
│   └── api/
│       ├── auth/
│       ├── stripe/
│       └── users/
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── auth/          # Auth components
│   └── billing/       # Payment components
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── stripe.ts
├── .cursorrules       # SaaS-specific rules
├── .env.example       # All API keys
└── package.json       # All dependencies
```

**Enables:**
- User authentication (sign up, sign in, SSO)
- Subscription management (plans, billing, invoices)
- Database (user data, application data)
- Email notifications (welcome, transactional)
- Admin dashboard
- API endpoints

**Time:** ~10 minutes

**Cost:** Development setup is free, but services require:
- Auth: $0-25/month (Clerk) or $0 (Supabase free tier)
- Database: $0-10/month (Supabase/Neon free tiers)
- Payments: Free (Stripe fees apply to transactions)
- Email: $0-10/month (Resend free tier: 100 emails/day)
- Hosting: $0-20/month (Vercel hobby tier free)

**Next Steps After Install:**
1. Add all API keys to `.env`
2. Run database migrations: `npm run db:push`
3. Start development: `npm run dev`
4. Test authentication flow
5. Configure Stripe products/pricing
6. Deploy to Vercel: `npm run deploy`

---

## Comparison Table

| Feature | bootstrap | create-rag-system | create-saas |
|---------|-----------|-------------------|-------------|
| **Skills** | All 36 | RAG-specific (1) | Product/Dev (5) |
| **Setup Time** | 2-3 min | 5 min | 10 min |
| **Project Type** | Any | AI/RAG | SaaS |
| **Integrations** | Optional | Required | Required |
| **Cost (Dev)** | $0 | $0 | $0 |
| **Cost (Prod)** | Varies | $70-500/mo | $50-300/mo |
| **Complexity** | Low | Medium | High |
| **Production-Ready** | With config | With API keys | Yes |

---

## Usage Patterns

### Pattern 1: New Project from Scratch

**SaaS Application:**
```bash
# 1. Create SaaS project
npx @ai-dev-standards/create-saas my-saas-app

# 2. Navigate to project
cd my-saas-app

# 3. Add API keys
cp .env.example .env
# Edit .env with your keys

# 4. Install dependencies
npm install

# 5. Run migrations
npm run db:push

# 6. Start development
npm run dev
```

**RAG System:**
```bash
# 1. Create RAG system
npx @ai-dev-standards/create-rag-system my-rag-app

# 2. Navigate to project
cd my-rag-app

# 3. Add API keys (OpenAI, Pinecone, etc.)
cp .env.example .env
# Edit .env with your keys

# 4. Install dependencies
npm install

# 5. Embed documents
npm run embed-documents ./docs

# 6. Test search
npm run test-search "your query here"
```

---

### Pattern 2: Add to Existing Project

**Add Full ai-dev-standards:**
```bash
# Navigate to existing project
cd my-existing-project

# Run bootstrap
npx @ai-dev-standards/bootstrap

# Review changes
git diff

# Commit
git add .
git commit -m "Add ai-dev-standards"
```

**Add Just RAG:**
```bash
# Navigate to existing project
cd my-existing-project

# Add RAG system
npx @ai-dev-standards/create-rag-system --add-to-existing

# This adds RAG to your existing project without overwriting
```

---

## Command-Line Options

### bootstrap
```bash
npx @ai-dev-standards/bootstrap [options]

Options:
  --skills <list>      Comma-separated list of skills to install
                       Default: all
                       Example: --skills mvp-builder,rag-implementer

  --mcps <list>        Comma-separated list of MCPs to install
                       Default: all
                       Example: --mcps accessibility-checker

  --no-config-files    Skip copying config files
  --no-interactive     Skip interactive prompts
  --dry-run           Show what would be installed without installing
```

### create-rag-system
```bash
npx @ai-dev-standards/create-rag-system [options]

Options:
  --vector-db <name>   Vector database (pinecone|weaviate|chroma|pgvector)
                       Default: pinecone

  --llm <name>         LLM provider (openai|anthropic|cohere)
                       Default: openai

  --arch <type>        RAG architecture (naive|advanced|modular)
                       Default: advanced

  --add-to-existing    Add to existing project
  --no-interactive     Skip interactive prompts
```

### create-saas
```bash
npx @ai-dev-standards/create-saas [options]

Options:
  --stack <name>       Framework (nextjs|remix|astro)
                       Default: nextjs

  --auth <name>        Auth provider (clerk|supabase|auth0)
                       Default: clerk

  --db <name>          Database (supabase|neon|planetscale)
                       Default: supabase

  --payments <name>    Payment provider (stripe|paddle)
                       Default: stripe

  --email <name>       Email provider (resend|sendgrid)
                       Default: resend

  --deploy <name>      Deployment platform (vercel|railway|flyio)
                       Default: vercel

  --no-interactive     Skip interactive prompts
```

---

## Troubleshooting

### bootstrap fails
```bash
# Check Node version (need >=18)
node --version

# Check npm version (need >=9)
npm --version

# Try with --dry-run first
npx @ai-dev-standards/bootstrap --dry-run

# Check permissions
ls -la .
```

### create-rag-system fails
```bash
# Verify API keys are set
cat .env | grep -E "OPENAI_API_KEY|PINECONE_API_KEY"

# Test vector DB connection
npm run test-vector-db

# Check embedding model
npm run test-embeddings
```

### create-saas fails
```bash
# Verify all required API keys
npm run check-env

# Test database connection
npm run db:test

# Test auth provider
npm run test-auth
```

---

## Related Documentation

- **[Bootstrap Guide](../DOCS/BOOTSTRAP.md)** - Detailed bootstrap documentation
- **[RAG Implementer Skill](../SKILLS/rag-implementer/SKILL.md)** - RAG methodology
- **[MVP Builder Skill](../SKILLS/mvp-builder/SKILL.md)** - MVP development
- **[Ecosystem Parity Analysis](../DOCS/ECOSYSTEM-PARITY-ANALYSIS.md)** - Component relationships

---

## Contributing

To add a new installer:

1. Create directory in `INSTALLERS/`
2. Add to `META/registry.json`
3. Create README.md explaining what it does
4. Document in this file
5. Add tests
6. Submit PR

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
**Status:** ✅ All 3 installers documented and registered
