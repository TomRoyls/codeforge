import { describe, it, expect } from 'vitest';
import { Bitmap3 } from '../src/core/bitmap-3/index.js';

describe('Bitmap3', () => {
  describe('constructor', () => {
    it('should create bitmap with size 0', () => {
      const bm = new Bitmap3(0);
      expect(bm.size).toBe(0);
    });

    it('should create bitmap with positive size', () => {
      const bm = new Bitmap3(100);
      expect(bm.size).toBe(100);
    });

    it('should throw error for negative size', () => {
      expect(() => new Bitmap3(-1)).toThrow('Size must be non-negative');
    });
  });

  describe('set and get', () => {
    it('should set and get single bit', () => {
      const bm = new Bitmap3(100);
      bm.set(10);
      expect(bm.get(10)).toBe(true);
      expect(bm.get(9)).toBe(false);
      expect(bm.get(11)).toBe(false);
    });

    it('should set multiple bits', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      bm.set(10);
      bm.set(50);
      bm.set(99);
      expect(bm.get(0)).toBe(true);
      expect(bm.get(10)).toBe(true);
      expect(bm.get(50)).toBe(true);
      expect(bm.get(99)).toBe(true);
    });

    it('should set bit at word boundary', () => {
      const bm = new Bitmap3(100);
      bm.set(32);
      bm.set(64);
      bm.set(96);
      expect(bm.get(32)).toBe(true);
      expect(bm.get(64)).toBe(true);
      expect(bm.get(96)).toBe(true);
    });

    it('should throw error for out of bounds get', () => {
      const bm = new Bitmap3(10);
      expect(() => bm.get(-1)).toThrow('Index out of bounds');
      expect(() => bm.get(10)).toThrow('Index out of bounds');
    });

    it('should throw error for out of bounds set', () => {
      const bm = new Bitmap3(10);
      expect(() => bm.set(-1)).toThrow('Index out of bounds');
      expect(() => bm.set(10)).toThrow('Index out of bounds');
    });

    it('should return false for unset bit', () => {
      const bm = new Bitmap3(100);
      expect(bm.get(50)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear a set bit', () => {
      const bm = new Bitmap3(100);
      bm.set(10);
      expect(bm.get(10)).toBe(true);
      bm.clear(10);
      expect(bm.get(10)).toBe(false);
    });

    it('should clear multiple bits', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      bm.set(10);
      bm.set(50);
      bm.clear(0);
      bm.clear(10);
      bm.clear(50);
      expect(bm.get(0)).toBe(false);
      expect(bm.get(10)).toBe(false);
      expect(bm.get(50)).toBe(false);
    });

    it('should clear bit at word boundary', () => {
      const bm = new Bitmap3(100);
      bm.set(32);
      expect(bm.get(32)).toBe(true);
      bm.clear(32);
      expect(bm.get(32)).toBe(false);
    });

    it('should throw error for out of bounds clear', () => {
      const bm = new Bitmap3(10);
      expect(() => bm.clear(-1)).toThrow('Index out of bounds');
      expect(() => bm.clear(10)).toThrow('Index out of bounds');
    });

    it('should handle clearing already unset bit', () => {
      const bm = new Bitmap3(100);
      bm.clear(50);
      expect(bm.get(50)).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle unset bit to set', () => {
      const bm = new Bitmap3(100);
      const result = bm.toggle(10);
      expect(bm.get(10)).toBe(true);
      expect(result).toBe(true);
    });

    it('should toggle set bit to unset', () => {
      const bm = new Bitmap3(100);
      bm.set(10);
      const result = bm.toggle(10);
      expect(bm.get(10)).toBe(false);
      expect(result).toBe(false);
    });

    it('should toggle multiple bits', () => {
      const bm = new Bitmap3(100);
      bm.toggle(10);
      expect(bm.get(10)).toBe(true);
      bm.toggle(10);
      expect(bm.get(10)).toBe(false);
      bm.toggle(10);
      expect(bm.get(10)).toBe(true);
    });

    it('should toggle bit at word boundary', () => {
      const bm = new Bitmap3(100);
      bm.toggle(32);
      expect(bm.get(32)).toBe(true);
      bm.toggle(32);
      expect(bm.get(32)).toBe(false);
    });

    it('should throw error for out of bounds toggle', () => {
      const bm = new Bitmap3(10);
      expect(() => bm.toggle(-1)).toThrow('Index out of bounds');
      expect(() => bm.toggle(10)).toThrow('Index out of bounds');
    });
  });

  describe('clearAll', () => {
    it('should clear all bits', () => {
      const bm = new Bitmap3(50);
      bm.set(10);
      bm.set(20);
      bm.set(30);
      bm.clearAll();
      expect(bm.get(10)).toBe(false);
      expect(bm.get(20)).toBe(false);
      expect(bm.get(30)).toBe(false);
    });

    it('should handle empty bitmap', () => {
      const bm = new Bitmap3(0);
      bm.clearAll();
      expect(bm.isEmpty).toBe(true);
    });

    it('should clear bits across multiple words', () => {
      const bm = new Bitmap3(100);
      for (let i = 0; i < 100; i++) {
        bm.set(i);
      }
      bm.clearAll();
      expect(bm.isEmpty).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty bitmap', () => {
      const bm = new Bitmap3(100);
      expect(bm.isEmpty).toBe(true);
    });

    it('should return false for non-empty bitmap', () => {
      const bm = new Bitmap3(100);
      bm.set(50);
      expect(bm.isEmpty).toBe(false);
    });

    it('should return true after clearing all bits', () => {
      const bm = new Bitmap3(100);
      bm.set(10);
      bm.set(20);
      bm.clearAll();
      expect(bm.isEmpty).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty bitmap', () => {
      const bm = new Bitmap3(100);
      expect(bm.toArray()).toEqual([]);
    });

    it('should return array with set bit indices', () => {
      const bm = new Bitmap3(100);
      bm.set(10);
      bm.set(20);
      bm.set(30);
      expect(bm.toArray()).toEqual([10, 20, 30]);
    });

    it('should return indices in order', () => {
      const bm = new Bitmap3(100);
      bm.set(50);
      bm.set(10);
      bm.set(30);
      bm.set(20);
      expect(bm.toArray()).toEqual([10, 20, 30, 50]);
    });

    it('should handle boundary bits', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      bm.set(99);
      expect(bm.toArray()).toEqual([0, 99]);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return complexity for all operations', () => {
      const bm = new Bitmap3(100);
      const complexity = bm.getTimeComplexity();
      expect(complexity.set).toBe('O(1)');
      expect(complexity.clear).toBe('O(1)');
      expect(complexity.get).toBe('O(1)');
      expect(complexity.toggle).toBe('O(1)');
      expect(complexity.clearAll).toBe('O(n/32)');
      expect(complexity.isEmpty).toBe('O(n/32)');
      expect(complexity.toArray).toBe('O(n)');
      expect(complexity.and).toBe('O(n/32)');
      expect(complexity.or).toBe('O(n/32)');
      expect(complexity.xor).toBe('O(n/32)');
      expect(complexity.not).toBe('O(n/32)');
      expect(complexity.countLeadingZeros).toBe('O(n/32)');
      expect(complexity.countTrailingZeros).toBe('O(1)');
      expect(complexity.findFirstSet).toBe('O(n/32)');
      expect(complexity.findLastSet).toBe('O(n/32)');
      expect(complexity.forEach).toBe('O(n)');
    });
  });

  describe('and', () => {
    it('should AND two bitmaps', () => {
      const bm1 = new Bitmap3(100);
      const bm2 = new Bitmap3(100);
      bm1.set(10);
      bm1.set(20);
      bm2.set(20);
      bm2.set(30);
      const result = bm1.and(bm2);
      expect(result.get(10)).toBe(false);
      expect(result.get(20)).toBe(true);
      expect(result.get(30)).toBe(false);
    });

    it('should handle all zeros', () => {
      const bm1 = new Bitmap3(50);
      const bm2 = new Bitmap3(50);
      const result = bm1.and(bm2);
      expect(result.isEmpty).toBe(true);
    });

    it('should throw error for different sizes', () => {
      const bm1 = new Bitmap3(50);
      const bm2 = new Bitmap3(100);
      expect(() => bm1.and(bm2)).toThrow('Bitmaps must have same size');
    });
  });

  describe('or', () => {
    it('should OR two bitmaps', () => {
      const bm1 = new Bitmap3(100);
      const bm2 = new Bitmap3(100);
      bm1.set(10);
      bm1.set(20);
      bm2.set(20);
      bm2.set(30);
      const result = bm1.or(bm2);
      expect(result.get(10)).toBe(true);
      expect(result.get(20)).toBe(true);
      expect(result.get(30)).toBe(true);
    });

    it('should handle all zeros', () => {
      const bm1 = new Bitmap3(50);
      const bm2 = new Bitmap3(50);
      const result = bm1.or(bm2);
      expect(result.isEmpty).toBe(true);
    });

    it('should throw error for different sizes', () => {
      const bm1 = new Bitmap3(50);
      const bm2 = new Bitmap3(100);
      expect(() => bm1.or(bm2)).toThrow('Bitmaps must have same size');
    });
  });

  describe('xor', () => {
    it('should XOR two bitmaps', () => {
      const bm1 = new Bitmap3(100);
      const bm2 = new Bitmap3(100);
      bm1.set(10);
      bm1.set(20);
      bm2.set(20);
      bm2.set(30);
      const result = bm1.xor(bm2);
      expect(result.get(10)).toBe(true);
      expect(result.get(20)).toBe(false);
      expect(result.get(30)).toBe(true);
    });

    it('should handle all zeros', () => {
      const bm1 = new Bitmap3(50);
      const bm2 = new Bitmap3(50);
      const result = bm1.xor(bm2);
      expect(result.isEmpty).toBe(true);
    });

    it('should throw error for different sizes', () => {
      const bm1 = new Bitmap3(50);
      const bm2 = new Bitmap3(100);
      expect(() => bm1.xor(bm2)).toThrow('Bitmaps must have same size');
    });
  });

  describe('not', () => {
    it('should NOT all zeros', () => {
      const bm = new Bitmap3(50);
      const result = bm.not();
      for (let i = 0; i < 50; i++) {
        expect(result.get(i)).toBe(true);
      }
    });

    it('should NOT partial set', () => {
      const bm = new Bitmap3(50);
      bm.set(10);
      bm.set(20);
      bm.set(30);
      const result = bm.not();
      expect(result.get(10)).toBe(false);
      expect(result.get(20)).toBe(false);
      expect(result.get(30)).toBe(false);
      expect(result.get(0)).toBe(true);
      expect(result.get(49)).toBe(true);
    });

    it('should handle size not multiple of 32', () => {
      const bm = new Bitmap3(35);
      for (let i = 0; i < 35; i++) {
        bm.set(i);
      }
      const result = bm.not();
      for (let i = 0; i < 35; i++) {
        expect(result.get(i)).toBe(false);
      }
    });

    it('should handle size multiple of 32', () => {
      const bm = new Bitmap3(64);
      for (let i = 0; i < 64; i++) {
        bm.set(i);
      }
      const result = bm.not();
      expect(result.isEmpty).toBe(true);
    });

    it('should return new bitmap, not modify original', () => {
      const bm = new Bitmap3(50);
      bm.set(10);
      const result = bm.not();
      expect(bm.get(10)).toBe(true);
      expect(result.get(10)).toBe(false);
    });
  });

  describe('countLeadingZeros', () => {
    it('should count leading zeros for empty bitmap', () => {
      const bm = new Bitmap3(100);
      expect(bm.countLeadingZeros()).toBe(100);
    });

    it('should count leading zeros for set bit at start', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      expect(bm.countLeadingZeros()).toBe(0);
    });

    it('should count leading zeros for set bit in middle', () => {
      const bm = new Bitmap3(100);
      bm.set(50);
      expect(bm.countLeadingZeros()).toBe(50);
    });

    it('should count leading zeros for set bit at end', () => {
      const bm = new Bitmap3(100);
      bm.set(99);
      expect(bm.countLeadingZeros()).toBe(99);
    });

    it('should count leading zeros for multiple set bits', () => {
      const bm = new Bitmap3(100);
      bm.set(20);
      bm.set(50);
      bm.set(80);
      expect(bm.countLeadingZeros()).toBe(20);
    });
  });

  describe('countTrailingZeros', () => {
    it('should count trailing zeros for empty bitmap', () => {
      const bm = new Bitmap3(100);
      expect(bm.countTrailingZeros()).toBe(100);
    });

    it('should count trailing zeros for set bit at end', () => {
      const bm = new Bitmap3(100);
      bm.set(99);
      expect(bm.countTrailingZeros()).toBe(0);
    });

    it('should count trailing zeros for set bit in middle', () => {
      const bm = new Bitmap3(100);
      bm.set(50);
      expect(bm.countTrailingZeros()).toBe(49);
    });

    it('should count trailing zeros for set bit at start', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      expect(bm.countTrailingZeros()).toBe(99);
    });

    it('should count trailing zeros for multiple set bits', () => {
      const bm = new Bitmap3(100);
      bm.set(20);
      bm.set(50);
      bm.set(80);
      expect(bm.countTrailingZeros()).toBe(19);
    });
  });

  describe('findFirstSet', () => {
    it('should return -1 for empty bitmap', () => {
      const bm = new Bitmap3(100);
      expect(bm.findFirstSet()).toBe(-1);
    });

    it('should find first set bit at start', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      expect(bm.findFirstSet()).toBe(0);
    });

    it('should find first set bit in middle', () => {
      const bm = new Bitmap3(100);
      bm.set(50);
      expect(bm.findFirstSet()).toBe(50);
    });

    it('should find first set bit among multiple', () => {
      const bm = new Bitmap3(100);
      bm.set(20);
      bm.set(50);
      bm.set(80);
      expect(bm.findFirstSet()).toBe(20);
    });

    it('should find first set bit at end', () => {
      const bm = new Bitmap3(100);
      bm.set(99);
      expect(bm.findFirstSet()).toBe(99);
    });
  });

  describe('findLastSet', () => {
    it('should return -1 for empty bitmap', () => {
      const bm = new Bitmap3(100);
      expect(bm.findLastSet()).toBe(-1);
    });

    it('should find last set bit at end', () => {
      const bm = new Bitmap3(100);
      bm.set(99);
      expect(bm.findLastSet()).toBe(99);
    });

    it('should find last set bit in middle', () => {
      const bm = new Bitmap3(100);
      bm.set(50);
      expect(bm.findLastSet()).toBe(50);
    });

    it('should find last set bit among multiple', () => {
      const bm = new Bitmap3(100);
      bm.set(20);
      bm.set(50);
      bm.set(80);
      expect(bm.findLastSet()).toBe(80);
    });

    it('should find last set bit at start', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      expect(bm.findLastSet()).toBe(0);
    });
  });

  describe('forEach', () => {
    it('should iterate over all bits', () => {
      const bm = new Bitmap3(10);
      const indices: number[] = [];
      bm.forEach((index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should pass index and value to callback', () => {
      const bm = new Bitmap3(10);
      bm.set(2);
      bm.set(5);
      bm.set(8);
      const results: { index: number; value: boolean }[] = [];
      bm.forEach((index, value) => {
        results.push({ index, value });
      });
      expect(results[2]).toEqual({ index: 2, value: true });
      expect(results[5]).toEqual({ index: 5, value: true });
      expect(results[8]).toEqual({ index: 8, value: true });
      expect(results[0]).toEqual({ index: 0, value: false });
    });

    it('should handle empty bitmap', () => {
      const bm = new Bitmap3(0);
      const count: number[] = [];
      bm.forEach(() => {
        count.push(1);
      });
      expect(count).toEqual([]);
    });

    it('should handle size not multiple of 32', () => {
      const bm = new Bitmap3(35);
      const count: number[] = [];
      bm.forEach(() => {
        count.push(1);
      });
      expect(count.length).toBe(35);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const bm = new Bitmap3(100);
      expect(bm.size).toBe(100);
    });

    it('should handle zero size', () => {
      const bm = new Bitmap3(0);
      expect(bm.size).toBe(0);
    });
  });

  describe('boundary bits', () => {
    it('should handle bit at start', () => {
      const bm = new Bitmap3(100);
      bm.set(0);
      expect(bm.get(0)).toBe(true);
    });

    it('should handle bit at end', () => {
      const bm = new Bitmap3(100);
      bm.set(99);
      expect(bm.get(99)).toBe(true);
    });

    it('should handle bit at word boundary start', () => {
      const bm = new Bitmap3(100);
      bm.set(31);
      expect(bm.get(31)).toBe(true);
    });

    it('should handle bit at word boundary end', () => {
      const bm = new Bitmap3(100);
      bm.set(32);
      expect(bm.get(32)).toBe(true);
    });
  });
});
