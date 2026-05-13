import { describe, it, expect } from 'vitest';
import { BeapSet2 } from '../src/core/beap-set-2/index.js';

describe('BeapSet2', () => {
  describe('constructor', () => {
    it('should create empty set with default comparator', async () => {
      const set = new BeapSet2<number>();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('should create empty set with custom comparator', async () => {
      const set = new BeapSet2<number>((a, b) => b - a);
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('add', () => {
    it('should add single element', async () => {
      const set = new BeapSet2<number>();
      expect(set.add(5)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.isEmpty()).toBe(false);
    });

    it('should return false for duplicate', async () => {
      const set = new BeapSet2<number>();
      expect(set.add(5)).toBe(true);
      expect(set.add(5)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should add multiple elements', async () => {
      const set = new BeapSet2<number>();
      expect(set.add(5)).toBe(true);
      expect(set.add(3)).toBe(true);
      expect(set.add(8)).toBe(true);
      expect(set.size).toBe(3);
    });

    it('should maintain min after multiple adds', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.add(1);
      set.add(6);
      expect(set.min()).toBe(1);
    });

    it('should add in descending order', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(4);
      set.add(3);
      set.add(2);
      set.add(1);
      expect(set.min()).toBe(1);
    });

    it('should add in ascending order', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.add(4);
      set.add(5);
      expect(set.min()).toBe(1);
    });

    it('should add with custom comparator (max-heap)', async () => {
      const set = new BeapSet2<number>((a, b) => b - a);
      set.add(1);
      set.add(5);
      set.add(3);
      expect(set.min()).toBe(5);
    });
  });

  describe('has', () => {
    it('should return false for empty set', async () => {
      const set = new BeapSet2<number>();
      expect(set.has(5)).toBe(false);
    });

    it('should return true for existing element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      expect(set.has(5)).toBe(true);
    });

    it('should return false for non-existing element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      expect(set.has(7)).toBe(false);
    });

    it('should return false for duplicate after add', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(5);
      expect(set.has(5)).toBe(true);
      expect(set.size).toBe(1);
    });

    it('should return true after delete for other elements', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.delete(3);
      expect(set.has(5)).toBe(true);
      expect(set.has(3)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return false for non-existing element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      expect(set.delete(10)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should delete single element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      expect(set.delete(5)).toBe(true);
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('should delete from middle', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      expect(set.delete(5)).toBe(true);
      expect(set.size).toBe(2);
      expect(set.has(5)).toBe(false);
      expect(set.has(3)).toBe(true);
      expect(set.has(8)).toBe(true);
    });

    it('should delete min element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.delete(3);
      expect(set.min()).toBe(5);
    });

    it('should delete max element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.delete(8);
      expect(set.max()).toBe(5);
    });

    it('should maintain heap property after deletion', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.add(1);
      set.delete(3);
      expect(set.min()).toBe(1);
    });
  });

  describe('size', () => {
    it('should return 0 for empty set', async () => {
      const set = new BeapSet2<number>();
      expect(set.size).toBe(0);
    });

    it('should increment after add', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      expect(set.size).toBe(1);
      set.add(2);
      expect(set.size).toBe(2);
      set.add(3);
      expect(set.size).toBe(3);
    });

    it('should not increment for duplicate', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(1);
      expect(set.size).toBe(1);
    });

    it('should decrement after delete', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty set', async () => {
      const set = new BeapSet2<number>();
      expect(set.isEmpty()).toBe(true);
    });

    it('should return false after add', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      expect(set.isEmpty()).toBe(false);
    });

    it('should return true after deleting all elements', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      set.delete(1);
      set.delete(2);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('should handle clear on empty set', async () => {
      const set = new BeapSet2<number>();
      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('should allow operations after clear', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      set.clear();
      set.add(3);
      expect(set.size).toBe(1);
      expect(set.min()).toBe(3);
    });
  });

  describe('min', () => {
    it('should return undefined from empty set', async () => {
      const set = new BeapSet2<number>();
      expect(set.min()).toBe(undefined);
    });

    it('should return minimum value', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      expect(set.min()).toBe(3);
    });

    it('should return correct minimum after operations', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.add(1);
      expect(set.min()).toBe(1);
      set.delete(1);
      expect(set.min()).toBe(3);
    });

    it('should return minimum after deleting middle element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.add(1);
      set.delete(5);
      expect(set.min()).toBe(1);
    });
  });

  describe('max', () => {
    it('should return undefined from empty set', async () => {
      const set = new BeapSet2<number>();
      expect(set.max()).toBe(undefined);
    });

    it('should return maximum value', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      expect(set.max()).toBe(8);
    });

    it('should return correct maximum after operations', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      expect(set.max()).toBe(8);
      set.delete(8);
      expect(set.max()).toBe(5);
    });

    it('should return maximum after deleting middle element', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.add(1);
      set.delete(5);
      expect(set.max()).toBe(8);
    });
  });

  describe('forEach', () => {
    it('should not call callback on empty set', async () => {
      const set = new BeapSet2<number>();
      let called = false;
      set.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it('should iterate all elements in sorted order', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      const values: number[] = [];
      set.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([3, 5, 8]);
    });

    it('should iterate single element', async () => {
      const set = new BeapSet2<number>();
      set.add(42);
      const values: number[] = [];
      set.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([42]);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty set', async () => {
      const set = new BeapSet2<number>();
      expect(set.toArray()).toEqual([]);
    });

    it('should return sorted array', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      const arr = set.toArray();
      expect(arr).toEqual([3, 5, 8]);
    });

    it('should return independent copy', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      const arr = set.toArray();
      arr.push(999);
      expect(set.size).toBe(2);
      expect(set.toArray()).toEqual([1, 2]);
    });

    it('should not modify set when array is modified', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      const arr = set.toArray();
      arr[0] = 999;
      expect(set.min()).toBe(1);
    });

    it('should return sorted array with many elements', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(8);
      set.add(1);
      set.add(6);
      set.add(4);
      const arr = set.toArray();
      expect(arr).toEqual([1, 3, 4, 5, 6, 8]);
    });
  });

  describe('edge cases', () => {
    it('should handle single element operations', async () => {
      const set = new BeapSet2<number>();
      set.add(42);
      expect(set.min()).toBe(42);
      expect(set.max()).toBe(42);
      expect(set.has(42)).toBe(true);
      expect(set.delete(42)).toBe(true);
      expect(set.isEmpty()).toBe(true);
    });

    it('should handle negative numbers', async () => {
      const set = new BeapSet2<number>();
      set.add(-5);
      set.add(-3);
      set.add(-8);
      expect(set.min()).toBe(-8);
      expect(set.max()).toBe(-3);
    });

    it('should handle zero', async () => {
      const set = new BeapSet2<number>();
      set.add(0);
      set.add(-1);
      set.add(1);
      expect(set.min()).toBe(-1);
      expect(set.max()).toBe(1);
    });

    it('should handle large numbers', async () => {
      const set = new BeapSet2<number>();
      set.add(Number.MAX_SAFE_INTEGER);
      set.add(Number.MIN_SAFE_INTEGER);
      set.add(0);
      expect(set.min()).toBe(Number.MIN_SAFE_INTEGER);
      expect(set.max()).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('duplicate handling', () => {
    it('should not add duplicate values', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      expect(set.add(5)).toBe(false);
      expect(set.add(5)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should handle multiple duplicate attempts', async () => {
      const set = new BeapSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.add(2)).toBe(false);
      expect(set.add(3)).toBe(false);
      expect(set.add(1)).toBe(false);
      expect(set.size).toBe(3);
    });

    it('should return correct array without duplicates', async () => {
      const set = new BeapSet2<number>();
      set.add(5);
      set.add(3);
      set.add(5);
      set.add(8);
      set.add(3);
      const arr = set.toArray();
      expect(arr).toEqual([3, 5, 8]);
    });
  });

  describe('large datasets', () => {
    it('should handle 200 elements', async () => {
      const set = new BeapSet2<number>();
      const values: number[] = [];
      for (let i = 0; i < 200; i++) {
        values.push(Math.floor(Math.random() * 10000));
      }
      values.forEach(v => set.add(v));
      expect(set.size).toBeLessThanOrEqual(200);

      const arr = set.toArray();
      expect(arr.length).toBe(set.size);

      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]! <= arr[i + 1]!).toBe(true);
      }
    });

    it('should handle sorted insert', async () => {
      const set = new BeapSet2<number>();
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      expect(set.size).toBe(100);
      expect(set.min()).toBe(0);
      expect(set.max()).toBe(99);
    });

    it('should handle reverse sorted insert', async () => {
      const set = new BeapSet2<number>();
      for (let i = 99; i >= 0; i--) {
        set.add(i);
      }
      expect(set.size).toBe(100);
      expect(set.min()).toBe(0);
      expect(set.max()).toBe(99);
    });
  });

  describe('string type', () => {
    it('should work with strings and default comparator', async () => {
      const set = new BeapSet2<string>();
      set.add('zebra');
      set.add('apple');
      set.add('banana');
      expect(set.min()).toBe('apple');
      expect(set.max()).toBe('zebra');
    });

    it('should handle duplicate strings', async () => {
      const set = new BeapSet2<string>();
      expect(set.add('apple')).toBe(true);
      expect(set.add('apple')).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should return sorted strings', async () => {
      const set = new BeapSet2<string>();
      set.add('zebra');
      set.add('apple');
      set.add('banana');
      set.add('cherry');
      const arr = set.toArray();
      expect(arr).toEqual(['apple', 'banana', 'cherry', 'zebra']);
    });
  });

  describe('object type with custom comparator', () => {
    it('should work with objects', async () => {
      interface Item {
        value: string;
        priority: number;
      }
      const comparator = (a: Item, b: Item) => a.priority - b.priority;
      const set = new BeapSet2<Item>(comparator);

      set.add({ value: 'first', priority: 5 });
      set.add({ value: 'second', priority: 3 });
      set.add({ value: 'third', priority: 8 });

      expect(set.min()!.value).toBe('second');
      expect(set.max()!.value).toBe('third');
    });

    it('should handle object duplicates', async () => {
      interface Item {
        id: number;
        value: string;
      }
      const comparator = (a: Item, b: Item) => a.id - b.id;
      const set = new BeapSet2<Item>(comparator);

      const item = { id: 1, value: 'test' };
      expect(set.add(item)).toBe(true);
      expect(set.add(item)).toBe(false);
      expect(set.size).toBe(1);
    });
  });
});
