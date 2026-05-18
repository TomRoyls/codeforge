import { describe, expect, it } from 'vitest'
import { UnionFind } from '../../../src/utils/union-find.js'

describe('UnionFind', () => {
  describe('constructor', () => {
    it('should create an empty UnionFind', () => {
      const uf = new UnionFind()
      expect(uf.elementCount).toBe(0)
      expect(uf.setCount).toBe(0)
      expect(uf.isEmpty).toBe(true)
    })

    it('should create UnionFind with initial capacity', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      expect(uf.elementCount).toBe(5)
      expect(uf.setCount).toBe(5)
      expect(uf.isEmpty).toBe(false)
    })

    it('should handle zero initial capacity', () => {
      const uf = new UnionFind({ initialCapacity: 0 })
      expect(uf.elementCount).toBe(0)
      expect(uf.setCount).toBe(0)
    })
  })

  describe('makeSet', () => {
    it('should create a new singleton set and return its id', () => {
      const uf = new UnionFind()
      expect(uf.makeSet()).toBe(0)
      expect(uf.makeSet()).toBe(1)
      expect(uf.makeSet()).toBe(2)
      expect(uf.elementCount).toBe(3)
      expect(uf.setCount).toBe(3)
    })

    it('should create independent sets', () => {
      const uf = new UnionFind()
      uf.makeSet()
      uf.makeSet()
      expect(uf.connected(0, 1)).toBe(false)
    })
  })

  describe('find', () => {
    it('should return the root of a singleton set', () => {
      const uf = new UnionFind()
      uf.makeSet()
      expect(uf.find(0)).toBe(0)
    })

    it('should return the root after union', () => {
      const uf = new UnionFind()
      uf.makeSet()
      uf.makeSet()
      uf.union(0, 1)
      const root = uf.find(0)
      expect(root).toBe(uf.find(1))
    })

    it('should throw for invalid index', () => {
      const uf = new UnionFind()
      uf.makeSet()
      expect(() => uf.find(-1)).toThrow(RangeError)
      expect(() => uf.find(5)).toThrow(RangeError)
    })

    it('should use path compression', () => {
      const uf = new UnionFind({ initialCapacity: 10 })
      for (let i = 1; i < 10; i++) uf.union(0, i)
      uf.find(9)
      const stats = uf.getStatistics()
      expect(stats.maxDepth).toBeLessThanOrEqual(2)
    })
  })

  describe('union', () => {
    it('should merge two separate sets', () => {
      const uf = new UnionFind()
      uf.makeSet()
      uf.makeSet()
      expect(uf.union(0, 1)).toBe(true)
      expect(uf.setCount).toBe(1)
      expect(uf.connected(0, 1)).toBe(true)
    })

    it('should return false when already connected', () => {
      const uf = new UnionFind()
      uf.makeSet()
      uf.makeSet()
      uf.union(0, 1)
      expect(uf.union(0, 1)).toBe(false)
      expect(uf.union(1, 0)).toBe(false)
    })

    it('should throw for invalid indices', () => {
      const uf = new UnionFind()
      uf.makeSet()
      expect(() => uf.union(0, 5)).toThrow(RangeError)
      expect(() => uf.union(-1, 0)).toThrow(RangeError)
    })

    it('should handle union of element with itself', () => {
      const uf = new UnionFind()
      uf.makeSet()
      expect(uf.union(0, 0)).toBe(false)
    })

    it('should handle chained unions', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(1, 2)
      expect(uf.setCount).toBe(2)
      expect(uf.connected(0, 3)).toBe(true)
      expect(uf.connected(0, 4)).toBe(false)
    })

    it('should use union by rank', () => {
      const uf = new UnionFind({ initialCapacity: 100 })
      for (let i = 1; i < 100; i++) uf.union(0, i)
      expect(uf.setCount).toBe(1)
      for (let i = 0; i < 100; i++) {
        expect(uf.connected(0, i)).toBe(true)
      }
    })
  })

  describe('connected', () => {
    it('should return true for same element', () => {
      const uf = new UnionFind()
      uf.makeSet()
      expect(uf.connected(0, 0)).toBe(true)
    })

    it('should return false for separate sets', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      expect(uf.connected(0, 1)).toBe(false)
      expect(uf.connected(0, 2)).toBe(false)
      expect(uf.connected(1, 2)).toBe(false)
    })

    it('should return true after union', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      uf.union(0, 1)
      expect(uf.connected(0, 1)).toBe(true)
      expect(uf.connected(1, 0)).toBe(true)
      expect(uf.connected(0, 2)).toBe(false)
    })

    it('should throw for invalid index', () => {
      const uf = new UnionFind()
      uf.makeSet()
      expect(() => uf.connected(0, 5)).toThrow(RangeError)
    })
  })

  describe('getComponentSize', () => {
    it('should return 1 for singleton', () => {
      const uf = new UnionFind()
      uf.makeSet()
      expect(uf.getComponentSize(0)).toBe(1)
    })

    it('should increase after unions', () => {
      const uf = new UnionFind({ initialCapacity: 4 })
      uf.union(0, 1)
      expect(uf.getComponentSize(0)).toBe(2)
      expect(uf.getComponentSize(1)).toBe(2)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.getComponentSize(0)).toBe(4)
    })
  })

  describe('getComponentMembers', () => {
    it('should return single element for singleton', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      expect(uf.getComponentMembers(0)).toEqual([0])
    })

    it('should return all connected members', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      uf.union(0, 1)
      uf.union(0, 2)
      const members = uf.getComponentMembers(0).sort()
      expect(members).toEqual([0, 1, 2])
    })
  })

  describe('getSize', () => {
    it('should alias getComponentSize', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      uf.union(0, 1)
      expect(uf.getSize(0)).toBe(uf.getComponentSize(0))
      expect(uf.getSize(2)).toBe(1)
    })
  })

  describe('elementCount', () => {
    it('should track total elements', () => {
      const uf = new UnionFind()
      expect(uf.elementCount).toBe(0)
      uf.makeSet()
      uf.makeSet()
      uf.makeSet()
      expect(uf.elementCount).toBe(3)
    })
  })

  describe('setCount', () => {
    it('should decrease on union', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      expect(uf.setCount).toBe(5)
      uf.union(0, 1)
      expect(uf.setCount).toBe(4)
      uf.union(2, 3)
      expect(uf.setCount).toBe(3)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      uf.union(0, 1)
      uf.clear()
      expect(uf.elementCount).toBe(0)
      expect(uf.setCount).toBe(0)
      expect(uf.isEmpty).toBe(true)
    })

    it('should allow new makeSet after clear', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      uf.clear()
      uf.makeSet()
      expect(uf.elementCount).toBe(1)
    })
  })

  describe('reset', () => {
    it('should separate all elements back into singletons', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.setCount).toBe(2)
      uf.reset()
      expect(uf.setCount).toBe(5)
      expect(uf.connected(0, 1)).toBe(false)
    })

    it('should preserve element count', () => {
      const uf = new UnionFind({ initialCapacity: 10 })
      uf.union(0, 1)
      uf.reset()
      expect(uf.elementCount).toBe(10)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty UnionFind', () => {
      const uf = new UnionFind()
      expect(uf.toArray()).toEqual([])
    })

    it('should return all singleton groups', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      const groups = uf.toArray()
      expect(groups).toEqual([[0], [1], [2]])
    })

    it('should return merged groups', () => {
      const uf = new UnionFind({ initialCapacity: 4 })
      uf.union(0, 1)
      uf.union(2, 3)
      const groups = uf.toArray().map((g) => g.sort()).sort((a, b) => a[0]! - b[0]!)
      expect(groups).toEqual([[0, 1], [2, 3]])
    })
  })

  describe('getRoots', () => {
    it('should return all roots when all separate', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      expect(uf.getRoots().sort()).toEqual([0, 1, 2])
    })

    it('should return fewer roots after unions', () => {
      const uf = new UnionFind({ initialCapacity: 4 })
      uf.union(0, 1)
      uf.union(2, 3)
      expect(uf.getRoots().length).toBe(2)
    })

    it('should return single root when all connected', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      for (let i = 1; i < 5; i++) uf.union(0, i)
      expect(uf.getRoots().length).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      const stats = uf.getStatistics()
      expect(stats.elementCount).toBe(5)
      expect(stats.setCount).toBe(5)
      expect(stats.findOperations).toBe(0)
      expect(stats.unionOperations).toBe(0)
      expect(stats.maxDepth).toBe(0)
    })

    it('should track operations', () => {
      const uf = new UnionFind({ initialCapacity: 5 })
      uf.union(0, 1)
      uf.find(0)
      const stats = uf.getStatistics()
      expect(stats.unionOperations).toBeGreaterThan(0)
      expect(stats.findOperations).toBeGreaterThan(0)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      uf.union(0, 1)
      const copy = uf.clone()
      expect(copy.elementCount).toBe(3)
      expect(copy.connected(0, 1)).toBe(true)
      expect(copy.connected(0, 2)).toBe(false)
    })

    it('should not affect original when modified', () => {
      const uf = new UnionFind({ initialCapacity: 3 })
      uf.union(0, 1)
      const copy = uf.clone()
      copy.union(0, 2)
      expect(uf.connected(0, 2)).toBe(false)
      expect(copy.connected(0, 2)).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('should handle many unions correctly', () => {
      const n = 200
      const uf = new UnionFind({ initialCapacity: n })
      for (let i = 1; i < n; i++) uf.union(0, i)
      expect(uf.setCount).toBe(1)
      for (let i = 0; i < n; i++) {
        expect(uf.connected(0, i)).toBe(true)
      }
      expect(uf.getComponentSize(0)).toBe(n)
    })

    it('should handle alternating union pattern', () => {
      const uf = new UnionFind({ initialCapacity: 100 })
      for (let i = 0; i < 50; i++) uf.union(i, 99 - i)
      expect(uf.connected(0, 99)).toBe(true)
      expect(uf.connected(25, 74)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle makeSet after unions', () => {
      const uf = new UnionFind({ initialCapacity: 2 })
      uf.union(0, 1)
      const newId = uf.makeSet()
      expect(newId).toBe(2)
      expect(uf.elementCount).toBe(3)
      expect(uf.setCount).toBe(2)
      expect(uf.connected(0, 2)).toBe(false)
    })

    it('should handle empty UnionFind operations', () => {
      const uf = new UnionFind()
      expect(uf.isEmpty).toBe(true)
      expect(uf.toArray()).toEqual([])
      expect(uf.getRoots()).toEqual([])
    })
  })
})
