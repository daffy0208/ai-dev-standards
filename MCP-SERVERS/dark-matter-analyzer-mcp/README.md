# Dark Matter Analyzer MCP

MCP server for repository coherence analysis and organizational health insights.

## Overview

The Dark Matter Analyzer MCP provides automated tools for analyzing repositories to reveal unseen patterns, strategic drift, and organizational health issues that traditional code quality metrics miss.

## Installation

```bash
npm install
npm run build
```

## Tools Provided

### 1. `scan_repository`

Scan repository to gather signals and metrics for Dark Matter analysis.

**Parameters:**
- `path` (required): Path to repository root
- `depth`: Analysis depth - `quick`, `medium`, or `deep` (default: `medium`)
- `include_patterns`: File patterns to include (e.g., `["*.ts", "*.md"]`)
- `exclude_patterns`: Patterns to exclude (e.g., `["node_modules", "dist"]`)

**Returns:**
- Repository metrics (file counts, ratios, debt markers)
- Pattern detection results
- Timestamp and metadata

**Example:**
```javascript
{
  path: "./my-project",
  depth: "deep",
  exclude_patterns: ["node_modules", "dist", ".git"]
}
```

### 2. `calculate_rci`

Calculate Repository Coherence Index (RCI) score.

**Parameters:**
- `repository_path`: Path to repository (uses last scanned if omitted)

**Returns:**
- Overall RCI score (0-100)
- Component scores: Intent Alignment, Task Reality Sync, Technical Health
- Status: COHERENT, MONITOR, MISALIGNED, or INCOHERENT

**Example:**
```javascript
{
  repository_path: "./my-project"
}
```

### 3. `detect_patterns`

Detect organizational patterns and weak signals.

**Parameters:**
- `focus`: Pattern focus area - `all`, `documentation`, `execution`, `drift`, or `suppression` (default: `all`)

**Returns:**
- List of detected patterns with severity, interpretation, confidence, and evidence

**Example:**
```javascript
{
  focus: "documentation"
}
```

### 4. `generate_report`

Generate comprehensive Dark Matter analysis report.

**Parameters:**
- `format`: Output format - `markdown`, `json`, or `text` (default: `markdown`)
- `output_path`: Path to save report (optional, returns inline if omitted)
- `include_sections`: Sections to include (default: all)

**Returns:**
- Formatted report with all analysis layers

**Example:**
```javascript
{
  format: "markdown",
  output_path: "./dark_matter_report.md"
}
```

### 5. `analyze_documentation`

Analyze documentation patterns for inflation, redundancy, and coherence.

**Parameters:**
- `path` (required): Path to documentation directory

**Returns:**
- Documentation metrics
- Inflation risk assessment
- File-by-file analysis

**Example:**
```javascript
{
  path: "./docs"
}
```

### 6. `check_coherence`

Quick coherence check between stated intent and observed behavior.

**Parameters:**
- `readme_path` (required): Path to README file
- `repository_path` (required): Path to repository root

**Returns:**
- Coherence checks
- Warning messages for detected issues

**Example:**
```javascript
{
  readme_path: "./README.md",
  repository_path: "./"
}
```

## Pattern Types Detected

### Documentation Inflation
- **Signal:** Many documentation files with high average length
- **Severity:** Medium to High
- **Interpretation:** Planning outpaces execution; over-planning or avoidance

### Execution Deficit
- **Signal:** High doc-to-code ratio (>0.5)
- **Severity:** High to Critical
- **Interpretation:** More documentation than implementation; aspirational vs actionable

### Suppression Pattern
- **Signal:** High count of TODO/FIXME/HACK markers
- **Severity:** Medium to High
- **Interpretation:** Time pressure, fatigue, or incomplete implementations

### Test Deficiency
- **Signal:** Low test-to-code ratio (<0.3)
- **Severity:** Medium to High
- **Interpretation:** Rushed implementation or avoidance of validation

## RCI Score Interpretation

| Score | Status | Meaning |
|-------|--------|---------|
| 85-100 | ✅ COHERENT | Healthy, aligned, sustainable rhythm |
| 70-84 | 🟡 MONITOR | Early drift present, watch for patterns |
| 50-69 | 🟠 MISALIGNED | Intent and reality diverging, realignment needed |
| <50 | 🔴 INCOHERENT | Major realignment required, context rebuild needed |

## Usage with Claude

This MCP integrates seamlessly with the `dark-matter-analyzer` skill. When users ask Claude to analyze repository health, Claude will automatically use this MCP to perform the analysis.

```
"Analyze this repository using Dark Matter Mode"
"Calculate our RCI score"
"Detect patterns in our documentation"
"Generate a Dark Matter report"
```

## Running the Server

```bash
# Development mode with watch
npm run dev

# Production mode
npm run build
npm start

# Run tests
npm test
```

## Configuration

The server runs via stdio transport and is designed to be invoked by MCP-compatible clients like Claude Desktop.

Add to your MCP configuration:
```json
{
  "mcpServers": {
    "dark-matter-analyzer": {
      "command": "node",
      "args": ["/path/to/dark-matter-analyzer-mcp/dist/index.js"]
    }
  }
}
```

## Development

### Project Structure
```
dark-matter-analyzer-mcp/
├── src/
│   ├── index.ts          # Main server implementation
│   └── index.test.ts     # Test suite
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Adding New Patterns

To add new pattern detection:

1. Add pattern type to `scanPatterns()` method
2. Define detection logic with evidence collection
3. Add severity classification
4. Include confidence score
5. Write interpretation

### Testing

Tests validate:
- Pattern detection logic
- RCI calculation accuracy
- Severity classification
- Edge case handling
- Real-world scenarios

Run tests:
```bash
npm test
```

## Examples

### Quick Health Check
```javascript
// Scan repository
await mcp.call('scan_repository', {
  path: './my-project',
  depth: 'quick'
});

// Get RCI
await mcp.call('calculate_rci', {});
```

### Deep Analysis with Report
```javascript
// Deep scan
await mcp.call('scan_repository', {
  path: './my-project',
  depth: 'deep',
  exclude_patterns: ['node_modules', 'dist', '.git']
});

// Detect patterns
const patterns = await mcp.call('detect_patterns', {
  focus: 'all'
});

// Generate report
await mcp.call('generate_report', {
  format: 'markdown',
  output_path: './dark_matter_report.md'
});
```

### Documentation Analysis
```javascript
await mcp.call('analyze_documentation', {
  path: './docs'
});
```

### Coherence Check
```javascript
await mcp.call('check_coherence', {
  readme_path: './README.md',
  repository_path: './'
});
```

## Metrics Collected

- **Total files** in repository
- **Code files** (ts, js, py, java, go, rs, cpp, c)
- **Documentation files** (.md)
- **Test files** (*.test.*, *.spec.*)
- **Doc-to-code ratio**
- **Average documentation length**
- **Technical debt markers** (TODO, FIXME, HACK, XXX)

## Integration with ai-dev-standards

This MCP is part of the ai-dev-standards framework and works with:

- **dark-matter-analyzer** skill - Provides methodology and interpretation
- **quality-auditor** skill - Technical quality assessment
- **mvp-builder** skill - Execution-focused development
- **product-strategist** skill - Strategic alignment

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Tests pass (`npm test`)
- TypeScript compiles (`npm run build`)
- New patterns include interpretation and confidence scores
- Documentation is updated

---

*"Dark Matter Mode remains a mirror — it does not predict, it illuminates."*
