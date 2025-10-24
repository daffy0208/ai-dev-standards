# .cursorrules Template for Existing Projects

Copy this template to document and improve your existing codebase with ai-dev-standards.

---

## Quick Start

```bash
cd /path/to/your/existing/project
cp ~/ai-dev-standards/TEMPLATES/cursorrules-existing-project.md .cursorrules
# Edit .cursorrules and fill in all [bracketed] sections
```

---

## Template Content

```markdown
# Project: [Your Existing Project Name]

## AI Development Standards
Repository: ~/ai-dev-standards/
Status: Active (Existing Project)

### Instructions for Claude Code

**ALWAYS load on session start:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/META/DECISION-FRAMEWORK.md

**Skills to use for this existing project:**
- frontend-builder (for React/Next.js/Vue changes)
- api-designer (for API modifications/additions)
- performance-optimizer (for optimization work)
- rag-implementer (if adding AI features)
- deployment-advisor (for scaling/infrastructure)
- mvp-builder (for feature prioritization)

### Available Resources
This project has access to:
- **37 Skills** - Specialized methodologies for development, optimization, and architecture
- **34 MCPs** - Executable tools for testing, deployment, analysis, and more
- **9 Tools + 4 Scripts** - Automation utilities for common tasks
- **13 Components** - Reusable UI patterns (auth, forms, errors, feedback)
- **6 Integrations** - Quick setup for OpenAI, Supabase, Stripe, Pinecone, etc.

See `META/` registries for complete resource catalog.

---

## Existing Project Status

### Basic Info
- **Project Name:** [e.g., "TaskMaster Pro"]
- **Age:** [e.g., "Built in 2022, launched 2023, now in production"]
- **Stage:** [Production / Beta / Maintenance / Active Development]
- **Team:** [e.g., "3 developers, 1 designer"]
- **Users:** [e.g., "5,000 active users"]
- **Business:** [e.g., "$10k MRR SaaS" or "Internal tool" or "Open source"]

### What This Project Does
[Brief description - 2-3 sentences]

Example:
"Task management SaaS for remote teams. Users create projects, assign tasks,
track progress with Kanban boards, and get automated reports. Serves 5k teams."

### Why We're Using ai-dev-standards
[What you want to achieve]

- [ ] Faster feature development
- [ ] Better code quality on new features
- [ ] Reduce technical debt gradually
- [ ] Performance improvements
- [ ] Add AI features
- [ ] Better documentation
- [ ] Consistent code patterns
- [ ] [Other: _________________]

---

## Current Tech Stack

### Frontend
- **Framework:** [e.g., "Next.js 14" or "React 18" or "Vue 3"]
- **Language:** [e.g., "TypeScript" or "JavaScript"]
- **State Management:** [e.g., "Redux" or "Zustand" or "Context" or "Pinia"]
- **Styling:** [e.g., "Tailwind CSS" or "styled-components" or "CSS Modules"]
- **Forms:** [e.g., "React Hook Form" or "Formik" or none]
- **Data Fetching:** [e.g., "React Query" or "SWR" or "fetch" or "Axios"]

### Backend
- **Runtime:** [e.g., "Node.js 20" or "Python 3.11" or "Go 1.21"]
- **Framework:** [e.g., "Next.js API routes" or "Express" or "FastAPI" or "Gin"]
- **Database:** [e.g., "PostgreSQL 15" or "MongoDB" or "MySQL"]
- **ORM/Query Builder:** [e.g., "Prisma" or "TypeORM" or "SQLAlchemy" or "raw SQL"]
- **Auth:** [e.g., "NextAuth.js" or "Passport" or "Auth0" or "Clerk"]

### Infrastructure
- **Hosting (Frontend):** [e.g., "Vercel" or "Netlify" or "AWS S3+CloudFront"]
- **Hosting (Backend):** [e.g., "Vercel" or "Railway" or "AWS EC2" or "Heroku"]
- **Database Host:** [e.g., "Railway" or "Supabase" or "AWS RDS" or "MongoDB Atlas"]
- **CDN:** [e.g., "Cloudflare" or "CloudFront" or none]
- **File Storage:** [e.g., "AWS S3" or "Cloudflare R2" or "Supabase Storage"]
- **Monitoring:** [e.g., "Sentry" or "Datadog" or "LogRocket" or none]

---

## Codebase Structure

### Directory Layout
```
[Document your actual structure]

