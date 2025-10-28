# Skill-Based Agents

Documentation for skills that function as autonomous agents with decision-making capabilities.

---

## Overview

**Total Skill-Based Agents: 6**

These are specialized skills from the `/SKILLS/` directory that exhibit agent-like characteristics:
- Autonomous decision-making
- Self-directed workflows
- State management
- Coordination with other agents/skills
- Goal-oriented behavior

---

## Agent Classification

### By Function

| Function | Agent | Primary Role |
|----------|-------|--------------|
| **Strategic Coordination** | archon-manager | Project management and strategy |
| **Meta-Orchestration** | framework-orchestrator | Framework and skill coordination |
| **Agent Management** | multi-agent-architect | Multi-agent system design |
| **Quality Enforcement** | codex-review-workflow | Automated code review |
| **Design Governance** | design-system-architect | Design system management |
| **Security Governance** | security-architect | Security architecture |

---

## 1. Archon-Manager

### Overview
Strategic project management agent that provides the WHAT/WHEN layer coordinating with Skills for HOW.

### Agent Characteristics

**Autonomy Level:** High
- Makes strategic decisions about project direction
- Autonomously manages task priorities
- Self-organizes project knowledge

**Decision-Making:**
- When to create/update projects
- How to structure tasks
- Which knowledge to retrieve
- When to escalate issues

**State Management:**
- Maintains project state in Archon MCP
- Tracks task status and dependencies
- Manages knowledge base versions
- Persists project metadata

**Coordination:**
- Coordinates with execution skills
- Delegates tactical work to specialized skills
- Provides strategic context to other agents

### Core Capabilities

**Project Management:**
- Create and manage projects
- Define project scope and goals
- Track project progress
- Manage project metadata

**Task Coordination:**
- Break down high-level goals into tasks
- Assign tasks to appropriate skills/agents
- Track task status (todo, doing, review, done)
- Manage task dependencies

**Knowledge Base Operations:**
- RAG search for relevant knowledge
- Document management
- Version control for project data
- Knowledge retrieval and synthesis

**Strategic Planning:**
- Identify project risks
- Recommend resource allocation
- Suggest task prioritization
- Provide strategic recommendations

### Integration Points

**Works With:**
- All 59 skills (provides strategic layer)
- framework-orchestrator (meta-coordination)
- multi-agent-architect (agent deployment)
- General-purpose agent (execution)

**MCP Integration:**
- Archon MCP for data persistence
- Project/task/document/version APIs
- RAG search capabilities

**Typical Workflow:**
```
1. archon-manager identifies project needs
2. Creates/updates project structure
3. Defines tasks and priorities
4. Coordinates with skills for execution
5. Tracks progress and updates state
6. Provides strategic guidance
```

### Use Cases

1. **Complex Project Management**
   - Multi-phase projects
   - Multiple team members
   - Knowledge-intensive work

2. **Strategic Planning**
   - Feature roadmap planning
   - Resource allocation
   - Risk management

3. **Knowledge Management**
   - Building knowledge bases
   - Document organization
   - Version tracking

4. **Archon+Skills Architecture**
   - Two-layer architecture implementation
   - Strategic/tactical separation
   - Coordinated execution

### Best Practices

1. **Let Archon Handle Strategy**
   - Delegate strategic decisions to archon-manager
   - Focus skills on tactical execution
   - Use archon for coordination

2. **Maintain Clean Separation**
   - WHAT/WHEN → archon-manager
   - HOW → specialized skills
   - WHERE → MCP servers

3. **Leverage Knowledge Base**
   - Use RAG search for context
   - Store project knowledge systematically
   - Version important decisions

### Example Usage

```
Scenario: Building a RAG application

1. Archon-Manager:
   - Creates project "RAG Application"
   - Defines phases: Research, Design, Implementation, Testing
   - Creates tasks for each phase
   - Stores relevant knowledge (papers, docs)

2. Delegates to Skills:
   - rag-implementer for implementation
   - knowledge-base-manager for KB design
   - testing-strategist for test strategy

3. Tracks Progress:
   - Monitors task completion
   - Updates project status
   - Provides progress reports

4. Strategic Decisions:
   - Recommends vector database choice
   - Suggests chunking strategy
   - Prioritizes features
```

---

## 2. Multi-Agent Architect

### Overview
Designs and orchestrates multi-agent systems for complex AI applications requiring specialization and parallel processing.

### Agent Characteristics

**Autonomy Level:** High
- Designs agent topologies independently
- Makes coordination decisions
- Optimizes agent communication patterns

**Decision-Making:**
- Agent selection and assignment
- Communication protocol choice
- Task decomposition strategy
- Resource allocation among agents

