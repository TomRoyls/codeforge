import { describe, expect, it } from 'vitest'
import { CountingInversions } from '../../src/utils/counting-inversions.js'

describe('CountingInversions', () => {
  it('returns 0 for sorted array', () => {
    expect(CountingInversions.count([1, 2, 3, 4, 5])).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(CountingInversions.count([])).toBe(0)
  })

  it('returns 0 for single element', () => {
    expect(CountingInversions.count([1])).toBe(0)
  })

  it('counts simple inversions', () => {
    expect(CountingInversions.count([2, 1])).toBe(1)
    expect(CountingInversions.count([3, 2, 1])).toBe(3)
  })

  it('counts reverse sorted array', () => {
    expect(CountingInversions.count([5, 4, 3, 2, 1])).toBe(10)
  })

  it('counts mixed inversions', () => {
    expect(CountingInversions.count([1, 3, 5, 2, 4, 6])).toBe(3)
  })

  it('matches brute force', () => {
    const arr = [7, 2, 9, 1, 5, 3]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('matches brute force for larger', () => {
    const arr = [10, 3, 8, 1, 6, 2, 7, 4, 9, 5]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('handles duplicates', () => {
    expect(CountingInversions.count([2, 2, 2])).toBe(0)
    expect(CountingInversions.count([3, 1, 2, 1])).toBe(4)
  })

  it('handles negative numbers', () => {
    expect(CountingInversions.count([-1, -2, -3])).toBe(3)
    expect(CountingInversions.count([-3, -2, -1])).toBe(0)
  })

  it('sortedWithCount returns sorted and count', () => {
    const result = CountingInversions.sortedWithCount([3, 1, 2])
    expect(result.sorted).toEqual([1, 2, 3])
    expect(result.inversions).toBe(2)
  })

  it('sortedWithCount does not modify original', () => {
    const arr = [3, 1, 2]
    CountingInversions.sortedWithCount(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => 1000 - i)
    const result = CountingInversions.count(arr)
    expect(result).toBe((1000 * 999) / 2)
  })

  it('two elements sorted', () => {
    expect(CountingInversions.count([1, 2])).toBe(0)
  })

  it('countBruteForce matches for small', () => {
    const arr = [4, 1, 3, 2]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('handles two elements reversed', () => {
    expect(CountingInversions.count([2, 1])).toBe(1)
  })

  it('handles single element', () => {
    expect(CountingInversions.count([42])).toBe(0)
  })

  it('sorted array has zero inversions', () => {
    expect(CountingInversions.count([1, 2, 3, 4, 5])).toBe(0)
  })

  it('reverse sorted has maximum inversions', () => {
    expect(CountingInversions.count([5, 4, 3, 2, 1])).toBe(10)
  })

  it('sorted array has 0 inversions', () => {
    expect(CountingInversions.count([1, 2, 3, 4, 5])).toBe(0)
  })
})
