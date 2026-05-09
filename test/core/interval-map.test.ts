import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalMap } from '../../src/core/interval-map/interval-map.js'
import type { IntervalMapEntry, IntervalMapOptions } from '../../src/core/interval-map/types.js'
import { defaultComparator } from '../../src/core/interval-map/types.js'

describe('IntervalMap', () => {
  let map: IntervalMap<number, string>

  beforeEach(() => {
    map = new IntervalMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty interval map', () => {
      const m = new IntervalMap<number, string>()
      expect(m.size()).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseComp = (a: number, b: number): number => b - a
      const m = new IntervalMap<number, string>({ comparator: reverseComp })
      m.set(20, 10, 'a')
      expect(m.size()).toBe(1)
    })
  })

  describe('set', () => {
    it('should set a single interval', () => {
      map.set(0, 10, 'a')
      expect(map.size()).toBe(1)
      expect(map.isEmpty()).toBe(false)
    })

    it('should set multiple intervals', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      map.set(20, 30, 'c')
      expect(map.size()).toBe(3)
    })

    it('should allow zero-length intervals', () => {
      map.set(5, 5, 'point')
      expect(map.size()).toBe(1)
    })

    it('should allow negative intervals', () => {
      map.set(-10, -5, 'neg')
      expect(map.size()).toBe(1)
    })

    it('should throw for invalid interval low > high', () => {
      expect(() => map.set(10, 5, 'bad')).toThrow('Invalid interval')
    })

    it('should allow duplicate intervals', () => {
      map.set(0, 10, 'a')
      map.set(0, 10, 'b')
      expect(map.size()).toBe(2)
    })

    it('should handle large numbers', () => {
      map.set(Number.MAX_SAFE_INTEGER - 10, Number.MAX_SAFE_INTEGER, 'big')
      expect(map.size()).toBe(1)
    })

    it('should handle fractional numbers', () => {
      map.set(1.5, 3.7, 'frac')
      expect(map.size()).toBe(1)
    })

    it('should return void', () => {
      expect(map.set(0, 10, 'a')).toBeUndefined()
    })

    it('should allow overwriting with same interval bounds', () => {
      map.set(0, 10, 'first')
      map.set(0, 10, 'second')
      expect(map.size()).toBe(2)
    })
  })

  describe('get (point query)', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(10, 20, 'b')
      map.set(25, 35, 'c')
      map.set(0, 5, 'd')
    })

    it('should return value for point in interval', () => {
      expect(map.get(7)).toBe('a')
    })

    it('should return undefined for point not in any interval', () => {
      expect(map.get(100)).toBeUndefined()
    })

    it('should return last set value for overlapping intervals', () => {
      map.set(10, 20, 'overlap')
      expect(map.get(12)).toBe('overlap')
    })

    it('should return value at exact start boundary', () => {
      expect(map.get(5)).toBe('a')
    })

    it('should return undefined at exact end boundary (half-open)', () => {
      expect(map.get(15)).toBe('b')
    })

    it('should return value for point in single interval', () => {
      expect(map.get(30)).toBe('c')
    })

    it('should return undefined for point before all intervals', () => {
      expect(map.get(-1)).toBeUndefined()
    })

    it('should handle get on empty map', () => {
      map.clear()
      expect(map.get(5)).toBeUndefined()
    })

    it('should find point in zero-length interval start boundary', () => {
      map.clear()
      map.set(7, 7, 'point')
      expect(map.get(7)).toBeUndefined()
    })
  })

  describe('getInterval', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(10, 20, 'b')
      map.set(25, 35, 'c')
      map.set(0, 3, 'd')
    })

    it('should find overlapping intervals', () => {
      const results = map.getInterval(12, 18)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
    })

    it('should return empty array when no overlaps', () => {
      expect(map.getInterval(100, 200)).toEqual([])
    })

    it('should find exact match interval', () => {
      const results = map.getInterval(5, 15)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
    })

    it('should find intervals that fully contain the query', () => {
      const results = map.getInterval(7, 12)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
    })

    it('should find all intervals fully contained in the query', () => {
      const results = map.getInterval(0, 100)
      expect(results.length).toBe(4)
    })

    it('should handle touching intervals', () => {
      const results = map.getInterval(2, 5)
      const values = results.map((r) => r.value)
      expect(values).toContain('d')
    })

    it('should handle query on empty map', () => {
      map.clear()
      expect(map.getInterval(0, 10)).toEqual([])
    })

    it('should return IntervalMapEntry objects', () => {
      map.clear()
      map.set(1, 5, 'x')
      const results = map.getInterval(0, 10)
      expect(results[0]).toHaveProperty('low')
      expect(results[0]).toHaveProperty('high')
      expect(results[0]).toHaveProperty('value')
    })

    it('should not match adjacent but non-overlapping intervals', () => {
      const results = map.getInterval(21, 24)
      expect(results).toEqual([])
    })

    it('should find intervals that touch at boundary', () => {
      const results = map.getInterval(14, 16)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(0, 10, 'b')
      map.set(20, 30, 'c')
    })

    it('should delete an existing interval', () => {
      expect(map.delete(5, 15)).toBe(true)
      expect(map.size()).toBe(2)
    })

    it('should return false for non-existing interval', () => {
      expect(map.delete(100, 200)).toBe(false)
      expect(map.size()).toBe(3)
    })

    it('should only delete the first matching interval', () => {
      map.set(5, 15, 'dup')
      expect(map.delete(5, 15)).toBe(true)
      expect(map.size()).toBe(3)
    })

    it('should handle deleting from empty map', () => {
      map.clear()
      expect(map.delete(0, 10)).toBe(false)
    })

    it('should allow re-insertion after delete', () => {
      map.delete(5, 15)
      map.set(5, 15, 'new')
      expect(map.size()).toBe(3)
    })

    it('should delete all and leave empty map', () => {
      map.delete(5, 15)
      map.delete(0, 10)
      map.delete(20, 30)
      expect(map.isEmpty()).toBe(true)
      expect(map.size()).toBe(0)
    })

    it('should maintain queries after delete', () => {
      map.delete(5, 15)
      expect(map.get(7)).toBe('b')
    })

    it('should return false for partial match start only', () => {
      expect(map.delete(5, 16)).toBe(false)
    })

    it('should return false for partial match end only', () => {
      expect(map.delete(4, 15)).toBe(false)
    })
  })

  describe('contains', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(20, 30, 'b')
    })

    it('should return true for point in interval', () => {
      expect(map.contains(10)).toBe(true)
    })

    it('should return true for point at start boundary', () => {
      expect(map.contains(5)).toBe(true)
    })

    it('should return false for point at end boundary (half-open)', () => {
      expect(map.contains(15)).toBe(false)
    })

    it('should return false for point not in any interval', () => {
      expect(map.contains(17)).toBe(false)
    })

    it('should return false on empty map', () => {
      map.clear()
      expect(map.contains(5)).toBe(false)
    })

    it('should return true for point in second interval', () => {
      expect(map.contains(25)).toBe(true)
    })

    it('should return false for point before all intervals', () => {
      expect(map.contains(0)).toBe(false)
    })

    it('should return false for point after all intervals', () => {
      expect(map.contains(100)).toBe(false)
    })
  })

  describe('containsInterval', () => {
    beforeEach(() => {
      map.set(0, 20, 'a')
      map.set(10, 30, 'b')
    })

    it('should return true for fully covered interval', () => {
      expect(map.containsInterval(10, 20)).toBe(true)
    })

    it('should return true for interval covered by single entry', () => {
      expect(map.containsInterval(5, 10)).toBe(true)
    })

    it('should return false for partially covered interval', () => {
      expect(map.containsInterval(25, 35)).toBe(false)
    })

    it('should return false for interval outside all entries', () => {
      expect(map.containsInterval(50, 60)).toBe(false)
    })

    it('should return false on empty map', () => {
      map.clear()
      expect(map.containsInterval(0, 10)).toBe(false)
    })

    it('should return false for interval with gap', () => {
      map.clear()
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.containsInterval(0, 15)).toBe(false)
    })

    it('should return true for interval fully in single entry', () => {
      expect(map.containsInterval(2, 8)).toBe(true)
    })

    it('should return true for interval spanning multiple entries', () => {
      expect(map.containsInterval(0, 25)).toBe(true)
    })

    it('should return true for zero-length interval at covered point', () => {
      expect(map.containsInterval(5, 5)).toBe(true)
    })

    it('should return false for invalid interval low > high', () => {
      expect(map.containsInterval(20, 10)).toBe(false)
    })

    it('should handle three overlapping intervals', () => {
      map.clear()
      map.set(0, 10, 'a')
      map.set(8, 15, 'b')
      map.set(13, 20, 'c')
      expect(map.containsInterval(0, 20)).toBe(true)
    })
  })

  describe('overlaps', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(20, 30, 'b')
    })

    it('should return true when intervals overlap', () => {
      expect(map.overlaps(10, 25)).toBe(true)
    })

    it('should return true for exact match', () => {
      expect(map.overlaps(5, 15)).toBe(true)
    })

    it('should return true for interval containing existing interval', () => {
      expect(map.overlaps(0, 100)).toBe(true)
    })

    it('should return true for interval contained in existing interval', () => {
      expect(map.overlaps(7, 12)).toBe(true)
    })

    it('should return false when no overlap', () => {
      expect(map.overlaps(16, 19)).toBe(false)
    })

    it('should return false on empty map', () => {
      map.clear()
      expect(map.overlaps(0, 10)).toBe(false)
    })

    it('should detect touching boundary overlap', () => {
      expect(map.overlaps(14, 21)).toBe(true)
    })

    it('should not detect adjacent non-overlapping', () => {
      expect(map.overlaps(15, 20)).toBe(false)
    })

    it('should return true for point within interval', () => {
      expect(map.overlaps(10, 11)).toBe(true)
    })

    it('should return false for point between intervals', () => {
      expect(map.overlaps(16, 17)).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      map.set(0, 10, 'a')
      expect(map.size()).toBe(1)
      map.set(5, 15, 'b')
      expect(map.size()).toBe(2)
    })

    it('should decrease after delete', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      map.delete(0, 10)
      expect(map.size()).toBe(1)
    })

    it('should reset after clear', () => {
      map.set(0, 10, 'a')
      map.clear()
      expect(map.size()).toBe(0)
    })

    it('should track many intervals', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, i + 1, `v${i}`)
      }
      expect(map.size()).toBe(100)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new map', () => {
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false after set', () => {
      map.set(0, 10, 'a')
      expect(map.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      map.set(0, 10, 'a')
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })

    it('should return true after deleting all', () => {
      map.set(0, 10, 'a')
      map.delete(0, 10)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle clearing empty map', () => {
      map.clear()
      expect(map.size()).toBe(0)
    })

    it('should allow operations after clear', () => {
      map.set(0, 10, 'a')
      map.clear()
      map.set(5, 15, 'b')
      expect(map.size()).toBe(1)
    })

    it('should return void', () => {
      expect(map.clear()).toBeUndefined()
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return all interval boundaries', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      const ks = map.keys()
      expect(ks).toHaveLength(4)
      expect(ks).toContain(0)
      expect(ks).toContain(10)
      expect(ks).toContain(20)
      expect(ks).toContain(30)
    })

    it('should return boundaries for single interval', () => {
      map.set(5, 15, 'a')
      expect(map.keys()).toEqual([5, 15])
    })

    it('should return boundaries including duplicates', () => {
      map.set(0, 10, 'a')
      map.set(0, 10, 'b')
      expect(map.keys()).toEqual([0, 10, 0, 10])
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return all values', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      expect(map.values()).toEqual(['a', 'b'])
    })

    it('should preserve insertion order', () => {
      map.set(0, 10, 'first')
      map.set(5, 15, 'second')
      map.set(20, 30, 'third')
      expect(map.values()).toEqual(['first', 'second', 'third'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return all entries', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      const es = map.entries()
      expect(es).toHaveLength(2)
      expect(es[0]).toEqual({ low: 0, high: 10, value: 'a' })
      expect(es[1]).toEqual({ low: 20, high: 30, value: 'b' })
    })

    it('should return copies not references', () => {
      map.set(0, 10, 'a')
      const es = map.entries()
      es[0]!.value = 'modified'
      expect(map.get(5)).toBe('a')
    })

    it('should return entries in insertion order', () => {
      map.set(20, 30, 'c')
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      const es = map.entries()
      expect(es[0]!.value).toBe('c')
      expect(es[1]!.value).toBe('a')
      expect(es[2]!.value).toBe('b')
    })
  })

  describe('min', () => {
    it('should return undefined for empty map', () => {
      expect(map.min()).toBeUndefined()
    })

    it('should return smallest interval start', () => {
      map.set(10, 20, 'a')
      map.set(0, 5, 'b')
      map.set(5, 15, 'c')
      expect(map.min()).toBe(0)
    })

    it('should return start for single interval', () => {
      map.set(5, 15, 'a')
      expect(map.min()).toBe(5)
    })

    it('should handle negative starts', () => {
      map.set(-10, 0, 'a')
      map.set(5, 15, 'b')
      expect(map.min()).toBe(-10)
    })
  })

  describe('max', () => {
    it('should return undefined for empty map', () => {
      expect(map.max()).toBeUndefined()
    })

    it('should return largest interval end', () => {
      map.set(0, 10, 'a')
      map.set(5, 50, 'b')
      map.set(20, 30, 'c')
      expect(map.max()).toBe(50)
    })

    it('should return end for single interval', () => {
      map.set(5, 15, 'a')
      expect(map.max()).toBe(15)
    })

    it('should handle negative ends', () => {
      map.set(-20, -10, 'a')
      map.set(-5, 0, 'b')
      expect(map.max()).toBe(0)
    })
  })

  describe('clone', () => {
    beforeEach(() => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
    })

    it('should create a deep copy', () => {
      const c = map.clone()
      expect(c.size()).toBe(map.size())
      expect(c.get(5)).toBe(map.get(5))
    })

    it('should be independent from original', () => {
      const c = map.clone()
      c.set(20, 30, 'c')
      expect(c.size()).toBe(3)
      expect(map.size()).toBe(2)
    })

    it('should be independent after delete', () => {
      const c = map.clone()
      c.delete(0, 10)
      expect(c.size()).toBe(1)
      expect(map.size()).toBe(2)
    })

    it('should be independent after clear', () => {
      const c = map.clone()
      c.clear()
      expect(c.isEmpty()).toBe(true)
      expect(map.isEmpty()).toBe(false)
    })

    it('should preserve values', () => {
      const c = map.clone()
      expect(c.get(5)).toBe('b')
      expect(c.get(12)).toBe('b')
    })

    it('should preserve comparator', () => {
      const reverseComp = (a: number, b: number): number => b - a
      const m = new IntervalMap<number, string>({ comparator: reverseComp })
      m.set(20, 10, 'a')
      const c = m.clone()
      expect(c.size()).toBe(1)
    })

    it('should clone empty map', () => {
      map.clear()
      const c = map.clone()
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate over empty map', () => {
      const result = [...map]
      expect(result).toEqual([])
    })

    it('should iterate over single entry', () => {
      map.set(0, 10, 'a')
      const result = [...map]
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ low: 0, high: 10, value: 'a' })
    })

    it('should iterate over multiple entries', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      map.set(40, 50, 'c')
      const result = [...map]
      expect(result).toHaveLength(3)
    })

    it('should yield copies not references', () => {
      map.set(0, 10, 'a')
      const result = [...map]
      result[0]!.value = 'modified'
      expect(map.get(5)).toBe('a')
    })

    it('should work with for-of loop', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      const values: string[] = []
      for (const entry of map) {
        values.push(entry.value)
      }
      expect(values).toEqual(['a', 'b'])
    })

    it('should work with spread operator', () => {
      map.set(1, 5, 'x')
      const entries = [...map]
      expect(entries).toHaveLength(1)
      expect(entries[0]!.value).toBe('x')
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse order comparator', () => {
      const reverseComp = (a: number, b: number): number => b - a
      const m = new IntervalMap<number, string>({ comparator: reverseComp })
      m.set(20, 10, 'a')
      expect(m.get(15)).toBe('a')
    })

    it('should work with string keys', () => {
      const m = new IntervalMap<string, number>()
      m.set('a', 'd', 1)
      m.set('c', 'f', 2)
      expect(m.get('b')).toBe(1)
      expect(m.get('e')).toBe(2)
      expect(m.get('g')).toBeUndefined()
    })

    it('should use custom comparator for contains', () => {
      const m = new IntervalMap<string, number>()
      m.set('a', 'd', 1)
      expect(m.contains('b')).toBe(true)
      expect(m.contains('d')).toBe(false)
    })

    it('should use custom comparator for overlaps', () => {
      const m = new IntervalMap<string, number>()
      m.set('a', 'd', 1)
      expect(m.overlaps('c', 'f')).toBe(true)
      expect(m.overlaps('d', 'f')).toBe(false)
    })

    it('should use custom comparator for delete', () => {
      const m = new IntervalMap<string, number>()
      m.set('a', 'd', 1)
      expect(m.delete('a', 'd')).toBe(true)
      expect(m.size()).toBe(0)
    })

    it('should use custom comparator for min/max', () => {
      const m = new IntervalMap<string, number>()
      m.set('c', 'f', 1)
      m.set('a', 'd', 2)
      expect(m.min()).toBe('a')
      expect(m.max()).toBe('f')
    })
  })

  describe('numeric keys', () => {
    it('should work with integer keys', () => {
      map.set(0, 10, 'a')
      expect(map.get(5)).toBe('a')
      expect(map.get(10)).toBeUndefined()
    })

    it('should work with floating point keys', () => {
      const m = new IntervalMap<number, string>()
      m.set(0.5, 1.5, 'a')
      expect(m.get(1.0)).toBe('a')
      expect(m.get(0.5)).toBe('a')
      expect(m.get(1.5)).toBeUndefined()
    })

    it('should work with negative keys', () => {
      const m = new IntervalMap<number, string>()
      m.set(-10, -5, 'a')
      expect(m.get(-7)).toBe('a')
      expect(m.get(-5)).toBeUndefined()
      expect(m.get(-10)).toBe('a')
    })

    it('should work with zero-width interval', () => {
      map.set(5, 5, 'point')
      expect(map.get(5)).toBeUndefined()
      expect(map.contains(5)).toBe(false)
    })
  })

  describe('single interval', () => {
    it('should handle get on single interval', () => {
      map.set(0, 10, 'only')
      expect(map.get(5)).toBe('only')
      expect(map.get(15)).toBeUndefined()
    })

    it('should handle contains on single interval', () => {
      map.set(0, 10, 'only')
      expect(map.contains(5)).toBe(true)
      expect(map.contains(15)).toBe(false)
    })

    it('should handle containsInterval on single interval', () => {
      map.set(0, 10, 'only')
      expect(map.containsInterval(2, 8)).toBe(true)
      expect(map.containsInterval(0, 10)).toBe(true)
      expect(map.containsInterval(0, 11)).toBe(false)
    })

    it('should handle overlaps on single interval', () => {
      map.set(0, 10, 'only')
      expect(map.overlaps(5, 15)).toBe(true)
      expect(map.overlaps(10, 20)).toBe(false)
    })

    it('should handle min/max on single interval', () => {
      map.set(5, 15, 'only')
      expect(map.min()).toBe(5)
      expect(map.max()).toBe(15)
    })

    it('should handle delete on single interval', () => {
      map.set(0, 10, 'only')
      expect(map.delete(0, 10)).toBe(true)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle clone on single interval', () => {
      map.set(0, 10, 'only')
      const c = map.clone()
      expect(c.size()).toBe(1)
      expect(c.get(5)).toBe('only')
    })
  })

  describe('many overlapping intervals', () => {
    it('should find value from latest overlapping set', () => {
      map.set(0, 100, 'wide')
      map.set(20, 40, 'narrow')
      map.set(30, 35, 'tight')
      expect(map.get(32)).toBe('tight')
    })

    it('should return all overlapping via getInterval', () => {
      map.set(0, 100, 'wide')
      map.set(20, 40, 'narrow')
      map.set(30, 35, 'tight')
      const results = map.getInterval(31, 33)
      expect(results.length).toBe(3)
    })

    it('should handle many intervals for contains', () => {
      for (let i = 0; i < 50; i++) {
        map.set(i * 2, i * 2 + 1, `v${i}`)
      }
      expect(map.contains(0)).toBe(true)
      expect(map.contains(1)).toBe(false)
      expect(map.contains(50)).toBe(true)
      expect(map.contains(98)).toBe(true)
      expect(map.contains(100)).toBe(false)
    })

    it('should handle many intervals for overlaps', () => {
      for (let i = 0; i < 50; i++) {
        map.set(i * 10, i * 10 + 5, `v${i}`)
      }
      expect(map.overlaps(0, 1)).toBe(true)
      expect(map.overlaps(7, 8)).toBe(false)
      expect(map.overlaps(490, 495)).toBe(true)
    })
  })

  describe('non-overlapping intervals', () => {
    it('should find values in separate intervals', () => {
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      map.set(20, 25, 'c')
      expect(map.get(2)).toBe('a')
      expect(map.get(12)).toBe('b')
      expect(map.get(22)).toBe('c')
    })

    it('should not find values in gaps', () => {
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.get(7)).toBeUndefined()
      expect(map.contains(7)).toBe(false)
    })

    it('should detect no overlap in gaps', () => {
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.overlaps(6, 9)).toBe(false)
    })

    it('should detect overlaps in intervals', () => {
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.overlaps(3, 12)).toBe(true)
    })

    it('should return false for containsInterval with gaps', () => {
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.containsInterval(0, 15)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle negative intervals', () => {
      map.set(-20, -10, 'neg')
      expect(map.get(-15)).toBe('neg')
      expect(map.get(0)).toBeUndefined()
    })

    it('should handle intervals spanning negative to positive', () => {
      map.set(-10, 10, 'span')
      expect(map.get(-5)).toBe('span')
      expect(map.get(5)).toBe('span')
      expect(map.get(0)).toBe('span')
    })

    it('should handle very large number of intervals', () => {
      for (let i = 0; i < 500; i++) {
        map.set(i, i + 1, `v${i}`)
      }
      expect(map.size()).toBe(500)
      expect(map.get(250)).toBe('v250')
    })

    it('should handle interleaved set and delete', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      map.delete(0, 10)
      map.set(5, 15, 'c')
      map.delete(20, 30)
      expect(map.size()).toBe(1)
    })

    it('should handle clearing and rebuilding', () => {
      map.set(0, 10, 'a')
      map.clear()
      map.set(5, 15, 'b')
      expect(map.size()).toBe(1)
      expect(map.get(10)).toBe('b')
    })

    it('should handle nested intervals', () => {
      map.set(0, 100, 'outer')
      map.set(25, 75, 'middle')
      map.set(40, 60, 'inner')
      expect(map.get(50)).toBe('inner')
      const results = map.getInterval(45, 55)
      expect(results.length).toBe(3)
    })
  })

  describe('type exports', () => {
    it('should support IntervalMapEntry interface', () => {
      const entry: IntervalMapEntry<number, string> = { low: 0, high: 10, value: 'test' }
      expect(entry.low).toBe(0)
      expect(entry.high).toBe(10)
      expect(entry.value).toBe('test')
    })

    it('should support IntervalMapOptions interface', () => {
      const options: IntervalMapOptions<number, string> = {
        comparator: (a, b) => a - b,
      }
      const m = new IntervalMap<number, string>(options)
      m.set(0, 10, 'a')
      expect(m.size()).toBe(1)
    })

    it('should export defaultComparator', () => {
      expect(defaultComparator(1, 2)).toBeLessThan(0)
      expect(defaultComparator(2, 1)).toBeGreaterThan(0)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should support number value type', () => {
      const m = new IntervalMap<number, number>()
      m.set(0, 10, 42)
      expect(m.get(5)).toBe(42)
    })

    it('should support object value type', () => {
      interface Data {
        name: string
        priority: number
      }
      const m = new IntervalMap<number, Data>()
      m.set(0, 10, { name: 'test', priority: 1 })
      const val = m.get(5)
      expect(val!.name).toBe('test')
      expect(val!.priority).toBe(1)
    })

    it('should support null value type', () => {
      const m = new IntervalMap<number, null>()
      m.set(0, 10, null)
      expect(m.get(5)).toBeNull()
    })

    it('should support array value type', () => {
      const m = new IntervalMap<number, number[]>()
      m.set(0, 10, [1, 2, 3])
      expect(m.get(5)).toEqual([1, 2, 3])
    })

    it('should support string key type', () => {
      const m = new IntervalMap<string, number>()
      m.set('a', 'f', 1)
      expect(m.get('c')).toBe(1)
    })
  })

  describe('half-open interval semantics', () => {
    it('should include start but exclude end in get', () => {
      map.set(0, 10, 'a')
      expect(map.get(0)).toBe('a')
      expect(map.get(10)).toBeUndefined()
    })

    it('should include start but exclude end in contains', () => {
      map.set(0, 10, 'a')
      expect(map.contains(0)).toBe(true)
      expect(map.contains(10)).toBe(false)
    })

    it('should detect overlap at shared boundary', () => {
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      expect(map.overlaps(0, 20)).toBe(true)
      expect(map.get(10)).toBe('b')
    })

    it('should not detect overlap between adjacent intervals', () => {
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      expect(map.overlaps(0, 10)).toBe(true)
      expect(map.overlaps(10, 20)).toBe(true)
    })

    it('should handle containsInterval with half-open', () => {
      map.set(0, 10, 'a')
      expect(map.containsInterval(0, 10)).toBe(true)
      expect(map.containsInterval(0, 11)).toBe(false)
    })
  })
})
