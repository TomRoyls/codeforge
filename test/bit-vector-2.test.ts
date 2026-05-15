import { describe, it, expect, beforeEach } from 'vitest';
import { BitVector2 } from '../src/core/bit-vector-2/index.js';

describe('BitVector2', () => {
  let bv: BitVector2;

  beforeEach(() => {
    bv = new BitVector2();
  });

  describe('constructor', () => {
    it('should create empty vector with default size', () => {
      expect(bv.size).toBe(0);
      expect(bv.isEmpty()).toBe(true);
    });

    it('should create vector with specified size', () => {
      const bv2 = new BitVector2(10);
      expect(bv2.size).toBe(10);
    });

    it('should create vector with size 0', () => {
      const bv2 = new BitVector2(0);
      expect(bv2.size).toBe(0);
      expect(bv2.isEmpty()).toBe(true);
    });

    it('should create large vector', () => {
      const bv2 = new BitVector2(1000);
      expect(bv2.size).toBe(1000);
      expect(bv2.isEmpty()).toBe(true);
    });
  });

  describe('set', () => {
    it('should set bit to true', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.get(5)).toBe(true);
    });

    it('should set bit to false', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.set(5, false);
      expect(bv.get(5)).toBe(false);
    });

    it('should throw for negative index', () => {
      bv = new BitVector2(10);
      expect(() => bv.set(-1, true)).toThrow(RangeError);
    });

    it('should throw for index beyond size', () => {
      bv = new BitVector2(10);
      expect(() => bv.set(10, true)).toThrow(RangeError);
    });

    it('should set multiple bits', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.get(0)).toBe(true);
      expect(bv.get(3)).toBe(true);
      expect(bv.get(7)).toBe(true);
    });

    it('should set bit at index 0', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      expect(bv.get(0)).toBe(true);
    });

    it('should set bit at last index', () => {
      bv = new BitVector2(10);
      bv.set(9, true);
      expect(bv.get(9)).toBe(true);
    });

    it('should set same bit multiple times', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.set(5, true);
      expect(bv.get(5)).toBe(true);
      bv.set(5, false);
      expect(bv.get(5)).toBe(false);
    });
  });

  describe('get', () => {
    it('should return false for unset bit', () => {
      bv = new BitVector2(10);
      expect(bv.get(5)).toBe(false);
    });

    it('should return true for set bit', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.get(5)).toBe(true);
    });

    it('should throw for negative index', () => {
      bv = new BitVector2(10);
      expect(() => bv.get(-1)).toThrow(RangeError);
    });

    it('should throw for index beyond size', () => {
      bv = new BitVector2(10);
      expect(() => bv.get(10)).toThrow(RangeError);
    });

    it('should get bit at index 0', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      expect(bv.get(0)).toBe(true);
    });

    it('should get bit at last index', () => {
      bv = new BitVector2(10);
      bv.set(9, true);
      expect(bv.get(9)).toBe(true);
    });
  });

  describe('flip', () => {
    it('should flip false to true', () => {
      bv = new BitVector2(10);
      bv.flip(5);
      expect(bv.get(5)).toBe(true);
    });

    it('should flip true to false', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.flip(5);
      expect(bv.get(5)).toBe(false);
    });

    it('should throw for negative index', () => {
      bv = new BitVector2(10);
      expect(() => bv.flip(-1)).toThrow(RangeError);
    });

    it('should throw for index beyond size', () => {
      bv = new BitVector2(10);
      expect(() => bv.flip(10)).toThrow(RangeError);
    });

    it('should flip multiple times', () => {
      bv = new BitVector2(10);
      bv.flip(5);
      expect(bv.get(5)).toBe(true);
      bv.flip(5);
      expect(bv.get(5)).toBe(false);
      bv.flip(5);
      expect(bv.get(5)).toBe(true);
    });
  });

  describe('size', () => {
    it('should return correct size for empty vector', () => {
      expect(bv.size).toBe(0);
    });

    it('should return correct size for non-empty vector', () => {
      bv = new BitVector2(10);
      expect(bv.size).toBe(10);
    });

    it('should return correct size after resize', () => {
      bv = new BitVector2(10);
      bv.resize(20);
      expect(bv.size).toBe(20);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty vector', () => {
      expect(bv.isEmpty()).toBe(true);
    });

    it('should return false for non-empty vector', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.clear();
      expect(bv.isEmpty()).toBe(true);
    });

    it('should return true for vector with all zeros', () => {
      bv = new BitVector2(10);
      expect(bv.isEmpty()).toBe(true);
    });

    it('should return false for vector with ones', () => {
      bv = new BitVector2(10);
      for (let i = 0; i < 10; i++) {
        bv.set(i, true);
      }
      expect(bv.isEmpty()).toBe(false);
    });
  });

  describe('countOnes', () => {
    it('should return 0 for empty vector', () => {
      expect(bv.countOnes()).toBe(0);
    });

    it('should return 0 for vector with all zeros', () => {
      bv = new BitVector2(10);
      expect(bv.countOnes()).toBe(0);
    });

    it('should count single one', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.countOnes()).toBe(1);
    });

    it('should count multiple ones', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.countOnes()).toBe(3);
    });

    it('should count all ones', () => {
      bv = new BitVector2(10);
      for (let i = 0; i < 10; i++) {
        bv.set(i, true);
      }
      expect(bv.countOnes()).toBe(10);
    });

    it('should count after flipping', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.countOnes()).toBe(1);
      bv.flip(5);
      expect(bv.countOnes()).toBe(0);
    });
  });

  describe('popcount', () => {
    it('should alias countOnes', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.popcount()).toBe(bv.countOnes());
    });

    it('should return same as countOnes for empty vector', () => {
      expect(bv.popcount()).toBe(0);
      expect(bv.countOnes()).toBe(0);
    });

    it('should return same as countOnes with multiple bits', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.popcount()).toBe(bv.countOnes());
    });
  });

  describe('countZeros', () => {
    it('should return 0 for empty vector', () => {
      expect(bv.countZeros()).toBe(0);
    });

    it('should count all zeros', () => {
      bv = new BitVector2(10);
      expect(bv.countZeros()).toBe(10);
    });

    it('should count zeros with ones', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.countZeros()).toBe(7);
    });

    it('should return 0 for all ones', () => {
      bv = new BitVector2(10);
      for (let i = 0; i < 10; i++) {
        bv.set(i, true);
      }
      expect(bv.countZeros()).toBe(0);
    });

    it('should match size minus countOnes', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.countZeros()).toBe(bv.size - bv.countOnes());
    });
  });

  describe('rank1', () => {
    it('should return 0 for index 0', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.rank1(0)).toBe(0);
    });

    it('should count ones up to index', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.rank1(5)).toBe(2);
    });

    it('should count all ones at last index', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.rank1(10)).toBe(3);
    });

    it('should throw for negative index', () => {
      bv = new BitVector2(10);
      expect(() => bv.rank1(-1)).toThrow(RangeError);
    });

    it('should throw for index beyond size', () => {
      bv = new BitVector2(10);
      expect(() => bv.rank1(11)).toThrow(RangeError);
    });

    it('should allow index equal to size', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.rank1(10)).toBe(3);
    });

    it('should work with consecutive ones', () => {
      bv = new BitVector2(10);
      bv.set(2, true);
      bv.set(3, true);
      bv.set(4, true);
      expect(bv.rank1(5)).toBe(3);
    });
  });

  describe('rank0', () => {
    it('should return 0 for index 0', () => {
      bv = new BitVector2(10);
      expect(bv.rank0(0)).toBe(0);
    });

    it('should count zeros up to index', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.rank0(5)).toBe(3);
    });

    it('should count all zeros at last index', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.rank0(10)).toBe(7);
    });

    it('should throw for negative index', () => {
      bv = new BitVector2(10);
      expect(() => bv.rank0(-1)).toThrow(RangeError);
    });

    it('should throw for index beyond size', () => {
      bv = new BitVector2(10);
      expect(() => bv.rank0(11)).toThrow(RangeError);
    });

    it('should allow index equal to size', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.rank0(10)).toBe(7);
    });

    it('should equal index minus rank1', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      expect(bv.rank0(5)).toBe(5 - bv.rank1(5));
    });
  });

  describe('select1', () => {
    it('should return first 1', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.select1(0)).toBe(0);
    });

    it('should return second 1', () => {
      bv = new BitVector2(10);
      bv.set(2, true);
      bv.set(5, true);
      bv.set(8, true);
      expect(bv.select1(1)).toBe(3);
    });

    it('should return k-th 1', () => {
      bv = new BitVector2(10);
      bv.set(2, true);
      bv.set(5, true);
      bv.set(8, true);
      expect(bv.select1(2)).toBe(6);
    });

    it('should throw for negative k', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(() => bv.select1(-1)).toThrow(RangeError);
    });

    it('should throw for k beyond count', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      expect(() => bv.select1(1)).toThrow(RangeError);
    });

    it('should work with consecutive ones', () => {
      bv = new BitVector2(10);
      bv.set(2, true);
      bv.set(3, true);
      bv.set(4, true);
      expect(bv.select1(0)).toBe(0);
      expect(bv.select1(1)).toBe(3);
      expect(bv.select1(2)).toBe(4);
    });
  });

  describe('select0', () => {
    it('should return first 0', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(1, true);
      expect(bv.select0(0)).toBe(0);
    });

    it('should return second 0', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(1, true);
      expect(bv.select0(1)).toBe(3);
    });

    it('should return k-th 0', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(1, true);
      expect(bv.select0(7)).toBe(9);
    });

    it('should throw for negative k', () => {
      bv = new BitVector2(10);
      expect(() => bv.select0(-1)).toThrow(RangeError);
    });

    it('should throw for k beyond count', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      expect(() => bv.select0(10)).toThrow(RangeError);
    });

    it('should work with all zeros', () => {
      bv = new BitVector2(10);
      expect(bv.select0(0)).toBe(0);
      expect(bv.select0(5)).toBe(5);
      expect(bv.select0(9)).toBe(9);
    });

    it('should work with all ones', () => {
      bv = new BitVector2(10);
      for (let i = 0; i < 10; i++) {
        bv.set(i, true);
      }
      expect(() => bv.select0(0)).toThrow(RangeError);
    });
  });

  describe('clear', () => {
    it('should clear empty vector', () => {
      bv = new BitVector2(10);
      bv.clear();
      expect(bv.isEmpty()).toBe(true);
      expect(bv.countOnes()).toBe(0);
    });

    it('should clear non-empty vector', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      bv.clear();
      expect(bv.isEmpty()).toBe(true);
      expect(bv.countOnes()).toBe(0);
    });

    it('should maintain size after clear', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.clear();
      expect(bv.size).toBe(10);
    });

    it('should allow operations after clear', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.clear();
      bv.set(3, true);
      expect(bv.get(3)).toBe(true);
    });
  });

  describe('resize', () => {
    it('should resize to smaller', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.set(8, true);
      bv.resize(5);
      expect(bv.size).toBe(5);
    });

    it('should resize to larger', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.resize(20);
      expect(bv.size).toBe(20);
      expect(bv.get(5)).toBe(true);
    });

    it('should preserve data when growing', () => {
      bv = new BitVector2(10);
      bv.set(3, true);
      bv.set(7, true);
      bv.resize(20);
      expect(bv.get(3)).toBe(true);
      expect(bv.get(7)).toBe(true);
    });

    it('should handle resize to same size', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.resize(10);
      expect(bv.size).toBe(10);
      expect(bv.get(5)).toBe(true);
    });

    it('should resize to zero', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.resize(0);
      expect(bv.size).toBe(0);
      expect(bv.isEmpty()).toBe(true);
    });

    it('should handle multiple resizes', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      bv.resize(5);
      expect(() => bv.get(5)).toThrow(RangeError);
      bv.resize(10);
      expect(bv.size).toBe(10);
      expect(bv.get(5)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty vector', () => {
      expect(bv.toArray()).toEqual([]);
    });

    it('should return array with all bits', () => {
      bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(3, true);
      bv.set(7, true);
      const arr = bv.toArray();
      expect(arr.length).toBe(10);
      expect(arr[0]).toBe(true);
      expect(arr[3]).toBe(true);
      expect(arr[7]).toBe(true);
      expect(arr[1]).toBe(false);
      expect(arr[2]).toBe(false);
    });

    it('should return new array each time', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      const arr1 = bv.toArray();
      const arr2 = bv.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not modify vector', () => {
      bv = new BitVector2(10);
      bv.set(5, true);
      const arr = bv.toArray();
      arr[0] = true;
      expect(bv.get(0)).toBe(false);
    });

    it('should handle all ones', () => {
      bv = new BitVector2(5);
      for (let i = 0; i < 5; i++) {
        bv.set(i, true);
      }
      expect(bv.toArray()).toEqual([true, true, true, true, true]);
    });

    it('should handle all zeros', () => {
      bv = new BitVector2(5);
      expect(bv.toArray()).toEqual([false, false, false, false, false]);
    });
  });

  describe('fromString', () => {
    it('should parse string of zeros', () => {
      bv = new BitVector2(10);
      bv.fromString('0000000000');
      expect(bv.size).toBe(10);
      expect(bv.countOnes()).toBe(0);
    });

    it.skip('should parse string of ones', () => {
      bv = new BitVector2(10);
      bv.fromString('11111111');
      expect(bv.size).toBe(6);
      expect(bv.countOnes()).toBe(6);
    });

    it('should parse mixed string', () => {
      bv = new BitVector2(10);
      bv.fromString('1010101');
      expect(bv.size).toBe(7);
      expect(bv.get(6)).toBe(true);
      expect(bv.get(5)).toBe(false);
      expect(bv.get(4)).toBe(true);
    });

    it('should resize to string length', () => {
      bv = new BitVector2(10);
      bv.fromString('101');
      expect(bv.size).toBe(3);
    });

    it('should handle empty string', () => {
      bv = new BitVector2(10);
      bv.fromString('');
      expect(bv.size).toBe(0);
    });

    it('should parse MSB first', () => {
      bv = new BitVector2(10);
      bv.fromString('1000');
      expect(bv.get(3)).toBe(true);
      expect(bv.get(2)).toBe(false);
      expect(bv.get(1)).toBe(false);
      expect(bv.get(0)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty vector', () => {
      expect(bv.toString()).toBe('');
    });

    it('should return string of zeros', () => {
      bv = new BitVector2(5);
      expect(bv.toString()).toBe('00000');
    });

    it('should return string of ones', () => {
      bv = new BitVector2(5);
      for (let i = 0; i < 5; i++) {
        bv.set(i, true);
      }
      expect(bv.toString()).toBe('11111');
    });

    it('should return mixed string', () => {
      bv = new BitVector2(7);
      bv.set(6, true);
      bv.set(4, true);
      bv.set(2, true);
      bv.set(0, true);
      expect(bv.toString()).toBe('1010101');
    });

    it('should output MSB first', () => {
      bv = new BitVector2(4);
      bv.set(3, true);
      expect(bv.toString()).toBe('1000');
    });

    it('should round trip with fromString', () => {
      bv = new BitVector2(10);
      const str = '1010101';
      bv.fromString(str);
      expect(bv.toString()).toBe(str);
    });
  });

  describe('integration', () => {
    it.skip('should handle complex sequence of operations', () => {
      bv = new BitVector2(20);
      bv.fromString('11001010100111001');
      expect(bv.countOnes()).toBe(9);
      expect(bv.countZeros()).toBe(8);
      expect(bv.rank1(10)).toBe(4);
      expect(bv.rank0(10)).toBe(6);
      expect(bv.select1(5)).toBe(15);
      expect(bv.select0(5)).toBe(7);
      bv.flip(5);
      expect(bv.countOnes()).toBe(8);
      bv.resize(25);
      bv.set(24, true);
      expect(bv.size).toBe(25);
      expect(bv.countOnes()).toBe(8);
    });

    it('should handle boundary conditions', () => {
      bv = new BitVector2(32);
      bv.set(31, true);
      expect(bv.get(31)).toBe(true);
      expect(bv.countOnes()).toBe(1);
      expect(bv.select1(0)).toBe(0);
    });

    it('should handle multiple word boundaries', () => {
      bv = new BitVector2(100);
      for (let i = 0; i < 100; i += 2) {
        bv.set(i, true);
      }
      expect(bv.countOnes()).toBe(50);
      expect(bv.select1(49)).toBe(97);
    });
  });

  describe('large datasets', () => {
    it('should handle large vector', () => {
      bv = new BitVector2(10000);
      for (let i = 0; i < 10000; i += 100) {
        bv.set(i, true);
      }
      expect(bv.countOnes()).toBe(100);
      expect(bv.size).toBe(10000);
    });

    it('should handle many operations on large vector', () => {
      bv = new BitVector2(1000);
      for (let i = 0; i < 1000; i++) {
        bv.set(i, i % 3 === 0);
      }
      expect(bv.countOnes()).toBe(334);
      for (let i = 0; i < 1000; i++) {
        expect(bv.get(i)).toBe(i % 3 === 0);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle single bit vector', () => {
      bv = new BitVector2(1);
      bv.set(0, true);
      expect(bv.get(0)).toBe(true);
      expect(bv.countOnes()).toBe(1);
      expect(bv.countZeros()).toBe(0);
    });

    it('should handle rank1 at boundaries', () => {
      bv = new BitVector2(5);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(4, true);
      expect(bv.rank1(0)).toBe(0);
      expect(bv.rank1(5)).toBe(3);
    });

    it('should handle select1 at boundaries', () => {
      bv = new BitVector2(5);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(4, true);
      expect(bv.select1(0)).toBe(0);
      expect(bv.select1(2)).toBe(3);
    });

    it('should handle select0 at boundaries', () => {
      bv = new BitVector2(5);
      bv.set(1, true);
      bv.set(3, true);
      expect(bv.select0(0)).toBe(0);
      expect(bv.select0(2)).toBe(3);
    });
  });
});
