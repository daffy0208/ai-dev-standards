# Minimal .cursorrules Template

Copy this into your project root as `.cursorrules` for basic integration.

```markdown
# Project: [Your Project Name]

## AI Development Standards
Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**Load on every session:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/META/DECISION-FRAMEWORK.md

### Available Resources
This project has access to:
- **38 Skills** - Specialized development methodologies (see META/skill-registry.json)
- **35 MCPs** - Executable development tools (92% skill coverage)
- **9 Tools + 4 Scripts** - LangChain, CrewAI, custom utilities
- **13 Components** - Reusable React components and patterns
- **6 Integrations** - OpenAI, Anthropic, Supabase, Stripe, etc.

### Primary Skills
- mvp-builder
- frontend-builder
- api-designer
- deployment-advisor

### Tech Stack
- Frontend: [e.g., Next.js, React]
- Backend: [e.g., Node.js, Python]
- Database: [e.g., PostgreSQL, MongoDB]
- Deployment: [e.g., Vercel, Railway]

### Project Phase
- [x] Planning
- [ ] MVP Development
- [ ] Production
```

## How to Use

1. Copy content above
2. Create `.cursorrules` in your project root
3. Replace `[Your Project Name]` with your actual project name
4. Update Tech Stack section
5. Start working with Claude - it will automatically load the standards
