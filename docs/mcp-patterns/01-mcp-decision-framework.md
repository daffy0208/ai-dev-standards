# MCP Pattern Decision Framework

## Choosing Between Direct MCP and Code Execution

**Last Updated:** November 14, 2025  
**Status:** Production Ready  
**Applies to:** All AI agents using Model Context Protocol

---

## 🎯 Quick Decision Tree

```
START: Need to use MCP tools?
│
├─ How many tools? ──────────────┐
│                                 │
│  1-2 tools ────> Direct MCP    │
│  3-4 tools ────> (continue)    │
│  5+ tools ─────> Code Exec ✓   │
│                                 │
├─ Data payload size? ───────────┤
│                                 │
│  < 5KB ────────> Direct MCP    │
│  5-10KB ───────> (continue)    │
│  > 10KB ───────> Code Exec ✓   │
│                                 │
├─ Workflow complexity? ─────────┤
│                                 │
│  Linear ───────> Direct MCP    │
│  Some branching > (continue)   │
│  Complex logic > Code Exec ✓   │
│                                 │
├─ Repeated task? ───────────────┤
│                                 │
│  One-off ──────> Direct MCP    │
│  Repeated ─────> Code Exec ✓   │
│                                 │
├─ Privacy sensitive? ───────────┤
│                                 │
│  Public data ──> Direct MCP    │
│  PII/sensitive > Code Exec ✓   │
│                                 │
└─ Infrastructure ready? ─────────┤
                                  │
   No sandbox ────> Direct MCP   │
   Has sandbox ───> Code Exec ✓  │
```

**Rule of Thumb:**  
If 2+ factors point to Code Execution → Use Code Execution  
If 0-1 factors → Use Direct MCP

---

## 📊 Detailed Comparison Matrix

| Factor              | Use Direct MCP     | Use Code Execution       |
| ------------------- | ------------------ | ------------------------ |
| **Tool Count**      | 1-2 tools          | 5+ tools                 |
| **Data Size**       | < 5KB per call     | > 10KB per call          |
| **Workflow**        | Linear sequence    | Branching/conditional    |
| **Frequency**       | One-off tasks      | Repeated patterns        |
| **Latency Needs**   | < 50ms response    | Can tolerate 300ms setup |
| **Privacy**         | Public data        | PII/sensitive data       |
| **Complexity**      | Simple CRUD        | Multi-step orchestration |
| **Infrastructure**  | Minimal deployment | Sandbox available        |
| **Team Expertise**  | Basic API skills   | DevOps capability        |
| **Debugging Needs** | Active development | Stable workflows         |

---

## ✅ When to Use Direct MCP (Traditional Pattern)

### Perfect Use Cases:

#### 1. Simple Single-Tool Operations

```yaml
Task: 'Send a Slack message to #engineering'
Analysis:
  - Tools: 1 (Slack)
  - Data: 50 bytes
  - Logic: Linear
  - Frequency: Ad-hoc
Verdict: Direct MCP ✓
Reason: Overhead of code execution > benefit
```

#### 2. Customer Support Chat

```yaml
Task: 'Answer customer questions using knowledge base'
Analysis:
  - Tools: 1-2 (KB search + maybe CRM)
  - Data: < 2KB per query
  - Latency: Need < 100ms
  - Frequency: High volume
Verdict: Direct MCP ✓
Reason: Every millisecond counts, simple workflow
```

#### 3. Development/Debugging Phase

```yaml
Task: 'Testing new API integration'
Analysis:
  - Status: Iterating rapidly
  - Need: See exact tool responses
  - Workflow: Changing constantly
Verdict: Direct MCP ✓
Reason: Direct visibility helps debugging
```

#### 4. Resource-Constrained Environments

```yaml
Context: 'Running on serverless with cold starts'
Analysis:
  - Infrastructure: No persistent sandbox
  - Cost: Pay per millisecond
  - Complexity: Can't maintain state
Verdict: Direct MCP ✓
Reason: Code execution requires persistent infrastructure
```

#### 5. Simple CRUD Operations

```yaml
Examples:
  - 'Create a calendar event'
  - 'Update one database field'
  - 'Delete a file'
  - 'Read a single document'
Verdict: Direct MCP ✓
Reason: Single operation, minimal orchestration
```

