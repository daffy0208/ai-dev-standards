# Testing Strategist - Quick Start

**Version:** 1.0.0
**Category:** Technical Development
**Difficulty:** Intermediate

## What This Skill Does

Helps you design and implement comprehensive testing strategies using the testing pyramid (70% unit, 20% integration, 10% E2E).

## When to Use

Use this skill when you need to:
- Set up testing for a new project
- Choose testing frameworks
- Decide what to test at which level
- Implement test-driven development (TDD)
- Improve code coverage
- Write unit, integration, or E2E tests
- Fix flaky tests

## Quick Start

**Fastest path to testing setup:**

1. **Choose frameworks:**
   - Unit/Integration: Jest (JavaScript/TypeScript) or pytest (Python)
   - React: React Testing Library
   - E2E: Playwright
2. **Follow the pyramid:** 70% unit, 20% integration, 10% E2E
3. **Coverage target:** 70% minimum, 80% goal
4. **Write tests for:**
   - Business logic (unit)
   - API endpoints (integration)
   - Critical user flows (E2E)

**Time to setup:** 1-2 hours

## File Structure

```
testing-strategist/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- Basic programming
- Understanding of your framework (React, Express, etc.)

**Tools:**
- Jest, Vitest, or pytest
- React Testing Library (for React)
- Playwright or Cypress (for E2E)

**Related Skills:**
- `frontend-builder` - React component testing
- `api-designer` - API testing patterns
- `security-engineer` - Security testing

## Success Criteria

You've successfully used this skill when:
- ✅ Testing pyramid established (70/20/10)
- ✅ Test frameworks configured
- ✅ Code coverage ≥ 70%
- ✅ Critical paths have tests
- ✅ Tests run in CI/CD
- ✅ Tests are fast and reliable

## Common Workflows

### Workflow 1: New Project Testing Setup
1. Install Jest + React Testing Library
2. Configure jest.config.js
3. Write first unit test
4. Add integration tests for APIs
5. Add Playwright for E2E
6. Configure CI/CD to run tests

### Workflow 2: Test-Driven Development
1. Write failing test (red)
2. Write minimal code to pass (green)
3. Refactor while keeping tests green
4. Repeat

### Workflow 3: Improve Coverage
1. Run `npm test -- --coverage`
2. Identify untested files
3. Add unit tests for business logic
4. Add integration tests for APIs
5. Target 70% coverage minimum

## Key Concepts

**Testing Pyramid:**
- Unit Tests (70%): Fast, isolated, test functions/components
- Integration Tests (20%): Test components together, APIs + DB
- E2E Tests (10%): Slow, test complete user flows

**What to Test:**
- ✅ Business logic, utilities, components
- ✅ API endpoints, database operations
- ✅ Critical user journeys
- ❌ Third-party libraries, framework internals

**Coverage Targets:**
- 70%: Minimum acceptable
- 80%: Good coverage
- 90%+: Diminishing returns

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the testing-strategist skill to..."
- Mention keywords: "testing", "unit tests", "E2E"

**Tests are slow?**
- Too many E2E tests (shift left to integration/unit)
- Not using parallel execution
- Inefficient setup/teardown

**Tests are flaky?**
- Using fragile selectors (E2E)
- Race conditions (add proper waits)
- Shared state between tests
- External dependencies not mocked

**Low coverage?**
- Not testing business logic
- Missing edge cases
- Too much code in components (extract to functions)

## Quick Reference

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // for React
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageThresholds: {
    global: { lines: 70 }
  }
}
```

### Common Commands
```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test
npm test Button.test.ts

# E2E tests
npx playwright test
```

### Test Anatomy (AAA Pattern)
```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = { x: 1, y: 2 }

  // Act - Execute the function
  const result = add(input.x, input.y)

  // Assert - Verify the outcome
  expect(result).toBe(3)
})
```

## Version History

- **1.0.0** (2025-10-22): Initial release, testing pyramid, TDD

## License

Part of ai-dev-standards repository.
