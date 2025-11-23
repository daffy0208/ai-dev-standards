# MCP-Powered Repository Health Check

**After restarting Claude Code, use this comprehensive health check that leverages all your MCPs, skills, and tools.**

---

## Prerequisites

1. **Restart Claude Code** to load all 54 MCPs
2. Verify MCPs are loaded: Use `ListMcpResourcesTool`
3. Run commands below in order

---

## Comprehensive Health Check (Using Your Tools)

### Phase 1: Code Health Analysis

#### Use project-health-auditor MCP

```
"Use project-health-auditor to analyze the entire repository and provide:
1. Code complexity metrics for all directories
2. Git churn rates for the last 30 days
3. Identify files with high complexity (> 15 cyclomatic complexity)
4. Test coverage gaps
5. Overall health score"
```

Expected output:

- Complexity metrics per directory
- High-churn files that need attention
- Files needing tests
- Health score (0-100)

---

### Phase 2: Repository Analysis

#### Use dark-matter-analyzer-mcp

```
"Use dark-matter-analyzer-mcp to analyze this repository and identify:
1. Strategic drift (misalignment between goals and reality)
2. Documentation inflation
3. Unused or dead code
4. Organizational health score
5. Patterns and anomalies"
```

Expected output:

- Strategic coherence score
- Documentation-to-code ratio
- Dead code candidates
- Health insights

---

### Phase 3: Code Quality Scan

#### Use code-quality-scanner-mcp

```
"Use code-quality-scanner-mcp to scan the codebase and report:
1. Code style violations
2. Linting errors
3. Type errors (TypeScript files)
4. Best practice violations
5. Quality metrics"
```

Expected output:

- Total issues found
- Issues by severity (critical/warning/info)
- Files needing attention
- Quality score

---

### Phase 4: Security Audit

#### Use security-scanner-mcp

```
"Use security-scanner-mcp to scan for:
1. Dependency vulnerabilities
2. Hardcoded secrets or API keys
3. Insecure patterns
4. OWASP Top 10 violations
5. Security score"
```

Expected output:

- Vulnerabilities by severity
- Secrets detected
- Security recommendations
- Security score

---

### Phase 5: Documentation Health

#### Use domain-memory-agent

```
"Use domain-memory-agent to:
1. Index all markdown files in DOCS/
2. Search for common documentation (installation, usage, examples)
3. Identify documentation gaps
4. Assess documentation quality"
```

Expected output:

- Total documents indexed
- Missing documentation topics
- Documentation completeness score

---

### Phase 6: MCP Registry Validation

#### Use semantic-search-mcp

```
"Use semantic-search-mcp to search META/mcp-registry.json and validate:
1. All MCPs in MCP-SERVERS/ are registered
2. Registry metadata is accurate
3. MCP descriptions are complete
4. Skill mappings are correct"
```

Expected output:

- Missing registrations
- Incomplete metadata
- Validation errors

---

### Phase 7: Workflow Orchestration Test

#### Use workflow-orchestrator

```
"Use workflow-orchestrator to create and execute a test workflow:
1. List all MCP directories
2. Check each has package.json
3. Check each has README.md
4. Check each has src/ or dist/
5. Report findings"
```

Expected output:

- Workflow execution log
- MCPs with missing files
- Success/failure status

---

### Phase 8: Skill Validation

#### Use framework-orchestrator (if available)

```
"Analyze all 65 skills in SKILLS/ and validate:
1. Each has SKILL.md
2. SKILL.md has required sections
3. Skills have examples/
4. Skills are properly categorized
5. Skill dependencies are met"
```

Expected output:

- Skills validation report
- Missing components
- Skill completeness score

---

### Phase 9: Vector Database Health

#### Use vector-database-mcp

```
"Use vector-database-mcp to:
1. Initialize vector store for repository
2. Index all markdown documentation
3. Test semantic search functionality
4. Report index health"
```

Expected output:

- Documents indexed
- Vector store size
- Search test results
- Index health status

---

### Phase 10: Performance Profiling

#### Use performance-profiler-mcp

```
"Use performance-profiler-mcp to profile:
1. MCP startup times
2. Tool invocation latency
3. Memory usage
4. Performance bottlenecks"
```

Expected output:

- Startup times per MCP
- Slowest operations
- Memory consumption
- Performance recommendations

---

## Combined Health Score

After running all phases, calculate:

```
Overall Health = (
  Code Health * 0.20 +
  Repository Health * 0.15 +
  Code Quality * 0.15 +
  Security * 0.20 +
  Documentation * 0.10 +
  Registry * 0.05 +
  Workflows * 0.05 +
  Skills * 0.05 +
  Vector DB * 0.03 +
  Performance * 0.02
)
```

