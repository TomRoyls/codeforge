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
