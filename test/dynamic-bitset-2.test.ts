import { describe, it, expect } from 'vitest';
import { DynamicBitset2 } from '../src/core/dynamic-bitset-2/index.js';

describe('DynamicBitset2', () => {
  describe('constructor', () => {
    it('should create empty bitset with no arguments', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.size).toBe(0);
      expect(bitset.capacity).toBe(32);
    });

    it('should create bitset with initial capacity', () => {
      const bitset = new DynamicBitset2(100);
      expect(bitset.size).toBe(0);
      expect(bitset.capacity).toBeGreaterThanOrEqual(100);
    });

    it('should handle zero capacity', () => {
      const bitset = new DynamicBitset2(0);
      expect(bitset.size).toBe(0);
      expect(bitset.capacity).toBe(32);
    });
  });

  describe('set', () => {
    it('should set a single bit', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      expect(bitset.get(5)).toBe(true);
      expect(bitset.size).toBe(6);
    });

    it('should auto-grow when setting bit beyond capacity', () => {
      const bitset = new DynamicBitset2();
      bitset.set(100);
      expect(bitset.get(100)).toBe(true);
      expect(bitset.capacity).toBeGreaterThanOrEqual(101);
    });

    it('should throw RangeError for negative index', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.set(-1)).toThrow(RangeError);
      expect(() => bitset.set(-10)).toThrow(RangeError);
    });

    it('should update size when setting bit beyond current size', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      expect(bitset.size).toBe(1);
      bitset.set(10);
      expect(bitset.size).toBe(11);
    });

    it('should handle setting same bit multiple times', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      bitset.set(5);
      expect(bitset.get(5)).toBe(true);
    });

    it('should work across word boundary (bit 31→32)', () => {
      const bitset = new DynamicBitset2();
      bitset.set(31);
      bitset.set(32);
      expect(bitset.get(31)).toBe(true);
      expect(bitset.get(32)).toBe(true);
    });
  });

  describe('unset', () => {
    it('should unset a single bit', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      bitset.unset(5);
      expect(bitset.get(5)).toBe(false);
    });

    it('should throw RangeError for negative index', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.unset(-1)).toThrow(RangeError);
      expect(() => bitset.unset(-10)).toThrow(RangeError);
    });

    it('should handle unsetting bit beyond capacity gracefully', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.unset(1000)).not.toThrow();
    });

    it('should not change size when unsetting', () => {
      const bitset = new DynamicBitset2();
      bitset.set(10);
      bitset.unset(5);
      expect(bitset.size).toBe(11);
    });
  });

  describe('get', () => {
    it('should get unset bit as false', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.get(5)).toBe(false);
    });

    it('should get set bit as true', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      expect(bitset.get(5)).toBe(true);
    });

    it('should throw RangeError for negative index', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.get(-1)).toThrow(RangeError);
      expect(() => bitset.get(-10)).toThrow(RangeError);
    });

    it('should return false for bits beyond capacity', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.get(1000)).toBe(false);
    });

    it('should work across word boundary (bit 31→32)', () => {
      const bitset = new DynamicBitset2();
      bitset.set(31);
      bitset.set(32);
      expect(bitset.get(31)).toBe(true);
      expect(bitset.get(32)).toBe(true);
      expect(bitset.get(30)).toBe(false);
      expect(bitset.get(33)).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle unset bit to true', () => {
      const bitset = new DynamicBitset2();
      const result = bitset.toggle(5);
      expect(result).toBe(true);
      expect(bitset.get(5)).toBe(true);
    });

    it('should toggle set bit to false', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      const result = bitset.toggle(5);
      expect(result).toBe(false);
      expect(bitset.get(5)).toBe(false);
    });

    it('should throw RangeError for negative index', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.toggle(-1)).toThrow(RangeError);
    });

    it('should auto-grow when toggling bit beyond capacity', () => {
      const bitset = new DynamicBitset2();
      const result = bitset.toggle(100);
      expect(result).toBe(true);
      expect(bitset.get(100)).toBe(true);
    });

    it('should update size when toggling bit beyond current size', () => {
      const bitset = new DynamicBitset2();
      bitset.toggle(10);
      expect(bitset.size).toBe(11);
    });
  });

  describe('setRange', () => {
    it('should set range of bits', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(5, 10);
      for (let i = 5; i < 10; i++) {
        expect(bitset.get(i)).toBe(true);
      }
      expect(bitset.get(4)).toBe(false);
      expect(bitset.get(10)).toBe(false);
    });

    it('should throw RangeError for negative start', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.setRange(-1, 10)).toThrow(RangeError);
    });

    it('should throw RangeError when end < start', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.setRange(10, 5)).toThrow(RangeError);
    });

    it('should handle empty range (start === end)', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      bitset.setRange(5, 5);
      expect(bitset.get(5)).toBe(true);
    });

    it('should auto-grow for range beyond capacity', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(50, 100);
      for (let i = 50; i < 100; i++) {
        expect(bitset.get(i)).toBe(true);
      }
    });

    it('should work across word boundary (bit 31→32)', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(30, 35);
      for (let i = 30; i < 35; i++) {
        expect(bitset.get(i)).toBe(true);
      }
    });

    it('should update size to end value', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(5, 10);
      expect(bitset.size).toBe(10);
    });
  });

  describe('unsetRange', () => {
    it('should unset range of bits', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 20);
      bitset.unsetRange(5, 10);
      for (let i = 0; i < 5; i++) {
        expect(bitset.get(i)).toBe(true);
      }
      for (let i = 5; i < 10; i++) {
        expect(bitset.get(i)).toBe(false);
      }
      for (let i = 10; i < 20; i++) {
        expect(bitset.get(i)).toBe(true);
      }
    });

    it('should throw RangeError for negative start', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.unsetRange(-1, 10)).toThrow(RangeError);
    });

    it('should throw RangeError when end < start', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.unsetRange(10, 5)).toThrow(RangeError);
    });

    it('should handle empty range (start === end)', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      bitset.unsetRange(5, 5);
      expect(bitset.get(5)).toBe(true);
    });

    it('should handle range beyond capacity gracefully', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      expect(() => bitset.unsetRange(5, 1000)).not.toThrow();
    });

    it('should work across word boundary (bit 31→32)', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 64);
      bitset.unsetRange(30, 35);
      for (let i = 30; i < 35; i++) {
        expect(bitset.get(i)).toBe(false);
      }
    });
  });

  describe('flipRange', () => {
    it('should flip range of bits', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 10);
      bitset.flipRange(5, 10);
      for (let i = 0; i < 5; i++) {
        expect(bitset.get(i)).toBe(true);
      }
      for (let i = 5; i < 10; i++) {
        expect(bitset.get(i)).toBe(false);
      }
    });

    it('should throw RangeError for negative start', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.flipRange(-1, 10)).toThrow(RangeError);
    });

    it('should throw RangeError when end < start', () => {
      const bitset = new DynamicBitset2();
      expect(() => bitset.flipRange(10, 5)).toThrow(RangeError);
    });

    it('should handle empty range (start === end)', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      bitset.flipRange(5, 5);
      expect(bitset.get(5)).toBe(true);
    });

    it('should auto-grow for range beyond capacity', () => {
      const bitset = new DynamicBitset2();
      bitset.flipRange(50, 100);
      for (let i = 50; i < 100; i++) {
        expect(bitset.get(i)).toBe(true);
      }
    });

    it('should work across word boundary (bit 31→32)', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(30, 35);
      bitset.flipRange(30, 35);
      for (let i = 30; i < 35; i++) {
        expect(bitset.get(i)).toBe(false);
      }
    });

    it('should update size to end value', () => {
      const bitset = new DynamicBitset2();
      bitset.flipRange(5, 10);
      expect(bitset.size).toBe(10);
    });
  });

  describe('countOnes', () => {
    it('should count zero ones in empty bitset', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.countOnes()).toBe(0);
    });

    it('should count single bit', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      expect(bitset.countOnes()).toBe(1);
    });

    it('should count multiple bits', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(5);
      bitset.set(10);
      bitset.set(15);
      expect(bitset.countOnes()).toBe(4);
    });

    it('should count after unsetting', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 10);
      bitset.unset(5);
      expect(bitset.countOnes()).toBe(9);
    });

    it('should work across word boundary', () => {
      const bitset = new DynamicBitset2();
      bitset.set(31);
      bitset.set(32);
      expect(bitset.countOnes()).toBe(2);
    });

    it('should count range correctly', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 50);
      expect(bitset.countOnes()).toBe(50);
    });
  });

  describe('countZeros', () => {
    it('should count all zeros in empty bitset', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.countZeros()).toBe(0);
    });

    it('should count zeros in bitset with some ones', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(5);
      bitset.set(10);
      expect(bitset.countZeros()).toBe(8);
    });

    it('should return 0 when all bits are set', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 10);
      expect(bitset.countZeros()).toBe(0);
    });

    it('should update count after operations', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 10);
      bitset.unset(5);
      expect(bitset.countZeros()).toBe(1);
    });
  });

  describe('bitwise operations', () => {
    describe('and', () => {
      it('should AND two bitsets', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset1.set(5);
        bitset1.set(10);
        bitset2.set(5);
        bitset2.set(10);
        bitset2.set(15);

        const result = bitset1.and(bitset2);
        expect(result.get(0)).toBe(false);
        expect(result.get(5)).toBe(true);
        expect(result.get(10)).toBe(true);
        expect(result.get(15)).toBe(false);
      });

      it('should handle bitsets of different sizes', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset1.set(5);
        bitset2.set(5);

        const result = bitset1.and(bitset2);
        expect(result.get(0)).toBe(false);
        expect(result.get(5)).toBe(true);
      });

      it('should return new bitset', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset2.set(0);

        const result = bitset1.and(bitset2);
        expect(result).not.toBe(bitset1);
        expect(result).not.toBe(bitset2);
      });

      it('should handle empty bitsets', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        const result = bitset1.and(bitset2);
        expect(result.countOnes()).toBe(0);
      });
    });

    describe('or', () => {
      it('should OR two bitsets', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset1.set(5);
        bitset1.set(10);
        bitset2.set(5);
        bitset2.set(10);
        bitset2.set(15);

        const result = bitset1.or(bitset2);
        expect(result.get(0)).toBe(true);
        expect(result.get(5)).toBe(true);
        expect(result.get(10)).toBe(true);
        expect(result.get(15)).toBe(true);
      });

      it('should handle bitsets of different sizes', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset2.set(5);

        const result = bitset1.or(bitset2);
        expect(result.get(0)).toBe(true);
        expect(result.get(5)).toBe(true);
      });

      it('should return new bitset', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset2.set(5);

        const result = bitset1.or(bitset2);
        expect(result).not.toBe(bitset1);
        expect(result).not.toBe(bitset2);
      });

      it('should handle empty bitsets', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        const result = bitset1.or(bitset2);
        expect(result.countOnes()).toBe(0);
      });

      it('should include bits from larger bitset', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(10);
        bitset2.set(20);

        const result = bitset1.or(bitset2);
        expect(result.get(10)).toBe(true);
        expect(result.get(20)).toBe(true);
      });
    });

    describe('xor', () => {
      it('should XOR two bitsets', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset1.set(5);
        bitset1.set(10);
        bitset2.set(5);
        bitset2.set(10);
        bitset2.set(15);

        const result = bitset1.xor(bitset2);
        expect(result.get(0)).toBe(true);
        expect(result.get(5)).toBe(false);
        expect(result.get(10)).toBe(false);
        expect(result.get(15)).toBe(true);
      });

      it('should handle bitsets of different sizes', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset2.set(0);

        const result = bitset1.xor(bitset2);
        expect(result.get(0)).toBe(false);
      });

      it('should return new bitset', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(0);
        bitset2.set(5);

        const result = bitset1.xor(bitset2);
        expect(result).not.toBe(bitset1);
        expect(result).not.toBe(bitset2);
      });

      it('should handle empty bitsets', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        const result = bitset1.xor(bitset2);
        expect(result.countOnes()).toBe(0);
      });

      it('should include bits from larger bitset', () => {
        const bitset1 = new DynamicBitset2();
        const bitset2 = new DynamicBitset2();
        bitset1.set(10);
        bitset2.set(20);

        const result = bitset1.xor(bitset2);
        expect(result.get(10)).toBe(true);
        expect(result.get(20)).toBe(true);
      });
    });

    describe('not', () => {
      it('should NOT a bitset', () => {
        const bitset = new DynamicBitset2();
        bitset.setRange(0, 5);
        const result = bitset.not();

        for (let i = 0; i < 5; i++) {
          expect(result.get(i)).toBe(false);
        }
      });

      it('should return new bitset', () => {
        const bitset = new DynamicBitset2();
        bitset.set(0);
        const result = bitset.not();
        expect(result).not.toBe(bitset);
      });

      it('should handle empty bitset', () => {
        const bitset = new DynamicBitset2();
        const result = bitset.not();
        expect(result.size).toBe(0);
      });

      it('should preserve size', () => {
        const bitset = new DynamicBitset2();
        bitset.set(10);
        expect(bitset.size).toBe(11);
        const result = bitset.not();
        expect(result.size).toBe(11);
      });
    });
  });

  describe('equals', () => {
    it('should return true for equal bitsets', () => {
      const bitset1 = new DynamicBitset2();
      const bitset2 = new DynamicBitset2();
      bitset1.set(0);
      bitset1.set(5);
      bitset2.set(0);
      bitset2.set(5);

      expect(bitset1.equals(bitset2)).toBe(true);
    });

    it('should return false for different bitsets', () => {
      const bitset1 = new DynamicBitset2();
      const bitset2 = new DynamicBitset2();
      bitset1.set(0);
      bitset1.set(5);
      bitset2.set(0);
      bitset2.set(10);

      expect(bitset1.equals(bitset2)).toBe(false);
    });

    it('should return false for different sizes', () => {
      const bitset1 = new DynamicBitset2();
      const bitset2 = new DynamicBitset2();
      bitset1.set(0);
      bitset2.set(0);
      bitset2.set(5);

      expect(bitset1.equals(bitset2)).toBe(false);
    });

    it('should return true for empty bitsets', () => {
      const bitset1 = new DynamicBitset2();
      const bitset2 = new DynamicBitset2();

      expect(bitset1.equals(bitset2)).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create deep copy of bitset', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(5);
      bitset.set(10);

      const clone = bitset.clone();

      expect(clone.equals(bitset)).toBe(true);
      expect(clone).not.toBe(bitset);
    });

    it('should not modify original when clone is modified', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(5);

      const clone = bitset.clone();
      clone.set(10);

      expect(bitset.get(10)).toBe(false);
      expect(clone.get(10)).toBe(true);
    });

    it('should clone empty bitset', () => {
      const bitset = new DynamicBitset2();
      const clone = bitset.clone();

      expect(clone.size).toBe(0);
      expect(clone.equals(bitset)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should convert empty bitset to empty array', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.toArray()).toEqual([]);
    });

    it('should convert single bit to array', () => {
      const bitset = new DynamicBitset2();
      bitset.set(5);
      expect(bitset.toArray()).toEqual([5]);
    });

    it('should convert multiple bits to array', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(5);
      bitset.set(10);
      bitset.set(15);
      expect(bitset.toArray()).toEqual([0, 5, 10, 15]);
    });

    it('should return sorted array', () => {
      const bitset = new DynamicBitset2();
      bitset.set(15);
      bitset.set(0);
      bitset.set(10);
      bitset.set(5);
      expect(bitset.toArray()).toEqual([0, 5, 10, 15]);
    });

    it('should update after modifications', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(5);
      bitset.unset(5);
      expect(bitset.toArray()).toEqual([0]);
    });

    it('should work across word boundary', () => {
      const bitset = new DynamicBitset2();
      bitset.set(31);
      bitset.set(32);
      expect(bitset.toArray()).toEqual([31, 32]);
    });
  });

  describe('toString', () => {
    it('should convert empty bitset to empty string', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.toString()).toBe('');
    });

    it('should convert single bit to string', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      expect(bitset.toString()).toBe('1');
    });

    it('should convert multiple bits to string', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(2);
      bitset.set(4);
      expect(bitset.toString()).toBe('10101');
    });

    it('should include zeros', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      bitset.set(4);
      expect(bitset.toString()).toBe('10001');
    });

    it('should only include bits up to size', () => {
      const bitset = new DynamicBitset2();
      bitset.set(10);
      expect(bitset.toString()).toBe('00000000001');
    });

    it('should work across word boundary', () => {
      const bitset = new DynamicBitset2();
      bitset.set(30);
      bitset.set(31);
      bitset.set(32);
      expect(bitset.toString().length).toBe(33);
    });
  });

  describe('size property', () => {
    it('should return 0 for empty bitset', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.size).toBe(0);
    });

    it('should return highest set bit + 1', () => {
      const bitset = new DynamicBitset2();
      bitset.set(0);
      expect(bitset.size).toBe(1);
      bitset.set(5);
      expect(bitset.size).toBe(6);
      bitset.set(10);
      expect(bitset.size).toBe(11);
    });

    it('should not decrease when unsetting highest bit', () => {
      const bitset = new DynamicBitset2();
      bitset.set(10);
      expect(bitset.size).toBe(11);
      bitset.unset(10);
      expect(bitset.size).toBe(11);
    });

    it('should increase with setRange', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(5, 10);
      expect(bitset.size).toBe(10);
    });

    it('should increase with flipRange', () => {
      const bitset = new DynamicBitset2();
      bitset.flipRange(5, 10);
      expect(bitset.size).toBe(10);
    });
  });

  describe('capacity property', () => {
    it('should return initial capacity for empty bitset', () => {
      const bitset = new DynamicBitset2();
      expect(bitset.capacity).toBe(32);
    });

    it('should return capacity for bitset with initial capacity', () => {
      const bitset = new DynamicBitset2(100);
      expect(bitset.capacity).toBeGreaterThanOrEqual(100);
    });

    it('should increase when setting bit beyond capacity', () => {
      const bitset = new DynamicBitset2();
      const initialCapacity = bitset.capacity;
      bitset.set(100);
      expect(bitset.capacity).toBeGreaterThan(initialCapacity);
    });

    it('should increase with setRange beyond capacity', () => {
      const bitset = new DynamicBitset2();
      const initialCapacity = bitset.capacity;
      bitset.setRange(50, 100);
      expect(bitset.capacity).toBeGreaterThan(initialCapacity);
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed operations correctly', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 10);
      bitset.unsetRange(3, 7);
      bitset.flipRange(5, 8);

      expect(bitset.get(0)).toBe(true);
      expect(bitset.get(1)).toBe(true);
      expect(bitset.get(2)).toBe(true);
      expect(bitset.get(3)).toBe(false);
      expect(bitset.get(4)).toBe(false);
      expect(bitset.get(5)).toBe(true);
      expect(bitset.get(6)).toBe(true);
      expect(bitset.get(7)).toBe(false);
      expect(bitset.get(8)).toBe(true);
      expect(bitset.get(9)).toBe(true);
    });

    it('should handle large bitsets efficiently', () => {
      const bitset = new DynamicBitset2();
      bitset.setRange(0, 1000);
      expect(bitset.countOnes()).toBe(1000);
      expect(bitset.countZeros()).toBe(0);
    });

    it('should work with sparse bitsets', () => {
      const bitset = new DynamicBitset2();
      bitset.set(10);
      bitset.set(100);
      bitset.set(1000);

      expect(bitset.toArray()).toEqual([10, 100, 1000]);
      expect(bitset.countOnes()).toBe(3);
    });

    it('should handle bitwise operations on large bitsets', () => {
      const bitset1 = new DynamicBitset2();
      const bitset2 = new DynamicBitset2();
      bitset1.setRange(0, 100);
      bitset2.setRange(50, 150);

      const andResult = bitset1.and(bitset2);
      expect(andResult.countOnes()).toBe(50);

      const orResult = bitset1.or(bitset2);
      expect(orResult.countOnes()).toBe(150);

      const xorResult = bitset1.xor(bitset2);
      expect(xorResult.countOnes()).toBe(100);
    });
  });
});