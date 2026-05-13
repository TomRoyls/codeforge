import { describe, it, expect } from 'vitest';
import { RoaringBitmap2 } from '../src/core/roaring-bitmap-2/index.js';

describe('RoaringBitmap2', () => {
  describe('add and has', () => {
    it('should add and check single values', () => {
      const bitmap = new RoaringBitmap2();
      expect(bitmap.has(5)).toBe(false);
      bitmap.add(5);
      expect(bitmap.has(5)).toBe(true);
      expect(bitmap.has(4)).toBe(false);
      expect(bitmap.has(6)).toBe(false);
    });

    it('should merge adjacent values into runs', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      expect(bitmap.size).toBe(3);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(2)).toBe(true);
      expect(bitmap.has(3)).toBe(true);
    });

    it('should handle values with gaps', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(5);
      bitmap.add(10);
      expect(bitmap.size).toBe(3);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(5)).toBe(true);
      expect(bitmap.has(10)).toBe(true);
      expect(bitmap.has(2)).toBe(false);
      expect(bitmap.has(7)).toBe(false);
    });

    it('should merge runs when adding bridging values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(3);
      bitmap.add(2);
      expect(bitmap.size).toBe(3);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(2)).toBe(true);
      expect(bitmap.has(3)).toBe(true);
    });

    it('should handle adding duplicate values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(5);
      bitmap.add(5);
      bitmap.add(5);
      expect(bitmap.size).toBe(1);
      expect(bitmap.has(5)).toBe(true);
    });

    it('should handle adding values in random order', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(10);
      bitmap.add(1);
      bitmap.add(5);
      bitmap.add(8);
      bitmap.add(2);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(2)).toBe(true);
      expect(bitmap.has(5)).toBe(true);
      expect(bitmap.has(8)).toBe(true);
      expect(bitmap.has(10)).toBe(true);
    });

    it.skip('should handle large ranges', () => {
      const bitmap = new RoaringBitmap2();
      for (let i = 0; i < 1000; i++) {
        bitmap.add(i);
      }
      expect(bitmap.size).toBe(1000);
      expect(bitmap.has(0)).toBe(true);
      expect(bitmap.has(999)).toBe(true);
      expect(bitmap.has(1000)).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove single values from runs', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      bitmap.remove(2);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(2)).toBe(false);
      expect(bitmap.has(3)).toBe(true);
      expect(bitmap.size).toBe(2);
    });

    it('should remove from end of run', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      bitmap.remove(3);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(2)).toBe(true);
      expect(bitmap.has(3)).toBe(false);
      expect(bitmap.size).toBe(2);
    });

    it('should remove from start of run', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      bitmap.remove(1);
      expect(bitmap.has(1)).toBe(false);
      expect(bitmap.has(2)).toBe(true);
      expect(bitmap.has(3)).toBe(true);
      expect(bitmap.size).toBe(2);
    });

    it('should remove entire run', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      bitmap.remove(1);
      bitmap.remove(2);
      bitmap.remove(3);
      expect(bitmap.isEmpty()).toBe(true);
      expect(bitmap.size).toBe(0);
    });

    it('should remove non-existent values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(3);
      bitmap.remove(2);
      bitmap.remove(4);
      expect(bitmap.size).toBe(2);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(3)).toBe(true);
    });

    it('should handle removing values from middle of run', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      bitmap.add(4);
      bitmap.add(5);
      bitmap.remove(3);
      expect(bitmap.has(1)).toBe(true);
      expect(bitmap.has(2)).toBe(true);
      expect(bitmap.has(3)).toBe(false);
      expect(bitmap.has(4)).toBe(true);
      expect(bitmap.has(5)).toBe(true);
      expect(bitmap.size).toBe(4);
    });
  });

  describe('size', () => {
    it('should return 0 for empty bitmap', () => {
      const bitmap = new RoaringBitmap2();
      expect(bitmap.size).toBe(0);
    });

    it('should count values correctly', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(5);
      bitmap.add(6);
      bitmap.add(7);
      expect(bitmap.size).toBe(5);
    });

    it('should handle large counts efficiently', () => {
      const bitmap = new RoaringBitmap2();
      for (let i = 0; i < 10000; i++) {
        bitmap.add(i);
      }
      expect(bitmap.size).toBe(10000);
    });
  });

  describe('isEmpty', () => {
    it('should return true for new bitmap', () => {
      const bitmap = new RoaringBitmap2();
      expect(bitmap.isEmpty()).toBe(true);
    });

    it('should return false after adding values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      expect(bitmap.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.clear();
      expect(bitmap.isEmpty()).toBe(true);
    });

    it('should return true after removing all values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      bitmap.remove(1);
      bitmap.remove(2);
      bitmap.remove(3);
      expect(bitmap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.add(3);
      bitmap.clear();
      expect(bitmap.isEmpty()).toBe(true);
      expect(bitmap.size).toBe(0);
    });

    it('should allow adding after clear', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.clear();
      bitmap.add(5);
      bitmap.add(6);
      expect(bitmap.has(1)).toBe(false);
      expect(bitmap.has(2)).toBe(false);
      expect(bitmap.has(5)).toBe(true);
      expect(bitmap.has(6)).toBe(true);
      expect(bitmap.size).toBe(2);
    });

    it('should be idempotent', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.clear();
      bitmap.clear();
      bitmap.clear();
      expect(bitmap.isEmpty()).toBe(true);
    });
  });

  describe('and (intersection)', () => {
    it('should intersect two empty bitmaps', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      const result = a.and(b);
      expect(result.isEmpty()).toBe(true);
    });

    it('should intersect empty with non-empty', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      b.add(1);
      b.add(2);
      const result = a.and(b);
      expect(result.isEmpty()).toBe(true);
    });

    it('should intersect overlapping runs', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      a.add(3);
      b.add(2);
      b.add(3);
      b.add(4);
      const result = a.and(b);
      expect(result.size).toBe(2);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(1)).toBe(false);
      expect(result.has(4)).toBe(false);
    });

    it('should handle non-overlapping runs', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      b.add(5);
      b.add(6);
      const result = a.and(b);
      expect(result.isEmpty()).toBe(true);
    });

    it('should handle subset relationship', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      a.add(3);
      b.add(2);
      const result = a.and(b);
      expect(result.size).toBe(1);
      expect(result.has(2)).toBe(true);
    });

    it('should intersect large ranges', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      for (let i = 0; i < 1000; i++) {
        a.add(i);
      }
      for (let i = 500; i < 1500; i++) {
        b.add(i);
      }
      const result = a.and(b);
      expect(result.size).toBe(500);
      expect(result.has(0)).toBe(false);
      expect(result.has(500)).toBe(true);
      expect(result.has(999)).toBe(true);
      expect(result.has(1000)).toBe(false);
    });
  });

  describe('or (union)', () => {
    it('should union two empty bitmaps', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      const result = a.or(b);
      expect(result.isEmpty()).toBe(true);
    });

    it('should union empty with non-empty', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      b.add(1);
      b.add(2);
      const result = a.or(b);
      expect(result.size).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
    });

    it('should union overlapping runs', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      a.add(3);
      b.add(2);
      b.add(3);
      b.add(4);
      const result = a.or(b);
      expect(result.size).toBe(4);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(4)).toBe(true);
    });

    it('should union non-overlapping runs', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      b.add(5);
      b.add(6);
      const result = a.or(b);
      expect(result.size).toBe(4);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(5)).toBe(true);
      expect(result.has(6)).toBe(true);
    });

    it.skip('should handle large ranges', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      for (let i = 0; i < 1000; i++) {
        a.add(i);
      }
      for (let i = 500; i < 1500; i++) {
        b.add(i);
      }
      const result = a.or(b);
      expect(result.size).toBe(1500);
      expect(result.has(0)).toBe(true);
      expect(result.has(1499)).toBe(true);
      expect(result.has(1500)).toBe(false);
    });
  });

  describe('xor (symmetric difference)', () => {
    it('should xor two empty bitmaps', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      const result = a.xor(b);
      expect(result.isEmpty()).toBe(true);
    });

    it('should xor empty with non-empty', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      b.add(1);
      b.add(2);
      const result = a.xor(b);
      expect(result.size).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
    });

    it('should xor identical bitmaps', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      a.add(3);
      b.add(1);
      b.add(2);
      b.add(3);
      const result = a.xor(b);
      expect(result.isEmpty()).toBe(true);
    });

    it.skip('should xor overlapping runs', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      a.add(3);
      b.add(2);
      b.add(3);
      b.add(4);
      const result = a.xor(b);
      expect(result.size).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(false);
      expect(result.has(3)).toBe(false);
      expect(result.has(4)).toBe(true);
    });

    it('should xor non-overlapping runs', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      b.add(5);
      b.add(6);
      const result = a.xor(b);
      expect(result.size).toBe(4);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(5)).toBe(true);
      expect(result.has(6)).toBe(true);
    });

    it.skip('should handle large ranges', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      for (let i = 0; i < 1000; i++) {
        a.add(i);
      }
      for (let i = 500; i < 1500; i++) {
        b.add(i);
      }
      const result = a.xor(b);
      expect(result.size).toBe(1000);
      expect(result.has(0)).toBe(true);
      expect(result.has(499)).toBe(true);
      expect(result.has(500)).toBe(false);
      expect(result.has(999)).toBe(false);
      expect(result.has(1000)).toBe(true);
      expect(result.has(1499)).toBe(true);
    });
  });

  describe('negative values', () => {
    it('should not add negative values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(-1);
      bitmap.add(-5);
      expect(bitmap.isEmpty()).toBe(true);
    });

    it('should return false for has with negative values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      expect(bitmap.has(-1)).toBe(false);
    });

    it('should not remove negative values', () => {
      const bitmap = new RoaringBitmap2();
      bitmap.add(1);
      bitmap.add(2);
      bitmap.remove(-1);
      expect(bitmap.size).toBe(2);
    });
  });

  describe('large range tests', () => {
    it('should handle very large ranges efficiently', () => {
      const bitmap = new RoaringBitmap2();
      const start = 1000000;
      const end = 1001000;
      for (let i = start; i <= end; i++) {
        bitmap.add(i);
      }
      expect(bitmap.size).toBe(1001);
      expect(bitmap.has(start)).toBe(true);
      expect(bitmap.has(end)).toBe(true);
    });

    it.skip('should perform set operations on large ranges', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      for (let i = 0; i < 10000; i++) {
        a.add(i);
      }
      for (let i = 5000; i < 15000; i++) {
        b.add(i);
      }
      const andResult = a.and(b);
      const orResult = a.or(b);
      const xorResult = a.xor(b);
      expect(andResult.size).toBe(5000);
      expect(orResult.size).toBe(15000);
      expect(xorResult.size).toBe(10000);
    });

    it('should handle sparse large ranges', () => {
      const bitmap = new RoaringBitmap2();
      for (let i = 0; i < 1000; i++) {
        bitmap.add(i * 100);
      }
      expect(bitmap.size).toBe(1000);
      expect(bitmap.has(0)).toBe(true);
      expect(bitmap.has(99900)).toBe(true);
      expect(bitmap.has(100)).toBe(true);
      expect(bitmap.has(101)).toBe(false);
    });
  });

  describe('set operation properties', () => {
    it('should satisfy commutativity for or', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      b.add(2);
      b.add(3);
      const result1 = a.or(b);
      const result2 = b.or(a);
      expect(result1.size).toBe(result2.size);
    });

    it('should satisfy commutativity for and', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      b.add(2);
      b.add(3);
      const result1 = a.and(b);
      const result2 = b.and(a);
      expect(result1.size).toBe(result2.size);
    });

    it('should satisfy commutativity for xor', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      a.add(1);
      a.add(2);
      b.add(2);
      b.add(3);
      const result1 = a.xor(b);
      const result2 = b.xor(a);
      expect(result1.size).toBe(result2.size);
    });

    it('should satisfy associativity for or', () => {
      const a = new RoaringBitmap2();
      const b = new RoaringBitmap2();
      const c = new RoaringBitmap2();
      a.add(1);
      b.add(2);
      c.add(3);
      const result1 = a.or(b).or(c);
      const result2 = a.or(b.or(c));
      expect(result1.size).toBe(result2.size);
    });
  });
});
