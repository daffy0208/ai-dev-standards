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

# Phase 2 - Advanced Intelligence
brain patterns "need knowledge base" # Match architecture patterns
brain workflow "implement RAG"   # Detailed workflow with steps
brain analyze "build AI chatbot" # Comprehensive analysis (all engines)
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

### Example 6: Match Architecture Patterns (Phase 2)

```bash
$ brain patterns "need knowledge base with semantic search"

━━━ Architecture Patterns: "need knowledge base with semantic search" ━━━

Top Matches:

1. RAG System (confidence: 100%)
   Retrieval-Augmented Generation for knowledge-intensive applications
   Complexity: moderate | Time: 1-2 weeks
   Reasons: Use case match: "knowledge base", Use case match: "semantic search"
   Pros: Grounds LLM responses in factual data, Reduces hallucinations
   Cons: Requires vector database infrastructure, Embedding costs
   Skills: rag-implementer, knowledge-base-manager, data-engineer

Total patterns analyzed: 1
```

### Example 7: Detailed Workflow (Phase 2)

```bash
$ brain workflow "implement RAG system"

━━━ Detailed Workflow: "implement RAG system" ━━━

Workflow Type:
  rag-system

Steps:
  1. Design
     Design RAG architecture
     Time: 45 min | Skills: rag-implementer

  2. Setup Vector DB
     Configure vector database
     Time: 30 min | Skills: rag-implementer

  3. Embeddings
     Implement embedding generation
     Time: 45 min | Skills: rag-implementer

  4. Ingestion
     Build document ingestion pipeline
     Time: 1 hour | Skills: data-engineer

  5. Retrieval
     Implement retrieval logic
     Time: 1 hour | Skills: rag-implementer

  6. LLM Integration
     Integrate with LLM
     Time: 45 min | Skills: rag-implementer

  7. Evaluation
     Build evaluation framework
     Time: 45 min | Skills: testing-strategist

  8. Test
     Test end-to-end
     Time: 30 min | Skills:

Required Resources:
  Skills: rag-implementer, data-engineer, testing-strategist
  MCPs: vector-database-mcp, embedding-generator-mcp, semantic-search-mcp

Estimated Time: 6 hours

Alternative Approaches:
  - Use existing RAG service (e.g., LlamaIndex Cloud)
  - Start with simple keyword search

Warnings:
⚠ RAG systems require vector database - ensure infrastructure is ready
```

### Example 8: Comprehensive Analysis (Phase 2)

```bash
$ brain analyze "need rag implementer to build knowledge base with vector database"

━━━ Comprehensive Analysis: "need rag implementer to build knowledge base with vector database" ━━━

═══ Skills ═══
Primary:
  ✓ rag-implementer

Optional:
  - knowledge-base-manager
  - archon-manager
  - knowledge-graph-builder

Confidence: 100%
Reasoning: Primary match: rag-implementer (score: 30). Fuzzy trigger match: "rag-implementer".

═══ Workflow ═══
Type: rag-system
Steps: 8
Estimated Time: 6 hours

═══ MCPs ═══
Required:
  ✓ vector-database-mcp
  ✓ embedding-generator-mcp
  ✓ semantic-search-mcp

Recommended:
  - knowledge-base-mcp

Warnings:
⚠ MCP 'vector-database-mcp' is required but not yet implemented
⚠ MCP 'embedding-generator-mcp' is required but not yet implemented
⚠ MCP 'semantic-search-mcp' is required but not yet implemented

═══ Architecture Patterns ═══
1. RAG System (83% match)
   Retrieval-Augmented Generation for knowledge-intensive applications

═══ Summary ═══
Complexity: moderate
Recommended Skills: 2
Total Estimated Time: 6 hours
Overall Confidence: 100%
```

## Phase 3 - Orchestration System

Phase 3 introduces meta-skills that use Codex to generate and manage capability manifests, build capability graphs, plan workflows, validate implementations, and diagnose project health.

