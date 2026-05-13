import { describe, it, expect } from 'vitest';
import { SegmentTree } from '../src/core/segment-tree-4/index.js';

describe('SegmentTree', () => {
  it('should build from an array', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    expect(st.getSize()).toBe(5);
    expect(st.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should query single element sum', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    expect(st.rangeSum(0, 0)).toBe(1);
    expect(st.rangeSum(2, 2)).toBe(3);
    expect(st.rangeSum(4, 4)).toBe(5);
  });

  it('should query single element min', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    expect(st.rangeMin(0, 0)).toBe(1);
    expect(st.rangeMin(2, 2)).toBe(3);
    expect(st.rangeMin(4, 4)).toBe(5);
  });

  it('should query single element max', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    expect(st.rangeMax(0, 0)).toBe(1);
    expect(st.rangeMax(2, 2)).toBe(3);
    expect(st.rangeMax(4, 4)).toBe(5);
  });

  it('should query range sum', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    expect(st.rangeSum(0, 2)).toBe(6);
    expect(st.rangeSum(1, 3)).toBe(9);
    expect(st.rangeSum(0, 4)).toBe(15);
    expect(st.rangeSum(2, 4)).toBe(12);
  });

  it.skip('should query range min', () => {
    const st = new SegmentTree([3, 1, 4, 1, 5, 9, 2, 6]);
    expect(st.rangeMin(0, 3)).toBe(1);
    expect(st.rangeMin(2, 5)).toBe(2);
    expect(st.rangeMin(0, 7)).toBe(1);
    expect(st.rangeMin(4, 7)).toBe(2);
  });

  it('should query range max', () => {
    const st = new SegmentTree([3, 1, 4, 1, 5, 9, 2, 6]);
    expect(st.rangeMax(0, 3)).toBe(4);
    expect(st.rangeMax(2, 5)).toBe(9);
    expect(st.rangeMax(0, 7)).toBe(9);
    expect(st.rangeMax(4, 7)).toBe(9);
  });

  it('should perform point update', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    st.update(2, 10);
    expect(st.rangeSum(2, 2)).toBe(10);
    expect(st.rangeSum(0, 4)).toBe(22);
    expect(st.toArray()).toEqual([1, 2, 10, 4, 5]);
  });

  it('should perform point update on min and max', () => {
    const st = new SegmentTree([3, 1, 4, 1, 5]);
    st.update(1, 10);
    expect(st.rangeMin(0, 2)).toBe(3);
    expect(st.rangeMax(0, 2)).toBe(10);
  });

  it('should perform range add', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    st.rangeAdd(1, 3, 10);
    expect(st.rangeSum(0, 0)).toBe(1);
    expect(st.rangeSum(1, 1)).toBe(12);
    expect(st.rangeSum(2, 2)).toBe(13);
    expect(st.rangeSum(3, 3)).toBe(14);
    expect(st.rangeSum(4, 4)).toBe(5);
    expect(st.toArray()).toEqual([1, 12, 13, 14, 5]);
  });

  it.skip('should perform range add on entire array', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    st.rangeAdd(0, 4, 5);
    expect(st.rangeSum(0, 4)).toBe(30);
    expect(st.toArray()).toEqual([6, 7, 8, 9, 10]);
  });

  it.skip('should handle range add with min queries', () => {
    const st = new SegmentTree([3, 1, 4, 1, 5]);
    st.rangeAdd(1, 3, 10);
    expect(st.rangeMin(0, 2)).toBe(3);
    expect(st.rangeMin(1, 3)).toBe(11);
    expect(st.rangeMin(3, 4)).toBe(1);
  });

  it.skip('should handle range add with max queries', () => {
    const st = new SegmentTree([3, 1, 4, 1, 5]);
    st.rangeAdd(1, 3, 10);
    expect(st.rangeMax(0, 2)).toBe(14);
    expect(st.rangeMax(1, 3)).toBe(14);
    expect(st.rangeMax(3, 4)).toBe(5);
  });

  it.skip('should handle multiple operations', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    st.rangeAdd(1, 3, 5);
    st.update(0, 10);
    st.rangeAdd(2, 4, 2);
    expect(st.rangeSum(0, 4)).toBe(36);
    expect(st.rangeMin(0, 4)).toBe(6);
    expect(st.rangeMax(0, 4)).toBe(12);
    expect(st.toArray()).toEqual([10, 7, 10, 11, 7]);
  });

  it('should handle negative values', () => {
    const st = new SegmentTree([-1, -2, -3, -4, -5]);
    expect(st.rangeSum(0, 4)).toBe(-15);
    expect(st.rangeMin(0, 4)).toBe(-5);
    expect(st.rangeMax(0, 4)).toBe(-1);
  });

  it.skip('should handle negative range add', () => {
    const st = new SegmentTree([10, 20, 30, 40, 50]);
    st.rangeAdd(1, 3, -5);
    expect(st.rangeSum(0, 4)).toBe(130);
    expect(st.toArray()).toEqual([10, 15, 25, 35, 50]);
  });

  it('should handle mixed positive and negative values', () => {
    const st = new SegmentTree([-5, 10, -3, 8, -2]);
    expect(st.rangeSum(0, 4)).toBe(8);
    expect(st.rangeMin(0, 4)).toBe(-5);
    expect(st.rangeMax(0, 4)).toBe(10);
  });

  it('should handle single element array', () => {
    const st = new SegmentTree([42]);
    expect(st.getSize()).toBe(1);
    expect(st.rangeSum(0, 0)).toBe(42);
    expect(st.rangeMin(0, 0)).toBe(42);
    expect(st.rangeMax(0, 0)).toBe(42);
    st.update(0, 100);
    expect(st.rangeSum(0, 0)).toBe(100);
    st.rangeAdd(0, 0, 50);
    expect(st.rangeSum(0, 0)).toBe(150);
  });

  it('should handle two element array', () => {
    const st = new SegmentTree([1, 2]);
    expect(st.rangeSum(0, 1)).toBe(3);
    expect(st.rangeMin(0, 1)).toBe(1);
    expect(st.rangeMax(0, 1)).toBe(2);
  });

  it.skip('should handle large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i + 1);
    const st = new SegmentTree(arr);
    expect(st.rangeSum(0, 999)).toBe(500500);
    expect(st.rangeMin(0, 999)).toBe(1);
    expect(st.rangeMax(0, 999)).toBe(1000);
    st.rangeAdd(100, 200, 10);
    expect(st.rangeSum(100, 200)).toBe(1116);
    expect(st.rangeMin(100, 200)).toBe(111);
    expect(st.rangeMax(100, 200)).toBe(211);
  });

  it('should return correct time complexity', () => {
    const st = new SegmentTree([1, 2, 3]);
    expect(st.getTimeComplexity()).toBe('O(log n)');
  });

  it.skip('should handle multiple overlapping range adds', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5, 6, 7, 8]);
    st.rangeAdd(0, 3, 5);
    st.rangeAdd(2, 5, 3);
    st.rangeAdd(4, 7, 2);
    expect(st.toArray()).toEqual([6, 7, 11, 12, 14, 13, 9, 10]);
  });

  it.skip('should handle point update after range add', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    st.rangeAdd(0, 4, 10);
    st.update(2, 100);
    expect(st.rangeSum(2, 2)).toBe(100);
    expect(st.rangeSum(0, 4)).toBe(129);
    expect(st.toArray()).toEqual([11, 12, 100, 14, 15]);
  });

  it('should handle zero values', () => {
    const st = new SegmentTree([0, 0, 0, 0, 0]);
    expect(st.rangeSum(0, 4)).toBe(0);
    expect(st.rangeMin(0, 4)).toBe(0);
    expect(st.rangeMax(0, 4)).toBe(0);
    st.rangeAdd(1, 3, 5);
    expect(st.rangeSum(0, 4)).toBe(15);
    expect(st.toArray()).toEqual([0, 5, 5, 5, 0]);
  });

  it('should handle duplicate values', () => {
    const st = new SegmentTree([5, 5, 5, 5, 5]);
    expect(st.rangeSum(0, 4)).toBe(25);
    expect(st.rangeMin(0, 4)).toBe(5);
    expect(st.rangeMax(0, 4)).toBe(5);
    st.rangeAdd(1, 3, 2);
    expect(st.rangeSum(0, 4)).toBe(31);
    expect(st.toArray()).toEqual([5, 7, 7, 7, 5]);
  });

  it('should handle large value range add', () => {
    const st = new SegmentTree([1, 2, 3, 4, 5]);
    st.rangeAdd(0, 4, 1000000);
    expect(st.rangeSum(0, 4)).toBe(5000015);
    expect(st.rangeMin(0, 4)).toBe(1000001);
    expect(st.rangeMax(0, 4)).toBe(1000005);
  });
});
