# Explore Agent

Fast, configurable codebase exploration agent for understanding project architecture and structure.

## Overview

The Explore Agent is optimized for:
- Initial codebase assessment
- Architecture understanding
- Pattern discovery
- Rapid familiarization

**Key Feature:** Three thoroughness modes (quick, medium, very thorough)

## Thoroughness Modes

### Quick Mode
**Speed:** Fast (seconds to minutes)
**Depth:** Surface-level overview

**Best For:**
- Quick sanity checks
- Initial repository assessment
- Finding specific patterns
- High-level architecture overview

**What It Does:**
- Scans directory structure
- Identifies main technologies
- Maps key files and folders
- Generates quick summary

**Example:**
```
Task: Get overview of React project structure
Mode: Quick
Time: 30 seconds
Output: Directory tree, tech stack, entry points
```

---

### Medium Mode (Default)
**Speed:** Moderate (5-15 minutes)
**Depth:** Balanced exploration

**Best For:**
- General codebase exploration
- Understanding project organization
- Identifying major components
- Balanced depth vs. speed

**What It Does:**
- Comprehensive directory scan
- File content sampling
- Dependency analysis
- Pattern identification
- Architecture mapping

**Example:**
```
Task: Understand authentication flow
Mode: Medium
Time: 10 minutes
Output: Auth components, API endpoints, data flow, dependencies
```

---

### Very Thorough Mode
**Speed:** Slow (30+ minutes)
**Depth:** Deep, comprehensive analysis

**Best For:**
- Complete system understanding
- Pre-refactoring analysis
- Security audits
- Documentation generation
- Complex system mapping

**What It Does:**
- Reads all relevant files
- Deep dependency analysis
- Cross-reference mapping
- Pattern correlation
- Comprehensive reporting

**Example:**
```
Task: Map entire microservices architecture
Mode: Very Thorough
Time: 45 minutes
Output: Complete service map, API contracts, data flows, dependencies
```

## When to Use Explore Agent

### Perfect Scenarios

1. **New Codebase**
   - Just cloned repository
   - Joining new team
   - Starting new project phase
   - Need orientation

2. **Architecture Understanding**
   - Planning refactoring
   - Designing new features
   - Integration planning
   - System documentation

3. **Pattern Discovery**
   - Finding code conventions
   - Identifying anti-patterns
   - Discovering design patterns
   - Locating similar implementations

4. **Pre-Analysis**
   - Before major changes
   - Security assessment preparation
   - Performance audit setup
   - Migration planning

### Not Ideal For

- **Single file edits** → Use general-purpose agent
- **Ongoing development** → Use general-purpose agent
- **Simple questions** → Use general-purpose agent
- **Configuration tasks** → Use setup agents

## Usage Patterns

### Initial Repository Assessment
```
Scenario: First time seeing codebase
Agent: Explore (Quick)
Time: 1 minute
Goal: Understand what project does and tech stack

Next Step: Explore (Medium) for specific areas of interest
```

### Pre-Refactoring Analysis
```
Scenario: Planning to refactor authentication
Agent: Explore (Very Thorough)
Focus: Authentication-related code
Time: 30 minutes
Goal: Complete understanding before changes

Next Step: General-purpose agent for implementation
```

### Architecture Documentation
```
Scenario: Need to document system architecture
Agent: Explore (Very Thorough)
Scope: Entire application
Time: 45 minutes
Goal: Generate comprehensive architecture docs

Next Step: technical-writer skill to format docs
```

### Pattern Discovery
```
Scenario: Find all API error handling patterns
Agent: Explore (Medium)
Focus: API and error handling code
Time: 10 minutes
Goal: Identify patterns and inconsistencies

Next Step: Standardize using general-purpose agent
```

## Performance Characteristics

### Speed Comparison
```
Quick Mode:     ■□□□□ (20% time)
Medium Mode:    ■■■□□ (60% time)
Very Thorough:  ■■■■■ (100% time)
```

### Depth Comparison
```
Quick Mode:     ■■□□□ (40% depth)
Medium Mode:    ■■■■□ (80% depth)
Very Thorough:  ■■■■■ (100% depth)
```

### Resource Usage
```
Quick Mode:     Low memory, fast CPU
Medium Mode:    Medium memory, medium CPU
Very Thorough:  High memory, sustained CPU
```

## Best Practices

### 1. Choose Appropriate Mode

**Quick** when:
- Time is limited
- Need just overview
- Sanity checking
- Multiple repositories

**Medium** when:
- General exploration
- Balanced needs
- Standard investigation
- Default choice

**Very Thorough** when:
- Critical analysis needed
- Pre-major-changes
- Complete understanding required
- Documentation generation

### 2. Focus Your Exploration

Instead of:
```
"Explore this codebase"
```

Be specific:
```
"Explore authentication and authorization code,
focusing on user permissions and role management"
```

### 3. Combine with Skills

```
Explore Agent → Gather information
↓
Skill Invocation → Specialized analysis
↓
General-Purpose Agent → Implementation
```

