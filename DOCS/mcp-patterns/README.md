# MCP Patterns: Complete Guide

## Overview

This directory contains comprehensive documentation for **two MCP (Model Context Protocol) implementation patterns** used in ai-dev-standards:

1. **Direct MCP** - Traditional pattern where all tools are loaded into agent context upfront
2. **Code Execution** - Advanced pattern where agents discover and load tools on-demand

## Quick Decision Guide

```
START
├─ Does your agent use 5+ tools? ────────────── NO → Use Direct MCP
│   YES ↓
├─ Does your agent process >10KB data? ──────── NO → Consider carefully
│   YES ↓
├─ Do you have persistent storage? ──────────── NO → Infrastructure needed first
│   YES ↓
├─ Can you support IPython interpreter? ────── NO → Platform constraint
│   YES ↓
└─ ✅ Good candidate for Code Execution!
```

**Quick Recommendations:**
- **Simple agents** (1-3 tools, light data) → Direct MCP
- **Complex agents** (5+ tools, heavy data) → Code Execution
- **Real-time interactions** → Direct MCP
- **Batch processing, multi-step workflows** → Code Execution

## Documentation Index

### Getting Started
1. **[MCP Patterns Overview](./00-mcp-patterns-overview.md)** - Understanding both patterns
2. **[Decision Framework](./01-mcp-decision-framework.md)** - Choosing the right pattern
3. **[Implementation Roadmap](./10-mcp-implementation-roadmap.md)** - Your migration plan

### Pattern-Specific Documentation

#### Direct MCP Pattern (Current)
4. **[Direct MCP Pattern](./02-mcp-direct-pattern.md)** - How your 50 MCPs currently work

#### Code Execution Pattern (Advanced)
5. **[Code Execution Pattern](./03-mcp-code-execution-pattern.md)** - Overview of new pattern
6. **[Migration Guide](./04-mcp-migration-guide.md)** - Step-by-step conversion process
7. **[Filesystem Structure](./05-mcp-filesystem-structure.md)** - Tool organization
8. **[Progressive Discovery](./06-mcp-progressive-discovery-patterns.md)** - Scaling to 1000+ tools
9. **[Security & Privacy](./07-mcp-security-privacy-best-practices.md)** - 4-layer security model
10. **[Performance Benchmarking](./08-mcp-performance-benchmarking-guide.md)** - Validation framework
11. **[Brain Orchestrator Integration](./09-brain-orchestrator-mcp-integration.md)** - Automatic pattern selection

## Current State: ai-dev-standards

### Our MCPs
- **Total MCPs**: 50 active
- **Current Pattern**: Direct MCP (all 50)
- **Migration Candidates**: TBD (see roadmap)
- **Registry**: [`/META/mcp-registry.json`](../../META/mcp-registry.json)

### Our Skills
- **Total Skills**: 64 active
- **MCP-Dependent**: ~40 skills
- **Pattern Preference**: TBD (will be added to skill-registry.json)
- **Registry**: [`/META/skill-registry.json`](../../META/skill-registry.json)

## Key Benefits Comparison

| Metric | Direct MCP | Code Execution |
|--------|-----------|---------------|
| **Token Usage** | Baseline | 40-60% reduction (first run)<br>85-95% reduction (with skills) |
| **Context Window** | Fills quickly | Stays small |
| **Setup Complexity** | Simple | Complex |
| **Latency** | Baseline | Same or better |
| **Scalability** | ~200 tools max | 1000+ tools |
| **Self-Improvement** | No | Yes (creates reusable skills) |
| **Security** | Basic | 4-layer model |
| **Best For** | Simple agents | Complex workflows |

## Expected Outcomes (Based on Package Analysis)

### Token Reduction
| Agent Complexity | Direct MCP | Code Exec (First) | Code Exec (Skills) |
|------------------|-----------|-------------------|-------------------|
| Simple (1-2 tools) | ~8,000 | ~4,000 (50% ↓) | ~2,000 (75% ↓) |
| Medium (3-5 tools) | ~30,000 | ~15,000 (50% ↓) | ~5,000 (83% ↓) |
| Complex (6+ tools) | ~70,000 | ~30,000 (57% ↓) | ~10,000 (86% ↓) |

### Our Potential Impact
With 50 MCPs and 64 skills, if we migrate high-complexity candidates:
- **Estimated savings**: 60-85% token reduction for complex workflows
- **Break-even**: To be determined based on actual usage analysis
- **ROI**: Calculated in implementation roadmap

## Implementation Phases

Our planned approach (see [Implementation Roadmap](./10-mcp-implementation-roadmap.md) for details):

1. **Phase 1: Foundation** (Weeks 1-2)
   - Document current state
   - Set up infrastructure
   - Analyze migration candidates

2. **Phase 2: Proof of Concept** (Weeks 3-4)
   - Migrate 1-2 simple MCPs
   - Validate token reduction
   - Test security layers

