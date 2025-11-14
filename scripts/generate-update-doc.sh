#!/bin/bash

#
# Generate AI-Dev-Standards Update Documentation
#
# This script helps you quickly generate an update documentation file
# based on the template after running setup-project.sh
#
# Usage:
#   ./scripts/generate-update-doc.sh [project-name]
#

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default resource counts (fallback if .ai-dev.json is not available)
DEFAULT_SKILLS_COUNT=64
DEFAULT_MCPS_COUNT=50
DEFAULT_COMPONENTS_COUNT=72
DEFAULT_INTEGRATIONS_COUNT=28
DEFAULT_TOOLS_COUNT=24

# Resolve repository root (handles running from anywhere)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Get project name
PROJECT_NAME="${1:-My Project}"
DATE=$(date +%Y-%m-%d)
# AI_DEV_VERSION will be read from .ai-dev.json or default to repo package.json version
AI_DEV_VERSION=$(node -p "require('$REPO_ROOT/package.json').version" 2>/dev/null || echo "3.0.3")

# Get current directory
PROJECT_DIR="$(pwd)"

echo -e "${BLUE}📝 Generating AI-Dev-Standards Update Documentation${NC}\n"

# Check if .ai-dev.json exists
if [ ! -f ".ai-dev.json" ]; then
    echo -e "${YELLOW}⚠️  Warning: .ai-dev.json not found${NC}"
    echo -e "${YELLOW}   Have you run setup-project.sh yet?${NC}\n"
fi

# Read stats from .ai-dev.json if available
if [ -f ".ai-dev.json" ]; then
    # Get actual counts from array lengths if jq is available
    if command -v jq &> /dev/null; then
        SKILLS_COUNT=$(jq '.installed.skills | length' .ai-dev.json 2>/dev/null || echo "$DEFAULT_SKILLS_COUNT")
        MCPS_COUNT=$(jq '.installed.mcps | length' .ai-dev.json 2>/dev/null || echo "$DEFAULT_MCPS_COUNT")
        COMPONENTS_COUNT=$(jq '.installed.components | length' .ai-dev.json 2>/dev/null || echo "$DEFAULT_COMPONENTS_COUNT")
        INTEGRATIONS_COUNT=$(jq '.installed.integrations | length' .ai-dev.json 2>/dev/null || echo "$DEFAULT_INTEGRATIONS_COUNT")
        TOOLS_COUNT=$(jq '.installed.tools | length' .ai-dev.json 2>/dev/null || echo "$DEFAULT_TOOLS_COUNT")
        LAST_SYNC=$(jq -r '.lastSync' .ai-dev.json 2>/dev/null || echo "$DATE")
        AI_DEV_VERSION=$(jq -r '.version' .ai-dev.json 2>/dev/null || echo "3.0.0")
    else
        # Fallback to defaults if jq is not available
        echo -e "${YELLOW}⚠️  jq not installed, using default resource counts${NC}"
        SKILLS_COUNT=$DEFAULT_SKILLS_COUNT
        MCPS_COUNT=$DEFAULT_MCPS_COUNT
        COMPONENTS_COUNT=$DEFAULT_COMPONENTS_COUNT
        INTEGRATIONS_COUNT=$DEFAULT_INTEGRATIONS_COUNT
        TOOLS_COUNT=$DEFAULT_TOOLS_COUNT
        # Try to extract values with grep as fallback (less reliable)
        LAST_SYNC=$(grep -o '"lastSync": "[^"]*"' .ai-dev.json 2>/dev/null | head -1 | cut -d'"' -f4 || echo "$DATE")
        AI_DEV_VERSION=$(grep -o '"version": "[^"]*"' .ai-dev.json 2>/dev/null | head -1 | cut -d'"' -f4 || echo "3.0.0")
    fi
else
    # Use defaults when .ai-dev.json doesn't exist
    SKILLS_COUNT=$DEFAULT_SKILLS_COUNT
    MCPS_COUNT=$DEFAULT_MCPS_COUNT
    COMPONENTS_COUNT=$DEFAULT_COMPONENTS_COUNT
    INTEGRATIONS_COUNT=$DEFAULT_INTEGRATIONS_COUNT
    TOOLS_COUNT=$DEFAULT_TOOLS_COUNT
    LAST_SYNC="$DATE"
fi

TOTAL_RESOURCES=$((SKILLS_COUNT + MCPS_COUNT + COMPONENTS_COUNT + INTEGRATIONS_COUNT + TOOLS_COUNT))

# Generate the documentation
cat > AI-DEV-STANDARDS-UPDATE.md << EOF
# AI-Dev-Standards Update Documentation

**Project:** $PROJECT_NAME  
**Date:** $DATE  
**Updated By:** [Your Name/Team]  
**ai-dev-standards Version:** $AI_DEV_VERSION

---

## Executive Summary

This project has been successfully updated with the latest ai-dev-standards resources, providing access to $TOTAL_RESOURCES specialized development resources including skills, MCP tools, components, integrations, and utilities.

