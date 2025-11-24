/** @vitest-environment jsdom */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ToastProviderWithEvents, toast } from '../../../CLI/components/feedback/Toast'

describe('ToastProvider', () => {
  it('renders toast when event dispatched', async () => {
    render(
      <ToastProviderWithEvents>
        <div>children</div>
      </ToastProviderWithEvents>
    )

    act(() => {
      toast.success('Saved successfully')
    })

    expect(await screen.findByText(/saved successfully/i)).toBeInTheDocument()
  })
})
