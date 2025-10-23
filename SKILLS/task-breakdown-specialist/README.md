# Task Breakdown Specialist - Quick Start

**Version:** 1.0.0
**Category:** ADHD Support
**Difficulty:** Beginner

## What This Skill Does

Automatically breaks large, overwhelming tasks into tiny, achievable micro-tasks optimized for ADHD. Reduces activation energy, provides quick wins, and makes progress visible.

## When to Use

Use this skill when:
- Feeling overwhelmed by task size
- Can't start a task (activation energy too high)
- Need to make progress visible
- Want to build momentum with quick wins
- Estimating time for tasks

**Automatic Activation:** Claude uses this skill automatically when you describe a large task or say you're feeling stuck.

## Quick Start

**Just describe what you need to do:**

```
You: "I need to build user authentication"

Claude: [Automatically uses task-breakdown-specialist]

Quick Wins (Start Here - 2 min): ⚡
1. [ ] Create /auth folder (30 sec)
2. [ ] Create auth.ts file (30 sec)
3. [ ] Install bcrypt (1 min)

Core Work (After momentum):
4. [ ] Build login endpoint (25 min)
5. [ ] Add password hashing (15 min)
...

Total: ~2 hours (ADHD-realistic estimate)

💡 Start with task #1 NOW (30 seconds = easy!)
```

## Key Concepts

**Activation Energy** - The effort needed to start a task
- Large tasks = high activation energy = procrastination
- Tiny tasks = low activation energy = easy to start

**Quick Wins** - Tasks that take 2-5 minutes
- Build momentum
- Provide immediate dopamine
- Establish "I'm productive" mindset
- Always start with 3 quick wins

**ADHD Tax** - Reality-based time estimates
- Multiply neurotypical estimates by 1.5-2x
- Accounts for distractions, context switching, "where was I?"
- Better to overestimate and finish early (dopamine!)

**Progress Visualization** - Make work visible
- Checklists ✅
- Progress bars ████████░░ 80%
- Time tracking
- Dopamine hits from completion

## The 2-5-15-30 Pattern

Break tasks into time buckets:

- **2-min tasks** 🟢 - Setup, scaffolding (START HERE)
- **5-min tasks** 🟢 - Simple functions, basic HTML
- **15-min tasks** 🟡 - Core logic, API calls
- **30-min tasks** 🟡 - Complex features

**Rule:** Always start with 2-minute tasks!

## Quick Reference

### Good Task Breakdown

✅ **DO:**
- Start with quick wins (2-5 min tasks)
- Keep tasks ≤ 15 minutes
- Use clear "done" criteria
- Include ADHD tax in estimates (1.5-2x)
- Make progress visible
- Mix easy and hard tasks

❌ **DON'T:**
- Start with hard tasks (high activation energy)
- Make tasks vague ("work on dashboard")
- Use wishful time estimates
- Create all-hard-task lists
- Skip quick wins

### Example Breakdown

```markdown
❌ Bad: "Build dashboard" (overwhelming)

✅ Good:

Quick Wins (2 min total):
- [ ] Create dashboard.tsx (30 sec) 🟢
- [ ] Add to nav menu (1 min) 🟢
- [ ] Add heading (30 sec) 🟢

Core Work (45 min total):
- [ ] Build layout (15 min) 🟡
- [ ] Fetch user data (15 min) 🟡
- [ ] Display stats (15 min) 🟡

Polish (15 min total):
- [ ] Add loading state (5 min) 🟢
- [ ] Handle errors (10 min) 🟡

Total: ~60 min (realistic: 90 min with ADHD tax)
```

## Automation Features

**Claude automatically:**
- ✅ Breaks down large tasks when you describe them
- ✅ Adds 3 quick wins to start
- ✅ Includes ADHD-realistic time estimates
- ✅ Creates progress visualization
- ✅ Reorders tasks for momentum

**You just:**
- Describe what you need to do
- Start with the first tiny task
- Get dopamine from checking off tasks

## Time Estimates (ADHD-Realistic)

```
Your thought: "This will take 1 hour"
Reality: 1.5-2 hours

Quick task (5 min): → 7-10 min
Medium task (30 min): → 45-60 min
Large task (2 hours): → 3-4 hours

New/unknown: 3x what you think

Better to overestimate! Finishing early = dopamine
```

## Emergency Breakdown

**Stuck right now?**

1. Write the overwhelming task
2. Ask: "What's the FIRST 2-minute action?"
3. Do ONLY that action
4. ✅ Dopamine!
5. Ask: "What's next?"
6. Repeat

**Example:**
```
1. Overwhelming: "Build checkout flow"
2. First action: "Create checkout.tsx file" (30 sec)
3. [DO IT]
4. ✅ Done!
5. Next: "Add basic form HTML" (5 min)
6. [DO IT]
7. Keep going...
```

## Common Patterns

### Feature Breakdown
1. Identify components that change
2. Break each into micro-tasks
3. Start with quick wins
4. Build core features
5. Polish and ship

### Bug Fix Breakdown
1. Reproduce (5-10 min)
2. Investigate (10-20 min)
3. Fix (20-30 min)
4. Test (10-15 min)
5. Deploy (5-10 min)

### Learning Breakdown
1. Overview (watch video, read intro)
2. Hands-on (build simple example)
3. Apply (use in real project)

## Tools & Templates

**Daily Task Template:**
```markdown
# Today

ONE Main Goal: [most important thing]

Morning Quick Wins:
- [ ] Task 1 (2 min) 🟢
- [ ] Task 2 (5 min) 🟢

Main Work:
- [ ] Task 3 (30 min) 🟡

Wins Log: [completed tasks for dopamine]
```

## Success Metrics

You're using this skill well when:
- ✅ Starting tasks feels easy
- ✅ You complete multiple tasks per session
- ✅ Time estimates are realistic
- ✅ You see progress clearly
- ✅ You feel in control (not overwhelmed)

## Related Skills

- **context-preserver** - Auto-save state between tasks
- **focus-session-manager** - Automated break reminders
- **completion-coach** - Auto-detect "90% done" syndrome
- **adhd-workflow-architect** - Build automated workflows

## Version History

- **1.0.0** (2025-10-22): Initial release with full ADHD optimization

## License

Part of ai-dev-standards repository.
