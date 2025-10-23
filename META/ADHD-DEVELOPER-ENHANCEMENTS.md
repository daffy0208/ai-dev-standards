# ADHD Developer Enhancements - Implementation Plan

**Last Updated:** 2025-10-22
**Priority:** P0 (Personal productivity is critical)
**Estimated Effort:** 3-4 weeks

---

## Executive Summary

ADHD presents unique challenges in software development: time blindness, task initiation difficulty, hyperfocus management, working memory limitations, and completion anxiety. This plan adds ADHD-optimized skills, MCPs, tools, and patterns to ai-dev-standards.

**Key Principle:** Reduce cognitive load, automate decision-making, provide structure, enable quick re-entry, and make progress visible.

---

## ADHD Challenges in Development

### Challenge 1: Task Initiation (Activation Energy)
**Problem:** Difficulty starting tasks, especially large or ambiguous ones
**Impact:** Procrastination, anxiety, missed deadlines

### Challenge 2: Time Blindness
**Problem:** Poor time estimation, losing track of time during hyperfocus
**Impact:** Missed meetings, scope creep, burnout

### Challenge 3: Working Memory Limitations
**Problem:** Difficulty holding context in mind while coding
**Impact:** Losing train of thought, re-reading code repeatedly

### Challenge 4: Context Switching
**Problem:** High cost of switching between tasks or projects
**Impact:** Lost productivity, difficulty resuming work

### Challenge 5: Hyperfocus (Double-Edged Sword)
**Problem:** Getting stuck optimizing wrong thing, ignoring breaks
**Impact:** Wasted time, health issues, tunnel vision

### Challenge 6: Completion Difficulty
**Problem:** Losing interest near finish line, "90% done" syndrome
**Impact:** Abandonware, unfinished projects

### Challenge 7: Organization & Prioritization
**Problem:** Everything feels urgent, difficulty choosing what to work on
**Impact:** Thrashing, paralysis, important work neglected

### Challenge 8: Dopamine-Seeking
**Problem:** Seeking novel/interesting work over important work
**Impact:** Side quests, shiny object syndrome

---

## Proposed Solutions

## Part 1: ADHD-Optimized Skills (5 new skills)

### Skill 1: task-breakdown-specialist

**Purpose:** Break large tasks into tiny, achievable micro-tasks

**Key Features:**
- Automatic task decomposition
- 15-minute task chunking (ADHD-friendly)
- Progress visualization
- Dopamine-optimizing task ordering (quick wins first)
- Momentum building (small → medium → large)

**Example Output:**
```markdown
# Build Login Page

❌ Too big: "Build login page" (feels overwhelming)

✅ ADHD-friendly breakdown:
1. [ ] Create login.tsx file (2 min) 🟢 Quick win!
2. [ ] Add basic form HTML (5 min) 🟢
3. [ ] Style with Tailwind (10 min) 🟢
4. [ ] Add email validation (15 min) 🟡
5. [ ] Add password validation (15 min) 🟡
6. [ ] Connect to API (20 min) 🟡
7. [ ] Add error handling (15 min) 🟡
8. [ ] Test all paths (10 min) 🟢

Total: ~90 min (estimated with ADHD tax: 2 hours)

💡 Start with #1 now (2 minutes = lower activation energy!)
```

**File Structure:**
```
SKILLS/task-breakdown-specialist/
  ├── SKILL.md
  └── README.md
```

---

### Skill 2: focus-session-manager

**Purpose:** Manage hyperfocus, breaks, and context switching

**Key Features:**
- Pomodoro integration with ADHD tweaks
- Hyperfocus detection and breaks
- Context saving before breaks
- Transition rituals
- Body doubling suggestions

