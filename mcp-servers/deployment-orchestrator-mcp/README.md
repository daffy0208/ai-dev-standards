# Deployment Orchestrator MCP Server

Orchestrate deployments to Vercel, Railway, AWS, and other cloud platforms.

## What This MCP Does

- 🚀 **Deploy Applications** - Deploy to Vercel, Railway, AWS, Cloudflare
- ⚙️ **Environment Management** - Manage environment variables
- 🔄 **Rollback Support** - Rollback failed deployments
- 🏥 **Health Checks** - Verify deployment health
- 📊 **Deployment Status** - Track deployment progress
- 🔔 **Notifications** - Deployment success/failure alerts

## Installation

```bash
cd mcp-servers/deployment-orchestrator-mcp
npm install && npm run build
```

## Tools

- `configure` - Configure deployment settings
- `deploy` - Deploy application to platform
- `deploy_preview` - Create preview deployment
- `rollback` - Rollback to previous version
- `get_status` - Check deployment status
- `list_deployments` - List recent deployments
- `set_env_vars` - Set environment variables

## Usage Example

```javascript
await deployer.configure({ platform: 'vercel', apiKey: 'xxx' })
const deployment = await deployer.deploy({ project: './my-app' })
console.log(`Deployed to: ${deployment.url}`)
```

## Related

- **Enables:** deployment-advisor skill
- **Use case:** CI/CD, deployment automation, infrastructure management
