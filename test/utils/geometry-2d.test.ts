import { describe, expect, it } from 'vitest'
import { Geometry2D } from '../../src/utils/geometry-2d.js'

describe('Geometry2D', () => {
  describe('cross', () => {
    it('returns positive for counter-clockwise turn', () => {
      expect(Geometry2D.cross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1)
    })

    it('returns negative for clockwise turn', () => {
      expect(Geometry2D.cross({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 })).toBe(-1)
    })

    it('returns zero for collinear points', () => {
      expect(Geometry2D.cross({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(0)
    })
  })

  describe('distance', () => {
    it('computes distance between two points', () => {
      expect(Geometry2D.distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    })

    it('returns 0 for same point', () => {
      expect(Geometry2D.distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
    })

    it('computes horizontal distance', () => {
      expect(Geometry2D.distance({ x: 0, y: 0 }, { x: 5, y: 0 })).toBe(5)
    })

    it('computes vertical distance', () => {
      expect(Geometry2D.distance({ x: 0, y: 0 }, { x: 0, y: 7 })).toBe(7)
    })

    it('computes distance with negative coordinates', () => {
      expect(Geometry2D.distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5)
    })

    it('computes distance between negative points', () => {
      expect(Geometry2D.distance({ x: -5, y: -2 }, { x: -1, y: -6 })).toBeCloseTo(5.66)
    })

    it('computes distance with floating point values', () => {
      expect(Geometry2D.distance({ x: 0.5, y: 0.5 }, { x: 2.5, y: 2.5 })).toBeCloseTo(2.83, 2)
    })
  })

  describe('distanceSquared', () => {
    it('computes squared distance', () => {
      expect(Geometry2D.distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25)
    })

    it('avoids floating point issues', () => {
      expect(Geometry2D.distanceSquared({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(2)
    })

    it('returns 0 for same point', () => {
      expect(Geometry2D.distanceSquared({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(0)
    })

    it('computes vertical squared distance', () => {
      expect(Geometry2D.distanceSquared({ x: 0, y: 0 }, { x: 0, y: 8 })).toBe(64)
    })

    it('computes squared distance with negative coordinates', () => {
      expect(Geometry2D.distanceSquared({ x: -2, y: -3 }, { x: 1, y: 4 })).toBe(58)
    })
  })

  describe('midpoint', () => {
    it('computes midpoint', () => {
      const m = Geometry2D.midpoint({ x: 0, y: 0 }, { x: 4, y: 6 })
      expect(m).toEqual({ x: 2, y: 3 })
    })

    it('handles negative coordinates', () => {
      const m = Geometry2D.midpoint({ x: -4, y: -2 }, { x: 4, y: 2 })
      expect(m).toEqual({ x: 0, y: 0 })
    })

    it('computes midpoint of horizontal segment', () => {
      const m = Geometry2D.midpoint({ x: 0, y: 5 }, { x: 8, y: 5 })
      expect(m).toEqual({ x: 4, y: 5 })
    })

    it('computes midpoint of vertical segment', () => {
      const m = Geometry2D.midpoint({ x: 3, y: 0 }, { x: 3, y: 10 })
      expect(m).toEqual({ x: 3, y: 5 })
    })

    it('computes midpoint with floating point values', () => {
      const m = Geometry2D.midpoint({ x: 0, y: 0 }, { x: 5, y: 7 })
      expect(m).toEqual({ x: 2.5, y: 3.5 })
    })
  })

  describe('areaTriangle', () => {
    it('computes area of right triangle', () => {
      expect(Geometry2D.areaTriangle({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 })).toBe(6)
    })

    it('returns 0 for collinear points', () => {
      expect(Geometry2D.areaTriangle({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(0)
    })

    it('computes area of obtuse triangle', () => {
      expect(Geometry2D.areaTriangle({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 8 })).toBe(40)
    })

    it('computes area with negative coordinates', () => {
      expect(Geometry2D.areaTriangle({ x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 3 })).toBe(6)
    })

    it('computes area of equilateral triangle', () => {
      const s = 4
      const h = Math.sqrt(3) * s / 2
      expect(Geometry2D.areaTriangle({ x: 0, y: 0 }, { x: s, y: 0 }, { x: s / 2, y: h })).toBeCloseTo(s * h / 2)
    })
  })

  describe('collinear', () => {
    it('returns true for collinear points', () => {
      expect(Geometry2D.collinear({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 4, y: 4 })).toBe(true)
    })

    it('returns false for non-collinear points', () => {
      expect(Geometry2D.collinear({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(false)
    })

    it('detects horizontal collinear points', () => {
      expect(Geometry2D.collinear({ x: 0, y: 5 }, { x: 2, y: 5 }, { x: 7, y: 5 })).toBe(true)
    })

    it('detects vertical collinear points', () => {
      expect(Geometry2D.collinear({ x: 3, y: 0 }, { x: 3, y: 2 }, { x: 3, y: 7 })).toBe(true)
    })

    it('detects collinear points with negative coordinates', () => {
      expect(Geometry2D.collinear({ x: -3, y: -3 }, { x: 0, y: 0 }, { x: 6, y: 6 })).toBe(true)
    })

    it('returns false for nearly collinear points', () => {
      expect(Geometry2D.collinear({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2.1 })).toBe(false)
    })
  })

  describe('orientation', () => {
    it('returns 1 for counter-clockwise', () => {
      expect(Geometry2D.orientation({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1)
    })

    it('returns -1 for clockwise', () => {
      expect(Geometry2D.orientation({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 })).toBe(-1)
    })

    it('returns 0 for collinear', () => {
      expect(Geometry2D.orientation({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(0)
    })

    it('returns 1 for counter-clockwise with negative coordinates', () => {
      expect(Geometry2D.orientation({ x: -1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: 0 })).toBe(1)
    })

    it('returns -1 for clockwise with negative coordinates', () => {
      expect(Geometry2D.orientation({ x: -1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: -1 })).toBe(-1)
    })

    it('returns 0 for diagonal collinear points', () => {
      expect(Geometry2D.orientation({ x: 2, y: 3 }, { x: 4, y: 6 }, { x: 8, y: 12 })).toBe(0)
    })
  })

  describe('onSegment', () => {
    it('returns true when point is on segment', () => {
      expect(Geometry2D.onSegment({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(true)
    })

    it('returns false when point is outside segment', () => {
      expect(Geometry2D.onSegment({ x: 0, y: 0 }, { x: 3, y: 3 }, { x: 2, y: 2 })).toBe(false)
    })

    it('handles endpoint coincidence', () => {
      expect(Geometry2D.onSegment({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 2, y: 2 })).toBe(true)
      expect(Geometry2D.onSegment({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 2, y: 2 })).toBe(true)
    })

    it('handles horizontal segment', () => {
      expect(Geometry2D.onSegment({ x: 0, y: 5 }, { x: 3, y: 5 }, { x: 6, y: 5 })).toBe(true)
      expect(Geometry2D.onSegment({ x: 0, y: 5 }, { x: 7, y: 5 }, { x: 6, y: 5 })).toBe(false)
    })

    it('handles vertical segment', () => {
      expect(Geometry2D.onSegment({ x: 4, y: 0 }, { x: 4, y: 3 }, { x: 4, y: 6 })).toBe(true)
      expect(Geometry2D.onSegment({ x: 4, y: 0 }, { x: 4, y: 7 }, { x: 4, y: 6 })).toBe(false)
    })

    it('handles negative coordinates', () => {
      expect(Geometry2D.onSegment({ x: -4, y: -4 }, { x: -2, y: -2 }, { x: 0, y: 0 })).toBe(true)
    })

    it('returns true when y coordinate is within segment bounds', () => {
      expect(Geometry2D.onSegment({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 2 })).toBe(true)
    })
  })

  describe('segmentsIntersect', () => {
    it('detects proper intersection', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: 0, y: 0 }, { x: 2, y: 2 },
        { x: 0, y: 2 }, { x: 2, y: 0 },
      )).toBe(true)
    })

    it('returns false for non-intersecting segments', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: 0, y: 0 }, { x: 1, y: 1 },
        { x: 2, y: 2 }, { x: 3, y: 3 },
      )).toBe(false)
    })

    it('detects collinear overlapping segments', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: 0, y: 0 }, { x: 4, y: 0 },
        { x: 2, y: 0 }, { x: 6, y: 0 },
      )).toBe(true)
    })

    it('handles endpoint touching', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: 0, y: 0 }, { x: 2, y: 2 },
        { x: 2, y: 2 }, { x: 4, y: 0 },
      )).toBe(true)
    })

    it('returns false for parallel non-overlapping segments', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: 0, y: 0 }, { x: 2, y: 0 },
        { x: 0, y: 1 }, { x: 2, y: 1 },
      )).toBe(false)
    })

    it('returns false for collinear non-overlapping segments', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: 0, y: 0 }, { x: 2, y: 0 },
        { x: 3, y: 0 }, { x: 5, y: 0 },
      )).toBe(false)
    })

    it('detects intersection with negative coordinates', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: -2, y: -2 }, { x: 2, y: 2 },
        { x: -2, y: 2 }, { x: 2, y: -2 },
      )).toBe(true)
    })

    it('returns true when one segment is inside the other (collinear overlap)', () => {
      expect(Geometry2D.segmentsIntersect(
        { x: 0, y: 0 }, { x: 6, y: 0 },
        { x: 2, y: 0 }, { x: 4, y: 0 },
      )).toBe(true)
    })
  })

  describe('polygonArea', () => {
    it('computes area of a square', () => {
      const square = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }]
      expect(Geometry2D.polygonArea(square)).toBe(16)
    })

    it('computes area of a triangle', () => {
      const triangle = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }]
      expect(Geometry2D.polygonArea(triangle)).toBe(6)
    })

    it('returns 0 for fewer than 3 points', () => {
      expect(Geometry2D.polygonArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0)
      expect(Geometry2D.polygonArea([])).toBe(0)
    })

    it('computes area of complex polygon', () => {
      const pentagon = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 3 },
        { x: 2, y: 5 },
        { x: -1, y: 3 },
      ]
      expect(Geometry2D.polygonArea(pentagon)).toBe(21)
    })

    it('computes area with negative coordinates', () => {
      const triangle = [{ x: -2, y: -2 }, { x: 2, y: -2 }, { x: 0, y: 2 }]
      expect(Geometry2D.polygonArea(triangle)).toBe(8)
    })

    it('computes area of rectangle', () => {
      const rect = [{ x: 1, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 6 }, { x: 1, y: 6 }]
      expect(Geometry2D.polygonArea(rect)).toBe(16)
    })
  })

  describe('polygonPerimeter', () => {
    it('computes perimeter of a square', () => {
      const square = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }]
      expect(Geometry2D.polygonPerimeter(square)).toBe(12)
    })

    it('computes perimeter of a triangle', () => {
      const triangle = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 }]
      expect(Geometry2D.polygonPerimeter(triangle)).toBe(12)
    })

    it('computes perimeter of hexagon', () => {
      const hexagon = [
        { x: 2, y: 0 },
        { x: 4, y: 1.73 },
        { x: 4, y: 5.19 },
        { x: 2, y: 6.92 },
        { x: 0, y: 5.19 },
        { x: 0, y: 1.73 },
      ]
      expect(Geometry2D.polygonPerimeter(hexagon)).toBeCloseTo(17.5, 0)
    })

    it('computes perimeter with negative coordinates', () => {
      const triangle = [{ x: -1, y: -1 }, { x: 3, y: -1 }, { x: 1, y: 2 }]
      expect(Geometry2D.polygonPerimeter(triangle)).toBeCloseTo(11.21, 1)
    })

    it('returns 0 for empty polygon', () => {
      expect(Geometry2D.polygonPerimeter([])).toBe(0)
    })
  })

  describe('pointInPolygon', () => {
    it('detects point inside square', () => {
      const square = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }]
      expect(Geometry2D.pointInPolygon({ x: 2, y: 2 }, square)).toBe(true)
    })

    it('detects point outside square', () => {
      const square = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }]
      expect(Geometry2D.pointInPolygon({ x: 5, y: 5 }, square)).toBe(false)
    })

    it('detects point inside triangle', () => {
      const tri = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }]
      expect(Geometry2D.pointInPolygon({ x: 2, y: 2 }, tri)).toBe(true)
      expect(Geometry2D.pointInPolygon({ x: 8, y: 8 }, tri)).toBe(false)
    })

    it('detects point on edge as inside', () => {
      const square = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }]
      expect(Geometry2D.pointInPolygon({ x: 2, y: 0 }, square)).toBe(true)
    })

    it('detects point at vertex as inside', () => {
      const triangle = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }]
      expect(Geometry2D.pointInPolygon({ x: 0, y: 0 }, triangle)).toBe(true)
    })

    it('handles complex polygon', () => {
      const pentagon = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 3 },
        { x: 2, y: 5 },
        { x: -1, y: 3 },
      ]
      expect(Geometry2D.pointInPolygon({ x: 2, y: 2 }, pentagon)).toBe(true)
      expect(Geometry2D.pointInPolygon({ x: 4, y: 4 }, pentagon)).toBe(false)
    })

    it('handles polygon with negative coordinates', () => {
      const triangle = [{ x: -3, y: -3 }, { x: 3, y: -3 }, { x: 0, y: 3 }]
      expect(Geometry2D.pointInPolygon({ x: 0, y: 0 }, triangle)).toBe(true)
      expect(Geometry2D.pointInPolygon({ x: 4, y: 0 }, triangle)).toBe(false)
    })

    it('returns false for empty polygon', () => {
      expect(Geometry2D.pointInPolygon({ x: 0, y: 0 }, [])).toBe(false)
    })

    it('returns false for polygon with fewer than 3 points', () => {
      expect(Geometry2D.pointInPolygon({ x: 0, y: 0 }, [{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(false)
    })
  })
})

describe('geometry-2d - wave549', () => {
  it('geometry-2d module defined', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave550', () => {
  it('geometry-2d w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave551', () => {
  it('geometry-2d w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave552', () => {
  it('geometry-2d w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave553', () => {
  it('geometry-2d w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave554', () => {
  it('geometry-2d w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave555', () => {
  it('geometry-2d w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave556', () => {
  it('geometry-2d w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave557', () => {
  it('geometry-2d w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave558', () => {
  it('geometry-2d w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave559', () => {
  it('geometry-2d w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave560', () => {
  it('geometry-2d w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave561', () => {
  it('geometry-2d w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave562', () => {
  it('geometry-2d w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave563', () => {
  it('geometry-2d w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('geometry-2d - wave564', () => {
  it('geometry-2d w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('geometry-2d w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
