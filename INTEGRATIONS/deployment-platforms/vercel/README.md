# Vercel API Integration

Complete TypeScript client for the Vercel deployment platform API with comprehensive deployment management, environment configuration, and domain handling.

## Features

- Full deployment lifecycle management
- Project and domain management
- Environment variable configuration
- Deployment rollback support
- Real-time deployment logs
- Health check and monitoring
- Automatic retry with exponential backoff
- 30-second timeout protection
- Rate limit handling
- Team support

## Installation

No external dependencies required - uses native `fetch` API.

```bash
# Just copy the client.ts file to your project
cp client.ts your-project/lib/vercel.ts
```

## Configuration

### Environment Variables

```bash
VERCEL_TOKEN=your_vercel_api_token
VERCEL_TEAM_ID=your_team_id  # Optional, for team accounts
```

### Getting Your API Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name
4. Copy the token (you won't see it again!)
5. Add to your `.env` file

## Usage

### Basic Setup

```typescript
import { VercelClient } from './lib/vercel'

// Create client from environment variables
const vercel = new VercelClient()

// Or pass options explicitly
const vercel = new VercelClient({
  token: 'your_token',
  teamId: 'team_xxx' // Optional
})

// Check API health
const isHealthy = await vercel.healthCheck()
console.log('Vercel API is accessible:', isHealthy)
```

### Deployment Management

#### Create Deployment

```typescript
// Deploy from Git
const deployment = await vercel.createDeployment({
  name: 'my-nextjs-app',
  gitSource: {
    type: 'github',
    repo: 'username/repo',
    ref: 'main'
  },
  target: 'production',
  env: {
    DATABASE_URL: 'postgres://...',
    API_KEY: 'secret'
  },
  buildCommand: 'npm run build',
  outputDirectory: '.next'
})

console.log('Deployment created:', deployment.url)
console.log('Status:', deployment.state) // 'BUILDING', 'READY', 'ERROR'
```

#### Get Deployment Status

```typescript
const deployment = await vercel.getDeployment(deploymentId)

console.log('State:', deployment.state)
console.log('URL:', deployment.url)
console.log('Created:', new Date(deployment.createdAt))

if (deployment.state === 'READY') {
  console.log('Deployment is live!')
}
```

#### List Deployments

```typescript
const deployments = await vercel.listDeployments('my-app')

for (const deployment of deployments) {
  console.log(`${deployment.id}: ${deployment.state} - ${deployment.url}`)
}

// Filter by target
const prodDeployments = deployments.filter(d => d.target === 'production')
const previewDeployments = deployments.filter(d => d.target === 'preview')
```

#### Cancel Deployment

```typescript
// Cancel an in-progress deployment
await vercel.cancelDeployment(deploymentId)
console.log('Deployment cancelled')
```

#### Delete Deployment

```typescript
// Permanently delete a deployment
await vercel.deleteDeployment(deploymentId)
console.log('Deployment deleted')
```

#### Rollback Deployment

```typescript
// Get list of production deployments
const deployments = await vercel.listDeployments('my-app')

// Find the last successful production deployment
const previousDeployment = deployments.find(d => d.state === 'READY' && d.target === 'production')

// Rollback to it
if (previousDeployment) {
  await vercel.rollback(previousDeployment.id, 'my-app')
  console.log('Rolled back to:', previousDeployment.url)
}
```

### Project Management

#### Create Project

```typescript
const project = await vercel.createProject({
  name: 'my-new-project',
  framework: 'nextjs',
  gitRepository: {
    type: 'github',
    repo: 'username/repo'
  }
})

console.log('Project created:', project.id)
```

#### Get Project

```typescript
const project = await vercel.getProject('my-project')

console.log('Framework:', project.framework)
console.log('Latest deployments:', project.latestDeployments)
```

#### Update Project

```typescript
await vercel.updateProject('my-project', {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  outputDirectory: 'dist'
})
```

#### List All Projects

```typescript
const projects = await vercel.listProjects()

for (const project of projects) {
  console.log(`${project.name} (${project.framework})`)
}
```

#### Delete Project

```typescript
await vercel.deleteProject('my-project')
console.log('Project deleted')
```

### Domain Management

#### Add Domain

```typescript
const domain = await vercel.addDomain('my-project', 'example.com')

console.log('Domain added:', domain.name)
console.log('Verified:', domain.verified)

if (!domain.verified) {
  console.log('Add this TXT record:', domain.verificationRecord)
}
```

#### List Domains

```typescript
const domains = await vercel.listDomains('my-project')

for (const domain of domains) {
  console.log(`${domain.name}: ${domain.verified ? 'Verified' : 'Pending'}`)
}
```

#### Remove Domain

```typescript
await vercel.removeDomain('my-project', 'example.com')
console.log('Domain removed')
```

### Environment Variables

#### Create Environment Variable

```typescript
await vercel.createEnvVar('my-project', {
  key: 'DATABASE_URL',
  value: 'postgres://localhost/mydb',
  target: ['production', 'preview'],
  type: 'encrypted'
})
```

#### List Environment Variables

```typescript
const envVars = await vercel.getEnvVars('my-project')

for (const envVar of envVars) {
  console.log(`${envVar.key}: ${envVar.target.join(', ')}`)
}
```

#### Update Environment Variable

```typescript
await vercel.updateEnvVar('my-project', 'env_xxx', {
  value: 'new_value',
  target: ['production', 'preview', 'development']
})
```

#### Delete Environment Variable

```typescript
await vercel.deleteEnvVar('my-project', 'env_xxx')
console.log('Environment variable deleted')
```

### Deployment Logs

#### Get Logs

```typescript
const logs = await vercel.getDeploymentLogs(deploymentId)

for (const log of logs) {
  console.log(log)
}

// Stream logs in real-time
const checkLogs = async () => {
  const logs = await vercel.getDeploymentLogs(deploymentId)
  console.log('Latest logs:', logs.slice(-10))
}

const interval = setInterval(checkLogs, 5000) // Check every 5 seconds
```

#### Get Deployment Files

```typescript
const files = await vercel.getDeploymentFiles(deploymentId)

console.log('Deployed files:')
for (const file of files) {
  console.log(`${file.name} (${file.size} bytes)`)
}
```

## API Reference

### Constructor

```typescript
new VercelClient(options?: VercelClientOptions)
```

Options:

- `token` (string, optional): Vercel API token. Defaults to `VERCEL_TOKEN` env var
- `teamId` (string, optional): Team ID for team accounts. Defaults to `VERCEL_TEAM_ID` env var
- `apiUrl` (string, optional): API base URL. Defaults to `https://api.vercel.com`

### Health Check

```typescript
healthCheck(): Promise<boolean>
```

Verify API connectivity and token validity.

### Deployment Methods

- `createDeployment(options: CreateDeploymentOptions): Promise<Deployment>`
- `getDeployment(deploymentId: string): Promise<Deployment>`
- `listDeployments(projectName: string): Promise<Deployment[]>`
- `cancelDeployment(deploymentId: string): Promise<void>`
- `deleteDeployment(deploymentId: string): Promise<void>`
- `rollback(deploymentId: string, projectName: string): Promise<Deployment>`
- `getDeploymentLogs(deploymentId: string): Promise<string[]>`
- `getDeploymentFiles(deploymentId: string): Promise<DeploymentFile[]>`

### Project Methods

- `createProject(options: { name: string; framework?: string; gitRepository?: GitSource }): Promise<Project>`
- `getProject(projectName: string): Promise<Project>`
- `updateProject(projectName: string, updates: Partial<Project>): Promise<Project>`
- `deleteProject(projectName: string): Promise<void>`
- `listProjects(): Promise<Project[]>`

### Domain Methods

- `addDomain(projectName: string, domain: string): Promise<Domain>`
- `removeDomain(projectName: string, domain: string): Promise<void>`
- `listDomains(projectName: string): Promise<Domain[]>`

### Environment Variable Methods

- `createEnvVar(projectName: string, options: EnvVarOptions): Promise<EnvironmentVariable>`
- `getEnvVars(projectName: string): Promise<EnvironmentVariable[]>`
- `updateEnvVar(projectName: string, envId: string, updates: Partial<EnvVarOptions>): Promise<EnvironmentVariable>`
- `deleteEnvVar(projectName: string, envId: string): Promise<void>`

## Common Operations

### Deploy on Git Push

```typescript
import { VercelClient } from './lib/vercel'

async function deployOnPush(repo: string, branch: string) {
  const vercel = new VercelClient()

  const deployment = await vercel.createDeployment({
    name: 'my-app',
    gitSource: {
      type: 'github',
      repo,
      ref: branch
    },
    target: branch === 'main' ? 'production' : 'preview'
  })

  console.log(`Deploying ${repo}@${branch}...`)

  // Poll for deployment status
  let status = deployment.state
  while (status === 'BUILDING') {
    await new Promise(resolve => setTimeout(resolve, 5000))
    const updated = await vercel.getDeployment(deployment.id)
    status = updated.state
    console.log('Status:', status)
  }

  if (status === 'READY') {
    console.log('Deployment successful:', deployment.url)
  } else {
    console.error('Deployment failed')
    const logs = await vercel.getDeploymentLogs(deployment.id)
    console.error(logs.join('\n'))
  }
}
```

### Automatic Rollback on Error

```typescript
async function safeDeployment(projectName: string) {
  const vercel = new VercelClient()

  // Get current production deployment
  const deployments = await vercel.listDeployments(projectName)
  const currentProd = deployments.find(d => d.state === 'READY' && d.target === 'production')

  try {
    // Create new deployment
    const deployment = await vercel.createDeployment({
      name: projectName,
      target: 'production'
    })

    // Wait for deployment
    let status = deployment.state
    while (status === 'BUILDING') {
      await new Promise(resolve => setTimeout(resolve, 5000))
      const updated = await vercel.getDeployment(deployment.id)
      status = updated.state
    }

    if (status !== 'READY') {
      throw new Error('Deployment failed')
    }

    console.log('Deployment successful:', deployment.url)
  } catch (error) {
    console.error('Deployment error:', error)

    // Rollback to previous deployment
    if (currentProd) {
      console.log('Rolling back to previous deployment...')
      await vercel.rollback(currentProd.id, projectName)
      console.log('Rollback complete')
    }
  }
}
```

### Environment Sync

```typescript
async function syncEnvironmentVariables(projectName: string, newEnvVars: Record<string, string>) {
  const vercel = new VercelClient()

  // Get existing env vars
  const existing = await vercel.getEnvVars(projectName)

  for (const [key, value] of Object.entries(newEnvVars)) {
    const existingVar = existing.find(v => v.key === key)

    if (existingVar) {
      // Update existing
      await vercel.updateEnvVar(projectName, existingVar.id!, { value })
      console.log(`Updated ${key}`)
    } else {
      // Create new
      await vercel.createEnvVar(projectName, {
        key,
        value,
        target: ['production', 'preview', 'development'],
        type: 'encrypted'
      })
      console.log(`Created ${key}`)
    }
  }
}
```

## Error Handling

The client includes automatic retry logic with exponential backoff for:

- Rate limit errors (429)
- Server errors (500+)
- Network timeouts
- Connection errors

```typescript
try {
  const deployment = await vercel.createDeployment({
    name: 'my-app',
    target: 'production'
  })
} catch (error) {
  console.error('Failed after 3 retries:', error.message)
}
```

## Rate Limits

Vercel API has rate limits:

- 100 requests per 10 seconds (per token)
- 20 deployments per minute

The client automatically handles rate limits with exponential backoff.

## Best Practices

1. **Use environment variables** for tokens - never hardcode them
2. **Enable team ID** if working with a team account
3. **Use preview deployments** for testing before production
4. **Implement rollback logic** for critical deployments
5. **Monitor deployment logs** for debugging
6. **Set appropriate timeouts** for long-running builds
7. **Use encrypted env vars** for sensitive data
8. **Clean up old deployments** to save storage

## TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import {
  VercelClient,
  Deployment,
  Project,
  Domain,
  EnvironmentVariable,
  CreateDeploymentOptions,
  GitSource
} from './lib/vercel'
```

## Troubleshooting

### Token Issues

```typescript
const isHealthy = await vercel.healthCheck()
if (!isHealthy) {
  console.error('Invalid token or network error')
}
```

### Deployment Failures

```typescript
const deployment = await vercel.getDeployment(deploymentId)
if (deployment.state === 'ERROR') {
  const logs = await vercel.getDeploymentLogs(deploymentId)
  console.error('Build logs:', logs)
}
```

### Rate Limit Handling

The client automatically retries on rate limits, but you can also check:

```typescript
try {
  await vercel.createDeployment(options)
} catch (error) {
  if (error.message.includes('rate limit')) {
    console.log('Rate limited, will retry...')
  }
}
```

## Resources

- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Deployment Configuration](https://vercel.com/docs/concepts/deployments/configuration)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## License

MIT
