import { describe, expect, it } from 'vitest'
import { Quickhull } from '../../src/utils/quickhull.js'

describe('Quickhull', () => {
  it('computes convex hull of triangle', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('handles square', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
    ]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles collinear points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('handles single point', () => {
    const hull = Quickhull.convexHull([{ x: 1, y: 1 }])
    expect(hull.length).toBe(1)
  })

  it('handles empty array', () => {
    expect(Quickhull.convexHull([])).toEqual([])
  })

  it('handles two points', () => {
    const hull = Quickhull.convexHull([{ x: 0, y: 0 }, { x: 1, y: 1 }])
    expect(hull.length).toBe(2)
  })

  it('computes hullArea correctly for unit square', () => {
    const hull = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
    expect(Quickhull.hullArea(hull)).toBeCloseTo(1, 6)
  })

  it('hullArea is 0 for less than 3 points', () => {
    expect(Quickhull.hullArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0)
  })

  it('isConvex returns true for convex hull', () => {
    const hull = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
    expect(Quickhull.isConvex(hull)).toBe(true)
  })

  it('isConvex returns false for non-convex', () => {
    const pts = [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    expect(Quickhull.isConvex(pts)).toBe(false)
  })

  it('isConvex returns false for less than 3 points', () => {
    expect(Quickhull.isConvex([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(false)
  })

  it('handles duplicate points', () => {
    const points = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeGreaterThanOrEqual(2)
  })

  it('computes hull of many random points', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 100; i++) {
      points.push({ x: Math.cos(i * 0.1) * 10 + Math.random(), y: Math.sin(i * 0.1) * 10 + Math.random() })
    }
    const hull = Quickhull.convexHull(points)
    expect(Quickhull.isConvex(hull)).toBe(true)
    expect(hull.length).toBeLessThan(points.length)
  })

  it('cross product computes correctly', () => {
    expect(Quickhull.cross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1)
    expect(Quickhull.cross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 })).toBe(0)
  })

  it('hull of collinear points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeGreaterThanOrEqual(2)
  })

  it('hull of triangle', () => {
    const points = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 3 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('handles collinear points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeGreaterThanOrEqual(2)
  })

  it('single point hull', () => {
    const points = [{ x: 0, y: 0 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeGreaterThanOrEqual(1)
  })

  it('three non-collinear points form triangle hull', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('collinear points return 2 endpoints', () => {
    const points = [{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }]
    const hull = Quickhull.convexHull(points)
    expect(hull.length).toBeGreaterThanOrEqual(2)
  })

  it('single point returns itself', () => {
    const hull = Quickhull.convexHull([{ x: 5, y: 5 }])
    expect(hull.length).toBe(1)
  })

  it('two points returns both', () => {
    const hull = Quickhull.convexHull([{ x: 0, y: 0 }, { x: 10, y: 0 }])
    expect(hull.length).toBe(2)
  })
})
