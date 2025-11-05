# Auto-Activation Optimization Guide

**Optimizing skill-rules.json for Better Resource Selection**

This guide identifies existing skills, agents, MCPs, and tools that can benefit from improved auto-activation patterns and provides recommendations for when and how they should be selected.

---

## Current State Analysis

### What's Already Working ✅

**Phase 1 Implementation Complete:**
- 64 skills have activation rules in skill-rules.json
- All skills have promptTriggers
- All skills have fileTriggers with pathPatterns
- Hook executes < 50ms

**Current Coverage:**
- ✅ Skills: 64/64 (100%)
- ✅ Agents: 13 available
- ✅ MCPs: 51 registered
- ✅ Tools: 24 registered

---

## Optimization Opportunities

### 1. Skills with Generic Triggers (HIGH PRIORITY)

**Problem:** Some skills have overly generic triggers that may cause false positives or miss relevant contexts.

**Examples:**

#### accessibility-engineer
**Current triggers:**
```json
{
  "promptTriggers": ["accessibility-engineer", "accessibility engineer", "ui", "design"],
  "fileTriggers": {"pathPatterns": ["**/accessibility-engineer/**/*"]}
}
```

**Issue:** "ui" and "design" are too generic

**Recommended:**
```json
{
  "promptTriggers": [
    "accessibility-engineer", "accessibility engineer",
    "accessibility", "a11y", "WCAG", "screen reader",
    "keyboard navigation", "ARIA", "contrast ratio"
  ],
  "fileTriggers": {
    "pathPatterns": [
      "**/accessibility-engineer/**/*",
      "**/a11y/**/*",
      "**/components/**/*",  // When working on UI components
      "**/*.accessibility.test.*"
    ]
  }
}
```

#### api-designer
**Current triggers:**
```json
{
  "promptTriggers": ["api-designer", "api designer", "api", "backend", "endpoint", "design", "auth", "authentication"],
  "fileTriggers": {"pathPatterns": ["**/api/**/*.{ts,js}", "**/routes/**/*.{ts,js}", "**/controllers/**/*.{ts,js}", "**/api-designer/**/*"]}
}
```

**Good!** Already well-optimized with specific keywords and file patterns.

#### rag-implementer
**Current triggers:**
```json
{
  "promptTriggers": ["rag-implementer", "rag implementer", "ui", "vector", "embedding", "llm"],
  "fileTriggers": {"pathPatterns": ["**/rag/**/*", "**/vector/**/*", "**/search/**/*", "**/embeddings/**/*", "**/rag-implementer/**/*"]}
}
```

**Issue:** "ui" is incorrect (should be "RAG" not "ui")

**Recommended:**
```json
{
  "promptTriggers": [
    "rag-implementer", "rag implementer",
    "RAG", "retrieval augmented generation",
    "vector", "embedding", "llm",
    "semantic search", "vector database",
    "document retrieval", "knowledge base"
  ],
  "fileTriggers": {
    "pathPatterns": [
      "**/rag/**/*",
      "**/vector/**/*", 
      "**/search/**/*",
      "**/embeddings/**/*",
      "**/retrieval/**/*",
      "**/rag-implementer/**/*"
    ]
  }
}
```

### 2. Skills Needing More Specific File Patterns

**Problem:** Some skills only have generic pathPatterns based on skill name.

#### frontend-builder
**Current:**
```json
{
  "promptTriggers": ["frontend-builder", "frontend builder", "react", "component", "ui", "interface", "frontend", "client"],
  "fileTriggers": {"pathPatterns": ["**/components/**/*.{tsx,jsx}", "**/pages/**/*.{tsx,jsx}", "**/app/**/*.{tsx,jsx}", "**/frontend-builder/**/*"]}
}
```

**Good!** Already has specific React patterns.

#### security-engineer
**Current (likely):**
```json
{
  "promptTriggers": ["security-engineer", "security engineer", "security", "auth", "authentication", "authorization"],
  "fileTriggers": {"pathPatterns": ["**/security/**/*", "**/auth/**/*", "**/middleware/**/*", "**/security-engineer/**/*"]}
}
```

**Recommended additions:**
```json
{
  "fileTriggers": {
    "pathPatterns": [
      "**/security/**/*",
      "**/auth/**/*",
      "**/middleware/**/*",
      "**/guards/**/*",
      "**/permissions/**/*",
      "**/*.security.test.*",
      "**/config/security.{ts,js,json}",
      "**/.env*"  // Security config files
    ]
  }
}
```

#### testing-strategist
**Recommended:**
```json
{
  "promptTriggers": [
    "testing-strategist", "testing strategist",
    "test", "testing", "qa", "quality assurance",
    "unit test", "integration test", "e2e",
    "jest", "vitest", "playwright", "cypress"
  ],
  "fileTriggers": {
    "pathPatterns": [
      "**/*.test.{ts,js,tsx,jsx}",
      "**/*.spec.{ts,js,tsx,jsx}",
      "**/tests/**/*",
      "**/test/**/*",
      "**/__tests__/**/*",
      "**/e2e/**/*",
      "**/jest.config.*",
      "**/vitest.config.*",
      "**/playwright.config.*"
    ]
  }
}
```

