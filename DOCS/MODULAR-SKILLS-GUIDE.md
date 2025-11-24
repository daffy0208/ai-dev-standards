# Modular Skills Guide

**Phase 2 Implementation Guide**

This guide explains the modular skills pattern for managing large skills using progressive disclosure.

---

## The Problem

Some skills in ai-dev-standards are large (>500 lines):

- supabase-developer: 1501 lines
- design-system-architect: 1365 lines
- forensic-data-engineer: 1194 lines
- technical-writer: 1019 lines

**Issues with large skills:**

- Hit context window limits
- Slower to load
- Harder to maintain
- User must load everything even when they need specific guidance

---

## The Solution: Modular Pattern

**Progressive Disclosure Pattern:**

- Keep core skill methodology in SKILL.md (<500 lines)
- Move detailed content to `resources/` directory
- Reference resources as needed

**Benefits:**

- Reduced context window usage
- Faster initial skill loading
- Better maintainability
- Users load only what they need

---

## Modular Skill Structure

```
SKILLS/skill-name/
├── SKILL.md                       # Core methodology (<500 lines)
│   └── References → resources/    # Links to detailed content
│
├── resources/                     # Detailed reference material
│   ├── architecture-patterns.md   # Architectural approaches
│   ├── code-examples.md           # Detailed code examples
│   ├── anti-patterns.md           # What NOT to do
│   ├── troubleshooting.md         # Common issues & fixes
│   ├── advanced-topics.md         # Deep dives
│   └── api-reference.md           # API/tool references
│
├── README.md                      # User-facing documentation
└── manifest.yaml                  # Capability manifest
```

---

## Converting Large Skills

### Step 1: Analyze Current Structure

Identify sections in SKILL.md:

- Core methodology (keep in SKILL.md)
- Detailed examples (move to resources/)
- Advanced topics (move to resources/)
- Troubleshooting (move to resources/)
- Anti-patterns (move to resources/)
- API reference (move to resources/)

### Step 2: Extract Content

**Keep in SKILL.md:**

- YAML frontmatter
- When to use this skill
- Core step-by-step methodology
- Quick examples
- References to resources

**Move to resources/:**

- Detailed code examples
- Architecture deep dives
- Comprehensive troubleshooting
- Advanced techniques
- Complete API references

### Step 3: Add Cross-References

In SKILL.md, reference resources:

```markdown
## Authentication

[Core methodology here - 50 lines]

**For detailed examples:** See `resources/auth-examples.md`
**For troubleshooting:** See `resources/auth-troubleshooting.md`
**Advanced patterns:** See `resources/auth-advanced.md`
```

### Step 4: Update README.md

Document the modular structure:

```markdown
## File Structure

- `SKILL.md` - Core methodology and quick start
- `resources/` - Detailed reference material
  - `auth-patterns.md` - Authentication patterns
  - `database-design.md` - Database schema design
  - `troubleshooting.md` - Common issues
```

---

## Example: supabase-developer Refactoring

### Current (1501 lines in SKILL.md)

```
SKILLS/supabase-developer/
├── SKILL.md (1501 lines - too large!)
├── README.md
└── manifest.yaml
```

### Proposed Modular Structure

```
SKILLS/supabase-developer/
├── SKILL.md (400 lines - core methodology)
│   ├── When to use
│   ├── Core workflow
│   ├── Quick examples
│   └── References to resources/
│
├── resources/
│   ├── authentication.md          # Auth patterns & examples
│   ├── database-design.md         # Schema design & RLS
│   ├── storage.md                 # File storage patterns
│   ├── realtime.md                # Real-time subscriptions
│   ├── edge-functions.md          # Serverless functions
│   ├── migrations.md              # Database migrations
│   ├── troubleshooting.md         # Common issues
│   └── api-reference.md           # Supabase client API
│
├── README.md
└── manifest.yaml
```

**SKILL.md (condensed to 400 lines):**

```markdown
---
name: Supabase Developer
[...frontmatter...]
---

# Supabase Developer

## When to Use

[Quick overview]

## Core Workflow

### 1. Authentication

[Core methodology - 30 lines]

**Detailed guidance:** See `resources/authentication.md`

### 2. Database Design

[Core methodology - 30 lines]

**Detailed guidance:** See `resources/database-design.md`

### 3. Storage

[Core methodology - 20 lines]

**Detailed guidance:** See `resources/storage.md`

[...continues for other sections...]

## Quick Examples

[5-10 essential examples]

## Resources

- `resources/authentication.md` - Complete auth patterns
- `resources/database-design.md` - Schema design & RLS
- `resources/storage.md` - File storage
  [...list all resources...]
```

---

## Best Practices

### 1. Keep SKILL.md Focused

**Good:**

```markdown
## Authentication

1. Choose auth method (email, OAuth, magic link)
2. Configure Supabase Auth settings
3. Implement sign-up flow
4. Implement sign-in flow
5. Handle sessions

**See:** `resources/authentication.md` for code examples and patterns
```

