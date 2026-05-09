import { describe, it, expect } from 'vitest'
import {
  mergeSortOptimized,
  mergeSortInPlace,
  mergeSortBy,
  mergeSortStable,
  isSorted,
  countInversions,
  countRuns,
} from '../../src/core/merge-sort-optimized/merge-sort-optimized.js'

function shuffledRange(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function reverseRange(n: number): number[] {
  return Array.from({ length: n }, (_, i) => n - 1 - i)
}

describe('mergeSortOptimized', () => {
  it('should return empty array for empty input', () => {
    expect(mergeSortOptimized([])).toEqual([])
  })

  it('should return single element for single element input', () => {
    expect(mergeSortOptimized([42])).toEqual([42])
  })

  it('should sort two elements', () => {
    expect(mergeSortOptimized([2, 1])).toEqual([1, 2])
  })

  it('should sort already sorted array', () => {
    expect(mergeSortOptimized([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort reverse sorted array', () => {
    expect(mergeSortOptimized([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort random array', () => {
    expect(mergeSortOptimized([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('should handle duplicates', () => {
    expect(mergeSortOptimized([3, 3, 3, 1, 1, 2, 2])).toEqual([1, 1, 2, 2, 3, 3, 3])
  })

  it('should handle negative numbers', () => {
    expect(mergeSortOptimized([-5, 3, -1, 0, 2])).toEqual([-5, -1, 0, 2, 3])
  })

  it('should not modify original array', () => {
    const original = [3, 1, 2]
    const sorted = mergeSortOptimized(original)
    expect(original).toEqual([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
  })

  it('should work with custom comparator (descending)', () => {
    const result = mergeSortOptimized([3, 1, 4, 1, 5], (a, b) => b - a)
    expect(result).toEqual([5, 4, 3, 1, 1])
  })

  it('should work with strings', () => {
    expect(mergeSortOptimized(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
  })

  it('should work with objects using custom comparator', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = mergeSortOptimized(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.v)).toEqual([1, 2, 3])
  })

  it('should sort large array (10000 elements)', () => {
    const arr = shuffledRange(10000)
    const result = mergeSortOptimized(arr)
    expect(result).toHaveLength(10000)
    expect(isSorted(result)).toBe(true)
  })

  it('should leverage natural runs in nearly sorted input', () => {
    const arr = [1, 2, 3, 5, 4, 6, 7, 8, 10, 9]
    expect(mergeSortOptimized(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('should handle array of all identical elements', () => {
    expect(mergeSortOptimized([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5])
  })

  it('should handle array of size exactly at insertion threshold', () => {
    const arr = reverseRange(32)
    expect(mergeSortOptimized(arr)).toEqual(Array.from({ length: 32 }, (_, i) => i))
  })

  it('should handle array just above insertion threshold', () => {
    const arr = reverseRange(33)
    expect(mergeSortOptimized(arr)).toEqual(Array.from({ length: 33 }, (_, i) => i))
  })

  it('should handle array of size 64 (power of 2)', () => {
    const arr = reverseRange(64)
    expect(mergeSortOptimized(arr)).toEqual(Array.from({ length: 64 }, (_, i) => i))
  })

  it('should sort floating point numbers', () => {
    expect(mergeSortOptimized([3.14, 1.41, 2.72, 0.58])).toEqual([0.58, 1.41, 2.72, 3.14])
  })
})

describe('mergeSortInPlace', () => {
  it('should handle empty array', () => {
    const arr: number[] = []
    mergeSortInPlace(arr)
    expect(arr).toEqual([])
  })

  it('should handle single element', () => {
    const arr = [42]
    mergeSortInPlace(arr)
    expect(arr).toEqual([42])
  })

  it('should sort two elements in place', () => {
    const arr = [2, 1]
    mergeSortInPlace(arr)
    expect(arr).toEqual([1, 2])
  })

  it('should sort array in place', () => {
    const arr = [5, 3, 1, 4, 2]
    mergeSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should sort reverse sorted in place', () => {
    const arr = [5, 4, 3, 2, 1]
    mergeSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should work with custom comparator', () => {
    const arr = [3, 1, 4, 1, 5]
    mergeSortInPlace(arr, (a, b) => b - a)
    expect(arr).toEqual([5, 4, 3, 1, 1])
  })

  it('should sort large array in place', () => {
    const arr = shuffledRange(1000)
    mergeSortInPlace(arr)
    expect(isSorted(arr)).toBe(true)
  })

  it('should handle already sorted array', () => {
    const arr = [1, 2, 3, 4, 5]
    mergeSortInPlace(arr)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle all equal elements', () => {
    const arr = [7, 7, 7, 7]
    mergeSortInPlace(arr)
    expect(arr).toEqual([7, 7, 7, 7])
  })

  it('should handle negative numbers', () => {
    const arr = [3, -1, 0, -5, 2]
    mergeSortInPlace(arr)
    expect(arr).toEqual([-5, -1, 0, 2, 3])
  })

  it('should sort strings in place', () => {
    const arr = ['cherry', 'apple', 'banana']
    mergeSortInPlace(arr)
    expect(arr).toEqual(['apple', 'banana', 'cherry'])
  })
})

describe('mergeSortBy', () => {
  it('should sort by string property', () => {
    const items = [{ name: 'charlie' }, { name: 'alice' }, { name: 'bob' }]
    const result = mergeSortBy(items, x => x.name)
    expect(result.map(x => x.name)).toEqual(['alice', 'bob', 'charlie'])
  })

  it('should sort by numeric property', () => {
    const items = [{ age: 30 }, { age: 10 }, { age: 20 }]
    const result = mergeSortBy(items, x => x.age)
    expect(result.map(x => x.age)).toEqual([10, 20, 30])
  })

  it('should not modify original array', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    mergeSortBy(items, x => x.v)
    expect(items[0]!.v).toBe(3)
  })

  it('should handle empty array', () => {
    expect(mergeSortBy([], x => x)).toEqual([])
  })

  it('should handle single element', () => {
    expect(mergeSortBy([{ v: 1 }], x => x.v)).toEqual([{ v: 1 }])
  })

  it('should sort by string length', () => {
    const items = ['aaaa', 'bb', 'ccc', 'd']
    const result = mergeSortBy(items, x => x.length)
    expect(result).toEqual(['d', 'bb', 'ccc', 'aaaa'])
  })

  it('should work with custom key comparator', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }]
    const result = mergeSortBy(items, x => x.v, (a, b) => b - a)
    expect(result.map(x => x.v)).toEqual([3, 2, 1])
  })

  it('should handle duplicate keys', () => {
    const items = [{ v: 1, id: 3 }, { v: 1, id: 1 }, { v: 1, id: 2 }]
    const result = mergeSortBy(items, x => x.v)
    expect(result).toHaveLength(3)
    expect(result.every(x => x.v === 1)).toBe(true)
  })

  it('should sort by absolute value', () => {
    const items = [-5, 3, -1, 4, -2]
    const result = mergeSortBy(items, Math.abs)
    expect(result).toEqual([-1, -2, 3, 4, -5])
  })

  it('should handle large array with key function', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ v: 999 - i }))
    const result = mergeSortBy(items, x => x.v)
    expect(result[0]!.v).toBe(0)
    expect(result[999]!.v).toBe(999)
  })
})

describe('mergeSortStable', () => {
  it('should maintain stability with equal keys', () => {
    const items = [
      { key: 'b', id: 1 },
      { key: 'a', id: 2 },
      { key: 'b', id: 3 },
      { key: 'a', id: 4 },
    ]
    const result = mergeSortStable(items, (a, b) => {
      if (a.key < b.key) return -1
      if (a.key > b.key) return 1
      return 0
    })
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
    const result = mergeSortStable(items, (a, b) => a.v - b.v)
    const ids = result.filter(x => x.v === 1).map(x => x.id)
    expect(ids).toEqual([2, 5])
    const ids3 = result.filter(x => x.v === 3).map(x => x.id)
    expect(ids3).toEqual([1, 3])
  })

  it('should handle empty array', () => {
    expect(mergeSortStable([])).toEqual([])
  })

  it('should handle single element', () => {
    expect(mergeSortStable([42])).toEqual([42])
  })

  it('should not modify original array', () => {
    const original = [3, 1, 2]
    mergeSortStable(original)
    expect(original).toEqual([3, 1, 2])
  })

  it('should handle all equal elements preserving order', () => {
    const items = [{ v: 1, id: 1 }, { v: 1, id: 2 }, { v: 1, id: 3 }]
    const result = mergeSortStable(items, (a, b) => a.v - b.v)
    expect(result.map(x => x.id)).toEqual([1, 2, 3])
  })

  it('should handle large array with many duplicates stably', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ v: i % 5, id: i }))
    const result = mergeSortStable(items, (a, b) => a.v - b.v)
    expect(result).toHaveLength(100)
    for (let v = 0; v < 5; v++) {
      const inputGroup = items.filter(x => x.v === v)
      const outputGroup = result.filter(x => x.v === v)
      expect(outputGroup.map(x => x.id)).toEqual(inputGroup.map(x => x.id))
    }
  })

  it('should sort correctly while being stable', () => {
    const items = [5, 3, 1, 4, 2]
    expect(mergeSortStable(items)).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle custom comparator with stability', () => {
    const items = [
      { cat: 'b', val: 2 },
      { cat: 'a', val: 1 },
      { cat: 'b', val: 1 },
      { cat: 'a', val: 2 },
    ]
    const result = mergeSortStable(items, (a, b) => a.cat.localeCompare(b.cat))
    expect(result.map(x => x.cat)).toEqual(['a', 'a', 'b', 'b'])
    expect(result[0]!.val).toBe(1)
    expect(result[1]!.val).toBe(2)
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

  it('should return true for reverse sorted with custom comparator', () => {
    expect(isSorted([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(true)
  })

  it('should return false for reverse sorted with default comparator', () => {
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

  it('should handle strings', () => {
    expect(isSorted(['a', 'b', 'c'])).toBe(true)
    expect(isSorted(['c', 'a', 'b'])).toBe(false)
  })
})

describe('countInversions', () => {
  it('should return 0 for empty array', () => {
    expect(countInversions([])).toBe(0)
  })

  it('should return 0 for single element', () => {
    expect(countInversions([1])).toBe(0)
  })

  it('should return 0 for sorted array', () => {
    expect(countInversions([1, 2, 3, 4, 5])).toBe(0)
  })

  it('should count inversions in reverse sorted', () => {
    expect(countInversions([3, 2, 1])).toBe(3)
  })

  it('should count inversions for two elements', () => {
    expect(countInversions([2, 1])).toBe(1)
    expect(countInversions([1, 2])).toBe(0)
  })

  it('should count correct inversions for specific array', () => {
    expect(countInversions([2, 4, 1, 3, 5])).toBe(3)
  })

  it('should return n*(n-1)/2 for fully reversed', () => {
    expect(countInversions([5, 4, 3, 2, 1])).toBe(10)
  })

  it('should return 0 for all equal elements', () => {
    expect(countInversions([3, 3, 3, 3])).toBe(0)
  })

  it('should not modify original array', () => {
    const arr = [3, 1, 2]
    countInversions(arr)
    expect(arr).toEqual([3, 1, 2])
  })

  it('should work with custom comparator (descending)', () => {
    expect(countInversions([1, 2, 3], (a, b) => b - a)).toBe(3)
  })

  it('should handle large reversed array', () => {
    const n = 100
    const arr = reverseRange(n)
    expect(countInversions(arr)).toBe(n * (n - 1) / 2)
  })

  it('should count inversions for single swap', () => {
    expect(countInversions([1, 3, 2, 4])).toBe(1)
  })

  it('should handle negative numbers', () => {
    expect(countInversions([1, -1, 2, -2])).toBe(4)
  })
})

describe('countRuns', () => {
  it('should return 0 for empty array', () => {
    expect(countRuns([])).toBe(0)
  })

  it('should return 1 for single element', () => {
    expect(countRuns([1])).toBe(1)
  })

  it('should return 1 for fully sorted ascending array', () => {
    expect(countRuns([1, 2, 3, 4, 5])).toBe(1)
  })

  it('should return 1 for fully sorted descending array', () => {
    expect(countRuns([5, 4, 3, 2, 1])).toBe(1)
  })

  it('should count runs with direction changes', () => {
    expect(countRuns([1, 3, 2, 4, 3])).toBe(3)
    expect(countRuns([1, 2, 1, 2, 1, 2, 1])).toBe(4)
    expect(countRuns([3, 1, 3, 1])).toBe(2)
  })

  it('should handle two sorted elements', () => {
    expect(countRuns([1, 2])).toBe(1)
  })

  it('should handle two reversed elements', () => {
    expect(countRuns([2, 1])).toBe(1)
  })

  it('should handle all equal elements', () => {
    expect(countRuns([5, 5, 5, 5])).toBe(1)
  })

  it('should count runs in partially sorted array', () => {
    expect(countRuns([1, 2, 3, 5, 4, 6, 7])).toBe(2)
    expect(countRuns([1, 2, 5, 4, 3, 6, 7])).toBe(3)
  })

  it('should work with custom comparator', () => {
    expect(countRuns([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(1)
  })

  it('should handle negative numbers', () => {
    expect(countRuns([-3, -1, 0, 2, -2])).toBe(2)
  })

  it('should handle single run ascending then single run descending', () => {
    expect(countRuns([1, 2, 3, 3, 2, 1])).toBe(2)
  })
})

describe('edge cases and integration', () => {
  it('all functions should handle empty array', () => {
    expect(mergeSortOptimized([])).toEqual([])
    expect(isSorted([])).toBe(true)
    expect(countInversions([])).toBe(0)
    expect(countRuns([])).toBe(0)
  })

  it('all functions should handle single element', () => {
    expect(mergeSortOptimized([1])).toEqual([1])
    expect(isSorted([1])).toBe(true)
    expect(countInversions([1])).toBe(0)
    expect(countRuns([1])).toBe(1)
  })

  it('mergeSortOptimized result should pass isSorted', () => {
    const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 500))
    const sorted = mergeSortOptimized(arr)
    expect(isSorted(sorted)).toBe(true)
  })

  it('mergeSortInPlace result should pass isSorted', () => {
    const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 500))
    mergeSortInPlace(arr)
    expect(isSorted(arr)).toBe(true)
  })

  it('mergeSortBy result should be sorted by key', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ v: 49 - i }))
    const result = mergeSortBy(items, x => x.v)
    expect(isSorted(result.map(x => x.v))).toBe(true)
  })

  it('sorted array should have 0 inversions', () => {
    const arr = shuffledRange(100)
    const sorted = mergeSortOptimized(arr)
    expect(countInversions(sorted)).toBe(0)
  })

  it('reverse sorted array should have n*(n-1)/2 inversions', () => {
    const n = 20
    expect(countInversions(reverseRange(n))).toBe(n * (n - 1) / 2)
  })

  it('sorted array should have 1 run', () => {
    const sorted = Array.from({ length: 50 }, (_, i) => i)
    expect(countRuns(sorted)).toBe(1)
  })

  it('should sort array with many duplicates correctly', () => {
    const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 5))
    const sorted = mergeSortOptimized(arr)
    expect(isSorted(sorted)).toBe(true)
    expect(sorted).toHaveLength(100)
  })

  it('mergeSortStable should produce correctly sorted output', () => {
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    const result = mergeSortStable(arr)
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('all sort functions should produce same sorted result', () => {
    const original = [7, 2, 5, 1, 8, 3, 6, 4]
    const expected = [1, 2, 3, 4, 5, 6, 7, 8]

    expect(mergeSortOptimized(original)).toEqual(expected)
    expect(mergeSortStable(original)).toEqual(expected)

    const copy = [...original]
    mergeSortInPlace(copy)
    expect(copy).toEqual(expected)
  })

  it('should handle array with MIN/MAX safe integers', () => {
    const arr = [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 1]
    const result = mergeSortOptimized(arr)
    expect(result).toEqual([Number.MIN_SAFE_INTEGER, 0, 1, Number.MAX_SAFE_INTEGER])
  })

  it('should handle booleans', () => {
    const arr = [true, false, true, false]
    const result = mergeSortOptimized(arr)
    expect(result).toEqual([false, false, true, true])
  })
})

describe('stress tests', () => {
  it('mergeSortOptimized should sort 10000 random elements', () => {
    const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000))
    const sorted = mergeSortOptimized(arr)
    expect(sorted).toHaveLength(10000)
    expect(isSorted(sorted)).toBe(true)
  })

  it('mergeSortInPlace should sort 5000 random elements', () => {
    const arr = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 5000))
    mergeSortInPlace(arr)
    expect(arr).toHaveLength(5000)
    expect(isSorted(arr)).toBe(true)
  })

  it('mergeSortStable should sort 1000 elements preserving stability', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ v: i % 10, id: i }))
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = tmp
    }
    const result = mergeSortStable(shuffled, (a, b) => a.v - b.v)
    expect(result).toHaveLength(1000)
    expect(isSorted(result.map(x => x.v))).toBe(true)
    for (let v = 0; v < 10; v++) {
      const inputGroup = shuffled.filter(x => x.v === v)
      const outputGroup = result.filter(x => x.v === v)
      expect(outputGroup.map(x => x.id)).toEqual(inputGroup.map(x => x.id))
    }
  })

  it('countInversions should handle 1000 elements', () => {
    const arr = reverseRange(1000)
    expect(countInversions(arr)).toBe(1000 * 999 / 2)
  })

  it('mergeSortBy should handle 5000 elements', () => {
    const items = Array.from({ length: 5000 }, (_, i) => ({ v: 4999 - i }))
    const result = mergeSortBy(items, x => x.v)
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

  it('countRuns should handle 1000 sorted elements', () => {
    const sorted = Array.from({ length: 1000 }, (_, i) => i)
    expect(countRuns(sorted)).toBe(1)
  })

  it('countRuns should handle 1000 alternating elements', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i % 2 === 0 ? i : -i)
    const runs = countRuns(arr)
    expect(runs).toBeGreaterThan(1)
  })
})

describe('type exports', () => {
  it('should export CompareFn type', async () => {
    const mod = await import('../../src/core/merge-sort-optimized/merge-sort-optimized.js')
    const sortFn: mod.CompareFn<number> = (a, b) => a - b
    expect(sortFn(1, 2)).toBe(-1)
  })

  it('should export RunInfo type', async () => {
    const mod = await import('../../src/core/merge-sort-optimized/merge-sort-optimized.js')
    const run: mod.RunInfo = { start: 0, length: 5, ascending: true }
    expect(run.length).toBe(5)
  })

  it('should export SortResult type', async () => {
    const mod = await import('../../src/core/merge-sort-optimized/merge-sort-optimized.js')
    const result: mod.SortResult<number> = { sorted: [1, 2, 3], inversions: 0 }
    expect(result.sorted).toHaveLength(3)
  })
})
