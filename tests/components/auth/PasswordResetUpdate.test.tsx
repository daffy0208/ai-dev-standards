/** @vitest-environment jsdom */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PasswordResetUpdate } from '../../../CLI/components/auth/PasswordReset'

describe('PasswordResetUpdate', () => {
  it('validates matching passwords', async () => {
    const onSuccess = vi.fn()
    render(<PasswordResetUpdate onSuccess={onSuccess} />)

    const passwordFields = screen.getAllByLabelText(/password/i)
    fireEvent.change(passwordFields[0], {
      target: { value: 'Password1!' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password2!' }
    })

    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
