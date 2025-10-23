# Deployment Advisor - Quick Start

**Version:** 1.0.0
**Category:** Infrastructure & DevOps
**Difficulty:** Intermediate

## What This Skill Does

Guides deployment platform selection and infrastructure setup from MVP (Vercel, Railway) through scale (AWS ECS, Kubernetes) with cost-optimized recommendations.

## When to Use

Use this skill when you need to:
- Choose where to deploy an application
- Set up CI/CD pipelines
- Configure production environments
- Optimize deployment costs
- Scale from MVP to production
- Implement monitoring and security

## Quick Start

**Fastest path to production:**

1. **Identify your tier** (based on user count)
   - Tier 1: <1K users → Vercel, Railway, Netlify ($0-20/mo)
   - Tier 2: 1K-100K → AWS Amplify, Cloud Run, Fly.io ($20-500/mo)
   - Tier 3: 100K+ → AWS ECS, GKE, enterprise ($500-5000+/mo)

2. **Match platform to app type**
   - Static site → Vercel, Netlify, Cloudflare Pages
   - Next.js → Vercel (best), Netlify
   - Full-stack API + DB → Railway, Render
   - Microservices → Cloud Run, Fly.io, ECS

3. **Set up auto-deploy** (Tier 1)
   - Connect GitHub repo to platform
   - Configure build command
   - Push to main → auto deploy
   - **Time**: 5-15 minutes

4. **Configure CI/CD** (Tier 2+)
   - Add GitHub Actions workflow
   - Run tests before deploy
   - Multi-environment strategy
   - **Time**: 1-4 hours

5. **Launch checklist**
   - Environment variables set
   - SSL/HTTPS enabled
   - Domain connected
   - Error monitoring (Sentry)
   - Backups configured

**Time to production:** 15 minutes (Tier 1) to 1-4 weeks (Tier 3)

## File Structure

```
deployment-advisor/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- Basic command line
- Git basics
- Understanding of your application stack

**Tools:**
- GitHub/GitLab account
- Platform account (Vercel, Railway, AWS, etc.)
- Domain name (optional for MVP)

**Related Skills:**
- `frontend-builder` or `api-designer` for building apps to deploy

## Success Criteria

You've successfully used this skill when:
- ✅ Deployment platform chosen based on tier and requirements
- ✅ Application successfully deployed to production
- ✅ CI/CD pipeline configured (auto-deploy from Git)
- ✅ Environment variables and secrets secured
- ✅ Custom domain connected with HTTPS
- ✅ Error monitoring and logging set up
- ✅ Backup and rollback strategy defined
- ✅ Deployment costs within budget
- ✅ Performance monitoring in place

## Common Workflows

### Workflow 1: MVP Launch (Tier 1)
1. Use deployment-advisor to choose platform (Vercel for Next.js)
2. Connect GitHub repo to Vercel
3. Configure build settings
4. Add environment variables
5. Deploy to production (auto)
6. Connect custom domain
7. **Cost**: $0-20/month

### Workflow 2: Growing Product (Tier 2)
1. Migrate from Tier 1 platform or start fresh
2. Choose Railway or Cloud Run
3. Set up GitHub Actions for CI/CD
4. Configure multi-environment (staging, production)
5. Add database (PostgreSQL) and Redis
6. Implement monitoring (Sentry, New Relic)
7. **Cost**: $50-200/month

### Workflow 3: Enterprise Scale (Tier 3)
1. Use deployment-advisor enterprise guidance
2. Set up AWS ECS or Kubernetes (EKS/GKE)
3. Implement Infrastructure as Code (Terraform)
4. Configure blue-green or canary deployments
5. Full observability stack (Datadog, Prometheus)
6. Security scanning and compliance
7. **Cost**: $500-5000+/month

## Key Concepts

**Deployment Tiers:**
- **Tier 1** (<1K users): Simple platforms, auto-deploy, minimal config
- **Tier 2** (1K-100K): Managed services, scaling, monitoring
- **Tier 3** (100K+): Container orchestration, multi-region, HA

**Platform Categories:**
- **Static Hosting**: Vercel, Netlify, Cloudflare Pages
- **Managed PaaS**: Railway, Render, Fly.io, AWS Amplify
- **Containers**: Cloud Run, AWS ECS/Fargate
- **Orchestration**: Kubernetes (EKS, GKE, AKS)

**CI/CD Levels:**
- **Level 1**: Git push → auto deploy (Vercel, Railway built-in)
- **Level 2**: GitHub Actions → test → deploy (custom workflows)
- **Level 3**: Multi-stage, security scans, gradual rollout

**Deployment Patterns:**
- **Jamstack**: Static frontend + API backend
- **Serverless**: Edge functions + serverless DB
- **Traditional**: Monolith on single platform
- **Microservices**: Multiple services, independent deploy

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the deployment-advisor skill to..."
- Mention keywords: "deployment", "hosting", "infrastructure", "CI/CD"

**Can't choose between platforms?**
- Start with tier based on user count
- Match platform to app type (see decision framework)
- Default recommendations:
  - Next.js → Vercel
  - Full-stack → Railway
  - Microservices → Cloud Run

**Deployment failing?**
- Check build logs for errors
- Verify environment variables set correctly
- Ensure build command matches local setup
- Check Node.js version compatibility
- Review platform-specific requirements

**High costs?**
- Review usage metrics (compute, bandwidth, storage)
- Implement caching (Redis, CDN)
- Optimize images (Next.js Image component)
- Right-size resources (don't over-provision)
- Consider cheaper platform for your tier

**Slow performance?**
- Add CDN (built-in on most platforms)
- Enable caching (Redis for API responses)
- Optimize database queries
- Use connection pooling for databases
- Consider multi-region deployment

**Security concerns?**
- Ensure HTTPS enabled (automatic on modern platforms)
- Store secrets in environment variables (never commit)
- Enable security headers (helmet.js for Node)
- Add rate limiting to APIs
- Regular dependency updates
- Use platform-provided DDoS protection

**Need to scale beyond current tier?**
- Monitor key metrics (response time, error rate, costs)
- Plan migration 2-3 months before limits
- Test new platform with staging environment
- Use blue-green deployment for migration
- Keep rollback plan ready

## Version History

- **1.0.0** (2025-10-21): Initial release, adapted from deployment-devops framework with practical tier-based guidance

## License

Part of ai-dev-standards repository.
