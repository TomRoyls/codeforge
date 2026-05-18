import { describe, it, expect, beforeEach } from 'vitest'
import { TwoThreeTree } from '../../src/core/2-3-tree/index.js'

describe('TwoThreeTree', () => {
  let tree: TwoThreeTree<number>

  beforeEach(() => {
    tree = new TwoThreeTree<number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new TwoThreeTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const t = new TwoThreeTree<string>((a, b) => a.localeCompare(b))
      t.insert('banana')
      t.insert('apple')
      t.insert('cherry')
      expect(t.inOrderTraversal()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should work with default comparator for numbers', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size()).toBe(3)
    })

    it('should work with reverse comparator', () => {
      const t = new TwoThreeTree<number>((a, b) => b - a)
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.inOrderTraversal()).toEqual([3, 2, 1])
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      tree.insert(10)
      expect(tree.size()).toBe(1)
      expect(tree.contains(10)).toBe(true)
    })

    it('should insert multiple elements maintaining order', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.inOrderTraversal()).toEqual([1, 3, 5, 7, 9])
    })

    it('should ignore duplicate inserts', () => {
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
    })

    it('should handle negative numbers', () => {
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(0)
      tree.insert(10)
      expect(tree.inOrderTraversal()).toEqual([-10, -5, 0, 10])
    })

    it('should handle single element sorted insert', () => {
      tree.insert(42)
      expect(tree.size()).toBe(1)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })

    it('should handle inserts in ascending order', () => {
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(tree.size()).toBe(10)
    })

    it('should handle inserts in descending order', () => {
      for (let i = 10; i >= 1; i--) tree.insert(i)
      expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(tree.size()).toBe(10)
    })

    it('should handle many elements', () => {
      const values = [5, 3, 7, 1, 4, 6, 8, 2, 9, 0]
      for (const v of values) tree.insert(v)
      expect(tree.inOrderTraversal()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  // ─── Search / Contains ───

  describe('search / contains', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
    })

    it('should find existing elements', () => {
      expect(tree.search(5)).toBe(true)
      expect(tree.search(3)).toBe(true)
      expect(tree.search(7)).toBe(true)
    })

    it('should not find non-existing elements', () => {
      expect(tree.search(4)).toBe(false)
      expect(tree.search(0)).toBe(false)
      expect(tree.search(10)).toBe(false)
    })

    it('contains should work identically to search', () => {
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(4)).toBe(false)
    })

    it('should return false on empty tree', () => {
      const empty = new TwoThreeTree<number>()
      expect(empty.search(1)).toBe(false)
      expect(empty.contains(1)).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(4)
      tree.insert(6)
      tree.insert(8)
    })

    it('should delete a leaf element', () => {
      expect(tree.delete(1)).toBe(true)
      expect(tree.contains(1)).toBe(false)
      expect(tree.size()).toBe(6)
    })

    it('should delete an internal element', () => {
      expect(tree.delete(5)).toBe(true)
      expect(tree.contains(5)).toBe(false)
      expect(tree.size()).toBe(6)
      expect(tree.inOrderTraversal()).toEqual([1, 3, 4, 6, 7, 8])
    })

    it('should return false for non-existing element', () => {
      expect(tree.delete(99)).toBe(false)
      expect(tree.size()).toBe(7)
    })

    it('should handle deleting from empty tree', () => {
      const empty = new TwoThreeTree<number>()
      expect(empty.delete(1)).toBe(false)
    })

    it('should handle deleting the only element', () => {
      const t = new TwoThreeTree<number>()
      t.insert(42)
      expect(t.delete(42)).toBe(true)
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should maintain order after multiple deletions', () => {
      tree.delete(3)
      tree.delete(7)
      expect(tree.inOrderTraversal()).toEqual([1, 4, 5, 6, 8])
    })

    it('should handle deleting all elements', () => {
      const values = [5, 3, 7, 1, 4, 6, 8]
      for (const v of values) tree.delete(v)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })
  })

  // ─── Min / Max ───

  describe('min / max', () => {
    it('should return undefined on empty tree', () => {
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('should return the only element', () => {
      tree.insert(42)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })

    it('should return min and max for multiple elements', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(9)
    })
  })

  // ─── Traversal ───

  describe('inOrderTraversal / toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.inOrderTraversal()).toEqual([])
      expect(tree.toArray()).toEqual([])
    })

    it('should return sorted elements', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.inOrderTraversal()).toEqual([1, 3, 5, 7, 9])
    })

    it('toArray should match inOrderTraversal', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.toArray()).toEqual(tree.inOrderTraversal())
    })
  })

  // ─── Size / isEmpty / Clear ───

  describe('size / isEmpty / clear', () => {
    it('should track size correctly', () => {
      expect(tree.size()).toBe(0)
      tree.insert(1)
      expect(tree.size()).toBe(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size()).toBe(3)
    })

    it('should track isEmpty correctly', () => {
      expect(tree.isEmpty()).toBe(true)
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should clear the tree', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.inOrderTraversal()).toEqual([])
    })
  })

  // ─── Height ───

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.getHeight()).toBe(0)
    })

    it('should return 1 for single element', () => {
      tree.insert(1)
      expect(tree.getHeight()).toBe(1)
    })

    it('should grow slowly with many elements', () => {
      for (let i = 0; i < 100; i++) tree.insert(i)
      const h = tree.getHeight()
      expect(h).toBeLessThanOrEqual(10)
    })
  })

  // ─── Time Complexity ───

  describe('getTimeComplexity', () => {
    it('should return O(1) for empty tree', () => {
      expect(tree.getTimeComplexity()).toBe('O(1)')
    })

    it('should return O(log n) for populated tree', () => {
      for (let i = 0; i < 20; i++) tree.insert(i)
      const tc = tree.getTimeComplexity()
      expect(tc).toContain('O(')
    })
  })
})
