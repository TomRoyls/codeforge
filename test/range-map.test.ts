import { describe, it, expect } from 'vitest'
import { RangeMap } from '../src/utils/range-map.js'

describe('RangeMap', () => {
  describe('set', () => {
    it('sets a range with value', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      expect(rm.size).toBe(1)
      expect(rm.get(5)).toBe('a')
    })

    it('sets multiple non-overlapping ranges', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 5, 'a')
      rm.set(10, 15, 'b')
      expect(rm.size).toBe(2)
      expect(rm.get(3)).toBe('a')
      expect(rm.get(12)).toBe('b')
    })

    it('overwrites overlapping range', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      rm.set(5, 15, 'b')
      expect(rm.size).toBe(1)
      expect(rm.get(3)).toBeUndefined()
      expect(rm.get(12)).toBe('b')
    })

    it('throws when start > end', () => {
      const rm = new RangeMap<string>()
      expect(() => rm.set(10, 5, 'a')).toThrow(RangeError)
    })

    it('handles single-point range', () => {
      const rm = new RangeMap<string>()
      rm.set(5, 5, 'point')
      expect(rm.get(5)).toBe('point')
      expect(rm.get(4)).toBeUndefined()
      expect(rm.get(6)).toBeUndefined()
    })
  })

  describe('get', () => {
    it('returns value for point in range', () => {
      const rm = new RangeMap<number>()
      rm.set(0, 10, 42)
      expect(rm.get(0)).toBe(42)
      expect(rm.get(10)).toBe(42)
      expect(rm.get(5)).toBe(42)
    })

    it('returns undefined for point outside all ranges', () => {
      const rm = new RangeMap<number>()
      rm.set(0, 10, 42)
      expect(rm.get(-1)).toBeUndefined()
      expect(rm.get(11)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      expect(new RangeMap<string>().get(0)).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns true for covered point', () => {
      const rm = new RangeMap<string>()
      rm.set(5, 10, 'x')
      expect(rm.has(7)).toBe(true)
    })

    it('returns false for uncovered point', () => {
      const rm = new RangeMap<string>()
      rm.set(5, 10, 'x')
      expect(rm.has(4)).toBe(false)
      expect(rm.has(11)).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes overlapping entries', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      expect(rm.remove(0, 10)).toBe(1)
      expect(rm.size).toBe(0)
    })

    it('removes partially overlapping entries', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      rm.set(20, 30, 'b')
      expect(rm.remove(5, 25)).toBe(2)
      expect(rm.size).toBe(0)
    })

    it('returns 0 when nothing removed', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      expect(rm.remove(15, 20)).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      rm.set(20, 30, 'b')
      rm.clear()
      expect(rm.isEmpty).toBe(true)
      expect(rm.size).toBe(0)
    })
  })

  describe('getAll', () => {
    it('returns all entries sorted by start', () => {
      const rm = new RangeMap<string>()
      rm.set(20, 30, 'b')
      rm.set(0, 10, 'a')
      const entries = rm.getAll()
      expect(entries[0]!.start).toBe(0)
      expect(entries[1]!.start).toBe(20)
    })

    it('returns empty array for empty map', () => {
      expect(new RangeMap<string>().getAll()).toEqual([])
    })
  })

  describe('findOverlapping', () => {
    it('finds overlapping ranges', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      rm.set(20, 30, 'b')
      rm.set(40, 50, 'c')
      const overlap = rm.findOverlapping(5, 25)
      expect(overlap.length).toBe(2)
      expect(overlap[0]!.value).toBe('a')
      expect(overlap[1]!.value).toBe('b')
    })

    it('returns empty when no overlap', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      expect(rm.findOverlapping(15, 20)).toEqual([])
    })
  })

  describe('coversEntireRange', () => {
    it('returns true when fully covered by single entry', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 20, 'a')
      expect(rm.coversEntireRange(5, 10)).toBe(true)
    })

    it('returns false when gap exists', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 5, 'a')
      rm.set(10, 15, 'b')
      expect(rm.coversEntireRange(0, 15)).toBe(false)
    })

    it('returns false for empty map', () => {
      expect(new RangeMap<string>().coversEntireRange(0, 5)).toBe(false)
    })
  })

  describe('totalCovered', () => {
    it('sums range lengths', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 9, 'a')
      rm.set(20, 29, 'b')
      expect(rm.totalCovered()).toBe(20)
    })

    it('returns 0 for empty map', () => {
      expect(new RangeMap<string>().totalCovered()).toBe(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      const c = rm.clone()
      expect(c.getAll()).toEqual(rm.getAll())
      c.set(20, 30, 'b')
      expect(rm.size).toBe(1)
      expect(c.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('iterates all entries', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 5, 'a')
      rm.set(10, 15, 'b')
      const collected: string[] = []
      rm.forEach((e) => collected.push(e.value))
      expect(collected).toEqual(['a', 'b'])
    })
  })

  describe('edge cases', () => {
    it('handles negative ranges', () => {
      const rm = new RangeMap<string>()
      rm.set(-10, -1, 'neg')
      expect(rm.get(-5)).toBe('neg')
      expect(rm.get(0)).toBeUndefined()
    })

    it('handles large values', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 1000000, 'big')
      expect(rm.get(500000)).toBe('big')
    })

    it('set then remove then set again', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 10, 'a')
      rm.remove(0, 10)
      rm.set(0, 10, 'b')
      expect(rm.get(5)).toBe('b')
    })

    it('multiple overlapping sets leave only latest', () => {
      const rm = new RangeMap<string>()
      rm.set(0, 100, 'a')
      rm.set(25, 75, 'b')
      rm.set(40, 60, 'c')
      expect(rm.size).toBe(1)
      expect(rm.get(50)).toBe('c')
    })
  })
})
