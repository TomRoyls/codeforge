import { describe, it, expect, beforeEach } from 'vitest'
import { RangeBloomFilter } from '../../src/core/range-bloom/range-bloom.js'
import { DEFAULT_RANGE_BLOOM_OPTIONS } from '../../src/core/range-bloom/types.js'
import type { RangeBloomOptions } from '../../src/core/range-bloom/types.js'

describe('RangeBloomFilter', () => {
  let filter: RangeBloomFilter

  beforeEach(() => {
    filter = new RangeBloomFilter()
  })

  describe('constructor', () => {
    it('should create a filter with default options', () => {
      const f = new RangeBloomFilter()
      expect(f.size).toBe(0)
      expect(f.capacity).toBe(1000)
    })

    it('should accept positional arguments', () => {
      const f = new RangeBloomFilter(5000, 0.001, 5)
      expect(f.capacity).toBe(5000)
    })

    it('should accept options object', () => {
      const f = new RangeBloomFilter({ expectedItems: 5000, falsePositiveRate: 0.001, layers: 4 })
      expect(f.capacity).toBe(5000)
    })

    it('should accept partial options with defaults', () => {
      const f = new RangeBloomFilter({ expectedItems: 200 })
      expect(f.capacity).toBe(200)
    })

    it('should accept only falsePositiveRate', () => {
      const f = new RangeBloomFilter({ falsePositiveRate: 0.05 })
      expect(f.capacity).toBe(1000)
    })

    it('should accept only layers', () => {
      const f = new RangeBloomFilter({ layers: 5 })
      expect(f.capacity).toBe(1000)
    })

    it('should compute positive bitCount', () => {
      const f = new RangeBloomFilter(1000, 0.01, 3)
      expect(f.bitCount).toBeGreaterThan(0)
    })

    it('should produce larger bitCount for more layers', () => {
      const f1 = new RangeBloomFilter(1000, 0.01, 2)
      const f2 = new RangeBloomFilter(1000, 0.01, 5)
      expect(f2.bitCount).toBeGreaterThan(f1.bitCount)
    })

    it('should produce larger bitCount for lower fp rate', () => {
      const f1 = new RangeBloomFilter(1000, 0.1, 3)
      const f2 = new RangeBloomFilter(1000, 0.001, 3)
      expect(f2.bitCount).toBeGreaterThan(f1.bitCount)
    })

    it('should default to expectedItems=1000', () => {
      const f = new RangeBloomFilter()
      expect(f.capacity).toBe(DEFAULT_RANGE_BLOOM_OPTIONS.expectedItems)
    })

    it('should use defaults when no args provided', () => {
      const f1 = new RangeBloomFilter()
      const f2 = new RangeBloomFilter(1000, 0.01, 3)
      expect(f1.bitCount).toBe(f2.bitCount)
      expect(f1.capacity).toBe(f2.capacity)
    })
  })

  describe('add', () => {
    it('should add a value and increase size', () => {
      filter.add(5)
      expect(filter.size).toBe(1)
    })

    it('should add multiple values', () => {
      filter.add(1)
      filter.add(2)
      filter.add(3)
      expect(filter.size).toBe(3)
    })

    it('should count duplicate adds as additional items', () => {
      filter.add(5)
      filter.add(5)
      expect(filter.size).toBe(2)
    })

    it('should handle value 0', () => {
      filter.add(0)
      expect(filter.size).toBe(1)
      expect(filter.has(0)).toBe(true)
    })

    it('should handle negative values', () => {
      filter.add(-1)
      filter.add(-10)
      expect(filter.size).toBe(2)
    })

    it('should handle large values', () => {
      filter.add(1000000)
      expect(filter.size).toBe(1)
      expect(filter.has(1000000)).toBe(true)
    })

    it('should handle very large values', () => {
      filter.add(Number.MAX_SAFE_INTEGER)
      expect(filter.size).toBe(1)
      expect(filter.has(Number.MAX_SAFE_INTEGER)).toBe(true)
    })

    it('should handle integer values near fractions', () => {
      filter.add(3)
      expect(filter.size).toBe(1)
      expect(filter.has(3)).toBe(true)
    })

    it('should handle adding many values', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(i)
      }
      expect(filter.size).toBe(100)
    })
  })

  describe('has', () => {
    it('should return true for an added value', () => {
      filter.add(42)
      expect(filter.has(42)).toBe(true)
    })

    it('should return false for a value not added', () => {
      filter.add(42)
      expect(filter.has(99)).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.has(0)).toBe(false)
      expect(filter.has(100)).toBe(false)
    })

    it('should find multiple added values', () => {
      filter.add(10)
      filter.add(20)
      filter.add(30)
      expect(filter.has(10)).toBe(true)
      expect(filter.has(20)).toBe(true)
      expect(filter.has(30)).toBe(true)
    })

    it('should never produce false negatives for exact lookups', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(i * 7)
      }
      for (let i = 0; i < 100; i++) {
        expect(filter.has(i * 7)).toBe(true)
      }
    })

    it('should handle has(0) after add(0)', () => {
      filter.add(0)
      expect(filter.has(0)).toBe(true)
    })

    it('should handle negative values', () => {
      filter.add(-5)
      expect(filter.has(-5)).toBe(true)
      expect(filter.has(-4)).toBe(false)
    })

    it('should handle duplicate adds', () => {
      filter.add(10)
      filter.add(10)
      expect(filter.has(10)).toBe(true)
    })

    it('should handle consecutive integer adds', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(filter.has(i)).toBe(true)
      }
    })

    it('should handle sparse values', () => {
      const vals = [0, 100, 500, 999, 10000]
      for (const v of vals) {
        filter.add(v)
      }
      for (const v of vals) {
        expect(filter.has(v)).toBe(true)
      }
    })
  })

  describe('hasRange', () => {
    it('should return true when a value in range was added', () => {
      filter.add(5)
      expect(filter.hasRange(0, 10)).toBe(true)
    })

    it('should return false for disjoint range when sparse', () => {
      filter.add(999)
      expect(filter.hasRange(0, 5)).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.hasRange(0, 100)).toBe(false)
    })

    it('should return true when value is at range boundary (lo)', () => {
      filter.add(5)
      expect(filter.hasRange(5, 10)).toBe(true)
    })

    it('should return true when value is at range boundary (hi)', () => {
      filter.add(10)
      expect(filter.hasRange(5, 10)).toBe(true)
    })

    it('should return true when lo equals hi and value exists', () => {
      filter.add(7)
      expect(filter.hasRange(7, 7)).toBe(true)
    })

    it('should return false when lo equals hi and value does not exist', () => {
      filter.add(7)
      expect(filter.hasRange(8, 8)).toBe(false)
    })

    it('should return false when lo > hi', () => {
      filter.add(5)
      expect(filter.hasRange(10, 0)).toBe(false)
    })

    it('should find values across multiple buckets', () => {
      filter.add(5)
      filter.add(15)
      filter.add(25)
      expect(filter.hasRange(0, 30)).toBe(true)
    })

    it('should detect values at range start', () => {
      filter.add(100)
      expect(filter.hasRange(100, 200)).toBe(true)
    })

    it('should detect values at range end', () => {
      filter.add(200)
      expect(filter.hasRange(100, 200)).toBe(true)
    })

    it('should detect value in middle of range', () => {
      filter.add(150)
      expect(filter.hasRange(100, 200)).toBe(true)
    })

    it('should return false for disjoint range', () => {
      filter.add(5)
      expect(filter.hasRange(100, 200)).toBe(false)
    })

    it('should handle single-element range matching', () => {
      filter.add(42)
      expect(filter.hasRange(42, 42)).toBe(true)
      expect(filter.hasRange(43, 43)).toBe(false)
    })

    it('should handle range spanning bucket boundaries', () => {
      filter.add(9)
      expect(filter.hasRange(5, 15)).toBe(true)
    })

    it('should find value in large range', () => {
      filter.add(500)
      expect(filter.hasRange(0, 1000)).toBe(true)
    })

    it('should handle range with only added values', () => {
      for (let i = 10; i <= 20; i++) {
        filter.add(i)
      }
      expect(filter.hasRange(10, 20)).toBe(true)
      expect(filter.hasRange(15, 25)).toBe(true)
    })

    it('should handle negative range', () => {
      filter.add(-5)
      expect(filter.hasRange(-10, 0)).toBe(true)
    })

    it('should handle range covering many buckets', () => {
      filter.add(150)
      expect(filter.hasRange(0, 300)).toBe(true)
    })

    it('should detect value in wide range', () => {
      filter.add(42)
      expect(filter.hasRange(0, 10000)).toBe(true)
    })

    it('should handle range where value is near boundary', () => {
      filter.add(99)
      expect(filter.hasRange(90, 100)).toBe(true)
    })
  })

  describe('addRange', () => {
    it('should add all integers in range', () => {
      filter.addRange(0, 4)
      expect(filter.size).toBe(5)
      expect(filter.has(0)).toBe(true)
      expect(filter.has(1)).toBe(true)
      expect(filter.has(2)).toBe(true)
      expect(filter.has(3)).toBe(true)
      expect(filter.has(4)).toBe(true)
    })

    it('should add a single value when lo equals hi', () => {
      filter.addRange(5, 5)
      expect(filter.size).toBe(1)
      expect(filter.has(5)).toBe(true)
    })

    it('should handle lo > hi gracefully', () => {
      filter.addRange(10, 5)
      expect(filter.size).toBe(0)
    })

    it('should add large ranges', () => {
      filter.addRange(0, 99)
      expect(filter.size).toBe(100)
    })

    it('should make values queryable via hasRange', () => {
      filter.addRange(10, 20)
      expect(filter.hasRange(10, 20)).toBe(true)
      expect(filter.hasRange(15, 18)).toBe(true)
    })

    it('should handle negative ranges', () => {
      filter.addRange(-5, -1)
      expect(filter.size).toBe(5)
      expect(filter.has(-3)).toBe(true)
    })

    it('should handle range starting at 0', () => {
      filter.addRange(0, 9)
      expect(filter.size).toBe(10)
      expect(filter.has(0)).toBe(true)
      expect(filter.has(9)).toBe(true)
    })

    it('should handle overlapping ranges', () => {
      filter.addRange(0, 10)
      filter.addRange(5, 15)
      expect(filter.size).toBe(22)
      expect(filter.has(0)).toBe(true)
      expect(filter.has(15)).toBe(true)
    })

    it('should handle adjacent ranges', () => {
      filter.addRange(0, 4)
      filter.addRange(5, 9)
      expect(filter.has(4)).toBe(true)
      expect(filter.has(5)).toBe(true)
    })

    it('should handle range with gap', () => {
      filter.addRange(0, 4)
      filter.addRange(20, 24)
      expect(filter.hasRange(0, 4)).toBe(true)
      expect(filter.hasRange(20, 24)).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      filter.add(1)
      filter.add(2)
      filter.add(3)
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should make has return false', () => {
      filter.add(42)
      filter.clear()
      expect(filter.has(42)).toBe(false)
    })

    it('should make hasRange return false', () => {
      filter.add(5)
      filter.clear()
      expect(filter.hasRange(0, 10)).toBe(false)
    })

    it('should allow adding after clear', () => {
      filter.add(1)
      filter.clear()
      filter.add(2)
      expect(filter.size).toBe(1)
      expect(filter.has(2)).toBe(true)
      expect(filter.has(1)).toBe(false)
    })

    it('should handle clearing an empty filter', () => {
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should preserve capacity after clear', () => {
      const cap = filter.capacity
      filter.add(1)
      filter.clear()
      expect(filter.capacity).toBe(cap)
    })

    it('should preserve bitCount after clear', () => {
      const bits = filter.bitCount
      filter.add(1)
      filter.clear()
      expect(filter.bitCount).toBe(bits)
    })

    it('should reset falsePositiveRate to 0', () => {
      filter.add(1)
      filter.add(2)
      filter.add(3)
      filter.clear()
      expect(filter.falsePositiveRate()).toBe(0)
    })

    it('should reset fillRatio to 0', () => {
      filter.add(1)
      filter.clear()
      expect(filter.fillRatio()).toBe(0)
    })
  })

  describe('size', () => {
    it('should return 0 for new filter', () => {
      expect(filter.size).toBe(0)
    })

    it('should return 1 after one add', () => {
      filter.add(42)
      expect(filter.size).toBe(1)
    })

    it('should track multiple adds', () => {
      filter.add(1)
      filter.add(2)
      filter.add(3)
      expect(filter.size).toBe(3)
    })

    it('should count duplicates', () => {
      filter.add(5)
      filter.add(5)
      expect(filter.size).toBe(2)
    })

    it('should track addRange', () => {
      filter.addRange(0, 9)
      expect(filter.size).toBe(10)
    })

    it('should reset after clear', () => {
      filter.add(1)
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should handle many values', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(i)
      }
      expect(filter.size).toBe(200)
    })
  })

  describe('capacity', () => {
    it('should return expectedItems', () => {
      const f = new RangeBloomFilter(500, 0.01, 3)
      expect(f.capacity).toBe(500)
    })

    it('should return default 1000', () => {
      expect(filter.capacity).toBe(1000)
    })

    it('should remain constant after operations', () => {
      const cap = filter.capacity
      filter.add(1)
      expect(filter.capacity).toBe(cap)
    })
  })

  describe('falsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.falsePositiveRate()).toBe(0)
    })

    it('should return positive value after adds', () => {
      filter.add(1)
      expect(filter.falsePositiveRate()).toBeGreaterThan(0)
    })

    it('should increase with more items', () => {
      const f = new RangeBloomFilter(100, 0.01, 3)
      const fp0 = f.falsePositiveRate()
      for (let i = 0; i < 50; i++) {
        f.add(i)
      }
      const fp50 = f.falsePositiveRate()
      for (let i = 50; i < 100; i++) {
        f.add(i)
      }
      const fp100 = f.falsePositiveRate()
      expect(fp50).toBeGreaterThan(fp0)
      expect(fp100).toBeGreaterThan(fp50)
    })

    it('should reset to 0 after clear', () => {
      filter.add(1)
      filter.add(2)
      filter.clear()
      expect(filter.falsePositiveRate()).toBe(0)
    })
  })

  describe('bitCount', () => {
    it('should return positive number', () => {
      expect(filter.bitCount).toBeGreaterThan(0)
    })

    it('should increase with more layers', () => {
      const f1 = new RangeBloomFilter(100, 0.01, 2)
      const f2 = new RangeBloomFilter(100, 0.01, 4)
      expect(f2.bitCount).toBeGreaterThan(f1.bitCount)
    })

    it('should remain constant after operations', () => {
      const bits = filter.bitCount
      filter.add(1)
      expect(filter.bitCount).toBe(bits)
    })

    it('should be sum of all layer bit counts', () => {
      const f = new RangeBloomFilter(1000, 0.01, 3)
      expect(f.bitCount).toBeGreaterThan(0)
    })
  })

  describe('fillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.fillRatio()).toBe(0)
    })

    it('should return positive value after adds', () => {
      filter.add(1)
      expect(filter.fillRatio()).toBeGreaterThan(0)
    })

    it('should return value between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(i)
      }
      const ratio = filter.fillRatio()
      expect(ratio).toBeGreaterThanOrEqual(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should increase with more items', () => {
      const f = new RangeBloomFilter(100, 0.01, 3)
      const r0 = f.fillRatio()
      for (let i = 0; i < 50; i++) {
        f.add(i)
      }
      const r50 = f.fillRatio()
      expect(r50).toBeGreaterThan(r0)
    })

    it('should reset to 0 after clear', () => {
      filter.add(1)
      filter.clear()
      expect(filter.fillRatio()).toBe(0)
    })

    it('should approach 1 when heavily loaded', () => {
      const f = new RangeBloomFilter(10, 0.01, 3)
      for (let i = 0; i < 1000; i++) {
        f.add(i)
      }
      expect(f.fillRatio()).toBeGreaterThan(0.5)
    })
  })

  describe('toString', () => {
    it('should return a descriptive string', () => {
      const str = filter.toString()
      expect(str).toContain('RangeBloomFilter')
      expect(str).toContain('size=0')
      expect(str).toContain('capacity=1000')
      expect(str).toContain('layers=3')
    })

    it('should reflect current state', () => {
      filter.add(1)
      filter.add(2)
      const str = filter.toString()
      expect(str).toContain('size=2')
    })

    it('should include fpRate', () => {
      const str = filter.toString()
      expect(str).toContain('fpRate=')
    })

    it('should include bitCount', () => {
      const str = filter.toString()
      expect(str).toContain('bitCount=')
    })

    it('should reflect custom parameters', () => {
      const f = new RangeBloomFilter(500, 0.05, 5)
      const str = f.toString()
      expect(str).toContain('capacity=500')
      expect(str).toContain('layers=5')
    })
  })

  describe('range query accuracy', () => {
    it('should never miss an exact value in range', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(i * 2)
      }
      for (let i = 0; i < 50; i++) {
        expect(filter.hasRange(i * 2 - 1, i * 2 + 1)).toBe(true)
      }
    })

    it('should find values across bucket boundaries', () => {
      filter.add(9)
      filter.add(10)
      filter.add(19)
      filter.add(20)
      expect(filter.hasRange(8, 12)).toBe(true)
      expect(filter.hasRange(18, 22)).toBe(true)
    })

    it('should handle range within single bucket', () => {
      filter.add(5)
      expect(filter.hasRange(3, 7)).toBe(true)
    })

    it('should handle range spanning 100-unit boundary', () => {
      filter.add(99)
      filter.add(100)
      expect(filter.hasRange(95, 105)).toBe(true)
    })

    it('should handle range across multiple layers', () => {
      filter.add(55)
      expect(filter.hasRange(50, 60)).toBe(true)
      expect(filter.hasRange(0, 100)).toBe(true)
    })

    it('should find value added via addRange', () => {
      filter.addRange(100, 110)
      expect(filter.hasRange(100, 110)).toBe(true)
      expect(filter.hasRange(105, 108)).toBe(true)
    })

    it('should return true for range containing any added value', () => {
      filter.add(250)
      expect(filter.hasRange(0, 500)).toBe(true)
      expect(filter.hasRange(200, 300)).toBe(true)
      expect(filter.hasRange(249, 251)).toBe(true)
    })

    it('should handle wide range queries', () => {
      filter.add(500)
      expect(filter.hasRange(0, 1000)).toBe(true)
    })
  })

  describe('layered architecture', () => {
    it('should store exact values in layer 0', () => {
      filter.add(42)
      expect(filter.has(42)).toBe(true)
      expect(filter.has(43)).toBe(false)
    })

    it('should support range queries via coarser layers', () => {
      filter.add(55)
      expect(filter.hasRange(50, 59)).toBe(true)
    })

    it('should have multiple layers by default', () => {
      const f = new RangeBloomFilter()
      const str = f.toString()
      expect(str).toContain('layers=3')
    })

    it('should work with 1 layer', () => {
      const f = new RangeBloomFilter(1000, 0.01, 1)
      f.add(5)
      expect(f.has(5)).toBe(true)
    })

    it('should work with 5 layers', () => {
      const f = new RangeBloomFilter(1000, 0.01, 5)
      f.add(42)
      expect(f.has(42)).toBe(true)
      expect(f.hasRange(40, 50)).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_RANGE_BLOOM_OPTIONS', () => {
      expect(DEFAULT_RANGE_BLOOM_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_RANGE_BLOOM_OPTIONS.falsePositiveRate).toBe(0.01)
      expect(DEFAULT_RANGE_BLOOM_OPTIONS.layers).toBe(3)
    })

    it('should support RangeBloomOptions interface', () => {
      const opts: RangeBloomOptions = {
        expectedItems: 500,
        falsePositiveRate: 0.05,
        layers: 4,
      }
      expect(opts.expectedItems).toBe(500)
      expect(opts.falsePositiveRate).toBe(0.05)
      expect(opts.layers).toBe(4)
    })

    it('should support partial RangeBloomOptions', () => {
      const opts: RangeBloomOptions = {
        expectedItems: 200,
      }
      expect(opts.expectedItems).toBe(200)
    })
  })

  describe('edge cases', () => {
    it('should handle very small fp rate', () => {
      const f = new RangeBloomFilter(100, 0.0001, 3)
      f.add(42)
      expect(f.has(42)).toBe(true)
    })

    it('should handle high fp rate', () => {
      const f = new RangeBloomFilter(100, 0.5, 3)
      f.add(42)
      expect(f.has(42)).toBe(true)
    })

    it('should handle single expected item', () => {
      const f = new RangeBloomFilter(1, 0.01, 3)
      f.add(42)
      expect(f.has(42)).toBe(true)
    })

    it('should handle addRange followed by clear', () => {
      filter.addRange(0, 10)
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.has(5)).toBe(false)
    })

    it('should handle addRange after clear', () => {
      filter.addRange(0, 10)
      filter.clear()
      filter.addRange(20, 30)
      expect(filter.size).toBe(11)
      expect(filter.has(25)).toBe(true)
      expect(filter.has(5)).toBe(false)
    })

    it('should handle many consecutive operations', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(filter.has(i)).toBe(true)
      }
    })

    it('should handle mixed add and addRange', () => {
      filter.add(5)
      filter.addRange(10, 15)
      filter.add(100)
      expect(filter.has(5)).toBe(true)
      expect(filter.has(12)).toBe(true)
      expect(filter.has(100)).toBe(true)
    })

    it('should handle hasRange after many operations', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(i)
      }
      expect(filter.hasRange(0, 10)).toBe(true)
      expect(filter.hasRange(50, 60)).toBe(true)
      expect(filter.hasRange(90, 100)).toBe(true)
    })

    it('should handle value 0 in ranges', () => {
      filter.add(0)
      expect(filter.hasRange(-1, 1)).toBe(true)
      expect(filter.hasRange(0, 0)).toBe(true)
    })
  })
})
