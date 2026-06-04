import { describe, it, expect } from 'vitest'
import { SlidingWindowMedian } from '../../src/utils/sliding-window-median.js'

describe('SlidingWindowMedian', () => {
  it('throws error when windowSize is less than 1', () => {
    expect(() => new SlidingWindowMedian(0)).toThrow(RangeError)
    expect(() => new SlidingWindowMedian(-1)).toThrow(RangeError)
  })

  it('throws error when median called with no values', () => {
    const swm = new SlidingWindowMedian(3)
    expect(() => swm.median()).toThrow('No values added yet')
  })

  it('throws error when min called with no values', () => {
    const swm = new SlidingWindowMedian(3)
    expect(() => swm.min()).toThrow('No values added yet')
  })

  it('throws error when max called with no values', () => {
    const swm = new SlidingWindowMedian(3)
    expect(() => swm.max()).toThrow('No values added yet')
  })

  it('throws error when mean called with no values', () => {
    const swm = new SlidingWindowMedian(3)
    expect(() => swm.mean()).toThrow('No values added yet')
  })

  it('throws error when percentile called with no values', () => {
    const swm = new SlidingWindowMedian(3)
    expect(() => swm.percentile(50)).toThrow('No values added yet')
  })

  it('throws error when percentile is out of range', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    expect(() => swm.percentile(-1)).toThrow(RangeError)
    expect(() => swm.percentile(101)).toThrow(RangeError)
  })

  it('calculates median for odd window', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(3)
    swm.push(1)
    swm.push(2)
    expect(swm.median()).toBe(2)
  })

  it('calculates median for even window', () => {
    const swm = new SlidingWindowMedian(4)
    swm.push(4)
    swm.push(2)
    swm.push(3)
    swm.push(1)
    expect(swm.median()).toBe(2.5)
  })

  it('updates median when window slides', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(3)
    swm.push(1)
    swm.push(2)
    expect(swm.median()).toBe(2)
    swm.push(4)
    expect(swm.median()).toBe(2)
    swm.push(5)
    expect(swm.median()).toBe(4)
  })

  it('returns correct min value', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(3)
    swm.push(1)
    swm.push(2)
    expect(swm.min()).toBe(1)
    swm.push(0)
    expect(swm.min()).toBe(0)
  })

  it('returns correct max value', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(3)
    swm.push(1)
    swm.push(2)
    expect(swm.max()).toBe(3)
    swm.push(5)
    expect(swm.max()).toBe(5)
  })

  it('calculates correct mean', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.mean()).toBe(2)
    swm.push(4)
    expect(swm.mean()).toBe(3)
  })

  it('calculates correct percentiles', () => {
    const swm = new SlidingWindowMedian(10)
    for (let i = 1; i <= 10; i++) {
      swm.push(i)
    }
    expect(swm.percentile(0)).toBe(1)
    expect(swm.percentile(25)).toBe(3)
    expect(swm.percentile(50)).toBe(5)
    expect(swm.percentile(75)).toBe(8)
    expect(swm.percentile(100)).toBe(10)
  })

  it('returns correct size', () => {
    const swm = new SlidingWindowMedian(3)
    expect(swm.size).toBe(0)
    swm.push(1)
    expect(swm.size).toBe(1)
    swm.push(2)
    expect(swm.size).toBe(2)
    swm.push(3)
    expect(swm.size).toBe(3)
    swm.push(4)
    expect(swm.size).toBe(3)
  })

  it('returns correct totalPushed', () => {
    const swm = new SlidingWindowMedian(3)
    expect(swm.totalPushed).toBe(0)
    swm.push(1)
    expect(swm.totalPushed).toBe(1)
    swm.push(2)
    expect(swm.totalPushed).toBe(2)
    swm.push(3)
    expect(swm.totalPushed).toBe(3)
    swm.push(4)
    expect(swm.totalPushed).toBe(4)
  })

  it('returns correct isFull', () => {
    const swm = new SlidingWindowMedian(3)
    expect(swm.isFull).toBe(false)
    swm.push(1)
    expect(swm.isFull).toBe(false)
    swm.push(2)
    expect(swm.isFull).toBe(false)
    swm.push(3)
    expect(swm.isFull).toBe(true)
    swm.push(4)
    expect(swm.isFull).toBe(true)
  })

  it('clears all values', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.size).toBe(3)
    swm.clear()
    expect(swm.size).toBe(0)
    expect(swm.totalPushed).toBe(0)
    expect(swm.isFull).toBe(false)
  })

  it('converts to array correctly', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.toArray()).toEqual([1, 2, 3])
    swm.push(4)
    expect(swm.toArray()).toEqual([2, 3, 4])
  })

  it('handles duplicate values', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(2)
    swm.push(2)
    swm.push(2)
    expect(swm.median()).toBe(2)
    swm.push(1)
    expect(swm.median()).toBe(2)
  })

  it('handles negative values', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(-3)
    swm.push(-1)
    swm.push(-2)
    expect(swm.median()).toBe(-2)
    expect(swm.min()).toBe(-3)
    expect(swm.max()).toBe(-1)
  })

  it('handles floating point values', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1.5)
    swm.push(2.5)
    swm.push(3.5)
    expect(swm.median()).toBe(2.5)
    expect(swm.mean()).toBeCloseTo(2.5)
  })

  it('handles single value window', () => {
    const swm = new SlidingWindowMedian(1)
    swm.push(5)
    expect(swm.median()).toBe(5)
    expect(swm.min()).toBe(5)
    expect(swm.max()).toBe(5)
    swm.push(10)
    expect(swm.median()).toBe(10)
    expect(swm.min()).toBe(10)
    expect(swm.max()).toBe(10)
  })

  it('multiple values median', () => {
    const swm = new SlidingWindowMedian(3)
    swm.push(1)
    swm.push(2)
    swm.push(3)
    expect(swm.median()).toBe(2)
  })
})