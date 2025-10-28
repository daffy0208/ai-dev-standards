# Multi-Agent Patterns

Patterns for parallel execution and multi-agent coordination in Claude Code.

---

## Overview

Multi-agent patterns enable complex tasks through agent coordination, parallelization, and specialization. This document provides practical patterns for multi-agent workflows.

---

## Core Patterns

### 1. Divide and Conquer
**Problem:** Task too large for single agent
**Solution:** Split into subtasks, assign to multiple agents, aggregate results

```
Example: Repository-wide analysis

Coordinator: Multi-Agent Architect
├── Agent 1: Analyze /frontend
├── Agent 2: Analyze /backend
├── Agent 3: Analyze /database
└── Agent 4: Analyze /tests

Aggregation: Combine findings into report
```

### 2. Specialist Team
**Problem:** Task requires diverse expertise
**Solution:** Assemble team of specialized agents

```
Example: Feature implementation

Team:
├── UX Designer Agent → User experience
├── Visual Designer Agent → Visual design
├── Frontend Builder Agent → UI implementation
├── API Designer Agent → Backend API
├── Security Engineer Agent → Security review
└── Testing Strategist Agent → Test coverage

Coordinator: Multi-Agent Architect
```

### 3. Pipeline Processing
**Problem:** Sequential stages with large data
**Solution:** Pipeline with buffer between stages

```
Example: Documentation generation

Stage 1: Explore Agent → Find all files
  ↓ [Buffer: File list]
Stage 2: Analysis Agents → Extract info (parallel)
  ↓ [Buffer: Structured data]
Stage 3: Writing Agent → Generate docs
  ↓ [Buffer: Draft docs]
Stage 4: Review Agent → Polish and format
```

### 4. Fan-Out/Fan-In
**Problem:** Apply same operation to many items
**Solution:** Fan out to parallel agents, fan in to aggregator

```
Example: Validate all modules

Fan-Out:
Source → [Splitter]
         ├→ Validator 1 (module A)
         ├→ Validator 2 (module B)
         ├→ Validator 3 (module C)
         └→ Validator 4 (module D)

Fan-In:
[Aggregator] ← All validation results
     ↓
Final Report
```

### 5. Master-Worker
**Problem:** Dynamic task distribution
**Solution:** Master assigns tasks to worker pool

```
Example: Code refactoring

Master (Multi-Agent Architect):
- Maintains work queue
- Assigns tasks to available workers
- Tracks progress
- Handles failures

Worker Pool:
├── Worker 1: Ready for task
├── Worker 2: Processing task X
├── Worker 3: Processing task Y
└── Worker 4: Completed task Z

Master:
1. Assigns task to Worker 1
2. Worker 2 completes, reports back
3. Master assigns new task to Worker 2
4. Repeat until queue empty
```

### 6. Competing Consumers
**Problem:** Process work items from shared queue
**Solution:** Multiple agents consume from same queue

```
Example: API endpoint testing

Work Queue:
├── Test endpoint /users
├── Test endpoint /posts
├── Test endpoint /comments
└── Test endpoint /auth

Consumers:
├── Tester 1 → Takes /users
├── Tester 2 → Takes /posts
├── Tester 3 → Takes /comments
└── Tester 4 → Takes /auth

All report results to central results store
```

---

## Advanced Patterns

### 7. Saga Pattern
**Problem:** Distributed transaction across agents
**Solution:** Compensating transactions for rollback

```
Example: Deploy multi-service application

Step 1: Deploy service A
Step 2: Deploy service B
Step 3: Update configuration
Step 4: Run smoke tests

If any step fails:
- Rollback step 4
- Rollback step 3
- Rollback step 2
- Rollback step 1
```

### 8. Circuit Breaker
**Problem:** Prevent cascading failures
**Solution:** Monitor failures, temporarily disable failing agents

```
Example: External API integration

Agent calls external API:
├── Success → Continue
├── Failure 1 → Retry
├── Failure 2 → Retry
├── Failure 3 → Open circuit (stop calling)
└── After timeout → Half-open (try one call)
    ├── Success → Close circuit (resume)
    └── Failure → Open circuit (wait longer)
```

### 9. Bulkhead Pattern
**Problem:** Resource exhaustion
**Solution:** Isolate resources per agent group

```
Example: Resource management

Resource Pool 1 (High Priority):
├── Agent 1
├── Agent 2
└── Agent 3

Resource Pool 2 (Medium Priority):
├── Agent 4
├── Agent 5
└── Agent 6

Resource Pool 3 (Low Priority):
├── Agent 7
└── Agent 8

If Pool 3 exhausted, doesn't affect Pool 1 or 2
```

### 10. Event Sourcing
**Problem:** Track all agent actions
**Solution:** Store events, replay for state reconstruction

```
Example: Audit trail for compliance

Events:
├── Agent A: Created project
├── Agent B: Added task
├── Agent C: Updated task
├── Agent A: Completed task
└── Agent D: Generated report

Can replay events to reconstruct project state at any point
```

---

## Coordination Strategies

### Strategy 1: Centralized Coordination
```
Coordinator
├── Controls all agents
├── Makes all decisions
├── Aggregates all results
└── Single point of control

Pros: Simple, predictable
Cons: Single point of failure, bottleneck
```

