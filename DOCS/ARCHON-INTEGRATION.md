# Archon + AI-Dev-Standards Integration Guide

**The Two-Layer Architecture for Optimal Development**

**Version:** 1.0.0
**Date:** 2025-10-24
**Status:** Production-Ready ✅

---

## Executive Summary

This guide documents the proven integration pattern between **Archon MCP Server** (strategic layer) and **ai-dev-standards Skills** (tactical layer), creating a powerful two-layer architecture for AI-assisted development.

**Key Insight:** Archon manages WHAT to build and WHEN, while Skills guide HOW to build it well.

**Result:** Strategic coherence + tactical excellence = optimal outcomes

---

## The Two-Layer Architecture

```
┌──────────────────────────────────────────────────┐
│           ARCHON MCP SERVER                      │
│           (Strategic Layer)                      │
│                                                  │
│  • Project management & task tracking           │
│  • Priority-based workflow (P0/P1/P2)          │
│  • Knowledge queries (RAG)                      │
│  • Code example search                          │
│  • Progress tracking & metrics                  │
│  • Context preservation                         │
└─────────────────┬────────────────────────────────┘
                  │
                  │ invokes when needed
                  ↓
┌──────────────────────────────────────────────────┐
│      AI-DEV-STANDARDS SKILLS                     │
│      (Tactical Layer)                            │
│                                                  │
│  • 38 specialized skills                        │
│  • Domain-specific expertise                    │
│  • Implementation patterns                      │
│  • Quality standards                            │
│  • Best practices                               │
└──────────────────────────────────────────────────┘
```

---

## Three-Phase Workflow

### Phase 1: Strategic Planning (Archon)

**Goal:** Understand WHAT to build and WHY

**Steps:**
1. Get next priority task from Archon
2. Conduct Archon research (RAG queries + code examples)
3. Understand project context and requirements
4. Update task status to "doing"

**Archon Commands:**
```typescript
// 1. List tasks by priority
archon:manage_task({
  action: "list",
  filter_by: "status",
  filter_value: "todo"
});

// 2. Get task details
archon:manage_task({
  action: "get",
  task_id: "[task_id]"
});

// 3. Research the domain
archon:perform_rag_query({
  query: "[relevant topic]",
  match_count: 5
});

// 4. Find code examples
archon:search_code_examples({
  query: "[implementation pattern]",
  match_count: 3
});

// 5. Mark as doing
archon:manage_task({
  action: "update",
  task_id: "[task_id]",
  update_fields: { status: "doing" }
});
```

---

### Phase 2: Tactical Execution (Skills)

**Goal:** Implement with domain expertise and best practices

**Steps:**
1. Identify required domain expertise
2. Invoke relevant skill(s) for implementation guidance
3. Implement following both Archon research + Skill guidance
4. Apply patterns and best practices from skills

**Skill Selection:**
- Use task-to-skill mapping (see below)
- Limit to 2-3 skills per task (avoid information overload)
- Invoke primary skills first, then quality skills

**Example:**
```
Task: "Build Visualization Dashboard"

Skills to invoke:
- frontend-builder (primary - React architecture)
- data-visualizer (primary - chart patterns)
- visual-designer (secondary - design system)
- accessibility-engineer (quality - a11y checks)
```

---

### Phase 3: Quality Validation (Dual Check)

**Goal:** Ensure quality before marking complete

**Steps:**
1. Apply quality skill checks (testing, security, performance, a11y)
2. Run validation (tests pass, code quality, documentation)
3. Update Archon task to "review"
4. After user validation → mark "done"
5. Get next task and repeat

**Quality Skills:**
- `testing-strategist` - Test coverage and quality
- `security-engineer` - Security review
- `performance-optimizer` - Performance checks
- `accessibility-engineer` - A11y validation
- `quality-auditor` - Comprehensive audit

**Archon Commands:**
```typescript
// 1. Mark for review
archon:manage_task({
  action: "update",
  task_id: "[task_id]",
  update_fields: { status: "review" }
});

// 2. After user approval
archon:manage_task({
  action: "update",
  task_id: "[task_id]",
  update_fields: { status: "done" }
});

// 3. Get next task
archon:manage_task({
  action: "list",
  filter_by: "status",
  filter_value: "todo"
});
```

---

## Task-to-Skill Mapping

### By Task Type

