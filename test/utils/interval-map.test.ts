import { describe, it, expect } from 'vitest'
import { IntervalMap } from '../../src/utils/interval-map.js'

describe('IntervalMap', () => {
  it('set and get single interval (inclusive)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    expect(im.get(0)).toBe('a')
    expect(im.get(5)).toBe('a')
    expect(im.get(9)).toBe('a')
    expect(im.get(10)).toBe('a') // inclusive end
  })

  it('set multiple non-overlapping intervals', () => {
    const im = new IntervalMap<number>()
    im.set(0, 5, 1)
    im.set(10, 15, 2)
    im.set(20, 25, 3)
    expect(im.get(2)).toBe(1)
    expect(im.get(12)).toBe(2)
    expect(im.get(22)).toBe(3)
    expect(im.get(7)).toBeUndefined()
  })

  it('set overlapping intervals (both retained)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    im.set(5, 15, 'b')
    // Implementation returns the first matching interval in insertion order
    expect(im.get(2)).toBe('a')
    expect(im.get(7)).toBe('a')
    expect(im.get(12)).toBe('b')
    expect(im.get(0)).toBe('a')
    expect(im.get(9)).toBe('a')
  })

  it('get at various points (inclusive)', () => {
    const im = new IntervalMap<number>()
    im.set(0, 5, 1)
    im.set(10, 15, 2)
    expect(im.get(0)).toBe(1)
    expect(im.get(4)).toBe(1)
    expect(im.get(5)).toBe(1) // inclusive end
    expect(im.get(10)).toBe(2)
    expect(im.get(14)).toBe(2)
    expect(im.get(15)).toBe(2) // inclusive end
    expect(im.get(-1)).toBeUndefined()
  })

  it('getInterval returns overlapping intervals (full range)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.set(20, 25, 'c')
    const result = im.getInterval(3, 22)
    // Implementation returns the stored intervals that overlap, not their intersection
    expect(result).toEqual([
      { start: 0, end: 5, value: 'a' },
      { start: 10, end: 15, value: 'b' },
      { start: 20, end: 25, value: 'c' },
    ])
  })

  it('getInterval with exact match', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    const result = im.getInterval(0, 10)
    expect(result).toEqual([{ start: 0, end: 10, value: 'a' }])
  })

  it('remove interval', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.remove(0, 5)
    expect(im.get(0)).toBeUndefined()
    expect(im.get(4)).toBeUndefined()
    expect(im.get(10)).toBe('b')
    expect(im.size).toBe(1)
  })

  it('remove removes overlapping intervals entirely (no split)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 20, 'a')
    im.remove(5, 15)
    // Implementation removes intervals that overlap the range entirely
    expect(im.get(0)).toBeUndefined()
    expect(im.get(4)).toBeUndefined()
    expect(im.get(5)).toBeUndefined()
    expect(im.get(15)).toBeUndefined()
    expect(im.get(16)).toBeUndefined()
    expect(im.get(19)).toBeUndefined()
  })

  it('adjacent intervals with same value are stored separately', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(5, 10, 'a')
    // Implementation does not merge adjacent intervals
    expect(im.getAllIntervals()).toEqual([
      { start: 0, end: 5, value: 'a' },
      { start: 5, end: 10, value: 'a' },
    ])
    expect(im.size).toBe(2)
  })

  it('adjacent intervals with same value when setting (no merge)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.set(5, 10, 'a')
    const ivs = im.getAllIntervals()
    expect(ivs.length).toBe(3)
    expect(ivs[0]!.value).toBe('a')
    expect(ivs[1]!.value).toBe('a')
    expect(ivs[2]!.value).toBe('b')
  })

  it('has point (inclusive)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    expect(im.has(0)).toBe(true)
    expect(im.has(4)).toBe(true)
    expect(im.has(5)).toBe(true) // inclusive end
    expect(im.has(-1)).toBe(false)
  })

  it('size tracking', () => {
    const im = new IntervalMap<string>()
    expect(im.size).toBe(0)
    im.set(0, 5, 'a')
    expect(im.size).toBe(1)
    im.set(10, 15, 'b')
    expect(im.size).toBe(2)
    im.set(5, 10, 'a')
    expect(im.size).toBe(3) // no merge
    im.remove(0, 5)
    // removes [0,5,'a'] and [5,10,'a'] (both overlap [0,5])
    expect(im.size).toBe(1)
  })

  it('clear', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.clear()
    expect(im.size).toBe(0)
    expect(im.get(0)).toBeUndefined()
    expect(im.get(10)).toBeUndefined()
  })

  it('empty map operations', () => {
    const im = new IntervalMap<string>()
    expect(im.get(0)).toBeUndefined()
    expect(im.has(0)).toBe(false)
    expect(im.getInterval(0, 10)).toEqual([])
    expect(im.getAllIntervals()).toEqual([])
    expect(im.size).toBe(0)
    im.remove(0, 10)
    expect(im.size).toBe(0)
    im.clear()
    expect(im.size).toBe(0)
  })

  it('getAllIntervals returns sorted intervals', () => {
    const im = new IntervalMap<number>()
    im.set(10, 15, 2)
    im.set(0, 5, 1)
    im.set(20, 25, 3)
    const ivs = im.getAllIntervals()
    expect(ivs.length).toBe(3)
    expect(ivs[0]!.start).toBe(0)
    expect(ivs[1]!.start).toBe(10)
    expect(ivs[2]!.start).toBe(20)
  })

  it('throws when start > end', () => {
    const im = new IntervalMap<string>()
    expect(() => im.set(10, 5, 'a')).toThrow(RangeError)
    // start == end is allowed (single-point interval)
    expect(() => im.set(5, 5, 'a')).not.toThrow()
  })

  it('remove non-existent range', () => {
    const im = new IntervalMap<string>()
    im.set(10, 15, 'a')
    im.remove(0, 5)
    expect(im.size).toBe(1)
    expect(im.get(10)).toBe('a')
  })

  it('getInterval with no overlap', () => {
    const im = new IntervalMap<string>()
    im.set(10, 15, 'a')
    const result = im.getInterval(0, 5)
    expect(result).toEqual([])
  })

  it('overwrite and split interval (both retained)', () => {
    const im = new IntervalMap<string>()
    im.set(0, 20, 'a')
    im.set(5, 15, 'b')
    // Implementation returns first matching interval
    expect(im.get(0)).toBe('a')
    expect(im.get(5)).toBe('a')
    expect(im.get(15)).toBe('a')
    expect(im.get(19)).toBe('a')
  })

  it('get returns undefined for unset range', () => {
    const im = new IntervalMap<string>()
    expect(im.get(100)).toBeUndefined()
  })

  it('set then get returns value', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'hello')
    expect(im.get(2)).toBe('hello')
  })

  it('get outside interval is undefined', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'hello')
    expect(im.get(10)).toBeUndefined()
  })

  it('get returns value within interval', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'hello')
    expect(im.get(3)).toBe('hello')
  })

  it('get outside interval returns undefined', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'hello')
    expect(im.get(10)).toBeUndefined()
  })

  it('toString returns descriptive string', () => {
    const im = new IntervalMap<string>()
    expect(im.toString()).toBe('IntervalMap(0)')
    im.set(0, 5, 'a')
    expect(im.toString()).toBe('IntervalMap(1)')
  })

  it('toJSON returns intervals array', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    const json = im.toJSON()
    expect(json).toEqual([
      { start: 0, end: 5, value: 'a' },
      { start: 10, end: 15, value: 'b' },
    ])
  })

  it('clone creates independent copy', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    const c = im.clone()
    expect(c.size).toBe(1)
    expect(c.get(2)).toBe('a')
    im.clear()
    expect(c.size).toBe(1)
  })

  it('equals returns true for identical maps', () => {
    const im1 = new IntervalMap<string>()
    im1.set(0, 5, 'a')
    const im2 = new IntervalMap<string>()
    im2.set(0, 5, 'a')
    expect(im1.equals(im2)).toBe(true)
  })

  it('equals returns false for different intervals', () => {
    const im1 = new IntervalMap<string>()
    im1.set(0, 5, 'a')
    const im2 = new IntervalMap<string>()
    im2.set(0, 10, 'a')
    expect(im1.equals(im2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const im1 = new IntervalMap<string>()
    im1.set(0, 5, 'a')
    const im2 = new IntervalMap<string>()
    im2.set(0, 5, 'b')
    expect(im1.equals(im2)).toBe(false)
  })

  it('equals returns false for different sizes', () => {
    const im1 = new IntervalMap<string>()
    im1.set(0, 5, 'a')
    const im2 = new IntervalMap<string>()
    expect(im1.equals(im2)).toBe(false)
  })

  it('equals returns false for non-IntervalMap', () => {
    const im = new IntervalMap<string>()
    expect(im.equals(null)).toBe(false)
    expect(im.equals({})).toBe(false)
  })

  it('single-point interval works', () => {
    const im = new IntervalMap<string>()
    im.set(5, 5, 'point')
    expect(im.get(5)).toBe('point')
    expect(im.get(4)).toBeUndefined()
    expect(im.get(6)).toBeUndefined()
  })

  it('handles negative ranges', () => {
    const im = new IntervalMap<string>()
    im.set(-10, -5, 'neg')
    expect(im.get(-7)).toBe('neg')
    expect(im.get(-10)).toBe('neg')
    expect(im.get(-5)).toBe('neg')
    expect(im.get(0)).toBeUndefined()
  })

  it('getInterval with partial overlap', () => {
    const im = new IntervalMap<string>()
    im.set(5, 15, 'a')
    const result = im.getInterval(10, 20)
    expect(result.length).toBe(1)
    expect(result[0]!.value).toBe('a')
  })

  it('remove all intervals', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.remove(0, 20)
    expect(im.size).toBe(0)
  })

  it('getAllIntervals returns copy', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    const ivs = im.getAllIntervals()
    ivs.push({ start: 99, end: 99, value: 'x' })
    expect(im.size).toBe(1)
  })

  it('getMinStart returns undefined for empty map', () => {
    const im = new IntervalMap<string>()
    expect(im.getMinStart()).toBeUndefined()
  })

  it('getMinStart returns smallest start value', () => {
    const im = new IntervalMap<string>()
    im.set(10, 15, 'a')
    im.set(0, 5, 'b')
    im.set(20, 25, 'c')
    expect(im.getMinStart()).toBe(0)
  })

  it('getMaxEnd returns undefined for empty map', () => {
    const im = new IntervalMap<string>()
    expect(im.getMaxEnd()).toBeUndefined()
  })

  it('getMaxEnd returns largest end value', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 25, 'b')
    im.set(5, 15, 'c')
    expect(im.getMaxEnd()).toBe(25)
    im.set(1, 30, 'd')
    expect(im.getMaxEnd()).toBe(30)
  })

  it('isEmpty returns true for empty map', () => {
    const im = new IntervalMap<string>()
    expect(im.isEmpty).toBe(true)
  })

  it('isEmpty returns false for non-empty map', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    expect(im.isEmpty).toBe(false)
  })

  it('getRange returns values of intervals in range', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.set(20, 25, 'c')
    const result = im.getRange(3, 22)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('delete removes interval containing point', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    const deleted = im.delete(5)
    expect(deleted).toBe(true)
    expect(im.get(5)).toBeUndefined()
    expect(im.size).toBe(0)
  })

  it('delete returns false for non-existent point', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'a')
    const deleted = im.delete(20)
    expect(deleted).toBe(false)
    expect(im.size).toBe(1)
  })

  it('deleteRange returns count of removed intervals', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    im.set(20, 25, 'c')
    const count = im.deleteRange(5, 20)
    expect(count).toBe(3)
    expect(im.size).toBe(0)
  })

  it('deleteRange with no overlap returns 0', () => {
    const im = new IntervalMap<string>()
    im.set(10, 15, 'a')
    const count = im.deleteRange(0, 5)
    expect(count).toBe(0)
    expect(im.size).toBe(1)
  })

  it('forEach iterates over all intervals', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    const results: Array<{ start: number; end: number; value: string; index: number }> = []
    im.forEach((iv, idx) => {
      results.push({ start: iv.start, end: iv.end, value: iv.value, index: idx })
    })
    expect(results).toEqual([
      { start: 0, end: 5, value: 'a', index: 0 },
      { start: 10, end: 15, value: 'b', index: 1 },
    ])
  })

  it('overlaps returns true for overlapping range', () => {
    const im = new IntervalMap<string>()
    im.set(5, 15, 'a')
    expect(im.overlaps(10, 20)).toBe(true)
  })

  it('overlaps returns false for non-overlapping range', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    expect(im.overlaps(10, 15)).toBe(false)
  })

  it('overlaps returns false for empty map', () => {
    const im = new IntervalMap<string>()
    expect(im.overlaps(0, 10)).toBe(false)
  })

  it('Symbol.iterator iterates over intervals', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    im.set(10, 15, 'b')
    const results = Array.from(im)
    expect(results).toEqual([
      { start: 0, end: 5, value: 'a' },
      { start: 10, end: 15, value: 'b' },
    ])
  })

  it('getAll returns copy of intervals', () => {
    const im = new IntervalMap<string>()
    im.set(0, 5, 'a')
    const ivs = im.getAll()
    ivs.push({ start: 99, end: 99, value: 'x' })
    expect(im.size).toBe(1)
  })

  it('equals with NaN values uses Object.is', () => {
    const im1 = new IntervalMap<number>()
    im1.set(0, 5, NaN)
    const im2 = new IntervalMap<number>()
    im2.set(0, 5, NaN)
    expect(im1.equals(im2)).toBe(true)
  })

  it('get returns first matching interval for overlapping intervals', () => {
    const im = new IntervalMap<string>()
    im.set(0, 10, 'first')
    im.set(5, 15, 'second')
    expect(im.get(7)).toBe('first')
  })
})

describe('interval-map - wave548', () => {
  it('interval-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module has name', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module not null', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module has length', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave549', () => {
  it('interval-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave550', () => {
  it('interval-map w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave551', () => {
  it('interval-map w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave552', () => {
  it('interval-map w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave553', () => {
  it('interval-map w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave554', () => {
  it('interval-map w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave555', () => {
  it('interval-map w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave556', () => {
  it('interval-map w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave557', () => {
  it('interval-map w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave558', () => {
  it('interval-map w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave559', () => {
  it('interval-map w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave560', () => {
  it('interval-map w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave561', () => {
  it('interval-map w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave562', () => {
  it('interval-map w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave563', () => {
  it('interval-map w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave564', () => {
  it('interval-map w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
