# Codex CLI Quick Start Guide

Get the ai-dev-standards brain running in Codex in just a few minutes.

---

## Prerequisites

- ✅ Codex CLI installed: `npm install -g @anthropics/codex-cli`
- ✅ `CODEX_API_KEY` exported in your shell
- ✅ `brain-mcp` build complete (`npm run build` in `mcp-servers/brain-mcp`)

---

## 1. Setup (First Time Only)

```bash
# From the repo root
./setup-codex-cli.sh
```

The script:

- Adds `brain-mcp` to Codex (via `codex mcp add`)
- Creates/updates `~/.codex/mcp-servers.json`
- Writes repository-local helpers to `.codex/`
- Runs a quick sanity check

**Manual alternative:**

```bash
codex mcp add brain-mcp node ./mcp-servers/brain-mcp/dist/index.js
```

Verify:

```bash
codex mcp list
# Look for: ✓ brain-mcp ... Connected
```

---

## 2. Run Your First Brain Query

```bash
codex exec "Use brain_search with keyword 'rag'"
```

Or start an interactive shell:

```bash
codex chat
# Then, at the Codex prompt:
> Use brain_search with keyword "rag"
```

Expected skills:

- `rag-implementer`
- `knowledge-base-manager`
- `vector-database-mcp`

---

## 3. Common Workflows

| Task                         | Codex Command                                                           |
| ---------------------------- | ----------------------------------------------------------------------- |
| Discover skills for a domain | `codex exec "Use graph_query_by_domain with domain 'frontend'"`         |
| Inspect a skill              | `codex exec "Use brain_show_skill with skill 'frontend-builder'"`       |
| Check dependencies           | `codex exec "Use graph_get_dependencies for skill 'security-engineer'"` |
| Find compatible skills       | `codex exec "Use graph_composition_chains for 'SaaS launch'"`           |
| Check system health          | `codex exec "Use brain_status"`                                         |

---

## 4. Putting It All Together

An end-to-end loop you can drop into any project:

```bash
# 1. Discover relevant guidance
codex exec "Use brain_search with keyword 'checkout flow'"

# 2. Inspect dependencies before coding
codex exec "Use graph_get_dependencies for skill 'frontend-builder'"

# 3. Implement the feature (switch to your editor)

# 4. Run automated Codex review
./scripts/ci/codex-review.sh src/pages/checkout.tsx

# 5. Re-run targeted follow-up
codex exec "Review the updated src/pages/checkout.tsx. Confirm the earlier issues are fixed."
```

This mirrors the Claude workflow while keeping everything in your terminal.

---

## 5. Interactive vs One-Shot

- **Interactive mode:** `codex chat` → keep context, ask follow-ups, iterate quickly
- **One-shot mode:** `codex exec "<instruction>"` → perfect for scripts or single questions

Try this interactive session:

```
> Use brain_search with keyword "authentication"
> Show dependencies for security-engineer
> Summarise the recommended skills
```

---

## 6. Troubleshooting

| Symptom                    | Fix                                     |
| -------------------------- | --------------------------------------- |
| `codex: command not found` | Reinstall CLI globally                  |
| `401 Unauthorized`         | Check `CODEX_API_KEY` is set            |
| MCP not connecting         | Ensure `brain-mcp/dist/index.js` exists |
| Long-running requests      | Add `--timeout 60000` to `codex exec`   |

---

## 7. Next Steps

1. Read the detailed guide: `.codex/README.md`
2. Compare flows: `.codex/CLAUDE-VS-CODEX.md`
3. Explore skills in `meta/skill-registry.json`
4. Automate reviews via `scripts/ci/codex-review.sh`

---

## Quick Health Check

Run the local smoke test whenever you want to confirm the Brain CLI is reachable (even on systems without `/bin/bash`):

```bash
node scripts/tests/brain-mcp-smoke.cjs
```

If it fails, rebuild the brain CLI with `./setup-codex-cli.sh` (which runs `npm install`/`npm run build` under `scripts/brain`).

---

You’re ready to work the brain-first way inside Codex! 🚀
