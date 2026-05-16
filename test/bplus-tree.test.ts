import { describe, it, expect, beforeEach } from 'vitest';
import { BPlusTree } from '../src/core/bplus-tree/index.js';

describe('BPlusTree', () => {
  it('should initialize empty', async () => {
    const tree = new BPlusTree<number, string>();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should insert and get values', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'ten');
    tree.insert(20, 'twenty');
    tree.insert(5, 'five');
    expect(tree.get(10)).toBe('ten');
    expect(tree.get(20)).toBe('twenty');
    expect(tree.get(5)).toBe('five');
    expect(tree.size).toBe(3);
  });

  it('should update existing keys with insert', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'ten');
    tree.insert(10, 'TEN');
    expect(tree.size).toBe(1);
    expect(tree.get(10)).toBe('TEN');
  });

  it('should check key existence', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'ten');
    expect(tree.has(10)).toBe(true);
    expect(tree.has(20)).toBe(false);
  });

  it('should update values', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'ten');
    expect(tree.update(10, 'TEN')).toBe(true);
    expect(tree.get(10)).toBe('TEN');
    expect(tree.update(20, 'twenty')).toBe(false);
  });

  it('should delete keys', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'ten');
    tree.insert(20, 'twenty');
    tree.insert(5, 'five');
    expect(tree.delete(15)).toBe(false);
    expect(tree.delete(20)).toBe(true);
    expect(tree.size).toBe(2);
    expect(tree.has(20)).toBe(false);
  });

  it('should return undefined for non-existent keys', async () => {
    const tree = new BPlusTree<number, string>();
    expect(tree.get(100)).toBeUndefined();
  });

  it('should clear all entries', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(1, 'one');
    tree.insert(2, 'two');
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size).toBe(0);
  });

  it('should find min and max entries', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'x');
    tree.insert(5, 'y');
    tree.insert(20, 'z');
    const min = tree.min();
    const max = tree.max();
    expect(min).toEqual({ key: 5, value: 'y' });
    expect(max).toEqual({ key: 20, value: 'z' });
  });

  it('should return undefined for min/max on empty tree', async () => {
    const tree = new BPlusTree<number, string>();
    expect(tree.min()).toBeUndefined();
    expect(tree.max()).toBeUndefined();
  });

  it('should return keys in order', async () => {
    const tree = new BPlusTree<number, number>();
    tree.insert(30, 1);
    tree.insert(10, 2);
    tree.insert(20, 3);
    expect(tree.keys()).toEqual([10, 20, 30]);
  });

  it('should return values in order', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(30, 'c');
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    expect(tree.values()).toEqual(['a', 'b', 'c']);
  });

  it('should return entries in order', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(30, 'c');
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    const entries = tree.entries();
    expect(entries).toEqual([
      { key: 10, value: 'a' },
      { key: 20, value: 'b' },
      { key: 30, value: 'c' },
    ]);
  });

  it('should traverse in-order with forEach', async () => {
    const tree = new BPlusTree<number, number>();
    const arr = [30, 10, 20, 50, 40];
    arr.forEach(n => tree.insert(n, n * 2));
    const collected: number[] = [];
    tree.forEach((v) => collected.push(v));
    expect(collected).toEqual([20, 40, 60, 80, 100]);
  });

  it('should return array of entries sorted by key', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(30, 'c');
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    const entries = tree.toArray();
    expect(entries).toEqual([
      { key: 10, value: 'a' },
      { key: 20, value: 'b' },
      { key: 30, value: 'c' },
    ]);
  });

  it('should handle range queries', async () => {
    const tree = new BPlusTree<number, number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i, i * 10);
    }
    const range = tree.range(3, 7);
    expect(range).toEqual([
      { key: 3, value: 30 },
      { key: 4, value: 40 },
      { key: 5, value: 50 },
      { key: 6, value: 60 },
      { key: 7, value: 70 },
    ]);
  });

  it('should handle range with no results', async () => {
    const tree = new BPlusTree<number, number>();
    tree.insert(1, 10);
    tree.insert(2, 20);
    const range = tree.range(5, 10);
    expect(range).toEqual([]);
  });

  it('should find first key at or after given key', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    tree.insert(30, 'c');
    const result = tree.findFirstKey(15);
    expect(result).toEqual({ key: 20, value: 'b' });
  });

  it('should return first key if findFirstKey called with existing key', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    const result = tree.findFirstKey(10);
    expect(result).toEqual({ key: 10, value: 'a' });
  });

  it('should find last key at or before given key', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    tree.insert(30, 'c');
    const result = tree.findLastKey(25);
    expect(result).toEqual({ key: 20, value: 'b' });
  });

  it('should return last key if findLastKey called with existing key', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    const result = tree.findLastKey(20);
    expect(result).toEqual({ key: 20, value: 'b' });
  });

  it('should handle constructor with order number', async () => {
    const tree = new BPlusTree<number, number>(4);
    expect(tree.size).toBe(0);
    tree.insert(1, 10);
    expect(tree.size).toBe(1);
  });

  it('should throw error for order less than 3', async () => {
    expect(() => new BPlusTree<number, number>(2)).toThrow(RangeError);
  });

  it('should use custom comparator', async () => {
    const tree = new BPlusTree<string, number>({ comparator: (a, b) => b.localeCompare(a) });
    tree.insert('a', 1);
    tree.insert('b', 2);
    tree.insert('c', 3);
    expect(tree.keys()).toEqual(['c', 'b', 'a']);
  });

  it('should iterate with for..of', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(3, 'c');
    tree.insert(1, 'a');
    tree.insert(2, 'b');
    const entries: { key: number; value: string }[] = [];
    for (const entry of tree) {
      entries.push(entry);
    }
    expect(entries).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
      { key: 3, value: 'c' },
    ]);
  });

  it('should handle edge case: single node deletion', async () => {
    const tree = new BPlusTree<number, number>();
    tree.insert(1, 1);
    tree.delete(1);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should handle large datasets', async () => {
    const tree = new BPlusTree<number, number>();
    const size = 1000;
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * size));
    }
    arr.forEach(n => tree.insert(n, n * 10));
    expect(tree.size).toBeGreaterThan(0);
    const keys = tree.keys();
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]).toBeGreaterThanOrEqual(keys[i - 1]);
    }
  });

  it('should handle sequential operations', async () => {
    const tree = new BPlusTree<number, string>();
    for (let i = 0; i < 50; i++) {
      tree.insert(i, `val${i}`);
    }
    for (let i = 0; i < 50; i += 2) {
      expect(tree.delete(i)).toBe(true);
    }
    expect(tree.size).toBe(25);
    expect(tree.get(1)).toBe('val1');
    expect(tree.has(2)).toBe(false);
  });

  it('should handle string keys', async () => {
    const tree = new BPlusTree<string, number>();
    tree.insert('apple', 1);
    tree.insert('banana', 2);
    tree.insert('cherry', 3);
    expect(tree.get('apple')).toBe(1);
    expect(tree.get('banana')).toBe(2);
    expect(tree.get('cherry')).toBe(3);
    expect(tree.has('apple')).toBe(true);
    expect(tree.has('date')).toBe(false);
  });

  it('should handle edge cases with duplicate key updates', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(1, 'first');
    tree.insert(1, 'second');
    tree.insert(1, 'third');
    expect(tree.size).toBe(1);
    expect(tree.get(1)).toBe('third');
    expect(tree.keys()).toEqual([1]);
  });

  it('should handle empty forEach', async () => {
    const tree = new BPlusTree<number, string>();
    let called = false;
    tree.forEach(() => {
      called = true;
    });
    expect(called).toBe(false);
  });

  it('should return empty arrays for empty tree', async () => {
    const tree = new BPlusTree<number, string>();
    expect(tree.keys()).toEqual([]);
    expect(tree.values()).toEqual([]);
    expect(tree.toArray()).toEqual([]);
    expect(tree.entries()).toEqual([]);
    expect(tree.range(1, 10)).toEqual([]);
  });

  it('should handle findFirstKey on empty tree', async () => {
    const tree = new BPlusTree<number, string>();
    expect(tree.findFirstKey(5)).toBeUndefined();
  });

  it('should handle findLastKey on empty tree', async () => {
    const tree = new BPlusTree<number, string>();
    expect(tree.findLastKey(5)).toBeUndefined();
  });

  it('should handle range with inverted bounds', async () => {
    const tree = new BPlusTree<number, number>();
    tree.insert(1, 10);
    tree.insert(2, 20);
    tree.insert(3, 30);
    const range = tree.range(10, 1);
    expect(range).toEqual([]);
  });

  it('should update with update method', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(1, 'original');
    expect(tree.update(1, 'updated')).toBe(true);
    expect(tree.get(1)).toBe('updated');
    expect(tree.size).toBe(1);
  });

  it('should fail update for non-existent key', async () => {
    const tree = new BPlusTree<number, string>();
    expect(tree.update(999, 'new')).toBe(false);
  });

  it('should handle insert and get', async () => {
    const tree = new BPlusTree<number, string>();
    tree.insert(1, 'a');
    tree.insert(2, 'b');
    tree.insert(3, 'c');
    expect(tree.get(2)).toBe('b');
  });

  it('should handle isEmpty', () => {
    const tree = new BPlusTree<number, string>(4);
    expect(tree.isEmpty()).toBe(true);
    tree.insert(1, 'a');
    expect(tree.isEmpty()).toBe(false);
  });

  it('should handle delete', () => {
    const tree = new BPlusTree<number, string>(4);
    tree.insert(1, 'a');
    tree.insert(2, 'b');
    tree.insert(3, 'c');
    expect(tree.delete(2)).toBe(true);
    expect(tree.get(2)).toBeUndefined();
    expect(tree.size).toBe(2);
  });

  it('should handle size after multiple inserts', () => {
    const tree = new BPlusTree<number, string>(4);
    tree.insert(1, 'a');
    tree.insert(2, 'b');
    tree.insert(3, 'c');
    tree.insert(4, 'd');
    tree.insert(5, 'e');
    expect(tree.size).toBe(5);
  });

  it('should handle min and max', () => {
    const tree = new BPlusTree<number, string>(4);
    tree.insert(5, 'e');
    tree.insert(1, 'a');
    tree.insert(3, 'c');
    expect(tree.min()!.key).toBe(1);
    expect(tree.max()!.key).toBe(5);
  });
  it('should handle delete', () => {
    const tree = new BPlusTree<number, string>(4);
    tree.insert(10, 'a');
    tree.insert(20, 'b');
    expect(tree.delete(10)).toBe(true);
    expect(tree.get(10)).toBeUndefined();
    expect(tree.delete(99)).toBe(false);
  });
});
