# Validation Configuration Templates

Pre-configured validation setups for different project types.

## Available Templates

### 1. React/Next.js (`react-nextjs.json`)

**For:** Frontend applications using React or Next.js

**Includes:**
- Next.js ESLint configuration
- React Testing Library setup
- Playwright for E2E testing
- JSX/TSX support
- DOM environment for tests

**Coverage Targets:** 80% lines/functions, 75% branches

### 2. Node.js API (`nodejs-api.json`)

**For:** Backend REST/GraphQL APIs using Express, Fastify, etc.

**Includes:**
- Node.js environment configuration
- Supertest for API testing
- Integration test setup
- Explicit return types enforced

**Coverage Targets:** 85% lines/functions, 80% branches

### 3. TypeScript Library (`typescript-library.json`)

**For:** Published npm packages and reusable libraries

**Includes:**
- Strict TypeScript configuration
- Type declaration generation
- Source maps for debugging
- Prepublish validation hooks
- No explicit `any` allowed

**Coverage Targets:** 90% lines/functions, 85% branches

## Usage

### Option 1: Manual Configuration

1. Choose your project type template
2. Copy relevant sections to your project files:
   - `packageJson.scripts` → `package.json`
   - `eslintrc` → `.eslintrc.json`
   - `tsconfig` → `tsconfig.json`
   - `vitestConfig` → `vitest.config.ts`
   - `prettier` → `.prettierrc`

### Option 2: Automated Setup

Use the installer with auto-detection:

```bash
./install-validation-system.sh
```

The installer detects your project type and applies the appropriate template.

### Option 3: Custom Configuration

Mix and match from different templates:

```bash
# Start with React base
cp react-nextjs.json my-config.json

# But use stricter coverage from library template
# Edit my-config.json to use 90% coverage targets
```

## Configuration Guide

### Adjusting Coverage Thresholds

Edit the `vitestConfig.test.coverage` section:

```json
{
  "lines": 80,      // Minimum line coverage %
  "functions": 80,  // Minimum function coverage %
  "branches": 75,   // Minimum branch coverage %
  "statements": 80  // Minimum statement coverage %
}
```

**Recommendations:**
- **Startups/MVPs:** 60-70% (move fast)
- **Production Apps:** 80-85% (balanced)
- **Critical Systems:** 90%+ (high reliability)
- **Open Source Libraries:** 90%+ (community trust)

### ESLint Rules Customization

Common rule adjustments:

```json
{
  "rules": {
    // Allow console in development
    "no-console": ["warn", { "allow": ["warn", "error"] }],

    // Require explicit return types (strict)
    "@typescript-eslint/explicit-function-return-type": "error",

    // Or make it optional (relaxed)
    "@typescript-eslint/explicit-function-return-type": "off",

    // Warn on unused vars but allow _ prefix
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ]
  }
}
```

### TypeScript Strictness Levels

**Strict (Libraries & Critical Systems):**
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true
}
```

**Moderate (Most Applications):**
```json
{
  "strict": true,
  "noUnusedLocals": false,
  "noUnusedParameters": false
}
```

**Relaxed (Rapid Prototyping):**
```json
{
  "strict": false,
  "noImplicitAny": false
}
```

### Test Environment Configuration

**Frontend (Browser):**
```json
{
  "test": {
    "environment": "jsdom",
    "setupFiles": ["./tests/setup.ts"]
  }
}
```

**Backend (Node.js):**
```json
{
  "test": {
    "environment": "node"
  }
}
```

**Universal (Both):**
```json
{
  "test": {
    "environment": "node",
    "environmentMatchGlobs": [
      ["**/*.browser.test.ts", "jsdom"]
    ]
  }
}
```

## Migration Guide

### From Jest to Vitest

1. Replace Jest dependencies:
   ```bash
   npm uninstall jest @types/jest
   npm install --save-dev vitest @vitest/coverage-v8
   ```

2. Update test scripts:
   ```json
   {
     "test": "vitest run",
     "test:watch": "vitest",
     "test:coverage": "vitest run --coverage"
   }
   ```

3. Rename `jest.config.js` to `vitest.config.ts`

4. Update imports in tests:
   ```typescript
   // Before (Jest)
   import { describe, it, expect } from '@jest/globals'

   // After (Vitest)
   import { describe, it, expect } from 'vitest'
   ```

### From ESLint 8 to ESLint 9

ESLint 9 uses flat config format. See migration guide:
https://eslint.org/docs/latest/use/migrate-to-9.0.0

## Project-Specific Additions

### Monorepo (Turborepo/Nx)

Add root-level validation:

```json
{
  "scripts": {
    "validate:all": "turbo run validate",
    "validate:affected": "nx affected:test"
  }
}
```

### GraphQL API

Add schema validation:

```json
{
  "scripts": {
    "validate:schema": "graphql-schema-linter schema.graphql",
    "validate:operations": "graphql-inspector diff"
  }
}
```

### Docker/Kubernetes

Add deployment validation:

```json
{
  "scripts": {
    "validate:docker": "hadolint Dockerfile",
    "validate:k8s": "kubectl apply --dry-run=client -f k8s/"
  }
}
```

## Support

- **Issues:** [GitHub Issues](https://github.com/daffy0208/ai-dev-standards/issues)
- **Discussions:** [GitHub Discussions](https://github.com/daffy0208/ai-dev-standards/discussions)
- **Docs:** [Deployment Guide](../../DOCS/VALIDATION-DEPLOYMENT-GUIDE.md)
