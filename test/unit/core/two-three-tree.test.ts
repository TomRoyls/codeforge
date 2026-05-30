import { describe, expect, it } from 'vitest';
import { TwoThreeTree } from '../../../src/core/2-3-tree/index.js';

describe('TwoThreeTree', () => {
  it('creates empty tree with default comparator', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.size()).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.getHeight()).toBe(0);
    expect(tree.getTimeComplexity()).toBe('O(1)');
  });

  it('creates empty tree with custom comparator', () => {
    const tree = new TwoThreeTree<number>((a, b) => b - a);
    expect(tree.size()).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('inserts single value', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.size()).toBe(1);
    expect(tree.isEmpty()).toBe(false);
    expect(tree.contains(5)).toBe(true);
  });

  it('handles duplicate insert without size increase', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    tree.insert(5);
    expect(tree.size()).toBe(1);
  });

  it('inserts values in ascending order', () => {
    const tree = new TwoThreeTree<number>();
    [1, 2, 3, 4, 5, 6, 7].forEach(v => tree.insert(v));
    expect(tree.size()).toBe(7);
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('inserts values in descending order', () => {
    const tree = new TwoThreeTree<number>();
    [7, 6, 5, 4, 3, 2, 1].forEach(v => tree.insert(v));
    expect(tree.size()).toBe(7);
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('inserts values in random order', () => {
    const tree = new TwoThreeTree<number>();
    [5, 2, 8, 1, 9, 3, 7, 4, 6].forEach(v => tree.insert(v));
    expect(tree.size()).toBe(9);
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('searches for existing value returns true', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    tree.insert(10);
    expect(tree.search(5)).toBe(true);
    expect(tree.search(10)).toBe(true);
  });

  it('searches for non-existing value returns false', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.search(10)).toBe(false);
  });

  it('search is alias for contains', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.search(5)).toBe(tree.contains(5));
    expect(tree.search(10)).toBe(tree.contains(10));
  });

  it('contains returns true for existing value', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.contains(5)).toBe(true);
  });

  it('contains returns false for non-existing value', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.contains(5)).toBe(false);
  });

  it('deletes non-existing value returns false', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.delete(10)).toBe(false);
  });

  it('deletes existing value returns true', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.delete(5)).toBe(true);
  });

  it('deletes and updates size', () => {
    const tree = new TwoThreeTree<number>();
    [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
    tree.delete(3);
    expect(tree.size()).toBe(4);
    expect(tree.contains(3)).toBe(false);
  });

  it('deletes all elements one by one', () => {
    const tree = new TwoThreeTree<number>();
    [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
    tree.delete(1);
    tree.delete(2);
    tree.delete(3);
    tree.delete(4);
    tree.delete(5);
  });

  it('deletes and re-inserts value', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.contains(5)).toBe(false);
    tree.insert(5);
    expect(tree.contains(5)).toBe(true);
    expect(tree.size()).toBe(1);
  });

  it('min returns undefined for empty tree', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.min()).toBe(undefined);
  });

  it('max returns undefined for empty tree', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.max()).toBe(undefined);
  });

  it('min returns smallest value', () => {
    const tree = new TwoThreeTree<number>();
    [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(1);
  });

  it('max returns largest value', () => {
    const tree = new TwoThreeTree<number>();
    [5, 3, 7, 1, 9].forEach(v => tree.insert(v));
    expect(tree.max()).toBe(9);
  });

  it('inOrderTraversal returns sorted array', () => {
    const tree = new TwoThreeTree<number>();
    [5, 2, 8, 1, 9, 3, 7, 4, 6].forEach(v => tree.insert(v));
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('inOrderTraversal returns empty array for empty tree', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.inOrderTraversal()).toEqual([]);
  });

  it('toArray returns same as inOrderTraversal', () => {
    const tree = new TwoThreeTree<number>();
    [5, 2, 8, 1, 9, 3].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual(tree.inOrderTraversal());
  });

  it('size returns 0 for empty tree', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.size()).toBe(0);
  });

  it('size increments with each unique insert', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.size()).toBe(0);
    tree.insert(1);
    expect(tree.size()).toBe(1);
    tree.insert(2);
    expect(tree.size()).toBe(2);
  });

  it('isEmpty returns true for empty tree', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.isEmpty()).toBe(true);
  });

  it('isEmpty returns false after insert', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.isEmpty()).toBe(false);
  });

  it('isEmpty returns true after deleting all elements', () => {
    const tree = new TwoThreeTree<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    [1, 2, 3].forEach(v => tree.delete(v));
    expect(tree.isEmpty()).toBe(true);
  });

  it('clear resets tree to empty', () => {
    const tree = new TwoThreeTree<number>();
    [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size()).toBe(0);
    expect(tree.inOrderTraversal()).toEqual([]);
  });

  it('clear works on empty tree', () => {
    const tree = new TwoThreeTree<number>();
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size()).toBe(0);
  });

  it('getHeight returns 0 for empty tree', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.getHeight()).toBe(0);
  });

  it('getHeight returns 1 for single element', () => {
    const tree = new TwoThreeTree<number>();
    tree.insert(5);
    expect(tree.getHeight()).toBe(1);
  });

  it('getHeight grows logarithmically', () => {
    const tree = new TwoThreeTree<number>();
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    const height = tree.getHeight();
    const expectedHeight = Math.ceil(Math.log2(101));
    expect(height).toBeLessThanOrEqual(expectedHeight + 1);
  });

  it('getTimeComplexity returns O(1) for empty tree', () => {
    const tree = new TwoThreeTree<number>();
    expect(tree.getTimeComplexity()).toBe('O(1)');
  });

  it('getTimeComplexity returns O(log n) for balanced tree', () => {
    const tree = new TwoThreeTree<number>();
    [5, 2, 8, 1, 3, 7, 9].forEach(v => tree.insert(v));
    const complexity = tree.getTimeComplexity();
    expect(complexity).toMatch(/O\(log n\)/);
  });

  it('works with custom comparator for descending order', () => {
    const tree = new TwoThreeTree<number>((a, b) => b - a);
    [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(5);
    expect(tree.max()).toBe(1);
  });

  it('works with string keys', () => {
    const tree = new TwoThreeTree<string>();
    ['banana', 'apple', 'cherry', 'date'].forEach(v => tree.insert(v));
    expect(tree.inOrderTraversal()).toEqual(['apple', 'banana', 'cherry', 'date']);
    expect(tree.min()).toBe('apple');
    expect(tree.max()).toBe('date');
  });

  it('handles large tree with 100+ elements', () => {
    const tree = new TwoThreeTree<number>();
    const values = Array.from({ length: 150 }, (_, i) => i * 2);
    values.forEach(v => tree.insert(v));
    expect(tree.size()).toBe(150);
    expect(tree.inOrderTraversal()).toEqual(values);
    expect(tree.min()).toBe(0);
    expect(tree.max()).toBe(298);
    const height = tree.getHeight();
    const expectedHeight = Math.ceil(Math.log2(151));
    expect(height).toBeLessThanOrEqual(expectedHeight + 1);
  });

  it('min and max update after deletes', () => {
    const tree = new TwoThreeTree<number>();
    [5, 2, 8, 1, 9, 3, 7, 4, 6].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(1);
    expect(tree.max()).toBe(9);
    tree.delete(1);
    expect(tree.min()).toBe(2);
    tree.delete(9);
    expect(tree.max()).toBe(8);
  });

  it('clear resets size correctly', () => {
    const tree = new TwoThreeTree<number>();
    [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
    expect(tree.size()).toBe(5);
    tree.clear();
    expect(tree.size()).toBe(0);
  });

  it('clear resets isEmpty correctly', () => {
    const tree = new TwoThreeTree<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    expect(tree.isEmpty()).toBe(false);
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
  });
});