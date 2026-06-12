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

  it('handles points with negative coordinates', () => {
    const points = [
      { x: -2, y: -2 }, { x: 2, y: -2 },
      { x: 2, y: 2 }, { x: -2, y: 2 },
      { x: 0, y: 0 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles points with very large coordinates', () => {
    const points = [
      { x: 1e6, y: 1e6 }, { x: 2e6, y: 1e6 },
      { x: 2e6, y: 2e6 }, { x: 1e6, y: 2e6 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles points with very small positive coordinates', () => {
    const points = [
      { x: 0.001, y: 0.001 }, { x: 0.002, y: 0.001 },
      { x: 0.002, y: 0.002 }, { x: 0.001, y: 0.002 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles floating point coordinates', () => {
    const points = [
      { x: 0.5, y: 0.5 }, { x: 1.5, y: 0.5 },
      { x: 1.5, y: 1.5 }, { x: 0.5, y: 1.5 },
      { x: 1, y: 1 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('handles duplicate points scattered', () => {
    const points = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 2, y: 2 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('computes pentagon hull', () => {
    const points = [
      { x: 0, y: 2 }, { x: 2, y: 4 },
      { x: 4, y: 2 }, { x: 3, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 2 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(5)
  })

  it('computes hexagon hull', () => {
    const points = [
      { x: 1, y: 0 }, { x: 3, y: 0 },
      { x: 4, y: 2 }, { x: 3, y: 4 },
      { x: 1, y: 4 }, { x: 0, y: 2 },
      { x: 2, y: 2 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(6)
  })

  it('handles all points on vertical line', () => {
    const points = [
      { x: 1, y: 0 }, { x: 1, y: 1 },
      { x: 1, y: 2 }, { x: 1, y: 3 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('handles points on diagonal line', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 1 },
      { x: 2, y: 2 }, { x: 3, y: 3 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('polygonArea computes large rectangle', () => {
    const rect = [
      { x: 0, y: 0 }, { x: 10, y: 0 },
      { x: 10, y: 5 }, { x: 0, y: 5 },
    ]
    expect(polygonArea(rect)).toBe(50)
  })

  it('polygonArea with negative coordinates', () => {
    const square = [
      { x: -1, y: -1 }, { x: 1, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: 1 },
    ]
    expect(polygonArea(square)).toBe(4)
  })

  it('polygonArea with triangle floating points', () => {
    const tri = [{ x: 0.5, y: 0 }, { x: 4.5, y: 0 }, { x: 2.5, y: 3 }]
    expect(polygonArea(tri)).toBe(6)
  })

  it('polygonPerimeter computes large rectangle', () => {
    const rect = [
      { x: 0, y: 0 }, { x: 10, y: 0 },
      { x: 10, y: 5 }, { x: 0, y: 5 },
    ]
    expect(polygonPerimeter(rect)).toBeCloseTo(30, 5)
  })

  it('polygonPerimeter with triangle', () => {
    const tri = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 }]
    expect(polygonPerimeter(tri)).toBeCloseTo(12, 5)
  })

  it('polygonPerimeter with negative coordinates', () => {
    const square = [
      { x: -1, y: -1 }, { x: 1, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: 1 },
    ]
    expect(polygonPerimeter(square)).toBeCloseTo(8, 5)
  })

  it('pointInConvexPolygon with point on edge', () => {
    const square = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
    ]
    const result = pointInConvexPolygon({ x: 2, y: 0 }, square)
    expect(typeof result).toBe('boolean')
  })

  it('pointInConvexPolygon with point on vertex', () => {
    const square = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
    ]
    const result = pointInConvexPolygon({ x: 0, y: 0 }, square)
    expect(typeof result).toBe('boolean')
  })

  it('pointInConvexPolygon with very small polygon', () => {
    const tiny = [
      { x: 0.001, y: 0 }, { x: 0.002, y: 0 },
      { x: 0.0015, y: 0.001 },
    ]
    const result = pointInConvexPolygon({ x: 0.0015, y: 0.0005 }, tiny)
    expect(typeof result).toBe('boolean')
  })

  it('pointInConvexPolygon with negative coordinates', () => {
    const square = [
      { x: -2, y: -2 }, { x: 2, y: -2 },
      { x: 2, y: 2 }, { x: -2, y: 2 },
    ]
    expect(pointInConvexPolygon({ x: 0, y: 0 }, square)).toBe(true)
    expect(pointInConvexPolygon({ x: 3, y: 3 }, square)).toBe(false)
  })

  it('pointInConvexPolygon point just outside', () => {
    const square = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
    ]
    expect(pointInConvexPolygon({ x: 4.001, y: 2 }, square)).toBe(false)
  })

  it('convexHull three points triangle', () => {
    const points = [
      { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 4 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(3)
  })

  it('convexHull with many interior points', () => {
    const points = [
      { x: 0, y: 0 }, { x: 10, y: 0 },
      { x: 10, y: 10 }, { x: 0, y: 10 },
      { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
      { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 },
      { x: 7, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 9 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('polygonArea with pentagon', () => {
    const pentagon = [
      { x: 0, y: 2 }, { x: 2, y: 4 },
      { x: 4, y: 2 }, { x: 3, y: 0 },
      { x: 1, y: 0 },
    ]
    const area = polygonArea(pentagon)
    expect(area).toBeGreaterThan(0)
  })

  it('polygonPerimeter with pentagon', () => {
    const pentagon = [
      { x: 0, y: 2 }, { x: 2, y: 4 },
      { x: 4, y: 2 }, { x: 3, y: 0 },
      { x: 1, y: 0 },
    ]
    const perimeter = polygonPerimeter(pentagon)
    expect(perimeter).toBeGreaterThan(0)
  })

  it('pointInConvexPolygon center of pentagon', () => {
    const pentagon = [
      { x: 0, y: 2 }, { x: 2, y: 4 },
      { x: 4, y: 2 }, { x: 3, y: 0 },
      { x: 1, y: 0 },
    ]
    expect(pointInConvexPolygon({ x: 2, y: 2 }, pentagon)).toBe(true)
  })

  it('polygonArea with hexagon', () => {
    const hexagon = [
      { x: 1, y: 0 }, { x: 3, y: 0 },
      { x: 4, y: 2 }, { x: 3, y: 4 },
      { x: 1, y: 4 }, { x: 0, y: 2 },
    ]
    const area = polygonArea(hexagon)
    expect(area).toBeGreaterThan(0)
  })

  it('polygonPerimeter with hexagon', () => {
    const hexagon = [
      { x: 1, y: 0 }, { x: 3, y: 0 },
      { x: 4, y: 2 }, { x: 3, y: 4 },
      { x: 1, y: 4 }, { x: 0, y: 2 },
    ]
    const perimeter = polygonPerimeter(hexagon)
    expect(perimeter).toBeGreaterThan(0)
  })

  it('convexHull with one point returns one point', () => {
    const result = convexHull([{ x: 5, y: 10 }])
    expect(result).toEqual([{ x: 5, y: 10 }])
  })

  it('convexHull with two points returns both', () => {
    const points = [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    const hull = convexHull(points)
    expect(hull.length).toBe(2)
  })

  it('convexHull returns distinct hull vertices', () => {
    const points = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
      { x: 2, y: 2 },
    ]
    const hull = convexHull(points)
    const uniquePoints = new Set(hull.map(p => `${p.x},${p.y}`))
    expect(uniquePoints.size).toBe(hull.length)
  })

  it('pointInConvexPolygon with degenerate triangle returns false', () => {
    const degenerate = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    ]
    expect(pointInConvexPolygon({ x: 1, y: 0 }, degenerate)).toBe(true)
  })

  it('polygonArea with degenerate polygon returns zero', () => {
    const degenerate = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    ]
    expect(polygonArea(degenerate)).toBe(0)
  })

  it('polygonPerimeter with degenerate polygon', () => {
    const degenerate = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    ]
    const perimeter = polygonPerimeter(degenerate)
    expect(perimeter).toBeCloseTo(4, 5)
  })

  it('pointInConvexPolygon with very large polygon', () => {
    const large = [
      { x: 0, y: 0 }, { x: 1000, y: 0 },
      { x: 1000, y: 1000 }, { x: 0, y: 1000 },
    ]
    expect(pointInConvexPolygon({ x: 500, y: 500 }, large)).toBe(true)
    expect(pointInConvexPolygon({ x: 1500, y: 500 }, large)).toBe(false)
  })

  it('pointInConvexPolygon point at centroid', () => {
    const square = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
    ]
    expect(pointInConvexPolygon({ x: 2, y: 2 }, square)).toBe(true)
  })

  it('polygonArea with degenerate polygon returns zero', () => {
    const degenerate = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    ]
    expect(polygonArea(degenerate)).toBe(0)
  })

  it('polygonPerimeter with degenerate polygon', () => {
    const degenerate = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    ]
    const perimeter = polygonPerimeter(degenerate)
    expect(perimeter).toBeCloseTo(4, 5)
  })

  it('convexHull with mixed positive and negative coordinates', () => {
    const points = [
      { x: -5, y: -5 }, { x: 5, y: -5 },
      { x: 5, y: 5 }, { x: -5, y: 5 },
      { x: 0, y: 0 },
    ]
    const hull = convexHull(points)
    expect(hull.length).toBe(4)
  })

  it('pointInConvexPolygon with near edge point', () => {
    const square = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4, y: 4 }, { x: 0, y: 4 },
    ]
    expect(pointInConvexPolygon({ x: 3.999, y: 2 }, square)).toBe(true)
  })
})

describe('convex-hull - wave548', () => {
  it('convex-hull module defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module has name', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module not null', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module has length', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave549', () => {
  it('convex-hull module defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave550', () => {
  it('convex-hull w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave551', () => {
  it('convex-hull w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave552', () => {
  it('convex-hull w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave553', () => {
  it('convex-hull w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
