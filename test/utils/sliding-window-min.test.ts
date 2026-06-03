import { describe, expect, it } from 'vitest'
import { SlidingWindowMin } from '../../src/utils/sliding-window-min.js'

describe('SlidingWindowMin', () => {
  it('returns undefined before window is full', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(3)).toBeUndefined()
  })

  it('returns min after window is full', () => {
    const swm = new SlidingWindowMin(3)
    swm.push(5)
    swm.push(3)
    expect(swm.push(7)).toBe(3)
  })

  it('slides window correctly', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(3)).toBeUndefined()
    expect(swm.push(7)).toBe(3)
    expect(swm.push(1)).toBe(1)
    expect(swm.push(4)).toBe(1)
    expect(swm.push(6)).toBe(1)
  })

  it('handles window size 1', () => {
    const swm = new SlidingWindowMin(1)
    expect(swm.push(5)).toBe(5)
    expect(swm.push(3)).toBe(3)
    expect(swm.push(7)).toBe(7)
  })

  it('handles descending values', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(4)).toBeUndefined()
    expect(swm.push(3)).toBe(3)
    expect(swm.push(2)).toBe(2)
  })

  it('handles ascending values', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(1)).toBeUndefined()
    expect(swm.push(2)).toBeUndefined()
    expect(swm.push(3)).toBe(1)
    expect(swm.push(4)).toBe(2)
  })

  it('getMin returns current minimum', () => {
    const swm = new SlidingWindowMin(3)
    swm.push(5)
    expect(swm.getMin()).toBe(5)
    swm.push(3)
    expect(swm.getMin()).toBe(3)
  })

  it('getMin returns undefined for empty', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.getMin()).toBeUndefined()
  })

  it('throws on invalid window size', () => {
    expect(() => new SlidingWindowMin(0)).toThrow(RangeError)
  })

  describe('solve', () => {
    it('computes sliding window minima', () => {
      expect(SlidingWindowMin.solve([5, 3, 7, 1, 4, 6], 3)).toEqual([3, 1, 1, 1])
    })

    it('returns all elements when window equals length', () => {
      expect(SlidingWindowMin.solve([3, 1, 2], 3)).toEqual([1])
    })

    it('returns each element for window 1', () => {
      expect(SlidingWindowMin.solve([5, 3, 7], 1)).toEqual([5, 3, 7])
    })

    it('handles duplicates', () => {
      expect(SlidingWindowMin.solve([2, 2, 2], 2)).toEqual([2, 2])
    })

    it('handles negative values', () => {
      expect(SlidingWindowMin.solve([-1, -3, -2, -4], 2)).toEqual([-3, -3, -4])
    })

    it('handles single element array', () => {
      expect(SlidingWindowMin.solve([5], 1)).toEqual([5])
    })

    it('handles window equals array length', () => {
      expect(SlidingWindowMin.solve([3, 1, 2], 3)).toEqual([1])
    })

    it('handles single element window', () => {
      expect(SlidingWindowMin.solve([3, 1, 2], 1)).toEqual([3, 1, 2])
    })

    it('handles all same elements', () => {
      expect(SlidingWindowMin.solve([5, 5, 5], 2)).toEqual([5, 5])
    })

    it('solve handles increasing sequence', () => {
      expect(SlidingWindowMin.solve([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
    })
  })

  it('solve handles single element window', () => {
    expect(SlidingWindowMin.solve([3, 1, 4], 1)).toEqual([3, 1, 4])
  })

  it('solve handles window equals array length', () => {
    expect(SlidingWindowMin.solve([3, 1, 4], 3)).toEqual([1])
  })
})
