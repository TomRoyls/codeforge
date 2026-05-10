import { describe, it, expect } from 'vitest'
import { ScanArray } from '../../src/core/scan-array/scan-array.js'
import { DEFAULT_SCAN_ARRAY_OPTIONS } from '../../src/core/scan-array/types.js'
import type { ScanArrayOptions, ScanArrayStatistics } from '../../src/core/scan-array/types.js'

describe('ScanArray', () => {
  describe('constructor', () => {
    it('creates empty array with no arguments', () => {
      const sa = new ScanArray()
      expect(sa.size).toBe(0)
      expect(sa.isEmpty).toBe(true)
    })

    it('creates array with specified size filled with zeros', () => {
      const sa = new ScanArray(5)
      expect(sa.size).toBe(5)
      expect(sa.isEmpty).toBe(false)
      expect(sa.toArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('creates array with size 1', () => {
      const sa = new ScanArray(1)
      expect(sa.size).toBe(1)
      expect(sa.get(0)).toBe(0)
    })

    it('creates array with size 0 (empty)', () => {
      const sa = new ScanArray(0)
      expect(sa.size).toBe(0)
      expect(sa.isEmpty).toBe(true)
    })

    it('creates array from options with initialSize', () => {
      const sa = new ScanArray({ initialSize: 3 })
      expect(sa.size).toBe(3)
      expect(sa.toArray()).toEqual([0, 0, 0])
    })

    it('creates empty array from options without initialSize', () => {
      const sa = new ScanArray({})
      expect(sa.size).toBe(0)
    })

    it('creates empty array from options with initialSize 0', () => {
      const sa = new ScanArray({ initialSize: 0 })
      expect(sa.size).toBe(0)
    })

    it('handles large initial size', () => {
      const sa = new ScanArray(1000)
      expect(sa.size).toBe(1000)
      expect(sa.prefixSum(999)).toBe(0)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const sa = new ScanArray(3)
      sa.set(0, 10)
      expect(sa.get(0)).toBe(10)
    })

    it('sets multiple values', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      expect(sa.toArray()).toEqual([1, 2, 3])
    })

    it('overwrites existing value', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      sa.set(0, 10)
      expect(sa.get(0)).toBe(10)
    })

    it('sets negative value', () => {
      const sa = new ScanArray(3)
      sa.set(1, -5)
      expect(sa.get(1)).toBe(-5)
    })

    it('sets zero value', () => {
      const sa = new ScanArray(3)
      sa.set(1, 42)
      sa.set(1, 0)
      expect(sa.get(1)).toBe(0)
    })

    it('sets floating point value', () => {
      const sa = new ScanArray(3)
      sa.set(0, 3.14)
      expect(sa.get(0)).toBeCloseTo(3.14)
    })

    it('throws on set with negative index', () => {
      const sa = new ScanArray(3)
      expect(() => sa.set(-1, 5)).toThrow(RangeError)
    })

    it('throws on set with index >= size', () => {
      const sa = new ScanArray(3)
      expect(() => sa.set(3, 5)).toThrow(RangeError)
    })

    it('throws on get with negative index', () => {
      const sa = new ScanArray(3)
      expect(() => sa.get(-1)).toThrow(RangeError)
    })

    it('throws on get with index >= size', () => {
      const sa = new ScanArray(3)
      expect(() => sa.get(3)).toThrow(RangeError)
    })

    it('throws on get from empty array', () => {
      const sa = new ScanArray()
      expect(() => sa.get(0)).toThrow(RangeError)
    })
  })

  describe('prefixSum', () => {
    it('returns 0 for all-zero array', () => {
      const sa = new ScanArray(5)
      expect(sa.prefixSum(0)).toBe(0)
      expect(sa.prefixSum(4)).toBe(0)
    })

    it('returns correct prefix sum for single element', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      expect(sa.prefixSum(0)).toBe(5)
    })

    it('returns correct prefix sum for multiple elements', () => {
      const sa = new ScanArray(5)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      sa.set(3, 4)
      sa.set(4, 5)
      expect(sa.prefixSum(0)).toBe(1)
      expect(sa.prefixSum(1)).toBe(3)
      expect(sa.prefixSum(2)).toBe(6)
      expect(sa.prefixSum(3)).toBe(10)
      expect(sa.prefixSum(4)).toBe(15)
    })

    it('handles negative values in prefix sum', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      sa.set(1, -3)
      sa.set(2, 2)
      expect(sa.prefixSum(0)).toBe(5)
      expect(sa.prefixSum(1)).toBe(2)
      expect(sa.prefixSum(2)).toBe(4)
    })

    it('returns correct prefix after overwrite', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(0, 10)
      expect(sa.prefixSum(0)).toBe(10)
      expect(sa.prefixSum(1)).toBe(12)
    })

    it('throws on empty array', () => {
      const sa = new ScanArray()
      expect(() => sa.prefixSum(0)).toThrow(RangeError)
    })

    it('throws on negative index', () => {
      const sa = new ScanArray(3)
      expect(() => sa.prefixSum(-1)).toThrow(RangeError)
    })
  })

  describe('rangeSum', () => {
    it('returns sum of full range', () => {
      const sa = new ScanArray(5)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      sa.set(3, 4)
      sa.set(4, 5)
      expect(sa.rangeSum(0, 4)).toBe(15)
    })

    it('returns sum of partial range from start', () => {
      const sa = new ScanArray(5)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      sa.set(3, 4)
      sa.set(4, 5)
      expect(sa.rangeSum(0, 2)).toBe(6)
    })

    it('returns sum of partial range to end', () => {
      const sa = new ScanArray(5)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      sa.set(3, 4)
      sa.set(4, 5)
      expect(sa.rangeSum(2, 4)).toBe(12)
    })

    it('returns single element when start equals end', () => {
      const sa = new ScanArray(5)
      sa.set(2, 42)
      expect(sa.rangeSum(2, 2)).toBe(42)
    })

    it('returns 0 when start > end', () => {
      const sa = new ScanArray(5)
      sa.set(0, 1)
      expect(sa.rangeSum(3, 1)).toBe(0)
    })

    it('handles negative values in range', () => {
      const sa = new ScanArray(4)
      sa.set(0, 10)
      sa.set(1, -5)
      sa.set(2, 3)
      sa.set(3, -2)
      expect(sa.rangeSum(0, 3)).toBe(6)
      expect(sa.rangeSum(1, 2)).toBe(-2)
    })

    it('throws on invalid start index', () => {
      const sa = new ScanArray(3)
      expect(() => sa.rangeSum(-1, 2)).toThrow(RangeError)
    })

    it('throws on invalid end index', () => {
      const sa = new ScanArray(3)
      expect(() => sa.rangeSum(0, 3)).toThrow(RangeError)
    })

    it('handles floating point sums', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1.5)
      sa.set(1, 2.5)
      sa.set(2, 3.0)
      expect(sa.rangeSum(0, 2)).toBeCloseTo(7.0)
    })
  })

  describe('update', () => {
    it('adds delta to value at index', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      sa.update(0, 3)
      expect(sa.get(0)).toBe(8)
    })

    it('handles negative delta', () => {
      const sa = new ScanArray(3)
      sa.set(0, 10)
      sa.update(0, -4)
      expect(sa.get(0)).toBe(6)
    })

    it('updates prefix sums after delta', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      sa.update(1, 5)
      expect(sa.prefixSum(0)).toBe(1)
      expect(sa.prefixSum(1)).toBe(8)
      expect(sa.prefixSum(2)).toBe(11)
    })

    it('updates range sums correctly after delta', () => {
      const sa = new ScanArray(4)
      sa.set(0, 1)
      sa.set(1, 1)
      sa.set(2, 1)
      sa.set(3, 1)
      sa.update(2, 10)
      expect(sa.rangeSum(0, 3)).toBe(14)
      expect(sa.rangeSum(2, 3)).toBe(12)
    })

    it('throws on invalid index', () => {
      const sa = new ScanArray(3)
      expect(() => sa.update(-1, 5)).toThrow(RangeError)
      expect(() => sa.update(3, 5)).toThrow(RangeError)
    })

    it('can update to negative value', () => {
      const sa = new ScanArray(3)
      sa.set(0, 2)
      sa.update(0, -10)
      expect(sa.get(0)).toBe(-8)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size after construction', () => {
      expect(new ScanArray().size).toBe(0)
      expect(new ScanArray(5).size).toBe(5)
    })

    it('returns correct isEmpty', () => {
      expect(new ScanArray().isEmpty).toBe(true)
      expect(new ScanArray(5).isEmpty).toBe(false)
    })

    it('size changes with push', () => {
      const sa = new ScanArray()
      sa.push(1)
      expect(sa.size).toBe(1)
      sa.push(2)
      expect(sa.size).toBe(2)
    })

    it('size changes with pop', () => {
      const sa = new ScanArray(3)
      sa.pop()
      expect(sa.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('clears all data', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      sa.clear()
      expect(sa.size).toBe(0)
      expect(sa.isEmpty).toBe(true)
      expect(sa.toArray()).toEqual([])
    })

    it('clear resets prefix sums', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      sa.clear()
      expect(sa.toPrefixArray()).toEqual([])
    })

    it('clear resets statistics', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      sa.prefixSum(0)
      sa.rangeSum(0, 2)
      sa.clear()
      const stats = sa.getStatistics()
      expect(stats.updates).toBe(0)
      expect(stats.prefixSums).toBe(0)
      expect(stats.rangeSums).toBe(0)
    })

    it('can use after clear', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      sa.clear()
      sa.push(10)
      expect(sa.size).toBe(1)
      expect(sa.get(0)).toBe(10)
    })
  })

  describe('toArray and toPrefixArray', () => {
    it('toArray returns copy of raw data', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      const arr = sa.toArray()
      expect(arr).toEqual([1, 2, 3])
      arr[0] = 99
      expect(sa.get(0)).toBe(1)
    })

    it('toPrefixArray returns copy of prefix sums', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      const arr = sa.toPrefixArray()
      expect(arr).toEqual([1, 3, 6])
      arr[0] = 99
      expect(sa.prefixSum(0)).toBe(1)
    })

    it('returns empty arrays for empty ScanArray', () => {
      const sa = new ScanArray()
      expect(sa.toArray()).toEqual([])
      expect(sa.toPrefixArray()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const sa = new ScanArray(3)
      sa.set(0, 10)
      sa.set(1, 20)
      sa.set(2, 30)
      const result: number[] = []
      sa.forEach((v) => result.push(v))
      expect(result).toEqual([10, 20, 30])
    })

    it('provides correct indices', () => {
      const sa = new ScanArray(3)
      sa.set(0, 10)
      sa.set(1, 20)
      sa.set(2, 30)
      const indices: number[] = []
      sa.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing on empty array', () => {
      const sa = new ScanArray()
      let count = 0
      sa.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable with for-of', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      const result: number[] = []
      for (const v of sa) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const sa = new ScanArray(3)
      sa.set(0, 5)
      sa.set(1, 10)
      sa.set(2, 15)
      expect([...sa]).toEqual([5, 10, 15])
    })

    it('works with Array.from', () => {
      const sa = new ScanArray(2)
      sa.set(0, 3)
      sa.set(1, 7)
      expect(Array.from(sa)).toEqual([3, 7])
    })

    it('empty iteration for empty array', () => {
      const sa = new ScanArray()
      expect([...sa]).toEqual([])
    })
  })

  describe('push', () => {
    it('appends value to empty array', () => {
      const sa = new ScanArray()
      sa.push(5)
      expect(sa.size).toBe(1)
      expect(sa.get(0)).toBe(5)
    })

    it('appends multiple values', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.toArray()).toEqual([1, 2, 3])
    })

    it('updates prefix sums correctly', () => {
      const sa = new ScanArray()
      sa.push(3)
      expect(sa.toPrefixArray()).toEqual([3])
      sa.push(5)
      expect(sa.toPrefixArray()).toEqual([3, 8])
      sa.push(2)
      expect(sa.toPrefixArray()).toEqual([3, 8, 10])
    })

    it('appends to pre-sized array', () => {
      const sa = new ScanArray(2)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.push(3)
      expect(sa.toArray()).toEqual([1, 2, 3])
      expect(sa.toPrefixArray()).toEqual([1, 3, 6])
    })

    it('handles negative push values', () => {
      const sa = new ScanArray()
      sa.push(5)
      sa.push(-3)
      expect(sa.toPrefixArray()).toEqual([5, 2])
    })

    it('handles zero push value', () => {
      const sa = new ScanArray()
      sa.push(0)
      expect(sa.toPrefixArray()).toEqual([0])
    })
  })

  describe('pop', () => {
    it('removes and returns last element', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      sa.push(3)
      expect(sa.pop()).toBe(3)
      expect(sa.toArray()).toEqual([1, 2])
    })

    it('returns undefined for empty array', () => {
      const sa = new ScanArray()
      expect(sa.pop()).toBeUndefined()
    })

    it('updates prefix sums after pop', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.pop()
      expect(sa.toPrefixArray()).toEqual([1, 3])
    })

    it('can pop all elements', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      expect(sa.pop()).toBe(2)
      expect(sa.pop()).toBe(1)
      expect(sa.isEmpty).toBe(true)
    })

    it('size decreases after pop', () => {
      const sa = new ScanArray(3)
      sa.pop()
      expect(sa.size).toBe(2)
    })

    it('pop from pre-sized array returns 0', () => {
      const sa = new ScanArray(3)
      expect(sa.pop()).toBe(0)
      expect(sa.size).toBe(2)
    })
  })

  describe('findFirst', () => {
    it('finds first index where prefix sum >= target', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.push(4)
      expect(sa.findFirst(1)).toBe(0)
      expect(sa.findFirst(3)).toBe(1)
      expect(sa.findFirst(6)).toBe(2)
      expect(sa.findFirst(10)).toBe(3)
    })

    it('returns -1 for empty array', () => {
      const sa = new ScanArray()
      expect(sa.findFirst(5)).toBe(-1)
    })

    it('returns -1 for sum <= 0', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      expect(sa.findFirst(0)).toBe(-1)
      expect(sa.findFirst(-1)).toBe(-1)
    })

    it('returns -1 when target exceeds total sum', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      expect(sa.findFirst(100)).toBe(-1)
    })

    it('finds exact match at first element', () => {
      const sa = new ScanArray()
      sa.push(5)
      sa.push(3)
      expect(sa.findFirst(5)).toBe(0)
    })

    it('finds index where prefix first exceeds target', () => {
      const sa = new ScanArray()
      sa.push(2)
      sa.push(2)
      sa.push(2)
      expect(sa.findFirst(3)).toBe(1)
    })

    it('handles single element array', () => {
      const sa = new ScanArray()
      sa.push(10)
      expect(sa.findFirst(5)).toBe(0)
      expect(sa.findFirst(10)).toBe(0)
      expect(sa.findFirst(11)).toBe(-1)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const sa = new ScanArray(3)
      const stats = sa.getStatistics()
      expect(stats.updates).toBe(0)
      expect(stats.prefixSums).toBe(0)
      expect(stats.rangeSums).toBe(0)
    })

    it('counts set operations as updates', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      expect(sa.getStatistics().updates).toBe(2)
    })

    it('counts update operations', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.update(0, 5)
      expect(sa.getStatistics().updates).toBe(2)
    })

    it('counts prefix sum calls', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.prefixSum(0)
      sa.prefixSum(1)
      expect(sa.getStatistics().prefixSums).toBe(2)
    })

    it('counts range sum calls', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.rangeSum(0, 1)
      expect(sa.getStatistics().rangeSums).toBe(1)
    })

    it('counts push operations', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      expect(sa.getStatistics().updates).toBe(2)
    })

    it('returns a copy of statistics', () => {
      const sa = new ScanArray(3)
      const stats1 = sa.getStatistics()
      const stats2 = sa.getStatistics()
      expect(stats1).toEqual(stats2)
      expect(stats1).not.toBe(stats2)
    })

    it('statistics persist across operations', () => {
      const sa = new ScanArray(3)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.prefixSum(0)
      sa.prefixSum(1)
      sa.prefixSum(2)
      sa.rangeSum(0, 2)
      sa.update(0, 5)
      sa.push(3)
      const stats = sa.getStatistics()
      expect(stats.updates).toBe(4)
      expect(stats.prefixSums).toBe(3)
      expect(stats.rangeSums).toBe(1)
    })
  })

  describe('exports from types', () => {
    it('exports DEFAULT_SCAN_ARRAY_OPTIONS', () => {
      expect(DEFAULT_SCAN_ARRAY_OPTIONS).toEqual({ initialSize: 0 })
    })

    it('ScanArrayOptions type is usable', () => {
      const opts: ScanArrayOptions = { initialSize: 5 }
      expect(opts.initialSize).toBe(5)
    })

    it('ScanArrayStatistics type is usable', () => {
      const stats: ScanArrayStatistics = { updates: 1, prefixSums: 2, rangeSums: 3 }
      expect(stats.updates).toBe(1)
    })
  })

  describe('combined operations', () => {
    it('push then rangeSum', () => {
      const sa = new ScanArray()
      sa.push(10)
      sa.push(20)
      sa.push(30)
      expect(sa.rangeSum(0, 2)).toBe(60)
    })

    it('push then set then rangeSum', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.set(1, 20)
      expect(sa.rangeSum(0, 2)).toBe(24)
    })

    it('multiple updates maintain consistency', () => {
      const sa = new ScanArray(4)
      sa.set(0, 1)
      sa.set(1, 2)
      sa.set(2, 3)
      sa.set(3, 4)
      expect(sa.prefixSum(3)).toBe(10)
      sa.update(2, 10)
      expect(sa.prefixSum(3)).toBe(20)
      sa.update(0, -5)
      expect(sa.prefixSum(3)).toBe(15)
      expect(sa.rangeSum(1, 3)).toBe(19)
    })

    it('push pop push maintains prefix consistency', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      sa.push(3)
      sa.pop()
      sa.push(10)
      expect(sa.toArray()).toEqual([1, 2, 10])
      expect(sa.toPrefixArray()).toEqual([1, 3, 13])
      expect(sa.prefixSum(2)).toBe(13)
    })

    it('clear then rebuild', () => {
      const sa = new ScanArray(3)
      sa.set(0, 100)
      sa.clear()
      sa.push(1)
      sa.push(2)
      expect(sa.prefixSum(1)).toBe(3)
      expect(sa.getStatistics().updates).toBe(2)
    })

    it('findFirst after multiple updates', () => {
      const sa = new ScanArray()
      sa.push(5)
      sa.push(3)
      sa.update(0, 2)
      expect(sa.findFirst(7)).toBe(0)
      expect(sa.findFirst(8)).toBe(1)
    })

    it('set on pushed elements updates prefix correctly', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(1)
      sa.push(1)
      sa.set(1, 5)
      expect(sa.prefixSum(0)).toBe(1)
      expect(sa.prefixSum(1)).toBe(6)
      expect(sa.prefixSum(2)).toBe(7)
    })

    it('rangeSum after push and update', () => {
      const sa = new ScanArray()
      sa.push(2)
      sa.push(4)
      sa.push(6)
      sa.update(1, 1)
      expect(sa.rangeSum(0, 2)).toBe(13)
    })

    it('large number of pushes', () => {
      const sa = new ScanArray()
      for (let i = 0; i < 100; i++) {
        sa.push(i + 1)
      }
      expect(sa.size).toBe(100)
      expect(sa.prefixSum(99)).toBe(5050)
    })

    it('pop down to empty then push', () => {
      const sa = new ScanArray()
      sa.push(1)
      sa.push(2)
      sa.pop()
      sa.pop()
      expect(sa.isEmpty).toBe(true)
      sa.push(42)
      expect(sa.size).toBe(1)
      expect(sa.get(0)).toBe(42)
    })

    it('mixed positive and negative values rangeSum', () => {
      const sa = new ScanArray(5)
      sa.set(0, 10)
      sa.set(1, -3)
      sa.set(2, 5)
      sa.set(3, -7)
      sa.set(4, 2)
      expect(sa.rangeSum(0, 4)).toBe(7)
      expect(sa.rangeSum(1, 3)).toBe(-5)
    })
  })
})