| Task Type | Primary Skills | Quality Skills |
|-----------|----------------|----------------|
| **Frontend/UI** | frontend-builder, visual-designer, ux-designer | accessibility-engineer |
| **API Development** | api-designer, security-engineer | testing-strategist |
| **Performance Work** | performance-optimizer | quality-auditor |
| **Testing** | testing-strategist | quality-auditor |
| **RAG/Knowledge** | rag-implementer, knowledge-base-manager | data-engineer |
| **Knowledge Graphs** | knowledge-graph-builder, knowledge-base-manager | data-engineer |
| **Data/Analytics** | data-engineer, data-visualizer | performance-optimizer |
| **Documentation** | technical-writer | quality-auditor |
| **Strategy/MVP** | mvp-builder, product-strategist | user-researcher |
| **Deployment** | deployment-advisor, security-engineer | testing-strategist |

### By Project Phase

| Phase | Skills to Use |
|-------|---------------|
| **Discovery** | product-strategist, user-researcher |
| **Design** | ux-designer, visual-designer, api-designer |
| **Implementation** | frontend-builder, api-designer, data-engineer |
| **Quality** | testing-strategist, security-engineer, performance-optimizer |
| **Launch** | deployment-advisor, go-to-market-planner, technical-writer |

### By Quality Concern

| Concern | Skill |
|---------|-------|
| Security | security-engineer |
| Performance | performance-optimizer |
| Accessibility | accessibility-engineer |
| Testing | testing-strategist |
| Documentation | technical-writer |

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Skip Archon for Task Management

**Problem:** Managing tasks manually instead of using Archon

**Impact:** Loses project coherence, no tracking, unclear priorities

**Solution:** Always use Archon as the single source of truth for tasks

---

### ❌ Anti-Pattern 2: Use Skills Without Archon Context

**Problem:** Invoking skills without understanding project context

**Impact:** No alignment with priorities, wasted effort on wrong things

**Solution:** Always get task from Archon first, then invoke skills

---

### ❌ Anti-Pattern 3: Invoke Too Many Skills at Once

**Problem:** Using 5+ skills for a single task

**Impact:** Information overload, conflicting guidance, analysis paralysis

**Solution:** Limit to 2-3 skills per task (1-2 primary, 1 quality)

---

### ❌ Anti-Pattern 4: Rely Only on Archon OR Only on Skills

**Problem:** Using one layer without the other

**Impact:**
- Archon only: Strategic but lacks implementation expertise
- Skills only: Tactical but lacks project context and priorities

**Solution:** Always use BOTH layers together

---

### ❌ Anti-Pattern 5: Don't Update Archon Status

**Problem:** Forgetting to update task status in Archon

**Impact:** Loses track of progress, unclear what's done/in-progress

**Solution:** Update status at each phase (doing → review → done)

---

## Success Patterns

### ✅ Pattern 1: Archon-First, Skills-Enhanced

```
1. Get task from Archon
2. Research with Archon (RAG + code examples)
3. Invoke relevant skills for implementation
4. Implement with combined insights
5. Quality check with quality skills
6. Update Archon (review → done)
```

**Why it works:** Combines strategic context with tactical expertise

---

### ✅ Pattern 2: Two-Stage Research

```
Stage 1: Archon Research
- General understanding of domain
- Existing code examples
- Project-specific context

Stage 2: Skill Guidance
- Specific implementation patterns
- Best practices for the domain
- Quality standards to apply

Result: Informed + expert implementation
```

**Why it works:** Broad context + deep expertise

---

### ✅ Pattern 3: Progressive Skill Invocation

```
1. Primary Skills (implementation)
   - frontend-builder, api-designer, etc.

2. Quality Skills (verification)
   - testing-strategist, security-engineer

3. Specialist Skills (specific concerns)
   - accessibility-engineer, performance-optimizer
```

**Why it works:** Focuses on one aspect at a time, prevents overload

---

## Complete Example Workflow

### Task: "Build Visualization Dashboard" (P1)

#### Phase 1: Archon Research (5 min)

```typescript
// 1. Get task
archon:manage_task({ action: "get", task_id: "dash-123" });
// Result: "Build real-time visualization dashboard for analytics"

// 2. Research domain
archon:perform_rag_query({
  query: "React real-time data visualization best practices",
  match_count: 5
});
// Result: General patterns, library comparisons

// 3. Find code examples
archon:search_code_examples({
  query: "dashboard component React TypeScript",
  match_count: 3
});
// Result: Existing dashboard implementations

// 4. Mark as doing
archon:manage_task({
  action: "update",
  task_id: "dash-123",
  update_fields: { status: "doing" }
});
```

