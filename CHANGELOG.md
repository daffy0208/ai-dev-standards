# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2025-10-27

### 🔒 Security Fixes (Phase 1 - CRITICAL)

#### CLI Security Hardening
- **NEW: Centralized Validation System** - Created `CLI/utils/validation.js` with comprehensive input sanitization
  - `sanitizeName()` - Prevents path traversal attacks (e.g., `../../../etc/passwd`)
  - `validateComponentName()` - Prevents code injection in component names
  - `validateIdentifier()` - Validates JavaScript/TypeScript identifiers
  - `toPascalCase()` - Safe string transformations
- **Fixed 9 CRITICAL vulnerabilities** across all generators:
  - `component-generator.js` - Sanitized component names and prop names
  - `integration-generator.js` - Validated integration class names
  - `mcp-generator.js` - Sanitized MCP server names
  - All generators now validate user input before file system operations

### 🐛 Bug Fixes (Phase 2 - HIGH Priority)

#### CLI Sync Command (`CLI/commands/sync.js`)
- **Git Hook Protection** - Fixed hook overwrite issues
  - Checks for existing hooks before installation
  - Creates backups of existing hooks
  - Merges AI Dev Standards commands with existing hooks
  - Idempotent: skips if already configured
- **JSON Config Safety** - Fixed config file corruption
  - Deep merge instead of shallow merge prevents data loss
  - Preserves user customizations during updates
  - Validates JSON structure before writing
- **Headers Compatibility** - Fixed fetch failures with old Node versions
  - Converts Headers instances to plain objects
  - Ensures compatibility with Node 18+
  - Prevents runtime errors in HTTP requests

#### Repository Brain System (`scripts/brain/`)
- **Path Resolution** - Fixed CLI path issues
  - Detects if running from compiled dist or source
  - Correctly resolves root path in both scenarios
  - `brain.ts` line 74: Dynamic path calculation
- **Reverse Dependencies** - Fixed lookup errors
  - Added null checks for missing registries
  - Graceful handling of malformed data
  - Prevents crashes when querying dependencies

#### RAG System
- **Missing Files** - Fixed file not found errors
  - Added existence checks before reading
  - Clear error messages for missing files
  - Prevents silent failures

### ✨ Code Quality Improvements (Phase 3 - MEDIUM Priority)

#### TypeScript Type Safety
- **brain-core.ts** - Replaced 40+ `any` types with proper types
  - `getSkill()` now returns `Promise<Skill | null>`
  - `listSkills()` returns `Promise<Skill[]>`
  - `search()` returns typed search results
  - Improved IDE autocomplete and type checking
- **brain.ts** - Added return type annotations
  - All command functions now have explicit return types
  - Parameters properly typed with interfaces
  - Removed implicit `any` warnings

#### Path Normalization
- **sync.js** - Fixed registry path handling
  - `normalizeRegistryPath()` removes leading slashes
  - Consistent path handling across sync operations
  - Lines 417-423: Path normalization implementation

#### Code Cleanup
- **Dead Code Removal** - Removed unused variables and functions
- **Consistent Defaults** - Added proper default values for optional parameters
- **Improved Comments** - Added "FIX:" comments explaining all changes

### 📊 Test Coverage

#### New Test Suite
- **77 comprehensive tests** covering:
  - Security validation (path traversal, code injection)
  - Generator functionality (components, MCPs, integrations)
  - Sync command operations
  - Brain system path resolution
  - Type safety and error handling
- **100% test pass rate**
- All tests run in parallel for fast feedback

### 🔄 Version Bumps
- CLI: 1.0.0 → 1.0.1
- skill-registry.json: 3.12.0 → 3.12.2
- mcp-registry.json: 1.0.0 → 1.0.1
- relationship-mapping.json: 2.2.0 → 2.2.1

### 📊 Documentation Consistency (Phase 4 - Dogfooding)
- **Added Missing Skill** - `supabase-developer` was missing from skill-registry.json
  - Complete 1,502-line skill for building full-stack Supabase applications
  - PostgreSQL, Auth, Storage, Real-time, Edge Functions
  - Now properly registered in skill-registry.json
