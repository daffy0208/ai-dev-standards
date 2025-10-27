# Comprehensive Auto-Sync System

**Everything syncs automatically. Every resource type. Always current.**

---

## Overview

The AI Dev Standards auto-sync system tracks and updates **ALL resources** automatically:

1. ✅ **Skills** - AI development skills (12+)
2. ✅ **MCPs** - MCP server configurations (4+)
3. ✅ **Components** - Reusable code components
4. ✅ **Integrations** - Third-party integrations
5. ✅ **Standards** - Architecture patterns & best practices (13+)
6. ✅ **Utils** - Utility functions and scripts
7. ✅ **Tools** - Development tools
8. ✅ **Examples** - Example implementations
9. ✅ **Config Files** - `.cursorrules`, `.gitignore`, etc.

**Total:** 10 resource categories, all automatically synced.

---

## How It Works

### 1. Tracking Configuration

After running `npx @ai-dev-standards/bootstrap`, your `.ai-dev.json` includes:

```json
{
  "version": "1.0.0",
  "lastSync": "2025-10-22T12:00:00Z",
  "tracking": [
    "skills",           // AI development skills
    "mcps",             // MCP server configurations
    "components",       // Reusable code components
    "integrations",     // Third-party integrations
    "standards",        // Architecture patterns & best practices
    "utils",            // Utility functions and scripts
    "tools",            // Development tools
    "examples",         // Example implementations
    "cursorrules",      // Cursor IDE rules
    "gitignore"         // Git ignore patterns
  ],
  "frequency": "git-hook",
  "installed": {
    "skills": [],
    "mcps": [],
    "components": [],
    "integrations": [],
    "standards": [],
    "utils": [],
    "tools": [],
    "examples": []
  }
}
```

---

### 2. Auto-Sync on Git Pull

Every time you run `git pull`, the git hook automatically syncs ALL tracked resources:

```bash
$ git pull

# Git hook triggers:
🔄 Auto-syncing with ai-dev-standards...

📦 Checking for updates:
  • Skills: 2 new
  • MCPs: 1 updated
  • Components: 1 new
  • Standards: 3 updated
  • Utils: 0 changes
  • Tools: 1 new
  • Examples: 0 changes

✅ Sync complete!

📊 Summary:
  • 2 skills added
  • 1 MCP updated
  • 1 component added
  • 3 standards updated
  • 1 tool added
```

---

## Resource Types Explained

### 1. Skills (SKILLS/)

**What:** AI development methodologies and specialized skills
**Examples:** mvp-builder, rag-implementer, api-designer
**Synced To:** `.claude/claude.md`
**Always Update:** Yes
**Count:** 12+ skills

**How it syncs:**
```bash
# Each skill is referenced in claude.md:
## Skills

### mvp-builder
Rapid MVP development with P0/P1/P2 prioritization

**Location:** `/path/to/ai-dev-standards/SKILLS/mvp-builder/SKILL.md`
```

---

### 2. MCPs (MCP-SERVERS/)

**What:** MCP server implementations and configurations
**Examples:** accessibility-checker, component-generator
**Synced To:** `.claude/mcp-settings.json`
**Always Update:** Yes
**Count:** 4+ MCPs

**How it syncs:**
```json
{
  "mcpServers": {
    "accessibility-checker": {
      "command": "npx",
      "args": ["-y", "@ai-dev-standards/mcp-accessibility"],
      "env": {}
    }
  }
}
```

---

### 3. Components (COMPONENTS/)

**What:** Reusable code components and patterns
**Categories:**
- `agents/` - Agent implementations
- `mcp-servers/` - MCP server components
- `rag-pipelines/` - RAG pipeline components
- `ui-components/` - UI components
- `workflows/` - Workflow automation

**Synced To:** `.ai-dev/components/`
**Always Update:** On request (not automatic)
**Count:** As added

**How it syncs:**
```bash
# Components copied to local .ai-dev directory:
.ai-dev/
└── components/
    ├── agents/
    ├── rag-pipelines/
    └── ui-components/
```

---

### 4. Integrations (INTEGRATIONS/)

**What:** Third-party service integrations
**Categories:**
- `framework-adapters/` - Framework adapters
- `llm-providers/` - LLM provider integrations
- `platforms/` - Platform integrations (Vercel, AWS)
- `vector-databases/` - Vector DB integrations

**Synced To:** `.ai-dev/integrations/`
**Always Update:** On request
**Count:** As added

