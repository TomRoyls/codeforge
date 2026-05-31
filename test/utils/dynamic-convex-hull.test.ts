import { describe, expect, it } from 'vitest'
import { DynamicConvexHull } from '../../src/utils/dynamic-convex-hull.js'

describe('DynamicConvexHull', () => {
  it('builds hull for triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(2, 3)
    expect(ch.getHull().length).toBe(3)
  })

  it('handles collinear points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(1, 0)
    ch.add(2, 0)
    expect(ch.getHull().length).toBe(2)
  })

  it('handles single point', () => {
    const ch = new DynamicConvexHull()
    ch.add(1, 1)
    expect(ch.getHull().length).toBe(0)
  })

  it('computes area of square', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(4, 4)
    ch.add(0, 4)
    expect(ch.area).toBe(16)
  })

  it('inner point excluded from hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(4, 0)
    ch.add(4, 4)
    ch.add(0, 4)
    ch.add(2, 2)
    expect(ch.getHull().length).toBe(4)
  })

  it('computes perimeter', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(3, 0)
    ch.add(0, 4)
    expect(ch.perimeter).toBeCloseTo(12, 0)
  })

  it('handles two points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(5, 5)
    expect(ch.getHull().length).toBe(2)
  })

  it('handles pentagon', () => {
    const ch = new DynamicConvexHull()
    for (let i = 0; i < 5; i++) {
      const angle = (2 * Math.PI * i) / 5
      ch.add(Math.cos(angle), Math.sin(angle))
    }
    expect(ch.getHull().length).toBe(5)
  })

  it('handles duplicate points', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(0, 0)
    ch.add(1, 1)
    expect(ch.getHull().length).toBe(2)
  })

  it('area of triangle', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(6, 0)
    ch.add(3, 4)
    expect(ch.area).toBe(12)
  })

  it('handles many random points on circle', () => {
    const ch = new DynamicConvexHull()
    for (let i = 0; i < 20; i++) {
      const angle = (2 * Math.PI * i) / 20
      ch.add(10 * Math.cos(angle), 10 * Math.sin(angle))
    }
    expect(ch.getHull().length).toBe(20)
    expect(ch.area).toBeGreaterThan(280)
    expect(ch.area).toBeLessThan(315)
  })

  it('add interior point does not change hull', () => {
    const ch = new DynamicConvexHull()
    ch.add(0, 0)
    ch.add(10, 0)
    ch.add(5, 10)
    const hullBefore = ch.getHull().length
    ch.add(5, 5)
    expect(ch.getHull().length).toBe(hullBefore)
  })
})
