#!/bin/bash

# Validation System Installer
# Deploys the ai-dev-standards validation system to any repository

set -e

echo "🚀 Installing ai-dev-standards Validation System"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  echo "❌ Error: Not in a git repository root"
  echo "   Please run this script from your repository root directory"
  exit 1
fi

echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js ≥18.0.0"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version too old. Please upgrade to ≥18.0.0 (current: $(node -v))"
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found"
  exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) found${NC}"
echo ""

# Determine project type
echo -e "${BLUE}🔍 Detecting project type...${NC}"

PROJECT_TYPE="generic"
if [ -f "package.json" ]; then
  if grep -q "\"next\"" package.json; then
    PROJECT_TYPE="nextjs"
  elif grep -q "\"react\"" package.json; then
    PROJECT_TYPE="react"
  elif grep -q "\"express\"" package.json || grep -q "\"fastify\"" package.json; then
    PROJECT_TYPE="nodejs-api"
  fi
fi

echo -e "${GREEN}✅ Detected project type: $PROJECT_TYPE${NC}"
echo ""

# Create directory structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"

mkdir -p .claude/commands
mkdir -p .validation-history

echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Download validation command
echo -e "${BLUE}📄 Downloading validation command...${NC}"

# Default to GitHub (change this to your organization/repo)
GITHUB_ORG="${VALIDATION_GITHUB_ORG:-YOUR_ORG}"
GITHUB_REPO="${VALIDATION_GITHUB_REPO:-ai-dev-standards}"
GITHUB_BRANCH="${VALIDATION_GITHUB_BRANCH:-main}"

VALIDATION_URL="https://raw.githubusercontent.com/${GITHUB_ORG}/${GITHUB_REPO}/${GITHUB_BRANCH}/.claude/commands/validate.md"

if command -v curl &> /dev/null; then
  if curl -fsSL "$VALIDATION_URL" -o .claude/commands/validate.md; then
    echo -e "${GREEN}✅ Validation command downloaded${NC}"
  else
    echo -e "${YELLOW}⚠️  Could not download validation command from: $VALIDATION_URL${NC}"
    echo "   Please set VALIDATION_GITHUB_ORG, VALIDATION_GITHUB_REPO, and VALIDATION_GITHUB_BRANCH"
    echo "   Or manually copy .claude/commands/validate.md to your project"
    exit 1
  fi
elif command -v wget &> /dev/null; then
  if wget -q "$VALIDATION_URL" -O .claude/commands/validate.md; then
    echo -e "${GREEN}✅ Validation command downloaded${NC}"
  else
    echo -e "${YELLOW}⚠️  Could not download validation command from: $VALIDATION_URL${NC}"
    echo "   Please set VALIDATION_GITHUB_ORG, VALIDATION_GITHUB_REPO, and VALIDATION_GITHUB_BRANCH"
    echo "   Or manually copy .claude/commands/validate.md to your project"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Neither curl nor wget found${NC}"
  echo "   Please install curl or wget, or manually copy .claude/commands/validate.md"
  exit 1
fi

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing validation dependencies...${NC}"

if [ -f "package.json" ]; then
  npm install --save-dev eslint typescript prettier vitest @vitest/ui @vitest/coverage-v8
  echo -e "${GREEN}✅ Dependencies installed${NC}"
else
  echo -e "${YELLOW}⚠️  No package.json found${NC}"
  echo "   Please create a package.json first with: npm init -y"
  exit 1
fi

echo ""

# Add scripts to package.json if they don't exist
echo -e "${BLUE}⚙️  Configuring validation scripts...${NC}"

# Check if scripts exist
NEEDS_SCRIPTS=false

if ! grep -q '"lint"' package.json; then
  NEEDS_SCRIPTS=true
fi

if [ "$NEEDS_SCRIPTS" = true ]; then
  echo -e "${YELLOW}⚠️  Adding validation scripts to package.json${NC}"
  echo "   Please manually add these scripts to your package.json:"
  echo ""
  echo '  "scripts": {'
  echo '    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",'
  echo '    "typecheck": "tsc --noEmit",'
  echo '    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",'
  echo '    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",'
  echo '    "test": "vitest run",'
  echo '    "test:coverage": "vitest run --coverage"'
  echo '  }'
  echo ""
else
  echo -e "${GREEN}✅ Validation scripts already configured${NC}"
fi

echo ""

# Create basic config files if they don't exist
echo -e "${BLUE}📝 Creating configuration files...${NC}"

# ESLint config
if [ ! -f ".eslintrc.json" ] && [ ! -f ".eslintrc.js" ] && [ ! -f "eslint.config.js" ]; then
  cat > .eslintrc.json <<EOF
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {}
}
EOF
  echo -e "${GREEN}✅ Created .eslintrc.json${NC}"
fi

# TypeScript config
if [ ! -f "tsconfig.json" ]; then
  cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
  echo -e "${GREEN}✅ Created tsconfig.json${NC}"
fi

# Prettier config
if [ ! -f ".prettierrc" ] && [ ! -f ".prettierrc.json" ]; then
  cat > .prettierrc <<EOF
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
EOF
  echo -e "${GREEN}✅ Created .prettierrc${NC}"
fi

# Vitest config
if [ ! -f "vitest.config.ts" ] && [ ! -f "vitest.config.js" ]; then
  cat > vitest.config.ts <<EOF
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
})
EOF
  echo -e "${GREEN}✅ Created vitest.config.ts${NC}"
fi

# Add .validation-history to .gitignore
if [ -f ".gitignore" ]; then
  if ! grep -q ".validation-history" .gitignore; then
    echo "" >> .gitignore
    echo "# Validation system" >> .gitignore
    echo ".validation-history/" >> .gitignore
    echo ".validation-report-*.html" >> .gitignore
    echo -e "${GREEN}✅ Updated .gitignore${NC}"
  fi
else
  cat > .gitignore <<EOF
node_modules/
dist/
.env
.DS_Store

# Validation system
.validation-history/
.validation-report-*.html
EOF
  echo -e "${GREEN}✅ Created .gitignore${NC}"
fi

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo ""
echo "1. Review and customize configuration files:"
echo "   - .eslintrc.json (linting rules)"
echo "   - tsconfig.json (TypeScript settings)"
echo "   - .prettierrc (formatting rules)"
echo "   - vitest.config.ts (test coverage thresholds)"
echo ""
echo "2. Add any missing validation scripts to package.json"
echo ""
echo "3. Run validation:"
echo "   In Claude Code: /validate"
echo "   Or directly: awk '/^\`\`\`bash$/,/^\`\`\`$/' .claude/commands/validate.md | grep -v '\`\`\`' | bash"
echo ""
echo "4. View results:"
echo "   - HTML Dashboard: .validation-report-TIMESTAMP.html"
echo "   - Historical Metrics: .validation-history/"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "   - Deployment Guide: DOCS/VALIDATION-DEPLOYMENT-GUIDE.md"
echo "   - Customization: Edit .claude/commands/validate.md"
echo ""
echo -e "${YELLOW}💡 Tip: Use VALIDATION_CONTINUE_ON_FAILURE=true for testing${NC}"
echo ""
