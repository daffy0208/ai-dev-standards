# Repository Drift Analysis
**Generated:** 2025-10-27
**Status:** ✅ RESOLVED - False positive detected and fixed
**Brain Health:** HEALTHY (0 errors)
**Skills:** 41 active
**MCPs:** 36 implemented
**Drift:** NONE

## ✅ RESOLUTION (2025-10-27)

**THE 45 "MISSING MCPs" WERE A FALSE POSITIVE!**

All 36 MCPs were actually present in the registry and filesystem, but the brain's validation code had a bug:
- The brain searched MCPs by `name` field ("Vector Database MCP")
- But the registry uses `id` field ("vector-database-mcp")
- This caused all MCP lookups to fail

**Fix Applied:** Updated `brain-core.ts` `getMCP()` method to search by `id` instead of `name`

**Result:** All validations now pass, health status is HEALTHY

---

# Original Analysis (Now Historical)

## Summary

The brain has detected significant strategic drift: **41 skills** have dependencies on **45 unique MCPs** that are planned but not yet implemented. This represents ~55% missing MCP coverage.

**Current Coverage:** 36 MCPs implemented
**Required for Skills:** ~81 MCPs (including duplicates)
**Gap:** 45 unique MCPs needed

## High-Priority MCPs (Multiple Skill Dependencies)

These MCPs are required by 2+ skills and should be implemented first:

### Tier 1: Critical (2+ skills each)

| MCP | Skills Requiring It | Priority |
|-----|---------------------|----------|
| **component-generator-mcp** | frontend-builder, mvp-builder | HIGH |
| **vector-database-mcp** | knowledge-base-manager, rag-implementer | HIGH |
| **embedding-generator-mcp** | knowledge-base-manager, rag-implementer | HIGH |
| **graph-database-mcp** | knowledge-base-manager, knowledge-graph-builder | HIGH |
| **feature-prioritizer-mcp** | mvp-builder, product-strategist | MEDIUM |
| **screenshot-testing-mcp** | quality-auditor, testing-strategist | MEDIUM |
| **user-insight-analyzer-mcp** | product-strategist, user-researcher | MEDIUM |
| **design-token-manager-mcp** | design-system-architect, visual-designer | MEDIUM |
| **database-migration-mcp** | data-engineer, forensic-data-engineer | MEDIUM |

### Tier 2: Important (1 skill each, commonly used skills)

#### RAG & AI Systems
- **semantic-search-mcp** (rag-implementer)
- **knowledge-base-mcp** (knowledge-base-manager)
- **agent-orchestrator-mcp** (multi-agent-architect)

#### Development Tools
- **openapi-generator-mcp** (api-designer)
- **api-validator-mcp** (api-designer)
- **code-quality-scanner-mcp** (quality-auditor)
- **test-runner-mcp** (testing-strategist)
- **doc-generator-mcp** (technical-writer)

#### Security & Performance
- **security-scanner-mcp** (security-engineer)
- **performance-profiler-mcp** (performance-optimizer)

### Tier 3: Specialized (1 skill each, less frequently used)

- **3d-asset-manager-mcp** (3d-visualizer)
- **accessibility-checker-mcp** (accessibility-engineer)
- **animation-library-mcp** (animation-designer)
- **audio-processor-mcp** (audio-producer)
- **seo-analyzer-mcp** (copywriter)
- **dark-matter-analyzer-mcp** (dark-matter-analyzer)
- **chart-builder-mcp** (data-visualizer)
- **deployment-orchestrator-mcp** (deployment-advisor)
- **market-analyzer-mcp** (go-to-market-planner)
- **iot-device-manager-mcp** (iot-developer)
- **streaming-setup-mcp** (livestream-engineer)
- **i18n-manager-mcp** (localization-engineer)
- **mobile-builder-mcp** (mobile-developer)
- **wireframe-generator-mcp** (ux-designer)
- **video-optimizer-mcp** (video-producer)
- **asset-optimizer-mcp** (visual-designer)
- **archon-mcp** (archon-manager) - NOTE: This exists but under different name

## Impact Analysis

### Skills Blocked by Missing MCPs

