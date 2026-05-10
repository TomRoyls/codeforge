import { describe, it, expect } from 'vitest'
import { SparseBitmapIndex } from '../../src/core/sparse-bitmap-index/sparse-bitmap-index.js'
import {
  BITS_PER_WORD,
  DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS,
} from '../../src/core/sparse-bitmap-index/sparse-bitmap-index.js'
import type {
  SparseBitmapIndexOptions,
  SparseBitmapIndexStatistics,
} from '../../src/core/sparse-bitmap-index/sparse-bitmap-index.js'

describe('SparseBitmapIndex', () => {
  describe('construction', () => {
    it('creates empty index with no options', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.isEmpty).toBe(true)
    })

    it('creates empty index with empty options', () => {
      const idx = new SparseBitmapIndex({})
      expect(idx.isEmpty).toBe(true)
    })

    it('creates empty index with custom options', () => {
      const idx = new SparseBitmapIndex({ initialCapacity: 128, autoCompress: false })
      expect(idx.isEmpty).toBe(true)
    })

    it('starts with zero size', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.size).toBe(0)
    })

    it('starts with zero bitCount', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.bitCount).toBe(0)
    })

    it('starts with zero statistics', () => {
      const idx = new SparseBitmapIndex()
      const stats = idx.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.clears).toBe(0)
      expect(stats.toggles).toBe(0)
      expect(stats.rangeOperations).toBe(0)
      expect(stats.compressions).toBe(0)
      expect(stats.lookups).toBe(0)
    })
  })

  describe('set', () => {
    it('sets a single bit', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      expect(idx.get(5)).toBe(1)
    })

    it('sets bit at 0', () => {
      const idx = new SparseBitmapIndex()
      idx.set(0)
      expect(idx.get(0)).toBe(1)
    })

    it('sets bit at large index', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1000000)
      expect(idx.get(1000000)).toBe(1)
    })

    it('idempotent set on same bit', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(5)
      expect(idx.get(5)).toBe(1)
      expect(idx.bitCount).toBe(1)
    })

    it('sets multiple bits', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(10)
      idx.set(100)
      expect(idx.bitCount).toBe(3)
    })

    it('updates size to index + 1', () => {
      const idx = new SparseBitmapIndex()
      idx.set(99)
      expect(idx.size).toBe(100)
    })

    it('size does not shrink on later sets', () => {
      const idx = new SparseBitmapIndex()
      idx.set(99)
      idx.set(5)
      expect(idx.size).toBe(100)
    })

    it('tracks set operations in statistics', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(2)
      idx.set(3)
      expect(idx.getStatistics().sets).toBe(3)
    })

    it('throws on negative index', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.set(-1)).toThrow(RangeError)
    })

    it('sets bits across word boundaries', () => {
      const idx = new SparseBitmapIndex()
      idx.set(31)
      idx.set(32)
      expect(idx.get(31)).toBe(1)
      expect(idx.get(32)).toBe(1)
      expect(idx.bitCount).toBe(2)
    })

    it('sets all bits in a word', () => {
      const idx = new SparseBitmapIndex()
      for (let i = 0; i < BITS_PER_WORD; i++) {
        idx.set(i)
      }
      expect(idx.bitCount).toBe(BITS_PER_WORD)
    })
  })

  describe('clear', () => {
    it('clears a set bit', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.clear(5)
      expect(idx.get(5)).toBe(0)
    })

    it('clear on unset bit is no-op', () => {
      const idx = new SparseBitmapIndex()
      idx.clear(5)
      expect(idx.bitCount).toBe(0)
    })

    it('clear on never-set index', () => {
      const idx = new SparseBitmapIndex()
      idx.set(100)
      idx.clear(50)
      expect(idx.bitCount).toBe(1)
    })

    it('decrements bitCount', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(10)
      idx.clear(5)
      expect(idx.bitCount).toBe(1)
    })

    it('removes word when all bits cleared', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.clear(5)
      expect(idx.isEmpty).toBe(true)
    })

    it('tracks clear operations in statistics', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.clear(1)
      idx.clear(2)
      expect(idx.getStatistics().clears).toBe(2)
    })

    it('throws on negative index', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.clear(-1)).toThrow(RangeError)
    })

    it('clearing a bit and setting another keeps correct count', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(10)
      idx.clear(5)
      idx.set(15)
      expect(idx.bitCount).toBe(2)
    })
  })

  describe('get', () => {
    it('returns 0 for unset bit', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.get(0)).toBe(0)
    })

    it('returns 1 for set bit', () => {
      const idx = new SparseBitmapIndex()
      idx.set(42)
      expect(idx.get(42)).toBe(1)
    })

    it('tracks lookups in statistics', () => {
      const idx = new SparseBitmapIndex()
      idx.get(0)
      idx.get(1)
      idx.get(2)
      expect(idx.getStatistics().lookups).toBe(3)
    })

    it('throws on negative index', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.get(-1)).toThrow(RangeError)
    })

    it('returns 0 for large unset index', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      expect(idx.get(999999)).toBe(0)
    })

    it('returns 0 after clearing', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      idx.clear(10)
      expect(idx.get(10)).toBe(0)
    })
  })

  describe('toggle', () => {
    it('toggles unset bit to set', () => {
      const idx = new SparseBitmapIndex()
      idx.toggle(5)
      expect(idx.get(5)).toBe(1)
    })

    it('toggles set bit to unset', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.toggle(5)
      expect(idx.get(5)).toBe(0)
    })

    it('double toggle returns to original', () => {
      const idx = new SparseBitmapIndex()
      idx.toggle(5)
      idx.toggle(5)
      expect(idx.get(5)).toBe(0)
      expect(idx.bitCount).toBe(0)
    })

    it('increments bitCount on toggle on', () => {
      const idx = new SparseBitmapIndex()
      idx.toggle(5)
      expect(idx.bitCount).toBe(1)
    })

    it('decrements bitCount on toggle off', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.toggle(5)
      expect(idx.bitCount).toBe(0)
    })

    it('tracks toggle operations in statistics', () => {
      const idx = new SparseBitmapIndex()
      idx.toggle(1)
      idx.toggle(2)
      expect(idx.getStatistics().toggles).toBe(2)
    })

    it('throws on negative index', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.toggle(-1)).toThrow(RangeError)
    })

    it('toggling multiple bits', () => {
      const idx = new SparseBitmapIndex()
      idx.toggle(1)
      idx.toggle(2)
      idx.toggle(3)
      idx.toggle(2)
      expect(idx.bitCount).toBe(2)
      expect(idx.get(1)).toBe(1)
      expect(idx.get(2)).toBe(0)
      expect(idx.get(3)).toBe(1)
    })
  })

  describe('setRange', () => {
    it('sets a range of bits', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(5, 10)
      for (let i = 5; i < 10; i++) {
        expect(idx.get(i)).toBe(1)
      }
      expect(idx.bitCount).toBe(5)
    })

    it('sets range at start 0', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 5)
      expect(idx.bitCount).toBe(5)
    })

    it('sets single bit range', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(5, 6)
      expect(idx.get(5)).toBe(1)
      expect(idx.bitCount).toBe(1)
    })

    it('empty range is no-op', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(5, 5)
      expect(idx.bitCount).toBe(0)
    })

    it('sets range spanning word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(30, 34)
      expect(idx.bitCount).toBe(4)
      expect(idx.get(30)).toBe(1)
      expect(idx.get(31)).toBe(1)
      expect(idx.get(32)).toBe(1)
      expect(idx.get(33)).toBe(1)
    })

    it('sets full word range', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, BITS_PER_WORD)
      expect(idx.bitCount).toBe(BITS_PER_WORD)
    })

    it('sets multi-word range', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, BITS_PER_WORD * 3)
      expect(idx.bitCount).toBe(BITS_PER_WORD * 3)
    })

    it('idempotent setRange on already set bits', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 10)
      idx.setRange(0, 10)
      expect(idx.bitCount).toBe(10)
    })

    it('overlapping setRange', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 10)
      idx.setRange(5, 15)
      expect(idx.bitCount).toBe(15)
    })

    it('tracks range operations in statistics', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 5)
      idx.setRange(10, 15)
      expect(idx.getStatistics().rangeOperations).toBe(2)
    })

    it('throws on negative start', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.setRange(-1, 5)).toThrow(RangeError)
    })

    it('throws on end < start', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.setRange(10, 5)).toThrow(RangeError)
    })

    it('sets range with partial word at start', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(5, BITS_PER_WORD * 2)
      expect(idx.get(5)).toBe(1)
      expect(idx.get(4)).toBe(0)
    })

    it('sets range with partial word at end', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, BITS_PER_WORD + 5)
      expect(idx.bitCount).toBe(BITS_PER_WORD + 5)
    })
  })

  describe('clearRange', () => {
    it('clears a range of bits', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 20)
      idx.clearRange(5, 10)
      expect(idx.bitCount).toBe(15)
      for (let i = 5; i < 10; i++) {
        expect(idx.get(i)).toBe(0)
      }
    })

    it('clearRange on unset bits is no-op', () => {
      const idx = new SparseBitmapIndex()
      idx.clearRange(5, 10)
      expect(idx.bitCount).toBe(0)
    })

    it('empty range is no-op', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 10)
      idx.clearRange(5, 5)
      expect(idx.bitCount).toBe(10)
    })

    it('clears range spanning word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 64)
      idx.clearRange(30, 34)
      expect(idx.bitCount).toBe(60)
      expect(idx.get(30)).toBe(0)
      expect(idx.get(31)).toBe(0)
      expect(idx.get(32)).toBe(0)
      expect(idx.get(33)).toBe(0)
      expect(idx.get(34)).toBe(1)
    })

    it('clears entire bitmap', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 100)
      idx.clearRange(0, 100)
      expect(idx.isEmpty).toBe(true)
    })

    it('tracks range operations in statistics', () => {
      const idx = new SparseBitmapIndex()
      idx.clearRange(0, 5)
      expect(idx.getStatistics().rangeOperations).toBe(1)
    })

    it('throws on negative start', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.clearRange(-1, 5)).toThrow(RangeError)
    })

    it('throws on end < start', () => {
      const idx = new SparseBitmapIndex()
      expect(() => idx.clearRange(10, 5)).toThrow(RangeError)
    })

    it('clears multi-word range', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, BITS_PER_WORD * 3)
      idx.clearRange(0, BITS_PER_WORD * 3)
      expect(idx.isEmpty).toBe(true)
    })

    it('clearRange partial word at start', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, BITS_PER_WORD * 2)
      idx.clearRange(5, BITS_PER_WORD * 2)
      expect(idx.bitCount).toBe(5)
    })
  })

  describe('countOnes', () => {
    it('returns 0 for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.countOnes()).toBe(0)
    })

    it('returns correct count after sets', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(2)
      idx.set(3)
      expect(idx.countOnes()).toBe(3)
    })

    it('returns correct count after clears', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 10)
      idx.clear(5)
      expect(idx.countOnes()).toBe(9)
    })

    it('matches bitCount property', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 50)
      expect(idx.countOnes()).toBe(idx.bitCount)
    })
  })

  describe('countZeros', () => {
    it('returns 0 for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.countZeros()).toBe(0)
    })

    it('returns correct zero count', () => {
      const idx = new SparseBitmapIndex()
      idx.set(0)
      idx.set(2)
      idx.set(4)
      expect(idx.countZeros()).toBe(2)
    })

    it('returns 0 when all bits set', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 10)
      expect(idx.countZeros()).toBe(0)
    })
  })

  describe('findFirst', () => {
    it('returns -1 for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.findFirst()).toBe(-1)
    })

    it('returns first set bit', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      idx.set(20)
      expect(idx.findFirst()).toBe(10)
    })

    it('returns 0 when bit 0 is set', () => {
      const idx = new SparseBitmapIndex()
      idx.set(0)
      expect(idx.findFirst()).toBe(0)
    })

    it('finds first across word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.set(100)
      idx.set(50)
      expect(idx.findFirst()).toBe(50)
    })
  })

  describe('findLast', () => {
    it('returns -1 for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.findLast()).toBe(-1)
    })

    it('returns last set bit', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      idx.set(20)
      expect(idx.findLast()).toBe(20)
    })

    it('finds last across word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.set(50)
      idx.set(100)
      expect(idx.findLast()).toBe(100)
    })

    it('same as findFirst when only one bit set', () => {
      const idx = new SparseBitmapIndex()
      idx.set(42)
      expect(idx.findLast()).toBe(idx.findFirst())
    })
  })

  describe('findNext', () => {
    it('returns first set bit from index 0', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      expect(idx.findNext(0)).toBe(10)
    })

    it('returns next set bit after index', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      idx.set(20)
      expect(idx.findNext(11)).toBe(20)
    })

    it('returns same bit if it is set', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      expect(idx.findNext(10)).toBe(10)
    })

    it('returns -1 when no more set bits', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      expect(idx.findNext(11)).toBe(-1)
    })

    it('handles negative fromIndex by returning first', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      expect(idx.findNext(-1)).toBe(5)
    })

    it('finds next across word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      idx.set(100)
      expect(idx.findNext(11)).toBe(100)
    })

    it('returns -1 for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.findNext(0)).toBe(-1)
    })

    it('iterates all set bits', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(10)
      idx.set(15)
      const bits: number[] = []
      let pos = idx.findNext(-1)
      while (pos !== -1) {
        bits.push(pos)
        pos = idx.findNext(pos + 1)
      }
      expect(bits).toEqual([5, 10, 15])
    })
  })

  describe('rank', () => {
    it('returns 0 for index 0', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      expect(idx.rank(0)).toBe(0)
    })

    it('returns 0 for negative index', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      expect(idx.rank(-1)).toBe(0)
    })

    it('counts set bits before index', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(3)
      idx.set(5)
      expect(idx.rank(5)).toBe(2)
    })

    it('counts bits within word boundary', () => {
      const idx = new SparseBitmapIndex()
      for (let i = 0; i < 10; i++) {
        idx.set(i)
      }
      expect(idx.rank(5)).toBe(5)
    })

    it('counts bits across word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 64)
      expect(idx.rank(40)).toBe(40)
    })

    it('returns total count for large index', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(3)
      expect(idx.rank(1000)).toBe(2)
    })

    it('rank at set bit position', () => {
      const idx = new SparseBitmapIndex()
      idx.set(0)
      idx.set(1)
      idx.set(2)
      expect(idx.rank(2)).toBe(2)
    })
  })

  describe('select', () => {
    it('returns -1 for negative n', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.select(-1)).toBe(-1)
    })

    it('returns -1 for n >= bitCount', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      expect(idx.select(1)).toBe(-1)
    })

    it('returns position of nth set bit (0-indexed)', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10)
      idx.set(20)
      idx.set(30)
      expect(idx.select(0)).toBe(10)
      expect(idx.select(1)).toBe(20)
      expect(idx.select(2)).toBe(30)
    })

    it('works across word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(BITS_PER_WORD + 5)
      expect(idx.select(0)).toBe(5)
      expect(idx.select(1)).toBe(BITS_PER_WORD + 5)
    })

    it('returns -1 for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.select(0)).toBe(-1)
    })

    it('works with consecutive bits', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 5)
      expect(idx.select(0)).toBe(0)
      expect(idx.select(4)).toBe(4)
    })
  })

  describe('and', () => {
    it('returns empty for two empty indices', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      expect(a.and(b).isEmpty).toBe(true)
    })

    it('returns empty when one is empty', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(5)
      expect(a.and(b).isEmpty).toBe(true)
    })

    it('returns intersection of bits', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      a.set(3)
      b.set(2)
      b.set(3)
      b.set(4)
      const result = a.and(b)
      expect(result.get(2)).toBe(1)
      expect(result.get(3)).toBe(1)
      expect(result.get(1)).toBe(0)
      expect(result.get(4)).toBe(0)
      expect(result.bitCount).toBe(2)
    })

    it('does not modify original indices', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      b.set(1)
      b.set(2)
      const result = a.and(b)
      expect(a.bitCount).toBe(1)
      expect(b.bitCount).toBe(2)
      expect(result.bitCount).toBe(1)
    })

    it('handles non-overlapping words', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(5)
      b.set(100)
      expect(a.and(b).isEmpty).toBe(true)
    })
  })

  describe('or', () => {
    it('returns empty for two empty indices', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      expect(a.or(b).isEmpty).toBe(true)
    })

    it('returns union of bits', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      b.set(2)
      const result = a.or(b)
      expect(result.get(1)).toBe(1)
      expect(result.get(2)).toBe(1)
      expect(result.bitCount).toBe(2)
    })

    it('overlapping bits counted once', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      b.set(2)
      b.set(3)
      const result = a.or(b)
      expect(result.bitCount).toBe(3)
    })

    it('handles one empty index', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      const result = a.or(b)
      expect(result.bitCount).toBe(2)
    })

    it('works across word boundaries', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(5)
      b.set(BITS_PER_WORD + 5)
      const result = a.or(b)
      expect(result.bitCount).toBe(2)
    })
  })

  describe('xor', () => {
    it('returns empty for two empty indices', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      expect(a.xor(b).isEmpty).toBe(true)
    })

    it('returns symmetric difference', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      b.set(2)
      b.set(3)
      const result = a.xor(b)
      expect(result.get(1)).toBe(1)
      expect(result.get(2)).toBe(0)
      expect(result.get(3)).toBe(1)
    })

    it('same index xor itself is empty', () => {
      const a = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      const b = new SparseBitmapIndex()
      b.set(1)
      b.set(2)
      expect(a.xor(b).isEmpty).toBe(true)
    })

    it('one empty returns copy of other', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      const result = a.xor(b)
      expect(result.bitCount).toBe(2)
    })
  })

  describe('not', () => {
    it('returns empty for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.not().isEmpty).toBe(true)
    })

    it('inverts all bits within size', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(3)
      idx.set(5)
      const result = idx.not()
      expect(result.get(0)).toBe(1)
      expect(result.get(1)).toBe(0)
      expect(result.get(2)).toBe(1)
      expect(result.get(3)).toBe(0)
      expect(result.get(4)).toBe(1)
      expect(result.get(5)).toBe(0)
    })

    it('inverts full word correctly', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, BITS_PER_WORD)
      const result = idx.not()
      expect(result.isEmpty).toBe(true)
    })

    it('preserves size', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(10)
      const result = idx.not()
      expect(result.size).toBe(idx.size)
    })

    it('double not returns to original', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(3)
      idx.set(5)
      const result = idx.not().not()
      expect(result.equals(idx)).toBe(true)
    })
  })

  describe('equals', () => {
    it('two empty indices are equal', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      expect(a.equals(b)).toBe(true)
    })

    it('same bits are equal', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      b.set(1)
      b.set(2)
      expect(a.equals(b)).toBe(true)
    })

    it('different bits are not equal', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      b.set(2)
      expect(a.equals(b)).toBe(false)
    })

    it('different count is not equal', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      b.set(1)
      expect(a.equals(b)).toBe(false)
    })

    it('empty and non-empty not equal', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      b.set(1)
      expect(a.equals(b)).toBe(false)
    })

    it('same bits different set order are equal', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(5)
      a.set(10)
      b.set(10)
      b.set(5)
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('empty index is empty', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.isEmpty).toBe(true)
    })

    it('non-empty index is not empty', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      expect(idx.isEmpty).toBe(false)
    })

    it('after clear is empty', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.clear()
      expect(idx.isEmpty).toBe(true)
    })

    it('after clearing all bits is empty', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.clear(5)
      expect(idx.isEmpty).toBe(true)
    })
  })

  describe('size', () => {
    it('starts at 0', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.size).toBe(0)
    })

    it('updates on set', () => {
      const idx = new SparseBitmapIndex()
      idx.set(99)
      expect(idx.size).toBe(100)
    })

    it('resets on clear', () => {
      const idx = new SparseBitmapIndex()
      idx.set(99)
      idx.clear()
      expect(idx.size).toBe(0)
    })

    it('updates on setRange', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(10, 20)
      expect(idx.size).toBe(20)
    })
  })

  describe('bitCount', () => {
    it('starts at 0', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.bitCount).toBe(0)
    })

    it('tracks set bits', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(2)
      idx.set(3)
      expect(idx.bitCount).toBe(3)
    })

    it('tracks after clear', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(2)
      idx.clear()
      expect(idx.bitCount).toBe(0)
    })
  })

  describe('clear (all)', () => {
    it('clears all bits', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 100)
      idx.clear()
      expect(idx.isEmpty).toBe(true)
      expect(idx.size).toBe(0)
      expect(idx.bitCount).toBe(0)
    })

    it('clear on already empty is no-op', () => {
      const idx = new SparseBitmapIndex()
      idx.clear()
      expect(idx.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect(idx.toArray()).toEqual([])
    })

    it('returns array representation', () => {
      const idx = new SparseBitmapIndex()
      idx.set(0)
      idx.set(2)
      idx.set(4)
      expect(idx.toArray()).toEqual([1, 0, 1, 0, 1])
    })

    it('returns correct array for range', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 5)
      expect(idx.toArray()).toEqual([1, 1, 1, 1, 1])
    })

    it('handles large sparse indices', () => {
      const idx = new SparseBitmapIndex()
      idx.set(0)
      idx.set(99)
      const arr = idx.toArray()
      expect(arr.length).toBe(100)
      expect(arr[0]).toBe(1)
      expect(arr[50]).toBe(0)
      expect(arr[99]).toBe(1)
    })
  })

  describe('forEach', () => {
    it('does nothing for empty index', () => {
      const idx = new SparseBitmapIndex()
      const bits: number[] = []
      idx.forEach((i) => bits.push(i))
      expect(bits).toEqual([])
    })

    it('iterates all set bits', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(10)
      idx.set(15)
      const bits: number[] = []
      idx.forEach((i) => bits.push(i))
      expect(bits).toEqual([5, 10, 15])
    })

    it('provides value parameter', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      const values: number[] = []
      idx.forEach((_i, v) => values.push(v))
      expect(values).toEqual([1])
    })

    it('iterates in sorted order', () => {
      const idx = new SparseBitmapIndex()
      idx.set(20)
      idx.set(5)
      idx.set(10)
      const bits: number[] = []
      idx.forEach((i) => bits.push(i))
      expect(bits).toEqual([5, 10, 20])
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty index', () => {
      const idx = new SparseBitmapIndex()
      expect([...idx]).toEqual([])
    })

    it('iterates set bit indices', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(10)
      idx.set(15)
      expect([...idx]).toEqual([5, 10, 15])
    })

    it('works in for-of loop', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(3)
      const bits: number[] = []
      for (const bit of idx) {
        bits.push(bit)
      }
      expect(bits).toEqual([1, 3])
    })

    it('iterates in sorted order', () => {
      const idx = new SparseBitmapIndex()
      idx.set(100)
      idx.set(5)
      idx.set(50)
      expect([...idx]).toEqual([5, 50, 100])
    })

    it('works with spread in Array.from', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(2)
      expect(Array.from(idx)).toEqual([1, 2])
    })
  })

  describe('getStatistics', () => {
    it('returns copy of statistics', () => {
      const idx = new SparseBitmapIndex()
      const stats1 = idx.getStatistics()
      const stats2 = idx.getStatistics()
      expect(stats1).toEqual(stats2)
      expect(stats1).not.toBe(stats2)
    })

    it('tracks all operation types', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.clear(1)
      idx.toggle(2)
      idx.setRange(10, 20)
      idx.clearRange(10, 15)
      idx.get(5)
      const stats = idx.getStatistics()
      expect(stats.sets).toBe(1)
      expect(stats.clears).toBe(1)
      expect(stats.toggles).toBe(1)
      expect(stats.rangeOperations).toBe(2)
      expect(stats.lookups).toBe(1)
    })

    it('does not reset across calls', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(2)
      idx.getStatistics()
      idx.set(3)
      expect(idx.getStatistics().sets).toBe(3)
    })
  })

  describe('compress', () => {
    it('removes zero-valued words', () => {
      const idx = new SparseBitmapIndex()
      idx.set(0)
      idx.set(5)
      idx.clear(5)
      idx.compress()
      expect(idx.bitCount).toBe(1)
      expect(idx.get(0)).toBe(1)
    })

    it('increments compression counter', () => {
      const idx = new SparseBitmapIndex()
      idx.compress()
      expect(idx.getStatistics().compressions).toBe(1)
    })

    it('does not affect correct data', () => {
      const idx = new SparseBitmapIndex()
      idx.set(1)
      idx.set(3)
      idx.set(5)
      idx.compress()
      expect(idx.bitCount).toBe(3)
      expect(idx.get(1)).toBe(1)
      expect(idx.get(3)).toBe(1)
      expect(idx.get(5)).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles very large indices', () => {
      const idx = new SparseBitmapIndex()
      idx.set(10000000)
      expect(idx.get(10000000)).toBe(1)
      expect(idx.bitCount).toBe(1)
    })

    it('handles setting bit at exact word boundary', () => {
      const idx = new SparseBitmapIndex()
      idx.set(BITS_PER_WORD - 1)
      idx.set(BITS_PER_WORD)
      expect(idx.bitCount).toBe(2)
    })

    it('handles operations on same bit repeatedly', () => {
      const idx = new SparseBitmapIndex()
      for (let i = 0; i < 100; i++) {
        idx.set(5)
      }
      expect(idx.bitCount).toBe(1)
      for (let i = 0; i < 100; i++) {
        idx.clear(5)
      }
      expect(idx.bitCount).toBe(0)
    })

    it('handles range at boundaries', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(BITS_PER_WORD, BITS_PER_WORD * 2)
      expect(idx.bitCount).toBe(BITS_PER_WORD)
    })

    it('setRange followed by clearRange leaves correct state', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 100)
      idx.clearRange(50, 60)
      expect(idx.bitCount).toBe(90)
    })

    it('interleaved set and clear', () => {
      const idx = new SparseBitmapIndex()
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) idx.set(i)
      }
      expect(idx.bitCount).toBe(50)
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) idx.clear(i)
      }
      expect(idx.isEmpty).toBe(true)
    })

    it('boolean operations on sparse data', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      a.set(1000)
      b.set(2000)
      expect(a.and(b).isEmpty).toBe(true)
      expect(a.or(b).bitCount).toBe(2)
      expect(a.xor(b).bitCount).toBe(2)
    })
  })

  describe('exports', () => {
    it('exports BITS_PER_WORD constant', () => {
      expect(BITS_PER_WORD).toBe(32)
    })

    it('exports DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS', () => {
      expect(DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS.initialCapacity).toBe(64)
      expect(DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS.autoCompress).toBe(true)
      expect(DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS.compressionThreshold).toBe(0.3)
    })

    it('options type is usable', () => {
      const opts: SparseBitmapIndexOptions = { initialCapacity: 128 }
      expect(opts.initialCapacity).toBe(128)
    })

    it('statistics type is usable', () => {
      const stats: SparseBitmapIndexStatistics = {
        sets: 0,
        clears: 0,
        toggles: 0,
        rangeOperations: 0,
        compressions: 0,
        lookups: 0,
      }
      expect(stats.sets).toBe(0)
    })
  })

  describe('complex operations', () => {
    it('rank and select are inverse operations', () => {
      const idx = new SparseBitmapIndex()
      idx.set(5)
      idx.set(10)
      idx.set(15)
      for (let n = 0; n < idx.bitCount; n++) {
        const pos = idx.select(n)
        expect(pos).not.toBe(-1)
        expect(idx.rank(pos!)).toBe(n)
      }
    })

    it('findNext iterates all bits in order', () => {
      const idx = new SparseBitmapIndex()
      const expected = [5, 10, 15, 100, 200]
      for (const b of expected) {
        idx.set(b)
      }
      const found: number[] = []
      let pos = idx.findNext(-1)
      while (pos !== -1) {
        found.push(pos)
        pos = idx.findNext(pos + 1)
      }
      expect(found).toEqual(expected)
    })

    it('boolean operation chains', () => {
      const a = new SparseBitmapIndex()
      const b = new SparseBitmapIndex()
      const c = new SparseBitmapIndex()
      a.set(1)
      a.set(2)
      b.set(2)
      b.set(3)
      c.set(3)
      c.set(4)
      const result = a.or(b).and(c)
      expect(result.get(2)).toBe(0)
      expect(result.get(3)).toBe(1)
      expect(result.get(4)).toBe(0)
      expect(result.bitCount).toBe(1)
    })

    it('large scale set and query', () => {
      const idx = new SparseBitmapIndex()
      for (let i = 0; i < 1000; i += 3) {
        idx.set(i)
      }
      expect(idx.bitCount).toBe(334)
      expect(idx.findFirst()).toBe(0)
      expect(idx.findLast()).toBe(999)
      expect(idx.rank(999)).toBe(333)
    })

    it('clearRange recomputeSize', () => {
      const idx = new SparseBitmapIndex()
      idx.set(100)
      idx.set(200)
      idx.clearRange(0, 300)
      expect(idx.size).toBe(0)
      expect(idx.isEmpty).toBe(true)
    })

    it('setRange then partial clearRange', () => {
      const idx = new SparseBitmapIndex()
      idx.setRange(0, 64)
      idx.clearRange(10, 54)
      expect(idx.bitCount).toBe(20)
      expect(idx.get(9)).toBe(1)
      expect(idx.get(10)).toBe(0)
      expect(idx.get(53)).toBe(0)
      expect(idx.get(54)).toBe(1)
    })
  })
})
