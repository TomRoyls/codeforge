import { describe, expect, it } from 'vitest'
import { SlidingWindowStats } from '../../src/utils/sliding-window-stats.js'

describe('SlidingWindowStats', () => {
  it('computes mean of window', () => {
    const sw = new SlidingWindowStats(3)
    sw.push(2)
    sw.push(4)
    sw.push(6)
    expect(sw.mean).toBeCloseTo(4)
  })

  it('slides window and updates mean', () => {
    const sw = new SlidingWindowStats(2)
    sw.push(10)
    sw.push(20)
    expect(sw.mean).toBeCloseTo(15)
    sw.push(30)
    expect(sw.mean).toBeCloseTo(25)
  })

  it('computes variance', () => {
    const sw = new SlidingWindowStats(4)
    sw.push(2)
    sw.push(4)
    sw.push(4)
    sw.push(4)
    expect(sw.variance).toBeCloseTo(1)
  })

  it('computes stddev', () => {
    const sw = new SlidingWindowStats(3)
    sw.push(1)
    sw.push(2)
    sw.push(3)
    expect(sw.stddev).toBeCloseTo(1)
  })

  it('computes min and max', () => {
    const sw = new SlidingWindowStats(5)
    sw.push(3)
    sw.push(1)
    sw.push(4)
    sw.push(1)
    sw.push(5)
    expect(sw.min).toBe(1)
    expect(sw.max).toBe(5)
  })

  it('tracks count', () => {
    const sw = new SlidingWindowStats(3)
    expect(sw.count).toBe(0)
    sw.push(1)
    expect(sw.count).toBe(1)
    sw.push(2)
    sw.push(3)
    expect(sw.count).toBe(3)
    sw.push(4)
    expect(sw.count).toBe(3)
  })

  it('isFull works', () => {
    const sw = new SlidingWindowStats(2)
    expect(sw.isFull).toBe(false)
    sw.push(1)
    expect(sw.isFull).toBe(false)
    sw.push(2)
    expect(sw.isFull).toBe(true)
  })

  it('total returns sum', () => {
    const sw = new SlidingWindowStats(5)
    sw.push(1)
    sw.push(2)
    sw.push(3)
    expect(sw.total).toBe(6)
  })

  it('clear resets all state', () => {
    const sw = new SlidingWindowStats(3)
    sw.push(1)
    sw.push(2)
    sw.clear()
    expect(sw.count).toBe(0)
    expect(sw.mean).toBe(0)
  })

  it('toArray returns window contents', () => {
    const sw = new SlidingWindowStats(3)
    sw.push(1)
    sw.push(2)
    expect(sw.toArray()).toEqual([1, 2])
  })

  it('handles single value', () => {
    const sw = new SlidingWindowStats(5)
    sw.push(42)
    expect(sw.mean).toBe(42)
    expect(sw.variance).toBe(0)
    expect(sw.min).toBe(42)
    expect(sw.max).toBe(42)
  })

  it('empty window returns 0 for stats', () => {
    const sw = new SlidingWindowStats(5)
    expect(sw.mean).toBe(0)
    expect(sw.variance).toBe(0)
    expect(sw.min).toBe(0)
    expect(sw.max).toBe(0)
  })

  it('throws on invalid windowSize', () => {
    expect(() => new SlidingWindowStats(0)).toThrow(RangeError)
    expect(() => new SlidingWindowStats(-1)).toThrow(RangeError)
  })

  it('handles negative values', () => {
    const sw = new SlidingWindowStats(3)
    sw.push(-1)
    sw.push(-2)
    sw.push(-3)
    expect(sw.mean).toBeCloseTo(-2)
    expect(sw.total).toBe(-6)
  })

  it('handles many pushes with sliding', () => {
    const sw = new SlidingWindowStats(3)
    for (let i = 1; i <= 100; i++) sw.push(i)
    expect(sw.count).toBe(3)
    expect(sw.mean).toBeCloseTo(99)
    expect(sw.total).toBeCloseTo(297)
  })

  it('handles window size 1', () => {
    const sw = new SlidingWindowStats(1)
    sw.push(10)
    sw.push(20)
    expect(sw.mean).toBe(20)
    expect(sw.count).toBe(1)
  })

  it('variance increases with spread', () => {
    const sw = new SlidingWindowStats(3)
    sw.push(1)
    sw.push(2)
    sw.push(10)
    expect(sw.variance).toBeGreaterThan(0)
  })

  it('single element has zero variance', () => {
    const sw = new SlidingWindowStats(5)
    sw.push(42)
    expect(sw.variance).toBe(0)
  })

  it('mean of 1,2,3 is 2', () => {
    const sw = new SlidingWindowStats(3)
    sw.push(1)
    sw.push(2)
    sw.push(3)
    expect(sw.mean).toBeCloseTo(2, 5)
  })

  it('count tracks pushes', () => {
    const sw = new SlidingWindowStats(5)
    sw.push(1)
    sw.push(2)
    sw.push(3)
    expect(sw.count).toBe(3)
  })
})
