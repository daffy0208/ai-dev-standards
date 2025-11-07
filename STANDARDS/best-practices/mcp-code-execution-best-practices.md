# MCP Code Execution Best Practices

**Source:** Anthropic Engineering - Code Execution with MCP
**Version:** 1.0.0
**Date:** 2025-11-07
**Category:** MCP Development, Code Execution, Security

---

## Overview

This document outlines best practices for implementing code execution capabilities with the Model Context Protocol (MCP), based on Anthropic's engineering guidance and production experience.

## Key Concepts

### Code Execution vs Tool Calls

**Traditional Approach (Tool Calls):**
- Each tool call consumes context with definitions and results
- Limited scalability for complex workflows
- Higher token usage
- Slower execution for multi-step tasks

**Code Execution with MCP:**
- Agents write code to call tools directly
- More efficient context usage
- Better scalability for complex workflows
- Enables dynamic tool composition

### Security Model

**Sandbox Environment:**
- Isolated execution environment (4GB RAM, 15-minute timeout)
- SOC 2 Type II compliant
- Resource limits enforced
- Network access controlled
- File system restrictions

---

## Best Practices

### 1. Context-Efficient Tool Access

**DO:**
```markdown
✅ Use MCP to expose tools that agents can call via code
✅ Let agents decide whether and how to invoke tools
✅ Enable tool chaining through code composition
✅ Keep tool definitions concise and focused
```

**DON'T:**
```markdown
❌ Expose every function as a separate tool call
❌ Duplicate tool logic across multiple endpoints
❌ Create overly complex tool parameters
❌ Mix execution modes (code vs direct calls) inconsistently
```

### 2. Project Context Setup

**Use CLAUDE.md Files:**
- Document project-specific commands and conventions
- Specify coding styles and patterns
- List key files and their purposes
- Note environment quirks and workarounds
- Include common debugging steps

**Example CLAUDE.md Structure:**
```markdown
# Project Context

## Key Commands
- `npm run dev` - Start development server
- `npm test` - Run test suite
- `npm run lint` - Check code quality

## Coding Conventions
- Use TypeScript strict mode
- Prefer functional components
- Follow ESLint configuration

## Important Files
- `/src/config.ts` - Application configuration
- `/lib/db.ts` - Database utilities
- `/middleware/auth.ts` - Authentication logic

## Known Issues
- Database connection pooling requires manual restart in dev
- Image uploads larger than 5MB need compression
```

### 3. Tool Permissions and Security

**Permission Management:**
- Use allowlists for approved tools
- Implement permission prompts for sensitive operations
- Configure access levels (read-only, workspace-write, full-access)
- Audit tool usage regularly

**Security Checklist:**
```markdown
- [ ] Sandbox configuration verified
- [ ] Resource limits appropriate for workload
- [ ] Sensitive data excluded from execution context
- [ ] Network access restricted to required endpoints
- [ ] File system access limited to workspace
- [ ] Tool permissions documented and reviewed
```

### 4. Structured Task Decomposition

**Workflow:**
1. **Review Context:** Load relevant files and documentation
2. **Plan:** Generate step-by-step execution plan
3. **Think:** Use deep reasoning before implementation
4. **Implement:** Execute changes iteratively
5. **Validate:** Test and verify results

**Prompting Strategies:**
- "Think hard" - Encourage thorough analysis
- "Ultrathink" - Maximum internal reasoning
- "Step by step" - Explicit decomposition
- "Review first" - Context before action

### 5. Multi-Agent Orchestration

**Patterns:**

**Hierarchical (Manager-Worker):**
```
Main Agent
  ├── Task Planner
  ├── Code Executor
  ├── Retriever
  └── Validator
```

**Collaborative:**
```
Agent A ←→ Agent B ←→ Agent C
    ↓         ↓         ↓
      Shared Knowledge Base
```

**Pipeline:**
```
Input → Agent A → Agent B → Agent C → Output
```

**Best Practices:**
- Define clear agent responsibilities
- Implement handoff protocols
- Share context efficiently
- Monitor coordination overhead
- Measure end-to-end performance

### 6. Integration with Existing Tools

**Environment Integration:**
- Inherit local shell environment
- Use existing CLI tools (git, npm, etc.)
- Leverage project-specific scripts
- Integrate with IDE/editor workflows

**Example Integrations:**
```bash
# Git operations
git status && git diff

# Testing workflows
npm test -- --coverage

# Database migrations
npm run migrate:latest

# Deployment
gh workflow run deploy.yml
```

### 7. Memory and Context Management

**Session-Based Memory:**
- Maintain conversation history (up to 60 minutes)
- Use project-level configuration files
- Implement persistent state for long-running tasks
- Clean up context periodically

**Context Optimization:**
```markdown
✅ Reference files by path, load on demand
✅ Use summaries for large documents
✅ Cache frequently used information
✅ Compress historical context
❌ Load entire codebase into context
❌ Repeat identical information
❌ Keep obsolete context active
```

### 8. Error Handling and Recovery

**Robust Execution:**
```python
# Example: Retry logic for tool calls
def execute_with_retry(tool_call, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = tool_call()
            return result
        except TemporaryError as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                time.sleep(wait_time)
                continue
            raise
        except PermanentError:
            # Don't retry permanent failures
            raise
```

**Error Reporting:**
- Capture full error context
- Log execution traces
- Provide actionable error messages
- Suggest recovery steps

---

## Implementation Patterns

### Pattern 1: Safe Code Execution

