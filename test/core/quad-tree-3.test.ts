import { describe, it, expect } from 'vitest'
import { QuadTree } from '../../src/core/quad-tree-3/index.js'
import type { Boundary, Point } from '../../src/core/quad-tree-3/index.js'

describe('QuadTree', () => {
  // ─── Constructor ───
  it('creates a quad tree with boundary', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(qt.boundary).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(qt.points).toEqual([])
    expect(qt.divided).toBe(false)
    expect(qt.capacity).toBe(4)
  })

  it('creates with custom capacity', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 2)
    expect(qt.capacity).toBe(2)
  })

  // ─── insert ───
  it('inserts points within boundary', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(qt.insert({ x: 50, y: 50 })).toBe(true)
    expect(qt.points.length).toBe(1)
  })

  it('rejects points outside boundary', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(qt.insert({ x: 200, y: 200 })).toBe(false)
    expect(qt.points.length).toBe(0)
  })

  it('subdivides when capacity exceeded', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 2)
    qt.insert({ x: 10, y: 10 })
    qt.insert({ x: 20, y: 20 })
    expect(qt.divided).toBe(false)
    qt.insert({ x: 30, y: 30 })
    expect(qt.divided).toBe(true)
    expect(qt.northeast).not.toBeNull()
    expect(qt.northwest).not.toBeNull()
    expect(qt.southeast).not.toBeNull()
    expect(qt.southwest).not.toBeNull()
  })

  it('inserts into subdivisions after split', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 1)
    qt.insert({ x: 10, y: 10 })
    qt.insert({ x: 60, y: 10 })
    expect(qt.getSize()).toBe(2)
  })

  // ─── contains ───
  it('contains checks boundary inclusive', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(qt.contains({ x: 0, y: 0 })).toBe(true)
    expect(qt.contains({ x: 100, y: 100 })).toBe(true)
    expect(qt.contains({ x: 50, y: 50 })).toBe(true)
    expect(qt.contains({ x: 101, y: 50 })).toBe(false)
  })

  // ─── intersects ───
  it('detects intersecting ranges', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(qt.intersects({ x: 50, y: 50, width: 20, height: 20 })).toBe(true)
    expect(qt.intersects({ x: 100, y: 100, width: 10, height: 10 })).toBe(true)
  })

  it('detects non-intersecting ranges', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(qt.intersects({ x: 200, y: 200, width: 10, height: 10 })).toBe(false)
  })

  // ─── queryRange ───
  it('finds points in range', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    qt.insert({ x: 10, y: 10 })
    qt.insert({ x: 50, y: 50 })
    qt.insert({ x: 90, y: 90 })
    const found = qt.queryRange({ x: 0, y: 0, width: 30, height: 30 })
    expect(found.length).toBe(1)
    expect(found[0]).toEqual({ x: 10, y: 10 })
  })

  it('returns empty for non-intersecting range', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    qt.insert({ x: 10, y: 10 })
    const found = qt.queryRange({ x: 200, y: 200, width: 10, height: 10 })
    expect(found).toEqual([])
  })

  it('queries across subdivisions', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 1)
    qt.insert({ x: 10, y: 10 })
    qt.insert({ x: 60, y: 10 })
    qt.insert({ x: 10, y: 60 })
    qt.insert({ x: 60, y: 60 })
    const found = qt.queryRange({ x: 0, y: 0, width: 100, height: 100 })
    expect(found.length).toBe(4)
  })

  // ─── getSize ───
  it('counts all points including subdivisions', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 1)
    qt.insert({ x: 10, y: 10 })
    qt.insert({ x: 60, y: 10 })
    qt.insert({ x: 10, y: 60 })
    qt.insert({ x: 60, y: 60 })
    qt.insert({ x: 50, y: 50 })
    expect(qt.getSize()).toBe(5)
  })

  // ─── getAllPoints ───
  it('gets all points from tree', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 1)
    qt.insert({ x: 10, y: 10 })
    qt.insert({ x: 60, y: 10 })
    qt.insert({ x: 10, y: 60 })
    const all = qt.getAllPoints()
    expect(all.length).toBe(3)
  })

  // ─── clear ───
  it('clears the tree', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 1)
    qt.insert({ x: 10, y: 10 })
    qt.insert({ x: 60, y: 60 })
    qt.clear()
    expect(qt.points).toEqual([])
    expect(qt.divided).toBe(false)
    expect(qt.northeast).toBeNull()
    expect(qt.getSize()).toBe(0)
  })

  // ─── getTimeComplexity ───
  it('returns time complexity string', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    expect(typeof qt.getTimeComplexity()).toBe('string')
    expect(qt.getTimeComplexity()).toContain('O(')
  })

  // ─── subdivide ───
  it('creates four quadrants on subdivide', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    qt.subdivide()
    expect(qt.northeast!.boundary).toEqual({ x: 50, y: 0, width: 50, height: 50 })
    expect(qt.northwest!.boundary).toEqual({ x: 0, y: 0, width: 50, height: 50 })
    expect(qt.southeast!.boundary).toEqual({ x: 50, y: 50, width: 50, height: 50 })
    expect(qt.southwest!.boundary).toEqual({ x: 0, y: 50, width: 50, height: 50 })
  })

  // ─── Edge cases ───
  it('handles single point', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 })
    qt.insert({ x: 50, y: 50 })
    expect(qt.getSize()).toBe(1)
    expect(qt.queryRange({ x: 0, y: 0, width: 100, height: 100 })).toEqual([{ x: 50, y: 50 }])
  })

  it('handles many points in same quadrant', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 2)
    qt.insert({ x: 1, y: 1 })
    qt.insert({ x: 2, y: 2 })
    qt.insert({ x: 3, y: 3 })
    qt.insert({ x: 4, y: 4 })
    expect(qt.getSize()).toBe(4)
  })
})
