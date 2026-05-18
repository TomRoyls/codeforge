import { describe, it, expect, beforeEach } from 'vitest'
import { KDTree3 } from '../../src/core/kd-tree-3/index.js'

describe('KDTree3', () => {
  let tree: KDTree3

  beforeEach(() => {
    tree = new KDTree3()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create empty tree', () => {
      const t = new KDTree3()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept initial points', () => {
      const t = new KDTree3([[1, 2], [3, 4], [5, 6]])
      expect(t.size()).toBe(3)
      expect(t.isEmpty()).toBe(false)
    })

    it('should accept k parameter', () => {
      const t = new KDTree3([[1, 2, 3], [4, 5, 6]], 3)
      expect(t.size()).toBe(2)
      expect(t.contains([1, 2, 3])).toBe(true)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single point', () => {
      tree.insert([1, 2])
      expect(tree.size()).toBe(1)
      expect(tree.contains([1, 2])).toBe(true)
    })

    it('should insert multiple points', () => {
      tree.insert([1, 2])
      tree.insert([3, 4])
      tree.insert([5, 6])
      expect(tree.size()).toBe(3)
    })

    it('should insert duplicate points', () => {
      tree.insert([1, 2])
      tree.insert([1, 2])
      expect(tree.size()).toBe(2)
    })

    it('should insert negative coordinates', () => {
      tree.insert([-1, -2])
      expect(tree.contains([-1, -2])).toBe(true)
    })
  })

  // ─── contains ───

  describe('contains', () => {
    it('should find existing point', () => {
      tree.insert([3, 5])
      expect(tree.contains([3, 5])).toBe(true)
    })

    it('should not find missing point', () => {
      tree.insert([3, 5])
      expect(tree.contains([1, 1])).toBe(false)
    })

    it('should return false for empty tree', () => {
      expect(tree.contains([0, 0])).toBe(false)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('should remove an existing point', () => {
      tree.insert([1, 2])
      tree.insert([3, 4])
      expect(tree.remove([1, 2])).toBe(true)
      expect(tree.contains([1, 2])).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('should return false for missing point', () => {
      expect(tree.remove([1, 2])).toBe(false)
    })

    it('should handle removing root', () => {
      tree.insert([2, 3])
      expect(tree.remove([2, 3])).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle removing from single node tree', () => {
      tree.insert([5, 5])
      expect(tree.remove([5, 5])).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should maintain tree after multiple removals', () => {
      const points = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
      for (const p of points) tree.insert(p)
      tree.remove([3, 3])
      tree.remove([1, 1])
      expect(tree.contains([2, 2])).toBe(true)
      expect(tree.contains([4, 4])).toBe(true)
      expect(tree.contains([5, 5])).toBe(true)
      expect(tree.size()).toBe(3)
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
      expect(tree.kNearestNeighbors([0, 0], -1)).toEqual([])
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

    it('should return all points if k exceeds size', () => {
      tree.insert([1, 1])
      tree.insert([2, 2])
      const result = tree.kNearestNeighbors([0, 0], 10)
      expect(result).toHaveLength(2)
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

  // ─── size/isEmpty/clear ───

  describe('size, isEmpty, clear', () => {
    it('should track size', () => {
      expect(tree.size()).toBe(0)
      tree.insert([1, 1])
      expect(tree.size()).toBe(1)
      tree.insert([2, 2])
      expect(tree.size()).toBe(2)
    })

    it('should track isEmpty', () => {
      expect(tree.isEmpty()).toBe(true)
      tree.insert([1, 1])
      expect(tree.isEmpty()).toBe(false)
    })

    it('should clear the tree', () => {
      tree.insert([1, 1])
      tree.insert([2, 2])
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.contains([1, 1])).toBe(false)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return all points', () => {
      tree.insert([3, 3])
      tree.insert([1, 1])
      tree.insert([2, 2])
      const arr = tree.toArray()
      expect(arr).toHaveLength(3)
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
})
