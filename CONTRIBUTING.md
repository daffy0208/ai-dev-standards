# Contributing to AI Dev Standards

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

---

## 🎯 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-dev-standards.git
   cd ai-dev-standards
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```
5. **Make your changes**
6. **Run tests**
   ```bash
   npm test
   ```
7. **Commit and push**
8. **Create a Pull Request**

---

## 📋 Development Workflow

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Install CLI dependencies
cd CLI
npm install
cd ..
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### 3. Lint and Format

```bash
# Run ESLint
npm run lint

# Fix lint issues automatically
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format
```

### 4. Type Checking

```bash
# Run TypeScript compiler (no emit)
npm run typecheck
```

### 5. Run Full CI Locally

```bash
# Run all checks (lint, typecheck, test)
npm run ci
```

### 6. Validate and Sync

```bash
# Validate all counts and relationships
npm run validate

# Fix any validation errors automatically
npm run validate:fix

# Complete sync (fix + validate)
npm run sync

# Sync only skills
npm run sync:skills

# Sync only MCPs
npm run sync:mcps

# Update all documentation files
npm run update:all
```

**Important:** Always run `npm run validate` before committing. The pre-commit hook will block commits if validation fails.

---

## 🔀 Branching Strategy

We use **Git Flow** branching model:

- `main` - Production-ready code
- `develop` - Development branch (default)
- `feat/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions/improvements

### Branch Naming Convention

```bash
feat/add-new-integration       # New feature
fix/resolve-api-error          # Bug fix
docs/update-readme             # Documentation
refactor/improve-error-handler # Refactoring
test/add-validation-tests      # Tests
```

---

## 💬 Commit Message Convention

We follow **Conventional Commits** for automated versioning and changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature (triggers minor version bump)
- `fix:` - Bug fix (triggers patch version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Build system changes
- `ci:` - CI configuration changes
- `chore:` - Other changes (dependencies, etc.)
- `revert:` - Revert previous commit

### Examples

```bash
# Feature
feat(integrations): add PostgreSQL database tool

# Bug fix
fix(api-caller): handle timeout errors correctly

# Breaking change
feat(validation)!: change password schema requirements

BREAKING CHANGE: Password must now be 12 characters minimum

# Multiple changes
feat(tools): add web scraper and file system tools

- Added Playwright-based web scraper
- Added safe file system operations
- Updated README with usage examples
```

---

## 🧪 Testing Requirements

### All PRs Must Include Tests

- **New Features:** Add unit tests covering the new functionality
- **Bug Fixes:** Add regression tests
- **Refactoring:** Ensure existing tests pass

### Coverage Requirements

- **Minimum:** 75% overall coverage
- **Target:** 80% overall coverage
- **New code:** Should have 90%+ coverage

### Test Structure

```
tests/
├── unit/              # Unit tests (isolated, fast)
│   ├── utils/        # Utility tests
│   ├── tools/        # Tool tests
│   └── components/   # Component tests
└── integration/      # Integration tests (external services)
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should do something specific', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

---

## 📝 Documentation

### Required Documentation

1. **Code Comments**
   - JSDoc for public APIs
   - Inline comments for complex logic
   - Examples in docstrings

2. **README Updates**
   - Update relevant README files
   - Add usage examples
   - Update feature lists

3. **CHANGELOG**
   - Automatically generated from commits
   - Don't edit manually

### Documentation Style

```typescript
/**
 * Validates email address and returns lowercase version
 *
 * @param email - Email address to validate
 * @returns Lowercase email address
 * @throws {ValidationError} If email format is invalid
 *
 * @example
 * ```typescript
 * const email = validateEmail('Test@Example.com')
 * console.log(email) // 'test@example.com'
 * ```
 */
export function validateEmail(email: string): string {
  // Implementation
}
```

---

## 🔍 Code Review Process

### Before Submitting PR

- [ ] All tests pass locally
- [ ] Code is formatted (`npm run format`)
- [ ] No lint errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] **Validation passes** (`npm run validate`)
- [ ] **Relationship mapping updated** (if adding skills/MCPs)
- [ ] Followed commit message convention

### PR Template

```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks:** CI must pass
2. **Code Review:** At least 1 approval required
3. **Testing:** Reviewers may test locally
4. **Merge:** Squash and merge to keep history clean

---

## 🚀 Release Process

Releases are **fully automated** using semantic-release.

### How It Works

1. **Commit to `main`** (via PR merge)
2. **CI runs** all tests
3. **semantic-release** analyzes commits
4. **Version bump** based on commit types
5. **CHANGELOG** automatically generated
6. **GitHub release** created
7. **Git tag** created

### Version Bumping

- `feat:` → Minor version (1.0.0 → 1.1.0)
- `fix:` → Patch version (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version (1.0.0 → 2.0.0)

### Manual Release (Emergency)

```bash
# Only if automated release fails
npm run release
```

---

## 🐛 Reporting Issues

### Bug Reports

Use the **Bug Report** template and include:

- **Description:** Clear description of the issue
- **Steps to Reproduce:** Minimal reproduction steps
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** OS, Node version, etc.
- **Logs:** Relevant error messages

### Feature Requests

Use the **Feature Request** template and include:

- **Problem:** What problem does this solve?
- **Solution:** Proposed solution
- **Alternatives:** Other solutions considered
- **Additional Context:** Use cases, examples

---

## 📊 CI/CD Pipeline

### Automated Checks

Every PR triggers:

1. **Tests** on Node 18.x and 20.x
2. **Linting** (ESLint)
3. **Type Checking** (TypeScript)
4. **Formatting** (Prettier)
5. **Coverage** upload to Codecov
6. **Security Audit** (npm audit)

### Status Badges

Watch for these on your PR:

- ✅ **CI Passed** - All checks passed
- ❌ **CI Failed** - Fix issues before merge
- 📊 **Coverage** - Coverage change report

---

## 🎨 Code Style

### TypeScript

- Use **interfaces** for object shapes
- Use **types** for unions/intersections
- Prefer **explicit types** over `any`
- Use **async/await** over promises

### Formatting

- **Semi-colons:** No
- **Quotes:** Single quotes
- **Trailing comma:** None
- **Line width:** 100 characters
- **Tab width:** 2 spaces

### Naming Conventions

```typescript
// PascalCase for classes and types
class ApiClient {}
interface UserData {}

// camelCase for variables and functions
const userName = 'John'
function getUserData() {}

// UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3

// kebab-case for file names
api-caller-tool.ts
```

---

## 🆘 Getting Help

- **Questions:** Open a [Discussion](https://github.com/daffy0208/ai-dev-standards/discussions)
- **Bugs:** Open an [Issue](https://github.com/daffy0208/ai-dev-standards/issues)
- **Chat:** Join our community (coming soon)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort! 🚀

**Happy Coding!**
