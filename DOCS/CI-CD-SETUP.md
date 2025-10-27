# CI/CD Setup Guide

Complete guide for the automated CI/CD pipeline.

---

## 🎯 Overview

**ai-dev-standards** uses GitHub Actions for fully automated:
- ✅ Testing (unit + integration)
- ✅ Linting & formatting checks
- ✅ Type checking
- ✅ Code coverage reporting
- ✅ Security audits
- ✅ Automated releases
- ✅ Changelog generation

---

## 🚀 Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**

1. **Test** (Node 18.x, 20.x)
   - Runs all tests
   - Generates coverage report
   - Uploads to Codecov

2. **Lint**
   - Runs ESLint
   - Checks code formatting (Prettier)

3. **Type Check**
   - Runs TypeScript compiler
   - Validates all type definitions

4. **Build**
   - Builds CLI package
   - Verifies build succeeds

5. **Security**
   - Runs `npm audit`
   - Checks for known vulnerabilities

6. **Registry Validation**
   - Verifies all skills are registered
   - Checks CLI uses registry data
   - Validates README accuracy

7. **Codex Code Review** (PR only)
   - Automatically reviews changed code
   - Detects bugs, security vulnerabilities
   - Posts review comments on PR
   - Fails CI on HIGH/CRITICAL issues

8. **Status Check**
   - Aggregates all job results
   - Fails if any job fails

**Status:** ✅ All checks must pass to merge

---

### 2. Codex Automated Code Review (`.github/workflows/codex-review.yml`)

**Triggers:**
- Pull requests (opened, synchronized, reopened)

**Scope:**
- Reviews only changed files in:
  - `CLI/commands/**/*.js`
  - `scripts/brain/**/*.ts`
  - `scripts/**/*.js`
  - `src/**/*.js` and `src/**/*.ts`

**Process:**
1. Detects changed files in PR
2. Runs Codex CLI review in read-only sandbox
3. Analyzes for:
   - Logic errors and edge cases
   - Security vulnerabilities (SQL injection, XSS, etc.)
   - Error handling gaps
   - Resource leaks
   - Race conditions
   - Type safety violations
4. Categorizes findings by severity:
   - **CRITICAL**: Security vulnerabilities, hardcoded secrets
   - **HIGH**: Logic errors, missing error handling
   - **MEDIUM**: Code quality issues
   - **LOW**: Minor improvements
5. Posts results as PR comment
6. Fails CI if HIGH or CRITICAL issues found

**Requirements:**
- Codex CLI v0.50.0+
- Completes in <5 minutes
- GitHub token needs `comments:write` permission

**Helper Script:**
- `scripts/ci/codex-review.sh`
- Takes file list as arguments
- Outputs structured JSON
- Exit code 1 for HIGH/CRITICAL issues

**Example Output:**
```json
{
  "summary": {
    "files_reviewed": 3,
    "high_critical": 2,
    "medium": 1,
    "low": 0
  },
  "findings": [
    {
      "file": "CLI/commands/sync.js",
      "severity": "HIGH_CRITICAL",
      "issue": "CRITICAL: SQL injection vulnerability on line 45"
    }
  ]
}
```

**Status:** ⚠️ PR fails if HIGH or CRITICAL issues found

---

### 3. Coverage Workflow (`.github/workflows/coverage.yml`)

**Triggers:**
- Push to `main`
- Pull requests to `main`

**Actions:**
- Generates detailed coverage report
- Uploads to Codecov with visualizations
- Comments coverage changes on PRs
- Uploads coverage artifacts (30-day retention)

**Coverage Thresholds:**
```json
{
  "lines": 80,
  "functions": 80,
  "branches": 75,
  "statements": 80
}
```

**Status:** ⚠️ PR fails if coverage drops below threshold

---

### 4. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push to `main` (after PR merge)
- Ignores documentation-only changes

**Process:**
1. Runs full test suite
2. Builds project
3. Analyzes commit messages
4. Determines version bump
5. Updates CHANGELOG.md
6. Creates GitHub release
7. Creates git tag
8. Updates documentation

