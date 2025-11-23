# Agent Workflows & Coordination Patterns

How agents work together to accomplish complex tasks through proven coordination patterns.

---

## Table of Contents

1. [Overview](#overview)
2. [Basic Patterns](#basic-patterns)
3. [Advanced Patterns](#advanced-patterns)
4. [Real-World Workflows](#real-world-workflows)
5. [Best Practices](#best-practices)

---

## Overview

Agents can be coordinated in various patterns to accomplish complex tasks more efficiently than single-agent approaches. This document catalogs proven coordination patterns and workflows.

**Key Principles:**

- **Separation of Concerns:** Each agent has a clear responsibility
- **Loose Coupling:** Agents communicate through well-defined interfaces
- **Composability:** Patterns can be combined for complex workflows
- **Fault Tolerance:** Workflows handle agent failures gracefully

---

## Basic Patterns

### 1. Sequential Pattern

**Structure:**

```
Agent A → Agent B → Agent C
```

**Description:** Agents execute one after another, with each agent's output becoming the next agent's input.

**When to Use:**

- Tasks have clear dependencies
- Each step builds on previous results
- Order matters

**Example:**

```
Workflow: Feature Implementation
1. Explore Agent (Medium) → Understand codebase
2. General-Purpose + frontend-builder → Design implementation
3. General-Purpose + testing-strategist → Add tests
4. Codex-Review-Workflow → Validate code
```

**Advantages:**

- Simple to understand and implement
- Clear data flow
- Easy to debug

**Disadvantages:**

- Slow (serial execution)
- Blocked by any agent failure
- No parallelization

---

### 2. Parallel Pattern

**Structure:**

```
        Agent B
       ↗
Agent A → Agent C
       ↘
        Agent D
```

**Description:** Multiple agents execute simultaneously on independent tasks, results aggregated at the end.

**When to Use:**

- Tasks are independent
- No dependencies between agents
- Time is critical

**Example:**

```
Workflow: Comprehensive Security Audit
Coordinator: Multi-Agent Architect

Parallel Execution:
├── Agent 1: OWASP Top 10 checks
├── Agent 2: Dependency vulnerabilities
├── Agent 3: Authentication review
├── Agent 4: Authorization review
└── Agent 5: Data validation review

Aggregation: Combine all findings into report
```

**Advantages:**

- Fast (parallel execution)
- Efficient resource utilization
- Scalable

**Disadvantages:**

- More complex coordination
- Requires aggregation logic
- Resource intensive

---

### 3. Hierarchical Pattern

**Structure:**

```
    Coordinator
    ├── Worker A
    ├── Worker B
    └── Worker C
```

**Description:** One agent (coordinator) manages multiple worker agents, delegating tasks and aggregating results.

**When to Use:**

- Complex task needs decomposition
- Centralized control needed
- Dynamic task assignment

**Example:**

```
Workflow: Multi-Service Refactoring
Coordinator: Multi-Agent Architect

Task Decomposition:
├── Worker 1 (General-Purpose): Refactor service A
├── Worker 2 (General-Purpose): Refactor service B
├── Worker 3 (General-Purpose): Refactor service C
└── Worker 4 (General-Purpose): Update shared libraries

Coordinator:
- Assigns tasks
- Monitors progress
- Handles dependencies
- Aggregates results
```

**Advantages:**

- Centralized control
- Dynamic task assignment
- Handles complexity well

**Disadvantages:**

- Single point of failure (coordinator)
- Coordinator can become bottleneck
- More complex implementation

---

### 4. Pipeline Pattern

**Structure:**

```
Agent A → [Buffer] → Agent B → [Buffer] → Agent C
```

**Description:** Agents arranged in stages with buffers, allowing streaming and partial results.

**When to Use:**

- Processing large datasets
- Want incremental results
- Memory constraints

**Example:**

```
Workflow: Large Codebase Analysis
Stage 1: Explore Agent → Find all files
  ↓ [File list buffer]
Stage 2: General-Purpose → Analyze each file
  ↓ [Analysis buffer]
Stage 3: General-Purpose + technical-writer → Generate report
```

**Advantages:**

- Streaming processing
- Memory efficient
- Incremental results

**Disadvantages:**

- Complex buffer management
- Backpressure handling needed
- Debugging harder

---

### 5. Hub-and-Spoke Pattern

**Structure:**

```
     Worker B
         ↑
Worker A ← Hub → Worker C
         ↓
     Worker D
```

**Description:** Central hub agent coordinates all other agents, routing messages and managing state.

**When to Use:**

- Complex inter-agent communication
- Shared state needed
- Centralized logging/monitoring

**Example:**

```
Workflow: Real-Time Collaboration System
Hub: Framework-Orchestrator

Spokes:
├── archon-manager (project state)
├── frontend-builder (UI updates)
├── api-designer (backend coordination)
└── testing-strategist (continuous testing)

Hub:
- Routes messages between agents
- Maintains shared state
- Coordinates workflows
- Provides monitoring
```

**Advantages:**

- Centralized coordination
- Easy to add new agents
- Shared state management

**Disadvantages:**

- Hub is single point of failure
- Can become bottleneck
- Requires robust hub implementation

---

## Advanced Patterns

### 6. Iterative Refinement Pattern

**Structure:**

```
Agent A → Agent B → Evaluator
            ↑          ↓
            └──────────┘
         (loop if not satisfied)
```

**Description:** Agents work in loop, refining output until quality threshold met.

**When to Use:**

- Quality threshold required
- Iterative improvement possible
- Maximum iterations acceptable

**Example:**

```
Workflow: Automated Code Quality
1. General-Purpose: Write initial code
2. Codex-Review-Workflow: Review code
3. Evaluator: Check if passing
4. If not passing: General-Purpose fixes issues, repeat
5. If passing: Done
```

**Implementation:**

```python
max_iterations = 5
for i in range(max_iterations):
    code = general_purpose_agent.generate()
    results = codex_review.validate(code)
    if results.passing:
        break
    general_purpose_agent.fix(results.issues)
```

---

### 7. Consensus Pattern

**Structure:**

```
Agent A ─┐
Agent B ─┤→ Consensus → Final Decision
Agent C ─┘
```

**Description:** Multiple agents provide recommendations, consensus mechanism makes final decision.

**When to Use:**

- Critical decisions
- Want multiple perspectives
- Need confidence threshold

**Example:**

```
Workflow: Architecture Decision
├── Agent 1 (performance-optimizer): Performance perspective
├── Agent 2 (security-architect): Security perspective
├── Agent 3 (deployment-advisor): Deployment perspective
└── Consensus: Weight recommendations, make decision
```

---

### 8. Fallback Pattern

**Structure:**

```
Primary Agent → Success? Yes → Done
               ↓ No
            Fallback Agent → Success? Yes → Done
                           ↓ No
                        Manual Escalation
```

**Description:** Try primary agent, fall back to alternatives if it fails.

**When to Use:**

- Reliability critical
- Multiple approaches possible
- Graceful degradation needed

**Example:**

```
Workflow: Code Generation
1. Try: GPT-4 generation (primary)
   └─ If fails: Try GPT-3.5 (fallback)
      └─ If fails: Use template (fallback)
         └─ If fails: Escalate to human
```

---

### 9. Map-Reduce Pattern

**Structure:**

```
        ┌→ Worker A → Result A ┐
Data → Map Worker B → Result B  Reduce → Final
        └→ Worker C → Result C ┘
```

**Description:** Distribute work across multiple workers, aggregate results.

**When to Use:**

- Large dataset processing
- Parallel processing needed
- Results can be aggregated

**Example:**

```
Workflow: Repository-Wide Analysis
Map Phase:
├── Worker 1: Analyze frontend/
├── Worker 2: Analyze backend/
├── Worker 3: Analyze database/
└── Worker 4: Analyze tests/

Reduce Phase:
└── Aggregate findings into comprehensive report
```

---

### 10. Event-Driven Pattern

**Structure:**

```
Event Bus
├─→ Listener Agent A
├─→ Listener Agent B
└─→ Listener Agent C
```

**Description:** Agents subscribe to events, react when events occur.

**When to Use:**

- Asynchronous processing
- Loose coupling desired
- Reactive systems

**Example:**

```
Workflow: Continuous Integration
Event: Code committed

Listeners:
├── codex-review-workflow → Validate code
├── testing-strategist → Run tests
├── security-architect → Security scan
└── archon-manager → Update project status
```

---

## Real-World Workflows

### Workflow 1: End-to-End Feature Development

**Pattern:** Sequential + Parallel + Hierarchical

```
Phase 1: Discovery (Sequential)
└── Explore Agent (Medium) → Understand current system

Phase 2: Planning (Sequential)
├── archon-manager → Create project and tasks
└── General-Purpose + product-strategist → Define requirements

Phase 3: Design (Parallel)
├── ux-designer → User experience
├── visual-designer → Visual design
└── api-designer → API contracts

Phase 4: Implementation (Hierarchical)
Coordinator: Multi-Agent Architect
├── frontend-builder → UI components
├── api-designer → Backend endpoints
├── supabase-developer → Database & auth
└── testing-strategist → Test suite

Phase 5: Quality Assurance (Sequential)
├── codex-review-workflow → Code validation
├── security-architect → Security review
└── performance-optimizer → Performance check

Phase 6: Deployment (Sequential)
├── deployment-advisor → Deploy strategy
└── release-manager → Progressive rollout
```

**Total Time:** 2-3 days
**Agents Used:** 10+
**Coordination:** framework-orchestrator

---

### Workflow 2: Security Audit

**Pattern:** Parallel + Consensus

```
Phase 1: Preparation (Sequential)
├── Explore Agent (Very Thorough) → Map security-critical code
└── archon-manager → Create audit project

Phase 2: Parallel Audits
Coordinator: Multi-Agent Architect

├── Stream 1: OWASP Top 10
│   ├── SQL Injection checks
│   ├── XSS checks
│   ├── CSRF checks
│   └── Auth checks
│
├── Stream 2: Dependencies
│   ├── Vulnerability scan
│   ├── License checks
│   └── Update recommendations
│
├── Stream 3: Architecture
│   ├── Threat modeling
│   ├── Data flow analysis
│   └── Access control review
│
└── Stream 4: Code Review
    ├── Secure coding practices
    ├── Input validation
    └── Error handling

Phase 3: Consensus (Consensus Pattern)
└── Aggregate findings, prioritize by risk

Phase 4: Remediation (Iterative)
└── Fix issues, re-validate until passing
```

**Total Time:** 4-6 hours
**Agents Used:** 5-7
**Coordination:** Multi-agent-architect + security-architect

---

### Workflow 3: Documentation Generation

**Pattern:** Pipeline + Map-Reduce

```
Phase 1: Analysis (Map)
Coordinator: Multi-Agent Architect

├── Worker 1: Analyze /src → Code structure
├── Worker 2: Analyze /api → API docs
├── Worker 3: Analyze /tests → Test coverage
└── Worker 4: Analyze /docs → Existing docs

Phase 2: Processing (Pipeline)
├── Stage 1: Extract information → Structured data
├── Stage 2: Generate docs → Draft markdown
└── Stage 3: Format & polish → Final docs

Phase 3: Aggregation (Reduce)
└── technical-writer: Combine into comprehensive documentation

Phase 4: Publishing
└── General-Purpose: Commit and deploy docs
```

**Total Time:** 1-2 hours
**Agents Used:** 4-6
**Coordination:** Multi-agent-architect

---

### Workflow 4: Codebase Refactoring

**Pattern:** Sequential + Parallel + Iterative

```
Phase 1: Analysis (Sequential)
├── Explore Agent (Very Thorough) → Map all code
└── dark-matter-analyzer → Identify issues

Phase 2: Planning (Sequential)
├── archon-manager → Create refactoring project
└── General-Purpose → Create refactoring plan

Phase 3: Refactoring (Parallel)
Coordinator: Multi-Agent Architect

├── Worker 1: Refactor module A
├── Worker 2: Refactor module B
├── Worker 3: Refactor module C
└── Worker 4: Update shared code

Phase 4: Validation (Iterative)
Loop:
├── testing-strategist → Run tests
├── codex-review-workflow → Validate code
└── If issues: Fix and repeat

Phase 5: Integration (Sequential)
└── General-Purpose: Merge and deploy
```

**Total Time:** Variable (days to weeks)
**Agents Used:** 5-8
**Coordination:** framework-orchestrator

---

## Best Practices

### 1. Pattern Selection

**Choose Sequential when:**

- Tasks have clear dependencies
- Simplicity is important
- Time is not critical

**Choose Parallel when:**

- Tasks are independent
- Speed is critical
- Resources available

**Choose Hierarchical when:**

- Complex task decomposition needed
- Centralized control desired
- Dynamic assignment required

### 2. Error Handling

**Implement fallbacks:**

```
Try primary approach
└─ If fails: Try alternative
   └─ If fails: Escalate to human
```

**Use circuit breakers:**

```
If agent fails N times:
└─ Stop using agent temporarily
   └─ Use fallback or skip
```

**Log everything:**

```
Log:
├── Agent invocations
├── Failures and retries
├── Performance metrics
└── Decision points
```

### 3. Performance Optimization

**Use caching:**

- Cache agent results
- Avoid redundant work
- Share results between agents

**Batch operations:**

- Batch similar operations
- Reduce overhead
- Improve throughput

**Load balance:**

- Distribute work evenly
- Monitor agent performance
- Adjust dynamically

### 4. Monitoring & Observability

**Track metrics:**

- Agent execution time
- Success/failure rates
- Resource utilization
- Bottlenecks

**Implement tracing:**

- Trace requests across agents
- Identify slow paths
- Debug issues

**Set up alerts:**

- High failure rates
- Slow execution
- Resource exhaustion

### 5. Testing

**Unit test agents:**

- Test each agent individually
- Mock dependencies
- Verify behavior

**Integration test workflows:**

- Test agent coordination
- Verify data flow
- Check error handling

**End-to-end test:**

- Test complete workflows
- Real-world scenarios
- Performance testing

---

## Anti-Patterns

### 1. Over-Coordination

**Problem:** Too many agents for simple task
**Solution:** Use simpler pattern or single agent

### 2. Under-Coordination

**Problem:** Agents working without coordination
**Solution:** Add coordinator agent

### 3. Circular Dependencies

**Problem:** Agent A waits for B, B waits for A
**Solution:** Break cycle, use mediator

### 4. Single Point of Failure

**Problem:** One agent failure breaks workflow
**Solution:** Implement fallbacks and redundancy

### 5. Unbounded Iteration

**Problem:** Iterative pattern never terminates
**Solution:** Set max iterations and timeout

---

## Related Documentation

- **agent-types.md** - Complete agent taxonomy
- **skill-agents.md** - Skill-based agents
- **agent-selection-guide.md** - Decision tree
- **multi-agent-patterns.md** - Multi-agent patterns

---

## Version History

- **v1.0.0** (2025-10-28) - Initial workflow documentation
