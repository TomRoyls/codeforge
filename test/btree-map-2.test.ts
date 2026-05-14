import { describe, it, expect, beforeEach } from 'vitest';
import { BTreeMap } from '../src/core/btree-map-2/index.js';

describe('BTreeMap2', () => {
  let map: BTreeMap<number, string>;

  beforeEach(() => {
    map = new BTreeMap<number, string>();
  });

  it('should initialize empty', async () => {
    expect(map.size).toBe(0);
    expect(map.isEmpty()).toBe(true);
  });

  it('should set and get values', async () => {
    map.set(10, 'ten');
    map.set(20, 'twenty');
    map.set(5, 'five');
    expect(map.get(10)).toBe('ten');
    expect(map.get(20)).toBe('twenty');
    expect(map.get(5)).toBe('five');
    expect(map.size).toBe(3);
  });

  it('should update existing keys', async () => {
    map.set(10, 'ten');
    map.set(10, 'TEN');
    expect(map.size).toBe(1);
    expect(map.get(10)).toBe('TEN');
  });

  it('should check key existence with has', async () => {
    map.set('a', 1);
    expect(map.has('a')).toBe(true);
    expect(map.has('b')).toBe(false);
  });

  it('should delete keys', async () => {
    map.set(10, '10');
    map.set(20, '20');
    map.set(5, '5');
    expect(map.delete(15)).toBe(false);
    expect(map.delete(20)).toBe(true);
    expect(map.size).toBe(2);
    expect(map.has(20)).toBe(false);
  });

  it('should return undefined for non-existent keys', async () => {
    expect(map.get(100)).toBeUndefined();
  });

  it('should clear all entries', async () => {
    map.set(1, '1');
    map.set(2, '2');
    map.clear();
    expect(map.isEmpty()).toBe(true);
    expect(map.size).toBe(0);
  });

  it('should find min and max keys', async () => {
    map.set(10, 'x');
    map.set(5, 'y');
    map.set(20, 'z');
    const min = map.min();
    const max = map.max();
    expect(min?.key).toBe(5);
    expect(min?.value).toBe('y');
    expect(max?.key).toBe(20);
    expect(max?.value).toBe('z');
  });

  it('should return undefined for min/max on empty map', async () => {
    expect(map.min()).toBeUndefined();
    expect(map.max()).toBeUndefined();
  });

  it('should return correct floor entry', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    const floor15 = map.floor(15);
    const floor20 = map.floor(20);
    const floor5 = map.floor(5);
    expect(floor15?.key).toBe(10);
    expect(floor20?.key).toBe(20);
    expect(floor5).toBeUndefined();
  });

  it('should return correct ceiling entry', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    const ceiling15 = map.ceiling(15);
    const ceiling20 = map.ceiling(20);
    const ceiling35 = map.ceiling(35);
    expect(ceiling15?.key).toBe(20);
    expect(ceiling20?.key).toBe(20);
    expect(ceiling35).toBeUndefined();
  });

  it('should return correct lower entry (strictly less than)', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    const lower15 = map.lower(15);
    const lower10 = map.lower(10);
    const lower5 = map.lower(5);
    expect(lower15?.key).toBe(10);
    expect(lower10).toBeUndefined();
    expect(lower5).toBeUndefined();
  });

  it('should return correct higher entry (strictly greater than)', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    const higher15 = map.higher(15);
    const higher20 = map.higher(20);
    const higher35 = map.higher(35);
    expect(higher15?.key).toBe(20);
    expect(higher20?.key).toBe(30);
    expect(higher35).toBeUndefined();
  });

  it('should return entries in range', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    map.set(40, 'd');
    map.set(50, 'e');
    const range = map.range(20, 40);
    expect(range.length).toBe(3);
    expect(range[0]!.key).toBe(20);
    expect(range[1]!.key).toBe(30);
    expect(range[2]!.key).toBe(40);
  });

  it('should return correct index of key', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    expect(map.indexOf(10)).toBe(0);
    expect(map.indexOf(20)).toBe(1);
    expect(map.indexOf(30)).toBe(2);
    expect(map.indexOf(15)).toBe(-1);
  });

  it('should return entry at index', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    const entry0 = map.at(0);
    const entry1 = map.at(1);
    const entry2 = map.at(2);
    const entry3 = map.at(3);
    expect(entry0?.key).toBe(10);
    expect(entry1?.key).toBe(20);
    expect(entry2?.key).toBe(30);
    expect(entry3).toBeUndefined();
  });

  it('should traverse in-order with forEach', async () => {
    const arr = [30, 10, 20, 50, 40];
    arr.forEach(n => map.set(n, n * 2));
    const collected: number[] = [];
    map.forEach((v, k) => collected.push(k));
    expect(collected).toEqual([10, 20, 30, 40, 50]);
  });

  it('should pass map reference to forEach callback', async () => {
    map.set(1, 'a');
    let calledWithMap = false;
    map.forEach((v, k, m) => {
      if (m === map) calledWithMap = true;
    });
    expect(calledWithMap).toBe(true);
  });

  it('should return keys in order', async () => {
    map.set(30, '1');
    map.set(10, '2');
    map.set(20, '3');
    expect(map.keys()).toEqual([10, 20, 30]);
  });

  it('should return values in order', async () => {
    map.set(30, 'c');
    map.set(10, 'a');
    map.set(20, 'b');
    expect(map.values()).toEqual(['a', 'b', 'c']);
  });

  it('should return entries in order', async () => {
    map.set(30, 'c');
    map.set(10, 'a');
    map.set(20, 'b');
    const entries = map.entries();
    expect(entries.length).toBe(3);
    expect(entries[0]!.key).toBe(10);
    expect(entries[0]!.value).toBe('a');
    expect(entries[1]!.key).toBe(20);
    expect(entries[1]!.value).toBe('b');
    expect(entries[2]!.key).toBe(30);
    expect(entries[2]!.value).toBe('c');
  });

  it('should return array of entries from toArray', async () => {
    map.set(30, 'c');
    map.set(10, 'a');
    map.set(20, 'b');
    const entries = map.toArray();
    expect(entries.length).toBe(3);
    expect(entries[0]!.key).toBe(10);
    expect(entries[0]!.value).toBe('a');
  });

  it('should iterate with Symbol.iterator', async () => {
    map.set(3, 'c');
    map.set(1, 'a');
    map.set(2, 'b');
    const entries: { key: number; value: string }[] = [];
    for (const entry of map) {
      entries.push(entry);
    }
    expect(entries[0]!.key).toBe(1);
    expect(entries[0]!.value).toBe('a');
    expect(entries[1]!.key).toBe(2);
    expect(entries[1]!.value).toBe('b');
    expect(entries[2]!.key).toBe(3);
    expect(entries[2]!.value).toBe('c');
  });

  it('should return iterator from iterator() method', async () => {
    map.set(1, 'a');
    map.set(2, 'b');
    const iter = map.iterator();
    const first = iter.next();
    const second = iter.next();
    const third = iter.next();
    expect(first.done).toBe(false);
    expect(first.value!.key).toBe(1);
    expect(second.done).toBe(false);
    expect(second.value!.key).toBe(2);
    expect(third.done).toBe(true);
  });

  it('should handle edge case: single node deletion', async () => {
    map.set(1, '1');
    map.delete(1);
    expect(map.isEmpty()).toBe(true);
  });

  it('should handle edge case: root deletion', async () => {
    map.set(10, '10');
    map.set(5, '5');
    map.delete(10);
    expect(map.min()?.key).toBe(5);
    expect(map.max()?.key).toBe(5);
  });

  it('should handle large datasets', async () => {
    const size = 1000;
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * size));
    }
    arr.forEach(n => map.set(n, n * 10));
    expect(map.size).toBeGreaterThan(0);
    const keys = map.keys();
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]!).toBeGreaterThanOrEqual(keys[i - 1]!);
    }
  });

  it('should handle sequential operations', async () => {
    for (let i = 0; i < 50; i++) {
      map.set(i, `val${i}`);
    }
    for (let i = 0; i < 50; i += 2) {
      expect(map.delete(i)).toBe(true);
    }
    expect(map.size).toBe(25);
    expect(map.get(1)).toBe('val1');
    expect(map.has(2)).toBe(false);
  });

  it('should use default order', async () => {
    const map2 = new BTreeMap<number, number>(32);
    map2.set(1, 1);
    map2.set(2, 2);
    expect(map2.size).toBe(2);
  });

  it('should use custom comparator', async () => {
    const map2 = new BTreeMap<string, number>({ comparator: (a, b) => b.localeCompare(a) });
    map2.set('a', 1);
    map2.set('b', 2);
    map2.set('c', 3);
    expect(map2.keys()).toEqual(['c', 'b', 'a']);
  });

  it('should throw error for order less than 2', async () => {
    expect(() => new BTreeMap<number, number>(1)).toThrow(RangeError);
  });

  it('should handle empty keys array', async () => {
    expect(map.keys()).toEqual([]);
    expect(map.values()).toEqual([]);
    expect(map.toArray()).toEqual([]);
  });

  it('should handle empty forEach on empty map', async () => {
    map.forEach(() => {
      throw new Error('should not call');
    });
  });

  it('should handle empty range', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    const range = map.range(25, 25);
    expect(range).toEqual([]);
  });

  it('should handle range with no entries', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    const range = map.range(100, 200);
    expect(range).toEqual([]);
  });

  it('should handle at with negative index', async () => {
    map.set(1, 'a');
    map.set(2, 'b');
    expect(map.at(-1)).toBeUndefined();
  });

  it('should handle at beyond size', async () => {
    map.set(1, 'a');
    map.set(2, 'b');
    expect(map.at(10)).toBeUndefined();
  });

  it('should return -1 for indexOf on empty map', async () => {
    expect(map.indexOf(10)).toBe(-1);
  });

  it('should handle string keys', async () => {
    map = new BTreeMap<string, number>();
    map.set('apple', 1);
    map.set('banana', 2);
    map.set('cherry', 3);
    expect(map.get('apple')).toBe(1);
    expect(map.get('banana')).toBe(2);
    expect(map.get('cherry')).toBe(3);
    expect(map.has('apple')).toBe(true);
    expect(map.has('date')).toBe(false);
  });

  it('should handle duplicate key updates', async () => {
    map.set(1, 'first');
    map.set(1, 'second');
    map.set(1, 'third');
    expect(map.size).toBe(1);
    expect(map.get(1)).toBe('third');
    expect(map.keys()).toEqual([1]);
  });

  it('should maintain order after multiple deletions', async () => {
    for (let i = 0; i < 100; i++) {
      map.set(i, `val${i}`);
    }
    for (let i = 0; i < 100; i += 3) {
      map.delete(i);
    }
    const keys = map.keys();
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]!).toBeGreaterThan(keys[i - 1]!);
    }
  });

  it('should handle min and max after deletions', async () => {
    map.set(1, 'a');
    map.set(5, 'b');
    map.set(10, 'c');
    map.set(15, 'd');
    map.delete(1);
    expect(map.min()?.key).toBe(5);
    map.delete(15);
    expect(map.max()?.key).toBe(10);
  });

  it('should work with order parameter as number', async () => {
    const map2 = new BTreeMap<number, number>(4);
    map2.set(1, 1);
    map2.set(2, 2);
    map2.set(3, 3);
    expect(map2.size).toBe(3);
    expect(map2.get(1)).toBe(1);
  });

  it('should work with BTreeMapOptions', async () => {
    const map2 = new BTreeMap<number, number>({ order: 5, comparator: (a, b) => b - a });
    map2.set(1, 1);
    map2.set(2, 2);
    map2.set(3, 3);
    expect(map2.keys()).toEqual([3, 2, 1]);
  });

  it('should use default order when options undefined', async () => {
    const map2 = new BTreeMap<number, number>();
    map2.set(1, 1);
    map2.set(2, 2);
    expect(map2.size).toBe(2);
  });

  it('should handle floor/ceiling on edge cases', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    expect(map.floor(10)?.key).toBe(10);
    expect(map.ceiling(30)?.key).toBe(30);
  });

  it('should handle lower/higher on edge cases', async () => {
    map.set(10, 'a');
    map.set(20, 'b');
    map.set(30, 'c');
    expect(map.lower(10)).toBeUndefined();
    expect(map.higher(30)).toBeUndefined();
  });

  it('should iterate correctly after many operations', async () => {
    for (let i = 0; i < 100; i++) {
      map.set(i, i);
    }
    for (let i = 0; i < 50; i++) {
      map.delete(i * 2);
    }
    const keys = map.keys();
    let count = 0;
    for (const entry of map) {
      expect(entry.key).toBe(keys[count]!);
      count++;
    }
    expect(count).toBe(map.size);
  });

  it('should handle forEach mutation safety', async () => {
    map.set(1, 'a');
    map.set(2, 'b');
    map.set(3, 'c');
    const collected: number[] = [];
    map.forEach((v, k) => {
      collected.push(k);
    });
    expect(collected).toEqual([1, 2, 3]);
  });
});