### Example 9: Generate Capability Manifest

```bash
$ brain generate-manifest --path SKILLS/rag-implementer

━━━ Generate Manifest ━━━

→ Resource: SKILLS/rag-implementer
→ Type: skill
→ Running manifest generator...

Generating manifest for rag-implementer...
✅ Manifest generated: SKILLS/rag-implementer/manifest.yaml
✓ Manifest generation complete!
```

### Example 10: Build Capability Graph

```bash
$ brain build-graph --validate --infer-missing

━━━ Build Capability Graph ━━━

→ Validation: enabled
→ Inference: enabled
→ Building capability graph...

Loading manifests...
  - SKILLS/rag-implementer/manifest.yaml
  - SKILLS/api-designer/manifest.yaml
  - MCP-SERVERS/vector-database-mcp/manifest.yaml
  ... (106 more)

Building graph structure...
  Nodes: 109
  Edges: 287

Validating relationships...
  ✓ No circular dependencies
  ✓ All bidirectional relationships consistent

Inferring missing relationships...
  Added 15 inferred relationships

Writing graph to META/capability-graph.json...
✓ Capability graph build complete!
```

### Example 11: Plan Workflow

```bash
$ brain plan "implement authentication system"

━━━ Plan Workflow: "implement authentication system" ━━━

→ Planning workflow...

Goal Analysis:
  Required Effects: adds_auth_middleware, creates_jwt_tokens, implements_login_api
  Domains: auth, security, api

Capability Matching:
  Found 8 candidate capabilities
  5 preconditions satisfied
  3 blocked (missing dependencies)

HTN Plan:
  Step 1: security-engineer
    Effect: adds_auth_middleware
    Alternatives: api-designer
    Dependencies: []
    Status: Ready

  Step 2: jwt-manager-mcp
    Effect: creates_jwt_tokens
    Alternatives: custom-jwt-implementation
    Dependencies: [1]
    Status: Ready

  Step 3: api-designer
    Effect: implements_login_api
    Alternatives: frontend-builder
    Dependencies: [1, 2]
    Status: Ready

Scoring:
  Utility: 0.78
  Cost: medium
  Latency: fast
  Risk: low

✓ Workflow planning complete!
```

### Example 12: Validate Skill

```bash
$ brain validate-skill SKILLS/rag-implementer

━━━ Validate Skill: rag-implementer ━━━

→ Resource: SKILLS/rag-implementer
→ Running validation...

Description Validation:
  Accuracy Score: 0.90
  ✓ Description matches implementation

Precondition Validation:
  Coverage Score: 0.80
  ✓ file_exists('package.json') - enforced at validateProject:12
  ✓ env_var_set('OPENAI_API_KEY') - enforced at setupEmbeddings:45

Effect Validation:
  Coverage Score: 0.85
  ✓ creates_vector_index - implemented at createIndex:120
  ✓ adds_embedding_pipeline - implemented at setupPipeline:85
  ℹ Extra effect found: optimizes_vector_queries (not in manifest)

Overall Score: 0.85
Issues Found: 1 (low severity)

✓ Validation complete!
```

### Example 13: Diagnose Project

