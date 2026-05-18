import { describe, it, expect } from 'vitest'
import { BTree } from '../../src/core/b-tree-4/index.js'

describe('BTree (b-tree-4)', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default order', () => {
      const tree = new BTree<number>()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should create with custom order', () => {
      const tree = new BTree<number>(5)
      expect(tree.size()).toBe(0)
    })

    it('should create with custom comparator', () => {
      const tree = new BTree<string>(3, (a, b) => a.localeCompare(b))
      tree.insert('c')
      tree.insert('a')
      tree.insert('b')
      expect(tree.inOrderTraversal()).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single value', () => {
      const tree = new BTree<number>()
      tree.insert(10)
      expect(tree.size()).toBe(1)
      expect(tree.contains(10)).toBe(true)
    })

    it('should insert multiple values', () => {
      const tree = new BTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.size()).toBe(3)
    })

    it('should handle duplicate insertions', () => {
      const tree = new BTree<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(2)
    })

    it('should insert negative values', () => {
      const tree = new BTree<number>()
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(0)
      expect(tree.inOrderTraversal()).toEqual([-10, -5, 0])
    })

    it('should maintain sorted order', () => {
      const tree = new BTree<number>()
      const values = [30, 10, 50, 20, 40]
      for (const v of values) tree.insert(v)
      expect(tree.inOrderTraversal()).toEqual([10, 20, 30, 40, 50])
    })

    it('should handle many insertions causing splits', () => {
      const tree = new BTree<number>(3)
      for (let i = 0; i < 100; i++) tree.insert(i)
      expect(tree.size()).toBe(100)
      expect(tree.inOrderTraversal()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  // ─── Search and Contains ───

  describe('search and contains', () => {
    it('should find existing value', () => {
      const tree = new BTree<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(true)
      expect(tree.contains(42)).toBe(true)
    })

    it('should not find missing value', () => {
      const tree = new BTree<number>()
      tree.insert(1)
      expect(tree.search(99)).toBe(false)
      expect(tree.contains(99)).toBe(false)
    })

    it('should return false for empty tree', () => {
      const tree = new BTree<number>()
      expect(tree.search(1)).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete an existing value', () => {
      const tree = new BTree<number>(3)
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.delete(20)).toBe(true)
      expect(tree.contains(20)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should return false when deleting from empty tree', () => {
      const tree = new BTree<number>()
      expect(tree.delete(1)).toBe(false)
    })

    it('should return false when deleting non-existent value', () => {
      const tree = new BTree<number>()
      tree.insert(10)
      expect(tree.delete(99)).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('should delete all values leaving empty tree', () => {
      const tree = new BTree<number>(3)
      tree.insert(10)
      expect(tree.delete(10)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain sorted order after deletions', () => {
      const tree = new BTree<number>(4)
      for (const v of [10, 20, 30, 40, 50]) tree.insert(v)
      tree.delete(30)
      expect(tree.inOrderTraversal()).toEqual([10, 20, 40, 50])
    })
  })

  // ─── Min and Max ───

  describe('min and max', () => {
    it('should return undefined for empty tree', () => {
      const tree = new BTree<number>()
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('should return min and max for single element', () => {
      const tree = new BTree<number>()
      tree.insert(42)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })

    it('should return correct min and max', () => {
      const tree = new BTree<number>()
      for (const v of [50, 10, 30, 20, 40]) tree.insert(v)
      expect(tree.min()).toBe(10)
      expect(tree.max()).toBe(50)
    })
  })

  // ─── GetHeight ───

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      const tree = new BTree<number>()
      expect(tree.getHeight()).toBe(0)
    })

    it('should return 1 for single element', () => {
      const tree = new BTree<number>()
      tree.insert(1)
      expect(tree.getHeight()).toBe(1)
    })

    it('should increase height with many elements', () => {
      const tree = new BTree<number>(2)
      for (let i = 0; i < 50; i++) tree.insert(i)
      expect(tree.getHeight()).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── TimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return O(log n)', () => {
      const tree = new BTree<number>()
      expect(tree.getTimeComplexity()).toBe('O(log n)')
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all entries', () => {
      const tree = new BTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should be usable after clear', () => {
      const tree = new BTree<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.contains(2)).toBe(true)
      expect(tree.size()).toBe(1)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return sorted array', () => {
      const tree = new BTree<number>()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.toArray()).toEqual([10, 20, 30])
    })

    it('should return empty array for empty tree', () => {
      const tree = new BTree<number>()
      expect(tree.toArray()).toEqual([])
    })
  })
})
