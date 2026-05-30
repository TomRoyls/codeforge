import { describe, it, expect } from 'vitest'
import { RoaringBitSet } from '../../../src/utils/roaring-bitset.js'

describe('RoaringBitSet', () => {
  describe('add and has', () => {
    it('adds and checks a value', () => {
      const bs = new RoaringBitSet()
      bs.add(5)
      expect(bs.has(5)).toBe(true)
      expect(bs.has(4)).toBe(false)
      expect(bs.size).toBe(1)
    })

    it('does not add duplicate', () => {
      const bs = new RoaringBitSet()
      bs.add(5)
      bs.add(5)
      expect(bs.size).toBe(1)
    })

    it('handles zero', () => {
      const bs = new RoaringBitSet()
      bs.add(0)
      expect(bs.has(0)).toBe(true)
    })

    it('handles large values', () => {
      const bs = new RoaringBitSet()
      bs.add(65535)
      bs.add(65536)
      bs.add(131071)
      expect(bs.has(65535)).toBe(true)
      expect(bs.has(65536)).toBe(true)
      expect(bs.has(131071)).toBe(true)
    })

    it('ignores negative values', () => {
      const bs = new RoaringBitSet()
      bs.add(-1)
      expect(bs.size).toBe(0)
    })
  })

  describe('from', () => {
    it('creates from iterable', () => {
      const bs = RoaringBitSet.from([1, 3, 5, 7])
      expect(bs.size).toBe(4)
      expect(bs.has(3)).toBe(true)
      expect(bs.has(4)).toBe(false)
    })
  })

  describe('fromRange', () => {
    it('creates from range', () => {
      const bs = RoaringBitSet.fromRange(10, 14)
      expect(bs.size).toBe(5)
      expect(bs.has(10)).toBe(true)
      expect(bs.has(14)).toBe(true)
      expect(bs.has(15)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a value', () => {
      const bs = RoaringBitSet.from([1, 2, 3])
      expect(bs.delete(2)).toBe(true)
      expect(bs.has(2)).toBe(false)
      expect(bs.size).toBe(2)
    })

    it('returns false for missing', () => {
      const bs = new RoaringBitSet()
      expect(bs.delete(5)).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const bs = new RoaringBitSet()
      expect(bs.isEmpty).toBe(true)
    })

    it('returns false when not empty', () => {
      const bs = RoaringBitSet.from([1])
      expect(bs.isEmpty).toBe(false)
    })
  })

  describe('and', () => {
    it('computes intersection', () => {
      const a = RoaringBitSet.from([1, 2, 3, 4])
      const b = RoaringBitSet.from([2, 3, 5])
      const result = a.and(b)
      expect(result.toArray().sort()).toEqual([2, 3])
    })

    it('returns empty for disjoint sets', () => {
      const a = RoaringBitSet.from([1, 2])
      const b = RoaringBitSet.from([3, 4])
      expect(a.and(b).size).toBe(0)
    })
  })

  describe('or', () => {
    it('computes union', () => {
      const a = RoaringBitSet.from([1, 2])
      const b = RoaringBitSet.from([3, 4])
      const result = a.or(b)
      expect(result.toArray().sort()).toEqual([1, 2, 3, 4])
    })

    it('deduplicates', () => {
      const a = RoaringBitSet.from([1, 2])
      const b = RoaringBitSet.from([2, 3])
      expect(a.or(b).size).toBe(3)
    })
  })

  describe('xor', () => {
    it('computes symmetric difference', () => {
      const a = RoaringBitSet.from([1, 2, 3])
      const b = RoaringBitSet.from([2, 3, 4])
      const result = a.xor(b)
      expect(result.toArray().sort()).toEqual([1, 4])
    })
  })

  describe('andNot', () => {
    it('computes difference', () => {
      const a = RoaringBitSet.from([1, 2, 3, 4])
      const b = RoaringBitSet.from([2, 4])
      const result = a.andNot(b)
      expect(result.toArray().sort()).toEqual([1, 3])
    })
  })

  describe('forEach', () => {
    it('iterates all values', () => {
      const bs = RoaringBitSet.from([10, 20, 30])
      const collected: number[] = []
      bs.forEach((v) => collected.push(v))
      expect(collected.sort()).toEqual([10, 20, 30])
    })
  })

  describe('toArray', () => {
    it('returns sorted array', () => {
      const bs = RoaringBitSet.from([5, 1, 3])
      expect(bs.toArray()).toEqual([1, 3, 5])
    })
  })

  describe('min / max', () => {
    it('returns min', () => {
      const bs = RoaringBitSet.from([10, 20, 30])
      expect(bs.min).toBe(10)
    })

    it('returns max', () => {
      const bs = RoaringBitSet.from([10, 20, 30])
      expect(bs.max).toBe(30)
    })

    it('returns undefined for empty', () => {
      const bs = new RoaringBitSet()
      expect(bs.min).toBeUndefined()
      expect(bs.max).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('clears all', () => {
      const bs = RoaringBitSet.from([1, 2, 3])
      bs.clear()
      expect(bs.size).toBe(0)
      expect(bs.isEmpty).toBe(true)
    })
  })

  describe('cross-bucket operations', () => {
    it('handles values across 16-bit boundaries', () => {
      const bs = RoaringBitSet.from([0, 65535, 65536, 131071])
      expect(bs.size).toBe(4)
      expect(bs.has(0)).toBe(true)
      expect(bs.has(65535)).toBe(true)
      expect(bs.has(65536)).toBe(true)
      expect(bs.has(131071)).toBe(true)
    })

    it('union across buckets', () => {
      const a = RoaringBitSet.from([100])
      const b = RoaringBitSet.from([65536 + 100])
      const result = a.or(b)
      expect(result.size).toBe(2)
    })

    it('intersection across buckets only matches same bucket', () => {
      const a = RoaringBitSet.from([100, 65536 + 100])
      const b = RoaringBitSet.from([100])
      const result = a.and(b)
      expect(result.toArray()).toEqual([100])
    })
  })

  describe('stress test', () => {
    it('handles many values', () => {
      const bs = new RoaringBitSet()
      for (let i = 0; i < 1000; i++) {
        bs.add(i * 3)
      }
      expect(bs.size).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(bs.has(i * 3)).toBe(true)
        expect(bs.has(i * 3 + 1)).toBe(false)
      }
    })
  })
})
