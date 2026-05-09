import { describe, it, expect } from 'vitest'
import { FractionalCascading } from '../../src/core/fractional-cascading/fractional-cascading.js'
import { DEFAULT_FRACTIONAL_CASCADING_OPTIONS } from '../../src/core/fractional-cascading/types.js'
import type { FractionalCascadingOptions, FractionalCascadingStats } from '../../src/core/fractional-cascading/types.js'

describe('FractionalCascading', () => {
  describe('constructor', () => {
    it('should create instance with empty array of arrays', () => {
      const fc = new FractionalCascading([])
      expect(fc.arrayCount).toBe(0)
      expect(fc.totalCount).toBe(0)
    })

    it('should create instance with single array', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.arrayCount).toBe(1)
      expect(fc.totalCount).toBe(3)
    })

    it('should create instance with multiple arrays', () => {
      const fc = new FractionalCascading([[1, 3, 5], [2, 4, 6], [0, 7, 8]])
      expect(fc.arrayCount).toBe(3)
      expect(fc.totalCount).toBe(9)
    })

    it('should sort unsorted arrays by default', () => {
      const fc = new FractionalCascading([[5, 1, 3]])
      expect(fc.getArray(0)).toEqual([1, 3, 5])
    })

    it('should not sort when sorted option is true', () => {
      const fc = new FractionalCascading([[5, 1, 3]], { sorted: true })
      expect(fc.getArray(0)).toEqual([5, 1, 3])
    })

    it('should handle empty arrays within the collection', () => {
      const fc = new FractionalCascading([[], [1, 2], []])
      expect(fc.arrayCount).toBe(3)
      expect(fc.totalCount).toBe(2)
    })

    it('should handle all empty arrays', () => {
      const fc = new FractionalCascading([[], [], []])
      expect(fc.arrayCount).toBe(3)
      expect(fc.totalCount).toBe(0)
    })

    it('should use default options when none provided', () => {
      expect(DEFAULT_FRACTIONAL_CASCADING_OPTIONS.sorted).toBe(false)
    })

    it('should accept partial options', () => {
      const fc = new FractionalCascading([[1, 2]], {})
      expect(fc.arrayCount).toBe(1)
    })
  })

  describe('query', () => {
    it('should return empty array for empty input', () => {
      const fc = new FractionalCascading([])
      expect(fc.query(5)).toEqual([])
    })

    it('should return [0] when value is less than all elements', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.query(0)).toEqual([0])
    })

    it('should return [3] when value equals max element', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.query(5)).toEqual([3])
    })

    it('should return [3] when value exceeds all elements', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.query(10)).toEqual([3])
    })

    it('should return correct count for value between elements', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.query(4)).toEqual([2])
    })

    it('should return correct count for value matching element', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.query(3)).toEqual([2])
    })

    it('should return counts across multiple arrays', () => {
      const fc = new FractionalCascading([[1, 3, 5], [2, 4, 6], [0, 7, 8]])
      const result = fc.query(5)
      expect(result).toEqual([3, 2, 1])
    })

    it('should return all zeros for very small value across arrays', () => {
      const fc = new FractionalCascading([[1, 3, 5], [2, 4, 6]])
      expect(fc.query(-10)).toEqual([0, 0])
    })

    it('should return all total counts for very large value', () => {
      const fc = new FractionalCascading([[1, 3, 5], [2, 4, 6]])
      expect(fc.query(100)).toEqual([3, 3])
    })

    it('should handle single element arrays', () => {
      const fc = new FractionalCascading([[5], [3], [7]])
      expect(fc.query(5)).toEqual([1, 1, 0])
    })

    it('should handle arrays with duplicates within same array', () => {
      const fc = new FractionalCascading([[1, 1, 1, 3, 3]])
      expect(fc.query(1)).toEqual([3])
      expect(fc.query(3)).toEqual([5])
    })

    it('should handle negative numbers', () => {
      const fc = new FractionalCascading([[-5, -3, -1, 0, 2]])
      expect(fc.query(-3)).toEqual([2])
      expect(fc.query(0)).toEqual([4])
      expect(fc.query(-10)).toEqual([0])
    })

    it('should handle negative numbers across multiple arrays', () => {
      const fc = new FractionalCascading([[-5, 0, 5], [-3, 3]])
      expect(fc.query(0)).toEqual([2, 1])
      expect(fc.query(-4)).toEqual([1, 0])
    })

    it('should handle arrays of different sizes', () => {
      const fc = new FractionalCascading([[1, 2, 3, 4, 5], [10, 20], [100]])
      expect(fc.query(5)).toEqual([5, 0, 0])
      expect(fc.query(20)).toEqual([5, 2, 0])
      expect(fc.query(100)).toEqual([5, 2, 1])
    })

    it('should handle empty arrays mixed with non-empty', () => {
      const fc = new FractionalCascading([[], [1, 2, 3], []])
      expect(fc.query(2)).toEqual([0, 2, 0])
    })

    it('should handle value at boundary of each array', () => {
      const fc = new FractionalCascading([[1, 5], [3, 7], [2, 9]])
      expect(fc.query(1)).toEqual([1, 0, 0])
      expect(fc.query(5)).toEqual([2, 1, 1])
      expect(fc.query(9)).toEqual([2, 2, 2])
    })

    it('should handle unsorted input arrays', () => {
      const fc = new FractionalCascading([[5, 1, 3], [6, 2, 4]])
      expect(fc.query(3)).toEqual([2, 1])
    })

    it('should handle large arrays', () => {
      const arr1 = Array.from({ length: 100 }, (_, i) => i + 1)
      const arr2 = Array.from({ length: 100 }, (_, i) => i + 50)
      const fc = new FractionalCascading([arr1, arr2])
      expect(fc.query(100)).toEqual([100, 51])
      expect(fc.query(50)).toEqual([50, 1])
    })

    it('should handle floating point values', () => {
      const fc = new FractionalCascading([[1.1, 2.2, 3.3]])
      expect(fc.query(2.2)).toEqual([2])
      expect(fc.query(2.5)).toEqual([2])
    })

    it('should return array length matching arrayCount', () => {
      const fc = new FractionalCascading([[1], [2], [3], [4]])
      expect(fc.query(5).length).toBe(4)
    })
  })

  describe('queryIndex', () => {
    it('should return empty array for empty input', () => {
      const fc = new FractionalCascading([])
      expect(fc.queryIndex(5)).toEqual([])
    })

    it('should return insertion index 0 when value is less than all', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.queryIndex(0)).toEqual([0])
    })

    it('should return array length when value exceeds all', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.queryIndex(10)).toEqual([3])
    })

    it('should return correct insertion index for matching value', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.queryIndex(3)).toEqual([2])
    })

    it('should return correct insertion index for value between elements', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      expect(fc.queryIndex(4)).toEqual([2])
    })

    it('should return insertion indices across multiple arrays', () => {
      const fc = new FractionalCascading([[1, 3, 5], [2, 4, 6]])
      expect(fc.queryIndex(3)).toEqual([2, 1])
    })

    it('should handle single element arrays', () => {
      const fc = new FractionalCascading([[5], [3], [7]])
      expect(fc.queryIndex(5)).toEqual([1, 1, 0])
    })

    it('should handle empty arrays within collection', () => {
      const fc = new FractionalCascading([[], [1, 2, 3], []])
      expect(fc.queryIndex(2)).toEqual([0, 2, 0])
    })

    it('should handle negative numbers', () => {
      const fc = new FractionalCascading([[-5, -3, -1]])
      expect(fc.queryIndex(-4)).toEqual([1])
      expect(fc.queryIndex(-3)).toEqual([2])
    })

    it('should handle arrays of different sizes', () => {
      const fc = new FractionalCascading([[1, 2, 3, 4, 5], [10, 20], [100]])
      expect(fc.queryIndex(5)).toEqual([5, 0, 0])
      expect(fc.queryIndex(15)).toEqual([5, 1, 0])
    })

    it('should handle duplicates', () => {
      const fc = new FractionalCascading([[1, 1, 1, 3, 3]])
      expect(fc.queryIndex(1)).toEqual([3])
      expect(fc.queryIndex(3)).toEqual([5])
    })

    it('should handle floating point values', () => {
      const fc = new FractionalCascading([[1.5, 2.5, 3.5]])
      expect(fc.queryIndex(2.5)).toEqual([2])
    })

    it('should return array length matching arrayCount', () => {
      const fc = new FractionalCascading([[1], [2], [3], [4], [5]])
      expect(fc.queryIndex(10).length).toBe(5)
    })

    it('should give indices that match query counts', () => {
      const fc = new FractionalCascading([[1, 3, 5, 7], [2, 4, 6]])
      const counts = fc.query(4)
      const indices = fc.queryIndex(4)
      expect(counts).toEqual(indices)
    })

    it('should give indices that match query counts across edge cases', () => {
      const fc = new FractionalCascading([[1, 5, 9], [2, 6], [3]])
      const counts = fc.query(5)
      const indices = fc.queryIndex(5)
      expect(counts).toEqual(indices)
    })
  })

  describe('getArray', () => {
    it('should return a copy of the original array', () => {
      const fc = new FractionalCascading([[1, 3, 5]])
      const arr = fc.getArray(0)
      expect(arr).toEqual([1, 3, 5])
      arr[0] = 999
      expect(fc.getArray(0)).toEqual([1, 3, 5])
    })

    it('should return sorted array when input was unsorted', () => {
      const fc = new FractionalCascading([[5, 1, 3]])
      expect(fc.getArray(0)).toEqual([1, 3, 5])
    })

    it('should return array at correct index', () => {
      const fc = new FractionalCascading([[1, 2], [3, 4], [5, 6]])
      expect(fc.getArray(0)).toEqual([1, 2])
      expect(fc.getArray(1)).toEqual([3, 4])
      expect(fc.getArray(2)).toEqual([5, 6])
    })

    it('should return empty array for empty sub-array', () => {
      const fc = new FractionalCascading([[], [1, 2]])
      expect(fc.getArray(0)).toEqual([])
    })

    it('should throw for negative index', () => {
      const fc = new FractionalCascading([[1, 2]])
      expect(() => fc.getArray(-1)).toThrow(RangeError)
    })

    it('should throw for index >= arrayCount', () => {
      const fc = new FractionalCascading([[1, 2]])
      expect(() => fc.getArray(1)).toThrow(RangeError)
    })

    it('should throw for empty FractionalCascading', () => {
      const fc = new FractionalCascading([])
      expect(() => fc.getArray(0)).toThrow(RangeError)
    })

    it('should return single element array', () => {
      const fc = new FractionalCascading([[42]])
      expect(fc.getArray(0)).toEqual([42])
    })
  })

  describe('arrayCount', () => {
    it('should return 0 for empty input', () => {
      const fc = new FractionalCascading([])
      expect(fc.arrayCount).toBe(0)
    })

    it('should return 1 for single array', () => {
      const fc = new FractionalCascading([[1, 2]])
      expect(fc.arrayCount).toBe(1)
    })

    it('should return correct count for multiple arrays', () => {
      const fc = new FractionalCascading([[1], [2], [3], [4], [5]])
      expect(fc.arrayCount).toBe(5)
    })

    it('should update after rebuild', () => {
      const fc = new FractionalCascading([[1, 2]])
      expect(fc.arrayCount).toBe(1)
      fc.rebuild([[1], [2], [3]])
      expect(fc.arrayCount).toBe(3)
    })
  })

  describe('totalCount', () => {
    it('should return 0 for empty input', () => {
      const fc = new FractionalCascading([])
      expect(fc.totalCount).toBe(0)
    })

    it('should return array length for single array', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(fc.totalCount).toBe(3)
    })

    it('should sum lengths of all arrays', () => {
      const fc = new FractionalCascading([[1, 2], [3, 4, 5], [6]])
      expect(fc.totalCount).toBe(6)
    })

    it('should handle empty sub-arrays', () => {
      const fc = new FractionalCascading([[], [1, 2], []])
      expect(fc.totalCount).toBe(2)
    })

    it('should update after rebuild', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(fc.totalCount).toBe(3)
      fc.rebuild([[1], [2, 3, 4, 5]])
      expect(fc.totalCount).toBe(5)
    })
  })

  describe('rebuild', () => {
    it('should rebuild with new arrays', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      fc.rebuild([[10, 20, 30], [40, 50]])
      expect(fc.arrayCount).toBe(2)
      expect(fc.totalCount).toBe(5)
    })

    it('should rebuild with empty arrays', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      fc.rebuild([])
      expect(fc.arrayCount).toBe(0)
      expect(fc.totalCount).toBe(0)
    })

    it('should allow queries after rebuild', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(fc.query(2)).toEqual([2])
      fc.rebuild([[10, 20, 30], [5, 15, 25]])
      expect(fc.query(20)).toEqual([2, 2])
    })

    it('should rebuild with sorted option', () => {
      const fc = new FractionalCascading([[1, 2]])
      fc.rebuild([[5, 1, 3]], { sorted: true })
      expect(fc.getArray(0)).toEqual([5, 1, 3])
    })

    it('should rebuild without options using defaults', () => {
      const fc = new FractionalCascading([[1, 2]])
      fc.rebuild([[5, 1, 3]])
      expect(fc.getArray(0)).toEqual([1, 3, 5])
    })

    it('should return void', () => {
      const fc = new FractionalCascading([[1]])
      expect(fc.rebuild([[2]])).toBeUndefined()
    })

    it('should handle multiple rebuilds', () => {
      const fc = new FractionalCascading([[1]])
      fc.rebuild([[1, 2], [3, 4]])
      expect(fc.arrayCount).toBe(2)
      fc.rebuild([[10]])
      expect(fc.arrayCount).toBe(1)
      fc.rebuild([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
      expect(fc.arrayCount).toBe(3)
      expect(fc.totalCount).toBe(9)
    })

    it('should replace previous data completely', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      fc.rebuild([[100, 200]])
      expect(fc.getArray(0)).toEqual([100, 200])
      expect(fc.query(150)).toEqual([1])
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty input', () => {
      const fc = new FractionalCascading([])
      const stats = fc.getStats()
      expect(stats.arrayCount).toBe(0)
      expect(stats.totalCount).toBe(0)
      expect(stats.memoryUsage).toBe(0)
    })

    it('should return correct stats for single array', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      const stats = fc.getStats()
      expect(stats.arrayCount).toBe(1)
      expect(stats.totalCount).toBe(3)
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })

    it('should return correct stats for multiple arrays', () => {
      const fc = new FractionalCascading([[1, 2], [3, 4, 5]])
      const stats = fc.getStats()
      expect(stats.arrayCount).toBe(2)
      expect(stats.totalCount).toBe(5)
    })

    it('should return FractionalCascadingStats type', () => {
      const fc = new FractionalCascading([[1]])
      const stats: FractionalCascadingStats = fc.getStats()
      expect(typeof stats.arrayCount).toBe('number')
      expect(typeof stats.totalCount).toBe('number')
      expect(typeof stats.memoryUsage).toBe('number')
    })

    it('should update stats after rebuild', () => {
      const fc = new FractionalCascading([[1, 2]])
      expect(fc.getStats().totalCount).toBe(2)
      fc.rebuild([[1, 2, 3, 4, 5]])
      expect(fc.getStats().totalCount).toBe(5)
    })

    it('should account for augmented array memory', () => {
      const fc1 = new FractionalCascading([[1]])
      const fc2 = new FractionalCascading([[1], [2], [3]])
      expect(fc2.getStats().memoryUsage).toBeGreaterThan(fc1.getStats().memoryUsage)
    })
  })

  describe('edge cases', () => {
    it('should handle single array with single element', () => {
      const fc = new FractionalCascading([[42]])
      expect(fc.query(42)).toEqual([1])
      expect(fc.query(41)).toEqual([0])
      expect(fc.query(43)).toEqual([1])
    })

    it('should handle single empty array', () => {
      const fc = new FractionalCascading([[]])
      expect(fc.arrayCount).toBe(1)
      expect(fc.totalCount).toBe(0)
      expect(fc.query(5)).toEqual([0])
      expect(fc.queryIndex(5)).toEqual([0])
    })

    it('should handle array with all same values', () => {
      const fc = new FractionalCascading([[3, 3, 3, 3]])
      expect(fc.query(2)).toEqual([0])
      expect(fc.query(3)).toEqual([4])
      expect(fc.query(4)).toEqual([4])
    })

    it('should handle arrays with all same values across multiple', () => {
      const fc = new FractionalCascading([[1, 1, 1], [2, 2, 2]])
      expect(fc.query(1)).toEqual([3, 0])
      expect(fc.query(2)).toEqual([3, 3])
    })

    it('should handle MAX_SAFE_INTEGER', () => {
      const fc = new FractionalCascading([[Number.MAX_SAFE_INTEGER]])
      expect(fc.query(Number.MAX_SAFE_INTEGER)).toEqual([1])
      expect(fc.query(Number.MAX_SAFE_INTEGER - 1)).toEqual([0])
    })

    it('should handle MIN_SAFE_INTEGER', () => {
      const fc = new FractionalCascading([[Number.MIN_SAFE_INTEGER]])
      expect(fc.query(Number.MIN_SAFE_INTEGER)).toEqual([1])
      expect(fc.query(Number.MIN_SAFE_INTEGER + 1)).toEqual([1])
    })

    it('should handle zero as a query value', () => {
      const fc = new FractionalCascading([[-1, 0, 1]])
      expect(fc.query(0)).toEqual([2])
    })

    it('should handle zero in arrays', () => {
      const fc = new FractionalCascading([[0, 0, 0]])
      expect(fc.query(0)).toEqual([3])
      expect(fc.query(-1)).toEqual([0])
    })

    it('should handle very large number of arrays', () => {
      const arrays = Array.from({ length: 50 }, (_, i) => [i, i + 50])
      const fc = new FractionalCascading(arrays)
      expect(fc.arrayCount).toBe(50)
      expect(fc.query(49).length).toBe(50)
    })

    it('should handle large array sizes', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i + 1)
      const fc = new FractionalCascading([arr])
      expect(fc.query(500)).toEqual([500])
      expect(fc.query(1000)).toEqual([1000])
      expect(fc.query(1)).toEqual([1])
    })

    it('should handle arrays with overlapping ranges', () => {
      const fc = new FractionalCascading([[1, 5, 10], [3, 7, 12], [2, 8, 15]])
      expect(fc.query(5)).toEqual([2, 1, 1])
      expect(fc.query(10)).toEqual([3, 2, 2])
    })

    it('should handle arrays with non-overlapping ranges', () => {
      const fc = new FractionalCascading([[1, 2, 3], [10, 20, 30], [100, 200, 300]])
      expect(fc.query(5)).toEqual([3, 0, 0])
      expect(fc.query(25)).toEqual([3, 2, 0])
    })

    it('should handle descending sorted input with sorted: true', () => {
      const fc = new FractionalCascading([[5, 3, 1]], { sorted: true })
      expect(fc.getArray(0)).toEqual([5, 3, 1])
    })

    it('should handle sorted input correctly with sorted: true', () => {
      const fc = new FractionalCascading([[1, 3, 5]], { sorted: true })
      expect(fc.query(3)).toEqual([2])
    })

    it('should handle single array of length 2', () => {
      const fc = new FractionalCascading([[1, 2]])
      expect(fc.query(1)).toEqual([1])
      expect(fc.query(2)).toEqual([2])
    })

    it('should handle query on empty sub-arrays', () => {
      const fc = new FractionalCascading([[], [], []])
      expect(fc.query(5)).toEqual([0, 0, 0])
    })

    it('should handle queryIndex on empty sub-arrays', () => {
      const fc = new FractionalCascading([[], [], []])
      expect(fc.queryIndex(5)).toEqual([0, 0, 0])
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_FRACTIONAL_CASCADING_OPTIONS', () => {
      expect(DEFAULT_FRACTIONAL_CASCADING_OPTIONS.sorted).toBe(false)
    })

    it('should support FractionalCascadingOptions interface', () => {
      const opts: FractionalCascadingOptions = { sorted: true }
      expect(opts.sorted).toBe(true)
    })

    it('should support FractionalCascadingStats interface', () => {
      const stats: FractionalCascadingStats = {
        arrayCount: 1,
        totalCount: 5,
        memoryUsage: 10,
      }
      expect(stats.arrayCount).toBe(1)
      expect(stats.totalCount).toBe(5)
      expect(stats.memoryUsage).toBe(10)
    })
  })

  describe('query consistency', () => {
    it('query and queryIndex should agree for basic case', () => {
      const fc = new FractionalCascading([[1, 3, 5, 7, 9], [2, 4, 6, 8, 10]])
      for (let v = 0; v <= 11; v++) {
        expect(fc.query(v)).toEqual(fc.queryIndex(v))
      }
    })

    it('query and queryIndex should agree for negative values', () => {
      const fc = new FractionalCascading([[-5, -3, -1, 1, 3]])
      for (let v = -6; v <= 4; v++) {
        expect(fc.query(v)).toEqual(fc.queryIndex(v))
      }
    })

    it('query and queryIndex should agree for single array', () => {
      const fc = new FractionalCascading([[10, 20, 30]])
      expect(fc.query(15)).toEqual(fc.queryIndex(15))
      expect(fc.query(10)).toEqual(fc.queryIndex(10))
      expect(fc.query(30)).toEqual(fc.queryIndex(30))
    })

    it('query and queryIndex should agree with empty sub-arrays', () => {
      const fc = new FractionalCascading([[], [1, 2, 3], []])
      expect(fc.query(2)).toEqual(fc.queryIndex(2))
    })

    it('query should be consistent across multiple calls', () => {
      const fc = new FractionalCascading([[1, 2, 3], [4, 5, 6]])
      const r1 = fc.query(3)
      const r2 = fc.query(3)
      expect(r1).toEqual(r2)
    })

    it('queryIndex should be consistent across multiple calls', () => {
      const fc = new FractionalCascading([[1, 2, 3], [4, 5, 6]])
      const r1 = fc.queryIndex(3)
      const r2 = fc.queryIndex(3)
      expect(r1).toEqual(r2)
    })
  })

  describe('immutability', () => {
    it('getArray should return a copy', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      const arr1 = fc.getArray(0)
      arr1[0] = 999
      const arr2 = fc.getArray(0)
      expect(arr2[0]).toBe(1)
    })

    it('query results should not affect internal state', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      fc.query(2)
      expect(fc.getArray(0)).toEqual([1, 2, 3])
      expect(fc.totalCount).toBe(3)
    })

    it('modifying input arrays after construction should not affect instance', () => {
      const input = [3, 1, 2]
      const fc = new FractionalCascading([input])
      input.push(4)
      expect(fc.totalCount).toBe(3)
      expect(fc.getArray(0)).toEqual([1, 2, 3])
    })
  })

  describe('sorted vs unsorted input', () => {
    it('should produce same query results regardless of input order', () => {
      const fc1 = new FractionalCascading([[1, 2, 3]])
      const fc2 = new FractionalCascading([[3, 1, 2]])
      expect(fc1.query(2)).toEqual(fc2.query(2))
      expect(fc1.query(3)).toEqual(fc2.query(3))
    })

    it('should produce same queryIndex results regardless of input order', () => {
      const fc1 = new FractionalCascading([[1, 2, 3]])
      const fc2 = new FractionalCascading([[3, 1, 2]])
      expect(fc1.queryIndex(2)).toEqual(fc2.queryIndex(2))
    })

    it('should handle pre-sorted input without re-sorting', () => {
      const fc = new FractionalCascading([[1, 2, 3]], { sorted: true })
      expect(fc.query(2)).toEqual([2])
    })

    it('should handle reverse-sorted input with sorted: false', () => {
      const fc = new FractionalCascading([[3, 2, 1]])
      expect(fc.getArray(0)).toEqual([1, 2, 3])
      expect(fc.query(2)).toEqual([2])
    })
  })

  describe('large scale', () => {
    it('should handle 100 arrays of size 10', () => {
      const arrays = Array.from({ length: 100 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => i * 10 + j)
      )
      const fc = new FractionalCascading(arrays, { sorted: true })
      expect(fc.arrayCount).toBe(100)
      expect(fc.totalCount).toBe(1000)
      const result = fc.query(50)
      expect(result.length).toBe(100)
      expect(result[0]!).toBe(10)
      expect(result[4]!).toBe(10)
      expect(result[5]!).toBe(1)
    })

    it('should handle 3 arrays of size 1000', () => {
      const arr1 = Array.from({ length: 1000 }, (_, i) => i * 3)
      const arr2 = Array.from({ length: 1000 }, (_, i) => i * 3 + 1)
      const arr3 = Array.from({ length: 1000 }, (_, i) => i * 3 + 2)
      const fc = new FractionalCascading([arr1, arr2, arr3], { sorted: true })
      expect(fc.totalCount).toBe(3000)
      expect(fc.query(1500)).toEqual([
        Math.ceil(1501 / 3),
        Math.ceil(1500 / 3),
        Math.ceil(1499 / 3),
      ])
    })

    it('should handle arrays with varying sizes', () => {
      const arrays = [
        [1],
        [1, 2],
        [1, 2, 3],
        [1, 2, 3, 4],
        [1, 2, 3, 4, 5],
      ]
      const fc = new FractionalCascading(arrays)
      expect(fc.arrayCount).toBe(5)
      expect(fc.totalCount).toBe(15)
      expect(fc.query(3)).toEqual([1, 2, 3, 3, 3])
    })

    it('should handle many empty arrays mixed with data', () => {
      const arrays: number[][] = [[], [1, 2], [], [], [3, 4, 5], []]
      const fc = new FractionalCascading(arrays)
      expect(fc.query(3)).toEqual([0, 2, 0, 0, 1, 0])
    })
  })

  describe('boundary values', () => {
    it('should handle value exactly at minimum', () => {
      const fc = new FractionalCascading([[10, 20, 30]])
      expect(fc.query(10)).toEqual([1])
    })

    it('should handle value exactly at maximum', () => {
      const fc = new FractionalCascading([[10, 20, 30]])
      expect(fc.query(30)).toEqual([3])
    })

    it('should handle value just below minimum', () => {
      const fc = new FractionalCascading([[10, 20, 30]])
      expect(fc.query(9)).toEqual([0])
    })

    it('should handle value just above maximum', () => {
      const fc = new FractionalCascading([[10, 20, 30]])
      expect(fc.query(31)).toEqual([3])
    })

    it('should handle value between min and max', () => {
      const fc = new FractionalCascading([[10, 20, 30]])
      expect(fc.query(15)).toEqual([1])
      expect(fc.query(25)).toEqual([2])
    })

    it('should handle negative query value on positive arrays', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(fc.query(-100)).toEqual([0])
    })

    it('should handle positive query value on negative arrays', () => {
      const fc = new FractionalCascading([[-3, -2, -1]])
      expect(fc.query(100)).toEqual([3])
    })

    it('should handle query value 0 on mixed arrays', () => {
      const fc = new FractionalCascading([[-1, 0, 1]])
      expect(fc.query(0)).toEqual([2])
    })
  })

  describe('rebuild edge cases', () => {
    it('should rebuild from populated to empty', () => {
      const fc = new FractionalCascading([[1, 2, 3], [4, 5]])
      fc.rebuild([])
      expect(fc.arrayCount).toBe(0)
      expect(fc.query(3)).toEqual([])
    })

    it('should rebuild from empty to populated', () => {
      const fc = new FractionalCascading([])
      fc.rebuild([[1, 2, 3]])
      expect(fc.arrayCount).toBe(1)
      expect(fc.query(2)).toEqual([2])
    })

    it('should handle rebuild then query correctly', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(fc.query(2)).toEqual([2])
      fc.rebuild([[10, 20, 30]])
      expect(fc.query(20)).toEqual([2])
      expect(fc.query(2)).toEqual([0])
    })

    it('should handle rebuild with different array count', () => {
      const fc = new FractionalCascading([[1]])
      fc.rebuild([[1, 2], [3, 4], [5, 6]])
      expect(fc.arrayCount).toBe(3)
      expect(fc.query(5)).toEqual([2, 2, 1])
    })

    it('should handle rebuild changing totalCount', () => {
      const fc = new FractionalCascading([[1, 2, 3, 4, 5]])
      expect(fc.totalCount).toBe(5)
      fc.rebuild([[1], [2]])
      expect(fc.totalCount).toBe(2)
    })
  })

  describe('getArray validation', () => {
    it('should throw RangeError with descriptive message', () => {
      const fc = new FractionalCascading([[1, 2]])
      try {
        fc.getArray(5)
      } catch (e) {
        expect(e).toBeInstanceOf(RangeError)
        expect((e as RangeError).message).toContain('5')
      }
    })

    it('should accept index 0', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(() => fc.getArray(0)).not.toThrow()
    })

    it('should accept last valid index', () => {
      const fc = new FractionalCascading([[1], [2], [3]])
      expect(() => fc.getArray(2)).not.toThrow()
    })

    it('should reject index equal to arrayCount', () => {
      const fc = new FractionalCascading([[1], [2], [3]])
      expect(() => fc.getArray(3)).toThrow(RangeError)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency after multiple rebuilds', () => {
      const fc = new FractionalCascading([[1, 2, 3]])
      expect(fc.query(2)).toEqual([2])
      fc.rebuild([[10, 20]])
      expect(fc.query(15)).toEqual([1])
      fc.rebuild([[1, 2, 3, 4, 5]])
      expect(fc.query(3)).toEqual([3])
    })

    it('should handle getArray after rebuild', () => {
      const fc = new FractionalCascading([[1, 2]])
      fc.rebuild([[10, 20, 30]])
      expect(fc.getArray(0)).toEqual([10, 20, 30])
    })

    it('should handle getStats after rebuild', () => {
      const fc = new FractionalCascading([[1]])
      fc.rebuild([[1, 2], [3, 4]])
      const stats = fc.getStats()
      expect(stats.arrayCount).toBe(2)
      expect(stats.totalCount).toBe(4)
    })
  })
})
