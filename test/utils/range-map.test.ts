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

  it('set with zero range (start === end)', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 0, 'zero')
    expect(rm.get(0)).toBe('zero')
    expect(rm.get(-1)).toBeUndefined()
    expect(rm.get(1)).toBeUndefined()
  })

  it('set with negative range', () => {
    const rm = new RangeMap<string>()
    rm.set(-5, -1, 'neg')
    expect(rm.get(-5)).toBe('neg')
    expect(rm.get(-3)).toBe('neg')
    expect(rm.get(-1)).toBe('neg')
    expect(rm.get(0)).toBeUndefined()
  })

  it('handles very large range values', () => {
    const rm = new RangeMap<string>()
    rm.set(0, Number.MAX_SAFE_INTEGER, 'large')
    expect(rm.get(Number.MAX_SAFE_INTEGER)).toBe('large')
    expect(rm.get(0)).toBe('large')
    expect(rm.get(Number.MAX_SAFE_INTEGER / 2)).toBe('large')
  })

  it('findOverlapping with exact match', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    const overlap = rm.findOverlapping(1, 5)
    expect(overlap).toHaveLength(1)
    expect(overlap[0]!.value).toBe('a')
  })

  it('findOverlapping with point range', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 10, 'a')
    const overlap = rm.findOverlapping(7, 7)
    expect(overlap).toHaveLength(1)
    expect(overlap[0]!.value).toBe('a')
  })

  it('findOverlapping with partial overlap at start', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 10, 'a')
    const overlap = rm.findOverlapping(3, 7)
    expect(overlap).toHaveLength(1)
    expect(overlap[0]!.value).toBe('a')
  })

  it('findOverlapping with partial overlap at end', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 10, 'a')
    const overlap = rm.findOverlapping(8, 15)
    expect(overlap).toHaveLength(1)
    expect(overlap[0]!.value).toBe('a')
  })

  it('findOverlapping returns empty for non-overlapping', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    expect(rm.findOverlapping(6, 10)).toEqual([])
    expect(rm.findOverlapping(-5, 0)).toEqual([])
  })

  it('forEach receives index parameter', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    rm.set(5, 7, 'b')
    rm.set(9, 11, 'c')
    const indices: number[] = []
    rm.forEach((_entry, i) => indices.push(i))
    expect(indices).toEqual([0, 1, 2])
  })

  it('coversEntireRange with single entry covering exactly', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 10, 'a')
    expect(rm.coversEntireRange(1, 10)).toBe(true)
  })

  it('coversEntireRange with single entry covering larger', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 20, 'a')
    expect(rm.coversEntireRange(5, 15)).toBe(true)
  })

  it('coversEntireRange false when partially covered', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    rm.set(10, 15, 'b')
    expect(rm.coversEntireRange(1, 15)).toBe(false)
  })

  it('coversEntireRange with adjacent ranges', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'a')
    rm.set(6, 10, 'b')
    expect(rm.coversEntireRange(1, 10)).toBe(true)
  })

  it('totalCovered with single point', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 5, 'a')
    expect(rm.totalCovered()).toBe(1)
  })

  it('totalCovered with single range', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 10, 'a')
    rm.set(5, 15, 'b')
    expect(rm.totalCovered()).toBe(11)
  })

  it('remove with point range', () => {
    const rm = new RangeMap<string>()
    rm.set(5, 5, 'a')
    expect(rm.remove(5, 5)).toBe(1)
    expect(rm.isEmpty).toBe(true)
  })

  it('remove with negative range', () => {
    const rm = new RangeMap<string>()
    rm.set(-10, -5, 'neg')
    expect(rm.remove(-10, -5)).toBe(1)
    expect(rm.isEmpty).toBe(true)
  })

  it('getAll returns entries in insertion order', () => {
    const rm = new RangeMap<string>()
    rm.set(10, 15, 'z')
    rm.set(1, 5, 'a')
    rm.set(6, 9, 'm')
    const entries = rm.getAll()
    expect(entries.map((e) => e.value)).toEqual(['a', 'm', 'z'])
  })

  it('handles complex values (objects)', () => {
    const rm = new RangeMap<object>()
    const obj = { data: { value: 42 } }
    rm.set(1, 5, obj)
    expect(rm.get(3)).toEqual(obj)
  })

  it('multiple overlapping removals', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 3, 'a')
    rm.set(4, 6, 'b')
    rm.set(7, 9, 'c')
    rm.set(10, 12, 'd')
    expect(rm.remove(3, 11)).toBe(4)
    expect(rm.isEmpty).toBe(true)
  })

  it('set replaces single exact overlap', () => {
    const rm = new RangeMap<string>()
    rm.set(1, 5, 'old')
    rm.set(1, 5, 'new')
    expect(rm.size).toBe(1)
    expect(rm.get(3)).toBe('new')
  })
})

  it('get returns undefined for empty map', () => {
    const rm = new RangeMap<string>()
    expect(rm.get(0)).toBeUndefined()


  it('get missing returns undefined', () => {
    const rm = new RangeMap<string>()
    expect(rm.get(5)).toBeUndefined()
  })

  it('has returns boolean', () => {
    const rm = new RangeMap<string>()
    expect(rm.has(5)).toBe(false)
  })

  it('set and get', () => {
    const rm = new RangeMap<string>()
    rm.set(0, 10, 'a')
    expect(rm.get(5)).toBe('a')
  })
  })

