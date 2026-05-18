import { describe, it, expect } from 'vitest';
import { DisjointSet3 } from '../../src/core/disjoint-set-3/index.js';

describe('DisjointSet3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty disjoint set', () => {
      const ds = new DisjointSet3();
      expect(ds.count()).toBe(0);
    });
  });

  // ─── makeSet ───
  describe('makeSet', () => {
    it('should create a new set with one element', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      expect(ds.count()).toBe(1);
    });

    it('should create multiple disjoint sets', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.makeSet('c');
      expect(ds.count()).toBe(3);
    });

    it('should not create duplicate set for same item', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('a');
      expect(ds.count()).toBe(1);
    });
  });

  // ─── find ───
  describe('find', () => {
    it('should return the item itself as its own root', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      expect(ds.find('a')).toBe('a');
    });

    it('should throw for non-existent item', () => {
      const ds = new DisjointSet3();
      expect(() => ds.find('z')).toThrow('Item z not found');
    });

    it('should return same root for connected items', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.union('a', 'b');
      expect(ds.find('a')).toBe(ds.find('b'));
    });
  });

  // ─── union ───
  describe('union', () => {
    it('should merge two disjoint sets', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.union('a', 'b');
      expect(ds.count()).toBe(1);
      expect(ds.connected('a', 'b')).toBe(true);
    });

    it('should not change count when unioning same set', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.union('a', 'b');
      ds.union('a', 'b');
      expect(ds.count()).toBe(1);
    });

    it('should handle union chain', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.makeSet('c');
      ds.makeSet('d');
      ds.union('a', 'b');
      ds.union('c', 'd');
      ds.union('a', 'c');
      expect(ds.count()).toBe(1);
      expect(ds.connected('b', 'd')).toBe(true);
    });

    it('should handle union by rank correctly', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.makeSet('c');
      ds.union('a', 'b');
      ds.union('b', 'c');
      expect(ds.connected('a', 'c')).toBe(true);
      expect(ds.count()).toBe(1);
    });
  });

  // ─── connected ───
  describe('connected', () => {
    it('should return false for disconnected items', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      expect(ds.connected('a', 'b')).toBe(false);
    });

    it('should return true for items in same set', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.union('a', 'b');
      expect(ds.connected('a', 'b')).toBe(true);
    });

    it('should return true for item compared with itself', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      expect(ds.connected('a', 'a')).toBe(true);
    });
  });

  // ─── setSize ───
  describe('setSize', () => {
    it('should return 1 for a standalone item', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      expect(ds.setSize('a')).toBe(1);
    });

    it('should return combined size after union', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.makeSet('c');
      ds.union('a', 'b');
      expect(ds.setSize('a')).toBe(2);
      expect(ds.setSize('b')).toBe(2);
      ds.union('a', 'c');
      expect(ds.setSize('a')).toBe(3);
    });
  });

  // ─── count ───
  describe('count', () => {
    it('should track number of disjoint sets', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.makeSet('c');
      expect(ds.count()).toBe(3);
      ds.union('a', 'b');
      expect(ds.count()).toBe(2);
      ds.union('a', 'c');
      expect(ds.count()).toBe(1);
    });
  });

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('should handle single element set', () => {
      const ds = new DisjointSet3();
      ds.makeSet('solo');
      expect(ds.find('solo')).toBe('solo');
      expect(ds.connected('solo', 'solo')).toBe(true);
      expect(ds.setSize('solo')).toBe(1);
    });

    it('should handle numeric string keys', () => {
      const ds = new DisjointSet3();
      ds.makeSet('1');
      ds.makeSet('2');
      ds.union('1', '2');
      expect(ds.connected('1', '2')).toBe(true);
    });

    it('should handle path compression', () => {
      const ds = new DisjointSet3();
      ds.makeSet('a');
      ds.makeSet('b');
      ds.makeSet('c');
      ds.makeSet('d');
      ds.union('a', 'b');
      ds.union('b', 'c');
      ds.union('c', 'd');
      expect(ds.connected('a', 'd')).toBe(true);
      expect(ds.setSize('a')).toBe(4);
    });

    it('should handle many elements', () => {
      const ds = new DisjointSet3();
      for (let i = 0; i < 100; i++) {
        ds.makeSet(`item-${i}`);
      }
      expect(ds.count()).toBe(100);
      for (let i = 1; i < 100; i++) {
        ds.union('item-0', `item-${i}`);
      }
      expect(ds.count()).toBe(1);
      expect(ds.setSize('item-50')).toBe(100);
    });
  });
});
