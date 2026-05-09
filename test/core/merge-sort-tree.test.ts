import { describe, it, expect } from 'vitest'
import { MergeSortTree } from '../../src/core/merge-sort-tree/merge-sort-tree.js'

describe('MergeSortTree', () => {
  describe('constructor', () => {
    it('should build from empty array', () => {
      const mst = new MergeSortTree([])
      expect(mst.size()).toBe(0)
      expect(mst.isEmpty()).toBe(true)
    })

    it('should build from single element array', () => {
      const mst = new MergeSortTree([42])
      expect(mst.size()).toBe(1)
      expect(mst.isEmpty()).toBe(false)
    })

    it('should build from sorted array', () => {
      const mst = new MergeSortTree([1, 2, 3, 4, 5])
      expect(mst.size()).toBe(5)
    })

    it('should build from reverse sorted array', () => {
      const mst = new MergeSortTree([5, 4, 3, 2, 1])
      expect(mst.size()).toBe(5)
    })

    it('should build from array with duplicates', () => {
      const mst = new MergeSortTree([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])
      expect(mst.size()).toBe(11)
    })

    it('should build from array with negative numbers', () => {
      const mst = new MergeSortTree([-5, -3, -1, 0, 2, 4])
      expect(mst.size()).toBe(6)
    })

    it('should build from array with all same elements', () => {
      const mst = new MergeSortTree([7, 7, 7, 7, 7])
      expect(mst.size()).toBe(5)
    })

    it('should build from two element array', () => {
      const mst = new MergeSortTree([3, 1])
      expect(mst.size()).toBe(2)
    })

    it('should build from large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const mst = new MergeSortTree(arr)
      expect(mst.size()).toBe(1000)
    })

    it('should build from power-of-two sized array', () => {
      const mst = new MergeSortTree([1, 2, 3, 4, 5, 6, 7, 8])
      expect(mst.size()).toBe(8)
    })
  })

  describe('countLessThan', () => {
    it('should count elements less than value in range', () => {
      const mst = new MergeSortTree([1, 3, 5, 7, 9])
      expect(mst.countLessThan(0, 4, 5)).toBe(2)
    })

    it('should return 0 when no elements are less', () => {
      const mst = new MergeSortTree([5, 6, 7, 8, 9])
      expect(mst.countLessThan(0, 4, 3)).toBe(0)
    })

    it('should return range length when all elements are less', () => {
      const mst = new MergeSortTree([1, 2, 3, 4, 5])
      expect(mst.countLessThan(0, 4, 10)).toBe(5)
    })

    it('should work on single element range', () => {
      const mst = new MergeSortTree([1, 5, 3, 7, 2])
      expect(mst.countLessThan(1, 1, 6)).toBe(1)
      expect(mst.countLessThan(1, 1, 4)).toBe(0)
    })

    it('should work on full range', () => {
      const mst = new MergeSortTree([3, 1, 4, 1, 5])
      expect(mst.countLessThan(0, 4, 3)).toBe(2)
    })

    it('should handle duplicates correctly', () => {
      const mst = new MergeSortTree([2, 2, 2, 2, 2])
      expect(mst.countLessThan(0, 4, 2)).toBe(0)
      expect(mst.countLessThan(0, 4, 3)).toBe(5)
    })

    it('should handle negative numbers', () => {
      const mst = new MergeSortTree([-5, -3, 0, 2, 4])
      expect(mst.countLessThan(0, 4, 0)).toBe(2)
    })

    it('should handle partial ranges', () => {
      const mst = new MergeSortTree([1, 5, 3, 7, 2, 8, 4])
      expect(mst.countLessThan(2, 5, 5)).toBe(2)
    })

    it('should count less than minimum value as 0', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.countLessThan(0, 2, 1)).toBe(0)
    })

    it('should count less than maximum+1 as size', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.countLessThan(0, 2, 4)).toBe(3)
    })
  })

  describe('countLessThanOrEqual', () => {
    it('should count elements <= value in range', () => {
      const mst = new MergeSortTree([1, 3, 5, 7, 9])
      expect(mst.countLessThanOrEqual(0, 4, 5)).toBe(3)
    })

    it('should count duplicates correctly', () => {
      const mst = new MergeSortTree([2, 2, 2, 3, 3])
      expect(mst.countLessThanOrEqual(0, 4, 2)).toBe(3)
    })

    it('should return 0 when all elements are greater', () => {
      const mst = new MergeSortTree([5, 6, 7])
      expect(mst.countLessThanOrEqual(0, 2, 3)).toBe(0)
    })

    it('should return range length when all elements are <= value', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.countLessThanOrEqual(0, 2, 10)).toBe(3)
    })

    it('should work on single element range', () => {
      const mst = new MergeSortTree([1, 5, 3])
      expect(mst.countLessThanOrEqual(1, 1, 5)).toBe(1)
      expect(mst.countLessThanOrEqual(1, 1, 4)).toBe(0)
    })

    it('should handle partial ranges with duplicates', () => {
      const mst = new MergeSortTree([1, 2, 2, 3, 2, 4])
      expect(mst.countLessThanOrEqual(1, 4, 2)).toBe(3)
    })
  })

  describe('countGreaterThan', () => {
    it('should count elements > value in range', () => {
      const mst = new MergeSortTree([1, 3, 5, 7, 9])
      expect(mst.countGreaterThan(0, 4, 5)).toBe(2)
    })

    it('should return 0 when all elements are <= value', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.countGreaterThan(0, 2, 5)).toBe(0)
    })

    it('should return range length when all elements are > value', () => {
      const mst = new MergeSortTree([5, 6, 7])
      expect(mst.countGreaterThan(0, 2, 3)).toBe(3)
    })

    it('should work on single element range', () => {
      const mst = new MergeSortTree([1, 5, 3])
      expect(mst.countGreaterThan(1, 1, 4)).toBe(1)
      expect(mst.countGreaterThan(1, 1, 6)).toBe(0)
    })

    it('should handle duplicates', () => {
      const mst = new MergeSortTree([2, 2, 2, 2])
      expect(mst.countGreaterThan(0, 3, 2)).toBe(0)
      expect(mst.countGreaterThan(0, 3, 1)).toBe(4)
    })

    it('should handle negative numbers', () => {
      const mst = new MergeSortTree([-5, -3, 0, 2, 4])
      expect(mst.countGreaterThan(0, 4, 0)).toBe(2)
    })
  })

  describe('countGreaterThanOrEqual', () => {
    it('should count elements >= value in range', () => {
      const mst = new MergeSortTree([1, 3, 5, 7, 9])
      expect(mst.countGreaterThanOrEqual(0, 4, 5)).toBe(3)
    })

    it('should count duplicates correctly', () => {
      const mst = new MergeSortTree([2, 2, 2, 3, 3])
      expect(mst.countGreaterThanOrEqual(0, 4, 2)).toBe(5)
    })

    it('should return 0 when all elements are < value', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.countGreaterThanOrEqual(0, 2, 10)).toBe(0)
    })

    it('should return range length when all elements >= value', () => {
      const mst = new MergeSortTree([5, 6, 7])
      expect(mst.countGreaterThanOrEqual(0, 2, 3)).toBe(3)
    })

    it('should work on single element', () => {
      const mst = new MergeSortTree([1, 5, 3])
      expect(mst.countGreaterThanOrEqual(1, 1, 5)).toBe(1)
      expect(mst.countGreaterThanOrEqual(1, 1, 6)).toBe(0)
    })
  })

  describe('countInRange', () => {
    it('should count elements in range [minVal, maxVal]', () => {
      const mst = new MergeSortTree([1, 3, 5, 7, 9])
      expect(mst.countInRange(0, 4, 3, 7)).toBe(3)
    })

    it('should return 0 when no elements in range', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.countInRange(0, 2, 10, 20)).toBe(0)
    })

    it('should return range length when all elements in range', () => {
      const mst = new MergeSortTree([3, 4, 5])
      expect(mst.countInRange(0, 2, 1, 10)).toBe(3)
    })

    it('should handle single value range', () => {
      const mst = new MergeSortTree([1, 2, 3, 2, 1])
      expect(mst.countInRange(0, 4, 2, 2)).toBe(2)
    })

    it('should handle duplicates', () => {
      const mst = new MergeSortTree([1, 2, 2, 3, 2, 4])
      expect(mst.countInRange(0, 5, 2, 3)).toBe(4)
    })

    it('should handle partial range query', () => {
      const mst = new MergeSortTree([1, 5, 3, 7, 2, 8, 4])
      expect(mst.countInRange(1, 4, 3, 7)).toBe(3)
    })

    it('should handle negative bounds', () => {
      const mst = new MergeSortTree([-5, -3, 0, 2, 4])
      expect(mst.countInRange(0, 4, -4, 1)).toBe(2)
    })

    it('should return 0 for inverted range', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.countInRange(0, 2, 5, 3)).toBe(0)
    })
  })

  describe('kthSmallest', () => {
    it('should return k-th smallest in range', () => {
      const mst = new MergeSortTree([7, 1, 5, 3, 9])
      expect(mst.kthSmallest(0, 4, 1)).toBe(1)
      expect(mst.kthSmallest(0, 4, 2)).toBe(3)
      expect(mst.kthSmallest(0, 4, 3)).toBe(5)
      expect(mst.kthSmallest(0, 4, 4)).toBe(7)
      expect(mst.kthSmallest(0, 4, 5)).toBe(9)
    })

    it('should work on partial range', () => {
      const mst = new MergeSortTree([9, 3, 7, 1, 5])
      expect(mst.kthSmallest(1, 3, 1)).toBe(1)
      expect(mst.kthSmallest(1, 3, 2)).toBe(3)
      expect(mst.kthSmallest(1, 3, 3)).toBe(7)
    })

    it('should handle single element range', () => {
      const mst = new MergeSortTree([5, 3, 7])
      expect(mst.kthSmallest(1, 1, 1)).toBe(3)
    })

    it('should handle duplicates', () => {
      const mst = new MergeSortTree([3, 1, 2, 1, 3])
      expect(mst.kthSmallest(0, 4, 1)).toBe(1)
      expect(mst.kthSmallest(0, 4, 2)).toBe(1)
      expect(mst.kthSmallest(0, 4, 3)).toBe(2)
      expect(mst.kthSmallest(0, 4, 4)).toBe(3)
      expect(mst.kthSmallest(0, 4, 5)).toBe(3)
    })

    it('should throw for k out of bounds', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(() => mst.kthSmallest(0, 2, 0)).toThrow(RangeError)
      expect(() => mst.kthSmallest(0, 2, 4)).toThrow(RangeError)
    })

    it('should throw for empty tree', () => {
      const mst = new MergeSortTree([])
      expect(() => mst.kthSmallest(0, 0, 1)).toThrow()
    })

    it('should return min for k=1', () => {
      const mst = new MergeSortTree([9, 1, 5, 3, 7])
      expect(mst.kthSmallest(0, 4, 1)).toBe(1)
    })

    it('should return max for k=n', () => {
      const mst = new MergeSortTree([9, 1, 5, 3, 7])
      expect(mst.kthSmallest(0, 4, 5)).toBe(9)
    })
  })

  describe('rangeMin', () => {
    it('should return minimum in range', () => {
      const mst = new MergeSortTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(mst.rangeMin(0, 7)).toBe(1)
    })

    it('should return element for single element range', () => {
      const mst = new MergeSortTree([3, 1, 4])
      expect(mst.rangeMin(1, 1)).toBe(1)
    })

    it('should work on partial range', () => {
      const mst = new MergeSortTree([5, 2, 8, 1, 9, 3])
      expect(mst.rangeMin(2, 4)).toBe(1)
    })

    it('should handle negative numbers', () => {
      const mst = new MergeSortTree([-5, -3, 0, 2, 4])
      expect(mst.rangeMin(0, 4)).toBe(-5)
    })

    it('should throw for empty tree', () => {
      const mst = new MergeSortTree([])
      expect(() => mst.rangeMin(0, 0)).toThrow()
    })
  })

  describe('rangeMax', () => {
    it('should return maximum in range', () => {
      const mst = new MergeSortTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(mst.rangeMax(0, 7)).toBe(9)
    })

    it('should return element for single element range', () => {
      const mst = new MergeSortTree([3, 1, 4])
      expect(mst.rangeMax(2, 2)).toBe(4)
    })

    it('should work on partial range', () => {
      const mst = new MergeSortTree([5, 2, 8, 1, 9, 3])
      expect(mst.rangeMax(0, 3)).toBe(8)
    })

    it('should handle negative numbers', () => {
      const mst = new MergeSortTree([-5, -3, 0, 2, 4])
      expect(mst.rangeMax(0, 2)).toBe(0)
    })

    it('should throw for empty tree', () => {
      const mst = new MergeSortTree([])
      expect(() => mst.rangeMax(0, 0)).toThrow()
    })
  })

  describe('size and isEmpty', () => {
    it('should return correct size', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(mst.size()).toBe(3)
    })

    it('should return 0 for empty tree', () => {
      const mst = new MergeSortTree([])
      expect(mst.size()).toBe(0)
    })

    it('should return true for isEmpty on empty tree', () => {
      const mst = new MergeSortTree([])
      expect(mst.isEmpty()).toBe(true)
    })

    it('should return false for isEmpty on non-empty tree', () => {
      const mst = new MergeSortTree([1])
      expect(mst.isEmpty()).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return original array copy', () => {
      const arr = [3, 1, 4, 1, 5]
      const mst = new MergeSortTree(arr)
      expect(mst.toArray()).toEqual(arr)
    })

    it('should return empty array for empty tree', () => {
      const mst = new MergeSortTree([])
      expect(mst.toArray()).toEqual([])
    })

    it('should return a copy not a reference', () => {
      const mst = new MergeSortTree([1, 2, 3])
      const arr = mst.toArray()
      arr.push(4)
      expect(mst.size()).toBe(3)
    })
  })

  describe('toString', () => {
    it('should format correctly for non-empty tree', () => {
      const mst = new MergeSortTree([3, 1, 4])
      expect(mst.toString()).toBe('MergeSortTree([3, 1, 4])')
    })

    it('should format correctly for empty tree', () => {
      const mst = new MergeSortTree([])
      expect(mst.toString()).toBe('MergeSortTree([])')
    })

    it('should format single element', () => {
      const mst = new MergeSortTree([42])
      expect(mst.toString()).toBe('MergeSortTree([42])')
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const mst1 = new MergeSortTree([3, 1, 4, 1, 5])
      const mst2 = mst1.clone()
      expect(mst2.size()).toBe(mst1.size())
      expect(mst2.toArray()).toEqual(mst1.toArray())
    })

    it('should produce same query results', () => {
      const mst1 = new MergeSortTree([5, 2, 8, 1, 9])
      const mst2 = mst1.clone()
      expect(mst2.countLessThan(0, 4, 5)).toBe(mst1.countLessThan(0, 4, 5))
      expect(mst2.kthSmallest(0, 4, 3)).toBe(mst1.kthSmallest(0, 4, 3))
    })

    it('should clone empty tree', () => {
      const mst1 = new MergeSortTree([])
      const mst2 = mst1.clone()
      expect(mst2.size()).toBe(0)
      expect(mst2.isEmpty()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle single element for all queries', () => {
      const mst = new MergeSortTree([42])
      expect(mst.countLessThan(0, 0, 42)).toBe(0)
      expect(mst.countLessThan(0, 0, 43)).toBe(1)
      expect(mst.countLessThanOrEqual(0, 0, 42)).toBe(1)
      expect(mst.countGreaterThan(0, 0, 42)).toBe(0)
      expect(mst.countGreaterThanOrEqual(0, 0, 42)).toBe(1)
      expect(mst.countInRange(0, 0, 42, 42)).toBe(1)
      expect(mst.kthSmallest(0, 0, 1)).toBe(42)
      expect(mst.rangeMin(0, 0)).toBe(42)
      expect(mst.rangeMax(0, 0)).toBe(42)
    })

    it('should handle two elements', () => {
      const mst = new MergeSortTree([5, 2])
      expect(mst.countLessThan(0, 1, 4)).toBe(1)
      expect(mst.kthSmallest(0, 1, 1)).toBe(2)
      expect(mst.kthSmallest(0, 1, 2)).toBe(5)
    })

    it('should throw for invalid range', () => {
      const mst = new MergeSortTree([1, 2, 3])
      expect(() => mst.countLessThan(-1, 2, 5)).toThrow(RangeError)
      expect(() => mst.countLessThan(0, 5, 5)).toThrow(RangeError)
      expect(() => mst.countLessThan(2, 1, 5)).toThrow(RangeError)
    })

    it('should handle all identical elements', () => {
      const mst = new MergeSortTree([5, 5, 5, 5, 5])
      expect(mst.countLessThan(0, 4, 5)).toBe(0)
      expect(mst.countLessThanOrEqual(0, 4, 5)).toBe(5)
      expect(mst.countGreaterThan(0, 4, 5)).toBe(0)
      expect(mst.countGreaterThanOrEqual(0, 4, 5)).toBe(5)
      expect(mst.countInRange(0, 4, 5, 5)).toBe(5)
      expect(mst.kthSmallest(0, 4, 1)).toBe(5)
      expect(mst.kthSmallest(0, 4, 5)).toBe(5)
    })

    it('should handle array of zeros', () => {
      const mst = new MergeSortTree([0, 0, 0])
      expect(mst.countLessThan(0, 2, 1)).toBe(3)
      expect(mst.countLessThan(0, 2, 0)).toBe(0)
    })
  })

  describe('query consistency', () => {
    it('countLessThan + countGreaterThanOrEqual = range length', () => {
      const mst = new MergeSortTree([3, 1, 4, 1, 5, 9, 2, 6])
      for (let i = 0; i < 8; i++) {
        for (let j = i; j < 8; j++) {
          const val = 4
          expect(mst.countLessThan(i, j, val) + mst.countGreaterThanOrEqual(i, j, val)).toBe(j - i + 1)
        }
      }
    })

    it('countLessThanOrEqual + countGreaterThan = range length', () => {
      const mst = new MergeSortTree([3, 1, 4, 1, 5, 9, 2, 6])
      for (let i = 0; i < 8; i++) {
        for (let j = i; j < 8; j++) {
          const val = 4
          expect(mst.countLessThanOrEqual(i, j, val) + mst.countGreaterThan(i, j, val)).toBe(j - i + 1)
        }
      }
    })

    it('countInRange = countLessThanOrEqual(max) - countLessThan(min)', () => {
      const mst = new MergeSortTree([3, 1, 4, 1, 5, 9, 2, 6])
      const l = 1
      const r = 6
      const minVal = 2
      const maxVal = 5
      expect(mst.countInRange(l, r, minVal, maxVal)).toBe(
        mst.countLessThanOrEqual(l, r, maxVal) - mst.countLessThan(l, r, minVal),
      )
    })
  })

  describe('stress test', () => {
    it('should handle 10000 elements correctly', () => {
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000))
      const mst = new MergeSortTree(arr)

      expect(mst.size()).toBe(10000)

      const l = 100
      const r = 200
      const sub = arr.slice(l, r + 1).sort((a, b) => a - b)

      expect(mst.countLessThan(l, r, 500)).toBe(sub.filter(x => x < 500).length)
      expect(mst.countLessThanOrEqual(l, r, 500)).toBe(sub.filter(x => x <= 500).length)
      expect(mst.countGreaterThan(l, r, 500)).toBe(sub.filter(x => x > 500).length)
      expect(mst.countGreaterThanOrEqual(l, r, 500)).toBe(sub.filter(x => x >= 500).length)
      expect(mst.countInRange(l, r, 200, 800)).toBe(sub.filter(x => x >= 200 && x <= 800).length)
      expect(mst.rangeMin(l, r)).toBe(Math.min(...arr.slice(l, r + 1)))
      expect(mst.rangeMax(l, r)).toBe(Math.max(...arr.slice(l, r + 1)))
    })

    it('should produce correct kthSmallest on large array', () => {
      const arr = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 2000))
      const mst = new MergeSortTree(arr)
      const l = 500
      const r = 1500
      const sub = arr.slice(l, r + 1).sort((a, b) => a - b)

      expect(mst.kthSmallest(l, r, 1)).toBe(sub[0])
      expect(mst.kthSmallest(l, r, sub.length)).toBe(sub[sub.length - 1])
      expect(mst.kthSmallest(l, r, Math.floor(sub.length / 2))).toBe(sub[Math.floor(sub.length / 2) - 1])
    })

    it('should handle multiple random queries on 10000 elements', () => {
      const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10000))
      const mst = new MergeSortTree(arr)

      for (let q = 0; q < 20; q++) {
        const l = Math.floor(Math.random() * 9000)
        const r = l + Math.floor(Math.random() * 999) + 1
        const val = Math.floor(Math.random() * 10000)
        const sub = arr.slice(l, r + 1)

        expect(mst.countLessThan(l, r, val)).toBe(sub.filter(x => x < val).length)
        expect(mst.countLessThanOrEqual(l, r, val)).toBe(sub.filter(x => x <= val).length)
      }
    })
  })

  describe('range boundaries', () => {
    it('should handle leftmost element query', () => {
      const mst = new MergeSortTree([10, 20, 30, 40, 50])
      expect(mst.countLessThan(0, 0, 15)).toBe(1)
      expect(mst.rangeMin(0, 0)).toBe(10)
      expect(mst.rangeMax(0, 0)).toBe(10)
    })

    it('should handle rightmost element query', () => {
      const mst = new MergeSortTree([10, 20, 30, 40, 50])
      expect(mst.countLessThan(4, 4, 55)).toBe(1)
      expect(mst.rangeMin(4, 4)).toBe(50)
      expect(mst.rangeMax(4, 4)).toBe(50)
    })

    it('should handle adjacent elements', () => {
      const mst = new MergeSortTree([10, 20, 30, 40, 50])
      expect(mst.countLessThan(2, 3, 35)).toBe(1)
      expect(mst.countLessThanOrEqual(2, 3, 35)).toBe(1)
      expect(mst.kthSmallest(2, 3, 1)).toBe(30)
      expect(mst.kthSmallest(2, 3, 2)).toBe(40)
    })

    it('should handle full range query', () => {
      const arr = [5, 3, 8, 1, 9, 2, 7, 4, 6]
      const mst = new MergeSortTree(arr)
      expect(mst.rangeMin(0, 8)).toBe(1)
      expect(mst.rangeMax(0, 8)).toBe(9)
      expect(mst.kthSmallest(0, 8, 1)).toBe(1)
      expect(mst.kthSmallest(0, 8, 9)).toBe(9)
    })
  })

  describe('binary search precision', () => {
    it('countLessThan should not count equal elements', () => {
      const mst = new MergeSortTree([1, 2, 3, 4, 5])
      expect(mst.countLessThan(0, 4, 3)).toBe(2)
    })

    it('countLessThanOrEqual should count equal elements', () => {
      const mst = new MergeSortTree([1, 2, 3, 4, 5])
      expect(mst.countLessThanOrEqual(0, 4, 3)).toBe(3)
    })

    it('countGreaterThan should not count equal elements', () => {
      const mst = new MergeSortTree([1, 2, 3, 4, 5])
      expect(mst.countGreaterThan(0, 4, 3)).toBe(2)
    })

    it('countGreaterThanOrEqual should count equal elements', () => {
      const mst = new MergeSortTree([1, 2, 3, 4, 5])
      expect(mst.countGreaterThanOrEqual(0, 4, 3)).toBe(3)
    })

    it('should handle value between elements', () => {
      const mst = new MergeSortTree([1, 3, 5, 7, 9])
      expect(mst.countLessThan(0, 4, 4)).toBe(2)
      expect(mst.countLessThanOrEqual(0, 4, 4)).toBe(2)
      expect(mst.countGreaterThan(0, 4, 4)).toBe(3)
      expect(mst.countGreaterThanOrEqual(0, 4, 4)).toBe(3)
    })

    it('should handle value below minimum', () => {
      const mst = new MergeSortTree([5, 10, 15])
      expect(mst.countLessThan(0, 2, 1)).toBe(0)
      expect(mst.countGreaterThanOrEqual(0, 2, 1)).toBe(3)
    })

    it('should handle value above maximum', () => {
      const mst = new MergeSortTree([5, 10, 15])
      expect(mst.countLessThanOrEqual(0, 2, 100)).toBe(3)
      expect(mst.countGreaterThan(0, 2, 100)).toBe(0)
    })

    it('countInRange with tight bounds on single element', () => {
      const mst = new MergeSortTree([10, 20, 30, 40, 50])
      expect(mst.countInRange(2, 2, 30, 30)).toBe(1)
      expect(mst.countInRange(2, 2, 31, 31)).toBe(0)
    })
  })

  describe('mixed value types', () => {
    it('should handle mix of positive and negative', () => {
      const mst = new MergeSortTree([-3, 5, -1, 7, 0, -8, 4])
      expect(mst.countLessThan(0, 6, 0)).toBe(3)
      expect(mst.countGreaterThan(0, 6, 0)).toBe(3)
      expect(mst.countInRange(0, 6, -1, 5)).toBe(4)
    })

    it('should handle large positive values', () => {
      const mst = new MergeSortTree([1000000, 500000, 750000, 250000])
      expect(mst.countLessThan(0, 3, 600000)).toBe(2)
      expect(mst.kthSmallest(0, 3, 1)).toBe(250000)
    })

    it('should handle large negative values', () => {
      const mst = new MergeSortTree([-1000000, -500000, -750000, -250000])
      expect(mst.countLessThan(0, 3, -600000)).toBe(2)
      expect(mst.rangeMax(0, 3)).toBe(-250000)
    })
  })
})
