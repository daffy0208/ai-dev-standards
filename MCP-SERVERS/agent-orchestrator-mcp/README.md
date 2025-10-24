# Agent Orchestrator MCP Server

Coordinate multi-agent workflows, manage agent communication, and handle state synchronization.

## What This MCP Does

- 🤝 **Agent Coordination** - Orchestrate multiple AI agents
- 💬 **Communication Hub** - Message passing between agents
- 📊 **State Management** - Shared state across agents
- 🔄 **Task Delegation** - Assign tasks to specialized agents
- 📈 **Performance Monitoring** - Track agent metrics
- 🎯 **Workflow Execution** - Sequential and parallel workflows

## Installation

```bash
cd MCP-SERVERS/agent-orchestrator-mcp
npm install && npm run build
```

## Tools

- `configure` - Set orchestration strategy
- `register_agent` - Add agent to orchestrator
- `create_workflow` - Define multi-agent workflow
- `execute_workflow` - Run workflow with agents
- `send_message` - Message between agents
- `get_state` - Retrieve shared state
- `monitor_agents` - Get agent performance metrics

## Usage Example

```javascript
await orchestrator.configure({ strategy: 'sequential' });

// Register agents
await orchestrator.register_agent({ id: 'researcher', capabilities: ['search', 'summarize'] });
await orchestrator.register_agent({ id: 'writer', capabilities: ['write', 'edit'] });

// Create workflow
await orchestrator.create_workflow({
  id: 'blog-post',
  steps: [
    { agent: 'researcher', task: 'research-topic' },
    { agent: 'writer', task: 'write-post' }
  ]
});

// Execute
const result = await orchestrator.execute_workflow({ id: 'blog-post', input: { topic: 'AI' } });
```

## Orchestration Strategies

- **Sequential** - One agent at a time
- **Parallel** - Multiple agents simultaneously
- **Hierarchical** - Supervisor + worker agents
- **Collaborative** - Agents negotiate and collaborate

## Related

- **Enables:** multi-agent-architect skill
- **Use case:** Complex AI systems, agent coordination, parallel processing
