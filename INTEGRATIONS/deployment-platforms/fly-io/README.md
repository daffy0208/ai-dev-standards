# Fly.io API Integration

Complete TypeScript client for the Fly.io deployment platform GraphQL API with comprehensive application management, multi-region deployment, and infrastructure orchestration.

## Features

- Full application lifecycle management
- Machine (VM) management
- Multi-region deployment and scaling
- Secret management (encrypted environment variables)
- Volume (persistent storage) management
- Real-time deployment monitoring
- Health check and monitoring
- Automatic retry with exponential backoff
- 30-second timeout protection
- Rate limit handling
- GraphQL + REST hybrid API

## Installation

No external dependencies required - uses native `fetch` API.

```bash
# Just copy the client.ts file to your project
cp client.ts your-project/lib/fly.ts
```

## Configuration

### Environment Variables

```bash
FLY_API_TOKEN=your_fly_api_token
```

### Getting Your API Token

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `flyctl auth login`
3. Get token: `flyctl auth token`
4. Add to your `.env` file

Or create a token in the [Fly.io dashboard](https://fly.io/user/personal_access_tokens).

## Usage

### Basic Setup

```typescript
import { FlyClient } from './lib/fly'

// Create client from environment variables
const fly = new FlyClient()

// Or pass options explicitly
const fly = new FlyClient({
  token: 'your_token'
})

// Check API health
const isHealthy = await fly.healthCheck()
console.log('Fly.io API is accessible:', isHealthy)
```

### Application Management

#### Create Application

```typescript
// Get your organization ID from Fly.io dashboard
const app = await fly.createApp('my-web-app', 'org_xxx')

console.log('App created:', app.name)
console.log('Hostname:', app.hostname)
console.log('URL:', app.appUrl)
```

#### List Applications

```typescript
const apps = await fly.listApps()

for (const app of apps) {
  console.log(`${app.name}: ${app.status}`)
  console.log(`  URL: ${app.appUrl}`)
  console.log(`  Version: ${app.version}`)
  console.log(`  Deployed: ${app.deployed}`)
}
```

#### Get Application

```typescript
const app = await fly.getApp('my-app')

console.log('Status:', app.status)
console.log('Deployed:', app.deployed)
console.log('Hostname:', app.hostname)
console.log('Organization:', app.organization.slug)
```

#### Delete Application

```typescript
await fly.deleteApp('my-app')
console.log('App deleted')
```

### Deployment

#### Deploy with Docker Image

```typescript
const deployment = await fly.deployApp({
  appName: 'my-app',
  image: 'registry.fly.io/my-app:latest',
  region: 'iad', // Ashburn, Virginia
  env: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgres://...'
  }
})

console.log('Deployment ID:', deployment.id)
console.log('Version:', deployment.version)
console.log('Status:', deployment.status)
console.log('Created by:', deployment.user.email)
```

#### Monitor Deployment

```typescript
async function waitForDeployment(appName: string) {
  console.log('Waiting for deployment...')

  let deployed = false
  let attempts = 0
  const maxAttempts = 60 // 5 minutes

  while (!deployed && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

    const app = await fly.getApp(appName)
    deployed = app.deployed

    console.log(`Status: ${app.status}, Deployed: ${deployed}`)
    attempts++
  }

  if (deployed) {
    console.log('Deployment successful!')
    const app = await fly.getApp(appName)
    console.log('App URL:', app.appUrl)
  } else {
    throw new Error('Deployment timed out')
  }
}
```

### Scaling

#### Scale Application

```typescript
// Scale to 3 instances in a single region
await fly.scaleApp('my-app', {
  count: 3
})

// Scale across multiple regions
await fly.scaleApp('my-app', {
  count: 6,
  regions: ['iad', 'lhr', 'nrt'] // US East, London, Tokyo
})

// Change VM size
await fly.scaleApp('my-app', {
  vmSize: 'shared-cpu-2x'
})

console.log('App scaled successfully')
```

#### Restart Application

```typescript
await fly.restartApp('my-app')
console.log('App restarted')
```

### Machine Management

#### List Machines

```typescript
const machines = await fly.getMachines('my-app')

for (const machine of machines) {
  console.log(`${machine.name} (${machine.id})`)
  console.log(`  State: ${machine.state}`)
  console.log(`  Region: ${machine.region}`)
  console.log(`  Private IP: ${machine.privateIP}`)
  console.log(`  Image: ${machine.config.image}`)
}
```

### Secret Management

#### Set Secret

```typescript
// Set single secret
await fly.setSecret('my-app', 'DATABASE_URL', 'postgres://localhost/mydb')
console.log('Secret set')

// Set multiple secrets
await fly.setSecret('my-app', 'API_KEY', 'secret_key_123')
await fly.setSecret('my-app', 'REDIS_URL', 'redis://localhost:6379')
```

#### List Secrets

```typescript
const secrets = await fly.listSecrets('my-app')

console.log('Secrets:')
for (const secret of secrets) {
  console.log(`  ${secret.name} (created: ${secret.createdAt})`)
  // Note: Values are not exposed for security
}
```

#### Delete Secret

```typescript
await fly.deleteSecret('my-app', 'OLD_API_KEY')
console.log('Secret deleted')
```

### Region Management

#### List Regions

```typescript
const regions = await fly.getRegions()

console.log('Available regions:')
for (const region of regions) {
  console.log(`${region.code}: ${region.name}`)
  console.log(`  Location: ${region.latitude}, ${region.longitude}`)
}

// Find closest region
const usRegions = regions.filter(r => ['iad', 'lax', 'ord', 'dfw', 'sea'].includes(r.code))
```

### Volume Management

#### Create Volume

```typescript
const volume = await fly.createVolume(
  'my-app',
  'data',
  'iad', // region
  10 // size in GB
)

console.log('Volume created:', volume.id)
console.log('Encrypted:', volume.encrypted)
```

#### List Volumes

```typescript
const volumes = await fly.listVolumes('my-app')

for (const volume of volumes) {
  console.log(`${volume.name} (${volume.id})`)
  console.log(`  Region: ${volume.region}`)
  console.log(`  Size: ${volume.sizeGb}GB`)
  console.log(`  State: ${volume.state}`)
  console.log(`  Encrypted: ${volume.encrypted}`)
}
```

### Logging

#### Get Logs

```typescript
const logs = await fly.getLogs('my-app', {
  limit: 100
})

console.log('Recent logs:')
logs.forEach(log => console.log(log))

// Note: For real-time log streaming, use flyctl CLI
// flyctl logs -a my-app
```

### User Information

#### Get Current User

```typescript
const user = await fly.getCurrentUser()
console.log('Logged in as:', user.email)
console.log('Name:', user.name)
```

## API Reference

### Constructor

```typescript
new FlyClient(options?: FlyClientOptions)
```

Options:

- `token` (string, optional): Fly.io API token. Defaults to `FLY_API_TOKEN` env var
- `apiUrl` (string, optional): API base URL. Defaults to `https://api.fly.io/graphql`

### Health Check

```typescript
healthCheck(): Promise<boolean>
```

Verify API connectivity and token validity.

### Application Methods

- `createApp(name: string, organizationId: string): Promise<App>`
- `getApp(appName: string): Promise<App>`
- `listApps(): Promise<App[]>`
- `deleteApp(appName: string): Promise<void>`
- `restartApp(appName: string): Promise<void>`

### Deployment Methods

- `deployApp(options: DeployAppOptions): Promise<Deployment>`

### Scaling Methods

- `scaleApp(appName: string, options: ScaleOptions): Promise<void>`

### Machine Methods

- `getMachines(appName: string): Promise<Machine[]>`

### Secret Methods

- `setSecret(appName: string, name: string, value: string): Promise<void>`
- `listSecrets(appName: string): Promise<Secret[]>`
- `deleteSecret(appName: string, name: string): Promise<void>`

### Region Methods

- `getRegions(): Promise<Region[]>`

### Volume Methods

- `createVolume(appName: string, name: string, region: string, sizeGb: number): Promise<Volume>`
- `listVolumes(appName: string): Promise<Volume[]>`

### Log Methods

- `getLogs(appName: string, options?: LogOptions): Promise<string[]>`

### User Methods

- `getCurrentUser(): Promise<{ email: string; name: string }>`

## Common Operations

### Complete Application Setup

```typescript
import { FlyClient } from './lib/fly'

async function setupApplication() {
  const fly = new FlyClient()

  // Create app
  const app = await fly.createApp('my-fullstack-app', 'org_xxx')
  console.log('Created app:', app.name)

  // Create volume for persistent data
  const volume = await fly.createVolume(app.name, 'data', 'iad', 10)
  console.log('Created volume:', volume.id)

  // Set secrets
  await fly.setSecret(app.name, 'DATABASE_URL', process.env.DATABASE_URL!)
  await fly.setSecret(app.name, 'SECRET_KEY', process.env.SECRET_KEY!)
  console.log('Secrets configured')

  // Deploy application
  const deployment = await fly.deployApp({
    appName: app.name,
    image: 'registry.fly.io/my-app:latest',
    region: 'iad',
    env: {
      NODE_ENV: 'production'
    }
  })
  console.log('Deployment started:', deployment.id)

  // Wait for deployment
  let deployed = false
  while (!deployed) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    const appStatus = await fly.getApp(app.name)
    deployed = appStatus.deployed
    console.log('Deployment status:', appStatus.status)
  }

  console.log('App is live at:', app.appUrl)

  return app
}
```

### Multi-Region Deployment

```typescript
async function deployGlobally(appName: string, image: string) {
  const fly = new FlyClient()

  // Get available regions
  const regions = await fly.getRegions()
  console.log(`Deploying to ${regions.length} regions...`)

  // Deploy
  await fly.deployApp({
    appName,
    image,
    env: { NODE_ENV: 'production' }
  })

  // Scale across major regions
  await fly.scaleApp(appName, {
    count: 9,
    regions: [
      'iad', // US East
      'lax', // US West
      'lhr', // London
      'ams', // Amsterdam
      'sin', // Singapore
      'syd', // Sydney
      'gru', // São Paulo
      'nrt', // Tokyo
      'jnb' // Johannesburg
    ]
  })

  console.log('Global deployment complete!')
}
```

### Zero-Downtime Deployment

```typescript
async function deployWithZeroDowntime(appName: string, newImage: string) {
  const fly = new FlyClient()

  // Get current machines
  const machines = await fly.getMachines(appName)
  console.log(`Current machines: ${machines.length}`)

  // Deploy new version
  const deployment = await fly.deployApp({
    appName,
    image: newImage
  })

  console.log('New version deployed:', deployment.version)

  // Wait for new machines to be healthy
  await new Promise(resolve => setTimeout(resolve, 10000))

  // Verify deployment
  const app = await fly.getApp(appName)
  if (app.deployed) {
    console.log('Zero-downtime deployment successful!')
  } else {
    throw new Error('Deployment verification failed')
  }
}
```

### Automatic Scaling

```typescript
async function autoScale(appName: string) {
  const fly = new FlyClient()

  // Get current machine count
  const machines = await fly.getMachines(appName)
  const currentCount = machines.length

  console.log(`Current instances: ${currentCount}`)

  // Scale based on time of day (example logic)
  const hour = new Date().getHours()
  let targetCount: number

  if (hour >= 9 && hour <= 17) {
    // Business hours: more instances
    targetCount = 5
  } else if (hour >= 22 || hour <= 6) {
    // Night: minimum instances
    targetCount = 1
  } else {
    // Other times: moderate
    targetCount = 3
  }

  if (targetCount !== currentCount) {
    await fly.scaleApp(appName, { count: targetCount })
    console.log(`Scaled from ${currentCount} to ${targetCount} instances`)
  }
}
```

### Health Check Monitoring

```typescript
async function monitorHealth(appName: string) {
  const fly = new FlyClient()

  const checkHealth = async () => {
    try {
      const app = await fly.getApp(appName)

      if (app.status !== 'running') {
        console.warn(`App status: ${app.status}`)
        // Send alert
      }

      const machines = await fly.getMachines(appName)
      const unhealthy = machines.filter(m => m.state !== 'started')

      if (unhealthy.length > 0) {
        console.warn(`Unhealthy machines: ${unhealthy.length}`)
        // Restart unhealthy machines or send alert
      }

      console.log(`Health check passed: ${machines.length} machines running`)
    } catch (error) {
      console.error('Health check failed:', error)
      // Send alert
    }
  }

  // Run health check every 5 minutes
  setInterval(checkHealth, 5 * 60 * 1000)
}
```

## fly.toml Configuration

Fly.io uses a `fly.toml` file for configuration. Here's an example:

```toml
app = "my-app"
primary_region = "iad"

[build]
  image = "registry.fly.io/my-app:latest"

[env]
  PORT = "8080"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"

[mounts]
  source = "data"
  destination = "/data"
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
  const deployment = await fly.deployApp({
    appName: 'my-app',
    image: 'my-image:latest'
  })
} catch (error) {
  console.error('Failed after 3 retries:', error.message)
}
```

## Rate Limits

Fly.io API has rate limits:

- 1000 requests per hour (per token)
- GraphQL queries count based on complexity

The client automatically handles rate limits with exponential backoff.

## Best Practices

1. **Use environment variables** for tokens - never hardcode them
2. **Deploy to multiple regions** for better performance and reliability
3. **Use volumes** for persistent data
4. **Encrypt secrets** - they're encrypted by default
5. **Monitor health** regularly
6. **Use fly.toml** for declarative configuration
7. **Scale gradually** - test with small instance counts first
8. **Set appropriate VM sizes** based on your workload
9. **Use health checks** in your application
10. **Clean up unused apps** to manage costs

## VM Sizes

Available VM sizes:

- `shared-cpu-1x`: 256MB RAM, shared CPU (default)
- `shared-cpu-2x`: 512MB RAM, shared CPU
- `shared-cpu-4x`: 1GB RAM, shared CPU
- `shared-cpu-8x`: 2GB RAM, shared CPU
- `dedicated-cpu-1x`: 2GB RAM, 1 dedicated CPU
- `dedicated-cpu-2x`: 4GB RAM, 2 dedicated CPUs
- `dedicated-cpu-4x`: 8GB RAM, 4 dedicated CPUs
- `dedicated-cpu-8x`: 16GB RAM, 8 dedicated CPUs

## TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import {
  FlyClient,
  App,
  Machine,
  Region,
  Secret,
  Volume,
  Deployment,
  DeployAppOptions,
  ScaleOptions
} from './lib/fly'
```

## Troubleshooting

### Token Issues

```typescript
const isHealthy = await fly.healthCheck()
if (!isHealthy) {
  console.error('Invalid token or network error')
}
```

### Deployment Failures

```typescript
const app = await fly.getApp('my-app')
if (!app.deployed) {
  console.error('Deployment failed or in progress')
  const logs = await fly.getLogs('my-app')
  console.error('Logs:', logs)
}
```

### Machine States

```typescript
const machines = await fly.getMachines('my-app')
const problematic = machines.filter(m => ['stopping', 'stopped', 'destroyed'].includes(m.state))

if (problematic.length > 0) {
  console.warn('Problematic machines:', problematic)
}
```

### Region Selection

```typescript
// Find regions with lowest latency
const regions = await fly.getRegions()

// Choose regions close to your users
const usRegions = regions.filter(r => r.code.startsWith('i') || r.code.startsWith('l'))
```

## Fly CLI Integration

This client complements the Fly CLI. Use CLI for:

- Initial app setup: `flyctl launch`
- Local development: `flyctl dev`
- SSH access: `flyctl ssh console`
- Real-time logs: `flyctl logs`
- Database management: `flyctl postgres`

Use this client for:

- Automated deployments
- CI/CD pipelines
- Programmatic management
- Custom tooling
- Multi-app orchestration

## Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io GraphQL API](https://fly.io/docs/reference/graphql-api/)
- [Fly.io Regions](https://fly.io/docs/reference/regions/)
- [Fly.io Machines API](https://fly.io/docs/machines/api/)
- [Fly CLI Reference](https://fly.io/docs/flyctl/)

## License

MIT
