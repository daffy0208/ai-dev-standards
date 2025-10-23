# Integration Guide: Using ai-dev-standards in Your Projects

This guide shows you how to integrate the ai-dev-standards repository into your projects so Claude automatically uses the skills, patterns, and best practices.

---

## Quick Start: 3 Steps to Integration

### Step 1: Create .cursorrules in Your Project

In your project root, create `.cursorrules`:

```bash
cd /path/to/your/project
touch .cursorrules
```

### Step 2: Add Integration Configuration

Copy this template into `.cursorrules`:

```markdown
# Project: [Your Project Name]

## AI Development Standards Integration
Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**ALWAYS start every session by:**

1. Loading core context:
   - Read: ~/ai-dev-standards/META/PROJECT-CONTEXT.md
   - Read: ~/ai-dev-standards/META/HOW-TO-USE.md
   - Read: ~/ai-dev-standards/META/DECISION-FRAMEWORK.md

2. Checking for relevant skills:
   - Search: ~/ai-dev-standards/META/skill-registry.json
   - Load skills that match current task

3. Following standards:
   - Apply patterns from: ~/ai-dev-standards/STANDARDS/architecture-patterns/
   - Follow best practices from: ~/ai-dev-standards/STANDARDS/best-practices/

### Project-Specific Context

**Tech Stack:**
- Frontend: [e.g., Next.js 14, React, TypeScript]
- Backend: [e.g., Node.js, Express, PostgreSQL]
- AI/LLM: [e.g., OpenAI GPT-4, Claude, LangChain]
- Deployment: [e.g., Vercel, Railway, AWS]

**Current Phase:**
- [x] MVP Development
- [ ] Feature Expansion
- [ ] Production Launch

**Key Requirements:**
- [List specific requirements or constraints]

**Code Conventions:**
- [Any project-specific conventions not in ai-dev-standards]

---

## Project-Specific Instructions

[Add any custom instructions here]
```

### Step 3: Start Working

That's it! Now when you work with Claude in your project:

1. Open your project in Cursor/Claude Code
2. Claude automatically loads `.cursorrules`
3. Skills, patterns, and standards are automatically applied

---

## Integration Examples by Project Type

### Example 1: New SaaS Application

**Project:** Task management SaaS for small teams

**.cursorrules:**
```markdown
# Project: TaskFlow - Team Task Management SaaS

## AI Development Standards Integration
Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**Load on every session:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/META/DECISION-FRAMEWORK.md

**Primary Skills:**
- mvp-builder (feature prioritization)
- product-strategist (market validation)
- frontend-builder (React/Next.js)
- api-designer (REST API)
- deployment-advisor (hosting decisions)

### Project Context

**Tech Stack:**
- Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Next.js API routes, Prisma ORM
- Database: PostgreSQL (Railway)
- Auth: NextAuth.js
- Deployment: Vercel

**Current Phase:** MVP Development

**Riskiest Assumptions to Validate:**
1. Teams want real-time collaboration (not just async updates)
2. Visual timeline view is more valuable than list view
3. Mobile app needed vs responsive web sufficient

**P0 Features (Launch Blockers):**
- User authentication
- Create/edit/delete tasks
- Assign tasks to team members
- Basic notifications

**P1 Features (Nice to Have):**
- Real-time updates
- File attachments
- Task comments
- Email notifications

**Code Conventions:**
- Use server components by default (Next.js 14 App Router)
- Client components marked with 'use client'
- API routes in /app/api/
- Database queries in /lib/db/
- Reusable components in /components/ui/
```

**Usage Example:**
```
You: "I need to decide on real-time updates for task changes"

Claude: "I'll use the mvp-builder skill to evaluate this. Real-time updates
are currently P1 (nice to have), not P0. Let me validate if this is your
riskiest assumption:

Looking at your assumptions:
1. Real-time collaboration need ← This relates to real-time updates
2. Visual timeline value
3. Mobile app necessity

I recommend building a Concierge MVP to test #1:
- Week 1: Build basic task management (P0 only)
- Week 2: Manually notify 5 test teams when tasks change (via Slack/email)
- Week 3: Ask teams: 'How important is instant vs 5-minute delayed updates?'

If teams say instant is critical → Promote to P0, implement WebSockets
If teams say 5-min is fine → Keep P1, use simpler polling

This validates the assumption before investing in complex real-time infrastructure."
```

---

