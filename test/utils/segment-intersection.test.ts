import { describe, it, expect } from 'vitest'
import {
  segmentsIntersect,
  segmentIntersectionPoint,
  distance,
  pointToSegmentDistance,
} from '../../src/utils/segment-intersection.js'

describe('segmentsIntersect', () => {
  it('detects crossing segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }
    const s2 = { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('detects non-crossing segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 2, y: 2 } }
    const s2 = { a: { x: 3, y: 0 }, b: { x: 5, y: 2 } }
    expect(segmentsIntersect(s1, s2)).toBe(false)
  })

  it('detects collinear overlapping segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 2, y: 0 }, b: { x: 6, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('detects endpoint touching', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 2, y: 2 } }
    const s2 = { a: { x: 2, y: 2 }, b: { x: 4, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('parallel non-overlapping segments do not intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 0, y: 2 }, b: { x: 4, y: 2 } }
    expect(segmentsIntersect(s1, s2)).toBe(false)
  })

  it('horizontal and vertical crossing', () => {
    const s1 = { a: { x: 0, y: 2 }, b: { x: 4, y: 2 } }
    const s2 = { a: { x: 2, y: 0 }, b: { x: 2, y: 4 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })
})

describe('segmentIntersectionPoint', () => {
  it('returns intersection of crossing segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }
    const s2 = { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    const pt = segmentIntersectionPoint(s1, s2)
    expect(pt).not.toBeNull()
    expect(pt!.x).toBeCloseTo(2, 5)
    expect(pt!.y).toBeCloseTo(2, 5)
  })

  it('returns null for non-crossing segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }
    const s2 = { a: { x: 5, y: 0 }, b: { x: 5, y: 5 } }
    expect(segmentIntersectionPoint(s1, s2)).toBeNull()
  })

  it('returns null for parallel segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 0, y: 2 }, b: { x: 4, y: 2 } }
    expect(segmentIntersectionPoint(s1, s2)).toBeNull()
  })
})

describe('distance', () => {
  it('computes distance between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 5)
  })

  it('returns 0 for same point', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
  })

  it('computes horizontal distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(10)
  })
})

describe('pointToSegmentDistance', () => {
  it('computes perpendicular distance', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 2, y: 3 }, seg)).toBeCloseTo(3, 5)
  })

  it('distance to point on segment is 0', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 2, y: 0 }, seg)).toBeCloseTo(0, 5)
  })

  it('distance to zero-length segment', () => {
    const seg = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 } }
    expect(pointToSegmentDistance({ x: 4, y: 5 }, seg)).toBeCloseTo(5, 5)
  })

  it('clamps to nearest endpoint', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 6, y: 0 }, seg)).toBeCloseTo(2, 5)
  })

  it('perpendicular point distance', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 2, y: 3 }, seg)).toBeCloseTo(3, 5)
  })

  it('point on segment has zero distance', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 2, y: 0 }, seg)).toBeCloseTo(0, 5)
  })

  it('point above horizontal segment has correct distance', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 2, y: 3 }, seg)).toBeCloseTo(3, 5)
  })

  it('segments do not intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }
    const s2 = { a: { x: 5, y: 5 }, b: { x: 6, y: 6 } }
    expect(segmentsIntersect(s1, s2)).toBe(false)
  })

  it('parallel segments do not intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } }
    const s2 = { a: { x: 0, y: 1 }, b: { x: 1, y: 1 } }
    expect(segmentsIntersect(s1, s2)).toBe(false)
  })

  it('collinear overlapping segments intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 } }
    const s2 = { a: { x: 1, y: 0 }, b: { x: 3, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })
})
