import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter } from '../../src/utils/rate-limiter.js'

// ─── Constructor ──────────────────────────────────────────
describe('RateLimiter - constructor', () => {
  it('creates with valid options', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 2, refillIntervalMs: 1000 })
    expect(rl.getStats().maxTokens).toBe(10)
  })

  it('throws on maxTokens < 1', () => {
    expect(() => new RateLimiter({ maxTokens: 0, refillRate: 1, refillIntervalMs: 1000 })).toThrow(RangeError)
  })

  it('throws on refillRate < 1', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 0, refillIntervalMs: 1000 })).toThrow(RangeError)
  })

  it('throws on refillIntervalMs < 1', () => {
    expect(() => new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 0 })).toThrow(RangeError)
  })
})

// ─── tryAcquire ───────────────────────────────────────────
describe('RateLimiter - tryAcquire', () => {
  it('acquires tokens when available', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.getStats().totalAcquired).toBe(2)
  })

  it('rejects when tokens exhausted', () => {
    const rl = new RateLimiter({ maxTokens: 2, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(true)
    expect(rl.tryAcquire()).toBe(false)
    expect(rl.getStats().totalRejected).toBe(1)
  })

  it('acquires multiple tokens at once', () => {
    const rl = new RateLimiter({ maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 })
    expect(rl.tryAcquire(5)).toBe(true)
    expect(rl.getStats().totalAcquired).toBe(5)
    expect(rl.tryAcquire(6)).toBe(false)
  })

  it('throws on count < 1', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    expect(() => rl.tryAcquire(0)).toThrow(RangeError)
  })
})

// ─── Token refill ─────────────────────────────────────────
describe('RateLimiter - token refill', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('refills tokens over time', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 2, refillIntervalMs: 100 })
    rl.tryAcquire(5)
    expect(rl.getAvailableTokens()).toBe(0)
    vi.advanceTimersByTime(200)
    expect(rl.getAvailableTokens()).toBeGreaterThanOrEqual(4)
  })

  it('caps tokens at maxTokens', () => {
    const rl = new RateLimiter({ maxTokens: 3, refillRate: 5, refillIntervalMs: 100 })
    rl.tryAcquire(3)
    vi.advanceTimersByTime(1000)
    expect(rl.getAvailableTokens()).toBeLessThanOrEqual(3)
  })
})

// ─── Stats ────────────────────────────────────────────────
describe('RateLimiter - stats', () => {
  it('returns correct initial stats', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    const stats = rl.getStats()
    expect(stats.availableTokens).toBe(5)
    expect(stats.maxTokens).toBe(5)
    expect(stats.totalAcquired).toBe(0)
    expect(stats.totalRejected).toBe(0)
    expect(stats.totalRefills).toBe(0)
  })
})

// ─── Reset ────────────────────────────────────────────────
describe('RateLimiter - reset', () => {
  it('restores all tokens and clears stats', () => {
    const rl = new RateLimiter({ maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 })
    rl.tryAcquire(3)
    rl.reset()
    expect(rl.getStats().availableTokens).toBe(5)
    expect(rl.getStats().totalAcquired).toBe(0)
  })
})

// ─── acquire (async) ──────────────────────────────────────
describe('RateLimiter - acquire', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('waits for tokens to refill', async () => {
    const rl = new RateLimiter({ maxTokens: 1, refillRate: 1, refillIntervalMs: 50 })
    rl.tryAcquire()
    const p = rl.acquire()
    vi.advanceTimersByTime(100)
    await p
    expect(rl.getStats().totalAcquired).toBe(2)
  })
})
