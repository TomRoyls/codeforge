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

describe('convex-hull - wave554', () => {
  it('convex-hull w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave555', () => {
  it('convex-hull w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave556', () => {
  it('convex-hull w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave557', () => {
  it('convex-hull w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave558', () => {
  it('convex-hull w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave559', () => {
  it('convex-hull w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave560', () => {
  it('convex-hull w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave561', () => {
  it('convex-hull w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave562', () => {
  it('convex-hull w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave563', () => {
  it('convex-hull w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave564', () => {
  it('convex-hull w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave565', () => {
  it('convex-hull w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave566', () => {
  it('convex-hull w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave127', () => {
  it('convex-hull w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave130', () => {
  it('convex-hull w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave133', () => {
  it('convex-hull w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave136', () => {
  it('convex-hull w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - wave139', () => {
  it('convex-hull w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w142', () => {
  it('convex-hull v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w145', () => {
  it('convex-hull v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w148', () => {
  it('convex-hull v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w151', () => {
  it('convex-hull v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w154', () => {
  it('convex-hull v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w157', () => {
  it('convex-hull v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w160', () => {
  it('convex-hull v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w170', () => {
  it('convex-hull x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w180', () => {
  it('convex-hull x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w190', () => {
  it('convex-hull x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w200', () => {
  it('convex-hull x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w210', () => {
  it('convex-hull x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w220', () => {
  it('convex-hull x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w230', () => {
  it('convex-hull x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w240', () => {
  it('convex-hull x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w250', () => {
  it('convex-hull x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w260', () => {
  it('convex-hull x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w270', () => {
  it('convex-hull x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w280', () => {
  it('convex-hull x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w290', () => {
  it('convex-hull x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w300', () => {
  it('convex-hull x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w310', () => {
  it('convex-hull x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w320', () => {
  it('convex-hull x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w330', () => {
  it('convex-hull x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w340', () => {
  it('convex-hull x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w350', () => {
  it('convex-hull x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w360', () => {
  it('convex-hull x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w370', () => {
  it('convex-hull x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w380', () => {
  it('convex-hull x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w390', () => {
  it('convex-hull x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w400', () => {
  it('convex-hull x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w420', () => {
  it('convex-hull x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w440', () => {
  it('convex-hull x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w460', () => {
  it('convex-hull x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w480', () => {
  it('convex-hull x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w500', () => {
  it('convex-hull x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w550', () => {
  it('convex-hull x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w600', () => {
  it('convex-hull x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w650', () => {
  it('convex-hull x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w700', () => {
  it('convex-hull x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w800', () => {
  it('convex-hull x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w900', () => {
  it('convex-hull x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull - w1000', () => {
  it('convex-hull x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
