# Resource Taxonomy

**Version:** 1.0.0  
**Last Updated:** 2025-11-10

This document explains how resources are counted, categorized, and managed in the ai-dev-standards repository.

---

## 📊 Resource Overview

The repository contains **360 total resources** divided into two tiers:

- **Tier 1 (Core/Executable):** 238 resources
- **Tier 2 (Supporting):** 122 resources

---

## 🎯 Tier 1: Core Resources (238 total)

Core resources are **executable** or **directly actionable** assets that AI assistants can use during development.

### Breakdown

| Resource Type    | Count | Description                                      | Registry File               |
| ---------------- | ----- | ------------------------------------------------ | --------------------------- |
| **Skills**       | 64    | Specialized methodologies that guide development | `skill-registry.json`       |
| **MCP Servers**  | 50    | Executable automation tools                      | `mcp-registry.json`         |
| **Components**   | 72    | React components and UI patterns                 | `component-registry.json`   |
| **Integrations** | 28    | Pre-configured service connections               | `integration-registry.json` |
| **Tools**        | 24    | Development utilities and scripts                | `tool-registry.json`        |

### What Counts as a Core Resource?

**Skills**

- Each skill directory in `skills/` (excluding `_TEMPLATE`)
- Must have a `skill.md` or `SKILL.md` file
- Must be registered in `meta/skill-registry.json`
- Must provide a specific methodology or expertise area

**MCPs (Model Context Protocol Servers)**

- Each MCP implementation
- Must be registered in `meta/mcp-registry.json`
- May or may not have a directory in `mcp-servers/` (some are planned/documented)
- Example: `archon-mcp` is registered but doesn't have an implementation yet

**Components**

- Reusable code components (primarily React/TypeScript)
- Registered in `meta/component-registry.json`
- Located in `components/` directory
- Each component entry counts as one resource regardless of file count

**Integrations**

- Pre-configured service connections and wrappers
- Registered in `meta/integration-registry.json`
- Located in `integrations/` directory
- Include API clients, SDKs, and service configurations

**Tools**

- Standalone utilities and scripts
- Registered in `meta/tool-registry.json`
- Located in `tools/` directory or various script directories
- Include CLI tools, automation scripts, and development utilities

---

## 📚 Tier 2: Supporting Resources (122 total)

Supporting resources provide **reference**, **guidance**, and **structure** but are not directly executable.

### Breakdown

| Resource Type  | Count | Description                              | Registry File             |
| -------------- | ----- | ---------------------------------------- | ------------------------- |
| **Playbooks**  | 14    | Step-by-step operational procedures      | `playbook-registry.json`  |
| **Standards**  | 20    | Architecture patterns and best practices | `standard-registry.json`  |
| **Templates**  | 19    | Project starter templates                | `template-registry.json`  |
| **Schemas**    | 4     | Data and configuration schemas           | `schema-registry.json`    |
| **Utilities**  | 8     | Helper utilities and common functions    | `util-registry.json`      |
| **Examples**   | 3     | Reference implementations                | `example-registry.json`   |
| **Installers** | 3     | Setup and installation scripts           | `installer-registry.json` |
| **Docs**       | 24    | Comprehensive documentation              | `docs-registry.json`      |
| **Agents**     | 27    | Claude Code agent definitions            | `agent-registry.json`     |

### What Counts as a Supporting Resource?

**Playbooks**

- Procedural guides for common tasks
- Located in `playbooks/` directory
- Each playbook file counts as one resource

**Standards**

- Architecture patterns (e.g., RAG patterns, MCP patterns)
- Best practices guides
- Located in `standards/` directory

**Templates**

- Project starter configurations
- File templates (e.g., `.cursorrules` templates)
- Located in `templates/` directory

**Schemas**

- JSON schemas for validation
- Configuration schemas
- Located in `schemas/` directory

**Utilities**

- Small helper functions
- Common code utilities
- Located in `utils/` directory

**Examples**

- Reference implementations
- Sample projects
- Located in `examples/` directory

**Installers**

- Setup scripts
- Installation utilities
- Located in `installers/` directory

**Docs**

- Comprehensive guides
- API documentation
- Located in `docs/` directory

**Agents**

- Claude Code agent definitions
- Agent configuration files
- Located in `agents/` or `.claude/agents/`

---

## 🔍 How to Count Resources

### Automated Counting

The repository uses `scripts/validate-all.cjs` to count resources:

```bash
node scripts/validate-all.cjs
```

This script:

1. Scans directories for actual resources
2. Reads registry files for registered resources
3. Validates that directory counts match registry counts
4. Reports any discrepancies

### Manual Counting

To manually count a resource type:

```bash
# Count skills
cat meta/skill-registry.json | jq '.skills | length'

# Count MCPs
cat meta/mcp-registry.json | jq '.mcps | length'

# Count components
cat meta/component-registry.json | jq '.components | length'

# Count tools
cat meta/tool-registry.json | jq '.tools | length'

# Count integrations
cat meta/integration-registry.json | jq '.integrations | length'
```

---

## 📋 Registry Files

All resources must be registered in their respective registry files in `meta/`:

### Tier 1 Registries

- `skill-registry.json` - 64 skills
- `mcp-registry.json` - 51 MCPs (50 have directories, 1 is planned)
- `component-registry.json` - 72 components
- `integration-registry.json` - 28 integrations
- `tool-registry.json` - 24 tools

