import { describe, expect, it, vi, afterEach } from 'vitest'

import { TokenBucket } from '../../../src/utils/token-bucket.js'

describe('TokenBucket', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with full tokens', () => {
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 1, refillInterval: 1000 })
    expect(bucket.getAvailableTokens()).toBe(10)
  })

  it('consumes a token', () => {
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 1, refillInterval: 1000 })
    expect(bucket.tryConsume()).toBe(true)
    expect(bucket.getAvailableTokens()).toBe(9)
  })

  it('consumes multiple tokens', () => {
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 1, refillInterval: 1000 })
    expect(bucket.tryConsume(5)).toBe(true)
    expect(bucket.getAvailableTokens()).toBe(5)
  })

  it('rejects when not enough tokens', () => {
    const bucket = new TokenBucket({ maxTokens: 2, refillRate: 1, refillInterval: 1000 })
    expect(bucket.tryConsume(3)).toBe(false)
    expect(bucket.getAvailableTokens()).toBe(2)
  })

  it('consume throws when not enough tokens', () => {
    const bucket = new TokenBucket({ maxTokens: 1, refillRate: 1, refillInterval: 1000 })
    bucket.consume(1)
    expect(() => bucket.consume(1)).toThrow('Insufficient tokens')
  })

  it('refills tokens over time', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 2, refillInterval: 1000 })
    bucket.tryConsume(10)
    expect(bucket.getAvailableTokens()).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(bucket.getAvailableTokens()).toBe(2)
  })

  it('does not exceed max tokens', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket({ maxTokens: 5, refillRate: 10, refillInterval: 1000 })
    vi.advanceTimersByTime(5000)
    expect(bucket.getAvailableTokens()).toBe(5)
  })

  it('accumulates partial refills', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 1, refillInterval: 500 })
    bucket.tryConsume(10)
    vi.advanceTimersByTime(1500)
    expect(bucket.getAvailableTokens()).toBe(3)
  })

  it('reset restores full tokens', () => {
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 1, refillInterval: 1000 })
    bucket.tryConsume(5)
    bucket.reset()
    expect(bucket.getAvailableTokens()).toBe(10)
  })

  it('getCapacity returns max tokens', () => {
    const bucket = new TokenBucket({ maxTokens: 42, refillRate: 1, refillInterval: 1000 })
    expect(bucket.getCapacity()).toBe(42)
  })

  it('getRefillRate returns rate', () => {
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 5, refillInterval: 1000 })
    expect(bucket.getRefillRate()).toBe(5)
  })

  it('throws for maxTokens < 1', () => {
    expect(() => new TokenBucket({ maxTokens: 0, refillRate: 1, refillInterval: 1000 })).toThrow()
  })

  it('throws for refillRate < 1', () => {
    expect(() => new TokenBucket({ maxTokens: 10, refillRate: 0, refillInterval: 1000 })).toThrow()
  })

  it('throws for refillInterval < 1', () => {
    expect(() => new TokenBucket({ maxTokens: 10, refillRate: 1, refillInterval: 0 })).toThrow()
  })

  it('handles bucket of size 1', () => {
    const bucket = new TokenBucket({ maxTokens: 1, refillRate: 1, refillInterval: 1000 })
    expect(bucket.tryConsume()).toBe(true)
    expect(bucket.tryConsume()).toBe(false)
  })

  it('drains completely and refills', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket({ maxTokens: 5, refillRate: 5, refillInterval: 1000 })
    for (let i = 0; i < 5; i++) bucket.tryConsume()
    expect(bucket.getAvailableTokens()).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(bucket.getAvailableTokens()).toBe(5)
  })

  it('waitForToken resolves immediately when tokens available', async () => {
    const bucket = new TokenBucket({ maxTokens: 10, refillRate: 1, refillInterval: 1000 })
    await bucket.waitForToken()
    expect(bucket.getAvailableTokens()).toBe(9)
  })
})