**State Management:**
- Tracks active agents and their states
- Manages inter-agent communication
- Monitors agent performance
- Coordinates agent lifecycles

**Coordination:**
- Hub-and-spoke or peer-to-peer coordination
- Message routing between agents
- Conflict resolution
- Load balancing

### Core Capabilities

**Agent System Design:**
- Define agent roles and responsibilities
- Design agent communication patterns
- Create agent coordination strategies
- Establish agent hierarchies

**Task Delegation:**
- Decompose complex tasks
- Assign tasks to appropriate agents
- Monitor task progress
- Handle task failures

**Communication Management:**
- Implement message passing
- Define communication protocols
- Handle asynchronous communication
- Ensure message reliability

**Parallel Processing:**
- Coordinate parallel agent execution
- Manage dependencies between tasks
- Aggregate results from multiple agents
- Optimize throughput

### Integration Points

**Works With:**
- All agents (coordinates them)
- framework-orchestrator (receives orchestration goals)
- archon-manager (receives project context)
- LangChain/CrewAI tools

**Agent Patterns:**
- Sequential (one after another)
- Parallel (simultaneous execution)
- Hierarchical (manager-worker)
- Pipeline (staged processing)

**Typical Workflow:**
```
1. Receives complex task requiring multiple agents
2. Designs agent topology for task
3. Selects and configures agents
4. Establishes communication channels
5. Coordinates agent execution
6. Aggregates and returns results
```

### Use Cases

1. **Complex AI Systems**
   - Research + synthesis + writing pipeline
   - Multi-stage data processing
   - Collaborative problem-solving

2. **Parallel Processing**
   - Process multiple files simultaneously
   - Parallel API calls
   - Concurrent code analysis

3. **Specialized Teams**
   - Security team (threat modeling + review + testing)
   - Development team (frontend + backend + testing)
   - Research team (search + analyze + synthesize)

4. **Scalable Architectures**
   - Microservices-style agent systems
   - Distributed processing
   - Fault-tolerant systems

### Best Practices

1. **Design Clear Boundaries**
   - Each agent has specific responsibility
   - Minimize inter-agent dependencies
   - Clear input/output contracts

2. **Choose Appropriate Patterns**
   - Sequential for dependent tasks
   - Parallel for independent tasks
   - Hierarchical for management needs

3. **Handle Failures Gracefully**
   - Implement retry logic
   - Have fallback strategies
   - Log failures for analysis

4. **Optimize Communication**
   - Minimize message passing
   - Batch when possible
   - Use async for non-blocking ops

### Example Usage

```
Scenario: Security audit of entire codebase

1. Multi-Agent Architect:
   - Designs parallel security audit system
   - Creates specialized agent team:
     * Agent 1: OWASP Top 10 checks
     * Agent 2: Dependency vulnerabilities
     * Agent 3: Authentication review
     * Agent 4: Authorization review
     * Agent 5: Data validation review

2. Coordination:
   - Agents work in parallel on different aspects
   - Each agent uses security-engineer skill
   - Results aggregated at end

3. Communication:
   - Agents report findings independently
   - Coordinator aggregates all findings
   - Produces comprehensive security report

4. Result:
   - 5x faster than sequential processing
   - Comprehensive coverage
   - Prioritized findings
```

---

## 3. Framework-Orchestrator

### Overview
Meta-agent that coordinates all frameworks and skills throughout the project lifecycle with intelligent sequencing.

### Agent Characteristics

**Autonomy Level:** Very High
- Highest-level strategic decisions
- Determines entire workflow sequences
- Self-optimizes based on patterns

**Decision-Making:**
- Which frameworks to use when
- Optimal skill sequencing
- Resource allocation across project
- When to invoke archon-manager vs direct skills

**State Management:**
- Tracks project lifecycle phase
- Monitors skill usage patterns
- Learns optimal sequences
- Maintains framework state

**Coordination:**
- Coordinates archon-manager and other agents
- Orchestrates skill sequences
- Manages framework transitions
- Optimizes overall workflow

### Core Capabilities

**Intelligent Sequencing:**
- Analyze project requirements
- Determine optimal skill order
- Adapt based on project phase
- Learn from successful patterns

**Framework Coordination:**
- Coordinate multiple frameworks
- Handle framework transitions
- Manage framework dependencies
- Optimize framework usage

**Lifecycle Management:**
- Guide project from start to finish
- Adapt to project phase changes
- Ensure proper skill coverage
- Maintain continuity

**Pattern Recognition:**
- Identify project patterns
- Match to known successful sequences
- Recommend best practices
- Avoid common pitfalls

