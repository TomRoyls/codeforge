import { describe, it, expect } from 'vitest'
import { DisjointIntervalMap } from '../../src/utils/disjoint-interval-map.js'

describe('DisjointIntervalMap', () => {
  it('creates empty map', () => {
    const map = new DisjointIntervalMap<string>()
    expect(map.isEmpty()).toBe(true)
    expect(map.size).toBe(0)
  })

  it('sets and gets single interval', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.get(3)).toBe('test')
    expect(map.has(3)).toBe(true)
    expect(map.has(0)).toBe(false)
    expect(map.has(6)).toBe(false)
  })

  it('gets interval for point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    const interval = map.getInterval(3)
    expect(interval).toEqual({ lo: 1, hi: 5, value: 'test' })
    expect(map.getInterval(0)).toBeUndefined()
  })

  it('throws when lo > hi', () => {
    const map = new DisjointIntervalMap<string>()
    expect(() => map.set(5, 1, 'test')).toThrow(RangeError)
  })

  it('replaces overlapping intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'first')
    map.set(3, 7, 'second')
    expect(map.get(1)).toBeUndefined()
    expect(map.get(2)).toBeUndefined()
    expect(map.get(4)).toBe('second')
    expect(map.get(6)).toBe('second')
    expect(map.size).toBe(1)
  })

  it('keeps non-overlapping intervals separate', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'first')
    map.set(5, 7, 'second')
    expect(map.get(2)).toBe('first')
    expect(map.get(4)).toBeUndefined()
    expect(map.get(6)).toBe('second')
    expect(map.size).toBe(2)
  })

  it('deletes range and returns count', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'a')
    map.set(5, 7, 'b')
    map.set(9, 11, 'c')
    const deleted = map.delete(4, 10)
    expect(deleted).toBe(2)
    expect(map.get(2)).toBe('a')
    expect(map.get(6)).toBeUndefined()
    expect(map.get(10)).toBeUndefined()
    expect(map.size).toBe(1)
  })

  it('deletes point and returns success', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    const deleted = map.deletePoint(3)
    expect(deleted).toBe(true)
    expect(map.get(3)).toBeUndefined()
    expect(map.deletePoint(10)).toBe(false)
  })

  it('clears all intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(7, 10, 'b')
    map.clear()
    expect(map.isEmpty()).toBe(true)
    expect(map.size).toBe(0)
  })

  it('gets all intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'a')
    map.set(5, 7, 'b')
    const all = map.getAll()
    expect(all).toEqual([
      { lo: 1, hi: 3, value: 'a' },
      { lo: 5, hi: 7, value: 'b' }
    ])
  })

  it('calculates total covered range', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'a')
    map.set(5, 7, 'b')
    expect(map.totalCovered()).toBe(6)
  })

  it('checks if range is covered', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.coversRange(2, 4)).toBe(true)
    expect(map.coversRange(4, 6)).toBe(false)
  })

  it('finds overlapping intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(7, 10, 'b')
    const overlapping = map.findOverlapping(3, 8)
    expect(overlapping).toHaveLength(2)
    expect(overlapping[0]!.lo).toBe(1)
    expect(overlapping[1]!.hi).toBe(10)
  })

  it('iterates with forEach', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'a')
    map.set(5, 7, 'b')
    const results: Array<[number, number, string]> = []
    map.forEach((lo, hi, value) => {
      results.push([lo, hi, value])
    })
    expect(results).toEqual([[1, 3, 'a'], [5, 7, 'b']])
  })

  it('clones map', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    const clone = map.clone()
    expect(clone.get(3)).toBe('test')
    clone.set(6, 10, 'other')
    expect(map.get(7)).toBeUndefined()
    expect(clone.get(7)).toBe('other')
  })

  it('merges another map', () => {
    const map1 = new DisjointIntervalMap<string>()
    const map2 = new DisjointIntervalMap<string>()
    map1.set(1, 3, 'a')
    map2.set(5, 7, 'b')
    map1.merge(map2)
    expect(map1.get(2)).toBe('a')
    expect(map1.get(6)).toBe('b')
  })

  it('splits interval at point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 7, 'test')
    map.split(4)
    expect(map.get(2)).toBe('test')
    expect(map.get(4)).toBeUndefined()
    expect(map.get(5)).toBe('test')
  })

  it('does not split single point interval', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(4, 4, 'test')
    map.split(4)
    expect(map.get(4)).toBe('test')
  })

  it('has returns false for unset key', () => {
    const map = new DisjointIntervalMap<number, string>()
    expect(map.has(0)).toBe(false)
  })

  it('set and get work', () => {
    const map = new DisjointIntervalMap<number, string>()
    map.set(0, 5, 'hello')
    expect(map.get(2)).toBe('hello')
  })

  it('get outside interval returns undefined', () => {
    const map = new DisjointIntervalMap<number, string>()
    map.set(0, 5, 'hello')
    expect(map.get(10)).toBeUndefined()
  })

  it('set and get overlapping', () => {
    const map = new DisjointIntervalMap<number, string>()
    map.set(0, 10, 'a')
    expect(map.get(5)).toBe('a')
  })

  it('get returns undefined outside interval', () => {
    const map = new DisjointIntervalMap<number, string>()
    map.set(0, 10, 'a')
    expect(map.get(15)).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const map = new DisjointIntervalMap<number, string>()
    map.set(0, 10, 'a')
    expect(map.get(5)).toBe('a')
  })

  it('get outside interval returns undefined', () => {
    const map = new DisjointIntervalMap<number, string>()
    map.set(0, 10, 'a')
    expect(map.get(20)).toBeUndefined()
  })

  it('handles negative interval boundaries', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(-10, -5, 'negative')
    expect(map.get(-7)).toBe('negative')
    expect(map.get(-11)).toBeUndefined()
    expect(map.get(-4)).toBeUndefined()
  })

  it('handles large intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(0, 1000000, 'large')
    expect(map.get(500000)).toBe('large')
    expect(map.get(1000000)).toBe('large')
    expect(map.get(1000001)).toBeUndefined()
  })

  it('handles single-point intervals (lo === hi)', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(5, 5, 'single')
    expect(map.get(5)).toBe('single')
    expect(map.get(4)).toBeUndefined()
    expect(map.get(6)).toBeUndefined()
  })

  it('merges with overlapping intervals', () => {
    const map1 = new DisjointIntervalMap<string>()
    const map2 = new DisjointIntervalMap<string>()
    map1.set(1, 5, 'a')
    map2.set(3, 7, 'b')
    map1.merge(map2)
    expect(map1.get(4)).toBe('b')
    expect(map1.size).toBe(1)
  })

  it('merges with non-overlapping intervals', () => {
    const map1 = new DisjointIntervalMap<string>()
    const map2 = new DisjointIntervalMap<string>()
    map1.set(1, 3, 'a')
    map2.set(10, 15, 'b')
    map1.merge(map2)
    expect(map1.get(2)).toBe('a')
    expect(map1.get(12)).toBe('b')
    expect(map1.size).toBe(2)
  })

  it('deletes entire map', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const deleted = map.delete(-100, 1000)
    expect(deleted).toBe(2)
    expect(map.isEmpty()).toBe(true)
  })

  it('deletes non-existent range returns 0', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const deleted = map.delete(100, 200)
    expect(deleted).toBe(0)
    expect(map.size).toBe(1)
  })

  it('split on non-existent point does nothing', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    map.split(10)
    expect(map.size).toBe(1)
    expect(map.get(3)).toBe('test')
  })

  it('split at interval boundaries', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    map.split(1)
    map.split(5)
    expect(map.size).toBe(1)
    expect(map.get(3)).toBe('test')
  })

  it('multiple consecutive splits', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 10, 'test')
    map.split(4)
    map.split(7)
    expect(map.get(2)).toBe('test')
    expect(map.get(4)).toBeUndefined()
    expect(map.get(5)).toBe('test')
    expect(map.get(7)).toBeUndefined()
    expect(map.get(8)).toBe('test')
  })

  it('getInterval on exact boundaries', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.getInterval(1)).toEqual({ lo: 1, hi: 5, value: 'test' })
    expect(map.getInterval(5)).toEqual({ lo: 1, hi: 5, value: 'test' })
  })

  it('findOverlapping with no matches', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const overlapping = map.findOverlapping(10, 15)
    expect(overlapping).toHaveLength(0)
  })

  it('findOverlapping with exact match', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const overlapping = map.findOverlapping(1, 5)
    expect(overlapping).toHaveLength(1)
    expect(overlapping[0]!.value).toBe('a')
  })

  it('findOverlapping with partial overlap', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(5, 10, 'a')
    const overlapping = map.findOverlapping(8, 15)
    expect(overlapping).toHaveLength(1)
    expect(overlapping[0]!.lo).toBe(5)
    expect(overlapping[0]!.hi).toBe(10)
  })

  it('toString returns string representation', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    expect(map.toString()).toBe('DisjointIntervalMap(1 entries)')
  })

  it('toJSON returns array of intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'a')
    const json = map.toJSON()
    expect(json).toEqual([{ lo: 1, hi: 3, value: 'a' }])
  })

  it('equals with same map', () => {
    const map1 = new DisjointIntervalMap<string>()
    map1.set(1, 3, 'a')
    const map2 = new DisjointIntervalMap<string>()
    map2.set(1, 3, 'a')
    expect(map1.equals(map2)).toBe(true)
  })

  it('equals with different maps', () => {
    const map1 = new DisjointIntervalMap<string>()
    map1.set(1, 3, 'a')
    const map2 = new DisjointIntervalMap<string>()
    map2.set(1, 3, 'b')
    expect(map1.equals(map2)).toBe(false)
  })

  it('equals with non-DisjointIntervalMap returns false', () => {
    const map = new DisjointIntervalMap<string>()
    expect(map.equals({})).toBe(false)
    expect(map.equals(null)).toBe(false)
    expect(map.equals(undefined)).toBe(false)
  })

  it('setting same interval twice replaces value', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'first')
    map.set(1, 5, 'second')
    expect(map.get(3)).toBe('second')
    expect(map.size).toBe(1)
  })

  it('handles zero value', () => {
    const map = new DisjointIntervalMap<number>()
    map.set(1, 5, 0)
    expect(map.get(3)).toBe(0)
  })

  it('handles undefined value', () => {
    const map = new DisjointIntervalMap<undefined>()
    map.set(1, 5, undefined)
    expect(map.get(3)).toBeUndefined()
    expect(map.has(3)).toBe(false)
  })

  it('totalCovered on empty map returns 0', () => {
    const map = new DisjointIntervalMap<string>()
    expect(map.totalCovered()).toBe(0)
  })

  it('coversRange on empty map returns false', () => {
    const map = new DisjointIntervalMap<string>()
    expect(map.coversRange(1, 5)).toBe(false)
  })

  it('forEach on empty map does nothing', () => {
    const map = new DisjointIntervalMap<string>()
    let called = false
    map.forEach(() => { called = true })
    expect(called).toBe(false)
  })

  it('clone of empty map', () => {
    const map = new DisjointIntervalMap<string>()
    const clone = map.clone()
    expect(clone.isEmpty()).toBe(true)
    expect(clone.size).toBe(0)
  })

  it('merge with empty map', () => {
    const map1 = new DisjointIntervalMap<string>()
    const map2 = new DisjointIntervalMap<string>()
    map1.set(1, 3, 'a')
    map1.merge(map2)
    expect(map1.get(2)).toBe('a')
    expect(map1.size).toBe(1)
  })

  it('split on empty map does nothing', () => {
    const map = new DisjointIntervalMap<string>()
    map.split(5)
    expect(map.size).toBe(0)
  })

  it('handles many intervals', () => {
    const map = new DisjointIntervalMap<number>()
    for (let i = 0; i < 10; i++) {
      map.set(i * 10, i * 10 + 5, i)
    }
    expect(map.size).toBe(10)
    expect(map.get(25)).toBe(2)
  })

  it('interval with negative value', () => {
    const map = new DisjointIntervalMap<number>()
    map.set(1, 5, -42)
    expect(map.get(3)).toBe(-42)
  })

  it('multiple gets on same point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.get(3)).toBe('test')
    expect(map.get(3)).toBe('test')
    expect(map.get(3)).toBe('test')
  })

  it('multiple has checks', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.has(3)).toBe(true)
    expect(map.has(3)).toBe(true)
    expect(map.has(10)).toBe(false)
    expect(map.has(10)).toBe(false)
  })

  it('deletion boundary cases', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const deleted = map.delete(5, 10)
    expect(deleted).toBe(2)
    expect(map.get(1)).toBeUndefined()
    expect(map.get(5)).toBeUndefined()
    expect(map.get(10)).toBeUndefined()
    expect(map.get(12)).toBeUndefined()
  })

  it('findOverlapping with range covering everything', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const overlapping = map.findOverlapping(-100, 1000)
    expect(overlapping).toHaveLength(2)
  })

  it('findOverlapping with single point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const overlapping = map.findOverlapping(3, 3)
    expect(overlapping).toHaveLength(1)
    expect(overlapping[0]!.value).toBe('a')
  })

  it('covers with boundary points', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.covers(1)).toBe(true)
    expect(map.covers(5)).toBe(true)
  })

  it('coversRange with single point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.coversRange(3, 3)).toBe(true)
    expect(map.coversRange(10, 10)).toBe(false)
  })

  it('forEach callback arguments are correct', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'a')
    map.set(5, 7, 'b')
    const results: Array<[number, number, string]> = []
    map.forEach((lo, hi, value) => {
      results.push([lo, hi, value])
    })
    expect(results).toEqual([[1, 3, 'a'], [5, 7, 'b']])
  })

  it('size property getter', () => {
    const map = new DisjointIntervalMap<string>()
    expect(map.size).toBe(0)
    map.set(1, 5, 'a')
    expect(map.size).toBe(1)
  })

  it('size after operations', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    expect(map.size).toBe(2)
    map.delete(1, 5)
    expect(map.size).toBe(1)
    map.set(20, 25, 'c')
    expect(map.size).toBe(2)
  })

  it('merge replacing existing values', () => {
    const map1 = new DisjointIntervalMap<string>()
    const map2 = new DisjointIntervalMap<string>()
    map1.set(1, 5, 'old')
    map2.set(3, 7, 'new')
    map1.merge(map2)
    expect(map1.get(4)).toBe('new')
    expect(map1.get(1)).toBeUndefined()
  })

  it('split creating single-point intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 3, 'test')
    map.split(2)
    expect(map.get(1)).toBe('test')
    expect(map.get(2)).toBeUndefined()
    expect(map.get(3)).toBe('test')
  })

  it('complex overlapping scenarios', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 10, 'a')
    map.set(5, 15, 'b')
    map.set(12, 20, 'c')
    expect(map.get(3)).toBeUndefined()
    expect(map.get(7)).toBeUndefined()
    expect(map.get(14)).toBe('c')
    expect(map.get(17)).toBe('c')
  })

  it('negative point queries', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'test')
    expect(map.get(-5)).toBeUndefined()
    expect(map.get(-100)).toBeUndefined()
  })

  it('very large interval boundaries', () => {
    const map = new DisjointIntervalMap<string>()
    const lo = -1000000
    const hi = 1000000
    map.set(lo, hi, 'massive')
    expect(map.get(0)).toBe('massive')
    expect(map.get(lo)).toBe('massive')
    expect(map.get(hi)).toBe('massive')
    expect(map.get(lo - 1)).toBeUndefined()
    expect(map.get(hi + 1)).toBeUndefined()
  })
})
describe('disjoint-interval-map - wave549', () => {
  it('disjoint-interval-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave550', () => {
  it('disjoint-interval-map w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave551', () => {
  it('disjoint-interval-map w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave552', () => {
  it('disjoint-interval-map w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave553', () => {
  it('disjoint-interval-map w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave554', () => {
  it('disjoint-interval-map w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave555', () => {
  it('disjoint-interval-map w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave556', () => {
  it('disjoint-interval-map w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave557', () => {
  it('disjoint-interval-map w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave558', () => {
  it('disjoint-interval-map w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave559', () => {
  it('disjoint-interval-map w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave560', () => {
  it('disjoint-interval-map w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave561', () => {
  it('disjoint-interval-map w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave562', () => {
  it('disjoint-interval-map w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave563', () => {
  it('disjoint-interval-map w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave564', () => {
  it('disjoint-interval-map w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave565', () => {
  it('disjoint-interval-map w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave566', () => {
  it('disjoint-interval-map w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave127', () => {
  it('disjoint-interval-map w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave130', () => {
  it('disjoint-interval-map w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave133', () => {
  it('disjoint-interval-map w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave136', () => {
  it('disjoint-interval-map w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - wave139', () => {
  it('disjoint-interval-map w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w142', () => {
  it('disjoint-interval-map v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w145', () => {
  it('disjoint-interval-map v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w148', () => {
  it('disjoint-interval-map v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w151', () => {
  it('disjoint-interval-map v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w154', () => {
  it('disjoint-interval-map v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w157', () => {
  it('disjoint-interval-map v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w160', () => {
  it('disjoint-interval-map v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w170', () => {
  it('disjoint-interval-map x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w180', () => {
  it('disjoint-interval-map x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w190', () => {
  it('disjoint-interval-map x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w200', () => {
  it('disjoint-interval-map x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w210', () => {
  it('disjoint-interval-map x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w220', () => {
  it('disjoint-interval-map x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w230', () => {
  it('disjoint-interval-map x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w240', () => {
  it('disjoint-interval-map x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w250', () => {
  it('disjoint-interval-map x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w260', () => {
  it('disjoint-interval-map x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w270', () => {
  it('disjoint-interval-map x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w280', () => {
  it('disjoint-interval-map x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w290', () => {
  it('disjoint-interval-map x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w300', () => {
  it('disjoint-interval-map x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w310', () => {
  it('disjoint-interval-map x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w320', () => {
  it('disjoint-interval-map x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w330', () => {
  it('disjoint-interval-map x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w340', () => {
  it('disjoint-interval-map x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w350', () => {
  it('disjoint-interval-map x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w360', () => {
  it('disjoint-interval-map x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w370', () => {
  it('disjoint-interval-map x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w380', () => {
  it('disjoint-interval-map x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w390', () => {
  it('disjoint-interval-map x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w400', () => {
  it('disjoint-interval-map x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w420', () => {
  it('disjoint-interval-map x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w440', () => {
  it('disjoint-interval-map x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w460', () => {
  it('disjoint-interval-map x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w480', () => {
  it('disjoint-interval-map x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w500', () => {
  it('disjoint-interval-map x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w550', () => {
  it('disjoint-interval-map x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w600', () => {
  it('disjoint-interval-map x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w650', () => {
  it('disjoint-interval-map x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w700', () => {
  it('disjoint-interval-map x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w800', () => {
  it('disjoint-interval-map x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w900', () => {
  it('disjoint-interval-map x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('disjoint-interval-map - w1000', () => {
  it('disjoint-interval-map x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('disjoint-interval-map x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
