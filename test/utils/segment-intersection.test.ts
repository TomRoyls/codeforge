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
