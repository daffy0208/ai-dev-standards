# The Repository Brain

**Purpose**: Central intelligence system that manages, understands, creates, updates, and orchestrates everything in ai-dev-standards

**Date**: 2025-10-25
**Status**: 🏗️ DESIGN PHASE

---

## The Critical Need

### The Problem
We have 105 resources (38 skills, 35 MCPs, tools, components, integrations) but **no central brain** to:
- ✅ Know the complete state at all times
- ✅ Understand all relationships between components
- ✅ Decide when to use which skill/MCP/pattern
- ✅ Orchestrate updates systematically
- ✅ Prevent drift and maintain coherence
- ✅ Enforce processes automatically

### The Risk
**Without a brain**: Massive drift, documentation falls behind, processes forgotten, tool loses value

### The Solution
**Repository Brain**: Hybrid intelligence system combining:
1. **Knowledge Layer** - Complete understanding (registries + mappings)
2. **Decision Layer** - Workflow orchestration (rules + AI)
3. **Enforcement Layer** - Automated validation (scripts + hooks)
4. **Management Layer** - Strategic planning (Archon)

---

## Architecture: The Four Layers

```
┌─────────────────────────────────────────────────────────┐
│            LAYER 4: MANAGEMENT (Archon)                 │
│            Strategic: WHAT to build, WHEN               │
│  • Task prioritization                                  │
│  • Project roadmap                                      │
│  • Context & history                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│         LAYER 3: DECISION (Meta-Agent + Rules)          │
│         Operational: HOW to build, WHY this way         │
│  • Workflow selection (which process to follow)         │
│  • Skill/MCP selection (which tools to use)             │
│  • Pattern selection (which architecture)               │
│  • Complex decision-making                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│      LAYER 2: ENFORCEMENT (Automated Systems)           │
│      Quality: Ensure correctness automatically          │
│  • validate-sync.sh (documentation sync)                │
│  • Git hooks (pre-commit checks)                        │
│  • CI/CD (automated testing)                            │
│  • Relationship validation                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│       LAYER 1: KNOWLEDGE (Registries + Mappings)        │
│       Foundation: Complete understanding of state       │
│  • skill-registry.json (38 skills)                      │
│  • mcp-registry.json (35 MCPs)                          │
│  • relationship-mapping.json (all connections)          │
│  • file-dependencies (what affects what)                │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: Knowledge (Foundation)

### Purpose
Single source of truth for current state

### Components

**1. Registries** (What exists)
- `META/skill-registry.json` - All 38 skills
- `META/mcp-registry.json` - All 35 MCPs
- `META/tool-registry.json` - All tools
- `META/component-registry.json` - All components
- `META/integration-registry.json` - All integrations

**2. Mappings** (How they relate)
- `META/relationship-mapping.json` - Complete dependency graph
- Skills → MCPs → Tools → Components → Integrations
- File dependencies (which files need updating when)

**3. Metadata** (Context)
- Triggers (when skills activate)
- Tags (categorization)
- Related resources (cross-references)
- Status (active/deprecated)

### Brain Capabilities at This Layer
```javascript
// Query current state
brain.getSkillCount() → 38
brain.getSkill('mvp-builder') → {name, description, triggers, ...}
brain.getSkillsByCategory('product-development') → [...]
brain.getMCPsForSkill('rag-implementer') → ['vector-database-mcp', ...]
brain.getRelatedSkills('api-designer') → ['security-engineer', ...]

// Validate state
brain.validateRegistries() → {valid: true/false, errors: [...]}
brain.checkSync() → {inSync: true/false, outdated: [...]}
```

---

## Layer 2: Enforcement (Automation)

### Purpose
Automatically enforce correctness, prevent drift

### Components

**1. Validation Scripts**
```bash
# scripts/validate-sync.sh
# BLOCKS commits if registries/docs out of sync
# Runs automatically via git hooks
```

**2. Pre-Commit Hooks**
```bash
# .git/hooks/pre-commit
#!/bin/bash
bash scripts/validate-sync.sh || exit 1
bash scripts/validate-relationships.sh || exit 1
bash scripts/validate-examples.sh || exit 1
```

**3. CI/CD Checks**
```yaml
# .github/workflows/validation.yml
- Validate all registries
- Check documentation sync
- Test skill invocation
- Verify examples work
```

**4. Automated Tests**
```bash
# scripts/test-brain.sh
- Test that brain can query all resources
- Test decision-making logic
- Test workflow orchestration
```

### Brain Capabilities at This Layer
```javascript
// Enforce rules
brain.runValidation() → {passed: true/false, errors: [...]}
brain.blockIfInvalid() → exits with code 1 if invalid
brain.enforceSync() → updates all necessary files

