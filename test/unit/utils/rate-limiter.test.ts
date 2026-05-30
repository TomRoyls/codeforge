import { describe, expect, it, vi, afterEach } from 'vitest'

import { RateLimiter } from '../../../src/utils/rate-limiter.js'

describe('RateLimiter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('validates maxTokens >= 1', () => {
    expect(() => new RateLimiter({ maxTokens: 0, refillRate: 1, refillIntervalMs: 1000 }))
      .toThrow(RangeError)
  })

  it('validates refillRate >= 1', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 0, refillIntervalMs: 1000 }))
      .toThrow(RangeError)
  })

  it('validates refillIntervalMs >= 1', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 0 }))
      .toThrow(RangeError)
  })

  it('tryAcquire succeeds when tokens available', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
  })

  it('tryAcquire fails when no tokens available', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.tryAcquire()).toBe(false)
  })

  it('tryAcquire with count > 1', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire(3)).toBe(true)
    expect(rl.getAvailableTokens()).toBe(2)
  })

  it('tryAcquire validates count >= 1', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(() => rl.tryAcquire(0)).toThrow(RangeError)
  })

  it('refills tokens after interval', () => {
    vi.useFakeTimers()
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    expect(rl.tryAcquire()).toBe(false)
    vi.advanceTimersByTime(1000)
    expect(rl.tryAcquire()).toBe(true)
  })

  it('does not exceed maxTokens on refill', () => {
    vi.useFakeTimers()
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 3, refillIntervalMs: 1000 })
    rl.tryAcquire()
    vi.advanceTimersByTime(1000)
    expect(rl.getAvailableTokens()).toBe(2)
  })

  it('getAvailableTokens returns current count', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.getAvailableTokens()).toBe(5)
    rl.tryAcquire(2)
    expect(rl.getAvailableTokens()).toBe(3)
  })

  it('tracks stats correctly', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.tryAcquire()
    rl.tryAcquire()
    const stats = rl.getStats()
    expect(stats.totalAcquired).toBe(3)
    expect(stats.totalRejected).toBe(1)
    expect(stats.availableTokens).toBe(0)
    expect(stats.maxTokens).toBe(3)
  })

  it('reset restores initial state', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.reset()
    expect(rl.getAvailableTokens()).toBe(2)
    const stats = rl.getStats()
    expect(stats.totalAcquired).toBe(0)
    expect(stats.totalRejected).toBe(0)
    expect(stats.totalRefills).toBe(0)
  })

  it('acquire waits for tokens to become available', async () => {
    vi.useFakeTimers()
    const rl = new RateLimiter({ maxTokens: 1, refillRate: 1, refillIntervalMs: 100 })
    rl.tryAcquire()
    const promise = rl.acquire()
    vi.advanceTimersByTime(100)
    await expect(promise).resolves.toBeUndefined()
  })
})
