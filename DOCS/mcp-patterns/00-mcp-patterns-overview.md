# MCP Patterns Overview

## Introduction

The Model Context Protocol (MCP) can be implemented in two fundamentally different ways, each with distinct trade-offs. This document explains both patterns and helps you understand which is appropriate for your use case.

## The Two Patterns

### Pattern 1: Direct MCP (Traditional)

**How it works:**

- Agent loads ALL available tools into context at startup
- Every tool description is included in every prompt
- Agent selects and calls tools directly through MCP protocol

**Visual:**

```
Agent Startup:
┌─────────────────────────────────────┐
│ Agent Context                        │
│ ┌─────────────────────────────────┐ │
│ │ Tool 1: getDocument (500 tokens)│ │
│ │ Tool 2: createPage (500 tokens) │ │
│ │ Tool 3: updateRecord (500...)   │ │
│ │ ... (47 more tools)              │ │
│ │ Total: ~25,000 tokens            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Agent Execution:
Agent → calls tool directly via MCP → Result
```

**Characteristics:**

- ✅ Simple to implement
- ✅ Fast initialization
- ✅ Works with any MCP server
- ✅ No special infrastructure needed
- ❌ Context window fills quickly
- ❌ Scales to ~200 tools maximum
- ❌ High token consumption (all tools always loaded)
- ❌ No self-improvement

### Pattern 2: Code Execution (Advanced)

**How it works:**

- Agent has access to tools as _code files_ in filesystem
- Agent discovers and loads only the tools it needs
- Agent writes and executes code that uses the tools
- Agent can create reusable "skills" that persist

**Visual:**

```
Agent Startup:
┌─────────────────────────────────────┐
│ Agent Context                        │
│ ┌─────────────────────────────────┐ │
│ │ Tools available: 1000+           │ │
│ │ (but not loaded)                 │ │
│ │ Context usage: ~1,000 tokens     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Agent Execution:
Agent → discovers tools via filesystem/search
     → loads ONLY needed tools (2-3 files)
     → writes code using those tools
     → executes code in sandbox
     → (optionally) saves reusable skill
```

**Characteristics:**

- ✅ Massive token reduction (60-95%)
- ✅ Scales to 1000+ tools
- ✅ Self-improving (creates reusable skills)
- ✅ Better latency for complex tasks
- ❌ Complex infrastructure (sandboxes, persistent storage)
- ❌ Requires careful prompting
- ❌ Security considerations (code execution)
- ❌ Longer initial setup

## Side-by-Side Comparison

| Aspect                 | Direct MCP                 | Code Execution                      |
| ---------------------- | -------------------------- | ----------------------------------- |
| **Initial Setup**      | Simple                     | Complex                             |
| **Context Usage**      | High (all tools loaded)    | Low (selective loading)             |
| **Token Consumption**  | Baseline                   | 60-95% less                         |
| **Tools Supported**    | ~200 maximum               | 1000+                               |
| **Latency**            | Baseline                   | Same or better                      |
| **Infrastructure**     | MCP servers only           | MCP + sandbox + storage             |
| **Security**           | Basic MCP security         | 4-layer model required              |
| **Self-Improvement**   | No                         | Yes (skills)                        |
| **Prompt Engineering** | Moderate                   | Complex                             |
| **Platform Support**   | Universal                  | Needs IPython, persistent storage   |
| **Best For**           | Simple agents, quick tasks | Complex workflows, batch processing |

## Detailed Comparison

### Token Consumption

**Direct MCP Example:**

```
Task: "Copy Google Drive doc to Notion"

Context loaded:
- Tool 1: google_drive.get_document (450 tokens)
- Tool 2: google_drive.create_document (480 tokens)
- Tool 3: google_drive.list_files (420 tokens)
- ... (47 more tools)
- Total: ~25,000 tokens

Agent uses 2 tools but pays for all 50.
```

**Code Execution Example:**