### Integration Points

**Works With:**
- All 59 skills (orchestrates them)
- archon-manager (provides strategy)
- multi-agent-architect (for complex coordination)
- All other agents (top-level coordination)

**Orchestration Levels:**
- Strategic (What frameworks/approaches)
- Tactical (Which skills and when)
- Operational (Detailed execution)

**Typical Workflow:**
```
1. Analyze project requirements and pattern
2. Determine optimal framework sequence
3. Coordinate archon-manager for strategy
4. Sequence appropriate skills
5. Monitor execution and adapt
6. Optimize based on results
```

### Use Cases

1. **Complex Multi-Framework Projects**
   - Projects using multiple methodologies
   - Require different skills at different phases
   - Need intelligent coordination

2. **Project Lifecycle Automation**
   - Automatically sequence skills
   - Adapt to project phases
   - Ensure completeness

3. **Pattern-Based Recommendations**
   - Identify project type
   - Apply proven sequences
   - Adapt to specific needs

4. **Workflow Optimization**
   - Find optimal skill sequences
   - Eliminate redundant work
   - Maximize efficiency

### Best Practices

1. **Trust the Orchestration**
   - Let framework-orchestrator make sequencing decisions
   - Don't micromanage skill order
   - Follow recommended patterns

2. **Provide Clear Requirements**
   - Clearly state project goals
   - Specify constraints
   - Mention preferences

3. **Learn from Patterns**
   - Review recommended sequences
   - Understand rationale
   - Apply learnings to future projects

4. **Adapt as Needed**
   - Adjust when project changes
   - Provide feedback on sequences
   - Refine patterns over time

### Example Usage

```
Scenario: Building a SaaS application from scratch

1. Framework-Orchestrator Analyzes:
   - Project type: SaaS application
   - Pattern match: Product development lifecycle
   - Recommends sequence:
     a. Discovery phase
     b. Design phase
     c. Implementation phase
     d. Testing phase
     e. Deployment phase

2. Coordinates Execution:
   - Discovery: product-strategist → user-researcher → prp-generator
   - Design: ux-designer → visual-designer → design-system-architect
   - Implementation: frontend-builder → api-designer → supabase-developer
   - Testing: testing-strategist → security-architect → performance-optimizer
   - Deployment: deployment-advisor → release-manager

3. Adaptations:
   - If user research reveals pivot, restart discovery
   - If security issues found, loop back to security-architect
   - If performance poor, invoke performance-optimizer

4. Result:
   - Optimal skill sequencing
   - No forgotten steps
   - Efficient workflow
   - High-quality outcome
```

---

## 4. Codex-Review-Workflow

### Overview
Automated code review agent using OpenAI Codex CLI with iterative fix-and-review cycles.

### Agent Characteristics

**Autonomy Level:** Medium-High
- Makes code quality decisions
- Autonomously fixes issues
- Iterates until validation passes

**Decision-Making:**
- What issues to fix first
- How to fix issues
- When to iterate vs stop
- When to escalate to human

**State Management:**
- Tracks review iterations
- Maintains issue list
- Records fixes applied
- Monitors validation status

**Coordination:**
- Works with quality-assurance
- Coordinates with security-architect
- Integrates with CI/CD

### Core Capabilities

**Automated Code Review:**
- Run Codex CLI validation
- Identify code issues
- Categorize by severity
- Generate issue reports

**Iterative Fix-and-Review:**
- Apply automated fixes
- Re-run validation
- Iterate until passing
- Limit iterations to prevent loops

**Quality Enforcement:**
- Enforce coding standards
- Check security vulnerabilities
- Validate best practices
- Ensure compliance

**CI/CD Integration:**
- Pre-commit validation
- PR validation
- Deployment gates
- Quality metrics

### Integration Points

**Works With:**
- quality-assurance skill
- security-architect skill
- testing-strategist skill
- Codex CLI (external tool)

**Workflow Integration:**
- Pre-commit hooks
- CI/CD pipelines
- PR review process
- Deployment gates

**Typical Workflow:**
```
1. Receive code for review
2. Run Codex CLI validation
3. Analyze results
4. Apply automated fixes (if safe)
5. Re-run validation
6. Iterate (max N times)
7. Report final status
8. Escalate if needed
```

### Use Cases

1. **Automated Code Validation**
   - Pre-commit checks
   - PR validation
   - Quality gates

2. **Security Compliance**
   - Vulnerability scanning
   - Security best practices
   - Compliance checks

3. **Quality Assurance**
   - Coding standards
   - Best practices
   - Code smells

