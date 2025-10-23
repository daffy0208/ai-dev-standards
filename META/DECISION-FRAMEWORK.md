# Decision Framework

## How to Make Architectural and Technical Decisions

This framework helps AI assistants make intelligent, documented choices when multiple options exist.

---

## Table of Contents

1. [Validation Before Building (CRITICAL)](#validation-before-building)
2. [Framework & Library Selection](#framework--library-selection)
3. [Architecture Patterns](#architecture-patterns)
4. [Platform & Stack Selection](#platform--stack-selection)
5. [Vector Database Selection](#vector-database-selection)
6. [Deployment Strategy](#deployment-strategy)
7. [Integration Approaches](#integration-approaches)
8. [Testing Strategy](#testing-strategy)
9. [Decision Process Template](#decision-process-template)

---

## Validation Before Building

### 🚨 CRITICAL: Always Validate Before Building

**Before making ANY technical decisions about frameworks, databases, or architecture:**

**Ask these questions FIRST:**

1. **Has the problem been validated?**
   - Have we talked to users?
   - Is this a real problem people will pay to solve?
   - What's our evidence?

2. **Has the solution been validated?**
   - Have we tested simpler alternatives?
   - Do users actually want this feature?
   - Can we validate with a cheaper approach first?

3. **Is building the right next step?**
   - Or should we validate assumptions first?
   - Can we test with manual processes?
   - What's the cheapest way to learn?

### Validation-First Decision Tree

```
User requests technical implementation (RAG, multi-agent, etc.)
│
├─ Has problem been validated?
│  ├─ No → Use product-strategist skill FIRST
│  │      → Validate problem (Mom Test interviews)
│  │      → Return to this tree after validation
│  │
│  └─ Yes → Continue to solution validation
│
├─ Has solution been validated?
│  ├─ No → Test cheaper alternatives FIRST
│  │      │
│  │      ├─ RAG? Try: FAQ page → Keyword search → Semantic search
│  │      ├─ Multi-agent? Try: Single agent → Manual coordination
│  │      ├─ Custom infra? Try: Managed platforms → PaaS → Self-hosted
│  │      │
│  │      → Return to this tree after testing
│  │
│  └─ Yes → Continue to technical decisions
│
└─ Proceed with technical implementation
   → Use appropriate decision framework sections below
```

### Cost Reality Checks

**Before implementing technical solutions, show users these alternatives:**

#### RAG Implementation
```
Before: RAG system (3-4 weeks, $200-500/month)
Try First:
1. FAQ page (1 day, $0)
2. Keyword search (2-3 days, $20/month)
3. Simple semantic search (1 week, $50/month)

Only proceed with RAG if simpler options tested and insufficient.
```

#### Multi-Agent System
```
Before: Multi-agent architecture (4-6 weeks, $300-800/month)
Try First:
1. Single agent with tools (1 week, $50/month)
2. Sequential processing (2 weeks, $100/month)

Only proceed with multi-agent if parallelization validated as necessary.
```

#### Custom Infrastructure
```
Before: Custom AWS setup (6-8 weeks, $500+/month)
Try First:
1. Vercel + Railway ($20/month)
2. PaaS solutions ($100/month)

Only proceed with custom if scale/requirements validated.
```

### Validation Phases & Time Limits

All projects should follow these phases with strict time limits:

#### Phase 1: Problem Discovery (2 weeks MAX)
- ⏰ **Time Limit:** 2 weeks
- 💰 **Budget:** $0 (user interviews only)
- ✅ **Exit Criteria:** 10+ interviews showing real problem

**If exceeds 2 weeks → STOP. Re-evaluate if problem is real.**

#### Phase 2: Solution Validation (3 days MAX)
- ⏰ **Time Limit:** 3 days
- 💰 **Budget:** $0-50 (prototypes/mockups)
- ✅ **Exit Criteria:** Users confirm they'd pay for solution

**If exceeds 3 days → STOP. Solution may be too complex.**

#### Phase 3: MVP Build (2 weeks MAX)
- ⏰ **Time Limit:** 2 weeks
- 💰 **Budget:** <$200
- ✅ **Exit Criteria:** Core value deliverable, testable

**If exceeds 2 weeks → STOP. Cut scope or validate assumptions.**

#### Phase 4: Validated Learning (Ongoing)
- 💰 **Budget:** <$1000/month
- ✅ **Metrics:** Track usage, retention, feedback
- 🎯 **Goal:** Prove product-market fit before scaling

#### Phase 5: Scale Decision
- Only proceed if Phase 4 metrics prove viability
- This is when expensive technical solutions are justified

### Warning Signs: Analysis Paralysis

**STOP if you see these patterns:**

- ❌ Research phase >2 weeks → Analysis paralysis
- ❌ Design phase >3 days → Over-engineering
- ❌ MVP >2 weeks → Scope creep
- ❌ No user testing → Building in vacuum
- ❌ Expensive tech before validation → Premature optimization

### Integration with Technical Decisions

**Only proceed to technical decision frameworks below if:**

1. ✅ Problem validated with users (Phase 1 complete)
2. ✅ Solution validated with cheap alternatives (Phase 2 complete)
3. ✅ MVP scope defined (Phase 3 ready)
4. ✅ Time and budget limits established

**Reference:** See [Validation-First Development Playbook](../PLAYBOOKS/validation-first-development.md) for complete workflow.

---

## Framework & Library Selection

### When to Use Which Agentic Framework

**LangChain / LangGraph**
- ✅ Complex, stateful workflows with cycles
- ✅ RAG is primary use case
- ✅ Need large ecosystem of integrations
- ✅ Python or TypeScript project
- ✅ Graph-based orchestration needed
- ❌ Simple, linear workflows (overkill)
- ❌ Pure role-based team collaboration

**Use when:** Building knowledge-intensive applications with complex retrieval and reasoning chains.

**CrewAI**
- ✅ Role-based agent collaboration
- ✅ Clear division of responsibilities (manager, worker, reviewer roles)
- ✅ Content generation and research workflows
- ✅ Team-like collaboration patterns
- ✅ Hierarchical or sequential processes
- ❌ Simple single-agent tasks
- ❌ Need for complex state management

**Use when:** Building systems where agents have distinct roles and responsibilities.

**AutoGen / AG2**
- ✅ Conversational multi-agent systems
- ✅ Research and experimental projects
- ✅ Multi-turn reasoning with feedback loops
- ✅ Code generation with iterative improvement
- ❌ Production systems requiring stability
- ❌ Non-conversational workflows

**Use when:** Building research tools or experimental systems with conversational interactions.

**Semantic Kernel**
- ✅ Enterprise/Microsoft ecosystem
- ✅ .NET/C# applications
- ✅ Strong governance requirements
- ✅ Azure integration needed
- ✅ Cross-platform C#/Python/Java support
- ❌ Python-first projects
- ❌ Need largest community support

**Use when:** Building enterprise applications in Microsoft stack.

**LlamaIndex**
- ✅ RAG is the ONLY focus
- ✅ Document-heavy applications
- ✅ Advanced retrieval strategies
- ✅ Data indexing and querying core requirement
- ✅ Multiple data sources to unify
- ❌ Complex agent orchestration needed
- ❌ Non-RAG use cases

**Use when:** Building pure document search and retrieval systems.

**OpenAI Swarm**
- ✅ Lightweight coordination needed
- ✅ Simple handoffs between specialists
- ✅ Minimal boilerplate desired
- ✅ Prototyping multi-agent ideas
- ❌ Complex workflows
- ❌ Need production-grade orchestration

**Use when:** Quick prototypes or simple agent coordination.

---

### Decision Tree: Framework Selection

```
Primary use case?
│
├─ RAG/Document Search
│  ├─ Only RAG → LlamaIndex
│  ├─ RAG + Complex workflows → LangChain
│  └─ RAG + Agents → LangChain + LangGraph
│
├─ Multi-Agent Coordination
│  ├─ Role-based teams → CrewAI
│  ├─ Conversational agents → AutoGen
│  ├─ Graph-based workflows → LangGraph
│  └─ Simple handoffs → OpenAI Swarm
│
├─ Single Complex Agent
│  ├─ .NET/Enterprise → Semantic Kernel
│  └─ Python/TS → LangChain
│
└─ Enterprise Requirements
   ├─ Microsoft stack → Semantic Kernel
   ├─ Governance heavy → Semantic Kernel
   └─ Cloud agnostic → LangChain
```

---

## Architecture Patterns

### Single Agent vs Multi-Agent

**Single Agent:**
- Linear, sequential tasks
- One clear objective
- Minimal tool complexity
- Quick prototypes
- User interaction focused

**Decision criteria:** Can this be accomplished in one coherent workflow?

**Multi-Agent:**
- Complex, multi-step workflows
- Parallel processing beneficial
- Different specializations required
- Role-based task distribution
- Collaborative problem-solving

**Decision criteria:** Are there distinct specialized roles needed?

---

### RAG vs Fine-Tuning vs Prompt Engineering

**Prompt Engineering Only:**
- ✅ Task fits in context window
- ✅ No specialized knowledge needed
- ✅ One-time or ad-hoc queries
- ✅ Cost-sensitive
- ❌ Large knowledge bases
- ❌ Frequently updated information

**Use when:** Information is small enough to include in prompt.

**RAG (Retrieval-Augmented Generation):**
- ✅ Large knowledge base (1000+ documents)
- ✅ Frequently updated information
- ✅ Context-specific responses needed
- ✅ Need to cite sources
- ✅ Multiple data sources
- ✅ Want explainability
- ❌ Static knowledge
- ❌ Knowledge can fit in fine-tuning

**Use when:** Dynamic knowledge base that updates regularly.

**Fine-Tuning:**
- ✅ Specific style/format needed
- ✅ Behavior modification required
- ✅ Latency critical (no retrieval overhead)
- ✅ Cost of inference < cost of retrieval
- ✅ Static knowledge base
- ✅ Domain-specific language/terminology
- ❌ Frequently changing information
- ❌ Need source attribution

**Use when:** Knowledge is static and style/behavior customization critical.

**Decision Tree:**
```
Is information static or dynamic?
│
├─ Static
│  ├─ Fits in prompt? → Prompt Engineering
│  ├─ Need style customization? → Fine-Tuning
│  └─ Large knowledge base? → RAG (easier to update than retrain)
│
└─ Dynamic
   ├─ Fits in context? → Prompt Engineering
   └─ Too large for context? → RAG
```

---

### MCP vs Direct Integration

**Use MCP When:**
- ✅ Multiple clients need same data/tools
- ✅ Want standardized integration layer
- ✅ Building for Claude ecosystem
- ✅ Need to switch between AI providers
- ✅ Future-proofing important
- ✅ Team will build multiple AI applications
- ❌ One-off simple integration

**Use Direct Integration When:**
- ✅ Simple, one-time integration
- ✅ Performance critical (fewer abstraction layers)
- ✅ MCP adds unnecessary complexity
- ✅ Using APIs with existing SDKs
- ✅ Prototyping/MVP phase
- ❌ Will integrate with multiple AI systems

**Decision Tree:**
```
Will multiple applications use this tool/data?
│
├─ Yes → MCP (standardized, reusable)
│
└─ No
   ├─ Is this a reusable pattern? → Consider MCP (future-proof)
   ├─ Just prototyping? → Direct (faster)
   └─ Performance critical? → Direct (fewer layers)
```

---

## Platform & Stack Selection

### Platform Archetypes

Use this decision matrix to choose optimal platform and stack.

**Decision Matrix Scoring (1-5 scale, weighted):**
- **Time-to-First-Value** (Weight: 5) - Speed to market
- **Team Familiarity** (Weight: 5) - Current skill alignment
- **SEO/SSR Requirements** (Weight: 4) - Organic traffic needs
- **Real-time/Low-Latency** (Weight: 4) - Live features
- **Mobile-First/Offline** (Weight: 3) - Device-specific needs
- **Data Compliance** (Weight: 5) - Regulatory requirements
- **Vendor Lock-in Tolerance** (Weight: 3) - Platform commitment
- **Extensibility/Modularity** (Weight: 4) - Future growth
- **Cost Sensitivity** (Weight: 3) - Budget constraints
- **Accessibility & i18n** (Weight: 3) - Global reach

---

### Archetype A: Static/Content-Heavy Website

**Scoring Profile:**
- High: SEO/SSR (5), Time-to-Value (4-5)
- Low: Real-time (1-2), Complexity (2)

**Recommended Stack:**
- **Frontend:** Astro or Next.js (SSG mode)
- **CMS:** Headless CMS (Sanity, Contentful, Strapi)
- **Hosting:** Vercel, Cloudflare Pages, Netlify
- **Database:** Not needed or simple JSON/Markdown

**Use when:** Marketing sites, blogs, documentation, portfolios

**Examples:** Company website, documentation site, blog

---

### Archetype B: SaaS-Style Web Application

**Scoring Profile:**
- High: Extensibility (5), Data Compliance (4-5), Complexity (4)
- Medium: Real-time (3), SEO (3)

**Recommended Stack:**
- **Frontend:** Next.js (App Router) or Remix
- **Backend:** Next.js API Routes or separate FastAPI/Express
- **Database:** PostgreSQL (Supabase, Neon, Railway)
- **Auth:** Clerk, Auth.js, Supabase Auth
- **Payments:** Stripe
- **Hosting:** Vercel (frontend), Railway/Fly.io (backend if separate)

**Use when:** SaaS products, admin dashboards with persistence, user management

**Examples:** Project management tool, CRM, analytics platform

---

### Archetype C: Internal Tool/Admin Dashboard

**Scoring Profile:**
- High: Speed > Polish (5), Team Familiarity (5)
- Low: SEO (1), Public accessibility (1)

**Recommended Stack:**
- **Option 1 (Custom):** Next.js + shadcn/ui + Supabase
- **Option 2 (Low-code):** Retool, Internal, Airplane
- **Database:** Supabase or existing company DB
- **Hosting:** Vercel or internal infrastructure

**Use when:** Internal operations, admin panels, backoffice tools

**Examples:** Customer support dashboard, inventory management, reporting tool

---

### Archetype D: Real-time/Live Dashboards

**Scoring Profile:**
- High: Real-time (5), Performance (5), Low-Latency (5)
- Medium: Complexity (4)

**Recommended Stack:**
- **Frontend:** SvelteKit, Solid.js, or React with optimizations
- **Real-time:** WebSockets, Server-Sent Events, or Supabase Realtime
- **Database:** TimescaleDB (time-series), Redis (caching), PostgreSQL
- **Hosting:** Fly.io, Railway, Cloudflare Workers
- **Viz:** Recharts, D3.js, Chart.js

**Use when:** Live monitoring, real-time analytics, collaborative editing

**Examples:** System monitoring dashboard, live sports scores, stock tickers

---

### Archetype E: AI-Native/Multi-Agent System

**Scoring Profile:**
- High: AI Complexity (5), Knowledge Requirements (5)
- High: Extensibility (4), Data needs (4-5)

**Recommended Stack:**
- **Backend:** FastAPI (Python) or Express (TypeScript)
- **AI Framework:** LangChain/LangGraph or CrewAI
- **Vector DB:** Pinecone, Weaviate, or Chroma
- **Graph DB:** Neo4j (if using knowledge graphs)
- **Database:** PostgreSQL
- **Frontend:** React, Next.js
- **Hosting:** Railway, Fly.io, AWS Lambda

**Use when:** AI assistants, research tools, intelligent automation

**Examples:** AI research assistant, multi-agent code reviewer, knowledge base chatbot

---

### Archetype F: Mobile Application

**Scoring Profile:**
- High: Mobile-First (5), Offline (4-5)
- Medium: Performance (4)

**Recommended Stack:**
- **Framework:** React Native with Expo
- **Local DB:** SQLite, WatermelonDB, or Turso (edge)
- **Backend:** Supabase, Firebase, or custom API
- **Auth:** Expo Auth, Supabase
- **Hosting:** EAS (Expo Application Services)

**Use when:** Mobile-first experiences, offline-capable apps

**Examples:** Mobile productivity app, field service tool, offline-first note-taking

---

### Archetype G: Browser Extension/Overlay

**Scoring Profile:**
- High: Browser-specific (5)
- Low: Backend complexity (1-2)

**Recommended Stack:**
- **Framework:** Plasmo Framework
- **Storage:** Chrome Storage API, IndexedDB
- **Backend:** Cloudflare Workers (if needed)
- **Hosting:** Chrome Web Store, Firefox Add-ons

**Use when:** Browser-specific utilities, content augmentation

**Examples:** Grammar checker, price comparison, productivity enhancer

---

### Platform Selection Decision Tree

```
What's the primary workload?
│
├─ Static Content (marketing, blog, docs)
│  └─ Archetype A: Astro/Next.js SSG + Vercel
│
├─ Web Application
│  ├─ SaaS with users → Archetype B: Next.js + PostgreSQL + Auth
│  ├─ Internal tool → Archetype C: Next.js + Supabase OR Retool
│  └─ Real-time dashboard → Archetype D: SvelteKit + WebSockets
│
├─ AI-Native System
│  └─ Archetype E: FastAPI + LangChain + Vector DB
│
├─ Mobile App
│  └─ Archetype F: React Native + Expo + Supabase
│
└─ Browser Extension
   └─ Archetype G: Plasmo + Cloudflare Workers
```

---

## Vector Database Selection

### Choosing the Right Vector DB

**Pinecone:**
- ✅ Fully managed (no ops)
- ✅ Auto-scaling
- ✅ Best for production at scale
- ✅ Great DX and documentation
- ❌ Cost scales with usage
- ❌ Vendor lock-in

**Use when:** Production system, don't want to manage infrastructure, budget allows.

**Weaviate:**
- ✅ Open-source
- ✅ Rich features (hybrid search, multi-tenancy)
- ✅ Self-hosted or cloud
- ✅ Good performance
- ✅ GraphQL-like query language
- ❌ More complex setup than Pinecone
- ❌ Smaller community than Pinecone

**Use when:** Want open-source, need hybrid search, okay with more setup.

**Chroma:**
- ✅ Embedded (no separate server)
- ✅ Perfect for prototypes
- ✅ Extremely simple to use
- ✅ Good for local development
- ❌ Not for production scale
- ❌ Limited features vs dedicated DBs

**Use when:** Prototyping, POC, local development, small datasets.

**Qdrant:**
- ✅ High performance (Rust-based)
- ✅ Great filtering capabilities
- ✅ Open-source with cloud option
- ✅ Good documentation
- ❌ Smaller ecosystem
- ❌ Less mature than Pinecone/Weaviate

**Use when:** Performance critical, need advanced filtering, okay with smaller ecosystem.

**PostgreSQL + pgvector:**
- ✅ Already using PostgreSQL
- ✅ Mature, reliable infrastructure
- ✅ No new databases to learn
- ✅ Good for moderate scale
- ❌ Less optimized for vectors than dedicated DBs
- ❌ Limited at very large scale

**Use when:** Already on Postgres, moderate scale, want simplicity.

---

### Vector DB Decision Tree

```
Already using PostgreSQL?
│
├─ Yes
│  ├─ Scale < 1M vectors? → pgvector (start simple)
│  └─ Scale > 1M vectors? → Dedicated vector DB
│
└─ No
   ├─ Just prototyping? → Chroma (embedded, easy)
   │
   └─ Production system?
      ├─ Want managed? → Pinecone (easiest) or Weaviate Cloud
      │
      ├─ Need hybrid search? → Weaviate (built-in)
      │
      ├─ Performance critical? → Qdrant (fastest)
      │
      └─ Cost-sensitive? → Weaviate self-hosted or Qdrant
```

---

## Deployment Strategy

### Where to Deploy?

**Vercel:**
- ✅ Next.js/React apps
- ✅ Serverless by default
- ✅ Excellent DX (git push = deploy)
- ✅ Global CDN
- ❌ Vendor lock-in to some extent
- ❌ Backend complexity limited
- ❌ Can get expensive at scale

**Use when:** Next.js frontend, prioritize DX, rapid deployment needed.

**Railway:**
- ✅ Full-stack apps (frontend + backend + DB)
- ✅ Database included
- ✅ Simple pricing
- ✅ Good for monoliths
- ✅ Docker support
- ❌ Smaller than AWS/Vercel
- ❌ Fewer advanced features

**Use when:** Full-stack app, want simplicity, database needed.

**Fly.io:**
- ✅ Run containers globally
- ✅ Edge computing
- ✅ Great for real-time/WebSockets
- ✅ Flexible (any language/stack)
- ❌ Docker knowledge helpful
- ❌ More manual than Vercel

**Use when:** Global distribution needed, WebSockets/real-time, edge computing.

**AWS Lambda / Serverless:**
- ✅ True serverless (pay per use)
- ✅ Massive scale
- ✅ Integration with AWS ecosystem
- ❌ Cold starts
- ❌ Complexity (IAM, VPC, etc.)
- ❌ Steeper learning curve

**Use when:** Need AWS features, sporadic traffic, pay-per-use model preferred.

**Cloudflare Workers:**
- ✅ Edge computing (global)
- ✅ Extremely fast (no cold starts)
- ✅ Great for APIs and MCP servers
- ✅ Generous free tier
- ❌ Different runtime (no Node.js APIs)
- ❌ Some limitations (10ms CPU limit on free tier)

**Use when:** Edge APIs, MCP servers, global distribution, cost-sensitive.

**Docker + VPS (Hetzner, DigitalOcean, Linode):**
- ✅ Full control
- ✅ Predictable costs
- ✅ Any stack/language
- ✅ No vendor lock-in
- ❌ More ops work (you manage everything)
- ❌ Manual scaling

**Use when:** Want full control, predictable costs, have DevOps expertise.

---

### Deployment Decision Tree

```
What's the primary workload?
│
├─ Frontend (Next.js/React/Static)
│  └─ Vercel or Cloudflare Pages
│
├─ Full-Stack Monolith
│  ├─ Simple setup? → Railway
│  ├─ Global edge? → Fly.io
│  └─ Full control? → Docker + VPS
│
├─ API / Microservices
│  ├─ Edge performance? → Cloudflare Workers
│  ├─ AWS ecosystem? → AWS Lambda
│  ├─ Container-based? → Fly.io or Railway
│  └─ Cost predictable? → VPS
│
├─ MCP Servers
│  └─ Cloudflare Workers (ideal) or Fly.io
│
└─ AI/ML Workloads
   ├─ Need GPUs? → Replicate, Modal, RunPod
   ├─ Serverless inference? → AWS SageMaker, Modal
   └─ Self-hosted? → Docker + GPU VPS
```

---

## Integration Approaches

### REST vs GraphQL

**REST:**
- ✅ Simple, well-understood
- ✅ Great caching (HTTP caching)
- ✅ Tooling everywhere
- ✅ Easier to version
- ❌ Over-fetching/under-fetching data
- ❌ Multiple requests for related data

**Use when:** Simple CRUD, public APIs, caching important, team knows REST.

**GraphQL:**
- ✅ Client controls data shape (no over-fetching)
- ✅ Single request for related data
- ✅ Strong typing
- ✅ Great for complex data requirements
- ❌ More complex to implement
- ❌ Caching more difficult
- ❌ Steeper learning curve

**Use when:** Complex data requirements, mobile apps (minimize requests), flexible client needs.

---

## Testing Strategy

### How Much to Test?

**Always Test:**
- Core business logic
- Security-critical code
- Public APIs
- Data transformations
- Payment processing
- Auth/authorization

**Can Skip Testing:**
- Quick prototypes (< 1 week lifespan)
- POCs not going to production
- Generated UI code (can be visually tested)
- Configuration files

**Test Distribution:**

**Production Application:**
- Unit tests: 70%
- Integration tests: 20%
- E2E tests: 10%
- Target coverage: >80%

**MVP/Prototype:**
- Critical path tests only
- Manual testing for UI
- No coverage targets

**Library/SDK:**
- Unit tests: 90%
- Integration tests: 10%
- Target coverage: >95%

---

## Decision Process Template

When facing any technical decision, follow this process:

### 1. Identify Decision Type

Is this a decision about:
- Framework/library selection?
- Architecture pattern?
- Platform/deployment?
- Integration approach?
- Testing strategy?

### 2. List Requirements & Constraints

**Requirements:**
- What must the solution provide?
- What problems must it solve?
- What features are needed?

**Constraints:**
- Time limitations
- Budget restrictions
- Team skill level
- Existing infrastructure
- Regulatory requirements

### 3. Consult This Framework

Find the relevant section above and review:
- Decision criteria
- Trade-offs
- Decision trees
- Use cases

### 4. Check Architecture Patterns

Review STANDARDS/architecture-patterns/ for:
- Similar scenarios
- Proven approaches
- Implementation guidance

### 5. Consider Trade-offs

For each option:
- **Pros:** What it does well
- **Cons:** What it doesn't do well
- **Risks:** What could go wrong
- **Costs:** Time, money, complexity

### 6. Make & Document Decision

**Document format:**
```markdown
## Decision: [Choice Made]

**Date:** YYYY-MM-DD

**Context:**
[Why this decision was needed]

**Requirements:**
- Requirement 1
- Requirement 2

**Options Considered:**
1. Option A: [Brief description]
2. Option B: [Brief description]
3. Option C: [Brief description]

**Decision:** [Chosen option]

**Reasoning:**
[Why this option was chosen, referencing decision framework]

**Trade-offs Accepted:**
- [Trade-off 1]
- [Trade-off 2]

**Re-evaluation Triggers:**
- [Condition that would require revisiting this decision]
- [Metric threshold that would indicate wrong choice]

**References:**
- META/DECISION-FRAMEWORK.md:[line-numbers]
- STANDARDS/architecture-patterns/[pattern-name].md
```

### 7. Explain to User

When communicating the decision:
- State the choice clearly
- Explain the reasoning (reference this framework)
- List trade-offs honestly
- Mention alternatives considered
- Provide fallback options if available

---

## Example Decisions

### Example 1: Vector Database Selection

**Context:** RAG system for 100K documents, production use, need hybrid search

**Requirements:**
- Production-ready
- Hybrid search (semantic + keyword)
- Moderate budget
- Updates daily

**Options:**
1. Pinecone (managed, expensive)
2. Weaviate (hybrid search, moderate cost)
3. Chroma (cheap, but not production-scale)

**Decision:** Weaviate Cloud

**Reasoning:**
- Hybrid search built-in (requirement met)
- Managed service (production-ready)
- Better pricing than Pinecone
- Can self-host later if costs become issue
- Meets all requirements

**Trade-offs:**
- Smaller ecosystem than Pinecone
- Slightly more complex than Pinecone

**Re-evaluation triggers:**
- If costs exceed $X/month → consider self-hosting
- If scale exceeds 10M vectors → benchmark performance
- If Weaviate lacks critical feature → reconsider Pinecone

---

### Example 2: Framework Selection

**Context:** Building multi-agent code review system

**Requirements:**
- Specialized agent roles (syntax checker, security auditor, style enforcer)
- Coordination between agents
- Production system

**Options:**
1. LangGraph (complex but powerful)
2. CrewAI (role-based, simpler)
3. OpenAI Swarm (too simple for this)

**Decision:** CrewAI

**Reasoning:**
- Role-based collaboration matches use case perfectly
- Simpler than LangGraph (faster development)
- Production-ready
- Clear separation of concerns

**Trade-offs:**
- Less flexible than LangGraph for complex workflows
- Smaller community than LangChain

**Re-evaluation triggers:**
- If workflow becomes cyclical → consider LangGraph
- If need complex state management → consider LangGraph

---

## Quick Reference

**When in doubt:**

| Question | Answer |
|----------|--------|
| Which agentic framework? | Check: [Framework Selection](#framework--library-selection) |
| RAG or fine-tuning? | Check: [RAG vs Fine-Tuning](#rag-vs-fine-tuning-vs-prompt-engineering) |
| Which vector DB? | Check: [Vector DB Selection](#vector-database-selection) |
| Where to deploy? | Check: [Deployment Strategy](#deployment-strategy) |
| REST or GraphQL? | Check: [REST vs GraphQL](#rest-vs-graphql) |
| MCP or direct? | Check: [MCP vs Direct Integration](#mcp-vs-direct-integration) |
| How much testing? | Check: [Testing Strategy](#testing-strategy) |

**Remember:**
- Context matters more than rules
- Document decisions with reasoning
- Revisit decisions when context changes
- No framework is perfect for everything
- Trade-offs are inherent in all choices

---

**This is a living framework. It should evolve as tools improve and new patterns emerge.**
