/** @vitest-environment jsdom */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Spinner,
  LoadingButton,
  LoadingOverlay,
  InlineLoading
} from '../../../CLI/components/feedback/LoadingSpinner'

describe('Loading spinner components', () => {
  it('renders basic spinner with accessible label', () => {
    render(<Spinner size="sm" color="red" />)

    const spinner = screen.getByRole('status', { name: /loading/i })
    expect(spinner.className).toContain('border-red-500')
  })

  it('disables button and shows spinner when loading', () => {
    render(<LoadingButton loading>Submit</LoadingButton>)

    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toBeDisabled()
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
  })

  it('renders children when button not loading', () => {
    render(<LoadingButton loading={false}>Continue</LoadingButton>)

    const button = screen.getByRole('button', { name: /continue/i })
    expect(button).not.toBeDisabled()
    expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
  })

  it('shows overlay and inline loading messages', () => {
    render(
      <>
        <LoadingOverlay message="Syncing..." />
        <InlineLoading text="Preparing data..." size="lg" />
      </>
    )

    expect(screen.getByText('Syncing...')).toBeInTheDocument()
    expect(screen.getByText('Preparing data...')).toBeInTheDocument()
  })
})
