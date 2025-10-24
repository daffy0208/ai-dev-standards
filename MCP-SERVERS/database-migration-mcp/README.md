# Database Migration MCP Server

Generate and run database migrations with Prisma and Drizzle ORM.

## What This MCP Does

- 📝 **Generate Migrations** - Create migration files from schema changes
- ▶️ **Run Migrations** - Apply migrations to database
- ↩️ **Rollback Migrations** - Revert migrations
- ✅ **Validate Schema** - Check schema consistency
- 📊 **Migration History** - Track applied migrations
- 🔄 **Schema Diff** - Compare schemas

## Installation

```bash
cd MCP-SERVERS/database-migration-mcp
npm install && npm run build
```

## Tools

- `configure` - Configure migration settings (Prisma/Drizzle)
- `generate_migration` - Generate migration from schema changes
- `run_migrations` - Apply pending migrations
- `rollback_migration` - Rollback last migration
- `validate_schema` - Validate schema integrity
- `list_migrations` - List migration history
- `schema_diff` - Show schema differences

## Usage Example

```javascript
await migrations.configure({ orm: 'prisma', projectPath: './app' });
await migrations.generate_migration({ name: 'add_users_table' });
await migrations.run_migrations();
```

## Related

- **Enables:** data-engineer skill
- **Use case:** Database schema management, migrations, version control
