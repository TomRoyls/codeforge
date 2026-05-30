import { describe, it, expect } from 'vitest'
import { QuadTree } from '../src/utils/quad-tree.js'
import type { Point, Bounds } from '../src/utils/quad-tree.js'

const BOUNDS: Bounds = { x: 0, y: 0, width: 100, height: 100 }

describe('QuadTree', () => {
  describe('constructor', () => {
    it('creates empty quad tree', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.size).toBe(0)
      expect(qt.isEmpty()).toBe(true)
      expect(qt.depth).toBe(0)
    })
  })

  describe('insert', () => {
    it('inserts a point', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.insert({ x: 50, y: 50 })).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('rejects point outside bounds', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.insert({ x: 200, y: 200 })).toBe(false)
      expect(qt.size).toBe(0)
    })

    it('inserts multiple points', () => {
      const qt = new QuadTree(BOUNDS)
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: i * 10, y: i * 10 })
      }
      expect(qt.size).toBe(10)
    })

    it('subdivides when capacity exceeded', () => {
      const qt = new QuadTree(BOUNDS, 4)
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: i * 5, y: i * 5 })
      }
      expect(qt.depth).toBeGreaterThan(0)
    })

    it('inserts point with data', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 50, y: 50, data: 'hello' })
      expect(qt.size).toBe(1)
    })
  })

  describe('contains', () => {
    it('finds inserted point', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 50, y: 50 })
      expect(qt.contains({ x: 50, y: 50 })).toBe(true)
    })

    it('does not find missing point', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.contains({ x: 50, y: 50 })).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes an inserted point', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 50, y: 50 })
      expect(qt.remove({ x: 50, y: 50 })).toBe(true)
      expect(qt.size).toBe(0)
      expect(qt.contains({ x: 50, y: 50 })).toBe(false)
    })

    it('returns false for missing point', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.remove({ x: 50, y: 50 })).toBe(false)
    })
  })

  describe('queryRange', () => {
    it('returns points in range', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 90, y: 90 })

      const result = qt.queryRange({ x: 0, y: 0, width: 30, height: 30 })
      expect(result).toHaveLength(1)
      expect(result[0]!.x).toBe(10)
    })

    it('returns empty for range with no points', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 90, y: 90 })
      expect(qt.queryRange({ x: 0, y: 0, width: 10, height: 10 })).toEqual([])
    })

    it('returns all points for full bounds', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 90, y: 90 })
      expect(qt.queryRange(BOUNDS)).toHaveLength(3)
    })
  })

  describe('queryRadius', () => {
    it('returns points within radius', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 55, y: 55 })
      qt.insert({ x: 90, y: 90 })

      const result = qt.queryRadius({ x: 50, y: 50 }, 10)
      expect(result).toHaveLength(2)
    })

    it('returns empty when nothing in radius', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 90, y: 90 })
      expect(qt.queryRadius({ x: 10, y: 10 }, 5)).toEqual([])
    })
  })

  describe('clear', () => {
    it('clears all points', () => {
      const qt = new QuadTree(BOUNDS)
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 25, y: 25 })
      qt.clear()
      expect(qt.isEmpty()).toBe(true)
      expect(qt.size).toBe(0)
      expect(qt.depth).toBe(0)
    })
  })

  describe('boundary points', () => {
    it('inserts point at origin', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.insert({ x: 0, y: 0 })).toBe(true)
    })

    it('inserts point near max bounds', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.insert({ x: 99.9, y: 99.9 })).toBe(true)
    })

    it('rejects point at exact max bounds', () => {
      const qt = new QuadTree(BOUNDS)
      expect(qt.insert({ x: 100, y: 100 })).toBe(false)
    })
  })

  describe('many points', () => {
    it('handles 100 points', () => {
      const qt = new QuadTree(BOUNDS, 4)
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: (i * 37) % 100, y: (i * 53) % 100 })
      }
      expect(qt.size).toBe(100)
      expect(qt.depth).toBeGreaterThan(0)
    })
  })
})
