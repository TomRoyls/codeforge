import { describe, it, expect, beforeEach } from 'vitest'
import { CountingFilter } from '../../src/core/counting-filter/counting-filter.js'
import { DEFAULT_COUNTING_FILTER_OPTIONS } from '../../src/core/counting-filter/types.js'
import type { CountingFilterOptions, CountingFilterJSON, CountingFilterStats } from '../../src/core/counting-filter/types.js'

describe('CountingFilter', () => {
  let filter: CountingFilter<string>

  beforeEach(() => {
    filter = new CountingFilter<string>()
  })

  describe('constructor', () => {
    it('should create a filter with default options', () => {
      const f = new CountingFilter<string>()
      expect(f.isEmpty()).toBe(true)
      expect(f.size).toBe(0)
    })

    it('should accept positional arguments: expectedItems, falsePositiveRate', () => {
      const f = new CountingFilter<string>(5000, 0.001)
      expect(f.capacity).toBe(5000)
    })

    it('should accept options object', () => {
      const f = new CountingFilter<string>({ expectedItems: 5000, falsePositiveRate: 0.001 })
      expect(f.capacity).toBe(5000)
    })

    it('should accept partial options object with defaults', () => {
      const f = new CountingFilter<string>({ expectedItems: 200 })
      expect(f.capacity).toBe(200)
    })

    it('should accept only falsePositiveRate in options', () => {
      const f = new CountingFilter<string>({ falsePositiveRate: 0.05 })
      expect(f.isEmpty()).toBe(true)
    })

    it('should default to 8-bit counters', () => {
      const f = new CountingFilter<string>()
      const s = f.stats()
      expect(s.counterBits).toBe(8)
    })

    it('should accept 16-bit counters', () => {
      const f = new CountingFilter<string>({ counterBits: 16 })
      const s = f.stats()
      expect(s.counterBits).toBe(16)
    })

    it('should compute positive counter count', () => {
      const f = new CountingFilter<string>(1000, 0.01)
      const s = f.stats()
      expect(s.counterCount).toBeGreaterThan(0)
    })

    it('should compute positive hash count', () => {
      const f = new CountingFilter<string>(1000, 0.01)
      const s = f.stats()
      expect(s.hashCount).toBeGreaterThan(0)
    })

    it('should use at least 1 hash function', () => {
      const f = new CountingFilter<string>(10, 0.5)
      const s = f.stats()
      expect(s.hashCount).toBeGreaterThanOrEqual(1)
    })

    it('should produce larger counter arrays for lower error rates', () => {
      const f1 = new CountingFilter<string>(100, 0.1)
      const f2 = new CountingFilter<string>(100, 0.001)
      expect(f2.stats().counterCount).toBeGreaterThan(f1.stats().counterCount)
    })

    it('should produce larger counter arrays for larger capacities', () => {
      const f1 = new CountingFilter<string>(100, 0.01)
      const f2 = new CountingFilter<string>(10000, 0.01)
      expect(f2.stats().counterCount).toBeGreaterThan(f1.stats().counterCount)
    })

    it('should use optimal k = (m/n) * ln(2)', () => {
      const f = new CountingFilter<string>(1000, 0.01)
      const s = f.stats()
      const expectedK = Math.max(1, Math.round((s.counterCount / 1000) * Math.log(2)))
      expect(s.hashCount).toBe(expectedK)
    })

    it('should default to 1000 expected items', () => {
      const f1 = new CountingFilter<string>()
      const f2 = new CountingFilter<string>(1000, 0.01)
      expect(f1.stats().counterCount).toBe(f2.stats().counterCount)
    })

    it('should create a filter with no arguments', () => {
      const f = new CountingFilter()
      expect(f.size).toBe(0)
      expect(f.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert an item and increase size', () => {
      filter.insert('hello')
      expect(filter.size).toBe(1)
    })

    it('should insert multiple different items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.size).toBe(3)
    })

    it('should count duplicate inserts as additional items', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.size).toBe(2)
    })

    it('should handle empty string', () => {
      filter.insert('')
      expect(filter.size).toBe(1)
    })

    it('should handle unicode strings', () => {
      filter.insert('日本語')
      filter.insert('🎉🚀')
      expect(filter.size).toBe(2)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      filter.insert(longStr)
      expect(filter.size).toBe(1)
    })

    it('should handle strings with special characters', () => {
      filter.insert('hello\nworld\t!')
      filter.insert('path/to/file.ts')
      expect(filter.size).toBe(2)
    })

    it('should handle numeric strings', () => {
      filter.insert('123')
      filter.insert('456')
      expect(filter.size).toBe(2)
    })

    it('should handle whitespace-only strings', () => {
      filter.insert('   ')
      filter.insert('\t')
      filter.insert('\n')
      expect(filter.size).toBe(3)
    })

    it('should handle strings with null characters', () => {
      filter.insert('before\0after')
      expect(filter.size).toBe(1)
      expect(filter.mayContain('before\0after')).toBe(true)
    })

    it('should increment counters for hash positions', () => {
      filter.insert('test')
      const s = filter.stats()
      expect(s.usedCounters).toBeGreaterThan(0)
    })

    it('should increment counters multiple times for duplicate inserts', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      expect(filter.count('test')).toBe(3)
    })
  })

  describe('mayContain', () => {
    it('should return true for an inserted item', () => {
      filter.insert('hello')
      expect(filter.mayContain('hello')).toBe(true)
    })

    it('should return false for an item not inserted', () => {
      filter.insert('hello')
      expect(filter.mayContain('world')).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.mayContain('anything')).toBe(false)
    })

    it('should find multiple inserted items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.mayContain('a')).toBe(true)
      expect(filter.mayContain('b')).toBe(true)
      expect(filter.mayContain('c')).toBe(true)
    })

    it('should handle empty string lookup', () => {
      filter.insert('')
      expect(filter.mayContain('')).toBe(true)
    })

    it('should handle unicode string lookup', () => {
      filter.insert('日本語')
      expect(filter.mayContain('日本語')).toBe(true)
      expect(filter.mayContain('English')).toBe(false)
    })

    it('should find items after many inserts', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.mayContain('item-0')).toBe(true)
      expect(filter.mayContain('item-50')).toBe(true)
      expect(filter.mayContain('item-99')).toBe(true)
    })

    it('should handle duplicate inserts consistently', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.mayContain('test')).toBe(true)
    })

    it('should handle case sensitivity', () => {
      filter.insert('Hello')
      expect(filter.mayContain('Hello')).toBe(true)
      expect(filter.mayContain('hello')).toBe(false)
    })

    it('should handle mixed unicode content', () => {
      filter.insert('hello世界🎉')
      expect(filter.mayContain('hello世界🎉')).toBe(true)
      expect(filter.mayContain('hello世界')).toBe(false)
    })

    it('should never produce false negatives', () => {
      const f = new CountingFilter<string>(100, 0.01)
      for (let i = 0; i < 100; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(f.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should still contain item after partial removal', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      filter.remove('test')
      expect(filter.mayContain('test')).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove an inserted item and return true', () => {
      filter.insert('test')
      const result = filter.remove('test')
      expect(result).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should return false for item not in filter', () => {
      const result = filter.remove('never-inserted')
      expect(result).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.remove('anything')).toBe(false)
    })

    it('should correctly handle duplicate inserts and removals', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      expect(filter.remove('test')).toBe(true)
      expect(filter.size).toBe(2)
      expect(filter.mayContain('test')).toBe(true)
      expect(filter.remove('test')).toBe(true)
      expect(filter.size).toBe(1)
      expect(filter.mayContain('test')).toBe(true)
      expect(filter.remove('test')).toBe(true)
      expect(filter.size).toBe(0)
      expect(filter.mayContain('test')).toBe(false)
    })

    it('should not affect other items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      expect(filter.mayContain('b')).toBe(true)
    })

    it('should handle remove after clear fails', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.remove('test')).toBe(false)
    })

    it('should handle re-insertion after removal', () => {
      filter.insert('test')
      filter.remove('test')
      filter.insert('test')
      expect(filter.mayContain('test')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should handle removing item with empty string key', () => {
      filter.insert('')
      expect(filter.remove('')).toBe(true)
      expect(filter.mayContain('')).toBe(false)
    })

    it('should handle removing unicode items', () => {
      filter.insert('日本語')
      expect(filter.remove('日本語')).toBe(true)
      expect(filter.mayContain('日本語')).toBe(false)
    })

    it('should decrement size for each removal', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.size).toBe(3)
      filter.remove('a')
      expect(filter.size).toBe(2)
      filter.remove('b')
      expect(filter.size).toBe(1)
      filter.remove('c')
      expect(filter.size).toBe(0)
    })

    it('should only remove one instance per call', () => {
      filter.insert('x')
      filter.insert('x')
      filter.remove('x')
      expect(filter.size).toBe(1)
      expect(filter.count('x')).toBe(1)
    })
  })

  describe('count', () => {
    it('should return 0 for item not inserted', () => {
      expect(filter.count('test')).toBe(0)
    })

    it('should return 1 after single insert', () => {
      filter.insert('test')
      expect(filter.count('test')).toBe(1)
    })

    it('should return 2 after two inserts', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.count('test')).toBe(2)
    })

    it('should return 0 after insert and remove', () => {
      filter.insert('test')
      filter.remove('test')
      expect(filter.count('test')).toBe(0)
    })

    it('should decrease after removal', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      filter.remove('test')
      expect(filter.count('test')).toBe(2)
    })

    it('should return 0 for empty filter', () => {
      expect(filter.count('anything')).toBe(0)
    })

    it('should return count for empty string key', () => {
      filter.insert('')
      expect(filter.count('')).toBe(1)
    })

    it('should count each item independently', () => {
      filter.insert('a')
      filter.insert('a')
      filter.insert('b')
      expect(filter.count('a')).toBe(2)
      expect(filter.count('b')).toBe(1)
    })

    it('should handle multiple inserts and removals', () => {
      filter.insert('x')
      filter.insert('x')
      filter.insert('x')
      filter.remove('x')
      filter.remove('x')
      expect(filter.count('x')).toBe(1)
    })

    it('should return 0 after all instances removed', () => {
      filter.insert('x')
      filter.remove('x')
      expect(filter.count('x')).toBe(0)
    })

    it('should estimate count correctly for many duplicates', () => {
      for (let i = 0; i < 10; i++) {
        filter.insert('same')
      }
      expect(filter.count('same')).toBe(10)
    })
  })

  describe('size', () => {
    it('should return 0 for new filter', () => {
      expect(filter.size).toBe(0)
    })

    it('should return 1 after one insert', () => {
      filter.insert('item')
      expect(filter.size).toBe(1)
    })

    it('should track multiple inserts', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.size).toBe(3)
    })

    it('should count duplicate inserts', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.size).toBe(2)
    })

    it('should handle many items', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.size).toBe(100)
    })

    it('should reset after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should decrease after remove', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      expect(filter.size).toBe(1)
    })
  })

  describe('capacity', () => {
    it('should return expectedItems as capacity', () => {
      const f = new CountingFilter<string>(5000, 0.01)
      expect(f.capacity).toBe(5000)
    })

    it('should return default capacity', () => {
      expect(filter.capacity).toBe(1000)
    })

    it('should remain constant after operations', () => {
      const cap = filter.capacity
      filter.insert('test')
      expect(filter.capacity).toBe(cap)
    })

    it('should remain constant after clear', () => {
      const cap = filter.capacity
      filter.insert('test')
      filter.clear()
      expect(filter.capacity).toBe(cap)
    })

    it('should match expectedItems from options', () => {
      const f = new CountingFilter<string>({ expectedItems: 200 })
      expect(f.capacity).toBe(200)
    })
  })

  describe('falsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.falsePositiveRate()).toBe(0)
    })

    it('should return a positive value after inserting items', () => {
      filter.insert('test')
      expect(filter.falsePositiveRate()).toBeGreaterThan(0)
    })

    it('should increase as more items are inserted', () => {
      const f = new CountingFilter<string>(100, 0.01)
      const fp1 = f.falsePositiveRate()
      for (let i = 0; i < 50; i++) {
        f.insert(`item-${i}`)
      }
      const fp50 = f.falsePositiveRate()
      for (let i = 50; i < 100; i++) {
        f.insert(`item-${i}`)
      }
      const fp100 = f.falsePositiveRate()
      expect(fp50).toBeGreaterThan(fp1)
      expect(fp100).toBeGreaterThan(fp50)
    })

    it('should be close to target when at expected capacity', () => {
      const f = new CountingFilter<string>(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.insert(`item-${i}`)
      }
      const fp = f.falsePositiveRate()
      expect(fp).toBeLessThan(0.05)
    })

    it('should reset to 0 after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.falsePositiveRate()).toBe(0)
    })

    it('should decrease after removal', () => {
      for (let i = 0; i < 50; i++) {
        filter.insert(`item-${i}`)
      }
      const fpBefore = filter.falsePositiveRate()
      for (let i = 0; i < 25; i++) {
        filter.remove(`item-${i}`)
      }
      const fpAfter = filter.falsePositiveRate()
      expect(fpAfter).toBeLessThan(fpBefore)
    })

    it('should report estimated FP matching formula', () => {
      const f = new CountingFilter<string>(100, 0.01)
      for (let i = 0; i < 50; i++) {
        f.insert(`item-${i}`)
      }
      const s = f.stats()
      const expected = Math.pow(
        1 - Math.exp((-s.hashCount * 50) / s.counterCount),
        s.hashCount,
      )
      expect(f.falsePositiveRate()).toBeCloseTo(expected, 10)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new filter', () => {
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      filter.insert('test')
      expect(filter.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false with many items', () => {
      for (let i = 0; i < 10; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.isEmpty()).toBe(false)
    })

    it('should return true after removing all items', () => {
      filter.insert('test')
      filter.remove('test')
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false if items remain after removal', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      expect(filter.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should make the filter empty', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should reset mayContain to false for all items', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.mayContain('test')).toBe(false)
    })

    it('should allow inserting after clear', () => {
      filter.insert('first')
      filter.clear()
      filter.insert('second')
      expect(filter.size).toBe(1)
      expect(filter.mayContain('second')).toBe(true)
    })

    it('should handle clearing an empty filter', () => {
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should preserve capacity after clear', () => {
      const cap = filter.capacity
      filter.insert('test')
      filter.clear()
      expect(filter.capacity).toBe(cap)
    })

    it('should reset all counters to zero', () => {
      filter.insert('test')
      filter.insert('test')
      filter.clear()
      const s = filter.stats()
      expect(s.usedCounters).toBe(0)
      expect(s.maxCounter).toBe(0)
    })

    it('should reset count for all items', () => {
      filter.insert('test')
      filter.insert('test')
      filter.clear()
      expect(filter.count('test')).toBe(0)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      filter.insert('test')
      const cloned = filter.clone()
      expect(cloned.size).toBe(filter.size)
      expect(cloned.mayContain('test')).toBe(true)
    })

    it('should not affect original when modified', () => {
      filter.insert('shared')
      const cloned = filter.clone()
      cloned.insert('new')
      expect(filter.mayContain('new')).toBe(false)
      expect(cloned.mayContain('new')).toBe(true)
    })

    it('should not affect clone when original is modified', () => {
      filter.insert('shared')
      const cloned = filter.clone()
      filter.insert('original-only')
      expect(cloned.mayContain('original-only')).toBe(false)
    })

    it('should preserve counterBits', () => {
      const f = new CountingFilter<string>({ counterBits: 16 })
      f.insert('test')
      const cloned = f.clone()
      expect(cloned.stats().counterBits).toBe(16)
    })

    it('should clone an empty filter', () => {
      const cloned = filter.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should preserve all items', () => {
      for (let i = 0; i < 50; i++) {
        filter.insert(`item-${i}`)
      }
      const cloned = filter.clone()
      for (let i = 0; i < 50; i++) {
        expect(cloned.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should produce independent removal', () => {
      filter.insert('test')
      filter.insert('test')
      const cloned = filter.clone()
      cloned.remove('test')
      expect(filter.count('test')).toBe(2)
      expect(cloned.count('test')).toBe(1)
    })

    it('should preserve capacity', () => {
      const f = new CountingFilter<string>(500, 0.01)
      f.insert('test')
      const cloned = f.clone()
      expect(cloned.capacity).toBe(f.capacity)
    })

    it('should preserve counter values', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      const cloned = filter.clone()
      expect(cloned.count('test')).toBe(3)
    })
  })

  describe('from factory', () => {
    it('should create filter from JSON', () => {
      filter.insert('hello')
      filter.insert('world')
      const json = filter.toJSON()
      const restored = CountingFilter.from<string>(json)
      expect(restored.mayContain('hello')).toBe(true)
      expect(restored.mayContain('world')).toBe(true)
      expect(restored.size).toBe(2)
    })

    it('should create filter fromJSON', () => {
      filter.insert('test')
      const json = filter.toJSON()
      const restored = CountingFilter.fromJSON<string>(json)
      expect(restored.mayContain('test')).toBe(true)
    })

    it('should preserve counterBits through from', () => {
      const f = new CountingFilter<string>({ counterBits: 16 })
      f.insert('test')
      const json = f.toJSON()
      const restored = CountingFilter.from<string>(json)
      expect(restored.stats().counterBits).toBe(16)
    })

    it('should preserve counters through from', () => {
      filter.insert('test')
      filter.insert('test')
      filter.insert('test')
      const json = filter.toJSON()
      const restored = CountingFilter.from<string>(json)
      expect(restored.count('test')).toBe(3)
    })

    it('should handle empty filter through from', () => {
      const json = filter.toJSON()
      const restored = CountingFilter.from<string>(json)
      expect(restored.isEmpty()).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should handle filter with many items through from', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert(`item-${i}`)
      }
      const json = filter.toJSON()
      const restored = CountingFilter.from<string>(json)
      for (let i = 0; i < 100; i++) {
        expect(restored.mayContain(`item-${i}`)).toBe(true)
      }
      expect(restored.size).toBe(100)
    })
  })

  describe('toJSON / fromJSON', () => {
    it('should serialize to JSON', () => {
      filter.insert('test')
      const json = filter.toJSON()
      expect(json.counters).toBeInstanceOf(Array)
      expect(json.counterCount).toBe(filter.stats().counterCount)
      expect(json.hashCount).toBe(filter.stats().hashCount)
      expect(json.itemCount).toBe(1)
      expect(json.counterBits).toBe(8)
    })

    it('should round-trip through JSON', () => {
      filter.insert('hello')
      filter.insert('world')
      const json = filter.toJSON()
      const restored = CountingFilter.fromJSON<string>(json)
      expect(restored.mayContain('hello')).toBe(true)
      expect(restored.mayContain('world')).toBe(true)
      expect(restored.size).toBe(2)
    })

    it('should preserve counterCount through serialization', () => {
      const f = new CountingFilter<string>(500, 0.001)
      f.insert('test')
      const json = f.toJSON()
      expect(json.counterCount).toBe(f.stats().counterCount)
      const restored = CountingFilter.fromJSON<string>(json)
      expect(restored.stats().counterCount).toBe(f.stats().counterCount)
    })

    it('should preserve hashCount through serialization', () => {
      filter.insert('test')
      const json = filter.toJSON()
      const restored = CountingFilter.fromJSON<string>(json)
      expect(restored.stats().hashCount).toBe(filter.stats().hashCount)
    })

    it('should preserve expectedItems through serialization', () => {
      const f = new CountingFilter<string>(500, 0.01)
      f.insert('test')
      const json = f.toJSON()
      expect(json.expectedItems).toBe(500)
    })

    it('should preserve targetFalsePositiveRate through serialization', () => {
      const f = new CountingFilter<string>(100, 0.001)
      f.insert('test')
      const json = f.toJSON()
      expect(json.targetFalsePositiveRate).toBe(0.001)
    })

    it('should handle empty filter serialization', () => {
      const json = filter.toJSON()
      const restored = CountingFilter.fromJSON<string>(json)
      expect(restored.isEmpty()).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should produce valid CountingFilterJSON type', () => {
      filter.insert('test')
      const json: CountingFilterJSON = filter.toJSON()
      expect(typeof json.counters).toBe('object')
      expect(typeof json.counterCount).toBe('number')
      expect(typeof json.hashCount).toBe('number')
      expect(typeof json.expectedItems).toBe('number')
      expect(typeof json.targetFalsePositiveRate).toBe('number')
      expect(typeof json.itemCount).toBe('number')
      expect(typeof json.counterBits).toBe('number')
    })

    it('should preserve 16-bit counter data', () => {
      const f = new CountingFilter<string>({ counterBits: 16 })
      f.insert('test')
      const json = f.toJSON()
      expect(json.counterBits).toBe(16)
      const restored = CountingFilter.fromJSON<string>(json)
      expect(restored.stats().counterBits).toBe(16)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty filter', () => {
      const s = filter.stats()
      expect(s.size).toBe(0)
      expect(s.capacity).toBe(1000)
      expect(s.falsePositiveRate).toBe(0)
      expect(s.usedCounters).toBe(0)
      expect(s.maxCounter).toBe(0)
      expect(s.fillRatio).toBe(0)
    })

    it('should return correct stats after inserts', () => {
      filter.insert('test')
      filter.insert('test')
      const s = filter.stats()
      expect(s.size).toBe(2)
      expect(s.usedCounters).toBeGreaterThan(0)
      expect(s.maxCounter).toBeGreaterThan(0)
    })

    it('should include all required fields', () => {
      const s: CountingFilterStats = filter.stats()
      expect(typeof s.counterCount).toBe('number')
      expect(typeof s.hashCount).toBe('number')
      expect(typeof s.expectedItems).toBe('number')
      expect(typeof s.targetFalsePositiveRate).toBe('number')
      expect(typeof s.size).toBe('number')
      expect(typeof s.capacity).toBe('number')
      expect(typeof s.falsePositiveRate).toBe('number')
      expect(typeof s.fillRatio).toBe('number')
      expect(typeof s.counterBits).toBe('number')
      expect(typeof s.usedCounters).toBe('number')
      expect(typeof s.maxCounter).toBe('number')
    })

    it('should track fillRatio correctly', () => {
      const s = filter.stats()
      expect(s.fillRatio).toBe(0)
      filter.insert('test')
      const s2 = filter.stats()
      expect(s2.fillRatio).toBeGreaterThan(0)
    })

    it('should track maxCounter correctly', () => {
      for (let i = 0; i < 5; i++) {
        filter.insert('test')
      }
      const s = filter.stats()
      expect(s.maxCounter).toBeGreaterThanOrEqual(5)
    })

    it('should reset stats after clear', () => {
      filter.insert('test')
      filter.clear()
      const s = filter.stats()
      expect(s.usedCounters).toBe(0)
      expect(s.maxCounter).toBe(0)
      expect(s.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      filter.insert('')
      expect(filter.mayContain('')).toBe(true)
      expect(filter.count('')).toBe(1)
      expect(filter.remove('')).toBe(true)
      expect(filter.mayContain('')).toBe(false)
    })

    it('should handle single item', () => {
      const f = new CountingFilter<string>(1, 0.01)
      f.insert('only')
      expect(f.mayContain('only')).toBe(true)
      expect(f.size).toBe(1)
    })

    it('should handle many duplicates', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert('same')
      }
      expect(filter.size).toBe(100)
      expect(filter.mayContain('same')).toBe(true)
      expect(filter.count('same')).toBe(100)
    })

    it('should handle many different items', () => {
      for (let i = 0; i < 1000; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.size).toBe(1000)
      expect(filter.mayContain('item-0')).toBe(true)
      expect(filter.mayContain('item-999')).toBe(true)
    })

    it('should handle insert-remove-insert cycle', () => {
      filter.insert('test')
      filter.remove('test')
      filter.insert('test')
      expect(filter.mayContain('test')).toBe(true)
      expect(filter.count('test')).toBe(1)
      expect(filter.size).toBe(1)
    })

    it('should handle removing more times than inserted gracefully', () => {
      filter.insert('test')
      filter.remove('test')
      expect(filter.remove('test')).toBe(false)
      expect(filter.size).toBe(0)
    })

    it('should handle very small error rate', () => {
      const f = new CountingFilter<string>(100, 0.0001)
      f.insert('test')
      expect(f.mayContain('test')).toBe(true)
    })

    it('should handle high error rate', () => {
      const f = new CountingFilter<string>(100, 0.5)
      f.insert('test')
      expect(f.mayContain('test')).toBe(true)
    })

    it('should handle very long string key', () => {
      const longKey = 'x'.repeat(100000)
      filter.insert(longKey)
      expect(filter.mayContain(longKey)).toBe(true)
    })

    it('should handle clear followed by immediate operations', () => {
      filter.insert('before')
      filter.clear()
      filter.insert('after')
      expect(filter.mayContain('after')).toBe(true)
      expect(filter.mayContain('before')).toBe(false)
    })

    it('should handle has on item never added', () => {
      expect(filter.mayContain('never-added')).toBe(false)
    })

    it('should handle count on item never added', () => {
      expect(filter.count('never-added')).toBe(0)
    })
  })

  describe('false positive rate measurement', () => {
    it('should have a low observed false positive rate within capacity', () => {
      const f = new CountingFilter<string>(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.insert(`item-${i}`)
      }
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (f.mayContain(`not-added-${i}`)) {
          falsePositives++
        }
      }
      const observedRate = falsePositives / trials
      expect(observedRate).toBeLessThan(0.05)
    })

    it('should have zero false negatives', () => {
      const f = new CountingFilter<string>(100, 0.01)
      for (let i = 0; i < 100; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(f.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should have zero false negatives after removal', () => {
      const f = new CountingFilter<string>(100, 0.01)
      for (let i = 0; i < 100; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        f.remove(`item-${i}`)
      }
      for (let i = 50; i < 100; i++) {
        expect(f.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should have higher FP rate when over capacity', () => {
      const f = new CountingFilter<string>(10, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.insert(`item-${i}`)
      }
      const fp = f.falsePositiveRate()
      expect(fp).toBeGreaterThan(0.01)
    })

    it('should have 0 false positives for empty filter', () => {
      let falsePositives = 0
      for (let i = 0; i < 1000; i++) {
        if (filter.mayContain(`test-${i}`)) {
          falsePositives++
        }
      }
      expect(falsePositives).toBe(0)
    })

    it('should have lower FP after removal', () => {
      const f = new CountingFilter<string>(100, 0.01)
      for (let i = 0; i < 100; i++) {
        f.insert(`item-${i}`)
      }
      let fpBefore = 0
      const trials = 5000
      for (let i = 0; i < trials; i++) {
        if (f.mayContain(`not-added-${i}`)) fpBefore++
      }
      for (let i = 0; i < 50; i++) {
        f.remove(`item-${i}`)
      }
      let fpAfter = 0
      for (let i = 0; i < trials; i++) {
        if (f.mayContain(`not-added2-${i}`)) fpAfter++
      }
      expect(fpAfter).toBeLessThanOrEqual(fpBefore + 50)
    })
  })

  describe('counter overflow behavior', () => {
    it('should saturate at max value for 8-bit counters', () => {
      const f = new CountingFilter<string>({ expectedItems: 10, falsePositiveRate: 0.01, counterBits: 8 })
      for (let i = 0; i < 300; i++) {
        f.insert('test')
      }
      expect(f.count('test')).toBe(255)
    })

    it('should saturate at max value for 16-bit counters', () => {
      const f = new CountingFilter<string>({ expectedItems: 10, falsePositiveRate: 0.01, counterBits: 16 })
      for (let i = 0; i < 70000; i++) {
        f.insert('test')
      }
      expect(f.count('test')).toBe(65535)
    })

    it('should still report correct size even with overflow', () => {
      const f = new CountingFilter<string>({ expectedItems: 10, falsePositiveRate: 0.01, counterBits: 8 })
      for (let i = 0; i < 300; i++) {
        f.insert('test')
      }
      expect(f.size).toBe(300)
    })

    it('should handle remove after overflow', () => {
      const f = new CountingFilter<string>({ expectedItems: 10, falsePositiveRate: 0.01, counterBits: 8 })
      for (let i = 0; i < 300; i++) {
        f.insert('test')
      }
      f.remove('test')
      expect(f.mayContain('test')).toBe(true)
    })

    it('should clamp maxCounter in stats at 255 for 8-bit', () => {
      const f = new CountingFilter<string>({ expectedItems: 10, falsePositiveRate: 0.01, counterBits: 8 })
      for (let i = 0; i < 300; i++) {
        f.insert('test')
      }
      const s = f.stats()
      expect(s.maxCounter).toBeLessThanOrEqual(255)
    })

    it('should clamp maxCounter in stats at 65535 for 16-bit', () => {
      const f = new CountingFilter<string>({ expectedItems: 10, falsePositiveRate: 0.01, counterBits: 16 })
      for (let i = 0; i < 70000; i++) {
        f.insert('test')
      }
      const s = f.stats()
      expect(s.maxCounter).toBeLessThanOrEqual(65535)
    })
  })

  describe('large filters', () => {
    it('should handle 10000 items', () => {
      const f = new CountingFilter<string>(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.insert(`item-${i}`)
      }
      expect(f.size).toBe(10000)
      expect(f.mayContain('item-0')).toBe(true)
      expect(f.mayContain('item-9999')).toBe(true)
    })

    it('should handle 10000 items with no false negatives', () => {
      const f = new CountingFilter<string>(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 10000; i++) {
        expect(f.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should handle 10000 items with removals', () => {
      const f = new CountingFilter<string>(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 5000; i++) {
        f.remove(`item-${i}`)
      }
      for (let i = 5000; i < 10000; i++) {
        expect(f.mayContain(`item-${i}`)).toBe(true)
      }
      expect(f.size).toBe(5000)
    })

    it('should handle rapid insert and check cycles', () => {
      const f = new CountingFilter<string>(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.insert(`item-${i}`)
        expect(f.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should handle 10000+ items with 16-bit counters', () => {
      const f = new CountingFilter<string>({ expectedItems: 10000, falsePositiveRate: 0.01, counterBits: 16 })
      for (let i = 0; i < 10000; i++) {
        f.insert(`item-${i}`)
      }
      expect(f.size).toBe(10000)
      expect(f.stats().counterBits).toBe(16)
    })

    it('should handle cloning large filter', () => {
      const f = new CountingFilter<string>(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.insert(`item-${i}`)
      }
      const cloned = f.clone()
      expect(cloned.size).toBe(10000)
      expect(cloned.mayContain('item-0')).toBe(true)
      expect(cloned.mayContain('item-9999')).toBe(true)
    })

    it('should handle serialization of large filter', () => {
      const f = new CountingFilter<string>(10000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.insert(`item-${i}`)
      }
      const json = f.toJSON()
      const restored = CountingFilter.fromJSON<string>(json)
      expect(restored.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(restored.mayContain(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('generic type support', () => {
    it('should work with number items', () => {
      const f = new CountingFilter<number>()
      f.insert(42)
      f.insert(100)
      expect(f.mayContain(42)).toBe(true)
      expect(f.mayContain(100)).toBe(true)
      expect(f.mayContain(999)).toBe(false)
    })

    it('should work with object items', () => {
      const f = new CountingFilter<{ id: number }>()
      const obj = { id: 1 }
      f.insert(obj)
      expect(f.mayContain(obj)).toBe(true)
    })

    it('should work with array items', () => {
      const f = new CountingFilter<number[]>()
      const arr = [1, 2, 3]
      f.insert(arr)
      expect(f.mayContain(arr)).toBe(true)
    })

    it('should work with boolean items', () => {
      const f = new CountingFilter<boolean>()
      f.insert(true)
      f.insert(false)
      expect(f.mayContain(true)).toBe(true)
      expect(f.mayContain(false)).toBe(true)
    })

    it('should work with null items', () => {
      const f = new CountingFilter<null>()
      f.insert(null)
      expect(f.mayContain(null)).toBe(true)
    })

    it('should count correctly with generic types', () => {
      const f = new CountingFilter<number>()
      f.insert(42)
      f.insert(42)
      expect(f.count(42)).toBe(2)
    })

    it('should remove correctly with generic types', () => {
      const f = new CountingFilter<number>()
      f.insert(42)
      expect(f.remove(42)).toBe(true)
      expect(f.mayContain(42)).toBe(false)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_COUNTING_FILTER_OPTIONS', () => {
      expect(DEFAULT_COUNTING_FILTER_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_COUNTING_FILTER_OPTIONS.falsePositiveRate).toBe(0.01)
      expect(DEFAULT_COUNTING_FILTER_OPTIONS.counterBits).toBe(8)
    })

    it('should support CountingFilterOptions interface', () => {
      const opts: CountingFilterOptions = {
        expectedItems: 500,
        falsePositiveRate: 0.05,
        counterBits: 16,
      }
      expect(opts.expectedItems).toBe(500)
      expect(opts.falsePositiveRate).toBe(0.05)
      expect(opts.counterBits).toBe(16)
    })

    it('should support CountingFilterJSON interface', () => {
      const json: CountingFilterJSON = {
        counters: [0, 1, 2],
        counterCount: 3,
        hashCount: 7,
        expectedItems: 1000,
        targetFalsePositiveRate: 0.01,
        itemCount: 5,
        counterBits: 8,
      }
      expect(json.counterCount).toBe(3)
      expect(json.hashCount).toBe(7)
    })

    it('should support CountingFilterStats interface', () => {
      const s: CountingFilterStats = {
        counterCount: 100,
        hashCount: 7,
        expectedItems: 1000,
        targetFalsePositiveRate: 0.01,
        size: 50,
        capacity: 1000,
        falsePositiveRate: 0.005,
        fillRatio: 0.3,
        counterBits: 8,
        usedCounters: 30,
        maxCounter: 5,
      }
      expect(s.counterCount).toBe(100)
      expect(s.fillRatio).toBe(0.3)
    })
  })
})
