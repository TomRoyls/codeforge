import { describe, it, expect } from 'vitest'
import { AVLTree } from '../../src/core/avl-tree-5/index.js'

// ─── Constructor ───

describe('AVLTree', () => {
  describe('constructor', () => {
    it('creates an empty tree by default', () => {
      const tree = new AVLTree<number>()
      expect(tree.getSize()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('accepts a custom comparator', () => {
      const tree = new AVLTree<number>((a, b) => b - a)
      tree.insert(1)
      tree.insert(3)
      tree.insert(2)
      expect(tree.min()).toBe(3)
      expect(tree.max()).toBe(1)
    })

    it('works with strings using default comparator', () => {
      const tree = new AVLTree<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const tree = new AVLTree<number>()
      tree.insert(5)
      expect(tree.getSize()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('inserts multiple elements maintaining sorted order', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.insert(2)
      tree.insert(4)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(tree.getSize()).toBe(5)
    })

    it('ignores duplicate values', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(3)
      tree.insert(3)
      expect(tree.getSize()).toBe(1)
      expect(tree.toArray()).toEqual([3])
    })

    it('inserts in sorted order', () => {
      const tree = new AVLTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts in reverse sorted order', () => {
      const tree = new AVLTree<number>()
      tree.insert(5)
      tree.insert(4)
      tree.insert(3)
      tree.insert(2)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('handles negative numbers', () => {
      const tree = new AVLTree<number>()
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
      const tree = new AVLTree<number>()
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.getSize()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false when deleting non-existent element', () => {
      const tree = new AVLTree<number>()
      tree.insert(1)
      expect(tree.delete(99)).toBe(false)
      expect(tree.getSize()).toBe(1)
    })

    it('returns false when deleting from empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.delete(1)).toBe(false)
    })

    it('maintains sorted order after deletions', () => {
      const tree = new AVLTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      tree.delete(3)
      expect(tree.toArray()).toEqual([1, 5, 7, 9])
    })

    it('deletes the root element', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.delete(3)
      expect(tree.toArray()).toEqual([1, 5])
      expect(tree.getSize()).toBe(2)
    })

    it('deletes all elements one by one', () => {
      const tree = new AVLTree<number>()
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
      const tree = new AVLTree<number>()
      tree.insert(5)
      expect(tree.search(5)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const tree = new AVLTree<number>()
      tree.insert(5)
      expect(tree.search(99)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.search(1)).toBe(false)
    })
  })

  describe('contains', () => {
    it('delegates to search', () => {
      const tree = new AVLTree<number>()
      tree.insert(42)
      expect(tree.contains(42)).toBe(true)
      expect(tree.contains(99)).toBe(false)
    })
  })

  // ─── Min / Max ───

  describe('min', () => {
    it('returns undefined for empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.min()).toBeUndefined()
    })

    it('returns the minimum value', () => {
      const tree = new AVLTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.min()).toBe(1)
    })

    it('updates min after deletion', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.delete(1)
      expect(tree.min()).toBe(3)
    })
  })

  describe('max', () => {
    it('returns undefined for empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.max()).toBeUndefined()
    })

    it('returns the maximum value', () => {
      const tree = new AVLTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.max()).toBe(7)
    })

    it('updates max after deletion', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      tree.delete(5)
      expect(tree.max()).toBe(3)
    })
  })

  // ─── Traversals ───

  describe('inOrderTraversal', () => {
    it('returns empty array for empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.inOrderTraversal()).toEqual([])
    })

    it('returns sorted order', () => {
      const tree = new AVLTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.inOrderTraversal()).toEqual([1, 3, 5, 7, 9])
    })
  })

  describe('preOrderTraversal', () => {
    it('returns empty array for empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.preOrderTraversal()).toEqual([])
    })

    it('returns elements in pre-order', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      expect(tree.preOrderTraversal().length).toBe(3)
      expect(tree.preOrderTraversal()[0]).toBe(3)
    })
  })

  describe('postOrderTraversal', () => {
    it('returns empty array for empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.postOrderTraversal()).toEqual([])
    })

    it('returns elements in post-order', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      expect(tree.postOrderTraversal().length).toBe(3)
      expect(tree.postOrderTraversal()[2]).toBe(3)
    })
  })

  describe('toArray', () => {
    it('delegates to inOrderTraversal', () => {
      const tree = new AVLTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      expect(tree.toArray()).toEqual([1, 3, 5])
    })
  })

  // ─── Height / Size / isEmpty / clear ───

  describe('getHeight', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AVLTree<number>()
      expect(tree.getHeight()).toBe(0)
    })

    it('returns 1 for single element', () => {
      const tree = new AVLTree<number>()
      tree.insert(1)
      expect(tree.getHeight()).toBe(1)
    })

    it('maintains O(log n) height after many inserts', () => {
      const tree = new AVLTree<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      const height = tree.getHeight()
      expect(height).toBeLessThanOrEqual(Math.ceil(Math.log2(100)) + 1)
    })
  })

  describe('getSize', () => {
    it('tracks size correctly', () => {
      const tree = new AVLTree<number>()
      expect(tree.getSize()).toBe(0)
      tree.insert(1)
      expect(tree.getSize()).toBe(1)
      tree.insert(2)
      expect(tree.getSize()).toBe(2)
      tree.delete(1)
      expect(tree.getSize()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const tree = new AVLTree<number>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false when not empty', () => {
      const tree = new AVLTree<number>()
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const tree = new AVLTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.getSize()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns a descriptive string', () => {
      const tree = new AVLTree<number>()
      expect(typeof tree.getTimeComplexity()).toBe('string')
      expect(tree.getTimeComplexity()).toContain('O(log n)')
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles many sequential inserts and deletes', () => {
      const tree = new AVLTree<number>()
      for (let i = 0; i < 50; i++) tree.insert(i)
      expect(tree.getSize()).toBe(50)
      for (let i = 0; i < 50; i++) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles single element insert and delete', () => {
      const tree = new AVLTree<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(true)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
      tree.delete(42)
      expect(tree.search(42)).toBe(false)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })
  })
})
