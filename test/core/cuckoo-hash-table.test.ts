import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooHashTable } from '../../src/core/cuckoo-hash-table/cuckoo-hash-table.js'
import { DEFAULT_CUCKOO_OPTIONS } from '../../src/core/cuckoo-hash-table/types.js'
import type { CuckooHashTableOptions } from '../../src/core/cuckoo-hash-table/types.js'

describe('CuckooHashTable', () => {
  let table: CuckooHashTable<string, number>

  beforeEach(() => {
    table = new CuckooHashTable<string, number>()
  })

  describe('constructor', () => {
    it('should create a table with default options', () => {
      const t = new CuckooHashTable<string, number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom capacity', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 64 })
      expect(t.capacity).toBe(64)
    })

    it('should accept custom maxEvictions', () => {
      const t = new CuckooHashTable<string, number>({ maxEvictions: 100 })
      expect(t.size()).toBe(0)
    })

    it('should accept custom numTables', () => {
      const t = new CuckooHashTable<string, number>({ numTables: 4 })
      expect(t.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 32 })
      expect(t.capacity).toBe(32)
    })

    it('should use default capacity when not specified', () => {
      const t = new CuckooHashTable<string, number>()
      expect(t.capacity).toBe(DEFAULT_CUCKOO_OPTIONS.capacity)
    })

    it('should create table with all options specified', () => {
      const t = new CuckooHashTable<string, number>({
        capacity: 128,
        maxEvictions: 200,
        numTables: 3,
      })
      expect(t.capacity).toBe(128)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('set and get', () => {
    it('should set and get a single value', () => {
      table.set('a', 1)
      expect(table.get('a')).toBe(1)
    })

    it('should set and get multiple values', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
      expect(table.get('c')).toBe(3)
    })

    it('should return undefined for non-existent key', () => {
      expect(table.get('missing')).toBeUndefined()
    })

    it('should overwrite existing key', () => {
      table.set('a', 1)
      table.set('a', 99)
      expect(table.get('a')).toBe(99)
    })

    it('should not increase size on overwrite', () => {
      table.set('a', 1)
      expect(table.size()).toBe(1)
      table.set('a', 2)
      expect(table.size()).toBe(1)
    })

    it('should handle numeric string keys', () => {
      table.set('0', 100)
      table.set('1', 200)
      expect(table.get('0')).toBe(100)
      expect(table.get('1')).toBe(200)
    })

    it('should handle empty string key', () => {
      table.set('', 42)
      expect(table.get('')).toBe(42)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      table.set('x', 10)
      expect(table.has('x')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(table.has('missing')).toBe(false)
    })

    it('should return false after delete', () => {
      table.set('x', 10)
      table.delete('x')
      expect(table.has('x')).toBe(false)
    })

    it('should return true for overwritten key', () => {
      table.set('x', 1)
      table.set('x', 2)
      expect(table.has('x')).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      table.set('a', 1)
      expect(table.delete('a')).toBe(true)
      expect(table.get('a')).toBeUndefined()
    })

    it('should return false for non-existent key', () => {
      expect(table.delete('missing')).toBe(false)
    })

    it('should decrease size on delete', () => {
      table.set('a', 1)
      table.set('b', 2)
      expect(table.size()).toBe(2)
      table.delete('a')
      expect(table.size()).toBe(1)
    })

    it('should allow re-insert after delete', () => {
      table.set('a', 1)
      table.delete('a')
      table.set('a', 2)
      expect(table.get('a')).toBe(2)
    })

    it('should handle delete on empty table', () => {
      expect(table.delete('nothing')).toBe(false)
    })

    it('should delete correct key among multiple', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.delete('b')
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBeUndefined()
      expect(table.get('c')).toBe(3)
    })
  })

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      expect(table.size()).toBe(0)
      table.set('a', 1)
      expect(table.size()).toBe(1)
      table.set('b', 2)
      expect(table.size()).toBe(2)
    })

    it('should report isEmpty correctly', () => {
      expect(table.isEmpty()).toBe(true)
      table.set('a', 1)
      expect(table.isEmpty()).toBe(false)
      table.delete('a')
      expect(table.isEmpty()).toBe(true)
    })

    it('should report isEmpty false with elements', () => {
      table.set('a', 1)
      table.set('b', 2)
      expect(table.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.clear()
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('should clear empty table without error', () => {
      table.clear()
      expect(table.size()).toBe(0)
    })

    it('should allow insertion after clear', () => {
      table.set('a', 1)
      table.clear()
      table.set('b', 2)
      expect(table.get('b')).toBe(2)
      expect(table.get('a')).toBeUndefined()
    })
  })

  describe('keys, values, entries', () => {
    it('should return all keys', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const keys = table.keys()
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return all values', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const values = table.values()
      expect(values.sort()).toEqual([1, 2, 3])
    })

    it('should return all entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      const entries = table.entries()
      expect(entries.length).toBe(2)
      const sorted = entries.sort((a, b) => (a.key < b.key ? -1 : 1))
      expect(sorted[0]!.key).toBe('a')
      expect(sorted[0]!.value).toBe(1)
      expect(sorted[1]!.key).toBe('b')
      expect(sorted[1]!.value).toBe(2)
    })

    it('should return empty arrays on empty table', () => {
      expect(table.keys()).toEqual([])
      expect(table.values()).toEqual([])
      expect(table.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const result: Record<string, number> = {}
      table.forEach((key, value) => {
        result[key] = value
      })
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should not call callback on empty table', () => {
      let count = 0
      table.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should handle single entry forEach', () => {
      table.set('only', 42)
      let sum = 0
      table.forEach((_key, value) => { sum += value })
      expect(sum).toBe(42)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      table.set('a', 1)
      table.set('b', 2)
      const result: Array<[string, number]> = []
      for (const entry of table) {
        result.push([entry.key, entry.value])
      }
      expect(result.length).toBe(2)
    })

    it('should work with spread operator', () => {
      table.set('a', 1)
      table.set('b', 2)
      const arr = [...table]
      expect(arr.length).toBe(2)
    })

    it('should work on empty table', () => {
      const arr = [...table]
      expect(arr).toEqual([])
    })
  })

  describe('loadFactor', () => {
    it('should be 0 on empty table', () => {
      expect(table.loadFactor).toBe(0)
    })

    it('should increase with insertions', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 16 })
      t.set('a', 1)
      expect(t.loadFactor).toBeGreaterThan(0)
    })

    it('should decrease after delete', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 16 })
      t.set('a', 1)
      const lf1 = t.loadFactor
      t.delete('a')
      const lf2 = t.loadFactor
      expect(lf2).toBeLessThan(lf1)
    })

    it('should calculate correctly for known occupancy', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 8 })
      t.set('a', 1)
      t.set('b', 2)
      expect(t.loadFactor).toBeCloseTo(2 / 16, 5)
    })
  })

  describe('capacity', () => {
    it('should return initial capacity', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 32 })
      expect(t.capacity).toBe(32)
    })

    it('should grow after many insertions', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 4 })
      const initial = t.capacity
      for (let i = 0; i < 20; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.capacity).toBeGreaterThan(initial)
    })
  })

  describe('getStatistics', () => {
    it('should track insertions', () => {
      table.set('a', 1)
      table.set('b', 2)
      const stats = table.getStatistics()
      expect(stats.insertions).toBe(2)
    })

    it('should track lookups', () => {
      table.set('a', 1)
      table.get('a')
      table.has('b')
      const stats = table.getStatistics()
      expect(stats.lookups).toBeGreaterThanOrEqual(2)
    })

    it('should track deletions', () => {
      table.set('a', 1)
      table.delete('a')
      table.delete('missing')
      const stats = table.getStatistics()
      expect(stats.deletions).toBe(2)
    })

    it('should track resizes', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 4 })
      for (let i = 0; i < 20; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.getStatistics().resizes).toBeGreaterThan(0)
    })

    it('should return a copy', () => {
      table.set('a', 1)
      const s1 = table.getStatistics()
      table.set('b', 2)
      const s2 = table.getStatistics()
      expect(s2.insertions).toBeGreaterThan(s1.insertions)
    })

    it('should have zero stats on fresh table', () => {
      const stats = table.getStatistics()
      expect(stats.insertions).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.resizes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.deletions).toBe(0)
    })

    it('should track evictions on collision-heavy data', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 8, maxEvictions: 20 })
      for (let i = 0; i < 10; i++) {
        t.set(`k${i}`, i)
      }
      const stats = t.getStatistics()
      expect(stats.evictions).toBeGreaterThanOrEqual(0)
    })
  })

  describe('rehash', () => {
    it('should change capacity', () => {
      table.set('a', 1)
      table.rehash(64)
      expect(table.capacity).toBe(64)
    })

    it('should preserve entries after rehash', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.rehash(64)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
      expect(table.get('c')).toBe(3)
    })

    it('should preserve size after rehash', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.rehash(64)
      expect(table.size()).toBe(2)
    })

    it('should increment resize count', () => {
      const initialResizes = table.getStatistics().resizes
      table.rehash(32)
      expect(table.getStatistics().resizes).toBe(initialResizes + 1)
    })

    it('should handle shrinking', () => {
      table.set('a', 1)
      table.rehash(4)
      expect(table.capacity).toBe(4)
      expect(table.get('a')).toBe(1)
    })
  })

  describe('reserve', () => {
    it('should increase capacity if needed', () => {
      table.reserve(100)
      expect(table.capacity).toBeGreaterThanOrEqual(50)
    })

    it('should not change capacity if already sufficient', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 64 })
      const capBefore = t.capacity
      t.reserve(10)
      expect(t.capacity).toBe(capBefore)
    })

    it('should preserve existing entries', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.reserve(100)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
    })
  })

  describe('auto-resize', () => {
    it('should auto-grow when eviction limit hit', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 4, maxEvictions: 10 })
      const initialCap = t.capacity
      for (let i = 0; i < 20; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.capacity).toBeGreaterThan(initialCap)
    })

    it('should preserve all entries after auto-grow', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 4, maxEvictions: 10 })
      for (let i = 0; i < 15; i++) {
        t.set(`key${i}`, i)
      }
      for (let i = 0; i < 15; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })
  })

  describe('eviction behavior', () => {
    it('should handle eviction chains', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 8, maxEvictions: 50 })
      for (let i = 0; i < 12; i++) {
        t.set(`evict${i}`, i)
      }
      expect(t.size()).toBe(12)
      for (let i = 0; i < 12; i++) {
        expect(t.get(`evict${i}`)).toBe(i)
      }
    })

    it('should count evictions in statistics', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 4, maxEvictions: 50 })
      for (let i = 0; i < 10; i++) {
        t.set(`k${i}`, i)
      }
      const stats = t.getStatistics()
      expect(stats.evictions).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      table.set('only', 42)
      expect(table.size()).toBe(1)
      expect(table.get('only')).toBe(42)
      expect(table.has('only')).toBe(true)
    })

    it('should handle duplicate keys (overwrite)', () => {
      table.set('a', 1)
      table.set('a', 2)
      table.set('a', 3)
      expect(table.get('a')).toBe(3)
      expect(table.size()).toBe(1)
    })

    it('should handle delete and re-insert patterns', () => {
      table.set('a', 1)
      table.delete('a')
      table.set('a', 2)
      table.delete('a')
      table.set('a', 3)
      expect(table.get('a')).toBe(3)
      expect(table.size()).toBe(1)
    })

    it('should handle many deletions', () => {
      for (let i = 0; i < 10; i++) {
        table.set(`key${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        table.delete(`key${i}`)
      }
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })
  })

  describe('large-scale insertions', () => {
    it('should handle 100 insertions', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 8 })
      for (let i = 0; i < 100; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.size()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })

    it('should handle 200 insertions', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 200; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.size()).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })

    it('should handle 500 insertions', () => {
      const t = new CuckooHashTable<string, number>()
      for (let i = 0; i < 500; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.size()).toBe(500)
    })

    it('should trigger multiple resizes', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 4 })
      for (let i = 0; i < 100; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.getStatistics().resizes).toBeGreaterThan(2)
    })
  })

  describe('collision-heavy scenarios', () => {
    it('should handle sequential number keys', () => {
      const t = new CuckooHashTable<number, string>({ capacity: 8 })
      for (let i = 0; i < 30; i++) {
        t.set(i, `val${i}`)
      }
      for (let i = 0; i < 30; i++) {
        expect(t.get(i)).toBe(`val${i}`)
      }
    })

    it('should handle similar prefix keys', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 8 })
      for (let i = 0; i < 20; i++) {
        t.set(`prefix_${i}`, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(t.get(`prefix_${i}`)).toBe(i)
      }
    })
  })

  describe('number keys', () => {
    it('should work with number keys', () => {
      const t = new CuckooHashTable<number, string>()
      t.set(1, 'one')
      t.set(2, 'two')
      t.set(3, 'three')
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
      expect(t.get(3)).toBe('three')
    })

    it('should handle zero as key', () => {
      const t = new CuckooHashTable<number, string>()
      t.set(0, 'zero')
      expect(t.get(0)).toBe('zero')
    })

    it('should handle negative number keys', () => {
      const t = new CuckooHashTable<number, string>()
      t.set(-1, 'neg')
      expect(t.get(-1)).toBe('neg')
    })
  })

  describe('boolean keys', () => {
    it('should work with boolean keys', () => {
      const t = new CuckooHashTable<boolean, string>()
      t.set(true, 'yes')
      t.set(false, 'no')
      expect(t.get(true)).toBe('yes')
      expect(t.get(false)).toBe('no')
    })
  })

  describe('object-like keys', () => {
    it('should work with object keys via stringify', () => {
      const t = new CuckooHashTable<{ id: number }, string>()
      t.set({ id: 1 }, 'one')
      t.set({ id: 2 }, 'two')
      expect(t.get({ id: 1 })).toBe('one')
      expect(t.get({ id: 2 })).toBe('two')
    })
  })

  describe('DEFAULT_CUCKOO_OPTIONS', () => {
    it('should have expected defaults', () => {
      expect(DEFAULT_CUCKOO_OPTIONS.capacity).toBe(16)
      expect(DEFAULT_CUCKOO_OPTIONS.maxEvictions).toBe(50)
      expect(DEFAULT_CUCKOO_OPTIONS.numTables).toBe(2)
    })
  })

  describe('mixed operations', () => {
    it('should handle interleaved set/delete/get', () => {
      table.set('a', 1)
      expect(table.get('a')).toBe(1)
      table.set('b', 2)
      table.delete('a')
      expect(table.get('a')).toBeUndefined()
      expect(table.get('b')).toBe(2)
      table.set('a', 3)
      expect(table.get('a')).toBe(3)
      table.set('c', 4)
      expect(table.size()).toBe(3)
    })

    it('should handle clear then reinsert', () => {
      for (let i = 0; i < 10; i++) {
        table.set(`k${i}`, i)
      }
      table.clear()
      expect(table.size()).toBe(0)
      for (let i = 0; i < 10; i++) {
        table.set(`k${i}`, i * 10)
      }
      for (let i = 0; i < 10; i++) {
        expect(table.get(`k${i}`)).toBe(i * 10)
      }
    })
  })

  describe('multiple tables configuration', () => {
    it('should work with 3 tables', () => {
      const t = new CuckooHashTable<string, number>({ numTables: 3, capacity: 8 })
      for (let i = 0; i < 15; i++) {
        t.set(`k${i}`, i)
      }
      expect(t.size()).toBe(15)
    })

    it('should work with 4 tables', () => {
      const t = new CuckooHashTable<string, number>({ numTables: 4, capacity: 8 })
      for (let i = 0; i < 20; i++) {
        t.set(`k${i}`, i)
      }
      expect(t.size()).toBe(20)
    })

    it('loadFactor should account for numTables', () => {
      const t = new CuckooHashTable<string, number>({ numTables: 4, capacity: 8 })
      t.set('a', 1)
      expect(t.loadFactor).toBeCloseTo(1 / 32, 5)
    })
  })

  describe('delete and re-insert patterns', () => {
    it('should handle alternating insert delete', () => {
      table.set('a', 1)
      table.delete('a')
      table.set('a', 2)
      table.delete('a')
      table.set('a', 3)
      expect(table.get('a')).toBe(3)
      expect(table.size()).toBe(1)
    })

    it('should handle delete half and reinsert', () => {
      for (let i = 0; i < 20; i++) {
        table.set(`k${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        table.delete(`k${i}`)
      }
      expect(table.size()).toBe(10)
      for (let i = 0; i < 10; i++) {
        table.set(`k${i}`, i + 100)
      }
      expect(table.size()).toBe(20)
      for (let i = 0; i < 10; i++) {
        expect(table.get(`k${i}`)).toBe(i + 100)
      }
      for (let i = 10; i < 20; i++) {
        expect(table.get(`k${i}`)).toBe(i)
      }
    })
  })

  describe('statistics after operations', () => {
    it('should track cumulative stats across operations', () => {
      table.set('a', 1)
      table.set('b', 2)
      table.get('a')
      table.has('b')
      table.delete('a')
      const stats = table.getStatistics()
      expect(stats.insertions).toBe(2)
      expect(stats.lookups).toBeGreaterThanOrEqual(2)
      expect(stats.deletions).toBe(1)
    })

    it('should track lookups including misses', () => {
      table.set('a', 1)
      table.get('missing1')
      table.get('missing2')
      table.has('missing3')
      const stats = table.getStatistics()
      expect(stats.lookups).toBeGreaterThanOrEqual(3)
    })

    it('should count deletions including failed ones', () => {
      table.delete('missing1')
      table.delete('missing2')
      const stats = table.getStatistics()
      expect(stats.deletions).toBe(2)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 insertions', () => {
      const t = new CuckooHashTable<string, number>()
      for (let i = 0; i < 1000; i++) {
        t.set(`key${i}`, i)
      }
      expect(t.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })

    it('should handle insert-delete-reinsert cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          table.set(`c${cycle}_k${i}`, i * cycle)
        }
        for (let i = 0; i < 10; i++) {
          expect(table.get(`c${cycle}_k${i}`)).toBe(i * cycle)
        }
        for (let i = 0; i < 10; i++) {
          table.delete(`c${cycle}_k${i}`)
        }
      }
      expect(table.size()).toBe(0)
    })

    it('should handle overwrite during heavy load', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 8 })
      for (let i = 0; i < 20; i++) {
        t.set('constant', i)
      }
      expect(t.get('constant')).toBe(19)
      expect(t.size()).toBe(1)
    })

    it('should handle batch delete after large insert', () => {
      const t = new CuckooHashTable<string, number>()
      for (let i = 0; i < 200; i++) {
        t.set(`k${i}`, i)
      }
      for (let i = 0; i < 200; i += 2) {
        t.delete(`k${i}`)
      }
      expect(t.size()).toBe(100)
      for (let i = 0; i < 200; i++) {
        if (i % 2 === 0) {
          expect(t.get(`k${i}`)).toBeUndefined()
        } else {
          expect(t.get(`k${i}`)).toBe(i)
        }
      }
    })

    it('should handle mixed types in same table', () => {
      const t = new CuckooHashTable<string, number>()
      t.set('a', 1)
      t.set('b', 2)
      t.set('c', 3)
      t.delete('b')
      t.set('d', 4)
      t.set('a', 10)
      expect(t.get('a')).toBe(10)
      expect(t.get('b')).toBeUndefined()
      expect(t.get('c')).toBe(3)
      expect(t.get('d')).toBe(4)
      expect(t.size()).toBe(3)
    })

    it('should handle keys with special characters', () => {
      table.set('key with spaces', 1)
      table.set('key\twith\ttabs', 2)
      table.set('key\nwith\nnewlines', 3)
      table.set('key-with-dashes', 4)
      table.set('key.with.dots', 5)
      expect(table.get('key with spaces')).toBe(1)
      expect(table.get('key\twith\ttabs')).toBe(2)
      expect(table.get('key\nwith\nnewlines')).toBe(3)
      expect(table.get('key-with-dashes')).toBe(4)
      expect(table.get('key.with.dots')).toBe(5)
    })

    it('should handle unicode keys', () => {
      table.set('日本語', 1)
      table.set('中文', 2)
      table.set('العربية', 3)
      table.set('🎉🎊', 4)
      expect(table.get('日本語')).toBe(1)
      expect(table.get('中文')).toBe(2)
      expect(table.get('العربية')).toBe(3)
      expect(table.get('🎉🎊')).toBe(4)
    })

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(10000)
      table.set(longKey, 42)
      expect(table.get(longKey)).toBe(42)
      expect(table.has(longKey)).toBe(true)
      table.delete(longKey)
      expect(table.get(longKey)).toBeUndefined()
    })

    it('should handle null value', () => {
      const t = new CuckooHashTable<string, number | null>()
      t.set('a', null)
      expect(t.get('a')).toBe(null)
      expect(t.has('a')).toBe(true)
    })

    it('should handle undefined value', () => {
      const t = new CuckooHashTable<string, number | undefined>()
      t.set('a', undefined)
      expect(t.get('a')).toBe(undefined)
      expect(t.has('a')).toBe(true)
    })

    it('should handle very small capacity', () => {
      const t = new CuckooHashTable<string, number>({ capacity: 2 })
      t.set('a', 1)
      t.set('b', 2)
      t.set('c', 3)
      t.set('d', 4)
      expect(t.size()).toBe(4)
      expect(t.get('a')).toBe(1)
      expect(t.get('d')).toBe(4)
    })
  })
})