### Example 2: AI-Powered Knowledge Base

**Project:** AI search for company documentation

**.cursorrules:**
```markdown
# Project: DocuMind - AI-Powered Knowledge Base

## AI Development Standards Integration
Repository: ~/ai-dev-standards/

### Instructions for Claude Code

**Always load:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/STANDARDS/architecture-patterns/rag-pattern.md

**Primary Skills:**
- rag-implementer (core feature)
- api-designer (search API)
- performance-optimizer (query speed)

### Project Context

**Tech Stack:**
- Vector DB: Pinecone
- Embeddings: OpenAI text-embedding-3-large
- LLM: GPT-4 Turbo
- Backend: FastAPI (Python)
- Frontend: Next.js 14

**RAG Architecture:** Advanced RAG
- Hybrid retrieval (semantic + keyword)
- Re-ranking with Cohere
- Context compression with LLMLingua

**Data Sources:**
- Confluence (10k+ pages)
- Google Docs (5k+ docs)
- Internal wiki (2k+ articles)
- Slack history (last 2 years)

**Requirements:**
- Response time: <3 seconds
- Source attribution: Always required
- Hallucination prevention: Critical
- Security: Role-based access to documents

**Code Conventions:**
- API versioning: /v1/, /v2/
- All responses include source citations
- Log all queries for analysis
```

**Usage Example:**
```
You: "Design the retrieval pipeline for our documentation search"

Claude: "I'll use the rag-implementer skill and consult the RAG pattern.
Based on your requirements (10k+ docs, <3s response, source attribution),
I recommend Advanced RAG architecture:

[References: ~/ai-dev-standards/STANDARDS/architecture-patterns/rag-pattern.md:55-150]

**Pipeline Design:**

1. Query Enhancement:
   - Multi-query expansion for better recall
   - Keyword extraction for hybrid search

2. Hybrid Retrieval:
   - Semantic search: Pinecone (top 20 chunks)
   - Keyword search: BM25 on metadata (top 10 chunks)
   - Metadata filtering by user permissions

3. Re-ranking:
   - Cohere Rerank: 30 chunks → top 5
   - Adds ~100ms but significantly improves relevance

4. Context Assembly:
   - Compress with LLMLingua if >4000 tokens
   - Add citation markers [1], [2], etc.

5. Generation:
   - GPT-4 Turbo with context + query
   - Enforce source attribution in prompt

**Estimated Latency:**
- Query enhancement: 50ms
- Hybrid retrieval: 200ms (parallel)
- Re-ranking: 100ms
- Context assembly: 50ms
- LLM generation: 2000ms
- **Total: ~2.4s** (within <3s requirement)

[Provides implementation code following the pattern...]"
```

---

### Example 3: E-commerce Platform

**Project:** Online marketplace for handmade goods

**.cursorrules:**
```markdown
# Project: CraftMarket - Handmade Goods Marketplace

## AI Development Standards Integration
Repository: ~/ai-dev-standards/

### Instructions for Claude Code

**Load context:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md

**Relevant Skills:**
- mvp-builder (MVP scope)
- frontend-builder (product pages, checkout)
- api-designer (marketplace API)
- deployment-advisor (scaling strategy)
- go-to-market-planner (launch strategy)

### Project Context

**Tech Stack:**
- Frontend: Next.js 14, TypeScript, Tailwind
- Backend: Next.js API + Supabase
- Database: PostgreSQL (Supabase)
- Payments: Stripe
- Image Storage: Cloudflare R2
- Deployment: Vercel

**Current Phase:** Pre-Launch (Week 8 of 12)

**Business Model:**
- Sellers pay 5% commission per sale
- Free listing for first 10 products
- Premium tier: $10/mo for analytics

**P0 Features (Launch):**
- Seller registration
- Product listing (photos, price, description)
- Search and browse
- Shopping cart
- Stripe checkout
- Order management

**Security Requirements:**
- PCI compliance (Stripe handles)
- Seller/buyer data separation
- Image upload validation
- Rate limiting on API

**Performance Targets:**
- Product page load: <2s
- Search results: <1s
- Checkout flow: <5s total
```

