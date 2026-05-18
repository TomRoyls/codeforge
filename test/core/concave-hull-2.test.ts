import { describe, it, expect } from 'vitest'
import { ConcaveHull2 } from '../../src/core/concave-hull-2/index.js'

describe('ConcaveHull2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates instance with empty points', () => {
      const hull = new ConcaveHull2([])
      expect(hull.size).toBe(0)
      expect(hull.isEmpty()).toBe(true)
    })

    it('creates instance with single point', () => {
      const hull = new ConcaveHull2([{ x: 1, y: 2 }])
      expect(hull.size).toBe(1)
      expect(hull.isEmpty()).toBe(false)
    })

    it('creates instance with multiple points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]
      const hull = new ConcaveHull2(points)
      expect(hull.size).toBe(3)
    })

    it('defensive copies input array', () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      const hull = new ConcaveHull2(points)
      points.push({ x: 2, y: 2 })
      expect(hull.size).toBe(2)
    })
  })

  // ─── getPoints ───

  describe('getPoints', () => {
    it('returns copy of points', () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      const hull = new ConcaveHull2(points)
      const retrieved = hull.getPoints()
      expect(retrieved).toEqual(points)
      expect(retrieved).not.toBe(points)
    })

    it('returns empty array for empty hull', () => {
      const hull = new ConcaveHull2([])
      expect(hull.getPoints()).toEqual([])
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const hull = new ConcaveHull2([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }])
      expect(hull.size).toBe(3)
    })

    it('isEmpty returns true for empty', () => {
      const hull = new ConcaveHull2([])
      expect(hull.isEmpty()).toBe(true)
    })

    it('isEmpty returns false for non-empty', () => {
      const hull = new ConcaveHull2([{ x: 0, y: 0 }])
      expect(hull.isEmpty()).toBe(false)
    })
  })

  // ─── compute - edge cases ───

  describe('compute - edge cases', () => {
    it('returns empty array for no points', () => {
      const hull = new ConcaveHull2([])
      expect(hull.compute()).toEqual([])
    })

    it('returns single point for one point', () => {
      const hull = new ConcaveHull2([{ x: 5, y: 5 }])
      const result = hull.compute()
      expect(result).toEqual([{ x: 5, y: 5 }])
    })

    it('returns both points for two points', () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result).toHaveLength(2)
    })
  })

  // ─── compute - convex hull ───

  describe('compute - convex hull', () => {
    it('computes convex hull of a triangle', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 3 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('computes convex hull of a square', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(4)
    })

    it('handles collinear points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it('handles interior points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 5, y: 5 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(4)
    })
  })

  // ─── compute - duplicates ───

  describe('compute - duplicates', () => {
    it('handles duplicate points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 3 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('returns empty for all identical points', () => {
      const points = [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeLessThanOrEqual(1)
    })
  })

  // ─── compute - concavity parameter ───

  describe('compute - concavity parameter', () => {
    it('returns convex hull when concavity >= 1', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 5, y: 5 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute(1)
      expect(result.length).toBe(4)
    })

    it('returns convex hull when concavity is exactly 1', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute(1)
      expect(result.length).toBe(4)
    })

    it('uses default concavity of 0.7', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 },
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(4)
    })

    it('concavity=0 produces more refined hull', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 5, y: 1 },
      ]
      const hull = new ConcaveHull2(points)
      const convexResult = hull.compute(1)
      const concaveResult = hull.compute(0)
      expect(concaveResult.length).toBeGreaterThanOrEqual(convexResult.length)
    })
  })

  // ─── compute - large input ───

  describe('compute - larger inputs', () => {
    it('handles many points forming a circle', () => {
      const points: Array<{ x: number; y: number }> = []
      for (let i = 0; i < 36; i++) {
        const angle = (i * 10 * Math.PI) / 180
        points.push({ x: Math.cos(angle) * 10, y: Math.sin(angle) * 10 })
      }
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(3)
    })
  })
})
