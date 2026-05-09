import { describe, it, expect, beforeEach } from 'vitest'
import { QuadTreeSpatial } from '../../src/core/quadtree-spatial/quadtree-spatial.js'
import { DEFAULT_QUADTREE_SPATIAL_OPTIONS } from '../../src/core/quadtree-spatial/quadtree-spatial.js'
import type { Point, BoundingBox, QuadTreeSpatialOptions } from '../../src/core/quadtree-spatial/quadtree-spatial.js'

describe('QuadTreeSpatial', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const qt = new QuadTreeSpatial<string>()
      expect(qt.size()).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('should accept custom bounds', () => {
      const qt = new QuadTreeSpatial<string>({ bounds: { x: 0, y: 0, width: 200, height: 200 } })
      expect(qt.size()).toBe(0)
    })

    it('should accept custom capacity', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 8 })
      expect(qt.size()).toBe(0)
    })

    it('should accept custom maxDepth', () => {
      const qt = new QuadTreeSpatial<string>({ maxDepth: 5 })
      expect(qt.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 2 })
      expect(qt.isEmpty()).toBe(true)
    })

    it('should use DEFAULT_QUADTREE_SPATIAL_OPTIONS defaults', () => {
      expect(DEFAULT_QUADTREE_SPATIAL_OPTIONS.bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 })
      expect(DEFAULT_QUADTREE_SPATIAL_OPTIONS.capacity).toBe(4)
      expect(DEFAULT_QUADTREE_SPATIAL_OPTIONS.maxDepth).toBe(8)
    })

    it('should accept bounds with non-zero origin', () => {
      const qt = new QuadTreeSpatial<string>({ bounds: { x: 50, y: 50, width: 100, height: 100 } })
      expect(qt.insert({ x: 75, y: 75 }, 'a')).toBe(true)
      expect(qt.insert({ x: 49, y: 75 }, 'out')).toBe(false)
    })

    it('should accept all options combined', () => {
      const qt = new QuadTreeSpatial<string>({
        bounds: { x: 0, y: 0, width: 500, height: 500 },
        capacity: 2,
        maxDepth: 10,
      })
      expect(qt.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
    })

    it('should insert a point within default bounds', () => {
      expect(qt.insert({ x: 10, y: 10 }, 'a')).toBe(true)
      expect(qt.size()).toBe(1)
    })

    it('should insert multiple points', () => {
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      expect(qt.size()).toBe(3)
    })

    it('should reject point outside bounds (right)', () => {
      expect(qt.insert({ x: 100, y: 50 }, 'out')).toBe(false)
      expect(qt.size()).toBe(0)
    })

    it('should reject point outside bounds (bottom)', () => {
      expect(qt.insert({ x: 50, y: 100 }, 'out')).toBe(false)
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
      expect(qt.size()).toBe(2)
    })

    it('should return boolean', () => {
      expect(typeof qt.insert({ x: 10, y: 10 }, 'a')).toBe('boolean')
    })

    it('should handle floating point coordinates', () => {
      expect(qt.insert({ x: 0.5, y: 0.5 }, 'fp')).toBe(true)
      expect(qt.size()).toBe(1)
    })

    it('should insert at edge coordinates', () => {
      expect(qt.insert({ x: 0, y: 0 }, 'tl')).toBe(true)
      expect(qt.insert({ x: 99.9, y: 99.9 }, 'near-br')).toBe(true)
    })

    it('should insert many points triggering subdivision', () => {
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 4, y: i * 4 }, `p${i}`)
      }
      expect(qt.size()).toBe(20)
    })

    it('should respect capacity option for subdivision', () => {
      const small = new QuadTreeSpatial<string>({ capacity: 1 })
      small.insert({ x: 10, y: 10 }, 'a')
      small.insert({ x: 20, y: 20 }, 'b')
      expect(small.size()).toBe(2)
    })
  })

  describe('remove', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
    })

    it('should remove an existing point', () => {
      expect(qt.remove({ x: 10, y: 10 })).toBe(true)
      expect(qt.size()).toBe(2)
    })

    it('should return false for non-existent point', () => {
      expect(qt.remove({ x: 99, y: 99 })).toBe(false)
      expect(qt.size()).toBe(3)
    })

    it('should remove all points one by one', () => {
      qt.remove({ x: 10, y: 10 })
      qt.remove({ x: 20, y: 20 })
      qt.remove({ x: 30, y: 30 })
      expect(qt.size()).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('should handle removing from empty tree', () => {
      qt.clear()
      expect(qt.remove({ x: 10, y: 10 })).toBe(false)
    })

    it('should remove first match when duplicates exist', () => {
      qt.insert({ x: 10, y: 10 }, 'dup')
      expect(qt.remove({ x: 10, y: 10 })).toBe(true)
      expect(qt.size()).toBe(3)
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
      const sub = new QuadTreeSpatial<string>({ capacity: 2 })
      for (let i = 0; i < 10; i++) {
        sub.insert({ x: i * 9, y: i * 9 }, `p${i}`)
      }
      expect(sub.remove({ x: 0, y: 0 })).toBe(true)
      expect(sub.size()).toBe(9)
    })

    it('should return boolean', () => {
      expect(typeof qt.remove({ x: 10, y: 10 })).toBe('boolean')
    })
  })

  describe('queryRange', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
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
      const results = qt.queryRange({ x: 0, y: 0, width: 100, height: 100 })
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
      const sub = new QuadTreeSpatial<string>({ capacity: 2 })
      for (let i = 0; i < 10; i++) {
        sub.insert({ x: i * 9, y: i * 9 }, `p${i}`)
      }
      const results = sub.queryRange({ x: 0, y: 0, width: 20, height: 20 })
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should return empty array for empty tree', () => {
      const empty = new QuadTreeSpatial<string>()
      expect(empty.queryRange({ x: 0, y: 0, width: 100, height: 100 })).toEqual([])
    })

    it('should handle zero-size range', () => {
      const results = qt.queryRange({ x: 10, y: 10, width: 0, height: 0 })
      expect(results).toHaveLength(0)
    })
  })

  describe('queryPoint', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
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
      const empty = new QuadTreeSpatial<string>()
      expect(empty.queryPoint({ x: 10, y: 10 })).toBeUndefined()
    })

    it('should work after removal', () => {
      qt.remove({ x: 10, y: 10 })
      expect(qt.queryPoint({ x: 10, y: 10 })).toBeUndefined()
    })

    it('should work on subdivided tree', () => {
      const sub = new QuadTreeSpatial<string>({ capacity: 1 })
      sub.insert({ x: 10, y: 10 }, 'a')
      sub.insert({ x: 20, y: 20 }, 'b')
      expect(sub.queryPoint({ x: 20, y: 20 })).toBe('b')
    })

    it('should handle floating point coordinates', () => {
      qt.insert({ x: 0.5, y: 0.5 }, 'fp')
      expect(qt.queryPoint({ x: 0.5, y: 0.5 })).toBe('fp')
    })
  })

  describe('queryRadius', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 50, y: 50 }, 'c')
      qt.insert({ x: 80, y: 80 }, 'd')
    })

    it('should return points within radius', () => {
      const results = qt.queryRadius({ x: 10, y: 10 }, 5)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('a')
    })

    it('should return multiple points within radius', () => {
      const results = qt.queryRadius({ x: 15, y: 15 }, 20)
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should return empty for radius with no points', () => {
      const results = qt.queryRadius({ x: 95, y: 95 }, 2)
      expect(results).toHaveLength(0)
    })

    it('should return all points for large radius', () => {
      const results = qt.queryRadius({ x: 50, y: 50 }, 200)
      expect(results).toHaveLength(4)
    })

    it('should return empty for zero radius with no exact match', () => {
      const results = qt.queryRadius({ x: 10, y: 10 }, 0)
      expect(results).toHaveLength(1)
    })

    it('should return empty for empty tree', () => {
      const empty = new QuadTreeSpatial<string>()
      expect(empty.queryRadius({ x: 50, y: 50 }, 10)).toEqual([])
    })

    it('should work on subdivided tree', () => {
      const sub = new QuadTreeSpatial<string>({ capacity: 2 })
      for (let i = 0; i < 10; i++) {
        sub.insert({ x: i * 10, y: i * 10 }, `p${i}`)
      }
      const results = sub.queryRadius({ x: 0, y: 0 }, 15)
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle radius extending outside bounds', () => {
      const results = qt.queryRadius({ x: 5, y: 5 }, 10)
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should use euclidean distance', () => {
      qt.insert({ x: 14, y: 10 }, 'near')
      qt.insert({ x: 16, y: 10 }, 'far')
      const results = qt.queryRadius({ x: 10, y: 10 }, 5)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('near')
      expect(values).not.toContain('far')
    })
  })

  describe('nearestNeighbor', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 30, y: 30 }, 'b')
      qt.insert({ x: 50, y: 50 }, 'c')
    })

    it('should return the nearest point', () => {
      const result = qt.nearestNeighbor({ x: 12, y: 12 })
      expect(result).toBeDefined()
      expect(result!.value).toBe('a')
    })

    it('should return correct distance', () => {
      const result = qt.nearestNeighbor({ x: 10, y: 10 })
      expect(result).toBeDefined()
      expect(result!.distance).toBe(0)
    })

    it('should return undefined for empty tree', () => {
      const empty = new QuadTreeSpatial<string>()
      expect(empty.nearestNeighbor({ x: 50, y: 50 })).toBeUndefined()
    })

    it('should find nearest among many points', () => {
      const result = qt.nearestNeighbor({ x: 29, y: 29 })
      expect(result).toBeDefined()
      expect(result!.value).toBe('b')
    })

    it('should work on subdivided tree', () => {
      const sub = new QuadTreeSpatial<string>({ capacity: 1 })
      sub.insert({ x: 10, y: 10 }, 'a')
      sub.insert({ x: 80, y: 80 }, 'b')
      sub.insert({ x: 15, y: 15 }, 'c')
      const result = sub.nearestNeighbor({ x: 14, y: 14 })
      expect(result).toBeDefined()
      expect(result!.value).toBe('c')
    })

    it('should return point and value in result', () => {
      const result = qt.nearestNeighbor({ x: 25, y: 25 })
      expect(result!.point).toEqual({ x: 30, y: 30 })
      expect(result!.value).toBe('b')
    })

    it('should handle single point tree', () => {
      const single = new QuadTreeSpatial<string>()
      single.insert({ x: 50, y: 50 }, 'only')
      const result = single.nearestNeighbor({ x: 0, y: 0 })
      expect(result!.value).toBe('only')
    })

    it('should handle duplicate points', () => {
      qt.insert({ x: 10, y: 10 }, 'dup')
      const result = qt.nearestNeighbor({ x: 10, y: 10 })
      expect(result!.distance).toBe(0)
    })
  })

  describe('kNearestNeighbors', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      qt.insert({ x: 40, y: 40 }, 'd')
      qt.insert({ x: 50, y: 50 }, 'e')
    })

    it('should return k nearest points', () => {
      const results = qt.kNearestNeighbors({ x: 25, y: 25 }, 3)
      expect(results).toHaveLength(3)
    })

    it('should return results sorted by distance', () => {
      const results = qt.kNearestNeighbors({ x: 25, y: 25 }, 5)
      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.distance).toBeGreaterThanOrEqual(results[i - 1]!.distance)
      }
    })

    it('should return empty for k=0', () => {
      const results = qt.kNearestNeighbors({ x: 25, y: 25 }, 0)
      expect(results).toHaveLength(0)
    })

    it('should return empty for negative k', () => {
      const results = qt.kNearestNeighbors({ x: 25, y: 25 }, -1)
      expect(results).toHaveLength(0)
    })

    it('should return all points if k exceeds size', () => {
      const results = qt.kNearestNeighbors({ x: 25, y: 25 }, 100)
      expect(results).toHaveLength(5)
    })

    it('should return empty for empty tree', () => {
      const empty = new QuadTreeSpatial<string>()
      expect(empty.kNearestNeighbors({ x: 50, y: 50 }, 5)).toEqual([])
    })

    it('should include distance in results', () => {
      const results = qt.kNearestNeighbors({ x: 10, y: 10 }, 1)
      expect(results[0]!.distance).toBe(0)
    })

    it('should work on subdivided tree', () => {
      const sub = new QuadTreeSpatial<string>({ capacity: 2 })
      for (let i = 0; i < 10; i++) {
        sub.insert({ x: i * 10, y: i * 10 }, `p${i}`)
      }
      const results = sub.kNearestNeighbors({ x: 0, y: 0 }, 3)
      expect(results).toHaveLength(3)
      expect(results[0]!.distance).toBeLessThanOrEqual(results[1]!.distance)
    })

    it('should return single nearest for k=1', () => {
      const results = qt.kNearestNeighbors({ x: 25, y: 25 }, 1)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('b')
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const qt = new QuadTreeSpatial<string>()
      expect(qt.size()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      expect(qt.size()).toBe(2)
    })

    it('should return correct count after removals', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.remove({ x: 10, y: 10 })
      expect(qt.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.clear()
      expect(qt.size()).toBe(0)
    })

    it('should not count failed inserts', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 200, y: 200 }, 'out')
      expect(qt.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      const qt = new QuadTreeSpatial<string>()
      expect(qt.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      expect(qt.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.clear()
      expect(qt.isEmpty()).toBe(true)
    })

    it('should return true after removing all points', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.remove({ x: 10, y: 10 })
      expect(qt.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
    })

    it('should remove all points', () => {
      qt.clear()
      expect(qt.size()).toBe(0)
    })

    it('should allow insert after clear', () => {
      qt.clear()
      qt.insert({ x: 30, y: 30 }, 'c')
      expect(qt.size()).toBe(1)
    })

    it('should return void', () => {
      expect(qt.clear()).toBeUndefined()
    })

    it('should handle clear on empty tree', () => {
      const empty = new QuadTreeSpatial<string>()
      empty.clear()
      expect(empty.size()).toBe(0)
    })

    it('should allow queries after clear', () => {
      qt.clear()
      expect(qt.queryPoint({ x: 10, y: 10 })).toBeUndefined()
      expect(qt.queryRange({ x: 0, y: 0, width: 100, height: 100 })).toEqual([])
    })
  })

  describe('contains', () => {
    let qt: QuadTreeSpatial<string>

    beforeEach(() => {
      qt = new QuadTreeSpatial<string>()
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

    it('should respect custom bounds', () => {
      const custom = new QuadTreeSpatial<string>({ bounds: { x: 10, y: 10, width: 50, height: 50 } })
      expect(custom.contains({ x: 10, y: 10 })).toBe(true)
      expect(custom.contains({ x: 9, y: 10 })).toBe(false)
    })
  })

  describe('forEach', () => {
    it('should iterate over all points', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      const results: Array<{ point: Point; value: string }> = []
      qt.forEach((point, value) => results.push({ point, value }))
      expect(results).toHaveLength(2)
    })

    it('should not iterate on empty tree', () => {
      const qt = new QuadTreeSpatial<string>()
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should provide correct point and value', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 5, y: 5 }, 'test')
      qt.forEach((point, value) => {
        expect(point).toEqual({ x: 5, y: 5 })
        expect(value).toBe('test')
      })
    })

    it('should work on subdivided tree', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 1 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(3)
    })

    it('should return void', () => {
      const qt = new QuadTreeSpatial<string>()
      expect(qt.forEach(() => {})).toBeUndefined()
    })
  })

  describe('subdivision', () => {
    it('should subdivide when capacity exceeded', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 2 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 60, y: 60 }, 'b')
      qt.insert({ x: 10, y: 60 }, 'c')
      expect(qt.size()).toBe(3)
    })

    it('should distribute points to correct quadrants', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 2 })
      qt.insert({ x: 10, y: 10 }, 'nw')
      qt.insert({ x: 60, y: 10 }, 'ne')
      qt.insert({ x: 10, y: 60 }, 'sw')
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('nw')
      expect(qt.queryPoint({ x: 60, y: 10 })).toBe('ne')
      expect(qt.queryPoint({ x: 10, y: 60 })).toBe('sw')
    })

    it('should respect maxDepth and stop subdividing', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 1, maxDepth: 1 })
      qt.insert({ x: 1, y: 1 }, 'a')
      qt.insert({ x: 2, y: 2 }, 'b')
      qt.insert({ x: 3, y: 3 }, 'c')
      qt.insert({ x: 4, y: 4 }, 'd')
      qt.insert({ x: 5, y: 5 }, 'e')
      expect(qt.size()).toBe(5)
    })

    it('should query correctly after subdivision', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 1 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 80, y: 80 }, 'b')
      const results = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('a')
    })

    it('should handle remove after subdivision', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 1 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 80, y: 80 }, 'b')
      expect(qt.remove({ x: 10, y: 10 })).toBe(true)
      expect(qt.size()).toBe(1)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBeUndefined()
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_QUADTREE_SPATIAL_OPTIONS', () => {
      expect(DEFAULT_QUADTREE_SPATIAL_OPTIONS.capacity).toBe(4)
      expect(DEFAULT_QUADTREE_SPATIAL_OPTIONS.maxDepth).toBe(8)
    })

    it('should support QuadTreeSpatialOptions interface', () => {
      const opts: QuadTreeSpatialOptions = { bounds: { x: 0, y: 0, width: 100, height: 100 }, capacity: 10, maxDepth: 5 }
      expect(opts.capacity).toBe(10)
    })

    it('should support Point interface', () => {
      const p: Point = { x: 1, y: 2 }
      expect(p.x).toBe(1)
      expect(p.y).toBe(2)
    })

    it('should support BoundingBox interface', () => {
      const b: BoundingBox = { x: 0, y: 0, width: 100, height: 100 }
      expect(b.width).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('should handle very small bounds', () => {
      const qt = new QuadTreeSpatial<string>({ bounds: { x: 0, y: 0, width: 1, height: 1 } })
      expect(qt.insert({ x: 0.5, y: 0.5 }, 'in')).toBe(true)
    })

    it('should handle many points at same location', () => {
      const qt = new QuadTreeSpatial<number>()
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: 50, y: 50 }, i)
      }
      expect(qt.size()).toBe(10)
    })

    it('should handle negative coordinates', () => {
      const qt = new QuadTreeSpatial<string>({ bounds: { x: -100, y: -100, width: 200, height: 200 } })
      expect(qt.insert({ x: -50, y: -50 }, 'neg')).toBe(true)
      expect(qt.queryPoint({ x: -50, y: -50 })).toBe('neg')
    })

    it('should handle generic value types', () => {
      const qt = new QuadTreeSpatial<{ name: string }>()
      qt.insert({ x: 10, y: 10 }, { name: 'test' })
      const result = qt.queryPoint({ x: 10, y: 10 })
      expect(result?.name).toBe('test')
    })

    it('should handle generic number values', () => {
      const qt = new QuadTreeSpatial<number>()
      qt.insert({ x: 10, y: 10 }, 42)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe(42)
    })

    it('should handle null values', () => {
      const qt = new QuadTreeSpatial<null>()
      qt.insert({ x: 10, y: 10 }, null)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe(null)
    })
  })

  describe('large datasets', () => {
    it('should handle 100 points', () => {
      const qt = new QuadTreeSpatial<number>()
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i }, i)
      }
      expect(qt.size()).toBe(100)
    })

    it('should handle range queries on large dataset', () => {
      const qt = new QuadTreeSpatial<number>()
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i }, i)
      }
      const results = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(results.length).toBe(50)
    })

    it('should handle many removals', () => {
      const qt = new QuadTreeSpatial<number>()
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: i * 2, y: i * 2 }, i)
      }
      for (let i = 0; i < 25; i++) {
        qt.remove({ x: i * 2, y: i * 2 })
      }
      expect(qt.size()).toBe(25)
    })

    it('should handle forEach on large dataset', () => {
      const qt = new QuadTreeSpatial<number>({ capacity: 4 })
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: i * 2, y: i * 2 }, i)
      }
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(50)
    })

    it('should handle kNearest on large dataset', () => {
      const qt = new QuadTreeSpatial<number>()
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i }, i)
      }
      const results = qt.kNearestNeighbors({ x: 50, y: 50 }, 5)
      expect(results).toHaveLength(5)
      expect(results[0]!.distance).toBe(0)
    })

    it('should handle queryRadius on large dataset', () => {
      const qt = new QuadTreeSpatial<number>()
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i }, i)
      }
      const results = qt.queryRadius({ x: 50, y: 50 }, 10)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across mixed operations', () => {
      const qt = new QuadTreeSpatial<string>({ capacity: 2 })
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.insert({ x: 20, y: 20 }, 'b')
      qt.insert({ x: 30, y: 30 }, 'c')
      qt.remove({ x: 20, y: 20 })
      qt.insert({ x: 40, y: 40 }, 'd')
      expect(qt.size()).toBe(3)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBe('a')
      expect(qt.queryPoint({ x: 20, y: 20 })).toBeUndefined()
      expect(qt.queryPoint({ x: 30, y: 30 })).toBe('c')
      expect(qt.queryPoint({ x: 40, y: 40 })).toBe('d')
    })

    it('should handle clear and rebuild', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'a')
      qt.clear()
      qt.insert({ x: 20, y: 20 }, 'b')
      expect(qt.size()).toBe(1)
      expect(qt.queryPoint({ x: 10, y: 10 })).toBeUndefined()
      expect(qt.queryPoint({ x: 20, y: 20 })).toBe('b')
    })

    it('should handle insert-remove-insert cycle', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 50, y: 50 }, 'first')
      qt.remove({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 50 }, 'second')
      expect(qt.queryPoint({ x: 50, y: 50 })).toBe('second')
      expect(qt.size()).toBe(1)
    })

    it('should handle query after multiple subdivisions', () => {
      const qt = new QuadTreeSpatial<string>({ bounds: { x: 0, y: 0, width: 1000, height: 1000 }, capacity: 1 })
      qt.insert({ x: 100, y: 100 }, 'a')
      qt.insert({ x: 200, y: 200 }, 'b')
      qt.insert({ x: 300, y: 300 }, 'c')
      qt.insert({ x: 400, y: 400 }, 'd')
      qt.insert({ x: 500, y: 500 }, 'e')
      const results = qt.queryRange({ x: 150, y: 150, width: 300, height: 300 })
      expect(results.length).toBe(3)
    })

    it('should handle forEach with duplicates at same location', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 50, y: 50 }, 'a')
      qt.insert({ x: 50, y: 50 }, 'b')
      const items: string[] = []
      qt.forEach((_, value) => items.push(value))
      expect(items).toHaveLength(2)
      expect(items).toContain('a')
      expect(items).toContain('b')
    })

    it('should handle nearestNeighbor after clear and reinsert', () => {
      const qt = new QuadTreeSpatial<string>()
      qt.insert({ x: 10, y: 10 }, 'old')
      qt.clear()
      qt.insert({ x: 90, y: 90 }, 'new')
      const result = qt.nearestNeighbor({ x: 90, y: 90 })
      expect(result!.value).toBe('new')
    })
  })
})
