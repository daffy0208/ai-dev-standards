# Git Hooks Templates

This directory contains templates for Git hooks used in this repository.

## Available Hooks

### pre-commit

Automatically validates code quality before each commit:

1. **Documentation Validation** - Checks consistency across documentation files
2. **ESLint** - Ensures code quality and style guidelines
3. **TypeScript Type Checking** - Validates type safety

## Installation

The hooks are automatically installed when you run `npm install` (via postinstall script).

To manually install or reinstall:

```bash
npm run install-hooks
```

## Usage

The hooks run automatically. No action needed from developers.

### Skipping Validation (Emergency Only)

If you need to commit without validation:

```bash
# Method 1: Environment variable
export SKIP_VALIDATION=1
git commit -m "emergency fix"

# Method 2: In commit message (not currently working - use Method 1)
git commit -m "emergency fix [skip-validation]"
```

## Customization

To customize the hooks:

1. Edit the template in `.git-hooks/pre-commit`
2. Run `npm run install-hooks` to update the installed hook
3. Or manually copy: `cp .git-hooks/pre-commit .git/hooks/pre-commit`

## Files

- `pre-commit` - Template for pre-commit hook
- `README.md` - This file

## More Information

See [CONTRIBUTING.md](../CONTRIBUTING.md#7-pre-commit-hooks) for complete documentation.
