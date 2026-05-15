import { describe, it, expect } from 'vitest';
import { SplayTreeMap2 } from '../src/core/splay-tree-map-2';

describe('SplayTreeMap2', () => {
  it('should create empty tree', async () => {
    const map = new SplayTreeMap2<number, string>();
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
    expect(map.get(1)).toBeUndefined();
  });

  it('should insert and get values', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.get(1)).toBe('one');
    expect(map.get(2)).toBe('two');
    expect(map.get(3)).toBe('three');
    expect(map.size).toBe(3);
  });

  it('should update existing key', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    map.set(1, 'ONE');

    expect(map.get(1)).toBe('ONE');
    expect(map.size).toBe(1);
  });

  it('should check key existence with has', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');

    expect(map.has(1)).toBe(true);
    expect(map.has(2)).toBe(true);
    expect(map.has(3)).toBe(false);
  });

  it('should delete keys', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.delete(2)).toBe(true);
    expect(map.size).toBe(2);
    expect(map.get(2)).toBeUndefined();
    expect(map.delete(2)).toBe(false);
  });

  it('should return min and max keys', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');
    map.set(1, 'one');
    map.set(9, 'nine');

    expect(map.min()).toBe(1);
    expect(map.max()).toBe(9);
  });

  it('should return undefined for min/max on empty tree', async () => {
    const map = new SplayTreeMap2<number, string>();
    expect(map.min()).toBeUndefined();
    expect(map.max()).toBeUndefined();
  });

  it('should iterate with forEach', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');

    const result: [number, string][] = [];
    map.forEach((key, value) => {
      result.push([key, value]);
    });

    expect(result).toEqual([[1, 'one'], [2, 'two'], [3, 'three']]);
  });

  it('should return all keys in order', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(5, 'five');
    map.set(4, 'four');

    const keys = map.keys();
    expect(keys).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return all values in order', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');

    const values = map.values();
    expect(values).toEqual(['one', 'two', 'three']);
  });

  it('should convert to sorted array', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');

    const arr = map.toArray();
    expect(arr).toEqual([[1, 'one'], [2, 'two'], [3, 'three']]);
  });

  it('should clear all entries', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    map.clear();
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
    expect(map.get(1)).toBeUndefined();
  });

  it('should handle string keys with default comparator', async () => {
    const map = new SplayTreeMap2<string, number>();
    map.set('banana', 3);
    map.set('apple', 1);
    map.set('cherry', 2);

    expect(map.keys()).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should handle custom comparator', async () => {
    const map = new SplayTreeMap2<{ id: number }, string>((a, b) => a.id - b.id);
    map.set({ id: 3 }, 'three');
    map.set({ id: 1 }, 'one');
    map.set({ id: 2 }, 'two');

    expect(map.size).toBe(3);
    expect(map.get({ id: 2 })).toBe('two');
  });

  it('should splay accessed node to root', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');
    map.set(1, 'one');
    map.set(9, 'nine');

    map.get(3);
    expect(map.get(3)).toBe('three');
    expect(map.get(5)).toBe('five');
  });

  it('should splay inserted node to root', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');

    map.set(1, 'one');
    expect(map.get(1)).toBe('one');
  });

  it('should handle single element tree', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');

    expect(map.size).toBe(1);
    expect(map.min()).toBe(1);
    expect(map.max()).toBe(1);
    expect(map.keys()).toEqual([1]);
  });

  it('should delete root', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(2, 'two');
    map.set(1, 'one');
    map.set(3, 'three');

    map.get(2);
    map.delete(2);

    expect(map.size).toBe(2);
    expect(map.has(2)).toBe(false);
    expect(map.min()).toBe(1);
    expect(map.max()).toBe(3);
  });

  it('should delete leaf node', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    map.delete(1);
    expect(map.size).toBe(2);
    expect(map.has(1)).toBe(false);
  });

  it('should handle large dataset', async () => {
    const map = new SplayTreeMap2<number, number>();
    const size = 1000;

    for (let i = 0; i < size; i++) {
      map.set(i, i * 2);
    }

    expect(map.size).toBe(size);
    expect(map.min()).toBe(0);
    expect(map.max()).toBe(size - 1);

    for (let i = 0; i < size; i++) {
      expect(map.get(i)).toBe(i * 2);
    }
  });

  it('should handle reverse insertion order', async () => {
    const map = new SplayTreeMap2<number, string>();

    for (let i = 10; i >= 1; i--) {
      map.set(i, `value${i}`);
    }

    const keys = map.keys();
    expect(keys!.length).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(keys![i]).toBe(i + 1);
    }
  });

  it('should handle duplicate gets to test splay', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    for (let i = 0; i < 100; i++) {
      map.get(2);
    }

    expect(map.get(2)).toBe('two');
    expect(map.size).toBe(3);
  });

  it('should handle mixed operations', async () => {
    const map = new SplayTreeMap2<number, string>();

    map.set(5, 'five');
    map.set(3, 'three');
    expect(map.get(5)).toBe('five');
    map.set(7, 'seven');
    expect(map.get(3)).toBe('three');
    map.set(1, 'one');
    map.delete(5);
    expect(map.has(5)).toBe(false);
    map.set(2, 'two');
    expect(map.size).toBe(4);
    expect(map.keys()!.length).toBe(4);
  });

  it('should clear and reuse tree', async () => {
    const map = new SplayTreeMap2<number, string>();

    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    map.clear();

    map.set(10, 'ten');
    map.set(20, 'twenty');
    map.set(30, 'thirty');

    expect(map.size).toBe(3);
    expect(map.get(10)).toBe('ten');
    expect(map.min()).toBe(10);
    expect(map.max()).toBe(30);
  });

  it('should handle negative numbers', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(-3, 'negative three');
    map.set(-1, 'negative one');
    map.set(-2, 'negative two');

    expect(map.keys()).toEqual([-3, -2, -1]);
    expect(map.min()).toBe(-3);
    expect(map.max()).toBe(-1);
  });

  it('should maintain order after multiple deletions', async () => {
    const map = new SplayTreeMap2<number, string>();

    for (let i = 1; i <= 10; i++) {
      map.set(i, `value${i}`);
    }

    map.delete(2);
    map.delete(5);
    map.delete(8);

    const keys = map.keys();
    expect(keys!.length).toBe(7);
    expect(keys!).toEqual([1, 3, 4, 6, 7, 9, 10]);
  });

  it('should handle delete of non-existent key', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'one');
    expect(map.delete(99)).toBe(false);
    expect(map.size).toBe(1);
  });

  it('should handle toArray on empty tree', async () => {
    const map = new SplayTreeMap2<number, string>();
    expect(map.toArray()).toEqual([]);
    expect(map.keys()).toEqual([]);
    expect(map.values()).toEqual([]);
  });

  it('should handle delete all elements one by one', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'a');
    map.set(2, 'b');
    map.set(3, 'c');
    map.delete(2);
    map.delete(1);
    map.delete(3);
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
  });

  it('should handle sequential access pattern', async () => {
    const map = new SplayTreeMap2<number, number>();
    for (let i = 0; i < 50; i++) {
      map.set(i, i * 10);
    }
    for (let i = 0; i < 50; i++) {
      expect(map.get(i)).toBe(i * 10);
    }
    expect(map.size).toBe(50);
  });

  it('should handle clear then isEmpty', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(1, 'a');
    map.clear();
    expect(map.isEmpty()).toBe(true);
    expect(map.size).toBe(0);
  });

  it('should return min and max keys', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(5, 'e');
    map.set(2, 'b');
    map.set(8, 'h');
    expect(map.min()).toBe(2);
    expect(map.max()).toBe(8);
  });

  it('should iterate with forEach', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(3, 'c');
    map.set(1, 'a');
    map.set(2, 'b');
    const result: string[] = [];
    map.forEach((key, value) => result.push(value));
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should handle toArray', async () => {
    const map = new SplayTreeMap2<number, string>();
    map.set(3, 'c');
    map.set(1, 'a');
    map.set(2, 'b');
    const arr = map.toArray();
    expect(arr).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  it('should handle values on empty tree', async () => {
    const map = new SplayTreeMap2<number, string>();
    expect(map.values()).toEqual([]);
    expect(map.keys()).toEqual([]);
  });
});
