# COPY THIS ENTIRE FILE TO YOUR PROJECT AS `.codex/codex.md`

# Project AI Configuration - Auto Brain Mode (Codex)

## CRITICAL: Brain MCP Auto-Mode

You have access to a Brain MCP server that contains 64 expert skills, 51 MCPs, and 113 capabilities.

**YOU MUST USE THE BRAIN AUTOMATICALLY - DO NOT WAIT FOR USER TO ASK**

---

## AUTOMATIC WORKFLOW (MANDATORY)

### When User Requests ANY Feature/Task:

**BEFORE responding, AUTOMATICALLY do this sequence:**

1. **Query the brain silently:**
   ```
   brain_select_skills({ taskDescription: "[user's request]" })
   ```

2. **Get dependencies:**
   ```
   graph_get_dependencies({ capabilityId: "[recommended-skill]" })
   ```

3. **Load the skill:**
   ```
   Read: /SKILLS/[skill-name]/SKILL.md
   ```

4. **THEN respond with:**
   - "I'll use the [skill-name] skill for this..."
   - Show approach
   - Provide implementation guidance

---

## EXAMPLES OF AUTOMATIC BEHAVIOR

### ❌ WRONG (Don't do this):
```
User: "Add authentication"
You: "Here's authentication code..."
```

### ✅ CORRECT (Do this automatically):
```
User: "Add authentication"

You (thinking): Check brain first...
  [Automatically: brain_select_skills({ taskDescription: "implement authentication" })]
  [Gets: security-engineer, api-designer]
  [Automatically: graph_get_dependencies({ capabilityId: "security-engineer" })]
  [Gets: security-scanner-mcp]
  [Automatically: Read /SKILLS/security-engineer/SKILL.md]

You (responding): "Using security-engineer skill for this.

Recommended approach (from brain):
• security-engineer (OWASP Top 10 compliance)
• api-designer (secure API patterns)
• Required: security-scanner-mcp

Implementation following OWASP guidelines:
[Provides code following skill methodology]
```

---

## AUTOMATIC TRIGGERS

**Trigger brain_select_skills automatically when user says:**
- "Build...", "Add...", "Implement...", "Create..."
- "I need...", "How do I...", "Design...", "Set up..."

**EVERY TIME - NO EXCEPTIONS**

---

## BRAIN TOOLS AVAILABLE

Use these automatically (don't mention them to user):

### For Any Task:
- `brain_select_skills({ taskDescription })` - ALWAYS run first
- `graph_get_dependencies({ capabilityId })` - Check requirements
- `graph_composition_chains({ capabilityId })` - See workflow

### For Exploration:
- `graph_query_by_domain({ domain })` - Find by domain
- `brain_search({ query })` - Search everything

### For Details:
- `brain_show_skill({ skillName })` - Get skill info
- `brain_relationships({ skillName })` - See dependencies

---

## SKILL LOADING PROTOCOL

After brain recommends skills:

1. **Load the skill file:**
   ```
   Read: /SKILLS/[skill-name]/SKILL.md
   ```

2. **Follow its methodology exactly**

3. **Apply relevant patterns:**
   ```
   Read: /STANDARDS/architecture-patterns/[pattern].md
   Read: /STANDARDS/best-practices/[practice].md
   ```

4. **Provide guidance using those guidelines**

---

## BEHAVIORAL RULES

### DO (Automatically):
✅ Query brain before EVERY task
✅ Load recommended skills automatically
✅ Follow skill methodologies precisely
✅ Apply patterns from STANDARDS/
✅ Tell user what skill you're using
✅ Provide guidance following that skill

### DON'T (Never):
❌ Respond without checking brain first
❌ Ask user to invoke brain tools manually
❌ Skip loading recommended skills
❌ Ignore brain recommendations
❌ Give generic advice when skills exist

---

## RESPONSE TEMPLATE

```
User: "[request]"

You:
[Silently: brain_select_skills]
[Silently: graph_get_dependencies]
[Silently: Read skill file]

"Using [skill-name] skill for this.

[Approach from skill]
[Implementation following methodology]
```

---

## PROJECT CONTEXT

**Tech Stack:**
- Frontend: [e.g., Next.js 14, React]
- Backend: [e.g., Node.js, Supabase]
- Database: [e.g., PostgreSQL]

**Current Phase:** [MVP / Feature Expansion / Production]

---

## IMPORTANT: BE PROACTIVE

The brain exists to make you smarter automatically.

**User should never say "use brain_select_skills"**

**You should DO IT automatically every time**

---

## Skills Registry

[Auto-generated list of 64 skills from skill-registry.json]

### 3d-visualizer

Expert in Three.js, 3D graphics, and interactive 3D visualizations

**Location:** `/SKILLS/3d-visualizer/SKILL.md`

### accessibility-engineer

Implement accessibility (a11y) best practices to make applications usable by everyone. Use when building UIs, conducting accessibility audits, or ensuring WCAG compliance. Covers screen readers, keyboard navigation, ARIA attributes, and inclusive design patterns.

**Location:** `/SKILLS/accessibility-engineer/SKILL.md`

### api-designer

Design REST and GraphQL APIs. Use when creating backend APIs, defining API contracts, or integrating third-party services. Covers endpoint design, authentication, versioning, documentation, and best practices.

**Location:** `/SKILLS/api-designer/SKILL.md`

### security-engineer

Implement security best practices across the application stack. Use when securing APIs, implementing authentication, preventing vulnerabilities, or conducting security reviews. Covers OWASP Top 10, auth patterns, input validation, encryption, and security monitoring.

**Location:** `/SKILLS/security-engineer/SKILL.md`

### rag-implementer

Implement retrieval-augmented generation systems. Use when building knowledge-intensive applications, document search, Q&A systems, or need to ground LLM responses in external data. Covers embedding strategy, vector stores, retrieval pipelines, and evaluation.

**Location:** `/SKILLS/rag-implementer/SKILL.md`

[... see .codex/codex.md for full list of all 64 skills ...]

---

**Status:** Auto-Brain Mode Enabled
**Skills Available:** 64
**MCPs Available:** 51
**Behavior:** Proactive and Automatic
