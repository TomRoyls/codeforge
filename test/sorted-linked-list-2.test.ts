import { describe, it, expect, beforeEach } from 'vitest';
import { SortedLinkedList2 } from '../src/core/sorted-linked-list-2/index.js';

describe('SortedLinkedList2', () => {
  let list: SortedLinkedList2<number>;

  beforeEach(() => {
    list = new SortedLinkedList2<number>();
  });

  describe('empty list', () => {
    it('should be empty initially', () => {
      expect(list.size()).toBe(0);
    });

    it('should return undefined for min on empty list', () => {
      expect(list.min()).toBeUndefined();
    });

    it('should return undefined for max on empty list', () => {
      expect(list.max()).toBeUndefined();
    });

    it('should return empty array from toArray', () => {
      expect(list.toArray()).toEqual([]);
    });

    it('should return false for has on empty list', () => {
      expect(list.has(5)).toBe(false);
    });

    it('should return false for delete on empty list', () => {
      expect(list.delete(5)).toBe(false);
    });

    it('should handle forEach on empty list', () => {
      let called = false;
      list.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  describe('insert', () => {
    it('should insert single item', () => {
      list.insert(5);
      expect(list.size()).toBe(1);
      expect(list.toArray()).toEqual([5]);
    });

    it('should insert items in ascending order', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      expect(list.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should insert duplicate items', () => {
      list.insert(5);
      list.insert(5);
      list.insert(3);
      list.insert(3);
      expect(list.toArray()).toEqual([3, 3, 5, 5]);
    });

    it('should insert negative numbers', () => {
      list.insert(-1);
      list.insert(5);
      list.insert(-10);
      expect(list.toArray()).toEqual([-10, -1, 5]);
    });

    it('should insert zero', () => {
      list.insert(-1);
      list.insert(0);
      list.insert(1);
      expect(list.toArray()).toEqual([-1, 0, 1]);
    });

    it('should insert at beginning', () => {
      list.insert(5);
      list.insert(3);
      expect(list.toArray()).toEqual([3, 5]);
    });

    it('should insert at end', () => {
      list.insert(5);
      list.insert(10);
      expect(list.toArray()).toEqual([5, 10]);
    });

    it('should insert in middle', () => {
      list.insert(5);
      list.insert(10);
      list.insert(7);
      expect(list.toArray()).toEqual([5, 7, 10]);
    });
  });

  describe('has', () => {
    beforeEach(() => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
    });

    it('should return true for existing item', () => {
      expect(list.has(5)).toBe(true);
    });

    it('should return true for first item', () => {
      expect(list.has(3)).toBe(true);
    });

    it('should return true for last item', () => {
      expect(list.has(7)).toBe(true);
    });

    it('should return false for non-existing item', () => {
      expect(list.has(10)).toBe(false);
    });

    it('should return false for item smaller than all', () => {
      expect(list.has(1)).toBe(false);
    });

    it('should return false for item larger than all', () => {
      expect(list.has(20)).toBe(false);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
    });

    it('should delete existing item from middle', () => {
      expect(list.delete(5)).toBe(true);
      expect(list.size()).toBe(3);
      expect(list.toArray()).toEqual([1, 3, 7]);
    });

    it('should delete first item', () => {
      expect(list.delete(1)).toBe(true);
      expect(list.size()).toBe(3);
      expect(list.toArray()).toEqual([3, 5, 7]);
    });

    it('should delete last item', () => {
      expect(list.delete(7)).toBe(true);
      expect(list.size()).toBe(3);
      expect(list.toArray()).toEqual([1, 3, 5]);
    });

    it('should return false for non-existing item', () => {
      expect(list.delete(10)).toBe(false);
      expect(list.size()).toBe(4);
    });

    it('should delete duplicate items', () => {
      list.insert(5);
      list.insert(5);
      expect(list.delete(5)).toBe(true);
      expect(list.size()).toBe(5);
      expect(list.toArray()).toEqual([1, 3, 5, 5, 7]);
    });

    it('should handle deleting from list with one item', () => {
      const singleList = new SortedLinkedList2<number>();
      singleList.insert(5);
      expect(singleList.delete(5)).toBe(true);
      expect(singleList.size()).toBe(0);
    });

    it('should return false when deleting from single-item list with wrong value', () => {
      const singleList = new SortedLinkedList2<number>();
      singleList.insert(5);
      expect(singleList.delete(10)).toBe(false);
      expect(singleList.size()).toBe(1);
    });
  });

  describe('size', () => {
    it('should return 0 for empty list', () => {
      expect(list.size()).toBe(0);
    });

    it('should increment after each insert', () => {
      list.insert(5);
      expect(list.size()).toBe(1);
      list.insert(3);
      expect(list.size()).toBe(2);
      list.insert(7);
      expect(list.size()).toBe(3);
    });

    it('should decrement after delete', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.size()).toBe(3);
      list.delete(5);
      expect(list.size()).toBe(2);
    });

    it('should reset to 0 after clear', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.size()).toBe(3);
      list.clear();
      expect(list.size()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear empty list', () => {
      list.clear();
      expect(list.size()).toBe(0);
      expect(list.toArray()).toEqual([]);
    });

    it('should clear populated list', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.clear();
      expect(list.size()).toBe(0);
      expect(list.toArray()).toEqual([]);
      expect(list.min()).toBeUndefined();
      expect(list.max()).toBeUndefined();
    });

    it('should allow operations after clear', () => {
      list.insert(5);
      list.insert(3);
      list.clear();
      list.insert(10);
      expect(list.size()).toBe(1);
      expect(list.toArray()).toEqual([10]);
    });
  });

  describe('min', () => {
    it('should return minimum value', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.min()).toBe(1);
    });

    it('should return minimum with duplicates', () => {
      list.insert(5);
      list.insert(3);
      list.insert(3);
      expect(list.min()).toBe(3);
    });

    it('should return minimum with negative numbers', () => {
      list.insert(-1);
      list.insert(5);
      list.insert(-10);
      expect(list.min()).toBe(-10);
    });
  });

  describe('max', () => {
    it('should return maximum value', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.max()).toBe(7);
    });

    it('should return maximum with duplicates', () => {
      list.insert(5);
      list.insert(7);
      list.insert(7);
      expect(list.max()).toBe(7);
    });

    it('should return maximum with negative numbers', () => {
      list.insert(-1);
      list.insert(5);
      list.insert(-10);
      expect(list.max()).toBe(5);
    });
  });

  describe('toArray', () => {
    it('should return sorted array', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      expect(list.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should return array with duplicates', () => {
      list.insert(5);
      list.insert(3);
      list.insert(5);
      list.insert(3);
      expect(list.toArray()).toEqual([3, 3, 5, 5]);
    });

    it('should not modify original list when calling toArray', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      const arr1 = list.toArray();
      arr1.push(100);
      const arr2 = list.toArray();
      expect(arr2).toEqual([3, 5, 7]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all items in order', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);

      const result: number[] = [];
      list.forEach((item) => result.push(item));
      expect(result).toEqual([1, 3, 5, 7]);
    });

    it('should provide correct index', () => {
      list.insert(5);
      list.insert(3);
      list.insert(7);

      const indices: number[] = [];
      list.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should handle empty list', () => {
      let called = false;
      list.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  describe('custom comparator - strings', () => {
    it('should sort strings alphabetically', () => {
      const stringList = new SortedLinkedList2<string>((a, b) => a.localeCompare(b));
      stringList.insert('banana');
      stringList.insert('apple');
      stringList.insert('cherry');
      expect(stringList.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should handle has with string comparator', () => {
      const stringList = new SortedLinkedList2<string>((a, b) => a.localeCompare(b));
      stringList.insert('banana');
      stringList.insert('apple');
      expect(stringList.has('apple')).toBe(true);
      expect(stringList.has('grape')).toBe(false);
    });

    it('should handle delete with string comparator', () => {
      const stringList = new SortedLinkedList2<string>((a, b) => a.localeCompare(b));
      stringList.insert('banana');
      stringList.insert('apple');
      stringList.insert('cherry');
      expect(stringList.delete('banana')).toBe(true);
      expect(stringList.toArray()).toEqual(['apple', 'cherry']);
    });

    it('should handle min/max with string comparator', () => {
      const stringList = new SortedLinkedList2<string>((a, b) => a.localeCompare(b));
      stringList.insert('banana');
      stringList.insert('apple');
      stringList.insert('cherry');
      expect(stringList.min()).toBe('apple');
      expect(stringList.max()).toBe('cherry');
    });
  });

  describe('custom comparator - reverse order', () => {
    it('should sort in descending order', () => {
      const reverseList = new SortedLinkedList2<number>((a, b) => b - a);
      reverseList.insert(5);
      reverseList.insert(3);
      reverseList.insert(7);
      reverseList.insert(1);
      expect(reverseList.toArray()).toEqual([7, 5, 3, 1]);
    });

    it('should handle has with reverse comparator', () => {
      const reverseList = new SortedLinkedList2<number>((a, b) => b - a);
      reverseList.insert(5);
      reverseList.insert(3);
      reverseList.insert(7);
      expect(reverseList.has(5)).toBe(true);
      expect(reverseList.has(10)).toBe(false);
    });

    it('should handle delete with reverse comparator', () => {
      const reverseList = new SortedLinkedList2<number>((a, b) => b - a);
      reverseList.insert(5);
      reverseList.insert(3);
      reverseList.insert(7);
      expect(reverseList.delete(5)).toBe(true);
      expect(reverseList.toArray()).toEqual([7, 3]);
    });

    it('should handle min/max with reverse comparator', () => {
      const reverseList = new SortedLinkedList2<number>((a, b) => b - a);
      reverseList.insert(5);
      reverseList.insert(3);
      reverseList.insert(7);
      expect(reverseList.min()).toBe(7);
      expect(reverseList.max()).toBe(3);
    });
  });

  describe('large dataset', () => {
    it('should handle 1000+ items', () => {
      const largeList = new SortedLinkedList2<number>();
      const items = Array.from({ length: 1000 }, (_, i) => 1000 - i);
      items.forEach(item => largeList.insert(item));

      expect(largeList.size()).toBe(1000);
      const arr = largeList.toArray();
      expect(arr.length).toBe(1000);

      for (let i = 0; i < arr.length; i++) {
        expect(arr[i]).toBe(i + 1);
      }
    });

    it('should handle has on large dataset', () => {
      const largeList = new SortedLinkedList2<number>();
      const items = Array.from({ length: 1000 }, (_, i) => 1000 - i);
      items.forEach(item => largeList.insert(item));

      expect(largeList.has(1)).toBe(true);
      expect(largeList.has(500)).toBe(true);
      expect(largeList.has(1000)).toBe(true);
      expect(largeList.has(1001)).toBe(false);
      expect(largeList.has(0)).toBe(false);
    });

    it('should handle delete on large dataset', () => {
      const largeList = new SortedLinkedList2<number>();
      const items = Array.from({ length: 1000 }, (_, i) => 1000 - i);
      items.forEach(item => largeList.insert(item));

      expect(largeList.delete(500)).toBe(true);
      expect(largeList.size()).toBe(999);
      expect(largeList.has(500)).toBe(false);

      const arr = largeList.toArray();
      expect(arr.length).toBe(999);
    });

    it('should handle forEach on large dataset', () => {
      const largeList = new SortedLinkedList2<number>();
      const items = Array.from({ length: 1000 }, (_, i) => 1000 - i);
      items.forEach(item => largeList.insert(item));

      let count = 0;
      largeList.forEach(() => count++);
      expect(count).toBe(1000);
    });
  });

  describe('edge cases', () => {
    it('should handle inserting NaN', () => {
      list.insert(NaN);
      list.insert(5);
      list.insert(NaN);
      expect(list.size()).toBe(3);
    });

    it('should handle inserting null with custom comparator', () => {
      const nullList = new SortedLinkedList2<number | null>((a, b) => {
        if (a === null && b === null) return 0;
        if (a === null) return -1;
        if (b === null) return 1;
        return a - b;
      });
      nullList.insert(5);
      nullList.insert(null);
      nullList.insert(3);
      expect(nullList.toArray()).toEqual([null, 3, 5]);
    });

    it('should handle inserting same item many times', () => {
      for (let i = 0; i < 100; i++) {
        list.insert(5);
      }
      expect(list.size()).toBe(100);
      expect(list.toArray()).toEqual(Array(100).fill(5));
    });

    it('should handle alternating insert and delete', () => {
      list.insert(5);
      list.delete(5);
      list.insert(3);
      list.delete(3);
      expect(list.size()).toBe(0);
    });

    it('should handle multiple clear operations', () => {
      list.insert(5);
      list.insert(3);
      list.clear();
      list.clear();
      expect(list.size()).toBe(0);
    });
  });
});
