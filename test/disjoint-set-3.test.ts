import { describe, it, expect } from 'vitest';
import { DisjointSet3 } from '../src/core/disjoint-set-3/index.js';

describe('DisjointSet3', () => {
  it('should create empty disjoint set', () => {
    const ds = new DisjointSet3();
    expect(ds.count()).toBe(0);
  });

  it('should create individual sets with makeSet', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    expect(ds.count()).toBe(3);
  });

  it('should not create duplicate sets', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('a');
    expect(ds.count()).toBe(1);
  });

  it('should find root of single element set', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    expect(ds.find('a')).toBe('a');
  });

  it('should find root after union', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.union('a', 'b');
    const rootA = ds.find('a');
    const rootB = ds.find('b');
    expect(rootA).toBe(rootB);
  });

  it('should apply path compression during find', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.union('a', 'b');
    ds.union('b', 'c');
    const root = ds.find('a');
    expect(root).toBe(ds.find('b'));
    expect(root).toBe(ds.find('c'));
  });

  it('should union two sets', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.union('a', 'b');
    expect(ds.count()).toBe(1);
  });

  it('should union sets with union by rank', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.union('a', 'b');
    ds.union('a', 'c');
    expect(ds.count()).toBe(1);
  });

  it('should not decrease count when unioning same set', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.union('a', 'b');
    const countAfterFirst = ds.count();
    ds.union('a', 'b');
    expect(ds.count()).toBe(countAfterFirst);
  });

  it('should return true for connected elements', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.union('a', 'b');
    expect(ds.connected('a', 'b')).toBe(true);
  });

  it('should return false for disconnected elements', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    expect(ds.connected('a', 'b')).toBe(false);
  });

  it('should return true for same set after union', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.union('a', 'b');
    ds.union('b', 'c');
    expect(ds.connected('a', 'c')).toBe(true);
    expect(ds.connected('b', 'c')).toBe(true);
  });

  it('should return false for different sets', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.union('a', 'b');
    expect(ds.connected('a', 'c')).toBe(false);
    expect(ds.connected('b', 'c')).toBe(false);
  });

  it('should track size of individual set', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    expect(ds.setSize('a')).toBe(1);
  });

  it('should track size after union', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.union('a', 'b');
    ds.union('a', 'c');
    expect(ds.setSize('a')).toBe(3);
    expect(ds.setSize('b')).toBe(3);
    expect(ds.setSize('c')).toBe(3);
  });

  it('should track size for multiple disjoint sets', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.makeSet('d');
    ds.union('a', 'b');
    ds.union('c', 'd');
    expect(ds.setSize('a')).toBe(2);
    expect(ds.setSize('c')).toBe(2);
  });

  it('should return correct count of disjoint sets', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    expect(ds.count()).toBe(3);
    ds.union('a', 'b');
    expect(ds.count()).toBe(2);
    ds.union('b', 'c');
    expect(ds.count()).toBe(1);
  });

  it('should handle chain unions', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.makeSet('d');
    ds.makeSet('e');
    ds.union('a', 'b');
    ds.union('b', 'c');
    ds.union('c', 'd');
    ds.union('d', 'e');
    expect(ds.setSize('a')).toBe(5);
    expect(ds.connected('a', 'e')).toBe(true);
    expect(ds.count()).toBe(1);
  });

  it('should handle multiple independent sets', () => {
    const ds = new DisjointSet3();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.makeSet('d');
    ds.makeSet('e');
    ds.makeSet('f');
    ds.union('a', 'b');
    ds.union('c', 'd');
    ds.union('e', 'f');
    expect(ds.count()).toBe(3);
    expect(ds.connected('a', 'b')).toBe(true);
    expect(ds.connected('c', 'd')).toBe(true);
    expect(ds.connected('e', 'f')).toBe(true);
    expect(ds.connected('a', 'c')).toBe(false);
  });

  it('should handle transitive connections', () => {
    const ds = new DisjointSet3<number>();
    ds.makeSet(1);
    ds.makeSet(2);
    ds.makeSet(3);
    ds.union(1, 2);
    ds.union(2, 3);
    expect(ds.connected(1, 3)).toBe(true);
    expect(ds.count()).toBe(1);
  });

  it('should handle self-union', () => {
    const ds = new DisjointSet3<number>();
    ds.makeSet(1);
    ds.union(1, 1);
    expect(ds.count()).toBe(1);
    expect(ds.connected(1, 1)).toBe(true);
  });

  it('should handle union of already connected', () => {
    const ds = new DisjointSet3<number>();
    ds.makeSet(1);
    ds.makeSet(2);
    ds.union(1, 2);
    ds.union(1, 2);
    expect(ds.count()).toBe(1);
  });

  it('should handle large set of elements', () => {
    const ds = new DisjointSet3<number>();
    for (let i = 0; i < 100; i++) {
      ds.makeSet(i);
    }
    expect(ds.count()).toBe(100);
    for (let i = 0; i < 99; i++) {
      ds.union(i, i + 1);
    }
    expect(ds.count()).toBe(1);
    expect(ds.setSize(0)).toBe(100);
  });

  it('should maintain connected after find', () => {
    const ds = new DisjointSet3<string>();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.union('a', 'b');
    ds.find('a');
    expect(ds.connected('a', 'b')).toBe(true);
    expect(ds.connected('a', 'c')).toBe(false);
  });

  it('should handle star topology union', () => {
    const ds = new DisjointSet3<string>();
    ds.makeSet('center');
    for (let i = 0; i < 5; i++) {
      ds.makeSet(`node-${i}`);
      ds.union('center', `node-${i}`);
    }
    expect(ds.count()).toBe(1);
    expect(ds.setSize('center')).toBe(6);
    for (let i = 0; i < 5; i++) {
      expect(ds.connected('center', `node-${i}`)).toBe(true);
    }
  });

  it('should handle binary tree union pattern', () => {
    const ds = new DisjointSet3<number>();
    const n = 8;
    for (let i = 0; i < n; i++) ds.makeSet(i);
    for (let i = 0; i < n; i += 2) ds.union(i, i + 1);
    expect(ds.count()).toBe(n / 2);
  });

  it('should handle large number of elements', () => {
    const ds = new DisjointSet3<number>();
    for (let i = 0; i < 100; i++) {
      ds.makeSet(i);
    }
    expect(ds.count()).toBe(100);
    for (let i = 0; i < 99; i++) {
      ds.union(i, i + 1);
    }
    expect(ds.count()).toBe(1);
    expect(ds.connected(0, 99)).toBe(true);
    expect(ds.setSize(50)).toBe(100);
  });

  it('should connect all into one set', () => {
    const ds = new DisjointSet3<string>();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.makeSet('d');
    ds.union('a', 'b');
    ds.union('c', 'd');
    ds.union('a', 'c');
    expect(ds.count()).toBe(1);
    expect(ds.connected('b', 'd')).toBe(true);
    expect(ds.setSize('a')).toBe(4);
  });

  it('should track size correctly through unions', () => {
    const ds = new DisjointSet3<string>();
    ds.makeSet('a');
    ds.makeSet('b');
    ds.makeSet('c');
    ds.union('a', 'b');
    expect(ds.setSize('a')).toBe(2);
    ds.union('a', 'c');
    expect(ds.setSize('a')).toBe(3);
  });

  it('should handle repeated makeSet idempotently', () => {
    const ds = new DisjointSet3<string>();
    ds.makeSet('x');
    ds.makeSet('x');
    ds.makeSet('x');
    expect(ds.count()).toBe(1);
    expect(ds.find('x')).toBe('x');
    expect(ds.setSize('x')).toBe(1);
  });

  it('should handle connected on same element', () => {
    const ds = new DisjointSet3<string>();
    ds.makeSet('a');
    expect(ds.connected('a', 'a')).toBe(true);
  });
});
