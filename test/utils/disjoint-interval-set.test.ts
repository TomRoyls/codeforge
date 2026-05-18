import { describe, it, expect } from 'vitest'
import { DisjointIntervalSet } from '../../src/utils/disjoint-interval-set.js'

// ─── Add ──────────────────────────────────────────────────
describe('DisjointIntervalSet - add', () => {
  it('adds a single interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.size).toBe(1)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 5 }])
  })

  it('merges overlapping intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(4, 8)
    expect(dis.size).toBe(1)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 8 }])
  })

  it('merges adjacent intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(6, 10)
    expect(dis.size).toBe(1)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 10 }])
  })

  it('keeps disjoint intervals separate', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(10, 15)
    expect(dis.size).toBe(2)
  })

  it('merges multiple intervals into one', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 3)
    dis.add(7, 9)
    dis.add(4, 6)
    expect(dis.size).toBe(1)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 9 }])
  })

  it('throws when start > end', () => {
    const dis = new DisjointIntervalSet()
    expect(() => dis.add(5, 1)).toThrow(RangeError)
  })
})

// ─── Remove ───────────────────────────────────────────────
describe('DisjointIntervalSet - remove', () => {
  it('removes part of an interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    dis.remove(4, 6)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 3 }, { start: 7, end: 10 }])
  })

  it('removes entire interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.remove(1, 5)
    expect(dis.isEmpty).toBe(true)
  })
})

// ─── Queries ──────────────────────────────────────────────
describe('DisjointIntervalSet - queries', () => {
  it('contains point', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.contains(3)).toBe(true)
    expect(dis.contains(6)).toBe(false)
  })

  it('containsInterval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    expect(dis.containsInterval(2, 5)).toBe(true)
    expect(dis.containsInterval(2, 15)).toBe(false)
  })

  it('overlaps', () => {
    const dis = new DisjointIntervalSet()
    dis.add(5, 10)
    expect(dis.overlaps(3, 7)).toBe(true)
    expect(dis.overlaps(11, 15)).toBe(false)
  })

  it('findContaining', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.findContaining(3)).toEqual({ start: 1, end: 5 })
    expect(dis.findContaining(10)).toBeUndefined()
  })
})

// ─── Set operations ───────────────────────────────────────
describe('DisjointIntervalSet - set operations', () => {
  it('union', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    b.add(3, 8)
    const u = a.union(b)
    expect(u.getIntervals()).toEqual([{ start: 1, end: 8 }])
  })

  it('intersection', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    b.add(3, 8)
    const i = a.intersection(b)
    expect(i.getIntervals()).toEqual([{ start: 3, end: 5 }])
  })

  it('difference', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 10)
    const b = new DisjointIntervalSet()
    b.add(4, 6)
    const d = a.difference(b)
    expect(d.getIntervals()).toEqual([{ start: 1, end: 3 }, { start: 7, end: 10 }])
  })
})

// ─── Utility methods ──────────────────────────────────────
describe('DisjointIntervalSet - utility', () => {
  it('getTotalCovered', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(10, 12)
    expect(dis.getTotalCovered()).toBe(8)
  })

  it('getMin and getMax', () => {
    const dis = new DisjointIntervalSet()
    dis.add(3, 5)
    dis.add(10, 15)
    expect(dis.getMin()).toBe(3)
    expect(dis.getMax()).toBe(15)
  })

  it('clone is independent', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    const copy = dis.clone()
    dis.add(10, 15)
    expect(copy.size).toBe(1)
    expect(dis.size).toBe(2)
  })

  it('clear', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.clear()
    expect(dis.isEmpty).toBe(true)
  })

  it('forEach', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(10, 15)
    const ivs: number[] = []
    dis.forEach((iv) => ivs.push(iv.start))
    expect(ivs).toEqual([1, 10])
  })
})
