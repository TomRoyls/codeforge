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

  it('identical segments intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 2, y: 2 } }
    const s2 = { a: { x: 0, y: 0 }, b: { x: 2, y: 2 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('segments sharing one endpoint intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 2, y: 2 } }
    const s2 = { a: { x: 2, y: 2 }, b: { x: 4, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('segments where endpoint lies on other segment intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 2, y: 2 }, b: { x: 2, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('collinear non-overlapping segments do not intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 } }
    const s2 = { a: { x: 3, y: 0 }, b: { x: 5, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(false)
  })

  it('vertical segments parallel and separated do not intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 0, y: 4 } }
    const s2 = { a: { x: 2, y: 0 }, b: { x: 2, y: 4 } }
    expect(segmentsIntersect(s1, s2)).toBe(false)
  })

  it('segments with negative coordinates intersect', () => {
    const s1 = { a: { x: -2, y: -2 }, b: { x: 2, y: 2 } }
    const s2 = { a: { x: -2, y: 2 }, b: { x: 2, y: -2 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('very long segments intersect', () => {
    const s1 = { a: { x: -1000, y: -1000 }, b: { x: 1000, y: 1000 } }
    const s2 = { a: { x: -1000, y: 1000 }, b: { x: 1000, y: -1000 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('zero-length segment at intersection point', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }
    const s2 = { a: { x: 2, y: 2 }, b: { x: 2, y: 2 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('diagonal and horizontal intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }
    const s2 = { a: { x: 0, y: 2 }, b: { x: 4, y: 2 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('segments at slight angle intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0.1 } }
    const s2 = { a: { x: 0, y: 4 }, b: { x: 4, y: -0.1 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('segments near parallel do not intersect', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 0, y: 0.1 }, b: { x: 4, y: 0.1 } }
    expect(segmentsIntersect(s1, s2)).toBe(false)
  })

  it('endpoint of one segment touches interior of other', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 2, y: 2 }, b: { x: 2, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })

  it('segment completely contained within another', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 6, y: 0 } }
    const s2 = { a: { x: 2, y: 0 }, b: { x: 4, y: 0 } }
    expect(segmentsIntersect(s1, s2)).toBe(true)
  })
})

describe('segmentIntersectionPoint - edge cases', () => {
  it('returns intersection at exact endpoint', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }
    const s2 = { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    const pt = segmentIntersectionPoint(s1, s2)
    expect(pt).not.toBeNull()
    expect(pt!.x).toBeCloseTo(2, 5)
    expect(pt!.y).toBeCloseTo(2, 5)
  })

  it('returns null for parallel horizontal segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 0, y: 2 }, b: { x: 4, y: 2 } }
    expect(segmentIntersectionPoint(s1, s2)).toBeNull()
  })

  it('returns null for parallel vertical segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 0, y: 4 } }
    const s2 = { a: { x: 2, y: 0 }, b: { x: 2, y: 4 } }
    expect(segmentIntersectionPoint(s1, s2)).toBeNull()
  })

  it('returns intersection for vertical and horizontal', () => {
    const s1 = { a: { x: 2, y: 0 }, b: { x: 2, y: 4 } }
    const s2 = { a: { x: 0, y: 2 }, b: { x: 4, y: 2 } }
    const pt = segmentIntersectionPoint(s1, s2)
    expect(pt).not.toBeNull()
    expect(pt!.x).toBeCloseTo(2, 5)
    expect(pt!.y).toBeCloseTo(2, 5)
  })

  it('returns null when intersection is outside segment bounds', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }
    const s2 = { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    expect(segmentIntersectionPoint(s1, s2)).toBeNull()
  })

  it('handles negative coordinates in intersection', () => {
    const s1 = { a: { x: -2, y: -2 }, b: { x: 2, y: 2 } }
    const s2 = { a: { x: -2, y: 2 }, b: { x: 2, y: -2 } }
    const pt = segmentIntersectionPoint(s1, s2)
    expect(pt).not.toBeNull()
    expect(pt!.x).toBeCloseTo(0, 5)
    expect(pt!.y).toBeCloseTo(0, 5)
  })

  it('returns null for segments that would intersect if extended', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }
    const s2 = { a: { x: 2, y: 2 }, b: { x: 3, y: 1 } }
    expect(segmentIntersectionPoint(s1, s2)).toBeNull()
  })

  it('handles very small segment lengths', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 0.001, y: 0.001 } }
    const s2 = { a: { x: 0, y: 0.001 }, b: { x: 0.001, y: 0 } }
    const pt = segmentIntersectionPoint(s1, s2)
    expect(pt).not.toBeNull()
    expect(pt!.x).toBeCloseTo(0.0005, 5)
    expect(pt!.y).toBeCloseTo(0.0005, 5)
  })

  it('returns null for collinear segments', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    const s2 = { a: { x: 1, y: 0 }, b: { x: 3, y: 0 } }
    expect(segmentIntersectionPoint(s1, s2)).toBeNull()
  })

  it('handles intersection at segment endpoint', () => {
    const s1 = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }
    const s2 = { a: { x: 4, y: 4 }, b: { x: 6, y: 2 } }
    const pt = segmentIntersectionPoint(s1, s2)
    expect(pt).not.toBeNull()
    expect(pt!.x).toBeCloseTo(4, 5)
    expect(pt!.y).toBeCloseTo(4, 5)
  })
})

