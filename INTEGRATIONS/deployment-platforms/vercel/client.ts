/**
 * Vercel API Client
 *
 * Integration for Vercel deployment platform API.
 *
 * Features:
 * - Deploy projects
 * - Manage domains
 * - Environment variables
 * - Deployment status
 * - Logs and analytics
 * - Team management
 *
 * @example
 * ```typescript
 * const client = new VercelClient({
 *   token: process.env.VERCEL_TOKEN,
 *   teamId: process.env.VERCEL_TEAM_ID
 * })
 *
 * // Create deployment
 * const deployment = await client.createDeployment({
 *   name: 'my-app',
 *   gitSource: {
 *     type: 'github',
 *     repo: 'user/repo',
 *     ref: 'main'
 *   }
 * })
 *
 * // Get deployment status
 * const status = await client.getDeployment(deployment.id)
 * console.log(status.state) // 'READY', 'BUILDING', 'ERROR'
 * ```
 */

export interface VercelClientOptions {
  /**
   * Vercel API token
   */
  token?: string

  /**
   * Team ID (optional)
   */
  teamId?: string

  /**
   * API base URL
   */
  apiUrl?: string
}

export interface GitSource {
  type: 'github' | 'gitlab' | 'bitbucket'
  repo: string
  ref?: string
}

export interface CreateDeploymentOptions {
  /**
   * Project name
   */
  name: string

  /**
   * Git source
   */
  gitSource?: GitSource

  /**
   * Environment variables
   */
  env?: Record<string, string>

  /**
   * Build command
   */
  buildCommand?: string

  /**
   * Output directory
   */
  outputDirectory?: string

  /**
   * Target (production/preview)
   */
  target?: 'production' | 'preview'
}

export interface Deployment {
  id: string
  url: string
  name: string
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  createdAt: number
  buildingAt?: number
  readyAt?: number
  target: 'production' | 'preview'
  alias?: string[]
}

export interface Project {
  id: string
  name: string
  framework: string
  latestDeployments: Deployment[]
  env: Record<string, string>
  targets?: {
    production?: { domain: string }
  }
}

export interface Domain {
  name: string
  verified: boolean
  verificationRecord?: string
}

export interface EnvironmentVariable {
  key: string
  value: string
  target: Array<'production' | 'preview' | 'development'>
  type: 'encrypted' | 'plain'
}

export class VercelClient {
  private token: string
  private teamId?: string
  private apiUrl: string

  constructor(options: VercelClientOptions = {}) {
    this.token = options.token || process.env.VERCEL_TOKEN || ''
    this.teamId = options.teamId || process.env.VERCEL_TEAM_ID
    this.apiUrl = options.apiUrl || 'https://api.vercel.com'

    if (!this.token) {
      throw new Error('Vercel token is required')
    }
  }

