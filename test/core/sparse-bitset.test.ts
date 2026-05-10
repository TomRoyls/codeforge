import { describe, it, expect } from 'vitest'
import { SparseBitset } from '../../src/core/sparse-bitset/types.js'

describe('SparseBitset', () => {
  describe('constructor', () => {
    it('creates empty bitset', () => {
      const bs = new SparseBitset()
      expect(bs.isEmpty()).toBe(true)
      expect(bs.cardinality()).toBe(0)
    })

    it('creates bitset from array of bits', () => {
      const bs = new SparseBitset([0, 5, 10])
      expect(bs.cardinality()).toBe(3)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(10)).toBe(true)
    })

    it('creates bitset from empty iterable', () => {
      const bs = new SparseBitset([])
      expect(bs.isEmpty()).toBe(true)
    })

    it('creates bitset from set', () => {
      const bs = new SparseBitset(new Set([1, 2, 3]))
      expect(bs.cardinality()).toBe(3)
    })

    it('creates bitset from generator', () => {
      function* gen() {
        yield 0
        yield 100
        yield 1000
      }
      const bs = new SparseBitset(gen())
      expect(bs.cardinality()).toBe(3)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(100)).toBe(true)
      expect(bs.get(1000)).toBe(true)
    })

    it('handles duplicate bits in initial iterable', () => {
      const bs = new SparseBitset([1, 1, 1, 2, 2])
      expect(bs.cardinality()).toBe(2)
    })

    it('handles single bit', () => {
      const bs = new SparseBitset([42])
      expect(bs.cardinality()).toBe(1)
      expect(bs.get(42)).toBe(true)
    })

    it('handles large bit positions', () => {
      const bs = new SparseBitset([1000000])
      expect(bs.get(1000000)).toBe(true)
      expect(bs.cardinality()).toBe(1)
    })
  })

  describe('set', () => {
    it('sets a bit', () => {
      const bs = new SparseBitset()
      bs.set(0)
      expect(bs.get(0)).toBe(true)
    })

    it('sets multiple bits', () => {
      const bs = new SparseBitset()
      bs.set(0)
      bs.set(100)
      bs.set(1000)
      expect(bs.cardinality()).toBe(3)
    })

    it('setting same bit twice does not increase cardinality', () => {
      const bs = new SparseBitset()
      bs.set(5)
      bs.set(5)
      expect(bs.cardinality()).toBe(1)
    })

    it('sets bit at word boundary (32)', () => {
      const bs = new SparseBitset()
      bs.set(31)
      bs.set(32)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
    })

    it('sets bit 0', () => {
      const bs = new SparseBitset()
      bs.set(0)
      expect(bs.get(0)).toBe(true)
      expect(bs.cardinality()).toBe(1)
    })

    it('sets bit at position 31 (last bit of first word)', () => {
      const bs = new SparseBitset()
      bs.set(31)
      expect(bs.get(31)).toBe(true)
    })

    it('sets bits across multiple words', () => {
      const bs = new SparseBitset()
      bs.set(0)
      bs.set(32)
      bs.set(64)
      bs.set(96)
      expect(bs.cardinality()).toBe(4)
    })

    it('throws on negative bit position', () => {
      const bs = new SparseBitset()
      expect(() => bs.set(-1)).toThrow(RangeError)
    })

    it('throws on non-integer bit position', () => {
      const bs = new SparseBitset()
      expect(() => bs.set(1.5)).toThrow(TypeError)
    })

    it('updates highest bit when setting larger bit', () => {
      const bs = new SparseBitset()
      bs.set(10)
      bs.set(100)
      expect(bs.nextSetBit(0)).toBe(10)
      expect(bs.prevSetBit(200)).toBe(100)
    })
  })

  describe('clear', () => {
    it('clears a set bit', () => {
      const bs = new SparseBitset([5])
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
      expect(bs.cardinality()).toBe(0)
    })

    it('clearing unset bit does nothing', () => {
      const bs = new SparseBitset([5])
      bs.clear(10)
      expect(bs.cardinality()).toBe(1)
    })

    it('clearing same bit twice', () => {
      const bs = new SparseBitset([5])
      bs.clear(5)
      bs.clear(5)
      expect(bs.cardinality()).toBe(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('clearing bit that was just set', () => {
      const bs = new SparseBitset()
      bs.set(5)
      expect(bs.cardinality()).toBe(1)
      bs.clear(5)
      expect(bs.cardinality()).toBe(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('clear updates highest bit', () => {
      const bs = new SparseBitset([10, 50, 100])
      bs.clear(100)
      expect(bs.prevSetBit(1000)).toBe(50)
    })

    it('clear all bits one by one', () => {
      const bs = new SparseBitset([0, 1, 2, 3])
      bs.clear(0)
      bs.clear(1)
      bs.clear(2)
      bs.clear(3)
      expect(bs.isEmpty()).toBe(true)
      expect(bs.cardinality()).toBe(0)
    })

    it('removes word from map when all bits cleared', () => {
      const bs = new SparseBitset([0])
      bs.clear(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('throws on negative bit position', () => {
      const bs = new SparseBitset()
      expect(() => bs.clear(-1)).toThrow(RangeError)
    })

    it('throws on non-integer bit position', () => {
      const bs = new SparseBitset()
      expect(() => bs.clear(1.5)).toThrow(TypeError)
    })

    it('clears bits across word boundaries', () => {
      const bs = new SparseBitset([31, 32])
      bs.clear(31)
      expect(bs.get(31)).toBe(false)
      expect(bs.get(32)).toBe(true)
      bs.clear(32)
      expect(bs.get(32)).toBe(false)
      expect(bs.isEmpty()).toBe(true)
    })
  })

  describe('get', () => {
    it('returns false for unset bit', () => {
      const bs = new SparseBitset()
      expect(bs.get(0)).toBe(false)
    })

    it('returns true for set bit', () => {
      const bs = new SparseBitset([5])
      expect(bs.get(5)).toBe(true)
    })

    it('returns false for negative bit', () => {
      const bs = new SparseBitset([5])
      expect(bs.get(-1)).toBe(false)
    })

    it('returns false for non-integer bit', () => {
      const bs = new SparseBitset([5])
      expect(bs.get(1.5)).toBe(false)
    })

    it('returns false for unset bit in word that has other bits', () => {
      const bs = new SparseBitset([0, 2, 4])
      expect(bs.get(1)).toBe(false)
      expect(bs.get(3)).toBe(false)
    })

    it('returns correct values after set and clear', () => {
      const bs = new SparseBitset()
      bs.set(5)
      expect(bs.get(5)).toBe(true)
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
      bs.set(5)
      expect(bs.get(5)).toBe(true)
    })

    it('handles very large bit positions', () => {
      const bs = new SparseBitset([999999])
      expect(bs.get(999999)).toBe(true)
      expect(bs.get(999998)).toBe(false)
      expect(bs.get(1000000)).toBe(false)
    })
  })

  describe('flip', () => {
    it('flips unset bit to set', () => {
      const bs = new SparseBitset()
      bs.flip(5)
      expect(bs.get(5)).toBe(true)
    })

    it('flips set bit to unset', () => {
      const bs = new SparseBitset([5])
      bs.flip(5)
      expect(bs.get(5)).toBe(false)
    })

    it('double flip returns to original', () => {
      const bs = new SparseBitset([5])
      bs.flip(5)
      bs.flip(5)
      expect(bs.get(5)).toBe(true)
    })

    it('flip updates cardinality correctly', () => {
      const bs = new SparseBitset([1, 2, 3])
      expect(bs.cardinality()).toBe(3)
      bs.flip(1)
      expect(bs.cardinality()).toBe(2)
      bs.flip(4)
      expect(bs.cardinality()).toBe(3)
    })

    it('flip on empty bitset sets first bit', () => {
      const bs = new SparseBitset()
      bs.flip(0)
      expect(bs.get(0)).toBe(true)
      expect(bs.cardinality()).toBe(1)
    })

    it('throws on negative bit position', () => {
      const bs = new SparseBitset()
      expect(() => bs.flip(-1)).toThrow(RangeError)
    })

    it('throws on non-integer bit position', () => {
      const bs = new SparseBitset()
      expect(() => bs.flip(1.5)).toThrow(TypeError)
    })

    it('flipping bits across word boundaries', () => {
      const bs = new SparseBitset()
      bs.flip(31)
      bs.flip(32)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
      bs.flip(31)
      bs.flip(32)
      expect(bs.get(31)).toBe(false)
      expect(bs.get(32)).toBe(false)
    })
  })

  describe('nextSetBit', () => {
    it('returns -1 for empty bitset', () => {
      const bs = new SparseBitset()
      expect(bs.nextSetBit(0)).toBe(-1)
    })

    it('finds first set bit from 0', () => {
      const bs = new SparseBitset([5, 10, 15])
      expect(bs.nextSetBit(0)).toBe(5)
    })

    it('finds next set bit from specific position', () => {
      const bs = new SparseBitset([5, 10, 15])
      expect(bs.nextSetBit(6)).toBe(10)
    })

    it('returns the bit at exact position if set', () => {
      const bs = new SparseBitset([5, 10, 15])
      expect(bs.nextSetBit(5)).toBe(5)
      expect(bs.nextSetBit(10)).toBe(10)
      expect(bs.nextSetBit(15)).toBe(15)
    })

    it('returns -1 when no more set bits', () => {
      const bs = new SparseBitset([5])
      expect(bs.nextSetBit(6)).toBe(-1)
    })

    it('handles negative from as 0', () => {
      const bs = new SparseBitset([5])
      expect(bs.nextSetBit(-10)).toBe(5)
    })

    it('finds bits across word boundaries', () => {
      const bs = new SparseBitset([31, 33])
      expect(bs.nextSetBit(0)).toBe(31)
      expect(bs.nextSetBit(32)).toBe(33)
    })

    it('handles bits in different words', () => {
      const bs = new SparseBitset([0, 64, 128])
      expect(bs.nextSetBit(1)).toBe(64)
      expect(bs.nextSetBit(65)).toBe(128)
      expect(bs.nextSetBit(129)).toBe(-1)
    })

    it('handles from position between set bits', () => {
      const bs = new SparseBitset([10, 20, 30])
      expect(bs.nextSetBit(15)).toBe(20)
      expect(bs.nextSetBit(25)).toBe(30)
    })

    it('handles single bit at position 0', () => {
      const bs = new SparseBitset([0])
      expect(bs.nextSetBit(0)).toBe(0)
    })
  })

  describe('prevSetBit', () => {
    it('returns -1 for empty bitset', () => {
      const bs = new SparseBitset()
      expect(bs.prevSetBit(0)).toBe(-1)
    })

    it('finds last set bit from end', () => {
      const bs = new SparseBitset([5, 10, 15])
      expect(bs.prevSetBit(100)).toBe(15)
    })

    it('finds previous set bit from specific position', () => {
      const bs = new SparseBitset([5, 10, 15])
      expect(bs.prevSetBit(14)).toBe(10)
    })

    it('returns the bit at exact position if set', () => {
      const bs = new SparseBitset([5, 10, 15])
      expect(bs.prevSetBit(5)).toBe(5)
      expect(bs.prevSetBit(10)).toBe(10)
      expect(bs.prevSetBit(15)).toBe(15)
    })

    it('returns -1 when no previous set bits', () => {
      const bs = new SparseBitset([5])
      expect(bs.prevSetBit(4)).toBe(-1)
    })

    it('returns -1 for negative from', () => {
      const bs = new SparseBitset([5])
      expect(bs.prevSetBit(-1)).toBe(-1)
    })

    it('finds bits across word boundaries', () => {
      const bs = new SparseBitset([31, 33])
      expect(bs.prevSetBit(33)).toBe(33)
      expect(bs.prevSetBit(32)).toBe(31)
    })

    it('handles bits in different words', () => {
      const bs = new SparseBitset([0, 64, 128])
      expect(bs.prevSetBit(127)).toBe(64)
      expect(bs.prevSetBit(63)).toBe(0)
    })

    it('handles single bit at position 0', () => {
      const bs = new SparseBitset([0])
      expect(bs.prevSetBit(0)).toBe(0)
    })

    it('handles from position beyond highest bit', () => {
      const bs = new SparseBitset([5, 10])
      expect(bs.prevSetBit(1000)).toBe(10)
    })
  })

  describe('cardinality', () => {
    it('returns 0 for empty bitset', () => {
      const bs = new SparseBitset()
      expect(bs.cardinality()).toBe(0)
    })

    it('counts single bit', () => {
      const bs = new SparseBitset([5])
      expect(bs.cardinality()).toBe(1)
    })

    it('counts multiple bits', () => {
      const bs = new SparseBitset([0, 1, 2, 3, 4])
      expect(bs.cardinality()).toBe(5)
    })

    it('counts bits across words', () => {
      const bs = new SparseBitset([0, 31, 32, 63, 64])
      expect(bs.cardinality()).toBe(5)
    })

    it('updates after set', () => {
      const bs = new SparseBitset()
      bs.set(0)
      expect(bs.cardinality()).toBe(1)
      bs.set(1)
      expect(bs.cardinality()).toBe(2)
    })

    it('updates after clear', () => {
      const bs = new SparseBitset([0, 1])
      bs.clear(0)
      expect(bs.cardinality()).toBe(1)
    })

    it('updates after flip', () => {
      const bs = new SparseBitset([0])
      bs.flip(0)
      expect(bs.cardinality()).toBe(0)
      bs.flip(1)
      expect(bs.cardinality()).toBe(1)
    })

    it('handles all bits in a word', () => {
      const bs = new SparseBitset()
      for (let i = 0; i < 32; i++) {
        bs.set(i)
      }
      expect(bs.cardinality()).toBe(32)
    })

    it('handles many sparse bits', () => {
      const bs = new SparseBitset()
      for (let i = 0; i < 100; i++) {
        bs.set(i * 100)
      }
      expect(bs.cardinality()).toBe(100)
    })
  })

  describe('isEmpty', () => {
    it('empty bitset is empty', () => {
      const bs = new SparseBitset()
      expect(bs.isEmpty()).toBe(true)
    })

    it('bitset with bits is not empty', () => {
      const bs = new SparseBitset([0])
      expect(bs.isEmpty()).toBe(false)
    })

    it('cleared bitset is empty', () => {
      const bs = new SparseBitset([0])
      bs.clear(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('bitset with only high bits is not empty', () => {
      const bs = new SparseBitset([1000000])
      expect(bs.isEmpty()).toBe(false)
    })

    it('all bits cleared makes it empty', () => {
      const bs = new SparseBitset([0, 5, 10, 15])
      bs.clear(0)
      bs.clear(5)
      bs.clear(10)
      bs.clear(15)
      expect(bs.isEmpty()).toBe(true)
    })
  })

  describe('and', () => {
    it('empty AND empty', () => {
      const a = new SparseBitset()
      const b = new SparseBitset()
      const result = a.and(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('empty AND non-empty', () => {
      const a = new SparseBitset()
      const b = new SparseBitset([1, 2, 3])
      const result = a.and(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('non-empty AND empty', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset()
      const result = a.and(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('overlapping bits', () => {
      const a = new SparseBitset([1, 2, 3, 4])
      const b = new SparseBitset([2, 3, 4, 5])
      const result = a.and(b)
      expect(result.cardinality()).toBe(3)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
      expect(result.get(4)).toBe(true)
      expect(result.get(1)).toBe(false)
      expect(result.get(5)).toBe(false)
    })

    it('no overlapping bits', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset([4, 5, 6])
      const result = a.and(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('identical bitsets', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset([1, 2, 3])
      const result = a.and(b)
      expect(result.cardinality()).toBe(3)
    })

    it('bits across word boundaries', () => {
      const a = new SparseBitset([31, 32, 63, 64])
      const b = new SparseBitset([31, 32, 65])
      const result = a.and(b)
      expect(result.cardinality()).toBe(2)
      expect(result.get(31)).toBe(true)
      expect(result.get(32)).toBe(true)
    })

    it('does not modify original bitsets', () => {
      const a = new SparseBitset([1, 2])
      const b = new SparseBitset([2, 3])
      a.and(b)
      expect(a.cardinality()).toBe(2)
      expect(b.cardinality()).toBe(2)
    })
  })

  describe('or', () => {
    it('empty OR empty', () => {
      const a = new SparseBitset()
      const b = new SparseBitset()
      const result = a.or(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('empty OR non-empty', () => {
      const a = new SparseBitset()
      const b = new SparseBitset([1, 2, 3])
      const result = a.or(b)
      expect(result.cardinality()).toBe(3)
    })

    it('non-empty OR empty', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset()
      const result = a.or(b)
      expect(result.cardinality()).toBe(3)
    })

    it('overlapping bits', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset([2, 3, 4])
      const result = a.or(b)
      expect(result.cardinality()).toBe(4)
    })

    it('no overlapping bits', () => {
      const a = new SparseBitset([1, 2])
      const b = new SparseBitset([3, 4])
      const result = a.or(b)
      expect(result.cardinality()).toBe(4)
    })

    it('bits across word boundaries', () => {
      const a = new SparseBitset([31])
      const b = new SparseBitset([32])
      const result = a.or(b)
      expect(result.cardinality()).toBe(2)
      expect(result.get(31)).toBe(true)
      expect(result.get(32)).toBe(true)
    })

    it('does not modify original bitsets', () => {
      const a = new SparseBitset([1])
      const b = new SparseBitset([2])
      a.or(b)
      expect(a.cardinality()).toBe(1)
      expect(b.cardinality()).toBe(1)
    })

    it('combines bits within same word', () => {
      const a = new SparseBitset([0, 2, 4])
      const b = new SparseBitset([1, 3, 5])
      const result = a.or(b)
      expect(result.cardinality()).toBe(6)
    })
  })

  describe('xor', () => {
    it('empty XOR empty', () => {
      const a = new SparseBitset()
      const b = new SparseBitset()
      const result = a.xor(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('empty XOR non-empty', () => {
      const a = new SparseBitset()
      const b = new SparseBitset([1, 2, 3])
      const result = a.xor(b)
      expect(result.cardinality()).toBe(3)
    })

    it('non-empty XOR empty', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset()
      const result = a.xor(b)
      expect(result.cardinality()).toBe(3)
    })

    it('overlapping bits cancel', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset([2, 3, 4])
      const result = a.xor(b)
      expect(result.cardinality()).toBe(2)
      expect(result.get(1)).toBe(true)
      expect(result.get(4)).toBe(true)
      expect(result.get(2)).toBe(false)
      expect(result.get(3)).toBe(false)
    })

    it('identical bitsets cancel completely', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset([1, 2, 3])
      const result = a.xor(b)
      expect(result.isEmpty()).toBe(true)
    })

    it('no overlapping bits acts as OR', () => {
      const a = new SparseBitset([1, 2])
      const b = new SparseBitset([3, 4])
      const result = a.xor(b)
      expect(result.cardinality()).toBe(4)
    })

    it('bits across word boundaries', () => {
      const a = new SparseBitset([31])
      const b = new SparseBitset([31, 32])
      const result = a.xor(b)
      expect(result.cardinality()).toBe(1)
      expect(result.get(32)).toBe(true)
      expect(result.get(31)).toBe(false)
    })

    it('does not modify original bitsets', () => {
      const a = new SparseBitset([1])
      const b = new SparseBitset([2])
      a.xor(b)
      expect(a.cardinality()).toBe(1)
    })
  })

  describe('not', () => {
    it('empty bitset not gives bit 0', () => {
      const bs = new SparseBitset()
      const result = bs.not()
      expect(result.isEmpty()).toBe(true)
    })

    it('not of single bit at position 0', () => {
      const bs = new SparseBitset([0])
      const result = bs.not()
      expect(result.get(0)).toBe(false)
      expect(result.cardinality()).toBe(31)
    })

    it('not of full first word', () => {
      const bits: number[] = []
      for (let i = 0; i < 32; i++) bits.push(i)
      const bs = new SparseBitset(bits)
      const result = bs.not()
      expect(result.isEmpty()).toBe(true)
    })

    it('not flips all bits up to highest word', () => {
      const bs = new SparseBitset([5])
      const result = bs.not()
      expect(result.get(5)).toBe(false)
      expect(result.cardinality()).toBe(31)
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
      expect(result.get(4)).toBe(true)
      expect(result.get(6)).toBe(true)
      expect(result.get(31)).toBe(true)
    })

    it('not of sparse bits across words', () => {
      const bs = new SparseBitset([0, 32, 64])
      const result = bs.not()
      expect(result.get(0)).toBe(false)
      expect(result.get(32)).toBe(false)
      expect(result.get(64)).toBe(false)
      expect(result.get(1)).toBe(true)
      expect(result.get(31)).toBe(true)
      expect(result.get(33)).toBe(true)
    })

    it('double not returns to original', () => {
      const bs = new SparseBitset([1, 5, 10])
      const result = bs.not().not()
      expect(result.get(1)).toBe(true)
      expect(result.get(5)).toBe(true)
      expect(result.get(10)).toBe(true)
    })

    it('does not modify original bitset', () => {
      const bs = new SparseBitset([1, 2])
      bs.not()
      expect(bs.cardinality()).toBe(2)
    })
  })

  describe('clone', () => {
    it('clones empty bitset', () => {
      const bs = new SparseBitset()
      const clone = bs.clone()
      expect(clone.isEmpty()).toBe(true)
    })

    it('clones bitset with bits', () => {
      const bs = new SparseBitset([1, 5, 10])
      const clone = bs.clone()
      expect(clone.cardinality()).toBe(3)
      expect(clone.get(1)).toBe(true)
      expect(clone.get(5)).toBe(true)
      expect(clone.get(10)).toBe(true)
    })

    it('clone is independent', () => {
      const bs = new SparseBitset([1, 2, 3])
      const clone = bs.clone()
      clone.clear(1)
      expect(bs.get(1)).toBe(true)
      expect(clone.get(1)).toBe(false)
    })

    it('clone preserves sparse structure', () => {
      const bs = new SparseBitset([0, 1000, 1000000])
      const clone = bs.clone()
      expect(clone.get(0)).toBe(true)
      expect(clone.get(1000)).toBe(true)
      expect(clone.get(1000000)).toBe(true)
      expect(clone.cardinality()).toBe(3)
    })

    it('modifying original after clone does not affect clone', () => {
      const bs = new SparseBitset([1, 2, 3])
      const clone = bs.clone()
      bs.clear(1)
      bs.set(4)
      expect(clone.get(1)).toBe(true)
      expect(clone.get(4)).toBe(false)
      expect(clone.cardinality()).toBe(3)
    })

    it('modifying clone does not affect original', () => {
      const bs = new SparseBitset([1, 2, 3])
      const clone = bs.clone()
      clone.set(100)
      clone.clear(1)
      expect(bs.get(100)).toBe(false)
      expect(bs.get(1)).toBe(true)
    })
  })

  describe('iteration', () => {
    it('iterates over empty bitset', () => {
      const bs = new SparseBitset()
      const bits = [...bs]
      expect(bits).toEqual([])
    })

    it('iterates over single bit', () => {
      const bs = new SparseBitset([5])
      expect([...bs]).toEqual([5])
    })

    it('iterates in order', () => {
      const bs = new SparseBitset([10, 5, 1])
      expect([...bs]).toEqual([1, 5, 10])
    })

    it('iterates across words', () => {
      const bs = new SparseBitset([0, 32, 64])
      expect([...bs]).toEqual([0, 32, 64])
    })

    it('iterates many bits', () => {
      const positions = [0, 5, 10, 15, 20, 25, 30]
      const bs = new SparseBitset(positions)
      expect([...bs]).toEqual(positions)
    })

    it('works with for-of', () => {
      const bs = new SparseBitset([1, 2, 3])
      const collected: number[] = []
      for (const bit of bs) {
        collected.push(bit)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('works with spread', () => {
      const bs = new SparseBitset([3, 1, 2])
      expect([...bs]).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const bs = new SparseBitset([3, 1, 2])
      expect(Array.from(bs)).toEqual([1, 2, 3])
    })
  })

  describe('large sparse ranges', () => {
    it('handles bit position 100000', () => {
      const bs = new SparseBitset()
      bs.set(100000)
      expect(bs.get(100000)).toBe(true)
      expect(bs.cardinality()).toBe(1)
    })

    it('handles bit position 1000000', () => {
      const bs = new SparseBitset()
      bs.set(1000000)
      expect(bs.get(1000000)).toBe(true)
      expect(bs.cardinality()).toBe(1)
    })

    it('handles very sparse bits', () => {
      const bs = new SparseBitset()
      for (let i = 0; i < 50; i++) {
        bs.set(i * 100000)
      }
      expect(bs.cardinality()).toBe(50)
      expect(bs.nextSetBit(0)).toBe(0)
      expect(bs.nextSetBit(1)).toBe(100000)
    })

    it('handles all bits in a single word', () => {
      const bs = new SparseBitset()
      for (let i = 0; i < 32; i++) {
        bs.set(i)
      }
      expect(bs.cardinality()).toBe(32)
      for (let i = 0; i < 32; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('handles all bits in two words', () => {
      const bs = new SparseBitset()
      for (let i = 0; i < 64; i++) {
        bs.set(i)
      }
      expect(bs.cardinality()).toBe(64)
    })

    it('handles clearing all bits in a word', () => {
      const bs = new SparseBitset()
      for (let i = 0; i < 32; i++) {
        bs.set(i)
      }
      for (let i = 0; i < 32; i++) {
        bs.clear(i)
      }
      expect(bs.isEmpty()).toBe(true)
    })

    it('handles adjacent words', () => {
      const bs = new SparseBitset()
      bs.set(31)
      bs.set(32)
      bs.set(63)
      bs.set(64)
      expect(bs.cardinality()).toBe(4)
      expect(bs.nextSetBit(0)).toBe(31)
      expect(bs.prevSetBit(100)).toBe(64)
    })

    it('handles operations on large sparse ranges', () => {
      const a = new SparseBitset([0, 10000, 100000])
      const b = new SparseBitset([10000, 100000, 200000])
      const andResult = a.and(b)
      expect(andResult.cardinality()).toBe(2)
      expect(andResult.get(10000)).toBe(true)
      expect(andResult.get(100000)).toBe(true)
    })

    it('handles OR on distant ranges', () => {
      const a = new SparseBitset([0])
      const b = new SparseBitset([1000000])
      const result = a.or(b)
      expect(result.cardinality()).toBe(2)
      expect(result.get(0)).toBe(true)
      expect(result.get(1000000)).toBe(true)
    })

    it('nextSetBit across large gap', () => {
      const bs = new SparseBitset([0, 1000000])
      expect(bs.nextSetBit(1)).toBe(1000000)
      expect(bs.nextSetBit(1000001)).toBe(-1)
    })

    it('prevSetBit across large gap', () => {
      const bs = new SparseBitset([0, 1000000])
      expect(bs.prevSetBit(999999)).toBe(0)
      expect(bs.prevSetBit(1000000)).toBe(1000000)
    })

    it('iteration over large sparse range', () => {
      const bs = new SparseBitset([0, 1000000])
      expect([...bs]).toEqual([0, 1000000])
    })

    it('not on large sparse range', () => {
      const bs = new SparseBitset([0, 100])
      const result = bs.not()
      expect(result.get(0)).toBe(false)
      expect(result.get(100)).toBe(false)
      expect(result.get(50)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('bit position 0', () => {
      const bs = new SparseBitset()
      bs.set(0)
      expect(bs.get(0)).toBe(true)
      bs.clear(0)
      expect(bs.get(0)).toBe(false)
      bs.flip(0)
      expect(bs.get(0)).toBe(true)
    })

    it('bit position exactly at word boundary', () => {
      const bs = new SparseBitset()
      for (const pos of [31, 32, 63, 64, 95, 96]) {
        bs.set(pos)
        expect(bs.get(pos)).toBe(true)
      }
      expect(bs.cardinality()).toBe(6)
    })

    it('set clear set pattern', () => {
      const bs = new SparseBitset()
      bs.set(5)
      bs.clear(5)
      bs.set(5)
      expect(bs.get(5)).toBe(true)
      expect(bs.cardinality()).toBe(1)
    })

    it('clearing from empty does not error', () => {
      const bs = new SparseBitset()
      bs.clear(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('flip on empty then operations', () => {
      const bs = new SparseBitset()
      bs.flip(0)
      expect(bs.get(0)).toBe(true)
      expect(bs.cardinality()).toBe(1)
    })

    it('many operations in sequence', () => {
      const bs = new SparseBitset()
      bs.set(0)
      bs.set(32)
      bs.set(64)
      bs.clear(32)
      bs.flip(96)
      bs.set(64)
      expect(bs.cardinality()).toBe(3)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(32)).toBe(false)
      expect(bs.get(64)).toBe(true)
      expect(bs.get(96)).toBe(true)
    })

    it('AND followed by OR', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset([2, 3, 4])
      const andResult = a.and(b)
      const orResult = a.or(b)
      expect(andResult.cardinality()).toBe(2)
      expect(orResult.cardinality()).toBe(4)
    })

    it('XOR with self gives empty', () => {
      const bs = new SparseBitset([1, 2, 3, 100, 1000])
      const result = bs.xor(bs)
      expect(result.isEmpty()).toBe(true)
    })

    it('AND with self gives self', () => {
      const bs = new SparseBitset([1, 2, 3])
      const result = bs.and(bs)
      expect(result.cardinality()).toBe(3)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
    })

    it('OR with self gives self', () => {
      const bs = new SparseBitset([1, 2, 3])
      const result = bs.or(bs)
      expect(result.cardinality()).toBe(3)
    })

    it('nextSetBit from position beyond all bits', () => {
      const bs = new SparseBitset([1, 2, 3])
      expect(bs.nextSetBit(100)).toBe(-1)
    })

    it('prevSetBit from position before all bits', () => {
      const bs = new SparseBitset([10, 20, 30])
      expect(bs.prevSetBit(5)).toBe(-1)
    })

    it('clone of clone', () => {
      const bs = new SparseBitset([1, 2, 3])
      const clone1 = bs.clone()
      const clone2 = clone1.clone()
      expect(clone2.cardinality()).toBe(3)
      clone2.clear(1)
      expect(clone1.get(1)).toBe(true)
    })

    it('iterator yields nothing on empty', () => {
      const bs = new SparseBitset()
      let count = 0
      for (const _ of bs) {
        count++
      }
      expect(count).toBe(0)
    })

    it('get returns false for bits far from any set bit', () => {
      const bs = new SparseBitset([100])
      expect(bs.get(0)).toBe(false)
      expect(bs.get(50)).toBe(false)
      expect(bs.get(200)).toBe(false)
    })

    it('multiple flips on same bit', () => {
      const bs = new SparseBitset()
      bs.flip(5)
      expect(bs.get(5)).toBe(true)
      bs.flip(5)
      expect(bs.get(5)).toBe(false)
      bs.flip(5)
      expect(bs.get(5)).toBe(true)
      bs.flip(5)
      expect(bs.get(5)).toBe(false)
    })

    it('complex interleaved operations', () => {
      const bs = new SparseBitset()
      for (let i = 0; i < 10; i++) {
        bs.set(i * 100)
      }
      expect(bs.cardinality()).toBe(10)
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          bs.clear(i * 100)
        }
      }
      expect(bs.cardinality()).toBe(5)
      const bits = [...bs]
      expect(bits).toEqual([100, 300, 500, 700, 900])
    })

    it('operations on single bit bitsets', () => {
      const a = new SparseBitset([0])
      const b = new SparseBitset([0])
      expect(a.and(b).cardinality()).toBe(1)
      expect(a.or(b).cardinality()).toBe(1)
      expect(a.xor(b).cardinality()).toBe(0)
    })

    it('NOT then AND with original', () => {
      const bs = new SparseBitset([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])
      const complement = bs.not()
      const result = bs.and(complement)
      expect(result.isEmpty()).toBe(true)
    })

    it('NOT then OR gives all ones up to highest word', () => {
      const bs = new SparseBitset([1, 3])
      const complement = bs.not()
      const result = bs.or(complement)
      expect(result.cardinality()).toBe(32)
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(true)
      expect(result.get(31)).toBe(true)
    })

    it('nextSetBit and prevSetBit are consistent', () => {
      const bits = [5, 10, 15, 20, 25]
      const bs = new SparseBitset(bits)
      for (const bit of bits) {
        expect(bs.nextSetBit(bit)).toBe(bit)
        expect(bs.prevSetBit(bit)).toBe(bit)
      }
    })

    it('chaining operations', () => {
      const a = new SparseBitset([1, 2, 3])
      const b = new SparseBitset([2, 3, 4])
      const c = new SparseBitset([3, 4, 5])
      const result = a.or(b).and(c)
      expect(result.cardinality()).toBe(2)
      expect(result.get(3)).toBe(true)
      expect(result.get(4)).toBe(true)
    })

    it('highest bit updates correctly after clear', () => {
      const bs = new SparseBitset([10, 20, 30])
      bs.clear(30)
      expect(bs.prevSetBit(100)).toBe(20)
      bs.clear(20)
      expect(bs.prevSetBit(100)).toBe(10)
      bs.clear(10)
      expect(bs.prevSetBit(100)).toBe(-1)
    })

    it('setting many bits and iterating', () => {
      const bs = new SparseBitset()
      const positions: number[] = []
      for (let i = 0; i < 100; i++) {
        const pos = i * 33
        bs.set(pos)
        positions.push(pos)
      }
      expect([...bs]).toEqual(positions)
    })
  })
})
