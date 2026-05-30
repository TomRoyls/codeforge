import { describe, expect, it } from 'vitest'
import { percentile } from '../../../src/core/stats-aggregator/percentile.js'

describe('percentile', () => {
  it('returns 0 for empty array', () => {
    const result = percentile([], 50)
    expect(result).toBe(0)
  })

  it('returns single element for single element array', () => {
    const result = percentile([42], 50)
    expect(result).toBe(42)
  })

  it('returns single element for single element array at p0', () => {
    const result = percentile([42], 0)
    expect(result).toBe(42)
  })

  it('returns single element for single element array at p100', () => {
    const result = percentile([42], 100)
    expect(result).toBe(42)
  })

  it('returns p0 (minimum) correctly', () => {
    const sorted = [1, 2, 3, 4, 5]
    const result = percentile(sorted, 0)
    expect(result).toBe(1)
  })

  it('returns p100 (maximum) correctly', () => {
    const sorted = [1, 2, 3, 4, 5]
    const result = percentile(sorted, 100)
    expect(result).toBe(5)
  })

  it('returns p50 (median) correctly for odd length', () => {
    const sorted = [1, 2, 3, 4, 5]
    const result = percentile(sorted, 50)
    expect(result).toBe(3)
  })

  it('returns p50 (median) correctly for even length', () => {
    const sorted = [1, 2, 3, 4]
    const result = percentile(sorted, 50)
    expect(result).toBe(2.5)
  })

  it('returns p25 (first quartile) correctly', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8]
    const result = percentile(sorted, 25)
    expect(result).toBe(2.75)
  })

  it('returns p75 (third quartile) correctly', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8]
    const result = percentile(sorted, 75)
    expect(result).toBe(6.25)
  })

  it('interpolates correctly between values', () => {
    const sorted = [10, 20, 30]
    const result = percentile(sorted, 50)
    expect(result).toBe(20)
  })

  it('interpolates correctly for non-integer percentile', () => {
    const sorted = [0, 10, 20, 30, 40]
    const result = percentile(sorted, 40)
    expect(result).toBe(16)
  })

  it('handles small fractional percentiles', () => {
    const sorted = [0, 10, 20]
    const result = percentile(sorted, 10)
    expect(result).toBe(2)
  })

  it('handles large fractional percentiles', () => {
    const sorted = [0, 10, 20]
    const result = percentile(sorted, 90)
    expect(result).toBe(18)
  })

  it('handles decimal percentile values', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = percentile(sorted, 33.33)
    expect(result).toBeCloseTo(3.9997, 3)
  })

  it('handles large arrays', () => {
    const sorted = Array.from({ length: 100 }, (_, i) => i + 1)
    const result = percentile(sorted, 50)
    expect(result).toBe(50.5)
  })

  it('handles arrays with negative numbers', () => {
    const sorted = [-10, -5, 0, 5, 10]
    const result = percentile(sorted, 50)
    expect(result).toBe(0)
  })

  it('handles arrays with floating point numbers', () => {
    const sorted = [1.5, 2.5, 3.5, 4.5, 5.5]
    const result = percentile(sorted, 50)
    expect(result).toBe(3.5)
  })

  it('handles arrays with identical values', () => {
    const sorted = [5, 5, 5, 5, 5]
    const result = percentile(sorted, 50)
    expect(result).toBe(5)
  })

  it('handles arrays with two elements', () => {
    const sorted = [10, 20]
    const result = percentile(sorted, 50)
    expect(result).toBe(15)
  })

  it('handles p0 for two elements', () => {
    const sorted = [10, 20]
    const result = percentile(sorted, 0)
    expect(result).toBe(10)
  })

  it('handles p100 for two elements', () => {
    const sorted = [10, 20]
    const result = percentile(sorted, 100)
    expect(result).toBe(20)
  })

  it('handles p10 for two elements', () => {
    const sorted = [10, 20]
    const result = percentile(sorted, 10)
    expect(result).toBe(11)
  })

  it('handles p90 for two elements', () => {
    const sorted = [10, 20]
    const result = percentile(sorted, 90)
    expect(result).toBe(19)
  })
})