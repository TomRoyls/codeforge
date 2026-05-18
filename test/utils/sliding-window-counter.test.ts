import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SlidingWindowCounter } from '../../src/utils/sliding-window-counter.js'

// ─── Constructor validation ─────────────────────────────
describe('SlidingWindowCounter - constructor', () => {
  it('creates counter with valid windowMs', () => {
    const counter = new SlidingWindowCounter(1000)
    expect(counter.getCount()).toBe(0)
  })

  it('creates counter with custom maxBuckets', () => {
    const counter = new SlidingWindowCounter(1000, 500)
    expect(counter.getCount()).toBe(0)
  })

  it('throws RangeError when windowMs is 0', () => {
    expect(() => new SlidingWindowCounter(0)).toThrow(RangeError)
  })

  it('throws RangeError when windowMs is negative', () => {
    expect(() => new SlidingWindowCounter(-100)).toThrow(RangeError)
  })

  it('RangeError message includes the invalid windowMs', () => {
    expect(() => new SlidingWindowCounter(-5)).toThrow('windowMs must be >= 1, got -5')
  })

  it('throws RangeError when maxBuckets is 0', () => {
    expect(() => new SlidingWindowCounter(1000, 0)).toThrow(RangeError)
  })

  it('throws RangeError when maxBuckets is negative', () => {
    expect(() => new SlidingWindowCounter(1000, -1)).toThrow(RangeError)
  })

  it('RangeError message includes the invalid maxBuckets', () => {
    expect(() => new SlidingWindowCounter(1000, -3)).toThrow('maxBuckets must be >= 1, got -3')
  })
})

// ─── Increment and count ────────────────────────────────
describe('SlidingWindowCounter - increment and count', () => {
  it('increment adds to count', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment()
    expect(counter.getCount()).toBe(1)
  })

  it('increment with custom count', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(5)
    expect(counter.getCount()).toBe(5)
  })

  it('multiple increments accumulate', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment()
    counter.increment()
    counter.increment()
    expect(counter.getCount()).toBe(3)
  })

  it('increment with mixed counts', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(2)
    counter.increment(3)
    counter.increment(1)
    expect(counter.getCount()).toBe(6)
  })

  it('getCount returns 0 initially', () => {
    const counter = new SlidingWindowCounter(1000)
    expect(counter.getCount()).toBe(0)
  })
})

// ─── Reset ──────────────────────────────────────────────
describe('SlidingWindowCounter - reset', () => {
  it('reset clears count to 0', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(10)
    counter.reset()
    expect(counter.getCount()).toBe(0)
  })

  it('reset allows counting fresh after reset', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(5)
    counter.reset()
    counter.increment(3)
    expect(counter.getCount()).toBe(3)
  })
})

// ─── Rate calculation ───────────────────────────────────
describe('SlidingWindowCounter - getRate', () => {
  it('getRate returns count per second', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(10)
    expect(counter.getRate()).toBe(10)
  })

  it('getRate for 2-second window', () => {
    const counter = new SlidingWindowCounter(2000)
    counter.increment(10)
    expect(counter.getRate()).toBe(5)
  })

  it('getRate is 0 when no increments', () => {
    const counter = new SlidingWindowCounter(1000)
    expect(counter.getRate()).toBe(0)
  })
})

// ─── Time-based eviction ────────────────────────────────
describe('SlidingWindowCounter - time-based eviction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('count includes recent events', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(5)
    expect(counter.getCount()).toBe(5)
  })

  it('count evicts old events outside window', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(10)
    vi.advanceTimersByTime(1001)
    counter.increment(1)
    expect(counter.getCount()).toBe(1)
  })

  it('count retains events within window', () => {
    const counter = new SlidingWindowCounter(2000)
    counter.increment(5)
    vi.advanceTimersByTime(1000)
    counter.increment(3)
    expect(counter.getCount()).toBe(8)
  })

  it('events expire exactly at window boundary', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(7)
    vi.advanceTimersByTime(1000)
    expect(counter.getCount()).toBe(7)
    vi.advanceTimersByTime(1)
    expect(counter.getCount()).toBe(0)
  })

  it('multiple buckets expire correctly', () => {
    const counter = new SlidingWindowCounter(3000)
    counter.increment(1)
    vi.advanceTimersByTime(1000)
    counter.increment(2)
    vi.advanceTimersByTime(1000)
    counter.increment(3)
    expect(counter.getCount()).toBe(6)
    vi.advanceTimersByTime(1001)
    expect(counter.getCount()).toBe(5)
  })

  it('rate updates after eviction', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(10)
    vi.advanceTimersByTime(1001)
    expect(counter.getRate()).toBe(0)
  })
})

// ─── MaxBuckets enforcement ─────────────────────────────
describe('SlidingWindowCounter - maxBuckets', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('enforces maxBuckets limit', () => {
    const counter = new SlidingWindowCounter(10000, 3)
    counter.increment(1)
    vi.advanceTimersByTime(1)
    counter.increment(1)
    vi.advanceTimersByTime(1)
    counter.increment(1)
    vi.advanceTimersByTime(1)
    counter.increment(1)
    expect(counter.getCount()).toBe(3)
  })
})

// ─── Same-timestamp bucket merging ──────────────────────
describe('SlidingWindowCounter - same timestamp', () => {
  it('merges increments at same timestamp', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(3)
    counter.increment(4)
    expect(counter.getCount()).toBe(7)
  })
})
