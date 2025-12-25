# Standalone Usage Guide

**Using ai-dev-standards as a Reference Library**

This guide shows how to use the ai-dev-standards repository directly without integrating it into your projects. Perfect for browsing, learning, and referencing resources manually.

---

## 📖 Overview

In standalone mode, you use ai-dev-standards as a **reference library** and **knowledge base**:

- Browse 64 specialized skills for methodologies and best practices
- Explore 50 MCP servers for automation ideas
- Reference 72 components for implementation patterns
- Use the brain CLI to discover relevant resources
- Manually copy/adapt resources into your projects

**When to use standalone mode:**

- Learning about AI-assisted development patterns
- Researching specific methodologies (RAG, MVP building, API design)
- Looking for implementation examples
- Exploring what's available before integrating
- Working on projects where full integration isn't suitable

---

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
cd ~
git clone https://github.com/daffy0208/ai-dev-standards.git
cd ai-dev-standards
```

### Step 2: Install Dependencies (Optional)

For using the brain CLI and validation tools:

```bash
npm install
```

### Step 3: Build brain-mcp (Optional)

For intelligent resource discovery:

```bash
cd mcp-servers/brain-mcp
npm install
npm run build
cd ../..
```

**That's it!** You can now browse and reference resources.

---

## 🗂️ Repository Structure

```
ai-dev-standards/
├── skills/                         # <!-- AUTO-GEN:START:skills -->64<!-- AUTO-GEN:END:skills --> specialized methodologies
│   ├── mvp-builder/                # MVP development patterns
│   ├── rag-implementer/            # RAG implementation guide
│   ├── api-designer/               # API design principles
│   └── [61 more skills...]
│
├── mcp-servers/                    # <!-- AUTO-GEN:START:mcps -->50<!-- AUTO-GEN:END:mcps --> automation tools
│   ├── brain-mcp/                  # Intelligent orchestration
│   ├── feature-prioritizer/        # Feature prioritization
│   └── [48 more MCPs...]
│
├── components/                     # <!-- AUTO-GEN:START:components -->72<!-- AUTO-GEN:END:components --> React components
│   ├── auth/                       # Authentication components
│   ├── forms/                      # Form components
│   └── [more categories...]
│
├── integrations/                   # <!-- AUTO-GEN:START:integrations -->28<!-- AUTO-GEN:END:integrations --> service integrations
│   ├── openai/                     # AI service providers
│   ├── supabase/                   # Database & auth
│   └── [more providers...]
│
├── standards/                      # Architecture patterns & best practices
│   ├── architecture-patterns/      # System design patterns
│   └── best-practices/             # Quality standards
│
├── meta/                           # Navigation and registries
│   ├── skill-registry.json         # Searchable skill catalog
│   ├── mcp-registry.json           # MCP catalog
│   └── HOW-TO-USE.md               # Navigation guide
│
└── docs/                           # Documentation
    ├── QUICK-START.md              # Getting started
    └── [more guides...]
```

---

## 🔍 Discovering Resources

### Method 1: Browse Manually

Navigate through directories to explore:

```bash
# Browse skills
ls skills/

# Look at a specific skill
cat skills/mvp-builder/skill.md
cat skills/mvp-builder/README.md

# Explore MCP servers
ls mcp-servers/

# Check out components
ls components/
```

### Method 2: Search Registries

Use the registry files for structured exploration:

```bash
# View all skills with descriptions
cat meta/skill-registry.json | grep -A 3 "name"

# Search for specific topics
grep -r "authentication" meta/skill-registry.json
grep -r "RAG" meta/skill-registry.json
```

### Method 3: Use the Brain CLI

The brain CLI helps you discover resources intelligently:

```bash
# Install brain CLI globally
cd mcp-servers/brain-mcp
npm link

# Search for resources
brain search "authentication"
brain search "MVP building"
brain search "RAG system"

# Get skill recommendations
brain select-skills "build a REST API"
brain select-skills "implement search functionality"

# Show repository status
brain status

# View skill details
brain show-skill mvp-builder
brain show-skill rag-implementer

# Find related resources
brain relationships mvp-builder
brain relationships rag-implementer
```

### Method 4: Search with Grep

Use standard Unix tools:

```bash
# Find all skills mentioning "security"
grep -r "security" skills/ --include="*.md"

# Find React components
find components/ -name "*.tsx" -o -name "*.jsx"

# Search documentation
grep -r "deployment" docs/ --include="*.md"
```

---

## 📚 Using Resources in Your Projects

### Option 1: Read and Apply Manually

1. Find the relevant skill or pattern
2. Read the methodology
3. Apply the concepts in your own code

**Example:**

```bash
# Read about MVP building
cat skills/mvp-builder/README.md

# Apply the P0/P1/P2 prioritization framework manually
# to your own feature planning
```

### Option 2: Copy and Adapt Components

1. Find a relevant component
2. Copy the code to your project
3. Customize for your needs

**Example:**

```bash
# Copy a component
cp -r components/auth/LoginForm src/components/

# Adapt it to your project's styling and requirements
```

### Option 3: Use as Documentation Reference

Keep the repository open while coding:

```bash
# In one terminal
cd ~/ai-dev-standards
cat skills/api-designer/skill.md

