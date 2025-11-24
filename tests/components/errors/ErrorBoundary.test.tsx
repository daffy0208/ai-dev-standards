/** @vitest-environment jsdom */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ErrorBoundary } from '../../../CLI/components/errors/ErrorBoundary'

function Boom(): null {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders fallback when child throws', () => {
    const fallback = <div data-testid="fallback">Something went wrong</div>

    render(
      <ErrorBoundary fallback={fallback}>
        <Boom />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })
})
