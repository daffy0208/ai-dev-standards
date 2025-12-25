# Claude Code Agents

Claude Code provides specialized agent types that optimize for different development tasks. Each agent has unique capabilities and performance characteristics.

## Available Agent Types

### General-Purpose Agent (Default)

The standard Claude Code agent for most development tasks.

**Use Cases:**

- Code search and analysis
- Multi-step research tasks
- Complex codebase exploration
- File operations and editing
- General development assistance

**Strengths:**

- Searching for code, configurations, and patterns across large codebases
- Analyzing multiple files to understand system architecture
- Investigating complex questions requiring exploration of many files
- Performing multi-step research tasks

**When to Use:**

- Default choice for most development tasks
- When you need comprehensive analysis
- When task involves multiple files or complex relationships

**Documentation:** See `general-purpose.md`

---

### Explore Agent

Fast codebase exploration with configurable thoroughness levels.

**Use Cases:**

- Initial repository assessment
- Architecture understanding
- Rapid codebase familiarization
- Pattern discovery

**Modes:**

- **Quick:** Fast overview, minimal depth
- **Medium:** Balanced exploration (default)
- **Very Thorough:** Deep analysis, maximum detail

**When to Use:**

- Starting work on unfamiliar codebase
- Need architectural overview
- Searching for patterns or conventions
- Building mental model of project

**Documentation:** See `explore.md`

---

### Status Line Setup Agent

Configure status line display settings for Claude Code.

**Use Cases:**

- Customize CLI output format
- Configure status indicators
- Set up display preferences

**When to Use:**

- Initial setup
- Customizing CLI experience
- Adjusting output verbosity

---

### Output Style Setup Agent

Create and manage output style configurations.

**Use Cases:**

- Customize output formatting
- Set up color schemes
- Configure display styles

**When to Use:**

- Personalizing CLI appearance
- Team standardization
- Accessibility adjustments

---

## Choosing the Right Agent

### Decision Tree

1. **Need to explore new codebase?**
   - Use: **Explore Agent** (very thorough mode)

2. **Need quick architecture overview?**
   - Use: **Explore Agent** (quick or medium mode)

3. **Need to configure Claude Code settings?**
   - Use: **Status Line Setup** or **Output Style Setup**

4. **Everything else?**
   - Use: **General-Purpose Agent** (default)

---

## Performance Characteristics

| Agent Type              | Speed    | Depth  | Best For             |
| ----------------------- | -------- | ------ | -------------------- |
| Explore (Quick)         | Fast     | Low    | Quick overviews      |
| Explore (Medium)        | Medium   | Medium | Balanced exploration |
| Explore (Very Thorough) | Slow     | High   | Deep analysis        |
| General-Purpose         | Variable | High   | Most tasks           |
| Setup Agents            | Fast     | N/A    | Configuration        |

---

## Usage Examples

See `usage-examples.md` for practical scenarios and code examples.

---

## Integration with Skills

Agents work seamlessly with the 41 specialized skills in this repository:

- **General-Purpose Agent** can invoke any skill
- **Explore Agent** works well with:
  - dark-matter-analyzer
  - knowledge-base-manager
  - multi-agent-architect
  - performance-optimizer

See `.claude/CLAUDE.md` for complete skill inventory.

---

## Best Practices

1. **Start with Explore** for unfamiliar codebases
2. **Use General-Purpose** for most development work
3. **Match thoroughness** to task complexity
4. **Combine agents** for complex workflows
5. **Document agent choice** in task descriptions

---

## Related Resources

- **Skills:** `/skills/` - 41 specialized development methodologies
- **MCPs:** `/MCP/` - 36 executable servers
- **Tools:** `/tools/` - LangChain and CrewAI tools
- **Components:** `/components/` - Reusable React components

---

## Support

For questions or issues with agents:

1. Check agent-specific documentation
2. Review usage examples
3. Consult skill documentation for related capabilities
4. See GitHub issues: https://github.com/daffy0208/ai-dev-standards
