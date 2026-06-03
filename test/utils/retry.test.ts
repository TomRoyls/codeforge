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

  it('onRetry receives the error', async () => {
    const errors: string[] = []
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 2) throw new Error(`err-${attempt}`)
    }, {
      maxAttempts: 3,
      maxDelayMs: 1,
      onRetry: (err) => errors.push((err as Error).message),
    })
    expect(errors).toEqual(['err-1'])
  })

  it('shouldRetry can allow selective retries', async () => {
    let attempts = 0
    const result = await retryAsync(async () => {
      attempts++
      if (attempts === 1) throw new Error('retryable')
      if (attempts === 2) throw new Error('fatal')
    }, {
      maxAttempts: 10,
      maxDelayMs: 1,
      shouldRetry: (err) => (err as Error).message === 'retryable',
    })
    expect(result.isErr()).toBe(true)
    result.match(
      () => {},
      (err) => expect((err as Error).message).toBe('fatal'),
    )
    expect(attempts).toBe(2)
  })

  it('respects backoffFactor', async () => {
    const start = Date.now()
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw new Error('fail')
    }, { maxAttempts: 5, maxDelayMs: 50, backoffFactor: 1 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  it('handles fn returning undefined', async () => {
    const result = await retryAsync(async () => undefined, { maxAttempts: 1 })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBeUndefined()
  })

  it('handles fn returning null', async () => {
    const result = await retryAsync(async () => null, { maxAttempts: 1 })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBeNull()
  })

  it('handles zero maxDelayMs', async () => {
    let attempt = 0
    const result = await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw new Error('fail')
      return 'done'
    }, { maxAttempts: 5, maxDelayMs: 0 })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('done')
  })

  it('tracks attempt count via onRetry', async () => {
    let retryCount = 0
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw new Error('fail')
    }, { maxAttempts: 5, maxDelayMs: 1, onRetry: () => { retryCount++ } })
    expect(retryCount).toBe(2)
  })

  it('resolves immediately on first success', async () => {
    let calls = 0
    const result = await retryAsync(async () => {
      calls++
      return 'ok'
    }, { maxAttempts: 3, maxDelayMs: 1 })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('ok')
    expect(calls).toBe(1)
  })

  it('retries on error then succeeds', async () => {
    let calls = 0
    const result = await retryAsync(() => {
      calls++
      if (calls < 2) throw new Error('fail')
      return 'ok'
    }, { maxRetries: 2, delay: 1 })
    expect(result.isOk()).toBe(true)
    expect(calls).toBe(2)
  })

  it('immediate success on first try', async () => {
    let calls = 0
    const result = await retryAsync(() => {
      calls++
      return Promise.resolve('ok')
    }, { maxRetries: 3, delay: 1 })
    expect(result.isOk()).toBe(true)
    expect(calls).toBe(1)
  })

  it('retries on failure then succeeds', async () => {
    let calls = 0
    const result = await retryAsync(async () => {
      calls++
      if (calls < 2) throw new Error('fail')
      return 'ok'
    }, { maxRetries: 3, delay: 1 })
    expect(result.isOk()).toBe(true)
    expect(calls).toBe(2)
  })

  it('retries up to max attempts then fails', async () => {
    let calls = 0
    const result = await retryAsync(async () => {
      calls++
      throw new Error('always fail')
    }, { maxRetries: 2, delay: 1 })
    expect(result.isErr()).toBe(true)
    expect(calls).toBe(3)
  })
})
