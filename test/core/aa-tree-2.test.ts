import { describe, it, expect, beforeEach } from 'vitest'
import { AATree2 } from '../../src/core/aa-tree-2/index.js'

describe('AATree2', () => {
  let tree: AATree2<number>

  beforeEach(() => {
    tree = new AATree2<number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new AATree2<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const t = new AATree2<string>((a, b) => a.localeCompare(b))
      t.insert('cherry').insert('apple').insert('banana')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should work with default comparator', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size).toBe(3)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.contains(10)).toBe(true)
    })

    it('should return this for chaining', () => {
      const result = tree.insert(1)
      expect(result).toBe(tree)
    })

    it('should insert multiple elements maintaining order', () => {
      tree.insert(5).insert(3).insert(7).insert(1).insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should track duplicate count instead of creating new node', () => {
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.toArray()).toEqual([5])
    })

    it('should handle negative numbers', () => {
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(0)
      tree.insert(10)
      expect(tree.toArray()).toEqual([-10, -5, 0, 10])
    })

    it('should handle ascending inserts', () => {
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle descending inserts', () => {
      for (let i = 10; i >= 1; i--) tree.insert(i)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle many random elements', () => {
      const values = [5, 3, 7, 1, 4, 6, 8, 2, 9, 0]
      for (const v of values) tree.insert(v)
      expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  // ─── Search / Contains ───

  describe('search / contains', () => {
    beforeEach(() => {
      tree.insert(5).insert(3).insert(7).insert(1).insert(9)
    })

    it('should find existing elements', () => {
      expect(tree.search(5)).toBe(true)
      expect(tree.search(3)).toBe(true)
      expect(tree.search(7)).toBe(true)
      expect(tree.search(1)).toBe(true)
    })

    it('should not find non-existing elements', () => {
      expect(tree.search(4)).toBe(false)
      expect(tree.search(0)).toBe(false)
      expect(tree.search(10)).toBe(false)
    })

    it('contains should behave like search', () => {
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(4)).toBe(false)
    })

    it('should return false on empty tree', () => {
      const empty = new AATree2<number>()
      expect(empty.search(1)).toBe(false)
      expect(empty.contains(1)).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    beforeEach(() => {
      tree.insert(5).insert(3).insert(7).insert(1).insert(4).insert(6).insert(8)
    })

    it('should return this for chaining', () => {
      const result = tree.delete(5)
      expect(result).toBe(tree)
    })

    it('should delete a leaf element', () => {
      tree.delete(1)
      expect(tree.contains(1)).toBe(false)
      expect(tree.size).toBe(6)
    })

    it('should delete an internal element', () => {
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
      expect(tree.size).toBe(6)
      expect(tree.toArray()).toEqual([1, 3, 4, 6, 7, 8])
    })

    it('should decrement count for duplicates before removing node', () => {
      tree.insert(5)
      tree.insert(5)
      tree.delete(5)
      expect(tree.contains(5)).toBe(true)
      expect(tree.size).toBe(7)
      tree.delete(5)
      expect(tree.contains(5)).toBe(true)
      expect(tree.size).toBe(7)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
      expect(tree.size).toBe(6)
    })

    it('should handle deleting non-existing element (no-op)', () => {
      tree.delete(99)
      expect(tree.size).toBe(7)
    })

    it('should handle deleting from empty tree', () => {
      const empty = new AATree2<number>()
      empty.delete(1)
      expect(empty.size).toBe(0)
    })

    it('should handle deleting the only element', () => {
      const t = new AATree2<number>()
      t.insert(42)
      t.delete(42)
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should maintain order after multiple deletions', () => {
      tree.delete(3)
      tree.delete(7)
      const result = tree.toArray()
      expect(result).toEqual([1, 4, 5, 6, 8])
    })

    it('should handle deleting all elements', () => {
      const values = [5, 3, 7, 1, 4, 6, 8]
      for (const v of values) tree.delete(v)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })
  })

  // ─── Min / Max ───

  describe('min / max', () => {
    it('should return null on empty tree', () => {
      expect(tree.min()).toBeNull()
      expect(tree.max()).toBeNull()
    })

    it('should return the only element', () => {
      tree.insert(42)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })

    it('should return min and max for multiple elements', () => {
      tree.insert(5).insert(3).insert(7).insert(1).insert(9)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(9)
    })

    it('should handle negative values', () => {
      tree.insert(-10)
      tree.insert(0)
      tree.insert(10)
      expect(tree.min()).toBe(-10)
      expect(tree.max()).toBe(10)
    })
  })

  // ─── Traversal / forEach ───

  describe('toArray / forEach', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return sorted elements', () => {
      tree.insert(5).insert(3).insert(7).insert(1).insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('forEach should iterate in order with correct indices', () => {
      tree.insert(5).insert(3).insert(7)
      const collected: number[] = []
      const indices: number[] = []
      tree.forEach((value, index) => {
        collected.push(value)
        indices.push(index)
      })
      expect(collected).toEqual([3, 5, 7])
      expect(indices).toEqual([0, 1, 2])
    })
  })

  // ─── Size / isEmpty / Clear ───

  describe('size / isEmpty / clear', () => {
    it('should track size via getter', () => {
      expect(tree.size).toBe(0)
      tree.insert(1)
      expect(tree.size).toBe(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
    })

    it('should track isEmpty', () => {
      expect(tree.isEmpty()).toBe(true)
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should clear the tree', () => {
      tree.insert(1).insert(2).insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })
  })

  // ─── Height ───

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.height()).toBe(0)
    })

    it('should return 1 for single element', () => {
      tree.insert(1)
      expect(tree.height()).toBe(1)
    })

    it('should grow logarithmically', () => {
      for (let i = 0; i < 100; i++) tree.insert(i)
      const h = tree.height()
      expect(h).toBeLessThanOrEqual(20)
    })
  })
})
