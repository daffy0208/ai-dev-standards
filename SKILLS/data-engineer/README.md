# Data Engineer Skill

Expert in data pipelines, ETL processes, and data infrastructure.

## Quick Start

```bash
# Activate skill
claude-code --skill data-engineer
```

## What This Skill Does

- 🔄 Builds ETL (Extract, Transform, Load) pipelines
- 📊 Designs data warehouse schemas (star schema)
- ✅ Implements data quality checks
- ⚡ Creates real-time data processors
- 📈 Optimizes database queries
- 💾 Sets up caching strategies

## Common Tasks

### Build ETL Pipeline
```
"Create an ETL pipeline that syncs customers from Stripe to our database daily"
```

### Data Transformation
```
"Transform raw order data: clean emails, enrich with geo data, calculate lifetime value"
```

### Data Warehouse
```
"Design a star schema for sales analytics with date, customer, product, and location dimensions"
```

### Data Quality
```
"Add data quality checks: no duplicate emails, valid phone numbers, no orphaned records"
```

## Technologies

- **Prisma** - Database ORM
- **Zod** - Schema validation
- **Redis** - Caching
- **Kafka** - Event streaming
- **PostgreSQL** - Data warehouse
- **Vercel Cron** - Scheduled jobs

## Example Output

```typescript
// ETL pipeline with validation and monitoring
export async function syncCustomers() {
  // Extract
  const raw = await fetchFromAPI()

  // Transform
  const validated = raw.map(validateCustomer)
  const enriched = await Promise.all(validated.map(enrichCustomer))

  // Load
  await batchUpsert(enriched)

  // Monitor
  await logPipelineRun({ success: true, count: enriched.length })
}
```

## Related Skills

- `data-visualizer` - Visualize processed data
- `database-optimizer` - Query optimization
- `api-designer` - Design data APIs

## Learn More

See [SKILL.md](./SKILL.md) for detailed patterns and best practices.
