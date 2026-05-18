import { describe, it, expect } from 'vitest'
import { QuadTree2 } from '../src/core/quadtree-2/index.js'

describe('QuadTree2', () => {
  const opts = { bounds: { x: 0, y: 0, width: 100, height: 100 }, capacity: 2, maxDepth: 6 }

  // ─── Construction & Insert ───
  describe('construction and insert', () => {
    it('creates empty tree', () => {
      const qt = new QuadTree2(opts)
      expect(qt.size).toBe(0)
      expect(qt.isEmpty).toBe(true)
    })

    it('inserts points', () => {
      const qt = new QuadTree2<string>(opts)
      qt.insert({ x: 10, y: 10, data: 'a' })
      expect(qt.size).toBe(1)
    })

    it('inserts many points triggering subdivision', () => {
      const qt = new QuadTree2(opts)
      for (let i = 0; i < 10; i++) qt.insert({ x: i * 10, y: i * 10 })
      expect(qt.size).toBe(10)
    })

    it('fromArray creates tree from points', () => {
      const qt = QuadTree2.fromArray([{ x: 1, y: 2 }, { x: 3, y: 4 }], opts)
      expect(qt.size).toBe(2)
    })
  })

  // ─── Query Operations ───
  describe('query operations', () => {
    it('query returns points in rect', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 50, y: 50 })
      const result = qt.query({ x: 0, y: 0, width: 10, height: 10 })
      expect(result).toHaveLength(1)
    })

    it('queryRadius returns points in circle', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 50, y: 50 })
      const result = qt.queryRadius(5, 5, 10)
      expect(result).toHaveLength(1)
    })

    it('contains checks point existence', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 5, y: 5 })
      expect(qt.contains({ x: 5, y: 5 })).toBe(true)
      expect(qt.contains({ x: 99, y: 99 })).toBe(false)
    })

    it('nearest returns closest point', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 90, y: 90 })
      const n = qt.nearest({ x: 2, y: 2 })
      expect(n).toBeDefined()
      expect(n!.x).toBe(1)
    })

    it('queryNearest returns k closest', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 1, y: 0 })
      qt.insert({ x: 5, y: 0 })
      qt.insert({ x: 10, y: 0 })
      const result = qt.queryNearest({ x: 0, y: 0 }, 2)
      expect(result).toHaveLength(2)
    })

    it('within returns points within distance', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 90, y: 90 })
      expect(qt.within({ x: 5, y: 5 }, 10)).toHaveLength(1)
    })
  })

  // ─── Remove & Mutation ───
  describe('remove and mutation', () => {
    it('removes existing point', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 5, y: 5 })
      expect(qt.remove({ x: 5, y: 5 })).toBe(true)
      expect(qt.size).toBe(0)
    })

    it('returns false for non-existing point', () => {
      const qt = new QuadTree2(opts)
      expect(qt.remove({ x: 5, y: 5 })).toBe(false)
    })
  })

  // ─── Utilities ───
  describe('utilities', () => {
    it('clear removes all points', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 5, y: 5 })
      qt.clear()
      expect(qt.size).toBe(0)
    })

    it('toArray returns all points', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      expect(qt.toArray()).toHaveLength(2)
    })

    it('all returns all points', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 1, y: 1 })
      expect(qt.all()).toHaveLength(1)
    })

    it('clone produces independent copy', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 5, y: 5 })
      const c = qt.clone()
      expect(c.size).toBe(1)
      qt.clear()
      expect(c.size).toBe(1)
    })

    it('count returns size', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 1, y: 1 })
      expect(qt.count()).toBe(1)
    })

    it('bounds returns tree bounds', () => {
      const qt = new QuadTree2(opts)
      expect(qt.bounds).toEqual(opts.bounds)
    })

    it('is iterable', () => {
      const qt = new QuadTree2(opts)
      qt.insert({ x: 1, y: 1 })
      expect([...qt]).toHaveLength(1)
    })

    it('depth tracks tree depth', () => {
      const qt = new QuadTree2(opts)
      expect(qt.depth).toBe(0)
    })
  })
})
