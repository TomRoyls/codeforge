import { describe, it, expect, beforeEach } from 'vitest'
import { BloomFilter } from '../../src/core/bloom-filter/bloom-filter.js'
import { DEFAULT_BLOOM_FILTER_OPTIONS } from '../../src/core/bloom-filter/types.js'
import type { BloomFilterOptions, BloomFilterStats } from '../../src/core/bloom-filter/types.js'

describe('BloomFilter', () => {
  let filter: BloomFilter

  beforeEach(() => {
    filter = new BloomFilter()
  })

  describe('constructor', () => {
    it('should create a filter with default options', () => {
      const f = new BloomFilter()
      expect(f.isEmpty()).toBe(true)
      expect(f.getItemCount()).toBe(0)
    })

    it('should accept custom expectedItems', () => {
      const f = new BloomFilter({ expectedItems: 5000 })
      expect(f.getStats().expectedItems).toBe(5000)
    })

    it('should accept custom falsePositiveRate', () => {
      const f = new BloomFilter({ falsePositiveRate: 0.001 })
      expect(f.getStats().falsePositiveRate).toBe(0.001)
    })

    it('should accept custom hashFunctions', () => {
      const f = new BloomFilter({ hashFunctions: 5 })
      expect(f.getStats().hashFunctionCount).toBe(5)
    })

    it('should accept partial options with defaults', () => {
      const f = new BloomFilter({ expectedItems: 200 })
      const stats = f.getStats()
      expect(stats.expectedItems).toBe(200)
      expect(stats.falsePositiveRate).toBe(DEFAULT_BLOOM_FILTER_OPTIONS.falsePositiveRate)
    })

    it('should accept all options combined', () => {
      const f = new BloomFilter({ expectedItems: 500, falsePositiveRate: 0.05, hashFunctions: 3 })
      const stats = f.getStats()
      expect(stats.expectedItems).toBe(500)
      expect(stats.falsePositiveRate).toBe(0.05)
      expect(stats.hashFunctionCount).toBe(3)
    })

    it('should create a bit array of appropriate size', () => {
      const f = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      expect(f.getBitArray().length).toBeGreaterThan(0)
    })
  })

  describe('add', () => {
    it('should add an item', () => {
      filter.add('hello')
      expect(filter.getItemCount()).toBe(1)
    })

    it('should add multiple different items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.getItemCount()).toBe(3)
    })

    it('should count duplicate adds as additional items', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.getItemCount()).toBe(2)
    })

    it('should handle empty string', () => {
      filter.add('')
      expect(filter.getItemCount()).toBe(1)
    })

    it('should handle unicode strings', () => {
      filter.add('日本語')
      filter.add('🎉🚀')
      expect(filter.getItemCount()).toBe(2)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      filter.add(longStr)
      expect(filter.getItemCount()).toBe(1)
    })

    it('should handle strings with special characters', () => {
      filter.add('hello\nworld\t!')
      filter.add('path/to/file.ts')
      expect(filter.getItemCount()).toBe(2)
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
  })

  describe('false positive handling', () => {
    it('should have a low false positive rate within expected capacity', () => {
      const f = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01, hashFunctions: 7 })
      const added: string[] = []
      for (let i = 0; i < 1000; i++) {
        const item = `item-${i}`
        f.add(item)
        added.push(item)
      }
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        const testItem = `not-added-${i}`
        if (f.has(testItem)) {
          falsePositives++
        }
      }
      const observedRate = falsePositives / trials
      expect(observedRate).toBeLessThan(0.05)
    })

    it('should report no false negatives', () => {
      const f = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01, hashFunctions: 7 })
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

  describe('addAll', () => {
    it('should add all items from an array', () => {
      filter.addAll(['a', 'b', 'c'])
      expect(filter.getItemCount()).toBe(3)
    })

    it('should handle empty array', () => {
      filter.addAll([])
      expect(filter.getItemCount()).toBe(0)
    })

    it('should add all items and make them findable', () => {
      const items = ['apple', 'banana', 'cherry']
      filter.addAll(items)
      expect(filter.has('apple')).toBe(true)
      expect(filter.has('banana')).toBe(true)
      expect(filter.has('cherry')).toBe(true)
    })

    it('should handle single item array', () => {
      filter.addAll(['only'])
      expect(filter.getItemCount()).toBe(1)
      expect(filter.has('only')).toBe(true)
    })

    it('should handle array with duplicates', () => {
      filter.addAll(['x', 'x', 'x'])
      expect(filter.getItemCount()).toBe(3)
    })
  })

  describe('hasAny', () => {
    it('should return true if any item is present', () => {
      filter.add('b')
      expect(filter.hasAny(['a', 'b', 'c'])).toBe(true)
    })

    it('should return false if no items are present', () => {
      filter.add('x')
      expect(filter.hasAny(['a', 'b', 'c'])).toBe(false)
    })

    it('should return false for empty array', () => {
      filter.add('test')
      expect(filter.hasAny([])).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.hasAny(['a', 'b', 'c'])).toBe(false)
    })

    it('should return true when first item matches', () => {
      filter.add('first')
      expect(filter.hasAny(['first', 'second'])).toBe(true)
    })

    it('should return true when last item matches', () => {
      filter.add('last')
      expect(filter.hasAny(['first', 'second', 'last'])).toBe(true)
    })
  })

  describe('hasAll', () => {
    it('should return true if all items are present', () => {
      filter.addAll(['a', 'b', 'c'])
      expect(filter.hasAll(['a', 'b', 'c'])).toBe(true)
    })

    it('should return false if any item is missing', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.hasAll(['a', 'b', 'c'])).toBe(false)
    })

    it('should return true for empty array', () => {
      expect(filter.hasAll([])).toBe(true)
    })

    it('should return false for empty filter with non-empty array', () => {
      expect(filter.hasAll(['a'])).toBe(false)
    })

    it('should return true for single present item', () => {
      filter.add('only')
      expect(filter.hasAll(['only'])).toBe(true)
    })

    it('should return false for single absent item', () => {
      filter.add('present')
      expect(filter.hasAll(['absent'])).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      filter.addAll(['a', 'b', 'c'])
      filter.clear()
      expect(filter.getItemCount()).toBe(0)
    })

    it('should make the filter empty', () => {
      filter.add('test')
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
    })

    it('should clear bit array', () => {
      filter.add('test')
      filter.clear()
      const bitArray = filter.getBitArray()
      for (let i = 0; i < bitArray.length; i++) {
        expect(bitArray[i]).toBe(0)
      }
    })

    it('should allow adding after clear', () => {
      filter.add('first')
      filter.clear()
      filter.add('second')
      expect(filter.getItemCount()).toBe(1)
      expect(filter.has('second')).toBe(true)
    })

    it('should handle clearing an empty filter', () => {
      filter.clear()
      expect(filter.isEmpty()).toBe(true)
      expect(filter.getItemCount()).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty filter', () => {
      const stats = filter.getStats()
      expect(stats.itemCount).toBe(0)
      expect(stats.fillRatio).toBe(0)
      expect(stats.estimatedFalsePositiveRate).toBe(0)
    })

    it('should track itemCount', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.getStats().itemCount).toBe(2)
    })

    it('should track expectedItems', () => {
      const f = new BloomFilter({ expectedItems: 500 })
      expect(f.getStats().expectedItems).toBe(500)
    })

    it('should track falsePositiveRate', () => {
      const f = new BloomFilter({ falsePositiveRate: 0.001 })
      expect(f.getStats().falsePositiveRate).toBe(0.001)
    })

    it('should track hashFunctionCount', () => {
      const f = new BloomFilter({ hashFunctions: 10 })
      expect(f.getStats().hashFunctionCount).toBe(10)
    })

    it('should have non-zero fillRatio after adds', () => {
      filter.add('test')
      expect(filter.getStats().fillRatio).toBeGreaterThan(0)
    })

    it('should have non-zero estimatedFalsePositiveRate after adds', () => {
      filter.add('test')
      expect(filter.getStats().estimatedFalsePositiveRate).toBeGreaterThan(0)
    })

    it('should return bitArraySize as multiple of 8', () => {
      const stats = filter.getStats()
      expect(stats.bitArraySize % 8).toBe(0)
    })

    it('should update stats after more adds', () => {
      filter.add('a')
      const stats1 = filter.getStats()
      filter.add('b')
      filter.add('c')
      const stats2 = filter.getStats()
      expect(stats2.itemCount).toBeGreaterThan(stats1.itemCount)
      expect(stats2.fillRatio).toBeGreaterThanOrEqual(stats1.fillRatio)
    })

    it('should return correct stats after clear', () => {
      filter.addAll(['a', 'b', 'c'])
      filter.clear()
      const stats = filter.getStats()
      expect(stats.itemCount).toBe(0)
      expect(stats.fillRatio).toBe(0)
    })
  })

  describe('getFillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.getFillRatio()).toBe(0)
    })

    it('should return value between 0 and 1 after adds', () => {
      filter.add('test')
      const ratio = filter.getFillRatio()
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should increase as more items are added', () => {
      const f = new BloomFilter({ expectedItems: 100 })
      const ratios: number[] = []
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
        ratios.push(f.getFillRatio())
      }
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i]).toBeGreaterThanOrEqual(ratios[i - 1])
      }
    })

    it('should return 0 after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.getFillRatio()).toBe(0)
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
  })

  describe('getBitArray', () => {
    it('should return a Uint8Array', () => {
      const arr = filter.getBitArray()
      expect(arr).toBeInstanceOf(Uint8Array)
    })

    it('should return a copy not a reference', () => {
      filter.add('test')
      const arr1 = filter.getBitArray()
      const original = arr1[0]
      arr1[0] = 255
      const arr2 = filter.getBitArray()
      expect(arr2[0]).toBe(original)
    })

    it('should return all zeros for empty filter', () => {
      const arr = filter.getBitArray()
      for (let i = 0; i < arr.length; i++) {
        expect(arr[i]).toBe(0)
      }
    })

    it('should have non-zero values after adds', () => {
      filter.add('test')
      const arr = filter.getBitArray()
      const hasNonZero = Array.from(arr).some(v => v !== 0)
      expect(hasNonZero).toBe(true)
    })
  })

  describe('toJSON', () => {
    it('should return a serializable object', () => {
      filter.add('test')
      const json = filter.toJSON()
      expect(json).toHaveProperty('bitArray')
      expect(json).toHaveProperty('hashFunctionCount')
      expect(json).toHaveProperty('expectedItems')
      expect(json).toHaveProperty('falsePositiveRate')
      expect(json).toHaveProperty('itemCount')
    })

    it('should serialize bitArray as number array', () => {
      filter.add('test')
      const json = filter.toJSON()
      expect(Array.isArray(json.bitArray)).toBe(true)
    })

    it('should serialize itemCount correctly', () => {
      filter.addAll(['a', 'b', 'c'])
      expect(filter.toJSON().itemCount).toBe(3)
    })

    it('should serialize options correctly', () => {
      const f = new BloomFilter({ expectedItems: 500, falsePositiveRate: 0.05, hashFunctions: 3 })
      const json = f.toJSON()
      expect(json.expectedItems).toBe(500)
      expect(json.falsePositiveRate).toBe(0.05)
      expect(json.hashFunctionCount).toBe(3)
    })

    it('should produce valid JSON string', () => {
      filter.add('test')
      const json = filter.toJSON()
      const str = JSON.stringify(json)
      expect(() => JSON.parse(str)).not.toThrow()
    })
  })

  describe('fromJSON', () => {
    it('should restore a filter from JSON', () => {
      filter.addAll(['a', 'b', 'c'])
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON(json)
      expect(restored.has('a')).toBe(true)
      expect(restored.has('b')).toBe(true)
      expect(restored.has('c')).toBe(true)
    })

    it('should restore itemCount', () => {
      filter.addAll(['x', 'y'])
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON(json)
      expect(restored.getItemCount()).toBe(2)
    })

    it('should restore with correct options', () => {
      const f = new BloomFilter({ expectedItems: 500, falsePositiveRate: 0.05, hashFunctions: 3 })
      f.add('test')
      const json = f.toJSON()
      const restored = BloomFilter.fromJSON(json)
      const stats = restored.getStats()
      expect(stats.expectedItems).toBe(500)
      expect(stats.falsePositiveRate).toBe(0.05)
      expect(stats.hashFunctionCount).toBe(3)
    })

    it('should restore empty filter', () => {
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON(json)
      expect(restored.isEmpty()).toBe(true)
      expect(restored.getItemCount()).toBe(0)
    })

    it('should allow adding after restoration', () => {
      filter.add('original')
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON(json)
      restored.add('new')
      expect(restored.has('original')).toBe(true)
      expect(restored.getItemCount()).toBe(2)
    })

    it('should preserve bit array state', () => {
      filter.addAll(['a', 'b', 'c', 'd', 'e'])
      const originalBits = filter.getBitArray()
      const json = filter.toJSON()
      const restored = BloomFilter.fromJSON(json)
      const restoredBits = restored.getBitArray()
      expect(restoredBits.length).toBe(originalBits.length)
      for (let i = 0; i < originalBits.length; i++) {
        expect(restoredBits[i]).toBe(originalBits[i])
      }
    })
  })

  describe('large item sets', () => {
    it('should handle 10000 items', () => {
      const f = new BloomFilter({ expectedItems: 10000, falsePositiveRate: 0.01, hashFunctions: 7 })
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      expect(f.getItemCount()).toBe(10000)
      expect(f.has('item-0')).toBe(true)
      expect(f.has('item-9999')).toBe(true)
      expect(f.has('item-5000')).toBe(true)
    })

    it('should handle 10000 items with no false negatives', () => {
      const f = new BloomFilter({ expectedItems: 10000, falsePositiveRate: 0.01, hashFunctions: 7 })
      for (let i = 0; i < 10000; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 10000; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle rapid add and check cycles', () => {
      const f = new BloomFilter({ expectedItems: 1000, falsePositiveRate: 0.01, hashFunctions: 7 })
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('hash distribution', () => {
    it('should produce different hash positions for different strings', () => {
      const f = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.01, hashFunctions: 7 })
      f.add('aaa')
      const bits1 = f.getBitArray()
      f.clear()
      f.add('bbb')
      const bits2 = f.getBitArray()
      let differ = false
      for (let i = 0; i < bits1.length; i++) {
        if (bits1[i] !== bits2[i]) {
          differ = true
          break
        }
      }
      expect(differ).toBe(true)
    })

    it('should produce consistent results for same string', () => {
      filter.add('consistent')
      const result1 = filter.has('consistent')
      const result2 = filter.has('consistent')
      expect(result1).toBe(result2)
      expect(result1).toBe(true)
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
      expect(filter.getItemCount()).toBe(3)
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
      const f = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.0001, hashFunctions: 13 })
      f.add('test')
      expect(f.has('test')).toBe(true)
    })

    it('should handle high false positive rate', () => {
      const f = new BloomFilter({ expectedItems: 100, falsePositiveRate: 0.5, hashFunctions: 1 })
      f.add('test')
      expect(f.has('test')).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BLOOM_FILTER_OPTIONS', () => {
      expect(DEFAULT_BLOOM_FILTER_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_BLOOM_FILTER_OPTIONS.falsePositiveRate).toBe(0.01)
      expect(DEFAULT_BLOOM_FILTER_OPTIONS.hashFunctions).toBe(7)
    })

    it('should support BloomFilterOptions interface', () => {
      const opts: BloomFilterOptions = {
        expectedItems: 500,
        falsePositiveRate: 0.05,
        hashFunctions: 5,
      }
      expect(opts.expectedItems).toBe(500)
    })

    it('should support BloomFilterStats interface', () => {
      const stats: BloomFilterStats = {
        bitArraySize: 9585,
        hashFunctionCount: 7,
        expectedItems: 1000,
        falsePositiveRate: 0.01,
        itemCount: 100,
        fillRatio: 0.5,
        estimatedFalsePositiveRate: 0.008,
      }
      expect(stats.bitArraySize).toBe(9585)
      expect(stats.itemCount).toBe(100)
    })
  })
})
