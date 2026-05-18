import { describe, it, expect } from 'vitest';
import { DynamicBitset2 } from '../../src/core/dynamic-bitset-2/index.js';

describe('DynamicBitset2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty bitset', () => {
      const bs = new DynamicBitset2();
      expect(bs.size).toBe(0);
      expect(bs.capacity).toBeGreaterThan(0);
    });

    it('should create bitset with initial capacity', () => {
      const bs = new DynamicBitset2(100);
      expect(bs.capacity).toBeGreaterThanOrEqual(100);
    });
  });

  // ─── set ───
  describe('set', () => {
    it('should set a bit at given index', () => {
      const bs = new DynamicBitset2();
      bs.set(5);
      expect(bs.get(5)).toBe(true);
      expect(bs.size).toBe(6);
    });

    it('should throw for negative index', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.set(-1)).toThrow(RangeError);
    });

    it('should set bits beyond initial capacity', () => {
      const bs = new DynamicBitset2(4);
      bs.set(100);
      expect(bs.get(100)).toBe(true);
    });

    it('should be idempotent', () => {
      const bs = new DynamicBitset2();
      bs.set(5);
      bs.set(5);
      expect(bs.get(5)).toBe(true);
      expect(bs.countOnes()).toBe(1);
    });
  });

  // ─── unset ───
  describe('unset', () => {
    it('should clear a set bit', () => {
      const bs = new DynamicBitset2();
      bs.set(5);
      bs.unset(5);
      expect(bs.get(5)).toBe(false);
    });

    it('should throw for negative index', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.unset(-1)).toThrow(RangeError);
    });

    it('should be no-op on already unset bit', () => {
      const bs = new DynamicBitset2();
      bs.set(10);
      bs.unset(5);
      expect(bs.get(5)).toBe(false);
      expect(bs.get(10)).toBe(true);
    });
  });

  // ─── get ───
  describe('get', () => {
    it('should return false for unset bits', () => {
      const bs = new DynamicBitset2();
      expect(bs.get(0)).toBe(false);
      expect(bs.get(100)).toBe(false);
    });

    it('should throw for negative index', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.get(-1)).toThrow(RangeError);
    });
  });

  // ─── toggle ───
  describe('toggle', () => {
    it('should toggle a bit on and off', () => {
      const bs = new DynamicBitset2();
      expect(bs.toggle(5)).toBe(true);
      expect(bs.get(5)).toBe(true);
      expect(bs.toggle(5)).toBe(false);
      expect(bs.get(5)).toBe(false);
    });

    it('should throw for negative index', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.toggle(-1)).toThrow(RangeError);
    });
  });

  // ─── setRange ───
  describe('setRange', () => {
    it('should set a range of bits', () => {
      const bs = new DynamicBitset2();
      bs.setRange(5, 10);
      for (let i = 5; i < 10; i++) {
        expect(bs.get(i)).toBe(true);
      }
      expect(bs.get(4)).toBe(false);
      expect(bs.get(10)).toBe(false);
    });

    it('should throw for negative start', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.setRange(-1, 5)).toThrow(RangeError);
    });

    it('should throw if end < start', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.setRange(5, 3)).toThrow(RangeError);
    });

    it('should be no-op for empty range', () => {
      const bs = new DynamicBitset2();
      bs.setRange(5, 5);
      expect(bs.size).toBe(0);
    });
  });

  // ─── unsetRange ───
  describe('unsetRange', () => {
    it('should clear a range of bits', () => {
      const bs = new DynamicBitset2();
      bs.setRange(0, 10);
      bs.unsetRange(3, 7);
      for (let i = 3; i < 7; i++) {
        expect(bs.get(i)).toBe(false);
      }
      expect(bs.get(2)).toBe(true);
      expect(bs.get(7)).toBe(true);
    });

    it('should throw for negative start', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.unsetRange(-1, 5)).toThrow(RangeError);
    });

    it('should throw if end < start', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.unsetRange(5, 3)).toThrow(RangeError);
    });
  });

  // ─── flipRange ───
  describe('flipRange', () => {
    it('should flip a range of bits', () => {
      const bs = new DynamicBitset2();
      bs.setRange(0, 10);
      bs.flipRange(3, 7);
      for (let i = 3; i < 7; i++) {
        expect(bs.get(i)).toBe(false);
      }
      expect(bs.get(0)).toBe(true);
    });

    it('should throw for invalid ranges', () => {
      const bs = new DynamicBitset2();
      expect(() => bs.flipRange(-1, 5)).toThrow(RangeError);
      expect(() => bs.flipRange(5, 3)).toThrow(RangeError);
    });
  });

  // ─── countOnes / countZeros ───
  describe('countOnes and countZeros', () => {
    it('should count set bits correctly', () => {
      const bs = new DynamicBitset2();
      bs.set(0);
      bs.set(5);
      bs.set(10);
      expect(bs.countOnes()).toBe(3);
    });

    it('should count zeros correctly', () => {
      const bs = new DynamicBitset2();
      bs.set(0);
      bs.set(5);
      bs.set(10);
      expect(bs.countZeros()).toBe(bs.size - bs.countOnes());
    });

    it('should return 0 for empty bitset', () => {
      const bs = new DynamicBitset2();
      expect(bs.countOnes()).toBe(0);
      expect(bs.countZeros()).toBe(0);
    });
  });

  // ─── and ───
  describe('and', () => {
    it('should perform bitwise AND', () => {
      const a = new DynamicBitset2();
      a.set(0);
      a.set(1);
      a.set(2);
      const b = new DynamicBitset2();
      b.set(1);
      b.set(2);
      b.set(3);
      const result = a.and(b);
      expect(result.get(0)).toBe(false);
      expect(result.get(1)).toBe(true);
      expect(result.get(2)).toBe(true);
      expect(result.get(3)).toBe(false);
    });
  });

  // ─── or ───
  describe('or', () => {
    it('should perform bitwise OR', () => {
      const a = new DynamicBitset2();
      a.set(0);
      a.set(1);
      const b = new DynamicBitset2();
      b.set(1);
      b.set(2);
      const result = a.or(b);
      expect(result.get(0)).toBe(true);
      expect(result.get(1)).toBe(true);
      expect(result.get(2)).toBe(true);
    });
  });

  // ─── xor ───
  describe('xor', () => {
    it('should perform bitwise XOR', () => {
      const a = new DynamicBitset2();
      a.set(0);
      a.set(1);
      const b = new DynamicBitset2();
      b.set(1);
      b.set(2);
      const result = a.xor(b);
      expect(result.get(0)).toBe(true);
      expect(result.get(1)).toBe(false);
      expect(result.get(2)).toBe(true);
    });
  });

  // ─── not ───
  describe('not', () => {
    it('should flip all bits', () => {
      const bs = new DynamicBitset2();
      bs.set(0);
      bs.set(2);
      const result = bs.not();
      expect(result.get(0)).toBe(false);
      expect(result.get(1)).toBe(true);
      expect(result.get(2)).toBe(false);
    });
  });

  // ─── equals ───
  describe('equals', () => {
    it('should return true for identical bitsets', () => {
      const a = new DynamicBitset2();
      a.set(0);
      a.set(5);
      const b = new DynamicBitset2();
      b.set(0);
      b.set(5);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different bitsets', () => {
      const a = new DynamicBitset2();
      a.set(0);
      const b = new DynamicBitset2();
      b.set(1);
      expect(a.equals(b)).toBe(false);
    });
  });

  // ─── clone ───
  describe('clone', () => {
    it('should create an independent copy', () => {
      const bs = new DynamicBitset2();
      bs.set(0);
      bs.set(5);
      const cloned = bs.clone();
      expect(cloned.get(0)).toBe(true);
      expect(cloned.get(5)).toBe(true);
      cloned.unset(0);
      expect(bs.get(0)).toBe(true);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return indices of set bits', () => {
      const bs = new DynamicBitset2();
      bs.set(0);
      bs.set(5);
      bs.set(10);
      expect(bs.toArray()).toEqual([0, 5, 10]);
    });

    it('should return empty array for unset bitset', () => {
      const bs = new DynamicBitset2();
      expect(bs.toArray()).toEqual([]);
    });
  });

  // ─── toString ───
  describe('toString', () => {
    it('should return binary string representation', () => {
      const bs = new DynamicBitset2();
      bs.set(0);
      bs.set(2);
      bs.set(4);
      expect(bs.toString()).toBe('10101');
    });

    it('should return empty string for empty bitset', () => {
      const bs = new DynamicBitset2();
      expect(bs.toString()).toBe('');
    });
  });
});