# In another terminal
cd ~/my-project
# Apply the principles while building your API
```

### Option 4: Ask AI Assistants to Reference It

When working with Claude or other AI assistants:

```
"I'm building a REST API. Can you reference the api-designer skill
from ~/ai-dev-standards/skills/api-designer/ and help me design it?"
```

```
"Look at ~/ai-dev-standards/standards/architecture-patterns/rag-pattern.md
and help me choose the right RAG architecture for my use case."
```

---

## 🔄 Checking for Updates

### Method 1: Automated Update Check

Use the update checker script:

```bash
cd ~/ai-dev-standards
./scripts/check-updates.sh
```

This will:

- Check for new commits in the remote repository
- Show what's changed since your last update
- Provide instructions for updating

### Method 2: Manual Check

```bash
cd ~/ai-dev-standards
git fetch origin

# Check if updates are available
git log HEAD..origin/main --oneline

# See what changed
git log HEAD..origin/main --stat

# Update if desired
git pull
```

### After Updating

After pulling updates:

```bash
# Rebuild brain-mcp if it was updated
cd mcp-servers/brain-mcp
npm install
npm run build
cd ../..

# Reinstall dependencies if package.json changed
npm install
```

---

## 💡 Common Workflows

### Learning About a Topic

```bash
# 1. Search for resources
brain search "RAG implementation"

# 2. Read the skill
cat skills/rag-implementer/README.md

# 3. Check related patterns
cat standards/architecture-patterns/rag-pattern.md

# 4. Look at related MCPs
brain relationships rag-implementer
```

### Finding Implementation Examples

```bash
# 1. Browse components
ls components/

# 2. Look at specific category
ls components/auth/

# 3. Read component code
cat components/auth/LoginForm/LoginForm.tsx

# 4. Check for examples
ls examples/
```

### Planning a New Feature

```bash
# 1. Get skill recommendations
brain select-skills "build user authentication"

# 2. Read recommended skills
cat skills/security-auditor/skill.md
cat skills/api-designer/skill.md

# 3. Check best practices
cat standards/best-practices/

# 4. Plan implementation based on learnings
```

---

## 🛠️ Using with AI Assistants

### Claude Desktop / Code

You can manually load skills into your conversation:

```
"I want to build an MVP. Please read and follow the methodology in:
~/ai-dev-standards/skills/mvp-builder/skill.md"
```

### Cursor / Other IDEs

Reference the repository in your prompts:

```
"Using the principles from ~/ai-dev-standards/skills/frontend-builder/,
help me structure this React component."
```

### Command Line AI Tools

```bash
# Example with a hypothetical CLI AI tool
ai-tool --context ~/ai-dev-standards/skills/api-designer/skill.md \
  "Design a REST API for user management"
```

---

## 📊 What You Get

### 64 Specialized Skills

Methodologies covering:

- **Product Development**: MVP building, product strategy, go-to-market planning
- **AI Development**: RAG implementation, multi-agent systems, knowledge graphs
- **Technical Development**: API design, frontend building, backend architecture
- **Infrastructure**: Deployment, performance optimization, security
- **UX/Design**: User research, UX design, accessibility

### 50 MCP Servers

Automation tools for:

- AI/ML operations (vector databases, embeddings, semantic search)
- Product management (feature prioritization, user insights, market analysis)
- Engineering (API generation, validation, component generation)
- Quality (performance profiling, security scanning, code quality)
- Design (wireframes, design tokens, asset optimization)

### 72 Components

React components for:

- Authentication and authorization
- Forms and inputs
- Error handling and feedback
- Media (images, videos, galleries)
- Layouts and navigation
- Advanced UI patterns

### 28 Service Integrations

Pre-configured connections to:

- OpenAI (AI/ML services)
- Supabase (database and auth)
- Stripe (payments)
- Authentication services
- Analytics and monitoring

### 24 Tools

Development utilities and automation scripts.

---

## 🔧 Troubleshooting

### "brain command not found"

Install the brain CLI:

```bash
cd ~/ai-dev-standards/mcp-servers/brain-mcp
npm install
npm run build
npm link
```

### "Permission denied" when running scripts

Make scripts executable:

```bash
chmod +x scripts/*.sh
```

### "npm install fails"

Ensure you have Node.js 18+ and npm 9+:

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### Updates not showing

Make sure you're on the main branch:

```bash
git checkout main
git fetch origin
git pull
```

---

## 📚 Next Steps

### Want More Integration?

If you find yourself frequently copying resources and want automatic syncing, consider [Integration Mode](INTEGRATION-USAGE.md).

### Contribute Back

Found a bug or have an improvement? See [CONTRIBUTING.md](CONTRIBUTING.md).

### Get Help

- Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Review [meta/HOW-TO-USE.md](meta/HOW-TO-USE.md)
- Open an issue on GitHub

---

## 📝 Comparison: Standalone vs Integration

| Feature            | Standalone Mode    | Integration Mode           |
| ------------------ | ------------------ | -------------------------- |
| **Setup**          | Clone + browse     | Clone + run setup script   |
| **Usage**          | Manual reference   | Automatic skill activation |
| **Updates**        | Manual git pull    | Auto-sync via git hooks    |
| **AI Integration** | Manual prompts     | Automatic via MCP          |
| **Best For**       | Learning, browsing | Active development         |
| **Overhead**       | Minimal            | Adds files to project      |

---

**Last Updated:** 2025-11-09
**Version:** 3.0.3

---

**Ready to integrate?** See [INTEGRATION-USAGE.md](INTEGRATION-USAGE.md) for automatic syncing and AI assistant integration.
