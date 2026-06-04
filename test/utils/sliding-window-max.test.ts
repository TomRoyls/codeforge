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

  it('solve handles increasing sequence', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5])
  })

  it('solve handles decreasing sequence', () => {
    expect(SlidingWindowMax.solve([5, 4, 3, 2, 1], 3)).toEqual([5, 4, 3])
  })

  it('solve handles increasing sequence', () => {
    expect(SlidingWindowMax.solve([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5])
  })

  it('solve handles single element window', () => {
    expect(SlidingWindowMax.solve([3, 1, 4], 1)).toEqual([3, 1, 4])
  })

  it('solve handles window equals array length', () => {
    expect(SlidingWindowMax.solve([3, 1, 4], 3)).toEqual([4])
  })

  it('solve single element window', () => {
    expect(SlidingWindowMax.solve([3, 1, 4], 1)).toEqual([3, 1, 4])
  })

  it('solve empty array', () => {
    expect(SlidingWindowMax.solve([], 1)).toEqual([])
  })

  it('solve single element', () => {
    expect(SlidingWindowMax.solve([5], 1)).toEqual([5])
  })
})
