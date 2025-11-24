/** @vitest-environment jsdom */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SignupForm } from '../../../CLI/components/auth/SignupForm'

describe('SignupForm', () => {
  it('submits valid data and calls onSuccess', async () => {
    const onSuccess = vi.fn()

    render(<SignupForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/^email/i), {
      target: { value: 'user@example.com' }
    })
    const passwordFields = screen.getAllByLabelText(/password/i)
    fireEvent.change(passwordFields[0], {
      target: { value: 'Password1!' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password1!' }
    })
    fireEvent.click(screen.getByLabelText(/terms/i))

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled(), { timeout: 3000 })
  })

  it('shows validation errors', async () => {
    render(<SignupForm />)

    const passwordFields = screen.getAllByLabelText(/password/i)
    fireEvent.change(passwordFields[0], {
      target: { value: 'short' }
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/password must be at least/i)).toBeInTheDocument()
  })
})
