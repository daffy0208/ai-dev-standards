# Brain Decision Rules

Codified decision logic for the Repository Brain's Layer 3 (Decision Making).

## Workflow Selection Rules

### Rule 1: New Skill Creation

**Triggers**: `new skill`, `add skill`, `create skill`

**Workflow**:

1. Research existing patterns
2. Check if official MCP exists
3. Create SKILL.md
4. Update skill-registry.json
5. Update relationship-mapping.json
6. Update CLAUDE.md
7. Update README.md
8. Validate all changes
9. Commit and push

**Estimated Time**: 2-3 hours

**Required Skills**: `technical-writer`, `quality-auditor`

---

### Rule 2: New Feature Addition

**Triggers**: `new feature`, `add feature`, `implement feature`

**Workflow**:

1. Load project context
2. Check playbooks for patterns
3. Select appropriate skills
4. Implement feature
5. Write tests
6. Update documentation
7. Validate changes
8. Commit

**Estimated Time**: 3-6 hours

**Skill Selection**: Dynamic based on feature type

---

### Rule 3: Enhancement/Improvement

**Triggers**: `enhance`, `improve`, `optimize`, `refactor`

**Workflow**:

1. Load existing implementation
2. Identify gaps
3. Research best practices
4. Implement enhancements
5. Update tests
6. Update documentation
7. Validate
8. Commit

**Estimated Time**: 2-4 hours

**Required Skills**: `quality-auditor`, `performance-optimizer` (if performance), relevant domain skill

---

### Rule 4: Bug Fix

**Triggers**: `fix bug`, `debug`, `resolve issue`

**Workflow**:

1. Reproduce bug
2. Identify root cause
3. Implement fix
4. Write regression test
5. Validate fix
6. Update documentation if needed
7. Commit

**Estimated Time**: 1-3 hours

**Required Skills**: Domain-specific skill, `testing-strategist`

---

### Rule 5: New MCP Creation

**Triggers**: `new mcp`, `add mcp`, `create mcp`

**Workflow**:

1. Research MCP patterns
2. Check official MCPs first
3. Create MCP directory structure
4. Implement MCP server
5. Create integration tests
6. Update mcp-registry.json
7. Update relationship-mapping.json
8. Update CLAUDE.md
9. Validate
10. Commit

**Estimated Time**: 3-5 hours

**Required Skills**: Relevant domain skill, `api-designer`, `testing-strategist`

---

## Skill Selection Rules

### Rule 1: Keyword Matching

**Priority**: High (Score: 10 points)

Match user request keywords against skill **triggers**:

- Exact match: +10 points
- Partial match: +5 points

**Example**:

- Request: "implement authentication"
- Match: `security-engineer` (trigger: "authentication")

---

### Rule 2: Description Matching

**Priority**: Medium (Score: 1-5 points)

Match request words against skill **description**:

- Each matching word: +1 point

**Example**:

- Request: "build REST API"
- Match: `api-designer` (description contains "REST" and "API")

---

### Rule 3: Name Matching

**Priority**: Medium (Score: 5 points)

Match request against skill **name**:

- Name appears in request: +5 points

**Example**:

- Request: "use mvp builder"
- Match: `mvp-builder` (+5 points)

---

### Rule 4: Category Filtering

**Priority**: Low (Optional)

Filter by task category:

- `product-development`: mvp-builder, product-strategist, go-to-market-planner
- `ai-native`: rag-implementer, knowledge-base-manager, multi-agent-architect
- `technical`: frontend-builder, api-designer, security-engineer
- `infrastructure`: deployment-advisor, performance-optimizer
- `ux-design`: ux-designer, visual-designer, accessibility-engineer

---

### Rule 5: Related Skills

**Priority**: Low (Score: 2 points)

If primary skill selected, consider `related_skills`:

- Each related skill: +2 points

**Example**:

- Primary: `rag-implementer`
- Also recommend: `knowledge-base-manager`, `knowledge-graph-builder`

---

## MCP Selection Rules

### Rule 1: Direct Dependency

**Priority**: Critical

For each selected skill, include all `required_mcps` from relationship-mapping.json.

**Example**:

- Skill: `rag-implementer`
- Required MCPs: `vector-database-mcp`, `embedding-generator-mcp`, `semantic-search-mcp`

---

### Rule 2: Transitive Dependency

**Priority**: High

If Skill A requires Skill B, include MCPs from both.

**Example**:

- User selects: `knowledge-base-manager`
- Related: `rag-implementer`
- Include MCPs from both skills

---

### Rule 3: Official MCP Preference

**Priority**: High

Always prefer official MCPs over custom implementations:

- Check MCP registry status: "official" > "community" > "custom"

---

## Pattern Matching Rules

### Rule 1: Architecture Patterns