**Usage Example:**
```
You: "We're 4 weeks from launch. Should we add AI-powered product recommendations?"

Claude: "I'll use the mvp-builder skill to evaluate this.

**Assessment:**
- Current phase: Week 8 of 12 (4 weeks to launch)
- Feature request: AI recommendations
- Status: Not in P0 list

**MVP Analysis:**

This is a **P2 feature** (post-launch optimization). Here's why:

**Risky Assumption Check:**
What are you trying to validate at launch?
1. Do sellers want to sell on our platform?
2. Do buyers want to buy handmade goods here?
3. Is our marketplace UX good enough?

AI recommendations don't validate any of these core assumptions.

**Recommendation:**

❌ **Don't build now:**
- 4 weeks is too tight for a P0 launch
- AI recommendations require data (you have none pre-launch)
- Distracts from launch-critical features

✅ **Build post-launch (Month 2-3):**
- After you have 100+ orders to train on
- Use simple collaborative filtering first (not AI)
- Test if recommendations increase conversions

**What to focus on now:**
1. Bug fixes and testing (2 weeks)
2. Seller onboarding (recruit 20 sellers)
3. Launch marketing prep (using go-to-market-planner skill)

Would you like me to help with the go-to-market plan for your 4-week launch?"
```

---

## Integration Methods Comparison

### Method 1: .cursorrules Only (Simplest)

**Setup:**
- Add `.cursorrules` to project root
- Reference ai-dev-standards paths

**Pros:**
- ✅ Fastest setup (5 minutes)
- ✅ Works immediately
- ✅ Portable (move .cursorrules to any project)

**Cons:**
- ❌ Must remember to load context manually if Claude doesn't auto-load
- ❌ No local customization of skills

**Best for:** Most projects, especially new ones

---

### Method 2: .cursorrules + Local .claude/ Directory

**Setup:**
```bash
mkdir .claude
mkdir .claude/skills
```

Create project-specific skills in `.claude/skills/` that extend or override ai-dev-standards.

**Example .claude/skills/my-project-skill.md:**
```yaml
---
name: CraftMarket Domain Expert
description: Specific knowledge about our marketplace domain and business rules
version: 1.0.0
---

# CraftMarket Domain Expert

## Business Rules

### Commission Calculation
- Base: 5% of sale price
- Premium sellers: 3% of sale price
- Minimum: $0.50 per transaction

### Product Categories
- Jewelry (20% of inventory target)
- Home Decor (30% target)
- Art (25% target)
- Accessories (25% target)

### Seller Verification
- Requires: Photo ID, bank account, tax info
- Approval time: 24-48 hours
- Manual review if >$10k/month in sales

[... project-specific domain knowledge ...]
```

**.cursorrules:**
```markdown
# Project: CraftMarket

## AI Development Standards
Global: ~/ai-dev-standards/
Local: ./.claude/skills/

**Load order:**
1. Global standards first
2. Local project skills override if conflicts
```

**Pros:**
- ✅ Global standards + project-specific knowledge
- ✅ Can override skills for special cases
- ✅ Version control project-specific skills

**Cons:**
- ❌ More setup
- ❌ Need to maintain local skills

**Best for:** Large projects with complex domain logic

---

### Method 3: Git Submodule (Advanced)

**Setup:**
```bash
cd /path/to/your/project
git submodule add <ai-dev-standards-repo-url> .ai-dev-standards
```

**.cursorrules:**
```markdown
# Project: [Name]

## AI Development Standards
Repository: ./.ai-dev-standards/

[Reference skills from .ai-dev-standards/SKILLS/...]
```

**Pros:**
- ✅ ai-dev-standards versioned with project
- ✅ Can pin to specific version
- ✅ Updates controlled via git submodule update

**Cons:**
- ❌ More complex git workflow
- ❌ Team needs to init submodules

**Best for:** Team projects where everyone needs same version

---

## Practical Usage Scenarios

### Scenario 1: Starting a New Project

**Step 1: Project Setup**
```bash
mkdir my-saas-app
cd my-saas-app
git init

# Create .cursorrules
cat > .cursorrules << 'EOF'
# Project: MySaaS

## AI Development Standards
Repository: ~/ai-dev-standards/

### Load Context
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md

### Primary Skills
- mvp-builder
- product-strategist
- frontend-builder
- api-designer
- deployment-advisor
EOF
```

