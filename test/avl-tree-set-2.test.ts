import { describe, it, expect } from 'vitest';
import { AVLTreeSet2 } from '../src/core/avl-tree-set-2/index';

describe('AVLTreeSet2', () => {
  it('should create empty set', async () => {
    const set = new AVLTreeSet2<number>();
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
  });

  it('should add values', async () => {
    const set = new AVLTreeSet2<number>();
    expect(set.add(5)).toBe(true);
    expect(set.add(3)).toBe(true);
    expect(set.add(7)).toBe(true);
    expect(set.size).toBe(3);
  });

  it('should not add duplicates', async () => {
    const set = new AVLTreeSet2<number>();
    expect(set.add(5)).toBe(true);
    expect(set.add(5)).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should check membership', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(7);

    expect(set.has(5)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.has(7)).toBe(true);
    expect(set.has(1)).toBe(false);
  });

  it('should delete values', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(7);

    expect(set.delete(3)).toBe(true);
    expect(set.size).toBe(2);
    expect(set.has(3)).toBe(false);
  });

  it('should not delete non-existent values', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);

    expect(set.delete(3)).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should return minimum value', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(7);

    expect(set.min()).toBe(3);
  });

  it('should return maximum value', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(7);

    expect(set.max()).toBe(7);
  });

  it('should return undefined for min/max on empty set', async () => {
    const set = new AVLTreeSet2<number>();

    expect(set.min()).toBe(undefined);
    expect(set.max()).toBe(undefined);
  });

  it('should iterate in order with forEach', async () => {
    const set = new AVLTreeSet2<number>();
    const values = [5, 3, 7, 1, 9];
    values.forEach((v) => set.add(v));

    const result: number[] = [];
    set.forEach((value) => result.push(value));

    expect(result).toEqual([1, 3, 5, 7, 9]);
  });

  it('should return sorted array', async () => {
    const set = new AVLTreeSet2<number>();
    const values = [5, 3, 7, 1, 9];
    values.forEach((v) => set.add(v));

    expect(set.toArray()).toEqual([1, 3, 5, 7, 9]);
  });

  it('should clear all values', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(7);

    set.clear();

    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
    expect(set.has(5)).toBe(false);
  });

  it('should work with custom comparator', async () => {
    const set = new AVLTreeSet2<{ value: number }>((a, b) => a.value - b.value);
    set.add({ value: 5 });
    set.add({ value: 3 });
    set.add({ value: 7 });

    expect(set.size).toBe(3);
    expect(set.has({ value: 3 })).toBe(true);
    expect(set.min()).toEqual({ value: 3 });
    expect(set.max()).toEqual({ value: 7 });
  });

  it('should handle single element', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);

    expect(set.size).toBe(1);
    expect(set.has(5)).toBe(true);
    expect(set.min()).toBe(5);
    expect(set.max()).toBe(5);
    expect(set.toArray()).toEqual([5]);
  });

  it('should handle right rotation', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(3);
    set.add(2);
    set.add(1);

    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.toArray()).toEqual([1, 2, 3]);
  });

  it('should handle left rotation', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.toArray()).toEqual([1, 2, 3]);
  });

  it('should handle left-right rotation', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(3);
    set.add(1);
    set.add(2);

    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.toArray()).toEqual([1, 2, 3]);
  });

  it('should handle right-left rotation', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(1);
    set.add(3);
    set.add(2);

    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.toArray()).toEqual([1, 2, 3]);
  });

  it('should handle complex insertion pattern', async () => {
    const set = new AVLTreeSet2<number>();
    const values = [10, 20, 30, 40, 50, 25];
    values.forEach((v) => set.add(v));

    expect(set.size).toBe(6);
    expect(set.toArray()).toEqual([10, 20, 25, 30, 40, 50]);
  });

  it('should handle deletion of leaf', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(7);

    expect(set.delete(3)).toBe(true);
    expect(set.size).toBe(2);
    expect(set.toArray()).toEqual([5, 7]);
  });

  it('should handle deletion of node with one child', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(4);

    expect(set.delete(3)).toBe(true);
    expect(set.size).toBe(2);
    expect(set.toArray()).toEqual([4, 5]);
  });

  it('should handle deletion of node with two children', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(5);
    set.add(3);
    set.add(7);
    set.add(2);
    set.add(4);
    set.add(6);
    set.add(8);

    expect(set.delete(5)).toBe(true);
    expect(set.size).toBe(6);
    expect(set.toArray()).toEqual([2, 3, 4, 6, 7, 8]);
  });

  it('should rebalance after deletion', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(5);
    set.add(15);
    set.add(3);
    set.add(7);
    set.add(12);
    set.add(17);

    set.delete(3);
    set.delete(5);

    expect(set.size).toBe(5);
    expect(set.toArray()).toEqual([7, 10, 12, 15, 17]);
  });

  it('should handle large dataset', async () => {
    const set = new AVLTreeSet2<number>();
    const size = 1000;
    const values: number[] = [];

    for (let i = 0; i < size; i++) {
      values.push(i);
    }

    values.forEach((v) => set.add(v));

    expect(set.size).toBe(size);
    expect(set.toArray()).toEqual(values);
  });

  it('should handle random insertion and deletion', async () => {
    const set = new AVLTreeSet2<number>();
    const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93];

    values.forEach((v) => set.add(v));

    expect(set.size).toBe(15);
    const sorted = [...values].sort((a, b) => a - b);
    expect(set.toArray()).toEqual(sorted);

    set.delete(12);
    set.delete(75);
    set.delete(50);

    expect(set.size).toBe(12);
    const remaining = sorted.filter((v) => ![12, 75, 50].includes(v));
    expect(set.toArray()).toEqual(remaining);
  });

  it('should handle negative numbers', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(-5);
    set.add(3);
    set.add(-7);
    set.add(0);
    set.add(5);

    expect(set.toArray()).toEqual([-7, -5, 0, 3, 5]);
  });

  it('should handle strings', async () => {
    const set = new AVLTreeSet2<string>();
    set.add('banana');
    set.add('apple');
    set.add('cherry');
    set.add('date');

    expect(set.toArray()).toEqual(['apple', 'banana', 'cherry', 'date']);
  });

  it('should find lower bound', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(30);
    set.add(40);
    set.add(50);

    expect(set.lowerBound(25)).toBe(30);
    expect(set.lowerBound(30)).toBe(30);
    expect(set.lowerBound(35)).toBe(40);
    expect(set.lowerBound(50)).toBe(50);
    expect(set.lowerBound(55)).toBe(undefined);
    expect(set.lowerBound(5)).toBe(10);
  });

  it('should find upper bound', async () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(30);
    set.add(40);
    set.add(50);

    expect(set.upperBound(25)).toBe(30);
    expect(set.upperBound(30)).toBe(40);
    expect(set.upperBound(35)).toBe(40);
    expect(set.upperBound(50)).toBe(undefined);
    expect(set.upperBound(55)).toBe(undefined);
    expect(set.upperBound(5)).toBe(10);
  });

  it('should handle bounds on empty set', async () => {
    const set = new AVLTreeSet2<number>();

    expect(set.lowerBound(5)).toBe(undefined);
    expect(set.upperBound(5)).toBe(undefined);
  });

  it('should maintain size after add/delete', async () => {
    const set = new AVLTreeSet2<number>();

    expect(set.size).toBe(0);

    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.size).toBe(3);

    set.add(2);
    expect(set.size).toBe(3);

    set.delete(2);
    expect(set.size).toBe(2);

    set.delete(5);
    expect(set.size).toBe(2);
  });

  it('should handle sequential operations', async () => {
    const set = new AVLTreeSet2<number>();

    for (let i = 0; i < 100; i++) {
      set.add(i);
      expect(set.size).toBe(i + 1);
      expect(set.has(i)).toBe(true);
    }

    for (let i = 0; i < 100; i++) {
      expect(set.delete(i)).toBe(true);
      expect(set.size).toBe(99 - i);
    }
  });

  it('should handle lowerBound and upperBound', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(30);
    expect(set.lowerBound(15)).toBe(20);
    expect(set.upperBound(20)).toBe(30);
  });

  it('should handle forEach', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(30);
    const collected: number[] = [];
    set.forEach(v => collected.push(v));
    expect(collected).toEqual([10, 20, 30]);
  });

  it('should handle clear', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.clear();
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
  });

  it('should handle toArray', () => {
    const set = new AVLTreeSet2<number>();
    set.add(30);
    set.add(10);
    set.add(20);
    const arr = set.toArray();
    expect(arr).toEqual([10, 20, 30]);
  });

  it('should handle min and max', () => {
    const set = new AVLTreeSet2<number>();
    set.add(30);
    set.add(10);
    set.add(20);
    expect(set.min()).toBe(10);
    expect(set.max()).toBe(30);
  });

  it('should handle delete', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(30);
    expect(set.delete(20)).toBe(true);
    expect(set.has(20)).toBe(false);
    expect(set.size).toBe(2);
  });

  it('should handle toArray', () => {
    const set = new AVLTreeSet2<number>();
    set.add(30);
    set.add(10);
    set.add(20);
    const arr = set.toArray();
    expect(arr.sort((a, b) => a - b)).toEqual([10, 20, 30]);
  });

  it('should handle forEach', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(30);
    const values: number[] = [];
    set.forEach((v) => values.push(v));
    expect(values.length).toBe(3);
  });

  it('should handle min and max', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(5);
    set.add(30);
    expect(set.min()).toBe(5);
    expect(set.max()).toBe(30);
  });

  it('should handle clear', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.add(30);
    set.clear();
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
  });

  it('should handle has after delete', () => {
    const set = new AVLTreeSet2<number>();
    set.add(10);
    set.add(20);
    set.delete(10);
    expect(set.has(10)).toBe(false);
    expect(set.has(20)).toBe(true);
  });
});
