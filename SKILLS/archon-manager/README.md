# Archon Manager Skill

**Master Archon MCP for strategic project management and knowledge operations.**

## Overview

The Archon Manager skill teaches you how to use Archon MCP effectively as the **strategic layer** in your development workflow. Archon manages WHAT to build and WHEN, while Skills guide HOW to build it well.

## What You'll Learn

- **Project Management**: Create hierarchical projects with features and tasks
- **Task Tracking**: Priority-based workflow (P0/P1/P2), status management
- **Knowledge Management**: RAG queries, web crawling, document processing
- **Two-Layer Architecture**: Archon (strategic) + Skills (tactical) pattern
- **Progress Tracking**: Metrics, velocity, burndown charts
- **Team Coordination**: Multi-AI-assistant collaboration

## When to Use

- Starting a new project that needs structured task management
- Building a knowledge base for AI-assisted development
- Implementing priority-based workflows
- Coordinating multiple AI coding assistants
- Maintaining context across long-running projects
- Tracking progress and velocity

## Key Features

### Strategic Layer (WHAT/WHEN)
- **Task Management**: Get next priority task automatically
- **Project Structure**: Hierarchical organization (projects → features → tasks)
- **Priority System**: P0/P1/P2 for effective prioritization
- **Status Tracking**: todo → doing → review → done

### Knowledge Layer (Context)
- **RAG Queries**: Semantic search across documentation
- **Web Crawling**: Automatic sitemap detection and scraping
- **Document Processing**: PDFs with intelligent chunking
- **Code Examples**: Extract and search example code
- **Version Control**: Track project documentation versions

### Integration Layer (Coordination)
- **Multi-Client Support**: Claude Code, Cursor, Windsurf
- **Real-Time Updates**: Socket.IO for live collaboration
- **Unified Context**: Same knowledge base across all AI assistants

## Quick Start

### 1. Install Archon

```bash
# Clone repository
git clone https://github.com/coleam00/Archon.git
cd Archon

# Configure
cp .env.example .env
# Edit .env with Supabase credentials

# Start services
docker compose up --build -d

# Access UI: http://localhost:3737
```

### 2. Connect to Claude Code

Add to `.claude/mcp-settings.json`:
```json
{
  "mcpServers": {
    "archon": {
      "command": "node",
      "args": ["/path/to/archon/mcp-server/dist/index.js"],
      "env": {
        "ARCHON_API_URL": "http://localhost:8181"
      }
    }
  }
}
```

### 3. Create Project

```typescript
archon:create_project({
  name: "My Application",
  description: "Full-stack web app",
  status: "active"
})
```

### 4. Add Knowledge

```typescript
// Crawl documentation
archon:crawl_website({
  url: "https://nextjs.org/docs",
  follow_sitemap: true,
  tags: ["nextjs", "documentation"]
})
```

### 5. Use Two-Layer Workflow

```typescript
// Strategic (Archon): Get task
const task = archon:get_next_task({project_id: "uuid"})

// Strategic (Archon): Research
const research = archon:perform_rag_query({
  query: task.title,
  match_count: 5
})

// Tactical (Skills): Implement
// AI invokes relevant skills for implementation

// Strategic (Archon): Complete
archon:update_task({task_id: task.id, status: "done"})
```

## The Two-Layer Architecture

```
ARCHON (Strategic)              SKILLS (Tactical)
    ↓                               ↓
WHAT to build, WHEN          HOW to build well
Task management              Domain expertise
Priority queue               Best practices
Knowledge queries            Implementation patterns
Context preservation         Quality standards
```

**Together**: Strategic coherence + Tactical excellence = Optimal outcomes

## Common Use Cases

### Solo Developer
```typescript
// Morning: Get priority task
const task = archon:get_next_task({project_id: "uuid"})

// Research before starting
const research = archon:perform_rag_query({
  query: task.title + " implementation",
  match_count: 5
})

// Work on task (Skills guide implementation)

// Evening: Mark complete
archon:update_task({task_id: task.id, status: "done"})
```

