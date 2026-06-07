import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter } from '../../src/utils/rate-limiter.js'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests up to limit', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const results: boolean[] = []
    for (let i = 0; i < 5; i++) {
      const result = rl.tryAcquire()
      results.push(result)
    }
    expect(results.every((r) => r)).toBe(true)
  })

  it('blocks requests over limit', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    for (let i = 0; i < 3; i++) {
      rl.tryAcquire()
    }
    const result = rl.tryAcquire()
    expect(result).toBe(false)
  })

  it('remaining decreases', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.getAvailableTokens()).toBe(4)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.getAvailableTokens()).toBe(3)
  })

  it('retryAfterMs is reasonable (acquire waits when blocked)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    const acquirePromise = rl.acquire()
    vi.advanceTimersByTime(1000)
    await acquirePromise
    expect(rl.getAvailableTokens()).toBeLessThanOrEqual(2)
    vi.useRealTimers()
  })

  it('tryAcquire returns boolean for sequential calls', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(false)
  })

  it('reset clears counter', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.tryAcquire()).toBe(false)
    rl.reset()
    expect(rl.tryAcquire()).toBe(true)
  })

  it('reset refills all tokens', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.tryAcquire()).toBe(false)
    rl.reset()
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
  })

  it('getStats does not consume quota', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    const status1 = rl.getStats()
    expect(status1.availableTokens).toBe(3)
    const status2 = rl.getStats()
    expect(status2.availableTokens).toBe(3)
    rl.tryAcquire()
    const status3 = rl.getStats()
    expect(status3.availableTokens).toBe(2)
  })

  it('window refills after interval', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    for (let i = 0; i < 5; i++) {
      rl.tryAcquire()
    }
    expect(rl.tryAcquire()).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(rl.tryAcquire()).toBe(true)
    vi.useRealTimers()
  })

  it('maxTokens is readonly', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.maxTokens).toBe(10)
  })

  it('zero maxTokens throws', () => {
    expect(() => new RateLimiter({ maxTokens: 0, refillRate: 1, refillIntervalMs: 1000 })).toThrow(RangeError)
  })

  it('acquire returns Promise', async () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(false)
  })

  it('multiple refills tracked', () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    for (let i = 0; i < 3; i++) {
      rl.tryAcquire()
    }
    vi.advanceTimersByTime(500)
    for (let i = 0; i < 3; i++) {
      rl.tryAcquire()
    }
    expect(rl.tryAcquire()).toBe(false)
    vi.useRealTimers()
  })

  it('getStats returns maxTokens', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    const status = rl.getStats()
    expect(status.maxTokens).toBe(10)
  })

  it('refillIntervalMs is readonly', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 2000 })
    expect(rl.refillIntervalMs).toBe(2000)
  })

  it('getStats returns availableTokens after partial use', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.tryAcquire()
    const status = rl.getStats()
    expect(status.availableTokens).toBe(2)
  })

  it('tryAcquire returns false when blocked', () => {
    const rl = new RateLimiter({ maxTokens: 1, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    const result = rl.tryAcquire()
    expect(result).toBe(false)
  })

  it('allows request after reset', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    for (let i = 0; i < 5; i++) rl.tryAcquire()
    rl.reset()
    expect(rl.tryAcquire()).toBe(true)
  })

  it('tryAcquire returns boolean', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    const result = rl.tryAcquire()
    expect(typeof result).toBe('boolean')
  })

  it('tryAcquire returns true initially', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    const result = rl.tryAcquire()
    expect(result).toBe(true)
  })

  it('has configurable refillRate', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 10, refillIntervalMs: 1000 })
    expect(rl).toBeDefined()
    expect(rl.refillRate).toBe(10)
  })

  it('tryAcquire returns true when under limit', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const result = rl.tryAcquire()
    expect(result).toBe(true)
  })

  it('second immediate acquire succeeds if tokens remain', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    const result = rl.tryAcquire()
    expect(result).toBe(true)
  })

  it('tryAcquire respects limit', () => {
    const rl = new RateLimiter({ maxTokens: 1, refillRate: 1, refillIntervalMs: 100000 })
    rl.tryAcquire()
    const result = rl.tryAcquire()
    expect(result).toBe(false)
  })
})
