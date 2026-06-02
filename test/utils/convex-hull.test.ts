import { describe, it, expect } from 'vitest'
import { convexHull, polygonArea, polygonPerimeter, pointInConvexPolygon } from '../../src/utils/convex-hull.js'

describe('convexHull', () => {
  it('handles empty input', () => {
    expect(convexHull([])).toEqual([])
  })

  it('handles single point', () => {
    expect(convexHull([{ x: 1, y: 2 }])).toEqual([{ x: 1, y: 2 }])
  })

  it('handles two points', () => {
    const result = convexHull([{ x: 0, y: 0 }, { x: 1, y: 1 }])
    expect(result.length).toBe(2)
  })

  it('computes square hull', () => {
    const points = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
      { x: 2, y: 2 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('computes triangle hull', () => {
    const points = [
      { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 4 },
      { x: 2, y: 1 }, { x: 1, y: 1 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('handles collinear points', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('handles all same points', () => {
    const points = [
      { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBeGreaterThanOrEqual(1)
    expect(hull.every((p) => p.x === 1 && p.y === 1)).toBe(true)
  })

  it('does not modify input', () => {
    const points = [{ x: 3, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }]
    const copy = points.map((p) => ({ ...p }))
    convexHull(points)
    expect(points).toEqual(copy)
  })
})

describe('polygonArea', () => {
  it('returns 0 for less than 3 points', () => {
    expect(polygonArea([])).toBe(0)
    expect(polygonArea([{ x: 0, y: 0 }])).toBe(0)
    expect(polygonArea([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(0)
  })

  it('computes unit square area', () => {
    const square = [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 1, y: 1 }, { x: 0, y: 1 },
    ]
    expect(polygonArea(square)).toBe(1)
  })

  it('computes triangle area', () => {
    const tri = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }]
    expect(polygonArea(tri)).toBe(6)
  })
})

describe('polygonPerimeter', () => {
  it('returns 0 for less than 2 points', () => {
    expect(polygonPerimeter([])).toBe(0)
    expect(polygonPerimeter([{ x: 0, y: 0 }])).toBe(0)
  })

  it('computes unit square perimeter', () => {
    const square = [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 1, y: 1 }, { x: 0, y: 1 },
    ]
    expect(polygonPerimeter(square)).toBeCloseTo(4, 5)
  })
})

describe('pointInConvexPolygon', () => {
  it('returns false for less than 3 vertices', () => {
    expect(pointInConvexPolygon({ x: 0, y: 0 }, [])).toBe(false)
    expect(pointInConvexPolygon({ x: 0, y: 0 }, [{ x: 0, y: 0 }])).toBe(false)
  })

  it('detects interior point', () => {
    const square = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
    ]
    expect(pointInConvexPolygon({ x: 2, y: 2 }, square)).toBe(true)
  })

  it('detects exterior point', () => {
    const square = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
    ]
    expect(pointInConvexPolygon({ x: 5, y: 5 }, square)).toBe(false)
  })

  it('detects point outside triangle', () => {
    const tri = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 4 }]
    expect(pointInConvexPolygon({ x: 0, y: 5 }, tri)).toBe(false)
  })

  it('detects point inside triangle', () => {
    const tri = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 4 }]
    expect(pointInConvexPolygon({ x: 2, y: 1 }, tri)).toBe(true)
  })

  it('point outside triangle', () => {
    const tri = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 4 }]
    expect(pointInConvexPolygon({ x: 10, y: 10 }, tri)).toBe(false)
  })
})