### Direct MCP Performance Profile:

```
Setup Time:        0ms (no sandbox)
Tool Loading:      100ms (schemas in context)
Execution:         200ms (per tool call)
Total:            ~300ms

Token Usage:      3,000-5,000 tokens
Cost per run:     $0.03-$0.05
Complexity:       Low
```

---

## 🚀 When to Use Code Execution

### Perfect Use Cases:

#### 1. Multi-Tool Data Pipelines

```yaml
Task: 'Read spreadsheet, validate data, update CRM, notify team'
Analysis:
  - Tools: 4 (Sheets, Validator, CRM, Slack)
  - Data: 50KB spreadsheet
  - Logic: Validation rules + error handling
  - Frequency: Daily automated task
Verdict: Code Execution ✓
Reason:
  - Multiple tools (4)
  - Large data stays in sandbox
  - Complex logic in code
  - Reusable as skill

Savings:
  Direct MCP: ~80,000 tokens ($0.90)
  Code Execution: ~8,000 tokens ($0.08)
  Reduction: 90% ($0.82 saved per run)
```

#### 2. Privacy-Sensitive Operations

```yaml
Task: 'Import customer contacts from CSV to Salesforce'
Analysis:
  - Data: PII (emails, phones, SSNs)
  - Compliance: GDPR/HIPAA
  - Risk: PII exposure in logs
Verdict: Code Execution ✓
Reason:
  - PII stays in sandbox
  - Automatic tokenization
  - Never enters model context
  - Audit trail without exposure
```

#### 3. Complex Orchestration

```yaml
Task: 'If meeting canceled, reschedule, update calendar, notify attendees,
  adjust follow-up tasks, log in CRM'
Analysis:
  - Tools: 5 (Calendar, Email, Slack, TaskManager, CRM)
  - Logic: Multiple if/else branches
  - Error handling: Retry logic needed
  - Latency: Not time-critical
Verdict: Code Execution ✓
Reason:
  - Conditional trees execute in sandbox
  - No model round-trips for decisions
  - 5-10x latency improvement
  - Error handling in code
```

#### 4. Repeated Patterns

```yaml
Task: 'Daily sales report: Query DB, analyze trends, create charts,
  email summary'
Analysis:
  - Frequency: Daily (365x/year)
  - Tools: 4 (Database, Analytics, Charts, Email)
  - Pattern: Same workflow every time
Verdict: Code Execution ✓
Reason:
  - First run: 12,000 tokens (creates skill)
  - Subsequent: 4,000 tokens (uses skill)
  - 67% reduction after first run
  - Gets faster over time

Annual Savings:
  Direct MCP: 365 × $0.90 = $328.50
  Code Execution: 1 × $0.12 + 364 × $0.04 = $14.68
  Saved: $313.82 per year
```

#### 5. Large Data Processing

```yaml
Task: 'Analyze 100-page document, extract insights, generate report'
Analysis:
  - Data: 200KB document
  - Processing: Multiple analysis passes
  - Output: 5-page summary
Verdict: Code Execution ✓
Reason:
  - Document stays in sandbox
  - Processing happens in code
  - Only summary to context

Token Comparison:
  Direct MCP: 200,000+ tokens (might hit limits!)
  Code Execution: 8,000 tokens
  Reduction: 96%
```

### Code Execution Performance Profile:

```
Setup Time:        300ms (sandbox init, first run)
Setup Time:        50ms (sandbox init, subsequent)
Tool Discovery:    100ms (filesystem read)
Execution:         200ms (in sandbox)
Total First:      ~600ms
Total Subsequent: ~350ms

Token Usage (First): 8,000-12,000 tokens
Token Usage (Reuse): 2,000-4,000 tokens
Cost per run:        $0.08-$0.12 → $0.02-$0.04
Complexity:          High (requires infrastructure)
```

---

## 🔄 Migration Scenarios

### Scenario 1: Start Simple, Evolve to Complex