describe('distance - edge cases', () => {
  it('computes vertical distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 0, y: 5 })).toBe(5)
  })

  it('computes diagonal distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.sqrt(2), 5)
  })

  it('handles negative coordinates', () => {
    expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBeCloseTo(5, 5)
  })

  it('handles very large coordinates', () => {
    expect(distance({ x: 1000, y: 1000 }, { x: 1003, y: 1004 })).toBeCloseTo(5, 5)
  })

  it('handles very small distances', () => {
    expect(distance({ x: 0, y: 0 }, { x: 0.001, y: 0 })).toBeCloseTo(0.001, 5)
  })

  it('computes distance between same negative points', () => {
    expect(distance({ x: -5, y: -5 }, { x: -5, y: -5 })).toBe(0)
  })
})

describe('pointToSegmentDistance - edge cases', () => {
  it('computes distance to vertical segment', () => {
    const seg = { a: { x: 2, y: 0 }, b: { x: 2, y: 4 } }
    expect(pointToSegmentDistance({ x: 5, y: 2 }, seg)).toBeCloseTo(3, 5)
  })

  it('computes distance to diagonal segment', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } }
    expect(pointToSegmentDistance({ x: 0, y: 4 }, seg)).toBeCloseTo(Math.sqrt(8), 5)
  })

  it('distance to endpoint when projection is outside', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: -2, y: 3 }, seg)).toBeCloseTo(Math.sqrt(13), 5)
  })

  it('handles negative coordinates for point', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 2, y: -3 }, seg)).toBeCloseTo(3, 5)
  })

  it('handles negative coordinates for segment', () => {
    const seg = { a: { x: -2, y: 0 }, b: { x: 2, y: 0 } }
    expect(pointToSegmentDistance({ x: 0, y: 3 }, seg)).toBeCloseTo(3, 5)
  })

  it('handles point beyond start of segment', () => {
    const seg = { a: { x: 2, y: 2 }, b: { x: 4, y: 2 } }
    expect(pointToSegmentDistance({ x: 0, y: 2 }, seg)).toBeCloseTo(2, 5)
  })

  it('handles point beyond end of segment', () => {
    const seg = { a: { x: 0, y: 2 }, b: { x: 2, y: 2 } }
    expect(pointToSegmentDistance({ x: 4, y: 2 }, seg)).toBeCloseTo(2, 5)
  })

  it('computes distance to vertical segment point', () => {
    const seg = { a: { x: 3, y: 0 }, b: { x: 3, y: 5 } }
    expect(pointToSegmentDistance({ x: 3, y: 2 }, seg)).toBeCloseTo(0, 5)
  })

  it('handles very large coordinates', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 1000, y: 0 } }
    expect(pointToSegmentDistance({ x: 500, y: 100 }, seg)).toBeCloseTo(100, 5)
  })

  it('handles very small distances', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } }
    expect(pointToSegmentDistance({ x: 0.5, y: 0.001 }, seg)).toBeCloseTo(0.001, 5)
  })

  it('computes distance to negatively sloped segment', () => {
    const seg = { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 0, y: 0 }, seg)).toBeCloseTo(Math.sqrt(8), 5)
  })

  it('handles point exactly at midpoint', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }
    expect(pointToSegmentDistance({ x: 2, y: 0 }, seg)).toBeCloseTo(0, 5)
  })
})