**Example Output:**
```markdown
# Focus Session Started: API Integration

⏱️ Session: 25 minutes
🎯 Goal: Connect login form to /auth/login endpoint
📝 Context: Working in src/components/login.tsx line 42

--- After 25 minutes ---

🎉 Session Complete! Time for 5-min break.

Before you break:
- [x] Commit current work (autosaved)
- [x] Write next step: "Add error toast for failed login"
- [ ] Stand up and move (important!)

Next session preview:
🎯 Next: Add error toast for failed login
📍 Resume at: src/components/login.tsx line 58
⏱️ Estimated: 15 minutes

--- Hyperfocus detected (90 minutes no break) ---

⚠️ HYPERFOCUS ALERT ⚠️

You've been coding for 90 minutes without a break!

Health check:
- [ ] Drink water
- [ ] Stretch/move
- [ ] Look away from screen (20-20-20 rule)
- [ ] Bathroom break

Resume in 10 minutes.
```

**File Structure:**
```
SKILLS/focus-session-manager/
  ├── SKILL.md
  └── README.md
```

---

### Skill 3: context-preserver

**Purpose:** Minimize cognitive load when resuming work

**Key Features:**
- Automatic context notes
- Mental state capture
- Quick restart documentation
- "Where was I?" recovery
- Breadcrumb trail

**Example Output:**
```markdown
# Work Context Saved - 2025-10-22 14:35

## What You Were Doing
Building authentication flow for login page

## Exact Location
File: `src/components/login.tsx`
Line: 42
Function: `handleSubmit()`

## Mental State
- ✅ Completed: Email validation
- 🔄 In Progress: Adding API call to /auth/login
- 📋 Next: Error handling for 401/500
- 💭 Note: Considering adding loading state to button

## Variables to Remember
- `API_URL` is defined in .env.local
- Using fetch (not axios) per team standard
- Error format: `{ error: string, code: number }`

## Quick Restart Commands
```bash
cd ~/project
code src/components/login.tsx:42
npm run dev
```

## Estimated Time to Resume
5 minutes (context is fresh)
```

**File Structure:**
```
SKILLS/context-preserver/
  ├── SKILL.md
  └── README.md
```

---

### Skill 4: adhd-workflow-architect

**Purpose:** Design ADHD-optimized development workflows

**Key Features:**
- Single-tasking project structure
- Friction reduction (zero-setup environments)
- Progress visibility
- Micro-commit workflow
- Dopamine-driven milestones

**Example Output:**
```markdown
# ADHD-Optimized Workflow for Your Project

## Project Structure (Cognitive Load Reduction)
```
project/
├── .adhd/
│   ├── current-task.md        # ONE task, visible always
│   ├── context-notes.md       # Auto-updated mental state
│   ├── wins.md                # Dopamine log
│   └── resume-quick.sh        # One-command restart
├── src/
│   └── [your code]
└── README.md                  # Quick-start (no decisions)
```

## Daily Workflow
1. ☀️ Morning: Run `./start-work.sh` (zero decisions)
2. 📋 See ONE task in `.adhd/current-task.md`
3. ⏱️ Work in 25-min focus sessions
4. ✅ Micro-commit every 15 minutes
5. 🎉 Log wins in `.adhd/wins.md` (dopamine++)
6. 🌙 Evening: Run `./save-context.sh` (auto)

## Micro-Commit Pattern
```bash
# Every 15 minutes, commit work-in-progress
git add .
git commit -m "WIP: Added email validation (15min)"

# Why this helps ADHD:
# - Progress visible
# - Easy to resume
# - Dopamine hits
# - Reduces "perfect commit" paralysis
```

## Progress Visualization
```markdown
## Login Feature Progress: ████████░░ 80%

✅ Create component (2 min)
✅ Add form HTML (5 min)
✅ Style with Tailwind (10 min)
✅ Email validation (15 min)
🔄 API integration (20 min) ← YOU ARE HERE
⬜ Error handling (15 min)
⬜ Tests (10 min)

Next micro-task: Add fetch call to /auth/login (5 min)
```

**File Structure:**
```
SKILLS/adhd-workflow-architect/
  ├── SKILL.md
  └── README.md
```

---

### Skill 5: completion-coach

**Purpose:** Help finish projects and avoid abandonware

**Key Features:**
- Detect "90% done" syndrome
- Motivation strategies
- Minimum viable completion
- Shipping reminders
- Celebration automation

**Example Output:**
```markdown
# Project Completion Analysis

