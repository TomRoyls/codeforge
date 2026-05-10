import { describe, it, expect, beforeEach } from 'vitest'
import { QuadTree } from '../../src/core/quadtree/quadtree.js'
import { DEFAULT_CAPACITY } from '../../src/core/quadtree/types.js'
import type { Rect, QuadTreePoint, QuadTreeOptions, QuadTreeStats } from '../../src/core/quadtree/types.js'

describe('QuadTree', () => {
  const defaultBounds: Rect = { x: 0, y: 0, width: 100, height: 100 }
  let tree: QuadTree<string>

  beforeEach(() => {
    tree = new QuadTree<string>({ bounds: defaultBounds })
  })

  describe('constructor', () => {
    it('should create an empty quadtree with default capacity', () => {
      const qt = new QuadTree({ bounds: defaultBounds })
      expect(qt.size).toBe(0)
      expect(qt.depth).toBe(0)
    })

    it('should accept custom capacity', () => {
      const qt = new QuadTree({ bounds: defaultBounds, capacity: 2 })
      expect(qt.getStats().size).toBe(0)
    })

    it('should use DEFAULT_CAPACITY when capacity not specified', () => {
      expect(DEFAULT_CAPACITY).toBe(4)
    })

    it('should store bounds', () => {
      const qt = new QuadTree({ bounds: { x: 10, y: 20, width: 50, height: 60 } })
      expect(qt.getBounds()).toEqual({ x: 10, y: 20, width: 50, height: 60 })
    })

    it('should not share bounds reference', () => {
      const b: Rect = { x: 0, y: 0, width: 100, height: 100 }
      const qt = new QuadTree({ bounds: b })
      b.x = 999
      expect(qt.getBounds().x).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single point', () => {
      expect(tree.insert(10, 10, 'a')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should insert point without value', () => {
      const qt = new QuadTree({ bounds: defaultBounds })
      expect(qt.insert(10, 10)).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('should return false for point outside bounds', () => {
      expect(tree.insert(-1, -1, 'a')).toBe(false)
      expect(tree.insert(100, 50, 'a')).toBe(false)
      expect(tree.insert(50, 100, 'a')).toBe(false)
      expect(tree.size).toBe(0)
    })

    it('should insert multiple points', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      expect(tree.size).toBe(3)
    })

    it('should subdivide when capacity is exceeded', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 2 })
      qt.insert(10, 10, 'a')
      qt.insert(20, 20, 'b')
      qt.insert(30, 30, 'c')
      expect(qt.size).toBe(3)
      expect(qt.depth).toBeGreaterThan(1)
    })

    it('should handle points on boundary edges', () => {
      expect(tree.insert(0, 0, 'origin')).toBe(true)
      expect(tree.insert(99, 0, 'right')).toBe(true)
      expect(tree.insert(0, 99, 'bottom')).toBe(true)
      expect(tree.size).toBe(3)
    })

    it('should reject point at right edge', () => {
      expect(tree.insert(100, 50, 'out')).toBe(false)
    })

    it('should reject point at bottom edge', () => {
      expect(tree.insert(50, 100, 'out')).toBe(false)
    })

    it('should handle negative coordinate bounds', () => {
      const qt = new QuadTree<string>({ bounds: { x: -100, y: -100, width: 200, height: 200 } })
      expect(qt.insert(-50, -50, 'neg')).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('should handle duplicate positions', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      expect(tree.size).toBe(2)
    })

    it('should return boolean', () => {
      const r1 = tree.insert(50, 50, 'a')
      const r2 = tree.insert(200, 200, 'b')
      expect(r1).toBe(true)
      expect(r2).toBe(false)
    })

    it('should insert up to capacity without subdividing', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 4 })
      qt.insert(10, 10, 'a')
      qt.insert(20, 20, 'b')
      qt.insert(30, 30, 'c')
      qt.insert(40, 40, 'd')
      expect(qt.size).toBe(4)
      expect(qt.depth).toBe(1)
    })

    it('should subdivide on the (capacity+1)th insert', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 4 })
      qt.insert(10, 10, 'a')
      qt.insert(20, 20, 'b')
      qt.insert(30, 30, 'c')
      qt.insert(40, 40, 'd')
      qt.insert(50, 50, 'e')
      expect(qt.size).toBe(5)
      expect(qt.depth).toBeGreaterThan(1)
    })

    it('should handle floating point coordinates', () => {
      expect(tree.insert(1.5, 2.5, 'fp')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle zero-sized values', () => {
      const qt = new QuadTree<number>({ bounds: defaultBounds })
      qt.insert(10, 10, 0)
      expect(qt.queryPoint(10, 10)?.value).toBe(0)
    })
  })

  describe('remove', () => {
    it('should remove an existing point', () => {
      tree.insert(10, 10, 'a')
      expect(tree.remove(10, 10)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should return false for non-existent point', () => {
      expect(tree.remove(10, 10)).toBe(false)
    })

    it('should return false for point outside bounds', () => {
      expect(tree.remove(-1, -1)).toBe(false)
    })

    it('should remove correct point among many', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      expect(tree.remove(20, 20)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.containsPoint(20, 20)).toBe(false)
      expect(tree.containsPoint(10, 10)).toBe(true)
      expect(tree.containsPoint(30, 30)).toBe(true)
    })

    it('should remove from subdivided tree', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 2 })
      qt.insert(10, 10, 'a')
      qt.insert(20, 20, 'b')
      qt.insert(30, 30, 'c')
      expect(qt.remove(20, 20)).toBe(true)
      expect(qt.size).toBe(2)
    })

    it('should handle removing only the first duplicate', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      expect(tree.remove(10, 10)).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.containsPoint(10, 10)).toBe(true)
    })

    it('should handle removing from empty tree', () => {
      expect(tree.remove(50, 50)).toBe(false)
    })
  })

  describe('containsPoint', () => {
    it('should return true for existing point', () => {
      tree.insert(10, 10, 'a')
      expect(tree.containsPoint(10, 10)).toBe(true)
    })

    it('should return false for non-existent point', () => {
      expect(tree.containsPoint(5, 5)).toBe(false)
    })

    it('should return false for point outside bounds', () => {
      expect(tree.containsPoint(-1, -1)).toBe(false)
    })

    it('should return false for point in bounds but not inserted', () => {
      tree.insert(10, 10, 'a')
      expect(tree.containsPoint(20, 20)).toBe(false)
    })

    it('should find point after subdivision', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      expect(qt.containsPoint(10, 10)).toBe(true)
      expect(qt.containsPoint(80, 80)).toBe(true)
    })
  })

  describe('queryRange', () => {
    it('should return empty array for no matches', () => {
      tree.insert(10, 10, 'a')
      const result = tree.queryRange({ x: 50, y: 50, width: 10, height: 10 })
      expect(result).toEqual([])
    })

    it('should return matching points', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      const result = tree.queryRange({ x: 0, y: 0, width: 25, height: 25 })
      expect(result.length).toBe(2)
    })

    it('should return all points in large range', () => {
      tree.insert(10, 10, 'a')
      tree.insert(50, 50, 'b')
      tree.insert(90, 90, 'c')
      const result = tree.queryRange({ x: 0, y: 0, width: 100, height: 100 })
      expect(result.length).toBe(3)
    })

    it('should return empty for empty tree', () => {
      const result = tree.queryRange({ x: 0, y: 0, width: 100, height: 100 })
      expect(result).toEqual([])
    })

    it('should handle range outside bounds', () => {
      tree.insert(10, 10, 'a')
      const result = tree.queryRange({ x: 200, y: 200, width: 10, height: 10 })
      expect(result).toEqual([])
    })

    it('should find points on range boundary', () => {
      tree.insert(0, 0, 'origin')
      const result = tree.queryRange({ x: 0, y: 0, width: 10, height: 10 })
      expect(result.length).toBe(1)
    })

    it('should exclude points on right/bottom edge of range', () => {
      tree.insert(10, 10, 'edge')
      const result = tree.queryRange({ x: 0, y: 0, width: 10, height: 10 })
      expect(result.length).toBe(0)
    })

    it('should work on subdivided tree', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      qt.insert(10, 80, 'c')
      qt.insert(80, 10, 'd')
      const result = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('a')
    })
  })

  describe('queryPoint', () => {
    it('should find an existing point', () => {
      tree.insert(10, 10, 'a')
      const result = tree.queryPoint(10, 10)
      expect(result).toBeDefined()
      expect(result!.x).toBe(10)
      expect(result!.y).toBe(10)
      expect(result!.value).toBe('a')
    })

    it('should return undefined for non-existent point', () => {
      expect(tree.queryPoint(10, 10)).toBeUndefined()
    })

    it('should return undefined for point outside bounds', () => {
      expect(tree.queryPoint(-1, -1)).toBeUndefined()
    })

    it('should return undefined for empty tree', () => {
      expect(tree.queryPoint(50, 50)).toBeUndefined()
    })

    it('should find point in subdivided tree', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      expect(qt.queryPoint(80, 80)).toBeDefined()
      expect(qt.queryPoint(80, 80)!.value).toBe('b')
    })

    it('should return first match for duplicates', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      const result = tree.queryPoint(10, 10)
      expect(result).toBeDefined()
      expect(result!.value).toBe('first')
    })
  })

  describe('queryRadius', () => {
    it('should return points within radius', () => {
      tree.insert(50, 50, 'center')
      tree.insert(55, 50, 'near')
      tree.insert(90, 90, 'far')
      const result = tree.queryRadius(50, 50, 10)
      expect(result.length).toBe(2)
    })

    it('should return empty array when no points within radius', () => {
      tree.insert(90, 90, 'far')
      const result = tree.queryRadius(10, 10, 5)
      expect(result).toEqual([])
    })

    it('should return empty array for empty tree', () => {
      const result = tree.queryRadius(50, 50, 10)
      expect(result).toEqual([])
    })

    it('should include points exactly on radius boundary', () => {
      tree.insert(60, 50, 'edge')
      const result = tree.queryRadius(50, 50, 10)
      expect(result.length).toBe(1)
    })

    it('should handle zero radius', () => {
      tree.insert(50, 50, 'center')
      const result = tree.queryRadius(50, 50, 0)
      expect(result.length).toBe(1)
    })

    it('should find all points with large radius', () => {
      tree.insert(10, 10, 'a')
      tree.insert(90, 90, 'b')
      const result = tree.queryRadius(50, 50, 100)
      expect(result.length).toBe(2)
    })

    it('should handle floating point coordinates', () => {
      tree.insert(50.5, 50.5, 'fp')
      const result = tree.queryRadius(50, 50, 1)
      expect(result.length).toBe(1)
    })
  })

  describe('nearest', () => {
    it('should find single nearest point', () => {
      tree.insert(10, 10, 'a')
      tree.insert(50, 50, 'b')
      const result = tree.nearest(12, 12)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('a')
      expect(result[0]!.distance).toBeCloseTo(Math.sqrt(8))
    })

    it('should find k nearest points', () => {
      tree.insert(10, 10, 'a')
      tree.insert(15, 15, 'b')
      tree.insert(50, 50, 'c')
      tree.insert(80, 80, 'd')
      const result = tree.nearest(12, 12, 2)
      expect(result.length).toBe(2)
      expect(result[0]!.value).toBe('a')
      expect(result[1]!.value).toBe('b')
    })

    it('should return fewer results if tree has fewer points than k', () => {
      tree.insert(10, 10, 'a')
      const result = tree.nearest(50, 50, 5)
      expect(result.length).toBe(1)
    })

    it('should return empty for empty tree', () => {
      const result = tree.nearest(50, 50)
      expect(result).toEqual([])
    })

    it('should return correct distance values', () => {
      tree.insert(50, 50, 'center')
      const result = tree.nearest(50, 50)
      expect(result[0]!.distance).toBe(0)
    })

    it('should sort by distance', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      const result = tree.nearest(25, 25, 3)
      expect(result[0]!.distance).toBeLessThanOrEqual(result[1]!.distance)
      expect(result[1]!.distance).toBeLessThanOrEqual(result[2]!.distance)
    })

    it('should use default k=1', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      const result = tree.nearest(15, 15)
      expect(result.length).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size).toBe(0)
    })

    it('should increase after insert', () => {
      tree.insert(10, 10, 'a')
      expect(tree.size).toBe(1)
    })

    it('should decrease after remove', () => {
      tree.insert(10, 10, 'a')
      tree.remove(10, 10)
      expect(tree.size).toBe(0)
    })

    it('should count correctly in subdivided tree', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      qt.insert(10, 80, 'c')
      expect(qt.size).toBe(3)
    })
  })

  describe('depth', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.depth).toBe(0)
    })

    it('should return 1 for non-empty leaf', () => {
      tree.insert(10, 10, 'a')
      expect(tree.depth).toBe(1)
    })

    it('should increase after subdivision', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      expect(qt.depth).toBeGreaterThan(1)
    })

    it('should grow with more points in same quadrant', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(11, 11, 'b')
      qt.insert(12, 12, 'c')
      expect(qt.depth).toBeGreaterThan(2)
    })
  })

  describe('bounds', () => {
    it('should return copy of bounds', () => {
      const b1 = tree.getBounds()
      const b2 = tree.getBounds()
      expect(b1).toEqual(b2)
      b1.x = 999
      expect(tree.getBounds().x).toBe(0)
    })

    it('should return correct bounds for custom bounds', () => {
      const qt = new QuadTree({ bounds: { x: -50, y: -50, width: 200, height: 200 } })
      expect(qt.getBounds()).toEqual({ x: -50, y: -50, width: 200, height: 200 })
    })
  })

  describe('clear', () => {
    it('should remove all points', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should reset depth', () => {
      tree.insert(10, 10, 'a')
      tree.clear()
      expect(tree.depth).toBe(0)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow insertions after clear', () => {
      tree.insert(10, 10, 'a')
      tree.clear()
      tree.insert(20, 20, 'b')
      expect(tree.size).toBe(1)
      expect(tree.containsPoint(20, 20)).toBe(true)
    })

    it('should allow insertions after clearing subdivided tree', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      qt.clear()
      qt.insert(30, 30, 'c')
      expect(qt.size).toBe(1)
      expect(qt.containsPoint(30, 30)).toBe(true)
    })
  })

  describe('forEach', () => {
    it('should iterate over all points', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      const visited: string[] = []
      tree.forEach((p) => visited.push(p.value!))
      expect(visited.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should not call callback for empty tree', () => {
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate over subdivided tree', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(2)
    })

    it('should provide correct point data', () => {
      tree.insert(42, 43, 'val')
      tree.forEach((p) => {
        expect(p.x).toBe(42)
        expect(p.y).toBe(43)
        expect(p.value).toBe('val')
      })
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return all points', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      const arr = tree.toArray()
      expect(arr.length).toBe(2)
    })

    it('should return points with correct data', () => {
      tree.insert(10, 10, 'a')
      const arr = tree.toArray()
      expect(arr[0]!.x).toBe(10)
      expect(arr[0]!.y).toBe(10)
      expect(arr[0]!.value).toBe('a')
    })

    it('should return all points from subdivided tree', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      qt.insert(10, 80, 'c')
      qt.insert(80, 10, 'd')
      expect(qt.toArray().length).toBe(4)
    })
  })

  describe('static from', () => {
    it('should create quadtree from array of points', () => {
      const points = [
        { x: 10, y: 10, value: 'a' },
        { x: 20, y: 20, value: 'b' },
        { x: 30, y: 30, value: 'c' },
      ]
      const qt = QuadTree.from(points, { bounds: defaultBounds })
      expect(qt.size).toBe(3)
    })

    it('should create empty quadtree from empty array', () => {
      const qt = QuadTree.from([], { bounds: defaultBounds })
      expect(qt.size).toBe(0)
    })

    it('should create quadtree without values', () => {
      const points = [{ x: 10, y: 10 }, { x: 20, y: 20 }]
      const qt = QuadTree.from(points, { bounds: defaultBounds })
      expect(qt.size).toBe(2)
    })

    it('should use provided options', () => {
      const points = [
        { x: 10, y: 10, value: 'a' },
        { x: 20, y: 20, value: 'b' },
      ]
      const qt = QuadTree.from(points, { bounds: defaultBounds, capacity: 1 })
      expect(qt.size).toBe(2)
    })

    it('should skip points outside bounds', () => {
      const points = [
        { x: 10, y: 10, value: 'a' },
        { x: 200, y: 200, value: 'b' },
      ]
      const qt = QuadTree.from(points, { bounds: defaultBounds })
      expect(qt.size).toBe(1)
    })
  })

  describe('stats', () => {
    it('should return empty stats for empty tree', () => {
      const stats = tree.getStats()
      expect(stats.size).toBe(0)
      expect(stats.depth).toBe(0)
      expect(stats.nodeCount).toBe(1)
      expect(stats.bounds).toEqual(defaultBounds)
    })

    it('should return correct stats after insertions', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      const stats = tree.getStats()
      expect(stats.size).toBe(2)
      expect(stats.depth).toBe(1)
      expect(stats.nodeCount).toBe(1)
    })

    it('should count nodes after subdivision', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(80, 80, 'b')
      const stats = qt.getStats()
      expect(stats.nodeCount).toBeGreaterThan(1)
    })

    it('should update after clear', () => {
      tree.insert(10, 10, 'a')
      tree.clear()
      const stats = tree.getStats()
      expect(stats.size).toBe(0)
      expect(stats.depth).toBe(0)
    })

    it('should include bounds in stats', () => {
      const stats = tree.getStats()
      expect(stats.bounds).toEqual(defaultBounds)
    })
  })

  describe('edge cases', () => {
    it('should handle single point', () => {
      tree.insert(50, 50, 'only')
      expect(tree.size).toBe(1)
      expect(tree.containsPoint(50, 50)).toBe(true)
      expect(tree.queryPoint(50, 50)?.value).toBe('only')
      expect(tree.depth).toBe(1)
    })

    it('should handle duplicate positions', () => {
      tree.insert(10, 10, 'first')
      tree.insert(10, 10, 'second')
      expect(tree.size).toBe(2)
      expect(tree.queryPoint(10, 10)?.value).toBe('first')
    })

    it('should handle points on boundaries', () => {
      expect(tree.insert(0, 0, 'tl')).toBe(true)
      expect(tree.insert(0, 99, 'bl')).toBe(true)
      expect(tree.containsPoint(0, 0)).toBe(true)
      expect(tree.containsPoint(0, 99)).toBe(true)
    })

    it('should handle large tree with 10000+ points', () => {
      const qt = new QuadTree<number>({ bounds: { x: 0, y: 0, width: 1000, height: 1000 }, capacity: 4 })
      for (let i = 0; i < 10000; i++) {
        qt.insert(i % 1000, Math.floor(i / 1000), i)
      }
      expect(qt.size).toBe(10000)
    })

    it('should handle large tree queryRange correctly', () => {
      const qt = new QuadTree<number>({ bounds: { x: 0, y: 0, width: 1000, height: 1000 }, capacity: 4 })
      for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 10; j++) {
          qt.insert(i, j, i * 10 + j)
        }
      }
      const result = qt.queryRange({ x: 0, y: 0, width: 10, height: 10 })
      expect(result.length).toBe(100)
    })

    it('should handle large tree queryRadius correctly', () => {
      const qt = new QuadTree<number>({ bounds: { x: 0, y: 0, width: 100, height: 100 }, capacity: 4 })
      for (let i = 0; i < 100; i++) {
        qt.insert(i, 50, i)
      }
      const result = qt.queryRadius(50, 50, 5)
      expect(result.length).toBe(11)
    })

    it('should handle large tree nearest correctly', () => {
      const qt = new QuadTree<number>({ bounds: { x: 0, y: 0, width: 100, height: 100 }, capacity: 4 })
      for (let i = 0; i < 100; i++) {
        qt.insert(i, 50, i)
      }
      const result = qt.nearest(50, 50, 3)
      expect(result.length).toBe(3)
      expect(result[0]!.distance).toBe(0)
    })

    it('should handle removing all points', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.remove(10, 10)
      tree.remove(20, 20)
      expect(tree.size).toBe(0)
    })

    it('should handle queryRange with partial overlap', () => {
      tree.insert(95, 50, 'a')
      const result = tree.queryRange({ x: 90, y: 0, width: 20, height: 100 })
      expect(result.length).toBe(1)
    })

    it('should handle very small bounds', () => {
      const qt = new QuadTree<string>({ bounds: { x: 0, y: 0, width: 1, height: 1 }, capacity: 4 })
      expect(qt.insert(0.1, 0.1, 'a')).toBe(true)
      expect(qt.insert(0.9, 0.9, 'b')).toBe(true)
      expect(qt.size).toBe(2)
    })

    it('should handle subdivision with all points in same quadrant', () => {
      const qt = new QuadTree<string>({ bounds: defaultBounds, capacity: 1 })
      qt.insert(10, 10, 'a')
      qt.insert(11, 11, 'b')
      qt.insert(12, 12, 'c')
      qt.insert(13, 13, 'd')
      expect(qt.size).toBe(4)
      expect(qt.containsPoint(13, 13)).toBe(true)
    })
  })

  describe('spatial query correctness', () => {
    it('should return correct points for NW quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('nw')
    })

    it('should return correct points for NE quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.queryRange({ x: 50, y: 0, width: 50, height: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('ne')
    })

    it('should return correct points for SW quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.queryRange({ x: 0, y: 50, width: 50, height: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('sw')
    })

    it('should return correct points for SE quadrant query', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(80, 10, 'ne')
      tree.insert(10, 80, 'sw')
      tree.insert(80, 80, 'se')
      const result = tree.queryRange({ x: 50, y: 50, width: 50, height: 50 })
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('se')
    })

    it('should return all points for full range query', () => {
      tree.insert(10, 10, 'a')
      tree.insert(50, 50, 'b')
      tree.insert(90, 90, 'c')
      const result = tree.queryRange({ x: 0, y: 0, width: 100, height: 100 })
      expect(result.length).toBe(3)
    })

    it('should handle queryRadius at corner of bounds', () => {
      tree.insert(1, 1, 'a')
      tree.insert(50, 50, 'b')
      const result = tree.queryRadius(0, 0, 5)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('a')
    })

    it('should find nearest point correctly across quadrants', () => {
      tree.insert(10, 10, 'nw')
      tree.insert(90, 90, 'se')
      const result = tree.nearest(85, 85)
      expect(result[0]!.value).toBe('se')
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_CAPACITY', () => {
      expect(DEFAULT_CAPACITY).toBe(4)
    })

    it('should support Rect interface', () => {
      const r: Rect = { x: 0, y: 0, width: 100, height: 100 }
      expect(r.width).toBe(100)
    })

    it('should support QuadTreePoint interface', () => {
      const p: QuadTreePoint<string> = { x: 1, y: 2, value: 'test' }
      expect(p.x).toBe(1)
      expect(p.value).toBe('test')
    })

    it('should support QuadTreeOptions interface', () => {
      const o: QuadTreeOptions<string> = { bounds: { x: 0, y: 0, width: 100, height: 100 }, capacity: 8 }
      expect(o.capacity).toBe(8)
    })

    it('should support QuadTreeStats interface', () => {
      const s: QuadTreeStats = { size: 0, depth: 0, nodeCount: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } }
      expect(s.size).toBe(0)
      expect(s.nodeCount).toBe(1)
    })
  })

  describe('number values', () => {
    it('should store number values', () => {
      const qt = new QuadTree<number>({ bounds: defaultBounds })
      qt.insert(10, 10, 42)
      qt.insert(20, 20, 99)
      expect(qt.queryPoint(10, 10)?.value).toBe(42)
      expect(qt.queryPoint(20, 20)?.value).toBe(99)
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const qt = new QuadTree<{ name: string }>({ bounds: defaultBounds })
      qt.insert(10, 10, { name: 'point-a' })
      expect(qt.queryPoint(10, 10)?.value?.name).toBe('point-a')
    })

    it('should store null values', () => {
      const qt = new QuadTree<null>({ bounds: defaultBounds })
      qt.insert(10, 10, null)
      expect(qt.queryPoint(10, 10)?.value).toBeNull()
      expect(qt.containsPoint(10, 10)).toBe(true)
    })
  })

  describe('mixed operations', () => {
    it('should handle insert, query, remove cycle', () => {
      tree.insert(10, 10, 'a')
      expect(tree.containsPoint(10, 10)).toBe(true)
      tree.remove(10, 10)
      expect(tree.containsPoint(10, 10)).toBe(false)
      tree.insert(10, 10, 'a2')
      expect(tree.queryPoint(10, 10)?.value).toBe('a2')
    })

    it('should handle clear and rebuild', () => {
      tree.insert(10, 10, 'a')
      tree.clear()
      expect(tree.size).toBe(0)
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      expect(tree.size).toBe(2)
      expect(tree.toArray().length).toBe(2)
    })

    it('should handle forEach after remove', () => {
      tree.insert(10, 10, 'a')
      tree.insert(20, 20, 'b')
      tree.insert(30, 30, 'c')
      tree.remove(20, 20)
      const visited: string[] = []
      tree.forEach((p) => visited.push(p.value!))
      expect(visited.sort()).toEqual(['a', 'c'])
    })
  })
})
