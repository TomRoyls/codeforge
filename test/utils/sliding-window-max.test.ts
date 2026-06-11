import { describe, expect, it } from 'vitest'
import { SlidingWindowMax, SlidingWindowMin } from '../../src/utils/sliding-window-max.js'

describe('SlidingWindowMax', () => {
  it('finds max in each window', () => {
    expect(SlidingWindowMax.solve([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([3, 3, 5, 5, 6, 7])
  })

  it('handles window of size 1', () => {
    expect(SlidingWindowMax.solve([4, 2, 1, 3], 1)).toEqual([4, 2, 1, 3])
  })

  it('handles window equal to array length', () => {
    expect(SlidingWindowMax.solve([1, 2, 3], 3)).toEqual([3])
  })

  it('handles decreasing sequence', () => {
    expect(SlidingWindowMax.solve([5, 4, 3, 2, 1], 2)).toEqual([5, 4, 3, 2])
  })

  it('handles increasing sequence', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 4, 5], 2)).toEqual([2, 3, 4, 5])
  })

  it('handles all equal elements', () => {
    expect(SlidingWindowMax.solve([3, 3, 3, 3], 2)).toEqual([3, 3, 3])
  })

  it('handles negative numbers', () => {
    expect(SlidingWindowMax.solve([-5, -3, -1, -2], 2)).toEqual([-3, -1, -1])
  })

  it('push returns undefined before window is full', () => {
    const swm = new SlidingWindowMax(3)
    expect(swm.push(1)).toBeUndefined()
    expect(swm.push(2)).toBeUndefined()
    expect(swm.push(3)).toBe(3)
  })

  it('throws on invalid window size', () => {
    expect(() => new SlidingWindowMax(0)).toThrow(RangeError)
  })

  it('handles empty array', () => {
    expect(SlidingWindowMax.solve([], 3)).toEqual([])
  })

  it('handles single element', () => {
    expect(SlidingWindowMax.solve([42], 1)).toEqual([42])
  })

  it('handles mixed positive and negative numbers', () => {
    expect(SlidingWindowMax.solve([1, -2, 3, -4, 5], 2)).toEqual([1, 3, 3, 5])
  })

  it('handles large window', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 4, 5], 10)).toEqual([])
  })

  it('handles very small numbers', () => {
    expect(SlidingWindowMax.solve([0.1, 0.2, 0.3, 0.4], 2)).toEqual([0.2, 0.3, 0.4])
  })

  it('handles very large numbers', () => {
    expect(SlidingWindowMax.solve([1000000, 2000000, 3000000], 2)).toEqual([2000000, 3000000])
  })

  it('handles zero values', () => {
    expect(SlidingWindowMax.solve([0, 0, 0, 1], 2)).toEqual([0, 0, 1])
  })

  it('handles alternating high and low values', () => {
    expect(SlidingWindowMax.solve([10, 1, 10, 1, 10], 2)).toEqual([10, 10, 10, 10])
  })

  it('handles values with same max in multiple windows', () => {
    expect(SlidingWindowMax.solve([5, 3, 5, 2, 5, 1], 3)).toEqual([5, 5, 5, 5])
  })

  it('handles descending then ascending sequence', () => {
    expect(SlidingWindowMax.solve([5, 4, 3, 4, 5], 3)).toEqual([5, 4, 5])
  })

  it('handles plateau then drop', () => {
    expect(SlidingWindowMax.solve([3, 3, 3, 1, 2], 3)).toEqual([3, 3, 3])
  })

  it('handles window size 2 with three elements', () => {
    expect(SlidingWindowMax.solve([1, 2, 3], 2)).toEqual([2, 3])
  })

  it('handles window size 4 with three elements', () => {
    expect(SlidingWindowMax.solve([1, 2, 3], 4)).toEqual([])
  })

  it('push returns max after window is full', () => {
    const swm = new SlidingWindowMax(2)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(3)).toBe(5)
    expect(swm.push(7)).toBe(7)
    expect(swm.push(2)).toBe(7)
  })

  it('handles multiple pushes with sliding window', () => {
    const swm = new SlidingWindowMax(3)
    expect(swm.push(1)).toBeUndefined()
    expect(swm.push(3)).toBeUndefined()
    expect(swm.push(2)).toBe(3)
    expect(swm.push(4)).toBe(4)
    expect(swm.push(1)).toBe(4)
  })

  it('handles negative values as max', () => {
    expect(SlidingWindowMax.solve([-10, -5, -8, -3], 2)).toEqual([-5, -5, -3])
  })

  it('handles single max surrounded by smaller values', () => {
    expect(SlidingWindowMax.solve([1, 5, 2, 3], 3)).toEqual([5, 5])
  })

  it('handles increasing then decreasing', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 2, 1], 3)).toEqual([3, 3, 3])
  })

  it('handles window size larger than array', () => {
    expect(SlidingWindowMax.solve([1, 2], 5)).toEqual([])
  })

  it('handles two element window with array of two', () => {
    expect(SlidingWindowMax.solve([3, 7], 2)).toEqual([7])
  })

  it('handles decimal values', () => {
    expect(SlidingWindowMax.solve([1.5, 2.3, 0.9, 3.1], 2)).toEqual([2.3, 2.3, 3.1])
  })

  it('handles negative infinity', () => {
    const result = SlidingWindowMax.solve([-Infinity, 1, 2, 3], 2)
    expect(result[0]).toBe(1)
  })

  it('handles positive infinity', () => {
    const result = SlidingWindowMax.solve([1, 2, Infinity, 3], 2)
    expect(result[1]).toBe(Infinity)
  })

  it('handles very small window size', () => {
    expect(SlidingWindowMax.solve([5, 4, 3, 2, 1], 1)).toEqual([5, 4, 3, 2, 1])
  })

  it('handles all negative with mixed values', () => {
    expect(SlidingWindowMax.solve([-1, -5, -3, -7, -2], 2)).toEqual([-1, -3, -3, -2])
  })

  it('handles repeated max at edge of window', () => {
    expect(SlidingWindowMax.solve([5, 5, 1, 2, 5], 3)).toEqual([5, 5, 5])
  })

  it('handles complex pattern', () => {
    expect(SlidingWindowMax.solve([3, 1, 4, 1, 5, 9, 2, 6], 3)).toEqual([4, 4, 5, 9, 9, 9])
  })

  it('push maintains deque correctly', () => {
    const swm = new SlidingWindowMax(3)
    swm.push(3)
    swm.push(1)
    swm.push(4)
    expect(swm.push(2)).toBe(4)
    expect(swm.push(5)).toBe(5)
  })

  it('handles single value in window repeatedly', () => {
    expect(SlidingWindowMax.solve([7, 7, 7, 7, 7], 3)).toEqual([7, 7, 7])
  })

  it('handles negative max at window boundary', () => {
    expect(SlidingWindowMax.solve([-3, -1, -2, -4], 2)).toEqual([-1, -1, -2])
  })
})

