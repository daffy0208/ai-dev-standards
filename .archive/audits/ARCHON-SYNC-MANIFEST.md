# Archon Sync Manifest

**Date**: 2025-10-25
**Purpose**: Sync ai-dev-standards repository knowledge with Archon MCP
**Status**: Ready for sync

---

## What This Sync Does

This syncs the complete ai-dev-standards repository knowledge base into Archon MCP, enabling:
- RAG queries across all skills, MCPs, patterns, and docs
- Code example search from all components and integrations
- Project-aware task management with full resource context
- Knowledge-driven decision making

---

## Documents to Sync to Archon Knowledge Base

### Priority 1: Core Registries (Required)

```bash
# Resource catalogs - the foundation
META/skill-registry.json           # All 39 skills with metadata
META/mcp-registry.json             # All 36 MCP servers
META/relationship-mapping.json     # Complete dependency graph
META/tool-registry.json            # All tools and scripts
META/component-registry.json       # All reusable components
META/integration-registry.json     # All framework integrations
```

**Why**: These are the single source of truth for what exists and how resources relate.

---

### Priority 2: Strategic Documents (Essential)

```bash
# Strategic context
META/PROJECT-CONTEXT.md            # Repository philosophy and structure
META/REPOSITORY-BRAIN.md           # Brain architecture design
META/HOW-TO-USE.md                 # Navigation guide
META/DECISION-FRAMEWORK.md         # Technology decision criteria

# Current planning
ARCHON-PROJECT.json                # Phase 2 tasks and roadmap
META/SESSION-2025-10-25-SI-SYSTEMS-BRAIN-RESEARCH.md  # Latest session

# Integration
DOCS/ARCHON-INTEGRATION.md         # How Archon + Skills work together
```

**Why**: Provides strategic context for decision-making and task prioritization.

---

### Priority 3: Skills Documentation (High Value)

```bash
# All 39 skill files
SKILLS/*/SKILL.md                  # Skill methodology files
SKILLS/*/README.md                 # Skill documentation

# Key skills for Archon workflows
SKILLS/archon-manager/SKILL.md     # Meta-skill for Archon
SKILLS/knowledge-base-manager/SKILL.md  # KB management
SKILLS/rag-implementer/SKILL.md    # RAG patterns
SKILLS/mvp-builder/SKILL.md        # Feature prioritization
SKILLS/task-breakdown-specialist/SKILL.md  # ADHD-friendly chunking
```

**Why**: Skills provide the tactical "HOW" that complements Archon's strategic "WHAT/WHEN".

---

### Priority 4: Patterns & Standards (Reference)

```bash
# Architecture patterns
STANDARDS/architecture-patterns/*.md  # All 10 patterns
STANDARDS/best-practices/*.md        # Quality standards
STANDARDS/project-structure/*.md     # Project templates

# Key patterns
STANDARDS/architecture-patterns/rag-pattern.md
STANDARDS/architecture-patterns/multi-agent-pattern.md
STANDARDS/architecture-patterns/mcp-integration-pattern.md
```

**Why**: Reference material for architectural decisions and implementation guidance.

---

### Priority 5: Code Examples (Optional but Valuable)

```bash
# Reusable code
COMPONENTS/*/                      # All 13 components
INTEGRATIONS/*/                    # All 6 integrations
EXAMPLES/*.md                      # Example projects

# Templates
TEMPLATES/*                        # Project templates
```

**Why**: Code examples for search_code_examples tool in Archon.

---

## Archon Commands to Sync

### Method 1: Using Archon MCP Tools (Recommended)

If Archon MCP has document ingestion tools:

```typescript
// 1. Sync core registries
archon:add_documents({
  documents: [
    { path: "META/skill-registry.json", content: "..." },
    { path: "META/mcp-registry.json", content: "..." },
    { path: "META/relationship-mapping.json", content: "..." }
  ],
  project_id: "ai-dev-standards"
});

// 2. Sync strategic documents
archon:add_documents({
  documents: [
    { path: "META/REPOSITORY-BRAIN.md", content: "..." },
    { path: "META/PROJECT-CONTEXT.md", content: "..." },
    { path: "DOCS/ARCHON-INTEGRATION.md", content: "..." }
  ],
  project_id: "ai-dev-standards"
});

// 3. Sync all skills
archon:add_documents({
  documents: [
    // All SKILLS/*/SKILL.md files
  ],
  project_id: "ai-dev-standards"
});
```

### Method 2: Using Archon Web Interface

If using Archon's web UI:
1. Open Archon dashboard
2. Navigate to "ai-dev-standards" project
3. Go to "Knowledge Base" section
4. Upload documents listed in Priority 1-5 above
5. Verify documents are indexed for RAG

### Method 3: Using Archon CLI (If Available)

```bash
# Sync entire directory structure
archon sync-docs \
  --project ai-dev-standards \
  --source /path/to/ai-dev-standards \
  --include "META/*.json,META/*.md,SKILLS/*/SKILL.md,DOCS/*.md" \
  --recursive

# Verify sync
archon query \
  --project ai-dev-standards \
  --query "How many skills are available?" \
  --verify-data
```