**Step 2: Start Conversation**
```
You: "I want to build a SaaS app for small businesses to manage customer feedback"

Claude: [Automatically loads .cursorrules]

"I'll help you build this using the ai-dev-standards methodology.

First, let me use the product-strategist skill to validate the problem:

**Problem Validation (Mom Test approach):**

Before writing code, let's validate:

1. **Who is your target customer?**
   - Small businesses (5-50 employees)?
   - Specific industry (restaurants, retail, SaaS)?
   - What revenue range?

2. **What problem are they solving?**
   - Tell me about the last time you talked to a small business owner about
     how they collect feedback today
   - What's their current process?
   - What's painful about it?

3. **Riskiest Assumptions:**
   - Do small businesses actually want to centralize feedback?
   - Will they pay $20-50/mo for this?
   - Is manual collection the real problem or analysis?

Let's validate these before building. Would you like me to create a
validation plan using the product-strategist skill?"
```

---

### Scenario 2: Adding AI to Existing Project

**You have:** Existing Express + React app

**You want:** Add RAG-powered documentation search

**Step 1: Add .cursorrules**
```markdown
# Project: MyExistingApp

## AI Development Standards
Repository: ~/ai-dev-standards/

### New Feature: AI Documentation Search
Skills needed:
- rag-implementer
- api-designer (new /search endpoint)

Patterns:
- ~/ai-dev-standards/STANDARDS/architecture-patterns/rag-pattern.md

### Existing Stack
- Backend: Express.js, TypeScript
- Frontend: React, TypeScript
- Database: MongoDB
- New: Need to add vector DB for RAG
```

**Step 2: Ask for Architecture**
```
You: "Design RAG architecture for our docs (1000 pages, needs <3s response)"

Claude: "I'll use the rag-implementer skill and consult rag-pattern.md.

Based on your requirements:
- Docs: 1000 pages (small-medium dataset)
- Response time: <3s
- Existing stack: Express + MongoDB

**Recommended Architecture: Advanced RAG**

[Provides detailed architecture following the pattern...]

**Integration with Existing App:**

1. Add Vector DB: Pinecone (managed, simple setup)
2. New Express route: /api/search/ai
3. Keep existing MongoDB for metadata
4. React component: <AISearchBox />

**Implementation Plan:**

Phase 1 (Week 1): Data Pipeline
- Chunk 1000 docs into ~5000 chunks
- Generate embeddings
- Upload to Pinecone
- Store metadata in MongoDB

Phase 2 (Week 2): API
- POST /api/search/ai endpoint
- Hybrid retrieval implementation
- Response formatting with citations

Phase 3 (Week 3): Frontend
- Search UI component
- Results display with sources
- Loading states

Want me to start with Phase 1 implementation?"
```

---

### Scenario 3: Team Collaboration

**Multiple developers using ai-dev-standards**

**Setup (Team Lead):**

1. **Add to project:**
```bash
git submodule add <repo-url> .ai-dev-standards
```

2. **Create team .cursorrules:**
```markdown
# Project: TeamProject

## AI Development Standards
Repository: ./.ai-dev-standards/
Version: 1.0.0

### Team Guidelines

**Every developer:**
1. Run: git submodule update --init --recursive
2. Ensure Claude loads: .ai-dev-standards/META/PROJECT-CONTEXT.md

**Skills used in this project:**
- frontend-builder (React components)
- api-designer (REST API)
- rag-implementer (AI search feature)

**Code review checklist:**
- [ ] Follows patterns from .ai-dev-standards/STANDARDS/
- [ ] Security checks per best-practices/
- [ ] Performance meets targets
```

3. **Team onboarding doc:**
```markdown
# Using AI Development Standards

## Setup (One-time)

1. Clone repo:
   ```bash
   git clone <project-url>
   cd project
   git submodule update --init --recursive
   ```

2. Install Cursor/Claude Code

3. Open project - Claude automatically loads standards

## Daily Usage

When working with Claude:

"Use the [skill-name] skill to..."
- mvp-builder: Feature prioritization
- frontend-builder: React components
- api-designer: New endpoints
- rag-implementer: AI search features

Claude will follow our team's standards automatically.
```

---

## Verification: Is It Working?

### Test 1: Ask Claude About Standards

```
You: "What skills are available?"

Claude: "Let me check the skill registry...

[Reads ~/ai-dev-standards/META/skill-registry.json]

Available skills:
1. mvp-builder - MVP development and feature prioritization
2. rag-implementer - RAG system implementation
3. product-strategist - Product-market fit validation
... [lists all 12]

Which task are you working on?"
```

**✅ If Claude lists skills → Working correctly**
**❌ If Claude doesn't know → Check .cursorrules path**

