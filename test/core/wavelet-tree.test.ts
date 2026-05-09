import { describe, it, expect, beforeEach } from 'vitest'
import { WaveletTree } from '../../src/core/wavelet-tree/wavelet-tree.js'
import { DEFAULT_WAVELETTREE_OPTIONS } from '../../src/core/wavelet-tree/types.js'
import type { WaveletTreeOptions } from '../../src/core/wavelet-tree/types.js'

describe('WaveletTree', () => {
  const testData = [3, 1, 4, 1, 5, 9, 2, 6]
  let tree: WaveletTree

  beforeEach(() => {
    tree = new WaveletTree(testData)
  })

  describe('constructor', () => {
    it('should create tree with default options', () => {
      const t = new WaveletTree([1, 2, 3])
      expect(t.size()).toBe(3)
      expect(t.isEmpty()).toBe(false)
    })

    it('should create tree with custom alphabetSize', () => {
      const t = new WaveletTree([0, 1, 0], { alphabetSize: 2 })
      expect(t.size()).toBe(3)
      expect(t.access(0)).toBe(0)
      expect(t.access(1)).toBe(1)
    })

    it('should create tree with empty data', () => {
      const t = new WaveletTree([])
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create tree with single element', () => {
      const t = new WaveletTree([42])
      expect(t.size()).toBe(1)
      expect(t.access(0)).toBe(42)
    })

    it('should create tree with all same elements', () => {
      const t = new WaveletTree([5, 5, 5, 5])
      expect(t.size()).toBe(4)
      expect(t.access(0)).toBe(5)
      expect(t.access(3)).toBe(5)
    })

    it('should create tree with large alphabet size', () => {
      const t = new WaveletTree([100, 200], { alphabetSize: 256 })
      expect(t.access(0)).toBe(100)
      expect(t.access(1)).toBe(200)
    })
  })

  describe('access', () => {
    it('should return element at index 0', () => {
      expect(tree.access(0)).toBe(3)
    })

    it('should return element at last index', () => {
      expect(tree.access(7)).toBe(6)
    })

    it('should return element at middle index', () => {
      expect(tree.access(3)).toBe(1)
    })

    it('should return each element correctly', () => {
      for (let i = 0; i < testData.length; i++) {
        expect(tree.access(i)).toBe(testData[i])
      }
    })

    it('should return undefined for negative index', () => {
      expect(tree.access(-1)).toBeUndefined()
    })

    it('should return undefined for index equal to size', () => {
      expect(tree.access(8)).toBeUndefined()
    })

    it('should return undefined for index beyond size', () => {
      expect(tree.access(100)).toBeUndefined()
    })

    it('should return undefined for empty tree', () => {
      const t = new WaveletTree([])
      expect(t.access(0)).toBeUndefined()
    })

    it('should work with single element', () => {
      const t = new WaveletTree([7])
      expect(t.access(0)).toBe(7)
    })

    it('should work with all same elements', () => {
      const t = new WaveletTree([3, 3, 3])
      expect(t.access(0)).toBe(3)
      expect(t.access(1)).toBe(3)
      expect(t.access(2)).toBe(3)
    })

    it('should work with binary data', () => {
      const t = new WaveletTree([0, 1, 1, 0, 1], { alphabetSize: 2 })
      expect(t.access(0)).toBe(0)
      expect(t.access(1)).toBe(1)
      expect(t.access(3)).toBe(0)
    })

    it('should work with increasing sequence', () => {
      const t = new WaveletTree([0, 1, 2, 3, 4], { alphabetSize: 5 })
      for (let i = 0; i < 5; i++) {
        expect(t.access(i)).toBe(i)
      }
    })
  })

  describe('rank', () => {
    it('should return 0 when symbol not present in data', () => {
      expect(tree.rank(7, 8)).toBe(0)
    })

    it('should return correct count for existing symbol', () => {
      expect(tree.rank(1, 8)).toBe(2)
    })

    it('should return 0 for end=0', () => {
      expect(tree.rank(3, 0)).toBe(0)
    })

    it('should return full count for end=size', () => {
      expect(tree.rank(1, 8)).toBe(2)
      expect(tree.rank(3, 8)).toBe(1)
      expect(tree.rank(9, 8)).toBe(1)
    })

    it('should return partial count for middle end', () => {
      expect(tree.rank(1, 2)).toBe(1)
      expect(tree.rank(1, 4)).toBe(2)
    })

    it('should return 0 for negative symbol', () => {
      expect(tree.rank(-1, 5)).toBe(0)
    })

    it('should return 0 for symbol >= alphabetSize', () => {
      expect(tree.rank(256, 5)).toBe(0)
    })

    it('should return 0 for negative end', () => {
      expect(tree.rank(3, -1)).toBe(0)
    })

    it('should return 0 for end > size', () => {
      expect(tree.rank(3, 100)).toBe(0)
    })

    it('should count all occurrences of repeated symbol', () => {
      const t = new WaveletTree([2, 2, 2, 2], { alphabetSize: 4 })
      expect(t.rank(2, 4)).toBe(4)
    })

    it('should return 1 for single occurrence', () => {
      expect(tree.rank(3, 8)).toBe(1)
      expect(tree.rank(4, 8)).toBe(1)
    })

    it('should work with single element tree', () => {
      const t = new WaveletTree([5])
      expect(t.rank(5, 1)).toBe(1)
      expect(t.rank(5, 0)).toBe(0)
    })

    it('should return 0 for empty tree', () => {
      const t = new WaveletTree([])
      expect(t.rank(0, 0)).toBe(0)
    })

    it('should count correctly at each position', () => {
      expect(tree.rank(1, 1)).toBe(0)
      expect(tree.rank(1, 2)).toBe(1)
      expect(tree.rank(1, 3)).toBe(1)
      expect(tree.rank(1, 4)).toBe(2)
      expect(tree.rank(1, 5)).toBe(2)
    })

    it('should handle rank with binary data', () => {
      const t = new WaveletTree([0, 1, 1, 0, 1], { alphabetSize: 2 })
      expect(t.rank(0, 5)).toBe(2)
      expect(t.rank(1, 5)).toBe(3)
      expect(t.rank(0, 2)).toBe(1)
      expect(t.rank(1, 3)).toBe(2)
    })
  })

  describe('select', () => {
    it('should return position of first occurrence', () => {
      expect(tree.select(3, 1)).toBe(0)
      expect(tree.select(1, 1)).toBe(1)
      expect(tree.select(9, 1)).toBe(5)
    })

    it('should return position of last occurrence', () => {
      expect(tree.select(1, 2)).toBe(3)
    })

    it('should return position of middle occurrence', () => {
      const t = new WaveletTree([2, 2, 2, 2], { alphabetSize: 4 })
      expect(t.select(2, 2)).toBe(1)
      expect(t.select(2, 3)).toBe(2)
    })

    it('should return undefined for occurrence exceeding count', () => {
      expect(tree.select(3, 2)).toBeUndefined()
      expect(tree.select(1, 3)).toBeUndefined()
    })

    it('should return undefined for occurrence <= 0', () => {
      expect(tree.select(3, 0)).toBeUndefined()
      expect(tree.select(3, -1)).toBeUndefined()
    })

    it('should return undefined for negative symbol', () => {
      expect(tree.select(-1, 1)).toBeUndefined()
    })

    it('should return undefined for symbol >= alphabetSize', () => {
      expect(tree.select(256, 1)).toBeUndefined()
    })

    it('should return undefined for symbol not in data', () => {
      expect(tree.select(7, 1)).toBeUndefined()
      expect(tree.select(8, 1)).toBeUndefined()
    })

    it('should return undefined for empty tree', () => {
      const t = new WaveletTree([])
      expect(t.select(0, 1)).toBeUndefined()
    })

    it('should return 0 for single element tree', () => {
      const t = new WaveletTree([5])
      expect(t.select(5, 1)).toBe(0)
    })

    it('should return correct positions for all occurrences', () => {
      expect(tree.select(2, 1)).toBe(6)
      expect(tree.select(4, 1)).toBe(2)
      expect(tree.select(5, 1)).toBe(4)
      expect(tree.select(6, 1)).toBe(7)
    })

    it('should work with repeated elements', () => {
      const t = new WaveletTree([3, 3, 3, 3], { alphabetSize: 4 })
      expect(t.select(3, 1)).toBe(0)
      expect(t.select(3, 2)).toBe(1)
      expect(t.select(3, 3)).toBe(2)
      expect(t.select(3, 4)).toBe(3)
      expect(t.select(3, 5)).toBeUndefined()
    })

    it('should work with binary data', () => {
      const t = new WaveletTree([0, 1, 1, 0, 1], { alphabetSize: 2 })
      expect(t.select(0, 1)).toBe(0)
      expect(t.select(0, 2)).toBe(3)
      expect(t.select(1, 1)).toBe(1)
      expect(t.select(1, 2)).toBe(2)
      expect(t.select(1, 3)).toBe(4)
    })
  })

  describe('rangeCount', () => {
    it('should return count of symbol in range', () => {
      expect(tree.rangeCount(0, 8, 1)).toBe(2)
      expect(tree.rangeCount(0, 8, 3)).toBe(1)
    })

    it('should return 0 for empty range', () => {
      expect(tree.rangeCount(3, 3, 1)).toBe(0)
    })

    it('should return 0 for invalid range start >= end', () => {
      expect(tree.rangeCount(5, 3, 1)).toBe(0)
    })

    it('should return 0 for negative start', () => {
      expect(tree.rangeCount(-1, 5, 1)).toBe(0)
    })

    it('should return 0 for end > size', () => {
      expect(tree.rangeCount(0, 100, 1)).toBe(0)
    })

    it('should return 0 for symbol not in range', () => {
      expect(tree.rangeCount(0, 3, 5)).toBe(0)
    })

    it('should return full range count for entire array', () => {
      expect(tree.rangeCount(0, 8, 1)).toBe(2)
      expect(tree.rangeCount(0, 8, 9)).toBe(1)
    })

    it('should return correct count for partial range', () => {
      expect(tree.rangeCount(0, 4, 1)).toBe(2)
      expect(tree.rangeCount(2, 8, 1)).toBe(1)
      expect(tree.rangeCount(0, 2, 1)).toBe(1)
    })

    it('should handle single element range', () => {
      expect(tree.rangeCount(0, 1, 3)).toBe(1)
      expect(tree.rangeCount(0, 1, 1)).toBe(0)
    })

    it('should handle range with all same elements', () => {
      const t = new WaveletTree([2, 2, 2, 2], { alphabetSize: 4 })
      expect(t.rangeCount(0, 4, 2)).toBe(4)
      expect(t.rangeCount(1, 3, 2)).toBe(2)
    })

    it('should return 0 for empty tree', () => {
      const t = new WaveletTree([])
      expect(t.rangeCount(0, 0, 0)).toBe(0)
    })
  })

  describe('rangeQuantile', () => {
    it('should return minimum for k=0', () => {
      expect(tree.rangeQuantile(0, 8, 0)).toBe(1)
    })

    it('should return maximum for k=end-start-1', () => {
      expect(tree.rangeQuantile(0, 8, 7)).toBe(9)
    })

    it('should return correct kth smallest in sorted order', () => {
      const sorted = [...testData].sort((a, b) => a - b)
      for (let k = 0; k < sorted.length; k++) {
        expect(tree.rangeQuantile(0, 8, k)).toBe(sorted[k])
      }
    })

    it('should return undefined for empty range', () => {
      expect(tree.rangeQuantile(3, 3, 0)).toBeUndefined()
    })

    it('should return undefined for k < 0', () => {
      expect(tree.rangeQuantile(0, 8, -1)).toBeUndefined()
    })

    it('should return undefined for k >= range length', () => {
      expect(tree.rangeQuantile(0, 8, 8)).toBeUndefined()
    })

    it('should return undefined for start >= end', () => {
      expect(tree.rangeQuantile(5, 3, 0)).toBeUndefined()
    })

    it('should return undefined for negative start', () => {
      expect(tree.rangeQuantile(-1, 5, 0)).toBeUndefined()
    })

    it('should return only element for single element range', () => {
      expect(tree.rangeQuantile(0, 1, 0)).toBe(3)
      expect(tree.rangeQuantile(5, 6, 0)).toBe(9)
    })

    it('should work with partial range', () => {
      expect(tree.rangeQuantile(0, 3, 0)).toBe(1)
      expect(tree.rangeQuantile(0, 3, 1)).toBe(3)
      expect(tree.rangeQuantile(0, 3, 2)).toBe(4)
    })

    it('should work with sorted sequence', () => {
      const t = new WaveletTree([1, 2, 3, 4, 5], { alphabetSize: 6 })
      expect(t.rangeQuantile(0, 5, 0)).toBe(1)
      expect(t.rangeQuantile(0, 5, 2)).toBe(3)
      expect(t.rangeQuantile(0, 5, 4)).toBe(5)
    })

    it('should work with reverse sorted sequence', () => {
      const t = new WaveletTree([5, 4, 3, 2, 1], { alphabetSize: 6 })
      expect(t.rangeQuantile(0, 5, 0)).toBe(1)
      expect(t.rangeQuantile(0, 5, 4)).toBe(5)
    })

    it('should return undefined for empty tree', () => {
      const t = new WaveletTree([])
      expect(t.rangeQuantile(0, 0, 0)).toBeUndefined()
    })

    it('should work with binary data', () => {
      const t = new WaveletTree([1, 0, 1, 0, 1], { alphabetSize: 2 })
      expect(t.rangeQuantile(0, 5, 0)).toBe(0)
      expect(t.rangeQuantile(0, 5, 1)).toBe(0)
      expect(t.rangeQuantile(0, 5, 2)).toBe(1)
    })
  })

  describe('size', () => {
    it('should return correct size for non-empty tree', () => {
      expect(tree.size()).toBe(8)
    })

    it('should return 0 for empty tree', () => {
      const t = new WaveletTree([])
      expect(t.size()).toBe(0)
    })

    it('should return 1 for single element', () => {
      const t = new WaveletTree([1])
      expect(t.size()).toBe(1)
    })

    it('should return correct size for large tree', () => {
      const data = Array.from({ length: 100 }, (_, i) => i % 10)
      const t = new WaveletTree(data, { alphabetSize: 10 })
      expect(t.size()).toBe(100)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const t = new WaveletTree([])
      expect(t.isEmpty()).toBe(true)
    })

    it('should return false for non-empty tree', () => {
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return false for single element', () => {
      const t = new WaveletTree([1])
      expect(t.isEmpty()).toBe(false)
    })
  })

  describe('re-exports', () => {
    it('should re-export DEFAULT_WAVELETTREE_OPTIONS', () => {
      expect(DEFAULT_WAVELETTREE_OPTIONS.alphabetSize).toBe(256)
    })

    it('should allow importing WaveletTreeOptions type', () => {
      const opts: WaveletTreeOptions = { alphabetSize: 10 }
      const t = new WaveletTree([1, 2], opts)
      expect(t.size()).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle binary sequence', () => {
      const data = [0, 1, 0, 1, 1, 0]
      const t = new WaveletTree(data, { alphabetSize: 2 })
      for (let i = 0; i < data.length; i++) {
        expect(t.access(i)).toBe(data[i])
      }
    })

    it('should handle decreasing sequence', () => {
      const data = [7, 6, 5, 4, 3, 2, 1, 0]
      const t = new WaveletTree(data, { alphabetSize: 8 })
      for (let i = 0; i < data.length; i++) {
        expect(t.access(i)).toBe(data[i])
      }
    })

    it('should handle all zeros', () => {
      const data = [0, 0, 0, 0, 0]
      const t = new WaveletTree(data, { alphabetSize: 2 })
      expect(t.rank(0, 5)).toBe(5)
      expect(t.select(0, 3)).toBe(2)
    })

    it('should handle data with max alphabet value', () => {
      const t = new WaveletTree([255], { alphabetSize: 256 })
      expect(t.access(0)).toBe(255)
      expect(t.rank(255, 1)).toBe(1)
    })

    it('should handle alternating pattern', () => {
      const data = [1, 2, 1, 2, 1, 2]
      const t = new WaveletTree(data, { alphabetSize: 3 })
      expect(t.rank(1, 6)).toBe(3)
      expect(t.rank(2, 6)).toBe(3)
      expect(t.select(1, 2)).toBe(2)
      expect(t.select(2, 2)).toBe(3)
    })

    it('should maintain access-rank-select consistency', () => {
      for (let i = 0; i < testData.length; i++) {
        const val = tree.access(i)
        expect(val).toBeDefined()
        const pos = tree.select(val!, 1)
        expect(pos).toBeDefined()
      }
    })

    it('should maintain rank-select roundtrip for all symbols', () => {
      const symbols = new Set(testData)
      for (const sym of symbols) {
        const count = tree.rank(sym, testData.length)
        expect(count).toBeGreaterThan(0)
        const lastPos = tree.select(sym, count)
        expect(lastPos).toBeDefined()
        expect(lastPos!).toBeLessThan(testData.length)
        expect(tree.access(lastPos!)).toBe(sym)
      }
    })

    it('should handle large repeated dataset', () => {
      const data = Array.from({ length: 50 }, () => 3)
      const t = new WaveletTree(data, { alphabetSize: 4 })
      expect(t.rank(3, 50)).toBe(50)
      expect(t.select(3, 25)).toBe(24)
      expect(t.rangeQuantile(0, 50, 0)).toBe(3)
      expect(t.rangeQuantile(0, 50, 49)).toBe(3)
    })

    it('should handle single distinct value at boundary', () => {
      const t = new WaveletTree([0], { alphabetSize: 2 })
      expect(t.access(0)).toBe(0)
      expect(t.rank(0, 1)).toBe(1)
      expect(t.select(0, 1)).toBe(0)
    })

    it('should handle rangeQuantile on subranges correctly', () => {
      expect(tree.rangeQuantile(0, 4, 0)).toBe(1)
      expect(tree.rangeQuantile(0, 4, 3)).toBe(4)
      expect(tree.rangeQuantile(4, 8, 0)).toBe(2)
      expect(tree.rangeQuantile(4, 8, 3)).toBe(9)
    })

    it('should handle access consistency with small alphabet', () => {
      const data = [0, 1, 2, 0, 1, 2, 0, 1, 2]
      const t = new WaveletTree(data, { alphabetSize: 3 })
      for (let i = 0; i < data.length; i++) {
        expect(t.access(i)).toBe(data[i])
      }
      expect(t.rank(0, 9)).toBe(3)
      expect(t.rank(1, 9)).toBe(3)
      expect(t.rank(2, 9)).toBe(3)
    })
  })
})