// Monitor health
brain.healthCheck() → {status: 'healthy'|'degraded'|'critical', issues: [...]}
```

---

## Layer 3: Decision (Intelligence)

### Purpose
Decide WHICH workflow, WHICH skills, WHICH patterns to use

### Components

**1. Workflow Decision Engine**
```typescript
// scripts/brain/workflow-engine.ts
interface WorkflowDecision {
  scenario: string;
  workflow: string[];
  skills: string[];
  mcps: string[];
  patterns: string[];
  reasoning: string;
}

class WorkflowEngine {
  decide(scenario: Scenario): WorkflowDecision {
    // Rules-based + AI-assisted decision making
  }
}
```

**Example Decisions**:
```
Scenario: "Add new feature to existing app"
→ Workflow: [Load context, Check playbooks, Invoke skills, Build, Test, Validate]
→ Skills: [mvp-builder, frontend-builder, security-engineer]
→ MCPs: [component-generator-mcp, test-runner-mcp]
→ Patterns: [relevant architecture pattern]
→ Reasoning: "Feature work requires prioritization (mvp-builder) + implementation..."
```

**2. Skill Selection Engine**
```typescript
class SkillSelector {
  select(task: string, context: Context): string[] {
    // Analyzes task description
    // Matches against skill triggers and descriptions
    // Returns ranked list of relevant skills
  }
}
```

**3. MCP Integration Engine**
```typescript
class MCPIntegrator {
  getRequiredMCPs(skills: string[]): string[] {
    // Given selected skills, determines required MCPs
    // Checks relationship-mapping.json
    // Returns complete MCP dependency list
  }
}
```

**4. Pattern Matcher**
```typescript
class PatternMatcher {
  matchPattern(problem: string): Pattern[] {
    // Matches problem to architecture patterns
    // Returns relevant patterns with trade-offs
  }
}
```

### Brain Capabilities at This Layer
```javascript
// Make decisions
brain.decideWorkflow('add authentication') → WorkflowDecision
brain.selectSkills('build MVP') → ['mvp-builder', 'frontend-builder', ...]
brain.selectMCPs(['rag-implementer']) → ['vector-database-mcp', ...]
brain.selectPattern('knowledge base') → ['rag-pattern', 'knowledge-graph-pattern']

// Explain reasoning
brain.explainDecision(decision) → "Using mvp-builder because..."
```

---

## Layer 4: Management (Archon)

### Purpose
Strategic planning, task management, context preservation

### Components

**1. Archon Project for ai-dev-standards**
```json
{
  "project_name": "ai-dev-standards",
  "current_phase": "Phase 2: Knowledge Base & Mastery",
  "tasks": [
    {
      "id": "P0-BRAIN",
      "title": "Implement Repository Brain",
      "status": "doing",
      "skills_to_use": ["multi-agent-architect", "rag-implementer"],
      "archon_workflow": [...]
    }
  ]
}
```

**2. Task Orchestration**
- Archon decides WHAT to work on (priority, dependencies)
- Brain decides HOW to work on it (workflow, tools)
- Enforcement ensures quality (validation, tests)

**3. Context & History**
- All decisions logged in Archon
- RAG queries for research
- Code example search
- Learning accumulation

### Brain Capabilities at This Layer
```javascript
// Strategic planning
brain.getNextTask() → Task from Archon
brain.researchTask(task) → Archon RAG + code examples
brain.updateTaskStatus(task, 'doing') → Archon update

// Context management
brain.getProjectContext() → Complete ai-dev-standards state
brain.getTaskHistory() → All completed tasks
brain.getLearnings() → Accumulated knowledge
```

---

## How The Brain Works: Complete Example

### Scenario: User asks "Add Supabase skill"

#### Step 1: Management Layer (Archon)
```typescript
// Get task from Archon
const task = brain.getNextTask();
// → {id: 'P0-4', title: 'Add Supabase skill', priority: 'P0'}

// Research
const research = brain.researchTask('Supabase development patterns');
// → RAG results: existing integrations, patterns, examples

// Update status
brain.updateTaskStatus('P0-4', 'doing');
```

#### Step 2: Decision Layer (Intelligence)
```typescript
// Decide workflow
const workflow = brain.decideWorkflow('add new skill');
// → ['Check official MCPs', 'Create skill', 'Update registries', 'Validate']

// Select skills for guidance
const guidanceSkills = brain.selectSkills('database development');
// → ['api-designer', 'security-engineer', 'data-engineer']

// Determine files to update
const filesToUpdate = brain.getFilesToUpdate('add skill');
// → All 20 files from MANDATORY-UPDATE-CHECKLIST.md
```

#### Step 3: Enforcement Layer (Validation)
```typescript
// Before starting
brain.validateCurrentState();
// → Ensures clean starting point

// During development
brain.trackChanges(['SKILLS/supabase-developer/', 'META/skill-registry.json']);

