import { describe, it, expect } from 'vitest'
import { WeightBalancedTree3 } from '../../src/core/weight-balanced-tree-3/index.js'

describe('WeightBalancedTree3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates an empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('accepts a custom comparator', () => {
      const t = new WeightBalancedTree3<number>((a, b) => b - a)
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('accepts a custom alpha parameter', () => {
      const t = new WeightBalancedTree3<number>(undefined, 0.3)
      for (let i = 1; i <= 20; i++) t.insert(i)
      expect(t.size).toBe(20)
      expect(t.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    })

    it('works with string values', () => {
      const t = new WeightBalancedTree3<string>()
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('uses default comparator when none provided', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── Insert ───
  describe('insert', () => {
    it('inserts a single element', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(5)
      expect(t.size).toBe(1)
      expect(t.isEmpty()).toBe(false)
      expect(t.search(5)).toBe(true)
    })

    it('inserts elements in ascending order', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.insert(4)
      t.insert(5)
      expect(t.size).toBe(5)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts elements in descending order', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(5)
      t.insert(4)
      t.insert(3)
      t.insert(2)
      t.insert(1)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('tracks size for duplicate inserts but deduplicates in tree', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(1)
      t.insert(1)
      t.insert(1)
      expect(t.size).toBe(3)
      expect(t.search(1)).toBe(true)
    })

    it('inserts negative numbers', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(-3)
      t.insert(0)
      t.insert(-1)
      t.insert(5)
      t.insert(-10)
      expect(t.toArray()).toEqual([-10, -3, -1, 0, 5])
    })

    it('maintains balance with many sequential inserts', () => {
      const t = new WeightBalancedTree3<number>()
      for (let i = 0; i < 100; i++) t.insert(i)
      expect(t.size).toBe(100)
      expect(t.height()).toBeLessThanOrEqual(20)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  // ─── Search / Contains ───
  describe('search', () => {
    it('finds existing element', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.search(20)).toBe(true)
    })

    it('returns false for missing element', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(30)
      expect(t.search(20)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.search(1)).toBe(false)
    })
  })

  describe('contains', () => {
    it('aliases search', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(42)
      expect(t.contains(42)).toBe(true)
      expect(t.contains(99)).toBe(false)
    })
  })

  // ─── Delete ───
  describe('delete', () => {
    it('deletes a leaf node', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(5)
      t.insert(15)
      t.delete(5)
      expect(t.size).toBe(2)
      expect(t.search(5)).toBe(false)
      expect(t.toArray()).toEqual([10, 15])
    })

    it('deletes the root', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(5)
      t.insert(15)
      t.delete(10)
      expect(t.size).toBe(2)
      expect(t.search(10)).toBe(false)
    })

    it('deletes a node with one child', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(5)
      t.insert(3)
      t.delete(5)
      expect(t.search(5)).toBe(false)
      expect(t.search(3)).toBe(true)
      expect(t.search(10)).toBe(true)
    })

    it('deletes a node with two children', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(5)
      t.insert(15)
      t.insert(3)
      t.insert(7)
      t.delete(5)
      expect(t.search(5)).toBe(false)
      expect(t.size).toBe(4)
      expect(t.toArray().length).toBe(4)
    })

    it('does nothing when deleting non-existent value', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(1)
      t.insert(2)
      t.delete(99)
      expect(t.size).toBe(2)
    })

    it('does nothing on empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      t.delete(1)
      expect(t.size).toBe(0)
    })

    it('handles delete then reinsert', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.delete(10)
      expect(t.isEmpty()).toBe(true)
      t.insert(10)
      expect(t.search(10)).toBe(true)
      expect(t.size).toBe(1)
    })

    it('deletes all elements one by one', () => {
      const t = new WeightBalancedTree3<number>()
      const values = [5, 3, 7, 1, 4, 6, 8]
      for (const v of values) t.insert(v)
      for (const v of values) t.delete(v)
      expect(t.isEmpty()).toBe(true)
      expect(t.size).toBe(0)
    })
  })

  // ─── Min / Max ───
  describe('min', () => {
    it('returns null on empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.min()).toBeNull()
    })

    it('returns the single element', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(42)
      expect(t.min()).toBe(42)
    })

    it('returns the minimum after multiple inserts', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(-5)
      t.insert(3)
      t.insert(20)
      expect(t.min()).toBe(-5)
    })
  })

  describe('max', () => {
    it('returns null on empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.max()).toBeNull()
    })

    it('returns the single element', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(42)
      expect(t.max()).toBe(42)
    })

    it('returns the maximum after multiple inserts', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(10)
      t.insert(-5)
      t.insert(3)
      t.insert(20)
      expect(t.max()).toBe(20)
    })
  })

  // ─── Size / isEmpty / Clear ───
  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.size).toBe(0)
      t.insert(1)
      expect(t.size).toBe(1)
      t.insert(2)
      expect(t.size).toBe(2)
    })

    it('isEmpty returns true only when empty', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.isEmpty()).toBe(true)
      t.insert(1)
      expect(t.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
      expect(t.toArray()).toEqual([])
    })

    it('clear on empty tree is safe', () => {
      const t = new WeightBalancedTree3<number>()
      t.clear()
      expect(t.size).toBe(0)
    })
  })

  // ─── toArray / forEach ───
  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.toArray()).toEqual([])
    })

    it('returns sorted elements', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('forEach', () => {
    it('visits all elements in order', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const collected: number[] = []
      t.forEach(v => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('does nothing on empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      const collected: number[] = []
      t.forEach(v => collected.push(v))
      expect(collected).toEqual([])
    })
  })

  // ─── Height ───
  describe('height', () => {
    it('returns 0 for empty tree', () => {
      const t = new WeightBalancedTree3<number>()
      expect(t.height()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const t = new WeightBalancedTree3<number>()
      t.insert(1)
      expect(t.height()).toBe(1)
    })

    it('grows logarithmically', () => {
      const t = new WeightBalancedTree3<number>()
      for (let i = 0; i < 1000; i++) t.insert(i)
      expect(t.height()).toBeLessThanOrEqual(30)
    })
  })
})
