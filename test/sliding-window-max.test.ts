import { describe, it, expect } from 'vitest'
import { SlidingWindowMax } from '../src/core/sliding-window-max/index.js'

// ─── Constructor ───
describe('SlidingWindowMax constructor', () => {
  it('creates with windowSize', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    expect(sw.windowSize).toBe(3)
    expect(sw.size).toBe(0)
    expect(sw.isEmpty).toBe(true)
  })

  it('creates with default windowSize', () => {
    const sw = new SlidingWindowMax()
    expect(sw.windowSize).toBe(Infinity)
  })

  it('throws on windowSize < 1', () => {
    expect(() => new SlidingWindowMax({ windowSize: 0 })).toThrow(RangeError)
  })
})

// ─── Push and Max ───
describe('SlidingWindowMax push and max', () => {
  it('tracks max in window', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.push(5)
    sw.push(3)
    expect(sw.max()).toBe(5)
  })

  it('updates max after sliding', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(5)
    sw.push(3)
    sw.push(1)
    sw.push(2)
    expect(sw.max()).toBe(3)
  })

  it('tracks min in window', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(5)
    sw.push(3)
    sw.push(1)
    expect(sw.min()).toBe(1)
  })

  it('returns undefined for empty', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    expect(sw.max()).toBeUndefined()
    expect(sw.min()).toBeUndefined()
  })

  it('top is alias for max', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(5)
    expect(sw.top()).toBe(sw.max())
  })
})

// ─── Window Operations ───
describe('SlidingWindowMax window operations', () => {
  it('tracks size correctly', () => {
    const sw = new SlidingWindowMax({ windowSize: 2 })
    sw.push(1)
    expect(sw.size).toBe(1)
    sw.push(2)
    expect(sw.size).toBe(2)
    sw.push(3)
    expect(sw.size).toBe(2)
  })

  it('toArray returns current window', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.push(2)
    sw.push(3)
    sw.push(4)
    expect(sw.toArray()).toEqual([2, 3, 4])
  })

  it('first and last', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.push(2)
    expect(sw.first()).toBe(1)
    expect(sw.last()).toBe(2)
  })
})

// ─── Clear / Reset / Clone ───
describe('SlidingWindowMax clear, reset, clone', () => {
  it('clear resets window', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.clear()
    expect(sw.isEmpty).toBe(true)
  })

  it('reset clears history', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.reset()
    expect(sw.isEmpty).toBe(true)
    expect(sw.allMaxima()).toEqual([])
  })

  it('clone produces independent copy', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.push(2)
    const c = sw.clone()
    c.push(3)
    expect(sw.size).toBe(2)
    expect(c.size).toBe(3)
  })
})

// ─── AllMaxima ───
describe('SlidingWindowMax allMaxima', () => {
  it('computes all window maxima', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.push(3)
    sw.push(2)
    sw.push(4)
    const maxima = sw.allMaxima()
    expect(maxima).toEqual([3, 4])
  })

  it('returns empty for infinite window', () => {
    const sw = new SlidingWindowMax()
    sw.push(1)
    expect(sw.allMaxima()).toEqual([])
  })
})

// ─── Static / Iteration ───
describe('SlidingWindowMax static and iteration', () => {
  it('static fromArray', () => {
    const sw = SlidingWindowMax.fromArray([1, 5, 3, 2], { windowSize: 3 })
    expect(sw.max()).toBe(5)
  })

  it('forEach iterates window', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.push(2)
    const vals: number[] = []
    sw.forEach((v) => vals.push(v))
    expect(vals).toEqual([1, 2])
  })

  it('Symbol.iterator works', () => {
    const sw = new SlidingWindowMax({ windowSize: 3 })
    sw.push(1)
    sw.push(2)
    expect([...sw]).toEqual([1, 2])
  })

  it('pushAll adds multiple values', () => {
    const sw = new SlidingWindowMax({ windowSize: 5 })
    sw.pushAll([1, 2, 3])
    expect(sw.size).toBe(3)
  })
})
