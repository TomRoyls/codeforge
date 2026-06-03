import { describe, it, expect } from 'vitest'
import { Quadtree } from '../../src/utils/quadtree.js'

describe('Quadtree', () => {
  it('inserts a point within bounds', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    expect(qt.insert({ x: 50, y: 50, data: 'center' })).toBe(true)
    expect(qt.size).toBe(1)
  })

  it('rejects point outside bounds', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    expect(qt.insert({ x: 150, y: 150, data: 'outside' })).toBe(false)
    expect(qt.size).toBe(0)
  })

  it('inserts up to capacity without subdividing', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 }, 4)
    qt.insert({ x: 10, y: 10, data: 1 })
    qt.insert({ x: 20, y: 20, data: 2 })
    qt.insert({ x: 30, y: 30, data: 3 })
    qt.insert({ x: 40, y: 40, data: 4 })
    expect(qt.size).toBe(4)
    expect(qt.depth).toBe(1)
  })

  it('subdivides when capacity exceeded', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 }, 2)
    qt.insert({ x: 10, y: 10, data: 1 })
    qt.insert({ x: 20, y: 20, data: 2 })
    qt.insert({ x: 80, y: 80, data: 3 })
    expect(qt.size).toBe(3)
    expect(qt.depth).toBeGreaterThan(1)
  })

  it('queries points within a range', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    qt.insert({ x: 10, y: 10, data: 'a' })
    qt.insert({ x: 50, y: 50, data: 'b' })
    qt.insert({ x: 90, y: 90, data: 'c' })
    const results = qt.query({ x: 0, y: 0, w: 30, h: 30 })
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('a')
  })

  it('returns all points with findAll', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    qt.insert({ x: 10, y: 10, data: 1 })
    qt.insert({ x: 50, y: 50, data: 2 })
    qt.insert({ x: 90, y: 90, data: 3 })
    expect(qt.findAll().length).toBe(3)
  })

  it('returns empty for non-overlapping query', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    qt.insert({ x: 50, y: 50, data: 'center' })
    const results = qt.query({ x: 200, y: 200, w: 10, h: 10 })
    expect(results.length).toBe(0)
  })

  it('handles many insertions', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 1000, h: 1000 }, 4)
    for (let i = 0; i < 100; i++) {
      qt.insert({ x: i * 10, y: i * 10, data: i })
    }
    expect(qt.size).toBe(100)
  })

  it('queries all points after many insertions', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 1000, h: 1000 }, 4)
    for (let i = 0; i < 50; i++) {
      qt.insert({ x: i * 20, y: i * 20, data: i })
    }
    expect(qt.findAll().length).toBe(50)
  })

  it('handles points on boundary edges', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    expect(qt.insert({ x: 0, y: 0, data: 'origin' })).toBe(true)
    expect(qt.insert({ x: 99, y: 99, data: 'edge' })).toBe(true)
    expect(qt.size).toBe(2)
  })

  it('rejects point exactly on right/bottom boundary', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    expect(qt.insert({ x: 100, y: 50, data: 'right-edge' })).toBe(false)
    expect(qt.insert({ x: 50, y: 100, data: 'bottom-edge' })).toBe(false)
  })

  it('tracks depth correctly', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 }, 1)
    qt.insert({ x: 10, y: 10, data: 1 })
    expect(qt.depth).toBe(1)
    qt.insert({ x: 90, y: 90, data: 2 })
    expect(qt.depth).toBe(2)
  })

  it('preserves data in query results', () => {
    const qt = new Quadtree<string>({ x: 0, y: 0, w: 100, h: 100 })
    qt.insert({ x: 25, y: 25, data: 'hello' })
    const results = qt.query({ x: 0, y: 0, w: 50, h: 50 })
    expect(results[0]!.data).toBe('hello')
  })

  it('query with overlapping but non-contained points', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    qt.insert({ x: 5, y: 5, data: 'inner' })
    qt.insert({ x: 95, y: 95, data: 'far' })
    const results = qt.query({ x: 0, y: 0, w: 10, h: 10 })
    expect(results.length).toBe(1)
    expect(results[0]!.data).toBe('inner')
  })

  it('inserts at exact top-left corner', () => {
    const qt = new Quadtree({ x: -50, y: -50, w: 100, h: 100 })
    expect(qt.insert({ x: -50, y: -50, data: 'corner' })).toBe(true)
    expect(qt.size).toBe(1)
  })

  it('query empty quadtree returns empty array', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    expect(qt.query({ x: 0, y: 0, w: 50, h: 50 })).toEqual([])
  })

  it('handles many inserts', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    for (let i = 0; i < 100; i++) {
      qt.insert({ x: i % 100, y: Math.floor(i / 100) * 10, data: i })
    }
    expect(qt.size).toBe(100)
  })

  it('query empty region returns empty', () => {
    const qt = new Quadtree<number>({ x: 0, y: 0, width: 100, height: 100 })
    qt.insert({ x: 50, y: 50, data: 1 })
    const results = qt.query({ x: 0, y: 0, width: 10, height: 10 })
    expect(results.length).toBe(0)
  })

  it('query finds inserted point in range', () => {
    const qt = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    qt.insert({ x: 50, y: 50, data: 'test' })
    const results = qt.query({ x: 0, y: 0, w: 100, h: 100 })
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('query outside bounds returns empty', () => {
    const qt = new Quadtree<string>(0, 0, 100, 100)
    qt.insert({ x: 50, y: 50, data: 'test' })
    const results = qt.query({ x: 200, y: 200, w: 50, h: 50 })
    expect(results.length).toBe(0)
  })

  it('insert and query single point', () => {
    const q = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    q.insert({ x: 50, y: 50, data: 'pt' })
    const results = q.query({ x: 0, y: 0, w: 100, h: 100 })
    expect(results.length).toBe(1)
  })

  it('query outside bounds returns empty', () => {
    const q = new Quadtree({ x: 0, y: 0, w: 100, h: 100 })
    q.insert({ x: 50, y: 50, data: 'pt' })
    const results = q.query({ x: 200, y: 200, w: 10, h: 10 })
    expect(results.length).toBe(0)
  })
})
