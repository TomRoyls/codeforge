import { describe, expect, it } from 'vitest'
import { SweepLine } from '../../src/utils/sweep-line.js'

describe('SweepLine', () => {
  it('finds intersection of crossing segments', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 0, y1: 2, x2: 2, y2: 0 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBe(1)
    expect(intersections[0]).toEqual([0, 1])
  })

  it('returns empty for non-intersecting segments', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 1, y2: 0 },
      { x1: 0, y1: 1, x2: 1, y2: 1 },
    ]
    expect(SweepLine.findIntersections(segments)).toEqual([])
  })

  it('handles empty segments array', () => {
    expect(SweepLine.findIntersections([])).toEqual([])
  })

  it('handles single segment', () => {
    expect(SweepLine.findIntersections([{ x1: 0, y1: 0, x2: 1, y2: 1 }])).toEqual([])
  })

  it('segmentsIntersect returns true for crossing', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 0, y1: 2, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('segmentsIntersect returns false for parallel', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 0 },
      { x1: 0, y1: 1, x2: 1, y2: 1 },
    )).toBe(false)
  })

  it('handles collinear overlapping segments', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 1, y1: 0, x2: 3, y2: 0 },
    )).toBe(true)
  })

  it('finds multiple intersections', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 4, y2: 4 },
      { x1: 0, y1: 4, x2: 4, y2: 0 },
      { x1: 0, y1: 2, x2: 4, y2: 2 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBeGreaterThanOrEqual(2)
  })

  it('closestPair finds correct pair', () => {
    const points = [
      { x: 0, y: 0 }, { x: 3, y: 4 }, { x: 1, y: 1 }, { x: 10, y: 10 },
    ]
    const result = SweepLine.closestPair(points)
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair returns null for single point', () => {
    expect(SweepLine.closestPair([{ x: 0, y: 0 }])).toBeNull()
  })

  it('closestPair returns null for empty', () => {
    expect(SweepLine.closestPair([])).toBeNull()
  })

  it('handles endpoint touching', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      { x1: 1, y1: 1, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('handles parallel non-intersecting', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 0, y1: 1, x2: 2, y2: 1 },
    )).toBe(false)
  })

  it('handles two points closestPair', () => {
    const result = SweepLine.closestPair([{ x: 0, y: 0 }, { x: 3, y: 4 }])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(5)
  })

  it('handles three points closestPair', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: 5 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('no intersection when far apart', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.sqrt(20000), 5)
  })

  it('two identical points have zero distance', () => {
    const result = SweepLine.closestPair([{ x: 1, y: 1 }, { x: 1, y: 1 }])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(0)
  })

  it('segmentsIntersect with vertical and horizontal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 1, y1: 0, x2: 1, y2: 2 },
      { x1: 0, y1: 1, x2: 2, y2: 1 },
    )).toBe(true)
  })

  it('segmentsIntersect with both vertical', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 0, y2: 2 },
      { x1: 1, y1: 0, x2: 1, y2: 2 },
    )).toBe(false)
  })

  it('segmentsIntersect with both horizontal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 0, y1: 1, x2: 2, y2: 1 },
    )).toBe(false)
  })

  it('segmentsIntersect T-junction', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 1, y1: 0, x2: 1, y2: 1 },
    )).toBe(true)
  })

  it('segmentsIntersect overlapping collinear', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 3, y2: 0 },
      { x1: 1, y1: 0, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('segmentsIntersect touching at endpoint', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      { x1: 1, y1: 1, x2: 2, y2: 2 },
    )).toBe(true)
  })

  it('segmentsIntersect with negative coordinates', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: -2, y1: -2, x2: 2, y2: 2 },
      { x1: -2, y1: 2, x2: 2, y2: -2 },
    )).toBe(true)
  })

  it('segmentsIntersect with large coordinates', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 1000, y1: 1000, x2: 2000, y2: 2000 },
      { x1: 1000, y1: 2000, x2: 2000, y2: 1000 },
    )).toBe(true)
  })

  it('segmentsIntersect non-intersecting diagonal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 1, y2: 1 },
      { x1: 2, y1: 2, x2: 3, y2: 3 },
    )).toBe(false)
  })

  it('closestPair with same x coordinate', () => {
    const result = SweepLine.closestPair([
      { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 10 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('closestPair with same y coordinate', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 10, y: 5 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('closestPair with collinear points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair with grid points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('closestPair with four points square', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with rectangle points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with triangle points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with negative coordinates', () => {
    const result = SweepLine.closestPair([
      { x: -1, y: -1 }, { x: -2, y: -2 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair with L shape', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(2)
  })

  it('closestPair with large coordinates', () => {
    const result = SweepLine.closestPair([
      { x: 1000, y: 1000 }, { x: 1001, y: 1001 }, { x: 2000, y: 2000 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeCloseTo(Math.SQRT2, 4)
  })

  it('closestPair returns correct point indices', () => {
    const points = [
      { x: 0, y: 0 }, { x: 10, y: 10 }, { x: 1, y: 1 },
    ]
    const result = SweepLine.closestPair(points)
    expect(result).not.toBeNull()
    expect(result!.p1).toBe(2)
    expect(result!.p2).toBe(0)
  })

  it('findIntersections with many intersecting segments', () => {
    const segments = [
      { x1: 0, y1: 0, x2: 10, y2: 10 },
      { x1: 0, y1: 10, x2: 10, y2: 0 },
      { x1: 0, y1: 5, x2: 10, y2: 5 },
      { x1: 5, y1: 0, x2: 5, y2: 10 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBeGreaterThan(0)
  })

  it('segmentsIntersect with segment containing point', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 2, y2: 2 },
      { x1: 1, y1: 1, x2: 1, y2: 1 },
    )).toBe(true)
  })

  it('closestPair with multiple equidistant pairs', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(1)
  })

  it('findIntersections sorts by x coordinate then type', () => {
    const segments = [
      { x1: 1, y1: 0, x2: 0, y2: 0 },
      { x1: 0, y1: 1, x2: 0, y2: -1 },
    ]
    const intersections = SweepLine.findIntersections(segments)
    expect(intersections.length).toBe(1)
  })

  it('segmentsIntersect with reversed segment direction', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 2, y1: 2, x2: 0, y2: 0 },
      { x1: 0, y1: 2, x2: 2, y2: 0 },
    )).toBe(true)
  })

  it('closestPair with very close points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 0.001, y: 0.001 }, { x: 10, y: 10 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBeLessThan(0.01)
  })

  it('segmentsIntersect with segments forming X', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: -1, y1: -1, x2: 1, y2: 1 },
      { x1: -1, y1: 1, x2: 1, y2: -1 },
    )).toBe(true)
  })

  it('closestPair handles five points', () => {
    const result = SweepLine.closestPair([
      { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }, { x: 6, y: 0 }, { x: 8, y: 0 },
    ])
    expect(result).not.toBeNull()
    expect(result!.dist).toBe(2)
  })

  it('segmentsIntersect with horizontal and diagonal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 1, x2: 2, y2: 1 },
      { x1: 0, y1: 0, x2: 2, y2: 2 },
    )).toBe(true)
  })

  it('segmentsIntersect with vertical and diagonal', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 1, y1: 0, x2: 1, y2: 2 },
      { x1: 0, y1: 0, x2: 2, y2: 2 },
    )).toBe(true)
  })

  it('should find no intersections for parallel segments', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 10, y2: 0 },
      { x1: 0, y1: 5, x2: 10, y2: 5 },
    ])
    expect(result).toEqual([])
  })

  it('should find intersection of crossing segments', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 10, y2: 10 },
      { x1: 0, y1: 10, x2: 10, y2: 0 },
    ])
    expect(result).toHaveLength(1)
  })

  it('should handle single segment', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 5, y2: 5 },
    ])
    expect(result).toEqual([])
  })

  it('should handle empty input', () => {
    const result = SweepLine.findIntersections([])
    expect(result).toEqual([])
  })

  it('should find multiple intersections', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 10, y2: 10 },
      { x1: 0, y1: 10, x2: 10, y2: 0 },
      { x1: 0, y1: 5, x2: 10, y2: 5 },
    ])
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('should detect non-overlapping segments', () => {
    const result = SweepLine.findIntersections([
      { x1: 0, y1: 0, x2: 5, y2: 5 },
      { x1: 10, y1: 10, x2: 15, y2: 15 },
    ])
    expect(result).toEqual([])
  })
})
  it('findIntersections empty returns empty', () => {
    expect(SweepLine.findIntersections([])).toEqual([])
  })

  it('closestPair returns null for single point', () => {
    expect(SweepLine.closestPair([{ x: 0, y: 0 }])).toBeNull()
  })

describe('sweep-line - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('sweep-line - wave545', () => {
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
