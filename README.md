# AI Development Standards

[![CI](https://github.com/daffy0208/ai-dev-standards/actions/workflows/ci.yml/badge.svg)](https://github.com/daffy0208/ai-dev-standards/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/daffy0208/ai-dev-standards/branch/main/graph/badge.svg)](https://codecov.io/gh/daffy0208/ai-dev-standards)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

**Version 3.0.3** | **Last Updated:** 2025-11-14

<!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> core resources for AI-assisted development (from a living catalog of 360 total repository resources). One command. Any project. This repository provides specialized skills, executable tools, reusable components, and pre-configured integrations that Claude automatically uses to deliver higher quality, more consistent results.

> **🎉 Brain/Orchestrator Now Working!** The intelligent skill discovery system is now fully configured and documented. Run `./scripts/configure-mcp-paths.sh` for one-command setup, then use `brain_select_skills` to automatically find the right skills for any task. See [Brain Quick Start](#-repository-brain--orchestrator) or [Complete Solution](STATUS-REPORTS/BRAIN-ORCHESTRATOR-SOLUTION.md).

> **✨ NEW: Code Execution MCP Pattern Implemented!** Advanced token-efficient MCP pattern with 40-60% savings (85-95% with skills). Infrastructure ready: Docker sandbox, skills storage, IPython configured. First MCP generated (semantic-search-mcp with 3 tools). See [Implementation Complete](IMPLEMENTATION-COMPLETE.md) or [Quick Start Guide](QUICK-START-GUIDE.md).

**Current Resources:** 64 specialized skills • 50 MCP servers • 195+ total resources

## What This Repository Does

Think of this as a **shared brain** between you and Claude:

- **<!-- AUTO-GEN:START:skills -->64<!-- AUTO-GEN:END:skills --> Specialized Skills** – Methodologies Claude activates automatically (MVP building, RAG implementation, API design, knowledge management, ADHD support, automated code review, design systems, and more) **🆕 Now with auto-activation!**
- **<!-- AUTO-GEN:START:mcps -->50<!-- AUTO-GEN:END:mcps --> MCP Servers** – Executable development tools including brain-mcp for intelligent orchestration (strong skill coverage and actionability)
- **<!-- AUTO-GEN:START:tools -->24<!-- AUTO-GEN:END:tools --> Core Tools** – Essential development utilities and automation scripts that are synced into your projects
- **<!-- AUTO-GEN:START:components -->72<!-- AUTO-GEN:END:components --> Reusable Components** – React components for common patterns (auth, forms, errors, feedback, media, layouts, advanced UI)
- **<!-- AUTO-GEN:START:integrations -->28<!-- AUTO-GEN:END:integrations --> Service Integrations** – Pre-configured connections to OpenAI, Supabase, Stripe, and other essential services
- **Architecture Patterns** – Proven approaches for complex systems (RAG, multi-agent, knowledge graphs, design systems)
- **Best Practices** – Security, performance, accessibility, and quality standards
- **Decision Frameworks** – Clear guidance for choosing technologies
- **Validation & Trust** – Automated testing ensures all core resources are discoverable and accessible
- **🆕 Skill Auto-Activation** – Skills activate automatically based on your prompts and file context (no more remembering skill names!)

**Core Resources (Tier 1 - Executable):**  
**<!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> resources** (64 skills + 50 MCPs + 24 tools + 72 components + 28 integrations)

**Supporting Resources (Tier 2):**  
**122 resources** (14 playbooks + 20 standards + 19 templates + 4 schemas + 8 utilities + 3 examples + 3 installers + 24 docs)

**Total Repository Inventory:**  
**360 resources** (238 core + 122 supporting)

**Resource Coverage (from latest simulation):**

- 100% of core registries are discoverable (skills, MCPs, components)
- **55 of 64 skills (85.9%)** have MCP support
- **92% skill-to-MCP coverage** (simulation report confirmed)
- **119 skill-to-MCP relationships** (average ratio **1.9:1** between MCPs and skills)
- Complete dependency mapping and relationship validation across the core system

**Core Philosophy:** Quality over quantity. Every resource has been carefully curated, tested, and documented for its specific purpose.

---

## 🚀 Quick Start

**One command. Any project.**

```bash
cd /your/project
bash ~/ai-dev-standards/setup-project.sh
```

**That's it!**

The tool automatically:
- ✅ Detects your project type (Next.js, React, Node.js)
- ✅ Installs everything needed
- ✅ Analyzes your repository
- ✅ Recommends where to start
- ✅ Syncs all **<!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> core resources** into your project (from the full 360-resource catalog)

**Works for:**
- New projects, existing projects
- JavaScript/Node.js projects (Next.js, React, etc.)
- Empty repos to large codebases
- Local or freshly cloned from GitHub

**After ~2 minutes, you have:**
- 64 skills with **automatic activation** based on context
- 50 MCP servers (including brain-mcp for intelligent orchestration)
- **<!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> core resources** (skills, MCPs, components, integrations, tools)
- Project analysis with recommendations
- Exact roadmap for where to start
- Skills that activate when you need them, not when you remember them

**Supported CLI Tools:**
- ✅ **Claude Code** - Native integration (recommended)
- ✅ **Codex CLI** - Run `./setup-codex-cli.sh`
- ✅ **Gemini CLI** - Run `./setup-gemini-cli.sh`

---

## 🎯 Current Focus: CLI + Semantic Search MVP

We are actively building toward a **minimal viable release** that proves the end-to-end workflow for:

- **Project setup & diagnostics** – `setup`, `doctor`, `analyze`, and the shared auth/feedback components.
- **Semantic Search MCP pilot** – The first code-execution MCP (tools + docs) validated in the Docker sandbox.
- **Brain & registry reliability** – Keeping the orchestrator scripts and registry validation tests green in CI.

Everything else (additional MCPs, advanced RAG pipelines, extra design system work, etc.) is temporarily paused so we can finish, document, and test this slice to production quality. Once the MVP is solid—tests, lint, docs, and CI all green—we will expand back out to the rest of the catalog.

### Roadmap / Deferred Work

1. **CI hardening** – Enforce `npm run lint`, `npm run typecheck`, `npm test`, and `repolinter` on every PR (in-progress).
2. **Code-execution MCP catalog** – After the semantic-search pilot is verified, resume the backlog of MCP generators (vector-database, api-validator, deployment-orchestrator, brain).
3. **RAG pipeline + examples** – Finish the TypeScript RAG components with integration tests and sample repos.
4. **Template/installer refresh** – Revisit the project templates once the CLI commands have automated coverage.

---

## 📖 How to Use This Repository

Choose your usage method:

### 1. 🔗 [Integration Usage](INTEGRATION-USAGE.md) (Recommended)
**Integrate ai-dev-standards into your projects** for automatic skill activation, resource syncing, and AI assistant integration. One command sets up everything.

- ✅ **Best for:** Active development, new and existing projects
- ✅ **Features:** Auto-sync, automatic skill activation, brain-MCP integration, project analysis
- ✅ **Setup time:** 2 minutes
- ✅ **Updates:** Automatic via git hooks

```bash
cd /your/project
bash ~/ai-dev-standards/setup-project.sh
```

### 2. 📚 [Standalone Usage](STANDALONE-USAGE.md)
**Use ai-dev-standards as a reference library** without integrating it into your projects. Browse and manually reference resources.

- ✅ **Best for:** Learning, exploring, manual reference
- ✅ **Features:** Browse skills, explore components, use brain CLI for discovery
- ✅ **Setup time:** 1 minute (just clone)
- ✅ **Updates:** Manual via git pull

```bash
cd ~/ai-dev-standards
./scripts/check-updates.sh  # Check for updates
```

### 🔄 Checking for Updates

Both usage modes support automatic update checking:

```bash
# From ai-dev-standards directory or any project
./scripts/check-updates.sh
```

Shows what's new, version changes, and provides update instructions for your usage mode.

**See also:** 
- [INSTALL.md](INSTALL.md) - Legacy setup guide (use INTEGRATION-USAGE.md instead)
- [UPDATE-GUIDE.md](UPDATE-GUIDE.md) - Legacy update guide (use INTEGRATION-USAGE.md instead)
- [DOCS/TROUBLESHOOTING.md](DOCS/TROUBLESHOOTING.md) - Connection and setup issues

---

### For AI Assistants: Loading Context

When working in a project using this repository:

1. Read `META/PROJECT-CONTEXT.md` - Understand repository structure and philosophy
2. Read `META/HOW-TO-USE.md` - Navigation and usage guide
3. Read `META/DECISION-FRAMEWORK.md` - Technology decision guidance
4. Search `META/skill-registry.json` - Find relevant skills
5. Reference appropriate standards and patterns as needed

---

## Repository Structure

```
ai-dev-standards/
├── META/                           # Core context and navigation
│   ├── PROJECT-CONTEXT.md          # For AI: How to use this repository
│   ├── HOW-TO-USE.md               # Navigation guide
│   ├── DECISION-FRAMEWORK.md       # Technology decision guidance
│   └── skill-registry.json         # Searchable skill catalog
│
├── SKILLS/                         # Specialized methodologies (64 skills)
│   ├── mvp-builder/                # MVP development and feature prioritization
│   ├── rag-implementer/            # Retrieval-augmented generation systems
│   ├── product-strategist/         # Product-market fit validation
│   ├── api-designer/               # REST and GraphQL API design
│   ├── frontend-builder/           # React/Next.js development
│   ├── deployment-advisor/         # Infrastructure and deployment strategy
│   ├── quality-auditor/            # Comprehensive quality audits
│   ├── security-auditor/           # Security assessment and hardening
│   ├── performance-optimizer/      # Performance and scalability
│   ├── multi-agent-architect/      # Multi-agent system orchestration
│   └── [54 more skills...]         # See META/skill-registry.json for complete list
│
├── STANDARDS/
│   ├── architecture-patterns/      # System design patterns
│   │   └── rag-pattern.md          # RAG architecture styles and components
│   ├── best-practices/             # Quality and security standards
│   │   └── mcp-code-execution-best-practices.md  # MCP code execution guidelines
│   └── [future standards]/
│
├── PLAYBOOKS/                      # Operational procedures (7+ playbooks)
├── TEMPLATES/                      # Project starters (cursorrules templates)
├── COMPONENTS/                     # Reusable implementations (72 components in current catalog)
└── EXAMPLES/                       # Reference implementations (sample projects)
```

---

## 🧠 Repository Brain & Orchestrator

The **Repository Brain** is an intelligence system that manages, understands, and orchestrates the **<!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> core resources inside your project**, backed by the full **360-resource repository catalog** (238 core + 122 supporting resources). It helps Claude automatically discover and use the right skills, MCPs, tools, and components for any task.

### Quick Setup

```bash
# One command to configure everything
./scripts/configure-mcp-paths.sh
```

This will:
- ✅ Build brain-mcp server and CLI
- ✅ Configure paths for your system
- ✅ Enable intelligent skill/MCP selection

### How It Works

The brain operates through **MCP tools** that Claude can invoke:

```
Claude asks: "What skills for building an MVP?"
    ↓
Uses: brain_select_skills(taskDescription: "build MVP")
    ↓
Brain returns: mvp-builder, product-strategist, frontend-builder
    ↓
Claude reads those skill files and applies their methodologies
```

### Available Brain Tools

**Discovery:**
- `brain_search` - Search all skills, MCPs, tools by keyword
- `brain_select_skills` - Get skill recommendations for a task
- `brain_show_skill` - Get detailed skill information

**Relationships:**
- `brain_relationships` - Show skill dependencies (MCPs, tools, components)
- `graph_query_by_domain` - Find capabilities by domain (ai, security, etc.)
- `graph_query_by_effect` - Find capabilities by effect (implements_auth, etc.)

**Status:**
- `brain_status` – Core resource status for your project (64 skills, 50 MCPs, <!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> core resources; 360 total resources available in the repository)

### Using the Brain

**Option 1: Through Claude (Recommended)**
```
Ask: "Use brain_select_skills to find skills for building a RAG system"
Ask: "Use brain_relationships to show dependencies for rag-implementer"
Ask: "Use brain_search to find authentication resources"
```

**Option 2: Through CLI**
```bash
brain status                    # Current state
brain search "authentication"   # Search resources
brain select-skills "build MVP" # Get skill recommendations
brain relationships rag-implementer # Show dependencies
brain patterns "need knowledge base" # Match architecture patterns
brain workflow "implement RAG"  # Get detailed workflow
```

### Architecture (4 Layers)

1. **Layer 1: Knowledge** - Complete understanding of repository state (registries + mappings)
2. **Layer 2: Enforcement** - Automated validation and drift prevention
3. **Layer 3: Decision** - Intelligent workflow and tool selection
4. **Layer 4: Management** - Strategic planning via Archon MCP

### Enabling Automatic Selection

Add project instructions to help Claude use brain tools automatically:

1. Copy `TEMPLATES/claude-instructions-with-brain.md` to your project
2. Rename to `.claude/instructions.md`
3. Claude will now follow the skill discovery workflow automatically

### Troubleshooting

If the brain isn't working:
1. Run `./scripts/configure-mcp-paths.sh` to fix configuration
2. Check `.claude/mcp-settings.json` has correct paths (not hardcoded to another user)
3. Restart Claude Code / Codex CLI
4. See `DOCS/BRAIN-ORCHESTRATOR-TROUBLESHOOTING.md` for detailed help

**Common Issue**: Hardcoded paths in config files (e.g., `/home/david/projects/...`) - Run the configuration script to fix.

**See:** 
- **[Quick Reference](DOCS/BRAIN-QUICK-REFERENCE.md)** - Common workflows, examples, cheat sheet
- **[Troubleshooting](DOCS/BRAIN-ORCHESTRATOR-TROUBLESHOOTING.md)** - Fix common issues
- **[Project Template](TEMPLATES/claude-instructions-with-brain.md)** - Enable automatic brain usage
- `scripts/brain/README.md` - CLI documentation
- `MCP-SERVERS/brain-mcp/README.md` - MCP documentation
- `META/REPOSITORY-BRAIN.md` - Architecture details

---

## Available Skills

### Product Development
- **mvp-builder** - Rapid MVP development with P0/P1/P2 prioritization, 5 MVP patterns (Concierge, Wizard of Oz, etc.)
- **product-strategist** - Product-market fit validation using Mom Test, problem severity matrix
- **go-to-market-planner** - Product launch strategy with 5-phase GTM approach

### AI-Native Development
- **rag-implementer** - Build retrieval-augmented generation systems with 8-phase implementation
- **multi-agent-architect** - Design multi-agent systems with 4 coordination patterns
- **knowledge-graph-builder** - Graph database design and implementation (Neo4j, relationships, AI integration)

### Technical Development
- **api-designer** - REST and GraphQL API design with authentication, versioning, documentation
- **frontend-builder** - React/Next.js development covering state management, forms, styling, performance

### Infrastructure & DevOps
- **deployment-advisor** - Infrastructure selection (Vercel, Railway, AWS) with 3-tier cost strategy
- **performance-optimizer** - Application performance optimization (profiling, caching, database, frontend)

### UX & Design
- **user-researcher** - User research methodology (interviews, surveys, analysis, personas)
- **ux-designer** - UX design process (information architecture, wireframes, prototypes, accessibility)

See `META/skill-registry.json` for complete descriptions, triggers, and prerequisites.

---

## Architecture Patterns

### Available Patterns
- **rag-pattern.md** - RAG architecture (Naive, Advanced, Modular), component selection, implementation

### Planned Patterns
- Multi-agent orchestration patterns
- MCP integration patterns
- Knowledge graph architectures
- Event-driven systems
- Real-time data pipelines

---

## How Skills Work

Skills are **automatically activated** by Claude based on context:

**Example 1: Building an MVP**
```
You: "I want to build an MVP for a task management app"

Claude: "I'll use the mvp-builder skill to help prioritize features.
Let's identify your riskiest assumption first, then use the P0/P1/P2
matrix to focus on core value..."
```

**Example 2: Implementing RAG**
```
You: "How should I implement search for our documentation?"

Claude: "I'll use the rag-implementer skill and consult the RAG
architecture pattern. For documentation search, I recommend the
Advanced RAG style with hybrid retrieval..."
```

**Example 3: API Design**
```
You: "Design an API for user management"

Claude: "Using the api-designer skill, I'll design a RESTful API
following these principles: resource-based URLs, proper HTTP methods,
authentication with JWT..."
```

You can also **explicitly request** a skill:

```
"Use the deployment-advisor skill to recommend hosting for my Next.js app"
```

---

## Key Features

### 🎯 Focused & Curated
- 64 specialized skills covering all aspects of development
- Only proven patterns and practices
- Core resources validated and discoverable (skills, MCPs, components fully registered)

### 📝 Official Format
- Skills follow Claude Code's YAML frontmatter specification
- Architecture patterns use problem→solution→trade-offs structure
- Everything properly formatted for its purpose

### 🔄 Automatically Activated
- Skills trigger based on conversation context
- No need to remember which skill to use
- Claude selects appropriate methodologies automatically

### 🏗️ Production-Ready
- Patterns tested in real projects
- Complete with code examples and trade-offs
- Security and performance built-in

### 📚 Well-Documented
- Most skills have comprehensive documentation (41 out of 64 skills have READMEs)
- Architecture patterns include decision frameworks
- Clear examples and anti-patterns

### 🛡️ Quality & Trust Built-In
- **Comprehensive validation system** ensures 100% registry consistency (bidirectional validation)
- **Automated tests** catch issues before they reach projects (81% invisible resources → 0%)
- **CI/CD enforcement** blocks incomplete registry merges
- **Quality audits** must validate resource discovery before scoring
- **Cost efficiency guardrails** prevent analysis paralysis and premature building
- **`validate-complete-system.cjs`** - Validates all registries, relationships, and cross-registry consistency

---

## Cost-Efficient Development

This repository enforces **validation-first development** to prevent wasting time and money:

### Validation Before Building
- ✅ **Validate problem** before designing solution (product-strategist)
- ✅ **Test with users** before building MVP (user-researcher)
- ✅ **Try cheap alternatives** before expensive implementations (all technical skills)
- ✅ **Time-boxed phases** prevent analysis paralysis
- ✅ **Budget limits** per validation phase

### Cost Discipline Examples
- **RAG Implementation:** Test FAQ page (1 day, $0) before building RAG system (3-4 weeks, $200-500/month)
- **Multi-Agent System:** Validate single-agent works before multi-agent architecture
- **Custom Infrastructure:** Try Vercel/Railway ($20/month) before AWS ($500+/month)

**See:** [Validation-First Development Playbook](PLAYBOOKS/validation-first-development.md) for the complete 5-phase workflow.

### Resource Discovery & Trust
Every core resource in this system is:
- ✅ **Registered** in the registry system under META/ (64 skills + 50 MCPs + all core resources)
- ✅ **Discoverable** via CLI and bootstrap (no invisible resources)
- ✅ **Validated** on every commit (automated tests + CI/CD)
- ✅ **Audited** with mandatory completeness checks

**Current Core Resources:**  
64 skills, 50 MCP servers, <!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> total core resources – all fully registered and discoverable.

### ✅ Strong Skill-to-MCP Coverage (from latest simulation)

**Current Status (Simulation Report):**
- **55 of 64 skills** have MCP support
- **85.9% skill-to-MCP coverage**
- **119 skill-to-MCP relationships**, averaging a **1.9:1** MCP-to-skill ratio

**What This Means:**
- **Skills** describe **how** to do things (methodologies, approaches).
- **MCPs** actually **do** things (tools, actions, automation).
- High coverage means most skills are executable, not just advisory – AI can both advise **and** act.

For exact mappings (which skills are backed by which MCPs), see:

- `META/mcp-registry.json` – MCP catalog and supported skills
- `META/relationship-mapping.json` – Detailed skill ↔ MCP ↔ component relationships
- `SIMULATION-EXECUTIVE-SUMMARY.md` – Latest coverage and validation breakdown

---

## Usage Examples

### Starting a New Project

```markdown
User: "I want to build a SaaS product for small businesses to manage invoices"

Claude:
1. Uses product-strategist skill to validate problem-solution fit
2. Uses mvp-builder skill to identify P0 features
3. Uses api-designer skill to design backend
4. Uses frontend-builder skill for React/Next.js structure
5. Uses deployment-advisor skill to recommend Vercel + Railway
6. Follows best practices for security and performance
```

### Implementing AI Features

```markdown
User: "Add AI-powered search to our knowledge base"

Claude:
1. Uses rag-implementer skill for methodology
2. References rag-pattern.md for architecture
3. Recommends Advanced RAG (hybrid retrieval + re-ranking)
4. Suggests Pinecone (vector DB) + OpenAI embeddings
5. Implements with citations and source attribution
6. Sets up evaluation metrics
```

### Designing Complex Systems

```markdown
User: "Build a multi-agent system for market research"

Claude:
1. Uses multi-agent-architect skill
2. Recommends Hierarchical pattern (Manager-Worker)
3. Designs: Manager → [Competitor A, B, C researchers] → Aggregator
4. Implements with CrewAI
5. Adds monitoring and cost tracking
```

---

## Decision Framework

This repository provides clear guidance for technology decisions:

### Should I use RAG?
```
Knowledge in base model? → No RAG needed
Knowledge changes frequently? → Use RAG
Proprietary/sensitive data? → Use RAG
Need source attribution? → Use RAG
```

### Which RAG architecture?
```
Prototype (<10k docs) → Naive RAG (simple, fast)
Production (10k-1M docs) → Advanced RAG (hybrid retrieval, re-ranking)
Enterprise (1M+ docs) → Modular RAG (multi-KB, specialized modules)
```

### Which deployment platform?
```
MVP (<$20/mo) → Vercel (frontend) + Railway (backend)
Growth ($20-500/mo) → Vercel + Railway Pro + managed DB
Scale ($500-5000+/mo) → AWS ECS/Fargate + RDS + CloudFront
```

See `META/DECISION-FRAMEWORK.md` for complete decision trees.

---

## Best Practices

### Security
- Never commit secrets (.env files managed properly)
- API authentication (JWT, API keys, OAuth) implemented correctly
- Input validation and sanitization enforced
- CORS configured appropriately
- Rate limiting on public endpoints

### Performance
- Database queries optimized (indexes, query analysis)
- Caching strategy implemented (Redis, in-memory)
- Frontend optimization (code splitting, lazy loading, image optimization)
- Core Web Vitals monitored (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Code Quality
- TypeScript for type safety
- Comprehensive error handling
- Logging and monitoring
- Testing strategy (unit, integration, e2e)
- Documentation for complex logic

### MCP Code Execution
- Secure sandbox environments for code execution (4GB RAM, 15-minute timeout)
- Context-efficient tool access via code composition
- Proper permission management and security controls
- Structured task decomposition with validation
- Multi-agent orchestration patterns (Hierarchical, Collaborative, Pipeline)
- Integration with existing development tools (git, npm, testing frameworks)
- Robust error handling and recovery strategies
- See [MCP Code Execution Best Practices](STANDARDS/best-practices/mcp-code-execution-best-practices.md) for detailed guidance

---

## Philosophy

### Quality Over Quantity
- **64 specialized skills** covering essential development areas
- **Proven patterns** over theoretical frameworks
- Every item curated, tested, and 100% discoverable

### Clear Categorization
- **Skills** = Methodologies Claude follows (model-invoked)
- **Patterns** = Reference documentation (architectural guidance)
- **Playbooks** = Step-by-step procedures (operational tasks)

### Rewritten, Not Copied
- All content adapted for its specific purpose
- Skills condensed to focused instructions
- Patterns restructured for clarity
- Redundancy eliminated

### Best Tool for the Job
- No framework favoritism
- Recommendations based on requirements
- Clear decision criteria provided
- Trade-offs explicitly documented

---

## Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] 64 specialized skills extracted and adapted
- [x] RAG architecture pattern documented
- [x] Meta files and navigation created
- [x] Decision framework established
- [x] Registry system for resource discovery

### Phase 2: Quality & Trust ✅ (Complete)
- [x] Automated registry validation tests
- [x] CI/CD enforcement (blocks incomplete registry)
- [x] Quality auditor with Phase 0 mandatory checks
- [x] Audit validation checklist
- [x] Cost efficiency guardrails
- [x] Validation-first development playbook

### Phase 3: MCP Development ✅ (COMPLETE)
- [x] RAG & AI MCPs (vector-database, embedding-generator, semantic-search, knowledge-base)
- [x] Product MCPs (feature-prioritizer, user-insight-analyzer, market-analyzer)
- [x] Engineering MCPs (openapi-generator, api-validator, component-generator)
- [x] Quality MCPs (performance-profiler, security-scanner, code-quality-scanner)
- [x] Design MCPs (wireframe-generator, design-token-manager, asset-optimizer)
- **Achieved:** 50 MCPs providing 85% skill coverage (exceeded 30 MCP goal!)

### Phase 4: Enhancement (Planned)
- [ ] Additional architecture patterns
- [ ] Operational playbooks expansion
- [ ] Project templates
- [ ] Integration guides
- [ ] Example implementations

---

## Contributing

### Adding a New Skill

1. Must provide specialized methodology not covered by existing skills
2. Follow official Claude Code YAML frontmatter format
3. Include comprehensive README with troubleshooting
4. Test with real use cases before adding
5. Update `META/skill-registry.json`

### Adding an Architecture Pattern

1. Must be proven in production environments
2. Follow problem→solution→trade-offs structure
3. Include code examples and anti-patterns
4. Document decision criteria and when to use
5. Reference related skills and patterns

### Updating Existing Content

1. Propose changes via issue/PR
2. Explain reasoning and improvements
3. Test changes with Claude Code
4. Update version numbers and changelog

### Testing CLI Commands

- Run `npm run test:cli` to execute the full CLI + semantic-search MCP suite (doctor, analyze, setup, sync, init, context, update, etc.).
- Run `npm run test:semantic-search:docker` to execute the code-execution docker smoke test (requires Docker and builds the `mcp-sandbox` image on first run).
- Run `npm run demo:semantic-search` for a quick index+search walkthrough without setting up an MCP client yet.
- When adding CLI tests, import the relevant `create*Command` factory (e.g., `createUpdateCommand`) and inject mocked dependencies (`fs`, `path`, `chalk`, `ora`, `inquirer`) plus a custom `cwd()` to keep tests sandboxed.
- Use temporary directories (see `tests/cli/update-command.test.ts`) to create `.ai-dev.json`, `.claude/`, `.codex/`, and other artifacts without polluting the repo.
- Avoid calling `process.chdir` inside tests—pass paths through injection or helper arguments instead.
- See the detailed guidance in `CONTRIBUTING.md` (Testing CLI Commands) for reusable helpers and patterns.

---

## Versioning

**Current Version:** 3.0.3

**Version History:**
- **3.0.3** (2025-11-09): Documentation consolidation and usage mode improvements (PR #22)
- **3.0.2** (2025-11-07): Repository maintenance and documentation updates
  - Added MCP code execution best practices and implementation guides (PR #17, #18)
  - Branch cleanup automation tools and workflows (PR #16)
  - Registry synchronization and validation improvements (PR #15)
  - Updated resource counts to match registry (64 skills, 50 MCPs, <!-- AUTO-GEN:START:total-resources -->238<!-- AUTO-GEN:END:total-resources --> total resources)
  - Version consistency across all documentation
- **3.0.1** (2025-11-05): Documentation and automation improvements for self-update workflow
- **2.1.0** (2025-10-29): Validation & Orchestration Update
  - Added comprehensive validation system (`validate-complete-system.cjs`)
  - Implemented Claude Code orchestration infrastructure (zero-cost alternative to OpenAI Codex)
  - Registry cleanup and consistency fixes
  - 100% registry consistency achieved with bidirectional validation
- **2.0.0** (2025-10-27): Phase 3 Complete - Design System
- **1.1.0** (2025-10-22): Quality & Trust Update
  - 64 specialized skills (100% discoverable)
  - Automated registry validation system
  - CI/CD enforcement (blocks incomplete registry)
  - Quality auditor Phase 0 mandatory checks
  - Cost efficiency guardrails
  - Validation-first development playbook

- **1.0.0** (2025-10-22): Initial release
  - 37 specialized skills
  - 7 MCP servers
  - Complete CLI with 8 commands
  - Auto-bootstrap and sync system
  - Skill registry and navigation

---

## FAQ

**Q: How is this different from just prompting Claude?**
A: Skills provide consistent, specialized methodologies automatically. Patterns ensure architectural consistency. You get expert-level guidance without writing detailed prompts every time.

**Q: Do I need to memorize the skills?**
A: No! Claude activates skills automatically based on context. You can also explicitly request: "Use the mvp-builder skill to..."

**Q: Can I customize skills for my needs?**
A: Yes! Skills are meant to evolve. Fork the repository, modify skills, add project-specific skills in `.claude/skills/`.

**Q: What if a skill doesn't fit my use case?**
A: Skills are focused guidelines, not rigid rules. Explain your context to Claude, and it will adapt the methodology appropriately.

**Q: How do I know which pattern to use?**
A: Check `META/DECISION-FRAMEWORK.md` for decision trees. Each pattern also includes "When to Use" guidance.

**Q: Can I use this with other AI assistants?**
A: The skills are written for Claude Code's official format, but the patterns and best practices are valuable with any AI assistant.

**Q: Is this repository production-ready?**
A: Yes! All skills and patterns have been tested in real projects. Security and performance best practices are built-in.

---

## License

[Your License Here]

---

## Acknowledgments

This repository was created by evaluating and refining the Framework Library, keeping only the highest quality content and rewriting it for Claude Code's official architecture.

**What changed:**
- From scattered frameworks to 64 specialized skills
- From mixed formats to official YAML frontmatter
- From 19% discoverable to core resources fully validated (skills, MCPs, components)
- From unclear boundaries to clear categorization
- From manual validation to automated CI/CD enforcement

**Result:** A focused, production-ready knowledge base with automated quality checks that makes Claude significantly more effective at software development.

---

## Getting Started Resources

### 📚 Documentation
- **[5-Minute Quick Start](DOCS/QUICK-START.md)** - Get up and running fast
- **[Integration Guide](DOCS/INTEGRATION-GUIDE.md)** - Complete setup guide with examples
- **[Existing Projects Guide](DOCS/EXISTING-PROJECTS.md)** - Apply to existing codebases ⭐
- **[Sample Project](EXAMPLES/sample-project-cursorrules.md)** - Try it now with a test project

### 📝 Templates (Copy & Use)

**For New Projects:**
- **[Minimal .cursorrules](TEMPLATES/cursorrules-minimal.md)** - Basic integration
- **[SaaS .cursorrules](TEMPLATES/cursorrules-saas.md)** - For web applications
- **[AI/RAG .cursorrules](TEMPLATES/cursorrules-ai-rag.md)** - For AI-powered projects

**For Existing Projects:**
- **[Existing Project .cursorrules](TEMPLATES/cursorrules-existing-project.md)** - Document and improve existing code ⭐

### 🎯 By Use Case
- **Have an existing project?** Use [existing project template](TEMPLATES/cursorrules-existing-project.md) + [existing projects guide](DOCS/EXISTING-PROJECTS.md) ⭐
- **Starting a new SaaS?** Use [SaaS template](TEMPLATES/cursorrules-saas.md) + [mvp-builder skill](SKILLS/mvp-builder/)
- **Adding AI search?** Use [RAG template](TEMPLATES/cursorrules-ai-rag.md) + [rag-implementer skill](SKILLS/rag-implementer/)
- **Just exploring?** Try the [sample project](EXAMPLES/sample-project-cursorrules.md)

---

## Quick Links

**For Humans:**
- [How to Use This Repository](META/HOW-TO-USE.md)
- [Decision Framework](META/DECISION-FRAMEWORK.md)
- [Skill Registry](META/skill-registry.json)
- [Semantic Search MCP Usage](DOCS/SEMANTIC-SEARCH-USAGE.md)

**For AI Assistants:**
- [Project Context](META/PROJECT-CONTEXT.md) - Read this first!
- [Navigation Guide](META/HOW-TO-USE.md)
- [All Skills](SKILLS/)
- [Architecture Patterns](STANDARDS/architecture-patterns/)

---

## Support

**Questions?** Check the FAQ above or `META/PROJECT-CONTEXT.md`

**Issues?** Open an issue in this repository

**Improvements?** Contributions welcome! See Contributing section above

---

**Built for excellence in AI-assisted development** 🚀


## MCP Patterns

**✅ Code Execution Pattern Implemented!** This repository now supports two MCP execution patterns:

### 📦 Direct MCP (Traditional)
- **Status:** Available (50 MCP templates)
- **Use for:** Simple, infrequent operations
- **Tokens:** ~100K loaded upfront
- All tools loaded into context immediately

### 🚀 Code Execution (Advanced) ✨ **NEW**
- **Status:** ✅ **Infrastructure Ready** | First MCP Generated
- **Use for:** Complex, frequent workflows
- **Tokens:** 40-60% first run, 85-95% with skills
- Progressive discovery + skill library
- **Implementation:** semantic-search-mcp (pilot with 3 working tools)
- **Infrastructure:** Docker sandbox, skills storage, IPython ready

### 🧠 Hybrid Approach (Available)
- **Automatic pattern selection** via Brain orchestrator
- Simple tasks → Direct MCP
- Complex tasks → Code Execution
- Best of both worlds

**Documentation:** See [`/DOCS/mcp-patterns/`](./DOCS/mcp-patterns/) (~81K words) for complete guides.

**Quick Start:**
- **[Implementation Complete](./IMPLEMENTATION-COMPLETE.md)** - ✅ Setup finished, how to use
- **[Quick Start Guide](./QUICK-START-GUIDE.md)** - Get started in 5 minutes
- [Decision Framework](./DOCS/mcp-patterns/01-mcp-decision-framework.md) - Which pattern to use?
- [Code Execution Pattern Guide](./DOCS/mcp-patterns/03-mcp-code-execution-pattern.md) - Full details

**Current State:**
- ✅ **Code Execution Infrastructure:** Docker, storage, IPython ready
- ✅ **First MCP:** semantic-search-mcp with 3 production-ready tools
- ✅ **Generator Script:** `scripts/generate-code-execution-mcp.cjs`
- 📊 **Token Savings:** 40-60% immediate, 85-95% with skills
- 📚 **Documentation:** Complete (~81K words)
