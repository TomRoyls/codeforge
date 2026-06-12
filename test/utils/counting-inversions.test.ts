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

  it('two elements reversed', () => {
    expect(CountingInversions.count([2, 1])).toBe(1)
  })

  it('countBruteForce on sorted array', () => {
    expect(CountingInversions.countBruteForce([1, 2, 3])).toBe(0)
  })

  it('countBruteForce on reversed array', () => {
    expect(CountingInversions.countBruteForce([3, 2, 1])).toBe(3)
  })

  it('countBruteForce on empty array', () => {
    expect(CountingInversions.countBruteForce([])).toBe(0)
  })

  it('countBruteForce on single element', () => {
    expect(CountingInversions.countBruteForce([5])).toBe(0)
  })

  it('sortedWithCount on empty array', () => {
    const result = CountingInversions.sortedWithCount([])
    expect(result.sorted).toEqual([])
    expect(result.inversions).toBe(0)
  })

  it('sortedWithCount on single element', () => {
    const result = CountingInversions.sortedWithCount([42])
    expect(result.sorted).toEqual([42])
    expect(result.inversions).toBe(0)
  })

  it('sortedWithCount on already sorted', () => {
    const result = CountingInversions.sortedWithCount([1, 2, 3, 4])
    expect(result.sorted).toEqual([1, 2, 3, 4])
    expect(result.inversions).toBe(0)
  })

  it('sortedWithCount on reverse sorted', () => {
    const result = CountingInversions.sortedWithCount([4, 3, 2, 1])
    expect(result.sorted).toEqual([1, 2, 3, 4])
    expect(result.inversions).toBe(6)
  })

  it('handles all same elements', () => {
    expect(CountingInversions.count([5, 5, 5, 5])).toBe(0)
  })

  it('handles mixed positive and negative', () => {
    const result = CountingInversions.count([1, -1, 2, -2])
    expect(result).toBe(CountingInversions.countBruteForce([1, -1, 2, -2]))
  })

  it('handles floating point', () => {
    expect(CountingInversions.count([1.5, 0.5, 2.0])).toBe(1)
  })

  it('count does not modify original', () => {
    const arr = [3, 1, 2]
    CountingInversions.count(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles three elements one inversion', () => {
    expect(CountingInversions.count([1, 3, 2])).toBe(1)
  })

  it('handles three elements two inversions', () => {
    expect(CountingInversions.count([2, 3, 1])).toBe(2)
  })

  it('handles four elements', () => {
    expect(CountingInversions.count([4, 1, 3, 2])).toBe(4)
  })

  it('handles n choose 2 maximum for n=6', () => {
    expect(CountingInversions.count([6, 5, 4, 3, 2, 1])).toBe(15)
  })

  it('handles single inversion in large sorted array', () => {
    const arr = [1, 2, 3, 5, 4, 6, 7, 8, 9, 10]
    expect(CountingInversions.count(arr)).toBe(1)
  })

  it('handles zeros', () => {
    expect(CountingInversions.count([0, 0, 1])).toBe(0)
    expect(CountingInversions.count([1, 0, 0])).toBe(2)
  })

  it('sortedWithCount with duplicates', () => {
    const result = CountingInversions.sortedWithCount([3, 1, 2, 1])
    expect(result.sorted).toEqual([1, 1, 2, 3])
    expect(result.inversions).toBe(4)
  })

  it('handles alternating high low', () => {
    expect(CountingInversions.count([5, 1, 4, 2, 3])).toBe(CountingInversions.countBruteForce([5, 1, 4, 2, 3]))
  })

  it('countBruteForce handles duplicates', () => {
    expect(CountingInversions.countBruteForce([2, 1, 2])).toBe(1)
  })

  it('handles large n choose 2 formula', () => {
    const n = 100
    const arr = Array.from({ length: n }, (_, i) => n - i)
    expect(CountingInversions.count(arr)).toBe((n * (n - 1)) / 2)
  })

  it('handles nearly sorted array', () => {
    const arr = [1, 2, 3, 4, 6, 5, 7, 8, 9, 10]
    expect(CountingInversions.count(arr)).toBe(1)
  })

  it('handles two inversions in five elements', () => {
    expect(CountingInversions.count([1, 4, 3, 2, 5])).toBe(3)
  })

  it('matches brute force for random array', () => {
    const arr = [8, 3, 5, 1, 9, 2, 7, 4, 6]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('sortedWithCount returns correct object shape', () => {
    const result = CountingInversions.sortedWithCount([2, 1])
    expect(result).toHaveProperty('sorted')
    expect(result).toHaveProperty('inversions')
    expect(typeof result.inversions).toBe('number')
  })

  it('handles single swap at start', () => {
    expect(CountingInversions.count([2, 1, 3, 4, 5])).toBe(1)
  })

  it('handles single swap at end', () => {
    expect(CountingInversions.count([1, 2, 3, 5, 4])).toBe(1)
  })

  it('handles multiple equal elements with inversion', () => {
    expect(CountingInversions.count([3, 1, 3, 1, 3])).toBe(CountingInversions.countBruteForce([3, 1, 3, 1, 3]))
  })

  it('handles very large numbers', () => {
    expect(CountingInversions.count([Number.MAX_VALUE, 1, Number.MAX_VALUE])).toBe(1)
  })

  it('count and brute force agree on edge case', () => {
    const arr = [1]
    expect(CountingInversions.count(arr)).toBe(CountingInversions.countBruteForce(arr))
  })

  it('sortedWithCount on two elements reversed', () => {
    const result = CountingInversions.sortedWithCount([2, 1])
    expect(result.sorted).toEqual([1, 2])
    expect(result.inversions).toBe(1)
  })

  it('handles negative and positive mix', () => {
    expect(CountingInversions.count([-5, 10, -3, 8, -1])).toBe(CountingInversions.countBruteForce([-5, 10, -3, 8, -1]))
  })

  it('should return sorted array with count', () => {
    const { sorted, inversions } = CountingInversions.sortedWithCount([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
    expect(inversions).toBe(2)
  })

  it('should handle single element', () => {
    expect(CountingInversions.count([42])).toBe(0)
  })
})