```
Task: "Copy Google Drive doc to Notion"

Context loaded:
- Available tools: /servers/ directory listing (200 tokens)

Agent discovers:
- Reads /servers/google-drive/getDocument.ts (400 tokens)
- Reads /servers/notion/createPage.ts (380 tokens)
- Total: ~980 tokens (96% reduction!)
```

### Execution Flow

**Direct MCP:**

```
1. Agent receives task
2. Agent selects tool from loaded context
3. Agent calls tool via MCP
4. Tool returns result
5. Agent processes result
6. Repeat if needed
```

**Code Execution:**

```
1. Agent receives task
2. Agent checks /mnt/skills/ for existing solution
3. If skill exists → use it (fastest path)
4. If no skill:
   a. Discover relevant tools via filesystem/search
   b. Read only needed tool files
   c. Write TypeScript code using those tools
   d. Execute code in sandbox
5. Suggest creating skill for future use
6. Skill persists for next time (self-improvement!)
```

### Scalability

**Direct MCP Scalability Curve:**

```
Tools:    10      50      100     200     500
Tokens:   5K     25K     50K     100K    250K
Context:  ████   ████████████████████    OVERFLOW!
Scale:    ✅     ✅      ⚠️      ❌      ❌
```

**Code Execution Scalability Curve:**

```
Tools:    10      50      100     200     500     1000
Tokens:   2K      3K      4K      5K      6K      8K
Context:  ██     ███     ████    █████   ██████  ████████
Scale:    ✅     ✅      ✅      ✅      ✅      ✅
```

## When to Use Each Pattern

### Use Direct MCP When:

✅ **Simple agents** - 1-3 tools, straightforward tasks
✅ **Real-time interaction** - Chat, quick responses
✅ **Small data** - < 10KB per operation
✅ **Quick prototyping** - MVP, proof of concept
✅ **Limited infrastructure** - Can't support sandboxes
✅ **Low security requirements** - Non-sensitive data
✅ **Stable toolset** - Tools rarely change

**Examples:**

- Slack notification bot
- Simple CRUD operations
- Status checkers
- Basic integrations

### Use Code Execution When:

✅ **Complex agents** - 5+ tools, multi-step workflows
✅ **Heavy data processing** - > 10KB per operation
✅ **Batch operations** - Processing many items
✅ **Self-improving agents** - Want skill accumulation
✅ **Large toolsets** - 100+ tools available
✅ **Security critical** - PII, PHI, financial data
✅ **High usage** - Cost savings matter

**Examples:**

- Data analysis pipelines
- Multi-system integrations
- Document processing workflows
- Customer data operations
- Automated reporting

### Use BOTH (Hybrid Approach):

✅ **Brain orchestrator decides automatically**

- Simple tasks → Direct MCP
- Complex tasks → Code Execution
- Automatic pattern selection based on task analysis

See [Brain Orchestrator Integration](./09-brain-orchestrator-mcp-integration.md) for details.

## Migration Path

### Your Current State

- **50 MCPs** using Direct MCP
- **64 Skills** depending on MCPs
- Works well for current use cases

### Migration Strategy

1. **Assess**: Identify high-value migration candidates
2. **Pilot**: Migrate 1-2 complex MCPs first
3. **Validate**: Measure actual token reduction
4. **Scale**: Gradually migrate more based on results
5. **Optimize**: Build skill library over time

See [Migration Guide](./04-mcp-migration-guide.md) for step-by-step process.

## Architecture Diagrams

### Direct MCP Architecture

```
┌─────────────────────────────────────────────────────┐
│ AI Agent (Claude)                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Context Window                                   │ │
│ │ • System prompt                                  │ │
│ │ • All tool descriptions (25,000 tokens)         │ │
│ │ • User message                                   │ │
│ │ • Conversation history                           │ │
│ └─────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │ MCP Protocol
                   ▼
┌─────────────────────────────────────────────────────┐
│ MCP Servers                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ Google Drive│ │ Notion      │ │ Salesforce  │   │
│ │ • Tools (8) │ │ • Tools (6) │ │ • Tools (12)│   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Code Execution Architecture

```
┌─────────────────────────────────────────────────────┐
│ AI Agent (Claude)                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Context Window                                   │ │
│ │ • System prompt                                  │ │
│ │ • Available tools (200 tokens)                  │ │
│ │ • User message                                   │ │
│ │ • Conversation history                           │ │
│ └─────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │ Discovers & Loads
                   ▼
