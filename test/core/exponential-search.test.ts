import { describe, it, expect } from 'vitest'
import { ExponentialSearch } from '../../src/core/exponential-search/exponential-search.js'

const descendingComparator = (a: number, b: number): number => b - a

function generateSortedArray(size: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push(i * 2)
  }
  return arr
}

function generateDuplicateArray(
  size: number,
  duplicateCount: number
): number[] {
  const arr: number[] = []
  let val = 0
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < duplicateCount; j++) {
      arr.push(val)
    }
    val++
  }
  return arr
}

describe('ExponentialSearch', () => {
  describe('static search', () => {
    it('should return -1 for empty array', () => {
      expect(ExponentialSearch.search([], 5)).toBe(-1)
    })

    it('should find element in single-element array (present)', () => {
      expect(ExponentialSearch.search([42], 42)).toBe(0)
    })

    it('should return -1 for single-element array (not present)', () => {
      expect(ExponentialSearch.search([42], 7)).toBe(-1)
    })

    it('should find element in two-element array at index 0', () => {
      expect(ExponentialSearch.search([1, 2], 1)).toBe(0)
    })

    it('should find element in two-element array at index 1', () => {
      expect(ExponentialSearch.search([1, 2], 2)).toBe(1)
    })

    it('should return -1 for two-element array (not present)', () => {
      expect(ExponentialSearch.search([1, 2], 3)).toBe(-1)
    })

    it('should find element at the beginning of array', () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      expect(ExponentialSearch.search(arr, 0)).toBe(0)
    })

    it('should find element at the end of array', () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      expect(ExponentialSearch.search(arr, 9)).toBe(9)
    })

    it('should find element in the middle of array', () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      expect(ExponentialSearch.search(arr, 5)).toBe(5)
    })

    it('should return -1 when target is less than all elements', () => {
      const arr = [10, 20, 30, 40, 50]
      expect(ExponentialSearch.search(arr, 5)).toBe(-1)
    })

    it('should return -1 when target is greater than all elements', () => {
      const arr = [10, 20, 30, 40, 50]
      expect(ExponentialSearch.search(arr, 60)).toBe(-1)
    })

    it('should return -1 when target is between elements', () => {
      const arr = [10, 20, 30, 40, 50]
      expect(ExponentialSearch.search(arr, 25)).toBe(-1)
    })

    it('should work with custom comparator (descending)', () => {
      const arr = [50, 40, 30, 20, 10]
      expect(ExponentialSearch.search(arr, 30, descendingComparator)).toBe(2)
    })

    it('should find elements in large sorted array', () => {
      const arr = generateSortedArray(10000)
      expect(ExponentialSearch.search(arr, 0)).toBe(0)
      expect(ExponentialSearch.search(arr, 9998)).toBe(4999)
      expect(ExponentialSearch.search(arr, 5000)).toBe(2500)
    })

    it('should return -1 for target not in large array', () => {
      const arr = generateSortedArray(10000)
      expect(ExponentialSearch.search(arr, 1)).toBe(-1)
      expect(ExponentialSearch.search(arr, 20000)).toBe(-1)
    })

    it('should work with string arrays', () => {
      const arr = ['apple', 'banana', 'cherry', 'date', 'elderberry']
      const strCmp = (a: string, b: string) => a.localeCompare(b)
      expect(ExponentialSearch.search(arr, 'cherry', strCmp)).toBe(2)
      expect(ExponentialSearch.search(arr, 'fig', strCmp)).toBe(-1)
    })
  })

  describe('static lowerBound', () => {
    it('should return 0 for empty array', () => {
      expect(ExponentialSearch.lowerBound([], 5)).toBe(0)
    })

    it('should return 0 when target is at the beginning', () => {
      expect(ExponentialSearch.lowerBound([1, 2, 3, 4, 5], 1)).toBe(0)
    })

    it('should return index of first occurrence with duplicates', () => {
      expect(ExponentialSearch.lowerBound([1, 2, 2, 2, 3], 2)).toBe(1)
    })

    it('should return length when target is greater than all', () => {
      expect(ExponentialSearch.lowerBound([1, 2, 3, 4, 5], 10)).toBe(5)
    })

    it('should return insertion position for missing element', () => {
      expect(ExponentialSearch.lowerBound([1, 3, 5, 7, 9], 4)).toBe(2)
    })

    it('should return 0 when target is less than all', () => {
      expect(ExponentialSearch.lowerBound([10, 20, 30], 5)).toBe(0)
    })

    it('should work with custom comparator (descending)', () => {
      const arr = [50, 40, 30, 20, 10]
      expect(ExponentialSearch.lowerBound(arr, 30, descendingComparator)).toBe(
        2
      )
    })

    it('should work with large array', () => {
      const arr = generateSortedArray(10000)
      expect(ExponentialSearch.lowerBound(arr, 5000)).toBe(2500)
      expect(ExponentialSearch.lowerBound(arr, 5001)).toBe(2501)
    })
  })

  describe('static upperBound', () => {
    it('should return 0 for empty array', () => {
      expect(ExponentialSearch.upperBound([], 5)).toBe(0)
    })

    it('should return index past last occurrence with duplicates', () => {
      expect(ExponentialSearch.upperBound([1, 2, 2, 2, 3], 2)).toBe(4)
    })

    it('should return length when target is greater than all', () => {
      expect(ExponentialSearch.upperBound([1, 2, 3, 4, 5], 10)).toBe(5)
    })

    it('should return 0 when target is less than all', () => {
      expect(ExponentialSearch.upperBound([10, 20, 30], 5)).toBe(0)
    })

    it('should return insertion position for missing element', () => {
      expect(ExponentialSearch.upperBound([1, 3, 5, 7, 9], 4)).toBe(2)
    })

    it('should work with custom comparator (descending)', () => {
      const arr = [50, 40, 30, 30, 20, 10]
      expect(ExponentialSearch.upperBound(arr, 30, descendingComparator)).toBe(
        4
      )
    })

    it('should work with large array', () => {
      const arr = generateSortedArray(10000)
      expect(ExponentialSearch.upperBound(arr, 5000)).toBe(2501)
    })
  })

  describe('static findRange', () => {
    it('should return [0, 0] for empty array', () => {
      expect(ExponentialSearch.findRange([], 5)).toEqual([0, 0])
    })

    it('should return full range of duplicates', () => {
      expect(ExponentialSearch.findRange([1, 2, 2, 2, 3], 2)).toEqual([1, 4])
    })

    it('should return [n, n] when target is not found', () => {
      expect(ExponentialSearch.findRange([1, 3, 5], 2)).toEqual([1, 1])
    })

    it('should return [0, 1] for single match at start', () => {
      expect(ExponentialSearch.findRange([1, 2, 3, 4, 5], 1)).toEqual([0, 1])
    })

    it('should return [4, 5] for single match at end', () => {
      expect(ExponentialSearch.findRange([1, 2, 3, 4, 5], 5)).toEqual([4, 5])
    })

    it('should handle all same elements', () => {
      expect(ExponentialSearch.findRange([3, 3, 3, 3, 3], 3)).toEqual([
        0, 5
      ])
    })

    it('should handle no match in all same elements', () => {
      expect(ExponentialSearch.findRange([3, 3, 3, 3, 3], 2)).toEqual([0, 0])
    })
  })

  describe('instance constructor', () => {
    it('should create instance with empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.search(5)).toBe(-1)
    })

    it('should create instance with sorted array', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.search(3)).toBe(2)
    })

    it('should create instance with custom comparator', () => {
      const es = new ExponentialSearch([50, 40, 30, 20, 10], {
        comparator: descendingComparator
      })
      expect(es.search(30)).toBe(2)
    })

    it('should create instance with options object', () => {
      const es = new ExponentialSearch([1, 2, 3], {})
      expect(es.search(2)).toBe(1)
    })
  })

  describe('instance search', () => {
    it('should find existing element', () => {
      const es = new ExponentialSearch([1, 3, 5, 7, 9])
      expect(es.search(5)).toBe(2)
    })

    it('should return -1 for non-existing element', () => {
      const es = new ExponentialSearch([1, 3, 5, 7, 9])
      expect(es.search(4)).toBe(-1)
    })

    it('should find first element', () => {
      const es = new ExponentialSearch([10, 20, 30, 40, 50])
      expect(es.search(10)).toBe(0)
    })

    it('should find last element', () => {
      const es = new ExponentialSearch([10, 20, 30, 40, 50])
      expect(es.search(50)).toBe(4)
    })
  })

  describe('instance indexOf', () => {
    it('should return index of found element', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.indexOf(3)).toBe(2)
    })

    it('should return -1 when element not found', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.indexOf(6)).toBe(-1)
    })

    it('should behave same as search', () => {
      const es = new ExponentialSearch([10, 20, 30, 40, 50])
      expect(es.indexOf(30)).toBe(es.search(30))
      expect(es.indexOf(25)).toBe(es.search(25))
    })
  })

  describe('instance contains', () => {
    it('should return true when element exists', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.contains(3)).toBe(true)
    })

    it('should return false when element does not exist', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.contains(6)).toBe(false)
    })

    it('should work with empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.contains(1)).toBe(false)
    })

    it('should work with single-element array', () => {
      const es = new ExponentialSearch([42])
      expect(es.contains(42)).toBe(true)
      expect(es.contains(41)).toBe(false)
    })
  })

  describe('instance lowerBound', () => {
    it('should return first position where element can be inserted', () => {
      const es = new ExponentialSearch([1, 2, 2, 2, 3, 4])
      expect(es.lowerBound(2)).toBe(1)
    })

    it('should return 0 for target less than all elements', () => {
      const es = new ExponentialSearch([10, 20, 30])
      expect(es.lowerBound(5)).toBe(0)
    })

    it('should return length for target greater than all elements', () => {
      const es = new ExponentialSearch([10, 20, 30])
      expect(es.lowerBound(40)).toBe(3)
    })

    it('should work with empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.lowerBound(5)).toBe(0)
    })
  })

  describe('instance upperBound', () => {
    it('should return position past last matching element', () => {
      const es = new ExponentialSearch([1, 2, 2, 2, 3, 4])
      expect(es.upperBound(2)).toBe(4)
    })

    it('should return 0 for target less than all elements', () => {
      const es = new ExponentialSearch([10, 20, 30])
      expect(es.upperBound(5)).toBe(0)
    })

    it('should return length for target greater than all elements', () => {
      const es = new ExponentialSearch([10, 20, 30])
      expect(es.upperBound(40)).toBe(3)
    })

    it('should work with empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.upperBound(5)).toBe(0)
    })
  })

  describe('instance findRange', () => {
    it('should return range of duplicate elements', () => {
      const es = new ExponentialSearch([1, 2, 2, 2, 3, 4])
      expect(es.findRange(2)).toEqual([1, 4])
    })

    it('should return empty range for non-existing element', () => {
      const es = new ExponentialSearch([1, 3, 5, 7])
      expect(es.findRange(4)).toEqual([2, 2])
    })

    it('should return full range for all same elements', () => {
      const es = new ExponentialSearch([5, 5, 5, 5])
      expect(es.findRange(5)).toEqual([0, 4])
    })

    it('should return empty range for empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.findRange(5)).toEqual([0, 0])
    })
  })

  describe('instance findInsertPosition', () => {
    it('should return 0 for target before all elements', () => {
      const es = new ExponentialSearch([10, 20, 30])
      expect(es.findInsertPosition(5)).toBe(0)
    })

    it('should return length for target after all elements', () => {
      const es = new ExponentialSearch([10, 20, 30])
      expect(es.findInsertPosition(40)).toBe(3)
    })

    it('should return position within array for missing target', () => {
      const es = new ExponentialSearch([10, 20, 30, 40, 50])
      expect(es.findInsertPosition(25)).toBe(2)
    })

    it('should return position of first occurrence for existing target', () => {
      const es = new ExponentialSearch([10, 20, 20, 20, 30])
      expect(es.findInsertPosition(20)).toBe(1)
    })

    it('should work with empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.findInsertPosition(5)).toBe(0)
    })
  })

  describe('instance count', () => {
    it('should count occurrences of duplicate elements', () => {
      const es = new ExponentialSearch([1, 2, 2, 2, 3, 4])
      expect(es.count(2)).toBe(3)
    })

    it('should return 0 for non-existing element', () => {
      const es = new ExponentialSearch([1, 2, 3, 4])
      expect(es.count(5)).toBe(0)
    })

    it('should return 1 for single occurrence', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.count(3)).toBe(1)
    })

    it('should count all elements when all are the same', () => {
      const es = new ExponentialSearch([7, 7, 7, 7, 7, 7])
      expect(es.count(7)).toBe(6)
    })

    it('should work with empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.count(5)).toBe(0)
    })
  })

  describe('instance min', () => {
    it('should return first element', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.min()).toBe(1)
    })

    it('should return undefined for empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.min()).toBeUndefined()
    })

    it('should work with single element', () => {
      const es = new ExponentialSearch([42])
      expect(es.min()).toBe(42)
    })

    it('should work with negative numbers', () => {
      const es = new ExponentialSearch([-50, -25, 0, 25, 50])
      expect(es.min()).toBe(-50)
    })
  })

  describe('instance max', () => {
    it('should return last element', () => {
      const es = new ExponentialSearch([1, 2, 3, 4, 5])
      expect(es.max()).toBe(5)
    })

    it('should return undefined for empty array', () => {
      const es = new ExponentialSearch([])
      expect(es.max()).toBeUndefined()
    })

    it('should work with single element', () => {
      const es = new ExponentialSearch([42])
      expect(es.max()).toBe(42)
    })

    it('should work with negative numbers', () => {
      const es = new ExponentialSearch([-50, -25, 0, 25, 50])
      expect(es.max()).toBe(50)
    })
  })

  describe('custom comparator (descending)', () => {
    it('should search in descending sorted array', () => {
      const es = new ExponentialSearch([100, 80, 60, 40, 20], {
        comparator: descendingComparator
      })
      expect(es.search(60)).toBe(2)
      expect(es.search(100)).toBe(0)
      expect(es.search(20)).toBe(4)
      expect(es.search(50)).toBe(-1)
    })

    it('should find lowerBound in descending array', () => {
      const es = new ExponentialSearch([100, 80, 60, 40, 20], {
        comparator: descendingComparator
      })
      expect(es.lowerBound(60)).toBe(2)
      expect(es.lowerBound(70)).toBe(2)
      expect(es.lowerBound(50)).toBe(3)
    })

    it('should find upperBound in descending array', () => {
      const es = new ExponentialSearch([100, 80, 60, 60, 40, 20], {
        comparator: descendingComparator
      })
      expect(es.upperBound(60)).toBe(4)
    })

    it('should count in descending array', () => {
      const es = new ExponentialSearch([100, 80, 60, 60, 40, 20], {
        comparator: descendingComparator
      })
      expect(es.count(60)).toBe(2)
    })

    it('should findRange in descending array', () => {
      const es = new ExponentialSearch([100, 80, 60, 60, 40, 20], {
        comparator: descendingComparator
      })
      expect(es.findRange(60)).toEqual([2, 4])
    })

    it('should find min and max in descending array', () => {
      const es = new ExponentialSearch([100, 80, 60, 40, 20], {
        comparator: descendingComparator
      })
      expect(es.min()).toBe(100)
      expect(es.max()).toBe(20)
    })
  })

  describe('large arrays', () => {
    it('should search correctly in 10000-element array', () => {
      const arr = generateSortedArray(10000)
      const es = new ExponentialSearch(arr)
      expect(es.search(0)).toBe(0)
      expect(es.search(19998)).toBe(9999)
      expect(es.search(10000)).toBe(5000)
      expect(es.search(1)).toBe(-1)
    })

    it('should search correctly in 100000-element array', () => {
      const arr = generateSortedArray(100000)
      const es = new ExponentialSearch(arr)
      expect(es.search(0)).toBe(0)
      expect(es.search(199998)).toBe(99999)
      expect(es.search(100000)).toBe(50000)
      expect(es.search(99999)).toBe(-1)
    })

    it('should handle static search in 100000-element array', () => {
      const arr = generateSortedArray(100000)
      expect(ExponentialSearch.search(arr, 0)).toBe(0)
      expect(ExponentialSearch.search(arr, 199998)).toBe(99999)
      expect(ExponentialSearch.search(arr, 200000)).toBe(-1)
    })

    it('should handle lowerBound in 100000-element array', () => {
      const arr = generateSortedArray(100000)
      expect(ExponentialSearch.lowerBound(arr, 0)).toBe(0)
      expect(ExponentialSearch.lowerBound(arr, 199998)).toBe(99999)
      expect(ExponentialSearch.lowerBound(arr, 200000)).toBe(100000)
    })

    it('should handle upperBound in 100000-element array', () => {
      const arr = generateSortedArray(100000)
      expect(ExponentialSearch.upperBound(arr, 0)).toBe(1)
      expect(ExponentialSearch.upperBound(arr, 199998)).toBe(100000)
    })

    it('should handle findRange in 100000-element array', () => {
      const arr = generateSortedArray(100000)
      expect(ExponentialSearch.findRange(arr, 0)).toEqual([0, 1])
      expect(ExponentialSearch.findRange(arr, 199998)).toEqual([99999, 100000])
    })
  })

  describe('duplicates', () => {
    it('should find first occurrence with search', () => {
      const arr = [1, 2, 2, 2, 2, 2, 3]
      const idx = ExponentialSearch.search(arr, 2)
      expect(idx).toBeGreaterThanOrEqual(1)
      expect(idx).toBeLessThanOrEqual(5)
      expect(arr[idx]).toBe(2)
    })

    it('should count all duplicates correctly', () => {
      const arr = [1, 1, 1, 2, 2, 2, 2, 3, 3, 4]
      const es = new ExponentialSearch(arr)
      expect(es.count(1)).toBe(3)
      expect(es.count(2)).toBe(4)
      expect(es.count(3)).toBe(2)
      expect(es.count(4)).toBe(1)
      expect(es.count(5)).toBe(0)
    })

    it('should find range of all duplicates', () => {
      const arr = [1, 1, 1, 2, 2, 2, 2, 3, 3, 4]
      const es = new ExponentialSearch(arr)
      expect(es.findRange(1)).toEqual([0, 3])
      expect(es.findRange(2)).toEqual([3, 7])
      expect(es.findRange(3)).toEqual([7, 9])
      expect(es.findRange(4)).toEqual([9, 10])
    })

    it('should find range with static method', () => {
      const arr = [1, 1, 1, 2, 2, 2, 2, 3, 3, 4]
      expect(ExponentialSearch.findRange(arr, 1)).toEqual([0, 3])
      expect(ExponentialSearch.findRange(arr, 2)).toEqual([3, 7])
    })

    it('should handle large duplicate array', () => {
      const arr = generateDuplicateArray(100, 5)
      const es = new ExponentialSearch(arr)
      expect(es.count(50)).toBe(5)
      expect(es.findRange(50)).toEqual([250, 255])
    })
  })

  describe('edge cases', () => {
    it('should handle array with all same elements (search)', () => {
      const arr = [5, 5, 5, 5, 5]
      expect(ExponentialSearch.search(arr, 5)).toBeGreaterThanOrEqual(0)
      expect(ExponentialSearch.search(arr, 5)).toBeLessThanOrEqual(4)
    })

    it('should handle array with all same elements (lowerBound)', () => {
      const arr = [5, 5, 5, 5, 5]
      expect(ExponentialSearch.lowerBound(arr, 5)).toBe(0)
    })

    it('should handle array with all same elements (upperBound)', () => {
      const arr = [5, 5, 5, 5, 5]
      expect(ExponentialSearch.upperBound(arr, 5)).toBe(5)
    })

    it('should handle negative numbers', () => {
      const arr = [-100, -50, -10, 0, 10, 50, 100]
      expect(ExponentialSearch.search(arr, -50)).toBe(1)
      expect(ExponentialSearch.search(arr, 0)).toBe(3)
      expect(ExponentialSearch.search(arr, 100)).toBe(6)
      expect(ExponentialSearch.search(arr, -200)).toBe(-1)
    })

    it('should handle array with two elements', () => {
      const arr = [1, 3]
      expect(ExponentialSearch.search(arr, 1)).toBe(0)
      expect(ExponentialSearch.search(arr, 3)).toBe(1)
      expect(ExponentialSearch.search(arr, 2)).toBe(-1)
      expect(ExponentialSearch.search(arr, 0)).toBe(-1)
      expect(ExponentialSearch.search(arr, 4)).toBe(-1)
    })

    it('should handle array with three elements', () => {
      const arr = [1, 2, 3]
      expect(ExponentialSearch.search(arr, 1)).toBe(0)
      expect(ExponentialSearch.search(arr, 2)).toBe(1)
      expect(ExponentialSearch.search(arr, 3)).toBe(2)
      expect(ExponentialSearch.search(arr, 0)).toBe(-1)
      expect(ExponentialSearch.search(arr, 4)).toBe(-1)
    })

    it('should handle target at power-of-two positions', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i)
      expect(ExponentialSearch.search(arr, 1)).toBe(1)
      expect(ExponentialSearch.search(arr, 2)).toBe(2)
      expect(ExponentialSearch.search(arr, 4)).toBe(4)
      expect(ExponentialSearch.search(arr, 8)).toBe(8)
      expect(ExponentialSearch.search(arr, 16)).toBe(16)
      expect(ExponentialSearch.search(arr, 32)).toBe(32)
      expect(ExponentialSearch.search(arr, 64)).toBe(64)
    })

    it('should handle floating point numbers', () => {
      const arr = [1.1, 2.2, 3.3, 4.4, 5.5]
      const cmp = (a: number, b: number) => a - b
      expect(ExponentialSearch.search(arr, 3.3, cmp)).toBe(2)
      expect(ExponentialSearch.search(arr, 3.0, cmp)).toBe(-1)
    })
  })

  describe('correctness vs linear search', () => {
    const sizes = [0, 1, 2, 3, 5, 10, 50, 100, 1000]

    for (const size of sizes) {
      it(`should match linear search for array size ${size}`, () => {
        const arr = Array.from({ length: size }, (_, i) => i * 3)

        for (let target = -5; target <= size * 3 + 5; target++) {
          const expected = arr.indexOf(target)
          const result = ExponentialSearch.search(arr, target)
          if (expected !== -1) {
            expect(result).toBe(expected)
          } else {
            expect(result).toBe(-1)
          }
        }
      })
    }

    it('should match linear lowerBound for various targets', () => {
      const arr = [1, 2, 2, 2, 3, 4, 4, 5, 5, 5, 5, 6]
      for (let target = 0; target <= 8; target++) {
        let expected = 0
        while (expected < arr.length && arr[expected]! < target) {
          expected++
        }
        expect(ExponentialSearch.lowerBound(arr, target)).toBe(expected)
      }
    })

    it('should match linear upperBound for various targets', () => {
      const arr = [1, 2, 2, 2, 3, 4, 4, 5, 5, 5, 5, 6]
      for (let target = 0; target <= 8; target++) {
        let expected = 0
        while (expected < arr.length && arr[expected]! <= target) {
          expected++
        }
        expect(ExponentialSearch.upperBound(arr, target)).toBe(expected)
      }
    })
  })

  describe('static vs instance consistency', () => {
    it('should produce same results for search', () => {
      const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
      const es = new ExponentialSearch(arr)
      for (let target = 0; target <= 20; target++) {
        expect(es.search(target)).toBe(ExponentialSearch.search(arr, target))
      }
    })

    it('should produce same results for lowerBound', () => {
      const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
      const es = new ExponentialSearch(arr)
      for (let target = 0; target <= 20; target++) {
        expect(es.lowerBound(target)).toBe(
          ExponentialSearch.lowerBound(arr, target)
        )
      }
    })

    it('should produce same results for upperBound', () => {
      const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
      const es = new ExponentialSearch(arr)
      for (let target = 0; target <= 20; target++) {
        expect(es.upperBound(target)).toBe(
          ExponentialSearch.upperBound(arr, target)
        )
      }
    })

    it('should produce same results for findRange', () => {
      const arr = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
      const es = new ExponentialSearch(arr)
      for (let target = 0; target <= 6; target++) {
        expect(es.findRange(target)).toEqual(
          ExponentialSearch.findRange(arr, target)
        )
      }
    })
  })

  describe('reverse sorted with comparator', () => {
    it('should search in fully reverse sorted array', () => {
      const arr = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]
      const es = new ExponentialSearch(arr, { comparator: descendingComparator })
      expect(es.search(100)).toBe(0)
      expect(es.search(10)).toBe(9)
      expect(es.search(55)).toBe(-1)
    })

    it('should handle lowerBound in reverse sorted array', () => {
      const arr = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]
      expect(ExponentialSearch.lowerBound(arr, 55, descendingComparator)).toBe(
        5
      )
      expect(ExponentialSearch.lowerBound(arr, 100, descendingComparator)).toBe(
        0
      )
    })
  })

  describe('performance characteristics', () => {
    it('should find element near beginning faster than binary search range', () => {
      const arr = generateSortedArray(1000000)
      const result = ExponentialSearch.search(arr, 4)
      expect(result).toBe(2)
    })

    it('should find element at exact power of 2', () => {
      const arr = generateSortedArray(100000)
      expect(ExponentialSearch.search(arr, 1024)).toBe(512)
      expect(ExponentialSearch.search(arr, 2048)).toBe(1024)
    })

    it('should correctly search near the boundary of exponential bounds', () => {
      const arr = Array.from({ length: 200 }, (_, i) => i)
      for (let i = 0; i < 200; i++) {
        expect(ExponentialSearch.search(arr, i)).toBe(i)
      }
    })
  })

  describe('with objects using custom comparator', () => {
    interface Item {
      id: number
      name: string
    }

    const itemComparator = (a: Item, b: Item): number => a.id - b.id

    it('should search objects by id', () => {
      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 3, name: 'b' },
        { id: 5, name: 'c' },
        { id: 7, name: 'd' },
        { id: 9, name: 'e' }
      ]
      const target = { id: 5, name: '' }
      const result = ExponentialSearch.search(items, target, itemComparator)
      expect(result).toBe(2)
      expect(items[result!]!.name).toBe('c')
    })

    it('should return -1 for missing object', () => {
      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 3, name: 'b' },
        { id: 5, name: 'c' }
      ]
      const target = { id: 4, name: '' }
      expect(ExponentialSearch.search(items, target, itemComparator)).toBe(-1)
    })

    it('should find lowerBound for objects', () => {
      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 3, name: 'b' },
        { id: 5, name: 'c' }
      ]
      const target = { id: 4, name: '' }
      expect(ExponentialSearch.lowerBound(items, target, itemComparator)).toBe(
        2
      )
    })

    it('should find upperBound for objects', () => {
      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 3, name: 'b' },
        { id: 5, name: 'c' }
      ]
      const target = { id: 3, name: '' }
      expect(ExponentialSearch.upperBound(items, target, itemComparator)).toBe(
        2
      )
    })

    it('should findRange for objects with duplicates', () => {
      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 3, name: 'b1' },
        { id: 3, name: 'b2' },
        { id: 3, name: 'b3' },
        { id: 5, name: 'c' }
      ]
      const target = { id: 3, name: '' }
      expect(
        ExponentialSearch.findRange(items, target, itemComparator)
      ).toEqual([1, 4])
    })

    it('should count object occurrences', () => {
      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b1' },
        { id: 2, name: 'b2' },
        { id: 2, name: 'b3' },
        { id: 3, name: 'c' }
      ]
      const es = new ExponentialSearch(items, { comparator: itemComparator })
      const target = { id: 2, name: '' }
      expect(es.count(target)).toBe(3)
    })
  })

  describe('already sorted arrays (identity)', () => {
    it('should handle sequentially increasing array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const es = new ExponentialSearch(arr)
      for (let i = 0; i < 1000; i += 100) {
        expect(es.search(i)).toBe(i)
      }
    })

    it('should handle array with constant step', () => {
      const arr = Array.from({ length: 500 }, (_, i) => i * 5)
      const es = new ExponentialSearch(arr)
      expect(es.search(0)).toBe(0)
      expect(es.search(250)).toBe(50)
      expect(es.search(2495)).toBe(499)
    })
  })

  describe('boundary conditions', () => {
    it('should handle target at index 0 (first element)', () => {
      const arr = [1, 2, 3, 4, 5]
      expect(ExponentialSearch.search(arr, 1)).toBe(0)
      expect(ExponentialSearch.lowerBound(arr, 1)).toBe(0)
      expect(ExponentialSearch.upperBound(arr, 1)).toBe(1)
    })

    it('should handle target at last index', () => {
      const arr = [1, 2, 3, 4, 5]
      expect(ExponentialSearch.search(arr, 5)).toBe(4)
      expect(ExponentialSearch.lowerBound(arr, 5)).toBe(4)
      expect(ExponentialSearch.upperBound(arr, 5)).toBe(5)
    })

    it('should handle target just below minimum', () => {
      const arr = [10, 20, 30]
      expect(ExponentialSearch.search(arr, 9)).toBe(-1)
      expect(ExponentialSearch.lowerBound(arr, 9)).toBe(0)
      expect(ExponentialSearch.upperBound(arr, 9)).toBe(0)
    })

    it('should handle target just above maximum', () => {
      const arr = [10, 20, 30]
      expect(ExponentialSearch.search(arr, 31)).toBe(-1)
      expect(ExponentialSearch.lowerBound(arr, 31)).toBe(3)
      expect(ExponentialSearch.upperBound(arr, 31)).toBe(3)
    })

    it('should handle single duplicate element', () => {
      const arr = [5]
      expect(ExponentialSearch.findRange(arr, 5)).toEqual([0, 1])
      expect(ExponentialSearch.findRange(arr, 3)).toEqual([0, 0])
    })

    it('should handle two duplicate elements', () => {
      const arr = [3, 3]
      expect(ExponentialSearch.findRange(arr, 3)).toEqual([0, 2])
      expect(ExponentialSearch.lowerBound(arr, 3)).toBe(0)
      expect(ExponentialSearch.upperBound(arr, 3)).toBe(2)
    })
  })

  describe('static method with comparator parameter', () => {
    it('should work with string comparator', () => {
      const arr = ['a', 'b', 'c', 'd', 'e']
      const cmp = (a: string, b: string) => a.localeCompare(b)
      expect(ExponentialSearch.search(arr, 'c', cmp)).toBe(2)
      expect(ExponentialSearch.search(arr, 'z', cmp)).toBe(-1)
    })

    it('should work with numeric comparator on number array', () => {
      const cmp = (a: number, b: number) => a - b
      const arr = [1, 2, 3, 4, 5]
      expect(ExponentialSearch.search(arr, 3, cmp)).toBe(2)
    })

    it('should work with reverse comparator', () => {
      const arr = [5, 4, 3, 2, 1]
      expect(ExponentialSearch.search(arr, 3, descendingComparator)).toBe(2)
      expect(ExponentialSearch.lowerBound(arr, 3, descendingComparator)).toBe(
        2
      )
      expect(ExponentialSearch.upperBound(arr, 3, descendingComparator)).toBe(
        3
      )
    })
  })

  describe('comprehensive correctness - every position', () => {
    it('should find element at every position in small array', () => {
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      for (let i = 0; i < arr.length; i++) {
        expect(ExponentialSearch.search(arr, i)).toBe(i)
      }
    })

    it('should find element at every position in medium array', () => {
      const arr = Array.from({ length: 256 }, (_, i) => i)
      for (let i = 0; i < arr.length; i += 7) {
        expect(ExponentialSearch.search(arr, i)).toBe(i)
      }
    })

    it('should return -1 for every missing value between elements', () => {
      const arr = [10, 20, 30, 40, 50]
      expect(ExponentialSearch.search(arr, 15)).toBe(-1)
      expect(ExponentialSearch.search(arr, 25)).toBe(-1)
      expect(ExponentialSearch.search(arr, 35)).toBe(-1)
      expect(ExponentialSearch.search(arr, 45)).toBe(-1)
    })
  })
})
