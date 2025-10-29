# AI Development Standards

[![CI](https://github.com/daffy0208/ai-dev-standards/actions/workflows/ci.yml/badge.svg)](https://github.com/daffy0208/ai-dev-standards/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/daffy0208/ai-dev-standards/branch/main/graph/badge.svg)](https://codecov.io/gh/daffy0208/ai-dev-standards)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

**Version 3.0.0** | **Last Updated:** 2025-10-29

238 resources for AI-assisted development. One command. Any project. This repository provides specialized skills, executable tools, reusable components, and pre-configured integrations that Claude automatically uses to deliver higher quality, more consistent results.

## What This Repository Does

Think of this as a **shared brain** between you and Claude:

- **65 Specialized Skills** - Methodologies Claude activates automatically (MVP building, RAG implementation, API design, knowledge management, ADHD support, automated code review, design systems, and more)
- **50 MCP Servers** - Executable development tools providing 78% skill coverage (0.78:1 ratio - strong actionability!)
- **24 Tools** - LangChain, CrewAI, design utilities, and automation scripts
- **75 Reusable Components** - React components for common patterns (auth, forms, errors, feedback, media, layouts, advanced UI)
- **27 Service Integrations** - Pre-configured connections to OpenAI, Supabase, Stripe, Pinecone, and more
- **Architecture Patterns** - Proven approaches for complex systems (RAG, multi-agent, knowledge graphs, design systems)
- **Best Practices** - Security, performance, accessibility, and quality standards
- **Decision Frameworks** - Clear guidance for choosing technologies
- **Validation & Trust** - Automated testing ensures all resources are discoverable and accessible

**Total Resources:** 238 (65 skills + 50 MCPs + 24 tools + 72 components + 27 integrations)

**Resource Coverage:** Core resources 100% discoverable (skills, MCPs, components) • 85% skill-to-MCP coverage • Complete dependency mapping

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
- ✅ Syncs all 237 resources

**Works for:**
- New projects, existing projects
- JavaScript/Node.js projects (Next.js, React, etc.)
- Empty repos to large codebases
- Local or freshly cloned from GitHub

**After 2 minutes, you have:**
- 64 skills
- 50 MCP servers
- 237 total resources
- Project analysis with recommendations
- Exact roadmap for where to start

**See:** [INSTALL.md](INSTALL.md) for complete setup guide or [DOCS/TROUBLESHOOTING.md](DOCS/TROUBLESHOOTING.md) if you have connection issues.

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
├── SKILLS/                         # Specialized methodologies (64 total)
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
│   └── [31 more skills...]         # See META/registry.json for complete list
│
├── STANDARDS/
│   ├── architecture-patterns/      # System design patterns
│   │   └── rag-pattern.md          # RAG architecture styles and components
│   ├── best-practices/             # Quality and security standards
│   └── [future standards]/
│
├── PLAYBOOKS/                      # Operational procedures (7+ playbooks)
├── TEMPLATES/                      # Project starters (cursorrules templates)
├── COMPONENTS/                     # Reusable implementations (72 components)
└── EXAMPLES/                       # Reference implementations (sample projects)
```

---

## 🧠 Repository Brain

The **Repository Brain** is an intelligence system that manages, understands, and orchestrates all 237 resources.

### What It Does

```bash
brain status                    # Current state (64 skills, 50 MCPs, 237 resources)
brain search "authentication"   # Search across all resources
brain decide "add new skill"    # Get workflow recommendations
brain select-skills "build MVP" # Get skill recommendations
brain relationships rag-implementer # Show dependencies
brain validate                  # Validate registries
```

### Architecture (4 Layers)

1. **Layer 1: Knowledge** - Complete understanding of repository state (registries + mappings)
2. **Layer 2: Enforcement** - Automated validation and drift prevention
3. **Layer 3: Decision** - Intelligent workflow and tool selection
4. **Layer 4: Management** - Strategic planning via Archon MCP

### Installation & Usage

```bash
cd scripts/brain
npm install
npm run build
npm run brain -- status
```

**See:** `scripts/brain/README.md` for complete documentation

**Design:** `META/REPOSITORY-BRAIN.md` for architecture details

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
Every resource in this repository is:
- ✅ **Registered** in META/registry.json (64 skills + 50 MCPs + all resources)
- ✅ **Discoverable** via CLI and bootstrap (no invisible resources)
- ✅ **Validated** on every commit (automated tests + CI/CD)
- ✅ **Audited** with mandatory completeness checks

**Current Resources:** 64 skills, 50 MCPs, 237 total resources, core resources fully discoverable

**See:** [Audit Trust Restoration](DOCS/AUDIT-TRUST-RESTORATION.md) for details on the 5-layer protection system.

### ✅ Strong Skill-to-MCP Coverage

**Current Status:** 64 skills with 50 MCPs = **92% coverage** (0.92:1 ratio)

**What This Means:**
- **Skills** describe HOW to do things (methodologies, approaches)
- **MCPs** actually DO things (tools, actions, automation)
- **76% coverage** means strong skill-to-tool alignment

**Coverage Breakdown:**
- ✅ **45 skills** have MCP support (fully actionable)
- ⚠️ **14 skills** without dedicated MCPs (methodology-focused):
  - bmad-method
  - brand-designer
  - context-preserver
  - focus-session-manager
  - framework-orchestrator
  - growth-experimenter
  - pricing-strategist
  - product-analyst
  - product-analytics
  - prp-generator
  - spatial-developer
  - task-breakdown-specialist
  - usability-tester
  - voice-interface-builder

**Why This Matters:**
- Users can execute most methodologies automatically
- AI can both advise AND act
- Strong automation value throughout the system

**See:** `META/mcp-registry.json` for complete MCP catalog and coverage details

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

---

## Versioning

**Current Version:** 2.1.0

**Version History:**
- **2.1.0** (2025-10-29): Validation & Orchestration Update
  - Added comprehensive validation system (`validate-complete-system.cjs`)
  - Implemented Claude Code orchestration infrastructure (zero-cost alternative to OpenAI Codex)
  - Registry cleanup and consistency fixes (72 components, 237 total resources)
  - 100% registry consistency achieved with bidirectional validation
- **2.0.0** (2025-10-27): Phase 3 Complete - Design System (75 components, 50 MCPs, 240 total resources)
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