### Strategy 2: Decentralized Coordination
```
Agent Network (peer-to-peer)
├── Agents communicate directly
├── Distributed decision-making
├── No central coordinator
└── Self-organizing

Pros: Resilient, scalable
Cons: Complex, harder to debug
```

### Strategy 3: Hierarchical Coordination
```
Top-level Coordinator
├── Mid-level Coordinator 1
│   ├── Worker 1
│   └── Worker 2
├── Mid-level Coordinator 2
│   ├── Worker 3
│   └── Worker 4
└── Mid-level Coordinator 3
    ├── Worker 5
    └── Worker 6

Pros: Scales well, clear structure
Cons: More complexity, more overhead
```

---

## Communication Patterns

### Pattern 1: Request-Response
```
Agent A → [Request] → Agent B
Agent A ← [Response] ← Agent B

Synchronous, blocking
```

### Pattern 2: Fire-and-Forget
```
Agent A → [Message] → Agent B
(Agent A doesn't wait for response)

Asynchronous, non-blocking
```

### Pattern 3: Publish-Subscribe
```
Publisher Agent → [Event] → Event Bus
                           ├→ Subscriber 1
                           ├→ Subscriber 2
                           └→ Subscriber 3

Decoupled, broadcast
```

### Pattern 4: Request-Reply with Queue
```
Agent A → [Request] → Queue → Agent B
Agent A ← [Reply] ← Queue ← Agent B

Asynchronous, queued
```

---

## Real-World Multi-Agent Workflows

### Workflow 1: Parallel Security Audit
```
Coordinator: Multi-Agent Architect

Parallel Streams:
├── Stream 1: OWASP checks
│   ├── SQL injection
│   ├── XSS
│   └── CSRF
│
├── Stream 2: Dependencies
│   ├── Vulnerability scan
│   └── License check
│
├── Stream 3: Architecture
│   ├── Threat model
│   └── Data flow
│
└── Stream 4: Code review
    ├── Auth patterns
    └── Input validation

Aggregation: Risk-prioritized report
```

### Workflow 2: Distributed Testing
```
Test Coordinator

Test Distribution:
├── Unit tests → Worker pool 1 (4 agents)
├── Integration tests → Worker pool 2 (3 agents)
├── E2E tests → Worker pool 3 (2 agents)
└── Performance tests → Worker pool 4 (1 agent)

Results:
├── Collect all results
├── Generate coverage report
├── Identify failures
└── Create summary
```

### Workflow 3: Multi-Service Deployment
```
Deployment Orchestrator

Phase 1: Pre-deployment (Parallel)
├── Agent 1: Build service A
├── Agent 2: Build service B
├── Agent 3: Build service C
└── Wait for all

Phase 2: Deploy (Sequential)
├── Deploy database migrations
├── Deploy service A
├── Deploy service B
├── Deploy service C
└── Update configuration

Phase 3: Validation (Parallel)
├── Agent 1: Health check A
├── Agent 2: Health check B
├── Agent 3: Health check C
└── Agent 4: Smoke tests

Phase 4: Post-deployment
└── Update monitoring, notify team
```

---

## Best Practices

### 1. Design for Failure
- Expect agents to fail
- Implement retry logic
- Have fallback strategies
- Log all failures

### 2. Optimize Communication
- Minimize inter-agent messages
- Batch when possible
- Use async for non-blocking
- Cache results

### 3. Balance Load
- Distribute work evenly
- Monitor agent performance
- Adjust dynamically
- Avoid hotspots

### 4. Monitor Everything
- Track agent metrics
- Log all operations
- Set up alerts
- Visualize workflows

### 5. Keep It Simple
- Start with simple patterns
- Add complexity only if needed
- Prefer sequential over parallel if close in time
- Document clearly

---

## Performance Tips

### For Speed:
- Use parallel patterns
- Minimize coordination overhead
- Cache aggressively
- Use async communication

### For Reliability:
- Implement retries
- Use circuit breakers
- Have fallbacks
- Monitor health

### For Scale:
- Use worker pools
- Implement backpressure
- Load balance
- Horizontal scaling

---

## Anti-Patterns

### 1. Too Many Agents
**Problem:** Coordination overhead exceeds benefits
**Solution:** Use fewer, more capable agents

### 2. Chatty Agents
**Problem:** Excessive inter-agent communication
**Solution:** Batch messages, reduce chattiness

### 3. No Error Handling
**Problem:** Single failure breaks entire workflow
**Solution:** Implement comprehensive error handling

### 4. Unbounded Parallelism
**Problem:** Too many concurrent agents
**Solution:** Use worker pools with limits

### 5. Missing Timeouts
**Problem:** Agents wait forever
**Solution:** Set timeouts on all operations

---

## Tools & Techniques

### Debugging Multi-Agent Systems
- Distributed tracing
- Centralized logging
- Visualization tools
- Step-through debugging

### Testing Multi-Agent Systems
- Unit test each agent
- Integration test pairs
- End-to-end test workflows
- Chaos engineering

### Monitoring Multi-Agent Systems
- Metrics: latency, throughput, errors
- Dashboards: real-time views
- Alerts: anomaly detection
- Profiling: bottleneck identification

---

## Version History

- **v1.0.0** (2025-10-28) - Initial multi-agent patterns documentation
