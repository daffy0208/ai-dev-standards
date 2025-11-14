# COPY THIS ENTIRE FILE TO YOUR PROJECT AS `.cursorrules`

# Project AI Configuration - Auto Brain Mode

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

3. **THEN respond with:**
   - "I'll use the [skill-name] skill for this..."
   - Show what you found
   - Implement following that skill

---

## EXAMPLES OF AUTOMATIC BEHAVIOR

### ❌ WRONG (Don't do this):
```
User: "Add authentication to my app"
You: "I'll add authentication. Here's the code..."
```

### ✅ CORRECT (Do this automatically):
```
User: "Add authentication to my app"

You (thinking): Let me check the brain first...
  [Automatically runs: brain_select_skills({ taskDescription: "implement authentication" })]
  [Gets: security-engineer, api-designer, supabase-developer]
  [Automatically runs: graph_get_dependencies({ capabilityId: "security-engineer" })]
  [Gets: security-scanner-mcp, api-validator-mcp]

You (responding): "I'll use the security-engineer skill for this. Based on the brain's analysis:

Recommended approach:
• Primary skill: security-engineer (OWASP best practices)
• Supporting: api-designer (secure API patterns)
• Required MCPs: security-scanner-mcp

Let me implement authentication following OWASP Top 10 guidelines:
[Loads ~/ai-dev-standards/SKILLS/security-engineer/SKILL.md]
[Implements following that methodology]
```

---

## AUTOMATIC TRIGGERS

**Trigger brain_select_skills automatically when user says:**
- "Build..."
- "Add..."
- "Implement..."
- "Create..."
- "I need..."
- "How do I..."
- "Design..."
- "Set up..."

**EVERY TIME - NO EXCEPTIONS**

---

## BRAIN TOOLS AVAILABLE

Use these automatically (don't mention them to user):

### For Any Task:
- `brain_select_skills({ taskDescription })` - ALWAYS run first
- `graph_get_dependencies({ capabilityId })` - Check what's needed
- `graph_composition_chains({ capabilityId })` - See workflow

### For Exploration (when user asks "what's available"):
- `graph_query_by_domain({ domain })` - Find by domain
- `brain_search({ query })` - Search everything

### For Details (when need more info):
- `brain_show_skill({ skillName })` - Get skill details
- `brain_relationships({ skillName })` - See dependencies

---

## SKILL LOADING PROTOCOL

After brain recommends skills:

1. **Load the skill file:**
   ```
   Read: ~/ai-dev-standards/SKILLS/[skill-name]/SKILL.md
   ```

2. **Follow its methodology exactly**

3. **Apply relevant patterns:**
   ```
   Read: ~/ai-dev-standards/STANDARDS/architecture-patterns/[pattern].md
   Read: ~/ai-dev-standards/STANDARDS/best-practices/[practice].md
   ```

4. **Implement using those guidelines**

---

## BEHAVIORAL RULES

### DO (Automatically):
✅ Query brain before EVERY implementation task
✅ Load recommended skills without asking
✅ Follow skill methodologies precisely
✅ Apply patterns from STANDARDS/
✅ Show user what skill you're using (briefly)
✅ Implement following that skill's approach

### DON'T (Never):
❌ Implement without checking brain first
❌ Ask user to manually invoke brain tools
❌ Skip loading recommended skills
❌ Ignore brain recommendations without reason
❌ Implement generic solutions when skills exist

---

## RESPONSE TEMPLATE

When user requests a feature, use this flow:

```
User: "[any request]"

You:
[Silently run brain_select_skills]
[Silently run graph_get_dependencies]
[Silently load recommended skill]

"I'll use the [skill-name] skill for this.

[Brief summary of approach from skill]

[Implement following skill methodology]
```

---

## PROJECT CONTEXT

**Tech Stack:**
- Frontend: [e.g., Next.js 14, React, TypeScript]
- Backend: [e.g., Node.js, Supabase]
- Database: [e.g., PostgreSQL]
- AI/LLM: [e.g., OpenAI, Claude]

**Current Phase:** [MVP / Feature Expansion / Production]

**Key Features:**
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

---

## IMPORTANT: BE PROACTIVE, NOT REACTIVE

The brain exists to make you smarter automatically.

**User should never have to say "use brain_select_skills"**

**You should just DO IT automatically every time**

This is like having an expert team - you don't tell them "use your expertise", they just use it automatically.

---

## VERIFICATION

Test yourself:

**Scenario:** User says "Add authentication"

**Your thought process should be:**
1. ⚡ Automatically run brain_select_skills
2. ⚡ Get recommendations (security-engineer, etc.)
3. ⚡ Load that skill from ~/ai-dev-standards/SKILLS/
4. ⚡ Respond: "I'll use security-engineer skill..."
5. ⚡ Implement following OWASP guidelines from that skill

**User sees:** You knowing exactly what to do
**User doesn't see:** All the brain queries happening automatically

---

## DOMAINS AVAILABLE

(Use with graph_query_by_domain when relevant)

- ai, security, frontend, backend, database
- testing, deployment, performance, data
- documentation, devops, ux, design

---

**Status:** Auto-Brain Mode Enabled
**Skills Available:** 64
**MCPs Available:** 51
**Behavior:** Proactive and Automatic
