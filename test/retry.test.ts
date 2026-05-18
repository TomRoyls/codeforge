import { describe, expect, it, vi } from 'vitest'

import { retryAsync, type RetryOptions } from '../src/utils/retry.js'

// ─── retryAsync - success cases ────────────────────────
describe('retryAsync - success cases', () => {
  it('returns ok on first successful attempt', async () => {
    const result = await retryAsync(() => Promise.resolve(42))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  it('returns ok after transient failure', async () => {
    let attempt = 0
    const fn = () => {
      attempt++
      if (attempt < 3) return Promise.reject(new Error('fail'))
      return Promise.resolve('done')
    }
    const onRetry = vi.fn()
    const result = await retryAsync(fn, { maxAttempts: 3, onRetry })

    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('done')
    expect(onRetry).toHaveBeenCalledTimes(2)
  })
})

// ─── retryAsync - failure cases ────────────────────────
describe('retryAsync - failure cases', () => {
  it('returns err when all attempts fail', async () => {
    const fn = () => Promise.reject(new Error('always fails'))
    const result = await retryAsync(fn, { maxAttempts: 2 })

    expect(result.isErr()).toBe(true)
  })

  it('respects maxAttempts default of 3', async () => {
    let attempts = 0
    const fn = () => {
      attempts++
      return Promise.reject(new Error('fail'))
    }
    await retryAsync(fn)
    expect(attempts).toBe(3)
  })
})

// ─── retryAsync - shouldRetry ──────────────────────────
describe('retryAsync - shouldRetry', () => {
  it('stops retrying when shouldRetry returns false', async () => {
    let attempts = 0
    const fn = () => {
      attempts++
      return Promise.reject(new Error('nope'))
    }
    const result = await retryAsync(fn, {
      maxAttempts: 5,
      shouldRetry: (err) => (err as Error).message !== 'nope',
    })

    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(1)
  })

  it('continues retrying when shouldRetry returns true', async () => {
    let attempts = 0
    const fn = () => {
      attempts++
      return Promise.reject(new Error('retry me'))
    }
    await retryAsync(fn, {
      maxAttempts: 3,
      shouldRetry: () => true,
    })
    expect(attempts).toBe(3)
  })
})

// ─── retryAsync - options ──────────────────────────────
describe('retryAsync - options', () => {
  it('calls onRetry callback with error and attempt number', async () => {
    let attempt = 0
    const fn = () => {
      attempt++
      if (attempt < 3) return Promise.reject(new Error('fail'))
      return Promise.resolve('ok')
    }
    const onRetry = vi.fn()
    await retryAsync(fn, { maxAttempts: 3, onRetry })

    expect(onRetry).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1)
    expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2)
  })

  it('does not call onRetry on success', async () => {
    const onRetry = vi.fn()
    await retryAsync(() => Promise.resolve(1), { onRetry })
    expect(onRetry).not.toHaveBeenCalled()
  })
})