// Before committing
const validation = brain.runValidation();
if (!validation.passed) {
  throw new Error('Validation failed: ' + validation.errors);
}
// → validate-sync.sh runs, checks all 14 files
```

#### Step 4: Knowledge Layer (State Update)
```typescript
// Update registries
brain.addSkill({
  name: 'supabase-developer',
  description: 'Build with Supabase...',
  triggers: ['supabase', 'postgresql', 'backend'],
  related_skills: ['api-designer', 'security-engineer'],
  // ...
});

// Update relationships
brain.updateRelationships('supabase-developer', {
  required_mcps: ['supabase-mcp'], // NOTE: Using official MCP
  related_skills: ['api-designer', 'security-engineer']
});

// Verify state
brain.getSkillCount(); // → 39 (was 38)
brain.checkSync(); // → true (all docs updated)
```

#### Step 5: Management Layer (Complete)
```typescript
// Mark task complete
brain.updateTaskStatus('P0-4', 'review');

// After user approval
brain.updateTaskStatus('P0-4', 'done');

// Get next task
const nextTask = brain.getNextTask();
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal**: Basic brain infrastructure

**Tasks**:
1. ✅ Create `scripts/brain/` directory
2. ✅ Implement `brain-core.ts` - Core brain class
3. ✅ Implement `knowledge-layer.ts` - Registry queries
4. ✅ Implement `enforcement-layer.ts` - Validation wrapper
5. ✅ Basic CLI: `brain status` command

**Deliverable**: Can query current state and run validation

### Phase 2: Intelligence (Week 2)

**Goal**: Decision-making capabilities

**Tasks**:
1. ✅ Implement `workflow-engine.ts` - Workflow decisions
2. ✅ Implement `skill-selector.ts` - Skill selection
3. ✅ Implement `mcp-integrator.ts` - MCP dependencies
4. ✅ Create `DECISION-RULES.md` - Codified decision logic
5. ✅ CLI commands: `brain decide`, `brain select-skills`

**Deliverable**: Can make workflow and tool selection decisions

### Phase 3: Archon Integration (Week 3)

**Goal**: Full strategic + tactical orchestration

**Tasks**:
1. ✅ Set up Archon project for ai-dev-standards
2. ✅ Implement `archon-layer.ts` - Archon API wrapper
3. ✅ Create task templates for common work
4. ✅ Integrate brain with Archon workflows
5. ✅ CLI commands: `brain next-task`, `brain research`

**Deliverable**: Complete 4-layer brain operational

### Phase 4: Automation (Week 4)

**Goal**: Fully automated drift prevention

**Tasks**:
1. ✅ Set up git hooks (pre-commit, pre-push)
2. ✅ Create CI/CD workflows
3. ✅ Implement health monitoring
4. ✅ Create dashboard: `brain dashboard`
5. ✅ Documentation: How to use the brain

**Deliverable**: Self-maintaining repository

---

## Brain CLI Commands

```bash
# Status & Health
brain status                    # Current state (38 skills, 35 MCPs, etc.)
brain health                    # Health check (in sync, no errors)
brain validate                  # Run all validations

# Query Knowledge
brain list skills               # List all skills
brain list mcps                 # List all MCPs
brain show skill mvp-builder    # Show skill details
brain search "authentication"   # Search across resources

# Decision Making
brain decide "add new feature"  # Get workflow recommendation
brain select-skills "build MVP" # Get skill recommendations
brain select-mcps rag-implementer # Get required MCPs

# Relationships
brain relationships skill mvp-builder # Show all relationships
brain dependencies skill rag-implementer # Show all dependencies
brain reverse-deps mcp vector-database-mcp # What uses this MCP?

# Archon Integration
brain next-task                 # Get next priority task from Archon
brain research "RAG patterns"   # Query Archon knowledge base
brain update-task P0-4 doing    # Update task status

# Maintenance
brain sync                      # Ensure all docs in sync
brain audit                     # Full system audit
brain fix                       # Auto-fix common issues
brain dashboard                 # Interactive dashboard
```

---

## Usage Examples

### Example 1: Daily Development

```bash
# Start your day
$ brain next-task
→ Task P0-5: Add testing-strategist enhancements
  Priority: P0
  Skills to use: testing-strategist, quality-auditor
  Estimated: 4 hours

# Get workflow
$ brain decide "enhance existing skill"
→ Workflow: [Research, Load skill, Identify gaps, Enhance, Test, Update docs, Validate]
  Estimated time: 4 hours
  Files to update: SKILLS/testing-strategist/, META/skill-registry.json, DOCS/

# Do the work...

# Before committing
$ brain validate
→ ✓ All registries valid
  ✓ All documentation in sync
  ✓ All relationships correct
  Ready to commit!

# Update Archon
$ brain update-task P0-5 done
→ Task marked complete
  Next task: P1-1
```

### Example 2: Adding New Resource

