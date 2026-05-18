import { describe, it, expect } from 'vitest'
import { ScapegoatTree3 } from '../../src/core/scapegoat-tree-3/index.js'

describe('ScapegoatTree3', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty tree with default comparator', () => {
      const tree = new ScapegoatTree3<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should accept a custom alpha value', () => {
      const tree = new ScapegoatTree3<number>(undefined, 0.5)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.contains(5)).toBe(true)
    })

    it('should ignore duplicates', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('should maintain sorted order with balanced insertions', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.toArray()).toEqual([3, 5, 7])
    })

    it('should handle negative values', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(-5)
      tree.insert(5)
      expect(tree.toArray()).toEqual([-5, 5])
    })

    it('should report correct size after insertions', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size).toBe(3)
    })
  })

  // ─── search / contains ───

  describe('search and contains', () => {
    it('should find an inserted element', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(true)
      expect(tree.contains(42)).toBe(true)
    })

    it('should return false for missing element', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(1)
      tree.insert(2)
      expect(tree.search(3)).toBe(false)
      expect(tree.contains(3)).toBe(false)
    })

    it('should return false when searching in empty tree', () => {
      const tree = new ScapegoatTree3<number>()
      expect(tree.search(1)).toBe(false)
      expect(tree.contains(1)).toBe(false)
    })

    it('should find elements in a balanced tree', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(3)
      tree.insert(7)
      expect(tree.search(3)).toBe(true)
      expect(tree.search(7)).toBe(true)
      expect(tree.search(10)).toBe(true)
      expect(tree.search(15)).toBe(true)
      expect(tree.search(20)).toBe(false)
    })

    it('search and contains should return same results', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.search(3)).toBe(tree.contains(3))
      expect(tree.search(4)).toBe(tree.contains(4))
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should delete a leaf node', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(3)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(3)).toBe(false)
    })

    it('should return false for missing element', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      expect(tree.delete(3)).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('should return false when deleting from empty tree', () => {
      const tree = new ScapegoatTree3<number>()
      expect(tree.delete(1)).toBe(false)
    })

    it('should delete the root node', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should delete a node with two children', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(5)).toBe(false)
      expect(tree.contains(3)).toBe(true)
      expect(tree.contains(7)).toBe(true)
    })

    it('should return true when deleting an existing value', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(7)).toBe(true)
      expect(tree.size).toBe(2)
    })
  })

  // ─── min / max ───

  describe('min and max', () => {
    it('should return null for empty tree', () => {
      const tree = new ScapegoatTree3<number>()
      expect(tree.min()).toBeNull()
      expect(tree.max()).toBeNull()
    })

    it('should return the same value for single element tree', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(42)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
    })

    it('should return correct min and max', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.min()).toBe(3)
      expect(tree.max()).toBe(7)
    })

    it('should handle negative values', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(-10)
      tree.insert(10)
      expect(tree.min()).toBe(-10)
      expect(tree.max()).toBe(10)
    })
  })

  // ─── toArray / forEach ───

  describe('toArray and forEach', () => {
    it('should return empty array for empty tree', () => {
      const tree = new ScapegoatTree3<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('should iterate with forEach', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      const collected: number[] = []
      tree.forEach((v) => collected.push(v))
      expect(collected).toEqual([5, 10, 15])
    })

    it('should pass index to forEach callback', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(10)
      const indices: number[] = []
      tree.forEach((_v, i) => indices.push(i!))
      expect(indices).toEqual([0, 1])
    })
  })

  // ─── height ───

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      const tree = new ScapegoatTree3<number>()
      expect(tree.height()).toBe(0)
    })

    it('should return 1 for single node', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      expect(tree.height()).toBe(1)
    })

    it('should increase height with more elements', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      const h1 = tree.height()
      tree.insert(3)
      tree.insert(7)
      expect(tree.height()).toBeGreaterThanOrEqual(h1)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
      expect(tree.min()).toBeNull()
      expect(tree.max()).toBeNull()
    })

    it('should allow insertions after clear', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size).toBe(1)
      expect(tree.contains(2)).toBe(true)
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle insert after delete all', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.delete(5)
      expect(tree.isEmpty()).toBe(true)
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.contains(10)).toBe(true)
    })

    it('should handle deleting all elements one by one', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(3)).toBe(true)
      expect(tree.delete(5)).toBe(true)
      expect(tree.delete(7)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should work with zero values', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(0)
      expect(tree.contains(0)).toBe(true)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(0)
    })

    it('should handle single element lifecycle', () => {
      const tree = new ScapegoatTree3<number>()
      tree.insert(42)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.search(42)).toBe(true)
      expect(tree.delete(42)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.search(42)).toBe(false)
    })
  })
})
