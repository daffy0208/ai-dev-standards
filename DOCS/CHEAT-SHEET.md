# ai-dev-standards Cheat Sheet

Quick reference for common tasks and scenarios.

---

## Setup Commands

### New Project
```bash
# Minimal setup
cp ~/ai-dev-standards/TEMPLATES/cursorrules-minimal.md .cursorrules

# SaaS project
cp ~/ai-dev-standards/TEMPLATES/cursorrules-saas.md .cursorrules

# AI/RAG project
cp ~/ai-dev-standards/TEMPLATES/cursorrules-ai-rag.md .cursorrules
```

### Existing Project
```bash
# Document existing codebase
cp ~/ai-dev-standards/TEMPLATES/cursorrules-existing-project.md .cursorrules
# Then fill in your tech stack and conventions
```

---

## Common Conversations

### Feature Prioritization

**Scenario:** User requested a feature, decide if you should build it

```
You: "A user wants Gantt chart view. Should we build it?"

Expected Claude Response (using mvp-builder):
- Asks: How many users requested this? (Need 5-10 to validate)
- Classifies as P0/P1/P2 based on roadmap
- Estimates effort vs value
- Recommends: Build / Validate first / Decline

Follow-up:
"Use the mvp-builder skill to prioritize our feature backlog"
```

---

### Architecture Decisions

**Scenario:** Choosing between technical approaches

```
You: "Should I use RAG or fine-tuning for our 1000-doc knowledge base?"

Expected Claude Response (using DECISION-FRAMEWORK + rag-pattern):
- Compares RAG vs fine-tuning
- Considers: data size, update frequency, cost, citations needed
- Recommends based on your specific requirements
- Explains trade-offs clearly

Alternatives:
"Should I use PostgreSQL or MongoDB?"
"Should I use REST or GraphQL?"
"Should I use Redux or Zustand?"
```

---

### Adding New Features

**Scenario:** Build a new feature following existing patterns

```
You: "Add a feature to archive tasks. Match our existing code style."

Expected Claude Response:
1. Reads similar existing code (e.g., delete tasks feature)
2. Follows same pattern (UI → API → Database)
3. Matches naming conventions
4. Includes tests
5. Uses existing utilities

Verify:
- Component named correctly (TaskArchiveButton.tsx)
- API route follows pattern (/api/tasks/[id]/archive.ts)
- Uses existing auth/validation utilities
```

---

### Performance Optimization

**Scenario:** Something is slow, need to fix it

```
You: "Our search takes 5 seconds for 10k records. Fix this."

Expected Claude Response (using performance-optimizer):
1. Profiles current implementation
2. Identifies bottleneck (e.g., missing database index)
3. Proposes solutions ranked by effort/impact
4. Recommends incremental approach
5. Provides implementation

Follow-up:
"Optimize the dashboard page load time"
"Why is this API endpoint slow?"
"Reduce the bundle size of our app"
```

---

### Adding AI Features

**Scenario:** Add RAG-powered search to existing app

```
You: "Add AI search to our 5k documentation pages, need <2s response"

Expected Claude Response (using rag-implementer + rag-pattern):
1. Chooses architecture (Advanced RAG for 5k docs)
2. Selects components (Pinecone, OpenAI, re-ranker)
3. Designs pipeline (query → retrieval → LLM)
4. Integrates with existing code patterns
5. Provides cost estimates

Alternatives:
"Add AI-powered task suggestions"
"Add chatbot to answer customer questions"
"Add semantic search to our product catalog"
```

---

### Bug Fixes

**Scenario:** Fix a bug in existing code

```
You: "Tasks not showing for new users - investigate and fix"

Expected Claude Response:
1. Reads relevant code to understand flow
2. Identifies root cause
3. Proposes minimal fix (don't refactor everything)
4. Adds regression test
5. Documents why bug occurred

Verify:
- Fix is minimal (doesn't refactor unrelated code)
- Preserves existing behavior
- Includes test to prevent regression
```

---

### Code Review

**Scenario:** Review a PR before merging

```
You: "Review this PR: [describe changes]"

Expected Claude Response:
1. Checks against ai-dev-standards best practices
2. Verifies security (auth, validation, injection prevention)
3. Checks performance (N+1 queries, bundle size)
4. Ensures tests included
5. Verifies matches existing code style

Provides:
- ✅ What's good
- ⚠️ Needs attention
- ❌ Must fix before merge
- 💡 Suggestions for future
```

