import { describe, it, expect, beforeEach } from 'vitest'
import { CountingBloomFilter } from '../../src/core/counting-bloom/index.js'
import type { CountingBloomFilterOptions } from '../../src/core/counting-bloom/types.js'

describe('CountingBloomFilter', () => {
  let filter: CountingBloomFilter

  beforeEach(() => {
    filter = new CountingBloomFilter()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const f = new CountingBloomFilter()
      expect(f.isEmpty()).toBe(true)
      expect(f.size).toBe(0)
    })

    it('should create with no arguments', () => {
      const f = new CountingBloomFilter()
      expect(f.capacity).toBe(100)
    })

    it('should accept expectedItems option', () => {
      const f = new CountingBloomFilter({ expectedItems: 500 })
      expect(f.capacity).toBe(500)
    })

    it('should accept errorRate option', () => {
      const f = new CountingBloomFilter({ errorRate: 0.001 })
      expect(f.capacity).toBe(100)
    })

    it('should accept hashFunctions option', () => {
      const f = new CountingBloomFilter({ hashFunctions: 5 })
      expect(f.numHashes).toBe(5)
    })

    it('should accept all options together', () => {
      const f = new CountingBloomFilter({ expectedItems: 200, errorRate: 0.05, hashFunctions: 3 })
      expect(f.capacity).toBe(200)
      expect(f.numHashes).toBe(3)
    })

    it('should compute numCounters based on expectedItems and errorRate', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.01 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.001 })
      expect(f2.numCounters).toBeGreaterThan(f1.numCounters)
    })

    it('should compute more counters for larger expectedItems', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 1000 })
      expect(f2.numCounters).toBeGreaterThan(f1.numCounters)
    })

    it('should compute numHashes automatically', () => {
      const f = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.01 })
      expect(f.numHashes).toBeGreaterThanOrEqual(1)
    })

    it('should override computed numHashes with hashFunctions option', () => {
      const f = new CountingBloomFilter({ expectedItems: 100, hashFunctions: 7 })
      expect(f.numHashes).toBe(7)
    })

    it('should have positive numCounters', () => {
      const f = new CountingBloomFilter()
      expect(f.numCounters).toBeGreaterThan(0)
    })

    it('should default expectedItems to 100', () => {
      const f = new CountingBloomFilter()
      expect(f.capacity).toBe(100)
    })

    it('should default errorRate to 0.01', () => {
      const f = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.01 })
      expect(f.numCounters).toBe(f2.numCounters)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      filter.add('hello')
      expect(filter.size).toBe(1)
      expect(filter.isEmpty()).toBe(false)
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

    it('should increment counters at hash positions', () => {
      filter.add('test')
      expect(filter.has('test')).toBe(true)
    })

    it('should handle numeric items', () => {
      const f = new CountingBloomFilter<number>()
      f.add(42)
      expect(f.has(42)).toBe(true)
    })

    it('should handle object items', () => {
      const f = new CountingBloomFilter<{ id: number }>()
      f.add({ id: 1 })
      expect(f.has({ id: 1 })).toBe(true)
    })

    it('should handle empty string', () => {
      filter.add('')
      expect(filter.has('')).toBe(true)
    })

    it('should handle null items', () => {
      const f = new CountingBloomFilter<null>()
      f.add(null)
      expect(f.has(null)).toBe(true)
    })

    it('should handle boolean items', () => {
      const f = new CountingBloomFilter<boolean>()
      f.add(true)
      expect(f.has(true)).toBe(true)
      expect(f.has(false)).toBe(false)
    })

    it('should handle many distinct items', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(500)
    })

    it('should handle large number of adds of same item', () => {
      for (let i = 0; i < 1000; i++) {
        filter.add('same')
      }
      expect(filter.size).toBe(1000)
      expect(filter.count('same')).toBe(1000)
    })

    it('should allow adding after clear', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.size).toBe(1)
      expect(filter.has('after')).toBe(true)
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

    it('should return false for non-added item', () => {
      filter.add('present')
      expect(filter.has('absent')).toBe(false)
    })

    it('should return true for item added multiple times', () => {
      filter.add('multi')
      filter.add('multi')
      expect(filter.has('multi')).toBe(true)
    })

    it('should return true for item with remaining count after remove', () => {
      filter.add('multi')
      filter.add('multi')
      filter.remove('multi')
      expect(filter.has('multi')).toBe(true)
    })

    it('should return false for removed item', () => {
      filter.add('temporary')
      filter.remove('temporary')
      expect(filter.has('temporary')).toBe(false)
    })

    it('should work with numeric items', () => {
      const f = new CountingBloomFilter<number>()
      f.add(42)
      expect(f.has(42)).toBe(true)
      expect(f.has(43)).toBe(false)
    })

    it('should work with object items', () => {
      const f = new CountingBloomFilter<{ id: number }>()
      f.add({ id: 1 })
      expect(f.has({ id: 1 })).toBe(true)
      expect(f.has({ id: 2 })).toBe(false)
    })

    it('should handle has after clear', () => {
      filter.add('old')
      filter.clear()
      expect(filter.has('old')).toBe(false)
    })

    it('should check all hash positions', () => {
      filter.add('test-item')
      expect(filter.has('test-item')).toBe(true)
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
    })

    it('should return false on empty filter', () => {
      const result = filter.remove('anything')
      expect(result).toBe(false)
    })

    it('should decrement counters for removed item', () => {
      filter.add('x')
      filter.add('x')
      filter.add('x')
      filter.remove('x')
      expect(filter.count('x')).toBe(2)
      expect(filter.size).toBe(2)
    })

    it('should remove all instances via repeated removes', () => {
      filter.add('y')
      filter.add('y')
      filter.remove('y')
      filter.remove('y')
      expect(filter.has('y')).toBe(false)
    })

    it('should handle add-remove-add cycle', () => {
      filter.add('item')
      filter.remove('item')
      filter.add('item')
      expect(filter.has('item')).toBe(true)
      expect(filter.count('item')).toBe(1)
      expect(filter.size).toBe(1)
    })

    it('should maintain correct size after multiple removes', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.remove('a')
      filter.remove('b')
      expect(filter.size).toBe(1)
    })

    it('should return false for item that was never added', () => {
      filter.add('alpha')
      const result = filter.remove('beta')
      expect(result).toBe(false)
    })

    it('should not decrement size on failed remove', () => {
      filter.add('present')
      filter.remove('absent')
      expect(filter.size).toBe(1)
    })

    it('should handle remove after multiple adds of same item', () => {
      for (let i = 0; i < 5; i++) {
        filter.add('x')
      }
      for (let i = 0; i < 5; i++) {
        filter.remove('x')
      }
      expect(filter.has('x')).toBe(false)
      expect(filter.size).toBe(0)
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

    it('should return 0 after all instances removed', () => {
      filter.add('gone')
      filter.remove('gone')
      expect(filter.count('gone')).toBe(0)
    })

    it('should return minimum of all counter positions', () => {
      filter.add('test')
      filter.add('test')
      filter.add('test')
      expect(filter.count('test')).toBe(3)
    })

    it('should handle large counts', () => {
      for (let i = 0; i < 100; i++) {
        filter.add('big')
      }
      expect(filter.count('big')).toBe(100)
    })

    it('should return 0 for item not in filter even when filter has items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.count('d')).toBe(0)
    })
  })

  describe('update', () => {
    it('should add positive delta to counters', () => {
      filter.update('item', 3)
      expect(filter.count('item')).toBe(3)
    })

    it('should handle negative delta', () => {
      filter.add('item')
      filter.add('item')
      filter.add('item')
      filter.update('item', -1)
      expect(filter.count('item')).toBe(2)
    })

    it('should not go below zero', () => {
      filter.update('item', -5)
      expect(filter.count('item')).toBe(0)
    })

    it('should increment size with positive delta', () => {
      filter.update('item', 5)
      expect(filter.size).toBe(5)
    })

    it('should not decrement size with negative delta', () => {
      filter.add('item')
      filter.update('item', -1)
      expect(filter.size).toBe(1)
    })

    it('should handle delta of zero', () => {
      filter.add('item')
      filter.update('item', 0)
      expect(filter.count('item')).toBe(1)
    })

    it('should handle large positive delta', () => {
      filter.update('item', 1000)
      expect(filter.count('item')).toBe(1000)
    })

    it('should work on empty filter with positive delta', () => {
      const f = new CountingBloomFilter()
      f.update('test', 5)
      expect(f.count('test')).toBe(5)
      expect(f.size).toBe(5)
    })

    it('should clamp counters to zero with large negative delta', () => {
      filter.add('item')
      filter.update('item', -100)
      expect(filter.count('item')).toBe(0)
    })

    it('should handle update after add', () => {
      filter.add('item')
      filter.update('item', 2)
      expect(filter.count('item')).toBe(3)
    })
  })

  describe('expectedFalsePositiveRate', () => {
    it('should return 0 on empty filter', () => {
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should return positive value after adds', () => {
      filter.add('test')
      expect(filter.expectedFalsePositiveRate()).toBeGreaterThanOrEqual(0)
    })

    it('should increase as more items are added', () => {
      filter.add('a')
      const fp1 = filter.expectedFalsePositiveRate()
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      const fp2 = filter.expectedFalsePositiveRate()
      expect(fp2).toBeGreaterThan(fp1)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const fp = filter.expectedFalsePositiveRate()
      expect(fp).toBeGreaterThanOrEqual(0)
      expect(fp).toBeLessThanOrEqual(1)
    })

    it('should decrease with larger counter array', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.1 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.001 })
      for (let i = 0; i < 50; i++) {
        const item = `item-${i}`
        f1.add(item)
        f2.add(item)
      }
      expect(f2.expectedFalsePositiveRate()).toBeLessThan(f1.expectedFalsePositiveRate())
    })

    it('should return 0 after clearing', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      filter.clear()
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should decrease after removes', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const fp1 = filter.expectedFalsePositiveRate()
      for (let i = 0; i < 25; i++) {
        filter.remove(`item-${i}`)
      }
      const fp2 = filter.expectedFalsePositiveRate()
      expect(fp2).toBeLessThan(fp1)
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

    it('should return 1 when all counters are non-zero with enough items', () => {
      const small = new CountingBloomFilter({ expectedItems: 10, errorRate: 0.5 })
      for (let i = 0; i < 100; i++) {
        small.add(`item-${i}`)
      }
      expect(small.fillRatio()).toBe(1)
    })
  })

  describe('capacity', () => {
    it('should return expectedItems from constructor', () => {
      const f = new CountingBloomFilter({ expectedItems: 500 })
      expect(f.capacity).toBe(500)
    })

    it('should return default 100 when not specified', () => {
      const f = new CountingBloomFilter()
      expect(f.capacity).toBe(100)
    })

    it('should return 2000 for large expectedItems', () => {
      const f = new CountingBloomFilter({ expectedItems: 2000 })
      expect(f.capacity).toBe(2000)
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

    it('should decrement with remove', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.size).toBe(1)
    })

    it('should reflect add-remove-add cycle', () => {
      filter.add('x')
      filter.remove('x')
      filter.add('x')
      expect(filter.size).toBe(1)
    })
  })

  describe('numHashes', () => {
    it('should be at least 1', () => {
      const f = new CountingBloomFilter()
      expect(f.numHashes).toBeGreaterThanOrEqual(1)
    })

    it('should match hashFunctions option', () => {
      const f = new CountingBloomFilter({ hashFunctions: 10 })
      expect(f.numHashes).toBe(10)
    })

    it('should be computed from numCounters and expectedItems', () => {
      const f = new CountingBloomFilter({ expectedItems: 1000, errorRate: 0.001 })
      expect(f.numHashes).toBeGreaterThanOrEqual(1)
    })
  })

  describe('numCounters', () => {
    it('should be positive', () => {
      const f = new CountingBloomFilter()
      expect(f.numCounters).toBeGreaterThan(0)
    })

    it('should increase with lower errorRate', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.1 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.001 })
      expect(f2.numCounters).toBeGreaterThan(f1.numCounters)
    })

    it('should increase with higher expectedItems', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 10000 })
      expect(f2.numCounters).toBeGreaterThan(f1.numCounters)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should make isEmpty return true', () => {
      filter.add('a')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should reset all counters to 0', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.has('a')).toBe(false)
      expect(filter.has('b')).toBe(false)
    })

    it('should reset fillRatio to 0', () => {
      filter.add('a')
      filter.clear()
      expect(filter.fillRatio()).toBe(0)
    })

    it('should allow operations after clear', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.size).toBe(1)
      expect(filter.has('after')).toBe(true)
    })

    it('should handle multiple clear calls', () => {
      filter.add('a')
      filter.clear()
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should handle clear on empty filter', () => {
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty()).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should return true on new filter', () => {
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      filter.add('x')
      expect(filter.isEmpty()).toBe(false)
    })

    it('should return true after removing all items', () => {
      filter.add('x')
      filter.remove('x')
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      filter.add('x')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false with remaining items after partial remove', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.isEmpty()).toBe(false)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      filter.add('hello')
      const cloned = filter.clone()
      expect(cloned.size).toBe(1)
      expect(cloned.has('hello')).toBe(true)
    })

    it('should not affect original when modified', () => {
      filter.add('original')
      const cloned = filter.clone()
      cloned.add('cloned-only')
      expect(filter.has('cloned-only')).toBe(false)
      expect(cloned.has('cloned-only')).toBe(true)
    })

    it('should preserve counters', () => {
      filter.add('x')
      filter.add('x')
      filter.add('x')
      const cloned = filter.clone()
      expect(cloned.count('x')).toBe(3)
    })

    it('should preserve size', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      const cloned = filter.clone()
      expect(cloned.size).toBe(3)
    })

    it('should preserve configuration', () => {
      const f = new CountingBloomFilter({ expectedItems: 500, errorRate: 0.001, hashFunctions: 5 })
      const cloned = f.clone()
      expect(cloned.capacity).toBe(500)
      expect(cloned.numHashes).toBe(5)
      expect(cloned.numCounters).toBe(f.numCounters)
    })

    it('should handle cloning empty filter', () => {
      const cloned = filter.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('should not share counter array with original', () => {
      filter.add('shared')
      const cloned = filter.clone()
      filter.add('shared')
      expect(filter.count('shared')).toBe(2)
      expect(cloned.count('shared')).toBe(1)
    })

    it('should handle clone after clear', () => {
      filter.add('a')
      filter.clear()
      const cloned = filter.clone()
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  describe('merge', () => {
    it('should merge two compatible filters', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.01 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, errorRate: 0.01 })
      f1.add('a')
      f2.add('b')
      const merged = f1.merge(f2)
      expect(merged.size).toBe(2)
      expect(merged.has('a')).toBe(true)
      expect(merged.has('b')).toBe(true)
    })

    it('should return a new filter without modifying originals', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('a')
      f2.add('b')
      const merged = f1.merge(f2)
      expect(f1.has('b')).toBe(false)
      expect(f2.has('a')).toBe(false)
      expect(merged.has('a')).toBe(true)
      expect(merged.has('b')).toBe(true)
    })

    it('should sum counters during merge', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('x')
      f2.add('x')
      const merged = f1.merge(f2)
      expect(merged.count('x')).toBeGreaterThanOrEqual(2)
    })

    it('should throw on different numCounters', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 200 })
      expect(() => f1.merge(f2)).toThrow('number of counters')
    })

    it('should throw on different numHashes', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100, hashFunctions: 3 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, hashFunctions: 7 })
      expect(() => f1.merge(f2)).toThrow('hash functions')
    })

    it('should merge empty filters without error', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      const merged = f1.merge(f2)
      expect(merged.size).toBe(0)
    })

    it('should sum sizes', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('a')
      f1.add('b')
      f2.add('c')
      const merged = f1.merge(f2)
      expect(merged.size).toBe(3)
    })

    it('should work with filters having same config', () => {
      const opts = { expectedItems: 50, errorRate: 0.01 }
      const f1 = new CountingBloomFilter(opts)
      const f2 = new CountingBloomFilter(opts)
      f1.add('a')
      f2.add('b')
      const merged = f1.merge(f2)
      expect(merged.has('a')).toBe(true)
      expect(merged.has('b')).toBe(true)
    })

    it('should handle merge of filters with overlapping items', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('shared')
      f2.add('shared')
      const merged = f1.merge(f2)
      expect(merged.count('shared')).toBeGreaterThanOrEqual(2)
    })
  })

  describe('equals', () => {
    it('should return true for identical empty filters', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      expect(f1.equals(f2)).toBe(true)
    })

    it('should return true for filters with same items', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('a')
      f1.add('b')
      f2.add('a')
      f2.add('b')
      expect(f1.equals(f2)).toBe(true)
    })

    it('should return false for filters with different items', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('a')
      f2.add('b')
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return false for filters with different numCounters', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 200 })
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return false for filters with different numHashes', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100, hashFunctions: 3 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, hashFunctions: 7 })
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return true for cloned filter', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(filter.equals(cloned)).toBe(true)
    })

    it('should return false after modification', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('a')
      f2.add('a')
      expect(f1.equals(f2)).toBe(true)
      f2.add('b')
      expect(f1.equals(f2)).toBe(false)
    })

    it('should return true for same reference after no changes', () => {
      const f = new CountingBloomFilter({ expectedItems: 100 })
      expect(f.equals(f)).toBe(true)
    })

    it('should compare counter values exactly', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('x')
      f1.add('x')
      f2.add('x')
      expect(f1.equals(f2)).toBe(false)
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
      let found = 0
      for (let i = 0; i < 500; i++) {
        if (filter.has(`item-${i}`)) found++
      }
      expect(found).toBe(500)
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

    it('should handle single character items', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.has('a')).toBe(true)
      expect(filter.has('b')).toBe(true)
    })

    it('should handle unicode items', () => {
      filter.add('日本語')
      filter.add('🎉')
      expect(filter.has('日本語')).toBe(true)
      expect(filter.has('🎉')).toBe(true)
    })

    it('should handle very long string items', () => {
      const longString = 'a'.repeat(10000)
      filter.add(longString)
      expect(filter.has(longString)).toBe(true)
    })

    it('should handle special characters in items', () => {
      filter.add('hello\nworld')
      filter.add('tab\there')
      expect(filter.has('hello\nworld')).toBe(true)
      expect(filter.has('tab\there')).toBe(true)
    })

    it('should handle remove non-existent from populated filter', () => {
      filter.add('present')
      expect(filter.remove('absent')).toBe(false)
      expect(filter.size).toBe(1)
    })

    it('should handle large dataset', () => {
      const f = new CountingBloomFilter({ expectedItems: 10000, errorRate: 0.01 })
      for (let i = 0; i < 5000; i++) {
        f.add(`item-${i}`)
      }
      expect(f.size).toBe(5000)
      for (let i = 0; i < 5000; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle filter with hashFunctions override of 1', () => {
      const f = new CountingBloomFilter({ expectedItems: 100, hashFunctions: 1 })
      f.add('test')
      expect(f.has('test')).toBe(true)
      expect(f.numHashes).toBe(1)
    })

    it('should handle filter with large hashFunctions', () => {
      const f = new CountingBloomFilter({ expectedItems: 100, hashFunctions: 20 })
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle consecutive removes past zero gracefully', () => {
      filter.add('item')
      filter.remove('item')
      expect(filter.remove('item')).toBe(false)
    })

    it('should handle update with negative delta on empty filter', () => {
      filter.update('item', -10)
      expect(filter.count('item')).toBe(0)
    })

    it('should handle merge after modifications', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 100 })
      f1.add('a')
      f1.add('b')
      f1.remove('a')
      f2.add('c')
      const merged = f1.merge(f2)
      expect(merged.has('b')).toBe(true)
      expect(merged.has('c')).toBe(true)
    })
  })

  describe('exports', () => {
    it('should export CountingBloomFilter class', () => {
      expect(CountingBloomFilter).toBeDefined()
      expect(typeof CountingBloomFilter).toBe('function')
    })

    it('should allow type-only import for options', () => {
      const opts: CountingBloomFilterOptions = { expectedItems: 100 }
      const f = new CountingBloomFilter(opts)
      expect(f.capacity).toBe(100)
    })

    it('should work with generic type parameter', () => {
      const f = new CountingBloomFilter<number>()
      f.add(42)
      expect(f.has(42)).toBe(true)
    })
  })

  describe('Uint32Array counter behavior', () => {
    it('should support large counter values', () => {
      for (let i = 0; i < 1000; i++) {
        filter.add('big')
      }
      expect(filter.count('big')).toBe(1000)
    })

    it('should handle values up to Uint32 max via update', () => {
      filter.update('max', 100000)
      expect(filter.count('max')).toBe(100000)
    })
  })
})
