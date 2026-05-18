import { describe, it, expect } from 'vitest';
import { RedBlackTree4 } from '../../src/core/red-black-tree-4/index.js';

describe('RedBlackTree4', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty tree with default comparator', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const tree = new RedBlackTree4<number>(reverseCmp)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── insert ───
  describe('insert', () => {
    it('should insert a single element', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.contains(5)).toBe(true)
    })

    it('should handle duplicate insertions', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('should maintain sorted order after multiple insertions', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should handle negative numbers', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(-5)
      tree.insert(0)
      tree.insert(5)
      expect(tree.toArray()).toEqual([-5, 0, 5])
    })

    it('should insert strings', () => {
      const tree = new RedBlackTree4<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle sequential ascending inserts', () => {
      const tree = new RedBlackTree4<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      expect(tree.size).toBe(10)
      expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  // ─── search/contains ───
  describe('search/contains', () => {
    it('should return true for existing key via contains', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
    })

    it('should return true for existing key via search', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      expect(tree.search(5)).toBe(true)
    })

    it('should return false for missing key', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      expect(tree.contains(3)).toBe(false)
    })

    it('should return false on empty tree', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.search(1)).toBe(false)
    })
  })

  // ─── remove ───
  describe('remove', () => {
    it('should return false for missing key', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.remove(42)).toBe(false)
    })

    it('should remove a single element', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      expect(tree.remove(5)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should remove leaf node', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.remove(3)
      expect(tree.contains(3)).toBe(false)
      expect(tree.toArray()).toEqual([5, 7])
    })

    it('should remove node with one child', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.remove(7)
      expect(tree.toArray()).toEqual([3, 5])
    })

    it('should remove node with two children', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(4)
      tree.remove(3)
      expect(tree.toArray()).toEqual([1, 4, 5, 7])
    })

    it('should handle deleting all elements', () => {
      const tree = new RedBlackTree4<number>()
      for (let i = 0; i < 5; i++) tree.insert(i)
      for (let i = 0; i < 5; i++) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle duplicate remove calls', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(1)
      expect(tree.remove(1)).toBe(true)
      expect(tree.remove(1)).toBe(false)
    })
  })

  // ─── min/max ───
  describe('min/max', () => {
    it('should return min value', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.min()).toBe(3)
    })

    it('should return max value', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.max()).toBe(7)
    })

    it('should return undefined for empty tree', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })
  })

  // ─── rank/select ───
  describe('rank/select', () => {
    it('should return correct rank', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.rank(10)).toBe(1)
      expect(tree.rank(20)).toBe(2)
      expect(tree.rank(30)).toBe(3)
    })

    it('should return 0 for non-existent rank', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.rank(99)).toBe(0)
    })

    it('should select kth smallest element', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.select(1)).toBe(10)
      expect(tree.select(2)).toBe(20)
      expect(tree.select(3)).toBe(30)
    })

    it('should return undefined for out of range select', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(1)
      expect(tree.select(0)).toBeUndefined()
      expect(tree.select(2)).toBeUndefined()
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('should clear all elements', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── forEach ───
  describe('forEach', () => {
    it('should iterate in order', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3])
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('should return sorted array', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.toArray()).toEqual([1, 3, 5, 7])
    })
  })

  // ─── height ───
  describe('height', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.height()).toBe(0)
    })

    it('should return 1 for single node', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(1)
      expect(tree.height()).toBe(1)
    })

    it('should grow logarithmically', () => {
      const tree = new RedBlackTree4<number>()
      const values = [5, 3, 7, 1, 9, 0, 4, 6, 8, 2]
      values.forEach(v => tree.insert(v))
      const h = tree.height()
      expect(h).toBeGreaterThan(0)
      expect(h).toBeLessThanOrEqual(10)
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should return a non-empty string', () => {
      const tree = new RedBlackTree4<number>()
      const result = tree.getTimeComplexity()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should mention O(log n)', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.getTimeComplexity()).toContain('O(log n)')
    })
  })

  // ─── rangeSearch ───
  describe('rangeSearch', () => {
    it('should find values in range', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(9)
      expect(tree.rangeSearch(3, 7)).toEqual([3, 5, 7])
    })

    it('should return empty array for no matches', () => {
      const tree = new RedBlackTree4<number>()
      tree.insert(1)
      tree.insert(10)
      expect(tree.rangeSearch(3, 7)).toEqual([])
    })

    it('should handle empty tree', () => {
      const tree = new RedBlackTree4<number>()
      expect(tree.rangeSearch(1, 5)).toEqual([])
    })
  })
})
