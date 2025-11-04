# File Tracking & Context Retention Guide

## Overview

Phase 4 of the claude-code-infrastructure-showcase integration provides **automatic context retention across Claude sessions**. This means Claude can remember what you were working on, even days or weeks later, providing seamless continuity.

## Key Features

✅ **Automatic File Tracking** - Monitors all file modifications, additions, and deletions  
✅ **Session Management** - Tracks multiple work sessions with full context  
✅ **"Where You Left Off"** - Automatic summaries when resuming work  
✅ **Skill Suggestions** - Recommends relevant skills based on your recent files  
✅ **Privacy-First** - All data stored locally, never transmitted  
✅ **Zero Configuration** - Works automatically after setup  

## How It Works

### Automatic Tracking

File tracking happens automatically through two hooks:

1. **file-tracker.ts** (PostToolUse hook)
   - Runs after every tool execution
   - Captures file modifications using git status
   - Records timestamps, file paths, and change types
   - Updates active session context
   - < 10ms overhead per execution

2. **context-restore.ts** (UserPromptSubmit hook)
   - Runs when you start a conversation
   - Checks if context restoration is needed
   - Shows "Where you left off" summary
   - Suggests skills based on recent activity
   - < 20ms overhead per execution

### Context Data Structure

```
.claude/context/
├── active-session.json       # Current session state
├── files/                    # File change history
│   ├── abc123-1730746800.json
│   └── def456-1730746900.json
└── sessions/                 # Completed session history
    ├── session-1730746800000.json
    └── session-1730833200000.json
```

## Usage

### Viewing Current Context

```bash
# Show current session details
ai-dev context show
```

**Output:**
```
📍 Current Session Context

Session ID: session-1730746800000
Started: 2 hours ago (2025-11-04 12:00:00)
Duration: 2h 30m
Activity: 12 prompts, 8 file changes

📂 Modified Files (Last 5):
  1. backend/auth.ts (5 minutes ago) - modified
  2. backend/middleware/jwt.ts (10 minutes ago) - modified  
  3. tests/auth.test.ts (15 minutes ago) - added
  4. backend/types/user.ts (30 minutes ago) - modified
  5. config/jwt.config.ts (1 hour ago) - added

🎯 Active Skills:
  • security-engineer
  • api-designer
  • testing-strategist

🤖 Agents Used:
  • code-architecture-reviewer

📊 Statistics:
  • Total files tracked: 23
  • Average session: 1h 45m
```

### Viewing Session History

```bash
# Show recent sessions
ai-dev context history

# Show more sessions
ai-dev context history --limit 20
```

**Output:**
```
📜 Recent Sessions (Last 5):

1. Session session-1730833200000
   Started: Nov 4, 2025, 9:00 AM
   Duration: 2h 15m
   Activity: 15 prompts, 12 files modified
   Skills: security-engineer, api-designer, testing-strategist
   Summary: Implemented JWT authentication with middleware

2. Session session-1730746800000
   Started: Nov 3, 2025, 3:00 PM
   Duration: 3h 30m
   Activity: 24 prompts, 18 files modified
   Skills: rag-implementer, vector-database-architect
   Summary: Built RAG system with vector database integration
```

### Cleaning Old Context

```bash
# Clear data older than 30 days (default)
ai-dev context clear

# Clear data older than 7 days
ai-dev context clear --older-than 7
```

**Output:**
```
🗑️  Clearing context data older than 30 days...

✓ Cleared 45 file change records
✓ Cleared 8 old sessions
```

### Restoring a Previous Session

```bash
# Restore a specific session
ai-dev context restore --session-id session-1730746800000
```

**Output:**
```
✓ Restored session session-1730746800000 as new active session

   Skills: security-engineer, api-designer, testing-strategist
   Files: 18 files tracked
```

### Context Statistics

```bash
# View storage and usage stats
ai-dev context stats
```

**Output:**
```
📊 Context Statistics

File change records: 156
Completed sessions: 12
Active session: Yes
Total storage: 1.24 MB
```

## Real-World Examples

### Example 1: Resuming After Weekend

**Friday afternoon:**
```
User: "Help me implement authentication"
- Modified: backend/auth.ts, backend/middleware/jwt.ts
- Skills used: security-engineer, api-designer
- Session ends: 5:30 PM
```

**Monday morning:**
```
User: "Hey Claude"

📍 Where you left off:
  Last active: 3 days ago
  
  📂 Recent files:
    • backend/auth.ts (3 days ago)
    • backend/middleware/jwt.ts (3 days ago)
  
  🎯 Skills used:
    • security-engineer
    • api-designer
  
  📊 Activity: 12 prompts, 8 file changes
  
  💡 Suggested: Continue with authentication implementation?

User: "Yes, let's add token refresh"
→ Claude continues seamlessly with full context
```

