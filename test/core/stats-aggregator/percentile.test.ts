import { describe, expect, it } from 'vitest'

import { percentile } from '../../../src/core/stats-aggregator/percentile.js'

// ─── percentile ───

describe('percentile', () => {
  it('returns 0 for empty array', () => {
    expect(percentile([], 50)).toBe(0)
  })

  it('returns the single element for single-item array', () => {
    expect(percentile([42], 0)).toBe(42)
    expect(percentile([42], 50)).toBe(42)
    expect(percentile([42], 100)).toBe(42)
  })

  it('returns the minimum for p=0', () => {
    expect(percentile([1, 2, 3, 4, 5], 0)).toBe(1)
  })

  it('returns the maximum for p=100', () => {
    expect(percentile([1, 2, 3, 4, 5], 100)).toBe(5)
  })

  it('returns the median for p=50 with odd count', () => {
    expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3)
  })

  it('interpolates for p=50 with even count', () => {
    const result = percentile([1, 2, 3, 4], 50)
    expect(result).toBe(2.5)
  })

  it('returns p=25 correctly for [1,2,3,4,5]', () => {
    expect(percentile([1, 2, 3, 4, 5], 25)).toBe(2)
  })

  it('returns p=75 correctly for [1,2,3,4,5]', () => {
    expect(percentile([1, 2, 3, 4, 5], 75)).toBe(4)
  })

  it('interpolates between values for non-integer index', () => {
    const result = percentile([10, 20], 50)
    expect(result).toBe(15)
  })

  it('handles two-element array at p=0', () => {
    expect(percentile([10, 20], 0)).toBe(10)
  })

  it('handles two-element array at p=100', () => {
    expect(percentile([10, 20], 100)).toBe(20)
  })

  it('handles negative numbers', () => {
    expect(percentile([-5, -3, -1, 1, 3], 50)).toBe(-1)
  })

  it('handles floating point values', () => {
    const result = percentile([1.1, 2.2, 3.3], 50)
    expect(result).toBeCloseTo(2.2)
  })

  it('handles duplicate values', () => {
    expect(percentile([5, 5, 5, 5], 50)).toBe(5)
  })

  it('handles large arrays', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
    expect(percentile(arr, 0)).toBe(1)
    expect(percentile(arr, 100)).toBe(1000)
    expect(percentile(arr, 50)).toBeCloseTo(500.5)
  })
})
