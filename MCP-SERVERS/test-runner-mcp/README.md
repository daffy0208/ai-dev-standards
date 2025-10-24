# Test Runner MCP Server

Run tests, parse results, and generate coverage reports for multiple testing frameworks.

## What This MCP Does

- ▶️ **Run Tests** - Execute Vitest, Jest, Mocha, or other test runners
- 📊 **Parse Results** - Parse test output and extract pass/fail status
- 📈 **Coverage Reports** - Generate and analyze coverage reports
- 🔍 **Test Discovery** - Find and list test files
- ⚡ **Watch Mode** - Run tests in watch mode
- 🎯 **Targeted Testing** - Run specific test files or patterns

## Installation

```bash
cd MCP-SERVERS/test-runner-mcp
npm install
npm run build
```

## Setup

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["/path/to/test-runner-mcp/dist/index.js"]
    }
  }
}
```

## Tools

### 1. configure
Configure test runner settings.

```typescript
{
  framework: 'vitest' | 'jest' | 'mocha' | 'playwright';
  projectPath: string;
  testPattern?: string; // default: '**/*.{test,spec}.{js,ts,tsx}'
}
```

### 2. run_tests
Run tests and return results.

```typescript
{
  pattern?: string; // specific test files or pattern
  watch?: boolean;
  coverage?: boolean;
  bail?: boolean; // stop on first failure
}
```

Returns:
```json
{
  "framework": "vitest",
  "passed": 45,
  "failed": 2,
  "skipped": 0,
  "duration": 2.5,
  "coverage": {
    "statements": 85.2,
    "branches": 78.1,
    "functions": 90.5,
    "lines": 84.8
  },
  "failures": [
    {
      "file": "src/api.test.ts",
      "test": "should handle 404 errors",
      "error": "Expected 404, got 500"
    }
  ]
}
```

### 3. discover_tests
Find all test files.

```typescript
{
  pattern?: string;
}
```

### 4. run_single_test
Run a specific test file.

```typescript
{
  filePath: string;
  testName?: string; // specific test within file
}
```

### 5. generate_coverage
Generate coverage report.

```typescript
{
  format?: 'json' | 'html' | 'lcov' | 'text';
  outputPath?: string;
}
```

### 6. watch_tests
Run tests in watch mode.

```typescript
{
  pattern?: string;
}
```

## Usage Example

```javascript
// 1. Configure
await testRunner.configure({
  framework: 'vitest',
  projectPath: './my-project',
  testPattern: '**/*.test.ts'
});

// 2. Discover tests
const tests = await testRunner.discover_tests();
console.log(`Found ${tests.count} test files`);

// 3. Run all tests with coverage
const results = await testRunner.run_tests({
  coverage: true
});

console.log(`✅ ${results.passed} passed`);
console.log(`❌ ${results.failed} failed`);
console.log(`📊 Coverage: ${results.coverage.statements}%`);

// 4. Run specific test file
const singleResult = await testRunner.run_single_test({
  filePath: 'src/api.test.ts',
  testName: 'should handle 404 errors'
});

// 5. Generate HTML coverage report
await testRunner.generate_coverage({
  format: 'html',
  outputPath: './coverage'
});
```

## Supported Frameworks

### Vitest (Recommended)
- Fast, modern testing framework
- Built-in coverage with c8
- Watch mode with HMR
- TypeScript support

### Jest
- Most popular testing framework
- Extensive ecosystem
- Built-in mocking
- Snapshot testing

### Mocha
- Flexible, unopinionated
- Wide plugin support
- BDD/TDD styles

### Playwright
- E2E and integration tests
- Multiple browsers
- Visual regression testing

## Integration with Testing Strategist Skill

This MCP enables the `testing-strategist` skill by providing:
- Automated test execution
- Real-time test results
- Coverage analysis
- Test discovery

## Usage in Claude Code

```
User: "Run the tests and show me what failed"

Claude: *Uses test-runner MCP*

Results:
✅ 45 tests passed
❌ 2 tests failed
⏭️  0 tests skipped

Failures:
1. src/api.test.ts: "should handle 404 errors"
   Expected 404, got 500

2. src/auth.test.ts: "should validate JWT tokens"
   Token validation failed

Let me help you fix these failures...
```

## Best Practices

### Test Organization
- Group tests by feature/component
- Use descriptive test names
- Keep tests independent
- Clean up after tests

### Coverage Targets
- Aim for 80%+ statement coverage
- Focus on critical paths
- Don't chase 100% coverage
- Test behavior, not implementation

### Performance
- Run tests in parallel when possible
- Use watch mode during development
- Skip slow tests in CI (tag them)
- Cache test results

### CI Integration
- Run tests on every commit
- Block merge if tests fail
- Generate coverage reports
- Track coverage trends

## Output Formats

### JSON
Structured test results for programmatic use

### HTML
Interactive coverage reports with source highlighting

### LCOV
Coverage format for CI/CD integration

### Text
Terminal-friendly output with colors

## Error Handling

- **Test failures** - Return detailed failure info
- **Framework not found** - Clear setup instructions
- **Parse errors** - Show raw output for debugging
- **Timeout** - Configurable timeouts per framework

## Roadmap

- [ ] Integration with CI/CD platforms
- [ ] Test result caching
- [ ] Performance benchmarking
- [ ] Mutation testing support
- [ ] Test generation from types
- [ ] Flaky test detection

## Testing

```bash
npm test
```

## Related

- **Enables:** testing-strategist skill
- **Use case:** Test automation, CI/CD, TDD workflows
- **Integration:** Works with all major test frameworks

