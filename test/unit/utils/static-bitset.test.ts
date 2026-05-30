import { describe, it, expect } from 'vitest'
import { StaticBitset } from '../../../src/utils/static-bitset.js'

describe('StaticBitset', () => {
  describe('construction', () => {
    it('creates bitset with given length', () => {
      const bs = new StaticBitset(100)
      expect(bs.length).toBe(100)
      expect(bs.isEmpty).toBe(true)
    })

    it('throws on negative length', () => {
      expect(() => new StaticBitset(-1)).toThrow(RangeError)
    })

    it('handles zero length', () => {
      const bs = new StaticBitset(0)
      expect(bs.length).toBe(0)
      expect(bs.isEmpty).toBe(true)
    })
  })

  describe('set/get/clear', () => {
    it('sets and gets a bit', () => {
      const bs = new StaticBitset(64)
      bs.set(5)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(4)).toBe(false)
    })

    it('clears a bit', () => {
      const bs = new StaticBitset(64)
      bs.set(5)
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
    })

    it('flips a bit', () => {
      const bs = new StaticBitset(64)
      bs.flip(5)
      expect(bs.get(5)).toBe(true)
      bs.flip(5)
      expect(bs.get(5)).toBe(false)
    })

    it('throws on out of range', () => {
      const bs = new StaticBitset(10)
      expect(() => bs.set(10)).toThrow(RangeError)
      expect(() => bs.set(-1)).toThrow(RangeError)
    })

    it('get returns false for out of range', () => {
      const bs = new StaticBitset(10)
      expect(bs.get(10)).toBe(false)
      expect(bs.get(-1)).toBe(false)
    })
  })

  describe('setRange / clearRange', () => {
    it('sets a range', () => {
      const bs = new StaticBitset(20)
      bs.setRange(5, 9)
      for (let i = 5; i <= 9; i++) expect(bs.get(i)).toBe(true)
      expect(bs.get(4)).toBe(false)
      expect(bs.get(10)).toBe(false)
    })

    it('clears a range', () => {
      const bs = StaticBitset.fromRange(0, 19)
      bs.clearRange(5, 9)
      for (let i = 5; i <= 9; i++) expect(bs.get(i)).toBe(false)
      expect(bs.get(4)).toBe(true)
    })
  })

  describe('from', () => {
    it('creates from indices', () => {
      const bs = StaticBitset.from([1, 3, 5, 7])
      expect(bs.get(1)).toBe(true)
      expect(bs.get(2)).toBe(false)
      expect(bs.popcount).toBe(4)
    })
  })

  describe('fromRange', () => {
    it('creates from range', () => {
      const bs = StaticBitset.fromRange(3, 7)
      expect(bs.popcount).toBe(5)
    })
  })

  describe('popcount', () => {
    it('counts set bits', () => {
      const bs = new StaticBitset(64)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(63)
      expect(bs.popcount).toBe(4)
    })
  })

  describe('isEmpty / isFull', () => {
    it('isEmpty when no bits set', () => {
      const bs = new StaticBitset(10)
      expect(bs.isEmpty).toBe(true)
    })

    it('isFull when all bits set', () => {
      const bs = new StaticBitset(10)
      bs.setRange(0, 9)
      expect(bs.isFull).toBe(true)
    })

    it('not full when partial', () => {
      const bs = new StaticBitset(10)
      bs.setRange(0, 8)
      expect(bs.isFull).toBe(false)
    })
  })

  describe('nextSet / nextClear', () => {
    it('finds next set bit', () => {
      const bs = StaticBitset.from([5, 10, 15])
      expect(bs.nextSet(0)).toBe(5)
      expect(bs.nextSet(6)).toBe(10)
      expect(bs.nextSet(16)).toBe(-1)
    })

    it('finds next clear bit', () => {
      const bs = StaticBitset.fromRange(5, 15)
      expect(bs.nextClear(0)).toBe(0)
      expect(bs.nextClear(5)).toBe(-1)
    })
  })

  describe('static operations', () => {
    it('union', () => {
      const a = StaticBitset.from([1, 2, 3], 10)
      const b = StaticBitset.from([3, 4, 5], 10)
      const result = StaticBitset.union(a, b)
      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('intersection', () => {
      const a = StaticBitset.from([1, 2, 3], 10)
      const b = StaticBitset.from([2, 3, 4], 10)
      const result = StaticBitset.intersection(a, b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('difference', () => {
      const a = StaticBitset.from([1, 2, 3], 10)
      const b = StaticBitset.from([2, 3, 4], 10)
      const result = StaticBitset.difference(a, b)
      expect(result.toArray()).toEqual([1])
    })
  })

  describe('clone', () => {
    it('clones the bitset', () => {
      const bs = StaticBitset.from([1, 3, 5])
      const clone = bs.clone()
      clone.clear(3)
      expect(bs.get(3)).toBe(true)
      expect(clone.get(3)).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets all bits', () => {
      const bs = StaticBitset.from([1, 2, 3])
      bs.reset()
      expect(bs.isEmpty).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates set bits', () => {
      const bs = StaticBitset.from([2, 4, 6])
      const collected: number[] = []
      bs.forEach((i) => collected.push(i))
      expect(collected).toEqual([2, 4, 6])
    })
  })

  describe('toArray', () => {
    it('returns array of set indices', () => {
      const bs = StaticBitset.from([0, 5, 10])
      expect(bs.toArray()).toEqual([0, 5, 10])
    })
  })

  describe('large bitset', () => {
    it('handles 10000 bits', () => {
      const bs = new StaticBitset(10000)
      for (let i = 0; i < 10000; i += 2) bs.set(i)
      expect(bs.popcount).toBe(5000)
      for (let i = 0; i < 10000; i += 2) expect(bs.get(i)).toBe(true)
    })
  })

  describe('boundary bits', () => {
    it('handles bit 0 and bit 31', () => {
      const bs = new StaticBitset(64)
      bs.set(0)
      bs.set(31)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(31)).toBe(true)
      expect(bs.popcount).toBe(2)
    })

    it('handles bit 32 (word boundary)', () => {
      const bs = new StaticBitset(64)
      bs.set(32)
      expect(bs.get(32)).toBe(true)
      expect(bs.get(31)).toBe(false)
    })
  })
})
