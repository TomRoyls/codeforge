import { describe, it, expect } from 'vitest'
import { RangeTree } from '../../src/core/range-tree/range-tree.js'
import type { Point2D } from '../../src/core/range-tree/types.js'

describe('RangeTree', () => {
  describe('constructor', () => {
    it('should create a tree from an empty array', () => {
      const tree = new RangeTree([])
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should create a tree from a single point', () => {
      const tree = new RangeTree([[1, 2]])
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should create a tree from multiple points', () => {
      const tree = new RangeTree([[1, 2], [3, 4], [5, 6]])
      expect(tree.size()).toBe(3)
    })

    it('should preserve the original point count', () => {
      const points: Point2D[] = [[10, 20], [30, 40], [50, 60], [70, 80]]
      const tree = new RangeTree(points)
      expect(tree.size()).toBe(4)
    })
  })

  describe('build', () => {
    it('should build from empty points', () => {
      const tree = new RangeTree([])
      expect(tree.rangeQuery(0, 100, 0, 100)).toEqual([])
    })

    it('should build from a single point', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.rangeQuery(0, 10, 0, 10)).toEqual([[5, 5]])
    })

    it('should build from sorted points', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.size()).toBe(3)
    })

    it('should build from reverse sorted points', () => {
      const tree = new RangeTree([[3, 3], [2, 2], [1, 1]])
      expect(tree.size()).toBe(3)
    })

    it('should build from randomly ordered points', () => {
      const tree = new RangeTree([[5, 1], [1, 5], [3, 3], [2, 4], [4, 2]])
      expect(tree.size()).toBe(5)
    })
  })

  describe('rangeQuery', () => {
    it('should return empty array for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.rangeQuery(0, 10, 0, 10)).toEqual([])
    })

    it('should return single point when in range', () => {
      const tree = new RangeTree([[5, 5]])
      const result = tree.rangeQuery(0, 10, 0, 10)
      expect(result).toEqual([[5, 5]])
    })

    it('should return empty when point is outside range', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.rangeQuery(6, 10, 6, 10)).toEqual([])
    })

    it('should return all points when range covers everything', () => {
      const points: Point2D[] = [[1, 1], [2, 2], [3, 3]]
      const tree = new RangeTree(points)
      const result = tree.rangeQuery(-100, 100, -100, 100)
      expect(result.length).toBe(3)
      for (const p of points) {
        expect(result.some((r) => r[0] === p[0] && r[1] === p[1])).toBe(true)
      }
    })

    it('should return subset of points', () => {
      const points: Point2D[] = [[1, 1], [5, 5], [10, 10]]
      const tree = new RangeTree(points)
      const result = tree.rangeQuery(0, 6, 0, 6)
      expect(result.length).toBe(2)
      expect(result.some((r) => r[0] === 1 && r[1] === 1)).toBe(true)
      expect(result.some((r) => r[0] === 5 && r[1] === 5)).toBe(true)
    })

    it('should handle range on x-axis boundary', () => {
      const tree = new RangeTree([[1, 1], [5, 5], [10, 10]])
      const result = tree.rangeQuery(5, 5, 5, 5)
      expect(result).toEqual([[5, 5]])
    })

    it('should include points on boundary edges', () => {
      const tree = new RangeTree([[0, 0], [10, 10]])
      const result = tree.rangeQuery(0, 10, 0, 10)
      expect(result.length).toBe(2)
    })

    it('should handle single x range spanning all points', () => {
      const tree = new RangeTree([[1, 2], [1, 4], [1, 6]])
      const result = tree.rangeQuery(1, 1, 0, 10)
      expect(result.length).toBe(3)
    })

    it('should handle single y range spanning all points', () => {
      const tree = new RangeTree([[2, 5], [4, 5], [6, 5]])
      const result = tree.rangeQuery(0, 10, 5, 5)
      expect(result.length).toBe(3)
    })

    it('should return empty for very narrow miss range', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.rangeQuery(5.1, 5.2, 5, 5)).toEqual([])
    })

    it('should handle large x range with narrow y range', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]])
      const result = tree.rangeQuery(0, 100, 2, 2)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual([2, 2])
    })

    it('should handle narrow x range with large y range', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]])
      const result = tree.rangeQuery(3, 3, -100, 100)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual([3, 3])
    })

    it('should handle negative coordinates', () => {
      const tree = new RangeTree([[-5, -5], [0, 0], [5, 5]])
      const result = tree.rangeQuery(-10, -1, -10, -1)
      expect(result).toEqual([[-5, -5]])
    })

    it('should handle all negative coordinates', () => {
      const tree = new RangeTree([[-10, -10], [-5, -5], [-1, -1]])
      const result = tree.rangeQuery(-10, -1, -10, -1)
      expect(result.length).toBe(3)
    })

    it('should handle floating point coordinates', () => {
      const tree = new RangeTree([[1.5, 2.5], [3.5, 4.5]])
      const result = tree.rangeQuery(1, 2, 2, 3)
      expect(result).toEqual([[1.5, 2.5]])
    })

    it('should return no points when all are outside x range', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.rangeQuery(10, 20, 0, 100)).toEqual([])
    })

    it('should return no points when all are outside y range', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.rangeQuery(0, 100, 10, 20)).toEqual([])
    })
  })

  describe('rangeCount', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.rangeCount(0, 10, 0, 10)).toBe(0)
    })

    it('should return count matching rangeQuery length', () => {
      const points: Point2D[] = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
      const tree = new RangeTree(points)
      expect(tree.rangeCount(0, 3, 0, 3)).toBe(tree.rangeQuery(0, 3, 0, 3).length)
    })

    it('should return correct count for full range', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.rangeCount(-100, 100, -100, 100)).toBe(3)
    })

    it('should return 0 for empty range result', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.rangeCount(0, 4, 0, 4)).toBe(0)
    })

    it('should count all points in large range', () => {
      const points: Point2D[] = Array.from({ length: 50 }, (_, i) => [i, i] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.rangeCount(-1000, 1000, -1000, 1000)).toBe(50)
    })
  })

  describe('reportInRange', () => {
    it('should be an alias for rangeCount', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.reportInRange(0, 5, 0, 5)).toBe(tree.rangeCount(0, 5, 0, 5))
    })

    it('should return 0 for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.reportInRange(0, 10, 0, 10)).toBe(0)
    })

    it('should return correct count for subset', () => {
      const tree = new RangeTree([[1, 1], [5, 5], [10, 10]])
      expect(tree.reportInRange(0, 6, 0, 6)).toBe(2)
    })
  })

  describe('contains', () => {
    it('should return false for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.contains([1, 1])).toBe(false)
    })

    it('should return true for existing point', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.contains([5, 5])).toBe(true)
    })

    it('should return false for non-existing point', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.contains([6, 6])).toBe(false)
    })

    it('should find point with matching x but different y as not contained', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.contains([5, 6])).toBe(false)
    })

    it('should find point with matching y but different x as not contained', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.contains([6, 5])).toBe(false)
    })

    it('should find all points in a multi-point tree', () => {
      const points: Point2D[] = [[1, 2], [3, 4], [5, 6]]
      const tree = new RangeTree(points)
      for (const p of points) {
        expect(tree.contains(p)).toBe(true)
      }
    })

    it('should handle negative coordinate lookup', () => {
      const tree = new RangeTree([[-5, -5]])
      expect(tree.contains([-5, -5])).toBe(true)
    })

    it('should handle floating point lookup', () => {
      const tree = new RangeTree([[1.5, 2.5]])
      expect(tree.contains([1.5, 2.5])).toBe(true)
    })

    it('should not find approximate floating point', () => {
      const tree = new RangeTree([[1.5, 2.5]])
      expect(tree.contains([1.5000001, 2.5])).toBe(false)
    })
  })

  describe('nearestNeighbor', () => {
    it('should return null for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.nearestNeighbor([0, 0])).toBeNull()
    })

    it('should return the single point', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.nearestNeighbor([0, 0])).toEqual([5, 5])
    })

    it('should return closest point among several', () => {
      const tree = new RangeTree([[1, 1], [5, 5], [10, 10]])
      expect(tree.nearestNeighbor([4, 4])).toEqual([5, 5])
    })

    it('should return exact match when query is a point', () => {
      const tree = new RangeTree([[1, 1], [5, 5], [10, 10]])
      expect(tree.nearestNeighbor([5, 5])).toEqual([5, 5])
    })

    it('should handle equidistant points by returning one of them', () => {
      const tree = new RangeTree([[0, 1], [0, -1]])
      const result = tree.nearestNeighbor([0, 0])
      expect(result).toBeDefined()
      expect(result![0]).toBe(0)
      expect(Math.abs(result![1])).toBe(1)
    })

    it('should find nearest among negative coordinates', () => {
      const tree = new RangeTree([[-10, -10], [-5, -5]])
      expect(tree.nearestNeighbor([-4, -4])).toEqual([-5, -5])
    })

    it('should find nearest with large distance', () => {
      const tree = new RangeTree([[1000, 1000], [1, 1]])
      expect(tree.nearestNeighbor([0, 0])).toEqual([1, 1])
    })

    it('should find nearest among many points', () => {
      const points: Point2D[] = Array.from({ length: 20 }, (_, i) => [i * 10, i * 10] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.nearestNeighbor([15, 15])).toEqual([10, 10])
    })
  })

  describe('kNearest', () => {
    it('should return empty for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.kNearest([0, 0], 3)).toEqual([])
    })

    it('should return empty for k=0', () => {
      const tree = new RangeTree([[1, 1], [2, 2]])
      expect(tree.kNearest([0, 0], 0)).toEqual([])
    })

    it('should return single nearest for k=1', () => {
      const tree = new RangeTree([[1, 1], [5, 5], [10, 10]])
      const result = tree.kNearest([4, 4], 1)
      expect(result).toEqual([[5, 5]])
    })

    it('should return k nearest points', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]])
      const result = tree.kNearest([3, 3], 3)
      expect(result.length).toBe(3)
      expect(result[0]).toEqual([3, 3])
    })

    it('should return all points when k exceeds size', () => {
      const tree = new RangeTree([[1, 1], [2, 2]])
      const result = tree.kNearest([0, 0], 10)
      expect(result.length).toBe(2)
    })

    it('should return results sorted by distance', () => {
      const tree = new RangeTree([[10, 10], [1, 1], [5, 5]])
      const result = tree.kNearest([0, 0], 3)
      expect(result.length).toBe(3)
      const d0 = (result[0]![0] - 0) ** 2 + (result[0]![1] - 0) ** 2
      const d1 = (result[1]![0] - 0) ** 2 + (result[1]![1] - 0) ** 2
      const d2 = (result[2]![0] - 0) ** 2 + (result[2]![1] - 0) ** 2
      expect(d0).toBeLessThanOrEqual(d1)
      expect(d1).toBeLessThanOrEqual(d2)
    })

    it('should handle k nearest with negative coords', () => {
      const tree = new RangeTree([[-1, -1], [-5, -5], [-10, -10]])
      const result = tree.kNearest([0, 0], 2)
      expect(result.length).toBe(2)
      expect(result[0]).toEqual([-1, -1])
    })

    it('should handle k nearest with identical distances', () => {
      const tree = new RangeTree([[1, 0], [-1, 0], [0, 1]])
      const result = tree.kNearest([0, 0], 3)
      expect(result.length).toBe(3)
    })

    it('should handle negative k', () => {
      const tree = new RangeTree([[1, 1]])
      expect(tree.kNearest([0, 0], -1)).toEqual([])
    })
  })

  describe('allPoints', () => {
    it('should return empty array for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.allPoints()).toEqual([])
    })

    it('should return all inserted points', () => {
      const points: Point2D[] = [[1, 2], [3, 4], [5, 6]]
      const tree = new RangeTree(points)
      const result = tree.allPoints()
      expect(result.length).toBe(3)
      for (const p of points) {
        expect(result.some((r) => r[0] === p[0] && r[1] === p[1])).toBe(true)
      }
    })

    it('should return a copy of points', () => {
      const tree = new RangeTree([[1, 2]])
      const pts = tree.allPoints()
      pts[0]![0] = 999
      expect(tree.allPoints()[0]![0]).toBe(1)
    })

    it('should return points in original order', () => {
      const points: Point2D[] = [[3, 3], [1, 1], [2, 2]]
      const tree = new RangeTree(points)
      const result = tree.allPoints()
      expect(result).toEqual([[3, 3], [1, 1], [2, 2]])
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.size()).toBe(0)
    })

    it('should return correct count for populated tree', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.size()).toBe(3)
    })

    it('should count duplicate points separately', () => {
      const tree = new RangeTree([[1, 1], [1, 1]])
      expect(tree.size()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new RangeTree([])
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false for non-empty tree', () => {
      const tree = new RangeTree([[1, 1]])
      expect(tree.isEmpty()).toBe(false)
    })
  })

  describe('collinear points', () => {
    it('should handle all points with same x coordinate', () => {
      const tree = new RangeTree([[5, 1], [5, 2], [5, 3], [5, 4], [5, 5]])
      expect(tree.size()).toBe(5)
      const result = tree.rangeQuery(5, 5, 2, 4)
      expect(result.length).toBe(3)
    })

    it('should handle all points with same y coordinate', () => {
      const tree = new RangeTree([[1, 5], [2, 5], [3, 5], [4, 5], [5, 5]])
      expect(tree.size()).toBe(5)
      const result = tree.rangeQuery(2, 4, 5, 5)
      expect(result.length).toBe(3)
    })

    it('should handle all points with same x and y', () => {
      const tree = new RangeTree([[3, 3], [3, 3], [3, 3]])
      expect(tree.size()).toBe(3)
      const result = tree.rangeQuery(3, 3, 3, 3)
      expect(result.length).toBe(3)
    })

    it('should range query all same-x points', () => {
      const tree = new RangeTree([[2, 1], [2, 5], [2, 10]])
      const result = tree.rangeQuery(0, 100, 0, 100)
      expect(result.length).toBe(3)
    })

    it('should range query all same-y points', () => {
      const tree = new RangeTree([[1, 5], [5, 5], [10, 5]])
      const result = tree.rangeQuery(0, 100, 0, 100)
      expect(result.length).toBe(3)
    })
  })

  describe('duplicate coordinates', () => {
    it('should handle duplicate points', () => {
      const tree = new RangeTree([[1, 1], [1, 1]])
      expect(tree.size()).toBe(2)
    })

    it('should return all duplicates in range query', () => {
      const tree = new RangeTree([[2, 2], [2, 2], [2, 2]])
      const result = tree.rangeQuery(0, 10, 0, 10)
      expect(result.length).toBe(3)
    })

    it('should find duplicate with contains', () => {
      const tree = new RangeTree([[5, 5], [5, 5]])
      expect(tree.contains([5, 5])).toBe(true)
    })

    it('should count duplicates in rangeCount', () => {
      const tree = new RangeTree([[3, 3], [3, 3]])
      expect(tree.rangeCount(0, 10, 0, 10)).toBe(2)
    })

    it('should handle mix of duplicate and unique points', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [1, 1]])
      expect(tree.size()).toBe(3)
      expect(tree.rangeCount(0, 10, 0, 10)).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle very small range', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.rangeQuery(5, 5, 5, 5)).toEqual([[5, 5]])
    })

    it('should handle very large range', () => {
      const tree = new RangeTree([[5, 5]])
      const result = tree.rangeQuery(-1e15, 1e15, -1e15, 1e15)
      expect(result).toEqual([[5, 5]])
    })

    it('should handle range with no results', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.rangeQuery(0, 4, 0, 4)).toEqual([])
    })

    it('should handle range query where xMin > xMax gracefully', () => {
      const tree = new RangeTree([[5, 5]])
      const result = tree.rangeQuery(10, 0, 0, 10)
      expect(result).toEqual([])
    })

    it('should handle range query where yMin > yMax gracefully', () => {
      const tree = new RangeTree([[5, 5]])
      const result = tree.rangeQuery(0, 10, 10, 0)
      expect(result).toEqual([])
    })

    it('should handle points at origin', () => {
      const tree = new RangeTree([[0, 0]])
      expect(tree.rangeQuery(0, 0, 0, 0)).toEqual([[0, 0]])
    })

    it('should handle very close points', () => {
      const tree = new RangeTree([[1, 1], [1.0001, 1.0001]])
      expect(tree.size()).toBe(2)
      const result = tree.rangeQuery(0.9999, 1.0002, 0.9999, 1.0002)
      expect(result.length).toBe(2)
    })

    it('should handle extreme coordinate values', () => {
      const tree = new RangeTree([[Number.MAX_VALUE, Number.MAX_VALUE]])
      expect(tree.contains([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(true)
    })

    it('should handle zero-width range at point location', () => {
      const tree = new RangeTree([[3, 7]])
      expect(tree.rangeQuery(3, 3, 7, 7)).toEqual([[3, 7]])
    })
  })

  describe('large dataset stress test', () => {
    it('should handle 500+ points range query', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i, i * 2] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.size()).toBe(500)

      const result = tree.rangeQuery(100, 200, 200, 400)
      for (const p of result) {
        expect(p[0]).toBeGreaterThanOrEqual(100)
        expect(p[0]).toBeLessThanOrEqual(200)
        expect(p[1]).toBeGreaterThanOrEqual(200)
        expect(p[1]).toBeLessThanOrEqual(400)
      }
    })

    it('should handle 500+ points rangeCount', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i, i] as Point2D)
      const tree = new RangeTree(points)
      const count = tree.rangeCount(100, 200, 100, 200)
      expect(count).toBe(101)
    })

    it('should handle 500+ points contains', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i * 3, i * 3] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.contains([0, 0])).toBe(true)
      expect(tree.contains([1497, 1497])).toBe(true)
      expect(tree.contains([1, 1])).toBe(false)
    })

    it('should handle 500+ points nearestNeighbor', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i * 10, i * 10] as Point2D)
      const tree = new RangeTree(points)
      const nn = tree.nearestNeighbor([155, 155])
      expect(nn).toEqual([150, 150])
    })

    it('should handle 500+ points kNearest', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i, i] as Point2D)
      const tree = new RangeTree(points)
      const result = tree.kNearest([250, 250], 5)
      expect(result.length).toBe(5)
      expect(result[0]).toEqual([250, 250])
    })

    it('should handle 500+ points allPoints', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i, i] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.allPoints().length).toBe(500)
    })

    it('should handle 500+ points reportInRange', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i, i] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.reportInRange(0, 500, 0, 500)).toBe(500)
    })

    it('should handle range query returning no results on large set', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i, i] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.rangeQuery(-100, -1, -100, -1)).toEqual([])
    })

    it('should handle range query returning all results on large set', () => {
      const points: Point2D[] = Array.from({ length: 500 }, (_, i) => [i, i] as Point2D)
      const tree = new RangeTree(points)
      expect(tree.rangeQuery(-1000, 1000, -1000, 1000).length).toBe(500)
    })
  })

  describe('rangeCount matches rangeQuery', () => {
    it('should match for small range', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]])
      expect(tree.rangeCount(1, 3, 1, 3)).toBe(tree.rangeQuery(1, 3, 1, 3).length)
    })

    it('should match for full range', () => {
      const tree = new RangeTree([[1, 1], [2, 2], [3, 3]])
      expect(tree.rangeCount(-100, 100, -100, 100)).toBe(tree.rangeQuery(-100, 100, -100, 100).length)
    })

    it('should match for empty result', () => {
      const tree = new RangeTree([[5, 5]])
      expect(tree.rangeCount(0, 4, 0, 4)).toBe(tree.rangeQuery(0, 4, 0, 4).length)
    })

    it('should match for single point result', () => {
      const tree = new RangeTree([[1, 1], [5, 5], [10, 10]])
      expect(tree.rangeCount(4, 6, 4, 6)).toBe(tree.rangeQuery(4, 6, 4, 6).length)
    })

    it('should match with duplicates', () => {
      const tree = new RangeTree([[2, 2], [2, 2], [3, 3]])
      expect(tree.rangeCount(0, 10, 0, 10)).toBe(tree.rangeQuery(0, 10, 0, 10).length)
    })
  })

  describe('2D grid pattern', () => {
    it('should handle a 10x10 grid of points', () => {
      const points: Point2D[] = []
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          points.push([x, y])
        }
      }
      const tree = new RangeTree(points)
      expect(tree.size()).toBe(100)

      const result = tree.rangeQuery(2, 5, 3, 7)
      for (const p of result) {
        expect(p[0]).toBeGreaterThanOrEqual(2)
        expect(p[0]).toBeLessThanOrEqual(5)
        expect(p[1]).toBeGreaterThanOrEqual(3)
        expect(p[1]).toBeLessThanOrEqual(7)
      }
      expect(result.length).toBe(4 * 5)
    })

    it('should count correctly on grid subset', () => {
      const points: Point2D[] = []
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          points.push([x, y])
        }
      }
      const tree = new RangeTree(points)
      expect(tree.rangeCount(0, 4, 0, 4)).toBe(25)
    })

    it('should find nearest on grid', () => {
      const points: Point2D[] = []
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          points.push([x, y])
        }
      }
      const tree = new RangeTree(points)
      expect(tree.nearestNeighbor([2.4, 2.4])).toEqual([2, 2])
    })

    it('should kNearest on grid', () => {
      const points: Point2D[] = []
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          points.push([x, y])
        }
      }
      const tree = new RangeTree(points)
      const result = tree.kNearest([2, 2], 4)
      expect(result.length).toBe(4)
      expect(result[0]).toEqual([2, 2])
    })
  })

  describe('non-overlapping ranges', () => {
    it('should not return points from separate quadrants', () => {
      const tree = new RangeTree([[-10, -10], [10, 10]])
      expect(tree.rangeQuery(-20, -1, -20, -1)).toEqual([[-10, -10]])
      expect(tree.rangeQuery(1, 20, 1, 20)).toEqual([[10, 10]])
    })

    it('should handle disjoint x ranges', () => {
      const tree = new RangeTree([[1, 1], [100, 100]])
      expect(tree.rangeQuery(0, 2, 0, 2)).toEqual([[1, 1]])
      expect(tree.rangeQuery(99, 101, 99, 101)).toEqual([[100, 100]])
    })
  })
})
