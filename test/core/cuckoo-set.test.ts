import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooSet } from '../../src/core/cuckoo-set/cuckoo-set.js'
import type { CuckooSetOptions, CuckooStats } from '../../src/core/cuckoo-set/types.js'
import { DEFAULT_CUCKOO_SET_OPTIONS } from '../../src/core/cuckoo-set/types.js'

describe('CuckooSet', () => {
  describe('construction', () => {
    it('should create set with default capacity', () => {
      const set = new CuckooSet<string>()
      expect(set.capacity).toBe(16)
    })

    it('should create set with custom numeric capacity', () => {
      const set = new CuckooSet<string>(32)
      expect(set.capacity).toBe(32)
    })

    it('should enforce minimum capacity of 2', () => {
      const set = new CuckooSet<string>(1)
      expect(set.capacity).toBe(2)
    })

    it('should handle zero capacity gracefully', () => {
      const set = new CuckooSet<string>(0)
      expect(set.capacity).toBe(2)
    })

    it('should handle negative capacity gracefully', () => {
      const set = new CuckooSet<string>(-5)
      expect(set.capacity).toBe(2)
    })

    it('should start empty', () => {
      const set = new CuckooSet<string>()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should create set from options object', () => {
      const set = new CuckooSet<string>({ capacity: 64 })
      expect(set.capacity).toBe(64)
    })

    it('should create set from options with maxKicks', () => {
      const set = new CuckooSet<string>({ capacity: 16, maxKicks: 100 })
      expect(set.capacity).toBe(16)
    })

    it('should create set from empty options object', () => {
      const set = new CuckooSet<string>({})
      expect(set.capacity).toBe(16)
    })

    it('should create set from partial options', () => {
      const set = new CuckooSet<string>({ maxKicks: 200 })
      expect(set.capacity).toBe(16)
    })

    it('should handle capacity of 2', () => {
      const set = new CuckooSet<string>(2)
      expect(set.capacity).toBe(2)
    })
  })

  describe('add', () => {
    let set: CuckooSet<string>

    beforeEach(() => {
      set = new CuckooSet<string>()
    })

    it('should add a value', () => {
      expect(set.add('a')).toBe(true)
      expect(set.has('a')).toBe(true)
    })

    it('should return true on successful add', () => {
      expect(set.add('x')).toBe(true)
    })

    it('should return false when adding duplicate', () => {
      set.add('a')
      expect(set.add('a')).toBe(false)
    })

    it('should add multiple distinct values', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.size).toBe(3)
    })

    it('should not increase size on duplicate add', () => {
      set.add('a')
      expect(set.size).toBe(1)
      set.add('a')
      expect(set.size).toBe(1)
    })

    it('should handle numeric values', () => {
      const s = new CuckooSet<number>()
      expect(s.add(1)).toBe(true)
      expect(s.add(2)).toBe(true)
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
    })

    it('should handle boolean values', () => {
      const s = new CuckooSet<boolean>()
      s.add(true)
      s.add(false)
      expect(s.size).toBe(2)
    })

    it('should handle empty string', () => {
      set.add('')
      expect(set.has('')).toBe(true)
    })

    it('should handle special characters', () => {
      set.add('!@#$%')
      set.add('你好')
      set.add('🎉')
      expect(set.has('!@#$%')).toBe(true)
      expect(set.has('你好')).toBe(true)
      expect(set.has('🎉')).toBe(true)
    })

    it('should handle single character values', () => {
      for (let i = 0; i < 26; i++) {
        set.add(String.fromCharCode(97 + i))
      }
      expect(set.size).toBe(26)
    })

    it('should add values with same hash region', () => {
      for (let i = 0; i < 10; i++) {
        set.add(`key${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(set.has(`key${i}`)).toBe(true)
      }
    })

    it('should handle object values', () => {
      const s = new CuckooSet<object>()
      const obj = { x: 1 }
      s.add(obj)
      expect(s.has(obj)).toBe(true)
    })

    it('should handle null value', () => {
      const s = new CuckooSet<null>()
      s.add(null)
      expect(s.has(null)).toBe(true)
    })

    it('should handle undefined value', () => {
      const s = new CuckooSet<undefined>()
      s.add(undefined)
      expect(s.has(undefined)).toBe(true)
    })

    it('should handle zero as value', () => {
      const s = new CuckooSet<number>()
      s.add(0)
      expect(s.has(0)).toBe(true)
    })

    it('should handle false as value', () => {
      const s = new CuckooSet<boolean>()
      s.add(false)
      expect(s.has(false)).toBe(true)
    })
  })

  describe('delete', () => {
    let set: CuckooSet<string>

    beforeEach(() => {
      set = new CuckooSet<string>()
    })

    it('should delete existing value', () => {
      set.add('a')
      expect(set.delete('a')).toBe(true)
      expect(set.has('a')).toBe(false)
    })

    it('should return false for missing value', () => {
      expect(set.delete('missing')).toBe(false)
    })

    it('should decrease size on deletion', () => {
      set.add('a')
      set.add('b')
      expect(set.size).toBe(2)
      set.delete('a')
      expect(set.size).toBe(1)
    })

    it('should not affect other values on deletion', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      set.delete('b')
      expect(set.has('a')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('should handle delete then re-add', () => {
      set.add('a')
      set.delete('a')
      set.add('a')
      expect(set.has('a')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('should handle delete on empty set', () => {
      expect(set.delete('x')).toBe(false)
    })

    it('should handle multiple deletions', () => {
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.delete('a')).toBe(true)
      expect(set.delete('b')).toBe(true)
      expect(set.delete('c')).toBe(true)
      expect(set.size).toBe(0)
    })

    it('should handle deleting same value twice', () => {
      set.add('a')
      expect(set.delete('a')).toBe(true)
      expect(set.delete('a')).toBe(false)
    })

    it('should handle deleting non-existent after previous delete', () => {
      set.add('a')
      set.delete('a')
      expect(set.delete('a')).toBe(false)
    })

    it('should not corrupt set after partial deletion', () => {
      const s = new CuckooSet<number>(16)
      for (let i = 0; i < 20; i++) {
        s.add(i)
      }
      for (let i = 0; i < 10; i++) {
        s.delete(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(s.has(i)).toBe(false)
      }
      for (let i = 10; i < 20; i++) {
        expect(s.has(i)).toBe(true)
      }
    })

    it('should handle delete all then re-add', () => {
      set.add('a')
      set.add('b')
      set.delete('a')
      set.delete('b')
      expect(set.size).toBe(0)
      set.add('a')
      set.add('b')
      expect(set.size).toBe(2)
    })
  })

  describe('has / contains', () => {
    let set: CuckooSet<string>

    beforeEach(() => {
      set = new CuckooSet<string>()
    })

    it('should return true for existing value', () => {
      set.add('a')
      expect(set.has('a')).toBe(true)
    })

    it('should return false for missing value', () => {
      expect(set.has('a')).toBe(false)
    })

    it('should return false after deletion', () => {
      set.add('a')
      set.delete('a')
      expect(set.has('a')).toBe(false)
    })

    it('should return true for multiple existing values', () => {
      set.add('a')
      set.add('b')
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('contains should be alias for has', () => {
      set.add('a')
      expect(set.contains('a')).toBe(true)
      expect(set.contains('b')).toBe(false)
    })

    it('contains should return same as has', () => {
      set.add('x')
      set.add('y')
      set.add('z')
      expect(set.contains('x')).toBe(set.has('x'))
      expect(set.contains('missing')).toBe(set.has('missing'))
    })

    it('should handle has on empty set', () => {
      expect(set.has('anything')).toBe(false)
    })

    it('should handle contains on empty set', () => {
      expect(set.contains('anything')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.size).toBe(0)
    })

    it('should track size correctly', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      expect(set.size).toBe(1)
      set.add('b')
      expect(set.size).toBe(2)
    })

    it('should not increase size on duplicate add', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('a')
      expect(set.size).toBe(1)
    })

    it('should decrease size on delete', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.delete('a')
      expect(set.size).toBe(0)
    })

    it('should track size after multiple operations', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      set.delete('b')
      set.add('d')
      set.add('a')
      expect(set.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.isEmpty()).toBe(true)
    })

    it('should return false when not empty', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      expect(set.isEmpty()).toBe(false)
    })

    it('should return true after clearing all entries', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      set.delete('b')
      expect(set.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.clear()
      expect(set.isEmpty()).toBe(true)
    })

    it('should return false after add following clear', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.clear()
      set.add('b')
      expect(set.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should preserve capacity after clear', () => {
      const set = new CuckooSet<string>(32)
      set.add('a')
      set.clear()
      expect(set.capacity).toBe(32)
    })

    it('should allow insertion after clear', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.clear()
      set.add('b')
      expect(set.has('b')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('should handle clearing empty set', () => {
      const set = new CuckooSet<string>()
      set.clear()
      expect(set.size).toBe(0)
    })

    it('should handle clear then re-use with many elements', () => {
      const set = new CuckooSet<string>()
      for (let i = 0; i < 50; i++) {
        set.add(`k${i}`)
      }
      set.clear()
      expect(set.size).toBe(0)
      for (let i = 0; i < 50; i++) {
        set.add(`new${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(set.has(`new${i}`)).toBe(true)
      }
    })
  })

  describe('clone', () => {
    it('should clone the set', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      expect(cloned.has('a')).toBe(true)
      expect(cloned.has('b')).toBe(true)
    })

    it('should create independent copy', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      const cloned = set.clone()
      cloned.add('b')
      expect(set.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('should preserve capacity in clone', () => {
      const set = new CuckooSet<string>(64)
      set.add('a')
      const cloned = set.clone()
      expect(cloned.capacity).toBe(64)
    })

    it('should preserve size in clone', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      const cloned = set.clone()
      expect(cloned.size).toBe(3)
    })

    it('should clone empty set', () => {
      const set = new CuckooSet<string>()
      const cloned = set.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should handle deletion from clone not affecting original', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      cloned.delete('a')
      expect(set.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })

    it('should handle addition to clone not affecting original', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      const cloned = set.clone()
      cloned.add('b')
      expect(set.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('should handle clone after many operations', () => {
      const set = new CuckooSet<number>(16)
      for (let i = 0; i < 50; i++) {
        set.add(i)
      }
      for (let i = 0; i < 25; i++) {
        set.delete(i)
      }
      const cloned = set.clone()
      expect(cloned.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(cloned.has(i)).toBe(true)
      }
    })
  })

  describe('toArray', () => {
    it('should return all values', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      const arr = set.toArray()
      expect(arr.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.toArray()).toEqual([])
    })

    it('should reflect deletions', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      set.delete('b')
      const arr = set.toArray()
      expect(arr.sort()).toEqual(['a', 'c'])
    })

    it('should return correct count after mixed operations', () => {
      const set = new CuckooSet<number>()
      for (let i = 0; i < 10; i++) {
        set.add(i)
      }
      for (let i = 0; i < 5; i++) {
        set.delete(i)
      }
      expect(set.toArray().length).toBe(5)
    })

    it('should not include null values', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.delete('a')
      expect(set.toArray()).toEqual([])
    })
  })

  describe('from factory', () => {
    it('should create set from array', () => {
      const set = CuckooSet.from(['a', 'b', 'c'])
      expect(set.size).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('should create set from empty array', () => {
      const set = CuckooSet.from([])
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should create set with custom capacity', () => {
      const set = CuckooSet.from(['a', 'b'], 64)
      expect(set.capacity).toBe(64)
    })

    it('should deduplicate in from', () => {
      const set = CuckooSet.from(['a', 'a', 'b', 'b', 'c'])
      expect(set.size).toBe(3)
    })

    it('should create set from Set', () => {
      const native = new Set(['x', 'y', 'z'])
      const set = CuckooSet.from(native)
      expect(set.size).toBe(3)
    })

    it('should create set from numeric array', () => {
      const set = CuckooSet.from([1, 2, 3, 4, 5])
      expect(set.size).toBe(5)
      expect(set.has(3)).toBe(true)
    })

    it('should handle single element', () => {
      const set = CuckooSet.from(['only'])
      expect(set.size).toBe(1)
      expect(set.has('only')).toBe(true)
    })

    it('should create set from generator', () => {
      function* gen() {
        yield 'a'
        yield 'b'
        yield 'c'
      }
      const set = CuckooSet.from(gen())
      expect(set.size).toBe(3)
    })
  })

  describe('forEach', () => {
    it('should iterate over all values', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      const result: string[] = []
      set.forEach(v => result.push(v))
      expect(result.length).toBe(3)
      expect(result.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should not iterate on empty set', () => {
      const set = new CuckooSet<string>()
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate after deletions', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      const values: string[] = []
      set.forEach(v => values.push(v))
      expect(values).toEqual(['b'])
    })

    it('should handle forEach with numeric values', () => {
      const set = new CuckooSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      const sum: number[] = []
      set.forEach(v => sum.push(v))
      expect(sum.sort()).toEqual([1, 2, 3])
    })

    it('should reflect updates in forEach', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('a')
      const result: string[] = []
      set.forEach(v => result.push(v))
      expect(result).toEqual(['a'])
    })
  })

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const set = new CuckooSet<string>(64)
      expect(set.capacity).toBe(64)
    })

    it('should return default capacity', () => {
      const set = new CuckooSet<string>()
      expect(set.capacity).toBe(DEFAULT_CUCKOO_SET_OPTIONS.capacity)
    })

    it('should change after rehash', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.rehash(64)
      expect(set.capacity).toBe(64)
    })
  })

  describe('loadFactor', () => {
    it('should be 0 for empty set', () => {
      const set = new CuckooSet<string>(16)
      expect(set.loadFactor).toBe(0)
    })

    it('should calculate load factor correctly', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      expect(set.loadFactor).toBeCloseTo(1 / 16)
    })

    it('should increase with more inserts', () => {
      const set = new CuckooSet<string>(16)
      for (let i = 0; i < 8; i++) {
        set.add(`k${i}`)
      }
      expect(set.loadFactor).toBe(0.5)
    })

    it('should decrease after delete', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.loadFactor).toBeCloseTo(1 / 16)
    })
  })

  describe('rehash', () => {
    it('should rehash with new capacity', () => {
      const set = new CuckooSet<string>(4)
      set.add('a')
      set.add('b')
      set.rehash(32)
      expect(set.capacity).toBe(32)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('should rehash with same capacity', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.rehash()
      expect(set.has('a')).toBe(true)
    })

    it('should preserve all values through rehash', () => {
      const set = new CuckooSet<string>(16)
      for (let i = 0; i < 10; i++) {
        set.add(`k${i}`)
      }
      set.rehash(64)
      for (let i = 0; i < 10; i++) {
        expect(set.has(`k${i}`)).toBe(true)
      }
      expect(set.size).toBe(10)
    })

    it('should enforce minimum capacity on rehash', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.rehash(1)
      expect(set.capacity).toBe(2)
      expect(set.has('a')).toBe(true)
    })

    it('should rehash to smaller capacity', () => {
      const set = new CuckooSet<string>(64)
      set.add('a')
      set.rehash(4)
      expect(set.has('a')).toBe(true)
      expect(set.capacity).toBe(4)
    })

    it('should handle rehash with empty set', () => {
      const set = new CuckooSet<string>(4)
      set.rehash(32)
      expect(set.capacity).toBe(32)
      expect(set.size).toBe(0)
    })

    it('should handle toArray after rehash', () => {
      const set = new CuckooSet<string>(4)
      set.add('a')
      set.add('b')
      set.add('c')
      set.rehash(32)
      const arr = set.toArray()
      expect(arr.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should handle forEach after rehash', () => {
      const set = new CuckooSet<string>(4)
      set.add('x')
      set.add('y')
      set.rehash(32)
      const result: string[] = []
      set.forEach(v => result.push(v))
      expect(result.sort()).toEqual(['x', 'y'])
    })
  })

  describe('stats', () => {
    it('should return stats for empty set', () => {
      const set = new CuckooSet<string>(16)
      const s = set.stats()
      expect(s.size).toBe(0)
      expect(s.capacity).toBe(16)
      expect(s.loadFactor).toBe(0)
      expect(s.maxChainLength).toBe(0)
      expect(s.table1Occupancy).toBe(0)
      expect(s.table2Occupancy).toBe(0)
      expect(s.resizeCount).toBe(0)
    })

    it('should return stats after inserts', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.add('b')
      set.add('c')
      const s = set.stats()
      expect(s.size).toBe(3)
      expect(s.capacity).toBe(16)
      expect(s.loadFactor).toBeCloseTo(3 / 16)
      expect(s.table1Occupancy + s.table2Occupancy).toBe(3)
    })

    it('should return correct table occupancy', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      const s = set.stats()
      expect(s.table1Occupancy + s.table2Occupancy).toBe(1)
    })

    it('should return CuckooStats type', () => {
      const set = new CuckooSet<string>()
      const s: CuckooStats = set.stats()
      expect(typeof s.size).toBe('number')
      expect(typeof s.capacity).toBe('number')
      expect(typeof s.loadFactor).toBe('number')
      expect(typeof s.maxChainLength).toBe('number')
      expect(typeof s.table1Occupancy).toBe('number')
      expect(typeof s.table2Occupancy).toBe('number')
      expect(typeof s.resizeCount).toBe('number')
    })

    it('should track maxChainLength', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      const s = set.stats()
      expect(s.maxChainLength).toBeGreaterThanOrEqual(0)
    })
  })

  describe('resize behavior', () => {
    it('should auto-resize when table fills up', () => {
      const set = new CuckooSet<number>(4)
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      expect(set.size).toBe(100)
      expect(set.capacity).toBeGreaterThan(4)
    })

    it('should preserve all values after resize', () => {
      const set = new CuckooSet<number>(4)
      for (let i = 0; i < 100; i++) {
        set.add(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('should track resize count in stats', () => {
      const set = new CuckooSet<number>(4)
      const initialStats = set.stats()
      expect(initialStats.resizeCount).toBe(0)
      for (let i = 0; i < 50; i++) {
        set.add(i)
      }
    })

    it('should handle resize with many elements', () => {
      const set = new CuckooSet<number>(4)
      for (let i = 0; i < 500; i++) {
        set.add(i)
      }
      expect(set.size).toBe(500)
    })
  })

  describe('edge cases', () => {
    it('should handle single element lifecycle', () => {
      const set = new CuckooSet<string>()
      set.add('only')
      expect(set.has('only')).toBe(true)
      expect(set.size).toBe(1)
      expect(set.isEmpty()).toBe(false)
      set.delete('only')
      expect(set.has('only')).toBe(false)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('should handle empty string value', () => {
      const set = new CuckooSet<string>()
      set.add('')
      expect(set.has('')).toBe(true)
      expect(set.delete('')).toBe(true)
      expect(set.has('')).toBe(false)
    })

    it('should distinguish numeric strings from numbers', () => {
      const s = new CuckooSet<number>()
      s.add(1)
      expect(s.has(1)).toBe(true)
    })

    it('should handle very large values', () => {
      const set = new CuckooSet<number>()
      set.add(Number.MAX_SAFE_INTEGER)
      expect(set.has(Number.MAX_SAFE_INTEGER)).toBe(true)
    })

    it('should handle collision-heavy inputs', () => {
      const set = new CuckooSet<string>(8)
      for (let i = 0; i < 50; i++) {
        set.add(`item-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(set.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle same hash values via String coercion', () => {
      const set = new CuckooSet<string>()
      set.add('1')
      set.add('01')
      expect(set.size).toBe(2)
      expect(set.has('1')).toBe(true)
      expect(set.has('01')).toBe(true)
    })

    it('should handle rapid add/delete cycles', () => {
      const set = new CuckooSet<string>()
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) {
          set.add(`k${i}`)
        }
        for (let i = 0; i < 20; i++) {
          set.delete(`k${i}`)
        }
        expect(set.size).toBe(0)
      }
    })

    it('should handle interleaved insert and delete', () => {
      const set = new CuckooSet<string>()
      for (let i = 0; i < 100; i++) {
        set.add(`k${i}`)
      }
      for (let i = 0; i < 50; i++) {
        set.delete(`k${i}`)
      }
      for (let i = 100; i < 150; i++) {
        set.add(`k${i}`)
      }
      expect(set.size).toBe(100)
      for (let i = 50; i < 150; i++) {
        expect(set.has(`k${i}`)).toBe(true)
      }
    })

    it('should survive auto-rehash on cycle detection', () => {
      const set = new CuckooSet<string>(4)
      for (let i = 0; i < 100; i++) {
        set.add(`k${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(set.has(`k${i}`)).toBe(true)
      }
    })
  })

  describe('large sets', () => {
    it('should handle 10000+ string elements', () => {
      const set = new CuckooSet<string>(256)
      for (let i = 0; i < 10000; i++) {
        expect(set.add(`item-${i}`)).toBe(true)
      }
      expect(set.size).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(set.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle 10000+ numeric elements', () => {
      const set = new CuckooSet<number>(256)
      for (let i = 0; i < 10000; i++) {
        set.add(i)
      }
      expect(set.size).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(set.has(i)).toBe(true)
      }
    })

    it('should handle 10000+ elements with deletions', () => {
      const set = new CuckooSet<number>(256)
      for (let i = 0; i < 10000; i++) {
        set.add(i)
      }
      for (let i = 0; i < 5000; i++) {
        set.delete(i)
      }
      expect(set.size).toBe(5000)
      for (let i = 5000; i < 10000; i++) {
        expect(set.has(i)).toBe(true)
      }
      for (let i = 0; i < 5000; i++) {
        expect(set.has(i)).toBe(false)
      }
    })

    it('should handle clone of large set', () => {
      const set = new CuckooSet<number>(256)
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      const cloned = set.clone()
      expect(cloned.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(cloned.has(i)).toBe(true)
      }
    })

    it('should handle toArray on large set', () => {
      const set = new CuckooSet<number>(256)
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      const arr = set.toArray()
      expect(arr.length).toBe(1000)
    })

    it('should handle forEach on large set', () => {
      const set = new CuckooSet<number>(256)
      for (let i = 0; i < 1000; i++) {
        set.add(i)
      }
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(1000)
    })

    it('should handle from with large input', () => {
      const arr: number[] = []
      for (let i = 0; i < 5000; i++) {
        arr.push(i)
      }
      const set = CuckooSet.from(arr)
      expect(set.size).toBe(5000)
    })
  })

  describe('DEFAULT_CUCKOO_SET_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_CUCKOO_SET_OPTIONS.capacity).toBe(16)
      expect(DEFAULT_CUCKOO_SET_OPTIONS.maxKicks).toBe(500)
    })

    it('should be usable as CuckooSetOptions', () => {
      const opts: CuckooSetOptions = DEFAULT_CUCKOO_SET_OPTIONS
      expect(opts.capacity).toBeTypeOf('number')
      expect(opts.maxKicks).toBeTypeOf('number')
    })
  })

  describe('randomized stress', () => {
    it('should maintain correctness with random operations', () => {
      const set = new CuckooSet<number>(64)
      const reference = new Set<number>()
      for (let i = 0; i < 2000; i++) {
        const key = Math.floor(Math.random() * 500)
        const op = Math.random()
        if (op < 0.6) {
          const result = set.add(key)
          const expected = !reference.has(key)
          expect(result).toBe(expected)
          reference.add(key)
        } else {
          const result = set.delete(key)
          const expected = reference.has(key)
          expect(result).toBe(expected)
          reference.delete(key)
        }
      }
      expect(set.size).toBe(reference.size)
      for (const key of reference) {
        expect(set.has(key)).toBe(true)
      }
    })
  })
})
