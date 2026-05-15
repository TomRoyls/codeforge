import { describe, it, expect } from 'vitest';
import { RedBlackMap3 } from '../src/core/red-black-map-3/index.js';

describe('RedBlackMap3', () => {
  it('should set and get values', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.get(1)).toBe('one');
    expect(map.get(2)).toBe('two');
    expect(map.get(3)).toBe('three');
    expect(map.get(4)).toBeUndefined();
  });

  it('should check if key exists', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');

    expect(map.has(1)).toBe(true);
    expect(map.has(2)).toBe(true);
    expect(map.has(3)).toBe(false);
  });

  it('should delete keys', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.delete(2)).toBe(true);
    expect(map.has(2)).toBe(false);
    expect(map.get(2)).toBeUndefined();
    expect(map.delete(4)).toBe(false);
    expect(map.delete(1)).toBe(true);
    expect(map.delete(3)).toBe(true);
  });

  it('should find min and max keys', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(5, 'five');
    map.set(2, 'two');
    map.set(8, 'eight');
    map.set(1, 'one');
    map.set(9, 'nine');

    expect(map.min()).toBe(1);
    expect(map.max()).toBe(9);

    map.delete(1);
    expect(map.min()).toBe(2);

    map.delete(9);
    expect(map.max()).toBe(8);
  });

  it('should return ordered keys', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(5, 'e');
    map.set(2, 'b');
    map.set(8, 'h');
    map.set(1, 'a');
    map.set(9, 'i');
    map.set(3, 'c');
    map.set(7, 'g');
    map.set(4, 'd');
    map.set(6, 'f');

    expect(map.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return ordered values', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(3, 'c');
    map.set(1, 'a');
    map.set(2, 'b');

    expect(map.values()).toEqual(['a', 'b', 'c']);
  });

  it('should return ordered entries', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(2, 'b');
    map.set(1, 'a');
    map.set(3, 'c');

    expect(map.entries()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });

  it('should return correct size', () => {
    const map = new RedBlackMap3<number, string>();

    expect(map.size).toBe(0);

    map.set(1, 'one');
    expect(map.size).toBe(1);

    map.set(2, 'two');
    expect(map.size).toBe(2);

    map.set(3, 'three');
    expect(map.size).toBe(3);

    map.delete(2);
    expect(map.size).toBe(2);
  });

  it('should check if empty', () => {
    const map = new RedBlackMap3<number, string>();

    expect(map.isEmpty()).toBe(true);

    map.set(1, 'one');
    expect(map.isEmpty()).toBe(false);

    map.delete(1);
    expect(map.isEmpty()).toBe(true);
  });

  it('should clear all entries', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.size).toBe(3);

    map.clear();

    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
    expect(map.get(1)).toBeUndefined();
    expect(map.get(2)).toBeUndefined();
    expect(map.get(3)).toBeUndefined();
  });

  it('should handle custom comparator', () => {
    const map = new RedBlackMap3<string, number>((a, b) => {
      return b.localeCompare(a);
    });

    map.set('apple', 1);
    map.set('banana', 2);
    map.set('cherry', 3);

    expect(map.min()).toBe('cherry');
    expect(map.max()).toBe('apple');
  });

  it('should update existing keys', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');

    expect(map.size).toBe(2);

    map.set(1, 'ONE');

    expect(map.size).toBe(2);
    expect(map.get(1)).toBe('ONE');
  });

  it('should stay balanced after sequential inserts', () => {
    const map = new RedBlackMap3<number, number>();

    for (let i = 1; i <= 1000; i++) {
      map.set(i, i * i);
    }

    expect(map.size).toBe(1000);

    for (let i = 1; i <= 1000; i++) {
      expect(map.get(i)).toBe(i * i);
    }

    expect(map.min()).toBe(1);
    expect(map.max()).toBe(1000);
  });

  it('should stay balanced after random inserts', () => {
    const map = new RedBlackMap3<number, number>();

    for (let i = 0; i < 500; i++) {
      const key = Math.floor(Math.random() * 1000);
      map.set(key, key);
    }

    expect(map.size).toBeGreaterThanOrEqual(100);

    const keys = map.keys();
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]).toBeGreaterThan(keys[i - 1]);
    }
  });

  it('should handle empty map operations', () => {
    const map = new RedBlackMap3<number, string>();

    expect(map.min()).toBeUndefined();
    expect(map.max()).toBeUndefined();
    expect(map.keys()).toEqual([]);
    expect(map.values()).toEqual([]);
    expect(map.entries()).toEqual([]);
  });

  it('should work with string keys', () => {
    const map = new RedBlackMap3<string, number>();
    map.set('apple', 1);
    map.set('banana', 2);
    map.set('cherry', 3);

    expect(map.get('apple')).toBe(1);
    expect(map.get('banana')).toBe(2);
    expect(map.get('cherry')).toBe(3);
    expect(map.has('apple')).toBe(true);
    expect(map.has('date')).toBe(false);
  });

  it('should update existing key', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'original');
    map.set(1, 'updated');
    expect(map.get(1)).toBe('updated');
    expect(map.size).toBe(1);
  });

  it('should delete non-existent key', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'a');
    expect(map.delete(99)).toBe(false);
    expect(map.size).toBe(1);
  });

  it('should return correct entries in order', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(2, 'b');
    map.set(1, 'a');
    map.set(3, 'c');
    expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  it('should handle single entry min/max', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(5, 'five');
    expect(map.min()).toBe(5);
    expect(map.max()).toBe(5);
  });

  it('should handle negative keys', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(-5, 'neg5');
    map.set(0, 'zero');
    map.set(5, 'pos5');
    map.set(-10, 'neg10');
    expect(map.keys()).toEqual([-10, -5, 0, 5]);
    expect(map.get(-5)).toBe('neg5');
    expect(map.min()).toBe(-10);
    expect(map.max()).toBe(5);
  });

  it('should handle sequential deletes', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'a');
    map.set(2, 'b');
    map.set(3, 'c');
    map.set(4, 'd');
    map.set(5, 'e');
    map.delete(3);
    expect(map.size).toBe(4);
    expect(map.keys()).toEqual([1, 2, 4, 5]);
    map.delete(1);
    expect(map.keys()).toEqual([2, 4, 5]);
    map.delete(5);
    expect(map.keys()).toEqual([2, 4]);
    expect(map.min()).toBe(2);
    expect(map.max()).toBe(4);
  });

  it('should maintain order after mixed operations', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(5, 'e');
    map.set(2, 'b');
    map.set(8, 'h');
    map.delete(5);
    map.set(3, 'c');
    map.set(1, 'a');
    map.delete(8);
    map.set(6, 'f');
    expect(map.keys()).toEqual([1, 2, 3, 6]);
    expect(map.values()).toEqual(['a', 'b', 'c', 'f']);
  });

  it('should handle reverse insertion order', () => {
    const map = new RedBlackMap3<number, string>();
    for (let i = 10; i >= 1; i--) {
      map.set(i, `v${i}`);
    }
    expect(map.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(map.min()).toBe(1);
    expect(map.max()).toBe(10);
    expect(map.get(5)).toBe('v5');
  });

  it('should delete all entries and verify empty', () => {
    const map = new RedBlackMap3<number, string>();
    map.set(1, 'a');
    map.set(2, 'b');
    map.set(3, 'c');
    map.delete(1);
    map.delete(2);
    map.delete(3);
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
    expect(map.keys()).toEqual([]);
    expect(map.entries()).toEqual([]);
  });
});