┌─────────────────────────────────────────────────────┐
│ Filesystem (Code as Tools)                           │
│ /servers/                                            │
│   /google-drive/                                     │
│     getDocument.ts ◄── Agent reads selectively      │
│     createDocument.ts                                │
│   /notion/                                           │
│     createPage.ts ◄── Agent reads selectively       │
│     updatePage.ts                                    │
│   ... (50 servers, 500+ tools)                      │
│                                                      │
│ /mnt/skills/                                         │
│   copy-drive-to-notion.ts ◄── Reusable skills      │
│   analyze-sales-data.ts                              │
└──────────────────┬──────────────────────────────────┘
                   │ Executes Code
                   ▼
┌─────────────────────────────────────────────────────┐
│ Sandbox (Secure Execution)                           │
│ • Docker / gVisor / E2B                              │
│ • Resource limits                                    │
│ • Network isolation                                  │
│ • PII tokenization                                   │
└──────────────────┬──────────────────────────────────┘
                   │ MCP Protocol
                   ▼
┌─────────────────────────────────────────────────────┐
│ MCP Servers (Same as Direct MCP)                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ Google Drive│ │ Notion      │ │ Salesforce  │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Expected Benefits (ai-dev-standards)

Based on analysis of your 50 MCPs and 64 skills:

### Token Savings

- **Simple MCPs** (< 5 tools): 50% reduction
- **Medium MCPs** (5-10 tools): 70% reduction
- **Complex MCPs** (10+ tools): 85% reduction

### Cost Savings (Estimated)

_To be calculated based on actual usage data_

- Current baseline: TBD
- After migration: TBD
- Monthly savings: TBD
- Break-even: TBD

### Skill Library Growth

- Month 1: 5-10 skills created
- Month 3: 20-30 skills (60% reuse)
- Month 6: 40-50 skills (75% reuse)
- Month 12: 60-80 skills (85% reuse)

## Key Principles

### Direct MCP Principles

1. **Simplicity first** - Easy to understand and implement
2. **Universal compatibility** - Works everywhere
3. **Reliable** - Proven pattern
4. **Transparent** - Agent behavior is clear

### Code Execution Principles

1. **Efficiency** - Only load what you need
2. **Scalability** - Grows with your toolset
3. **Self-improvement** - Gets better over time
4. **Security** - Defense-in-depth required

## Next Steps

1. **Understand your needs**: Read [Decision Framework](./01-mcp-decision-framework.md)
2. **Learn the pattern**: Read [Code Execution Pattern](./03-mcp-code-execution-pattern.md)
3. **Plan migration**: Read [Implementation Roadmap](./10-mcp-implementation-roadmap.md)
4. **Start small**: Migrate 1 MCP as proof of concept
5. **Measure results**: Use [Benchmarking Guide](./08-mcp-performance-benchmarking-guide.md)

## Conclusion

Both patterns are valid. **Direct MCP** is simpler and works well for straightforward use cases. **Code Execution** is more complex but enables dramatic token reduction and self-improvement for sophisticated agents.

The best approach for ai-dev-standards is likely **hybrid**: use Direct MCP by default, and Code Execution for high-complexity, high-usage scenarios.

---

**Related Documentation:**

- [Decision Framework](./01-mcp-decision-framework.md) - Choose the right pattern
- [Direct MCP Pattern](./02-mcp-direct-pattern.md) - Your current implementation
- [Code Execution Pattern](./03-mcp-code-execution-pattern.md) - Advanced pattern
- [Migration Guide](./04-mcp-migration-guide.md) - How to convert

**Last Updated**: 2025-11-14
