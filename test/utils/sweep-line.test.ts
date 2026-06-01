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

  it('handles collinear overlapping segments', () => {
    expect(SweepLine.segmentsIntersect(
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      { x1: 2, y1: 0, x2: 6, y2: 0 },
    )).toBe(true)
  })
})
