import { describe, it, expect } from 'vitest'
import { TokenBucket } from '../../src/utils/token-bucket.js'

// ─── Constructor ──────────────────────────────────────────
describe('TokenBucket - constructor', () => {
  it('creates with valid options', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    expect(tb.available).toBe(10)
  })

  it('throws on invalid capacity', () => {
    expect(() => new TokenBucket({ capacity: 0, fillRate: 1 })).toThrow(RangeError)
  })

  it('throws on invalid fillRate', () => {
    expect(() => new TokenBucket({ capacity: 10, fillRate: 0 })).toThrow(RangeError)
  })
})

// ─── Consume ──────────────────────────────────────────────
describe('TokenBucket - consume', () => {
  it('consumes tokens', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    expect(tb.consume(5)).toBe(true)
    expect(tb.available).toBe(5)
  })

  it('rejects when insufficient tokens', () => {
    const tb = new TokenBucket({ capacity: 5, fillRate: 1 })
    expect(tb.consume(3)).toBe(true)
    expect(tb.consume(3)).toBe(false)
  })

  it('throws on invalid count', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    expect(() => tb.consume(0)).toThrow(RangeError)
  })
})

// ─── Stats and Reset ──────────────────────────────────────
describe('TokenBucket - stats and reset', () => {
  it('tracks stats', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    tb.consume(3)
    const stats = tb.getStats()
    expect(stats.totalGranted).toBe(3)
    expect(stats.capacity).toBe(10)
  })

  it('resets tokens and stats', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    tb.consume(5)
    tb.reset()
    expect(tb.available).toBe(10)
    expect(tb.getStats().totalGranted).toBe(0)
  })
})

// ─── Wait ─────────────────────────────────────────────────
describe('TokenBucket - wait', () => {
  it('returns 0 when tokens available', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    expect(tb.wait(5)).toBe(0)
  })

  it('returns wait time when insufficient', () => {
    const tb = new TokenBucket({ capacity: 5, fillRate: 1 })
    tb.consume(5)
    expect(tb.wait(5)).toBeGreaterThan(0)
  })

  it('consume 1 token by default', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    expect(tb.consume()).toBe(true)
    expect(tb.available).toBe(9)
  })

  it('repeated rejections do not affect stats', () => {
    const tb = new TokenBucket({ capacity: 5, fillRate: 1 })
    tb.consume(3)
    const result = tb.consume(3)
    expect(result).toBe(false)
    expect(tb.available).toBe(2)
  })

  it('consume all tokens leaves zero available', () => {
    const tb = new TokenBucket({ capacity: 5, fillRate: 1 })
    expect(tb.consume(5)).toBe(true)
    expect(tb.available).toBe(0)
    expect(tb.consume(1)).toBe(false)
  })

  it('wait returns correct value for partially filled', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    tb.consume(8)
    const waitTime = tb.wait(5)
    expect(waitTime).toBeGreaterThan(0)
  })

  it('getStats tracks capacity and fillRate', () => {
    const tb = new TokenBucket({ capacity: 5, fillRate: 2 })
    const stats = tb.getStats()
    expect(stats.capacity).toBe(5)
    expect(stats.fillRate).toBe(2)
    expect(stats.totalGranted).toBe(0)
  })
})
