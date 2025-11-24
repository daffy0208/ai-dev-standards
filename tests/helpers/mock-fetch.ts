import { vi } from 'vitest'
import type { Mock } from 'vitest'

export type FetchMock = Mock<[RequestInfo | URL, RequestInit?], Promise<Response>>

export interface MockResponseInit {
  status?: number
  statusText?: string
  headers?: HeadersInit
  url?: string
  textBody?: string
}

export const createFetchMock = (): FetchMock =>
  vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>()

export const assignFetchMock = (mock: FetchMock): FetchMock => {
  global.fetch = mock as unknown as typeof fetch
  return mock
}

export const getFetchMock = (): FetchMock => {
  if (!global.fetch) {
    throw new Error('global.fetch has not been initialized in this test')
  }
  return global.fetch as FetchMock
}

export const mockResolvedFetch = (response: Response): FetchMock => {
  const mock = createFetchMock()
  mock.mockResolvedValue(response)
  return assignFetchMock(mock)
}

export const mockRejectedFetch = (error: unknown): FetchMock => {
  const mock = createFetchMock()
  mock.mockRejectedValue(error)
  return assignFetchMock(mock)
}

export function createJsonResponse<T>(data: T, init: MockResponseInit = {}): Response {
  const status = init.status ?? 200
  const statusText = init.statusText ?? (status >= 200 && status < 300 ? 'OK' : 'Error')
  const headers = new Headers(init.headers ?? { 'Content-Type': 'application/json' })
  const url = init.url ?? 'https://api.example.com/mock'
  const textBody = init.textBody ?? JSON.stringify(data)

  const response: Partial<Response> = {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers,
    url,
    redirected: false,
    type: 'default',
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new TextEncoder().encode(textBody).buffer,
    blob: async () =>
      new Blob([textBody], { type: headers.get('Content-Type') ?? 'application/json' }),
    formData: async () => new FormData(),
    json: async () => data,
    text: async () => textBody,
    clone: () => createJsonResponse(data, init)
  }

  return response as Response
}
