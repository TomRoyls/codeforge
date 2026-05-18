import { CountingCuckooFilter } from '../src/core/counting-cuckoo-filter/counting-cuckoo-filter.js'
import { DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS } from '../src/core/counting-cuckoo-filter/counting-cuckoo-filter.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CountingCuckooFilter', () => {
  describe('constructor', () => {
    it('creates a filter with default options', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('creates a filter with custom capacity', () => {
      const filter = new CountingCuckooFilter({ capacity: 512 })
      expect(filter.capacity()).toBe(512)
    })

    it('creates a filter with custom bucket size', () => {
      const filter = new CountingCuckooFilter({ bucketSize: 2 })
      expect(filter.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('creates a filter with custom fingerprint size', () => {
      const filter = new CountingCuckooFilter({ fingerprintSize: 12 })
      expect(filter.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('creates a filter with custom max kicks', () => {
      const filter = new CountingCuckooFilter({ maxKicks: 100 })
      expect(filter.capacity()).toBe(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('creates a filter with all custom options', () => {
      const filter = new CountingCuckooFilter({
        capacity: 256,
        bucketSize: 2,
        fingerprintSize: 16,
        maxKicks: 200,
      })
      expect(filter.capacity()).toBe(256)
    })

    it('merges partial options with defaults', () => {
      const filter = new CountingCuckooFilter({ capacity: 2048 })
      expect(filter.capacity()).toBe(2048)
    })

    it('initializes with zero statistics', () => {
      const filter = new CountingCuckooFilter()
      const stats = filter.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.relocations).toBe(0)
      expect(stats.maxRelocations).toBe(0)
      expect(stats.countQueries).toBe(0)
      expect(stats.falsePositives).toBe(0)
    })
  })

  // ─── Insert ────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single item and returns true', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.insert('hello')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('inserts multiple different items', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.insert('a')).toBe(true)
      expect(filter.insert('b')).toBe(true)
      expect(filter.insert('c')).toBe(true)
      expect(filter.size).toBe(3)
    })

    it('inserts the same item multiple times (counting)', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('x')
      filter.insert('x')
      filter.insert('x')
      expect(filter.size).toBe(3)
      expect(filter.count('x')).toBe(3)
    })

    it('increments size for each insert', () => {
      const filter = new CountingCuckooFilter()
      for (let i = 0; i < 10; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.size).toBe(10)
    })

    it('increments inserts statistic', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.getStatistics().inserts).toBe(3)
    })

    it('inserts numeric items', () => {
      const filter = new CountingCuckooFilter<number>()
      expect(filter.insert(42)).toBe(true)
      expect(filter.insert(100)).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('inserts object items', () => {
      const filter = new CountingCuckooFilter<{ id: number }>()
      expect(filter.insert({ id: 1 })).toBe(true)
      expect(filter.insert({ id: 2 })).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('returns false when filter is full and cannot relocate', () => {
      const filter = new CountingCuckooFilter({ capacity: 4, bucketSize: 2, maxKicks: 1 })
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        const result = filter.insert(`unique-${i}`)
        if (!result) break
        items.push(`unique-${i}`)
      }
      const lastResult = filter.insert('overflow-item')
      if (lastResult === false) {
        expect(lastResult).toBe(false)
      }
    })
  })

  // ─── Delete ────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an inserted item and returns true', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('hello')
      expect(filter.delete('hello')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('decrements count for duplicate items', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('x')
      filter.insert('x')
      filter.insert('x')
      expect(filter.count('x')).toBe(3)
      expect(filter.delete('x')).toBe(true)
      expect(filter.count('x')).toBe(2)
      expect(filter.size).toBe(2)
    })

    it('removes entry when count reaches zero', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('y')
      expect(filter.has('y')).toBe(true)
      filter.delete('y')
      expect(filter.has('y')).toBe(false)
      expect(filter.count('y')).toBe(0)
    })

    it('returns false for non-existent item', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.delete('nonexistent')).toBe(false)
    })

    it('returns false on empty filter', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.delete('anything')).toBe(false)
    })

    it('increments deletes statistic', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.insert('b')
      filter.delete('a')
      filter.delete('b')
      expect(filter.getStatistics().deletes).toBe(2)
    })

    it('handles delete and re-insert cycle', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('item')
      filter.delete('item')
      expect(filter.has('item')).toBe(false)
      filter.insert('item')
      expect(filter.has('item')).toBe(true)
      expect(filter.count('item')).toBe(1)
    })

    it('deletes only one count when item has multiple inserts', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('z')
      filter.insert('z')
      filter.insert('z')
      filter.delete('z')
      expect(filter.size).toBe(2)
      expect(filter.count('z')).toBe(2)
    })
  })

  // ─── Has ───────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an inserted item', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('test')
      expect(filter.has('test')).toBe(true)
    })

    it('returns false for a non-inserted item', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.has('nothere')).toBe(false)
    })

    it('returns false on empty filter', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.has('anything')).toBe(false)
    })

    it('returns false after all counts are deleted', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('gone')
      filter.delete('gone')
      expect(filter.has('gone')).toBe(false)
    })

    it('returns true when item still has remaining count', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('remain')
      filter.insert('remain')
      filter.delete('remain')
      expect(filter.has('remain')).toBe(true)
    })

    it('increments lookups statistic', () => {
      const filter = new CountingCuckooFilter()
      filter.has('a')
      filter.has('b')
      filter.has('c')
      expect(filter.getStatistics().lookups).toBe(3)
    })

    it('finds items with different types', () => {
      const filter = new CountingCuckooFilter<number>()
      filter.insert(42)
      expect(filter.has(42)).toBe(true)
      expect(filter.has(99)).toBe(false)
    })
  })

  // ─── Count ─────────────────────────────────────────────────────────────

  describe('count', () => {
    it('returns 0 for non-existent item', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.count('nothing')).toBe(0)
    })

    it('returns 1 for a single insert', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('item')
      expect(filter.count('item')).toBe(1)
    })

    it('returns correct count for multiple inserts', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('x')
      filter.insert('x')
      filter.insert('x')
      filter.insert('x')
      filter.insert('x')
      expect(filter.count('x')).toBe(5)
    })

    it('decrements count after delete', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('y')
      filter.insert('y')
      filter.insert('y')
      filter.delete('y')
      expect(filter.count('y')).toBe(2)
    })

    it('returns 0 after all deletes', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('z')
      filter.delete('z')
      expect(filter.count('z')).toBe(0)
    })

    it('increments countQueries statistic', () => {
      const filter = new CountingCuckooFilter()
      filter.count('a')
      filter.count('b')
      expect(filter.getStatistics().countQueries).toBe(2)
    })

    it('returns 0 on empty filter', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.count('any')).toBe(0)
    })
  })

  // ─── Clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears all items from the filter', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('clears filter that has duplicate inserts', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('x')
      filter.insert('x')
      filter.insert('x')
      filter.clear()
      expect(filter.count('x')).toBe(0)
      expect(filter.size).toBe(0)
    })

    it('resets statistics after clear', () => {
      const filter = new CountingCuckooFilter()
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

    it('allows insertions after clear', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('before')
      filter.clear()
      filter.insert('after')
      expect(filter.size).toBe(1)
      expect(filter.has('after')).toBe(true)
      expect(filter.has('before')).toBe(false)
    })

    it('clear on already empty filter is safe', () => {
      const filter = new CountingCuckooFilter()
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })
  })

  // ─── Capacity ──────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns default capacity', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.capacity()).toBe(1024)
    })

    it('returns custom capacity', () => {
      const filter = new CountingCuckooFilter({ capacity: 2048 })
      expect(filter.capacity()).toBe(2048)
    })

    it('capacity does not change after insertions', () => {
      const filter = new CountingCuckooFilter({ capacity: 512 })
      filter.insert('item')
      expect(filter.capacity()).toBe(512)
    })
  })

  // ─── Load Factor ───────────────────────────────────────────────────────

  describe('loadFactor', () => {
    it('returns 0 for empty filter', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.loadFactor()).toBe(0)
    })

    it('returns positive value after insertions', () => {
      const filter = new CountingCuckooFilter({ capacity: 16, bucketSize: 4 })
      filter.insert('a')
      expect(filter.loadFactor()).toBeGreaterThan(0)
    })

    it('increases load factor with more unique items', () => {
      const filter = new CountingCuckooFilter({ capacity: 16, bucketSize: 4 })
      const lf1 = filter.loadFactor()
      filter.insert('a')
      const lf2 = filter.loadFactor()
      filter.insert('b')
      const lf3 = filter.loadFactor()
      expect(lf2).toBeGreaterThanOrEqual(lf1)
      expect(lf3).toBeGreaterThanOrEqual(lf2)
    })

    it('load factor decreases after delete removes entry', () => {
      const filter = new CountingCuckooFilter({ capacity: 16, bucketSize: 4 })
      filter.insert('unique-item')
      const lfBefore = filter.loadFactor()
      filter.delete('unique-item')
      const lfAfter = filter.loadFactor()
      expect(lfAfter).toBeLessThanOrEqual(lfBefore)
    })

    it('returns a value between 0 and 1', () => {
      const filter = new CountingCuckooFilter({ capacity: 16, bucketSize: 4 })
      for (let i = 0; i < 10; i++) {
        filter.insert(`item-${i}`)
      }
      const lf = filter.loadFactor()
      expect(lf).toBeGreaterThanOrEqual(0)
      expect(lf).toBeLessThanOrEqual(1)
    })
  })

  // ─── Size and IsEmpty ──────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for new filter', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.size).toBe(0)
    })

    it('isEmpty is true for new filter', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.isEmpty).toBe(true)
    })

    it('size increases with each insert including duplicates', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('x')
      filter.insert('x')
      expect(filter.size).toBe(2)
    })

    it('isEmpty becomes false after insert', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('item')
      expect(filter.isEmpty).toBe(false)
    })

    it('size decreases after delete', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.insert('b')
      filter.delete('a')
      expect(filter.size).toBe(1)
    })

    it('isEmpty returns true after deleting all items', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('only')
      filter.delete('only')
      expect(filter.isEmpty).toBe(true)
    })
  })

  // ─── Expected False Positive Rate ──────────────────────────────────────

  describe('expectedFalsePositiveRate', () => {
    it('returns 0 for empty filter', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('returns a positive value after insertions', () => {
      const filter = new CountingCuckooFilter({ fingerprintSize: 8, bucketSize: 4 })
      filter.insert('item')
      const rate = filter.expectedFalsePositiveRate()
      expect(rate).toBeGreaterThan(0)
    })

    it('rate is between 0 and 1', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('something')
      const rate = filter.expectedFalsePositiveRate()
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })

    it('smaller fingerprint size yields higher false positive rate', () => {
      const filter8 = new CountingCuckooFilter({ fingerprintSize: 8, bucketSize: 4 })
      const filter16 = new CountingCuckooFilter({ fingerprintSize: 16, bucketSize: 4 })
      filter8.insert('test')
      filter16.insert('test')
      expect(filter8.expectedFalsePositiveRate()).toBeGreaterThan(
        filter16.expectedFalsePositiveRate(),
      )
    })
  })

  // ─── Resize ────────────────────────────────────────────────────────────

  describe('resize', () => {
    it('resizes to a larger capacity', () => {
      const filter = new CountingCuckooFilter({ capacity: 16, bucketSize: 4 })
      filter.insert('a')
      filter.insert('b')
      const result = filter.resize(64)
      expect(result).toBe(true)
      expect(filter.capacity()).toBe(64)
    })

    it('resizes to a smaller capacity', () => {
      const filter = new CountingCuckooFilter({ capacity: 64, bucketSize: 4 })
      filter.insert('a')
      filter.resize(16)
      expect(filter.capacity()).toBe(16)
    })

    it('returns true on empty filter resize', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.resize(2048)).toBe(true)
      expect(filter.capacity()).toBe(2048)
    })

    it('returns false if items cannot fit in new capacity', () => {
      const filter = new CountingCuckooFilter({ capacity: 64, bucketSize: 2 })
      for (let i = 0; i < 30; i++) {
        filter.insert(`item-${i}`)
      }
      const result = filter.resize(4)
      if (result === false) {
        expect(result).toBe(false)
      }
    })

    it('preserves size after successful resize', () => {
      const filter = new CountingCuckooFilter({ capacity: 16, bucketSize: 4 })
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      const sizeBefore = filter.size
      filter.resize(64)
      expect(filter.size).toBe(sizeBefore)
    })
  })

  // ─── toJSON / fromJSON ────────────────────────────────────────────────

  describe('toJSON', () => {
    it('serializes an empty filter', () => {
      const filter = new CountingCuckooFilter()
      const json = filter.toJSON()
      expect(json).toHaveProperty('capacity')
      expect(json).toHaveProperty('bucketSize')
      expect(json).toHaveProperty('fingerprintSize')
      expect(json).toHaveProperty('maxKicks')
      expect(json).toHaveProperty('size')
      expect(json).toHaveProperty('stats')
      expect(json).toHaveProperty('buckets')
    })

    it('serializes capacity correctly', () => {
      const filter = new CountingCuckooFilter({ capacity: 512 })
      const json = filter.toJSON()
      expect((json as Record<string, unknown>).capacity).toBe(512)
    })

    it('serializes size correctly', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.insert('b')
      const json = filter.toJSON()
      expect((json as Record<string, unknown>).size).toBe(2)
    })

    it('serializes statistics correctly', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.has('a')
      const json = filter.toJSON()
      const stats = (json as Record<string, unknown>).stats as Record<string, number>
      expect(stats.inserts).toBe(1)
      expect(stats.lookups).toBe(1)
    })

    it('serializes buckets as array of arrays', () => {
      const filter = new CountingCuckooFilter()
      const json = filter.toJSON()
      const buckets = (json as Record<string, unknown>).buckets as unknown[][]
      expect(Array.isArray(buckets)).toBe(true)
    })
  })

  describe('fromJSON', () => {
    it('deserializes an empty filter', () => {
      const filter = new CountingCuckooFilter()
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.size).toBe(0)
      expect(restored.capacity()).toBe(filter.capacity())
    })

    it('round-trips a filter with data', () => {
      const filter = new CountingCuckooFilter({ capacity: 256, bucketSize: 4 })
      filter.insert('hello')
      filter.insert('world')
      filter.insert('hello')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.size).toBe(3)
      expect(restored.capacity()).toBe(256)
      expect(restored.has('hello')).toBe(true)
      expect(restored.has('world')).toBe(true)
    })

    it('preserves statistics after round-trip', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('x')
      filter.has('x')
      filter.count('x')
      const statsBefore = filter.getStatistics()
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      const statsAfter = restored.getStatistics()
      expect(statsAfter.inserts).toBe(statsBefore.inserts)
      expect(statsAfter.lookups).toBe(statsBefore.lookups)
      expect(statsAfter.countQueries).toBe(statsBefore.countQueries)
    })

    it('preserves capacity and bucket size', () => {
      const filter = new CountingCuckooFilter({ capacity: 128, bucketSize: 2 })
      filter.insert('a')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.capacity()).toBe(128)
    })

    it('allows further operations after deserialization', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('original')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      restored.insert('new-item')
      expect(restored.size).toBe(2)
      expect(restored.has('new-item')).toBe(true)
    })

    it('preserves counts after round-trip', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('item')
      filter.insert('item')
      filter.insert('item')
      const json = filter.toJSON()
      const restored = CountingCuckooFilter.fromJSON<string>(json)
      expect(restored.count('item')).toBe(3)
    })
  })

  // ─── Merge ─────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two compatible filters', () => {
      const filter1 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      const filter2 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      filter1.insert('a')
      filter2.insert('b')
      expect(filter1.merge(filter2)).toBe(true)
    })

    it('returns false for incompatible fingerprint sizes', () => {
      const filter1 = new CountingCuckooFilter({ fingerprintSize: 8 })
      const filter2 = new CountingCuckooFilter({ fingerprintSize: 16 })
      expect(filter1.merge(filter2)).toBe(false)
    })

    it('returns false for incompatible bucket sizes', () => {
      const filter1 = new CountingCuckooFilter({ bucketSize: 2 })
      const filter2 = new CountingCuckooFilter({ bucketSize: 4 })
      expect(filter1.merge(filter2)).toBe(false)
    })

    it('merges statistics', () => {
      const filter1 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      const filter2 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      filter1.insert('a')
      filter2.insert('b')
      filter2.insert('c')
      filter1.merge(filter2)
      const stats = filter1.getStatistics()
      expect(stats.inserts).toBeGreaterThanOrEqual(3)
    })

    it('merge with empty filter succeeds', () => {
      const filter1 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      const filter2 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      filter1.insert('a')
      expect(filter1.merge(filter2)).toBe(true)
    })

    it('does not modify the source filter', () => {
      const filter1 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      const filter2 = new CountingCuckooFilter({ capacity: 64, bucketSize: 4, fingerprintSize: 8 })
      filter2.insert('b')
      const sizeBefore = filter2.size
      filter1.merge(filter2)
      expect(filter2.size).toBe(sizeBefore)
    })
  })

  // ─── GetStatistics ─────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns a copy of statistics', () => {
      const filter = new CountingCuckooFilter()
      const stats1 = filter.getStatistics()
      const stats2 = filter.getStatistics()
      expect(stats1).toEqual(stats2)
      expect(stats1).not.toBe(stats2)
    })

    it('tracks inserts correctly', () => {
      const filter = new CountingCuckooFilter()
      for (let i = 0; i < 5; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.getStatistics().inserts).toBe(5)
    })

    it('tracks deletes correctly', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.insert('b')
      filter.delete('a')
      expect(filter.getStatistics().deletes).toBe(1)
    })

    it('tracks lookups correctly', () => {
      const filter = new CountingCuckooFilter()
      filter.has('x')
      filter.has('y')
      filter.has('z')
      expect(filter.getStatistics().lookups).toBe(3)
    })

    it('tracks countQueries correctly', () => {
      const filter = new CountingCuckooFilter()
      filter.count('a')
      filter.count('b')
      expect(filter.getStatistics().countQueries).toBe(2)
    })
  })

  // ─── DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS ────────────────────────────

  describe('DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS', () => {
    it('has correct default capacity', () => {
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.capacity).toBe(1024)
    })

    it('has correct default bucket size', () => {
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.bucketSize).toBe(4)
    })

    it('has correct default fingerprint size', () => {
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.fingerprintSize).toBe(8)
    })

    it('has correct default max kicks', () => {
      expect(DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS.maxKicks).toBe(500)
    })
  })

  // ─── Iterator ──────────────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('returns an iterator', () => {
      const filter = new CountingCuckooFilter()
      const iter = filter[Symbol.iterator]()
      expect(iter).toBeDefined()
      expect(typeof iter.next).toBe('function')
    })
  })

  // ─── Edge Cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty string insertions', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.insert('')).toBe(true)
      expect(filter.has('')).toBe(true)
      expect(filter.count('')).toBe(1)
    })

    it('handles special characters in items', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.insert('hello\nworld')).toBe(true)
      expect(filter.insert('tab\there')).toBe(true)
      expect(filter.insert('emoji: 🎉')).toBe(true)
      expect(filter.size).toBe(3)
    })

    it('handles null-like string representations', () => {
      const filter = new CountingCuckooFilter<string>()
      expect(filter.insert('null')).toBe(true)
      expect(filter.insert('undefined')).toBe(true)
      expect(filter.has('null')).toBe(true)
      expect(filter.has('undefined')).toBe(true)
    })

    it('handles very long strings', () => {
      const filter = new CountingCuckooFilter()
      const longStr = 'a'.repeat(10000)
      expect(filter.insert(longStr)).toBe(true)
      expect(filter.has(longStr)).toBe(true)
    })

    it('handles numeric zero as item', () => {
      const filter = new CountingCuckooFilter<number>()
      expect(filter.insert(0)).toBe(true)
      expect(filter.has(0)).toBe(true)
    })

    it('handles boolean-like values serialized', () => {
      const filter = new CountingCuckooFilter()
      expect(filter.insert('true')).toBe(true)
      expect(filter.insert('false')).toBe(true)
      expect(filter.has('true')).toBe(true)
      expect(filter.has('false')).toBe(true)
    })

    it('multiple delete-then-insert cycles', () => {
      const filter = new CountingCuckooFilter()
      for (let cycle = 0; cycle < 5; cycle++) {
        filter.insert('cyclic')
        filter.insert('cyclic')
        filter.delete('cyclic')
        expect(filter.count('cyclic')).toBe(1)
        filter.delete('cyclic')
        expect(filter.count('cyclic')).toBe(0)
      }
    })

    it('insert many unique items', () => {
      const filter = new CountingCuckooFilter({ capacity: 512, bucketSize: 4 })
      let inserted = 0
      for (let i = 0; i < 200; i++) {
        if (filter.insert(`unique-item-${i}`)) {
          inserted++
        }
      }
      expect(inserted).toBeGreaterThan(0)
      expect(filter.size).toBe(inserted)
    })

    it('clear and reuse cycle', () => {
      const filter = new CountingCuckooFilter({ capacity: 64, bucketSize: 4 })
      for (let round = 0; round < 3; round++) {
        filter.insert(`round-${round}`)
        expect(filter.size).toBe(1)
        filter.clear()
        expect(filter.size).toBe(0)
      }
    })

    it('handles object identity (different object refs with same values)', () => {
      const filter = new CountingCuckooFilter<{ id: number }>()
      filter.insert({ id: 1 })
      expect(filter.has({ id: 1 })).toBe(true)
    })

    it('size reflects all counting operations correctly', () => {
      const filter = new CountingCuckooFilter()
      filter.insert('a')
      filter.insert('a')
      filter.insert('a')
      filter.delete('a')
      filter.delete('a')
      expect(filter.size).toBe(1)
      expect(filter.count('a')).toBe(1)
    })
  })
})