4. **CI/CD Integration**
   - Build validation
   - Deployment gates
   - Quality metrics

### Best Practices

1. **Configure Appropriately**
   - Set iteration limits
   - Define validation rules
   - Specify fix strategies

2. **Use in Pipeline**
   - Integrate early in development
   - Don't wait until PR
   - Fail fast

3. **Monitor Results**
   - Track validation rates
   - Identify common issues
   - Refine rules over time

4. **Balance Automation**
   - Automate safe fixes
   - Escalate complex issues
   - Don't over-automate

### Example Usage

```
Scenario: Pre-commit validation

1. Developer commits code
2. Pre-commit hook triggers codex-review-workflow
3. Agent runs Codex CLI:
   - Security checks
   - Code quality checks
   - Best practices checks

4. Issues found:
   - SQL injection vulnerability (High)
   - Missing error handling (Medium)
   - Inconsistent formatting (Low)

5. Agent iterates:
   - Iteration 1: Fixes SQL injection, formatting
   - Iteration 2: Adds error handling
   - Iteration 3: Re-validates, passes

6. Result:
   - Code validated and fixed
   - Commit allowed
   - Quality maintained
```

---

## 5. Design-System Architect

### Overview
Agent for building and maintaining scalable design systems with autonomous design decisions.

### Agent Characteristics

**Autonomy Level:** Medium
- Makes design consistency decisions
- Autonomously maintains design tokens
- Self-enforces design standards

**Decision-Making:**
- Component structure decisions
- Design token values
- When to create new components
- How to ensure consistency

**State Management:**
- Tracks design system state
- Maintains component library
- Manages design token versions
- Monitors usage patterns

**Coordination:**
- Works with visual-designer
- Coordinates with frontend-builder
- Integrates with Figma-developer

### Core Capabilities

**Design System Architecture:**
- Define system structure
- Establish design principles
- Create component hierarchy
- Set up governance model

**Component Management:**
- Create component library
- Maintain components
- Version components
- Document usage

**Design Token Governance:**
- Define design tokens
- Maintain consistency
- Version tokens
- Sync across platforms

**Storybook Integration:**
- Set up Storybook
- Document components
- Create component stories
- Generate visual docs

### Integration Points

**Works With:**
- visual-designer skill
- frontend-builder skill
- figma-developer skill
- component library

**Design Tools:**
- Figma for design
- Storybook for docs
- CSS-in-JS for tokens
- Component frameworks

**Typical Workflow:**
```
1. Analyze design requirements
2. Design system architecture
3. Create design tokens
4. Build component library
5. Set up Storybook
6. Document components
7. Establish governance
```

### Use Cases

1. **Design System Creation**
   - New design system from scratch
   - Component library building
   - Design token definition

2. **Design Consistency**
   - Enforce design standards
   - Maintain consistency
   - Prevent design drift

3. **Component Management**
   - Organize components
   - Version components
   - Document components

4. **Design-Dev Handoff**
   - Bridge design and code
   - Sync tokens
   - Generate code from design

### Best Practices

1. **Start with Principles**
   - Define design principles first
   - Establish governance model
   - Document decisions

2. **Build Atomic**
   - Use atomic design methodology
   - Start with tokens
   - Build up to components

3. **Maintain Consistency**
   - Regular audits
   - Enforce standards
   - Update systematically

4. **Document Everything**
   - Component usage
   - Design decisions
   - Implementation notes

### Example Usage

```
Scenario: Creating design system for SaaS app

1. Design-System Architect:
   - Defines system architecture
   - Establishes design principles
   - Creates design token hierarchy

2. Design Tokens:
   - Colors (primary, secondary, neutrals)
   - Typography (scales, weights)
   - Spacing (scale system)
   - Shadows, borders, radii

3. Component Library:
   - Atoms: Button, Input, Icon
   - Molecules: SearchBar, Card, Alert
   - Organisms: Header, Sidebar, Modal
   - Templates: Dashboard, Settings, Profile

4. Documentation:
   - Storybook for each component
   - Usage guidelines
   - Do's and Don'ts
   - Code examples

5. Result:
   - Consistent design system
   - Reusable components
   - Clear documentation
   - Easy maintenance
```

---

## 6. Security-Architect

### Overview
Comprehensive security architecture agent combining threat modeling, secure design, code review, and compliance.

### Agent Characteristics

**Autonomy Level:** Medium-High
- Makes security decisions
- Autonomously identifies threats
- Self-enforces security policies

**Decision-Making:**
- Security architecture choices
- Threat prioritization
- Compliance requirements
- Security controls selection

**State Management:**
- Tracks security posture
- Maintains threat model
- Monitors compliance status
- Records security decisions