#### Phase 2: Skills Consultation (10 min)

```
Invoke Skills:
- frontend-builder → React/Next.js architecture guidance
- data-visualizer → Chart types, color coding, update patterns
- visual-designer → Design system integration, spacing, hierarchy
```

**Combined Insights:**
- Archon: Project uses Chart.js, existing patterns in codebase
- frontend-builder: Component structure, state management
- data-visualizer: Chart selection, real-time update patterns
- visual-designer: Color palette from design system

#### Phase 3: Implementation (2 hours)

Build dashboard following:
- Archon's code examples as starting point
- frontend-builder's architecture patterns
- data-visualizer's chart recommendations
- visual-designer's design system rules

#### Phase 4: Quality Check (15 min)

```
Invoke Quality Skills:
- accessibility-engineer → ARIA labels, keyboard navigation
- performance-optimizer → Rendering performance, memoization
```

Fix issues found, optimize rendering.

#### Phase 5: Review & Complete (5 min)

```typescript
// 1. Mark for review
archon:manage_task({
  action: "update",
  task_id: "dash-123",
  update_fields: { status: "review" }
});

// 2. User approves

// 3. Mark done
archon:manage_task({
  action: "update",
  task_id: "dash-123",
  update_fields: { status: "done" }
});

// 4. Get next task
archon:manage_task({
  action: "list",
  filter_by: "status",
  filter_value: "todo"
});
```

**Total Time:** ~2.5 hours
**Quality:** High (combined Archon context + Skills expertise)
**Tracking:** Complete (all updates in Archon)

---

## Benefits of Integration

### 1. Strategic Coherence
- All work aligns with project goals (via Archon)
- Clear priorities (P0/P1/P2)
- No wasted effort on wrong things

### 2. Tactical Excellence
- Domain-specific best practices (via Skills)
- Proven patterns and methodologies
- Quality standards built-in

### 3. Compound Intelligence
- Archon provides "what" and "why"
- Skills provide "how" and "how well"
- Together = optimal solutions

### 4. Quality Assurance
- Multi-layer validation
- Both automated checks (Skills) and human review (Archon workflow)

### 5. Knowledge Accumulation
- Archon stores project-specific learnings
- Skills provide evergreen methodologies
- Learning compounds over time

---

## Quick Start Checklist

### Setup (One-Time)

- [ ] Install Archon MCP Server
- [ ] Install ai-dev-standards Skills
- [ ] Create Archon project for your project
- [ ] Define initial tasks with priorities
- [ ] Map tasks to skills (use table above)

### Daily Workflow

- [ ] Start day: Get next P0 task from Archon
- [ ] Research: Use Archon RAG + code search
- [ ] Implement: Invoke relevant skills
- [ ] Quality: Apply quality skill checks
- [ ] Update: Mark task review → done
- [ ] Repeat: Get next task

---

## Troubleshooting

### Problem: Don't know which skills to use

**Solution:** Use task-to-skill mapping table above, start with 1-2 primary skills

### Problem: Skills provide conflicting guidance

**Solution:** Use Archon research to understand project-specific context, follow that

### Problem: Lost track of what I'm working on

**Solution:** Check Archon task status, should have exactly 1 task in "doing" status

### Problem: Tasks taking too long

**Solution:** Break down into smaller tasks in Archon, limit scope with P0/P1/P2

---

## Resources

- **Archon Project Template:** `TEMPLATES/archon-project-template.json`
- **Example Workflow:** `EXAMPLES/archon-workflow-example.md`
- **Skills Catalog:** `.claude/CLAUDE.md` (38 skills with descriptions)
- **This Project:** `ARCHON-PROJECT.json` (ai-dev-standards Phase 2 plan)

---

## Next Steps

1. **Set up integration** - Follow setup checklist above
2. **Try the workflow** - Start with one task following three-phase pattern
3. **Refine your mappings** - Adjust task-to-skill mappings based on learnings
4. **Share learnings** - Document what works in your Archon project

---

**Remember:** Archon manages WHAT to build, Skills guide HOW to build it well. Together they create optimal outcomes.

**Questions?** See the example workflow above or review `ARCHON-PROJECT.json` for a real implementation.
