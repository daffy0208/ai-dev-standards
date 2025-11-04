# Using ai-dev-standards as a Claude Code Knowledge Source

## Overview

This guide explains how to use the **ai-dev-standards** repository as an effective knowledge source for Claude Code, enabling it to understand your project structure, fix problems automatically, and create new elements following established patterns.

## What This Enables

When properly configured, Claude Code can:

✅ **Understand Your Repository**
- Navigate the complete structure intuitively
- Know where each type of resource lives
- Reference appropriate standards and patterns
- Follow established conventions automatically

✅ **Fix Problems Intelligently**
- Detect registry inconsistencies
- Resolve documentation conflicts
- Fix security vulnerabilities
- Correct formatting and style issues
- Update outdated references

✅ **Create New Elements**
- Add new skills following the proper format
- Build new MCP servers with correct structure
- Create components in the right categories
- Update registries automatically
- Maintain consistency across resources

✅ **Maintain Quality**
- Validate before committing
- Keep documentation synchronized
- Ensure registry consistency
- Follow security best practices
- Maintain performance standards

## Initial Setup

### Step 1: Add Custom Instructions

Create a `claude_custom_instructions.md` file in your repository root (this has been done for you in this repository).

**For other projects using ai-dev-standards:**

```bash
# Copy the custom instructions template
cp /path/to/ai-dev-standards/claude_custom_instructions.md ./
```

Or reference it directly:
```markdown
<!-- In your project's README or .cursorrules -->
See ai-dev-standards/claude_custom_instructions.md for complete guidance.
```

### Step 2: Configure Claude Code

Add a `.clauderc` file (also created for you) that points Claude to key resources:

```json
{
  "knowledge_sources": {
    "primary": "claude_custom_instructions.md",
    "meta": ["META/PROJECT-CONTEXT.md", "META/HOW-TO-USE.md"],
    "registries": ["META/skill-registry.json", "META/mcp-registry.json"]
  }
}
```

### Step 3: Enable Brain MCP

The brain-mcp provides intelligent recommendations and orchestration:

```bash
# Build the brain MCP
cd MCP-SERVERS/brain-mcp
npm install
npm run build

# Configure in .claude/mcp-settings.json
```

The brain-mcp is already configured in `.claude/mcp-settings.json` for this repository.

### Step 4: Verify Setup

Test that Claude Code can access the knowledge:

**Ask Claude:**
> "What skills are available in this repository?"

**Expected Response:**
Claude should list skills from `META/skill-registry.json` and explain their purposes.

**Ask Claude:**
> "Show me the repository structure"

**Expected Response:**
Claude should describe the directory layout and explain each section's purpose.

## How to Use This Knowledge Source

### Pattern 1: Problem Discovery and Fixing

**User:** "Check if there are any issues in the repository"

**Claude's Process:**
1. Read `claude_custom_instructions.md` for context
2. Run `npm run validate` to detect issues
3. Analyze output for specific problems
4. Run `npm run validate:fix` to auto-fix registry issues
5. Run `npm run lint:fix` for code quality
6. Report findings and actions taken

**What Gets Fixed:**
- Registry inconsistencies (files vs registries)
- Linting errors and formatting issues
- TypeScript type errors
- Documentation inconsistencies
- Missing registry entries

### Pattern 2: Creating New Resources

**User:** "Create a new skill for database optimization"

**Claude's Process:**
1. Check `META/skill-registry.json` for similar skills
2. Review existing skill format in `SKILLS/*/SKILL.md`
3. Create `SKILLS/database-optimizer/SKILL.md` with proper YAML frontmatter
4. Create comprehensive `SKILLS/database-optimizer/README.md`
5. Run `npm run sync:skills` to update registry
6. Verify entry in `META/skill-registry.json`
7. Update relationships if needed

**What Gets Created:**
```
SKILLS/database-optimizer/
├── SKILL.md              # YAML frontmatter + instructions
└── README.md             # Comprehensive documentation
```

### Pattern 3: Understanding Relationships

**User:** "What does the rag-implementer skill depend on?"

**Claude's Process:**
1. Use brain-mcp: `brain_relationships({ skillName: "rag-implementer" })`
2. Or read `META/relationship-mapping.json`
3. Show dependencies (skills, MCPs, tools)
4. Explain how they work together
5. Provide usage examples

**Output:**
- Direct dependencies (e.g., vector-database-mcp, semantic-search-mcp)
- Related skills (e.g., knowledge-graph-builder, frontend-builder)
- Required tools (e.g., embedding-generator)
- Complete implementation path

