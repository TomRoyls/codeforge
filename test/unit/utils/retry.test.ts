import { describe, test, expect, vi } from 'vitest'
import { retryAsync, type RetryOptions } from '../../../src/utils/retry.js'

describe('retryAsync', () => {
  test('returns ok on first successful attempt', async () => {
    const result = await retryAsync(() => Promise.resolve(42))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  test('returns ok after retries', async () => {
    let attempts = 0
    const result = await retryAsync(
      () => {
        attempts++
        if (attempts < 3) throw new Error('not yet')
        return Promise.resolve('success')
      },
      { maxAttempts: 5 },
    )
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('success')
    expect(attempts).toBe(3)
  })

  test('returns err after max attempts exhausted', async () => {
    const result = await retryAsync(
      () => Promise.reject(new Error('always fails')),
      { maxAttempts: 3 },
    )
    expect(result.isErr()).toBe(true)
  })

  test('uses default maxAttempts of 3', async () => {
    let attempts = 0
    const result = await retryAsync(() => {
      attempts++
      throw new Error('fail')
    })
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(3)
  })

  test('respects maxAttempts option', async () => {
    let attempts = 0
    const result = await retryAsync(
      () => {
        attempts++
        throw new Error('fail')
      },
      { maxAttempts: 5 },
    )
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(5)
  })

  test('calls onRetry callback on each retry', async () => {
    const onRetry = vi.fn()
    let attempts = 0
    await retryAsync(
      () => {
        attempts++
        if (attempts < 3) throw new Error('retry me')
        return Promise.resolve('done')
      },
      { maxAttempts: 5, onRetry },
    )
    expect(onRetry).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1)
    expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2)
  })

  test('stops early when shouldRetry returns false', async () => {
    let attempts = 0
    const result = await retryAsync(
      () => {
        attempts++
        throw new Error('fatal')
      },
      {
        maxAttempts: 10,
        shouldRetry: (error) => {
          const msg = error instanceof Error ? error.message : ''
          return msg !== 'fatal'
        },
      },
    )
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(1)
  })

  test('continues when shouldRetry returns true', async () => {
    let attempts = 0
    const result = await retryAsync(
      () => {
        attempts++
        throw new Error('transient')
      },
      {
        maxAttempts: 3,
        shouldRetry: () => true,
      },
    )
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(3)
  })

  test('works with string results', async () => {
    const result = await retryAsync(() => Promise.resolve('hello'))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('hello')
  })

  test('works with object results', async () => {
    const data = { name: 'test', value: 123 }
    const result = await retryAsync(() => Promise.resolve(data))
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toEqual(data)
  })

  test('works with void results', async () => {
    const result = await retryAsync(() => Promise.resolve())
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBeUndefined()
  })

  test('returns err with the last error', async () => {
    const result = await retryAsync(
      () => Promise.reject(new Error('final error')),
      { maxAttempts: 2 },
    )
    expect(result.isErr()).toBe(true)
    expect(() => result.unwrap()).toThrow('final error')
  })

  test('handles single attempt with maxAttempts 1', async () => {
    let attempts = 0
    const result = await retryAsync(
      () => {
        attempts++
        throw new Error('fail')
      },
      { maxAttempts: 1 },
    )
    expect(result.isErr()).toBe(true)
    expect(attempts).toBe(1)
  })

  test('succeeds with maxAttempts 1 on success', async () => {
    const result = await retryAsync(
      () => Promise.resolve('ok'),
      { maxAttempts: 1 },
    )
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe('ok')
  })
})
