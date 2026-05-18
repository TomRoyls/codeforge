import { describe, it, expect } from 'vitest'
import { CartesianTree3 } from '../../src/core/cartesian-tree-3/index.js'

describe('CartesianTree3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })
  })

  // ─── buildFromArray() ───
  describe('buildFromArray', () => {
    it('builds tree from array and updates size', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 2, 8, 1, 9])
      expect(tree.size).toBe(5)
      expect(tree.isEmpty).toBe(false)
    })

    it('builds tree from single element', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([42])
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('handles empty array by clearing the tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      tree.buildFromArray([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('builds tree from duplicate values', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([3, 3, 3])
      expect(tree.size).toBe(3)
    })

    it('builds tree from negative values', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([-5, -1, -3, -2])
      expect(tree.size).toBe(4)
    })

    it('builds tree from sorted ascending array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      expect(tree.size).toBe(5)
      expect(tree.inorderTraversal()).toEqual([1, 2, 3, 4, 5])
    })

    it('builds tree from sorted descending array', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 4, 3, 2, 1])
      expect(tree.size).toBe(5)
      expect(tree.inorderTraversal()).toEqual([5, 4, 3, 2, 1])
    })
  })

  // ─── inorderTraversal() ───
  describe('inorderTraversal', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.inorderTraversal()).toEqual([])
    })

    it('returns values in inorder for single element', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([10])
      expect(tree.inorderTraversal()).toEqual([10])
    })

    it('preserves insertion order via inorder traversal', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([3, 1, 4, 1, 5])
      expect(tree.inorderTraversal()).toEqual([3, 1, 4, 1, 5])
    })

    it('returns correct inorder for tree built from array', () => {
      const tree = new CartesianTree3<string>()
      tree.buildFromArray(['c', 'a', 'b'])
      expect(tree.inorderTraversal()).toEqual(['c', 'a', 'b'])
    })
  })

  // ─── preorderTraversal() ───
  describe('preorderTraversal', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.preorderTraversal()).toEqual([])
    })

    it('returns single element for single-node tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([7])
      expect(tree.preorderTraversal()).toEqual([7])
    })

    it('returns correct preorder for tree with minimum as root', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 5, 3])
      expect(tree.preorderTraversal()[0]).toBe(1)
    })

    it('returns all elements', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([4, 2, 6, 1, 3])
      expect(tree.preorderTraversal()).toHaveLength(5)
    })
  })

  // ─── rangeQuery() ───
  describe('rangeQuery', () => {
    it('returns empty array for empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.rangeQuery(1, 10)).toEqual([])
    })

    it('returns values within range', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      const result = tree.rangeQuery(2, 4)
      expect(result.sort((a, b) => a - b)).toEqual([2, 3, 4])
    })

    it('returns single value when only one matches', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 5, 10])
      const result = tree.rangeQuery(4, 6)
      expect(result).toEqual([5])
    })

    it('returns empty array when no values match', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.rangeQuery(10, 20)).toEqual([])
    })

    it('handles range matching all values', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      const result = tree.rangeQuery(0, 10)
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    })

    it('handles single-value range', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      const result = tree.rangeQuery(3, 3)
      expect(result).toEqual([3])
    })
  })

  // ─── findMin() ───
  describe('findMin', () => {
    it('returns undefined for empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.findMin()).toBeUndefined()
    })

    it('returns the only value for single-element tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([42])
      expect(tree.findMin()).toBe(42)
    })

    it('returns leftmost node value (first element)', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 2, 8, 1, 9])
      expect(tree.findMin()).toBe(5)
    })

    it('handles negative values', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([-3, -7, 0, -2])
      expect(tree.findMin()).toBe(-3)
    })
  })

  // ─── findMax() ───
  describe('findMax', () => {
    it('returns undefined for empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.findMax()).toBeUndefined()
    })

    it('returns the only value for single-element tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([42])
      expect(tree.findMax()).toBe(42)
    })

    it('returns rightmost node value (last element)', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 2, 8, 1, 9])
      expect(tree.findMax()).toBe(9)
    })

    it('handles negative values', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([-5, -1, -3, -2])
      expect(tree.findMax()).toBe(-2)
    })
  })

  // ─── kthSmallest() ───
  describe('kthSmallest', () => {
    it('returns undefined for empty tree', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.kthSmallest(0)).toBeUndefined()
    })

    it('returns undefined for negative k', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.kthSmallest(-1)).toBeUndefined()
    })

    it('returns undefined for k >= size', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      expect(tree.kthSmallest(3)).toBeUndefined()
    })

    it('returns kth element in inorder (original order)', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([5, 2, 8, 1, 9])
      expect(tree.kthSmallest(0)).toBe(5)
      expect(tree.kthSmallest(1)).toBe(2)
      expect(tree.kthSmallest(2)).toBe(8)
      expect(tree.kthSmallest(3)).toBe(1)
      expect(tree.kthSmallest(4)).toBe(9)
    })

    it('returns only element for k=0 on single-element tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([7])
      expect(tree.kthSmallest(0)).toBe(7)
    })
  })

  // ─── clear() ───
  describe('clear', () => {
    it('empties a populated tree', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3])
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
      expect(tree.inorderTraversal()).toEqual([])
    })

    it('is safe to call on empty tree', () => {
      const tree = new CartesianTree3<number>()
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  // ─── getTimeComplexity() ───
  describe('getTimeComplexity', () => {
    it('returns complexity string', () => {
      const tree = new CartesianTree3<number>()
      expect(tree.getTimeComplexity()).toBe('Build: O(n), Query: O(log n), Worst: O(n)')
    })
  })

  // ─── size / isEmpty ───
  describe('size and isEmpty', () => {
    it('size reflects buildFromArray', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1, 2, 3, 4, 5])
      expect(tree.size).toBe(5)
      expect(tree.isEmpty).toBe(false)
    })

    it('isEmpty is true after clear', () => {
      const tree = new CartesianTree3<number>()
      tree.buildFromArray([1])
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })
  })
})
