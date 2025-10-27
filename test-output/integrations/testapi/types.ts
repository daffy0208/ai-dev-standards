export interface TestapiClientConfig {
  apiKey?: string
  baseUrl?: string
}

export interface TestapiClientResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  // Add more fields based on your API
  [key: string]: any
}

export interface TestapiClientError {
  message: string
  code: string
  details?: any
}

export interface PaginatedTestapiClientResponse {
  data: TestapiClientResponse[]
  total: number
  page: number
  pageSize: number
}
