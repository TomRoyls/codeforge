import { describe, it, expect } from 'vitest';
import { SparseArray3 } from '../../src/core/sparse-array-3/index.js';

// ─── Constructor ───

describe('SparseArray3', () => {
  describe('constructor', () => {
    it('creates an array with default length 0', () => {
      const arr = new SparseArray3();
      expect(arr.length).toBe(0);
    });

    it('creates an array with specified length', () => {
      const arr = new SparseArray3(10);
      expect(arr.length).toBe(10);
    });

    it('clamps negative length to 0', () => {
      const arr = new SparseArray3(-5);
      expect(arr.length).toBe(0);
    });

    it('creates an empty sparse array with length 0', () => {
      const arr = new SparseArray3(0);
      expect(arr.length).toBe(0);
      expect(arr.filled()).toBe(0);
    });
  });

  // ─── get / set ───

  describe('get and set', () => {
    it('returns undefined for unset indices', () => {
      const arr = new SparseArray3(5);
      expect(arr.get(0)).toBeUndefined();
      expect(arr.get(4)).toBeUndefined();
    });

    it('returns undefined for out-of-bounds indices', () => {
      const arr = new SparseArray3(3);
      expect(arr.get(-1)).toBeUndefined();
      expect(arr.get(3)).toBeUndefined();
      expect(arr.get(100)).toBeUndefined();
    });

    it('sets and gets values at valid indices', () => {
      const arr = new SparseArray3(5);
      arr.set(2, 'hello');
      expect(arr.get(2)).toBe('hello');
    });

    it('extends length when setting beyond current length', () => {
      const arr = new SparseArray3(3);
      arr.set(10, 'far');
      expect(arr.length).toBe(11);
      expect(arr.get(10)).toBe('far');
    });

    it('overwrites existing values', () => {
      const arr = new SparseArray3(5);
      arr.set(1, 'a');
      arr.set(1, 'b');
      expect(arr.get(1)).toBe('b');
    });

    it('throws RangeError for negative index on set', () => {
      const arr = new SparseArray3(5);
      expect(() => arr.set(-1, 'x')).toThrow(RangeError);
      expect(() => arr.set(-1, 'x')).toThrow('Index cannot be negative');
    });

    it('handles index 0 correctly', () => {
      const arr = new SparseArray3(1);
      arr.set(0, 'first');
      expect(arr.get(0)).toBe('first');
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('deletes an existing value', () => {
      const arr = new SparseArray3(5);
      arr.set(2, 'val');
      expect(arr.delete(2)).toBe(true);
      expect(arr.get(2)).toBeUndefined();
    });

    it('returns false for non-existent index', () => {
      const arr = new SparseArray3(5);
      expect(arr.delete(2)).toBe(false);
    });

    it('returns false for negative index', () => {
      const arr = new SparseArray3(5);
      expect(arr.delete(-1)).toBe(false);
    });

    it('returns false for out-of-bounds index', () => {
      const arr = new SparseArray3(5);
      expect(arr.delete(5)).toBe(false);
      expect(arr.delete(100)).toBe(false);
    });

    it('does not change length after delete', () => {
      const arr = new SparseArray3(5);
      arr.set(4, 'val');
      arr.delete(4);
      expect(arr.length).toBe(5);
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns true for set index', () => {
      const arr = new SparseArray3(5);
      arr.set(2, 'val');
      expect(arr.has(2)).toBe(true);
    });

    it('returns false for unset index', () => {
      const arr = new SparseArray3(5);
      expect(arr.has(2)).toBe(false);
    });

    it('returns false for negative index', () => {
      const arr = new SparseArray3(5);
      expect(arr.has(-1)).toBe(false);
    });

    it('returns false for out-of-bounds index', () => {
      const arr = new SparseArray3(5);
      expect(arr.has(5)).toBe(false);
    });

    it('returns false after delete', () => {
      const arr = new SparseArray3(5);
      arr.set(2, 'val');
      arr.delete(2);
      expect(arr.has(2)).toBe(false);
    });
  });

  // ─── push / pop ───

  describe('push', () => {
    it('appends a value and returns new index', () => {
      const arr = new SparseArray3(0);
      expect(arr.push('a')).toBe(0);
      expect(arr.push('b')).toBe(1);
      expect(arr.get(0)).toBe('a');
      expect(arr.get(1)).toBe('b');
      expect(arr.length).toBe(2);
    });

    it('pushes onto array with existing length', () => {
      const arr = new SparseArray3(3);
      expect(arr.push('x')).toBe(3);
      expect(arr.length).toBe(4);
    });
  });

  describe('pop', () => {
    it('pops the last filled value', () => {
      const arr = new SparseArray3(0);
      arr.push('a');
      arr.push('b');
      expect(arr.pop()).toBe('b');
      expect(arr.pop()).toBe('a');
      expect(arr.length).toBe(0);
    });

    it('returns undefined for empty array', () => {
      const arr = new SparseArray3(0);
      expect(arr.pop()).toBeUndefined();
    });

    it('skips gaps when popping', () => {
      const arr = new SparseArray3(5);
      arr.set(0, 'a');
      arr.set(4, 'b');
      expect(arr.pop()).toBe('b');
      expect(arr.length).toBe(4);
    });

    it('returns undefined when all slots are empty', () => {
      const arr = new SparseArray3(5);
      expect(arr.pop()).toBeUndefined();
      expect(arr.length).toBe(0);
    });
  });

  // ─── setLength ───

  describe('setLength', () => {
    it('truncates the array and removes entries beyond new length', () => {
      const arr = new SparseArray3(10);
      arr.set(5, 'keep');
      arr.set(8, 'remove');
      arr.setLength(6);
      expect(arr.length).toBe(6);
      expect(arr.get(5)).toBe('keep');
      expect(arr.get(8)).toBeUndefined();
    });

    it('throws RangeError for negative length', () => {
      const arr = new SparseArray3(5);
      expect(() => arr.setLength(-1)).toThrow(RangeError);
      expect(() => arr.setLength(-1)).toThrow('Length cannot be negative');
    });

    it('can expand the array length', () => {
      const arr = new SparseArray3(5);
      arr.setLength(10);
      expect(arr.length).toBe(10);
    });

    it('setLength(0) clears all data', () => {
      const arr = new SparseArray3(5);
      arr.set(2, 'val');
      arr.setLength(0);
      expect(arr.length).toBe(0);
      expect(arr.filled()).toBe(0);
    });
  });

  // ─── filled / filledIndices ───

  describe('filled', () => {
    it('returns 0 for empty array', () => {
      const arr = new SparseArray3(5);
      expect(arr.filled()).toBe(0);
    });

    it('returns count of filled slots', () => {
      const arr = new SparseArray3(10);
      arr.set(1, 'a');
      arr.set(5, 'b');
      arr.set(9, 'c');
      expect(arr.filled()).toBe(3);
    });
  });

  describe('filledIndices', () => {
    it('returns empty array for no filled slots', () => {
      const arr = new SparseArray3(5);
      expect(arr.filledIndices()).toEqual([]);
    });

    it('returns sorted filled indices', () => {
      const arr = new SparseArray3(10);
      arr.set(5, 'b');
      arr.set(1, 'a');
      arr.set(9, 'c');
      expect(arr.filledIndices()).toEqual([1, 5, 9]);
    });
  });

  // ─── toArray / compact ───

  describe('toArray', () => {
    it('returns array of correct length with undefined gaps', () => {
      const arr = new SparseArray3(5);
      arr.set(1, 'a');
      arr.set(3, 'b');
      const result = arr.toArray();
      expect(result).toEqual([undefined, 'a', undefined, 'b', undefined]);
      expect(result.length).toBe(5);
    });

    it('returns empty array for length 0', () => {
      const arr = new SparseArray3(0);
      expect(arr.toArray()).toEqual([]);
    });
  });

  describe('compact', () => {
    it('returns only defined values in order', () => {
      const arr = new SparseArray3(5);
      arr.set(1, 'a');
      arr.set(3, 'b');
      expect(arr.compact()).toEqual(['a', 'b']);
    });

    it('returns empty array for no filled slots', () => {
      const arr = new SparseArray3(5);
      expect(arr.compact()).toEqual([]);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates over all filled entries', () => {
      const arr = new SparseArray3(5);
      arr.set(1, 'a');
      arr.set(3, 'b');
      const collected: Array<{ value: string; index: number }> = [];
      arr.forEach((value, index) => collected.push({ value, index }));
      expect(collected).toEqual([
        { value: 'a', index: 1 },
        { value: 'b', index: 3 },
      ]);
    });

    it('does not call callback for empty array', () => {
      const arr = new SparseArray3(5);
      let calls = 0;
      arr.forEach(() => calls++);
      expect(calls).toBe(0);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('removes all entries and resets length', () => {
      const arr = new SparseArray3(10);
      arr.set(1, 'a');
      arr.set(5, 'b');
      arr.clear();
      expect(arr.length).toBe(0);
      expect(arr.filled()).toBe(0);
      expect(arr.toArray()).toEqual([]);
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles single element operations', () => {
      const arr = new SparseArray3(1);
      arr.set(0, 'only');
      expect(arr.get(0)).toBe('only');
      expect(arr.has(0)).toBe(true);
      expect(arr.filled()).toBe(1);
      arr.delete(0);
      expect(arr.filled()).toBe(0);
    });

    it('handles duplicate set to same index', () => {
      const arr = new SparseArray3(5);
      arr.set(2, 'first');
      arr.set(2, 'second');
      expect(arr.filled()).toBe(1);
      expect(arr.get(2)).toBe('second');
    });

    it('handles numeric values including negatives', () => {
      const arr = new SparseArray3<number>(5);
      arr.set(0, -10);
      arr.set(1, 0);
      arr.set(2, 42);
      expect(arr.compact()).toEqual([-10, 0, 42]);
    });

    it('handles large index gap', () => {
      const arr = new SparseArray3(0);
      arr.set(0, 'start');
      arr.set(1000, 'end');
      expect(arr.length).toBe(1001);
      expect(arr.filled()).toBe(2);
      expect(arr.get(500)).toBeUndefined();
    });

    it('push and pop interleaved', () => {
      const arr = new SparseArray3<number>(0);
      arr.push(1);
      arr.push(2);
      arr.push(3);
      expect(arr.pop()).toBe(3);
      arr.push(4);
      expect(arr.pop()).toBe(4);
      expect(arr.pop()).toBe(2);
      expect(arr.pop()).toBe(1);
      expect(arr.pop()).toBeUndefined();
    });
  });
});
