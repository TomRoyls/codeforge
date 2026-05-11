import { describe, it, expect } from 'vitest'
import { PersistentBitset } from '../../src/core/persistent-bitset/index.js'

describe('PersistentBitset', () => {
  describe('create', () => {
    it('creates empty bitset with no options', () => {
      const bs = PersistentBitset.create()
      expect(bs.size).toBe(0)
      expect(bs.count).toBe(0)
      expect(bs.isEmpty).toBe(true)
    })

    it('creates bitset with specified size', () => {
      const bs = PersistentBitset.create({ size: 64 })
      expect(bs.size).toBe(64)
      expect(bs.isEmpty).toBe(true)
    })

    it('creates bitset with initial bits', () => {
      const bs = PersistentBitset.create({ bits: [0, 3, 7] })
      expect(bs.get(0)).toBe(true)
      expect(bs.get(3)).toBe(true)
      expect(bs.get(7)).toBe(true)
      expect(bs.get(1)).toBe(false)
      expect(bs.count).toBe(3)
    })

    it('creates bitset with size and bits', () => {
      const bs = PersistentBitset.create({ size: 100, bits: [5, 10, 50] })
      expect(bs.size).toBe(100)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(10)).toBe(true)
      expect(bs.get(50)).toBe(true)
      expect(bs.count).toBe(3)
    })

    it('creates bitset with bits extending beyond explicit size', () => {
      const bs = PersistentBitset.create({ size: 10, bits: [5, 20] })
      expect(bs.size).toBe(21)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(20)).toBe(true)
    })

    it('creates bitset with empty bits array', () => {
      const bs = PersistentBitset.create({ bits: [] })
      expect(bs.isEmpty).toBe(true)
    })

    it('creates bitset with size 0', () => {
      const bs = PersistentBitset.create({ size: 0 })
      expect(bs.size).toBe(0)
      expect(bs.isEmpty).toBe(true)
    })

    it('throws on negative bit index in bits array', () => {
      expect(() => PersistentBitset.create({ bits: [-1] })).toThrow(RangeError)
    })

    it('throws on non-integer bit index in bits array', () => {
      expect(() => PersistentBitset.create({ bits: [1.5] })).toThrow(RangeError)
    })

    it('creates bitset from a single bit', () => {
      const bs = PersistentBitset.create({ bits: [0] })
      expect(bs.get(0)).toBe(true)
      expect(bs.size).toBe(1)
    })
  })

  describe('empty', () => {
    it('creates an empty bitset', () => {
      const bs = PersistentBitset.empty()
      expect(bs.size).toBe(0)
      expect(bs.count).toBe(0)
      expect(bs.isEmpty).toBe(true)
    })
  })

  describe('get', () => {
    it('returns false for unset bit', () => {
      const bs = PersistentBitset.create({ size: 10 })
      expect(bs.get(0)).toBe(false)
    })

    it('returns true for set bit', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      expect(bs.get(5)).toBe(true)
    })

    it('returns false for bit beyond size', () => {
      const bs = PersistentBitset.create({ size: 10 })
      expect(bs.get(100)).toBe(false)
    })

    it('throws on negative index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.get(-1)).toThrow(RangeError)
    })

    it('throws on non-integer index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.get(1.5)).toThrow(RangeError)
    })

    it('returns false for index 0 on empty bitset', () => {
      const bs = PersistentBitset.create()
      expect(bs.get(0)).toBe(false)
    })
  })

  describe('has', () => {
    it('aliases get for true case', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      expect(bs.has(5)).toBe(true)
    })

    it('aliases get for false case', () => {
      const bs = PersistentBitset.create({ size: 10 })
      expect(bs.has(5)).toBe(false)
    })

    it('throws on negative index like get', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.has(-1)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('returns new bitset with bit set', () => {
      const bs = PersistentBitset.create()
      const bs2 = bs.set(5)
      expect(bs.get(5)).toBe(false)
      expect(bs2.get(5)).toBe(true)
    })

    it('does not mutate original', () => {
      const bs = PersistentBitset.create({ bits: [3] })
      const bs2 = bs.set(7)
      expect(bs.get(7)).toBe(false)
      expect(bs2.get(7)).toBe(true)
      expect(bs.get(3)).toBe(true)
      expect(bs2.get(3)).toBe(true)
    })

    it('sets bit at index 0', () => {
      const bs = PersistentBitset.create().set(0)
      expect(bs.get(0)).toBe(true)
    })

    it('sets bit at high index', () => {
      const bs = PersistentBitset.create().set(1000)
      expect(bs.get(1000)).toBe(true)
    })

    it('idempotent set returns new bitset with same value', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      const bs2 = bs.set(5)
      expect(bs2.get(5)).toBe(true)
      expect(bs2.equals(bs)).toBe(true)
    })

    it('throws on negative index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.set(-1)).toThrow(RangeError)
    })

    it('throws on non-integer index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.set(1.5)).toThrow(RangeError)
    })

    it('updates size when setting beyond current size', () => {
      const bs = PersistentBitset.create({ size: 10 })
      const bs2 = bs.set(50)
      expect(bs2.size).toBe(51)
    })

    it('preserves size when setting within bounds', () => {
      const bs = PersistentBitset.create({ size: 100 })
      const bs2 = bs.set(50)
      expect(bs2.size).toBe(100)
    })
  })

  describe('clear', () => {
    it('returns new bitset with bit cleared', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      const bs2 = bs.clear(5)
      expect(bs.get(5)).toBe(true)
      expect(bs2.get(5)).toBe(false)
    })

    it('does not mutate original', () => {
      const bs = PersistentBitset.create({ bits: [3, 7] })
      const bs2 = bs.clear(3)
      expect(bs.get(3)).toBe(true)
      expect(bs2.get(3)).toBe(false)
      expect(bs2.get(7)).toBe(true)
    })

    it('returns equivalent bitset when clearing unset bit', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      const bs2 = bs.clear(3)
      expect(bs2.get(5)).toBe(true)
      expect(bs2.get(3)).toBe(false)
      expect(bs2.equals(bs)).toBe(true)
    })

    it('clears bit at index 0', () => {
      const bs = PersistentBitset.create({ bits: [0] })
      const bs2 = bs.clear(0)
      expect(bs2.get(0)).toBe(false)
    })

    it('throws on negative index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.clear(-1)).toThrow(RangeError)
    })

    it('throws on non-integer index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.clear(1.5)).toThrow(RangeError)
    })

    it('returns same reference when clearing beyond word array', () => {
      const bs = PersistentBitset.create({ size: 10 })
      const bs2 = bs.clear(100)
      expect(bs2).toBe(bs)
    })
  })

  describe('toggle', () => {
    it('sets an unset bit', () => {
      const bs = PersistentBitset.create()
      const bs2 = bs.toggle(5)
      expect(bs2.get(5)).toBe(true)
    })

    it('clears a set bit', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      const bs2 = bs.toggle(5)
      expect(bs2.get(5)).toBe(false)
    })

    it('does not mutate original', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      bs.toggle(5)
      expect(bs.get(5)).toBe(true)
    })

    it('throws on negative index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.toggle(-1)).toThrow(RangeError)
    })

    it('throws on non-integer index', () => {
      const bs = PersistentBitset.create()
      expect(() => bs.toggle(1.5)).toThrow(RangeError)
    })

    it('toggle twice returns to original state', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      const bs2 = bs.toggle(5)
      const bs3 = bs2.toggle(5)
      expect(bs3.get(5)).toBe(true)
      expect(bs3.equals(bs)).toBe(true)
    })
  })

  describe('count', () => {
    it('returns 0 for empty bitset', () => {
      expect(PersistentBitset.create().count).toBe(0)
    })

    it('returns 1 for single set bit', () => {
      expect(PersistentBitset.create({ bits: [5] }).count).toBe(1)
    })

    it('returns correct count for multiple bits', () => {
      expect(PersistentBitset.create({ bits: [1, 3, 7, 15] }).count).toBe(4)
    })

    it('returns correct count for bits across word boundaries', () => {
      const bs = PersistentBitset.create({ bits: [0, 31, 32, 63, 64] })
      expect(bs.count).toBe(5)
    })

    it('returns 0 after clearing all bits', () => {
      const bs = PersistentBitset.create({ bits: [1, 2, 3] })
      let cur = bs
      for (const bit of bs.toArray()) {
        cur = cur.clear(bit)
      }
      expect(cur.count).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty bitset', () => {
      expect(PersistentBitset.create().isEmpty).toBe(true)
    })

    it('returns true for bitset with size but no bits set', () => {
      expect(PersistentBitset.create({ size: 100 }).isEmpty).toBe(true)
    })

    it('returns false when bits are set', () => {
      expect(PersistentBitset.create({ bits: [5] }).isEmpty).toBe(false)
    })

    it('returns true after clearing all set bits', () => {
      const bs = PersistentBitset.create({ bits: [1, 2] })
        .clear(1)
        .clear(2)
      expect(bs.isEmpty).toBe(true)
    })
  })

  describe('and', () => {
    it('returns intersection of two bitsets', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      const b = PersistentBitset.create({ bits: [2, 3, 4] })
      const result = a.and(b)
      expect(result.get(1)).toBe(false)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
      expect(result.get(4)).toBe(false)
    })

    it('returns empty when no bits overlap', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      const b = PersistentBitset.create({ bits: [3, 4] })
      expect(a.and(b).isEmpty).toBe(true)
    })

    it('does not mutate operands', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      const b = PersistentBitset.create({ bits: [2, 3] })
      a.and(b)
      expect(a.get(1)).toBe(true)
      expect(a.get(2)).toBe(true)
      expect(b.get(2)).toBe(true)
      expect(b.get(3)).toBe(true)
    })

    it('handles different sizes', () => {
      const a = PersistentBitset.create({ bits: [5, 100] })
      const b = PersistentBitset.create({ bits: [5] })
      const result = a.and(b)
      expect(result.get(5)).toBe(true)
      expect(result.get(100)).toBe(false)
    })

    it('AND with empty returns empty', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      const b = PersistentBitset.empty()
      expect(a.and(b).isEmpty).toBe(true)
    })

    it('AND with self returns self equivalent', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      expect(a.and(a).equals(a)).toBe(true)
    })
  })

  describe('or', () => {
    it('returns union of two bitsets', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      const b = PersistentBitset.create({ bits: [3, 4] })
      const result = a.or(b)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
      expect(result.get(4)).toBe(true)
    })

    it('does not mutate operands', () => {
      const a = PersistentBitset.create({ bits: [1] })
      const b = PersistentBitset.create({ bits: [2] })
      a.or(b)
      expect(a.get(2)).toBe(false)
      expect(b.get(1)).toBe(false)
    })

    it('handles overlapping bits', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      const b = PersistentBitset.create({ bits: [2, 3, 4] })
      const result = a.or(b)
      expect(result.count).toBe(4)
    })

    it('OR with empty returns self equivalent', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      expect(a.or(PersistentBitset.empty()).equals(a)).toBe(true)
    })

    it('OR with self returns self equivalent', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      expect(a.or(a).equals(a)).toBe(true)
    })

    it('handles different sizes correctly', () => {
      const a = PersistentBitset.create({ bits: [5] })
      const b = PersistentBitset.create({ bits: [100] })
      const result = a.or(b)
      expect(result.get(5)).toBe(true)
      expect(result.get(100)).toBe(true)
    })
  })

  describe('xor', () => {
    it('returns symmetric difference', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      const b = PersistentBitset.create({ bits: [2, 3, 4] })
      const result = a.xor(b)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(false)
      expect(result.get(3)).toBe(false)
      expect(result.get(4)).toBe(true)
    })

    it('XOR with self returns empty', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      expect(a.xor(a).isEmpty).toBe(true)
    })

    it('XOR with empty returns self equivalent', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      expect(a.xor(PersistentBitset.empty()).equals(a)).toBe(true)
    })

    it('does not mutate operands', () => {
      const a = PersistentBitset.create({ bits: [1] })
      const b = PersistentBitset.create({ bits: [2] })
      a.xor(b)
      expect(a.get(2)).toBe(false)
      expect(b.get(1)).toBe(false)
    })

    it('handles different sizes', () => {
      const a = PersistentBitset.create({ bits: [5] })
      const b = PersistentBitset.create({ bits: [5, 100] })
      const result = a.xor(b)
      expect(result.get(5)).toBe(false)
      expect(result.get(100)).toBe(true)
    })
  })

  describe('not', () => {
    it('inverts all bits within size', () => {
      const bs = PersistentBitset.create({ size: 8, bits: [0, 2, 4, 6] })
      const inverted = bs.not()
      expect(inverted.get(0)).toBe(false)
      expect(inverted.get(1)).toBe(true)
      expect(inverted.get(2)).toBe(false)
      expect(inverted.get(3)).toBe(true)
      expect(inverted.get(4)).toBe(false)
      expect(inverted.get(5)).toBe(true)
      expect(inverted.get(6)).toBe(false)
      expect(inverted.get(7)).toBe(true)
    })

    it('does not mutate original', () => {
      const bs = PersistentBitset.create({ bits: [1] })
      bs.not()
      expect(bs.get(1)).toBe(true)
      expect(bs.get(0)).toBe(false)
    })

    it('double not returns to original', () => {
      const bs = PersistentBitset.create({ size: 16, bits: [1, 5, 10] })
      expect(bs.not().not().equals(bs)).toBe(true)
    })

    it('handles empty bitset', () => {
      const bs = PersistentBitset.empty()
      const inverted = bs.not()
      expect(inverted.size).toBe(0)
    })

    it('handles bitset with size but no bits set', () => {
      const bs = PersistentBitset.create({ size: 4 })
      const inverted = bs.not()
      expect(inverted.get(0)).toBe(true)
      expect(inverted.get(1)).toBe(true)
      expect(inverted.get(2)).toBe(true)
      expect(inverted.get(3)).toBe(true)
    })
  })

  describe('equals', () => {
    it('empty bitsets are equal', () => {
      const a = PersistentBitset.create()
      const b = PersistentBitset.create()
      expect(a.equals(b)).toBe(true)
    })

    it('same bits are equal', () => {
      const a = PersistentBitset.create({ bits: [1, 3, 5] })
      const b = PersistentBitset.create({ bits: [1, 3, 5] })
      expect(a.equals(b)).toBe(true)
    })

    it('different bits are not equal', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      const b = PersistentBitset.create({ bits: [1, 3] })
      expect(a.equals(b)).toBe(false)
    })

    it('same bits different sizes are still equal in content', () => {
      const a = PersistentBitset.create({ size: 10, bits: [1, 2] })
      const b = PersistentBitset.create({ size: 100, bits: [1, 2] })
      expect(a.equals(b)).toBe(true)
    })

    it('reflexive equality', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      expect(a.equals(a)).toBe(true)
    })

    it('one empty one not are not equal', () => {
      const a = PersistentBitset.create()
      const b = PersistentBitset.create({ bits: [0] })
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('intersects', () => {
    it('returns true when bits overlap', () => {
      const a = PersistentBitset.create({ bits: [1, 2, 3] })
      const b = PersistentBitset.create({ bits: [3, 4, 5] })
      expect(a.intersects(b)).toBe(true)
    })

    it('returns false when no overlap', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      const b = PersistentBitset.create({ bits: [3, 4] })
      expect(a.intersects(b)).toBe(false)
    })

    it('returns false for empty bitsets', () => {
      expect(PersistentBitset.empty().intersects(PersistentBitset.empty())).toBe(false)
    })

    it('returns false when one is empty', () => {
      const a = PersistentBitset.create({ bits: [1] })
      expect(a.intersects(PersistentBitset.empty())).toBe(false)
    })

    it('returns true for self intersection', () => {
      const a = PersistentBitset.create({ bits: [1, 2] })
      expect(a.intersects(a)).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty bitset', () => {
      expect(PersistentBitset.create().toArray()).toEqual([])
    })

    it('returns set bit indices', () => {
      const bs = PersistentBitset.create({ bits: [0, 3, 7] })
      expect(bs.toArray()).toEqual([0, 3, 7])
    })

    it('returns sorted indices', () => {
      const bs = PersistentBitset.create({ bits: [7, 0, 3] })
      expect(bs.toArray()).toEqual([0, 3, 7])
    })

    it('handles bits across word boundaries', () => {
      const bs = PersistentBitset.create({ bits: [0, 31, 32, 63] })
      expect(bs.toArray()).toEqual([0, 31, 32, 63])
    })

    it('returns correct indices after modifications', () => {
      const bs = PersistentBitset.create({ bits: [1, 2, 3] })
        .clear(2)
        .set(5)
      expect(bs.toArray()).toEqual([1, 3, 5])
    })
  })

  describe('toString', () => {
    it('returns empty string for empty bitset', () => {
      expect(PersistentBitset.create().toString()).toBe('')
    })

    it('returns correct binary representation', () => {
      const bs = PersistentBitset.create({ size: 8, bits: [0, 2, 4, 6] })
      expect(bs.toString()).toBe('10101010')
    })

    it('returns all zeros for unset bitset', () => {
      const bs = PersistentBitset.create({ size: 4 })
      expect(bs.toString()).toBe('0000')
    })

    it('returns all ones for fully set bitset', () => {
      const bs = PersistentBitset.create({ size: 4, bits: [0, 1, 2, 3] })
      expect(bs.toString()).toBe('1111')
    })

    it('handles size of 1', () => {
      const bs = PersistentBitset.create({ size: 1, bits: [0] })
      expect(bs.toString()).toBe('1')
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const bs = PersistentBitset.create({ bits: [1, 2, 3] })
      const clone = bs.clone()
      expect(clone.equals(bs)).toBe(true)
    })

    it('clone is not the same reference', () => {
      const bs = PersistentBitset.create({ bits: [1] })
      const clone = bs.clone()
      expect(clone).not.toBe(bs)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over set bits', () => {
      const bs = PersistentBitset.create({ bits: [1, 3, 5] })
      const result = [...bs]
      expect(result).toEqual([1, 3, 5])
    })

    it('iterates empty bitset', () => {
      const bs = PersistentBitset.create()
      const result = [...bs]
      expect(result).toEqual([])
    })

    it('iterates in order', () => {
      const bs = PersistentBitset.create({ bits: [5, 0, 10, 3] })
      const result = [...bs]
      expect(result).toEqual([0, 3, 5, 10])
    })

    it('works with for...of', () => {
      const bs = PersistentBitset.create({ bits: [2, 4, 6] })
      const result: number[] = []
      for (const bit of bs) {
        result.push(bit)
      }
      expect(result).toEqual([2, 4, 6])
    })

    it('works with destructuring', () => {
      const bs = PersistentBitset.create({ bits: [10, 20, 30] })
      const [first, second, third] = bs
      expect(first).toBe(10)
      expect(second).toBe(20)
      expect(third).toBe(30)
    })
  })

  describe('persistence (immutability)', () => {
    it('set returns new instance', () => {
      const bs = PersistentBitset.create()
      const bs2 = bs.set(5)
      expect(bs2).not.toBe(bs)
    })

    it('clear returns new instance', () => {
      const bs = PersistentBitset.create({ bits: [5] })
      const bs2 = bs.clear(5)
      expect(bs2).not.toBe(bs)
    })

    it('toggle returns new instance', () => {
      const bs = PersistentBitset.create()
      const bs2 = bs.toggle(5)
      expect(bs2).not.toBe(bs)
    })

    it('and returns new instance', () => {
      const a = PersistentBitset.create({ bits: [1] })
      const b = PersistentBitset.create({ bits: [1] })
      expect(a.and(b)).not.toBe(a)
      expect(a.and(b)).not.toBe(b)
    })

    it('or returns new instance', () => {
      const a = PersistentBitset.create({ bits: [1] })
      const b = PersistentBitset.create({ bits: [2] })
      expect(a.or(b)).not.toBe(a)
      expect(a.or(b)).not.toBe(b)
    })

    it('xor returns new instance', () => {
      const a = PersistentBitset.create({ bits: [1] })
      expect(a.xor(a)).not.toBe(a)
    })

    it('not returns new instance', () => {
      const bs = PersistentBitset.create({ bits: [1] })
      expect(bs.not()).not.toBe(bs)
    })

    it('clone returns new instance', () => {
      const bs = PersistentBitset.create({ bits: [1] })
      expect(bs.clone()).not.toBe(bs)
    })

    it('chain of operations preserves originals', () => {
      const bs0 = PersistentBitset.create({ bits: [1, 2, 3] })
      const bs1 = bs0.set(5)
      const bs2 = bs1.clear(2)
      const bs3 = bs2.toggle(10)
      expect(bs0.toArray()).toEqual([1, 2, 3])
      expect(bs1.toArray()).toEqual([1, 2, 3, 5])
      expect(bs2.toArray()).toEqual([1, 3, 5])
      expect(bs3.toArray()).toEqual([1, 3, 5, 10])
    })
  })

  describe('word boundary operations', () => {
    it('sets bits across 32-bit word boundary', () => {
      const bs = PersistentBitset.create()
        .set(31)
        .set(32)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
      expect(bs.count).toBe(2)
    })

    it('sets bits across 64-bit boundary', () => {
      const bs = PersistentBitset.create()
        .set(63)
        .set(64)
      expect(bs.get(63)).toBe(true)
      expect(bs.get(64)).toBe(true)
    })

    it('AND across different word lengths', () => {
      const a = PersistentBitset.create({ bits: [5, 100] })
      const b = PersistentBitset.create({ bits: [5, 50] })
      const result = a.and(b)
      expect(result.get(5)).toBe(true)
      expect(result.get(50)).toBe(false)
      expect(result.get(100)).toBe(false)
    })

    it('XOR across different word lengths', () => {
      const a = PersistentBitset.create({ bits: [100] })
      const b = PersistentBitset.create({ bits: [5] })
      const result = a.xor(b)
      expect(result.get(5)).toBe(true)
      expect(result.get(100)).toBe(true)
      expect(result.count).toBe(2)
    })
  })

  describe('large bitset operations', () => {
    it('handles setting many bits', () => {
      let bs = PersistentBitset.create()
      const bits = [0, 100, 500, 1000, 5000, 10000]
      for (const bit of bits) {
        bs = bs.set(bit)
      }
      expect(bs.count).toBe(6)
      for (const bit of bits) {
        expect(bs.get(bit)).toBe(true)
      }
    })

    it('handles clearing many bits', () => {
      const initialBits = [0, 10, 20, 30, 40, 50, 60, 70]
      let bs = PersistentBitset.create({ bits: initialBits })
      for (const bit of [10, 30, 50, 70]) {
        bs = bs.clear(bit)
      }
      expect(bs.toArray()).toEqual([0, 20, 40, 60])
    })

    it('handles large OR operations', () => {
      const a = PersistentBitset.create({ bits: [0, 1000] })
      const b = PersistentBitset.create({ bits: [500, 2000] })
      const result = a.or(b)
      expect(result.count).toBe(4)
      expect(result.get(0)).toBe(true)
      expect(result.get(500)).toBe(true)
      expect(result.get(1000)).toBe(true)
      expect(result.get(2000)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles bit 0', () => {
      const bs = PersistentBitset.create().set(0)
      expect(bs.get(0)).toBe(true)
      expect(bs.toArray()).toEqual([0])
    })

    it('handles consecutive set/clear', () => {
      let bs = PersistentBitset.create()
      bs = bs.set(5)
      bs = bs.clear(5)
      bs = bs.set(5)
      expect(bs.get(5)).toBe(true)
    })

    it('operations on empty bitset do not error', () => {
      const empty = PersistentBitset.empty()
      expect(empty.count).toBe(0)
      expect(empty.isEmpty).toBe(true)
      expect(empty.toArray()).toEqual([])
      expect(empty.toString()).toBe('')
      expect(empty.and(empty).isEmpty).toBe(true)
      expect(empty.or(empty).isEmpty).toBe(true)
      expect(empty.xor(empty).isEmpty).toBe(true)
      expect(empty.equals(empty)).toBe(true)
      expect(empty.intersects(empty)).toBe(false)
    })

    it('NOT of all-zeros within small size', () => {
      const bs = PersistentBitset.create({ size: 3 })
      const inverted = bs.not()
      expect(inverted.get(0)).toBe(true)
      expect(inverted.get(1)).toBe(true)
      expect(inverted.get(2)).toBe(true)
      expect(inverted.count).toBe(3)
    })

    it('NOT then AND recovers intersection', () => {
      const a = PersistentBitset.create({ size: 8, bits: [0, 2, 4] })
      const b = PersistentBitset.create({ size: 8, bits: [0, 4, 6] })
      const notB = b.not()
      const result = a.and(notB)
      expect(result.get(0)).toBe(false)
      expect(result.get(2)).toBe(true)
      expect(result.get(4)).toBe(false)
      expect(result.get(6)).toBe(false)
    })
  })
})
