import { describe, it, expect, beforeEach } from 'vitest'
import { KDTree4 } from '../../src/core/kd-tree-4/index.js'

describe('KDTree4', () => {
  let tree: KDTree4

  beforeEach(() => {
    tree = new KDTree4()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create empty tree', () => {
      const t = new KDTree4()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should accept initial points', () => {
      const t = new KDTree4([[1, 2], [3, 4], [5, 6]])
      expect(t.size).toBe(3)
      expect(t.isEmpty).toBe(false)
    })

    it('should accept k parameter for 3D', () => {
      const t = new KDTree4([[1, 2, 3], [4, 5, 6]], 3)
      expect(t.size).toBe(2)
      expect(t.contains([1, 2, 3])).toBe(true)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single point', () => {
      tree.insert([1, 2])
      expect(tree.size).toBe(1)
      expect(tree.contains([1, 2])).toBe(true)
    })

    it('should insert multiple points', () => {
      tree.insert([1, 2])
      tree.insert([3, 4])
      tree.insert([5, 6])
      expect(tree.size).toBe(3)
    })

    it('should insert duplicate points', () => {
      tree.insert([1, 2])
      tree.insert([1, 2])
      expect(tree.size).toBe(2)
    })

    it('should insert negative coordinates', () => {
      tree.insert([-5, -10])
      expect(tree.contains([-5, -10])).toBe(true)
    })
  })

  // ─── bulkInsert ───

  describe('bulkInsert', () => {
    it('should insert multiple points at once', () => {
      tree.bulkInsert([[1, 1], [2, 2], [3, 3]])
      expect(tree.size).toBe(3)
    })

    it('should handle empty array', () => {
      tree.bulkInsert([])
      expect(tree.size).toBe(0)
    })
  })

  // ─── search ───

  describe('search', () => {
    it('should find existing point', () => {
      tree.insert([3, 5])
      expect(tree.search([3, 5])).toEqual([3, 5])
    })

    it('should return null for missing point', () => {
      tree.insert([3, 5])
      expect(tree.search([1, 1])).toBeNull()
    })

    it('should return null for empty tree', () => {
      expect(tree.search([0, 0])).toBeNull()
    })
  })

  // ─── contains ───

  describe('contains', () => {
    it('should find existing point', () => {
      tree.insert([3, 5])
      expect(tree.contains([3, 5])).toBe(true)
    })

    it('should not find missing point', () => {
      expect(tree.contains([99, 99])).toBe(false)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should delete an existing point', () => {
      tree.insert([1, 2])
      tree.insert([3, 4])
      expect(tree.delete([1, 2])).toBe(true)
      expect(tree.contains([1, 2])).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('should return false for missing point', () => {
      expect(tree.delete([1, 2])).toBe(false)
    })

    it('should handle deleting from single node tree', () => {
      tree.insert([5, 5])
      expect(tree.delete([5, 5])).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should maintain tree after multiple deletions', () => {
      const points = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
      for (const p of points) tree.insert(p)
      tree.delete([3, 3])
      tree.delete([1, 1])
      expect(tree.contains([2, 2])).toBe(true)
      expect(tree.contains([4, 4])).toBe(true)
      expect(tree.contains([5, 5])).toBe(true)
      expect(tree.size).toBe(3)
    })
  })

  // ─── nearestNeighbor ───

  describe('nearestNeighbor', () => {
    it('should return null for empty tree', () => {
      expect(tree.nearestNeighbor([0, 0])).toBeNull()
    })

    it('should return the only point', () => {
      tree.insert([1, 1])
      expect(tree.nearestNeighbor([0, 0])).toEqual([1, 1])
    })

    it('should find nearest point', () => {
      tree.insert([1, 1])
      tree.insert([5, 5])
      tree.insert([10, 10])
      expect(tree.nearestNeighbor([2, 2])).toEqual([1, 1])
    })

    it('should find exact match', () => {
      tree.insert([3, 4])
      tree.insert([1, 1])
      expect(tree.nearestNeighbor([3, 4])).toEqual([3, 4])
    })
  })

  // ─── kNearestNeighbors ───

  describe('kNearestNeighbors', () => {
    it('should return empty for empty tree', () => {
      expect(tree.kNearestNeighbors([0, 0], 3)).toEqual([])
    })

    it('should return empty for k <= 0', () => {
      tree.insert([1, 1])
      expect(tree.kNearestNeighbors([0, 0], 0)).toEqual([])
    })

    it('should return k nearest points', () => {
      tree.insert([1, 1])
      tree.insert([2, 2])
      tree.insert([5, 5])
      tree.insert([10, 10])
      const result = tree.kNearestNeighbors([0, 0], 2)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual([1, 1])
      expect(result[1]).toEqual([2, 2])
    })
  })

  // ─── rangeSearch ───

  describe('rangeSearch', () => {
    it('should return empty for empty tree', () => {
      expect(tree.rangeSearch([0, 0], [5, 5])).toEqual([])
    })

    it('should find points in range', () => {
      tree.insert([1, 1])
      tree.insert([3, 3])
      tree.insert([5, 5])
      tree.insert([7, 7])
      const result = tree.rangeSearch([2, 2], [6, 6])
      expect(result).toHaveLength(2)
      expect(result).toContainEqual([3, 3])
      expect(result).toContainEqual([5, 5])
    })

    it('should return empty if no points in range', () => {
      tree.insert([10, 10])
      expect(tree.rangeSearch([0, 0], [5, 5])).toEqual([])
    })

    it('should include boundary points', () => {
      tree.insert([0, 0])
      tree.insert([5, 5])
      const result = tree.rangeSearch([0, 0], [5, 5])
      expect(result).toHaveLength(2)
    })
  })

  // ─── min/max ───

  describe('min and max', () => {
    beforeEach(() => {
      tree.insert([3, 7])
      tree.insert([1, 9])
      tree.insert([5, 2])
      tree.insert([7, 4])
    })

    it('should return min for axis 0', () => {
      expect(tree.min(0)).toEqual([1, 9])
    })

    it('should return min for axis 1', () => {
      expect(tree.min(1)).toEqual([5, 2])
    })

    it('should return max for axis 0', () => {
      expect(tree.max(0)).toEqual([7, 4])
    })

    it('should return max for axis 1', () => {
      expect(tree.max(1)).toEqual([1, 9])
    })

    it('should return null for empty tree min', () => {
      const empty = new KDTree4()
      expect(empty.min(0)).toBeNull()
    })

    it('should return null for empty tree max', () => {
      const empty = new KDTree4()
      expect(empty.max(0)).toBeNull()
    })
  })

  // ─── size/isEmpty/clear (getter style) ───

  describe('size, isEmpty, clear', () => {
    it('should track size via getter', () => {
      expect(tree.size).toBe(0)
      tree.insert([1, 1])
      expect(tree.size).toBe(1)
    })

    it('should track isEmpty via getter', () => {
      expect(tree.isEmpty).toBe(true)
      tree.insert([1, 1])
      expect(tree.isEmpty).toBe(false)
    })

    it('should clear the tree', () => {
      tree.insert([1, 1])
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return all points', () => {
      tree.insert([3, 3])
      tree.insert([1, 1])
      tree.insert([2, 2])
      expect(tree.toArray()).toHaveLength(3)
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('should iterate over all points', () => {
      tree.insert([1, 2])
      tree.insert([3, 4])
      const collected: number[][] = []
      tree.forEach(p => collected.push(p))
      expect(collected).toHaveLength(2)
    })

    it('should not call callback for empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return O(1) for empty tree', () => {
      expect(tree.getTimeComplexity()).toBe('O(1)')
    })

    it('should return O(1) for single element', () => {
      tree.insert([1, 1])
      expect(tree.getTimeComplexity()).toBe('O(1)')
    })

    it('should return O(log n) for multiple elements', () => {
      tree.insert([1, 1])
      tree.insert([2, 2])
      expect(tree.getTimeComplexity()).toBe('O(log 2)')
    })
  })
})
