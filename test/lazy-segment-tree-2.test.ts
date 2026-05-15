import { describe, it, expect } from 'vitest';
import { LazySegmentTree } from '../src/core/lazy-segment-tree-2/index';

describe('LazySegmentTree', () => {
  it('should build from array and handle single element query', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    expect(tree.rangeQuery(0, 0)).toBe(1);
    expect(tree.rangeQuery(1, 1)).toBe(2);
    expect(tree.rangeQuery(2, 2)).toBe(3);
    expect(tree.rangeQuery(3, 3)).toBe(4);
    expect(tree.rangeQuery(4, 4)).toBe(5);
  });

  it('should handle range queries', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    expect(tree.rangeQuery(0, 2)).toBe(6);
    expect(tree.rangeQuery(1, 3)).toBe(9);
    expect(tree.rangeQuery(0, 4)).toBe(15);
    expect(tree.rangeQuery(2, 4)).toBe(12);
  });

  it('should handle range updates', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    tree.rangeUpdate(1, 3, 10);
    expect(tree.rangeQuery(0, 0)).toBe(1);
    expect(tree.rangeQuery(1, 1)).toBe(12);
    expect(tree.rangeQuery(2, 2)).toBe(13);
    expect(tree.rangeQuery(3, 3)).toBe(14);
    expect(tree.rangeQuery(4, 4)).toBe(5);
  });

  it('should handle point queries after range updates', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    tree.rangeUpdate(0, 4, 5);
    expect(tree.pointQuery(0)).toBe(6);
    expect(tree.pointQuery(2)).toBe(8);
    expect(tree.pointQuery(4)).toBe(10);
  });

  it('should handle point updates', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    tree.pointUpdate(2, 10);
    expect(tree.pointQuery(2)).toBe(10);
    expect(tree.rangeQuery(0, 4)).toBe(22);
  });

  it('should handle multiple overlapping range updates', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    tree.rangeUpdate(0, 2, 5);
    tree.rangeUpdate(1, 4, 10);
    expect(tree.rangeQuery(0, 0)).toBe(6);
    expect(tree.rangeQuery(1, 1)).toBe(17);
    expect(tree.rangeQuery(2, 2)).toBe(18);
    expect(tree.rangeQuery(3, 3)).toBe(14);
    expect(tree.rangeQuery(4, 4)).toBe(15);
  });

  it('should handle alternating updates and queries', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    tree.rangeUpdate(0, 4, 1);
    expect(tree.rangeQuery(0, 2)).toBe(9);
    tree.rangeUpdate(1, 3, 2);
    expect(tree.rangeQuery(1, 3)).toBe(18);
    expect(tree.rangeQuery(0, 4)).toBe(26);
    tree.pointUpdate(2, 10);
    expect(tree.rangeQuery(0, 4)).toBe(30);
  });

  it('should handle large arrays', () => {
    const array = new Array(1000).fill(1);
    const tree = new LazySegmentTree(array);
    expect(tree.rangeQuery(0, 999)).toBe(1000);
    tree.rangeUpdate(100, 200, 5);
    expect(tree.rangeQuery(0, 99)).toBe(100);
    expect(tree.rangeQuery(100, 200)).toBe(606);
    expect(tree.rangeQuery(201, 999)).toBe(799);
  });

  it('should return correct size', () => {
    const tree1 = new LazySegmentTree([1, 2, 3]);
    expect(tree1.getSize()).toBe(3);
    const tree2 = new LazySegmentTree([1]);
    expect(tree2.getSize()).toBe(1);
    const tree3 = new LazySegmentTree(new Array(100).fill(5));
    expect(tree3.getSize()).toBe(100);
  });

  it('should convert to array correctly', () => {
    const tree = new LazySegmentTree([1, 2, 3, 4, 5]);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    tree.rangeUpdate(1, 3, 10);
    expect(tree.toArray()).toEqual([1, 12, 13, 14, 5]);
  });

  it('should return time complexity string', () => {
    const tree = new LazySegmentTree([1, 2, 3]);
    expect(tree.getTimeComplexity()).toBe('Query: O(log n), Update: O(log n), Build: O(n)');
  });

  it('should handle zero values', () => {
    const tree = new LazySegmentTree([0, 0, 0]);
    expect(tree.rangeQuery(0, 2)).toBe(0);
    tree.rangeUpdate(0, 2, 5);
    expect(tree.rangeQuery(0, 2)).toBe(15);
  });

  it('should handle negative values', () => {
    const tree = new LazySegmentTree([-1, -2, -3, -4, -5]);
    expect(tree.rangeQuery(0, 4)).toBe(-15);
    tree.rangeUpdate(1, 3, 10);
    expect(tree.rangeQuery(1, 1)).toBe(8);
    expect(tree.rangeQuery(2, 2)).toBe(7);
    expect(tree.rangeQuery(3, 3)).toBe(6);
  });

  it('should handle negative range updates', () => {
    const tree = new LazySegmentTree([10, 20, 30, 40, 50]);
    tree.rangeUpdate(0, 4, -5);
    expect(tree.rangeQuery(0, 4)).toBe(125);
  });
});