---

### Refactoring

**Scenario:** Improve existing code

```
You: "Refactor this module for better performance"

Expected Claude Response (using performance-optimizer):
1. Measures current performance (baseline)
2. Identifies optimization opportunities
3. Refactors incrementally (not big bang)
4. Measures after (shows improvement)
5. Ensures tests still pass

Verify:
- Backwards compatible (same behavior)
- Measured improvement (not premature optimization)
- Tests updated and passing
```

---

### Documentation

**Scenario:** Document existing code

```
You: "Document all functions in /lib/db.ts using JSDoc"

Expected Claude Response:
- Reads each function
- Adds JSDoc comments with params, returns, examples
- Documents edge cases
- Explains business logic

Follow-up:
"Create a README for the /components directory"
"Explain what this component does"
"Document our API endpoints in OpenAPI format"
```

---

### Deployment Decisions

**Scenario:** Choose where to host your app

```
You: "Where should I deploy my Next.js app? Budget: $50/month, expect 10k users"

Expected Claude Response (using deployment-advisor):
1. Considers your stack, budget, scale
2. Recommends platform (e.g., Vercel + Railway)
3. Explains 3-tier pricing strategy
4. Provides upgrade path
5. Estimates actual costs

Alternatives:
"Should I use AWS or Vercel?"
"How do I scale from 1k to 100k users?"
"What's the cheapest way to deploy?"
```

---

### Go-to-Market Planning

**Scenario:** Planning a product launch

```
You: "I'm launching in 4 weeks. Help me plan the launch."

Expected Claude Response (using go-to-market-planner):
1. Uses 6-week launch timeline
2. Covers: positioning, messaging, channels, metrics
3. Suggests Product Hunt, email, social strategy
4. Provides checklist with deadlines
5. Defines success criteria

Follow-up:
"Write the launch blog post"
"Create positioning statement for landing page"
"Plan Product Hunt launch day activities"
```

---

## Skill Quick Reference

### When to Use Which Skill

| Scenario | Skill | Example Prompt |
|----------|-------|----------------|
| Feature prioritization | `mvp-builder` | "Should we build this feature?" |
| Product validation | `product-strategist` | "How do we validate this idea?" |
| Launch planning | `go-to-market-planner` | "Plan our product launch" |
| AI search/RAG | `rag-implementer` | "Add AI search to docs" |
| Multi-agent systems | `multi-agent-architect` | "Design agent workflow" |
| Knowledge graphs | `knowledge-graph-builder` | "Model our data as graph" |
| React/Next.js | `frontend-builder` | "Build this component" |
| REST/GraphQL APIs | `api-designer` | "Design the API" |
| Infrastructure | `deployment-advisor` | "Where should I deploy?" |
| Performance issues | `performance-optimizer` | "Why is this slow?" |
| User research | `user-researcher` | "How to interview users?" |
| UX design | `ux-designer` | "Design user flow" |

---

## Common .cursorrules Snippets

### Tell Claude About Your Stack

```markdown
## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind
- Backend: Next.js API routes, Prisma
- Database: PostgreSQL (Railway)
- Deployment: Vercel
```

---

### Document Code Patterns

```markdown
## Code Conventions

### Component Pattern (MATCH THIS)
```typescript
interface TaskCardProps {
  task: Task;
  onEdit: (id: string) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  return <div>{task.title}</div>;
}
```
```

---

### Prevent Unwanted Refactoring

```markdown
## Refactoring Policy

**NEVER refactor existing working code unless explicitly asked.**

When adding features:
- ✅ Match existing patterns
- ✅ Add new code in new files
- ❌ Don't refactor surrounding code
```

---

### Document Custom Utilities

```markdown
## Custom Utilities (USE THESE)

### Date Formatting
```typescript
// ✅ USE THIS:
import { formatDate } from '@/lib/date';

// ❌ DON'T reinvent:
new Date().toLocaleDateString();
```
```

---

## Verification Tests

### Test 1: Skills Loaded
```
You: "What skills are available?"
Expected: Claude lists all 12 skills
```

### Test 2: Skill Activation
```
You: "Use the mvp-builder skill to prioritize features"
Expected: Claude references P0/P1/P2 matrix
```

