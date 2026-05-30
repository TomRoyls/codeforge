import { describe, expect, it, afterEach, vi } from 'vitest'

import { SlidingWindowCounter } from '../../../src/utils/sliding-window-counter.js'

describe('SlidingWindowCounter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('validates windowMs >= 1', () => {
    expect(() => new SlidingWindowCounter(0)).toThrow(RangeError)
  })

  it('validates maxBuckets >= 1', () => {
    expect(() => new SlidingWindowCounter(1000, 0)).toThrow(RangeError)
  })

  it('returns 0 for empty counter', () => {
    const counter = new SlidingWindowCounter(1000)
    expect(counter.getCount()).toBe(0)
  })

  it('increments and counts', () => {
    const counter = new SlidingWindowCounter(10000)
    counter.increment()
    counter.increment()
    counter.increment()
    expect(counter.getCount()).toBe(3)
  })

  it('increments by custom amount', () => {
    const counter = new SlidingWindowCounter(10000)
    counter.increment(5)
    expect(counter.getCount()).toBe(5)
  })

  it('evicts old entries after window expires', () => {
    vi.useFakeTimers()
    const counter = new SlidingWindowCounter(100)
    counter.increment(10)
    vi.advanceTimersByTime(101)
    expect(counter.getCount()).toBe(0)
  })

  it('keeps entries within window', () => {
    vi.useFakeTimers()
    const counter = new SlidingWindowCounter(200)
    counter.increment(5)
    vi.advanceTimersByTime(100)
    counter.increment(3)
    expect(counter.getCount()).toBe(8)
  })

  it('partially evicts when some entries expire', () => {
    vi.useFakeTimers()
    const counter = new SlidingWindowCounter(100)
    counter.increment(10)
    vi.advanceTimersByTime(50)
    counter.increment(5)
    vi.advanceTimersByTime(51)
    expect(counter.getCount()).toBe(5)
  })

  it('calculates rate per second', () => {
    vi.useFakeTimers()
    const counter = new SlidingWindowCounter(1000)
    counter.increment(100)
    expect(counter.getRate()).toBe(100)
  })

  it('reset clears everything', () => {
    const counter = new SlidingWindowCounter(10000)
    counter.increment(10)
    counter.increment(20)
    counter.reset()
    expect(counter.getCount()).toBe(0)
  })
})
