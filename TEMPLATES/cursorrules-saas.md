# SaaS Project .cursorrules Template

For new SaaS applications - includes MVP prioritization and go-to-market planning.

```markdown
# Project: [Your SaaS Name]

## AI Development Standards
Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**Always load these files first:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/META/DECISION-FRAMEWORK.md

**Check skill registry for relevant skills:**
- ~/ai-dev-standards/META/skill-registry.json

### Available Resources
This project has access to:
- **37 Skills** - Specialized development methodologies
- **34 MCPs** - Executable development tools (92% skill coverage)
- **9 Tools + 4 Scripts** - LangChain, CrewAI, custom utilities
- **13 Components** - Reusable React components (auth, forms, errors, feedback)
- **6 Integrations** - OpenAI, Anthropic, Supabase, Stripe, Pinecone, Resend

See registries in `META/` for complete details:
- skill-registry.json, mcp-registry.json, tool-registry.json
- component-registry.json, integration-registry.json
- relationship-mapping.json (dependency graph)

### Primary Skills for This Project
- **mvp-builder** - Feature prioritization with P0/P1/P2
- **product-strategist** - Market validation and problem-solution fit
- **frontend-builder** - React/Next.js development
- **api-designer** - REST API design
- **deployment-advisor** - Infrastructure decisions
- **go-to-market-planner** - Launch strategy (when ready)

---

## Project Context

### What We're Building
[Brief description: e.g., "Task management SaaS for remote teams"]

### Target Customer
- **Who:** [e.g., "Remote teams of 5-50 people"]
- **Industry:** [e.g., "Tech startups, agencies"]
- **Pain Point:** [e.g., "Scattered tasks across Slack, email, docs"]

### Current Phase
- [x] Idea Validation
- [ ] MVP Development (Weeks 1-8)
- [ ] Beta Launch (Week 9)
- [ ] Production Launch (Week 12)

---

## Tech Stack

### Frontend
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Components: shadcn/ui
- State: React Query + Zustand

### Backend
- Runtime: Node.js
- API: Next.js API Routes
- ORM: Prisma
- Validation: Zod

### Database
- Primary: PostgreSQL
- Hosting: [e.g., Supabase, Railway]

### Authentication
- Provider: [e.g., NextAuth.js, Clerk, Supabase Auth]

### Deployment
- Frontend: Vercel
- Database: [e.g., Railway, Supabase]
- File Storage: [e.g., Cloudflare R2, Supabase Storage]

---

## MVP Scope (8 Weeks)

### Riskiest Assumptions to Validate
1. [e.g., "Teams want real-time collaboration vs async updates"]
2. [e.g., "Visual timeline view is valuable"]
3. [e.g., "Will pay $10-20/user/month"]

### P0 Features (Must Have - Launch Blockers)
- [ ] User authentication
- [ ] Create/edit/delete [core entity]
- [ ] [Critical feature 1]
- [ ] [Critical feature 2]
- [ ] Basic notifications

### P1 Features (Should Have - Post-MVP)
- [ ] Real-time updates
- [ ] File attachments
- [ ] Comments/collaboration
- [ ] Email notifications
- [ ] Mobile responsive

### P2 Features (Nice to Have - Future)
- [ ] AI-powered suggestions
- [ ] Advanced analytics
- [ ] Integrations (Slack, etc.)
- [ ] Mobile app
- [ ] API for developers

---

## Code Conventions

### File Structure
```
/app                 # Next.js 14 App Router
  /api              # API routes
  /[route]          # Pages
/components
  /ui               # shadcn/ui components
  /features         # Feature-specific components
/lib
  /db               # Database utilities
  /api              # API client utilities
/types              # TypeScript types
```

### Naming
- Components: PascalCase (e.g., `TaskList.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)
- Database tables: snake_case (e.g., `user_tasks`)

### Component Guidelines
- Use server components by default
- Mark client components with `'use client'`
- Extract reusable logic to hooks
- Keep components under 200 lines

### API Routes
- RESTful naming: `/api/tasks`, `/api/tasks/:id`
- Validate input with Zod
- Return consistent error format
- Include proper status codes

---

## Security & Quality

### Security Requirements
- ✅ Input validation on all forms
- ✅ SQL injection prevention (via Prisma)
- ✅ XSS prevention (React default escaping)
- ✅ CSRF protection (NextAuth.js)
- ✅ Rate limiting on API routes
- ✅ Environment variables for secrets

### Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- API response time: <500ms (p95)
- Database queries: <100ms average

### Testing Strategy
- Unit tests: Critical business logic
- Integration tests: API routes
- E2E tests: Core user flows (auth, create task, etc.)

---

## Development Workflow

### Git Workflow
- Main branch: `main` (production)
- Development: `dev`
- Features: `feature/[name]`
- Fixes: `fix/[name]`

### Commit Messages
- Format: `[type]: [description]`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat: add task creation form`

### Code Review
- Required for all PRs
- Check against ai-dev-standards
- Run tests before merging

---

## Instructions for Claude

### When I Ask About Features
1. Use **mvp-builder** skill to determine P0/P1/P2
2. Validate against riskiest assumptions
3. Recommend MVP pattern if applicable

### When I Ask About Architecture
1. Consult **DECISION-FRAMEWORK.md**
2. Reference relevant patterns from STANDARDS/
3. Explain trade-offs clearly

### When Writing Code
1. Follow **frontend-builder** or **api-designer** skills
2. Match code conventions above
3. Include error handling and validation
4. Add TypeScript types

### When Discussing Launch
1. Use **go-to-market-planner** skill
2. Reference 6-week timeline
3. Help with positioning and messaging

---

## Project-Specific Notes

[Add any custom requirements, constraints, or context here]

### Business Model
- Pricing: [e.g., "$10/user/month, $8/user if annual"]
- Free tier: [e.g., "Up to 3 users, unlimited tasks"]
- Commission: [if applicable]

### Competitors
- [Competitor 1]: [Their strength/weakness]
- [Competitor 2]: [Their strength/weakness]

### Our Differentiation
- [What makes you different]
```

## How to Use

1. Copy this entire template
2. Save as `.cursorrules` in your project root
3. Fill in all `[bracketed]` sections
4. Remove sections that don't apply
5. Add project-specific sections as needed
6. Claude will automatically follow these guidelines