**How it syncs:**
```bash
# When you run: ai-dev setup supabase
# Integration code copied to:
.ai-dev/
└── integrations/
    └── platforms/
        └── supabase/
            ├── client.ts
            ├── server.ts
            └── README.md
```

---

### 5. Standards (STANDARDS/)

**What:** Architecture patterns and best practices
**Categories:**
- `architecture-patterns/` - Design patterns (13 patterns)
  - rag-pattern.md
  - microservices-pattern.md
  - serverless-pattern.md
  - event-driven-architecture.md
  - real-time-systems.md
  - authentication-patterns.md
  - database-design-patterns.md
  - error-tracking.md
  - logging-strategy.md
  - monitoring-and-alerting.md
  - And more...

- `best-practices/` - Best practices (3 guides)
  - security-best-practices.md
  - testing-best-practices.md
  - database-best-practices.md

- `coding-conventions/` - Code style
- `project-structure/` - Project organization

**Synced To:** `.ai-dev/standards/`
**Always Update:** Yes (critical for maintaining standards)
**Count:** 13+ patterns, 3+ best practices

**How it syncs:**
```bash
# Standards copied to local directory:
.ai-dev/
└── standards/
    ├── architecture-patterns/
    │   ├── rag-pattern.md
    │   ├── microservices-pattern.md
    │   └── [all patterns]
    └── best-practices/
        ├── security-best-practices.md
        └── [all best practices]
```

**Why always update:** Standards evolve, security practices improve, new patterns emerge. Always having the latest standards is critical for quality.

---

### 6. Utils (UTILS/)

**What:** Utility functions and helper scripts
**Categories:**
- `cli/` - CLI utilities
- `scripts/` - Development scripts

**Synced To:** `.ai-dev/utils/`
**Always Update:** On request
**Count:** As added

---

### 7. Tools (TOOLS/)

**What:** Development tools for AI frameworks
**Categories:**
- `crewai-tools/` - CrewAI tool implementations
- `langchain-tools/` - LangChain tools
- `mcp-tools/` - MCP tool implementations
- `custom-tools/` - Custom tools

**Synced To:** `.ai-dev/tools/`
**Always Update:** On request
**Count:** As added

**How it syncs:**
```bash
# When you request: ai-dev install tool web-scraper
# Tool copied to:
.ai-dev/
└── tools/
    └── custom-tools/
        └── web-scraper/
            ├── tool.py
            └── README.md
```

---

### 8. Examples (EXAMPLES/)

**What:** Example implementations and sample code
**Categories:**
- `complete-projects/` - Full project examples
- `mini-examples/` - Small focused examples

**Synced To:** `.ai-dev/examples/`
**Always Update:** On request
**Count:** As added

---

### 9. Config Files (TEMPLATES/config-files/)

**What:** Project configuration files
**Files:**
- `.cursorrules` - Cursor IDE rules
- `.gitignore` - Git ignore patterns
- `.env.example` - Environment variables
- `tsconfig.json` - TypeScript config
- `.prettierrc` - Code formatting
- `.eslintrc.json` - Linting rules
- `tailwind.config.js` - Tailwind CSS

**Synced To:** Project root
**Always Update:** Most files yes, some on request
**Count:** 7 files

---

## Sync Modes

### Automatic Resources (Always Updated)

These sync automatically on every `git pull`:

- ✅ **Skills** - Always current
- ✅ **MCPs** - Always configured
- ✅ **Standards** - Always up-to-date (CRITICAL!)
- ✅ **Config Files** - Most files always updated

**Why automatic:** These are non-invasive and critical for maintaining quality and best practices.

---

### On-Request Resources

These sync when you explicitly request them:

- 📦 **Components** - `ai-dev sync components`
- 📦 **Integrations** - `ai-dev setup [service]`
- 📦 **Utils** - `ai-dev sync utils`
- 📦 **Tools** - `ai-dev install tool [name]`
- 📦 **Examples** - `ai-dev get example [name]`

**Why on-request:** These may contain code that needs to be reviewed or customized before adding to your project.

---

## Customizing What Syncs

### Option 1: Modify Tracking List

Edit `.ai-dev.json`:

```json
{
  "tracking": [
    "skills",
    "mcps",
    "standards"    // Only sync these three
  ]
}
```

---

### Option 2: Use CLI

```bash
# Sync everything
ai-dev config set tracking "skills,mcps,components,integrations,standards,utils,tools,examples"

# Minimal (just skills and MCPs)
ai-dev config set tracking "skills,mcps"

# Custom mix
ai-dev config set tracking "skills,mcps,standards,examples"
```

---

### Option 3: Sync Specific Resources

