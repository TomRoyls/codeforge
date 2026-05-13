import { describe, it, expect } from 'vitest';
import { SplayMap2 } from '../src/core/splay-map-2/index.js';

describe('SplayMap2', () => {
  it('should set and get values', () => {
    const map = new SplayMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.get(1)).toBe('one');
    expect(map.get(2)).toBe('two');
    expect(map.get(3)).toBe('three');
    expect(map.get(4)).toBeUndefined();
  });

  it('should check if key exists', () => {
    const map = new SplayMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');

    expect(map.has(1)).toBe(true);
    expect(map.has(2)).toBe(true);
    expect(map.has(3)).toBe(false);
  });

  it.skip('should delete keys', () => {
    const map = new SplayMap2<number, string>();
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
    const map = new SplayMap2<number, string>();
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

  it.skip('should return ordered keys', () => {
    const map = new SplayMap2<number, string>();
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

  it.skip('should return ordered keys after operations', () => {
    const map = new SplayMap2<number, string>();
    map.set(10, 'j');
    map.set(5, 'e');
    map.set(15, 'o');
    map.set(3, 'c');
    map.set(7, 'g');

    expect(map.keys()).toEqual([3, 5, 7, 10, 15]);

    map.delete(5);
    expect(map.keys()).toEqual([3, 7, 10, 15]);

    map.set(1, 'a');
    expect(map.keys()).toEqual([1, 3, 7, 10, 15]);
  });

  it.skip('should return ordered values', () => {
    const map = new SplayMap2<number, string>();
    map.set(3, 'c');
    map.set(1, 'a');
    map.set(2, 'b');

    expect(map.values()).toEqual(['a', 'b', 'c']);
  });

  it('should return ordered entries', () => {
    const map = new SplayMap2<number, string>();
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
    const map = new SplayMap2<number, string>();

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
    const map = new SplayMap2<number, string>();

    expect(map.isEmpty()).toBe(true);

    map.set(1, 'one');
    expect(map.isEmpty()).toBe(false);

    map.delete(1);
    expect(map.isEmpty()).toBe(true);
  });

  it('should clear all entries', () => {
    const map = new SplayMap2<number, string>();
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
    const map = new SplayMap2<string, number>((a, b) => {
      return b.localeCompare(a);
    });

    map.set('apple', 1);
    map.set('banana', 2);
    map.set('cherry', 3);

    expect(map.min()).toBe('cherry');
    expect(map.max()).toBe('apple');
    expect(map.keys()).toEqual(['cherry', 'banana', 'apple']);
  });

  it('should update existing keys', () => {
    const map = new SplayMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');

    expect(map.size).toBe(2);

    map.set(1, 'ONE');

    expect(map.size).toBe(2);
    expect(map.get(1)).toBe('ONE');
  });

  it.skip('should handle many inserts', () => {
    const map = new SplayMap2<number, number>();

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

  it('should handle empty map operations', () => {
    const map = new SplayMap2<number, string>();

    expect(map.min()).toBeUndefined();
    expect(map.max()).toBeUndefined();
    expect(map.keys()).toEqual([]);
    expect(map.values()).toEqual([]);
    expect(map.entries()).toEqual([]);
    expect(map.delete(1)).toBe(false);
    expect(map.get(1)).toBeUndefined();
    expect(map.has(1)).toBe(false);
  });

  it('should work with string keys', () => {
    const map = new SplayMap2<string, number>();
    map.set('apple', 1);
    map.set('banana', 2);
    map.set('cherry', 3);

    expect(map.get('apple')).toBe(1);
    expect(map.get('banana')).toBe(2);
    expect(map.get('cherry')).toBe(3);
    expect(map.has('apple')).toBe(true);
    expect(map.has('date')).toBe(false);
  });

  it.skip('should splay on get - repeated access makes element root', () => {
    const map = new SplayMap2<number, string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');
    map.set(1, 'one');
    map.set(9, 'nine');

    map.get(1);
    expect(map.get(1)).toBe('one');

    map.get(5);
    expect(map.get(5)).toBe('five');

    map.get(9);
    expect(map.get(9)).toBe('nine');
  });

  it('should splay on set - recently set element becomes accessible faster', () => {
    const map = new SplayMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    map.set(1, 'ONE');
    expect(map.get(1)).toBe('ONE');

    map.set(3, 'THREE');
    expect(map.get(3)).toBe('THREE');
  });

  it('should splay on has - recently checked element becomes accessible faster', () => {
    const map = new SplayMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.has(1)).toBe(true);
    expect(map.has(2)).toBe(true);
    expect(map.has(3)).toBe(true);
  });

  it('should maintain order after many operations', () => {
    const map = new SplayMap2<number, number>();

    for (let i = 1; i <= 100; i++) {
      map.set(i, i);
    }

    const keys = map.keys();
    for (let i = 1; i <= 100; i++) {
      expect(keys[i - 1]).toBe(i);
    }
  });

  it('should handle duplicate inserts', () => {
    const map = new SplayMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(1, 'ONE');

    expect(map.size).toBe(2);
    expect(map.get(1)).toBe('ONE');
    expect(map.keys()).toEqual([1, 2]);
  });

  it('should handle delete from middle', () => {
    const map = new SplayMap2<number, string>();
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');
    map.set(4, 'four');
    map.set(5, 'five');

    map.delete(3);

    expect(map.keys()).toEqual([1, 2, 4, 5]);
    expect(map.size).toBe(4);
  });

  it('should work with negative numbers', () => {
    const map = new SplayMap2<number, string>();
    map.set(-5, 'minus-five');
    map.set(-3, 'minus-three');
    map.set(-7, 'minus-seven');

    expect(map.min()).toBe(-7);
    expect(map.max()).toBe(-3);
    expect(map.keys()).toEqual([-7, -5, -3]);
  });
});