### Example 2: Multi-Day Feature Development

**Day 1: Setup**
```
- Files: config/vector-db.ts, services/embedder.ts
- Skills: rag-implementer, database-architect
- Summary: "Set up vector database configuration"
```

**Day 2: Implementation**
```
- Files: api/search.ts, services/retriever.ts
- Skills: rag-implementer, api-designer
- Summary: "Implemented semantic search API"
```

**Day 3: Testing**
```
- Files: tests/rag.test.ts, tests/integration/search.test.ts
- Skills: testing-strategist, rag-implementer
- Summary: "Added comprehensive test coverage"
```

**Viewing progress:**
```bash
$ ai-dev context history

Shows complete timeline of RAG implementation:
- Day 1: Database setup
- Day 2: API implementation  
- Day 3: Testing added

Full context available for any day
```

### Example 3: Context-Aware Skill Suggestions

**Scenario: User modifies authentication files**

Files changed:
- `backend/auth/jwt.ts`
- `backend/middleware/verify-token.ts`
- `config/auth.config.ts`

Context-restore analyzes patterns and suggests:
```
🎯 Recommended skills based on recent activity:
  • security-engineer (auth files detected)
  • api-designer (middleware patterns)
  • testing-strategist (add auth tests?)
  
💡 Also consider:
  • code-architecture-reviewer (review auth architecture)
  • auto-error-resolver (common auth errors)
```

## Integration with Other Phases

### Phase 1: Skill Auto-Activation

File tracking enhances skill activation by providing historical context:

```javascript
// Without context: Generic prompt
User: "Help me with authentication"
→ security-engineer (keyword match)

// With context: Precise activation
User: "Help me with authentication"  
→ Sees recent auth files: backend/auth.ts, middleware/jwt.ts
→ security-engineer + api-designer + testing-strategist
→ All relevant skills activated based on context
```

### Phase 3: Specialized Agents

Context tracking records agent usage:

```javascript
Session context:
{
  agentsUsed: [
    "code-architecture-reviewer",
    "registry-validator-agent"
  ]
}

Next session:
→ "You used code-architecture-reviewer last time"
→ "Would you like to review the new changes?"
```

### Optimization

Context enables smarter resource selection:

```javascript
// Historical pattern detected
Sessions show: Always use vector-database-mcp with rag-implementer
Context suggests: "Activate vector-database-mcp?"
User: "Yes"
→ Consistent workflow maintained automatically
```

## Configuration

### Auto-Installation

Context tracking is automatically installed by `setup-project.sh`:

```bash
$ bash /path/to/ai-dev-standards/setup-project.sh

Output includes:
✅ Context tracking hooks installed
✅ .claude/context/ directory created  
✅ Session management initialized
```

### Manual Installation

If needed, install manually:

```bash
# 1. Copy hooks
cp -r ai-dev-standards/.claude/hooks/ .claude/

# 2. Install dependencies
cd .claude/hooks && npm install

# 3. Make scripts executable
chmod +x .claude/hooks/*.sh

# 4. Update .claude/settings.json
# Add PostToolUse and UserPromptSubmit hooks

# 5. Create context directory
mkdir -p .claude/context/{files,sessions}

# 6. Initialize active session
echo '{"sessionId":"session-'$(date +%s%3N)'","startTime":"'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'","lastActivity":"'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'","modifiedFiles":[],"activeSkills":[],"agentsUsed":[],"promptCount":0,"fileChangeCount":0}' > .claude/context/active-session.json
```

### Hook Configuration

In `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/context-restore.sh"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/file-tracker.sh"
          }
        ]
      }
    ]
  }
}
```

## Privacy & Security

### Local Storage Only

✅ All context data stored in `.claude/context/`  
✅ Excluded from git via `.gitignore`  
✅ Never transmitted to external services  
✅ You control all data retention  

### Data Retention

- **Active session**: Until manually cleared or 30 days of inactivity
- **Session history**: Last 10 sessions
- **File changes**: 30 days (auto-cleanup)

### Manual Control

```bash
# Clear all context
rm -rf .claude/context/

# Clear just history
rm -rf .claude/context/sessions/

# Clear just file changes
rm -rf .claude/context/files/

# Reset active session
rm .claude/context/active-session.json
```

## Performance

### Overhead

- **File tracking**: < 10ms per tool execution
- **Context restore**: < 20ms per prompt
- **Storage**: ~1-2MB per 30 days

### Optimization