## Status: ⚠️ COMPLETION RISK DETECTED

Your project is 87% complete but hasn't been touched in 5 days.

**Classic ADHD Pattern:** Lost interest near finish line.

## What's Left (Realistic Assessment)
### To Ship MVP:
- [ ] Fix password reset bug (30 min) 🟡
- [ ] Write deployment docs (15 min) 🟢
- [ ] Deploy to production (20 min) 🟡

**Total:** ~90 minutes to DONE ✅

### Can Skip for MVP:
- Email templates (nice-to-have)
- Admin dashboard (future)
- Analytics (later)

## Motivation Boost
**You're so close!** 90 minutes = SHIPPED PROJECT = Résumé line + Portfolio piece

**Tomorrow:** Block 2 hours, finish this, then start something new.

## Minimum Viable Completion
If 90 min feels overwhelming:

**30-Minute Version:**
- [ ] Fix critical bug (30 min)
- [ ] Deploy as-is
- [ ] Done!

Ship now, polish later. Shipping > Perfect.

## Reward
When deployed, treat yourself to:
- [ ] Your favorite snack
- [ ] 30 min guilt-free gaming
- [ ] Tell someone about it
```

**File Structure:**
```
SKILLS/completion-coach/
  ├── SKILL.md
  └── README.md
```

---

## Part 2: ADHD-Optimized MCPs (5 new MCPs)

### MCP 1: adhd-task-breaker-mcp

**Purpose:** Automatically break down large tasks into ADHD-friendly micro-tasks

**Key Features:**
- Natural language task input
- 15-minute task chunking
- Time estimation with "ADHD tax" multiplier (1.5-2x)
- Dependency detection
- Quick wins prioritization

**Example Usage:**
```bash
# Input
claude-mcp adhd-task-breaker "Build user authentication system"

# Output
Task Breakdown (ADHD-Optimized):

🎯 Goal: Build user authentication system
⏱️ Estimated: 8 hours (realistic: 12 hours with ADHD)

Phase 1: Quick Wins (Momentum Building) ⚡
1. [ ] Create /auth folder structure (2 min) 🟢
2. [ ] Install auth libraries (5 min) 🟢
3. [ ] Add .env variables template (3 min) 🟢

Phase 2: Core Implementation 🔨
4. [ ] Build login API endpoint (25 min) 🟡
5. [ ] Add password hashing (15 min) 🟡
6. [ ] Create session management (30 min) 🟡
7. [ ] Build logout endpoint (10 min) 🟢

Phase 3: Polish & Testing 🎨
8. [ ] Add error handling (20 min) 🟡
9. [ ] Write tests (30 min) 🟡
10. [ ] Test all paths manually (15 min) 🟢

💡 Start with Phase 1 (3 quick wins = dopamine = momentum!)
```

**Implementation:**
```python
# MCP-SERVERS/adhd-task-breaker-mcp/server.py
from mcp import MCPServer
import anthropic

class ADHDTaskBreakerMCP:
    def __init__(self):
        self.adhd_time_multiplier = 1.75  # Research-based

    def break_task(self, task_description):
        """Break task into ADHD-friendly micro-tasks"""

        prompt = f"""
        Break this task into ADHD-friendly micro-tasks:

        Task: {task_description}

        Guidelines:
        - Each micro-task: 15 minutes or less
        - Start with 3 "quick wins" (2-5 min each)
        - Clearly define done criteria
        - Add time estimates with ADHD tax (1.75x)
        - Mark difficulty: 🟢 Easy, 🟡 Medium, 🔴 Hard
        - Group into phases for progress visibility

        Format as checklist with emojis for dopamine.
        """

        # Call Claude API
        # Return structured breakdown
```

**File Structure:**
```
MCP-SERVERS/adhd-task-breaker-mcp/
  ├── server.py
  ├── README.md
  ├── package.json
  └── tests/
