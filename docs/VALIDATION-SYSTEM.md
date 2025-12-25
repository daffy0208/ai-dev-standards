# Validation System

**Last Updated:** 2025-11-24
**Version:** 3.0.3

## Overview

The ai-dev-standards repository uses a **unified, two-tier validation system** that ensures code quality, registry consistency, and agent reliability across the entire framework.

## Validation Tiers

### Tier 1: Quick Validation (10-30 seconds)

**Purpose:** Fast feedback for pre-commit hooks and rapid iteration

**What it checks:**

- Registry consistency (skills, MCPs, components)
- Documentation counts and accuracy
- Configuration file correctness (.cursorrules, .claude/claude.md)
- Basic CLI validation

**When to use:**

- Before committing code
- During rapid development iterations
- When you need fast feedback

**Command:**

```bash
npm run validate:quick
```

**Runs automatically:** Yes (via pre-commit hook)

---

### Tier 2: Full Validation (2-5 minutes)

**Purpose:** Comprehensive validation for CI/CD pipelines and pre-push checks

**What it checks:**

- Everything in Quick Validation +
- ESLint code quality checks
- TypeScript type checking
- Unit & integration tests with coverage
- **Agent Evaluation** (Eval-Driven Development - Phase 5.12)
- Brain CLI/MCP builds
- End-to-end workflow verification

**When to use:**

- Before pushing to remote
- In CI/CD pipelines
- Before creating pull requests
- When validating agent behavior

**Command:**

```bash
npm run validate        # Default (runs full)
npm run validate:full   # Explicit alias
```

**Runs automatically:** Via CI/CD pipelines

---

## Agent Evaluation (NEW)

The Full Validation includes **Phase 5.12: Agent Evaluation**, implementing Eval-Driven Development (EDD):

```bash
🔍 Phase 5.12: Agent Evaluation (Eval-Driven Development)
════════════════════════════════════════════════════════════════

Running Agent Evaluations against Golden Dataset...
Executing model-graded evals...
🚀 Starting Agent Evaluation Run
📂 Dataset: tests/fixtures/golden-dataset-example.json
🤖 Mode: Mock Agent

Test T001: ✅ PASS
Test T002: ✅ PASS
Test T003: ✅ PASS

📊 Summary
----------------------------------------
Total Tests:    3
Passed:         3
Failed:         0
Pass Rate:      100.0%
Avg Score:      0.93
Avg Latency:    50ms
----------------------------------------
```

### What is Evaluated

- **Prompt Performance:** Agent responses against golden datasets
- **Semantic Correctness:** Using model-graded evals (LLM-as-judge)
- **Regression Prevention:** Ensuring prompt changes don't break existing behavior
- **Reliability Metrics:** Pass rate, accuracy scores, latency

### Creating Your Own Evals

See [docs/AGENT-VALIDATION.md](./AGENT-VALIDATION.md) for:

- How to create golden datasets
- Grading criteria (Exact, Contains, Regex, LLM-Graded)
- Running evals independently

---

## Quick Reference

| Command                  | Speed    | Use Case             | Runs In     |
| ------------------------ | -------- | -------------------- | ----------- |
| `npm run validate:quick` | 10-30s   | Pre-commit           | Git hooks   |
| `npm run validate`       | 2-5min   | Default validation   | Manual / CI |
| `npm run validate:full`  | 2-5min   | Comprehensive check  | CI/CD       |
| `npm run validate:fix`   | Variable | Auto-sync registries | Manual      |

---

## Understanding Validation Failures

### Registry Errors

```bash
❌ Skill agent-evaluator path must start with skills/
```

**Fix:** Run `npm run validate:fix` to auto-sync registries

### Type Errors

```bash
❌ Type checking failed! Fix type errors above.
```

**Fix:** Check TypeScript errors in output, fix manually

### Linting Errors

```bash
❌ Linting failed! Run 'npm run lint:fix' to auto-fix issues.
```

**Fix:** Run `npm run lint:fix`

### Agent Evaluation Failures

```bash
❌ Test T002: FAIL (score: 0.60)
    Expected semantic similarity > 0.80
```

**Fix:** Review golden dataset in `tests/fixtures/`, update prompts or expected outputs

---

## Validation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   npm run validate                          │
│                  (DEFAULT - Full)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
      ┌────────────────────────────────────┐
      │   scripts/validate-full.sh          │
      │   (Comprehensive Validation)        │
      └────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Phase 1 │  │  Phase 2 │  │  Phase 3 │
  │  Linting │  │   Types  │  │   Tests  │
  └──────────┘  └──────────┘  └──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Phase 5 │  │ Phase 5.3│  │Phase 5.12│
  │ Registry │  │Brain CLI │  │Agent Eval│
  └──────────┘  └──────────┘  └──────────┘
                                    │
                                    ▼
                           🎉 All Checks Pass
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run validate # Runs full validation
```

---

## Related Documentation

- [AGENT-VALIDATION.md](./AGENT-VALIDATION.md) - Agent evaluation details
- [VALIDATION-FIRST-DEVELOPMENT.md](../playbooks/validation-first-development.md) - Development methodology
- [.claude/commands/validate.md](../.claude/commands/validate.md) - Source script definition

---

## FAQ

**Q: Why did validation suddenly start failing after I pulled?**
A: New validation phases were added. Run `npm install` to get dependencies, then `npm run validate:fix` to sync registries.

**Q: Can I skip pre-commit validation?**
A: Use `SKIP_VALIDATION=1 git commit -m "..."` or `git commit --no-verify`, but this is discouraged. Fix the issues instead.

**Q: How do I run just the agent evaluation phase?**
A: `node scripts/run-agent-evals.js --dataset tests/fixtures/golden-dataset-example.json`

**Q: The validation is too slow for my workflow**
A: Use `npm run validate:quick` for fast feedback. Reserve full validation for pre-push/CI.

**Q: Is this system AI-model specific (Gemini/Claude/Codex)?**
A: **No.** The validation system is standard Node.js/Bash. It works identically regardless of which AI you use to interact with the repo. The scripts validate the _code_, not the _AI_.
