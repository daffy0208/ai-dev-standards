# CI/CD Quick Fix Guide

**Priority Actions Based on Codex Analysis**

## 🚨 CRITICAL FIXES (Do These First)

### 1. Fix Security Audit Bypass (ci.yml)

**Problem:** npm audit runs but never fails CI, allowing vulnerabilities to merge

**Location:** `.github/workflows/ci.yml` lines 134-136

**Fix:**
```yaml
- name: Run npm audit
  run: npm audit --audit-level=moderate
  # REMOVE: continue-on-error: true
```

**Also update line 268:**
```yaml
needs: [test, lint, typecheck, build, security, registry-validation]
```

### 2. Pin Codex CLI Version (ci.yml + codex-review.yml)

**Problem:** Installing @latest enables supply-chain attacks

**Locations:**
- `.github/workflows/ci.yml` line 240
- `.github/workflows/codex-review.yml` line 40

**Fix:**
```yaml
- name: Install Codex CLI
  run: npm install -g @anthropics/codex-cli@0.50.0
```

### 3. Fix Build Failure Masking (ci.yml + release.yml)

**Problem:** Build failures are hidden by `|| echo "No build script"`

**Locations:**
- `.github/workflows/ci.yml` line 117
- `.github/workflows/release.yml` line 40

**Fix:**
```yaml
- name: Build CLI
  run: |
    cd CLI
    npm ci
    if [ -f package.json ] && jq -e '.scripts.build' package.json > /dev/null; then
      npm run build
    else
      echo "No build script defined (this is expected)"
    fi
```

### 4. Stop Bypassing Lint/Format (ci.yml)

**Problem:** Lint and format errors don't fail CI

**Location:** `.github/workflows/ci.yml` lines 67, 71

**Fix:**
```yaml
- name: Run ESLint
  run: npm run lint
  # REMOVE: continue-on-error: true

- name: Check formatting
  run: npm run format:check
  # REMOVE: continue-on-error: true
```

### 5. Upgrade Codecov to v4 (ci.yml + coverage.yml)

**Problem:** Using deprecated v3, not SHA-pinned

**Locations:**
- `.github/workflows/ci.yml` line 40
- `.github/workflows/coverage.yml` line 31

**Fix:**
```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@e28ff129e5465c2c0dcc6f003fc735cb6ae0c673  # v4.5.0
  if: matrix.node-version == '20.x'
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: true
```

**Don't forget:** Add `CODECOV_TOKEN` to GitHub Secrets

## ⚡ HIGH PRIORITY (Do These Next)

### 6. Add Permissions Blocks (All Workflows)

**Add to ci.yml (top level, after `on:`):**
```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
```

**Add to codex-review.yml:**
```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
```

**Add to coverage.yml:**
```yaml
permissions:
  contents: read
  pull-requests: write
```

**Update release.yml (replace existing or add):**
```yaml
permissions: {}  # No default permissions

jobs:
  release:
    permissions:
      contents: write
      issues: write
      pull-requests: write
    # ... rest of job

  update-docs:
    permissions:
      contents: write
    # ... rest of job
```

### 7. Add Job Timeouts (ci.yml)

Add `timeout-minutes` to each job:

```yaml
test:
  timeout-minutes: 20
  # ... rest of job

lint:
  timeout-minutes: 10
  # ... rest of job

typecheck:
  timeout-minutes: 10
  # ... rest of job

build:
  timeout-minutes: 15
  # ... rest of job

security:
  timeout-minutes: 10
  # ... rest of job

registry-validation:
  timeout-minutes: 15
  # ... rest of job

codex-review:
  timeout-minutes: 15  # Already has this
  # ... rest of job

status:
  timeout-minutes: 5
  # ... rest of job
```

### 8. Pin GitHub Actions to SHAs (All Workflows)

Replace version tags with commit SHAs:

```yaml
# Replace:
uses: actions/checkout@v4
# With:
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

# Replace:
uses: actions/setup-node@v4
# With:
uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2

# Replace:
uses: actions/github-script@v7
# With:
uses: actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea  # v7.0.1

# Replace:
uses: actions/upload-artifact@v3
# With:
uses: actions/upload-artifact@5d5d22a31266ced268874388b861e4b58bb5c2f3  # v4.3.1
```

### 9. Add Concurrency Control (release.yml)

Add after `on:` section:

```yaml
concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false
```

### 10. Fix tsx Installation (weekly-brain-analysis.yml)

**Option 1 (Recommended):** Add to devDependencies
```bash
npm install -D tsx
```

