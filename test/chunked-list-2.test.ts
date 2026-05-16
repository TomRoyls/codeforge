import { describe, it, expect } from 'vitest';
import { ChunkedList2 } from '../src/core/chunked-list-2/index';

describe('ChunkedList2', () => {
  describe('constructor', () => {
    it('creates empty list', async () => {
      const list = new ChunkedList2<number>();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('creates list with custom chunk size', async () => {
      const list = new ChunkedList2<number>(10);
      expect(list.size).toBe(0);
    });

    it('defaults to chunk size 32', async () => {
      const list = new ChunkedList2<number>();
      for (let i = 0; i < 32; i++) {
        list.push(i);
      }
      expect(list.size).toBe(32);
    });
  });

  describe('push', () => {
    it('appends single value', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      expect(list.size).toBe(1);
      expect(list.get(0)).toBe(1);
    });

    it('appends multiple values', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.size).toBe(3);
      expect(list.get(0)).toBe(1);
      expect(list.get(1)).toBe(2);
      expect(list.get(2)).toBe(3);
    });

    it('creates new chunk when current is full', async () => {
      const list = new ChunkedList2<number>(4);
      list.push(1);
      list.push(2);
      list.push(3);
      list.push(4);
      list.push(5);
      expect(list.size).toBe(5);
      expect(list.get(4)).toBe(5);
    });

    it('handles chunk boundary', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.size).toBe(3);
      expect(list.get(0)).toBe(1);
      expect(list.get(1)).toBe(2);
      expect(list.get(2)).toBe(3);
    });
  });

  describe('pop', () => {
    it('removes and returns last value', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      const value = list.pop();
      expect(value).toBe(3);
      expect(list.size).toBe(2);
      expect(list.get(2)).toBe(undefined);
    });

    it('returns undefined for empty list', async () => {
      const list = new ChunkedList2<number>();
      const value = list.pop();
      expect(value).toBe(undefined);
      expect(list.size).toBe(0);
    });

    it('removes last chunk when empty', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      list.pop();
      expect(list.size).toBe(2);
      list.pop();
      expect(list.size).toBe(1);
    });

    it('handles popping from chunk boundary', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      list.pop();
      expect(list.get(1)).toBe(2);
    });
  });

  describe('get', () => {
    it('returns value at index', async () => {
      const list = new ChunkedList2<number>();
      list.push(10);
      list.push(20);
      list.push(30);
      expect(list.get(0)).toBe(10);
      expect(list.get(1)).toBe(20);
      expect(list.get(2)).toBe(30);
    });

    it('returns undefined for out of bounds', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      expect(list.get(-1)).toBe(undefined);
      expect(list.get(2)).toBe(undefined);
      expect(list.get(10)).toBe(undefined);
    });

    it('handles chunk boundary', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      list.push(4);
      expect(list.get(0)).toBe(1);
      expect(list.get(1)).toBe(2);
      expect(list.get(2)).toBe(3);
      expect(list.get(3)).toBe(4);
    });

    it('handles values across multiple chunks', async () => {
      const list = new ChunkedList2<number>(3);
      for (let i = 0; i < 10; i++) {
        list.push(i);
      }
      expect(list.get(0)).toBe(0);
      expect(list.get(2)).toBe(2);
      expect(list.get(3)).toBe(3);
      expect(list.get(5)).toBe(5);
      expect(list.get(6)).toBe(6);
      expect(list.get(9)).toBe(9);
    });
  });

  describe('set', () => {
    it('sets value at index', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      list.set(1, 20);
      expect(list.get(1)).toBe(20);
      expect(list.size).toBe(3);
    });

    it('handles out of bounds', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.set(5, 10);
      expect(list.size).toBe(1);
      expect(list.get(5)).toBe(undefined);
    });

    it('handles chunk boundary', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      list.set(1, 20);
      list.set(2, 30);
      expect(list.get(1)).toBe(20);
      expect(list.get(2)).toBe(30);
    });

    it('sets values across multiple chunks', async () => {
      const list = new ChunkedList2<number>(3);
      for (let i = 0; i < 10; i++) {
        list.push(i);
      }
      list.set(0, 100);
      list.set(5, 500);
      list.set(9, 900);
      expect(list.get(0)).toBe(100);
      expect(list.get(5)).toBe(500);
      expect(list.get(9)).toBe(900);
    });
  });

  describe('size', () => {
    it('returns 0 for empty list', async () => {
      const list = new ChunkedList2<number>();
      expect(list.size).toBe(0);
    });

    it('increments with each push', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      expect(list.size).toBe(1);
      list.push(2);
      expect(list.size).toBe(2);
      list.push(3);
      expect(list.size).toBe(3);
    });

    it('decrements with each pop', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      list.pop();
      expect(list.size).toBe(2);
      list.pop();
      expect(list.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty list', async () => {
      const list = new ChunkedList2<number>();
      expect(list.isEmpty()).toBe(true);
    });

    it('returns false after push', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      expect(list.isEmpty()).toBe(false);
    });

    it('returns true after all pops', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.pop();
      expect(list.isEmpty()).toBe(true);
    });

    it('returns false after clear and push', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.clear();
      list.push(2);
      expect(list.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes all elements', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('works on empty list', async () => {
      const list = new ChunkedList2<number>();
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty()).toBe(true);
    });

    it('allows reuse after clear', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.clear();
      list.push(3);
      list.push(4);
      expect(list.size).toBe(2);
      expect(list.get(0)).toBe(3);
      expect(list.get(1)).toBe(4);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty list', async () => {
      const list = new ChunkedList2<number>();
      const arr = list.toArray();
      expect(arr).toEqual([]);
    });

    it('returns all elements', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      const arr = list.toArray();
      expect(arr).toEqual([1, 2, 3]);
    });

    it('handles elements across chunks', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      list.push(4);
      const arr = list.toArray();
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it('returns independent copy', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      const arr = list.toArray();
      arr.push(3);
      expect(list.size).toBe(2);
      expect(arr.length).toBe(3);
    });
  });

  describe('forEach', () => {
    it('iterates over empty list', async () => {
      const list = new ChunkedList2<number>();
      const values: number[] = [];
      list.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([]);
    });

    it('iterates over all elements', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      list.push(2);
      list.push(3);
      const values: number[] = [];
      const indices: number[] = [];
      list.forEach((value, index) => {
        values.push(value);
        indices.push(index);
      });
      expect(values).toEqual([1, 2, 3]);
      expect(indices).toEqual([0, 1, 2]);
    });

    it('handles elements across chunks', async () => {
      const list = new ChunkedList2<number>(2);
      for (let i = 0; i < 6; i++) {
        list.push(i);
      }
      const values: number[] = [];
      list.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('passes correct indices', async () => {
      const list = new ChunkedList2<number>(3);
      for (let i = 0; i < 7; i++) {
        list.push(i);
      }
      const indices: number[] = [];
      list.forEach((_, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('edge cases', () => {
    it('handles single element', async () => {
      const list = new ChunkedList2<number>();
      list.push(1);
      expect(list.get(0)).toBe(1);
      expect(list.pop()).toBe(1);
      expect(list.isEmpty()).toBe(true);
    });

    it('handles large number of elements', async () => {
      const list = new ChunkedList2<number>(10);
      for (let i = 0; i < 100; i++) {
        list.push(i);
      }
      expect(list.size).toBe(100);
      expect(list.get(0)).toBe(0);
      expect(list.get(99)).toBe(99);
      expect(list.get(50)).toBe(50);
    });

    it('handles chunk size of 1', async () => {
      const list = new ChunkedList2<number>(1);
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.size).toBe(3);
      expect(list.get(0)).toBe(1);
      expect(list.get(1)).toBe(2);
      expect(list.get(2)).toBe(3);
    });

    it('handles different types', async () => {
      const list = new ChunkedList2<string>();
      list.push('a');
      list.push('b');
      list.push('c');
      expect(list.get(0)).toBe('a');
      expect(list.toArray()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('combined operations', () => {
    it('handles mixed push and pop', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      list.pop();
      list.push(4);
      expect(list.toArray()).toEqual([1, 2, 4]);
    });

    it('handles mixed push, pop, and set', async () => {
      const list = new ChunkedList2<number>(2);
      list.push(1);
      list.push(2);
      list.push(3);
      list.set(1, 20);
      list.pop();
      list.push(4);
      list.set(0, 10);
      expect(list.toArray()).toEqual([10, 20, 4]);
    });

    it('should handle push and pop', () => {
      const list = new ChunkedList2<number>(3);
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.pop()).toBe(3);
      expect(list.size).toBe(2);
    });
  });

  it('should handle get after multiple pushes', () => {
    const list = new ChunkedList2<number>(3);
    list.push(10);
    list.push(20);
    list.push(30);
    expect(list.get(0)).toBe(10);
    expect(list.get(1)).toBe(20);
    expect(list.get(2)).toBe(30);
  });
  it('should handle size property', () => {
    const list = new ChunkedList2<number>(3);
    expect(list.size).toBe(0);
    list.push(1);
    list.push(2);
    expect(list.size).toBe(2);
  });
});
