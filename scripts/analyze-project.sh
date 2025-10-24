#!/bin/bash

#
# AI Dev Standards - Project Analysis Script
#
# Analyzes a project repository and provides recommendations
# for where to start and what to prioritize
#

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

PROJECT_DIR="${1:-.}"
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

echo -e "${BLUE}${BOLD}🔍 AI Dev Standards - Project Analysis${NC}\n"
echo -e "${GRAY}Analyzing: ${PROJECT_DIR}${NC}\n"

cd "$PROJECT_DIR"

# Analysis results
HAS_GIT=false
HAS_PACKAGE_JSON=false
HAS_README=false
HAS_TESTS=false
HAS_DOCS=false
HAS_CI=false
FILE_COUNT=0
CODE_FILE_COUNT=0
PROJECT_TYPE="unknown"
DETECTED_FRAMEWORKS=()
DETECTED_LANGUAGES=()

# 1. Check Git
if [ -d ".git" ]; then
    HAS_GIT=true
    echo -e "${GREEN}✓${NC} Git repository detected"
    
    # Check if it's a fresh repo
    if git log --oneline 2>/dev/null | grep -q .; then
        COMMIT_COUNT=$(git log --oneline | wc -l)
        echo -e "${GRAY}  Commits: $COMMIT_COUNT${NC}"
    else
        echo -e "${YELLOW}  Warning: No commits yet${NC}"
    fi
else
    echo -e "${RED}✗${NC} Not a Git repository"
fi

echo ""

