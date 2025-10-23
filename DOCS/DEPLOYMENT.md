# Deployment & Publishing Guide

How to deploy and publish the AI Dev Standards CLI and bootstrap system.

---

## Overview

The AI Dev Standards system consists of:

1. **Main Repository** - Skills, patterns, templates, and standards
2. **CLI Tool** (`@ai-dev-standards/cli`) - Command-line interface
3. **Bootstrap Package** (`@ai-dev-standards/bootstrap`) - Auto-installer
4. **MCP Servers** - Individual MCP server packages

---

## Prerequisites

- npm account with publishing access
- GitHub repository set up
- Node.js 18+ installed

---

## Publishing the CLI

### 1. Update Version

```bash
cd CLI
npm version patch  # or minor, major
```

### 2. Build (if needed)

```bash
npm run build  # If you add a build step
npm test       # Run tests
```

### 3. Publish to npm

```bash
# First time only: login
npm login

# Publish
npm publish --access public

# Or publish as scoped package
npm publish --access public
```

### 4. Verify

```bash
# Install globally to test
npm install -g @ai-dev-standards/cli

# Check version
ai-dev --version

# Test commands
ai-dev list skills
```

---

## Publishing the Bootstrap Package

### 1. Update Version

```bash
cd INSTALLERS/bootstrap
npm version patch
```

### 2. Publish

```bash
npm publish --access public
```

### 3. Test

```bash
# Test in a new project
cd /tmp/test-project
npm init -y
npx @ai-dev-standards/bootstrap
```

---

## Setting Up the Website

For `curl -fsSL https://ai-dev-standards.com/bootstrap.sh | bash` to work:

### Option 1: GitHub Pages

1. **Enable GitHub Pages:**
   - Go to repository settings
   - Enable Pages from `main` branch
   - Set custom domain: `ai-dev-standards.com`

2. **Add bootstrap.sh to root:**
   ```bash
   cp CLI/bootstrap.sh bootstrap.sh
   git add bootstrap.sh
   git commit -m "Add bootstrap script"
   git push
   ```

3. **Test:**
   ```bash
   curl -fsSL https://your-username.github.io/ai-dev-standards/bootstrap.sh | bash
   ```

### Option 2: Custom Domain

1. **Set up hosting** (Vercel, Netlify, etc.)

2. **Deploy:**
   ```bash
   # Create public/ directory
   mkdir -p public
   cp CLI/bootstrap.sh public/

   # Deploy to Vercel
   vercel deploy
   ```

3. **Configure DNS:**
   ```
   Type: CNAME
   Name: @
   Value: your-app.vercel.app
   ```

### Option 3: CDN (jsDelivr)

Use GitHub as the CDN:

```bash
# Works immediately after pushing to GitHub:
curl -fsSL https://cdn.jsdelivr.net/gh/your-username/ai-dev-standards@main/CLI/bootstrap.sh | bash
```

Update documentation to use this URL.

---

## Deploying MCP Servers

Each MCP server can be published individually:

### 1. Structure

```
MCP-SERVERS/
├── accessibility-checker-mcp/
│   ├── package.json
│   ├── index.js
│   └── README.md
└── supabase-manager-mcp/
    ├── package.json
    ├── index.js
    └── README.md
```

### 2. Publish

```bash
cd MCP-SERVERS/accessibility-checker-mcp
npm version patch
npm publish --access public
```

### 3. Update Registry

Update `META/registry.json`:

```json
{
  "mcps": [
    {
      "name": "accessibility-checker",
      "package": "@ai-dev-standards/mcp-accessibility-checker",
      "version": "1.0.0",
      "command": "npx",
      "args": ["-y", "@ai-dev-standards/mcp-accessibility-checker"]
    }
  ]
}
```

---

## GitHub Actions CI/CD

### Auto-Publish on Release

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish-cli:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: cd CLI && npm install

      - name: Publish CLI
        run: cd CLI && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  publish-bootstrap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Publish Bootstrap
        run: cd INSTALLERS/bootstrap && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Auto-Test on PR

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install CLI
        run: cd CLI && npm install

      - name: Test CLI
        run: cd CLI && npm test

      - name: Test Bootstrap
        run: |
          cd /tmp
          mkdir test-project
          cd test-project
          npm init -y
          git init
          node $GITHUB_WORKSPACE/CLI/bootstrap.js
          test -f .ai-dev.json
          test -f .claude/claude.md
```

---

## Release Process

### 1. Update Version

Follow semantic versioning:
- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features (backward compatible)
- **Major** (x.0.0): Breaking changes

```bash
# Update CLI
cd CLI
npm version minor

# Update Bootstrap
cd ../INSTALLERS/bootstrap
npm version minor

