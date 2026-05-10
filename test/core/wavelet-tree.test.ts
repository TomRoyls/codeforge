import { describe, it, expect, beforeEach } from 'vitest'
import { WaveletTree } from '../../src/core/wavelet-tree/wavelet-tree.js'
import type { WaveletTreeNode, WaveletTreeOptions, RankAllResult, WaveletTreeStats } from '../../src/core/wavelet-tree/types.js'

describe('WaveletTree', () => {
  describe('constructor', () => {
    it('should build from a simple sequence', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wt.length).toBe(8)
    })

    it('should handle empty sequence', () => {
      const wt = new WaveletTree([])
      expect(wt.length).toBe(0)
    })

    it('should handle single element', () => {
      const wt = new WaveletTree([42])
      expect(wt.length).toBe(1)
      expect(wt.access(0)).toBe(42)
    })

    it('should handle all same elements', () => {
      const wt = new WaveletTree([5, 5, 5, 5, 5])
      expect(wt.length).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(wt.access(i)).toBe(5)
      }
    })

    it('should handle negative numbers', () => {
      const wt = new WaveletTree([-3, -1, 0, 1, 3])
      expect(wt.length).toBe(5)
      expect(wt.access(0)).toBe(-3)
      expect(wt.access(4)).toBe(3)
    })

    it('should handle two elements', () => {
      const wt = new WaveletTree([1, 2])
      expect(wt.length).toBe(2)
      expect(wt.access(0)).toBe(1)
      expect(wt.access(1)).toBe(2)
    })

    it('should handle duplicates', () => {
      const wt = new WaveletTree([1, 2, 1, 2, 1])
      expect(wt.length).toBe(5)
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

    it('should handle power-of-2 length sequence', () => {
      const wt = new WaveletTree([1, 2, 3, 4, 5, 6, 7, 8])
      expect(wt.length).toBe(8)
      for (let i = 0; i < 8; i++) {
        expect(wt.access(i)).toBe(i + 1)
      }
    })

    it('should handle sequence with many duplicates', () => {
      const wt = new WaveletTree([1, 1, 1, 2, 2, 2, 3, 3, 3])
      expect(wt.length).toBe(9)
      expect(wt.access(0)).toBe(1)
      expect(wt.access(3)).toBe(2)
      expect(wt.access(6)).toBe(3)
    })

    it('should accept alphabet option', () => {
      const wt = new WaveletTree([1, 2, 3], { alphabet: [1, 2, 3] })
      expect(wt.length).toBe(3)
      expect(wt.alphabet).toEqual([1, 2, 3])
    })

    it('should derive alphabet from data when not provided', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      expect(wt.alphabet).toEqual([1, 3, 4, 5])
    })

    it('should throw when data contains value not in provided alphabet', () => {
      expect(() => new WaveletTree([1, 2, 3], { alphabet: [1, 2] })).toThrow()
    })

    it('should handle empty data with provided alphabet', () => {
      const wt = new WaveletTree([], { alphabet: [1, 2, 3] })
      expect(wt.length).toBe(0)
      expect(wt.alphabet).toEqual([1, 2, 3])
    })

    it('should sort provided alphabet', () => {
      const wt = new WaveletTree([3, 1, 2], { alphabet: [3, 1, 2] })
      expect(wt.alphabet).toEqual([1, 2, 3])
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

    it('should handle access on all same elements', () => {
      const same = new WaveletTree([5, 5, 5, 5])
      for (let i = 0; i < 4; i++) {
        expect(same.access(i)).toBe(5)
      }
    })

    it('should handle access on strictly increasing sequence', () => {
      const inc = new WaveletTree([1, 2, 3, 4, 5])
      for (let i = 0; i < 5; i++) {
        expect(inc.access(i)).toBe(i + 1)
      }
    })

    it('should handle access on strictly decreasing sequence', () => {
      const dec = new WaveletTree([5, 4, 3, 2, 1])
      for (let i = 0; i < 5; i++) {
        expect(dec.access(i)).toBe(5 - i)
      }
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

    it('should count correctly for every symbol at every position', () => {
      const seq2 = [2, 0, 1, 2, 0, 1, 2]
      const wt2 = new WaveletTree(seq2)
      for (const sym of [0, 1, 2]) {
        for (let i = 0; i <= seq2.length; i++) {
          let count = 0
          for (let j = 0; j < i; j++) {
            if (seq2[j] === sym) count++
          }
          expect(wt2.rank(sym, i)).toBe(count)
        }
      }
    })
  })

  describe('select', () => {
    const seq = [3, 1, 4, 1, 5, 9, 2, 6]
    let wt: WaveletTree

    beforeEach(() => {
      wt = new WaveletTree(seq)
    })

    it('should find first occurrence of element', () => {
      expect(wt.select(3, 1)).toBe(0)
    })

    it('should find second occurrence of element', () => {
      expect(wt.select(1, 1)).toBe(1)
      expect(wt.select(1, 2)).toBe(3)
    })

    it('should find only occurrence of unique element', () => {
      expect(wt.select(9, 1)).toBe(5)
    })

    it('should find last occurrence of element', () => {
      expect(wt.select(6, 1)).toBe(7)
    })

    it('should throw for occurrence less than 1', () => {
      expect(() => wt.select(1, 0)).toThrow()
      expect(() => wt.select(1, -1)).toThrow()
    })

    it('should throw for element not in alphabet', () => {
      expect(() => wt.select(99, 1)).toThrow()
    })

    it('should throw when occurrence exceeds count', () => {
      expect(() => wt.select(9, 2)).toThrow()
    })

    it('should throw on empty tree', () => {
      const empty = new WaveletTree([])
      expect(() => empty.select(1, 1)).toThrow()
    })

    it('should handle all same elements', () => {
      const same = new WaveletTree([5, 5, 5, 5])
      expect(same.select(5, 1)).toBe(0)
      expect(same.select(5, 2)).toBe(1)
      expect(same.select(5, 3)).toBe(2)
      expect(same.select(5, 4)).toBe(3)
    })

    it('should handle single element', () => {
      const single = new WaveletTree([42])
      expect(single.select(42, 1)).toBe(0)
      expect(() => single.select(42, 2)).toThrow()
    })

    it('should handle negative values', () => {
      const neg = new WaveletTree([-1, -2, -1, 0, -1])
      expect(neg.select(-1, 1)).toBe(0)
      expect(neg.select(-1, 2)).toBe(2)
      expect(neg.select(-1, 3)).toBe(4)
      expect(neg.select(0, 1)).toBe(3)
    })

    it('should be consistent with rank', () => {
      for (const sym of wt.alphabet) {
        const total = wt.rank(sym, wt.length)
        for (let k = 1; k <= total; k++) {
          const pos = wt.select(sym, k)
          expect(wt.access(pos)).toBe(sym)
          expect(wt.rank(sym, pos + 1)).toBe(k)
        }
      }
    })

    it('should handle two elements', () => {
      const two = new WaveletTree([2, 1])
      expect(two.select(2, 1)).toBe(0)
      expect(two.select(1, 1)).toBe(1)
    })

    it('should handle binary values', () => {
      const bin = new WaveletTree([0, 1, 0, 1, 0])
      expect(bin.select(0, 1)).toBe(0)
      expect(bin.select(0, 2)).toBe(2)
      expect(bin.select(0, 3)).toBe(4)
      expect(bin.select(1, 1)).toBe(1)
      expect(bin.select(1, 2)).toBe(3)
    })
  })

  describe('length', () => {
    it('should return sequence length', () => {
      const wt = new WaveletTree([1, 2, 3])
      expect(wt.length).toBe(3)
    })

    it('should return 0 for empty sequence', () => {
      const wt = new WaveletTree([])
      expect(wt.length).toBe(0)
    })

    it('should return 1 for single element', () => {
      const wt = new WaveletTree([1])
      expect(wt.length).toBe(1)
    })

    it('should handle large sequence', () => {
      const seq = Array.from({ length: 1000 }, (_, i) => i)
      const wt = new WaveletTree(seq)
      expect(wt.length).toBe(1000)
    })

    it('should be a getter not a method', () => {
      const wt = new WaveletTree([1, 2, 3])
      expect(typeof Object.getOwnPropertyDescriptor(Object.getPrototypeOf(wt), 'length')?.get).toBe('function')
    })
  })

  describe('alphabet', () => {
    it('should return sorted unique symbols', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(wt.alphabet).toEqual([1, 2, 3, 4, 5, 6, 9])
    })

    it('should return empty array for empty sequence', () => {
      const wt = new WaveletTree([])
      expect(wt.alphabet).toEqual([])
    })

    it('should return single element for single element sequence', () => {
      const wt = new WaveletTree([5])
      expect(wt.alphabet).toEqual([5])
    })

    it('should handle all same elements', () => {
      const wt = new WaveletTree([5, 5, 5])
      expect(wt.alphabet).toEqual([5])
    })

    it('should handle negative numbers', () => {
      const wt = new WaveletTree([-1, -3, 0, 2])
      expect(wt.alphabet).toEqual([-3, -1, 0, 2])
    })

    it('should return a copy not the internal array', () => {
      const wt = new WaveletTree([1, 2, 3])
      const alpha = wt.alphabet
      alpha.push(999)
      expect(wt.alphabet).toEqual([1, 2, 3])
    })

    it('should be a getter not a method', () => {
      const wt = new WaveletTree([1, 2, 3])
      expect(typeof Object.getOwnPropertyDescriptor(Object.getPrototypeOf(wt), 'alphabet')?.get).toBe('function')
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const wt = new WaveletTree([])
      expect(wt.toArray()).toEqual([])
    })

    it('should return single element array', () => {
      const wt = new WaveletTree([42])
      expect(wt.toArray()).toEqual([42])
    })

    it('should return original sequence', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      expect(wt.toArray()).toEqual(seq)
    })

    it('should return correct array for all same elements', () => {
      const wt = new WaveletTree([5, 5, 5, 5])
      expect(wt.toArray()).toEqual([5, 5, 5, 5])
    })

    it('should preserve order not sort', () => {
      const wt = new WaveletTree([5, 3, 1, 4, 2])
      expect(wt.toArray()).toEqual([5, 3, 1, 4, 2])
    })

    it('should handle negative numbers', () => {
      const wt = new WaveletTree([-1, -3, 0, 2])
      expect(wt.toArray()).toEqual([-1, -3, 0, 2])
    })

    it('should handle binary values', () => {
      const wt = new WaveletTree([0, 1, 0, 1, 0])
      expect(wt.toArray()).toEqual([0, 1, 0, 1, 0])
    })

    it('should return a new array each call', () => {
      const wt = new WaveletTree([1, 2, 3])
      const arr1 = wt.toArray()
      const arr2 = wt.toArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })

    it('should handle strictly increasing sequence', () => {
      const wt = new WaveletTree([1, 2, 3, 4, 5])
      expect(wt.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      const wt = new WaveletTree([])
      let count = 0
      wt.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback for each element', () => {
      const wt = new WaveletTree([3, 1, 4])
      const elements: number[] = []
      wt.forEach((el) => { elements.push(el) })
      expect(elements).toEqual([3, 1, 4])
    })

    it('should pass correct index', () => {
      const wt = new WaveletTree([10, 20, 30])
      const indices: number[] = []
      wt.forEach((_el, idx) => { indices.push(idx) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('should pass correct element and index together', () => {
      const seq = [3, 1, 4, 1, 5]
      const wt = new WaveletTree(seq)
      const pairs: [number, number][] = []
      wt.forEach((el, idx) => { pairs.push([el, idx]) })
      for (let i = 0; i < seq.length; i++) {
        expect(pairs[i]).toEqual([seq[i], i])
      }
    })

    it('should handle all same elements', () => {
      const wt = new WaveletTree([5, 5, 5])
      const elements: number[] = []
      wt.forEach((el) => { elements.push(el) })
      expect(elements).toEqual([5, 5, 5])
    })

    it('should iterate in order', () => {
      const wt = new WaveletTree([5, 3, 1, 4, 2])
      const result: number[] = []
      wt.forEach((el) => { result.push(el) })
      expect(result).toEqual([5, 3, 1, 4, 2])
    })

    it('should handle single element', () => {
      const wt = new WaveletTree([42])
      let called = false
      wt.forEach((el, idx) => {
        called = true
        expect(el).toBe(42)
        expect(idx).toBe(0)
      })
      expect(called).toBe(true)
    })

    it('should handle negative values', () => {
      const wt = new WaveletTree([-1, -3, 0, 2])
      const result: number[] = []
      wt.forEach((el) => { result.push(el) })
      expect(result).toEqual([-1, -3, 0, 2])
    })

    it('should iterate the same number of times as length', () => {
      const wt = new WaveletTree([1, 2, 3, 4, 5])
      let count = 0
      wt.forEach(() => { count++ })
      expect(count).toBe(wt.length)
    })
  })

  describe('rankAll', () => {
    it('should return correct counts for element in sequence', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      const result = wt.rankAll(3)
      expect(result.rankEqual).toBe(1)
      expect(result.rankLess).toBe(3)
      expect(result.rankGreater).toBe(4)
    })

    it('should return correct counts for minimum element', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      const result = wt.rankAll(1)
      expect(result.rankEqual).toBe(2)
      expect(result.rankLess).toBe(0)
      expect(result.rankGreater).toBe(6)
    })

    it('should return correct counts for maximum element', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      const result = wt.rankAll(9)
      expect(result.rankEqual).toBe(1)
      expect(result.rankLess).toBe(7)
      expect(result.rankGreater).toBe(0)
    })

    it('should handle element not in sequence', () => {
      const wt = new WaveletTree([1, 3, 5])
      const result = wt.rankAll(7)
      expect(result.rankEqual).toBe(0)
      expect(result.rankLess).toBe(3)
      expect(result.rankGreater).toBe(0)
    })

    it('should handle element below minimum', () => {
      const wt = new WaveletTree([1, 3, 5])
      const result = wt.rankAll(-10)
      expect(result.rankEqual).toBe(0)
      expect(result.rankLess).toBe(0)
      expect(result.rankGreater).toBe(3)
    })

    it('should return zeros for empty tree', () => {
      const wt = new WaveletTree([])
      const result = wt.rankAll(5)
      expect(result).toEqual({ rankLess: 0, rankEqual: 0, rankGreater: 0 })
    })

    it('should handle single element', () => {
      const wt = new WaveletTree([42])
      const result = wt.rankAll(42)
      expect(result).toEqual({ rankLess: 0, rankEqual: 1, rankGreater: 0 })
    })

    it('should handle all same elements', () => {
      const wt = new WaveletTree([5, 5, 5, 5])
      const result = wt.rankAll(5)
      expect(result).toEqual({ rankLess: 0, rankEqual: 4, rankGreater: 0 })
    })

    it('should satisfy rankLess + rankEqual + rankGreater = length', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      for (const val of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        const r = wt.rankAll(val)
        expect(r.rankLess + r.rankEqual + r.rankGreater).toBe(seq.length)
      }
    })

    it('should be consistent with rank method', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      for (const sym of wt.alphabet) {
        const r = wt.rankAll(sym)
        expect(r.rankEqual).toBe(wt.rank(sym, wt.length))
      }
    })

    it('should handle negative values', () => {
      const wt = new WaveletTree([-3, -1, 0, 1, 3])
      const result = wt.rankAll(0)
      expect(result.rankLess).toBe(2)
      expect(result.rankEqual).toBe(1)
      expect(result.rankGreater).toBe(2)
    })
  })

  describe('rangeCount', () => {
    const seq = [3, 1, 4, 1, 5, 9, 2, 6]
    let wt: WaveletTree

    beforeEach(() => {
      wt = new WaveletTree(seq)
    })

    it('should count all elements in full range when value range covers all', () => {
      expect(wt.rangeCount(0, 8, 1, 9)).toBe(8)
    })

    it('should count elements in specific value range', () => {
      expect(wt.rangeCount(0, 8, 1, 3)).toBe(4)
    })

    it('should count single value range', () => {
      expect(wt.rangeCount(0, 8, 1, 1)).toBe(2)
    })

    it('should count in subrange', () => {
      expect(wt.rangeCount(0, 4, 1, 4)).toBe(4)
    })

    it('should return 0 for empty range', () => {
      expect(wt.rangeCount(3, 3, 0, 10)).toBe(0)
    })

    it('should return 0 for invalid range (start > end)', () => {
      expect(wt.rangeCount(5, 3, 0, 10)).toBe(0)
    })

    it('should return 0 for valueFrom > valueTo', () => {
      expect(wt.rangeCount(0, 8, 5, 1)).toBe(0)
    })

    it('should return 0 for range outside sequence values', () => {
      expect(wt.rangeCount(0, 8, 10, 20)).toBe(0)
    })

    it('should return 0 for values below sequence range', () => {
      expect(wt.rangeCount(0, 8, -5, -1)).toBe(0)
    })

    it('should handle partial overlap with sequence values', () => {
      expect(wt.rangeCount(0, 8, 0, 2)).toBe(3)
    })

    it('should handle single position range', () => {
      expect(wt.rangeCount(0, 1, 3, 3)).toBe(1)
      expect(wt.rangeCount(0, 1, 1, 1)).toBe(0)
    })

    it('should handle negative value ranges', () => {
      const neg = new WaveletTree([-3, -1, 0, 1, 3])
      expect(neg.rangeCount(0, 5, -3, 0)).toBe(3)
    })

    it('should equal sum of individual rangeCounts for same value', () => {
      const total = wt.rangeCount(0, 8, 1, 4)
      const sum = wt.rangeCount(0, 8, 1, 1) + wt.rangeCount(0, 8, 2, 2) +
        wt.rangeCount(0, 8, 3, 3) + wt.rangeCount(0, 8, 4, 4)
      expect(total).toBe(sum)
    })

    it('should return 0 for negative start', () => {
      expect(wt.rangeCount(-1, 3, 0, 10)).toBe(0)
    })

    it('should return 0 for end beyond length', () => {
      expect(wt.rangeCount(0, 100, 0, 10)).toBe(0)
    })

    it('should handle all same elements', () => {
      const same = new WaveletTree([5, 5, 5, 5])
      expect(same.rangeCount(0, 4, 5, 5)).toBe(4)
      expect(same.rangeCount(0, 4, 1, 10)).toBe(4)
      expect(same.rangeCount(0, 4, 1, 4)).toBe(0)
    })

    it('should handle empty tree', () => {
      const empty = new WaveletTree([])
      expect(empty.rangeCount(0, 0, 0, 10)).toBe(0)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty tree', () => {
      const wt = new WaveletTree([])
      const s = wt.stats
      expect(s.length).toBe(0)
      expect(s.alphabetSize).toBe(0)
      expect(s.height).toBe(0)
      expect(s.nodeCount).toBe(0)
      expect(s.totalBits).toBe(0)
    })

    it('should return correct stats for single element', () => {
      const wt = new WaveletTree([42])
      const s = wt.stats
      expect(s.length).toBe(1)
      expect(s.alphabetSize).toBe(1)
      expect(s.height).toBe(1)
      expect(s.nodeCount).toBe(1)
      expect(s.totalBits).toBe(1)
    })

    it('should return correct stats for multi-element tree', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      const s = wt.stats
      expect(s.length).toBe(8)
      expect(s.alphabetSize).toBe(7)
      expect(s.height).toBeGreaterThan(0)
      expect(s.nodeCount).toBeGreaterThan(0)
      expect(s.totalBits).toBeGreaterThan(0)
    })

    it('should have totalBits equal to sum of bitvector lengths', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      const s = wt.stats
      expect(s.totalBits).toBe(s.length * s.height)
    })

    it('should have nodeCount at least 1 for non-empty tree', () => {
      const wt = new WaveletTree([1, 2, 3])
      expect(wt.stats.nodeCount).toBeGreaterThanOrEqual(1)
    })

    it('should have height <= alphabetSize for balanced tree', () => {
      const wt = new WaveletTree([1, 2, 3, 4, 5, 6, 7, 8])
      expect(wt.stats.height).toBeLessThanOrEqual(wt.stats.alphabetSize)
    })

    it('should be a getter not a method', () => {
      const wt = new WaveletTree([1, 2, 3])
      expect(typeof Object.getOwnPropertyDescriptor(Object.getPrototypeOf(wt), 'stats')?.get).toBe('function')
    })

    it('should handle all same elements', () => {
      const wt = new WaveletTree([5, 5, 5, 5])
      const s = wt.stats
      expect(s.length).toBe(4)
      expect(s.alphabetSize).toBe(1)
      expect(s.height).toBe(1)
      expect(s.nodeCount).toBe(1)
      expect(s.totalBits).toBe(4)
    })

    it('should reflect provided alphabet size for empty data', () => {
      const wt = new WaveletTree([], { alphabet: [1, 2, 3] })
      const s = wt.stats
      expect(s.length).toBe(0)
      expect(s.alphabetSize).toBe(3)
      expect(s.height).toBe(0)
      expect(s.nodeCount).toBe(0)
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
    })

    it('should handle single unique value with many duplicates', () => {
      const wt = new WaveletTree([7, 7, 7, 7, 7, 7, 7])
      expect(wt.length).toBe(7)
      expect(wt.alphabet).toEqual([7])
      expect(wt.rank(7, 7)).toBe(7)
      expect(wt.select(7, 1)).toBe(0)
      expect(wt.select(7, 7)).toBe(6)
    })

    it('should handle alternating two values', () => {
      const wt = new WaveletTree([1, 2, 1, 2, 1, 2, 1, 2])
      expect(wt.rank(1, 8)).toBe(4)
      expect(wt.rank(2, 8)).toBe(4)
      expect(wt.rangeCount(0, 8, 1, 2)).toBe(8)
    })

    it('should handle many duplicates of few values', () => {
      const seq: number[] = []
      for (let i = 0; i < 50; i++) seq.push(1)
      for (let i = 0; i < 50; i++) seq.push(2)
      const wt = new WaveletTree(seq)
      expect(wt.rank(1, 100)).toBe(50)
      expect(wt.rank(2, 100)).toBe(50)
    })

    it('should handle consecutive duplicate pairs', () => {
      const wt = new WaveletTree([1, 1, 2, 2, 3, 3])
      expect(wt.rank(1, 6)).toBe(2)
      expect(wt.rank(2, 6)).toBe(2)
      expect(wt.rank(3, 6)).toBe(2)
    })

    it('should handle empty tree operations', () => {
      const wt = new WaveletTree([])
      expect(wt.length).toBe(0)
      expect(wt.alphabet).toEqual([])
      expect(wt.toArray()).toEqual([])
      expect(wt.rankAll(5)).toEqual({ rankLess: 0, rankEqual: 0, rankGreater: 0 })
      expect(wt.rangeCount(0, 0, 0, 10)).toBe(0)
      expect(wt.stats.length).toBe(0)
    })

    it('should handle single element operations', () => {
      const wt = new WaveletTree([42])
      expect(wt.length).toBe(1)
      expect(wt.access(0)).toBe(42)
      expect(wt.rank(42, 1)).toBe(1)
      expect(wt.select(42, 1)).toBe(0)
      expect(wt.alphabet).toEqual([42])
      expect(wt.toArray()).toEqual([42])
      expect(wt.rankAll(42)).toEqual({ rankLess: 0, rankEqual: 1, rankGreater: 0 })
      expect(wt.rangeCount(0, 1, 42, 42)).toBe(1)
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

    it('select and access should be consistent', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      for (const sym of wt.alphabet) {
        const total = wt.rank(sym, wt.length)
        for (let k = 1; k <= total; k++) {
          expect(wt.access(wt.select(sym, k))).toBe(sym)
        }
      }
    })

    it('rankAll should satisfy sum equals length', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      for (const val of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        const r = wt.rankAll(val)
        expect(r.rankLess + r.rankEqual + r.rankGreater).toBe(seq.length)
      }
    })

    it('rangeCount should equal sum of rank differences', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      for (const sym of wt.alphabet) {
        expect(wt.rangeCount(0, 8, sym, sym)).toBe(wt.rank(sym, 8))
      }
    })

    it('toArray should match access at every position', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6]
      const wt = new WaveletTree(seq)
      const arr = wt.toArray()
      for (let i = 0; i < seq.length; i++) {
        expect(arr[i]).toBe(wt.access(i))
      }
    })

    it('forEach should match toArray', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      const fromForEach: number[] = []
      wt.forEach((el) => fromForEach.push(el))
      expect(fromForEach).toEqual(wt.toArray())
    })
  })

  describe('large sequences', () => {
    it('should handle 500 elements', () => {
      const seq = Array.from({ length: 500 }, (_, i) => i % 10)
      const wt = new WaveletTree(seq)
      expect(wt.length).toBe(500)
      expect(wt.rank(0, 500)).toBe(50)
      expect(wt.rank(5, 500)).toBe(50)
      expect(wt.rangeCount(0, 500, 0, 9)).toBe(500)
    })

    it('should handle 200 unique values', () => {
      const seq = Array.from({ length: 200 }, (_, i) => i)
      const wt = new WaveletTree(seq)
      expect(wt.length).toBe(200)
      expect(wt.access(0)).toBe(0)
      expect(wt.access(199)).toBe(199)
      expect(wt.rank(100, 200)).toBe(1)
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

    it('should handle 10000+ elements', () => {
      const seq = Array.from({ length: 10000 }, (_, i) => i % 5)
      const wt = new WaveletTree(seq)
      expect(wt.length).toBe(10000)
      for (let v = 0; v < 5; v++) {
        expect(wt.rank(v, 10000)).toBe(2000)
      }
    })

    it('should handle 10000+ unique elements', () => {
      const seq = Array.from({ length: 10000 }, (_, i) => i)
      const wt = new WaveletTree(seq)
      expect(wt.length).toBe(10000)
      expect(wt.access(0)).toBe(0)
      expect(wt.access(9999)).toBe(9999)
      expect(wt.rank(5000, 10000)).toBe(1)
      expect(wt.select(5000, 1)).toBe(5000)
    })
  })

  describe('type exports', () => {
    it('should support WaveletTreeNode type', () => {
      const node: WaveletTreeNode = {
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

    it('should support WaveletTreeOptions type', () => {
      const opts: WaveletTreeOptions = { alphabet: [1, 2, 3] }
      expect(opts.alphabet).toEqual([1, 2, 3])
    })

    it('should support RankAllResult type', () => {
      const result: RankAllResult = { rankLess: 1, rankEqual: 2, rankGreater: 3 }
      expect(result.rankLess + result.rankEqual + result.rankGreater).toBe(6)
    })

    it('should support WaveletTreeStats type', () => {
      const s: WaveletTreeStats = {
        length: 10,
        alphabetSize: 5,
        height: 3,
        nodeCount: 7,
        totalBits: 30,
      }
      expect(s.length).toBe(10)
      expect(s.alphabetSize).toBe(5)
    })
  })

  describe('mixed operations', () => {
    it('should handle access after rank', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      wt.rank(1, 5)
      expect(wt.access(2)).toBe(4)
    })

    it('should handle select after rangeCount', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      wt.rangeCount(0, 5, 1, 5)
      expect(wt.select(3, 1)).toBe(0)
    })

    it('should handle all methods on same tree', () => {
      const wt = new WaveletTree([2, 0, 1, 2, 1, 0])
      expect(wt.length).toBe(6)
      expect(wt.access(0)).toBe(2)
      expect(wt.rank(0, 6)).toBe(2)
      expect(wt.select(2, 1)).toBe(0)
      expect(wt.toArray()).toEqual([2, 0, 1, 2, 1, 0])
      expect(wt.rangeCount(0, 6, 0, 1)).toBe(4)
      expect(wt.alphabet).toEqual([0, 1, 2])
      const r = wt.rankAll(1)
      expect(r.rankEqual).toBe(2)
      expect(wt.stats.length).toBe(6)
    })

    it('should handle forEach after select', () => {
      const wt = new WaveletTree([3, 1, 4, 1, 5])
      wt.select(1, 1)
      const result: number[] = []
      wt.forEach((el) => result.push(el))
      expect(result).toEqual([3, 1, 4, 1, 5])
    })
  })
})