```bash
# Check current state
$ brain status
→ 38 skills, 35 MCPs, 105 total resources
  Last updated: 2025-10-25
  Health: Good ✓

# Research if it exists
$ brain search "deployment"
→ Found:
  - deployment-advisor (skill)
  - deployment-orchestrator-mcp
  - deploy-to-production.md (playbook)

# Decide approach
$ brain decide "add new deployment tool"
→ Recommendation: Enhance existing deployment-advisor skill
  Reasoning: Feature exists, enhancement better than duplication
  Alternative: If fundamentally different, create new skill

# If creating new...
$ brain show checklist "add skill"
→ Checklist for adding skill:
  1. Create SKILL.md and README.md
  2. Update META/skill-registry.json
  3. Update META/relationship-mapping.json
  4. Update .claude/CLAUDE.md
  5. Update README.md (2 locations)
  [... 15 more steps ...]

  Run 'brain validate' before committing!
```

### Example 3: Understanding Relationships

```bash
# What uses this MCP?
$ brain reverse-deps mcp vector-database-mcp
→ Used by skills:
  - rag-implementer
  - knowledge-base-manager
  - knowledge-graph-builder

  Used by MCPs:
  - semantic-search-mcp
  - knowledge-base-mcp

# What does this skill need?
$ brain dependencies skill rag-implementer
→ Required MCPs:
  - vector-database-mcp
  - embedding-generator-mcp
  - semantic-search-mcp

  Required tools:
  - embedding-tool
  - vector-search-tool

  Required integrations:
  - openai, anthropic, pinecone
```

---

## Preventing Drift

### How the Brain Prevents Drift

**1. Continuous Validation**
```bash
# Runs automatically on every commit
brain validate
→ Checks 14 documentation files
  Checks all registries
  Checks all relationships
  BLOCKS commit if anything wrong
```

**2. Proactive Updates**
```typescript
// Brain detects when update needed
if (brain.detectDrift()) {
  const fixes = brain.generateFixes();
  brain.applyFixes(fixes);
  brain.validate(); // Ensure fixed
}
```

**3. Relationship Integrity**
```typescript
// When adding skill
brain.addSkill({...});
brain.updateAllRelationships(); // Automatic
brain.updateAllDocs(); // Automatic
brain.validate(); // Automatic
```

**4. Documentation Sync**
```typescript
// Single source of truth
const skillCount = brain.getSkillCount(); // From registry
brain.updateAllDocsWithCount(skillCount); // Propagate everywhere
brain.verifySync(); // Ensure consistency
```

### Drift Detection

```bash
$ brain health
→ Health: DEGRADED ⚠
  Issues found:
  - README.md mentions "37 skills" (actual: 38)
  - PROJECT-CONTEXT.md out of date
  - 2 skills missing related_skills

  Run 'brain fix' to auto-repair

$ brain fix
→ Fixing README.md...
  Fixing PROJECT-CONTEXT.md...
  Updating skill relationships...
  Done! Run 'brain validate' to verify.
```

---

## Success Metrics

The brain is working when:

1. ✅ **Zero drift**: All docs always in sync
2. ✅ **Automatic decisions**: Brain recommends correct workflow every time
3. ✅ **Complete knowledge**: Brain can answer any query about state
4. ✅ **Self-healing**: Brain detects and fixes issues automatically
5. ✅ **Transparent**: Every decision explained with reasoning
6. ✅ **Maintainable**: New resources integrate smoothly
7. ✅ **Scalable**: Works with 38 skills or 380 skills

---

## The Brain as AI Dev Standards' Brain

**Philosophy**: The brain is NOT just code. It's the combination of:

1. **Automated Systems** (validation, checks, hooks)
2. **Intelligent Agents** (decision-making, orchestration)
3. **Knowledge Base** (registries, mappings, relationships)
4. **Strategic Planning** (Archon)
5. **Human Oversight** (user decisions, approvals)

**Result**: A self-aware, self-maintaining, intelligent repository that:
- Knows its complete state
- Makes correct decisions
- Enforces quality automatically
- Prevents drift proactively
- Accumulates learning
- Scales gracefully

---

## Next Steps

**Immediate**:
1. Create `scripts/brain/` directory structure
2. Implement Layer 1 (Knowledge queries)
3. Implement basic CLI (`brain status`)

**This Week**:
4. Implement Layer 2 (Enforcement wrapper)
5. Implement Layer 3 (Decision engine basics)
6. Set up git hooks

**Next Week**:
7. Implement Layer 4 (Archon integration)
8. Full brain CLI
9. Complete documentation
10. Demonstrate brain in action

---

**Status**: 🏗️ DESIGN COMPLETE - READY FOR IMPLEMENTATION
**Goal**: Prevent massive drift, maintain coherence, ensure tool value
**Result**: ai-dev-standards with a functioning brain that manages itself