- **Fixed All Documentation** - Updated 42 skill references across README and INSTALL
  - README.md: All 8 locations updated (39 → 42 skills, 109 → 112 resources)
  - INSTALL.md: Updated skill count (41 → 42 skills)
  - Coverage recalculated: 92% → 86% (36 MCPs / 42 skills)
  - Total resources: 109 → 112 (42 + 36 + 9 + 4 + 13 + 6 + 2)
- **Created Validation Tool** - `scripts/validate-docs-consistency.cjs`
  - Automatically validates README/INSTALL/CHANGELOG against registries
  - Prevents documentation drift (the problem we just fixed)
  - Runs validation to ensure consistency
  - **Dogfooding**: Used our own Repository Brain system to solve our own problem

### 📝 Related Commits
- `a79b1d2` - Phase 1: Security validation system
- `9a5d744` - Phase 2: Git hook protection and sync improvements
- `fb7e024` - Phase 2: Additional sync fixes
- `3d812a5` - Phase 3: Type safety and quality improvements

### ⚠️ Breaking Changes
None - all fixes are backward compatible

### 🙏 Acknowledgments
Fixes identified and validated using OpenAI Codex CLI automated code review

---

## [1.0.0] - 2025-10-22

### 🎉 Initial Release - Production Ready

Complete AI Dev Standards system with automatic installation and syncing.

### Added

#### Core Repository
- **37 Specialized Skills** - Complete skill library
  - Product: mvp-builder, product-strategist, go-to-market-planner
  - AI/Data: rag-implementer, knowledge-graph-builder, data-engineer, data-visualizer
  - Frontend: frontend-builder, ux-designer, visual-designer, animation-designer
  - Backend: api-designer, deployment-advisor, performance-optimizer, security-engineer
  - Testing: testing-strategist, quality-auditor, dark-matter-analyzer
  - And 19 more specialized skills
- **7 MCP Servers** - 4 active, 3 planned
  - Active: dark-matter-analyzer, embedding-generator, feature-prioritizer, vector-database
  - Planned: accessibility-checker, component-generator, screenshot-testing
- **7 Config Templates** - Auto-updated configuration files
  - .cursorrules, .gitignore, .env.example
  - tsconfig.json, .prettierrc, .eslintrc.json, tailwind.config.js
- **META System** - Complete registry and navigation
  - registry.json for version tracking
  - PROJECT-CONTEXT.md, HOW-TO-USE.md, DECISION-FRAMEWORK.md

#### CLI Tool (@ai-dev-standards/cli)
- **8 Core Commands** - Full CLI functionality
  - `ai-dev sync` - Sync all components
  - `ai-dev update` - Update specific components
  - `ai-dev generate` - Generate skills/MCPs/tools/integrations
  - `ai-dev setup` - Interactive service setup (Supabase, Stripe, etc.)
  - `ai-dev list` - List available/installed components
  - `ai-dev config` - Manage configuration
  - `ai-dev search` - Search content
  - `ai-dev info` - Show component details
- **Smart Merge Strategies** - Intelligent file updating
  - Replace: Complete file replacement (.cursorrules, .prettierrc)
  - Merge: Add new lines, preserve custom (.gitignore, .env.example)
  - Smart Merge: JSON object merging (tsconfig.json, .eslintrc.json)
- **Backup System** - Automatic backup before updates
- **Version Tracking** - Registry-based version management
- **Multiple Modes** - Interactive, auto-approve, dry-run, silent

#### Bootstrap System (@ai-dev-standards/bootstrap)
- **Auto-Installation** - Zero-config setup
  - Checks Node.js version (requires 18+)
  - Installs CLI globally or locally
  - Detects project type (package.json or .git)
- **Auto-Initialization** - Complete project setup
  - Creates .ai-dev.json with defaults
  - Sets up .claude/ directory
  - Configures git hooks for auto-sync
  - Updates .gitignore with patterns
- **Initial Sync** - First-time installation
  - Installs latest skills
  - Configures MCPs
  - Updates config files
  - Shows summary
- **Multiple Entry Points**
  - NPX: `npx @ai-dev-standards/bootstrap`
  - Curl: `curl -fsSL https://ai-dev-standards.com/bootstrap.sh | bash`
  - Direct: `node /path/to/CLI/bootstrap.js`

