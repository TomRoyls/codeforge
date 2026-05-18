import { describe, it, expect } from 'vitest'
import { QuadTree } from '../src/core/quad-tree-2/index.js'

describe('QuadTree', () => {
  const boundary = { x: 0, y: 0, width: 100, height: 100 }

  // ─── Construction & Insert ───
  describe('construction and insert', () => {
    it('creates tree with boundary', () => {
      const qt = new QuadTree(boundary)
      expect(qt.size).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('inserts points', () => {
      const qt = new QuadTree(boundary)
      expect(qt.insert({ x: 10, y: 10 })).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('inserts multiple points causing subdivision', () => {
      const qt = new QuadTree(boundary, { capacity: 2 })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 80, y: 80 })
      expect(qt.size).toBe(3)
    })

    it('from creates tree from array', () => {
      const qt = QuadTree.from([{ x: 5, y: 5 }, { x: 50, y: 50 }], boundary)
      expect(qt.size).toBe(2)
    })
  })

  // ─── Query & Search ───
  describe('query and search', () => {
    it('queryRange returns points in rect', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 90, y: 90 })
      const result = qt.queryRange({ x: 0, y: 0, width: 20, height: 20 })
      expect(result).toHaveLength(1)
      expect(result[0]!.x).toBe(5)
    })

    it('contains checks point existence', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 5, y: 5 })
      expect(qt.contains({ x: 5, y: 5 })).toBe(true)
      expect(qt.contains({ x: 99, y: 99 })).toBe(false)
    })

    it('nearest returns closest point', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 90, y: 90 })
      const n = qt.nearest({ x: 2, y: 2 })
      expect(n).toBeDefined()
      expect(n!.x).toBe(1)
    })

    it('nearest returns undefined for empty tree', () => {
      const qt = new QuadTree(boundary)
      expect(qt.nearest({ x: 0, y: 0 })).toBeUndefined()
    })

    it('kNearest returns k closest', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 1, y: 0 })
      qt.insert({ x: 5, y: 0 })
      qt.insert({ x: 10, y: 0 })
      const result = qt.kNearest({ x: 0, y: 0 }, 2)
      expect(result).toHaveLength(2)
      expect(result[0]!.x).toBe(1)
    })

    it('kNearest returns empty for k <= 0', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 5, y: 5 })
      expect(qt.kNearest({ x: 0, y: 0 }, 0)).toEqual([])
    })
  })

  // ─── Remove ───
  describe('remove', () => {
    it('removes existing point', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 5, y: 5 })
      expect(qt.remove({ x: 5, y: 5 })).toBe(true)
      expect(qt.size).toBe(0)
    })

    it('returns false for non-existing point', () => {
      const qt = new QuadTree(boundary)
      expect(qt.remove({ x: 5, y: 5 })).toBe(false)
    })
  })

  // ─── Utilities ───
  describe('utilities', () => {
    it('clear removes all points', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 5, y: 5 })
      qt.clear()
      expect(qt.size).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('toArray returns all points', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 10, y: 10 })
      expect(qt.toArray()).toHaveLength(2)
    })

    it('forEach iterates all points', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 5, y: 5 })
      const pts: unknown[] = []
      qt.forEach((p) => pts.push(p))
      expect(pts).toHaveLength(1)
    })

    it('boundary returns tree boundary', () => {
      const qt = new QuadTree(boundary)
      expect(qt.boundary).toEqual(boundary)
    })

    it('allPoints returns all points', () => {
      const qt = new QuadTree(boundary)
      qt.insert({ x: 1, y: 1 })
      expect(qt.allPoints).toHaveLength(1)
    })
  })
})
