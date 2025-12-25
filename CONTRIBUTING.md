# Contributing to AI Dev Standards

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

---

## 🎯 Quick Start

**One-Command Setup:**

```bash
./scripts/setup-dev-environment.sh
```

This automatically:

- Installs all dependencies
- Sets up Git hooks for automation
- Validates your environment
- Runs initial generation
- You're ready to contribute!

**Manual Setup:**

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-dev-standards.git
   cd ai-dev-standards
   ```
3. **Run setup script**
   ```bash
   ./scripts/setup-dev-environment.sh
   ```
4. **Create a branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```
5. **Make your changes** (documentation auto-updates on commit!)
6. **Commit and push** (automation runs automatically)
7. **Create a Pull Request**

---

## 🤖 Automation System

**IMPORTANT:** This repository has full automation for documentation and registry maintenance.

### What Gets Auto-Updated

On every commit, the pre-commit hook automatically:

1. **Regenerates registries** from directory structure
   - Scans `skills/`, `mcp-servers/`, `tools/`, etc.
   - Updates all `meta/*.json` files

2. **Updates documentation** from registry data
   - Updates counts in README.md, INSTALL.md, etc.
   - Uses AUTO-GEN markers to identify sections
   - Stages updated files to your commit

3. **Validates everything** is in sync
   - Checks registries match directories
   - Checks documentation matches registries
   - Runs linting and type checking

### Key Rules

✅ **DO:**

- Add new skills to `skills/` directory
- Add new MCPs to `mcp-servers/` directory
- Let automation update documentation

❌ **DON'T:**

- Manually edit resource counts in documentation
- Manually edit registry files in `meta/`
- Skip automation (except emergencies)

**Result:** Documentation can NEVER drift - it's automatically maintained!

### Manual Automation Commands

```bash
# Regenerate everything
npm run generate:all

# Just registries
npm run generate:registries

# Just documentation
npm run generate:docs

# Validate sync
npm run validate:registries
npm run validate:docs
```

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

# Run the CLI & MCP suites (doctor/generate/update/setup/etc.)
npm run test:cli

# Run the code-execution docker smoke test (requires Docker)
npm run test:semantic-search:docker

# Run the semantic-search demo (indexes sample docs + search)
npm run demo:semantic-search

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

### 7. Testing CLI Commands

The CLI now exposes dependency-injected command factories (e.g., `createDoctorCommand`, `createUpdateCommand`) to make commands testable without hitting real file systems or shelling out. To add or update tests:

1. **Use the factory export** from `CLI/commands/<name>.js` and pass overrides for `fs`, `path`, `chalk`, `ora`, `inquirer`, etc.
2. **Operate inside temp directories** (`fs.mkdtempSync(path.join(os.tmpdir(), ...))`) so tests can create `.ai-dev.json`, `.claude/`, `.codex/`, etc. without polluting the repo.
3. **Mock prompts/spinners** by injecting stubbed `inquirer.prompt` responses and lightweight `ora` mocks (see `tests/cli/update-command.test.ts` for an example helper).
4. **Run the full CLI suite** via `npm run test:cli` so every PR exercises `doctor`, `analyze`, `setup`, `sync`, `init`, `context`, `update`, and the Semantic Search MCP smoke test.
5. **Avoid `process.chdir` in tests**—pass a custom `cwd()` dependency or adjust commands to accept paths instead of mutating global state.

Following this pattern keeps CLI behavior deterministic and ensures GitHub Actions enforces the same coverage you see locally.

### 8. Pre-Commit Hooks

The repository uses automated pre-commit hooks to maintain code quality and documentation consistency.

#### Installation

The hooks are automatically installed when you run `npm install` (via postinstall script).

To manually install or reinstall hooks:

```bash
npm run install-hooks
```

#### What the Pre-Commit Hook Does

The pre-commit hook runs automatically before each commit and performs:

1. **Documentation Validation** - Checks consistency across all documentation files
2. **ESLint** - Ensures code quality and style guidelines
3. **TypeScript Type Checking** - Validates type safety

If any check fails, the commit will be blocked with clear error messages.

#### Auto-Fixing Issues

Many validation and linting issues can be automatically fixed:

```bash
# Fix documentation issues
npm run validate:fix

# Fix linting issues
npm run lint:fix

# Run both
npm run validate:fix && npm run lint:fix
```

#### Skipping Validation (Emergency Use Only)

In emergencies, you can skip validation using either method:

**Method 1: In commit message**

```bash
git commit -m "emergency fix [skip-validation]"
```

**Method 2: Environment variable**

```bash
SKIP_VALIDATION=1 git commit -m "emergency fix"
```

**Warning:** Use skip validation sparingly. Skipped validations can introduce inconsistencies that may require manual fixes later.

#### Hook Execution Time

The pre-commit hook is optimized to run in under 5 seconds on most systems:

- Documentation validation: ~1-2 seconds
- ESLint: ~1-2 seconds
- TypeScript checking: ~1-2 seconds

#### Uninstalling Hooks

To remove the pre-commit hook:

```bash
rm .git/hooks/pre-commit
```

To restore it later:

```bash
npm run install-hooks
```

#### Troubleshooting

**Hook not running:**

- Ensure the hook is executable: `chmod +x .git/hooks/pre-commit`
- Check that you're in the repository root
- Try reinstalling: `npm run install-hooks`

**Hook too slow:**

- The hook should complete in under 5 seconds
- If slower, check for large file changes or network issues
- Consider using `[skip-validation]` for large refactors, then fix separately

**Existing custom hooks:**

- The installer detects existing hooks and offers to merge or backup
- Your custom hooks are backed up with timestamp: `.git/hooks/pre-commit.backup-YYYYMMDD-HHMMSS`
- You can manually merge hooks if needed

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

````typescript
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
````

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
api - caller - tool.ts
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
