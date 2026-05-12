import { describe, it, expect } from 'vitest';
import { Bitmap2 } from './src/core/bitmap-2/index.js';

describe('Bitmap2', () => {
  describe('constructor', () => {
    it('should create bitmap with size 0', () => {
      const bm = new Bitmap2(0);
      expect(bm.size).toBe(0);
    });

    it('should create bitmap with positive size', () => {
      const bm = new Bitmap2(100);
      expect(bm.size).toBe(100);
    });

    it('should throw error for negative size', () => {
      expect(() => new Bitmap2(-1)).toThrow('Size must be non-negative');
    });
  });

  describe('set and get', () => {
    it('should set and get single bit', () => {
      const bm = new Bitmap2(100);
      bm.set(10);
      expect(bm.get(10)).toBe(true);
      expect(bm.get(9)).toBe(false);
      expect(bm.get(11)).toBe(false);
    });

    it('should set multiple bits', () => {
      const bm = new Bitmap2(100);
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
      const bm = new Bitmap2(100);
      bm.set(32);
      bm.set(64);
      bm.set(96);
      expect(bm.get(32)).toBe(true);
      expect(bm.get(64)).toBe(true);
      expect(bm.get(96)).toBe(true);
    });

    it('should throw error for out of bounds get', () => {
      const bm = new Bitmap2(10);
      expect(() => bm.get(-1)).toThrow('Index out of bounds');
      expect(() => bm.get(10)).toThrow('Index out of bounds');
    });

    it('should throw error for out of bounds set', () => {
      const bm = new Bitmap2(10);
      expect(() => bm.set(-1)).toThrow('Index out of bounds');
      expect(() => bm.set(10)).toThrow('Index out of bounds');
    });

    it('should return false for unset bit', () => {
      const bm = new Bitmap2(100);
      expect(bm.get(50)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear a set bit', () => {
      const bm = new Bitmap2(100);
      bm.set(10);
      expect(bm.get(10)).toBe(true);
      bm.clear(10);
      expect(bm.get(10)).toBe(false);
    });

    it('should clear multiple bits', () => {
      const bm = new Bitmap2(100);
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
      const bm = new Bitmap2(100);
      bm.set(32);
      expect(bm.get(32)).toBe(true);
      bm.clear(32);
      expect(bm.get(32)).toBe(false);
    });

    it('should throw error for out of bounds clear', () => {
      const bm = new Bitmap2(10);
      expect(() => bm.clear(-1)).toThrow('Index out of bounds');
      expect(() => bm.clear(10)).toThrow('Index out of bounds');
    });

    it('should handle clearing already unset bit', () => {
      const bm = new Bitmap2(100);
      bm.clear(50);
      expect(bm.get(50)).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle unset bit to set', () => {
      const bm = new Bitmap2(100);
      const result = bm.toggle(10);
      expect(bm.get(10)).toBe(true);
      expect(result).toBe(true);
    });

    it('should toggle set bit to unset', () => {
      const bm = new Bitmap2(100);
      bm.set(10);
      const result = bm.toggle(10);
      expect(bm.get(10)).toBe(false);
      expect(result).toBe(false);
    });

    it('should toggle multiple bits', () => {
      const bm = new Bitmap2(100);
      bm.toggle(10);
      expect(bm.get(10)).toBe(true);
      bm.toggle(10);
      expect(bm.get(10)).toBe(false);
      bm.toggle(10);
      expect(bm.get(10)).toBe(true);
    });

    it('should toggle bit at word boundary', () => {
      const bm = new Bitmap2(100);
      bm.toggle(32);
      expect(bm.get(32)).toBe(true);
      bm.toggle(32);
      expect(bm.get(32)).toBe(false);
    });

    it('should throw error for out of bounds toggle', () => {
      const bm = new Bitmap2(10);
      expect(() => bm.toggle(-1)).toThrow('Index out of bounds');
      expect(() => bm.toggle(10)).toThrow('Index out of bounds');
    });
  });

  describe('setAll', () => {
    it('should set all bits', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      for (let i = 0; i < 50; i++) {
        expect(bm.get(i)).toBe(true);
      }
    });

    it('should handle zero size', () => {
      const bm = new Bitmap2(0);
      bm.setAll();
      expect(bm.countOnes()).toBe(0);
    });

    it('should set all bits across multiple words', () => {
      const bm = new Bitmap2(100);
      bm.setAll();
      expect(bm.countOnes()).toBe(100);
    });
  });

  describe('clearAll', () => {
    it('should clear all bits', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      bm.clearAll();
      for (let i = 0; i < 50; i++) {
        expect(bm.get(i)).toBe(false);
      }
    });

    it('should handle zero size', () => {
      const bm = new Bitmap2(0);
      bm.clearAll();
      expect(bm.countOnes()).toBe(0);
    });

    it('should clear all bits across multiple words', () => {
      const bm = new Bitmap2(100);
      bm.setAll();
      bm.clearAll();
      expect(bm.countOnes()).toBe(0);
    });
  });

  describe('setRange', () => {
    it('should set range of bits', () => {
      const bm = new Bitmap2(50);
      bm.setRange(10, 20);
      for (let i = 0; i < 10; i++) {
        expect(bm.get(i)).toBe(false);
      }
      for (let i = 10; i < 20; i++) {
        expect(bm.get(i)).toBe(true);
      }
      for (let i = 20; i < 50; i++) {
        expect(bm.get(i)).toBe(false);
      }
    });

    it('should set range at start', () => {
      const bm = new Bitmap2(50);
      bm.setRange(0, 10);
      for (let i = 0; i < 10; i++) {
        expect(bm.get(i)).toBe(true);
      }
      expect(bm.get(10)).toBe(false);
    });

    it('should set range at end', () => {
      const bm = new Bitmap2(50);
      bm.setRange(40, 50);
      for (let i = 40; i < 50; i++) {
        expect(bm.get(i)).toBe(true);
      }
      expect(bm.get(39)).toBe(false);
    });

    it('should set range across word boundaries', () => {
      const bm = new Bitmap2(100);
      bm.setRange(30, 70);
      for (let i = 30; i < 70; i++) {
        expect(bm.get(i)).toBe(true);
      }
    });

    it('should throw error for invalid range start < 0', () => {
      const bm = new Bitmap2(50);
      expect(() => bm.setRange(-1, 10)).toThrow('Invalid range');
    });

    it('should throw error for invalid range end > size', () => {
      const bm = new Bitmap2(50);
      expect(() => bm.setRange(10, 51)).toThrow('Invalid range');
    });

    it('should throw error for invalid range start > end', () => {
      const bm = new Bitmap2(50);
      expect(() => bm.setRange(20, 10)).toThrow('Invalid range');
    });
  });

  describe('clearRange', () => {
    it('should clear range of bits', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      bm.clearRange(10, 20);
      for (let i = 0; i < 10; i++) {
        expect(bm.get(i)).toBe(true);
      }
      for (let i = 10; i < 20; i++) {
        expect(bm.get(i)).toBe(false);
      }
      for (let i = 20; i < 50; i++) {
        expect(bm.get(i)).toBe(true);
      }
    });

    it('should clear range at start', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      bm.clearRange(0, 10);
      for (let i = 0; i < 10; i++) {
        expect(bm.get(i)).toBe(false);
      }
      expect(bm.get(10)).toBe(true);
    });

    it('should clear range at end', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      bm.clearRange(40, 50);
      for (let i = 40; i < 50; i++) {
        expect(bm.get(i)).toBe(false);
      }
      expect(bm.get(39)).toBe(true);
    });

    it('should clear range across word boundaries', () => {
      const bm = new Bitmap2(100);
      bm.setAll();
      bm.clearRange(30, 70);
      for (let i = 30; i < 70; i++) {
        expect(bm.get(i)).toBe(false);
      }
    });

    it('should throw error for invalid range start < 0', () => {
      const bm = new Bitmap2(50);
      expect(() => bm.clearRange(-1, 10)).toThrow('Invalid range');
    });

    it('should throw error for invalid range end > size', () => {
      const bm = new Bitmap2(50);
      expect(() => bm.clearRange(10, 51)).toThrow('Invalid range');
    });

    it('should throw error for invalid range start > end', () => {
      const bm = new Bitmap2(50);
      expect(() => bm.clearRange(20, 10)).toThrow('Invalid range');
    });
  });

  describe('countOnes', () => {
    it('should count zero for empty bitmap', () => {
      const bm = new Bitmap2(100);
      expect(bm.countOnes()).toBe(0);
    });

    it('should count all bits for full bitmap', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      expect(bm.countOnes()).toBe(50);
    });

    it('should count partial set bits', () => {
      const bm = new Bitmap2(100);
      bm.set(10);
      bm.set(20);
      bm.set(30);
      expect(bm.countOnes()).toBe(3);
    });

    it('should handle single bit', () => {
      const bm = new Bitmap2(100);
      bm.set(50);
      expect(bm.countOnes()).toBe(1);
    });

    it('should count bits across word boundaries', () => {
      const bm = new Bitmap2(100);
      bm.set(31);
      bm.set(32);
      bm.set(33);
      bm.set(63);
      bm.set(64);
      bm.set(65);
      expect(bm.countOnes()).toBe(6);
    });

    it('should count all bits in last word', () => {
      const bm = new Bitmap2(35);
      bm.setAll();
      expect(bm.countOnes()).toBe(35);
    });
  });

  describe('countZeros', () => {
    it('should count all zeros for empty bitmap', () => {
      const bm = new Bitmap2(100);
      expect(bm.countZeros()).toBe(100);
    });

    it('should count zero for full bitmap', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      expect(bm.countZeros()).toBe(0);
    });

    it('should count partial zeros', () => {
      const bm = new Bitmap2(100);
      bm.set(10);
      bm.set(20);
      bm.set(30);
      expect(bm.countZeros()).toBe(97);
    });
  });

  describe('and', () => {
    it('should AND two bitmaps', () => {
      const bm1 = new Bitmap2(100);
      const bm2 = new Bitmap2(100);
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
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(50);
      const result = bm1.and(bm2);
      expect(result.countOnes()).toBe(0);
    });

    it('should handle all ones', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(50);
      bm1.setAll();
      bm2.setAll();
      const result = bm1.and(bm2);
      expect(result.countOnes()).toBe(50);
    });

    it('should throw error for different sizes', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(100);
      expect(() => bm1.and(bm2)).toThrow('Bitmaps must have the same size');
    });
  });

  describe('or', () => {
    it('should OR two bitmaps', () => {
      const bm1 = new Bitmap2(100);
      const bm2 = new Bitmap2(100);
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
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(50);
      const result = bm1.or(bm2);
      expect(result.countOnes()).toBe(0);
    });

    it('should handle all ones', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(50);
      bm1.setAll();
      bm2.setAll();
      const result = bm1.or(bm2);
      expect(result.countOnes()).toBe(50);
    });

    it('should throw error for different sizes', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(100);
      expect(() => bm1.or(bm2)).toThrow('Bitmaps must have the same size');
    });
  });

  describe('xor', () => {
    it('should XOR two bitmaps', () => {
      const bm1 = new Bitmap2(100);
      const bm2 = new Bitmap2(100);
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
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(50);
      const result = bm1.xor(bm2);
      expect(result.countOnes()).toBe(0);
    });

    it('should handle identical bitmaps', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(50);
      bm1.setAll();
      bm2.setAll();
      const result = bm1.xor(bm2);
      expect(result.countOnes()).toBe(0);
    });

    it('should throw error for different sizes', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(100);
      expect(() => bm1.xor(bm2)).toThrow('Bitmaps must have the same size');
    });
  });

  describe('not', () => {
    it('should NOT all zeros', () => {
      const bm = new Bitmap2(50);
      const result = bm.not();
      expect(result.countOnes()).toBe(50);
    });

    it('should NOT all ones', () => {
      const bm = new Bitmap2(50);
      bm.setAll();
      const result = bm.not();
      expect(result.countOnes()).toBe(0);
    });

    it('should NOT partial set', () => {
      const bm = new Bitmap2(50);
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
      const bm = new Bitmap2(35);
      const result = bm.not();
      expect(result.countOnes()).toBe(35);
    });

    it('should handle size multiple of 32', () => {
      const bm = new Bitmap2(64);
      const result = bm.not();
      expect(result.countOnes()).toBe(64);
    });
  });

  describe('toString', () => {
    it('should convert to string for empty bitmap', () => {
      const bm = new Bitmap2(10);
      expect(bm.toString()).toBe('0000000000');
    });

    it('should convert to string for set bits', () => {
      const bm = new Bitmap2(10);
      bm.set(0);
      bm.set(5);
      bm.set(9);
      expect(bm.toString()).toBe('1000010001');
    });

    it('should convert to string for all ones', () => {
      const bm = new Bitmap2(10);
      bm.setAll();
      expect(bm.toString()).toBe('1111111111');
    });

    it('should handle zero size', () => {
      const bm = new Bitmap2(0);
      expect(bm.toString()).toBe('');
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const bm1 = new Bitmap2(100);
      bm1.set(10);
      bm1.set(20);
      const bm2 = bm1.clone();
      expect(bm2.get(10)).toBe(true);
      expect(bm2.get(20)).toBe(true);
      bm1.clear(10);
      expect(bm1.get(10)).toBe(false);
      expect(bm2.get(10)).toBe(true);
    });

    it('should clone empty bitmap', () => {
      const bm1 = new Bitmap2(100);
      const bm2 = bm1.clone();
      expect(bm2.countOnes()).toBe(0);
    });

    it('should clone full bitmap', () => {
      const bm1 = new Bitmap2(50);
      bm1.setAll();
      const bm2 = bm1.clone();
      expect(bm2.countOnes()).toBe(50);
    });
  });

  describe('equals', () => {
    it('should return true for identical bitmaps', () => {
      const bm1 = new Bitmap2(100);
      const bm2 = new Bitmap2(100);
      bm1.set(10);
      bm1.set(20);
      bm2.set(10);
      bm2.set(20);
      expect(bm1.equals(bm2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(100);
      expect(bm1.equals(bm2)).toBe(false);
    });

    it('should return false for different bits', () => {
      const bm1 = new Bitmap2(100);
      const bm2 = new Bitmap2(100);
      bm1.set(10);
      bm2.set(20);
      expect(bm1.equals(bm2)).toBe(false);
    });

    it('should return true for empty bitmaps of same size', () => {
      const bm1 = new Bitmap2(100);
      const bm2 = new Bitmap2(100);
      expect(bm1.equals(bm2)).toBe(true);
    });

    it('should return true for full bitmaps of same size', () => {
      const bm1 = new Bitmap2(50);
      const bm2 = new Bitmap2(50);
      bm1.setAll();
      bm2.setAll();
      expect(bm1.equals(bm2)).toBe(true);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const bm = new Bitmap2(100);
      expect(bm.size).toBe(100);
    });

    it('should handle zero size', () => {
      const bm = new Bitmap2(0);
      expect(bm.size).toBe(0);
    });
  });

  describe('boundary bits', () => {
    it('should handle bit at start', () => {
      const bm = new Bitmap2(100);
      bm.set(0);
      expect(bm.get(0)).toBe(true);
    });

    it('should handle bit at end', () => {
      const bm = new Bitmap2(100);
      bm.set(99);
      expect(bm.get(99)).toBe(true);
    });

    it('should handle bit at word boundary start', () => {
      const bm = new Bitmap2(100);
      bm.set(31);
      expect(bm.get(31)).toBe(true);
    });

    it('should handle bit at word boundary end', () => {
      const bm = new Bitmap2(100);
      bm.set(32);
      expect(bm.get(32)).toBe(true);
    });
  });

  describe('overlapping ranges', () => {
    it('should handle setRange then setRange overlapping', () => {
      const bm = new Bitmap2(100);
      bm.setRange(10, 30);
      bm.setRange(20, 40);
      for (let i = 10; i < 40; i++) {
        expect(bm.get(i)).toBe(true);
      }
    });

    it('should handle clearRange then clearRange overlapping', () => {
      const bm = new Bitmap2(100);
      bm.setAll();
      bm.clearRange(10, 30);
      bm.clearRange(20, 40);
      for (let i = 10; i < 40; i++) {
        expect(bm.get(i)).toBe(false);
      }
    });

    it('should handle setRange then clearRange overlapping', () => {
      const bm = new Bitmap2(100);
      bm.setRange(10, 30);
      bm.clearRange(20, 40);
      for (let i = 10; i < 20; i++) {
        expect(bm.get(i)).toBe(true);
      }
      for (let i = 20; i < 40; i++) {
        expect(bm.get(i)).toBe(false);
      }
    });
  });

  describe('different bitmap sizes', () => {
    it('should handle size 1', () => {
      const bm = new Bitmap2(1);
      bm.set(0);
      expect(bm.get(0)).toBe(true);
      expect(bm.countOnes()).toBe(1);
    });

    it('should handle size 31', () => {
      const bm = new Bitmap2(31);
      bm.setAll();
      expect(bm.countOnes()).toBe(31);
    });

    it('should handle size 32', () => {
      const bm = new Bitmap2(32);
      bm.setAll();
      expect(bm.countOnes()).toBe(32);
    });

    it('should handle size 33', () => {
      const bm = new Bitmap2(33);
      bm.setAll();
      expect(bm.countOnes()).toBe(33);
    });
  });
});
