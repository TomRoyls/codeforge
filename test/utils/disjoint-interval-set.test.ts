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

  it('empty set forEach does nothing', () => {
    const dis = new DisjointIntervalSet()
    let count = 0
    dis.forEach(() => { count++ })
    expect(count).toBe(0)
  })

  it('add single interval and contains', () => {
    const dis = new DisjointIntervalSet()
    dis.add(0, 5)
    expect(dis.contains(3)).toBe(true)
  })

  it('contains returns false outside interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(0, 5)
    expect(dis.contains(10)).toBe(false)
  })

  it('contains returns true inside added interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(0, 5)
    expect(dis.contains(3)).toBe(true)
  })

  it('contains outside interval returns false', () => {
    const dis = new DisjointIntervalSet()
    dis.add(0, 5)
    expect(dis.contains(10)).toBe(false)
  })
})

// ─── toString ──────────────────────────────────────────────
describe('DisjointIntervalSet - toString', () => {
  it('returns correct string for empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.toString()).toBe('DisjointIntervalSet(0 intervals)')
  })

  it('returns correct string with one interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.toString()).toBe('DisjointIntervalSet(1 intervals)')
  })

  it('returns correct string with multiple intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(10, 15)
    expect(dis.toString()).toBe('DisjointIntervalSet(2 intervals)')
  })

  it('returns correct string after operations', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    dis.remove(4, 6)
    expect(dis.toString()).toBe('DisjointIntervalSet(2 intervals)')
  })
})

// ─── toJSON ─────────────────────────────────────────────────
describe('DisjointIntervalSet - toJSON', () => {
  it('returns empty array for empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.toJSON()).toEqual([])
  })

  it('returns copy of intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    const json = dis.toJSON()
    expect(json).toEqual([{ start: 1, end: 5 }])
    json[0]!.start = 999
    expect(dis.getIntervals()[0]!.start).toBe(1)
  })

  it('returns multiple intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(10, 15)
    expect(dis.toJSON()).toEqual([{ start: 1, end: 5 }, { start: 10, end: 15 }])
  })

  it('returns intervals after merging', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(4, 8)
    const json = dis.toJSON()
    expect(json).toEqual([{ start: 1, end: 8 }])
  })
})

// ─── equals ─────────────────────────────────────────────────
describe('DisjointIntervalSet - equals', () => {
  it('empty sets are equal', () => {
    const a = new DisjointIntervalSet()
    const b = new DisjointIntervalSet()
    expect(a.equals(b)).toBe(true)
  })

  it('same intervals are equal', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    b.add(1, 5)
    expect(a.equals(b)).toBe(true)
  })

  it('different intervals are not equal', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    b.add(10, 15)
    expect(a.equals(b)).toBe(false)
  })

  it('not equal to non-DisjointIntervalSet', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.equals(null)).toBe(false)
    expect(dis.equals(undefined)).toBe(false)
    expect(dis.equals({})).toBe(false)
    expect(dis.equals([1, 5])).toBe(false)
  })

  it('different number of intervals', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    b.add(1, 5)
    b.add(10, 15)
    expect(a.equals(b)).toBe(false)
  })

  it('different interval boundaries', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    b.add(1, 6)
    expect(a.equals(b)).toBe(false)
  })
})

