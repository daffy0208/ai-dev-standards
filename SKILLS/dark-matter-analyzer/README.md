# Dark Matter Analyzer

**Reveal what is unseen, unsaid, and unmeasured in your repositories.**

## Quick Start

Ask Claude to analyze your repository's health:

```
"Run Dark Matter analysis on this repository"
"Why does this codebase feel misaligned?"
"Check repository coherence"
"Analyze our documentation patterns"
```

Claude will automatically activate this skill to provide deep insights into organizational health, strategic drift, and hidden patterns.

## What This Skill Does

Dark Matter Mode goes beyond traditional code quality metrics to reveal:

- 📊 **Strategic Drift** - When stated goals don't match actual work
- 📚 **Documentation Inflation** - Planning outpacing execution
- 🔍 **Hidden Patterns** - Subtle misalignments before they become problems
- 💡 **Execution Gaps** - Documentation without implementation
- 🎯 **Repository Coherence Index** - Overall health score (0-100)

## When to Use

### Perfect For:
- Repository feels "off" but you can't articulate why
- Extensive documentation but team still confused
- High velocity but low coherence
- Preparing for major reorganization
- Regular health checks (quarterly recommended)

### Not Needed For:
- Simple bug fixes
- Standard code reviews
- Feature additions
- Basic refactoring

## What You'll Get

### Dark Matter Report Includes:

1. **Executive Summary** - Key findings at a glance
2. **Pattern Analysis** - What the repository reveals about team state
3. **The Unseen** - What exists but isn't visible
4. **The Unsaid** - What isn't explicitly stated
5. **The Unmeasured** - What has no metric
6. **Prioritized Actions** - HOLD (critical), REVIEW (medium), OBSERVE (gentle)
7. **Repository Coherence Index** - Health score with interpretation

## Example Insights

> "Planning activity significantly outpaces execution. The repository is drowning in its own self-awareness."

> "The repository is a library of wisdom without hands to execute it. 92% of capabilities are aspirational, not actionable."

> "The repository passes its own tests but may not serve users. Validation ensures internal consistency, not external utility."

## Understanding Your RCI Score

| Score | Status | What It Means |
|-------|--------|---------------|
| **85-100** | ✅ Coherent | Healthy, aligned, sustainable |
| **70-84** | 🟡 Monitor | Early drift, watch for patterns |
| **50-69** | 🟠 Misaligned | Intent and reality diverging |
| **<50** | 🔴 Incoherent | Major realignment needed |

## Common Patterns Detected

### Strategic Drift
**Signal:** README doesn't match commit activity
**Meaning:** Vision disconnection or premature pivoting

### Documentation Inflation
**Signal:** Many similar .md files created rapidly
**Meaning:** Over-planning; avoidance through writing

### Execution Deficit
**Signal:** Much more documentation than implementation
**Meaning:** Hope-driven development instead of execution-driven

### Task-Reality Desync
**Signal:** Tests pass but features incomplete
**Meaning:** Validating structure, not actual utility

### Suppression Pattern
**Signal:** Many `eslint-disable` or `@ts-ignore` comments
**Meaning:** Time pressure, fatigue, or technical debt accumulation

## How It Works

Dark Matter Mode operates through 7 layers:

1. **Sensing** - Captures code, docs, temporal, environmental signals
2. **Pattern Detection** - Maps weak signals to known patterns
3. **Reflection** - Translates technical symptoms to human meaning
4. **Action Routing** - Prioritizes by urgency (OBSERVE/REVIEW/HOLD)
5. **Feedback** - Learns and calibrates over time
6. **Shadow** - Acknowledges interpretive biases
7. **Integration** - Restores coherence through action

## Automated Scanning

Use with the `dark-matter-analyzer-mcp` tool for automated analysis:

```bash
# Quick health check
dark-matter scan --quick

# Deep analysis
dark-matter scan --deep --output report.md

# Calculate RCI only
dark-matter rci

# Monitor mode (continuous)
dark-matter watch --interval 7d
```

## Key Principles

**Reveal, Not Judge** - Patterns are expressions, not errors

**Interpretive, Not Diagnostic** - Illuminates meaning, doesn't predict

**Coherence Over Speed** - Truthfulness matters more than velocity

**Emotional Resonance** - Technical patterns reveal human state

**External Validation** - Internal consistency ≠ external utility

## Real-World Example

A repository had:
- 36 documented skills
- Only 3 implementation tools
- 30 documentation files (16,302 lines)
- All tests passing

**Dark Matter Revealed:**
- 12:1 skill-to-tool gap (execution deficit)
- Documentation inflation (543 lines avg per doc)
- Task-reality desync (tests validated structure, not utility)
- RCI Score: 72/100 (MONITOR status)

**Recommended Actions:**
1. 🔴 HOLD: Freeze new skills until tools catch up
2. 🔴 HOLD: Consolidate docs (30 → 15 target)
3. 🟡 REVIEW: Gather external user feedback
4. 🟢 OBSERVE: Weekly build vs. doc ratio check

**Result:** Repository improved from 72 to 85 RCI by focusing on execution over documentation.

## Complementary Skills

Use Dark Matter Analyzer with:
- **mvp-builder** - Shift to execution-driven development
- **quality-auditor** - Technical quality after organizational health
- **product-strategist** - Strategic realignment
- **technical-debt-assessor** - Prioritize technical improvements

## FAQ

**Q: Will this criticize our team?**
A: No. Dark Matter Mode illuminates patterns without judgment. It's reflective, not punitive.

**Q: How often should we run this?**
A: Quarterly for health checks, or when something feels "off" but you can't articulate why.

**Q: Is this just for large projects?**
A: Works for any size. Even small projects benefit from coherence checks.

**Q: What if our RCI score is low?**
A: That's valuable information! The score is orientation, not verdict. Use it to guide improvement.

**Q: Can we automate this?**
A: Yes! Use the `dark-matter-analyzer-mcp` tool for continuous monitoring.

## Getting Started

Simply ask Claude:

```
"Analyze this repository using Dark Matter Mode"
```

Claude will:
1. Scan your repository
2. Detect patterns
3. Generate insights
4. Provide prioritized recommendations
5. Calculate your RCI score

---

**Remember:** *"Every repo is a psyche made visible."*

The patterns in your code reveal the patterns in your team. Dark Matter Mode helps you see them clearly so you can improve with intention.
