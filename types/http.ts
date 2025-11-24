export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type QueryParams = Record<string, string | number | boolean>

export type ApiRequestBody =
  | Record<string, unknown>
  | string
  | Blob
  | ArrayBuffer
  | ArrayBufferView
  | FormData
  | URLSearchParams
  | null
  | undefined

export interface AuthConfig {
  type: 'bearer' | 'apiKey' | 'basic'
  token?: string
  key?: string
  value?: string
  username?: string
  password?: string
}

export interface RetryConfig {
  attempts: number
  delayMs: number
  exponentialBackoff?: boolean
}

export type ResponseDataType = 'json' | 'text' | 'blob' | 'arraybuffer'

export interface RequestOptions {
  url: string
  method?: HttpMethod
  headers?: Record<string, string>
  params?: QueryParams
  body?: ApiRequestBody
  auth?: AuthConfig
  timeout?: number
  retry?: RetryConfig
  responseType?: ResponseDataType
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  url: string
  timestamp: Date
}
