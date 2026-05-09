import { describe, it, expect } from 'vitest'
import { timsort, timsortInPlace, timsortBy, isSorted, isStable, countRuns } from '../../src/core/timsort/timsort.js'

function shuffled(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i)
}

describe('timsort', () => {
  describe('timsort', () => {
    it('returns empty array for empty input', () => {
      expect(timsort([])).toEqual([])
    })

    it('returns single element unchanged', () => {
      expect(timsort([42])).toEqual([42])
    })

    it('returns sorted copy for already sorted array', () => {
      expect(timsort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      expect(timsort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      expect(timsort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('does not modify the original array', () => {
      const original = [3, 1, 4, 1, 5]
      const copy = [...original]
      timsort(original)
      expect(original).toEqual(copy)
    })

    it('works with custom compare function', () => {
      const result = timsort([3, 1, 4, 1, 5], (a, b) => b - a)
      expect(result).toEqual([5, 4, 3, 1, 1])
    })

    it('handles all same elements', () => {
      expect(timsort([7, 7, 7, 7, 7])).toEqual([7, 7, 7, 7, 7])
    })

    it('handles negative numbers', () => {
      expect(timsort([-3, 1, -4, 1, 5, -9])).toEqual([-9, -4, -3, 1, 1, 5])
    })

    it('handles two ascending elements', () => {
      expect(timsort([1, 2])).toEqual([1, 2])
    })

    it('handles two descending elements', () => {
      expect(timsort([2, 1])).toEqual([1, 2])
    })

    it('handles two equal elements', () => {
      expect(timsort([5, 5])).toEqual([5, 5])
    })

    it('sorts floats correctly', () => {
      expect(timsort([3.14, 2.71, 1.41, 1.73])).toEqual([1.41, 1.73, 2.71, 3.14])
    })

    it('sorts large array correctly', () => {
      const arr = shuffled(500)
      const result = timsort(arr)
      expect(result).toEqual(range(0, 500))
    })

    it('sorts array of size 64 (min run boundary)', () => {
      const arr = shuffled(64)
      const result = timsort(arr)
      expect(result).toEqual(range(0, 64))
    })

    it('sorts array of size 65 (just above min run)', () => {
      const arr = shuffled(65)
      const result = timsort(arr)
      expect(result).toEqual(range(0, 65))
    })

    it('sorts array of size 128', () => {
      const arr = shuffled(128)
      const result = timsort(arr)
      expect(result).toEqual(range(0, 128))
    })

    it('handles strings with default comparison', () => {
      expect(timsort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles array with zeros and positive numbers', () => {
      expect(timsort([0, 3, 0, 1, 0])).toEqual([0, 0, 0, 1, 3])
    })

    it('sorts very large array', () => {
      const arr = shuffled(1000)
      const result = timsort(arr)
      expect(result).toEqual(range(0, 1000))
    })
  })

  describe('timsortInPlace', () => {
    it('handles empty array', () => {
      const arr: number[] = []
      timsortInPlace(arr)
      expect(arr).toEqual([])
    })

    it('handles single element', () => {
      const arr = [42]
      timsortInPlace(arr)
      expect(arr).toEqual([42])
    })

    it('sorts already sorted array', () => {
      const arr = [1, 2, 3, 4, 5]
      timsortInPlace(arr)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const arr = [5, 4, 3, 2, 1]
      timsortInPlace(arr)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random array', () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6]
      timsortInPlace(arr)
      expect(arr).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('modifies the original array', () => {
      const arr = [3, 1, 2]
      timsortInPlace(arr)
      expect(arr).toBe(arr)
      expect(arr).toEqual([1, 2, 3])
    })

    it('works with custom compare', () => {
      const arr = [3, 1, 4, 1, 5]
      timsortInPlace(arr, (a, b) => b - a)
      expect(arr).toEqual([5, 4, 3, 1, 1])
    })

    it('handles all same elements', () => {
      const arr = [7, 7, 7, 7, 7]
      timsortInPlace(arr)
      expect(arr).toEqual([7, 7, 7, 7, 7])
    })

    it('handles negative numbers', () => {
      const arr = [-3, 1, -4, 1, 5, -9]
      timsortInPlace(arr)
      expect(arr).toEqual([-9, -4, -3, 1, 1, 5])
    })

    it('handles two elements', () => {
      const arr = [2, 1]
      timsortInPlace(arr)
      expect(arr).toEqual([1, 2])
    })

    it('sorts large array', () => {
      const arr = shuffled(500)
      timsortInPlace(arr)
      expect(arr).toEqual(range(0, 500))
    })

    it('works with default compare (undefined)', () => {
      const arr = [5, 3, 1, 4, 2]
      timsortInPlace(arr, undefined)
      expect(arr).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts objects by property', () => {
      const arr = [{ v: 3 }, { v: 1 }, { v: 2 }]
      timsortInPlace(arr, (a, b) => a.v - b.v)
      expect(arr.map(o => o.v)).toEqual([1, 2, 3])
    })

    it('handles duplicates', () => {
      const arr = [3, 1, 2, 1, 3, 2]
      timsortInPlace(arr)
      expect(arr).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('handles array of size 33', () => {
      const arr = shuffled(33)
      timsortInPlace(arr)
      expect(arr).toEqual(range(0, 33))
    })
  })

  describe('timsortBy', () => {
    it('sorts by key function', () => {
      const arr = [3, 1, 4, 1, 5]
      expect(timsortBy(arr, x => Math.abs(x))).toEqual([1, 1, 3, 4, 5])
    })

    it('sorts objects by numeric property', () => {
      const arr = [{ name: 'c', age: 30 }, { name: 'a', age: 10 }, { name: 'b', age: 20 }]
      const result = timsortBy(arr, o => o.age)
      expect(result.map(o => o.name)).toEqual(['a', 'b', 'c'])
    })

    it('sorts objects by string property', () => {
      const arr = [{ name: 'charlie' }, { name: 'alice' }, { name: 'bob' }]
      const result = timsortBy(arr, o => o.name)
      expect(result.map(o => o.name)).toEqual(['alice', 'bob', 'charlie'])
    })

    it('works with custom key compare', () => {
      const arr = [{ v: 3 }, { v: 1 }, { v: 2 }]
      const result = timsortBy(arr, o => o.v, (a, b) => b - a)
      expect(result.map(o => o.v)).toEqual([3, 2, 1])
    })

    it('handles empty array', () => {
      expect(timsortBy([], (x: number) => x)).toEqual([])
    })

    it('handles single element', () => {
      expect(timsortBy([42], x => x)).toEqual([42])
    })

    it('preserves original items (same references)', () => {
      const obj1 = { v: 3 }
      const obj2 = { v: 1 }
      const obj3 = { v: 2 }
      const result = timsortBy([obj1, obj2, obj3], o => o.v)
      expect(result[0]).toBe(obj2)
      expect(result[1]).toBe(obj3)
      expect(result[2]).toBe(obj1)
    })

    it('handles equal keys maintaining stability', () => {
      const arr = [{ k: 1, v: 'a' }, { k: 1, v: 'b' }, { k: 2, v: 'c' }]
      const result = timsortBy(arr, o => o.k)
      expect(result.map(o => o.v)).toEqual(['a', 'b', 'c'])
    })

    it('sorts by absolute value', () => {
      expect(timsortBy([-3, 1, -4, 1, 5], x => Math.abs(x))).toEqual([1, 1, -3, -4, 5])
    })

    it('sorts by string length', () => {
      const arr = ['aaa', 'b', 'cc', 'dddd']
      expect(timsortBy(arr, s => s.length)).toEqual(['b', 'cc', 'aaa', 'dddd'])
    })

    it('returns new array', () => {
      const original = [3, 1, 2]
      const result = timsortBy(original, x => x)
      expect(result).not.toBe(original)
      expect(original).toEqual([3, 1, 2])
    })

    it('sorts by computed property', () => {
      const arr = [10, 21, 32, 43]
      expect(timsortBy(arr, x => x % 10)).toEqual([10, 21, 32, 43])
    })

    it('handles complex key function', () => {
      const arr = [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 1 }]
      const result = timsortBy(arr, p => p.x * p.y)
      expect(result.map(p => p.x)).toEqual([1, 3, 2])
    })

    it('handles duplicate keys', () => {
      const arr = [{ k: 2, id: 1 }, { k: 1, id: 2 }, { k: 2, id: 3 }]
      const result = timsortBy(arr, o => o.k)
      expect(result[0]!.id).toBe(2)
      expect(result[1]!.id).toBe(1)
      expect(result[2]!.id).toBe(3)
    })

    it('sorts with default key compare', () => {
      const arr = [5, 3, 1, 4, 2]
      const result = timsortBy(arr, x => x, undefined)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('handles negative keys', () => {
      const arr = [3, -1, 4, -2, 5]
      expect(timsortBy(arr, x => -x)).toEqual([5, 4, 3, -1, -2])
    })

    it('sorts large array by key', () => {
      const arr = Array.from({ length: 200 }, (_, i) => ({ v: 199 - i }))
      const result = timsortBy(arr, o => o.v)
      expect(result.map(o => o.v)).toEqual(range(0, 200))
    })

    it('sorts descending by key with reverse compare', () => {
      const arr = ['apple', 'cherry', 'banana']
      const result = timsortBy(arr, s => s.length, (a, b) => b - a)
      expect(result).toEqual(['cherry', 'banana', 'apple'])
    })
  })

  describe('isSorted', () => {
    it('returns true for empty array', () => {
      expect(isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      expect(isSorted([42])).toBe(true)
    })

    it('returns true for sorted array', () => {
      expect(isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      expect(isSorted([3, 1, 4, 1, 5])).toBe(false)
    })

    it('returns true for all same elements', () => {
      expect(isSorted([7, 7, 7, 7, 7])).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      expect(isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('works with custom compare', () => {
      expect(isSorted([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(true)
    })

    it('returns true for two sorted elements', () => {
      expect(isSorted([1, 2])).toBe(true)
    })

    it('returns false for two unsorted elements', () => {
      expect(isSorted([2, 1])).toBe(false)
    })

    it('returns true for nearly sorted with one duplicate', () => {
      expect(isSorted([1, 2, 2, 3, 4])).toBe(true)
    })

    it('returns true for large sorted array', () => {
      expect(isSorted(range(0, 1000))).toBe(true)
    })

    it('returns false for array with single inversion', () => {
      expect(isSorted([1, 2, 4, 3, 5])).toBe(false)
    })

    it('handles negative numbers', () => {
      expect(isSorted([-5, -3, -1, 0, 2])).toBe(true)
    })

    it('handles floats', () => {
      expect(isSorted([1.1, 2.2, 3.3])).toBe(true)
    })

    it('handles descending sorted with custom compare', () => {
      expect(isSorted([5, 3, 1], (a, b) => b - a)).toBe(true)
      expect(isSorted([1, 3, 5], (a, b) => b - a)).toBe(false)
    })
  })

  describe('isStable', () => {
    it('returns true for empty array', () => {
      expect(isStable([])).toBe(true)
    })

    it('returns true for single element', () => {
      expect(isStable([42])).toBe(true)
    })

    it('returns true for all unique elements', () => {
      expect(isStable([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns true for stable sort of objects with equal keys', () => {
      const arr = [{ k: 1, v: 'a' }, { k: 1, v: 'b' }, { k: 2, v: 'c' }]
      expect(isStable(arr, (a, b) => a.k - b.k)).toBe(true)
    })

    it('verifies stability with numeric duplicates', () => {
      expect(isStable([3, 1, 1, 2, 3])).toBe(true)
    })

    it('returns true for sorted array', () => {
      expect(isStable([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns true for reverse sorted array', () => {
      expect(isStable([5, 4, 3, 2, 1])).toBe(true)
    })

    it('returns true for all same elements', () => {
      expect(isStable([7, 7, 7, 7, 7])).toBe(true)
    })

    it('returns true for large array with duplicates', () => {
      const arr = Array.from({ length: 200 }, (_, i) => Math.floor(i / 2))
      expect(isStable(arr)).toBe(true)
    })

    it('handles two equal elements', () => {
      expect(isStable([5, 5])).toBe(true)
    })

    it('returns true for alternating equal values', () => {
      expect(isStable([1, 1, 2, 2, 3, 3])).toBe(true)
    })

    it('verifies stability for complex objects', () => {
      const arr = [
        { score: 90, name: 'alice' },
        { score: 85, name: 'bob' },
        { score: 90, name: 'charlie' },
      ]
      expect(isStable(arr, (a, b) => a.score - b.score)).toBe(true)
    })

    it('does not modify original array', () => {
      const arr = [3, 1, 4, 1, 5]
      const copy = [...arr]
      isStable(arr)
      expect(arr).toEqual(copy)
    })

    it('works with default compare (undefined)', () => {
      expect(isStable([1, 1, 2, 2], undefined)).toBe(true)
    })

    it('handles strings with stability', () => {
      expect(isStable(['a', 'b', 'a', 'c'])).toBe(true)
    })
  })

  describe('countRuns', () => {
    it('returns 0 for empty array', () => {
      expect(countRuns([])).toBe(0)
    })

    it('returns 1 for single element', () => {
      expect(countRuns([42])).toBe(1)
    })

    it('returns 1 for sorted array', () => {
      expect(countRuns([1, 2, 3, 4, 5])).toBe(1)
    })

    it('returns 1 for reverse sorted array', () => {
      expect(countRuns([5, 4, 3, 2, 1])).toBe(1)
    })

    it('returns correct count for alternating pattern', () => {
      expect(countRuns([1, 3, 2, 4, 3, 5])).toBe(3)
    })

    it('returns 1 for all same elements', () => {
      expect(countRuns([7, 7, 7, 7, 7])).toBe(1)
    })

    it('works with custom compare', () => {
      expect(countRuns([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(1)
    })

    it('handles two ascending elements (1 run)', () => {
      expect(countRuns([1, 2])).toBe(1)
    })

    it('handles two descending elements (1 run)', () => {
      expect(countRuns([2, 1])).toBe(1)
    })

    it('counts multiple runs correctly', () => {
      expect(countRuns([1, 2, 5, 4, 3, 6])).toBe(3)
    })

    it('does not modify the original array', () => {
      const arr = [3, 2, 1, 4, 5]
      const copy = [...arr]
      countRuns(arr)
      expect(arr).toEqual(copy)
    })

    it('handles ascending then descending', () => {
      expect(countRuns([1, 2, 3, 3, 2, 1])).toBe(2)
    })

    it('handles large sorted array (1 run)', () => {
      expect(countRuns(range(0, 100))).toBe(1)
    })

    it('handles run of equal elements followed by larger', () => {
      expect(countRuns([2, 2, 2, 3, 4])).toBe(1)
    })

    it('handles two equal elements', () => {
      expect(countRuns([5, 5])).toBe(1)
    })

    it('handles strictly increasing runs', () => {
      expect(countRuns([1, 2, 3, 1, 2, 3])).toBe(2)
    })
  })

  describe('integration', () => {
    it('timsort result is always sorted', () => {
      for (let size = 0; size < 100; size++) {
        const arr = shuffled(size)
        const sorted = timsort(arr)
        expect(isSorted(sorted)).toBe(true)
      }
    })

    it('timsortInPlace result is always sorted', () => {
      for (let size = 0; size < 50; size++) {
        const arr = shuffled(size)
        timsortInPlace(arr)
        expect(isSorted(arr)).toBe(true)
      }
    })

    it('timsortBy result is always sorted by key', () => {
      const arr = Array.from({ length: 50 }, (_, i) => ({ v: 49 - i }))
      const result = timsortBy(arr, o => o.v)
      expect(isSorted(result.map(o => o.v))).toBe(true)
    })

    it('sorts same result as Array.prototype.sort', () => {
      const arr = shuffled(200)
      const native = [...arr].sort((a, b) => a - b)
      expect(timsort(arr)).toEqual(native)
    })

    it('stability holds for random arrays with duplicates', () => {
      const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 10))
      expect(isStable(arr)).toBe(true)
    })

    it('countRuns of sorted array is 1', () => {
      expect(countRuns(timsort(shuffled(100)))).toBe(1)
    })

    it('countRuns of reverse sorted is 1', () => {
      const arr = range(0, 50).reverse()
      expect(countRuns(arr)).toBe(1)
    })

    it('timsort and timsortInPlace produce same result', () => {
      const arr1 = shuffled(100)
      const arr2 = [...arr1]
      const result1 = timsort(arr1)
      timsortInPlace(arr2)
      expect(result1).toEqual(arr2)
    })

    it('timsort and timsortBy produce same result for identity key', () => {
      const arr = shuffled(100)
      expect(timsort(arr)).toEqual(timsortBy(arr, x => x))
    })

    it('sorts correctly with many duplicates', () => {
      const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 5))
      const result = timsort(arr)
      expect(isSorted(result)).toBe(true)
    })

    it('sorts correctly for size 1 through 100', () => {
      for (let size = 1; size <= 100; size++) {
        const arr = shuffled(size)
        const result = timsort(arr)
        expect(result).toEqual(range(0, size))
      }
    })

    it('stability verified after sorting tagged objects', () => {
      const arr = Array.from({ length: 50 }, (_, i) => ({
        key: i % 5,
        originalIndex: i,
      }))
      const sorted = timsortBy(arr, o => o.key)
      const groups: number[][] = Array.from({ length: 5 }, () => [])
      for (const item of sorted) {
        groups[item.key]!.push(item.originalIndex)
      }
      for (const group of groups) {
        for (let i = 1; i < group.length; i++) {
          expect(group[i]!).toBeGreaterThan(group[i - 1]!)
        }
      }
    })

    it('handles worst case descending input', () => {
      const arr = range(0, 500).reverse()
      const result = timsort(arr)
      expect(result).toEqual(range(0, 500))
    })

    it('handles sawtooth pattern', () => {
      const arr: number[] = []
      for (let i = 0; i < 100; i++) {
        arr.push(i % 10)
      }
      const result = timsort(arr)
      expect(isSorted(result)).toBe(true)
    })

    it('handles organ-pipe pattern', () => {
      const arr = [...range(0, 50), ...range(0, 50).reverse()]
      const result = timsort(arr)
      expect(isSorted(result)).toBe(true)
    })

    it('timsortBy with descending compare produces reverse order', () => {
      const arr = range(0, 50)
      const result = timsortBy(arr, x => x, (a, b) => b - a)
      expect(result).toEqual(range(0, 50).reverse())
    })

    it('preserves stability for objects sorted by multiple passes', () => {
      const arr = Array.from({ length: 30 }, (_, i) => ({
        primary: Math.floor(i / 10),
        secondary: i % 10,
      }))
      const sorted = timsortBy(arr, o => o.primary)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i - 1]!.primary === sorted[i]!.primary) {
          expect(sorted[i - 1]!.secondary).toBeLessThan(sorted[i]!.secondary)
        }
      }
    })

    it('isSorted agrees with timsort', () => {
      const arr = shuffled(200)
      expect(isSorted(arr)).toBe(false)
      expect(isSorted(timsort(arr))).toBe(true)
    })

    it('countRuns decreases after sorting', () => {
      const arr = shuffled(100)
      const runsBefore = countRuns(arr)
      const sorted = timsort(arr)
      const runsAfter = countRuns(sorted)
      expect(runsAfter).toBe(1)
      expect(runsAfter).toBeLessThanOrEqual(runsBefore)
    })

    it('handles array with single element repeated many times', () => {
      const arr = Array.from({ length: 500 }, () => 42)
      expect(timsort(arr)).toEqual(arr)
      expect(countRuns(arr)).toBe(1)
      expect(isSorted(arr)).toBe(true)
    })

    it('handles alternating ascending and descending runs', () => {
      const arr = [1, 2, 3, 3, 2, 1, 4, 5, 6, 6, 5, 4]
      expect(countRuns(arr)).toBe(4)
      const sorted = timsort(arr)
      expect(sorted).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6])
    })

    it('isStable returns true for arrays with many groups', () => {
      const arr = Array.from({ length: 60 }, (_, i) => Math.floor(i / 3))
      expect(isStable(arr)).toBe(true)
    })

    it('timsort handles array of size 256', () => {
      const arr = shuffled(256)
      const result = timsort(arr)
      expect(result).toEqual(range(0, 256))
    })

    it('timsort handles array of size 1000 with many runs', () => {
      const arr: number[] = []
      for (let i = 0; i < 1000; i++) {
        arr.push(i % 3 === 0 ? 1000 - i : i)
      }
      const result = timsort(arr)
      expect(isSorted(result)).toBe(true)
      expect(result.length).toBe(1000)
    })

    it('timsortInPlace handles array of size 200', () => {
      const arr = shuffled(200)
      timsortInPlace(arr)
      expect(arr).toEqual(range(0, 200))
    })

    it('timsortBy handles array of size 100 with descending compare', () => {
      const arr = range(0, 100)
      const result = timsortBy(arr, x => x, (a, b) => b - a)
      expect(result).toEqual(range(0, 100).reverse())
    })

    it('isSorted detects unsorted array of size 2', () => {
      expect(isSorted([2, 1])).toBe(false)
    })

    it('countRuns handles strictly decreasing runs', () => {
      expect(countRuns([5, 4, 3, 2, 1])).toBe(1)
    })

    it('timsort correctly sorts boolean-equivalent values', () => {
      expect(timsort([1, 0, 1, 0, 1, 0])).toEqual([0, 0, 0, 1, 1, 1])
    })

    it('timsortBy stability with large duplicate groups', () => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        key: i % 10,
        order: Math.floor(i / 10),
      }))
      const result = timsortBy(arr, o => o.key)
      for (let key = 0; key < 10; key++) {
        const group = result.filter(o => o.key === key)
        for (let i = 1; i < group.length; i++) {
          expect(group[i]!.order).toBeGreaterThan(group[i - 1]!.order)
        }
      }
    })

    it('timsort handles edge case size 3', () => {
      expect(timsort([3, 1, 2])).toEqual([1, 2, 3])
      expect(timsort([1, 3, 2])).toEqual([1, 2, 3])
      expect(timsort([2, 1, 3])).toEqual([1, 2, 3])
    })

    it('isStable with custom compare on large array', () => {
      const arr = Array.from({ length: 200 }, (_, i) => i % 7)
      expect(isStable(arr)).toBe(true)
    })

    it('countRuns with single element runs', () => {
      expect(countRuns([5, 1, 4, 2, 3])).toBe(3)
    })
  })
})
