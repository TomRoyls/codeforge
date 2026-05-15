import { describe, it, expect } from 'vitest';
import { MultiMap3 } from '../src/core/multimap-3/index.js';

describe('MultiMap3', () => {
  it('should set and get multiple values for a key', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);
    map.set('a', 3);

    const values = map.get('a');
    expect(values).toEqual([1, 2, 3]);
  });

  it('should return empty array for non-existent key', () => {
    const map = new MultiMap3<string, number>();
    expect(map.get('nonexistent')).toEqual([]);
  });

  it('should delete a specific value', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);
    map.set('a', 3);

    const result = map.delete('a', 2);
    expect(result).toBe(true);
    expect(map.get('a')).toEqual([1, 3]);
  });

  it('should return false when deleting non-existent value', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);

    const result = map.delete('a', 99);
    expect(result).toBe(false);
    expect(map.get('a')).toEqual([1, 2]);
  });

  it('should delete all values for a key when value not specified', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);
    map.set('a', 3);

    const result = map.delete('a');
    expect(result).toBe(true);
    expect(map.get('a')).toEqual([]);
  });

  it('should return false when deleting from non-existent key', () => {
    const map = new MultiMap3<string, number>();
    const result = map.delete('nonexistent');
    expect(result).toBe(false);
  });

  it('should check if key exists', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);

    expect(map.has('a')).toBe(true);
    expect(map.has('b')).toBe(false);
  });

  it('should check if entry exists', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);

    expect(map.hasEntry('a', 1)).toBe(true);
    expect(map.hasEntry('a', 2)).toBe(true);
    expect(map.hasEntry('a', 3)).toBe(false);
    expect(map.hasEntry('b', 1)).toBe(false);
  });

  it('should return all keys', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);

    const keys = map.keys();
    expect(keys).toEqual(['a', 'b', 'c']);
  });

  it('should return all values from all keys', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);
    map.set('b', 3);
    map.set('c', 4);
    map.set('c', 5);

    const values = map.values();
    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return all entries', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);
    map.set('b', 3);

    const entries = map.entries();
    expect(entries).toEqual([
      ['a', [1, 2]],
      ['b', [3]]
    ]);
  });

  it('should track total size', () => {
    const map = new MultiMap3<string, number>();
    expect(map.size).toBe(0);

    map.set('a', 1);
    expect(map.size).toBe(1);

    map.set('a', 2);
    expect(map.size).toBe(2);

    map.set('b', 3);
    expect(map.size).toBe(3);

    map.delete('a', 1);
    expect(map.size).toBe(2);

    map.delete('b');
    expect(map.size).toBe(1);
  });

  it('should clear all entries', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);
    map.set('b', 3);

    map.clear();

    expect(map.size).toBe(0);
    expect(map.get('a')).toEqual([]);
    expect(map.get('b')).toEqual([]);
  });

  it('should return count of values for a key', () => {
    const map = new MultiMap3<string, number>();
    map.set('a', 1);
    map.set('a', 2);
    map.set('a', 3);
    map.set('b', 4);

    expect(map.count('a')).toBe(3);
    expect(map.count('b')).toBe(1);
    expect(map.count('c')).toBe(0);
  });
});
