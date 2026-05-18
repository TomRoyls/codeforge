import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TokenBucket } from '../src/utils/token-bucket.js'

// ─── constructor ───────────────────────────────────────
describe('TokenBucket constructor', () => {
  it('creates bucket with capacity and fill rate', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    expect(tb.available).toBe(10)
  })

  it('throws on capacity < 1', () => {
    expect(() => new TokenBucket({ capacity: 0, fillRate: 1 })).toThrow(RangeError)
  })

  it('throws on fillRate <= 0', () => {
    expect(() => new TokenBucket({ capacity: 10, fillRate: 0 })).toThrow(RangeError)
  })
})

// ─── consume ──────────────────────────────────────────
describe('TokenBucket consume', () => {
  let tb: TokenBucket

  beforeEach(() => {
    tb = new TokenBucket({ capacity: 5, fillRate: 1 })
  })

  it('consumes tokens successfully', () => {
    expect(tb.consume()).toBe(true)
    expect(tb.available).toBe(4)
  })

  it('consumes multiple tokens', () => {
    expect(tb.consume(3)).toBe(true)
    expect(tb.available).toBe(2)
  })

  it('rejects when insufficient tokens', () => {
    expect(tb.consume(5)).toBe(true)
    expect(tb.consume(1)).toBe(false)
  })

  it('throws on count < 1', () => {
    expect(() => tb.consume(0)).toThrow(RangeError)
  })

  it('tracks totalGranted', () => {
    tb.consume(2)
    tb.consume(1)
    expect(tb.getStats().totalGranted).toBe(3)
  })

  it('tracks totalRejected', () => {
    tb.consume(5)
    tb.consume()
    expect(tb.getStats().totalRejected).toBe(1)
  })
})

// ─── refill ───────────────────────────────────────────
describe('TokenBucket refill', () => {
  it('refills tokens over time', () => {
    vi.useFakeTimers()
    const tb = new TokenBucket({ capacity: 10, fillRate: 5 })
    tb.consume(10)
    vi.advanceTimersByTime(1000)
    expect(tb.available).toBe(5)
    vi.useRealTimers()
  })

  it('does not exceed capacity', () => {
    vi.useFakeTimers()
    const tb = new TokenBucket({ capacity: 5, fillRate: 100 })
    tb.consume(1)
    vi.advanceTimersByTime(5000)
    expect(tb.available).toBe(5)
    vi.useRealTimers()
  })
})

// ─── wait ─────────────────────────────────────────────
describe('TokenBucket wait', () => {
  it('returns 0 when tokens available', () => {
    const tb = new TokenBucket({ capacity: 10, fillRate: 1 })
    expect(tb.wait(1)).toBe(0)
  })

  it('calculates wait time when empty', () => {
    const tb = new TokenBucket({ capacity: 1, fillRate: 1 })
    tb.consume(1)
    const waitMs = tb.wait(1)
    expect(waitMs).toBeGreaterThan(0)
  })
})

// ─── reset ────────────────────────────────────────────
describe('TokenBucket reset', () => {
  it('resets to full capacity', () => {
    const tb = new TokenBucket({ capacity: 5, fillRate: 1 })
    tb.consume(5)
    tb.reset()
    expect(tb.available).toBe(5)
    expect(tb.getStats().totalGranted).toBe(0)
  })
})