---

## Verification Checklist

After syncing, verify with these Archon RAG queries:

### Test 1: Resource Counts
```typescript
archon:perform_rag_query({
  query: "How many skills, MCPs, and total resources are in ai-dev-standards?",
  match_count: 3
});
// Expected: "39 skills, 36 MCPs, 107 total resources"
```

### Test 2: Skill Information
```typescript
archon:perform_rag_query({
  query: "What is the rag-implementer skill and when should I use it?",
  match_count: 5
});
// Expected: Description of RAG implementation methodology
```

### Test 3: Relationship Queries
```typescript
archon:perform_rag_query({
  query: "Which MCPs support the rag-implementer skill?",
  match_count: 3
});
// Expected: vector-database-mcp, embedding-generator-mcp, semantic-search-mcp
```

### Test 4: Strategic Context
```typescript
archon:perform_rag_query({
  query: "What is the Repository Brain and what are its four layers?",
  match_count: 3
});
// Expected: Brain architecture with 4 layers (Knowledge, Enforcement, Decision, Management)
```

### Test 5: Integration Pattern
```typescript
archon:perform_rag_query({
  query: "How do Archon and Skills work together in the two-layer architecture?",
  match_count: 5
});
// Expected: Archon (WHAT/WHEN) + Skills (HOW) explanation
```

---

## Updated ARCHON-PROJECT.json

**Current State**:
- Version: 1.5.0
- Phase: Phase 2 (Knowledge Base & Integration)
- RCI: 70/100 → Target: 85/100
- P0 Tasks: 3 (1 pending, 2 done)
- Total Tasks: 9

**Recent Completions**:
- ✅ P0-1: Knowledge Base Manager skill
- ✅ P0-3: Archon Integration Guide
- ✅ Latest session context saved

**Next Priority**:
- ⏳ P0-2: knowledge-base-mcp server (in progress)
- ⏳ SI Systems v5 analysis (planned)

---

## What Archon Will Enable After Sync

### 1. Intelligent Task Management
```typescript
// Archon can now suggest skills for tasks
archon:manage_task({
  action: "suggest_skills",
  task_description: "Build RAG system with Supabase"
});
// → Suggests: rag-implementer, api-designer, security-engineer
```

### 2. Knowledge-Driven Decisions
```typescript
// Archon can answer questions about resources
archon:perform_rag_query({
  query: "Should I use Neo4j or Pinecone for knowledge graphs?",
  match_count: 5
});
// → Returns: decision-framework.md criteria + pattern comparisons
```

### 3. Context-Aware Development
```typescript
// Archon knows the complete resource inventory
archon:search_code_examples({
  query: "authentication with Supabase",
  match_count: 3
});
// → Returns: Supabase integration code from INTEGRATIONS/
```

### 4. Self-Aware Project Management
```typescript
// Archon can track against its own structure
archon:perform_rag_query({
  query: "What tasks are in Phase 2 and what's their status?",
  match_count: 3
});
// → Returns: P0-2 pending, 8 tasks total, 70/100 RCI
```

---

## Sync Frequency

**Recommended Schedule**:
- **After major changes**: New skills, MCPs, or significant updates
- **Weekly**: During active development phases
- **Monthly**: During maintenance phases
- **Always**: Before starting new project phases

**Triggers for Immediate Sync**:
- New skill added (update skill-registry.json)
- New MCP created (update mcp-registry.json)
- Relationships changed (update relationship-mapping.json)
- Strategic documents updated (REPOSITORY-BRAIN.md, etc.)
- Phase transitions (update ARCHON-PROJECT.json)

---

## Quick Sync Command (If Automation Exists)

```bash
# Hypothetical automated sync
ai-dev sync-to-archon \
  --project ai-dev-standards \
  --priority all \
  --verify

# Or manual verification
ai-dev archon-status
```

---

## Success Metrics

Sync is successful when:

1. ✅ Archon RAG queries return accurate resource counts
2. ✅ Archon can answer questions about skills and MCPs
3. ✅ Archon knows the relationship graph
4. ✅ Archon understands the two-layer architecture
5. ✅ Archon can suggest skills for task types
6. ✅ Code example search returns relevant results

---

## Notes

- **Document Size**: ~200KB total for Priority 1-2, ~2MB for complete sync
- **Index Time**: Depends on Archon's processing speed (typically 1-5 minutes)
- **Query Performance**: Should return results in <1 second after indexing
- **Storage**: Minimal (text documents only, no binary files)

---

## Next Steps

1. Choose sync method (MCP tools, Web UI, or CLI)
2. Run sync with Priority 1 documents first
3. Verify with test queries above
4. Sync Priority 2-5 if tests pass
5. Update this manifest with actual commands used

---

**Status**: Ready for sync
**Last Updated**: 2025-10-25
**Prepared By**: Claude Code
