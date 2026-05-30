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
  })

  describe('distanceSquared', () => {
    it('computes squared distance', () => {
      expect(Geometry2D.distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25)
    })

    it('avoids floating point issues', () => {
      expect(Geometry2D.distanceSquared({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(2)
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
  })

  describe('areaTriangle', () => {
    it('computes area of right triangle', () => {
      expect(Geometry2D.areaTriangle({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 })).toBe(6)
    })

    it('returns 0 for collinear points', () => {
      expect(Geometry2D.areaTriangle({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(0)
    })
  })

  describe('collinear', () => {
    it('returns true for collinear points', () => {
      expect(Geometry2D.collinear({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 4, y: 4 })).toBe(true)
    })

    it('returns false for non-collinear points', () => {
      expect(Geometry2D.collinear({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(false)
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
  })
})
