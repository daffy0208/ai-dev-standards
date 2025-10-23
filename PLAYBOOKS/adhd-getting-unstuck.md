# Getting Unstuck (ADHD Edition)

**Use when:** Feeling stuck, overwhelmed, or can't start a task

---

## Quick Diagnosis (30 seconds)

**What type of stuck are you?**

- **A) Can't Start** - Task feels too big, don't know where to begin
- **B) Lost in Rabbit Hole** - Been working 2 hours, made no real progress
- **C) Don't Know What Next** - Multiple tasks, can't decide which
- **D) Overwhelmed** - Everything feels urgent, drowning in work

→ Jump to your section below

---

## Section A: Can't Start (Activation Energy)

**Problem:** Task feels too big, overwhelming, don't want to start.

### 5-Minute Fix

**Step 1: Make it ridiculously small** (1 min)
```
Instead of: "Build authentication system"
Do this: "Create auth.ts file"

Time: 30 seconds
Difficulty: Trivial
```

**Step 2: Just do that ONE thing** (30 sec)
```bash
touch src/auth.ts
code src/auth.ts
```

**Step 3: Celebrate!** (10 sec)
```
✅ You started!
Dopamine hit!
```

**Step 4: What's next tiny thing?** (1 min)
```
Next: "Add one import statement"
Time: 10 seconds
```

**Step 5: Keep going**
Momentum established. Each tiny win makes next one easier.

### Why This Works
- Zero activation energy (30 sec task)
- Immediate dopamine (quick win)
- Momentum builds naturally
- No overwhelm

### Alternative: The 2-Minute Rule
"I'll just work for 2 minutes"
- Set timer: 2 minutes
- Start working
- When timer ends: Usually want to continue
- If not: At least 2 min progress made

---

## Section B: Lost in Rabbit Hole (Hyperfocus)

**Problem:** Spent 2 hours on CSS, haven't shipped actual feature.

### Reality Check (5 min)

**Answer honestly:**

1. Is this task P0 for shipping?
   - YES: Continue (but set time limit)
   - NO: Stop now, come back later

2. Will users notice/care about this?
   - YES: Finish minimal version
   - NO: Move on

3. Could this be "good enough" now?
   - YES: Commit and move on
   - NO: Why not? Be specific

**If 2+ "NO" answers → You're in a rabbit hole!**

### Escape Plan (10 min)

**Step 1: Commit current work**
```bash
git add .
git commit -m "WIP: CSS polish (pausing to focus on P0)"
```

**Step 2: Write "finish later" note**
```markdown
## Resume CSS Polish Later
- File: src/components/button.css:42
- Next: Add hover animations
- Priority: P2 (nice-to-have)
- Time budget: 30 min max
```

**Step 3: Check original goal**
```bash
cat .adhd/current-task.md
# What SHOULD you be doing?
```

**Step 4: Return to P0 task**
The thing you were actually supposed to build.

### Prevention

Set time budgets BEFORE starting:
```
CSS polish: 30 min max
If not done → good enough, move on
```

---

## Section C: Don't Know What Next (Decision Paralysis)

**Problem:** 5 things to do, can't pick one, doing nothing instead.

### Decision Framework (5 min)

**Step 1: Brain dump** (2 min)
Write ALL tasks:
```
- Fix login bug
- Build dashboard
- Write tests
- Reply emails
- Update docs
```

**Step 2: Score each task** (2 min)

For each task, rate 1-5:
- Urgency: How soon needed?
- Impact: How much does it matter?
- Energy: Do I have energy for this now?

Example:
```
Fix login bug:      U:5, I:5, E:3 = 13
Build dashboard:    U:2, I:3, E:4 = 9
Write tests:        U:3, I:4, E:2 = 9
Reply emails:       U:4, I:2, E:5 = 11
Update docs:        U:1, I:2, E:5 = 8
```

**Step 3: Pick highest score** (10 sec)
```
→ Fix login bug (score: 13)
START THIS NOW
```

