import { describe, it, expect } from 'vitest'
import { BitSet } from '../src/utils/bit-set.js'

describe('BitSet', () => {
  describe('constructor', () => {
    it('creates bitset of given size', () => {
      const bs = new BitSet(64)
      expect(bs.size).toBe(64)
    })

    it('throws for negative size', () => {
      expect(() => new BitSet(-1)).toThrow(RangeError)
    })

    it('handles size 0', () => {
      const bs = new BitSet(0)
      expect(bs.size).toBe(0)
      expect(bs.count()).toBe(0)
    })
  })

  describe('set / get / has / clear', () => {
    it('sets and gets a bit', () => {
      const bs = new BitSet(32)
      bs.set(5)
      expect(bs.get(5)).toBe(1)
      expect(bs.has(5)).toBe(true)
    })

    it('unset bits return 0', () => {
      const bs = new BitSet(32)
      expect(bs.get(0)).toBe(0)
      expect(bs.has(0)).toBe(false)
    })

    it('clears a set bit', () => {
      const bs = new BitSet(32)
      bs.set(10)
      bs.clear(10)
      expect(bs.has(10)).toBe(false)
    })

    it('throws for out-of-bounds index', () => {
      const bs = new BitSet(10)
      expect(() => bs.set(-1)).toThrow(RangeError)
      expect(() => bs.set(10)).toThrow(RangeError)
      expect(() => bs.get(10)).toThrow(RangeError)
    })

    it('handles cross-word boundary', () => {
      const bs = new BitSet(64)
      bs.set(31)
      bs.set(32)
      expect(bs.has(31)).toBe(true)
      expect(bs.has(32)).toBe(true)
    })
  })

  describe('flip', () => {
    it('toggles a bit', () => {
      const bs = new BitSet(32)
      bs.flip(5)
      expect(bs.has(5)).toBe(true)
      bs.flip(5)
      expect(bs.has(5)).toBe(false)
    })
  })

  describe('setRange / clearRange / flipRange', () => {
    it('sets a range of bits', () => {
      const bs = new BitSet(32)
      bs.setRange(5, 10)
      for (let i = 5; i < 10; i++) expect(bs.has(i)).toBe(true)
      expect(bs.has(4)).toBe(false)
      expect(bs.has(10)).toBe(false)
    })

    it('clears a range of bits', () => {
      const bs = new BitSet(32)
      bs.setRange(0, 32)
      bs.clearRange(5, 10)
      for (let i = 5; i < 10; i++) expect(bs.has(i)).toBe(false)
      expect(bs.has(0)).toBe(true)
    })

    it('flips a range of bits', () => {
      const bs = new BitSet(32)
      bs.setRange(0, 10)
      bs.flipRange(5, 15)
      for (let i = 0; i < 5; i++) expect(bs.has(i)).toBe(true)
      for (let i = 5; i < 10; i++) expect(bs.has(i)).toBe(false)
      for (let i = 10; i < 15; i++) expect(bs.has(i)).toBe(true)
    })

    it('throws for invalid range', () => {
      const bs = new BitSet(10)
      expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
      expect(() => bs.setRange(5, 3)).toThrow(RangeError)
      expect(() => bs.setRange(0, 11)).toThrow(RangeError)
    })

    it('handles empty range', () => {
      const bs = new BitSet(10)
      bs.setRange(3, 3)
      expect(bs.count()).toBe(0)
    })
  })

  describe('count / isEmpty / isFull', () => {
    it('counts set bits', () => {
      const bs = new BitSet(32)
      bs.set(0)
      bs.set(15)
      bs.set(31)
      expect(bs.count()).toBe(3)
    })

    it('isEmpty when no bits set', () => {
      expect(new BitSet(32).isEmpty()).toBe(true)
    })

    it('isFull when all bits set', () => {
      const bs = new BitSet(10)
      bs.setRange(0, 10)
      expect(bs.isFull()).toBe(true)
    })
  })

  describe('bitwise operations', () => {
    it('and returns intersection', () => {
      const a = new BitSet(8)
      const b = new BitSet(8)
      a.setRange(0, 4)
      b.setRange(2, 6)
      const result = a.and(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('or returns union', () => {
      const a = new BitSet(8)
      const b = new BitSet(8)
      a.set(0)
      a.set(1)
      b.set(2)
      b.set(3)
      expect(a.or(b).toArray()).toEqual([0, 1, 2, 3])
    })

    it('xor returns symmetric difference', () => {
      const a = new BitSet(8)
      const b = new BitSet(8)
      a.set(0)
      a.set(1)
      b.set(1)
      b.set(2)
      expect(a.xor(b).toArray()).toEqual([0, 2])
    })

    it('not inverts all bits', () => {
      const bs = new BitSet(8)
      bs.set(0)
      bs.set(1)
      const inverted = bs.not()
      expect(inverted.toArray()).toEqual([2, 3, 4, 5, 6, 7])
    })
  })

  describe('equals', () => {
    it('equal bitsets', () => {
      const a = new BitSet(16)
      const b = new BitSet(16)
      a.set(5)
      b.set(5)
      expect(a.equals(b)).toBe(true)
    })

    it('different sizes not equal', () => {
      expect(new BitSet(8).equals(new BitSet(16))).toBe(false)
    })

    it('different bits not equal', () => {
      const a = new BitSet(8)
      const b = new BitSet(8)
      a.set(0)
      b.set(1)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const bs = new BitSet(16)
      bs.set(5)
      const copy = bs.clone()
      copy.clear(5)
      expect(bs.has(5)).toBe(true)
      expect(copy.has(5)).toBe(false)
    })
  })

  describe('toString', () => {
    it('returns binary string MSB first', () => {
      const bs = new BitSet(4)
      bs.set(0)
      expect(bs.toString()).toBe('0001')
    })
  })

  describe('toArray', () => {
    it('returns indices of set bits', () => {
      const bs = new BitSet(16)
      bs.set(2)
      bs.set(5)
      bs.set(10)
      expect(bs.toArray()).toEqual([2, 5, 10])
    })

    it('returns empty for no bits set', () => {
      expect(new BitSet(8).toArray()).toEqual([])
    })
  })
})
