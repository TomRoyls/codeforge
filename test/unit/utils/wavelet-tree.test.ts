import { describe, expect, it } from 'vitest'
import { WaveletTree } from '../../../src/utils/wavelet-tree.js'

describe('WaveletTree', () => {
  describe('constructor', () => {
    it('creates tree from empty array', () => {
      const tree = new WaveletTree([])
      expect(tree.length).toBe(0)
      expect(tree.alphabetSize).toBe(0)
      expect(tree.toArray()).toEqual([])
    })

    it('creates tree from single element', () => {
      const tree = new WaveletTree([5])
      expect(tree.length).toBe(1)
      expect(tree.alphabetSize).toBe(1)
      expect(tree.toArray()).toEqual([5])
    })

    it('creates tree from multiple elements', () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.length).toBe(8)
      expect(tree.alphabetSize).toBe(7)
      expect(tree.toArray()).toEqual([3, 1, 4, 1, 5, 9, 2, 6])
    })

    it('handles negative numbers', () => {
      const tree = new WaveletTree([-5, -3, -1, 0, 1, 3, 5])
      expect(tree.length).toBe(7)
      expect(tree.toArray()).toEqual([-5, -3, -1, 0, 1, 3, 5])
    })

    it('handles all same values', () => {
      const tree = new WaveletTree([5, 5, 5, 5, 5])
      expect(tree.length).toBe(5)
      expect(tree.alphabetSize).toBe(1)
      expect(tree.toArray()).toEqual([5, 5, 5, 5, 5])
    })

    it('handles large alphabet', () => {
      const tree = new WaveletTree([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      expect(tree.length).toBe(11)
      expect(tree.alphabetSize).toBe(11)
    })
  })

  describe('rank', () => {
    it('returns 0 for empty tree', () => {
      const tree = new WaveletTree([])
      expect(tree.rank(5, 5)).toBe(0)
    })

    it('counts value in prefix', () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.rank(1, 3)).toBe(1)
    })

    it('returns 0 for value not in data', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5])
      expect(tree.rank(10, 5)).toBe(0)
    })

    it('counts at boundaries', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5])
      expect(tree.rank(1, 1)).toBe(1)
      expect(tree.rank(5, 5)).toBe(1)
    })

    it('handles end > data length', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rank(2, 10)).toBe(1)
    })

    it('handles end <= 0', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rank(1, 0)).toBe(0)
      expect(tree.rank(1, -5)).toBe(0)
    })

    it('handles value outside alphabet range', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5])
      expect(tree.rank(-1, 5)).toBe(0)
      expect(tree.rank(10, 5)).toBe(0)
    })

    it('counts all occurrences of value', () => {
      const tree = new WaveletTree([1, 1, 1, 2, 2, 3])
      expect(tree.rank(1, 6)).toBe(3)
      expect(tree.rank(2, 6)).toBe(2)
      expect(tree.rank(3, 6)).toBe(1)
    })
  })

  describe('rankRange', () => {
    it('counts value in range', () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.rankRange(1, 0, 4)).toBe(2)
    })

    it('returns 0 for empty range', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rankRange(1, 2, 2)).toBe(0)
    })

    it('handles start >= end', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rankRange(1, 3, 2)).toBe(0)
    })

    it('counts in entire array', () => {
      const tree = new WaveletTree([1, 2, 1, 2, 1])
      expect(tree.rankRange(1, 0, 5)).toBe(3)
      expect(tree.rankRange(2, 0, 5)).toBe(2)
    })

    it('handles negative numbers', () => {
      const tree = new WaveletTree([-1, -2, -1, -3, -1])
      expect(tree.rankRange(-1, 0, 5)).toBe(3)
    })

    it('handles large range', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5, 1, 2, 3, 4, 5])
      expect(tree.rankRange(1, 2, 8)).toBe(1)
    })
  })

  describe('access', () => {
    it('retrieves value by index', () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.access(0)).toBe(3)
      expect(tree.access(4)).toBe(5)
      expect(tree.access(7)).toBe(6)
    })

    it('returns undefined for out of bounds', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.access(-1)).toBeUndefined()
      expect(tree.access(3)).toBeUndefined()
      expect(tree.access(10)).toBeUndefined()
    })

    it('handles empty tree', () => {
      const tree = new WaveletTree([])
      expect(tree.access(0)).toBeUndefined()
    })

    it('handles single element', () => {
      const tree = new WaveletTree([5])
      expect(tree.access(0)).toBe(5)
      expect(tree.access(1)).toBeUndefined()
    })

    it('handles negative numbers', () => {
      const tree = new WaveletTree([-5, -3, -1, 0, 1])
      expect(tree.access(0)).toBe(-5)
      expect(tree.access(4)).toBe(1)
    })

    it('handles all same values', () => {
      const tree = new WaveletTree([5, 5, 5, 5])
      expect(tree.access(0)).toBe(5)
      expect(tree.access(3)).toBe(5)
    })
  })

  describe('quantile', () => {
    it('finds k-th smallest in range', () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.quantile(0, 0, 8)).toBe(1)
      expect(tree.quantile(3, 0, 8)).toBe(3)
      expect(tree.quantile(7, 0, 8)).toBe(9)
    })

    it('handles single element range', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5])
      expect(tree.quantile(0, 2, 3)).toBe(3)
    })

    it('returns undefined for invalid range', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.quantile(-1, 0, 3)).toBeUndefined()
      expect(tree.quantile(0, -1, 3)).toBeUndefined()
      expect(tree.quantile(0, 2, 5)).toBeUndefined()
      expect(tree.quantile(0, 3, 3)).toBeUndefined()
    })

    it('handles k >= range size', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.quantile(5, 0, 3)).toBe(3)
    })

    it('handles first and last quantile', () => {
      const tree = new WaveletTree([5, 3, 1, 4, 2])
      expect(tree.quantile(0, 0, 5)).toBe(1)
      expect(tree.quantile(4, 0, 5)).toBe(5)
    })

    it('handles repeated values', () => {
      const tree = new WaveletTree([1, 1, 1, 2, 2, 3])
      expect(tree.quantile(0, 0, 6)).toBe(1)
      expect(tree.quantile(2, 0, 6)).toBe(1)
      expect(tree.quantile(3, 0, 6)).toBe(2)
      expect(tree.quantile(4, 0, 6)).toBe(2)
      expect(tree.quantile(5, 0, 6)).toBe(3)
    })

    it('handles negative numbers', () => {
      const tree = new WaveletTree([-5, -3, -1, 0, 1])
      expect(tree.quantile(0, 0, 5)).toBe(-5)
      expect(tree.quantile(2, 0, 5)).toBe(-1)
      expect(tree.quantile(4, 0, 5)).toBe(1)
    })
  })

  describe('rangeCount', () => {
    it('counts values in range', () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.rangeCount(1, 5, 0, 8)).toBe(6)
    })

    it('handles empty range', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rangeCount(1, 5, 2, 2)).toBe(0)
    })

    it('handles start >= end', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rangeCount(1, 5, 3, 2)).toBe(0)
    })

    it('handles lo > hi', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rangeCount(5, 1, 0, 3)).toBe(0)
    })

    it('returns 0 when hi < min', () => {
      const tree = new WaveletTree([5, 6, 7])
      expect(tree.rangeCount(1, 3, 0, 3)).toBe(0)
    })

    it('returns 0 when lo > max', () => {
      const tree = new WaveletTree([1, 2, 3])
      expect(tree.rangeCount(5, 10, 0, 3)).toBe(0)
    })

    it('handles lo <= min and hi >= max', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5])
      expect(tree.rangeCount(0, 10, 0, 5)).toBe(5)
    })

    it('handles single value range', () => {
      const tree = new WaveletTree([1, 2, 1, 2, 1])
      expect(tree.rangeCount(1, 1, 0, 5)).toBe(3)
      expect(tree.rangeCount(2, 2, 0, 5)).toBe(2)
    })

    it('handles negative numbers', () => {
      const tree = new WaveletTree([-5, -3, -1, 0, 1])
      expect(tree.rangeCount(-3, 0, 0, 5)).toBe(3)
    })

    it('handles partial range', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(tree.rangeCount(3, 7, 1, 9)).toBe(5)
    })
  })

  describe('length', () => {
    it('returns 0 for empty tree', () => {
      const tree = new WaveletTree([])
      expect(tree.length).toBe(0)
    })

    it('returns correct length', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5])
      expect(tree.length).toBe(5)
    })

    it('handles single element', () => {
      const tree = new WaveletTree([42])
      expect(tree.length).toBe(1)
    })

    it('handles large array', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i)
      const tree = new WaveletTree(data)
      expect(tree.length).toBe(1000)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new WaveletTree([])
      expect(tree.toArray()).toEqual([])
    })

    it('returns copy of original array', () => {
      const original = [3, 1, 4, 1, 5, 9, 2, 6]
      const tree = new WaveletTree(original)
      const result = tree.toArray()
      expect(result).toEqual(original)
      expect(result).not.toBe(original)
    })

    it('handles negative numbers', () => {
      const tree = new WaveletTree([-5, -3, -1])
      expect(tree.toArray()).toEqual([-5, -3, -1])
    })

    it('handles all same values', () => {
      const tree = new WaveletTree([5, 5, 5])
      expect(tree.toArray()).toEqual([5, 5, 5])
    })
  })

  describe('alphabetSize', () => {
    it('returns 0 for empty tree', () => {
      const tree = new WaveletTree([])
      expect(tree.alphabetSize).toBe(0)
    })

    it('returns 1 for single element', () => {
      const tree = new WaveletTree([5])
      expect(tree.alphabetSize).toBe(1)
    })

    it('counts unique values', () => {
      const tree = new WaveletTree([1, 2, 1, 2, 1])
      expect(tree.alphabetSize).toBe(2)
    })

    it('handles all same values', () => {
      const tree = new WaveletTree([5, 5, 5, 5])
      expect(tree.alphabetSize).toBe(1)
    })

    it('handles large alphabet', () => {
      const tree = new WaveletTree([0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
      expect(tree.alphabetSize).toBe(10)
    })
  })

  describe('getAlphabet', () => {
    it('returns empty array for empty tree', () => {
      const tree = new WaveletTree([])
      expect(tree.getAlphabet()).toEqual([])
    })

    it('returns sorted unique values', () => {
      const tree = new WaveletTree([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.getAlphabet()).toEqual([1, 2, 3, 4, 5, 6, 9])
    })

    it('returns copy not reference', () => {
      const tree = new WaveletTree([1, 2, 3])
      const alphabet = tree.getAlphabet()
      alphabet.push(4)
      expect(tree.getAlphabet()).toEqual([1, 2, 3])
    })

    it('handles negative numbers', () => {
      const tree = new WaveletTree([-5, -3, -1, 0, 1])
      expect(tree.getAlphabet()).toEqual([-5, -3, -1, 0, 1])
    })

    it('handles single value', () => {
      const tree = new WaveletTree([5])
      expect(tree.getAlphabet()).toEqual([5])
    })
  })

  describe('fromArray', () => {
    it('creates tree from array', () => {
      const data = [3, 1, 4, 1, 5]
      const tree = WaveletTree.fromArray(data)
      expect(tree.length).toBe(5)
      expect(tree.toArray()).toEqual(data)
    })

    it('creates tree from empty array', () => {
      const tree = WaveletTree.fromArray([])
      expect(tree.length).toBe(0)
      expect(tree.toArray()).toEqual([])
    })

    it('handles negative numbers', () => {
      const data = [-1, -2, -3]
      const tree = WaveletTree.fromArray(data)
      expect(tree.toArray()).toEqual(data)
    })

    it('creates new instance', () => {
      const data = [1, 2, 3]
      const tree1 = WaveletTree.fromArray(data)
      const tree2 = WaveletTree.fromArray(data)
      expect(tree1).not.toBe(tree2)
    })
  })

  describe('sorted ascending', () => {
    it('handles sorted ascending array', () => {
      const tree = new WaveletTree([1, 2, 3, 4, 5])
      expect(tree.rank(3, 4)).toBe(1)
      expect(tree.access(2)).toBe(3)
      expect(tree.quantile(2, 0, 5)).toBe(3)
      expect(tree.rangeCount(2, 4, 0, 5)).toBe(3)
    })
  })

  describe('sorted descending', () => {
    it('handles sorted descending array', () => {
      const tree = new WaveletTree([5, 4, 3, 2, 1])
      expect(tree.rank(3, 5)).toBe(1)
      expect(tree.access(2)).toBe(3)
      expect(tree.quantile(2, 0, 5)).toBe(3)
      expect(tree.rangeCount(2, 4, 0, 5)).toBe(3)
    })
  })

  describe('repeated values', () => {
    it('handles many repeated values', () => {
      const tree = new WaveletTree([1, 1, 1, 1, 1, 2, 2, 2, 3, 3])
      expect(tree.rank(1, 5)).toBe(5)
      expect(tree.rank(2, 8)).toBe(3)
      expect(tree.rank(3, 10)).toBe(2)
      expect(tree.rangeCount(1, 2, 0, 10)).toBe(8)
    })
  })
})