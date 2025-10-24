# Code Quality Scanner MCP Server

Scan code quality, complexity, technical debt, and calculate maintainability metrics.

## What This MCP Does

- 🔍 **Complexity Analysis** - Cyclomatic complexity, cognitive complexity
- 📊 **Quality Metrics** - Maintainability index, code smells
- 🔄 **Duplication Detection** - Find duplicate code blocks
- 📈 **Trend Tracking** - Track quality over time
- ✅ **Rule Compliance** - ESLint, TSLint, custom rules
- 📝 **Technical Debt** - Calculate and track debt score

## Installation

```bash
cd MCP-SERVERS/code-quality-scanner-mcp
npm install && npm run build
```

## Tools

- `configure` - Set project path and quality thresholds
- `scan_complexity` - Analyze code complexity metrics
- `detect_duplication` - Find duplicate code blocks
- `calculate_debt` - Calculate technical debt score
- `run_linter` - Run ESLint/TSLint on codebase
- `generate_report` - Create quality report (JSON/HTML)
- `track_trends` - Compare quality metrics over time

## Usage Example

```javascript
await scanner.configure({ projectPath: './src', threshold: 'medium' });
const metrics = await scanner.scan_complexity();
console.log(`Maintainability Index: ${metrics.maintainability}/100`);
```

## Metrics

- **Cyclomatic Complexity** - Number of independent paths
- **Cognitive Complexity** - How hard code is to understand
- **Maintainability Index** - 0-100 score (>65 is good)
- **Lines of Code** - Physical, logical, comment lines
- **Duplication Rate** - % of duplicated code
- **Technical Debt Ratio** - Time to fix / development time

## Related

- **Enables:** quality-auditor skill
- **Use case:** Code reviews, refactoring, quality gates
