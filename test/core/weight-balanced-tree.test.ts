import { describe, it, expect, beforeEach } from 'vitest'
import { WeightBalancedTree } from '../../src/core/weight-balanced-tree/weight-balanced-tree.js'
import { DEFAULT_WBT_OPTIONS } from '../../src/core/weight-balanced-tree/types.js'
import type { WBNode, CompareFunction, WeightBalancedTreeOptions, WeightBalancedTreeStats } from '../../src/core/weight-balanced-tree/types.js'

describe('WeightBalancedTree', () => {
  let tree: WeightBalancedTree<number>

  beforeEach(() => {
    tree = new WeightBalancedTree<number>()
  })

  describe('constructor', () => {
    it('should create empty tree with no arguments', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator function', () => {
      const t = new WeightBalancedTree<string>((a, b) => a.localeCompare(b))
      t.insert('c')
      t.insert('a')
      t.insert('b')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should accept options object with compare', () => {
      const t = new WeightBalancedTree<number>({
        compare: (a, b) => a - b,
        delta: 3,
        gamma: 2,
      })
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should accept partial options using defaults', () => {
      const t = new WeightBalancedTree<number>({ delta: 4 })
      t.insert(1)
      t.insert(2)
      expect(t.size()).toBe(2)
    })

    it('should use default comparator for numbers', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should use default comparator for strings', () => {
      const t = new WeightBalancedTree<string>()
      t.insert('c')
      t.insert('a')
      t.insert('b')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should create tree with default delta and gamma', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 1; i <= 100; i++) t.insert(i)
      expect(t.size()).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      expect(tree.insert(5)).toBe(true)
      expect(tree.size()).toBe(1)
    })

    it('should insert multiple elements', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(4)
      expect(tree.size()).toBe(3)
    })

    it('should return false for duplicate insert', () => {
      tree.insert(5)
      expect(tree.insert(5)).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('should maintain sorted order', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should handle negative numbers', () => {
      tree.insert(-3)
      tree.insert(-1)
      tree.insert(-5)
      expect(tree.toArray()).toEqual([-5, -3, -1])
    })

    it('should handle zero', () => {
      tree.insert(0)
      expect(tree.contains(0)).toBe(true)
    })

    it('should handle sequential inserts', () => {
      for (let i = 1; i <= 100; i++) tree.insert(i)
      expect(tree.size()).toBe(100)
      expect(tree.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })

    it('should handle reverse sequential inserts', () => {
      for (let i = 100; i >= 1; i--) tree.insert(i)
      expect(tree.size()).toBe(100)
      expect(tree.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    })

    it('should handle duplicate values correctly', () => {
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
    })

    it('should handle inserting after deletion', () => {
      tree.insert(5)
      tree.insert(3)
      tree.delete(5)
      expect(tree.insert(5)).toBe(true)
      expect(tree.size()).toBe(2)
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
    })

    it('should delete an existing element', () => {
      expect(tree.delete(3)).toBe(true)
      expect(tree.size()).toBe(4)
      expect(tree.contains(3)).toBe(false)
    })

    it('should return false for non-existent element', () => {
      expect(tree.delete(99)).toBe(false)
      expect(tree.size()).toBe(5)
    })

    it('should return false for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.delete(1)).toBe(false)
    })

    it('should handle deleting root', () => {
      expect(tree.delete(5)).toBe(true)
      expect(tree.contains(5)).toBe(false)
      expect(tree.toArray()).toEqual([1, 3, 7, 9])
    })

    it('should handle deleting leaf', () => {
      expect(tree.delete(1)).toBe(true)
      expect(tree.toArray()).toEqual([3, 5, 7, 9])
    })

    it('should handle deleting node with one child', () => {
      tree.insert(8)
      expect(tree.delete(9)).toBe(true)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 8])
    })

    it('should handle deleting node with two children', () => {
      expect(tree.delete(5)).toBe(true)
      expect(tree.contains(5)).toBe(false)
      expect(tree.size()).toBe(4)
    })

    it('should maintain sorted order after deletion', () => {
      tree.delete(3)
      tree.delete(7)
      const arr = tree.toArray()
      const sorted = [...arr].sort((a, b) => a - b)
      expect(arr).toEqual(sorted)
    })

    it('should delete all elements one by one', () => {
      const keys = [5, 3, 7, 1, 9]
      for (const k of keys) {
        expect(tree.delete(k)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle reinserting deleted element', () => {
      tree.delete(5)
      expect(tree.insert(5)).toBe(true)
      expect(tree.contains(5)).toBe(true)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
    })

    it('should find an existing element', () => {
      expect(tree.search(5)).toBe(5)
    })

    it('should return undefined for non-existent element', () => {
      expect(tree.search(99)).toBeUndefined()
    })

    it('should return undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.search(1)).toBeUndefined()
    })

    it('should find min element', () => {
      expect(tree.search(1)).toBe(1)
    })

    it('should find max element', () => {
      expect(tree.search(9)).toBe(9)
    })

    it('should not find deleted element', () => {
      tree.delete(5)
      expect(tree.search(5)).toBeUndefined()
    })
  })

  describe('contains', () => {
    it('should return true for existing element', () => {
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
    })

    it('should return false for non-existent element', () => {
      tree.insert(5)
      expect(tree.contains(3)).toBe(false)
    })

    it('should return false for empty tree', () => {
      expect(tree.contains(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      tree.insert(5)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
    })

    it('should find multiple elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(2)).toBe(true)
      expect(tree.contains(3)).toBe(true)
      expect(tree.contains(4)).toBe(false)
    })
  })

  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return the single element', () => {
      tree.insert(5)
      expect(tree.min()).toBe(5)
    })

    it('should return the minimum element', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.min()).toBe(1)
    })

    it('should update after deletion of min', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.delete(1)
      expect(tree.min()).toBe(5)
    })

    it('should work with negative numbers', () => {
      tree.insert(-10)
      tree.insert(0)
      tree.insert(10)
      expect(tree.min()).toBe(-10)
    })
  })

  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return the single element', () => {
      tree.insert(5)
      expect(tree.max()).toBe(5)
    })

    it('should return the maximum element', () => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(9)
      expect(tree.max()).toBe(9)
    })

    it('should update after deletion of max', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.delete(10)
      expect(tree.max()).toBe(5)
    })
  })

  describe('successor', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
    })

    it('should find successor of existing element', () => {
      expect(tree.successor(5)).toBe(7)
    })

    it('should find successor of min', () => {
      expect(tree.successor(1)).toBe(3)
    })

    it('should return undefined for max', () => {
      expect(tree.successor(9)).toBeUndefined()
    })

    it('should find successor of non-existent element', () => {
      expect(tree.successor(4)).toBe(5)
    })

    it('should return undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.successor(1)).toBeUndefined()
    })

    it('should find successor of element below all', () => {
      expect(tree.successor(0)).toBe(1)
    })

    it('should return undefined for element above all', () => {
      expect(tree.successor(10)).toBeUndefined()
    })
  })

  describe('predecessor', () => {
    beforeEach(() => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.insert(9)
    })

    it('should find predecessor of existing element', () => {
      expect(tree.predecessor(5)).toBe(3)
    })

    it('should find predecessor of max', () => {
      expect(tree.predecessor(9)).toBe(7)
    })

    it('should return undefined for min', () => {
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('should find predecessor of non-existent element', () => {
      expect(tree.predecessor(6)).toBe(5)
    })

    it('should return undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for element below all', () => {
      expect(tree.predecessor(0)).toBeUndefined()
    })

    it('should find predecessor of element above all', () => {
      expect(tree.predecessor(10)).toBe(9)
    })
  })

  describe('range', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) tree.insert(i)
    })

    it('should return keys in inclusive range', () => {
      expect(tree.range(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element range', () => {
      expect(tree.range(5, 5)).toEqual([5])
    })

    it('should return empty when lo > hi', () => {
      expect(tree.range(7, 3)).toEqual([])
    })

    it('should return full range', () => {
      expect(tree.range(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle range with non-existent bounds', () => {
      expect(tree.range(2, 8)).toEqual([2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle range outside tree bounds', () => {
      expect(tree.range(0, 20)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle range with no matches', () => {
      expect(tree.range(20, 30)).toEqual([])
    })

    it('should handle range on empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.range(1, 10)).toEqual([])
    })

    it('should handle range on single element tree', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.range(1, 10)).toEqual([5])
      expect(t.range(5, 5)).toEqual([5])
      expect(t.range(6, 10)).toEqual([])
    })

    it('should handle partial overlap at low end', () => {
      expect(tree.range(0, 3)).toEqual([1, 2, 3])
    })

    it('should handle partial overlap at high end', () => {
      expect(tree.range(8, 15)).toEqual([8, 9, 10])
    })
  })

  describe('forEach', () => {
    it('should iterate in order', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const keys: number[] = []
      tree.forEach((key) => keys.push(key))
      expect(keys).toEqual([1, 2, 3])
    })

    it('should provide correct indices', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const indices: number[] = []
      tree.forEach((_key, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback for empty tree', () => {
      let called = false
      tree.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('should visit all elements', () => {
      for (let i = 0; i < 20; i++) tree.insert(i)
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(20)
    })

    it('should provide keys and indices in sync', () => {
      for (let i = 5; i >= 1; i--) tree.insert(i)
      const pairs: [number, number][] = []
      tree.forEach((key, index) => pairs.push([key, index]))
      expect(pairs).toEqual([[1, 0], [2, 1], [3, 2], [4, 3], [5, 4]])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return sorted array', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('should not modify the tree', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      tree.toArray()
      expect(tree.size()).toBe(3)
    })

    it('should handle single element', () => {
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should increase after insert', () => {
      tree.insert(1)
      expect(tree.size()).toBe(1)
    })

    it('should decrease after delete', () => {
      tree.insert(1)
      tree.insert(2)
      tree.delete(1)
      expect(tree.size()).toBe(1)
    })

    it('should not change for duplicate insert', () => {
      tree.insert(1)
      tree.insert(1)
      expect(tree.size()).toBe(1)
    })
  })

  describe('height', () => {
    it('should return -1 for empty tree', () => {
      expect(tree.height()).toBe(-1)
    })

    it('should return 0 for single element', () => {
      tree.insert(1)
      expect(tree.height()).toBe(0)
    })

    it('should return positive height for multiple elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.height()).toBeGreaterThan(0)
    })

    it('should maintain logarithmic height for sequential inserts', () => {
      for (let i = 1; i <= 1000; i++) tree.insert(i)
      const h = tree.height()
      const logN = Math.ceil(Math.log2(1001)) - 1
      expect(h).toBeLessThanOrEqual(logN * 3)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after deleting all', () => {
      tree.insert(1)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should work on empty tree', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should allow inserts after clear', () => {
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size()).toBe(1)
      expect(tree.contains(2)).toBe(true)
      expect(tree.contains(1)).toBe(false)
    })
  })

  describe('clone', () => {
    beforeEach(() => {
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(9)
    })

    it('should create an independent copy', () => {
      const cloned = tree.clone()
      expect(cloned.size()).toBe(5)
      expect(cloned.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should be independent from original', () => {
      const cloned = tree.clone()
      cloned.delete(5)
      expect(tree.contains(5)).toBe(true)
      expect(cloned.contains(5)).toBe(false)
    })

    it('should clone empty tree', () => {
      const t = new WeightBalancedTree<number>()
      const cloned = t.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const t = new WeightBalancedTree<string>((a, b) => b.localeCompare(a))
      t.insert('a')
      t.insert('b')
      t.insert('c')
      const cloned = t.clone()
      expect(cloned.toArray()).toEqual(['c', 'b', 'a'])
    })
  })

  describe('static from', () => {
    it('should create tree from array', () => {
      const t = WeightBalancedTree.from([5, 3, 7, 1, 9])
      expect(t.size()).toBe(5)
      expect(t.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('should handle empty array', () => {
      const t = WeightBalancedTree.from<number>([])
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle single element array', () => {
      const t = WeightBalancedTree.from([42])
      expect(t.size()).toBe(1)
      expect(t.contains(42)).toBe(true)
    })

    it('should handle duplicates in array', () => {
      const t = WeightBalancedTree.from([3, 3, 3])
      expect(t.size()).toBe(1)
    })

    it('should accept custom options', () => {
      const t = WeightBalancedTree.from(['c', 'a', 'b'], {
        compare: (a: string, b: string) => a.localeCompare(b),
      })
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('should produce sorted output', () => {
      const t = WeightBalancedTree.from([9, 4, 7, 1, 3, 8, 5, 2, 6])
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('stats', () => {
    it('should return stats for empty tree', () => {
      const s = tree.stats()
      expect(s.size).toBe(0)
      expect(s.height).toBe(-1)
      expect(s.isBalanced).toBe(true)
    })

    it('should return stats for single element', () => {
      tree.insert(1)
      const s = tree.stats()
      expect(s.size).toBe(1)
      expect(s.height).toBe(0)
      expect(s.isBalanced).toBe(true)
    })

    it('should return correct stats for populated tree', () => {
      for (let i = 1; i <= 100; i++) tree.insert(i)
      const s = tree.stats()
      expect(s.size).toBe(100)
      expect(s.height).toBeGreaterThan(0)
      expect(s.idealHeight).toBeGreaterThanOrEqual(0)
      expect(s.minHeight).toBeLessThanOrEqual(s.height)
    })

    it('should indicate balanced for balanced tree', () => {
      for (let i = 1; i <= 100; i++) tree.insert(i)
      const s = tree.stats()
      expect(s.isBalanced).toBe(true)
    })
  })

  describe('balance verification', () => {
    it('should maintain BST ordering after 100 sequential insertions', () => {
      for (let i = 0; i < 100; i++) tree.insert(i)
      const keys = tree.toArray()
      for (let i = 0; i < 99; i++) {
        expect(keys[i]! < keys[i + 1]!).toBe(true)
      }
    })

    it('should maintain BST ordering after mixed operations', () => {
      for (let i = 0; i < 50; i++) tree.insert(i)
      for (let i = 0; i < 25; i++) tree.delete(i)
      for (let i = 50; i < 75; i++) tree.insert(i)
      const keys = tree.toArray()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('should maintain balance after alternating insert/delete', () => {
      for (let i = 0; i < 500; i++) {
        tree.insert(i)
        if (i > 0 && i % 3 === 0) tree.delete(i - 1)
      }
      const keys = tree.toArray()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('should handle insert delete cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) tree.insert(i)
        for (let i = 0; i < 20; i++) tree.delete(i)
        expect(tree.isEmpty()).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle empty tree operations gracefully', () => {
      expect(tree.delete(1)).toBe(false)
      expect(tree.search(1)).toBeUndefined()
      expect(tree.contains(1)).toBe(false)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
      expect(tree.successor(1)).toBeUndefined()
      expect(tree.predecessor(1)).toBeUndefined()
      expect(tree.range(1, 10)).toEqual([])
      expect(tree.toArray()).toEqual([])
    })

    it('should handle single element operations', () => {
      tree.insert(1)
      expect(tree.size()).toBe(1)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(1)
      expect(tree.search(1)).toBe(1)
      expect(tree.delete(1)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle two elements', () => {
      tree.insert(1)
      tree.insert(2)
      expect(tree.size()).toBe(2)
      expect(tree.toArray()).toEqual([1, 2])
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(2)
    })

    it('should handle large range of keys', () => {
      tree.insert(-1000)
      tree.insert(0)
      tree.insert(1000)
      expect(tree.min()).toBe(-1000)
      expect(tree.max()).toBe(1000)
    })

    it('should handle zero as key', () => {
      tree.insert(0)
      expect(tree.contains(0)).toBe(true)
      expect(tree.search(0)).toBe(0)
    })

    it('should handle negative keys', () => {
      tree.insert(-10)
      tree.insert(0)
      tree.insert(10)
      expect(tree.toArray()).toEqual([-10, 0, 10])
    })
  })

  describe('large trees', () => {
    it('should handle 10000 sequential inserts', () => {
      for (let i = 1; i <= 10000; i++) tree.insert(i)
      expect(tree.size()).toBe(10000)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(10000)
    })

    it('should handle 10000 reverse sequential inserts', () => {
      for (let i = 10000; i >= 1; i--) tree.insert(i)
      expect(tree.size()).toBe(10000)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(10000)
    })

    it('should maintain sorted order for 10000 elements', () => {
      for (let i = 1; i <= 10000; i++) tree.insert(i)
      const arr = tree.toArray()
      expect(arr.length).toBe(10000)
      for (let i = 0; i < 9999; i++) {
        expect(arr[i]! < arr[i + 1]!).toBe(true)
      }
    })

    it('should handle range queries on large tree', () => {
      for (let i = 1; i <= 10000; i++) tree.insert(i)
      const result = tree.range(100, 200)
      expect(result.length).toBe(101)
      expect(result[0]).toBe(100)
      expect(result[100]).toBe(200)
    })

    it('should handle deleting from large tree', () => {
      for (let i = 1; i <= 10000; i++) tree.insert(i)
      for (let i = 1; i <= 5000; i++) tree.delete(i)
      expect(tree.size()).toBe(5000)
      expect(tree.min()).toBe(5001)
    })

    it('should handle delete all 10000 elements', () => {
      for (let i = 1; i <= 10000; i++) tree.insert(i)
      for (let i = 1; i <= 10000; i++) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should clone large tree', () => {
      for (let i = 1; i <= 5000; i++) tree.insert(i)
      const cloned = tree.clone()
      expect(cloned.size()).toBe(5000)
      expect(cloned.toArray()).toEqual(tree.toArray())
      cloned.delete(1)
      expect(tree.contains(1)).toBe(true)
      expect(cloned.contains(1)).toBe(false)
    })

    it('should handle shuffled insertions', () => {
      const keys = Array.from({ length: 5000 }, (_, i) => i + 1)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[keys[i], keys[j]] = [keys[j]!, keys[i]!]
      }
      for (const k of keys) tree.insert(k)
      const result = tree.toArray()
      expect(result).toEqual(Array.from({ length: 5000 }, (_, i) => i + 1))
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse order comparator', () => {
      const t = new WeightBalancedTree<number>((a, b) => b - a)
      t.insert(1)
      t.insert(5)
      t.insert(3)
      expect(t.toArray()).toEqual([5, 3, 1])
    })

    it('should work with case-insensitive string comparator', () => {
      const t = new WeightBalancedTree<string>((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      t.insert('Banana')
      t.insert('apple')
      t.insert('Cherry')
      expect(t.toArray()).toEqual(['apple', 'Banana', 'Cherry'])
    })

    it('should handle string keys with default comparator', () => {
      const t = new WeightBalancedTree<string>()
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('type exports', () => {
    it('should support WBNode interface', () => {
      const node: WBNode<number> = {
        key: 1,
        left: null,
        right: null,
        size: 1,
      }
      expect(node.key).toBe(1)
      expect(node.size).toBe(1)
    })

    it('should support CompareFunction type', () => {
      const cmp: CompareFunction<number> = (a, b) => a - b
      expect(cmp(1, 2)).toBe(-1)
      expect(cmp(2, 1)).toBe(1)
      expect(cmp(1, 1)).toBe(0)
    })

    it('should support WeightBalancedTreeOptions interface', () => {
      const opts: WeightBalancedTreeOptions<number> = {
        compare: (a, b) => a - b,
        delta: 3,
        gamma: 2,
      }
      expect(opts.delta).toBe(3)
      expect(opts.gamma).toBe(2)
    })

    it('should support WeightBalancedTreeStats interface', () => {
      const s: WeightBalancedTreeStats = {
        size: 10,
        height: 3,
        minHeight: 3,
        isBalanced: true,
        idealHeight: 3,
      }
      expect(s.size).toBe(10)
      expect(s.isBalanced).toBe(true)
    })
  })

  describe('DEFAULT_WBT_OPTIONS', () => {
    it('should have default delta of 3', () => {
      expect(DEFAULT_WBT_OPTIONS.delta).toBe(3)
    })

    it('should have default gamma of 2', () => {
      expect(DEFAULT_WBT_OPTIONS.gamma).toBe(2)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 sequential keys', () => {
      for (let i = 0; i < 1000; i++) tree.insert(i)
      expect(tree.size()).toBe(1000)
      const keys = tree.toArray()
      for (let i = 0; i < 1000; i++) {
        expect(keys[i]).toBe(i)
      }
    })

    it('should handle random insertions verify all present', () => {
      const keys = new Set<number>()
      for (let i = 0; i < 500; i++) {
        const k = Math.floor(Math.random() * 10000)
        keys.add(k)
        tree.insert(k)
      }
      expect(tree.size()).toBe(keys.size)
      for (const k of keys) {
        expect(tree.contains(k)).toBe(true)
      }
    })

    it('should handle delete every other element from 500', () => {
      for (let i = 0; i < 500; i++) tree.insert(i)
      for (let i = 0; i < 500; i += 2) tree.delete(i)
      expect(tree.size()).toBe(250)
      const keys = tree.toArray()
      for (const k of keys) {
        expect(k % 2).toBe(1)
      }
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('should handle range queries after heavy operations', () => {
      for (let i = 0; i < 500; i++) tree.insert(i)
      for (let i = 100; i < 400; i++) tree.delete(i)
      const result = tree.range(0, 499)
      const expected = Array.from({ length: 500 }, (_, i) => i).filter(
        (i) => i < 100 || i >= 400,
      )
      expect(result).toEqual(expected)
    })

    it('should handle forEach after clear and reinsert', () => {
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      tree.insert(3)
      const keys: number[] = []
      tree.forEach((key) => keys.push(key))
      expect(keys).toEqual([2, 3])
    })

    it('should handle from factory with many entries', () => {
      const keys: number[] = []
      for (let i = 500; i >= 0; i--) keys.push(i)
      const t = WeightBalancedTree.from(keys)
      expect(t.size()).toBe(501)
      const result = t.toArray()
      for (let i = 0; i <= 500; i++) {
        expect(result[i]).toBe(i)
      }
    })
  })
})