**Pattern**: RAG System
**Triggers**: "knowledge base", "document search", "semantic search", "Q&A"
**Skills**: `rag-implementer`, `knowledge-base-manager`
**MCPs**: `vector-database-mcp`, `embedding-generator-mcp`

---

**Pattern**: Multi-Agent System
**Triggers**: "agent", "multi-agent", "orchestration", "coordinator"
**Skills**: `multi-agent-architect`, `rag-implementer` (for knowledge)
**MCPs**: `agent-coordinator-mcp`, `vector-database-mcp`

---

**Pattern**: Full-Stack Application
**Triggers**: "web app", "full stack", "frontend and backend"
**Skills**: `frontend-builder`, `api-designer`, `deployment-advisor`
**MCPs**: `component-generator-mcp`, `api-validator-mcp`

---

**Pattern**: MVP Build
**Triggers**: "mvp", "minimum viable", "prototype", "quick build"
**Skills**: `mvp-builder`, `product-strategist`, `frontend-builder`
**MCPs**: `component-generator-mcp`, `feature-prioritizer-mcp`

---

### Rule 2: Technology Stack Patterns

**Stack**: React + Next.js + Supabase
**Skills**: `frontend-builder`, `api-designer`, `security-engineer`
**Integrations**: `supabase`, `openai` (if AI features)

---

**Stack**: AI/ML Application
**Skills**: `rag-implementer`, `multi-agent-architect`, `api-designer`
**Integrations**: `openai`, `anthropic`, `pinecone`

---

## Time Estimation Rules

### Rule 1: Skill Creation

- **Simple skill** (1 pattern): 2 hours
- **Standard skill** (3-5 patterns): 3 hours
- **Complex skill** (7+ patterns): 4-5 hours

---

### Rule 2: MCP Creation

- **Simple MCP** (1-2 tools): 3 hours
- **Standard MCP** (3-5 tools): 4 hours
- **Complex MCP** (integration + tests): 5-6 hours

---

### Rule 3: Feature Implementation

- **UI-only**: 2-3 hours
- **Frontend + Backend**: 4-6 hours
- **Full stack + tests**: 6-8 hours

---

### Rule 4: Enhancement

- **Documentation only**: 1 hour
- **Minor code changes**: 2-3 hours
- **Major refactor**: 4-6 hours

---

## Priority Rules

### Rule 1: Task Priority

**P0 (Critical)**: Foundation, blockers
**P1 (High)**: Core features, user-facing improvements
**P2 (Medium)**: Enhancements, optimizations
**P3 (Low)**: Nice-to-haves, future considerations

---

### Rule 2: Skill Priority

When multiple skills match:

1. **Exact trigger match** (highest priority)
2. **Name match**
3. **Description match**
4. **Related skills** (lowest priority)

---

## Validation Rules

### Rule 1: Registry Consistency

**Check**: All skills in relationship-mapping.json exist in skill-registry.json
**Action**: Error if mismatch

---

### Rule 2: Dependency Completeness

**Check**: All required_mcps exist in mcp-registry.json
**Action**: Warning if missing, suggest creating MCP

---

### Rule 3: Related Skills

**Check**: All related_skills are bidirectional
**Action**: Warning if one-way relationship

---

### Rule 4: Documentation Sync

**Check**: Skill count in CLAUDE.md matches skill-registry.json
**Action**: Error if out of sync

---

## Learning Rules (Future)

### Rule 1: Pattern Extraction

Extract patterns from external repositories:

- Identify recurring architecture patterns
- Score pattern quality
- Add to STANDARDS/ if high quality

---

### Rule 2: Skill Discovery

Discover new skill opportunities:

- Find capabilities not covered by existing skills
- Analyze skill usage patterns
- Recommend new skills to create

---

### Rule 3: MCP Optimization

Optimize MCP selection:

- Track which MCPs are used together
- Identify redundant MCPs
- Recommend consolidation

---

## Decision Flow

```
User Request
     ↓
Analyze Keywords
     ↓
Match Workflow Pattern
     ↓
Select Skills (Rule 1-5)
     ↓
Get Required MCPs (Rule 1-3)
     ↓
Estimate Time
     ↓
Generate Recommendation
     ↓
Provide Reasoning
```

---

## Extending Decision Rules

To add new decision rules:

1. **Document the pattern**: What triggers it?
2. **Define the workflow**: What steps are required?
3. **Specify skills**: Which skills are needed?
4. **List dependencies**: What MCPs/tools/integrations?
5. **Estimate time**: How long will it take?
6. **Add to brain-core.ts**: Implement the logic

---

## Version History

**v1.0.0** (2025-10-26): Initial decision rules

- Workflow selection (5 patterns)
- Skill selection (5 rules)
- MCP selection (3 rules)
- Pattern matching (4 patterns)
- Time estimation (4 rules)