Example for Next.js:
/src
  /components
    /ui              # Reusable UI components
    /features        # Feature-specific components
  /pages
    /api             # API routes
  /lib
    /db.ts           # Database client
    /api.ts          # API utilities
  /hooks             # Custom React hooks
  /types             # TypeScript types
  /utils             # Utility functions
/prisma
  /schema.prisma
/public

Example for separate frontend/backend:
/frontend
  /src
    /components
    /pages
    /hooks
/backend
  /src
    /routes
    /controllers
    /models
    /services
```

### Key Directories Explained
- `/components/ui/` - [e.g., "Shared UI components like Button, Input, Modal"]
- `/components/features/` - [e.g., "Feature-specific like TaskList, UserProfile"]
- `/pages/api/` - [e.g., "All API endpoints, organized by resource"]
- `/lib/` - [e.g., "Database client, API helpers, utilities"]
- [Add your other important directories]

---

## Existing Code Conventions

### CRITICAL: Match These Patterns

#### Component Naming & Structure
```typescript
// ✅ DO THIS (our existing pattern):
[Show your actual component pattern]

Example:
interface TaskListProps {
  userId: string;
  filter?: TaskFilter;
}

export function TaskList({ userId, filter }: TaskListProps) {
  const { data } = useQuery(['tasks', userId], fetchTasks);
  return <div className="task-list">...</div>;
}

// ❌ DON'T DO THIS:
[Show what NOT to do]

Example:
export default function TaskList(props) { ... }  // Don't use default export
const TaskList: React.FC = () => { ... }  // Don't use React.FC
```

#### File Naming
- Components: [e.g., "PascalCase - TaskList.tsx"]
- Hooks: [e.g., "camelCase with use prefix - useTaskList.ts"]
- Utils: [e.g., "camelCase - formatDate.ts"]
- API routes: [e.g., "kebab-case - user-tasks.ts"]
- Types: [e.g., "PascalCase - Task.ts"]

#### State Management Patterns

**For server data (API):**
[e.g., "Use React Query with queries in /hooks/"]

**For UI state:**
[e.g., "Use Zustand stores in /stores/"]

**For forms:**
[e.g., "Use React Hook Form with Zod validation"]

#### API Route Pattern
```typescript
// ✅ Our standard API route pattern:
[Show your actual API pattern]