Context tracking is optimized to:
- Only track actual file changes (not every tool call)
- Run cleanup occasionally (10% probability)
- Keep only last 50 file changes per session
- Auto-delete old records after 30 days

## Troubleshooting

### Context Not Showing

**Issue**: "Where you left off" doesn't appear

**Solutions**:
1. Check if session is recent (< 30 mins): Context only shows for stale sessions
2. Verify hooks installed: `ls -la .claude/hooks/`
3. Check `.claude/settings.json` has hooks configured
4. Run: `ai-dev context show` to verify session exists

### File Changes Not Tracked

**Issue**: Files modified but not in context

**Solutions**:
1. Ensure git repository initialized: `git status`
2. Check hook is executable: `chmod +x .claude/hooks/file-tracker.sh`
3. Verify hook dependencies: `cd .claude/hooks && npm install`
4. Test hook manually: `.claude/hooks/file-tracker.sh`

### Old Sessions Not Clearing

**Issue**: Too much context data accumulated

**Solutions**:
```bash
# Manual cleanup
ai-dev context clear --older-than 7

# Check storage
ai-dev context stats

# Force cleanup
rm -rf .claude/context/sessions/*.json
rm -rf .claude/context/files/*.json
```

### Hook Errors

**Issue**: Hooks throwing errors

**Solutions**:
1. Check Node.js version: `node --version` (need >=18)
2. Reinstall dependencies: `cd .claude/hooks && rm -rf node_modules && npm install`
3. Check TypeScript: `npx tsx --version`
4. View errors: Check Claude's output for hook error messages

## Best Practices

### 1. Regular Cleanup

```bash
# Weekly: Clear old sessions
ai-dev context clear --older-than 7

# Monthly: Check storage
ai-dev context stats
```

### 2. Review Context Regularly

```bash
# Before starting work
ai-dev context show

# After major milestones
ai-dev context history
```

### 3. Use with AI Workflows

```
1. Start session → Context restored automatically
2. Work on files → Changes tracked automatically
3. Use skills/agents → Usage recorded automatically
4. End session → Context saved automatically
5. Next session → Full context available
```

### 4. Leverage History

```bash
# Review past work
ai-dev context history --limit 30

# Learn patterns
"Which skills do I use most?"
"What files do I modify frequently?"

# Optimize workflow
Identify common skill combinations
Recognize project patterns
```

## Advanced Usage

### Custom Context Queries

You can programmatically query context data:

```javascript
const fs = require('fs');
const session = JSON.parse(
  fs.readFileSync('.claude/context/active-session.json', 'utf-8')
);

// Get files modified in last hour
const recentFiles = session.modifiedFiles.filter(file => {
  const fileTime = new Date(file.timestamp).getTime();
  const hourAgo = Date.now() - 3600000;
  return fileTime > hourAgo;
});

console.log('Recent files:', recentFiles.map(f => f.path));
```

### Session Snapshots

Create session snapshots for important milestones:

```bash
# Save current session
cp .claude/context/active-session.json backups/milestone-v1.json

# Restore later
ai-dev context restore --session-id milestone-v1
```

### Integration with CI/CD

Context can help with automated workflows:

```yaml
# .github/workflows/context-analysis.yml
name: Analyze Development Patterns
on: [push]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Get context stats
        run: ai-dev context stats
      - name: Identify common patterns
        run: ai-dev context history --limit 100
```

## Future Enhancements

Planned improvements for file tracking:

- 🔄 Cross-project context sharing
- 📊 Visual timeline of sessions
- 🤖 ML-based skill prediction
- 🔗 Integration with git branches
- 📈 Productivity analytics
- 🎯 Smart break reminders

## Summary

Phase 4 file tracking provides:

✅ **Seamless continuity** across Claude sessions  
✅ **"Where you left off"** summaries automatically  
✅ **Intelligent suggestions** based on context  
✅ **Zero configuration** after setup  
✅ **Privacy-first** with local storage only  
✅ **High performance** with minimal overhead  

This completes the 4-phase integration of claude-code-infrastructure-showcase, giving you production-tested patterns for skill auto-activation, modular skills, specialized agents, and now context retention.

## Next Steps

1. **Start using it**: Context tracking works automatically
2. **Check context**: Run `ai-dev context show` regularly
3. **Review history**: Use `ai-dev context history` to see progress
4. **Clean up**: Run `ai-dev context clear` monthly
5. **Optimize**: Learn your patterns and adjust workflows

For more information:
- [Skill Auto-Activation Guide](./SKILL-AUTO-ACTIVATION.md)
- [Agents Guide](./AGENTS-GUIDE.md)
- [Installation & Updates](./INSTALLATION-AND-UPDATES.md)
