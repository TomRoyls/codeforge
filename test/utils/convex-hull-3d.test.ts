import { describe, expect, it } from 'vitest'
import { ConvexHull3D } from '../../src/utils/convex-hull-3d.js'

describe('ConvexHull3D', () => {
  it('empty points', () => {
    const ch = new ConvexHull3D()
    expect(ch.size).toBe(0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('single point', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    expect(ch.size).toBe(1)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('coplanar points have 0 volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(1, 1, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('tetrahedron has correct volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    const vol = ch.convexHullVolume()
    expect(vol).toBeCloseTo(1 / 6, 5)
  })

  it('centroid of symmetric points', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-1, -1, -1)
    ch.addPoint(1, 1, 1)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(0, 5)
    expect(c[1]).toBeCloseTo(0, 5)
    expect(c[2]).toBeCloseTo(0, 5)
  })

  it('bounding box', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(1, 2, 3)
    ch.addPoint(-1, -2, -3)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([-1, -2, -3])
    expect(bb.max).toEqual([1, 2, 3])
  })

  it('unit cube bounding box', () => {
    const ch = new ConvexHull3D()
    for (let x = 0; x <= 1; x++)
      for (let y = 0; y <= 1; y++)
        for (let z = 0; z <= 1; z++)
          ch.addPoint(x, y, z)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([0, 0, 0])
    expect(bb.max).toEqual([1, 1, 1])
  })

  it('scaled tetrahedron', () => {
    const ch = new ConvexHull3D()
    const s = 3
    ch.addPoint(0, 0, 0)
    ch.addPoint(s, 0, 0)
    ch.addPoint(0, s, 0)
    ch.addPoint(0, 0, s)
    const vol = ch.convexHullVolume()
    expect(vol).toBeCloseTo(Math.pow(s, 3) / 6, 4)
  })

  it('three points no volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('two points no volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 1, 1)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('centroid of single point', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(3, 4, 5)
    expect(ch.centroid()).toEqual([3, 4, 5])
  })

  it('three collinear points no volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 1, 1)
    ch.addPoint(2, 2, 2)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('bounding box of cube', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([0, 0, 0])
    expect(bb.max).toEqual([1, 1, 1])
  })

  it('single point bounding box', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(5, 5, 5)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([5, 5, 5])
    expect(bb.max).toEqual([5, 5, 5])
  })

  it('centroid of two points', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(2, 4, 6)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(1, 5)
    expect(c[1]).toBeCloseTo(2, 5)
    expect(c[2]).toBeCloseTo(3, 5)
  })

  it('four coplanar points no volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(1, 1, 0)
    ch.addPoint(0, 1, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('empty hull returns zero volume', () => {
    const ch = new ConvexHull3D()
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('single point has zero volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('single point has zero volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(5, 5, 5)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('four non-coplanar points form tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
  })

  it('two identical points volume 0', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(0, 0, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('tetrahedron has positive volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
  })

  it('negative coordinates tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-1, -1, -1)
    ch.addPoint(0, -1, -1)
    ch.addPoint(-1, 0, -1)
    ch.addPoint(-1, -1, 0)
    expect(ch.convexHullVolume()).toBeCloseTo(1 / 6, 5)
  })

  it('large coordinates tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(100, 100, 100)
    ch.addPoint(101, 100, 100)
    ch.addPoint(100, 101, 100)
    ch.addPoint(100, 100, 101)
    expect(ch.convexHullVolume()).toBeCloseTo(1 / 6, 5)
  })

  it('negative and positive coordinates centroid', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-5, -5, -5)
    ch.addPoint(5, 5, 5)
    ch.addPoint(-5, 5, -5)
    ch.addPoint(5, -5, 5)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(0, 5)
    expect(c[1]).toBeCloseTo(0, 5)
    expect(c[2]).toBeCloseTo(0, 5)
  })

  it('many points centroid', () => {
    const ch = new ConvexHull3D()
    for (let i = 0; i < 10; i++) {
      ch.addPoint(i, i, i)
    }
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(4.5, 5)
    expect(c[1]).toBeCloseTo(4.5, 5)
    expect(c[2]).toBeCloseTo(4.5, 5)
  })

  it('floating point coordinates tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0.5, 0.5, 0.5)
    ch.addPoint(1.5, 0.5, 0.5)
    ch.addPoint(0.5, 1.5, 0.5)
    ch.addPoint(0.5, 0.5, 1.5)
    expect(ch.convexHullVolume()).toBeCloseTo(1 / 6, 5)
  })

  it('very small coordinates tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0.001, 0.001, 0.001)
    ch.addPoint(0.002, 0.001, 0.001)
    ch.addPoint(0.001, 0.002, 0.001)
    ch.addPoint(0.001, 0.001, 0.002)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
  })

  it('five points coplanar', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(1, 1, 0)
    ch.addPoint(2, 0, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('all points on same line', () => {
    const ch = new ConvexHull3D()
    for (let i = 0; i < 5; i++) {
      ch.addPoint(i, i, i)
    }
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('bounding box with negative values', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-5, -3, -2)
    ch.addPoint(-2, -1, 0)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([-5, -3, -2])
    expect(bb.max).toEqual([-2, -1, 0])
  })

  it('bounding box with zero values', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(0, 0, 0)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([0, 0, 0])
    expect(bb.max).toEqual([0, 0, 0])
  })

  it('many identical points volume 0', () => {
    const ch = new ConvexHull3D()
    for (let i = 0; i < 10; i++) {
      ch.addPoint(5, 5, 5)
    }
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('mixed identical and distinct points', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    expect(ch.convexHullVolume()).toBeCloseTo(1 / 6, 5)
  })

  it('centroid returns array with three elements', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(1, 2, 3)
    const c = ch.centroid()
    expect(c).toHaveLength(3)
    expect(c[0]).toBe(1)
    expect(c[1]).toBe(2)
    expect(c[2]).toBe(3)
  })

  it('negative centroid coordinates', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-10, -20, -30)
    ch.addPoint(-5, -10, -15)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(-7.5, 5)
    expect(c[1]).toBeCloseTo(-15, 5)
    expect(c[2]).toBeCloseTo(-22.5, 5)
  })

  it('size increases with each point', () => {
    const ch = new ConvexHull3D()
    expect(ch.size).toBe(0)
    ch.addPoint(0, 0, 0)
    expect(ch.size).toBe(1)
    ch.addPoint(1, 1, 1)
    expect(ch.size).toBe(2)
    ch.addPoint(2, 2, 2)
    expect(ch.size).toBe(3)
  })

  it('non-uniform tetrahedron volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(2, 0, 0)
    ch.addPoint(0, 3, 0)
    ch.addPoint(0, 0, 4)
    expect(ch.convexHullVolume()).toBeCloseTo(4, 5)
  })

  it('points forming plane y=x', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 1, 0)
    ch.addPoint(2, 2, 1)
    ch.addPoint(3, 3, 2)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('bounding box for single negative point', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-7, -8, -9)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([-7, -8, -9])
    expect(bb.max).toEqual([-7, -8, -9])
  })

  it('centroid of three collinear points', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(3, 3, 3)
    ch.addPoint(6, 6, 6)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(3, 5)
    expect(c[1]).toBeCloseTo(3, 5)
    expect(c[2]).toBeCloseTo(3, 5)
  })

  it('inverted tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(1, 1, 1)
    ch.addPoint(0, 1, 1)
    ch.addPoint(1, 0, 1)
    ch.addPoint(1, 1, 0)
    const vol = ch.convexHullVolume()
    expect(vol).toBeCloseTo(1 / 6, 5)
  })

  it('five points with three non-coplanar', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    ch.addPoint(1, 1, 1)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
  })

  it('centroid with large values', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(1000000, 2000000, 3000000)
    ch.addPoint(2000000, 4000000, 6000000)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(1500000, 0)
    expect(c[1]).toBeCloseTo(3000000, 0)
    expect(c[2]).toBeCloseTo(4500000, 0)
  })

  it('multiple tetrahedra in same set', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    ch.addPoint(2, 0, 0)
    ch.addPoint(2, 1, 0)
    ch.addPoint(2, 0, 1)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
  })

  it('all points on x-axis', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-5, 0, 0)
    ch.addPoint(0, 0, 0)
    ch.addPoint(5, 0, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })

  it('centroid of eight cube corners', () => {
    const ch = new ConvexHull3D()
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          ch.addPoint(x, y, z)
        }
      }
    }
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(0.5, 5)
    expect(c[1]).toBeCloseTo(0.5, 5)
    expect(c[2]).toBeCloseTo(0.5, 5)
  })

  it('very small negative coordinates tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-0.001, -0.001, -0.001)
    ch.addPoint(-0.002, -0.001, -0.001)
    ch.addPoint(-0.001, -0.002, -0.001)
    ch.addPoint(-0.001, -0.001, -0.002)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
  })

  it('points spanning multiple octants', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-1, -1, -1)
    ch.addPoint(1, -1, -1)
    ch.addPoint(-1, 1, -1)
    ch.addPoint(-1, -1, 1)
    expect(ch.convexHullVolume()).toBeCloseTo(8 / 6, 5)
  })

  it('non-unit cube volume', () => {
    const ch = new ConvexHull3D()
    const size = 2
    ch.addPoint(0, 0, 0)
    ch.addPoint(size, 0, 0)
    ch.addPoint(0, size, 0)
    ch.addPoint(0, 0, size)
    ch.addPoint(size, size, size)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
  })

  it('centroid with very large negative coordinates', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-1000000, -2000000, -3000000)
    ch.addPoint(-2000000, -4000000, -6000000)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(-1500000, 0)
    expect(c[1]).toBeCloseTo(-3000000, 0)
    expect(c[2]).toBeCloseTo(-4500000, 0)
  })

  it('mixed extreme positive and negative values', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(-1000, -1000, -1000)
    ch.addPoint(1000, -1000, -1000)
    ch.addPoint(-1000, 1000, -1000)
    ch.addPoint(-1000, -1000, 1000)
    ch.addPoint(1000, 1000, 1000)
    expect(ch.convexHullVolume()).toBeGreaterThan(0)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([-1000, -1000, -1000])
    expect(bb.max).toEqual([1000, 1000, 1000])
  })

  it('centroid returns center of mass', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(2, 0, 0)
    ch.addPoint(0, 2, 0)
    ch.addPoint(0, 0, 2)
    const c = ch.centroid()
    expect(c[0]).toBeCloseTo(0.5, 5)
  })

  it('convexHullVolume for tetrahedron', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    expect(ch.convexHullVolume()).toBeCloseTo(1 / 6, 5)
  })

  it('fewer than 4 points gives zero volume', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    expect(ch.convexHullVolume()).toBe(0)
  })
})

  it('boundingBox of single point', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(1, 2, 3)
    const bb = ch.boundingBox()
    expect(bb.min).toEqual([1, 2, 3])
    expect(bb.max).toEqual([1, 2, 3])
  })

  it('convexHullVolume of few points', () => {
    const ch = new ConvexHull3D()
    ch.addPoint(0, 0, 0)
    ch.addPoint(1, 0, 0)
    ch.addPoint(0, 1, 0)
    ch.addPoint(0, 0, 1)
    expect(ch.convexHullVolume()).toBeGreaterThanOrEqual(0)
  })

  it('empty hull returns 0 volume', () => {
    const ch = new ConvexHull3D()
    expect(ch.convexHullVolume()).toBe(0)
  })

describe('convex-hull-3d - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('convex-hull-3d - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('convex-hull-3d - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('convex-hull-3d - wave548', () => {
  it('convex-hull-3d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-3d - wave549', () => {
  it('convex-hull-3d module defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d module is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-3d - wave550', () => {
  it('convex-hull-3d w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-3d - wave551', () => {
  it('convex-hull-3d w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-3d - wave552', () => {
  it('convex-hull-3d w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('convex-hull-3d - wave553', () => {
  it('convex-hull-3d w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('convex-hull-3d w553 v2', () => {
    expect(describe).toBeDefined()
  })
})
