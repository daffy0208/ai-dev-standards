/** @vitest-environment jsdom */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useForm } from '../../../CLI/components/forms/useForm'
import { z } from 'zod'

describe('useForm hook', () => {
  const schema = z.object({
    email: z.string().email()
  })

  it('validates and submits data', async () => {
    const onSubmit = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useForm({ schema, onSubmit, onError }))

    act(() => {
      result.current.register('email').onChange({
        target: { value: 'invalid', type: 'text' }
      } as any)
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any)
    })

    expect(onSubmit).not.toHaveBeenCalled()

    act(() => {
      result.current.register('email').onChange({
        target: { value: 'user@example.com', type: 'text' }
      } as any)
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any)
    })

    expect(onSubmit).toHaveBeenCalled()
  })
})