```python
# Secure execution wrapper
class SafeExecutor:
    def __init__(self, sandbox_config):
        self.sandbox = Sandbox(
            memory_limit="4GB",
            timeout=900,  # 15 minutes
            network_access="restricted",
            file_system="workspace-only"
        )
    
    def execute(self, code, context):
        # Validate code before execution
        if not self.validate_code(code):
            raise SecurityError("Code validation failed")
        
        # Execute in sandbox
        result = self.sandbox.run(code, context)
        
        # Validate output
        return self.sanitize_output(result)
```

### Pattern 2: Tool Composition

```python
# Instead of separate tool calls, compose operations
def analyze_codebase(repo_path):
    # Single code execution that combines multiple operations
    code = """
    import os
    from pathlib import Path
    
    # Analyze structure
    structure = analyze_directory_structure(repo_path)
    
    # Check dependencies
    deps = extract_dependencies()
    
    # Identify patterns
    patterns = detect_architecture_patterns()
    
    # Generate report
    return {
        'structure': structure,
        'dependencies': deps,
        'patterns': patterns
    }
    """
    return execute_code(code, context={'repo_path': repo_path})
```

### Pattern 3: Incremental Validation

```python
# Validate changes incrementally
def implement_feature(spec):
    plan = generate_plan(spec)
    
    for step in plan:
        # Implement step
        code_changes = generate_code(step)
        
        # Validate immediately
        if not validate_step(code_changes):
            rollback(step)
            refine_approach(step)
            continue
        
        # Test before proceeding
        test_results = run_tests(step)
        if not test_results.passed:
            fix_issues(test_results.failures)
    
    return finalize_implementation()
```

---

## MCP Server Development Guidelines

### Server Configuration

```json
{
  "name": "code-executor-mcp",
  "version": "1.0.0",
  "description": "Secure code execution with MCP",
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false
  },
  "security": {
    "sandbox": true,
    "resource_limits": {
      "memory": "4GB",
      "timeout": 900,
      "max_file_size": "50MB"
    },
    "allowed_operations": [
      "file.read",
      "file.write",
      "process.execute"
    ]
  }
}
```

### Tool Design

**Principles:**
- Single responsibility per tool
- Clear input/output contracts
- Idempotent where possible
- Comprehensive error handling
- Usage examples in documentation

**Example Tool Definition:**
```typescript
{
  name: "execute_python",
  description: "Execute Python code in a secure sandbox",
  inputSchema: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "Python code to execute"
      },
      context: {
        type: "object",
        description: "Variables to inject into execution context"
      },
      timeout: {
        type: "number",
        description: "Execution timeout in seconds (max 900)",
        default: 60
      }
    },
    required: ["code"]
  }
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Code Caching:**
   - Cache compiled code when possible
   - Reuse execution environments
   - Minimize cold starts

2. **Context Management:**
   - Load only necessary context
   - Use lazy loading for large resources
   - Implement context compression

3. **Parallel Execution:**
   - Identify independent operations
   - Execute in parallel when safe
   - Aggregate results efficiently

4. **Resource Monitoring:**
   - Track memory usage
   - Monitor execution time
   - Set appropriate limits
   - Alert on threshold breaches

---

## Testing and Validation

### Test Categories

**Unit Tests:**
```python
def test_code_execution():
    executor = CodeExecutor()
    result = executor.execute("print('hello')")
    assert result.output == "hello\n"
    assert result.exit_code == 0
```

**Integration Tests:**
```python
def test_mcp_tool_execution():
    mcp = MCPServer()
    response = mcp.call_tool("execute_python", {
        "code": "import sys; print(sys.version)"
    })
    assert response.success
    assert "Python" in response.output
```

**Security Tests:**
```python
def test_sandbox_isolation():
    # Attempt to access restricted resources
    malicious_code = "import os; os.system('ls /')"
    with pytest.raises(SecurityError):
        executor.execute(malicious_code)
```

**Performance Tests:**
```python
def test_execution_timeout():
    slow_code = "import time; time.sleep(1000)"
    with pytest.raises(TimeoutError):
        executor.execute(slow_code, timeout=5)
```

---

## Migration Guide

### From Tool Calls to Code Execution

**Before (Tool-Based):**
```python
# Multiple tool calls, high context usage
result1 = call_tool("read_file", {"path": "config.json"})
result2 = call_tool("parse_json", {"data": result1})
result3 = call_tool("validate_schema", {"data": result2})
result4 = call_tool("update_field", {"data": result3, "field": "version"})
```

**After (Code Execution):**
```python
# Single code execution, low context usage
code = """
import json

# Read and parse
with open('config.json', 'r') as f:
    config = json.load(f)

# Validate and update
validate_schema(config)
config['version'] = '2.0.0'

# Write back
with open('config.json', 'w') as f:
    json.dump(config, f, indent=2)
"""
execute_code(code)
```

---

## Common Pitfalls

### 1. Over-Reliance on Code Execution
**Problem:** Using code execution for simple operations
**Solution:** Use direct tool calls for atomic operations

### 2. Insufficient Error Handling
**Problem:** Crashes on edge cases
**Solution:** Implement comprehensive try-catch blocks

### 3. Context Bloat
**Problem:** Loading too much information
**Solution:** Load incrementally, use summaries

### 4. Security Gaps
**Problem:** Inadequate sandboxing
**Solution:** Follow security checklist strictly

### 5. Poor User Experience
**Problem:** Long-running operations without feedback
**Solution:** Implement progress reporting

---

## References

- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Anthropic: Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Security Best Practices](./security-best-practices.md)

---

## Version History

- **1.0.0** (2025-11-07): Initial version based on Anthropic engineering article
