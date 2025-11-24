# Claude Code Hooks

This directory contains hooks that enable skill auto-activation for ai-dev-standards.

---

## What's Here

### skill-activation-prompt.ts

TypeScript hook that analyzes user prompts and open files to automatically suggest relevant skills from the 64 available skills.

**How it works:**

1. Reads `.claude/skills/skill-rules.json`
2. Matches user prompt against `promptTriggers`
3. Matches open file paths against `fileTriggers.pathPatterns`
4. Returns top relevant skills for Claude to activate

### skill-activation-prompt.sh

Shell wrapper that executes the TypeScript hook. Claude Code calls this script.

### generate-skill-rules.cjs

Utility script to generate `skill-rules.json` from `META/skill-registry.json`.

**Usage:**

```bash
node generate-skill-rules.cjs
```

This regenerates the skill rules whenever skills are added or updated.

---

## Installation

### In This Repository

✅ Already installed and configured!

### In Your Project

When you run `setup-project.sh` from ai-dev-standards, hooks are automatically installed.

**Manual installation:**

```bash
# Copy hooks
cp -r path/to/ai-dev-standards/.claude/hooks your-project/.claude/

# Copy skill-rules.json
cp path/to/ai-dev-standards/.claude/skills/skill-rules.json your-project/.claude/skills/

# Copy settings.json
cp path/to/ai-dev-standards/.claude/settings.json your-project/.claude/

# Install dependencies
cd your-project/.claude/hooks
npm install

# Make executable
chmod +x your-project/.claude/hooks/skill-activation-prompt.sh
```

---

## Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Dependencies

- `typescript` - For compiling TypeScript hook
- `@types/node` - Node.js type definitions
- `tsx` - For executing TypeScript directly

Install with:

```bash
npm install
```

---

## Customization

### Adding New Triggers

Edit `.claude/hooks/generate-skill-rules.cjs`:

```javascript
const pathMappings = {
  'your-skill-name': ['**/your-directory/**/*', '**/*.your-extension']
  // ... existing mappings
}
```

Then regenerate:

```bash
node generate-skill-rules.cjs
```

### Manual skill-rules.json Editing

You can directly edit `.claude/skills/skill-rules.json`:

```json
{
  "skill-name": {
    "promptTriggers": ["new keyword", "another trigger"],
    "fileTriggers": {
      "pathPatterns": ["**/new-path/**/*"]
    }
  }
}
```

---

## Troubleshooting

### Hook Not Executing

Check permissions:

```bash
ls -la skill-activation-prompt.sh
# Should show rwxr-xr-x (executable)
```

Make executable if needed:

```bash
chmod +x skill-activation-prompt.sh
```

### TypeScript Errors

Compile check:

```bash
npx tsc --noEmit
```

### Dependencies Missing

Reinstall:

```bash
npm install
```

---

## Performance

**Typical execution:** < 50ms per prompt  
**Acceptable threshold:** < 200ms

If slower, consider:

- Reducing number of path patterns in skill-rules.json
- Simplifying promptTriggers

---

## Development

### Testing the Hook

Run directly:

```bash
./skill-activation-prompt.sh
```

### Debugging

Edit `skill-activation-prompt.ts` and set:

```typescript
const DEBUG = true
```

This logs activation decisions.

---

## Source

These hooks are adapted from [claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase) - a production-tested reference library with 6 months of validation.

---

## Related Documentation

- [DOCS/SKILL-AUTO-ACTIVATION.md](../../DOCS/SKILL-AUTO-ACTIVATION.md) - Complete guide
- [REPOSITORY-COMPARISON-ANALYSIS.md](../../REPOSITORY-COMPARISON-ANALYSIS.md) - Analysis and implementation plan

---

**Status:** ✅ Production Ready
