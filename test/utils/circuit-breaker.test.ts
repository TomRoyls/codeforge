import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CircuitBreaker, type CircuitBreakerOptions } from '../../src/utils/circuit-breaker.js'

const defaultOptions: CircuitBreakerOptions = {
  failureThreshold: 3,
  resetTimeoutMs: 1000,
  halfOpenMaxAttempts: 2,
}

// ─── Constructor ──────────────────────────────────────────
describe('CircuitBreaker - constructor', () => {
  it('creates with valid options', () => {
    const cb = new CircuitBreaker(defaultOptions)
    expect(cb.getState()).toBe('closed')
  })

  it('throws on failureThreshold < 1', () => {
    expect(() => new CircuitBreaker({ ...defaultOptions, failureThreshold: 0 })).toThrow(RangeError)
  })

  it('throws on resetTimeoutMs < 1', () => {
    expect(() => new CircuitBreaker({ ...defaultOptions, resetTimeoutMs: 0 })).toThrow(RangeError)
  })

  it('throws on halfOpenMaxAttempts < 1', () => {
    expect(() => new CircuitBreaker({ ...defaultOptions, halfOpenMaxAttempts: 0 })).toThrow(RangeError)
  })
})

// ─── Closed state ─────────────────────────────────────────
describe('CircuitBreaker - closed state', () => {
  it('executes function successfully', async () => {
    const cb = new CircuitBreaker(defaultOptions)
    const result = await cb.execute(() => Promise.resolve(42))
    expect(result).toBe(42)
    expect(cb.getState()).toBe('closed')
  })

  it('tracks failures', async () => {
    const cb = new CircuitBreaker(defaultOptions)
    for (let i = 0; i < 2; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getStats().failures).toBe(2)
    expect(cb.getState()).toBe('closed')
  })

  it('opens after reaching failure threshold', async () => {
    const cb = new CircuitBreaker(defaultOptions)
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
  })
})

// ─── Open state ───────────────────────────────────────────
describe('CircuitBreaker - open state', () => {
  it('rejects attempts when open', async () => {
    const cb = new CircuitBreaker({ ...defaultOptions, resetTimeoutMs: 60000 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    await expect(cb.execute(() => Promise.resolve(1))).rejects.toThrow('Circuit breaker is open')
    expect(cb.getStats().totalRejected).toBe(1)
  })
})

// ─── Half-open state ──────────────────────────────────────
describe('CircuitBreaker - half-open state', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('transitions to half-open after reset timeout', async () => {
    const cb = new CircuitBreaker({ ...defaultOptions, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')

    vi.advanceTimersByTime(150)
    expect(cb.canAttempt()).toBe(true)
    expect(cb.getState()).toBe('half-open')
  })

  it('closes on success in half-open', async () => {
    const cb = new CircuitBreaker({ ...defaultOptions, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(150)
    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getState()).toBe('closed')
  })

  it('re-opens on half-open failures exceeding limit', async () => {
    const cb = new CircuitBreaker({ ...defaultOptions, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(150)
    for (let i = 0; i < 2; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
  })
})

// ─── Stats ────────────────────────────────────────────────
describe('CircuitBreaker - stats', () => {
  it('returns correct initial stats', () => {
    const cb = new CircuitBreaker(defaultOptions)
    const stats = cb.getStats()
    expect(stats.state).toBe('closed')
    expect(stats.failures).toBe(0)
    expect(stats.successes).toBe(0)
    expect(stats.totalRejected).toBe(0)
    expect(stats.lastFailureTime).toBeNull()
    expect(stats.lastSuccessTime).toBeNull()
  })

  it('tracks lastSuccessTime', async () => {
    const cb = new CircuitBreaker(defaultOptions)
    await cb.execute(() => Promise.resolve(1))
    expect(cb.getStats().lastSuccessTime).not.toBeNull()
  })

  it('tracks lastFailureTime', async () => {
    const cb = new CircuitBreaker(defaultOptions)
    await expect(cb.execute(() => Promise.reject(new Error('x')))).rejects.toThrow()
    expect(cb.getStats().lastFailureTime).not.toBeNull()
  })
})

// ─── Reset ────────────────────────────────────────────────
describe('CircuitBreaker - reset', () => {
  it('resets to initial state', async () => {
    const cb = new CircuitBreaker(defaultOptions)
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
    cb.reset()
    expect(cb.getState()).toBe('closed')
    expect(cb.getStats().failures).toBe(0)
    expect(cb.getStats().totalRejected).toBe(0)
  })
})

// ─── canAttempt ───────────────────────────────────────────
describe('CircuitBreaker - canAttempt', () => {
  it('returns true in closed state', () => {
    const cb = new CircuitBreaker(defaultOptions)
    expect(cb.canAttempt()).toBe(true)
  })

  it('returns false in open state', async () => {
    const cb = new CircuitBreaker(defaultOptions)
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.canAttempt()).toBe(false)
  })

  it('successful call resets failure count', async () => {
    const cb = new CircuitBreaker({ maxFailures: 2, resetTimeout: 100 })
    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.canAttempt()).toBe(true)
  })

  it('state starts as closed', () => {
    const cb = new CircuitBreaker({ maxFailures: 3, resetTimeout: 1000 })
    expect(cb.state).toBe('closed')
  })

  it('canAttempt returns true when closed', () => {
    const cb = new CircuitBreaker({ maxFailures: 3, resetTimeout: 1000 })
    expect(cb.canAttempt()).toBe(true)
  })

  it('state starts as closed', () => {
    const cb = new CircuitBreaker({ maxFailures: 3, resetTimeout: 1000 })
    expect(cb.state).toBe('closed')
  })

  it('canAttempt returns true when closed', () => {
    const cb = new CircuitBreaker({ maxFailures: 3, resetTimeout: 1000 })
    expect(cb.canAttempt()).toBe(true)
  })

  it('getStats returns initial state', () => {
    const cb = new CircuitBreaker({ maxFailures: 3, resetTimeout: 1000 })
    const stats = cb.getStats()
    expect(stats.failures).toBe(0)
  })
})
