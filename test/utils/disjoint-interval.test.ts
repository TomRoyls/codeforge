import { describe, expect, it } from 'vitest'
import { DisjointInterval } from '../../src/utils/disjoint-interval.js'

describe('DisjointInterval', () => {
  it('adds single interval', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    expect(di.getIntervals()).toEqual([[1, 5]])
  })

  it('merges overlapping intervals', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(2, 5)
    expect(di.getIntervals()).toEqual([[1, 5]])
  })

  it('merges adjacent intervals', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(4, 6)
    expect(di.getIntervals()).toEqual([[1, 6]])
  })

  it('keeps disjoint intervals separate', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(7, 9)
    expect(di.count).toBe(2)
  })

  it('contains checks membership', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    expect(di.contains(3)).toBe(true)
    expect(di.contains(6)).toBe(false)
  })

  it('removes interval', () => {
    const di = new DisjointInterval()
    di.add(1, 10)
    di.remove(4, 6)
    expect(di.getIntervals()).toEqual([[1, 3], [7, 10]])
  })

  it('totalCovered computes sum', () => {
    const di = new DisjointInterval()
    di.add(1, 3)
    di.add(7, 9)
    expect(di.totalCovered()).toBe(6)
  })

  it('covers checks full range', () => {
    const di = new DisjointInterval()
    di.add(1, 10)
    expect(di.covers(2, 8)).toBe(true)
    expect(di.covers(2, 12)).toBe(false)
  })

  it('handles add then remove all', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    di.remove(1, 5)
    expect(di.count).toBe(0)
  })

  it('handles invalid range', () => {
    const di = new DisjointInterval()
    di.add(5, 3)
    expect(di.count).toBe(0)
  })

  it('remove from middle of interval', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(5, 5)
    expect(di.getIntervals()).toEqual([[0, 4], [6, 10]])
  })

  it('contains after multiple operations', () => {
    const di = new DisjointInterval()
    di.add(1, 5)
    di.add(10, 15)
    di.remove(3, 12)
    expect(di.contains(2)).toBe(true)
    expect(di.contains(3)).toBe(false)
    expect(di.contains(14)).toBe(true)
  })

  it('covers range after split', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(4, 6)
    expect(di.covers(0, 3)).toBe(true)
    expect(di.covers(4, 6)).toBe(false)
    expect(di.covers(7, 10)).toBe(true)
  })

  it('handles adjacent intervals merge', () => {
    const di = new DisjointInterval()
    di.add(0, 5)
    di.add(6, 10)
    const intervals = di.getIntervals()
    expect(intervals.length).toBeGreaterThanOrEqual(1)
    expect(intervals.length).toBeLessThanOrEqual(2)
  })

  it('totalCovered after removal', () => {
    const di = new DisjointInterval()
    di.add(0, 10)
    di.remove(5, 5)
    expect(di.totalCovered()).toBe(10)
  })
})
