import { describe, it, expect, beforeEach } from 'vitest'
import { DynamicBitset } from '../../src/core/dynamic-bitset/dynamic-bitset.js'
import type { DynamicBitsetOptions } from '../../src/core/dynamic-bitset/types.js'

describe('DynamicBitset', () => {
  let bs: DynamicBitset

  beforeEach(() => {
    bs = new DynamicBitset()
  })

  describe('constructor', () => {
    it('should create empty bitset with no arguments', () => {
      const b = new DynamicBitset()
      expect(b.size).toBe(0)
      expect(b.capacity).toBe(32)
    })

    it('should create bitset with undefined initial capacity', () => {
      const b = new DynamicBitset(undefined)
      expect(b.size).toBe(0)
    })

    it('should create bitset with initial capacity 0', () => {
      const b = new DynamicBitset(0)
      expect(b.size).toBe(0)
      expect(b.capacity).toBe(32)
    })

    it('should create bitset with small initial capacity', () => {
      const b = new DynamicBitset(10)
      expect(b.size).toBe(0)
      expect(b.capacity).toBeGreaterThanOrEqual(10)
    })

    it('should create bitset with large initial capacity', () => {
      const b = new DynamicBitset(1000)
      expect(b.size).toBe(0)
      expect(b.capacity).toBeGreaterThanOrEqual(1000)
    })

    it('should create bitset with capacity exactly 32', () => {
      const b = new DynamicBitset(32)
      expect(b.capacity).toBe(32)
    })

    it('should create bitset with capacity just over 32', () => {
      const b = new DynamicBitset(33)
      expect(b.capacity).toBeGreaterThanOrEqual(33)
    })
  })

  describe('set', () => {
    it('should set bit at index 0', () => {
      bs.set(0)
      expect(bs.get(0)).toBe(true)
    })

    it('should set bit at index 1', () => {
      bs.set(1)
      expect(bs.get(1)).toBe(true)
    })

    it('should set bit at index 31 (last bit of first word)', () => {
      bs.set(31)
      expect(bs.get(31)).toBe(true)
    })

    it('should set bit at index 32 (first bit of second word)', () => {
      bs.set(32)
      expect(bs.get(32)).toBe(true)
    })

    it('should set multiple bits', () => {
      bs.set(0)
      bs.set(5)
      bs.set(10)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(10)).toBe(true)
      expect(bs.get(1)).toBe(false)
    })

    it('should update size when setting beyond current size', () => {
      bs.set(50)
      expect(bs.size).toBe(51)
    })

    it('should not change size when setting within current size', () => {
      bs.set(50)
      bs.set(10)
      expect(bs.size).toBe(51)
    })

    it('should set bit at very large index', () => {
      bs.set(100000)
      expect(bs.get(100000)).toBe(true)
      expect(bs.size).toBe(100001)
    })

    it('should throw on negative index', () => {
      expect(() => bs.set(-1)).toThrow(RangeError)
    })

    it('should handle setting same bit twice', () => {
      bs.set(5)
      bs.set(5)
      expect(bs.get(5)).toBe(true)
    })

    it('should set all bits in first word', () => {
      for (let i = 0; i < 32; i++) {
        bs.set(i)
      }
      for (let i = 0; i < 32; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })
  })

  describe('clear', () => {
    it('should clear a set bit', () => {
      bs.set(5)
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
    })

    it('should clear bit at index 0', () => {
      bs.set(0)
      bs.clear(0)
      expect(bs.get(0)).toBe(false)
    })

    it('should clear bit across word boundary', () => {
      bs.set(32)
      bs.clear(32)
      expect(bs.get(32)).toBe(false)
    })

    it('should handle clearing unset bit', () => {
      bs.clear(10)
      expect(bs.get(10)).toBe(false)
    })

    it('should handle clearing beyond capacity', () => {
      bs.set(0)
      bs.clear(10000)
      expect(bs.get(0)).toBe(true)
    })

    it('should throw on negative index', () => {
      expect(() => bs.clear(-1)).toThrow(RangeError)
    })

    it('should clear and set again', () => {
      bs.set(5)
      bs.clear(5)
      bs.set(5)
      expect(bs.get(5)).toBe(true)
    })
  })

  describe('get', () => {
    it('should return false for unset bit', () => {
      expect(bs.get(0)).toBe(false)
    })

    it('should return true for set bit', () => {
      bs.set(0)
      expect(bs.get(0)).toBe(true)
    })

    it('should return false for index beyond capacity', () => {
      expect(bs.get(10000)).toBe(false)
    })

    it('should throw on negative index', () => {
      expect(() => bs.get(-1)).toThrow(RangeError)
    })

    it('should return correct values for mixed set/clear', () => {
      bs.set(0)
      bs.set(2)
      bs.set(4)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(1)).toBe(false)
      expect(bs.get(2)).toBe(true)
      expect(bs.get(3)).toBe(false)
      expect(bs.get(4)).toBe(true)
    })
  })

  describe('toggle', () => {
    it('should toggle unset bit to set', () => {
      const result = bs.toggle(5)
      expect(result).toBe(true)
      expect(bs.get(5)).toBe(true)
    })

    it('should toggle set bit to unset', () => {
      bs.set(5)
      const result = bs.toggle(5)
      expect(result).toBe(false)
      expect(bs.get(5)).toBe(false)
    })

    it('should toggle bit at index 0', () => {
      const r1 = bs.toggle(0)
      expect(r1).toBe(true)
      const r2 = bs.toggle(0)
      expect(r2).toBe(false)
    })

    it('should toggle bit across word boundary', () => {
      const r1 = bs.toggle(32)
      expect(r1).toBe(true)
      const r2 = bs.toggle(32)
      expect(r2).toBe(false)
    })

    it('should throw on negative index', () => {
      expect(() => bs.toggle(-1)).toThrow(RangeError)
    })

    it('should update size when toggling beyond current size', () => {
      bs.toggle(100)
      expect(bs.size).toBe(101)
    })

    it('should toggle multiple times', () => {
      expect(bs.toggle(5)).toBe(true)
      expect(bs.toggle(5)).toBe(false)
      expect(bs.toggle(5)).toBe(true)
      expect(bs.get(5)).toBe(true)
    })
  })

  describe('size', () => {
    it('should be 0 for empty bitset', () => {
      expect(bs.size).toBe(0)
    })

    it('should track highest set bit + 1', () => {
      bs.set(0)
      expect(bs.size).toBe(1)
    })

    it('should update when setting higher index', () => {
      bs.set(10)
      expect(bs.size).toBe(11)
    })

    it('should not shrink when clearing', () => {
      bs.set(50)
      bs.clear(50)
      expect(bs.size).toBe(51)
    })
  })

  describe('capacity', () => {
    it('should be at least 32 for empty bitset', () => {
      expect(bs.capacity).toBeGreaterThanOrEqual(32)
    })

    it('should grow when setting bits beyond capacity', () => {
      const initialCap = bs.capacity
      bs.set(initialCap + 100)
      expect(bs.capacity).toBeGreaterThanOrEqual(initialCap + 101)
    })

    it('should be multiple of 32', () => {
      expect(bs.capacity % 32).toBe(0)
      bs.set(100)
      expect(bs.capacity % 32).toBe(0)
    })
  })

  describe('setRange', () => {
    it('should set range of bits', () => {
      bs.setRange(5, 10)
      for (let i = 5; i < 10; i++) {
        expect(bs.get(i)).toBe(true)
      }
      expect(bs.get(4)).toBe(false)
      expect(bs.get(10)).toBe(false)
    })

    it('should set range starting at 0', () => {
      bs.setRange(0, 5)
      for (let i = 0; i < 5; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should handle empty range', () => {
      bs.setRange(5, 5)
      expect(bs.size).toBe(0)
    })

    it('should update size', () => {
      bs.setRange(0, 10)
      expect(bs.size).toBe(10)
    })

    it('should set range across word boundary', () => {
      bs.setRange(30, 35)
      for (let i = 30; i < 35; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should throw on negative start', () => {
      expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
    })

    it('should throw when end < start', () => {
      expect(() => bs.setRange(10, 5)).toThrow(RangeError)
    })

    it('should set large range', () => {
      bs.setRange(0, 100)
      expect(bs.countOnes()).toBe(100)
    })

    it('should set range starting from high index', () => {
      bs.setRange(1000, 1010)
      for (let i = 1000; i < 1010; i++) {
        expect(bs.get(i)).toBe(true)
      }
      expect(bs.size).toBe(1010)
    })
  })

  describe('clearRange', () => {
    it('should clear range of bits', () => {
      bs.setRange(0, 20)
      bs.clearRange(5, 10)
      for (let i = 5; i < 10; i++) {
        expect(bs.get(i)).toBe(false)
      }
      expect(bs.get(4)).toBe(true)
      expect(bs.get(10)).toBe(true)
    })

    it('should handle empty range', () => {
      bs.setRange(0, 10)
      bs.clearRange(5, 5)
      expect(bs.countOnes()).toBe(10)
    })

    it('should clear range starting at 0', () => {
      bs.setRange(0, 10)
      bs.clearRange(0, 5)
      for (let i = 0; i < 5; i++) {
        expect(bs.get(i)).toBe(false)
      }
      for (let i = 5; i < 10; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should clear across word boundary', () => {
      bs.setRange(0, 100)
      bs.clearRange(30, 35)
      for (let i = 30; i < 35; i++) {
        expect(bs.get(i)).toBe(false)
      }
    })

    it('should throw on negative start', () => {
      expect(() => bs.clearRange(-1, 5)).toThrow(RangeError)
    })

    it('should throw when end < start', () => {
      expect(() => bs.clearRange(10, 5)).toThrow(RangeError)
    })
  })

  describe('flipRange', () => {
    it('should flip range of bits', () => {
      bs.setRange(0, 20)
      bs.flipRange(5, 10)
      for (let i = 5; i < 10; i++) {
        expect(bs.get(i)).toBe(false)
      }
      expect(bs.get(4)).toBe(true)
      expect(bs.get(10)).toBe(true)
    })

    it('should flip unset bits to set', () => {
      bs.flipRange(0, 5)
      for (let i = 0; i < 5; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should handle empty range', () => {
      bs.flipRange(5, 5)
      expect(bs.size).toBe(0)
    })

    it('should update size', () => {
      bs.flipRange(0, 10)
      expect(bs.size).toBe(10)
    })

    it('should flip across word boundary', () => {
      bs.setRange(30, 35)
      bs.flipRange(28, 37)
      for (let i = 28; i < 30; i++) {
        expect(bs.get(i)).toBe(true)
      }
      for (let i = 30; i < 35; i++) {
        expect(bs.get(i)).toBe(false)
      }
      for (let i = 35; i < 37; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should throw on negative start', () => {
      expect(() => bs.flipRange(-1, 5)).toThrow(RangeError)
    })

    it('should throw when end < start', () => {
      expect(() => bs.flipRange(10, 5)).toThrow(RangeError)
    })
  })

  describe('countOnes', () => {
    it('should return 0 for empty bitset', () => {
      expect(bs.countOnes()).toBe(0)
    })

    it('should count single set bit', () => {
      bs.set(5)
      expect(bs.countOnes()).toBe(1)
    })

    it('should count multiple set bits', () => {
      bs.set(0)
      bs.set(5)
      bs.set(10)
      expect(bs.countOnes()).toBe(3)
    })

    it('should count all bits in first word', () => {
      bs.setRange(0, 32)
      expect(bs.countOnes()).toBe(32)
    })

    it('should count bits across words', () => {
      bs.setRange(0, 64)
      expect(bs.countOnes()).toBe(64)
    })

    it('should count after mixed operations', () => {
      bs.setRange(0, 20)
      bs.clearRange(5, 10)
      expect(bs.countOnes()).toBe(15)
    })

    it('should count with gaps', () => {
      bs.set(0)
      bs.set(10)
      bs.set(20)
      bs.set(30)
      expect(bs.countOnes()).toBe(4)
    })
  })

  describe('countZeros', () => {
    it('should return 0 for empty bitset', () => {
      expect(bs.countZeros()).toBe(0)
    })

    it('should count zeros for partially set bitset', () => {
      bs.set(0)
      bs.set(1)
      bs.set(2)
      expect(bs.countZeros()).toBe(0)
    })

    it('should count zeros with gaps', () => {
      bs.set(0)
      bs.set(2)
      bs.set(4)
      expect(bs.size).toBe(5)
      expect(bs.countZeros()).toBe(2)
    })

    it('should count zeros across words', () => {
      bs.setRange(0, 64)
      bs.clearRange(10, 20)
      expect(bs.countZeros()).toBe(10)
    })
  })

  describe('and', () => {
    it('should AND two bitsets', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(0)
      a.set(1)
      a.set(2)
      b.set(1)
      b.set(2)
      b.set(3)
      const result = a.and(b)
      expect(result.get(0)).toBe(false)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
      expect(result.get(3)).toBe(false)
    })

    it('should handle different sizes', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(5)
      a.set(50)
      b.set(5)
      const result = a.and(b)
      expect(result.get(5)).toBe(true)
      expect(result.get(50)).toBe(false)
    })

    it('should return new bitset', () => {
      const a = new DynamicBitset()
      a.set(0)
      const b = new DynamicBitset()
      const result = a.and(b)
      expect(a.get(0)).toBe(true)
      expect(result.get(0)).toBe(false)
    })

    it('should handle both empty bitsets', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      const result = a.and(b)
      expect(result.countOnes()).toBe(0)
    })
  })

  describe('or', () => {
    it('should OR two bitsets', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(0)
      a.set(1)
      b.set(1)
      b.set(2)
      const result = a.or(b)
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(true)
    })

    it('should handle different sizes', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(5)
      b.set(50)
      const result = a.or(b)
      expect(result.get(5)).toBe(true)
      expect(result.get(50)).toBe(true)
    })

    it('should return new bitset', () => {
      const a = new DynamicBitset()
      a.set(0)
      const b = new DynamicBitset()
      b.set(1)
      const result = a.or(b)
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(true)
    })

    it('should handle one empty bitset', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      b.set(5)
      const result = a.or(b)
      expect(result.get(5)).toBe(true)
    })
  })

  describe('xor', () => {
    it('should XOR two bitsets', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(0)
      a.set(1)
      b.set(1)
      b.set(2)
      const result = a.xor(b)
      expect(result.get(0)).toBe(true)
      expect(result.get(1)).toBe(false)
      expect(result.get(2)).toBe(true)
    })

    it('should handle different sizes', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(5)
      b.set(5)
      b.set(50)
      const result = a.xor(b)
      expect(result.get(5)).toBe(false)
      expect(result.get(50)).toBe(true)
    })

    it('should return new bitset', () => {
      const a = new DynamicBitset()
      a.set(0)
      const b = new DynamicBitset()
      a.set(0)
      const result = a.xor(b)
      expect(result.get(0)).toBe(true)
    })

    it('should XOR identical bitsets to all zeros', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(0)
      a.set(5)
      a.set(10)
      b.set(0)
      b.set(5)
      b.set(10)
      const result = a.xor(b)
      expect(result.countOnes()).toBe(0)
    })
  })

  describe('not', () => {
    it('should NOT a bitset', () => {
      bs.set(0)
      bs.set(2)
      bs.set(4)
      const result = bs.not()
      expect(result.get(0)).toBe(false)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(false)
      expect(result.get(3)).toBe(true)
      expect(result.get(4)).toBe(false)
    })

    it('should return new bitset', () => {
      bs.set(0)
      const result = bs.not()
      expect(bs.get(0)).toBe(true)
      expect(result.get(0)).toBe(false)
    })

    it('should handle empty bitset', () => {
      const result = bs.not()
      expect(result.size).toBe(0)
    })

    it('should double NOT back to original', () => {
      bs.set(0)
      bs.set(5)
      bs.set(10)
      const result = bs.not().not()
      expect(result.get(0)).toBe(true)
      expect(result.get(5)).toBe(true)
      expect(result.get(10)).toBe(true)
      expect(result.get(1)).toBe(false)
    })
  })

  describe('equals', () => {
    it('should return true for equal bitsets', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(0)
      a.set(5)
      b.set(0)
      b.set(5)
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different bitsets', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(0)
      b.set(1)
      expect(a.equals(b)).toBe(false)
    })

    it('should return true for two empty bitsets', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different sizes', () => {
      const a = new DynamicBitset()
      const b = new DynamicBitset()
      a.set(10)
      b.set(10)
      b.set(20)
      expect(a.equals(b)).toBe(false)
    })

    it('should return true for same bitset cloned', () => {
      bs.set(0)
      bs.set(100)
      const clone = bs.clone()
      expect(bs.equals(clone)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      bs.set(0)
      bs.set(5)
      const clone = bs.clone()
      expect(clone.get(0)).toBe(true)
      expect(clone.get(5)).toBe(true)
      clone.clear(0)
      expect(bs.get(0)).toBe(true)
      expect(clone.get(0)).toBe(false)
    })

    it('should clone empty bitset', () => {
      const clone = bs.clone()
      expect(clone.size).toBe(0)
      expect(clone.countOnes()).toBe(0)
    })

    it('should preserve size', () => {
      bs.set(50)
      const clone = bs.clone()
      expect(clone.size).toBe(bs.size)
    })

    it('should preserve capacity', () => {
      bs.set(50)
      const clone = bs.clone()
      expect(clone.capacity).toBe(bs.capacity)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty bitset', () => {
      expect(bs.toArray()).toEqual([])
    })

    it('should return indices of set bits', () => {
      bs.set(0)
      bs.set(5)
      bs.set(10)
      expect(bs.toArray()).toEqual([0, 5, 10])
    })

    it('should return sorted indices', () => {
      bs.set(10)
      bs.set(0)
      bs.set(5)
      expect(bs.toArray()).toEqual([0, 5, 10])
    })

    it('should handle contiguous range', () => {
      bs.setRange(0, 5)
      expect(bs.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle bits across word boundary', () => {
      bs.set(31)
      bs.set(32)
      expect(bs.toArray()).toEqual([31, 32])
    })
  })

  describe('toString', () => {
    it('should return empty string for empty bitset', () => {
      expect(bs.toString()).toBe('')
    })

    it('should return binary representation', () => {
      bs.set(0)
      bs.set(2)
      bs.set(4)
      expect(bs.toString()).toBe('10101')
    })

    it('should pad with zeros', () => {
      bs.set(0)
      bs.set(3)
      expect(bs.toString()).toBe('1001')
    })

    it('should represent all set bits', () => {
      bs.setRange(0, 5)
      expect(bs.toString()).toBe('11111')
    })

    it('should represent all clear bits', () => {
      bs.set(4)
      bs.clear(4)
      expect(bs.toString()).toBe('00000')
    })
  })

  describe('edge cases', () => {
    it('should handle bit 0', () => {
      bs.set(0)
      expect(bs.get(0)).toBe(true)
      bs.clear(0)
      expect(bs.get(0)).toBe(false)
    })

    it('should handle very large index 100000', () => {
      bs.set(100000)
      expect(bs.get(100000)).toBe(true)
      expect(bs.size).toBe(100001)
      expect(bs.capacity).toBeGreaterThanOrEqual(100001)
    })

    it('should handle setting and clearing at boundary', () => {
      bs.set(31)
      bs.set(32)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
      bs.clear(31)
      expect(bs.get(31)).toBe(false)
      expect(bs.get(32)).toBe(true)
    })

    it('should handle empty bitset operations', () => {
      expect(bs.countOnes()).toBe(0)
      expect(bs.countZeros()).toBe(0)
      expect(bs.toArray()).toEqual([])
      expect(bs.toString()).toBe('')
    })

    it('should handle capacity tracking', () => {
      const b = new DynamicBitset(64)
      expect(b.capacity).toBeGreaterThanOrEqual(64)
      b.set(63)
      expect(b.size).toBe(64)
    })

    it('should handle sequential growth', () => {
      for (let i = 0; i < 200; i++) {
        bs.set(i)
      }
      expect(bs.size).toBe(200)
      expect(bs.countOnes()).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should handle interleaved set and clear', () => {
      for (let i = 0; i < 100; i++) {
        bs.set(i)
      }
      for (let i = 0; i < 100; i += 2) {
        bs.clear(i)
      }
      expect(bs.countOnes()).toBe(50)
      for (let i = 0; i < 100; i++) {
        expect(bs.get(i)).toBe(i % 2 !== 0)
      }
    })

    it('should handle bitwise ops with one empty', () => {
      const a = new DynamicBitset()
      a.set(0)
      a.set(5)
      const b = new DynamicBitset()
      expect(a.and(b).countOnes()).toBe(0)
      expect(a.or(b).countOnes()).toBe(2)
      expect(a.xor(b).countOnes()).toBe(2)
    })

    it('should handle large index toggle', () => {
      expect(bs.toggle(50000)).toBe(true)
      expect(bs.get(50000)).toBe(true)
      expect(bs.toggle(50000)).toBe(false)
      expect(bs.get(50000)).toBe(false)
    })

    it('should handle range operations at word boundaries', () => {
      bs.setRange(28, 36)
      expect(bs.countOnes()).toBe(8)
      bs.clearRange(30, 34)
      expect(bs.countOnes()).toBe(4)
      bs.flipRange(28, 36)
      expect(bs.countOnes()).toBe(4)
    })

    it('should handle clone modification independence', () => {
      bs.setRange(0, 10)
      const c = bs.clone()
      c.clearRange(0, 10)
      expect(bs.countOnes()).toBe(10)
      expect(c.countOnes()).toBe(0)
    })

    it('should handle equals with different capacities but same bits', () => {
      const a = new DynamicBitset(32)
      const b = new DynamicBitset(64)
      a.set(0)
      b.set(0)
      expect(a.equals(b)).toBe(true)
    })
  })
})
