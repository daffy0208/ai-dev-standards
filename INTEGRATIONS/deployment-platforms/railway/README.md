# Railway API Integration

Complete TypeScript client for the Railway deployment platform GraphQL API with comprehensive service management, deployment orchestration, and infrastructure provisioning.

## Features

- Full project and service lifecycle management
- Deployment management and monitoring
- Service restart capabilities
- Environment variable configuration
- Database provisioning (Postgres, MySQL, MongoDB, Redis)
- Real-time deployment logs
- Health check and monitoring
- Automatic retry with exponential backoff
- 30-second timeout protection
- Rate limit handling
- GraphQL-based API

## Installation

No external dependencies required - uses native `fetch` API.

```bash
# Just copy the client.ts file to your project
cp client.ts your-project/lib/railway.ts
```

## Configuration

### Environment Variables

```bash
RAILWAY_TOKEN=your_railway_api_token
```

### Getting Your API Token

1. Go to [Railway Account Settings](https://railway.app/account/tokens)
2. Click "Create New Token"
3. Give it a descriptive name
4. Copy the token (store it securely!)
5. Add to your `.env` file

## Usage

### Basic Setup

```typescript
import { RailwayClient } from './lib/railway'

// Create client from environment variables
const railway = new RailwayClient()

// Or pass options explicitly
const railway = new RailwayClient({
  token: 'your_token'
})

// Check API health
const isHealthy = await railway.healthCheck()
console.log('Railway API is accessible:', isHealthy)
```

### Project Management

#### Create Project

```typescript
const project = await railway.createProject(
  'my-web-app',
  'Full-stack web application'
)

console.log('Project created:', project.id)
console.log('Name:', project.name)
```

#### List Projects

```typescript
const projects = await railway.listProjects()

for (const project of projects) {
  console.log(`${project.name}: ${project.id}`)
  if (project.description) {
    console.log(`  ${project.description}`)
  }
}
```

#### Get Project

```typescript
const project = await railway.getProject('proj_xxx')

console.log('Project:', project.name)
console.log('Created:', project.createdAt)
```

#### Delete Project

```typescript
await railway.deleteProject('proj_xxx')
console.log('Project deleted')
```

### Service Management

#### Create Service

```typescript
// Create empty service
const service = await railway.createService(
  'proj_xxx',
  'api-service'
)

// Create service from GitHub
const service = await railway.createService(
  'proj_xxx',
  'frontend',
  {
    source: {
      repo: 'username/repo',
      branch: 'main'
    }
  }
)

console.log('Service created:', service.id)
```

#### List Services

```typescript
const services = await railway.listServices('proj_xxx')

for (const service of services) {
  console.log(`${service.name}: ${service.id}`)
}
```

#### Get Service

```typescript
const service = await railway.getService('serv_xxx')

console.log('Service:', service.name)
console.log('Project:', service.projectId)
console.log('Created:', service.createdAt)
```

#### Delete Service

```typescript
await railway.deleteService('serv_xxx')
console.log('Service deleted')
```

#### Restart Service

```typescript
// Restart a service (redeploy latest version)
const deployment = await railway.restartService('serv_xxx', 'env_xxx')

console.log('Service restarted')
console.log('New deployment:', deployment.id)
console.log('Status:', deployment.status)
```

### Deployment Management

#### Deploy Service

```typescript
const deployment = await railway.deployService({
  projectId: 'proj_xxx',
  serviceId: 'serv_xxx',
  environmentId: 'env_xxx'
})

console.log('Deployment created:', deployment.id)
console.log('Status:', deployment.status) // 'BUILDING', 'SUCCESS', 'FAILED'
```

#### Get Deployment Status

```typescript
const deployment = await railway.getDeployment('dep_xxx')

console.log('Status:', deployment.status)
console.log('Created:', deployment.createdAt)

if (deployment.finishedAt) {
  console.log('Finished:', deployment.finishedAt)
}

if (deployment.url) {
  console.log('URL:', deployment.url)
}
```

#### Get Deployment Logs

```typescript
const logs = await railway.getDeploymentLogs('dep_xxx')

console.log('Build logs:')
for (const log of logs) {
  console.log(log)
}

// Stream logs in real-time
const streamLogs = async (deploymentId: string) => {
  let lastLogCount = 0

  const interval = setInterval(async () => {
    const logs = await railway.getDeploymentLogs(deploymentId)

    // Show only new logs
    if (logs.length > lastLogCount) {
      const newLogs = logs.slice(lastLogCount)
      newLogs.forEach(log => console.log(log))
      lastLogCount = logs.length
    }

    // Check if deployment finished
    const deployment = await railway.getDeployment(deploymentId)
    if (deployment.status !== 'BUILDING') {
      clearInterval(interval)
      console.log('Deployment finished:', deployment.status)
    }
  }, 3000) // Check every 3 seconds
}
```

### Environment Variables

#### Set Variable

```typescript
await railway.setVariable(
  'proj_xxx',
  'env_xxx',
  'DATABASE_URL',
  'postgres://localhost/mydb'
)

console.log('Variable set')
```

#### List Variables

```typescript
const variables = await railway.listVariables('proj_xxx', 'env_xxx')

for (const variable of variables) {
  console.log(`${variable.name}: ${variable.value}`)
}
```

#### Delete Variable

```typescript
await railway.deleteVariable(
  'proj_xxx',
  'env_xxx',
  'OLD_API_KEY'
)

console.log('Variable deleted')
```

### Database Provisioning

#### Provision Database

```typescript
// Provision PostgreSQL
const postgres = await railway.provisionDatabase('proj_xxx', 'postgres')
console.log('PostgreSQL provisioned:', postgres.id)

// Provision MySQL
const mysql = await railway.provisionDatabase('proj_xxx', 'mysql')
console.log('MySQL provisioned:', mysql.id)

// Provision MongoDB
const mongodb = await railway.provisionDatabase('proj_xxx', 'mongodb')
console.log('MongoDB provisioned:', mongodb.id)

// Provision Redis
const redis = await railway.provisionDatabase('proj_xxx', 'redis')
console.log('Redis provisioned:', redis.id)
```

## API Reference

### Constructor

```typescript
new RailwayClient(options?: RailwayClientOptions)
```

Options:
- `token` (string, optional): Railway API token. Defaults to `RAILWAY_TOKEN` env var
- `apiUrl` (string, optional): API base URL. Defaults to `https://backboard.railway.app/graphql/v2`

### Health Check

```typescript
healthCheck(): Promise<boolean>
```

Verify API connectivity and token validity.

### Project Methods

- `createProject(name: string, description?: string): Promise<Project>`
- `getProject(projectId: string): Promise<Project>`
- `listProjects(): Promise<Project[]>`
- `deleteProject(projectId: string): Promise<void>`

### Service Methods

- `createService(projectId: string, name: string, options?: ServiceOptions): Promise<Service>`
- `getService(serviceId: string): Promise<Service>`
- `listServices(projectId: string): Promise<Service[]>`
- `deleteService(serviceId: string): Promise<void>`
- `restartService(serviceId: string, environmentId: string): Promise<Deployment>`

### Deployment Methods

- `deployService(options: DeployServiceOptions): Promise<Deployment>`
- `getDeployment(deploymentId: string): Promise<Deployment>`
- `getDeploymentLogs(deploymentId: string): Promise<string[]>`

### Environment Variable Methods

- `setVariable(projectId: string, environmentId: string, name: string, value: string): Promise<void>`
- `listVariables(projectId: string, environmentId: string): Promise<Variable[]>`
- `deleteVariable(projectId: string, environmentId: string, name: string): Promise<void>`

### Database Methods

- `provisionDatabase(projectId: string, type: 'postgres' | 'mysql' | 'mongodb' | 'redis'): Promise<Service>`

## Common Operations

### Complete Application Setup

```typescript
import { RailwayClient } from './lib/railway'

async function setupApplication() {
  const railway = new RailwayClient()

  // Create project
  const project = await railway.createProject(
    'my-fullstack-app',
    'Next.js app with Postgres'
  )
  console.log('Created project:', project.id)

  // Provision database
  const database = await railway.provisionDatabase(project.id, 'postgres')
  console.log('Provisioned database:', database.id)

  // Create service
  const service = await railway.createService(
    project.id,
    'web',
    {
      source: {
        repo: 'username/my-app',
        branch: 'main'
      }
    }
  )
  console.log('Created service:', service.id)

  // Get default environment (usually 'production')
  // Note: You'll need to get the environment ID from Railway dashboard
  const environmentId = 'env_xxx'

  // Set environment variables
  await railway.setVariable(
    project.id,
    environmentId,
    'DATABASE_URL',
    '${{Postgres.DATABASE_URL}}' // Railway variable reference
  )

  // Deploy service
  const deployment = await railway.deployService({
    projectId: project.id,
    serviceId: service.id,
    environmentId: environmentId
  })
  console.log('Deployment started:', deployment.id)

  return { project, service, deployment }
}
```

### Monitor Deployment

```typescript
async function monitorDeployment(deploymentId: string) {
  const railway = new RailwayClient()

  console.log('Monitoring deployment...')

  let status = 'BUILDING'
  while (status === 'BUILDING') {
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Get status
    const deployment = await railway.getDeployment(deploymentId)
    status = deployment.status

    // Get logs
    const logs = await railway.getDeploymentLogs(deploymentId)
    console.log('Latest log:', logs[logs.length - 1])

    console.log('Status:', status)
  }

  if (status === 'SUCCESS') {
    console.log('Deployment successful!')
    const deployment = await railway.getDeployment(deploymentId)
    console.log('URL:', deployment.url)
  } else {
    console.error('Deployment failed!')
    const logs = await railway.getDeploymentLogs(deploymentId)
    console.error('Error logs:', logs.slice(-10).join('\n'))
  }
}
```

### Auto-restart on Crash

```typescript
async function autoRestart(
  serviceId: string,
  environmentId: string,
  checkInterval = 60000 // 1 minute
) {
  const railway = new RailwayClient()

  setInterval(async () => {
    try {
      const service = await railway.getService(serviceId)

      // Check if service needs restart (implement your logic)
      // For example, check deployment status or health endpoint

      console.log('Service check:', service.name)

      // Restart if needed
      // await railway.restartService(serviceId, environmentId)
      // console.log('Service restarted')
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }, checkInterval)
}
```

### Sync Environment Variables

```typescript
async function syncEnvironmentVariables(
  projectId: string,
  environmentId: string,
  newVars: Record<string, string>
) {
  const railway = new RailwayClient()

  // Get existing variables
  const existing = await railway.listVariables(projectId, environmentId)
  const existingNames = new Set(existing.map(v => v.name))

  // Set new variables
  for (const [name, value] of Object.entries(newVars)) {
    await railway.setVariable(projectId, environmentId, name, value)
    console.log(`${existingNames.has(name) ? 'Updated' : 'Created'} ${name}`)
  }

  // Delete variables not in new set
  const newNames = new Set(Object.keys(newVars))
  for (const existingVar of existing) {
    if (!newNames.has(existingVar.name)) {
      await railway.deleteVariable(projectId, environmentId, existingVar.name)
      console.log(`Deleted ${existingVar.name}`)
    }
  }
}
```

### Database Connection

```typescript
async function getDatabaseUrl(projectId: string, environmentId: string) {
  const railway = new RailwayClient()

  const variables = await railway.listVariables(projectId, environmentId)
  const dbUrl = variables.find(v => v.name === 'DATABASE_URL')

  if (!dbUrl) {
    throw new Error('DATABASE_URL not found')
  }

  return dbUrl.value
}
```

## GraphQL Examples

Railway uses GraphQL. Here are some direct query examples:

### Custom Query

```typescript
// The client exposes the graphql method for custom queries
// But it's private. For advanced usage, you can extend the client:

class CustomRailwayClient extends RailwayClient {
  async customQuery(query: string, variables?: any) {
    return this['graphql'](query, variables)
  }
}

const client = new CustomRailwayClient()

const result = await client.customQuery(`
  query($projectId: String!) {
    project(id: $projectId) {
      name
      description
      createdAt
      services {
        edges {
          node {
            name
            id
          }
        }
      }
    }
  }
`, { projectId: 'proj_xxx' })
```

## Error Handling

The client includes automatic retry logic with exponential backoff for:
- Rate limit errors (429)
- Server errors (500+)
- GraphQL errors
- Network timeouts
- Connection errors

```typescript
try {
  const deployment = await railway.deployService({
    projectId: 'proj_xxx',
    serviceId: 'serv_xxx',
    environmentId: 'env_xxx'
  })
} catch (error) {
  console.error('Failed after 3 retries:', error.message)
}
```

## Rate Limits

Railway API has rate limits:
- 100 requests per minute (per token)
- Higher limits for Pro accounts

The client automatically handles rate limits with exponential backoff.

## Best Practices

1. **Use environment variables** for tokens - never hardcode them
2. **Provision databases** through Railway for automatic configuration
3. **Use Railway variable references** (e.g., `${{Postgres.DATABASE_URL}}`) in env vars
4. **Monitor deployments** to catch failures early
5. **Implement health checks** for critical services
6. **Set appropriate timeouts** for long-running builds
7. **Use descriptive names** for projects and services
8. **Clean up unused projects** to manage costs
9. **Test in preview environments** before production
10. **Store connection strings** in environment variables

## TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import {
  RailwayClient,
  Project,
  Service,
  Deployment,
  Environment,
  Variable,
  DeployServiceOptions
} from './lib/railway'
```

## Troubleshooting

### Token Issues

```typescript
const isHealthy = await railway.healthCheck()
if (!isHealthy) {
  console.error('Invalid token or network error')
}
```

### Deployment Failures

```typescript
const deployment = await railway.getDeployment(deploymentId)
if (deployment.status === 'FAILED') {
  const logs = await railway.getDeploymentLogs(deploymentId)
  console.error('Build logs:', logs)
}
```

### GraphQL Errors

GraphQL errors are automatically retried. If they persist:

```typescript
try {
  await railway.createProject('my-project')
} catch (error) {
  if (error.message.includes('GraphQL error')) {
    console.error('API returned an error:', error.message)
  }
}
```

### Service Not Starting

Check deployment logs and environment variables:

```typescript
const logs = await railway.getDeploymentLogs(deploymentId)
const variables = await railway.listVariables(projectId, environmentId)

console.log('Logs:', logs)
console.log('Variables:', variables)
```

## Railway CLI Integration

This client complements the Railway CLI. Use CLI for:
- Initial project setup
- Local development
- Interactive debugging

Use this client for:
- Automated deployments
- CI/CD pipelines
- Programmatic management
- Custom tooling

## Environment IDs

Railway uses environment IDs (e.g., `env_xxx`). To get your environment ID:

1. Go to your project in Railway dashboard
2. Click on the environment name (usually "production")
3. Check the URL: `railway.app/project/{project_id}/environment/{environment_id}`
4. Or use Railway CLI: `railway environment`

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway GraphQL API](https://docs.railway.app/reference/public-api)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Templates](https://railway.app/templates)

## License

MIT
