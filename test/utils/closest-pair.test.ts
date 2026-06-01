import { describe, expect, it } from 'vitest'
import { ClosestPair } from '../../src/utils/closest-pair.js'

describe('ClosestPair', () => {
  it('returns null for fewer than 2 points', () => {
    expect(ClosestPair.find([])).toBeNull()
    expect(ClosestPair.find([{ x: 1, y: 1 }])).toBeNull()
  })

  it('finds closest pair of two points', () => {
    const result = ClosestPair.find([{ x: 0, y: 0 }, { x: 3, y: 4 }])
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(5, 8)
  })

  it('finds closest pair among collinear points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('finds closest pair in grid', () => {
    const points = [
      { x: 0, y: 0 }, { x: 10, y: 10 },
      { x: 1, y: 1 }, { x: 5, y: 5 },
    ]
    const result = ClosestPair.find(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 6)
  })

  it('minDistance returns Infinity for empty', () => {
    expect(ClosestPair.minDistance([])).toBe(Infinity)
  })

  it('minDistance returns correct value', () => {
    expect(ClosestPair.minDistance([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBeCloseTo(1, 8)
  })

  it('distance computes Euclidean distance', () => {
    expect(ClosestPair.distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0)
    expect(ClosestPair.distance({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1)
  })

  it('bruteForce matches find for small sets', () => {
    const points = [{ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 1, y: 1 }]
    const bf = ClosestPair.bruteForce(points)!
    const dc = ClosestPair.find(points)!
    expect(bf.distance).toBeCloseTo(dc.distance, 8)
  })

  it('handles duplicate points', () => {
    const points = [{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 5, y: 5 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(0, 8)
  })

  it('finds closest in large random set', () => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 100; i++) {
      points.push({ x: i * 10, y: i * 10 })
    }
    points.push({ x: 501, y: 501 })
    const result = ClosestPair.find(points)
    expect(result).not.toBeNull()
    expect(result!.distance).toBeLessThan(2)
  })

  it('handles points with same x coordinate', () => {
    const points = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 0, y: 1 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('handles points with same y coordinate', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 1, y: 0 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('finds closest across divide', () => {
    const points = [
      { x: 0, y: 0 }, { x: 100, y: 100 },
      { x: 49, y: 50 }, { x: 51, y: 50 },
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(2, 8)
  })

  it('bruteForce returns null for 0 or 1 points', () => {
    expect(ClosestPair.bruteForce([])).toBeNull()
    expect(ClosestPair.bruteForce([{ x: 0, y: 0 }])).toBeNull()
  })

  it('distance handles negative coordinates', () => {
    expect(ClosestPair.distance({ x: -1, y: -1 }, { x: 2, y: 3 })).toBeCloseTo(5, 8)
  })

  it('finds closest in grid pattern', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    ]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(1, 8)
  })

  it('handles two points', () => {
    const points = [{ x: 0, y: 0 }, { x: 3, y: 4 }]
    const result = ClosestPair.find(points)
    expect(result!.distance).toBeCloseTo(5, 8)
  })
})
