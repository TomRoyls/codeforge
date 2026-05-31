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
})
