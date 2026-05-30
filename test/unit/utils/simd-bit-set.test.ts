import { describe, expect, it } from 'vitest'
import { SimdBitSet } from '../../../src/utils/simd-bit-set.js'

describe('SimdBitSet', () => {
  describe('constructor', () => {
    it('should create bitset with size 0', () => {
      const bs = new SimdBitSet(0)
      expect(bs.length).toBe(0)
    })

    it('should create bitset with size 1', () => {
      const bs = new SimdBitSet(1)
      expect(bs.length).toBe(1)
    })

    it('should create bitset with size 32', () => {
      const bs = new SimdBitSet(32)
      expect(bs.length).toBe(32)
    })

    it('should create bitset with size 33', () => {
      const bs = new SimdBitSet(33)
      expect(bs.length).toBe(33)
    })

    it('should create bitset with size 64', () => {
      const bs = new SimdBitSet(64)
      expect(bs.length).toBe(64)
    })

    it('should create bitset with size 1000', () => {
      const bs = new SimdBitSet(1000)
      expect(bs.length).toBe(1000)
    })

    it('should throw for negative size', () => {
      expect(() => new SimdBitSet(-1)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('should set bit at index 0', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      expect(bs.get(0)).toBe(true)
    })

    it('should set bit at index 31', () => {
      const bs = new SimdBitSet(32)
      bs.set(31)
      expect(bs.get(31)).toBe(true)
    })

    it('should set bit at index 32', () => {
      const bs = new SimdBitSet(64)
      bs.set(32)
      expect(bs.get(32)).toBe(true)
    })

    it('should set multiple bits', () => {
      const bs = new SimdBitSet(100)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(99)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
      expect(bs.get(99)).toBe(true)
    })

    it('should throw for negative index', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.set(-1)).toThrow(RangeError)
    })

    it('should throw for out of bounds index', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.set(32)).toThrow(RangeError)
    })
  })

  describe('clear', () => {
    it('should clear bit at index 0', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      bs.clear(0)
      expect(bs.get(0)).toBe(false)
    })

    it('should clear bit at index 31', () => {
      const bs = new SimdBitSet(32)
      bs.set(31)
      bs.clear(31)
      expect(bs.get(31)).toBe(false)
    })

    it('should clear bit at index 32', () => {
      const bs = new SimdBitSet(64)
      bs.set(32)
      bs.clear(32)
      expect(bs.get(32)).toBe(false)
    })

    it('should clear multiple bits', () => {
      const bs = new SimdBitSet(100)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(99)
      bs.clear(31)
      bs.clear(99)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(31)).toBe(false)
      expect(bs.get(32)).toBe(true)
      expect(bs.get(99)).toBe(false)
    })

    it('should throw for negative index', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.clear(-1)).toThrow(RangeError)
    })

    it('should throw for out of bounds index', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.clear(32)).toThrow(RangeError)
    })
  })

  describe('toggle', () => {
    it('should toggle bit from 0 to 1', () => {
      const bs = new SimdBitSet(32)
      bs.toggle(0)
      expect(bs.get(0)).toBe(true)
    })

    it('should toggle bit from 1 to 0', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      bs.toggle(0)
      expect(bs.get(0)).toBe(false)
    })

    it('should toggle bit across word boundary', () => {
      const bs = new SimdBitSet(64)
      bs.set(31)
      bs.toggle(31)
      expect(bs.get(31)).toBe(false)
      bs.toggle(31)
      expect(bs.get(31)).toBe(true)
    })

    it('should throw for negative index', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.toggle(-1)).toThrow(RangeError)
    })

    it('should throw for out of bounds index', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.toggle(32)).toThrow(RangeError)
    })
  })

  describe('get', () => {
    it('should return false for unset bit', () => {
      const bs = new SimdBitSet(32)
      expect(bs.get(0)).toBe(false)
    })

    it('should return true for set bit', () => {
      const bs = new SimdBitSet(32)
      bs.set(10)
      expect(bs.get(10)).toBe(true)
    })

    it('should return false for negative index', () => {
      const bs = new SimdBitSet(32)
      expect(bs.get(-1)).toBe(false)
    })

    it('should return false for out of bounds index', () => {
      const bs = new SimdBitSet(32)
      expect(bs.get(32)).toBe(false)
    })
  })

  describe('setRange', () => {
    it('should set range within single word', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(5, 10)
      for (let i = 5; i < 10; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should set range across word boundary', () => {
      const bs = new SimdBitSet(64)
      bs.setRange(30, 35)
      for (let i = 30; i < 35; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should set range at start', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(0, 5)
      for (let i = 0; i < 5; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should set range at end', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(27, 32)
      for (let i = 27; i < 32; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should throw for invalid range start', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.setRange(-1, 10)).toThrow(RangeError)
    })

    it('should throw for invalid range end', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.setRange(0, 33)).toThrow(RangeError)
    })

    it('should throw for start greater than end', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.setRange(10, 5)).toThrow(RangeError)
    })
  })

  describe('clearRange', () => {
    it('should clear range within single word', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(0, 32)
      bs.clearRange(5, 10)
      for (let i = 5; i < 10; i++) {
        expect(bs.get(i)).toBe(false)
      }
    })

    it('should clear range across word boundary', () => {
      const bs = new SimdBitSet(64)
      bs.setRange(0, 64)
      bs.clearRange(30, 35)
      for (let i = 30; i < 35; i++) {
        expect(bs.get(i)).toBe(false)
      }
    })

    it('should throw for invalid range start', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.clearRange(-1, 10)).toThrow(RangeError)
    })

    it('should throw for invalid range end', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.clearRange(0, 33)).toThrow(RangeError)
    })

    it('should throw for start greater than end', () => {
      const bs = new SimdBitSet(32)
      expect(() => bs.clearRange(10, 5)).toThrow(RangeError)
    })
  })

  describe('flipAll', () => {
    it('should flip all bits from all zeros', () => {
      const bs = new SimdBitSet(32)
      bs.flipAll()
      for (let i = 0; i < 32; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should flip all bits from all ones', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(0, 32)
      bs.flipAll()
      for (let i = 0; i < 32; i++) {
        expect(bs.get(i)).toBe(false)
      }
    })

    it('should flip all bits with some set', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      bs.set(10)
      bs.set(31)
      bs.flipAll()
      expect(bs.get(0)).toBe(false)
      expect(bs.get(10)).toBe(false)
      expect(bs.get(31)).toBe(false)
      expect(bs.get(5)).toBe(true)
    })

    it('should flip all bits across multiple words', () => {
      const bs = new SimdBitSet(100)
      bs.setRange(0, 100)
      bs.flipAll()
      for (let i = 0; i < 100; i++) {
        expect(bs.get(i)).toBe(false)
      }
    })

    it('should flip partial last word correctly', () => {
      const bs = new SimdBitSet(40)
      bs.flipAll()
      for (let i = 0; i < 40; i++) {
        expect(bs.get(i)).toBe(true)
      }
      expect(bs.get(40)).toBe(false)
    })
  })

  describe('and', () => {
    it('should compute AND of two bitsets', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs1.set(10)
      bs2.set(10)
      bs2.set(20)
      const result = bs1.and(bs2)
      expect(result.get(0)).toBe(false)
      expect(result.get(10)).toBe(true)
      expect(result.get(20)).toBe(false)
    })

    it('should compute AND of different sizes', () => {
      const bs1 = new SimdBitSet(64)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs1.set(40)
      bs2.set(0)
      bs2.set(10)
      const result = bs1.and(bs2)
      expect(result.get(0)).toBe(true)
      expect(result.get(10)).toBe(false)
      expect(result.get(40)).toBe(false)
      expect(result.length).toBe(32)
    })

    it('should compute AND with empty bitset', () => {
      const bs1 = new SimdBitSet(32)
      bs1.setRange(0, 32)
      const bs2 = new SimdBitSet(32)
      const result = bs1.and(bs2)
      expect(result.popcount()).toBe(0)
    })
  })

  describe('or', () => {
    it('should compute OR of two bitsets', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs1.set(10)
      bs2.set(10)
      bs2.set(20)
      const result = bs1.or(bs2)
      expect(result.get(0)).toBe(true)
      expect(result.get(10)).toBe(true)
      expect(result.get(20)).toBe(true)
    })

    it('should compute OR of different sizes', () => {
      const bs1 = new SimdBitSet(64)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs1.set(40)
      bs2.set(0)
      bs2.set(10)
      const result = bs1.or(bs2)
      expect(result.get(0)).toBe(true)
      expect(result.get(10)).toBe(true)
      expect(result.get(40)).toBe(true)
      expect(result.length).toBe(64)
    })

    it('should compute OR with empty bitset', () => {
      const bs1 = new SimdBitSet(32)
      bs1.setRange(0, 32)
      const bs2 = new SimdBitSet(32)
      const result = bs1.or(bs2)
      expect(result.popcount()).toBe(32)
    })
  })

  describe('xor', () => {
    it('should compute XOR of two bitsets', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs1.set(10)
      bs2.set(10)
      bs2.set(20)
      const result = bs1.xor(bs2)
      expect(result.get(0)).toBe(true)
      expect(result.get(10)).toBe(false)
      expect(result.get(20)).toBe(true)
    })

    it('should compute XOR of different sizes', () => {
      const bs1 = new SimdBitSet(64)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs2.set(0)
      bs2.set(10)
      const result = bs1.xor(bs2)
      expect(result.get(0)).toBe(false)
      expect(result.get(10)).toBe(true)
      expect(result.length).toBe(64)
    })
  })

  describe('not', () => {
    it('should compute NOT of bitset', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      bs.set(10)
      const result = bs.not()
      expect(result.get(0)).toBe(false)
      expect(result.get(10)).toBe(false)
      expect(result.get(5)).toBe(true)
    })

    it('should not modify original bitset', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      const result = bs.not()
      expect(bs.get(0)).toBe(true)
      expect(result.get(0)).toBe(false)
    })
  })

  describe('popcount', () => {
    it('should return 0 for empty bitset', () => {
      const bs = new SimdBitSet(32)
      expect(bs.popcount()).toBe(0)
    })

    it('should return 32 for full bitset', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(0, 32)
      expect(bs.popcount()).toBe(32)
    })

    it('should count bits correctly for alternating pattern', () => {
      const bs = new SimdBitSet(32)
      for (let i = 0; i < 32; i += 2) {
        bs.set(i)
      }
      expect(bs.popcount()).toBe(16)
    })

    it('should count bits across multiple words', () => {
      const bs = new SimdBitSet(100)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(99)
      expect(bs.popcount()).toBe(4)
    })
  })

  describe('nextSetBit', () => {
    it('should return first set bit from start', () => {
      const bs = new SimdBitSet(32)
      bs.set(5)
      expect(bs.nextSetBit(0)).toBe(5)
    })

    it('should return next set bit after given index', () => {
      const bs = new SimdBitSet(32)
      bs.set(5)
      bs.set(10)
      expect(bs.nextSetBit(6)).toBe(10)
    })

    it('should return -1 when no bits set', () => {
      const bs = new SimdBitSet(32)
      expect(bs.nextSetBit(0)).toBe(-1)
    })

    it('should return -1 when no more bits set after start', () => {
      const bs = new SimdBitSet(32)
      bs.set(5)
      expect(bs.nextSetBit(6)).toBe(-1)
    })

    it('should return -1 when start >= length', () => {
      const bs = new SimdBitSet(32)
      bs.set(31)
      expect(bs.nextSetBit(32)).toBe(-1)
    })

    it('should find bit at word boundary', () => {
      const bs = new SimdBitSet(64)
      bs.set(31)
      bs.set(32)
      expect(bs.nextSetBit(0)).toBe(31)
      expect(bs.nextSetBit(32)).toBe(32)
    })
  })

  describe('nextClearBit', () => {
    it('should return first clear bit from start', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      bs.set(1)
      bs.set(2)
      bs.set(3)
      expect(bs.nextClearBit(0)).toBe(4)
    })

    it('should return next clear bit after given index', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(0, 10)
      expect(bs.nextClearBit(5)).toBe(10)
    })

    it('should return 0 when first bit is clear', () => {
      const bs = new SimdBitSet(32)
      expect(bs.nextClearBit(0)).toBe(0)
    })

    it('should return length when all bits set', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(0, 32)
      expect(bs.nextClearBit(0)).toBe(32)
    })

    it('should return length when start >= length', () => {
      const bs = new SimdBitSet(32)
      expect(bs.nextClearBit(32)).toBe(32)
    })

    it('should find clear bit at word boundary', () => {
      const bs = new SimdBitSet(64)
      bs.setRange(0, 31)
      expect(bs.nextClearBit(0)).toBe(31)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty bitset', () => {
      const bs = new SimdBitSet(32)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should return false for bitset with bits set', () => {
      const bs = new SimdBitSet(32)
      bs.set(0)
      expect(bs.isEmpty()).toBe(false)
    })

    it('should return true for size 0', () => {
      const bs = new SimdBitSet(0)
      expect(bs.isEmpty()).toBe(true)
    })
  })

  describe('intersects', () => {
    it('should return true when bitsets intersect', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(10)
      bs2.set(10)
      expect(bs1.intersects(bs2)).toBe(true)
    })

    it('should return false when bitsets do not intersect', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs2.set(31)
      expect(bs1.intersects(bs2)).toBe(false)
    })

    it('should handle different sizes', () => {
      const bs1 = new SimdBitSet(64)
      const bs2 = new SimdBitSet(32)
      bs1.set(10)
      bs2.set(10)
      expect(bs1.intersects(bs2)).toBe(true)
    })
  })

  describe('isSubsetOf', () => {
    it('should return true when bitset is subset', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(10)
      bs2.set(10)
      bs2.set(20)
      expect(bs1.isSubsetOf(bs2)).toBe(true)
    })

    it('should return false when bitset is not subset', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(10)
      bs1.set(15)
      bs2.set(10)
      expect(bs1.isSubsetOf(bs2)).toBe(false)
    })

    it('should return true for empty bitset', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      expect(bs1.isSubsetOf(bs2)).toBe(true)
    })

    it('should handle different sizes', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(64)
      bs1.set(10)
      bs2.set(10)
      expect(bs1.isSubsetOf(bs2)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const bs1 = new SimdBitSet(32)
      bs1.set(0)
      bs1.set(10)
      const bs2 = bs1.clone()
      expect(bs2.get(0)).toBe(true)
      expect(bs2.get(10)).toBe(true)
    })

    it('should not modify original when clone is modified', () => {
      const bs1 = new SimdBitSet(32)
      bs1.set(0)
      const bs2 = bs1.clone()
      bs2.set(1)
      expect(bs1.get(1)).toBe(false)
      expect(bs2.get(1)).toBe(true)
    })

    it('should clone bitset with size 0', () => {
      const bs1 = new SimdBitSet(0)
      const bs2 = bs1.clone()
      expect(bs2.length).toBe(0)
    })
  })

  describe('reset', () => {
    it('should clear all bits', () => {
      const bs = new SimdBitSet(32)
      bs.setRange(0, 32)
      bs.reset()
      expect(bs.popcount()).toBe(0)
    })

    it('should reset bitset with size 0', () => {
      const bs = new SimdBitSet(0)
      bs.reset()
      expect(bs.isEmpty()).toBe(true)
    })

    it('should handle multiple words', () => {
      const bs = new SimdBitSet(100)
      bs.setRange(0, 100)
      bs.reset()
      expect(bs.isEmpty()).toBe(true)
    })
  })

  describe('length', () => {
    it('should return correct length for size 0', () => {
      const bs = new SimdBitSet(0)
      expect(bs.length).toBe(0)
    })

    it('should return correct length for size 32', () => {
      const bs = new SimdBitSet(32)
      expect(bs.length).toBe(32)
    })

    it('should return correct length for size 1000', () => {
      const bs = new SimdBitSet(1000)
      expect(bs.length).toBe(1000)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty bitset', () => {
      const bs = new SimdBitSet(32)
      expect(bs.toArray()).toEqual([])
    })

    it('should return array of set bits', () => {
      const bs = new SimdBitSet(32)
      bs.set(5)
      bs.set(10)
      bs.set(15)
      expect(bs.toArray()).toEqual([5, 10, 15])
    })

    it('should return array for large bitset', () => {
      const bs = new SimdBitSet(100)
      bs.set(0)
      bs.set(99)
      expect(bs.toArray()).toEqual([0, 99])
    })
  })

  describe('toString', () => {
    it('should return empty string for size 0', () => {
      const bs = new SimdBitSet(0)
      expect(bs.toString()).toBe('')
    })

    it('should return string representation', () => {
      const bs = new SimdBitSet(8)
      bs.set(0)
      bs.set(2)
      bs.set(7)
      expect(bs.toString()).toBe('10100001')
    })

    it('should return all zeros for empty bitset', () => {
      const bs = new SimdBitSet(8)
      expect(bs.toString()).toBe('00000000')
    })

    it('should return all ones for full bitset', () => {
      const bs = new SimdBitSet(8)
      bs.setRange(0, 8)
      expect(bs.toString()).toBe('11111111')
    })
  })

  describe('fromArray', () => {
    it('should create bitset from array', () => {
      const bs = SimdBitSet.fromArray([0, 5, 10], 32)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(10)).toBe(true)
      expect(bs.get(15)).toBe(false)
    })

    it('should handle empty array', () => {
      const bs = SimdBitSet.fromArray([], 32)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should ignore indices beyond size', () => {
      const bs = SimdBitSet.fromArray([0, 5, 100], 32)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(100)).toBe(false)
    })
  })

  describe('fromString', () => {
    it('should create bitset from string', () => {
      const bs = SimdBitSet.fromString('10100001')
      expect(bs.length).toBe(8)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(2)).toBe(true)
      expect(bs.get(7)).toBe(true)
    })

    it('should handle empty string', () => {
      const bs = SimdBitSet.fromString('')
      expect(bs.length).toBe(0)
    })

    it('should handle all zeros', () => {
      const bs = SimdBitSet.fromString('0000')
      expect(bs.length).toBe(4)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should handle all ones', () => {
      const bs = SimdBitSet.fromString('1111')
      expect(bs.length).toBe(4)
      expect(bs.popcount()).toBe(4)
    })
  })

  describe('equals', () => {
    it('should return true for equal bitsets', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs1.set(10)
      bs2.set(0)
      bs2.set(10)
      expect(bs1.equals(bs2)).toBe(true)
    })

    it('should return false for different sizes', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(64)
      expect(bs1.equals(bs2)).toBe(false)
    })

    it('should return false for different bits', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      bs1.set(0)
      bs2.set(1)
      expect(bs1.equals(bs2)).toBe(false)
    })

    it('should return true for both empty', () => {
      const bs1 = new SimdBitSet(32)
      const bs2 = new SimdBitSet(32)
      expect(bs1.equals(bs2)).toBe(true)
    })

    it('should return true for size 0', () => {
      const bs1 = new SimdBitSet(0)
      const bs2 = new SimdBitSet(0)
      expect(bs1.equals(bs2)).toBe(true)
    })
  })
})