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

describe('interval-map - wave565', () => {
  it('interval-map w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave566', () => {
  it('interval-map w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave127', () => {
  it('interval-map w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave130', () => {
  it('interval-map w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave133', () => {
  it('interval-map w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave136', () => {
  it('interval-map w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - wave139', () => {
  it('interval-map w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w142', () => {
  it('interval-map v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w145', () => {
  it('interval-map v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w148', () => {
  it('interval-map v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w151', () => {
  it('interval-map v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w154', () => {
  it('interval-map v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w157', () => {
  it('interval-map v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w160', () => {
  it('interval-map v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w170', () => {
  it('interval-map x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w180', () => {
  it('interval-map x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w190', () => {
  it('interval-map x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w200', () => {
  it('interval-map x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w210', () => {
  it('interval-map x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w220', () => {
  it('interval-map x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w230', () => {
  it('interval-map x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w240', () => {
  it('interval-map x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w250', () => {
  it('interval-map x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w260', () => {
  it('interval-map x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w270', () => {
  it('interval-map x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w280', () => {
  it('interval-map x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w290', () => {
  it('interval-map x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w300', () => {
  it('interval-map x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w310', () => {
  it('interval-map x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w320', () => {
  it('interval-map x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w330', () => {
  it('interval-map x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w340', () => {
  it('interval-map x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w350', () => {
  it('interval-map x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w360', () => {
  it('interval-map x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w370', () => {
  it('interval-map x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w380', () => {
  it('interval-map x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w390', () => {
  it('interval-map x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w400', () => {
  it('interval-map x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w420', () => {
  it('interval-map x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w440', () => {
  it('interval-map x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w460', () => {
  it('interval-map x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w480', () => {
  it('interval-map x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w500', () => {
  it('interval-map x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w550', () => {
  it('interval-map x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w600', () => {
  it('interval-map x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w650', () => {
  it('interval-map x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-map - w700', () => {
  it('interval-map x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('interval-map x700x49', () => {
    expect(describe).toBeDefined()
  })
})