**Bad (too detailed for SKILL.md):**

```markdown
## Authentication

[500 lines of detailed examples, code, edge cases, etc.]
```

### 2. Make Resources Self-Contained

Each resource file should:

- Be independently readable
- Have clear purpose
- Include examples
- Reference back to SKILL.md if needed

### 3. Use Clear Naming

**Good:**

- `authentication.md` (clear purpose)
- `database-design.md` (specific topic)
- `troubleshooting.md` (obvious use)

**Bad:**

- `part1.md` (unclear)
- `misc.md` (too generic)
- `notes.md` (vague)

### 4. Maintain Consistency

All modular skills should follow same structure:

- SKILL.md always has core methodology
- resources/ always contains detailed content
- Cross-references always use same format

---

## Implementation Priority

**High Priority (>1000 lines):**

1. supabase-developer (1501 lines)
2. design-system-architect (1365 lines)
3. forensic-data-engineer (1194 lines)
4. technical-writer (1019 lines)

**Medium Priority (700-1000 lines):** 5. testing-strategist (910 lines) 6. api-integration-builder (900 lines) 7. quality-auditor (898 lines) 8. mobile-developer (884 lines) 9. data-engineer (862 lines)

**Later (if needed):**

- Skills under 700 lines can stay monolithic

---

## Conversion Checklist

Converting a skill? Use this checklist:

- [ ] Measure current line count: `wc -l SKILLS/[skill]/SKILL.md`
- [ ] Identify sections to extract
- [ ] Create `resources/` directory
- [ ] Extract detailed content to resource files
- [ ] Update SKILL.md with core methodology
- [ ] Add cross-references from SKILL.md to resources
- [ ] Update README.md to document structure
- [ ] Test skill still works
- [ ] Verify < 500 lines in SKILL.md
- [ ] Update skill-registry.json if needed
- [ ] Commit changes

---

## Measuring Success

**Before modularization:**

- Large SKILL.md files (>1000 lines)
- Slow context window loading
- Hard to find specific information

**After modularization:**

- SKILL.md < 500 lines
- Fast initial loading
- Easy to find specific topics in resources/
- Better maintainability

---

## Migration Guide

### Phase 2a: Prepare (Week 1)

1. Identify 10 largest skills
2. Analyze structure of each
3. Create conversion template
4. Test with 1 skill (proof of concept)

### Phase 2b: Convert Priority Skills (Weeks 2-3)

1. Convert 4 high-priority skills (>1000 lines)
2. Test and validate
3. Update documentation

### Phase 2c: Convert Medium Priority (Weeks 4-6)

1. Convert 5 medium-priority skills (700-1000 lines)
2. Establish standard patterns
3. Document best practices

### Phase 2d: Polish (Week 7)

1. Ensure consistency across all modular skills
2. Update documentation
3. Create examples and templates

---

## Tools and Scripts

### Count Skill Lines

```bash
# Find all skills over 500 lines
find SKILLS -name "SKILL.md" -exec wc -l {} \; | awk '$1 > 500' | sort -rn
```

### Create Resource Directory

```bash
#!/bin/bash
# create-resources.sh
SKILL_NAME=$1
mkdir -p "SKILLS/${SKILL_NAME}/resources"
echo "Created resources directory for ${SKILL_NAME}"
```

### Validate Structure

```bash
#!/bin/bash
# validate-modular.sh
SKILL_NAME=$1
LINES=$(wc -l "SKILLS/${SKILL_NAME}/SKILL.md" | awk '{print $1}')

if [ $LINES -gt 500 ]; then
  echo "❌ ${SKILL_NAME}: ${LINES} lines (exceeds 500)"
else
  echo "✅ ${SKILL_NAME}: ${LINES} lines"
fi
```

---

## Examples from claude-code-infrastructure-showcase

The showcase repository uses this pattern:

```
.claude/skills/backend-dev-guidelines/
├── SKILL.md (304 lines)
└── resources/
    ├── base-controller.md
    ├── error-handling.md
    ├── input-validation.md
    └── [other resources]
```

**Key insights:**

- Main SKILL.md stays focused
- Resources are topic-specific
- Users load only what they need
- Maintains context window efficiency

---

## Related Documentation

- [SKILL-AUTO-ACTIVATION.md](SKILL-AUTO-ACTIVATION.md) - Phase 1
- [AGENTS-GUIDE.md](AGENTS-GUIDE.md) - Phase 3
- [REPOSITORY-COMPARISON-ANALYSIS.md](../REPOSITORY-COMPARISON-ANALYSIS.md) - Full analysis

---

## Status

**Phase 2:** Documentation Complete ✅  
**Implementation:** Planned (can be done incrementally)  
**Priority:** Medium (improves performance and maintenance)

**Ready to implement:** Yes
**Breaking changes:** No (maintains backward compatibility)
**Effort:** 4-8 hours per skill, 40-80 hours total

---

**Last Updated:** 2025-11-04
