# Agent Usage Examples

Practical examples showing how to use different agents for common development tasks.

## Table of Contents

1. [New Repository Onboarding](#new-repository-onboarding)
2. [Bug Investigation](#bug-investigation)
3. [Feature Implementation](#feature-implementation)
4. [Refactoring](#refactoring)
5. [Security Audit](#security-audit)
6. [Performance Optimization](#performance-optimization)
7. [Documentation Generation](#documentation-generation)
8. [Architecture Analysis](#architecture-analysis)
9. [Migration Planning](#migration-planning)
10. [Code Review Preparation](#code-review-preparation)

---

## New Repository Onboarding

### Scenario

You've just cloned a new React/Node.js project and need to understand it quickly.

### Approach

**Phase 1: Quick Overview (5 minutes)**

```
Agent: Explore (Quick)
Task: "Give me an overview of this project - what it does,
       tech stack, and main entry points"

Expected Output:
- Project purpose
- Tech stack (React, Node, PostgreSQL)
- Entry points (index.tsx, server.ts)
- Directory structure
```

**Phase 2: Deep Dive on Key Areas (30 minutes)**

```
Agent: Explore (Medium)
Task: "Explore the authentication system - how users log in,
       session management, and authorization checks"

Expected Output:
- Auth flow diagram
- Components involved
- API endpoints
- Security measures
```

**Phase 3: Get Started (Ongoing)**

```
Agent: General-Purpose
Task: "Set up my local development environment following
       the project conventions"

Actions:
- Install dependencies
- Configure environment
- Run tests
- Start dev server
```

---

## Bug Investigation

### Scenario

Users report authentication failing with special characters in passwords.

### Approach

**Phase 1: Locate Code (5 minutes)**

```
Agent: General-Purpose
Task: "Find all code related to password validation and
       authentication, especially where user input is processed"

Tools Used:
- Grep for "password", "validation", "auth"
- Read auth-related files
```

**Phase 2: Analyze Issue (10 minutes)**

```
Agent: General-Purpose
Task: "Analyze the password validation code and identify
       where special characters might cause issues"

Expected:
- Find escaping bugs
- Identify regex issues
- Locate encoding problems
```

**Phase 3: Fix (15 minutes)**

```
Agent: General-Purpose
Skill: security-engineer
Task: "Fix the password validation to properly handle
       special characters, ensuring security best practices"

Actions:
- Update validation logic
- Add proper escaping
- Add tests for special chars
- Verify security
```

---

## Feature Implementation

### Scenario

Add user profile picture upload with image optimization.

### Approach

**Phase 1: Understand Current System (15 minutes)**

```
Agent: Explore (Medium)
Task: "Explore how file uploads currently work in this app,
       including user profile management and storage"

Output:
- Current file upload patterns
- User profile components
- Storage configuration
- API structure
```

**Phase 2: Design Implementation (10 minutes)**

```
Agent: General-Purpose
Skill: frontend-builder
Task: "Design the profile picture upload feature following
       the existing patterns in this codebase"

Output:
- Component structure
- API endpoints needed
- Storage strategy
- UI/UX approach
```

**Phase 3: Implement (1-2 hours)**

```
Agent: General-Purpose
Skills: frontend-builder, api-designer
Task: "Implement profile picture upload with client-side
       image optimization before upload"

Components:
- Upload UI component
- Image optimization
- API endpoint
- Storage integration
- Tests
```

---

## Refactoring

### Scenario

Refactor legacy authentication code to use modern patterns.

### Approach

**Phase 1: Map Current System (30 minutes)**

```
Agent: Explore (Very Thorough)
Task: "Map all authentication code including dependencies,
       identifying what needs to be refactored"

Output:
- Complete auth code inventory
- Dependency graph
- Usage patterns
- Risk assessment
```

**Phase 2: Plan Refactoring (20 minutes)**

```
Agent: General-Purpose
Task: "Create a safe refactoring plan that maintains
       backward compatibility and includes rollback strategy"

Output:
- Refactoring steps
- Testing strategy
- Migration plan
- Rollback procedure
```

**Phase 3: Execute Refactoring (Variable)**

```
Agent: General-Purpose
Skill: testing-strategist
Task: "Execute the refactoring plan step by step,
       running tests after each change"

Approach:
- Incremental changes
- Test after each step
- Verify no regressions
- Update documentation
```

---

## Security Audit

### Scenario

Conduct comprehensive security audit before production launch.

### Approach

**Phase 1: Gather Information (45 minutes)**

```
Agent: Explore (Very Thorough)
Focus: Security-critical code
Task: "Map all authentication, authorization, data handling,
       and API endpoints for security audit"

Areas:
- User authentication
- Authorization checks
- Data validation
- API security
- Database queries
- Third-party integrations
```

**Phase 2: Security Analysis (30 minutes)**

```
Agent: General-Purpose
Skill: security-engineer
Task: "Analyze the gathered information for security
       vulnerabilities using OWASP Top 10 framework"

Checks:
- Injection vulnerabilities
- Broken authentication
- Sensitive data exposure
- XML External Entities
- Broken access control
- Security misconfiguration
- XSS
- Insecure deserialization
- Known vulnerabilities
- Insufficient logging
```

**Phase 3: Fix Issues (Variable)**

```
Agent: General-Purpose
Skill: security-engineer
Task: "Fix identified security issues in priority order"

Priority:
1. Critical (immediate)
2. High (before launch)
3. Medium (post-launch)
4. Low (backlog)
```

---

## Performance Optimization

### Scenario

Application is slow, need to identify and fix bottlenecks.

### Approach

**Phase 1: Understand System (20 minutes)**

```
Agent: Explore (Medium)
Focus: Performance-critical paths
Task: "Map the user journey from login to main features,
       identifying all performance-critical code"

Areas:
- Database queries
- API calls
- Frontend rendering
- Asset loading
```

**Phase 2: Identify Bottlenecks (15 minutes)**

```
Agent: General-Purpose
Skill: performance-optimizer
Task: "Analyze code for common performance issues:
       N+1 queries, large bundle sizes, unnecessary re-renders"

Tools:
- Read database query code
- Check bundle configuration
- Analyze component structure
```

**Phase 3: Optimize (Variable)**

```
Agent: General-Purpose
Skill: performance-optimizer
Task: "Implement performance optimizations in priority order"

Optimizations:
- Add database indexes
- Implement query batching
- Add React.memo where needed
- Split code bundles
- Optimize images
- Add caching
```

---

## Documentation Generation

### Scenario

Need comprehensive documentation for entire project.

### Approach

**Phase 1: Comprehensive Analysis (1 hour)**

```
Agent: Explore (Very Thorough)
Task: "Analyze entire codebase to understand architecture,
       components, APIs, and data flows for documentation"

Output:
- System architecture
- Component inventory
- API catalog
- Data models
- Workflows
```

**Phase 2: Generate Documentation (2 hours)**

```
Agent: General-Purpose
Skill: technical-writer
Task: "Generate comprehensive documentation including:
       - Architecture overview
       - API documentation
       - Component guide
       - Setup instructions
       - Contributing guide"

Documents:
- README.md
- ARCHITECTURE.md
- API.md
- CONTRIBUTING.md
- SETUP.md
```

---

## Architecture Analysis

### Scenario

Evaluate current architecture and recommend improvements.

### Approach

**Phase 1: Map Architecture (1 hour)**

```
Agent: Explore (Very Thorough)
Task: "Map complete system architecture including:
       - Service boundaries
       - Data flows
       - Dependencies
       - Infrastructure"

Output:
- Architecture diagrams
- Service catalog
- Dependency graph
- Infrastructure map
```

**Phase 2: Analysis (30 minutes)**

```
Agent: General-Purpose
Skill: dark-matter-analyzer
Task: "Analyze architecture for:
       - Technical debt
       - Scalability issues
       - Security concerns
       - Maintainability problems"

Focus:
- Identify anti-patterns
- Find coupling issues
- Spot single points of failure
- Evaluate scalability
```

**Phase 3: Recommendations (20 minutes)**

```
Agent: General-Purpose
Task: "Generate prioritized recommendations for
       architectural improvements with effort estimates"

Output:
- Improvement roadmap
- Effort estimates
- Risk assessment
- Migration strategies
```

---

## Migration Planning

### Scenario

Migrate from REST API to GraphQL.

### Approach

**Phase 1: Inventory Current System (45 minutes)**

```
Agent: Explore (Very Thorough)
Focus: API layer
Task: "Map all REST API endpoints, their usage, and
       dependent frontend code"

Output:
- Endpoint inventory
- Usage patterns
- Frontend dependencies
- Data models
```

**Phase 2: Design Migration (30 minutes)**

```
Agent: General-Purpose
Skill: api-designer
Task: "Design GraphQL schema equivalent to current REST API,
       ensuring feature parity"

Output:
- GraphQL schema
- Resolver design
- Migration strategy
- Testing plan
```

**Phase 3: Incremental Migration (Ongoing)**

```
Agent: General-Purpose
Skills: api-designer, testing-strategist
Task: "Migrate REST endpoints to GraphQL incrementally,
       maintaining backward compatibility"

Approach:
- Parallel run both APIs
- Migrate endpoints one by one
- Update frontend gradually
- Remove REST when complete
```

---

## Code Review Preparation

### Scenario

Preparing code changes for review before submitting PR.

### Approach

**Phase 1: Self-Review (10 minutes)**

```
Agent: General-Purpose
Task: "Review my changes in the following files for:
       - Code quality
       - Test coverage
       - Documentation
       - Potential issues"

Files: [list of changed files]
```

**Phase 2: Impact Analysis (15 minutes)**

```
Agent: Explore (Medium)
Focus: Changed files and dependencies
Task: "Analyze impact of my changes on dependent code
       and identify any breaking changes"

Output:
- Dependency impact
- Breaking changes
- Migration notes
- Testing recommendations
```

**Phase 3: Prepare PR (10 minutes)**

```
Agent: General-Purpose
Skill: technical-writer
Task: "Generate comprehensive PR description including:
       - Summary of changes
       - Testing performed
       - Breaking changes
       - Deployment notes"

Output:
- PR description
- Changelog entry
- Migration guide (if needed)
```

---

## Workflow Patterns

### Pattern 1: Explore → Skill → Implement

```
1. Explore Agent → Understand codebase
2. Specialized Skill → Analyze findings
3. General-Purpose → Implement solution
```

**Use When:** Starting new task in existing codebase

### Pattern 2: Quick Check → Deep Dive

```
1. Explore (Quick) → Get overview
2. Explore (Medium) → Focus on area of interest
3. Explore (Very Thorough) → Complete understanding
```

**Use When:** Progressive investigation needed

### Pattern 3: Multi-Skill Coordination

```
1. General-Purpose + archon-manager → Plan work
2. General-Purpose + multiple skills → Execute tasks
3. General-Purpose + technical-writer → Document
```

**Use When:** Complex multi-faceted projects

---

## Tips for Better Results

### 1. Be Specific

```
Bad:  "Explore this codebase"
Good: "Explore authentication flow including user login,
       session management, and password reset"
```

### 2. Provide Context

```
Bad:  "Fix the bug"
Good: "Fix authentication bug where users with email addresses
       containing + symbol cannot log in. Issue in auth.ts
       line 45"
```

### 3. Choose Right Agent

```
New codebase → Explore Agent
Ongoing work → General-Purpose Agent
Specialized task → General-Purpose + Skill
Configuration → Setup Agent
```

### 4. Progressive Approach

```
Start simple → Quick exploration
Add detail → Medium exploration
Go deep → Very thorough exploration
Implement → General-purpose agent
```

### 5. Combine Resources

```
Agents + Skills + MCPs + Tools + Components
= Powerful development workflow
```

---

## Common Mistakes

### Mistake 1: Wrong Agent Choice

```
Problem: Using Explore for implementation
Solution: Explore to understand, General-Purpose to implement
```

### Mistake 2: Too Broad Scope

```
Problem: "Explore entire monorepo" (takes forever)
Solution: "Explore authentication service in /services/auth"
```

### Mistake 3: Not Using Skills

```
Problem: Asking general agent to do specialized task
Solution: Invoke appropriate skill for specialized work
```

### Mistake 4: Skipping Exploration

```
Problem: Diving into implementation without understanding
Solution: Quick exploration first, then implement
```

### Mistake 5: Wrong Thoroughness Level

```
Problem: Using Very Thorough for simple check (slow)
Solution: Match thoroughness to task importance
```

---

## Quick Reference

| Task                   | Agent             | Mode          | Time     | Skills                |
| ---------------------- | ----------------- | ------------- | -------- | --------------------- |
| New repo overview      | Explore           | Quick         | 5 min    | -                     |
| Understand feature     | Explore           | Medium        | 15 min   | -                     |
| Architecture mapping   | Explore           | Very Thorough | 45 min   | -                     |
| Bug fix                | General-Purpose   | -             | Variable | -                     |
| Feature implementation | General-Purpose   | -             | Variable | frontend-builder      |
| Security audit         | Explore + General | Very Thorough | 1 hr     | security-engineer     |
| Performance tuning     | General-Purpose   | -             | Variable | performance-optimizer |
| Refactoring            | Explore + General | Very Thorough | Variable | testing-strategist    |
| Documentation          | Explore + General | Very Thorough | 2 hrs    | technical-writer      |

---

## Related Resources

- **Agent README:** Overview of all agent types
- **General-Purpose Agent:** Detailed general agent docs
- **Explore Agent:** Detailed exploration docs
- **Skills:** 41 specialized capabilities in `/SKILLS/`
- **CLAUDE.md:** Complete repository documentation
