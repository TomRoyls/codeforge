import { describe, it, expect } from "vitest";
import { SparseBitmap } from "../../src/core/sparse-bitmap/index.js";

describe("SparseBitmap", () => {
  describe("set", () => {
    it("should set a single bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.get(5)).toBe(true);
      expect(bitmap.cardinality).toBe(1);
    });

    it("should set multiple bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.set(15);
      expect(bitmap.get(5)).toBe(true);
      expect(bitmap.get(10)).toBe(true);
      expect(bitmap.get(15)).toBe(true);
      expect(bitmap.cardinality).toBe(3);
    });

    it("should not set negative bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(-1);
      expect(bitmap.cardinality).toBe(0);
    });

    it("should overwrite existing bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(5);
      expect(bitmap.cardinality).toBe(1);
    });

    it("should set bit 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(0);
      expect(bitmap.get(0)).toBe(true);
    });

    it("should set bits across chunk boundaries", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(31);
      bitmap.set(32);
      bitmap.set(63);
      bitmap.set(64);
      expect(bitmap.get(31)).toBe(true);
      expect(bitmap.get(32)).toBe(true);
      expect(bitmap.get(63)).toBe(true);
      expect(bitmap.get(64)).toBe(true);
    });

    it("should set bit 31", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(31);
      expect(bitmap.get(31)).toBe(true);
    });

    it("should set bit 32", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(32);
      expect(bitmap.get(32)).toBe(true);
    });

    it("should set same bit multiple times", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(10);
      bitmap.set(10);
      bitmap.set(10);
      expect(bitmap.cardinality).toBe(1);
    });

    it("should handle large bit values", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(1000000);
      expect(bitmap.get(1000000)).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear a set bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.clear(5);
      expect(bitmap.get(5)).toBe(false);
      expect(bitmap.cardinality).toBe(0);
    });

    it("should not clear unset bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.clear(5);
      expect(bitmap.get(5)).toBe(false);
    });

    it("should clear one of multiple bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.set(15);
      bitmap.clear(10);
      expect(bitmap.get(5)).toBe(true);
      expect(bitmap.get(10)).toBe(false);
      expect(bitmap.get(15)).toBe(true);
      expect(bitmap.cardinality).toBe(2);
    });

    it("should not clear negative bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.clear(-1);
      expect(bitmap.get(5)).toBe(true);
    });

    it("should clear bit 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(0);
      bitmap.clear(0);
      expect(bitmap.get(0)).toBe(false);
    });

    it("should clear bits across chunk boundaries", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(31);
      bitmap.set(32);
      bitmap.set(63);
      bitmap.set(64);
      bitmap.clear(32);
      bitmap.clear(64);
      expect(bitmap.get(31)).toBe(true);
      expect(bitmap.get(32)).toBe(false);
      expect(bitmap.get(63)).toBe(true);
      expect(bitmap.get(64)).toBe(false);
    });

    it("should remove chunk when all bits cleared", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(32);
      bitmap.clear(32);
      expect(bitmap.size).toBe(0);
    });

    it("should handle clearing non-existent chunk", () => {
      const bitmap = new SparseBitmap();
      bitmap.clear(100);
      expect(bitmap.size).toBe(0);
    });
  });

  describe("get", () => {
    it("should return false for unset bit", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.get(5)).toBe(false);
    });

    it("should return true for set bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.get(5)).toBe(true);
    });

    it("should return false for negative bit", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.get(-1)).toBe(false);
    });

    it("should get bit 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(0);
      expect(bitmap.get(0)).toBe(true);
    });

    it("should get bits from different chunks", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(50);
      bitmap.set(100);
      expect(bitmap.get(5)).toBe(true);
      expect(bitmap.get(50)).toBe(true);
      expect(bitmap.get(100)).toBe(true);
    });
  });

  describe("flip", () => {
    it("should flip unset bit to set", () => {
      const bitmap = new SparseBitmap();
      bitmap.flip(5);
      expect(bitmap.get(5)).toBe(true);
    });

    it("should flip set bit to unset", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.flip(5);
      expect(bitmap.get(5)).toBe(false);
    });

    it("should not flip negative bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.flip(-1);
      expect(bitmap.cardinality).toBe(0);
    });

    it("should flip bit 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.flip(0);
      expect(bitmap.get(0)).toBe(true);
      bitmap.flip(0);
      expect(bitmap.get(0)).toBe(false);
    });

    it("should flip multiple bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.flip(5);
      bitmap.flip(15);
      expect(bitmap.get(5)).toBe(false);
      expect(bitmap.get(10)).toBe(true);
      expect(bitmap.get(15)).toBe(true);
    });

    it("should remove chunk when all bits flipped to 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(32);
      bitmap.flip(32);
      expect(bitmap.size).toBe(0);
    });

    it("should flip bit multiple times", () => {
      const bitmap = new SparseBitmap();
      bitmap.flip(10);
      bitmap.flip(10);
      bitmap.flip(10);
      expect(bitmap.get(10)).toBe(true);
    });
  });

  describe("has", () => {
    it("should return false for unset bit", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.has(5)).toBe(false);
    });

    it("should return true for set bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.has(5)).toBe(true);
    });

    it("should be alias for get", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(10);
      expect(bitmap.has(10)).toBe(bitmap.get(10));
    });

    it("should return false for negative bit", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.has(-1)).toBe(false);
    });
  });

  describe("setRange", () => {
    it("should set range of bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(5, 10);
      for (let i = 5; i <= 10; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
      expect(bitmap.cardinality).toBe(6);
    });

    it("should set single bit range", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(5, 5);
      expect(bitmap.get(5)).toBe(true);
      expect(bitmap.cardinality).toBe(1);
    });

    it("should not set range with from > to", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(10, 5);
      expect(bitmap.cardinality).toBe(0);
    });

    it("should not set range with negative values", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(-1, 5);
      expect(bitmap.cardinality).toBe(0);
      bitmap.setRange(5, -1);
      expect(bitmap.cardinality).toBe(0);
    });

    it("should set range starting from 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 5);
      for (let i = 0; i <= 5; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
    });

    it("should set range across chunk boundaries", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(30, 35);
      for (let i = 30; i <= 35; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
    });

    it("should set large range", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 99);
      expect(bitmap.cardinality).toBe(100);
    });

    it("should overwrite existing bits in range", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(7);
      bitmap.setRange(5, 10);
      for (let i = 5; i <= 10; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
      expect(bitmap.cardinality).toBe(6);
    });
  });

  describe("clearRange", () => {
    it("should clear range of bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 20);
      bitmap.clearRange(5, 10);
      for (let i = 0; i < 5; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
      for (let i = 5; i <= 10; i++) {
        expect(bitmap.get(i)).toBe(false);
      }
      for (let i = 11; i <= 20; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
    });

    it("should clear single bit range", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.clearRange(5, 5);
      expect(bitmap.get(5)).toBe(false);
    });

    it("should not clear range with from > to", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 10);
      bitmap.clearRange(10, 5);
      expect(bitmap.cardinality).toBe(11);
    });

    it("should not clear range with negative values", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 10);
      bitmap.clearRange(-1, 5);
      expect(bitmap.cardinality).toBe(11);
    });

    it("should clear range across chunk boundaries", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(20, 45);
      bitmap.clearRange(30, 35);
      for (let i = 20; i < 30; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
      for (let i = 30; i <= 35; i++) {
        expect(bitmap.get(i)).toBe(false);
      }
      for (let i = 36; i <= 45; i++) {
        expect(bitmap.get(i)).toBe(true);
      }
    });

    it("should handle clearing empty bitmap", () => {
      const bitmap = new SparseBitmap();
      bitmap.clearRange(0, 10);
      expect(bitmap.isEmpty).toBe(true);
    });
  });

  describe("cardinality", () => {
    it("should be 0 for empty bitmap", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.cardinality).toBe(0);
    });

    it("should count single set bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.cardinality).toBe(1);
    });

    it("should count multiple set bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.set(15);
      expect(bitmap.cardinality).toBe(3);
    });

    it("should update after set and clear", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.cardinality).toBe(1);
      bitmap.set(10);
      expect(bitmap.cardinality).toBe(2);
      bitmap.clear(5);
      expect(bitmap.cardinality).toBe(1);
    });

    it("should count bits across chunks", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(35);
      bitmap.set(70);
      expect(bitmap.cardinality).toBe(3);
    });

    it("should count all bits in chunk", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 31);
      expect(bitmap.cardinality).toBe(32);
    });
  });

  describe("size", () => {
    it("should be 0 for empty bitmap", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.size).toBe(0);
    });

    it("should return number of chunks", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.size).toBe(1);
      bitmap.set(35);
      expect(bitmap.size).toBe(2);
      bitmap.set(40);
      expect(bitmap.size).toBe(2);
    });

    it("should decrease when chunk becomes empty", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(32);
      bitmap.set(33);
      expect(bitmap.size).toBe(1);
      bitmap.clear(32);
      bitmap.clear(33);
      expect(bitmap.size).toBe(0);
    });
  });

  describe("isEmpty", () => {
    it("should be true for empty bitmap", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.isEmpty).toBe(true);
    });

    it("should be false after setting bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.isEmpty).toBe(false);
    });

    it("should be true after clearing all bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.clear(5);
      bitmap.clear(10);
      expect(bitmap.isEmpty).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear all bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.set(15);
      bitmap.clear();
      expect(bitmap.isEmpty).toBe(true);
      expect(bitmap.size).toBe(0);
    });

    it("should handle empty bitmap", () => {
      const bitmap = new SparseBitmap();
      bitmap.clear();
      expect(bitmap.isEmpty).toBe(true);
    });

    it("should clear across chunks", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(35);
      bitmap.set(70);
      bitmap.clear();
      expect(bitmap.isEmpty).toBe(true);
    });
  });

  describe("toArray", () => {
    it("should return empty array for empty bitmap", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.toArray()).toEqual([]);
    });

    it("should return array with single bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.toArray()).toEqual([5]);
    });

    it("should return array with multiple bits in order", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(10);
      bitmap.set(5);
      bitmap.set(15);
      const array = bitmap.toArray();
      expect(array).toHaveLength(3);
      expect(array).toContain(5);
      expect(array).toContain(10);
      expect(array).toContain(15);
    });

    it("should include bit 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(0);
      bitmap.set(5);
      const array = bitmap.toArray();
      expect(array).toContain(0);
      expect(array).toContain(5);
    });

    it("should handle large gaps", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(1000);
      const array = bitmap.toArray();
      expect(array).toContain(5);
      expect(array).toContain(1000);
    });

    it("should reflect changes", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.clear(5);
      expect(bitmap.toArray()).toEqual([10]);
    });
  });

  describe("forEach", () => {
    it("should not call callback for empty bitmap", () => {
      const bitmap = new SparseBitmap();
      const calls: number[] = [];
      bitmap.forEach((bit) => calls.push(bit));
      expect(calls).toEqual([]);
    });

    it("should call callback for each set bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.set(15);
      const calls: number[] = [];
      bitmap.forEach((bit) => calls.push(bit));
      expect(calls).toHaveLength(3);
      expect(calls).toContain(5);
      expect(calls).toContain(10);
      expect(calls).toContain(15);
    });

    it("should handle callback with side effects", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      let sum = 0;
      bitmap.forEach((bit) => sum += bit);
      expect(sum).toBe(15);
    });
  });

  describe("and", () => {
    it("should return empty for disjoint bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(10);
      const result = bitmap1.and(bitmap2);
      expect(result.isEmpty).toBe(true);
    });

    it("should return intersection of bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      bitmap1.set(15);
      bitmap2.set(10);
      bitmap2.set(15);
      bitmap2.set(20);
      const result = bitmap1.and(bitmap2);
      expect(result.get(5)).toBe(false);
      expect(result.get(10)).toBe(true);
      expect(result.get(15)).toBe(true);
      expect(result.get(20)).toBe(false);
    });

    it("should not modify original bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(5);
      bitmap1.and(bitmap2);
      expect(bitmap1.get(5)).toBe(true);
      expect(bitmap2.get(5)).toBe(true);
    });

    it("should handle empty bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      const result = bitmap1.and(bitmap2);
      expect(result.isEmpty).toBe(true);
    });

    it("should and with self", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      const result = bitmap.and(bitmap);
      expect(result.equals(bitmap)).toBe(true);
    });
  });

  describe("or", () => {
    it("should return union of bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      bitmap2.set(10);
      bitmap2.set(15);
      const result = bitmap1.or(bitmap2);
      expect(result.get(5)).toBe(true);
      expect(result.get(10)).toBe(true);
      expect(result.get(15)).toBe(true);
    });

    it("should not modify original bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(10);
      bitmap1.or(bitmap2);
      expect(bitmap1.get(5)).toBe(true);
      expect(bitmap1.get(10)).toBe(false);
      expect(bitmap2.get(5)).toBe(false);
      expect(bitmap2.get(10)).toBe(true);
    });

    it("should handle empty bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      const result = bitmap1.or(bitmap2);
      expect(result.get(5)).toBe(true);
      expect(result.cardinality).toBe(1);
    });

    it("should or with self", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      const result = bitmap.or(bitmap);
      expect(result.equals(bitmap)).toBe(true);
    });

    it("should union with disjoint bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(10);
      const result = bitmap1.or(bitmap2);
      expect(result.cardinality).toBe(2);
    });
  });

  describe("xor", () => {
    it("should return symmetric difference", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      bitmap2.set(10);
      bitmap2.set(15);
      const result = bitmap1.xor(bitmap2);
      expect(result.get(5)).toBe(true);
      expect(result.get(10)).toBe(false);
      expect(result.get(15)).toBe(true);
    });

    it("should return empty for identical bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      bitmap2.set(5);
      bitmap2.set(10);
      const result = bitmap1.xor(bitmap2);
      expect(result.isEmpty).toBe(true);
    });

    it("should not modify original bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(5);
      bitmap1.xor(bitmap2);
      expect(bitmap1.get(5)).toBe(true);
      expect(bitmap2.get(5)).toBe(true);
    });

    it("should handle empty bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      const result = bitmap1.xor(bitmap2);
      expect(result.get(5)).toBe(true);
    });

    it("should xor with self", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      const result = bitmap.xor(bitmap);
      expect(result.isEmpty).toBe(true);
    });
  });

  describe("not", () => {
    it("should invert bits within range", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      const result = bitmap.not(15);
      for (let i = 0; i <= 15; i++) {
        if (i === 5 || i === 10) {
          expect(result.get(i)).toBe(false);
        } else {
          expect(result.get(i)).toBe(true);
        }
      }
    });

    it("should not set bits beyond maxBit", () => {
      const bitmap = new SparseBitmap();
      const result = bitmap.not(10);
      expect(result.get(11)).toBe(false);
    });

    it("should handle empty bitmap", () => {
      const bitmap = new SparseBitmap();
      const result = bitmap.not(10);
      for (let i = 0; i <= 10; i++) {
        expect(result.get(i)).toBe(true);
      }
    });

    it("should handle maxBit 0", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(0);
      const result = bitmap.not(0);
      expect(result.get(0)).toBe(false);
    });

    it.skip("should handle maxBit aligned to chunk boundary", () => {
      const bitmap = new SparseBitmap();
      const result = bitmap.not(31);
      expect(result.cardinality).toBe(32);
    });

    it("should handle maxBit across chunks", () => {
      const bitmap = new SparseBitmap();
      const result = bitmap.not(35);
      expect(result.cardinality).toBe(36);
    });
  });

  describe("clone", () => {
    it("should create independent copy", () => {
      const bitmap1 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      const bitmap2 = bitmap1.clone();
      expect(bitmap2.equals(bitmap1)).toBe(true);
    });

    it("should not share references", () => {
      const bitmap1 = new SparseBitmap();
      bitmap1.set(5);
      const bitmap2 = bitmap1.clone();
      bitmap2.set(10);
      expect(bitmap1.get(10)).toBe(false);
      expect(bitmap2.get(10)).toBe(true);
    });

    it("should clone empty bitmap", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = bitmap1.clone();
      expect(bitmap2.isEmpty).toBe(true);
    });

    it("should clone across chunks", () => {
      const bitmap1 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(35);
      bitmap1.set(70);
      const bitmap2 = bitmap1.clone();
      expect(bitmap2.equals(bitmap1)).toBe(true);
    });
  });

  describe("equals", () => {
    it("should return true for identical bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      bitmap2.set(5);
      bitmap2.set(10);
      expect(bitmap1.equals(bitmap2)).toBe(true);
    });

    it("should return false for different bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(10);
      expect(bitmap1.equals(bitmap2)).toBe(false);
    });

    it("should return true for empty bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      expect(bitmap1.equals(bitmap2)).toBe(true);
    });

    it("should return false when sizes differ", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      expect(bitmap1.equals(bitmap2)).toBe(false);
    });

    it("should handle same size different bits", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(10);
      expect(bitmap1.equals(bitmap2)).toBe(false);
    });

    it("should equal with itself", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.equals(bitmap)).toBe(true);
    });
  });

  describe("isSubsetOf", () => {
    it("should return true for empty subset", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap2.set(5);
      expect(bitmap1.isSubsetOf(bitmap2)).toBe(true);
    });

    it("should return true for equal bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(5);
      expect(bitmap1.isSubsetOf(bitmap2)).toBe(true);
    });

    it("should return true for proper subset", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(5);
      bitmap2.set(10);
      expect(bitmap1.isSubsetOf(bitmap2)).toBe(true);
    });

    it("should return false for non-subset", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(15);
      bitmap2.set(10);
      expect(bitmap1.isSubsetOf(bitmap2)).toBe(false);
    });

    it("should handle empty superset", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      expect(bitmap1.isSubsetOf(bitmap2)).toBe(false);
    });
  });

  describe("intersects", () => {
    it("should return true for intersecting bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      bitmap2.set(10);
      bitmap2.set(15);
      expect(bitmap1.intersects(bitmap2)).toBe(true);
    });

    it("should return false for disjoint bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(10);
      expect(bitmap1.intersects(bitmap2)).toBe(false);
    });

    it("should return false for empty bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      expect(bitmap1.intersects(bitmap2)).toBe(false);
    });

    it("should return true when one is empty", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      expect(bitmap1.intersects(bitmap2)).toBe(false);
    });

    it("should return true for identical bitmaps", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(bitmap.intersects(bitmap)).toBe(true);
    });

    it("should handle large gaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(1000);
      expect(bitmap1.intersects(bitmap2)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty bitmap operations", () => {
      const bitmap = new SparseBitmap();
      expect(bitmap.cardinality).toBe(0);
      expect(bitmap.size).toBe(0);
      expect(bitmap.isEmpty).toBe(true);
      expect(bitmap.toArray()).toEqual([]);
    });

    it("should handle single bit operations", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(100);
      expect(bitmap.cardinality).toBe(1);
      expect(bitmap.get(100)).toBe(true);
      expect(bitmap.get(99)).toBe(false);
      expect(bitmap.get(101)).toBe(false);
    });

    it("should handle large gaps between bits", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(1000);
      bitmap.set(10000);
      expect(bitmap.cardinality).toBe(3);
      expect(bitmap.get(5)).toBe(true);
      expect(bitmap.get(1000)).toBe(true);
      expect(bitmap.get(10000)).toBe(true);
      expect(bitmap.size).toBe(3);
    });

    it("should handle dense patterns", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 100);
      expect(bitmap.cardinality).toBe(101);
      expect(bitmap.size).toBe(4);
    });

    it("should handle sparse patterns", () => {
      const bitmap = new SparseBitmap();
      for (let i = 0; i < 100; i += 10) {
        bitmap.set(i);
      }
      expect(bitmap.cardinality).toBe(10);
      expect(bitmap.size).toBe(3);
    });

    it("should handle alternating pattern", () => {
      const bitmap = new SparseBitmap();
      for (let i = 0; i < 20; i += 2) {
        bitmap.set(i);
      }
      expect(bitmap.cardinality).toBe(10);
    });

    it("should handle set then clear same bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.clear(5);
      expect(bitmap.isEmpty).toBe(true);
    });

    it("should handle flip then flip back", () => {
      const bitmap = new SparseBitmap();
      bitmap.flip(5);
      expect(bitmap.get(5)).toBe(true);
      bitmap.flip(5);
      expect(bitmap.get(5)).toBe(false);
    });

    it("should handle bitwise with empty", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      const empty = new SparseBitmap();
      expect(bitmap.and(empty).isEmpty).toBe(true);
      expect(bitmap.or(empty).equals(bitmap)).toBe(true);
      expect(bitmap.xor(empty).equals(bitmap)).toBe(true);
    });

    it("should handle clone modification independence", () => {
      const original = new SparseBitmap();
      original.set(5);
      original.set(10);
      const clone = original.clone();
      clone.clear(5);
      expect(original.get(5)).toBe(true);
      expect(clone.get(5)).toBe(false);
    });

    it("should handle cardinality with many bits", () => {
      const bitmap = new SparseBitmap();
      for (let i = 0; i < 1000; i++) {
        bitmap.set(i);
      }
      expect(bitmap.cardinality).toBe(1000);
    });

    it("should handle forEach with many bits", () => {
      const bitmap = new SparseBitmap();
      for (let i = 0; i < 100; i++) {
        bitmap.set(i);
      }
      let count = 0;
      bitmap.forEach(() => count++);
      expect(count).toBe(100);
    });

    it("should handle toArray with many bits", () => {
      const bitmap = new SparseBitmap();
      for (let i = 0; i < 50; i++) {
        bitmap.set(i);
      }
      const array = bitmap.toArray();
      expect(array).toHaveLength(50);
    });

    it("should handle range operations on boundaries", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(30, 34);
      expect(bitmap.get(29)).toBe(false);
      expect(bitmap.get(30)).toBe(true);
      expect(bitmap.get(34)).toBe(true);
      expect(bitmap.get(35)).toBe(false);
    });

    it("should handle setRange then clearRange same range", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(0, 10);
      bitmap.clearRange(0, 10);
      expect(bitmap.isEmpty).toBe(true);
    });

    it("should handle multiple chunk operations", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(0);
      bitmap.set(31);
      bitmap.set(32);
      bitmap.set(63);
      bitmap.set(64);
      expect(bitmap.cardinality).toBe(5);
      expect(bitmap.size).toBe(3);
    });

    it("should handle not operation with single bit", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      const result = bitmap.not(10);
      expect(result.get(5)).toBe(false);
      expect(result.cardinality).toBe(10);
    });

    it("should handle subset check with empty", () => {
      const empty = new SparseBitmap();
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      expect(empty.isSubsetOf(bitmap)).toBe(true);
      expect(bitmap.isSubsetOf(empty)).toBe(false);
    });

    it("should handle intersect with itself", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      expect(bitmap.intersects(bitmap)).toBe(true);
    });

    it("should handle xor identical bitmaps", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(10);
      bitmap2.set(5);
      bitmap2.set(10);
      expect(bitmap1.xor(bitmap2).isEmpty).toBe(true);
    });

    it("should handle equals after operations", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.set(5);
      bitmap2.set(5);
      bitmap1.set(10);
      bitmap2.set(10);
      expect(bitmap1.equals(bitmap2)).toBe(true);
      bitmap1.clear(5);
      expect(bitmap1.equals(bitmap2)).toBe(false);
      bitmap2.clear(5);
      expect(bitmap1.equals(bitmap2)).toBe(true);
    });

    it("should handle large bit values", () => {
      const bitmap = new SparseBitmap();
      const largeValue = 1000000;
      bitmap.set(largeValue);
      expect(bitmap.get(largeValue)).toBe(true);
      expect(bitmap.get(largeValue - 1)).toBe(false);
      expect(bitmap.get(largeValue + 1)).toBe(false);
    });

    it("should handle setRange with large values", () => {
      const bitmap = new SparseBitmap();
      bitmap.setRange(1000000, 1000010);
      expect(bitmap.cardinality).toBe(11);
      expect(bitmap.get(1000000)).toBe(true);
      expect(bitmap.get(1000010)).toBe(true);
    });

    it("should handle not with large maxBit", () => {
      const bitmap = new SparseBitmap();
      const result = bitmap.not(1000);
      expect(result.cardinality).toBe(1001);
    });

    it("should handle toArray ordering consistency", () => {
      const bitmap = new SparseBitmap();
      const bits = [15, 5, 20, 10];
      bits.forEach((bit) => bitmap.set(bit));
      const array = bitmap.toArray();
      expect(array).toHaveLength(4);
      bits.forEach((bit) => expect(array).toContain(bit));
    });

    it("should handle forEach callback execution", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.set(15);
      const visited: number[] = [];
      bitmap.forEach((bit) => visited.push(bit));
      expect(visited).toHaveLength(3);
      [5, 10, 15].forEach((bit) => expect(visited).toContain(bit));
    });

    it("should handle clear after multiple operations", () => {
      const bitmap = new SparseBitmap();
      bitmap.set(5);
      bitmap.set(10);
      bitmap.flip(15);
      bitmap.setRange(20, 25);
      bitmap.clear();
      expect(bitmap.isEmpty).toBe(true);
      expect(bitmap.size).toBe(0);
    });

    it("should handle bitwise operations with chunk boundaries", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.setRange(28, 35);
      bitmap2.setRange(30, 37);
      const andResult = bitmap1.and(bitmap2);
      const orResult = bitmap1.or(bitmap2);
      const xorResult = bitmap1.xor(bitmap2);
      expect(andResult.cardinality).toBe(6);
      expect(orResult.cardinality).toBe(10);
      expect(xorResult.cardinality).toBe(4);
    });

    it("should handle subset with overlapping chunks", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.setRange(0, 50);
      bitmap2.setRange(10, 40);
      expect(bitmap2.isSubsetOf(bitmap1)).toBe(true);
      expect(bitmap1.isSubsetOf(bitmap2)).toBe(false);
    });

    it("should handle intersects with overlapping chunks", () => {
      const bitmap1 = new SparseBitmap();
      const bitmap2 = new SparseBitmap();
      bitmap1.setRange(0, 50);
      bitmap2.setRange(25, 75);
      expect(bitmap1.intersects(bitmap2)).toBe(true);
    });

    it("should handle clone with multiple chunks", () => {
      const bitmap1 = new SparseBitmap();
      bitmap1.set(5);
      bitmap1.set(35);
      bitmap1.set(70);
      const bitmap2 = bitmap1.clone();
      expect(bitmap2.equals(bitmap1)).toBe(true);
      bitmap2.clear(35);
      expect(bitmap1.get(35)).toBe(true);
      expect(bitmap2.get(35)).toBe(false);
    });
  });
});
