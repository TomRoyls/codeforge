import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CircuitBreaker, type CircuitBreakerOptions, type CircuitState } from '../src/utils/circuit-breaker.js'

// ─── constructor ───────────────────────────────────────
describe('CircuitBreaker constructor', () => {
  it('starts in closed state', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000, halfOpenMaxAttempts: 1 })
    expect(cb.getState()).toBe('closed')
  })

  it('throws on failureThreshold < 1', () => {
    expect(
      () => new CircuitBreaker({ failureThreshold: 0, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 }),
    ).toThrow(RangeError)
  })

  it('throws on resetTimeoutMs < 1', () => {
    expect(
      () => new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 0, halfOpenMaxAttempts: 1 }),
    ).toThrow(RangeError)
  })

  it('throws on halfOpenMaxAttempts < 1', () => {
    expect(
      () => new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 100, halfOpenMaxAttempts: 0 }),
    ).toThrow(RangeError)
  })
})

// ─── closed state ──────────────────────────────────────
describe('CircuitBreaker closed state', () => {
  let cb: CircuitBreaker

  beforeEach(() => {
    cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
  })

  it('executes successful function', async () => {
    const result = await cb.execute(() => Promise.resolve(42))
    expect(result).toBe(42)
  })

  it('tracks successes', async () => {
    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getStats().successes).toBe(1)
  })

  it('opens after reaching failure threshold', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
  })

  it('stays closed below failure threshold', async () => {
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getState()).toBe('closed')
  })
})

// ─── open state ────────────────────────────────────────
describe('CircuitBreaker open state', () => {
  it('rejects execution in open state', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 5000, halfOpenMaxAttempts: 1 })
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    expect(cb.getState()).toBe('open')

    await expect(cb.execute(() => Promise.resolve('ok'))).rejects.toThrow('Circuit breaker is open')
    expect(cb.getStats().totalRejected).toBe(1)
  })

  it('transitions to half-open after resetTimeout', async () => {
    vi.useFakeTimers()
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    expect(cb.getState()).toBe('open')

    vi.advanceTimersByTime(150)
    expect(cb.canAttempt()).toBe(true)
    expect(cb.getState()).toBe('half-open')
    vi.useRealTimers()
  })
})

// ─── half-open state ───────────────────────────────────
describe('CircuitBreaker half-open state', () => {
  it('closes on success in half-open', async () => {
    vi.useFakeTimers()
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 100, halfOpenMaxAttempts: 2 })
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    vi.advanceTimersByTime(150)

    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getState()).toBe('closed')
    vi.useRealTimers()
  })

  it('reopens after half-open failures exceed limit', async () => {
    vi.useFakeTimers()
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    vi.advanceTimersByTime(150)

    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    expect(cb.getState()).toBe('open')
    vi.useRealTimers()
  })
})

// ─── getStats ──────────────────────────────────────────
describe('CircuitBreaker getStats', () => {
  it('returns initial stats', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    const stats = cb.getStats()

    expect(stats.state).toBe('closed')
    expect(stats.failures).toBe(0)
    expect(stats.successes).toBe(0)
    expect(stats.totalRejected).toBe(0)
    expect(stats.lastFailureTime).toBeNull()
    expect(stats.lastSuccessTime).toBeNull()
  })

  it('tracks lastFailureTime after failure', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    await expect(cb.execute(() => Promise.reject(new Error('x')))).rejects.toThrow('x')
    expect(cb.getStats().lastFailureTime).toBeTypeOf('number')
  })
})

// ─── reset ─────────────────────────────────────────────
describe('CircuitBreaker reset', () => {
  it('resets to initial closed state', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    expect(cb.getState()).toBe('open')

    cb.reset()
    expect(cb.getState()).toBe('closed')
    expect(cb.getStats().failures).toBe(0)
    expect(cb.getStats().totalRejected).toBe(0)
  })
})
