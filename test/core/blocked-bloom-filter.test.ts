import { describe, it, expect, beforeEach } from 'vitest'
import { BlockedBloomFilter } from '../../src/core/blocked-bloom-filter/blocked-bloom-filter.js'
import { DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS } from '../../src/core/blocked-bloom-filter/types.js'
import type { BlockedBloomFilterOptions, BlockedBloomFilterJSON, BlockedBloomFilterStatistics } from '../../src/core/blocked-bloom-filter/types.js'

describe('BlockedBloomFilter', () => {
  let filter: BlockedBloomFilter

  beforeEach(() => {
    filter = new BlockedBloomFilter()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const f = new BlockedBloomFilter()
      expect(f.isEmpty).toBe(true)
      expect(f.size).toBe(0)
    })

    it('should accept expectedItems number', () => {
      const f = new BlockedBloomFilter(5000)
      expect(f.capacity()).toBe(5000)
    })

    it('should accept expectedItems and falsePositiveRate', () => {
      const f = new BlockedBloomFilter(500, 0.001)
      expect(f.capacity()).toBe(500)
    })

    it('should accept expectedItems, falsePositiveRate, and blockSize', () => {
      const f = new BlockedBloomFilter(500, 0.001, 512)
      expect(f.capacity()).toBe(500)
      expect(f.blockCount()).toBeGreaterThan(0)
    })

    it('should accept options object', () => {
      const f = new BlockedBloomFilter({ expectedItems: 200, falsePositiveRate: 0.05 })
      expect(f.capacity()).toBe(200)
    })

    it('should accept partial options with defaults', () => {
      const f = new BlockedBloomFilter({ expectedItems: 100 })
      expect(f.capacity()).toBe(100)
    })

    it('should accept only falsePositiveRate in options', () => {
      const f = new BlockedBloomFilter({ falsePositiveRate: 0.001 })
      expect(f.capacity()).toBe(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems)
    })

    it('should accept only blockSize in options', () => {
      const f = new BlockedBloomFilter({ blockSize: 512 })
      expect(f.bitSize()).toBeGreaterThan(0)
    })

    it('should use defaults when no args', () => {
      const f = new BlockedBloomFilter()
      expect(f.capacity()).toBe(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems)
    })

    it('should compute positive block count', () => {
      const f = new BlockedBloomFilter(1000, 0.01)
      expect(f.blockCount()).toBeGreaterThan(0)
    })

    it('should compute positive bit size', () => {
      const f = new BlockedBloomFilter(1000, 0.01)
      expect(f.bitSize()).toBeGreaterThan(0)
    })

    it('should use default block size of 256 bits', () => {
      const f = new BlockedBloomFilter(1000, 0.01)
      expect(f.bitSize() % 256).toBe(0)
    })

    it('should produce larger bit arrays for lower error rates', () => {
      const f1 = new BlockedBloomFilter(100, 0.1)
      const f2 = new BlockedBloomFilter(100, 0.001)
      expect(f2.bitSize()).toBeGreaterThan(f1.bitSize())
    })

    it('should produce larger bit arrays for larger capacities', () => {
      const f1 = new BlockedBloomFilter(100, 0.01)
      const f2 = new BlockedBloomFilter(10000, 0.01)
      expect(f2.bitSize()).toBeGreaterThan(f1.bitSize())
    })

    it('should handle undefined as first argument', () => {
      const f = new BlockedBloomFilter(undefined)
      expect(f.capacity()).toBe(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems)
    })

    it('should handle undefined as second argument', () => {
      const f = new BlockedBloomFilter(100, undefined)
      expect(f.capacity()).toBe(100)
    })

    it('should handle all undefined positional args', () => {
      const f = new BlockedBloomFilter(undefined, undefined, undefined)
      expect(f.capacity()).toBe(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems)
    })

    it('should use custom block size from options', () => {
      const f = new BlockedBloomFilter({ blockSize: 128 })
      expect(f.bitSize() % 128).toBe(0)
    })

    it('should have at least 1 block', () => {
      const f = new BlockedBloomFilter(1, 0.5)
      expect(f.blockCount()).toBeGreaterThanOrEqual(1)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      filter.add('hello')
      expect(filter.size).toBe(1)
      expect(filter.isEmpty).toBe(false)
    })

    it('should add multiple items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should add numbers', () => {
      const f = new BlockedBloomFilter<number>()
      f.add(1)
      f.add(2)
      f.add(3)
      expect(f.size).toBe(3)
    })

    it('should add objects', () => {
      const f = new BlockedBloomFilter<{ id: number }>()
      f.add({ id: 1 })
      f.add({ id: 2 })
      expect(f.size).toBe(2)
    })

    it('should increment statistics adds counter', () => {
      filter.add('x')
      filter.add('y')
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(2)
    })

    it('should increment hash computations on add', () => {
      filter.add('test')
      const stats = filter.getStatistics()
      expect(stats.hashComputations).toBeGreaterThan(0)
    })

    it('should increment blocks stat on add', () => {
      filter.add('test')
      const stats = filter.getStatistics()
      expect(stats.blocks).toBe(1)
    })

    it('should handle adding the same item twice', () => {
      filter.add('same')
      filter.add('same')
      expect(filter.size).toBe(2)
    })

    it('should handle adding empty string', () => {
      filter.add('')
      expect(filter.size).toBe(1)
    })

    it('should handle adding null-like values', () => {
      const f = new BlockedBloomFilter<string | number>()
      f.add('0')
      f.add(0)
      expect(f.size).toBe(2)
    })

    it('should handle adding many items', () => {
      for (let i = 0; i < 1000; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(1000)
    })
  })

  describe('has', () => {
    it('should return true for added items', () => {
      filter.add('hello')
      expect(filter.has('hello')).toBe(true)
    })

    it('should return false for non-added items', () => {
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

    it('should handle numbers', () => {
      const f = new BlockedBloomFilter<number>()
      f.add(42)
      expect(f.has(42)).toBe(true)
    })

    it('should handle objects', () => {
      const f = new BlockedBloomFilter<{ id: number }>()
      const obj = { id: 1 }
      f.add(obj)
      expect(f.has(obj)).toBe(true)
    })

    it('should handle empty string', () => {
      filter.add('')
      expect(filter.has('')).toBe(true)
    })

    it('should increment lookups stat', () => {
      filter.add('x')
      filter.has('x')
      filter.has('y')
      const stats = filter.getStatistics()
      expect(stats.lookups).toBe(2)
    })

    it('should increment hash computations on lookup', () => {
      filter.add('test')
      filter.has('test')
      const stats = filter.getStatistics()
      expect(stats.hashComputations).toBeGreaterThan(0)
    })

    it('should increment estimatedFalsePositives when has returns true', () => {
      filter.add('test')
      filter.has('test')
      const stats = filter.getStatistics()
      expect(stats.estimatedFalsePositives).toBe(1)
    })

    it('should not increment estimatedFalsePositives when has returns false', () => {
      filter.add('test')
      filter.has('other')
      const stats = filter.getStatistics()
      expect(stats.estimatedFalsePositives).toBe(0)
    })

    it('should handle same item added multiple times', () => {
      filter.add('dup')
      filter.add('dup')
      expect(filter.has('dup')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all items', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('should reset has after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.has('test')).toBe(false)
    })

    it('should reset fill ratio after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.estimatedFillRatio()).toBe(0)
    })

    it('should reset statistics after clear', () => {
      filter.add('a')
      filter.has('a')
      filter.clear()
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.blocks).toBe(0)
      expect(stats.hashComputations).toBe(0)
      expect(stats.estimatedFalsePositives).toBe(0)
    })

    it('should allow adding after clear', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.size).toBe(1)
      expect(filter.has('after')).toBe(true)
    })

    it('should work on already empty filter', () => {
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })
  })

  describe('estimatedFillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.estimatedFillRatio()).toBe(0)
    })

    it('should return positive value after adding items', () => {
      filter.add('test')
      expect(filter.estimatedFillRatio()).toBeGreaterThan(0)
    })

    it('should increase as more items are added', () => {
      const ratios: number[] = []
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
        ratios.push(filter.estimatedFillRatio())
      }
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i]!).toBeGreaterThanOrEqual(ratios[i - 1]!)
      }
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      const ratio = filter.estimatedFillRatio()
      expect(ratio).toBeGreaterThanOrEqual(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should reset to 0 after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.estimatedFillRatio()).toBe(0)
    })
  })

  describe('expectedFalsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should return positive value after adding items', () => {
      filter.add('test')
      expect(filter.expectedFalsePositiveRate()).toBeGreaterThanOrEqual(0)
    })

    it('should increase as filter fills up', () => {
      const f = new BlockedBloomFilter(100, 0.01)
      const rates: number[] = []
      for (let i = 0; i < 80; i++) {
        f.add(`item-${i}`)
        rates.push(f.expectedFalsePositiveRate())
      }
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i]!).toBeGreaterThanOrEqual(rates[i - 1]!)
      }
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      const rate = filter.expectedFalsePositiveRate()
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })
  })

  describe('capacity', () => {
    it('should return expected items from options', () => {
      const f = new BlockedBloomFilter(500)
      expect(f.capacity()).toBe(500)
    })

    it('should return default when not specified', () => {
      const f = new BlockedBloomFilter()
      expect(f.capacity()).toBe(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems)
    })
  })

  describe('size', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.size).toBe(0)
    })

    it('should reflect number of added items', () => {
      filter.add('a')
      expect(filter.size).toBe(1)
      filter.add('b')
      expect(filter.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new filter', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('should return false after adding items', () => {
      filter.add('test')
      expect(filter.isEmpty).toBe(false)
    })

    it('should return true after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })
  })

  describe('bitSize', () => {
    it('should return total bits across all blocks', () => {
      const f = new BlockedBloomFilter(1000, 0.01)
      expect(f.bitSize()).toBe(f.blockCount() * DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.blockSize)
    })

    it('should be multiple of block size', () => {
      const f = new BlockedBloomFilter(1000, 0.01)
      expect(f.bitSize() % DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.blockSize).toBe(0)
    })

    it('should respect custom block size', () => {
      const f = new BlockedBloomFilter({ expectedItems: 1000, blockSize: 128 })
      expect(f.bitSize() % 128).toBe(0)
    })
  })

  describe('blockCount', () => {
    it('should return positive number', () => {
      expect(filter.blockCount()).toBeGreaterThan(0)
    })

    it('should increase with more expected items', () => {
      const f1 = new BlockedBloomFilter(100, 0.01)
      const f2 = new BlockedBloomFilter(10000, 0.01)
      expect(f2.blockCount()).toBeGreaterThanOrEqual(f1.blockCount())
    })
  })

  describe('union', () => {
    it('should produce a filter that has items from both', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      f1.add('a')
      f1.add('b')
      f2.add('c')
      f2.add('d')
      const union = f1.union(f2)
      expect(union.has('a')).toBe(true)
      expect(union.has('b')).toBe(true)
      expect(union.has('c')).toBe(true)
      expect(union.has('d')).toBe(true)
    })

    it('should produce a new filter without modifying originals', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      f1.add('a')
      f2.add('b')
      const union = f1.union(f2)
      expect(union).not.toBe(f1)
      expect(union).not.toBe(f2)
      expect(f1.has('b')).toBe(false)
      expect(f2.has('a')).toBe(false)
    })

    it('should use max size of the two filters', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      f1.add('a')
      f1.add('b')
      f1.add('c')
      f2.add('d')
      const union = f1.union(f2)
      expect(union.size).toBe(3)
    })

    it('should throw on different block counts', () => {
      const f1 = new BlockedBloomFilter(100, 0.01)
      const f2 = new BlockedBloomFilter(10000, 0.01)
      expect(() => f1.union(f2)).toThrow('Cannot union filters with different block counts')
    })

    it('should throw on different block sizes', () => {
      const f1 = new BlockedBloomFilter({ expectedItems: 100, blockSize: 256 })
      const f2 = new BlockedBloomFilter({ expectedItems: 100, blockSize: 128 })
      expect(() => f1.union(f2)).toThrow('Cannot union filters with different block sizes')
    })

    it('should work with empty filters', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      const union = f1.union(f2)
      expect(union.isEmpty).toBe(true)
    })

    it('should work when one filter is empty', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      f1.add('a')
      const union = f1.union(f2)
      expect(union.has('a')).toBe(true)
      expect(union.size).toBe(1)
    })
  })

  describe('intersection', () => {
    it('should produce a filter with bits from both', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      f1.add('shared')
      f2.add('shared')
      const intersect = f1.intersection(f2)
      expect(intersect.has('shared')).toBe(true)
    })

    it('should produce a new filter without modifying originals', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      f1.add('a')
      f2.add('b')
      const intersect = f1.intersection(f2)
      expect(intersect).not.toBe(f1)
      expect(intersect).not.toBe(f2)
    })

    it('should use min size of the two filters', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      f1.add('a')
      f1.add('b')
      f1.add('c')
      f2.add('d')
      const intersect = f1.intersection(f2)
      expect(intersect.size).toBe(1)
    })

    it('should throw on different block counts', () => {
      const f1 = new BlockedBloomFilter(100, 0.01)
      const f2 = new BlockedBloomFilter(10000, 0.01)
      expect(() => f1.intersection(f2)).toThrow('Cannot intersect filters with different block counts')
    })

    it('should throw on different block sizes', () => {
      const f1 = new BlockedBloomFilter({ expectedItems: 100, blockSize: 256 })
      const f2 = new BlockedBloomFilter({ expectedItems: 100, blockSize: 128 })
      expect(() => f1.intersection(f2)).toThrow('Cannot intersect filters with different block sizes')
    })

    it('should work with empty filters', () => {
      const f1 = new BlockedBloomFilter<string>(100, 0.01)
      const f2 = new BlockedBloomFilter<string>(100, 0.01)
      const intersect = f1.intersection(f2)
      expect(intersect.isEmpty).toBe(true)
    })
  })

  describe('toJSON', () => {
    it('should return valid JSON structure', () => {
      filter.add('test')
      const json = filter.toJSON()
      expect(json).toHaveProperty('blocks')
      expect(json).toHaveProperty('blockSize')
      expect(json).toHaveProperty('blockCount')
      expect(json).toHaveProperty('hashCount')
      expect(json).toHaveProperty('expectedItems')
      expect(json).toHaveProperty('targetFalsePositiveRate')
      expect(json).toHaveProperty('itemCount')
      expect(json).toHaveProperty('statistics')
    })

    it('should include correct block count', () => {
      const json = filter.toJSON()
      expect(json.blockCount).toBe(filter.blockCount())
    })

    it('should include correct item count', () => {
      filter.add('a')
      filter.add('b')
      const json = filter.toJSON()
      expect(json.itemCount).toBe(2)
    })

    it('should include correct block size', () => {
      const json = filter.toJSON()
      expect(json.blockSize).toBe(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.blockSize)
    })

    it('should include statistics', () => {
      filter.add('a')
      const json = filter.toJSON()
      expect(json.statistics.adds).toBe(1)
    })

    it('should serialize blocks as number arrays', () => {
      filter.add('test')
      const json = filter.toJSON()
      expect(Array.isArray(json.blocks)).toBe(true)
      expect(json.blocks.length).toBe(filter.blockCount())
      for (const block of json.blocks) {
        expect(Array.isArray(block)).toBe(true)
      }
    })
  })

  describe('fromJSON', () => {
    it('should reconstruct filter from JSON', () => {
      const original = new BlockedBloomFilter<string>(100, 0.01)
      original.add('hello')
      original.add('world')
      const json = original.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      expect(restored.has('hello')).toBe(true)
      expect(restored.has('world')).toBe(true)
    })

    it('should preserve item count', () => {
      const original = new BlockedBloomFilter<string>(100, 0.01)
      original.add('a')
      original.add('b')
      original.add('c')
      const json = original.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      expect(restored.size).toBe(3)
    })

    it('should preserve block count', () => {
      const original = new BlockedBloomFilter<string>(100, 0.01)
      const json = original.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      expect(restored.blockCount()).toBe(original.blockCount())
    })

    it('should preserve statistics', () => {
      const original = new BlockedBloomFilter<string>(100, 0.01)
      original.add('a')
      original.has('a')
      const json = original.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      const stats = restored.getStatistics()
      expect(stats.adds).toBe(1)
      expect(stats.lookups).toBe(1)
    })

    it('should allow adding items after restore', () => {
      const original = new BlockedBloomFilter<string>(100, 0.01)
      original.add('a')
      const json = original.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      restored.add('b')
      expect(restored.size).toBe(2)
      expect(restored.has('b')).toBe(true)
    })

    it('should produce a filter independent of the original', () => {
      const original = new BlockedBloomFilter<string>(100, 0.01)
      original.add('a')
      const json = original.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      restored.add('b')
      expect(original.size).toBe(1)
      expect(restored.size).toBe(2)
    })
  })

  describe('getStatistics', () => {
    it('should return initial zero statistics', () => {
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.blocks).toBe(0)
      expect(stats.hashComputations).toBe(0)
      expect(stats.estimatedFalsePositives).toBe(0)
    })

    it('should track adds correctly', () => {
      for (let i = 0; i < 10; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.getStatistics().adds).toBe(10)
    })

    it('should track lookups correctly', () => {
      filter.add('test')
      filter.has('a')
      filter.has('b')
      filter.has('c')
      expect(filter.getStatistics().lookups).toBe(3)
    })

    it('should track hash computations', () => {
      filter.add('test')
      const stats = filter.getStatistics()
      expect(stats.hashComputations).toBeGreaterThan(0)
    })

    it('should track estimated false positives', () => {
      filter.add('test')
      filter.has('test')
      expect(filter.getStatistics().estimatedFalsePositives).toBe(1)
    })

    it('should return a copy of statistics', () => {
      filter.add('test')
      const stats1 = filter.getStatistics()
      filter.add('test2')
      expect(stats1.adds).toBe(1)
      expect(filter.getStatistics().adds).toBe(2)
    })

    it('should track blocks stat', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.getStatistics().blocks).toBe(2)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      expect(typeof filter[Symbol.iterator]).toBe('function')
    })

    it('should return an iterator', () => {
      const iter = filter[Symbol.iterator]()
      expect(iter).toHaveProperty('next')
      expect(typeof iter.next).toBe('function')
    })

    it('should yield no items', () => {
      filter.add('a')
      filter.add('b')
      const items = [...filter]
      expect(items.length).toBe(0)
    })

    it('should have done=true on first next call', () => {
      const iter = filter[Symbol.iterator]()
      const result = iter.next()
      expect(result.done).toBe(true)
    })
  })

  describe('correctness', () => {
    it('should have no false negatives', () => {
      const f = new BlockedBloomFilter<string>(1000, 0.01)
      const items: string[] = []
      for (let i = 0; i < 500; i++) {
        const item = `item-${i}`
        f.add(item)
        items.push(item)
      }
      for (const item of items) {
        expect(f.has(item)).toBe(true)
      }
    })

    it('should have low false positive rate', () => {
      const f = new BlockedBloomFilter<string>(10000, 0.01)
      for (let i = 0; i < 5000; i++) {
        f.add(`item-${i}`)
      }
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (f.has(`nonexistent-${i}`)) {
          falsePositives++
        }
      }
      const observedFPR = falsePositives / trials
      expect(observedFPR).toBeLessThan(0.1)
    })

    it('should work with custom block size 128', () => {
      const f = new BlockedBloomFilter<string>({ expectedItems: 100, falsePositiveRate: 0.01, blockSize: 128 })
      f.add('test')
      expect(f.has('test')).toBe(true)
      expect(f.bitSize() % 128).toBe(0)
    })

    it('should work with custom block size 512', () => {
      const f = new BlockedBloomFilter<string>({ expectedItems: 100, falsePositiveRate: 0.01, blockSize: 512 })
      f.add('test')
      expect(f.has('test')).toBe(true)
      expect(f.bitSize() % 512).toBe(0)
    })

    it('should work with very small expected items', () => {
      const f = new BlockedBloomFilter(1, 0.01)
      f.add('only')
      expect(f.has('only')).toBe(true)
    })

    it('should work with high false positive rate', () => {
      const f = new BlockedBloomFilter(100, 0.5)
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle sequential add and has operations', () => {
      const f = new BlockedBloomFilter<string>(100, 0.01)
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
        for (let j = 0; j <= i; j++) {
          expect(f.has(`item-${j}`)).toBe(true)
        }
      }
    })

    it('should maintain correctness after clear and re-add', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`batch1-${i}`)
      }
      filter.clear()
      for (let i = 0; i < 100; i++) {
        filter.add(`batch2-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(filter.has(`batch2-${i}`)).toBe(true)
      }
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS', () => {
      expect(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS).toBeDefined()
      expect(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.falsePositiveRate).toBe(0.01)
      expect(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.blockSize).toBe(256)
    })

    it('should export BlockedBloomFilter class', () => {
      expect(BlockedBloomFilter).toBeDefined()
      const f = new BlockedBloomFilter()
      expect(f).toBeInstanceOf(BlockedBloomFilter)
    })
  })

  describe('type imports', () => {
    it('should work with type-only imports', () => {
      const opts: BlockedBloomFilterOptions = {
        expectedItems: 100,
        falsePositiveRate: 0.01,
        blockSize: 256,
      }
      const f = new BlockedBloomFilter(opts)
      expect(f.capacity()).toBe(100)
    })

    it('should work with BlockedBloomFilterJSON type', () => {
      const f = new BlockedBloomFilter<string>(100, 0.01)
      f.add('test')
      const json: BlockedBloomFilterJSON = f.toJSON()
      expect(json.itemCount).toBe(1)
    })

    it('should work with BlockedBloomFilterStatistics type', () => {
      const f = new BlockedBloomFilter<string>(100, 0.01)
      f.add('test')
      const stats: BlockedBloomFilterStatistics = f.getStatistics()
      expect(stats.adds).toBe(1)
    })
  })
})
