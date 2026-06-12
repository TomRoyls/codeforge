import { describe, expect, it } from 'vitest'
import { SqrtDecompRange } from '../../src/utils/sqrt-decomp-range.js'

describe('SqrtDecompRange', () => {
  it('computes range sum', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(0, 4)).toBe(15)
  })

  it('computes partial sum', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(1, 3)).toBe(9)
  })

  it('handles single element sum', () => {
    const sd = new SqrtDecompRange([42])
    expect(sd.rangeSum(0, 0)).toBe(42)
  })

  it('handles update', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    sd.update(1, 10)
    expect(sd.rangeSum(0, 2)).toBe(14)
  })

  it('handles range min', () => {
    const sd = new SqrtDecompRange([5, 3, 1, 4, 2])
    expect(sd.rangeMin(0, 4)).toBe(1)
    expect(sd.rangeMin(0, 2)).toBe(1)
  })

  it('handles range max', () => {
    const sd = new SqrtDecompRange([1, 5, 3, 2, 4])
    expect(sd.rangeMax(0, 4)).toBe(5)
    expect(sd.rangeMax(2, 4)).toBe(4)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 99)).toBe(5050)
  })

  it('handles update then sum', () => {
    const sd = new SqrtDecompRange([1, 1, 1, 1, 1])
    sd.update(2, 5)
    expect(sd.rangeSum(0, 4)).toBe(9)
  })

  it('handles same index sum', () => {
    const sd = new SqrtDecompRange([10, 20, 30])
    expect(sd.rangeSum(1, 1)).toBe(20)
  })

  it('tracks length', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    expect(sd.length).toBe(3)
  })

  it('handles negative values', () => {
    const sd = new SqrtDecompRange([-1, 2, -3, 4])
    expect(sd.rangeSum(0, 3)).toBe(2)
  })

  it('handles single element update', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.rangeSum(2, 2)).toBe(10)
  })

  it('handles empty array', () => {
    const sd = new SqrtDecompRange([])
    expect(sd.length).toBe(0)
  })

  it('handles update first element', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(0, 10)
    expect(sd.rangeSum(0, 4)).toBe(24)
  })

  it('handles point update in middle', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.rangeSum(0, 4)).toBe(22)
  })

  it('rangeMin finds minimum', () => {
    const sd = new SqrtDecompRange([10, 20, 5, 30])
    expect(sd.rangeMin(0, 3)).toBe(5)
  })

  it('rangeMin single element', () => {
    const sd = new SqrtDecompRange([42])
    expect(sd.rangeMin(0, 0)).toBe(42)
  })

  it('rangeMin for two elements', () => {
    const sd = new SqrtDecompRange([5, 3])
    expect(sd.rangeMin(0, 1)).toBe(3)
  })

  it('rangeSum computes sum', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    expect(sd.rangeSum(0, 2)).toBe(6)
  })

  it('rangeSum single element array', () => {
    const sd = new SqrtDecompRange([5, 10, 15])
    expect(sd.rangeSum(1, 1)).toBe(10)
  })

  it('rangeSum full array', () => {
    const sd = new SqrtDecompRange([5, 10, 15])
    expect(sd.rangeSum(0, 2)).toBe(30)
  })

  it('handles zero values', () => {
    const sd = new SqrtDecompRange([0, 0, 0, 0])
    expect(sd.rangeSum(0, 3)).toBe(0)
    expect(sd.rangeMin(0, 3)).toBe(0)
    expect(sd.rangeMax(0, 3)).toBe(0)
  })

  it('handles mixed zeros and non-zeros', () => {
    const sd = new SqrtDecompRange([0, 5, 0, 3, 0])
    expect(sd.rangeSum(0, 4)).toBe(8)
    expect(sd.rangeMin(0, 4)).toBe(0)
    expect(sd.rangeMax(0, 4)).toBe(5)
  })

  it('handles update to same value', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 3)
    expect(sd.rangeSum(0, 4)).toBe(15)
  })

  it('handles multiple updates', () => {
    const sd = new SqrtDecompRange([1, 1, 1, 1, 1])
    sd.update(0, 10)
    sd.update(2, 20)
    sd.update(4, 30)
    expect(sd.rangeSum(0, 4)).toBe(62)
  })

  it('handles update last element', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(4, 100)
    expect(sd.rangeSum(0, 4)).toBe(110)
  })

  it('handles floating point numbers', () => {
    const sd = new SqrtDecompRange([1.5, 2.5, 3.5])
    expect(sd.rangeSum(0, 2)).toBe(7.5)
    expect(sd.rangeMin(0, 2)).toBe(1.5)
    expect(sd.rangeMax(0, 2)).toBe(3.5)
  })

  it('handles very large numbers', () => {
    const sd = new SqrtDecompRange([Number.MAX_SAFE_INTEGER, 1, Number.MAX_SAFE_INTEGER])
    expect(sd.rangeSum(0, 2)).toBe(Number.MAX_SAFE_INTEGER * 2 + 1)
  })

  it('handles very small negative numbers', () => {
    const sd = new SqrtDecompRange([-Number.MAX_SAFE_INTEGER, -1, -Number.MAX_SAFE_INTEGER])
    expect(sd.rangeSum(0, 2)).toBe(-Number.MAX_SAFE_INTEGER * 2 - 1)
  })

  it('handles all same values for min/max', () => {
    const sd = new SqrtDecompRange([5, 5, 5, 5, 5])
    expect(sd.rangeMin(0, 4)).toBe(5)
    expect(sd.rangeMax(0, 4)).toBe(5)
  })

  it('handles min/max with negative numbers', () => {
    const sd = new SqrtDecompRange([-10, -5, -20, -15])
    expect(sd.rangeMin(0, 3)).toBe(-20)
    expect(sd.rangeMax(0, 3)).toBe(-5)
  })

  it('handles array with two elements', () => {
    const sd = new SqrtDecompRange([7, 3])
    expect(sd.rangeSum(0, 1)).toBe(10)
    expect(sd.rangeMin(0, 1)).toBe(3)
    expect(sd.rangeMax(0, 1)).toBe(7)
  })

  it('handles update on two element array', () => {
    const sd = new SqrtDecompRange([1, 2])
    sd.update(0, 10)
    expect(sd.rangeSum(0, 1)).toBe(12)
  })

  it('handles array length exactly at block size', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 15)).toBe(136)
  })

  it('handles array with repeated values', () => {
    const sd = new SqrtDecompRange([2, 2, 2, 2, 2])
    expect(sd.rangeSum(0, 4)).toBe(10)
  })

  it('handles update to zero', () => {
    const sd = new SqrtDecompRange([5, 10, 15])
    sd.update(1, 0)
    expect(sd.rangeSum(0, 2)).toBe(20)
  })

  it('handles update from zero', () => {
    const sd = new SqrtDecompRange([0, 0, 0])
    sd.update(1, 10)
    expect(sd.rangeSum(0, 2)).toBe(10)
  })

  it('handles range sum starting at index 0', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(0, 2)).toBe(6)
  })

  it('handles range sum ending at last index', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    expect(sd.rangeSum(3, 4)).toBe(9)
  })

  it('handles consecutive updates', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(0, 10)
    sd.update(1, 20)
    expect(sd.rangeSum(0, 4)).toBe(42)
  })

  it('handles update then range operations on different ranges', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 30)
    expect(sd.rangeSum(0, 1)).toBe(3)
    expect(sd.rangeSum(3, 4)).toBe(9)
    expect(sd.rangeSum(0, 4)).toBe(42)
  })

  it('handles range operations on small block size', () => {
    const arr = Array.from({ length: 9 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 8)).toBe(45)
  })

  it('handles very large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
    const sd = new SqrtDecompRange(arr)
    expect(sd.rangeSum(0, 999)).toBe(500500)
  })

  it('handles mixed positive and negative values', () => {
    const sd = new SqrtDecompRange([10, -5, 3, -8, 2])
    expect(sd.rangeSum(0, 4)).toBe(2)
    expect(sd.rangeMin(0, 4)).toBe(-8)
    expect(sd.rangeMax(0, 4)).toBe(10)
  })

  it('handles array with all negative values', () => {
    const sd = new SqrtDecompRange([-1, -2, -3, -4, -5])
    expect(sd.rangeSum(0, 4)).toBe(-15)
    expect(sd.rangeMin(0, 4)).toBe(-5)
    expect(sd.rangeMax(0, 4)).toBe(-1)
  })

  it('handles range min on duplicate values', () => {
    const sd = new SqrtDecompRange([5, 3, 3, 7, 3])
    expect(sd.rangeMin(0, 4)).toBe(3)
  })

  it('handles range max on duplicate values', () => {
    const sd = new SqrtDecompRange([5, 9, 3, 9, 2])
    expect(sd.rangeMax(0, 4)).toBe(9)
  })

  it('handles update making value largest', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(0, 100)
    expect(sd.rangeMax(0, 4)).toBe(100)
  })

  it('handles update making value smallest', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(4, -10)
    expect(sd.rangeMin(0, 4)).toBe(-10)
  })

  it('should compute range max', () => {
    const sd = new SqrtDecompRange([3, 1, 4, 1, 5])
    expect(sd.rangeMax(0, 4)).toBe(5)
  })

  it('should handle update and re-query', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(2, 10)
    expect(sd.rangeSum(0, 4)).toBe(22)
  })

  it('rangeMin returns minimum in range', () => {
    const sd = new SqrtDecompRange([5, 3, 8, 1, 4])
    expect(sd.rangeMin(0, 4)).toBe(1)
  })

  it('rangeMax returns maximum in range', () => {
    const sd = new SqrtDecompRange([5, 3, 8, 1, 4])
    expect(sd.rangeMax(0, 4)).toBe(8)
  })

  it('update changes value', () => {
    const sd = new SqrtDecompRange([1, 2, 3])
    sd.update(1, 10)
    expect(sd.rangeSum(0, 2)).toBe(14)
  })

  it('rangeSum for single element', () => {
    const sd = new SqrtDecompRange([10, 20, 30])
    expect(sd.rangeSum(1, 1)).toBe(20)
  })
})