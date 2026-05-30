import { describe, it, expect } from 'vitest'
import { Quadtree, QuadPoint } from '../../../src/utils/quadtree.js'

describe('Quadtree', () => {
  describe('construction', () => {
    it('creates empty quadtree', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 })
      expect(qt.size).toBe(0)
    })

    it('creates with custom capacity', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 }, 8)
      expect(qt.size).toBe(0)
    })
  })

  describe('insert', () => {
    it('inserts a point', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 })
      expect(qt.insert({ x: 50, y: 50, data: 'center' })).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('rejects point outside boundary', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 })
      expect(qt.insert({ x: 200, y: 200, data: 'outside' })).toBe(false)
      expect(qt.size).toBe(0)
    })

    it('inserts multiple points', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 })
      qt.insert({ x: 10, y: 10, data: 'a' })
      qt.insert({ x: 90, y: 90, data: 'b' })
      qt.insert({ x: 50, y: 50, data: 'c' })
      expect(qt.size).toBe(3)
    })

    it('subdivides when capacity exceeded', () => {
      const qt = new Quadtree<number>({ x: 0, y: 0, w: 100, h: 100 }, 4)
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: i * 10 + 1, y: i * 10 + 1, data: i })
      }
      expect(qt.size).toBe(10)
      expect(qt.depth).toBeGreaterThan(1)
    })
  })

  describe('query', () => {
    it('finds points in range', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 })
      qt.insert({ x: 10, y: 10, data: 'a' })
      qt.insert({ x: 50, y: 50, data: 'b' })
      qt.insert({ x: 90, y: 90, data: 'c' })
      const found = qt.query({ x: 0, y: 0, w: 30, h: 30 })
      expect(found.length).toBe(1)
      expect(found[0]!.data).toBe('a')
    })

    it('returns empty for no matches', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 })
      qt.insert({ x: 90, y: 90, data: 'far' })
      const found = qt.query({ x: 0, y: 0, w: 10, h: 10 })
      expect(found).toEqual([])
    })

    it('queries across subdivisions', () => {
      const qt = new Quadtree<number>({ x: 0, y: 0, w: 100, h: 100 }, 2)
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          qt.insert({ x: x * 10 + 5, y: y * 10 + 5, data: x * 10 + y })
        }
      }
      const found = qt.query({ x: 0, y: 0, w: 25, h: 25 })
      expect(found.length).toBe(4)
    })
  })

  describe('findAll', () => {
    it('returns all points', () => {
      const qt = new Quadtree<number>({ x: 0, y: 0, w: 100, h: 100 }, 2)
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: i * 5, y: i * 5, data: i })
      }
      expect(qt.findAll().length).toBe(20)
    })
  })

  describe('depth', () => {
    it('returns 1 for undivided', () => {
      const qt = new Quadtree<number>({ x: 0, y: 0, w: 100, h: 100 })
      qt.insert({ x: 50, y: 50, data: 1 })
      expect(qt.depth).toBe(1)
    })

    it('increases with subdivision', () => {
      const qt = new Quadtree<number>({ x: 0, y: 0, w: 100, h: 100 }, 1)
      qt.insert({ x: 10, y: 10, data: 1 })
      qt.insert({ x: 90, y: 90, data: 2 })
      expect(qt.depth).toBeGreaterThan(1)
    })
  })

  describe('spatial queries', () => {
    it('finds nearby points for collision detection', () => {
      const qt = new Quadtree<string>({ x: 0, y: 0, w: 1000, h: 1000 }, 4)
      qt.insert({ x: 100, y: 100, data: 'player' })
      qt.insert({ x: 105, y: 105, data: 'enemy1' })
      qt.insert({ x: 500, y: 500, data: 'enemy2' })
      const nearby = qt.query({ x: 90, y: 90, w: 30, h: 30 })
      expect(nearby.length).toBe(2)
    })
  })
})
