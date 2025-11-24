/** @vitest-environment jsdom */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ErrorFallback } from '../../../CLI/components/errors/ErrorFallback'

const noop = () => {}

describe('ErrorFallback', () => {
  it('renders error message and retry button', () => {
    render(<ErrorFallback error="Something went wrong" onRetry={noop} />)

    const errorTexts = screen.getAllByText(/something went wrong/i)
    expect(errorTexts.length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
