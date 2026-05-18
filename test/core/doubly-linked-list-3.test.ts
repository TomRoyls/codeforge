import { describe, it, expect } from 'vitest';
import { DoublyLinkedList3 } from '../../src/core/doubly-linked-list-3/index.js';

describe('DoublyLinkedList3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty list', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });
  });

  // ─── append ───
  describe('append', () => {
    it('should append a single element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      expect(list.size).toBe(1);
      expect(list.head()).toBe(1);
      expect(list.tail()).toBe(1);
    });

    it('should append multiple elements in order', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.head()).toBe(1);
      expect(list.tail()).toBe(3);
    });
  });

  // ─── prepend ───
  describe('prepend', () => {
    it('should prepend to empty list', () => {
      const list = new DoublyLinkedList3<number>();
      list.prepend(1);
      expect(list.head()).toBe(1);
      expect(list.tail()).toBe(1);
    });

    it('should prepend elements in reverse order', () => {
      const list = new DoublyLinkedList3<number>();
      list.prepend(3);
      list.prepend(2);
      list.prepend(1);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });
  });

  // ─── remove ───
  describe('remove', () => {
    it('should return false when removing from empty list', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.remove(1)).toBe(false);
    });

    it('should remove the head element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      expect(list.remove(1)).toBe(true);
      expect(list.toArray()).toEqual([2]);
      expect(list.head()).toBe(2);
    });

    it('should remove the tail element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      expect(list.remove(2)).toBe(true);
      expect(list.toArray()).toEqual([1]);
      expect(list.tail()).toBe(1);
    });

    it('should remove a middle element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.remove(2)).toBe(true);
      expect(list.toArray()).toEqual([1, 3]);
    });

    it('should return false for non-existent value', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      expect(list.remove(99)).toBe(false);
    });

    it('should remove only the first occurrence of duplicates', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(1);
      list.remove(1);
      expect(list.toArray()).toEqual([2, 1]);
    });
  });

  // ─── removeAt ───
  describe('removeAt', () => {
    it('should return undefined for invalid index', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.removeAt(-1)).toBeUndefined();
      expect(list.removeAt(0)).toBeUndefined();
    });

    it('should remove element at given index', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(10);
      list.append(20);
      list.append(30);
      expect(list.removeAt(1)).toBe(20);
      expect(list.toArray()).toEqual([10, 30]);
    });

    it('should remove first element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      expect(list.removeAt(0)).toBe(1);
      expect(list.toArray()).toEqual([2]);
    });

    it('should remove last element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      expect(list.removeAt(1)).toBe(2);
      expect(list.toArray()).toEqual([1]);
    });
  });

  // ─── insertAt ───
  describe('insertAt', () => {
    it('should insert at the beginning', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(2);
      list.insertAt(0, 1);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should insert at the end', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.insertAt(1, 2);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('should insert in the middle', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(3);
      list.insertAt(1, 2);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('should do nothing for out-of-bounds index', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.insertAt(-1, 0);
      list.insertAt(5, 0);
      expect(list.toArray()).toEqual([1]);
    });
  });

  // ─── get ───
  describe('get', () => {
    it('should return undefined for invalid index', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.get(0)).toBeUndefined();
      expect(list.get(-1)).toBeUndefined();
    });

    it('should return element at given index', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(10);
      list.append(20);
      list.append(30);
      expect(list.get(0)).toBe(10);
      expect(list.get(1)).toBe(20);
      expect(list.get(2)).toBe(30);
    });
  });

  // ─── set ───
  describe('set', () => {
    it('should update value at index and return old value', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      expect(list.set(1, 99)).toBe(2);
      expect(list.get(1)).toBe(99);
    });

    it('should return undefined for invalid index', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.set(0, 1)).toBeUndefined();
      expect(list.set(-1, 1)).toBeUndefined();
    });
  });

  // ─── indexOf ───
  describe('indexOf', () => {
    it('should return index of found element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(10);
      list.append(20);
      list.append(30);
      expect(list.indexOf(20)).toBe(1);
    });

    it('should return -1 when element not found', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      expect(list.indexOf(99)).toBe(-1);
    });

    it('should return first occurrence of duplicates', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(1);
      expect(list.indexOf(1)).toBe(0);
    });
  });

  // ─── contains ───
  describe('contains', () => {
    it('should return true for existing element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(42);
      expect(list.contains(42)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      expect(list.contains(99)).toBe(false);
    });
  });

  // ─── head / tail ───
  describe('head and tail', () => {
    it('should return undefined for empty list', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.head()).toBeUndefined();
      expect(list.tail()).toBeUndefined();
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should clear the list', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.clear();
      expect(list.isEmpty()).toBe(true);
      expect(list.size).toBe(0);
      expect(list.toArray()).toEqual([]);
    });
  });

  // ─── forEach ───
  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      const collected: number[] = [];
      list.forEach(v => collected.push(v));
      expect(collected).toEqual([1, 2, 3]);
    });
  });

  // ─── forEachReverse ───
  describe('forEachReverse', () => {
    it('should iterate in reverse order with correct indices', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      const collected: [number, number][] = [];
      list.forEachReverse((v, i) => collected.push([v, i]));
      expect(collected).toEqual([[3, 2], [2, 1], [1, 0]]);
    });
  });

  // ─── reverse ───
  describe('reverse', () => {
    it('should reverse the list in place', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      list.reverse();
      expect(list.toArray()).toEqual([3, 2, 1]);
      expect(list.head()).toBe(3);
      expect(list.tail()).toBe(1);
    });

    it('should handle empty list', () => {
      const list = new DoublyLinkedList3<number>();
      list.reverse();
      expect(list.isEmpty()).toBe(true);
    });

    it('should handle single element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.reverse();
      expect(list.toArray()).toEqual([1]);
    });
  });

  // ─── map ───
  describe('map', () => {
    it('should transform elements to a new list', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      const mapped = list.map(v => v * 10);
      expect(mapped.toArray()).toEqual([10, 20, 30]);
    });

    it('should allow type transformation', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      const mapped = list.map(v => `x${v}`);
      expect(mapped.toArray()).toEqual(['x1', 'x2']);
    });
  });

  // ─── filter ───
  describe('filter', () => {
    it('should filter elements into a new list', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      list.append(4);
      const filtered = list.filter(v => v % 2 === 0);
      expect(filtered.toArray()).toEqual([2, 4]);
    });

    it('should not modify original list', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.filter(v => v > 1);
      expect(list.toArray()).toEqual([1, 2]);
    });
  });

  // ─── find ───
  describe('find', () => {
    it('should find the first matching element', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.find(v => v > 1)).toBe(2);
    });

    it('should return undefined when no match', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      expect(list.find(v => v > 10)).toBeUndefined();
    });
  });

  // ─── every ───
  describe('every', () => {
    it('should return true when all elements satisfy the predicate', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(2);
      list.append(4);
      list.append(6);
      expect(list.every(v => v % 2 === 0)).toBe(true);
    });

    it('should return false when some elements fail', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(2);
      list.append(3);
      expect(list.every(v => v % 2 === 0)).toBe(false);
    });

    it('should return true for empty list', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.every(v => v > 0)).toBe(true);
    });
  });

  // ─── some ───
  describe('some', () => {
    it('should return true when at least one element satisfies', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      expect(list.some(v => v === 2)).toBe(true);
    });

    it('should return false when no element satisfies', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(2);
      expect(list.some(v => v > 10)).toBe(false);
    });

    it('should return false for empty list', () => {
      const list = new DoublyLinkedList3<number>();
      expect(list.some(v => true)).toBe(false);
    });
  });

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('should handle string elements', () => {
      const list = new DoublyLinkedList3<string>();
      list.append('a');
      list.append('b');
      expect(list.toArray()).toEqual(['a', 'b']);
      expect(list.indexOf('b')).toBe(1);
    });

    it('should handle negative numbers', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(-1);
      list.append(0);
      list.append(-5);
      expect(list.toArray()).toEqual([-1, 0, -5]);
    });

    it('should handle duplicates', () => {
      const list = new DoublyLinkedList3<number>();
      list.append(1);
      list.append(1);
      list.append(1);
      expect(list.size).toBe(3);
      expect(list.toArray()).toEqual([1, 1, 1]);
    });
  });
});
