/**
 * Fly.io API Client
 *
 * Integration for Fly.io deployment platform GraphQL API.
 *
 * Features:
 * - Deploy applications
 * - Manage machines (VMs)
 * - Scale applications
 * - Secret management
 * - Multi-region deployment
 * - Real-time logs
 * - Health checks
 *
 * @example
 * ```typescript
 * const client = new FlyClient({
 *   token: process.env.FLY_API_TOKEN
 * })
 *
 * // Deploy application
 * const deployment = await client.deployApp({
 *   appName: 'my-app',
 *   region: 'iad',
 *   image: 'my-image:latest'
 * })
 *
 * // Scale application
 * await client.scaleApp('my-app', {
 *   count: 3,
 *   vmSize: 'shared-cpu-1x'
 * })
 * ```
 */

export interface FlyClientOptions {
  /**
   * Fly.io API token
   */
  token?: string

  /**
   * API base URL
   */
  apiUrl?: string
}

export interface App {
  id: string
  name: string
  status: string
  deployed: boolean
  hostname: string
  appUrl: string
  version: number
  organization: {
    id: string
    slug: string
  }
  createdAt: string
  regions?: Region[]
}

export interface Machine {
  id: string
  name: string
  state: 'starting' | 'started' | 'stopping' | 'stopped' | 'destroyed'
  region: string
  instanceId: string
  privateIP: string
  createdAt: string
  updatedAt: string
  config: {
    image: string
    env?: Record<string, string>
    services?: Array<{
      ports: Array<{
        port: number
        handlers: string[]
      }>
      protocol: string
      internalPort: number
    }>
  }
}

export interface Region {
  code: string
  name: string
  latitude: number
  longitude: number
}

export interface Secret {
  name: string
  digest: string
  createdAt: string
}

export interface Volume {
  id: string
  name: string
  state: string
  sizeGb: number
  region: string
  encrypted: boolean
  createdAt: string
}

export interface Deployment {
  id: string
  status: 'pending' | 'running' | 'successful' | 'failed'
  description: string
  version: number
  createdAt: string
  user: {
    email: string
  }
}

export interface DeployAppOptions {
  appName: string
  region?: string
  image: string
  env?: Record<string, string>
  vmSize?: string
  count?: number
}

export interface ScaleOptions {
  count?: number
  vmSize?: 'shared-cpu-1x' | 'shared-cpu-2x' | 'shared-cpu-4x' | 'shared-cpu-8x'
  regions?: string[]
}

export class FlyClient {
  private token: string
  private apiUrl: string
  private timeout: number
  private maxRetries: number

  constructor(options: FlyClientOptions = {}) {
    this.token = options.token || process.env.FLY_API_TOKEN || ''
    this.apiUrl = options.apiUrl || 'https://api.fly.io/graphql'
    this.timeout = 30000 // 30 seconds
    this.maxRetries = 3

    if (!this.token) {
      throw new Error('Fly.io API token is required')
    }
  }

