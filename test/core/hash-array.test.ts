import { describe, it, expect, beforeEach } from 'vitest'
import { HashArray } from '../../src/core/hash-array/hash-array.js'
import { DEFAULT_HASH_ARRAY_OPTIONS } from '../../src/core/hash-array/types.js'
import type { HashArrayOptions, HashArrayJSON, HashArrayStatistics } from '../../src/core/hash-array/types.js'

describe('HashArray', () => {
  let ha: HashArray<number>

  beforeEach(() => {
    ha = new HashArray<number>()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const h = new HashArray()
      expect(h.isEmpty).toBe(true)
      expect(h.length).toBe(0)
    })

    it('should accept empty options object', () => {
      const h = new HashArray({})
      expect(h.length).toBe(0)
    })

    it('should accept initialCapacity option', () => {
      const h = new HashArray({ initialCapacity: 32 })
      expect(h.length).toBe(0)
    })

    it('should accept custom hashFn option', () => {
      const h = new HashArray({ hashFn: () => 'constant' })
      expect(h.length).toBe(0)
    })

    it('should accept partial options with defaults', () => {
      const h = new HashArray({ initialCapacity: 64 })
      expect(h.length).toBe(0)
    })

    it('should use DEFAULT_HASH_ARRAY_OPTIONS.initialCapacity', () => {
      expect(DEFAULT_HASH_ARRAY_OPTIONS.initialCapacity).toBe(16)
    })

    it('should use DEFAULT_HASH_ARRAY_OPTIONS.hashFn', () => {
      expect(typeof DEFAULT_HASH_ARRAY_OPTIONS.hashFn).toBe('function')
    })

    it('should allow type-only options import', () => {
      const opts: HashArrayOptions = { initialCapacity: 10 }
      const h = new HashArray(opts)
      expect(h.length).toBe(0)
    })
  })

  describe('push', () => {
    it('should append a value and return index 0', () => {
      expect(ha.push(10)).toBe(0)
    })

    it('should append multiple values with increasing indices', () => {
      expect(ha.push(1)).toBe(0)
      expect(ha.push(2)).toBe(1)
      expect(ha.push(3)).toBe(2)
    })

    it('should increase length', () => {
      ha.push(1)
      ha.push(2)
      expect(ha.length).toBe(2)
    })

    it('should increase denseLength', () => {
      ha.push(1)
      expect(ha.denseLength).toBe(1)
    })

    it('should set isEmpty to false', () => {
      ha.push(1)
      expect(ha.isEmpty).toBe(false)
    })

    it('should track push statistics', () => {
      ha.push(1)
      ha.push(2)
      expect(ha.getStatistics().pushes).toBe(2)
    })

    it('should update maxDenseLength', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.getStatistics().maxDenseLength).toBe(3)
    })

    it('should grow capacity when needed', () => {
      const h = new HashArray<number>({ initialCapacity: 2 })
      h.push(1)
      h.push(2)
      h.push(3)
      expect(h.length).toBe(3)
      expect(h.get(2)).toBe(3)
    })
  })

  describe('pop', () => {
    it('should return undefined on empty array', () => {
      expect(ha.pop()).toBeUndefined()
    })

    it('should return the last pushed value', () => {
      ha.push(1)
      ha.push(2)
      expect(ha.pop()).toBe(2)
    })

    it('should decrease length', () => {
      ha.push(1)
      ha.push(2)
      ha.pop()
      expect(ha.length).toBe(1)
    })

    it('should decrease denseLength', () => {
      ha.push(1)
      ha.push(2)
      ha.pop()
      expect(ha.denseLength).toBe(1)
    })

    it('should track pop statistics', () => {
      ha.push(1)
      ha.pop()
      expect(ha.getStatistics().pops).toBe(1)
    })

    it('should not track pop when empty', () => {
      ha.pop()
      expect(ha.getStatistics().pops).toBe(0)
    })

    it('should pop all values in LIFO order', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.pop()).toBe(3)
      expect(ha.pop()).toBe(2)
      expect(ha.pop()).toBe(1)
    })

    it('should skip gaps when popping', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(2)
      expect(ha.pop()).toBe(2)
    })

    it('should set isEmpty after popping all', () => {
      ha.push(1)
      ha.pop()
      expect(ha.isEmpty).toBe(true)
    })
  })

  describe('get', () => {
    it('should return undefined for out-of-bounds index', () => {
      expect(ha.get(0)).toBeUndefined()
      expect(ha.get(-1)).toBeUndefined()
    })

    it('should return value at index', () => {
      ha.push(10)
      ha.push(20)
      expect(ha.get(0)).toBe(10)
      expect(ha.get(1)).toBe(20)
    })

    it('should return undefined for gap index', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(1)
      expect(ha.get(1)).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      ha.push(1)
      expect(ha.get(-5)).toBeUndefined()
    })

    it('should return undefined for index beyond length', () => {
      ha.push(1)
      expect(ha.get(100)).toBeUndefined()
    })
  })

  describe('set', () => {
    it('should set value at existing index', () => {
      ha.push(1)
      ha.set(0, 99)
      expect(ha.get(0)).toBe(99)
    })

    it('should set value beyond current length', () => {
      ha.set(5, 42)
      expect(ha.get(5)).toBe(42)
      expect(ha.length).toBe(6)
    })

    it('should increase denseLength when filling gap', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(1)
      expect(ha.denseLength).toBe(1)
      ha.set(1, 99)
      expect(ha.denseLength).toBe(2)
    })

    it('should track set statistics', () => {
      ha.set(0, 1)
      expect(ha.getStatistics().sets).toBe(1)
    })

    it('should not change denseLength when overwriting', () => {
      ha.push(1)
      ha.set(0, 99)
      expect(ha.denseLength).toBe(1)
    })

    it('should ignore negative index', () => {
      ha.set(-1, 5)
      expect(ha.length).toBe(0)
    })

    it('should grow capacity if needed', () => {
      ha.set(100, 42)
      expect(ha.get(100)).toBe(42)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for value not found', () => {
      expect(ha.indexOf(999)).toBe(-1)
    })

    it('should return index of found value', () => {
      ha.push(10)
      ha.push(20)
      ha.push(30)
      expect(ha.indexOf(20)).toBe(1)
    })

    it('should return first index of duplicate values', () => {
      ha.push(5)
      ha.push(5)
      ha.push(5)
      expect(ha.indexOf(5)).toBe(0)
    })

    it('should return -1 on empty array', () => {
      expect(ha.indexOf(1)).toBe(-1)
    })

    it('should skip gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.indexOf(2)).toBe(-1)
      expect(ha.indexOf(3)).toBe(2)
    })

    it('should use custom hashFn for comparison', () => {
      const h = new HashArray<{ id: number }>({ hashFn: (v) => String((v as { id: number }).id) })
      h.push({ id: 1 })
      h.push({ id: 2 })
      expect(h.indexOf({ id: 1 })).toBe(0)
    })
  })

  describe('includes', () => {
    it('should return false for empty array', () => {
      expect(ha.includes(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      ha.push(42)
      expect(ha.includes(42)).toBe(true)
    })

    it('should return false for missing value', () => {
      ha.push(1)
      expect(ha.includes(2)).toBe(false)
    })

    it('should find value after gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.includes(3)).toBe(true)
      expect(ha.includes(2)).toBe(false)
    })
  })

  describe('removeAt', () => {
    it('should return undefined for out-of-bounds', () => {
      expect(ha.removeAt(0)).toBeUndefined()
      expect(ha.removeAt(-1)).toBeUndefined()
    })

    it('should return removed value', () => {
      ha.push(42)
      expect(ha.removeAt(0)).toBe(42)
    })

    it('should leave gap at index', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.get(1)).toBeUndefined()
      expect(ha.get(0)).toBe(1)
      expect(ha.get(2)).toBe(3)
    })

    it('should decrease denseLength', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(0)
      expect(ha.denseLength).toBe(1)
    })

    it('should track remove statistics', () => {
      ha.push(1)
      ha.removeAt(0)
      expect(ha.getStatistics().removes).toBe(1)
    })

    it('should track gap statistics', () => {
      ha.push(1)
      ha.removeAt(0)
      expect(ha.getStatistics().gaps).toBe(1)
    })

    it('should return undefined for already-empty slot', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(1)
      expect(ha.removeAt(1)).toBeUndefined()
    })

    it('should trim length when removing last element', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(1)
      expect(ha.length).toBe(1)
    })
  })

  describe('delete', () => {
    it('should return true for successful delete', () => {
      ha.push(1)
      expect(ha.delete(0)).toBe(true)
    })

    it('should return false for out-of-bounds', () => {
      expect(ha.delete(0)).toBe(false)
    })

    it('should return false for gap', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(1)
      expect(ha.delete(1)).toBe(false)
    })

    it('should remove value at index', () => {
      ha.push(10)
      ha.delete(0)
      expect(ha.get(0)).toBeUndefined()
    })
  })

  describe('length', () => {
    it('should be 0 for new array', () => {
      expect(ha.length).toBe(0)
    })

    it('should increase with push', () => {
      ha.push(1)
      expect(ha.length).toBe(1)
    })

    it('should decrease with pop', () => {
      ha.push(1)
      ha.pop()
      expect(ha.length).toBe(0)
    })

    it('should expand with set beyond length', () => {
      ha.set(10, 5)
      expect(ha.length).toBe(11)
    })
  })

  describe('denseLength', () => {
    it('should be 0 for new array', () => {
      expect(ha.denseLength).toBe(0)
    })

    it('should count only non-empty slots', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.denseLength).toBe(2)
    })

    it('should equal length when no gaps', () => {
      ha.push(1)
      ha.push(2)
      expect(ha.denseLength).toBe(ha.length)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new array', () => {
      expect(ha.isEmpty).toBe(true)
    })

    it('should be false after push', () => {
      ha.push(1)
      expect(ha.isEmpty).toBe(false)
    })

    it('should be true after removing all', () => {
      ha.push(1)
      ha.removeAt(0)
      expect(ha.isEmpty).toBe(true)
    })

    it('should be false with gaps but values present', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(0)
      expect(ha.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('should reset length to 0', () => {
      ha.push(1)
      ha.push(2)
      ha.clear()
      expect(ha.length).toBe(0)
    })

    it('should reset denseLength to 0', () => {
      ha.push(1)
      ha.clear()
      expect(ha.denseLength).toBe(0)
    })

    it('should set isEmpty to true', () => {
      ha.push(1)
      ha.clear()
      expect(ha.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(0)
      ha.clear()
      const stats = ha.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.compacts).toBe(0)
      expect(stats.gaps).toBe(0)
      expect(stats.maxDenseLength).toBe(0)
    })

    it('should allow push after clear', () => {
      ha.push(1)
      ha.clear()
      ha.push(2)
      expect(ha.get(0)).toBe(2)
    })
  })

  describe('compact', () => {
    it('should remove gaps and reindex', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      ha.compact()
      expect(ha.get(0)).toBe(1)
      expect(ha.get(1)).toBe(3)
      expect(ha.get(2)).toBeUndefined()
    })

    it('should reset denseLength to length', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      ha.compact()
      expect(ha.denseLength).toBe(ha.length)
    })

    it('should track compact statistics', () => {
      ha.push(1)
      ha.compact()
      expect(ha.getStatistics().compacts).toBe(1)
    })

    it('should reset gap count', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(0)
      ha.compact()
      expect(ha.getStatistics().gaps).toBe(0)
    })

    it('should handle already-compact array', () => {
      ha.push(1)
      ha.push(2)
      ha.compact()
      expect(ha.length).toBe(2)
      expect(ha.get(0)).toBe(1)
      expect(ha.get(1)).toBe(2)
    })

    it('should handle empty array', () => {
      ha.compact()
      expect(ha.length).toBe(0)
    })

    it('should preserve order', () => {
      ha.push(10)
      ha.push(20)
      ha.push(30)
      ha.push(40)
      ha.removeAt(1)
      ha.removeAt(2)
      ha.compact()
      expect(ha.toArray()).toEqual([10, 40])
    })
  })

  describe('fill', () => {
    it('should fill entire array with value', () => {
      ha.push(0)
      ha.push(0)
      ha.fill(99)
      expect(ha.get(0)).toBe(99)
      expect(ha.get(1)).toBe(99)
    })

    it('should fill with start index', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.fill(0, 1)
      expect(ha.get(0)).toBe(1)
      expect(ha.get(1)).toBe(0)
      expect(ha.get(2)).toBe(0)
    })

    it('should fill with start and end', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.push(4)
      ha.fill(0, 1, 3)
      expect(ha.get(0)).toBe(1)
      expect(ha.get(1)).toBe(0)
      expect(ha.get(2)).toBe(0)
      expect(ha.get(3)).toBe(4)
    })

    it('should expand array if filling beyond length', () => {
      ha.fill(7, 0, 3)
      expect(ha.length).toBe(3)
    })
  })

  describe('slice', () => {
    it('should return dense slice of all values', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.slice()).toEqual([1, 2, 3])
    })

    it('should slice with start', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.slice(1)).toEqual([2, 3])
    })

    it('should slice with start and end', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.slice(0, 2)).toEqual([1, 2])
    })

    it('should skip gaps in slice', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.slice(0, 3)).toEqual([1, 3])
    })

    it('should return empty array for empty range', () => {
      ha.push(1)
      expect(ha.slice(5, 5)).toEqual([])
    })
  })

  describe('splice', () => {
    it('should remove elements and return them', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      const removed = ha.splice(1, 1)
      expect(removed).toEqual([2])
    })

    it('should remove elements and insert new ones', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.splice(1, 1, 20, 30)
      expect(ha.get(1)).toBe(20)
      expect(ha.get(2)).toBe(30)
    })

    it('should handle negative start', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      const removed = ha.splice(-2, 1)
      expect(removed).toEqual([2])
    })

    it('should handle splice with no deleteCount', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      const removed = ha.splice(1)
      expect(removed).toEqual([2, 3])
    })

    it('should handle splice with insert only', () => {
      ha.push(1)
      ha.push(3)
      ha.splice(1, 0, 2)
      expect(ha.get(1)).toBe(2)
    })

    it('should track remove and gap stats', () => {
      ha.push(1)
      ha.push(2)
      ha.splice(0, 1)
      expect(ha.getStatistics().removes).toBe(1)
    })

    it('should handle empty splice', () => {
      ha.push(1)
      ha.push(2)
      const removed = ha.splice(5, 0)
      expect(removed).toEqual([])
    })

    it('should grow capacity if needed for inserts', () => {
      ha.splice(0, 0, 1, 2, 3)
      expect(ha.get(0)).toBe(1)
      expect(ha.get(1)).toBe(2)
      expect(ha.get(2)).toBe(3)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty HashArray', () => {
      expect(ha.toArray()).toEqual([])
    })

    it('should return all non-empty values', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.toArray()).toEqual([1, 2, 3])
    })

    it('should skip gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.toArray()).toEqual([1, 3])
    })

    it('should preserve insertion order', () => {
      for (let i = 0; i < 10; i++) ha.push(i)
      expect(ha.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('forEach', () => {
    it('should iterate over dense values', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      const result: number[] = []
      ha.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      ha.push(10)
      ha.push(20)
      const indices: number[] = []
      ha.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('should skip gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      const result: number[] = []
      ha.forEach((v) => result.push(v))
      expect(result).toEqual([1, 3])
    })

    it('should not call callback on empty array', () => {
      let called = false
      ha.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should be iterable', () => {
      ha.push(1)
      ha.push(2)
      expect([...ha]).toEqual([1, 2])
    })

    it('should work with for-of', () => {
      ha.push(10)
      ha.push(20)
      const result: number[] = []
      for (const v of ha) result.push(v)
      expect(result).toEqual([10, 20])
    })

    it('should skip gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect([...ha]).toEqual([1, 3])
    })

    it('should yield nothing for empty array', () => {
      expect([...ha]).toEqual([])
    })
  })

  describe('map', () => {
    it('should map over dense values', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.map((v) => v * 2)).toEqual([2, 4, 6])
    })

    it('should provide correct indices', () => {
      ha.push(10)
      ha.push(20)
      const indices: number[] = []
      ha.map((_v, i) => { indices.push(i); return 0 })
      expect(indices).toEqual([0, 1])
    })

    it('should skip gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.map((v) => v * 10)).toEqual([10, 30])
    })

    it('should return empty array for empty HashArray', () => {
      expect(ha.map((v) => v)).toEqual([])
    })
  })

  describe('filter', () => {
    it('should filter dense values', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.push(4)
      expect(ha.filter((v) => v % 2 === 0)).toEqual([2, 4])
    })

    it('should skip gaps during filter', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.filter((v) => v > 0)).toEqual([1, 3])
    })

    it('should return empty array when no matches', () => {
      ha.push(1)
      ha.push(2)
      expect(ha.filter((v) => v > 10)).toEqual([])
    })
  })

  describe('reduce', () => {
    it('should reduce dense values', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      expect(ha.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('should skip gaps during reduce', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      expect(ha.reduce((acc, v) => acc + v, 0)).toBe(4)
    })

    it('should return initial for empty array', () => {
      expect(ha.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('should provide correct indices', () => {
      ha.push(10)
      ha.push(20)
      const indices: number[] = []
      ha.reduce((_acc, _v, i) => { indices.push(i); return 0 }, 0)
      expect(indices).toEqual([0, 1])
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats for new array', () => {
      const stats = ha.getStatistics()
      expect(stats.pushes).toBe(0)
      expect(stats.pops).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.compacts).toBe(0)
      expect(stats.gaps).toBe(0)
      expect(stats.maxDenseLength).toBe(0)
    })

    it('should track pushes', () => {
      ha.push(1)
      ha.push(2)
      expect(ha.getStatistics().pushes).toBe(2)
    })

    it('should track pops', () => {
      ha.push(1)
      ha.pop()
      expect(ha.getStatistics().pops).toBe(1)
    })

    it('should track sets', () => {
      ha.set(0, 1)
      expect(ha.getStatistics().sets).toBe(1)
    })

    it('should track removes', () => {
      ha.push(1)
      ha.removeAt(0)
      expect(ha.getStatistics().removes).toBe(1)
    })

    it('should track compacts', () => {
      ha.push(1)
      ha.compact()
      expect(ha.getStatistics().compacts).toBe(1)
    })

    it('should track gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.removeAt(0)
      expect(ha.getStatistics().gaps).toBe(1)
    })

    it('should track maxDenseLength', () => {
      for (let i = 0; i < 5; i++) ha.push(i)
      expect(ha.getStatistics().maxDenseLength).toBe(5)
    })

    it('should return a copy', () => {
      ha.push(1)
      const s1 = ha.getStatistics()
      ha.push(2)
      const s2 = ha.getStatistics()
      expect(s1.pushes).toBe(1)
      expect(s2.pushes).toBe(2)
    })

    it('should allow type import for statistics', () => {
      const stats: HashArrayStatistics = ha.getStatistics()
      expect(stats.pushes).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      ha.push(1)
      ha.push(2)
      const json = ha.toJSON()
      expect(json).toHaveProperty('slots')
      expect(json).toHaveProperty('capacity')
      expect(json).toHaveProperty('length')
      expect(json).toHaveProperty('denseLength')
      expect(json).toHaveProperty('statistics')
    })

    it('should serialize slots with indices', () => {
      ha.push(10)
      ha.push(20)
      const json = ha.toJSON()
      expect(json.slots.length).toBe(2)
      expect(json.slots[0]).toEqual({ index: 0, value: 10 })
      expect(json.slots[1]).toEqual({ index: 1, value: 20 })
    })

    it('should skip gaps in serialization', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      const json = ha.toJSON()
      expect(json.slots.length).toBe(2)
    })

    it('should include statistics', () => {
      ha.push(1)
      const json = ha.toJSON()
      expect(json.statistics.pushes).toBe(1)
    })

    it('should allow type import for JSON', () => {
      const json: HashArrayJSON<number> = ha.toJSON()
      expect(json.length).toBe(0)
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized HashArray', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      const json = ha.toJSON()
      const restored = HashArray.fromJSON(json)
      expect(restored.length).toBe(3)
      expect(restored.get(0)).toBe(1)
      expect(restored.get(1)).toBe(2)
      expect(restored.get(2)).toBe(3)
    })

    it('should preserve gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      const json = ha.toJSON()
      const restored = HashArray.fromJSON(json)
      expect(restored.get(1)).toBeUndefined()
      expect(restored.denseLength).toBe(2)
    })

    it('should preserve statistics', () => {
      ha.push(1)
      ha.push(2)
      const json = ha.toJSON()
      const restored = HashArray.fromJSON(json)
      expect(restored.getStatistics().pushes).toBe(2)
    })

    it('should allow operations after restore', () => {
      ha.push(1)
      const restored = HashArray.fromJSON(ha.toJSON())
      restored.push(2)
      expect(restored.get(1)).toBe(2)
    })

    it('should round-trip correctly', () => {
      for (let i = 0; i < 20; i++) ha.push(i)
      const json = ha.toJSON()
      const restored = HashArray.fromJSON(json)
      const json2 = restored.toJSON()
      expect(json.slots).toEqual(json2.slots)
      expect(json.length).toBe(json2.length)
    })
  })

  describe('sparse insertion', () => {
    it('should support set at arbitrary index', () => {
      ha.set(5, 50)
      ha.set(10, 100)
      expect(ha.get(5)).toBe(50)
      expect(ha.get(10)).toBe(100)
      expect(ha.length).toBe(11)
    })

    it('should report correct denseLength with sparse data', () => {
      ha.set(0, 1)
      ha.set(5, 5)
      ha.set(10, 10)
      expect(ha.denseLength).toBe(3)
    })

    it('should iterate only over filled slots', () => {
      ha.set(0, 1)
      ha.set(3, 3)
      ha.set(7, 7)
      expect([...ha]).toEqual([1, 3, 7])
    })

    it('should allow push after sparse set', () => {
      ha.set(10, 30)
      const idx = ha.push(99)
      expect(idx).toBe(11)
      expect(ha.get(11)).toBe(99)
    })
  })

  describe('generic type support', () => {
    it('should work with strings', () => {
      const h = new HashArray<string>()
      h.push('hello')
      h.push('world')
      expect(h.get(0)).toBe('hello')
      expect(h.get(1)).toBe('world')
    })

    it('should work with objects', () => {
      const h = new HashArray<{ id: number }>()
      h.push({ id: 1 })
      h.push({ id: 2 })
      expect(h.get(0)?.id).toBe(1)
    })

    it('should work with booleans', () => {
      const h = new HashArray<boolean>()
      h.push(true)
      h.push(false)
      expect(h.toArray()).toEqual([true, false])
    })

    it('should work with null values', () => {
      const h = new HashArray<null>()
      h.push(null)
      expect(h.get(0)).toBe(null)
      expect(h.length).toBe(1)
    })
  })

  describe('DEFAULT_HASH_ARRAY_OPTIONS', () => {
    it('should have initialCapacity of 16', () => {
      expect(DEFAULT_HASH_ARRAY_OPTIONS.initialCapacity).toBe(16)
    })

    it('should have hashFn as a function', () => {
      expect(typeof DEFAULT_HASH_ARRAY_OPTIONS.hashFn).toBe('function')
    })

    it('should have hashFn that produces strings', () => {
      expect(typeof DEFAULT_HASH_ARRAY_OPTIONS.hashFn(42)).toBe('string')
    })
  })

  describe('exports', () => {
    it('should export HashArray class', () => {
      expect(HashArray).toBeDefined()
      expect(typeof HashArray).toBe('function')
    })

    it('should export DEFAULT_HASH_ARRAY_OPTIONS', () => {
      expect(DEFAULT_HASH_ARRAY_OPTIONS).toBeDefined()
    })

    it('should allow type-only import for HashArrayOptions', () => {
      const opts: HashArrayOptions = {}
      const h = new HashArray(opts)
      expect(h.length).toBe(0)
    })

    it('should allow type-only import for HashArrayJSON', () => {
      const h = new HashArray<number>()
      const json: HashArrayJSON<number> = h.toJSON()
      expect(json.length).toBe(0)
    })

    it('should allow type-only import for HashArrayStatistics', () => {
      const stats: HashArrayStatistics = ha.getStatistics()
      expect(stats.pushes).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle push-pop-push cycle', () => {
      ha.push(1)
      ha.pop()
      ha.push(2)
      expect(ha.get(0)).toBe(2)
    })

    it('should handle many pushes', () => {
      for (let i = 0; i < 100; i++) ha.push(i)
      expect(ha.length).toBe(100)
      expect(ha.denseLength).toBe(100)
    })

    it('should handle remove-push creating gaps', () => {
      ha.push(1)
      ha.push(2)
      ha.push(3)
      ha.removeAt(1)
      ha.push(4)
      expect(ha.length).toBe(4)
      expect(ha.get(3)).toBe(4)
    })

    it('should handle set at index 0', () => {
      ha.set(0, 42)
      expect(ha.get(0)).toBe(42)
      expect(ha.length).toBe(1)
    })

    it('should handle clear then reuse', () => {
      for (let i = 0; i < 10; i++) ha.push(i)
      ha.clear()
      expect(ha.isEmpty).toBe(true)
      ha.push(99)
      expect(ha.get(0)).toBe(99)
    })

    it('should handle compact on empty', () => {
      ha.compact()
      expect(ha.length).toBe(0)
      expect(ha.denseLength).toBe(0)
    })

    it('should handle fill on empty range', () => {
      ha.fill(1, 0, 0)
      expect(ha.length).toBe(0)
    })

    it('should handle splice beyond length', () => {
      const removed = ha.splice(10, 5)
      expect(removed).toEqual([])
    })

    it('should handle repeated removeAt same index', () => {
      ha.push(1)
      ha.removeAt(0)
      ha.removeAt(0)
      expect(ha.getStatistics().removes).toBe(1)
    })

    it('should handle indexOf with null', () => {
      const h = new HashArray<null>()
      h.push(null)
      expect(h.indexOf(null)).toBe(0)
    })
  })
})