```bash
$ brain diagnose --focus security,performance

━━━ Project Health Diagnostic ━━━

→ Project: /current/directory
→ Focus: security,performance
→ Analyzing project health...

Project Discovery:
  Type: nodejs
  Framework: nextjs
  Files: 247 total, 156 code files, 12 test files

Health Assessment:

  Testing: 0.40 (needs_improvement)
    ℹ Only 15% test coverage
    ℹ No E2E tests

  Security: 0.50 (critical)
    ⚠ No input validation on API routes
    ⚠ CORS configured too permissively

  Performance: 0.70 (good)
    ℹ Could optimize image loading
    ✓ Good caching strategy

  Overall Health: 0.68

Recommendations (by priority):

  1. [High Impact, Medium Effort] Add input validation
     Suggested: security-engineer, api-designer
     Priority: 0.48

  2. [High Impact, High Effort] Improve test coverage
     Suggested: testing-strategist
     Priority: 0.24

Quick Wins:

  1. Add README documentation (low effort, medium impact)
     Suggested: technical-writer

Critical Issues: 1

✓ Diagnostic complete!
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

  // Phase 2 - Advanced Intelligence

  // Match architecture patterns
  const patterns = await brain.matchPatterns('need knowledge base');
  console.log('Top pattern:', patterns[0].pattern.name);

  // Get detailed workflow
  const detailedWorkflow = await brain.decideWorkflowAdvanced('implement RAG');
  console.log('Workflow type:', detailedWorkflow.workflowType);
  console.log('Steps:', detailedWorkflow.steps.length);

  // Comprehensive analysis
  const analysis = await brain.analyze('build AI chatbot');
  console.log('Primary skills:', analysis.skills.primary);
  console.log('Required MCPs:', analysis.mcps.required);
  console.log('Best pattern:', analysis.patterns[0].pattern.name);
  console.log('Confidence:', analysis.summary.confidence);
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

The decision layer consists of 4 specialized engines working together:

#### Workflow Engine
- **File**: `workflow-engine.ts`
- **Purpose**: Generate context-aware workflows
- **Capabilities**:
  - 15 workflow types (new-skill, new-mcp, rag-system, etc.)
  - Detailed steps with time estimates
  - Alternative approaches and warnings

#### Skill Selector
- **File**: `skill-selector.ts`
- **Purpose**: Advanced skill matching with scoring
- **Capabilities**:
  - Weighted scoring algorithm (triggers 15pts, name 10pts, description 1pt/word, category 2pts, tags 3pts)
  - Confidence levels (high/medium/low)
  - Fuzzy matching for partial matches
  - Complexity analysis

#### MCP Integrator
- **File**: `mcp-integrator.ts`
- **Purpose**: MCP dependency resolution
- **Capabilities**:
  - Direct and transitive dependencies
  - Required, recommended, and optional MCPs
  - Compatibility checking
  - Setup complexity estimation

#### Pattern Matcher
- **File**: `pattern-matcher.ts`
- **Purpose**: Architecture pattern recommendation
- **Capabilities**:
  - 8 architecture patterns (RAG, Multi-Agent, Full-Stack, MVP, etc.)
  - Trade-off analysis (pros/cons)
  - Use case matching with confidence scoring
  - Pattern comparison

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
- [x] Basic commands (12 commands)

### ✅ Phase 2: Intelligence (Complete)
- [x] Workflow engine (15 workflow types)
- [x] Advanced skill selection (weighted scoring)
- [x] MCP integrator (dependency resolution)
- [x] Pattern matcher (8 architecture patterns)
- [x] Brain-core integration (comprehensive analyze() method)
- [x] CLI commands: patterns, workflow, analyze
- [x] Decision rules documentation

### ✅ Phase 3: Orchestration System (Complete)
- [x] Manifest generator (generate-manifest command)
- [x] Capability graph builder (build-graph command)
- [x] Orchestration planner (plan command)
- [x] Skill validator (validate-skill command)
- [x] System diagnostician (diagnose command)
- [x] CLI integration for all meta-skills
- [x] Documentation and examples

### 📋 Phase 4: Enforcement (Planned)
- [ ] Validation scripts
- [ ] Git hooks
- [ ] CI/CD integration
- [ ] Auto-fix capabilities

### 🎯 Phase 5: Management (Planned)
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

**Status**: Phase 3 Complete (Knowledge + Decision + Orchestration) ✅
**Features**: 20 commands, 4 engines + 5 meta-skills, 8 architecture patterns, 15 workflow types
**Next**: Phase 4 (Enforcement Layer) 📋