```

---

### MCP 2: context-saver-mcp

**Purpose:** Automatically save and restore work context

**Key Features:**
- Auto-save mental state every 15 minutes
- Git integration (auto-commit WIP)
- Current file/line tracking
- Next-step capture
- One-command resume

**Example Usage:**
```bash
# Auto-save (runs every 15 min)
context-saver save

# Save before break
context-saver save --break "lunch"

# Resume work
context-saver resume

# Output:
╔══════════════════════════════════════╗
║  Resuming Work Session              ║
║  Last saved: 12:15 PM (45 min ago) ║
╚══════════════════════════════════════╝

📂 Opening: src/components/login.tsx
📍 Line: 42
🔄 Function: handleSubmit()

💭 You were:
  - Adding API call to /auth/login
  - Need to handle 401/500 errors next

⏱️ Estimated resume time: 5 minutes

Commands run:
  $ cd ~/project
  $ code src/components/login.tsx:42
  $ npm run dev

✅ Ready to code!
```

**Implementation:**
```python
# MCP-SERVERS/context-saver-mcp/server.py
import os
import json
from datetime import datetime

class ContextSaverMCP:
    def save_context(self, notes=None):
        """Save current development context"""

        context = {
            "timestamp": datetime.now().isoformat(),
            "cwd": os.getcwd(),
            "current_file": self.get_active_file(),
            "cursor_position": self.get_cursor_position(),
            "mental_state": notes or self.capture_mental_state(),
            "next_task": self.extract_next_task(),
            "git_branch": self.get_git_branch(),
            "uncommitted_changes": self.get_git_status()
        }

        # Save to .adhd/context.json
        # Create micro-commit if changes

    def resume_context(self):
        """Restore previous context"""

        # Load .adhd/context.json
        # Open files
        # Position cursor
        # Show notes
        # Start dev server
```

---

### MCP 3: hyperfocus-guardian-mcp

**Purpose:** Protect health during hyperfocus sessions

**Key Features:**
- Track coding time continuously
- Break reminders (dismissable but persistent)
- Health checks (water, movement, eyes)
- Hyperfocus detection (90+ min threshold)
- Gentle interruption system

**Example Usage:**
```bash
# Start tracking
hyperfocus-guardian start

# Background monitoring...

# After 90 minutes:
╔═══════════════════════════════════════╗
║   ⚠️ HYPERFOCUS DETECTED ⚠️          ║
║                                       ║
║  You've been coding for 90 minutes   ║
║  without a break.                    ║
║                                       ║
║  Health Check:                       ║
║  - [ ] Drink water (NOW)             ║
║  - [ ] Stand and stretch             ║
║  - [ ] Look away (20-20-20)          ║
║  - [ ] Bathroom break                ║
║                                       ║
║  Resume in 10 minutes.               ║
║                                       ║
║  [Dismiss] [Take Break] [Extend 30m] ║
╚═══════════════════════════════════════╝

# If dismissed 3x, escalate:
🚨 HEALTH ALERT: 3 hours no break!
💡 Save context and take a real break.
```

---

### MCP 4: dopamine-tracker-mcp

**Purpose:** Track progress and provide motivation

**Key Features:**
- Log completed tasks automatically
- Visualize progress (graphs, streaks)
- Celebrate wins (big and small)
- Streak tracking
- Achievements/badges

**Example Usage:**
```bash
# Auto-log when tasks complete
dopamine-tracker log "Implemented login form"

# View progress
dopamine-tracker show

╔════════════════════════════════════════╗
║  🎉 YOUR WINS THIS WEEK 🎉           ║
╚════════════════════════════════════════╝

Monday:    ✅✅✅✅✅ (5 tasks)
Tuesday:   ✅✅✅ (3 tasks)
Wednesday: ✅✅✅✅✅✅✅ (7 tasks) 🔥 Personal best!
Thursday:  ✅✅✅✅ (4 tasks)
Friday:    ✅✅ (2 tasks) ← TODAY

📊 This Week: 21 tasks completed
📈 Trend: +40% vs last week
🔥 Current Streak: 5 days

🏆 Achievements Unlocked:
  ✅ 5-Day Streak
  ✅ 20+ Tasks/Week
  🔓 Next: Ship a Project

