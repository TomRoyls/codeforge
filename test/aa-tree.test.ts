import { describe, it, expect } from 'vitest'
import { AATree } from '../src/core/aa-tree/aa-tree.js'
import type { AATreeStats } from '../src/core/aa-tree/types.js'

function makeTree(entries: [number, string][]): AATree<number, string> {
  return AATree.from(entries)
}

function sortedKeys(tree: AATree<number, string>): number[] {
  return tree.toArray().map(([k]) => k)
}

describe('AATree', () => {
  // ─── Construction & Empty State ───
  describe('construction and empty state', () => {
    it('creates an empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insertion', () => {
      const tree = new AATree<number, string>()
      tree.insert(1, 'a')
      expect(tree.isEmpty()).toBe(false)
    })

    it('defaults allowDuplicates to false', () => {
      const tree = new AATree<number, string>()
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.search(1)).toBe('b')
    })
  })

  // ─── Insert & Search ───
  describe('insert and search', () => {
    it('inserts a single key-value pair', () => {
      const tree = new AATree<number, string>()
      tree.insert(42, 'answer')
      expect(tree.search(42)).toBe('answer')
    })

    it('returns undefined for missing key', () => {
      const tree = makeTree([[1, 'a']])
      expect(tree.search(999)).toBeUndefined()
    })

    it('overwrites value on duplicate key (no duplicates)', () => {
      const tree = new AATree<number, string>()
      tree.insert(5, 'first')
      tree.insert(5, 'second')
      expect(tree.search(5)).toBe('second')
      expect(tree.size()).toBe(1)
    })

    it('inserts multiple distinct keys', () => {
      const tree = makeTree([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(tree.size()).toBe(3)
      expect(tree.search(1)).toBe('a')
      expect(tree.search(2)).toBe('b')
      expect(tree.search(3)).toBe('c')
    })

    it('supports string keys with default comparator', () => {
      const tree = new AATree<string, number>()
      tree.insert('banana', 2)
      tree.insert('apple', 1)
      tree.insert('cherry', 3)
      expect(tree.search('apple')).toBe(1)
      expect(tree.search('banana')).toBe(2)
      expect(tree.search('cherry')).toBe(3)
    })

    it('supports custom comparator (reverse order)', () => {
      const tree = new AATree<number, string>(undefined, (a, b) => b - a)
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      expect(tree.search(1)).toBe('a')
      expect(tree.search(2)).toBe('b')
      expect(tree.search(3)).toBe('c')
    })
  })

  // ─── Contains ───
  describe('contains', () => {
    it('returns true for existing key', () => {
      const tree = makeTree([[10, 'x']])
      expect(tree.contains(10)).toBe(true)
    })

    it('returns false for missing key', () => {
      const tree = makeTree([[10, 'x']])
      expect(tree.contains(99)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.contains(1)).toBe(false)
    })
  })

  // ─── Min & Max ───
  describe('min and max', () => {
    it('min returns undefined on empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.min()).toBeUndefined()
    })

    it('max returns undefined on empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.max()).toBeUndefined()
    })

    it('min returns the smallest key-value pair', () => {
      const tree = makeTree([
        [5, 'e'],
        [3, 'c'],
        [8, 'h'],
        [1, 'a'],
      ])
      expect(tree.min()).toEqual([1, 'a'])
    })

    it('max returns the largest key-value pair', () => {
      const tree = makeTree([
        [5, 'e'],
        [3, 'c'],
        [8, 'h'],
        [1, 'a'],
      ])
      expect(tree.max()).toEqual([8, 'h'])
    })

    it('min and max work for single-element tree', () => {
      const tree = makeTree([[7, 'g']])
      expect(tree.min()).toEqual([7, 'g'])
      expect(tree.max()).toEqual([7, 'g'])
    })
  })

  // ─── Successor & Predecessor ───
  describe('successor and predecessor', () => {
    it('successor returns the next larger key', () => {
      const tree = makeTree([
        [1, 'a'],
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
      ])
      expect(tree.successor(3)).toEqual([5, 'e'])
    })

    it('successor returns undefined if no larger key exists', () => {
      const tree = makeTree([
        [1, 'a'],
        [3, 'c'],
      ])
      expect(tree.successor(3)).toBeUndefined()
    })

    it('successor returns undefined on empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.successor(1)).toBeUndefined()
    })

    it('successor works for key not in the tree', () => {
      const tree = makeTree([
        [1, 'a'],
        [5, 'e'],
        [9, 'i'],
      ])
      expect(tree.successor(4)).toEqual([5, 'e'])
    })

    it('predecessor returns the next smaller key', () => {
      const tree = makeTree([
        [1, 'a'],
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
      ])
      expect(tree.predecessor(5)).toEqual([3, 'c'])
    })

    it('predecessor returns undefined if no smaller key exists', () => {
      const tree = makeTree([
        [1, 'a'],
        [3, 'c'],
      ])
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('predecessor returns undefined on empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('predecessor works for key not in the tree', () => {
      const tree = makeTree([
        [1, 'a'],
        [5, 'e'],
        [9, 'i'],
      ])
      expect(tree.predecessor(6)).toEqual([5, 'e'])
    })
  })

  // ─── Delete ───
  describe('delete', () => {
    it('deletes a leaf node', () => {
      const tree = makeTree([
        [2, 'b'],
        [1, 'a'],
        [3, 'c'],
      ])
      expect(tree.delete(1)).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.contains(1)).toBe(false)
      expect(tree.search(2)).toBe('b')
    })

    it('deletes the root node', () => {
      const tree = makeTree([
        [2, 'b'],
        [1, 'a'],
        [3, 'c'],
      ])
      expect(tree.delete(2)).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.contains(2)).toBe(false)
    })

    it('deletes a node with one child', () => {
      const tree = makeTree([
        [2, 'b'],
        [1, 'a'],
        [3, 'c'],
        [4, 'd'],
      ])
      expect(tree.delete(3)).toBe(true)
      expect(tree.size()).toBe(3)
      expect(tree.contains(3)).toBe(false)
      expect(tree.contains(4)).toBe(true)
    })

    it('returns false when deleting non-existent key', () => {
      const tree = makeTree([[1, 'a']])
      expect(tree.delete(999)).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('returns false when deleting from empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.delete(1)).toBe(false)
    })

    it('can delete all elements', () => {
      const tree = makeTree([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
      tree.delete(1)
      tree.delete(2)
      tree.delete(3)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('maintains in-order traversal after deletions', () => {
      const tree = makeTree([
        [5, 'e'],
        [2, 'b'],
        [8, 'h'],
        [1, 'a'],
        [3, 'c'],
        [6, 'f'],
        [9, 'i'],
      ])
      tree.delete(2)
      tree.delete(8)
      expect(sortedKeys(tree)).toEqual([1, 3, 5, 6, 9])
    })
  })

  // ─── Traversals ───
  describe('traversals', () => {
    it('forEach visits all elements in-order', () => {
      const tree = makeTree([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      const visited: [number, string][] = []
      tree.forEach((v, k) => visited.push([k, v]))
      expect(visited).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('forEach does nothing on empty tree', () => {
      const tree = new AATree<number, string>()
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('toArray returns sorted key-value pairs', () => {
      const tree = makeTree([
        [5, 'e'],
        [2, 'b'],
        [8, 'h'],
      ])
      expect(tree.toArray()).toEqual([
        [2, 'b'],
        [5, 'e'],
        [8, 'h'],
      ])
    })

    it('toArray returns empty array for empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.toArray()).toEqual([])
    })

    it('range returns elements within bounds (inclusive)', () => {
      const tree = makeTree([
        [1, 'a'],
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
        [9, 'i'],
      ])
      expect(tree.range(3, 7)).toEqual([
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
      ])
    })

    it('range returns empty array for empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.range(1, 10)).toEqual([])
    })

    it('range returns empty array when lower > upper', () => {
      const tree = makeTree([
        [1, 'a'],
        [3, 'c'],
      ])
      expect(tree.range(5, 2)).toEqual([])
    })

    it('range with single element overlap', () => {
      const tree = makeTree([
        [1, 'a'],
        [5, 'e'],
        [10, 'j'],
      ])
      expect(tree.range(4, 6)).toEqual([[5, 'e']])
    })
  })

  // ─── Size & Clear ───
  describe('size and clear', () => {
    it('size tracks insertions correctly', () => {
      const tree = new AATree<number, string>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i, `v${i}`)
      }
      expect(tree.size()).toBe(100)
    })

    it('clear empties the tree', () => {
      const tree = makeTree([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })

    it('tree is usable after clear', () => {
      const tree = makeTree([[1, 'a']])
      tree.clear()
      tree.insert(2, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.search(2)).toBe('b')
    })
  })

  // ─── Height ───
  describe('height', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.height()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const tree = makeTree([[1, 'a']])
      expect(tree.height()).toBe(1)
    })
  })

  // ─── Validate ───
  describe('validate', () => {
    it('validates an empty tree', () => {
      const tree = new AATree<number, string>()
      expect(tree.validate()).toBe(true)
    })

    it('validates after sequential insertions', () => {
      const tree = new AATree<number, string>()
      for (let i = 1; i <= 50; i++) {
        tree.insert(i, `v${i}`)
      }
      expect(tree.validate()).toBe(true)
    })

    it('validates after random-order insertions', () => {
      const tree = new AATree<number, string>()
      const nums = [7, 3, 9, 1, 5, 8, 10, 2, 4, 6]
      for (const n of nums) {
        tree.insert(n, `v${n}`)
      }
      expect(tree.validate()).toBe(true)
    })

    it('validates after deletions', () => {
      const tree = new AATree<number, string>()
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, `v${i}`)
      }
      for (let i = 1; i <= 10; i++) {
        tree.delete(i)
      }
      expect(tree.validate()).toBe(true)
    })
  })

  // ─── Balancing properties ───
  describe('balancing properties', () => {
    it('stays balanced inserting sorted sequence (ascending)', () => {
      const tree = new AATree<number, string>()
      const n = 100
      for (let i = 1; i <= n; i++) {
        tree.insert(i, `v${i}`)
      }
      const maxExpected = 2 * Math.ceil(Math.log2(n + 1))
      expect(tree.height()).toBeLessThanOrEqual(maxExpected)
      expect(tree.validate()).toBe(true)
    })

    it('stays balanced inserting sorted sequence (descending)', () => {
      const tree = new AATree<number, string>()
      const n = 100
      for (let i = n; i >= 1; i--) {
        tree.insert(i, `v${i}`)
      }
      const maxExpected = 2 * Math.ceil(Math.log2(n + 1))
      expect(tree.height()).toBeLessThanOrEqual(maxExpected)
      expect(tree.validate()).toBe(true)
    })

    it('stays balanced after interleaved insert/delete', () => {
      const tree = new AATree<number, string>()
      for (let i = 1; i <= 50; i++) tree.insert(i, `v${i}`)
      for (let i = 10; i <= 40; i++) tree.delete(i)
      for (let i = 60; i <= 80; i++) tree.insert(i, `v${i}`)
      expect(tree.validate()).toBe(true)
      expect(tree.size()).toBe(40)
    })
  })

  // ─── Clone ───
  describe('clone', () => {
    it('creates an independent copy', () => {
      const tree = makeTree([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
      const copy = tree.clone()
      expect(copy.size()).toBe(tree.size())
      expect(copy.toArray()).toEqual(tree.toArray())
    })

    it('clone modifications do not affect original', () => {
      const tree = makeTree([
        [1, 'a'],
        [2, 'b'],
      ])
      const copy = tree.clone()
      copy.insert(3, 'c')
      copy.delete(1)
      expect(tree.size()).toBe(2)
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(3)).toBe(false)
      expect(copy.size()).toBe(2)
      expect(copy.contains(1)).toBe(false)
      expect(copy.contains(3)).toBe(true)
    })
  })

  // ─── Static from ───
  describe('AATree.from', () => {
    it('creates tree from entries', () => {
      const tree = AATree.from([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(tree.size()).toBe(3)
      expect(tree.search(1)).toBe('a')
      expect(sortedKeys(tree)).toEqual([1, 2, 3])
    })

    it('creates tree from empty entries', () => {
      const tree = AATree.from<number, string>([])
      expect(tree.size()).toBe(0)
    })

    it('passes options to constructor', () => {
      const tree = AATree.from(
        [
          [1, 'a'],
          [1, 'b'],
        ],
        { allowDuplicates: true },
      )
      expect(tree.size()).toBe(2)
    })

    it('passes custom comparator', () => {
      const tree = AATree.from(
        [
          [1, 'a'],
          [2, 'b'],
        ],
        undefined,
        (a, b) => b - a,
      )
      expect(tree.search(1)).toBe('a')
    })
  })

  // ─── Stats ───
  describe('stats', () => {
    it('returns correct stats for empty tree', () => {
      const tree = new AATree<number, string>()
      const stats: AATreeStats = tree.stats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.isBalanced).toBe(true)
      expect(stats.minKey).toBeNull()
      expect(stats.maxKey).toBeNull()
    })

    it('returns correct stats for populated tree', () => {
      const tree = makeTree([
        [5, 'e'],
        [2, 'b'],
        [8, 'h'],
      ])
      const stats = tree.stats()
      expect(stats.nodeCount).toBe(3)
      expect(stats.height).toBeGreaterThan(0)
      expect(stats.isBalanced).toBe(true)
      expect(stats.minKey).toBe(2)
      expect(stats.maxKey).toBe(8)
    })
  })

  // ─── Allow Duplicates ───
  describe('allowDuplicates', () => {
    it('allows duplicate keys when enabled', () => {
      const tree = new AATree<number, string>({ allowDuplicates: true })
      tree.insert(1, 'first')
      tree.insert(1, 'second')
      expect(tree.size()).toBe(2)
      expect(tree.search(1)).toBe('first')
    })

    it('duplicates in toArray', () => {
      const tree = new AATree<number, string>({ allowDuplicates: true })
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      const arr = tree.toArray()
      expect(arr.length).toBe(2)
      expect(arr).toContainEqual([1, 'a'])
      expect(arr).toContainEqual([1, 'b'])
    })
  })

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('handles negative keys', () => {
      const tree = makeTree([
        [-3, 'neg'],
        [0, 'zero'],
        [5, 'pos'],
      ])
      expect(tree.search(-3)).toBe('neg')
      expect(tree.min()).toEqual([-3, 'neg'])
      expect(tree.max()).toEqual([5, 'pos'])
    })

    it('handles object values', () => {
      const tree = new AATree<number, { name: string }>()
      tree.insert(1, { name: 'alice' })
      tree.insert(2, { name: 'bob' })
      expect(tree.search(1)).toEqual({ name: 'alice' })
      expect(tree.search(2)).toEqual({ name: 'bob' })
    })

    it('handles large number of insertions', () => {
      const tree = new AATree<number, string>()
      const n = 1000
      for (let i = 0; i < n; i++) {
        tree.insert(i, `v${i}`)
      }
      expect(tree.size()).toBe(n)
      expect(tree.validate()).toBe(true)
      for (let i = 0; i < n; i++) {
        expect(tree.search(i)).toBe(`v${i}`)
      }
    })

    it('stress test: insert then delete everything', () => {
      const tree = new AATree<number, string>()
      const n = 50
      for (let i = 0; i < n; i++) tree.insert(i, `v${i}`)
      for (let i = 0; i < n; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('stress test: delete in reverse order', () => {
      const tree = new AATree<number, string>()
      const n = 50
      for (let i = 0; i < n; i++) tree.insert(i, `v${i}`)
      for (let i = n - 1; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('toArray is sorted after mixed operations', () => {
      const tree = new AATree<number, string>()
      tree.insert(5, 'e')
      tree.insert(2, 'b')
      tree.insert(8, 'h')
      tree.insert(1, 'a')
      tree.delete(5)
      tree.insert(4, 'd')
      tree.insert(6, 'f')
      tree.delete(2)
      expect(sortedKeys(tree)).toEqual([1, 4, 6, 8])
    })
  })

  // ─── Exports ───
  describe('exports', () => {
    it('re-exports DEFAULT_AA_TREE_OPTIONS', async () => {
      const mod = await import('../src/core/aa-tree/aa-tree.js')
      expect(mod.DEFAULT_AA_TREE_OPTIONS).toBeDefined()
      expect(mod.DEFAULT_AA_TREE_OPTIONS.allowDuplicates).toBe(false)
    })

    it('re-exports types', async () => {
      const mod = await import('../src/core/aa-tree/aa-tree.js')
      expect(mod.AATree).toBeDefined()
    })
  })
})
