import { describe, it, expect } from 'vitest'
import { DisjointSetUnion } from '../src/utils/disjoint-set-union.js'

describe('DisjointSetUnion', () => {
  describe('constructor', () => {
    it('should create a DSU with 0 elements', () => {
      const dsu = new DisjointSetUnion(0)
      expect(dsu.componentCount).toBe(0)
    })

    it('should create a DSU with 1 element', () => {
      const dsu = new DisjointSetUnion(1)
      expect(dsu.componentCount).toBe(1)
      expect(dsu.find(0)).toBe(0)
    })

    it('should create a DSU with 5 elements', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.componentCount).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(dsu.find(i)).toBe(i)
      }
    })

    it('should throw error for negative n', () => {
      expect(() => new DisjointSetUnion(-1)).toThrow(RangeError)
      expect(() => new DisjointSetUnion(-5)).toThrow(RangeError)
    })

    it('should throw error for non-integer n', () => {
      expect(() => new DisjointSetUnion(2.5)).toThrow(RangeError)
      expect(() => new DisjointSetUnion(3.14)).toThrow(RangeError)
    })

    it('should throw error for Infinity', () => {
      expect(() => new DisjointSetUnion(Infinity)).toThrow(RangeError)
    })

    it('should throw error for NaN', () => {
      expect(() => new DisjointSetUnion(NaN)).toThrow(RangeError)
    })
  })

  describe('find', () => {
    it('should return the element itself for a new DSU', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.find(0)).toBe(0)
      expect(dsu.find(2)).toBe(2)
      expect(dsu.find(4)).toBe(4)
    })

    it('should throw error for out-of-bounds negative index', () => {
      const dsu = new DisjointSetUnion(5)
      expect(() => dsu.find(-1)).toThrow(RangeError)
    })

    it('should throw error for out-of-bounds index equal to n', () => {
      const dsu = new DisjointSetUnion(5)
      expect(() => dsu.find(5)).toThrow(RangeError)
    })

    it('should throw error for out-of-bounds index greater than n', () => {
      const dsu = new DisjointSetUnion(5)
      expect(() => dsu.find(10)).toThrow(RangeError)
    })

    it('should find root after union operations', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      expect(dsu.find(0)).toBe(dsu.find(2))
      expect(dsu.find(1)).toBe(dsu.find(2))
    })

    it('should perform path compression', () => {
      const dsu = new DisjointSetUnion(10)
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(1, 2)

      const root = dsu.find(0)
      expect(dsu.find(1)).toBe(root)
      expect(dsu.find(2)).toBe(root)
      expect(dsu.find(3)).toBe(root)
    })
  })

  describe('union', () => {
    it('should return true when unioning different sets', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.union(0, 1)).toBe(true)
    })

    it('should return false when unioning same set', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      expect(dsu.union(0, 1)).toBe(false)
      expect(dsu.union(1, 0)).toBe(false)
    })

    it('should merge components correctly', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.find(0)).toBe(dsu.find(1))
    })

    it('should chain unions correctly', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      dsu.union(2, 3)

      expect(dsu.connected(0, 3)).toBe(true)
      expect(dsu.find(0)).toBe(dsu.find(3))
    })

    it('should use union by rank to keep tree balanced', () => {
      const dsu = new DisjointSetUnion(10)

      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(4, 5)
      dsu.union(6, 7)

      dsu.union(0, 2)
      dsu.union(4, 6)
      dsu.union(0, 4)

      expect(dsu.connected(0, 7)).toBe(true)
    })

    it('should throw error for out-of-bounds index', () => {
      const dsu = new DisjointSetUnion(5)
      expect(() => dsu.union(-1, 0)).toThrow(RangeError)
      expect(() => dsu.union(0, 5)).toThrow(RangeError)
    })

    it('should handle multiple independent components', () => {
      const dsu = new DisjointSetUnion(10)
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(4, 5)

      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(2, 3)).toBe(true)
      expect(dsu.connected(4, 5)).toBe(true)
      expect(dsu.connected(0, 2)).toBe(false)
      expect(dsu.connected(1, 4)).toBe(false)
    })
  })

  describe('connected', () => {
    it('should return false for different elements in a new DSU', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.connected(0, 1)).toBe(false)
      expect(dsu.connected(2, 3)).toBe(false)
    })

    it('should return true for the same element', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.connected(0, 0)).toBe(true)
      expect(dsu.connected(2, 2)).toBe(true)
    })

    it('should return true after union', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(1, 0)).toBe(true)
    })

    it('should return true for transitive connections', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      expect(dsu.connected(0, 2)).toBe(true)
    })

    it('should throw error for out-of-bounds index', () => {
      const dsu = new DisjointSetUnion(5)
      expect(() => dsu.connected(-1, 0)).toThrow(RangeError)
      expect(() => dsu.connected(0, 5)).toThrow(RangeError)
    })
  })

  describe('setSize', () => {
    it('should return 1 for each element in a new DSU', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.setSize(0)).toBe(1)
      expect(dsu.setSize(2)).toBe(1)
      expect(dsu.setSize(4)).toBe(1)
    })

    it('should return correct size after union', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      expect(dsu.setSize(0)).toBe(2)
      expect(dsu.setSize(1)).toBe(2)
    })

    it('should return correct size for chained unions', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      expect(dsu.setSize(0)).toBe(3)
      expect(dsu.setSize(1)).toBe(3)
      expect(dsu.setSize(2)).toBe(3)
    })

    it('should maintain independent component sizes', () => {
      const dsu = new DisjointSetUnion(10)
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(4, 5)
      dsu.union(6, 7)
      dsu.union(8, 9)

      expect(dsu.setSize(0)).toBe(2)
      expect(dsu.setSize(2)).toBe(2)
      expect(dsu.setSize(4)).toBe(2)
      expect(dsu.setSize(6)).toBe(2)
      expect(dsu.setSize(8)).toBe(2)
    })

    it('should throw error for out-of-bounds index', () => {
      const dsu = new DisjointSetUnion(5)
      expect(() => dsu.setSize(-1)).toThrow(RangeError)
      expect(() => dsu.setSize(5)).toThrow(RangeError)
    })
  })

  describe('rank', () => {
    it('should return 0 for each element in a new DSU', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.rank(0)).toBe(0)
      expect(dsu.rank(2)).toBe(0)
    })

    it('should increase rank when merging equal rank trees', () => {
      const dsu = new DisjointSetUnion(10)
      dsu.union(0, 1)
      const rankAfterFirstUnion = dsu.rank(0)
      expect(rankAfterFirstUnion).toBeGreaterThanOrEqual(0)

      dsu.union(2, 3)
      dsu.union(0, 2)
      expect(dsu.rank(0)).toBeGreaterThan(rankAfterFirstUnion)
    })

    it('should return same rank for all elements in same component', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      const rootRank = dsu.rank(0)
      expect(dsu.rank(1)).toBe(rootRank)
      expect(dsu.rank(2)).toBe(rootRank)
    })

    it('should throw error for out-of-bounds index', () => {
      const dsu = new DisjointSetUnion(5)
      expect(() => dsu.rank(-1)).toThrow(RangeError)
      expect(() => dsu.rank(5)).toThrow(RangeError)
    })
  })

  describe('componentCount', () => {
    it('should return n for a new DSU with n elements', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.componentCount).toBe(5)
    })

    it('should decrement on successful union', () => {
      const dsu = new DisjointSetUnion(5)
      const initial = dsu.componentCount
      dsu.union(0, 1)
      expect(dsu.componentCount).toBe(initial - 1)
    })

    it('should remain unchanged on same-set union', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      const count = dsu.componentCount
      dsu.union(0, 1)
      expect(dsu.componentCount).toBe(count)
    })

    it('should track multiple unions correctly', () => {
      const dsu = new DisjointSetUnion(10)
      expect(dsu.componentCount).toBe(10)

      dsu.union(0, 1)
      expect(dsu.componentCount).toBe(9)

      dsu.union(2, 3)
      expect(dsu.componentCount).toBe(8)

      dsu.union(0, 2)
      expect(dsu.componentCount).toBe(7)

      dsu.union(4, 5)
      expect(dsu.componentCount).toBe(6)

      dsu.union(0, 4)
      expect(dsu.componentCount).toBe(5)
    })

    it('should return 0 for empty DSU', () => {
      const dsu = new DisjointSetUnion(0)
      expect(dsu.componentCount).toBe(0)
    })
  })

  describe('reset', () => {
    it('should restore all elements to their own set', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      dsu.union(1, 2)
      dsu.union(3, 4)

      dsu.reset()

      for (let i = 0; i < 5; i++) {
        expect(dsu.find(i)).toBe(i)
        expect(dsu.setSize(i)).toBe(1)
      }
      expect(dsu.componentCount).toBe(5)
    })

    it('should reset after multiple operations', () => {
      const dsu = new DisjointSetUnion(10)
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(0, 2)
      dsu.union(4, 5)
      dsu.union(6, 7)
      dsu.union(4, 6)

      dsu.reset()

      expect(dsu.componentCount).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(dsu.find(i)).toBe(i)
      }
    })

    it('should allow operations after reset', () => {
      const dsu = new DisjointSetUnion(5)
      dsu.union(0, 1)
      dsu.union(1, 2)

      dsu.reset()

      dsu.union(0, 2)
      expect(dsu.connected(0, 2)).toBe(true)
      expect(dsu.componentCount).toBe(4)
    })
  })

  describe('larger sets (10+ elements)', () => {
    it('should handle unions efficiently with 15 elements', () => {
      const dsu = new DisjointSetUnion(15)

      for (let i = 0; i < 14; i += 2) {
        dsu.union(i, i + 1)
      }

      for (let i = 0; i < 14; i += 2) {
        expect(dsu.setSize(i)).toBe(2)
      }

      expect(dsu.componentCount).toBe(8)
    })

    it('should handle complex union patterns with 20 elements', () => {
      const dsu = new DisjointSetUnion(20)

      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(4, 5)
      dsu.union(6, 7)
      dsu.union(8, 9)

      dsu.union(0, 2)
      dsu.union(4, 6)
      dsu.union(0, 4)

      dsu.union(10, 11)
      dsu.union(12, 13)
      dsu.union(10, 12)

      dsu.union(0, 10)

      expect(dsu.connected(0, 13)).toBe(true)
      expect(dsu.setSize(0)).toBe(12)
    })

    it('should handle many sequential unions', () => {
      const dsu = new DisjointSetUnion(25)

      for (let i = 0; i < 24; i++) {
        dsu.union(i, i + 1)
      }

      expect(dsu.connected(0, 24)).toBe(true)
      expect(dsu.setSize(0)).toBe(25)
      expect(dsu.componentCount).toBe(1)
    })

    it('should verify rank-based optimization with many elements', () => {
      const dsu = new DisjointSetUnion(30)

      for (let i = 0; i < 15; i++) {
        dsu.union(i, i + 15)
      }

      for (let i = 0; i < 14; i += 2) {
        dsu.union(i, i + 1)
      }

      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(0, 15)).toBe(true)
      expect(dsu.connected(1, 16)).toBe(true)

      expect(dsu.componentCount).toBe(8)
    })
  })

  describe('edge cases', () => {
    it('should handle union of same element', () => {
      const dsu = new DisjointSetUnion(5)
      expect(dsu.union(0, 0)).toBe(false)
      expect(dsu.componentCount).toBe(5)
    })

    it('should handle single element DSU', () => {
      const dsu = new DisjointSetUnion(1)
      expect(dsu.find(0)).toBe(0)
      expect(dsu.setSize(0)).toBe(1)
      expect(dsu.rank(0)).toBe(0)
      expect(dsu.connected(0, 0)).toBe(true)
    })

    it('should handle empty DSU', () => {
      const dsu = new DisjointSetUnion(0)
      expect(dsu.componentCount).toBe(0)
      dsu.reset()
      expect(dsu.componentCount).toBe(0)
    })
  })
})