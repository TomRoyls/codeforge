import { describe, it, expect } from 'vitest';
import { RadixMap2 } from '../src/core/radix-map-2/index.js';

describe('RadixMap2', () => {
  it('should create empty map', () => {
    const map = new RadixMap2<string>();
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
  });

  it('should set and get values', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');

    expect(map.get(5)).toBe('five');
    expect(map.get(3)).toBe('three');
    expect(map.get(7)).toBe('seven');
  });

  it('should return undefined for non-existent keys', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    expect(map.get(10)).toBe(undefined);
  });

  it('should check if key exists', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(3, 'three');

    expect(map.has(5)).toBe(true);
    expect(map.has(3)).toBe(true);
    expect(map.has(10)).toBe(false);
  });

  it('should delete keys', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');

    expect(map.delete(5)).toBe(true);
    expect(map.get(5)).toBe(undefined);
    expect(map.has(5)).toBe(false);
    expect(map.size).toBe(2);
  });

  it('should return false when deleting non-existent key', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    expect(map.delete(10)).toBe(false);
    expect(map.size).toBe(1);
  });

  it('should update size correctly', () => {
    const map = new RadixMap2<string>();
    expect(map.size).toBe(0);

    map.set(1, 'one');
    expect(map.size).toBe(1);

    map.set(2, 'two');
    expect(map.size).toBe(2);

    map.delete(1);
    expect(map.size).toBe(1);
  });

  it('should check if empty', () => {
    const map = new RadixMap2<string>();
    expect(map.isEmpty()).toBe(true);

    map.set(5, 'five');
    expect(map.isEmpty()).toBe(false);

    map.delete(5);
    expect(map.isEmpty()).toBe(true);
  });

  it('should return minimum key', () => {
    const map = new RadixMap2<string>();
    expect(map.min()).toBe(undefined);

    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');
    expect(map.min()).toBe(3);
  });

  it('should return maximum key', () => {
    const map = new RadixMap2<string>();
    expect(map.max()).toBe(undefined);

    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');
    expect(map.max()).toBe(7);
  });

  it('should return all keys in sorted order', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');
    map.set(1, 'one');
    map.set(9, 'nine');

    const keys = map.keys();
    expect(keys).toEqual([1, 3, 5, 7, 9]);
  });

  it('should return all values', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');

    const values = map.values();
    expect(values).toContain('five');
    expect(values).toContain('three');
    expect(values).toContain('seven');
    expect(values.length).toBe(3);
  });

  it('should return all entries', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');

    const entries = map.entries();
    expect(entries.length).toBe(3);
    expect(entries).toContainEqual([3, 'three']);
    expect(entries).toContainEqual([5, 'five']);
    expect(entries).toContainEqual([7, 'seven']);
  });

  it('should clear all entries', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(3, 'three');
    map.set(7, 'seven');

    map.clear();
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
    expect(map.get(5)).toBe(undefined);
  });

  it('should handle duplicate keys by updating value', () => {
    const map = new RadixMap2<string>();
    map.set(5, 'five');
    map.set(5, 'FIVE');

    expect(map.size).toBe(1);
    expect(map.get(5)).toBe('FIVE');
  });

  it('should handle many operations efficiently', () => {
    const map = new RadixMap2<number>();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      map.set(i, i * 2);
    }

    expect(map.size).toBe(count);

    for (let i = 0; i < count; i++) {
      expect(map.get(i)).toBe(i * 2);
    }

    const keys = map.keys();
    for (let i = 0; i < count; i++) {
      expect(keys[i]).toBe(i);
    }
  });

  it('should handle negative keys', () => {
    const map = new RadixMap2<string>();
    map.set(-5, 'negative five');
    map.set(-3, 'negative three');
    map.set(5, 'positive five');

    expect(map.min()).toBe(-5);
    expect(map.max()).toBe(5);
    expect(map.has(-5)).toBe(true);
    expect(map.get(-3)).toBe('negative three');

    const keys = map.keys();
    expect(keys).toEqual([-5, -3, 5]);
  });

  it('should handle zero key', () => {
    const map = new RadixMap2<string>();
    map.set(0, 'zero');
    map.set(-5, 'negative');
    map.set(5, 'positive');

    expect(map.get(0)).toBe('zero');
    expect(map.has(0)).toBe(true);

    const keys = map.keys();
    expect(keys).toEqual([-5, 0, 5]);
  });

  it('should maintain sorted order after multiple sets', () => {
    const map = new RadixMap2<string>();
    map.set(100, 'hundred');
    map.set(50, 'fifty');
    map.set(150, 'one fifty');
    map.set(25, 'twenty five');
    map.set(75, 'seventy five');

    const keys = map.keys();
    expect(keys).toEqual([25, 50, 75, 100, 150]);
  });

  it('should handle mixed positive and negative numbers', () => {
    const map = new RadixMap2<string>();
    map.set(100, 'hundred');
    map.set(-50, 'negative fifty');
    map.set(75, 'seventy five');
    map.set(-100, 'negative hundred');
    map.set(25, 'twenty five');

    const keys = map.keys();
    expect(keys).toEqual([-100, -50, 25, 75, 100]);
  });

  it('should work with different value types', () => {
    const stringMap = new RadixMap2<string>();
    stringMap.set(1, 'one');
    expect(stringMap.get(1)).toBe('one');

    const numberMap = new RadixMap2<number>();
    numberMap.set(1, 100);
    expect(numberMap.get(1)).toBe(100);

    const objectMap = new RadixMap2<{ name: string }>();
    objectMap.set(1, { name: 'test' });
    expect(objectMap.get(1)).toEqual({ name: 'test' });
  });

  it('should delete from middle of sorted keys', () => {
    const map = new RadixMap2<string>();
    map.set(1, 'one');
    map.set(5, 'five');
    map.set(10, 'ten');
    map.set(15, 'fifteen');
    map.set(20, 'twenty');

    map.delete(10);
    const keys = map.keys();
    expect(keys).toEqual([1, 5, 15, 20]);
  });

  it('should delete first key', () => {
    const map = new RadixMap2<string>();
    map.set(1, 'one');
    map.set(5, 'five');
    map.set(10, 'ten');

    map.delete(1);
    const keys = map.keys();
    expect(keys).toEqual([5, 10]);
    expect(map.min()).toBe(5);
  });

  it('should delete last key', () => {
    const map = new RadixMap2<string>();
    map.set(1, 'one');
    map.set(5, 'five');
    map.set(10, 'ten');

    map.delete(10);
    const keys = map.keys();
    expect(keys).toEqual([1, 5]);
    expect(map.max()).toBe(5);
  });

  it('should return undefined for min/max on empty', () => {
    const map = new RadixMap2<string>();
    expect(map.min()).toBeUndefined();
    expect(map.max()).toBeUndefined();
  });

  it('should return correct entries', () => {
    const map = new RadixMap2<string>();
    map.set(3, 'three');
    map.set(1, 'one');
    map.set(2, 'two');
    expect(map.entries()).toEqual([[1, 'one'], [2, 'two'], [3, 'three']]);
  });

  it('should return correct values in order', () => {
    const map = new RadixMap2<string>();
    map.set(3, 'c');
    map.set(1, 'a');
    map.set(2, 'b');
    expect(map.values()).toEqual(['a', 'b', 'c']);
  });

  it('should clear all entries', () => {
    const map = new RadixMap2<string>();
    map.set(1, 'a');
    map.set(2, 'b');
    map.clear();
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
  });

  it('should report isEmpty correctly', () => {
    const map = new RadixMap2<string>();
    expect(map.isEmpty()).toBe(true);
    map.set(1, 'a');
    expect(map.isEmpty()).toBe(false);
  });

  it('should handle delete of non-existent key', () => {
    const map = new RadixMap2<string>();
    map.set(1, 'a');
    expect(map.delete(99)).toBe(false);
    expect(map.size).toBe(1);
  });

  it('should update value for existing key', () => {
    const map = new RadixMap2<string>();
    map.set(1, 'old');
    map.set(1, 'new');
    expect(map.get(1)).toBe('new');
    expect(map.size).toBe(1);
  });
});