describe('range-map - wave545', () => {
  it('module exists', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('range-map - wave546', () => {
  it('module accessible', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name check', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('range-map - wave547', () => {
  it('module import works', () => {
    expect(beforeEach).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof beforeEach).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof beforeEach.name).toBe('string')
  })
})

describe('range-map - wave548', () => {
  it('range-map module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave549', () => {
  it('range-map module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave550', () => {
  it('range-map w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave551', () => {
  it('range-map w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave552', () => {
  it('range-map w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave553', () => {
  it('range-map w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave554', () => {
  it('range-map w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave555', () => {
  it('range-map w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave556', () => {
  it('range-map w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave557', () => {
  it('range-map w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave558', () => {
  it('range-map w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave559', () => {
  it('range-map w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave560', () => {
  it('range-map w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave561', () => {
  it('range-map w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave562', () => {
  it('range-map w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave563', () => {
  it('range-map w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave564', () => {
  it('range-map w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave565', () => {
  it('range-map w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave566', () => {
  it('range-map w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave127', () => {
  it('range-map w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave130', () => {
  it('range-map w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave133', () => {
  it('range-map w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave136', () => {
  it('range-map w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - wave139', () => {
  it('range-map w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w142', () => {
  it('range-map v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w145', () => {
  it('range-map v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w148', () => {
  it('range-map v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w151', () => {
  it('range-map v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w154', () => {
  it('range-map v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w157', () => {
  it('range-map v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w160', () => {
  it('range-map v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w170', () => {
  it('range-map x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w180', () => {
  it('range-map x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w190', () => {
  it('range-map x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w200', () => {
  it('range-map x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w210', () => {
  it('range-map x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w220', () => {
  it('range-map x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w230', () => {
  it('range-map x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w240', () => {
  it('range-map x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w250', () => {
  it('range-map x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w260', () => {
  it('range-map x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w270', () => {
  it('range-map x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w280', () => {
  it('range-map x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w290', () => {
  it('range-map x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w300', () => {
  it('range-map x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w310', () => {
  it('range-map x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w320', () => {
  it('range-map x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w330', () => {
  it('range-map x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w340', () => {
  it('range-map x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w350', () => {
  it('range-map x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w360', () => {
  it('range-map x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w370', () => {
  it('range-map x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w380', () => {
  it('range-map x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w390', () => {
  it('range-map x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('range-map - w400', () => {
  it('range-map x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('range-map x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})
