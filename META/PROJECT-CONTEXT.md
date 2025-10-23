# Project Context

## For AI Assistants: Understanding This Repository

### What This Is

This is the **AI Development Standards Repository** - a curated knowledge base for AI-assisted development. It provides:

- **Skills** - Specialized methodologies Claude can invoke (MVP building, RAG implementation, API design)
- **Architecture Patterns** - Proven approaches for complex systems (multi-agent, knowledge graphs, MCP integration)
- **Best Practices** - Security, performance, and quality standards
- **Playbooks** - Step-by-step operational procedures
- **Decision Frameworks** - Guidance for choosing technologies and approaches

**Core Philosophy:** Quality over quantity. Every item in this repository has been curated, adapted, and rewritten for its specific purpose.

---

## How This Repository Works

### The Extension Model

This repository leverages Claude Code's official extension architecture:

**Skills (SKILLS/ directory)**
- Model-invoked capabilities that Claude activates automatically
- Format: YAML frontmatter + Markdown instructions
- Purpose: Provide specialized methodologies and expertise
- Example: `mvp-builder` activates when discussing MVP development

**Architecture Patterns (STANDARDS/architecture-patterns/)**
- Reference documentation for system design
- NOT skills - these are materials to consult
- Purpose: Document proven architectural approaches
- Example: RAG implementation patterns, multi-agent orchestration

**Best Practices (STANDARDS/best-practices/)**
- Guidelines for security, performance, testing
- Purpose: Ensure consistent quality standards
- Example: Security governance, testing strategies

**Playbooks (PLAYBOOKS/)**
- Step-by-step operational procedures
- Purpose: Standardize common workflows
- Example: Deployment procedures, release management

---

## Core Concepts

### Skills vs Standards vs Playbooks

**Skills are executable methodologies:**
- Claude follows these as instructions
- Invoked automatically based on context
- Provide step-by-step guidance
- Example: "Use mvp-builder skill to prioritize features"

**Standards are reference documentation:**
- Claude consults these for information
- Not automatically invoked
- Provide patterns and principles
- Example: "Review RAG architecture pattern for design guidance"

**Playbooks are operational procedures:**
- Step-by-step checklists for specific tasks
- Used when following a defined process
- Include prerequisites and success criteria
- Example: "Follow deployment playbook for production release"

### When to Use What

| Need | Solution | Location |
|------|----------|----------|
| Specialized methodology | Skill | SKILLS/ |
| Architectural guidance | Pattern | STANDARDS/architecture-patterns/ |
| Quality standards | Best Practice | STANDARDS/best-practices/ |
| Operational procedure | Playbook | PLAYBOOKS/ |
| Technology decision | Decision Framework | META/DECISION-FRAMEWORK.md |

---

## Repository Structure

```
ai-dev-standards/
├── META/                           # Core context and navigation
│   ├── PROJECT-CONTEXT.md          # This file
│   ├── HOW-TO-USE.md               # Navigation guide
│   ├── DECISION-FRAMEWORK.md       # Technology decisions
│   └── skill-registry.json         # Searchable skill index
│
├── SKILLS/                         # Specialized methodologies
│   ├── _TEMPLATE/                  # Template for creating skills
│   ├── mvp-builder/                # MVP development skill
│   ├── rag-implementer/            # RAG implementation skill
│   └── [11 more skills]/
│
├── STANDARDS/
│   ├── architecture-patterns/      # System design patterns
│   │   ├── rag-pattern.md
│   │   ├── multi-agent-pattern.md
│   │   └── [8 more patterns]
│   ├── best-practices/             # Quality standards
│   │   ├── security-governance.md
│   │   ├── testing-strategies.md
│   │   └── [3 more practices]
│   └── [other standard categories]/
│
├── PLAYBOOKS/                      # Operational procedures
│   ├── build-support-system.md
│   ├── deploy-to-production.md
│   └── [6 more playbooks]
│
├── TEMPLATES/                      # Project starters
├── COMPONENTS/                     # Reusable implementations
├── INTEGRATIONS/                   # Framework adapters
├── EXAMPLES/                       # Reference implementations
├── DOCS/                          # Additional documentation
└── UTILS/                         # Helper scripts
```

---

## Philosophy & Principles

### 1. Curated, Not Comprehensive

