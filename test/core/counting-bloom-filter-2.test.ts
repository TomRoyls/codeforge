import { describe, it, expect, beforeEach } from 'vitest'
import { CountingBloomFilter, DEFAULT_ERROR_RATE } from '../../src/core/counting-bloom-filter-2/index.js'

describe('CountingBloomFilter', () => {
  let filter: CountingBloomFilter

  beforeEach(() => {
    filter = new CountingBloomFilter(1000)
  })

  describe('constructor', () => {
    it('should create a filter with default error rate', () => {
      const f = new CountingBloomFilter(1000)
      expect(f.isEmpty()).toBe(true)
      expect(f.size()).toBe(0)
    })

    it('should accept custom capacity', () => {
      const f = new CountingBloomFilter(5000)
      expect(f.capacity).toBe(5000)
    })

    it('should accept custom error rate', () => {
      const f = new CountingBloomFilter(1000, 0.01)
      expect(f.getErrorRate()).toBe(0.01)
    })

    it('should use DEFAULT_ERROR_RATE when not specified', () => {
      const f = new CountingBloomFilter(1000)
      expect(f.getErrorRate()).toBe(DEFAULT_ERROR_RATE)
    })

    it('should compute a positive bucket count', () => {
      const f = new CountingBloomFilter(1000, 0.01)
      expect(f.getBucketCount()).toBeGreaterThan(0)
    })

    it('should compute a positive hash function count', () => {
      const f = new CountingBloomFilter(1000, 0.01)
      expect(f.getHashFunctionCount()).toBeGreaterThan(0)
    })

    it('should use at least 1 hash function', () => {
      const f = new CountingBloomFilter(10, 0.5)
      expect(f.getHashFunctionCount()).toBeGreaterThanOrEqual(1)
    })

    it('should produce larger bucket arrays for lower error rates', () => {
      const f1 = new CountingBloomFilter(100, 0.1)
      const f2 = new CountingBloomFilter(100, 0.001)
      expect(f2.getBucketCount()).toBeGreaterThan(f1.getBucketCount())
    })

    it('should produce larger bucket arrays for larger capacities', () => {
      const f1 = new CountingBloomFilter(100, 0.01)
      const f2 = new CountingBloomFilter(10000, 0.01)
      expect(f2.getBucketCount()).toBeGreaterThan(f1.getBucketCount())
    })

    it('should initialize all counters to zero', () => {
      expect(filter.loadFactor).toBe(0)
    })

    it('should handle capacity of 1', () => {
      const f = new CountingBloomFilter(1, 0.01)
      expect(f.capacity).toBe(1)
    })
  })

  describe('add', () => {
    it('should add an item and increment size', () => {
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
      expect(filter.has('')).toBe(true)
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
      expect(filter.count('item')).toBeGreaterThanOrEqual(2)
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

    it('should increase load factor when adding items', () => {
      const initialLoad = filter.loadFactor
      filter.add('item')
      expect(filter.loadFactor).toBeGreaterThanOrEqual(initialLoad)
    })

    it('should handle adding many items', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size()).toBe(500)
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

    it('should not change size on failed remove', () => {
      filter.add('present')
      filter.remove('absent')
      expect(filter.size()).toBe(1)
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

    it('should have no false negatives', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(filter.has(`item-${i}`)).toBe(true)
      }
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
      expect(c).toBeGreaterThanOrEqual(2)
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

    it('should estimate frequency for repeated adds', () => {
      for (let i = 0; i < 10; i++) {
        filter.add('frequent')
      }
      expect(filter.count('frequent')).toBeGreaterThanOrEqual(1)
    })

    it('should return to 0 after equal adds and removes', () => {
      for (let i = 0; i < 5; i++) {
        filter.add('item')
      }
      for (let i = 0; i < 5; i++) {
        filter.remove('item')
      }
      expect(filter.count('item')).toBe(0)
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
      const cap = filter.capacity
      filter.add('test')
      filter.clear()
      expect(filter.capacity).toBe(cap)
    })

    it('should preserve error rate after clear', () => {
      const rate = filter.getErrorRate()
      filter.add('test')
      filter.clear()
      expect(filter.getErrorRate()).toBe(rate)
    })

    it('should reset load factor to 0', () => {
      filter.add('test')
      filter.clear()
      expect(filter.loadFactor).toBe(0)
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
      const f = new CountingBloomFilter(500)
      f.add('test')
      const cloned = f.clone()
      expect(cloned.capacity).toBe(500)
    })

    it('should preserve error rate', () => {
      const f = new CountingBloomFilter(1000, 0.01)
      f.add('test')
      const cloned = f.clone()
      expect(cloned.getErrorRate()).toBe(0.01)
    })

    it('should preserve bucket count', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.getBucketCount()).toBe(filter.getBucketCount())
    })

    it('should preserve hash function count', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.getHashFunctionCount()).toBe(filter.getHashFunctionCount())
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

    it('should have equal counters after clone', () => {
      filter.add('x')
      filter.add('y')
      filter.add('z')
      const cloned = filter.clone()
      expect(cloned.equals(filter)).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true for identical empty filters', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      expect(f1.equals(f2)).toBe(true)
    })

    it('should return true for filters with same items', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('a')
      f1.add('b')
      f2.add('a')
      f2.add('b')
      expect(f1.equals(f2)).toBe(true)
    })

    it('should return false for filters with different capacities', () => {
      const f1 = new CountingBloomFilter(100)
      const f2 = new CountingBloomFilter(200)
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return false for filters with different error rates', () => {
      const f1 = new CountingBloomFilter(1000, 0.01)
      const f2 = new CountingBloomFilter(1000, 0.001)
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return false when one filter has items and other does not', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('test')
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return true for a cloned filter', () => {
      filter.add('a')
      filter.add('b')
      const cloned = filter.clone()
      expect(filter.equals(cloned)).toBe(true)
      expect(cloned.equals(filter)).toBe(true)
    })

    it('should return false after modifying one filter', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('x')
      f2.add('x')
      expect(f1.equals(f2)).toBe(true)
      f1.add('y')
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return true for empty filter after clear', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('temp')
      f1.clear()
      expect(f1.equals(f2)).toBe(true)
    })

    it('should be reflexive', () => {
      filter.add('a')
      expect(filter.equals(filter)).toBe(true)
    })

    it('should return false for filters with different items', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('x')
      f2.add('y')
      expect(f1.equals(f2)).toBe(false)
    })
  })

  describe('expectedFalsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should return a positive number after adding items', () => {
      filter.add('test')
      expect(filter.expectedFalsePositiveRate()).toBeGreaterThan(0)
    })

    it('should increase as more items are added', () => {
      const f = new CountingBloomFilter(100, 0.01)
      const rate0 = f.expectedFalsePositiveRate()
      f.add('a')
      const rate1 = f.expectedFalsePositiveRate()
      f.add('b')
      f.add('c')
      f.add('d')
      f.add('e')
      const rate5 = f.expectedFalsePositiveRate()
      expect(rate1).toBeGreaterThanOrEqual(rate0)
      expect(rate5).toBeGreaterThanOrEqual(rate1)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const rate = filter.expectedFalsePositiveRate()
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })

    it('should decrease after removing items', () => {
      filter.add('test')
      filter.add('test2')
      const rateAfterAdd = filter.expectedFalsePositiveRate()
      filter.remove('test')
      filter.remove('test2')
      const rateAfterRemove = filter.expectedFalsePositiveRate()
      expect(rateAfterRemove).toBeLessThanOrEqual(rateAfterAdd)
    })

    it('should return 0 after clearing', () => {
      filter.add('test')
      filter.clear()
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should return 0 for fresh filter', () => {
      const f = new CountingBloomFilter(1000)
      expect(f.expectedFalsePositiveRate()).toBe(0)
    })
  })

  describe('union', () => {
    it('should combine two filters', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('a')
      f2.add('b')
      const union = f1.union(f2)
      expect(union.has('a')).toBe(true)
      expect(union.has('b')).toBe(true)
    })

    it('should take max counters', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('x')
      f1.add('x')
      f2.add('x')
      const union = f1.union(f2)
      expect(union.count('x')).toBeGreaterThanOrEqual(2)
    })

    it('should throw on different capacities', () => {
      const f1 = new CountingBloomFilter(100)
      const f2 = new CountingBloomFilter(200)
      expect(() => f1.union(f2)).toThrow()
    })

    it('should throw on different error rates', () => {
      const f1 = new CountingBloomFilter(1000, 0.01)
      const f2 = new CountingBloomFilter(1000, 0.001)
      expect(() => f1.union(f2)).toThrow()
    })

    it('should produce a new filter', () => {
      const f1 = new CountingBloomFilter(1000)
      f1.add('a')
      const f2 = new CountingBloomFilter(1000)
      f2.add('b')
      const union = f1.union(f2)
      expect(union).not.toBe(f1)
      expect(union).not.toBe(f2)
    })

    it('should handle union of empty filters', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      const union = f1.union(f2)
      expect(union.isEmpty()).toBe(true)
    })

    it('should handle union with one empty filter', () => {
      const f1 = new CountingBloomFilter(1000)
      f1.add('a')
      const f2 = new CountingBloomFilter(1000)
      const union = f1.union(f2)
      expect(union.has('a')).toBe(true)
    })

    it('should preserve capacity of operands', () => {
      const f1 = new CountingBloomFilter(500)
      const f2 = new CountingBloomFilter(500)
      const union = f1.union(f2)
      expect(union.capacity).toBe(500)
    })

    it('should be commutative in terms of membership', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('a')
      f1.add('b')
      f2.add('c')
      f2.add('d')
      const union1 = f1.union(f2)
      const union2 = f2.union(f1)
      expect(union1.has('a')).toBe(true)
      expect(union1.has('b')).toBe(true)
      expect(union1.has('c')).toBe(true)
      expect(union1.has('d')).toBe(true)
      expect(union2.has('a')).toBe(true)
      expect(union2.has('b')).toBe(true)
      expect(union2.has('c')).toBe(true)
      expect(union2.has('d')).toBe(true)
    })
  })

  describe('intersection', () => {
    it('should intersect two filters', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('a')
      f1.add('b')
      f2.add('b')
      f2.add('c')
      const intersection = f1.intersection(f2)
      expect(intersection.has('b')).toBe(true)
    })

    it('should take min counters', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('x')
      f1.add('x')
      f1.add('x')
      f2.add('x')
      const intersection = f1.intersection(f2)
      expect(intersection.count('x')).toBeLessThanOrEqual(f1.count('x'))
      expect(intersection.count('x')).toBeLessThanOrEqual(f2.count('x'))
    })

    it('should throw on different capacities', () => {
      const f1 = new CountingBloomFilter(100)
      const f2 = new CountingBloomFilter(200)
      expect(() => f1.intersection(f2)).toThrow()
    })

    it('should throw on different error rates', () => {
      const f1 = new CountingBloomFilter(1000, 0.01)
      const f2 = new CountingBloomFilter(1000, 0.001)
      expect(() => f1.intersection(f2)).toThrow()
    })

    it('should produce a new filter', () => {
      const f1 = new CountingBloomFilter(1000)
      f1.add('a')
      const f2 = new CountingBloomFilter(1000)
      f2.add('b')
      const intersection = f1.intersection(f2)
      expect(intersection).not.toBe(f1)
      expect(intersection).not.toBe(f2)
    })

    it('should handle intersection of empty filters', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      const intersection = f1.intersection(f2)
      expect(intersection.isEmpty()).toBe(true)
    })

    it('should handle intersection with one empty filter', () => {
      const f1 = new CountingBloomFilter(1000)
      f1.add('a')
      const f2 = new CountingBloomFilter(1000)
      const intersection = f1.intersection(f2)
      expect(intersection.isEmpty()).toBe(true)
    })

    it('should preserve capacity of operands', () => {
      const f1 = new CountingBloomFilter(500)
      const f2 = new CountingBloomFilter(500)
      const intersection = f1.intersection(f2)
      expect(intersection.capacity).toBe(500)
    })

    it('should contain common items', () => {
      const f1 = new CountingBloomFilter(1000)
      const f2 = new CountingBloomFilter(1000)
      f1.add('shared')
      f1.add('only1')
      f2.add('shared')
      f2.add('only2')
      const intersection = f1.intersection(f2)
      expect(intersection.has('shared')).toBe(true)
    })
  })

  describe('capacity', () => {
    it('should return the configured capacity', () => {
      const f = new CountingBloomFilter(5000)
      expect(f.capacity).toBe(5000)
    })

    it('should not change after operations', () => {
      const cap = filter.capacity
      filter.add('test')
      expect(filter.capacity).toBe(cap)
    })

    it('should not change after clear', () => {
      const cap = filter.capacity
      filter.add('test')
      filter.clear()
      expect(filter.capacity).toBe(cap)
    })

    it('should be preserved in clone', () => {
      const f = new CountingBloomFilter(777)
      expect(f.clone().capacity).toBe(777)
    })
  })

  describe('loadFactor', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.loadFactor).toBe(0)
    })

    it('should return a positive number after adding items', () => {
      filter.add('test')
      expect(filter.loadFactor).toBeGreaterThan(0)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.loadFactor).toBeGreaterThanOrEqual(0)
      expect(filter.loadFactor).toBeLessThanOrEqual(1)
    })

    it('should increase as more items are added', () => {
      const f = new CountingBloomFilter(100, 0.01)
      const lf0 = f.loadFactor
      f.add('a')
      const lf1 = f.loadFactor
      f.add('b')
      const lf2 = f.loadFactor
      expect(lf1).toBeGreaterThanOrEqual(lf0)
      expect(lf2).toBeGreaterThanOrEqual(lf1)
    })

    it('should return 0 after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.loadFactor).toBe(0)
    })

    it('should decrease after removing items', () => {
      filter.add('test')
      filter.add('test2')
      const lfAfterAdd = filter.loadFactor
      filter.remove('test')
      filter.remove('test2')
      const lfAfterRemove = filter.loadFactor
      expect(lfAfterRemove).toBeLessThanOrEqual(lfAfterAdd)
    })

    it('should be preserved in clone', () => {
      filter.add('a')
      filter.add('b')
      const cloned = filter.clone()
      expect(cloned.loadFactor).toBe(filter.loadFactor)
    })
  })

  describe('getErrorRate', () => {
    it('should return the configured error rate', () => {
      const f = new CountingBloomFilter(1000, 0.05)
      expect(f.getErrorRate()).toBe(0.05)
    })

    it('should return default error rate when not specified', () => {
      const f = new CountingBloomFilter(1000)
      expect(f.getErrorRate()).toBe(DEFAULT_ERROR_RATE)
    })
  })

  describe('getBucketCount', () => {
    it('should return a positive number', () => {
      expect(filter.getBucketCount()).toBeGreaterThan(0)
    })

    it('should remain constant after operations', () => {
      const initial = filter.getBucketCount()
      filter.add('test')
      expect(filter.getBucketCount()).toBe(initial)
    })
  })

  describe('getHashFunctionCount', () => {
    it('should return a positive number', () => {
      expect(filter.getHashFunctionCount()).toBeGreaterThan(0)
    })

    it('should remain constant after operations', () => {
      const initial = filter.getHashFunctionCount()
      filter.add('test')
      expect(filter.getHashFunctionCount()).toBe(initial)
    })
  })

  describe('from', () => {
    it('should create filter from string array', () => {
      const f = CountingBloomFilter.from(['a', 'b', 'c'])
      expect(f.size()).toBe(3)
      expect(f.has('a')).toBe(true)
      expect(f.has('b')).toBe(true)
      expect(f.has('c')).toBe(true)
    })

    it('should create filter from empty array', () => {
      const f = CountingBloomFilter.from([])
      expect(f.isEmpty()).toBe(true)
      expect(f.size()).toBe(0)
    })

    it('should use provided capacity', () => {
      const f = CountingBloomFilter.from(['a', 'b'], 5000)
      expect(f.capacity).toBe(5000)
    })

    it('should use provided error rate', () => {
      const f = CountingBloomFilter.from(['a'], 100, 0.001)
      expect(f.getErrorRate()).toBe(0.001)
    })

    it('should handle duplicate items in array', () => {
      const f = CountingBloomFilter.from(['x', 'x', 'x'])
      expect(f.size()).toBe(3)
    })

    it('should handle unicode items', () => {
      const f = CountingBloomFilter.from(['日本語', '🎉', 'αβγ'])
      expect(f.has('日本語')).toBe(true)
      expect(f.has('🎉')).toBe(true)
      expect(f.has('αβγ')).toBe(true)
    })

    it('should handle large arrays', () => {
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`)
      const f = CountingBloomFilter.from(items)
      expect(f.size()).toBe(1000)
      expect(f.has('item-0')).toBe(true)
      expect(f.has('item-999')).toBe(true)
    })
  })

  describe('false positive handling', () => {
    it('should have a low false positive rate within capacity', () => {
      const f = new CountingBloomFilter(1000, 0.01)
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
      const f = new CountingBloomFilter(100, 0.01)
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
      const f = new CountingBloomFilter(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      expect(f.size()).toBe(10000)
      expect(f.has('item-0')).toBe(true)
      expect(f.has('item-9999')).toBe(true)
    })

    it('should handle 10000 items with no false negatives', () => {
      const f = new CountingBloomFilter(10000, 0.01)
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 10000; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle removal of large item sets', () => {
      const f = new CountingBloomFilter(100, 0.01)
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
  })

  describe('hash distribution', () => {
    it('should produce different internal state for different strings', () => {
      const f = new CountingBloomFilter(100, 0.01)
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
      const f = new CountingBloomFilter(100, 0.0001)
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle high error rate', () => {
      const f = new CountingBloomFilter(100, 0.5)
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle single capacity', () => {
      const f = new CountingBloomFilter(1, 0.01)
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

  describe('DEFAULT_ERROR_RATE export', () => {
    it('should export DEFAULT_ERROR_RATE constant', () => {
      expect(DEFAULT_ERROR_RATE).toBe(0.001)
    })
  })
})
