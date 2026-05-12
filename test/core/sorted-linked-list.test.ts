import { describe, it, expect } from 'vitest';
import { SortedLinkedList } from '../../src/core/sorted-linked-list/index.js';

describe('SortedLinkedList', () => {
  describe('insert', () => {
    it('should insert into empty list', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      expect(list.size).toBe(1);
      expect(list.toArray()).toEqual([5]);
    });

    it('should maintain sorted order', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle duplicate values', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(2);
      list.insert(1);
      expect(list.toArray()).toEqual([1, 2, 2]);
    });

    it('should insert at beginning when smallest', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(3);
      list.insert(1);
      expect(list.toArray()).toEqual([1, 3, 5]);
    });

    it('should insert at end when largest', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      expect(list.toArray()).toEqual([1, 3, 5]);
    });

    it('should insert negative numbers', () => {
      const list = new SortedLinkedList<number>();
      list.insert(-3);
      list.insert(0);
      list.insert(-1);
      expect(list.toArray()).toEqual([-3, -1, 0]);
    });

    it('should handle large batch inserts in order', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(i);
      }
      expect(list.size).toBe(100);
      const arr = list.toArray();
      for (let i = 0; i < 99; i++) {
        expect(arr[i]! <= arr[i + 1]!).toBe(true);
      }
    });

    it('should handle large batch inserts in reverse order', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 99; i >= 0; i--) {
        list.insert(i);
      }
      expect(list.size).toBe(100);
      expect(list.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });

    it('should handle random insertions', () => {
      const list = new SortedLinkedList<number>();
      const values = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0];
      for (const v of values) {
        list.insert(v);
      }
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should insert many duplicates', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(5);
      }
      expect(list.size).toBe(50);
      expect(list.toArray()).toEqual(Array(50).fill(5));
    });
  });

  describe('delete', () => {
    it('should delete from single element list', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      expect(list.delete(5)).toBe(true);
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('should delete from beginning', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      expect(list.delete(1)).toBe(true);
      expect(list.toArray()).toEqual([2, 3]);
    });

    it('should delete from middle', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      expect(list.delete(2)).toBe(true);
      expect(list.toArray()).toEqual([1, 3]);
    });

    it('should delete from end', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      expect(list.delete(3)).toBe(true);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should return false for non-existent value', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      expect(list.delete(5)).toBe(false);
      expect(list.size).toBe(2);
    });

    it('should return false for empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.delete(1)).toBe(false);
    });

    it('should delete first occurrence of duplicate', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(1);
      list.insert(2);
      expect(list.delete(2)).toBe(true);
      expect(list.size).toBe(2);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should delete all duplicates sequentially', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(2);
      list.insert(2);
      expect(list.delete(2)).toBe(true);
      expect(list.delete(2)).toBe(true);
      expect(list.delete(2)).toBe(true);
      expect(list.size).toBe(0);
    });

    it('should handle delete after many operations', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(i);
      }
      expect(list.delete(50)).toBe(true);
      expect(list.size).toBe(99);
      expect(list.has(50)).toBe(false);
    });
  });

  describe('has', () => {
    it('should return false for empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.has(1)).toBe(false);
    });

    it('should return true for existing element', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      expect(list.has(5)).toBe(true);
    });

    it('should return false for non-existent element', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      expect(list.has(3)).toBe(false);
    });

    it('should find after insert', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.has(2)).toBe(true);
    });

    it('should not find after delete', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      list.delete(2);
      expect(list.has(2)).toBe(false);
      expect(list.has(1)).toBe(true);
      expect(list.has(3)).toBe(true);
    });

    it('should handle duplicate values', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(5);
      expect(list.has(5)).toBe(true);
    });
  });

  describe('get', () => {
    it('should return element at valid index', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.get(0)).toBe(1);
      expect(list.get(1)).toBe(2);
      expect(list.get(2)).toBe(3);
    });

    it('should return undefined for negative index', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      expect(list.get(-1)).toBeUndefined();
    });

    it('should return undefined for out of bounds', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      expect(list.get(1)).toBeUndefined();
      expect(list.get(10)).toBeUndefined();
    });

    it('should return undefined on empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.get(0)).toBeUndefined();
    });

    it('should work with large lists', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(i);
      }
      expect(list.get(0)).toBe(0);
      expect(list.get(50)).toBe(50);
      expect(list.get(99)).toBe(99);
      expect(list.get(100)).toBeUndefined();
    });
  });

  describe('size', () => {
    it('should be 0 for new list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.size).toBe(0);
    });

    it('should increment on insert', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      expect(list.size).toBe(1);
      list.insert(2);
      expect(list.size).toBe(2);
      list.insert(3);
      expect(list.size).toBe(3);
    });

    it('should decrement on delete', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      list.delete(2);
      expect(list.size).toBe(2);
      list.delete(1);
      expect(list.size).toBe(1);
    });

    it('should remain unchanged on failed delete', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.delete(5);
      expect(list.size).toBe(1);
    });

    it('should be correct after clear', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.clear();
      expect(list.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should be true for new list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.isEmpty).toBe(true);
    });

    it('should be false after insert', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      expect(list.isEmpty).toBe(false);
    });

    it('should be true after removing all elements', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.delete(1);
      expect(list.isEmpty).toBe(true);
    });

    it('should be true after clear', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.clear();
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should empty the list', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('should work on empty list', () => {
      const list = new SortedLinkedList<number>();
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('should allow inserts after clear', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.clear();
      list.insert(2);
      expect(list.size).toBe(1);
      expect(list.toArray()).toEqual([2]);
    });

    it('should work after many operations', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(i);
      }
      list.clear();
      expect(list.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('should include duplicates', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(1);
      list.insert(2);
      expect(list.toArray()).toEqual([1, 2, 2]);
    });

    it('should work with single element', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      expect(list.toArray()).toEqual([5]);
    });

    it('should return independent copy', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      const arr = list.toArray();
      arr.push(3);
      expect(list.size).toBe(2);
      expect(list.toArray()).toEqual([1, 2]);
    });
  });

  describe('forEach', () => {
    it('should iterate all elements', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      const values: number[] = [];
      list.forEach(v => values.push(v));
      expect(values).toEqual([1, 2, 3]);
    });

    it('should pass index to callback', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      const indices: number[] = [];
      list.forEach((_v, i) => indices.push(i));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not iterate empty list', () => {
      const list = new SortedLinkedList<number>();
      let count = 0;
      list.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should iterate in sorted order', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(2);
      list.insert(8);
      list.insert(1);
      const values: number[] = [];
      list.forEach(v => values.push(v));
      expect(values).toEqual([1, 2, 5, 8]);
    });

    it('should work with duplicates', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(2);
      list.insert(1);
      const values: number[] = [];
      list.forEach(v => values.push(v));
      expect(values).toEqual([1, 2, 2]);
    });
  });

  describe('min', () => {
    it('should return undefined for empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.min()).toBeUndefined();
    });

    it('should return minimum value', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(1);
      list.insert(3);
      expect(list.min()).toBe(1);
    });

    it('should return first element (smallest)', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.min()).toBe(list.get(0));
    });

    it('should work with negative numbers', () => {
      const list = new SortedLinkedList<number>();
      list.insert(0);
      list.insert(-5);
      list.insert(-1);
      expect(list.min()).toBe(-5);
    });

    it('should work with single element', () => {
      const list = new SortedLinkedList<number>();
      list.insert(42);
      expect(list.min()).toBe(42);
    });
  });

  describe('max', () => {
    it('should return undefined for empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.max()).toBeUndefined();
    });

    it('should return maximum value', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(1);
      list.insert(3);
      expect(list.max()).toBe(5);
    });

    it('should return last element (largest)', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.max()).toBe(list.get(2));
    });

    it('should work with negative numbers', () => {
      const list = new SortedLinkedList<number>();
      list.insert(-10);
      list.insert(-5);
      list.insert(-8);
      expect(list.max()).toBe(-5);
    });

    it('should work with single element', () => {
      const list = new SortedLinkedList<number>();
      list.insert(42);
      expect(list.max()).toBe(42);
    });
  });

  describe('indexOf', () => {
    it('should return correct index', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.indexOf(1)).toBe(0);
      expect(list.indexOf(2)).toBe(1);
      expect(list.indexOf(3)).toBe(2);
    });

    it('should return -1 for non-existent', () => {
      const list = new SortedLinkedList<number>();
      list.insert(1);
      list.insert(2);
      expect(list.indexOf(5)).toBe(-1);
    });

    it('should return -1 for empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.indexOf(1)).toBe(-1);
    });

    it('should return first index of duplicate', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(1);
      list.insert(2);
      expect(list.indexOf(2)).toBe(1);
    });

    it('should work after insert and delete', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(1);
      list.insert(3);
      list.delete(3);
      expect(list.indexOf(1)).toBe(0);
      expect(list.indexOf(5)).toBe(1);
      expect(list.indexOf(3)).toBe(-1);
    });
  });

  describe('range', () => {
    it('should return all elements when no bounds', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect(list.range()).toEqual([1, 2, 3]);
    });

    it('should filter by min', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(2);
      list.insert(8);
      list.insert(1);
      expect(list.range(3)).toEqual([5, 8]);
    });

    it('should filter by max', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(2);
      list.insert(8);
      list.insert(1);
      expect(list.range(undefined, 5)).toEqual([1, 2, 5]);
    });

    it('should filter by both min and max', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(2);
      list.insert(8);
      list.insert(1);
      expect(list.range(2, 5)).toEqual([2, 5]);
    });

    it('should return empty when min > max', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(1);
      expect(list.range(10, 20)).toEqual([]);
    });

    it('should return empty for empty list', () => {
      const list = new SortedLinkedList<number>();
      expect(list.range()).toEqual([]);
    });

    it('should handle duplicates in range', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(2);
      list.insert(3);
      list.insert(1);
      expect(list.range(2, 3)).toEqual([2, 2, 3]);
    });

    it('should work with large lists', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(i);
      }
      expect(list.range(10, 20)).toEqual(Array.from({ length: 11 }, (_, i) => 10 + i));
    });

    it('should work with exact boundaries', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(10);
      list.insert(15);
      expect(list.range(10, 10)).toEqual([10]);
      expect(list.range(5, 15)).toEqual([5, 10, 15]);
    });
  });

  describe('iterator', () => {
    it('should iterate with for-of', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      const values: number[] = [];
      for (const v of list) {
        values.push(v);
      }
      expect(values).toEqual([1, 2, 3]);
    });

    it('should iterate with spread', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3);
      list.insert(1);
      list.insert(2);
      expect([...list]).toEqual([1, 2, 3]);
    });

    it('should iterate empty list', () => {
      const list = new SortedLinkedList<number>();
      expect([...list]).toEqual([]);
    });

    it('should work with iterator() method', () => {
      const list = new SortedLinkedList<number>();
      list.insert(2);
      list.insert(1);
      const values: number[] = [];
      const it = list.iterator();
      let result = it.next();
      while (!result.done) {
        values.push(result.value);
        result = it.next();
      }
      expect(values).toEqual([1, 2]);
    });

    it('should iterate in sorted order', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(2);
      list.insert(8);
      list.insert(1);
      expect([...list]).toEqual([1, 2, 5, 8]);
    });
  });

  describe('custom comparator', () => {
    it('should sort strings by default', () => {
      const list = new SortedLinkedList<string>();
      list.insert('cherry');
      list.insert('apple');
      list.insert('banana');
      expect(list.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should sort in reverse order', () => {
      const list = new SortedLinkedList<number>({
        comparator: (a, b) => b - a,
      });
      list.insert(1);
      list.insert(3);
      list.insert(2);
      expect(list.toArray()).toEqual([3, 2, 1]);
      expect(list.min()).toBe(3);
      expect(list.max()).toBe(1);
    });

    it('should sort objects by property', () => {
      interface Person {
        name: string;
        age: number;
      }
      const list = new SortedLinkedList<Person>({
        comparator: (a, b) => a.age - b.age,
      });
      list.insert({ name: 'Alice', age: 30 });
      list.insert({ name: 'Bob', age: 20 });
      list.insert({ name: 'Charlie', age: 25 });
      const result = list.toArray();
      expect(result[0]!.name).toBe('Bob');
      expect(result[1]!.name).toBe('Charlie');
      expect(result[2]!.name).toBe('Alice');
    });

    it('should work with case-insensitive string comparator', () => {
      const list = new SortedLinkedList<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      });
      list.insert('Apple');
      list.insert('banana');
      list.insert('Cherry');
      expect(list.toArray()).toEqual(['Apple', 'banana', 'Cherry']);
    });

    it('should work with custom complex comparator', () => {
      interface Item {
        priority: number;
        value: string;
      }
      const list = new SortedLinkedList<Item>({
        comparator: (a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return a.value.localeCompare(b.value);
        },
      });
      list.insert({ priority: 2, value: 'b' });
      list.insert({ priority: 1, value: 'b' });
      list.insert({ priority: 1, value: 'a' });
      list.insert({ priority: 3, value: 'c' });
      const result = list.toArray();
      expect(result[0]!.value).toBe('a');
      expect(result[1]!.value).toBe('b');
      expect(result[2]!.value).toBe('b');
      expect(result[3]!.value).toBe('c');
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      const list = new SortedLinkedList<number>();
      list.insert(42);
      expect(list.size).toBe(1);
      expect(list.isEmpty).toBe(false);
      expect(list.get(0)).toBe(42);
      expect(list.min()).toBe(42);
      expect(list.max()).toBe(42);
      expect(list.indexOf(42)).toBe(0);
      expect(list.has(42)).toBe(true);
      expect(list.delete(42)).toBe(true);
      expect(list.isEmpty).toBe(true);
    });

    it('should handle alternating insert and delete', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 10; i++) {
        list.insert(i);
        list.delete(i);
      }
      expect(list.isEmpty).toBe(true);
    });

    it('should handle many operations on single value', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(5);
        if (i % 2 === 0) {
          list.delete(5);
        }
      }
      expect(list.size).toBe(50);
    });

    it('should maintain order after complex operations', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(2);
      list.insert(8);
      list.delete(5);
      list.insert(3);
      list.insert(1);
      list.delete(8);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('should work with very large values', () => {
      const list = new SortedLinkedList<number>();
      list.insert(Number.MAX_SAFE_INTEGER);
      list.insert(Number.MIN_SAFE_INTEGER);
      expect(list.min()).toBe(Number.MIN_SAFE_INTEGER);
      expect(list.max()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle floating point numbers', () => {
      const list = new SortedLinkedList<number>();
      list.insert(3.14);
      list.insert(1.5);
      list.insert(2.7);
      expect(list.toArray()).toEqual([1.5, 2.7, 3.14]);
    });
  });

  describe('integration', () => {
    it('should handle complete workflow', () => {
      const list = new SortedLinkedList<number>();
      list.insert(5);
      list.insert(2);
      list.insert(8);
      list.insert(1);
      list.insert(3);

      expect(list.size).toBe(5);
      expect(list.toArray()).toEqual([1, 2, 3, 5, 8]);
      expect(list.has(3)).toBe(true);
      expect(list.has(4)).toBe(false);
      expect(list.indexOf(5)).toBe(3);
      expect(list.get(2)).toBe(3);
      expect(list.range(2, 6)).toEqual([2, 3, 5]);
      expect(list.min()).toBe(1);
      expect(list.max()).toBe(8);

      list.delete(3);
      expect(list.toArray()).toEqual([1, 2, 5, 8]);

      const values: number[] = [];
      list.forEach(v => values.push(v));
      expect(values).toEqual([1, 2, 5, 8]);
    });

    it('should handle reverse comparator workflow', () => {
      const list = new SortedLinkedList<number>({
        comparator: (a, b) => b - a,
      });
      for (let i = 0; i < 10; i++) {
        list.insert(i);
      }
      expect(list.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
      expect(list.min()).toBe(9);
      expect(list.max()).toBe(0);
    });

    it('should clear and rebuild', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 50; i++) {
        list.insert(i);
      }
      list.clear();
      expect(list.isEmpty).toBe(true);
      for (let i = 100; i < 150; i++) {
        list.insert(i);
      }
      expect(list.size).toBe(50);
      expect(list.toArray()).toEqual(Array.from({ length: 50 }, (_, i) => 100 + i));
    });

    it('should handle mixed positive and negative', () => {
      const list = new SortedLinkedList<number>();
      list.insert(-5);
      list.insert(10);
      list.insert(-10);
      list.insert(0);
      list.insert(5);
      expect(list.toArray()).toEqual([-10, -5, 0, 5, 10]);
      expect(list.min()).toBe(-10);
      expect(list.max()).toBe(10);
    });

    it('should handle range with strings', () => {
      const list = new SortedLinkedList<string>();
      list.insert('apple');
      list.insert('banana');
      list.insert('cherry');
      list.insert('date');
      expect(list.range('banana', 'cherry')).toEqual(['banana', 'cherry']);
      expect(list.range('banana', 'date')).toEqual(['banana', 'cherry', 'date']);
    });

    it('should handle zero in range', () => {
      const list = new SortedLinkedList<number>();
      list.insert(0);
      list.insert(1);
      list.insert(-1);
      expect(list.range(-1, 1)).toEqual([-1, 0, 1]);
    });

    it('should handle repeated range queries', () => {
      const list = new SortedLinkedList<number>();
      for (let i = 0; i < 20; i++) {
        list.insert(i);
      }
      const result1 = list.range(5, 10);
      const result2 = list.range(5, 10);
      expect(result1).toEqual(result2);
      expect(result1).toEqual([5, 6, 7, 8, 9, 10]);
    });
  });
});
