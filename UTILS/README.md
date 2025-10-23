# Utility Functions and Scripts

Reusable utilities for common development tasks.

## Categories

### 1. CLI Utilities (`cli/`)
Command-line tools and helpers for development workflows.

### 2. Scripts (`scripts/`)
Automation scripts for common tasks:
- Database migrations
- Data seeding
- Deployment automation
- Testing utilities
- Code generation

## Usage

Utilities sync with:
```bash
ai-dev sync utils
```

Or copy specific utilities:
```bash
ai-dev get util <name>
```

## Available Utilities

| Category | Utility | Description |
|----------|---------|-------------|
| CLI | logger | Colorful console logging |
| CLI | spinner | Loading indicators |
| Scripts | db-backup | Automated database backups |
| Scripts | env-check | Verify environment variables |
| Scripts | test-runner | Custom test execution |

## Creating Custom Utilities

Place custom utilities in `.ai-dev/utils/custom/` in your project.

## Best Practices

- **Keep utilities small and focused** - Single responsibility
- **Document usage** - Include examples in comments
- **Handle errors gracefully** - Always return/throw clear errors
- **Make them testable** - Write unit tests
- **Use TypeScript** - Type safety prevents bugs

---

**Built for productivity** 🛠️
