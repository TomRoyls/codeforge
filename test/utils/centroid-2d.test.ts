import { describe, expect, it } from 'vitest'
import { Centroid2D } from '../../src/utils/centroid-2d.js'

describe('Centroid2D', () => {
  it('computes simple centroid', () => {
    const c = Centroid2D.compute([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }])
    expect(c.x).toBe(2)
    expect(c.y).toBe(2)
  })

  it('handles empty points', () => {
    const c = Centroid2D.compute([])
    expect(c).toEqual({ x: 0, y: 0 })
  })

  it('handles single point', () => {
    const c = Centroid2D.compute([{ x: 3, y: 5 }])
    expect(c).toEqual({ x: 3, y: 5 })
  })

  it('computes weighted centroid', () => {
    const c = Centroid2D.weightedCentroid([
      { x: 0, y: 0, weight: 1 },
      { x: 10, y: 0, weight: 1 },
    ])
    expect(c.x).toBe(5)
    expect(c.y).toBe(0)
  })

  it('weighted centroid with different weights', () => {
    const c = Centroid2D.weightedCentroid([
      { x: 0, y: 0, weight: 3 },
      { x: 6, y: 0, weight: 1 },
    ])
    expect(c.x).toBeCloseTo(1.5)
  })

  it('weighted centroid handles zero total weight', () => {
    const c = Centroid2D.weightedCentroid([{ x: 5, y: 5, weight: 0 }])
    expect(c).toEqual({ x: 0, y: 0 })
  })

  it('computes polygon centroid for triangle', () => {
    const c = Centroid2D.polygonCentroid([{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 6 }])
    expect(c.x).toBeCloseTo(3)
    expect(c.y).toBeCloseTo(2)
  })

  it('computes polygon centroid for square', () => {
    const c = Centroid2D.polygonCentroid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }])
    expect(c.x).toBeCloseTo(2)
    expect(c.y).toBeCloseTo(2)
  })

  it('polygon centroid handles empty', () => {
    const c = Centroid2D.polygonCentroid([])
    expect(c).toEqual({ x: 0, y: 0 })
  })

  it('simple centroid of two points', () => {
    const c = Centroid2D.compute([{ x: 0, y: 0 }, { x: 10, y: 10 }])
    expect(c).toEqual({ x: 5, y: 5 })
  })

  it('polygon centroid of triangle matches average for equilateral', () => {
    const c = Centroid2D.polygonCentroid([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: Math.sqrt(3) }])
    expect(c.x).toBeCloseTo(1)
  })

  it('weighted centroid with equal weights equals simple', () => {
    const pts = [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }]
    const simple = Centroid2D.compute(pts)
    const weighted = Centroid2D.weightedCentroid(pts.map(p => ({ ...p, weight: 1 })))
    expect(weighted.x).toBeCloseTo(simple.x)
    expect(weighted.y).toBeCloseTo(simple.y)
  })

  it('single point centroid', () => {
    const c = Centroid2D.compute([{ x: 5, y: 10 }])
    expect(c.x).toBe(5)
    expect(c.y).toBe(10)
  })

  it('weighted centroid with zero total weight returns zero', () => {
    const c = Centroid2D.weightedCentroid([{ x: 5, y: 5, weight: 0 }])
    expect(c.x).toBe(0)
    expect(c.y).toBe(0)
  })

  it('polygon centroid of square', () => {
    const c = Centroid2D.polygonCentroid([
      { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 },
    ])
    expect(c.x).toBeCloseTo(2, 5)
    expect(c.y).toBeCloseTo(2, 5)
  })

  it('polygon centroid of triangle', () => {
    const c = Centroid2D.polygonCentroid([
      { x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 6 },
    ])
    expect(c.x).toBeCloseTo(3, 5)
    expect(c.y).toBeCloseTo(2, 5)
  })

  it('weighted centroid single point', () => {
    const c = Centroid2D.weightedCentroid([{ x: 3, y: 4, weight: 1 }])
    expect(c.x).toBeCloseTo(3, 5)
    expect(c.y).toBeCloseTo(4, 5)
  })

  it('two points centroid is midpoint', () => {
    const c = Centroid2D.weightedCentroid([
      { x: 0, y: 0, weight: 1 },
      { x: 4, y: 4, weight: 1 },
    ])
    expect(c.x).toBeCloseTo(2, 5)
    expect(c.y).toBeCloseTo(2, 5)
  })

  it('centroid of symmetric points at origin', () => {
    const c = Centroid2D.compute([
      { x: -1, y: -1 },
      { x: 1, y: 1 },
    ])
    expect(c.x).toBeCloseTo(0, 5)
    expect(c.y).toBeCloseTo(0, 5)
  })

  it('single point is its own centroid', () => {
    const c = Centroid2D.compute([{ x: 5, y: 10 }])
    expect(c.x).toBeCloseTo(5, 5)
    expect(c.y).toBeCloseTo(10, 5)
  })

  it('centroid of symmetric points is origin', () => {
    const c = Centroid2D.compute([{ x: -1, y: -1 }, { x: 1, y: 1 }])
    expect(c.x).toBeCloseTo(0, 5)
    expect(c.y).toBeCloseTo(0, 5)
  })

  it('compute with single point returns it', () => {
    const c = Centroid2D.compute([{ x: 5, y: 10 }])
    expect(c.x).toBeCloseTo(5, 5)
    expect(c.y).toBeCloseTo(10, 5)
  })
})
