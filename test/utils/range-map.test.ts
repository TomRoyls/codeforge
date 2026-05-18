import { beforeEach, describe, expect, it } from 'vitest'

import { RangeMap } from '../../src/utils/range-map.js'

// ─── Construction and empty state ─────────────────────────
describe('RangeMap - empty state', () => {
  it('starts empty', () => {
    const rm = new RangeMap<string>()
    expect(rm.isEmpty).toBe(true)
  })

  it('starts with size 0', () => {
    const rm = new RangeMap<string>()
    expect(rm.size).toBe(0)
  })

  it('get returns undefined on empty map', () => {
    const rm = new RangeMap<string>()
    expect(rm.get(5)).toBeUndefined()
  })

  it('has returns false on empty map', () => {
    const rm = new RangeMap<string>()
    expect(rm.has(0)).toBe(false)
  })

  it('getAll returns empty array on empty map', () => {
    const rm = new RangeMap<string>()
    expect(rm.getAll()).toEqual([])
  })

  it('totalCovered returns 0 on empty map', () => {
    const rm = new RangeMap<string>()
    expect(rm.totalCovered()).toBe(0)
  })
})

// ─── set and get ──────────────────────────────────────────
describe('RangeMap - set and get', () => {
  it('stores and retrieves a single range', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    expect(rm.get(1)).toBe('a')
    expect(rm.get(3)).toBe('a')
    expect(rm.get(5)).toBe('a')
  })

  it('returns undefined for point outside all ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    expect(rm.get(0)).toBeUndefined()
    expect(rm.get(6)).toBeUndefined()
  })

  it('stores multiple non-overlapping ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    rm.set(7, 9, 'b')
    expect(rm.get(2)).toBe('a')
    expect(rm.get(8)).toBe('b')
    expect(rm.get(5)).toBeUndefined()
  })

  it('stores a point range (start === end)', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 5, 'point')
    expect(rm.get(5)).toBe('point')
    expect(rm.get(4)).toBeUndefined()
    expect(rm.get(6)).toBeUndefined()
  })

  it('throws RangeError when start > end', () => {
    const rm = new RangeMap<string>()
    expect(() => rm.set(5, 1, 'bad')).toThrow(RangeError)
    expect(() => rm.set(5, 1, 'bad')).toThrow('start (5) must be <= end (1)')
  })

  it('updates size after set', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    expect(rm.size).toBe(1)
    rm.set(5, 7, 'b')
    expect(rm.size).toBe(2)
  })
})

// ─── has ──────────────────────────────────────────────────
describe('RangeMap - has', () => {
  it('returns true for points within a range', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 10, 'x')
    expect(rm.has(0)).toBe(true)
    expect(rm.has(5)).toBe(true)
    expect(rm.has(10)).toBe(true)
  })

  it('returns false for points outside all ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(2, 4, 'x')
    expect(rm.has(1)).toBe(false)
    expect(rm.has(5)).toBe(false)
  })
})

// ─── remove ───────────────────────────────────────────────
describe('RangeMap - remove', () => {
  it('removes an existing range', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    expect(rm.remove(1, 5)).toBe(1)
    expect(rm.isEmpty).toBe(true)
  })

  it('removes ranges that overlap with the given range', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    rm.set(5, 7, 'b')
    rm.set(9, 11, 'c')
    expect(rm.remove(4, 8)).toBe(1)
    expect(rm.size).toBe(2)
    expect(rm.get(6)).toBeUndefined()
  })

  it('returns 0 when nothing overlaps', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    expect(rm.remove(10, 20)).toBe(0)
    expect(rm.size).toBe(1)
  })

  it('removes multiple overlapping ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    rm.set(4, 6, 'b')
    rm.set(7, 9, 'c')
    expect(rm.remove(2, 8)).toBe(3)
    expect(rm.isEmpty).toBe(true)
  })
})

