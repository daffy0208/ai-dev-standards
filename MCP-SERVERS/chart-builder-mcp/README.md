# Chart Builder MCP Server

Create charts and data visualizations programmatically for dashboards and reports.

## What This MCP Does

- 📊 **Chart Generation** - Create bar, line, pie, scatter charts
- 📈 **Dashboard Layouts** - Multi-chart dashboard templates
- 🎨 **Theming** - Consistent styling across charts
- 💾 **Export Formats** - SVG, PNG, HTML, JSON
- 🔄 **Data Transform** - Process data for visualization
- 📱 **Responsive** - Mobile-friendly chart sizing

## Installation

```bash
cd MCP-SERVERS/chart-builder-mcp
npm install && npm run build
```

## Tools

### 1. configure
```typescript
{
  theme?: 'light' | 'dark' | 'custom';
  library?: 'recharts' | 'd3' | 'victory';
  defaultWidth?: number;
  defaultHeight?: number;
}
```

### 2. create_chart
Create a single chart.
```typescript
{
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar';
  data: Array<Record<string, any>>;
  xAxis?: string;
  yAxis?: string | string[];
  title?: string;
  legend?: boolean;
}
```

### 3. create_dashboard
Create multi-chart dashboard.
```typescript
{
  layout: '2x2' | '1x3' | 'custom';
  charts: ChartConfig[];
  title?: string;
  exportPath?: string;
}
```

### 4. transform_data
Process data for visualization.
```typescript
{
  data: any[];
  operations: Array<'group' | 'aggregate' | 'filter' | 'sort'>;
  config: Record<string, any>;
}
```

### 5. export_chart
Export chart to file.
```typescript
{
  chartId: string;
  format: 'svg' | 'png' | 'html' | 'json';
  outputPath: string;
}
```

### 6. apply_theme
Apply theme to charts.
```typescript
{
  theme: {
    colors: string[];
    fonts?: Record<string, string>;
    spacing?: Record<string, number>;
  }
}
```

## Usage Example

```javascript
await chartBuilder.configure({ theme: 'dark', library: 'recharts' });

// Create bar chart
const chart = await chartBuilder.create_chart({
  type: 'bar',
  data: [
    { month: 'Jan', sales: 4000, expenses: 2400 },
    { month: 'Feb', sales: 3000, expenses: 1398 },
    { month: 'Mar', sales: 2000, expenses: 9800 }
  ],
  xAxis: 'month',
  yAxis: ['sales', 'expenses'],
  title: 'Monthly Performance'
});

// Export as SVG
await chartBuilder.export_chart({
  chartId: chart.id,
  format: 'svg',
  outputPath: './reports/monthly-sales.svg'
});
```

## Chart Types

- **Bar** - Compare values across categories
- **Line** - Show trends over time
- **Pie** - Show proportions
- **Scatter** - Show correlations
- **Area** - Show cumulative values
- **Radar** - Compare multiple variables

## Related

- **Enables:** data-visualizer skill
- **Use case:** Data visualization, reports, dashboards
