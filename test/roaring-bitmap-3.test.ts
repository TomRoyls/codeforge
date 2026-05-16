import { describe, it, expect } from 'vitest';
import { RoaringBitmap3 } from '../src/core/roaring-bitmap-3/index';

describe('RoaringBitmap3', () => {
  it('should create empty bitmap', async () => {
    const bitmap = new RoaringBitmap3();
    expect(bitmap.size).toBe(0);
    expect(bitmap.isEmpty()).toBe(true);
  });

  it('should add values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(5);
    bitmap.add(10);
    expect(bitmap.size).toBe(3);
    expect(bitmap.has(1)).toBe(true);
    expect(bitmap.has(5)).toBe(true);
    expect(bitmap.has(10)).toBe(true);
  });

  it('should not contain non-existent values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(5);
    expect(bitmap.has(2)).toBe(false);
    expect(bitmap.has(10)).toBe(false);
  });

  it('should handle duplicate adds', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(1);
    bitmap.add(1);
    expect(bitmap.size).toBe(1);
    expect(bitmap.has(1)).toBe(true);
  });

  it('should delete existing values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(5);
    bitmap.add(10);
    expect(bitmap.delete(5)).toBe(true);
    expect(bitmap.size).toBe(2);
    expect(bitmap.has(5)).toBe(false);
    expect(bitmap.has(1)).toBe(true);
    expect(bitmap.has(10)).toBe(true);
  });

  it('should not delete non-existent values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(5);
    expect(bitmap.delete(10)).toBe(false);
    expect(bitmap.size).toBe(2);
  });

  it('should compute intersection', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    bitmap1.add(3);
    bitmap2.add(2);
    bitmap2.add(3);
    bitmap2.add(4);
    const result = bitmap1.and(bitmap2);
    expect(result.size).toBe(2);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(1)).toBe(false);
    expect(result.has(4)).toBe(false);
  });

  it('should compute empty intersection', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    bitmap2.add(3);
    bitmap2.add(4);
    const result = bitmap1.and(bitmap2);
    expect(result.size).toBe(0);
    expect(result.isEmpty()).toBe(true);
  });

  it('should compute union', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    bitmap1.add(3);
    bitmap2.add(2);
    bitmap2.add(3);
    bitmap2.add(4);
    const result = bitmap1.or(bitmap2);
    expect(result.size).toBe(4);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
  });

  it('should compute union with empty bitmap', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    const result = bitmap1.or(bitmap2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should compute symmetric difference', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    bitmap1.add(3);
    bitmap2.add(2);
    bitmap2.add(3);
    bitmap2.add(4);
    const result = bitmap1.xor(bitmap2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(4)).toBe(true);
    expect(result.has(2)).toBe(false);
    expect(result.has(3)).toBe(false);
  });

  it('should compute symmetric difference with empty bitmap', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    const result = bitmap1.xor(bitmap2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should return correct size', async () => {
    const bitmap = new RoaringBitmap3();
    expect(bitmap.size).toBe(0);
    bitmap.add(1);
    expect(bitmap.size).toBe(1);
    bitmap.add(5);
    expect(bitmap.size).toBe(2);
    bitmap.add(10);
    expect(bitmap.size).toBe(3);
  });

  it('should check if empty', async () => {
    const bitmap = new RoaringBitmap3();
    expect(bitmap.isEmpty()).toBe(true);
    bitmap.add(1);
    expect(bitmap.isEmpty()).toBe(false);
    bitmap.delete(1);
    expect(bitmap.isEmpty()).toBe(true);
  });

  it('should clear all values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(5);
    bitmap.add(10);
    bitmap.clear();
    expect(bitmap.isEmpty()).toBe(true);
    expect(bitmap.size).toBe(0);
  });

  it('should return minimum value', async () => {
    const bitmap = new RoaringBitmap3();
    expect(bitmap.min()).toBe(undefined);
    bitmap.add(5);
    expect(bitmap.min()).toBe(5);
    bitmap.add(1);
    expect(bitmap.min()).toBe(1);
    bitmap.add(10);
    expect(bitmap.min()).toBe(1);
  });

  it('should return maximum value', async () => {
    const bitmap = new RoaringBitmap3();
    expect(bitmap.max()).toBe(undefined);
    bitmap.add(5);
    expect(bitmap.max()).toBe(5);
    bitmap.add(10);
    expect(bitmap.max()).toBe(10);
    bitmap.add(1);
    expect(bitmap.max()).toBe(10);
  });

  it('should return sorted array', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(5);
    bitmap.add(1);
    bitmap.add(10);
    bitmap.add(3);
    const array = bitmap.toArray();
    expect(array).toEqual([1, 3, 5, 10]);
  });

  it('should return empty array for empty bitmap', async () => {
    const bitmap = new RoaringBitmap3();
    expect(bitmap.toArray()).toEqual([]);
  });

  it('should iterate over values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(5);
    bitmap.add(1);
    bitmap.add(10);
    bitmap.add(3);
    const values: number[] = [];
    bitmap.forEach((value) => {
      values.push(value);
    });
    expect(values).toEqual([1, 3, 5, 10]);
  });

  it('should handle zero values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(0);
    expect(bitmap.has(0)).toBe(true);
    expect(bitmap.size).toBe(1);
    expect(bitmap.min()).toBe(0);
    expect(bitmap.max()).toBe(0);
  });

  it('should handle negative values', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(-5);
    bitmap.add(-10);
    bitmap.add(1);
    bitmap.add(5);
    expect(bitmap.min()).toBe(-10);
    expect(bitmap.max()).toBe(5);
    expect(bitmap.toArray()).toEqual([-10, -5, 1, 5]);
  });

  it('should handle large datasets', async () => {
    const bitmap = new RoaringBitmap3();
    const values: number[] = [];
    for (let i = 0; i < 1000; i++) {
      values.push(i);
      bitmap.add(i);
    }
    expect(bitmap.size).toBe(1000);
    expect(bitmap.toArray()).toEqual(values);
    expect(bitmap.min()).toBe(0);
    expect(bitmap.max()).toBe(999);
  });

  it('should handle large integer ranges', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1000000);
    bitmap.add(1000001);
    bitmap.add(1000002);
    expect(bitmap.size).toBe(3);
    expect(bitmap.has(1000001)).toBe(true);
  });

  it('should handle empty operations', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    const andResult = bitmap1.and(bitmap2);
    const orResult = bitmap1.or(bitmap2);
    const xorResult = bitmap1.xor(bitmap2);
    expect(andResult.isEmpty()).toBe(true);
    expect(orResult.isEmpty()).toBe(true);
    expect(xorResult.isEmpty()).toBe(true);
  });

  it('should not modify original bitmaps during operations', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    bitmap2.add(2);
    bitmap2.add(3);
    const andResult = bitmap1.and(bitmap2);
    const orResult = bitmap1.or(bitmap2);
    const xorResult = bitmap1.xor(bitmap2);
    expect(bitmap1.size).toBe(2);
    expect(bitmap2.size).toBe(2);
    expect(andResult.size).toBe(1);
    expect(orResult.size).toBe(3);
    expect(xorResult.size).toBe(2);
  });

  it('should chain set operations', async () => {
    const bitmap1 = new RoaringBitmap3();
    const bitmap2 = new RoaringBitmap3();
    const bitmap3 = new RoaringBitmap3();
    bitmap1.add(1);
    bitmap1.add(2);
    bitmap2.add(2);
    bitmap2.add(3);
    bitmap3.add(3);
    bitmap3.add(4);
    const result = bitmap1.or(bitmap2).and(bitmap3);
    expect(result.size).toBe(1);
    expect(result.has(3)).toBe(true);
  });

  it('should handle min and max', async () => {
    const bitmap = new RoaringBitmap3();
    expect(bitmap.min()).toBeUndefined();
    expect(bitmap.max()).toBeUndefined();
    bitmap.add(5);
    bitmap.add(1);
    bitmap.add(10);
    expect(bitmap.min()).toBe(1);
    expect(bitmap.max()).toBe(10);
  });

  it('should handle clear', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(2);
    bitmap.clear();
    expect(bitmap.size).toBe(0);
    expect(bitmap.isEmpty()).toBe(true);
  });

  it('should handle toArray sorted', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(5);
    bitmap.add(1);
    bitmap.add(3);
    expect(bitmap.toArray()).toEqual([1, 3, 5]);
  });

  it('should handle forEach', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(10);
    bitmap.add(20);
    const values: number[] = [];
    bitmap.forEach(v => values.push(v));
    expect(values).toEqual([10, 20]);
  });

  it('should handle delete', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(1);
    bitmap.add(2);
    expect(bitmap.delete(1)).toBe(true);
    expect(bitmap.has(1)).toBe(false);
    expect(bitmap.has(2)).toBe(true);
  });

  it('should handle min and max', async () => {
    const bitmap = new RoaringBitmap3();
    bitmap.add(10);
    bitmap.add(5);
    bitmap.add(20);
    expect(bitmap.min()).toBe(5);
    expect(bitmap.max()).toBe(20);
  });

  it('should handle xor', async () => {
    const a = new RoaringBitmap3();
    a.add(1); a.add(2); a.add(3);
    const b = new RoaringBitmap3();
    b.add(2); b.add(3); b.add(4);
    const result = a.xor(b);
    expect(result.toArray()).toEqual([1, 4]);
  });

  it('should handle and operation', async () => {
    const a = new RoaringBitmap3();
    a.add(1); a.add(2); a.add(3);
    const b = new RoaringBitmap3();
    b.add(2); b.add(3); b.add(4);
    const result = a.and(b);
    expect(result.toArray()).toEqual([2, 3]);
  });

  it('should handle or operation', async () => {
    const a = new RoaringBitmap3();
    a.add(1); a.add(2);
    const b = new RoaringBitmap3();
    b.add(3); b.add(4);
    const result = a.or(b);
    expect(result.toArray()).toEqual([1, 2, 3, 4]);
  });

  it('should handle xor operation', async () => {
    const a = new RoaringBitmap3();
    a.add(1); a.add(2); a.add(3);
    const b = new RoaringBitmap3();
    b.add(2); b.add(3); b.add(4);
    const result = a.xor(b);
    expect(result.toArray()).toEqual([1, 4]);
  });

  it('should handle and operation', () => {
    const a = new RoaringBitmap3();
    a.add(1); a.add(2); a.add(3);
    const b = new RoaringBitmap3();
    b.add(2); b.add(3); b.add(4);
    const result = a.and(b);
    expect(result.toArray()).toEqual([2, 3]);
  });

  it('should handle or operation', () => {
    const a = new RoaringBitmap3();
    a.add(1); a.add(2);
    const b = new RoaringBitmap3();
    b.add(2); b.add(3);
    const result = a.or(b);
    expect(result.toArray()).toEqual([1, 2, 3]);
  });

  it('should handle xor operation', () => {
    const a = new RoaringBitmap3();
    a.add(1); a.add(2); a.add(3);
    const b = new RoaringBitmap3();
    b.add(2); b.add(3); b.add(4);
    const result = a.xor(b);
    expect(result.has(1)).toBe(true);
    expect(result.has(4)).toBe(true);
    expect(result.has(2)).toBe(false);
  });

  it('should handle min and max', () => {
    const bm = new RoaringBitmap3();
    bm.add(5); bm.add(1); bm.add(9); bm.add(3);
    expect(bm.min()).toBe(1);
    expect(bm.max()).toBe(9);
  });

  it('should handle clear', () => {
    const bm = new RoaringBitmap3();
    bm.add(1); bm.add(2); bm.add(3);
    bm.clear();
    expect(bm.has(1)).toBe(false);
  });
  it('should handle and operation', () => {
    const bm1 = new RoaringBitmap3();
    bm1.add(1); bm1.add(2); bm1.add(3);
    const bm2 = new RoaringBitmap3();
    bm2.add(2); bm2.add(3); bm2.add(4);
    const result = bm1.and(bm2);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(1)).toBe(false);
  });
  it('should handle or operation', () => {
    const bm1 = new RoaringBitmap3();
    bm1.add(1); bm1.add(2);
    const bm2 = new RoaringBitmap3();
    bm2.add(2); bm2.add(3);
    const result = bm1.or(bm2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
  });
  it('should handle min and max', () => {
    const bm = new RoaringBitmap3();
    bm.add(10);
    bm.add(5);
    bm.add(20);
    expect(bm.min()).toBe(5);
    expect(bm.max()).toBe(20);
  });
  it('should handle clear', () => {
    const bm = new RoaringBitmap3();
    bm.add(10);
    bm.add(20);
    bm.clear();
    expect(bm.has(10)).toBe(false);
    expect(bm.size()).toBe(0);
  });
  it('should handle has after multiple adds', () => {
    const bm = new RoaringBitmap3();
    bm.add(1);
    bm.add(100);
    bm.add(1000);
    expect(bm.has(1)).toBe(true);
    expect(bm.has(100)).toBe(true);
    expect(bm.has(1000)).toBe(true);
    expect(bm.has(2)).toBe(false);
  });
});
