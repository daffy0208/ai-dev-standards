# General-Purpose Agent

The standard Claude Code agent for comprehensive development tasks.

## Overview

The general-purpose agent is Claude Code's default mode, optimized for:

- Multi-file analysis and editing
- Complex codebase exploration
- Research and investigation
- Comprehensive development tasks

## Core Capabilities

### 1. Code Search & Analysis

- Search across large codebases efficiently
- Pattern recognition and matching
- Analyze code relationships
- Identify dependencies

**Tools Used:**

- Grep: Content search with regex support
- Glob: File pattern matching
- Read: File content analysis

### 2. System Architecture Understanding

- Analyze multiple files simultaneously
- Map component relationships
- Understand system design
- Identify architectural patterns

### 3. Multi-Step Research

- Break down complex questions
- Gather information across multiple sources
- Synthesize findings
- Generate comprehensive reports

### 4. File Operations

- Read, write, and edit files
- Safe file modifications
- Batch operations
- Preserve file formatting

## Strengths

### Comprehensive Analysis

- Can analyze entire directories
- Tracks relationships between files
- Builds complete mental models
- Provides thorough explanations

### Flexibility

- Adapts to any development task
- Works with any programming language
- Handles any file type
- Scales to any codebase size

### Accuracy

- Verifies before acting
- Checks dependencies
- Validates changes
- Maintains consistency

## Usage Patterns

### Code Investigation

```
Task: Find all uses of deprecated API
Agent: General-Purpose (default)
Approach:
1. Grep for API references
2. Read affected files
3. Analyze usage patterns
4. Generate replacement plan
```

### Refactoring

```
Task: Rename component across codebase
Agent: General-Purpose (default)
Approach:
1. Find all component references
2. Identify import statements
3. Update all occurrences
4. Verify no broken references
```

### Feature Implementation

```
Task: Add authentication to application
Agent: General-Purpose (default)
Skills: security-engineer, frontend-builder
Approach:
1. Analyze existing auth patterns
2. Design authentication flow
3. Implement auth components
4. Add security validation
```

## Best Practices

### 1. Clear Task Definition

- Specify exactly what you need
- Include context and constraints
- Mention relevant files/directories
- State expected outcomes

### 2. Leverage Skills

The general-purpose agent can invoke any of the 41 specialized skills:

- Use archon-manager for project coordination
- Use rag-implementer for knowledge systems
- Use security-engineer for security reviews
- Use performance-optimizer for speed improvements

### 3. Provide Context

- Share relevant file paths
- Mention technologies in use
- Describe project structure
- Include any constraints

### 4. Iterative Refinement

- Start with high-level analysis
- Drill down as needed
- Verify each step
- Adjust based on findings

## Performance Considerations

### Speed

- Variable based on task complexity
- Can be slow for very large codebases
- Optimize by specifying exact locations
- Use Glob/Grep for targeted searches

### Memory

- Handles large files efficiently
- Can read thousands of files
- Maintains context across operations
- Automatic context management

### Accuracy

- High precision for code analysis
- Validates before making changes
- Checks for side effects
- Maintains code quality

## When to Use

Use the general-purpose agent when:

- Task involves multiple files
- Need comprehensive analysis
- Require accurate modifications
- Want skill integration
- Default choice for most tasks

## When NOT to Use

Consider alternatives when:

- Need quick codebase overview → Use Explore Agent
- Only configuring settings → Use Setup Agents
- Need simple single-file edit → Direct editing faster

## Integration with Repository Resources

### Skills Integration

Seamlessly invoke any skill:

```
- archon-manager: Project management
- rag-implementer: Knowledge bases
- security-engineer: Security audits
- performance-optimizer: Performance tuning
- frontend-builder: UI development
... and 36 more skills
```

### MCP Servers

Access 36 MCP servers for:

- Vector databases
- Graph databases
- Observability
- File operations
- And more

### Tools & Components

- Use 28 LangChain/CrewAI tools
- Access 70 React components
- Leverage 25 integrations

## Advanced Usage

### Multi-Agent Coordination

```
Agent: General-Purpose
Skill: multi-agent-architect
Task: Complex system requiring multiple specialized agents
```

### Knowledge Base Operations

```
Agent: General-Purpose
Skill: knowledge-base-manager
Task: Build comprehensive knowledge systems
```

### Security Review

```
Agent: General-Purpose
Skill: security-engineer
Task: Complete security audit
```

## Example Workflows

### 1. Bug Investigation

```
1. Use Grep to find error messages
2. Read relevant source files
3. Analyze stack traces
4. Identify root cause
5. Propose fix
6. Implement solution
7. Verify fix works
```

### 2. Feature Addition

```
1. Analyze existing architecture
2. Design feature integration
3. Identify affected files
4. Implement changes
5. Add tests
6. Update documentation
```

### 3. Refactoring

```
1. Identify code to refactor
2. Find all dependencies
3. Plan refactoring steps
4. Execute changes safely
5. Verify no regressions
6. Update related code
```

## Tips & Tricks

### Optimize Performance

- Use specific file paths when known
- Limit search scope with Glob patterns
- Use Grep for targeted content search
- Read only necessary files

### Improve Accuracy

- Provide clear, specific instructions
- Include relevant context
- Verify intermediate results
- Test changes incrementally

### Leverage Skills

- Invoke skills for specialized tasks
- Combine multiple skills
- Use archon-manager for orchestration
- Apply skill-specific best practices

## Common Pitfalls

### 1. Vague Instructions

Problem: "Fix the code"
Solution: "Fix the authentication bug in auth.ts where users can't log in with special characters"

### 2. Missing Context

Problem: "Add a feature"
Solution: "Add password reset feature to the React app, integrating with existing Supabase auth"

### 3. Not Using Skills

Problem: Asking general agent to do specialized task
Solution: Invoke appropriate skill (e.g., security-engineer for security tasks)

## Related Documentation

- **Explore Agent:** For initial codebase exploration
- **Skills:** 41 specialized capabilities in `/SKILLS/`
- **MCPs:** 36 executable servers in `/MCP/`
- **Usage Examples:** Practical scenarios in `usage-examples.md`
