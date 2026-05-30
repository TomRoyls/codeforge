import { describe, expect, it } from 'vitest'
import { DisjointIntervalMap } from '../../../src/utils/disjoint-interval-map.js'

describe('DisjointIntervalMap', () => {
  it('creates empty map', () => {
    const map = new DisjointIntervalMap<string>()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('sets and gets single interval', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    expect(map.get(3)).toBe('a')
  })

  it('returns undefined for points outside intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    expect(map.get(0)).toBeUndefined()
    expect(map.get(6)).toBeUndefined()
  })

  it('checks if point exists', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    expect(map.has(3)).toBe(true)
    expect(map.has(10)).toBe(false)
  })

  it('gets interval containing point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const interval = map.getInterval(3)
    expect(interval).toEqual({ lo: 1, hi: 5, value: 'a' })
  })

  it('returns undefined for getInterval when point not found', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    expect(map.getInterval(10)).toBeUndefined()
  })

  it('deletes interval by range', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const count = map.delete(1, 5)
    expect(count).toBe(1)
    expect(map.get(3)).toBeUndefined()
  })

  it('deletes multiple intervals by range', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const count = map.delete(0, 20)
    expect(count).toBe(2)
    expect(map.size).toBe(0)
  })

  it('deletes point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const deleted = map.deletePoint(3)
    expect(deleted).toBe(true)
    expect(map.get(3)).toBeUndefined()
  })

  it('deletePoint returns false when point not found', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const deleted = map.deletePoint(10)
    expect(deleted).toBe(false)
  })

  it('removes overlapping intervals on set', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(3, 7, 'b')
    expect(map.get(2)).toBeUndefined()
    expect(map.get(4)).toBe('b')
    expect(map.get(6)).toBe('b')
  })

  it('splits interval around point', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.split(3)
    expect(map.get(2)).toBe('a')
    expect(map.get(3)).toBeUndefined()
    expect(map.get(4)).toBe('a')
  })

  it('split does nothing when point not in interval', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.split(10)
    expect(map.get(3)).toBe('a')
  })

  it('merges two maps', () => {
    const map1 = new DisjointIntervalMap<string>()
    const map2 = new DisjointIntervalMap<string>()
    map1.set(1, 5, 'a')
    map2.set(10, 15, 'b')
    map1.merge(map2)
    expect(map1.get(3)).toBe('a')
    expect(map1.get(12)).toBe('b')
  })

  it('merge handles overlapping intervals', () => {
    const map1 = new DisjointIntervalMap<string>()
    const map2 = new DisjointIntervalMap<string>()
    map1.set(1, 5, 'a')
    map2.set(3, 7, 'b')
    map1.merge(map2)
    expect(map1.get(4)).toBe('b')
  })

  it('returns correct size', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    expect(map.size).toBe(2)
  })

  it('clears all intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('gets all intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const all = map.getAll()
    expect(all).toHaveLength(2)
    expect(all[0]).toEqual({ lo: 1, hi: 5, value: 'a' })
    expect(all[1]).toEqual({ lo: 10, hi: 15, value: 'b' })
  })

  it('calculates total covered points', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    expect(map.totalCovered()).toBe(11)
  })

  it('checks if point is covered', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    expect(map.covers(3)).toBe(true)
    expect(map.covers(10)).toBe(false)
  })

  it('checks if range is fully covered', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    expect(map.coversRange(2, 4)).toBe(true)
    expect(map.coversRange(4, 6)).toBe(false)
  })

  it('finds overlapping intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const overlapping = map.findOverlapping(3, 12)
    expect(overlapping).toHaveLength(2)
  })

  it('iterates with forEach', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(10, 15, 'b')
    const results: Array<[number, number, string]> = []
    map.forEach((lo, hi, value) => {
      results.push([lo, hi, value])
    })
    expect(results).toEqual([
      [1, 5, 'a'],
      [10, 15, 'b'],
    ])
  })

  it('clones map', () => {
    const map1 = new DisjointIntervalMap<string>()
    map1.set(1, 5, 'a')
    const map2 = map1.clone()
    expect(map2.get(3)).toBe('a')
    map1.clear()
    expect(map2.get(3)).toBe('a')
  })

  it('handles single point interval', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(5, 5, 'single')
    expect(map.get(5)).toBe('single')
    expect(map.get(4)).toBeUndefined()
  })

  it('handles negative numbers', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(-5, -1, 'negative')
    expect(map.get(-3)).toBe('negative')
  })

  it('handles adjacent intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(6, 10, 'b')
    expect(map.get(5)).toBe('a')
    expect(map.get(6)).toBe('b')
  })

  it('throws RangeError when lo > hi', () => {
    const map = new DisjointIntervalMap<string>()
    expect(() => map.set(10, 5, 'a')).toThrow(RangeError)
  })

  it('allows lo equal to hi', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(5, 5, 'a')
    expect(map.get(5)).toBe('a')
  })

  it('returns 0 when deleting non-existent range', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const count = map.delete(10, 20)
    expect(count).toBe(0)
  })

  it('handles empty range delete', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    const count = map.delete(10, 10)
    expect(count).toBe(0)
  })

  it('split on single point interval does nothing', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(5, 5, 'single')
    map.split(5)
    expect(map.get(5)).toBe('single')
  })

  it('handles large intervals', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 1000000, 'large')
    expect(map.get(500000)).toBe('large')
  })

  it('multiple consecutive sets maintain latest value', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(6, 10, 'b')
    map.set(11, 15, 'c')
    expect(map.get(3)).toBe('a')
    expect(map.get(8)).toBe('b')
    expect(map.get(13)).toBe('c')
  })

  it('set with exact overlap replaces old interval', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(1, 5, 'a')
    map.set(1, 5, 'b')
    expect(map.get(3)).toBe('b')
    expect(map.size).toBe(1)
  })

  it('set that fully contains existing interval replaces it', () => {
    const map = new DisjointIntervalMap<string>()
    map.set(3, 7, 'a')
    map.set(1, 10, 'b')
    expect(map.get(5)).toBe('b')
    expect(map.size).toBe(1)
  })
})