This repository prioritizes **quality over quantity**:
- ✅ 12 excellent skills > 50 mediocre ones
- ✅ 10 proven patterns > 60 theoretical frameworks
- ✅ Clear boundaries > everything-is-a-framework confusion

### 2. Purpose-Built Formats

Each type of content follows its **official format**:
- Skills follow Claude Code's YAML frontmatter specification
- Patterns follow problem→solution→trade-offs structure
- Playbooks follow checklist-based procedures
- No mixing of formats or purposes

### 3. Rewritten, Not Copied

All content has been **adapted for its purpose**:
- Skills condensed to focused instructions (150-250 lines)
- Patterns restructured from frameworks
- Playbooks created from procedural skills
- Redundancy eliminated

### 4. Best Tool for the Job

No framework favoritism - recommendations based on:
- Problem requirements
- Team capabilities
- Project constraints
- Clear decision criteria (see DECISION-FRAMEWORK.md)

### 5. Living System

This repository evolves through:
- Learnings from projects
- New patterns discovered
- Skills improved based on usage
- Standards updated as tools evolve

---

## How AI Assistants Should Use This Repository

### Priority Order

When given a task:

1. **Load Context** (always first)
   - Read META/PROJECT-CONTEXT.md (this file)
   - Read META/HOW-TO-USE.md
   - Review META/DECISION-FRAMEWORK.md if decisions needed

2. **Check Playbooks**
   - Is there an existing procedure for this exact task?
   - If yes → Follow the playbook

3. **Identify Relevant Skills**
   - Search META/skill-registry.json
   - Skills activate automatically based on descriptions
   - Can explicitly request: "Use the mvp-builder skill to..."

4. **Consult Patterns**
   - Review STANDARDS/architecture-patterns/ for design guidance
   - Check STANDARDS/best-practices/ for quality standards

5. **Reference Examples**
   - Look in EXAMPLES/ for similar implementations
   - Check COMPONENTS/ for reusable code

### Critical Rules

**NEVER:**
- ❌ Invent patterns when standard ones exist
- ❌ Skip loading context from META files
- ❌ Violate coding conventions in STANDARDS
- ❌ Duplicate existing components
- ❌ Ignore security guidelines

**ALWAYS:**
- ✅ Check for existing solutions first
- ✅ Follow standards consistently
- ✅ Document decisions and reasoning
- ✅ Reference sources (file paths and line numbers)
- ✅ Explain trade-offs when making choices

### Communication with User

**When using this repository:**

```
User: "Help me build an MVP"

AI Response:
"I'll use the mvp-builder skill to help prioritize features. This skill
provides the P0/P1/P2 matrix and five MVP patterns (Concierge, Wizard of Oz,
Landing Page, Single-Feature, Piecemeal).

First, let's identify your riskiest assumption to validate..."
```

**When referencing patterns:**

```
User: "Should I use RAG for this?"

AI Response:
"Let me consult our decision framework and RAG pattern.

Based on STANDARDS/architecture-patterns/rag-pattern.md and
META/DECISION-FRAMEWORK.md, RAG is appropriate when:
- Large knowledge base
- Frequently updated information
- Need to cite sources

Your use case fits because [reasoning]..."
```

---

## Key Differences from Framework Library

This repository was built by evaluating the Framework Library and making these improvements:

### What Changed

**From Framework Library:**
- 60 "frameworks" (mostly reference docs)
- 25 "skills" (mixed formats and purposes)
- Unclear boundaries between types
- 75% redundancy and low quality

**To ai-dev-standards:**
- 12 focused skills (official format)
- 10 architecture patterns (properly categorized)
- 8 operational playbooks (clear procedures)
- 5 security best practices (consolidated)
- 31% kept, 69% discarded or repurposed

### Why It's Better

**Clear Categorization:**
- Skills are skills (model-invoked capabilities)
- Patterns are patterns (reference documentation)
- Playbooks are playbooks (procedures)
- No confusion about what's what

**Official Formats:**
- Skills follow Claude Code YAML specification
- Patterns follow problem-solution structure
- Everything properly formatted for its purpose

**Quality Focus:**
- Only excellent or good-quality content
- Rewritten for clarity and utility
- Redundancy eliminated
- Tested for effectiveness

