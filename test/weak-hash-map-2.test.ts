import { describe, it, expect } from 'vitest';
import { WeakHashMap2 } from '../src/core/weak-hash-map-2/index.js';

describe('WeakHashMap2', () => {
  it('set and get with object keys', () => {
    const map = new WeakHashMap2<object, number>();
    const obj1 = {};
    const obj2 = {};

    map.set(obj1, 1);
    map.set(obj2, 2);

    expect(map.get(obj1)).toBe(1);
    expect(map.get(obj2)).toBe(2);
  });

  it('has method returns correct boolean', () => {
    const map = new WeakHashMap2<object, string>();
    const obj1 = {};
    const obj2 = {};

    map.set(obj1, 'value');

    expect(map.has(obj1)).toBe(true);
    expect(map.has(obj2)).toBe(false);
  });

  it('delete method removes entries', () => {
    const map = new WeakHashMap2<object, number>();
    const obj1 = {};

    map.set(obj1, 1);
    expect(map.has(obj1)).toBe(true);
    expect(map.delete(obj1)).toBe(true);
    expect(map.has(obj1)).toBe(false);
    expect(map.delete(obj1)).toBe(false);
  });

  it('size tracks number of entries', () => {
    const map = new WeakHashMap2<object, number>();
    const obj1 = {};
    const obj2 = {};
    const obj3 = {};

    expect(map.size).toBe(0);

    map.set(obj1, 1);
    expect(map.size).toBe(1);

    map.set(obj2, 2);
    expect(map.size).toBe(2);

    map.set(obj3, 3);
    expect(map.size).toBe(3);

    map.delete(obj2);
    expect(map.size).toBe(2);
  });

  it('clear removes all entries', () => {
    const map = new WeakHashMap2<object, number>();
    const obj1 = {};
    const obj2 = {};

    map.set(obj1, 1);
    map.set(obj2, 2);

    expect(map.size).toBe(2);

    map.clear();

    expect(map.size).toBe(0);
    expect(map.get(obj1)).toBeUndefined();
    expect(map.get(obj2)).toBeUndefined();
  });

  it('overwrites existing key value', () => {
    const map = new WeakHashMap2<object, number>();
    const obj1 = {};

    map.set(obj1, 1);
    expect(map.get(obj1)).toBe(1);

    map.set(obj1, 2);
    expect(map.get(obj1)).toBe(2);
    expect(map.size).toBe(1);
  });

  it('multiple different object keys work correctly', () => {
    const map = new WeakHashMap2<object, number>();
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 3 };
    const obj4 = {};

    map.set(obj1, 100);
    map.set(obj2, 200);
    map.set(obj3, 300);
    map.set(obj4, 400);

    expect(map.get(obj1)).toBe(100);
    expect(map.get(obj2)).toBe(200);
    expect(map.get(obj3)).toBe(300);
    expect(map.get(obj4)).toBe(400);
    expect(map.size).toBe(4);
  });

  it('primitive keys work correctly', () => {
    const map = new WeakHashMap2<string | number | boolean, string>();

    map.set('hello', 'world');
    map.set(123, 'number');
    map.set(true, 'boolean');

    expect(map.get('hello')).toBe('world');
    expect(map.get(123)).toBe('number');
    expect(map.get(true)).toBe('boolean');
    expect(map.get('missing')).toBeUndefined();
    expect(map.size).toBe(3);
  });

  it('mixed object and primitive keys', () => {
    const map = new WeakHashMap2<object | string, number>();
    const obj1 = {};

    map.set(obj1, 1);
    map.set('stringKey', 2);

    expect(map.get(obj1)).toBe(1);
    expect(map.get('stringKey')).toBe(2);
    expect(map.size).toBe(2);
  });

  it('has returns correct boolean', () => {
    const map = new WeakHashMap2<string, number>();
    map.set('key', 1);
    expect(map.has('key')).toBe(true);
    expect(map.has('missing')).toBe(false);
  });

  it('has works with object keys', () => {
    const map = new WeakHashMap2<object, number>();
    const obj = { id: 1 };
    map.set(obj, 42);
    expect(map.has(obj)).toBe(true);
    expect(map.has({})).toBe(false);
  });

  it('delete removes entries', () => {
    const map = new WeakHashMap2<string, number>();
    map.set('a', 1);
    map.set('b', 2);
    expect(map.delete('a')).toBe(true);
    expect(map.get('a')).toBeUndefined();
    expect(map.has('a')).toBe(false);
    expect(map.size).toBe(1);
  });

  it('delete returns false for non-existent key', () => {
    const map = new WeakHashMap2<string, number>();
    expect(map.delete('missing')).toBe(false);
  });

  it('clear removes all entries', () => {
    const map = new WeakHashMap2<string, number>();
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    map.clear();
    expect(map.size).toBe(0);
    expect(map.get('a')).toBeUndefined();
    expect(map.get('b')).toBeUndefined();
  });

  it('overwriting existing key updates value', () => {
    const map = new WeakHashMap2<string, number>();
    map.set('key', 1);
    map.set('key', 2);
    expect(map.get('key')).toBe(2);
    expect(map.size).toBe(2);
  });

  it('handles null and undefined keys', () => {
    const map = new WeakHashMap2<null | undefined | string, number>();
    map.set(null as any, 1);
    map.set(undefined as any, 2);
    expect(map.get(null as any)).toBe(1);
    expect(map.get(undefined as any)).toBe(2);
  });
});
