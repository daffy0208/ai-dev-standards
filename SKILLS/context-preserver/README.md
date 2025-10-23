# Context Preserver - Quick Start

**Version:** 1.0.0
**Category:** ADHD Support
**Difficulty:** Beginner

## What This Skill Does

Automatically saves and restores your development context every 15 minutes. Eliminates "where was I?" moments and reduces resume time from 30 minutes to under 5 minutes. Designed for ADHD developers with high context-switching costs.

## When to Use

**Always active!** This skill runs automatically in the background.

Specifically helps when:
- Taking breaks (lunch, bathroom, walk)
- Switching between projects
- Getting interrupted (meetings, urgent bugs)
- Starting/ending work day
- Losing focus and needing to reset

## Quick Start

**Zero setup required - it just works:**

```bash
# Morning: Resume work
./resume.sh

# During work: Auto-saves every 15 min (background)

# Before break: Optional manual save
./save-context.sh --break lunch

# After break: Resume
./resume.sh
```

**That's it! Everything else is automatic.**

## Key Features

### Automatic Saves (Every 15 Minutes)
- Current file + line number
- What you're working on
- What you just finished
- What's next
- Mental state notes
- WIP git commit

### One-Command Resume (< 5 Minutes)
- Opens exact file at exact line
- Shows mental state notes
- Starts dev server
- Displays next steps
- Restores context

### Interruption Protection
- Meeting in 15 min? Auto-save triggered
- Got interrupted? Context preserved
- Lost focus? Easy to reset

## What Gets Saved

```json
{
  "file": "src/components/login.tsx:42",
  "doing": "Adding API call to /auth/login",
  "just_finished": "Email validation",
  "next_steps": [
    "Add fetch call",
    "Handle errors",
    "Add loading state"
  ],
  "progress": "60% complete",
  "estimated_remaining": "45 minutes"
}
```

## Resume Time: < 5 Minutes

**Before (no context preservation):**
- 5 min: "What was I doing?"
- 10 min: Reading code to remember
- 5 min: Finding the right file
- 10 min: Remembering next steps
- **Total: 30 minutes lost**

**After (automatic context preservation):**
- 30 sec: Run ./resume.sh
- 1 min: Read context notes
- 2 min: Scan code quickly
- 1 min: Start coding
- **Total: < 5 minutes**

**25 minutes saved per interruption!**

## Automation Features

### Trigger 1: Every 15 Minutes (Background)
```
[Auto-save running...]
✅ Context saved
✅ WIP commit created
```

### Trigger 2: Before Meetings (Auto-Detect)
```
[Meeting in 15 min detected]
Auto-saving context...
✅ Safe to switch tasks
Resume: ./resume.sh
```

### Trigger 3: On Inactivity (10 min idle)
```
[No activity for 10 min]
Interruption detected!
Context preserved automatically
```

### Trigger 4: End of Day (5pm prompt)
```
[17:00] Wrapping up for the day?
- Save today's progress ✅
- Note tomorrow's first task ✅
- Log wins ✅
```

## The 3-Question Method

Every 30 minutes, Claude asks (takes 1 minute):

```
1. What are you working on right now?
   > Adding password reset

2. What's the next small step?
   > Test email delivery

3. Any blockers?
   > Need SendGrid API key
```

**Why:** Helps future you resume quickly

## Context Files

Your project will have:

```
.adhd/
├── context.json          # Current context (auto-updated)
├── context-history/      # Past contexts (timestamped)
├── resume.sh            # One-command resume
└── save-context.sh      # Manual save
```

## Common Scenarios

### Scenario 1: Lunch Break
```bash
# Before lunch
./save-context.sh --break lunch

# After lunch (30 min later)
./resume.sh

# Output:
✅ Opened: src/auth/reset.ts:67
💭 You were: Testing email delivery
🎯 Next: Add error handling (15 min)
⏱️ Resume time: 4 minutes
```

### Scenario 2: Urgent Production Bug
```
You: "Production bug, need to switch NOW"

Claude: Let me save your auth work first.
✅ Saved context
✅ Stashed changes
✅ Ready for bug fix

After bug: ./resume-auth-work.sh
```

### Scenario 3: Lost Focus (ADHD Wander)
```
[Browsing docs for 20 min]

💭 Gentle reminder:
You were working on: Password reset form
Next step: Add email input (5 min)

[Resume Coding] [Take Break]
```

## Git Integration

### Automatic WIP Commits
```bash
# Every 15 min:
git commit -m "WIP: Adding API call [15:30]"

# Before break:
git commit -m "PAUSE: About to add error handling [16:00]"
```

### Resume from History
```bash
git log -1 --pretty=%B
# Shows: What you were doing last
```

## Success Metrics

You're using this well when:
- ✅ Resume time < 5 minutes (was 30 min)
- ✅ Never lose your place
- ✅ Take breaks without anxiety
- ✅ Easy project switching
- ✅ Context saves automatically (you don't think about it)

## Tips

### Take More Breaks
Now that resume is easy (5 min), you can take breaks without fear:
- Bathroom breaks
- Water breaks
- Stretch breaks
- Walking breaks

**Before:** Avoided breaks (resume too painful)
**After:** Take breaks freely (quick resume)

### Share Context
```bash
./export-context.sh
# Generates: context-snapshot.md
# Share with teammate for pairing
```

### Browse History
```bash
./context-history.sh
# See past work sessions
# Restore old context if needed
```

## Related Skills

- **task-breakdown-specialist** - Auto-breaks down next steps
- **focus-session-manager** - Manages breaks automatically
- **adhd-workflow-architect** - Designs zero-friction workflows

## Version History

- **1.0.0** (2025-10-22): Initial release with full automation

## License

Part of ai-dev-standards repository.