**Coordination:**
- Works with security-engineer
- Coordinates with codex-review-workflow
- Integrates with quality-assurance

### Core Capabilities

**Threat Modeling:**
- Identify threats using STRIDE
- Create threat models
- Prioritize threats
- Design mitigations

**Security-First Design:**
- Design secure architectures
- Apply security patterns
- Implement defense-in-depth
- Ensure least privilege

**Secure Code Review:**
- Review for vulnerabilities
- Check OWASP Top 10
- Validate input handling
- Ensure secure defaults

**Compliance Validation:**
- GDPR compliance
- SOC2 requirements
- HIPAA validation
- Industry standards

### Integration Points

**Works With:**
- security-engineer skill
- codex-review-workflow agent
- quality-assurance skill
- Testing tools

**Security Frameworks:**
- STRIDE threat modeling
- OWASP Top 10
- NIST Cybersecurity Framework
- CIS Controls

**Typical Workflow:**
```
1. Analyze system architecture
2. Create threat model
3. Design security controls
4. Review code for vulnerabilities
5. Validate compliance
6. Generate security report
7. Recommend improvements
```

### Use Cases

1. **Security Architecture Design**
   - New system security design
   - Architecture security review
   - Security control selection

2. **Threat Modeling**
   - Identify potential threats
   - Assess risk levels
   - Design mitigations

3. **Compliance Validation**
   - GDPR compliance
   - SOC2 audit prep
   - HIPAA validation

4. **Security Audits**
   - Comprehensive security review
   - Vulnerability assessment
   - Penetration test prep

### Best Practices

1. **Security by Design**
   - Build security in from start
   - Don't bolt on later
   - Consider all layers

2. **Defense in Depth**
   - Multiple security layers
   - Assume breach mentality
   - Limit blast radius

3. **Regular Reviews**
   - Continuous security assessment
   - Regular threat model updates
   - Ongoing compliance checks

4. **Document Everything**
   - Security decisions
   - Threat models
   - Compliance evidence

### Example Usage

```
Scenario: Security architecture for healthcare app

1. Security-Architect:
   - Creates threat model using STRIDE
   - Identifies key threats:
     * Data breach (High)
     * Unauthorized access (High)
     * Data tampering (Medium)

2. Security Controls:
   - Authentication: Multi-factor
   - Authorization: RBAC with audit trail
   - Encryption: TLS 1.3, AES-256
   - Data handling: PHI protection

3. Compliance:
   - HIPAA requirements
   - Security rule compliance
   - Privacy rule compliance
   - Breach notification ready

4. Code Review:
   - SQL injection checks
   - XSS prevention
   - CSRF protection
   - Secure session management

5. Result:
   - Secure architecture
   - HIPAA compliant
   - Documented security controls
   - Regular security reviews
```

---

## Comparison Matrix

| Agent | Autonomy | Decision Scope | Primary Function | Integration Complexity |
|-------|----------|---------------|------------------|----------------------|
| archon-manager | High | Strategic | Project management | Medium |
| multi-agent-architect | High | Tactical | Agent coordination | High |
| framework-orchestrator | Very High | Meta-Strategic | Framework coordination | Very High |
| codex-review-workflow | Medium-High | Operational | Code validation | Medium |
| design-system-architect | Medium | Tactical | Design governance | Medium |
| security-architect | Medium-High | Tactical | Security governance | Medium |

---

## When to Use Skill-Based Agents

### Use Archon-Manager when:
- Managing complex projects
- Need strategic coordination
- Building knowledge-intensive apps
- Require project state persistence

### Use Multi-Agent Architect when:
- Building multi-agent systems
- Need parallel processing
- Complex coordination required
- Scalable architecture needed

### Use Framework-Orchestrator when:
- Complex multi-framework projects
- Need intelligent skill sequencing
- Project lifecycle automation
- Optimal workflow required

### Use Codex-Review-Workflow when:
- Automated validation needed
- CI/CD integration
- Quality gates
- Security compliance

### Use Design-System Architect when:
- Building design systems
- Need design consistency
- Component library management
- Design-dev sync

### Use Security-Architect when:
- Security architecture needed
- Threat modeling required
- Compliance validation
- Security governance

---

## Related Documentation

- **agent-types.md** - Complete agent taxonomy
- **agent-workflows.md** - Agent coordination patterns
- **agent-selection-guide.md** - Decision tree
- **multi-agent-patterns.md** - Multi-agent patterns
- **CLAUDE.md** - Complete system documentation

---

## Version History

- **v1.0.0** (2025-10-28) - Initial documentation with 6 skill-based agents