💪 You're crushing it!
```

---

### MCP 5: priority-decider-mcp

**Purpose:** Help choose what to work on (reduce decision paralysis)

**Key Features:**
- Analyze task urgency/importance
- Consider energy levels
- Factor in deadlines
- Suggest next task based on context
- Remove decision-making friction

**Example Usage:**
```bash
# Show what to work on now
priority-decider what-now

╔════════════════════════════════════════╗
║  🎯 WORK ON THIS NOW                  ║
╚════════════════════════════════════════╝

Task: Fix password reset bug
Why now:
  - Blocking user login (high impact)
  - You're in debugging mode (context match)
  - 30-minute estimate (achievable)
  - Due tomorrow (urgent)

Alternatives considered:
  ⏭️ Admin dashboard - Lower priority, bigger task
  ⏭️ Email templates - Nice-to-have, can wait
  ⏭️ Write docs - Low energy task, save for later

Confidence: 95%

[Start Task] [See Other Options]
```

---

## Part 3: ADHD-Friendly Patterns (3 new patterns)

### Pattern 1: ADHD Project Structure Pattern

**File:** `STANDARDS/architecture-patterns/adhd-project-structure.md`

**Content:**
```markdown
# ADHD-Optimized Project Structure

## Core Principle
Reduce cognitive load, enable quick re-entry, make progress visible.

## Standard Structure
```
project/
├── .adhd/                       # ADHD support files
│   ├── current-task.md          # ONE active task (always visible)
│   ├── context-notes.md         # Mental state auto-saved
│   ├── wins.md                  # Dopamine log
│   ├── tasks-backlog.md         # Future tasks (out of sight)
│   ├── resume-quick.sh          # One-command start
│   └── focus-session.json       # Current session state
│
├── README-ADHD.md               # Quick-start (zero decisions)
│   # - One command to start
│   # - Current task highlighted
│   # - No lengthy explanations
│
├── src/                         # Your code
│   └── [organized by feature]   # Not by type (easier mental model)
│
├── .env.example                 # Clear, commented
├── package.json
└── .gitignore
```

## Key Files

### .adhd/current-task.md
```markdown
# 🎯 CURRENT TASK

Fix password reset bug

## Goal
Users can reset password via email link

## Steps
- [x] Reproduce bug locally
- [x] Identify root cause (token expiry)
- [ ] Fix token expiry logic ← YOU ARE HERE (30 min)
- [ ] Test manually (10 min)
- [ ] Deploy fix (15 min)

## Context
- File: src/auth/reset-password.ts
- Line: 67
- Branch: fix/password-reset

## Next
After this: Work on admin dashboard
```

### README-ADHD.md
```markdown
# Quick Start (ADHD Edition)

## ONE Command to Start
```bash
npm run dev:adhd
```

This runs:
- Install deps (if needed)
- Start dev server
- Open current task in editor
- Show focus timer

## Current Task
See: `.adhd/current-task.md`

## Resume After Break
```bash
./resume.sh
```

That's it! No decisions needed.
```

## Benefits
- ✅ Zero decision-making to start
- ✅ Always know what to work on
- ✅ Easy resume after interruptions
- ✅ Progress visibility
- ✅ Dopamine tracking
```

---

### Pattern 2: Micro-Commit Workflow Pattern

**File:** `STANDARDS/architecture-patterns/micro-commit-workflow.md`

**Content:**
```markdown
# Micro-Commit Workflow (ADHD-Optimized)

## Problem
- Traditional commit: Wait until "done" (never happens)
- ADHD brain: Needs frequent dopamine hits
- Context loss: Interruptions lose progress

## Solution
Commit every 15 minutes, even if incomplete.

## Pattern

### Every 15 Minutes
```bash
git add .
git commit -m "WIP: [what you just did] (15min)"

# Examples:
git commit -m "WIP: Added email validation (15min)"
git commit -m "WIP: Styling login form (10min)"
git commit -m "WIP: Debugging token issue (15min)"
```

