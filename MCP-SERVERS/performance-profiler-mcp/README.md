# Performance Profiler MCP Server

Profile application performance, identify bottlenecks, and measure metrics.

## What This MCP Does

- ⚡ **Runtime Profiling** - Profile CPU and memory usage
- 📊 **Lighthouse Audits** - Run Lighthouse performance audits
- 📦 **Bundle Analysis** - Analyze bundle sizes and dependencies
- 🎯 **Metrics Tracking** - Track Core Web Vitals (LCP, FID, CLS)
- 🔍 **Bottleneck Detection** - Identify performance bottlenecks
- 📈 **Trend Analysis** - Track performance over time

## Installation

```bash
cd MCP-SERVERS/performance-profiler-mcp
npm install && npm run build
```

## Tools

- `configure` - Configure profiler settings
- `run_lighthouse` - Run Lighthouse audit on URL
- `profile_runtime` - Profile runtime performance
- `analyze_bundle` - Analyze bundle size
- `measure_vitals` - Measure Core Web Vitals
- `detect_bottlenecks` - Find performance bottlenecks
- `generate_report` - Generate performance report

## Usage Example

```javascript
await profiler.configure({ projectPath: './app' });
const audit = await profiler.run_lighthouse({ url: 'http://localhost:3000' });
console.log(`Performance score: ${audit.score}/100`);
```

## Related

- **Enables:** performance-optimizer skill
- **Use case:** Performance testing, optimization, monitoring
