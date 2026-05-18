import { describe, it, expect } from 'vitest';
import { SplayTree4 } from '../../src/core/splay-tree-4/index.js';

describe('SplayTree4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new SplayTree4<number>();
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });
  });

  // ─── insert ───
  describe('insert', () => {
    it('should insert a single value', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      expect(t.size).toBe(1);
      expect(t.search(5)).toBe(true);
    });

    it('should handle duplicate insertions', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      t.insert(5);
      expect(t.size).toBe(1);
    });

    it('should maintain sorted order', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      t.insert(3);
      t.insert(7);
      t.insert(1);
      t.insert(9);
      expect(t.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should handle negative numbers', () => {
      const t = new SplayTree4<number>();
      t.insert(-5);
      t.insert(0);
      t.insert(5);
      expect(t.toArray()).toEqual([-5, 0, 5]);
    });

    it('should handle string values', () => {
      const t = new SplayTree4<string>();
      t.insert('cherry');
      t.insert('apple');
      t.insert('banana');
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  // ─── search/contains ───
  describe('search/contains', () => {
    it('should find existing value via search', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      expect(t.search(5)).toBe(true);
    });

    it('should find existing value via contains', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      expect(t.contains(5)).toBe(true);
    });

    it('should return false for missing value', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      expect(t.search(3)).toBe(false);
    });

    it('should return false on empty tree', () => {
      const t = new SplayTree4<number>();
      expect(t.search(1)).toBe(false);
    });
  });

  // ─── remove ───
  describe('remove', () => {
    it('should remove a single value', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      expect(t.remove(5)).toBe(true);
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });

    it('should return false for missing value', () => {
      const t = new SplayTree4<number>();
      expect(t.remove(42)).toBe(false);
    });

    it('should remove leaf node', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      t.insert(3);
      t.insert(7);
      t.remove(3);
      expect(t.toArray()).toEqual([5, 7]);
    });

    it('should remove node with two children', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      t.insert(3);
      t.insert(7);
      t.insert(1);
      t.insert(4);
      t.remove(3);
      expect(t.toArray()).toEqual([1, 4, 5, 7]);
    });

    it('should handle deleting all elements', () => {
      const t = new SplayTree4<number>();
      for (let i = 0; i < 5; i++) t.insert(i);
      for (let i = 0; i < 5; i++) expect(t.remove(i)).toBe(true);
      expect(t.size).toBe(0);
    });
  });

  // ─── min/max ───
  describe('min/max', () => {
    it('should return min value', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      t.insert(3);
      t.insert(7);
      expect(t.min()).toBe(3);
    });

    it('should return max value', () => {
      const t = new SplayTree4<number>();
      t.insert(5);
      t.insert(3);
      t.insert(7);
      expect(t.max()).toBe(7);
    });

    it('should return undefined for empty tree', () => {
      const t = new SplayTree4<number>();
      expect(t.min()).toBeUndefined();
      expect(t.max()).toBeUndefined();
    });
  });

  // ─── predecessor/successor ───
  describe('predecessor/successor', () => {
    it('should return predecessor', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      t.insert(3);
      t.insert(5);
      expect(t.predecessor(3)).toBe(1);
      expect(t.predecessor(5)).toBe(3);
    });

    it('should return successor', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      t.insert(3);
      t.insert(5);
      expect(t.successor(1)).toBe(3);
      expect(t.successor(3)).toBe(5);
    });

    it('should return undefined at boundaries', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      t.insert(3);
      expect(t.predecessor(1)).toBeUndefined();
      expect(t.successor(3)).toBeUndefined();
    });
  });

  // ─── rank/select ───
  describe('rank/select', () => {
    it('should return correct rank (0-based)', () => {
      const t = new SplayTree4<number>();
      t.insert(10);
      t.insert(20);
      t.insert(30);
      expect(t.rank(10)).toBe(0);
      expect(t.rank(20)).toBe(1);
      expect(t.rank(30)).toBe(2);
    });

    it('should return -1 for missing value', () => {
      const t = new SplayTree4<number>();
      expect(t.rank(99)).toBe(-1);
    });

    it('should select kth smallest (0-based)', () => {
      const t = new SplayTree4<number>();
      t.insert(30);
      t.insert(10);
      t.insert(20);
      expect(t.select(0)).toBe(10);
      expect(t.select(1)).toBe(20);
      expect(t.select(2)).toBe(30);
    });

    it('should return undefined for out of range', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      expect(t.select(-1)).toBeUndefined();
      expect(t.select(1)).toBeUndefined();
    });
  });

  // ─── rangeSearch ───
  describe('rangeSearch', () => {
    it('should find values in range', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      t.insert(5);
      t.insert(3);
      t.insert(7);
      t.insert(9);
      expect(t.rangeSearch(3, 7)).toEqual([3, 5, 7]);
    });

    it('should return empty for no matches', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      t.insert(10);
      expect(t.rangeSearch(3, 7)).toEqual([]);
    });
  });

  // ─── forEach ───
  describe('forEach', () => {
    it('should iterate in order', () => {
      const t = new SplayTree4<number>();
      t.insert(3);
      t.insert(1);
      t.insert(2);
      const result: number[] = [];
      t.forEach((v) => result.push(v));
      expect(result).toEqual([1, 2, 3]);
    });
  });

  // ─── height ───
  describe('height', () => {
    it('should return 0 for empty tree', () => {
      const t = new SplayTree4<number>();
      expect(t.height()).toBe(0);
    });

    it('should return 1 for single node', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      expect(t.height()).toBe(1);
    });
  });

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should mention amortized O(log n)', () => {
      const t = new SplayTree4<number>();
      const tc = t.getTimeComplexity();
      expect(typeof tc).toBe('string');
      expect(tc.length).toBeGreaterThan(0);
    });
  });

  // ─── clear ───
  describe('clear', () => {
    it('should clear all elements', () => {
      const t = new SplayTree4<number>();
      t.insert(1);
      t.insert(2);
      t.insert(3);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });
  });
});