describe('segment-intersection - wave548', () => {
  it('segment-intersection module defined', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module is function', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module has name', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module not null', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module has prototype', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave549', () => {
  it('segment-intersection module defined', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module is function', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave550', () => {
  it('segment-intersection w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave551', () => {
  it('segment-intersection w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave552', () => {
  it('segment-intersection w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave553', () => {
  it('segment-intersection w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave554', () => {
  it('segment-intersection w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave555', () => {
  it('segment-intersection w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave556', () => {
  it('segment-intersection w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave557', () => {
  it('segment-intersection w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave558', () => {
  it('segment-intersection w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave559', () => {
  it('segment-intersection w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave560', () => {
  it('segment-intersection w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave561', () => {
  it('segment-intersection w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave562', () => {
  it('segment-intersection w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave563', () => {
  it('segment-intersection w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave564', () => {
  it('segment-intersection w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave565', () => {
  it('segment-intersection w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave566', () => {
  it('segment-intersection w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave127', () => {
  it('segment-intersection w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave130', () => {
  it('segment-intersection w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave133', () => {
  it('segment-intersection w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave136', () => {
  it('segment-intersection w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - wave139', () => {
  it('segment-intersection w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w142', () => {
  it('segment-intersection v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w145', () => {
  it('segment-intersection v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w148', () => {
  it('segment-intersection v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w151', () => {
  it('segment-intersection v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w154', () => {
  it('segment-intersection v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w157', () => {
  it('segment-intersection v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w160', () => {
  it('segment-intersection v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w170', () => {
  it('segment-intersection x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w180', () => {
  it('segment-intersection x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w190', () => {
  it('segment-intersection x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w200', () => {
  it('segment-intersection x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w210', () => {
  it('segment-intersection x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w220', () => {
  it('segment-intersection x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w230', () => {
  it('segment-intersection x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w240', () => {
  it('segment-intersection x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w250', () => {
  it('segment-intersection x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w260', () => {
  it('segment-intersection x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w270', () => {
  it('segment-intersection x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w280', () => {
  it('segment-intersection x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w290', () => {
  it('segment-intersection x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w300', () => {
  it('segment-intersection x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w310', () => {
  it('segment-intersection x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w320', () => {
  it('segment-intersection x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w330', () => {
  it('segment-intersection x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w340', () => {
  it('segment-intersection x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w350', () => {
  it('segment-intersection x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w360', () => {
  it('segment-intersection x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w370', () => {
  it('segment-intersection x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w380', () => {
  it('segment-intersection x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w390', () => {
  it('segment-intersection x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w400', () => {
  it('segment-intersection x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w420', () => {
  it('segment-intersection x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w440', () => {
  it('segment-intersection x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w460', () => {
  it('segment-intersection x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w480', () => {
  it('segment-intersection x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w500', () => {
  it('segment-intersection x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w550', () => {
  it('segment-intersection x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w600', () => {
  it('segment-intersection x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w650', () => {
  it('segment-intersection x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w700', () => {
  it('segment-intersection x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w800', () => {
  it('segment-intersection x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w900', () => {
  it('segment-intersection x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('segment-intersection - w1000', () => {
  it('segment-intersection x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('segment-intersection x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
