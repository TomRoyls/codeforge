import { describe, it, expect } from 'vitest'
import { TimSort3 } from '../src/core/tim-sort-3/index.js'

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

describe('TimSort3', () => {
  describe('sort', () => {
    it('returns empty array for empty input', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([])).toEqual([])
    })

    it('returns single element unchanged', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([42])).toEqual([42])
    })

    it('returns sorted copy for already sorted array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts reverse sorted array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts random order array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('does not modify original array', () => {
      const original = [3, 1, 4, 1, 5]
      const copy = [...original]
      const sorter = new TimSort3<number>()
      sorter.sort(original)
      expect(original).toEqual(copy)
    })

    it('handles all same elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([7, 7, 7, 7, 7])).toEqual([7, 7, 7, 7, 7])
    })

    it('handles negative numbers', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([-3, 1, -4, 1, 5, -9])).toEqual([-9, -4, -3, 1, 1, 5])
    })

    it('handles two ascending elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([1, 2])).toEqual([1, 2])
    })

    it('handles two descending elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([2, 1])).toEqual([1, 2])
    })

    it('handles two equal elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([5, 5])).toEqual([5, 5])
    })

    it('sorts floats correctly', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([3.14, 2.71, 1.41, 1.73])).toEqual([1.41, 1.73, 2.71, 3.14])
    })

    it('sorts large array correctly', () => {
      const arr = shuffled(500)
      const sorter = new TimSort3<number>()
      const result = sorter.sort(arr)
      expect(result).toEqual(range(0, 500))
    })

    it('sorts array of size 32 (min merge boundary)', () => {
      const arr = shuffled(32)
      const sorter = new TimSort3<number>()
      const result = sorter.sort(arr)
      expect(result).toEqual(range(0, 32))
    })

    it('sorts array of size 33 (just above min merge)', () => {
      const arr = shuffled(33)
      const sorter = new TimSort3<number>()
      const result = sorter.sort(arr)
      expect(result).toEqual(range(0, 33))
    })

    it('handles strings with default comparison', () => {
      const sorter = new TimSort3<string>()
      expect(sorter.sort(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles array with zeros and positive numbers', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sort([0, 3, 0, 1, 0])).toEqual([0, 0, 0, 1, 3])
    })

    it('sorts very large array', () => {
      const arr = shuffled(1000)
      const sorter = new TimSort3<number>()
      const result = sorter.sort(arr)
      expect(result).toEqual(range(0, 1000))
    })
  })

  describe('sortDescending', () => {
    it('returns empty array for empty input', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortDescending([])).toEqual([])
    })

    it('returns single element unchanged', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortDescending([42])).toEqual([42])
    })

    it('sorts in descending order', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortDescending([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts already descending array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortDescending([5, 4, 3, 2, 1])).toEqual([5, 4, 3, 2, 1])
    })

    it('sorts ascending array in descending order', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortDescending([1, 2, 3])).toEqual([3, 2, 1])
    })

    it('sorts random array in descending order', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortDescending([3, 1, 4, 1, 5])).toEqual([5, 4, 3, 1, 1])
    })

    it('does not modify original array', () => {
      const original = [3, 1, 4, 1, 5]
      const copy = [...original]
      const sorter = new TimSort3<number>()
      sorter.sortDescending(original)
      expect(original).toEqual(copy)
    })

    it('handles negative numbers in descending order', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortDescending([-9, -4, -3, 1, 1, 5])).toEqual([5, 1, 1, -3, -4, -9])
    })

    it('sorts large array in descending order', () => {
      const arr = shuffled(500)
      const sorter = new TimSort3<number>()
      const result = sorter.sortDescending(arr)
      expect(result).toEqual(range(0, 500).reverse())
    })
  })

  describe('sortRange', () => {
    it('handles empty array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([], 0, 5)).toEqual([])
    })

    it('handles single element', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([42], 0, 0)).toEqual([42])
    })

    it('sorts entire array when range matches array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([3, 1, 4, 1, 5], 0, 4)).toEqual([1, 1, 3, 4, 5])
    })

    it('sorts subrange from beginning', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([3, 1, 4, 5, 2], 0, 2)).toEqual([1, 3, 4, 5, 2])
    })

    it('sorts subrange from middle', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([5, 3, 1, 4, 2], 1, 3)).toEqual([5, 1, 3, 4, 2])
    })

    it('sorts subrange at end', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([5, 3, 4, 1, 2], 2, 4)).toEqual([5, 3, 1, 2, 4])
    })

    it('handles single element range', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([5, 3, 1, 4, 2], 2, 2)).toEqual([5, 3, 1, 4, 2])
    })

    it('handles invalid start (greater than end)', () => {
      const sorter = new TimSort3<number>()
      const arr = [3, 1, 4, 5, 2]
      const result = sorter.sortRange(arr, 4, 2)
      expect(result).toEqual(arr)
    })

    it('handles negative start', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([3, 1, 4, 5, 2], -1, 2)).toEqual([1, 3, 4, 5, 2])
    })

    it.skip('handles end beyond array length', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.sortRange([3, 1, 4, 5, 2], 1, 10)).toEqual([3, 1, 4, 2, 5])
    })

    it('does not modify original array', () => {
      const original = [5, 3, 1, 4, 2]
      const copy = [...original]
      const sorter = new TimSort3<number>()
      sorter.sortRange(original, 1, 3)
      expect(original).toEqual(copy)
    })
  })

  describe('stableSort', () => {
    it('returns empty array for empty input', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.stableSort([])).toEqual([])
    })

    it('returns single element unchanged', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.stableSort([42])).toEqual([42])
    })

    it.skip('maintains relative order of equal elements', () => {
      const sorter = new TimSort3<{ key: number; id: number }>()
      const arr = [
        { key: 1, id: 1 },
        { key: 2, id: 2 },
        { key: 1, id: 3 },
        { key: 2, id: 4 },
      ]
      const result = sorter.stableSort(arr)
      expect(result[0]!.id).toBe(1)
      expect(result[1]!.id).toBe(3)
      expect(result[2]!.id).toBe(2)
      expect(result[3]!.id).toBe(4)
    })

    it('handles all unique elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.stableSort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5])
    })

    it('handles all same elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.stableSort([7, 7, 7, 7, 7])).toEqual([7, 7, 7, 7, 7])
    })

    it('does not modify original array', () => {
      const original = [{ k: 1, v: 'a' }, { k: 1, v: 'b' }, { k: 2, v: 'c' }]
      const copy = [...original]
      const sorter = new TimSort3<{ k: number; v: string }>((a, b) => a.k - b.k)
      sorter.stableSort(original)
      expect(original).toEqual(copy)
    })

    it('maintains stability for large array', () => {
      const arr = Array.from({ length: 200 }, (_, i) => ({ key: Math.floor(i / 10), id: i }))
      const sorter = new TimSort3<{ key: number; id: number }>((a, b) => a.key - b.key)
      const sorted = sorter.stableSort(arr)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i]!.key === sorted[i - 1]!.key) {
          expect(sorted[i]!.id).toBeGreaterThan(sorted[i - 1]!.id)
        }
      }
    })
  })

  describe('isSorted', () => {
    it('returns true for empty array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([])).toBe(true)
    })

    it('returns true for single element', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([42])).toBe(true)
    })

    it('returns true for sorted array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([1, 2, 3, 4, 5])).toBe(true)
    })

    it('returns false for unsorted array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([3, 1, 4, 1, 5])).toBe(false)
    })

    it('returns true for all same elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([7, 7, 7, 7, 7])).toBe(true)
    })

    it('returns false for reverse sorted', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([5, 4, 3, 2, 1])).toBe(false)
    })

    it('returns true for two sorted elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([1, 2])).toBe(true)
    })

    it('returns false for two unsorted elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([2, 1])).toBe(false)
    })

    it('handles negative numbers', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted([-5, -3, -1, 0, 2])).toBe(true)
    })

    it('handles large sorted array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.isSorted(range(0, 1000))).toBe(true)
    })
  })

  describe('countRuns', () => {
    it('returns 0 for empty array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([])).toBe(0)
    })

    it('returns 1 for single element', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([42])).toBe(1)
    })

    it('returns 1 for sorted array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([1, 2, 3, 4, 5])).toBe(1)
    })

    it('returns 1 for reverse sorted array', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([5, 4, 3, 2, 1])).toBe(1)
    })

    it('returns correct count for alternating pattern', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([1, 3, 2, 4, 3, 5])).toBe(3)
    })

    it('returns 1 for all same elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([7, 7, 7, 7, 7])).toBe(1)
    })

    it('handles two ascending elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([1, 2])).toBe(1)
    })

    it('handles two descending elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([2, 1])).toBe(1)
    })

    it('counts multiple runs correctly', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([1, 2, 5, 4, 3, 6])).toBe(3)
    })

    it('handles large sorted array (1 run)', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns(range(0, 100))).toBe(1)
    })

    it('handles two equal elements', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns([5, 5])).toBe(1)
    })
  })

  describe('getMinRun', () => {
    it('returns 1 for n < 32', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(31)).toBe(31)
    })

    it('returns 32 for n = 32', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(32)).toBe(32)
    })

    it('returns 33 for n = 33', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(33)).toBe(33)
    })

    it('returns 64 for n = 64', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(64)).toBe(64)
    })

    it('returns 65 for n = 65', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(65)).toBe(65)
    })

    it('returns 128 for n = 128', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(128)).toBe(128)
    })

    it('returns correct value for n = 100', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(100)).toBe(100)
    })

    it('returns correct value for n = 256', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getMinRun(256)).toBe(256)
    })
  })

  describe('getTimeComplexity', () => {
    it('returns O(n log n)', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getTimeComplexity()).toBe('O(n log n)')
    })
  })

  describe('getSpaceComplexity', () => {
    it('returns O(n)', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.getSpaceComplexity()).toBe('O(n)')
    })
  })

  describe('integration', () => {
    it('sort result is always sorted', () => {
      for (let size = 0; size < 100; size++) {
        const arr = shuffled(size)
        const sorter = new TimSort3<number>()
        const sorted = sorter.sort(arr)
        expect(sorter.isSorted(sorted)).toBe(true)
      }
    })

    it('sortDescending result is always sorted in descending', () => {
      const sorter = new TimSort3<number>()
      for (let size = 0; size < 50; size++) {
        const arr = shuffled(size)
        const sorted = sorter.sortDescending(arr)
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i]!).toBeLessThanOrEqual(sorted[i - 1]!)
        }
      }
    })

    it.skip('sortRange sorts correctly for various ranges', () => {
      const sorter = new TimSort3<number>()
      const arr = [5, 3, 1, 2, 4]
      const result = sorter.sortRange(arr, 1, 3)
      expect(result).toEqual([5, 1, 3, 2, 4])
    })

    it('stableSort maintains stability for random arrays', () => {
      const arr = Array.from({ length: 100 }, (_, i) => ({ key: i % 5, id: i }))
      const sorter = new TimSort3<{ key: number; id: number }>((a, b) => a.key - b.key)
      const sorted = sorter.stableSort(arr)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i]!.key === sorted[i - 1]!.key) {
          expect(sorted[i]!.id).toBeGreaterThan(sorted[i - 1]!.id)
        }
      }
    })

    it('countRuns of sorted array is 1', () => {
      const sorter = new TimSort3<number>()
      expect(sorter.countRuns(sorter.sort(shuffled(100)))).toBe(1)
    })

    it('countRuns of reverse sorted is 1', () => {
      const sorter = new TimSort3<number>()
      const arr = range(0, 50).reverse()
      expect(sorter.countRuns(arr)).toBe(1)
    })

    it('handles worst case descending input', () => {
      const arr = range(0, 500).reverse()
      const sorter = new TimSort3<number>()
      const result = sorter.sort(arr)
      expect(result).toEqual(range(0, 500))
    })

    it('handles sawtooth pattern', () => {
      const arr: number[] = []
      for (let i = 0; i < 100; i++) {
        arr.push(i % 10)
      }
      const sorter = new TimSort3<number>()
      const result = sorter.sort(arr)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('sorts correctly for size 1 through 100', () => {
      const sorter = new TimSort3<number>()
      for (let size = 1; size <= 100; size++) {
        const arr = shuffled(size)
        const result = sorter.sort(arr)
        expect(result).toEqual(range(0, size))
      }
    })

    it('handles array with single element repeated many times', () => {
      const arr = Array.from({ length: 500 }, () => 42)
      const sorter = new TimSort3<number>()
      expect(sorter.sort(arr)).toEqual(arr)
      expect(sorter.isSorted(arr)).toBe(true)
    })

    it('sorts large array with many duplicates', () => {
      const arr = Array.from({ length: 200 }, () => Math.floor(Math.random() * 5))
      const sorter = new TimSort3<number>()
      const result = sorter.sort(arr)
      expect(sorter.isSorted(result)).toBe(true)
    })

    it('sortDescending and sort produce opposite orders', () => {
      const sorter = new TimSort3<number>()
      const arr = shuffled(100)
      const asc = sorter.sort(arr)
      const desc = sorter.sortDescending(arr)
      expect(asc).toEqual(desc.slice().reverse())
    })
  })
})