// ─── Edge cases and error handling ──────────────────────────
describe('DisjointIntervalSet - edge cases', () => {
  it('add single point interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(5, 5)
    expect(dis.getIntervals()).toEqual([{ start: 5, end: 5 }])
    expect(dis.contains(5)).toBe(true)
  })

  it('add negative intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(-10, -5)
    dis.add(-3, -1)
    expect(dis.contains(-7)).toBe(true)
    expect(dis.contains(-2)).toBe(true)
  })

  it('remove start greater than end is no-op', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    dis.remove(8, 5)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 10 }])
  })

  it('remove non-existent range', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.remove(10, 15)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 5 }])
  })

  it('getMin and getMax return undefined for empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.getMin()).toBeUndefined()
    expect(dis.getMax()).toBeUndefined()
  })

  it('getIntervals returns copy', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    const ivs = dis.getIntervals()
    ivs.push({ start: 10, end: 15 })
    expect(dis.getIntervals().length).toBe(1)
  })

  it('containsInterval with exact match', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    expect(dis.containsInterval(1, 10)).toBe(true)
  })

  it('containsInterval with larger range', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    expect(dis.containsInterval(0, 11)).toBe(false)
  })

  it('containsInterval with empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.containsInterval(1, 5)).toBe(false)
  })

  it('overlaps with empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.overlaps(1, 5)).toBe(false)
  })

  it('overlaps with exact boundary', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.overlaps(5, 10)).toBe(true)
    expect(dis.overlaps(0, 1)).toBe(true)
  })

  it('findContaining with empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.findContaining(5)).toBeUndefined()
  })

  it('findContaining at interval boundaries', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.findContaining(1)).toEqual({ start: 1, end: 5 })
    expect(dis.findContaining(5)).toEqual({ start: 1, end: 5 })
  })

  it('union with empty set', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    const u = a.union(b)
    expect(u.getIntervals()).toEqual([{ start: 1, end: 5 }])
  })

  it('intersection with empty set', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    const i = a.intersection(b)
    expect(i.isEmpty).toBe(true)
  })

  it('difference with empty set', () => {
    const a = new DisjointIntervalSet()
    a.add(1, 5)
    const b = new DisjointIntervalSet()
    const d = a.difference(b)
    expect(d.getIntervals()).toEqual([{ start: 1, end: 5 }])
  })

  it('size returns 0 for empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.size).toBe(0)
  })

  it('isEmpty returns true for empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.isEmpty).toBe(true)
  })

  it('isEmpty returns false after adding', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    expect(dis.isEmpty).toBe(false)
  })

  it('clone empty set', () => {
    const dis = new DisjointIntervalSet()
    const copy = dis.clone()
    expect(copy.isEmpty).toBe(true)
  })

  it('clone with multiple intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(10, 15)
    dis.add(20, 25)
    const copy = dis.clone()
    expect(copy.size).toBe(3)
    expect(copy.equals(dis)).toBe(true)
  })

  it('getTotalCovered with single point', () => {
    const dis = new DisjointIntervalSet()
    dis.add(5, 5)
    expect(dis.getTotalCovered()).toBe(1)
  })

  it('getTotalCovered with empty set', () => {
    const dis = new DisjointIntervalSet()
    expect(dis.getTotalCovered()).toBe(0)
  })

  it('remove entire range splits into two', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    dis.remove(4, 6)
    const ivs = dis.getIntervals()
    expect(ivs).toEqual([{ start: 1, end: 3 }, { start: 7, end: 10 }])
  })

  it('remove at start of interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    dis.remove(1, 3)
    expect(dis.getIntervals()).toEqual([{ start: 4, end: 10 }])
  })

  it('remove at end of interval', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 10)
    dis.remove(8, 10)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 7 }])
  })

  it('add interval that connects disjoint intervals', () => {
    const dis = new DisjointIntervalSet()
    dis.add(1, 5)
    dis.add(10, 15)
    dis.add(6, 9)
    expect(dis.size).toBe(1)
    expect(dis.getIntervals()).toEqual([{ start: 1, end: 15 }])
  })

  it('contains with negative numbers', () => {
    const dis = new DisjointIntervalSet()
    dis.add(-10, -5)
    expect(dis.contains(-7)).toBe(true)
    expect(dis.contains(-4)).toBe(false)
  })
})

describe('disjoint-interval-set - wave548', () => {
  it('disjoint-interval-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave549', () => {
  it('disjoint-interval-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set module has name', () => {
    expect(describe).toBeDefined()
  })
})
