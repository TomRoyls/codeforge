import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RateLimiter, type RateLimiterOptions } from '../src/utils/rate-limiter.js'

// ─── constructor ───────────────────────────────────────
describe('RateLimiter constructor', () => {
  it('initializes with full tokens', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.getAvailableTokens()).toBe(10)
  })

  it('throws on maxTokens < 1', () => {
    expect(() => new RateLimiter({ maxTokens: 0, refillRate: 1, refillIntervalMs: 100 })).toThrow(
      RangeError,
    )
  })

  it('throws on refillRate < 1', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 0, refillIntervalMs: 100 })).toThrow(
      RangeError,
    )
  })

  it('throws on refillIntervalMs < 1', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 0 })).toThrow(
      RangeError,
    )
  })
})

// ─── tryAcquire ────────────────────────────────────────
describe('RateLimiter tryAcquire', () => {
  let rl: RateLimiter

  beforeEach(() => {
    rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 100 })
  })

  it('acquires a single token', () => {
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.getAvailableTokens()).toBe(4)
  })

  it('acquires multiple tokens', () => {
    expect(rl.tryAcquire(3)).toBe(true)
    expect(rl.getAvailableTokens()).toBe(2)
  })

  it('rejects when not enough tokens', () => {
    expect(rl.tryAcquire(5)).toBe(true)
    expect(rl.tryAcquire()).toBe(false)
  })

  it('rejects when count exceeds available', () => {
    expect(rl.tryAcquire(6)).toBe(false)
    expect(rl.getAvailableTokens()).toBe(5)
  })

  it('throws on count < 1', () => {
    expect(() => rl.tryAcquire(0)).toThrow(RangeError)
  })

  it('tracks totalAcquired', () => {
    rl.tryAcquire(2)
    rl.tryAcquire(1)
    expect(rl.getStats().totalAcquired).toBe(3)
  })

  it('tracks totalRejected', () => {
    rl.tryAcquire(5)
    rl.tryAcquire()
    expect(rl.getStats().totalRejected).toBe(1)
  })
})

// ─── token refill ──────────────────────────────────────
describe('RateLimiter token refill', () => {
  it('refills tokens after interval', () => {
    vi.useFakeTimers()
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 2, refillIntervalMs: 100 })

    rl.tryAcquire(5)
    expect(rl.getAvailableTokens()).toBe(0)

    vi.advanceTimersByTime(100)
    expect(rl.getAvailableTokens()).toBe(2)
    vi.useRealTimers()
  })

  it('does not exceed maxTokens on refill', () => {
    vi.useFakeTimers()
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 10, refillIntervalMs: 100 })

    rl.tryAcquire(1)
    vi.advanceTimersByTime(200)
    expect(rl.getAvailableTokens()).toBe(5)
    vi.useRealTimers()
  })

  it('accumulates refills across multiple intervals', () => {
    vi.useFakeTimers()
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 50 })

    rl.tryAcquire(5)
    vi.advanceTimersByTime(300)
    expect(rl.getAvailableTokens()).toBe(10)
    vi.useRealTimers()
  })
})

// ─── getStats ──────────────────────────────────────────
describe('RateLimiter getStats', () => {
  it('returns initial stats', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 100 })
    const stats = rl.getStats()

    expect(stats.availableTokens).toBe(10)
    expect(stats.maxTokens).toBe(10)
    expect(stats.totalAcquired).toBe(0)
    expect(stats.totalRejected).toBe(0)
    expect(stats.totalRefills).toBe(0)
  })
})

// ─── reset ─────────────────────────────────────────────
describe('RateLimiter reset', () => {
  it('resets all counters and tokens', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 1, refillIntervalMs: 100 })

    rl.tryAcquire(3)
    rl.tryAcquire()
    rl.reset()

    expect(rl.getAvailableTokens()).toBe(3)
    expect(rl.getStats().totalAcquired).toBe(0)
    expect(rl.getStats().totalRejected).toBe(0)
  })
})
