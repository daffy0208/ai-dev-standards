# Complete Folder Structure Breakdown

**Date:** 2025-10-23
**Purpose:** Comprehensive documentation of all directories, their functions, relationships, and dependencies
**Total Folders:** 109 directories (excluding node_modules, .git, dist)

---

## Top-Level Directories (18 folders)

### 1. /.claude/
**Function:** Claude Code IDE configuration
**Purpose:** Configures Claude Code with all available skills
**Contents:**
- claude.md (lists all 37 skills) - ✅ AUTO-GENERATED
- settings.local.json (user settings)

**Relationships:**
- **Reads from:** META/skill-registry.json
- **Referenced by:** Claude Code sessions
- **Auto-updates:** YES (via update-all-files-complete.cjs)

**Special Notes:**
- Critical for Claude Code integration
- Must list all skills for proper activation
- Updated automatically when skills added/removed

---

### 2. /.github/
**Function:** GitHub configuration and CI/CD
**Purpose:** GitHub Actions workflows, templates, and repo config
**Contents:**
- /workflows/ (CI/CD pipeline definitions)

**Relationships:**
- **Reads from:** package.json, validation scripts
- **Referenced by:** GitHub Actions runners
- **Triggers:** On push, PR, release

**Special Notes:**
- CI/CD automation (planned)
- Will run npm run validate on PRs
- Will run tests before merge

---

### 3. /.githooks/
**Function:** Git hooks for automation
**Purpose:** Auto-sync on git pull (post-merge hook)
**Contents:**
- post-merge (runs npm run sync after git pull)

**Relationships:**
- **Triggered by:** git pull (merge events)
- **Executes:** npm run sync
- **Validates:** Changes after sync

**Special Notes:**
- Ensures repository stays synchronized
- Part of auto-sync system
- Can be disabled in .ai-dev.json

---

### 4. /CLI/
**Function:** Command-line tool for ai-dev-standards
**Purpose:** Provides `ai-dev` command for managing skills, MCPs, and config
**Contents:**
- /commands/ (8 command modules)
- /generators/ (5 generator modules)
- /templates/ (file templates)
- index.js (CLI entry point)
- bootstrap.js (bootstrap installer)
- package.json (CLI dependencies)

**Relationships:**
- **Reads from:** META/skill-registry.json, META/registry.json
- **Writes to:** User project files (.ai-dev.json, .cursorrules, etc.)
- **Referenced by:** npx @ai-dev-standards/cli, ai-dev command

**Special Notes:**
- Separate npm package
- Installable globally or per-project
- Bootstrap system uses this