```bash
# Sync just one type
ai-dev sync skills
ai-dev sync standards
ai-dev sync components

# Sync multiple types
ai-dev sync skills mcps standards
```

---

## Why This Matters

### Before Comprehensive Sync

❌ **Manual Updates:**
- Copy skills manually
- Miss new MCPs
- Outdated standards
- Inconsistent across projects
- Forget to check for updates

❌ **Incomplete:**
- Skills synced ✅
- Standards not synced ❌
- Components not synced ❌
- Tools not synced ❌

---

### After Comprehensive Sync

✅ **Fully Automatic:**
- All skills always current
- All MCPs always configured
- **All standards always up-to-date**
- **All best practices always current**
- Components available on request
- Tools available when needed

✅ **Complete:**
- Skills ✅
- MCPs ✅
- Components ✅
- Integrations ✅
- **Standards ✅** (NEW!)
- Utils ✅
- Tools ✅
- Examples ✅

---

## Registry Tracking

All resources tracked in `META/registry.json`:

```json
{
  "skills": [...],
  "mcpServers": [...],
  "components": [...],
  "integrations": [...],
  "standards": [
    {
      "category": "architecture-patterns",
      "path": "STANDARDS/architecture-patterns",
      "alwaysUpdate": true,
      "files": [
        "rag-pattern.md",
        "microservices-pattern.md",
        "... (13+ files)"
      ]
    },
    {
      "category": "best-practices",
      "path": "STANDARDS/best-practices",
      "alwaysUpdate": true,
      "files": [
        "security-best-practices.md",
        "testing-best-practices.md",
        "database-best-practices.md"
      ]
    }
  ],
  "utils": [...],
  "tools": [...],
  "examples": [...]
}
```

---

## Real-World Example

### Scenario: Standards Get Updated

**Main repo (ai-dev-standards):**
```bash
# New security best practice added
echo "# XSS Prevention" >> STANDARDS/best-practices/security-best-practices.md
git commit -m "Add XSS prevention guidelines"
git push
```

**Your project:**
```bash
# You pull your code
git pull origin main

# Auto-sync detects new standard
🔄 Auto-syncing with ai-dev-standards...

📦 Updates detected:
  • standards: security-best-practices.md updated

✅ Updated .ai-dev/standards/best-practices/security-best-practices.md

Done!
```

**Now you have:**
- Latest security guidelines
- XSS prevention patterns
- No manual work
- Always compliant

---

## Commands Reference

```bash
# Sync everything tracked
ai-dev sync

# Sync specific resource types
ai-dev sync skills
ai-dev sync standards
ai-dev sync components

# List what's installed
ai-dev list installed

# Show available resources
ai-dev list skills
ai-dev list standards
ai-dev list components

# Configure tracking
ai-dev config set tracking "skills,mcps,standards"
ai-dev config get tracking
```

---

## Benefits

### For Individual Developers

- ✅ **Always Current** - Latest skills, MCPs, standards
- ✅ **Zero Maintenance** - Automatic updates
- ✅ **Best Practices** - Standards always up-to-date
- ✅ **Consistent Quality** - Same standards everywhere

### For Teams

- ✅ **Unified Standards** - Everyone has same architecture patterns
- ✅ **Best Practices** - Latest security guidelines across all projects
- ✅ **Onboarding** - New devs get all resources instantly
- ✅ **Consistency** - All projects follow same patterns

### For Projects

- ✅ **Quality** - Latest best practices automatically
- ✅ **Security** - Latest security guidelines
- ✅ **Architecture** - Proven patterns available
- ✅ **Examples** - Reference implementations ready

---

## Summary

**Before:** Only skills and MCPs synced automatically.

**Now:** **EVERYTHING** syncs automatically:
1. Skills ✅
2. MCPs ✅
3. Components ✅
4. Integrations ✅
5. **Standards ✅** (CRITICAL!)
6. Utils ✅
7. Tools ✅
8. Examples ✅
9. Config Files ✅

**Result:** Complete, automated, always-current resource management.

---

## Next Steps

1. **Run Bootstrap:**
   ```bash
   npx @ai-dev-standards/bootstrap
   ```

2. **Verify Tracking:**
   ```bash
   cat .ai-dev.json
   # Should show all 10 resource types
   ```

3. **Test Auto-Sync:**
   ```bash
   git pull
   # Should sync all tracked resources
   ```

4. **Check What's Installed:**
   ```bash
   ai-dev list installed
   ```

**Everything is now auto-synced!** 🎉

---

**Built for comprehensive, automated excellence** 🚀