# 2. Check Package.json
if [ -f "package.json" ]; then
    HAS_PACKAGE_JSON=true
    echo -e "${GREEN}✓${NC} package.json found"
    
    # Detect frameworks
    if grep -q "\"next\"" package.json 2>/dev/null; then
        DETECTED_FRAMEWORKS+=("Next.js")
        PROJECT_TYPE="nextjs"
    fi
    if grep -q "\"react\"" package.json 2>/dev/null; then
        DETECTED_FRAMEWORKS+=("React")
        if [ "$PROJECT_TYPE" == "unknown" ]; then
            PROJECT_TYPE="react"
        fi
    fi
    if grep -q "\"expo\"" package.json 2>/dev/null; then
        DETECTED_FRAMEWORKS+=("Expo")
        PROJECT_TYPE="react-native"
    fi
    if grep -q "\"@supabase\"" package.json 2>/dev/null; then
        DETECTED_FRAMEWORKS+=("Supabase")
    fi
    if grep -q "\"stripe\"" package.json 2>/dev/null; then
        DETECTED_FRAMEWORKS+=("Stripe")
    fi
    
    if [ ${#DETECTED_FRAMEWORKS[@]} -gt 0 ]; then
        echo -e "${GRAY}  Frameworks: ${DETECTED_FRAMEWORKS[*]}${NC}"
    fi
else
    echo -e "${YELLOW}⚠${NC}  No package.json found"
fi

echo ""

# 3. Detect languages
if [ -n "$(find . -maxdepth 3 -name '*.ts' -o -name '*.tsx' 2>/dev/null)" ]; then
    DETECTED_LANGUAGES+=("TypeScript")
fi
if [ -n "$(find . -maxdepth 3 -name '*.js' -o -name '*.jsx' 2>/dev/null)" ]; then
    DETECTED_LANGUAGES+=("JavaScript")
fi
if [ -n "$(find . -maxdepth 3 -name '*.py' 2>/dev/null)" ]; then
    DETECTED_LANGUAGES+=("Python")
fi

if [ ${#DETECTED_LANGUAGES[@]} -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Languages detected: ${DETECTED_LANGUAGES[*]}"
else
    echo -e "${YELLOW}⚠${NC}  No source code files detected"
fi

echo ""

# 4. Check README
if [ -f "README.md" ] || [ -f "readme.md" ]; then
    HAS_README=true
    README_LINES=$(wc -l < README.md 2>/dev/null || wc -l < readme.md 2>/dev/null || echo "0")
    if [ "$README_LINES" -gt 50 ]; then
        echo -e "${GREEN}✓${NC} Comprehensive README found ($README_LINES lines)"
    elif [ "$README_LINES" -gt 10 ]; then
        echo -e "${YELLOW}⚠${NC}  Basic README found ($README_LINES lines) - could be expanded"
    else
        echo -e "${YELLOW}⚠${NC}  Minimal README found ($README_LINES lines)"
    fi
else
    echo -e "${RED}✗${NC} No README.md found"
fi

echo ""

# 5. Check for tests
if [ -d "tests" ] || [ -d "test" ] || [ -d "__tests__" ] || [ -n "$(find . -maxdepth 2 -name '*.test.*' -o -name '*.spec.*' 2>/dev/null)" ]; then
    HAS_TESTS=true
    TEST_COUNT=$(find . -name '*.test.*' -o -name '*.spec.*' 2>/dev/null | wc -l)
    echo -e "${GREEN}✓${NC} Tests found ($TEST_COUNT test files)"
else
    echo -e "${YELLOW}⚠${NC}  No tests found"
fi

echo ""

# 6. Check for documentation
if [ -d "docs" ] || [ -d "DOCS" ] || [ -d "documentation" ]; then
    HAS_DOCS=true
    DOC_COUNT=$(find ./docs ./DOCS ./documentation -name '*.md' 2>/dev/null | wc -l || echo "0")
    echo -e "${GREEN}✓${NC} Documentation directory found ($DOC_COUNT files)"
else
    echo -e "${YELLOW}⚠${NC}  No documentation directory"
fi

echo ""

# 7. Check for CI/CD
if [ -d ".github/workflows" ] || [ -f ".gitlab-ci.yml" ] || [ -f ".circleci/config.yml" ]; then
    HAS_CI=true
    echo -e "${GREEN}✓${NC} CI/CD configuration found"
else
    echo -e "${YELLOW}⚠${NC}  No CI/CD configuration"
fi

echo ""

# 8. Count files
FILE_COUNT=$(find . -type f ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | wc -l)
CODE_FILE_COUNT=$(find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.py' \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | wc -l)

echo -e "${CYAN}${BOLD}📊 Project Statistics${NC}\n"
echo -e "${GRAY}Total files: $FILE_COUNT${NC}"
echo -e "${GRAY}Code files: $CODE_FILE_COUNT${NC}"

echo ""

# 9. Determine project stage
PROJECT_STAGE="unknown"
if [ "$CODE_FILE_COUNT" -eq 0 ]; then
    PROJECT_STAGE="empty"
elif [ "$CODE_FILE_COUNT" -lt 10 ]; then
    PROJECT_STAGE="early"
elif [ "$CODE_FILE_COUNT" -lt 50 ]; then
    PROJECT_STAGE="growing"
else
    PROJECT_STAGE="established"
fi

# 10. Generate recommendations
echo -e "${MAGENTA}${BOLD}🎯 Analysis & Recommendations${NC}\n"

# Determine overall project health
HEALTH_SCORE=0
if [ "$HAS_GIT" = true ]; then ((HEALTH_SCORE+=15)); fi
if [ "$HAS_PACKAGE_JSON" = true ]; then ((HEALTH_SCORE+=15)); fi
if [ "$HAS_README" = true ]; then ((HEALTH_SCORE+=20)); fi
if [ "$HAS_TESTS" = true ]; then ((HEALTH_SCORE+=20)); fi
if [ "$HAS_DOCS" = true ]; then ((HEALTH_SCORE+=15)); fi
if [ "$HAS_CI" = true ]; then ((HEALTH_SCORE+=15)); fi

if [ "$HEALTH_SCORE" -ge 80 ]; then
    echo -e "${GREEN}${BOLD}Project Health: Excellent ($HEALTH_SCORE/100)${NC}"
elif [ "$HEALTH_SCORE" -ge 60 ]; then
    echo -e "${CYAN}${BOLD}Project Health: Good ($HEALTH_SCORE/100)${NC}"
elif [ "$HEALTH_SCORE" -ge 40 ]; then
    echo -e "${YELLOW}${BOLD}Project Health: Fair ($HEALTH_SCORE/100)${NC}"
else
    echo -e "${YELLOW}${BOLD}Project Health: Needs Work ($HEALTH_SCORE/100)${NC}"
fi

echo ""
echo -e "${BOLD}Project Stage: ${PROJECT_STAGE}${NC}"
echo -e "${BOLD}Project Type: ${PROJECT_TYPE}${NC}"
echo ""

# Recommendations based on stage
echo -e "${CYAN}${BOLD}📝 Recommended Next Steps:${NC}\n"

case $PROJECT_STAGE in
    "empty")
        echo -e "${BOLD}Priority 1: Project Foundation${NC}"
        echo -e "  1. ${GREEN}Initialize with README.md${NC} - Document your project vision"
        echo -e "  2. ${GREEN}Set up package.json${NC} - Define dependencies"
        echo -e "  3. ${GREEN}Create initial project structure${NC}"
        echo -e ""
        echo -e "${BOLD}Recommended Skills:${NC}"
        echo -e "  • ${CYAN}mvp-builder${NC} - For rapid project setup and feature prioritization"
        echo -e "  • ${CYAN}product-strategist${NC} - Define product-market fit"
        echo -e "  • ${CYAN}technical-writer${NC} - Create comprehensive documentation"
        ;;
    "early")
        echo -e "${BOLD}Priority 1: Establish Best Practices${NC}"
        if [ "$HAS_README" = false ]; then
            echo -e "  1. ${YELLOW}Add README.md${NC} - Document purpose, setup, and usage"
        fi
        if [ "$HAS_TESTS" = false ]; then
            echo -e "  2. ${YELLOW}Add testing framework${NC} - Jest, Vitest, or Pytest"
        fi
        if [ "$HAS_CI" = false ]; then
            echo -e "  3. ${YELLOW}Set up CI/CD${NC} - GitHub Actions for automated testing"
        fi
        echo -e ""
        echo -e "${BOLD}Recommended Skills:${NC}"
        echo -e "  • ${CYAN}testing-strategist${NC} - Set up comprehensive test suite"
        echo -e "  • ${CYAN}frontend-builder${NC} - Structure your React/Next.js app"
        echo -e "  • ${CYAN}deployment-advisor${NC} - Choose deployment strategy"
        ;;
    "growing")
        echo -e "${BOLD}Priority 1: Scale & Optimize${NC}"
        if [ "$HAS_TESTS" = false ]; then
            echo -e "  1. ${YELLOW}Add test coverage${NC} - Aim for 80%+ coverage"
        fi
        if [ "$HAS_DOCS" = false ]; then
            echo -e "  2. ${YELLOW}Create documentation${NC} - API docs, architecture diagrams"
        fi
        if [ "$HAS_CI" = false ]; then
            echo -e "  3. ${YELLOW}Automate deployment${NC} - Set up CI/CD pipeline"
        fi
        echo -e "  4. ${GREEN}Code quality tools${NC} - ESLint, Prettier, TypeScript strict mode"
        echo -e ""
        echo -e "${BOLD}Recommended Skills:${NC}"
        echo -e "  • ${CYAN}performance-optimizer${NC} - Optimize for scale"
        echo -e "  • ${CYAN}security-engineer${NC} - Security audit and hardening"
        echo -e "  • ${CYAN}design-system-architect${NC} - Build component library"
        ;;
    "established")
        echo -e "${BOLD}Priority 1: Maintain & Enhance${NC}"
        echo -e "  1. ${GREEN}Security audit${NC} - Review dependencies and code"
        echo -e "  2. ${GREEN}Performance profiling${NC} - Identify bottlenecks"
        echo -e "  3. ${GREEN}Documentation review${NC} - Keep docs current"
        echo -e "  4. ${GREEN}Refactor for maintainability${NC} - Reduce technical debt"
        echo -e ""
        echo -e "${BOLD}Recommended Skills:${NC}"
        echo -e "  • ${CYAN}quality-auditor${NC} - Comprehensive quality assessment"
        echo -e "  • ${CYAN}dark-matter-analyzer${NC} - Identify hidden issues"
        echo -e "  • ${CYAN}accessibility-engineer${NC} - Ensure WCAG compliance"
        ;;
esac

echo ""

# Quick wins
echo -e "${GREEN}${BOLD}⚡ Quick Wins (Do These First):${NC}\n"

QUICK_WIN_COUNT=0

if [ "$HAS_README" = false ]; then
    ((QUICK_WIN_COUNT++))
    echo -e "  ${QUICK_WIN_COUNT}. Create README.md with project description and setup instructions"
fi

if [ "$HAS_GIT" = true ] && [ ! -f ".gitignore" ]; then
    ((QUICK_WIN_COUNT++))
    echo -e "  ${QUICK_WIN_COUNT}. Add .gitignore file (ai-dev can generate this)"
fi

if [ ! -f ".cursorrules" ] && [ ! -f ".claude/claude.md" ]; then
    ((QUICK_WIN_COUNT++))
    echo -e "  ${QUICK_WIN_COUNT}. Copy .cursorrules template for AI coding standards"
fi

if [ "$HAS_PACKAGE_JSON" = true ] && [ ! -f ".env.example" ]; then
    ((QUICK_WIN_COUNT++))
    echo -e "  ${QUICK_WIN_COUNT}. Create .env.example for environment variables"
fi

if [ "$QUICK_WIN_COUNT" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} All quick wins completed! Focus on the priority tasks above."
fi

echo ""

# Specific framework recommendations
if [ "$PROJECT_TYPE" != "unknown" ]; then
    echo -e "${BLUE}${BOLD}🔧 Framework-Specific Recommendations:${NC}\n"
    
    case $PROJECT_TYPE in
        "nextjs"|"react")
            echo -e "  • Use ${CYAN}frontend-builder${NC} skill for component architecture"
            echo -e "  • Use ${CYAN}visual-designer${NC} for design system setup"
            echo -e "  • Consider ${CYAN}ux-designer${NC} for user flow optimization"
            echo -e "  • Add ${CYAN}performance-optimizer${NC} for React optimization"
            ;;
        "react-native")
            echo -e "  • Use ${CYAN}mobile-developer${NC} skill for Expo/React Native best practices"
            echo -e "  • Use ${CYAN}ux-designer${NC} for mobile UX patterns"
            echo -e "  • Consider ${CYAN}accessibility-engineer${NC} for mobile accessibility"
            ;;
    esac
    echo ""
fi

# AI Dev Standards integration status
echo -e "${BLUE}${BOLD}🤖 AI Dev Standards Integration:${NC}\n"

if [ -f ".ai-dev.json" ]; then
    echo -e "  ${GREEN}✓${NC} Already integrated with ai-dev-standards"
    echo -e "  ${GRAY}Run 'ai-dev sync' to update resources${NC}"
else
    echo -e "  ${YELLOW}⚠${NC}  Not yet integrated"
    echo -e "  ${GRAY}Integration will provide access to:${NC}"
    echo -e "    • 37 specialized skills"
    echo -e "    • 34 MCP servers"
    echo -e "    • 9 tools + 4 scripts"
    echo -e "    • 13 reusable components"
    echo -e "    • 6 service integrations"
fi

echo ""
echo -e "${GREEN}${BOLD}✅ Analysis Complete${NC}\n"
echo -e "${GRAY}For detailed guidance, see the recommended skills above.${NC}"
echo -e "${GRAY}Each skill provides specific methodologies and best practices.${NC}\n"
