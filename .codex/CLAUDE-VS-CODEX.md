# Claude Code vs Codex CLI

Claude Code has been the default environment for ai-dev-standards, but Codex can now access the same brain-first workflow. Use this guide to pick the right tool for each task.

---

## TL;DR

| Scenario | Recommended Tool |
|----------|------------------|
| You want a desktop IDE with inline file edits | Claude Code |
| You prefer terminal-first workflows or automation | Codex CLI |
| You need automated reviews or CI integration | Codex CLI |
| You rely on Claude’s inline planning prompts | Claude Code |
| You want to script brain queries in shell | Codex CLI |

---

## Feature Comparison

| Capability | Claude Code | Codex CLI |
|------------|-------------|-----------|
| Brain MCP access | ✅ Auto-connected | ✅ After `setup-codex-cli.sh` |
| Skill recommendations | ✅ Inline suggestions | ✅ `codex exec "Use brain_select_skills …"` |
| File editing | ✅ Rich editor | ⚠️ Not built-in (use your editor) |
| Automated code review | ⚠️ Manual prompt | ✅ `scripts/ci/codex-review.sh` |
| CI/CD integration | ⚠️ Indirect | ✅ `codex exec` commands inside pipelines |
| Terminal automation | ⚠️ Limited | ✅ Any shell script |
| Multi-step plans | ✅ Autonomy + tools | ✅ Use scripted brain queries |

---

## Switching Between Them

1. Run the same brain queries in both environments:
   - Claude Code: “Use brain_search with keyword rag”
   - Codex: `codex exec "Use brain_search with keyword 'rag'"`

2. Keep project instructions synced:
   - `.claude/claude.md` → Claude reference
   - `.codex/codex.md` → Codex reference (auto-generated)

3. Share MCP configurations:
   - `.claude/mcp-settings.json`
   - `.codex/mcp-settings.json`

---

## When Codex Shines

- **Automation:** integrate brain queries into scripts, Git hooks, or CI
- **Reviews:** use Codex CLI for iterative code review, as documented in `SKILLS/codex-review-workflow`
- **Ops Tasks:** run MCP-powered tooling (e.g., `test-runner-mcp`) straight from the shell
- **Context-light Work:** when you just need a quick answer without opening an IDE

---

## Hybrid Workflow

1. Start in Codex to plan the work:
   ```bash
   codex exec "Use brain_select_skills with taskDescription 'implement subscription billing'"
   ```
2. Move to Claude Code for heavy code editing and inline suggestions.
3. Return to Codex for automated review:
   ```bash
   ./scripts/ci/codex-review.sh src/billing.ts
   ```

---

## Tips

- Export the same environment variables (`AI_DEV_STANDARDS_ROOT`, API keys) in both shells.
- Keep both `.claude/` and `.codex/` directories under version control so updates stay in sync.
- Use `codex exec "Use brain_status"` periodically to ensure the brain is responsive from Codex.

---

With these conventions, Claude Code and Codex become complementary interfaces to the same ai-dev-standards brain. Choose whichever suits your current task. 🚀