#### Auto-Sync System
- **Git Hooks** - Automatic sync on git pull
  - post-merge hook setup
  - Silent mode for automation
  - Failure handling
- **Configurable Tracking** - Choose what to sync
  - skills, mcps, cursorrules, gitignore, tools
  - Custom frequency (git-hook, daily, weekly, manual)
- **Preferences** - Customizable behavior
  - Auto-approve (skip prompts)
  - Notifications
  - Backup before sync

#### Documentation (2500+ lines)
- **BOOTSTRAP.md** (450 lines) - Complete bootstrap guide
- **AUTO-UPDATE-FILES.md** (450 lines) - Auto-update system
- **CLI-REFERENCE.md** (550 lines) - Full command reference
- **DEPLOYMENT.md** (400 lines) - Publishing guide
- **SYSTEM-OVERVIEW.md** (650 lines) - Architecture overview
- Updated README.md with bootstrap instructions

### Fixed

#### CLI Compatibility Issues
- **ESM Module Dependencies** - Downgraded to CommonJS
  - chalk: v5 → v4.1.2 (v5+ ESM-only)
  - inquirer: v9 → v8.2.5 (v9+ ESM-only)
  - ora: v7 → v5.4.1 (v7+ ESM-only)
  - execa: v8 → v5.1.1 (v8+ ESM-only)
- **Regex Escaping** - Fixed template string regex (setup.js:368)
- **Boxen Dependency** - Removed ESM-only boxen, created ASCII banner

### Changed

#### Repository Structure
- **.cursorrules** - Updated with CLI system information
- **.gitignore** - Added CLI artifacts (.ai-dev.json, .ai-dev-cache/)
- **setup-project.sh** - Deprecated in favor of bootstrap system
- **README.md** - Added auto-bootstrap as primary installation method

### Tested

#### Bootstrap System
- ✅ Clean environment test (created test project)
- ✅ File creation verification (.ai-dev.json, .claude/, git hooks)
- ✅ Initial sync execution
- ✅ Skill installation
- ✅ MCP configuration
- ✅ Config file updates

#### CLI Commands
- ✅ Version check
- ✅ List commands
- ✅ Sync execution
- ✅ File generation

### ADHD-Friendly Features

Why this system is perfect for ADHD:
- ✅ **One command** - No multi-step process to forget
- ✅ **Fully automatic** - Runs on every git pull
- ✅ **Zero maintenance** - Set once, forget forever
- ✅ **Always current** - Latest standards automatically
- ✅ **No decisions** - Sensible defaults for everything
- ✅ **Forgiving** - Auto-backup and easy rollback

---

## [Unreleased]

### Planned for 1.1.0

#### CLI Enhancements
- [ ] `ai-dev doctor` - Diagnose setup issues
- [ ] `ai-dev clean` - Clean cache and temporary files
- [ ] Unit tests for all commands
- [ ] Integration tests

#### Publishing
- [ ] Publish @ai-dev-standards/cli to npm
- [ ] Publish @ai-dev-standards/bootstrap to npm
- [ ] Set up website/CDN for bootstrap.sh
- [ ] GitHub Actions CI/CD

#### Additional Features
- [ ] Web dashboard for browsing skills
- [ ] VS Code extension
- [ ] Telemetry (opt-in)
- [ ] Update notifications
- [ ] Plugin system for custom skills

---

## Version History

### [1.0.0] - 2025-10-22
- Initial production release
- Complete auto-bootstrap system
- Full CLI with 8 commands
- Auto-sync with git hooks
- Comprehensive documentation

---

## Notes

### Breaking Changes
None yet (initial release).

### Deprecations
- `setup-project.sh` - Use `npx @ai-dev-standards/bootstrap` instead

### Migration Guide
From manual setup to bootstrap:
1. Delete old `.cursorrules` if manually created
2. Run `npx @ai-dev-standards/bootstrap`
3. Done! System will auto-sync from now on

---

## Support

**Issues:** https://github.com/your-org/ai-dev-standards/issues
**Discussions:** https://github.com/your-org/ai-dev-standards/discussions
**Documentation:** See DOCS/ directory

---

**Built for excellence in AI-assisted development** 🚀
