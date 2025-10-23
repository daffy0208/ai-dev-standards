# Documentation Index

Complete guide to all documentation in the ai-dev-standards framework.

## Getting Started

- [Quick Start](QUICK-START.md) - Get up and running in 5 minutes
- [Bootstrap Guide](BOOTSTRAP.md) - Setting up new projects
- [Cheat Sheet](CHEAT-SHEET.md) - Quick reference for common tasks
- [System Overview](SYSTEM-OVERVIEW.md) - Understanding the framework architecture

## Core Documentation

### CLI Tools
- [CLI Quick Start](CLI-QUICKSTART.md) - Command-line interface basics
- [CLI Reference](CLI-REFERENCE.md) - Complete CLI command reference

### Integration & Deployment
- [Integration Guide](INTEGRATION-GUIDE.md) - Integrating with existing projects
- [Existing Projects](EXISTING-PROJECTS.md) - Adding to established codebases
- [Deployment](DEPLOYMENT.md) - Deploying your applications
- [CI/CD Setup](CI-CD-SETUP.md) - Continuous integration configuration

### Development
- [MCP Development Roadmap](MCP-DEVELOPMENT-ROADMAP.md) - MCP server development plan

## System Documentation

### Maintenance & Operations
- [Auto-Sync Guide](AUTO-SYNC-GUIDE.md) - Automatic synchronization system
- [Audit System](AUDIT-SYSTEM.md) - Quality and trust validation
- [Resource Guide](RESOURCE-GUIDE.md) - Resource management and discovery

## Reference Documentation

### By Category

#### 📚 API Documentation
- [API Reference](api/README.md) - Complete API documentation (planned)

#### 💡 Concepts
- [Concepts](concepts/README.md) - Framework concepts and theory (planned)

#### 📖 Guides
- [Step-by-Step Guides](guides/README.md) - Practical tutorials (planned)

## Skills & Tools

### Skills Documentation
Navigate to `/SKILLS/` directory to explore 37 specialized AI agent skills:
- Each skill has a `SKILL.md` (detailed specification)
- Each skill has a `README.md` (user-friendly guide)
- Use the [Skill Registry](../META/skill-registry.json) for a complete list

**New Skills:**
- [dark-matter-analyzer](../SKILLS/dark-matter-analyzer/README.md) - Repository coherence and organizational health analysis

### MCP Servers
Navigate to `/MCP-SERVERS/` directory for MCP tool documentation:
- [accessibility-checker-mcp](../MCP-SERVERS/accessibility-checker-mcp/README.md)
- [component-generator-mcp](../MCP-SERVERS/component-generator-mcp/README.md)
- [dark-matter-analyzer-mcp](../MCP-SERVERS/dark-matter-analyzer-mcp/README.md) - **NEW!** Repository analysis
- [embedding-generator-mcp](../MCP-SERVERS/embedding-generator-mcp/README.md)
- [feature-prioritizer-mcp](../MCP-SERVERS/feature-prioritizer-mcp/README.md)
- [screenshot-testing-mcp](../MCP-SERVERS/screenshot-testing-mcp/README.md)
- [vector-database-mcp](../MCP-SERVERS/vector-database-mcp/README.md)

## Standards & Patterns

### Architecture Patterns
Located in `/STANDARDS/architecture-patterns/`:
- Authentication Patterns
- Database Design Patterns
- Error Tracking
- Event-Driven Architecture
- Logging Strategy
- Microservices Pattern
- Monitoring and Alerting
- RAG Pattern
- Real-Time Systems
- Serverless Pattern

### Best Practices
Located in `/STANDARDS/best-practices/`:
- Database Best Practices
- Security Best Practices
- Testing Best Practices

## Templates

Located in `/TEMPLATES/`:
- Cursor Rules Templates (5 variants)
- CI/CD Templates
- Config File Templates
- Deployment Templates
- Project Starter Templates
- Testing Templates

## Playbooks

Located in `/PLAYBOOKS/`:
- [ADHD Getting Unstuck](../PLAYBOOKS/adhd-getting-unstuck.md)
- [Backup and Restore](../PLAYBOOKS/backup-and-restore.md)
- [Database Migration](../PLAYBOOKS/database-migration.md)
- [Deployment Checklist](../PLAYBOOKS/deployment-checklist.md)
- [Incident Response](../PLAYBOOKS/incident-response.md)
- [Rollback Procedure](../PLAYBOOKS/rollback-procedure.md)
- [Validation-First Development](../PLAYBOOKS/validation-first-development.md)

## Additional Resources

### Root Level Documentation
- [README](../README.md) - Project overview and introduction
- [CONTRIBUTING](../CONTRIBUTING.md) - How to contribute
- [CHANGELOG](../CHANGELOG.md) - Version history
- [BUILD FOCUS](../BUILD_FOCUS.md) - Current development priorities
- [Dark Matter Specification](../DARK-MATTER-SPECIFICATION.md) - Repository analysis framework

### Meta Documentation
Located in `/META/`:
- Skill Registry (`skill-registry.json`)
- Tool Registry (`registry.json`)
- Relationship Mapping (`relationship-mapping.json`)

### Legacy Documentation
Historical documentation moved to `/DOCS-LEGACY/` for reference purposes.

## Contributing to Documentation

When adding new documentation:
1. Follow the existing structure and naming conventions
2. Use kebab-case for filenames (e.g., `my-new-guide.md`)
3. Update this index when adding new docs
4. Link related documents together
5. Include a "Last Updated" date at the bottom

## Documentation Status Legend

- ✅ **Complete** - Fully documented and up to date
- 🔄 **In Progress** - Currently being written or updated
- 📋 **Planned** - Scheduled for future documentation

---

*Last Updated: 2025-10-23*
*Total Documentation Files: 18 active, 20+ legacy*
*Skills: 37 | MCPs: 7 | Skill-to-Tool Ratio: 5.3:1*
