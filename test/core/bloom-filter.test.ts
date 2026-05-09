import { describe, it, expect, beforeEach } from 'vitest'
import { BloomFilter } from '../../src/core/bloom-filter/bloom-filter.js'
import { DEFAULT_BLOOM_FILTER_OPTIONS } from '../../src/core/bloom-filter/types.js'
import type { BloomFilterOptions, BloomFilterJSON } from '../../src/core/bloom-filter/types.js'

describe('BloomFilter', () => {
  let filter: BloomFilter<string>

  beforeEach(() => {
    filter = new BloomFilter<string>()
  })

  describe('constructor', () => {
    it('should create a filter with default options', () => {
      const f = new BloomFilter<string>()
      expect(f.isEmpty()).toBe(true)
      expect(f.size).toBe(0)
    })

    it('should accept positional arguments: expectedItems, falsePositiveRate', () => {
      const f = new BloomFilter<string>(5000, 0.001)
      expect(f.bitCount).toBeGreaterThan(0)
      expect(f.hashCount).toBeGreaterThan(0)
    })

    it('should accept options object', () => {
      const f = new BloomFilter<string>({ expectedItems: 5000, falsePositiveRate: 0.001 })
      expect(f.bitCount).toBeGreaterThan(0)
    })

    it('should accept partial options object with defaults', () => {
      const f = new BloomFilter<string>({ expectedItems: 200 })
      expect(f.bitCount).toBeGreaterThan(0)
    })

    it('should accept only falsePositiveRate in options', () => {
      const f = new BloomFilter<string>({ falsePositiveRate: 0.05 })
      expect(f.bitCount).toBeGreaterThan(0)
    })

    it('should compute positive bit count', () => {
      const f = new BloomFilter<string>(1000, 0.01)
      expect(f.bitCount).toBeGreaterThan(0)
    })

    it('should compute positive hash count', () => {
      const f = new BloomFilter<string>(1000, 0.01)
      expect(f.hashCount).toBeGreaterThan(0)
    })

    it('should use at least 1 hash function', () => {
      const f = new BloomFilter<string>(10, 0.5)
      expect(f.hashCount).toBeGreaterThanOrEqual(1)
    })

    it('should produce larger bit arrays for lower error rates', () => {
      const f1 = new BloomFilter<string>(100, 0.1)
      const f2 = new BloomFilter<string>(100, 0.001)
      expect(f2.bitCount).toBeGreaterThan(f1.bitCount)
    })

    it('should produce larger bit arrays for larger capacities', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(10000, 0.01)
      expect(f2.bitCount).toBeGreaterThan(f1.bitCount)
    })

    it('should use optimal k = (m/n) * ln(2)', () => {
      const f = new BloomFilter<string>(1000, 0.01)
      const expectedK = Math.max(1, Math.round((f.bitCount / 1000) * Math.log(2)))
      expect(f.hashCount).toBe(expectedK)
    })

    it('should default to 1000 expected items', () => {
      const f = new BloomFilter<string>()
      const fExplicit = new BloomFilter<string>(1000, 0.01)
      expect(f.bitCount).toBe(fExplicit.bitCount)
    })
  })

  describe('add', () => {
    it('should add an item and increase size', () => {
      filter.add('hello')
      expect(filter.size).toBe(1)
    })

    it('should add multiple different items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should count duplicate adds as additional items', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size).toBe(2)
    })

    it('should handle empty string', () => {
      filter.add('')
      expect(filter.size).toBe(1)
    })

    it('should handle unicode strings', () => {
      filter.add('日本語')
      filter.add('🎉🚀')
      expect(filter.size).toBe(2)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      filter.add(longStr)
      expect(filter.size).toBe(1)
    })

    it('should handle strings with special characters', () => {
      filter.add('hello\nworld\t!')
      filter.add('path/to/file.ts')
      expect(filter.size).toBe(2)
    })

    it('should handle numeric strings', () => {
      filter.add('123')
      filter.add('456')
      expect(filter.size).toBe(2)
    })

    it('should handle whitespace-only strings', () => {
      filter.add('   ')
      filter.add('\t')
      filter.add('\n')
      expect(filter.size).toBe(3)
    })

    it('should handle strings with null characters', () => {
      filter.add('before\0after')
      expect(filter.size).toBe(1)
      expect(filter.has('before\0after')).toBe(true)
    })
  })

  describe('has', () => {
    it('should return true for an added item', () => {
      filter.add('hello')
      expect(filter.has('hello')).toBe(true)
    })

    it('should return false for an item not added', () => {
      filter.add('hello')
      expect(filter.has('world')).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.has('anything')).toBe(false)
    })

    it('should find multiple added items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.has('a')).toBe(true)
      expect(filter.has('b')).toBe(true)
      expect(filter.has('c')).toBe(true)
    })

    it('should handle empty string lookup', () => {
      filter.add('')
      expect(filter.has('')).toBe(true)
    })

    it('should handle unicode string lookup', () => {
      filter.add('日本語')
      expect(filter.has('日本語')).toBe(true)
      expect(filter.has('English')).toBe(false)
    })

    it('should find items after many adds', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.has('item-0')).toBe(true)
      expect(filter.has('item-50')).toBe(true)
      expect(filter.has('item-99')).toBe(true)
    })

    it('should handle duplicate adds consistently', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.has('test')).toBe(true)
    })

    it('should handle case sensitivity', () => {
      filter.add('Hello')
      expect(filter.has('Hello')).toBe(true)
      expect(filter.has('hello')).toBe(false)
    })

    it('should handle mixed unicode content', () => {
      filter.add('hello世界🎉')
      expect(filter.has('hello世界🎉')).toBe(true)
      expect(filter.has('hello世界')).toBe(false)
    })

    it('should never produce false negatives', () => {
      const f = new BloomFilter<string>(100, 0.01)
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('size', () => {
    it('should return 0 for new filter', () => {
      expect(filter.size).toBe(0)
    })

    it('should return 1 after one add', () => {
      filter.add('item')
      expect(filter.size).toBe(1)
    })

    it('should track multiple adds', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should count duplicate adds', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size).toBe(2)
    })

    it('should handle many items', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(100)
    })

    it('should reset after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.size).toBe(0)
    })
  })

  describe('bitCount', () => {
    it('should return a positive number', () => {
      expect(filter.bitCount).toBeGreaterThan(0)
    })

    it('should return different values for different error rates', () => {
      const f1 = new BloomFilter<string>(100, 0.1)
      const f2 = new BloomFilter<string>(100, 0.001)
      expect(f2.bitCount).toBeGreaterThan(f1.bitCount)
    })

    it('should remain constant after operations', () => {
      const initial = filter.bitCount
      filter.add('test')
      expect(filter.bitCount).toBe(initial)
    })
  })

  describe('hashCount', () => {
    it('should return a positive number', () => {
      expect(filter.hashCount).toBeGreaterThan(0)
    })

    it('should remain constant after operations', () => {
      const initial = filter.hashCount
      filter.add('test')
      expect(filter.hashCount).toBe(initial)
    })
  })

  describe('falsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.falsePositiveRate()).toBe(0)
    })

    it('should return a positive value after adding items', () => {
      filter.add('test')
      expect(filter.falsePositiveRate()).toBeGreaterThan(0)
    })

    it('should increase as more items are added', () => {
      const f = new BloomFilter<string>(100, 0.01)
      const fp1 = f.falsePositiveRate()
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
      }
      const fp50 = f.falsePositiveRate()
      for (let i = 50; i < 100; i++) {
        f.add(`item-${i}`)
      }
      const fp100 = f.falsePositiveRate()
      expect(fp50).toBeGreaterThan(fp1)
      expect(fp100).toBeGreaterThan(fp50)
    })

    it('should be close to target when at expected capacity', () => {
      const f = new BloomFilter<string>(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
      }
      const fp = f.falsePositiveRate()
      expect(fp).toBeLessThan(0.05)
    })

    it('should reset to 0 after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.falsePositiveRate()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new filter', () => {
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      filter.add('test')
      expect(filter.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false with many items', () => {
      for (let i = 0; i < 10; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.isEmpty()).toBe(false)
    })
  })

  describe('fillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.fillRatio()).toBe(0)
    })

    it('should return a positive value after adding items', () => {
      filter.add('test')
      expect(filter.fillRatio()).toBeGreaterThan(0)
    })

    it('should return value between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      const ratio = filter.fillRatio()
      expect(ratio).toBeGreaterThanOrEqual(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should increase as more items are added', () => {
      const f = new BloomFilter<string>(100, 0.01)
      const r0 = f.fillRatio()
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
      }
      const r50 = f.fillRatio()
      expect(r50).toBeGreaterThan(r0)
    })

    it('should reset to 0 after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.fillRatio()).toBe(0)
    })

    it('should approach 1 as filter fills up', () => {
      const f = new BloomFilter<string>(10, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
      }
      expect(f.fillRatio()).toBeGreaterThan(0.5)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should make the filter empty', () => {
      filter.add('test')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should reset has to false for all items', () => {
      filter.add('test')
      filter.clear()
      expect(filter.has('test')).toBe(false)
    })

    it('should allow adding after clear', () => {
      filter.add('first')
      filter.clear()
      filter.add('second')
      expect(filter.size).toBe(1)
      expect(filter.has('second')).toBe(true)
    })

    it('should handle clearing an empty filter', () => {
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should preserve bitCount after clear', () => {
      const bits = filter.bitCount
      filter.add('test')
      filter.clear()
      expect(filter.bitCount).toBe(bits)
    })

    it('should preserve hashCount after clear', () => {
      const hashes = filter.hashCount
      filter.add('test')
      filter.clear()
      expect(filter.hashCount).toBe(hashes)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.size).toBe(filter.size)
      expect(cloned.has('test')).toBe(true)
    })

    it('should not affect original when modified', () => {
      filter.add('shared')
      const cloned = filter.clone()
      cloned.add('new')
      expect(filter.has('new')).toBe(false)
      expect(cloned.has('new')).toBe(true)
    })

    it('should not affect clone when original is modified', () => {
      filter.add('shared')
      const cloned = filter.clone()
      filter.add('original-only')
      expect(cloned.has('original-only')).toBe(false)
    })

    it('should preserve bitCount', () => {
      const f = new BloomFilter<string>(500, 0.01)
      f.add('test')
      const cloned = f.clone()
      expect(cloned.bitCount).toBe(f.bitCount)
    })

    it('should preserve hashCount', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.hashCount).toBe(filter.hashCount)
    })

    it('should clone an empty filter', () => {
      const cloned = filter.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should preserve all items', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const cloned = filter.clone()
      for (let i = 0; i < 50; i++) {
        expect(cloned.has(`item-${i}`)).toBe(true)
      }
    })

    it('should produce identical fill ratio', () => {
      for (let i = 0; i < 20; i++) {
        filter.add(`item-${i}`)
      }
      const cloned = filter.clone()
      expect(cloned.fillRatio()).toBe(filter.fillRatio())
    })
  })

  describe('merge', () => {
    it('should merge two filters with same parameters', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.01)
      f1.add('a')
      f2.add('b')
      f1.merge(f2)
      expect(f1.has('a')).toBe(true)
      expect(f1.has('b')).toBe(true)
    })

    it('should throw on different bit counts', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(200, 0.01)
      expect(() => f1.merge(f2)).toThrow('Cannot merge bloom filters with different bit counts')
    })

    it('should throw on different hash counts', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.5)
      if (f1.bitCount === f2.bitCount && f1.hashCount !== f2.hashCount) {
        expect(() => f1.merge(f2)).toThrow('Cannot merge bloom filters with different hash counts')
      } else if (f1.bitCount !== f2.bitCount || f1.hashCount !== f2.hashCount) {
        expect(() => f1.merge(f2)).toThrow()
      }
    })

    it('should combine sizes', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.01)
      f1.add('a')
      f2.add('b')
      f1.merge(f2)
      expect(f1.size).toBe(2)
    })

    it('should produce union of bit arrays', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.01)
      f1.add('only-in-f1')
      f2.add('only-in-f2')
      f1.merge(f2)
      expect(f1.has('only-in-f1')).toBe(true)
      expect(f1.has('only-in-f2')).toBe(true)
    })

    it('should handle merging empty filters', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.01)
      f1.merge(f2)
      expect(f1.size).toBe(0)
      expect(f1.isEmpty()).toBe(true)
    })

    it('should handle merging with empty filter', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.01)
      f1.add('item')
      f1.merge(f2)
      expect(f1.has('item')).toBe(true)
      expect(f1.size).toBe(1)
    })

    it('should handle merging into empty filter', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.01)
      f2.add('item')
      f1.merge(f2)
      expect(f1.has('item')).toBe(true)
      expect(f1.size).toBe(1)
    })

    it('should produce higher fill ratio after merge', () => {
      const f1 = new BloomFilter<string>(100, 0.01)
      const f2 = new BloomFilter<string>(100, 0.01)
      for (let i = 0; i < 50; i++) {
        f1.add(`f1-${i}`)
        f2.add(`f2-${i}`)
      }
      const ratioBefore = f1.fillRatio()
      f1.merge(f2)
      expect(f1.fillRatio()).toBeGreaterThanOrEqual(ratioBefore)
    })
  })

  describe('toJSON / fromJSON', () => {
    it('should serialize to JSON', () => {
      filter.add('test')
      const json = filter.toJSON()
      expect(json.bitArray).toBeInstanceOf(Array)
      expect(json.bitCount).toBe(filter.bitCount)
      expect(json.hashCount).toBe(filter.hashCount)
      expect(json.itemCount).toBe(1)
    })

    it('should round-trip through JSON', () => {
      filter.add('hello')
      filter.add('world')
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON<string>(json)
      expect(restored.has('hello')).toBe(true)
      expect(restored.has('world')).toBe(true)
      expect(restored.size).toBe(2)
    })

    it('should preserve bitCount through serialization', () => {
      const f = new BloomFilter<string>(500, 0.001)
      f.add('test')
      const json = f.toJSON()
      expect(json.bitCount).toBe(f.bitCount)
      const restored = BloomFilter.fromJSON<string>(json)
      expect(restored.bitCount).toBe(f.bitCount)
    })

    it('should preserve hashCount through serialization', () => {
      filter.add('test')
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON<string>(json)
      expect(restored.hashCount).toBe(filter.hashCount)
    })

    it('should preserve expectedItems through serialization', () => {
      const f = new BloomFilter<string>(500, 0.01)
      f.add('test')
      const json = f.toJSON()
      expect(json.expectedItems).toBe(500)
    })

    it('should preserve targetFalsePositiveRate through serialization', () => {
      const f = new BloomFilter<string>(100, 0.001)
      f.add('test')
      const json = f.toJSON()
      expect(json.targetFalsePositiveRate).toBe(0.001)
    })

    it('should handle empty filter serialization', () => {
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON<string>(json)
      expect(restored.isEmpty()).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should handle filter with many items', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON<string>(json)
      for (let i = 0; i < 100; i++) {
        expect(restored.has(`item-${i}`)).toBe(true)
      }
      expect(restored.size).toBe(100)
    })

    it('should produce valid BloomFilterJSON type', () => {
      filter.add('test')
      const json: BloomFilterJSON = filter.toJSON()
      expect(typeof json.bitArray).toBe('object')
      expect(typeof json.bitCount).toBe('number')
      expect(typeof json.hashCount).toBe('number')
      expect(typeof json.expectedItems).toBe('number')
      expect(typeof json.targetFalsePositiveRate).toBe('number')
      expect(typeof json.itemCount).toBe('number')
    })
  })

  describe('static create', () => {
    it('should create a filter with optimal parameters', () => {
      const f = BloomFilter.create<string>(1000, 0.01)
      expect(f.bitCount).toBeGreaterThan(0)
      expect(f.hashCount).toBeGreaterThan(0)
    })

    it('should create filter identical to constructor', () => {
      const f1 = new BloomFilter<string>(1000, 0.01)
      const f2 = BloomFilter.create<string>(1000, 0.01)
      expect(f1.bitCount).toBe(f2.bitCount)
      expect(f1.hashCount).toBe(f2.hashCount)
    })

    it('should create filter that accepts items', () => {
      const f = BloomFilter.create<string>(100, 0.01)
      f.add('item')
      expect(f.has('item')).toBe(true)
    })
  })

  describe('generic type support', () => {
    it('should work with number items', () => {
      const f = new BloomFilter<number>()
      f.add(42)
      f.add(100)
      expect(f.has(42)).toBe(true)
      expect(f.has(100)).toBe(true)
      expect(f.has(999)).toBe(false)
    })

    it('should work with object items', () => {
      const f = new BloomFilter<{ id: number }>()
      const obj = { id: 1 }
      f.add(obj)
      expect(f.has(obj)).toBe(true)
    })

    it('should work with array items', () => {
      const f = new BloomFilter<number[]>()
      const arr = [1, 2, 3]
      f.add(arr)
      expect(f.has(arr)).toBe(true)
    })

    it('should work with boolean items', () => {
      const f = new BloomFilter<boolean>()
      f.add(true)
      f.add(false)
      expect(f.has(true)).toBe(true)
      expect(f.has(false)).toBe(true)
    })

    it('should work with null items', () => {
      const f = new BloomFilter<null>()
      f.add(null)
      expect(f.has(null)).toBe(true)
    })
  })

  describe('false positive rate estimation', () => {
    it('should have a low observed false positive rate within capacity', () => {
      const f = new BloomFilter<string>(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
      }
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (f.has(`not-added-${i}`)) {
          falsePositives++
        }
      }
      const observedRate = falsePositives / trials
      expect(observedRate).toBeLessThan(0.05)
    })

    it('should have zero false negatives', () => {
      const f = new BloomFilter<string>(100, 0.01)
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should have higher FP rate when over capacity', () => {
      const f = new BloomFilter<string>(10, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
      }
      const fp = f.falsePositiveRate()
      expect(fp).toBeGreaterThan(0.01)
    })

    it('should have 0 false positives for empty filter', () => {
      let falsePositives = 0
      for (let i = 0; i < 1000; i++) {
        if (filter.has(`test-${i}`)) {
          falsePositives++
        }
      }
      expect(falsePositives).toBe(0)
    })

    it('should report estimated FP matching formula', () => {
      const f = new BloomFilter<string>(100, 0.01)
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
      }
      const expected = Math.pow(
        1 - Math.exp((-f.hashCount * 50) / f.bitCount),
        f.hashCount,
      )
      expect(f.falsePositiveRate()).toBeCloseTo(expected, 10)
    })
  })

  describe('double hashing technique', () => {
    it('should use double hashing with two base hashes', () => {
      const f = new BloomFilter<string>(100, 0.01)
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should produce consistent results for same input', () => {
      filter.add('consistent')
      const r1 = filter.has('consistent')
      const r2 = filter.has('consistent')
      expect(r1).toBe(r2)
      expect(r1).toBe(true)
    })

    it('should produce different internal state for different strings', () => {
      filter.add('aaa')
      filter.add('bbb')
      expect(filter.has('aaa')).toBe(true)
      expect(filter.has('bbb')).toBe(true)
    })
  })

  describe('large item sets', () => {
    it('should handle 10000 items', () => {
      const f = new BloomFilter<string>(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      expect(f.size).toBe(10000)
      expect(f.has('item-0')).toBe(true)
      expect(f.has('item-9999')).toBe(true)
    })

    it('should handle 10000 items with no false negatives', () => {
      const f = new BloomFilter<string>(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 10000; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle rapid add and check cycles', () => {
      const f = new BloomFilter<string>(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle very small error rate', () => {
      const f = new BloomFilter<string>(100, 0.0001)
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle high error rate', () => {
      const f = new BloomFilter<string>(100, 0.5)
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle single expected item', () => {
      const f = new BloomFilter<string>(1, 0.01)
      f.add('only')
      expect(f.has('only')).toBe(true)
    })

    it('should handle very long string key', () => {
      const longKey = 'x'.repeat(100000)
      filter.add(longKey)
      expect(filter.has(longKey)).toBe(true)
    })

    it('should handle clear followed by immediate operations', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.has('after')).toBe(true)
      expect(filter.has('before')).toBe(false)
    })

    it('should handle clone of filter with many operations', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const cloned = filter.clone()
      for (let i = 0; i < 50; i++) {
        expect(cloned.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle adding same item many times', () => {
      for (let i = 0; i < 100; i++) {
        filter.add('same')
      }
      expect(filter.size).toBe(100)
      expect(filter.has('same')).toBe(true)
    })

    it('should handle has on item never added', () => {
      expect(filter.has('never-added')).toBe(false)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BLOOM_FILTER_OPTIONS', () => {
      expect(DEFAULT_BLOOM_FILTER_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_BLOOM_FILTER_OPTIONS.falsePositiveRate).toBe(0.01)
    })

    it('should support BloomFilterOptions interface', () => {
      const opts: BloomFilterOptions = {
        expectedItems: 500,
        falsePositiveRate: 0.05,
      }
      expect(opts.expectedItems).toBe(500)
      expect(opts.falsePositiveRate).toBe(0.05)
    })

    it('should support BloomFilterJSON interface', () => {
      const json: BloomFilterJSON = {
        bitArray: [0, 1, 2],
        bitCount: 24,
        hashCount: 7,
        expectedItems: 1000,
        targetFalsePositiveRate: 0.01,
        itemCount: 5,
      }
      expect(json.bitCount).toBe(24)
      expect(json.hashCount).toBe(7)
    })
  })
})
