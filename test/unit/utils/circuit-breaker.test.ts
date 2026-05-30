import { describe, expect, it, vi } from 'vitest'
import { CircuitBreaker } from '../../../src/utils/circuit-breaker.js'

describe('CircuitBreaker', () => {
  it('should create with default state closed', () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    expect(breaker.getState()).toBe('closed')
  })

  it('should throw on invalid failureThreshold', () => {
    expect(() => {
      new CircuitBreaker({
        failureThreshold: 0,
        resetTimeoutMs: 1000,
        halfOpenMaxAttempts: 2,
      })
    }).toThrow(RangeError)
  })

  it('should throw on invalid resetTimeoutMs', () => {
    expect(() => {
      new CircuitBreaker({
        failureThreshold: 3,
        resetTimeoutMs: 0,
        halfOpenMaxAttempts: 2,
      })
    }).toThrow(RangeError)
  })

  it('should throw on invalid halfOpenMaxAttempts', () => {
    expect(() => {
      new CircuitBreaker({
        failureThreshold: 3,
        resetTimeoutMs: 1000,
        halfOpenMaxAttempts: 0,
      })
    }).toThrow(RangeError)
  })

  it('should allow execution in closed state', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const fn = vi.fn(async () => 'success')
    const result = await breaker.execute(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should increment failures on error', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const fn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    const stats = breaker.getStats()
    expect(stats.failures).toBe(2)
  })

  it('should trip to open state after threshold failures', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const fn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
  })

  it('should reject execution in open state', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const fn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is open')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should increment totalRejected when rejecting', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const fn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is open')
    const stats = breaker.getStats()
    expect(stats.totalRejected).toBe(1)
  })

  it('should allow attempt after reset timeout', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 2,
    })
    const fn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    await expect(breaker.execute(fn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
    vi.advanceTimersByTime(150)
    expect(breaker.canAttempt()).toBe(true)
    vi.useRealTimers()
  })

  it('should transition to half-open after timeout', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
    vi.advanceTimersByTime(150)
    expect(breaker.canAttempt()).toBe(true)
    expect(breaker.getState()).toBe('half-open')
    const successFn = vi.fn(async () => 'success')
    const result = await breaker.execute(successFn)
    expect(result).toBe('success')
    expect(breaker.getState()).toBe('closed')
    vi.useRealTimers()
  })

  it('should reset to closed on success in half-open', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    vi.advanceTimersByTime(150)
    const successFn = vi.fn(async () => 'success')
    await breaker.execute(successFn)
    expect(breaker.getState()).toBe('closed')
    expect(breaker.getStats().failures).toBe(0)
    vi.useRealTimers()
  })

  it('should trip to open on failure in half-open', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    vi.advanceTimersByTime(150)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('half-open')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
    vi.useRealTimers()
  })

  it('should respect halfOpenMaxAttempts', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 3,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    vi.advanceTimersByTime(150)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('half-open')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
    vi.useRealTimers()
  })

  it('should increment successes on success', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const fn = vi.fn(async () => 'success')
    await breaker.execute(fn)
    await breaker.execute(fn)
    expect(breaker.getStats().successes).toBe(2)
  })

  it('should return current state', () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    expect(breaker.getState()).toBe('closed')
  })

  it('should return complete stats', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    vi.advanceTimersByTime(50)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    vi.advanceTimersByTime(150)
    const successFn = vi.fn(async () => 'success')
    await breaker.execute(successFn)
    const stats = breaker.getStats()
    expect(stats.state).toBe('closed')
    expect(stats.failures).toBe(0)
    expect(stats.successes).toBe(1)
    expect(stats.totalRejected).toBe(0)
    expect(stats.lastFailureTime).not.toBe(null)
    expect(stats.lastSuccessTime).not.toBe(null)
    vi.useRealTimers()
  })

  it('should reset all stats', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    breaker.reset()
    const stats = breaker.getStats()
    expect(stats.state).toBe('closed')
    expect(stats.failures).toBe(0)
    expect(stats.successes).toBe(0)
    expect(stats.totalRejected).toBe(0)
    expect(stats.lastFailureTime).toBe(null)
    expect(stats.lastSuccessTime).toBe(null)
  })

  it('should handle canAttempt in closed state', () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    expect(breaker.canAttempt()).toBe(true)
  })

  it('should handle canAttempt in open state before timeout', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.canAttempt()).toBe(false)
  })

  it('should handle canAttempt in half-open state', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 3,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    vi.advanceTimersByTime(150)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.canAttempt()).toBe(true)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.canAttempt()).toBe(true)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.canAttempt()).toBe(false)
    vi.useRealTimers()
  })

  it('should track lastFailureTime', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    vi.setSystemTime(10000)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getStats().lastFailureTime).toBe(10000)
    vi.setSystemTime(20000)
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getStats().lastFailureTime).toBe(20000)
    vi.useRealTimers()
  })

  it('should track lastSuccessTime', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const successFn = vi.fn(async () => 'success')
    vi.setSystemTime(10000)
    await breaker.execute(successFn)
    expect(breaker.getStats().lastSuccessTime).toBe(10000)
    vi.setSystemTime(20000)
    await breaker.execute(successFn)
    expect(breaker.getStats().lastSuccessTime).toBe(20000)
    vi.useRealTimers()
  })

  it('should handle successful retry after trip', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
    vi.advanceTimersByTime(150)
    const successFn = vi.fn(async () => 'success')
    const result = await breaker.execute(successFn)
    expect(result).toBe('success')
    expect(breaker.getState()).toBe('closed')
    expect(breaker.getStats().failures).toBe(0)
    vi.useRealTimers()
  })

  it('should maintain state across multiple operations', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const successFn = vi.fn(async () => 'success')
    await breaker.execute(successFn)
    await breaker.execute(successFn)
    expect(breaker.getStats().successes).toBe(2)
    expect(breaker.getState()).toBe('closed')
  })

  it('should handle different thresholds', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    for (let i = 0; i < 4; i++) {
      await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    }
    expect(breaker.getState()).toBe('closed')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
  })

  it('should handle very short reset timeout', async () => {
    vi.useFakeTimers()
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 1,
      halfOpenMaxAttempts: 2,
    })
    const failFn = vi.fn(async () => {
      throw new Error('fail')
    })
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    await expect(breaker.execute(failFn)).rejects.toThrow('fail')
    expect(breaker.getState()).toBe('open')
    vi.advanceTimersByTime(10)
    expect(breaker.canAttempt()).toBe(true)
    vi.useRealTimers()
  })
})