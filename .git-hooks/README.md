# Git Hooks Templates

This directory contains templates for Git hooks used in this repository.

## Available Hooks

### pre-commit

Automatically validates code quality and **auto-maintains documentation** before each commit:

0. **Auto-Generation** - Regenerates all registries and documentation from source
1. **Documentation Validation** - Checks consistency across documentation files
2. **ESLint** - Ensures code quality and style guidelines
3. **TypeScript Type Checking** - Validates type safety

**Documentation is NEVER manually edited** - the pre-commit hook automatically updates all counts and references from the registry files.

## How Automation Works

When you commit changes:

1. **Registry Generation** (`npm run generate:registries`)
   - Scans `skills/`, `mcp-servers/`, `tools/`, etc.
   - Regenerates all `meta/*.json` registry files
   - Validates counts match directory structure

2. **Documentation Generation** (`npm run generate:docs`)
   - Reads counts from registry files
   - Updates all documentation files with AUTO-GEN markers
   - Ensures documentation is always in sync

3. **Auto-Staging** - Updated files are automatically staged to your commit

4. **Validation** - Confirms everything is consistent

**Result:** Documentation can never drift - it's impossible to commit out-of-sync docs!

## Installation

The hooks are automatically installed when you run `npm install` (via postinstall script).

To manually install or reinstall:

```bash
npm run install-hooks
```

## Usage

The hooks run automatically. No action needed from developers.

**You should NEVER manually update resource counts in documentation files.**  
The automation handles this for you on every commit.

### Skipping Validation (Emergency Only)

If you need to commit without validation:

```bash
# Method 1: Environment variable (recommended)
SKIP_VALIDATION=1 git commit -m "emergency fix"

# Method 2: In commit message
git commit -m "emergency fix [skip-validation]"
```

## Manual Automation Commands

You can also run automation manually:

```bash
# Regenerate registries from directories
npm run generate:registries

# Update documentation from registries
npm run generate:docs

# Do both
npm run generate:all

# Validate registries are in sync
npm run validate:registries

# Validate documentation is in sync
npm run validate:docs
```

## Customization

To customize the hooks:

1. Edit the template in `.git-hooks/pre-commit`
2. Run `npm run install-hooks` to update the installed hook
3. Or manually copy: `cp .git-hooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`

## Files

- `pre-commit` - Template for pre-commit hook
- `README.md` - This file
- `install-hooks.sh` - Script to install hooks

## More Information

See [CONTRIBUTING.md](../CONTRIBUTING.md#7-pre-commit-hooks) for complete documentation.
