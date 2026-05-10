import { describe, it, expect, beforeEach } from 'vitest'
import { StringBloomFilter } from '../../src/core/string-bloom/string-bloom.js'
import { DEFAULT_STRING_BLOOM_OPTIONS } from '../../src/core/string-bloom/types.js'
import type { StringBloomFilterOptions } from '../../src/core/string-bloom/types.js'

describe('StringBloomFilter', () => {
  let filter: StringBloomFilter

  beforeEach(() => {
    filter = new StringBloomFilter()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const f = new StringBloomFilter()
      expect(f.isEmpty).toBe(true)
      expect(f.count).toBe(0)
    })

    it('should accept expectedItems number', () => {
      const f = new StringBloomFilter(5000)
      expect(f.capacity()).toBe(5000)
    })

    it('should accept expectedItems and falsePositiveRate', () => {
      const f = new StringBloomFilter(500, 0.001)
      expect(f.capacity()).toBe(500)
    })

    it('should accept options object', () => {
      const f = new StringBloomFilter({ expectedItems: 200, falsePositiveRate: 0.05 })
      expect(f.capacity()).toBe(200)
    })

    it('should accept partial options with defaults', () => {
      const f = new StringBloomFilter({ expectedItems: 100 })
      expect(f.capacity()).toBe(100)
    })

    it('should accept only falsePositiveRate in options', () => {
      const f = new StringBloomFilter({ falsePositiveRate: 0.001 })
      expect(f.capacity()).toBe(DEFAULT_STRING_BLOOM_OPTIONS.expectedItems)
    })

    it('should use defaults when no args', () => {
      const f = new StringBloomFilter()
      expect(f.capacity()).toBe(DEFAULT_STRING_BLOOM_OPTIONS.expectedItems)
    })

    it('should compute positive bit count', () => {
      const f = new StringBloomFilter(1000, 0.01)
      const stats = f.getStatistics()
      expect(stats.bitCount).toBeGreaterThan(0)
    })

    it('should compute positive hash count', () => {
      const f = new StringBloomFilter(1000, 0.01)
      const stats = f.getStatistics()
      expect(stats.hashCount).toBeGreaterThan(0)
    })

    it('should use at least 1 hash function', () => {
      const f = new StringBloomFilter(10, 0.5)
      const stats = f.getStatistics()
      expect(stats.hashCount).toBeGreaterThanOrEqual(1)
    })

    it('should produce larger bit arrays for lower error rates', () => {
      const f1 = new StringBloomFilter(100, 0.1)
      const f2 = new StringBloomFilter(100, 0.001)
      expect(f2.getStatistics().bitCount).toBeGreaterThan(f1.getStatistics().bitCount)
    })

    it('should produce larger bit arrays for larger capacities', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(10000, 0.01)
      expect(f2.getStatistics().bitCount).toBeGreaterThan(f1.getStatistics().bitCount)
    })

    it('should handle undefined as first argument', () => {
      const f = new StringBloomFilter(undefined)
      expect(f.capacity()).toBe(DEFAULT_STRING_BLOOM_OPTIONS.expectedItems)
    })
  })

  describe('static create', () => {
    it('should create a filter with expectedItems and falsePositiveRate', () => {
      const f = StringBloomFilter.create(1000, 0.01)
      expect(f.capacity()).toBe(1000)
      expect(f.isEmpty).toBe(true)
    })

    it('should produce equivalent filter to constructor', () => {
      const f1 = new StringBloomFilter(500, 0.05)
      const f2 = StringBloomFilter.create(500, 0.05)
      expect(f1.capacity()).toBe(f2.capacity())
      expect(f1.getStatistics().bitCount).toBe(f2.getStatistics().bitCount)
      expect(f1.getStatistics().hashCount).toBe(f2.getStatistics().hashCount)
    })
  })

  describe('add', () => {
    it('should add a string', () => {
      filter.add('hello')
      expect(filter.count).toBe(1)
    })

    it('should add multiple different strings', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.count).toBe(3)
    })

    it('should add the same string multiple times', () => {
      filter.add('hello')
      filter.add('hello')
      filter.add('hello')
      expect(filter.count).toBe(3)
    })

    it('should handle empty string', () => {
      filter.add('')
      expect(filter.count).toBe(1)
      expect(filter.has('')).toBe(true)
    })

    it('should handle unicode strings', () => {
      filter.add('héllo wörld')
      expect(filter.has('héllo wörld')).toBe(true)
    })

    it('should handle emoji strings', () => {
      filter.add('🎉🎊🎈')
      expect(filter.has('🎉🎊🎈')).toBe(true)
    })

    it('should handle CJK characters', () => {
      filter.add('你好世界')
      expect(filter.has('你好世界')).toBe(true)
    })

    it('should handle special characters', () => {
      filter.add('!@#$%^&*()')
      expect(filter.has('!@#$%^&*()')).toBe(true)
    })

    it('should handle newlines and tabs', () => {
      filter.add('line1\nline2\ttab')
      expect(filter.has('line1\nline2\ttab')).toBe(true)
    })

    it('should handle very long strings', () => {
      const long = 'a'.repeat(10000)
      filter.add(long)
      expect(filter.has(long)).toBe(true)
    })

    it('should increment count after each add', () => {
      expect(filter.count).toBe(0)
      filter.add('x')
      expect(filter.count).toBe(1)
      filter.add('y')
      expect(filter.count).toBe(2)
    })
  })

  describe('has', () => {
    it('should return true for added strings', () => {
      filter.add('hello')
      expect(filter.has('hello')).toBe(true)
    })

    it('should return false for non-added strings', () => {
      filter.add('hello')
      expect(filter.has('world')).toBe(false)
    })

    it('should never return false negatives', () => {
      const words = ['apple', 'banana', 'cherry', 'date', 'elderberry']
      for (const w of words) {
        filter.add(w)
      }
      for (const w of words) {
        expect(filter.has(w)).toBe(true)
      }
    })

    it('should return false for empty filter', () => {
      expect(filter.has('anything')).toBe(false)
    })

    it('should handle empty string lookup', () => {
      expect(filter.has('')).toBe(false)
      filter.add('')
      expect(filter.has('')).toBe(true)
    })

    it('should distinguish similar strings', () => {
      filter.add('abc')
      expect(filter.has('abc')).toBe(true)
      expect(filter.has('abd')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      filter.add('Hello')
      expect(filter.has('Hello')).toBe(true)
      expect(filter.has('hello')).toBe(false)
    })

    it('should handle strings with spaces', () => {
      filter.add('hello world')
      expect(filter.has('hello world')).toBe(true)
      expect(filter.has('helloworld')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove an added string', () => {
      filter.add('hello')
      expect(filter.remove('hello')).toBe(true)
      expect(filter.count).toBe(0)
    })

    it('should return false for non-existent string', () => {
      expect(filter.remove('nonexistent')).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.remove('anything')).toBe(false)
    })

    it('should decrement count on remove', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.count).toBe(2)
      filter.remove('a')
      expect(filter.count).toBe(1)
    })

    it('should handle removing same item added multiple times', () => {
      filter.add('hello')
      filter.add('hello')
      expect(filter.count).toBe(2)
      filter.remove('hello')
      expect(filter.count).toBe(1)
      expect(filter.has('hello')).toBe(true)
    })

    it('should handle removing all copies', () => {
      filter.add('hello')
      filter.add('hello')
      filter.remove('hello')
      filter.remove('hello')
      expect(filter.count).toBe(0)
      expect(filter.has('hello')).toBe(false)
    })

    it('should not affect other strings', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.has('b')).toBe(true)
    })

    it('should handle removing empty string', () => {
      filter.add('')
      expect(filter.remove('')).toBe(true)
      expect(filter.has('')).toBe(false)
    })

    it('should return false when removing unicode string not in filter', () => {
      expect(filter.remove('你好')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear the filter', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.clear()
      expect(filter.count).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('should make all has queries return false after clear', () => {
      filter.add('hello')
      filter.add('world')
      filter.clear()
      expect(filter.has('hello')).toBe(false)
      expect(filter.has('world')).toBe(false)
    })

    it('should be usable after clear', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.has('after')).toBe(true)
      expect(filter.has('before')).toBe(false)
    })

    it('should reset fill ratio to 0', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.fillRatio()).toBe(0)
    })

    it('should handle clearing empty filter', () => {
      filter.clear()
      expect(filter.count).toBe(0)
    })
  })

  describe('estimatedSize', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.estimatedSize()).toBe(0)
    })

    it('should return count of added items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.estimatedSize()).toBe(3)
    })

    it('should account for removes', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.estimatedSize()).toBe(1)
    })
  })

  describe('expectedFalsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should increase as more items are added', () => {
      const f = new StringBloomFilter(100, 0.01)
      const rate0 = f.expectedFalsePositiveRate()
      for (let i = 0; i < 50; i++) {
        f.add(`item${i}`)
      }
      const rate50 = f.expectedFalsePositiveRate()
      for (let i = 50; i < 100; i++) {
        f.add(`item${i}`)
      }
      const rate100 = f.expectedFalsePositiveRate()
      expect(rate50).toBeGreaterThan(rate0)
      expect(rate100).toBeGreaterThan(rate50)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item${i}`)
      }
      const rate = filter.expectedFalsePositiveRate()
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })
  })

  describe('fillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.fillRatio()).toBe(0)
    })

    it('should increase as items are added', () => {
      const ratio0 = filter.fillRatio()
      filter.add('a')
      const ratio1 = filter.fillRatio()
      expect(ratio1).toBeGreaterThan(ratio0)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item${i}`)
      }
      const ratio = filter.fillRatio()
      expect(ratio).toBeGreaterThanOrEqual(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should approach 1 for saturated filter', () => {
      const f = new StringBloomFilter(10, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.add(`item${i}`)
      }
      expect(f.fillRatio()).toBeGreaterThan(0.9)
    })

    it('should decrease after remove', () => {
      const f = new StringBloomFilter(10, 0.01)
      f.add('a')
      const ratio1 = f.fillRatio()
      f.remove('a')
      const ratio2 = f.fillRatio()
      expect(ratio2).toBeLessThanOrEqual(ratio1)
    })
  })

  describe('capacity', () => {
    it('should return expectedItems', () => {
      const f = new StringBloomFilter(5000)
      expect(f.capacity()).toBe(5000)
    })

    it('should return default when not specified', () => {
      const f = new StringBloomFilter()
      expect(f.capacity()).toBe(DEFAULT_STRING_BLOOM_OPTIONS.expectedItems)
    })
  })

  describe('count', () => {
    it('should be a getter returning item count', () => {
      expect(filter.count).toBe(0)
      filter.add('a')
      expect(filter.count).toBe(1)
    })

    it('should be readonly property', () => {
      filter.add('a')
      const c = filter.count
      expect(c).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new filter', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('should be false after adding items', () => {
      filter.add('a')
      expect(filter.isEmpty).toBe(false)
    })

    it('should be true after clearing', () => {
      filter.add('a')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })

    it('should be false when items remain after remove', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.isEmpty).toBe(false)
    })

    it('should be true when all items removed', () => {
      filter.add('a')
      filter.remove('a')
      expect(filter.isEmpty).toBe(true)
    })
  })

  describe('union', () => {
    it('should produce a new filter with combined counters', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      f1.add('a')
      f2.add('b')
      const union = f1.union(f2)
      expect(union.has('a')).toBe(true)
      expect(union.has('b')).toBe(true)
    })

    it('should not modify original filters', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      f1.add('a')
      f2.add('b')
      f1.union(f2)
      expect(f1.has('b')).toBe(false)
      expect(f2.has('a')).toBe(false)
    })

    it('should throw on different bit counts', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(200, 0.01)
      expect(() => f1.union(f2)).toThrow('different bit counts')
    })

    it('should throw on different hash counts', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.5)
      expect(() => f1.union(f2)).toThrow()
    })

    it('should take max of each counter', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      f1.add('x')
      f1.add('x')
      f2.add('x')
      const union = f1.union(f2)
      expect(union.has('x')).toBe(true)
    })

    it('should produce correct count as sum', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      f1.add('a')
      f1.add('b')
      f2.add('c')
      f2.add('d')
      const union = f1.union(f2)
      expect(union.count).toBe(4)
    })

    it('should work with empty filters', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      const union = f1.union(f2)
      expect(union.isEmpty).toBe(true)
    })
  })

  describe('intersection', () => {
    it('should produce a filter with min counters', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      f1.add('a')
      f1.add('b')
      f2.add('a')
      f2.add('c')
      const inter = f1.intersection(f2)
      expect(inter.has('a')).toBe(true)
    })

    it('should not modify original filters', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      f1.add('a')
      f2.add('b')
      f1.intersection(f2)
      expect(f1.has('a')).toBe(true)
      expect(f2.has('b')).toBe(true)
    })

    it('should throw on different bit counts', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(200, 0.01)
      expect(() => f1.intersection(f2)).toThrow('different bit counts')
    })

    it('should throw on different hash counts', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.5)
      expect(() => f1.intersection(f2)).toThrow()
    })

    it('should take min of counts', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      f1.add('a')
      f1.add('b')
      f2.add('c')
      f2.add('d')
      const inter = f1.intersection(f2)
      expect(inter.count).toBe(2)
    })

    it('should work with empty filters', () => {
      const f1 = new StringBloomFilter(100, 0.01)
      const f2 = new StringBloomFilter(100, 0.01)
      const inter = f1.intersection(f2)
      expect(inter.isEmpty).toBe(true)
    })
  })

  describe('toJSON', () => {
    it('should produce valid JSON representation', () => {
      filter.add('hello')
      const json = filter.toJSON()
      expect(json).toHaveProperty('counters')
      expect(json).toHaveProperty('bitCount')
      expect(json).toHaveProperty('hashCount')
      expect(json).toHaveProperty('expectedItems')
      expect(json).toHaveProperty('targetFalsePositiveRate')
      expect(json).toHaveProperty('itemCount')
    })

    it('should serialize counters as array', () => {
      filter.add('a')
      const json = filter.toJSON()
      expect(Array.isArray(json.counters)).toBe(true)
    })

    it('should reflect itemCount', () => {
      filter.add('a')
      filter.add('b')
      const json = filter.toJSON()
      expect(json.itemCount).toBe(2)
    })

    it('should preserve expectedItems', () => {
      const f = new StringBloomFilter(500, 0.05)
      const json = f.toJSON()
      expect(json.expectedItems).toBe(500)
    })

    it('should preserve targetFalsePositiveRate', () => {
      const f = new StringBloomFilter(100, 0.001)
      const json = f.toJSON()
      expect(json.targetFalsePositiveRate).toBe(0.001)
    })
  })

  describe('fromJSON', () => {
    it('should restore filter from JSON', () => {
      filter.add('hello')
      filter.add('world')
      const json = filter.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      expect(restored.has('hello')).toBe(true)
      expect(restored.has('world')).toBe(true)
    })

    it('should preserve count', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      const json = filter.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      expect(restored.count).toBe(3)
    })

    it('should preserve capacity', () => {
      const f = new StringBloomFilter(500, 0.01)
      f.add('a')
      const json = f.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      expect(restored.capacity()).toBe(500)
    })

    it('should preserve bit count', () => {
      const f = new StringBloomFilter(100, 0.01)
      const json = f.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      expect(restored.getStatistics().bitCount).toBe(json.bitCount)
    })

    it('should preserve hash count', () => {
      const f = new StringBloomFilter(100, 0.01)
      const json = f.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      expect(restored.getStatistics().hashCount).toBe(json.hashCount)
    })

    it('should handle empty filter round trip', () => {
      const json = filter.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
      expect(restored.count).toBe(0)
    })

    it('should allow adding after restoration', () => {
      filter.add('a')
      const json = filter.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      restored.add('b')
      expect(restored.has('b')).toBe(true)
      expect(restored.count).toBe(2)
    })

    it('should handle remove after restoration', () => {
      filter.add('a')
      const json = filter.toJSON()
      const restored = StringBloomFilter.fromJSON(json)
      restored.remove('a')
      expect(restored.count).toBe(0)
    })
  })

  describe('getStatistics', () => {
    it('should return complete statistics object', () => {
      filter.add('hello')
      const stats = filter.getStatistics()
      expect(stats).toHaveProperty('estimatedSize')
      expect(stats).toHaveProperty('expectedFalsePositiveRate')
      expect(stats).toHaveProperty('fillRatio')
      expect(stats).toHaveProperty('bitCount')
      expect(stats).toHaveProperty('hashCount')
      expect(stats).toHaveProperty('capacity')
      expect(stats).toHaveProperty('isEmpty')
    })

    it('should reflect current state', () => {
      filter.add('a')
      const stats = filter.getStatistics()
      expect(stats.estimatedSize).toBe(1)
      expect(stats.isEmpty).toBe(false)
      expect(stats.capacity).toBe(DEFAULT_STRING_BLOOM_OPTIONS.expectedItems)
    })

    it('should show empty stats for new filter', () => {
      const stats = filter.getStatistics()
      expect(stats.estimatedSize).toBe(0)
      expect(stats.expectedFalsePositiveRate).toBe(0)
      expect(stats.fillRatio).toBe(0)
      expect(stats.isEmpty).toBe(true)
    })

    it('should update after operations', () => {
      filter.add('a')
      const stats1 = filter.getStatistics()
      filter.clear()
      const stats2 = filter.getStatistics()
      expect(stats2.estimatedSize).toBeLessThan(stats1.estimatedSize)
      expect(stats2.isEmpty).toBe(true)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over counter values', () => {
      filter.add('a')
      const values = [...filter]
      expect(values.length).toBe(filter.getStatistics().bitCount)
    })

    it('should yield numbers', () => {
      filter.add('a')
      for (const v of filter) {
        expect(typeof v).toBe('number')
      }
    })

    it('should yield zeros for empty filter', () => {
      const values = [...filter]
      for (const v of values) {
        expect(v).toBe(0)
      }
    })

    it('should yield some non-zero values after adding', () => {
      filter.add('a')
      const values = [...filter]
      const nonzero = values.filter(v => v > 0)
      expect(nonzero.length).toBeGreaterThan(0)
    })

    it('should work with for...of', () => {
      filter.add('test')
      let count = 0
      for (const _ of filter) {
        count++
      }
      expect(count).toBe(filter.getStatistics().bitCount)
    })

    it('should reflect removals', () => {
      filter.add('a')
      const before = [...filter].filter(v => v > 0).length
      filter.remove('a')
      const after = [...filter].filter(v => v > 0).length
      expect(after).toBeLessThanOrEqual(before)
    })
  })

  describe('unicode and special string handling', () => {
    it('should handle arabic text', () => {
      filter.add('مرحبا')
      expect(filter.has('مرحبا')).toBe(true)
    })

    it('should handle thai text', () => {
      filter.add('สวัสดี')
      expect(filter.has('สวัสดี')).toBe(true)
    })

    it('should handle mixed unicode', () => {
      filter.add('hello世界🎉')
      expect(filter.has('hello世界🎉')).toBe(true)
      expect(filter.has('hello世界🎊')).toBe(false)
    })

    it('should handle null characters', () => {
      filter.add('a\x00b')
      expect(filter.has('a\x00b')).toBe(true)
    })

    it('should handle backslashes', () => {
      filter.add('path\\to\\file')
      expect(filter.has('path\\to\\file')).toBe(true)
    })

    it('should handle JSON-like strings', () => {
      filter.add('{"key":"value"}')
      expect(filter.has('{"key":"value"}')).toBe(true)
    })

    it('should handle URL strings', () => {
      filter.add('https://example.com/path?q=1&b=2')
      expect(filter.has('https://example.com/path?q=1&b=2')).toBe(true)
    })

    it('should handle base64 strings', () => {
      filter.add('SGVsbG8gV29ybGQ=')
      expect(filter.has('SGVsbG8gV29ybGQ=')).toBe(true)
    })

    it('should handle strings with only whitespace', () => {
      filter.add('   ')
      expect(filter.has('   ')).toBe(true)
    })

    it('should handle single character strings', () => {
      filter.add('x')
      expect(filter.has('x')).toBe(true)
    })
  })

  describe('probabilistic behavior', () => {
    it('should have low false positive rate within expected capacity', () => {
      const f = new StringBloomFilter(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        f.add(`item${i}`)
      }
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (f.has(`other${i}`)) {
          falsePositives++
        }
      }
      const actualRate = falsePositives / trials
      expect(actualRate).toBeLessThan(0.05)
    })

    it('should have zero false negatives', () => {
      const f = new StringBloomFilter(500, 0.01)
      const items: string[] = []
      for (let i = 0; i < 500; i++) {
        const s = `item${i}`
        f.add(s)
        items.push(s)
      }
      for (const s of items) {
        expect(f.has(s)).toBe(true)
      }
    })

    it('should increase false positives beyond capacity', () => {
      const f = new StringBloomFilter(100, 0.01)
      for (let i = 0; i < 5000; i++) {
        f.add(`item${i}`)
      }
      const fpRate = f.expectedFalsePositiveRate()
      expect(fpRate).toBeGreaterThan(0.5)
    })
  })

  describe('edge cases', () => {
    it('should handle very small capacity', () => {
      const f = new StringBloomFilter(1, 0.5)
      f.add('only')
      expect(f.has('only')).toBe(true)
    })

    it('should handle very low false positive rate', () => {
      const f = new StringBloomFilter(100, 0.0001)
      f.add('a')
      expect(f.has('a')).toBe(true)
    })

    it('should handle high false positive rate', () => {
      const f = new StringBloomFilter(100, 0.5)
      f.add('a')
      expect(f.has('a')).toBe(true)
    })

    it('should handle large capacity', () => {
      const f = new StringBloomFilter(1000000, 0.01)
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle adding and removing many times', () => {
      for (let i = 0; i < 100; i++) {
        filter.add('x')
      }
      for (let i = 0; i < 100; i++) {
        filter.remove('x')
      }
      expect(filter.count).toBe(0)
      expect(filter.has('x')).toBe(false)
    })

    it('should handle counter saturation at 65535', () => {
      const f = new StringBloomFilter(10, 0.5)
      for (let i = 0; i < 70000; i++) {
        f.add('x')
      }
      expect(f.has('x')).toBe(true)
      expect(f.count).toBe(70000)
    })

    it('should produce consistent hash positions', () => {
      const f = new StringBloomFilter(100, 0.01)
      f.add('test')
      const has1 = f.has('test')
      const has2 = f.has('test')
      expect(has1).toBe(has2)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_STRING_BLOOM_OPTIONS', () => {
      expect(DEFAULT_STRING_BLOOM_OPTIONS).toBeDefined()
      expect(DEFAULT_STRING_BLOOM_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_STRING_BLOOM_OPTIONS.falsePositiveRate).toBe(0.01)
    })

    it('should export StringBloomFilter class', () => {
      expect(StringBloomFilter).toBeDefined()
      expect(typeof StringBloomFilter).toBe('function')
    })

    it('should have all required methods', () => {
      const f = new StringBloomFilter()
      expect(typeof f.add).toBe('function')
      expect(typeof f.has).toBe('function')
      expect(typeof f.remove).toBe('function')
      expect(typeof f.clear).toBe('function')
      expect(typeof f.estimatedSize).toBe('function')
      expect(typeof f.expectedFalsePositiveRate).toBe('function')
      expect(typeof f.fillRatio).toBe('function')
      expect(typeof f.capacity).toBe('function')
      expect(typeof f.union).toBe('function')
      expect(typeof f.intersection).toBe('function')
      expect(typeof f.toJSON).toBe('function')
      expect(typeof f.getStatistics).toBe('function')
    })

    it('should have static methods', () => {
      expect(typeof StringBloomFilter.create).toBe('function')
      expect(typeof StringBloomFilter.fromJSON).toBe('function')
    })
  })

  describe('type imports', () => {
    it('should support StringBloomFilterOptions type', () => {
      const opts: StringBloomFilterOptions = {
        expectedItems: 500,
        falsePositiveRate: 0.02,
      }
      const f = new StringBloomFilter(opts)
      expect(f.capacity()).toBe(500)
    })
  })
})
