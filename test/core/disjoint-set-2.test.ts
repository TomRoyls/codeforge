import { describe, it, expect } from 'vitest'
import { DisjointSet } from '../../src/core/disjoint-set-2/index.js'

describe('DisjointSet', () => {
  describe('constructor', () => {
    it('creates empty disjoint set', () => {
      const ds = new DisjointSet<number>()
      expect(ds.size).toBe(0)
      expect(ds.isEmpty()).toBe(true)
    })

    it('creates with options', () => {
      const ds = new DisjointSet<number>({ initialCapacity: 100 })
      expect(ds.size).toBe(0)
      expect(ds.isEmpty()).toBe(true)
    })

    it('creates without options', () => {
      const ds = new DisjointSet<string>()
      expect(ds.size).toBe(0)
    })

    it('can work with string elements', () => {
      const ds = new DisjointSet<string>()
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.size).toBe(2)
    })

    it('can work with number elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      expect(ds.size).toBe(2)
    })

    it('can work with object elements', () => {
      const ds = new DisjointSet<{ id: number }>()
      const a = { id: 1 }
      const b = { id: 2 }
      ds.makeSet(a)
      ds.makeSet(b)
      expect(ds.size).toBe(2)
    })
  })

  describe('makeSet', () => {
    it('adds a single element', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.size).toBe(1)
      expect(ds.isEmpty()).toBe(false)
    })

    it('adds multiple elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      expect(ds.size).toBe(3)
    })

    it('ignores duplicate elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(1)
      ds.makeSet(1)
      expect(ds.size).toBe(1)
    })

    it('element is its own parent after makeSet', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(5)
      expect(ds.find(5)).toBe(5)
    })

    it('handles zero as element', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(0)
      expect(ds.size).toBe(1)
      expect(ds.find(0)).toBe(0)
    })

    it('handles negative numbers', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(-1)
      ds.makeSet(-42)
      expect(ds.size).toBe(2)
      expect(ds.find(-1)).toBe(-1)
    })

    it('handles string elements', () => {
      const ds = new DisjointSet<string>()
      ds.makeSet('hello')
      ds.makeSet('world')
      expect(ds.size).toBe(2)
    })

    it('handles empty string element', () => {
      const ds = new DisjointSet<string>()
      ds.makeSet('')
      expect(ds.size).toBe(1)
      expect(ds.find('')).toBe('')
    })

    it('handles null-like values (NaN)', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(NaN)
      ds.makeSet(NaN)
      expect(ds.size).toBe(1)
    })
  })

  describe('find', () => {
    it('finds root of singleton set', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.find(1)).toBe(1)
    })

    it('returns undefined for non-existent element', () => {
      const ds = new DisjointSet<number>()
      expect(ds.find(99)).toBeUndefined()
    })

    it('finds root after union', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.union(1, 2)
      const root = ds.find(1)
      expect(root).toBe(ds.find(2))
    })

    it('returns same root for all elements in same component', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      expect(ds.find(1)).toBe(ds.find(2))
      expect(ds.find(2)).toBe(ds.find(3))
      expect(ds.find(1)).toBe(ds.find(3))
    })

    it('compresses path', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 10; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 10; i++) {
        ds.union(0, i)
      }
      const root = ds.find(9)
      expect(root).toBeDefined()
      expect(ds.connected(9, 0)).toBe(true)
    })

    it('finds correct root after many unions', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 100; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 100; i++) {
        ds.union(0, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(ds.find(i)).toBe(ds.find(0))
      }
    })
  })

  describe('union', () => {
    it('unions two separate sets', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      const result = ds.union(1, 2)
      expect(result).toBe(true)
      expect(ds.connected(1, 2)).toBe(true)
    })

    it('returns false for already connected elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.union(1, 2)
      const result = ds.union(1, 2)
      expect(result).toBe(false)
    })

    it('returns false for same element (self-union)', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      const result = ds.union(1, 1)
      expect(result).toBe(false)
    })

    it('returns false for non-existent element', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      const result = ds.union(1, 99)
      expect(result).toBe(false)
    })

    it('returns false when both elements do not exist', () => {
      const ds = new DisjointSet<number>()
      const result = ds.union(1, 2)
      expect(result).toBe(false)
    })

    it('unions three elements into one component', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      expect(ds.connected(1, 3)).toBe(true)
      expect(ds.componentCount()).toBe(1)
    })

    it('unions by rank correctly (smaller into larger)', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.makeSet(4)
      ds.union(1, 2)
      ds.union(3, 4)
      ds.union(1, 3)
      expect(ds.connected(2, 4)).toBe(true)
      expect(ds.componentCount()).toBe(1)
    })

    it('handles chain of unions', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 50; i++) {
        ds.makeSet(i)
      }
      for (let i = 0; i < 49; i++) {
        ds.union(i, i + 1)
      }
      expect(ds.componentCount()).toBe(1)
      expect(ds.connected(0, 49)).toBe(true)
    })

    it('handles star pattern unions', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 50; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 50; i++) {
        ds.union(0, i)
      }
      expect(ds.componentCount()).toBe(1)
      for (let i = 1; i < 50; i++) {
        expect(ds.connected(0, i)).toBe(true)
      }
    })

    it('unions string elements', () => {
      const ds = new DisjointSet<string>()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      expect(ds.connected('a', 'c')).toBe(true)
    })
  })

  describe('connected', () => {
    it('returns false for unconnected elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      expect(ds.connected(1, 2)).toBe(false)
    })

    it('returns true after union', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.union(1, 2)
      expect(ds.connected(1, 2)).toBe(true)
    })

    it('returns false for non-existent elements', () => {
      const ds = new DisjointSet<number>()
      expect(ds.connected(1, 2)).toBe(false)
    })

    it('returns false when one element does not exist', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.connected(1, 99)).toBe(false)
    })

    it('element is connected to itself', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.connected(1, 1)).toBe(true)
    })

    it('transitive connectivity', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      expect(ds.connected(1, 3)).toBe(true)
    })

    it('handles multiple separate components', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 6; i++) {
        ds.makeSet(i)
      }
      ds.union(0, 1)
      ds.union(2, 3)
      ds.union(4, 5)
      expect(ds.connected(0, 1)).toBe(true)
      expect(ds.connected(2, 3)).toBe(true)
      expect(ds.connected(4, 5)).toBe(true)
      expect(ds.connected(0, 2)).toBe(false)
      expect(ds.connected(0, 4)).toBe(false)
      expect(ds.connected(2, 4)).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.has(1)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const ds = new DisjointSet<number>()
      expect(ds.has(1)).toBe(false)
    })

    it('returns true after multiple makeSet calls', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      expect(ds.has(2)).toBe(true)
    })
  })

  describe('componentCount', () => {
    it('returns 0 for empty set', () => {
      const ds = new DisjointSet<number>()
      expect(ds.componentCount()).toBe(0)
    })

    it('returns 1 for single element', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.componentCount()).toBe(1)
    })

    it('returns n for n separate elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      expect(ds.componentCount()).toBe(3)
    })

    it('decreases after union', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      expect(ds.componentCount()).toBe(2)
      ds.union(2, 3)
      expect(ds.componentCount()).toBe(1)
    })

    it('does not decrease for redundant union', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.union(1, 2)
      expect(ds.componentCount()).toBe(1)
      ds.union(1, 2)
      expect(ds.componentCount()).toBe(1)
    })

    it('returns correct count for mixed components', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 10; i++) {
        ds.makeSet(i)
      }
      ds.union(0, 1)
      ds.union(2, 3)
      ds.union(4, 5)
      ds.union(6, 7)
      expect(ds.componentCount()).toBe(6)
    })
  })

  describe('getComponent', () => {
    it('returns single element for singleton', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.getComponent(1)).toEqual([1])
    })

    it('returns empty array for non-existent element', () => {
      const ds = new DisjointSet<number>()
      expect(ds.getComponent(99)).toEqual([])
    })

    it('returns all elements in same component', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      const comp = ds.getComponent(1)
      expect(comp).toHaveLength(3)
      expect(comp.sort()).toEqual([1, 2, 3])
    })

    it('returns only elements in the same component', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 6; i++) {
        ds.makeSet(i)
      }
      ds.union(0, 1)
      ds.union(2, 3)
      ds.union(4, 5)
      expect(ds.getComponent(0).sort()).toEqual([0, 1])
      expect(ds.getComponent(2).sort()).toEqual([2, 3])
      expect(ds.getComponent(4).sort()).toEqual([4, 5])
    })

    it('returns same result regardless of which element is queried', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      const comp1 = ds.getComponent(1).sort()
      const comp2 = ds.getComponent(2).sort()
      const comp3 = ds.getComponent(3).sort()
      expect(comp1).toEqual(comp2)
      expect(comp2).toEqual(comp3)
    })
  })

  describe('getAllComponents', () => {
    it('returns empty array for empty set', () => {
      const ds = new DisjointSet<number>()
      expect(ds.getAllComponents()).toEqual([])
    })

    it('returns single component for single element', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      const comps = ds.getAllComponents()
      expect(comps).toHaveLength(1)
      expect(comps[0]!).toEqual([1])
    })

    it('returns separate components for unconnected elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      const comps = ds.getAllComponents()
      expect(comps).toHaveLength(3)
    })

    it('returns merged components after union', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      const comps = ds.getAllComponents()
      expect(comps).toHaveLength(1)
      expect(comps[0]!.sort()).toEqual([1, 2, 3])
    })

    it('returns correct components for mixed state', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 6; i++) {
        ds.makeSet(i)
      }
      ds.union(0, 1)
      ds.union(2, 3)
      const comps = ds.getAllComponents()
      expect(comps).toHaveLength(4)
      const sizes = comps.map(c => c.length).sort()
      expect(sizes).toEqual([1, 1, 2, 2])
    })
  })

  describe('getComponentSize', () => {
    it('returns 0 for non-existent element', () => {
      const ds = new DisjointSet<number>()
      expect(ds.getComponentSize(1)).toBe(0)
    })

    it('returns 1 for singleton', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.getComponentSize(1)).toBe(1)
    })

    it('returns correct size after unions', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      expect(ds.getComponentSize(1)).toBe(3)
      expect(ds.getComponentSize(2)).toBe(3)
      expect(ds.getComponentSize(3)).toBe(3)
    })

    it('returns different sizes for different components', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 5; i++) {
        ds.makeSet(i)
      }
      ds.union(0, 1)
      ds.union(1, 2)
      expect(ds.getComponentSize(0)).toBe(3)
      expect(ds.getComponentSize(3)).toBe(1)
      expect(ds.getComponentSize(4)).toBe(1)
    })
  })

  describe('getStats', () => {
    it('returns empty stats for empty set', () => {
      const ds = new DisjointSet<number>()
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(0)
      expect(stats.componentCount).toBe(0)
      expect(stats.maxComponentSize).toBe(0)
      expect(stats.minComponentSize).toBe(0)
      expect(stats.avgComponentSize).toBe(0)
    })

    it('returns correct stats for single element', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(1)
      expect(stats.componentCount).toBe(1)
      expect(stats.maxComponentSize).toBe(1)
      expect(stats.minComponentSize).toBe(1)
      expect(stats.avgComponentSize).toBe(1)
    })

    it('returns correct stats after unions', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 6; i++) {
        ds.makeSet(i)
      }
      ds.union(0, 1)
      ds.union(2, 3)
      ds.union(3, 4)
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(6)
      expect(stats.componentCount).toBe(3)
      expect(stats.maxComponentSize).toBe(3)
      expect(stats.minComponentSize).toBe(1)
    })

    it('returns all equal sizes when fully merged', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 5; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 5; i++) {
        ds.union(0, i)
      }
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(5)
      expect(stats.componentCount).toBe(1)
      expect(stats.maxComponentSize).toBe(5)
      expect(stats.minComponentSize).toBe(5)
      expect(stats.avgComponentSize).toBe(5)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.clear()
      expect(ds.size).toBe(0)
      expect(ds.isEmpty()).toBe(true)
      expect(ds.componentCount()).toBe(0)
    })

    it('allows adding elements after clear', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.clear()
      ds.makeSet(2)
      expect(ds.size).toBe(1)
      expect(ds.find(2)).toBe(2)
    })

    it('old elements are gone after clear', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.clear()
      expect(ds.find(1)).toBeUndefined()
      expect(ds.has(1)).toBe(false)
    })

    it('clear on empty set is no-op', () => {
      const ds = new DisjointSet<number>()
      ds.clear()
      expect(ds.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const ds = new DisjointSet<number>()
      expect(ds.toArray()).toEqual([])
    })

    it('returns all elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      expect(ds.toArray().sort()).toEqual([1, 2, 3])
    })

    it('returns elements after unions', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.union(1, 2)
      expect(ds.toArray().sort()).toEqual([1, 2])
    })
  })

  describe('isEmpty', () => {
    it('returns true for new set', () => {
      const ds = new DisjointSet<number>()
      expect(ds.isEmpty()).toBe(true)
    })

    it('returns false after makeSet', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.clear()
      expect(ds.isEmpty()).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones empty set', () => {
      const ds = new DisjointSet<number>()
      const cl = ds.clone()
      expect(cl.size).toBe(0)
    })

    it('clones with all elements', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      const cl = ds.clone()
      expect(cl.size).toBe(3)
      expect(cl.has(1)).toBe(true)
      expect(cl.has(2)).toBe(true)
      expect(cl.has(3)).toBe(true)
    })

    it('clones with union structure preserved', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      ds.union(1, 2)
      ds.union(2, 3)
      const cl = ds.clone()
      expect(cl.connected(1, 3)).toBe(true)
      expect(cl.componentCount()).toBe(1)
    })

    it('clone is independent', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      const cl = ds.clone()
      cl.union(1, 2)
      expect(ds.connected(1, 2)).toBe(false)
      expect(cl.connected(1, 2)).toBe(true)
    })

    it('modifying clone does not affect original', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      const cl = ds.clone()
      cl.makeSet(2)
      expect(ds.size).toBe(1)
      expect(cl.size).toBe(2)
    })

    it('clearing clone does not affect original', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      const cl = ds.clone()
      cl.clear()
      expect(ds.size).toBe(2)
      expect(cl.size).toBe(0)
    })
  })

  describe('static from', () => {
    it('creates from array', () => {
      const ds = DisjointSet.from([1, 2, 3])
      expect(ds.size).toBe(3)
      expect(ds.componentCount()).toBe(3)
    })

    it('creates from empty array', () => {
      const ds = DisjointSet.from([])
      expect(ds.size).toBe(0)
    })

    it('creates from single element', () => {
      const ds = DisjointSet.from([42])
      expect(ds.size).toBe(1)
      expect(ds.find(42)).toBe(42)
    })

    it('creates from string array', () => {
      const ds = DisjointSet.from(['a', 'b', 'c'])
      expect(ds.size).toBe(3)
      expect(ds.componentCount()).toBe(3)
    })

    it('creates from set', () => {
      const ds = DisjointSet.from(new Set([1, 2, 3]))
      expect(ds.size).toBe(3)
    })

    it('ignores duplicates from iterable', () => {
      const ds = DisjointSet.from([1, 1, 2, 2, 3])
      expect(ds.size).toBe(3)
    })

    it('elements are not connected initially', () => {
      const ds = DisjointSet.from([1, 2, 3])
      expect(ds.connected(1, 2)).toBe(false)
      expect(ds.connected(2, 3)).toBe(false)
    })

    it('supports chaining with union after from', () => {
      const ds = DisjointSet.from([1, 2, 3, 4, 5])
      ds.union(1, 2)
      ds.union(3, 4)
      ds.union(1, 5)
      expect(ds.componentCount()).toBe(2)
      expect(ds.connected(1, 5)).toBe(true)
      expect(ds.connected(3, 4)).toBe(true)
      expect(ds.connected(1, 3)).toBe(false)
    })

    it('creates from generator', () => {
      function* gen() {
        yield 1
        yield 2
        yield 3
      }
      const ds = DisjointSet.from(gen())
      expect(ds.size).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('single element - self connectivity', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.connected(1, 1)).toBe(true)
    })

    it('self-union does nothing', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.union(1, 1)).toBe(false)
      expect(ds.componentCount()).toBe(1)
    })

    it('find on non-existent returns undefined', () => {
      const ds = new DisjointSet<number>()
      expect(ds.find(42)).toBeUndefined()
    })

    it('union with non-existent returns false', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.union(1, 999)).toBe(false)
      expect(ds.union(999, 1)).toBe(false)
    })

    it('connected with non-existent returns false', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      expect(ds.connected(1, 999)).toBe(false)
      expect(ds.connected(999, 1)).toBe(false)
      expect(ds.connected(998, 999)).toBe(false)
    })

    it('many unions produce single component', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 1000; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 1000; i++) {
        ds.union(0, i)
      }
      expect(ds.componentCount()).toBe(1)
      expect(ds.getComponentSize(0)).toBe(1000)
    })

    it('large batch alternating unions', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 200; i++) {
        ds.makeSet(i)
      }
      for (let i = 0; i < 100; i++) {
        ds.union(i * 2, i * 2 + 1)
      }
      expect(ds.componentCount()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(ds.connected(i * 2, i * 2 + 1)).toBe(true)
      }
    })

    it('path compression is effective after deep chains', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 500; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 500; i++) {
        ds.union(i - 1, i)
      }
      expect(ds.connected(0, 499)).toBe(true)
      expect(ds.componentCount()).toBe(1)
    })

    it('handles union of two large components', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 200; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 100; i++) {
        ds.union(0, i)
      }
      for (let i = 101; i < 200; i++) {
        ds.union(100, i)
      }
      expect(ds.componentCount()).toBe(2)
      ds.union(0, 100)
      expect(ds.componentCount()).toBe(1)
      expect(ds.connected(1, 199)).toBe(true)
    })

    it('works with boolean map keys', () => {
      const ds = new DisjointSet<boolean>()
      ds.makeSet(true)
      ds.makeSet(false)
      expect(ds.size).toBe(2)
      ds.union(true, false)
      expect(ds.connected(true, false)).toBe(true)
    })

    it('works with bigint elements', () => {
      const ds = new DisjointSet<bigint>()
      ds.makeSet(1n)
      ds.makeSet(2n)
      ds.makeSet(3n)
      ds.union(1n, 2n)
      expect(ds.connected(1n, 2n)).toBe(true)
      expect(ds.connected(1n, 3n)).toBe(false)
    })

    it('repeated union calls are idempotent', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.union(1, 2)
      for (let i = 0; i < 10; i++) {
        expect(ds.union(1, 2)).toBe(false)
        expect(ds.union(2, 1)).toBe(false)
      }
      expect(ds.componentCount()).toBe(1)
    })

    it('correctly handles two-component divide', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 20; i++) {
        ds.makeSet(i)
      }
      for (let i = 0; i < 10; i++) {
        ds.union(i, i + 10)
      }
      expect(ds.componentCount()).toBe(10)
    })

    it('component operations after clear and re-add', () => {
      const ds = new DisjointSet<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.union(1, 2)
      ds.clear()
      ds.makeSet(10)
      ds.makeSet(20)
      expect(ds.size).toBe(2)
      expect(ds.componentCount()).toBe(2)
      expect(ds.connected(10, 20)).toBe(false)
      ds.union(10, 20)
      expect(ds.connected(10, 20)).toBe(true)
    })

    it('handles symbolic elements', () => {
      const ds = new DisjointSet<symbol>()
      const a = Symbol('a')
      const b = Symbol('b')
      ds.makeSet(a)
      ds.makeSet(b)
      ds.union(a, b)
      expect(ds.connected(a, b)).toBe(true)
    })

    it('handles tuple elements', () => {
      const ds = new DisjointSet<[number, number]>()
      const a: [number, number] = [0, 0]
      const b: [number, number] = [1, 1]
      ds.makeSet(a)
      ds.makeSet(b)
      ds.union(a, b)
      expect(ds.connected(a, b)).toBe(true)
    })
  })

  describe('performance characteristics', () => {
    it('handles 10000 elements efficiently', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 10000; i++) {
        ds.makeSet(i)
      }
      expect(ds.size).toBe(10000)
      expect(ds.componentCount()).toBe(10000)
    })

    it('handles 10000 unions efficiently', () => {
      const ds = new DisjointSet<number>()
      for (let i = 0; i < 10000; i++) {
        ds.makeSet(i)
      }
      for (let i = 1; i < 10000; i++) {
        ds.union(0, i)
      }
      expect(ds.componentCount()).toBe(1)
      expect(ds.connected(0, 9999)).toBe(true)
    })

    it('handles 10000 random unions', () => {
      const ds = new DisjointSet<number>()
      const n = 5000
      for (let i = 0; i < n; i++) {
        ds.makeSet(i)
      }
      for (let i = 0; i < n; i++) {
        ds.union(i, (i + 1) % n)
      }
      expect(ds.componentCount()).toBe(1)
    })

    it('static from with large array', () => {
      const arr = Array.from({ length: 5000 }, (_, i) => i)
      const ds = DisjointSet.from(arr)
      expect(ds.size).toBe(5000)
      expect(ds.componentCount()).toBe(5000)
    })
  })
})