### Team Collaboration
```typescript
// Lead creates structure
archon:create_project({name: "Team Project"})
archon:create_feature({name: "Backend", assigned_to: "dev-1"})
archon:create_feature({name: "Frontend", assigned_to: "dev-2"})

// Everyone queries same knowledge base
// Real-time sync across team
```

### Knowledge-Intensive Work
```typescript
// Build comprehensive knowledge base
archon:crawl_website({url: "https://docs.framework.com"})
archon:add_document({file_path: "architecture-spec.pdf"})
archon:extract_code_examples({source_url: "https://github.com/..."})

// Query for any implementation question
archon:perform_rag_query({query: "How to implement X"})
```

## Archon MCP Tools

### Project Management
- `create_project`, `list_projects`, `get_project`, `update_project`
- `create_feature`, `list_features`, `update_feature`
- `create_task`, `get_next_task`, `update_task`, `list_tasks`
- `generate_tasks` (AI-assisted)

### Knowledge Management
- `perform_rag_query` - Semantic search
- `search_code_examples` - Find code snippets
- `crawl_website` - Ingest web documentation
- `add_document` - Upload PDFs
- `extract_code_examples` - Pull from repos

### Metrics
- `get_project_metrics` - Overview stats
- `get_velocity` - Tasks per week
- `get_burndown` - Sprint progress

## Best Practices

### 1. Clear Project Structure
```
Project
├── Feature (P0): Core functionality
│   ├── Task (P0): Must-have
│   └── Task (P1): Important
├── Feature (P1): Enhancement
│   └── Task (P1): High value
└── Feature (P2): Nice-to-have
    └── Task (P2): Polish
```

### 2. Effective Prioritization
- **P0**: Core value prop, blocks everything
- **P1**: Important, high impact
- **P2**: Enhancement, can wait

### 3. Status Discipline
```
todo → doing → review → done
```
Update immediately when changing state.

### 4. Rich Knowledge Base
- Crawl all relevant documentation
- Add architecture documents
- Extract code examples
- Tag consistently

### 5. Strategic Queries
```typescript
// Before task: research
archon:perform_rag_query({query: "How to implement " + task.title})

// During task: specific questions
archon:perform_rag_query({query: "Edge case handling for X"})

// Architecture: decision support
archon:perform_rag_query({query: "Pattern A vs Pattern B for..."})
```

## Related Skills

- **rag-implementer**: Building RAG systems (Archon uses RAG internally)
- **knowledge-base-manager**: KB design patterns
- **mvp-builder**: Feature prioritization (P0/P1/P2 logic)
- **product-strategist**: Product planning and validation
- **multi-agent-architect**: Coordinating multiple AI agents

## MCP Support

Works with **Archon MCP** (official, external):
- Installation: https://github.com/coleam00/Archon
- Port: http://localhost:8051
- Services: API (8181), UI (3737), Agents (8052)

## Integration Examples

- **Next.js Project**: Project management + knowledge base from Next.js docs
- **Team Development**: Multiple developers coordinated through Archon
- **RAG Application**: Using Archon's own RAG for building RAG systems
- **Multi-AI Setup**: Claude Code + Cursor + Windsurf on same project

## Architecture

Archon uses microservices:
- **Frontend**: React dashboard (port 3737)
- **API**: FastAPI business logic (port 8181)
- **MCP Server**: Protocol interface (port 8051)
- **Agents**: PydanticAI for ML (port 8052)

All communicate via HTTP with Socket.IO for real-time updates.

## Success Criteria

You're using Archon effectively when:
- [ ] Project structure is hierarchical and organized
- [ ] Always know what's next (get_next_task guides work)
- [ ] RAG queries return relevant, useful results
- [ ] Tasks flow smoothly: todo → doing → review → done
- [ ] Progress is visible through metrics
- [ ] Context preserved across sessions
- [ ] Skills invoked for implementation guidance

## Resources

- Full implementation guide: SKILL.md
- Integration patterns: DOCS/ARCHON-INTEGRATION.md
- Complete example: EXAMPLES/archon-workflow-example.md
- Official repository: https://github.com/coleam00/Archon
- Official docs: https://archon-ai.com

---

**Version**: 1.0.0
**Category**: Project Management
**Estimated Time**: 1-2 hours setup, ongoing use
