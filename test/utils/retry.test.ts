import { describe, it, expect, vi } from 'vitest'
import { retryAsync } from '../../src/utils/retry.js'

// ─── Successful execution ─────────────────────────────────
describe('retryAsync - success', () => {
  it('returns ok on first attempt', async () => {
    const result = await retryAsync(() => Promise.resolve(42))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  it('returns ok after retries', async () => {
    let attempt = 0
    const result = await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw new Error('not yet')
      return 'done'
    }, { maxAttempts: 5, maxDelayMs: 1 })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('done')
    expect(attempt).toBe(3)
  })
})

// ─── Failed execution ─────────────────────────────────────
describe('retryAsync - failure', () => {
  it('returns err after max attempts', async () => {
    const result = await retryAsync(async () => {
      throw new Error('always fails')
    }, { maxAttempts: 2, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
  })

  it('uses default maxAttempts of 3', async () => {
    let attempts = 0
    await retryAsync(async () => {
      attempts++
      throw new Error('fail')
    }, { maxDelayMs: 1 })
    expect(attempts).toBe(3)
  })
})

// ─── shouldRetry ──────────────────────────────────────────
describe('retryAsync - shouldRetry', () => {
  it('stops retrying when shouldRetry returns false', async () => {
    let attempts = 0
    const result = await retryAsync(async () => {
      attempts++
      throw new Error('nope')
    }, {
      maxAttempts: 10,
      maxDelayMs: 1,
      shouldRetry: (err) => (err as Error).message !== 'nope',
    })
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(1)
  })
})

// ─── onRetry callback ─────────────────────────────────────
describe('retryAsync - onRetry callback', () => {
  it('calls onRetry for each retry', async () => {
    const calls: number[] = []
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw new Error('retry')
    }, {
      maxAttempts: 5,
      maxDelayMs: 1,
      onRetry: (_err, n) => calls.push(n),
    })
    expect(calls).toEqual([1, 2])
  })
})

// ─── Backoff options ──────────────────────────────────────
describe('retryAsync - backoff options', () => {
  it('respects maxDelayMs', async () => {
    const start = Date.now()
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 2) throw new Error('fail')
    }, { maxAttempts: 3, maxDelayMs: 1 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })

  it('handles jitter option', async () => {
    let attempt = 0
    const result = await retryAsync(async () => {
      attempt++
      if (attempt < 2) throw new Error('fail')
      return 'ok'
    }, { maxAttempts: 3, maxDelayMs: 1, jitter: true })
    expect(result.isOk()).toBe(true)
  })
})

// ─── Edge cases ───────────────────────────────────────────
describe('retryAsync - edge cases', () => {
  it('works with maxAttempts of 1', async () => {
    const result = await retryAsync(() => Promise.resolve('instant'), { maxAttempts: 1 })
    expect(result.unwrap()).toBe('instant')
  })

  it('returns err immediately on single attempt failure', async () => {
    const result = await retryAsync(() => Promise.reject(new Error('once')), { maxAttempts: 1, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
  })
})
