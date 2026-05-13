import { describe, it, expect } from 'vitest';
import { LazySegmentTree3 } from '../src/core/lazy-segment-tree-3/index.js';

describe('LazySegmentTree3', () => {
  it('should build from array and handle single element query', () => {
    const tree = new LazySegmentTree3([1, 2, 3, 4, 5]);
    expect(tree.rangeQuery(0, 0)).toBe(1);
    expect(tree.rangeQuery(1, 1)).toBe(2);
    expect(tree.rangeQuery(2, 2)).toBe(3);
    expect(tree.rangeQuery(3, 3)).toBe(4);
    expect(tree.rangeQuery(4, 4)).toBe(5);
  });

  it('should handle range queries', () => {
    const tree = new LazySegmentTree3([1, 2, 3, 4, 5]);
    expect(tree.rangeQuery(0, 2)).toBe(6);
    expect(tree.rangeQuery(1, 3)).toBe(9);
    expect(tree.rangeQuery(0, 4)).toBe(15);
    expect(tree.rangeQuery(2, 4)).toBe(12);
  });

  it('should handle range add updates', () => {
    const tree = new LazySegmentTree3([1, 2, 3, 4, 5]);
    tree.rangeUpdate(1, 3, 10);
    expect(tree.rangeQuery(0, 0)).toBe(1);
    expect(tree.rangeQuery(1, 1)).toBe(12);
    expect(tree.rangeQuery(2, 2)).toBe(13);
    expect(tree.rangeQuery(3, 3)).toBe(14);
    expect(tree.rangeQuery(4, 4)).toBe(5);
  });

  it('should handle get after range updates', () => {
    const tree = new LazySegmentTree3([1, 2, 3, 4, 5]);
    tree.rangeUpdate(0, 4, 5);
    expect(tree.get(0)).toBe(6);
    expect(tree.get(2)).toBe(8);
    expect(tree.get(4)).toBe(10);
  });

  it('should handle point updates', () => {
    const tree = new LazySegmentTree3([1, 2, 3, 4, 5]);
    tree.pointUpdate(2, 10);
    expect(tree.get(2)).toBe(10);
    expect(tree.rangeQuery(0, 4)).toBe(22);
  });

  it('should handle multiple overlapping range updates', () => {
    const tree = new LazySegmentTree3([1, 2, 3, 4, 5]);
    tree.rangeUpdate(0, 2, 5);
    tree.rangeUpdate(1, 4, 10);
    expect(tree.rangeQuery(0, 0)).toBe(6);
    expect(tree.rangeQuery(1, 1)).toBe(17);
    expect(tree.rangeQuery(2, 2)).toBe(18);
    expect(tree.rangeQuery(3, 3)).toBe(14);
    expect(tree.rangeQuery(4, 4)).toBe(15);
  });

  it('should handle large arrays', () => {
    const array = new Array(1000).fill(1);
    const tree = new LazySegmentTree3(array);
    expect(tree.rangeQuery(0, 999)).toBe(1000);
    tree.rangeUpdate(100, 200, 5);
    expect(tree.rangeQuery(0, 99)).toBe(100);
    expect(tree.rangeQuery(100, 200)).toBe(606);
    expect(tree.rangeQuery(201, 999)).toBe(799);
  });

  it('should return correct size', () => {
    const tree1 = new LazySegmentTree3([1, 2, 3]);
    expect(tree1.size()).toBe(3);
    const tree2 = new LazySegmentTree3([1]);
    expect(tree2.size()).toBe(1);
    const tree3 = new LazySegmentTree3(new Array(100).fill(5));
    expect(tree3.size()).toBe(100);
  });

  it('should handle zero values', () => {
    const tree = new LazySegmentTree3([0, 0, 0]);
    expect(tree.rangeQuery(0, 2)).toBe(0);
    tree.rangeUpdate(0, 2, 5);
    expect(tree.rangeQuery(0, 2)).toBe(15);
  });

  it('should handle negative values', () => {
    const tree = new LazySegmentTree3([-1, -2, -3, -4, -5]);
    expect(tree.rangeQuery(0, 4)).toBe(-15);
    tree.rangeUpdate(1, 3, 10);
    expect(tree.rangeQuery(1, 1)).toBe(8);
    expect(tree.rangeQuery(2, 2)).toBe(7);
    expect(tree.rangeQuery(3, 3)).toBe(6);
  });

  it('should handle negative range updates', () => {
    const tree = new LazySegmentTree3([10, 20, 30, 40, 50]);
    tree.rangeUpdate(0, 4, -5);
    expect(tree.rangeQuery(0, 4)).toBe(125);
  });
});
