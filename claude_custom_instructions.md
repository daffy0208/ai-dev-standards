# Claude Code Custom Instructions for ai-dev-standards

## Repository Overview

**ai-dev-standards** is a comprehensive knowledge base for AI-assisted software development, providing 238 curated resources including specialized skills, MCP servers, tools, components, and integrations.

### Quick Facts
- **Version:** 3.0.0
- **Total Resources:** 238 (64 skills + 50 MCPs + 24 tools + 72 components + 28 integrations)
- **Purpose:** Enable Claude to deliver higher quality, more consistent development results
- **Philosophy:** Quality over quantity - every resource is curated, tested, and documented

## Core Architecture

This repository uses a layered architecture:

### 1. Knowledge Layer (What exists)
- **SKILLS/** - 64 specialized methodologies Claude follows (YAML frontmatter + Markdown)
- **STANDARDS/** - Architecture patterns and best practices (reference documentation)
- **PLAYBOOKS/** - Step-by-step operational procedures
- **META/** - Central registry system and navigation (JSON registries)

### 2. Execution Layer (What runs)
- **MCP-SERVERS/** - 50 executable development tools
- **brain-mcp** - Intelligent orchestration system
- **CLI/** - Command-line interface for automation
- **scripts/** - Build, validation, and sync utilities

### 3. Implementation Layer (What gets built)
- **COMPONENTS/** - 72 reusable React components
- **TEMPLATES/** - Project starter templates
- **EXAMPLES/** - Reference implementations
- **INTEGRATIONS/** - 28 pre-configured service connections

### 4. Documentation Layer (How to use it)
- **DOCS/** - Comprehensive guides and references
- **.claude/** - Claude Desktop configuration
- **.codex/** - Codex CLI configuration
- **README.md** - Main entry point

## How to Navigate This Repository

### For AI Assistants (You!)

**ALWAYS start by reading these files in order:**

1. **META/PROJECT-CONTEXT.md** - Understand the repository structure
2. **META/HOW-TO-USE.md** - Learn navigation patterns
3. **META/DECISION-FRAMEWORK.md** - Technology decision guidance
4. **META/skill-registry.json** - Searchable catalog of all skills

### Key Files to Reference

**Finding Resources:**
- `META/skill-registry.json` - All 64 skills with descriptions and triggers
- `META/mcp-registry.json` - All 50 MCP servers with capabilities
- `META/component-registry.json` - All 72 reusable components
- `META/tool-registry.json` - All 24 tools and scripts
- `META/integration-registry.json` - All 28 service integrations

**Understanding Relationships:**
- `META/relationship-mapping.json` - Dependencies between resources
- `META/capability-graph.json` - Queryable capability graph

**Decision Making:**
- `META/DECISION-FRAMEWORK.md` - When to use what technology
- `STANDARDS/best-practices/` - Quality, security, performance standards

## Common Tasks and How to Accomplish Them

### Task 1: Adding a New Skill

**Location:** `SKILLS/[skill-name]/`

**Steps:**
1. Create directory: `SKILLS/[skill-name]/`
2. Create `SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: skill-name
   description: Brief description
   triggers:
     - context words that activate this skill
   ---
   ```
3. Add detailed instructions in Markdown
4. Create `README.md` with comprehensive documentation
5. Run: `npm run sync:skills` to update registry
6. Verify: Check `META/skill-registry.json` contains new skill
7. Test: Use skill in a conversation with Claude

**Validation:**
```bash
npm run validate        # Check all registries
npm run test:registry   # Run registry tests
```

### Task 2: Adding a New MCP Server

**Location:** `MCP-SERVERS/[mcp-name]/`

**Steps:**
1. Create directory: `MCP-SERVERS/[mcp-name]/`
2. Create `package.json`, `tsconfig.json`, `src/index.ts`
3. Implement MCP protocol with tools
4. Create `README.md` with tool documentation
5. Create `manifest.yaml` for capability graph
6. Build: `npm install && npm run build`
7. Run: `npm run sync:mcps` to update registry
8. Configure in `.claude/mcp-settings.json`

**Example Structure:**
```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "mcp-name",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "tool_name",
      description: "What this tool does",
      inputSchema: {
        type: "object",
        properties: {
          // parameters
        }
      }
    }
  ]
}));

server.setRequestHandler("tools/call", async (request) => {
  // Implementation
});
```

### Task 3: Fixing Registry Inconsistencies

**Problem:** Registry counts don't match actual files

**Solution:**
```bash
# Sync all registries
npm run validate:fix

# Or sync individually
npm run sync:skills
npm run sync:mcps
npm run sync:components
npm run sync:tools

# Verify
npm run validate
```

**Check Results:**
- `META/skill-registry.json` - Should have 64 entries
- `META/mcp-registry.json` - Should have 50 entries
- `META/component-registry.json` - Should have 72 entries

### Task 4: Updating Documentation

**Key Documentation Files:**
- `README.md` - Main repository overview
- `DOCS/GETTING-STARTED.md` - Setup guide
- `DOCS/INTEGRATION-GUIDE.md` - Integration instructions
- `DOCS/QUICK-START.md` - 5-minute quickstart

**Pattern to Follow:**
1. Update the primary source file
2. Run `npm run validate:docs` to check consistency
3. Update related files if needed
4. Verify all counts and references are accurate

**Common Updates:**
- Resource counts (should total 238)
- Version numbers (currently 3.0.0)
- File paths (use absolute paths in examples)
- Registry references (ensure they exist)

### Task 5: Resolving Security Issues

**Tools Available:**
```bash
npm run lint              # ESLint checks
npm run typecheck         # TypeScript validation
npm test                  # Run all tests
```

**Common Security Patterns:**
- Validate all user input
- Sanitize file paths (use `path.join()`, validate against `..`)
- Never expose secrets in logs
- Use environment variables for sensitive data
- Follow OWASP guidelines in `STANDARDS/best-practices/`

**Example Path Validation:**
```javascript
const path = require('path');

function validatePath(userPath, baseDir) {
  const resolved = path.resolve(baseDir, userPath);
  const normalized = path.normalize(resolved);
  
  // Ensure path is within baseDir
  if (!normalized.startsWith(baseDir)) {
    throw new Error('Path traversal detected');
  }
  
  return normalized;
}
```

### Task 6: Creating New Components

**Location:** `COMPONENTS/`

**Categories:**
- `auth/` - Authentication components
- `forms/` - Form components and validation
- `layouts/` - Layout components
- `media/` - Image, video, audio components
- `feedback/` - Notifications, toasts, modals
- `advanced/` - Complex UI patterns

**Steps:**
1. Determine appropriate category
2. Create component file: `COMPONENTS/[category]/[component-name].tsx`
3. Include TypeScript types and props documentation
4. Add usage example in comments
5. Run: `npm run sync:components`
6. Add tests if applicable

**Example Component:**
```typescript
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

/**
 * Reusable button component with variants
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

## Repository Maintenance

### Daily Tasks (Automated)
- Git hooks run pre-commit validation
- CI/CD runs on every push
- Registry validation in CI pipeline

### Weekly Tasks
- Review open issues
- Update skill documentation
- Check registry consistency: `npm run validate`
- Update changelog for significant changes

### Monthly Tasks
- Review resource counts vs documentation
- Update dependency versions
- Run comprehensive audit: `npm run ci`
- Check MCP server functionality

### Version Management

**Versioning Strategy:**
```bash
npm run version:patch  # Bug fixes (3.0.0 → 3.0.1)
npm run version:minor  # New features (3.0.0 → 3.1.0)
npm run version:major  # Breaking changes (3.0.0 → 4.0.0)
```

**Before Release:**
1. Run full validation: `npm run validate`
2. Run all tests: `npm test`
3. Update CHANGELOG.md
4. Update version in README.md
5. Commit and create release tag

## Working with the Brain MCP

The **brain-mcp** is the intelligent orchestration system that powers this repository.

### Brain Commands

**Search and Discovery:**
```javascript
// Search across all resources
brain_search({ query: "authentication" })

// Get skill recommendations
brain_select_skills({ taskDescription: "implement RAG system" })

// Show skill details
brain_show_skill({ skillName: "rag-implementer" })

// Show relationships
brain_relationships({ skillName: "security-engineer" })

// Repository status
brain_status({})
```

**Capability Graph Queries:**
```javascript
// Find by domain
graph_query_by_domain({ domain: "ai" })

// Find by effect
graph_query_by_effect({ effect: "implements_authentication" })

// Get dependencies
graph_get_dependencies({ capabilityId: "rag-implementer" })

// Find path between capabilities
graph_find_path({ from: "rag-implementer", to: "frontend-builder" })

// Get composition chains
graph_composition_chains({ capabilityId: "security-engineer" })

// Graph statistics
graph_stats({})

// Validate graph
graph_validate({})
```

### When to Use Brain MCP

**Use brain-mcp when:**
- You need to find relevant skills for a task
- You want to understand resource relationships
- You need to validate capability graph consistency
- You're planning complex multi-skill implementations

**Example Workflow:**
```
1. User asks: "Help me build authentication"
2. Call: brain_search({ query: "authentication" })
3. Review: security-engineer, api-designer, frontend-builder
4. Call: brain_relationships({ skillName: "security-engineer" })
5. Understand: Dependencies and related MCPs
6. Implement: Using recommended skills and tools
```

## Best Practices for This Repository

### 1. Skills vs Patterns vs Playbooks

**Skills (SKILLS/)** - Claude follows as instructions
- Active voice, step-by-step
- Automatically invoked by context
- Include prerequisites and validation steps

**Patterns (STANDARDS/)** - Claude consults for information
- Declarative, reference style
- Problem → Solution → Trade-offs
- Include when-to-use guidance

**Playbooks (PLAYBOOKS/)** - Procedural checklists
- Imperative, ordered steps
- Include prerequisites and success criteria
- Used for operational procedures

### 2. Registry Consistency

**Golden Rule:** Every file must be in its registry

**Enforce With:**
```bash
npm run validate        # Detect inconsistencies
npm run validate:fix    # Auto-fix registries
npm run test:registry   # Validate in tests
```

**Registry Structure:**
```json
{
  "skills": [
    {
      "name": "skill-name",
      "path": "SKILLS/skill-name",
      "description": "What it does",
      "triggers": ["keyword1", "keyword2"],
      "prerequisites": [],
      "relationships": {
        "uses_mcps": ["mcp-name"],
        "uses_tools": ["tool-name"]
      }
    }
  ]
}
```

### 3. Documentation Standards

**Every skill must have:**
- `SKILL.md` with YAML frontmatter
- `README.md` with comprehensive docs
- Examples and anti-patterns
- Prerequisites and validation steps

**Every MCP must have:**
- `README.md` with tool documentation
- `manifest.yaml` for capability graph
- TypeScript implementation with types
- Build configuration

**Every component must have:**
- TypeScript interface for props
- JSDoc comments with examples
- Consistent naming conventions
- Category organization

### 4. Security First

**Always:**
- Validate user input
- Sanitize file paths
- Use environment variables for secrets
- Follow principle of least privilege
- Log security-relevant events

**Never:**
- Trust user input
- Expose sensitive data in errors
- Use string concatenation for paths
- Store secrets in code
- Ignore security warnings

### 5. Performance Optimization

**Skills:**
- Keep focused and specific
- Avoid unnecessary complexity
- Include performance considerations

**MCPs:**
- Implement proper error handling
- Use caching when appropriate
- Set reasonable timeouts
- Handle rate limiting

**Components:**
- Optimize re-renders
- Use React.memo when appropriate
- Implement lazy loading
- Minimize bundle size

## Troubleshooting Common Issues

### Issue: Registry Out of Sync

**Symptoms:**
- Resource counts don't match
- CLI can't find resources
- Validation tests fail

**Solution:**
```bash
npm run validate:fix    # Regenerate all registries
npm run validate        # Verify consistency
```

### Issue: MCP Server Not Working

**Symptoms:**
- Brain commands fail
- MCP not listed in `.claude/mcp-settings.json`
- Connection errors

**Solution:**
```bash
cd MCP-SERVERS/[mcp-name]
npm install
npm run build
# Update path in .claude/mcp-settings.json
```

### Issue: Skills Not Activating

**Symptoms:**
- Claude doesn't use skills
- Skills not in `.claude/claude.md`

**Solution:**
1. Check SKILL.md has proper YAML frontmatter
2. Verify skill is in `META/skill-registry.json`
3. Ensure `.claude/claude.md` is updated
4. Restart Claude Desktop

### Issue: Tests Failing

**Symptoms:**
- `npm test` fails
- CI/CD pipeline fails

**Solution:**
```bash
npm run lint:fix        # Fix linting issues
npm run typecheck       # Check TypeScript
npm run validate:fix    # Fix registries
npm test                # Run tests again
```

### Issue: Path Not Found Errors

**Symptoms:**
- File not found errors
- Import errors
- Module resolution failures

**Solution:**
- Always use absolute paths in examples
- Use `path.resolve()` in scripts
- Check file actually exists
- Verify path is in correct directory

## Advanced Usage

### Creating Custom Skills

1. **Identify the Need**
   - What methodology is missing?
   - Does it overlap with existing skills?
   - Is it specific enough to be useful?

2. **Design the Skill**
   - Define clear triggers
   - Outline step-by-step process
   - Identify prerequisites
   - Define success criteria

3. **Implement**
   - Create `SKILLS/[skill-name]/SKILL.md`
   - Add YAML frontmatter
   - Write detailed instructions
   - Include examples

4. **Document**
   - Create comprehensive README
   - Add troubleshooting section
   - Include anti-patterns
   - Show real-world usage

5. **Integrate**
   - Run `npm run sync:skills`
   - Update relationships
   - Test with Claude
   - Get feedback

### Building New MCPs

1. **Design Tool Interface**
   ```typescript
   interface Tool {
     name: string;
     description: string;
     inputSchema: JSONSchema;
     handler: (args: any) => Promise<any>;
   }
   ```

2. **Implement MCP Protocol**
   - Handle `tools/list`
   - Handle `tools/call`
   - Proper error handling
   - Type safety

3. **Create Manifest**
   ```yaml
   name: mcp-name
   capabilities:
     - name: capability-name
       domain: [frontend|backend|ai|...]
       effects:
         - implements_something
   dependencies:
     skills: [skill-name]
     mcps: [other-mcp]
   ```

4. **Test and Document**
   - Build successfully
   - Test each tool
   - Document in README
   - Add to capability graph

### Orchestration Workflows

Use the orchestration system for complex tasks:

```bash
# Create plan request
./scripts/orchestration/create-request.sh plan "Build authentication system"

# Claude Code executes
# Reads: orchestration-requests/pending/[id].json
# Writes: orchestration-results/[id].json

# Review results
cat orchestration-results/[id].json
```

**Request Types:**
- `plan` - Create execution plan
- `validate` - Validate implementation
- `diagnose` - Project health check
- `generate_manifest` - Create capability manifest
- `build_capability_graph` - Rebuild graph

## Quick Reference

### File Structure
```
ai-dev-standards/
├── SKILLS/              # 64 specialized skills
├── MCP-SERVERS/         # 50 MCP servers (including brain-mcp)
├── TOOLS/               # 24 tools and utilities
├── COMPONENTS/          # 72 React components
├── INTEGRATIONS/        # 28 service integrations
├── STANDARDS/           # Architecture patterns & best practices
├── PLAYBOOKS/           # Operational procedures
├── META/                # Registry system (JSON files)
├── DOCS/                # Comprehensive documentation
├── .claude/             # Claude Desktop config
├── .codex/              # Codex CLI config
└── scripts/             # Build and validation scripts
```

### Essential Commands
```bash
# Validation
npm run validate            # Check all registries
npm run validate:fix        # Auto-fix registries
npm run validate:docs       # Check doc consistency

# Testing
npm test                    # Run all tests
npm run test:registry       # Registry validation tests
npm run test:coverage       # Coverage report

# Linting
npm run lint                # Check code quality
npm run lint:fix            # Auto-fix issues
npm run typecheck           # TypeScript validation

# Syncing
npm run sync                # Sync everything
npm run sync:skills         # Sync skills only
npm run sync:mcps           # Sync MCPs only

# Complete CI check
npm run ci                  # Run full CI pipeline
```

### Registry Files
- `META/skill-registry.json` - All skills
- `META/mcp-registry.json` - All MCPs
- `META/component-registry.json` - All components
- `META/tool-registry.json` - All tools
- `META/integration-registry.json` - All integrations
- `META/relationship-mapping.json` - Dependencies
- `META/capability-graph.json` - Capability graph

### Important Documentation
- `META/PROJECT-CONTEXT.md` - Repository structure
- `META/HOW-TO-USE.md` - Navigation guide
- `META/DECISION-FRAMEWORK.md` - Technology choices
- `DOCS/GETTING-STARTED.md` - Setup guide
- `README.md` - Main overview

## Remember

**When working in this repository:**

1. **Always read META files first** - They contain the ground truth
2. **Keep registries in sync** - Run `npm run validate:fix` regularly
3. **Follow existing patterns** - Consistency is key
4. **Test your changes** - Run `npm test` before committing
5. **Document thoroughly** - Future you will thank you
6. **Use brain-mcp** - It knows the repository better than anyone
7. **Security first** - Validate input, sanitize output
8. **Quality over quantity** - Better to have fewer, high-quality resources

**This repository is a living system** - It evolves with best practices, new tools, and community feedback. Help keep it clean, consistent, and valuable for everyone who uses it.