### Test 3: Pattern Consultation
```
You: "Should I use RAG for this?"
Expected: Claude references rag-pattern.md
```

### Test 4: Code Conventions
```
You: "Show me how to create a component"
Expected: Claude uses YOUR exact pattern from .cursorrules
```

---

## Troubleshooting

### Claude Not Loading Standards

**Problem:** Claude doesn't seem to know about ai-dev-standards

**Fix:**
```markdown
# In .cursorrules, use absolute path:
Repository: ~/ai-dev-standards/

# NOT:
Repository: ./ai-dev-standards/  ❌
Repository: ai-dev-standards/    ❌
```

---

### Skills Not Activating

**Problem:** Claude doesn't use skills automatically

**Fix:** Be explicit:
```
"Use the [skill-name] skill to..."
"Reference rag-pattern.md for this"
"Check DECISION-FRAMEWORK.md for guidance"
```

---

### Claude Refactors Everything

**Problem:** Asked to add feature, Claude refactors entire codebase

**Fix:** Add to .cursorrules:
```markdown
## Instructions for Claude

**NEVER refactor existing code unless explicitly asked.**

When adding features:
- Match existing patterns exactly
- Don't "improve" working code
- Focus on the requested feature only
```

---

### Claude Ignores Existing Patterns

**Problem:** New code doesn't match existing style

**Fix:** Show examples in .cursorrules:
```markdown
## Code Conventions (CRITICAL: MATCH THESE)

### ✅ DO THIS (our pattern):
[paste actual example from your code]

### ❌ DON'T DO THIS:
[show what to avoid]
```

---

## Quick Commands

### Setup
```bash
# Copy template
cp ~/ai-dev-standards/TEMPLATES/[template-name].md .cursorrules

# Verify location
ls ~/ai-dev-standards/

# Open in editor
code .cursorrules
```

### Usage
```bash
# Open project in Claude Code
cursor .

# Or VS Code with Claude
code .
```

---

## Example Workflows

### Workflow 1: New Feature

```
1. You: "A user requested [feature]. Should we build it?"
   → Claude uses mvp-builder to evaluate

2. You: "Yes, let's build it. Design the API."
   → Claude uses api-designer to design endpoint

3. You: "Now build the frontend component."
   → Claude uses frontend-builder matching your patterns

4. You: "Review this implementation."
   → Claude checks against standards

5. You: "Write tests for this."
   → Claude writes comprehensive tests
```

---

### Workflow 2: Bug Fix

```
1. You: "Users report [bug]. Investigate."
   → Claude reads relevant code

2. You: "What's causing this?"
   → Claude explains root cause

3. You: "Fix it minimally, don't refactor."
   → Claude provides focused fix

4. You: "Add a test to prevent regression."
   → Claude writes test for bug
```

---

### Workflow 3: Performance Issue

```
1. You: "[Feature] is slow. Profile and fix."
   → Claude uses performance-optimizer to profile

2. Claude identifies bottleneck
   → Recommends solutions ranked by effort/impact

3. You: "Implement the quick wins first."
   → Claude adds indexes, caching, etc.

4. You: "Measure the improvement."
   → Claude benchmarks before/after
```

---

## Copy-Paste Prompts

### Feature Evaluation
```
Use the mvp-builder skill to evaluate if we should build [feature].
Consider: effort, impact, current roadmap, user demand.
```

### Architecture Decision
```
Use DECISION-FRAMEWORK.md to help me decide between [option A] and [option B]
for [use case]. Explain trade-offs.
```

### Code Review
```
Review this code against ai-dev-standards best practices.
Check: security, performance, tests, existing patterns.
```

### Performance Fix
```
Use performance-optimizer skill to fix [slow operation].
Profile, identify bottleneck, recommend solutions ranked by effort/impact.
```

### Add AI Feature
```
Use rag-implementer skill and rag-pattern.md to add AI-powered [feature].
Data: [describe data], Users: [count], Budget: [amount].
```

---

## Resources

- **Full docs:** ~/ai-dev-standards/DOCS/
- **Templates:** ~/ai-dev-standards/TEMPLATES/
- **Skills:** ~/ai-dev-standards/SKILLS/
- **Patterns:** ~/ai-dev-standards/STANDARDS/architecture-patterns/
- **Main README:** ~/ai-dev-standards/README.md

---

**Print this and keep it handy! 📄**
