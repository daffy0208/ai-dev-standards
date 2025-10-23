# Resource Guide

**Last Updated:** 2025-10-22
**Version:** 1.1.0
**Status:** ✅ 100% Discoverable

---

## Purpose

Quick reference for all ai-dev-standards resources. Everything listed here is registered in META/registry.json and validated by automated tests.

**Archived:** This replaces RESOURCE-INDEX.md, RESOURCE-DISCOVERY-ANALYSIS.md, RESOURCE-DISCOVERY-FIX-STATUS.md, and RESOURCE-PRIORITY-PLAN.md.

---

## 📊 Resource Inventory

| Category | Count | Purpose | Auto-Update |
|----------|-------|---------|-------------|
| **Skills** | 36 | AI methodologies (HOW to build) | ✅ Yes |
| **MCPs** | 3 | Tools (DO things) | ✅ Yes |
| **Components** | 9 | Reusable code patterns | 📦 On-request |
| **Integrations** | 4+ | Third-party service connectors | 📦 On-request |
| **Standards** | 14 | Architecture patterns & best practices | ✅ Yes |
| **Playbooks** | 7 | Step-by-step procedures | ✅ Yes |
| **Utils** | 5 | Utility functions | 📦 On-request |
| **Tools** | 4+ | Development tools | 📦 On-request |
| **Examples** | 2+ | Sample code | 📦 On-request |
| **Templates** | 10+ | Project starters | 📦 On-request |
| **Schemas** | 2 | Data validation schemas | ✅ Yes |
| **Installers** | 3 | Setup automation scripts | ✅ Yes |
| **Scripts** | 3 | Build/maintenance scripts | ✅ Yes |

**Total:** 100+ resources across 13 categories

---

## 🎯 Featured Resources

### Top Skills
- **mvp-builder** — Rapid MVP development with P0/P1/P2 prioritization
- **rag-implementer** — RAG systems with vector databases
- **product-strategist** — Product-market fit validation
- **frontend-builder** — React/Next.js development
- **api-designer** — REST and GraphQL API design

[See complete skill list in META/registry.json]

### MCPs (Tools)
1. **accessibility-checker** — WCAG compliance checking
2. **component-generator** — React component generation with tests
3. **screenshot-testing** — Visual regression testing

**⚠️ Gap:** 30 more MCPs needed to match skill count. See BUILD_FOCUS.md for roadmap.

### Key Standards
- **rag-pattern.md** — RAG architecture
- **microservices-pattern.md** — Microservices design
- **authentication-patterns.md** — Auth patterns
- **database-design-patterns.md** — Database optimization
- **serverless-pattern.md** — Serverless architecture

[Complete list: 14 patterns in STANDARDS/]

---

## 🚀 Usage

### Get Everything (Bootstrap)
```bash
npx @ai-dev-standards/bootstrap
```

### Get Specific Resources
```bash
# Sync latest skills
ai-dev sync --skills

# Install a component
ai-dev install component rag-pipelines

# Get a template
ai-dev generate project --template saas-starter
```

### Check What's Available
```bash
# List all resources
ai-dev list

# List by category
ai-dev list skills
ai-dev list mcps
ai-dev list components
```

---

## 📦 Resource Categories Explained

### Skills (SKILLS/)
**What:** Methodologies and approaches (the HOW)
**Example:** rag-implementer explains how to build RAG systems
**Auto-update:** ✅ Yes (always current)
**Customizable:** No (canonical patterns)

### MCPs (MCP-SERVERS/)
**What:** Executable tools (the DO)
**Example:** accessibility-checker runs WCAG audits
**Auto-update:** ✅ Yes
**Customizable:** Limited (configuration only)

### Components (COMPONENTS/)
**What:** Reusable code templates
**Example:** rag-pipelines provides RAG implementation code
**Auto-update:** 📦 On-request
**Customizable:** Yes (fully editable after install)

### Integrations (INTEGRATIONS/)
**What:** Third-party service connectors
**Example:** anthropic-client wraps Claude API
**Auto-update:** 📦 On-request
**Customizable:** Yes

### Standards (STANDARDS/)
**What:** Architecture patterns and best practices
**Example:** rag-pattern.md shows proven RAG architectures
**Auto-update:** ✅ Yes (CRITICAL for security)
**Customizable:** No (add custom docs separately)

### Playbooks (PLAYBOOKS/)
**What:** Step-by-step operational procedures
**Example:** deployment-checklist.md lists pre-deploy steps
**Auto-update:** ✅ Yes
**Customizable:** No

### Utils (UTILS/)
**What:** Helper functions and scripts
**Example:** logger.ts provides formatted console output
**Auto-update:** 📦 On-request
**Customizable:** Yes

### Templates (TEMPLATES/)
**What:** Project starter kits
**Example:** saas-starter provides full SaaS boilerplate
**Auto-update:** 📦 On-request
**Customizable:** Yes (starting point only)

### Installers (INSTALLERS/)
**What:** Automated setup scripts
**Example:** create-rag-system sets up complete RAG stack
**Auto-update:** ✅ Yes
**Customizable:** No

---

## 🔍 Finding Resources

### By Use Case

**Building a RAG System?**
- Skill: rag-implementer
- MCPs: vector-database-mcp (planned), embedding-generator-mcp (planned)
- Component: rag-pipelines
- Integration: vector-databases, llm-providers
- Standard: rag-pattern
- Installer: create-rag-system

**Building an MVP?**
- Skill: mvp-builder
- MCPs: feature-prioritizer-mcp (planned)
- Component: agents, workflows
- Playbook: validation-first-development

**Building a SaaS App?**
- Skills: frontend-builder, api-designer, deployment-advisor
- MCPs: component-generator, accessibility-checker
- Components: ui-components, forms, auth
- Installer: create-saas

### By Technology

**React/Next.js:**
- frontend-builder skill
- component-generator MCP
- ui-components, forms components

**AI/LLM:**
- rag-implementer, multi-agent-architect skills
- anthropic-client integration

**APIs:**
- api-designer skill
- openapi-generator-mcp (planned)

---

## ✅ Quality Assurance

### 100% Registry Coverage
Every resource is registered in META/registry.json and validated by:
- 30 automated tests (all passing)
- CI/CD enforcement (blocks merges if validation fails)
- Weekly manual review

### Relationship Mapping
- 3/3 MCPs list which skills they enable
- 37/37 skills declare what they require
- 9/9 components list their dependencies
- 3/3 installers detail what they install

---

## 🚨 Known Gaps

### MCP Coverage: 8%
- **Current:** 3 MCPs
- **Needed:** 30+ MCPs
- **Gap:** 92% of skills lack corresponding tools
- **Status:** Active development (see BUILD_FOCUS.md)

### Skill Relationship Metadata: 50%
- **Current:** 37/37 skills have `requires` field
- **Target:** All high-priority skills
- **Status:** Phase 2 complete for priority skills

---

## 📚 Related Docs

- **BUILD_FOCUS.md** — Current development priorities
- **AUDIT-SYSTEM.md** — Quality validation procedures
- **AUTO-SYNC-GUIDE.md** — How resources stay up-to-date

---

## 🎯 Next Steps

1. **For Users:** Run `npx @ai-dev-standards/bootstrap` to get started
2. **For Contributors:** See CONTRIBUTING.md
3. **For MCP Development:** See BUILD_FOCUS.md (MCPs are current priority)

---

**Version:** 1.1.0 | **Registry Coverage:** 100% | **Tests Passing:** 30/30