**Step 4: Hide everything else** (30 sec)
Close tabs, hide task list, focus on ONE thing.

### Auto-Decide Mode

Too exhausted to decide?

**Pick the 2-minute task**
- Smallest task wins
- Quick dopamine hit
- Builds momentum

---

## Section D: Overwhelmed (Too Much At Once)

**Problem:** Everything feels urgent, drowning, can't breathe.

### Emergency Protocol (10 min)

**Step 1: STOP** (1 min)
- Close laptop
- Stand up
- Take 3 deep breaths
- You're okay

**Step 2: Brain dump** (5 min)
Write EVERYTHING that's stressing you:
```
- Login bug blocking users
- Boss wants dashboard by Friday
- 47 unread emails
- Forgot to call mom
- Need to pay rent
- Should work out
- [... EVERYTHING ...]
```

**Step 3: Triage buckets** (3 min)

**Today (MAX 3 things):**
```
- Fix login bug
- Call mom
- Pay rent
```

**This Week:**
```
- Build dashboard
- Reply important emails
```

**Later/Maybe:**
```
- Workout
- Clean code
- Learn new thing
```

**Step 4: Do ONLY "Today" list** (1 min)
Everything else doesn't exist right now.

**Step 5: Start with easiest** (Now!)
```
Call mom (5 min)
→ Quick win
→ Momentum
→ Then tackle harder stuff
```

### Why This Works
- Gets thoughts out of head (working memory freed)
- Creates manageable scope (not infinite)
- Priority becomes clear (not everything matters equally)
- First win builds confidence (momentum)

---

## Emergency Escape Hatches

**Still stuck after trying above?**

### Option 1: Change Tasks
Work on ANYTHING else for 30 min.
- Different task
- Easy task
- Fun task

Then return to stuck task with fresh perspective.

### Option 2: Rubber Duck
Explain problem out loud:
- To rubber duck
- To plant
- To yourself
- To friend/colleague

70% of time, explaining solves it.

### Option 3: Take Real Break
- 20-minute walk
- No phone
- Outside if possible
- Let brain rest

Come back with fresh energy.

### Option 4: Ask for Help
Message someone:
```
"Hey, I'm stuck on X. Can you pair for 10 min?"
```

Often just asking makes solution appear.
If not, pairing helps.

### Option 5: Ship What You Have
Maybe you're not stuck, maybe you're done?
```
What's the MINIMUM to ship?
Can you ship that NOW?
Polish later.
```

---

## Prevention Strategies

**To avoid getting stuck:**

### Morning
- [ ] Check .adhd/current-task.md (know what to do)
- [ ] Pick ONE task for today (not five)
- [ ] Start with 2-minute quick win (build momentum)

### During Work
- [ ] Auto-save context every 15 min (never lose place)
- [ ] Set time limits on tasks (prevent rabbit holes)
- [ ] Take breaks every 45 min (prevent exhaustion)

### Evening
- [ ] Write tomorrow's first task (easy start)
- [ ] Log wins (dopamine, motivation)
- [ ] Save context (easy resume)

---

## Mantras for Getting Unstuck

**When can't start:**
> "I'll just do 2 minutes. That's nothing."

**When in rabbit hole:**
> "Good enough to ship. Perfect is the enemy of done."

**When deciding:**
> "Pick the highest impact thing. Everything else can wait."

**When overwhelmed:**
> "I can only do one thing at a time. This one thing, right now."

**When stuck generally:**
> "Being stuck is temporary. I will get unstuck. I always do."

---

## Success Metrics

You're managing stuck-ness well when:
- ✅ Get unstuck in < 15 minutes
- ✅ Start tasks easily (low activation energy)
- ✅ Avoid rabbit holes (time-boxed tasks)
- ✅ Make decisions quickly (framework helps)
- ✅ Rarely feel overwhelmed (good triage)

---

**You're not lazy. You're not broken. You just need the right system.** 💪

**Getting stuck is normal. Getting unstuck is a skill. You're learning it.**
