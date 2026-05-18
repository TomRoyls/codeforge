import { describe, it, expect, beforeEach } from 'vitest'
import { RangeMap2 } from '../../src/core/range-map-2/index.js'

describe('RangeMap2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates empty range map', () => {
      const rm = new RangeMap2<string>()
      expect(rm.size).toBe(0)
    })
  })

  // ─── set / get ───
  describe('set and get', () => {
    it('sets a range and gets value at a point', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      expect(rm.get(5)).toBe('a')
    })

    it('returns undefined for point outside all ranges', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      expect(rm.get(10)).toBeUndefined()
      expect(rm.get(-1)).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const rm = new RangeMap2<string>()
      expect(rm.get(0)).toBeUndefined()
    })

    it('get returns value at start boundary', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      expect(rm.get(0)).toBe('a')
    })

    it('get returns undefined at end boundary (half-open)', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      expect(rm.get(10)).toBeUndefined()
    })

    it('overwrites overlapping range with different value', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.set(3, 7, 'b')
      expect(rm.get(2)).toBe('a')
      expect(rm.get(5)).toBe('b')
      expect(rm.get(8)).toBe('a')
    })

    it('overwrites entire range', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.set(0, 10, 'b')
      expect(rm.get(5)).toBe('b')
      expect(rm.size).toBe(1)
    })

    it('set ignores invalid range where start >= end', () => {
      const rm = new RangeMap2<string>()
      rm.set(5, 5, 'a')
      expect(rm.size).toBe(0)
      rm.set(10, 5, 'b')
      expect(rm.size).toBe(0)
    })

    it('merges adjacent ranges with same value', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 5, 'a')
      rm.set(5, 10, 'a')
      expect(rm.size).toBe(1)
      expect(rm.get(4)).toBe('a')
      expect(rm.get(6)).toBe('a')
    })
  })

  // ─── getRange ───
  describe('getRange', () => {
    it('returns overlapping portions', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      const result = rm.getRange(5, 15)
      expect(result).toEqual([{ start: 5, end: 10, value: 'a' }])
    })

    it('returns multiple ranges within query', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 5, 'a')
      rm.set(10, 15, 'b')
      const result = rm.getRange(0, 20)
      expect(result).toEqual([
        { start: 0, end: 5, value: 'a' },
        { start: 10, end: 15, value: 'b' },
      ])
    })

    it('returns empty for non-overlapping query', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 5, 'a')
      expect(rm.getRange(10, 20)).toEqual([])
    })

    it('clips range to query boundaries', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 20, 'a')
      const result = rm.getRange(5, 10)
      expect(result).toEqual([{ start: 5, end: 10, value: 'a' }])
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('deletes an entire range', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.delete(0, 10)
      expect(rm.size).toBe(0)
    })

    it('deletes middle splitting range', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.delete(3, 7)
      expect(rm.get(1)).toBe('a')
      expect(rm.get(5)).toBeUndefined()
      expect(rm.get(8)).toBe('a')
    })

    it('deletes from start of range', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.delete(0, 4)
      expect(rm.get(2)).toBeUndefined()
      expect(rm.get(5)).toBe('a')
    })

    it('deletes from end of range', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.delete(7, 10)
      expect(rm.get(8)).toBeUndefined()
      expect(rm.get(5)).toBe('a')
    })

    it('delete ignores invalid range', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.delete(5, 5)
      expect(rm.size).toBe(1)
    })

    it('delete non-overlapping range does nothing', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.delete(20, 30)
      expect(rm.size).toBe(1)
    })
  })

  // ─── ranges ───
  describe('ranges', () => {
    it('returns all ranges', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 5, 'a')
      rm.set(10, 15, 'b')
      expect(rm.ranges()).toEqual([
        { start: 0, end: 5, value: 'a' },
        { start: 10, end: 15, value: 'b' },
      ])
    })

    it('returns empty array when no ranges', () => {
      const rm = new RangeMap2<string>()
      expect(rm.ranges()).toEqual([])
    })

    it('returns copies not internal references', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 5, 'a')
      const ranges = rm.ranges()
      ranges[0]!.value = 'mutated'
      expect(rm.get(2)).toBe('a')
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('removes all ranges', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 10, 'a')
      rm.set(20, 30, 'b')
      rm.clear()
      expect(rm.size).toBe(0)
      expect(rm.ranges()).toEqual([])
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('multiple overlapping sets resolve correctly', () => {
      const rm = new RangeMap2<string>()
      rm.set(0, 20, 'a')
      rm.set(5, 15, 'b')
      rm.set(8, 12, 'c')
      expect(rm.get(2)).toBe('a')
      expect(rm.get(7)).toBe('b')
      expect(rm.get(10)).toBe('c')
      expect(rm.get(17)).toBe('a')
    })

    it('works with number values', () => {
      const rm = new RangeMap2<number>()
      rm.set(0, 10, 100)
      expect(rm.get(5)).toBe(100)
    })
  })
})
