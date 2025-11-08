# Repository Simulation Tool

This directory contains the comprehensive simulation framework for testing all aspects of the ai-dev-standards repository.

## Quick Start

Run the simulation:

```bash
node scripts/full-simulation.cjs
```

## What It Tests

The simulation validates 11 major areas across 96 tests:

1. **Registry Discovery** (9 tests) - All resource registries and counts
2. **Skills System** (8 tests) - Skill activation, triggers, discovery
3. **MCP Servers** (10 tests) - MCP tools, categories, functionality
4. **Relationships** (6 tests) - Dependency mapping and coverage
5. **Brain Orchestration** (9 tests) - Intelligence layer operations
6. **Capability Graph** (12 tests) - Graph structure and queries
7. **Agent Workflows** (9 tests) - Multi-agent coordination
8. **Components & Tools** (9 tests) - Reusable resources
9. **Service Integrations** (6 tests) - External service connections
10. **End-to-End Workflows** (3 tests) - Complete user journeys
11. **System Health** (16 tests) - Infrastructure integrity

## Output Files

The simulation generates three reports:

### 1. SIMULATION-REPORT.json
Complete JSON report with all test results:
```json
{
  "timestamp": "2025-11-08T13:57:15.626Z",
  "version": "3.0.2",
  "sections": { ... },
  "summary": {
    "total_tests": 96,
    "passed": 78,
    "failed": 1,
    "warnings": 17
  }
}
```

### 2. SIMULATION-FINDINGS-REPORT.md
Comprehensive analysis (21KB):
- Executive summary
- Detailed section analysis
- Resource inventory
- Critical issues and recommendations
- End-to-end workflow validation
- Architecture validation

### 3. SIMULATION-EXECUTIVE-SUMMARY.md
Quick reference guide (10KB):
- Visual summary with tables
- Quick stats and metrics
- Priority recommendations
- System health rating

## Understanding Results

### Status Indicators
- ✅ **Passed** - Test succeeded
- ⚠️ **Warning** - Minor issue, system functional
- ❌ **Failed** - Critical issue, needs attention

### Success Rates
- **90%+** - Excellent (green)
- **70-89%** - Good (yellow)
- **<70%** - Needs work (red)

### Current Status
```
Overall Success Rate: 81.3%
Status: Operational with minor issues
```

## What Gets Tested

### Registry Discovery
- Skills registry (64 skills)
- MCP registry (50 servers)
- Tools registry (24 tools)
- Component registry
- Integration registry
- Relationship mapping

### Skill System
- Skill file integrity
- Trigger patterns
- Category distribution
- Discovery scenarios
- Related skills

### MCP Servers
- Server availability
- Tool counts
- Category distribution
- Brain MCP presence
- Common operations

### Relationships
- Skill-to-MCP coverage (85.9%)
- Dependency chains
- Cross-resource links
- Relationship types

### Brain Orchestration
- Infrastructure presence
- CLI commands
- Capability graph
- Workflow patterns

### Capability Graph
- Graph structure (nodes/edges)
- Domain queries
- Effect queries
- Connectivity analysis

### Agent Workflows
- Task decomposition
- Skill invocation
- Multi-agent coordination
- Integration points

### Components & Tools
- Component availability
- Tool operations
- Category distribution
- Usage simulation

### Service Integrations
- AI services (OpenAI, Claude)
- Databases (Supabase, Pinecone, Neo4j)
- Deployment (Vercel, Railway)
- Communication services
- Analytics services

### End-to-End Workflows
Three complete workflows validated:
1. **MVP Development** - Product to implementation
2. **RAG Implementation** - Search system setup
3. **Security Audit** - Full security review

### System Health
- Directory structure
- Configuration files
- Version consistency
- File integrity

## Common Scenarios

### Running After Changes
```bash
# Make changes to skills, MCPs, etc.
node scripts/full-simulation.cjs

# Check for regressions
```

### Checking Specific Sections
The script tests everything, but you can focus on specific output sections:
```bash
node scripts/full-simulation.cjs | grep "SECTION 2"
```

### Automated Testing
Add to CI/CD pipeline:
```bash
# In .github/workflows/ci.yml
- name: Run Repository Simulation
  run: node scripts/full-simulation.cjs
```

## Interpreting Results

### Green (Passed)
System component is working correctly:
```
✓ Total Skills Available
  64 skills registered
```

### Yellow (Warning)
Minor issue, system still functional:
```
⚠ Components Registry
  Found 9 components (expected 70+)
```

### Red (Failed)
Critical issue requiring attention:
```
✗ Brain MCP Orchestrator
  Brain MCP not found
```

## Current Known Issues

### Priority 1: Critical
**Brain MCP Not in Registry**
- Status: Failed
- Impact: High
- Fix: `npm run sync:mcps`

### Priority 2: High
**Empty Capability Graph**
- Status: Warning
- Impact: Medium
- Fix: `cd scripts/brain && npm run build-graph`

**Registry Synchronization**
- Status: Warning
- Impact: Medium
- Fix: `npm run validate:fix`

### Priority 3: Medium
**MCP Tools Property**
- Status: Warning
- Impact: Low
- Fix: Update MCP registry structure

## Integration with Other Tools

### With npm scripts
```bash
npm run validate  # Standard validation
node scripts/full-simulation.cjs  # Full simulation
```

### With Brain MCP
The simulation validates brain-mcp functionality:
- Skill selection
- Dependency resolution
- Graph queries
- Relationship mapping

### With Archon
Tests two-layer architecture:
- Strategic layer (Archon)
- Tactical layer (Skills)
- Execution layer (MCPs)

## Performance

- **Execution Time:** ~0.02 seconds
- **Tests Run:** 96
- **Resource Usage:** Minimal (file reads only)
- **No External Calls:** All local validation

## Maintenance

### Adding New Tests
Edit `scripts/full-simulation.cjs`:
```javascript
function simulateNewFeature() {
  section('SECTION X: New Feature Test');
  
  // Your test logic here
  recordResult('new_feature', 'Test Name', 'passed', {
    message: 'Test details'
  });
}
```

### Updating Expectations
Modify expected values:
```javascript
const registries = [
  { name: 'Skills', path: '...', expectedMin: 64 },  // Update here
  // ...
];
```

## Troubleshooting

### Simulation Fails to Run
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies if needed
npm install
```

### Results Don't Match Reality
```bash
# Sync registries first
npm run validate:fix

# Then run simulation
node scripts/full-simulation.cjs
```

### Permission Errors
```bash
# Make script executable
chmod +x scripts/full-simulation.cjs
```

## Documentation

- **Detailed Report:** `SIMULATION-FINDINGS-REPORT.md`
- **Quick Summary:** `SIMULATION-EXECUTIVE-SUMMARY.md`
- **Raw Data:** `SIMULATION-REPORT.json`
- **This Guide:** `scripts/SIMULATION-README.md`

## Version History

- **v1.0** (2025-11-08) - Initial comprehensive simulation
  - 11 test sections
  - 96 total tests
  - 81.3% success rate
  - JSON report generation

## Support

For issues or questions:
1. Check the detailed reports first
2. Review known issues above
3. Run `npm run validate` for standard checks
4. Open an issue in the repository

---

**Last Updated:** 2025-11-08  
**Version:** 1.0  
**Maintained By:** ai-dev-standards contributors
