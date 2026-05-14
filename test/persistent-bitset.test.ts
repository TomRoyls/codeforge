import { describe, it, expect } from 'vitest';
import { PersistentBitset } from '../src/core/persistent-bitset/index.js';

describe('PersistentBitset', () => {
  describe('create static', () => {
    it('should create empty bitset', () => {
      const bs = PersistentBitset.create();
      expect(bs.size).toBe(0);
      expect(bs.isEmpty).toBe(true);
      expect(bs.count).toBe(0);
    });

    it('should create with size', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(bs.size).toBe(100);
      expect(bs.isEmpty).toBe(true);
    });

    it('should create with bits array', () => {
      const bs = PersistentBitset.create({ bits: [0, 5, 10, 31] });
      expect(bs.size).toBe(32);
      expect(bs.count).toBe(4);
      expect(bs.get(0)).toBe(true);
      expect(bs.get(5)).toBe(true);
      expect(bs.get(10)).toBe(true);
      expect(bs.get(31)).toBe(true);
    });

    it('should create with bits and size', () => {
      const bs = PersistentBitset.create({ bits: [5, 10], size: 50 });
      expect(bs.size).toBe(50);
      expect(bs.get(5)).toBe(true);
      expect(bs.get(10)).toBe(true);
    });

    it('should handle empty bits array', () => {
      const bs = PersistentBitset.create({ bits: [] });
      expect(bs.size).toBe(0);
      expect(bs.isEmpty).toBe(true);
    });

    it('should calculate size from max bit', () => {
      const bs = PersistentBitset.create({ bits: [100] });
      expect(bs.size).toBe(101);
      expect(bs.get(100)).toBe(true);
    });

    it('should use size when larger than max bit', () => {
      const bs = PersistentBitset.create({ bits: [5, 10], size: 50 });
      expect(bs.size).toBe(50);
    });

    it('should throw for negative bit index', () => {
      expect(() => PersistentBitset.create({ bits: [-1] })).toThrow(RangeError);
      expect(() => PersistentBitset.create({ bits: [-5] })).toThrow(RangeError);
    });

    it('should throw for non-integer bit index', () => {
      expect(() => PersistentBitset.create({ bits: [1.5] })).toThrow(RangeError);
      expect(() => PersistentBitset.create({ bits: [1.2] })).toThrow(RangeError);
    });

    it('should handle unsorted bits', () => {
      const bs = PersistentBitset.create({ bits: [10, 0, 5, 15] });
      expect(bs.get(0)).toBe(true);
      expect(bs.get(5)).toBe(true);
      expect(bs.get(10)).toBe(true);
      expect(bs.get(15)).toBe(true);
    });

    it('should handle duplicate bits', () => {
      const bs = PersistentBitset.create({ bits: [5, 5, 10, 5] });
      expect(bs.count).toBe(2);
      expect(bs.get(5)).toBe(true);
      expect(bs.get(10)).toBe(true);
    });
  });

  describe('empty static', () => {
    it('should create empty bitset', () => {
      const bs = PersistentBitset.empty();
      expect(bs.size).toBe(0);
      expect(bs.isEmpty).toBe(true);
      expect(bs.count).toBe(0);
    });

    it('should create new instance each time', () => {
      const bs1 = PersistentBitset.empty();
      const bs2 = PersistentBitset.empty();
      expect(bs1).not.toBe(bs2);
    });
  });

  describe('get', () => {
    it('should return false for unset bit', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(bs.get(5)).toBe(false);
    });

    it('should return true for set bit', () => {
      const bs = PersistentBitset.create({ bits: [5] });
      expect(bs.get(5)).toBe(true);
    });

    it('should return false for out of bounds index', () => {
      const bs = PersistentBitset.create({ size: 10 });
      expect(bs.get(15)).toBe(false);
      expect(bs.get(100)).toBe(false);
    });

    it('should throw for negative index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.get(-1)).toThrow(RangeError);
      expect(() => bs.get(-10)).toThrow(RangeError);
    });

    it('should throw for non-integer index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.get(1.5)).toThrow(RangeError);
      expect(() => bs.get(1.2)).toThrow(RangeError);
    });

    it('should handle bits at word boundaries', () => {
      const bs = PersistentBitset.create({ bits: [31, 32, 33] });
      expect(bs.get(31)).toBe(true);
      expect(bs.get(32)).toBe(true);
      expect(bs.get(33)).toBe(true);
      expect(bs.get(30)).toBe(false);
      expect(bs.get(34)).toBe(false);
    });
  });

  describe('has', () => {
    it('should be alias for get', () => {
      const bs = PersistentBitset.create({ bits: [5] });
      expect(bs.has(5)).toBe(true);
      expect(bs.has(10)).toBe(false);
    });
  });

  describe('set', () => {
    it('should set bit at index', () => {
      const bs = PersistentBitset.create({ size: 100 }).set(5);
      expect(bs.get(5)).toBe(true);
      expect(bs.count).toBe(1);
    });

    it('should return new instance', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      const bs2 = bs1.set(5);
      expect(bs1).not.toBe(bs2);
      expect(bs1.get(5)).toBe(false);
      expect(bs2.get(5)).toBe(true);
    });

    it('should not modify original', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      bs1.set(5);
      expect(bs1.get(5)).toBe(false);
    });

    it('should set multiple bits via chaining', () => {
      const bs = PersistentBitset.create({ size: 100 });
      const result = bs.set(0).set(10).set(50).set(99);
      expect(result.get(0)).toBe(true);
      expect(result.get(10)).toBe(true);
      expect(result.get(50)).toBe(true);
      expect(result.get(99)).toBe(true);
      expect(result.count).toBe(4);
    });

    it('should grow when setting beyond size', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = bs1.set(15);
      expect(bs1.size).toBe(10);
      expect(bs2.size).toBe(16);
      expect(bs2.get(15)).toBe(true);
    });

    it('should update size when setting beyond current', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = bs1.set(20);
      expect(bs2.size).toBe(21);
    });

    it('should throw for negative index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.set(-1)).toThrow(RangeError);
      expect(() => bs.set(-10)).toThrow(RangeError);
    });

    it('should throw for non-integer index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.set(1.5)).toThrow(RangeError);
      expect(() => bs.set(1.2)).toThrow(RangeError);
    });

    it('should handle setting already set bit', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      const bs2 = bs1.set(5);
      expect(bs2.get(5)).toBe(true);
      expect(bs2.count).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear bit at index', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      const bs2 = bs1.clear(5);
      expect(bs1.get(5)).toBe(true);
      expect(bs2.get(5)).toBe(false);
      expect(bs2.count).toBe(0);
    });

    it('should return new instance', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      const bs2 = bs1.clear(5);
      expect(bs1).not.toBe(bs2);
    });

    it('should not modify original', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      bs1.clear(5);
      expect(bs1.get(5)).toBe(true);
    });

    it('should clear multiple bits via chaining', () => {
      const bs = PersistentBitset.create({ bits: [0, 10, 50, 99] });
      const result = bs.clear(10).clear(50);
      expect(result.get(0)).toBe(true);
      expect(result.get(10)).toBe(false);
      expect(result.get(50)).toBe(false);
      expect(result.get(99)).toBe(true);
      expect(result.count).toBe(2);
    });

    it('should return same instance when clearing out of bounds', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      const bs2 = bs1.clear(15);
      expect(bs1).toStrictEqual(bs2);
      expect(bs2.get(5)).toBe(true);
    });

    it('should handle clearing already cleared bit', () => {
      const bs = PersistentBitset.create({ bits: [10] });
      const result = bs.clear(5);
      expect(result.get(5)).toBe(false);
      expect(result.count).toBe(1);
    });

    it('should throw for negative index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.clear(-1)).toThrow(RangeError);
      expect(() => bs.clear(-10)).toThrow(RangeError);
    });

    it('should throw for non-integer index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.clear(1.5)).toThrow(RangeError);
      expect(() => bs.clear(1.2)).toThrow(RangeError);
    });
  });

  describe('toggle', () => {
    it('should toggle bit from false to true', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      const bs2 = bs1.toggle(5);
      expect(bs1.get(5)).toBe(false);
      expect(bs2.get(5)).toBe(true);
      expect(bs2.count).toBe(1);
    });

    it('should toggle bit from true to false', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      const bs2 = bs1.toggle(5);
      expect(bs1.get(5)).toBe(true);
      expect(bs2.get(5)).toBe(false);
      expect(bs2.count).toBe(0);
    });

    it('should return new instance', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      const bs2 = bs1.toggle(5);
      expect(bs1).not.toBe(bs2);
    });

    it('should not modify original', () => {
      const bs1 = PersistentBitset.create({ bits: [5] });
      bs1.toggle(5);
      expect(bs1.get(5)).toBe(true);
    });

    it('should toggle multiple times', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      const bs2 = bs1.toggle(5);
      expect(bs2.get(5)).toBe(true);
      const bs3 = bs2.toggle(5);
      expect(bs3.get(5)).toBe(false);
      const bs4 = bs3.toggle(5);
      expect(bs4.get(5)).toBe(true);
    });

    it('should throw for negative index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.toggle(-1)).toThrow(RangeError);
      expect(() => bs.toggle(-10)).toThrow(RangeError);
    });

    it('should throw for non-integer index', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(() => bs.toggle(1.5)).toThrow(RangeError);
      expect(() => bs.toggle(1.2)).toThrow(RangeError);
    });
  });

  describe('size getter', () => {
    it('should return size from create with size', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(bs.size).toBe(100);
    });

    it('should return calculated size from bits', () => {
      const bs = PersistentBitset.create({ bits: [100] });
      expect(bs.size).toBe(101);
    });

    it('should return 0 for empty bitset', () => {
      const bs = PersistentBitset.empty();
      expect(bs.size).toBe(0);
    });

    it('should be preserved in operations', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      const bs2 = bs1.set(5);
      expect(bs2.size).toBe(100);
    });
  });

  describe('count getter', () => {
    it('should be 0 for empty bitset', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(bs.count).toBe(0);
    });

    it('should count set bits', () => {
      const bs = PersistentBitset.create({ bits: [0, 10, 20, 30] });
      expect(bs.count).toBe(4);
    });

    it('should count after set', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      expect(bs1.count).toBe(0);
      const bs2 = bs1.set(5);
      expect(bs2.count).toBe(1);
      const bs3 = bs2.set(10);
      expect(bs3.count).toBe(2);
    });

    it('should count after clear', () => {
      const bs1 = PersistentBitset.create({ bits: [5, 10] });
      expect(bs1.count).toBe(2);
      const bs2 = bs1.clear(5);
      expect(bs2.count).toBe(1);
    });

    it('should handle many bits', () => {
      const bs = PersistentBitset.create({ size: 100 });
      let result = bs;
      for (let i = 0; i < 50; i++) {
        result = result.set(i);
      }
      expect(result.count).toBe(50);
    });
  });

  describe('isEmpty getter', () => {
    it('should be true for empty bitset', () => {
      const bs = PersistentBitset.create({ size: 100 });
      expect(bs.isEmpty).toBe(true);
    });

    it('should be false after set', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      expect(bs1.isEmpty).toBe(true);
      const bs2 = bs1.set(5);
      expect(bs2.isEmpty).toBe(false);
    });

    it('should be true after clearing all', () => {
      const bs1 = PersistentBitset.create({ bits: [5, 10] });
      expect(bs1.isEmpty).toBe(false);
      const bs2 = bs1.clear(5).clear(10);
      expect(bs2.isEmpty).toBe(true);
    });
  });

  describe('and', () => {
    it('should perform bitwise AND', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const bs2 = PersistentBitset.create({ bits: [0, 1, 2] });
      const result = bs1.and(bs2);
      expect(result.get(0)).toBe(true);
      expect(result.get(1)).toBe(false);
      expect(result.get(2)).toBe(true);
      expect(result.get(4)).toBe(false);
    });

    it('should return new instance', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2] });
      const bs2 = PersistentBitset.create({ bits: [0, 1] });
      const result = bs1.and(bs2);
      expect(result).not.toBe(bs1);
      expect(result).not.toBe(bs2);
    });

    it('should not modify originals', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const bs2 = PersistentBitset.create({ bits: [0, 1, 2] });
      bs1.and(bs2);
      expect(bs1.get(4)).toBe(true);
      expect(bs2.get(1)).toBe(true);
    });

    it('should handle different sizes', () => {
      const bs1 = PersistentBitset.create({ size: 5, bits: [0, 1, 2, 3, 4] });
      const bs2 = PersistentBitset.create({ size: 10, bits: [0, 1, 2] });
      const result = bs1.and(bs2);
      expect(result.count).toBe(3);
    });

    it('should clear bits not in both sets', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 1, 2] });
      const bs2 = PersistentBitset.create({ bits: [3, 4, 5] });
      const result = bs1.and(bs2);
      expect(result.count).toBe(0);
    });

    it('should use max size', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0, 1, 2] });
      const bs2 = PersistentBitset.create({ size: 20, bits: [0, 1, 2] });
      const result = bs1.and(bs2);
      expect(result.size).toBe(20);
    });
  });

  describe('or', () => {
    it('should perform bitwise OR', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const bs2 = PersistentBitset.create({ bits: [0, 1, 2] });
      const result = bs1.or(bs2);
      expect(result.get(0)).toBe(true);
      expect(result.get(1)).toBe(true);
      expect(result.get(2)).toBe(true);
      expect(result.get(4)).toBe(true);
    });

    it('should return new instance', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2] });
      const bs2 = PersistentBitset.create({ bits: [0, 1] });
      const result = bs1.or(bs2);
      expect(result).not.toBe(bs1);
      expect(result).not.toBe(bs2);
    });

    it('should not modify originals', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2] });
      const bs2 = PersistentBitset.create({ bits: [1, 3] });
      bs1.or(bs2);
      expect(bs1.get(1)).toBe(false);
      expect(bs2.get(2)).toBe(false);
    });

    it('should grow when other is larger', () => {
      const bs1 = PersistentBitset.create({ size: 5, bits: [0, 1, 2, 3, 4] });
      const bs2 = PersistentBitset.create({ size: 10, bits: [5, 6, 7, 8, 9] });
      const result = bs1.or(bs2);
      expect(result.size).toBe(10);
      expect(result.count).toBe(10);
    });

    it('should handle both empty sets', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = PersistentBitset.create({ size: 10 });
      const result = bs1.or(bs2);
      expect(result.isEmpty).toBe(true);
    });

    it('should use max size', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0, 1] });
      const bs2 = PersistentBitset.create({ size: 20, bits: [10, 11] });
      const result = bs1.or(bs2);
      expect(result.size).toBe(20);
    });
  });

  describe('xor', () => {
    it('should perform bitwise XOR', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const bs2 = PersistentBitset.create({ bits: [0, 1, 2] });
      const result = bs1.xor(bs2);
      expect(result.get(0)).toBe(false);
      expect(result.get(1)).toBe(true);
      expect(result.get(2)).toBe(false);
      expect(result.get(4)).toBe(true);
    });

    it('should return new instance', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2] });
      const bs2 = PersistentBitset.create({ bits: [0, 1] });
      const result = bs1.xor(bs2);
      expect(result).not.toBe(bs1);
      expect(result).not.toBe(bs2);
    });

    it('should not modify originals', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2] });
      const bs2 = PersistentBitset.create({ bits: [1, 3] });
      bs1.xor(bs2);
      expect(bs1.get(1)).toBe(false);
      expect(bs2.get(2)).toBe(false);
    });

    it('should grow when other is larger', () => {
      const bs1 = PersistentBitset.create({ size: 5, bits: [0, 1] });
      const bs2 = PersistentBitset.create({ size: 10, bits: [5, 6, 7, 8, 9] });
      const result = bs1.xor(bs2);
      expect(result.size).toBe(10);
      expect(result.count).toBe(7);
    });

    it('should handle both empty sets', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = PersistentBitset.create({ size: 10 });
      const result = bs1.xor(bs2);
      expect(result.isEmpty).toBe(true);
    });

    it('should handle same bits', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 1, 2] });
      const bs2 = PersistentBitset.create({ bits: [0, 1, 2] });
      const result = bs1.xor(bs2);
      expect(result.isEmpty).toBe(true);
    });

    it('should use max size', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0, 1] });
      const bs2 = PersistentBitset.create({ size: 20, bits: [10, 11] });
      const result = bs1.xor(bs2);
      expect(result.size).toBe(20);
    });
  });

  describe('not', () => {
    it('should return new set with flipped bits', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0, 2, 4] });
      const bs2 = bs1.not();
      expect(bs1.get(0)).toBe(true);
      expect(bs2.get(0)).toBe(false);
      expect(bs2.get(1)).toBe(true);
      expect(bs2.get(2)).toBe(false);
      expect(bs2.get(3)).toBe(true);
      expect(bs2.get(4)).toBe(false);
    });

    it('should not modify original', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const count1 = bs1.count;
      bs1.not();
      expect(bs1.count).toBe(count1);
    });

    it('should return new instance', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = bs1.not();
      expect(bs2).not.toBe(bs1);
    });

    it('should handle size not multiple of 32', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0, 2, 4, 6, 8] });
      const bs2 = bs1.not();
      expect(bs2.count).toBe(5);
      expect(bs2.get(9)).toBe(true);
    });

    it('should handle empty set with size', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = bs1.not();
      expect(bs2.count).toBe(10);
    });

    it('should preserve size', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0, 2, 4] });
      const bs2 = bs1.not();
      expect(bs2.size).toBe(10);
    });
  });

  describe('equals', () => {
    it('should return true for identical sets', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const bs2 = PersistentBitset.create({ bits: [0, 2, 4] });
      expect(bs1.equals(bs2)).toBe(true);
    });

    it('should return false for different sets', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2] });
      const bs2 = PersistentBitset.create({ bits: [0, 1] });
      expect(bs1.equals(bs2)).toBe(false);
    });

    it('should return true for empty sets', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = PersistentBitset.create({ size: 10 });
      expect(bs1.equals(bs2)).toBe(true);
    });

    it('should return true for different sizes with same bits', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0, 1, 2] });
      const bs2 = PersistentBitset.create({ size: 20, bits: [0, 1, 2] });
      expect(bs1.equals(bs2)).toBe(true);
    });

    it('should handle same size different content', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [0] });
      const bs2 = PersistentBitset.create({ size: 10, bits: [1] });
      expect(bs1.equals(bs2)).toBe(false);
    });

    it('should compare beyond size', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 1, 2] });
      const bs2 = PersistentBitset.create({ size: 10, bits: [0, 1, 2] });
      expect(bs1.equals(bs2)).toBe(true);
    });
  });

  describe('intersects', () => {
    it('should return true for intersecting sets', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const bs2 = PersistentBitset.create({ bits: [0, 1, 2] });
      expect(bs1.intersects(bs2)).toBe(true);
    });

    it('should return false for disjoint sets', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 1, 2] });
      const bs2 = PersistentBitset.create({ bits: [3, 4, 5] });
      expect(bs1.intersects(bs2)).toBe(false);
    });

    it('should return true when one is subset', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 1, 2] });
      const bs2 = PersistentBitset.create({ bits: [0] });
      expect(bs1.intersects(bs2)).toBe(true);
    });

    it('should return false for empty sets', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = PersistentBitset.create({ size: 10 });
      expect(bs1.intersects(bs2)).toBe(false);
    });

    it('should handle different sizes', () => {
      const bs1 = PersistentBitset.create({ size: 5, bits: [0] });
      const bs2 = PersistentBitset.create({ size: 10, bits: [0] });
      expect(bs1.intersects(bs2)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      const bs = PersistentBitset.create({ size: 10 });
      expect(bs.toArray()).toEqual([]);
    });

    it('should return array with set indices', () => {
      const bs = PersistentBitset.create({ bits: [0, 2, 5, 9] });
      expect(bs.toArray()).toEqual([0, 2, 5, 9]);
    });

    it('should return sorted indices', () => {
      const bs = PersistentBitset.create({ bits: [50, 10, 90, 5] });
      expect(bs.toArray()).toEqual([5, 10, 50, 90]);
    });

    it('should return new array each call', () => {
      const bs = PersistentBitset.create({ bits: [0, 2] });
      const arr1 = bs.toArray();
      const arr2 = bs.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not be affected by array modification', () => {
      const bs = PersistentBitset.create({ bits: [0, 2] });
      const arr = bs.toArray();
      arr.push(5);
      expect(bs.toArray()).toEqual([0, 2]);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty set', () => {
      const bs = PersistentBitset.empty();
      expect(bs.toString()).toBe('');
    });

    it('should return binary representation', () => {
      const bs = PersistentBitset.create({ size: 8, bits: [0, 2, 4, 6] });
      expect(bs.toString()).toBe('10101010');
    });

    it('should handle multiple words', () => {
      const bs = PersistentBitset.create({ bits: [0, 31, 32, 63] });
      const str = bs.toString();
      expect(str.length).toBe(64);
      expect(str[0]).toBe('1');
      expect(str[31]).toBe('1');
      expect(str[32]).toBe('1');
      expect(str[63]).toBe('1');
    });

    it('should handle size not multiple of 32', () => {
      const bs = PersistentBitset.create({ size: 10, bits: [0, 5, 9] });
      expect(bs.toString()).toBe('1000010001');
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [5] });
      const bs2 = bs1.clone();
      expect(bs2.get(5)).toBe(true);
      expect(bs2.count).toBe(1);
    });

    it('should not modify original', () => {
      const bs1 = PersistentBitset.create({ size: 10, bits: [5] });
      const bs2 = bs1.clone();
      const bs3 = bs2.set(10);
      expect(bs1.get(10)).toBe(false);
      expect(bs2.get(10)).toBe(false);
      expect(bs3.get(10)).toBe(true);
    });

    it('should copy size', () => {
      const bs1 = PersistentBitset.create({ size: 100 });
      const bs2 = bs1.clone();
      expect(bs2.size).toBe(100);
    });

    it('should copy all bits', () => {
      const bs1 = PersistentBitset.create({ bits: [5, 10, 15] });
      const bs2 = bs1.clone();
      expect(bs2.get(5)).toBe(true);
      expect(bs2.get(10)).toBe(true);
      expect(bs2.get(15)).toBe(true);
      expect(bs2.count).toBe(3);
    });

    it('should create new instance', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = bs1.clone();
      expect(bs2).not.toBe(bs1);
    });
  });

  describe('iterator', () => {
    it('should iterate over set indices only', () => {
      const bs = PersistentBitset.create({ bits: [0, 2, 5, 9] });
      const results: number[] = [];
      for (const index of bs) {
        results.push(index);
      }
      expect(results).toEqual([0, 2, 5, 9]);
    });

    it('should return empty for empty set', () => {
      const bs = PersistentBitset.create({ size: 10 });
      const results: number[] = [];
      for (const index of bs) {
        results.push(index);
      }
      expect(results).toEqual([]);
    });

    it('should support spread operator', () => {
      const bs = PersistentBitset.create({ bits: [0, 2, 5] });
      expect([...bs]).toEqual([0, 2, 5]);
    });

    it('should be sorted', () => {
      const bs = PersistentBitset.create({ bits: [50, 10, 90, 5] });
      const results = [...bs];
      expect(results).toEqual([5, 10, 50, 90]);
    });

    it('should handle many bits', () => {
      const bs = PersistentBitset.create({ size: 100 });
      let result = bs;
      for (let i = 0; i < 50; i++) {
        result = result.set(i);
      }
      const results = [...result];
      expect(results.length).toBe(50);
      expect(results[0]).toBe(0);
      expect(results[49]).toBe(49);
    });

    it('should handle bits across word boundaries', () => {
      const bs = PersistentBitset.create({ bits: [30, 31, 32, 33] });
      const results = [...bs];
      expect(results).toEqual([30, 31, 32, 33]);
    });
  });

  describe('complex operations', () => {
    it('should handle multiple bitwise operations', () => {
      const bs1 = PersistentBitset.create({ bits: [0, 2, 4] });
      const bs2 = PersistentBitset.create({ bits: [0, 1, 2] });
      const bs3 = PersistentBitset.create({ bits: [1, 3, 5] });
      const result = bs1.and(bs2).or(bs3);
      expect(result.get(0)).toBe(true);
      expect(result.get(1)).toBe(true);
      expect(result.get(2)).toBe(true);
      expect(result.get(3)).toBe(true);
      expect(result.get(4)).toBe(false);
      expect(result.get(5)).toBe(true);
    });

    it('should handle growth in operations', () => {
      const bs1 = PersistentBitset.create({ size: 10 });
      const bs2 = PersistentBitset.create({ size: 20, bits: [15] });
      const result = bs1.or(bs2);
      expect(result.size).toBe(20);
      expect(result.get(15)).toBe(true);
    });

    it('should handle chained operations', () => {
      const bs = PersistentBitset.create({ size: 100 });
      const result = bs.set(5).set(10).clear(5).toggle(20).not();
      expect(result.get(5)).toBe(true);
      expect(result.get(10)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle size 0', () => {
      const bs = PersistentBitset.create({ size: 0 });
      expect(bs.size).toBe(0);
      expect(bs.isEmpty).toBe(true);
      expect(bs.toArray()).toEqual([]);
      expect(bs.count).toBe(0);
    });

    it('should handle size exactly multiple of 32', () => {
      const bs = PersistentBitset.create({ size: 32, bits: [0, 15, 31] });
      expect(bs.size).toBe(32);
      expect(bs.count).toBe(3);
      expect(bs.get(31)).toBe(true);
    });

    it('should handle size just under multiple of 32', () => {
      const bs = PersistentBitset.create({ size: 31, bits: [0, 15, 30] });
      expect(bs.size).toBe(31);
      expect(bs.count).toBe(3);
      expect(bs.get(30)).toBe(true);
    });

    it('should handle size just over multiple of 32', () => {
      const bs = PersistentBitset.create({ size: 33, bits: [0, 16, 32] });
      expect(bs.size).toBe(33);
      expect(bs.count).toBe(3);
      expect(bs.get(32)).toBe(true);
    });

    it('should handle many operations', () => {
      const bs = PersistentBitset.create({ size: 1000 });
      let result = bs;
      for (let i = 0; i < 500; i++) {
        result = result.set(i * 2);
      }
      expect(result.count).toBe(500);
      for (let i = 0; i < 500; i++) {
        result = result.clear(i * 2);
      }
      expect(result.isEmpty).toBe(true);
    });

    it('should handle bit at exact size boundary', () => {
      const bs = PersistentBitset.create({ size: 64 });
      const result = bs.set(63);
      expect(result.get(63)).toBe(true);
      expect(result.size).toBe(64);
    });
  });
});
