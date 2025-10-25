# Install ai-dev-standards

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
3. Gives you 105 resources (skills, tools, components)
4. Analyzes your repository
5. Tells you exactly where to start

**No configuration. No options. No choices.**

---

## What You Get

```
✓ 38 Skills - Specialized methodologies
✓ 35 MCPs - Automation tools
✓ 9 Tools + 4 Scripts
✓ 13 Components
✓ 6 Integrations

= 105 Total Resources
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

---

## That's It

One command.
Two minutes.
Everything set up.

No configuration needed. The tool figures it all out.

🚀
