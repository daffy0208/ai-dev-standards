import { TestapiClientConfig, TestapiClientResponse } from './types'

export class TestapiClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: TestapiClientConfig) {
    this.apiKey = config.apiKey || process.env.TESTAPI_API_KEY || ''
    this.baseUrl = config.baseUrl || process.env.TESTAPI_API_URL || 'https://api.testapi.com'

    if (!this.apiKey) {
      throw new Error('testapi API key is required')
    }
  }

  /**
   * Make API request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Convert Headers instance to plain object if needed
    const optionsHeaders =
      options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : options.headers || {}

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...optionsHeaders,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`testapi API error: ${error.message}`)
    }

    // FIX: Handle 204 No Content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null
    }

    return response.json()
  }

  /**
   * Example method - customize based on your integration
   */
  async getData(id: string): Promise<TestapiClientResponse> {
    return this.request<TestapiClientResponse>(`/data/${id}`)
  }

  /**
   * Example POST method
   */
  async createData(data: Partial<TestapiClientResponse>): Promise<TestapiClientResponse> {
    return this.request<TestapiClientResponse>('/data', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Example UPDATE method
   */
  async updateData(
    id: string,
    data: Partial<TestapiClientResponse>
  ): Promise<TestapiClientResponse> {
    return this.request<TestapiClientResponse>(`/data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Example DELETE method
   */
  async deleteData(id: string): Promise<void> {
    // FIX: DELETE may return null for 204 responses
    await this.request<void | null>(`/data/${id}`, {
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const testapiClient = new TestapiClient({
  apiKey: process.env.TESTAPI_API_KEY,
  baseUrl: process.env.TESTAPI_API_URL,
})