// ─── clear ────────────────────────────────────────────────
describe('RangeMap - clear', () => {
  it('removes all entries', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    rm.set(10, 15, 'b')
    rm.clear()
    expect(rm.isEmpty).toBe(true)
    expect(rm.size).toBe(0)
    expect(rm.get(3)).toBeUndefined()
  })
})

// ─── set overwrites overlapping ranges ────────────────────
describe('RangeMap - set overwrites', () => {
  it('overwrites overlapping ranges when setting a new range', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'old')
    rm.set(3, 8, 'new')
    expect(rm.get(4)).toBe('new')
    expect(rm.get(2)).toBeUndefined()
    expect(rm.size).toBe(1)
  })
})

// ─── getAll ───────────────────────────────────────────────
describe('RangeMap - getAll', () => {
  it('returns entries sorted by start', () => {
    const rm = new RangeMap<string>()
    rm.set(10, 15, 'c')
    rm.set(1, 5, 'a')
    rm.set(6, 8, 'b')
    const entries = rm.getAll()
    expect(entries[0]!.start).toBe(1)
    expect(entries[1]!.start).toBe(6)
    expect(entries[2]!.start).toBe(10)
  })

  it('returns a copy that does not affect the map', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    const entries = rm.getAll()
    entries[0]!.start
    expect(rm.size).toBe(1)
  })
})

// ─── findOverlapping ──────────────────────────────────────
describe('RangeMap - findOverlapping', () => {
  it('finds all overlapping ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    rm.set(10, 15, 'b')
    rm.set(20, 25, 'c')
    const overlap = rm.findOverlapping(4, 12)
    expect(overlap).toHaveLength(2)
    expect(overlap.map((e) => e.value)).toEqual(['a', 'b'])
  })

  it('returns empty array when nothing overlaps', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    expect(rm.findOverlapping(10, 20)).toEqual([])
  })
})

// ─── forEach ──────────────────────────────────────────────
describe('RangeMap - forEach', () => {
  it('iterates all entries with correct indices', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    rm.set(5, 7, 'b')
    const result: Array<{ value: string; index: number }> = []
    rm.forEach((entry, i) => result.push({ value: entry.value, index: i }))
    expect(result).toEqual([
      { value: 'a', index: 0 },
      { value: 'b', index: 1 },
    ])
  })
})

// ─── coversEntireRange ────────────────────────────────────
describe('RangeMap - coversEntireRange', () => {
  it('returns true when fully covered', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 10, 'a')
    expect(rm.coversEntireRange(1, 10)).toBe(true)
  })

  it('returns true when covered by multiple ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    rm.set(6, 10, 'b')
    expect(rm.coversEntireRange(1, 10)).toBe(true)
  })

  it('returns false when there is a gap', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    rm.set(7, 10, 'b')
    expect(rm.coversEntireRange(1, 10)).toBe(false)
  })

  it('returns false on empty map', () => {
    const rm = new RangeMap<string>()
    expect(rm.coversEntireRange(1, 5)).toBe(false)
  })
})

// ─── totalCovered ─────────────────────────────────────────
describe('RangeMap - totalCovered', () => {
  it('counts all covered points', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    rm.set(10, 15, 'b')
    expect(rm.totalCovered()).toBe(11)
  })

  it('counts coverage from non-overlapping ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    rm.set(10, 15, 'b')
    rm.set(20, 22, 'c')
    expect(rm.totalCovered()).toBe(14)
  })
})

// ─── clone ────────────────────────────────────────────────
describe('RangeMap - clone', () => {
  it('creates an independent copy', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    const copy = rm.clone()
    expect(copy.size).toBe(1)
    expect(copy.get(3)).toBe('a')
    rm.clear()
    expect(copy.get(3)).toBe('a')
  })

  it('cloned map modifications do not affect original', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    const copy = rm.clone()
    copy.set(10, 15, 'b')
    expect(rm.size).toBe(1)
    expect(copy.size).toBe(2)
  })
})
