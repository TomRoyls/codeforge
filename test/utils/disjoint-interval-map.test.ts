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
})