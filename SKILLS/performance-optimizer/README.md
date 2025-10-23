# Performance Optimizer - Quick Start

**Version:** 1.0.0
**Category:** Infrastructure & DevOps
**Difficulty:** Advanced

## What This Skill Does

Guides systematic performance optimization through profiling, database tuning, caching, frontend optimization, and monitoring to achieve sub-second response times and excellent user experience.

## When to Use

Use this skill when you need to:
- Investigate slow page loads or API responses
- Optimize database queries and eliminate N+1 problems
- Implement caching strategies (Redis, CDN)
- Improve Core Web Vitals for SEO
- Scale applications to handle more traffic
- Reduce infrastructure costs through efficiency

## Quick Start

**Fastest path to better performance:**

1. **Measure first** (don't guess!)
   - Run Lighthouse audit: `lighthouse https://yoursite.com`
   - Profile with Chrome DevTools Performance tab
   - Check backend: Enable slow query logging
   - Identify actual bottlenecks

2. **Quick wins** (15-30 minutes each)
   - Add database indexes on WHERE/ORDER BY columns
   - Enable compression (gzip/brotli)
   - Add CDN for static assets (Cloudflare free)
   - Lazy load images with `loading="lazy"`
   - Enable Redis caching for API responses

3. **Frontend optimization** (Phase 4)
   - Code splitting: Lazy load routes
   - Image optimization: WebP format, Next.js Image
   - Bundle reduction: Remove unused dependencies
   - React memoization: useMemo, memo, useCallback

4. **Backend optimization** (Phase 5)
   - Fix N+1 queries with eager loading
   - Move slow tasks to background queue (Bull/BullMQ)
   - Add connection pooling
   - Implement rate limiting

5. **Monitor continuously** (Phase 6)
   - Set up APM (Sentry, New Relic, Datadog)
   - Track P95 response times
   - Alert on slow requests (>1s)
   - Monitor cache hit ratio

**Time to improvements:** Quick wins in 1-2 hours, full optimization 1-2 weeks

## File Structure

```
performance-optimizer/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- Profiling tools (Chrome DevTools, Node --prof)
- Database query optimization
- HTTP caching and CDN concepts

**Tools:**
- Lighthouse CLI or Chrome DevTools
- Profiling tools (Chrome DevTools, Node profiler)
- APM tool (Sentry, New Relic, Datadog)
- Redis for caching (optional but recommended)

**Related Skills:**
- `frontend-builder` for React performance patterns
- `deployment-advisor` for infrastructure optimization

## Success Criteria

You've successfully used this skill when:
- ✅ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- ✅ Lighthouse score > 90
- ✅ P95 API response time < 500ms
- ✅ Database queries indexed (P95 < 100ms)
- ✅ N+1 queries eliminated
- ✅ Caching implemented (cache hit ratio > 80%)
- ✅ Bundle size < 200KB (initial load)
- ✅ CDN configured for static assets
- ✅ Monitoring/alerting active
- ✅ Performance budget defined and met

## Common Workflows

### Workflow 1: Fix Slow Page Loads
1. Run Lighthouse audit → identify issues
2. Use performance-optimizer Phase 4 (Frontend)
3. Optimize images (WebP, lazy loading)
4. Code split heavy components
5. Add CDN for static assets
6. Verify: LCP < 2.5s

### Workflow 2: Optimize Slow API
1. Profile backend (Node --prof or similar)
2. Enable slow query logging
3. Use performance-optimizer Phase 2 (Database)
4. Add indexes, fix N+1 queries
5. Implement Redis caching (Phase 3)
6. Verify: P95 < 500ms

### Workflow 3: Scale for Growth
1. Profile current performance
2. Optimize database (indexes, connection pooling)
3. Add multi-layer caching (Redis + CDN)
4. Move slow tasks to background queue
5. Set up auto-scaling
6. Monitor with APM tool

## Key Concepts

**Performance Budget:**
- **LCP**: Largest Contentful Paint < 2.5s
- **FID**: First Input Delay < 100ms
- **CLS**: Cumulative Layout Shift < 0.1
- **API P95**: 95th percentile response time < 500ms

**Profiling Tools:**
- **Chrome DevTools**: Performance tab, Lighthouse, Network
- **React DevTools**: Profiler for component render times
- **Node.js**: --prof flag, flame graphs with 0x
- **Database**: EXPLAIN ANALYZE, slow query logs

**Optimization Phases:**
1. **Profiling**: Identify bottlenecks
2. **Database**: Indexes, query optimization, N+1 fixes
3. **Caching**: Redis, CDN, HTTP headers
4. **Frontend**: Code splitting, image optimization, bundle size
5. **Backend**: Async processing, compression, rate limiting
6. **Monitoring**: APM, alerts, dashboards

**Caching Layers:**
- Browser cache (HTTP headers)
- CDN cache (Cloudflare, CloudFront)
- Application cache (Redis, Memcached)
- Database query cache

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the performance-optimizer skill to..."
- Mention keywords: "performance", "slow", "optimization", "caching"

**Don't know where to start?**
- Run Lighthouse audit first
- Profile with Chrome DevTools Performance tab
- Check backend with slow query logging
- Start with Phase 1 (Profiling) to identify real bottlenecks

**LCP (Largest Contentful Paint) too slow?**
- Optimize images (WebP, lazy loading, Next.js Image)
- Reduce JavaScript execution time (code splitting)
- Preload critical resources
- Use CDN for faster asset delivery
- Server-side render above-the-fold content

**API responses too slow?**
- Profile to find bottleneck (database, external API, computation)
- Add database indexes on WHERE/ORDER BY columns
- Fix N+1 queries with eager loading
- Implement Redis caching for frequent queries
- Move heavy computations to background queue

**Database queries slow?**
- Run EXPLAIN ANALYZE on slow queries
- Add indexes (but not too many—slows writes)
- Avoid SELECT *, fetch only needed columns
- Use LIMIT for large result sets
- Avoid functions in WHERE clause (breaks indexes)
- Check query execution plan

**N+1 query problem?**
- Use eager loading (include/join in ORM)
- Implement DataLoader for batching
- Check ORM logs for query count
- Profile with database slow query log

**Bundle size too large?**
- Analyze with `npm run build -- --analyze`
- Remove unused dependencies
- Use tree-shaking imports (`import debounce from 'lodash/debounce'`)
- Dynamic imports for large libraries
- Code split routes

**React app re-rendering too much?**
- Use React DevTools Profiler
- Add `memo` to expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references
- Check dependency arrays in useEffect, useMemo, useCallback

**Cache not helping?**
- Check cache hit ratio (should be > 80%)
- Ensure cache keys are correct
- Set appropriate TTL (Time To Live)
- Implement cache warming for critical data
- Monitor cache eviction rate

**How to prioritize optimizations?**
- Fix issues impacting most users first
- Target Core Web Vitals for SEO
- Optimize P95 response times (not just average)
- Address slowest queries first (80/20 rule)
- Quick wins: indexes, compression, CDN

## Version History

- **1.0.0** (2025-10-21): Initial release, comprehensive web application performance optimization

## License

Part of ai-dev-standards repository.
