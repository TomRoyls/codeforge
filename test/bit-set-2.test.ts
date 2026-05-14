import { describe, it, expect, beforeEach } from 'vitest';
import { BitSet2, DEFAULT_BITSET_OPTIONS } from '../src/core/bit-set-2/index.js';

describe('BitSet2', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const bs = new BitSet2();
      expect(bs.size).toBe(DEFAULT_BITSET_OPTIONS.size);
      expect(bs.isEmpty).toBe(true);
    });

    it('should create with size', () => {
      const bs = new BitSet2(100);
      expect(bs.size).toBe(100);
      expect(bs.isEmpty).toBe(true);
    });

    it('should create with options', () => {
      const bs = new BitSet2({ size: 50, growable: false });
      expect(bs.size).toBe(50);
      expect(bs.isEmpty).toBe(true);
    });

    it('should create with growable option only', () => {
      const bs = new BitSet2({ growable: false });
      expect(bs.size).toBe(DEFAULT_BITSET_OPTIONS.size);
    });

    it('should throw for negative size', () => {
      expect(() => new BitSet2(-1)).toThrow('Size must be non-negative');
      expect(() => new BitSet2({ size: -10 })).toThrow('Size must be non-negative');
    });

    it('should throw for non-integer size', () => {
      expect(() => new BitSet2(1.5)).toThrow('Size must be an integer');
      expect(() => new BitSet2({ size: 10.7 })).toThrow('Size must be an integer');
    });

    it('should handle zero size', () => {
      const bs = new BitSet2(0);
      expect(bs.size).toBe(0);
      expect(bs.isEmpty).toBe(true);
    });
  });

  describe('set', () => {
    it('should set bit at index', () => {
      const bs = new BitSet2(100);
      bs.set(5);
      expect(bs.get(5)).toBe(true);
      expect(bs.count).toBe(1);
    });

    it('should return this for chaining', () => {
      const bs = new BitSet2(100);
      const result = bs.set(1).set(2).set(3);
      expect(result).toBe(bs);
    });

    it('should set multiple bits', () => {
      const bs = new BitSet2(100);
      bs.set(0).set(10).set(50).set(99);
      expect(bs.get(0)).toBe(true);
      expect(bs.get(10)).toBe(true);
      expect(bs.get(50)).toBe(true);
      expect(bs.get(99)).toBe(true);
      expect(bs.count).toBe(4);
    });

    it('should grow when setting beyond size', () => {
      const bs = new BitSet2(10);
      bs.set(15);
      expect(bs.size).toBe(16);
      expect(bs.get(15)).toBe(true);
    });

    it('should not grow when growable is false', () => {
      const bs = new BitSet2({ size: 10, growable: false });
      expect(() => bs.set(15)).toThrow('Index 15 out of bounds');
    });

    it('should throw for negative index', () => {
      const bs = new BitSet2();
      expect(() => bs.set(-1)).toThrow('Index must be a non-negative integer');
    });

    it('should throw for non-integer index', () => {
      const bs = new BitSet2();
      expect(() => bs.set(1.5)).toThrow('Index must be a non-negative integer');
    });
  });

  describe('clear', () => {
    it('should clear bit at index', () => {
      const bs = new BitSet2(100);
      bs.set(5);
      expect(bs.get(5)).toBe(true);
      bs.clear(5);
      expect(bs.get(5)).toBe(false);
      expect(bs.count).toBe(0);
    });

    it('should return this for chaining', () => {
      const bs = new BitSet2(100);
      bs.set(1).set(2).set(3);
      const result = bs.clear(1).clear(2).clear(3);
      expect(result).toBe(bs);
    });

    it('should clear multiple bits', () => {
      const bs = new BitSet2(100);
      bs.set(0).set(10).set(50).set(99);
      bs.clear(10).clear(50);
      expect(bs.get(0)).toBe(true);
      expect(bs.get(10)).toBe(false);
      expect(bs.get(50)).toBe(false);
      expect(bs.get(99)).toBe(true);
      expect(bs.count).toBe(2);
    });

    it('should not affect already cleared bits', () => {
      const bs = new BitSet2(100);
      bs.clear(5);
      expect(bs.get(5)).toBe(false);
      expect(bs.count).toBe(0);
    });

    it('should handle out of bounds index gracefully', () => {
      const bs = new BitSet2(10);
      bs.set(5);
      bs.clear(15);
      expect(bs.get(5)).toBe(true);
      expect(bs.size).toBe(10);
    });

    it('should handle negative index gracefully', () => {
      const bs = new BitSet2(100);
      bs.set(5);
      bs.clear(-1);
      expect(bs.get(5)).toBe(true);
    });

    it('should handle non-integer index gracefully', () => {
      const bs = new BitSet2(100);
      bs.set(5);
      bs.clear(1.5);
      expect(bs.get(5)).toBe(true);
    });
  });

  describe('toggle', () => {
    it('should toggle bit from false to true', () => {
      const bs = new BitSet2(100);
      bs.toggle(5);
      expect(bs.get(5)).toBe(true);
      expect(bs.count).toBe(1);
    });

    it('should toggle bit from true to false', () => {
      const bs = new BitSet2(100);
      bs.set(5);
      bs.toggle(5);
      expect(bs.get(5)).toBe(false);
      expect(bs.count).toBe(0);
    });

    it('should return this for chaining', () => {
      const bs = new BitSet2(100);
      const result = bs.toggle(1).toggle(2).toggle(3);
      expect(result).toBe(bs);
    });

    it('should toggle multiple times', () => {
      const bs = new BitSet2(100);
      bs.toggle(5);
      expect(bs.get(5)).toBe(true);
      bs.toggle(5);
      expect(bs.get(5)).toBe(false);
      bs.toggle(5);
      expect(bs.get(5)).toBe(true);
    });

    it('should grow when toggling beyond size', () => {
      const bs = new BitSet2(10);
      bs.toggle(15);
      expect(bs.size).toBe(16);
      expect(bs.get(15)).toBe(true);
    });

    it('should throw for negative index', () => {
      const bs = new BitSet2();
      expect(() => bs.toggle(-1)).toThrow('Index must be a non-negative integer');
    });

    it('should throw for non-integer index', () => {
      const bs = new BitSet2();
      expect(() => bs.toggle(1.5)).toThrow('Index must be a non-negative integer');
    });
  });

  describe('get', () => {
    it('should return false for unset bit', () => {
      const bs = new BitSet2(100);
      expect(bs.get(5)).toBe(false);
    });

    it('should return true for set bit', () => {
      const bs = new BitSet2(100);
      bs.set(5);
      expect(bs.get(5)).toBe(true);
    });

    it('should return false for out of bounds index', () => {
      const bs = new BitSet2(10);
      expect(bs.get(15)).toBe(false);
      expect(bs.get(100)).toBe(false);
    });

    it('should return false for negative index', () => {
      const bs = new BitSet2(100);
      expect(bs.get(-1)).toBe(false);
    });

    it('should return false for non-integer index', () => {
      const bs = new BitSet2(100);
      expect(bs.get(1.5)).toBe(false);
    });

    it('should work with bits at word boundaries', () => {
      const bs = new BitSet2(100);
      bs.set(31).set(32).set(33);
      expect(bs.get(31)).toBe(true);
      expect(bs.get(32)).toBe(true);
      expect(bs.get(33)).toBe(true);
      expect(bs.get(30)).toBe(false);
      expect(bs.get(34)).toBe(false);
    });
  });

  describe('flip', () => {
    it('should flip all bits', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(4);
      bs.flip();
      expect(bs.get(0)).toBe(false);
      expect(bs.get(1)).toBe(true);
      expect(bs.get(2)).toBe(false);
      expect(bs.get(3)).toBe(true);
      expect(bs.get(4)).toBe(false);
      expect(bs.get(5)).toBe(true);
    });

    it('should return this for chaining', () => {
      const bs = new BitSet2(10);
      const result = bs.flip();
      expect(result).toBe(bs);
    });

    it('should flip empty set', () => {
      const bs = new BitSet2(10);
      bs.flip();
      expect(bs.count).toBe(10);
    });

    it('should flip full set', () => {
      const bs = new BitSet2(10);
      bs.setAll();
      bs.flip();
      expect(bs.count).toBe(0);
    });

    it('should handle size not multiple of 32', () => {
      const bs = new BitSet2(10);
      bs.setAll();
      bs.flip();
      expect(bs.count).toBe(0);
    });
  });

  describe('and', () => {
    it('should perform bitwise AND', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      bs2.set(0).set(1).set(2);
      bs1.and(bs2);
      expect(bs1.get(0)).toBe(true);
      expect(bs1.get(1)).toBe(false);
      expect(bs1.get(2)).toBe(true);
      expect(bs1.get(4)).toBe(false);
    });

    it('should return this for chaining', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      const result = bs1.and(bs2);
      expect(result).toBe(bs1);
    });

    it('should handle different sizes', () => {
      const bs1 = new BitSet2(5);
      const bs2 = new BitSet2(10);
      bs1.setAll();
      bs2.setAll();
      bs1.and(bs2);
      expect(bs1.count).toBe(5);
    });

    it('should clear bits not in both sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.setAll();
      bs1.and(bs2);
      expect(bs1.count).toBe(0);
    });
  });

  describe('or', () => {
    it('should perform bitwise OR', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      bs2.set(0).set(1).set(2);
      bs1.or(bs2);
      expect(bs1.get(0)).toBe(true);
      expect(bs1.get(1)).toBe(true);
      expect(bs1.get(2)).toBe(true);
      expect(bs1.get(4)).toBe(true);
    });

    it('should return this for chaining', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      const result = bs1.or(bs2);
      expect(result).toBe(bs1);
    });

    it('should grow when other is larger', () => {
      const bs1 = new BitSet2(5);
      const bs2 = new BitSet2(10);
      bs2.setAll();
      bs1.or(bs2);
      expect(bs1.size).toBe(10);
      expect(bs1.count).toBe(10);
    });

    it('should handle both empty sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.or(bs2);
      expect(bs1.isEmpty).toBe(true);
    });
  });

  describe('xor', () => {
    it('should perform bitwise XOR', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      bs2.set(0).set(1).set(2);
      bs1.xor(bs2);
      expect(bs1.get(0)).toBe(false);
      expect(bs1.get(1)).toBe(true);
      expect(bs1.get(2)).toBe(false);
      expect(bs1.get(4)).toBe(true);
    });

    it('should return this for chaining', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      const result = bs1.xor(bs2);
      expect(result).toBe(bs1);
    });

    it('should grow when other is larger', () => {
      const bs1 = new BitSet2(5);
      const bs2 = new BitSet2(10);
      bs2.setAll();
      bs1.xor(bs2);
      expect(bs1.size).toBe(10);
      expect(bs1.count).toBe(10);
    });

    it('should handle both empty sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.xor(bs2);
      expect(bs1.isEmpty).toBe(true);
    });

    it('should handle same bits', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(1).set(2);
      bs2.set(0).set(1).set(2);
      bs1.xor(bs2);
      expect(bs1.isEmpty).toBe(true);
    });
  });

  describe('not', () => {
    it('should return new set with flipped bits', () => {
      const bs1 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      const bs2 = bs1.not();
      expect(bs1.get(0)).toBe(true);
      expect(bs2.get(0)).toBe(false);
      expect(bs2.get(1)).toBe(true);
      expect(bs2.get(2)).toBe(false);
    });

    it('should not modify original', () => {
      const bs1 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      const count1 = bs1.count;
      bs1.not();
      expect(bs1.count).toBe(count1);
    });

    it('should return new instance', () => {
      const bs1 = new BitSet2(10);
      const bs2 = bs1.not();
      expect(bs2).not.toBe(bs1);
    });
  });

  describe('nand', () => {
    it('should perform bitwise NAND', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.setAll();
      bs2.set(0).set(1).set(2);
      bs1.nand(bs2);
      expect(bs1.get(0)).toBe(false);
      expect(bs1.get(1)).toBe(false);
      expect(bs1.get(2)).toBe(false);
      expect(bs1.get(3)).toBe(true);
    });

    it('should return this for chaining', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      const result = bs1.nand(bs2);
      expect(result).toBe(bs1);
    });
  });

  describe('nor', () => {
    it('should perform bitwise NOR', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(1).set(2);
      bs2.set(0).set(1).set(2);
      bs1.nor(bs2);
      expect(bs1.get(0)).toBe(false);
      expect(bs1.get(1)).toBe(false);
      expect(bs1.get(2)).toBe(false);
      expect(bs1.get(3)).toBe(true);
    });

    it('should return this for chaining', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      const result = bs1.nor(bs2);
      expect(result).toBe(bs1);
    });
  });

  describe('size getter', () => {
    it('should return size from constructor', () => {
      const bs = new BitSet2(100);
      expect(bs.size).toBe(100);
    });

    it('should return default size', () => {
      const bs = new BitSet2();
      expect(bs.size).toBe(DEFAULT_BITSET_OPTIONS.size);
    });

    it('should update when grown', () => {
      const bs = new BitSet2(10);
      bs.set(15);
      expect(bs.size).toBe(16);
    });

    it('should be a number', () => {
      const bs = new BitSet2();
      expect(typeof bs.size).toBe('number');
    });
  });

  describe('count getter', () => {
    it('should be 0 for new set', () => {
      const bs = new BitSet2();
      expect(bs.count).toBe(0);
    });

    it('should count set bits', () => {
      const bs = new BitSet2(100);
      bs.set(0).set(10).set(20).set(30);
      expect(bs.count).toBe(4);
    });

    it('should update after set', () => {
      const bs = new BitSet2(100);
      expect(bs.count).toBe(0);
      bs.set(5);
      expect(bs.count).toBe(1);
      bs.set(10);
      expect(bs.count).toBe(2);
    });

    it('should update after clear', () => {
      const bs = new BitSet2(100);
      bs.set(5).set(10);
      expect(bs.count).toBe(2);
      bs.clear(5);
      expect(bs.count).toBe(1);
    });

    it('should count correctly after flip', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(4);
      bs.flip();
      expect(bs.count).toBe(7);
    });

    it('should be a number', () => {
      const bs = new BitSet2();
      expect(typeof bs.count).toBe('number');
    });
  });

  describe('isEmpty getter', () => {
    it('should be true for new set', () => {
      const bs = new BitSet2();
      expect(bs.isEmpty).toBe(true);
    });

    it('should be false after set', () => {
      const bs = new BitSet2();
      bs.set(5);
      expect(bs.isEmpty).toBe(false);
    });

    it('should be true after clearing all', () => {
      const bs = new BitSet2();
      bs.set(5).set(10);
      bs.clearAll();
      expect(bs.isEmpty).toBe(true);
    });

    it('should be a boolean', () => {
      const bs = new BitSet2();
      expect(typeof bs.isEmpty).toBe('boolean');
    });
  });

  describe('setAll', () => {
    it('should set all bits', () => {
      const bs = new BitSet2(10);
      bs.setAll();
      expect(bs.count).toBe(10);
      expect(bs.isEmpty).toBe(false);
    });

    it('should return this for chaining', () => {
      const bs = new BitSet2(10);
      const result = bs.setAll();
      expect(result).toBe(bs);
    });

    it('should handle size not multiple of 32', () => {
      const bs = new BitSet2(10);
      bs.setAll();
      expect(bs.count).toBe(10);
      expect(bs.get(9)).toBe(true);
      expect(bs.get(10)).toBe(false);
    });

    it('should work on empty set', () => {
      const bs = new BitSet2(0);
      bs.setAll();
      expect(bs.count).toBe(32);
    });
  });

  describe('clearAll', () => {
    it('should clear all bits', () => {
      const bs = new BitSet2(10);
      bs.setAll();
      expect(bs.isEmpty).toBe(false);
      bs.clearAll();
      expect(bs.isEmpty).toBe(true);
      expect(bs.count).toBe(0);
    });

    it('should return this for chaining', () => {
      const bs = new BitSet2(10);
      const result = bs.clearAll();
      expect(result).toBe(bs);
    });

    it('should work on already empty set', () => {
      const bs = new BitSet2(10);
      bs.clearAll();
      expect(bs.isEmpty).toBe(true);
      expect(bs.count).toBe(0);
    });

    it('should allow operations after clearAll', () => {
      const bs = new BitSet2(10);
      bs.setAll();
      bs.clearAll();
      bs.set(5);
      expect(bs.count).toBe(1);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const bs1 = new BitSet2(10);
      bs1.set(5);
      const bs2 = bs1.clone();
      expect(bs2.get(5)).toBe(true);
      expect(bs2.count).toBe(1);
    });

    it('should not modify original', () => {
      const bs1 = new BitSet2(10);
      bs1.set(5);
      const bs2 = bs1.clone();
      bs2.set(10);
      expect(bs1.get(10)).toBe(false);
      expect(bs2.get(10)).toBe(true);
    });

    it('should copy size', () => {
      const bs1 = new BitSet2(100);
      const bs2 = bs1.clone();
      expect(bs2.size).toBe(100);
    });

    it('should copy growable flag', () => {
      const bs1 = new BitSet2({ size: 10, growable: false });
      const bs2 = bs1.clone();
      expect(() => bs2.set(20)).toThrow();
    });

    it('should create new instance', () => {
      const bs1 = new BitSet2(10);
      const bs2 = bs1.clone();
      expect(bs2).not.toBe(bs1);
    });
  });

  describe('equals', () => {
    it('should return true for identical sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      bs2.set(0).set(2).set(4);
      expect(bs1.equals(bs2)).toBe(true);
    });

    it('should return false for different sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(2);
      bs2.set(0).set(1);
      expect(bs1.equals(bs2)).toBe(false);
    });

    it('should return false for different sizes', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(20);
      bs1.setAll();
      bs2.setAll();
      expect(bs1.equals(bs2)).toBe(false);
    });

    it('should return true for empty sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      expect(bs1.equals(bs2)).toBe(true);
    });

    it('should handle same size different content', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0);
      bs2.set(1);
      expect(bs1.equals(bs2)).toBe(false);
    });
  });

  describe('intersects', () => {
    it('should return true for intersecting sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      bs2.set(0).set(1).set(2);
      expect(bs1.intersects(bs2)).toBe(true);
    });

    it('should return false for disjoint sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(1).set(2);
      bs2.set(3).set(4).set(5);
      expect(bs1.intersects(bs2)).toBe(false);
    });

    it('should return true when one is subset', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      bs1.set(0).set(1).set(2);
      bs2.set(0);
      expect(bs1.intersects(bs2)).toBe(true);
    });

    it('should return false for empty sets', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      expect(bs1.intersects(bs2)).toBe(false);
    });

    it('should handle different sizes', () => {
      const bs1 = new BitSet2(5);
      const bs2 = new BitSet2(10);
      bs1.set(0);
      bs2.set(0);
      expect(bs1.intersects(bs2)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      const bs = new BitSet2(10);
      expect(bs.toArray()).toEqual([]);
    });

    it('should return array with set indices', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5).set(9);
      expect(bs.toArray()).toEqual([0, 2, 5, 9]);
    });

    it('should return sorted indices', () => {
      const bs = new BitSet2(100);
      bs.set(50).set(10).set(90).set(5);
      expect(bs.toArray()).toEqual([5, 10, 50, 90]);
    });

    it('should not modify set', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2);
      const arr = bs.toArray();
      arr.push(5);
      expect(bs.toArray()).toEqual([0, 2]);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty set', () => {
      const bs = new BitSet2(10);
      expect(bs.toString()).toBe('0000000000');
    });

    it('should return binary representation', () => {
      const bs = new BitSet2(8);
      bs.set(0).set(2).set(4).set(6);
      expect(bs.toString()).toBe('01010101');
    });

    it('should handle multiple words', () => {
      const bs = new BitSet2(64);
      bs.set(0).set(31).set(32).set(63);
      const str = bs.toString();
      expect(str.length).toBe(64);
      expect(str[0]).toBe('1');
      expect(str[31]).toBe('1');
      expect(str[32]).toBe('1');
      expect(str[63]).toBe('1');
    });
  });

  describe('forEach', () => {
    it('should iterate over empty set', () => {
      const bs = new BitSet2(0);
      const results: [number, boolean][] = [];
      bs.forEach((index, value) => results.push([index, value]));
      expect(results).toEqual([]);
    });

    it('should iterate over all indices', () => {
      const bs = new BitSet2(5);
      bs.set(0).set(2).set(4);
      const results: [number, boolean][] = [];
      bs.forEach((index, value) => results.push([index, value]));
      expect(results.length).toBe(5);
    });

    it('should provide correct values', () => {
      const bs = new BitSet2(5);
      bs.set(0).set(2).set(4);
      const values: boolean[] = [];
      bs.forEach((index, value) => values.push(value));
      expect(values).toEqual([true, false, true, false, true]);
    });

    it('should provide correct indices', () => {
      const bs = new BitSet2(5);
      const indices: number[] = [];
      bs.forEach((index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    it('should not modify set', () => {
      const bs = new BitSet2(5);
      bs.set(0).set(2);
      bs.forEach(() => {});
      expect(bs.toArray()).toEqual([0, 2]);
    });
  });

  describe('iterator', () => {
    it('should iterate over set indices only', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5).set(9);
      const results: number[] = [];
      for (const index of bs) {
        results.push(index);
      }
      expect(results).toEqual([0, 2, 5, 9]);
    });

    it('should return empty for empty set', () => {
      const bs = new BitSet2(10);
      const results: number[] = [];
      for (const index of bs) {
        results.push(index);
      }
      expect(results).toEqual([]);
    });

    it('should work with spread', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      expect([...bs]).toEqual([0, 2, 5]);
    });

    it('should be sorted', () => {
      const bs = new BitSet2(100);
      bs.set(50).set(10).set(90).set(5);
      const results = [...bs];
      expect(results).toEqual([5, 10, 50, 90]);
    });
  });

  describe('range', () => {
    it('should return subset within range', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5).set(8);
      const result = bs.range(2, 6);
      expect(result.toArray()).toEqual([0, 3]);
    });

    it('should handle range at start', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      const result = bs.range(0, 3);
      expect(result.toArray()).toEqual([0, 2]);
    });

    it('should handle range at end', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5).set(9);
      const result = bs.range(5, 10);
      expect(result.toArray()).toEqual([0, 4]);
    });

    it('should return empty for invalid range', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      const result = bs.range(5, 2);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('should return empty for negative start', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      const result = bs.range(-1, 5);
      expect(result.size).toBe(0);
    });

    it('should handle non-integer range', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      const result = bs.range(1.5, 5.5);
      expect(result.size).toBe(0);
    });

    it('should return new instance', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2);
      const result = bs.range(0, 2);
      expect(result).not.toBe(bs);
    });
  });

  describe('nextSet', () => {
    it('should find next set bit from start', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      expect(bs.nextSet(0)).toBe(0);
      expect(bs.nextSet(1)).toBe(2);
      expect(bs.nextSet(3)).toBe(5);
    });

    it('should return -1 when no more set bits', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2);
      expect(bs.nextSet(3)).toBe(-1);
      expect(bs.nextSet(10)).toBe(-1);
    });

    it('should handle negative start', () => {
      const bs = new BitSet2(10);
      bs.set(5);
      expect(bs.nextSet(-1)).toBe(5);
      expect(bs.nextSet(-10)).toBe(5);
    });

    it('should return -1 for empty set', () => {
      const bs = new BitSet2(10);
      expect(bs.nextSet(0)).toBe(-1);
    });

    it('should find from middle', () => {
      const bs = new BitSet2(100);
      bs.set(50).set(75);
      expect(bs.nextSet(40)).toBe(50);
      expect(bs.nextSet(60)).toBe(75);
    });
  });

  describe('nextClear', () => {
    it('should find next clear bit from start', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      expect(bs.nextClear(0)).toBe(1);
      expect(bs.nextClear(2)).toBe(3);
      expect(bs.nextClear(5)).toBe(6);
    });

    it('should return -1 when no clear bits', () => {
      const bs = new BitSet2(5);
      bs.setAll();
      expect(bs.nextClear(0)).toBe(-1);
      expect(bs.nextClear(5)).toBe(-1);
    });

    it('should handle negative start', () => {
      const bs = new BitSet2(10);
      bs.set(5);
      expect(bs.nextClear(-1)).toBe(0);
    });

    it('should find from middle', () => {
      const bs = new BitSet2(100);
      bs.set(50).set(75);
      expect(bs.nextClear(40)).toBe(40);
      expect(bs.nextClear(60)).toBe(60);
    });
  });

  describe('previousSet', () => {
    it('should find previous set bit from end', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5).set(9);
      expect(bs.previousSet(9)).toBe(9);
      expect(bs.previousSet(8)).toBe(5);
      expect(bs.previousSet(6)).toBe(5);
      expect(bs.previousSet(5)).toBe(5);
      expect(bs.previousSet(4)).toBe(2);
    });

    it('should return -1 when no previous set bits', () => {
      const bs = new BitSet2(10);
      bs.set(5);
      expect(bs.previousSet(4)).toBe(-1);
      expect(bs.previousSet(0)).toBe(-1);
    });

    it('should handle start beyond size', () => {
      const bs = new BitSet2(10);
      bs.set(5);
      expect(bs.previousSet(20)).toBe(5);
      expect(bs.previousSet(15)).toBe(5);
    });

    it('should return -1 for empty set', () => {
      const bs = new BitSet2(10);
      expect(bs.previousSet(9)).toBe(-1);
    });
  });

  describe('previousClear', () => {
    it('should find previous clear bit from end', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(2).set(5);
      expect(bs.previousClear(9)).toBe(9);
      expect(bs.previousClear(5)).toBe(4);
      expect(bs.previousClear(2)).toBe(1);
      expect(bs.previousClear(0)).toBe(-1);
    });

    it('should return -1 when no previous clear bits', () => {
      const bs = new BitSet2(5);
      bs.setAll();
      expect(bs.previousClear(4)).toBe(-1);
      expect(bs.previousClear(0)).toBe(-1);
    });

    it('should handle start beyond size', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(5);
      expect(bs.previousClear(20)).toBe(9);
      expect(bs.previousClear(15)).toBe(9);
    });

    it('should find from middle', () => {
      const bs = new BitSet2(100);
      bs.set(50).set(75);
      expect(bs.previousClear(60)).toBe(60);
      expect(bs.previousClear(70)).toBe(70);
    });
  });

  describe('fromArray static', () => {
    it('should create set from array', () => {
      const bs = BitSet2.fromArray([0, 2, 5, 9]);
      expect(bs.toArray()).toEqual([0, 2, 5, 9]);
    });

    it('should handle empty array', () => {
      const bs = BitSet2.fromArray([]);
      expect(bs.isEmpty).toBe(true);
    });

    it('should handle unsorted array', () => {
      const bs = BitSet2.fromArray([9, 2, 5, 0]);
      expect(bs.toArray()).toEqual([0, 2, 5, 9]);
    });

    it('should handle duplicates', () => {
      const bs = BitSet2.fromArray([0, 2, 2, 5, 0]);
      expect(bs.toArray()).toEqual([0, 2, 5]);
    });

    it('should set size based on max index', () => {
      const bs = BitSet2.fromArray([5, 10, 15]);
      expect(bs.size).toBe(16);
    });

    it('should use options size', () => {
      const bs = BitSet2.fromArray([5, 10], { size: 50 });
      expect(bs.size).toBe(50);
    });

    it('should handle options growable', () => {
      const bs = BitSet2.fromArray([5], { growable: false, size: 10 });
      expect(() => bs.set(20)).toThrow();
    });
  });

  describe('words getter', () => {
    it('should return Uint32Array', () => {
      const bs = new BitSet2(10);
      const words = bs.words;
      expect(words instanceof Uint32Array).toBe(true);
    });

    it('should have correct length', () => {
      const bs = new BitSet2(100);
      const words = bs.words;
      expect(words.length).toBe(Math.ceil(100 / 32));
    });

    it('should reflect set bits', () => {
      const bs = new BitSet2(10);
      bs.set(0).set(5);
      const words = bs.words;
      expect(words[0]).toBeGreaterThan(0);
    });
  });

  describe('complex operations', () => {
    it('should handle multiple bitwise operations', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(10);
      const bs3 = new BitSet2(10);
      bs1.set(0).set(2).set(4);
      bs2.set(0).set(1).set(2);
      bs3.set(1).set(3).set(5);
      const result = bs1.clone().and(bs2).or(bs3);
      expect(result.get(0)).toBe(true);
      expect(result.get(1)).toBe(true);
      expect(result.get(2)).toBe(true);
      expect(result.get(3)).toBe(true);
      expect(result.get(4)).toBe(false);
      expect(result.get(5)).toBe(true);
    });

    it('should handle growth in operations', () => {
      const bs1 = new BitSet2(10);
      const bs2 = new BitSet2(20);
      bs2.set(15);
      bs1.or(bs2);
      expect(bs1.size).toBe(20);
      expect(bs1.get(15)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle size 0', () => {
      const bs = new BitSet2(0);
      expect(bs.size).toBe(0);
      expect(bs.isEmpty).toBe(true);
      expect(bs.toArray()).toEqual([]);
      expect(bs.count).toBe(0);
    });

    it('should handle size exactly multiple of 32', () => {
      const bs = new BitSet2(32);
      bs.setAll();
      expect(bs.count).toBe(32);
      expect(bs.get(31)).toBe(true);
    });

    it('should handle size just under multiple of 32', () => {
      const bs = new BitSet2(31);
      bs.setAll();
      expect(bs.count).toBe(31);
      expect(bs.get(30)).toBe(true);
    });

    it('should handle size just over multiple of 32', () => {
      const bs = new BitSet2(33);
      bs.setAll();
      expect(bs.count).toBe(33);
      expect(bs.get(32)).toBe(true);
    });

    it('should handle many operations', () => {
      const bs = new BitSet2(1000);
      for (let i = 0; i < 500; i++) {
        bs.set(i * 2);
      }
      expect(bs.count).toBe(500);
      for (let i = 0; i < 500; i++) {
        bs.clear(i * 2);
      }
      expect(bs.isEmpty).toBe(true);
    });
  });
});