---

## Update Philosophy

### When to Add Content

**Add a Skill when:**
- Proven methodology not covered by existing skills
- Specialized expertise Claude doesn't have natively
- Will be used repeatedly across projects
- Can be expressed as focused instructions (150-250 lines)

**Add a Pattern when:**
- Architectural approach proven in production
- Solves complex design problems
- Not covered by existing patterns
- Includes clear trade-offs and alternatives

**Add a Playbook when:**
- Common operational procedure standardized
- Step-by-step process reduces errors
- Team repeatedly performs this task
- Success criteria can be defined

### When to Update Content

**Update when:**
- Learnings from projects improve approaches
- Tools or frameworks evolve
- Better practices discovered
- Feedback indicates confusion or gaps

### When to Remove Content

**Remove when:**
- No longer relevant (tool deprecated)
- Better alternative exists
- Not being used (no value)
- Quality below standards

---

## Integration with Projects

### In New Projects

**Setup:**
1. Create `.claude/` directory in project
2. Add `.cursorrules` file pointing to ai-dev-standards
3. Optionally add project-specific skills in `.claude/skills/`

**Example .cursorrules:**
```markdown
# Project: My Application

## Standards Repository
Located at: ~/ai-dev-standards/

## Instructions for AI Assistant
1. Before any task, read: ai-dev-standards/META/HOW-TO-USE.md
2. Follow standards in: ai-dev-standards/STANDARDS/
3. Use skills from: ai-dev-standards/SKILLS/
4. Reference patterns in: ai-dev-standards/STANDARDS/architecture-patterns/

## Project-Specific Context
[Your project-specific information]
```

### For Reviewing/Fixing Existing Projects

When reviewing existing codebases:
1. Load context from META files
2. Check project against STANDARDS/best-practices/
3. Use relevant review skills (if created as subagents)
4. Reference architecture patterns for refactoring guidance
5. Suggest improvements based on standards

---

## Success Metrics

You're using this repository effectively when:

**For AI Assistants:**
- ✅ Skills activate automatically when relevant
- ✅ Consistent code quality across projects
- ✅ Clear decisions with documented reasoning
- ✅ Reusing patterns rather than inventing
- ✅ Following playbooks for operational tasks

**For Users:**
- ✅ Projects start faster with better quality
- ✅ Fewer bugs from established patterns
- ✅ Easier to review AI-generated code
- ✅ Consistent approaches across projects
- ✅ Claude "understands" preferences automatically

---

## Versioning

**Repository Version:** 1.0.0
**Last Updated:** 2025-10-21

**Version History:**
- 1.0.0 (2025-10-21): Initial release with 12 skills, 10 patterns, 5 best practices, 8 playbooks

---

## Questions & Troubleshooting

**Q: How is this different from just prompting Claude?**
A: Skills provide specialized methodologies automatically. Patterns ensure consistency. Standards prevent reinventing wheels. It's systematic vs ad-hoc.

**Q: Can I modify or extend these skills?**
A: Yes! Skills are meant to evolve. Suggest improvements, add examples, refine instructions.

**Q: What if a skill doesn't fit my use case?**
A: Skills are focused but adaptable. Use them as guidance, not rigid rules. Explain context and adjust as needed.

**Q: How do I know which skill to use?**
A: Claude chooses based on skill descriptions. You can also explicitly request: "Use [skill-name] to..."

**Q: What if standards conflict with project requirements?**
A: Standards are guidelines, not laws. Document why you're deviating and ensure it's intentional.

---

## For AI Assistants: Quick Reference

**Every time you work in a project using ai-dev-standards:**

1. ✅ Load META/PROJECT-CONTEXT.md (this file)
2. ✅ Load META/HOW-TO-USE.md
3. ✅ Check META/DECISION-FRAMEWORK.md for decisions
4. ✅ Search META/skill-registry.json for relevant skills
5. ✅ Reference appropriate STANDARDS/
6. ✅ Follow PLAYBOOKS/ for operational tasks
7. ✅ Document decisions and reference sources

**Remember:**
- Skills provide methodology
- Patterns provide architecture
- Standards provide quality
- Playbooks provide procedures
- Decision framework provides choices

This is a **tool for excellence**, not a constraint. Use it to build better, faster, more consistently.
