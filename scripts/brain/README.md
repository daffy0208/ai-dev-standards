# Repository Brain 🧠

The central intelligence system for **ai-dev-standards** repository. Manages, understands, and orchestrates all 108 resources (skills, MCPs, tools, components, integrations).

## Architecture

The brain operates across 4 layers:

```
┌─────────────────────────────────────────────────────────┐
│     LAYER 4: MANAGEMENT (Archon MCP)                    │
│     Strategic: WHAT to build, WHEN                      │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│     LAYER 3: DECISION (Meta-Agent + Rules)              │
│     Operational: HOW to build, WHY this way             │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│     LAYER 2: ENFORCEMENT (Automated Systems)            │
│     Quality: Ensure correctness automatically           │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│     LAYER 1: KNOWLEDGE (Registries + Mappings)          │
│     Foundation: Single source of truth                  │
└─────────────────────────────────────────────────────────┘
```

## Installation

```bash
cd scripts/brain
npm install
npm run build
```

To use globally:
```bash
npm link
```

## Usage

### Basic Commands

```bash
# Status & Health
brain status                    # Current repository state
brain health                    # Health check
brain validate                  # Validate registries

# Query Knowledge
brain list skills               # List all skills
brain list mcps                 # List all MCPs
brain search "authentication"   # Search across resources
brain show skill mvp-builder    # Show skill details

# Relationships
brain relationships rag-implementer # Show skill relationships
brain reverse-deps mcp vector-database-mcp # What uses this MCP?

# Decision Making
brain select-skills "build MVP" # Get skill recommendations
brain select-mcps rag-implementer # Get required MCPs
brain decide "add new feature"  # Get workflow recommendation
```

## Examples

### Example 1: Check Repository Status

```bash
$ brain status

━━━ Repository Status ━━━

State:
  Skills: 40
  MCPs: 36
  Total Resources: 108
  Last Updated: 2025-10-26

Versions:
  Skill Registry: 3.11.0
  MCP Registry: 3.2.0
  Relationships: 2.1.0

Health:
  HEALTHY

✓ No issues detected
```

### Example 2: Get Skill Recommendations

```bash
$ brain select-skills "implement authentication system"

━━━ Skill Selection: "implement authentication system" ━━━

Recommended Skills:
✓ security-engineer
✓ api-designer
✓ frontend-builder

Reasoning:
  Selected based on matching triggers and description keywords.
  Primary match: security-engineer

Alternatives:
  - deployment-advisor
```

### Example 3: Decide Workflow

```bash
$ brain decide "add new skill"

━━━ Workflow Decision: "add new skill" ━━━

Recommended Workflow:
  1. Research existing patterns
  2. Check if official MCP exists
  3. Create SKILL.md
  4. Update skill-registry.json
  5. Update relationship-mapping.json
  6. Update CLAUDE.md
  7. Update README.md
  8. Validate all changes
  9. Commit and push

Recommended Skills:
  - technical-writer
  - quality-auditor

Required MCPs:
  (none)

Estimated Time: 2-3 hours

Reasoning:
  Matched scenario to standard workflow. Selected based on matching triggers...
```

### Example 4: Understand Relationships

```bash
$ brain relationships rag-implementer

━━━ Relationships: rag-implementer ━━━

Skill:
  rag-implementer - Implement retrieval-augmented generation systems...

Related Skills:
  - knowledge-base-manager
  - knowledge-graph-builder

Dependencies:
  MCPs:
    - vector-database-mcp
    - embedding-generator-mcp
    - semantic-search-mcp
  Tools:
    - embedding-tool
    - vector-search-tool
  Integrations:
    - openai
    - anthropic
    - pinecone
```

### Example 5: Search Resources

```bash
$ brain search "authentication"

━━━ Search Results: "authentication" ━━━

Skills:
  security-engineer - Implement security best practices...
  api-designer - Design REST and GraphQL APIs...

MCPs:
  oauth-provider-mcp - OAuth authentication flows
  jwt-manager-mcp - JWT token management

Total: 4 results
```

## API Usage

You can also use the brain programmatically:

```typescript
import { createBrain } from './brain-core';

async function example() {
  // Initialize brain
  const brain = await createBrain('/path/to/ai-dev-standards');

  // Get status
  const status = await brain.status();
  console.log(`Skills: ${status.state.skills}`);

  // Search skills
  const results = await brain.search('authentication');
  console.log(`Found ${results.skills.length} skills`);

  // Get skill recommendations
  const skills = await brain.selectSkills('build MVP');
  console.log('Recommended:', skills.recommended);

  // Get workflow recommendation
  const workflow = await brain.decideWorkflow('add new feature');
  console.log('Steps:', workflow.workflow);
}
```

## Development

### Running Tests

```bash
npm test
```

### Development Mode (with watch)

```bash
npm run dev
```

### Using ts-node directly

```bash
npm run brain -- status
npm run brain -- search "authentication"
```

## Architecture Details

### Layer 1: Knowledge

- **File**: `knowledge-layer.ts`
- **Purpose**: Query registries and mappings
- **Capabilities**:
  - Get skill/MCP by name
  - Search across resources
  - Query relationships
  - Validate registry consistency

### Layer 2: Enforcement

- **File**: `enforcement-layer.ts` (planned)
- **Purpose**: Automated validation and drift prevention
- **Capabilities**:
  - Run validation scripts
  - Block invalid commits
  - Auto-fix common issues
  - Monitor health

### Layer 3: Decision

- **File**: `workflow-engine.ts` (planned)
- **Purpose**: Intelligent decision making
- **Capabilities**:
  - Workflow selection
  - Skill matching
  - MCP dependency resolution
  - Pattern matching

### Layer 4: Management

- **Integration**: Archon MCP
- **Purpose**: Strategic task management
- **Capabilities**:
  - Task prioritization
  - Context preservation
  - Knowledge base queries
  - Progress tracking

## Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Layer 1: Knowledge queries
- [x] Brain core class
- [x] CLI interface
- [x] Basic commands

### 🏗️ Phase 2: Intelligence (In Progress)
- [ ] Workflow engine
- [ ] Advanced skill selection
- [ ] Pattern matcher
- [ ] Decision rules documentation

### 📋 Phase 3: Enforcement (Planned)
- [ ] Validation scripts
- [ ] Git hooks
- [ ] CI/CD integration
- [ ] Auto-fix capabilities

### 🎯 Phase 4: Management (Planned)
- [ ] Full Archon integration
- [ ] RAG queries
- [ ] Task orchestration
- [ ] Learning accumulation

## Contributing

The brain is self-aware of all resources. When adding new skills, MCPs, or tools:

1. Update the relevant registry
2. Update relationship-mapping.json
3. Run `brain validate` to ensure consistency
4. The brain will automatically discover and integrate new resources

## Support

For issues or questions about the brain:
- Read: `META/REPOSITORY-BRAIN.md` for architecture details
- Run: `brain health` to diagnose issues
- Check: `brain validate` for validation errors

---

**Status**: Phase 1 Complete (Knowledge Layer + CLI) ✅
**Next**: Phase 2 (Decision Layer) 🏗️