# Update main repo version
cd ../..
# Edit README.md version
```

### 2. Update Changelog

Create/update `CHANGELOG.md`:

```markdown
# Changelog

## [1.1.0] - 2025-10-22

### Added
- Auto-bootstrap system
- Git hook for auto-sync
- CLI commands for sync, update, generate
- 7 config file templates

### Fixed
- ESM module compatibility issues

### Changed
- Improved documentation
```

### 3. Create Git Tag

```bash
git add .
git commit -m "Release v1.1.0"
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin main --tags
```

### 4. Create GitHub Release

1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Select tag: `v1.1.0`
4. Title: `v1.1.0 - Auto-Bootstrap System`
5. Description: Copy from CHANGELOG.md
6. Publish release

### 5. Publish to npm

```bash
# Publish CLI
cd CLI
npm publish

# Publish Bootstrap
cd ../INSTALLERS/bootstrap
npm publish
```

### 6. Verify

```bash
# Test installation
npx @ai-dev-standards/bootstrap@latest

# Check versions
npm view @ai-dev-standards/cli version
npm view @ai-dev-standards/bootstrap version
```

---

## Monitoring

### npm Download Stats

```bash
# Check download stats
npm info @ai-dev-standards/cli

# View on npm
open https://www.npmjs.com/package/@ai-dev-standards/cli
```

### GitHub Traffic

- Monitor: Repository → Insights → Traffic
- Track: Views, Clones, Referring sites

---

## Rollback

If something goes wrong:

### 1. Deprecate Bad Version

```bash
npm deprecate @ai-dev-standards/cli@1.1.0 "Please upgrade to 1.1.1"
```

### 2. Publish Fixed Version

```bash
cd CLI
npm version patch  # 1.1.1
npm publish
```

### 3. Notify Users

- Update GitHub release notes
- Post in discussions/issues
- Update documentation

---

## Local Development

### Link Packages Locally

```bash
# Link CLI globally
cd CLI
npm link

# Use in other projects
cd /your/project
npm link @ai-dev-standards/cli

# Or use directly
ai-dev sync
```

### Test Bootstrap Locally

```bash
# Test Node.js version
cd /tmp/test-project
npm init -y
git init
node /path/to/ai-dev-standards/CLI/bootstrap.js

# Test Bash version
bash /path/to/ai-dev-standards/CLI/bootstrap.sh
```

---

## Package.json Configuration

### CLI Package

```json
{
  "name": "@ai-dev-standards/cli",
  "version": "1.0.0",
  "description": "CLI for AI Dev Standards",
  "main": "index.js",
  "bin": {
    "ai-dev": "./index.js"
  },
  "keywords": [
    "ai",
    "development",
    "standards",
    "cli",
    "claude"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/ai-dev-standards"
  },
  "bugs": {
    "url": "https://github.com/your-username/ai-dev-standards/issues"
  },
  "homepage": "https://github.com/your-username/ai-dev-standards#readme",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Bootstrap Package

```json
{
  "name": "@ai-dev-standards/bootstrap",
  "version": "1.0.0",
  "description": "Auto-install and initialize ai-dev CLI",
  "main": "index.js",
  "bin": {
    "ai-dev-bootstrap": "./index.js"
  },
  "preferGlobal": false
}
```

---

## Security

### Audit Dependencies

```bash
cd CLI
npm audit
npm audit fix

# Check for outdated packages
npm outdated
npm update
```

### Sign Releases

```bash
# Sign git tags
git tag -s v1.1.0 -m "Version 1.1.0"

# Sign npm packages (requires npm account with 2FA)
npm publish --otp=123456
```

---

## Documentation Updates

After releasing:

1. **Update README.md:**
   - Version number
   - Installation instructions
   - New features

2. **Update DOCS:**
   - CLI-REFERENCE.md
   - BOOTSTRAP.md
   - CHANGELOG.md

3. **Update Examples:**
   - Verify all examples work
   - Update version numbers

---

## Support & Maintenance

### Issue Labels

Use these labels on GitHub:

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

### Response Times

- **Critical bugs:** Within 24 hours
- **Feature requests:** Within 1 week
- **Documentation:** Within 3 days

### Maintenance Schedule

- **Security updates:** Immediately
- **Dependency updates:** Monthly
- **Feature releases:** Quarterly
- **Major versions:** Yearly

---

## Checklist

### Before Publishing

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Examples tested
- [ ] Breaking changes documented

### After Publishing

- [ ] GitHub release created
- [ ] npm packages published
- [ ] Documentation deployed
- [ ] Announced in discussions
- [ ] Social media post (if applicable)
- [ ] Monitor for issues

---

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Ready to publish?** Follow the release process above and make sure all checklists are complete! 🚀
