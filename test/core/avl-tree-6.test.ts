import { describe, it, expect } from 'vitest'
import { AVLTree6 } from '../../src/core/avl-tree-6/index.js'

// ─── Constructor ───

describe('AVLTree6', () => {
  describe('constructor', () => {
    it('creates an empty tree by default', () => {
      const tree = new AVLTree6<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('accepts a custom comparator', () => {
      const tree = new AVLTree6<number>((a, b) => b - a)
      tree.insert(1)
      tree.insert(3)
      tree.insert(2)
      expect(tree.min()).toBe(3)
      expect(tree.max()).toBe(1)
    })

    it('works with strings using default comparator', () => {
      const tree = new AVLTree6<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('inserts multiple elements maintaining sorted order', () => {
      const tree = new AVLTree6<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.insert(2)
      tree.insert(4)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(tree.size).toBe(5)
    })

    it('ignores duplicate values', () => {
      const tree = new AVLTree6<number>()
      tree.insert(3)
      tree.insert(3)
      tree.insert(3)
      expect(tree.size).toBe(1)
      expect(tree.toArray()).toEqual([3])
    })

    it('inserts in sorted order', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts in reverse sorted order', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(4)
      tree.insert(3)
      tree.insert(2)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles negative numbers', () => {
      const tree = new AVLTree6<number>()
      tree.insert(-3)
      tree.insert(0)
      tree.insert(-1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([-3, -1, 0, 2])
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('deletes an existing element and returns true', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false when deleting non-existent element', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      expect(tree.delete(99)).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('returns false when deleting from empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.delete(1)).toBe(false)
    })

    it('maintains sorted order after deletions', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      tree.delete(3)
      expect(tree.toArray()).toEqual([1, 5, 7, 9])
    })

    it('deletes the root element', () => {
      const tree = new AVLTree6<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.delete(3)
      expect(tree.toArray()).toEqual([1, 5])
      expect(tree.size).toBe(2)
    })

    it('deletes all elements one by one', () => {
      const tree = new AVLTree6<number>()
      const values = [5, 3, 7, 1, 4, 6, 9]
      for (const v of values) tree.insert(v)
      for (const v of values) {
        expect(tree.delete(v)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── Search / Contains ───

  describe('search', () => {
    it('finds an existing element', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      expect(tree.search(5)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      expect(tree.search(99)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.search(1)).toBe(false)
    })
  })

  describe('contains', () => {
    it('delegates to search', () => {
      const tree = new AVLTree6<number>()
      tree.insert(42)
      expect(tree.contains(42)).toBe(true)
      expect(tree.contains(99)).toBe(false)
    })
  })

  // ─── Min / Max ───

  describe('min', () => {
    it('returns undefined for empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.min()).toBeUndefined()
    })

    it('returns the minimum value', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.min()).toBe(1)
    })

    it('updates min after deletion', () => {
      const tree = new AVLTree6<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.delete(1)
      expect(tree.min()).toBe(3)
    })
  })

  describe('max', () => {
    it('returns undefined for empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.max()).toBeUndefined()
    })

    it('returns the maximum value', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.max()).toBe(7)
    })

    it('updates max after deletion', () => {
      const tree = new AVLTree6<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.delete(5)
      expect(tree.max()).toBe(3)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })
  })

  // ─── Size / isEmpty / clear / height ───

  describe('size', () => {
    it('tracks size correctly', () => {
      const tree = new AVLTree6<number>()
      expect(tree.size).toBe(0)
      tree.insert(1)
      expect(tree.size).toBe(1)
      tree.insert(2)
      expect(tree.size).toBe(2)
      tree.delete(1)
      expect(tree.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const tree = new AVLTree6<number>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false when not empty', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })
  })

  describe('height', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.height()).toBe(0)
    })

    it('returns 1 for single element', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      expect(tree.height()).toBe(1)
    })

    it('maintains O(log n) height after many inserts', () => {
      const tree = new AVLTree6<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      const h = tree.height()
      expect(h).toBeLessThanOrEqual(Math.ceil(Math.log2(100)) + 1)
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns a descriptive string', () => {
      const tree = new AVLTree6<number>()
      expect(typeof tree.getTimeComplexity()).toBe('string')
      expect(tree.getTimeComplexity()).toContain('O(log n)')
    })
  })

  // ─── Rank ───

  describe('rank', () => {
    it('returns 0 for non-existent element', () => {
      const tree = new AVLTree6<number>()
      expect(tree.rank(99)).toBe(0)
    })

    it('returns 0 on empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.rank(1)).toBe(0)
    })

    it('returns correct 1-based rank', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.rank(1)).toBe(1)
      expect(tree.rank(3)).toBe(2)
      expect(tree.rank(5)).toBe(3)
      expect(tree.rank(7)).toBe(4)
      expect(tree.rank(9)).toBe(5)
    })
  })

  // ─── Select ───

  describe('select', () => {
    it('returns undefined for out-of-range k', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      expect(tree.select(0)).toBeUndefined()
      expect(tree.select(2)).toBeUndefined()
    })

    it('returns undefined on empty tree', () => {
      const tree = new AVLTree6<number>()
      expect(tree.select(1)).toBeUndefined()
    })

    it('returns k-th smallest element (1-based)', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.select(1)).toBe(1)
      expect(tree.select(2)).toBe(3)
      expect(tree.select(3)).toBe(5)
      expect(tree.select(4)).toBe(7)
      expect(tree.select(5)).toBe(9)
    })
  })

  // ─── Split ───

  describe('split', () => {
    it('splits an empty tree into two empty trees', () => {
      const tree = new AVLTree6<number>()
      const { left, right } = tree.split(5)
      expect(left.isEmpty()).toBe(true)
      expect(right.isEmpty()).toBe(true)
    })

    it('splits a tree at a given key', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
      const { left, right } = tree.split(5)
      expect(left.toArray()).toEqual([1, 3])
      expect(right.toArray()).toEqual([5, 7, 9])
    })

    it('splits with key smaller than all elements', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
      const { left, right } = tree.split(0)
      expect(left.isEmpty()).toBe(true)
      expect(right.toArray()).toEqual([5, 7, 9])
    })

    it('splits with key larger than all elements', () => {
      const tree = new AVLTree6<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      const { left, right } = tree.split(99)
      expect(left.toArray()).toEqual([1, 3, 5])
      expect(right.isEmpty()).toBe(true)
    })

    it('splits a single element tree', () => {
      const tree = new AVLTree6<number>()
      tree.insert(5)
      const { left, right } = tree.split(5)
      expect(left.isEmpty()).toBe(true)
      expect(right.toArray()).toEqual([5])
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two empty trees', () => {
      const t1 = new AVLTree6<number>()
      const t2 = new AVLTree6<number>()
      const merged = t1.merge(t2)
      expect(merged.isEmpty()).toBe(true)
    })

    it('merges an empty tree with a non-empty tree', () => {
      const t1 = new AVLTree6<number>()
      const t2 = new AVLTree6<number>()
      t2.insert(1)
      t2.insert(2)
      const merged = t1.merge(t2)
      expect(merged.toArray()).toEqual([1, 2])
    })

    it('merges a non-empty tree with an empty tree', () => {
      const t1 = new AVLTree6<number>()
      t1.insert(1)
      t1.insert(2)
      const t2 = new AVLTree6<number>()
      const merged = t1.merge(t2)
      expect(merged.toArray()).toEqual([1, 2])
    })

    it('merges two non-empty trees', () => {
      const t1 = new AVLTree6<number>()
      t1.insert(1)
      t1.insert(3)
      t1.insert(5)
      const t2 = new AVLTree6<number>()
      t2.insert(2)
      t2.insert(4)
      t2.insert(6)
      const merged = t1.merge(t2)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
      expect(merged.size).toBe(6)
    })

    it('merges with overlapping values (duplicates ignored)', () => {
      const t1 = new AVLTree6<number>()
      t1.insert(1)
      t1.insert(3)
      const t2 = new AVLTree6<number>()
      t2.insert(3)
      t2.insert(5)
      const merged = t1.merge(t2)
      expect(merged.toArray()).toEqual([1, 3, 5])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles many sequential inserts and deletes', () => {
      const tree = new AVLTree6<number>()
      for (let i = 0; i < 50; i++) tree.insert(i)
      expect(tree.size).toBe(50)
      for (let i = 0; i < 50; i++) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles single element insert and delete', () => {
      const tree = new AVLTree6<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(true)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
      tree.delete(42)
      expect(tree.search(42)).toBe(false)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('rank and select are inverses', () => {
      const tree = new AVLTree6<number>()
      const values = [50, 30, 70, 10, 40, 60, 90]
      for (const v of values) tree.insert(v)
      for (let k = 1; k <= values.length; k++) {
        const val = tree.select(k)!
        expect(tree.rank(val)).toBe(k)
      }
    })
  })
})
