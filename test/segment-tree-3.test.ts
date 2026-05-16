import { describe, it, expect } from 'vitest'
import { SegmentTree } from './src/core/segment-tree-3/index.js'

describe('SegmentTree', () => {
  describe('constructor', () => {
    it('throws error for empty array', () => {
      expect(() => new SegmentTree([])).toThrow('Cannot create segment tree from empty array')
    })

    it('creates tree from single element', () => {
      const tree = new SegmentTree([5])
      expect(tree.getSize()).toBe(1)
      expect(tree.toArray()).toEqual([5])
    })

    it('creates tree from multiple elements', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.getSize()).toBe(5)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates tree from large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new SegmentTree(arr)
      expect(tree.getSize()).toBe(1000)
      expect(tree.toArray()).toEqual(arr)
    })
  })

  describe('query', () => {
    it('throws error for invalid start index', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(() => tree.query(-1, 3)).toThrow('Invalid query range')
    })

    it('throws error for invalid end index', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(() => tree.query(0, 5)).toThrow('Invalid query range')
    })

    it('throws error for invalid range (start > end)', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(() => tree.query(3, 2)).toThrow('Invalid query range')
    })

    it('returns sum of single element', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.query(0, 0)).toBe(1)
      expect(tree.query(2, 2)).toBe(3)
      expect(tree.query(4, 4)).toBe(5)
    })

    it('returns sum of partial range', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.query(0, 2)).toBe(6)
      expect(tree.query(1, 3)).toBe(9)
      expect(tree.query(2, 4)).toBe(12)
    })

    it('returns sum of full range', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.query(0, 4)).toBe(15)
    })

    it('handles negative numbers', () => {
      const tree = new SegmentTree([-1, -2, -3, -4, -5])
      expect(tree.query(0, 4)).toBe(-15)
      expect(tree.query(1, 3)).toBe(-9)
    })

    it('handles mixed positive and negative numbers', () => {
      const tree = new SegmentTree([-1, 2, -3, 4, -5])
      expect(tree.query(0, 4)).toBe(-3)
      expect(tree.query(1, 3)).toBe(3)
    })

    it('handles zeros', () => {
      const tree = new SegmentTree([0, 0, 0, 0, 0])
      expect(tree.query(0, 4)).toBe(0)
      expect(tree.query(1, 3)).toBe(0)
    })

    it('handles large numbers', () => {
      const tree = new SegmentTree([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])
      expect(tree.query(0, 1)).toBe(Number.MAX_SAFE_INTEGER * 2)
    })
  })

  describe('rangeQuery', () => {
    it('throws error for invalid start index', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(() => tree.rangeQuery(-1, 3)).toThrow('Invalid query range')
    })

    it('throws error for invalid end index', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(() => tree.rangeQuery(0, 5)).toThrow('Invalid query range')
    })

    it('throws error for invalid range (start > end)', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(() => tree.rangeQuery(3, 2)).toThrow('Invalid query range')
    })

    it('returns same results as query', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.rangeQuery(0, 4)).toBe(tree.query(0, 4))
      expect(tree.rangeQuery(1, 3)).toBe(tree.query(1, 3))
      expect(tree.rangeQuery(0, 2)).toBe(tree.query(0, 2))
    })
  })

  describe('update', () => {
    it('throws error for out of bounds index', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(() => tree.update(-1, 10)).toThrow('Index -1 out of bounds')
      expect(() => tree.update(5, 10)).toThrow('Index 5 out of bounds')
    })

    it('updates single element', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, 10)
      expect(tree.toArray()).toEqual([1, 2, 10, 4, 5])
      expect(tree.query(0, 4)).toBe(22)
    })

    it('updates to same value', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, 3)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(tree.query(0, 4)).toBe(15)
    })

    it('updates first element', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(0, 10)
      expect(tree.toArray()).toEqual([10, 2, 3, 4, 5])
      expect(tree.query(0, 4)).toBe(24)
    })

    it('updates last element', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(4, 10)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 10])
      expect(tree.query(0, 4)).toBe(20)
    })

    it('updates to zero', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, 0)
      expect(tree.toArray()).toEqual([1, 2, 0, 4, 5])
      expect(tree.query(0, 4)).toBe(12)
    })

    it('updates to negative value', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, -10)
      expect(tree.toArray()).toEqual([1, 2, -10, 4, 5])
      expect(tree.query(0, 4)).toBe(2)
    })

    it('handles multiple consecutive updates', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(0, 10)
      expect(tree.query(0, 4)).toBe(24)
      tree.update(1, 20)
      expect(tree.query(0, 4)).toBe(42)
      tree.update(2, 30)
      expect(tree.query(0, 4)).toBe(69)
      tree.update(3, 40)
      expect(tree.query(0, 4)).toBe(105)
      tree.update(4, 50)
      expect(tree.query(0, 4)).toBe(150)
    })

    it('maintains correct queries after update', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, 10)
      expect(tree.query(0, 2)).toBe(13)
      expect(tree.query(1, 3)).toBe(16)
      expect(tree.query(2, 4)).toBe(19)
      expect(tree.query(0, 4)).toBe(22)
    })
  })

  describe('getSize', () => {
    it('returns correct size for single element', () => {
      const tree = new SegmentTree([1])
      expect(tree.getSize()).toBe(1)
    })

    it('returns correct size for multiple elements', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.getSize()).toBe(5)
    })

    it('returns correct size for large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new SegmentTree(arr)
      expect(tree.getSize()).toBe(1000)
    })
  })

  describe('toArray', () => {
    it('returns original array', () => {
      const arr = [1, 2, 3, 4, 5]
      const tree = new SegmentTree(arr)
      expect(tree.toArray()).toEqual(arr)
    })

    it('returns copy, not reference', () => {
      const arr = [1, 2, 3, 4, 5]
      const tree = new SegmentTree(arr)
      const returned = tree.toArray()
      returned[0] = 999
      expect(tree.toArray()).toEqual(arr)
      expect(arr[0]).toBe(1)
    })

    it('reflects updates', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, 10)
      expect(tree.toArray()).toEqual([1, 2, 10, 4, 5])
    })
  })

  describe('getTreeArray', () => {
    it('returns tree structure', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      const treeArray = tree.getTreeArray()
      expect(treeArray.length).toBeGreaterThan(0)
      expect(typeof treeArray[0]).toBe('number')
    })

    it('returns copy, not reference', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      const returned = tree.getTreeArray()
      const original = returned[0]
      returned[0] = 999
      expect(tree.getTreeArray()[0]).toBe(original)
    })

    it('has root at index 0 with sum of all elements', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      const treeArray = tree.getTreeArray()
      expect(treeArray[0]).toBe(15)
    })

    it('reflects updates', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      const before = tree.getTreeArray()
      tree.update(2, 10)
      const after = tree.getTreeArray()
      expect(before).not.toEqual(after)
      expect(after[0]).toBe(22)
    })
  })

  describe('getTimeComplexity', () => {
    it('returns time complexity string', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.getTimeComplexity()).toBe('Build: O(n), Query: O(log n), Update: O(log n), Space: O(n)')
    })
  })

  describe('integration tests', () => {
    it('handles complex sequence of operations', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      
      expect(tree.query(0, 9)).toBe(55)
      expect(tree.query(0, 4)).toBe(15)
      expect(tree.query(5, 9)).toBe(40)
      
      tree.update(0, 11)
      expect(tree.query(0, 4)).toBe(25)
      
      tree.update(5, 16)
      expect(tree.query(5, 9)).toBe(50)
      
      tree.update(9, 20)
      expect(tree.query(5, 9)).toBe(60)
      
      expect(tree.query(0, 9)).toBe(85)
      expect(tree.toArray()).toEqual([11, 2, 3, 4, 5, 16, 7, 8, 9, 20])
    })

    it('handles large array with many queries and updates', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1)
      const tree = new SegmentTree(arr)
      
      for (let i = 0; i < 100; i++) {
        expect(tree.query(i, i)).toBe(i + 1)
      }
      
      expect(tree.query(0, 99)).toBe(5050)
      
      tree.update(0, 100)
      expect(tree.query(0, 99)).toBe(5149)
      
      tree.update(99, 200)
      expect(tree.query(0, 99)).toBe(5249)
      
      expect(tree.query(0, 0)).toBe(100)
      expect(tree.query(99, 99)).toBe(200)
    })

    it('handles single element tree with all operations', () => {
      const tree = new SegmentTree([5])
      
      expect(tree.getSize()).toBe(1)
      expect(tree.query(0, 0)).toBe(5)
      expect(tree.rangeQuery(0, 0)).toBe(5)
      
      tree.update(0, 10)
      expect(tree.query(0, 0)).toBe(10)
      expect(tree.toArray()).toEqual([10])
      
      expect(tree.getTimeComplexity()).toBe('Build: O(n), Query: O(log n), Update: O(log n), Space: O(n)')
    })

    it('handles boundary queries on even sized arrays', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5, 6])
      
      expect(tree.query(0, 5)).toBe(21)
      expect(tree.query(0, 2)).toBe(6)
      expect(tree.query(3, 5)).toBe(15)
      expect(tree.query(1, 4)).toBe(14)
    })

    it('handles boundary queries on odd sized arrays', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5, 6, 7])
      
      expect(tree.query(0, 6)).toBe(28)
      expect(tree.query(0, 3)).toBe(10)
      expect(tree.query(4, 6)).toBe(18)
      expect(tree.query(1, 5)).toBe(20)
    })

    it('should handle single element tree query after update', () => {
      const tree = new SegmentTree([42])
      expect(tree.query(0, 0)).toBe(42)
      tree.update(0, 100)
      expect(tree.query(0, 0)).toBe(100)
    })

    it('should handle update and rangeQuery consistency', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      tree.update(2, 10)
      expect(tree.rangeQuery(0, 4)).toBe(tree.query(0, 4))
    })
    it('should handle query on single element', () => {
      const tree = new SegmentTree([42])
      expect(tree.query(0, 0)).toBe(42)
    })
  })
})