**Rating Scale:**

- 90-100: Excellent
- 80-89: Very Good
- 70-79: Good
- 60-69: Fair
- Below 60: Needs Improvement

---

## Quick Health Check (One Command)

After restart, run this single comprehensive check:

```
"Run a comprehensive repository health check using all available MCP tools:

1. project-health-auditor: Analyze code complexity and churn
2. dark-matter-analyzer: Identify strategic drift
3. code-quality-scanner: Check code quality
4. security-scanner: Audit security
5. domain-memory-agent: Validate documentation
6. semantic-search: Verify registry
7. workflow-orchestrator: Test workflows
8. vector-database: Check indexing
9. performance-profiler: Profile performance

Provide a consolidated health report with:
- Overall health score (0-100)
- Critical issues requiring immediate attention
- Warnings that should be addressed soon
- Recommendations for improvement
- Comparison to best practices"
```

---

## Automated Health Check (Workflow)

Create a workflow using workflow-orchestrator:

```
"Use workflow-orchestrator to create an automated health check workflow:

Name: repository-health-check
Tasks:
  1. code-health: Run project-health-auditor
  2. repository-analysis: Run dark-matter-analyzer (depends on: code-health)
  3. quality-scan: Run code-quality-scanner (depends on: code-health)
  4. security-audit: Run security-scanner (depends on: code-health)
  5. doc-validation: Run domain-memory-agent (depends on: repository-analysis)
  6. registry-check: Run semantic-search (depends on: repository-analysis)
  7. workflow-test: Test workflow creation (depends on: registry-check)
  8. skill-validation: Validate skills (depends on: doc-validation)
  9. vector-db-check: Check vector database (depends on: doc-validation)
  10. performance-profile: Profile performance (depends on: all above)
  11. generate-report: Consolidate results

Execute this workflow and save results to DOCS/HEALTH-CHECK-REPORT.md"
```

---

## Continuous Health Monitoring

Set up continuous health checks:

```
"Create a monitoring workflow that:
1. Runs health checks daily
2. Tracks metrics over time
3. Alerts on degradation
4. Generates trend reports"
```

---

## Next Steps After Health Check

Based on health check results:

### If Health Score < 70

1. Address all critical issues immediately
2. Create tasks for warnings
3. Schedule remediation
4. Re-run health check after fixes

### If Health Score 70-89

1. Address critical issues
2. Plan for warnings
3. Continue regular monitoring

### If Health Score 90+

1. Maintain current practices
2. Regular monitoring
3. Continuous improvement

---

## Manual Fallback (If MCPs Not Available)

If MCPs haven't loaded after restart, use the bash script:

```bash
./scripts/full-health-check.sh
```

This provides a basic health check using bash tools only.

---

## Comparison: Bash vs MCP Health Checks

| Aspect                 | Bash Script       | MCP-Powered                          |
| ---------------------- | ----------------- | ------------------------------------ |
| **Code Complexity**    | ❌ No             | ✅ Yes (project-health-auditor)      |
| **Strategic Analysis** | ❌ No             | ✅ Yes (dark-matter-analyzer)        |
| **Quality Metrics**    | ❌ No             | ✅ Yes (code-quality-scanner)        |
| **Security Audit**     | ⚠️ Basic          | ✅ Comprehensive (security-scanner)  |
| **Documentation**      | ⚠️ File existence | ✅ Semantic analysis (domain-memory) |
| **Performance**        | ❌ No             | ✅ Yes (performance-profiler)        |
| **Workflows**          | ❌ No             | ✅ Yes (workflow-orchestrator)       |
| **Vector DB**          | ❌ No             | ✅ Yes (vector-database)             |
| **Skills**             | ⚠️ Basic          | ✅ Deep analysis                     |
| **Overall Score**      | ❌ No             | ✅ Weighted score                    |

**Recommendation:** Use MCP-powered health check for comprehensive analysis.

---

## Health Check Schedule

**Daily:** Quick check (5 min)

```
"Quick health check: project-health-auditor + security-scanner"
```

**Weekly:** Comprehensive check (15 min)

```
"Full MCP-powered health check with all tools"
```

**Monthly:** Deep analysis (30 min)

```
"Deep health check + trend analysis + recommendations"
```

---

## Status

**Current:** Bash script available (`./scripts/full-health-check.sh`)
**After Restart:** Full MCP-powered health check available
**Health Score:** Run check to determine

---

## Documentation

- **Bash Health Check:** `scripts/full-health-check.sh`
- **MCP Health Check:** This document
- **Results:** Will be saved to `DOCS/HEALTH-CHECK-REPORT.md`

**Date:** 2025-10-29
**Version:** 1.0.0
**Status:** Ready after Claude Code restart
