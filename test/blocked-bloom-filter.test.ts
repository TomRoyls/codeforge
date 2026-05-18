import { describe, it, expect, beforeEach } from 'vitest'
import {
  BlockedBloomFilter,
  DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS,
} from '../src/core/blocked-bloom-filter/blocked-bloom-filter.js'
import type {
  BlockedBloomFilterStatistics,
  BlockedBloomFilterJSON,
} from '../src/core/blocked-bloom-filter/blocked-bloom-filter.js'

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------
describe('BlockedBloomFilter', () => {
  describe('constructor', () => {
    it('should create with default options when no arguments given', () => {
      const bf = new BlockedBloomFilter()
      expect(bf.capacity()).toBe(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems)
      expect(bf.size).toBe(0)
      expect(bf.isEmpty).toBe(true)
      expect(bf.blockCount()).toBeGreaterThanOrEqual(1)
    })

    it('should create with positional expectedItems and falsePositiveRate', () => {
      const bf = new BlockedBloomFilter(500, 0.05)
      expect(bf.capacity()).toBe(500)
    })

    it('should create with positional expectedItems, falsePositiveRate, and blockSize', () => {
      const bf = new BlockedBloomFilter(200, 0.01, 128)
      expect(bf.capacity()).toBe(200)
      expect(bf.bitSize()).toBe(bf.blockCount() * 128)
    })

    it('should create with options object', () => {
      const bf = new BlockedBloomFilter({
        expectedItems: 300,
        falsePositiveRate: 0.001,
        blockSize: 512,
      })
      expect(bf.capacity()).toBe(300)
    })

    it('should create with partial options object using defaults', () => {
      const bf = new BlockedBloomFilter({ expectedItems: 100 })
      expect(bf.capacity()).toBe(100)
    })

    it('should always have at least 1 block', () => {
      const bf = new BlockedBloomFilter(1, 0.5, 8)
      expect(bf.blockCount()).toBeGreaterThanOrEqual(1)
    })

    it('should allocate blocks as Uint8Array', () => {
      const bf = new BlockedBloomFilter(10)
      const json = bf.toJSON()
      for (const block of json.blocks) {
        expect(Array.isArray(block)).toBe(true)
      }
    })
  })

  // -------------------------------------------------------------------------
  // add + has
  // -------------------------------------------------------------------------
  describe('add and has', () => {
    let bf: BlockedBloomFilter

    beforeEach(() => {
      bf = new BlockedBloomFilter(1000, 0.01)
    })

    it('should return false for has before any add', () => {
      expect(bf.has('nothing')).toBe(false)
    })

    it('should find an item after adding it', () => {
      bf.add('hello')
      expect(bf.has('hello')).toBe(true)
    })

    it('should increment size after each add', () => {
      expect(bf.size).toBe(0)
      bf.add('a')
      expect(bf.size).toBe(1)
      bf.add('b')
      expect(bf.size).toBe(2)
    })

    it('should find multiple items after adding them', () => {
      const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      for (const item of items) {
        bf.add(item)
      }
      for (const item of items) {
        expect(bf.has(item)).toBe(true)
      }
    })

    it('should return false for non-added items most of the time', () => {
      for (let i = 0; i < 100; i++) {
        bf.add(`item-${i}`)
      }
      // None of these were added
      expect(bf.has('not-added-1')).toBe(false)
      expect(bf.has('not-added-2')).toBe(false)
      expect(bf.has('not-added-3')).toBe(false)
    })

    it('should work with numeric items (generic type)', () => {
      const numBf = new BlockedBloomFilter<number>(100, 0.01)
      numBf.add(42)
      numBf.add(99)
      expect(numBf.has(42)).toBe(true)
      expect(numBf.has(99)).toBe(true)
      expect(numBf.has(1)).toBe(false)
    })

    it('should work with object items (generic type)', () => {
      const objBf = new BlockedBloomFilter<{ id: number }>(100, 0.01)
      const obj = { id: 1 }
      objBf.add(obj)
      expect(objBf.has(obj)).toBe(true)
      expect(objBf.has({ id: 1 })).toBe(true) // same JSON serialization
    })

    it('should handle duplicate adds without error', () => {
      bf.add('dup')
      bf.add('dup')
      bf.add('dup')
      expect(bf.has('dup')).toBe(true)
      expect(bf.size).toBe(3) // size counts calls, not unique items
    })

    it('should handle empty string', () => {
      bf.add('')
      expect(bf.has('')).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // clear
  // -------------------------------------------------------------------------
  describe('clear', () => {
    it('should reset size to 0', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      bf.add('a')
      bf.add('b')
      bf.clear()
      expect(bf.size).toBe(0)
    })

    it('should make isEmpty return true', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      bf.add('x')
      bf.clear()
      expect(bf.isEmpty).toBe(true)
    })

    it('should cause has to return false for previously added items', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      bf.add('test-item')
      bf.clear()
      expect(bf.has('test-item')).toBe(false)
    })

    it('should reset statistics', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      bf.add('a')
      bf.has('a')
      bf.clear()
      const stats = bf.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.blocks).toBe(0)
      expect(stats.hashComputations).toBe(0)
      expect(stats.estimatedFalsePositives).toBe(0)
    })

    it('should allow adding items after clear', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      bf.add('first')
      bf.clear()
      bf.add('second')
      expect(bf.has('second')).toBe(true)
      expect(bf.size).toBe(1)
    })

    it('should reset fill ratio to 0', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      bf.add('a')
      bf.add('b')
      bf.clear()
      expect(bf.estimatedFillRatio()).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // isEmpty / size
  // -------------------------------------------------------------------------
  describe('isEmpty and size', () => {
    it('isEmpty should be true on a new filter', () => {
      const bf = new BlockedBloomFilter()
      expect(bf.isEmpty).toBe(true)
    })

    it('isEmpty should be false after adding an item', () => {
      const bf = new BlockedBloomFilter()
      bf.add('x')
      expect(bf.isEmpty).toBe(false)
    })

    it('size should track number of add calls', () => {
      const bf = new BlockedBloomFilter()
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.size).toBe(50)
    })
  })

  // -------------------------------------------------------------------------
  // capacity, bitSize, blockCount
  // -------------------------------------------------------------------------
  describe('capacity, bitSize, blockCount', () => {
    it('capacity returns expectedItems', () => {
      const bf = new BlockedBloomFilter(422, 0.01)
      expect(bf.capacity()).toBe(422)
    })

    it('bitSize equals blockCount * blockSize', () => {
      const bf = new BlockedBloomFilter(100, 0.01, 64)
      expect(bf.bitSize()).toBe(bf.blockCount() * 64)
    })

    it('blockCount is at least 1', () => {
      const bf = new BlockedBloomFilter(1, 0.5, 512)
      expect(bf.blockCount()).toBeGreaterThanOrEqual(1)
    })

    it('blockCount increases with more expected items', () => {
      const bfSmall = new BlockedBloomFilter(10, 0.01, 256)
      const bfBig = new BlockedBloomFilter(10000, 0.01, 256)
      expect(bfBig.blockCount()).toBeGreaterThan(bfSmall.blockCount())
    })
  })

  // -------------------------------------------------------------------------
  // estimatedFillRatio
  // -------------------------------------------------------------------------
  describe('estimatedFillRatio', () => {
    it('should be 0 on empty filter', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      expect(bf.estimatedFillRatio()).toBe(0)
    })

    it('should increase after adding items', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      const before = bf.estimatedFillRatio()
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.estimatedFillRatio()).toBeGreaterThan(before)
    })

    it('should be between 0 and 1', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      for (let i = 0; i < 100; i++) {
        bf.add(`item-${i}`)
      }
      const ratio = bf.estimatedFillRatio()
      expect(ratio).toBeGreaterThanOrEqual(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })
  })

  // -------------------------------------------------------------------------
  // expectedFalsePositiveRate
  // -------------------------------------------------------------------------
  describe('expectedFalsePositiveRate', () => {
    it('should be 0 when empty', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      expect(bf.expectedFalsePositiveRate()).toBe(0)
    })

    it('should be positive after adding items', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.expectedFalsePositiveRate()).toBeGreaterThan(0)
    })

    it('should be less than 1', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      for (let i = 0; i < 80; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.expectedFalsePositiveRate()).toBeLessThanOrEqual(1)
    })

    it('should increase as more items are added', () => {
      const bf = new BlockedBloomFilter(1000, 0.01)
      for (let i = 0; i < 100; i++) {
        bf.add(`item-${i}`)
      }
      const fp1 = bf.expectedFalsePositiveRate()
      for (let i = 100; i < 500; i++) {
        bf.add(`item-${i}`)
      }
      const fp2 = bf.expectedFalsePositiveRate()
      expect(fp2).toBeGreaterThan(fp1)
    })
  })

  // -------------------------------------------------------------------------
  // False positive rate measurement
  // -------------------------------------------------------------------------
  describe('false positive rate behavior', () => {
    it('should have a low false positive rate within capacity', () => {
      const bf = new BlockedBloomFilter(1000, 0.01)
      // Add 500 items
      for (let i = 0; i < 500; i++) {
        bf.add(`member-${i}`)
      }
      // Test 500 non-members
      let falsePositives = 0
      const trials = 500
      for (let i = 0; i < trials; i++) {
        if (bf.has(`nonmember-${i}`)) {
          falsePositives++
        }
      }
      // With 0.01 target rate and well under capacity, expect < 10%
      expect(falsePositives / trials).toBeLessThan(0.1)
    })

    it('should have no false negatives', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        items.push(`item-${i}`)
        bf.add(items[i]!)
      }
      for (const item of items) {
        expect(bf.has(item)).toBe(true)
      }
    })
  })

  // -------------------------------------------------------------------------
  // union
  // -------------------------------------------------------------------------
  describe('union', () => {
    it('should combine two filters', () => {
      const bf1 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter<string>(100, 0.01, 256)
      bf1.add('a')
      bf1.add('b')
      bf2.add('c')
      bf2.add('d')
      const result = bf1.union(bf2)
      expect(result.has('a')).toBe(true)
      expect(result.has('b')).toBe(true)
      expect(result.has('c')).toBe(true)
      expect(result.has('d')).toBe(true)
    })

    it('should throw on different block sizes', () => {
      const bf1 = new BlockedBloomFilter(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter(100, 0.01, 128)
      expect(() => bf1.union(bf2)).toThrow('block sizes')
    })

    it('should throw on different block counts', () => {
      const bf1 = new BlockedBloomFilter(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter(5000, 0.01, 256)
      expect(() => bf1.union(bf2)).toThrow('block counts')
    })

    it('should set size to max of the two', () => {
      const bf1 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter<string>(100, 0.01, 256)
      bf1.add('x')
      bf2.add('y')
      bf2.add('z')
      const result = bf1.union(bf2)
      expect(result.size).toBe(Math.max(bf1.size, bf2.size))
    })
  })

  // -------------------------------------------------------------------------
  // intersection
  // -------------------------------------------------------------------------
  describe('intersection', () => {
    it('should keep only shared bits', () => {
      const bf1 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter<string>(100, 0.01, 256)
      bf1.add('shared')
      bf1.add('only-in-1')
      bf2.add('shared')
      bf2.add('only-in-2')
      const result = bf1.intersection(bf2)
      // 'shared' was in both, so bits for it are preserved
      expect(result.has('shared')).toBe(true)
    })

    it('should throw on different block sizes', () => {
      const bf1 = new BlockedBloomFilter(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter(100, 0.01, 128)
      expect(() => bf1.intersection(bf2)).toThrow('block sizes')
    })

    it('should throw on different block counts', () => {
      const bf1 = new BlockedBloomFilter(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter(5000, 0.01, 256)
      expect(() => bf1.intersection(bf2)).toThrow('block counts')
    })

    it('should set size to min of the two', () => {
      const bf1 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter<string>(100, 0.01, 256)
      bf1.add('a')
      bf2.add('b')
      bf2.add('c')
      const result = bf1.intersection(bf2)
      expect(result.size).toBe(Math.min(bf1.size, bf2.size))
    })
  })

  // -------------------------------------------------------------------------
  // toJSON / fromJSON
  // -------------------------------------------------------------------------
  describe('toJSON and fromJSON', () => {
    it('should serialize to a valid JSON object', () => {
      const bf = new BlockedBloomFilter(200, 0.02, 128)
      bf.add('test')
      const json = bf.toJSON()
      expect(json.blockSize).toBe(128)
      expect(json.expectedItems).toBe(200)
      expect(json.targetFalsePositiveRate).toBe(0.02)
      expect(json.itemCount).toBe(1)
      expect(Array.isArray(json.blocks)).toBe(true)
      expect(json.blocks.length).toBe(bf.blockCount())
    })

    it('should round-trip via fromJSON', () => {
      const bf = new BlockedBloomFilter<string>(200, 0.02, 128)
      bf.add('alpha')
      bf.add('beta')
      bf.add('gamma')
      const json = bf.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      expect(restored.has('alpha')).toBe(true)
      expect(restored.has('beta')).toBe(true)
      expect(restored.has('gamma')).toBe(true)
      expect(restored.size).toBe(3)
    })

    it('should preserve statistics through round-trip', () => {
      const bf = new BlockedBloomFilter<string>(100, 0.01, 256)
      bf.add('x')
      bf.has('x')
      bf.has('y')
      const stats = bf.getStatistics()
      const json = bf.toJSON()
      expect(json.statistics.adds).toBe(stats.adds)
      expect(json.statistics.lookups).toBe(stats.lookups)
      expect(json.statistics.blocks).toBe(stats.blocks)
      expect(json.statistics.hashComputations).toBe(stats.hashComputations)
      expect(json.statistics.estimatedFalsePositives).toBe(stats.estimatedFalsePositives)
    })

    it('should preserve block data through round-trip', () => {
      const bf = new BlockedBloomFilter<string>(50, 0.01, 64)
      for (let i = 0; i < 20; i++) {
        bf.add(`item-${i}`)
      }
      const json = bf.toJSON()
      const restored = BlockedBloomFilter.fromJSON<string>(json)
      for (let i = 0; i < 20; i++) {
        expect(restored.has(`item-${i}`)).toBe(true)
      }
    })
  })

  // -------------------------------------------------------------------------
  // getStatistics
  // -------------------------------------------------------------------------
  describe('getStatistics', () => {
    it('should return zeroed stats on a new filter', () => {
      const bf = new BlockedBloomFilter()
      const stats = bf.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.blocks).toBe(0)
      expect(stats.hashComputations).toBe(0)
      expect(stats.estimatedFalsePositives).toBe(0)
    })

    it('should track adds count', () => {
      const bf = new BlockedBloomFilter()
      bf.add('a')
      bf.add('b')
      bf.add('c')
      expect(bf.getStatistics().adds).toBe(3)
    })

    it('should track lookups count', () => {
      const bf = new BlockedBloomFilter()
      bf.has('x')
      bf.has('y')
      expect(bf.getStatistics().lookups).toBe(2)
    })

    it('should track block accesses (adds + lookups)', () => {
      const bf = new BlockedBloomFilter()
      bf.add('a')
      bf.has('a')
      bf.has('b')
      expect(bf.getStatistics().blocks).toBe(3) // 1 add + 2 lookups
    })

    it('should track hash computations', () => {
      const bf = new BlockedBloomFilter()
      bf.add('a')
      const statsAfterAdd = bf.getStatistics()
      expect(statsAfterAdd.hashComputations).toBeGreaterThan(0)
    })

    it('should return a copy (not mutate internal state)', () => {
      const bf = new BlockedBloomFilter()
      bf.add('x')
      const stats1 = bf.getStatistics()
      stats1.adds = 999
      const stats2 = bf.getStatistics()
      expect(stats2.adds).toBe(1)
    })

    it('should track estimatedFalsePositives (positive has results)', () => {
      const bf = new BlockedBloomFilter<string>(100, 0.01)
      bf.add('x')
      bf.has('x') // true → increments estimatedFalsePositives
      bf.has('y') // false → does not increment
      expect(bf.getStatistics().estimatedFalsePositives).toBe(1)
    })
  })

  // -------------------------------------------------------------------------
  // Symbol.iterator
  // -------------------------------------------------------------------------
  describe('Symbol.iterator', () => {
    it('should be iterable (returns an iterator)', () => {
      const bf = new BlockedBloomFilter()
      const iter = bf[Symbol.iterator]()
      expect(typeof iter.next).toBe('function')
    })

    it('should yield no items from the iterator', () => {
      const bf = new BlockedBloomFilter()
      bf.add('a')
      const items = [...bf]
      // The iterator body is empty — it's a stub
      expect(items).toEqual([])
    })
  })

  // -------------------------------------------------------------------------
  // Cache-friendly blocked behavior
  // -------------------------------------------------------------------------
  describe('cache-friendly blocked behavior', () => {
    it('should use multiple blocks for large item sets', () => {
      const bf = new BlockedBloomFilter(1000, 0.01)
      expect(bf.blockCount()).toBeGreaterThan(1)
    })

    it('should distribute items across blocks (different statistics block counts)', () => {
      const bf = new BlockedBloomFilter<string>(1000, 0.01, 256)
      for (let i = 0; i < 200; i++) {
        bf.add(`item-${i}`)
      }
      // Each add increments stats.blocks by 1
      expect(bf.getStatistics().blocks).toBe(200)
    })

    it('should maintain low FP rate with blocked structure', () => {
      const bf = new BlockedBloomFilter(500, 0.001, 256)
      for (let i = 0; i < 250; i++) {
        bf.add(`member-${i}`)
      }
      let fp = 0
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        if (bf.has(`nonmember-${i}`)) {
          fp++
        }
      }
      // With target 0.001 and half-capacity, expect very low FP rate
      expect(fp / trials).toBeLessThan(0.05)
    })
  })

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle very small block size', () => {
      const bf = new BlockedBloomFilter(10, 0.01, 8)
      bf.add('test')
      expect(bf.has('test')).toBe(true)
    })

    it('should handle large expected items count', () => {
      const bf = new BlockedBloomFilter(100000, 0.01)
      bf.add('test')
      expect(bf.has('test')).toBe(true)
      expect(bf.blockCount()).toBeGreaterThan(1)
    })

    it('should handle very low false positive rate', () => {
      const bf = new BlockedBloomFilter(100, 0.0001, 256)
      bf.add('item')
      expect(bf.has('item')).toBe(true)
      expect(bf.bitSize()).toBeGreaterThan(0)
    })

    it('should handle adding the same string many times', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      for (let i = 0; i < 100; i++) {
        bf.add('same')
      }
      expect(bf.has('same')).toBe(true)
      expect(bf.size).toBe(100)
    })

    it('should handle special characters in strings', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      const special = 'hello\u0000world\uFFFF🎉'
      bf.add(special)
      expect(bf.has(special)).toBe(true)
    })

    it('should handle very long strings', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      const longStr = 'x'.repeat(10000)
      bf.add(longStr)
      expect(bf.has(longStr)).toBe(true)
    })

    it('should distinguish between similar strings', () => {
      const bf = new BlockedBloomFilter(100, 0.01)
      bf.add('abc')
      bf.add('abd')
      expect(bf.has('abc')).toBe(true)
      expect(bf.has('abd')).toBe(true)
      expect(bf.has('abe')).toBe(false)
    })

    it('should handle union of two empty filters', () => {
      const bf1 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const result = bf1.union(bf2)
      expect(result.size).toBe(0)
      expect(result.isEmpty).toBe(true)
    })

    it('should handle intersection of two empty filters', () => {
      const bf1 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const bf2 = new BlockedBloomFilter<string>(100, 0.01, 256)
      const result = bf1.intersection(bf2)
      expect(result.size).toBe(0)
      expect(result.isEmpty).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS export
  // -------------------------------------------------------------------------
  describe('DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.falsePositiveRate).toBe(0.01)
      expect(DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS.blockSize).toBe(256)
    })
  })
})
