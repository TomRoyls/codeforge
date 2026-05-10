import { describe, it, expect, beforeEach } from 'vitest'
import { CountedBloomFilter } from '../../src/core/counted-bloom/counted-bloom.js'
import { DEFAULT_COUNTED_BLOOM_OPTIONS } from '../../src/core/counted-bloom/types.js'
import type { CountedBloomFilterOptions, CountedBloomFilterJSON, CountedBloomFilterStatistics } from '../../src/core/counted-bloom/types.js'

describe('CountedBloomFilter', () => {
  let filter: CountedBloomFilter

  beforeEach(() => {
    filter = new CountedBloomFilter()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const f = new CountedBloomFilter()
      expect(f.isEmpty).toBe(true)
      expect(f.size).toBe(0)
    })

    it('should accept expectedItems number', () => {
      const f = new CountedBloomFilter(5000)
      expect(f.capacity()).toBe(5000)
    })

    it('should accept expectedItems and falsePositiveRate', () => {
      const f = new CountedBloomFilter(500, 0.001)
      expect(f.capacity()).toBe(500)
    })

    it('should accept expectedItems, falsePositiveRate, and counterBits', () => {
      const f = new CountedBloomFilter(500, 0.001, 8)
      expect(f.capacity()).toBe(500)
    })

    it('should accept options object', () => {
      const f = new CountedBloomFilter({ expectedItems: 200, falsePositiveRate: 0.05 })
      expect(f.capacity()).toBe(200)
    })

    it('should accept partial options with defaults', () => {
      const f = new CountedBloomFilter({ expectedItems: 100 })
      expect(f.capacity()).toBe(100)
    })

    it('should accept only falsePositiveRate in options', () => {
      const f = new CountedBloomFilter({ falsePositiveRate: 0.001 })
      expect(f.capacity()).toBe(DEFAULT_COUNTED_BLOOM_OPTIONS.expectedItems)
    })

    it('should accept only counterBits in options', () => {
      const f = new CountedBloomFilter({ counterBits: 8 })
      expect(f.capacity()).toBe(DEFAULT_COUNTED_BLOOM_OPTIONS.expectedItems)
    })

    it('should use defaults when no args', () => {
      const f = new CountedBloomFilter()
      expect(f.capacity()).toBe(DEFAULT_COUNTED_BLOOM_OPTIONS.expectedItems)
    })

    it('should compute positive bucket count', () => {
      const f = new CountedBloomFilter(1000, 0.01)
      const json = f.toJSON()
      expect(json.bucketCount).toBeGreaterThan(0)
    })

    it('should compute positive hash count', () => {
      const f = new CountedBloomFilter(1000, 0.01)
      const json = f.toJSON()
      expect(json.hashCount).toBeGreaterThanOrEqual(1)
    })

    it('should use default counterBits of 4', () => {
      const f = new CountedBloomFilter()
      expect(f.toJSON().counterBits).toBe(4)
    })

    it('should produce larger bucket arrays for lower error rates', () => {
      const f1 = new CountedBloomFilter(100, 0.1)
      const f2 = new CountedBloomFilter(100, 0.001)
      expect(f2.toJSON().bucketCount).toBeGreaterThan(f1.toJSON().bucketCount)
    })

    it('should produce larger bucket arrays for more expected items', () => {
      const f1 = new CountedBloomFilter(100, 0.01)
      const f2 = new CountedBloomFilter(1000, 0.01)
      expect(f2.toJSON().bucketCount).toBeGreaterThan(f1.toJSON().bucketCount)
    })

    it('should support 8-bit counters', () => {
      const f = new CountedBloomFilter({ counterBits: 8 })
      expect(f.toJSON().counterBits).toBe(8)
    })

    it('should support 16-bit counters', () => {
      const f = new CountedBloomFilter({ counterBits: 16 })
      expect(f.toJSON().counterBits).toBe(16)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      filter.add('hello')
      expect(filter.size).toBe(1)
      expect(filter.isEmpty).toBe(false)
    })

    it('should add multiple distinct items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should add the same item multiple times', () => {
      filter.add('x')
      filter.add('x')
      filter.add('x')
      expect(filter.size).toBe(3)
      expect(filter.count('x')).toBe(3)
    })

    it('should track add statistics', () => {
      filter.add('a')
      filter.add('b')
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(2)
    })

    it('should increment counters on hash positions', () => {
      filter.add('test')
      const entries = [...filter]
      expect(entries.length).toBeGreaterThan(0)
    })

    it('should handle numeric items', () => {
      const f = new CountedBloomFilter<number>()
      f.add(42)
      expect(f.has(42)).toBe(true)
    })

    it('should handle object items', () => {
      const f = new CountedBloomFilter<{ id: number }>()
      f.add({ id: 1 })
      expect(f.has({ id: 1 })).toBe(true)
    })

    it('should detect overflow at max counter value', () => {
      const f = new CountedBloomFilter({ expectedItems: 10, counterBits: 2 })
      for (let i = 0; i < 20; i++) {
        f.add('same')
      }
      expect(f.getStatistics().overflows).toBeGreaterThan(0)
    })

    it('should cap counter at maxValue for 4-bit', () => {
      const f = new CountedBloomFilter({ expectedItems: 5, counterBits: 4 })
      for (let i = 0; i < 30; i++) {
        f.add('overflow-item')
      }
      expect(f.count('overflow-item')).toBeLessThanOrEqual(15)
    })

    it('should update estimatedFalsePositives after add', () => {
      filter.add('test')
      const stats = filter.getStatistics()
      expect(stats.estimatedFalsePositives).toBe(0)
    })
  })

  describe('remove', () => {
    it('should remove an existing item', () => {
      filter.add('hello')
      const result = filter.remove('hello')
      expect(result).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should return false for non-existing item', () => {
      const result = filter.remove('never-added')
      expect(result).toBe(false)
      expect(filter.size).toBe(0)
    })

    it('should return false on empty filter', () => {
      const result = filter.remove('anything')
      expect(result).toBe(false)
    })

    it('should decrement counter for multiple adds then remove', () => {
      filter.add('x')
      filter.add('x')
      filter.add('x')
      expect(filter.count('x')).toBe(3)
      filter.remove('x')
      expect(filter.count('x')).toBe(2)
      expect(filter.size).toBe(2)
    })

    it('should remove all instances of an item', () => {
      filter.add('y')
      filter.remove('y')
      expect(filter.has('y')).toBe(false)
    })

    it('should track remove statistics', () => {
      filter.add('a')
      filter.remove('a')
      const stats = filter.getStatistics()
      expect(stats.removes).toBe(1)
    })

    it('should not track remove stats on failed removal', () => {
      filter.remove('nonexistent')
      const stats = filter.getStatistics()
      expect(stats.removes).toBe(0)
    })

    it('should handle remove after add-remove-add cycle', () => {
      filter.add('item')
      filter.remove('item')
      filter.add('item')
      expect(filter.has('item')).toBe(true)
      expect(filter.count('item')).toBe(1)
      filter.remove('item')
      expect(filter.has('item')).toBe(false)
    })

    it('should maintain correct size after multiple removes', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.remove('a')
      filter.remove('b')
      expect(filter.size).toBe(1)
    })

    it('should not remove item that was never added (even with collisions)', () => {
      filter.add('alpha')
      const result = filter.remove('beta')
      expect(result).toBe(false)
    })
  })

  describe('has', () => {
    it('should return false on empty filter', () => {
      expect(filter.has('anything')).toBe(false)
    })

    it('should return true for added item', () => {
      filter.add('present')
      expect(filter.has('present')).toBe(true)
    })

    it('should return false for removed item', () => {
      filter.add('temporary')
      filter.remove('temporary')
      expect(filter.has('temporary')).toBe(false)
    })

    it('should return true for item added multiple times after one remove', () => {
      filter.add('multi')
      filter.add('multi')
      filter.remove('multi')
      expect(filter.has('multi')).toBe(true)
    })

    it('should track lookup statistics', () => {
      filter.add('a')
      filter.has('a')
      filter.has('b')
      const stats = filter.getStatistics()
      expect(stats.lookups).toBe(2)
    })

    it('should work with numeric items', () => {
      const f = new CountedBloomFilter<number>()
      f.add(42)
      expect(f.has(42)).toBe(true)
      expect(f.has(43)).toBe(false)
    })

    it('should work with boolean items', () => {
      const f = new CountedBloomFilter<boolean>()
      f.add(true)
      expect(f.has(true)).toBe(true)
      expect(f.has(false)).toBe(false)
    })

    it('should handle null items', () => {
      const f = new CountedBloomFilter<null>()
      f.add(null)
      expect(f.has(null)).toBe(true)
    })
  })

  describe('count', () => {
    it('should return 0 on empty filter', () => {
      expect(filter.count('nothing')).toBe(0)
    })

    it('should return 1 after single add', () => {
      filter.add('single')
      expect(filter.count('single')).toBe(1)
    })

    it('should return correct count after multiple adds', () => {
      filter.add('multi')
      filter.add('multi')
      filter.add('multi')
      expect(filter.count('multi')).toBe(3)
    })

    it('should return 0 for never-added item', () => {
      filter.add('present')
      expect(filter.count('absent')).toBe(0)
    })

    it('should decrement count after remove', () => {
      filter.add('item')
      filter.add('item')
      filter.remove('item')
      expect(filter.count('item')).toBe(1)
    })

    it('should track lookup statistics', () => {
      filter.add('a')
      filter.count('a')
      filter.count('b')
      const stats = filter.getStatistics()
      expect(stats.lookups).toBe(2)
    })

    it('should return 0 after all instances removed', () => {
      filter.add('gone')
      filter.remove('gone')
      expect(filter.count('gone')).toBe(0)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should set isEmpty to true', () => {
      filter.add('a')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })

    it('should reset all counters to 0', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      const entries = [...filter]
      expect(entries.length).toBe(0)
    })

    it('should reset statistics', () => {
      filter.add('a')
      filter.remove('a')
      filter.has('x')
      filter.clear()
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.overflows).toBe(0)
      expect(stats.estimatedFalsePositives).toBe(0)
    })

    it('should allow adding after clear', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.size).toBe(1)
      expect(filter.has('after')).toBe(true)
    })

    it('should not preserve old data after clear', () => {
      filter.add('old')
      filter.clear()
      expect(filter.has('old')).toBe(false)
    })
  })

  describe('capacity', () => {
    it('should return expectedItems from options', () => {
      const f = new CountedBloomFilter(500)
      expect(f.capacity()).toBe(500)
    })

    it('should return default when constructed with defaults', () => {
      const f = new CountedBloomFilter()
      expect(f.capacity()).toBe(DEFAULT_COUNTED_BLOOM_OPTIONS.expectedItems)
    })

    it('should return capacity from options object', () => {
      const f = new CountedBloomFilter({ expectedItems: 2000 })
      expect(f.capacity()).toBe(2000)
    })
  })

  describe('size', () => {
    it('should be 0 on new filter', () => {
      expect(filter.size).toBe(0)
    })

    it('should increment with each add', () => {
      filter.add('a')
      expect(filter.size).toBe(1)
      filter.add('b')
      expect(filter.size).toBe(2)
    })

    it('should decrement with each remove', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new filter', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('should be false after add', () => {
      filter.add('x')
      expect(filter.isEmpty).toBe(false)
    })

    it('should be true after removing all items', () => {
      filter.add('x')
      filter.remove('x')
      expect(filter.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      filter.add('x')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })
  })

  describe('falsePositiveRate', () => {
    it('should return 0 on empty filter', () => {
      expect(filter.falsePositiveRate()).toBe(0)
    })

    it('should increase as more items are added', () => {
      filter.add('a')
      const fp1 = filter.falsePositiveRate()
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      const fp2 = filter.falsePositiveRate()
      expect(fp2).toBeGreaterThan(fp1)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const fp = filter.falsePositiveRate()
      expect(fp).toBeGreaterThanOrEqual(0)
      expect(fp).toBeLessThanOrEqual(1)
    })

    it('should decrease with larger bucket count', () => {
      const f1 = new CountedBloomFilter(100, 0.1)
      const f2 = new CountedBloomFilter(100, 0.001)
      for (let i = 0; i < 50; i++) {
        const item = `item-${i}`
        f1.add(item)
        f2.add(item)
      }
      expect(f2.falsePositiveRate()).toBeLessThan(f1.falsePositiveRate())
    })

    it('should return 0 after clearing', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      filter.clear()
      expect(filter.falsePositiveRate()).toBe(0)
    })
  })

  describe('fillRatio', () => {
    it('should return 0 on empty filter', () => {
      expect(filter.fillRatio()).toBe(0)
    })

    it('should increase with adds', () => {
      filter.add('a')
      const fr1 = filter.fillRatio()
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      const fr2 = filter.fillRatio()
      expect(fr2).toBeGreaterThan(fr1)
    })

    it('should decrease with removes', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const fr1 = filter.fillRatio()
      for (let i = 0; i < 50; i++) {
        filter.remove(`item-${i}`)
      }
      const fr2 = filter.fillRatio()
      expect(fr2).toBeLessThanOrEqual(fr1)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const fr = filter.fillRatio()
      expect(fr).toBeGreaterThanOrEqual(0)
      expect(fr).toBeLessThanOrEqual(1)
    })

    it('should return 0 after clear', () => {
      filter.add('a')
      filter.clear()
      expect(filter.fillRatio()).toBe(0)
    })
  })

  describe('merge', () => {
    it('should merge two compatible filters', () => {
      const f1 = new CountedBloomFilter(100, 0.01)
      const f2 = new CountedBloomFilter(100, 0.01)
      f1.add('a')
      f2.add('b')
      f1.merge(f2)
      expect(f1.size).toBe(2)
      expect(f1.has('a')).toBe(true)
      expect(f1.has('b')).toBe(true)
    })

    it('should sum counters during merge', () => {
      const f1 = new CountedBloomFilter(100, 0.01)
      const f2 = new CountedBloomFilter(100, 0.01)
      f1.add('x')
      f2.add('x')
      f1.merge(f2)
      expect(f1.count('x')).toBeGreaterThanOrEqual(2)
    })

    it('should throw on different bucket counts', () => {
      const f1 = new CountedBloomFilter(100, 0.01)
      const f2 = new CountedBloomFilter(200, 0.01)
      expect(() => f1.merge(f2)).toThrow('bucket counts')
    })

    it('should throw on different counter sizes', () => {
      const f1 = new CountedBloomFilter({ expectedItems: 100, counterBits: 4 })
      const f2 = new CountedBloomFilter({ expectedItems: 100, counterBits: 8 })
      expect(() => f1.merge(f2 as CountedBloomFilter)).toThrow('counter sizes')
    })

    it('should merge statistics', () => {
      const f1 = new CountedBloomFilter(100, 0.01)
      const f2 = new CountedBloomFilter(100, 0.01)
      f1.add('a')
      f2.add('b')
      f1.has('a')
      f2.has('b')
      f1.merge(f2)
      const stats = f1.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.lookups).toBe(2)
    })

    it('should cap merged counters at maxValue', () => {
      const f1 = new CountedBloomFilter({ expectedItems: 5, counterBits: 2 })
      const f2 = new CountedBloomFilter({ expectedItems: 5, counterBits: 2 })
      for (let i = 0; i < 5; i++) {
        f1.add('maxed')
        f2.add('maxed')
      }
      f1.merge(f2)
      const entries = [...f1]
      for (const entry of entries) {
        expect(entry.count).toBeLessThanOrEqual(3)
      }
    })

    it('should merge empty filters without error', () => {
      const f1 = new CountedBloomFilter(100, 0.01)
      const f2 = new CountedBloomFilter(100, 0.01)
      f1.merge(f2)
      expect(f1.size).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      filter.add('test')
      const json = filter.toJSON()
      expect(json).toHaveProperty('counters')
      expect(json).toHaveProperty('counterBits')
      expect(json).toHaveProperty('bucketCount')
      expect(json).toHaveProperty('hashCount')
      expect(json).toHaveProperty('expectedItems')
      expect(json).toHaveProperty('targetFalsePositiveRate')
      expect(json).toHaveProperty('size')
      expect(json).toHaveProperty('statistics')
    })

    it('should include counter array as numbers', () => {
      filter.add('test')
      const json = filter.toJSON()
      expect(Array.isArray(json.counters)).toBe(true)
      for (const c of json.counters) {
        expect(typeof c).toBe('number')
      }
    })

    it('should reflect current size', () => {
      filter.add('a')
      filter.add('b')
      const json = filter.toJSON()
      expect(json.size).toBe(2)
    })

    it('should include statistics', () => {
      filter.add('a')
      filter.has('a')
      const json = filter.toJSON()
      expect(json.statistics.adds).toBe(1)
      expect(json.statistics.lookups).toBe(1)
    })

    it('should serialize with correct counterBits', () => {
      const f = new CountedBloomFilter({ counterBits: 8 })
      expect(f.toJSON().counterBits).toBe(8)
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized filter', () => {
      const original = new CountedBloomFilter(100, 0.01)
      original.add('hello')
      original.add('world')
      const json = original.toJSON()
      const restored = CountedBloomFilter.fromJSON(json)
      expect(restored.size).toBe(2)
      expect(restored.has('hello')).toBe(true)
      expect(restored.has('world')).toBe(true)
    })

    it('should preserve counter values', () => {
      const original = new CountedBloomFilter(100, 0.01)
      original.add('x')
      original.add('x')
      original.add('x')
      const json = original.toJSON()
      const restored = CountedBloomFilter.fromJSON(json)
      expect(restored.count('x')).toBe(3)
    })

    it('should round-trip correctly', () => {
      const original = new CountedBloomFilter(200, 0.005)
      for (let i = 0; i < 50; i++) {
        original.add(`item-${i}`)
      }
      const json = original.toJSON()
      const restored = CountedBloomFilter.fromJSON(json)
      const json2 = restored.toJSON()
      expect(json.counters).toEqual(json2.counters)
      expect(json.size).toBe(json2.size)
    })

    it('should preserve statistics', () => {
      const original = new CountedBloomFilter(100, 0.01)
      original.add('a')
      original.has('a')
      const json = original.toJSON()
      const restored = CountedBloomFilter.fromJSON(json)
      const stats = restored.getStatistics()
      expect(stats.adds).toBe(1)
      expect(stats.lookups).toBe(1)
    })

    it('should handle 8-bit counter JSON', () => {
      const original = new CountedBloomFilter({ expectedItems: 100, counterBits: 8 })
      original.add('test')
      const json = original.toJSON()
      const restored = CountedBloomFilter.fromJSON(json)
      expect(restored.has('test')).toBe(true)
      expect(restored.toJSON().counterBits).toBe(8)
    })

    it('should handle 16-bit counter JSON', () => {
      const original = new CountedBloomFilter({ expectedItems: 100, counterBits: 16 })
      original.add('test')
      const json = original.toJSON()
      const restored = CountedBloomFilter.fromJSON(json)
      expect(restored.has('test')).toBe(true)
      expect(restored.toJSON().counterBits).toBe(16)
    })

    it('should allow operations after restoration', () => {
      const original = new CountedBloomFilter(100, 0.01)
      original.add('a')
      const restored = CountedBloomFilter.fromJSON(original.toJSON())
      restored.add('b')
      expect(restored.size).toBe(2)
      restored.remove('a')
      expect(restored.has('b')).toBe(true)
    })
  })

  describe('getStatistics', () => {
    it('should return all-zero stats on new filter', () => {
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.overflows).toBe(0)
      expect(stats.estimatedFalsePositives).toBe(0)
    })

    it('should track adds', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.getStatistics().adds).toBe(3)
    })

    it('should track removes', () => {
      filter.add('a')
      filter.remove('a')
      expect(filter.getStatistics().removes).toBe(1)
    })

    it('should track lookups from has', () => {
      filter.has('a')
      filter.has('b')
      expect(filter.getStatistics().lookups).toBe(2)
    })

    it('should track lookups from count', () => {
      filter.count('a')
      filter.count('b')
      filter.count('c')
      expect(filter.getStatistics().lookups).toBe(3)
    })

    it('should accumulate lookups from both has and count', () => {
      filter.has('a')
      filter.count('b')
      expect(filter.getStatistics().lookups).toBe(2)
    })

    it('should track overflows', () => {
      const f = new CountedBloomFilter({ expectedItems: 5, counterBits: 2 })
      for (let i = 0; i < 20; i++) {
        f.add('same')
      }
      expect(f.getStatistics().overflows).toBeGreaterThan(0)
    })

    it('should return a copy of statistics', () => {
      filter.add('a')
      const stats1 = filter.getStatistics()
      filter.add('b')
      const stats2 = filter.getStatistics()
      expect(stats1.adds).toBe(1)
      expect(stats2.adds).toBe(2)
    })

    it('should not track lookups for failed removes', () => {
      filter.remove('nonexistent')
      expect(filter.getStatistics().lookups).toBe(0)
    })
  })

  describe('estimatedCount', () => {
    it('should return 0 on empty filter', () => {
      expect(filter.estimatedCount()).toBe(0)
    })

    it('should return positive value after adds', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.estimatedCount()).toBeGreaterThan(0)
    })

    it('should be close to actual size', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      const estimated = filter.estimatedCount()
      expect(Math.abs(estimated - 100)).toBeLessThan(50)
    })

    it('should decrease after removes', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const est1 = filter.estimatedCount()
      for (let i = 0; i < 25; i++) {
        filter.remove(`item-${i}`)
      }
      const est2 = filter.estimatedCount()
      expect(est2).toBeLessThanOrEqual(est1)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should yield nothing on empty filter', () => {
      const entries = [...filter]
      expect(entries.length).toBe(0)
    })

    it('should yield entries after adding items', () => {
      filter.add('test')
      const entries = [...filter]
      expect(entries.length).toBeGreaterThan(0)
    })

    it('should yield objects with position and count', () => {
      filter.add('test')
      const entries = [...filter]
      for (const entry of entries) {
        expect(entry).toHaveProperty('position')
        expect(entry).toHaveProperty('count')
        expect(typeof entry.position).toBe('number')
        expect(typeof entry.count).toBe('number')
      }
    })

    it('should only yield non-zero counters', () => {
      filter.add('test')
      const entries = [...filter]
      for (const entry of entries) {
        expect(entry.count).toBeGreaterThan(0)
      }
    })

    it('should reflect multiple adds of same item', () => {
      filter.add('x')
      filter.add('x')
      filter.add('x')
      const entries = [...filter]
      const maxCount = Math.max(...entries.map(e => e.count))
      expect(maxCount).toBeGreaterThanOrEqual(3)
    })

    it('should be usable with for-of', () => {
      filter.add('a')
      let count = 0
      for (const entry of filter) {
        expect(entry.count).toBeGreaterThan(0)
        count++
      }
      expect(count).toBeGreaterThan(0)
    })
  })

  describe('generic type support', () => {
    it('should work with string items (default)', () => {
      const f = new CountedBloomFilter<string>()
      f.add('hello')
      expect(f.has('hello')).toBe(true)
    })

    it('should work with number items', () => {
      const f = new CountedBloomFilter<number>()
      f.add(1)
      f.add(2)
      f.add(3)
      expect(f.has(2)).toBe(true)
      expect(f.has(99)).toBe(false)
    })

    it('should work with object items', () => {
      const f = new CountedBloomFilter<{ id: number }>()
      f.add({ id: 1 })
      f.add({ id: 2 })
      expect(f.has({ id: 1 })).toBe(true)
    })

    it('should distinguish different objects', () => {
      const f = new CountedBloomFilter<{ id: number }>()
      f.add({ id: 1 })
      expect(f.has({ id: 1 })).toBe(true)
      expect(f.has({ id: 2 })).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle add-remove-add cycle', () => {
      filter.add('item')
      filter.remove('item')
      filter.add('item')
      expect(filter.has('item')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should handle many distinct items', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(filter.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle rapid add and clear cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        filter.add(`cycle-${cycle}`)
        filter.clear()
      }
      expect(filter.size).toBe(0)
    })

    it('should handle empty string item', () => {
      filter.add('')
      expect(filter.has('')).toBe(true)
      expect(filter.count('')).toBe(1)
    })

    it('should handle single item overflow scenario', () => {
      const f = new CountedBloomFilter({ expectedItems: 1, counterBits: 2 })
      for (let i = 0; i < 10; i++) {
        f.add('saturated')
      }
      expect(f.count('saturated')).toBeLessThanOrEqual(3)
      expect(f.getStatistics().overflows).toBeGreaterThan(0)
    })

    it('should handle merge after modifications', () => {
      const f1 = new CountedBloomFilter(100, 0.01)
      const f2 = new CountedBloomFilter(100, 0.01)
      f1.add('a')
      f1.add('b')
      f1.remove('a')
      f2.add('c')
      f1.merge(f2)
      expect(f1.has('b')).toBe(true)
      expect(f1.has('c')).toBe(true)
    })
  })

  describe('DEFAULT_COUNTED_BLOOM_OPTIONS', () => {
    it('should have expectedItems of 1000', () => {
      expect(DEFAULT_COUNTED_BLOOM_OPTIONS.expectedItems).toBe(1000)
    })

    it('should have falsePositiveRate of 0.01', () => {
      expect(DEFAULT_COUNTED_BLOOM_OPTIONS.falsePositiveRate).toBe(0.01)
    })

    it('should have counterBits of 4', () => {
      expect(DEFAULT_COUNTED_BLOOM_OPTIONS.counterBits).toBe(4)
    })
  })

  describe('exports', () => {
    it('should export CountedBloomFilter class', () => {
      expect(CountedBloomFilter).toBeDefined()
      expect(typeof CountedBloomFilter).toBe('function')
    })

    it('should export DEFAULT_COUNTED_BLOOM_OPTIONS', () => {
      expect(DEFAULT_COUNTED_BLOOM_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports', () => {
      const opts: CountedBloomFilterOptions = { expectedItems: 100 }
      const f = new CountedBloomFilter(opts)
      expect(f.capacity()).toBe(100)
    })

    it('should allow type import for CountedBloomFilterJSON', () => {
      const f = new CountedBloomFilter(100, 0.01)
      const json: CountedBloomFilterJSON = f.toJSON()
      expect(json.bucketCount).toBeGreaterThan(0)
    })

    it('should allow type import for CountedBloomFilterStatistics', () => {
      const f = new CountedBloomFilter()
      const stats: CountedBloomFilterStatistics = f.getStatistics()
      expect(stats.adds).toBe(0)
    })
  })
})
