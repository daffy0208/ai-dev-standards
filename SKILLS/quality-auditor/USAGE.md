# How to Use the Quality Auditor Skill

## Quick Start

### Basic Usage

```
You: "Use the quality-auditor skill to audit ai-dev-standards"
```

Claude will:
1. **Discover** - Read documentation, examine code, test functionality (10 min)
2. **Evaluate** - Score all 12 dimensions with evidence (30-60 min)
3. **Report** - Generate comprehensive report with recommendations (20 min)

**Total time:** 60-90 minutes

---

## Advanced Usage

### Focus on Specific Dimensions

```
You: "Use the quality-auditor skill to evaluate ai-dev-standards,
focusing on developer experience and ADHD-friendliness"
```

### Compare Tools

```
You: "Use the quality-auditor skill to compare Next.js vs Remix"
```

### Pre-Launch Check

```
You: "Use the quality-auditor skill to check if my app is production-ready"
```

### Specific Questions

```
You: "Use the quality-auditor skill to answer: Is ai-dev-standards
secure enough for enterprise use?"
```

---

## What You'll Get

### Comprehensive Report

```markdown
# Quality Audit Report

**Overall Score:** 8.7/10 - Excellent

**Key Strengths:**
1. Exceptional automation (10/10)
2. Outstanding documentation (9/10)
3. Excellent ADHD-friendliness (9/10)

**Critical Improvements:**
1. Add unit tests (current: 0%)
2. Security audit needed
3. Performance benchmarks missing

[Full 12-dimension analysis with evidence]
[Prioritized recommendations]
[Comparative analysis vs industry leaders]
```

---

## Sample Commands

### Self-Audit

```
Use the quality-auditor skill to audit ai-dev-standards
and compare it against industry leaders like Vercel and Next.js
```

### Quick Assessment

```
Use the quality-auditor skill to give me a quick
assessment of this tool's production-readiness
```

### Detailed Review

```
Use the quality-auditor skill to conduct a comprehensive
audit of ai-dev-standards across all 12 dimensions, with
special attention to ADHD-friendliness and developer experience
```

---

## Understanding Scores

### 9-10 (Exceptional)
- Industry-leading
- Sets new standards
- Minimal improvements possible

### 7-8 (Excellent/Very Good)
- Above average
- Competitive with top tools
- Some improvements beneficial

### 5-6 (Good/Acceptable)
- Meets expectations
- Average quality
- Several improvements needed

### Below 5 (Needs Work)
- Below standards
- Significant issues
- Major improvements required

---

## When to Use

**Before Launch:**
- Verify production-readiness
- Identify blocking issues
- Validate quality claims

**During Development:**
- Track quality metrics
- Guide improvement priorities
- Benchmark progress

**For Comparison:**
- Evaluate alternatives
- Understand trade-offs
- Make informed decisions

**For Compliance:**
- Security audit
- Accessibility review
- Standards compliance

---

## What Gets Evaluated

### 1. Code Quality (10%)
- Structure, patterns, maintainability
- Clean code principles
- Design patterns

### 2. Architecture (10%)
- System design, scalability
- Modularity, coupling
- Architectural patterns

### 3. Documentation (10%)
- Completeness, clarity
- Examples, accuracy
- Onboarding quality

### 4. Usability (10%)
- Learning curve
- Installation ease
- User experience

### 5. Performance (8%)
- Speed, efficiency
- Resource usage
- Optimization

### 6. Security (10%)
- Vulnerabilities
- Best practices
- OWASP compliance

### 7. Testing (8%)
- Coverage, quality
- Automation
- Test types

### 8. Maintainability (8%)
- Technical debt
- Refactorability
- Code clarity

### 9. Developer Experience (10%)
- Setup ease
- Debugging
- Tooling

### 10. Accessibility (8%)
- ADHD-friendly
- WCAG compliance
- Inclusive design

### 11. CI/CD (5%)
- Automation
- Deployment
- Reliability

### 12. Innovation (3%)
- Novelty
- Creativity
- Forward-thinking

---

## Tips for Best Results

### Be Specific

```
❌ "Audit this"
✅ "Audit ai-dev-standards focusing on security and performance"
```

### Provide Context

```
❌ "Is this good?"
✅ "Is this production-ready for enterprise SaaS use?"
```

### Request Comparisons

```
❌ "What's the score?"
✅ "How does this compare to Vercel and Netlify?"
```

### Ask for Priorities

```
❌ "List issues"
✅ "What are the top 3 issues blocking production deployment?"
```

---

## Example Session

```
You: "Use the quality-auditor skill to audit ai-dev-standards
comprehensively and provide top 5 improvement priorities"

Claude: "I'll conduct a comprehensive quality audit of
ai-dev-standards across all 12 dimensions.

Phase 1: Discovery (10 min)
✓ Read documentation (DOCS/, README.md)
✓ Examined codebase (CLI/, SKILLS/, etc.)
✓ Tested bootstrap process
✓ Reviewed supporting materials

Phase 2: Evaluation (45 min)
[Evaluating each dimension...]

Code Quality: 8/10 - Very Good
- Excellent structure and organization
- Clean separation of concerns
- Some ESM/CommonJS compatibility fixes needed

Architecture: 9/10 - Excellent
- Outstanding modular design
- Registry-based system is elegant
- Auto-bootstrap is innovative

[... continuing through all 12 dimensions ...]

Phase 3: Report (20 min)
[Generating comprehensive report...]

# Quality Audit Report: ai-dev-standards

**Overall Score: 8.7/10 - Excellent**

**Top 5 Improvement Priorities:**

1. **Add Unit Tests** (HIGH PRIORITY)
   - Current: 0% coverage
   - Target: 80%+
   - Impact: High
   - Effort: Medium
   - Timeline: 2 weeks

2. **Security Audit** (HIGH PRIORITY)
   - Run npm audit
   - Review secret management
   - Add security documentation
   - Impact: Critical
   - Effort: Low
   - Timeline: 3 days

3. **Performance Benchmarks** (MEDIUM PRIORITY)
   - Measure bootstrap time
   - Benchmark sync speed
   - Add performance tests
   - Impact: Medium
   - Effort: Low
   - Timeline: 1 week

4. **CI/CD Setup** (MEDIUM PRIORITY)
   - Add GitHub Actions
   - Auto-test on PR
   - Auto-publish on release
   - Impact: Medium
   - Effort: Medium
   - Timeline: 1 week

5. **Accessibility Audit** (LOW PRIORITY)
   - Test with screen readers
   - Add keyboard navigation
   - Verify WCAG compliance
   - Impact: Medium
   - Effort: Low
   - Timeline: 3 days

[Full detailed report follows...]"
```

---

## Standards Referenced

The skill compares against:

- **Code Quality:** Clean Code, Code Complete
- **Security:** OWASP Top 10, SANS Top 25
- **Accessibility:** WCAG 2.1, ADHD-friendly design
- **Testing:** Test Pyramid, 80% coverage
- **Performance:** Core Web Vitals, RAIL model
- **Architecture:** Clean Architecture, DDD

---

## Questions?

**Q: Can I audit my own code?**
Yes! Regular self-audits maintain quality.

**Q: How often should I audit?**
- Pre-launch: Always
- Major releases: Every time
- Ongoing: Quarterly

**Q: What if I disagree with a score?**
Scores are evidence-based. Provide counter-evidence for re-evaluation.

---

**Ready to measure excellence?**

```
Use the quality-auditor skill to audit [your-tool]
```
