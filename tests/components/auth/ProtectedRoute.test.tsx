/** @vitest-environment jsdom */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'

const { mockRouter, mockRedirect } = vi.hoisted(() => ({
  mockRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn()
  },
  mockRedirect: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/dashboard',
  redirect: mockRedirect
}))

type ProtectedRouteModuleType = typeof import('../../../CLI/components/auth/ProtectedRoute')
let ProtectedRouteModule: ProtectedRouteModuleType

beforeAll(async () => {
  ProtectedRouteModule = await import('../../../CLI/components/auth/ProtectedRoute')
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', async () => {
    vi.spyOn(ProtectedRouteModule.authAdapter, 'getCurrentUser').mockResolvedValue({
      email: 'user@example.com',
      roles: ['member']
    })

    render(
      <ProtectedRouteModule.ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRouteModule.ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Secret content')).toBeInTheDocument()
    })
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('redirects to login when unauthenticated', async () => {
    vi.spyOn(ProtectedRouteModule.authAdapter, 'getCurrentUser').mockResolvedValue(null)

    render(
      <ProtectedRouteModule.ProtectedRoute>
        <div>Hidden</div>
      </ProtectedRouteModule.ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login?returnUrl=%2Fdashboard')
    })
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('invokes onUnauthorized when role requirement fails', async () => {
    vi.spyOn(ProtectedRouteModule.authAdapter, 'getCurrentUser').mockResolvedValue({
      email: 'user@example.com',
      roles: []
    })
    vi.spyOn(ProtectedRouteModule.authAdapter, 'hasRole').mockReturnValue(false)
    const onUnauthorized = vi.fn()

    render(
      <ProtectedRouteModule.ProtectedRoute requiredRole="admin" onUnauthorized={onUnauthorized}>
        <div>Admin Area</div>
      </ProtectedRouteModule.ProtectedRoute>
    )

    await waitFor(() => {
      expect(onUnauthorized).toHaveBeenCalled()
    })
    expect(mockRouter.push).not.toHaveBeenCalledWith('/unauthorized')
  })
})

describe('ProtectedLayout', () => {
  it('redirects to login when no server user exists', async () => {
    vi.spyOn(ProtectedRouteModule.authAdapter, 'getCurrentUser').mockResolvedValue(null)
    await ProtectedRouteModule.ProtectedLayout({ children: <div>Server Child</div> })
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
  })

  it('renders children when server auth passes', async () => {
    vi.spyOn(ProtectedRouteModule.authAdapter, 'getCurrentUser').mockResolvedValue({
      email: 'admin@example.com',
      roles: ['admin']
    })
    const result = await ProtectedRouteModule.ProtectedLayout({
      children: <div>Server Content</div>,
      requiredRole: 'admin'
    })

    expect(result).toMatchInlineSnapshot(`
      <React.Fragment>
        <div>
          Server Content
        </div>
      </React.Fragment>
    `)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to unauthorized when role check fails server-side', async () => {
    vi.spyOn(ProtectedRouteModule.authAdapter, 'getCurrentUser').mockResolvedValue({
      email: 'user@example.com',
      roles: []
    })
    vi.spyOn(ProtectedRouteModule.authAdapter, 'hasRole').mockReturnValue(false)
    await ProtectedRouteModule.ProtectedLayout({
      children: <div>Server Content</div>,
      requiredRole: 'admin'
    })

    expect(mockRedirect).toHaveBeenCalledWith('/unauthorized')
  })
})
