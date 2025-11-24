# Validation System - Quick Start

## 1-Minute Setup

### Install

```bash
# Option 1: One-line install (recommended)
curl -fsSL https://raw.githubusercontent.com/daffy0208/ai-dev-standards/main/INSTALLERS/install-validation-system.sh | bash

# Option 2: Download and run
curl -O https://raw.githubusercontent.com/daffy0208/ai-dev-standards/main/INSTALLERS/install-validation-system.sh
chmod +x install-validation-system.sh
./install-validation-system.sh

# Option 3: With custom GitHub org/repo
export VALIDATION_GITHUB_ORG="your-org"
export VALIDATION_GITHUB_REPO="your-repo"
export VALIDATION_GITHUB_BRANCH="main"
curl -fsSL https://raw.githubusercontent.com/daffy0208/ai-dev-standards/main/INSTALLERS/install-validation-system.sh | bash
```

### Run

````bash
# In Claude Code
/validate

# Or directly
awk '/^```bash$/,/^```$/' .claude/commands/validate.md | grep -v '```' | bash
````

### View Results

```bash
# Open HTML dashboard (generated after validation completes)
open .validation-report-*.html

# Check historical metrics
ls .validation-history/
```

## What Gets Validated?

✅ **Phase 1**: ESLint - Code quality and style
✅ **Phase 2**: TypeScript - Type safety
✅ **Phase 3**: Prettier - Code formatting
✅ **Phase 4**: Vitest - Unit tests + coverage
✅ **Phase 5**: E2E tests, integration tests, custom validations

## Customize for Your Project

Edit `.claude/commands/validate.md` to:

- Add/remove validation phases
- Adjust coverage thresholds
- Add custom test suites
- Configure for different frameworks

## Common Use Cases

### Frontend (React/Next.js)

```bash
# Already configured! Just run:
/validate
```

### Backend (Node.js API)

```bash
# Add to package.json:
"test:integration": "vitest run --config vitest.integration.config.ts"

# Then customize Phase 5 in validate.md
```

### Monorepo

```bash
# Run validation in each package:
for pkg in packages/*; do
  cd $pkg && /validate
done
```

## Testing Mode

To see full validation results even with errors:

```bash
export VALIDATION_CONTINUE_ON_FAILURE=true
/validate
```

⚠️ Use only for development/testing - never in CI/CD!

## CI/CD Integration

### GitHub Actions

````yaml
- name: Run Validation
  run: |
    awk '/^```bash$/,/^```$/' .claude/commands/validate.md | grep -v '```' > validate.sh
    bash validate.sh
````

### GitLab CI

````yaml
validate:
  script:
    - awk '/^```bash$/,/^```$/' .claude/commands/validate.md | grep -v '```' > validate.sh
    - bash validate.sh
````

## Troubleshooting

**"npm command not found"**
→ Install Node.js ≥18.0.0

**"Permission denied"**
→ `chmod +x validate.sh`

**Dashboard not generating**
→ Ensure all phases complete (check for early exits)

**Historical metrics missing**
→ Create directory: `mkdir -p .validation-history`

## Next Steps

1. ✅ Run validation once to establish baseline
2. 📊 Review HTML dashboard
3. ⚙️ Customize thresholds in config files
4. 🔄 Integrate with CI/CD
5. 📈 Track metrics over time

## Full Documentation

- **Deployment Guide**: [VALIDATION-DEPLOYMENT-GUIDE.md](./VALIDATION-DEPLOYMENT-GUIDE.md)
- **Configuration Examples**: [examples/](../examples/)
- **Troubleshooting**: [VALIDATION-DEPLOYMENT-GUIDE.md#troubleshooting](./VALIDATION-DEPLOYMENT-GUIDE.md#troubleshooting)

## Support

- 📝 [GitHub Issues](https://github.com/daffy0208/ai-dev-standards/issues)
- 📚 [Full Documentation](./VALIDATION-DEPLOYMENT-GUIDE.md)
- 💬 [Discussions](https://github.com/daffy0208/ai-dev-standards/discussions)
