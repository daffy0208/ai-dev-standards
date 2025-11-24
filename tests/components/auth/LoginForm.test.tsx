/** @vitest-environment jsdom */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from '../../../CLI/components/auth/LoginForm'

describe('LoginForm', () => {
  it('submits valid credentials and calls onSuccess', async () => {
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} showOAuth={false} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password1' }
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled(), { timeout: 3000 })
  })

  it('shows validation errors for invalid fields', async () => {
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} showOAuth={false} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'short' }
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByText(/invalid email address/i, {}, { timeout: 3000 })
    ).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
