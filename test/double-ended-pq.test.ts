import { describe, it, expect } from 'vitest';
import { DoubleEndedPQ } from '../src/core/double-ended-pq/index.js';

describe('DoubleEndedPQ', () => {
  describe('constructor and basic operations', () => {
    it('should create an empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should use default comparator correctly', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.peekMin()).toBe(3);
      expect(pq.peekMax()).toBe(7);
    });

    it('should use custom comparator correctly', async () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a });
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.peekMin()).toBe(7);
      expect(pq.peekMax()).toBe(3);
    });
  });

  describe('push', () => {
    it('should push single value', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      expect(pq.size()).toBe(1);
      expect(pq.peekMin()).toBe(5);
      expect(pq.peekMax()).toBe(5);
      expect(pq.isEmpty()).toBe(false);
    });

    it('should maintain heap property after multiple pushes', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(9);
      expect(pq.size()).toBe(5);
    });

    it('should push duplicate values', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(5);
      pq.push(5);
      expect(pq.size()).toBe(3);
      expect(pq.peekMin()).toBe(5);
      expect(pq.peekMax()).toBe(5);
    });

    it('should push strings', async () => {
      const pq = new DoubleEndedPQ<string>();
      pq.push('zebra');
      pq.push('apple');
      pq.push('banana');
      expect(pq.peekMin()).toBe('apple');
      expect(pq.peekMax()).toBe('zebra');
    });

    it('should push objects with custom comparator', async () => {
      interface Item {
        id: number;
      }
      const pq = new DoubleEndedPQ<Item>({ comparator: (a, b) => b.id - a.id });
      pq.push({ id: 5 });
      pq.push({ id: 2 });
      pq.push({ id: 8 });
      expect(pq.peekMin().id).toBe(8);
      expect(pq.peekMax().id).toBe(2);
    });
  });

  describe('popMin', () => {
    it('should throw for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(() => pq.popMin()).toThrow('DoubleEndedPQ is empty');
    });

    it('should pop single element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      const popped = pq.popMin();
      expect(popped).toBe(5);
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should pop elements in ascending order', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should pop duplicates correctly', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(5);
      pq.push(1);
      pq.push(3);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should maintain heap structure after partial pops', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      pq.push(2);
      expect(pq.popMin()).toBe(1);
      expect(pq.peekMin()).toBe(2);
      expect(pq.popMin()).toBe(2);
      expect(pq.peekMin()).toBe(3);
      expect(pq.size()).toBe(4);
    });
  });

  describe('popMax', () => {
    it('should throw for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(() => pq.popMax()).toThrow('DoubleEndedPQ is empty');
    });

    it('should pop single element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      const popped = pq.popMax();
      expect(popped).toBe(5);
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should pop elements in descending order', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMax());
      }
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });

    it('should pop duplicates correctly', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(5);
      pq.push(1);
      pq.push(3);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMax());
      }
      expect(result).toEqual([5, 5, 3, 3, 1]);
    });

    it('should maintain heap structure after partial pops', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      pq.push(2);
      expect(pq.popMax()).toBe(9);
      expect(pq.peekMax()).toBe(7);
      expect(pq.popMax()).toBe(7);
      expect(pq.peekMax()).toBe(5);
      expect(pq.size()).toBe(4);
    });
  });

  describe('peekMin', () => {
    it('should throw for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(() => pq.peekMin()).toThrow('DoubleEndedPQ is empty');
    });

    it('should return minimum without removing', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.peekMin()).toBe(3);
      expect(pq.size()).toBe(3);
      expect(pq.peekMin()).toBe(3);
    });

    it('should update peekMin after push', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      expect(pq.peekMin()).toBe(5);
      pq.push(3);
      expect(pq.peekMin()).toBe(3);
      pq.push(7);
      expect(pq.peekMin()).toBe(3);
      pq.push(1);
      expect(pq.peekMin()).toBe(1);
    });

    it('should update peekMin after popMin', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.peekMin()).toBe(1);
      pq.popMin();
      expect(pq.peekMin()).toBe(3);
      pq.popMin();
      expect(pq.peekMin()).toBe(5);
    });
  });

  describe('peekMax', () => {
    it('should throw for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(() => pq.peekMax()).toThrow('DoubleEndedPQ is empty');
    });

    it('should return maximum without removing', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.peekMax()).toBe(7);
      expect(pq.size()).toBe(3);
      expect(pq.peekMax()).toBe(7);
    });

    it('should update peekMax after push', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      expect(pq.peekMax()).toBe(5);
      pq.push(3);
      expect(pq.peekMax()).toBe(5);
      pq.push(7);
      expect(pq.peekMax()).toBe(7);
      pq.push(1);
      expect(pq.peekMax()).toBe(7);
      pq.push(9);
      expect(pq.peekMax()).toBe(9);
    });

    it('should update peekMax after popMax', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.peekMax()).toBe(9);
      pq.popMax();
      expect(pq.peekMax()).toBe(7);
      pq.popMax();
      expect(pq.peekMax()).toBe(5);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly through operations', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(pq.size()).toBe(0);
      expect(pq.isEmpty()).toBe(true);
      pq.push(5);
      expect(pq.size()).toBe(1);
      expect(pq.isEmpty()).toBe(false);
      pq.push(3);
      pq.push(7);
      expect(pq.size()).toBe(3);
      pq.popMin();
      expect(pq.size()).toBe(2);
      pq.popMax();
      expect(pq.size()).toBe(1);
      pq.popMin();
      expect(pq.size()).toBe(0);
      expect(pq.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.clear();
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should allow push after clear', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.clear();
      pq.push(7);
      pq.push(1);
      expect(pq.size()).toBe(2);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(7);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(pq.toArray()).toEqual([]);
    });

    it('should return array containing all values', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      const result = pq.toArray();
      expect(result.length).toBe(5);
      expect(result).toContain(1);
      expect(result).toContain(3);
      expect(result).toContain(5);
      expect(result).toContain(7);
      expect(result).toContain(9);
    });

    it('should not modify original priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const sizeBefore = pq.size();
      const minBefore = pq.peekMin();
      const maxBefore = pq.peekMax();
      pq.toArray();
      expect(pq.size()).toBe(sizeBefore);
      expect(pq.peekMin()).toBe(minBefore);
      expect(pq.peekMax()).toBe(maxBefore);
    });

    it('should handle duplicates', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(5);
      pq.push(1);
      pq.push(3);
      const result = pq.toArray();
      expect(result.length).toBe(5);
      expect(result.filter(x => x === 1).length).toBe(1);
      expect(result.filter(x => x === 3).length).toBe(2);
      expect(result.filter(x => x === 5).length).toBe(2);
    });
  });

  describe('toSortedArray', () => {
    it('should return empty array for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(pq.toSortedArray()).toEqual([]);
    });

    it('should return sorted array in ascending order', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      const result = pq.toSortedArray();
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should not modify original priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const sizeBefore = pq.size();
      const minBefore = pq.peekMin();
      const maxBefore = pq.peekMax();
      pq.toSortedArray();
      expect(pq.size()).toBe(sizeBefore);
      expect(pq.peekMin()).toBe(minBefore);
      expect(pq.peekMax()).toBe(maxBefore);
    });

    it('should handle duplicates', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(5);
      pq.push(1);
      pq.push(3);
      const result = pq.toSortedArray();
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });

    it('should sort with custom comparator', async () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a });
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      const result = pq.toSortedArray();
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });
  });

  describe('contains', () => {
    it('should return false for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(pq.contains(5)).toBe(false);
    });

    it('should return true for existing element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.contains(5)).toBe(true);
      expect(pq.contains(3)).toBe(true);
      expect(pq.contains(7)).toBe(true);
    });

    it('should return false for non-existing element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      expect(pq.contains(1)).toBe(false);
      expect(pq.contains(10)).toBe(false);
    });

    it('should work with strings', async () => {
      const pq = new DoubleEndedPQ<string>();
      pq.push('apple');
      pq.push('banana');
      pq.push('cherry');
      expect(pq.contains('apple')).toBe(true);
      expect(pq.contains('banana')).toBe(true);
      expect(pq.contains('date')).toBe(false);
    });

    it('should find duplicate values', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(5);
      expect(pq.contains(5)).toBe(true);
    });

    it('should work with custom comparator', async () => {
      interface Item {
        id: number;
      }
      const pq = new DoubleEndedPQ<Item>({ comparator: (a, b) => a.id - b.id });
      pq.push({ id: 5 });
      pq.push({ id: 3 });
      pq.push({ id: 7 });
      expect(pq.contains({ id: 5 })).toBe(true);
      expect(pq.contains({ id: 3 })).toBe(true);
      expect(pq.contains({ id: 7 })).toBe(true);
      expect(pq.contains({ id: 1 })).toBe(false);
    });
  });

  describe('remove', () => {
    it('should return false for empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      expect(pq.remove(5)).toBe(false);
      expect(pq.size()).toBe(0);
    });

    it('should return false for non-existing element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      expect(pq.remove(1)).toBe(false);
      expect(pq.size()).toBe(2);
    });

    it('should remove single element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      expect(pq.remove(5)).toBe(true);
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should remove element and maintain heap property', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.remove(5)).toBe(true);
      expect(pq.size()).toBe(4);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      expect(result).toEqual([1, 3, 7, 9]);
    });

    it('should remove duplicate values', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(5);
      pq.push(1);
      pq.push(3);
      expect(pq.remove(5)).toBe(true);
      expect(pq.size()).toBe(4);
      expect(pq.remove(5)).toBe(true);
      expect(pq.size()).toBe(3);
      expect(pq.remove(5)).toBe(false);
      expect(pq.size()).toBe(3);
    });

    it('should remove min element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.remove(1)).toBe(true);
      expect(pq.peekMin()).toBe(3);
      expect(pq.size()).toBe(4);
    });

    it('should remove max element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.remove(9)).toBe(true);
      expect(pq.peekMax()).toBe(7);
      expect(pq.size()).toBe(4);
    });
  });

  describe('clone', () => {
    it('should clone empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      const cloned = pq.clone();
      expect(cloned.isEmpty()).toBe(true);
      expect(cloned.size()).toBe(0);
    });

    it('should clone priority queue with elements', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const cloned = pq.clone();
      expect(cloned.size()).toBe(3);
      expect(cloned.peekMin()).toBe(3);
      expect(cloned.peekMax()).toBe(7);
    });

    it('should create independent clone', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const cloned = pq.clone();
      cloned.push(1);
      cloned.popMin();
      expect(pq.size()).toBe(3);
      expect(pq.peekMin()).toBe(3);
      expect(pq.peekMax()).toBe(7);
      expect(cloned.size()).toBe(3);
    });

    it('should clone with same comparator', async () => {
      const pq = new DoubleEndedPQ<number>({ comparator: (a, b) => b - a });
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const cloned = pq.clone();
      cloned.push(1);
      expect(cloned.peekMin()).toBe(7);
      expect(cloned.peekMax()).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      const result: number[] = [];
      pq.forEach(item => result.push(item));
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      const result: number[] = [];
      pq.forEach(item => result.push(item));
      expect(result.length).toBe(5);
      expect(result).toContain(5);
      expect(result).toContain(3);
      expect(result).toContain(7);
      expect(result).toContain(1);
      expect(result).toContain(9);
    });

    it('should not modify priority queue during iteration', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const sizeBefore = pq.size();
      const minBefore = pq.peekMin();
      const maxBefore = pq.peekMax();
      pq.forEach(item => {});
      expect(pq.size()).toBe(sizeBefore);
      expect(pq.peekMin()).toBe(minBefore);
      expect(pq.peekMax()).toBe(maxBefore);
    });

    it('should handle strings', async () => {
      const pq = new DoubleEndedPQ<string>();
      pq.push('apple');
      pq.push('banana');
      pq.push('cherry');
      const result: string[] = [];
      pq.forEach(item => result.push(item));
      expect(result.length).toBe(3);
      expect(result).toContain('apple');
      expect(result).toContain('banana');
      expect(result).toContain('cherry');
    });
  });

  describe('iterator', () => {
    it('should iterate over empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      const result: number[] = [];
      for (const item of pq) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over all elements', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      const result: number[] = [];
      for (const item of pq) {
        result.push(item);
      }
      expect(result.length).toBe(5);
      expect(result).toContain(5);
      expect(result).toContain(3);
      expect(result).toContain(7);
      expect(result).toContain(1);
      expect(result).toContain(9);
    });

    it('should not modify priority queue during iteration', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      const sizeBefore = pq.size();
      const minBefore = pq.peekMin();
      const maxBefore = pq.peekMax();
      for (const item of pq) {}
      expect(pq.size()).toBe(sizeBefore);
      expect(pq.peekMin()).toBe(minBefore);
      expect(pq.peekMax()).toBe(maxBefore);
    });
  });

  describe('fromArray', () => {
    it('should create priority queue from empty array', async () => {
      const pq = DoubleEndedPQ.fromArray<number>([]);
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should create priority queue from single element', async () => {
      const pq = DoubleEndedPQ.fromArray<number>([5]);
      expect(pq.size()).toBe(1);
      expect(pq.peekMin()).toBe(5);
      expect(pq.peekMax()).toBe(5);
    });

    it('should create priority queue from multiple elements', async () => {
      const pq = DoubleEndedPQ.fromArray<number>([5, 3, 7, 1, 9]);
      expect(pq.size()).toBe(5);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(9);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should use default comparator', async () => {
      const pq = DoubleEndedPQ.fromArray<string>(['zebra', 'apple', 'banana']);
      expect(pq.peekMin()).toBe('apple');
      expect(pq.peekMax()).toBe('zebra');
    });

    it('should use custom comparator', async () => {
      const pq = DoubleEndedPQ.fromArray<number>(
        [5, 3, 7, 1, 9],
        { comparator: (a, b) => b - a }
      );
      expect(pq.peekMin()).toBe(9);
      expect(pq.peekMax()).toBe(1);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });

    it('should create priority queue from array with duplicates', async () => {
      const pq = DoubleEndedPQ.fromArray<number>([5, 3, 5, 1, 3]);
      expect(pq.size()).toBe(5);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      expect(result).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('edge cases', () => {
    it('should handle push after complete extraction', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.popMin();
      pq.popMin();
      expect(pq.isEmpty()).toBe(true);
      pq.push(7);
      expect(pq.peekMin()).toBe(7);
      expect(pq.peekMax()).toBe(7);
    });

    it('should handle clear on empty priority queue', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.clear();
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });

    it('should handle negative numbers', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(-5);
      pq.push(3);
      pq.push(-1);
      pq.push(0);
      expect(pq.peekMin()).toBe(-5);
      expect(pq.peekMax()).toBe(3);
    });

    it('should handle zero', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(0);
      pq.push(0);
      pq.push(0);
      expect(pq.size()).toBe(3);
      expect(pq.peekMin()).toBe(0);
      expect(pq.peekMax()).toBe(0);
    });

    it('should handle single element min and max', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(42);
      expect(pq.peekMin()).toBe(42);
      expect(pq.peekMax()).toBe(42);
      expect(pq.popMin()).toBe(42);
      expect(pq.isEmpty()).toBe(true);
    });

    it('should handle two elements', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(3);
      pq.push(7);
      expect(pq.peekMin()).toBe(3);
      expect(pq.peekMax()).toBe(7);
      expect(pq.popMin()).toBe(3);
      expect(pq.peekMin()).toBe(7);
      expect(pq.peekMax()).toBe(7);
    });

    it('should handle remove only element', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      expect(pq.remove(5)).toBe(true);
      expect(pq.isEmpty()).toBe(true);
      expect(pq.size()).toBe(0);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of pushes', async () => {
      const pq = new DoubleEndedPQ<number>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        pq.push(Math.random() * 1000);
      }
      expect(pq.size()).toBe(count);
    });

    it('should maintain heap property with large dataset', async () => {
      const pq = new DoubleEndedPQ<number>();
      const values: number[] = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const value = Math.random() * 1000;
        values.push(value);
        pq.push(value);
      }
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      const sorted = [...values].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });

    it('should create priority queue from large array', async () => {
      const values: number[] = [];
      const count = 10000;
      for (let i = 0; i < count; i++) {
        values.push(Math.random() * 1000);
      }
      const pq = DoubleEndedPQ.fromArray<number>(values);
      expect(pq.size()).toBe(count);
    });

    it('should handle large sequential popMin', async () => {
      const pq = DoubleEndedPQ.fromArray<number>(
        Array.from({ length: 5000 }, () => Math.random() * 1000)
      );
      const count = pq.size();
      let prev: number | null = null;
      for (let i = 0; i < count; i++) {
        const current = pq.popMin();
        if (prev !== null) {
          expect(current >= prev).toBe(true);
        }
        prev = current;
      }
      expect(pq.isEmpty()).toBe(true);
    });

    it('should handle large sequential popMax', async () => {
      const pq = DoubleEndedPQ.fromArray<number>(
        Array.from({ length: 5000 }, () => Math.random() * 1000)
      );
      const count = pq.size();
      let prev: number | null = null;
      for (let i = 0; i < count; i++) {
        const current = pq.popMax();
        if (prev !== null) {
          expect(current <= prev).toBe(true);
        }
        prev = current;
      }
      expect(pq.isEmpty()).toBe(true);
    });
  });

  describe('sequential pop', () => {
    it('should pop all elements in order with popMin', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      pq.push(2);
      pq.push(8);
      pq.push(4);
      pq.push(6);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should pop all elements in order with popMax', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      pq.push(2);
      pq.push(8);
      pq.push(4);
      pq.push(6);
      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMax());
      }
      expect(result).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    });

    it('should maintain heap structure during sequential pop', async () => {
      const pq = new DoubleEndedPQ<number>();
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      for (const value of values) {
        pq.push(value);
      }
      const sorted = [...values].sort((a, b) => a - b);
      for (let i = 0; i < sorted.length; i++) {
        expect(pq.popMin()).toBe(sorted[i]);
        expect(pq.size()).toBe(sorted.length - i - 1);
      }
      expect(pq.isEmpty()).toBe(true);
    });

    it('should handle popMin with interleaved pushes', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      expect(pq.popMin()).toBe(3);
      pq.push(1);
      expect(pq.popMin()).toBe(1);
      pq.push(7);
      pq.push(2);
      expect(pq.popMin()).toBe(2);
      expect(pq.popMin()).toBe(5);
      expect(pq.popMin()).toBe(7);
      expect(pq.isEmpty()).toBe(true);
    });

    it('should handle popMax with interleaved pushes', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(7);
      expect(pq.popMax()).toBe(7);
      pq.push(9);
      expect(pq.popMax()).toBe(9);
      pq.push(3);
      pq.push(2);
      expect(pq.popMax()).toBe(5);
      expect(pq.popMax()).toBe(3);
      expect(pq.popMax()).toBe(2);
      expect(pq.isEmpty()).toBe(true);
    });
  });

  describe('mixed min-max operations', () => {
    it('should handle alternating popMin and popMax', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.popMin()).toBe(1);
      expect(pq.popMax()).toBe(9);
      expect(pq.popMin()).toBe(3);
      expect(pq.popMax()).toBe(7);
      expect(pq.popMin()).toBe(5);
      expect(pq.isEmpty()).toBe(true);
    });

    it('should handle peekMin and peekMax alternation', async () => {
      const pq = new DoubleEndedPQ<number>();
      pq.push(5);
      pq.push(3);
      pq.push(7);
      pq.push(1);
      pq.push(9);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(9);
      expect(pq.peekMin()).toBe(1);
      expect(pq.peekMax()).toBe(9);
      pq.popMin();
      expect(pq.peekMin()).toBe(3);
      expect(pq.peekMax()).toBe(9);
    });

    it('should maintain heap property after complex operations', async () => {
      const pq = new DoubleEndedPQ<number>();
      const values = [15, 3, 9, 2, 8, 7, 1, 10, 4, 6, 5, 14, 13, 11, 12];
      for (const value of values) {
        pq.push(value);
      }

      pq.remove(8);
      pq.remove(1);

      const result: number[] = [];
      while (!pq.isEmpty()) {
        result.push(pq.popMin());
      }

      for (let i = 1; i < result.length; i++) {
        expect(result[i] >= result[i - 1]).toBe(true);
      }
    });
  });
});