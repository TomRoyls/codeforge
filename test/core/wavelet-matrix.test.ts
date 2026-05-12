import { describe, it, expect } from 'vitest'
import { WaveletMatrix } from '../../src/core/wavelet-matrix/index.js'

describe('WaveletMatrix', () => {
  describe('construction', () => {
    it('constructs from empty array', () => {
      const wm = new WaveletMatrix([])
      expect(wm.size()).toBe(0)
      expect(wm.isEmpty()).toBe(true)
      expect(wm.maxValue()).toBe(0)
    })

    it('constructs from single element', () => {
      const wm = new WaveletMatrix([5])
      expect(wm.size()).toBe(1)
      expect(wm.isEmpty()).toBe(false)
      expect(wm.maxValue()).toBe(5)
    })

    it('constructs from all zeros', () => {
      const wm = new WaveletMatrix([0, 0, 0, 0])
      expect(wm.size()).toBe(4)
      expect(wm.maxValue()).toBe(0)
    })

    it('constructs from small values', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(wm.size()).toBe(3)
      expect(wm.maxValue()).toBe(3)
    })

    it('constructs from sorted array', () => {
      const wm = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm.size()).toBe(5)
      expect(wm.maxValue()).toBe(5)
    })

    it('constructs from reverse sorted array', () => {
      const wm = new WaveletMatrix([5, 4, 3, 2, 1])
      expect(wm.size()).toBe(5)
      expect(wm.maxValue()).toBe(5)
    })

    it('constructs with explicit maxValue', () => {
      const wm = new WaveletMatrix([1, 2, 3], 10)
      expect(wm.maxValue()).toBe(10)
    })

    it('constructs from array with duplicates', () => {
      const wm = new WaveletMatrix([3, 1, 3, 2, 1, 3])
      expect(wm.size()).toBe(6)
      expect(wm.maxValue()).toBe(3)
    })

    it('constructs from all same values', () => {
      const wm = new WaveletMatrix([7, 7, 7, 7, 7])
      expect(wm.size()).toBe(5)
      expect(wm.maxValue()).toBe(7)
    })

    it('constructs from powers of two', () => {
      const wm = new WaveletMatrix([1, 2, 4, 8, 16, 32, 64])
      expect(wm.maxValue()).toBe(64)
    })

    it('constructs with large values up to 10^6', () => {
      const wm = new WaveletMatrix([0, 100000, 500000, 999999, 1000000])
      expect(wm.maxValue()).toBe(1000000)
      expect(wm.access(2)).toBe(500000)
    })
  })

  describe('access', () => {
    it('returns correct value at each position', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6]
      const wm = new WaveletMatrix(data)
      for (let i = 0; i < data.length; i++) {
        expect(wm.access(i)).toBe(data[i])
      }
    })

    it('throws on negative index', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(() => wm.access(-1)).toThrow(RangeError)
    })

    it('throws on index equal to size', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(() => wm.access(3)).toThrow(RangeError)
    })

    it('throws on index beyond size', () => {
      const wm = new WaveletMatrix([1, 2, 3])
      expect(() => wm.access(100)).toThrow(RangeError)
    })

    it('returns single element correctly', () => {
      const wm = new WaveletMatrix([42])
      expect(wm.access(0)).toBe(42)
    })

    it('handles zero values', () => {
      const wm = new WaveletMatrix([0, 0, 0])
      expect(wm.access(0)).toBe(0)
      expect(wm.access(1)).toBe(0)
      expect(wm.access(2)).toBe(0)
    })

    it('handles binary values 0 and 1', () => {
      const wm = new WaveletMatrix([0, 1, 1, 0, 1])
      expect(wm.access(0)).toBe(0)
      expect(wm.access(1)).toBe(1)
      expect(wm.access(3)).toBe(0)
    })
  })

  describe('rank', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const wm = new WaveletMatrix(data)

    it('counts occurrences of value 1 up to end=4', () => {
      expect(wm.rank(1, 4)).toBe(2)
    })

    it('counts occurrences of value 3 up to end=10', () => {
      expect(wm.rank(3, 10)).toBe(2)
    })

    it('counts occurrences of value 5 up to end=11', () => {
      expect(wm.rank(5, 11)).toBe(3)
    })

    it('returns 0 for value not in sequence', () => {
      expect(wm.rank(7, 11)).toBe(0)
    })

    it('returns 0 for value larger than max', () => {
      expect(wm.rank(100, 11)).toBe(0)
    })

    it('returns 0 for negative value', () => {
      expect(wm.rank(-1, 11)).toBe(0)
    })

    it('returns 0 for end=0', () => {
      expect(wm.rank(3, 0)).toBe(0)
    })

    it('returns 0 for negative end', () => {
      expect(wm.rank(3, -1)).toBe(0)
    })

    it('clamps end to size', () => {
      expect(wm.rank(5, 100)).toBe(3)
    })

    it('counts correctly with duplicates', () => {
      const wm2 = new WaveletMatrix([5, 5, 5, 5])
      expect(wm2.rank(5, 4)).toBe(4)
    })

    it('counts correctly for single element', () => {
      const wm2 = new WaveletMatrix([7])
      expect(wm2.rank(7, 1)).toBe(1)
      expect(wm2.rank(7, 0)).toBe(0)
    })

    it('rank at each position tracks cumulative count', () => {
      const wm2 = new WaveletMatrix([1, 2, 1, 3, 1])
      expect(wm2.rank(1, 1)).toBe(1)
      expect(wm2.rank(1, 2)).toBe(1)
      expect(wm2.rank(1, 3)).toBe(2)
      expect(wm2.rank(1, 4)).toBe(2)
      expect(wm2.rank(1, 5)).toBe(3)
    })

    it('works on empty wavelet matrix', () => {
      const wm2 = new WaveletMatrix([])
      expect(wm2.rank(0, 0)).toBe(0)
    })
  })

  describe('rankRange', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const wm = new WaveletMatrix(data)

    it('counts in middle range', () => {
      expect(wm.rankRange(5, 4, 11)).toBe(3)
    })

    it('counts in single element range', () => {
      expect(wm.rankRange(3, 0, 1)).toBe(1)
    })

    it('returns 0 for empty range', () => {
      expect(wm.rankRange(3, 3, 3)).toBe(0)
    })

    it('returns 0 for inverted range', () => {
      expect(wm.rankRange(3, 5, 3)).toBe(0)
    })

    it('counts correctly at boundaries', () => {
      expect(wm.rankRange(1, 0, 2)).toBe(1)
      expect(wm.rankRange(1, 0, 4)).toBe(2)
    })

    it('clamps negative start', () => {
      expect(wm.rankRange(3, -5, 11)).toBe(2)
    })

    it('clamps end beyond size', () => {
      expect(wm.rankRange(5, 0, 100)).toBe(3)
    })

    it('works on full range', () => {
      expect(wm.rankRange(5, 0, data.length)).toBe(3)
    })
  })

  describe('select', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const wm = new WaveletMatrix(data)

    it('finds first occurrence of 1', () => {
      expect(wm.select(1, 0)).toBe(1)
    })

    it('finds second occurrence of 1', () => {
      expect(wm.select(1, 1)).toBe(3)
    })

    it('returns -1 for non-existent k-th occurrence', () => {
      expect(wm.select(1, 2)).toBe(-1)
    })

    it('finds first occurrence of 5', () => {
      expect(wm.select(5, 0)).toBe(4)
    })

    it('finds second occurrence of 5', () => {
      expect(wm.select(5, 1)).toBe(8)
    })

    it('finds third occurrence of 5', () => {
      expect(wm.select(5, 2)).toBe(10)
    })

    it('returns -1 for value not in sequence', () => {
      expect(wm.select(7, 0)).toBe(-1)
    })

    it('returns -1 for negative k', () => {
      expect(wm.select(3, -1)).toBe(-1)
    })

    it('finds occurrence of value appearing once', () => {
      expect(wm.select(9, 0)).toBe(5)
    })

    it('returns -1 for value appearing once with k=1', () => {
      expect(wm.select(9, 1)).toBe(-1)
    })

    it('works with binary values', () => {
      const wm2 = new WaveletMatrix([0, 1, 0, 1, 0])
      expect(wm2.select(0, 0)).toBe(0)
      expect(wm2.select(0, 1)).toBe(2)
      expect(wm2.select(0, 2)).toBe(4)
      expect(wm2.select(1, 0)).toBe(1)
      expect(wm2.select(1, 1)).toBe(3)
    })

    it('returns -1 on empty wavelet matrix', () => {
      const wm2 = new WaveletMatrix([])
      expect(wm2.select(0, 0)).toBe(-1)
    })
  })

  describe('quantile / kthSmallest', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const wm = new WaveletMatrix(data)

    it('finds minimum in full range (k=0)', () => {
      expect(wm.quantile(0, data.length, 0)).toBe(1)
    })

    it('finds maximum in full range', () => {
      expect(wm.quantile(0, data.length, data.length - 1)).toBe(9)
    })

    it('finds median-ish values', () => {
      const sorted = [...data].sort((a, b) => a - b)
      for (let k = 0; k < data.length; k++) {
        expect(wm.quantile(0, data.length, k)).toBe(sorted[k])
      }
    })

    it('finds kth smallest in subrange', () => {
      const sub = data.slice(2, 7)
      const sorted = [...sub].sort((a, b) => a - b)
      for (let k = 0; k < sub.length; k++) {
        expect(wm.quantile(2, 7, k)).toBe(sorted[k])
      }
    })

    it('kthSmallest is alias for quantile', () => {
      expect(wm.kthSmallest(0, data.length, 0)).toBe(wm.quantile(0, data.length, 0))
      expect(wm.kthSmallest(0, data.length, 5)).toBe(wm.quantile(0, data.length, 5))
    })

    it('throws on invalid k', () => {
      expect(() => wm.quantile(0, 3, 5)).toThrow(RangeError)
    })

    it('throws on negative k', () => {
      expect(() => wm.quantile(0, 3, -1)).toThrow(RangeError)
    })

    it('works with single element range', () => {
      expect(wm.quantile(0, 1, 0)).toBe(data[0])
    })

    it('works with sorted input', () => {
      const wm2 = new WaveletMatrix([1, 2, 3, 4, 5])
      expect(wm2.quantile(0, 5, 0)).toBe(1)
      expect(wm2.quantile(0, 5, 2)).toBe(3)
      expect(wm2.quantile(0, 5, 4)).toBe(5)
    })
  })

  describe('kthLargest', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const wm = new WaveletMatrix(data)

    it('finds largest (k=0)', () => {
      expect(wm.kthLargest(0, data.length, 0)).toBe(9)
    })

    it('finds smallest via kthLargest', () => {
      expect(wm.kthLargest(0, data.length, data.length - 1)).toBe(1)
    })

    it('finds kth largest correctly for all positions', () => {
      const sorted = [...data].sort((a, b) => a - b)
      for (let k = 0; k < data.length; k++) {
        expect(wm.kthLargest(0, data.length, k)).toBe(sorted[sorted.length - 1 - k])
      }
    })

    it('works with subrange', () => {
      const sub = data.slice(4, 9)
      const sorted = [...sub].sort((a, b) => a - b)
      for (let k = 0; k < sub.length; k++) {
        expect(wm.kthLargest(4, 9, k)).toBe(sorted[sorted.length - 1 - k])
      }
    })
  })

  describe('rangeCount', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const wm = new WaveletMatrix(data)

    it('counts all values in [1, 9]', () => {
      expect(wm.rangeCount(0, data.length, 1, 9)).toBe(data.length)
    })

    it('counts values in narrow range [3, 3]', () => {
      expect(wm.rangeCount(0, data.length, 3, 3)).toBe(2)
    })

    it('counts values in [1, 3]', () => {
      const expected = data.filter(v => v >= 1 && v <= 3).length
      expect(wm.rangeCount(0, data.length, 1, 3)).toBe(expected)
    })

    it('counts values in [5, 9]', () => {
      const expected = data.filter(v => v >= 5 && v <= 9).length
      expect(wm.rangeCount(0, data.length, 5, 9)).toBe(expected)
    })

    it('returns 0 for range with no values', () => {
      expect(wm.rangeCount(0, data.length, 7, 7)).toBe(0)
    })

    it('returns 0 for range above max', () => {
      expect(wm.rangeCount(0, data.length, 10, 100)).toBe(0)
    })

    it('returns 0 for range below min', () => {
      expect(wm.rangeCount(0, data.length, -5, 0)).toBe(0)
    })

    it('works with subrange', () => {
      const sub = data.slice(0, 5)
      const expected = sub.filter(v => v >= 1 && v <= 3).length
      expect(wm.rangeCount(0, 5, 1, 3)).toBe(expected)
    })

    it('returns 0 for empty range', () => {
      expect(wm.rangeCount(3, 3, 1, 9)).toBe(0)
    })

    it('handles clamped bounds', () => {
      expect(wm.rangeCount(-5, 100, 1, 5)).toBe(
        data.filter(v => v >= 1 && v <= 5).length
      )
    })
  })

  describe('rangeList', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const wm = new WaveletMatrix(data)

    it('lists all values in [3, 5]', () => {
      const result = wm.rangeList(0, data.length, 3, 5)
      const expected = data.filter(v => v >= 3 && v <= 5).sort((a, b) => a - b)
      expect([...result].sort((a, b) => a - b)).toEqual(expected)
    })

    it('lists values in [1, 2] from full range', () => {
      const result = wm.rangeList(0, data.length, 1, 2)
      const expected = data.filter(v => v >= 1 && v <= 2).sort((a, b) => a - b)
      expect([...result].sort((a, b) => a - b)).toEqual(expected)
    })

    it('returns empty for range with no values', () => {
      const result = wm.rangeList(0, data.length, 7, 7)
      expect(result).toEqual([])
    })

    it('returns empty for empty subrange', () => {
      const result = wm.rangeList(3, 3, 1, 9)
      expect(result).toEqual([])
    })

    it('lists single value range', () => {
      const result = wm.rangeList(0, data.length, 9, 9)
      expect(result).toEqual([9])
    })

    it('lists from subrange', () => {
      const sub = data.slice(2, 7)
      const result = wm.rangeList(2, 7, 1, 5)
      const expected = sub.filter(v => v >= 1 && v <= 5).sort((a, b) => a - b)
      expect([...result].sort((a, b) => a - b)).toEqual(expected)
    })

    it('lists all values when range covers everything', () => {
      const result = wm.rangeList(0, data.length, 0, 100)
      expect(result.sort((a, b) => a - b)).toEqual([...data].sort((a, b) => a - b))
    })

    it('returns empty for range above max', () => {
      expect(wm.rangeList(0, data.length, 10, 100)).toEqual([])
    })

    it('returns empty for range below min', () => {
      expect(wm.rangeList(0, data.length, -5, 0)).toEqual([])
    })
  })

  describe('toArray', () => {
    it('reconstructs original array', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })

    it('handles empty array', () => {
      const wm = new WaveletMatrix([])
      expect(wm.toArray()).toEqual([])
    })

    it('handles single element', () => {
      const wm = new WaveletMatrix([42])
      expect(wm.toArray()).toEqual([42])
    })

    it('handles all same values', () => {
      const wm = new WaveletMatrix([5, 5, 5, 5])
      expect(wm.toArray()).toEqual([5, 5, 5, 5])
    })

    it('handles sorted array', () => {
      const data = [1, 2, 3, 4, 5]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })

    it('handles reverse sorted array', () => {
      const data = [5, 4, 3, 2, 1]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })

    it('roundtrip with various values', () => {
      const data = [0, 255, 256, 65535, 65536, 1000000]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })
  })

  describe('size, isEmpty, maxValue', () => {
    it('size returns correct length', () => {
      expect(new WaveletMatrix([1, 2, 3]).size()).toBe(3)
      expect(new WaveletMatrix([]).size()).toBe(0)
      expect(new WaveletMatrix([1]).size()).toBe(1)
    })

    it('isEmpty returns true for empty', () => {
      expect(new WaveletMatrix([]).isEmpty()).toBe(true)
      expect(new WaveletMatrix([1]).isEmpty()).toBe(false)
      expect(new WaveletMatrix([1, 2]).isEmpty()).toBe(false)
    })

    it('maxValue returns max from data', () => {
      expect(new WaveletMatrix([1, 2, 3]).maxValue()).toBe(3)
      expect(new WaveletMatrix([10, 1, 5]).maxValue()).toBe(10)
      expect(new WaveletMatrix([0]).maxValue()).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles array of all zeros', () => {
      const wm = new WaveletMatrix([0, 0, 0, 0, 0])
      expect(wm.toArray()).toEqual([0, 0, 0, 0, 0])
      expect(wm.rank(0, 5)).toBe(5)
      expect(wm.rank(1, 5)).toBe(0)
      expect(wm.quantile(0, 5, 0)).toBe(0)
      expect(wm.quantile(0, 5, 4)).toBe(0)
    })

    it('handles array of all same positive values', () => {
      const wm = new WaveletMatrix([7, 7, 7, 7])
      expect(wm.toArray()).toEqual([7, 7, 7, 7])
      expect(wm.rank(7, 4)).toBe(4)
      expect(wm.select(7, 0)).toBe(0)
      expect(wm.select(7, 3)).toBe(3)
    })

    it('handles single element array', () => {
      const wm = new WaveletMatrix([42])
      expect(wm.access(0)).toBe(42)
      expect(wm.rank(42, 1)).toBe(1)
      expect(wm.rank(42, 0)).toBe(0)
      expect(wm.select(42, 0)).toBe(0)
      expect(wm.select(42, 1)).toBe(-1)
      expect(wm.quantile(0, 1, 0)).toBe(42)
      expect(wm.kthLargest(0, 1, 0)).toBe(42)
      expect(wm.rangeCount(0, 1, 42, 42)).toBe(1)
    })

    it('handles two element array', () => {
      const wm = new WaveletMatrix([5, 3])
      expect(wm.access(0)).toBe(5)
      expect(wm.access(1)).toBe(3)
      expect(wm.kthSmallest(0, 2, 0)).toBe(3)
      expect(wm.kthSmallest(0, 2, 1)).toBe(5)
    })

    it('handles values that are powers of two', () => {
      const data = [1, 2, 4, 8, 16, 32, 64, 128]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })

    it('handles value 0 mixed with others', () => {
      const data = [0, 5, 0, 3, 0, 1]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
      expect(wm.rank(0, 6)).toBe(3)
      expect(wm.select(0, 0)).toBe(0)
      expect(wm.select(0, 1)).toBe(2)
      expect(wm.select(0, 2)).toBe(4)
    })

    it('handles consecutive identical values', () => {
      const data = [1, 1, 1, 2, 2, 2, 3, 3, 3]
      const wm = new WaveletMatrix(data)
      expect(wm.rank(1, 3)).toBe(3)
      expect(wm.rank(2, 6)).toBe(3)
      expect(wm.rank(3, 9)).toBe(3)
    })
  })

  describe('large array stress test', () => {
    const size = 1000
    const maxValue = 100
    const data: number[] = []
    const seed = 12345
    let rng = seed
    const nextRandom = () => {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff
      return rng % (maxValue + 1)
    }

    for (let i = 0; i < size; i++) {
      data.push(nextRandom())
    }

    const wm = new WaveletMatrix(data)

    it('toArray roundtrip on 1000 elements', () => {
      expect(wm.toArray()).toEqual(data)
    })

    it('access on random positions', () => {
      for (let i = 0; i < 100; i++) {
        const idx = nextRandom() % size
        expect(wm.access(idx)).toBe(data[idx])
      }
    })

    it('rank on random values and positions', () => {
      for (let i = 0; i < 50; i++) {
        const val = nextRandom()
        const end = nextRandom() % (size + 1)
        const expected = data.slice(0, end).filter(v => v === val).length
        expect(wm.rank(val, end)).toBe(expected)
      }
    })

    it('rankRange on random ranges', () => {
      for (let i = 0; i < 50; i++) {
        const val = nextRandom()
        let start = nextRandom() % size
        let end = nextRandom() % size
        if (start > end) { const tmp = start; start = end; end = tmp }
        const expected = data.slice(start, end).filter(v => v === val).length
        expect(wm.rankRange(val, start, end)).toBe(expected)
      }
    })

    it('select on random values', () => {
      for (let i = 0; i < 50; i++) {
        const val = nextRandom()
        const occurrences: number[] = []
        for (let j = 0; j < data.length; j++) {
          if (data[j] === val) occurrences.push(j)
        }
        if (occurrences.length > 0) {
          const k = nextRandom() % occurrences.length
          expect(wm.select(val, k)).toBe(occurrences[k])
        }
      }
    })

    it('quantile on random ranges', () => {
      for (let i = 0; i < 50; i++) {
        let start = nextRandom() % size
        let end = start + 1 + (nextRandom() % Math.min(20, size - start))
        if (end > size) end = size
        const sub = data.slice(start, end)
        const sorted = [...sub].sort((a, b) => a - b)
        const k = nextRandom() % sorted.length
        expect(wm.quantile(start, end, k)).toBe(sorted[k])
      }
    })

    it('kthLargest on random ranges', () => {
      for (let i = 0; i < 30; i++) {
        let start = nextRandom() % size
        let end = start + 1 + (nextRandom() % Math.min(20, size - start))
        if (end > size) end = size
        const sub = data.slice(start, end)
        const sorted = [...sub].sort((a, b) => a - b)
        const k = nextRandom() % sorted.length
        expect(wm.kthLargest(start, end, k)).toBe(sorted[sorted.length - 1 - k])
      }
    })

    it('rangeCount on random ranges', () => {
      for (let i = 0; i < 50; i++) {
        let start = nextRandom() % size
        let end = start + 1 + (nextRandom() % Math.min(50, size - start))
        if (end > size) end = size
        const minV = nextRandom()
        const maxV = minV + nextRandom() % 20
        const expected = data.slice(start, end).filter(v => v >= minV && v <= maxV).length
        expect(wm.rangeCount(start, end, minV, maxV)).toBe(expected)
      }
    })

    it('rangeList on random ranges', () => {
      for (let i = 0; i < 20; i++) {
        let start = nextRandom() % size
        let end = start + 1 + (nextRandom() % Math.min(30, size - start))
        if (end > size) end = size
        const minV = nextRandom()
        const maxV = minV + nextRandom() % 10
        const result = wm.rangeList(start, end, minV, maxV)
        const expected = data.slice(start, end).filter(v => v >= minV && v <= maxV).sort((a, b) => a - b)
        expect([...result].sort((a, b) => a - b)).toEqual(expected)
      }
    })
  })

  describe('boundary values', () => {
    it('handles value 0 with higher values', () => {
      const wm = new WaveletMatrix([0, 255])
      expect(wm.access(0)).toBe(0)
      expect(wm.access(1)).toBe(255)
    })

    it('handles 8-bit boundary values', () => {
      const data = [0, 127, 128, 255]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })

    it('handles 16-bit boundary values', () => {
      const data = [0, 32767, 32768, 65535]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })

    it('handles values near power boundaries', () => {
      const data = [7, 8, 15, 16, 31, 32, 63, 64]
      const wm = new WaveletMatrix(data)
      expect(wm.toArray()).toEqual(data)
    })

    it('handles large sparse values', () => {
      const data = [0, 500000, 1000000]
      const wm = new WaveletMatrix(data)
      expect(wm.access(0)).toBe(0)
      expect(wm.access(1)).toBe(500000)
      expect(wm.access(2)).toBe(1000000)
      expect(wm.rank(500000, 3)).toBe(1)
      expect(wm.select(1000000, 0)).toBe(2)
    })
  })

  describe('duplicates handling', () => {
    it('handles all duplicates', () => {
      const wm = new WaveletMatrix([3, 3, 3, 3, 3])
      expect(wm.rank(3, 5)).toBe(5)
      expect(wm.select(3, 0)).toBe(0)
      expect(wm.select(3, 4)).toBe(4)
      expect(wm.select(3, 5)).toBe(-1)
    })

    it('handles interleaved duplicates', () => {
      const data = [1, 2, 1, 2, 1, 2]
      const wm = new WaveletMatrix(data)
      expect(wm.rank(1, 6)).toBe(3)
      expect(wm.rank(2, 6)).toBe(3)
      expect(wm.select(1, 0)).toBe(0)
      expect(wm.select(1, 1)).toBe(2)
      expect(wm.select(1, 2)).toBe(4)
    })

    it('handles many duplicates of few values', () => {
      const data = [1, 2, 3, 1, 2, 3, 1, 2, 3]
      const wm = new WaveletMatrix(data)
      expect(wm.rank(1, 9)).toBe(3)
      expect(wm.rank(2, 9)).toBe(3)
      expect(wm.rank(3, 9)).toBe(3)
      expect(wm.kthSmallest(0, 9, 0)).toBe(1)
      expect(wm.kthSmallest(0, 9, 8)).toBe(3)
    })
  })

  describe('comprehensive select verification', () => {
    it('select returns indices that match rank and access', () => {
      const data = [5, 3, 7, 1, 3, 5, 9, 3]
      const wm = new WaveletMatrix(data)
      const uniqueVals = [...new Set(data)]
      for (const val of uniqueVals) {
        const count = data.filter(v => v === val).length
        for (let k = 0; k < count; k++) {
          const idx = wm.select(val, k)
          expect(idx).toBeGreaterThanOrEqual(0)
          expect(wm.access(idx)).toBe(val)
          expect(wm.rank(val, idx + 1)).toBe(k + 1)
        }
      }
    })
  })

  describe('comprehensive quantile verification', () => {
    it('quantile matches sorted order for many subranges', () => {
      const data = [10, 5, 8, 3, 12, 7, 1, 15, 6, 9]
      const wm = new WaveletMatrix(data)
      for (let start = 0; start < data.length; start++) {
        for (let end = start + 1; end <= data.length; end++) {
          const sub = data.slice(start, end)
          const sorted = [...sub].sort((a, b) => a - b)
          for (let k = 0; k < sorted.length; k++) {
            expect(wm.quantile(start, end, k)).toBe(sorted[k])
          }
        }
      }
    })
  })

  describe('rangeCount comprehensive', () => {
    it('rangeCount matches brute force for all subranges', () => {
      const data = [4, 2, 6, 1, 8, 3, 5, 7]
      const wm = new WaveletMatrix(data)
      for (let start = 0; start < data.length; start++) {
        for (let end = start + 1; end <= data.length; end++) {
          for (let minV = 0; minV <= 10; minV++) {
            for (let maxV = minV; maxV <= 10; maxV++) {
              const expected = data.slice(start, end).filter(v => v >= minV && v <= maxV).length
              expect(wm.rangeCount(start, end, minV, maxV)).toBe(expected)
            }
          }
        }
      }
    })
  })

  describe('rangeList comprehensive', () => {
    it('rangeList matches brute force', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6]
      const wm = new WaveletMatrix(data)
      const result = wm.rangeList(0, data.length, 1, 5)
      const expected = data.filter(v => v >= 1 && v <= 5).sort((a, b) => a - b)
      expect([...result].sort((a, b) => a - b)).toEqual(expected)
    })

    it('rangeList with narrow range returns exact matches', () => {
      const data = [1, 2, 3, 4, 5, 4, 3, 2, 1]
      const wm = new WaveletMatrix(data)
      const result = wm.rangeList(0, data.length, 3, 3)
      expect(result.sort((a, b) => a - b)).toEqual([3, 3])
    })
  })

  describe('consistency checks', () => {
    it('rank and select are inverses', () => {
      const data = [3, 7, 1, 9, 5, 3, 7, 1, 5, 9]
      const wm = new WaveletMatrix(data)
      for (const val of new Set(data)) {
        const count = data.filter(v => v === val).length
        for (let k = 0; k < count; k++) {
          const idx = wm.select(val, k)
          expect(wm.rank(val, idx + 1)).toBe(k + 1)
          expect(wm.rank(val, idx)).toBe(k)
        }
      }
    })

    it('rankRange equals rank difference', () => {
      const data = [2, 5, 3, 8, 1, 7, 4, 6]
      const wm = new WaveletMatrix(data)
      for (const val of new Set(data)) {
        for (let start = 0; start < data.length; start++) {
          for (let end = start + 1; end <= data.length; end++) {
            expect(wm.rankRange(val, start, end)).toBe(
              wm.rank(val, end) - wm.rank(val, start)
            )
          }
        }
      }
    })

    it('kthSmallest and kthLargest are consistent', () => {
      const data = [4, 2, 7, 1, 5, 3, 6]
      const wm = new WaveletMatrix(data)
      const n = data.length
      for (let k = 0; k < n; k++) {
        expect(wm.kthSmallest(0, n, k)).toBe(wm.kthLargest(0, n, n - 1 - k))
      }
    })

    it('rangeCount equals rangeList length', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
      const wm = new WaveletMatrix(data)
      for (let minV = 0; minV <= 10; minV++) {
        for (let maxV = minV; maxV <= 10; maxV++) {
          const count = wm.rangeCount(0, data.length, minV, maxV)
          const list = wm.rangeList(0, data.length, minV, maxV)
          expect(list.length).toBe(count)
        }
      }
    })
  })
})
