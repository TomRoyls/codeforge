import { describe, it, expect } from 'vitest';
import { UnionFind4 } from '../src/core/union-find-4/index.js';

describe('UnionFind4', () => {
  it('constructor creates n elements', () => {
    const uf = new UnionFind4(10);
    expect(uf.count()).toBe(10);
    expect(uf.componentCount()).toBe(10);
  });

  it('find returns root of element', () => {
    const uf = new UnionFind4(5);
    expect(uf.find(0)).toBe(0);
    expect(uf.find(4)).toBe(4);
  });

  it('find with path compression flattens tree', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(1, 2);
    uf.union(2, 3);
    uf.union(3, 4);

    uf.find(0);
    uf.find(4);

    expect(uf.connected(0, 4)).toBe(true);
  });

  it('union merges two components', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    expect(uf.connected(0, 1)).toBe(true);
    expect(uf.componentCount()).toBe(4);
  });

  it('union does nothing if already connected', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(1, 2);

    const countBefore = uf.componentCount();
    uf.union(0, 2);
    expect(uf.componentCount()).toBe(countBefore);
  });

  it('connected returns true for same component', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(1, 2);
    expect(uf.connected(0, 2)).toBe(true);
  });

  it('connected returns false for different components', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    expect(uf.connected(0, 2)).toBe(false);
  });

  it('componentSize returns size of component', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(1, 2);
    expect(uf.componentSize(0)).toBe(3);
    expect(uf.componentSize(2)).toBe(3);
    expect(uf.componentSize(3)).toBe(1);
  });

  it('componentCount tracks number of components', () => {
    const uf = new UnionFind4(5);
    expect(uf.componentCount()).toBe(5);

    uf.union(0, 1);
    expect(uf.componentCount()).toBe(4);

    uf.union(2, 3);
    expect(uf.componentCount()).toBe(3);

    uf.union(0, 2);
    expect(uf.componentCount()).toBe(2);
  });

  it('count returns total number of elements', () => {
    const uf = new UnionFind4(10);
    expect(uf.count()).toBe(10);
    uf.union(0, 1);
    expect(uf.count()).toBe(10);
  });

  it('large union operations perform efficiently', () => {
    const n = 10000;
    const uf = new UnionFind4(n);

    for (let i = 0; i < n - 1; i++) {
      uf.union(i, i + 1);
    }

    expect(uf.componentCount()).toBe(1);
    expect(uf.componentSize(0)).toBe(n);
    expect(uf.connected(0, n - 1)).toBe(true);
  });

  it('union by rank creates balanced trees', () => {
    const uf = new UnionFind4(100);

    for (let i = 0; i < 50; i++) {
      uf.union(i, 50 + i);
    }

    expect(uf.componentCount()).toBe(50);
  });

  it('find with non-root element after multiple unions', () => {
    const uf = new UnionFind4(10);
    uf.union(0, 1);
    uf.union(2, 3);
    uf.union(4, 5);
    uf.union(1, 3);
    uf.union(3, 5);

    expect(uf.find(0)).toBe(uf.find(5));
    expect(uf.componentSize(0)).toBe(6);
  });

  it('connected returns true for same component', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(2, 3);
    expect(uf.connected(0, 1)).toBe(true);
    expect(uf.connected(2, 3)).toBe(true);
    expect(uf.connected(0, 2)).toBe(false);
    expect(uf.connected(0, 4)).toBe(false);
  });

  it('transitive connectivity', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(1, 2);
    uf.union(2, 3);
    expect(uf.connected(0, 3)).toBe(true);
    expect(uf.connected(0, 4)).toBe(false);
  });

  it('self-union is no-op', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 0);
    expect(uf.componentCount()).toBe(5);
  });

  it('repeated union of same pair', () => {
    const uf = new UnionFind4(3);
    uf.union(0, 1);
    uf.union(0, 1);
    uf.union(0, 1);
    expect(uf.connected(0, 1)).toBe(true);
    expect(uf.componentSize(0)).toBe(2);
  });

  it('single element', () => {
    const uf = new UnionFind4(1);
    expect(uf.find(0)).toBe(0);
    expect(uf.componentSize(0)).toBe(1);
    expect(uf.componentCount()).toBe(1);
    expect(uf.connected(0, 0)).toBe(true);
  });

  it('all elements in one component', () => {
    const uf = new UnionFind4(10);
    for (let i = 1; i < 10; i++) {
      uf.union(0, i);
    }
    expect(uf.componentCount()).toBe(1);
    expect(uf.componentSize(0)).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(uf.connected(0, i)).toBe(true);
    }
  });

  it('should return correct count', () => {
    const uf = new UnionFind4(5);
    expect(uf.count()).toBe(5);
  });

  it('should handle componentSize on isolated elements', () => {
    const uf = new UnionFind4(5);
    for (let i = 0; i < 5; i++) {
      expect(uf.componentSize(i)).toBe(1);
    }
  });

  it('should handle union of same element', () => {
    const uf = new UnionFind4(3);
    uf.union(1, 1);
    expect(uf.componentSize(1)).toBe(1);
    expect(uf.componentCount()).toBe(3);
  });

  it('should track componentCount correctly across unions', () => {
    const uf = new UnionFind4(5);
    expect(uf.componentCount()).toBe(5);
    uf.union(0, 1);
    expect(uf.componentCount()).toBe(4);
    uf.union(2, 3);
    expect(uf.componentCount()).toBe(3);
    uf.union(0, 2);
    expect(uf.componentCount()).toBe(2);
    uf.union(4, 0);
    expect(uf.componentCount()).toBe(1);
  });

  it('should handle repeated unions of same set', () => {
    const uf = new UnionFind4(3);
    uf.union(0, 1);
    uf.union(0, 1);
    uf.union(1, 0);
    expect(uf.componentCount()).toBe(2);
    expect(uf.componentSize(0)).toBe(2);
  });

  it('should handle two separate components merging', () => {
    const uf = new UnionFind4(6);
    uf.union(0, 1);
    uf.union(2, 3);
    uf.union(4, 5);
    expect(uf.componentCount()).toBe(3);
    uf.union(1, 2);
    expect(uf.componentCount()).toBe(2);
    expect(uf.connected(0, 3)).toBe(true);
    expect(uf.connected(4, 5)).toBe(true);
    expect(uf.connected(0, 4)).toBe(false);
  });

  it('should handle componentSize after multiple merges', () => {
    const uf = new UnionFind4(8);
    uf.union(0, 1);
    uf.union(2, 3);
    uf.union(4, 5);
    uf.union(6, 7);
    uf.union(0, 2);
    uf.union(4, 6);
    expect(uf.componentSize(0)).toBe(4);
    expect(uf.componentSize(4)).toBe(4);
    uf.union(0, 4);
    expect(uf.componentSize(0)).toBe(8);
    expect(uf.componentCount()).toBe(1);
  });

  it('should handle large star topology union', () => {
    const uf = new UnionFind4(100);
    for (let i = 1; i < 100; i++) {
      uf.union(0, i);
    }
    expect(uf.componentCount()).toBe(1);
    expect(uf.componentSize(0)).toBe(100);
    expect(uf.connected(0, 99)).toBe(true);
  });

  it('should handle find on unmodified element', () => {
    const uf = new UnionFind4(10);
    uf.union(0, 1);
    uf.union(2, 3);
    expect(uf.find(5)).toBe(5);
    expect(uf.find(9)).toBe(9);
  });

  it('should handle union of same element', () => {
    const uf = new UnionFind4(5);
    uf.union(2, 2);
    expect(uf.componentCount()).toBe(5);
    expect(uf.find(2)).toBe(2);
  });

  it('should handle sequential union chain', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(1, 2);
    uf.union(2, 3);
    uf.union(3, 4);
    expect(uf.componentCount()).toBe(1);
    expect(uf.connected(0, 4)).toBe(true);
  });

  it('should handle initial state', () => {
    const uf = new UnionFind4(5);
    expect(uf.componentCount()).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(uf.find(i)).toBe(i);
      expect(uf.componentSize(i)).toBe(1);
    }
  });

  it('should handle count as total elements not components', () => {
    const uf = new UnionFind4(4);
    expect(uf.count()).toBe(4);
    uf.union(0, 1);
    expect(uf.count()).toBe(4);
    expect(uf.componentCount()).toBe(3);
  });

  it('should handle self-union', () => {
    const uf = new UnionFind4(3);
    uf.union(0, 0);
    expect(uf.connected(0, 0)).toBe(true);
    expect(uf.componentCount()).toBe(3);
  });

  it('should handle componentSize', () => {
    const uf = new UnionFind4(5);
    uf.union(0, 1);
    uf.union(0, 2);
    expect(uf.componentSize(0)).toBe(3);
    expect(uf.componentSize(3)).toBe(1);
  });
});