### 3. Context-Based Skill Activation

**High-Value Combinations:** Skills that work together should activate in complementary contexts.

#### Authentication + API Design
**When user works on:** `backend/api/routes/auth.ts`

**Should activate:**
1. security-engineer (primary - auth context)
2. api-designer (secondary - API context)
3. backend-developer (tertiary - backend context)

**Current state:** Likely activates all three, which is good!

#### Frontend + Accessibility
**When user works on:** `components/ui/Modal.tsx`

**Should activate:**
1. frontend-builder (primary - component)
2. accessibility-engineer (secondary - UI component needs a11y)
3. react-specialist (tertiary - React context)

**Optimization needed:** Add UI component patterns to accessibility-engineer

#### RAG + Vector Database
**When user asks:** "How do I implement semantic search?"

**Should activate:**
1. rag-implementer (primary - RAG/semantic search)
2. vector-database-mcp (secondary - vector DB tool)
3. knowledge-base-manager (tertiary - knowledge organization)

**Current state:** Good if triggers include "semantic search"

---

## MCP and Tool Selection

### Problem: MCPs and Tools Not in Auto-Activation

**Current state:** skill-rules.json only covers skills, not MCPs or tools.

**Opportunity:** Brain MCP can recommend MCPs/tools based on active skills.

### Brain MCP Integration

The Brain MCP already provides intelligent recommendations:

```typescript
// Brain MCP can suggest MCPs based on skill context
brain_select_mcps({
  taskDescription: "implement authentication",
  activeSkills: ["security-engineer", "api-designer"]
})

// Returns:
// - auth-mcp
// - jwt-handler-mcp
// - database-mcp (for user storage)
```

**Recommendation:** Skills should document their related MCPs and tools in manifest.yaml

### Example: security-engineer manifest.yaml

```yaml
name: security-engineer
version: 1.0.0

dependencies:
  mcps:
    - auth-mcp
    - jwt-handler-mcp
    - encryption-mcp
  tools:
    - password-hasher-tool
    - security-scanner-tool

examples:
  - description: Implement JWT authentication
    required_mcps: [auth-mcp, jwt-handler-mcp]
    required_tools: [password-hasher-tool]
```

---

## Agent Selection Optimization

### Current Agent Availability

**13 Specialized Agents:**
- 10 from showcase (code review, refactoring, debugging, etc.)
- 3 ai-dev-standards specific (registry, skill testing, MCP building)

### When Should Agents Activate?

**Problem:** Agents are manually invoked, not auto-suggested like skills.

**Opportunity:** Create agent activation rules similar to skill-rules.json

### Proposed: agent-rules.json

```json
{
  "registry-validator-agent": {
    "contextTriggers": [
      "after adding new skill",
      "after modifying registry",
      "before release",
      "maintenance tasks"
    ],
    "promptTriggers": [
      "validate registry",
      "check consistency",
      "fix registries",
      "registry issues"
    ],
    "automaticTriggers": {
      "afterFileChange": [
        "META/skill-registry.json",
        "META/mcp-registry.json",
        "META/component-registry.json"
      ],
      "beforeCommand": ["npm run release"]
    }
  },
  
  "code-architecture-reviewer": {
    "contextTriggers": [
      "after implementing feature",
      "before merge",
      "code review requested"
    ],
    "promptTriggers": [
      "review code",
      "check architecture",
      "validate design",
      "architectural review"
    ],
    "automaticTriggers": {
      "afterFileChange": ["**/*.{ts,js,tsx,jsx}"],
      "minFilesChanged": 5
    }
  },
  
  "skill-tester-agent": {
    "contextTriggers": [
      "after modifying skill-rules.json",
      "after adding skills",
      "testing phase"
    ],
    "promptTriggers": [
      "test skills",
      "verify activation",
      "check skill triggers",
      "skill testing"
    ],
    "automaticTriggers": {
      "afterFileChange": [
        ".claude/skills/skill-rules.json",
        "SKILLS/*/SKILL.md"
      ]
    }
  }
}
```

---

## Practical Recommendations

### Immediate Actions (High Priority)

1. **Fix Generic Triggers**
   - Remove overly generic words like "ui", "design", "code"
   - Add specific domain keywords
   - Update generate-skill-rules.cjs

2. **Add Context-Specific Patterns**
   - Testing files → testing-strategist
   - Config files → deployment-advisor
   - Security files → security-engineer

3. **Document MCP Dependencies**
   - Update manifest.yaml for all skills
   - Link skills to their required MCPs
   - Enable Brain MCP recommendations

### Medium-Term Enhancements

4. **Create agent-rules.json**
   - Define when agents should be suggested
   - Implement agent auto-suggestion hook
   - Test agent activation patterns

5. **Tool Selection Matrix**
   - Document which tools work with which skills
   - Create tool recommendation system
   - Integrate with Brain MCP

6. **Context-Aware Recommendations**
   - Multi-skill scenarios
   - Task-based bundling
   - Progressive suggestions

