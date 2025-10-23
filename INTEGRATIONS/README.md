# Third-Party Integrations

Pre-configured integration templates for popular services and platforms.

## Categories

### 1. Framework Adapters (`framework-adapters/`)
Adapters for integrating with popular frameworks like Next.js, Remix, Astro.

### 2. LLM Providers (`llm-providers/`)
Ready-to-use integrations for OpenAI, Anthropic, Together AI, and more.

### 3. Platforms (`platforms/`)
Platform integrations for Vercel, AWS, Supabase, Firebase, etc.

### 4. Vector Databases (`vector-databases/`)
Integration code for Pinecone, Weaviate, Qdrant, Chroma, and more.

## Usage

Install integrations with:
```bash
ai-dev setup <service>
```

Examples:
```bash
ai-dev setup supabase
ai-dev setup openai
ai-dev setup pinecone
```

Integration code is copied to `.ai-dev/integrations/` in your project.

## Available Integrations

| Category | Service | Description |
|----------|---------|-------------|
| Auth | Supabase | Authentication and database |
| Auth | Clerk | User management |
| Auth | Auth0 | Enterprise auth |
| Payments | Stripe | Payment processing |
| Email | Resend | Transactional email |
| Vector DB | Pinecone | Vector database |
| LLM | OpenAI | GPT models |
| LLM | Anthropic | Claude models |

## Adding Custom Integrations

Place custom integration code in `.ai-dev/integrations/custom/`

---

**Built for rapid integration** ⚡
