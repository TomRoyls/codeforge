import { describe, it, expect, beforeEach } from 'vitest'
import { PartitionTree } from '../../src/core/partition-tree/index.js'
import type { PartitionPoint, Rectangle } from '../../src/core/partition-tree/index.js'

describe('PartitionTree', () => {
  describe('constructor', () => {
    it('should create an empty tree with no arguments', () => {
      const tree = new PartitionTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should create a tree from points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])
      expect(tree.size).toBe(3)
      expect(tree.isEmpty).toBe(false)
    })

    it('should create a tree from points with data', () => {
      const tree = new PartitionTree<string>([
        { x: 1, y: 2, data: 'a' },
        { x: 3, y: 4, data: 'b' },
      ])
      expect(tree.size).toBe(2)
    })

    it('should handle empty points array', () => {
      const tree = new PartitionTree([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should handle single point', () => {
      const tree = new PartitionTree([{ x: 5, y: 10 }])
      expect(tree.size).toBe(1)
      expect(tree.contains(5, 10)).toBe(true)
    })

    it('should create tree without data property', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const arr = tree.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 2 })
      expect(arr[1]).toEqual({ x: 3, y: 4 })
    })

    it('should handle points with negative coordinates', () => {
      const tree = new PartitionTree([{ x: -5, y: -10 }, { x: -1, y: -2 }])
      expect(tree.size).toBe(2)
      expect(tree.contains(-5, -10)).toBe(true)
    })

    it('should handle floating point coordinates', () => {
      const tree = new PartitionTree([{ x: 1.5, y: 2.7 }, { x: 3.14, y: 2.71 }])
      expect(tree.size).toBe(2)
      expect(tree.contains(1.5, 2.7)).toBe(true)
    })

    it('should handle zero coordinates', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }])
      expect(tree.size).toBe(1)
      expect(tree.contains(0, 0)).toBe(true)
    })
  })

  describe('queryRange', () => {
    let tree: PartitionTree

    beforeEach(() => {
      tree = new PartitionTree([
        { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
        { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 },
        { x: 7, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 9 }, { x: 10, y: 10 },
      ])
    })

    it('should find points within range', () => {
      const result = tree.queryRange({ minX: 3, maxX: 7, minY: 3, maxY: 7 })
      expect(result).toHaveLength(5)
    })

    it('should include boundary points', () => {
      const result = tree.queryRange({ minX: 5, maxX: 5, minY: 5, maxY: 5 })
      expect(result).toEqual([{ x: 5, y: 5 }])
    })

    it('should return empty for no matching range', () => {
      const result = tree.queryRange({ minX: 100, maxX: 200, minY: 100, maxY: 200 })
      expect(result).toEqual([])
    })

    it('should return all points for full range', () => {
      const result = tree.queryRange({ minX: 0, maxX: 11, minY: 0, maxY: 11 })
      expect(result).toHaveLength(10)
    })

    it('should return empty on empty tree', () => {
      const empty = new PartitionTree()
      expect(empty.queryRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toEqual([])
    })

    it('should handle range where only x matches', () => {
      const result = tree.queryRange({ minX: 1, maxX: 10, minY: 100, maxY: 200 })
      expect(result).toEqual([])
    })

    it('should handle range where only y matches', () => {
      const result = tree.queryRange({ minX: 100, maxX: 200, minY: 1, maxY: 10 })
      expect(result).toEqual([])
    })

    it('should find a single point', () => {
      const result = tree.queryRange({ minX: 1, maxX: 1, minY: 1, maxY: 1 })
      expect(result).toEqual([{ x: 1, y: 1 }])
    })

    it('should work with negative ranges', () => {
      const negTree = new PartitionTree([{ x: -5, y: -5 }, { x: -3, y: -3 }, { x: 0, y: 0 }, { x: 3, y: 3 }])
      const result = negTree.queryRange({ minX: -4, maxX: -2, minY: -4, maxY: -2 })
      expect(result).toEqual([{ x: -3, y: -3 }])
    })

    it('should handle wide x range with narrow y range', () => {
      const pt = new PartitionTree([
        { x: 1, y: 1 }, { x: 2, y: 10 }, { x: 3, y: 1 }, { x: 4, y: 10 },
      ])
      const result = pt.queryRange({ minX: 0, maxX: 5, minY: 0, maxY: 2 })
      expect(result).toHaveLength(2)
      expect(result).toContainEqual({ x: 1, y: 1 })
      expect(result).toContainEqual({ x: 3, y: 1 })
    })

    it('should handle narrow x range with wide y range', () => {
      const pt = new PartitionTree([
        { x: 1, y: 1 }, { x: 10, y: 2 }, { x: 1, y: 3 }, { x: 10, y: 4 },
      ])
      const result = pt.queryRange({ minX: 0, maxX: 2, minY: 0, maxY: 10 })
      expect(result).toHaveLength(2)
      expect(result).toContainEqual({ x: 1, y: 1 })
      expect(result).toContainEqual({ x: 1, y: 3 })
    })

    it('should preserve data in query results', () => {
      const dTree = new PartitionTree<string>([
        { x: 1, y: 1, data: 'a' },
        { x: 2, y: 2, data: 'b' },
        { x: 3, y: 3, data: 'c' },
      ])
      const result = dTree.queryRange({ minX: 1, maxX: 2, minY: 1, maxY: 2 })
      expect(result).toEqual([
        { x: 1, y: 1, data: 'a' },
        { x: 2, y: 2, data: 'b' },
      ])
    })

    it('should handle query after addPoint', () => {
      tree.addPoint({ x: 5, y: 15 })
      const result = tree.queryRange({ minX: 5, maxX: 5, minY: 15, maxY: 15 })
      expect(result).toEqual([{ x: 5, y: 15 }])
    })

    it('should handle query after removePoint', () => {
      tree.removePoint(5, 5)
      const result = tree.queryRange({ minX: 5, maxX: 5, minY: 5, maxY: 5 })
      expect(result).toEqual([])
    })
  })

  describe('countRange', () => {
    let tree: PartitionTree

    beforeEach(() => {
      tree = new PartitionTree([
        { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
        { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 },
        { x: 7, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 9 }, { x: 10, y: 10 },
      ])
    })

    it('should count points within range', () => {
      expect(tree.countRange({ minX: 3, maxX: 7, minY: 3, maxY: 7 })).toBe(5)
    })

    it('should count single point', () => {
      expect(tree.countRange({ minX: 5, maxX: 5, minY: 5, maxY: 5 })).toBe(1)
    })

    it('should return 0 for no matching range', () => {
      expect(tree.countRange({ minX: 100, maxX: 200, minY: 100, maxY: 200 })).toBe(0)
    })

    it('should count all points for full range', () => {
      expect(tree.countRange({ minX: 0, maxX: 11, minY: 0, maxY: 11 })).toBe(10)
    })

    it('should return 0 on empty tree', () => {
      const empty = new PartitionTree()
      expect(empty.countRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toBe(0)
    })

    it('should agree with queryRange length', () => {
      const rect: Rectangle = { minX: 2, maxX: 8, minY: 3, maxY: 7 }
      const count = tree.countRange(rect)
      const queried = tree.queryRange(rect)
      expect(count).toBe(queried.length)
    })

    it('should handle count with only x in range', () => {
      expect(tree.countRange({ minX: 1, maxX: 10, minY: 100, maxY: 200 })).toBe(0)
    })

    it('should handle count with only y in range', () => {
      expect(tree.countRange({ minX: 100, maxX: 200, minY: 1, maxY: 10 })).toBe(0)
    })

    it('should count after addPoint', () => {
      tree.addPoint({ x: 5, y: 15 })
      expect(tree.countRange({ minX: 5, maxX: 5, minY: 15, maxY: 15 })).toBe(1)
    })

    it('should count after removePoint', () => {
      tree.removePoint(5, 5)
      expect(tree.countRange({ minX: 5, maxX: 5, minY: 5, maxY: 5 })).toBe(0)
    })

    it('should handle negative ranges', () => {
      const negTree = new PartitionTree([{ x: -5, y: -5 }, { x: -3, y: -3 }, { x: 0, y: 0 }])
      expect(negTree.countRange({ minX: -6, maxX: -2, minY: -6, maxY: -2 })).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(new PartitionTree().size).toBe(0)
    })

    it('should return correct size from constructor', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])
      expect(tree.size).toBe(3)
    })

    it('should return correct size after addPoint', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.addPoint({ x: 3, y: 4 })
      expect(tree.size).toBe(2)
    })

    it('should return correct size after removePoint', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      tree.removePoint(1, 2)
      expect(tree.size).toBe(1)
    })

    it('should return correct size after clear', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      expect(new PartitionTree().isEmpty).toBe(true)
    })

    it('should return false after construction with points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      expect(tree.isEmpty).toBe(false)
    })

    it('should return true after removing all points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.removePoint(1, 2)
      expect(tree.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })

    it('should return false after addPoint to empty tree', () => {
      const tree = new PartitionTree()
      tree.addPoint({ x: 1, y: 2 })
      expect(tree.isEmpty).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return all points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])
      const arr = tree.toArray()
      expect(arr).toHaveLength(3)
    })

    it('should return empty array for empty tree', () => {
      expect(new PartitionTree().toArray()).toEqual([])
    })

    it('should return copies of points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const arr = tree.toArray()
      arr[0]!.x = 999
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('should preserve data in returned points', () => {
      const tree = new PartitionTree<string>([{ x: 1, y: 2, data: 'test' }])
      const arr = tree.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 2, data: 'test' })
    })

    it('should return all points after mutations', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.addPoint({ x: 3, y: 4 })
      expect(tree.toArray()).toHaveLength(2)
    })
  })

  describe('forEach', () => {
    it('should iterate all points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])
      const collected: PartitionPoint[] = []
      tree.forEach((p) => collected.push(p))
      expect(collected).toHaveLength(3)
    })

    it('should provide correct indices', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const indices: number[] = []
      tree.forEach((_p, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('should not iterate on empty tree', () => {
      const tree = new PartitionTree()
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide copies of points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.forEach((p) => {
        p.x = 999
      })
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('should iterate with correct point values', () => {
      const tree = new PartitionTree([{ x: 10, y: 20 }, { x: 30, y: 40 }])
      const xs: number[] = []
      tree.forEach((p) => xs.push(p.x))
      expect(xs).toContain(10)
      expect(xs).toContain(30)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should be iterable', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const result = [...tree]
      expect(result).toHaveLength(2)
    })

    it('should work with for...of', () => {
      const tree = new PartitionTree([{ x: 10, y: 20 }, { x: 30, y: 40 }, { x: 50, y: 60 }])
      const collected: PartitionPoint[] = []
      for (const point of tree) {
        collected.push(point)
      }
      expect(collected).toHaveLength(3)
    })

    it('should handle empty tree iteration', () => {
      const tree = new PartitionTree()
      const result = [...tree]
      expect(result).toEqual([])
    })

    it('should return copies of points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      for (const p of tree) {
        p.x = 999
      }
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('should work with destructuring', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const [first, second] = tree
      expect(first).toBeDefined()
      expect(second).toBeDefined()
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const cloned = tree.clone()
      expect(cloned.size).toBe(tree.size)
      expect(cloned.contains(1, 2)).toBe(true)
    })

    it('should not affect original when modified', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const cloned = tree.clone()
      cloned.removePoint(1, 2)
      expect(tree.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('should clone empty tree', () => {
      const tree = new PartitionTree()
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('should preserve query results in clone', () => {
      const tree = new PartitionTree([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }])
      const cloned = tree.clone()
      const rect: Rectangle = { minX: 1, maxX: 2, minY: 1, maxY: 2 }
      expect(cloned.queryRange(rect)).toHaveLength(tree.queryRange(rect).length)
    })

    it('should preserve data in clone', () => {
      const tree = new PartitionTree<string>([{ x: 1, y: 2, data: 'test' }])
      const cloned = tree.clone()
      const arr = cloned.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 2, data: 'test' })
    })

    it('should not share point references with original', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const cloned = tree.clone()
      cloned.addPoint({ x: 5, y: 6 })
      expect(tree.size).toBe(1)
      expect(cloned.size).toBe(2)
    })
  })

  describe('static fromArray', () => {
    it('should create tree from points', () => {
      const tree = PartitionTree.fromArray([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      expect(tree.size).toBe(2)
    })

    it('should create tree with data', () => {
      const tree = PartitionTree.fromArray<string>([{ x: 1, y: 2, data: 'a' }])
      expect(tree.size).toBe(1)
      const arr = tree.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 2, data: 'a' })
    })

    it('should create empty tree from empty array', () => {
      const tree = PartitionTree.fromArray([])
      expect(tree.isEmpty).toBe(true)
    })

    it('should create tree that supports range queries', () => {
      const tree = PartitionTree.fromArray([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }])
      expect(tree.queryRange({ minX: 1, maxX: 2, minY: 1, maxY: 2 })).toHaveLength(2)
    })

    it('should create independent instance', () => {
      const pts = [{ x: 1, y: 2 }]
      const tree = PartitionTree.fromArray(pts)
      tree.addPoint({ x: 5, y: 6 })
      expect(pts).toHaveLength(1)
    })
  })

  describe('contains', () => {
    let tree: PartitionTree

    beforeEach(() => {
      tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])
    })

    it('should return true for existing point', () => {
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('should return true for all existing points', () => {
      expect(tree.contains(1, 2)).toBe(true)
      expect(tree.contains(3, 4)).toBe(true)
      expect(tree.contains(5, 6)).toBe(true)
    })

    it('should return false for non-existing point', () => {
      expect(tree.contains(10, 20)).toBe(false)
    })

    it('should return false when x matches but y does not', () => {
      expect(tree.contains(1, 99)).toBe(false)
    })

    it('should return false when y matches but x does not', () => {
      expect(tree.contains(99, 2)).toBe(false)
    })

    it('should return false on empty tree', () => {
      const empty = new PartitionTree()
      expect(empty.contains(1, 2)).toBe(false)
    })

    it('should find point after addPoint', () => {
      tree.addPoint({ x: 7, y: 8 })
      expect(tree.contains(7, 8)).toBe(true)
    })

    it('should not find point after removePoint', () => {
      tree.removePoint(1, 2)
      expect(tree.contains(1, 2)).toBe(false)
    })
  })

  describe('nearest', () => {
    it('should find the nearest point', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 5 }])
      const result = tree.nearest(1, 1)
      expect(result).toEqual({ x: 0, y: 0 })
    })

    it('should find exact match when query is a point', () => {
      const tree = new PartitionTree([{ x: 1, y: 1 }, { x: 5, y: 5 }, { x: 10, y: 10 }])
      expect(tree.nearest(5, 5)).toEqual({ x: 5, y: 5 })
    })

    it('should return undefined for empty tree', () => {
      const tree = new PartitionTree()
      expect(tree.nearest(1, 1)).toBeUndefined()
    })

    it('should work with single point tree', () => {
      const tree = new PartitionTree([{ x: 3, y: 7 }])
      expect(tree.nearest(0, 0)).toEqual({ x: 3, y: 7 })
    })

    it('should handle negative coordinates', () => {
      const tree = new PartitionTree([{ x: -10, y: -10 }, { x: 0, y: 0 }, { x: 10, y: 10 }])
      expect(tree.nearest(-9, -9)).toEqual({ x: -10, y: -10 })
    })

    it('should return a copy of the point', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const nn = tree.nearest(0, 0)!
      nn.x = 999
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('should find nearest with many points', () => {
      const points: Array<{ x: number; y: number }> = []
      for (let i = 0; i < 100; i++) {
        points.push({ x: i, y: i })
      }
      const tree = new PartitionTree(points)
      expect(tree.nearest(50.1, 50.1)).toEqual({ x: 50, y: 50 })
    })

    it('should handle tie-breaking by first found', () => {
      const tree = new PartitionTree([{ x: 1, y: 0 }, { x: -1, y: 0 }])
      const result = tree.nearest(0, 0)
      expect(result).toBeDefined()
      expect(Math.abs(result!.x)).toBe(1)
    })

    it('should preserve data in nearest result', () => {
      const tree = new PartitionTree<string>([
        { x: 0, y: 0, data: 'zero' },
        { x: 10, y: 10, data: 'ten' },
      ])
      const result = tree.nearest(1, 1)
      expect(result).toEqual({ x: 0, y: 0, data: 'zero' })
    })

    it('should find nearest after addPoint', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }, { x: 10, y: 10 }])
      tree.addPoint({ x: 5, y: 5 })
      expect(tree.nearest(4, 4)).toEqual({ x: 5, y: 5 })
    })
  })

  describe('kNearest', () => {
    it('should find k nearest neighbors', () => {
      const tree = new PartitionTree([
        { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 },
      ])
      const result = tree.kNearest(2.5, 2.5, 3)
      expect(result).toHaveLength(3)
    })

    it('should return results sorted by distance', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }])
      const result = tree.kNearest(4, 4, 3)
      let prevDist = -1
      for (const p of result) {
        const d = (p.x - 4) ** 2 + (p.y - 4) ** 2
        expect(d).toBeGreaterThanOrEqual(prevDist)
        prevDist = d
      }
    })

    it('should return empty for k=0', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      expect(tree.kNearest(1, 2, 0)).toEqual([])
    })

    it('should return empty for negative k', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      expect(tree.kNearest(1, 2, -1)).toEqual([])
    })

    it('should return empty for empty tree', () => {
      const tree = new PartitionTree()
      expect(tree.kNearest(1, 1, 3)).toEqual([])
    })

    it('should handle k larger than tree size', () => {
      const tree = new PartitionTree([{ x: 1, y: 1 }, { x: 2, y: 2 }])
      const result = tree.kNearest(0, 0, 10)
      expect(result).toHaveLength(2)
    })

    it('should find 1 nearest neighbor', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }])
      const result = tree.kNearest(4, 4, 1)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ x: 5, y: 5 })
    })

    it('should return copies of points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const knn = tree.kNearest(0, 0, 2)
      knn[0]!.x = 999
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('should preserve data in results', () => {
      const tree = new PartitionTree<string>([
        { x: 0, y: 0, data: 'a' },
        { x: 1, y: 1, data: 'b' },
      ])
      const result = tree.kNearest(0, 0, 2)
      expect(result).toHaveLength(2)
      expect(result.some((p) => p.data === 'a')).toBe(true)
      expect(result.some((p) => p.data === 'b')).toBe(true)
    })

    it('should handle many points efficiently', () => {
      const points: Array<{ x: number; y: number }> = []
      for (let i = 0; i < 200; i++) {
        points.push({ x: i, y: i })
      }
      const tree = new PartitionTree(points)
      const result = tree.kNearest(100, 100, 5)
      expect(result).toHaveLength(5)
    })
  })

  describe('addPoint', () => {
    let tree: PartitionTree

    beforeEach(() => {
      tree = new PartitionTree()
    })

    it('should add a point to empty tree', () => {
      tree.addPoint({ x: 1, y: 2 })
      expect(tree.size).toBe(1)
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('should add multiple points', () => {
      tree.addPoint({ x: 1, y: 2 })
      tree.addPoint({ x: 3, y: 4 })
      tree.addPoint({ x: 5, y: 6 })
      expect(tree.size).toBe(3)
    })

    it('should support range queries after add', () => {
      tree.addPoint({ x: 5, y: 5 })
      tree.addPoint({ x: 10, y: 10 })
      expect(tree.queryRange({ minX: 0, maxX: 7, minY: 0, maxY: 7 })).toEqual([{ x: 5, y: 5 }])
    })

    it('should support countRange after add', () => {
      tree.addPoint({ x: 5, y: 5 })
      tree.addPoint({ x: 10, y: 10 })
      expect(tree.countRange({ minX: 0, maxX: 7, minY: 0, maxY: 7 })).toBe(1)
    })

    it('should add point with data', () => {
      const t = new PartitionTree<string>()
      t.addPoint({ x: 1, y: 2, data: 'test' })
      const arr = t.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 2, data: 'test' })
    })

    it('should add duplicate points', () => {
      tree.addPoint({ x: 1, y: 2 })
      tree.addPoint({ x: 1, y: 2 })
      expect(tree.size).toBe(2)
    })

    it('should handle negative coordinates', () => {
      tree.addPoint({ x: -5, y: -10 })
      expect(tree.contains(-5, -10)).toBe(true)
    })

    it('should handle floating point coordinates', () => {
      tree.addPoint({ x: 1.5, y: 2.5 })
      expect(tree.contains(1.5, 2.5)).toBe(true)
    })
  })

  describe('removePoint', () => {
    let tree: PartitionTree

    beforeEach(() => {
      tree = new PartitionTree([
        { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, { x: 7, y: 8 }, { x: 9, y: 10 },
      ])
    })

    it('should remove an existing point', () => {
      const result = tree.removePoint(3, 4)
      expect(result).toBe(true)
      expect(tree.size).toBe(4)
    })

    it('should return false for non-existing point', () => {
      const result = tree.removePoint(100, 200)
      expect(result).toBe(false)
      expect(tree.size).toBe(5)
    })

    it('should remove first occurrence of duplicate', () => {
      const dupTree = new PartitionTree([{ x: 1, y: 2 }, { x: 1, y: 2 }])
      dupTree.removePoint(1, 2)
      expect(dupTree.size).toBe(1)
    })

    it('should remove all points one by one', () => {
      tree.removePoint(1, 2)
      tree.removePoint(3, 4)
      tree.removePoint(5, 6)
      tree.removePoint(7, 8)
      tree.removePoint(9, 10)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should support queries after removal', () => {
      tree.removePoint(5, 6)
      const result = tree.queryRange({ minX: 3, maxX: 7, minY: 3, maxY: 7 })
      expect(result).toHaveLength(1)
      expect(result).toContainEqual({ x: 3, y: 4 })
    })

    it('should handle remove from empty tree', () => {
      const empty = new PartitionTree()
      expect(empty.removePoint(1, 2)).toBe(false)
    })

    it('should handle remove from single element tree', () => {
      const single = new PartitionTree([{ x: 5, y: 5 }])
      expect(single.removePoint(5, 5)).toBe(true)
      expect(single.size).toBe(0)
    })

    it('should update countRange after removal', () => {
      tree.removePoint(3, 4)
      expect(tree.countRange({ minX: 1, maxX: 9, minY: 1, maxY: 10 })).toBe(4)
    })
  })

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should work on already empty tree', () => {
      const tree = new PartitionTree()
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow insertions after clear', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.clear()
      tree.addPoint({ x: 5, y: 6 })
      expect(tree.size).toBe(1)
      expect(tree.contains(5, 6)).toBe(true)
    })

    it('should clear query results', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.clear()
      expect(tree.queryRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toEqual([])
    })

    it('should clear bounds', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.clear()
      expect(tree.bounds()).toBeUndefined()
    })

    it('should clear countRange', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.clear()
      expect(tree.countRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toBe(0)
    })
  })

  describe('bounds', () => {
    it('should return undefined for empty tree', () => {
      expect(new PartitionTree().bounds()).toBeUndefined()
    })

    it('should return bounds for single point', () => {
      const tree = new PartitionTree([{ x: 5, y: 10 }])
      expect(tree.bounds()).toEqual({ minX: 5, maxX: 5, minY: 10, maxY: 10 })
    })

    it('should return bounds for multiple points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 5, y: 8 }, { x: 3, y: 4 }])
      expect(tree.bounds()).toEqual({ minX: 1, maxX: 5, minY: 2, maxY: 8 })
    })

    it('should handle negative coordinates', () => {
      const tree = new PartitionTree([{ x: -10, y: -5 }, { x: 10, y: 5 }])
      expect(tree.bounds()).toEqual({ minX: -10, maxX: 10, minY: -5, maxY: 5 })
    })

    it('should update bounds after addPoint', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }])
      tree.addPoint({ x: 10, y: 10 })
      expect(tree.bounds()).toEqual({ minX: 0, maxX: 10, minY: 0, maxY: 10 })
    })

    it('should update bounds after removePoint', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }, { x: 10, y: 10 }])
      tree.removePoint(0, 0)
      expect(tree.bounds()).toEqual({ minX: 10, maxX: 10, minY: 10, maxY: 10 })
    })

    it('should handle all same points', () => {
      const tree = new PartitionTree([{ x: 5, y: 5 }, { x: 5, y: 5 }])
      expect(tree.bounds()).toEqual({ minX: 5, maxX: 5, minY: 5, maxY: 5 })
    })

    it('should handle floating point bounds', () => {
      const tree = new PartitionTree([{ x: 1.5, y: 2.5 }, { x: 3.5, y: 4.5 }])
      expect(tree.bounds()).toEqual({ minX: 1.5, maxX: 3.5, minY: 2.5, maxY: 4.5 })
    })
  })

  describe('immutability', () => {
    it('queryRange should not modify internal state', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.queryRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('nearest should return a copy', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const nn = tree.nearest(0, 0)!
      nn.x = 999
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('kNearest should return copies', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const knn = tree.kNearest(0, 0, 2)
      knn[0]!.x = 999
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('toArray should return copies', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const arr = tree.toArray()
      arr[0]!.x = 999
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('forEach should provide copies', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      tree.forEach((p) => {
        p.x = 999
      })
      expect(tree.contains(1, 2)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle large number of points', () => {
      const points: Array<{ x: number; y: number }> = []
      for (let i = 0; i < 1000; i++) {
        points.push({ x: i, y: i * 2 })
      }
      const tree = new PartitionTree(points)
      expect(tree.size).toBe(1000)
      expect(tree.contains(500, 1000)).toBe(true)
    })

    it('should handle points with same x coordinate', () => {
      const tree = new PartitionTree([{ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }])
      expect(tree.queryRange({ minX: 5, maxX: 5, minY: 1, maxY: 3 })).toHaveLength(3)
    })

    it('should handle points with same y coordinate', () => {
      const tree = new PartitionTree([{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }])
      expect(tree.queryRange({ minX: 1, maxX: 3, minY: 5, maxY: 5 })).toHaveLength(3)
    })

    it('should handle all same points', () => {
      const tree = new PartitionTree([{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }])
      expect(tree.size).toBe(3)
      expect(tree.countRange({ minX: 1, maxX: 1, minY: 1, maxY: 1 })).toBe(3)
    })

    it('should handle very large coordinates', () => {
      const tree = new PartitionTree([{ x: 1e10, y: 1e10 }, { x: 1e10 + 1, y: 1e10 + 1 }])
      expect(tree.contains(1e10, 1e10)).toBe(true)
    })

    it('should handle very small coordinates', () => {
      const tree = new PartitionTree([{ x: 1e-10, y: 1e-10 }, { x: 2e-10, y: 2e-10 }])
      expect(tree.contains(1e-10, 1e-10)).toBe(true)
    })

    it('should handle range covering no points', () => {
      const tree = new PartitionTree([{ x: 5, y: 5 }])
      expect(tree.queryRange({ minX: 0, maxX: 4, minY: 0, maxY: 4 })).toEqual([])
    })

    it('should handle range covering all points exactly', () => {
      const tree = new PartitionTree([{ x: 1, y: 1 }, { x: 3, y: 3 }])
      expect(tree.queryRange({ minX: 1, maxX: 3, minY: 1, maxY: 3 })).toHaveLength(2)
    })

    it('should handle single point tree queries', () => {
      const tree = new PartitionTree([{ x: 5, y: 5 }])
      expect(tree.queryRange({ minX: 5, maxX: 5, minY: 5, maxY: 5 })).toEqual([{ x: 5, y: 5 }])
      expect(tree.countRange({ minX: 5, maxX: 5, minY: 5, maxY: 5 })).toBe(1)
      expect(tree.nearest(5, 5)).toEqual({ x: 5, y: 5 })
    })

    it('should handle consecutive add and remove', () => {
      const tree = new PartitionTree()
      tree.addPoint({ x: 1, y: 2 })
      tree.addPoint({ x: 3, y: 4 })
      tree.removePoint(1, 2)
      tree.addPoint({ x: 5, y: 6 })
      expect(tree.size).toBe(2)
      expect(tree.contains(3, 4)).toBe(true)
      expect(tree.contains(5, 6)).toBe(true)
    })
  })

  describe('data handling', () => {
    it('should store and retrieve data', () => {
      const tree = new PartitionTree<number>([
        { x: 1, y: 2, data: 100 },
        { x: 3, y: 4, data: 200 },
      ])
      const arr = tree.toArray()
      expect(arr.find((p) => p.x === 1 && p.y === 2)).toEqual({ x: 1, y: 2, data: 100 })
    })

    it('should preserve data through queryRange', () => {
      const tree = new PartitionTree<string>([
        { x: 1, y: 1, data: 'a' },
        { x: 2, y: 2, data: 'b' },
        { x: 3, y: 3, data: 'c' },
      ])
      const result = tree.queryRange({ minX: 1, maxX: 2, minY: 1, maxY: 2 })
      expect(result).toEqual([{ x: 1, y: 1, data: 'a' }, { x: 2, y: 2, data: 'b' }])
    })

    it('should preserve data through nearest', () => {
      const tree = new PartitionTree<number>([{ x: 1, y: 1, data: 42 }])
      expect(tree.nearest(0, 0)).toEqual({ x: 1, y: 1, data: 42 })
    })

    it('should preserve data through kNearest', () => {
      const tree = new PartitionTree<string>([
        { x: 0, y: 0, data: 'origin' },
        { x: 1, y: 1, data: 'near' },
      ])
      const result = tree.kNearest(0, 0, 2)
      expect(result[0]).toEqual({ x: 0, y: 0, data: 'origin' })
      expect(result[1]).toEqual({ x: 1, y: 1, data: 'near' })
    })

    it('should preserve data through addPoint', () => {
      const tree = new PartitionTree<string>()
      tree.addPoint({ x: 1, y: 2, data: 'hello' })
      const arr = tree.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 2, data: 'hello' })
    })

    it('should preserve data through clone', () => {
      const tree = new PartitionTree<number>([{ x: 1, y: 2, data: 99 }])
      const cloned = tree.clone()
      const arr = cloned.toArray()
      expect(arr[0]).toEqual({ x: 1, y: 2, data: 99 })
    })

    it('should preserve data through forEach', () => {
      const tree = new PartitionTree<string>([{ x: 1, y: 2, data: 'test' }])
      tree.forEach((p) => {
        expect(p.data).toBe('test')
      })
    })

    it('should preserve data through iterator', () => {
      const tree = new PartitionTree<number>([{ x: 1, y: 2, data: 42 }])
      for (const p of tree) {
        expect(p.data).toBe(42)
      }
    })
  })
})

describe('PartitionTree type exports', () => {
  it('should export PartitionPoint type', () => {
    const point: PartitionPoint = { x: 1, y: 2 }
    expect(point.x).toBe(1)
    expect(point.y).toBe(2)
  })

  it('should export PartitionPoint with data type', () => {
    const point: PartitionPoint<string> = { x: 1, y: 2, data: 'test' }
    expect(point.data).toBe('test')
  })

  it('should export Rectangle type', () => {
    const rect: Rectangle = { minX: 0, maxX: 10, minY: 0, maxY: 10 }
    expect(rect.minX).toBe(0)
    expect(rect.maxX).toBe(10)
  })
})
