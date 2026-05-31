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
})