### Before Break/Interruption
```bash
git add .
git commit -m "PAUSE: [where you left off]"

# Example:
git commit -m "PAUSE: About to add error handling for 401"
```

### When Complete
```bash
# Option 1: Squash WIP commits (if you care about history)
git rebase -i HEAD~5  # Squash last 5 WIP commits

# Option 2: Keep WIP commits (who cares, you shipped!)
git push

# Option 3: Use completion message
git commit -m "✅ COMPLETE: Login form with validation"
```

## Benefits
- ✅ Dopamine hit every 15 min
- ✅ Never lose progress
- ✅ Easy to resume ("where was I?")
- ✅ Progress visualization (git log)
- ✅ Reduces "perfect commit" paralysis

## Git Aliases (Add to ~/.gitconfig)
```ini
[alias]
  wip = !git add . && git commit -m \"WIP: $(date '+%H:%M')\"
  pause = !git add . && git commit -m \"PAUSE: $(date '+%H:%M')\"
  resume = log -1 --pretty=%B
```

Usage:
```bash
git wip           # Quick WIP commit with timestamp
git pause         # Save before break
git resume        # See last commit message
```
```

---

### Pattern 3: Progressive Disclosure Documentation

**File:** `STANDARDS/best-practices/adhd-friendly-documentation.md`

**Content:**
```markdown
# ADHD-Friendly Documentation Pattern

## Problem
- Traditional docs: Wall of text (overwhelming)
- ADHD brain: Can't process long docs
- Need: Quick start, then details on-demand

## Solution
Progressive disclosure: Start simple, reveal complexity gradually.

## Pattern

### Level 1: TL;DR (30 seconds)
```markdown
# Project Name

One-sentence description.

## Quick Start
```bash
npm install && npm run dev
```

Open: http://localhost:3000

## Current Task
See: `.adhd/current-task.md`

**Done reading? Start coding! ↓**
```

### Level 2: Essential Info (2 minutes)
```markdown
<details>
<summary>📚 Click if you need more info</summary>

## What This Does
2-3 sentence explanation.

## Key Commands
- `npm run dev` - Start dev server
- `npm test` - Run tests
- `npm run build` - Production build

## Project Structure
```
src/
  components/  - React components
  api/        - API routes
  utils/      - Helper functions
```

</details>
```

### Level 3: Deep Dive (10+ minutes)
```markdown
<details>
<summary>🔬 Advanced: Architecture & Design Decisions</summary>

[Full documentation here]

</details>
```

## Benefits
- ✅ No overwhelm
- ✅ Get started immediately
- ✅ Details available when needed
- ✅ Respects working memory limits

## Anti-Patterns
❌ Long README with no structure
❌ "Read this first" (never read)
❌ No quick start
❌ Assuming prior knowledge

## Real Example

### ❌ Bad (ADHD-hostile)
```markdown
# My Project

This project uses Next.js 14 with the App Router, TypeScript for type safety,
Tailwind CSS for styling, Prisma as the ORM connected to PostgreSQL, NextAuth
for authentication supporting OAuth providers like Google and GitHub as well as
credentials-based login, tRPC for end-to-end type-safe APIs, and Zod for runtime
validation. The project structure follows a feature-based architecture where...

[30 more paragraphs]
```

### ✅ Good (ADHD-friendly)
```markdown
# My Project

A task management app.

```bash
npm install && npm run dev
```

<details>
<summary>Need more info?</summary>

## Tech Stack
- Next.js 14
- PostgreSQL + Prisma
- NextAuth

[More details...]
</details>
```
```

---

## Part 4: ADHD Playbooks (3 new playbooks)

### Playbook 1: Getting Unstuck

**File:** `PLAYBOOKS/adhd-getting-unstuck.md`

**Content:**
```markdown
# Getting Unstuck (ADHD Edition)

## Situation
You're stuck and frustrated. Could be:
- Can't start task (activation energy)
- Lost in details (hyperfocus on wrong thing)
- Don't know what to do next (decision paralysis)
- Feeling overwhelmed (too much at once)

## Playbook

