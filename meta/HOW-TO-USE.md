# How to Use This Repository

## For AI Assistants: Navigation & Usage Guide

This guide provides step-by-step instructions for using ai-dev-standards effectively.

---

## Quick Start (30 seconds)

**Every time you start working in a project using ai-dev-standards:**

```
1. Read: meta/PROJECT-CONTEXT.md
2. Read: meta/HOW-TO-USE.md (this file)
3. Review: meta/DECISION-FRAMEWORK.md (if making technology choices)
4. Search: meta/skill-registry.json (for relevant skills)
5. Proceed with task using loaded context
```

**That's it.** You're now equipped to use the full repository.

---

## Detailed Usage Workflow

### Step 1: Load Context (Always First)

**Required reading on every session:**

```bash
# Priority 1: Understand the system
meta/PROJECT-CONTEXT.md

# Priority 2: Learn navigation (this file)
meta/HOW-TO-USE.md

# Priority 3: Decision guidance (when needed)
meta/DECISION-FRAMEWORK.md
```

**Why this matters:**

- PROJECT-CONTEXT explains what each directory contains
- HOW-TO-USE (this file) teaches navigation patterns
- DECISION-FRAMEWORK provides technology choice guidance

**Time investment:** ~2 minutes
**Value:** Prevents mistakes, enables effective use

---

### Step 2: Understand the Task

**Before searching for solutions, clarify:**

- What is the user asking for?
- What type of work is this? (new feature, architecture decision, debugging, deployment)
- What's the end goal?
- What constraints exist? (time, technology, requirements)

**Example task analysis:**

```
User request: "Help me build an MVP for a task management app"

Analysis:
- Type: New product development
- Goal: Validate idea with minimal investment
- Likely needs: Feature prioritization, tech stack decisions, rapid development
- Constraints: Time (MVP = fast), resources (minimal)
```

---

### Step 3: Check for Existing Procedures

**Before doing anything, check playbooks/:**

```bash
# List all playbooks
ls playbooks/

# Common playbooks:
- build-support-system.md
- deploy-to-production.md
- manage-releases.md
- run-growth-experiments.md
- [and 4 more]
```

**If a playbook exists:**

1. Read it thoroughly
2. Follow step-by-step
3. Adapt as needed for specific context
4. Document any deviations

**If no playbook exists:**

- Proceed to identify relevant skills

---

### Step 4: Identify Relevant Skills

**Two ways skills activate:**

#### Automatic Activation (Preferred)

Claude automatically activates skills based on context and skill descriptions.

**Example:**

```
User: "I need to prioritize features for my MVP"
→ mvp-builder skill activates automatically
```

#### Explicit Request

You or the user can explicitly request a skill:

**Example:**

```
"Use the rag-implementer skill to design a knowledge base system"
```

**Finding skills:**

```bash
# Method 1: Search skill registry
cat meta/skill-registry.json | grep -i "keyword"

# Method 2: List all skills
ls skills/

# Method 3: Check specific skill
cat skills/skill-name/README.md
```

**Available skills (12 total):**

1. **mvp-builder** - MVP development and feature prioritization
2. **rag-implementer** - RAG system implementation
3. **multi-agent-architect** - Multi-agent system design
4. **product-strategist** - Product-market fit validation
5. **api-designer** - API design (REST/GraphQL)
6. **frontend-builder** - Modern frontend development
7. **knowledge-graph-builder** - Knowledge graph design
8. **deployment-advisor** - Deployment strategy
9. **performance-optimizer** - Performance optimization
10. **user-researcher** - User research methodology
11. **ux-designer** - UX/UI design
12. **go-to-market-planner** - Launch strategy

---

### Step 5: Consult Architecture Patterns

**When designing systems, check standards/architecture-patterns/:**

```bash
# Available patterns:
- rag-pattern.md              # RAG implementation
- multi-agent-pattern.md      # Multi-agent orchestration
- knowledge-graph-pattern.md  # Knowledge graphs
- mcp-integration-pattern.md  # MCP server integration
- agentic-workflow-pattern.md # Workflow design
- [and 5 more]
```

**Pattern structure:**

- **Problem:** What challenge this solves
- **Solution:** How to implement
- **When to use:** Decision criteria
- **Trade-offs:** Advantages and disadvantages
- **Implementation:** Code examples and guidance
- **Related patterns:** Connections to other approaches

**Example usage:**

```
User: "Should I use RAG or fine-tuning?"

Process:
1. Read: standards/architecture-patterns/rag-pattern.md
2. Read: meta/DECISION-FRAMEWORK.md (RAG vs Fine-Tuning section)
3. Analyze: User's requirements (data volume, update frequency, cost)
4. Recommend: Based on decision criteria
5. Explain: Trade-offs and reasoning
```

