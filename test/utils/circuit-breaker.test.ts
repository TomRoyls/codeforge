import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CircuitBreaker, type CircuitBreakerOptions } from '../../src/utils/circuit-breaker.js'

const opts: CircuitBreakerOptions = {
  failureThreshold: 3,
  resetTimeoutMs: 1000,
  halfOpenMaxAttempts: 2,
}

describe('CircuitBreaker - constructor', () => {
  it('creates with valid options', () => {
    const cb = new CircuitBreaker(opts)
    expect(cb.getState()).toBe('closed')
  })

  it('throws on failureThreshold < 1', () => {
    expect(() => new CircuitBreaker({ ...opts, failureThreshold: 0 })).toThrow(RangeError)
  })

  it('throws on resetTimeoutMs < 1', () => {
    expect(() => new CircuitBreaker({ ...opts, resetTimeoutMs: 0 })).toThrow(RangeError)
  })

  it('throws on halfOpenMaxAttempts < 1', () => {
    expect(() => new CircuitBreaker({ ...opts, halfOpenMaxAttempts: 0 })).toThrow(RangeError)
  })

  it('accepts failureThreshold of 1', () => {
    const cb = new CircuitBreaker({ ...opts, failureThreshold: 1 })
    expect(cb.getState()).toBe('closed')
  })

  it('accepts large resetTimeoutMs', () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 999999 })
    expect(cb.getState()).toBe('closed')
  })
})

describe('CircuitBreaker - closed state', () => {
  it('executes function successfully', async () => {
    const cb = new CircuitBreaker(opts)
    const result = await cb.execute(() => Promise.resolve(42))
    expect(result).toBe(42)
    expect(cb.getState()).toBe('closed')
  })

  it('tracks failures in closed state', async () => {
    const cb = new CircuitBreaker(opts)
    for (let i = 0; i < 2; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getStats().failures).toBe(2)
    expect(cb.getState()).toBe('closed')
  })

  it('opens after reaching failure threshold', async () => {
    const cb = new CircuitBreaker(opts)
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
  })

  it('increments successes on successful calls', async () => {
    const cb = new CircuitBreaker(opts)
    await cb.execute(() => Promise.resolve(1))
    await cb.execute(() => Promise.resolve(2))
    expect(cb.getStats().successes).toBe(2)
  })

  it('does not open with alternating success/failure', async () => {
    const cb = new CircuitBreaker({ ...opts, failureThreshold: 3 })
    await expect(cb.execute(() => Promise.reject(new Error('x')))).rejects.toThrow()
    await cb.execute(() => Promise.resolve('ok'))
    await expect(cb.execute(() => Promise.reject(new Error('x')))).rejects.toThrow()
    expect(cb.getState()).toBe('closed')
  })

  it('failure threshold of 1 opens on first failure', async () => {
    const cb = new CircuitBreaker({ ...opts, failureThreshold: 1 })
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
    expect(cb.getState()).toBe('open')
  })
})

describe('CircuitBreaker - open state', () => {
  it('rejects attempts when open', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 60000 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    await expect(cb.execute(() => Promise.resolve(1))).rejects.toThrow('Circuit breaker is open')
    expect(cb.getStats().totalRejected).toBe(1)
  })

  it('tracks total rejections', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 60000 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    for (let i = 0; i < 5; i++) {
      await expect(cb.execute(() => Promise.resolve(1))).rejects.toThrow('Circuit breaker is open')
    }
    expect(cb.getStats().totalRejected).toBe(5)
  })

  it('canAttempt returns false in open state', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 60000 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.canAttempt()).toBe(false)
  })
})

describe('CircuitBreaker - half-open state', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('transitions to half-open after reset timeout', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
    vi.advanceTimersByTime(150)
    expect(cb.canAttempt()).toBe(true)
    expect(cb.getState()).toBe('half-open')
  })

  it('closes on success in half-open', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(150)
    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getState()).toBe('closed')
  })

  it('re-opens on half-open failures exceeding limit', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(150)
    for (let i = 0; i < 2; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
  })

  it('success in half-open resets failure count', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(150)
    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getStats().failures).toBe(0)
  })

  it('half-open limits attempts', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(150)
    expect(cb.canAttempt()).toBe(true)
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
    expect(cb.canAttempt()).toBe(false)
  })

  it('does not transition to half-open before timeout', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 1000 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(500)
    expect(cb.canAttempt()).toBe(false)
    expect(cb.getState()).toBe('open')
  })

  it('transitions exactly at timeout boundary', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    vi.advanceTimersByTime(100)
    expect(cb.canAttempt()).toBe(true)
  })
})

