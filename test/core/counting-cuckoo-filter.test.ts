import { describe, it, expect, beforeEach } from 'vitest'
import { CountingCuckooFilter } from '../../src/core/counting-cuckoo-filter/counting-cuckoo-filter.js'
import { DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS } from '../../src/core/counting-cuckoo-filter/types.js'
import type { CountingCuckooFilterOptions, CountingCuckooFilterStatistics } from '../../src/core/counting-cuckoo-filter/types.js'

describe('CountingCuckooFilter', () => {
  let filter: CountingCuckooFilter<string>

  beforeEach(() => {
    filter = new CountingCuckooFilter<string>()
  })

  describe('constructor', () => {
    it('should create filter with default options', () => {
      const f = new CountingCuckooFilter<string>()
      expect(f.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('should create filter with custom capacity', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 500 })
      expect(f.capacity()).toBe(500)
    })

    it('should create filter with custom bucketSize', () => {
      const f = new CountingCuckooFilter<string>({ bucketSize: 8 })
      expect(f.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('should create filter with custom fingerprintSize', () => {
      const f = new CountingCuckooFilter<string>({ fingerprintSize: 12 })
      expect(f.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('should create filter with custom maxKicks', () => {
      const f = new CountingCuckooFilter<string>({ maxKicks: 100 })
      expect(f.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('should create filter with all custom options', () => {
      const f = new CountingCuckooFilter<string>({
        capacity: 2048,
        bucketSize: 6,
        fingerprintSize: 10,
        maxKicks: 200,
      })
      expect(f.capacity()).toBe(2048)
    })

    it('should start with size 0', () => {
      expect(filter.size).toBe(0)
    })

    it('should start as empty', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('should start with loadFactor 0', () => {
      expect(filter.loadFactor()).toBe(0)
    })

    it('should start with 0 false positive rate', () => {
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should merge partial options with defaults', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 256 })
      expect(f.capacity()).toBe(256)
    })
  })

  describe('insert', () => {
    it('should insert an item successfully', () => {
      expect(filter.insert('hello')).toBe(true)
    })

    it('should increase size after insert', () => {
      filter.insert('hello')
      expect(filter.size).toBe(1)
    })

    it('should insert the same item multiple times (counting)', () => {
      filter.insert('hello')
      filter.insert('hello')
      filter.insert('hello')
      expect(filter.size).toBe(3)
    })

    it('should insert multiple different items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.size).toBe(3)
    })

    it('should not be empty after insert', () => {
      filter.insert('hello')
      expect(filter.isEmpty).toBe(false)
    })

    it('should track insert statistics', () => {
      filter.insert('hello')
      filter.insert('world')
      const stats = filter.getStatistics()
      expect(stats.inserts).toBe(2)
    })

    it('should handle numeric items', () => {
      const f = new CountingCuckooFilter<number>()
      expect(f.insert(42)).toBe(true)
      expect(f.size).toBe(1)
    })

    it('should handle object items', () => {
      const f = new CountingCuckooFilter<{ id: number }>()
      expect(f.insert({ id: 1 })).toBe(true)
    })

    it('should handle empty string', () => {
      expect(filter.insert('')).toBe(true)
    })

    it('should handle special characters', () => {
      expect(filter.insert('hello\nworld\t!')).toBe(true)
    })

    it('should handle unicode strings', () => {
      expect(filter.insert('日本語テスト')).toBe(true)
    })

    it('should handle emoji strings', () => {
      expect(filter.insert('🎉🚀')).toBe(true)
    })

    it('should insert many items up to capacity', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 100, bucketSize: 4 })
      let inserted = 0
      for (let i = 0; i < 80; i++) {
        if (f.insert(`item-${i}`)) {
          inserted++
        }
      }
      expect(inserted).toBeGreaterThan(0)
    })

    it('should return true for repeated inserts of same item', () => {
      expect(filter.insert('test')).toBe(true)
      expect(filter.insert('test')).toBe(true)
    })

    it('should increment count for duplicate inserts', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      expect(filter.count('test')).toBe(3)
    })
  })

  describe('delete', () => {
    it('should delete an inserted item', () => {
      filter.insert('hello')
      expect(filter.delete('hello')).toBe(true)
    })

    it('should decrease size after delete', () => {
      filter.insert('hello')
      filter.delete('hello')
      expect(filter.size).toBe(0)
    })

    it('should return false for non-existent item', () => {
      expect(filter.delete('nonexistent')).toBe(false)
    })

    it('should track delete statistics', () => {
      filter.insert('hello')
      filter.delete('hello')
      const stats = filter.getStatistics()
      expect(stats.deletes).toBe(1)
    })

    it('should decrement count for partial deletes', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      filter.delete('test')
      expect(filter.count('test')).toBe(2)
    })

    it('should remove entry when count reaches 0', () => {
      filter.insert('test')
      filter.delete('test')
      expect(filter.count('test')).toBe(0)
    })

    it('should handle multiple deletes of same item', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.delete('test')).toBe(true)
      expect(filter.delete('test')).toBe(true)
      expect(filter.delete('test')).toBe(false)
    })

    it('should handle delete after multiple inserts', () => {
      filter.insert('a')
      filter.insert('a')
      filter.insert('a')
      filter.delete('a')
      expect(filter.count('a')).toBe(2)
      expect(filter.size).toBe(2)
    })

    it('should not affect other items when deleting', () => {
      filter.insert('a')
      filter.insert('b')
      filter.delete('a')
      expect(filter.has('b')).toBe(true)
    })

    it('should handle delete on empty filter', () => {
      expect(filter.delete('nothing')).toBe(false)
    })
  })

  describe('has', () => {
    it('should return true for inserted item', () => {
      filter.insert('hello')
      expect(filter.has('hello')).toBe(true)
    })

    it('should return false for non-inserted item', () => {
      expect(filter.has('nonexistent')).toBe(false)
    })

    it('should return false on empty filter', () => {
      expect(filter.has('anything')).toBe(false)
    })

    it('should track lookup statistics', () => {
      filter.has('test')
      filter.has('test')
      const stats = filter.getStatistics()
      expect(stats.lookups).toBe(2)
    })

    it('should return true after delete if count > 0', () => {
      filter.insert('test')
      filter.insert('test')
      filter.delete('test')
      expect(filter.has('test')).toBe(true)
    })

    it('should return false after full delete', () => {
      filter.insert('test')
      filter.delete('test')
      expect(filter.has('test')).toBe(false)
    })

    it('should handle has for multiple items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.has('a')).toBe(true)
      expect(filter.has('b')).toBe(true)
      expect(filter.has('c')).toBe(true)
      expect(filter.has('d')).toBe(false)
    })
  })

  describe('count', () => {
    it('should return 0 for non-existent item', () => {
      expect(filter.count('nonexistent')).toBe(0)
    })

    it('should return 1 for single insert', () => {
      filter.insert('test')
      expect(filter.count('test')).toBe(1)
    })

    it('should return correct count for multiple inserts', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      expect(filter.count('test')).toBe(3)
    })

    it('should track count query statistics', () => {
      filter.count('test')
      const stats = filter.getStatistics()
      expect(stats.countQueries).toBe(1)
    })

    it('should return 0 after full delete', () => {
      filter.insert('test')
      filter.delete('test')
      expect(filter.count('test')).toBe(0)
    })

    it('should return decremented count after partial delete', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      filter.delete('test')
      expect(filter.count('test')).toBe(2)
    })

    it('should return 0 on empty filter', () => {
      expect(filter.count('anything')).toBe(0)
    })

    it('should count independently for different items', () => {
      filter.insert('a')
      filter.insert('a')
      filter.insert('b')
      filter.insert('b')
      filter.insert('b')
      expect(filter.count('a')).toBe(2)
      expect(filter.count('b')).toBe(3)
    })
  })

  describe('clear', () => {
    it('should clear all items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should make filter empty after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })

    it('should reset load factor to 0', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.loadFactor()).toBe(0)
    })

    it('should reset statistics', () => {
      filter.insert('a')
      filter.delete('a')
      filter.has('b')
      filter.count('c')
      filter.clear()
      const stats = filter.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.countQueries).toBe(0)
      expect(stats.relocations).toBe(0)
      expect(stats.maxRelocations).toBe(0)
      expect(stats.falsePositives).toBe(0)
    })

    it('should allow insertions after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.insert('new')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should return false for has after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.has('test')).toBe(false)
    })
  })

  describe('capacity', () => {
    it('should return configured capacity', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 500 })
      expect(f.capacity()).toBe(500)
    })

    it('should return default capacity when not specified', () => {
      expect(filter.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })
  })

  describe('loadFactor', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.loadFactor()).toBe(0)
    })

    it('should increase with inserts', () => {
      filter.insert('test')
      expect(filter.loadFactor()).toBeGreaterThan(0)
    })

    it('should decrease with deletes', () => {
      filter.insert('test')
      const afterInsert = filter.loadFactor()
      filter.delete('test')
      expect(filter.loadFactor()).toBeLessThan(afterInsert)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 50; i++) {
        filter.insert(`item-${i}`)
      }
      const lf = filter.loadFactor()
      expect(lf).toBeGreaterThanOrEqual(0)
      expect(lf).toBeLessThanOrEqual(1)
    })
  })

  describe('size', () => {
    it('should return 0 initially', () => {
      expect(filter.size).toBe(0)
    })

    it('should reflect total count including duplicates', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.size).toBe(2)
    })

    it('should decrease on delete', () => {
      filter.insert('test')
      filter.insert('test')
      filter.delete('test')
      expect(filter.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true initially', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('should be false after insert', () => {
      filter.insert('test')
      expect(filter.isEmpty).toBe(false)
    })

    it('should be true after clearing all items', () => {
      filter.insert('test')
      filter.delete('test')
      expect(filter.isEmpty).toBe(true)
    })

    it('should be false with remaining items after partial delete', () => {
      filter.insert('test')
      filter.insert('test')
      filter.delete('test')
      expect(filter.isEmpty).toBe(false)
    })
  })

  describe('expectedFalsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should return positive value with items', () => {
      filter.insert('test')
      expect(filter.expectedFalsePositiveRate()).toBeGreaterThan(0)
    })

    it('should be between 0 and 1', () => {
      filter.insert('test')
      const rate = filter.expectedFalsePositiveRate()
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThan(1)
    })

    it('should decrease with larger fingerprint', () => {
      const f8 = new CountingCuckooFilter<string>({ fingerprintSize: 8 })
      const f16 = new CountingCuckooFilter<string>({ fingerprintSize: 16 })
      f8.insert('test')
      f16.insert('test')
      expect(f16.expectedFalsePositiveRate()).toBeLessThan(f8.expectedFalsePositiveRate())
    })
  })

  describe('resize', () => {
    it('should resize to larger capacity', () => {
      filter.insert('test')
      expect(filter.resize(2048)).toBe(true)
      expect(filter.capacity()).toBe(2048)
    })

    it('should resize to smaller capacity', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 2048 })
      f.insert('test')
      expect(f.resize(512)).toBe(true)
      expect(f.capacity()).toBe(512)
    })

    it('should preserve items after resize', () => {
      filter.insert('test')
      filter.resize(2048)
      expect(filter.size).toBe(1)
    })

    it('should update capacity', () => {
      filter.resize(4096)
      expect(filter.capacity()).toBe(4096)
    })
  })

  describe('toJSON', () => {
    it('should produce valid JSON-serializable object', () => {
      filter.insert('test')
      const json = filter.toJSON()
      const str = JSON.stringify(json)
      expect(str).toBeTruthy()
      expect(() => JSON.parse(str)).not.toThrow()
    })

    it('should include capacity', () => {
      const json = filter.toJSON() as Record<string, unknown>
      expect(json.capacity).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('should include bucketSize', () => {
      const json = filter.toJSON() as Record<string, unknown>
      expect(json.bucketSize).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.bucketSize)
    })

    it('should include fingerprintSize', () => {
      const json = filter.toJSON() as Record<string, unknown>
      expect(json.fingerprintSize).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.fingerprintSize)
    })

    it('should include maxKicks', () => {
      const json = filter.toJSON() as Record<string, unknown>
      expect(json.maxKicks).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.maxKicks)
    })

    it('should include size', () => {
      filter.insert('test')
      const json = filter.toJSON() as Record<string, unknown>
      expect(json.size).toBe(1)
    })

    it('should include stats', () => {
      filter.insert('test')
      const json = filter.toJSON() as Record<string, unknown>
      expect(json.stats).toBeDefined()
    })

    it('should include buckets', () => {
      filter.insert('test')
      const json = filter.toJSON() as Record<string, unknown>
      expect(Array.isArray(json.buckets)).toBe(true)
    })

    it('should serialize count for entries', () => {
      filter.insert('test')
      filter.insert('test')
      const json = filter.toJSON() as { buckets: { fingerprint: number; count: number }[][] }
      let found = false
      for (const bucket of json.buckets) {
        for (const entry of bucket) {
          if (entry.count === 2) {
            found = true
          }
        }
      }
      expect(found).toBe(true)
    })
  })

  describe('fromJSON', () => {
    it('should reconstruct filter from JSON', () => {
      filter.insert('hello')
      filter.insert('world')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.size).toBe(filter.size)
    })

    it('should preserve capacity', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 2048 })
      const json = f.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.capacity()).toBe(2048)
    })

    it('should preserve statistics', () => {
      filter.insert('a')
      filter.insert('b')
      filter.delete('a')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.getStatistics().inserts).toBe(2)
      expect(restored.getStatistics().deletes).toBe(1)
    })

    it('should preserve bucket entries', () => {
      filter.insert('test')
      filter.insert('test')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.count('test')).toBe(2)
    })

    it('should work with empty filter', () => {
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.size).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })

    it('should round-trip correctly', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('a')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.count('a')).toBe(2)
      expect(restored.count('b')).toBe(1)
      expect(restored.size).toBe(3)
    })
  })

  describe('merge', () => {
    it('should merge two filters', () => {
      const other = new CountingCuckooFilter<string>()
      filter.insert('a')
      other.insert('b')
      expect(filter.merge(other)).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('should fail merging filters with different bucket sizes', () => {
      const other = new CountingCuckooFilter<string>({ bucketSize: 8 })
      expect(filter.merge(other)).toBe(false)
    })

    it('should fail merging filters with different fingerprint sizes', () => {
      const other = new CountingCuckooFilter<string>({ fingerprintSize: 16 })
      expect(filter.merge(other)).toBe(false)
    })

    it('should merge duplicate items correctly', () => {
      const other = new CountingCuckooFilter<string>()
      filter.insert('test')
      other.insert('test')
      filter.merge(other)
      expect(filter.count('test')).toBe(2)
    })

    it('should merge empty filter', () => {
      const other = new CountingCuckooFilter<string>()
      filter.insert('test')
      expect(filter.merge(other)).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should merge into empty filter', () => {
      const other = new CountingCuckooFilter<string>()
      other.insert('test')
      expect(filter.merge(other)).toBe(true)
      expect(filter.size).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = filter.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.relocations).toBe(0)
      expect(stats.maxRelocations).toBe(0)
      expect(stats.countQueries).toBe(0)
      expect(stats.falsePositives).toBe(0)
    })

    it('should track inserts', () => {
      filter.insert('a')
      filter.insert('b')
      expect(filter.getStatistics().inserts).toBe(2)
    })

    it('should track deletes', () => {
      filter.insert('a')
      filter.delete('a')
      expect(filter.getStatistics().deletes).toBe(1)
    })

    it('should track lookups', () => {
      filter.has('a')
      filter.has('b')
      filter.has('c')
      expect(filter.getStatistics().lookups).toBe(3)
    })

    it('should track count queries', () => {
      filter.count('a')
      filter.count('b')
      expect(filter.getStatistics().countQueries).toBe(2)
    })

    it('should return a copy of statistics', () => {
      const stats1 = filter.getStatistics()
      stats1.inserts = 999
      const stats2 = filter.getStatistics()
      expect(stats2.inserts).toBe(0)
    })

    it('should track all operation types together', () => {
      filter.insert('a')
      filter.insert('a')
      filter.has('a')
      filter.count('a')
      filter.delete('a')
      const stats = filter.getStatistics()
      expect(stats.inserts).toBe(2)
      expect(stats.lookups).toBe(1)
      expect(stats.countQueries).toBe(1)
      expect(stats.deletes).toBe(1)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      expect(typeof filter[Symbol.iterator]).toBe('function')
    })

    it('should return an iterator', () => {
      const iter = filter[Symbol.iterator]()
      expect(iter).toBeDefined()
    })
  })

  describe('insert and delete cycle', () => {
    it('should handle full insert-delete cycle', () => {
      expect(filter.insert('test')).toBe(true)
      expect(filter.has('test')).toBe(true)
      expect(filter.count('test')).toBe(1)
      expect(filter.delete('test')).toBe(true)
      expect(filter.has('test')).toBe(false)
      expect(filter.count('test')).toBe(0)
    })

    it('should handle multiple cycles', () => {
      for (let i = 0; i < 5; i++) {
        filter.insert('test')
      }
      for (let i = 0; i < 5; i++) {
        expect(filter.delete('test')).toBe(true)
      }
      expect(filter.delete('test')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      expect(filter.insert(longStr)).toBe(true)
      expect(filter.has(longStr)).toBe(true)
    })

    it('should handle strings with special JSON characters', () => {
      expect(filter.insert('"quoted"')).toBe(true)
      expect(filter.has('"quoted"')).toBe(true)
    })

    it('should handle null-like strings', () => {
      expect(filter.insert('null')).toBe(true)
      expect(filter.has('null')).toBe(true)
    })

    it('should handle stringified numbers', () => {
      expect(filter.insert('123')).toBe(true)
      expect(filter.has('123')).toBe(true)
    })

    it('should distinguish between string and number forms', () => {
      const numFilter = new CountingCuckooFilter<number | string>()
      numFilter.insert(42)
      numFilter.insert('42')
      expect(numFilter.size).toBe(2)
    })

    it('should handle very small capacity', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 8, bucketSize: 2 })
      expect(f.insert('test')).toBe(true)
      expect(f.capacity()).toBe(8)
    })

    it('should handle single bucket capacity', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 4, bucketSize: 4 })
      f.insert('a')
      f.insert('b')
      expect(f.size).toBe(2)
    })
  })

  describe('counting behavior', () => {
    it('should maintain independent counts per item', () => {
      filter.insert('a')
      filter.insert('a')
      filter.insert('b')
      filter.insert('b')
      filter.insert('b')
      expect(filter.count('a')).toBe(2)
      expect(filter.count('b')).toBe(3)
    })

    it('should handle interleaved insert and delete', () => {
      filter.insert('test')
      expect(filter.count('test')).toBe(1)
      filter.insert('test')
      expect(filter.count('test')).toBe(2)
      filter.delete('test')
      expect(filter.count('test')).toBe(1)
      filter.insert('test')
      expect(filter.count('test')).toBe(2)
    })

    it('should reflect total size as sum of counts', () => {
      filter.insert('a')
      filter.insert('a')
      filter.insert('b')
      expect(filter.size).toBe(3)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS', () => {
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS).toBeDefined()
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity).toBe(1024)
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.bucketSize).toBe(4)
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.fingerprintSize).toBe(8)
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.maxKicks).toBe(500)
    })

    it('should allow creating options object matching type', () => {
      const opts: CountingCuckooFilterOptions = {
        capacity: 100,
        bucketSize: 4,
        fingerprintSize: 8,
        maxKicks: 200,
      }
      expect(opts.capacity).toBe(100)
    })

    it('should allow creating statistics object matching type', () => {
      const stats: CountingCuckooFilterStatistics = {
        inserts: 0,
        deletes: 0,
        lookups: 0,
        relocations: 0,
        maxRelocations: 0,
        countQueries: 0,
        falsePositives: 0,
      }
      expect(stats.inserts).toBe(0)
    })
  })

  describe('stress tests', () => {
    it('should handle many insertions', () => {
      const f = new CountingCuckooFilter<string>({ capacity: 4096 })
      let success = 0
      for (let i = 0; i < 500; i++) {
        if (f.insert(`item-${i}`)) success++
      }
      expect(success).toBeGreaterThan(300)
    })

    it('should handle many repeated insertions of same item', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert('same')
      }
      expect(filter.count('same')).toBe(100)
      expect(filter.size).toBe(100)
    })

    it('should handle mixed operations', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('a')
      filter.delete('a')
      filter.insert('c')
      filter.has('a')
      filter.has('b')
      filter.count('c')
      expect(filter.size).toBe(3)
      expect(filter.count('a')).toBe(1)
      expect(filter.count('b')).toBe(1)
      expect(filter.count('c')).toBe(1)
    })
  })
})
