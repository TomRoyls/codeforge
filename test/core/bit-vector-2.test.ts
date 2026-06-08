import { describe, it, expect } from 'vitest';
import { BitVector2 } from './src/core/bit-vector-2/index.js';

describe('BitVector2', () => {
  describe('constructor', () => {
    it('should create empty bit vector with default size', () => {
      const bv = new BitVector2();
      expect(bv.size).toBe(0);
    });

    it('should create bit vector with specified size', () => {
      const bv = new BitVector2(100);
      expect(bv.size).toBe(100);
    });

    it('should initialize all bits to 0', () => {
      const bv = new BitVector2(100);
      expect(bv.isEmpty()).toBe(true);
    });

    it('should handle size 0', () => {
      const bv = new BitVector2(0);
      expect(bv.size).toBe(0);
    });
  });

  describe('set and get', () => {
    it('should set and get bit at index 0', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      expect(bv.get(0)).toBe(true);
    });

    it('should set and get bit at last index', () => {
      const bv = new BitVector2(10);
      bv.set(9, true);
      expect(bv.get(9)).toBe(true);
    });

    it('should set bit to false', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      bv.set(5, false);
      expect(bv.get(5)).toBe(false);
    });

    it('should throw error for negative index', () => {
      const bv = new BitVector2(10);
      expect(() => bv.set(-1, true)).toThrow(RangeError);
      expect(() => bv.get(-1)).toThrow(RangeError);
    });

    it('should throw error for index >= size', () => {
      const bv = new BitVector2(10);
      expect(() => bv.set(10, true)).toThrow(RangeError);
      expect(() => bv.get(10)).toThrow(RangeError);
    });

    it('should handle multiple bits', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      expect(bv.get(0)).toBe(true);
      expect(bv.get(1)).toBe(false);
      expect(bv.get(2)).toBe(true);
      expect(bv.get(5)).toBe(true);
    });
  });

  describe('flip', () => {
    it('should flip 0 to 1', () => {
      const bv = new BitVector2(10);
      bv.flip(5);
      expect(bv.get(5)).toBe(true);
    });

    it('should flip 1 to 0', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      bv.flip(5);
      expect(bv.get(5)).toBe(false);
    });

    it('should flip bit multiple times', () => {
      const bv = new BitVector2(10);
      bv.flip(5);
      expect(bv.get(5)).toBe(true);
      bv.flip(5);
      expect(bv.get(5)).toBe(false);
      bv.flip(5);
      expect(bv.get(5)).toBe(true);
    });

    it('should throw error for invalid index', () => {
      const bv = new BitVector2(10);
      expect(() => bv.flip(-1)).toThrow(RangeError);
      expect(() => bv.flip(10)).toThrow(RangeError);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const bv = new BitVector2(42);
      expect(bv.size).toBe(42);
    });

    it('should return 0 for empty vector', () => {
      const bv = new BitVector2(0);
      expect(bv.size).toBe(0);
    });
  });

  describe('countOnes', () => {
    it('should return 0 for empty vector', () => {
      const bv = new BitVector2(0);
      expect(bv.countOnes()).toBe(0);
    });

    it('should return 0 for all zeros', () => {
      const bv = new BitVector2(100);
      expect(bv.countOnes()).toBe(0);
    });

    it('should count single 1', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.countOnes()).toBe(1);
    });

    it('should count multiple 1s', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      bv.set(9, true);
      expect(bv.countOnes()).toBe(4);
    });

    it('should count all 1s', () => {
      const bv = new BitVector2(10);
      for (let i = 0; i < 10; i++) {
        bv.set(i, true);
      }
      expect(bv.countOnes()).toBe(10);
    });
  });

  describe('popcount', () => {
    it('should be alias for countOnes', () => {
      const bv = new BitVector2(10);
      bv.set(2, true);
      bv.set(5, true);
      expect(bv.popcount()).toBe(bv.countOnes());
    });
  });

  describe('countZeros', () => {
    it('should return 0 for empty vector', () => {
      const bv = new BitVector2(0);
      expect(bv.countZeros()).toBe(0);
    });

    it('should return size for all zeros', () => {
      const bv = new BitVector2(100);
      expect(bv.countZeros()).toBe(100);
    });

    it('should count zeros correctly', () => {
      const bv = new BitVector2(10);
      bv.set(2, true);
      bv.set(5, true);
      expect(bv.countZeros()).toBe(8);
    });

    it('should return 0 for all ones', () => {
      const bv = new BitVector2(10);
      for (let i = 0; i < 10; i++) {
        bv.set(i, true);
      }
      expect(bv.countZeros()).toBe(0);
    });
  });

  describe('rank1', () => {
    it('should return 0 at index 0', () => {
      const bv = new BitVector2(10);
      expect(bv.rank1(0)).toBe(0);
    });

    it('should count 1s correctly', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      expect(bv.rank1(3)).toBe(2);
      expect(bv.rank1(6)).toBe(3);
    });

    it('should work at boundaries', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(9, true);
      expect(bv.rank1(1)).toBe(1);
      expect(bv.rank1(10)).toBe(2);
    });

    it('should throw error for negative index', () => {
      const bv = new BitVector2(10);
      expect(() => bv.rank1(-1)).toThrow(RangeError);
    });

    it('should throw error for index > size', () => {
      const bv = new BitVector2(10);
      expect(() => bv.rank1(11)).toThrow(RangeError);
    });
  });

  describe('rank0', () => {
    it('should return 0 at index 0', () => {
      const bv = new BitVector2(10);
      expect(bv.rank0(0)).toBe(0);
    });

    it('should count 0s correctly', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      expect(bv.rank0(3)).toBe(1);
      expect(bv.rank0(6)).toBe(3);
    });

    it('should work at boundaries', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(9, true);
      expect(bv.rank0(1)).toBe(0);
      expect(bv.rank0(10)).toBe(8);
    });

    it('should throw error for negative index', () => {
      const bv = new BitVector2(10);
      expect(() => bv.rank0(-1)).toThrow(RangeError);
    });

    it('should throw error for index > size', () => {
      const bv = new BitVector2(10);
      expect(() => bv.rank0(11)).toThrow(RangeError);
    });
  });

  describe('select1', () => {
    it('should find first 1', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      expect(bv.select1(0)).toBe(0);
    });

    it('should find kth 1', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      bv.set(9, true);
      expect(bv.select1(0)).toBe(0);
      expect(bv.select1(1)).toBe(2);
      expect(bv.select1(2)).toBe(5);
      expect(bv.select1(3)).toBe(9);
    });

    it('should throw error for negative k', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      expect(() => bv.select1(-1)).toThrow(RangeError);
    });

    it('should throw error for k >= countOnes', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      expect(() => bv.select1(2)).toThrow(RangeError);
    });

    it('should handle large indices', () => {
      const bv = new BitVector2(100);
      bv.set(95, true);
      bv.set(96, true);
      bv.set(97, true);
      expect(bv.select1(0)).toBe(95);
      expect(bv.select1(1)).toBe(96);
      expect(bv.select1(2)).toBe(97);
    });
  });

  describe('select0', () => {
    it('should find first 0', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      expect(bv.select0(0)).toBe(1);
    });

    it('should find kth 0', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      bv.set(9, true);
      expect(bv.select0(0)).toBe(1);
      expect(bv.select0(1)).toBe(3);
      expect(bv.select0(2)).toBe(4);
      expect(bv.select0(3)).toBe(6);
    });

    it('should throw error for negative k', () => {
      const bv = new BitVector2(10);
      expect(() => bv.select0(-1)).toThrow(RangeError);
    });

    it('should throw error for k >= countZeros', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      expect(() => bv.select0(8)).toThrow(RangeError);
    });

    it('should handle all zeros', () => {
      const bv = new BitVector2(5);
      expect(bv.select0(0)).toBe(0);
      expect(bv.select0(4)).toBe(4);
    });

    it('should handle large indices', () => {
      const bv = new BitVector2(100);
      for (let i = 0; i < 95; i++) {
        bv.set(i, true);
      }
      expect(bv.select0(0)).toBe(95);
      expect(bv.select0(1)).toBe(96);
      expect(bv.select0(2)).toBe(97);
      expect(bv.select0(3)).toBe(98);
      expect(bv.select0(4)).toBe(99);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty vector', () => {
      const bv = new BitVector2(0);
      expect(bv.isEmpty()).toBe(true);
    });

    it('should return true for all zeros', () => {
      const bv = new BitVector2(10);
      expect(bv.isEmpty()).toBe(true);
    });

    it('should return false when bit is set', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      expect(bv.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      bv.clear();
      expect(bv.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all bits', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      bv.clear();
      expect(bv.isEmpty()).toBe(true);
      expect(bv.countOnes()).toBe(0);
    });

    it('should handle empty vector', () => {
      const bv = new BitVector2(0);
      bv.clear();
      expect(bv.isEmpty()).toBe(true);
    });
  });

  describe('resize', () => {
    it('should increase size', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      bv.resize(20);
      expect(bv.size).toBe(20);
      expect(bv.get(5)).toBe(true);
    });

    it('should decrease size', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      bv.set(8, true);
      bv.resize(6);
      expect(bv.size).toBe(6);
      expect(bv.get(5)).toBe(true);
    });

    it('should preserve bits when resizing', () => {
      const bv = new BitVector2(20);
      bv.set(5, true);
      bv.set(10, true);
      bv.set(15, true);
      bv.resize(30);
      expect(bv.get(5)).toBe(true);
      expect(bv.get(10)).toBe(true);
      expect(bv.get(15)).toBe(true);
    });

    it('should handle resize to 0', () => {
      const bv = new BitVector2(10);
      bv.set(5, true);
      bv.resize(0);
      expect(bv.size).toBe(0);
    });

    it('should handle resize from 0', () => {
      const bv = new BitVector2(0);
      bv.resize(10);
      expect(bv.size).toBe(10);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty vector', () => {
      const bv = new BitVector2(0);
      expect(bv.toArray()).toEqual([]);
    });

    it('should return correct array', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(5, true);
      const arr = bv.toArray();
      expect(arr).toHaveLength(10);
      expect(arr[0]).toBe(true);
      expect(arr[1]).toBe(false);
      expect(arr[2]).toBe(true);
      expect(arr[5]).toBe(true);
    });

    it('should return all false for cleared vector', () => {
      const bv = new BitVector2(5);
      bv.set(2, true);
      bv.clear();
      const arr = bv.toArray();
      expect(arr).toEqual([false, false, false, false, false]);
    });
  });

  describe('fromString', () => {
    it('should parse binary string', () => {
      const bv = new BitVector2(0);
      bv.fromString('10101');
      expect(bv.size).toBe(5);
      expect(bv.get(0)).toBe(true);
      expect(bv.get(1)).toBe(false);
      expect(bv.get(2)).toBe(true);
      expect(bv.get(3)).toBe(false);
      expect(bv.get(4)).toBe(true);
    });

    it('should handle empty string', () => {
      const bv = new BitVector2(10);
      bv.fromString('');
      expect(bv.size).toBe(0);
    });

    it('should handle all zeros', () => {
      const bv = new BitVector2(0);
      bv.fromString('00000');
      expect(bv.countOnes()).toBe(0);
    });

    it('should handle all ones', () => {
      const bv = new BitVector2(0);
      bv.fromString('11111');
      expect(bv.countOnes()).toBe(5);
    });

    it('should replace existing data', () => {
      const bv = new BitVector2(10);
      bv.set(0, true);
      bv.set(5, true);
      bv.fromString('101');
      expect(bv.size).toBe(3);
      expect(bv.get(0)).toBe(true);
      expect(bv.get(1)).toBe(false);
      expect(bv.get(2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty vector', () => {
      const bv = new BitVector2(0);
      expect(bv.toString()).toBe('');
    });

    it('should convert to binary string', () => {
      const bv = new BitVector2(0);
      bv.fromString('10101');
      expect(bv.toString()).toBe('10101');
    });

    it('should convert correctly', () => {
      const bv = new BitVector2(5);
      bv.set(0, true);
      bv.set(2, true);
      bv.set(4, true);
      expect(bv.toString()).toBe('10101');
    });

    it('should handle all zeros', () => {
      const bv = new BitVector2(5);
      expect(bv.toString()).toBe('00000');
    });

    it('should handle all ones', () => {
      const bv = new BitVector2(5);
      for (let i = 0; i < 5; i++) {
        bv.set(i, true);
      }
      expect(bv.toString()).toBe('11111');
    });
  });

  describe('integration tests', () => {
    it.skip('should handle complex operations', () => {
      const bv = new BitVector2(50);
      bv.fromString('10101010101010101010101010101010101010101010101010101');
      expect(bv.countOnes()).toBe(25);
      expect(bv.countZeros()).toBe(25);
      expect(bv.rank1(10)).toBe(5);
      expect(bv.rank0(10)).toBe(5);
      expect(bv.select1(10)).toBe(20);
      expect(bv.select0(10)).toBe(21);
    });

    it('should handle size boundaries', () => {
      const bv = new BitVector2(100);
      bv.set(0, true);
      bv.set(99, true);
      expect(bv.select1(0)).toBe(0);
      expect(bv.select1(1)).toBe(99);
    });

    it('should maintain consistency across operations', () => {
      const bv = new BitVector2(100);
      for (let i = 0; i < 100; i += 3) {
        bv.set(i, true);
      }
      const ones = bv.countOnes();
      const zeros = bv.countZeros();
      expect(ones + zeros).toBe(100);
      expect(bv.rank1(100)).toBe(ones);
      expect(bv.rank0(100)).toBe(zeros);
    });
  });
});
