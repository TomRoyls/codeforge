import { describe, it, expect } from 'vitest'
import {
  countingSort,
  countingSortInPlace,
  countingSortWithMax,
  countingSortBy,
  countingSortStable,
  getCounts,
  getMinMax,
  isSorted,
  CountingSorter,
} from '../../src/core/counting-sort/counting-sort.js'

describe('countingSort', () => {
  it('should return empty array for empty input', () => {
    expect(countingSort([])).toEqual([])
  })

  it('should return single element for single element input', () => {
    expect(countingSort([42])).toEqual([42])
  })

  it('should sort two elements', () => {
    expect(countingSort([2, 1])).toEqual([1, 2])
  })

  it('should sort already sorted array', () => {
    expect(countingSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort reverse sorted array', () => {
    expect(countingSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort random array', () => {
    expect(countingSort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('should handle duplicates', () => {
    expect(countingSort([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
  })

  it('should handle all identical elements', () => {
    expect(countingSort([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
  })

  it('should not modify original array', () => {
    const original = [3, 1, 2]
    const sorted = countingSort(original)
    expect(original).toEqual([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
  })

  it('should handle zeros', () => {
    expect(countingSort([0, 0, 0, 0])).toEqual([0, 0, 0, 0])
  })

  it('should handle single zero', () => {
    expect(countingSort([0])).toEqual([0])
  })

  it('should sort array with small range', () => {
    expect(countingSort([2, 0, 1, 2, 0, 1])).toEqual([0, 0, 1, 1, 2, 2])
  })

  it('should handle array of size 2 already sorted', () => {
    expect(countingSort([1, 2])).toEqual([1, 2])
  })

  it('should handle array with one element out of order at start', () => {
    expect(countingSort([5, 1, 2, 3, 4])).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle array with one element out of order at end', () => {
    expect(countingSort([2, 3, 4, 5, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort large array', () => {
    const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100))
    const sorted = countingSort(arr)
    expect(sorted).toHaveLength(1000)
    expect(isSorted(sorted)).toBe(true)
  })

  it('should handle array with values starting from non-zero min', () => {
    expect(countingSort([10, 12, 11, 10])).toEqual([10, 10, 11, 12])
  })

  it('should handle array where all elements are the same except one', () => {
    expect(countingSort([5, 5, 3, 5, 5])).toEqual([3, 5, 5, 5, 5])
  })

  it('should handle array of size 3', () => {
    expect(countingSort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('should handle array of size 4', () => {
    expect(countingSort([4, 2, 3, 1])).toEqual([1, 2, 3, 4])
  })
})

describe('countingSortInPlace', () => {
  it('should handle empty array', () => {
    const arr: number[] = []
    countingSortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('should handle single element', () => {
    const arr = [42]
    countingSortInPlace(arr)
    expect(arr).toEqual([42])
  })

  it('should sort two elements in place', () => {
    const arr = [2, 1]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 2])
  })

  it('should sort array in place', () => {
    const arr = [5, 3, 1, 4, 2]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort reverse sorted in place', () => {
    const arr = [5, 4, 3, 2, 1]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle already sorted array', () => {
    const arr = [1, 2, 3, 4, 5]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle all equal elements', () => {
    const arr = [7, 7, 7, 7]
    countingSortInPlace(arr)
    expect(arr).toEqual([7, 7, 7, 7])
  })

  it('should handle duplicates', () => {
    const arr = [3, 1, 2, 1, 3]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 1, 2, 3, 3])
  })

  it('should sort large array in place', () => {
    const arr = Array.from({ length: 500 }, (_, i) => 499 - i)
    countingSortInPlace(arr)
    expect(isSorted(arr)).toBe(true)
  })

  it('should handle zeros in place', () => {
    const arr = [0, 0, 0]
    countingSortInPlace(arr)
    expect(arr).toEqual([0, 0, 0])
  })

  it('should handle array of size 3', () => {
    const arr = [3, 1, 2]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('should handle array of size 8', () => {
    const arr = [8, 7, 6, 5, 4, 3, 2, 1]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe('countingSortWithMax', () => {
  it('should return empty array for empty input', () => {
    expect(countingSortWithMax([], 0)).toEqual([])
  })

  it('should return single element for single input', () => {
    expect(countingSortWithMax([5], 5)).toEqual([5])
  })

  it('should sort with known max', () => {
    expect(countingSortWithMax([3, 1, 4, 1, 5], 5)).toEqual([1, 1, 3, 4, 5])
  })

  it('should sort with explicit min', () => {
    expect(countingSortWithMax([5, 3, 1], 5, 1)).toEqual([1, 3, 5])
  })

  it('should handle array where max equals all elements', () => {
    expect(countingSortWithMax([3, 3, 3], 3)).toEqual([3, 3, 3])
  })

  it('should not modify original array', () => {
    const original = [3, 1, 2]
    const sorted = countingSortWithMax(original, 3)
    expect(original).toEqual([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
  })

  it('should handle max larger than actual max', () => {
    expect(countingSortWithMax([2, 1, 3], 10)).toEqual([1, 2, 3])
  })

  it('should handle min of 0 default', () => {
    expect(countingSortWithMax([2, 0, 1], 2, 0)).toEqual([0, 1, 2])
  })

  it('should handle negative min', () => {
    expect(countingSortWithMax([2, -1, 0], 2, -1)).toEqual([-1, 0, 2])
  })

  it('should sort with range 0 to max', () => {
    expect(countingSortWithMax([3, 0, 2, 1], 3, 0)).toEqual([0, 1, 2, 3])
  })

  it('should handle duplicates with max', () => {
    expect(countingSortWithMax([3, 1, 3, 1, 2], 3)).toEqual([1, 1, 2, 3, 3])
  })
})

describe('countingSortBy', () => {
  it('should sort objects by numeric property', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = countingSortBy(items, x => x.v)
    expect(result.map(x => x.v)).toEqual([1, 2, 3])
  })

  it('should not modify original array', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    countingSortBy(items, x => x.v)
    expect(items[0]!.v).toBe(3)
  })

  it('should handle empty array', () => {
    expect(countingSortBy([], x => x)).toEqual([])
  })

  it('should handle single element', () => {
    expect(countingSortBy([{ v: 1 }], x => x.v)).toEqual([{ v: 1 }])
  })

  it('should sort by string length', () => {
    const items = ['aaaa', 'bb', 'ccc', 'd']
    const result = countingSortBy(items, x => x.length, 4, 1)
    expect(result).toEqual(['d', 'bb', 'ccc', 'aaaa'])
  })

  it('should handle duplicate keys', () => {
    const items = [{ v: 1, id: 3 }, { v: 1, id: 1 }, { v: 1, id: 2 }]
    const result = countingSortBy(items, x => x.v)
    expect(result).toHaveLength(3)
    expect(result.every(x => x.v === 1)).toBe(true)
  })

  it('should sort by absolute value with explicit min/max', () => {
    const items = [-5, 3, -1, 4, -2]
    const result = countingSortBy(items, Math.abs, 5, 1)
    expect(result).toEqual([-1, -2, 3, 4, -5])
  })

  it('should handle large array with key function', () => {
    const items = Array.from({ length: 500 }, (_, i) => ({ v: 499 - i }))
    const result = countingSortBy(items, x => x.v)
    expect(result[0]!.v).toBe(0)
    expect(result[499]!.v).toBe(499)
  })

  it('should sort by boolean key', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const result = countingSortBy(items, x => (x % 2 === 0 ? 1 : 0), 1, 0)
    const odds = result.filter(x => x % 2 !== 0)
    const evens = result.filter(x => x % 2 === 0)
    expect(odds).toEqual([1, 3, 5])
    expect(evens).toEqual([2, 4, 6])
  })

  it('should sort by object property', () => {
    const items = [{ a: 3, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }]
    const result = countingSortBy(items, x => x.b, 3, 1)
    expect(result.map(x => x.b)).toEqual([1, 2, 3])
  })

  it('should handle array of objects with same key', () => {
    const items = [{ k: 2, id: 1 }, { k: 1, id: 2 }, { k: 2, id: 3 }]
    const result = countingSortBy(items, x => x.k)
    expect(result[0]!.id).toBe(2)
  })

  it('should handle items with key 0', () => {
    const items = [{ v: 2 }, { v: 0 }, { v: 1 }]
    const result = countingSortBy(items, x => x.v, 2, 0)
    expect(result.map(x => x.v)).toEqual([0, 1, 2])
  })
})

describe('countingSortStable', () => {
  it('should maintain stability with equal keys', () => {
    const items = [
      { key: 'b', id: 1 },
      { key: 'a', id: 2 },
      { key: 'b', id: 3 },
      { key: 'a', id: 4 },
    ]
    const result = countingSortStable(
      items,
      x => (x.key === 'a' ? 0 : 1),
      1,
      0,
    )
    expect(result.map(x => x.key)).toEqual(['a', 'a', 'b', 'b'])
    expect(result.map(x => x.id)).toEqual([2, 4, 1, 3])
  })

  it('should be stable for simple numeric sort', () => {
    const items = [
      { v: 3, id: 1 },
      { v: 1, id: 2 },
      { v: 3, id: 3 },
      { v: 2, id: 4 },
      { v: 1, id: 5 },
    ]
    const result = countingSortStable(items, x => x.v)
    const ids = result.filter(x => x.v === 1).map(x => x.id)
    expect(ids).toEqual([2, 5])
    const ids3 = result.filter(x => x.v === 3).map(x => x.id)
    expect(ids3).toEqual([1, 3])
  })

  it('should handle empty array', () => {
    expect(countingSortStable([], x => x)).toEqual([])
  })

  it('should handle single element', () => {
    expect(countingSortStable([42], x => x)).toEqual([42])
  })

  it('should not modify original array', () => {
    const original = [3, 1, 2]
    countingSortStable(original, x => x)
    expect(original).toEqual([3, 1, 2])
  })

  it('should handle all equal elements preserving order', () => {
    const items = [{ v: 1, id: 1 }, { v: 1, id: 2 }, { v: 1, id: 3 }]
    const result = countingSortStable(items, x => x.v)
    expect(result.map(x => x.id)).toEqual([1, 2, 3])
  })

  it('should handle large array with many duplicates stably', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ v: i % 5, id: i }))
    const result = countingSortStable(items, x => x.v)
    expect(result).toHaveLength(100)
    for (let v = 0; v < 5; v++) {
      const inputGroup = items.filter(x => x.v === v)
      const outputGroup = result.filter(x => x.v === v)
      expect(outputGroup.map(x => x.id)).toEqual(inputGroup.map(x => x.id))
    }
  })

  it('should handle 3 groups with equal values', () => {
    const items = [
      { v: 2, id: 1 },
      { v: 1, id: 2 },
      { v: 3, id: 3 },
      { v: 1, id: 4 },
      { v: 2, id: 5 },
      { v: 3, id: 6 },
    ]
    const result = countingSortStable(items, x => x.v)
    expect(result.map(x => x.v)).toEqual([1, 1, 2, 2, 3, 3])
    expect(result.filter(x => x.v === 1).map(x => x.id)).toEqual([2, 4])
    expect(result.filter(x => x.v === 2).map(x => x.id)).toEqual([1, 5])
  })

  it('should sort correctly while being stable', () => {
    const items = [5, 3, 1, 4, 2]
    expect(countingSortStable(items, x => x)).toEqual([1, 2, 3, 4, 5])
  })

  it('should maintain original relative order for same-key items', () => {
    const items = [
      { v: 1, label: 'first' },
      { v: 2, label: 'second' },
      { v: 1, label: 'third' },
      { v: 2, label: 'fourth' },
    ]
    const result = countingSortStable(items, x => x.v)
    expect(result.filter(x => x.v === 1).map(x => x.label)).toEqual(['first', 'third'])
    expect(result.filter(x => x.v === 2).map(x => x.label)).toEqual(['second', 'fourth'])
  })

  it('should handle objects with complex structure', () => {
    const items = [
      { score: 10, name: 'alice' },
      { score: 5, name: 'bob' },
      { score: 10, name: 'charlie' },
    ]
    const result = countingSortStable(items, x => x.score)
    expect(result[0]!.name).toBe('bob')
    expect(result[1]!.name).toBe('alice')
    expect(result[2]!.name).toBe('charlie')
  })
})

describe('getCounts', () => {
  it('should return empty map for empty array', () => {
    const counts = getCounts([])
    expect(counts.size).toBe(0)
  })

  it('should count single element', () => {
    const counts = getCounts([5])
    expect(counts.get(5)).toBe(1)
    expect(counts.size).toBe(1)
  })

  it('should count multiple distinct elements', () => {
    const counts = getCounts([1, 2, 3])
    expect(counts.get(1)).toBe(1)
    expect(counts.get(2)).toBe(1)
    expect(counts.get(3)).toBe(1)
  })

  it('should count duplicates', () => {
    const counts = getCounts([1, 2, 2, 3, 3, 3])
    expect(counts.get(1)).toBe(1)
    expect(counts.get(2)).toBe(2)
    expect(counts.get(3)).toBe(3)
  })

  it('should count all same elements', () => {
    const counts = getCounts([5, 5, 5, 5])
    expect(counts.get(5)).toBe(4)
    expect(counts.size).toBe(1)
  })

  it('should count zeros', () => {
    const counts = getCounts([0, 0, 1])
    expect(counts.get(0)).toBe(2)
    expect(counts.get(1)).toBe(1)
  })

  it('should handle two elements same value', () => {
    const counts = getCounts([7, 7])
    expect(counts.get(7)).toBe(2)
  })

  it('should return Map instance', () => {
    const counts = getCounts([1, 2])
    expect(counts).toBeInstanceOf(Map)
  })
})

describe('getMinMax', () => {
  it('should return zeros for empty array', () => {
    expect(getMinMax([])).toEqual({ min: 0, max: 0 })
  })

  it('should return same value for single element', () => {
    expect(getMinMax([5])).toEqual({ min: 5, max: 5 })
  })

  it('should find min and max of sorted array', () => {
    expect(getMinMax([1, 2, 3, 4, 5])).toEqual({ min: 1, max: 5 })
  })

  it('should find min and max of reverse sorted', () => {
    expect(getMinMax([5, 4, 3, 2, 1])).toEqual({ min: 1, max: 5 })
  })

  it('should find min and max with duplicates', () => {
    expect(getMinMax([3, 1, 4, 1, 5, 9, 2, 6])).toEqual({ min: 1, max: 9 })
  })

  it('should handle all equal elements', () => {
    expect(getMinMax([7, 7, 7])).toEqual({ min: 7, max: 7 })
  })

  it('should handle zeros', () => {
    expect(getMinMax([0, 0, 0])).toEqual({ min: 0, max: 0 })
  })

  it('should handle two elements', () => {
    expect(getMinMax([1, 2])).toEqual({ min: 1, max: 2 })
    expect(getMinMax([2, 1])).toEqual({ min: 1, max: 2 })
  })

  it('should handle min at start and max at end', () => {
    expect(getMinMax([1, 3, 5, 7, 9])).toEqual({ min: 1, max: 9 })
  })

  it('should handle max at start and min at end', () => {
    expect(getMinMax([9, 7, 5, 3, 1])).toEqual({ min: 1, max: 9 })
  })
})

describe('isSorted', () => {
  it('should return true for empty array', () => {
    expect(isSorted([])).toBe(true)
  })

  it('should return true for single element', () => {
    expect(isSorted([1])).toBe(true)
  })

  it('should return true for sorted array', () => {
    expect(isSorted([1, 2, 3, 4, 5])).toBe(true)
  })

  it('should return false for unsorted array', () => {
    expect(isSorted([3, 1, 2])).toBe(false)
  })

  it('should return true for equal elements', () => {
    expect(isSorted([5, 5, 5])).toBe(true)
  })

  it('should return false for reverse sorted', () => {
    expect(isSorted([5, 4, 3, 2, 1])).toBe(false)
  })

  it('should return false when last two are out of order', () => {
    expect(isSorted([1, 2, 3, 5, 4])).toBe(false)
  })

  it('should return false when first two are out of order', () => {
    expect(isSorted([2, 1, 3, 4, 5])).toBe(false)
  })

  it('should handle two sorted elements', () => {
    expect(isSorted([1, 2])).toBe(true)
  })

  it('should handle two unsorted elements', () => {
    expect(isSorted([2, 1])).toBe(false)
  })

  it('should return true for equal adjacent elements', () => {
    expect(isSorted([1, 1, 2, 2, 3])).toBe(true)
  })

  it('should return false for single inversion', () => {
    expect(isSorted([1, 3, 2, 4])).toBe(false)
  })

  it('should handle zeros', () => {
    expect(isSorted([0, 0, 0])).toBe(true)
  })
})

describe('CountingSorter', () => {
  it('should sort via instance sort method', () => {
    const sorter = new CountingSorter([3, 1, 2])
    expect(sorter.sort()).toEqual([1, 2, 3])
  })

  it('should sort via static fromArray method', () => {
    expect(CountingSorter.fromArray([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('fromArray should handle empty array', () => {
    expect(CountingSorter.fromArray([])).toEqual([])
  })

  it('fromArray should handle single element', () => {
    expect(CountingSorter.fromArray([42])).toEqual([42])
  })

  it('fromArray should handle sorted input', () => {
    expect(CountingSorter.fromArray([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('fromArray should handle reverse sorted input', () => {
    expect(CountingSorter.fromArray([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('fromArray should not modify original', () => {
    const arr = [3, 1, 2]
    CountingSorter.fromArray(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('instance sort should not modify original data', () => {
    const sorter = new CountingSorter([3, 1, 2])
    sorter.sort()
    expect(sorter.sort()).toEqual([1, 2, 3])
  })

  it('should handle duplicates via fromArray', () => {
    expect(CountingSorter.fromArray([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3])
  })
})

describe('edge cases and integration', () => {
  it('all functions should handle empty array', () => {
    expect(countingSort([])).toEqual([])
    expect(isSorted([])).toBe(true)
    expect(getCounts([]).size).toBe(0)
    expect(getMinMax([])).toEqual({ min: 0, max: 0 })
    expect(countingSortWithMax([], 0)).toEqual([])
  })

  it('all functions should handle single element', () => {
    expect(countingSort([1])).toEqual([1])
    expect(isSorted([1])).toBe(true)
    expect(getCounts([1]).get(1)).toBe(1)
    expect(getMinMax([1])).toEqual({ min: 1, max: 1 })
  })

  it('countingSort result should pass isSorted', () => {
    const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 50))
    const sorted = countingSort(arr)
    expect(isSorted(sorted)).toBe(true)
  })

  it('countingSortInPlace result should pass isSorted', () => {
    const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 50))
    countingSortInPlace(arr)
    expect(isSorted(arr)).toBe(true)
  })

  it('countingSortBy result should be sorted by key', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ v: 49 - i }))
    const result = countingSortBy(items, x => x.v)
    expect(isSorted(result.map(x => x.v))).toBe(true)
  })

  it('sorted array should have correct counts', () => {
    const arr = [3, 1, 2, 1, 3]
    const counts = getCounts(arr)
    const sorted = countingSort(arr)
    const sortedCounts = getCounts(sorted)
    expect(counts).toEqual(sortedCounts)
  })

  it('sorted array should have same min/max', () => {
    const arr = [5, 2, 8, 1, 9, 3]
    const originalMinMax = getMinMax(arr)
    const sorted = countingSort(arr)
    const sortedMinMax = getMinMax(sorted)
    expect(originalMinMax).toEqual(sortedMinMax)
  })

  it('all sort functions should produce same result', () => {
    const original = [7, 2, 5, 1, 8, 3, 6, 4]
    const expected = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(countingSort(original)).toEqual(expected)
    expect(CountingSorter.fromArray(original)).toEqual(expected)

    const copy = [...original]
    countingSortInPlace(copy)
    expect(copy).toEqual(expected)
  })

  it('countingSort and countingSortStable should produce same sorted output', () => {
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    expect(countingSort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(countingSortStable(arr, x => x)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('should handle array with many duplicates correctly', () => {
    const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 5))
    const sorted = countingSort(arr)
    expect(isSorted(sorted)).toBe(true)
    expect(sorted).toHaveLength(100)
  })

  it('countingSortBy and countingSortStable should produce same output for numbers', () => {
    const arr = [5, 3, 1, 4, 2]
    const byResult = countingSortBy(arr, x => x)
    const stableResult = countingSortStable(arr, x => x)
    expect(byResult).toEqual(stableResult)
  })
})

describe('stress tests', () => {
  it('countingSort should sort 10000 random elements', () => {
    const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100))
    const sorted = countingSort(arr)
    expect(sorted).toHaveLength(10000)
    expect(isSorted(sorted)).toBe(true)
  })

  it('countingSortInPlace should sort 5000 random elements', () => {
    const arr = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 50))
    countingSortInPlace(arr)
    expect(arr).toHaveLength(5000)
    expect(isSorted(arr)).toBe(true)
  })

  it('countingSortStable should sort 1000 elements preserving stability', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ v: i % 10, id: i }))
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = tmp
    }
    const result = countingSortStable(shuffled, x => x.v)
    expect(result).toHaveLength(1000)
    expect(isSorted(result.map(x => x.v))).toBe(true)
    for (let v = 0; v < 10; v++) {
      const inputGroup = shuffled.filter(x => x.v === v)
      const outputGroup = result.filter(x => x.v === v)
      expect(outputGroup.map(x => x.id)).toEqual(inputGroup.map(x => x.id))
    }
  })

  it('countingSortBy should handle 5000 elements', () => {
    const items = Array.from({ length: 5000 }, (_, i) => ({ v: 4999 - i }))
    const result = countingSortBy(items, x => x.v)
    expect(isSorted(result.map(x => x.v))).toBe(true)
  })

  it('isSorted should correctly validate 10000 sorted elements', () => {
    const sorted = Array.from({ length: 10000 }, (_, i) => i)
    expect(isSorted(sorted)).toBe(true)
    const tmp = sorted[0]!
    sorted[0] = sorted[9999]!
    sorted[9999] = tmp
    expect(isSorted(sorted)).toBe(false)
  })

  it('getCounts should handle 10000 elements', () => {
    const arr = Array.from({ length: 10000 }, (_, i) => i % 100)
    const counts = getCounts(arr)
    expect(counts.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(counts.get(i)).toBe(100)
    }
  })

  it('getMinMax should handle 10000 elements', () => {
    const arr = Array.from({ length: 10000 }, (_, i) => i)
    expect(getMinMax(arr)).toEqual({ min: 0, max: 9999 })
  })

  it('countingSortWithMax should sort 5000 elements', () => {
    const arr = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 50))
    const sorted = countingSortWithMax(arr, 49)
    expect(isSorted(sorted)).toBe(true)
  })

  it('should handle reverse sorted 1000 elements', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => 999 - i)
    const sorted = countingSort(arr)
    expect(sorted[0]).toBe(0)
    expect(sorted[999]).toBe(999)
    expect(isSorted(sorted)).toBe(true)
  })

  it('should handle all zeros array', () => {
    const arr = new Array(1000).fill(0)
    const sorted = countingSort(arr)
    expect(sorted.every(x => x === 0)).toBe(true)
    expect(sorted).toHaveLength(1000)
  })
})

describe('type exports', () => {
  it('should export MinMax type', async () => {
    const mod = await import('../../src/core/counting-sort/counting-sort.js')
    const minMax: mod.MinMax = { min: 1, max: 5 }
    expect(minMax.min).toBe(1)
    expect(minMax.max).toBe(5)
  })

  it('should export MinMax with negative values', async () => {
    const mod = await import('../../src/core/counting-sort/counting-sort.js')
    const minMax: mod.MinMax = { min: -10, max: 10 }
    expect(minMax.min).toBe(-10)
    expect(minMax.max).toBe(10)
  })

  it('should export MinMax with equal values', async () => {
    const mod = await import('../../src/core/counting-sort/counting-sort.js')
    const minMax: mod.MinMax = { min: 5, max: 5 }
    expect(minMax.min).toBe(minMax.max)
  })
})

describe('additional edge cases', () => {
  it('countingSort should handle binary values (0 and 1)', () => {
    expect(countingSort([1, 0, 1, 0, 0, 1])).toEqual([0, 0, 0, 1, 1, 1])
  })

  it('countingSort should preserve all elements', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const sorted = countingSort(arr)
    expect(sorted).toHaveLength(arr.length)
    const originalCounts = getCounts(arr)
    const sortedCounts = getCounts(sorted)
    for (const [key, count] of originalCounts) {
      expect(sortedCounts.get(key)).toBe(count)
    }
  })

  it('countingSortInPlace should work with single swap needed', () => {
    const arr = [2, 1]
    countingSortInPlace(arr)
    expect(arr).toEqual([1, 2])
  })

  it('countingSortWithMax should handle single element array', () => {
    expect(countingSortWithMax([5], 10, 0)).toEqual([5])
  })

  it('countingSortBy should return new array reference', () => {
    const arr = [{ v: 1 }]
    const result = countingSortBy(arr, x => x.v)
    expect(result).not.toBe(arr)
  })

  it('countingSortStable should return new array reference', () => {
    const arr = [1]
    const result = countingSortStable(arr, x => x)
    expect(result).not.toBe(arr)
  })

  it('getCounts should handle single element', () => {
    const counts = getCounts([42])
    expect(counts.size).toBe(1)
    expect(counts.get(42)).toBe(1)
    expect(counts.has(0)).toBe(false)
  })

  it('getMinMax should handle consecutive integers', () => {
    const arr = [0, 1, 2, 3, 4]
    expect(getMinMax(arr)).toEqual({ min: 0, max: 4 })
  })

  it('isSorted should handle single element after sort', () => {
    const result = countingSort([5])
    expect(isSorted(result)).toBe(true)
  })
})
