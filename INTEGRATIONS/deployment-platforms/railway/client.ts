/**
 * Railway API Client
 *
 * Integration for Railway deployment platform API.
 *
 * Features:
 * - Deploy projects
 * - Manage services
 * - Environment variables
 * - Deployment status
 * - Logs
 * - Database provisioning
 *
 * @example
 * ```typescript
 * const client = new RailwayClient({
 *   token: process.env.RAILWAY_TOKEN
 * })
 *
 * // Deploy service
 * const deployment = await client.deployService({
 *   projectId: 'proj_xxx',
 *   serviceId: 'serv_xxx',
 *   environmentId: 'env_xxx'
 * })
 *
 * // Get deployment status
 * const status = await client.getDeployment(deployment.id)
 * console.log(status.status) // 'SUCCESS', 'BUILDING', 'FAILED'
 * ```
 */

export interface RailwayClientOptions {
  /**
   * Railway API token
   */
  token?: string

  /**
   * API base URL
   */
  apiUrl?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
}

export interface Service {
  id: string
  name: string
  projectId: string
  createdAt: string
}

export interface Environment {
  id: string
  name: string
  projectId: string
}

export interface Deployment {
  id: string
  status: 'SUCCESS' | 'BUILDING' | 'FAILED' | 'CRASHED' | 'REMOVED'
  createdAt: string
  finishedAt?: string
  url?: string
}

export interface Variable {
  name: string
  value: string
}

export interface DeployServiceOptions {
  projectId: string
  serviceId: string
  environmentId: string
  variables?: Record<string, string>
}

export class RailwayClient {
  private token: string
  private apiUrl: string

  constructor(options: RailwayClientOptions = {}) {
    this.token = options.token || process.env.RAILWAY_TOKEN || ''
    this.apiUrl = options.apiUrl || 'https://backboard.railway.app/graphql/v2'

    if (!this.token) {
      throw new Error('Railway token is required')
    }
  }

  /**
   * List projects
   */
  async listProjects(): Promise<Project[]> {
    const query = `
      query {
        projects {
          edges {
            node {
              id
              name
              description
              createdAt
            }
          }
        }
      }
    `

    const response = await this.graphql(query)
    return response.data.projects.edges.map((edge: any) => edge.node)
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    const query = `
      query($projectId: String!) {
        project(id: $projectId) {
          id
          name
          description
          createdAt
        }
      }
    `

    const response = await this.graphql(query, { projectId })
    return response.data.project
  }

  /**
   * Create project
   */
  async createProject(name: string, description?: string): Promise<Project> {
    const mutation = `
      mutation($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          id
          name
          description
          createdAt
        }
      }
    `

    const response = await this.graphql(mutation, {
      input: { name, description },
    })
    return response.data.projectCreate
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    const mutation = `
      mutation($projectId: String!) {
        projectDelete(id: $projectId)
      }
    `

    await this.graphql(mutation, { projectId })
  }

  /**
   * List services in project
   */
  async listServices(projectId: string): Promise<Service[]> {
    const query = `
      query($projectId: String!) {
        project(id: $projectId) {
          services {
            edges {
              node {
                id
                name
                createdAt
              }
            }
          }
        }
      }
    `

    const response = await this.graphql(query, { projectId })
    return response.data.project.services.edges.map((edge: any) => ({
      ...edge.node,
      projectId,
    }))
  }

  /**
   * Create service
   */
  async createService(
    projectId: string,
    name: string,
    options?: {
      source?: {
        repo: string
        branch?: string
      }
    }
  ): Promise<Service> {
    const mutation = `
      mutation($input: ServiceCreateInput!) {
        serviceCreate(input: $input) {
          id
          name
          createdAt
        }
      }
    `

    const response = await this.graphql(mutation, {
      input: {
        projectId,
        name,
        ...options,
      },
    })

    return {
      ...response.data.serviceCreate,
      projectId,
    }
  }

  /**
   * Delete service
   */
  async deleteService(serviceId: string): Promise<void> {
    const mutation = `
      mutation($serviceId: String!) {
        serviceDelete(id: $serviceId)
      }
    `

    await this.graphql(mutation, { serviceId })
  }

  /**
   * Deploy service
   */
  async deployService(options: DeployServiceOptions): Promise<Deployment> {
    const mutation = `
      mutation($input: ServiceInstanceDeployInput!) {
        serviceInstanceDeploy(input: $input) {
          id
          status
          createdAt
        }
      }
    `

    const response = await this.graphql(mutation, {
      input: {
        serviceId: options.serviceId,
        environmentId: options.environmentId,
      },
    })

    return response.data.serviceInstanceDeploy
  }

  /**
   * Get deployment
   */
  async getDeployment(deploymentId: string): Promise<Deployment> {
    const query = `
      query($deploymentId: String!) {
        deployment(id: $deploymentId) {
          id
          status
          createdAt
          finishedAt
          url
        }
      }
    `

    const response = await this.graphql(query, { deploymentId })
    return response.data.deployment
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    const query = `
      query($deploymentId: String!) {
        deploymentLogs(deploymentId: $deploymentId) {
          logs
        }
      }
    `

    const response = await this.graphql(query, { deploymentId })
    return response.data.deploymentLogs.logs
  }

  /**
   * List environment variables
   */
  async listVariables(
    projectId: string,
    environmentId: string
  ): Promise<Variable[]> {
    const query = `
      query($projectId: String!, $environmentId: String!) {
        variables(projectId: $projectId, environmentId: $environmentId) {
          edges {
            node {
              name
              value
            }
          }
        }
      }
    `

    const response = await this.graphql(query, { projectId, environmentId })
    return response.data.variables.edges.map((edge: any) => edge.node)
  }

  /**
   * Set environment variable
   */
  async setVariable(
    projectId: string,
    environmentId: string,
    name: string,
    value: string
  ): Promise<void> {
    const mutation = `
      mutation($input: VariableUpsertInput!) {
        variableUpsert(input: $input) {
          name
          value
        }
      }
    `

    await this.graphql(mutation, {
      input: {
        projectId,
        environmentId,
        name,
        value,
      },
    })
  }

  /**
   * Delete environment variable
   */
  async deleteVariable(
    projectId: string,
    environmentId: string,
    name: string
  ): Promise<void> {
    const mutation = `
      mutation($input: VariableDeleteInput!) {
        variableDelete(input: $input)
      }
    `

    await this.graphql(mutation, {
      input: {
        projectId,
        environmentId,
        name,
      },
    })
  }

  /**
   * Provision database
   */
  async provisionDatabase(
    projectId: string,
    type: 'postgres' | 'mysql' | 'mongodb' | 'redis'
  ): Promise<Service> {
    const mutation = `
      mutation($input: PluginCreateInput!) {
        pluginCreate(input: $input) {
          id
          name
          createdAt
        }
      }
    `

    const response = await this.graphql(mutation, {
      input: {
        projectId,
        type,
      },
    })

    return {
      ...response.data.pluginCreate,
      projectId,
    }
  }

  /**
   * Make GraphQL request
   */
  private async graphql(query: string, variables?: any): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Railway API error: ${error.message || response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0].message}`)
    }

    return result
  }
}

/**
 * Create Railway client from environment variables
 */
export function createRailwayClient(options: RailwayClientOptions = {}): RailwayClient {
  return new RailwayClient(options)
}
