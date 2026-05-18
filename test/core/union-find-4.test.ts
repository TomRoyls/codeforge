import { describe, it, expect } from 'vitest'
import { UnionFind4 } from '../../src/core/union-find-4/index.js'

describe('UnionFind4', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates disjoint set with n elements', () => {
      const uf = new UnionFind4(5)
      expect(uf.count()).toBe(5)
      expect(uf.componentCount()).toBe(5)
    })

    it('creates disjoint set with single element', () => {
      const uf = new UnionFind4(1)
      expect(uf.count()).toBe(1)
      expect(uf.componentCount()).toBe(1)
    })

    it('creates disjoint set with 0 elements', () => {
      const uf = new UnionFind4(0)
      expect(uf.count()).toBe(0)
      expect(uf.componentCount()).toBe(0)
    })

    it('creates disjoint set with large n', () => {
      const uf = new UnionFind4(10000)
      expect(uf.count()).toBe(10000)
      expect(uf.componentCount()).toBe(10000)
    })
  })

  // ─── Find ───

  describe('find', () => {
    it('returns element itself when no unions', () => {
      const uf = new UnionFind4(5)
      expect(uf.find(0)).toBe(0)
      expect(uf.find(4)).toBe(4)
    })

    it('returns root after union', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      const root0 = uf.find(0)
      const root1 = uf.find(1)
      expect(root0).toBe(root1)
    })

    it('applies path compression', () => {
      const uf = new UnionFind4(10)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      uf.find(3)
      expect(uf.find(0)).toBe(uf.find(3))
    })
  })

  // ─── Union ───

  describe('union', () => {
    it('merges two separate components', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(4)
    })

    it('does nothing when elements already connected', () => {
      const uf = new UnionFind4(3)
      uf.union(0, 1)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(2)
    })

    it('unites into a single component', () => {
      const uf = new UnionFind4(4)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.componentCount()).toBe(1)
    })

    it('handles chain of unions', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      uf.union(3, 4)
      expect(uf.componentCount()).toBe(1)
      expect(uf.connected(0, 4)).toBe(true)
    })

    it('handles union by rank correctly', () => {
      const uf = new UnionFind4(10)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.componentCount()).toBe(7)
      expect(uf.connected(1, 3)).toBe(true)
    })
  })

  // ─── Connected ───

  describe('connected', () => {
    it('returns false for unconnected elements', () => {
      const uf = new UnionFind4(5)
      expect(uf.connected(0, 1)).toBe(false)
    })

    it('returns true for same element', () => {
      const uf = new UnionFind4(5)
      expect(uf.connected(2, 2)).toBe(true)
    })

    it('returns true after union', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      expect(uf.connected(0, 1)).toBe(true)
    })

    it('returns true for transitive connections', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      uf.union(1, 2)
      expect(uf.connected(0, 2)).toBe(true)
    })

    it('returns false for elements in different components', () => {
      const uf = new UnionFind4(6)
      uf.union(0, 1)
      uf.union(2, 3)
      expect(uf.connected(1, 2)).toBe(false)
      expect(uf.connected(0, 3)).toBe(false)
    })
  })

  // ─── Component Size ───

  describe('componentSize', () => {
    it('returns 1 for singleton components', () => {
      const uf = new UnionFind4(5)
      expect(uf.componentSize(0)).toBe(1)
      expect(uf.componentSize(4)).toBe(1)
    })

    it('returns 2 after union of two singletons', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      expect(uf.componentSize(0)).toBe(2)
      expect(uf.componentSize(1)).toBe(2)
    })

    it('returns correct size for merged components', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.componentSize(0)).toBe(4)
      expect(uf.componentSize(3)).toBe(4)
    })

    it('returns total count when all united', () => {
      const uf = new UnionFind4(10)
      for (let i = 1; i < 10; i++) {
        uf.union(0, i)
      }
      expect(uf.componentSize(0)).toBe(10)
      expect(uf.componentSize(9)).toBe(10)
    })
  })

  // ─── Component Count and Total Count ───

  describe('componentCount and count', () => {
    it('componentCount starts at n', () => {
      const uf = new UnionFind4(5)
      expect(uf.componentCount()).toBe(5)
    })

    it('componentCount decreases with each union', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(4)
      uf.union(2, 3)
      expect(uf.componentCount()).toBe(3)
      uf.union(0, 2)
      expect(uf.componentCount()).toBe(2)
    })

    it('count stays at n regardless of unions', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      uf.union(2, 3)
      expect(uf.count()).toBe(5)
    })

    it('componentCount reaches 1 when fully connected', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      uf.union(3, 4)
      expect(uf.componentCount()).toBe(1)
    })
  })

  // ─── Path Compression and Rank ───

  describe('path compression and union by rank', () => {
    it('path compression flattens tree', () => {
      const uf = new UnionFind4(6)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      uf.union(3, 4)
      uf.find(4)
      expect(uf.connected(0, 4)).toBe(true)
      expect(uf.find(4)).toBe(uf.find(0))
    })

    it('union by rank keeps tree balanced', () => {
      const uf = new UnionFind4(8)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(4, 5)
      uf.union(6, 7)
      uf.union(0, 2)
      uf.union(4, 6)
      uf.union(0, 4)
      expect(uf.componentCount()).toBe(1)
      expect(uf.connected(1, 7)).toBe(true)
    })

    it('handles star topology unions', () => {
      const uf = new UnionFind4(5)
      uf.union(0, 1)
      uf.union(0, 2)
      uf.union(0, 3)
      uf.union(0, 4)
      expect(uf.componentCount()).toBe(1)
      expect(uf.componentSize(0)).toBe(5)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles single element', () => {
      const uf = new UnionFind4(1)
      expect(uf.find(0)).toBe(0)
      expect(uf.connected(0, 0)).toBe(true)
      expect(uf.componentSize(0)).toBe(1)
    })

    it('handles two elements union', () => {
      const uf = new UnionFind4(2)
      uf.union(0, 1)
      expect(uf.connected(0, 1)).toBe(true)
      expect(uf.componentCount()).toBe(1)
      expect(uf.componentSize(0)).toBe(2)
    })

    it('handles repeated union of same pair', () => {
      const uf = new UnionFind4(3)
      uf.union(0, 1)
      uf.union(0, 1)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(2)
    })

    it('handles large n with many unions', () => {
      const uf = new UnionFind4(100)
      for (let i = 1; i < 100; i++) {
        uf.union(0, i)
      }
      expect(uf.componentCount()).toBe(1)
      expect(uf.connected(0, 99)).toBe(true)
      expect(uf.componentSize(50)).toBe(100)
    })

    it('handles alternating union pattern', () => {
      const uf = new UnionFind4(10)
      for (let i = 0; i < 9; i++) {
        uf.union(i, i + 1)
      }
      expect(uf.componentCount()).toBe(1)
      expect(uf.connected(0, 9)).toBe(true)
    })
  })
})
