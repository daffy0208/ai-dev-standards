---
name: Agent Name
description: Clear description of what this agent does and when to invoke it. Be specific about triggers and use cases. Example: "Automated code review agent that analyzes security vulnerabilities and code quality. Use when reviewing pull requests, auditing codebases, or ensuring quality standards."
version: 1.0.0
agent-type: task-oriented | skill-based | tool-powered | multi-agent
execution-pattern: ReAct | Plan-Execute | Hierarchical | Feedback-Loop
required-skills:
  - skill-name-1
  - skill-name-2
required-mcps:
  - mcp-server-name-1
  - mcp-server-name-2
allowed-tools: Read, Write, Bash, Grep, Glob, Edit
---

# Agent Name

## Purpose

One-paragraph explanation of what this agent accomplishes, why it exists, and how it differs from similar agents or direct skill usage.

## Agent Type

**Classification:** [Task-Oriented | Skill-Based | Tool-Powered | Multi-Agent]

**Execution Pattern:** [ReAct | Plan-Execute | Hierarchical | Feedback-Loop]

**Autonomy Level:** [Fully Autonomous | Semi-Autonomous | Supervised]

## When to Invoke This Agent

### ✅ Use This Agent When:

- Specific scenario 1 requiring autonomous execution
- Specific scenario 2 requiring multi-step workflows
- Specific scenario 3 requiring tool orchestration
- When decision-making and adaptation are needed

### ❌ Don't Use When:

- Simple, single-step tasks (use skills directly)
- Real-time interactions required (too slow)
- Low latency critical (agent overhead too high)
- Alternative: [Suggest simpler approach]

## Architecture

### Dependencies

**Required Skills:**
- `skill-name` - Used for [specific purpose]
- `skill-name` - Used for [specific purpose]

**Required MCPs:**
- `mcp-server-name` - Provides [specific capabilities]
- `mcp-server-name` - Provides [specific capabilities]

**Optional Components:**
- `component-name` - Enhances [specific functionality]

### System Diagram

```
┌─────────────────────────────────────┐
│   This Agent                         │
├─────────────────────────────────────┤
│  1. Input Analysis                   │
│  2. Decision Making                  │
│  3. Action Execution                 │
│  4. Result Validation                │
└────────────┬────────────────────────┘
             │
             ├──> Skill 1
             ├──> Skill 2
             ├──> MCP 1
             └──> MCP 2
```

## Execution Workflow

### Phase 1: [Initialization/Planning]

**Objective:** What this phase achieves

**Actions:**
1. Specific action (tools/skills used)
2. Specific action (tools/skills used)
3. Specific action (tools/skills used)

**Decision Points:**
- Decision 1: [Options and selection criteria]
- Decision 2: [Options and selection criteria]

**Outputs:**
- Output 1: [Description and format]
- Output 2: [Description and format]

### Phase 2: [Execution/Implementation]

**Objective:** What this phase achieves

**Actions:**
1. Action (with skill/MCP invocation)
2. Action (with skill/MCP invocation)
3. Action (with skill/MCP invocation)

**Parallel Operations:**
- Can execute simultaneously: [List operations]
- Must execute sequentially: [List operations with reasons]

**Error Handling:**
- Error type 1: [Recovery strategy]
- Error type 2: [Recovery strategy]

### Phase 3: [Validation/Completion]

**Objective:** What this phase achieves

**Validation Checks:**
- [ ] Success criterion 1
- [ ] Success criterion 2
- [ ] Success criterion 3

**Completion Actions:**
1. Final action
2. Reporting/notification
3. Cleanup/resource release

## Execution Patterns

### ReAct Pattern (if applicable)

```
Thought: [What the agent considers]
Action: [What tool/skill it invokes]
Observation: [What result it receives]
Thought: [How it interprets the result]
Action: [Next action based on result]
...
Final Answer: [Ultimate outcome]
```

### State Management

**State Variables:**
- `variable_name`: Purpose and lifecycle
- `variable_name`: Purpose and lifecycle

**State Transitions:**
```
Initial → Phase1 → Phase2 → Phase3 → Complete
              ↓        ↓        ↓
            Error → Retry → Recovery
```

## Configuration

### Input Parameters

```yaml
required:
  - parameter1:
      type: string
      description: What it controls
      default: value
  - parameter2:
      type: integer
      description: What it controls
      range: [min, max]

optional:
  - parameter3:
      type: boolean
      description: What it enables
      default: false
```

### Output Format

```json
{
  "status": "success | failure | partial",
  "result": {
    "key1": "value",
    "key2": "value"
  },
  "metadata": {
    "execution_time": "duration",
    "steps_completed": "count",
    "errors": []
  }
}
```

## Examples

### Example 1: [Simple Use Case]

**Scenario:** Describe the situation and goal

**Input:**
```json
{
  "parameter1": "value",
  "parameter2": 123
}
```

**Execution Trace:**
1. Agent analyzes input → invokes `skill-name`
2. Skill returns data → agent processes with `mcp-name`
3. MCP completes → agent validates results
4. Agent returns final output

