import { describe, it, expect } from 'vitest';
import { IntervalTree2 } from '../src/core/interval-tree-2/index.js';

describe('IntervalTree2', () => {
  it('inserts and searches by point', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(3, 7);
    tree.insert(10, 15);

    const result = tree.search(4);
    expect(result).toHaveLength(2);
    expect(result[0].lo).toBe(1);
    expect(result[0].hi).toBe(5);
    expect(result[1].lo).toBe(3);
    expect(result[1].hi).toBe(7);
  });

  it('searches by range', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(6, 10);
    tree.insert(11, 15);

    const result = tree.searchRange(3, 12);
    expect(result).toHaveLength(3);
  });

  it('removes intervals', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(6, 10);
    tree.insert(11, 15);

    const removed = tree.remove(6, 10);
    expect(removed).toBe(true);
    expect(tree.size()).toBe(2);

    const result = tree.search(7);
    expect(result).toHaveLength(0);
  });

  it('returns false when removing non-existent interval', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);

    const removed = tree.remove(10, 20);
    expect(removed).toBe(false);
    expect(tree.size()).toBe(1);
  });

  it('tracks size correctly', () => {
    const tree = new IntervalTree2();
    expect(tree.size()).toBe(0);

    tree.insert(1, 5);
    expect(tree.size()).toBe(1);

    tree.insert(6, 10);
    expect(tree.size()).toBe(2);

    tree.insert(11, 15);
    expect(tree.size()).toBe(3);

    tree.remove(6, 10);
    expect(tree.size()).toBe(2);
  });

  it('checks if empty', () => {
    const tree = new IntervalTree2();
    expect(tree.isEmpty()).toBe(true);

    tree.insert(1, 5);
    expect(tree.isEmpty()).toBe(false);

    tree.remove(1, 5);
    expect(tree.isEmpty()).toBe(true);
  });

  it('handles overlapping intervals', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 10);
    tree.insert(5, 15);
    tree.insert(8, 20);

    const result = tree.search(9);
    expect(result).toHaveLength(3);
  });

  it('handles non-overlapping intervals', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(10, 15);
    tree.insert(20, 25);

    const result = tree.search(7);
    expect(result).toHaveLength(0);

    const result2 = tree.search(3);
    expect(result2).toHaveLength(1);
  });

  it('stores and retrieves values', () => {
    const tree = new IntervalTree2<string>();
    tree.insert(1, 5, 'first');
    tree.insert(6, 10, 'second');

    const result = tree.search(3);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('first');

    const result2 = tree.search(7);
    expect(result2).toHaveLength(1);
    expect(result2[0].value).toBe('second');
  });

  it('handles empty search results', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(10, 15);

    const result = tree.search(7);
    expect(result).toHaveLength(0);
  });

  it('handles empty range search results', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(10, 15);

    const result = tree.searchRange(7, 9);
    expect(result).toHaveLength(0);
  });

  it('searches intervals containing range start', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 10);
    tree.insert(15, 20);

    const result = tree.searchRange(5, 12);
    expect(result).toHaveLength(1);
    expect(result[0].lo).toBe(1);
    expect(result[0].hi).toBe(10);
  });

  it('searches intervals containing range end', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 10);
    tree.insert(15, 20);

    const result = tree.searchRange(8, 18);
    expect(result).toHaveLength(2);
  });

  it('searches intervals within range', () => {
    const tree = new IntervalTree2();
    tree.insert(5, 10);
    tree.insert(15, 20);

    const result = tree.searchRange(0, 25);
    expect(result).toHaveLength(2);
  });

  it('handles point queries on boundaries', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(6, 10);

    const result = tree.search(5);
    expect(result).toHaveLength(1);

    const result2 = tree.search(6);
    expect(result2).toHaveLength(1);
  });

  it('throws error for invalid interval', () => {
    const tree = new IntervalTree2();
    expect(() => tree.insert(10, 5)).toThrow();
  });

  it('handles single interval tree', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 10);

    expect(tree.size()).toBe(1);
    expect(tree.isEmpty()).toBe(false);

    const result = tree.search(5);
    expect(result).toHaveLength(1);
    expect(result[0].lo).toBe(1);
    expect(result[0].hi).toBe(10);
  });

  it('handles intervals with same start point', () => {
    const tree = new IntervalTree2();
    tree.insert(1, 5);
    tree.insert(1, 10);

    const result = tree.search(3);
    expect(result).toHaveLength(2);
  });
});