### Pattern 4: Guided Development

**User:** "Help me implement authentication in my app"

**Claude's Process:**
1. Use brain-mcp: `brain_select_skills({ taskDescription: "implement authentication" })`
2. Recommend skills: security-engineer, api-designer, frontend-builder
3. Show skill relationships and dependencies
4. Guide through implementation using skill instructions
5. Reference relevant components and integrations
6. Validate security best practices

**Result:**
- Clear implementation plan
- Step-by-step guidance from skills
- Relevant code examples from components
- Security best practices enforced
- Testing recommendations

### Pattern 5: Documentation Maintenance

**User:** "Update the documentation to reflect new resource counts"

**Claude's Process:**
1. Count actual resources in each directory
2. Check current counts in documentation
3. Identify discrepancies
4. Update README.md, DOCS/*, and other references
5. Run `npm run validate:docs` to check consistency
6. Verify all counts match reality

**Files Updated:**
- README.md (main resource counts)
- DOCS/GETTING-STARTED.md
- DOCS/QUICK-START.md
- Individual skill READMEs if affected
- CHANGELOG.md for version tracking

## Common Workflows

### Workflow 1: Adding a New Skill

```
User: "Create a new skill for GraphQL API design"

Claude:
1. Checks existing skills to avoid duplication
2. Creates SKILLS/graphql-api-designer/
3. Writes SKILL.md with YAML frontmatter:
   ---
   name: graphql-api-designer
   description: Design and implement GraphQL APIs with best practices
   triggers:
     - graphql
     - api design
     - schema design
   prerequisites:
     - api-designer (optional, for API fundamentals)
   ---
4. Writes detailed README.md with:
   - Purpose and use cases
   - Step-by-step instructions
   - Examples and anti-patterns
   - Troubleshooting guide
5. Runs: npm run sync:skills
6. Verifies: Entry appears in META/skill-registry.json
7. Reports: "Created graphql-api-designer skill. Ready to use."
```

### Workflow 2: Fixing Registry Issues

```
User: "Fix any registry inconsistencies"

Claude:
1. Runs: npm run validate
2. Analyzes output:
   - Missing entries: component-xyz not in registry
   - Orphaned entries: skill-abc in registry but file missing
   - Count mismatches: 65 skills found, registry has 64
3. Runs: npm run validate:fix
4. Verifies: npm run validate (should pass)
5. Reports:
   - Fixed: Added component-xyz to registry
   - Removed: skill-abc (file no longer exists)
   - Updated: Skill count in registry
```

### Workflow 3: Implementing a Feature

```
User: "Implement RAG-based search for our documentation"

Claude:
1. Uses brain-mcp: brain_select_skills({ taskDescription: "RAG documentation search" })
2. Recommends: rag-implementer, knowledge-base-manager, frontend-builder
3. Shows dependencies: vector-database-mcp, embedding-generator, semantic-search-mcp
4. Guides implementation:
   a. Set up vector database (using vector-database-mcp)
   b. Generate embeddings (using embedding-generator)
   c. Implement search API (following api-designer)
   d. Build search UI (using frontend-builder)
5. References:
   - STANDARDS/architecture-patterns/rag-pattern.md
   - COMPONENTS/advanced/SearchBar.tsx
   - INTEGRATIONS/pinecone-integration/
6. Validates:
   - Security (input sanitization)
   - Performance (caching, pagination)
   - Testing (unit + integration)
```

### Workflow 4: Repository Health Check

```
User: "Check the health of this repository"

Claude:
1. Runs validation suite:
   - npm run validate (registry consistency)
   - npm run lint (code quality)
   - npm run typecheck (TypeScript)
   - npm test (functionality)
2. Checks documentation:
   - Resource counts accurate
   - Links not broken
   - Examples up-to-date
3. Analyzes structure:
   - All skills have READMEs
   - All MCPs have manifests
   - All components categorized
4. Reports findings:
   ✓ Registries: 100% consistent
   ✓ Tests: All passing
   ⚠ Documentation: 3 files with outdated counts
   ✓ Structure: Well-organized
   
   Action Items:
   1. Update resource counts in README.md
   2. Fix broken link in DOCS/INTEGRATION-GUIDE.md
   3. Add README to SKILLS/new-skill/
5. Offers to fix: "Would you like me to fix these issues?"
```

### Workflow 5: Creating an MCP Server

```
User: "Create an MCP server for code complexity analysis"

Claude:
1. Checks existing MCPs for similar functionality
2. Creates directory: MCP-SERVERS/code-complexity-mcp/
3. Creates files:
   - package.json (with MCP SDK dependency)
   - tsconfig.json (TypeScript config)
   - src/index.ts (MCP implementation)
   - README.md (documentation)
   - manifest.yaml (capability graph)
4. Implements MCP protocol:
   - tools/list handler
   - tools/call handler (analyze_complexity, get_metrics)
   - Error handling
   - Type safety
5. Builds: npm install && npm run build
6. Updates registry: npm run sync:mcps
7. Adds to .claude/mcp-settings.json
8. Documents usage in README.md
9. Reports: "Created code-complexity-mcp. Ready to use."
```

## Advanced Usage

### Using Brain MCP Effectively

**Discovery:**
```javascript
// Find skills by keyword
brain_search({ query: "authentication" })

// Get recommendations for a task
brain_select_skills({ taskDescription: "build REST API with auth" })

// Show skill details
brain_show_skill({ skillName: "security-engineer" })
```

**Relationship Mapping:**
```javascript
// Show what a skill depends on
brain_relationships({ skillName: "rag-implementer" })

// Query by domain
graph_query_by_domain({ domain: "ai" })

// Find path between skills
graph_find_path({ from: "rag-implementer", to: "frontend-builder" })
```

**Validation:**
```javascript
// Check graph consistency
graph_validate({})

// Get graph statistics
graph_stats({})

// Find composition chains
graph_composition_chains({ capabilityId: "security-engineer" })
```

### Orchestration System

For complex, multi-step tasks, use the orchestration system:

```bash
# Create orchestration request
./scripts/orchestration/create-request.sh plan "Build authentication system with OAuth"

# Claude Code executes
# (automatically reads request, creates plan, writes results)

# Review results
cat orchestration-results/[request-id].json
```

**Request Types:**
- `plan` - Create detailed execution plan
- `validate` - Validate implementation against spec
- `diagnose` - Run comprehensive diagnostics
- `generate_manifest` - Create capability manifest
- `build_capability_graph` - Rebuild entire graph
- `analyze_project` - Deep project analysis

## Best Practices for Claude Code Users

### 1. Always Start with Context

Before asking Claude to do anything:
- Ensure `claude_custom_instructions.md` is present
- Reference key META files
- Use brain-mcp for intelligent recommendations

**Good:** "Check the skill registry and help me implement authentication"
**Better:** "Use brain-mcp to find skills for authentication, then guide implementation"

### 2. Leverage the Registry System

The registries are the source of truth:
- `META/skill-registry.json` - All skills
- `META/mcp-registry.json` - All MCPs
- `META/component-registry.json` - All components

**Good:** "What skills exist for frontend development?"
**Better:** "Query the skill registry for frontend skills and show their relationships"

### 3. Validate Frequently

After any changes:
```bash
npm run validate        # Check registries
npm run lint           # Check code quality
npm run typecheck      # Check TypeScript
npm test               # Run tests
```

Claude can do this automatically if asked.

### 4. Use Orchestration for Complex Tasks

For multi-step, multi-skill tasks:
- Create orchestration request
- Let Claude plan execution
- Review and iterate

**Good:** "Help me build a RAG system"
**Better:** "Create orchestration plan for RAG system implementation"

### 5. Follow Existing Patterns

The repository has established patterns:
- Skill format (YAML + Markdown)
- MCP structure (TypeScript + manifest)
- Component organization (category-based)

Claude knows these patterns from the custom instructions.

## Troubleshooting

### Issue: Claude Doesn't Know About the Repository

**Symptoms:**
- Generic responses
- No reference to skills/MCPs
- Doesn't follow conventions

**Solution:**
1. Verify `claude_custom_instructions.md` exists
2. Verify `.clauderc` points to it
3. Ask Claude: "Read the custom instructions file"
4. Provide context: "This is the ai-dev-standards repository"

### Issue: Registry Out of Sync

**Symptoms:**
- Resource counts don't match
- Validation fails
- CLI can't find resources

**Solution:**
Ask Claude: "Fix registry inconsistencies"

Claude will:
1. Run `npm run validate:fix`
2. Verify with `npm run validate`
3. Report changes made

### Issue: Brain MCP Not Working

**Symptoms:**
- Brain commands fail
- No intelligent recommendations
- Connection errors

**Solution:**
Ask Claude: "Rebuild and reconfigure brain-mcp"

Claude will:
1. `cd MCP-SERVERS/brain-mcp`
2. `npm install && npm run build`
3. Update `.claude/mcp-settings.json`
4. Verify connection

### Issue: Skills Not Being Used

**Symptoms:**
- Claude doesn't reference skills
- No automatic skill activation

**Solution:**
1. Verify skills are in `META/skill-registry.json`
2. Check `.claude/claude.md` is updated
3. Ask Claude: "What skills are available for [topic]?"
4. Explicitly request: "Use the [skill-name] skill to..."

## Examples

### Example 1: Complete Feature Implementation

**User:** "Implement user authentication with JWT tokens"

**Claude:**
```
Let me use the brain-mcp to find relevant skills...

[brain_select_skills({ taskDescription: "user authentication with JWT" })]

Recommended skills:
1. security-engineer - Security best practices
2. api-designer - API endpoint design
3. frontend-builder - Login UI components

Let me also check dependencies:
[brain_relationships({ skillName: "security-engineer" })]

Required:
- jwt-handler-mcp (for token management)
- password-hasher-tool (for secure hashing)

Implementation Plan:
1. Backend (using api-designer + security-engineer):
   - POST /auth/login endpoint
   - POST /auth/register endpoint
   - Token generation with jwt-handler-mcp
   - Password hashing with bcrypt
   - Secure storage best practices

2. Frontend (using frontend-builder):
   - Login form component
   - Registration form component
   - Token storage in httpOnly cookies
   - Protected route wrapper

3. Security (using security-engineer):
   - Input validation
   - Rate limiting
   - CORS configuration
   - XSS protection

Let's start implementing...
[Proceeds with step-by-step implementation]
```

### Example 2: Repository Maintenance

**User:** "Update all documentation with correct resource counts"

**Claude:**
```
Let me scan the repository for current counts...

Current Counts:
- Skills: 64 (from SKILLS/ directory)
- MCPs: 50 (from MCP-SERVERS/ directory)
- Tools: 24 (from META/tool-registry.json)
- Components: 72 (from META/component-registry.json)
- Integrations: 28 (from META/integration-registry.json)
Total: 238 resources

Checking documentation for discrepancies...

Files to Update:
1. README.md - Claims 330, should be 238
2. DOCS/GETTING-STARTED.md - Claims 195, should be 238
3. DOCS/QUICK-START.md - Outdated counts

Updating files...
[Makes precise changes to each file]

Running validation...
npm run validate:docs

✓ All documentation now consistent
✓ Resource counts accurate
✓ No broken references

Changes made:
- Updated 3 files
- Corrected 8 resource count references
- Fixed 2 registry links
```

### Example 3: Creating New Resource

**User:** "Create a skill for mobile app development with React Native"

**Claude:**
```
Checking for existing skills...
[brain_search({ query: "mobile react native" })]

No exact match found. Creating new skill...

Step 1: Create directory
SKILLS/mobile-app-builder/

Step 2: Create SKILL.md
---
name: mobile-app-builder
description: Build cross-platform mobile apps with React Native
triggers:
  - mobile app
  - react native
  - ios android
  - cross-platform
prerequisites:
  - frontend-builder (for React fundamentals)
---

[Detailed mobile app development instructions...]

Step 3: Create README.md
[Comprehensive documentation with examples...]

Step 4: Update registry
npm run sync:skills

Step 5: Verify
✓ Added to META/skill-registry.json
✓ Relationships mapped
✓ Ready to use

New skill created: mobile-app-builder
Location: SKILLS/mobile-app-builder/
Triggers: mobile app, react native, ios android, cross-platform
Related skills: frontend-builder, api-integration-builder
```

## Conclusion

When properly configured with these knowledge sources, Claude Code becomes an intelligent assistant that:

- **Understands** your repository structure deeply
- **Follows** established patterns and conventions automatically
- **Fixes** problems proactively and accurately
- **Creates** new elements with consistency
- **Maintains** quality and documentation standards
- **Guides** development with expert-level knowledge

The key is providing clear context through:
1. `claude_custom_instructions.md` (comprehensive guide)
2. `.clauderc` (configuration and references)
3. META files (registries and mappings)
4. brain-mcp (intelligent orchestration)

With these in place, Claude Code can operate as an expert member of your team who knows the repository as well as any human maintainer.

---

**Next Steps:**
1. Review `claude_custom_instructions.md` for complete guidance
2. Explore `META/PROJECT-CONTEXT.md` for structure understanding
3. Try brain-mcp commands for intelligent recommendations
4. Ask Claude to help with specific tasks using these knowledge sources
