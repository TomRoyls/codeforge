import { describe, expect, it } from 'vitest'
import { ClosestPairBrute } from '../../src/utils/closest-pair-brute.js'

describe('ClosestPairBrute', () => {
  it('finds closest pair', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 4)
    cp.addPoint(1, 1)
    const result = cp.findClosest()
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('handles two points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const result = cp.findClosest()
    expect(result!.distance).toBe(1)
  })

  it('handles single point', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    expect(cp.findClosest()).toBeNull()
  })

  it('handles empty', () => {
    const cp = new ClosestPairBrute()
    expect(cp.findClosest()).toBeNull()
  })

  it('finds k nearest pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(5, 0)
    const pairs = cp.findKNearest(2)
    expect(pairs.length).toBe(2)
    expect(pairs[0]!.distance).toBeLessThanOrEqual(pairs[1]!.distance)
  })

  it('computes MST length', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(2, 0)
    expect(cp.minimumSpanningTreeLength()).toBeCloseTo(2, 5)
  })

  it('handles single point MST', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    expect(cp.minimumSpanningTreeLength()).toBe(0)
  })

  it('tracks size', () => {
    const cp = new ClosestPairBrute()
    expect(cp.size).toBe(0)
    cp.addPoint(0, 0)
    expect(cp.size).toBe(1)
  })

  it('handles coincident points', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(1, 1)
    cp.addPoint(1, 1)
    expect(cp.findClosest()!.distance).toBe(0)
  })

  it('handles many points', () => {
    const cp = new ClosestPairBrute()
    for (let i = 0; i < 20; i++) cp.addPoint(i, i)
    const result = cp.findClosest()
    expect(result).not.toBeNull()
    expect(result!.distance).toBeCloseTo(Math.SQRT2, 5)
  })

  it('findKNearest returns available pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    const pairs = cp.findKNearest(3)
    expect(pairs.length).toBe(1)
    expect(pairs[0]!.distance).toBe(1)
  })

  it('findKNearest returns closest pairs', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(1, 0)
    cp.addPoint(5, 0)
    cp.addPoint(10, 0)
    const pairs = cp.findKNearest(2)
    expect(pairs.length).toBe(2)
    expect(pairs[0]!.distance).toBe(1)
    expect(pairs[1]!.distance).toBeCloseTo(4)
  })

  it('handles 3D projection on XY plane', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    cp.addPoint(3, 4)
    expect(cp.findClosest()!.distance).toBe(5)
  })

  it('findClosest returns null for single point', () => {
    const cp = new ClosestPairBrute()
    cp.addPoint(0, 0)
    expect(cp.findClosest()).toBeNull()
  })
})