**Sub-folders:**
- **/commands/** - add, analyze, doctor, generate, init, setup, sync, update
- **/generators/** - component, integration, MCP, project, tool generators
- **/templates/** - File templates for generation

---

### 5. /COMPONENTS/
**Function:** Reusable code components library
**Purpose:** Pre-built components users can import into their projects
**Contents:**
- /agents/ (AI agent components)
- /auth/ (authentication utilities)
- /errors/ (error handling)
- /feedback/ (user feedback systems)
- /forms/ (form utilities)
- /mcp-servers/ (MCP client utilities)
- /rag-pipelines/ (RAG implementations)
- /ui-components/ (UI components)
- /workflows/ (workflow orchestration)

**Relationships:**
- **Referenced by:** User projects, EXAMPLES/
- **Requires:** Dependencies in package.json
- **Used with:** INTEGRATIONS/

**Special Notes:**
- Library code, not automation
- Users import what they need
- Examples demonstrate usage

**Sub-folders:**
- **/agents/** - Simple task agent, multi-agent systems
- **/auth/** - Auth helpers, session management
- **/errors/** - Error boundary, error tracking
- **/feedback/** - User feedback forms, sentiment analysis
- **/forms/** - Form validation, useForm hook
- **/mcp-servers/** - MCP client wrappers
- **/rag-pipelines/** - Complete RAG implementations
- **/ui-components/** - React components
- **/workflows/** - Workflow state machines

---

### 6. /DOCS/
**Function:** Active documentation (current)
**Purpose:** User-facing documentation that stays current
**Contents:**
- 17 markdown files covering installation, usage, reference
- /api/ (API documentation)
- /concepts/ (conceptual explanations)
- /guides/ (how-to guides)

**Relationships:**
- **Referenced by:** Users learning the system
- **Auto-updates:** INDEX.md, MCP-DEVELOPMENT-ROADMAP.md, RESOURCE-GUIDE.md
- **References:** SKILLS/, MCP-SERVERS/, META/

**Special Notes:**
- These are ACTIVE docs (kept current)
- Some files need template system (8 files with examples)
- INDEX.md is main entry point

**Key Files:**
- ✅ INDEX.md (auto-updates with counts)
- ✅ MCP-DEVELOPMENT-ROADMAP.md (auto-updates)
- ✅ RESOURCE-GUIDE.md (auto-updates)
- 🔄 QUICK-START.md (needs templates)
- 🔄 CLI-REFERENCE.md (needs templates)
- 🔄 BOOTSTRAP.md (needs templates)

**Sub-folders:**
- **/api/** - API reference documentation (future)
- **/concepts/** - Conceptual explanations (future)
- **/guides/** - Step-by-step guides (future)

---

### 7. /DOCS-LEGACY/
**Function:** Historical documentation (preserved)
**Purpose:** Archive of session reports and historical snapshots
**Contents:**
- 25 markdown files from specific points in time

**Relationships:**
- **Referenced by:** Historical research
- **Auto-updates:** NO (by design - historical preservation)
- **Isolated from:** Current automation

**Special Notes:**
- Contains counts from when documents were written
- DO NOT UPDATE (feature, not bug)
- Preserves project history
- Moved here to reduce root directory clutter

**Categories:**
- Audit reports (AUDIT-TRUST-RESTORATION.md, QUALITY-AUDIT-REPORT.md)
- Status reports (BUILD-STATUS.md, AUTO-SYNC-SUMMARY.md)
- Analysis documents (GAP-ANALYSIS.md, ECOSYSTEM-PARITY-ANALYSIS.md)
- Session summaries (SESSION-SUMMARY.md, WEEK1-COMPLETION-SUMMARY.md)

---

### 8. /EXAMPLES/
**Function:** Example projects and code samples
**Purpose:** Demonstrate how to use ai-dev-standards in real projects
**Contents:**
- /complete-projects/ (full example apps)
- /mini-examples/ (small code samples)
- sample-project-cursorrules.md

**Relationships:**
- **References:** SKILLS/, COMPONENTS/, INTEGRATIONS/
- **Referenced by:** Users learning the system
- **Demonstrates:** Real-world usage patterns

**Special Notes:**
- Example code, not production code
- Shows integration patterns
- Some examples may have hardcoded counts (need templates)

**Sub-folders:**
- **/complete-projects/** - Full applications showing integration
- **/mini-examples/** - Small, focused examples (simple-rag-pipeline.ts)

---

### 9. /INSTALLERS/
**Function:** Installation packages for different project types
**Purpose:** One-command installers for common setups
**Contents:**
- /bootstrap/ (base installer)
- /create-rag-system/ (RAG system installer)
- /create-saas/ (SaaS starter installer)

**Relationships:**
- **Uses:** CLI/, TEMPLATES/, SKILLS/
- **Referenced by:** npx @ai-dev-standards/bootstrap, etc.
- **Creates:** New project directories

**Special Notes:**
- Each is a separate npm package
- Provides zero-config setup
- Copies templates and configures project

**Sub-folders:**
- **/bootstrap/** - Base installation (any project type)
- **/create-rag-system/** - RAG-specific setup
- **/create-saas/** - SaaS starter with auth, payments, etc.

---

### 10. /INTEGRATIONS/
**Function:** Third-party service integrations
**Purpose:** Ready-to-use client libraries and adapters
**Contents:**
- /framework-adapters/ (Next.js, React, etc.)
- /llm-providers/ (Anthropic, OpenAI clients)
- /platforms/ (Supabase, Stripe, Resend)
- /vector-databases/ (Pinecone, Chroma, etc.)

**Relationships:**
- **Used by:** User projects, EXAMPLES/
- **Referenced by:** SKILLS/ (in `requires` field)
- **Requires:** Service API keys (environment variables)

**Special Notes:**
- Production-ready client code
- Handles authentication, retries, errors
- Type-safe TypeScript implementations

**Sub-folders:**
- **/framework-adapters/** - Next.js, React, Express adapters
- **/llm-providers/** - anthropic-client.ts, openai-client.ts
- **/platforms/resend/** - Email service client
- **/platforms/stripe/** - Payment processing (client.ts, webhooks.ts)
- **/platforms/supabase/** - Database and auth (client.ts, server.ts)
- **/vector-databases/pinecone/** - Vector database client

---

### 11. /MCP-SERVERS/
**Function:** MCP (Model Context Protocol) server implementations
**Purpose:** Actionable tools that enable skills to do real work
**Contents:**
- 7 MCP implementations (4 active, 3 planned)

**Relationships:**
- **Enables:** Corresponding skills in SKILLS/
- **Auto-synced:** Scanned to build META/registry.json
- **Referenced by:** .ai-dev.json (installed MCPs)

**Special Notes:**
- SINGLE SOURCE OF TRUTH for MCP count
- Each MCP is a TypeScript project with tests
- Gap: 30 more MCPs needed (5.3:1 skills:MCPs ratio)

**MCP Implementations:**
1. **accessibility-checker-mcp/** (planned) - Enables accessibility-engineer
2. **component-generator-mcp/** (planned) - Enables frontend-builder
3. **dark-matter-analyzer-mcp/** (active) - Enables dark-matter-analyzer
4. **embedding-generator-mcp/** (active) - Enables rag-implementer
5. **feature-prioritizer-mcp/** (active) - Enables mvp-builder
6. **screenshot-testing-mcp/** (planned) - Enables testing-strategist
7. **vector-database-mcp/** (active) - Enables rag-implementer

**Each MCP contains:**
- README.md (documentation)
- package.json (npm config)
- src/index.ts (implementation)
- src/providers/ (multi-provider support)
- tests (unit + integration)
- dist/ (compiled output)

---

### 12. /META/
**Function:** Strategic documentation and registries
**Purpose:** Master registries, roadmaps, and project context
**Contents:**
- skill-registry.json (37 skills) - ✅ AUTO-SYNCED
- registry.json (7 MCPs) - ✅ AUTO-SYNCED
- relationship-mapping.json (100% skill coverage)
- Strategic documentation (12 .md files)

**Relationships:**
- **Source of truth:** For all skill/MCP counts
- **Referenced by:** All automation scripts, .claude/claude.md
- **Auto-synced from:** SKILLS/ and MCP-SERVERS/ directories

**Special Notes:**
- CRITICAL directory - automation depends on this
- Registries are DERIVED (auto-generated), not manually edited
- Relationship mapping is MANUAL (curated dependencies)

**Key Files:**
- ✅ skill-registry.json - Auto-synced from SKILLS/
- ✅ registry.json - Auto-synced from MCP-SERVERS/
- ✏️ relationship-mapping.json - Manual curation (100% complete)
- ✏️ PROJECT-CONTEXT.md - Project vision
- ✏️ HOW-TO-USE.md - Usage guide
- ✏️ DECISION-FRAMEWORK.md - Decision-making framework
- ✏️ GAP-ANALYSIS.md - Skill/MCP gaps
- ✏️ IMPLEMENTATION-STATUS.md - Feature status
- ✏️ MASTER-ROADMAP.md - Long-term roadmap
- ✏️ PRIORITY-ROADMAP.md - Short-term priorities
- ✏️ ADHD-DEVELOPER-ENHANCEMENTS.md - ADHD-friendly features
- ✏️ CREATIVE-TOOLS-GAP-ANALYSIS.md - Creative skill gaps
- ✏️ MODALITY-GAP-ANALYSIS.md - Modality coverage

---

### 13. /PLAYBOOKS/
**Function:** Operational playbooks and procedures
**Purpose:** Step-by-step guides for common operations
**Contents:**
- 7 playbook markdown files

**Relationships:**
- **Referenced by:** Users handling operations
- **Uses:** SKILLS/, TOOLS/
- **Complements:** DOCS/ (procedures vs documentation)

**Special Notes:**
- Operational "runbooks"
- Copy-paste ready commands
- Incident response, deployment, migrations

**Playbooks:**
- adhd-getting-unstuck.md - ADHD-specific productivity
- backup-and-restore.md - Data backup procedures
- database-migration.md - Database migration steps
- deployment-checklist.md - Pre-deployment checks
- incident-response.md - Production incident handling
- rollback-procedure.md - How to rollback deployments
- validation-first-development.md - TDD/validation workflow

---

### 14. /SCHEMAS/
**Function:** JSON Schema definitions
**Purpose:** Validate configuration files and data structures
**Contents:**
- ai-dev.config.schema.yaml
- component.schema.yaml

**Relationships:**
- **Validates:** .ai-dev.json, component manifests
- **Referenced by:** Validation scripts, CLI
- **Isolated:** Self-contained definitions

**Special Notes:**
- No external dependencies
- Used for validation only
- YAML format for readability

---

### 15. /SKILLS/
**Function:** Skill definitions and prompts
**Purpose:** 37 specialized AI assistant skills
**Contents:**
- 37 skill directories + _TEMPLATE
- Each skill has SKILL.md (AI prompt) and README.md (user docs)

**Relationships:**
- **SINGLE SOURCE OF TRUTH:** For skill count
- **Auto-synced to:** META/skill-registry.json
- **References:** INTEGRATIONS/, COMPONENTS/, MCP-SERVERS/ (in `requires`)
- **Referenced by:** .claude/claude.md, all documentation

**Special Notes:**
- Each directory = 1 skill
- SKILL.md is AI prompt (used by Claude Code)
- README.md is user-facing docs
- _TEMPLATE/ is the template for new skills

**Skill Categories:**

**Product & Strategy (3 skills):**
- mvp-builder
- product-strategist
- go-to-market-planner

**AI & Data (4 skills):**
- rag-implementer
- knowledge-graph-builder
- data-engineer
- data-visualizer

**Frontend (5 skills):**
- frontend-builder
- ux-designer
- visual-designer
- animation-designer
- accessibility-engineer

**Backend & Infrastructure (4 skills):**
- api-designer
- deployment-advisor
- performance-optimizer
- security-engineer

**Testing & Quality (3 skills):**
- testing-strategist
- quality-auditor
- dark-matter-analyzer

**ADHD Developer Tools (3 skills):**
- context-preserver
- focus-session-manager
- task-breakdown-specialist

**Creative & Media (7 skills):**
- 3d-visualizer
- audio-producer
- brand-designer
- copywriter
- livestream-engineer
- video-producer
- voice-interface-builder

**Specialized Domains (8 skills):**
- iot-developer
- localization-engineer
- mobile-developer
- multi-agent-architect
- spatial-developer
- design-system-architect
- technical-writer
- user-researcher

**Each skill directory contains:**
- SKILL.md (AI prompt - required)
- README.md (user documentation - required)
- EXAMPLES.md (optional - usage examples)
- REFERENCE.md (optional - technical reference)
- USAGE.md (optional - detailed usage guide)

---

### 16. /STANDARDS/
**Function:** Coding standards and best practices
**Purpose:** Style guides, patterns, and conventions
**Contents:**
- /architecture-patterns/ (system design patterns)
- /best-practices/ (language-specific best practices)
- /coding-conventions/ (style guides)
- /project-structure/ (recommended structures)

**Relationships:**
- **Referenced by:** SKILLS/, code reviews
- **Enforced by:** .eslintrc.json, .prettierrc.json
- **Complements:** TEMPLATES/ (standards + templates = consistency)

**Special Notes:**
- Opinionated best practices
- Language and framework specific
- Used for code generation

**Sub-folders:**
- **/architecture-patterns/** - Microservices, monolith, event-driven, etc.
- **/best-practices/** - TypeScript, React, Node.js best practices
- **/coding-conventions/** - Naming, formatting, comments
- **/project-structure/** - Directory layouts, file organization

---

### 17. /TEMPLATES/
**Function:** Project and file templates
**Purpose:** Boilerplate code and configuration files
**Contents:**
- /ci-cd/ (GitHub Actions, CircleCI)
- /config-files/ (tsconfig, eslint, prettier)
- /deployment/ (Docker, Vercel, Railway)
- /project-starters/ (Next.js, Express, etc.)
- /testing/ (Vitest, Jest configs)
- 5 .cursorrules templates (AI, RAG, SaaS, minimal, quick-test)

**Relationships:**
- **Used by:** INSTALLERS/, CLI/generators/
- **Complements:** STANDARDS/ (templates implement standards)
- **Copied to:** User projects (not referenced in place)

**Special Notes:**
- Templates are meant to be copied, not imported
- Each template follows STANDARDS/
- Customizable by users after copy

**Sub-folders:**
- **/ci-cd/** - GitHub Actions, CircleCI, Jenkins configs
- **/config-files/** - tsconfig.json, .eslintrc.json, .prettierrc
- **/deployment/** - Dockerfile, docker-compose, Vercel config
- **/project-starters/** - Full project scaffolds
- **/testing/** - Vitest, Jest, Playwright configs

**Root templates:**
- cursorrules-ai-rag.md - For RAG applications
- cursorrules-existing-project.md - Add to existing projects
- cursorrules-minimal.md - Minimal configuration
- cursorrules-quick-test.md - Quick testing setup
- cursorrules-saas.md - Full SaaS application

---

### 18. /TOOLS/
**Function:** Tool integrations and wrappers
**Purpose:** Integrate with LangChain, CrewAI, custom tools
**Contents:**
- /crewai-tools/ (CrewAI tool wrappers)
- /custom-tools/ (Custom tool implementations)
- /langchain-tools/ (LangChain tool wrappers)
- /mcp-tools/ (MCP tool utilities)
- /tool-templates/ (Templates for new tools)
- tool-registry.json (available tools)

**Relationships:**
- **Wraps:** MCP-SERVERS/ for different frameworks
- **Referenced by:** Multi-agent systems, workflows
- **Used with:** COMPONENTS/agents/

**Special Notes:**
- Adapts MCPs to different frameworks
- Provides consistent interface
- Registry tracks available tools

**Sub-folders:**
- **/crewai-tools/** - CrewAI-compatible wrappers
- **/custom-tools/** - Custom tool implementations
- **/langchain-tools/** - LangChain-compatible wrappers
- **/mcp-tools/** - MCP client utilities
- **/tool-templates/** - Template for new tools

---

### 19. /UTILS/
**Function:** Utility functions and helpers
**Purpose:** Reusable utilities for common operations
**Contents:**
- /api/ (API utilities - fetch, retry, etc.)
- /cli/ (CLI utilities - prompts, colors, etc.)
- /env/ (Environment variable handling)
- /scripts/ (Script utilities)
- /validation/ (Validation utilities)

**Relationships:**
- **Used by:** CLI/, COMPONENTS/, scripts/
- **Referenced by:** All code that needs utilities
- **Complements:** COMPONENTS/ (utils are helpers, components are features)

**Special Notes:**
- Pure utility functions
- No side effects
- Well-tested, reusable

**Sub-folders:**
- **/api/** - HTTP client, retry logic, rate limiting
- **/cli/** - CLI helpers, prompts, spinners, colors
- **/env/** - Environment variable loading, validation
- **/scripts/** - Script utilities (file operations, etc.)
- **/validation/** - Schema validation, type checking

---

### 20. /portal/
**Function:** Web portal for browsing skills (future)
**Purpose:** Browse skills and MCPs via web interface
**Contents:**
- index.html (portal entry point)
- assets/ (CSS, JS, images)
- bg.png, favicon.svg

**Relationships:**
- **Reads from:** META/skill-registry.json, META/registry.json
- **Future integration:** Will provide web UI for skill browser
- **Status:** Not yet integrated

**Special Notes:**
- Future feature
- Standalone web app
- Not connected to automation yet

---

### 21. /scripts/
**Function:** Automation scripts
**Purpose:** Registry sync, validation, updates
**Contents:**
- sync-skill-registry.cjs (syncs SKILLS/ → skill-registry.json)
- sync-mcp-registry.cjs (syncs MCP-SERVERS/ → registry.json)
- update-all-files-complete.cjs (updates 8 documentation files)
- validate-all.cjs (22 validation checks)
- comprehensive-audit.cjs (audits all files for counts)
- Other helper scripts

**Relationships:**
- **Scans:** SKILLS/, MCP-SERVERS/
- **Updates:** META/, documentation files
- **Validates:** All registries and documentation
- **Referenced by:** package.json (npm scripts)

**Special Notes:**
- CRITICAL automation scripts
- Run via npm commands (npm run sync, npm run validate)
- Exit with error codes on validation failure

**Key Scripts:**
- ✅ sync-skill-registry.cjs - SKILLS/ → skill-registry.json
- ✅ sync-mcp-registry.cjs - MCP-SERVERS/ → registry.json
- ✅ update-all-files-complete.cjs - Update 8 documentation files
- ✅ validate-all.cjs - 22 validation checks
- ✅ comprehensive-audit.cjs - Audit all files
- ⚠️ update-all-files.cjs - DEPRECATED (use *-complete version)

---

### 22. /tests/
**Function:** Test suite
**Purpose:** Validate system functionality
**Contents:**
- /unit/ (unit tests)
- registry-validation.test.ts (registry tests)
- setup.ts (test configuration)

**Relationships:**
- **Tests:** META/ registries, automation scripts
- **Uses:** Vitest test framework
- **Referenced by:** npm test, CI/CD

**Special Notes:**
- Tests validation logic
- Tests registry synchronization
- Run before commits (via pre-commit hook)

**Sub-folders:**
- **/unit/** - Unit tests for utilities, components

---

## Folder Relationships Summary

### Data Flow: Source → Registries → Documentation

```
SKILLS/ (37 folders)
    ↓
    [scripts/sync-skill-registry.cjs]
    ↓
META/skill-registry.json
    ↓
    [scripts/update-all-files-complete.cjs]
    ↓
8 Documentation Files (README.md, BUILD_FOCUS.md, etc.)
    ↓
    [scripts/validate-all.cjs]
    ↓
✅ 22 Validation Checks
```

```
MCP-SERVERS/ (7 folders)
    ↓
    [scripts/sync-mcp-registry.cjs]
    ↓
META/registry.json
    ↓
    [scripts/update-all-files-complete.cjs]
    ↓
8 Documentation Files
    ↓
    [scripts/validate-all.cjs]
    ↓
✅ 22 Validation Checks
```

### User Workflow: Skills → MCPs → Components → Projects

```
User learns from DOCS/
    ↓
Chooses skills from SKILLS/
    ↓
Installs corresponding MCP-SERVERS/
    ↓
Uses COMPONENTS/ and INTEGRATIONS/ in code
    ↓
References TEMPLATES/ for boilerplate
    ↓
Follows STANDARDS/ for quality
    ↓
Uses PLAYBOOKS/ for operations
```

### Installation Flow: Bootstrap → CLI → Setup

```
npx @ai-dev-standards/bootstrap
    ↓
INSTALLERS/bootstrap/ runs
    ↓
Installs CLI/ globally or locally
    ↓
Creates .ai-dev.json
    ↓
Copies relevant TEMPLATES/
    ↓
Runs initial sync from META/
```

---

## Folder Categories

### Category 1: Single Source of Truth (2 folders)
- **SKILLS/** - 37 skills (source for skill count)
- **MCP-SERVERS/** - 7 MCPs (source for MCP count)

**Why critical:** All automation derives from these directories

---

### Category 2: Derived/Auto-Generated (1 folder)
- **META/** - Registries auto-synced from SKILLS/ and MCP-SERVERS/

**Why critical:** Bridge between source directories and documentation

---

### Category 3: Auto-Updated Documentation (2 folders)
- **DOCS/** - 3 files auto-update (INDEX.md, MCP-DEVELOPMENT-ROADMAP.md, RESOURCE-GUIDE.md)
- **.claude/** - claude.md auto-generates

**Why critical:** User-facing documentation must stay current

---

### Category 4: Historical/Preserved (1 folder)
- **DOCS-LEGACY/** - 25 historical files (DO NOT UPDATE)

**Why critical:** Preserves project history

---

### Category 5: User-Facing Libraries (5 folders)
- **COMPONENTS/** - Reusable components
- **INTEGRATIONS/** - Third-party clients
- **UTILS/** - Utility functions
- **TOOLS/** - Tool wrappers
- **TEMPLATES/** - Project templates

**Why critical:** Users import these into their projects

---

### Category 6: Automation Infrastructure (2 folders)
- **scripts/** - Automation scripts
- **tests/** - Test suite

**Why critical:** Makes the automation work

---

### Category 7: Developer Tools (1 folder)
- **CLI/** - Command-line interface

**Why critical:** User interaction with system

---

### Category 8: Documentation/Guidance (3 folders)
- **DOCS/** - Active documentation
- **STANDARDS/** - Coding standards
- **PLAYBOOKS/** - Operational procedures

**Why critical:** User learning and operations

---

### Category 9: Installation (1 folder)
- **INSTALLERS/** - Bootstrap packages

**Why critical:** Zero-config setup for users

---

### Category 10: Examples (1 folder)
- **EXAMPLES/** - Example projects

**Why critical:** Demonstrates integration

---

### Category 11: Configuration (3 folders)
- **.github/** - GitHub config
- **.githooks/** - Git hooks
- **SCHEMAS/** - JSON schemas

**Why critical:** Repository automation and validation

---

### Category 12: Future Features (1 folder)
- **portal/** - Web UI (not integrated yet)

**Why important:** Future expansion

---

## Folders by Automation Relationship

### ✅ Auto-Scanned (2 folders)
- SKILLS/ → META/skill-registry.json
- MCP-SERVERS/ → META/registry.json

### ✅ Auto-Generated (1 folder)
- META/ (registries)

### ✅ Auto-Updated (2 folders)
- DOCS/ (3 files)
- .claude/ (claude.md)

### ❌ Never Auto-Update (1 folder)
- DOCS-LEGACY/ (historical preservation)

### ✏️ Manual Management (15 folders)
- All other folders (source code, examples, templates, etc.)

---

## Critical Dependencies

### If SKILLS/ changes:
1. scripts/sync-skill-registry.cjs runs
2. META/skill-registry.json updates
3. scripts/update-all-files-complete.cjs runs
4. 8 documentation files update
5. scripts/validate-all.cjs runs
6. 22 checks validate

### If MCP-SERVERS/ changes:
1. scripts/sync-mcp-registry.cjs runs
2. META/registry.json updates
3. scripts/update-all-files-complete.cjs runs
4. 8 documentation files update
5. scripts/validate-all.cjs runs
6. 22 checks validate

### If automation scripts change:
1. Run tests (npm test)
2. Run validation (npm run validate)
3. Update COMPLETE-AUTOMATION-SYSTEM.md if behavior changes

---

## Folder Health Status

### ✅ Healthy (All folders)
- All folders serve clear purposes
- No orphaned directories
- No redundant structures
- Clear separation of concerns

### 🟡 Monitor (1 folder)
- DOCS-LEGACY/ - Monitor utility after 3 months

### 🔄 Planned Enhancements (1 folder)
- portal/ - Future web UI integration

---

## Conclusion

**Total Folders:** 22 top-level + 87 subdirectories = 109 total

**All folders have clear purposes and relationships.**

**No orphaned or redundant folders exist.**

**Automation covers all required directories (SKILLS/, MCP-SERVERS/, META/, DOCS/, .claude/).**

**Status: ✅ COMPLETE AND WELL-ORGANIZED**

---

*Last Updated: 2025-10-23*
*Documentation: This file documents the complete folder structure as of this date*
