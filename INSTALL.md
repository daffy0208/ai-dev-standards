# Install ai-dev-standards

> **📢 DEPRECATED:** This file is maintained for backward compatibility. 
> 
> **Please use:** [INTEGRATION-USAGE.md](INTEGRATION-USAGE.md) for complete integration documentation.
>
> The new guide consolidates INSTALL.md, UPDATE-GUIDE.md, and AUTO-SYNC-GUIDE.md into a single, comprehensive resource with update checking and troubleshooting.

---

## One Command. Any Project.

```bash
cd /your/project
bash ~/ai-dev-standards/setup-project.sh
```

**That's it.**

---

## What It Does Automatically

1. Figures out your project type (Next.js, React, Python, empty, etc.)
2. Installs everything needed
3. Gives you 121 resources (skills, tools, components)
4. Analyzes your repository
5. Tells you exactly where to start

**No configuration. No options. No choices.**

---

## What You Get

```
✓ <!-- AUTO-GEN:START:skills -->64<!-- AUTO-GEN:END:skills --> Skills - Specialized methodologies
✓ 48 MCPs - Automation tools
✓ 9 Tools + 4 Scripts
✓ 13 Components
✓ 6 Integrations

= 121 Total Resources
```

Plus:
- Project health score
- Customized recommendations
- Priority tasks
- Quick wins
- Which skills to use

---

## Examples

### Brand New Project
```bash
git clone git@github.com:you/new-repo.git
cd new-repo
bash ~/ai-dev-standards/setup-project.sh
```

### Existing Project
```bash
cd ~/my-existing-app
bash ~/ai-dev-standards/setup-project.sh
```

### Empty Directory
```bash
mkdir my-new-app
cd my-new-app
git init
bash ~/ai-dev-standards/setup-project.sh
```

**Same command. Works everywhere.**

---

## Then Ask Claude

After setup, you'll see recommendations like:

```
Recommended Skills:
  • mvp-builder - For rapid development
  • testing-strategist - Set up tests
  • frontend-builder - Structure your app
```

Then just ask Claude:

```
"Use mvp-builder to help me start this project.
The analysis recommended focusing on [the priority tasks shown]."
```

Claude will know exactly what to do.

### Prefer Codex or Gemini?

Run the dedicated setup scripts once per machine:

```bash
# Connect Codex CLI to the brain
./setup-codex-cli.sh

# Or configure Gemini CLI
./setup-gemini-cli.sh
```

Each script adds `brain-mcp` to the respective CLI and populates `.codex/` or `.gemini/` with quick-start guides and configuration you can copy into your home directory.

Want to confirm everything works later? Run `node scripts/tests/brain-mcp-smoke.cjs` to verify the Brain CLI can execute even on systems without `/bin/bash`.

---

## Post-Setup: Build brain-mcp

**Important:** After first-time setup, you need to build the brain-mcp MCP server:

```bash
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install
npm run build
```

This creates the `dist/index.js` file that Claude uses for intelligent skill recommendations.

**You only need to do this once** (or when brain-mcp is updated). The setup script configures everything to point to this location automatically.

---

## Troubleshooting

**"bash: setup-project.sh: command not found"**

First time? Clone ai-dev-standards:
```bash
cd ~
git clone https://github.com/daffy0208/ai-dev-standards.git
cd /your/project
bash ~/ai-dev-standards/setup-project.sh
```

**"Command not found: ai-dev"**

The script installs it automatically. If it fails:
```bash
cd ~/ai-dev-standards/CLI
npm install
npm link
```

**"brain-mcp not working in Claude"**

Build the brain-mcp MCP server:
```bash
cd ~/ai-dev-standards/MCP-SERVERS/brain-mcp
npm install
npm run build
```

Then restart Claude to pick up the changes.

---

## That's It

One command.
Two minutes.
Everything set up.

No configuration needed. The tool figures it all out.

🚀
