import { describe, it, expect } from 'vitest';
import { LinkedHashSet } from '../../src/core/linked-hash-set-2/index.js';

describe('LinkedHashSet', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates empty set', () => {
      const set = new LinkedHashSet<number>();
      expect(set.size()).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });
  });

  // ─── add ───

  describe('add', () => {
    it('adds a single element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      expect(set.size()).toBe(1);
      expect(set.has(1)).toBe(true);
    });

    it('adds multiple elements', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.size()).toBe(3);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
    });

    it('ignores duplicate elements', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(1);
      set.add(1);
      expect(set.size()).toBe(1);
    });

    it('maintains insertion order', () => {
      const set = new LinkedHashSet<number>();
      set.add(3);
      set.add(1);
      set.add(2);
      expect(set.values()).toEqual([3, 1, 2]);
    });

    it('handles string elements', () => {
      const set = new LinkedHashSet<string>();
      set.add('hello');
      set.add('world');
      expect(set.size()).toBe(2);
      expect(set.has('hello')).toBe(true);
      expect(set.has('world')).toBe(true);
    });

    it('handles negative numbers', () => {
      const set = new LinkedHashSet<number>();
      set.add(-1);
      set.add(-2);
      expect(set.size()).toBe(2);
      expect(set.has(-1)).toBe(true);
    });

    it('handles zero', () => {
      const set = new LinkedHashSet<number>();
      set.add(0);
      expect(set.has(0)).toBe(true);
    });

    it('adding existing element does not change order', () => {
      const set = new LinkedHashSet<string>();
      set.add('a');
      set.add('b');
      set.add('c');
      set.add('b');
      expect(set.values()).toEqual(['a', 'b', 'c']);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('removes an existing element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.delete(2)).toBe(true);
      expect(set.size()).toBe(2);
      expect(set.has(2)).toBe(false);
    });

    it('returns false for non-existent element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      expect(set.delete(99)).toBe(false);
      expect(set.size()).toBe(1);
    });

    it('returns false on empty set', () => {
      const set = new LinkedHashSet<number>();
      expect(set.delete(1)).toBe(false);
    });

    it('removes first element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(1);
      expect(set.values()).toEqual([2, 3]);
      expect(set.first()).toBe(2);
    });

    it('removes last element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(3);
      expect(set.values()).toEqual([1, 2]);
      expect(set.last()).toBe(2);
    });

    it('removes middle element', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.values()).toEqual([1, 3]);
    });

    it('removes single element from set', () => {
      const set = new LinkedHashSet<number>();
      set.add(42);
      set.delete(42);
      expect(set.isEmpty()).toBe(true);
      expect(set.first()).toBeUndefined();
      expect(set.last()).toBeUndefined();
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns false for empty set', () => {
      const set = new LinkedHashSet<number>();
      expect(set.has(1)).toBe(false);
    });

    it('returns true for existing element', () => {
      const set = new LinkedHashSet<string>();
      set.add('hello');
      expect(set.has('hello')).toBe(true);
    });

    it('returns false after deletion', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.delete(1);
      expect(set.has(1)).toBe(false);
    });
  });

  // ─── size / isEmpty ───

  describe('size / isEmpty', () => {
    it('size is 0 for empty set', () => {
      const set = new LinkedHashSet<number>();
      expect(set.size()).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('size reflects additions and deletions', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      expect(set.size()).toBe(2);
      expect(set.isEmpty()).toBe(false);
      set.delete(1);
      expect(set.size()).toBe(1);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('clears all elements', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.clear();
      expect(set.isEmpty()).toBe(true);
      expect(set.size()).toBe(0);
    });

    it('clear on empty set is no-op', () => {
      const set = new LinkedHashSet<number>();
      set.clear();
      expect(set.isEmpty()).toBe(true);
    });
  });

  // ─── values ───

  describe('values', () => {
    it('returns empty array for empty set', () => {
      const set = new LinkedHashSet<number>();
      expect(set.values()).toEqual([]);
    });

    it('returns elements in insertion order', () => {
      const set = new LinkedHashSet<string>();
      set.add('c');
      set.add('a');
      set.add('b');
      expect(set.values()).toEqual(['c', 'a', 'b']);
    });
  });

  // ─── first / last ───

  describe('first / last', () => {
    it('returns undefined for empty set', () => {
      const set = new LinkedHashSet<number>();
      expect(set.first()).toBeUndefined();
      expect(set.last()).toBeUndefined();
    });

    it('returns first inserted element', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      expect(set.first()).toBe(10);
    });

    it('returns last inserted element', () => {
      const set = new LinkedHashSet<number>();
      set.add(10);
      set.add(20);
      set.add(30);
      expect(set.last()).toBe(30);
    });

    it('updates first after deletion', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.delete(1);
      expect(set.first()).toBe(2);
    });

    it('updates last after deletion', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.delete(2);
      expect(set.last()).toBe(1);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates in insertion order', () => {
      const set = new LinkedHashSet<number>();
      set.add(3);
      set.add(1);
      set.add(2);
      const collected: number[] = [];
      set.forEach((v) => collected.push(v));
      expect(collected).toEqual([3, 1, 2]);
    });

    it('does not iterate on empty set', () => {
      const set = new LinkedHashSet<number>();
      let count = 0;
      set.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  // ─── toArray ───

  describe('toArray', () => {
    it('returns same as values', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.toArray()).toEqual(set.values());
    });

    it('returns empty array for empty set', () => {
      const set = new LinkedHashSet<number>();
      expect(set.toArray()).toEqual([]);
    });
  });

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity info', () => {
      const set = new LinkedHashSet<number>();
      const tc = set.getTimeComplexity();
      expect(tc).toBeDefined();
      expect(typeof tc).toBe('object');
      expect(tc).toHaveProperty('add', 'O(1)');
      expect(tc).toHaveProperty('delete', 'O(1)');
      expect(tc).toHaveProperty('has', 'O(1)');
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles mixed add and delete operations', () => {
      const set = new LinkedHashSet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      set.add(4);
      set.delete(1);
      expect(set.values()).toEqual([3, 4]);
    });

    it('handles re-adding deleted element', () => {
      const set = new LinkedHashSet<string>();
      set.add('a');
      set.add('b');
      set.delete('a');
      set.add('a');
      expect(set.values()).toEqual(['b', 'a']);
      expect(set.size()).toBe(2);
    });

    it('handles boolean-like values', () => {
      const set = new LinkedHashSet<number>();
      set.add(0);
      set.add(1);
      expect(set.has(0)).toBe(true);
      expect(set.has(1)).toBe(true);
    });
  });
});