---

### Step 6: Apply Best Practices

**For quality and security, consult standards/best-practices/:**

```bash
# Available best practices:
- security-governance.md      # Security strategy
- threat-intelligence.md      # Threat monitoring
- incident-response.md        # Incident handling
- security-testing.md         # Security validation
- supply-chain-security.md    # Vendor security
```

**When to use:**

- **Always:** Check security best practices for any production system
- **Always:** Review testing strategies before implementing tests
- **When relevant:** Consult specific best practices for domain needs

**Example:**

```
Task: Build authentication system

Checklist:
1. Read: standards/best-practices/security-governance.md
2. Review: Security testing requirements
3. Check: Incident response procedures
4. Implement: Following security standards
5. Validate: Against security checklist
```

---

### Step 7: Reference Examples

**For concrete implementations, check examples/:**

```bash
# Examples structure:
examples/
├── complete-projects/    # Full project examples
└── mini-examples/        # Focused code samples
```

**Use examples to:**

- See patterns in practice
- Understand implementation details
- Copy starter code (adapt, don't just copy)
- Learn from real-world scenarios

---

## Search Strategies

### Finding Skills

**Method 1: Registry Search (Recommended)**

```javascript
// In meta/skill-registry.json
{
  "skills": [
    {
      "name": "mvp-builder",
      "description": "Rapid MVP development...",
      "triggers": ["mvp", "minimum viable product", "prioritization"],
      "tags": ["product", "mvp"],
      "category": "product-development"
    }
  ]
}
```

**Search by:**

- **triggers:** Keywords that activate skill
- **tags:** Categorical labels
- **category:** Functional grouping
- **description:** Full-text search

**Method 2: Directory Listing**

```bash
ls skills/
# Lists all available skills

cat skills/skill-name/README.md
# Quick overview of specific skill
```

**Method 3: Related Skills**

Every skill's SKILL.md includes "Related Skills" section:

```markdown
## Related Resources

**Related Skills:**

- `api-designer` - For backend API design
- `frontend-builder` - For UI implementation
```

---

### Finding Patterns

**Method 1: By Problem Domain**

```
Need: Multi-agent coordination
→ standards/architecture-patterns/multi-agent-pattern.md

Need: Knowledge representation
→ standards/architecture-patterns/knowledge-graph-pattern.md

Need: External tool integration
→ standards/architecture-patterns/mcp-integration-pattern.md
```

**Method 2: By Technology**

```
Technology: RAG systems
→ standards/architecture-patterns/rag-pattern.md

Technology: Agentic workflows
→ standards/architecture-patterns/agentic-workflow-pattern.md
```

**Method 3: Via Decision Framework**

```
Question: "Which architecture should I use?"
→ meta/DECISION-FRAMEWORK.md
→ Points to relevant patterns
```

---

### Finding Playbooks

**Method 1: By Task Type**

```
Task: Deployment
→ playbooks/deploy-to-production.md

Task: Release management
→ playbooks/manage-releases.md

Task: Customer support setup
→ playbooks/build-support-system.md
```

**Method 2: Directory Listing**

```bash
ls playbooks/
# Shows all operational procedures
```

---

## Common Scenarios & Workflows

### Scenario 1: "Build me an MVP"

**Workflow:**

```
1. Load context from META files
2. Activate mvp-builder skill (automatic or explicit)
3. Follow skill guidance:
   - P0/P1/P2 feature prioritization
   - Choose MVP pattern (Concierge, Wizard of Oz, etc.)
   - Select tech stack (from decision framework)
4. Reference architecture patterns as needed
5. Apply security best practices
6. Build following standards
```

**Files involved:**

- `skills/mvp-builder/SKILL.md`
- `meta/DECISION-FRAMEWORK.md` (tech stack selection)
- `standards/best-practices/security-governance.md`
- `skills/api-designer/` or `skills/frontend-builder/` (as needed)

---

### Scenario 2: "Implement a RAG system"

**Workflow:**

```
1. Load context
2. Use rag-implementer skill
3. Consult standards/architecture-patterns/rag-pattern.md
4. Make decisions:
   - Embedding model (decision framework)
   - Vector database (decision framework)
   - Chunking strategy (RAG pattern)
5. Check examples/ for reference implementations
6. Apply security and testing best practices
7. Build following guidance
```

**Files involved:**

- `skills/rag-implementer/SKILL.md`
- `standards/architecture-patterns/rag-pattern.md`
- `meta/DECISION-FRAMEWORK.md` (Vector DB selection)
- `standards/best-practices/security-testing.md`

---

### Scenario 3: "Design a multi-agent system"

**Workflow:**

```
1. Load context
2. Use multi-agent-architect skill
3. Consult multi-agent pattern for coordination approaches
4. Decide: Single vs multi-agent (decision framework)
5. Design communication patterns (pattern guidance)
6. Implement following best practices
7. Add appropriate testing
```

**Files involved:**

- `skills/multi-agent-architect/SKILL.md`
- `standards/architecture-patterns/multi-agent-pattern.md`
- `standards/architecture-patterns/agentic-workflow-pattern.md`
- `meta/DECISION-FRAMEWORK.md` (Framework selection)

---

### Scenario 4: "Choose between REST and GraphQL"

**Workflow:**

```
1. Read meta/DECISION-FRAMEWORK.md (API design section)
2. Consult skills/api-designer/SKILL.md
3. Apply decision criteria:
   - Data requirements
   - Client control needs
   - Caching requirements
   - Team familiarity
4. Recommend with clear reasoning
5. Implement following api-designer guidance
```

**Files involved:**

- `meta/DECISION-FRAMEWORK.md`
- `skills/api-designer/SKILL.md`

---

### Scenario 5: "Deploy to production"

**Workflow:**

```
1. Check playbooks/deploy-to-production.md
2. Follow step-by-step procedure
3. If choosing platform, use skills/deployment-advisor/
4. Apply security best practices
5. Validate against deployment checklist
```

**Files involved:**

- `playbooks/deploy-to-production.md`
- `skills/deployment-advisor/SKILL.md`
- `standards/best-practices/security-governance.md`

---

### Scenario 6: "Review existing codebase"

**Workflow:**

```
1. Load context
2. Check project against standards/best-practices/
3. Review architecture against relevant patterns
4. Identify gaps or improvements
5. Suggest refactoring using architecture patterns
6. Prioritize improvements (mvp-builder P0/P1/P2 logic)
```

**Files involved:**

- `standards/best-practices/` (all)
- `standards/architecture-patterns/` (relevant ones)
- `skills/mvp-builder/` (prioritization logic)

---

## File Naming Conventions

**Understanding paths:**

```
skills/skill-name/              # Kebab-case for directories
├── SKILL.md                    # UPPERCASE for primary files
├── REFERENCE.md                # UPPERCASE for primary files
├── EXAMPLES.md                 # UPPERCASE for primary files
└── README.md                   # Standard README

standards/architecture-patterns/
├── pattern-name.md             # Kebab-case for files

playbooks/
├── playbook-name.md            # Kebab-case for files

meta/
├── FILE-NAME.md                # UPPERCASE with dashes
└── file-registry.json          # Lowercase for JSON
```

---

## Registry Files

### skill-registry.json

**Purpose:** Searchable index of all skills

**Structure:**

```json
{
  "version": "1.0.0",
  "last_updated": "2025-10-21",
  "skills": [
    {
      "name": "skill-name",
      "description": "What it does and when to use",
      "triggers": ["keyword1", "keyword2"],
      "tags": ["category", "type"],
      "category": "group-name",
      "difficulty": "beginner|intermediate|advanced",
      "path": "/skills/skill-name/"
    }
  ]
}
```

**Usage:**

```bash
# Search for skills related to "api"
grep -i "api" meta/skill-registry.json

# Find skills in category "product-development"
jq '.skills[] | select(.category=="product-development")' meta/skill-registry.json
```

---

### tool-registry.json

**Purpose:** Catalog of reusable tools (future use)

Currently empty, will be populated as tools are added to tools/ directory.

---

## Best Practices for AI Assistants

### DO:

✅ **Always load context first**

- Read PROJECT-CONTEXT.md every session
- Understand what's available before proceeding

✅ **Search before creating**

- Check for existing skills, patterns, playbooks
- Reuse rather than reinvent

✅ **Follow standards religiously**

- Code conventions in standards/coding-conventions/
- Best practices in standards/best-practices/
- No exceptions without documented reasoning

✅ **Provide clear explanations**

- Reference specific files: "Based on skills/mvp-builder/SKILL.md..."
- Include file paths: "See standards/architecture-patterns/rag-pattern.md:45"
- Explain trade-offs when making decisions

✅ **Reference sources**

- Cite where guidance comes from
- Link related resources
- Show connections between concepts

✅ **Suggest improvements**

- Identify gaps in coverage
- Recommend new skills or patterns
- Note unclear or outdated content

### DON'T:

❌ **Don't invent patterns**

- If a pattern exists, use it
- Don't create "custom" approaches without checking first

❌ **Don't skip prerequisites**

- Skills list prerequisites for a reason
- Load required context before proceeding

❌ **Don't violate standards**

- Standards exist for consistency
- Document if deviation is necessary

❌ **Don't duplicate content**

- One canonical source per concept
- Reference existing material

❌ **Don't ignore security**

- Always check security best practices
- Never compromise on security guidelines

❌ **Don't rush quality checks**

- Validate against success criteria
- Test before claiming complete

---

## Communication Patterns

### When Referencing Skills

**Good:**

```
"I'm using the mvp-builder skill (skills/mvp-builder/SKILL.md) to help
prioritize features. The skill provides a P0/P1/P2 matrix where:
- P0: Must have for core value prop
- P1: Important but can wait
- P2: Nice to have

Let's categorize your features..."
```

**Why it's good:**

- Names the skill
- Provides file path
- Explains what it offers
- Proceeds with application

### When Referencing Patterns

**Good:**

```
"Based on the RAG architecture pattern (standards/architecture-patterns/
rag-pattern.md), RAG is appropriate here because:
1. You have a large knowledge base (1000+ documents)
2. Information updates frequently
3. You need to cite sources

The pattern recommends an 8-phase implementation starting with knowledge
base design..."
```

**Why it's good:**

- References specific pattern
- Explains why it applies
- Cites decision criteria
- Previews next steps

### When Making Decisions

**Good:**

```
"For vector database selection, meta/DECISION-FRAMEWORK.md recommends:

Your requirements:
- Production system (not prototype)
- 100K documents
- Need hybrid search
- Budget conscious

Decision: Weaviate Cloud
Reasoning:
- Managed service (meets production need)
- Hybrid search built-in
- Better pricing than Pinecone
- Can self-host later if needed

See meta/DECISION-FRAMEWORK.md:669-675 for the decision matrix."
```

**Why it's good:**

- Cites decision framework
- Lists requirements
- Clear recommendation
- Explains reasoning
- Provides fallback option
- References specific lines

---

## Troubleshooting

### Skills Not Activating

**Issue:** Skill doesn't activate when expected

**Solutions:**

1. Check skill description in SKILL.md YAML frontmatter
2. Verify triggers match your request
3. Explicitly request: "Use the [skill-name] skill to..."
4. Restart conversation if needed

### Can't Find Right Pattern

**Issue:** Unsure which pattern applies

**Solutions:**

1. Start with meta/DECISION-FRAMEWORK.md
2. List requirements and constraints
3. Review related patterns
4. Ask user for clarification if still unclear

### Standards Conflict

**Issue:** Standard seems wrong for use case

**Solutions:**

1. Document why standard doesn't apply
2. Explain context and constraints
3. Get user approval for deviation
4. Note deviation clearly in code/docs

### Multiple Solutions Available

**Issue:** Several skills or patterns could work

**Solutions:**

1. Check decision framework for criteria
2. List options with trade-offs
3. Recommend based on requirements
4. Let user choose if trade-offs are significant

---

## Quick Reference Card

**Before every task:**

```
[ ] Loaded meta/PROJECT-CONTEXT.md
[ ] Loaded meta/HOW-TO-USE.md (this file)
[ ] Reviewed meta/DECISION-FRAMEWORK.md (if needed)
[ ] Searched meta/skill-registry.json
```

**Task execution order:**

```
1. Check playbooks/ for exact procedure
2. Activate relevant skills/
3. Consult standards/architecture-patterns/
4. Apply standards/best-practices/
5. Reference examples/ for implementation
6. Document decisions and sources
```

**When in doubt:**

```
- Skills: For methodology and expertise
- Patterns: For architecture and design
- Best Practices: For quality and security
- Playbooks: For step-by-step procedures
- Decision Framework: For choosing between options
```

---

## Success Indicators

You're using this repository correctly when:

✅ Skills activate automatically for relevant tasks
✅ References include file paths and line numbers
✅ Decisions cite decision framework
✅ Code follows standards consistently
✅ Patterns are applied appropriately
✅ Security best practices are never skipped
✅ Trade-offs are explained clearly
✅ Sources are always cited

---

## Next Steps

Now that you understand navigation:

1. Review **meta/DECISION-FRAMEWORK.md** for technology choices
2. Browse **skills/** to see available capabilities
3. Scan **standards/architecture-patterns/** for design guidance
4. Check **playbooks/** for operational procedures
5. Start using the repository in real tasks!

**Remember:** This is a tool for excellence. Use it to build better, faster, and more consistently.
