import { describe, it, expect } from 'vitest'
import { RedBlackTree3 } from '../../src/core/red-black-tree-3/index.js'

describe('RedBlackTree3', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty tree with default comparator', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const tree = new RedBlackTree3<number>(reverseCmp)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.search(5)).toBe(true)
    })

    it('should ignore duplicates', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('should maintain sorted order after multiple insertions', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should handle negative values', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(-5)
      tree.insert(0)
      tree.insert(5)
      expect(tree.toArray()).toEqual([-5, 0, 5])
    })

    it('should handle string values', () => {
      const tree = new RedBlackTree3<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── search / contains ───

  describe('search and contains', () => {
    it('should find existing element', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(true)
      expect(tree.contains(42)).toBe(true)
    })

    it('should return false for missing element', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      expect(tree.search(99)).toBe(false)
      expect(tree.contains(99)).toBe(false)
    })

    it('should return false on empty tree', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.search(1)).toBe(false)
      expect(tree.contains(1)).toBe(false)
    })

    it('should find elements after many insertions', () => {
      const tree = new RedBlackTree3<number>()
      for (let i = 0; i < 50; i++) tree.insert(i)
      for (let i = 0; i < 50; i++) {
        expect(tree.search(i)).toBe(true)
      }
      expect(tree.search(50)).toBe(false)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('should return false for missing element', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.remove(42)).toBe(false)
    })

    it('should remove a single element', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      expect(tree.remove(5)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.search(5)).toBe(false)
    })

    it('should remove leaf node', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.remove(3)
      expect(tree.size).toBe(2)
      expect(tree.toArray()).toEqual([5, 7])
    })

    it('should remove node with one child', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(6)
      tree.remove(7)
      expect(tree.toArray()).toEqual([3, 5, 6])
    })

    it('should remove node with two children', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(2)
      tree.insert(4)
      tree.remove(3)
      expect(tree.size).toBe(4)
      expect(tree.toArray()).toEqual([2, 4, 5, 7])
    })

    it('should handle removing root', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.remove(5)
      expect(tree.size).toBe(2)
      expect(tree.search(5)).toBe(false)
    })

    it('should handle deleting all elements', () => {
      const tree = new RedBlackTree3<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      for (let i = 0; i < 10; i++) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle duplicate remove calls', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      expect(tree.remove(1)).toBe(true)
      expect(tree.remove(1)).toBe(false)
    })
  })

  // ─── min / max ───

  describe('min and max', () => {
    it('should return undefined for empty tree', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('should return the only element', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      expect(tree.min()).toBe(5)
      expect(tree.max()).toBe(5)
    })

    it('should return correct min and max', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(1)
      tree.insert(20)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(20)
    })

    it('should update after deletions', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(1)
      expect(tree.min()).toBe(5)
      tree.remove(10)
      expect(tree.max()).toBe(5)
    })
  })

  // ─── size / isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.size).toBe(0)
      tree.insert(1)
      expect(tree.size).toBe(1)
      tree.insert(2)
      expect(tree.size).toBe(2)
      tree.insert(1) // duplicate
      expect(tree.size).toBe(2)
      tree.remove(1)
      expect(tree.size).toBe(1)
    })

    it('should reflect isEmpty correctly', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.isEmpty()).toBe(true)
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
      tree.remove(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all elements', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })

    it('should work on already empty tree', () => {
      const tree = new RedBlackTree3<number>()
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  // ─── toArray / forEach ───

  describe('toArray and forEach', () => {
    it('should return empty array for empty tree', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('forEach should iterate in order', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const collected: number[] = []
      tree.forEach(v => collected.push(v))
      expect(collected).toEqual([1, 2, 3])
    })

    it('forEach should not call callback on empty tree', () => {
      const tree = new RedBlackTree3<number>()
      let called = false
      tree.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  // ─── predecessor / successor ───

  describe('predecessor and successor', () => {
    it('should return undefined for non-existent value', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      expect(tree.predecessor(5)).toBeUndefined()
      expect(tree.successor(5)).toBeUndefined()
    })

    it('should return undefined for only element', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      expect(tree.predecessor(5)).toBeUndefined()
      expect(tree.successor(5)).toBeUndefined()
    })

    it('should find predecessor from left subtree', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(4)
      expect(tree.predecessor(5)).toBe(4) // max of left subtree
    })

    it('should find predecessor by walking up tree', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(4)
      expect(tree.predecessor(5)).toBe(4)
    })

    it('should find successor from right subtree', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(6)
      tree.insert(9)
      expect(tree.successor(5)).toBe(6) // min of right subtree
    })

    it('should find successor by walking up tree', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(7)
      tree.insert(6)
      expect(tree.successor(5)).toBe(6)
    })

    it('should return undefined for min element predecessor', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for max element successor', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.successor(10)).toBeUndefined()
    })
  })

  // ─── rangeSearch ───

  describe('rangeSearch', () => {
    it('should return empty for empty tree', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.rangeSearch(1, 10)).toEqual([])
    })

    it('should return elements within range inclusive', () => {
      const tree = new RedBlackTree3<number>()
      for (let i = 1; i <= 10; i++) tree.insert(i)
      expect(tree.rangeSearch(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element when low equals high and it exists', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.rangeSearch(5, 5)).toEqual([5])
    })

    it('should return empty when no elements in range', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(1)
      tree.insert(10)
      expect(tree.rangeSearch(5, 6)).toEqual([])
    })

    it('should return all elements for full range', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(5)
      expect(tree.rangeSearch(1, 5)).toEqual([1, 3, 5])
    })

    it('should handle range with negative numbers', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(-5)
      tree.insert(0)
      tree.insert(5)
      expect(tree.rangeSearch(-5, 0)).toEqual([-5, 0])
    })
  })

  // ─── height ───

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RedBlackTree3<number>()
      expect(tree.height()).toBe(0)
    })

    it('should return 1 for single node', () => {
      const tree = new RedBlackTree3<number>()
      tree.insert(5)
      expect(tree.height()).toBe(1)
    })

    it('should grow logarithmically', () => {
      const tree = new RedBlackTree3<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      const h = tree.height()
      // RB tree height ≤ 2 * log2(n+1), so for 100 nodes: ≤ 2*7 = 14
      expect(h).toBeGreaterThan(0)
      expect(h).toBeLessThanOrEqual(14)
    })
  })

  // ─── Stress ───

  describe('stress', () => {
    it('should handle sequential ascending insertions', () => {
      const tree = new RedBlackTree3<number>()
      for (let i = 0; i < 200; i++) tree.insert(i)
      expect(tree.size).toBe(200)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(199)
      expect(tree.toArray()).toEqual(Array.from({ length: 200 }, (_, i) => i))
    })

    it('should handle sequential descending insertions', () => {
      const tree = new RedBlackTree3<number>()
      for (let i = 199; i >= 0; i--) tree.insert(i)
      expect(tree.size).toBe(200)
      expect(tree.toArray()).toEqual(Array.from({ length: 200 }, (_, i) => i))
    })

    it('should handle interleaved insert and remove', () => {
      const tree = new RedBlackTree3<number>()
      for (let i = 0; i < 50; i++) tree.insert(i)
      for (let i = 0; i < 25; i++) tree.remove(i)
      for (let i = 50; i < 75; i++) tree.insert(i)
      expect(tree.size).toBe(50)
      expect(tree.toArray().length).toBe(50)
    })
  })
})