  /**
   * Create a deployment
   */
  async createDeployment(options: CreateDeploymentOptions): Promise<Deployment> {
    const body: any = {
      name: options.name,
      target: options.target || 'preview',
    }

    if (options.gitSource) {
      body.gitSource = options.gitSource
    }

    if (options.env) {
      body.env = options.env
    }

    if (options.buildCommand) {
      body.buildCommand = options.buildCommand
    }

    if (options.outputDirectory) {
      body.outputDirectory = options.outputDirectory
    }

    const response = await this.request('POST', '/v13/deployments', body)
    return response
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<Deployment> {
    return this.request('GET', `/v13/deployments/${deploymentId}`)
  }

  /**
   * List deployments for a project
   */
  async listDeployments(projectName: string): Promise<Deployment[]> {
    const response = await this.request('GET', '/v6/deployments', {
      projectId: projectName,
    })
    return response.deployments
  }

  /**
   * Cancel a deployment
   */
  async cancelDeployment(deploymentId: string): Promise<void> {
    await this.request('PATCH', `/v12/deployments/${deploymentId}/cancel`)
  }

  /**
   * Delete a deployment
   */
  async deleteDeployment(deploymentId: string): Promise<void> {
    await this.request('DELETE', `/v13/deployments/${deploymentId}`)
  }

  /**
   * Get project by name
   */
  async getProject(projectName: string): Promise<Project> {
    return this.request('GET', `/v9/projects/${projectName}`)
  }

  /**
   * Create project
   */
  async createProject(options: {
    name: string
    framework?: string
    gitRepository?: GitSource
  }): Promise<Project> {
    return this.request('POST', '/v9/projects', options)
  }

  /**
   * Update project
   */
  async updateProject(
    projectName: string,
    updates: Partial<{
      framework: string
      buildCommand: string
      outputDirectory: string
    }>
  ): Promise<Project> {
    return this.request('PATCH', `/v9/projects/${projectName}`, updates)
  }

  /**
   * Delete project
   */
  async deleteProject(projectName: string): Promise<void> {
    await this.request('DELETE', `/v9/projects/${projectName}`)
  }

  /**
   * List projects
   */
  async listProjects(): Promise<Project[]> {
    const response = await this.request('GET', '/v9/projects')
    return response.projects
  }

  /**
   * Add domain to project
   */
  async addDomain(projectName: string, domain: string): Promise<Domain> {
    return this.request('POST', `/v9/projects/${projectName}/domains`, {
      name: domain,
    })
  }

  /**
   * Remove domain from project
   */
  async removeDomain(projectName: string, domain: string): Promise<void> {
    await this.request('DELETE', `/v9/projects/${projectName}/domains/${domain}`)
  }

  /**
   * List domains for project
   */
  async listDomains(projectName: string): Promise<Domain[]> {
    const response = await this.request('GET', `/v9/projects/${projectName}/domains`)
    return response.domains
  }

  /**
   * Get environment variables
   */
  async getEnvVars(projectName: string): Promise<EnvironmentVariable[]> {
    const response = await this.request('GET', `/v9/projects/${projectName}/env`)
    return response.envs
  }

  /**
   * Create environment variable
   */
  async createEnvVar(
    projectName: string,
    options: {
      key: string
      value: string
      target: Array<'production' | 'preview' | 'development'>
      type?: 'encrypted' | 'plain'
    }
  ): Promise<EnvironmentVariable> {
    return this.request('POST', `/v10/projects/${projectName}/env`, options)
  }

  /**
   * Update environment variable
   */
  async updateEnvVar(
    projectName: string,
    envId: string,
    updates: {
      value?: string
      target?: Array<'production' | 'preview' | 'development'>
    }
  ): Promise<EnvironmentVariable> {
    return this.request('PATCH', `/v9/projects/${projectName}/env/${envId}`, updates)
  }

  /**
   * Delete environment variable
   */
  async deleteEnvVar(projectName: string, envId: string): Promise<void> {
    await this.request('DELETE', `/v9/projects/${projectName}/env/${envId}`)
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    const response = await this.request('GET', `/v2/deployments/${deploymentId}/events`)
    return response.map((event: any) => event.text).filter(Boolean)
  }

  /**
   * Get deployment files
   */
  async getDeploymentFiles(deploymentId: string): Promise<Array<{ name: string; size: number }>> {
    const response = await this.request('GET', `/v6/deployments/${deploymentId}/files`)
    return response
  }

  /**
   * Make API request
   */
  private async request(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const url = new URL(endpoint, this.apiUrl)

    // Add team ID if present
    if (this.teamId) {
      url.searchParams.append('teamId', this.teamId)
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body && ['POST', 'PATCH', 'PUT'].includes(method)) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url.toString(), options)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Vercel API error: ${error.message || response.statusText}`)
    }

    // Some endpoints return 204 No Content
    if (response.status === 204) {
      return null
    }

    return response.json()
  }
}

/**
 * Create Vercel client from environment variables
 */
export function createVercelClient(options: VercelClientOptions = {}): VercelClient {
  return new VercelClient(options)
}
