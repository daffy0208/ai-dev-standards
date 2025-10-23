# Data Visualizer Skill

Expert in creating charts, dashboards, and data visualizations using modern libraries.

## Quick Start

```bash
# Activate skill
claude-code --skill data-visualizer
```

## What This Skill Does

- 📊 Creates interactive charts (line, bar, pie, scatter, heatmap)
- 📈 Builds KPI dashboards with real-time updates
- 🎨 Designs accessible color schemes
- 📱 Implements responsive layouts
- ⚡ Optimizes chart performance
- 💾 Adds export functionality (PNG, CSV)

## Common Tasks

### Create a Line Chart
```
"Create a line chart showing revenue over the last 12 months"
```

### Build a KPI Dashboard
```
"Build a dashboard with 4 KPI cards showing revenue, users, conversion rate, and average order value"
```

### Add Real-Time Updates
```
"Add real-time updates to this chart using Server-Sent Events"
```

### Make Charts Responsive
```
"Make this chart responsive for mobile devices"
```

## Technologies

- **Recharts** - React charts (recommended)
- **Chart.js** - Framework-agnostic
- **D3.js** - Advanced custom visualizations
- **Tremor** - Dashboard components
- **Visx** - Low-level React primitives

## Example Output

```typescript
// KPI Dashboard with real-time updates
export default function Dashboard() {
  return (
    <div className="grid grid-cols-4 gap-6">
      <KPICard title="Revenue" value="$45K" change={12.5} trend="up" />
      <KPICard title="Users" value="2.3K" change={-5.2} trend="down" />
      <LineChart data={realtimeData} />
      <BarChart data={salesByRegion} />
    </div>
  )
}
```

## Related Skills

- `data-engineer` - Data pipelines and ETL
- `performance-optimizer` - Chart performance
- `accessibility-auditor` - Accessible visualizations

## Learn More

See [SKILL.md](./SKILL.md) for detailed examples and patterns.
