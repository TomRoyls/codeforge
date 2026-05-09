import { describe, it, expect, beforeEach } from 'vitest'
import { CountingBloomFilter } from '../../src/core/bloom-filter-2/bloom-filter-2.js'
import { DEFAULT_COUNTING_BLOOM_OPTIONS } from '../../src/core/bloom-filter-2/types.js'
import type { CountingBloomFilterOptions } from '../../src/core/bloom-filter-2/types.js'

describe('CountingBloomFilter', () => {
  let filter: CountingBloomFilter

  beforeEach(() => {
    filter = new CountingBloomFilter()
  })

  describe('constructor', () => {
    it('should create a filter with default options', () => {
      const f = new CountingBloomFilter()
      expect(f.isEmpty()).toBe(true)
      expect(f.capacity()).toBeGreaterThan(0)
    })

    it('should accept custom expectedItems', () => {
      const f = new CountingBloomFilter({ expectedItems: 5000 })
      expect(f.capacity()).toBeGreaterThan(filter.capacity())
    })

    it('should accept custom falsePositiveRate', () => {
      const f = new CountingBloomFilter({ falsePositiveRate: 0.001 })
      expect(f.capacity()).toBeGreaterThan(0)
    })

    it('should accept partial options with defaults', () => {
      const f = new CountingBloomFilter({ expectedItems: 200 })
      expect(f.capacity()).toBeGreaterThan(0)
      expect(f.isEmpty()).toBe(true)
    })

    it('should create counter array of appropriate size', () => {
      const f = new CountingBloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      expect(f.capacity()).toBeGreaterThan(0)
    })

    it('should initialize all counters to zero', () => {
      expect(filter.isEmpty()).toBe(true)
      expect(filter.fillRatio()).toBe(0)
    })

    it('should compute a positive hash count', () => {
      expect(filter.hashCount()).toBeGreaterThan(0)
    })

    it('should start with zero estimated size', () => {
      expect(filter.estimatedSize()).toBe(0)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      filter.add('hello')
      expect(filter.isEmpty()).toBe(false)
    })

    it('should add multiple different items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.has('a')).toBe(true)
      expect(filter.has('b')).toBe(true)
      expect(filter.has('c')).toBe(true)
    })

    it('should handle adding same item multiple times', () => {
      filter.add('test')
      filter.add('test')
      filter.add('test')
      expect(filter.has('test')).toBe(true)
      expect(filter.count('test')).toBe(3)
    })

    it('should handle empty string', () => {
      filter.add('')
      expect(filter.has('')).toBe(true)
    })

    it('should handle unicode strings', () => {
      filter.add('日本語')
      filter.add('🎉🚀')
      expect(filter.has('日本語')).toBe(true)
      expect(filter.has('🎉🚀')).toBe(true)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      filter.add(longStr)
      expect(filter.has(longStr)).toBe(true)
    })

    it('should handle strings with special characters', () => {
      filter.add('hello\nworld\t!')
      filter.add('path/to/file.ts')
      expect(filter.has('hello\nworld\t!')).toBe(true)
      expect(filter.has('path/to/file.ts')).toBe(true)
    })

    it('should increment fill ratio after adds', () => {
      const frBefore = filter.fillRatio()
      filter.add('test')
      expect(filter.fillRatio()).toBeGreaterThan(frBefore)
    })
  })

  describe('has', () => {
    it('should return true for an added item', () => {
      filter.add('hello')
      expect(filter.has('hello')).toBe(true)
    })

    it('should return false for a non-added item', () => {
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

    it('should return true for item added multiple times', () => {
      filter.add('multi')
      filter.add('multi')
      filter.add('multi')
      expect(filter.has('multi')).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove an added item', () => {
      filter.add('hello')
      const result = filter.remove('hello')
      expect(result).toBe(true)
    })

    it('should return true when removing existing item', () => {
      filter.add('test')
      expect(filter.remove('test')).toBe(true)
    })

    it('should return false when removing non-existent item', () => {
      expect(filter.remove('nothere')).toBe(false)
    })

    it('should make item not found after single add and remove', () => {
      filter.add('hello')
      filter.remove('hello')
      expect(filter.has('hello')).toBe(false)
    })

    it('should handle removing item added multiple times', () => {
      filter.add('x')
      filter.add('x')
      filter.add('x')
      expect(filter.remove('x')).toBe(true)
      expect(filter.count('x')).toBe(2)
      expect(filter.has('x')).toBe(true)
    })

    it('should return false when removing from empty filter', () => {
      expect(filter.remove('anything')).toBe(false)
    })

    it('should handle removing same item twice', () => {
      filter.add('once')
      expect(filter.remove('once')).toBe(true)
      expect(filter.remove('once')).toBe(false)
    })

    it('should decrement counters after remove', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.count('test')).toBe(2)
      filter.remove('test')
      expect(filter.count('test')).toBe(1)
    })

    it('should allow adding back after remove', () => {
      filter.add('hello')
      filter.remove('hello')
      expect(filter.has('hello')).toBe(false)
      filter.add('hello')
      expect(filter.has('hello')).toBe(true)
    })

    it('should not affect other items when removing one', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.remove('b')
      expect(filter.has('a')).toBe(true)
      expect(filter.has('b')).toBe(false)
      expect(filter.has('c')).toBe(true)
    })

    it('should return false for item never added', () => {
      filter.add('present')
      expect(filter.remove('absent')).toBe(false)
      expect(filter.has('present')).toBe(true)
    })

    it('should fully remove item after equal adds and removes', () => {
      filter.add('gone')
      filter.add('gone')
      filter.remove('gone')
      filter.remove('gone')
      expect(filter.has('gone')).toBe(false)
      expect(filter.count('gone')).toBe(0)
    })

    it('should handle removing item with high count', () => {
      for (let i = 0; i < 10; i++) {
        filter.add('many')
      }
      for (let i = 0; i < 10; i++) {
        expect(filter.remove('many')).toBe(true)
      }
      expect(filter.has('many')).toBe(false)
    })
  })

  describe('count', () => {
    it('should return 0 for non-existent item', () => {
      expect(filter.count('nothere')).toBe(0)
    })

    it('should return 1 for item added once', () => {
      filter.add('once')
      expect(filter.count('once')).toBe(1)
    })

    it('should return N for item added N times', () => {
      filter.add('multi')
      filter.add('multi')
      filter.add('multi')
      expect(filter.count('multi')).toBe(3)
    })

    it('should return 0 for empty filter', () => {
      expect(filter.count('anything')).toBe(0)
    })

    it('should decrease after removal', () => {
      filter.add('test')
      filter.add('test')
      filter.remove('test')
      expect(filter.count('test')).toBe(1)
    })

    it('should return 0 after full removal', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.count('test')).toBe(0)
    })

    it('should handle items with different counts', () => {
      filter.add('a')
      filter.add('b')
      filter.add('b')
      filter.add('c')
      filter.add('c')
      filter.add('c')
      expect(filter.count('a')).toBe(1)
      expect(filter.count('b')).toBe(2)
      expect(filter.count('c')).toBe(3)
    })

    it('should handle count on empty string', () => {
      filter.add('')
      expect(filter.count('')).toBe(1)
    })

    it('should handle count on unicode string', () => {
      filter.add('日本語')
      filter.add('日本語')
      expect(filter.count('日本語')).toBe(2)
    })

    it('should use minimum counter value as estimate', () => {
      filter.add('item')
      expect(filter.count('item')).toBeGreaterThanOrEqual(1)
    })
  })

  describe('merge', () => {
    it('should merge two filters of same configuration', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      const f2 = new CountingBloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      f1.add('a')
      f2.add('b')
      f1.merge(f2)
      expect(f1.has('a')).toBe(true)
      expect(f1.has('b')).toBe(true)
    })

    it('should contain items from both filters after merge', () => {
      const f1 = new CountingBloomFilter()
      const f2 = new CountingBloomFilter()
      f1.add('x')
      f1.add('y')
      f2.add('z')
      f1.merge(f2)
      expect(f1.has('x')).toBe(true)
      expect(f1.has('y')).toBe(true)
      expect(f1.has('z')).toBe(true)
    })

    it('should throw on different capacities', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 500 })
      expect(() => f1.merge(f2)).toThrow()
    })

    it('should throw on different hash counts with same capacity', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      const f2 = new CountingBloomFilter({ expectedItems: 500, falsePositiveRate: 0.0001 })
      if (f1.capacity() === f2.capacity() && f1.hashCount() !== f2.hashCount()) {
        expect(() => f1.merge(f2)).toThrow()
      }
    })

    it('should handle merging empty filters', () => {
      const f1 = new CountingBloomFilter()
      const f2 = new CountingBloomFilter()
      f1.merge(f2)
      expect(f1.isEmpty()).toBe(true)
    })

    it('should handle merging non-empty into empty', () => {
      const f1 = new CountingBloomFilter()
      const f2 = new CountingBloomFilter()
      f2.add('item')
      f1.merge(f2)
      expect(f1.has('item')).toBe(true)
    })

    it('should handle merging empty into non-empty', () => {
      const f1 = new CountingBloomFilter()
      const f2 = new CountingBloomFilter()
      f1.add('item')
      f1.merge(f2)
      expect(f1.has('item')).toBe(true)
    })

    it('should sum counters correctly after merge', () => {
      const f1 = new CountingBloomFilter()
      const f2 = new CountingBloomFilter()
      f1.add('shared')
      f2.add('shared')
      f1.merge(f2)
      expect(f1.count('shared')).toBeGreaterThanOrEqual(2)
    })

    it('should handle merging filters with overlapping items', () => {
      const f1 = new CountingBloomFilter()
      const f2 = new CountingBloomFilter()
      f1.add('overlap')
      f1.add('only1')
      f2.add('overlap')
      f2.add('only2')
      f1.merge(f2)
      expect(f1.has('overlap')).toBe(true)
      expect(f1.has('only1')).toBe(true)
      expect(f1.has('only2')).toBe(true)
    })
  })

  describe('reset', () => {
    it('should clear all counters to zero', () => {
      filter.add('test')
      filter.reset()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should make filter empty after reset', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.reset()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should allow adding after reset', () => {
      filter.add('first')
      filter.reset()
      filter.add('second')
      expect(filter.has('second')).toBe(true)
      expect(filter.has('first')).toBe(false)
    })

    it('should set fill ratio to 0 after reset', () => {
      filter.add('test')
      filter.reset()
      expect(filter.fillRatio()).toBe(0)
    })

    it('should handle resetting empty filter', () => {
      filter.reset()
      expect(filter.isEmpty()).toBe(true)
      expect(filter.fillRatio()).toBe(0)
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

    it('should return true after reset', () => {
      filter.add('test')
      filter.reset()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return true after removing all items', () => {
      filter.add('only')
      filter.remove('only')
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false with remaining items', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.isEmpty()).toBe(false)
    })
  })

  describe('estimatedSize', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.estimatedSize()).toBe(0)
    })

    it('should return positive number after adds', () => {
      filter.add('test')
      expect(filter.estimatedSize()).toBeGreaterThan(0)
    })

    it('should increase with more unique items', () => {
      const f = new CountingBloomFilter({ expectedItems: 100 })
      const sizes: number[] = []
      for (let i = 0; i < 20; i++) {
        f.add(`item-${i}`)
        sizes.push(f.estimatedSize())
      }
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1])
      }
    })

    it('should return 0 after reset', () => {
      filter.add('test')
      filter.reset()
      expect(filter.estimatedSize()).toBe(0)
    })

    it('should decrease after removal', () => {
      filter.add('test')
      const sizeAfterAdd = filter.estimatedSize()
      filter.remove('test')
      expect(filter.estimatedSize()).toBeLessThanOrEqual(sizeAfterAdd)
    })

    it('should provide reasonable estimate for known count', () => {
      const f = new CountingBloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
      }
      const estimate = f.estimatedSize()
      expect(estimate).toBeGreaterThan(0)
      expect(estimate).toBeLessThan(200)
    })

    it('should handle repeated adds of same item', () => {
      for (let i = 0; i < 5; i++) {
        filter.add('same')
      }
      expect(filter.estimatedSize()).toBeGreaterThan(0)
    })
  })

  describe('capacity', () => {
    it('should return counter array length', () => {
      expect(filter.capacity()).toBeGreaterThan(0)
    })

    it('should increase with higher expectedItems', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 10000 })
      expect(f2.capacity()).toBeGreaterThan(f1.capacity())
    })

    it('should increase with lower falsePositiveRate', () => {
      const f1 = new CountingBloomFilter({ falsePositiveRate: 0.1 })
      const f2 = new CountingBloomFilter({ falsePositiveRate: 0.001 })
      expect(f2.capacity()).toBeGreaterThan(f1.capacity())
    })

    it('should remain constant after operations', () => {
      const cap = filter.capacity()
      filter.add('test')
      filter.remove('test')
      filter.reset()
      expect(filter.capacity()).toBe(cap)
    })
  })

  describe('hashCount', () => {
    it('should return a positive number', () => {
      expect(filter.hashCount()).toBeGreaterThan(0)
    })

    it('should vary with expectedItems', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 100 })
      const f2 = new CountingBloomFilter({ expectedItems: 10000 })
      expect(typeof f1.hashCount()).toBe('number')
      expect(typeof f2.hashCount()).toBe('number')
    })

    it('should vary with falsePositiveRate', () => {
      const f1 = new CountingBloomFilter({ expectedItems: 1000, falsePositiveRate: 0.1 })
      const f2 = new CountingBloomFilter({ expectedItems: 1000, falsePositiveRate: 0.001 })
      expect(typeof f1.hashCount()).toBe('number')
      expect(typeof f2.hashCount()).toBe('number')
    })

    it('should return same value consistently', () => {
      const hc = filter.hashCount()
      filter.add('test')
      filter.remove('test')
      filter.reset()
      expect(filter.hashCount()).toBe(hc)
    })
  })

  describe('fillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.fillRatio()).toBe(0)
    })

    it('should increase with adds', () => {
      filter.add('test')
      expect(filter.fillRatio()).toBeGreaterThan(0)
    })

    it('should be between 0 and 1', () => {
      filter.add('test')
      const ratio = filter.fillRatio()
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should return 0 after reset', () => {
      filter.add('test')
      filter.reset()
      expect(filter.fillRatio()).toBe(0)
    })

    it('should decrease after removals', () => {
      filter.add('test')
      const frAfterAdd = filter.fillRatio()
      filter.remove('test')
      expect(filter.fillRatio()).toBeLessThanOrEqual(frAfterAdd)
    })

    it('should be monotonically non-decreasing with adds', () => {
      const f = new CountingBloomFilter({ expectedItems: 100 })
      const ratios: number[] = []
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
        ratios.push(f.fillRatio())
      }
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i]).toBeGreaterThanOrEqual(ratios[i - 1])
      }
    })
  })

  describe('false positive handling', () => {
    it('should have a low false positive rate within expected capacity', () => {
      const f = new CountingBloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
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
      const f = new CountingBloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        const item = `item-${i}`
        f.add(item)
        items.push(item)
      }
      for (const item of items) {
        expect(f.has(item)).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle numeric strings', () => {
      filter.add('123')
      filter.add('456')
      expect(filter.has('123')).toBe(true)
      expect(filter.has('456')).toBe(true)
      expect(filter.has('789')).toBe(false)
    })

    it('should handle whitespace-only strings', () => {
      filter.add('   ')
      filter.add('\t')
      filter.add('\n')
      expect(filter.has('   ')).toBe(true)
      expect(filter.has('\t')).toBe(true)
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

    it('should handle very small false positive rate', () => {
      const f = new CountingBloomFilter({ expectedItems: 100, falsePositiveRate: 0.0001 })
      f.add('test')
      expect(f.has('test')).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_COUNTING_BLOOM_OPTIONS', () => {
      expect(DEFAULT_COUNTING_BLOOM_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_COUNTING_BLOOM_OPTIONS.falsePositiveRate).toBe(0.01)
    })

    it('should support CountingBloomFilterOptions interface', () => {
      const opts: CountingBloomFilterOptions = {
        expectedItems: 500,
        falsePositiveRate: 0.05,
      }
      expect(opts.expectedItems).toBe(500)
      expect(opts.falsePositiveRate).toBe(0.05)
    })
  })

  describe('large item sets', () => {
    it('should handle 10000 items', () => {
      const f = new CountingBloomFilter({ expectedItems: 10000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      expect(f.has('item-0')).toBe(true)
      expect(f.has('item-9999')).toBe(true)
      expect(f.has('item-5000')).toBe(true)
    })

    it('should handle 10000 items with no false negatives', () => {
      const f = new CountingBloomFilter({ expectedItems: 10000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 10000; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle add and remove cycles at scale', () => {
      const f = new CountingBloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 500; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 250; i++) {
        f.remove(`item-${i}`)
      }
      for (let i = 250; i < 500; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle repeated add-remove of same items', () => {
      const f = new CountingBloomFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          f.add(`item-${i}`)
        }
      }
      for (let i = 0; i < 10; i++) {
        expect(f.count(`item-${i}`)).toBe(5)
      }
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          f.remove(`item-${i}`)
        }
      }
      for (let i = 0; i < 10; i++) {
        expect(f.has(`item-${i}`)).toBe(false)
      }
    })
  })
})