---

## What Was Done

### 1. Update Process

- [x] Cloned/updated ai-dev-standards repository to \`~/ai-dev-standards\`
- [x] Ran \`setup-project.sh\` script
- [x] Installed ai-dev CLI tool globally
- [x] Configured auto-sync via git hooks
- [ ] Built brain-mcp MCP server (required for first-time setup)

### 2. Resources Synced

**Total Resources:** $TOTAL_RESOURCES resources

#### Skills
- **Count:** $SKILLS_COUNT skills
- **Categories:**
  - MVP & Product Development
  - RAG & Knowledge Systems
  - API Design & Architecture
  - Testing & Quality Assurance
  - DevOps & Deployment
  - Design Systems & UI/UX
  - Performance Optimization
  - Security & Compliance
  - Data Engineering & Analytics
  - AI/ML Integration

#### MCP Servers
- **Count:** $MCPS_COUNT MCPs
- **Key MCPs:**
  - brain-mcp - Intelligent skill recommendation engine
  - playwright-mcp - Browser automation
  - accessibility-checker-mcp - A11y validation
  - seo-analyzer-mcp - SEO optimization

#### Components
- **Count:** $COMPONENTS_COUNT components
- **Categories:**
  - Authentication & Authorization
  - Forms & Input
  - Data Display
  - Feedback & Notifications
  - Media & Assets
  - Layout & Navigation
  - Advanced UI Patterns

#### Integrations
- **Count:** $INTEGRATIONS_COUNT integrations
- **Key Services:**
  - OpenAI, Anthropic, Cohere (AI Services)
  - Supabase (Database & Auth)
  - Stripe (Payments)
  - Pinecone, Weaviate, Chroma (Vector Databases)
  - Vercel, Railway (Deployment)
  - Cloudinary (Media)
  - Figma (Design)

#### Tools & Utilities
- **Count:** $TOOLS_COUNT tools
- **Types:**
  - Development utilities
  - Design tools
  - Testing frameworks
  - Automation scripts

---

## Configuration Changes

### Files Created/Updated

#### .claude/
- \`claude.md\` - Updated with $SKILLS_COUNT skill references
- \`mcp-settings.json\` - Configured brain-mcp and other MCP servers

#### .codex/
- \`mcp-settings.json\` - Codex CLI configuration with brain-mcp

#### Root Configuration
- \`.cursorrules\` - Brain-First Development workflow template
- \`.gitignore\` - Added orchestration system entries
- \`.ai-dev.json\` - Sync configuration and version tracking

#### Generated Files
- \`START-HERE.md\` - Personalized project roadmap (not committed)
- \`AI-DEV-STANDARDS-UPDATE.md\` - This documentation

---

## New Capabilities Enabled

### Brain-First Development Workflow

The project now follows the Brain-First Development approach:

1. **Query the brain** before starting any task using \`brain_search\`
2. **Activate relevant skills** automatically based on context
3. **Use specialized methodologies** for better results
4. **Leverage $MCPS_COUNT+ MCP tools** for automation

### Intelligent Skill Recommendations

With brain-mcp configured, Claude can now:
- Recommend relevant skills based on your task
- Provide domain-specific expertise
- Suggest optimal workflows
- Auto-activate the right tools

---

## Post-Setup Actions

### Required: Build brain-mcp (First Time Only)

If this is your first time setting up, you need to build the brain-mcp MCP server.

**Note:** Replace \`~/ai-dev-standards\` with your actual ai-dev-standards installation path if different.

\`\`\`bash
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install
npm run build
\`\`\`

This creates the \`dist/index.js\` file that Claude uses for intelligent skill recommendations.

### Verification Steps

- [x] Verified \`.ai-dev.json\` exists and tracks sync state
- [x] Confirmed brain-mcp is in \`.claude/mcp-settings.json\`
- [ ] Tested brain-mcp availability
- [ ] Reviewed \`START-HERE.md\` recommendations
- [ ] Checked git status for expected changes
- [ ] Verified \`.gitignore\` includes orchestration patterns

---

## Integration with Development Workflow

### How to Use in Daily Work

#### 1. Starting a New Feature

\`\`\`
Ask Claude: "Use brain_search to find skills for implementing [feature]"
\`\`\`

Claude will recommend relevant skills and activate them.

#### 2. Architecture Decisions

\`\`\`
Ask Claude: "Use brain_search for architecture patterns related to [topic]"
\`\`\`

Access architectural patterns from the standards library.

#### 3. Code Quality

\`\`\`
Ask Claude: "Use the quality-auditor skill to review [component]"
\`\`\`

Get automated code review suggestions.

---

## Files Committed

### Added Files
\`\`\`
.ai-dev.json
.claude/claude.md
.claude/mcp-settings.json
.codex/mcp-settings.json
.cursorrules
AI-DEV-STANDARDS-UPDATE.md
\`\`\`

### Modified Files
\`\`\`
.gitignore
\`\`\`

### Excluded Files (Not Committed)
\`\`\`
START-HERE.md
.ai-dev/backups/
orchestration-requests/
orchestration-results/
\`\`\`

---

## Next Steps

### Immediate Actions
- [ ] Share this update with team
- [ ] Build brain-mcp (if first time): \`cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp && npm install && npm run build\`
- [ ] Review START-HERE.md recommendations
- [ ] Test brain-mcp configuration: \`cat .claude/mcp-settings.json | grep brain-mcp\`
- [ ] Commit changes to repository

### Team Training
- [ ] Share Brain-First Development workflow with team
- [ ] Demonstrate using brain_search for task planning
- [ ] Review available skills in \`.claude/claude.md\`
- [ ] Set up regular update schedule (weekly/monthly)

### Future Enhancements
- [ ] Explore advanced skills relevant to project
- [ ] Customize \`.cursorrules\` for team preferences
- [ ] Add project-specific skills to \`.ai-dev/custom-skills/\`
- [ ] Schedule regular updates with \`ai-dev sync\`

---

## Maintenance & Updates

### Regular Update Schedule
- **Frequency:** Weekly (recommended)
- **Process:** Run \`bash ~/ai-dev-standards/setup-project.sh\` or \`ai-dev sync\`
- **Review:** Check git diff before committing
- **Documentation:** Update this file with changes

### Auto-Sync Configuration
- **Status:** Enabled (git hook)
- **Trigger:** Runs automatically on \`git pull\`
- **Tracking:** Skills, MCPs, Components, Integrations, Tools, Config Files

---

## Resources & Documentation

### Quick Links
- [ai-dev-standards Repository](https://github.com/daffy0208/ai-dev-standards)
- [Installation Guide](~/ai-dev-standards/INSTALL.md)
- [Update Guide](~/ai-dev-standards/UPDATE-GUIDE.md)
- [Auto-Sync Guide](~/ai-dev-standards/DOCS/AUTO-SYNC-GUIDE.md)
- [CLI Documentation](~/ai-dev-standards/CLI/README.md)

### Internal Documentation
- \`START-HERE.md\` - Project-specific getting started guide
- \`.claude/claude.md\` - Available skills reference
- \`.cursorrules\` - Development workflow patterns

---

## Summary Statistics

### Before Update
- Skills: 0
- MCP Tools: 0
- Components: 0
- Total Resources: 0

### After Update
- Skills: $SKILLS_COUNT (+$SKILLS_COUNT)
- MCP Tools: $MCPS_COUNT (+$MCPS_COUNT)
- Components: $COMPONENTS_COUNT (+$COMPONENTS_COUNT)
- Integrations: $INTEGRATIONS_COUNT (+$INTEGRATIONS_COUNT)
- Tools: $TOOLS_COUNT (+$TOOLS_COUNT)
- **Total Resources:** $TOTAL_RESOURCES

### Expected Benefits
- Faster development with specialized skills
- Improved code quality with automated reviews
- Better architecture with design patterns
- Enhanced security with security standards
- Consistent formatting with .cursorrules
- Intelligent task planning with brain-mcp

---

**Document Generated:** $DATE  
**Last Sync:** $LAST_SYNC  
**ai-dev-standards Version:** $AI_DEV_VERSION

---

**Note:** To update this documentation after future syncs, run:
\`\`\`bash
bash ~/ai-dev-standards/scripts/generate-update-doc.sh "$PROJECT_NAME"
\`\`\`
EOF

echo -e "${GREEN}✅ Generated AI-DEV-STANDARDS-UPDATE.md${NC}\n"
echo -e "${BLUE}📄 Summary:${NC}"
echo -e "${BLUE}  Project: $PROJECT_NAME${NC}"
echo -e "${BLUE}  Resources: $TOTAL_RESOURCES total${NC}"
echo -e "${BLUE}  - Skills: $SKILLS_COUNT${NC}"
echo -e "${BLUE}  - MCPs: $MCPS_COUNT${NC}"
echo -e "${BLUE}  - Components: $COMPONENTS_COUNT${NC}"
echo -e "${BLUE}  - Integrations: $INTEGRATIONS_COUNT${NC}"
echo -e "${BLUE}  - Tools: $TOOLS_COUNT${NC}"
echo -e "${BLUE}  Version: $AI_DEV_VERSION${NC}"
echo -e "${BLUE}  Date: $DATE${NC}\n"

echo -e "${YELLOW}💡 Next Steps:${NC}"
echo -e "${YELLOW}  1. Review the generated AI-DEV-STANDARDS-UPDATE.md${NC}"
echo -e "${YELLOW}  2. Fill in [Your Name/Team] in the document${NC}"
echo -e "${YELLOW}  3. Complete any unchecked [ ] items${NC}"
echo -e "${YELLOW}  4. Add project-specific notes and observations${NC}"
echo -e "${YELLOW}  5. Commit the file to your repository${NC}\n"