```yaml
Phase 1 - MVP (Direct MCP):
  Task: 'Send daily report'
  Reason: Quick to build, simple workflow
  Pattern: Direct MCP ✓

Phase 2 - Growth (Still Direct MCP):
  Task: 'Send daily report with custom filters'
  Reason: Still manageable, 2-3 tools
  Pattern: Direct MCP ✓

Phase 3 - Scale (Migrate to Code Execution):
  Task: 'Generate custom reports, analyze trends, predict outcomes,
    notify stakeholders, update dashboards'
  Reason: Now 7 tools, complex logic, running 50x/day
  Pattern: Code Execution ✓
  Migration: Worth the infrastructure investment
```

### Scenario 2: Hybrid Approach (Recommended)

```yaml
Architecture:
  Frontend (Customer-Facing):
    - Simple queries
    - Low latency required
    - Pattern: Direct MCP ✓

  Backend (Data Processing):
    - Complex workflows
    - Batch operations
    - Pattern: Code Execution ✓

Benefits:
  - Right tool for each job
  - Optimize for user experience
  - Cost-effective scaling
```

---

## 💰 Cost-Benefit Analysis

### Break-Even Calculator

```python
# When does Code Execution pay off?

def calculate_breakeven(tools, data_kb, runs_per_month):
    # Direct MCP cost
    direct_tokens = (tools * 5000) + (data_kb * 10)
    direct_cost_per_run = direct_tokens * 0.000003  # $3 per M tokens
    direct_monthly = direct_cost_per_run * runs_per_month

    # Code Execution cost
    setup_tokens = 12000  # First run (creates skill)
    reuse_tokens = 4000   # Subsequent runs
    code_first_run = setup_tokens * 0.000003
    code_subsequent = reuse_tokens * 0.000003
    code_monthly = code_first_run + (code_subsequent * (runs_per_month - 1))

    # Infrastructure cost (estimated)
    infrastructure_monthly = 50  # Sandbox, storage, monitoring
    code_total_monthly = code_monthly + infrastructure_monthly

    savings = direct_monthly - code_total_monthly
    breakeven_runs = infrastructure_monthly / (direct_cost_per_run - code_subsequent)

    return {
        'direct_monthly': direct_monthly,
        'code_monthly': code_total_monthly,
        'savings': savings,
        'breakeven_runs': breakeven_runs
    }

# Example: 5 tools, 20KB data, 100 runs/month
result = calculate_breakeven(5, 20, 100)
# Output:
# {
#   'direct_monthly': $90,
#   'code_monthly': $52,
#   'savings': $38/month,
#   'breakeven_runs': 42 runs
# }
```

### Decision Based on Volume

```yaml
Low Volume (< 50 runs/month):
  Recommendation: Direct MCP
  Reason: Infrastructure cost > token savings

Medium Volume (50-200 runs/month):
  Recommendation: Evaluate case-by-case
  Factors: Complexity, team capability, growth plans

High Volume (> 200 runs/month):
  Recommendation: Code Execution
  Reason: Token savings > infrastructure cost
  ROI: Positive after month 1
```

---

## 🛠️ Implementation Readiness Checklist

### Before Choosing Code Execution, Ensure You Have:

#### Infrastructure ✅

- [ ] Sandboxed execution environment (Docker/V8/Firecracker)
- [ ] Persistent storage (/mnt/skills or equivalent)
- [ ] Code interpreter (IPython, Node, or similar)
- [ ] Resource limits configured (memory, CPU, timeout)
- [ ] Network egress control

#### Security ✅

- [ ] Sandbox isolation tested
- [ ] PII tokenization system
- [ ] Audit logging infrastructure
- [ ] Secrets management solution
- [ ] Security review completed

#### Operations ✅

- [ ] Monitoring and alerting setup
- [ ] Error tracking and debugging tools
- [ ] Performance metrics collection
- [ ] Cost tracking per execution
- [ ] Backup and recovery procedures

#### Team ✅

- [ ] DevOps expertise available
- [ ] Security best practices understood
- [ ] Monitoring/debugging skills
- [ ] On-call coverage for issues
- [ ] Documentation maintained

#### Cost ✅

- [ ] Budget for infrastructure (~$50-200/month)
- [ ] Budget for initial setup (2-4 weeks engineer time)
- [ ] Budget for ongoing ops (0.5 FTE)
- [ ] ROI calculation completed
- [ ] Executive buy-in obtained

**If you checked < 80% of boxes → Start with Direct MCP**

---

## 📈 Real-World Examples

### Example 1: Customer Support (Direct MCP)

