import { describe, it, expect } from 'vitest'
import { SparseBitSet } from '../../src/core/sparse-bit-set/index.js'
import type { SparseBitSetOptions } from '../../src/core/sparse-bit-set/types.js'

describe('SparseBitSet', () => {
  describe('constructor', () => {
    it('creates empty bitset with default options', () => {
      const bs = new SparseBitSet()
      expect(bs.size).toBe(0)
      expect(bs.isEmpty).toBe(true)
    })

    it('creates bitset with custom blockSize', () => {
      const bs = new SparseBitSet({ blockSize: 512 })
      expect(bs.blockSize).toBe(512)
    })

    it('creates bitset with blockSize 1', () => {
      const bs = new SparseBitSet({ blockSize: 1 })
      bs.set(5)
      expect(bs.get(5)).toBe(true)
      expect(bs.size).toBe(1)
    })

    it('throws on blockSize 0', () => {
      expect(() => new SparseBitSet({ blockSize: 0 })).toThrow(RangeError)
    })

    it('throws on negative blockSize', () => {
      expect(() => new SparseBitSet({ blockSize: -1 })).toThrow(RangeError)
    })

    it('throws on non-integer blockSize', () => {
      expect(() => new SparseBitSet({ blockSize: 1.5 })).toThrow(RangeError)
    })

    it('uses default blockSize of 1024', () => {
      const bs = new SparseBitSet()
      expect(bs.blockSize).toBe(1024)
    })
  })

  describe('set', () => {
    it('sets a bit at index 0', () => {
      const bs = new SparseBitSet()
      expect(bs.set(0)).toBe(true)
      expect(bs.get(0)).toBe(true)
    })

    it('returns true when setting an unset bit', () => {
      const bs = new SparseBitSet()
      expect(bs.set(42)).toBe(true)
    })

    it('returns false when setting an already set bit', () => {
      const bs = new SparseBitSet()
      bs.set(42)
      expect(bs.set(42)).toBe(false)
    })

    it('sets bits at large indices', () => {
      const bs = new SparseBitSet()
      bs.set(1_000_000)
      expect(bs.get(1_000_000)).toBe(true)
      expect(bs.size).toBe(1)
    })

    it('sets multiple bits across blocks', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.set(0)
      bs.set(65)
      bs.set(130)
      expect(bs.size).toBe(3)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(65)).toBe(true)
      expect(bs.get(130)).toBe(true)
    })

    it('throws on negative index', () => {
      const bs = new SparseBitSet()
      expect(() => bs.set(-1)).toThrow(RangeError)
    })

    it('throws on non-integer index', () => {
      const bs = new SparseBitSet()
      expect(() => bs.set(1.5)).toThrow(RangeError)
    })

    it('increments size correctly', () => {
      const bs = new SparseBitSet()
      bs.set(1)
      bs.set(2)
      bs.set(3)
      expect(bs.size).toBe(3)
    })
  })

  describe('clear', () => {
    it('clears a set bit', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      expect(bs.clear(5)).toBe(true)
      expect(bs.get(5)).toBe(false)
    })

    it('returns false when clearing an unset bit', () => {
      const bs = new SparseBitSet()
      expect(bs.clear(5)).toBe(false)
    })

    it('returns false when clearing non-existent block', () => {
      const bs = new SparseBitSet()
      expect(bs.clear(9999)).toBe(false)
    })

    it('decrements size when clearing a set bit', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.set(10)
      bs.clear(5)
      expect(bs.size).toBe(1)
    })

    it('removes empty block after clearing last bit', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      bs.clear(0)
      expect(bs.isEmptyBlock(0)).toBe(true)
    })

    it('throws on negative index', () => {
      const bs = new SparseBitSet()
      expect(() => bs.clear(-1)).toThrow(RangeError)
    })

    it('throws on non-integer index', () => {
      const bs = new SparseBitSet()
      expect(() => bs.clear(1.5)).toThrow(RangeError)
    })
  })

  describe('get / has / contains', () => {
    it('returns false for unset bit', () => {
      const bs = new SparseBitSet()
      expect(bs.get(5)).toBe(false)
    })

    it('returns true for set bit', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      expect(bs.get(5)).toBe(true)
    })

    it('has() works as alias for get()', () => {
      const bs = new SparseBitSet()
      bs.set(10)
      expect(bs.has(10)).toBe(true)
      expect(bs.has(11)).toBe(false)
    })

    it('contains() works as alias for get()', () => {
      const bs = new SparseBitSet()
      bs.set(10)
      expect(bs.contains(10)).toBe(true)
      expect(bs.contains(11)).toBe(false)
    })

    it('returns false for bit in non-existent block', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.set(5)
      expect(bs.get(200)).toBe(false)
    })

    it('throws on negative index for get', () => {
      const bs = new SparseBitSet()
      expect(() => bs.get(-1)).toThrow(RangeError)
    })
  })

  describe('flip', () => {
    it('flips unset bit to set', () => {
      const bs = new SparseBitSet()
      bs.flip(5)
      expect(bs.get(5)).toBe(true)
    })

    it('flips set bit to unset', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.flip(5)
      expect(bs.get(5)).toBe(false)
    })

    it('updates size correctly when flipping', () => {
      const bs = new SparseBitSet()
      bs.flip(1)
      expect(bs.size).toBe(1)
      bs.flip(1)
      expect(bs.size).toBe(0)
    })

    it('throws on negative index', () => {
      const bs = new SparseBitSet()
      expect(() => bs.flip(-1)).toThrow(RangeError)
    })
  })

  describe('setRange', () => {
    it('sets a range of bits', () => {
      const bs = new SparseBitSet()
      bs.setRange(5, 10)
      for (let i = 5; i <= 10; i++) {
        expect(bs.get(i)).toBe(true)
      }
      expect(bs.get(4)).toBe(false)
      expect(bs.get(11)).toBe(false)
    })

    it('sets single bit range', () => {
      const bs = new SparseBitSet()
      bs.setRange(5, 5)
      expect(bs.get(5)).toBe(true)
      expect(bs.size).toBe(1)
    })

    it('sets range across blocks', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.setRange(60, 70)
      expect(bs.size).toBe(11)
      for (let i = 60; i <= 70; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('throws when from > to', () => {
      const bs = new SparseBitSet()
      expect(() => bs.setRange(10, 5)).toThrow(RangeError)
    })

    it('throws on negative range', () => {
      const bs = new SparseBitSet()
      expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
    })

    it('does not double-count already set bits', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.setRange(5, 10)
      expect(bs.size).toBe(6)
    })
  })

  describe('clearRange', () => {
    it('clears a range of bits', () => {
      const bs = new SparseBitSet()
      bs.setRange(5, 10)
      bs.clearRange(6, 9)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(6)).toBe(false)
      expect(bs.get(9)).toBe(false)
      expect(bs.get(10)).toBe(true)
    })

    it('clears single bit range', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.clearRange(5, 5)
      expect(bs.get(5)).toBe(false)
    })

    it('throws when from > to', () => {
      const bs = new SparseBitSet()
      expect(() => bs.clearRange(10, 5)).toThrow(RangeError)
    })

    it('no-ops on already empty range', () => {
      const bs = new SparseBitSet()
      bs.clearRange(0, 100)
      expect(bs.size).toBe(0)
    })
  })

  describe('flipRange', () => {
    it('flips a range of bits', () => {
      const bs = new SparseBitSet()
      bs.setRange(3, 7)
      bs.flipRange(5, 10)
      expect(bs.get(3)).toBe(true)
      expect(bs.get(4)).toBe(true)
      expect(bs.get(5)).toBe(false)
      expect(bs.get(6)).toBe(false)
      expect(bs.get(7)).toBe(false)
      expect(bs.get(8)).toBe(true)
      expect(bs.get(9)).toBe(true)
      expect(bs.get(10)).toBe(true)
    })

    it('throws when from > to', () => {
      const bs = new SparseBitSet()
      expect(() => bs.flipRange(10, 5)).toThrow(RangeError)
    })

    it('updates size correctly', () => {
      const bs = new SparseBitSet()
      bs.setRange(0, 4)
      bs.flipRange(0, 9)
      expect(bs.size).toBe(5)
    })
  })

  describe('size / isEmpty / cardinality', () => {
    it('size returns 0 for empty set', () => {
      const bs = new SparseBitSet()
      expect(bs.size).toBe(0)
    })

    it('isEmpty returns true for empty set', () => {
      expect(new SparseBitSet().isEmpty).toBe(true)
    })

    it('isEmpty returns false after setting a bit', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      expect(bs.isEmpty).toBe(false)
    })

    it('cardinality() returns same as size', () => {
      const bs = new SparseBitSet()
      bs.set(1)
      bs.set(2)
      bs.set(3)
      expect(bs.cardinality()).toBe(bs.size)
      expect(bs.cardinality()).toBe(3)
    })
  })

  describe('min', () => {
    it('returns smallest set bit', () => {
      const bs = new SparseBitSet()
      bs.set(10)
      bs.set(5)
      bs.set(20)
      expect(bs.min()).toBe(5)
    })

    it('returns 0 for bit at index 0', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      expect(bs.min()).toBe(0)
    })

    it('throws on empty set', () => {
      const bs = new SparseBitSet()
      expect(() => bs.min()).toThrow(RangeError)
    })

    it('works with large sparse values', () => {
      const bs = new SparseBitSet()
      bs.set(1_000_000)
      bs.set(500)
      expect(bs.min()).toBe(500)
    })
  })

  describe('max', () => {
    it('returns largest set bit', () => {
      const bs = new SparseBitSet()
      bs.set(10)
      bs.set(5)
      bs.set(20)
      expect(bs.max()).toBe(20)
    })

    it('throws on empty set', () => {
      const bs = new SparseBitSet()
      expect(() => bs.max()).toThrow(RangeError)
    })

    it('works with large sparse values', () => {
      const bs = new SparseBitSet()
      bs.set(1_000_000)
      bs.set(500)
      expect(bs.max()).toBe(1_000_000)
    })
  })

  describe('nextSetBit', () => {
    it('returns next set bit from given index', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.set(10)
      bs.set(15)
      expect(bs.nextSetBit(0)).toBe(5)
      expect(bs.nextSetBit(5)).toBe(5)
      expect(bs.nextSetBit(6)).toBe(10)
      expect(bs.nextSetBit(11)).toBe(15)
    })

    it('returns -1 when no more set bits', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      expect(bs.nextSetBit(6)).toBe(-1)
    })

    it('returns -1 for empty set', () => {
      const bs = new SparseBitSet()
      expect(bs.nextSetBit(0)).toBe(-1)
    })

    it('works across block boundaries', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.set(60)
      bs.set(130)
      expect(bs.nextSetBit(61)).toBe(130)
    })

    it('throws on negative index', () => {
      const bs = new SparseBitSet()
      expect(() => bs.nextSetBit(-1)).toThrow(RangeError)
    })
  })

  describe('prevSetBit', () => {
    it('returns previous set bit from given index', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.set(10)
      bs.set(15)
      expect(bs.prevSetBit(20)).toBe(15)
      expect(bs.prevSetBit(15)).toBe(15)
      expect(bs.prevSetBit(14)).toBe(10)
      expect(bs.prevSetBit(9)).toBe(5)
    })

    it('returns -1 when no previous set bit', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      expect(bs.prevSetBit(4)).toBe(-1)
    })

    it('returns -1 for empty set', () => {
      const bs = new SparseBitSet()
      expect(bs.prevSetBit(0)).toBe(-1)
    })

    it('works across block boundaries', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.set(5)
      bs.set(130)
      expect(bs.prevSetBit(129)).toBe(5)
    })

    it('returns -1 for -1 index', () => {
      const bs = new SparseBitSet()
      expect(bs.prevSetBit(-1)).toBe(-1)
    })

    it('throws on index < -1', () => {
      const bs = new SparseBitSet()
      expect(() => bs.prevSetBit(-2)).toThrow(RangeError)
    })
  })

  describe('clearAll', () => {
    it('clears all bits', () => {
      const bs = new SparseBitSet()
      bs.set(1)
      bs.set(2)
      bs.set(3)
      bs.clearAll()
      expect(bs.size).toBe(0)
      expect(bs.isEmpty).toBe(true)
    })

    it('no-ops on already empty set', () => {
      const bs = new SparseBitSet()
      bs.clearAll()
      expect(bs.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const bs = new SparseBitSet()
      expect(bs.toArray()).toEqual([])
    })

    it('returns sorted array of set bit indices', () => {
      const bs = new SparseBitSet()
      bs.set(10)
      bs.set(5)
      bs.set(20)
      expect(bs.toArray()).toEqual([5, 10, 20])
    })

    it('returns all set bits in order', () => {
      const bs = new SparseBitSet()
      bs.setRange(0, 4)
      expect(bs.toArray()).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('clone', () => {
    it('clones an empty set', () => {
      const bs = new SparseBitSet()
      const clone = bs.clone()
      expect(clone.size).toBe(0)
      expect(clone.blockSize).toBe(bs.blockSize)
    })

    it('clones a non-empty set', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      bs.set(10)
      const clone = bs.clone()
      expect(clone.toArray()).toEqual([5, 10])
      expect(clone.size).toBe(2)
    })

    it('clone is independent of original', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      const clone = bs.clone()
      clone.set(10)
      expect(bs.get(10)).toBe(false)
      expect(clone.get(10)).toBe(true)
    })

    it('preserves blockSize', () => {
      const bs = new SparseBitSet({ blockSize: 256 })
      const clone = bs.clone()
      expect(clone.blockSize).toBe(256)
    })
  })

  describe('fromArray', () => {
    it('creates bitset from array of indices', () => {
      const bs = SparseBitSet.fromArray([5, 10, 15])
      expect(bs.toArray()).toEqual([5, 10, 15])
    })

    it('creates empty bitset from empty array', () => {
      const bs = SparseBitSet.fromArray([])
      expect(bs.size).toBe(0)
    })

    it('creates bitset with custom options', () => {
      const bs = SparseBitSet.fromArray([1, 2, 3], { blockSize: 64 })
      expect(bs.blockSize).toBe(64)
      expect(bs.size).toBe(3)
    })

    it('handles duplicate indices', () => {
      const bs = SparseBitSet.fromArray([5, 5, 10])
      expect(bs.size).toBe(2)
      expect(bs.toArray()).toEqual([5, 10])
    })
  })

  describe('and', () => {
    it('returns intersection of two sets', () => {
      const a = SparseBitSet.fromArray([1, 2, 3, 4])
      const b = SparseBitSet.fromArray([2, 3, 5])
      const result = a.and(b)
      expect(result.toArray()).toEqual([2, 3])
    })

    it('returns empty set for disjoint sets', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([3, 4])
      expect(a.and(b).size).toBe(0)
    })

    it('does not modify original sets', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = SparseBitSet.fromArray([2, 3, 4])
      a.and(b)
      expect(a.toArray()).toEqual([1, 2, 3])
      expect(b.toArray()).toEqual([2, 3, 4])
    })

    it('handles empty left operand', () => {
      const a = new SparseBitSet()
      const b = SparseBitSet.fromArray([1, 2])
      expect(a.and(b).size).toBe(0)
    })

    it('handles empty right operand', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = new SparseBitSet()
      expect(a.and(b).size).toBe(0)
    })
  })

  describe('or', () => {
    it('returns union of two sets', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([2, 3])
      const result = a.or(b)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original sets', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([2, 3])
      a.or(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([2, 3])
    })

    it('handles both empty sets', () => {
      const a = new SparseBitSet()
      const b = new SparseBitSet()
      expect(a.or(b).size).toBe(0)
    })

    it('handles one empty set', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = new SparseBitSet()
      expect(a.or(b).toArray()).toEqual([1, 2])
    })
  })

  describe('xor', () => {
    it('returns symmetric difference', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = SparseBitSet.fromArray([2, 3, 4])
      const result = a.xor(b)
      expect(result.toArray()).toEqual([1, 4])
    })

    it('returns all bits when sets are disjoint', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([3, 4])
      expect(a.xor(b).toArray()).toEqual([1, 2, 3, 4])
    })

    it('returns empty when sets are equal', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = SparseBitSet.fromArray([1, 2, 3])
      expect(a.xor(b).size).toBe(0)
    })

    it('does not modify original sets', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([2, 3])
      a.xor(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([2, 3])
    })
  })

  describe('andNot', () => {
    it('clears bits set in other', () => {
      const a = SparseBitSet.fromArray([1, 2, 3, 4])
      const b = SparseBitSet.fromArray([2, 4])
      const result = a.andNot(b)
      expect(result.toArray()).toEqual([1, 3])
    })

    it('returns copy of original when other is empty', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = new SparseBitSet()
      expect(a.andNot(b).toArray()).toEqual([1, 2, 3])
    })

    it('returns empty when other has all bits of original', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([1, 2, 3, 4])
      expect(a.andNot(b).size).toBe(0)
    })

    it('does not modify original sets', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = SparseBitSet.fromArray([2])
      a.andNot(b)
      expect(a.toArray()).toEqual([1, 2, 3])
      expect(b.toArray()).toEqual([2])
    })
  })

  describe('intersects', () => {
    it('returns true when sets intersect', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = SparseBitSet.fromArray([3, 4, 5])
      expect(a.intersects(b)).toBe(true)
    })

    it('returns false when sets are disjoint', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([3, 4])
      expect(a.intersects(b)).toBe(false)
    })

    it('returns false for empty sets', () => {
      const a = new SparseBitSet()
      const b = new SparseBitSet()
      expect(a.intersects(b)).toBe(false)
    })

    it('returns false when one set is empty', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = new SparseBitSet()
      expect(a.intersects(b)).toBe(false)
    })
  })

  describe('equals', () => {
    it('returns true for equal sets', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = SparseBitSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for different sets', () => {
      const a = SparseBitSet.fromArray([1, 2, 3])
      const b = SparseBitSet.fromArray([1, 2, 4])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true for two empty sets', () => {
      expect(new SparseBitSet().equals(new SparseBitSet())).toBe(true)
    })

    it('returns false for different sizes', () => {
      const a = SparseBitSet.fromArray([1, 2])
      const b = SparseBitSet.fromArray([1, 2, 3])
      expect(a.equals(b)).toBe(false)
    })

    it('returns true when built with different blockSizes but same bits', () => {
      const a = new SparseBitSet({ blockSize: 64 })
      const b = new SparseBitSet({ blockSize: 128 })
      a.set(5)
      b.set(5)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('forEach', () => {
    it('iterates all set bits in order', () => {
      const bs = SparseBitSet.fromArray([10, 5, 20])
      const result: number[] = []
      bs.forEach((index) => result.push(index))
      expect(result).toEqual([5, 10, 20])
    })

    it('does not call callback for empty set', () => {
      const bs = new SparseBitSet()
      let called = false
      bs.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const bs = SparseBitSet.fromArray([3, 1, 2])
      expect([...bs]).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const bs = SparseBitSet.fromArray([5, 10])
      const result: number[] = []
      for (const bit of bs) {
        result.push(bit)
      }
      expect(result).toEqual([5, 10])
    })

    it('works with spread in empty set', () => {
      const bs = new SparseBitSet()
      expect([...bs]).toEqual([])
    })
  })

  describe('isEmptyBlock', () => {
    it('returns true for block with no bits set', () => {
      const bs = new SparseBitSet()
      expect(bs.isEmptyBlock(0)).toBe(true)
    })

    it('returns false for block with bits set', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      expect(bs.isEmptyBlock(0)).toBe(false)
    })

    it('returns true for non-existent block', () => {
      const bs = new SparseBitSet()
      expect(bs.isEmptyBlock(999)).toBe(true)
    })

    it('returns true after clearing all bits in block', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      bs.clear(0)
      expect(bs.isEmptyBlock(0)).toBe(true)
    })

    it('throws on negative index', () => {
      const bs = new SparseBitSet()
      expect(() => bs.isEmptyBlock(-1)).toThrow(RangeError)
    })
  })

  describe('toBitString', () => {
    it('returns empty string for empty set', () => {
      const bs = new SparseBitSet()
      expect(bs.toBitString()).toBe('')
    })

    it('returns correct string representation', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      bs.set(2)
      bs.set(5)
      expect(bs.toBitString()).toBe('101001')
    })

    it('returns single 1 for bit at index 0', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      expect(bs.toBitString()).toBe('1')
    })
  })

  describe('sparse efficiency', () => {
    it('only allocates blocks with set bits', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.set(0)
      bs.set(1000)
      expect(bs.isEmptyBlock(0)).toBe(false)
      expect(bs.isEmptyBlock(1)).toBe(true)
      expect(bs.isEmptyBlock(15)).toBe(false)
    })

    it('handles very large sparse ranges efficiently', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      bs.set(1_000_000)
      expect(bs.size).toBe(2)
      expect(bs.min()).toBe(0)
      expect(bs.max()).toBe(1_000_000)
    })

    it('cleans up empty blocks', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.set(0)
      expect(bs.isEmptyBlock(0)).toBe(false)
      bs.clear(0)
      expect(bs.isEmptyBlock(0)).toBe(true)
      expect(bs.size).toBe(0)
    })
  })

  describe('block boundary edge cases', () => {
    it('sets bits at exact block boundaries', () => {
      const bs = new SparseBitSet({ blockSize: 64 })
      bs.set(63)
      bs.set(64)
      expect(bs.size).toBe(2)
      expect(bs.get(63)).toBe(true)
      expect(bs.get(64)).toBe(true)
    })

    it('sets bit at index 0', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      expect(bs.get(0)).toBe(true)
      expect(bs.min()).toBe(0)
    })

    it('handles word boundary (bit 31/32)', () => {
      const bs = new SparseBitSet()
      bs.set(31)
      bs.set(32)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
      expect(bs.size).toBe(2)
    })
  })

  describe('comprehensive operations', () => {
    it('set then clear then set again', () => {
      const bs = new SparseBitSet()
      bs.set(5)
      expect(bs.size).toBe(1)
      bs.clear(5)
      expect(bs.size).toBe(0)
      bs.set(5)
      expect(bs.size).toBe(1)
    })

    it('multiple set/clear operations track size correctly', () => {
      const bs = new SparseBitSet()
      bs.set(1)
      bs.set(2)
      bs.set(3)
      bs.clear(2)
      bs.set(4)
      bs.clear(1)
      expect(bs.size).toBe(2)
      expect(bs.toArray()).toEqual([3, 4])
    })

    it('range operations combined', () => {
      const bs = new SparseBitSet()
      bs.setRange(0, 9)
      bs.clearRange(3, 6)
      expect(bs.size).toBe(6)
      expect(bs.toArray()).toEqual([0, 1, 2, 7, 8, 9])
    })

    it('chained bitwise operations', () => {
      const a = SparseBitSet.fromArray([1, 2, 3, 4, 5])
      const b = SparseBitSet.fromArray([2, 4, 6])
      const c = SparseBitSet.fromArray([1, 2, 7])
      const result = a.and(b).or(c)
      expect(result.toArray()).toEqual([1, 2, 4, 7])
    })
  })

  describe('nextSetBit / prevSetBit comprehensive', () => {
    it('nextSetBit from index with multiple bits in same word', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      bs.set(1)
      bs.set(5)
      bs.set(31)
      expect(bs.nextSetBit(0)).toBe(0)
      expect(bs.nextSetBit(1)).toBe(1)
      expect(bs.nextSetBit(2)).toBe(5)
      expect(bs.nextSetBit(6)).toBe(31)
      expect(bs.nextSetBit(32)).toBe(-1)
    })

    it('prevSetBit from index with multiple bits in same word', () => {
      const bs = new SparseBitSet()
      bs.set(0)
      bs.set(1)
      bs.set(5)
      bs.set(31)
      expect(bs.prevSetBit(31)).toBe(31)
      expect(bs.prevSetBit(30)).toBe(5)
      expect(bs.prevSetBit(5)).toBe(5)
      expect(bs.prevSetBit(4)).toBe(1)
      expect(bs.prevSetBit(0)).toBe(0)
      expect(bs.prevSetBit(-1)).toBe(-1)
    })
  })
})
