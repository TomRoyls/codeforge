import { describe, it, expect, beforeEach } from 'vitest'
import { SegmentMap } from '../../src/core/segment-map/segment-map.js'
import type { SegmentMapEntry, SegmentMapOptions, SegmentMapStats } from '../../src/core/segment-map/types.js'

describe('SegmentMap', () => {
  let map: SegmentMap<string>

  beforeEach(() => {
    map = new SegmentMap<string>()
  })

  describe('construction', () => {
    it('should create an empty segment map', () => {
      const m = new SegmentMap<string>()
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept options parameter', () => {
      const m = new SegmentMap<string>({ allowOverlaps: true })
      expect(m.size).toBe(0)
    })

    it('should accept empty options', () => {
      const m = new SegmentMap<string>({})
      expect(m.size).toBe(0)
    })
  })

  describe('set', () => {
    it('should set a single segment', () => {
      map.set(0, 10, 'a')
      expect(map.size).toBe(1)
      expect(map.isEmpty()).toBe(false)
    })

    it('should set multiple segments', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      map.set(20, 30, 'c')
      expect(map.size).toBe(3)
    })

    it('should throw for invalid segment start > end', () => {
      expect(() => map.set(10, 5, 'bad')).toThrow('Invalid segment')
    })

    it('should allow zero-length segments (point ranges)', () => {
      map.set(5, 5, 'point')
      expect(map.size).toBe(1)
    })

    it('should allow negative ranges', () => {
      map.set(-10, -5, 'neg')
      expect(map.size).toBe(1)
    })

    it('should allow duplicate segments', () => {
      map.set(0, 10, 'a')
      map.set(0, 10, 'b')
      expect(map.size).toBe(2)
    })

    it('should handle large numbers', () => {
      map.set(Number.MAX_SAFE_INTEGER - 10, Number.MAX_SAFE_INTEGER, 'big')
      expect(map.size).toBe(1)
    })

    it('should handle fractional numbers', () => {
      map.set(1.5, 3.7, 'frac')
      expect(map.size).toBe(1)
    })

    it('should return void', () => {
      expect(map.set(0, 10, 'a')).toBeUndefined()
    })

    it('should allow same bounds multiple times', () => {
      map.set(0, 10, 'first')
      map.set(0, 10, 'second')
      expect(map.size).toBe(2)
    })
  })

  describe('get (point query)', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(10, 20, 'b')
      map.set(25, 35, 'c')
      map.set(0, 5, 'd')
    })

    it('should return values for point in single segment', () => {
      expect(map.get(7)).toEqual(['a'])
    })

    it('should return all values covering point', () => {
      const results = map.get(12)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toHaveLength(2)
    })

    it('should return empty array for point not in any segment', () => {
      expect(map.get(100)).toEqual([])
    })

    it('should return value at exact start boundary', () => {
      expect(map.get(5)).toContain('a')
    })

    it('should not include value at exact end boundary (half-open)', () => {
      const results = map.get(15)
      expect(results).not.toContain('a')
      expect(results).toContain('b')
    })

    it('should handle get on empty map', () => {
      map.clear()
      expect(map.get(5)).toEqual([])
    })

    it('should find point at start of first segment', () => {
      expect(map.get(0)).toEqual(['d'])
    })

    it('should return empty for point before all segments', () => {
      expect(map.get(-1)).toEqual([])
    })

    it('should find point in last segment', () => {
      expect(map.get(30)).toEqual(['c'])
    })

    it('should return empty for point after all segments', () => {
      expect(map.get(40)).toEqual([])
    })
  })

  describe('getRange', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(10, 20, 'b')
      map.set(25, 35, 'c')
      map.set(0, 3, 'd')
    })

    it('should find overlapping segments', () => {
      const results = map.getRange(12, 18)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
    })

    it('should return empty array when no overlaps', () => {
      expect(map.getRange(100, 200)).toEqual([])
    })

    it('should throw for invalid range start > end', () => {
      expect(() => map.getRange(10, 5)).toThrow('Invalid range')
    })

    it('should find exact match segment', () => {
      const results = map.getRange(5, 15)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
    })

    it('should find all segments contained in query', () => {
      const results = map.getRange(0, 100)
      expect(results.length).toBe(4)
    })

    it('should handle touching segments', () => {
      const results = map.getRange(2, 6)
      const values = results.map((r) => r.value)
      expect(values).toContain('d')
      expect(values).toContain('a')
    })

    it('should handle query on empty map', () => {
      map.clear()
      expect(map.getRange(0, 10)).toEqual([])
    })

    it('should return SegmentMapEntry objects with start, end, value', () => {
      map.clear()
      map.set(1, 5, 'x')
      const results = map.getRange(0, 10)
      expect(results[0]).toHaveProperty('start')
      expect(results[0]).toHaveProperty('end')
      expect(results[0]).toHaveProperty('value')
    })

    it('should not match adjacent but non-overlapping', () => {
      const results = map.getRange(21, 24)
      expect(results).toEqual([])
    })

    it('should find segments touching at boundary', () => {
      const results = map.getRange(14, 16)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
    })

    it('should return copies not references', () => {
      map.clear()
      map.set(1, 5, 'x')
      const results = map.getRange(0, 10)
      results[0]!.value = 'modified'
      const check = map.get(2)
      expect(check).toEqual(['x'])
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(0, 10, 'b')
      map.set(20, 30, 'c')
    })

    it('should delete an existing segment', () => {
      expect(map.delete(5, 15)).toBe(true)
      expect(map.size).toBe(2)
    })

    it('should return false for non-existing segment', () => {
      expect(map.delete(100, 200)).toBe(false)
      expect(map.size).toBe(3)
    })

    it('should only delete first matching segment', () => {
      map.set(5, 15, 'dup')
      expect(map.delete(5, 15)).toBe(true)
      expect(map.size).toBe(3)
    })

    it('should handle deleting from empty map', () => {
      map.clear()
      expect(map.delete(0, 10)).toBe(false)
    })

    it('should allow re-insertion after delete', () => {
      map.delete(5, 15)
      map.set(5, 15, 'new')
      expect(map.size).toBe(3)
    })

    it('should delete all and leave empty map', () => {
      map.delete(5, 15)
      map.delete(0, 10)
      map.delete(20, 30)
      expect(map.isEmpty()).toBe(true)
      expect(map.size).toBe(0)
    })

    it('should maintain queries after delete', () => {
      map.delete(5, 15)
      expect(map.get(7)).toEqual(['b'])
    })

    it('should return false for partial match start only', () => {
      expect(map.delete(5, 16)).toBe(false)
    })

    it('should return false for partial match end only', () => {
      expect(map.delete(4, 15)).toBe(false)
    })
  })

  describe('has', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(20, 30, 'b')
    })

    it('should return true for point in segment', () => {
      expect(map.has(10)).toBe(true)
    })

    it('should return true for point at start boundary', () => {
      expect(map.has(5)).toBe(true)
    })

    it('should return false for point at end boundary (half-open)', () => {
      expect(map.has(15)).toBe(false)
    })

    it('should return false for point not in any segment', () => {
      expect(map.has(17)).toBe(false)
    })

    it('should return false on empty map', () => {
      map.clear()
      expect(map.has(5)).toBe(false)
    })

    it('should return true for point in second segment', () => {
      expect(map.has(25)).toBe(true)
    })

    it('should return false for point before all segments', () => {
      expect(map.has(0)).toBe(false)
    })

    it('should return false for point after all segments', () => {
      expect(map.has(100)).toBe(false)
    })

    it('should handle overlapping segments', () => {
      map.set(10, 20, 'c')
      expect(map.has(12)).toBe(true)
    })
  })

  describe('hasRange', () => {
    beforeEach(() => {
      map.set(0, 20, 'a')
      map.set(10, 30, 'b')
    })

    it('should return true for fully covered range', () => {
      expect(map.hasRange(10, 20)).toBe(true)
    })

    it('should return true for range covered by single segment', () => {
      expect(map.hasRange(5, 10)).toBe(true)
    })

    it('should return false for partially covered range', () => {
      expect(map.hasRange(25, 35)).toBe(false)
    })

    it('should return false for range outside all segments', () => {
      expect(map.hasRange(50, 60)).toBe(false)
    })

    it('should return false on empty map', () => {
      map.clear()
      expect(map.hasRange(0, 10)).toBe(false)
    })

    it('should return false for range with gap', () => {
      map.clear()
      map.set(0, 5, 'a')
      map.set(10, 15, 'b')
      expect(map.hasRange(0, 15)).toBe(false)
    })

    it('should return true for range fully in single segment', () => {
      expect(map.hasRange(2, 8)).toBe(true)
    })

    it('should return true for range spanning multiple segments', () => {
      expect(map.hasRange(0, 25)).toBe(true)
    })

    it('should return false for invalid range start > end', () => {
      expect(map.hasRange(20, 10)).toBe(false)
    })

    it('should handle three overlapping segments', () => {
      map.clear()
      map.set(0, 10, 'a')
      map.set(8, 15, 'b')
      map.set(13, 20, 'c')
      expect(map.hasRange(0, 20)).toBe(true)
    })

    it('should handle single point range with has', () => {
      expect(map.hasRange(5, 5)).toBe(true)
    })
  })

  describe('size / isEmpty', () => {
    it('should return 0 for empty map', () => {
      expect(map.size).toBe(0)
    })

    it('should return correct count after inserts', () => {
      map.set(0, 10, 'a')
      expect(map.size).toBe(1)
      map.set(5, 15, 'b')
      expect(map.size).toBe(2)
    })

    it('should decrease after delete', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      map.delete(0, 10)
      expect(map.size).toBe(1)
    })

    it('should reset after clear', () => {
      map.set(0, 10, 'a')
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should return true for isEmpty on new map', () => {
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

    it('should track many segments', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, i + 1, `v${i}`)
      }
      expect(map.size).toBe(100)
    })
  })

  describe('forEach', () => {
    it('should iterate over empty map', () => {
      const entries: SegmentMapEntry<string>[] = []
      map.forEach((entry) => entries.push(entry))
      expect(entries).toEqual([])
    })

    it('should iterate over single entry', () => {
      map.set(0, 10, 'a')
      const entries: SegmentMapEntry<string>[] = []
      map.forEach((entry) => entries.push(entry))
      expect(entries).toHaveLength(1)
      expect(entries[0]).toEqual({ start: 0, end: 10, value: 'a' })
    })

    it('should iterate over multiple entries', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      map.set(40, 50, 'c')
      const entries: SegmentMapEntry<string>[] = []
      map.forEach((entry) => entries.push(entry))
      expect(entries).toHaveLength(3)
    })

    it('should provide correct index', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      const indices: number[] = []
      map.forEach((_entry, index) => indices.push(index))
      expect(indices).toEqual([0, 1])
    })

    it('should yield copies not references', () => {
      map.set(0, 10, 'a')
      const entries: SegmentMapEntry<string>[] = []
      map.forEach((entry) => entries.push(entry))
      entries[0]!.value = 'modified'
      expect(map.get(5)).toEqual(['a'])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('should return all entries', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      const arr = map.toArray()
      expect(arr).toHaveLength(2)
      expect(arr[0]).toEqual({ start: 0, end: 10, value: 'a' })
      expect(arr[1]).toEqual({ start: 20, end: 30, value: 'b' })
    })

    it('should return copies not references', () => {
      map.set(0, 10, 'a')
      const arr = map.toArray()
      arr[0]!.value = 'modified'
      expect(map.get(5)).toEqual(['a'])
    })

    it('should preserve insertion order', () => {
      map.set(20, 30, 'c')
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      const arr = map.toArray()
      expect(arr[0]!.value).toBe('c')
      expect(arr[1]!.value).toBe('a')
      expect(arr[2]!.value).toBe('b')
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('should handle clearing empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      map.set(0, 10, 'a')
      map.clear()
      map.set(5, 15, 'b')
      expect(map.size).toBe(1)
    })

    it('should return void', () => {
      expect(map.clear()).toBeUndefined()
    })
  })

  describe('clone', () => {
    beforeEach(() => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
    })

    it('should create a deep copy', () => {
      const c = map.clone()
      expect(c.size).toBe(map.size)
      expect(c.get(5)).toEqual(map.get(5))
    })

    it('should be independent from original after set', () => {
      const c = map.clone()
      c.set(20, 30, 'c')
      expect(c.size).toBe(3)
      expect(map.size).toBe(2)
    })

    it('should be independent after delete', () => {
      const c = map.clone()
      c.delete(0, 10)
      expect(c.size).toBe(1)
      expect(map.size).toBe(2)
    })

    it('should be independent after clear', () => {
      const c = map.clone()
      c.clear()
      expect(c.isEmpty()).toBe(true)
      expect(map.isEmpty()).toBe(false)
    })

    it('should preserve values', () => {
      const c = map.clone()
      expect(c.get(5)).toContain('b')
      expect(c.get(12)).toContain('b')
    })

    it('should clone empty map', () => {
      map.clear()
      const c = map.clone()
      expect(c.isEmpty()).toBe(true)
    })
  })

  describe('from (static factory)', () => {
    it('should create map from array of entries', () => {
      const entries: SegmentMapEntry<string>[] = [
        { start: 0, end: 10, value: 'a' },
        { start: 5, end: 15, value: 'b' },
      ]
      const m = SegmentMap.from(entries)
      expect(m.size).toBe(2)
    })

    it('should create map from empty iterable', () => {
      const m = SegmentMap.from<string>([])
      expect(m.isEmpty()).toBe(true)
    })

    it('should create map from generator', () => {
      function* gen(): Generator<SegmentMapEntry<string>> {
        yield { start: 0, end: 10, value: 'a' }
        yield { start: 20, end: 30, value: 'b' }
      }
      const m = SegmentMap.from(gen())
      expect(m.size).toBe(2)
      expect(m.get(5)).toEqual(['a'])
    })

    it('should create map from set iterator', () => {
      const entries = new Set<SegmentMapEntry<string>>([
        { start: 0, end: 10, value: 'a' },
      ])
      const m = SegmentMap.from(entries)
      expect(m.size).toBe(1)
    })

    it('should validate entries through set', () => {
      const entries: SegmentMapEntry<string>[] = [
        { start: 10, end: 5, value: 'bad' },
      ]
      expect(() => SegmentMap.from(entries)).toThrow('Invalid segment')
    })

    it('should preserve entry values', () => {
      const entries: SegmentMapEntry<number>[] = [
        { start: 0, end: 10, value: 42 },
        { start: 20, end: 30, value: 99 },
      ]
      const m = SegmentMap.from(entries)
      expect(m.get(5)).toEqual([42])
      expect(m.get(25)).toEqual([99])
    })
  })

  describe('covering', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(10, 20, 'b')
      map.set(25, 35, 'c')
    })

    it('should return segments covering a point', () => {
      const results = map.covering(12)
      expect(results).toHaveLength(2)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
    })

    it('should return empty for uncovered point', () => {
      expect(map.covering(22)).toEqual([])
    })

    it('should return single segment', () => {
      const results = map.covering(30)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('c')
    })

    it('should return empty on empty map', () => {
      map.clear()
      expect(map.covering(5)).toEqual([])
    })

    it('should include point at start boundary', () => {
      const results = map.covering(5)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('a')
    })

    it('should exclude point at end boundary', () => {
      const results = map.covering(15)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('b')
    })

    it('should return SegmentMapEntry objects', () => {
      const results = map.covering(12)
      expect(results[0]).toHaveProperty('start')
      expect(results[0]).toHaveProperty('end')
      expect(results[0]).toHaveProperty('value')
    })
  })

  describe('overlaps', () => {
    beforeEach(() => {
      map.set(5, 15, 'a')
      map.set(20, 30, 'b')
    })

    it('should return true when range overlaps', () => {
      expect(map.overlaps(10, 25)).toBe(true)
    })

    it('should return true for exact match', () => {
      expect(map.overlaps(5, 15)).toBe(true)
    })

    it('should return true for range containing segment', () => {
      expect(map.overlaps(0, 100)).toBe(true)
    })

    it('should return true for range contained in segment', () => {
      expect(map.overlaps(7, 12)).toBe(true)
    })

    it('should return false when no overlap', () => {
      expect(map.overlaps(16, 19)).toBe(false)
    })

    it('should return false on empty map', () => {
      map.clear()
      expect(map.overlaps(0, 10)).toBe(false)
    })

    it('should throw for invalid range', () => {
      expect(() => map.overlaps(10, 5)).toThrow('Invalid range')
    })

    it('should detect touching boundary overlap', () => {
      expect(map.overlaps(14, 21)).toBe(true)
    })

    it('should not detect adjacent non-overlapping', () => {
      expect(map.overlaps(15, 20)).toBe(false)
    })

    it('should return true for point within segment', () => {
      expect(map.overlaps(10, 11)).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return empty stats for empty map', () => {
      const s = map.stats()
      expect(s.segmentCount).toBe(0)
      expect(s.totalCovered).toBe(0)
      expect(s.minStart).toBeUndefined()
      expect(s.maxEnd).toBeUndefined()
      expect(s.averageSpan).toBe(0)
      expect(s.overlapCount).toBe(0)
    })

    it('should return correct segmentCount', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      expect(map.stats().segmentCount).toBe(2)
    })

    it('should compute totalCovered for non-overlapping', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      expect(map.stats().totalCovered).toBe(20)
    })

    it('should compute totalCovered for overlapping', () => {
      map.set(0, 15, 'a')
      map.set(10, 25, 'b')
      expect(map.stats().totalCovered).toBe(25)
    })

    it('should compute minStart and maxEnd', () => {
      map.set(5, 15, 'a')
      map.set(-3, 50, 'b')
      expect(map.stats().minStart).toBe(-3)
      expect(map.stats().maxEnd).toBe(50)
    })

    it('should compute averageSpan', () => {
      map.set(0, 10, 'a')
      map.set(0, 20, 'b')
      expect(map.stats().averageSpan).toBe(15)
    })

    it('should compute overlapCount for overlapping segments', () => {
      map.set(0, 15, 'a')
      map.set(10, 25, 'b')
      map.set(20, 30, 'c')
      expect(map.stats().overlapCount).toBe(2)
    })

    it('should compute overlapCount as 0 for non-overlapping', () => {
      map.set(0, 10, 'a')
      map.set(20, 30, 'b')
      expect(map.stats().overlapCount).toBe(0)
    })

    it('should compute totalCovered for single segment', () => {
      map.set(5, 15, 'a')
      expect(map.stats().totalCovered).toBe(10)
    })

    it('should handle single segment stats', () => {
      map.set(5, 15, 'a')
      const s = map.stats()
      expect(s.segmentCount).toBe(1)
      expect(s.minStart).toBe(5)
      expect(s.maxEnd).toBe(15)
      expect(s.averageSpan).toBe(10)
      expect(s.overlapCount).toBe(0)
    })
  })

  describe('edge cases: empty map', () => {
    it('should return empty for get on empty', () => {
      expect(map.get(5)).toEqual([])
    })

    it('should return empty for getRange on empty', () => {
      expect(map.getRange(0, 10)).toEqual([])
    })

    it('should return empty for covering on empty', () => {
      expect(map.covering(5)).toEqual([])
    })

    it('should return empty for toArray on empty', () => {
      expect(map.toArray()).toEqual([])
    })

    it('should return false for has on empty', () => {
      expect(map.has(5)).toBe(false)
    })

    it('should return false for hasRange on empty', () => {
      expect(map.hasRange(0, 10)).toBe(false)
    })

    it('should return false for overlaps on empty', () => {
      expect(map.overlaps(0, 10)).toBe(false)
    })

    it('should return false for delete on empty', () => {
      expect(map.delete(0, 10)).toBe(false)
    })
  })

  describe('edge cases: single point ranges', () => {
    it('should handle zero-length segment in get', () => {
      map.set(5, 5, 'point')
      expect(map.get(5)).toEqual([])
    })

    it('should handle zero-length segment in has', () => {
      map.set(5, 5, 'point')
      expect(map.has(5)).toBe(false)
    })

    it('should still count zero-length segment in size', () => {
      map.set(5, 5, 'point')
      expect(map.size).toBe(1)
    })

    it('should allow deleting zero-length segment', () => {
      map.set(5, 5, 'point')
      expect(map.delete(5, 5)).toBe(true)
      expect(map.size).toBe(0)
    })
  })

  describe('edge cases: overlapping ranges', () => {
    it('should return all overlapping values from get', () => {
      map.set(0, 100, 'wide')
      map.set(20, 40, 'narrow')
      map.set(30, 35, 'tight')
      const results = map.get(32)
      expect(results).toHaveLength(3)
      expect(results).toContain('wide')
      expect(results).toContain('narrow')
      expect(results).toContain('tight')
    })

    it('should return all from getRange for nested segments', () => {
      map.set(0, 100, 'wide')
      map.set(20, 40, 'narrow')
      map.set(30, 35, 'tight')
      const results = map.getRange(31, 33)
      expect(results).toHaveLength(3)
    })

    it('should handle overlapping with different values', () => {
      map.set(0, 10, 'a')
      map.set(5, 15, 'b')
      map.set(8, 12, 'c')
      const results = map.get(9)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toContain('c')
    })
  })

  describe('edge cases: contained ranges', () => {
    it('should find inner segment via get', () => {
      map.set(0, 100, 'outer')
      map.set(25, 75, 'inner')
      expect(map.get(50)).toContain('inner')
      expect(map.get(50)).toContain('outer')
    })

    it('should find inner segment via getRange', () => {
      map.set(0, 100, 'outer')
      map.set(25, 75, 'inner')
      const results = map.getRange(30, 40)
      expect(results).toHaveLength(2)
    })

    it('should find only outer segment outside inner', () => {
      map.set(0, 100, 'outer')
      map.set(25, 75, 'inner')
      expect(map.get(10)).toEqual(['outer'])
    })
  })

  describe('edge cases: adjacent ranges', () => {
    it('should not find value at end of first adjacent segment', () => {
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      const results = map.get(10)
      expect(results).toEqual(['b'])
    })

    it('should not detect overlap between adjacent segments', () => {
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      expect(map.overlaps(0, 10)).toBe(true)
      expect(map.overlaps(10, 20)).toBe(true)
    })

    it('should find values in adjacent segments separately', () => {
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      expect(map.get(5)).toEqual(['a'])
      expect(map.get(15)).toEqual(['b'])
    })
  })

  describe('edge cases: negative numbers', () => {
    it('should handle negative ranges', () => {
      map.set(-20, -10, 'neg')
      expect(map.get(-15)).toEqual(['neg'])
      expect(map.get(0)).toEqual([])
    })

    it('should handle ranges spanning negative to positive', () => {
      map.set(-10, 10, 'span')
      expect(map.get(-5)).toEqual(['span'])
      expect(map.get(5)).toEqual(['span'])
      expect(map.get(0)).toEqual(['span'])
    })

    it('should handle all negative ranges', () => {
      map.set(-100, -50, 'a')
      map.set(-60, -20, 'b')
      const results = map.get(-55)
      expect(results).toContain('a')
      expect(results).toContain('b')
    })

    it('should handle delete with negative ranges', () => {
      map.set(-10, -5, 'a')
      expect(map.delete(-10, -5)).toBe(true)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('large maps', () => {
    it('should handle 10000+ non-overlapping segments', () => {
      for (let i = 0; i < 10000; i++) {
        map.set(i * 2, i * 2 + 1, `v${i}`)
      }
      expect(map.size).toBe(10000)
      expect(map.get(0)).toEqual(['v0'])
      expect(map.get(19998)).toEqual(['v9999'])
      expect(map.get(1)).toEqual([])
    })

    it('should handle 10000+ overlapping segments', () => {
      for (let i = 0; i < 10000; i++) {
        map.set(i, i + 100, `v${i}`)
      }
      expect(map.size).toBe(10000)
      const results = map.get(50)
      expect(results.length).toBe(51)
    })

    it('should handle getRange on large map', () => {
      for (let i = 0; i < 10000; i++) {
        map.set(i * 10, i * 10 + 5, `v${i}`)
      }
      const results = map.getRange(0, 100)
      expect(results.length).toBe(10)
    })

    it('should handle hasRange on large map', () => {
      for (let i = 0; i < 10000; i++) {
        map.set(i, i + 2, `v${i}`)
      }
      expect(map.hasRange(0, 10001)).toBe(true)
      expect(map.hasRange(0, 10002)).toBe(false)
    })

    it('should handle stats on large map', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i, i + 1, `v${i}`)
      }
      const s = map.stats()
      expect(s.segmentCount).toBe(1000)
      expect(s.totalCovered).toBe(1000)
      expect(s.overlapCount).toBe(0)
    })

    it('should handle delete on large map', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i, i + 1, `v${i}`)
      }
      expect(map.delete(500, 501)).toBe(true)
      expect(map.size).toBe(999)
    })

    it('should handle clone on large map', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i, i + 1, `v${i}`)
      }
      const c = map.clone()
      expect(c.size).toBe(1000)
    })

    it('should handle toArray on large map', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i, i + 1, `v${i}`)
      }
      const arr = map.toArray()
      expect(arr).toHaveLength(1000)
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
      expect(result[0]).toEqual({ start: 0, end: 10, value: 'a' })
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
      expect(map.get(5)).toEqual(['a'])
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
  })

  describe('type exports', () => {
    it('should support SegmentMapEntry interface', () => {
      const entry: SegmentMapEntry<string> = { start: 0, end: 10, value: 'test' }
      expect(entry.start).toBe(0)
      expect(entry.end).toBe(10)
      expect(entry.value).toBe('test')
    })

    it('should support SegmentMapOptions interface', () => {
      const options: SegmentMapOptions = { allowOverlaps: true }
      const m = new SegmentMap<string>(options)
      m.set(0, 10, 'a')
      expect(m.size).toBe(1)
    })

    it('should support SegmentMapStats interface', () => {
      map.set(0, 10, 'a')
      const s: SegmentMapStats = map.stats()
      expect(s.segmentCount).toBe(1)
    })

    it('should support number value type', () => {
      const m = new SegmentMap<number>()
      m.set(0, 10, 42)
      expect(m.get(5)).toEqual([42])
    })

    it('should support object value type', () => {
      interface Data {
        name: string
        priority: number
      }
      const m = new SegmentMap<Data>()
      m.set(0, 10, { name: 'test', priority: 1 })
      const val = m.get(5)
      expect(val![0]!.name).toBe('test')
      expect(val![0]!.priority).toBe(1)
    })

    it('should support null value type', () => {
      const m = new SegmentMap<null>()
      m.set(0, 10, null)
      expect(m.get(5)).toEqual([null])
    })

    it('should support array value type', () => {
      const m = new SegmentMap<number[]>()
      m.set(0, 10, [1, 2, 3])
      expect(m.get(5)).toEqual([[1, 2, 3]])
    })
  })

  describe('half-open interval semantics', () => {
    it('should include start but exclude end in get', () => {
      map.set(0, 10, 'a')
      expect(map.get(0)).toEqual(['a'])
      expect(map.get(10)).toEqual([])
    })

    it('should include start but exclude end in has', () => {
      map.set(0, 10, 'a')
      expect(map.has(0)).toBe(true)
      expect(map.has(10)).toBe(false)
    })

    it('should detect overlap at shared boundary', () => {
      map.set(0, 10, 'a')
      map.set(10, 20, 'b')
      expect(map.overlaps(0, 20)).toBe(true)
      expect(map.get(10)).toEqual(['b'])
    })

    it('should handle hasRange with half-open', () => {
      map.set(0, 10, 'a')
      expect(map.hasRange(0, 10)).toBe(true)
      expect(map.hasRange(0, 11)).toBe(false)
    })

    it('should handle covering with half-open', () => {
      map.set(0, 10, 'a')
      expect(map.covering(0)).toHaveLength(1)
      expect(map.covering(10)).toHaveLength(0)
    })
  })
})
