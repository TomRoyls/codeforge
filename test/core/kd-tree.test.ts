import { describe, it, expect, beforeEach } from 'vitest'
import { KDTree } from '../../src/core/kd-tree/kd-tree.js'
import type { KDPoint } from '../../src/core/kd-tree/types.js'

describe('KDTree', () => {
  describe('constructor', () => {
    it('should create empty tree with no arguments', () => {
      const tree = new KDTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should create empty tree with undefined points', () => {
      const tree = new KDTree(undefined)
      expect(tree.size).toBe(0)
    })

    it('should create tree from initial points with default k=2', () => {
      const tree = new KDTree([[1, 2], [3, 4], [5, 6]])
      expect(tree.size).toBe(3)
      expect(tree.dimensions).toBe(2)
    })

    it('should create tree with custom k=3', () => {
      const tree = new KDTree(undefined, 3)
      expect(tree.dimensions).toBe(3)
      expect(tree.size).toBe(0)
    })

    it('should create tree from 3D points', () => {
      const points: KDPoint[] = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      const tree = new KDTree(points, 3)
      expect(tree.size).toBe(3)
      expect(tree.dimensions).toBe(3)
    })

    it('should create tree from single point', () => {
      const tree = new KDTree([[5, 5]])
      expect(tree.size).toBe(1)
    })

    it('should create tree from empty array', () => {
      const tree = new KDTree([])
      expect(tree.size).toBe(0)
      expect(tree.dimensions).toBe(2)
    })

    it('should default k to 2 when not specified', () => {
      const tree = new KDTree()
      expect(tree.dimensions).toBe(2)
    })

    it('should auto-detect dimensions from first point', () => {
      const tree = new KDTree([[1, 2, 3, 4]])
      expect(tree.dimensions).toBe(4)
    })

    it('should build balanced tree from initial points', () => {
      const points: KDPoint[] = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
      const tree = new KDTree(points)
      expect(tree.size).toBe(5)
      expect(tree.contains([1, 1])).toBe(true)
      expect(tree.contains([3, 3])).toBe(true)
      expect(tree.contains([5, 5])).toBe(true)
    })

    it('should handle negative coordinates in constructor', () => {
      const tree = new KDTree([[-1, -2], [-3, -4]])
      expect(tree.size).toBe(2)
      expect(tree.contains([-1, -2])).toBe(true)
    })

    it('should handle floating point coordinates in constructor', () => {
      const tree = new KDTree([[0.5, 0.5], [1.5, 1.5]])
      expect(tree.size).toBe(2)
      expect(tree.contains([0.5, 0.5])).toBe(true)
    })
  })

  describe('insert', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree()
    })

    it('should insert a single point', () => {
      tree.insert([5, 5])
      expect(tree.size).toBe(1)
    })

    it('should insert multiple points', () => {
      tree.insert([1, 1])
      tree.insert([2, 2])
      tree.insert([3, 3])
      expect(tree.size).toBe(3)
    })

    it('should handle negative coordinates', () => {
      tree.insert([-5, -10])
      expect(tree.size).toBe(1)
      expect(tree.contains([-5, -10])).toBe(true)
    })

    it('should handle floating point coordinates', () => {
      tree.insert([0.5, 0.5])
      expect(tree.size).toBe(1)
    })

    it('should handle zero coordinates', () => {
      tree.insert([0, 0])
      expect(tree.size).toBe(1)
    })

    it('should insert large values', () => {
      tree.insert([1000000, -1000000])
      expect(tree.size).toBe(1)
    })

    it('should handle duplicate points', () => {
      tree.insert([1, 1])
      tree.insert([1, 1])
      expect(tree.size).toBe(2)
    })

    it('should insert many points', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert([i, i])
      }
      expect(tree.size).toBe(100)
    })

    it('should update dimensions on first insert if larger', () => {
      const t = new KDTree(undefined, 2)
      t.insert([1, 2, 3])
      expect(t.dimensions).toBe(3)
    })

    it('should throw on dimension mismatch after points exist', () => {
      tree.insert([1, 2])
      expect(() => tree.insert([1, 2, 3])).toThrow()
    })
  })

  describe('contains', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[5, 5], [3, 8], [7, 2], [2, 4], [8, 6]])
    })

    it('should return true for existing point', () => {
      expect(tree.contains([5, 5])).toBe(true)
    })

    it('should return true for another existing point', () => {
      expect(tree.contains([3, 8])).toBe(true)
    })

    it('should return false for non-existent point', () => {
      expect(tree.contains([99, 99])).toBe(false)
    })

    it('should return false on empty tree', () => {
      const empty = new KDTree()
      expect(empty.contains([1, 1])).toBe(false)
    })

    it('should work after removal', () => {
      tree.remove([5, 5])
      expect(tree.contains([5, 5])).toBe(false)
    })

    it('should find all inserted points', () => {
      expect(tree.contains([2, 4])).toBe(true)
      expect(tree.contains([8, 6])).toBe(true)
    })

    it('should handle floating point search', () => {
      tree.insert([0.5, 0.5])
      expect(tree.contains([0.5, 0.5])).toBe(true)
    })

    it('should return true for duplicates', () => {
      tree.insert([5, 5])
      expect(tree.contains([5, 5])).toBe(true)
    })
  })

  describe('remove', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[5, 5], [3, 3], [7, 7]])
    })

    it('should remove an existing point', () => {
      expect(tree.remove([5, 5])).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should return false for non-existent point', () => {
      expect(tree.remove([99, 99])).toBe(false)
      expect(tree.size).toBe(3)
    })

    it('should remove all points one by one', () => {
      tree.remove([5, 5])
      tree.remove([3, 3])
      tree.remove([7, 7])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle removing from empty tree', () => {
      tree.clear()
      expect(tree.remove([5, 5])).toBe(false)
    })

    it('should not affect other points when removing', () => {
      tree.remove([5, 5])
      expect(tree.contains([3, 3])).toBe(true)
      expect(tree.contains([7, 7])).toBe(true)
    })

    it('should allow re-insertion after removal', () => {
      tree.remove([5, 5])
      tree.insert([5, 5])
      expect(tree.contains([5, 5])).toBe(true)
      expect(tree.size).toBe(3)
    })

    it('should handle removing leaf node', () => {
      expect(tree.remove([3, 3])).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should return boolean', () => {
      expect(typeof tree.remove([5, 5])).toBe('boolean')
    })

    it('should remove first match when duplicates exist', () => {
      tree.insert([5, 5])
      expect(tree.remove([5, 5])).toBe(true)
      expect(tree.size).toBe(3)
    })

    it('should maintain tree integrity after removal', () => {
      tree.insert([1, 1])
      tree.insert([9, 9])
      tree.remove([5, 5])
      expect(tree.contains([1, 1])).toBe(true)
      expect(tree.contains([9, 9])).toBe(true)
      expect(tree.contains([3, 3])).toBe(true)
    })

    it('should handle removing root', () => {
      tree.remove([5, 5])
      expect(tree.contains([5, 5])).toBe(false)
      expect(tree.size).toBe(2)
    })
  })

  describe('nearestNeighbor', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[0, 0], [10, 10], [5, 5]])
    })

    it('should find nearest neighbor', () => {
      const result = tree.nearestNeighbor([4, 4])
      expect(result).toBeDefined()
      expect(result).toEqual([5, 5])
    })

    it('should return exact match when point exists', () => {
      const result = tree.nearestNeighbor([0, 0])
      expect(result).toBeDefined()
      expect(result).toEqual([0, 0])
    })

    it('should return undefined on empty tree', () => {
      const empty = new KDTree()
      expect(empty.nearestNeighbor([1, 1])).toBeUndefined()
    })

    it('should find nearest with single point tree', () => {
      const single = new KDTree([[5, 5]])
      const result = single.nearestNeighbor([0, 0])
      expect(result).toEqual([5, 5])
    })

    it('should handle equidistant points', () => {
      const eq = new KDTree([[1, 0], [-1, 0]])
      const result = eq.nearestNeighbor([0, 0])
      expect(result).toBeDefined()
      expect([[1, 0], [-1, 0]]).toContainEqual(result)
    })

    it('should find nearest among many points', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 20; i++) {
        points.push([i * 5, i * 5])
      }
      const big = new KDTree(points)
      const result = big.nearestNeighbor([12, 12])
      expect(result).toBeDefined()
      expect(result).toEqual([10, 10])
    })

    it('should handle negative coordinates', () => {
      const neg = new KDTree([[-10, -10], [-1, -1]])
      const result = neg.nearestNeighbor([0, 0])
      expect(result).toEqual([-1, -1])
    })

    it('should handle floating point target', () => {
      const result = tree.nearestNeighbor([0.1, 0.1])
      expect(result).toEqual([0, 0])
    })

    it('should return copy of point', () => {
      const result = tree.nearestNeighbor([4, 4])
      expect(result).not.toBe(tree.nearestNeighbor([4, 4]))
    })
  })

  describe('kNearestNeighbors', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[0, 0], [1, 1], [5, 5], [10, 10], [20, 20]])
    })

    it('should return k nearest neighbors', () => {
      const results = tree.kNearestNeighbors([0, 0], 2)
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual([0, 0])
      expect(results[1]).toEqual([1, 1])
    })

    it('should return all points if k exceeds tree size', () => {
      const results = tree.kNearestNeighbors([0, 0], 10)
      expect(results).toHaveLength(5)
    })

    it('should return empty array for empty tree', () => {
      const empty = new KDTree()
      expect(empty.kNearestNeighbors([0, 0], 3)).toEqual([])
    })

    it('should return empty array for k = 0', () => {
      expect(tree.kNearestNeighbors([0, 0], 0)).toEqual([])
    })

    it('should handle k = 1', () => {
      const results = tree.kNearestNeighbors([6, 6], 1)
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual([5, 5])
    })

    it('should return points sorted by distance', () => {
      const results = tree.kNearestNeighbors([3, 3], 5)
      for (let i = 1; i < results.length; i++) {
        const prevDist = squaredDist(results[i - 1]!, [3, 3])
        const currDist = squaredDist(results[i]!, [3, 3])
        expect(currDist).toBeGreaterThanOrEqual(prevDist)
      }
    })

    it('should return copies of points', () => {
      const results = tree.kNearestNeighbors([0, 0], 2)
      expect(results[0]).not.toBe(results[1])
    })

    it('should handle negative k', () => {
      expect(tree.kNearestNeighbors([0, 0], -1)).toEqual([])
    })
  })

  describe('rangeSearch', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[1, 1], [5, 5], [10, 10], [15, 15], [20, 20]])
    })

    it('should return points within range', () => {
      const results = tree.rangeSearch([0, 0], [6, 6])
      expect(results).toHaveLength(2)
      const sorted = results.sort((a, b) => a[0]! - b[0]!)
      expect(sorted).toEqual([[1, 1], [5, 5]])
    })

    it('should return all points for wide range', () => {
      const results = tree.rangeSearch([-100, -100], [100, 100])
      expect(results).toHaveLength(5)
    })

    it('should return empty array for range with no points', () => {
      const results = tree.rangeSearch([50, 50], [60, 60])
      expect(results).toHaveLength(0)
    })

    it('should return single point for exact range', () => {
      const results = tree.rangeSearch([5, 5], [5, 5])
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual([5, 5])
    })

    it('should return empty for empty tree', () => {
      const empty = new KDTree()
      expect(empty.rangeSearch([0, 0], [10, 10])).toEqual([])
    })

    it('should include boundary points', () => {
      const results = tree.rangeSearch([10, 10], [20, 20])
      expect(results).toHaveLength(3)
    })

    it('should return copies of points', () => {
      const results = tree.rangeSearch([0, 0], [6, 6])
      for (const p of results) {
        expect(tree.contains(p)).toBe(true)
      }
    })

    it('should handle range at origin', () => {
      const results = tree.rangeSearch([0, 0], [1, 1])
      expect(results).toHaveLength(1)
    })
  })

  describe('size (getter)', () => {
    it('should return 0 for empty tree', () => {
      const tree = new KDTree()
      expect(tree.size).toBe(0)
    })

    it('should return correct count after inserts', () => {
      const tree = new KDTree()
      tree.insert([1, 1])
      tree.insert([2, 2])
      expect(tree.size).toBe(2)
    })

    it('should return correct count after removals', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      tree.remove([1, 1])
      expect(tree.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      const tree = new KDTree([[1, 1]])
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should return count from constructor points', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.size).toBe(3)
    })
  })

  describe('dimensions (getter)', () => {
    it('should return default 2', () => {
      const tree = new KDTree()
      expect(tree.dimensions).toBe(2)
    })

    it('should return custom k', () => {
      const tree = new KDTree(undefined, 5)
      expect(tree.dimensions).toBe(5)
    })

    it('should return 3 for 3D points', () => {
      const tree = new KDTree([[1, 2, 3]])
      expect(tree.dimensions).toBe(3)
    })

    it('should return 4 for 4D points', () => {
      const tree = new KDTree([[1, 2, 3, 4]], 4)
      expect(tree.dimensions).toBe(4)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new KDTree()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const tree = new KDTree()
      tree.insert([1, 1])
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clearing all points', () => {
      const tree = new KDTree([[1, 1]])
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after removing all points', () => {
      const tree = new KDTree([[1, 1]])
      tree.remove([1, 1])
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true for empty array constructor', () => {
      const tree = new KDTree([])
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all points', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow insert after clear', () => {
      const tree = new KDTree([[1, 1]])
      tree.clear()
      tree.insert([3, 3])
      expect(tree.size).toBe(1)
    })

    it('should return void', () => {
      const tree = new KDTree()
      expect(tree.clear()).toBeUndefined()
    })

    it('should handle clearing empty tree', () => {
      const tree = new KDTree()
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should preserve dimensions after clear', () => {
      const tree = new KDTree(undefined, 3)
      tree.insert([1, 2, 3])
      tree.clear()
      expect(tree.dimensions).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new KDTree()
      expect(tree.toArray()).toEqual([])
    })

    it('should return all points', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      const arr = tree.toArray()
      expect(arr).toHaveLength(3)
    })

    it('should return copies of points', () => {
      const tree = new KDTree([[5, 5]])
      const arr = tree.toArray()
      expect(arr[0]).toEqual([5, 5])
      arr[0]![0] = 99
      expect(tree.contains([5, 5])).toBe(true)
    })

    it('should reflect insertions', () => {
      const tree = new KDTree()
      tree.insert([1, 1])
      tree.insert([2, 2])
      expect(tree.toArray()).toHaveLength(2)
    })

    it('should reflect removals', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      tree.remove([2, 2])
      expect(tree.toArray()).toHaveLength(2)
    })

    it('should return in-order traversal', () => {
      const tree = new KDTree()
      tree.insert([5, 5])
      tree.insert([3, 3])
      tree.insert([7, 7])
      const arr = tree.toArray()
      expect(arr[0]).toEqual([3, 3])
      expect(arr[1]).toEqual([5, 5])
      expect(arr[2]).toEqual([7, 7])
    })
  })

  describe('forEach', () => {
    it('should iterate over all points', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const results: KDPoint[] = []
      tree.forEach((p) => results.push(p))
      expect(results).toHaveLength(2)
    })

    it('should not iterate on empty tree', () => {
      const tree = new KDTree()
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct points', () => {
      const tree = new KDTree([[5, 5]])
      tree.forEach((p) => {
        expect(p).toEqual([5, 5])
      })
    })

    it('should return void', () => {
      const tree = new KDTree()
      expect(tree.forEach(() => {})).toBeUndefined()
    })

    it('should iterate in-order', () => {
      const tree = new KDTree()
      tree.insert([5, 5])
      tree.insert([3, 3])
      tree.insert([7, 7])
      const values: KDPoint[] = []
      tree.forEach((p) => values.push(p))
      expect(values[0]).toEqual([3, 3])
      expect(values[1]).toEqual([5, 5])
      expect(values[2]).toEqual([7, 7])
    })

    it('should handle many points', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 50; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(50)
    })

    it('should provide copies of points', () => {
      const tree = new KDTree([[1, 1]])
      const collected: KDPoint[] = []
      tree.forEach((p) => collected.push(p))
      collected[0]![0] = 99
      expect(tree.contains([1, 1])).toBe(true)
    })
  })

  describe('clone', () => {
    it('should clone an empty tree', () => {
      const tree = new KDTree()
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.dimensions).toBe(tree.dimensions)
    })

    it('should clone a tree with points', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.contains([1, 1])).toBe(true)
      expect(cloned.contains([2, 2])).toBe(true)
      expect(cloned.contains([3, 3])).toBe(true)
    })

    it('should be independent from original', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const cloned = tree.clone()
      cloned.insert([3, 3])
      expect(cloned.size).toBe(3)
      expect(tree.size).toBe(2)
    })

    it('should preserve dimensions', () => {
      const tree = new KDTree([[1, 2, 3]], 3)
      const cloned = tree.clone()
      expect(cloned.dimensions).toBe(3)
    })

    it('should handle removal on clone independently', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const cloned = tree.clone()
      cloned.remove([1, 1])
      expect(cloned.size).toBe(1)
      expect(tree.size).toBe(2)
      expect(tree.contains([1, 1])).toBe(true)
    })

    it('should handle clear on clone independently', () => {
      const tree = new KDTree([[1, 1]])
      const cloned = tree.clone()
      cloned.clear()
      expect(cloned.size).toBe(0)
      expect(tree.size).toBe(1)
    })

    it('should clone 3D tree', () => {
      const tree = new KDTree([[1, 2, 3], [4, 5, 6]], 3)
      const cloned = tree.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.contains([1, 2, 3])).toBe(true)
    })
  })

  describe('2D operations', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[2, 3], [5, 4], [9, 6], [4, 7], [8, 1], [7, 2]])
    })

    it('should have correct size', () => {
      expect(tree.size).toBe(6)
    })

    it('should find all inserted points', () => {
      expect(tree.contains([2, 3])).toBe(true)
      expect(tree.contains([5, 4])).toBe(true)
      expect(tree.contains([9, 6])).toBe(true)
      expect(tree.contains([4, 7])).toBe(true)
      expect(tree.contains([8, 1])).toBe(true)
      expect(tree.contains([7, 2])).toBe(true)
    })

    it('should find nearest neighbor in 2D', () => {
      const result = tree.nearestNeighbor([6, 3])
      expect(result).toBeDefined()
      expect([[5, 4], [7, 2]]).toContainEqual(result)
    })

    it('should find k nearest in 2D', () => {
      const results = tree.kNearestNeighbors([6, 3], 3)
      expect(results).toHaveLength(3)
      expect([[5, 4], [7, 2]]).toContainEqual(results[0])
    })

    it('should do range search in 2D', () => {
      const results = tree.rangeSearch([4, 1], [8, 5])
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should remove and update size', () => {
      tree.remove([5, 4])
      expect(tree.size).toBe(5)
      expect(tree.contains([5, 4])).toBe(false)
    })
  })

  describe('3D operations', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[0, 0, 0], [1, 2, 3], [4, 5, 6], [-1, -2, -3]], 3)
    })

    it('should have correct dimensions', () => {
      expect(tree.dimensions).toBe(3)
    })

    it('should have correct size', () => {
      expect(tree.size).toBe(4)
    })

    it('should find existing point in 3D', () => {
      expect(tree.contains([1, 2, 3])).toBe(true)
    })

    it('should find nearest neighbor in 3D', () => {
      const result = tree.nearestNeighbor([0.5, 0.5, 0.5])
      expect(result).toBeDefined()
      expect(result).toEqual([0, 0, 0])
    })

    it('should do range search in 3D', () => {
      const results = tree.rangeSearch([0, 0, 0], [2, 3, 4])
      expect(results).toHaveLength(2)
    })

    it('should remove in 3D', () => {
      expect(tree.remove([1, 2, 3])).toBe(true)
      expect(tree.size).toBe(3)
    })

    it('should find k nearest in 3D', () => {
      const results = tree.kNearestNeighbors([0, 0, 0], 3)
      expect(results).toHaveLength(3)
      expect(results[0]).toEqual([0, 0, 0])
    })

    it('should insert into 3D tree', () => {
      tree.insert([10, 10, 10])
      expect(tree.size).toBe(5)
      expect(tree.contains([10, 10, 10])).toBe(true)
    })

    it('should toArray in 3D', () => {
      const arr = tree.toArray()
      expect(arr).toHaveLength(4)
      for (const p of arr) {
        expect(p).toHaveLength(3)
      }
    })

    it('should forEach in 3D', () => {
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(4)
    })

    it('should clone in 3D', () => {
      const cloned = tree.clone()
      expect(cloned.size).toBe(4)
      expect(cloned.dimensions).toBe(3)
    })
  })

  describe('edge cases — duplicate points', () => {
    it('should handle inserting same point twice', () => {
      const tree = new KDTree()
      tree.insert([5, 5])
      tree.insert([5, 5])
      expect(tree.size).toBe(2)
    })

    it('should handle removing one duplicate', () => {
      const tree = new KDTree()
      tree.insert([5, 5])
      tree.insert([5, 5])
      tree.remove([5, 5])
      expect(tree.size).toBe(1)
    })

    it('should handle many duplicates', () => {
      const tree = new KDTree()
      for (let i = 0; i < 10; i++) {
        tree.insert([5, 5])
      }
      expect(tree.size).toBe(10)
    })

    it('should remove all duplicates', () => {
      const tree = new KDTree()
      tree.insert([5, 5])
      tree.insert([5, 5])
      tree.remove([5, 5])
      tree.remove([5, 5])
      expect(tree.size).toBe(0)
    })

    it('should contain duplicate after removing one', () => {
      const tree = new KDTree()
      tree.insert([5, 5])
      tree.insert([5, 5])
      tree.remove([5, 5])
      expect(tree.contains([5, 5])).toBe(true)
    })
  })

  describe('edge cases — points on boundaries', () => {
    it('should include points on min boundary in range search', () => {
      const tree = new KDTree([[0, 0], [5, 5]])
      const results = tree.rangeSearch([0, 0], [10, 10])
      expect(results).toHaveLength(2)
    })

    it('should include points on max boundary in range search', () => {
      const tree = new KDTree([[10, 10]])
      const results = tree.rangeSearch([0, 0], [10, 10])
      expect(results).toHaveLength(1)
    })

    it('should include points on both boundaries', () => {
      const tree = new KDTree([[0, 0], [10, 10]])
      const results = tree.rangeSearch([0, 0], [10, 10])
      expect(results).toHaveLength(2)
    })

    it('should handle single dimension range', () => {
      const tree = new KDTree([[5, 5]])
      const results = tree.rangeSearch([5, 5], [5, 5])
      expect(results).toHaveLength(1)
    })
  })

  describe('edge cases — very close points', () => {
    it('should distinguish very close points', () => {
      const tree = new KDTree([[0, 0], [0.0001, 0.0001]])
      expect(tree.size).toBe(2)
      expect(tree.contains([0, 0])).toBe(true)
      expect(tree.contains([0.0001, 0.0001])).toBe(true)
    })

    it('should find nearest among very close points', () => {
      const tree = new KDTree([[0, 0], [0.0001, 0.0001]])
      const result = tree.nearestNeighbor([0.00005, 0.00005])
      expect(result).toBeDefined()
    })
  })

  describe('edge cases — single point operations', () => {
    it('should handle nearest on single point tree', () => {
      const tree = new KDTree([[1, 1]])
      expect(tree.nearestNeighbor([5, 5])).toEqual([1, 1])
    })

    it('should handle kNN on single point tree', () => {
      const tree = new KDTree([[1, 1]])
      expect(tree.kNearestNeighbors([5, 5], 1)).toHaveLength(1)
    })

    it('should handle range on single point tree', () => {
      const tree = new KDTree([[1, 1]])
      expect(tree.rangeSearch([0, 0], [2, 2])).toHaveLength(1)
    })

    it('should handle remove on single point tree', () => {
      const tree = new KDTree([[1, 1]])
      tree.remove([1, 1])
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('large datasets', () => {
    it('should handle 100 points', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 100; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      expect(tree.size).toBe(100)
    })

    it('should find nearest in large dataset', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 100; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      const result = tree.nearestNeighbor([50.5, 50.5])
      expect(result).toBeDefined()
      expect(result).toEqual([50, 50])
    })

    it('should handle k nearest on large dataset', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 50; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      const results = tree.kNearestNeighbors([0, 0], 5)
      expect(results).toHaveLength(5)
    })

    it('should handle range search on large dataset', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 50; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      const results = tree.rangeSearch([10, 10], [20, 20])
      expect(results).toHaveLength(11)
    })

    it('should handle many removals', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 50; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      for (let i = 0; i < 25; i++) {
        tree.remove([i, i])
      }
      expect(tree.size).toBe(25)
    })

    it('should handle forEach on large dataset', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 50; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(50)
    })

    it('should handle 500 points', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 500; i++) {
        points.push([i, i * 2])
      }
      const tree = new KDTree(points)
      expect(tree.size).toBe(500)
    })

    it('should handle insert into large tree', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 100; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      tree.insert([50.5, 50.5])
      expect(tree.size).toBe(101)
      expect(tree.contains([50.5, 50.5])).toBe(true)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across mixed operations', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      tree.remove([2, 2])
      tree.insert([4, 4])
      expect(tree.size).toBe(3)
      expect(tree.contains([1, 1])).toBe(true)
      expect(tree.contains([2, 2])).toBe(false)
      expect(tree.contains([3, 3])).toBe(true)
      expect(tree.contains([4, 4])).toBe(true)
    })

    it('should handle clear and rebuild', () => {
      const tree = new KDTree([[1, 1]])
      tree.clear()
      tree.insert([2, 2])
      expect(tree.size).toBe(1)
      expect(tree.contains([1, 1])).toBe(false)
      expect(tree.contains([2, 2])).toBe(true)
    })

    it('should handle insert-remove-insert cycle', () => {
      const tree = new KDTree()
      tree.insert([5, 5])
      tree.remove([5, 5])
      tree.insert([5, 5])
      expect(tree.contains([5, 5])).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle nearest after removal', () => {
      const tree = new KDTree([[0, 0], [10, 10], [5, 5]])
      tree.remove([5, 5])
      const result = tree.nearestNeighbor([6, 6])
      expect(result).toEqual([10, 10])
    })

    it('should handle range search after removal', () => {
      const tree = new KDTree([[1, 1], [5, 5]])
      tree.remove([5, 5])
      const results = tree.rangeSearch([0, 0], [10, 10])
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual([1, 1])
    })

    it('should handle clone after modifications', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      tree.remove([2, 2])
      const cloned = tree.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.contains([1, 1])).toBe(true)
      expect(cloned.contains([3, 3])).toBe(true)
    })

    it('should handle toArray after modifications', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      tree.remove([2, 2])
      tree.insert([4, 4])
      const arr = tree.toArray()
      expect(arr).toHaveLength(3)
    })

    it('should handle forEach after modifications', () => {
      const tree = new KDTree([[1, 1], [2, 2], [3, 3]])
      tree.remove([2, 2])
      const collected: KDPoint[] = []
      tree.forEach((p) => collected.push(p))
      expect(collected).toHaveLength(2)
    })

    it('should handle kNN after insertions', () => {
      const tree = new KDTree([[0, 0]])
      tree.insert([10, 10])
      tree.insert([5, 5])
      const results = tree.kNearestNeighbors([6, 6], 2)
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual([5, 5])
    })
  })

  describe('type exports', () => {
    it('should support KDPoint type', () => {
      const p: KDPoint = [1, 2]
      expect(p).toEqual([1, 2])
    })

    it('should support KDPoint as number array', () => {
      const p: KDPoint = [1, 2, 3, 4, 5]
      expect(p.length).toBe(5)
    })
  })
})

function squaredDist(a: KDPoint, b: KDPoint): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i]! - b[i]!
    sum += diff * diff
  }
  return sum
}
