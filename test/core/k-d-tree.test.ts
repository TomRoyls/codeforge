import { describe, it, expect, beforeEach } from 'vitest'
import { KDTree } from '../../src/core/k-d-tree/index.js'
import { euclideanSquared } from '../../src/core/k-d-tree/index.js'
import type { KDPoint, KDTreeOptions, DistanceFunction } from '../../src/core/k-d-tree/index.js'
import {
  euclideanDistance,
  manhattanDistance,
  DEFAULT_KDTREE_OPTIONS,
} from '../../src/core/k-d-tree/types.js'

describe('KDTree', () => {
  describe('constructor', () => {
    it('should create an empty tree with no arguments', () => {
      const tree = new KDTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.dimensions).toBe(2)
    })

    it('should create a tree from points', () => {
      const points: KDPoint[] = [[1, 2], [3, 4], [5, 6]]
      const tree = new KDTree(points)
      expect(tree.size).toBe(3)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should create a tree with specified dimensions', () => {
      const tree = new KDTree(undefined, 3)
      expect(tree.dimensions).toBe(3)
    })

    it('should default to 2 dimensions', () => {
      const tree = new KDTree()
      expect(tree.dimensions).toBe(2)
    })

    it('should infer dimensions from points if larger than specified', () => {
      const points: KDPoint[] = [[1, 2, 3], [4, 5, 6]]
      const tree = new KDTree(points, 2)
      expect(tree.dimensions).toBe(3)
    })

    it('should create tree with custom distance function', () => {
      const customDist: DistanceFunction = (a, b) => {
        let sum = 0
        for (let i = 0; i < a.length; i++) sum += Math.abs(a[i]! - b[i]!)
        return sum
      }
      const tree = new KDTree([[1, 2], [3, 4]], 2, { distance: customDist })
      expect(tree.size).toBe(2)
    })

    it('should handle empty points array', () => {
      const tree = new KDTree([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle single point', () => {
      const tree = new KDTree([[5, 10]])
      expect(tree.size).toBe(1)
      expect(tree.search([5, 10])).toEqual([5, 10])
    })

    it('should create tree with options object', () => {
      const tree = new KDTree(undefined, undefined, { dimensions: 3 })
      expect(tree.dimensions).toBe(3)
    })

    it('should use default distance when not specified', () => {
      const tree = new KDTree([[0, 0], [1, 1]])
      const nn = tree.nearestNeighbor([0.5, 0.5])
      expect(nn).toBeDefined()
    })
  })

  describe('insert', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree(undefined, 2)
    })

    it('should insert a point into empty tree', () => {
      tree.insert([1, 2])
      expect(tree.size).toBe(1)
    })

    it('should insert multiple points', () => {
      tree.insert([1, 2])
      tree.insert([3, 4])
      tree.insert([5, 6])
      expect(tree.size).toBe(3)
    })

    it('should find inserted point', () => {
      tree.insert([10, 20])
      expect(tree.search([10, 20])).toEqual([10, 20])
    })

    it('should throw on wrong dimension count', () => {
      tree.insert([1, 2])
      expect(() => tree.insert([1, 2, 3])).toThrow('Point must have 2 dimensions')
    })

    it('should update dimensions on first insert if larger', () => {
      const t = new KDTree()
      t.insert([1, 2, 3])
      expect(t.dimensions).toBe(3)
    })

    it('should handle negative coordinates', () => {
      tree.insert([-1, -2])
      tree.insert([-3, -4])
      expect(tree.size).toBe(2)
      expect(tree.search([-1, -2])).toEqual([-1, -2])
    })

    it('should handle zero coordinates', () => {
      tree.insert([0, 0])
      expect(tree.search([0, 0])).toEqual([0, 0])
    })

    it('should handle duplicate points', () => {
      tree.insert([1, 2])
      tree.insert([1, 2])
      expect(tree.size).toBe(2)
    })

    it('should handle floating point coordinates', () => {
      tree.insert([1.5, 2.5])
      tree.insert([3.14, 2.71])
      expect(tree.search([1.5, 2.5])).toEqual([1.5, 2.5])
    })
  })

  describe('remove', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]])
    })

    it('should remove an existing point', () => {
      const result = tree.remove([3, 4])
      expect(result).toBe(true)
      expect(tree.size).toBe(4)
    })

    it('should return false for non-existing point', () => {
      const result = tree.remove([100, 200])
      expect(result).toBe(false)
      expect(tree.size).toBe(5)
    })

    it('should remove root point', () => {
      const arr = tree.toArray()
      const root = arr[0]
      const removed = tree.remove(root!)
      expect(removed).toBe(true)
      expect(tree.size).toBe(4)
    })

    it('should remove leaf point', () => {
      tree.remove([1, 2])
      expect(tree.search([1, 2])).toBeUndefined()
    })

    it('should remove all points one by one', () => {
      tree.remove([1, 2])
      tree.remove([3, 4])
      tree.remove([5, 6])
      tree.remove([7, 8])
      tree.remove([9, 10])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain tree structure after removal', () => {
      tree.remove([5, 6])
      expect(tree.search([1, 2])).toEqual([1, 2])
      expect(tree.search([9, 10])).toEqual([9, 10])
    })

    it('should handle remove from empty tree', () => {
      const empty = new KDTree()
      expect(empty.remove([1, 2])).toBe(false)
    })

    it('should handle remove from single element tree', () => {
      const single = new KDTree([[5, 5]])
      expect(single.remove([5, 5])).toBe(true)
      expect(single.size).toBe(0)
    })
  })

  describe('search', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[1, 2], [3, 4], [5, 6]])
    })

    it('should find an existing point', () => {
      expect(tree.search([1, 2])).toEqual([1, 2])
    })

    it('should find middle point', () => {
      expect(tree.search([3, 4])).toEqual([3, 4])
    })

    it('should find last point', () => {
      expect(tree.search([5, 6])).toEqual([5, 6])
    })

    it('should return undefined for non-existing point', () => {
      expect(tree.search([10, 20])).toBeUndefined()
    })

    it('should return undefined on empty tree', () => {
      const empty = new KDTree()
      expect(empty.search([1, 1])).toBeUndefined()
    })

    it('should return a copy of the point', () => {
      const result = tree.search([1, 2])!
      result[0] = 999
      expect(tree.search([1, 2])).toEqual([1, 2])
    })
  })

  describe('nearestNeighbor', () => {
    it('should find the nearest point', () => {
      const tree = new KDTree([[0, 0], [10, 10], [5, 5]])
      const result = tree.nearestNeighbor([1, 1])
      expect(result).toEqual([0, 0])
    })

    it('should find exact match when query is a point', () => {
      const tree = new KDTree([[1, 1], [5, 5], [10, 10]])
      expect(tree.nearestNeighbor([5, 5])).toEqual([5, 5])
    })

    it('should return undefined for empty tree', () => {
      const tree = new KDTree()
      expect(tree.nearestNeighbor([1, 1])).toBeUndefined()
    })

    it('should work with single point tree', () => {
      const tree = new KDTree([[3, 7]])
      expect(tree.nearestNeighbor([0, 0])).toEqual([3, 7])
    })

    it('should handle 3D points', () => {
      const tree = new KDTree([[0, 0, 0], [2, 2, 2], [10, 10, 10]], 3)
      expect(tree.nearestNeighbor([0.5, 0.5, 0.5])).toEqual([0, 0, 0])
    })

    it('should find nearest with many points', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 100; i++) {
        points.push([i, i])
      }
      const tree = new KDTree(points)
      expect(tree.nearestNeighbor([50.1, 50.1])).toEqual([50, 50])
    })

    it('should handle negative coordinates', () => {
      const tree = new KDTree([[-10, -10], [0, 0], [10, 10]])
      expect(tree.nearestNeighbor([-9, -9])).toEqual([-10, -10])
    })
  })

  describe('kNearestNeighbors', () => {
    it('should find k nearest neighbors', () => {
      const tree = new KDTree([[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]])
      const result = tree.kNearestNeighbors([2.5, 2.5], 3)
      expect(result).toHaveLength(3)
    })

    it('should return results sorted by distance', () => {
      const tree = new KDTree([[0, 0], [10, 10], [5, 5]])
      const result = tree.kNearestNeighbors([4, 4], 3)
      const dists = result.map((p) => euclideanSquared(p, [4, 4]))
      for (let i = 1; i < dists.length; i++) {
        expect(dists[i]!).toBeGreaterThanOrEqual(dists[i - 1]!)
      }
    })

    it('should return empty for k=0', () => {
      const tree = new KDTree([[1, 2]])
      expect(tree.kNearestNeighbors([1, 2], 0)).toEqual([])
    })

    it('should return empty for empty tree', () => {
      const tree = new KDTree()
      expect(tree.kNearestNeighbors([1, 1], 3)).toEqual([])
    })

    it('should handle k larger than tree size', () => {
      const tree = new KDTree([[1, 1], [2, 2]])
      const result = tree.kNearestNeighbors([0, 0], 10)
      expect(result).toHaveLength(2)
    })

    it('should find 1 nearest neighbor', () => {
      const tree = new KDTree([[0, 0], [5, 5], [10, 10]])
      const result = tree.kNearestNeighbors([4, 4], 1)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([5, 5])
    })

    it('should work with 3D points', () => {
      const tree = new KDTree(
        [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
        3,
      )
      const result = tree.kNearestNeighbors([1.5, 1.5, 1.5], 2)
      expect(result).toHaveLength(2)
    })
  })

  describe('rangeSearch', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([
        [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
        [6, 6], [7, 7], [8, 8], [9, 9], [10, 10],
      ])
    })

    it('should find points within range', () => {
      const result = tree.rangeSearch([3, 3], [7, 7])
      expect(result.length).toBe(5)
    })

    it('should include boundary points', () => {
      const result = tree.rangeSearch([3, 3], [3, 3])
      expect(result).toContainEqual([3, 3])
    })

    it('should return empty for no matching range', () => {
      const result = tree.rangeSearch([100, 100], [200, 200])
      expect(result).toEqual([])
    })

    it('should return all points for full range', () => {
      const result = tree.rangeSearch([0, 0], [11, 11])
      expect(result.length).toBe(10)
    })

    it('should return empty on empty tree', () => {
      const empty = new KDTree()
      expect(empty.rangeSearch([0, 0], [10, 10])).toEqual([])
    })

    it('should handle single point range', () => {
      const result = tree.rangeSearch([5, 5], [5, 5])
      expect(result).toEqual([[5, 5]])
    })

    it('should work with negative ranges', () => {
      const negTree = new KDTree([[-5, -5], [-3, -3], [0, 0], [3, 3]])
      const result = negTree.rangeSearch([-4, -4], [-2, -2])
      expect(result).toContainEqual([-3, -3])
    })
  })

  describe('pointsWithin', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree([[0, 0], [1, 1], [2, 2], [5, 5], [10, 10]])
    })

    it('should find points within radius', () => {
      const result = tree.pointsWithin([2, 2], 10)
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('should return empty for zero radius', () => {
      const result = tree.pointsWithin([2, 2], 0)
      expect(result).toEqual([[2, 2]])
    })

    it('should return empty on empty tree', () => {
      const empty = new KDTree()
      expect(empty.pointsWithin([0, 0], 10)).toEqual([])
    })

    it('should find all points with large radius', () => {
      const result = tree.pointsWithin([5, 5], 100)
      expect(result.length).toBe(5)
    })

    it('should include the center point', () => {
      const result = tree.pointsWithin([2, 2], 0.001)
      expect(result).toContainEqual([2, 2])
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(new KDTree().size).toBe(0)
    })

    it('should return correct size after inserts', () => {
      const tree = new KDTree()
      tree.insert([1, 2])
      tree.insert([3, 4])
      expect(tree.size).toBe(2)
    })

    it('should return correct size after removals', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      tree.remove([1, 2])
      expect(tree.size).toBe(1)
    })

    it('should return correct size from constructor', () => {
      const tree = new KDTree([[1, 2], [3, 4], [5, 6]])
      expect(tree.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      expect(new KDTree().isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const tree = new KDTree()
      tree.insert([1, 2])
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      const tree = new KDTree([[1, 2]])
      tree.remove([1, 2])
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should work on already empty tree', () => {
      const tree = new KDTree()
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow insertions after clear', () => {
      const tree = new KDTree([[1, 2]])
      tree.clear()
      tree.insert([5, 6])
      expect(tree.size).toBe(1)
      expect(tree.search([5, 6])).toEqual([5, 6])
    })
  })

  describe('toArray', () => {
    it('should return all points', () => {
      const points: KDPoint[] = [[1, 2], [3, 4], [5, 6]]
      const tree = new KDTree(points)
      const arr = tree.toArray()
      expect(arr.length).toBe(3)
    })

    it('should return empty array for empty tree', () => {
      expect(new KDTree().toArray()).toEqual([])
    })

    it('should return copies of points', () => {
      const tree = new KDTree([[1, 2]])
      const arr = tree.toArray()
      arr[0]![0] = 999
      expect(tree.search([1, 2])).toEqual([1, 2])
    })

    it('should return all points from inserted tree', () => {
      const tree = new KDTree()
      tree.insert([1, 1])
      tree.insert([2, 2])
      tree.insert([3, 3])
      expect(tree.toArray().length).toBe(3)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      const cloned = tree.clone()
      expect(cloned.size).toBe(tree.size)
      expect(cloned.search([1, 2])).toEqual([1, 2])
    })

    it('should not affect original when modified', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      const cloned = tree.clone()
      cloned.remove([1, 2])
      expect(tree.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('should clone empty tree', () => {
      const tree = new KDTree()
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve dimensions', () => {
      const tree = new KDTree([[1, 2, 3], [4, 5, 6]], 3)
      const cloned = tree.clone()
      expect(cloned.dimensions).toBe(3)
    })

    it('should clone all points', () => {
      const points: KDPoint[] = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
      const tree = new KDTree(points)
      const cloned = tree.clone()
      expect(cloned.toArray().length).toBe(5)
    })
  })

  describe('forEach', () => {
    it('should iterate all points', () => {
      const tree = new KDTree([[1, 2], [3, 4], [5, 6]])
      const collected: KDPoint[] = []
      tree.forEach((p) => collected.push(p))
      expect(collected.length).toBe(3)
    })

    it('should provide correct index', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      const indices: number[] = []
      tree.forEach((_p, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('should not iterate on empty tree', () => {
      const tree = new KDTree()
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide copies of points', () => {
      const tree = new KDTree([[1, 2]])
      tree.forEach((p) => {
        p[0] = 999
      })
      expect(tree.search([1, 2])).toEqual([1, 2])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should be iterable', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      const result = [...tree]
      expect(result.length).toBe(2)
    })

    it('should work with for...of', () => {
      const tree = new KDTree([[10, 20], [30, 40], [50, 60]])
      const collected: KDPoint[] = []
      for (const point of tree) {
        collected.push(point)
      }
      expect(collected.length).toBe(3)
    })

    it('should handle empty tree iteration', () => {
      const tree = new KDTree()
      const result = [...tree]
      expect(result).toEqual([])
    })

    it('should return copies of points', () => {
      const tree = new KDTree([[1, 2]])
      for (const p of tree) {
        p[0] = 999
      }
      expect(tree.search([1, 2])).toEqual([1, 2])
    })
  })

  describe('static fromPoints', () => {
    it('should create tree from points', () => {
      const tree = KDTree.fromPoints([[1, 2], [3, 4]])
      expect(tree.size).toBe(2)
    })

    it('should create tree with dimensions', () => {
      const tree = KDTree.fromPoints([[1, 2, 3]], 3)
      expect(tree.dimensions).toBe(3)
    })

    it('should create tree with options', () => {
      const tree = KDTree.fromPoints([[1, 2]], undefined, { dimensions: 2 })
      expect(tree.size).toBe(1)
    })

    it('should create empty tree from empty array', () => {
      const tree = KDTree.fromPoints([])
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('balance', () => {
    it('should balance an unbalanced tree', () => {
      const tree = new KDTree(undefined, 2)
      for (let i = 0; i < 10; i++) {
        tree.insert([i, i])
      }
      tree.balance()
      expect(tree.size).toBe(10)
    })

    it('should preserve all points after balance', () => {
      const points: KDPoint[] = [[5, 5], [1, 1], [9, 9], [3, 3], [7, 7]]
      const tree = new KDTree(points)
      tree.balance()
      for (const p of points) {
        expect(tree.search(p)).toEqual(p)
      }
    })

    it('should handle empty tree', () => {
      const tree = new KDTree()
      tree.balance()
      expect(tree.size).toBe(0)
    })

    it('should handle single element tree', () => {
      const tree = new KDTree([[1, 1]])
      tree.balance()
      expect(tree.size).toBe(1)
    })
  })

  describe('dimensions', () => {
    it('should return default 2 dimensions', () => {
      expect(new KDTree().dimensions).toBe(2)
    })

    it('should return specified dimensions', () => {
      expect(new KDTree(undefined, 4).dimensions).toBe(4)
    })

    it('should reflect inferred dimensions from points', () => {
      const tree = new KDTree([[1, 2, 3, 5]])
      expect(tree.dimensions).toBe(4)
    })
  })

  describe('3D operations', () => {
    let tree: KDTree

    beforeEach(() => {
      tree = new KDTree(
        [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]],
        3,
      )
    })

    it('should search in 3D', () => {
      expect(tree.search([2, 2, 2])).toEqual([2, 2, 2])
    })

    it('should find nearest in 3D', () => {
      expect(tree.nearestNeighbor([0.9, 0.9, 0.9])).toEqual([1, 1, 1])
    })

    it('should find k nearest in 3D', () => {
      const result = tree.kNearestNeighbors([2.5, 2.5, 2.5], 2)
      expect(result).toHaveLength(2)
    })

    it('should range search in 3D', () => {
      const result = tree.rangeSearch([1, 1, 1], [3, 3, 3])
      expect(result.length).toBe(3)
    })

    it('should insert in 3D', () => {
      tree.insert([5, 5, 5])
      expect(tree.size).toBe(6)
      expect(tree.search([5, 5, 5])).toEqual([5, 5, 5])
    })

    it('should remove in 3D', () => {
      expect(tree.remove([2, 2, 2])).toBe(true)
      expect(tree.size).toBe(4)
    })
  })

  describe('custom distance function', () => {
    it('should work with manhattan distance', () => {
      const tree = new KDTree(
        [[0, 0], [1, 5], [10, 1]],
        2,
        { distance: manhattanDistance },
      )
      const nn = tree.nearestNeighbor([2, 2])
      expect(nn).toBeDefined()
    })

    it('should work with euclidean distance', () => {
      const tree = new KDTree(
        [[0, 0], [3, 4], [10, 10]],
        2,
        { distance: euclideanDistance },
      )
      const nn = tree.nearestNeighbor([3, 3])
      expect(nn).toEqual([3, 4])
    })

    it('should affect kNearestNeighbors ordering', () => {
      const tree = new KDTree(
        [[0, 0], [1, 10], [2, 0]],
        2,
        { distance: manhattanDistance },
      )
      const result = tree.kNearestNeighbors([0, 0], 3)
      expect(result).toHaveLength(3)
    })
  })

  describe('edge cases', () => {
    it('should handle large number of points', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 1000; i++) {
        points.push([i, i * 2])
      }
      const tree = new KDTree(points)
      expect(tree.size).toBe(1000)
      expect(tree.search([500, 1000])).toEqual([500, 1000])
    })

    it('should handle points with same x coordinate', () => {
      const tree = new KDTree([[5, 1], [5, 2], [5, 3]])
      expect(tree.search([5, 2])).toEqual([5, 2])
    })

    it('should handle points with same y coordinate', () => {
      const tree = new KDTree([[1, 5], [2, 5], [3, 5]])
      expect(tree.search([2, 5])).toEqual([2, 5])
    })

    it('should handle all same points', () => {
      const tree = new KDTree([[1, 1], [1, 1], [1, 1]])
      expect(tree.size).toBe(3)
    })

    it('should handle very large coordinates', () => {
      const tree = new KDTree([[1e10, 1e10], [1e10 + 1, 1e10 + 1]])
      expect(tree.search([1e10, 1e10])).toEqual([1e10, 1e10])
    })

    it('should handle very small coordinates', () => {
      const tree = new KDTree([[1e-10, 1e-10], [2e-10, 2e-10]])
      expect(tree.search([1e-10, 1e-10])).toEqual([1e-10, 1e-10])
    })
  })

  describe('immutability', () => {
    it('search should not modify tree points', () => {
      const tree = new KDTree([[1, 2]])
      tree.search([1, 2])
      expect(tree.search([1, 2])).toEqual([1, 2])
    })

    it('nearestNeighbor should return a copy', () => {
      const tree = new KDTree([[1, 2]])
      const nn = tree.nearestNeighbor([0, 0])!
      nn[0] = 999
      expect(tree.search([1, 2])).toEqual([1, 2])
    })

    it('kNearestNeighbors should return copies', () => {
      const tree = new KDTree([[1, 2], [3, 4]])
      const knn = tree.kNearestNeighbors([0, 0], 2)
      knn[0]![0] = 999
      expect(tree.search([1, 2])).toEqual([1, 2])
    })

    it('rangeSearch should return copies', () => {
      const tree = new KDTree([[1, 2]])
      const rs = tree.rangeSearch([0, 0], [2, 2])
      rs[0]![0] = 999
      expect(tree.search([1, 2])).toEqual([1, 2])
    })

    it('pointsWithin should return copies', () => {
      const tree = new KDTree([[1, 2]])
      const pw = tree.pointsWithin([1, 2], 1)
      pw[0]![0] = 999
      expect(tree.search([1, 2])).toEqual([1, 2])
    })
  })
})

describe('types exports', () => {
  it('should export euclideanDistance', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5)
  })

  it('should export manhattanDistance', () => {
    expect(manhattanDistance([0, 0], [3, 4])).toBe(7)
  })

  it('should export euclideanSquared', () => {
    expect(euclideanSquared([0, 0], [3, 4])).toBe(25)
  })

  it('should export DEFAULT_KDTREE_OPTIONS', () => {
    expect(DEFAULT_KDTREE_OPTIONS.dimensions).toBe(2)
    expect(typeof DEFAULT_KDTREE_OPTIONS.distance).toBe('function')
  })
})

describe('distance functions', () => {
  describe('euclideanDistance', () => {
    it('should return 0 for same point', () => {
      expect(euclideanDistance([3, 4], [3, 4])).toBe(0)
    })

    it('should compute 2D distance', () => {
      expect(euclideanDistance([0, 0], [3, 4])).toBe(5)
    })

    it('should compute 3D distance', () => {
      expect(euclideanDistance([0, 0, 0], [1, 2, 2])).toBeCloseTo(3)
    })

    it('should handle negative coordinates', () => {
      expect(euclideanDistance([-3, -4], [0, 0])).toBe(5)
    })
  })

  describe('manhattanDistance', () => {
    it('should return 0 for same point', () => {
      expect(manhattanDistance([1, 2], [1, 2])).toBe(0)
    })

    it('should compute 2D manhattan', () => {
      expect(manhattanDistance([0, 0], [3, 4])).toBe(7)
    })

    it('should compute 3D manhattan', () => {
      expect(manhattanDistance([0, 0, 0], [1, 2, 3])).toBe(6)
    })
  })

  describe('euclideanSquared', () => {
    it('should return 0 for same point', () => {
      expect(euclideanSquared([1, 1], [1, 1])).toBe(0)
    })

    it('should compute squared distance', () => {
      expect(euclideanSquared([0, 0], [3, 4])).toBe(25)
    })

    it('should be sum of squared diffs', () => {
      expect(euclideanSquared([1, 2, 3], [4, 6, 3])).toBe(25)
    })
  })
})
