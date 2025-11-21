# Validation System Deployment Guide

## Overview

The ai-dev-standards validation system is a comprehensive, portable testing framework that provides:

- **5-Phase Validation Pipeline**: Linting, Type Checking, Formatting, Unit Tests, E2E Tests
- **HTML Dashboard**: Interactive visualization of validation results
- **Historical Metrics**: Track code quality trends over time
- **Self-Correction**: Automatic retry logic and healing mechanisms
- **PIV Loop**: Plan-Implement-Verify automation

## Quick Start

### 1. Copy Validation Files to Your Repository

```bash
# From your target repository root
mkdir -p .claude/commands

# Copy the validation command
curl -o .claude/commands/validate.md \
  https://raw.githubusercontent.com/daffy0208/ai-dev-standards/main/.claude/commands/validate.md
```

### 2. Install Required Dependencies

```bash
npm install --save-dev \
  eslint \
  typescript \
  prettier \
  vitest \
  @vitest/ui
```

### 3. Add Validation Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 4. Run Validation

```bash
# In Claude Code, run:
/validate

# Or extract and run directly:
awk '/^```bash$/,/^```$/' .claude/commands/validate.md | grep -v '```' > /tmp/validate.sh
bash /tmp/validate.sh
```

## Customization

### Adjusting Phases for Your Project

The validation command has 5 main phases. Customize them based on your project needs:

#### Phase 1: Linting

Edit the lint command in your package.json:

```json
{
  "scripts": {
    // For React projects
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",

    // For Node.js projects
    "lint": "eslint . --ext .ts,.js --max-warnings 0",

    // Allow warnings during development
    "lint": "eslint ."
  }
}
```

#### Phase 2: Type Checking

Configure TypeScript strictness in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,           // Strict mode for production
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

#### Phase 3: Formatting

Customize Prettier rules in `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

#### Phase 4: Unit Tests

Configure coverage thresholds in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      lines: 80,      // Adjust based on your standards
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
})
```

#### Phase 5: E2E Tests

Customize based on your testing framework:

```bash
# For Playwright
npm run test:e2e

# For Cypress
npm run cypress:run

# For custom tests
npm run test:integration
```

### Project-Specific Phases

Edit `.claude/commands/validate.md` to add/remove phases:

```markdown
### 5.11: Custom Database Tests

Test database migrations and schema validation.

\`\`\`bash
echo ""
echo "🔍 Phase 5.11: Testing database migrations..."
npm run test:db
if [ $? -ne 0 ]; then
  echo "❌ Database tests failed!"
  exit 1
fi
echo "✅ Database tests passed!"
\`\`\`
```

## Configuration Options

### VALIDATION_CONTINUE_ON_FAILURE

For testing and development, you can allow validation to continue past failures:

```bash
export VALIDATION_CONTINUE_ON_FAILURE=true
/validate
```

**Use Cases:**
- Testing new validation phases
- Seeing complete validation output despite early failures
- Verifying Wave 2 features (dashboard, metrics)

**⚠️ Important:** Never use in production CI/CD. Always fix errors for production deployments.

### Coverage Thresholds

Adjust in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      // Strict for critical services
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,

      // Or relaxed for early development
      lines: 60,
      functions: 60,
      branches: 50,
      statements: 60
    }
  }
})
```

## Wave 2 Features

### HTML Dashboard

After validation, an interactive HTML dashboard is generated:

```bash
# View the dashboard
open .validation-report-TIMESTAMP.html
```

**Dashboard Features:**
- Real-time metrics visualization
- Phase-by-phase results
- Historical trend charts
- Coverage statistics
- Error summaries

### Historical Metrics

Metrics are tracked in `.validation-history/`:

```bash
.validation-history/
├── metrics-20250121-103045.json
├── metrics-20250121-154523.json
└── metrics-20250122-091234.json
```

**Tracked Metrics:**
- Test pass rates over time
- Coverage trends
- Lint warning trends
- Type error counts
- Build times

### Self-Correction Mechanisms

The validation system includes automatic retry logic:

1. **Retry on Transient Failures**: Network issues, Docker startup delays
2. **Auto-Healing**: Automatic fixes for common issues
3. **Progressive Backoff**: Intelligent retry timing

## Integration with CI/CD

### GitHub Actions

Create `.github/workflows/validate.yml`:

```yaml
name: Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run validation
        run: |
          awk '/^```bash$/,/^```$/' .claude/commands/validate.md | grep -v '```' > /tmp/validate.sh
          bash /tmp/validate.sh

      - name: Upload dashboard
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: validation-dashboard
          path: .validation-report-*.html

      - name: Upload metrics
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: validation-metrics
          path: .validation-history/
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
validate:
  stage: test
  image: node:20

  script:
    - npm ci
    - awk '/^```bash$/,/^```$/' .claude/commands/validate.md | grep -v '```' > /tmp/validate.sh
    - bash /tmp/validate.sh

  artifacts:
    when: always
    paths:
      - .validation-report-*.html
      - .validation-history/
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## Project Type Examples

### React/Next.js Project

```json
{
  "scripts": {
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

### Node.js API Project

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

### Python/FastAPI Project

Adapt the validation phases in `validate.md`:

```bash
## Phase 1: Linting

echo "🔍 Phase 1: Running linting..."
ruff check .
flake8 .

## Phase 2: Type Checking

echo "🔍 Phase 2: Running type check..."
mypy .

## Phase 3: Formatting

echo "🔍 Phase 3: Checking code formatting..."
black --check .
isort --check-only .

## Phase 4: Unit Tests

echo "🔍 Phase 4: Running tests with coverage..."
pytest --cov=. --cov-report=html --cov-report=term
```

## Troubleshooting

### "npm command not found"

Ensure Node.js is installed:

```bash
node --version
npm --version
```

### "Permission denied" when running validation

Make the script executable:

```bash
chmod +x /tmp/validate.sh
```

### Dashboard not generating

Check that all phases completed. The dashboard is generated at the end of Phase 5.

### Historical metrics not accumulating

Ensure `.validation-history/` directory has write permissions:

```bash
mkdir -p .validation-history
chmod 755 .validation-history
```

## Best Practices

1. **Run validation before committing**: Integrate with pre-commit hooks
2. **Track metrics over time**: Don't delete `.validation-history/`
3. **Review dashboards regularly**: Identify quality trends
4. **Customize for your team**: Adjust thresholds to match your standards
5. **Fix errors promptly**: Don't let technical debt accumulate

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/daffy0208/ai-dev-standards/issues
- Documentation: https://github.com/daffy0208/ai-dev-standards/docs

## Version Compatibility

- Node.js: ≥18.0.0
- npm: ≥9.0.0
- TypeScript: ≥5.0.0
- Vitest: ≥1.0.0

## License

MIT License - See LICENSE file for details
