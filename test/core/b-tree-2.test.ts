import { describe, it, expect } from 'vitest'
import { BTree2 } from '../../src/core/b-tree-2/index.js'

describe('BTree2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create with default order', () => {
      const tree = new BTree2<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should create with custom order', () => {
      const tree = new BTree2<number>(5)
      expect(tree.size).toBe(0)
    })

    it('should create with custom comparator', () => {
      const tree = new BTree2<string>(3, (a, b) => a.localeCompare(b))
      tree.insert('c')
      tree.insert('a')
      tree.insert('b')
      expect(tree.toArray()).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single value', () => {
      const tree = new BTree2<number>(3)
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.search(10)).toBe(true)
    })

    it('should insert multiple values', () => {
      const tree = new BTree2<number>(3)
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.size).toBe(3)
    })

    it('should handle duplicate insertions', () => {
      const tree = new BTree2<number>(3)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(2)
    })

    it('should insert negative values', () => {
      const tree = new BTree2<number>(3)
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(0)
      expect(tree.toArray()).toEqual([-10, -5, 0])
    })

    it('should insert in random order and maintain sorted', () => {
      const tree = new BTree2<number>(3)
      const values = [30, 10, 50, 20, 40]
      for (const v of values) tree.insert(v)
      expect(tree.toArray()).toEqual([10, 20, 30, 40, 50])
    })

    it('should handle many insertions causing splits', () => {
      const tree = new BTree2<number>(3)
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(100)
      expect(tree.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  // ─── Search and Contains ───

  describe('search and contains', () => {
    it('should find existing value', () => {
      const tree = new BTree2<number>(3)
      tree.insert(42)
      expect(tree.search(42)).toBe(true)
      expect(tree.contains(42)).toBe(true)
    })

    it('should not find missing value', () => {
      const tree = new BTree2<number>(3)
      tree.insert(1)
      expect(tree.search(99)).toBe(false)
      expect(tree.contains(99)).toBe(false)
    })

    it('should search in empty tree', () => {
      const tree = new BTree2<number>(3)
      expect(tree.search(1)).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete a leaf key', () => {
      const tree = new BTree2<number>(3)
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      tree.delete(20)
      expect(tree.search(20)).toBe(false)
      expect(tree.size).toBe(2)
    })

    it('should handle delete from empty tree', () => {
      const tree = new BTree2<number>(3)
      tree.delete(1)
      expect(tree.size).toBe(0)
    })

    it('should handle delete of non-existent value', () => {
      const tree = new BTree2<number>(3)
      tree.insert(10)
      tree.delete(99)
      expect(tree.size).toBe(1)
      expect(tree.search(10)).toBe(true)
    })

    it('should delete all values leaving empty tree', () => {
      const tree = new BTree2<number>(3)
      tree.insert(10)
      tree.delete(10)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should maintain sorted order after deletions', () => {
      const tree = new BTree2<number>(3)
      for (const v of [10, 20, 30, 40, 50]) tree.insert(v)
      tree.delete(30)
      expect(tree.toArray()).toEqual([10, 20, 40, 50])
    })
  })

  // ─── Min and Max ───

  describe('min and max', () => {
    it('should return null for empty tree', () => {
      const tree = new BTree2<number>(3)
      expect(tree.min()).toBeNull()
      expect(tree.max()).toBeNull()
    })

    it('should return min and max for single element', () => {
      const tree = new BTree2<number>(3)
      tree.insert(42)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })

    it('should return correct min and max', () => {
      const tree = new BTree2<number>(3)
      for (const v of [50, 10, 30, 20, 40]) tree.insert(v)
      expect(tree.min()).toBe(10)
      expect(tree.max()).toBe(50)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all entries', () => {
      const tree = new BTree2<number>(3)
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should be usable after clear', () => {
      const tree = new BTree2<number>(3)
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.search(2)).toBe(true)
      expect(tree.size).toBe(1)
    })
  })

  // ─── ToArray and ForEach ───

  describe('toArray and forEach', () => {
    it('should return sorted array', () => {
      const tree = new BTree2<number>(3)
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.toArray()).toEqual([10, 20, 30])
    })

    it('should return empty array for empty tree', () => {
      const tree = new BTree2<number>(3)
      expect(tree.toArray()).toEqual([])
    })

    it('should iterate with forEach', () => {
      const tree = new BTree2<number>(3)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const collected: number[] = []
      tree.forEach(v => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })
  })
})
