import { describe, expect, it } from 'vitest'
import { KDTree } from '../../../src/utils/k-d-tree.js'

describe('KDTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = new KDTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.dimensions).toBe(2)
    })

    it('creates tree from points', () => {
      const tree = new KDTree([[1, 2], [3, 4], [5, 6]])
      expect(tree.size).toBe(3)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.dimensions).toBe(2)
    })

    it('infers k from points', () => {
      const tree = new KDTree([[1, 2, 3], [4, 5, 6]])
      expect(tree.dimensions).toBe(3)
    })

    it('uses explicit k parameter', () => {
      const tree = new KDTree([], 4)
      expect(tree.dimensions).toBe(4)
    })

    it('explicit k overrides inferred k', () => {
      const tree = new KDTree([[1, 2], [3, 4]], 5)
      expect(tree.dimensions).toBe(5)
    })
  })

  describe('fromPoints', () => {
    it('creates tree from static method', () => {
      const tree = KDTree.fromPoints([[1, 2], [3, 4]])
      expect(tree.size).toBe(2)
      expect(tree.isEmpty()).toBe(false)
    })

    it('creates empty tree', () => {
      const tree = KDTree.fromPoints([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('uses explicit k', () => {
      const tree = KDTree.fromPoints([[1, 2]], 3)
      expect(tree.dimensions).toBe(3)
    })
  })

  describe('insert', () => {
    it('inserts single point', () => {
      const tree = new KDTree()
      tree.insert([1, 2])
      expect(tree.size).toBe(1)
      expect(tree.contains([1, 2])).toBe(true)
    })

    it('inserts multiple points', () => {
      const tree = new KDTree()
      tree.insert([1, 2])
      tree.insert([3, 4])
      tree.insert([5, 6])
      expect(tree.size).toBe(3)
    })

    it('infers k from first insert', () => {
      const tree = new KDTree([], 2)
      tree.insert([1, 2, 3])
      expect(tree.dimensions).toBe(3)
    })

    it('inserts duplicate points', () => {
      const tree = new KDTree()
      tree.insert([1, 2])
      tree.insert([1, 2])
      expect(tree.size).toBe(2)
    })

    it('inserts 3D points', () => {
      const tree = new KDTree()
      tree.insert([1, 2, 3])
      tree.insert([4, 5, 6])
      expect(tree.size).toBe(2)
      expect(tree.dimensions).toBe(3)
    })
  })

  describe('remove', () => {
    it('removes existing point', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      const result = tree.remove([1, 2])
      expect(result).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.contains([1, 2])).toBe(false)
    })

    it('removes non-existing point', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      const result = tree.remove([5, 6])
      expect(result).toBe(false)
      expect(tree.size).toBe(2)
    })

    it('removes from empty tree', () => {
      const tree = new KDTree()
      const result = tree.remove([1, 2])
      expect(result).toBe(false)
    })

    it('removes last point', () => {
      const tree = new KDTree([[1, 2]])
      tree.remove([1, 2])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('removes 3D point', () => {
      const tree = new KDTree([[1, 2, 3], [4, 5, 6]])
      const result = tree.remove([1, 2, 3])
      expect(result).toBe(true)
      expect(tree.size).toBe(1)
    })
  })

  describe('contains', () => {
    it('finds existing point', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      expect(tree.contains([1, 2])).toBe(true)
      expect(tree.contains([3, 4])).toBe(true)
    })

    it('returns false for non-existing point', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      expect(tree.contains([5, 6])).toBe(false)
    })

    it('returns false for empty tree', () => {
      const tree = new KDTree()
      expect(tree.contains([1, 2])).toBe(false)
    })

    it('finds 3D point', () => {
      const tree = new KDTree([[1, 2, 3]])
      expect(tree.contains([1, 2, 3])).toBe(true)
    })
  })

  describe('nearestNeighbor', () => {
    it('finds nearest neighbor', () => {
      const tree = new KDTree([[1, 1], [2, 2], [5, 5]])
      const nearest = tree.nearestNeighbor([3, 3])
      expect(nearest).toEqual([2, 2])
    })

    it('returns null for empty tree', () => {
      const tree = new KDTree()
      const nearest = tree.nearestNeighbor([1, 1])
      expect(nearest).toBe(null)
    })

    it('finds nearest among multiple points', () => {
      const tree = new KDTree([[0, 0], [10, 0], [5, 5], [5, -5]])
      const nearest = tree.nearestNeighbor([4, 0])
      expect(nearest).toEqual([0, 0])
    })

    it('works with 3D points', () => {
      const tree = new KDTree([[1, 1, 1], [3, 3, 3], [5, 5, 5]])
      const nearest = tree.nearestNeighbor([2, 2, 2])
      expect(nearest).toEqual([3, 3, 3])
    })

    it('finds exact match', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const nearest = tree.nearestNeighbor([1, 1])
      expect(nearest).toEqual([1, 1])
    })
  })

  describe('kNearestNeighbors', () => {
    it('finds single nearest neighbor', () => {
      const tree = new KDTree([[1, 1], [2, 2], [5, 5]])
      const nearest = tree.kNearestNeighbors([3, 3], 1)
      expect(nearest).toEqual([[2, 2]])
    })

    it('finds k nearest neighbors', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3], [5, 5], [6, 6]])
      const nearest = tree.kNearestNeighbors([4, 4], 3)
      expect(nearest.length).toBe(3)
      expect(nearest).toContainEqual([3, 3])
      expect(nearest).toContainEqual([5, 5])
    })

    it('returns empty for k=0', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const nearest = tree.kNearestNeighbors([1, 1], 0)
      expect(nearest).toEqual([])
    })

    it('returns empty for empty tree', () => {
      const tree = new KDTree()
      const nearest = tree.kNearestNeighbors([1, 1], 3)
      expect(nearest).toEqual([])
    })

    it('handles k larger than size', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const nearest = tree.kNearestNeighbors([1, 1], 5)
      expect(nearest.length).toBe(2)
    })

    it('returns sorted by distance', () => {
      const tree = new KDTree([[0, 0], [5, 5], [10, 10]])
      const nearest = tree.kNearestNeighbors([2, 2], 3)
      expect(nearest).toEqual([[0, 0], [5, 5], [10, 10]])
    })
  })

  describe('rangeSearch', () => {
    it('finds points in range', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3], [5, 5], [6, 6]])
      const results = tree.rangeSearch([1.5, 1.5], [4.5, 4.5])
      expect(results).toContainEqual([2, 2])
      expect(results).toContainEqual([3, 3])
      expect(results).not.toContainEqual([1, 1])
      expect(results).not.toContainEqual([5, 5])
    })

    it('returns empty for no matches', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const results = tree.rangeSearch([10, 10], [20, 20])
      expect(results).toEqual([])
    })

    it('returns empty for empty tree', () => {
      const tree = new KDTree()
      const results = tree.rangeSearch([0, 0], [10, 10])
      expect(results).toEqual([])
    })

    it('finds all points when range covers all', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      const results = tree.rangeSearch([0, 0], [10, 10])
      expect(results.length).toBe(3)
    })

    it('works with 3D points', () => {
      const tree = new KDTree([[1, 1, 1], [2, 2, 2], [3, 3, 3], [5, 5, 5]])
      const results = tree.rangeSearch([1.5, 1.5, 1.5], [2.5, 2.5, 2.5])
      expect(results).toContainEqual([2, 2, 2])
    })

    it('finds points on boundary', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      const results = tree.rangeSearch([1, 1], [2, 2])
      expect(results).toContainEqual([1, 1])
      expect(results).toContainEqual([2, 2])
      expect(results).not.toContainEqual([3, 3])
    })
  })

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new KDTree()
      expect(tree.size).toBe(0)
    })

    it('returns correct size', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.size).toBe(3)
    })

    it('updates after insert', () => {
      const tree = new KDTree([[1, 1]])
      tree.insert([2, 2])
      expect(tree.size).toBe(2)
    })

    it('updates after remove', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      tree.remove([1, 1])
      expect(tree.size).toBe(1)
    })

    it('updates after clear', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty tree', () => {
      const tree = new KDTree()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false for non-empty tree', () => {
      const tree = new KDTree([[1, 1]])
      expect(tree.isEmpty()).toBe(false)
    })

    it('returns true after clearing', () => {
      const tree = new KDTree([[1, 1]])
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const tree = new KDTree()
      tree.insert([1, 1])
      expect(tree.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all points', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('clears empty tree', () => {
      const tree = new KDTree()
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('allows inserts after clear', () => {
      const tree = new KDTree([[1, 1]])
      tree.clear()
      tree.insert([2, 2])
      expect(tree.size).toBe(1)
      expect(tree.contains([2, 2])).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns all points', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      const points = tree.toArray()
      expect(points.length).toBe(3)
      expect(points).toContainEqual([1, 1])
      expect(points).toContainEqual([2, 2])
      expect(points).toContainEqual([3, 3])
    })

    it('returns empty array for empty tree', () => {
      const tree = new KDTree()
      const points = tree.toArray()
      expect(points).toEqual([])
    })

    it('returns sorted (in-order traversal)', () => {
      const tree = new KDTree([[3, 3], [1, 1], [2, 2]])
      const points = tree.toArray()
      expect(points).toEqual([[1, 1], [2, 2], [3, 3]])
    })

    it('works with 3D points', () => {
      const tree = new KDTree([[1, 1, 1], [2, 2, 2]])
      const points = tree.toArray()
      expect(points).toContainEqual([1, 1, 1])
      expect(points).toContainEqual([2, 2, 2])
    })
  })

  describe('dimensions', () => {
    it('returns default 2 for empty tree', () => {
      const tree = new KDTree()
      expect(tree.dimensions).toBe(2)
    })

    it('returns inferred dimensions', () => {
      const tree = new KDTree([[1, 2, 3, 4]])
      expect(tree.dimensions).toBe(4)
    })

    it('returns explicit k', () => {
      const tree = new KDTree([[1, 2]], 5)
      expect(tree.dimensions).toBe(5)
    })
  })
})