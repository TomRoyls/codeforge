import { describe, it, expect } from 'vitest'
import { SegmentTree } from '../../src/core/segment-tree-3/index.js'

describe('SegmentTree', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create a tree from a single-element array', () => {
      const tree = new SegmentTree([5])
      expect(tree.getSize()).toBe(1)
      expect(tree.toArray()).toEqual([5])
    })

    it('should create a tree from a multi-element array', () => {
      const tree = new SegmentTree([1, 2, 3, 4])
      expect(tree.getSize()).toBe(4)
      expect(tree.toArray()).toEqual([1, 2, 3, 4])
    })

    it('should throw on empty array', () => {
      expect(() => new SegmentTree([])).toThrow('Cannot create segment tree from empty array')
    })

    it('should not mutate the original array', () => {
      const original = [1, 2, 3]
      const tree = new SegmentTree(original)
      original[0] = 99
      expect(tree.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── query ───

  describe('query', () => {
    it('should return sum of entire array', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.query(0, 4)).toBe(15)
    })

    it('should return sum of a single element', () => {
      const tree = new SegmentTree([10, 20, 30])
      expect(tree.query(1, 1)).toBe(20)
    })

    it('should return sum of a sub-range', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.query(1, 3)).toBe(9)
    })

    it('should return the element value for single-element range at start', () => {
      const tree = new SegmentTree([10, 20, 30])
      expect(tree.query(0, 0)).toBe(10)
    })

    it('should return the element value for single-element range at end', () => {
      const tree = new SegmentTree([10, 20, 30])
      expect(tree.query(2, 2)).toBe(30)
    })

    it('should throw RangeError for start < 0', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(() => tree.query(-1, 2)).toThrow(RangeError)
    })

    it('should throw RangeError for end >= size', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(() => tree.query(0, 3)).toThrow(RangeError)
    })

    it('should throw RangeError for start > end', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(() => tree.query(2, 1)).toThrow(RangeError)
    })

    it('should handle array with single element', () => {
      const tree = new SegmentTree([42])
      expect(tree.query(0, 0)).toBe(42)
    })

    it('should handle negative values', () => {
      const tree = new SegmentTree([-1, -2, -3])
      expect(tree.query(0, 2)).toBe(-6)
    })

    it('should handle zeros', () => {
      const tree = new SegmentTree([0, 0, 0, 0])
      expect(tree.query(0, 3)).toBe(0)
    })
  })

  // ─── rangeQuery ───

  describe('rangeQuery', () => {
    it('should behave identically to query', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.rangeQuery(1, 3)).toBe(tree.query(1, 3))
    })

    it('should throw RangeError for invalid range', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(() => tree.rangeQuery(-1, 1)).toThrow(RangeError)
    })
  })

  // ─── update ───

  describe('update', () => {
    it('should update a single value', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, 10)
      expect(tree.toArray()).toEqual([1, 2, 10, 4, 5])
    })

    it('should reflect updated value in queries', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(0, 10)
      expect(tree.query(0, 4)).toBe(24)
    })

    it('should update first element', () => {
      const tree = new SegmentTree([1, 2, 3])
      tree.update(0, 100)
      expect(tree.query(0, 0)).toBe(100)
    })

    it('should update last element', () => {
      const tree = new SegmentTree([1, 2, 3])
      tree.update(2, 100)
      expect(tree.query(2, 2)).toBe(100)
    })

    it('should throw RangeError for negative index', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(() => tree.update(-1, 5)).toThrow(RangeError)
    })

    it('should throw RangeError for out-of-bounds index', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(() => tree.update(3, 5)).toThrow(RangeError)
    })

    it('should handle updating to the same value', () => {
      const tree = new SegmentTree([1, 2, 3])
      tree.update(1, 2)
      expect(tree.toArray()).toEqual([1, 2, 3])
      expect(tree.query(0, 2)).toBe(6)
    })

    it('should handle multiple updates', () => {
      const tree = new SegmentTree([1, 2, 3, 4])
      tree.update(0, 10)
      tree.update(3, 40)
      expect(tree.query(0, 3)).toBe(55)
      expect(tree.toArray()).toEqual([10, 2, 3, 40])
    })

    it('should handle updating to zero', () => {
      const tree = new SegmentTree([1, 2, 3])
      tree.update(1, 0)
      expect(tree.query(0, 2)).toBe(4)
    })

    it('should handle updating to negative', () => {
      const tree = new SegmentTree([1, 2, 3])
      tree.update(1, -5)
      expect(tree.query(0, 2)).toBe(-1)
    })
  })

  // ─── getSize ───

  describe('getSize', () => {
    it('should return correct size', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(tree.getSize()).toBe(3)
    })

    it('should return 1 for single-element array', () => {
      const tree = new SegmentTree([1])
      expect(tree.getSize()).toBe(1)
    })

    it('should not change after update', () => {
      const tree = new SegmentTree([1, 2, 3])
      tree.update(0, 99)
      expect(tree.getSize()).toBe(3)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return a copy of the original data', () => {
      const tree = new SegmentTree([1, 2, 3])
      const arr = tree.toArray()
      arr[0] = 99
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('should reflect updates', () => {
      const tree = new SegmentTree([1, 2, 3])
      tree.update(1, 20)
      expect(tree.toArray()).toEqual([1, 20, 3])
    })
  })

  // ─── getTreeArray ───

  describe('getTreeArray', () => {
    it('should return a non-empty array', () => {
      const tree = new SegmentTree([1, 2, 3])
      const internal = tree.getTreeArray()
      expect(internal.length).toBeGreaterThan(0)
    })

    it('should return a copy', () => {
      const tree = new SegmentTree([1, 2, 3])
      const arr1 = tree.getTreeArray()
      const arr2 = tree.getTreeArray()
      expect(arr1).toEqual(arr2)
      arr1[0] = 999
      expect(tree.getTreeArray()).not.toEqual(arr1)
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return the complexity string', () => {
      const tree = new SegmentTree([1])
      const complexity = tree.getTimeComplexity()
      expect(complexity).toContain('Build: O(n)')
      expect(complexity).toContain('Query: O(log n)')
      expect(complexity).toContain('Update: O(log n)')
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle array of all same values', () => {
      const tree = new SegmentTree([5, 5, 5, 5])
      expect(tree.query(0, 3)).toBe(20)
      tree.update(2, 10)
      expect(tree.query(0, 3)).toBe(25)
    })

    it('should handle large values', () => {
      const tree = new SegmentTree([1000000, 2000000, 3000000])
      expect(tree.query(0, 2)).toBe(6000000)
    })

    it('should handle mixed positive and negative values', () => {
      const tree = new SegmentTree([-5, 10, -3, 8])
      expect(tree.query(0, 3)).toBe(10)
      expect(tree.query(0, 1)).toBe(5)
      expect(tree.query(2, 3)).toBe(5)
    })

    it('should handle two-element array', () => {
      const tree = new SegmentTree([3, 7])
      expect(tree.query(0, 0)).toBe(3)
      expect(tree.query(1, 1)).toBe(7)
      expect(tree.query(0, 1)).toBe(10)
    })

    it('should handle power-of-two sized array', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5, 6, 7, 8])
      expect(tree.query(0, 7)).toBe(36)
      expect(tree.query(3, 5)).toBe(15)
    })
  })
})
