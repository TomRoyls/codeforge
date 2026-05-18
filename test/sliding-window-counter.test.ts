import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SlidingWindowCounter } from '../src/utils/sliding-window-counter.js'

// ─── constructor ───────────────────────────────────────
describe('SlidingWindowCounter constructor', () => {
  it('creates counter with window duration', () => {
    const counter = new SlidingWindowCounter(1000)
    expect(counter.getCount()).toBe(0)
  })

  it('throws on windowMs < 1', () => {
    expect(() => new SlidingWindowCounter(0)).toThrow(RangeError)
  })
})

// ─── increment/getCount ───────────────────────────────
describe('SlidingWindowCounter increment', () => {
  it('increments count', () => {
    const counter = new SlidingWindowCounter(5000)
    counter.increment()
    counter.increment()
    expect(counter.getCount()).toBe(2)
  })

  it('increments by custom amount', () => {
    const counter = new SlidingWindowCounter(5000)
    counter.increment(5)
    expect(counter.getCount()).toBe(5)
  })

  it('evicts old entries outside window', () => {
    vi.useFakeTimers()
    const counter = new SlidingWindowCounter(100)

    counter.increment(10)
    vi.advanceTimersByTime(150)
    expect(counter.getCount()).toBe(0)
    vi.useRealTimers()
  })

  it('keeps entries within window', () => {
    vi.useFakeTimers()
    const counter = new SlidingWindowCounter(200)

    counter.increment(5)
    vi.advanceTimersByTime(100)
    counter.increment(3)
    expect(counter.getCount()).toBe(8)
    vi.useRealTimers()
  })
})

// ─── getRate ──────────────────────────────────────────
describe('SlidingWindowCounter getRate', () => {
  it('calculates events per second', () => {
    const counter = new SlidingWindowCounter(1000)
    counter.increment(10)
    expect(counter.getRate()).toBe(10)
  })

  it('returns 0 for empty window', () => {
    const counter = new SlidingWindowCounter(1000)
    expect(counter.getRate()).toBe(0)
  })
})

// ─── reset ────────────────────────────────────────────
describe('SlidingWindowCounter reset', () => {
  it('clears all counters', () => {
    const counter = new SlidingWindowCounter(5000)
    counter.increment(10)
    counter.reset()
    expect(counter.getCount()).toBe(0)
  })
})
