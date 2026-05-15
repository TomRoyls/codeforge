import { describe, it, expect } from 'vitest'
import { ConcaveHull2 } from '../src/core/concave-hull-2'

describe('ConcaveHull2', () => {
  describe('Basic hull computation', () => {
    it('computes convex hull for square', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute(1)

      expect(result.length).toBe(4)
      expect(result).toContainEqual({ x: 0, y: 0 })
      expect(result).toContainEqual({ x: 1, y: 0 })
      expect(result).toContainEqual({ x: 1, y: 1 })
      expect(result).toContainEqual({ x: 0, y: 1 })
    })

    it('computes concave hull with interior points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
        { x: 1, y: 1 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute(0.5)

      expect(result.length).toBeGreaterThan(4)
      expect(result).toContainEqual({ x: 1, y: 1 })
    })

    it('handles triangle shape', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute()

      expect(result.length).toBe(3)
      expect(result).toContainEqual({ x: 0, y: 0 })
      expect(result).toContainEqual({ x: 2, y: 0 })
      expect(result).toContainEqual({ x: 1, y: 2 })
    })
  })

  describe('Concavity levels', () => {
    it('higher concavity produces more concave hull', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 },
        { x: 2, y: 2 },
        { x: 1, y: 1 },
        { x: 3, y: 3 }
      ]

      const hull = new ConcaveHull2(points)
      const convexHull = hull.compute(1)
      const mediumConcave = hull.compute(0.5)
      const highConcave = hull.compute(0.2)

      expect(convexHull.length).toBeLessThanOrEqual(mediumConcave.length)
      expect(mediumConcave.length).toBeLessThanOrEqual(highConcave.length)
    })

    it('concavity of 1 returns convex hull', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
        { x: 1, y: 1 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute(1)

      expect(result.length).toBe(4)
      expect(result).not.toContainEqual({ x: 1, y: 1 })
    })

    it('default concavity is 0.7', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
        { x: 1, y: 1 }
      ]

      const hull = new ConcaveHull2(points)
      const defaultResult = hull.compute()
      const explicitResult = hull.compute(0.7)

      expect(defaultResult).toEqual(explicitResult)
    })

    it('lower concavity includes more interior points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 3 },
        { x: 0, y: 3 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 }
      ]

      const hull = new ConcaveHull2(points)
      const lowConcave = hull.compute(0.3)
      const highConcave = hull.compute(0.8)

      expect(lowConcave.length).toBeGreaterThanOrEqual(highConcave.length)
    })
  })

  describe('Edge cases', () => {
    it('handles empty array', async () => {
      const hull = new ConcaveHull2([])
      const result = hull.compute()

      expect(result).toEqual([])
    })

    it('handles single point', async () => {
      const hull = new ConcaveHull2([{ x: 1, y: 2 }])
      const result = hull.compute()

      expect(result).toEqual([{ x: 1, y: 2 }])
    })

    it('handles two points', async () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()

      expect(result).toEqual(points)
    })

    it('handles collinear points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute()

      expect(result.length).toBe(2)
    })

    it('handles three non-collinear points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute()

      expect(result.length).toBe(3)
    })

    it('handles duplicate points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute()

      expect(result.length).toBe(3)
      expect(result.every(p => result.filter(rp => rp.x === p.x && rp.y === p.y).length === 1)).toBe(true)
    })

    it('handles all points in line', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute()

      expect(result.length).toBe(2)
    })
  })

  describe('Various point distributions', () => {
    it('handles star shape', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 },
        { x: 2, y: 2 },
        { x: 0.5, y: 2 },
        { x: 2, y: 0.5 },
        { x: 3.5, y: 2 },
        { x: 2, y: 3.5 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute(0.4)

      expect(result.length).toBeGreaterThan(4)
      expect(result.length).toBeLessThanOrEqual(points.length)
    })

    it('handles random distribution', async () => {
      const points = []
      for (let i = 0; i < 20; i++) {
        points.push({
          x: Math.random() * 10,
          y: Math.random() * 10
        })
      }

      const hull = new ConcaveHull2(points)
      const result = hull.compute()

      expect(result.length).toBeGreaterThanOrEqual(3)
      expect(result.length).toBeLessThanOrEqual(points.length)
    })

    it('handles dense cluster', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 5, y: 5 },
        { x: 5.1, y: 5 },
        { x: 4.9, y: 5 },
        { x: 5, y: 5.1 },
        { x: 5, y: 4.9 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute(0.5)

      expect(result.length).toBeGreaterThanOrEqual(4)
      expect(result.length).toBeLessThanOrEqual(points.length)
    })

    it('handles L-shaped points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 0, y: 3 }
      ]

      const hull = new ConcaveHull2(points)
      const result = hull.compute(0.5)

      expect(result.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Class API', () => {
    it('getPoints returns original points', async () => {
      const points = [
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ]
      const hull = new ConcaveHull2(points)

      const result = hull.getPoints()

      expect(result).toEqual(points)
    })

    it('size returns point count', async () => {
      const hull = new ConcaveHull2([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ])

      expect(hull.size).toBe(3)
    })

    it('isEmpty returns true for empty', async () => {
      const hull = new ConcaveHull2([])

      expect(hull.isEmpty()).toBe(true)
    })

    it('isEmpty returns false for non-empty', async () => {
      const hull = new ConcaveHull2([{ x: 1, y: 2 }])

      expect(hull.isEmpty()).toBe(false)
    })

    it('computes hull for single point', async () => {
      const hull = new ConcaveHull2([{ x: 5, y: 10 }])
      expect(hull.compute()).toEqual([{ x: 5, y: 10 }])
    })

    it('computes hull for two points', async () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      const hull = new ConcaveHull2(points)
      expect(hull.compute()).toEqual(points)
    })

    it('getPoints returns copy of points', async () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      const hull = new ConcaveHull2(points)
      const retrieved = hull.getPoints()
      expect(retrieved).toEqual(points)
      retrieved.push({ x: 2, y: 2 })
      expect(hull.getPoints()).toHaveLength(2)
    })

    it('handles concavity parameter of 1 (convex only)', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 },
        { x: 2, y: 2 }
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute(1)
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('handles L-shaped points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 3 },
        { x: 0, y: 3 }
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('handles duplicate points', async () => {
      const points = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ]
      const hull = new ConcaveHull2(points)
      const result = hull.compute()
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })
})