Example:
export default async function handler(req, res) {
  // 1. Auth check
  const session = await getServerSession(req, res);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // 2. Method handling
  if (req.method === 'GET') {
    // ... handle GET
  }

  if (req.method === 'POST') {
    // 3. Validation
    const validated = schema.parse(req.body);
    // 4. Business logic
    const result = await db.create(validated);
    return res.status(201).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

#### Database Patterns
- Table naming: [e.g., "snake_case - user_tasks"]
- Timestamps: [e.g., "created_at, updated_at (auto-managed by Prisma)"]
- Soft deletes: [e.g., "Use deleted_at timestamp" or "Hard delete"]
- Relations: [e.g., "Explicit foreign keys, no implicit many-to-many"]

---

## Custom Utilities & Helpers

### IMPORTANT: Use These Existing Helpers

[Document your custom utilities so Claude uses them instead of reinventing]

#### Date/Time
```typescript
// ✅ USE THIS:
import { formatDate } from '@/lib/date';
formatDate(date, 'short'); // "Jan 15"
formatDate(date, 'long');  // "January 15, 2024"

// ❌ DON'T reinvent:
new Date().toLocaleDateString();
```

#### API Calls
```typescript
// ✅ USE THIS:
import { api } from '@/lib/api';
const data = await api.get('/tasks');

// ❌ DON'T use raw fetch:
fetch('/api/tasks');
```

#### Error Handling
```typescript
// ✅ USE THIS:
import { handleError } from '@/lib/errors';
try { ... } catch (err) { handleError(err); }

// ❌ DON'T:
catch (err) { console.error(err); }
```

#### Validation
```typescript
// ✅ USE THIS:
import { TaskSchema } from '@/lib/validations';
const validated = TaskSchema.parse(data);

// ❌ DON'T write manual validation
```

[Add your other critical helpers]

---

## Known Technical Debt

### High Priority (Fix First)
- [ ] [e.g., "Search is slow (5s for 10k+ records)"]
- [ ] [e.g., "Auth flow confusing (40% drop-off on signup)"]
- [ ] [e.g., "No tests for payment flow (high risk)"]

### Medium Priority
- [ ] [e.g., "Inconsistent error handling across API routes"]
- [ ] [e.g., "Mixed state management (Redux + Context + local state)"]
- [ ] [e.g., "Large bundle size (500kb, should be <200kb)"]

### Low Priority (Nice to Have)
- [ ] [e.g., "Upgrade Next.js 13 → 14"]
- [ ] [e.g., "Migrate styled-components → Tailwind fully"]
- [ ] [e.g., "Add E2E tests (only have unit tests)"]

---

## Current Roadmap

### This Month
- [ ] [e.g., "Fix search performance"]
- [ ] [e.g., "Add team collaboration features"]
- [ ] [e.g., "Improve mobile responsiveness"]

### Next Quarter
- [ ] [e.g., "Launch mobile app"]
- [ ] [e.g., "Add enterprise SSO"]
- [ ] [e.g., "Build public API"]

### Backlog (Future)
- [ ] [e.g., "AI-powered features"]
- [ ] [e.g., "White-label option"]
- [ ] [e.g., "Integrations (Slack, Teams, etc.)"]

---

## Instructions for Claude

### General Principles

**ALWAYS:**
- ✅ Read existing similar code BEFORE writing new code
- ✅ Match existing patterns exactly (even if not ideal)
- ✅ Ask before major refactors or new dependencies
- ✅ Preserve existing behavior unless fixing bugs
- ✅ Add tests for new code
- ✅ Follow existing naming conventions
- ✅ Use existing utilities from /lib/ and /hooks/
- ✅ Keep changes small and focused

**NEVER:**
- ❌ Refactor working code without being asked
- ❌ Add new dependencies without discussion
- ❌ Change existing API contracts
- ❌ Mix different patterns (use existing, even if imperfect)
- ❌ Skip auth checks or validation
- ❌ Use `any` in TypeScript
- ❌ Bypass existing helpers to reinvent functionality

---

### Task-Specific Instructions

#### When Adding Features
1. **Check for similar features first** - Find existing code doing similar things
2. **Use mvp-builder skill** - Is this P0/P1/P2 on roadmap?
3. **Match existing patterns** - Same file structure, naming, conventions
4. **Integrate cleanly** - New code should look like old code
5. **Add tests** - Unit tests for components, integration for APIs

#### When Fixing Bugs
1. **Understand root cause** - Read surrounding code, don't just patch symptoms
2. **Minimal changes** - Fix the bug, don't refactor everything
3. **Add regression test** - Prevent bug from returning
4. **Document the fix** - Comment explaining why bug occurred

#### When Refactoring
1. **Only if explicitly asked** - Don't refactor unless told to
2. **Use performance-optimizer skill** - For performance refactors
3. **Incremental changes** - One module at a time, small PRs
4. **Measure before/after** - Benchmark improvements
5. **Backwards compatible** - Don't break existing usage

#### When Optimizing Performance
1. **Use performance-optimizer skill**
2. **Profile first** - Identify actual bottleneck, don't guess
3. **Start with low-hanging fruit** - Database indexes, caching, etc.
4. **Measure impact** - Before/after metrics
5. **Monitor costs** - Ensure optimization doesn't increase costs

#### When Adding AI Features
1. **Use rag-implementer skill** - For RAG/search features
2. **Consult rag-pattern.md** - Choose right architecture
3. **Integrate with existing patterns** - Match API route style
4. **Plan data pipeline** - How to get data into system
5. **Monitor costs** - Track LLM + embedding costs

#### When Reviewing Code
1. Check against ai-dev-standards best practices
2. Verify matches existing conventions (above)
3. Check security (auth, validation, injection prevention)
4. Check performance (N+1 queries, bundle size)
5. Ensure tests included

---

## Migration Strategy

### Phase 1: Documentation (Week 1) - CURRENT PHASE
**Goal:** Get familiar, don't change code yet

Tasks:
- [x] Create this .cursorrules file
- [ ] Document 10+ undocumented functions (with Claude's help)
- [ ] Generate README for each major module
- [ ] Create API documentation
- [ ] Write tests for critical untested code

### Phase 2: New Features Only (Weeks 2-4)
**Goal:** Use ai-dev-standards for new work only

Tasks:
- [ ] All new features use appropriate skills
- [ ] New code follows best practices
- [ ] Claude reviews all PRs before human review
- [ ] Track: Are new features higher quality?

### Phase 3: Gradual Improvement (Month 2+)
**Goal:** Slowly improve existing code

Tasks:
- [ ] Fix 1 technical debt item per week
- [ ] Migrate 1 module to better patterns per sprint
- [ ] Increase test coverage 5% per month
- [ ] Optimize 1 slow endpoint per sprint

---

## Success Metrics

Track these to measure impact:

**Week 1:**
- [ ] .cursorrules created and documented
- [ ] 10+ functions documented
- [ ] Team understands how to use ai-dev-standards

**Month 1:**
- [ ] 3+ features built faster with ai-dev-standards
- [ ] Code reviews 30% faster
- [ ] Fewer bugs in new features

**Quarter 1:**
- [ ] Technical debt reduced 25%
- [ ] Test coverage +20%
- [ ] Feature velocity +30%
- [ ] Developer satisfaction improved

---

## Project-Specific Notes

[Add any special context, quirks, or important information]

### Important Quirks
- [e.g., "User IDs are UUIDs, not integers"]
- [e.g., "All dates stored in UTC, converted in UI"]
- [e.g., "Soft deletes used everywhere (deleted_at column)"]

### Business Rules
- [e.g., "Free tier: 10 tasks max, Pro: unlimited"]
- [e.g., "Tasks auto-archive after 90 days of inactivity"]
- [e.g., "File uploads limited to 10MB"]

### Security Requirements
- [e.g., "All API routes must check session.user.id"]
- [e.g., "Rate limit: 100 req/min per user"]
- [e.g., "PII must be encrypted at rest"]

### Performance Targets
- [e.g., "API routes: <500ms (p95)"]
- [e.g., "Page load: <2s (p90)"]
- [e.g., "Database queries: <100ms average"]

---

## Team Context

### Who Works on This
- [e.g., "3 fullstack developers"]
- [e.g., "1 designer (handles all UI/UX)"]
- [e.g., "Solo developer"]

### Code Review Process
- [e.g., "All PRs need 1 approval before merge"]
- [e.g., "Claude reviews first, then human review"]
- [e.g., "Merge to dev, deploy to staging, then prod"]

### Deployment Process
- [e.g., "Push to main → Auto-deploy to production (Vercel)"]
- [e.g., "Manual deploy via Railway dashboard"]
- [e.g., "CI/CD via GitHub Actions"]
```

---

## How to Use This Template

1. **Copy to your project:**
   ```bash
   cp ~/ai-dev-standards/TEMPLATES/cursorrules-existing-project.md /your/project/.cursorrules
   ```

2. **Fill in all `[bracketed]` sections:**
   - Start with "Basic Info" and "Tech Stack"
   - Document your code conventions (critical!)
   - List known technical debt
   - Add your roadmap

3. **Start with documentation tasks:**
   ```
   You: "Document the functions in /lib/db.ts using JSDoc"
   You: "Create a README for the /components/features/ directory"
   You: "Explain what /pages/api/tasks/[id].ts does"
   ```

4. **Move to new features:**
   ```
   You: "Use the mvp-builder skill to evaluate this feature request"
   You: "Add a new API endpoint following our existing pattern"
   You: "Build this component matching our conventions"
   ```

5. **Iterate and improve:**
   - Update .cursorrules as you learn
   - Add more conventions as needed
   - Track what works, adjust what doesn't

---

## Quick Verification

After creating .cursorrules, test it:

**Test 1:**
```
You: "What are our existing code conventions?"
Expected: Claude lists your patterns from .cursorrules
```

**Test 2:**
```
You: "Show me an example of how to create a new component"
Expected: Claude uses your exact pattern from the template
```

**Test 3:**
```
You: "What technical debt should we prioritize?"
Expected: Claude references your "Known Technical Debt" section
```

If all three work ✅ you're ready to use ai-dev-standards!

---

**Next:** See [DOCS/EXISTING-PROJECTS.md](../DOCS/EXISTING-PROJECTS.md) for detailed strategies and examples.
