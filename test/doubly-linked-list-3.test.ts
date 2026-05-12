import { describe, it, expect } from 'vitest';
import { DoublyLinkedList3 } from './src/core/doubly-linked-list-3/index.js';

describe('DoublyLinkedList3 - Basic Operations', () => {
  it('should create empty list', () => {
    const list = new DoublyLinkedList3<number>();
    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
  });

  it('should append single element', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    expect(list.size).toBe(1);
    expect(list.isEmpty()).toBe(false);
    expect(list.toArray()).toEqual([1]);
  });

  it('should append multiple elements', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should prepend single element', () => {
    const list = new DoublyLinkedList3<number>();
    list.prepend(1);
    expect(list.size).toBe(1);
    expect(list.toArray()).toEqual([1]);
  });

  it('should prepend multiple elements', () => {
    const list = new DoublyLinkedList3<number>();
    list.prepend(3);
    list.prepend(2);
    list.prepend(1);
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should mix append and prepend', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(2);
    list.prepend(1);
    list.append(3);
    list.prepend(0);
    expect(list.toArray()).toEqual([0, 1, 2, 3]);
  });

  it('should return head value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    expect(list.head()).toBe(1);
  });

  it('should return undefined for head of empty list', () => {
    const list = new DoublyLinkedList3<number>();
    expect(list.head()).toBe(undefined);
  });

  it('should return tail value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    expect(list.tail()).toBe(2);
  });

  it('should return undefined for tail of empty list', () => {
    const list = new DoublyLinkedList3<number>();
    expect(list.tail()).toBe(undefined);
  });

  it('should get element at valid index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.get(0)).toBe(1);
    expect(list.get(1)).toBe(2);
    expect(list.get(2)).toBe(3);
  });

  it('should return undefined for invalid get index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    expect(list.get(-1)).toBe(undefined);
    expect(list.get(1)).toBe(undefined);
    expect(list.get(10)).toBe(undefined);
  });

  it('should set element at valid index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.set(1, 99);
    expect(result).toBe(2);
    expect(list.get(1)).toBe(99);
  });

  it('should return undefined for set at invalid index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    expect(list.set(-1, 99)).toBe(undefined);
    expect(list.set(1, 99)).toBe(undefined);
    expect(list.set(10, 99)).toBe(undefined);
  });

  it('should find index of existing value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.indexOf(2)).toBe(1);
  });

  it('should return -1 for indexOf non-existent value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    expect(list.indexOf(3)).toBe(-1);
  });

  it('should return -1 for indexOf in empty list', () => {
    const list = new DoublyLinkedList3<number>();
    expect(list.indexOf(1)).toBe(-1);
  });

  it('should return true when contains value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    expect(list.contains(2)).toBe(true);
  });

  it('should return false when does not contain value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    expect(list.contains(3)).toBe(false);
  });

  it('should return false for contains in empty list', () => {
    const list = new DoublyLinkedList3<number>();
    expect(list.contains(1)).toBe(false);
  });

  it('should remove existing value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.remove(2);
    expect(result).toBe(true);
    expect(list.size).toBe(2);
    expect(list.toArray()).toEqual([1, 3]);
  });

  it('should return false when removing non-existent value', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    const result = list.remove(3);
    expect(result).toBe(false);
    expect(list.size).toBe(2);
  });

  it('should remove from empty list', () => {
    const list = new DoublyLinkedList3<number>();
    const result = list.remove(1);
    expect(result).toBe(false);
  });

  it('should removeAt valid index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.removeAt(1);
    expect(result).toBe(2);
    expect(list.size).toBe(2);
    expect(list.toArray()).toEqual([1, 3]);
  });

  it('should removeAt first index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.removeAt(0);
    expect(result).toBe(1);
    expect(list.toArray()).toEqual([2, 3]);
  });

  it('should removeAt last index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.removeAt(2);
    expect(result).toBe(3);
    expect(list.toArray()).toEqual([1, 2]);
  });

  it('should return undefined for removeAt invalid index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    expect(list.removeAt(-1)).toBe(undefined);
    expect(list.removeAt(1)).toBe(undefined);
    expect(list.removeAt(10)).toBe(undefined);
  });

  it('should insertAt valid index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(3);
    list.insertAt(1, 2);
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should insertAt first index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(2);
    list.append(3);
    list.insertAt(0, 1);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should insertAt last index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.insertAt(2, 3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should not insertAt invalid negative index', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.insertAt(-1, 99);
    expect(list.size).toBe(1);
  });

  it('should not insertAt index beyond size', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.insertAt(5, 99);
    expect(list.size).toBe(1);
  });

  it('should clear list', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.clear();
    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
    expect(list.toArray()).toEqual([]);
  });

  it('should convert to array', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should return empty array for empty list', () => {
    const list = new DoublyLinkedList3<number>();
    expect(list.toArray()).toEqual([]);
  });

  it('should forEach forward', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result: number[] = [];
    list.forEach((value, index) => {
      result.push(value);
      expect(index).toBe(value - 1);
    });
    expect(result).toEqual([1, 2, 3]);
  });

  it('should forEachReverse', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result: number[] = [];
    list.forEachReverse((value, index) => {
      result.push(value);
      expect(index).toBe(value - 1);
    });
    expect(result).toEqual([3, 2, 1]);
  });

  it('should reverse list', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.reverse();
    expect(list.toArray()).toEqual([3, 2, 1]);
  });

  it('should reverse single element list', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.reverse();
    expect(list.toArray()).toEqual([1]);
  });

  it('should reverse empty list', () => {
    const list = new DoublyLinkedList3<number>();
    list.reverse();
    expect(list.toArray()).toEqual([]);
  });

  it('should map to new type', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.map(x => x * 2);
    expect(result.toArray()).toEqual([2, 4, 6]);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should map to strings', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.map(x => x.toString());
    expect(result.toArray()).toEqual(['1', '2', '3']);
  });

  it('should filter elements', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.append(4);
    list.append(5);
    const result = list.filter(x => x % 2 === 0);
    expect(result.toArray()).toEqual([2, 4]);
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should find matching element', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.find(x => x > 1);
    expect(result).toBe(2);
  });

  it('should return undefined when find no match', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.find(x => x > 10);
    expect(result).toBe(undefined);
  });

  it('should every returns true when all match', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(2);
    list.append(4);
    list.append(6);
    const result = list.every(x => x % 2 === 0);
    expect(result).toBe(true);
  });

  it('should every returns false when some do not match', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(2);
    list.append(3);
    list.append(4);
    const result = list.every(x => x % 2 === 0);
    expect(result).toBe(false);
  });

  it('should every returns true for empty list', () => {
    const list = new DoublyLinkedList3<number>();
    const result = list.every(x => x > 0);
    expect(result).toBe(true);
  });

  it('should some returns true when at least one matches', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result = list.some(x => x % 2 === 0);
    expect(result).toBe(true);
  });

  it('should some returns false when none match', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(3);
    list.append(5);
    const result = list.some(x => x % 2 === 0);
    expect(result).toBe(false);
  });

  it('should some returns false for empty list', () => {
    const list = new DoublyLinkedList3<number>();
    const result = list.some(x => x > 0);
    expect(result).toBe(false);
  });

  it('should work with strings', () => {
    const list = new DoublyLinkedList3<string>();
    list.append('a');
    list.append('b');
    list.append('c');
    expect(list.size).toBe(3);
    expect(list.get(1)).toBe('b');
    expect(list.contains('b')).toBe(true);
  });

  it('should handle large list', () => {
    const list = new DoublyLinkedList3<number>();
    for (let i = 0; i < 1000; i++) {
      list.append(i);
    }
    expect(list.size).toBe(1000);
    expect(list.get(500)).toBe(500);
    expect(list.tail()).toBe(999);
  });

  it('should remove middle element from three element list', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.remove(2);
    expect(list.toArray()).toEqual([1, 3]);
  });

  it('should remove first element from three element list', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.remove(1);
    expect(list.toArray()).toEqual([2, 3]);
  });

  it('should remove last element from three element list', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.remove(3);
    expect(list.toArray()).toEqual([1, 2]);
  });

  it('should handle duplicate values', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(2);
    list.append(3);
    expect(list.size).toBe(4);
    expect(list.indexOf(2)).toBe(1);
  });

  it('should remove first occurrence of duplicate', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(2);
    list.append(3);
    list.remove(2);
    expect(list.toArray()).toEqual([1, 2, 3]);
    expect(list.size).toBe(3);
  });

  it('should work with objects', () => {
    const list = new DoublyLinkedList3<{ id: number }>();
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    list.append(obj1);
    list.append(obj2);
    expect(list.get(0)).toBe(obj1);
    expect(list.get(1)).toBe(obj2);
  });

  it('should chain map and filter', () => {
    const list = new DoublyLinkedList3<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.append(4);
    const result = list.map(x => x * 2).filter(x => x > 4);
    expect(result.toArray()).toEqual([6, 8]);
  });
});
