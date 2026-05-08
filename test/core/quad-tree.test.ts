import { describe, it, expect, beforeEach } from 'vitest'
import { QuadTree } from '../../src/core/quad-tree/quad-tree.js'
import { DEFAULT_QUAD_TREE_OPTIONS } from '../../src/core/quad-tree/types.js'
import type { QuadTreeOptions, Point, Rectangle } from '../../src/core/quad-tree/types.js'

const FULL_BOUNDS: Rectangle = { x: 0, y: 0, width: 100, height: 100 }

describe('QuadTree', () => {
  describe('constructor', () => {
    it('should create a quad tree with default options', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      expect(qt.count()).toBe(0)
      expect(qt.getBounds()).toEqual(FULL_BOUNDS)
    })

    it('should accept custom options', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1, maxDepth: 3 })
      qt.insert({ x: 1, y: 1 }, 'a')
      qt.insert({ x: 2, y: 2 }, 'b')
      expect(qt.count()).toBe(2)
    })

    it('should accept partial options', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 2 })
      expect(qt.count()).toBe(0)
    })

    it('should use DEFAULT_QUAD_TREE_OPTIONS defaults', () => {
      expect(DEFAULT_QUAD_TREE_OPTIONS.maxPoints).toBe(4)
      expect(DEFAULT_QUAD_TREE_OPTIONS.maxDepth).toBe(8)
    })

    it('should return depth 0 for new tree', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      expect(qt.getDepth()).toBe(0)
    })

    it('should accept bounds with non-zero origin', () => {
      const bounds: Rectangle = { x: 50, y: 50, width: 100, height: 100 }
      const qt = new QuadTree<string>(bounds)
      expect(qt.getBounds()).toEqual(bounds)
    })
  })

  describe('insert', () => {
    let qt: QuadTree<string>

    beforeEach(() => {
      qt = new QuadTree<string>(FULL_BOUNDS)
    })

    it('should insert a point within bounds', () => {
      expect(qt.insert({ x: 10, y: 10 }, 'a')).toBe(true)
      expect(qt.count()).toBe(1)
    })

    it('should insert multiple points', () => {
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      expect(qt.count()).toBe(3)
    })

    it('should reject point outside bounds (right)', () => {
      expect(qt.insert({ x: 100, y: 50 }, 'out')).toBe(false)
      expect(qt.count()).toBe(0)
    })

    it('should reject point outside bounds (bottom)', () => {
      expect(qt.insert({ x: 50, y: 100 }, 'out')).toBe(false)
      expect(qt.count()).toBe(0)
    })

    it('should reject point outside bounds (left)', () => {
      expect(qt.insert({ x: -1, y: 50 }, 'out')).toBe(false)
    })

    it('should reject point outside bounds (top)', () => {
      expect(qt.insert({ x: 50, y: -1 }, 'out')).toBe(false)
    })

    it('should accept point at origin', () => {
      expect(qt.insert({ x: 0, y: 0 }, 'origin')).toBe(true)
    })

    it('should allow duplicate points at same coordinates', () => {
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 10, y: 10 }, 'b')
      expect(qt.count()).toBe(2)
    })

    it('should return boolean', () => {
      expect(typeof qt.insert({ x: 10, y: 10 }, 'a')).toBe('boolean')
    })

    it('should handle floating point coordinates', () => {
      expect(qt.insert({ x: 0.5, y: 0.5 }, 'fp')).toBe(true)
      expect(qt.count()).toBe(1)
    })

    it('should insert at edge coordinates (0-based)', () => {
      expect(qt.insert({ x: 0, y: 0 }, 'tl')).toBe(true)
      expect(qt.insert({ x: 99.9, y: 99.9 }, 'near-br')).toBe(true)
    })

    it('should insert many points triggering subdivision', () => {
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 4, y: i * 4 }, `p${i}`)
      }
      expect(qt.count()).toBe(20)
    })
  })

  describe('remove', () => {
    let qt: QuadTree<string>

    beforeEach(() => {
      qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
    })

    it('should remove an existing point', () => {
      expect(qt.remove({ x: 10, y: 10 })).toBe(true)
      expect(qt.count()).toBe(2)
    })

    it('should return false for non-existent point', () => {
      expect(qt.remove({ x: 99, y: 99 })).toBe(false)
      expect(qt.count()).toBe(3)
    })

    it('should remove all points one by one', () => {
      qt.remove({ x: 10, y: 10 })
      qt.remove({ x: 20, y: 20 })
      qt.remove({ x: 30, y: 30 })
      expect(qt.count()).toBe(0)
    })

    it('should handle removing from empty tree', () => {
      qt.clear()
      expect(qt.remove({ x: 10, y: 10 })).toBe(false)
    })

    it('should remove first match when duplicates exist', () => {
      qt.insert({ x: 10, y: 10 }, 'dup')
      expect(qt.remove({ x: 10, y: 10 })).toBe(true)
      expect(qt.count()).toBe(3)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('dup')
    })

    it('should return false for point outside bounds', () => {
      expect(qt.remove({ x: -1, y: -1 })).toBe(false)
    })

    it('should allow re-insertion after removal', () => {
      qt.remove({ x: 10, y: 10 })
      qt.insert({ x: 10, y: 10 }, 'new')
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('new')
    })

    it('should not affect other points when removing', () => {
      qt.remove({ x: 20, y: 20 })
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('a')
      expect(qt.queryPoint({ x: 30, y: 30 })).toBe('c')
    })

    it('should remove from subdivided tree', () => {
      const sub = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 2 })
      for (let i = 0; i < 10; i++) {
        sub.insert({ x: i * 9, y: i * 9 }, `p${i}`)
      }
      expect(sub.remove({ x: 0, y: 0 })).toBe(true)
      expect(sub.count()).toBe(9)
    })

    it('should return boolean', () => {
      expect(typeof qt.remove({ x: 10, y: 10 })).toBe('boolean')
    })
  })

  describe('queryRange', () => {
    let qt: QuadTree<string>

    beforeEach(() => {
      qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      qt.insert({ x: 40, y: 40 }, 'd')
      qt.insert({ x: 50, y: 50 }, 'e')
    })

    it('should return points within range', () => {
      const results = qt.queryRange({ x: 5, y: 5, width: 20, height: 20 })
      expect(results).toHaveLength(2)
      const values = results.map((r) => r.value).sort()
      expect(values).toEqual(['a', 'b'])
    })

    it('should return empty array for range with no points', () => {
      const results = qt.queryRange({ x: 80, y: 80, width: 10, height: 10 })
      expect(results).toHaveLength(0)
    })

    it('should return all points for full range', () => {
      const results = qt.queryRange(FULL_BOUNDS)
      expect(results).toHaveLength(5)
    })

    it('should return single point for narrow range', () => {
      const results = qt.queryRange({ x: 10, y: 10, width: 1, height: 1 })
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('a')
    })

    it('should return empty for range outside bounds', () => {
      const results = qt.queryRange({ x: 200, y: 200, width: 10, height: 10 })
      expect(results).toHaveLength(0)
    })

    it('should handle range overlapping partial bounds', () => {
      const results = qt.queryRange({ x: -10, y: -10, width: 30, height: 30 })
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should return point and value pairs', () => {
      const results = qt.queryRange({ x: 0, y: 0, width: 15, height: 15 })
      expect(results[0]).toEqual({ point: { x: 10, y: 10 }, value: 'a' })
    })

    it('should work on subdivided tree', () => {
      const sub = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 2 })
      for (let i = 0; i < 10; i++) {
        sub.insert({ x: i * 9, y: i * 9 }, `p${i}`)
      }
      const results = sub.queryRange({ x: 0, y: 0, width: 20, height: 20 })
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should return empty array for empty tree', () => {
      const empty = new QuadTree<string>(FULL_BOUNDS)
      expect(empty.queryRange(FULL_BOUNDS)).toEqual([])
    })

    it('should handle zero-size range', () => {
      const results = qt.queryRange({ x: 10, y: 10, width: 0, height: 0 })
      expect(results).toHaveLength(0)
    })
  })

  describe('queryPoint', () => {
    let qt: QuadTree<string>

    beforeEach(() => {
      qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
    })

    it('should return value for existing point', () => {
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('a')
    })

    it('should return undefined for non-existent point', () => {
      expect(qt.queryPoint({ x: 99, y: 99 })).toBeUndefined()
    })

    it('should return undefined for point outside bounds', () => {
      expect(qt.queryPoint({ x: -1, y: -1 })).toBeUndefined()
    })

    it('should return first value for duplicate points', () => {
      qt.insert({ x: 10, y: 10 }, 'dup')
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('a')
    })

    it('should return undefined for empty tree', () => {
      const empty = new QuadTree<string>(FULL_BOUNDS)
      expect(empty.queryPoint({ x: 10, y: 10 })).toBeUndefined()
    })

    it('should work after removal', () => {
      qt.remove({ x: 10, y: 10 })
      expect(qt.queryPoint({ x: 10, y: 10 })).toBeUndefined()
    })

    it('should work on subdivided tree', () => {
      const sub = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1 })
      sub.insert({ x: 10, y: 10 }, 'a')
      sub.insert({ x: 20, y: 20 }, 'b')
      expect(sub.queryPoint({ x: 20, y: 20 })).toBe('b')
    })

    it('should handle floating point coordinates', () => {
      qt.insert({ x: 0.5, y: 0.5 }, 'fp')
      expect(qt.queryPoint({ x: 0.5, y: 0.5 })).toBe('fp')
    })
  })

  describe('contains', () => {
    let qt: QuadTree<string>

    beforeEach(() => {
      qt = new QuadTree<string>(FULL_BOUNDS)
    })

    it('should return true for point inside bounds', () => {
      expect(qt.contains({ x: 50, y: 50 })).toBe(true)
    })

    it('should return true for point at origin', () => {
      expect(qt.contains({ x: 0, y: 0 })).toBe(true)
    })

    it('should return false for point outside bounds', () => {
      expect(qt.contains({ x: -1, y: -1 })).toBe(false)
    })

    it('should return false for point on right edge (exclusive)', () => {
      expect(qt.contains({ x: 100, y: 50 })).toBe(false)
    })

    it('should return false for point on bottom edge (exclusive)', () => {
      expect(qt.contains({ x: 50, y: 100 })).toBe(false)
    })
  })

  describe('count', () => {
    let qt: QuadTree<string>

    beforeEach(() => {
      qt = new QuadTree<string>(FULL_BOUNDS)
    })

    it('should return 0 for empty tree', () => {
      expect(qt.count()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      expect(qt.count()).toBe(2)
    })

    it('should return correct count after removals', () => {
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.remove({ x: 10, y: 10 })
      expect(qt.count()).toBe(1)
    })

    it('should return 0 after clear', () => {
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.clear()
      expect(qt.count()).toBe(0)
    })

    it('should not count failed inserts', () => {
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 200, y: 200 }, 'out')
      expect(qt.count()).toBe(1)
    })
  })

  describe('clear', () => {
    let qt: QuadTree<string>

    beforeEach(() => {
      qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
    })

    it('should remove all points', () => {
      qt.clear()
      expect(qt.count()).toBe(0)
    })

    it('should allow insert after clear', () => {
      qt.clear()
      qt.insert({ x: 30, y: 30 }, 'c')
      expect(qt.count()).toBe(1)
    })

    it('should preserve bounds after clear', () => {
      qt.clear()
      expect(qt.getBounds()).toEqual(FULL_BOUNDS)
    })

    it('should reset depth after clear', () => {
      qt.clear()
      expect(qt.getDepth()).toBe(0)
    })

    it('should return void', () => {
      expect(qt.clear()).toBeUndefined()
    })
  })

  describe('getBounds', () => {
    it('should return the bounds', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      expect(qt.getBounds()).toEqual(FULL_BOUNDS)
    })

    it('should return a copy of bounds', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      const bounds = qt.getBounds()
      bounds.x = 999
      expect(qt.getBounds().x).toBe(0)
    })

    it('should return custom bounds', () => {
      const bounds: Rectangle = { x: 10, y: 20, width: 50, height: 60 }
      const qt = new QuadTree<string>(bounds)
      expect(qt.getBounds()).toEqual(bounds)
    })
  })

  describe('getDepth', () => {
    it('should return 0 for empty tree', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      expect(qt.getDepth()).toBe(0)
    })

    it('should return 0 when no subdivision needed', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      expect(qt.getDepth()).toBe(0)
    })

    it('should return 1 after first subdivision', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 2 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 60, y: 10 }, 'b')
      qt.insert({ x: 10, y: 60 }, 'c')
      expect(qt.getDepth()).toBe(1)
    })

    it('should increase depth with more subdivisions', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1, maxDepth: 8 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 11, y: 11 }, 'b')
      qt.insert({ x: 12, y: 12 }, 'c')
      qt.insert({ x: 13, y: 13 }, 'd')
      expect(qt.getDepth()).toBeGreaterThanOrEqual(1)
    })

    it('should respect maxDepth limit', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1, maxDepth: 2 })
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: 10 + i, y: 10 + i }, `p${i}`)
      }
      expect(qt.getDepth()).toBeLessThanOrEqual(2)
    })
  })

  describe('getAllPoints', () => {
    it('should return empty array for empty tree', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      expect(qt.getAllPoints()).toEqual([])
    })

    it('should return all inserted points', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      const points = qt.getAllPoints()
      expect(points).toHaveLength(2)
      expect(points).toContainEqual({ x: 10, y: 10 })
      expect(points).toContainEqual({ x: 20, y: 20 })
    })

    it('should return empty after clear', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.clear()
      expect(qt.getAllPoints()).toEqual([])
    })

    it('should reflect removals', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.remove({ x: 10, y: 10 })
      expect(qt.getAllPoints()).toHaveLength(1)
    })
  })

  describe('forEach', () => {
    it('should iterate over all points', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      const results: Array<{ point: Point; value: string }> = []
      qt.forEach((point, value) => results.push({ point, value }))
      expect(results).toHaveLength(2)
    })

    it('should not iterate on empty tree', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct point and value', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 5, y: 5 }, 'test')
      qt.forEach((point, value) => {
        expect(point).toEqual({ x: 5, y: 5 })
        expect(value).toBe('test')
      })
    })

    it('should work on subdivided tree', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(3)
    })

    it('should return void', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      expect(qt.forEach(() => {})).toBeUndefined()
    })
  })

  describe('subdivision', () => {
    it('should subdivide when maxPoints exceeded', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 2 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 60, y: 60 }, 'b')
      expect(qt.getDepth()).toBe(0)
      qt.insert({ x: 10, y: 60 }, 'c')
      expect(qt.getDepth()).toBe(1)
    })

    it('should distribute points to correct quadrants', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 2 })
      qt.insert({ x: 10, y: 10 }, 'nw')
      qt.insert({ x: 60, y: 10 }, 'ne')
      qt.insert({ x: 10, y: 60 }, 'sw')
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('nw')
      expect(qt.queryPoint({ x: 60, y: 10 })).toBe('ne')
      expect(qt.queryPoint({ x: 10, y: 60 })).toBe('sw')
    })

    it('should respect maxDepth and stop subdividing', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1, maxDepth: 1 })
      qt.insert({ x: 1, y: 1 }, 'a')
      qt.insert({ x: 2, y: 2 }, 'b')
      qt.insert({ x: 3, y: 3 }, 'c')
      qt.insert({ x: 4, y: 4 }, 'd')
      qt.insert({ x: 5, y: 5 }, 'e')
      expect(qt.getDepth()).toBe(1)
      expect(qt.count()).toBe(5)
    })

    it('should query correctly after subdivision', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 80, y: 80 }, 'b')
      const results = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('a')
    })

    it('should handle remove after subdivision', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 1 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 80, y: 80 }, 'b')
      expect(qt.remove({ x: 10, y: 10 })).toBe(true)
      expect(qt.count()).toBe(1)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBeUndefined()
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_QUAD_TREE_OPTIONS', () => {
      expect(DEFAULT_QUAD_TREE_OPTIONS.maxPoints).toBe(4)
      expect(DEFAULT_QUAD_TREE_OPTIONS.maxDepth).toBe(8)
    })

    it('should support QuadTreeOptions interface', () => {
      const opts: QuadTreeOptions = { maxPoints: 10, maxDepth: 5 }
      expect(opts.maxPoints).toBe(10)
    })

    it('should support Point interface', () => {
      const p: Point = { x: 1, y: 2 }
      expect(p.x).toBe(1)
      expect(p.y).toBe(2)
    })

    it('should support Rectangle interface', () => {
      const r: Rectangle = { x: 0, y: 0, width: 100, height: 100 }
      expect(r.width).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('should handle bounds with non-zero origin', () => {
      const bounds: Rectangle = { x: 50, y: 50, width: 100, height: 100 }
      const qt = new QuadTree<string>(bounds)
      expect(qt.insert({ x: 75, y: 75 }, 'in')).toBe(true)
      expect(qt.insert({ x: 49, y: 75 }, 'out')).toBe(false)
    })

    it('should handle very small bounds', () => {
      const bounds: Rectangle = { x: 0, y: 0, width: 1, height: 1 }
      const qt = new QuadTree<string>(bounds)
      expect(qt.insert({ x: 0.5, y: 0.5 }, 'in')).toBe(true)
    })

    it('should handle many points at same location', () => {
      const qt = new QuadTree<number>(FULL_BOUNDS)
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: 50, y: 50 }, i)
      }
      expect(qt.count()).toBe(10)
    })

    it('should handle negative coordinates', () => {
      const bounds: Rectangle = { x: -100, y: -100, width: 200, height: 200 }
      const qt = new QuadTree<string>(bounds)
      expect(qt.insert({ x: -50, y: -50 }, 'neg')).toBe(true)
      expect(qt.queryPoint({ x: -50, y: -50 })).toBe('neg')
    })

    it('should handle generic value types', () => {
      const qt = new QuadTree<{ name: string }>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, { name: 'test' })
      const result = qt.queryPoint({ x: 10, y: 10 })
      expect(result?.name).toBe('test')
    })
  })

  describe('large datasets', () => {
    it('should handle 100 points', () => {
      const qt = new QuadTree<number>(FULL_BOUNDS, { maxPoints: 4 })
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i }, i)
      }
      expect(qt.count()).toBe(100)
      expect(qt.getAllPoints()).toHaveLength(100)
    })

    it('should handle range queries on large dataset', () => {
      const qt = new QuadTree<number>(FULL_BOUNDS, { maxPoints: 4 })
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i }, i)
      }
      const results = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(results.length).toBe(50)
    })

    it('should handle many removals', () => {
      const qt = new QuadTree<number>(FULL_BOUNDS)
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: i * 2, y: i * 2 }, i)
      }
      for (let i = 0; i < 25; i++) {
        qt.remove({ x: i * 2, y: i * 2 })
      }
      expect(qt.count()).toBe(25)
    })

    it('should handle forEach on large dataset', () => {
      const qt = new QuadTree<number>(FULL_BOUNDS, { maxPoints: 4 })
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: i * 2, y: i * 2 }, i)
      }
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(50)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across mixed operations', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS, { maxPoints: 2 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      qt.remove({ x: 20, y: 20 })
      qt.insert({ x: 40, y: 40 }, 'd')
      expect(qt.count()).toBe(3)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('a')
      expect(qt.queryPoint({ x: 20, y: 20 })).toBeUndefined()
      expect(qt.queryPoint({ x: 30, y: 30 })).toBe('c')
      expect(qt.queryPoint({ x: 40, y: 40 })).toBe('d')
    })

    it('should handle clear and rebuild', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.clear()
      qt.insert({ x: 20, y: 20 }, 'b')
      expect(qt.count()).toBe(1)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBeUndefined()
      expect(qt.queryPoint({ x: 20, y: 20 })).toBe('b')
    })

    it('should handle insert-remove-insert cycle', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 50, y: 50 }, 'first')
      qt.remove({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 50 }, 'second')
      expect(qt.queryPoint({ x: 50, y: 50 })).toBe('second')
      expect(qt.count()).toBe(1)
    })

    it('should handle query after multiple subdivisions', () => {
      const qt = new QuadTree<string>({ x: 0, y: 0, width: 1000, height: 1000 }, { maxPoints: 1 })
      qt.insert({ x: 100, y: 100 }, 'a')
      qt.insert({ x: 200, y: 200 }, 'b')
      qt.insert({ x: 300, y: 300 }, 'c')
      qt.insert({ x: 400, y: 400 }, 'd')
      qt.insert({ x: 500, y: 500 }, 'e')
      const results = qt.queryRange({ x: 150, y: 150, width: 300, height: 300 })
      expect(results.length).toBe(3)
    })

    it('should handle getAllPoints with duplicates at same location', () => {
      const qt = new QuadTree<string>(FULL_BOUNDS)
      qt.insert({ x: 50, y: 50 }, 'a')
      qt.insert({ x: 50, y: 50 }, 'b')
      const points = qt.getAllPoints()
      expect(points).toHaveLength(2)
      expect(points.every((p) => p.x === 50 && p.y === 50)).toBe(true)
    })
  })
})