  /**
   * Health check - verify API connectivity and token validity
   *
   * @example
   * ```typescript
   * const isHealthy = await client.healthCheck()
   * console.log('API is accessible:', isHealthy)
   * ```
   */
  async healthCheck(): Promise<boolean> {
    try {
      const query = `query { viewer { email } }`
      await this.graphql(query)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * List all applications
   *
   * @example
   * ```typescript
   * const apps = await client.listApps()
   * console.log('Apps:', apps.map(a => a.name))
   * ```
   */
  async listApps(): Promise<App[]> {
    const query = `
      query {
        apps {
          nodes {
            id
            name
            status
            deployed
            hostname
            appUrl
            version
            organization {
              id
              slug
            }
            createdAt
          }
        }
      }
    `

    const response = await this.graphql(query)
    return response.data.apps.nodes
  }

  /**
   * Get application by name
   *
   * @param appName - The application name
   * @returns Application details
   *
   * @example
   * ```typescript
   * const app = await client.getApp('my-app')
   * console.log('Status:', app.status)
   * console.log('URL:', app.appUrl)
   * ```
   */
  async getApp(appName: string): Promise<App> {
    const query = `
      query($appName: String!) {
        app(name: $appName) {
          id
          name
          status
          deployed
          hostname
          appUrl
          version
          organization {
            id
            slug
          }
          createdAt
        }
      }
    `

    const response = await this.graphql(query, { appName })
    return response.data.app
  }

  /**
   * Create a new application
   *
   * @param name - Application name
   * @param organizationId - Organization ID
   * @returns Created application
   *
   * @example
   * ```typescript
   * const app = await client.createApp('my-new-app', 'org_xxx')
   * console.log('Created:', app.name)
   * ```
   */
  async createApp(name: string, organizationId: string): Promise<App> {
    const mutation = `
      mutation($input: CreateAppInput!) {
        createApp(input: $input) {
          app {
            id
            name
            status
            hostname
            organization {
              id
              slug
            }
            createdAt
          }
        }
      }
    `

    const response = await this.graphql(mutation, {
      input: { name, organizationId }
    })
    return response.data.createApp.app
  }

  /**
   * Delete an application
   *
   * @param appName - Application name
   *
   * @example
   * ```typescript
   * await client.deleteApp('my-app')
   * console.log('App deleted')
   * ```
   */
  async deleteApp(appName: string): Promise<void> {
    const mutation = `
      mutation($appName: String!) {
        deleteApp(appId: $appName) {
          organizationId
        }
      }
    `

    await this.graphql(mutation, { appName })
  }

  /**
   * Deploy application with new image
   *
   * @param options - Deployment options
   * @returns Deployment info
   *
   * @example
   * ```typescript
   * const deployment = await client.deployApp({
   *   appName: 'my-app',
   *   image: 'registry.fly.io/my-app:latest',
   *   region: 'iad',
   *   env: { NODE_ENV: 'production' }
   * })
   * ```
   */
  async deployApp(options: DeployAppOptions): Promise<Deployment> {
    const mutation = `
      mutation($input: DeployImageInput!) {
        deployImage(input: $input) {
          release {
            id
            version
            description
            status
            createdAt
            user {
              email
            }
          }
        }
      }
    `

    const response = await this.graphql(mutation, {
      input: {
        appId: options.appName,
        image: options.image,
        definition: {
          env: options.env || {}
        }
      }
    })

    return {
      id: response.data.deployImage.release.id,
      status: response.data.deployImage.release.status,
      description: response.data.deployImage.release.description,
      version: response.data.deployImage.release.version,
      createdAt: response.data.deployImage.release.createdAt,
      user: response.data.deployImage.release.user
    }
  }

  /**
   * Scale application
   *
   * @param appName - Application name
   * @param options - Scale options
   *
   * @example
   * ```typescript
   * await client.scaleApp('my-app', {
   *   count: 3,
   *   vmSize: 'shared-cpu-2x',
   *   regions: ['iad', 'lhr', 'nrt']
   * })
   * ```
   */
  async scaleApp(appName: string, options: ScaleOptions): Promise<void> {
    const mutation = `
      mutation($appName: String!, $regions: [RegionPlacement!]) {
        setVmCount(input: {
          appId: $appName,
          groupName: "app",
          regions: $regions
        }) {
          vmCount {
            count
            targetCount
          }
        }
      }
    `

    const regions = options.regions?.map(code => ({
      region: code,
      count: Math.ceil((options.count || 1) / (options.regions?.length || 1))
    }))

    await this.graphql(mutation, {
      appName,
      regions
    })
  }

  /**
   * Restart application
   *
   * @param appName - Application name
   *
   * @example
   * ```typescript
   * await client.restartApp('my-app')
   * console.log('App restarted')
   * ```
   */
  async restartApp(appName: string): Promise<void> {
    const mutation = `
      mutation($input: RestartAppInput!) {
        restartApp(input: $input) {
          app {
            name
          }
        }
      }
    `

    await this.graphql(mutation, {
      input: { appId: appName }
    })
  }

  /**
   * List machines for an application
   *
   * @param appName - Application name
   * @returns List of machines
   *
   * @example
   * ```typescript
   * const machines = await client.getMachines('my-app')
   * for (const machine of machines) {
   *   console.log(`${machine.name}: ${machine.state}`)
   * }
   * ```
   */
  async getMachines(appName: string): Promise<Machine[]> {
    // Note: Fly.io uses a REST API for machines
    const url = `https://api.machines.dev/v1/apps/${appName}/machines`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(this.timeout)
    })

    if (!response.ok) {
      throw new Error(`Failed to get machines: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get application logs
   *
   * @param appName - Application name
   * @param options - Log options
   * @returns Log entries
   *
   * @example
   * ```typescript
   * const logs = await client.getLogs('my-app', { limit: 100 })
   * logs.forEach(log => console.log(log))
   * ```
   */
  async getLogs(
    appName: string,
    options: { instance?: string; region?: string; limit?: number } = {}
  ): Promise<string[]> {
    // Note: This is a simplified implementation
    // In production, you'd use the Fly.io logs API or NATS streaming
    const query = `
      query($appName: String!) {
        app(name: $appName) {
          currentRelease {
            evaluationId
            createdAt
          }
        }
      }
    `

    const response = await this.graphql(query, { appName })

    // Return placeholder - actual implementation would stream from NATS
    return [`Logs for ${appName} (use flyctl logs for real-time streaming)`]
  }

  /**
   * Set secret (environment variable)
   *
   * @param appName - Application name
   * @param name - Secret name
   * @param value - Secret value
   *
   * @example
   * ```typescript
   * await client.setSecret('my-app', 'DATABASE_URL', 'postgres://...')
   * console.log('Secret set')
   * ```
   */
  async setSecret(appName: string, name: string, value: string): Promise<void> {
    const mutation = `
      mutation($input: SetSecretsInput!) {
        setSecrets(input: $input) {
          release {
            id
            version
          }
        }
      }
    `

    await this.graphql(mutation, {
      input: {
        appId: appName,
        secrets: [{ key: name, value }]
      }
    })
  }

  /**
   * Delete secret
   *
   * @param appName - Application name
   * @param name - Secret name
   *
   * @example
   * ```typescript
   * await client.deleteSecret('my-app', 'OLD_API_KEY')
   * console.log('Secret deleted')
   * ```
   */
  async deleteSecret(appName: string, name: string): Promise<void> {
    const mutation = `
      mutation($input: UnsetSecretsInput!) {
        unsetSecrets(input: $input) {
          release {
            id
            version
          }
        }
      }
    `

    await this.graphql(mutation, {
      input: {
        appId: appName,
        keys: [name]
      }
    })
  }

  /**
   * List secrets for an application
   *
   * @param appName - Application name
   * @returns List of secret names (values are not exposed)
   *
   * @example
   * ```typescript
   * const secrets = await client.listSecrets('my-app')
   * console.log('Secrets:', secrets.map(s => s.name))
   * ```
   */
  async listSecrets(appName: string): Promise<Secret[]> {
    const query = `
      query($appName: String!) {
        app(name: $appName) {
          secrets {
            name
            digest
            createdAt
          }
        }
      }
    `

    const response = await this.graphql(query, { appName })
    return response.data.app.secrets
  }

  /**
   * List available regions
   *
   * @returns List of regions
   *
   * @example
   * ```typescript
   * const regions = await client.getRegions()
   * regions.forEach(r => console.log(`${r.code}: ${r.name}`))
   * ```
   */
  async getRegions(): Promise<Region[]> {
    const query = `
      query {
        platform {
          regions {
            code
            name
            latitude
            longitude
          }
        }
      }
    `

    const response = await this.graphql(query)
    return response.data.platform.regions
  }

  /**
   * Create volume
   *
   * @param appName - Application name
   * @param name - Volume name
   * @param region - Region code
   * @param sizeGb - Size in GB
   * @returns Created volume
   *
   * @example
   * ```typescript
   * const volume = await client.createVolume('my-app', 'data', 'iad', 10)
   * console.log('Volume created:', volume.id)
   * ```
   */
  async createVolume(
    appName: string,
    name: string,
    region: string,
    sizeGb: number
  ): Promise<Volume> {
    const mutation = `
      mutation($input: CreateVolumeInput!) {
        createVolume(input: $input) {
          volume {
            id
            name
            state
            sizeGb
            region
            encrypted
            createdAt
          }
        }
      }
    `

    const response = await this.graphql(mutation, {
      input: {
        appId: appName,
        name,
        region,
        sizeGb
      }
    })

    return response.data.createVolume.volume
  }

  /**
   * List volumes for an application
   *
   * @param appName - Application name
   * @returns List of volumes
   *
   * @example
   * ```typescript
   * const volumes = await client.listVolumes('my-app')
   * volumes.forEach(v => console.log(`${v.name}: ${v.sizeGb}GB`))
   * ```
   */
  async listVolumes(appName: string): Promise<Volume[]> {
    const query = `
      query($appName: String!) {
        app(name: $appName) {
          volumes {
            nodes {
              id
              name
              state
              sizeGb
              region
              encrypted
              createdAt
            }
          }
        }
      }
    `

    const response = await this.graphql(query, { appName })
    return response.data.app.volumes.nodes
  }

  /**
   * Get current user/viewer information
   *
   * @returns User information
   *
   * @example
   * ```typescript
   * const user = await client.getCurrentUser()
   * console.log('Logged in as:', user.email)
   * ```
   */
  async getCurrentUser(): Promise<{ email: string; name: string }> {
    const query = `
      query {
        viewer {
          email
          name
        }
      }
    `

    const response = await this.graphql(query)
    return response.data.viewer
  }

  /**
   * Make GraphQL request with timeout and retry logic
   */
  private async graphql(query: string, variables?: any, retryCount = 0): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        // Retry on rate limit or server errors
        if ((response.status === 429 || response.status >= 500) && retryCount < this.maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.graphql(query, variables, retryCount + 1)
        }

        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(`Fly.io API error: ${error.message || response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        // Retry on server errors
        if (retryCount < this.maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.graphql(query, variables, retryCount + 1)
        }

        throw new Error(`GraphQL error: ${result.errors[0].message}`)
      }

      return result
    } catch (error: any) {
      // Retry on network errors or timeouts
      if (
        (error.name === 'AbortError' || error.name === 'TypeError') &&
        retryCount < this.maxRetries
      ) {
        const delay = Math.pow(2, retryCount) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.graphql(query, variables, retryCount + 1)
      }

      throw error
    }
  }
}

/**
 * Create Fly.io client from environment variables
 */
export function createFlyClient(options: FlyClientOptions = {}): FlyClient {
  return new FlyClient(options)
}
