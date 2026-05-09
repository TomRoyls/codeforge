import { describe, it, expect } from 'vitest'
import { Bitset } from '../../src/core/bitset/bitset.js'
import { BITS_PER_WORD } from '../../src/core/bitset/types.js'

describe('Bitset', () => {
  describe('constructor', () => {
    it('should create bitset of given size with all zeros', () => {
      const bs = new Bitset(10)
      expect(bs.size()).toBe(10)
      expect(bs.count()).toBe(0)
    })

    it('should create zero-size bitset', () => {
      const bs = new Bitset(0)
      expect(bs.size()).toBe(0)
      expect(bs.count()).toBe(0)
    })

    it('should throw on negative size', () => {
      expect(() => new Bitset(-1)).toThrow(RangeError)
    })

    it('should create bitset spanning multiple words', () => {
      const bs = new Bitset(100)
      expect(bs.size()).toBe(100)
      expect(bs.count()).toBe(0)
    })
  })

  describe('fromString', () => {
    it('should create bitset from binary string', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.size()).toBe(5)
      expect(bs.get(0)).toBe(1)
      expect(bs.get(1)).toBe(0)
      expect(bs.get(2)).toBe(1)
      expect(bs.get(3)).toBe(1)
      expect(bs.get(4)).toBe(0)
    })

    it('should create bitset from all zeros string', () => {
      const bs = Bitset.fromString('00000')
      expect(bs.count()).toBe(0)
    })

    it('should create bitset from all ones string', () => {
      const bs = Bitset.fromString('11111')
      expect(bs.count()).toBe(5)
    })

    it('should create bitset from empty string', () => {
      const bs = Bitset.fromString('')
      expect(bs.size()).toBe(0)
    })

    it('should throw on invalid character', () => {
      expect(() => Bitset.fromString('102')).toThrow(Error)
    })

    it('should handle long binary string', () => {
      const s = '1'.repeat(100)
      const bs = Bitset.fromString(s)
      expect(bs.size()).toBe(100)
      expect(bs.count()).toBe(100)
    })
  })

  describe('fromArray', () => {
    it('should create bitset from 0/1 array', () => {
      const bs = Bitset.fromArray([1, 0, 1, 1, 0])
      expect(bs.size()).toBe(5)
      expect(bs.toArray()).toEqual([1, 0, 1, 1, 0])
    })

    it('should create bitset from empty array', () => {
      const bs = Bitset.fromArray([])
      expect(bs.size()).toBe(0)
    })

    it('should create bitset from all zeros array', () => {
      const bs = Bitset.fromArray([0, 0, 0])
      expect(bs.count()).toBe(0)
    })

    it('should throw on invalid value', () => {
      expect(() => Bitset.fromArray([0, 2, 1])).toThrow(Error)
    })

    it('should throw on negative value', () => {
      expect(() => Bitset.fromArray([0, -1, 1])).toThrow(Error)
    })
  })

  describe('fromNumber', () => {
    it('should create bitset from integer with default size', () => {
      const bs = Bitset.fromNumber(5)
      expect(bs.size()).toBe(32)
      expect(bs.get(0)).toBe(1)
      expect(bs.get(1)).toBe(0)
      expect(bs.get(2)).toBe(1)
    })

    it('should create bitset from integer with custom size', () => {
      const bs = Bitset.fromNumber(5, 4)
      expect(bs.size()).toBe(4)
      expect(bs.toArray()).toEqual([1, 0, 1, 0])
    })

    it('should create bitset from zero', () => {
      const bs = Bitset.fromNumber(0, 8)
      expect(bs.count()).toBe(0)
      expect(bs.size()).toBe(8)
    })

    it('should throw on negative number', () => {
      expect(() => Bitset.fromNumber(-1)).toThrow(Error)
    })

    it('should throw on non-integer', () => {
      expect(() => Bitset.fromNumber(1.5)).toThrow(Error)
    })

    it('should throw on negative size', () => {
      expect(() => Bitset.fromNumber(0, -1)).toThrow(RangeError)
    })

    it('should handle large number', () => {
      const bs = Bitset.fromNumber(0xffffffff, 32)
      expect(bs.count()).toBe(32)
    })
  })

  describe('set', () => {
    it('should set bit at index', () => {
      const bs = new Bitset(10)
      bs.set(3)
      expect(bs.get(3)).toBe(1)
    })

    it('should not affect other bits', () => {
      const bs = new Bitset(10)
      bs.set(3)
      bs.set(7)
      expect(bs.get(2)).toBe(0)
      expect(bs.get(4)).toBe(0)
    })

    it('should be idempotent', () => {
      const bs = new Bitset(10)
      bs.set(3)
      bs.set(3)
      expect(bs.get(3)).toBe(1)
      expect(bs.count()).toBe(1)
    })

    it('should throw on out of bounds index', () => {
      const bs = new Bitset(10)
      expect(() => bs.set(-1)).toThrow(RangeError)
      expect(() => bs.set(10)).toThrow(RangeError)
    })

    it('should set bit at word boundary (bit 31)', () => {
      const bs = new Bitset(64)
      bs.set(31)
      expect(bs.get(31)).toBe(1)
    })

    it('should set bit at word boundary (bit 32)', () => {
      const bs = new Bitset(64)
      bs.set(32)
      expect(bs.get(32)).toBe(1)
    })
  })

  describe('clear', () => {
    it('should clear bit at index', () => {
      const bs = Bitset.fromArray([1, 1, 1, 1])
      bs.clear(2)
      expect(bs.get(2)).toBe(0)
    })

    it('should be idempotent on already clear bit', () => {
      const bs = new Bitset(10)
      bs.clear(3)
      expect(bs.get(3)).toBe(0)
    })

    it('should throw on out of bounds index', () => {
      const bs = new Bitset(10)
      expect(() => bs.clear(-1)).toThrow(RangeError)
      expect(() => bs.clear(10)).toThrow(RangeError)
    })
  })

  describe('flip', () => {
    it('should toggle bit from 0 to 1', () => {
      const bs = new Bitset(10)
      bs.flip(3)
      expect(bs.get(3)).toBe(1)
    })

    it('should toggle bit from 1 to 0', () => {
      const bs = Bitset.fromArray([1, 0, 1])
      bs.flip(0)
      expect(bs.get(0)).toBe(0)
    })

    it('should toggle back and forth', () => {
      const bs = new Bitset(10)
      bs.flip(3)
      bs.flip(3)
      expect(bs.get(3)).toBe(0)
    })

    it('should throw on out of bounds index', () => {
      const bs = new Bitset(10)
      expect(() => bs.flip(-1)).toThrow(RangeError)
      expect(() => bs.flip(10)).toThrow(RangeError)
    })
  })

  describe('get', () => {
    it('should return 0 for unset bit', () => {
      const bs = new Bitset(10)
      expect(bs.get(5)).toBe(0)
    })

    it('should return 1 for set bit', () => {
      const bs = new Bitset(10)
      bs.set(5)
      expect(bs.get(5)).toBe(1)
    })

    it('should throw on out of bounds index', () => {
      const bs = new Bitset(10)
      expect(() => bs.get(-1)).toThrow(RangeError)
      expect(() => bs.get(10)).toThrow(RangeError)
    })
  })

  describe('setRange', () => {
    it('should set range of bits', () => {
      const bs = new Bitset(10)
      bs.setRange(2, 6)
      expect(bs.toString()).toBe('0011110000')
    })

    it('should handle empty range', () => {
      const bs = new Bitset(10)
      bs.setRange(3, 3)
      expect(bs.count()).toBe(0)
    })

    it('should set full range', () => {
      const bs = new Bitset(5)
      bs.setRange(0, 5)
      expect(bs.toString()).toBe('11111')
    })

    it('should set range across word boundary', () => {
      const bs = new Bitset(64)
      bs.setRange(30, 34)
      expect(bs.get(29)).toBe(0)
      expect(bs.get(30)).toBe(1)
      expect(bs.get(31)).toBe(1)
      expect(bs.get(32)).toBe(1)
      expect(bs.get(33)).toBe(1)
      expect(bs.get(34)).toBe(0)
    })

    it('should throw on invalid range', () => {
      const bs = new Bitset(10)
      expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
      expect(() => bs.setRange(5, 3)).toThrow(RangeError)
      expect(() => bs.setRange(0, 11)).toThrow(RangeError)
    })
  })

  describe('clearRange', () => {
    it('should clear range of bits', () => {
      const bs = Bitset.fromString('1111111111')
      bs.clearRange(2, 6)
      expect(bs.toString()).toBe('1100001111')
    })

    it('should handle empty range', () => {
      const bs = Bitset.fromString('11111')
      bs.clearRange(2, 2)
      expect(bs.count()).toBe(5)
    })

    it('should clear full range', () => {
      const bs = Bitset.fromString('11111')
      bs.clearRange(0, 5)
      expect(bs.count()).toBe(0)
    })

    it('should clear range across word boundary', () => {
      const bs = new Bitset(64)
      bs.setRange(0, 64)
      bs.clearRange(30, 34)
      expect(bs.get(30)).toBe(0)
      expect(bs.get(31)).toBe(0)
      expect(bs.get(32)).toBe(0)
      expect(bs.get(33)).toBe(0)
      expect(bs.get(29)).toBe(1)
      expect(bs.get(34)).toBe(1)
    })

    it('should throw on invalid range', () => {
      const bs = new Bitset(10)
      expect(() => bs.clearRange(-1, 5)).toThrow(RangeError)
      expect(() => bs.clearRange(5, 3)).toThrow(RangeError)
    })
  })

  describe('flipRange', () => {
    it('should flip range of bits', () => {
      const bs = Bitset.fromString('0000000000')
      bs.flipRange(2, 6)
      expect(bs.toString()).toBe('0011110000')
    })

    it('should flip range of mixed bits', () => {
      const bs = Bitset.fromString('1010101010')
      bs.flipRange(1, 4)
      expect(bs.toString()).toBe('1101101010')
    })

    it('should handle empty range', () => {
      const bs = Bitset.fromString('10101')
      bs.flipRange(2, 2)
      expect(bs.toString()).toBe('10101')
    })

    it('should flip range across word boundary', () => {
      const bs = new Bitset(64)
      bs.setRange(30, 34)
      bs.flipRange(29, 35)
      expect(bs.get(29)).toBe(1)
      expect(bs.get(30)).toBe(0)
      expect(bs.get(31)).toBe(0)
      expect(bs.get(32)).toBe(0)
      expect(bs.get(33)).toBe(0)
      expect(bs.get(34)).toBe(1)
    })

    it('should throw on invalid range', () => {
      const bs = new Bitset(10)
      expect(() => bs.flipRange(-1, 5)).toThrow(RangeError)
      expect(() => bs.flipRange(5, 3)).toThrow(RangeError)
    })
  })

  describe('count (popcount)', () => {
    it('should count set bits in empty bitset', () => {
      const bs = new Bitset(10)
      expect(bs.count()).toBe(0)
    })

    it('should count set bits correctly', () => {
      const bs = Bitset.fromString('101101')
      expect(bs.count()).toBe(4)
    })

    it('should count set bits in full bitset', () => {
      const bs = new Bitset(32)
      bs.setRange(0, 32)
      expect(bs.count()).toBe(32)
    })

    it('should count set bits across multiple words', () => {
      const bs = new Bitset(64)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(63)
      expect(bs.count()).toBe(4)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty bitset', () => {
      const bs = new Bitset(10)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should return false after setting a bit', () => {
      const bs = new Bitset(10)
      bs.set(5)
      expect(bs.isEmpty()).toBe(false)
    })

    it('should return true after clearing all bits', () => {
      const bs = Bitset.fromString('101')
      bs.clear(0)
      bs.clear(2)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should return true for zero-size bitset', () => {
      const bs = new Bitset(0)
      expect(bs.isEmpty()).toBe(true)
    })
  })

  describe('isFull', () => {
    it('should return true when all bits are set', () => {
      const bs = Bitset.fromString('11111')
      expect(bs.isFull()).toBe(true)
    })

    it('should return false when some bits are not set', () => {
      const bs = Bitset.fromString('11101')
      expect(bs.isFull()).toBe(false)
    })

    it('should return true for empty bitset (vacuously)', () => {
      const bs = new Bitset(0)
      expect(bs.isFull()).toBe(true)
    })

    it('should return true for full single word', () => {
      const bs = new Bitset(32)
      bs.setRange(0, 32)
      expect(bs.isFull()).toBe(true)
    })

    it('should handle partial last word correctly', () => {
      const bs = new Bitset(5)
      bs.setRange(0, 5)
      expect(bs.isFull()).toBe(true)
    })
  })

  describe('and', () => {
    it('should perform bitwise AND', () => {
      const a = Bitset.fromString('10110')
      const b = Bitset.fromString('11010')
      expect(a.and(b).toString()).toBe('10010')
    })

    it('should return zeros when ANDing with empty bitset', () => {
      const a = Bitset.fromString('11111')
      const b = new Bitset(5)
      expect(a.and(b).toString()).toBe('00000')
    })

    it('should handle different sizes', () => {
      const a = Bitset.fromString('11111')
      const b = Bitset.fromString('11')
      expect(a.and(b).toString()).toEqual('11000')
    })

    it('should not modify original bitsets', () => {
      const a = Bitset.fromString('10110')
      const b = Bitset.fromString('11010')
      a.and(b)
      expect(a.toString()).toBe('10110')
      expect(b.toString()).toBe('11010')
    })
  })

  describe('or', () => {
    it('should perform bitwise OR', () => {
      const a = Bitset.fromString('10100')
      const b = Bitset.fromString('01010')
      expect(a.or(b).toString()).toBe('11110')
    })

    it('should handle different sizes', () => {
      const a = Bitset.fromString('10100')
      const b = Bitset.fromString('11')
      expect(a.or(b).toString()).toEqual('11100')
    })

    it('should not modify original bitsets', () => {
      const a = Bitset.fromString('10100')
      const b = Bitset.fromString('01010')
      a.or(b)
      expect(a.toString()).toBe('10100')
      expect(b.toString()).toBe('01010')
    })
  })

  describe('xor', () => {
    it('should perform bitwise XOR', () => {
      const a = Bitset.fromString('10110')
      const b = Bitset.fromString('11010')
      expect(a.xor(b).toString()).toBe('01100')
    })

    it('should return original when XORing with empty', () => {
      const a = Bitset.fromString('10110')
      const b = new Bitset(5)
      expect(a.xor(b).toString()).toBe('10110')
    })

    it('should return zeros when XORing with self', () => {
      const a = Bitset.fromString('10110')
      expect(a.xor(a).toString()).toBe('00000')
    })

    it('should handle different sizes', () => {
      const a = Bitset.fromString('10100')
      const b = Bitset.fromString('11')
      expect(a.xor(b).toString()).toEqual('01100')
    })
  })

  describe('not', () => {
    it('should complement all bits', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.not().toString()).toBe('01001')
    })

    it('should complement all-zero bitset', () => {
      const bs = new Bitset(8)
      expect(bs.not().toString()).toBe('11111111')
    })

    it('should complement all-one bitset', () => {
      const bs = Bitset.fromString('11111111')
      expect(bs.not().toString()).toBe('00000000')
    })

    it('should not modify original', () => {
      const bs = Bitset.fromString('10110')
      bs.not()
      expect(bs.toString()).toBe('10110')
    })

    it('should handle partial last word', () => {
      const bs = new Bitset(5)
      expect(bs.not().toString()).toBe('11111')
    })
  })

  describe('rank', () => {
    it('should count 1s in [0, 0)', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.rank(0)).toBe(0)
    })

    it('should count 1s in [0, index)', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.rank(1)).toBe(1)
      expect(bs.rank(2)).toBe(1)
      expect(bs.rank(3)).toBe(2)
      expect(bs.rank(4)).toBe(3)
      expect(bs.rank(5)).toBe(3)
    })

    it('should handle rank past end', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.rank(100)).toBe(3)
    })

    it('should handle negative index', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.rank(-1)).toBe(0)
    })

    it('should compute rank across word boundary', () => {
      const bs = new Bitset(64)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(63)
      expect(bs.rank(32)).toBe(2)
      expect(bs.rank(64)).toBe(4)
    })
  })

  describe('select', () => {
    it('should find position of k-th set bit', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.select(0)).toBe(0)
      expect(bs.select(1)).toBe(2)
      expect(bs.select(2)).toBe(3)
    })

    it('should return -1 for k beyond count', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.select(3)).toBe(-1)
      expect(bs.select(100)).toBe(-1)
    })

    it('should return -1 for negative k', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.select(-1)).toBe(-1)
    })

    it('should find set bits across word boundary', () => {
      const bs = new Bitset(64)
      bs.set(5)
      bs.set(31)
      bs.set(40)
      expect(bs.select(0)).toBe(5)
      expect(bs.select(1)).toBe(31)
      expect(bs.select(2)).toBe(40)
    })
  })

  describe('nextSet', () => {
    it('should find next set bit', () => {
      const bs = Bitset.fromString('0010100')
      expect(bs.nextSet(0)).toBe(2)
      expect(bs.nextSet(2)).toBe(2)
      expect(bs.nextSet(3)).toBe(4)
      expect(bs.nextSet(5)).toBe(-1)
    })

    it('should return -1 if no set bit after index', () => {
      const bs = Bitset.fromString('001000')
      expect(bs.nextSet(4)).toBe(-1)
    })

    it('should return -1 for bitset with no set bits', () => {
      const bs = new Bitset(10)
      expect(bs.nextSet(0)).toBe(-1)
    })

    it('should return -1 for index at end', () => {
      const bs = Bitset.fromString('001')
      expect(bs.nextSet(3)).toBe(-1)
    })

    it('should handle negative index as starting from 0', () => {
      const bs = Bitset.fromString('010')
      expect(bs.nextSet(-1)).toBe(1)
    })

    it('should find set bits across word boundary', () => {
      const bs = new Bitset(64)
      bs.set(31)
      bs.set(33)
      expect(bs.nextSet(0)).toBe(31)
      expect(bs.nextSet(32)).toBe(33)
    })
  })

  describe('prevSet', () => {
    it('should find previous set bit', () => {
      const bs = Bitset.fromString('0010100')
      expect(bs.prevSet(6)).toBe(4)
      expect(bs.prevSet(4)).toBe(4)
      expect(bs.prevSet(3)).toBe(2)
      expect(bs.prevSet(1)).toBe(-1)
    })

    it('should return -1 if no set bit before index', () => {
      const bs = Bitset.fromString('000100')
      expect(bs.prevSet(2)).toBe(-1)
    })

    it('should return -1 for bitset with no set bits', () => {
      const bs = new Bitset(10)
      expect(bs.prevSet(5)).toBe(-1)
    })

    it('should return -1 for negative index', () => {
      const bs = Bitset.fromString('010')
      expect(bs.prevSet(-1)).toBe(-1)
    })

    it('should clamp index to size-1', () => {
      const bs = Bitset.fromString('010')
      expect(bs.prevSet(100)).toBe(1)
    })

    it('should find set bits across word boundary', () => {
      const bs = new Bitset(64)
      bs.set(0)
      bs.set(32)
      bs.set(63)
      expect(bs.prevSet(63)).toBe(63)
      expect(bs.prevSet(62)).toBe(32)
      expect(bs.prevSet(31)).toBe(0)
    })
  })

  describe('toString', () => {
    it('should return binary string representation', () => {
      const bs = Bitset.fromArray([1, 0, 1, 1, 0])
      expect(bs.toString()).toBe('10110')
    })

    it('should return empty string for empty bitset', () => {
      const bs = new Bitset(0)
      expect(bs.toString()).toBe('')
    })

    it('should return all zeros for new bitset', () => {
      const bs = new Bitset(5)
      expect(bs.toString()).toBe('00000')
    })
  })

  describe('toArray', () => {
    it('should return array of 0s and 1s', () => {
      const bs = Bitset.fromString('10110')
      expect(bs.toArray()).toEqual([1, 0, 1, 1, 0])
    })

    it('should return empty array for empty bitset', () => {
      const bs = new Bitset(0)
      expect(bs.toArray()).toEqual([])
    })

    it('should return all zeros for new bitset', () => {
      const bs = new Bitset(3)
      expect(bs.toArray()).toEqual([0, 0, 0])
    })
  })

  describe('toNumber', () => {
    it('should return integer representation', () => {
      const bs = Bitset.fromArray([1, 0, 1, 1])
      expect(bs.toNumber()).toBe(13)
    })

    it('should return 0 for all-zero bitset', () => {
      const bs = new Bitset(8)
      expect(bs.toNumber()).toBe(0)
    })

    it('should return 0 for empty bitset', () => {
      const bs = new Bitset(0)
      expect(bs.toNumber()).toBe(0)
    })

    it('should handle full 32-bit number', () => {
      const bs = new Bitset(32)
      bs.setRange(0, 32)
      expect(bs.toNumber()).toBe(0xffffffff)
    })
  })

  describe('clone', () => {
    it('should create deep copy', () => {
      const bs = Bitset.fromString('10110')
      const clone = bs.clone()
      expect(clone.toString()).toBe('10110')
      expect(clone.equals(bs)).toBe(true)
    })

    it('should be independent of original', () => {
      const bs = Bitset.fromString('10110')
      const clone = bs.clone()
      clone.clear(0)
      expect(bs.get(0)).toBe(1)
      expect(clone.get(0)).toBe(0)
    })

    it('should clone empty bitset', () => {
      const bs = new Bitset(0)
      const clone = bs.clone()
      expect(clone.size()).toBe(0)
    })
  })

  describe('equals', () => {
    it('should return true for identical bitsets', () => {
      const a = Bitset.fromString('10110')
      const b = Bitset.fromString('10110')
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different bitsets', () => {
      const a = Bitset.fromString('10110')
      const b = Bitset.fromString('10111')
      expect(a.equals(b)).toBe(false)
    })

    it('should return false for different sizes', () => {
      const a = Bitset.fromString('101')
      const b = Bitset.fromString('1010')
      expect(a.equals(b)).toBe(false)
    })

    it('should return true for two empty bitsets', () => {
      expect(new Bitset(0).equals(new Bitset(0))).toBe(true)
    })
  })

  describe('resize', () => {
    it('should grow bitset preserving data', () => {
      const bs = Bitset.fromString('101')
      bs.resize(6)
      expect(bs.toString()).toBe('101000')
      expect(bs.size()).toBe(6)
    })

    it('should shrink bitset truncating data', () => {
      const bs = Bitset.fromString('101101')
      bs.resize(3)
      expect(bs.toString()).toBe('101')
      expect(bs.size()).toBe(3)
    })

    it('should handle resize to same size', () => {
      const bs = Bitset.fromString('101')
      bs.resize(3)
      expect(bs.toString()).toBe('101')
    })

    it('should handle resize to zero', () => {
      const bs = Bitset.fromString('101')
      bs.resize(0)
      expect(bs.size()).toBe(0)
    })

    it('should handle resize from zero', () => {
      const bs = new Bitset(0)
      bs.resize(5)
      expect(bs.size()).toBe(5)
      expect(bs.count()).toBe(0)
    })

    it('should clear excess bits when shrinking at word boundary', () => {
      const bs = new Bitset(64)
      bs.setRange(0, 64)
      bs.resize(5)
      expect(bs.toString()).toBe('11111')
    })

    it('should throw on negative size', () => {
      const bs = new Bitset(10)
      expect(() => bs.resize(-1)).toThrow(RangeError)
    })

    it('should grow across word boundary', () => {
      const bs = Bitset.fromString('1'.repeat(32))
      bs.resize(64)
      expect(bs.size()).toBe(64)
      expect(bs.get(0)).toBe(1)
      expect(bs.get(31)).toBe(1)
      expect(bs.get(32)).toBe(0)
    })
  })

  describe('iterator', () => {
    it('should iterate over all bits', () => {
      const bs = Bitset.fromString('10110')
      const bits: number[] = []
      for (const bit of bs) {
        bits.push(bit)
      }
      expect(bits).toEqual([1, 0, 1, 1, 0])
    })

    it('should work with spread operator', () => {
      const bs = Bitset.fromString('101')
      expect([...bs]).toEqual([1, 0, 1])
    })

    it('should work with empty bitset', () => {
      const bs = new Bitset(0)
      expect([...bs]).toEqual([])
    })
  })

  describe('edge cases at word boundaries', () => {
    it('should handle bit 31 (last of first word)', () => {
      const bs = new Bitset(33)
      bs.set(31)
      expect(bs.get(31)).toBe(1)
      expect(bs.get(30)).toBe(0)
      expect(bs.get(32)).toBe(0)
    })

    it('should handle bit 32 (first of second word)', () => {
      const bs = new Bitset(33)
      bs.set(32)
      expect(bs.get(32)).toBe(1)
      expect(bs.get(31)).toBe(0)
    })

    it('should handle setRange across word boundary', () => {
      const bs = new Bitset(64)
      bs.setRange(30, 34)
      const expected = '0'.repeat(30) + '1'.repeat(4) + '0'.repeat(30)
      expect(bs.toString()).toBe(expected)
    })

    it('should handle clearRange across word boundary', () => {
      const bs = new Bitset(64)
      bs.setRange(0, 64)
      bs.clearRange(30, 34)
      expect(bs.get(29)).toBe(1)
      expect(bs.get(30)).toBe(0)
      expect(bs.get(33)).toBe(0)
      expect(bs.get(34)).toBe(1)
    })

    it('should handle flipRange across word boundary', () => {
      const bs = new Bitset(64)
      bs.setRange(0, 64)
      bs.flipRange(30, 34)
      expect(bs.get(29)).toBe(1)
      expect(bs.get(30)).toBe(0)
      expect(bs.get(33)).toBe(0)
      expect(bs.get(34)).toBe(1)
    })

    it('should handle rank across word boundary', () => {
      const bs = new Bitset(64)
      bs.set(0)
      bs.set(31)
      bs.set(32)
      bs.set(63)
      expect(bs.rank(33)).toBe(3)
    })

    it('should handle select across word boundary', () => {
      const bs = new Bitset(64)
      bs.set(5)
      bs.set(35)
      expect(bs.select(0)).toBe(5)
      expect(bs.select(1)).toBe(35)
    })
  })

  describe('empty bitset', () => {
    it('should have size 0', () => {
      const bs = new Bitset(0)
      expect(bs.size()).toBe(0)
    })

    it('should be empty', () => {
      const bs = new Bitset(0)
      expect(bs.isEmpty()).toBe(true)
    })

    it('should be full', () => {
      const bs = new Bitset(0)
      expect(bs.isFull()).toBe(true)
    })

    it('should have count 0', () => {
      const bs = new Bitset(0)
      expect(bs.count()).toBe(0)
    })

    it('should return empty string', () => {
      const bs = new Bitset(0)
      expect(bs.toString()).toBe('')
    })

    it('should return empty array', () => {
      const bs = new Bitset(0)
      expect(bs.toArray()).toEqual([])
    })

    it('should clone correctly', () => {
      const bs = new Bitset(0)
      expect(bs.clone().size()).toBe(0)
    })

    it('should equal another empty bitset', () => {
      expect(new Bitset(0).equals(new Bitset(0))).toBe(true)
    })

    it('should return 0 for toNumber', () => {
      const bs = new Bitset(0)
      expect(bs.toNumber()).toBe(0)
    })

    it('should return -1 for nextSet', () => {
      const bs = new Bitset(0)
      expect(bs.nextSet(0)).toBe(-1)
    })

    it('should return -1 for prevSet', () => {
      const bs = new Bitset(0)
      expect(bs.prevSet(0)).toBe(-1)
    })

    it('should return -1 for select', () => {
      const bs = new Bitset(0)
      expect(bs.select(0)).toBe(-1)
    })

    it('should return 0 for rank', () => {
      const bs = new Bitset(0)
      expect(bs.rank(0)).toBe(0)
    })
  })

  describe('single bit bitset', () => {
    it('should handle set on single bit', () => {
      const bs = new Bitset(1)
      bs.set(0)
      expect(bs.get(0)).toBe(1)
      expect(bs.count()).toBe(1)
    })

    it('should handle clear on single bit', () => {
      const bs = Bitset.fromArray([1])
      bs.clear(0)
      expect(bs.get(0)).toBe(0)
      expect(bs.count()).toBe(0)
    })

    it('should handle flip on single bit', () => {
      const bs = new Bitset(1)
      bs.flip(0)
      expect(bs.get(0)).toBe(1)
      bs.flip(0)
      expect(bs.get(0)).toBe(0)
    })

    it('should report isFull when bit is set', () => {
      const bs = Bitset.fromArray([1])
      expect(bs.isFull()).toBe(true)
    })

    it('should report not isFull when bit is clear', () => {
      const bs = new Bitset(1)
      expect(bs.isFull()).toBe(false)
    })
  })

  describe('large bitsets', () => {
    it('should handle 10000+ bits', () => {
      const bs = new Bitset(10000)
      expect(bs.size()).toBe(10000)
      expect(bs.count()).toBe(0)
    })

    it('should set bits in large bitset', () => {
      const bs = new Bitset(10000)
      bs.set(5000)
      bs.set(9999)
      expect(bs.get(5000)).toBe(1)
      expect(bs.get(9999)).toBe(1)
      expect(bs.count()).toBe(2)
    })

    it('should count bits in large bitset', () => {
      const bs = new Bitset(10000)
      bs.setRange(100, 200)
      expect(bs.count()).toBe(100)
    })

    it('should rank in large bitset', () => {
      const bs = new Bitset(10000)
      bs.setRange(0, 5000)
      expect(bs.rank(5000)).toBe(5000)
      expect(bs.rank(2500)).toBe(2500)
    })

    it('should select in large bitset', () => {
      const bs = new Bitset(10000)
      bs.set(100)
      bs.set(5000)
      expect(bs.select(0)).toBe(100)
      expect(bs.select(1)).toBe(5000)
    })

    it('should perform bitwise ops on large bitsets', () => {
      const a = new Bitset(10000)
      const b = new Bitset(10000)
      a.setRange(0, 5000)
      b.setRange(2500, 7500)
      const andResult = a.and(b)
      expect(andResult.count()).toBe(2500)
      const orResult = a.or(b)
      expect(orResult.count()).toBe(7500)
    })

    it('should nextSet/prevSet in large bitset', () => {
      const bs = new Bitset(10000)
      bs.set(100)
      bs.set(5000)
      bs.set(9999)
      expect(bs.nextSet(0)).toBe(100)
      expect(bs.nextSet(101)).toBe(5000)
      expect(bs.prevSet(9999)).toBe(9999)
      expect(bs.prevSet(8000)).toBe(5000)
    })

    it('should resize large bitset', () => {
      const bs = new Bitset(10000)
      bs.setRange(0, 10000)
      bs.resize(5000)
      expect(bs.size()).toBe(5000)
      expect(bs.count()).toBe(5000)
    })

    it('should clone large bitset', () => {
      const bs = new Bitset(10000)
      bs.setRange(0, 100)
      const clone = bs.clone()
      expect(clone.equals(bs)).toBe(true)
      expect(clone.size()).toBe(10000)
    })
  })

  describe('BITS_PER_WORD constant', () => {
    it('should be 32', () => {
      expect(BITS_PER_WORD).toBe(32)
    })
  })
})
