import { describe, it, expect } from 'vitest'
import { Bitset } from '../src/core/bitset/bitset.js'

describe('Bitset', () => {
  // ─── Constructor ────────────────────────────────────────────────────
  describe('constructor', () => {
    it('should create a bitset with the given size', () => {
      const bs = new Bitset(64)
      expect(bs.size()).toBe(64)
    })

    it('should create a bitset of size 0', () => {
      const bs = new Bitset(0)
      expect(bs.size()).toBe(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should throw RangeError for negative size', () => {
      expect(() => new Bitset(-1)).toThrow(RangeError)
      expect(() => new Bitset(-1)).toThrow('non-negative')
    })

    it('should initialize all bits to 0', () => {
      const bs = new Bitset(100)
      expect(bs.isEmpty()).toBe(true)
      expect(bs.count()).toBe(0)
    })
  })

  // ─── Static factories ───────────────────────────────────────────────
  describe('fromString', () => {
    it('should create from binary string', () => {
      const bs = Bitset.fromString('1010')
      expect(bs.size()).toBe(4)
      expect(bs.get(0)).toBe(1)
      expect(bs.get(1)).toBe(0)
      expect(bs.get(2)).toBe(1)
      expect(bs.get(3)).toBe(0)
    })

    it('should create from all-zeros string', () => {
      const bs = Bitset.fromString('00000')
      expect(bs.isEmpty()).toBe(true)
    })

    it('should create from all-ones string', () => {
      const bs = Bitset.fromString('1111')
      expect(bs.isFull()).toBe(true)
    })

    it('should throw on invalid character', () => {
      expect(() => Bitset.fromString('10a01')).toThrow('Invalid character')
    })
  })

  describe('fromArray', () => {
    it('should create from number array', () => {
      const bs = Bitset.fromArray([1, 0, 1, 1, 0])
      expect(bs.get(0)).toBe(1)
      expect(bs.get(1)).toBe(0)
      expect(bs.get(3)).toBe(1)
      expect(bs.get(4)).toBe(0)
    })

    it('should throw on invalid value', () => {
      expect(() => Bitset.fromArray([1, 2, 0])).toThrow('Invalid bit value')
    })
  })

  describe('fromNumber', () => {
    it('should create from number with default size 32', () => {
      const bs = Bitset.fromNumber(5)
      expect(bs.size()).toBe(32)
      expect(bs.get(0)).toBe(1)
      expect(bs.get(1)).toBe(0)
      expect(bs.get(2)).toBe(1)
    })

    it('should create from number with custom size', () => {
      const bs = Bitset.fromNumber(3, 8)
      expect(bs.size()).toBe(8)
      expect(bs.get(0)).toBe(1)
      expect(bs.get(1)).toBe(1)
    })

    it('should throw on negative number', () => {
      expect(() => Bitset.fromNumber(-1)).toThrow('non-negative integer')
    })

    it('should throw on non-integer', () => {
      expect(() => Bitset.fromNumber(1.5)).toThrow('non-negative integer')
    })

    it('should throw on negative size', () => {
      expect(() => Bitset.fromNumber(0, -1)).toThrow(RangeError)
    })

    it('should handle zero', () => {
      const bs = Bitset.fromNumber(0, 16)
      expect(bs.isEmpty()).toBe(true)
    })
  })

  // ─── Single-bit operations ──────────────────────────────────────────
  describe('set', () => {
    it('should set a bit', () => {
      const bs = new Bitset(32)
      bs.set(5)
      expect(bs.get(5)).toBe(1)
    })

    it('should be idempotent', () => {
      const bs = new Bitset(16)
      bs.set(3)
      bs.set(3)
      expect(bs.get(3)).toBe(1)
      expect(bs.count()).toBe(1)
    })

    it('should set bits across word boundaries', () => {
      const bs = new Bitset(100)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(63)
      bs.set(64)
      expect(bs.count()).toBe(5)
    })
  })

  describe('clear', () => {
    it('should clear a set bit', () => {
      const bs = new Bitset(16)
      bs.set(7)
      bs.clear(7)
      expect(bs.get(7)).toBe(0)
    })

    it('should be idempotent on already-cleared bit', () => {
      const bs = new Bitset(16)
      bs.clear(5)
      expect(bs.get(5)).toBe(0)
      expect(bs.count()).toBe(0)
    })
  })

  describe('flip', () => {
    it('should flip 0 to 1', () => {
      const bs = new Bitset(16)
      bs.flip(3)
      expect(bs.get(3)).toBe(1)
    })

    it('should flip 1 to 0', () => {
      const bs = new Bitset(16)
      bs.set(3)
      bs.flip(3)
      expect(bs.get(3)).toBe(0)
    })

    it('should toggle correctly with double flip', () => {
      const bs = new Bitset(16)
      bs.flip(2)
      bs.flip(2)
      expect(bs.get(2)).toBe(0)
    })
  })

  describe('get', () => {
    it('should return 0 for unset bits', () => {
      const bs = new Bitset(64)
      expect(bs.get(10)).toBe(0)
    })

    it('should return 1 for set bits', () => {
      const bs = new Bitset(64)
      bs.set(10)
      expect(bs.get(10)).toBe(1)
    })

    it('should throw for out-of-range index', () => {
      const bs = new Bitset(10)
      expect(() => bs.get(10)).toThrow(RangeError)
      expect(() => bs.get(-1)).toThrow(RangeError)
    })
  })

  // ─── Range operations ───────────────────────────────────────────────
  describe('setRange', () => {
    it('should set a range within one word', () => {
      const bs = new Bitset(32)
      bs.setRange(2, 6)
      expect(bs.get(1)).toBe(0)
      expect(bs.get(2)).toBe(1)
      expect(bs.get(5)).toBe(1)
      expect(bs.get(6)).toBe(0)
      expect(bs.count()).toBe(4)
    })

    it('should set a range spanning multiple words', () => {
      const bs = new Bitset(100)
      bs.setRange(20, 50)
      for (let i = 20; i < 50; i++) {
        expect(bs.get(i)).toBe(1)
      }
      expect(bs.get(19)).toBe(0)
      expect(bs.get(50)).toBe(0)
    })

    it('should handle empty range (start === end)', () => {
      const bs = new Bitset(32)
      bs.setRange(5, 5)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should throw on invalid range', () => {
      const bs = new Bitset(10)
      expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
      expect(() => bs.setRange(5, 3)).toThrow(RangeError)
      expect(() => bs.setRange(0, 11)).toThrow(RangeError)
    })
  })

  describe('clearRange', () => {
    it('should clear a range within one word', () => {
      const bs = Bitset.fromArray([1, 1, 1, 1, 1, 1, 1, 1])
      bs.clearRange(2, 5)
      expect(bs.get(1)).toBe(1)
      expect(bs.get(2)).toBe(0)
      expect(bs.get(4)).toBe(0)
      expect(bs.get(5)).toBe(1)
    })

    it('should clear a range spanning multiple words', () => {
      const bs = new Bitset(100)
      bs.setRange(0, 100)
      bs.clearRange(20, 50)
      for (let i = 20; i < 50; i++) {
        expect(bs.get(i)).toBe(0)
      }
      expect(bs.get(19)).toBe(1)
      expect(bs.get(50)).toBe(1)
    })
  })

  describe('flipRange', () => {
    it('should flip a range within one word', () => {
      const bs = new Bitset(16)
      bs.flipRange(2, 6)
      expect(bs.get(2)).toBe(1)
      expect(bs.get(5)).toBe(1)
      expect(bs.get(6)).toBe(0)
    })

    it('should flip a range spanning multiple words', () => {
      const bs = new Bitset(100)
      bs.setRange(20, 50)
      bs.flipRange(30, 40)
      for (let i = 20; i < 30; i++) {
        expect(bs.get(i)).toBe(1)
      }
      for (let i = 30; i < 40; i++) {
        expect(bs.get(i)).toBe(0)
      }
      for (let i = 40; i < 50; i++) {
        expect(bs.get(i)).toBe(1)
      }
    })
  })

  // ─── Queries ────────────────────────────────────────────────────────
  describe('count', () => {
    it('should count set bits', () => {
      const bs = new Bitset(32)
      bs.set(0)
      bs.set(15)
      bs.set(31)
      expect(bs.count()).toBe(3)
    })

    it('should return 0 for empty bitset', () => {
      const bs = new Bitset(64)
      expect(bs.count()).toBe(0)
    })

    it('should count across word boundaries', () => {
      const bs = new Bitset(100)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(63)
      bs.set(99)
      expect(bs.count()).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty bitset', () => {
      expect(new Bitset(32).isEmpty()).toBe(true)
    })

    it('should return false after setting a bit', () => {
      const bs = new Bitset(32)
      bs.set(0)
      expect(bs.isEmpty()).toBe(false)
    })

    it('should return true after clearing all bits', () => {
      const bs = new Bitset(32)
      bs.set(5)
      bs.clear(5)
      expect(bs.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should return true when all bits are set', () => {
      const bs = new Bitset(16)
      bs.setRange(0, 16)
      expect(bs.isFull()).toBe(true)
    })

    it('should return false when some bits are not set', () => {
      const bs = new Bitset(16)
      bs.setRange(0, 15)
      expect(bs.isFull()).toBe(false)
    })

    it('should return true for empty bitset (size 0)', () => {
      expect(new Bitset(0).isFull()).toBe(true)
    })

    it('should handle full words exactly', () => {
      const bs = new Bitset(32)
      bs.setRange(0, 32)
      expect(bs.isFull()).toBe(true)
    })

    it('should handle non-word-aligned size', () => {
      const bs = new Bitset(17)
      bs.setRange(0, 17)
      expect(bs.isFull()).toBe(true)
    })
  })

  // ─── Set algebra operations ─────────────────────────────────────────
  describe('and', () => {
    it('should compute bitwise AND', () => {
      const a = Bitset.fromArray([1, 1, 0, 0])
      const b = Bitset.fromArray([1, 0, 1, 0])
      const result = a.and(b)
      expect(result.toArray()).toEqual([1, 0, 0, 0])
    })

    it('should handle different sizes', () => {
      const a = Bitset.fromArray([1, 1, 1])
      const b = Bitset.fromArray([1, 0, 1, 0, 1])
      const result = a.and(b)
      expect(result.size()).toBe(5)
      expect(result.get(0)).toBe(1)
      expect(result.get(1)).toBe(0)
      expect(result.get(2)).toBe(1)
      expect(result.get(3)).toBe(0)
    })

    it('should not modify original', () => {
      const a = Bitset.fromArray([1, 1])
      const b = Bitset.fromArray([1, 0])
      a.and(b)
      expect(a.toArray()).toEqual([1, 1])
    })
  })

  describe('or', () => {
    it('should compute bitwise OR', () => {
      const a = Bitset.fromArray([1, 0, 0, 0])
      const b = Bitset.fromArray([0, 1, 0, 0])
      const result = a.or(b)
      expect(result.toArray()).toEqual([1, 1, 0, 0])
    })

    it('should handle different sizes (carry forward extra bits)', () => {
      const a = Bitset.fromArray([1, 0, 1])
      const b = Bitset.fromArray([0, 1, 0, 1, 1])
      const result = a.or(b)
      expect(result.size()).toBe(5)
      expect(result.toArray()).toEqual([1, 1, 1, 1, 1])
    })

    it('should not modify original', () => {
      const a = Bitset.fromArray([1, 0])
      const b = Bitset.fromArray([0, 1])
      a.or(b)
      expect(a.toArray()).toEqual([1, 0])
    })
  })

  describe('xor', () => {
    it('should compute bitwise XOR', () => {
      const a = Bitset.fromArray([1, 1, 0, 0])
      const b = Bitset.fromArray([1, 0, 1, 0])
      const result = a.xor(b)
      expect(result.toArray()).toEqual([0, 1, 1, 0])
    })

    it('should handle different sizes', () => {
      const a = Bitset.fromArray([1, 0])
      const b = Bitset.fromArray([1, 0, 1, 1])
      const result = a.xor(b)
      expect(result.size()).toBe(4)
      expect(result.toArray()).toEqual([0, 0, 1, 1])
    })
  })

  describe('not', () => {
    it('should flip all bits', () => {
      const bs = Bitset.fromArray([1, 0, 1, 0])
      const result = bs.not()
      expect(result.toArray()).toEqual([0, 1, 0, 1])
    })

    it('should produce full bitset from empty (word-aligned)', () => {
      const bs = new Bitset(32)
      const result = bs.not()
      expect(result.isFull()).toBe(true)
    })

    it('should produce empty bitset from full (word-aligned)', () => {
      const bs = new Bitset(32)
      bs.setRange(0, 32)
      const result = bs.not()
      expect(result.isEmpty()).toBe(true)
    })

    it('should invert bits within logical size', () => {
      const bs = Bitset.fromArray([1, 0, 1, 0])
      const result = bs.not()
      expect(result.get(0)).toBe(0)
      expect(result.get(1)).toBe(1)
      expect(result.get(2)).toBe(0)
      expect(result.get(3)).toBe(1)
    })

    it('should not modify original', () => {
      const bs = Bitset.fromArray([1, 0, 1])
      bs.not()
      expect(bs.toArray()).toEqual([1, 0, 1])
    })
  })

  // ─── Rank and Select ────────────────────────────────────────────────
  describe('rank', () => {
    it('should count set bits before index', () => {
      const bs = Bitset.fromArray([1, 0, 1, 1, 0, 1])
      expect(bs.rank(0)).toBe(0)
      expect(bs.rank(1)).toBe(1)
      expect(bs.rank(3)).toBe(2)
      expect(bs.rank(6)).toBe(4)
    })

    it('should return 0 for index <= 0', () => {
      const bs = Bitset.fromArray([1, 1, 1])
      expect(bs.rank(0)).toBe(0)
      expect(bs.rank(-5)).toBe(0)
    })

    it('should clamp index to size', () => {
      const bs = Bitset.fromArray([1, 1, 1])
      expect(bs.rank(100)).toBe(3)
    })
  })

  describe('select', () => {
    it('should find position of k-th set bit (0-indexed)', () => {
      const bs = Bitset.fromArray([1, 0, 1, 0, 1])
      expect(bs.select(0)).toBe(0)
      expect(bs.select(1)).toBe(2)
      expect(bs.select(2)).toBe(4)
    })

    it('should return -1 for k out of range', () => {
      const bs = Bitset.fromArray([1, 0, 1])
      expect(bs.select(2)).toBe(-1)
    })

    it('should return -1 for negative k', () => {
      const bs = Bitset.fromArray([1, 1])
      expect(bs.select(-1)).toBe(-1)
    })
  })

  // ─── Navigation ─────────────────────────────────────────────────────
  describe('nextSet', () => {
    it('should find next set bit from index', () => {
      const bs = Bitset.fromArray([0, 0, 1, 0, 1])
      expect(bs.nextSet(0)).toBe(2)
      expect(bs.nextSet(2)).toBe(2)
      expect(bs.nextSet(3)).toBe(4)
    })

    it('should return -1 when no more set bits', () => {
      const bs = Bitset.fromArray([0, 0, 1])
      expect(bs.nextSet(3)).toBe(-1)
    })

    it('should return -1 for index >= size', () => {
      const bs = new Bitset(10)
      expect(bs.nextSet(10)).toBe(-1)
    })

    it('should handle negative index as 0', () => {
      const bs = Bitset.fromArray([0, 1])
      expect(bs.nextSet(-1)).toBe(1)
    })
  })

  describe('prevSet', () => {
    it('should find previous set bit from index', () => {
      const bs = Bitset.fromArray([1, 0, 1, 0, 0])
      expect(bs.prevSet(4)).toBe(2)
      expect(bs.prevSet(2)).toBe(2)
      expect(bs.prevSet(1)).toBe(0)
    })

    it('should return -1 when no previous set bit', () => {
      const bs = Bitset.fromArray([0, 0, 0, 1])
      expect(bs.prevSet(1)).toBe(-1)
    })

    it('should return -1 for negative index', () => {
      const bs = new Bitset(10)
      expect(bs.prevSet(-1)).toBe(-1)
    })

    it('should clamp to last index', () => {
      const bs = Bitset.fromArray([0, 0, 1])
      expect(bs.prevSet(100)).toBe(2)
    })
  })

  // ─── Conversions ────────────────────────────────────────────────────
  describe('toString', () => {
    it('should return binary string representation', () => {
      const bs = Bitset.fromArray([1, 0, 1, 1])
      expect(bs.toString()).toBe('1011')
    })

    it('should return all zeros for empty bitset', () => {
      const bs = new Bitset(5)
      expect(bs.toString()).toBe('00000')
    })
  })

  describe('toArray', () => {
    it('should return array of 0s and 1s', () => {
      const bs = Bitset.fromArray([1, 0, 1, 0, 1])
      expect(bs.toArray()).toEqual([1, 0, 1, 0, 1])
    })

    it('should return empty array for size 0', () => {
      const bs = new Bitset(0)
      expect(bs.toArray()).toEqual([])
    })
  })

  describe('toNumber', () => {
    it('should convert to number', () => {
      const bs = Bitset.fromNumber(13, 8)
      expect(bs.toNumber()).toBe(13)
    })

    it('should handle zero', () => {
      const bs = new Bitset(8)
      expect(bs.toNumber()).toBe(0)
    })

    it('should only use first 32 bits', () => {
      const bs = new Bitset(64)
      bs.set(0)
      bs.set(33)
      // toNumber only reads first 32 bits, bit 0 is set
      expect(bs.toNumber()).toBe(1)
    })
  })

  // ─── Clone and Equals ───────────────────────────────────────────────
  describe('clone', () => {
    it('should produce an independent copy', () => {
      const bs = Bitset.fromArray([1, 0, 1])
      const clone = bs.clone()
      expect(clone.equals(bs)).toBe(true)
      clone.clear(0)
      expect(bs.get(0)).toBe(1)
    })
  })

  describe('equals', () => {
    it('should return true for identical bitsets', () => {
      const a = Bitset.fromArray([1, 0, 1])
      const b = Bitset.fromArray([1, 0, 1])
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different sizes', () => {
      const a = new Bitset(8)
      const b = new Bitset(16)
      expect(a.equals(b)).toBe(false)
    })

    it('should return false for different bits', () => {
      const a = Bitset.fromArray([1, 0])
      const b = Bitset.fromArray([0, 1])
      expect(a.equals(b)).toBe(false)
    })
  })

  // ─── Resize ─────────────────────────────────────────────────────────
  describe('resize', () => {
    it('should grow the bitset', () => {
      const bs = new Bitset(16)
      bs.set(5)
      bs.resize(64)
      expect(bs.size()).toBe(64)
      expect(bs.get(5)).toBe(1)
    })

    it('should shrink the bitset', () => {
      const bs = new Bitset(32)
      bs.set(31)
      bs.resize(16)
      expect(bs.size()).toBe(16)
      expect(() => bs.get(31)).toThrow(RangeError)
    })

    it('should mask bits when shrinking to non-word boundary', () => {
      const bs = new Bitset(32)
      bs.setRange(0, 32)
      bs.resize(5)
      expect(bs.size()).toBe(5)
      expect(bs.count()).toBe(5)
    })

    it('should throw for negative size', () => {
      const bs = new Bitset(10)
      expect(() => bs.resize(-1)).toThrow(RangeError)
    })

    it('should handle resize to 0', () => {
      const bs = new Bitset(32)
      bs.set(5)
      bs.resize(0)
      expect(bs.size()).toBe(0)
      expect(bs.isEmpty()).toBe(true)
    })
  })

  // ─── Iterator ───────────────────────────────────────────────────────
  describe('Symbol.iterator', () => {
    it('should iterate over all bits', () => {
      const bs = Bitset.fromArray([1, 0, 1])
      const bits = [...bs]
      expect(bits).toEqual([1, 0, 1])
    })

    it('should work with for-of', () => {
      const bs = Bitset.fromArray([0, 1, 0, 1])
      const ones: number[] = []
      let i = 0
      for (const bit of bs) {
        if (bit === 1) ones.push(i)
        i++
      }
      expect(ones).toEqual([1, 3])
    })
  })

  // ─── Boundary / edge cases ──────────────────────────────────────────
  describe('boundary conditions', () => {
    it('should handle single-bit bitset', () => {
      const bs = new Bitset(1)
      expect(bs.isEmpty()).toBe(true)
      bs.set(0)
      expect(bs.get(0)).toBe(1)
      expect(bs.isFull()).toBe(true)
      bs.clear(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should handle operations on 33-bit bitset (spanning two words)', () => {
      const bs = new Bitset(33)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      expect(bs.count()).toBe(3)
      expect(bs.nextSet(0)).toBe(0)
      expect(bs.nextSet(1)).toBe(31)
      expect(bs.nextSet(32)).toBe(32)
    })

    it('should correctly validate indices on zero-size bitset', () => {
      const bs = new Bitset(0)
      expect(() => bs.get(0)).toThrow(RangeError)
      expect(() => bs.set(0)).toThrow(RangeError)
    })

    it('should handle set-clear-get roundtrip at word boundary', () => {
      const bs = new Bitset(64)
      bs.set(31)
      bs.set(32)
      expect(bs.get(31)).toBe(1)
      expect(bs.get(32)).toBe(1)
      bs.clear(31)
      expect(bs.get(31)).toBe(0)
      expect(bs.get(32)).toBe(1)
    })

    it('should handle large bitset operations', () => {
      const bs = new Bitset(1000)
      bs.setRange(0, 500)
      expect(bs.count()).toBe(500)
      const result = bs.and(bs.not())
      expect(result.isEmpty()).toBe(true)
    })

    it('should handle rank across words', () => {
      const bs = new Bitset(100)
      bs.set(0)
      bs.set(32)
      bs.set(64)
      bs.set(99)
      expect(bs.rank(1)).toBe(1)
      expect(bs.rank(33)).toBe(2)
      expect(bs.rank(65)).toBe(3)
      expect(bs.rank(100)).toBe(4)
    })

    it('should handle select across words', () => {
      const bs = new Bitset(100)
      bs.set(10)
      bs.set(50)
      bs.set(90)
      expect(bs.select(0)).toBe(10)
      expect(bs.select(1)).toBe(50)
      expect(bs.select(2)).toBe(90)
    })
  })

  // ─── Algebraic properties ───────────────────────────────────────────
  describe('set algebra properties', () => {
    it('a AND NOT(a) = empty', () => {
      const a = Bitset.fromArray([1, 0, 1, 1, 0])
      expect(a.and(a.not()).isEmpty()).toBe(true)
    })

    it('a OR NOT(a) = full (word-aligned)', () => {
      const a = Bitset.fromArray([1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0,
                                   0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1])
      expect(a.or(a.not()).isFull()).toBe(true)
    })

    it('a XOR a = empty', () => {
      const a = Bitset.fromArray([1, 0, 1, 1])
      expect(a.xor(a).isEmpty()).toBe(true)
    })

    it('a AND a = a (idempotent)', () => {
      const a = Bitset.fromArray([1, 0, 1, 0])
      expect(a.and(a).equals(a)).toBe(true)
    })

    it('a OR a = a (idempotent)', () => {
      const a = Bitset.fromArray([1, 0, 1, 0])
      expect(a.or(a).equals(a)).toBe(true)
    })

    it('NOT(NOT(a)) = a (involution)', () => {
      const a = Bitset.fromArray([1, 0, 1, 0])
      expect(a.not().not().equals(a)).toBe(true)
    })

    it('AND is commutative', () => {
      const a = Bitset.fromArray([1, 0, 1])
      const b = Bitset.fromArray([0, 1, 1])
      expect(a.and(b).equals(b.and(a))).toBe(true)
    })

    it('OR is commutative', () => {
      const a = Bitset.fromArray([1, 0, 1])
      const b = Bitset.fromArray([0, 1, 1])
      expect(a.or(b).equals(b.or(a))).toBe(true)
    })

    it('XOR is commutative', () => {
      const a = Bitset.fromArray([1, 0, 1])
      const b = Bitset.fromArray([0, 1, 1])
      expect(a.xor(b).equals(b.xor(a))).toBe(true)
    })
  })
})
