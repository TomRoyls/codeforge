import { describe, it, expect } from 'vitest'
import { WaveletTree } from '../../src/core/wavelet-tree/wavelet-tree.js'
import type { WaveletNode, WaveletTreeData } from '../../src/core/wavelet-tree/types.js'

describe('WaveletTree', () => {
  describe('constructor', () => {
    it('should build from a simple sequence', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wt.length()).toBe(8)
    })

    it('should handle empty sequence', () => {
      const wt = new WaveletTree([])
      expect(wt.length()).toBe(0)
    })

    it('should handle single element', () => {
      const wt = new WaveletTree([42])
      expect(wt.length()).toBe(1)
      expect(wt.access(0)).toBe(42)
    })

    it('should handle all same elements', () => {
      const wt = new WaveletTree([5, 5, 5, 5, 5])
      expect(wt.length()).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(wt.access(i)).toBe(5)
      }
    })

    it('should handle negative numbers', () => {
      const wt = new WaveletTree([-3, -1, 0, 1, 3])
      expect(wt.length()).toBe(5)
      expect(wt.access(0)).toBe(-3)
      expect(wt.access(4)).toBe(3)
    })

    it('should handle two elements', () => {
      const wt = new WaveletTree([1, 2])
      expect(wt.length()).toBe(2)
      expect(wt.access(0)).toBe(1)
      expect(wt.access(1)).toBe(2)
    })

    it('should handle duplicates', () => {
      const wt = new WaveletTree([1, 2, 1, 2, 1])
      expect(wt.length()).toBe(5)
    })

    it('should handle large range of values', () => {
      const seq = [0, 100, 200, 300, 400]
      const wt = new WaveletTree(seq)
      for (let i = 0; i < seq.length; i++) {
        expect(wt.access(i)).toBe(seq[i])
      }
    })

    it('should handle all negative numbers', () => {
      const wt = new WaveletTree([-5, -3, -1, -3, -5])
      expect(wt.access(0)).toBe(-5)
      expect(wt.access(2)).toBe(-1)
    })

    it('should handle binary values (0 and 1)', () => {
      const wt = new WaveletTree([0, 1, 0, 1, 0])
      expect(wt.access(0)).toBe(0)
      expect(wt.access(1)).toBe(1)
    })

    it('should handle a power-of-2 length sequence', () => {
      const wt = new WaveletTree([1, 2, 3, 4, 5, 6, 7, 8])
      expect(wt.length()).toBe(8)
      for (let i = 0; i < 8; i++) {
        expect(wt.access(i)).toBe(i + 1)
      }
    })

    it('should handle sequence with many duplicates', () => {
      const wt = new WaveletTree([1, 1, 1, 2, 2, 2, 3, 3, 3])
      expect(wt.length()).toBe(9)
      expect(wt.access(0)).toBe(1)
      expect(wt.access(3)).toBe(2)
      expect(wt.access(6)).toBe(3)
    })
  })

  describe('access', () => {
    const seq = [3, 1, 4, 1, 5, 9, 2, 6]
    let wt: WaveletTree

    beforeEach(() => {
      wt = new WaveletTree(seq)
    })

    it('should return correct element at index 0', () => {
      expect(wt.access(0)).toBe(3)
    })

    it('should return correct element at last index', () => {
      expect(wt.access(7)).toBe(6)
    })

    it('should return correct element at each position', () => {
      for (let i = 0; i < seq.length; i++) {
        expect(wt.access(i)).toBe(seq[i])
      }
    })

    it('should throw for negative index', () => {
      expect(() => wt.access(-1)).toThrow()
    })

    it('should throw for index equal to length', () => {
      expect(() => wt.access(8)).toThrow()
    })

    it('should throw for index beyond length', () => {
      expect(() => wt.access(100)).toThrow()
    })

    it('should throw for empty tree', () => {
      const empty = new WaveletTree([])
      expect(() => empty.access(0)).toThrow()
    })

    it('should handle single element access', () => {
      const single = new WaveletTree([7])
      expect(single.access(0)).toBe(7)
    })

    it('should handle access with negative values', () => {
      const neg = new WaveletTree([-10, -5, 0, 5, 10])
      expect(neg.access(0)).toBe(-10)
      expect(neg.access(4)).toBe(10)
    })
  })

  describe('rank', () => {
    const seq = [3, 1, 4, 1, 5, 9, 2, 6]
    let wt: WaveletTree

    beforeEach(() => {
      wt = new WaveletTree(seq)
    })

    it('should count occurrences of 1 from start to index 4', () => {
      expect(wt.rank(1, 4)).toBe(2)
    })

    it('should count occurrences of 3 from start to index 1', () => {
      expect(wt.rank(3, 1)).toBe(1)
    })

    it('should return 0 for symbol not in range', () => {
      expect(wt.rank(3, 0)).toBe(0)
    })

    it('should count all occurrences when index equals length', () => {
      expect(wt.rank(1, 8)).toBe(2)
    })

    it('should return 0 for symbol not in sequence', () => {
      expect(wt.rank(99, 8)).toBe(0)
    })

    it('should return 0 for index 0', () => {
      expect(wt.rank(3, 0)).toBe(0)
    })

    it('should handle single element rank', () => {
      const single = new WaveletTree([5])
      expect(single.rank(5, 1)).toBe(1)
      expect(single.rank(5, 0)).toBe(0)
    })

    it('should throw for negative index', () => {
      expect(() => wt.rank(1, -1)).toThrow()
    })

    it('should throw for index beyond length', () => {
      expect(() => wt.rank(1, 9)).toThrow()
    })

    it('should count correctly for all same elements', () => {
      const same = new WaveletTree([5, 5, 5, 5])
      expect(same.rank(5, 2)).toBe(2)
      expect(same.rank(5, 4)).toBe(4)
    })

    it('should count correctly with negative symbols', () => {
      const neg = new WaveletTree([-1, -2, -1, 0, -1])
      expect(neg.rank(-1, 5)).toBe(3)
      expect(neg.rank(-2, 5)).toBe(1)
      expect(neg.rank(0, 5)).toBe(1)
    })

    it('should handle rank at each position', () => {
      for (let i = 0; i <= seq.length; i++) {
        let count = 0
        for (let j = 0; j < i; j++) {
          if (seq[j] === 1) count++
        }
        expect(wt.rank(1, i)).toBe(count)
      }
    })

    it('should return 0 for empty tree', () => {
      const empty = new WaveletTree([])
      expect(empty.rank(1, 0)).toBe(0)
    })

    it('should handle binary values rank', () => {
      const bin = new WaveletTree([0, 1, 0, 1, 0])
      expect(bin.rank(0, 5)).toBe(3)
      expect(bin.rank(1, 5)).toBe(2)
    })
  })

  describe('rangeCount', () => {
    const seq = [3, 1, 4, 1, 5, 9, 2, 6]
    let wt: WaveletTree

    beforeEach(() => {
      wt = new WaveletTree(seq)
    })

    it('should count symbol in full range', () => {
      expect(wt.rangeCount(0, 8, 1)).toBe(2)
    })

    it('should count symbol in partial range', () => {
      expect(wt.rangeCount(0, 3, 3)).toBe(1)
    })

    it('should count symbol in single-element range', () => {
      expect(wt.rangeCount(0, 1, 3)).toBe(1)
    })

    it('should return 0 for symbol not present in range', () => {
      expect(wt.rangeCount(2, 4, 5)).toBe(0)
    })

    it('should return 0 for empty range (left == right)', () => {
      expect(wt.rangeCount(3, 3, 1)).toBe(0)
    })

    it('should return 0 for invalid range (left > right)', () => {
      expect(wt.rangeCount(5, 3, 1)).toBe(0)
    })

    it('should return 0 for negative left', () => {
      expect(wt.rangeCount(-1, 3, 1)).toBe(0)
    })

    it('should return 0 for right beyond length', () => {
      expect(wt.rangeCount(0, 100, 1)).toBe(0)
    })

    it('should handle rangeCount with all same elements', () => {
      const same = new WaveletTree([5, 5, 5, 5])
      expect(same.rangeCount(1, 3, 5)).toBe(2)
    })

    it('should handle rangeCount with negative values', () => {
      const neg = new WaveletTree([-1, -2, -1, 0, -1])
      expect(neg.rangeCount(0, 5, -1)).toBe(3)
    })

    it('should match rank difference', () => {
      expect(wt.rangeCount(1, 6, 1)).toBe(wt.rank(1, 6) - wt.rank(1, 1))
    })

    it('should handle single element range not matching', () => {
      expect(wt.rangeCount(0, 1, 1)).toBe(0)
    })

    it('should handle single element range matching', () => {
      expect(wt.rangeCount(1, 2, 1)).toBe(1)
    })
  })

  describe('rangeFreq', () => {
    const seq = [3, 1, 4, 1, 5, 9, 2, 6]
    let wt: WaveletTree

    beforeEach(() => {
      wt = new WaveletTree(seq)
    })

    it('should count all elements in full range when min/max covers all', () => {
      expect(wt.rangeFreq(0, 8, 0, 10)).toBe(8)
    })

    it('should count elements in specific value range', () => {
      expect(wt.rangeFreq(0, 8, 1, 3)).toBe(4)
    })

    it('should count single value range', () => {
      expect(wt.rangeFreq(0, 8, 1, 1)).toBe(2)
    })

    it('should return correct count for existing range', () => {
      expect(wt.rangeFreq(0, 8, 6, 6)).toBe(1)
    })

    it('should handle empty range', () => {
      expect(wt.rangeFreq(3, 3, 0, 10)).toBe(0)
    })

    it('should handle invalid range', () => {
      expect(wt.rangeFreq(5, 3, 0, 10)).toBe(0)
    })

    it('should handle min > max', () => {
      expect(wt.rangeFreq(0, 8, 10, 1)).toBe(0)
    })

    it('should count in subrange', () => {
      expect(wt.rangeFreq(0, 4, 1, 4)).toBe(4)
    })

    it('should handle negative value ranges', () => {
      const neg = new WaveletTree([-3, -1, 0, 1, 3])
      expect(neg.rangeFreq(0, 5, -3, 0)).toBe(3)
    })

    it('should handle rangeFreq equal to rank difference for single symbol', () => {
      expect(wt.rangeFreq(0, 8, 1, 1)).toBe(wt.rangeCount(0, 8, 1))
    })

    it('should handle all same elements', () => {
      const same = new WaveletTree([5, 5, 5, 5])
      expect(same.rangeFreq(0, 4, 5, 5)).toBe(4)
      expect(same.rangeFreq(0, 4, 1, 10)).toBe(4)
      expect(same.rangeFreq(0, 4, 1, 4)).toBe(0)
    })

    it('should handle rangeFreq on empty tree', () => {
      const empty = new WaveletTree([])
      expect(empty.rangeFreq(0, 0, 0, 10)).toBe(0)
    })

    it('should handle single element tree', () => {
      const single = new WaveletTree([5])
      expect(single.rangeFreq(0, 1, 5, 5)).toBe(1)
      expect(single.rangeFreq(0, 1, 1, 4)).toBe(0)
    })

    it('should handle large value range in subrange', () => {
      expect(wt.rangeFreq(2, 6, 1, 9)).toBe(4)
    })

    it('should handle rangeFreq where min equals max and not in sequence', () => {
      expect(wt.rangeFreq(0, 8, 7, 7)).toBe(0)
    })

    it('should handle rangeFreq for max value in sequence', () => {
      expect(wt.rangeFreq(0, 8, 9, 9)).toBe(1)
    })

    it('should handle rangeFreq for min value in sequence', () => {
      expect(wt.rangeFreq(0, 8, 1, 1)).toBe(2)
    })

    it('should count correctly with negative numbers', () => {
      const neg = new WaveletTree([-5, -3, -1, -3, -5])
      expect(neg.rangeFreq(0, 5, -5, -3)).toBe(4)
      expect(neg.rangeFreq(0, 5, -3, -1)).toBe(3)
    })
  })

  describe('quantile', () => {
    const seq = [3, 1, 4, 1, 5, 9, 2, 6]
    let wt: WaveletTree

    beforeEach(() => {
      wt = new WaveletTree(seq)
    })

    it('should find minimum (k=0) in full range', () => {
      expect(wt.quantile(0, 8, 0)).toBe(1)
    })

    it('should find maximum (k=7) in full range', () => {
      expect(wt.quantile(0, 8, 7)).toBe(9)
    })

    it('should find median in full range', () => {
      expect(wt.quantile(0, 8, 3)).toBe(3)
    })

    it('should find quantile in sub range', () => {
      expect(wt.quantile(0, 3, 0)).toBe(1)
    })

    it('should handle single element range', () => {
      expect(wt.quantile(0, 1, 0)).toBe(3)
    })

    it('should throw for negative k', () => {
      expect(() => wt.quantile(0, 8, -1)).toThrow()
    })

    it('should throw for k >= range size', () => {
      expect(() => wt.quantile(0, 8, 8)).toThrow()
    })

    it('should throw for invalid range', () => {
      expect(() => wt.quantile(5, 3, 0)).toThrow()
    })

    it('should throw for negative left', () => {
      expect(() => wt.quantile(-1, 8, 0)).toThrow()
    })

    it('should throw for right beyond length', () => {
      expect(() => wt.quantile(0, 100, 0)).toThrow()
    })

    it('should throw for empty tree', () => {
      const empty = new WaveletTree([])
      expect(() => empty.quantile(0, 0, 0)).toThrow()
    })

    it('should handle all same elements', () => {
      const same = new WaveletTree([5, 5, 5, 5])
      expect(same.quantile(0, 4, 0)).toBe(5)
      expect(same.quantile(0, 4, 3)).toBe(5)
    })

    it('should handle two elements', () => {
      const two = new WaveletTree([2, 1])
      expect(two.quantile(0, 2, 0)).toBe(1)
      expect(two.quantile(0, 2, 1)).toBe(2)
    })

    it('should handle negative numbers', () => {
      const neg = new WaveletTree([-1, -3, 0, 2, -2])
      expect(neg.quantile(0, 5, 0)).toBe(-3)
      expect(neg.quantile(0, 5, 4)).toBe(2)
    })

    it('should find correct quantile at each position', () => {
      const sorted = [...seq].sort((a, b) => a - b)
      for (let k = 0; k < sorted.length; k++) {
        expect(wt.quantile(0, 8, k)).toBe(sorted[k])
      }
    })

    it('should handle subrange quantile', () => {
      expect(wt.quantile(2, 5, 0)).toBe(1)
      expect(wt.quantile(2, 5, 2)).toBe(5)
    })
  })

  describe('kthSmallest', () => {
    it('should be an alias for quantile', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wt.kthSmallest(0, 8, 0)).toBe(wt.quantile(0, 8, 0))
      expect(wt.kthSmallest(0, 8, 7)).toBe(wt.quantile(0, 8, 7))
      expect(wt.kthSmallest(0, 8, 3)).toBe(wt.quantile(0, 8, 3))
    })

    it('should find 1st smallest', () => {
      const wt = new WaveletTree([5, 2, 8, 1, 9])
      expect(wt.kthSmallest(0, 5, 0)).toBe(1)
    })

    it('should find last smallest (max)', () => {
      const wt = new WaveletTree([5, 2, 8, 1, 9])
      expect(wt.kthSmallest(0, 5, 4)).toBe(9)
    })

    it('should handle single element', () => {
      const wt = new WaveletTree([42])
      expect(wt.kthSmallest(0, 1, 0)).toBe(42)
    })
  })

  describe('length', () => {
    it('should return sequence length', () => {
      const wt = new WaveletTree([1, 2, 3])
      expect(wt.length()).toBe(3)
    })

    it('should return 0 for empty sequence', () => {
      const wt = new WaveletTree([])
      expect(wt.length()).toBe(0)
    })

    it('should return 1 for single element', () => {
      const wt = new WaveletTree([1])
      expect(wt.length()).toBe(1)
    })

    it('should handle large sequence', () => {
      const seq = Array.from({ length: 1000 }, (_, i) => i)
      const wt = new WaveletTree(seq)
      expect(wt.length()).toBe(1000)
    })
  })

  describe('getAlphabet', () => {
    it('should return sorted unique symbols', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wt.getAlphabet()).toEqual([1, 2, 3, 4, 5, 6, 9])
    })

    it('should return empty array for empty sequence', () => {
      const wt = new WaveletTree([])
      expect(wt.getAlphabet()).toEqual([])
    })

    it('should return single element for single element sequence', () => {
      const wt = new WaveletTree([5])
      expect(wt.getAlphabet()).toEqual([5])
    })

    it('should handle all same elements', () => {
      const wt = new WaveletTree([5, 5, 5])
      expect(wt.getAlphabet()).toEqual([5])
    })

    it('should handle negative numbers', () => {
      const wt = new WaveletTree([-1, -3, 0, 2])
      expect(wt.getAlphabet()).toEqual([-3, -1, 0, 2])
    })

    it('should return a copy (not the internal array)', () => {
      const wt = new WaveletTree([1, 2, 3])
      const alpha = wt.getAlphabet()
      alpha.push(999)
      expect(wt.getAlphabet()).toEqual([1, 2, 3])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      const cl = wt.clone()
      expect(cl.length()).toBe(wt.length())
      expect(cl.getAlphabet()).toEqual(wt.getAlphabet())
    })

    it('should not affect original when clone is used', () => {
      const wt = new WaveletTree([3, 1, 4])
      const cl = wt.clone()
      expect(cl.access(0)).toBe(wt.access(0))
    })

    it('should produce same results for all methods', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      const cl = wt.clone()
      for (let i = 0; i < 8; i++) {
        expect(cl.access(i)).toBe(wt.access(i))
      }
      expect(cl.rank(1, 8)).toBe(wt.rank(1, 8))
      expect(cl.rangeCount(0, 8, 1)).toBe(wt.rangeCount(0, 8, 1))
      expect(cl.quantile(0, 8, 0)).toBe(wt.quantile(0, 8, 0))
      expect(cl.rangeFreq(0, 8, 1, 5)).toBe(wt.rangeFreq(0, 8, 1, 5))
    })

    it('should handle empty tree clone', () => {
      const wt = new WaveletTree([])
      const cl = wt.clone()
      expect(cl.length()).toBe(0)
      expect(cl.getAlphabet()).toEqual([])
    })

    it('should handle single element clone', () => {
      const wt = new WaveletTree([42])
      const cl = wt.clone()
      expect(cl.access(0)).toBe(42)
      expect(cl.length()).toBe(1)
    })

    it('should deep-copy alphabet', () => {
      const wt = new WaveletTree([1, 2, 3])
      const cl = wt.clone()
      const alpha1 = wt.getAlphabet()
      const alpha2 = cl.getAlphabet()
      expect(alpha1).toEqual(alpha2)
      expect(alpha1).not.toBe(alpha2)
    })

    it('should handle clone of all same elements', () => {
      const wt = new WaveletTree([5, 5, 5, 5])
      const cl = wt.clone()
      expect(cl.length()).toBe(4)
      expect(cl.rank(5, 4)).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('should handle sequence with zero', () => {
      const wt = new WaveletTree([0, 0, 0])
      expect(wt.access(0)).toBe(0)
      expect(wt.rank(0, 3)).toBe(3)
    })

    it('should handle sequence with large gap between values', () => {
      const wt = new WaveletTree([0, 1000, 0, 1000])
      expect(wt.access(0)).toBe(0)
      expect(wt.access(1)).toBe(1000)
      expect(wt.rank(0, 4)).toBe(2)
      expect(wt.rank(1000, 4)).toBe(2)
    })

    it('should handle strictly increasing sequence', () => {
      const wt = new WaveletTree([1, 2, 3, 4, 5])
      for (let i = 0; i < 5; i++) {
        expect(wt.access(i)).toBe(i + 1)
        expect(wt.rank(i + 1, i + 1)).toBe(1)
      }
    })

    it('should handle strictly decreasing sequence', () => {
      const wt = new WaveletTree([5, 4, 3, 2, 1])
      for (let i = 0; i < 5; i++) {
        expect(wt.access(i)).toBe(5 - i)
      }
      expect(wt.quantile(0, 5, 0)).toBe(1)
      expect(wt.quantile(0, 5, 4)).toBe(5)
    })

    it('should handle single unique value with many duplicates', () => {
      const wt = new WaveletTree([7, 7, 7, 7, 7, 7, 7])
      expect(wt.length()).toBe(7)
      expect(wt.getAlphabet()).toEqual([7])
      expect(wt.rank(7, 7)).toBe(7)
      expect(wt.rangeCount(2, 5, 7)).toBe(3)
      expect(wt.rangeFreq(0, 7, 7, 7)).toBe(7)
      expect(wt.quantile(0, 7, 3)).toBe(7)
    })

    it('should handle alternating two values', () => {
      const wt = new WaveletTree([1, 2, 1, 2, 1, 2, 1, 2])
      expect(wt.rank(1, 8)).toBe(4)
      expect(wt.rank(2, 8)).toBe(4)
      expect(wt.rangeFreq(0, 8, 1, 2)).toBe(8)
    })

    it('should handle many duplicates of few values', () => {
      const seq: number[] = []
      for (let i = 0; i < 50; i++) seq.push(1)
      for (let i = 0; i < 50; i++) seq.push(2)
      const wt = new WaveletTree(seq)
      expect(wt.rank(1, 100)).toBe(50)
      expect(wt.rank(2, 100)).toBe(50)
      expect(wt.quantile(0, 100, 49)).toBe(1)
      expect(wt.quantile(0, 100, 50)).toBe(2)
    })

    it('should handle consecutive duplicate pairs', () => {
      const wt = new WaveletTree([1, 1, 2, 2, 3, 3])
      expect(wt.rank(1, 6)).toBe(2)
      expect(wt.rank(2, 6)).toBe(2)
      expect(wt.rank(3, 6)).toBe(2)
      expect(wt.quantile(0, 6, 2)).toBe(2)
    })
  })

  describe('consistency checks', () => {
    it('access and rank should be consistent', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      for (let i = 0; i < seq.length; i++) {
        const val = wt.access(i)
        let expected = 0
        for (let j = 0; j <= i; j++) {
          if (seq[j] === val) expected++
        }
        expect(wt.rank(val, i + 1)).toBe(expected)
      }
    })

    it('rangeCount and rank should be consistent', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      for (let l = 0; l < seq.length; l++) {
        for (let r = l + 1; r <= seq.length; r++) {
          for (const s of [1, 2, 3, 4, 5, 6, 9]) {
            expect(wt.rangeCount(l, r, s)).toBe(wt.rank(s, r) - wt.rank(s, l))
          }
        }
      }
    })

    it('rangeFreq should equal sum of rangeCount for individual symbols', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      expect(wt.rangeFreq(0, 8, 1, 4)).toBe(
        wt.rangeCount(0, 8, 1) + wt.rangeCount(0, 8, 2) + wt.rangeCount(0, 8, 3) + wt.rangeCount(0, 8, 4)
      )
    })

    it('quantile should be consistent with sorted access', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      const sorted = [...seq].sort((a, b) => a - b)
      for (let k = 0; k < sorted.length; k++) {
        expect(wt.quantile(0, 8, k)).toBe(sorted[k])
      }
    })

    it('clone should produce identical results for all operations', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      const cl = wt.clone()
      for (let i = 0; i < 8; i++) {
        expect(cl.access(i)).toBe(wt.access(i))
      }
      for (const s of wt.getAlphabet()) {
        expect(cl.rank(s, 8)).toBe(wt.rank(s, 8))
      }
    })
  })

  describe('large sequences', () => {
    it('should handle 500 elements', () => {
      const seq = Array.from({ length: 500 }, (_, i) => i % 10)
      const wt = new WaveletTree(seq)
      expect(wt.length()).toBe(500)
      expect(wt.rank(0, 500)).toBe(50)
      expect(wt.rank(5, 500)).toBe(50)
      expect(wt.rangeFreq(0, 500, 0, 9)).toBe(500)
    })

    it('should handle 200 unique values', () => {
      const seq = Array.from({ length: 200 }, (_, i) => i)
      const wt = new WaveletTree(seq)
      expect(wt.length()).toBe(200)
      expect(wt.access(0)).toBe(0)
      expect(wt.access(199)).toBe(199)
      expect(wt.rank(100, 200)).toBe(1)
      expect(wt.quantile(0, 200, 0)).toBe(0)
      expect(wt.quantile(0, 200, 199)).toBe(199)
    })

    it('should handle repeated pattern', () => {
      const seq: number[] = []
      for (let i = 0; i < 100; i++) {
        seq.push(i % 3)
      }
      const wt = new WaveletTree(seq)
      expect(wt.rank(0, 100)).toBe(34)
      expect(wt.rank(1, 100)).toBe(33)
      expect(wt.rank(2, 100)).toBe(33)
    })
  })

  describe('WaveletNode type export', () => {
    it('should export WaveletNode type', () => {
      const node: WaveletNode = {
        bitvector: [0, 1, 0],
        rankPrefix: [0, 0, 1, 1],
        left: null,
        right: null,
        lo: 0,
        hi: 0,
      }
      expect(node.bitvector.length).toBe(3)
      expect(node.lo).toBe(0)
      expect(node.hi).toBe(0)
    })
  })

  describe('WaveletTreeData type export', () => {
    it('should export WaveletTreeData type', () => {
      const data: WaveletTreeData = {
        root: null,
        dataSize: 0,
        alphabet: [],
        symbolToIndex: new Map(),
      }
      expect(data.dataSize).toBe(0)
      expect(data.alphabet).toEqual([])
    })
  })

  describe('comprehensive rank verification', () => {
    it('should correctly rank every symbol at every position', () => {
      const seq = [2, 0, 1, 2, 0, 1, 2]
      const wt = new WaveletTree(seq)
      for (const sym of [0, 1, 2]) {
        for (let i = 0; i <= seq.length; i++) {
          let count = 0
          for (let j = 0; j < i; j++) {
            if (seq[j] === sym) count++
          }
          expect(wt.rank(sym, i)).toBe(count)
        }
      }
    })

    it('should correctly rank with 5 unique symbols', () => {
      const seq = [4, 2, 0, 3, 1, 4, 2, 0, 3, 1]
      const wt = new WaveletTree(seq)
      for (let i = 0; i <= seq.length; i++) {
        for (const sym of [0, 1, 2, 3, 4]) {
          let count = 0
          for (let j = 0; j < i; j++) {
            if (seq[j] === sym) count++
          }
          expect(wt.rank(sym, i)).toBe(count)
        }
      }
    })
  })

  describe('rangeFreq comprehensive', () => {
    it('should handle all symbols range', () => {
      const seq = [1, 3, 2, 5, 4]
      const wt = new WaveletTree(seq)
      expect(wt.rangeFreq(0, 5, 1, 5)).toBe(5)
    })

    it('should handle narrow range matching one symbol', () => {
      const seq = [1, 3, 2, 5, 4]
      const wt = new WaveletTree(seq)
      expect(wt.rangeFreq(0, 5, 2, 2)).toBe(1)
    })

    it('should handle range outside sequence values', () => {
      const seq = [1, 3, 2, 5, 4]
      const wt = new WaveletTree(seq)
      expect(wt.rangeFreq(0, 5, 10, 20)).toBe(0)
    })

    it('should handle range below sequence values', () => {
      const seq = [1, 3, 2, 5, 4]
      const wt = new WaveletTree(seq)
      expect(wt.rangeFreq(0, 5, -5, -1)).toBe(0)
    })

    it('should handle partial overlap with sequence values', () => {
      const seq = [1, 3, 2, 5, 4]
      const wt = new WaveletTree(seq)
      expect(wt.rangeFreq(0, 5, 0, 2)).toBe(2)
    })
  })

  describe('quantile comprehensive', () => {
    it('should find all quantiles for sorted range', () => {
      const seq = [5, 3, 1, 4, 2]
      const wt = new WaveletTree(seq)
      const sorted = [1, 2, 3, 4, 5]
      for (let k = 0; k < 5; k++) {
        expect(wt.quantile(0, 5, k)).toBe(sorted[k])
      }
    })

    it('should find quantile in sub-range correctly', () => {
      const seq = [5, 3, 1, 4, 2]
      const wt = new WaveletTree(seq)
      expect(wt.quantile(1, 4, 0)).toBe(1)
      expect(wt.quantile(1, 4, 2)).toBe(4)
    })

    it('should handle quantile with duplicates', () => {
      const wt = new WaveletTree([1, 2, 2, 3, 3, 3])
      expect(wt.quantile(0, 6, 0)).toBe(1)
      expect(wt.quantile(0, 6, 1)).toBe(2)
      expect(wt.quantile(0, 6, 2)).toBe(2)
      expect(wt.quantile(0, 6, 3)).toBe(3)
      expect(wt.quantile(0, 6, 4)).toBe(3)
      expect(wt.quantile(0, 6, 5)).toBe(3)
    })
  })

  describe('mixed operations', () => {
    it('should handle access after rank', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      wt.rank(1, 5)
      expect(wt.access(2)).toBe(4)
    })

    it('should handle quantile after rangeCount', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      wt.rangeCount(0, 5, 1)
      expect(wt.quantile(0, 5, 0)).toBe(1)
    })

    it('should handle clone after multiple operations', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      wt.rank(1, 5)
      wt.access(2)
      wt.rangeCount(0, 5, 3)
      const cl = wt.clone()
      expect(cl.access(2)).toBe(4)
    })

    it('should handle all methods on same tree', () => {
      const wt = new WaveletTree([2, 0, 1, 2, 1, 0])
      expect(wt.length()).toBe(6)
      expect(wt.access(0)).toBe(2)
      expect(wt.rank(0, 6)).toBe(2)
      expect(wt.rangeCount(1, 4, 1)).toBe(1)
      expect(wt.rangeFreq(0, 6, 0, 1)).toBe(4)
      expect(wt.quantile(0, 6, 0)).toBe(0)
      expect(wt.kthSmallest(0, 6, 5)).toBe(2)
      expect(wt.getAlphabet()).toEqual([0, 1, 2])
      const cl = wt.clone()
      expect(cl.length()).toBe(6)
    })
  })
})
