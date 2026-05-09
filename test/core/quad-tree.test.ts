import { describe, it, expect, beforeEach } from 'vitest'
import { QuadTree } from '../../src/core/quad-tree/quad-tree.js'
import type { Point, Rectangle } from '../../src/core/quad-tree/types.js'

describe('QuadTree', () => {
  const defaultBounds: Rectangle = { x: 0, y: 0, width: 100, height: 100 }

  describe('constructor', () => {
    it('should create tree with boundary', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.size).toBe(0)
    })

    it('should create tree with custom capacity', () => {
      const qt = new QuadTree(defaultBounds, 8)
      expect(qt.size).toBe(0)
    })

    it('should create tree with custom maxDepth', () => {
      const qt = new QuadTree(defaultBounds, 4, 6)
      expect(qt.size).toBe(0)
    })

    it('should create tree with all parameters', () => {
      const qt = new QuadTree(defaultBounds, 2, 10)
      expect(qt.size).toBe(0)
    })

    it('should have depth 0 for empty tree', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.depth).toBe(0)
    })

    it('should expose bounds', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.bounds).toEqual(defaultBounds)
    })

    it('should return copy of bounds', () => {
      const qt = new QuadTree(defaultBounds)
      const b = qt.bounds
      b.x = 999
      expect(qt.bounds.x).toBe(0)
    })

    it('should handle non-zero origin bounds', () => {
      const bounds: Rectangle = { x: -50, y: -50, width: 100, height: 100 }
      const qt = new QuadTree(bounds)
      expect(qt.bounds).toEqual(bounds)
    })

    it('should handle large bounds', () => {
      const bounds: Rectangle = { x: 0, y: 0, width: 10000, height: 10000 }
      const qt = new QuadTree(bounds)
      expect(qt.size).toBe(0)
    })

    it('should handle fractional bounds', () => {
      const bounds: Rectangle = { x: 0.5, y: 0.5, width: 99.5, height: 99.5 }
      const qt = new QuadTree(bounds)
      expect(qt.size).toBe(0)
    })

    it('should use capacity of 4 by default', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 60, y: 10 })
      qt.insert({ x: 10, y: 60 })
      qt.insert({ x: 60, y: 60 })
      expect(qt.depth).toBe(0)
      qt.insert({ x: 25, y: 25 })
      expect(qt.depth).toBe(1)
    })
  })

  describe('insert', () => {
    let qt: QuadTree

    beforeEach(() => {
      qt = new QuadTree(defaultBounds)
    })

    it('should insert a single point', () => {
      expect(qt.insert({ x: 50, y: 50 })).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('should insert multiple points', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      expect(qt.size).toBe(3)
    })

    it('should reject point outside bounds (right)', () => {
      expect(qt.insert({ x: 100, y: 50 })).toBe(false)
    })

    it('should reject point outside bounds (bottom)', () => {
      expect(qt.insert({ x: 50, y: 100 })).toBe(false)
    })

    it('should reject point outside bounds (left)', () => {
      expect(qt.insert({ x: -1, y: 50 })).toBe(false)
    })

    it('should reject point outside bounds (top)', () => {
      expect(qt.insert({ x: 50, y: -1 })).toBe(false)
    })

    it('should accept point on left edge', () => {
      expect(qt.insert({ x: 0, y: 50 })).toBe(true)
    })

    it('should accept point on top edge', () => {
      expect(qt.insert({ x: 50, y: 0 })).toBe(true)
    })

    it('should accept point on corner (0,0)', () => {
      expect(qt.insert({ x: 0, y: 0 })).toBe(true)
    })

    it('should allow duplicate points', () => {
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 50 })
      expect(qt.size).toBe(2)
    })

    it('should accept fractional coordinates', () => {
      expect(qt.insert({ x: 50.5, y: 50.5 })).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('should accept negative coordinates within bounds', () => {
      const bounds: Rectangle = { x: -100, y: -100, width: 200, height: 200 }
      const q = new QuadTree(bounds)
      expect(q.insert({ x: -50, y: -50 })).toBe(true)
      expect(q.size).toBe(1)
    })

    it('should handle inserting many points triggering subdivision', () => {
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i })
      }
      expect(qt.size).toBe(100)
      expect(qt.depth).toBeGreaterThan(0)
    })

    it('should insert at exact center', () => {
      expect(qt.insert({ x: 50, y: 50 })).toBe(true)
    })

    it('should return boolean', () => {
      const result = qt.insert({ x: 50, y: 50 })
      expect(typeof result).toBe('boolean')
    })
  })

  describe('remove', () => {
    let qt: QuadTree

    beforeEach(() => {
      qt = new QuadTree(defaultBounds)
    })

    it('should remove an existing point', () => {
      qt.insert({ x: 50, y: 50 })
      expect(qt.remove({ x: 50, y: 50 })).toBe(true)
      expect(qt.size).toBe(0)
    })

    it('should return false for non-existent point', () => {
      expect(qt.remove({ x: 50, y: 50 })).toBe(false)
    })

    it('should remove correct point among many', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      qt.remove({ x: 20, y: 20 })
      expect(qt.size).toBe(2)
      expect(qt.contains({ x: 10, y: 10 })).toBe(true)
      expect(qt.contains({ x: 20, y: 20 })).toBe(false)
      expect(qt.contains({ x: 30, y: 30 })).toBe(true)
    })

    it('should only remove one duplicate', () => {
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 50 })
      qt.remove({ x: 50, y: 50 })
      expect(qt.size).toBe(1)
      expect(qt.contains({ x: 50, y: 50 })).toBe(true)
    })

    it('should remove from subdivided tree', () => {
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      expect(qt.remove({ x: 0, y: 0 })).toBe(true)
      expect(qt.size).toBe(19)
    })

    it('should return false for point outside bounds', () => {
      expect(qt.remove({ x: 200, y: 200 })).toBe(false)
    })

    it('should handle remove from empty tree', () => {
      expect(qt.remove({ x: 50, y: 50 })).toBe(false)
    })

    it('should decrement size correctly on multiple removes', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      qt.remove({ x: 10, y: 10 })
      expect(qt.size).toBe(2)
      qt.remove({ x: 30, y: 30 })
      expect(qt.size).toBe(1)
      qt.remove({ x: 20, y: 20 })
      expect(qt.size).toBe(0)
    })

    it('should not affect other points after removal', () => {
      const points: Point[] = [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 80, y: 80 },
      ]
      for (const p of points) qt.insert(p)
      qt.remove({ x: 20, y: 20 })
      const all = qt.toArray()
      expect(all).toContainEqual({ x: 10, y: 10 })
      expect(all).toContainEqual({ x: 80, y: 80 })
      expect(all).toHaveLength(2)
    })

    it('should remove with exact coordinate match', () => {
      qt.insert({ x: 50.5, y: 50.5 })
      expect(qt.remove({ x: 50.5, y: 50.5 })).toBe(true)
      expect(qt.remove({ x: 50, y: 50 })).toBe(false)
    })
  })

  describe('contains', () => {
    let qt: QuadTree

    beforeEach(() => {
      qt = new QuadTree(defaultBounds)
    })

    it('should find inserted point', () => {
      qt.insert({ x: 50, y: 50 })
      expect(qt.contains({ x: 50, y: 50 })).toBe(true)
    })

    it('should not find non-inserted point', () => {
      expect(qt.contains({ x: 50, y: 50 })).toBe(false)
    })

    it('should not find point in empty tree', () => {
      expect(qt.contains({ x: 50, y: 50 })).toBe(false)
    })

    it('should find points in subdivided tree', () => {
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      expect(qt.contains({ x: 0, y: 0 })).toBe(true)
      expect(qt.contains({ x: 95, y: 95 })).toBe(true)
    })

    it('should not confuse similar points', () => {
      qt.insert({ x: 50, y: 50 })
      expect(qt.contains({ x: 50.001, y: 50 })).toBe(false)
    })

    it('should handle point outside bounds', () => {
      qt.insert({ x: 50, y: 50 })
      expect(qt.contains({ x: 200, y: 200 })).toBe(false)
    })

    it('should find point after removal of another', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.remove({ x: 10, y: 10 })
      expect(qt.contains({ x: 20, y: 20 })).toBe(true)
    })

    it('should not find removed point', () => {
      qt.insert({ x: 50, y: 50 })
      qt.remove({ x: 50, y: 50 })
      expect(qt.contains({ x: 50, y: 50 })).toBe(false)
    })
  })

  describe('queryRange', () => {
    let qt: QuadTree

    beforeEach(() => {
      qt = new QuadTree(defaultBounds, 4)
    })

    it('should return empty array for empty tree', () => {
      expect(qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })).toEqual([])
    })

    it('should find point in range', () => {
      qt.insert({ x: 25, y: 25 })
      const result = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(result).toContainEqual({ x: 25, y: 25 })
    })

    it('should exclude point outside range', () => {
      qt.insert({ x: 75, y: 75 })
      const result = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(result).toHaveLength(0)
    })

    it('should find multiple points in range', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 80, y: 80 })
      const result = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(result).toHaveLength(2)
    })

    it('should handle range covering entire bounds', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 90, y: 90 })
      const result = qt.queryRange(defaultBounds)
      expect(result).toHaveLength(2)
    })

    it('should handle range outside all points', () => {
      qt.insert({ x: 10, y: 10 })
      const result = qt.queryRange({ x: 50, y: 50, width: 50, height: 50 })
      expect(result).toHaveLength(0)
    })

    it('should handle non-overlapping range', () => {
      qt.insert({ x: 10, y: 10 })
      const result = qt.queryRange({ x: 200, y: 200, width: 50, height: 50 })
      expect(result).toHaveLength(0)
    })

    it('should find point on range boundary (left)', () => {
      qt.insert({ x: 25, y: 25 })
      const result = qt.queryRange({ x: 25, y: 0, width: 50, height: 100 })
      expect(result).toHaveLength(1)
    })

    it('should find point on range boundary (top)', () => {
      qt.insert({ x: 25, y: 25 })
      const result = qt.queryRange({ x: 0, y: 25, width: 100, height: 50 })
      expect(result).toHaveLength(1)
    })

    it('should not find point on exclusive boundary (right)', () => {
      qt.insert({ x: 75, y: 25 })
      const result = qt.queryRange({ x: 0, y: 0, width: 75, height: 100 })
      expect(result).toHaveLength(0)
    })

    it('should not find point on exclusive boundary (bottom)', () => {
      qt.insert({ x: 25, y: 75 })
      const result = qt.queryRange({ x: 0, y: 0, width: 100, height: 75 })
      expect(result).toHaveLength(0)
    })

    it('should handle many points in subdivided tree', () => {
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: i * 2, y: i * 2 })
      }
      const result = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(result.length).toBeGreaterThan(0)
      for (const p of result) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(50)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeLessThan(50)
      }
    })

    it('should return all points for full coverage range', () => {
      for (let i = 0; i < 30; i++) {
        qt.insert({ x: i * 3, y: i * 3 })
      }
      const result = qt.queryRange(defaultBounds)
      expect(result).toHaveLength(30)
    })
  })

  describe('queryRadius', () => {
    let qt: QuadTree

    beforeEach(() => {
      qt = new QuadTree(defaultBounds)
    })

    it('should return empty for empty tree', () => {
      expect(qt.queryRadius({ x: 50, y: 50 }, 10)).toEqual([])
    })

    it('should find point within radius', () => {
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 10)
      expect(result).toHaveLength(1)
    })

    it('should exclude point outside radius', () => {
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRadius({ x: 0, y: 0 }, 10)
      expect(result).toHaveLength(0)
    })

    it('should find points at exact radius boundary', () => {
      qt.insert({ x: 60, y: 50 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 10)
      expect(result).toHaveLength(1)
    })

    it('should find multiple points within radius', () => {
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 55, y: 50 })
      qt.insert({ x: 50, y: 55 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 10)
      expect(result).toHaveLength(3)
    })

    it('should handle zero radius', () => {
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 0)
      expect(result).toHaveLength(1)
    })

    it('should handle large radius', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 90, y: 90 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 100)
      expect(result).toHaveLength(2)
    })

    it('should work with many points in subdivided tree', () => {
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: i * 2, y: i * 2 })
      }
      const result = qt.queryRadius({ x: 50, y: 50 }, 20)
      for (const p of result) {
        const dx = p.x - 50
        const dy = p.y - 50
        expect(Math.sqrt(dx * dx + dy * dy)).toBeLessThanOrEqual(20)
      }
    })

    it('should handle radius outside bounds', () => {
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRadius({ x: 200, y: 200 }, 10)
      expect(result).toHaveLength(0)
    })

    it('should find points diagonally', () => {
      qt.insert({ x: 55, y: 55 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 8)
      expect(result).toHaveLength(1)
    })

    it('should exclude points just outside radius', () => {
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 61 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 10)
      expect(result).toHaveLength(1)
    })
  })

  describe('nearestNeighbor', () => {
    let qt: QuadTree

    beforeEach(() => {
      qt = new QuadTree(defaultBounds)
    })

    it('should return undefined for empty tree', () => {
      expect(qt.nearestNeighbor({ x: 50, y: 50 })).toBeUndefined()
    })

    it('should return the only point', () => {
      qt.insert({ x: 50, y: 50 })
      expect(qt.nearestNeighbor({ x: 50, y: 50 })).toEqual({ x: 50, y: 50 })
    })

    it('should find closest of two points', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 90, y: 90 })
      expect(qt.nearestNeighbor({ x: 5, y: 5 })).toEqual({ x: 10, y: 10 })
    })

    it('should find closest of many points', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 80, y: 80 })
      qt.insert({ x: 90, y: 90 })
      expect(qt.nearestNeighbor({ x: 15, y: 15 })).toEqual({ x: 10, y: 10 })
    })

    it('should return exact match', () => {
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 30, y: 30 })
      expect(qt.nearestNeighbor({ x: 50, y: 50 })).toEqual({ x: 50, y: 50 })
    })

    it('should work in subdivided tree', () => {
      for (let i = 0; i < 30; i++) {
        qt.insert({ x: i * 3, y: i * 3 })
      }
      const nn = qt.nearestNeighbor({ x: 50, y: 50 })
      expect(nn).toBeDefined()
      if (nn) {
        const all = qt.toArray()
        let minDist = Infinity
        for (const p of all) {
          const dx = p.x - 50
          const dy = p.y - 50
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < minDist) minDist = d
        }
        const dx = nn.x - 50
        const dy = nn.y - 50
        expect(Math.sqrt(dx * dx + dy * dy)).toBeCloseTo(minDist)
      }
    })

    it('should handle query outside point cluster', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 11, y: 11 })
      qt.insert({ x: 12, y: 12 })
      const nn = qt.nearestNeighbor({ x: 90, y: 90 })
      expect(nn).toEqual({ x: 12, y: 12 })
    })

    it('should handle single point tree', () => {
      qt.insert({ x: 75, y: 75 })
      expect(qt.nearestNeighbor({ x: 0, y: 0 })).toEqual({ x: 75, y: 75 })
    })

    it('should work after removal', () => {
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.remove({ x: 20, y: 20 })
      expect(qt.nearestNeighbor({ x: 15, y: 15 })).toEqual({ x: 10, y: 10 })
    })
  })

  describe('clear', () => {
    it('should clear all points', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 10, y: 10 })
      qt.clear()
      expect(qt.size).toBe(0)
    })

    it('should clear subdivided tree', () => {
      const qt = new QuadTree(defaultBounds, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      qt.clear()
      expect(qt.size).toBe(0)
      expect(qt.depth).toBe(0)
    })

    it('should allow re-insertion after clear', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      qt.clear()
      qt.insert({ x: 25, y: 25 })
      expect(qt.size).toBe(1)
      expect(qt.contains({ x: 25, y: 25 })).toBe(true)
    })

    it('should handle clear on empty tree', () => {
      const qt = new QuadTree(defaultBounds)
      qt.clear()
      expect(qt.size).toBe(0)
    })

    it('should reset depth after clear', () => {
      const qt = new QuadTree(defaultBounds, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      expect(qt.depth).toBeGreaterThan(0)
      qt.clear()
      expect(qt.depth).toBe(0)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.size).toBe(0)
    })

    it('should reflect insertions', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      expect(qt.size).toBe(3)
    })

    it('should reflect removals', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.remove({ x: 10, y: 10 })
      expect(qt.size).toBe(1)
    })

    it('should be readonly-like property', () => {
      const qt = new QuadTree(defaultBounds)
      expect(typeof qt.size).toBe('number')
    })
  })

  describe('depth', () => {
    it('should be 0 for empty tree', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.depth).toBe(0)
    })

    it('should be 0 before subdivision', () => {
      const qt = new QuadTree(defaultBounds, 4)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      expect(qt.depth).toBe(0)
    })

    it('should increase after subdivision', () => {
      const qt = new QuadTree(defaultBounds, 2)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      expect(qt.depth).toBeGreaterThan(0)
    })

    it('should respect maxDepth', () => {
      const qt = new QuadTree(defaultBounds, 1, 3)
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: i, y: i })
      }
      expect(qt.depth).toBeLessThanOrEqual(3)
    })

    it('should be 0 after clear', () => {
      const qt = new QuadTree(defaultBounds, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      qt.clear()
      expect(qt.depth).toBe(0)
    })
  })

  describe('bounds', () => {
    it('should return the boundary', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.bounds).toEqual(defaultBounds)
    })

    it('should return copy', () => {
      const qt = new QuadTree(defaultBounds)
      const b = qt.bounds
      b.x = 999
      expect(qt.bounds.x).toBe(0)
    })

    it('should persist after operations', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      qt.remove({ x: 50, y: 50 })
      qt.clear()
      expect(qt.bounds).toEqual(defaultBounds)
    })
  })

  describe('forEach', () => {
    it('should iterate over empty tree', () => {
      const qt = new QuadTree(defaultBounds)
      const points: Point[] = []
      qt.forEach((p) => points.push(p))
      expect(points).toEqual([])
    })

    it('should iterate over single point', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const points: Point[] = []
      qt.forEach((p) => points.push(p))
      expect(points).toEqual([{ x: 50, y: 50 }])
    })

    it('should iterate over multiple points', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      const points: Point[] = []
      qt.forEach((p) => points.push(p))
      expect(points).toHaveLength(3)
    })

    it('should iterate over subdivided tree', () => {
      const qt = new QuadTree(defaultBounds, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      const points: Point[] = []
      qt.forEach((p) => points.push(p))
      expect(points).toHaveLength(20)
    })

    it('should provide point argument', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 42, y: 42 })
      let found: Point | undefined
      qt.forEach((p) => { found = p })
      expect(found).toEqual({ x: 42, y: 42 })
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.toArray()).toEqual([])
    })

    it('should return all points', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      const arr = qt.toArray()
      expect(arr).toHaveLength(2)
    })

    it('should return points from subdivided tree', () => {
      const qt = new QuadTree(defaultBounds, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      expect(qt.toArray()).toHaveLength(20)
    })

    it('should return new array each call', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const a1 = qt.toArray()
      const a2 = qt.toArray()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })
  })

  describe('clone', () => {
    it('should clone empty tree', () => {
      const qt = new QuadTree(defaultBounds)
      const cloned = qt.clone()
      expect(cloned.size).toBe(0)
    })

    it('should clone with all points', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      const cloned = qt.clone()
      expect(cloned.size).toBe(3)
    })

    it('should be independent', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const cloned = qt.clone()
      cloned.insert({ x: 25, y: 25 })
      expect(qt.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('should preserve bounds', () => {
      const qt = new QuadTree(defaultBounds)
      const cloned = qt.clone()
      expect(cloned.bounds).toEqual(defaultBounds)
    })

    it('should clone subdivided tree', () => {
      const qt = new QuadTree(defaultBounds, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      const cloned = qt.clone()
      expect(cloned.size).toBe(20)
      expect(cloned.toArray()).toHaveLength(20)
    })

    it('should not share points', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const cloned = qt.clone()
      cloned.remove({ x: 50, y: 50 })
      expect(qt.contains({ x: 50, y: 50 })).toBe(true)
      expect(cloned.contains({ x: 50, y: 50 })).toBe(false)
    })

    it('should preserve capacity and maxDepth', () => {
      const qt = new QuadTree(defaultBounds, 2, 5)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 30, y: 30 })
      const cloned = qt.clone()
      cloned.insert({ x: 40, y: 40 })
      cloned.insert({ x: 50, y: 50 })
      expect(cloned.size).toBe(5)
    })
  })

  describe('subdivision', () => {
    it('should subdivide into NW/NE/SW/SE', () => {
      const qt = new QuadTree(defaultBounds, 2)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 60, y: 10 })
      qt.insert({ x: 10, y: 60 })
      expect(qt.depth).toBeGreaterThan(0)
      expect(qt.size).toBe(3)
    })

    it('should distribute points to children', () => {
      const qt = new QuadTree(defaultBounds, 1)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 60, y: 10 })
      qt.insert({ x: 10, y: 60 })
      qt.insert({ x: 60, y: 60 })
      expect(qt.size).toBe(4)
      const all = qt.toArray()
      expect(all).toHaveLength(4)
    })

    it('should handle points at subdivision boundary', () => {
      const qt = new QuadTree(defaultBounds, 1)
      qt.insert({ x: 0, y: 0 })
      qt.insert({ x: 50, y: 0 })
      qt.insert({ x: 0, y: 50 })
      qt.insert({ x: 50, y: 50 })
      expect(qt.size).toBe(4)
    })

    it('should handle deep subdivision', () => {
      const qt = new QuadTree(defaultBounds, 1, 10)
      qt.insert({ x: 0, y: 0 })
      qt.insert({ x: 0, y: 0 })
      qt.insert({ x: 0, y: 0 })
      qt.insert({ x: 0, y: 0 })
      qt.insert({ x: 0, y: 0 })
      expect(qt.depth).toBeGreaterThan(0)
      expect(qt.size).toBe(5)
    })

    it('should respect maxDepth limit', () => {
      const qt = new QuadTree(defaultBounds, 1, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i, y: i })
      }
      expect(qt.depth).toBeLessThanOrEqual(2)
    })
  })

  describe('edge cases', () => {
    it('should handle point at (0, 0)', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.insert({ x: 0, y: 0 })).toBe(true)
      expect(qt.contains({ x: 0, y: 0 })).toBe(true)
    })

    it('should handle point at near boundary (99.99, 99.99)', () => {
      const qt = new QuadTree(defaultBounds)
      expect(qt.insert({ x: 99.99, y: 99.99 })).toBe(true)
    })

    it('should handle many duplicate inserts', () => {
      const qt = new QuadTree(defaultBounds)
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: 50, y: 50 })
      }
      expect(qt.size).toBe(50)
    })

    it('should handle insert after remove', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      qt.remove({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 50 })
      expect(qt.size).toBe(1)
      expect(qt.contains({ x: 50, y: 50 })).toBe(true)
    })

    it('should handle multiple clears', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      qt.clear()
      qt.clear()
      qt.clear()
      expect(qt.size).toBe(0)
    })

    it('should handle queryRange with zero-size rectangle', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRange({ x: 50, y: 50, width: 0, height: 0 })
      expect(result).toHaveLength(0)
    })

    it('should handle queryRadius with very small radius', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRadius({ x: 50, y: 50 }, 0.001)
      expect(result).toHaveLength(1)
    })

    it('should handle alternating insert and remove', () => {
      const qt = new QuadTree(defaultBounds)
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: i * 10, y: i * 10 })
        qt.remove({ x: i * 10, y: i * 10 })
      }
      expect(qt.size).toBe(0)
    })
  })

  describe('large dataset', () => {
    it('should handle 1000 points', () => {
      const qt = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 })
      for (let i = 0; i < 1000; i++) {
        qt.insert({ x: i, y: i })
      }
      expect(qt.size).toBe(1000)
      expect(qt.toArray()).toHaveLength(1000)
    })

    it('should handle 1000 points with small capacity', () => {
      const qt = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 1)
      for (let i = 0; i < 1000; i++) {
        qt.insert({ x: i, y: i })
      }
      expect(qt.size).toBe(1000)
    })

    it('should query 1000 points efficiently', () => {
      const qt = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 })
      for (let i = 0; i < 1000; i++) {
        qt.insert({ x: i, y: i })
      }
      const result = qt.queryRange({ x: 0, y: 0, width: 100, height: 100 })
      expect(result.length).toBeGreaterThan(0)
      for (const p of result) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(100)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeLessThan(100)
      }
    })

    it('should find nearest in 1000 points', () => {
      const qt = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 })
      for (let i = 0; i < 1000; i++) {
        qt.insert({ x: i, y: i })
      }
      const nn = qt.nearestNeighbor({ x: 500, y: 500 })
      expect(nn).toBeDefined()
      expect(nn!.x).toBe(500)
      expect(nn!.y).toBe(500)
    })

    it('should handle clustered points', () => {
      const qt = new QuadTree(defaultBounds, 2)
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: 49 + Math.random() * 2, y: 49 + Math.random() * 2 })
      }
      expect(qt.size).toBe(50)
      const result = qt.queryRadius({ x: 50, y: 50 }, 5)
      expect(result.length).toBe(50)
    })

    it('should handle removal from large dataset', () => {
      const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i })
      }
      for (let i = 0; i < 50; i++) {
        qt.remove({ x: i * 2, y: i * 2 })
      }
      expect(qt.size).toBe(50)
    })
  })

  describe('type exports', () => {
    it('should export Point type', () => {
      const p: Point = { x: 1, y: 2 }
      expect(p.x).toBe(1)
      expect(p.y).toBe(2)
    })

    it('should export Rectangle type', () => {
      const r: Rectangle = { x: 0, y: 0, width: 100, height: 100 }
      expect(r.width).toBe(100)
    })
  })

  describe('queryRange overlapping', () => {
    it('should find points on overlapping boundaries', () => {
      const qt = new QuadTree(defaultBounds, 1)
      qt.insert({ x: 49, y: 49 })
      qt.insert({ x: 51, y: 49 })
      qt.insert({ x: 49, y: 51 })
      qt.insert({ x: 51, y: 51 })
      const nw = qt.queryRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(nw).toContainEqual({ x: 49, y: 49 })
      expect(nw.filter((p) => p.x === 51)).toHaveLength(0)
    })

    it('should find points across quadrant boundary', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 49, y: 49 })
      qt.insert({ x: 51, y: 51 })
      const result = qt.queryRange({ x: 40, y: 40, width: 20, height: 20 })
      expect(result).toHaveLength(2)
    })

    it('should find duplicate points in range', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRange({ x: 0, y: 0, width: 100, height: 100 })
      expect(result).toHaveLength(2)
    })
  })

  describe('nearestNeighbor edge cases', () => {
    it('should handle equidistant points', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 40, y: 50 })
      qt.insert({ x: 60, y: 50 })
      const nn = qt.nearestNeighbor({ x: 50, y: 50 })
      expect(nn).toBeDefined()
      expect(nn!.y).toBe(50)
    })

    it('should work with query point outside bounds', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 99, y: 99 })
      const nn = qt.nearestNeighbor({ x: 150, y: 150 })
      expect(nn).toEqual({ x: 99, y: 99 })
    })

    it('should handle all same points', () => {
      const qt = new QuadTree(defaultBounds)
      for (let i = 0; i < 5; i++) {
        qt.insert({ x: 50, y: 50 })
      }
      const nn = qt.nearestNeighbor({ x: 50, y: 50 })
      expect(nn).toEqual({ x: 50, y: 50 })
    })
  })

  describe('queryRadius edge cases', () => {
    it('should find points at center of subdivided tree', () => {
      const qt = new QuadTree(defaultBounds, 1)
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: i * 10, y: i * 10 })
      }
      const result = qt.queryRadius({ x: 50, y: 50 }, 20)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle negative radius gracefully', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRadius({ x: 50, y: 50 }, -5)
      expect(result).toHaveLength(0)
    })
  })

  describe('queryRange edge cases', () => {
    it('should handle range extending beyond bounds', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRange({ x: -50, y: -50, width: 200, height: 200 })
      expect(result).toHaveLength(1)
    })

    it('should handle very small range', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRange({ x: 49.999, y: 49.999, width: 0.002, height: 0.002 })
      expect(result).toHaveLength(1)
    })

    it('should handle range covering single point', () => {
      const qt = new QuadTree(defaultBounds)
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRange({ x: 50, y: 50, width: 1, height: 1 })
      expect(result).toHaveLength(1)
    })
  })
})