---

### Test 2: Request Specific Skill

```
You: "Use the mvp-builder skill to help prioritize features"

Claude: "I'll use the mvp-builder skill.

[Loads ~/ai-dev-standards/SKILLS/mvp-builder/SKILL.md]

Let's use the P0/P1/P2 matrix to prioritize:

**P0 (Must Have - Launch Blockers):**
- Features that validate your riskiest assumption
- Minimum path to deliver core value
...
```

**✅ If Claude references skill concepts (P0/P1/P2, etc.) → Working**
**❌ If Claude doesn't use skill methodology → Path issue**

---

### Test 3: Architecture Decision

```
You: "Should I use RAG or fine-tuning for our docs?"

Claude: "Let me consult the decision framework and RAG pattern.

[Reads DECISION-FRAMEWORK.md and rag-pattern.md]

Based on your use case:
- Documentation: 1000 pages
- Updates: Weekly
- Need source citations

**Recommendation: RAG**

Reasons:
1. Docs change frequently (RAG stays current, fine-tuning needs retraining)
2. Source attribution required (RAG provides citations, fine-tuning doesn't)
3. Smaller dataset (fine-tuning needs 1000s of examples)
...
```

**✅ If Claude references patterns and frameworks → Working well**

---

## Best Practices

### 1. Start Simple

**Week 1:**
- ✅ Add basic .cursorrules
- ✅ Reference 2-3 core skills
- ✅ Use in conversations

**Week 2+:**
- ✅ Add project-specific context
- ✅ Reference more skills as needed
- ✅ Add local customizations

### 2. Be Explicit When Learning

```
❌ Bad: "Build a feature"
✅ Good: "Use the mvp-builder skill to evaluate if this feature is P0"

❌ Bad: "Add search"
✅ Good: "Use rag-implementer skill and rag-pattern.md to design search"
```

### 3. Update .cursorrules as Project Evolves

```markdown
## Current Phase: MVP → Production

**Before (Week 1-4):**
Primary skills: mvp-builder, product-strategist

**Now (Week 5-8):**
Primary skills: frontend-builder, api-designer, rag-implementer

**Next (Week 9-12):**
Primary skills: deployment-advisor, performance-optimizer
```

### 4. Share Learnings

If you discover better approaches, update ai-dev-standards:

```bash
cd ~/ai-dev-standards
# Improve a skill based on project experience
# Update pattern based on what worked
# Add new example
```

---

## Troubleshooting

### Issue: Claude Doesn't Load Context

**Solution:**
```markdown
# In .cursorrules, make paths absolute:

❌ Don't use: ./ai-dev-standards/...
✅ Use: ~/ai-dev-standards/...
or
✅ Use: /full/path/to/ai-dev-standards/...
```

---

### Issue: Skills Not Activating

**Solution:**
Be explicit:
```
You: "Use the mvp-builder skill to help me prioritize"
```

Or verify in .cursorrules:
```markdown
### Instructions for Claude Code

**ALWAYS check for relevant skills in:**
~/ai-dev-standards/META/skill-registry.json

**When user mentions:**
- MVP, features, priorities → mvp-builder
- RAG, search, embeddings → rag-implementer
- API, endpoints, REST → api-designer
```

---

### Issue: Conflicting Guidance

**Solution:**
Set precedence in .cursorrules:
```markdown
## Precedence Order

1. Project-specific requirements (this file)
2. .claude/skills/ (local project skills)
3. ~/ai-dev-standards/SKILLS/ (global skills)

**If conflict:** Project requirements > Global standards
```

---

## Next Steps

1. **Try it now:**
   - Pick an existing or new project
   - Add .cursorrules
   - Ask Claude to use a skill

2. **Iterate:**
   - Add more context as you learn
   - Reference specific skills
   - Update based on what works

3. **Share:**
   - If team project, onboard teammates
   - Document project-specific conventions
   - Contribute improvements back to ai-dev-standards

---

## Templates

### Minimal .cursorrules
```markdown
# Project: [Name]

## AI Standards
Repository: ~/ai-dev-standards/

Load: META/PROJECT-CONTEXT.md, META/HOW-TO-USE.md

Skills: mvp-builder, frontend-builder, api-designer
```

### Full .cursorrules
See examples above for SaaS, AI Knowledge Base, E-commerce

---

**Ready to start?** Pick a project and add `.cursorrules`!