### Tier 2 Registries

- `playbook-registry.json` - 14 playbooks
- `standard-registry.json` - 20 standards
- `template-registry.json` - 19 templates
- `schema-registry.json` - 4 schemas
- `util-registry.json` - 8 utilities
- `example-registry.json` - 3 examples
- `installer-registry.json` - 3 installers
- `docs-registry.json` - 24 docs
- `agent-registry.json` - 27 agents

### Master Registry

- `registry.json` - Complete index of all resources with cross-references

---

## 🔄 Adding New Resources

When adding a new resource:

1. **Create the resource** in the appropriate directory
2. **Register it** in the appropriate registry file
3. **Update counts** in documentation if needed
4. **Run validation** to ensure consistency:
   ```bash
   node scripts/validate-all.cjs
   ```

### Example: Adding a New Skill

```bash
# 1. Create skill directory and files
mkdir skills/my-new-skill
touch skills/my-new-skill/skill.md
touch skills/my-new-skill/README.md

# 2. Add entry to meta/skill-registry.json
# Edit the file to add your skill entry

# 3. Run validation
node scripts/validate-all.cjs

# 4. If validation passes, the count is automatically correct
```

---

## ⚠️ Common Pitfalls

### Pitfall 1: Composite Resources

**Problem:** A "component" might consist of multiple files

**Solution:** Count the component as ONE resource, not by file count

**Example:**

```
components/auth/LoginForm/
  ├── LoginForm.tsx
  ├── LoginForm.test.tsx
  ├── LoginForm.stories.tsx
  └── index.ts
```

This counts as **1 component**, not 4 resources.

### Pitfall 2: Template Directory

**Problem:** `skills/_TEMPLATE` is a directory but not a skill

**Solution:** Exclude `_TEMPLATE` from counts (validation script does this automatically)

### Pitfall 3: Planned vs Implemented

**Problem:** Some resources are registered but not yet implemented

**Solution:**

- Registry count reflects planned + implemented
- Directory count reflects only implemented
- Document the discrepancy (e.g., archon-mcp)

### Pitfall 4: Documentation as Resources

**Problem:** Unclear if documentation files are resources

**Solution:**

- Comprehensive guides in `docs/` → Tier 2 resources
- README files within resource directories → Not counted separately
- `meta/` documentation files → Not counted as resources

---

## 📐 Validation Rules

The validation system enforces these rules:

### Must Be True

- ✅ Every registered resource must exist (or be documented as planned)
- ✅ Every existing resource must be registered
- ✅ Registry counts must match validation script counts (within documented exceptions)
- ✅ No duplicate IDs or names within a registry
- ✅ All cross-references must be valid

### Documentation Requirements

- ✅ Resource counts in documentation must match validation output
- ✅ Any discrepancies must be documented (e.g., planned resources)
- ✅ Last updated dates must be current

---

## 🎯 Best Practices

### When Documenting Counts

**Do:**

- ✅ Use exact counts from validation script
- ✅ Clearly distinguish Tier 1 vs Tier 2
- ✅ Document any known discrepancies
- ✅ Link to this taxonomy document for details

**Don't:**

- ❌ Round numbers or use approximations
- ❌ Count resources inconsistently across documents
- ❌ Forget to update counts when adding resources
- ❌ Mix Tier 1 and Tier 2 counts without clarification

### When Adding Resources

**Do:**

- ✅ Register in appropriate registry file
- ✅ Follow naming conventions
- ✅ Run validation after adding
- ✅ Update documentation if needed

**Don't:**

- ❌ Create resources without registering them
- ❌ Use duplicate IDs or names
- ❌ Skip validation checks
- ❌ Forget to document planned resources

---

## 📊 Quick Reference

| What                    | Count | Where                                 |
| ----------------------- | ----- | ------------------------------------- |
| **Total Resources**     | 360   | All registries                        |
| **Core (Tier 1)**       | 238   | Executable resources                  |
| **Supporting (Tier 2)** | 122   | Reference resources                   |
| **Skills**              | 64    | `skills/` + registry                  |
| **MCPs**                | 51    | `mcp-servers/` + registry (1 planned) |
| **Components**          | 72    | `components/` + registry              |
| **Integrations**        | 28    | `integrations/` + registry            |
| **Tools**               | 24    | `tools/` + registry                   |
| **Playbooks**           | 14    | `playbooks/` + registry               |
| **Standards**           | 20    | `standards/` + registry               |
| **Templates**           | 19    | `templates/` + registry               |

---

## 🔗 Related Documentation

- [README.md](../README.md) - Main repository overview
- [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) - AI assistant context
- [HOW-TO-USE.md](HOW-TO-USE.md) - Navigation guide
- [DOCUMENTATION-REVIEW-FINDINGS.md](../DOCUMENTATION-REVIEW-FINDINGS.md) - Review report

---

## 📝 Version History

- **1.0.0** (2025-11-10) - Initial taxonomy document
  - Documented 360 total resources (238 Tier 1 + 122 Tier 2)
  - Clarified counting methodology
  - Defined validation rules
  - Provided best practices

---

**Maintained by:** Repository maintainers  
**Questions?** Open an issue on GitHub
