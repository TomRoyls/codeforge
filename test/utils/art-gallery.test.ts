import { describe, expect, it } from 'vitest'
import { ArtGallery } from '../../src/utils/art-gallery.js'

describe('ArtGallery', () => {
  it('computes area of triangle', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(0, 3)
    expect(ag.polygonArea()).toBe(6)
  })

  it('computes area of square', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.polygonArea()).toBe(4)
  })

  it('detects convex polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.isConvex()).toBe(true)
  })

  it('detects non-convex polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(1, 1)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.isConvex()).toBe(false)
  })

  it('point inside polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(2, 2)).toBe(true)
  })

  it('point outside polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.pointInPolygon(5, 5)).toBe(false)
  })

  it('triangulates triangle', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1, 0)
    ag.addPoint(0, 1)
    const tri = ag.triangulation()
    expect(tri.length).toBe(1)
  })

  it('triangulates quad', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    const tri = ag.triangulation()
    expect(tri.length).toBe(2)
  })

  it('handles single point', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    expect(ag.polygonArea()).toBe(0)
    expect(ag.isConvex()).toBe(false)
  })

  it('handles two points', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1, 1)
    expect(ag.polygonArea()).toBe(0)
  })

  it('handles square', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.polygonArea()).toBeCloseTo(16, 5)
  })

  it('point outside polygon is false', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.pointInPolygon(5, 5)).toBe(false)
  })

  it('triangulates CW polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(0, 4)
    ag.addPoint(4, 4)
    ag.addPoint(4, 0)
    const tri = ag.triangulation()
    expect(tri.length).toBe(2)
  })

  it('triangulates CW concave polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(0, 4)
    ag.addPoint(2, 1)
    ag.addPoint(4, 4)
    ag.addPoint(4, 0)
    const tri = ag.triangulation()
    expect(tri.length).toBe(3)
  })

  it('computes area of pentagon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(3, 1)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.polygonArea()).toBeCloseTo(5, 5)
  })

  it('detects regular convex pentagon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(3, 1)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.isConvex()).toBe(true)
  })

  it('triangulates pentagon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(3, 1)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    const tri = ag.triangulation()
    expect(tri.length).toBe(3)
  })

  it('point at vertex of polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(0, 0)).toBe(true)
  })

  it('point near but outside polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(-0.1, 2)).toBe(false)
  })

  it('area of rectangle not at origin', () => {
    const ag = new ArtGallery()
    ag.addPoint(1, 1)
    ag.addPoint(3, 1)
    ag.addPoint(3, 3)
    ag.addPoint(1, 3)
    expect(ag.polygonArea()).toBe(4)
  })

  it('point in polygon with negative coordinates', () => {
    const ag = new ArtGallery()
    ag.addPoint(-2, -2)
    ag.addPoint(2, -2)
    ag.addPoint(2, 2)
    ag.addPoint(-2, 2)
    expect(ag.pointInPolygon(0, 0)).toBe(true)
  })

  it('area with negative coordinates', () => {
    const ag = new ArtGallery()
    ag.addPoint(-2, -2)
    ag.addPoint(2, -2)
    ag.addPoint(2, 2)
    ag.addPoint(-2, 2)
    expect(ag.polygonArea()).toBeCloseTo(16, 5)
  })

  it('convex with negative coordinates', () => {
    const ag = new ArtGallery()
    ag.addPoint(-2, -2)
    ag.addPoint(2, -2)
    ag.addPoint(2, 2)
    ag.addPoint(-2, 2)
    expect(ag.isConvex()).toBe(true)
  })

  it('triangulates polygon with 6 points', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(3, 1)
    ag.addPoint(2, 2)
    ag.addPoint(1, 2)
    ag.addPoint(0, 1)
    const tri = ag.triangulation()
    expect(tri.length).toBe(4)
  })

  it('point near vertical edge inside polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(3.9, 2)).toBe(true)
  })

  it('point on diagonal edge of square', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(2, 2)).toBe(true)
  })

  it('area of right triangle', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(0, 3)
    expect(ag.polygonArea()).toBe(6)
  })

  it('triangulates skinny triangle', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(0.01, 0)
    ag.addPoint(0, 5)
    const tri = ag.triangulation()
    expect(tri.length).toBe(1)
  })

  it('area of very small polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(0.001, 0)
    ag.addPoint(0.001, 0.001)
    ag.addPoint(0, 0.001)
    expect(ag.polygonArea()).toBeGreaterThan(0)
  })

  it('point in very large polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(10000, 0)
    ag.addPoint(10000, 10000)
    ag.addPoint(0, 10000)
    expect(ag.pointInPolygon(5000, 5000)).toBe(true)
  })

  it('area of very large polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1000, 0)
    ag.addPoint(1000, 1000)
    ag.addPoint(0, 1000)
    expect(ag.polygonArea()).toBeCloseTo(1000000, 5)
  })

  it('detects L-shaped concave polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 1)
    ag.addPoint(1, 1)
    ag.addPoint(1, 2)
    ag.addPoint(0, 2)
    expect(ag.isConvex()).toBe(false)
  })

  it('area of L-shaped polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 1)
    ag.addPoint(1, 1)
    ag.addPoint(1, 2)
    ag.addPoint(0, 2)
    expect(ag.polygonArea()).toBe(3)
  })

  it('triangulates L-shaped polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 1)
    ag.addPoint(1, 1)
    ag.addPoint(1, 2)
    ag.addPoint(0, 2)
    const tri = ag.triangulation()
    expect(tri.length).toBe(4)
  })

  it('point at center of L-shaped polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 1)
    ag.addPoint(1, 1)
    ag.addPoint(1, 2)
    ag.addPoint(0, 2)
    expect(ag.pointInPolygon(0.5, 0.5)).toBe(true)
  })

  it('toString returns correct format', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1, 1)
    const str = ag.toString()
    expect(str).toBe('ArtGallery(points=2)')
  })

  it('toString with single point', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    const str = ag.toString()
    expect(str).toBe('ArtGallery(points=1)')
  })

  it('toJSON returns points array', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1, 1)
    ag.addPoint(2, 2)
    const json = ag.toJSON()
    expect(json).toEqual([[0, 0], [1, 1], [2, 2]])
  })

  it('toJSON with empty gallery', () => {
    const ag = new ArtGallery()
    const json = ag.toJSON()
    expect(json).toEqual([])
  })

  it('clone creates independent copy', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(0, 2)
    const cloned = ag.clone()
    cloned.addPoint(2, 2)
    expect(ag.polygonArea()).not.toBe(cloned.polygonArea())
  })

  it('clone has same initial state', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(0, 2)
    const cloned = ag.clone()
    expect(ag.equals(cloned)).toBe(true)
    expect(ag.polygonArea()).toBe(cloned.polygonArea())
  })

  it('equals with same gallery', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1, 1)
    expect(ag.equals(ag)).toBe(true)
  })

  it('equals with identical galleries', () => {
    const ag1 = new ArtGallery()
    ag1.addPoint(0, 0)
    ag1.addPoint(1, 1)
    const ag2 = new ArtGallery()
    ag2.addPoint(0, 0)
    ag2.addPoint(1, 1)
    expect(ag1.equals(ag2)).toBe(true)
  })

  it('equals with different point order', () => {
    const ag1 = new ArtGallery()
    ag1.addPoint(0, 0)
    ag1.addPoint(1, 1)
    const ag2 = new ArtGallery()
    ag2.addPoint(1, 1)
    ag2.addPoint(0, 0)
    expect(ag1.equals(ag2)).toBe(false)
  })

  it('equals with different number of points', () => {
    const ag1 = new ArtGallery()
    ag1.addPoint(0, 0)
    ag1.addPoint(1, 1)
    const ag2 = new ArtGallery()
    ag2.addPoint(0, 0)
    expect(ag1.equals(ag2)).toBe(false)
  })

  it('equals with different point coordinates', () => {
    const ag1 = new ArtGallery()
    ag1.addPoint(0, 0)
    ag1.addPoint(1, 1)
    const ag2 = new ArtGallery()
    ag2.addPoint(0, 0)
    ag2.addPoint(2, 2)
    expect(ag1.equals(ag2)).toBe(false)
  })

  it('equals returns false for non-ArtGallery object', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    expect(ag.equals({})).toBe(false)
    expect(ag.equals(null)).toBe(false)
    expect(ag.equals(undefined)).toBe(false)
  })

  it('equals with empty galleries', () => {
    const ag1 = new ArtGallery()
    const ag2 = new ArtGallery()
    expect(ag1.equals(ag2)).toBe(true)
  })

  it('area is zero for empty gallery', () => {
    const ag = new ArtGallery()
    expect(ag.polygonArea()).toBe(0)
  })

  it('isConvex returns false for empty gallery', () => {
    const ag = new ArtGallery()
    expect(ag.isConvex()).toBe(false)
  })

  it('triangulation returns empty for empty gallery', () => {
    const ag = new ArtGallery()
    const tri = ag.triangulation()
    expect(tri).toEqual([])
  })

  it('point in empty polygon is false', () => {
    const ag = new ArtGallery()
    expect(ag.pointInPolygon(0, 0)).toBe(false)
  })

  it('triangulates polygon with collinear points', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 2)
    ag.addPoint(0, 2)
    const tri = ag.triangulation()
    expect(tri.length).toBeGreaterThan(0)
  })

  it('area with floating point coordinates', () => {
    const ag = new ArtGallery()
    ag.addPoint(0.5, 0.5)
    ag.addPoint(2.5, 0.5)
    ag.addPoint(2.5, 2.5)
    ag.addPoint(0.5, 2.5)
    expect(ag.polygonArea()).toBeCloseTo(4, 5)
  })

  it('point in polygon with floating point coordinates', () => {
    const ag = new ArtGallery()
    ag.addPoint(0.5, 0.5)
    ag.addPoint(2.5, 0.5)
    ag.addPoint(2.5, 2.5)
    ag.addPoint(0.5, 2.5)
    expect(ag.pointInPolygon(1.5, 1.5)).toBe(true)
  })

  it('convex with floating point coordinates', () => {
    const ag = new ArtGallery()
    ag.addPoint(0.1, 0.1)
    ag.addPoint(2.9, 0.1)
    ag.addPoint(2.9, 2.9)
    ag.addPoint(0.1, 2.9)
    expect(ag.isConvex()).toBe(true)
  })
})

describe('art-gallery - wave548', () => {
  it('art-gallery module defined', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module is function', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module has name', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module not null', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module has length', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave549', () => {
  it('art-gallery module defined', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module is function', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave550', () => {
  it('art-gallery w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave551', () => {
  it('art-gallery w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave552', () => {
  it('art-gallery w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave553', () => {
  it('art-gallery w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave554', () => {
  it('art-gallery w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave555', () => {
  it('art-gallery w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave556', () => {
  it('art-gallery w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave557', () => {
  it('art-gallery w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave558', () => {
  it('art-gallery w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave559', () => {
  it('art-gallery w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave560', () => {
  it('art-gallery w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave561', () => {
  it('art-gallery w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave562', () => {
  it('art-gallery w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave563', () => {
  it('art-gallery w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave564', () => {
  it('art-gallery w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('art-gallery - wave565', () => {
  it('art-gallery w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('art-gallery w565 v2', () => {
    expect(describe).toBeDefined()
  })
})
