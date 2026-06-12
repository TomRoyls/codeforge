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

  it('succeeds on first try', async () => {
    let calls = 0
    const result = await retryAsync(async () => {
      calls++
      return 42
    }, { maxRetries: 2, delay: 1 })
    expect(result.isOk()).toBe(true)
    expect(calls).toBe(1)
  })

  it('retries on failure and succeeds', async () => {
    let calls = 0
    const result = await retryAsync(async () => {
      calls++
      if (calls < 2) throw new Error('fail')
      return 'ok'
    }, { maxRetries: 2, delay: 1 })
    expect(result.isOk()).toBe(true)
    expect(calls).toBe(2)
  })

  it('throws on non-error values', async () => {
    const result = await retryAsync(async () => {
      throw 'string error'
    }, { maxAttempts: 2, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
  })

  it('handles throwing null', async () => {
    const result = await retryAsync(async () => {
      throw null
    }, { maxAttempts: 2, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
  })

  it('handles throwing undefined', async () => {
    const result = await retryAsync(async () => {
      throw undefined
    }, { maxAttempts: 2, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
  })

  it('handles throwing object', async () => {
    const result = await retryAsync(async () => {
      throw { code: 'ERR_CODE', message: 'Custom error' }
    }, { maxAttempts: 2, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
  })

  it('respects custom backoffFactor of 3', async () => {
    const start = Date.now()
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw new Error('fail')
    }, { maxAttempts: 4, maxDelayMs: 500, backoffFactor: 3 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(0)
    expect(elapsed).toBeLessThan(5000)
  })

  it('handles very large maxDelayMs', async () => {
    let attempt = 0
    const result = await retryAsync(async () => {
      attempt++
      if (attempt < 2) throw new Error('fail')
      return 'ok'
    }, { maxAttempts: 3, maxDelayMs: 1000000 })
    expect(result.isOk()).toBe(true)
  })

  it('handles shouldRetry returning true for all errors', async () => {
    let attempts = 0
    const result = await retryAsync(async () => {
      attempts++
      if (attempts < 2) throw new Error('retryable')
      return 'success'
    }, {
      maxAttempts: 5,
      maxDelayMs: 1,
      shouldRetry: () => true,
    })
    expect(result.isOk()).toBe(true)
    expect(attempts).toBe(2)
  })

  it('handles shouldRetry returning false for all errors', async () => {
    let attempts = 0
    const result = await retryAsync(async () => {
      attempts++
      throw new Error('always fail')
    }, {
      maxAttempts: 5,
      maxDelayMs: 1,
      shouldRetry: () => false,
    })
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(1)
  })

  it('shouldRetry with string error', async () => {
    let attempts = 0
    const result = await retryAsync(async () => {
      attempts++
      throw 'string error'
    }, {
      maxAttempts: 5,
      maxDelayMs: 1,
      shouldRetry: (err) => err !== 'fatal',
    })
    expect(result.isErr()).toBe(true)
  })

  it('shouldRetry with object error', async () => {
    let attempts = 0
    const result = await retryAsync(async () => {
      attempts++
      throw { code: 'ECONNREFUSED' }
    }, {
      maxAttempts: 5,
      maxDelayMs: 1,
      shouldRetry: (err) => (err as { code: string }).code !== 'EFATAL',
    })
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(5)
  })

  it('onRetry receives correct attempt numbers', async () => {
    const attempts: number[] = []
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 4) throw new Error('fail')
      return 'ok'
    }, {
      maxAttempts: 5,
      maxDelayMs: 1,
      onRetry: (err, n) => attempts.push(n),
    })
    expect(attempts).toEqual([1, 2, 3])
  })

  it('onRetry not called on success', async () => {
    let called = false
    await retryAsync(async () => 'success', {
      maxAttempts: 3,
      maxDelayMs: 1,
      onRetry: () => { called = true },
    })
    expect(called).toBe(false)
  })

  it('handles maxAttempts of 2 with one failure', async () => {
    let calls = 0
    const result = await retryAsync(async () => {
      calls++
      if (calls === 1) throw new Error('fail')
      return 'ok'
    }, { maxAttempts: 2, maxDelayMs: 1 })
    expect(result.isOk()).toBe(true)
    expect(calls).toBe(2)
  })

  it('handles maxAttempts of 2 with two failures', async () => {
    let calls = 0
    const result = await retryAsync(async () => {
      calls++
      throw new Error('fail')
    }, { maxAttempts: 2, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
    expect(calls).toBe(2)
  })

  it('returns last error after all retries', async () => {
    let attempt = 0
    const result = await retryAsync(async () => {
      attempt++
      throw new Error(`attempt-${attempt}`)
    }, { maxAttempts: 3, maxDelayMs: 1 })
    expect(result.isErr()).toBe(true)
    result.match(
      () => {},
      (err) => expect((err as Error).message).toBe('attempt-3'),
    )
  })

  it('handles function returning Promise.reject', async () => {
    const result = await retryAsync(() => Promise.reject(new Error('reject')), {
      maxAttempts: 2,
      maxDelayMs: 1,
    })
    expect(result.isErr()).toBe(true)
  })

  it('handles function returning Promise.resolve with error object', async () => {
    const result = await retryAsync(() => Promise.resolve(new Error('error')), {
      maxAttempts: 1,
    })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBeInstanceOf(Error)
  })

  it('succeeds on first attempt with no options', async () => {
    const result = await retryAsync(() => Promise.resolve('no options'))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('no options')
  })

  it('fails with default options', async () => {
    let attempts = 0
    const result = await retryAsync(async () => {
      attempts++
      throw new Error('fail')
    })
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(3)
  })

  it('handles backoffFactor of 0', async () => {
    const start = Date.now()
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw new Error('fail')
    }, { maxAttempts: 5, maxDelayMs: 100, backoffFactor: 0 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  it('jitter with high maxDelayMs', async () => {
    let attempt = 0
    const result = await retryAsync(async () => {
      attempt++
      if (attempt < 2) throw new Error('fail')
      return 'ok'
    }, { maxAttempts: 3, maxDelayMs: 10000, jitter: true })
    expect(result.isOk()).toBe(true)
  })

  it('handles success on last attempt', async () => {
    let attempt = 0
    const result = await retryAsync(async () => {
      attempt++
      if (attempt < 5) throw new Error('fail')
      return 'done'
    }, { maxAttempts: 5, maxDelayMs: 1 })
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('done')
    expect(attempt).toBe(5)
  })

  it('does not retry on first attempt success with onRetry', async () => {
    let onRetryCalled = false
    const result = await retryAsync(async () => 'success', {
      maxAttempts: 5,
      maxDelayMs: 1,
      onRetry: () => { onRetryCalled = true },
    })
    expect(result.isOk()).toBe(true)
    expect(onRetryCalled).toBe(false)
  })

  it('handles multiple different errors in shouldRetry', async () => {
    let attempts = 0
    const errors: string[] = []
    const result = await retryAsync(async () => {
      attempts++
      if (attempts === 1) throw new Error('network')
      if (attempts === 2) throw new Error('timeout')
      if (attempts === 3) throw new Error('fatal')
    }, {
      maxAttempts: 10,
      maxDelayMs: 1,
      shouldRetry: (err) => {
        errors.push((err as Error).message)
        return (err as Error).message !== 'fatal'
      },
    })
    expect(result.isErr()).toBe(true)
    expect(errors).toEqual(['network', 'timeout', 'fatal'])
  })

  it('backoffFactor greater than 1 causes increasing delays', async () => {
    const delays: number[] = []
    const start = Date.now()
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt > 1) {
        delays.push(Date.now() - start)
      }
      if (attempt < 3) throw new Error('fail')
    }, { maxAttempts: 4, maxDelayMs: 1000, backoffFactor: 2 })
    expect(delays.length).toBe(2)
    expect(delays[1]! > delays[0]! || delays[0]! >= 100).toBe(true)
  })

  it('maxDelayMs caps exponential backoff', async () => {
    const start = Date.now()
    let attempt = 0
    await retryAsync(async () => {
      attempt++
      if (attempt < 10) throw new Error('fail')
    }, { maxAttempts: 15, maxDelayMs: 50, backoffFactor: 10 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(1000)
  })

  it('onRetry receives error and attempt number in correct order', async () => {
    const received: Array<{ error: Error; attempt: number }> = []
    let attempt = 0
    const error = new Error('test error')
    await retryAsync(async () => {
      attempt++
      if (attempt < 3) throw error
    }, {
      maxAttempts: 5,
      maxDelayMs: 1,
      onRetry: (err, n) => {
        received.push({ error: err as Error, attempt: n })
      },
    })
    expect(received.length).toBe(2)
    expect(received[0]!.attempt).toBe(1)
    expect(received[1]!.attempt).toBe(2)
  })

  it('handles concurrent retry calls', async () => {
    let counter = 0
    const createRetry = async (id: number) => {
      return await retryAsync(async () => {
        counter++
        if (counter < 3) throw new Error('fail')
        return id
      }, { maxAttempts: 5, maxDelayMs: 1 })
    }
    const [r1, r2] = await Promise.all([createRetry(1), createRetry(2)])
    expect(r1.isOk() || r2.isOk()).toBe(true)
  })
})
