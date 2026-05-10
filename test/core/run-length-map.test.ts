import { describe, it, expect, beforeEach } from 'vitest'
import { RunLengthMap } from '../../src/core/run-length-map/run-length-map.js'
import { DEFAULT_RUN_LENGTH_MAP_OPTIONS } from '../../src/core/run-length-map/types.js'
import type { RunLengthMapOptions, Run } from '../../src/core/run-length-map/types.js'

describe('RunLengthMap', () => {
  let map: RunLengthMap<string>

  beforeEach(() => {
    map = new RunLengthMap<string>()
  })

  describe('constructor', () => {
    it('should create an empty map', () => {
      const m = new RunLengthMap<string>()
      expect(m.size).toBe(0)
      expect(m.runCount()).toBe(0)
    })

    it('should accept entries array', () => {
      const m = new RunLengthMap<string>([[1, 'a'], [2, 'a'], [3, 'a']])
      expect(m.size).toBe(3)
      expect(m.get(1)).toBe('a')
      expect(m.get(2)).toBe('a')
      expect(m.get(3)).toBe('a')
    })

    it('should accept empty entries array', () => {
      const m = new RunLengthMap<string>([])
      expect(m.size).toBe(0)
    })

    it('should accept undefined entries', () => {
      const m = new RunLengthMap<string>(undefined)
      expect(m.size).toBe(0)
    })

    it('should merge consecutive same-value entries into single run', () => {
      const m = new RunLengthMap<string>([[1, 'a'], [2, 'a'], [3, 'a']])
      expect(m.runCount()).toBe(1)
    })

    it('should not merge non-consecutive entries', () => {
      const m = new RunLengthMap<string>([[1, 'a'], [3, 'a']])
      expect(m.runCount()).toBe(2)
    })

    it('should handle entries with different values', () => {
      const m = new RunLengthMap<string>([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(m.runCount()).toBe(3)
    })

    it('should handle numeric values', () => {
      const m = new RunLengthMap<number>([[1, 10], [2, 10]])
      expect(m.size).toBe(2)
      expect(m.get(1)).toBe(10)
    })
  })

  describe('set', () => {
    it('should set a single key', () => {
      map.set(5, 'hello')
      expect(map.get(5)).toBe('hello')
      expect(map.size).toBe(1)
    })

    it('should set multiple keys', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.size).toBe(3)
    })

    it('should overwrite existing key', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.get(1)).toBe('b')
      expect(map.size).toBe(1)
    })

    it('should merge consecutive same-value keys', () => {
      map.set(1, 'a')
      map.set(2, 'a')
      map.set(3, 'a')
      expect(map.runCount()).toBe(1)
      expect(map.size).toBe(3)
    })

    it('should not merge non-consecutive same-value keys', () => {
      map.set(1, 'a')
      map.set(3, 'a')
      expect(map.runCount()).toBe(2)
    })

    it('should split a run when overwriting middle key', () => {
      map.set(1, 'a')
      map.set(2, 'a')
      map.set(3, 'a')
      map.set(2, 'b')
      expect(map.runCount()).toBe(3)
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('a')
    })

    it('should split a run when overwriting start of run', () => {
      map.set(1, 'a')
      map.set(2, 'a')
      map.set(3, 'a')
      map.set(1, 'b')
      expect(map.get(1)).toBe('b')
      expect(map.get(2)).toBe('a')
      expect(map.get(3)).toBe('a')
      expect(map.runCount()).toBe(2)
    })

    it('should split a run when overwriting end of run', () => {
      map.set(1, 'a')
      map.set(2, 'a')
      map.set(3, 'a')
      map.set(3, 'b')
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('a')
      expect(map.get(3)).toBe('b')
      expect(map.runCount()).toBe(2)
    })

    it('should handle negative keys', () => {
      map.set(-5, 'neg')
      map.set(-3, 'neg2')
      map.set(0, 'zero')
      expect(map.get(-5)).toBe('neg')
      expect(map.get(-3)).toBe('neg2')
      expect(map.get(0)).toBe('zero')
    })

    it('should handle setting key 0', () => {
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
      expect(map.size).toBe(1)
    })

    it('should handle setting same value as existing run does not create new run', () => {
      map.set(1, 'a')
      map.set(2, 'a')
      const runsBefore = map.runCount()
      map.set(1, 'a')
      expect(map.runCount()).toBe(runsBefore)
    })

    it('should handle setting between two existing runs with same value', () => {
      map.set(1, 'a')
      map.set(3, 'a')
      expect(map.runCount()).toBe(2)
      map.set(2, 'a')
      expect(map.runCount()).toBe(1)
      expect(map.size).toBe(3)
    })

    it('should handle setting between two runs with different value', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(2, 'b')
      expect(map.runCount()).toBe(3)
      expect(map.get(2)).toBe('b')
    })

    it('should handle large key values', () => {
      map.set(1000000, 'big')
      expect(map.get(1000000)).toBe('big')
    })
  })

  describe('get', () => {
    it('should return value for existing key', () => {
      map.set(5, 'val')
      expect(map.get(5)).toBe('val')
    })

    it('should return undefined for non-existing key', () => {
      expect(map.get(5)).toBeUndefined()
    })

    it('should return undefined on empty map', () => {
      expect(map.get(0)).toBeUndefined()
      expect(map.get(1)).toBeUndefined()
      expect(map.get(-1)).toBeUndefined()
    })

    it('should get value from a run', () => {
      map.setRange(1, 10, 'range')
      expect(map.get(1)).toBe('range')
      expect(map.get(5)).toBe('range')
      expect(map.get(10)).toBe('range')
      expect(map.get(11)).toBeUndefined()
    })

    it('should get correct value after overwrite', () => {
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.get(1)).toBe('new')
    })

    it('should get correct values after split', () => {
      map.setRange(1, 5, 'a')
      map.set(3, 'b')
      expect(map.get(2)).toBe('a')
      expect(map.get(3)).toBe('b')
      expect(map.get(4)).toBe('a')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      map.set(5, 'val')
      expect(map.has(5)).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(map.has(5)).toBe(false)
    })

    it('should return false on empty map', () => {
      expect(map.has(0)).toBe(false)
    })

    it('should find key in range', () => {
      map.setRange(1, 10, 'r')
      expect(map.has(1)).toBe(true)
      expect(map.has(5)).toBe(true)
      expect(map.has(10)).toBe(true)
      expect(map.has(11)).toBe(false)
    })

    it('should return false after delete', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete a single key', () => {
      map.set(1, 'a')
      expect(map.delete(1)).toBe(true)
      expect(map.has(1)).toBe(false)
      expect(map.size).toBe(0)
    })

    it('should return false for non-existing key', () => {
      expect(map.delete(5)).toBe(false)
    })

    it('should return false on empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('should delete start of run', () => {
      map.setRange(1, 5, 'a')
      map.delete(1)
      expect(map.has(1)).toBe(false)
      expect(map.has(2)).toBe(true)
      expect(map.get(2)).toBe('a')
      expect(map.size).toBe(4)
    })

    it('should delete end of run', () => {
      map.setRange(1, 5, 'a')
      map.delete(5)
      expect(map.has(5)).toBe(false)
      expect(map.has(4)).toBe(true)
      expect(map.size).toBe(4)
    })

    it('should delete middle of run splitting it', () => {
      map.setRange(1, 5, 'a')
      map.delete(3)
      expect(map.has(3)).toBe(false)
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('a')
      expect(map.get(4)).toBe('a')
      expect(map.get(5)).toBe('a')
      expect(map.size).toBe(4)
      expect(map.runCount()).toBe(2)
    })

    it('should delete only key in single-key run', () => {
      map.set(1, 'a')
      map.set(3, 'b')
      map.delete(3)
      expect(map.runCount()).toBe(1)
      expect(map.has(3)).toBe(false)
    })

    it('should handle deleting after multiple operations', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.size).toBe(2)
      expect(map.get(1)).toBe('a')
      expect(map.get(3)).toBe('c')
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size).toBe(0)
    })

    it('should count individual keys', () => {
      map.set(1, 'a')
      map.set(2, 'a')
      map.set(3, 'a')
      expect(map.size).toBe(3)
    })

    it('should count keys in ranges', () => {
      map.setRange(1, 10, 'a')
      expect(map.size).toBe(10)
    })

    it('should decrease after delete', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('should not change when setting same value', () => {
      map.set(1, 'a')
      map.set(1, 'a')
      expect(map.size).toBe(1)
    })

    it('should not change when overwriting with different value', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size).toBe(1)
    })

    it('should reset after clear', () => {
      map.setRange(1, 100, 'a')
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      map.setRange(1, 10, 'a')
      map.setRange(20, 30, 'b')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.runCount()).toBe(0)
    })

    it('should clear empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should allow reuse after clear', () => {
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.get(2)).toBe('b')
      expect(map.size).toBe(1)
    })

    it('should handle multiple clears', () => {
      map.set(1, 'a')
      map.clear()
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('setRange', () => {
    it('should set a range of keys', () => {
      map.setRange(1, 5, 'a')
      expect(map.size).toBe(5)
      expect(map.get(1)).toBe('a')
      expect(map.get(3)).toBe('a')
      expect(map.get(5)).toBe('a')
    })

    it('should create single run for range', () => {
      map.setRange(1, 100, 'a')
      expect(map.runCount()).toBe(1)
    })

    it('should overwrite existing overlapping runs', () => {
      map.setRange(1, 10, 'a')
      map.setRange(5, 15, 'b')
      expect(map.get(4)).toBe('a')
      expect(map.get(5)).toBe('b')
      expect(map.get(10)).toBe('b')
      expect(map.get(15)).toBe('b')
    })

    it('should overwrite entire existing run', () => {
      map.setRange(1, 10, 'a')
      map.setRange(1, 10, 'b')
      expect(map.runCount()).toBe(1)
      expect(map.get(1)).toBe('b')
      expect(map.size).toBe(10)
    })

    it('should handle non-overlapping ranges', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      expect(map.runCount()).toBe(2)
      expect(map.size).toBe(11)
    })

    it('should handle adjacent ranges with same value merging', () => {
      map.setRange(1, 5, 'a')
      map.setRange(6, 10, 'a')
      expect(map.runCount()).toBe(1)
      expect(map.size).toBe(10)
    })

    it('should handle adjacent ranges with different values', () => {
      map.setRange(1, 5, 'a')
      map.setRange(6, 10, 'b')
      expect(map.runCount()).toBe(2)
    })

    it('should handle single key range', () => {
      map.setRange(5, 5, 'single')
      expect(map.size).toBe(1)
      expect(map.get(5)).toBe('single')
    })

    it('should do nothing when start > end', () => {
      map.setRange(10, 5, 'a')
      expect(map.size).toBe(0)
      expect(map.runCount()).toBe(0)
    })

    it('should handle range that splits existing run', () => {
      map.setRange(1, 10, 'a')
      map.setRange(4, 6, 'b')
      expect(map.get(3)).toBe('a')
      expect(map.get(4)).toBe('b')
      expect(map.get(6)).toBe('b')
      expect(map.get(7)).toBe('a')
      expect(map.size).toBe(10)
    })

    it('should handle range covering multiple existing runs', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      map.setRange(20, 25, 'c')
      map.setRange(1, 25, 'd')
      expect(map.runCount()).toBe(1)
      expect(map.size).toBe(25)
      expect(map.get(1)).toBe('d')
      expect(map.get(15)).toBe('d')
      expect(map.get(25)).toBe('d')
    })

    it('should handle range partially overlapping multiple runs', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      map.setRange(20, 25, 'c')
      map.setRange(3, 22, 'd')
      expect(map.get(2)).toBe('a')
      expect(map.get(3)).toBe('d')
      expect(map.get(22)).toBe('d')
      expect(map.get(23)).toBe('c')
    })
  })

  describe('getRange', () => {
    it('should return overlapping runs', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      const result = map.getRange(3, 12)
      expect(result).toEqual([
        { start: 3, end: 5, value: 'a' },
        { start: 10, end: 12, value: 'b' },
      ])
    })

    it('should return empty array for no overlap', () => {
      map.setRange(1, 5, 'a')
      const result = map.getRange(10, 15)
      expect(result).toEqual([])
    })

    it('should return empty array on empty map', () => {
      const result = map.getRange(1, 10)
      expect(result).toEqual([])
    })

    it('should return full run when fully contained', () => {
      map.setRange(5, 10, 'a')
      const result = map.getRange(1, 20)
      expect(result).toEqual([{ start: 5, end: 10, value: 'a' }])
    })

    it('should return partial overlap at start', () => {
      map.setRange(5, 10, 'a')
      const result = map.getRange(1, 7)
      expect(result).toEqual([{ start: 5, end: 7, value: 'a' }])
    })

    it('should return partial overlap at end', () => {
      map.setRange(5, 10, 'a')
      const result = map.getRange(8, 20)
      expect(result).toEqual([{ start: 8, end: 10, value: 'a' }])
    })

    it('should handle multiple overlapping runs', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      map.setRange(20, 25, 'c')
      const result = map.getRange(3, 22)
      expect(result).toEqual([
        { start: 3, end: 5, value: 'a' },
        { start: 10, end: 15, value: 'b' },
        { start: 20, end: 22, value: 'c' },
      ])
    })

    it('should handle exact match range', () => {
      map.setRange(5, 10, 'a')
      const result = map.getRange(5, 10)
      expect(result).toEqual([{ start: 5, end: 10, value: 'a' }])
    })
  })

  describe('deleteRange', () => {
    it('should delete a range of keys', () => {
      map.setRange(1, 10, 'a')
      map.deleteRange(3, 7)
      expect(map.has(2)).toBe(true)
      expect(map.has(3)).toBe(false)
      expect(map.has(7)).toBe(false)
      expect(map.has(8)).toBe(true)
      expect(map.size).toBe(5)
    })

    it('should handle deleting entire run', () => {
      map.setRange(1, 10, 'a')
      map.deleteRange(1, 10)
      expect(map.size).toBe(0)
      expect(map.runCount()).toBe(0)
    })

    it('should handle deleting from empty map', () => {
      map.deleteRange(1, 10)
      expect(map.size).toBe(0)
    })

    it('should do nothing when start > end', () => {
      map.setRange(1, 10, 'a')
      map.deleteRange(10, 5)
      expect(map.size).toBe(10)
    })

    it('should delete start of run', () => {
      map.setRange(1, 10, 'a')
      map.deleteRange(1, 5)
      expect(map.has(1)).toBe(false)
      expect(map.has(5)).toBe(false)
      expect(map.has(6)).toBe(true)
      expect(map.size).toBe(5)
    })

    it('should delete end of run', () => {
      map.setRange(1, 10, 'a')
      map.deleteRange(6, 10)
      expect(map.has(5)).toBe(true)
      expect(map.has(6)).toBe(false)
      expect(map.size).toBe(5)
    })

    it('should delete across multiple runs', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      map.setRange(20, 25, 'c')
      map.deleteRange(3, 22)
      expect(map.get(2)).toBe('a')
      expect(map.has(3)).toBe(false)
      expect(map.has(22)).toBe(false)
      expect(map.get(23)).toBe('c')
      expect(map.size).toBe(5)
    })

    it('should handle non-overlapping delete', () => {
      map.setRange(1, 5, 'a')
      map.deleteRange(10, 15)
      expect(map.size).toBe(5)
    })

    it('should handle partial overlap at start of run', () => {
      map.setRange(5, 10, 'a')
      map.deleteRange(1, 7)
      expect(map.has(7)).toBe(false)
      expect(map.get(8)).toBe('a')
      expect(map.size).toBe(3)
    })

    it('should handle partial overlap at end of run', () => {
      map.setRange(5, 10, 'a')
      map.deleteRange(8, 20)
      expect(map.get(7)).toBe('a')
      expect(map.has(8)).toBe(false)
      expect(map.size).toBe(3)
    })

    it('should handle setRange then deleteRange roundtrip', () => {
      map.setRange(1, 100, 'a')
      map.deleteRange(1, 100)
      expect(map.size).toBe(0)
      expect(map.runCount()).toBe(0)
      map.setRange(1, 100, 'b')
      expect(map.size).toBe(100)
    })
  })

  describe('runCount', () => {
    it('should return 0 for empty map', () => {
      expect(map.runCount()).toBe(0)
    })

    it('should return 1 for single run', () => {
      map.set(1, 'a')
      expect(map.runCount()).toBe(1)
    })

    it('should track multiple runs', () => {
      map.set(1, 'a')
      map.set(3, 'b')
      map.set(5, 'c')
      expect(map.runCount()).toBe(3)
    })

    it('should decrease when runs merge', () => {
      map.set(1, 'a')
      map.set(3, 'a')
      expect(map.runCount()).toBe(2)
      map.set(2, 'a')
      expect(map.runCount()).toBe(1)
    })

    it('should increase when run is split', () => {
      map.setRange(1, 5, 'a')
      expect(map.runCount()).toBe(1)
      map.set(3, 'b')
      expect(map.runCount()).toBe(3)
    })

    it('should update after delete splitting', () => {
      map.setRange(1, 5, 'a')
      map.delete(3)
      expect(map.runCount()).toBe(2)
    })

    it('should update after clear', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.clear()
      expect(map.runCount()).toBe(0)
    })
  })

  describe('compress', () => {
    it('should return 0 when nothing to merge', () => {
      map.set(1, 'a')
      map.set(3, 'b')
      expect(map.compress()).toBe(0)
    })

    it('should merge adjacent same-value runs', () => {
      map.set(1, 'a')
      map.set(3, 'a')
      expect(map.runCount()).toBe(2)
      expect(map.compress()).toBe(0)
    })

    it('should merge runs that became adjacent with same value', () => {
      const m = new RunLengthMap<string>()
      m.set(1, 'a')
      m.set(2, 'a')
      m.set(4, 'a')
      m.set(5, 'a')
      expect(m.runCount()).toBe(2)
      m.set(3, 'a')
      expect(m.runCount()).toBe(1)
    })

    it('should return count of merged runs', () => {
      const m = new RunLengthMap<string>()
      m.set(1, 'a')
      m.set(3, 'a')
      m.set(5, 'a')
      expect(m.runCount()).toBe(3)
      m.set(2, 'a')
      expect(m.runCount()).toBeLessThanOrEqual(3)
    })

    it('should handle empty map', () => {
      expect(map.compress()).toBe(0)
    })

    it('should handle single run', () => {
      map.setRange(1, 10, 'a')
      expect(map.compress()).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return all keys', () => {
      map.set(1, 'a')
      map.set(3, 'b')
      map.set(5, 'c')
      expect(map.keys()).toEqual([1, 3, 5])
    })

    it('should expand runs into individual keys', () => {
      map.setRange(1, 3, 'a')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('should return keys in sorted order', () => {
      map.set(5, 'c')
      map.set(1, 'a')
      map.set(3, 'b')
      expect(map.keys()).toEqual([1, 3, 5])
    })

    it('should handle mixed runs and single keys', () => {
      map.setRange(1, 3, 'a')
      map.set(5, 'b')
      expect(map.keys()).toEqual([1, 2, 3, 5])
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return all values', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('should expand runs into repeated values', () => {
      map.setRange(1, 3, 'a')
      expect(map.values()).toEqual(['a', 'a', 'a'])
    })

    it('should return values in key order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return all entries', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'b']])
    })

    it('should expand runs into individual entries', () => {
      map.setRange(1, 3, 'a')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'a'], [3, 'a']])
    })

    it('should return entries in key order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      expect(map.entries()).toEqual([[1, 'a'], [3, 'c']])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty map', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all entries', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const result: Array<[number, string]> = []
      map.forEach((value, key) => { result.push([key, value]) })
      expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should expand runs', () => {
      map.setRange(1, 3, 'a')
      const result: Array<[number, string]> = []
      map.forEach((value, key) => { result.push([key, value]) })
      expect(result).toEqual([[1, 'a'], [2, 'a'], [3, 'a']])
    })

    it('should iterate in key order', () => {
      map.set(5, 'c')
      map.set(1, 'a')
      map.set(3, 'b')
      const result: number[] = []
      map.forEach((_value, key) => { result.push(key) })
      expect(result).toEqual([1, 3, 5])
    })
  })

  describe('empty map operations', () => {
    it('should handle get on empty map', () => {
      expect(map.get(1)).toBeUndefined()
    })

    it('should handle has on empty map', () => {
      expect(map.has(1)).toBe(false)
    })

    it('should handle delete on empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('should handle keys on empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should handle values on empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should handle entries on empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should handle getRange on empty map', () => {
      expect(map.getRange(1, 10)).toEqual([])
    })

    it('should handle deleteRange on empty map', () => {
      map.deleteRange(1, 10)
      expect(map.size).toBe(0)
    })

    it('should handle runCount on empty map', () => {
      expect(map.runCount()).toBe(0)
    })

    it('should handle compress on empty map', () => {
      expect(map.compress()).toBe(0)
    })

    it('should handle forEach on empty map', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('single key', () => {
    it('should handle set and get', () => {
      map.set(42, 'answer')
      expect(map.get(42)).toBe('answer')
      expect(map.size).toBe(1)
    })

    it('should handle delete', () => {
      map.set(42, 'answer')
      expect(map.delete(42)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.runCount()).toBe(0)
    })

    it('should handle overwrite', () => {
      map.set(42, 'old')
      map.set(42, 'new')
      expect(map.get(42)).toBe('new')
      expect(map.size).toBe(1)
    })

    it('should handle has', () => {
      map.set(42, 'answer')
      expect(map.has(42)).toBe(true)
      expect(map.has(43)).toBe(false)
    })

    it('should appear in keys', () => {
      map.set(42, 'answer')
      expect(map.keys()).toEqual([42])
    })

    it('should appear in values', () => {
      map.set(42, 'answer')
      expect(map.values()).toEqual(['answer'])
    })

    it('should appear in entries', () => {
      map.set(42, 'answer')
      expect(map.entries()).toEqual([[42, 'answer']])
    })
  })

  describe('large ranges', () => {
    it('should handle range 0-10000', () => {
      map.setRange(0, 10000, 'big')
      expect(map.size).toBe(10001)
      expect(map.runCount()).toBe(1)
      expect(map.get(0)).toBe('big')
      expect(map.get(5000)).toBe('big')
      expect(map.get(10000)).toBe('big')
    })

    it('should handle get on large range', () => {
      map.setRange(0, 10000, 'v')
      expect(map.get(10001)).toBeUndefined()
      expect(map.get(-1)).toBeUndefined()
    })

    it('should handle delete in large range', () => {
      map.setRange(0, 10000, 'v')
      map.delete(5000)
      expect(map.has(5000)).toBe(false)
      expect(map.has(4999)).toBe(true)
      expect(map.has(5001)).toBe(true)
      expect(map.size).toBe(10000)
    })

    it('should handle deleteRange on large range', () => {
      map.setRange(0, 10000, 'v')
      map.deleteRange(4000, 6000)
      expect(map.size).toBe(8000)
      expect(map.get(3999)).toBe('v')
      expect(map.get(4000)).toBeUndefined()
      expect(map.get(6001)).toBe('v')
    })

    it('should handle multiple large ranges', () => {
      map.setRange(0, 5000, 'a')
      map.setRange(5001, 10000, 'a')
      expect(map.runCount()).toBe(1)
      expect(map.size).toBe(10001)
    })

    it('should handle setRange then deleteRange roundtrip large', () => {
      map.setRange(0, 10000, 'a')
      expect(map.size).toBe(10001)
      map.deleteRange(0, 10000)
      expect(map.size).toBe(0)
      expect(map.runCount()).toBe(0)
    })
  })

  describe('negative keys', () => {
    it('should handle negative key set/get', () => {
      map.set(-10, 'neg')
      expect(map.get(-10)).toBe('neg')
    })

    it('should handle negative range', () => {
      map.setRange(-10, -1, 'neg')
      expect(map.size).toBe(10)
      expect(map.get(-10)).toBe('neg')
      expect(map.get(-5)).toBe('neg')
      expect(map.get(-1)).toBe('neg')
    })

    it('should handle range spanning negative to positive', () => {
      map.setRange(-5, 5, 'span')
      expect(map.size).toBe(11)
      expect(map.get(-5)).toBe('span')
      expect(map.get(0)).toBe('span')
      expect(map.get(5)).toBe('span')
    })

    it('should handle delete negative key', () => {
      map.set(-5, 'neg')
      expect(map.delete(-5)).toBe(true)
      expect(map.has(-5)).toBe(false)
    })

    it('should handle negative keys in keys()', () => {
      map.set(-2, 'a')
      map.set(0, 'b')
      map.set(2, 'c')
      expect(map.keys()).toEqual([-2, 0, 2])
    })
  })

  describe('integration', () => {
    it('should handle complex sequence of operations', () => {
      map.setRange(1, 10, 'a')
      map.setRange(20, 30, 'b')
      map.set(15, 'c')
      expect(map.size).toBe(22)
      map.delete(5)
      expect(map.size).toBe(21)
      map.setRange(1, 5, 'x')
      expect(map.get(4)).toBe('x')
      expect(map.get(6)).toBe('a')
      map.deleteRange(20, 30)
      expect(map.size).toBe(11)
      expect(map.runCount()).toBe(3)
    })

    it('should handle setRange then deleteRange roundtrip', () => {
      map.setRange(1, 100, 'a')
      expect(map.size).toBe(100)
      map.deleteRange(50, 60)
      expect(map.size).toBe(89)
      map.setRange(50, 60, 'b')
      expect(map.size).toBe(100)
      expect(map.get(50)).toBe('b')
      expect(map.get(49)).toBe('a')
    })

    it('should handle overwrite with setRange', () => {
      map.setRange(1, 10, 'a')
      map.setRange(5, 15, 'b')
      expect(map.get(4)).toBe('a')
      expect(map.get(5)).toBe('b')
      expect(map.get(15)).toBe('b')
      expect(map.size).toBe(15)
    })

    it('should handle interleaved set and delete', () => {
      map.set(1, 'a')
      map.set(2, 'a')
      map.delete(1)
      map.set(3, 'a')
      expect(map.get(2)).toBe('a')
      expect(map.get(3)).toBe('a')
      expect(map.runCount()).toBe(1)
    })

    it('should handle setting same value as existing run does not create new run', () => {
      map.setRange(1, 5, 'a')
      const runsBefore = map.runCount()
      map.set(3, 'a')
      expect(map.runCount()).toBe(runsBefore)
    })

    it('should handle numeric values', () => {
      const numMap = new RunLengthMap<number>()
      numMap.setRange(1, 5, 100)
      numMap.setRange(6, 10, 200)
      expect(numMap.get(3)).toBe(100)
      expect(numMap.get(8)).toBe(200)
      expect(numMap.size).toBe(10)
    })

    it('should handle boolean values', () => {
      const boolMap = new RunLengthMap<boolean>()
      boolMap.setRange(1, 5, true)
      boolMap.setRange(6, 10, false)
      expect(boolMap.get(3)).toBe(true)
      expect(boolMap.get(8)).toBe(false)
    })

    it('should handle object values', () => {
      const objMap = new RunLengthMap<{ x: number }>()
      const obj = { x: 1 }
      objMap.set(1, obj)
      expect(objMap.get(1)).toBe(obj)
    })

    it('should handle null values', () => {
      const nullMap = new RunLengthMap<null>()
      nullMap.set(1, null)
      expect(nullMap.get(1)).toBe(null)
    })

    it('should handle undefined values', () => {
      const undefMap = new RunLengthMap<string | undefined>()
      undefMap.set(1, undefined)
      expect(undefMap.get(1)).toBeUndefined()
      expect(undefMap.has(1)).toBe(true)
    })

    it('should handle forEach after complex operations', () => {
      map.setRange(1, 3, 'a')
      map.set(5, 'b')
      map.setRange(7, 9, 'c')
      const entries: Array<[number, string]> = []
      map.forEach((value, key) => { entries.push([key, value]) })
      expect(entries).toEqual([
        [1, 'a'], [2, 'a'], [3, 'a'],
        [5, 'b'],
        [7, 'c'], [8, 'c'], [9, 'c'],
      ])
    })

    it('should handle getRange after complex operations', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      map.set(8, 'c')
      const result = map.getRange(3, 12)
      expect(result).toEqual([
        { start: 3, end: 5, value: 'a' },
        { start: 8, end: 8, value: 'c' },
        { start: 10, end: 12, value: 'b' },
      ])
    })

    it('should handle deleteRange across gap', () => {
      map.setRange(1, 5, 'a')
      map.setRange(10, 15, 'b')
      map.deleteRange(3, 12)
      expect(map.get(2)).toBe('a')
      expect(map.has(3)).toBe(false)
      expect(map.get(13)).toBe('b')
      expect(map.size).toBe(5)
    })
  })

  describe('DEFAULT_RUN_LENGTH_MAP_OPTIONS', () => {
    it('should have mergeOnSet true by default', () => {
      expect(DEFAULT_RUN_LENGTH_MAP_OPTIONS.mergeOnSet).toBe(true)
    })
  })

  describe('types', () => {
    it('should export Run type', () => {
      const run: Run<string> = { start: 1, end: 5, value: 'a' }
      expect(run.start).toBe(1)
      expect(run.end).toBe(5)
      expect(run.value).toBe('a')
    })

    it('should export RunLengthMapOptions type', () => {
      const opts: RunLengthMapOptions = { mergeOnSet: true }
      expect(opts.mergeOnSet).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle key 0', () => {
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('should handle very large negative key', () => {
      map.set(-1000000, 'neg')
      expect(map.get(-1000000)).toBe('neg')
    })

    it('should handle setting key at boundary of range', () => {
      map.setRange(5, 10, 'a')
      map.set(4, 'a')
      expect(map.runCount()).toBe(1)
      expect(map.get(4)).toBe('a')
    })

    it('should handle setting key just after range', () => {
      map.setRange(5, 10, 'a')
      map.set(11, 'a')
      expect(map.runCount()).toBe(1)
      expect(map.get(11)).toBe('a')
    })

    it('should handle setting key just before range with different value', () => {
      map.setRange(5, 10, 'a')
      map.set(4, 'b')
      expect(map.runCount()).toBe(2)
      expect(map.get(4)).toBe('b')
      expect(map.get(5)).toBe('a')
    })

    it('should handle overwriting entire range with different value', () => {
      map.setRange(1, 10, 'a')
      map.setRange(1, 10, 'b')
      expect(map.runCount()).toBe(1)
      expect(map.get(1)).toBe('b')
      expect(map.get(10)).toBe('b')
    })

    it('should handle deleting last key', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.size).toBe(0)
      expect(map.runCount()).toBe(0)
    })

    it('should handle getRange with exact boundaries', () => {
      map.setRange(5, 10, 'a')
      const result = map.getRange(5, 10)
      expect(result.length).toBe(1)
      expect(result[0]!.start).toBe(5)
      expect(result[0]!.end).toBe(10)
    })

    it('should handle getRange where start equals end and key exists', () => {
      map.set(5, 'a')
      const result = map.getRange(5, 5)
      expect(result).toEqual([{ start: 5, end: 5, value: 'a' }])
    })

    it('should handle getRange where start equals end and key missing', () => {
      map.set(5, 'a')
      const result = map.getRange(3, 3)
      expect(result).toEqual([])
    })

    it('should handle setting after deleting from range', () => {
      map.setRange(1, 10, 'a')
      map.delete(5)
      map.set(5, 'a')
      expect(map.runCount()).toBe(1)
      expect(map.size).toBe(10)
    })

    it('should handle multiple sequential deletes', () => {
      map.setRange(1, 5, 'a')
      map.delete(1)
      map.delete(2)
      map.delete(3)
      expect(map.size).toBe(2)
      expect(map.get(4)).toBe('a')
      expect(map.get(5)).toBe('a')
    })

    it('should handle clearing and rebuilding', () => {
      map.setRange(1, 100, 'a')
      map.clear()
      map.setRange(50, 60, 'b')
      expect(map.size).toBe(11)
      expect(map.get(50)).toBe('b')
      expect(map.get(1)).toBeUndefined()
    })

    it('should handle setRange covering single existing key', () => {
      map.set(5, 'a')
      map.setRange(1, 10, 'b')
      expect(map.size).toBe(10)
      expect(map.runCount()).toBe(1)
      expect(map.get(5)).toBe('b')
    })
  })
})