describe('SlidingWindowMin', () => {
  it('finds min in each window', () => {
    expect(SlidingWindowMax.solveMin([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([-1, -3, -3, -3, 3, 3])
  })

  it('handles window of size 1', () => {
    expect(SlidingWindowMax.solveMin([4, 2, 1, 3], 1)).toEqual([4, 2, 1, 3])
  })

  it('handles all equal elements', () => {
    expect(SlidingWindowMax.solveMin([5, 5, 5, 5], 2)).toEqual([5, 5, 5])
  })

  it('handles increasing sequence', () => {
    expect(SlidingWindowMax.solveMin([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
  })

  it('handles decreasing sequence', () => {
    expect(SlidingWindowMax.solveMin([5, 4, 3, 2, 1], 3)).toEqual([3, 2, 1])
  })

  it('solve handles single element window', () => {
    expect(SlidingWindowMax.solve([3, 1, 4], 1)).toEqual([3, 1, 4])
  })

  it('solve handles window equals array length', () => {
    expect(SlidingWindowMax.solve([3, 1, 4], 3)).toEqual([4])
  })

  it('solve empty array', () => {
    expect(SlidingWindowMax.solve([], 1)).toEqual([])
  })

  it('solve single element', () => {
    expect(SlidingWindowMax.solve([5], 1)).toEqual([5])
  })

  it('handles negative numbers for min', () => {
    expect(SlidingWindowMax.solveMin([-5, -3, -1, -2], 2)).toEqual([-5, -3, -2])
  })

  it('handles mixed positive and negative for min', () => {
    expect(SlidingWindowMax.solveMin([1, -2, 3, -4, 5], 2)).toEqual([-2, -2, -4, -4])
  })

  it('push returns undefined before window is full', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(3)).toBeUndefined()
    expect(swm.push(1)).toBe(1)
  })

  it('throws on invalid window size', () => {
    expect(() => new SlidingWindowMin(0)).toThrow(RangeError)
  })

  it('handles empty array for min', () => {
    expect(SlidingWindowMax.solveMin([], 3)).toEqual([])
  })

  it('handles single element for min', () => {
    expect(SlidingWindowMax.solveMin([42], 1)).toEqual([42])
  })

  it('handles large window for min', () => {
    expect(SlidingWindowMax.solveMin([5, 4, 3, 2, 1], 10)).toEqual([])
  })

  it('handles very small numbers for min', () => {
    expect(SlidingWindowMax.solveMin([0.4, 0.3, 0.2, 0.1], 2)).toEqual([0.3, 0.2, 0.1])
  })

  it('handles very large numbers for min', () => {
    expect(SlidingWindowMax.solveMin([3000000, 2000000, 1000000], 2)).toEqual([2000000, 1000000])
  })

  it('handles zero values for min', () => {
    expect(SlidingWindowMax.solveMin([1, 0, 0, 0], 2)).toEqual([0, 0, 0])
  })

  it('handles alternating low and high values for min', () => {
    expect(SlidingWindowMax.solveMin([1, 10, 1, 10, 1], 2)).toEqual([1, 1, 1, 1])
  })

  it('handles values with same min in multiple windows', () => {
    expect(SlidingWindowMax.solveMin([1, 3, 1, 4, 1, 5], 3)).toEqual([1, 1, 1, 1])
  })

  it('handles ascending then descending sequence for min', () => {
    expect(SlidingWindowMax.solveMin([1, 2, 3, 2, 1], 3)).toEqual([1, 2, 1])
  })

  it('handles valley then rise for min', () => {
    expect(SlidingWindowMax.solveMin([3, 1, 1, 5, 4], 3)).toEqual([1, 1, 1])
  })

  it('handles window size 2 with three elements for min', () => {
    expect(SlidingWindowMax.solveMin([3, 2, 1], 2)).toEqual([2, 1])
  })

  it('handles window size 4 with three elements for min', () => {
    expect(SlidingWindowMax.solveMin([3, 2, 1], 4)).toEqual([])
  })

  it('push returns min after window is full', () => {
    const swm = new SlidingWindowMin(2)
    expect(swm.push(5)).toBeUndefined()
    expect(swm.push(7)).toBe(5)
    expect(swm.push(3)).toBe(3)
    expect(swm.push(6)).toBe(3)
  })

  it('handles multiple pushes with sliding window for min', () => {
    const swm = new SlidingWindowMin(3)
    expect(swm.push(3)).toBeUndefined()
    expect(swm.push(1)).toBeUndefined()
    expect(swm.push(2)).toBe(1)
    expect(swm.push(0)).toBe(0)
    expect(swm.push(4)).toBe(0)
  })

  it('handles positive values as min', () => {
    expect(SlidingWindowMax.solveMin([10, 5, 8, 3], 2)).toEqual([5, 5, 3])
  })

  it('handles single min surrounded by larger values', () => {
    expect(SlidingWindowMax.solveMin([5, 1, 6, 7], 3)).toEqual([1, 1])
  })

  it('handles decreasing then increasing for min', () => {
    expect(SlidingWindowMax.solveMin([5, 4, 3, 4, 5], 3)).toEqual([3, 3, 3])
  })

  it('handles window size larger than array for min', () => {
    expect(SlidingWindowMax.solveMin([7, 5], 5)).toEqual([])
  })

  it('handles two element window with array of two for min', () => {
    expect(SlidingWindowMax.solveMin([3, 7], 2)).toEqual([3])
  })

  it('handles decimal values for min', () => {
    expect(SlidingWindowMax.solveMin([3.1, 2.3, 1.9, 2.5], 2)).toEqual([2.3, 1.9, 1.9])
  })

  it('handles very small window size for min', () => {
    expect(SlidingWindowMax.solveMin([1, 2, 3, 4, 5], 1)).toEqual([1, 2, 3, 4, 5])
  })

  it('handles all positive with mixed values for min', () => {
    expect(SlidingWindowMax.solveMin([7, 3, 5, 1, 9], 2)).toEqual([3, 3, 1, 1])
  })

  it('handles repeated min at edge of window', () => {
    expect(SlidingWindowMax.solveMin([1, 1, 5, 4, 1], 3)).toEqual([1, 1, 1])
  })

  it('handles complex pattern for min', () => {
    expect(SlidingWindowMax.solveMin([3, 1, 4, 1, 5, 9, 2, 6], 3)).toEqual([1, 1, 1, 1, 2, 2])
  })

  it('push maintains deque correctly for min', () => {
    const swm = new SlidingWindowMin(3)
    swm.push(3)
    swm.push(5)
    swm.push(2)
    expect(swm.push(4)).toBe(2)
    expect(swm.push(1)).toBe(1)
  })

  it('handles single value in window repeatedly for min', () => {
    expect(SlidingWindowMax.solveMin([7, 7, 7, 7, 7], 3)).toEqual([7, 7, 7])
  })

  it('handles positive min at window boundary', () => {
    expect(SlidingWindowMax.solveMin([5, 3, 4, 6], 2)).toEqual([3, 3, 4])
  })
})