### Step 1: STOP (1 min)
- [ ] Take 3 deep breaths
- [ ] Stand up and stretch
- [ ] Acknowledge you're stuck (no shame!)

### Step 2: IDENTIFY (2 min)
What kind of stuck?

**A) Can't Start**
→ Go to Section A

**B) Lost in Rabbit Hole**
→ Go to Section B

**C) Don't Know What Next**
→ Go to Section C

**D) Overwhelmed**
→ Go to Section D

---

## Section A: Can't Start (Activation Energy)

**Problem:** Task feels too big to start.

**Solution: Lower Activation Energy**

### Micro-Start (5 min)
Don't commit to finishing. Just start SOMETHING tiny.

```bash
# Instead of: "Build authentication system"
# Do this: "Create auth.ts file" (30 seconds)

touch src/auth.ts
code src/auth.ts

# Write ONE line of code
export function login() {}

# Done! You started. Dopamine! Now keep going or stop.
```

### Accountability Trick
Tell someone: "I'm going to work on X for 10 minutes."
- Tweet it
- Message a friend
- Tell Rubber Duck

**Why it works:** Social commitment = motivation.

---

## Section B: Lost in Rabbit Hole (Hyperfocus)

**Problem:** Spent 2 hours perfecting CSS instead of building feature.

**Solution: Redirect Hyperfocus**

### Reality Check (2 min)
```markdown
## Hyperfocus Checklist

Current task: [What you're actually doing]
Original goal: [What you should be doing]

Questions:
1. Is this task P0 for shipping? YES / NO
2. Will users care about this? YES / NO
3. Can this be done later? YES / NO

If 2+ "NO" answers: Stop and refocus.
```

### Refocus Technique
1. **Commit current work** (even if incomplete)
   ```bash
   git add . && git commit -m "WIP: CSS polish (pausing)"
   ```

2. **Write next step for later**
   ```markdown
   ## Resume CSS Polish Later
   - File: src/components/button.css
   - Line: 42
   - Next: Add hover animations
   - Priority: P2 (nice-to-have)
   ```

3. **Return to P0 task**
   ```bash
   cat .adhd/current-task.md  # What should I be doing?
   ```

---

## Section C: Don't Know What Next (Decision Paralysis)

**Problem:** Multiple tasks, can't decide which one.

**Solution: Decision Framework**

### Quick Decision Matrix (3 min)

List all tasks:
1. Task A
2. Task B
3. Task C

For each task:
- Urgency (1-5): How soon is deadline?
- Impact (1-5): How much does it matter?
- Energy (1-5): How much energy do I have now?

**Pick highest score = START THAT ONE**

Example:
```
Task: Fix login bug
- Urgency: 5 (blocking users)
- Impact: 5 (critical)
- Energy: 3 (you're tired)
= Score: 13

Task: Build admin dashboard
- Urgency: 2 (nice to have)
- Impact: 3 (some users)
- Energy: 4 (fun to build)
= Score: 9

→ Fix login bug first!
```

---

## Section D: Overwhelmed (Too Much At Once)

**Problem:** Everything feels urgent, drowning in tasks.

**Solution: Brain Dump + Triage**

### Brain Dump (5 min)
Write EVERYTHING down (get it out of your head):

```markdown
## Everything I Think I Should Do
- Fix bug in login
- Build admin dashboard
- Write documentation
- Reply to emails
- Clean up code
- Add tests
- Deploy to staging
- Learn new framework
- [... everything ...]
```

### Triage (10 min)
Sort into buckets:

```markdown
## Do Today (MAX 3 items)
- [ ] Fix bug in login
- [ ] Deploy to staging
- [ ] Reply to urgent email

## Do This Week
- [ ] Build admin dashboard
- [ ] Add tests
- [ ] Write documentation

## Someday/Maybe
- [ ] Learn new framework
- [ ] Clean up code
```

### Execute
**ONLY work on "Do Today" list.**
Ignore everything else (seriously).

---

## Emergency Escape Hatch

Still stuck after all this?

### Option 1: Change Tasks
Work on something else for 30 min, then return.