3. **Phase 3: Brain Integration** (Weeks 5-6)
   - Add approach selector
   - Add complexity analyzer
   - Enable automatic pattern selection

4. **Phase 4: Production Rollout** (Weeks 7-12)
   - Migrate priority MCPs
   - Build skill library
   - Optimize based on metrics

## Security Considerations

The Code Execution pattern requires a **4-layer security model**:

1. **Layer 1: Sandbox Isolation** - Contain code execution (Docker/gVisor/E2B)
2. **Layer 2: PII Tokenization** - Protect sensitive data automatically
3. **Layer 3: Access Control** - RBAC for tools and data
4. **Layer 4: Monitoring & Audit** - Detect anomalies and log everything

See [Security & Privacy Guide](./07-mcp-security-privacy-best-practices.md) for full details.

## Tools & Utilities

### Generators
- **MCP Generator**: [`/CLI/generators/mcp-generator.js`](../../CLI/generators/mcp-generator.js) - Creates MCPs (both patterns)
- **Tool File Generator**: [`/CLI/generators/tool-file-generator.js`](../../CLI/generators/tool-file-generator.js) - Creates individual tool files

### Migration Tools
- **MCP Converter**: `/TOOLS/migration/mcp-converter.ts` - Converts Direct → Code Execution
- **Validation**: `/TOOLS/migration/validation/` - Validates conversions
- **Rollback**: `/TOOLS/migration/rollback/` - Rollback manager

### Benchmarking
- **Baseline Benchmark**: `/TOOLS/benchmarking/baseline-benchmark.ts`
- **Migration Benchmark**: `/TOOLS/benchmarking/migration-benchmark.ts`
- **ROI Calculator**: `/TOOLS/benchmarking/roi-calculator.ts`

### Security
- **Sandbox**: `/SECURITY/sandbox/` - Isolation configurations
- **PII Tokenization**: `/SECURITY/pii-tokenization/` - Tokenizers
- **Access Control**: `/SECURITY/access-control/` - RBAC system
- **Monitoring**: `/SECURITY/monitoring/` - Audit logging

## Related Documentation

### Core Docs
- [System Overview](../SYSTEM-OVERVIEW.md)
- [Brain MCP Integration](../BRAIN-MCP-INTEGRATION.md)
- [MCP Configuration Guide](../MCP-CONFIGURATION-GUIDE.md)
- [MCP Development Roadmap](../MCP-DEVELOPMENT-ROADMAP.md)

### Developer Guides
- [MCP Development Playbook](../../PLAYBOOKS/mcp-development.md)
- [Best Practices](../../STANDARDS/best-practices/mcp-code-execution-best-practices.md)
- [Troubleshooting](../TROUBLESHOOTING.md)

### Registries
- [MCP Registry](../../META/mcp-registry.json) - All 50 MCPs
- [Skill Registry](../../META/skill-registry.json) - All 64 skills
- [Tool Files Registry](../../META/tool-files-registry.json) - Code Execution tool tracking

## FAQ

**Q: Should we migrate all 50 MCPs to Code Execution?**
A: No. Only migrate complex, high-usage MCPs where token reduction justifies the effort. See Decision Framework.

**Q: What's the implementation timeline?**
A: 8-12 weeks for complete infrastructure + pilot migrations. See Implementation Roadmap.

**Q: Do we need all 4 security layers?**
A: Depends on your data. If handling PII/PHI/financial data, all 4 layers are critical. Otherwise, start with sandbox + access control.

**Q: Can we use both patterns simultaneously?**
A: Yes! The brain orchestrator will automatically select the appropriate pattern per task.

**Q: What's the cost?**
A: Initial setup is significant (engineering time), but ongoing token savings can be 60-95% for complex workflows.

## Getting Help

1. **Quick Questions**: See [Troubleshooting](../TROUBLESHOOTING.md)
2. **Pattern Selection**: Use [Decision Framework](./01-mcp-decision-framework.md)
3. **Implementation Help**: See [Migration Guide](./04-mcp-migration-guide.md)
4. **Security Questions**: See [Security Guide](./07-mcp-security-privacy-best-practices.md)

## Contributing

When adding new MCPs or updating existing ones:
1. Decide on pattern using Decision Framework
2. Follow appropriate template in `/TEMPLATES/mcp-patterns/`
3. Update registry with pattern metadata
4. Run validation scripts
5. Update this documentation

## Version History

- **v1.0.0** (2025-11-14) - Initial documentation structure
  - Added comprehensive MCP patterns documentation
  - Integrated Anthropic's Code Execution guidance (Nov 2025)
  - Created migration framework
  - Documented current state (50 Direct MCP servers)

---

**Last Updated**: 2025-11-14
**Maintainer**: ai-dev-standards team
**Status**: Active development
