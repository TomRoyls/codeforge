import { describe, it, expect, beforeEach } from 'vitest';
import { CacheObliviousArray } from '../src/core/cache-oblivious-array/index.js';

describe('CacheObliviousArray', () => {
  let arr: CacheObliviousArray<number>;

  beforeEach(() => {
    arr = new CacheObliviousArray<number>();
  });

  describe('constructor', () => {
    it('creates empty array with no arguments', () => {
      const empty = new CacheObliviousArray<number>();
      expect(empty.length()).toBe(0);
      expect(empty.isEmpty()).toBe(true);
      expect(empty.blockSize()).toBe(1);
      expect(empty.blockCount()).toBe(0);
    });

    it('creates array from initial items', () => {
      const initial = new CacheObliviousArray<number>([1, 2, 3, 4, 5]);
      expect(initial.length()).toBe(5);
      expect(initial.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('computes correct block size for 10 elements', () => {
      const ten = new CacheObliviousArray<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(ten.blockSize()).toBe(3);
    });

    it('computes correct block size for 100 elements', () => {
      const hundred = new CacheObliviousArray<number>(Array.from({ length: 100 }, (_, i) => i));
      expect(hundred.blockSize()).toBe(10);
    });

    it('handles single element', () => {
      const single = new CacheObliviousArray<number>([5]);
      expect(single.length()).toBe(1);
      expect(single.blockSize()).toBe(1);
      expect(single.toArray()).toEqual([5]);
    });

    it('handles empty array constructor', () => {
      const fromEmpty = new CacheObliviousArray<number>([]);
      expect(fromEmpty.length()).toBe(0);
      expect(fromEmpty.isEmpty()).toBe(true);
    });
  });

  describe('get', () => {
    it('gets value at index', () => {
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.get(0)).toBe(10);
      expect(arr.get(1)).toBe(20);
      expect(arr.get(2)).toBe(30);
    });

    it('throws error for negative index', () => {
      arr.push(1);
      expect(() => arr.get(-1)).toThrow('Index -1 out of bounds [0, 1)');
    });

    it('throws error for index too large', () => {
      arr.push(1);
      arr.push(2);
      expect(() => arr.get(5)).toThrow('Index 5 out of bounds [0, 2)');
    });

    it('throws error on empty array', () => {
      expect(() => arr.get(0)).toThrow('Index 0 out of bounds [0, 0)');
    });

    it('handles multiple pushes and gets', () => {
      const values = [5, 10, 15, 20, 25];
      values.forEach(v => arr.push(v));
      values.forEach((v, i) => expect(arr.get(i)).toBe(v));
    });
  });

  describe('set', () => {
    it('sets value at index', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.set(1, 99);
      expect(arr.get(1)).toBe(99);
      expect(arr.toArray()).toEqual([1, 99, 3]);
    });

    it('throws error for negative index', () => {
      arr.push(1);
      expect(() => arr.set(-1, 5)).toThrow('Index -1 out of bounds [0, 1)');
    });

    it('throws error for index too large', () => {
      arr.push(1);
      arr.push(2);
      expect(() => arr.set(10, 5)).toThrow('Index 10 out of bounds [0, 2)');
    });

    it('throws error on empty array', () => {
      expect(() => arr.set(0, 5)).toThrow('Index 0 out of bounds [0, 0)');
    });

    it('handles multiple sets', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.set(0, 10);
      arr.set(2, 30);
      expect(arr.toArray()).toEqual([10, 2, 30]);
    });
  });

  describe('push', () => {
    it('adds element to end', () => {
      arr.push(5);
      arr.push(10);
      expect(arr.length()).toBe(2);
      expect(arr.get(1)).toBe(10);
    });

    it('handles single push', () => {
      arr.push(42);
      expect(arr.length()).toBe(1);
      expect(arr.get(0)).toBe(42);
    });

    it('updates block size when crossing threshold', () => {
      const small = new CacheObliviousArray<number>();
      expect(small.blockSize()).toBe(1);
      small.push(1);
      small.push(2);
      expect(small.blockSize()).toBe(1);
      for (let i = 0; i < 5; i++) {
        small.push(i);
      }
      expect(small.blockSize()).toBe(2);
    });

    it('handles many pushes', () => {
      for (let i = 0; i < 100; i++) {
        arr.push(i);
      }
      expect(arr.length()).toBe(100);
      expect(arr.get(99)).toBe(99);
    });
  });

  describe('pop', () => {
    it('removes and returns last element', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.pop()).toBe(3);
      expect(arr.length()).toBe(2);
      expect(arr.toArray()).toEqual([1, 2]);
    });

    it('throws error on empty array', () => {
      expect(() => arr.pop()).toThrow('Cannot pop from empty array');
    });

    it('handles single element pop', () => {
      arr.push(5);
      const popped = arr.pop();
      expect(popped).toBe(5);
      expect(arr.length()).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('handles multiple pops', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      expect(arr.pop()).toBe(4);
      expect(arr.pop()).toBe(3);
      expect(arr.pop()).toBe(2);
      expect(arr.pop()).toBe(1);
      expect(arr.length()).toBe(0);
    });
  });

  describe('length', () => {
    it('returns 0 for empty array', () => {
      expect(arr.length()).toBe(0);
    });

    it('returns correct length after pushes', () => {
      expect(arr.length()).toBe(0);
      arr.push(1);
      expect(arr.length()).toBe(1);
      arr.push(2);
      expect(arr.length()).toBe(2);
      arr.push(3);
      expect(arr.length()).toBe(3);
    });

    it('returns correct length after pops', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.pop();
      expect(arr.length()).toBe(2);
      arr.pop();
      expect(arr.length()).toBe(1);
    });

    it('returns correct length after clear', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.clear();
      expect(arr.length()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty array', () => {
      expect(arr.isEmpty()).toBe(true);
    });

    it('returns false after push', () => {
      arr.push(1);
      expect(arr.isEmpty()).toBe(false);
    });

    it('returns true after clearing', () => {
      arr.push(1);
      arr.push(2);
      arr.clear();
      expect(arr.isEmpty()).toBe(true);
    });

    it('returns false after pop from multi-element', () => {
      arr.push(1);
      arr.push(2);
      arr.pop();
      expect(arr.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('clears all elements', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.clear();
      expect(arr.length()).toBe(0);
      expect(arr.isEmpty()).toBe(true);
      expect(arr.blockSize()).toBe(1);
    });

    it('clears empty array without error', () => {
      arr.clear();
      expect(arr.length()).toBe(0);
      expect(arr.isEmpty()).toBe(true);
    });

    it('resets block size after clear', () => {
      const many = new CacheObliviousArray<number>(Array.from({ length: 50 }, (_, i) => i));
      expect(many.blockSize()).toBe(7);
      many.clear();
      expect(many.blockSize()).toBe(1);
    });

    it('allows operations after clear', () => {
      arr.push(1);
      arr.push(2);
      arr.clear();
      arr.push(3);
      arr.push(4);
      expect(arr.toArray()).toEqual([3, 4]);
    });
  });

  describe('toArray', () => {
    it('converts to array', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it('returns empty array for empty array', () => {
      expect(arr.toArray()).toEqual([]);
    });

    it('maintains order', () => {
      arr.push(5);
      arr.push(10);
      arr.push(15);
      arr.set(0, 100);
      expect(arr.toArray()).toEqual([100, 10, 15]);
    });

    it('handles large array', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i);
      values.forEach(v => arr.push(v));
      expect(arr.toArray()).toEqual(values);
    });
  });

  describe('indexOf', () => {
    it('finds index of element', () => {
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(arr.indexOf(20)).toBe(1);
    });

    it('returns -1 for non-existent element', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.indexOf(99)).toBe(-1);
    });

    it('returns -1 for empty array', () => {
      expect(arr.indexOf(5)).toBe(-1);
    });

    it('finds first occurrence', () => {
      arr.push(5);
      arr.push(10);
      arr.push(5);
      expect(arr.indexOf(5)).toBe(0);
    });

    it('finds element at index 0', () => {
      arr.push(42);
      arr.push(1);
      arr.push(2);
      expect(arr.indexOf(42)).toBe(0);
    });

    it('finds element at last index', () => {
      arr.push(1);
      arr.push(2);
      arr.push(99);
      expect(arr.indexOf(99)).toBe(2);
    });
  });

  describe('includes', () => {
    it('returns true for existing element', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.includes(2)).toBe(true);
    });

    it('returns false for non-existent element', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.includes(99)).toBe(false);
    });

    it('returns false for empty array', () => {
      expect(arr.includes(5)).toBe(false);
    });

    it('returns true for first element', () => {
      arr.push(42);
      arr.push(1);
      expect(arr.includes(42)).toBe(true);
    });

    it('returns true for last element', () => {
      arr.push(1);
      arr.push(2);
      arr.push(99);
      expect(arr.includes(99)).toBe(true);
    });
  });

  describe('slice', () => {
    beforeEach(() => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      arr.push(5);
    });

    it('returns full array with no args', () => {
      expect(arr.slice()).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns slice from start', () => {
      expect(arr.slice(2)).toEqual([3, 4, 5]);
    });

    it('returns slice from start to end', () => {
      expect(arr.slice(1, 4)).toEqual([2, 3, 4]);
    });

    it('handles negative start', () => {
      expect(arr.slice(-2)).toEqual([4, 5]);
    });

    it('handles negative end', () => {
      expect(arr.slice(0, -1)).toEqual([1, 2, 3, 4]);
    });

    it('clamps start to 0', () => {
      expect(arr.slice(-10)).toEqual([1, 2, 3, 4, 5]);
    });

    it('clamps end to size', () => {
      expect(arr.slice(0, 10)).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns empty array for invalid range', () => {
      expect(arr.slice(3, 3)).toEqual([]);
    });

    it('returns empty array when start > end', () => {
      expect(arr.slice(4, 2)).toEqual([]);
    });

    it('handles slice of single element', () => {
      expect(arr.slice(2, 3)).toEqual([3]);
    });
  });

  describe('forEach', () => {
    it('iterates over all elements', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result: number[] = [];
      arr.forEach((value, index) => {
        result.push(value);
        expect(result.length - 1).toBe(index);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('provides correct indices', () => {
      arr.push(10);
      arr.push(20);
      arr.push(30);
      const indices: number[] = [];
      arr.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('does not execute for empty array', () => {
      let called = false;
      arr.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('handles modification during iteration', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      const result: number[] = [];
      arr.forEach(value => {
        result.push(value);
        if (value === 2) {
          arr.set(3, 99);
        }
      });
      expect(result).toEqual([1, 2, 3, 99]);
    });
  });

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const result: number[] = [];
      for (const value of arr) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('works with spread operator', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect([...arr]).toEqual([1, 2, 3]);
    });

    it('works with Array.from', () => {
      arr.push(10);
      arr.push(20);
      arr.push(30);
      expect(Array.from(arr)).toEqual([10, 20, 30]);
    });

    it('does not iterate over empty array', () => {
      let count = 0;
      for (const _ of arr) {
        count++;
      }
      expect(count).toBe(0);
    });

    it('supports for-of with destructuring', () => {
      arr.push(5);
      arr.push(10);
      const values: number[] = [];
      for (const value of arr) {
        values.push(value * 2);
      }
      expect(values).toEqual([10, 20]);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      arr.push(1);
      arr.push(3);
      arr.push(5);
      arr.push(7);
      arr.push(9);
    });

    it('finds element with binary search', () => {
      expect(arr.search(v => v - 5)).toBe(2);
    });

    it('finds first element', () => {
      expect(arr.search(v => v - 1)).toBe(0);
    });

    it('finds last element', () => {
      expect(arr.search(v => v - 9)).toBe(4);
    });

    it('returns -1 for non-existent element', () => {
      expect(arr.search(v => v - 2)).toBe(-1);
    });

    it('returns -1 for empty array', () => {
      const empty = new CacheObliviousArray<number>();
      expect(empty.search(v => v - 5)).toBe(-1);
    });

    it('handles comparator for non-existent value', () => {
      expect(arr.search(v => v - 2)).toBe(-1);
    });

    it('handles less comparator', () => {
      expect(arr.search(v => v < 5 ? -1 : v > 5 ? 1 : 0)).toBe(2);
    });

    it('works with custom objects', () => {
      const objArr = new CacheObliviousArray<{ id: number }>();
      objArr.push({ id: 1 });
      objArr.push({ id: 5 });
      objArr.push({ id: 10 });
      expect(objArr.search(v => v.id - 5)).toBe(1);
    });
  });

  describe('clone', () => {
    it('creates independent copy', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const clone = arr.clone();
      expect(clone.toArray()).toEqual([1, 2, 3]);
      expect(clone.length()).toBe(3);
    });

    it('clone is independent of original', () => {
      arr.push(1);
      arr.push(2);
      const clone = arr.clone();
      clone.push(3);
      arr.push(4);
      expect(arr.toArray()).toEqual([1, 2, 4]);
      expect(clone.toArray()).toEqual([1, 2, 3]);
    });

    it('clones empty array', () => {
      const clone = arr.clone();
      expect(clone.length()).toBe(0);
      expect(clone.isEmpty()).toBe(true);
    });

    it('clone has same block size', () => {
      const original = new CacheObliviousArray<number>(Array.from({ length: 20 }, (_, i) => i));
      const clone = original.clone();
      expect(clone.blockSize()).toBe(original.blockSize());
    });
  });

  describe('fromArray', () => {
    it('creates array from array', () => {
      const result = CacheObliviousArray.fromArray([1, 2, 3]);
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.length()).toBe(3);
    });

    it('creates empty array from empty', () => {
      const result = CacheObliviousArray.fromArray([]);
      expect(result.length()).toBe(0);
      expect(result.isEmpty()).toBe(true);
    });

    it('creates array from large array', () => {
      const values = Array.from({ length: 100 }, (_, i) => i);
      const result = CacheObliviousArray.fromArray(values);
      expect(result.length()).toBe(100);
      expect(result.get(99)).toBe(99);
    });

    it('computes correct block size', () => {
      const result = CacheObliviousArray.fromArray(Array.from({ length: 25 }, (_, i) => i));
      expect(result.blockSize()).toBe(5);
    });
  });

  describe('blockSize', () => {
    it('returns 1 for empty array', () => {
      expect(arr.blockSize()).toBe(1);
    });

    it('returns 1 for single element', () => {
      arr.push(1);
      expect(arr.blockSize()).toBe(1);
    });

    it('returns computed size for multiple elements', () => {
      for (let i = 0; i < 10; i++) {
        arr.push(i);
      }
      expect(arr.blockSize()).toBe(3);
    });

    it('updates as array grows', () => {
      expect(arr.blockSize()).toBe(1);
      for (let i = 0; i < 5; i++) {
        arr.push(i);
      }
      expect(arr.blockSize()).toBe(2);
      for (let i = 0; i < 15; i++) {
        arr.push(i);
      }
      expect(arr.blockSize()).toBe(4);
    });
  });

  describe('blockCount', () => {
    it('returns 0 for empty array', () => {
      expect(arr.blockCount()).toBe(0);
    });

    it('returns 1 for single element', () => {
      arr.push(1);
      expect(arr.blockCount()).toBe(1);
    });

    it('returns correct count for multiple elements', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.push(4);
      expect(arr.blockCount()).toBe(2);
    });

    it('calculates correctly with block size', () => {
      const ten = new CacheObliviousArray<number>(Array.from({ length: 10 }, (_, i) => i));
      expect(ten.blockSize()).toBe(3);
      expect(ten.blockCount()).toBe(4);
    });
  });

  describe('mixed operations', () => {
    it('handles push, set, pop sequence', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      arr.set(1, 99);
      const popped = arr.pop();
      expect(popped).toBe(3);
      expect(arr.toArray()).toEqual([1, 99]);
    });

    it('handles get, set, push, pop sequence', () => {
      arr.push(10);
      arr.push(20);
      expect(arr.get(0)).toBe(10);
      arr.set(0, 100);
      arr.push(30);
      arr.pop();
      expect(arr.toArray()).toEqual([100, 20]);
    });

    it('handles clear and refill', () => {
      arr.push(1);
      arr.push(2);
      arr.clear();
      arr.push(3);
      arr.push(4);
      arr.push(5);
      expect(arr.toArray()).toEqual([3, 4, 5]);
    });

    it('handles iteration with modifications', () => {
      arr.push(1);
      arr.push(2);
      arr.push(3);
      const doubled: number[] = [];
      arr.forEach(v => {
        doubled.push(v * 2);
      });
      expect(doubled).toEqual([2, 4, 6]);
    });
  });

  describe('edge cases', () => {
    it('handles string elements', () => {
      const strArr = new CacheObliviousArray<string>();
      strArr.push('hello');
      strArr.push('world');
      expect(strArr.get(0)).toBe('hello');
      expect(strArr.includes('world')).toBe(true);
      expect(strArr.indexOf('hello')).toBe(0);
    });

    it('handles object elements', () => {
      const objArr = new CacheObliviousArray<{ id: number }>();
      objArr.push({ id: 1 });
      objArr.push({ id: 2 });
      expect(objArr.get(0)).toEqual({ id: 1 });
      expect(objArr.get(1)).toEqual({ id: 2 });
    });

    it('handles null and undefined elements', () => {
      arr.push(null);
      arr.push(undefined);
      arr.push(0);
      expect(arr.get(0)).toBe(null);
      expect(arr.get(1)).toBe(undefined);
      expect(arr.get(2)).toBe(0);
    });

    it('handles many elements', () => {
      for (let i = 0; i < 1000; i++) {
        arr.push(i);
      }
      expect(arr.length()).toBe(1000);
      expect(arr.get(999)).toBe(999);
      expect(arr.indexOf(500)).toBe(500);
    });

    it('handles rapid push/pop cycles', () => {
      arr.push(1);
      arr.pop();
      arr.push(2);
      arr.pop();
      arr.push(3);
      arr.pop();
      expect(arr.length()).toBe(0);
    });
  });
});