Example:
```
1. Explore (Medium) → Find security patterns
2. security-engineer skill → Analyze findings
3. General-Purpose → Implement fixes
```

### 4. Progressive Deepening

```
Start: Quick mode for overview
↓
If interesting: Medium mode for specific areas
↓
If critical: Very Thorough mode for deep dive
```

## Integration with Repository Resources

### Works Well With Skills

**After Exploration, Use:**
- **dark-matter-analyzer** - Identify repository issues
- **knowledge-base-manager** - Organize findings
- **technical-writer** - Document discoveries
- **architecture-designer** - Map system design
- **security-engineer** - Security assessment

### Exploration + Skills Workflow

```
1. Explore (Medium) → Understand codebase
2. archon-manager skill → Plan work
3. Specific skills → Execute tasks
4. General-Purpose → Implementation
```

## Example Workflows

### 1. New Project Onboarding
```
Day 1: Explore (Quick)
- Get project overview
- Understand tech stack
- Identify key files
Time: 30 minutes

Day 2-3: Explore (Medium) by area
- Frontend architecture
- Backend services
- Database schema
- API contracts
Time: 2 hours total

Week 1 End: Explore (Very Thorough) for critical areas
- Authentication system
- Payment processing
- Data security
Time: 1 hour per area
```

### 2. Pre-Refactoring Analysis
```
Step 1: Explore (Medium) - Target area
Identify all code to be refactored
Time: 15 minutes

Step 2: Explore (Very Thorough) - Dependencies
Map all dependent code
Time: 30 minutes

Step 3: General-Purpose - Implementation
Execute refactoring safely
Time: Variable
```

### 3. Security Audit Preparation
```
Step 1: Explore (Very Thorough)
- Authentication code
- Authorization logic
- Data handling
- API endpoints
Time: 1 hour

Step 2: security-engineer skill
Analyze findings
Time: 30 minutes

Step 3: General-Purpose
Implement fixes
Time: Variable
```

## Output Expectations

### Quick Mode Output
```
- Directory structure (tree)
- Technology stack
- Entry points
- Main components
- Key dependencies
- Quick stats (LOC, file count)
```

### Medium Mode Output
```
- Detailed directory analysis
- Component relationships
- Data flow overview
- Architecture patterns
- Code conventions
- Dependency graph
- Pattern summary
```

### Very Thorough Mode Output
```
- Complete file inventory
- Deep dependency analysis
- Cross-reference mapping
- Pattern catalog
- Architecture documentation
- Security considerations
- Performance characteristics
- Technical debt assessment
```

## Tips & Tricks

### Optimize Exploration Speed

1. **Limit Scope**
   ```
   Bad:  "Explore entire monorepo"
   Good: "Explore authentication service in services/auth/"
   ```

2. **Use Appropriate Mode**
   ```
   Don't use Very Thorough for quick checks
   Don't use Quick for critical analysis
   ```

3. **Progressive Deepening**
   ```
   Quick → identify interesting areas
   Medium → explore those areas
   Very Thorough → deep dive specifics
   ```

### Get Better Results

1. **Be Specific**
   - Mention technologies
   - Specify focus areas
   - Include constraints

2. **Provide Context**
   - Project type
   - Main concerns
   - Specific goals

3. **Set Expectations**
   - What you need to know
   - What you'll do next
   - Time available

## Common Use Cases

### 1. "What does this project do?"
```
Mode: Quick
Focus: README, package.json, main files
Time: 1 minute
```

### 2. "How is authentication implemented?"
```
Mode: Medium
Focus: Auth-related code
Time: 10 minutes
```

### 3. "Map the entire system architecture"
```
Mode: Very Thorough
Focus: Entire codebase
Time: 45 minutes
```

### 4. "Find all uses of deprecated API"
```
Mode: Medium
Focus: API usage patterns
Time: 15 minutes
```

### 5. "Understand data flow from frontend to database"
```
Mode: Very Thorough
Focus: Complete data pipeline
Time: 30 minutes
```

## Combining with Other Agents

### Explore → General-Purpose
```
1. Explore to understand
2. General-Purpose to implement
```

### Explore → Skill → General-Purpose
```
1. Explore to gather information
2. Skill for specialized analysis
3. General-Purpose for execution
```

### Multiple Explore Passes
```
1. Quick - Overall structure
2. Medium - Interesting areas
3. Very Thorough - Critical sections
```

## Performance Tips

### For Large Codebases

1. **Start with scope**
   - Don't explore everything at once
   - Focus on specific directories
   - Use file patterns

2. **Use Quick mode first**
   - Get lay of the land
   - Identify key areas
   - Then deep dive

3. **Parallel exploration**
   - Explore different areas separately
   - Combine findings
   - More efficient than one large explore

### For Small Projects

- Quick mode usually sufficient
- Medium for thorough understanding
- Very Thorough rarely needed

## Related Documentation

- **General-Purpose Agent:** For implementation after exploration
- **Usage Examples:** Practical exploration scenarios
- **Skills:** Specialized analysis after exploration
- **README:** Overview of all agent types