---

## Specific Optimization Examples

### Example 1: Authentication Implementation

**User prompt:** "Help me add authentication to my API"

**Current activation (likely):**
- security-engineer ✅
- api-designer ✅

**Could also benefit from:**
- backend-developer (for implementation)
- database-architect (for user storage)
- testing-strategist (for auth tests)

**Recommendation:** Add "authentication" to database-architect and testing-strategist triggers

### Example 2: Building a Component Library

**User prompt:** "Create a design system with reusable components"

**Current activation (likely):**
- design-system-architect ✅
- frontend-builder ✅

**Could also benefit from:**
- accessibility-engineer (a11y compliance)
- documentation-writer (component docs)
- testing-strategist (component tests)

**Recommendation:** Link these skills in design-system-architect manifest.yaml

### Example 3: RAG System Implementation

**User prompt:** "Build a RAG system for document search"

**Current activation:**
- rag-implementer ✅

**Should also activate:**
- knowledge-base-manager (document organization)
- performance-optimizer (search speed)
- testing-strategist (accuracy testing)

**Should recommend MCPs:**
- vector-database-mcp
- embedding-generator-mcp
- document-parser-mcp

**Should recommend tools:**
- similarity-search-tool
- embedding-tool

---

## Implementation Guide

### Step 1: Regenerate with Improvements

Update `.claude/hooks/generate-skill-rules.cjs`:

```javascript
// Add more specific keyword extraction
const extractKeywords = (description) => {
  // Domain-specific keyword lists
  const keywords = {
    ai: ['RAG', 'LLM', 'embedding', 'vector', 'semantic search'],
    security: ['authentication', 'authorization', 'JWT', 'OAuth', 'encryption'],
    testing: ['test', 'QA', 'unit test', 'integration', 'e2e'],
    // ... more domains
  };
  
  // Extract relevant keywords based on description
  return matchedKeywords;
};

// Add more specific file patterns
const filePatterns = {
  'api-designer': [
    '**/api/**/*.{ts,js}',
    '**/routes/**/*',
    '**/controllers/**/*',
    '**/endpoints/**/*'
  ],
  'testing-strategist': [
    '**/*.test.*',
    '**/*.spec.*',
    '**/tests/**/*',
    '**/__tests__/**/*'
  ]
  // ... more patterns
};
```

### Step 2: Test and Validate

```bash
# Regenerate skill-rules.json
cd .claude/hooks
node generate-skill-rules.cjs

# Test with skill-tester-agent
# "Use skill-tester-agent to validate new triggers"

# Verify activation patterns
npm run validate
```

### Step 3: Document in Manifests

Update skill manifest.yaml files:

```yaml
# SKILLS/security-engineer/manifest.yaml
dependencies:
  skills:
    - api-designer
  mcps:
    - auth-mcp
    - jwt-handler-mcp
  tools:
    - password-hasher-tool
```

---

## Success Metrics

**Before Optimization:**
- Some generic triggers causing noise
- Skills activate independently
- MCPs/tools selected manually
- Agents invoked explicitly

**After Optimization:**
- Specific, accurate triggers
- Related skills activate together
- Brain MCP recommends MCPs/tools
- Agents suggested contextually

**Target Metrics:**
- 95%+ trigger accuracy (skills activate when relevant)
- <5% false positive rate (skills don't activate when irrelevant)
- 80%+ MCP recommendation accuracy
- 70%+ agent suggestion relevance

---

## Monitoring and Iteration

### How to Track Performance

1. **User Feedback**
   - Which skills activate when not needed?
   - Which skills should activate but don't?
   - Are recommendations helpful?

2. **Usage Analytics**
   - Skill activation frequency
   - User override patterns
   - MCP/tool selection patterns

3. **Continuous Improvement**
   - Update skill-rules.json based on patterns
   - Refine triggers quarterly
   - Test with real usage scenarios

---

## Related Documentation

- [SKILL-AUTO-ACTIVATION.md](SKILL-AUTO-ACTIVATION.md) - Phase 1 guide
- [AGENTS-GUIDE.md](AGENTS-GUIDE.md) - Phase 3 agent usage
- [REPOSITORY-COMPARISON-ANALYSIS.md](../REPOSITORY-COMPARISON-ANALYSIS.md) - Original analysis

---

## Conclusion

**Current State:** ✅ Phase 1 complete with 64 skills auto-activating

**Optimization Opportunities:**
1. 🎯 Fix generic triggers (high priority)
2. 📁 Add specific file patterns (high priority)
3. 🔗 Document MCP/tool dependencies (medium priority)
4. 🤖 Create agent activation rules (medium priority)
5. 📊 Implement usage tracking (low priority)

**Next Steps:**
1. Review and update generate-skill-rules.cjs
2. Regenerate skill-rules.json with improvements
3. Test with skill-tester-agent
4. Document MCP dependencies in manifests
5. Consider agent-rules.json for Phase 4

---

**Status:** Optimization guide complete  
**Ready for:** Implementation of recommendations  
**Last Updated:** 2025-11-04
