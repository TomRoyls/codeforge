import { describe, it, expect } from 'vitest';
import { UnrolledLinkedList } from './src/core/unrolled-linked-list/index.js';

describe('UnrolledLinkedList', () => {
  describe('constructor', () => {
    it('creates empty list with default block size', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('creates empty list with custom block size', () => {
      const list = new UnrolledLinkedList<number>(4);
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.isEmpty).toBe(true);
    });

    it('returns false after adding element', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.isEmpty).toBe(false);
    });

    it('returns true after clearing', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.clear();
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('size', () => {
    it('returns 0 for empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.size).toBe(0);
    });

    it('returns correct size after appends', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.size).toBe(3);
    });

    it('returns correct size after removes', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      list.remove(1);
      expect(list.size).toBe(2);
    });

    it('returns correct size after inserts', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(3);
      list.insert(1, 2);
      expect(list.size).toBe(3);
    });

    it('returns correct size after clear', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.clear();
      expect(list.size).toBe(0);
    });
  });

  describe('append', () => {
    it('adds element to empty list', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.size).toBe(1);
      expect(list.get(0)).toBe(1);
    });

    it('adds multiple elements in order', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('creates new block when current block is full', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 4; i++) {
        list.append(i);
      }
      list.append(4);
      expect(list.size).toBe(5);
      expect(list.get(4)).toBe(4);
    });
  });

  describe('prepend', () => {
    it('adds element to empty list', () => {
      const list = new UnrolledLinkedList<number>();
      list.prepend(1);
      expect(list.size).toBe(1);
      expect(list.get(0)).toBe(1);
    });

    it('adds element at beginning', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(2);
      list.append(3);
      list.prepend(1);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('creates new block when current block is full', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 4; i++) {
        list.append(i + 1);
      }
      list.prepend(0);
      expect(list.size).toBe(5);
      expect(list.get(0)).toBe(0);
    });
  });

  describe('get', () => {
    it('returns element at valid index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.get(0)).toBe(1);
      expect(list.get(1)).toBe(2);
      expect(list.get(2)).toBe(3);
    });

    it('returns undefined for negative index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.get(-1)).toBeUndefined();
    });

    it('returns undefined for index equal to size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.get(1)).toBeUndefined();
    });

    it('returns undefined for index greater than size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.get(5)).toBeUndefined();
    });

    it('returns element from second block', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      expect(list.get(4)).toBe(4);
      expect(list.get(7)).toBe(7);
    });

    it('returns undefined for empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.get(0)).toBeUndefined();
    });
  });

  describe('set', () => {
    it('sets element at valid index and returns true', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.set(1, 20)).toBe(true);
      expect(list.get(1)).toBe(20);
      expect(list.toArray()).toEqual([1, 20, 3]);
    });

    it('returns false for negative index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.set(-1, 10)).toBe(false);
    });

    it('returns false for index equal to size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.set(1, 10)).toBe(false);
    });

    it('returns false for index greater than size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.set(5, 10)).toBe(false);
    });

    it('sets element in second block', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      expect(list.set(5, 50)).toBe(true);
      expect(list.get(5)).toBe(50);
    });

    it('sets element at first index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.set(0, 10)).toBe(true);
      expect(list.get(0)).toBe(10);
    });

    it('sets element at last index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.set(2, 30)).toBe(true);
      expect(list.get(2)).toBe(30);
    });
  });

  describe('insert', () => {
    it('inserts at end when index equals size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      expect(list.insert(2, 3)).toBe(true);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.size).toBe(3);
    });

    it('inserts at beginning when index is 0', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(2);
      list.append(3);
      expect(list.insert(0, 1)).toBe(true);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.size).toBe(3);
    });

    it('inserts in middle', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(3);
      expect(list.insert(1, 2)).toBe(true);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.size).toBe(3);
    });

    it('returns false for negative index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.insert(-1, 10)).toBe(false);
    });

    it('returns false for index greater than size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.insert(5, 10)).toBe(false);
    });

    it('splits block when inserting into full block', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 4; i++) {
        list.append(i);
      }
      expect(list.insert(2, 10)).toBe(true);
      expect(list.size).toBe(5);
      expect(list.get(2)).toBe(10);
    });

    it('inserts into second block', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      expect(list.insert(6, 10)).toBe(true);
      expect(list.size).toBe(9);
      expect(list.get(6)).toBe(10);
    });

    it('inserts into empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.insert(0, 1)).toBe(true);
      expect(list.size).toBe(1);
      expect(list.get(0)).toBe(1);
    });
  });

  describe('remove', () => {
    it('removes and returns element at valid index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.remove(1)).toBe(2);
      expect(list.toArray()).toEqual([1, 3]);
      expect(list.size).toBe(2);
    });

    it('returns undefined for negative index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.remove(-1)).toBeUndefined();
    });

    it('returns undefined for index equal to size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.remove(1)).toBeUndefined();
    });

    it('returns undefined for index greater than size', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.remove(5)).toBeUndefined();
    });

    it('removes from beginning', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.remove(0)).toBe(1);
      expect(list.toArray()).toEqual([2, 3]);
    });

    it('removes from end', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.remove(2)).toBe(3);
      expect(list.toArray()).toEqual([1, 2]);
    });

    it('removes only element', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      expect(list.remove(0)).toBe(1);
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('removes from second block', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      expect(list.remove(5)).toBe(5);
      expect(list.size).toBe(7);
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 6, 7]);
    });

    it('merges with previous block when under threshold', () => {
      const list = new UnrolledLinkedList<number>(8);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      list.remove(4);
      expect(list.size).toBe(7);
    });

    it('merges with next block when under threshold', () => {
      const list = new UnrolledLinkedList<number>(8);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      list.remove(7);
      expect(list.size).toBe(7);
    });
  });

  describe('indexOf', () => {
    it('returns index of existing element', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(10);
      list.append(20);
      list.append(30);
      expect(list.indexOf(20)).toBe(1);
    });

    it('returns -1 for non-existent element', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.indexOf(5)).toBe(-1);
    });

    it('returns -1 for empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.indexOf(1)).toBe(-1);
    });

    it('returns first index of duplicate elements', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(2);
      list.append(3);
      expect(list.indexOf(2)).toBe(1);
    });

    it('finds element in second block', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      expect(list.indexOf(5)).toBe(5);
    });

    it('finds element at index 0', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.indexOf(1)).toBe(0);
    });

    it('finds element at last index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.indexOf(3)).toBe(2);
    });
  });

  describe('contains', () => {
    it('returns true for existing element', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.contains(2)).toBe(true);
    });

    it('returns false for non-existent element', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.contains(5)).toBe(false);
    });

    it('returns false for empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.contains(1)).toBe(false);
    });

    it('returns true for element in second block', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      expect(list.contains(6)).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears empty list', () => {
      const list = new UnrolledLinkedList<number>();
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
      expect(list.toArray()).toEqual([]);
    });

    it('clears list with elements', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
      expect(list.toArray()).toEqual([]);
    });

    it('clears list with multiple blocks', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
      expect(list.toArray()).toEqual([]);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect(list.toArray()).toEqual([]);
    });

    it('returns array with all elements', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it('returns array with elements from multiple blocks', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    it('returns copy that does not affect list', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      const arr = list.toArray();
      arr[0] = 10;
      expect(list.get(0)).toBe(1);
    });
  });

  describe('forEach', () => {
    it('visits all elements in order', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      const result: number[] = [];
      list.forEach((item) => result.push(item));
      expect(result).toEqual([1, 2, 3]);
    });

    it('passes correct index to callback', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(10);
      list.append(20);
      list.append(30);
      const indices: number[] = [];
      list.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('does not iterate over empty list', () => {
      const list = new UnrolledLinkedList<number>();
      let count = 0;
      list.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('iterates over elements in multiple blocks', () => {
      const list = new UnrolledLinkedList<number>(4);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      const result: number[] = [];
      list.forEach((item) => result.push(item));
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('Symbol.iterator', () => {
    it('allows iteration with for...of', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      const result: number[] = [];
      for (const item of list) {
        result.push(item);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('allows spread operator', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect([...list]).toEqual([1, 2, 3]);
    });

    it('creates empty array for empty list', () => {
      const list = new UnrolledLinkedList<number>();
      expect([...list]).toEqual([]);
    });
  });

  describe('block splitting', () => {
    it('splits block when inserting into full block', () => {
      const list = new UnrolledLinkedList<number>(4);
      list.append(1);
      list.append(2);
      list.append(3);
      list.append(4);
      list.insert(2, 5);
      expect(list.size).toBe(5);
      expect(list.toArray()).toEqual([1, 2, 5, 3, 4]);
    });

    it('splits block at correct position when inserting near end', () => {
      const list = new UnrolledLinkedList<number>(4);
      list.append(1);
      list.append(2);
      list.append(3);
      list.append(4);
      list.insert(3, 5);
      expect(list.size).toBe(5);
      expect(list.get(3)).toBe(5);
    });

    it('splits block at correct position when inserting near beginning', () => {
      const list = new UnrolledLinkedList<number>(4);
      list.append(1);
      list.append(2);
      list.append(3);
      list.append(4);
      list.insert(1, 5);
      expect(list.size).toBe(5);
      expect(list.get(1)).toBe(5);
    });
  });

  describe('block merging', () => {
    it('merges blocks when removal causes underfull block', () => {
      const list = new UnrolledLinkedList<number>(8);
      for (let i = 0; i < 8; i++) {
        list.append(i);
      }
      list.remove(0);
      expect(list.size).toBe(7);
    });

    it('removes empty block when all elements removed', () => {
      const list = new UnrolledLinkedList<number>(4);
      list.append(1);
      list.append(2);
      list.append(3);
      list.append(4);
      for (let i = 0; i < 4; i++) {
        list.remove(0);
      }
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('boundary conditions', () => {
    it('handles single element list', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(42);
      expect(list.size).toBe(1);
      expect(list.isEmpty).toBe(false);
      expect(list.get(0)).toBe(42);
      expect(list.set(0, 43)).toBe(true);
      expect(list.get(0)).toBe(43);
      expect(list.remove(0)).toBe(43);
      expect(list.isEmpty).toBe(true);
    });

    it('handles operations at index 0', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(2);
      list.append(3);
      list.insert(0, 1);
      expect(list.get(0)).toBe(1);
      expect(list.set(0, 10)).toBe(true);
      expect(list.get(0)).toBe(10);
      expect(list.remove(0)).toBe(10);
      expect(list.get(0)).toBe(2);
    });

    it('handles operations at last index', () => {
      const list = new UnrolledLinkedList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.get(2)).toBe(3);
      expect(list.set(2, 30)).toBe(true);
      expect(list.get(2)).toBe(30);
      expect(list.remove(2)).toBe(30);
      expect(list.size).toBe(2);
    });

    it('handles large number of elements', () => {
      const list = new UnrolledLinkedList<number>(8);
      for (let i = 0; i < 100; i++) {
        list.append(i);
      }
      expect(list.size).toBe(100);
      expect(list.get(0)).toBe(0);
      expect(list.get(50)).toBe(50);
      expect(list.get(99)).toBe(99);
    });
  });
});
