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
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 1000 })
    const results: boolean[] = []
    for (let i = 0; i < 5; i++) {
      const result = rl.tryAcquire()
      results.push(result.allowed)
    }
    expect(results.every((r) => r)).toBe(true)
  })

  it('blocks requests over limit', () => {
    const rl = new RateLimiter({ maxRequests: 3, windowMs: 1000 })
    for (let i = 0; i < 3; i++) {
      rl.tryAcquire()
    }
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(false)
  })

  it('remaining decreases', () => {
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 1000 })
    const result1 = rl.tryAcquire()
    expect(result1.remaining).toBe(4)
    const result2 = rl.tryAcquire()
    expect(result2.remaining).toBe(3)
  })

  it('retryAfterMs is reasonable', () => {
    const rl = new RateLimiter({ maxRequests: 2, windowMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    const result = rl.tryAcquire()
    expect(result.retryAfterMs).toBeGreaterThan(0)
    expect(result.retryAfterMs).toBeLessThanOrEqual(1000)
  })

  it('different keys are independent', () => {
    const rl = new RateLimiter({ maxRequests: 2, windowMs: 1000 })
    rl.tryAcquire('key1')
    rl.tryAcquire('key1')
    expect(rl.tryAcquire('key1').allowed).toBe(false)
    expect(rl.tryAcquire('key2').allowed).toBe(true)
  })

  it('reset clears counter', () => {
    const rl = new RateLimiter({ maxRequests: 2, windowMs: 1000 })
    rl.tryAcquire('key1')
    rl.tryAcquire('key1')
    expect(rl.tryAcquire('key1').allowed).toBe(false)
    rl.reset('key1')
    expect(rl.tryAcquire('key1').allowed).toBe(true)
  })

  it('resetAll clears everything', () => {
    const rl = new RateLimiter({ maxRequests: 2, windowMs: 1000 })
    rl.tryAcquire('key1')
    rl.tryAcquire('key1')
    rl.tryAcquire('key2')
    rl.resetAll()
    expect(rl.tryAcquire('key1').allowed).toBe(true)
    expect(rl.tryAcquire('key2').allowed).toBe(true)
  })

  it('getStatus does not consume quota', () => {
    const rl = new RateLimiter({ maxRequests: 3, windowMs: 1000 })
    const status1 = rl.getStatus()
    expect(status1.remaining).toBe(3)
    const status2 = rl.getStatus()
    expect(status2.remaining).toBe(3)
    rl.tryAcquire()
    const status3 = rl.getStatus()
    expect(status3.remaining).toBe(2)
  })

  it('window rolls over', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 1000 })
    for (let i = 0; i < 5; i++) {
      rl.tryAcquire()
    }
    expect(rl.tryAcquire().allowed).toBe(false)
    vi.advanceTimersByTime(1001)
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(true)
    vi.useRealTimers()
  })

  it('maxRequests is readonly', () => {
    const rl = new RateLimiter({ maxRequests: 10, windowMs: 1000 })
    expect(rl.maxRequests).toBe(10)
  })

  it('zero maxRequests blocks all', () => {
    const rl = new RateLimiter({ maxRequests: 0, windowMs: 1000 })
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(false)
  })

  it('acquire returns boolean', () => {
    const rl = new RateLimiter({ maxRequests: 3, windowMs: 1000 })
    expect(rl.acquire()).toBe(true)
    expect(rl.acquire()).toBe(true)
    expect(rl.acquire()).toBe(true)
    expect(rl.acquire()).toBe(false)
  })

  it('multiple windows tracked', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 1000 })
    for (let i = 0; i < 3; i++) {
      rl.tryAcquire()
    }
    vi.advanceTimersByTime(500)
    for (let i = 0; i < 3; i++) {
      rl.tryAcquire()
    }
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(false)
    vi.useRealTimers()
  })

  it('getStatus returns limit', () => {
    const rl = new RateLimiter({ maxRequests: 10, windowMs: 1000 })
    const status = rl.getStatus()
    expect(status.limit).toBe(10)
  })

  it('windowMs is readonly', () => {
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 2000 })
    expect(rl.windowMs).toBe(2000)
  })

  it('getStatus returns remaining after partial use', () => {
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 1000 })
    rl.tryAcquire()
    rl.tryAcquire()
    rl.tryAcquire()
    const status = rl.getStatus()
    expect(status.remaining).toBe(2)
  })

  it('tryAcquire returns retryAfterMs when blocked', () => {
    const rl = new RateLimiter({ maxRequests: 1, windowMs: 1000 })
    rl.tryAcquire()
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(false)
    expect(typeof result.retryAfterMs).toBe('number')
  })

  it('allows request after reset', () => {
    const rl = new RateLimiter(5, 1000)
    for (let i = 0; i < 5; i++) rl.tryAcquire()
    rl.reset()
    expect(rl.tryAcquire().allowed).toBe(true)
  })

  it('tryAcquire returns object with allowed property', () => {
    const rl = new RateLimiter({ tokensPerSecond: 100, maxTokens: 10 })
    const result = rl.tryAcquire()
    expect(result).toHaveProperty('allowed')
  })

  it('tryAcquire returns allowed initially', () => {
    const rl = new RateLimiter({ tokensPerSecond: 100, maxTokens: 10 })
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(true)
  })

  it('has configurable tokensPerSecond', () => {
    const rl = new RateLimiter({ tokensPerSecond: 10, maxTokens: 5 })
    expect(rl).toBeDefined()
  })

  it('tryAcquire returns allowed when under limit', () => {
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 1000 })
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(true)
  })

  it('second immediate acquire succeeds', () => {
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 1000 })
    rl.tryAcquire()
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(true)
  })

  it('tryAcquire respects limit', () => {
    const rl = new RateLimiter({ limit: 1, interval: 100000 })
    rl.tryAcquire()
    const result = rl.tryAcquire()
    expect(result.allowed).toBe(false)
  })
})
