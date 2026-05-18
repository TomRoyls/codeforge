import { DisjointSetForest } from '../src/core/disjoint-set-forest/disjoint-set-forest.js'
import type { DisjointSetForestNode } from '../src/core/disjoint-set-forest/disjoint-set-forest.js'

// ─── makeSet ───────────────────────────────────────────────────────────

describe('DisjointSetForest', () => {
  describe('makeSet', () => {
    it('creates a singleton set for a new item', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      expect(dsf.has(1)).toBe(true)
      expect(dsf.count).toBe(1)
      expect(dsf.itemCount).toBe(1)
    })

    it('does not create a duplicate set for an existing item', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(1)
      expect(dsf.count).toBe(1)
      expect(dsf.itemCount).toBe(1)
    })

    it('creates multiple independent sets', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.makeSet(3)
      expect(dsf.count).toBe(3)
      expect(dsf.itemCount).toBe(3)
    })

    it('works with string items', () => {
      const dsf = new DisjointSetForest<string>()
      dsf.makeSet('alpha')
      dsf.makeSet('beta')
      expect(dsf.count).toBe(2)
      expect(dsf.has('alpha')).toBe(true)
      expect(dsf.has('gamma')).toBe(false)
    })

    it('works with object items using reference identity', () => {
      const obj = { id: 1 }
      const dsf = new DisjointSetForest<object>()
      dsf.makeSet(obj)
      expect(dsf.has(obj)).toBe(true)
      expect(dsf.has({ id: 1 })).toBe(false)
    })
  })

  // ─── find ─────────────────────────────────────────────────────────────

  describe('find', () => {
    it('returns the item itself for a singleton set', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(42)
      expect(dsf.find(42)).toBe(42)
    })

    it('returns the root after a union', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      const root = dsf.find(1)
      expect(root).toBe(dsf.find(2))
    })

    it('returns the same root for all items in a connected component', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 1; i <= 5; i++) dsf.makeSet(i)
      dsf.union(1, 2)
      dsf.union(2, 3)
      dsf.union(3, 4)
      dsf.union(4, 5)
      const root = dsf.find(1)
      for (let i = 2; i <= 5; i++) {
        expect(dsf.find(i)).toBe(root)
      }
    })

    it('throws when item does not exist', () => {
      const dsf = new DisjointSetForest<number>()
      expect(() => dsf.find(999)).toThrow('Item not found in DisjointSetForest')
    })

    it('throws on an empty forest', () => {
      const dsf = new DisjointSetForest<number>()
      expect(() => dsf.find(1)).toThrow('Item not found in DisjointSetForest')
    })

    it('performs path compression (find returns root directly)', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 10; i++) dsf.makeSet(i)
      // Chain them linearly
      for (let i = 0; i < 9; i++) dsf.union(i, i + 1)
      // After find, the root should be accessible
      const root = dsf.find(9)
      expect(root).toBe(dsf.find(0))
      expect(root).toBe(dsf.find(5))
    })
  })

  // ─── union ────────────────────────────────────────────────────────────

  describe('union', () => {
    it('merges two singleton sets and returns true', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      expect(dsf.union(1, 2)).toBe(true)
      expect(dsf.count).toBe(1)
    })

    it('returns false when unioning items already in the same set', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      expect(dsf.union(1, 2)).toBe(false)
      expect(dsf.union(2, 1)).toBe(false)
    })

    it('returns false when unioning an item with itself', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      expect(dsf.union(1, 1)).toBe(false)
    })

    it('throws when first item does not exist', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(2)
      expect(() => dsf.union(1, 2)).toThrow('Item not found in DisjointSetForest')
    })

    it('throws when second item does not exist', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      expect(() => dsf.union(1, 2)).toThrow('Item not found in DisjointSetForest')
    })

    it('decrements count for each successful union', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 5; i++) dsf.makeSet(i)
      expect(dsf.count).toBe(5)
      dsf.union(0, 1)
      expect(dsf.count).toBe(4)
      dsf.union(2, 3)
      expect(dsf.count).toBe(3)
      dsf.union(0, 2)
      expect(dsf.count).toBe(2)
      dsf.union(0, 4)
      expect(dsf.count).toBe(1)
    })

    it('does not decrement count on failed union', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      const countBefore = dsf.count
      dsf.union(1, 2)
      expect(dsf.count).toBe(countBefore)
    })

    it('uses union by rank to keep trees shallow', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 16; i++) dsf.makeSet(i)
      // Union pairs, then pairs of pairs, etc. (like a binary tree)
      for (let stride = 1; stride < 16; stride *= 2) {
        for (let i = 0; i + stride < 16; i += stride * 2) {
          dsf.union(i, i + stride)
        }
      }
      // All should share one root
      expect(dsf.count).toBe(1)
      const root = dsf.find(0)
      for (let i = 1; i < 16; i++) {
        expect(dsf.find(i)).toBe(root)
      }
    })
  })

  // ─── connected ────────────────────────────────────────────────────────

  describe('connected', () => {
    it('returns false for two items not yet unioned', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      expect(dsf.connected(1, 2)).toBe(false)
    })

    it('returns true for items in the same set', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      expect(dsf.connected(1, 2)).toBe(true)
      expect(dsf.connected(2, 1)).toBe(true)
    })

    it('returns true for an item connected to itself', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      expect(dsf.connected(1, 1)).toBe(true)
    })

    it('returns false when first item does not exist', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(2)
      expect(dsf.connected(1, 2)).toBe(false)
    })

    it('returns false when second item does not exist', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      expect(dsf.connected(1, 2)).toBe(false)
    })

    it('returns false when neither item exists', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.connected(1, 2)).toBe(false)
    })

    it('returns true for transitive connections', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.makeSet(3)
      dsf.union(1, 2)
      dsf.union(2, 3)
      expect(dsf.connected(1, 3)).toBe(true)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 1 for a singleton set', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      expect(dsf.size(1)).toBe(1)
    })

    it('returns the combined size after union', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.makeSet(3)
      dsf.union(1, 2)
      expect(dsf.size(1)).toBe(2)
      expect(dsf.size(2)).toBe(2)
      dsf.union(1, 3)
      expect(dsf.size(1)).toBe(3)
      expect(dsf.size(2)).toBe(3)
      expect(dsf.size(3)).toBe(3)
    })

    it('returns 0 for a non-existent item', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.size(99)).toBe(0)
    })

    it('returns 0 on an empty forest', () => {
      const dsf = new DisjointSetForest<string>()
      expect(dsf.size('anything')).toBe(0)
    })

    it('returns correct size after many unions', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 10; i++) dsf.makeSet(i)
      for (let i = 1; i < 10; i++) dsf.union(0, i)
      expect(dsf.size(5)).toBe(10)
    })
  })

  // ─── count (getter) ──────────────────────────────────────────────────

  describe('count', () => {
    it('returns 0 for an empty forest', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.count).toBe(0)
    })

    it('equals itemCount when no unions have been performed', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.makeSet(3)
      expect(dsf.count).toBe(dsf.itemCount)
    })

    it('decrements with each successful union', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.makeSet(3)
      dsf.union(1, 2)
      expect(dsf.count).toBe(2)
      dsf.union(1, 3)
      expect(dsf.count).toBe(1)
    })
  })

  // ─── itemCount (getter) ──────────────────────────────────────────────

  describe('itemCount', () => {
    it('returns 0 for an empty forest', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.itemCount).toBe(0)
    })

    it('returns the total number of items', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 5; i++) dsf.makeSet(i)
      expect(dsf.itemCount).toBe(5)
    })

    it('does not change after unions', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      expect(dsf.itemCount).toBe(2)
    })
  })

  // ─── sets ─────────────────────────────────────────────────────────────

  describe('sets', () => {
    it('returns empty array for an empty forest', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.sets()).toEqual([])
    })

    it('returns single-element arrays for singleton sets', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      const sets = dsf.sets()
      expect(sets).toHaveLength(2)
      expect(sets.some(s => s.includes(1))).toBe(true)
      expect(sets.some(s => s.includes(2))).toBe(true)
    })

    it('groups unioned items together', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.makeSet(3)
      dsf.union(1, 2)
      const sets = dsf.sets()
      expect(sets).toHaveLength(2)
      const merged = sets.find(s => s.includes(1))
      expect(merged).toBeDefined()
      expect(merged!.sort()).toEqual([1, 2])
      const singleton = sets.find(s => s.includes(3))
      expect(singleton).toEqual([3])
    })

    it('returns one group when all items are connected', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 1; i <= 4; i++) dsf.makeSet(i)
      dsf.union(1, 2)
      dsf.union(3, 4)
      dsf.union(1, 3)
      const sets = dsf.sets()
      expect(sets).toHaveLength(1)
      expect(sets[0].sort()).toEqual([1, 2, 3, 4])
    })
  })

  // ─── components ───────────────────────────────────────────────────────

  describe('components', () => {
    it('returns empty map for an empty forest', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.components().size).toBe(0)
    })

    it('returns a map keyed by roots', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      const comps = dsf.components()
      expect(comps.size).toBe(1)
      const root = dsf.find(1)
      expect(comps.has(root)).toBe(true)
      const group = comps.get(root)!
      expect(group.sort()).toEqual([1, 2])
    })

    it('returns separate entries for disconnected components', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.makeSet(3)
      dsf.union(1, 3)
      const comps = dsf.components()
      expect(comps.size).toBe(2)
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns false for an item not in the forest', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.has(1)).toBe(false)
    })

    it('returns true for an item that was added', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      expect(dsf.has(1)).toBe(true)
    })

    it('returns true after the item has been unioned', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      expect(dsf.has(1)).toBe(true)
      expect(dsf.has(2)).toBe(true)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items from the forest', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      dsf.clear()
      expect(dsf.count).toBe(0)
      expect(dsf.itemCount).toBe(0)
      expect(dsf.has(1)).toBe(false)
      expect(dsf.has(2)).toBe(false)
    })

    it('resets an empty forest without error', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.clear()
      expect(dsf.count).toBe(0)
    })

    it('allows reuse after clearing', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.clear()
      dsf.makeSet(10)
      dsf.makeSet(20)
      expect(dsf.count).toBe(2)
      expect(dsf.has(10)).toBe(true)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      dsf.union(1, 2)
      const cloned = dsf.clone()
      expect(cloned.count).toBe(dsf.count)
      expect(cloned.itemCount).toBe(dsf.itemCount)
      expect(cloned.connected(1, 2)).toBe(true)
    })

    it('modifications to clone do not affect original', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      const cloned = dsf.clone()
      cloned.union(1, 2)
      expect(dsf.connected(1, 2)).toBe(false)
      expect(cloned.connected(1, 2)).toBe(true)
    })

    it('modifications to original do not affect clone', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      dsf.makeSet(2)
      const cloned = dsf.clone()
      dsf.makeSet(3)
      expect(dsf.itemCount).toBe(3)
      expect(cloned.itemCount).toBe(2)
      expect(cloned.has(3)).toBe(false)
    })

    it('clones an empty forest', () => {
      const dsf = new DisjointSetForest<number>()
      const cloned = dsf.clone()
      expect(cloned.count).toBe(0)
      expect(cloned.itemCount).toBe(0)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for an empty forest', () => {
      const dsf = new DisjointSetForest<number>()
      expect(dsf.toArray()).toEqual([])
    })

    it('returns all items that were added', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(10)
      dsf.makeSet(20)
      dsf.makeSet(30)
      const arr = dsf.toArray()
      expect(arr.sort()).toEqual([10, 20, 30])
    })

    it('returns a new array each time', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(1)
      const a = dsf.toArray()
      const b = dsf.toArray()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })
  })

  // ─── Edge Cases & Integration ────────────────────────────────────────

  describe('edge cases', () => {
    it('handles null as an item', () => {
      const dsf = new DisjointSetForest<null>()
      dsf.makeSet(null)
      expect(dsf.has(null)).toBe(true)
      expect(dsf.find(null)).toBe(null)
    })

    it('handles undefined as an item', () => {
      const dsf = new DisjointSetForest<undefined>()
      dsf.makeSet(undefined)
      expect(dsf.has(undefined)).toBe(true)
      expect(dsf.find(undefined)).toBe(undefined)
    })

    it('handles zero as an item', () => {
      const dsf = new DisjointSetForest<number>()
      dsf.makeSet(0)
      expect(dsf.has(0)).toBe(true)
      expect(dsf.size(0)).toBe(1)
    })

    it('handles empty string as an item', () => {
      const dsf = new DisjointSetForest<string>()
      dsf.makeSet('')
      expect(dsf.has('')).toBe(true)
      expect(dsf.find('')).toBe('')
    })

    it('handles large number of items', () => {
      const dsf = new DisjointSetForest<number>()
      const n = 1000
      for (let i = 0; i < n; i++) dsf.makeSet(i)
      expect(dsf.count).toBe(n)
      expect(dsf.itemCount).toBe(n)
      // Union all into one set
      for (let i = 1; i < n; i++) dsf.union(0, i)
      expect(dsf.count).toBe(1)
      expect(dsf.size(500)).toBe(n)
      expect(dsf.connected(0, n - 1)).toBe(true)
    })

    it('handles union chaining (linear)', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 100; i++) dsf.makeSet(i)
      for (let i = 0; i < 99; i++) dsf.union(i, i + 1)
      expect(dsf.count).toBe(1)
      expect(dsf.connected(0, 99)).toBe(true)
    })

    it('handles alternating union pattern', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 10; i++) dsf.makeSet(i)
      // Even-indexed items
      dsf.union(0, 2)
      dsf.union(2, 4)
      dsf.union(4, 6)
      dsf.union(6, 8)
      // Odd-indexed items
      dsf.union(1, 3)
      dsf.union(3, 5)
      dsf.union(5, 7)
      dsf.union(7, 9)
      expect(dsf.count).toBe(2)
      expect(dsf.connected(0, 8)).toBe(true)
      expect(dsf.connected(1, 9)).toBe(true)
      expect(dsf.connected(0, 1)).toBe(false)
    })

    it('clear then rebuild preserves independence', () => {
      const dsf = new DisjointSetForest<string>()
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      dsf.clear()
      dsf.makeSet('x')
      dsf.makeSet('y')
      expect(dsf.has('a')).toBe(false)
      expect(dsf.has('x')).toBe(true)
      expect(dsf.connected('x', 'y')).toBe(false)
      dsf.union('x', 'y')
      expect(dsf.connected('x', 'y')).toBe(true)
      expect(dsf.count).toBe(1)
    })

    it('clone after unions preserves connectivity', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 5; i++) dsf.makeSet(i)
      dsf.union(0, 1)
      dsf.union(2, 3)
      const cloned = dsf.clone()
      dsf.union(0, 2)
      expect(dsf.connected(0, 3)).toBe(true)
      expect(cloned.connected(0, 3)).toBe(false)
      expect(cloned.connected(0, 1)).toBe(true)
      expect(cloned.connected(2, 3)).toBe(true)
    })

    it('sets and components agree on groupings', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 1; i <= 6; i++) dsf.makeSet(i)
      dsf.union(1, 2)
      dsf.union(3, 4)
      dsf.union(5, 6)
      const setsArr = dsf.sets()
      const compsMap = dsf.components()
      expect(setsArr.length).toBe(compsMap.size)
      for (const group of setsArr) {
        const root = dsf.find(group[0])
        const compGroup = compsMap.get(root)!
        expect(compGroup.sort()).toEqual(group.sort())
      }
    })

    it('toArray returns items consistent with itemCount', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 0; i < 20; i++) dsf.makeSet(i)
      expect(dsf.toArray().length).toBe(dsf.itemCount)
    })

    it('size is consistent across all members of a set', () => {
      const dsf = new DisjointSetForest<number>()
      for (let i = 1; i <= 5; i++) dsf.makeSet(i)
      dsf.union(1, 2)
      dsf.union(1, 3)
      dsf.union(1, 4)
      dsf.union(1, 5)
      const expectedSize = 5
      for (let i = 1; i <= 5; i++) {
        expect(dsf.size(i)).toBe(expectedSize)
      }
    })
  })

  // ─── Type Export ─────────────────────────────────────────────────────

  describe('type export', () => {
    it('DisjointSetForestNode type is importable', () => {
      const node: DisjointSetForestNode<number> = {
        parent: 1,
        rank: 0,
        size: 1,
      }
      expect(node.parent).toBe(1)
      expect(node.rank).toBe(0)
      expect(node.size).toBe(1)
    })
  })
})