**Completely Blocked (all dependencies missing):**
- 3d-visualizer (1/1 missing)
- accessibility-engineer (1/1 missing)
- animation-designer (1/1 missing)
- audio-producer (1/1 missing)
- copywriter (1/1 missing)
- dark-matter-analyzer (1/1 missing)
- data-visualizer (1/1 missing)
- deployment-advisor (1/1 missing)
- design-system-architect (1/1 missing)
- go-to-market-planner (1/1 missing)
- iot-developer (1/1 missing)
- livestream-engineer (1/1 missing)
- localization-engineer (1/1 missing)
- mobile-developer (1/1 missing)
- multi-agent-architect (1/1 missing)
- performance-optimizer (1/1 missing)
- security-engineer (1/1 missing)
- technical-writer (1/1 missing)
- user-researcher (1/1 missing)
- ux-designer (1/1 missing)
- video-producer (1/1 missing)

**Partially Blocked (some dependencies missing):**
- api-designer (2/2 missing: openapi-generator, api-validator)
- data-engineer (1/1 missing: database-migration)
- forensic-data-engineer (1/1 missing: database-migration)
- frontend-builder (1/1 missing: component-generator)
- knowledge-base-manager (4/4 missing: knowledge-base, vector-database, embedding-generator, graph-database)
- knowledge-graph-builder (1/1 missing: graph-database)
- mvp-builder (2/2 missing: feature-prioritizer, component-generator)
- product-strategist (2/2 missing: user-insight-analyzer, feature-prioritizer)
- quality-auditor (2/2 missing: code-quality-scanner, screenshot-testing)
- rag-implementer (3/3 missing: vector-database, embedding-generator, semantic-search)
- testing-strategist (2/2 missing: test-runner, screenshot-testing)
- visual-designer (2/2 missing: asset-optimizer, design-token-manager)

## Recommendations

### Phase 1: Core Infrastructure (High Priority)
Implement these 9 MCPs to unblock critical workflows:

1. **vector-database-mcp** - Unblocks RAG and knowledge base workflows
2. **embedding-generator-mcp** - Required for semantic search capabilities
3. **component-generator-mcp** - Unblocks frontend and MVP development
4. **graph-database-mcp** - Enables knowledge graph capabilities
5. **api-validator-mcp** - Critical for API development
6. **openapi-generator-mcp** - API documentation and client generation
7. **code-quality-scanner-mcp** - Code quality enforcement
8. **test-runner-mcp** - Automated testing workflows
9. **semantic-search-mcp** - Completes RAG system requirements

**Impact:** Unblocks 8 skills (rag-implementer, knowledge-base-manager, frontend-builder, mvp-builder, api-designer, quality-auditor, knowledge-graph-builder, testing-strategist)

### Phase 2: Development Tools (Medium Priority)
Implement these 6 MCPs for enhanced development workflows:

1. **feature-prioritizer-mcp** - Product strategy and MVP planning
2. **database-migration-mcp** - Data engineering capabilities
3. **doc-generator-mcp** - Automated documentation
4. **security-scanner-mcp** - Security validation
5. **performance-profiler-mcp** - Performance optimization
6. **user-insight-analyzer-mcp** - User research and product strategy

**Impact:** Unblocks 6 more skills

### Phase 3: Specialized Tools (Lower Priority)
Implement remaining 30 MCPs based on specific project needs

### Alternative: Adjust Skill Dependencies

Consider marking some MCP dependencies as "recommended" instead of "required" in relationship-mapping.json for skills that can function without them (with reduced capabilities).

## Health Projection

**Current Health:** CRITICAL (45 errors)
**After Phase 1:** DEGRADED (~36 errors)
**After Phase 2:** DEGRADED (~30 errors)
**After Phase 3:** HEALTHY (0 errors)

## Archon-MCP Note

The `archon-mcp` is listed as missing, but Archon MCP actually exists in the repository. This may be a naming mismatch:
- Listed in relationship-mapping: `archon-mcp`
- Actual MCP name: Check `META/mcp-registry.json` for correct name

## Next Steps

1. **Prioritize based on your use cases** - Which skills do you use most?
2. **Implement Phase 1 MCPs** - Focus on RAG, component generation, API validation
3. **Consider official MCPs** - Check if Anthropic/community MCPs exist for these functions
4. **Document MCP interfaces** - Create specifications for each MCP before implementation
5. **Update regularly** - Run `brain health` after each MCP implementation

---

**Generated by:** Repository Brain v2.0 (Phase 2)
**Command:** `brain health` + manual analysis