### Option 2: Rubber Duck
Explain problem out loud (to duck, plant, or friend).

### Option 3: Take Real Break
20-minute walk, no phone. Fresh perspective.

### Option 4: Ask for Help
Message teammate: "Hey, I'm stuck on X. Can you pair for 10 min?"

---

## Prevention

### Daily Prevention (5 min/day)
Morning:
- [ ] Check `.adhd/current-task.md`
- [ ] One task only for today
- [ ] Set up focus session

Evening:
- [ ] Save context
- [ ] Write tomorrow's ONE task
- [ ] Log wins

You got this! 💪
```

---

### Playbook 2: Resuming After Interruption

**File:** `PLAYBOOKS/adhd-resuming-work.md`

---

### Playbook 3: Finishing Projects Checklist

**File:** `PLAYBOOKS/adhd-finishing-projects.md`

---

## Part 5: Claude Code Integrations

### Integration 1: ADHD-Friendly .cursorrules

Add to project `.cursorrules`:

```markdown
## ADHD Support Mode

I have ADHD. Please help by:

1. **Task Breakdown**: Break all tasks into 15-minute micro-tasks
2. **Context Preservation**: Always save mental state before breaks
3. **Quick Wins First**: Prioritize easy wins for momentum
4. **Progress Visibility**: Show progress bars/checklists
5. **Gentle Reminders**: Remind me of original goal if I derail
6. **Dopamine Optimization**: Celebrate completed tasks
7. **Working Memory Aid**: Repeat context when I ask "where was I?"

Use these skills actively:
- task-breakdown-specialist
- focus-session-manager
- context-preserver
- completion-coach
```

### Integration 2: ADHD Hooks

Add to Claude Code settings:

```json
{
  "hooks": {
    "on_session_start": "Show current task from .adhd/current-task.md",
    "every_30_minutes": "Remind to take break and save context",
    "on_task_complete": "Log win to .adhd/wins.md and celebrate",
    "on_hyperfocus_detected": "Gentle health check reminder"
  }
}
```

---

## Implementation Priority

### Phase 1: MVP (Week 1) - Highest Impact
1. **task-breakdown-specialist skill** (2 days)
2. **context-preserver skill** (2 days)
3. **ADHD project structure pattern** (1 day)

### Phase 2: Core Tools (Week 2)
4. **adhd-task-breaker-mcp** (2 days)
5. **context-saver-mcp** (2 days)
6. **Getting Unstuck playbook** (1 day)

### Phase 3: Optimization (Week 3)
7. **focus-session-manager skill** (2 days)
8. **hyperfocus-guardian-mcp** (1 day)
9. **Resuming Work playbook** (1 day)
10. **Micro-commit workflow pattern** (1 day)

### Phase 4: Motivation & Completion (Week 4)
11. **completion-coach skill** (2 days)
12. **dopamine-tracker-mcp** (2 days)
13. **priority-decider-mcp** (1 day)
14. **Finishing Projects playbook** (1 day)

---

## Success Metrics

### Week 1
- [ ] Can break down tasks easily (no overwhelm)
- [ ] Can resume work after breaks < 5 min

### Week 2
- [ ] Context never lost (saved automatically)
- [ ] Reduced decision fatigue (clear next steps)

### Week 3
- [ ] Managing hyperfocus better (regular breaks)
- [ ] More completed micro-tasks (dopamine++)

### Week 4
- [ ] Finishing projects (not abandoning at 90%)
- [ ] Feeling in control (not overwhelmed)

---

## Quick Start (Meta!)

Want to start building these ADHD enhancements NOW?

### Fastest Path
1. Build task-breakdown-specialist skill (2 days)
2. Test it on a real project
3. Iterate based on what helps most
4. Build next most useful tool

### Questions to Answer First
1. Which ADHD challenge affects you most?
2. What would you use every day?
3. What's missing from this plan?

---

**This plan itself is ADHD-friendly!**
- Clear sections
- Actionable steps
- Progressive disclosure
- Priority-ordered

Let me know what to build first! 🚀
