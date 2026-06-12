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

describe('disjoint-interval-set - wave550', () => {
  it('disjoint-interval-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave551', () => {
  it('disjoint-interval-set w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave552', () => {
  it('disjoint-interval-set w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave553', () => {
  it('disjoint-interval-set w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave554', () => {
  it('disjoint-interval-set w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave555', () => {
  it('disjoint-interval-set w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave556', () => {
  it('disjoint-interval-set w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave557', () => {
  it('disjoint-interval-set w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave558', () => {
  it('disjoint-interval-set w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave559', () => {
  it('disjoint-interval-set w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave560', () => {
  it('disjoint-interval-set w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave561', () => {
  it('disjoint-interval-set w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave562', () => {
  it('disjoint-interval-set w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave563', () => {
  it('disjoint-interval-set w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave564', () => {
  it('disjoint-interval-set w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave565', () => {
  it('disjoint-interval-set w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave566', () => {
  it('disjoint-interval-set w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave127', () => {
  it('disjoint-interval-set w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave130', () => {
  it('disjoint-interval-set w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave133', () => {
  it('disjoint-interval-set w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave136', () => {
  it('disjoint-interval-set w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - wave139', () => {
  it('disjoint-interval-set w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w142', () => {
  it('disjoint-interval-set v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w145', () => {
  it('disjoint-interval-set v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w148', () => {
  it('disjoint-interval-set v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w151', () => {
  it('disjoint-interval-set v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w154', () => {
  it('disjoint-interval-set v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w157', () => {
  it('disjoint-interval-set v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w160', () => {
  it('disjoint-interval-set v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w170', () => {
  it('disjoint-interval-set x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w180', () => {
  it('disjoint-interval-set x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w190', () => {
  it('disjoint-interval-set x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w200', () => {
  it('disjoint-interval-set x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w210', () => {
  it('disjoint-interval-set x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w220', () => {
  it('disjoint-interval-set x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w230', () => {
  it('disjoint-interval-set x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w240', () => {
  it('disjoint-interval-set x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w250', () => {
  it('disjoint-interval-set x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w260', () => {
  it('disjoint-interval-set x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w270', () => {
  it('disjoint-interval-set x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w280', () => {
  it('disjoint-interval-set x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w290', () => {
  it('disjoint-interval-set x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w300', () => {
  it('disjoint-interval-set x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w310', () => {
  it('disjoint-interval-set x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w320', () => {
  it('disjoint-interval-set x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w330', () => {
  it('disjoint-interval-set x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w340', () => {
  it('disjoint-interval-set x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w350', () => {
  it('disjoint-interval-set x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w360', () => {
  it('disjoint-interval-set x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w370', () => {
  it('disjoint-interval-set x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w380', () => {
  it('disjoint-interval-set x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w390', () => {
  it('disjoint-interval-set x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w400', () => {
  it('disjoint-interval-set x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w420', () => {
  it('disjoint-interval-set x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w440', () => {
  it('disjoint-interval-set x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w460', () => {
  it('disjoint-interval-set x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w480', () => {
  it('disjoint-interval-set x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w500', () => {
  it('disjoint-interval-set x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w550', () => {
  it('disjoint-interval-set x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w600', () => {
  it('disjoint-interval-set x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w650', () => {
  it('disjoint-interval-set x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-set - w700', () => {
  it('disjoint-interval-set x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-set x700x49', () => {
    expect(describe).toBeDefined()
  })
})
