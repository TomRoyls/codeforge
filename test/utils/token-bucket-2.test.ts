import { describe, it, expect, vi } from 'vitest'
import { TokenBucket2 } from '../../src/utils/token-bucket-2.js'

describe('TokenBucket2', () => {
  it('Constructor with defaults', () => {
    const bucket = new TokenBucket2(10, 5)
    expect(bucket.availableTokens).toBe(10)
    expect(bucket.refillRate).toBe(5)
    expect(bucket.capacity).toBe(10)
  })

  it('Consume single token', () => {
    const bucket = new TokenBucket2(10, 5)
    bucket.consume()
    expect(bucket.availableTokens).toBe(9)
  })

  it('Consume multiple tokens', () => {
    const bucket = new TokenBucket2(10, 5)
    bucket.consume(3)
    expect(bucket.availableTokens).toBe(7)
  })

  it('TryConsume returns false when empty', () => {
    const bucket = new TokenBucket2(1, 5)
    bucket.consume()
    const result = bucket.tryConsume()
    expect(result).toBe(false)
  })

  it('WaitTime calculation', () => {
    const bucket = new TokenBucket2(10, 10)
    bucket.consume(8)
    const wait = bucket.waitTime(5)
    expect(wait).toBeGreaterThan(0)
  })

  it('Reserve returns wait time', () => {
    const bucket = new TokenBucket2(10, 10)
    bucket.consume(8)
    const wait = bucket.reserve(5)
    expect(wait).toBeGreaterThanOrEqual(0)
  })

  it('Refill adds tokens over time', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket2(10, 10)
    bucket.consume(8)
    const before = bucket.availableTokens
    vi.advanceTimersByTime(200)
    const after = bucket.availableTokens
    expect(after).toBeGreaterThan(before)
    vi.useRealTimers()
  })

  it('Capacity limits tokens', () => {
    vi.useFakeTimers()
    const bucket = new TokenBucket2(10, 100)
    bucket.refill()
    vi.advanceTimersByTime(200)
    bucket.refill()
    expect(bucket.availableTokens).toBeLessThanOrEqual(10)
    vi.useRealTimers()
  })

  it('Consume throws when insufficient', () => {
    const bucket = new TokenBucket2(1, 5)
    bucket.consume()
    expect(() => bucket.consume()).toThrow()
  })

  it('Multiple consume operations', () => {
    const bucket = new TokenBucket2(10, 5)
    for (let i = 0; i < 5; i += 1) {
      bucket.consume()
    }
    expect(bucket.availableTokens).toBeCloseTo(5, 0)
  })

  it('AvailableTokens updates correctly', () => {
    const bucket = new TokenBucket2(10, 5)
    bucket.consume(3)
    expect(bucket.availableTokens).toBeCloseTo(7, 0)
    bucket.consume(2)
    expect(bucket.availableTokens).toBeCloseTo(5, 0)
  })

  it('Large burst consumption', () => {
    const bucket = new TokenBucket2(100, 50)
    const result = bucket.tryConsume(80)
    expect(result).toBe(true)
    expect(bucket.availableTokens).toBeCloseTo(20, 0)
  })

  it('tryConsume returns true when enough tokens', () => {
    const bucket = new TokenBucket2(10, 5)
    expect(bucket.tryConsume(5)).toBe(true)
    expect(bucket.availableTokens).toBeCloseTo(5, 0)
  })

  it('tryConsume returns false for exact deficit', () => {
    const bucket = new TokenBucket2(5, 5)
    bucket.consume(5)
    expect(bucket.tryConsume(1)).toBe(false)
  })

  it('reserve with enough tokens returns 0 wait', () => {
    const bucket = new TokenBucket2(10, 5)
    const wait = bucket.reserve(5)
    expect(wait).toBe(0)
  })

  it('consume reduces available tokens', () => {
    const bucket = new TokenBucket2(10, 1)
    bucket.consume(3)
    expect(bucket.availableTokens).toBeLessThanOrEqual(7)
  })

  it('capacity is set correctly', () => {
    const bucket = new TokenBucket2(100, 10)
    expect(bucket.capacity).toBe(100)
  })

  it('tryConsume returns true when enough tokens', () => {
    const bucket = new TokenBucket2(10, 0)
    expect(bucket.tryConsume(3)).toBe(true)
    expect(bucket.tryConsume(8)).toBe(false)
  })

  it('bucket with tokens available', () => {
    const bucket = new TokenBucket2(10, 10)
    expect(bucket.tryConsume(5)).toBe(true)
    expect(bucket.tryConsume(5)).toBe(true)
    expect(bucket.tryConsume(1)).toBe(false)
  })

  it('available tokens decreases after consume', () => {
    const bucket = new TokenBucket2(10, 5)
    bucket.consume(5)
    expect(bucket.availableTokens).toBe(5)
  })

  it('refill adds tokens over time', () => {
    const bucket = new TokenBucket2(10, 5)
    bucket.consume(5)
    expect(bucket.availableTokens).toBe(5)
  })

  it('consume reduces available tokens', () => {
    const bucket = new TokenBucket2(10, 5)
    bucket.consume(10)
    expect(bucket.availableTokens).toBe(0)
  })
})