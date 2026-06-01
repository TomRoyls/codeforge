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

  it('handles single element', () => {
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

  it('handles single element', () => {
    const sd = new SqrtDecompRange([42])
    expect(sd.rangeSum(0, 0)).toBe(42)
  })

  it('handles update then sum', () => {
    const sd = new SqrtDecompRange([1, 2, 3, 4, 5])
    sd.update(0, 10)
    expect(sd.rangeSum(0, 4)).toBe(24)
  })

  it('handles range sum on single element', () => {
    const sd = new SqrtDecompRange([42])
    expect(sd.rangeSum(0, 0)).toBe(42)
  })
})