```yaml
Company: E-commerce platform
Use Case: Answer customer questions
Volume: 10,000 queries/day
Complexity: 1-2 tool calls per query

Decision: Direct MCP ✓

Reasons:
  - Ultra-low latency required (< 100ms)
  - Simple workflow (search KB, return answer)
  - Small data payloads (< 1KB)
  - High volume favors simple infrastructure

Results:
  - Average response: 80ms
  - Cost: $0.02 per query
  - Monthly cost: $6,000 (acceptable for revenue)
  - No complex infrastructure needed
```

### Example 2: Sales Operations (Code Execution)

```yaml
Company: B2B SaaS company
Use Case: Meeting → CRM automation
Volume: 50 meetings/day (1,500/month)
Complexity: 6 tool calls with data processing

Decision: Code Execution ✓

Reasons:
  - 6 tools (Zoom, Transcription, GPT, Salesforce, Slack, Calendar)
  - 30KB transcripts (large data)
  - Complex logic (extract insights, sentiment, action items)
  - PII sensitive (customer names, company info)

Implementation:
  Month 1: Setup infrastructure ($2,000 engineering)
  Month 2+: Automated workflow

Results:
  - Token reduction: 150K → 2K (98.7%)
  - Cost per meeting: $1.50 → $0.02
  - Monthly savings: $2,220
  - ROI: Break-even in 1 month
  - Bonus: PII never in logs (compliance win)
```

### Example 3: Data Analytics (Hybrid)

```yaml
Company: Marketing agency
Use Case: Client reporting

Frontend (Client Portal):
  - Pattern: Direct MCP
  - Use Case: Simple queries ("Show me last week's metrics")
  - Reason: Fast response for interactive use

Backend (Report Generation):
  - Pattern: Code Execution
  - Use Case: Weekly automated reports
  - Reason: 10+ data sources, complex analysis, privacy

Results:
  - Best of both worlds
  - Fast UI responses (< 200ms)
  - Cost-effective batch processing
  - Scales well with client growth
```

---

## 🎓 Learning Path

### Start with Direct MCP if:

- ✅ Building MVP/proof of concept
- ✅ Learning MCP fundamentals
- ✅ Team new to AI agents
- ✅ Budget/time constrained
- ✅ Simple use case

### Graduate to Code Execution when:

- ✅ Proven use case with traction
- ✅ Volume justifies investment
- ✅ Complexity increasing
- ✅ Team has infrastructure capability
- ✅ ROI calculation positive

---

## 🚦 Traffic Light System

Quick visual guide for decision making:

### 🟢 GREEN LIGHT (Code Execution)

- 5+ tools needed
- > 10KB data payloads
- Repeated daily/weekly workflows
- PII/sensitive data
- Complex conditional logic
- Budget for infrastructure
- DevOps team available

### 🟡 YELLOW LIGHT (Evaluate Carefully)

- 3-4 tools
- 5-10KB data
- Monthly execution
- Some branching logic
- Growing use case
- Medium team capability

### 🔴 RED LIGHT (Direct MCP)

- 1-2 tools
- < 5KB data
- One-off or ad-hoc tasks
- Linear workflow
- Need < 100ms latency
- Minimal infrastructure
- New to AI agents

---

## 📚 Additional Resources

- [Direct MCP Pattern Guide](./mcp-direct-pattern.md)
- [Code Execution Pattern Guide](./mcp-code-execution-pattern.md)
- [Filesystem Structure Spec](./mcp-filesystem-structure.md)
- [Security Architecture](./mcp-security-architecture.md)
- [Implementation Complexity Guide](./mcp-implementation-complexity.md)
- [Performance Benchmarks](./mcp-performance-benchmarks.md)

---

## 💡 Key Takeaways

1. **Both patterns are valid** - Use the right tool for the job
2. **Start simple** - Direct MCP is great for MVPs
3. **Evolve based on data** - Migrate when ROI is clear
4. **Infrastructure matters** - Code execution needs ops investment
5. **Hybrid is OK** - Different patterns for different parts of system

**The best pattern is the one that matches your use case, not the newest pattern.**

---

**Questions?** Refer to the detailed pattern guides or reach out to the team.

**Last Review:** November 14, 2025  
**Next Review:** January 15, 2026