Then remove the global install and use:
```yaml
- name: Run brain status check
  run: npx tsx scripts/brain/brain.ts status
```

**Option 2:** Pin the version
```yaml
- name: Install tsx
  run: npm install -g tsx@4.7.0
```

## 📋 Complete Checklist

- [ ] Remove `continue-on-error` from security audit (ci.yml:136)
- [ ] Add `security` to status job needs (ci.yml:268)
- [ ] Pin Codex CLI version in ci.yml (line 240)
- [ ] Pin Codex CLI version in codex-review.yml (line 40)
- [ ] Fix build masking in ci.yml (line 117)
- [ ] Fix build masking in release.yml (line 40)
- [ ] Remove `continue-on-error` from lint (ci.yml:68)
- [ ] Remove `continue-on-error` from format check (ci.yml:72)
- [ ] Upgrade Codecov to v4 in ci.yml (line 40)
- [ ] Upgrade Codecov to v4 in coverage.yml (line 31)
- [ ] Add CODECOV_TOKEN to GitHub Secrets
- [ ] Add permissions to ci.yml
- [ ] Add permissions to codex-review.yml
- [ ] Add permissions to coverage.yml
- [ ] Update permissions in release.yml
- [ ] Add timeout to test job (ci.yml)
- [ ] Add timeout to lint job (ci.yml)
- [ ] Add timeout to typecheck job (ci.yml)
- [ ] Add timeout to build job (ci.yml)
- [ ] Add timeout to security job (ci.yml)
- [ ] Add timeout to registry-validation job (ci.yml)
- [ ] Add timeout to status job (ci.yml)
- [ ] Pin actions/checkout to SHA in ci.yml
- [ ] Pin actions/setup-node to SHA in ci.yml
- [ ] Pin codecov/codecov-action to SHA in ci.yml
- [ ] Pin actions/checkout to SHA in codex-review.yml
- [ ] Pin actions/setup-node to SHA in codex-review.yml
- [ ] Pin actions/upload-artifact to SHA in codex-review.yml
- [ ] Pin actions/github-script to SHA in codex-review.yml
- [ ] Pin actions/checkout to SHA in coverage.yml
- [ ] Pin actions/setup-node to SHA in coverage.yml
- [ ] Pin codecov/codecov-action to SHA in coverage.yml
- [ ] Pin actions/upload-artifact to SHA in coverage.yml
- [ ] Pin actions/checkout to SHA in release.yml
- [ ] Pin actions/setup-node to SHA in release.yml
- [ ] Pin stefanzweifel/git-auto-commit-action to SHA in release.yml
- [ ] Pin actions/checkout to SHA in weekly-brain-analysis.yml
- [ ] Pin actions/setup-node to SHA in weekly-brain-analysis.yml
- [ ] Pin actions/github-script to SHA in weekly-brain-analysis.yml
- [ ] Pin actions/upload-artifact to SHA in weekly-brain-analysis.yml
- [ ] Add concurrency control to release.yml
- [ ] Pin tsx installation in weekly-brain-analysis.yml

## 🔍 Verification Steps

After making changes:

1. **Test locally first:**
   ```bash
   # Check YAML syntax
   yamllint .github/workflows/*.yml

   # Or use GitHub's action-validator
   docker run --rm -v $(pwd):/repo ghcr.io/rhysd/actionlint:latest
   ```

2. **Create a test PR:**
   - Create a new branch with your changes
   - Push and create a draft PR
   - Watch the workflow runs
   - Verify all jobs complete as expected

3. **Check specific fixes:**
   - Lint job should now FAIL on lint errors (not continue)
   - Security job should now FAIL on vulnerabilities
   - Build job should FAIL if build breaks (not echo success)
   - Codex CLI should install v0.50.0 specifically

4. **Monitor for 1 week:**
   - Check that weekly-brain-analysis runs successfully
   - Ensure releases still work
   - Verify coverage uploads to Codecov

## 📚 Reference Links

- [Full CI/CD Verification Report](./CI-CD-VERIFICATION-REPORT.md)
- [GitHub Actions Security Guide](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Pinning Actions to SHAs](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions)
- [Codecov v4 Migration](https://docs.codecov.com/docs/codecov-uploader)

## 🚀 Quick Apply All Fixes

Want to apply all fixes automatically? See the complete updated workflow files in the [CI/CD Verification Report](./CI-CD-VERIFICATION-REPORT.md).

**Estimated Time to Fix All:**
- Critical fixes: 30 minutes
- High priority fixes: 1 hour
- Total: ~1.5-2 hours
