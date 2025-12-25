# AI Development Standards

[![CI Status](https://img.shields.io/badge/CI-passing-brightgreen)](https://github.com/daffy0208/ai-dev-standards/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20+-green)](https://nodejs.org/)

**Version 3.1.0** | Last Updated: 2025-11-24

> A comprehensive framework of specialized AI skills, MCP servers, and development tools for AI-assisted software development. Features automated validation, agent evaluation, and quality assurance.

## 📊 Current Resources

**Total: 199 Resources**

| Category         | Count | Description                                       |
| ---------------- | ----- | ------------------------------------------------- |
| **Skills**       | 64    | Specialized AI methodologies and workflows        |
| **MCPs**         | 51    | Model Context Protocol servers (executable tools) |
| **Tools**        | 4     | Core utility scripts                              |
| **Components**   | 75    | Reusable UI and system components                 |
| **Integrations** | 5     | Third-party service connectors                    |

**MCP Coverage:** 79.7% (51 MCPs supporting 64 Skills)

---

## ✨ What's New in 3.1.0

### 🎯 Agent Evaluation System (Phase 5.12)

Implement Eval-Driven Development (EDD) for continuous agent quality assurance:

- Automated testing against golden datasets
- Multiple grading strategies (exact, regex, LLM-based)
- Performance metrics and regression tracking
- 100% test pass rate in validation suite

```bash
# Run agent evaluations
node scripts/run-agent-evals.js --dataset tests/fixtures/golden-dataset-example.json --mock
```

### ⚡ Two-Tier Validation System

- **Quick Validation** (10-30s): Registry consistency, documentation
- **Full Validation** (2-5min): Includes linting, type checking, tests, agent evals

```bash
npm run validate:quick  # Fast feedback
npm run validate:full   # Comprehensive checks
```

### 📚 Enhanced Documentation

- `.claude/CLAUDE.md` - Complete Claude Code configuration guide
- `FINAL-RESOURCE-COUNTS.md` - Resource tracking and metrics
- `docs/VALIDATION-SYSTEM.md` - Validation methodology

---

## 🚀 Quick Start

> 📖 **New to this repository?** Check out our [Installation Guide](INSTALL.md) and [Quick Start Guide](QUICK-START-GUIDE.md) for step-by-step instructions.

### For New Projects

```bash
# Clone the repository
git clone https://github.com/daffy0208/ai-dev-standards.git
cd ai-dev-standards

# Install dependencies
npm install

# Run validation to ensure everything works
npm run validate
```

### For Existing Projects

```bash
# Clone as a reference
git clone https://github.com/daffy0208/ai-dev-standards.git ~/ai-dev-standards

# Reference skills and patterns in your .cursorrules or .claude/claude.md
# See docs/EXISTING-PROJECTS.md for integration guide
```

### Using with Claude Code

1. Open your project in Claude Code
2. Reference this repository in your project instructions:

   ```markdown
   You have access to ai-dev-standards at ~/ai-dev-standards

   When needed, reference skills from skills/ and patterns from standards/
   Use the skill-registry.json to find relevant skills for tasks
   ```

3. Claude will automatically discover and use appropriate skills

---

## 📖 What This Repository Does

Think of this as **a shared knowledge base** between you and Claude:

### 🎓 64 Specialized Skills

Methodologies Claude follows automatically:

- **Product**: mvp-builder, product-strategist, go-to-market-planner
- **AI/ML**: rag-implementer, multi-agent-architect, knowledge-graph-builder
- **Development**: frontend-builder, api-designer, backend-architect
- **Infrastructure**: deployment-advisor, security-engineer, performance-optimizer
- **Design**: ux-designer, visual-designer, design-system-architect
- **Quality**: testing-strategist, quality-auditor, agent-evaluator

### 🔧 51 MCP Servers

Executable tools that extend Claude's capabilities:

- **Search**: semantic-search-mcp, dark-matter-analyzer-mcp
- **Quality**: code-quality-scanner-mcp, security-scanner-mcp, test-runner-mcp
- **AI/Data**: vector-database-mcp, embedding-generator-mcp, knowledge-base-mcp
- **Design**: figma-sync-mcp, design-token-manager-mcp, theme-builder-mcp
- **DevOps**: deployment-orchestrator-mcp, database-migration-mcp

### 📐 Architecture Patterns

Proven approaches for complex systems:

- RAG architectures (Naive, Advanced, Modular)
- Multi-agent coordination patterns
- Event-driven systems
- Real-time data pipelines
- Authentication patterns

### 🛡️ Quality Assurance

- Automated validation system (2-tier)
- Agent evaluation framework (EDD)
- Security best practices
- Performance standards
- Accessibility guidelines

---

## 💡 Key Features

### ⚡ Automated Validation

```bash
# Quick validation (10-30 seconds)
npm run validate:quick

# Full validation (2-5 minutes)
npm run validate:full

# Agent evaluation only
node scripts/run-agent-evals.js --dataset tests/fixtures/golden-dataset-example.json --mock
```

**Validates:**

- ✅ Registry consistency
- ✅ Documentation accuracy
- ✅ Code quality (ESLint)
- ✅ Type safety (TypeScript)
- ✅ Test coverage
- ✅ **Agent performance (NEW)**

### 🤖 Agent Evaluation System

Test AI agents against golden datasets to ensure consistent, high-quality outputs:

```javascript
{
  "tests": [
    {
      "id": "T001",
      "input": "Create a React button component with TypeScript",
      "expected": "import React from 'react';",
      "grading": { "type": "contains", "threshold": 0.8 }
    }
  ]
}
```

**Features:**

- Multiple grading types (exact match, contains, regex, LLM-graded)
- Performance metrics (latency, success rate, score)
- Historical tracking and regression detection
- Custom dataset support

### 📊 Comprehensive Documentation

- **For Developers**: `docs/GETTING-STARTED.md`, `docs/QUICK-START.md`
- **For AI**: `meta/PROJECT-CONTEXT.md`, `meta/HOW-TO-USE.md`
- **Configuration**: `.claude/CLAUDE.md`, `FINAL-RESOURCE-COUNTS.md`
- **Validation**: `docs/VALIDATION-SYSTEM.md`

### 🎯 Smart Resource Discovery

```bash
# Find skills for a task
grep -r "mvp" meta/skill-registry.json

# Search all resources
grep -r "authentication" meta/

# View resource counts
cat FINAL-RESOURCE-COUNTS.md
```

---

## 🗂️ Repository Structure

```
ai-dev-standards/
├── skills/                    # 64 specialized methodologies
│   ├── mvp-builder/          # MVP development & prioritization
│   ├── rag-implementer/      # RAG system implementation
│   ├── api-designer/         # API design patterns
│   └── [61 more...]
│
├── mcp-servers/              # 51 executable tools
│   ├── semantic-search-mcp/  # Semantic code search
│   ├── vector-database-mcp/  # Vector DB integration
│   ├── code-quality-scanner-mcp/
│   └── [48 more...]
│
├── standards/                # Architecture & best practices
│   ├── architecture-patterns/
│   ├── best-practices/
│   ├── coding-conventions/
│   └── project-structure/
│
├── meta/                     # Resource registry & context
│   ├── registry.json         # Master resource registry
│   ├── skill-registry.json   # Skill catalog
│   ├── mcp-registry.json     # MCP catalog
│   └── PROJECT-CONTEXT.md    # For AI assistants
│
├── docs/                     # Comprehensive documentation
│   ├── GETTING-STARTED.md
│   ├── VALIDATION-SYSTEM.md
│   ├── AGENT-VALIDATION.md   # NEW!
│   └── [40+ more guides...]
│
├── scripts/                  # Automation & validation
│   ├── run-agent-evals.js    # NEW! Agent evaluation
│   ├── validate-full.sh      # Full validation suite
│   └── [20+ more scripts...]
│
└── tests/                    # Test suites & fixtures
    ├── fixtures/
    │   └── golden-dataset-example.json  # NEW!
    └── [150+ test files...]
```

---

## 🎯 Usage Examples

### Example 1: Starting a New Project

```
User: "I want to build a SaaS product for invoice management"

Claude uses:
1. product-strategist → Validate problem-solution fit
2. mvp-builder → Identify P0 features (invoicing, payment tracking)
3. frontend-builder → React/Next.js structure
4. api-designer → REST API design
5. deployment-advisor → Vercel + Railway recommendation
6. security-engineer → Auth, data encryption, PCI compliance
```

### Example 2: Implementing AI Search

```
User: "Add AI-powered search to our documentation"

Claude uses:
1. rag-implementer → RAG methodology
2. rag-pattern.md → Advanced RAG architecture
3. vector-database-mcp → Pinecone integration
4. embedding-generator-mcp → OpenAI embeddings
5. semantic-search-mcp → Search implementation
```

### Example 3: Code Quality Audit

```
User: "Audit our codebase for quality issues"

Claude uses:
1. quality-auditor → Comprehensive audit methodology
2. code-quality-scanner-mcp → Static analysis
3. security-scanner-mcp → Vulnerability detection
4. performance-profiler-mcp → Performance bottlenecks
5. test-runner-mcp → Test coverage analysis
6. agent-evaluator → AI agent quality checks (NEW!)
```

---

## 🔍 Finding Skills

### By Task

```bash
# Search skills by keyword
grep -i "authentication" meta/skill-registry.json
grep -i "database" meta/skill-registry.json
grep -i "testing" meta/skill-registry.json
```

### By Category

View `meta/skill-registry.json` for complete categorization:

- **Product & Business** (8 skills)
- **AI & Machine Learning** (10 skills)
- **Frontend Development** (6 skills)
- **Backend Development** (8 skills)
- **Infrastructure & DevOps** (8 skills)
- **Design & UX** (12 skills)
- **Quality & Testing** (12 skills)

### Auto-Discovery

Skills activate automatically based on your conversation with Claude. Just describe what you want to build!

---

## ⚙️ Validation System

### Two-Tier Approach

#### Tier 1: Quick Validation (10-30 seconds)

```bash
npm run validate:quick
```

**Checks:**

- Registry consistency
- Documentation accuracy
- Configuration files
- Basic CLI functionality

**Use when:** Before commits, during rapid development

#### Tier 2: Full Validation (2-5 minutes)

```bash
npm run validate:full
```

**Checks:**

- Everything in Tier 1 +
- ESLint code quality
- TypeScript type checking
- Unit & integration tests
- **Agent Evaluation (Phase 5.12)** ✨ NEW
- Build verification

**Use when:** Before pushing, in CI/CD, before releases

### Agent Evaluation (Phase 5.12)

Test AI agents against golden datasets:

```bash
# Run with mock agent (for testing)
node scripts/run-agent-evals.js --dataset tests/fixtures/golden-dataset-example.json --mock

# Run with real agent (production)
node scripts/run-agent-evals.js --dataset tests/fixtures/golden-dataset-example.json

# Verbose output
node scripts/run-agent-evals.js --dataset tests/fixtures/golden-dataset-example.json --mock --verbose
```

**Output:**

```
📊 Summary
----------------------------------------
Total Tests:    10
Passed:         10
Failed:         0
Pass Rate:      100.0%
Avg Score:      0.96
Avg Latency:    47ms
----------------------------------------

✅ Agent Evaluations PASSED
```

See `docs/VALIDATION-SYSTEM.md` for complete methodology.

---

## 📚 Documentation

### Getting Started

- `docs/QUICK-START.md` - 5-minute quick start
- `docs/GETTING-STARTED.md` - Comprehensive setup guide
- `docs/EXISTING-PROJECTS.md` - Integration for existing projects

### Validation & Quality

- `docs/VALIDATION-SYSTEM.md` - Validation methodology
- `docs/AGENT-VALIDATION.md` - Agent evaluation guide (NEW!)
- `.claude/commands/validate.md` - Validation command reference

### Configuration

- `.claude/CLAUDE.md` - Claude Code configuration (NEW!)
- `FINAL-RESOURCE-COUNTS.md` - Resource metrics (NEW!)
- `meta/PROJECT-CONTEXT.md` - For AI assistants
- `meta/HOW-TO-USE.md` - Navigation guide

### Development

- `CONTRIBUTING.md` - Contribution guidelines
- `docs/MCP-DEVELOPMENT-ROADMAP.md` - MCP development guide
- `docs/TROUBLESHOOTING.md` - Common issues

---

## 🛠️ Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:registry      # Registry validation
npm run test:cli           # CLI tests

# Run agent evaluations
npm run test:agent-eval    # Agent evaluation suite
```

### Validation Commands

```bash
# Linting
npm run lint               # Check code quality
npm run lint:fix           # Auto-fix issues

# Type Checking
npm run typecheck          # TypeScript validation

# Formatting
npm run format             # Format code with Prettier
npm run format:check       # Check formatting

# Registry
npm run validate:registries  # Validate resource registries
npm run generate:registries  # Regenerate registries
```

### Creating Custom Datasets

Create your own agent evaluation datasets:

```json
{
  "version": "1.0.0",
  "description": "Your custom test dataset",
  "tests": [
    {
      "id": "T001",
      "category": "code-generation",
      "description": "Test description",
      "input": "Your test prompt",
      "expected": "Expected output or pattern",
      "grading": {
        "type": "contains", // or "exact", "regex", "llm-graded"
        "threshold": 0.8
      },
      "tags": ["category", "feature"]
    }
  ]
}
```

---

## 📊 Quality Metrics

### Resource Coverage

- **Skills**: 64 specialized methodologies
- **MCPs**: 51 executable tools
- **MCP Coverage**: 79.7% (51 MCPs / 64 Skills)
- **Documentation**: 100% of skills documented

### Validation Status

- ✅ **Registry Validation**: Passing
- ✅ **Type Checking**: Passing
- ✅ **Linting**: Passing (790 warnings, 0 errors)
- ✅ **Agent Evaluation**: Passing (100% success rate)
- ✅ **Test Coverage**: 78%

### Performance

- **Agent Evaluation**: 47ms avg latency
- **Quick Validation**: 10-30 seconds
- **Full Validation**: 2-5 minutes

---

## 🗺️ Roadmap

### ✅ Completed

- **v3.1.0** (2025-11-24): Agent Evaluation System
  - Phase 5.12 implementation
  - Golden dataset support
  - Multiple grading strategies
  - Performance metrics

- **v3.0.3** (2025-11-14): Validation System
  - Two-tier validation
  - Registry automation
  - Documentation consolidation

- **v2.1.0** (2025-10-29): Orchestration
  - Claude Code integration
  - Registry validation
  - 100% resource discovery

### 🔜 Planned

- **v3.2.0**: Enhanced Agent Evaluation
  - Real agent integration
  - Advanced LLM grading
  - Regression tracking dashboard

- **v3.3.0**: MCP Expansion
  - Additional development MCPs
  - Better skill-MCP coverage
  - Performance improvements

- **v4.0.0**: Ecosystem Integration
  - GitHub Actions workflows
  - VSCode extension
  - Web dashboard

---

## 🤝 Contributing

We welcome contributions! See `CONTRIBUTING.md` for guidelines.

### Ways to Contribute

1. **Add Skills**: Create new specialized methodologies
2. **Add MCPs**: Build executable tools
3. **Improve Documentation**: Clarify guides and examples
4. **Report Issues**: Help us find and fix bugs
5. **Create Datasets**: Expand agent evaluation coverage

### Development Setup

```bash
# Clone the repository
git clone https://github.com/daffy0208/ai-dev-standards.git
cd ai-dev-standards

# Install dependencies
npm install

# Run validation
npm run validate:quick

# Make changes and test
npm test

# Submit PR
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

This repository synthesizes best practices from:

- Claude Code official patterns
- Production software development
- AI-assisted development research
- Community feedback and contributions

**Maintained by:** [@daffy0208](https://github.com/daffy0208)

---

## 📞 Support

- **Documentation**: `docs/` directory
- **Issues**: [GitHub Issues](https://github.com/daffy0208/ai-dev-standards/issues)
- **Discussions**: [GitHub Discussions](https://github.com/daffy0208/ai-dev-standards/discussions)

---

## 🔗 Quick Links

### For Developers

- [Quick Start](docs/QUICK-START.md)
- [Getting Started](docs/GETTING-STARTED.md)
- [Validation System](docs/VALIDATION-SYSTEM.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### For AI Assistants

- [Project Context](meta/PROJECT-CONTEXT.md)
- [How to Use](meta/HOW-TO-USE.md)
- [Skill Registry](meta/skill-registry.json)
- [MCP Registry](meta/mcp-registry.json)

### Configuration

- [Claude Code Config](.claude/CLAUDE.md)
- [Resource Counts](FINAL-RESOURCE-COUNTS.md)
- [Validation Command](.claude/commands/validate.md)

---

**Built for excellence in AI-assisted development** 🚀