**Version Bumping:**
- `feat:` commits → Minor version (1.0.0 → 1.1.0)
- `fix:` commits → Patch version (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version (1.0.0 → 2.0.0)

**Status:** Fully automated, no manual intervention needed

---

## 🔧 Configuration Files

### ESLint (`.eslintrc.json`)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ]
}
```

**Rules:**
- TypeScript strict mode
- React hooks validation
- No unused variables
- Prefer const over let

---

### Prettier (`.prettierrc.json`)

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "none"
}
```

**Style:**
- No semicolons
- Single quotes
- 100 character line width
- No trailing commas

---

### Semantic Release (`.releaserc.json`)

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

**Commit Convention:**
- Follows [Conventional Commits](https://www.conventionalcommits.org/)
- Automatic CHANGELOG generation
- GitHub release notes

---

## 📊 Status Badges

Add these to your README to show build status:

```markdown
[![CI](https://github.com/daffy0208/ai-dev-standards/actions/workflows/ci.yml/badge.svg)](https://github.com/daffy0208/ai-dev-standards/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/daffy0208/ai-dev-standards/branch/main/graph/badge.svg)](https://codecov.io/gh/daffy0208/ai-dev-standards)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

**Result:**

![CI](https://github.com/daffy0208/ai-dev-standards/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-75%25-yellowgreen)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 🔑 Required Secrets

### GitHub Repository Secrets

Navigate to: **Settings → Secrets and variables → Actions**

1. **`CODECOV_TOKEN`** (Optional, recommended)
   - Get from: https://codecov.io/
   - Improves coverage upload reliability

2. **`NPM_TOKEN`** (Optional, for npm publish)
   - Get from: https://www.npmjs.com/
   - Only needed if publishing to npm

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions.

---

## 🚦 Branch Protection Rules

### Recommended Settings for `main` branch:

1. **Require status checks to pass**
   - ✅ Test (Node 18.x)
   - ✅ Test (Node 20.x)
   - ✅ Lint
   - ✅ Type Check
   - ✅ Build
   - ✅ Codex Code Review (PR only)
   - ✅ Registry Validation

2. **Require pull request reviews**
   - Minimum: 1 approval
   - Dismiss stale reviews on push

3. **Require linear history**
   - Use "Squash and merge"

4. **Do not allow bypassing**
   - No force pushes
   - No deletions

### Setup Instructions:

1. Go to: **Settings → Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable protection rules above
5. Save changes

---

## 🔄 Workflow Triggers

### Automatic Triggers

| Event | Workflows |
|-------|-----------|
| Push to `main` | CI, Coverage, Release |
| Push to `develop` | CI |
| Pull Request | CI, Coverage, Codex Review |
| Schedule (daily) | Security Audit |

### Manual Triggers

You can manually trigger workflows from GitHub UI:

1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**
4. Choose branch
5. Click **Run workflow** button

---

## 📝 Commit Message Format

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature → Minor version bump
- `fix:` - Bug fix → Patch version bump
- `docs:` - Documentation → No version bump
- `style:` - Formatting → No version bump
- `refactor:` - Code refactoring → Patch version bump
- `test:` - Tests → No version bump
- `chore:` - Maintenance → No version bump

### Breaking Changes

```
feat(api)!: change authentication method

BREAKING CHANGE: JWT tokens are now required instead of API keys
```

Result: Major version bump (1.0.0 → 2.0.0)

### Examples

```bash
# Feature
feat(tools): add database query tool with PostgreSQL support

# Bug fix
fix(api-caller): prevent memory leak in retry logic

# Documentation
docs(readme): update installation instructions

# Multiple commits (will create one release)
feat(integrations): add Stripe payment integration
feat(components): add payment form component
fix(validation): handle edge case in email validator
```

---

## 🐛 Troubleshooting

### CI Failing

**Test failures:**
```bash
# Run tests locally
npm test

# Debug specific test
npm run test:watch -- validation.test.ts
```

**Lint errors:**
```bash
# Check what's wrong
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Type errors:**
```bash
# Check type errors
npm run typecheck
```

**Coverage below threshold:**
```bash
# See coverage report
npm run test:coverage

# View detailed HTML report
open coverage/index.html
```

**Codex review failures:**
```bash
# Test locally before pushing
chmod +x scripts/ci/codex-review.sh
./scripts/ci/codex-review.sh CLI/commands/sync.js

# Run on multiple files
./scripts/ci/codex-review.sh $(git diff --name-only main... | grep -E '\.(js|ts)$')

# Check results
cat codex-review-results.json | jq '.'
```

---

### Testing Codex Review Locally

Before creating a PR, test the review workflow:

```bash
# 1. Install Codex CLI if not already installed
npm install -g @anthropics/codex-cli@latest

# 2. Make your changes to code files
vim CLI/commands/my-command.js

# 3. Run review on changed files
./scripts/ci/codex-review.sh CLI/commands/my-command.js

# 4. Review the findings
cat codex-review-results.json | jq '.summary'

# 5. Fix HIGH/CRITICAL issues before committing
# (MEDIUM and LOW issues are warnings only)
```

**Expected Results:**
- Exit code 0: No HIGH/CRITICAL issues
- Exit code 1: HIGH/CRITICAL issues found (CI will fail)
- Exit code 2: Script error (check Codex installation)

---

### Release Not Triggered

**Check commit messages:**
- Ensure using conventional format
- Must have `feat:` or `fix:` for release
- Docs/style/test commits don't trigger releases

**Check branch:**
- Releases only from `main` branch
- Ensure PR was merged, not just pushed

**Check logs:**
- Go to Actions tab
- Check Release workflow logs
- Look for errors in semantic-release

---

### Coverage Not Uploading

**Missing Codecov token:**
1. Sign up at https://codecov.io/
2. Add repository
3. Copy token
4. Add as `CODECOV_TOKEN` secret

**Workaround:**
- Coverage will still work without token
- Token improves reliability and features

---

## 📚 Resources

### Documentation

- [GitHub Actions](https://docs.github.com/en/actions)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Codecov](https://docs.codecov.com/)

### Useful Commands

```bash
# Run full CI locally
npm run ci

# Run individual checks
npm test
npm run lint
npm run typecheck

# Preview what release would do
npx semantic-release --dry-run
```

---

## 🎯 Best Practices

### 1. Always Run CI Locally First

Before pushing:
```bash
npm run ci
```

### 2. Write Good Commit Messages

```bash
# ✅ Good
feat(auth): add OAuth2 support for Google login

# ❌ Bad
update stuff
fix bug
WIP
```

### 3. Keep PRs Focused

- One feature/fix per PR
- Small, reviewable changes
- All tests pass

### 4. Monitor CI/CD

- Watch Actions tab after push
- Fix failures quickly
- Don't merge on red CI

### 5. Review Changelogs

- Check generated CHANGELOG.md
- Verify version bumps are correct
- Ensure release notes are clear

---

## 🚀 What Happens on Merge?

1. **PR merged to `main`**
   ```
   User clicks "Squash and merge"
   ```

2. **CI runs** (2-3 minutes)
   ```
   ✅ Tests pass
   ✅ Lint passes
   ✅ Types check
   ✅ Build succeeds
   ```

3. **semantic-release analyzes commits** (30 seconds)
   ```
   Found: feat(tools): add new tool
   Decision: Bump minor version
   Current: 1.2.3 → New: 1.3.0
   ```

4. **Updates files**
   ```
   ✅ package.json → version: 1.3.0
   ✅ CHANGELOG.md → added entry
   ✅ Git tag → v1.3.0 created
   ```

5. **Creates GitHub release**
   ```
   ✅ Release notes generated
   ✅ Assets attached
   ✅ Published
   ```

6. **Documentation updated**
   ```
   ✅ BUILD-STATUS.md date updated
   ```

**Total time:** ~4-5 minutes from merge to release! 🚀

---

## ✅ Checklist for New Contributors

Before first contribution:

- [ ] Read [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] Understand commit message convention
- [ ] Set up local development environment
- [ ] Run `npm run ci` successfully locally
- [ ] Fork repository
- [ ] Create feature branch
- [ ] Make changes with tests
- [ ] Commit with conventional format
- [ ] Push and create PR
- [ ] Wait for CI to pass
- [ ] Address review feedback
- [ ] Celebrate when merged! 🎉

---

**Your contributions power this project. Thank you!** 🙏

---

**Updated:** 2025-10-27
