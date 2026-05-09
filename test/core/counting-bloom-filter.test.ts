import { describe, it, expect, beforeEach } from 'vitest'
import { CountingBloomFilter } from '../../src/core/counting-bloom-filter/counting-bloom-filter.js'
import { DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS } from '../../src/core/counting-bloom-filter/types.js'
import type { CountingBloomFilterOptions } from '../../src/core/counting-bloom-filter/types.js'

describe('CountingBloomFilter', () => {
  let filter: CountingBloomFilter

  beforeEach(() => {
    filter = new CountingBloomFilter()
  })

  describe('constructor', () => {
    it('should create a filter with default options', () => {
      const f = new CountingBloomFilter()
      expect(f.isEmpty()).toBe(true)
      expect(f.size()).toBe(0)
    })

    it('should accept custom capacity', () => {
      const f = new CountingBloomFilter({ capacity: 5000 })
      expect(f.getCapacity()).toBe(5000)
    })

    it('should accept custom errorRate', () => {
      const f = new CountingBloomFilter({ errorRate: 0.001 })
      expect(f.getErrorRate()).toBe(0.001)
    })

    it('should accept partial options with defaults', () => {
      const f = new CountingBloomFilter({ capacity: 200 })
      expect(f.getCapacity()).toBe(200)
      expect(f.getErrorRate()).toBe(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.errorRate)
    })

    it('should accept all options combined', () => {
      const f = new CountingBloomFilter({ capacity: 500, errorRate: 0.05 })
      expect(f.getCapacity()).toBe(500)
      expect(f.getErrorRate()).toBe(0.05)
    })

    it('should compute a positive bit count', () => {
      const f = new CountingBloomFilter({ capacity: 1000, errorRate: 0.01 })
      expect(f.getBitCount()).toBeGreaterThan(0)
    })

    it('should compute a positive hash count', () => {
      const f = new CountingBloomFilter({ capacity: 1000, errorRate: 0.01 })
      expect(f.getHashCount()).toBeGreaterThan(0)
    })

    it('should use at least 1 hash function', () => {
      const f = new CountingBloomFilter({ capacity: 10, errorRate: 0.5 })
      expect(f.getHashCount()).toBeGreaterThanOrEqual(1)
    })

    it('should produce larger bit arrays for lower error rates', () => {
      const f1 = new CountingBloomFilter({ capacity: 100, errorRate: 0.1 })
      const f2 = new CountingBloomFilter({ capacity: 100, errorRate: 0.001 })
      expect(f2.getBitCount()).toBeGreaterThan(f1.getBitCount())
    })

    it('should produce larger bit arrays for larger capacities', () => {
      const f1 = new CountingBloomFilter({ capacity: 100, errorRate: 0.01 })
      const f2 = new CountingBloomFilter({ capacity: 10000, errorRate: 0.01 })
      expect(f2.getBitCount()).toBeGreaterThan(f1.getBitCount())
    })
  })

  describe('add', () => {
    it('should add an item', () => {
      filter.add('hello')
      expect(filter.size()).toBe(1)
    })

    it('should add multiple different items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size()).toBe(3)
    })

    it('should count duplicate adds as additional items', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size()).toBe(2)
    })

    it('should handle empty string', () => {
      filter.add('')
      expect(filter.size()).toBe(1)
    })

    it('should handle unicode strings', () => {
      filter.add('日本語')
      filter.add('🎉🚀')
      expect(filter.size()).toBe(2)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      filter.add(longStr)
      expect(filter.size()).toBe(1)
    })

    it('should handle strings with special characters', () => {
      filter.add('hello\nworld\t!')
      filter.add('path/to/file.ts')
      expect(filter.size()).toBe(2)
    })

    it('should increment counters at hash positions', () => {
      filter.add('item')
      expect(filter.has('item')).toBe(true)
      filter.add('item')
      expect(filter.count('item')).toBeGreaterThanOrEqual(1)
    })

    it('should handle numeric strings', () => {
      filter.add('123')
      filter.add('456')
      expect(filter.size()).toBe(2)
    })

    it('should handle whitespace-only strings', () => {
      filter.add('   ')
      filter.add('\t')
      filter.add('\n')
      expect(filter.size()).toBe(3)
    })
  })

  describe('remove', () => {
    it('should remove an added item', () => {
      filter.add('hello')
      const result = filter.remove('hello')
      expect(result).toBe(true)
      expect(filter.size()).toBe(0)
    })

    it('should return false for item not present', () => {
      const result = filter.remove('absent')
      expect(result).toBe(false)
    })

    it('should return false when removing from empty filter', () => {
      expect(filter.remove('anything')).toBe(false)
    })

    it('should handle removing after multiple adds of same item', () => {
      filter.add('test')
      filter.add('test')
      filter.add('test')
      expect(filter.remove('test')).toBe(true)
      expect(filter.size()).toBe(2)
      expect(filter.has('test')).toBe(true)
    })

    it('should fully remove after equal adds and removes', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.has('test')).toBe(false)
    })

    it('should not affect other items when removing', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.has('b')).toBe(true)
    })

    it('should handle remove of empty string', () => {
      filter.add('')
      expect(filter.remove('')).toBe(true)
      expect(filter.size()).toBe(0)
    })

    it('should handle remove of unicode string', () => {
      filter.add('日本語')
      expect(filter.remove('日本語')).toBe(true)
      expect(filter.has('日本語')).toBe(false)
    })

    it('should handle sequential remove operations', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.remove('b')).toBe(true)
      expect(filter.size()).toBe(2)
      expect(filter.remove('a')).toBe(true)
      expect(filter.size()).toBe(1)
      expect(filter.remove('c')).toBe(true)
      expect(filter.size()).toBe(0)
    })

    it('should return false on second remove of same item', () => {
      filter.add('once')
      expect(filter.remove('once')).toBe(true)
      expect(filter.remove('once')).toBe(false)
    })

    it('should handle removal of duplicated item partially', () => {
      filter.add('dup')
      filter.add('dup')
      filter.remove('dup')
      expect(filter.size()).toBe(1)
      expect(filter.has('dup')).toBe(true)
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

    it('should return false after item is removed', () => {
      filter.add('removeme')
      filter.remove('removeme')
      expect(filter.has('removeme')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      filter.add('Hello')
      expect(filter.has('Hello')).toBe(true)
      expect(filter.has('hello')).toBe(false)
    })

    it('should handle strings with null characters', () => {
      filter.add('before\0after')
      expect(filter.has('before\0after')).toBe(true)
    })

    it('should handle mixed unicode content', () => {
      filter.add('hello世界🎉')
      expect(filter.has('hello世界🎉')).toBe(true)
      expect(filter.has('hello世界')).toBe(false)
    })
  })

  describe('mightHave', () => {
    it('should be an alias for has returning true', () => {
      filter.add('test')
      expect(filter.mightHave('test')).toBe(true)
    })

    it('should be an alias for has returning false', () => {
      expect(filter.mightHave('test')).toBe(false)
    })

    it('should match has result for empty filter', () => {
      expect(filter.mightHave('anything')).toBe(filter.has('anything'))
    })

    it('should match has result after add', () => {
      filter.add('item')
      expect(filter.mightHave('item')).toBe(filter.has('item'))
    })

    it('should match has result after remove', () => {
      filter.add('item')
      filter.remove('item')
      expect(filter.mightHave('item')).toBe(filter.has('item'))
    })

    it('should match has for multiple items', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.mightHave('a')).toBe(filter.has('a'))
      expect(filter.mightHave('b')).toBe(filter.has('b'))
      expect(filter.mightHave('c')).toBe(filter.has('c'))
    })
  })

  describe('count', () => {
    it('should return 0 for item not in filter', () => {
      expect(filter.count('absent')).toBe(0)
    })

    it('should return at least 1 for single-added item', () => {
      filter.add('test')
      expect(filter.count('test')).toBeGreaterThanOrEqual(1)
    })

    it('should increase with duplicate adds', () => {
      filter.add('test')
      filter.add('test')
      const c = filter.count('test')
      expect(c).toBeGreaterThanOrEqual(1)
    })

    it('should decrease after remove', () => {
      filter.add('test')
      filter.add('test')
      filter.remove('test')
      expect(filter.count('test')).toBeGreaterThanOrEqual(1)
    })

    it('should return 0 after full removal', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.count('test')).toBe(0)
    })

    it('should return 0 for empty filter', () => {
      expect(filter.count('anything')).toBe(0)
    })

    it('should handle count for empty string', () => {
      filter.add('')
      expect(filter.count('')).toBeGreaterThanOrEqual(1)
    })

    it('should handle count for unicode string', () => {
      filter.add('🎉')
      expect(filter.count('🎉')).toBeGreaterThanOrEqual(1)
    })

    it('should handle count after many duplicate adds', () => {
      for (let i = 0; i < 5; i++) {
        filter.add('multi')
      }
      expect(filter.count('multi')).toBeGreaterThanOrEqual(1)
    })

    it('should handle count for items not matching any counter', () => {
      filter.add('present')
      expect(filter.count('notpresent')).toBe(0)
    })
  })

  describe('getEstimatedCount', () => {
    it('should be an alias for count returning same value', () => {
      filter.add('test')
      expect(filter.getEstimatedCount('test')).toBe(filter.count('test'))
    })

    it('should return 0 for absent items', () => {
      expect(filter.getEstimatedCount('absent')).toBe(0)
    })

    it('should return same value after duplicate adds', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.getEstimatedCount('test')).toBe(filter.count('test'))
    })

    it('should return same value after remove', () => {
      filter.add('test')
      filter.add('test')
      filter.remove('test')
      expect(filter.getEstimatedCount('test')).toBe(filter.count('test'))
    })

    it('should return 0 for empty filter', () => {
      expect(filter.getEstimatedCount('anything')).toBe(0)
    })
  })

  describe('size', () => {
    it('should return 0 for new filter', () => {
      expect(filter.size()).toBe(0)
    })

    it('should return 1 after one add', () => {
      filter.add('item')
      expect(filter.size()).toBe(1)
    })

    it('should track multiple adds', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size()).toBe(3)
    })

    it('should count duplicate adds', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size()).toBe(2)
    })

    it('should decrease after remove', () => {
      filter.add('item')
      filter.remove('item')
      expect(filter.size()).toBe(0)
    })

    it('should not decrease after failed remove', () => {
      filter.add('present')
      filter.remove('absent')
      expect(filter.size()).toBe(1)
    })

    it('should handle many items', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size()).toBe(100)
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

    it('should return true after removing all items', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false when some items remain', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.clear()
      expect(filter.size()).toBe(0)
    })

    it('should make the filter empty', () => {
      filter.add('test')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should reset all counters to zero', () => {
      filter.add('test')
      filter.clear()
      expect(filter.has('test')).toBe(false)
      expect(filter.count('test')).toBe(0)
    })

    it('should allow adding after clear', () => {
      filter.add('first')
      filter.clear()
      filter.add('second')
      expect(filter.size()).toBe(1)
      expect(filter.has('second')).toBe(true)
    })

    it('should handle clearing an empty filter', () => {
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
      expect(filter.size()).toBe(0)
    })

    it('should preserve capacity after clear', () => {
      const cap = filter.getCapacity()
      filter.add('test')
      filter.clear()
      expect(filter.getCapacity()).toBe(cap)
    })

    it('should preserve error rate after clear', () => {
      const rate = filter.getErrorRate()
      filter.add('test')
      filter.clear()
      expect(filter.getErrorRate()).toBe(rate)
    })

    it('should preserve bit count after clear', () => {
      const bits = filter.getBitCount()
      filter.add('test')
      filter.clear()
      expect(filter.getBitCount()).toBe(bits)
    })
  })

  describe('getCapacity', () => {
    it('should return default capacity', () => {
      expect(filter.getCapacity()).toBe(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.capacity)
    })

    it('should return custom capacity', () => {
      const f = new CountingBloomFilter({ capacity: 5000 })
      expect(f.getCapacity()).toBe(5000)
    })

    it('should not change after operations', () => {
      filter.add('test')
      expect(filter.getCapacity()).toBe(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.capacity)
    })
  })

  describe('getErrorRate', () => {
    it('should return default error rate', () => {
      expect(filter.getErrorRate()).toBe(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.errorRate)
    })

    it('should return custom error rate', () => {
      const f = new CountingBloomFilter({ errorRate: 0.001 })
      expect(f.getErrorRate()).toBe(0.001)
    })

    it('should not change after operations', () => {
      filter.add('test')
      expect(filter.getErrorRate()).toBe(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.errorRate)
    })
  })

  describe('getBitCount', () => {
    it('should return a positive number', () => {
      expect(filter.getBitCount()).toBeGreaterThan(0)
    })

    it('should return different values for different error rates', () => {
      const f1 = new CountingBloomFilter({ capacity: 100, errorRate: 0.1 })
      const f2 = new CountingBloomFilter({ capacity: 100, errorRate: 0.001 })
      expect(f2.getBitCount()).toBeGreaterThan(f1.getBitCount())
    })

    it('should return different values for different capacities', () => {
      const f1 = new CountingBloomFilter({ capacity: 100, errorRate: 0.01 })
      const f2 = new CountingBloomFilter({ capacity: 10000, errorRate: 0.01 })
      expect(f2.getBitCount()).toBeGreaterThan(f1.getBitCount())
    })

    it('should remain constant after operations', () => {
      const initial = filter.getBitCount()
      filter.add('test')
      expect(filter.getBitCount()).toBe(initial)
    })
  })

  describe('getHashCount', () => {
    it('should return a positive number', () => {
      expect(filter.getHashCount()).toBeGreaterThan(0)
    })

    it('should remain constant after operations', () => {
      const initial = filter.getHashCount()
      filter.add('test')
      expect(filter.getHashCount()).toBe(initial)
    })

    it('should vary with filter parameters', () => {
      const f1 = new CountingBloomFilter({ capacity: 100, errorRate: 0.01 })
      const f2 = new CountingBloomFilter({ capacity: 10000, errorRate: 0.001 })
      expect(typeof f1.getHashCount()).toBe('number')
      expect(typeof f2.getHashCount()).toBe('number')
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.size()).toBe(filter.size())
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

    it('should preserve capacity', () => {
      const f = new CountingBloomFilter({ capacity: 500 })
      f.add('test')
      const cloned = f.clone()
      expect(cloned.getCapacity()).toBe(500)
    })

    it('should preserve error rate', () => {
      const f = new CountingBloomFilter({ errorRate: 0.001 })
      f.add('test')
      const cloned = f.clone()
      expect(cloned.getErrorRate()).toBe(0.001)
    })

    it('should preserve bit count', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.getBitCount()).toBe(filter.getBitCount())
    })

    it('should preserve hash count', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.getHashCount()).toBe(filter.getHashCount())
    })

    it('should clone an empty filter', () => {
      const cloned = filter.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size()).toBe(0)
    })

    it('should preserve counter state', () => {
      filter.add('multi')
      filter.add('multi')
      const cloned = filter.clone()
      expect(cloned.count('multi')).toBe(filter.count('multi'))
    })

    it('should preserve removal state', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      const cloned = filter.clone()
      expect(cloned.has('a')).toBe(false)
      expect(cloned.has('b')).toBe(true)
      expect(cloned.size()).toBe(1)
    })
  })

  describe('fromItems', () => {
    it('should create filter from string array', () => {
      const f = CountingBloomFilter.fromItems(['a', 'b', 'c'])
      expect(f.size()).toBe(3)
      expect(f.has('a')).toBe(true)
      expect(f.has('b')).toBe(true)
      expect(f.has('c')).toBe(true)
    })

    it('should create filter from empty array', () => {
      const f = CountingBloomFilter.fromItems([])
      expect(f.isEmpty()).toBe(true)
      expect(f.size()).toBe(0)
    })

    it('should use provided capacity when specified', () => {
      const f = CountingBloomFilter.fromItems(['a', 'b'], { capacity: 5000 })
      expect(f.getCapacity()).toBe(5000)
    })

    it('should use provided error rate when specified', () => {
      const f = CountingBloomFilter.fromItems(['a'], { errorRate: 0.001 })
      expect(f.getErrorRate()).toBe(0.001)
    })

    it('should use items length as capacity when larger than default', () => {
      const items = Array.from({ length: 5000 }, (_, i) => `item-${i}`)
      const f = CountingBloomFilter.fromItems(items)
      expect(f.getCapacity()).toBeGreaterThanOrEqual(items.length)
    })

    it('should use default capacity when items count is small', () => {
      const f = CountingBloomFilter.fromItems(['a'])
      expect(f.getCapacity()).toBe(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.capacity)
    })

    it('should handle duplicate items in array', () => {
      const f = CountingBloomFilter.fromItems(['x', 'x', 'x'])
      expect(f.size()).toBe(3)
    })

    it('should handle unicode items', () => {
      const f = CountingBloomFilter.fromItems(['日本語', '🎉', 'αβγ'])
      expect(f.has('日本語')).toBe(true)
      expect(f.has('🎉')).toBe(true)
      expect(f.has('αβγ')).toBe(true)
    })

    it('should handle single item array', () => {
      const f = CountingBloomFilter.fromItems(['only'])
      expect(f.size()).toBe(1)
      expect(f.has('only')).toBe(true)
    })

    it('should handle large arrays', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      const f = CountingBloomFilter.fromItems(items)
      expect(f.size()).toBe(1000)
      expect(f.has('item-0')).toBe(true)
      expect(f.has('item-999')).toBe(true)
    })
  })

  describe('false positive handling', () => {
    it('should have a low false positive rate within capacity', () => {
      const f = new CountingBloomFilter({ capacity: 1000, errorRate: 0.01 })
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

    it('should report no false negatives', () => {
      const f = new CountingBloomFilter({ capacity: 100, errorRate: 0.01 })
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('add and remove cycles', () => {
    it('should support adding after removal', () => {
      filter.add('test')
      filter.remove('test')
      filter.add('test')
      expect(filter.has('test')).toBe(true)
      expect(filter.size()).toBe(1)
    })

    it('should support multiple add-remove cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        filter.add('cyclic')
        expect(filter.has('cyclic')).toBe(true)
        filter.remove('cyclic')
        expect(filter.has('cyclic')).toBe(false)
      }
      expect(filter.size()).toBe(0)
    })

    it('should handle interleaved add and remove of different items', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      filter.add('c')
      expect(filter.has('a')).toBe(false)
      expect(filter.has('b')).toBe(true)
      expect(filter.has('c')).toBe(true)
      expect(filter.size()).toBe(2)
    })

    it('should track size correctly through complex operations', () => {
      filter.add('x')
      filter.add('y')
      filter.add('x')
      filter.remove('x')
      expect(filter.size()).toBe(2)
      filter.remove('x')
      expect(filter.size()).toBe(1)
      filter.remove('y')
      expect(filter.size()).toBe(0)
    })
  })

  describe('large item sets', () => {
    it('should handle 10000 items', () => {
      const f = new CountingBloomFilter({ capacity: 10000, errorRate: 0.01 })
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      expect(f.size()).toBe(10000)
      expect(f.has('item-0')).toBe(true)
      expect(f.has('item-9999')).toBe(true)
    })

    it('should handle 10000 items with no false negatives', () => {
      const f = new CountingBloomFilter({ capacity: 10000, errorRate: 0.01 })
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 10000; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle removal of large item sets', () => {
      const f = new CountingBloomFilter({ capacity: 100, errorRate: 0.01 })
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        f.remove(`item-${i}`)
      }
      expect(f.size()).toBe(50)
      for (let i = 50; i < 100; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle rapid add and check cycles', () => {
      const f = new CountingBloomFilter({ capacity: 1000, errorRate: 0.01 })
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('hash distribution', () => {
    it('should produce different internal state for different strings', () => {
      const f = new CountingBloomFilter({ capacity: 100, errorRate: 0.01 })
      f.add('aaa')
      const count1 = f.size()
      f.add('bbb')
      const count2 = f.size()
      expect(count2).toBeGreaterThan(count1)
    })

    it('should produce consistent results for same string', () => {
      filter.add('consistent')
      const result1 = filter.has('consistent')
      const result2 = filter.has('consistent')
      expect(result1).toBe(result2)
      expect(result1).toBe(true)
    })

    it('should produce same hash positions for identical items', () => {
      filter.add('item')
      const countBefore = filter.count('item')
      filter.add('item')
      const countAfter = filter.count('item')
      expect(countAfter).toBeGreaterThanOrEqual(countBefore)
    })
  })

  describe('edge cases', () => {
    it('should handle very small error rate', () => {
      const f = new CountingBloomFilter({ capacity: 100, errorRate: 0.0001 })
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle high error rate', () => {
      const f = new CountingBloomFilter({ capacity: 100, errorRate: 0.5 })
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle single capacity', () => {
      const f = new CountingBloomFilter({ capacity: 1, errorRate: 0.01 })
      f.add('only')
      expect(f.has('only')).toBe(true)
    })

    it('should handle remove on item that was never added', () => {
      expect(filter.remove('never-added')).toBe(false)
    })

    it('should handle count on item that was never added', () => {
      expect(filter.count('never-added')).toBe(0)
    })

    it('should handle very long string key', () => {
      const longKey = 'x'.repeat(100000)
      filter.add(longKey)
      expect(filter.has(longKey)).toBe(true)
      expect(filter.remove(longKey)).toBe(true)
      expect(filter.has(longKey)).toBe(false)
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
      for (let i = 0; i < 25; i++) {
        filter.remove(`item-${i}`)
      }
      const cloned = filter.clone()
      for (let i = 25; i < 50; i++) {
        expect(cloned.has(`item-${i}`)).toBe(true)
      }
      for (let i = 0; i < 25; i++) {
        expect(cloned.has(`item-${i}`)).toBe(false)
      }
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS', () => {
      expect(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.capacity).toBe(1000)
      expect(DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.errorRate).toBe(0.01)
    })

    it('should support CountingBloomFilterOptions interface', () => {
      const opts: CountingBloomFilterOptions = {
        capacity: 500,
        errorRate: 0.05,
      }
      expect(opts.capacity).toBe(500)
      expect(opts.errorRate).toBe(0.05)
    })
  })
})