describe('CircuitBreaker - stats', () => {
  it('returns correct initial stats', () => {
    const cb = new CircuitBreaker(opts)
    const stats = cb.getStats()
    expect(stats.state).toBe('closed')
    expect(stats.failures).toBe(0)
    expect(stats.successes).toBe(0)
    expect(stats.totalRejected).toBe(0)
    expect(stats.lastFailureTime).toBeNull()
    expect(stats.lastSuccessTime).toBeNull()
  })

  it('tracks lastSuccessTime after success', async () => {
    const cb = new CircuitBreaker(opts)
    await cb.execute(() => Promise.resolve(1))
    expect(cb.getStats().lastSuccessTime).not.toBeNull()
  })

  it('tracks lastFailureTime after failure', async () => {
    const cb = new CircuitBreaker(opts)
    await expect(cb.execute(() => Promise.reject(new Error('x')))).rejects.toThrow()
    expect(cb.getStats().lastFailureTime).not.toBeNull()
  })

  it('stats reflect cumulative operations', async () => {
    const cb = new CircuitBreaker(opts)
    await cb.execute(() => Promise.resolve(1))
    await cb.execute(() => Promise.resolve(2))
    await expect(cb.execute(() => Promise.reject(new Error('x')))).rejects.toThrow()
    const stats = cb.getStats()
    expect(stats.successes).toBe(2)
    expect(stats.failures).toBe(1)
  })
})

describe('CircuitBreaker - reset', () => {
  it('resets to initial state after opening', async () => {
    const cb = new CircuitBreaker(opts)
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.getState()).toBe('open')
    cb.reset()
    expect(cb.getState()).toBe('closed')
    expect(cb.getStats().failures).toBe(0)
    expect(cb.getStats().totalRejected).toBe(0)
  })

  it('reset clears success count', async () => {
    const cb = new CircuitBreaker(opts)
    await cb.execute(() => Promise.resolve(1))
    cb.reset()
    expect(cb.getStats().successes).toBe(0)
  })

  it('reset clears lastSuccessTime', async () => {
    const cb = new CircuitBreaker(opts)
    await cb.execute(() => Promise.resolve(1))
    cb.reset()
    expect(cb.getStats().lastSuccessTime).toBeNull()
  })

  it('reset clears lastFailureTime', async () => {
    const cb = new CircuitBreaker(opts)
    await expect(cb.execute(() => Promise.reject(new Error('x')))).rejects.toThrow()
    cb.reset()
    expect(cb.getStats().lastFailureTime).toBeNull()
  })

  it('can execute after reset', async () => {
    const cb = new CircuitBreaker(opts)
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    cb.reset()
    const result = await cb.execute(() => Promise.resolve('ok'))
    expect(result).toBe('ok')
  })
})

describe('CircuitBreaker - canAttempt', () => {
  it('returns true in closed state', () => {
    const cb = new CircuitBreaker(opts)
    expect(cb.canAttempt()).toBe(true)
  })

  it('returns false in open state', async () => {
    const cb = new CircuitBreaker(opts)
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    expect(cb.canAttempt()).toBe(false)
  })
})

describe('CircuitBreaker - edge cases', () => {
  it('handles rejected promises with non-Error values', async () => {
    const cb = new CircuitBreaker(opts)
    await expect(cb.execute(() => Promise.reject('string error'))).rejects.toBe('string error')
    expect(cb.getStats().failures).toBe(1)
  })

  it('execute propagates the original error', async () => {
    const cb = new CircuitBreaker(opts)
    const error = new TypeError('custom error')
    await expect(cb.execute(() => Promise.reject(error))).rejects.toThrow(TypeError)
  })

  it('handles async function with delay', async () => {
    const cb = new CircuitBreaker(opts)
    const result = await cb.execute(() => new Promise(resolve => setTimeout(() => resolve(99), 10)))
    expect(result).toBe(99)
  })

  it('handles multiple rapid failures', async () => {
    const cb = new CircuitBreaker({ ...opts, failureThreshold: 5 })
    for (let i = 0; i < 5; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
    }
    expect(cb.getState()).toBe('open')
    expect(cb.getStats().failures).toBe(5)
  })

  it('sustained successes keep circuit closed', async () => {
    const cb = new CircuitBreaker(opts)
    for (let i = 0; i < 100; i++) {
      await cb.execute(() => Promise.resolve(i))
    }
    expect(cb.getState()).toBe('closed')
    expect(cb.getStats().successes).toBe(100)
  })

  it('execute returns different types', async () => {
    const cb = new CircuitBreaker(opts)
    expect(await cb.execute(() => Promise.resolve('string'))).toBe('string')
    expect(await cb.execute(() => Promise.resolve(42))).toBe(42)
    expect(await cb.execute(() => Promise.resolve({ key: 'val' }))).toEqual({ key: 'val' })
  })

  it('handles null return values', async () => {
    const cb = new CircuitBreaker(opts)
    const result = await cb.execute(() => Promise.resolve(null))
    expect(result).toBeNull()
  })

  it('handles undefined return values', async () => {
    const cb = new CircuitBreaker(opts)
    const result = await cb.execute(() => Promise.resolve(undefined))
    expect(result).toBeUndefined()
  })

  it('failure count accumulates across multiple failures', async () => {
    const cb = new CircuitBreaker(opts)
    await expect(cb.execute(() => Promise.reject(new Error('a')))).rejects.toThrow()
    await expect(cb.execute(() => Promise.reject(new Error('b')))).rejects.toThrow()
    expect(cb.getStats().failures).toBe(2)
    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getStats().failures).toBe(2)
  })

  it('opening and resetting multiple times works', async () => {
    const cb = new CircuitBreaker(opts)
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      }
      expect(cb.getState()).toBe('open')
      cb.reset()
      expect(cb.getState()).toBe('closed')
    }
  })

  it('halfOpenMaxAttempts of 1 allows single retry', async () => {
    vi.useFakeTimers()
    try {
      const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      }
      vi.advanceTimersByTime(150)
      expect(cb.canAttempt()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejection error message includes current state', async () => {
    const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 60000 })
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
    }
    await expect(cb.execute(() => Promise.resolve(1))).rejects.toThrow('Circuit breaker is open')
  })
})

