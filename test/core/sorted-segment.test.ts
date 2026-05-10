import { describe, it, expect } from 'vitest'
import { SortedSegment } from '../../src/core/sorted-segment/sorted-segment.js'

describe('SortedSegment', () => {
  describe('constructor', () => {
    it('creates empty segment with default options', () => {
      const ss = new SortedSegment()
      expect(ss.size).toBe(0)
      expect(ss.isEmpty).toBe(true)
      expect(ss.segmentCount).toBe(0)
    })

    it('accepts custom segmentCapacity', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 10; i++) ss.insert(i)
      expect(ss.segmentCount).toBeGreaterThanOrEqual(2)
    })

    it('accepts custom comparator', () => {
      const ss = new SortedSegment({
        comparator: (a, b) => b - a,
      })
      ss.insert(1)
      ss.insert(3)
      ss.insert(2)
      expect(ss.toArray()).toEqual([3, 2, 1])
    })

    it('accepts empty options object', () => {
      const ss = new SortedSegment({})
      ss.insert(5)
      expect(ss.size).toBe(1)
    })

    it('uses default capacity of 64', () => {
      const ss = new SortedSegment()
      for (let i = 0; i < 64; i++) ss.insert(i)
      expect(ss.segmentCount).toBe(1)
      ss.insert(100)
      expect(ss.segmentCount).toBe(2)
    })
  })

  describe('insert', () => {
    it('inserts a single value', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.size).toBe(1)
      expect(ss.isEmpty).toBe(false)
      expect(ss.toArray()).toEqual([5])
    })

    it('inserts values in sorted order', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(3)
      ss.insert(1)
      ss.insert(2)
      expect(ss.toArray()).toEqual([1, 2, 3])
    })

    it('inserts duplicate values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      ss.insert(5)
      ss.insert(5)
      expect(ss.size).toBe(3)
      expect(ss.toArray()).toEqual([5, 5, 5])
    })

    it('inserts negative values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(-3)
      ss.insert(-1)
      ss.insert(-2)
      expect(ss.toArray()).toEqual([-3, -2, -1])
    })

    it('inserts zero', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(0)
      expect(ss.toArray()).toEqual([0])
    })

    it('splits segment when over capacity', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 5; i++) ss.insert(i)
      expect(ss.segmentCount).toBe(2)
      expect(ss.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('handles multiple splits', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 12; i++) ss.insert(i)
      expect(ss.segmentCount).toBeGreaterThanOrEqual(3)
      expect(ss.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    })

    it('inserts in reverse order', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 10; i >= 0; i--) ss.insert(i)
      expect(ss.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('inserts with large capacity', () => {
      const ss = new SortedSegment({ segmentCapacity: 256 })
      for (let i = 0; i < 100; i++) ss.insert(i)
      expect(ss.segmentCount).toBe(1)
      expect(ss.size).toBe(100)
    })

    it('inserts floating point values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1.5)
      ss.insert(0.5)
      ss.insert(2.5)
      expect(ss.toArray()).toEqual([0.5, 1.5, 2.5])
    })

    it('inserts many values maintaining sort', () => {
      const ss = new SortedSegment({ segmentCapacity: 16 })
      const vals = [50, 30, 70, 10, 90, 20, 80, 40, 60, 100]
      for (const v of vals) ss.insert(v)
      expect(ss.toArray()).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    })
  })

  describe('delete', () => {
    it('deletes a value from single segment', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.delete(5)).toBe(true)
      expect(ss.size).toBe(0)
      expect(ss.isEmpty).toBe(true)
    })

    it('returns false for missing value', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.delete(3)).toBe(false)
      expect(ss.size).toBe(1)
    })

    it('returns false on empty structure', () => {
      const ss = new SortedSegment()
      expect(ss.delete(1)).toBe(false)
    })

    it('deletes from middle of segment', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      expect(ss.delete(2)).toBe(true)
      expect(ss.toArray()).toEqual([1, 3])
    })

    it('deletes first element of segment', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      expect(ss.delete(1)).toBe(true)
      expect(ss.toArray()).toEqual([2, 3])
    })

    it('deletes last element of segment', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      expect(ss.delete(3)).toBe(true)
      expect(ss.toArray()).toEqual([1, 2])
    })

    it('deletes duplicate values one at a time', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      ss.insert(5)
      ss.insert(5)
      expect(ss.delete(5)).toBe(true)
      expect(ss.size).toBe(2)
      expect(ss.delete(5)).toBe(true)
      expect(ss.size).toBe(1)
    })

    it('merges segments after deletion', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 8; i++) ss.insert(i)
      ss.delete(0)
      ss.delete(1)
      ss.delete(2)
      expect(ss.toArray()).toEqual([3, 4, 5, 6, 7])
    })

    it('deletes all elements', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      ss.delete(1)
      ss.delete(2)
      ss.delete(3)
      expect(ss.isEmpty).toBe(true)
      expect(ss.size).toBe(0)
    })

    it('deletes negative values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(-5)
      ss.insert(-3)
      ss.insert(-1)
      expect(ss.delete(-3)).toBe(true)
      expect(ss.toArray()).toEqual([-5, -1])
    })
  })

  describe('has', () => {
    it('finds existing value', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.has(5)).toBe(true)
    })

    it('returns false for missing value', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.has(3)).toBe(false)
    })

    it('returns false on empty', () => {
      const ss = new SortedSegment()
      expect(ss.has(1)).toBe(false)
    })

    it('finds values across multiple segments', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 12; i++) ss.insert(i)
      expect(ss.has(0)).toBe(true)
      expect(ss.has(5)).toBe(true)
      expect(ss.has(11)).toBe(true)
      expect(ss.has(12)).toBe(false)
    })

    it('finds duplicate values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      ss.insert(5)
      expect(ss.has(5)).toBe(true)
    })

    it('finds negative values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(-10)
      expect(ss.has(-10)).toBe(true)
    })

    it('finds zero', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(0)
      expect(ss.has(0)).toBe(true)
    })
  })

  describe('findMin', () => {
    it('returns undefined on empty', () => {
      const ss = new SortedSegment()
      expect(ss.findMin()).toBeUndefined()
    })

    it('returns single element', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.findMin()).toBe(5)
    })

    it('returns minimum from many values', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 10; i >= 0; i--) ss.insert(i)
      expect(ss.findMin()).toBe(0)
    })

    it('returns negative minimum', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(-5)
      ss.insert(5)
      ss.insert(0)
      expect(ss.findMin()).toBe(-5)
    })

    it('updates after deletion', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      ss.delete(1)
      expect(ss.findMin()).toBe(2)
    })
  })

  describe('findMax', () => {
    it('returns undefined on empty', () => {
      const ss = new SortedSegment()
      expect(ss.findMax()).toBeUndefined()
    })

    it('returns single element', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.findMax()).toBe(5)
    })

    it('returns maximum from many values', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 11; i++) ss.insert(i)
      expect(ss.findMax()).toBe(10)
    })

    it('returns negative maximum', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(-10)
      ss.insert(-5)
      ss.insert(-20)
      expect(ss.findMax()).toBe(-5)
    })

    it('updates after deletion', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      ss.delete(3)
      expect(ss.findMax()).toBe(2)
    })
  })

  describe('rangeQuery', () => {
    it('returns empty on empty structure', () => {
      const ss = new SortedSegment()
      expect(ss.rangeQuery(0, 10)).toEqual([])
    })

    it('returns values in range', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 10; i++) ss.insert(i)
      expect(ss.rangeQuery(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('returns single value', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 10; i++) ss.insert(i)
      expect(ss.rangeQuery(5, 5)).toEqual([5])
    })

    it('returns empty when no values in range', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 5; i++) ss.insert(i)
      expect(ss.rangeQuery(10, 20)).toEqual([])
    })

    it('returns all values with full range', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 5; i++) ss.insert(i)
      expect(ss.rangeQuery(0, 4)).toEqual([0, 1, 2, 3, 4])
    })

    it('handles range across segments', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 12; i++) ss.insert(i)
      expect(ss.rangeQuery(3, 8)).toEqual([3, 4, 5, 6, 7, 8])
    })

    it('handles range with negative values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = -5; i <= 5; i++) ss.insert(i)
      expect(ss.rangeQuery(-2, 2)).toEqual([-2, -1, 0, 1, 2])
    })

    it('returns empty when min > max', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      expect(ss.rangeQuery(10, 1)).toEqual([])
    })
  })

  describe('size, segmentCount, isEmpty', () => {
    it('tracks size correctly', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      expect(ss.size).toBe(0)
      ss.insert(1)
      expect(ss.size).toBe(1)
      ss.insert(2)
      expect(ss.size).toBe(2)
      ss.delete(1)
      expect(ss.size).toBe(1)
    })

    it('tracks segment count correctly', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      expect(ss.segmentCount).toBe(0)
      ss.insert(1)
      expect(ss.segmentCount).toBe(1)
      for (let i = 2; i <= 5; i++) ss.insert(i)
      expect(ss.segmentCount).toBe(2)
    })

    it('tracks isEmpty correctly', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      expect(ss.isEmpty).toBe(true)
      ss.insert(1)
      expect(ss.isEmpty).toBe(false)
      ss.delete(1)
      expect(ss.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all data', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 10; i++) ss.insert(i)
      ss.clear()
      expect(ss.size).toBe(0)
      expect(ss.isEmpty).toBe(true)
      expect(ss.segmentCount).toBe(0)
      expect(ss.toArray()).toEqual([])
    })

    it('allows operations after clear', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 5; i++) ss.insert(i)
      ss.clear()
      ss.insert(10)
      expect(ss.size).toBe(1)
      expect(ss.has(10)).toBe(true)
    })

    it('resets statistics', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.clear()
      const stats = ss.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.segments).toBe(0)
      expect(stats.rebalances).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty structure', () => {
      const ss = new SortedSegment()
      expect(ss.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(3)
      ss.insert(1)
      ss.insert(2)
      expect(ss.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted array across segments', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 10; i >= 0; i--) ss.insert(i)
      const arr = ss.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]!)
      }
    })

    it('returns new array each call', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      const a = ss.toArray()
      const b = ss.toArray()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })
  })

  describe('forEach', () => {
    it('iterates over empty structure', () => {
      const ss = new SortedSegment()
      const items: number[] = []
      ss.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates in sorted order', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(3)
      ss.insert(1)
      ss.insert(2)
      const items: number[] = []
      ss.forEach((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(10)
      ss.insert(20)
      ss.insert(30)
      const indices: number[] = []
      ss.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates across segments', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 10; i++) ss.insert(i)
      const items: number[] = []
      ss.forEach((v) => items.push(v))
      expect(items).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty structure', () => {
      const ss = new SortedSegment()
      const items = [...ss]
      expect(items).toEqual([])
    })

    it('iterates sorted values', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(3)
      ss.insert(1)
      ss.insert(2)
      expect([...ss]).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      ss.insert(3)
      ss.insert(7)
      const items: number[] = []
      for (const v of ss) items.push(v)
      expect(items).toEqual([3, 5, 7])
    })

    it('iterates across segments', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 12; i++) ss.insert(i)
      expect([...ss]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    })
  })

  describe('mergeAll', () => {
    it('returns empty on empty structure', () => {
      const ss = new SortedSegment()
      expect(ss.mergeAll()).toEqual([])
    })

    it('merges single segment', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      expect(ss.mergeAll()).toEqual([1, 2, 3])
    })

    it('merges multiple segments', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 12; i++) ss.insert(i)
      const merged = ss.mergeAll()
      expect(merged).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      expect(ss.segmentCount).toBe(1)
    })

    it('returns a copy', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      const a = ss.mergeAll()
      a.push(999)
      expect(ss.size).toBe(2)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const ss = new SortedSegment()
      const stats = ss.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.segments).toBe(0)
      expect(stats.rebalances).toBe(0)
    })

    it('tracks inserts', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      ss.insert(2)
      ss.insert(3)
      expect(ss.getStatistics().inserts).toBe(3)
    })

    it('tracks segments after insert', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      expect(ss.getStatistics().segments).toBe(1)
    })

    it('tracks merges after mergeAll', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 12; i++) ss.insert(i)
      ss.mergeAll()
      expect(ss.getStatistics().merges).toBeGreaterThan(0)
    })

    it('returns a snapshot', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      const s1 = ss.getStatistics()
      ss.insert(2)
      const s2 = ss.getStatistics()
      expect(s1.inserts).toBe(1)
      expect(s2.inserts).toBe(2)
    })
  })

  describe('integration', () => {
    it('handles mixed insert and delete', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      ss.insert(5)
      ss.insert(3)
      ss.insert(8)
      ss.insert(1)
      ss.delete(3)
      ss.insert(4)
      ss.delete(8)
      expect(ss.toArray()).toEqual([1, 4, 5])
    })

    it('handles stress test with many operations', () => {
      const ss = new SortedSegment({ segmentCapacity: 16 })
      for (let i = 0; i < 100; i++) ss.insert(i)
      expect(ss.size).toBe(100)
      for (let i = 0; i < 50; i++) ss.delete(i)
      expect(ss.size).toBe(50)
      expect(ss.findMin()).toBe(50)
      expect(ss.findMax()).toBe(99)
    })

    it('handles alternating insert delete', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 20; i++) {
        ss.insert(i)
        if (i > 0) ss.delete(i - 1)
      }
      expect(ss.size).toBe(1)
      expect(ss.has(19)).toBe(true)
    })

    it('handles random order inserts', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      const vals = [42, 17, 93, 5, 28, 64, 11, 76, 33, 50]
      for (const v of vals) ss.insert(v)
      const arr = ss.toArray()
      const sorted = [...vals].sort((a, b) => a - b)
      expect(arr).toEqual(sorted)
    })

    it('preserves order through clear and refill', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 10; i >= 0; i--) ss.insert(i)
      ss.clear()
      for (let i = 20; i >= 10; i--) ss.insert(i)
      expect(ss.toArray()).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    })

    it('rangeQuery after deletes', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 20; i++) ss.insert(i)
      ss.delete(5)
      ss.delete(10)
      ss.delete(15)
      expect(ss.rangeQuery(3, 12)).toEqual([3, 4, 6, 7, 8, 9, 11, 12])
    })

    it('handles delete of non-existent after inserts', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 10; i++) ss.insert(i)
      expect(ss.delete(100)).toBe(false)
      expect(ss.size).toBe(10)
    })

    it('custom comparator with descending order', () => {
      const ss = new SortedSegment({
        segmentCapacity: 4,
        comparator: (a, b) => b - a,
      })
      ss.insert(5)
      ss.insert(1)
      ss.insert(9)
      ss.insert(3)
      expect(ss.toArray()).toEqual([9, 5, 3, 1])
      expect(ss.findMin()).toBe(9)
      expect(ss.findMax()).toBe(1)
    })

    it('handles insert after delete to empty', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(5)
      ss.delete(5)
      expect(ss.isEmpty).toBe(true)
      ss.insert(10)
      expect(ss.size).toBe(1)
      expect(ss.has(10)).toBe(true)
    })

    it('forEach after multiple splits', () => {
      const ss = new SortedSegment({ segmentCapacity: 3 })
      for (let i = 0; i < 15; i++) ss.insert(i)
      const items: number[] = []
      ss.forEach((v) => items.push(v))
      expect(items.length).toBe(15)
      for (let i = 0; i < 15; i++) {
        expect(items[i]).toBe(i)
      }
    })

    it('mergeAll then insert', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 10; i++) ss.insert(i)
      ss.mergeAll()
      expect(ss.segmentCount).toBe(1)
      ss.insert(100)
      expect(ss.has(100)).toBe(true)
      expect(ss.size).toBe(11)
    })

    it('handles all same values', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 10; i++) ss.insert(7)
      expect(ss.size).toBe(10)
      expect(ss.toArray()).toEqual(new Array(10).fill(7))
      expect(ss.findMin()).toBe(7)
      expect(ss.findMax()).toBe(7)
    })

    it('handles large batch insert', () => {
      const ss = new SortedSegment({ segmentCapacity: 32 })
      for (let i = 0; i < 500; i++) ss.insert(i)
      expect(ss.size).toBe(500)
      const arr = ss.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]!)
      }
    })

    it('delete from specific segment positions', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 8; i++) ss.insert(i)
      expect(ss.delete(0)).toBe(true)
      expect(ss.delete(7)).toBe(true)
      expect(ss.delete(3)).toBe(true)
      expect(ss.toArray()).toEqual([1, 2, 4, 5, 6])
    })

    it('statistics object has correct shape', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(1)
      const stats = ss.getStatistics()
      expect(stats).toHaveProperty('inserts')
      expect(stats).toHaveProperty('merges')
      expect(stats).toHaveProperty('segments')
      expect(stats).toHaveProperty('rebalances')
      expect(typeof stats.inserts).toBe('number')
      expect(typeof stats.merges).toBe('number')
      expect(typeof stats.segments).toBe('number')
      expect(typeof stats.rebalances).toBe('number')
    })

    it('rangeQuery with exact bounds', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      for (let i = 0; i < 10; i++) ss.insert(i * 2)
      expect(ss.rangeQuery(4, 12)).toEqual([4, 6, 8, 10, 12])
    })

    it('mergeAll returns sorted after chaotic inserts', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      const vals = [100, 1, 50, 25, 75, 12, 88, 37, 63, 99]
      for (const v of vals) ss.insert(v)
      const merged = ss.mergeAll()
      const sorted = [...vals].sort((a, b) => a - b)
      expect(merged).toEqual(sorted)
    })

    it('works with capacity of 2', () => {
      const ss = new SortedSegment({ segmentCapacity: 2 })
      ss.insert(3)
      ss.insert(1)
      ss.insert(2)
      expect(ss.toArray()).toEqual([1, 2, 3])
      expect(ss.segmentCount).toBeGreaterThanOrEqual(2)
    })

    it('has returns false after delete', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(42)
      expect(ss.has(42)).toBe(true)
      ss.delete(42)
      expect(ss.has(42)).toBe(false)
    })

    it('multiple clear cycles', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) ss.insert(i + cycle * 100)
        expect(ss.size).toBe(10)
        ss.clear()
        expect(ss.isEmpty).toBe(true)
      }
    })

    it('delete from middle of multi-segment structure', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 16; i++) ss.insert(i)
      for (let i = 0; i < 16; i += 2) {
        expect(ss.delete(i)).toBe(true)
      }
      expect(ss.toArray()).toEqual([1, 3, 5, 7, 9, 11, 13, 15])
      expect(ss.size).toBe(8)
    })

    it('insert after partial deletion preserves sort', () => {
      const ss = new SortedSegment({ segmentCapacity: 4 })
      for (let i = 0; i < 8; i++) ss.insert(i)
      ss.delete(2)
      ss.delete(5)
      ss.insert(2)
      ss.insert(5)
      expect(ss.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('rangeQuery on single element', () => {
      const ss = new SortedSegment({ segmentCapacity: 8 })
      ss.insert(42)
      expect(ss.rangeQuery(0, 100)).toEqual([42])
      expect(ss.rangeQuery(42, 42)).toEqual([42])
      expect(ss.rangeQuery(43, 100)).toEqual([])
    })
  })
})