**Output:**
```json
{
  "status": "success",
  "result": {
    "outcome": "description"
  }
}
```

**Key Insights:**
- Insight 1 about the execution
- Insight 2 about decision-making
- Insight 3 about efficiency

### Example 2: [Complex Use Case with Errors]

**Scenario:** Describe a challenging situation with complications

**Input:**
```json
{
  "parameter1": "complex_value",
  "parameter2": 456
}
```

**Execution Trace:**
1. Agent starts normally
2. Encounters error condition
3. Applies recovery strategy
4. Retries with adjusted parameters
5. Succeeds on second attempt

**Output:**
```json
{
  "status": "success",
  "result": {
    "outcome": "description",
    "retries": 1
  },
  "metadata": {
    "warnings": ["issue encountered and resolved"]
  }
}
```

**Key Insights:**
- How the agent handled errors
- Why recovery strategy worked
- What could be improved

## Performance Characteristics

**Typical Execution Time:** [Range based on input size]

**Resource Requirements:**
- Memory: [Typical usage]
- API calls: [Approximate count]
- Token usage: [Estimated cost]

**Scalability:**
- Handles inputs up to: [Size limit]
- Parallel instances: [Supported/not supported]
- Bottlenecks: [Known limitations]

## Best Practices

1. **Practice Name**
   - Why it matters
   - How to apply it
   - Example or counter-example

2. **Practice Name**
   - Why it matters
   - How to apply it
   - Example or counter-example

3. **Practice Name**
   - Why it matters
   - How to apply it
   - Example or counter-example

## Troubleshooting

### Issue: [Common Problem 1]

**Symptoms:**
- What you observe when this occurs

**Possible Causes:**
- Cause 1: Configuration issue
- Cause 2: Input validation failure
- Cause 3: Dependency unavailable

**Solutions:**
1. Check [specific configuration]
2. Validate [specific input]
3. Verify [specific dependency]

**Prevention:**
- How to avoid this issue in the future

### Issue: [Common Problem 2]

**Symptoms:**
- Observable indicators

**Possible Causes:**
- List of potential root causes

**Solutions:**
- Step-by-step resolution

**Prevention:**
- Preventive measures

## Integration Guide

### Invoking This Agent

**From CLI:**
```bash
ai-dev agent invoke agent-name --config config.json
```

**From Code:**
```javascript
const agent = new AgentName(config)
const result = await agent.execute(input)
```

**From Another Agent:**
```javascript
const subAgent = orchestrator.invoke('agent-name', {
  input: data,
  timeout: 60000
})
```

### Event Hooks

**Pre-Execution Hook:**
```javascript
agent.on('pre-execute', (context) => {
  // Validation or logging
})
```

**Post-Execution Hook:**
```javascript
agent.on('post-execute', (result) => {
  // Result processing or notification
})
```

**Error Hook:**
```javascript
agent.on('error', (error) => {
  // Error handling or alerting
})
```

## Testing Strategy

### Unit Tests

Test individual decision points and state transitions:

```javascript
describe('AgentName Decision Logic', () => {
  test('selects correct skill based on input', () => {
    // Test implementation
  })
})
```

### Integration Tests

Test interaction with skills and MCPs:

```javascript
describe('AgentName Integration', () => {
  test('correctly orchestrates skill-name and mcp-name', () => {
    // Test implementation
  })
})
```

### End-to-End Tests

Test complete workflows with real inputs:

```javascript
describe('AgentName E2E', () => {
  test('completes full workflow successfully', () => {
    // Test implementation
  })
})
```

## Monitoring and Observability

### Metrics to Track

- Execution success rate
- Average execution time
- Error rate by type
- Resource utilization

### Logging

**Log Levels:**
- DEBUG: State transitions, decision points
- INFO: Phase completions, major actions
- WARN: Recoverable errors, performance issues
- ERROR: Failures requiring attention

**Log Format:**
```json
{
  "timestamp": "ISO-8601",
  "agent": "agent-name",
  "phase": "current-phase",
  "action": "current-action",
  "status": "status",
  "metadata": {}
}
```

## Future Enhancements

1. **Enhancement 1**
   - What: Description of improvement
   - Why: Benefit it would provide
   - Complexity: Estimated effort

2. **Enhancement 2**
   - What: Description of improvement
   - Why: Benefit it would provide
   - Complexity: Estimated effort

## Related Resources

**Related Agents:**
- `agent-name` - How they work together
- `agent-name` - How they complement each other

**Related Skills:**
- `skill-name` - How this skill is leveraged
- `skill-name` - How this skill is leveraged

**Related Playbooks:**
- `PLAYBOOKS/playbook-name.md` - Operational guide
- `PLAYBOOKS/playbook-name.md` - Troubleshooting guide

**Documentation:**
- `AGENTS/AGENT.md` - Agent fundamentals
- `DOCS/MULTI-AGENT-SYSTEMS.md` - Architecture patterns

## Version History

**1.0.0** (YYYY-MM-DD)
- Initial release
- Core functionality implemented
- Basic error handling

---

**Maintainer:** [Name/Team]
**Last Updated:** [Date]
**Status:** [Active | Experimental | Deprecated]