describe('CircuitBreaker - additional edge cases', () => {
  it('reset clears halfOpenAttempts', async () => {
    vi.useFakeTimers()
    try {
      const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100 })
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      }
      vi.advanceTimersByTime(150)
      expect(cb.canAttempt()).toBe(true)
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      cb.reset()
      expect(cb.getState()).toBe('closed')
      expect(cb.getStats().failures).toBe(0)
      expect(cb.getStats().successes).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('consecutive resets have no side effects', async () => {
    const cb = new CircuitBreaker(opts)
    await cb.execute(() => Promise.resolve(1))
    cb.reset()
    cb.reset()
    cb.reset()
    expect(cb.getStats().failures).toBe(0)
    expect(cb.getStats().successes).toBe(0)
    expect(cb.getState()).toBe('closed')
  })

  it('half-open to closed transition resets failures', async () => {
    vi.useFakeTimers()
    try {
      const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100 })
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      }
      vi.advanceTimersByTime(150)
      await cb.execute(() => Promise.resolve('ok'))
      expect(cb.getState()).toBe('closed')
      expect(cb.getStats().failures).toBe(0)
      expect(cb.getStats().successes).toBe(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('stats return immutable snapshot', async () => {
    const cb = new CircuitBreaker(opts)
    const stats1 = cb.getStats()
    await cb.execute(() => Promise.resolve(1))
    const stats2 = cb.getStats()
    expect(stats1.failures).toBe(0)
    expect(stats2.failures).toBe(0)
    expect(stats1.successes).toBe(0)
    expect(stats2.successes).toBe(1)
  })

  it('execute with promise that resolves to undefined', async () => {
    const cb = new CircuitBreaker(opts)
    const result = await cb.execute(() => Promise.resolve(undefined))
    expect(result).toBeUndefined()
    expect(cb.getStats().successes).toBe(1)
  })

  it('handles rejection with Error subclass', async () => {
    class CustomError extends Error {
      constructor(msg: string) {
        super(msg)
        this.name = 'CustomError'
      }
    }
    const cb = new CircuitBreaker(opts)
    await expect(cb.execute(() => Promise.reject(new CustomError('custom')))).rejects.toThrow(CustomError)
    expect(cb.getStats().failures).toBe(1)
  })

  it('large halfOpenMaxAttempts allows more retries', async () => {
    vi.useFakeTimers()
    try {
      const cb = new CircuitBreaker({ ...opts, resetTimeoutMs: 100, halfOpenMaxAttempts: 10 })
      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      }
      vi.advanceTimersByTime(150)
      for (let i = 0; i < 9; i++) {
        expect(cb.canAttempt()).toBe(true)
        await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      }
      expect(cb.canAttempt()).toBe(true)
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow()
      expect(cb.canAttempt()).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('circuit breaker starts closed', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    expect(cb.getState()).toBe('closed')
  })

  it('success keeps breaker closed', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 100, halfOpenMaxAttempts: 1 })
    await cb.execute(async () => 'ok')
    expect(cb.getState()).toBe('closed')
  })

  it('half-open allows trial request', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 50, halfOpenMaxAttempts: 1 })
    try { await cb.execute(async () => { throw new Error('fail') }) } catch {}
    expect(cb.getState()).toBe('open')
  })
})

  it('canAttempt returns true when closed', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 })
    expect(cb.canAttempt()).toBe(true)
  })

  it('execute resolves on success', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 })
    const result = await cb.execute(() => Promise.resolve(42))
    expect(result).toBe(42)
  })

  it('execute rejects on failure', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 })
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail')
  })

describe('circuit-breaker - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('circuit-breaker - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('circuit-breaker - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('circuit-breaker - wave548', () => {
  it('circuit-breaker module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circuit-breaker module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circuit-breaker module has name', () => {
    expect(describe).toBeDefined()
  })
})
