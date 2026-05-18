import { describe, it, expect } from 'vitest';
import { DoublyLinkedList4 } from '../../src/core/doubly-linked-list-4/index.js';

describe('DoublyLinkedList4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty list', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });
  });

  // ─── push ───
  describe('push', () => {
    it('should push a single element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      expect(list.size).toBe(1);
      expect(list.peek()).toBe(1);
    });

    it('should push multiple elements', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });
  });

  // ─── pop ───
  describe('pop', () => {
    it('should return undefined for empty list', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.pop()).toBeUndefined();
    });

    it('should remove and return the last element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.pop()).toBe(3);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should handle single element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(42);
      expect(list.pop()).toBe(42);
      expect(list.isEmpty()).toBe(true);
    });
  });

  // ─── shift ───
  describe('shift', () => {
    it('should return undefined for empty list', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.shift()).toBeUndefined();
    });

    it('should remove and return the first element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.shift()).toBe(1);
      expect(list.toArray()).toEqual([2, 3]);
    });

    it('should handle single element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(42);
      expect(list.shift()).toBe(42);
      expect(list.isEmpty()).toBe(true);
    });
  });

  // ─── unshift ───
  describe('unshift', () => {
    it('should add element to the front', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(2);
      list.unshift(1);
      expect(list.toArray()).toEqual([1, 2]);
      expect(list.peek()).toBe(1);
    });

    it('should unshift to empty list', () => {
      const list = new DoublyLinkedList4<number>();
      list.unshift(1);
      expect(list.peek()).toBe(1);
      expect(list.size).toBe(1);
    });
  });

  // ─── peek ───
  describe('peek', () => {
    it('should return undefined for empty list', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.peek()).toBeUndefined();
    });

    it('should return the first element without removing', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(10);
      list.push(20);
      expect(list.peek()).toBe(10);
      expect(list.size).toBe(2);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should remove all elements', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.clear();
      expect(list.isEmpty()).toBe(true);
      expect(list.size).toBe(0);
    });
  });

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.toArray()).toEqual([]);
    });

    it('should return all elements in order', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });
  });

  // ─── forEach ───
  describe('forEach', () => {
    it('should iterate with correct indices', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(10);
      list.push(20);
      list.push(30);
      const results: [number, number][] = [];
      list.forEach((v, i) => results.push([v, i]));
      expect(results).toEqual([[10, 0], [20, 1], [30, 2]]);
    });
  });

  // ─── filter ───
  describe('filter', () => {
    it('should return filtered list', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      list.push(4);
      const filtered = list.filter(v => v % 2 === 0);
      expect(filtered.toArray()).toEqual([2, 4]);
    });

    it('should not modify original list', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.filter(v => v > 1);
      expect(list.toArray()).toEqual([1, 2]);
    });
  });

  // ─── map ───
  describe('map', () => {
    it('should transform elements', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      const mapped = list.map(v => v * 10);
      expect(mapped.toArray()).toEqual([10, 20, 30]);
    });

    it('should allow type transformation', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      const mapped = list.map(v => `v${v}`);
      expect(mapped.toArray()).toEqual(['v1', 'v2']);
    });
  });

  // ─── reduce ───
  describe('reduce', () => {
    it('should reduce to a single value', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.reduce((acc, v) => acc + v, 0)).toBe(6);
    });

    it('should return initial value for empty list', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.reduce((acc, v) => acc + v, 42)).toBe(42);
    });
  });

  // ─── findLast ───
  describe('findLast', () => {
    it('should find the last matching element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      list.push(2);
      expect(list.findLast(v => v === 2)).toBe(2);
    });

    it('should return undefined when no match', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      expect(list.findLast(v => v > 10)).toBeUndefined();
    });

    it('should return undefined for empty list', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.findLast(v => true)).toBeUndefined();
    });
  });

  // ─── findLastIndex ───
  describe('findLastIndex', () => {
    it('should return index of last matching element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      list.push(2);
      expect(list.findLastIndex(v => v === 2)).toBe(3);
    });

    it('should return -1 when no match', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      expect(list.findLastIndex(v => v > 10)).toBe(-1);
    });
  });

  // ─── reverse ───
  describe('reverse', () => {
    it('should reverse the list in place', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      list.reverse();
      expect(list.toArray()).toEqual([3, 2, 1]);
      expect(list.peek()).toBe(3);
    });

    it('should handle empty list', () => {
      const list = new DoublyLinkedList4<number>();
      list.reverse();
      expect(list.isEmpty()).toBe(true);
    });

    it('should handle single element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.reverse();
      expect(list.toArray()).toEqual([1]);
    });
  });

  // ─── insertAt ───
  describe('insertAt', () => {
    it('should insert at the beginning', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(2);
      list.insertAt(0, 1);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should insert at the end', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.insertAt(1, 2);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should insert in the middle', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(3);
      list.insertAt(1, 2);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('should do nothing for out-of-bounds index', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.insertAt(-1, 0);
      list.insertAt(5, 0);
      expect(list.toArray()).toEqual([1]);
    });
  });

  // ─── removeAt ───
  describe('removeAt', () => {
    it('should return undefined for invalid index', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.removeAt(-1)).toBeUndefined();
      expect(list.removeAt(0)).toBeUndefined();
    });

    it('should remove first element via index', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.removeAt(0)).toBe(1);
      expect(list.toArray()).toEqual([2, 3]);
    });

    it('should remove last element via index', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.removeAt(2)).toBe(3);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should remove middle element', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.removeAt(1)).toBe(2);
      expect(list.toArray()).toEqual([1, 3]);
    });
  });

  // ─── concat ───
  describe('concat', () => {
    it('should concatenate two lists', () => {
      const list1 = new DoublyLinkedList4<number>();
      list1.push(1);
      list1.push(2);
      const list2 = new DoublyLinkedList4<number>();
      list2.push(3);
      list2.push(4);
      const combined = list1.concat(list2);
      expect(combined.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should not modify original lists', () => {
      const list1 = new DoublyLinkedList4<number>();
      list1.push(1);
      const list2 = new DoublyLinkedList4<number>();
      list2.push(2);
      list1.concat(list2);
      expect(list1.toArray()).toEqual([1]);
      expect(list2.toArray()).toEqual([2]);
    });

    it('should handle concatenating with empty list', () => {
      const list1 = new DoublyLinkedList4<number>();
      list1.push(1);
      const list2 = new DoublyLinkedList4<number>();
      const combined = list1.concat(list2);
      expect(combined.toArray()).toEqual([1]);
    });
  });

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should return complexity for known methods', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.getTimeComplexity('push')).toBe('O(1)');
      expect(list.getTimeComplexity('pop')).toBe('O(1)');
      expect(list.getTimeComplexity('toArray')).toBe('O(n)');
      expect(list.getTimeComplexity('concat')).toBe('O(n + m)');
    });

    it('should return Unknown for unrecognized method', () => {
      const list = new DoublyLinkedList4<number>();
      expect(list.getTimeComplexity('unknown')).toBe('Unknown');
    });
  });

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('should handle string elements', () => {
      const list = new DoublyLinkedList4<string>();
      list.push('a');
      list.push('b');
      expect(list.toArray()).toEqual(['a', 'b']);
    });

    it('should handle negative numbers', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(-1);
      list.push(0);
      list.push(-5);
      expect(list.toArray()).toEqual([-1, 0, -5]);
    });

    it('should handle duplicates', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(1);
      list.push(1);
      list.push(1);
      expect(list.size).toBe(3);
      expect(list.toArray()).toEqual([1, 1, 1]);
    });

    it('should handle mixed push/unshift/shift/pop', () => {
      const list = new DoublyLinkedList4<number>();
      list.push(2);
      list.push(3);
      list.unshift(1);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.shift()).toBe(1);
      expect(list.pop()).toBe(3);
      expect(list.toArray()).toEqual([2]);
    });
  });
});
