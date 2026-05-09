import { describe, it, expect, beforeEach } from 'vitest'
import { TwoThreeTree } from '../../src/core/two-three-tree/two-three-tree.js'
import { DEFAULT_COMPARE } from '../../src/core/two-three-tree/types.js'
import type { TwoThreeNode, SplitResult } from '../../src/core/two-three-tree/types.js'

describe('TwoThreeTree', () => {
  let tree: TwoThreeTree<number>

  beforeEach(() => {
    tree = new TwoThreeTree<number>()
  })

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
      expect(t.inorder()).toEqual(['apple', 'banana', 'cherry'])
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
      expect(t.inorder()).toEqual([3, 2, 1])
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      tree.insert(10)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(true)
    })

    it('should insert multiple elements', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.size()).toBe(3)
    })

    it('should not insert duplicate keys', () => {
      tree.insert(10)
      tree.insert(10)
      expect(tree.size()).toBe(1)
    })

    it('should insert in ascending order', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(10)
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should insert in descending order', () => {
      for (let i = 10; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(10)
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should insert negative numbers', () => {
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(0)
      tree.insert(5)
      tree.insert(10)
      expect(tree.size()).toBe(5)
      expect(tree.inorder()).toEqual([-10, -5, 0, 5, 10])
    })

    it('should insert zero', () => {
      tree.insert(0)
      expect(tree.size()).toBe(1)
      expect(tree.search(0)).toBe(true)
    })

    it('should handle repeated duplicates gracefully', () => {
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toBe(true)
    })

    it('should handle inserting same value after deletion', () => {
      tree.insert(10)
      tree.delete(10)
      expect(tree.size()).toBe(0)
      tree.insert(10)
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toBe(true)
    })
  })

  describe('search', () => {
    it('should return false for empty tree', () => {
      expect(tree.search(5)).toBe(false)
    })

    it('should find an existing key', () => {
      tree.insert(5)
      expect(tree.search(5)).toBe(true)
    })

    it('should return false for non-existing key', () => {
      tree.insert(5)
      expect(tree.search(10)).toBe(false)
    })

    it('should find keys in a multi-element tree', () => {
      tree.insert(5)
      tree.insert(10)
      tree.insert(15)
      expect(tree.search(5)).toBe(true)
      expect(tree.search(10)).toBe(true)
      expect(tree.search(15)).toBe(true)
      expect(tree.search(20)).toBe(false)
    })

    it('should find keys after many operations', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.search(i)).toBe(true)
      }
      expect(tree.search(50)).toBe(false)
      expect(tree.search(-1)).toBe(false)
    })
  })

  describe('contains', () => {
    it('should be an alias for search', () => {
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(10)).toBe(false)
    })

    it('should return false for empty tree', () => {
      expect(tree.contains(1)).toBe(false)
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

    it('should return the minimum of multiple elements', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(1)
      expect(tree.min()).toBe(1)
    })

    it('should update min after deletion', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.delete(1)
      expect(tree.min()).toBe(5)
    })

    it('should handle negative minimum', () => {
      tree.insert(-100)
      tree.insert(0)
      tree.insert(100)
      expect(tree.min()).toBe(-100)
    })

    it('should return correct min after many insertions', () => {
      for (let i = 100; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.min()).toBe(0)
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

    it('should return the maximum of multiple elements', () => {
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(20)
      expect(tree.max()).toBe(20)
    })

    it('should update max after deletion', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.delete(10)
      expect(tree.max()).toBe(5)
    })

    it('should handle negative maximum', () => {
      tree.insert(-100)
      tree.insert(-50)
      tree.insert(-1)
      expect(tree.max()).toBe(-1)
    })

    it('should return correct max after many insertions', () => {
      for (let i = 0; i <= 100; i++) {
        tree.insert(i)
      }
      expect(tree.max()).toBe(100)
    })
  })

  describe('inorder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.inorder()).toEqual([])
    })

    it('should return single element', () => {
      tree.insert(5)
      expect(tree.inorder()).toEqual([5])
    })

    it('should return sorted order', () => {
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.inorder()).toEqual([1, 2, 3])
    })

    it('should return correct order for many elements', () => {
      const values = [50, 30, 70, 10, 40, 60, 80, 5, 15, 35, 45]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.inorder()).toEqual([...values].sort((a, b) => a - b))
    })

    it('should maintain sorted order after deletions', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      tree.delete(3)
      tree.delete(7)
      expect(tree.inorder()).toEqual([1, 2, 4, 5, 6, 8, 9, 10])
    })
  })

  describe('preorder', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.preorder()).toEqual([])
    })

    it('should return single element', () => {
      tree.insert(5)
      expect(tree.preorder()).toEqual([5])
    })

    it('should return all elements', () => {
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const pre = tree.preorder()
      expect(pre.length).toBe(3)
      expect(pre.sort((a, b) => a - b)).toEqual([10, 20, 30])
    })
  })

  describe('rangeSearch', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.rangeSearch(1, 10)).toEqual([])
    })

    it('should return matching elements in range', () => {
      for (let i = 1; i <= 20; i++) {
        tree.insert(i)
      }
      expect(tree.rangeSearch(5, 10)).toEqual([5, 6, 7, 8, 9, 10])
    })

    it('should return single element range', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.rangeSearch(5, 5)).toEqual([5])
    })

    it('should return empty for range with no matches', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.rangeSearch(20, 30)).toEqual([])
    })

    it('should handle range at boundaries', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.rangeSearch(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should handle partial overlap at low end', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.rangeSearch(-5, 3)).toEqual([1, 2, 3])
    })

    it('should handle partial overlap at high end', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.rangeSearch(8, 15)).toEqual([8, 9, 10])
    })

    it('should return elements in sorted order', () => {
      const values = [50, 10, 90, 30, 70]
      for (const v of values) {
        tree.insert(v)
      }
      const range = tree.rangeSearch(20, 80)
      expect(range).toEqual([30, 50, 70])
    })

    it('should handle negative ranges', () => {
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(0)
      tree.insert(5)
      tree.insert(10)
      expect(tree.rangeSearch(-7, 3)).toEqual([-5, 0])
    })
  })

  describe('successor', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.successor(5)).toBeUndefined()
    })

    it('should return the next larger key', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.successor(1)).toBe(3)
    })

    it('should return undefined if no successor', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.successor(5)).toBeUndefined()
    })

    it('should return undefined for non-existing key', () => {
      tree.insert(1)
      tree.insert(3)
      expect(tree.successor(2)).toBe(3)
    })

    it('should find successor across multiple levels', () => {
      for (let i = 0; i < 20; i += 2) {
        tree.insert(i)
      }
      expect(tree.successor(0)).toBe(2)
      expect(tree.successor(10)).toBe(12)
      expect(tree.successor(18)).toBeUndefined()
    })

    it('should return immediate successor in a dense tree', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.successor(5)).toBe(6)
      expect(tree.successor(1)).toBe(2)
      expect(tree.successor(9)).toBe(10)
    })

    it('should return successor for key not in tree', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.successor(3)).toBe(5)
      expect(tree.successor(7)).toBe(10)
    })
  })

  describe('predecessor', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.predecessor(5)).toBeUndefined()
    })

    it('should return the next smaller key', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.predecessor(5)).toBe(3)
    })

    it('should return undefined if no predecessor', () => {
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('should find predecessor for non-existing key', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.predecessor(7)).toBe(5)
      expect(tree.predecessor(3)).toBe(1)
    })

    it('should find predecessor across multiple levels', () => {
      for (let i = 0; i < 20; i += 2) {
        tree.insert(i)
      }
      expect(tree.predecessor(2)).toBe(0)
      expect(tree.predecessor(10)).toBe(8)
      expect(tree.predecessor(0)).toBeUndefined()
    })

    it('should return immediate predecessor in a dense tree', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.predecessor(6)).toBe(5)
      expect(tree.predecessor(2)).toBe(1)
      expect(tree.predecessor(10)).toBe(9)
    })
  })

  describe('delete', () => {
    it('should return false for empty tree', () => {
      expect(tree.delete(5)).toBe(false)
    })

    it('should delete a single element', () => {
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.search(5)).toBe(false)
    })

    it('should return false for non-existing key', () => {
      tree.insert(5)
      expect(tree.delete(10)).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('should delete and leave other elements intact', () => {
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.delete(5)
      expect(tree.size()).toBe(2)
      expect(tree.search(1)).toBe(true)
      expect(tree.search(5)).toBe(false)
      expect(tree.search(10)).toBe(true)
    })

    it('should delete the minimum element', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      tree.delete(1)
      expect(tree.min()).toBe(2)
      expect(tree.size()).toBe(9)
    })

    it('should delete the maximum element', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      tree.delete(10)
      expect(tree.max()).toBe(9)
      expect(tree.size()).toBe(9)
    })

    it('should delete from the middle', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      tree.delete(5)
      expect(tree.search(5)).toBe(false)
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 10])
    })

    it('should handle deleting all elements one by one', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i)
      }
      for (let i = 1; i <= 5; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should handle delete in reverse order', () => {
      for (let i = 1; i <= 5; i++) {
        tree.insert(i)
      }
      for (let i = 5; i >= 1; i--) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain sorted order after deletions', () => {
      for (let i = 1; i <= 20; i++) {
        tree.insert(i)
      }
      tree.delete(5)
      tree.delete(10)
      tree.delete(15)
      const order = tree.inorder()
      for (let i = 1; i < order.length; i++) {
        expect(order[i]! > order[i - 1]!).toBe(true)
      }
    })

    it('should handle double delete gracefully', () => {
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.delete(5)).toBe(false)
    })

    it('should handle delete with borrowing from left sibling', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      tree.delete(1)
      expect(tree.inorder()).toEqual([2, 3, 4, 5])
      expect(tree.size()).toBe(4)
    })

    it('should handle delete with borrowing from right sibling', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      tree.delete(5)
      expect(tree.inorder()).toEqual([1, 2, 3, 4])
      expect(tree.size()).toBe(4)
    })

    it('should handle delete with merging', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      expect(tree.inorder()).toEqual([1, 3])
      expect(tree.size()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should count inserted elements', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size()).toBe(3)
    })

    it('should decrease after deletion', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      expect(tree.size()).toBe(2)
    })

    it('should not count duplicates', () => {
      tree.insert(1)
      tree.insert(1)
      tree.insert(1)
      expect(tree.size()).toBe(1)
    })
  })

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.height()).toBe(0)
    })

    it('should return 1 for single element', () => {
      tree.insert(1)
      expect(tree.height()).toBe(1)
    })

    it('should return correct height for balanced tree', () => {
      for (let i = 1; i <= 3; i++) {
        tree.insert(i)
      }
      expect(tree.height()).toBeLessThanOrEqual(2)
    })

    it('should maintain O(log n) height for sequential inserts', () => {
      for (let i = 1; i <= 1000; i++) {
        tree.insert(i)
      }
      const maxExpected = Math.ceil(Math.log2(1000)) + 1
      expect(tree.height()).toBeLessThanOrEqual(maxExpected)
    })

    it('should maintain O(log n) height for random inserts', () => {
      const values = Array.from({ length: 1000 }, (_, i) => i)
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[values[i]!, values[j]!] = [values[j]!, values[i]!]
      }
      for (const v of values) {
        tree.insert(v)
      }
      const maxExpected = Math.ceil(Math.log2(1000)) + 1
      expect(tree.height()).toBeLessThanOrEqual(maxExpected)
    })

    it('should update height after deletions', () => {
      for (let i = 1; i <= 7; i++) {
        tree.insert(i)
      }
      const h1 = tree.height()
      for (let i = 1; i <= 5; i++) {
        tree.delete(i)
      }
      expect(tree.height()).toBeLessThanOrEqual(h1)
    })

    it('should be 0 after clearing all elements', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      for (let i = 1; i <= 10; i++) {
        tree.delete(i)
      }
      expect(tree.height()).toBe(0)
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

    it('should return true after clearing', () => {
      tree.insert(1)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after deleting all', () => {
      tree.insert(1)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty tree', () => {
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should clear a tree with elements', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.height()).toBe(0)
      expect(tree.inorder()).toEqual([])
    })

    it('should allow inserts after clear', () => {
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size()).toBe(1)
      expect(tree.search(2)).toBe(true)
      expect(tree.search(1)).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone an empty tree', () => {
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone a tree with elements', () => {
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      const cloned = tree.clone()
      expect(cloned.size()).toBe(tree.size())
      expect(cloned.inorder()).toEqual(tree.inorder())
    })

    it('should be independent from original', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      cloned.insert(4)
      cloned.delete(1)
      expect(tree.size()).toBe(3)
      expect(tree.search(4)).toBe(false)
      expect(tree.search(1)).toBe(true)
      expect(cloned.size()).toBe(3)
      expect(cloned.search(4)).toBe(true)
      expect(cloned.search(1)).toBe(false)
    })

    it('should preserve comparator', () => {
      const t = new TwoThreeTree<string>((a, b) => a.localeCompare(b))
      t.insert('a')
      t.insert('b')
      const cloned = t.clone()
      cloned.insert('c')
      expect(cloned.inorder()).toEqual(['a', 'b', 'c'])
    })

    it('should handle deep structure correctly', () => {
      for (let i = 1; i <= 50; i++) {
        tree.insert(i)
      }
      const cloned = tree.clone()
      expect(cloned.height()).toBe(tree.height())
      expect(cloned.min()).toBe(tree.min())
      expect(cloned.max()).toBe(tree.max())
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

    it('should match inorder', () => {
      for (let i = 1; i <= 20; i++) {
        tree.insert(i)
      }
      expect(tree.toArray()).toEqual(tree.inorder())
    })
  })

  describe('fromArray', () => {
    it('should create tree from empty array', () => {
      const t = TwoThreeTree.fromArray([])
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create tree from array', () => {
      const t = TwoThreeTree.fromArray([3, 1, 2])
      expect(t.size()).toBe(3)
      expect(t.inorder()).toEqual([1, 2, 3])
    })

    it('should handle duplicates in array', () => {
      const t = TwoThreeTree.fromArray([1, 2, 2, 3])
      expect(t.size()).toBe(3)
    })

    it('should accept custom comparator', () => {
      const t = TwoThreeTree.fromArray(['banana', 'apple', 'cherry'], (a, b) =>
        a.localeCompare(b),
      )
      expect(t.inorder()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle large arrays', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1)
      const t = TwoThreeTree.fromArray(arr)
      expect(t.size()).toBe(100)
      expect(t.min()).toBe(1)
      expect(t.max()).toBe(100)
    })
  })

  describe('fromArray/toArray roundtrip', () => {
    it('should roundtrip correctly', () => {
      const original = [5, 3, 8, 1, 4, 7, 9]
      const t = TwoThreeTree.fromArray(original)
      expect(t.toArray()).toEqual([...original].sort((a, b) => a - b))
    })

    it('should roundtrip with duplicates removed', () => {
      const original = [1, 2, 2, 3, 3, 3]
      const t = TwoThreeTree.fromArray(original)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('should roundtrip empty array', () => {
      const t = TwoThreeTree.fromArray([])
      const arr = t.toArray()
      const t2 = TwoThreeTree.fromArray(arr)
      expect(t2.toArray()).toEqual([])
    })
  })

  describe('balance after many inserts', () => {
    it('should remain balanced after 100 sequential inserts', () => {
      for (let i = 1; i <= 100; i++) {
        tree.insert(i)
      }
      const maxH = Math.ceil(Math.log2(100)) + 1
      expect(tree.height()).toBeLessThanOrEqual(maxH)
      expect(tree.inorder().length).toBe(100)
    })

    it('should remain balanced after 500 sequential inserts', () => {
      for (let i = 1; i <= 500; i++) {
        tree.insert(i)
      }
      const maxH = Math.ceil(Math.log2(500)) + 1
      expect(tree.height()).toBeLessThanOrEqual(maxH)
    })

    it('should remain balanced after alternating inserts', () => {
      for (let i = 50; i >= 1; i--) {
        tree.insert(i)
        tree.insert(100 - i)
      }
      const maxH = Math.ceil(Math.log2(100)) + 1
      expect(tree.height()).toBeLessThanOrEqual(maxH)
      expect(tree.size()).toBe(99)
    })
  })

  describe('empty tree edge cases', () => {
    it('should handle min on empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should handle max on empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should handle inorder on empty tree', () => {
      expect(tree.inorder()).toEqual([])
    })

    it('should handle preorder on empty tree', () => {
      expect(tree.preorder()).toEqual([])
    })

    it('should handle rangeSearch on empty tree', () => {
      expect(tree.rangeSearch(1, 10)).toEqual([])
    })

    it('should handle successor on empty tree', () => {
      expect(tree.successor(1)).toBeUndefined()
    })

    it('should handle predecessor on empty tree', () => {
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('should handle delete on empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should handle toArray on empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })
  })

  describe('single element operations', () => {
    beforeEach(() => {
      tree.insert(42)
    })

    it('should have size 1', () => {
      expect(tree.size()).toBe(1)
    })

    it('should find the element', () => {
      expect(tree.search(42)).toBe(true)
    })

    it('should return correct min', () => {
      expect(tree.min()).toBe(42)
    })

    it('should return correct max', () => {
      expect(tree.max()).toBe(42)
    })

    it('should have height 1', () => {
      expect(tree.height()).toBe(1)
    })

    it('should not have a successor', () => {
      expect(tree.successor(42)).toBeUndefined()
    })

    it('should not have a predecessor', () => {
      expect(tree.predecessor(42)).toBeUndefined()
    })

    it('should delete the element', () => {
      expect(tree.delete(42)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return correct inorder', () => {
      expect(tree.inorder()).toEqual([42])
    })

    it('should return correct preorder', () => {
      expect(tree.preorder()).toEqual([42])
    })

    it('should return correct rangeSearch', () => {
      expect(tree.rangeSearch(1, 100)).toEqual([42])
    })
  })

  describe('custom comparator', () => {
    it('should work with string comparator', () => {
      const t = new TwoThreeTree<string>((a, b) => a.localeCompare(b))
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.inorder()).toEqual(['apple', 'banana', 'cherry'])
      expect(t.min()).toBe('apple')
      expect(t.max()).toBe('cherry')
    })

    it('should work with object comparator', () => {
      interface Item {
        id: number
        name: string
      }
      const t = new TwoThreeTree<Item>((a, b) => a.id - b.id)
      t.insert({ id: 3, name: 'c' })
      t.insert({ id: 1, name: 'a' })
      t.insert({ id: 2, name: 'b' })
      expect(t.min()?.name).toBe('a')
      expect(t.max()?.name).toBe('c')
    })

    it('should work with descending comparator', () => {
      const t = new TwoThreeTree<number>((a, b) => b - a)
      t.insert(1)
      t.insert(5)
      t.insert(3)
      expect(t.inorder()).toEqual([5, 3, 1])
      expect(t.min()).toBe(5)
      expect(t.max()).toBe(1)
    })

    it('should pass comparator to clone', () => {
      const t = new TwoThreeTree<number>((a, b) => b - a)
      t.insert(1)
      t.insert(2)
      t.insert(3)
      const cloned = t.clone()
      expect(cloned.inorder()).toEqual([3, 2, 1])
    })
  })

  describe('random insert/delete sequences', () => {
    it('should handle random insertions', () => {
      const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 200))
      const unique = [...new Set(values)]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.size()).toBe(unique.length)
      expect(tree.inorder()).toEqual([...unique].sort((a, b) => a - b))
    })

    it('should handle random insertions then deletions', () => {
      const values = Array.from({ length: 50 }, (_, i) => i + 1)
      for (const v of values) {
        tree.insert(v)
      }
      const toDelete = values.filter((_, i) => i % 2 === 0)
      for (const v of toDelete) {
        tree.delete(v)
      }
      const remaining = values.filter((_, i) => i % 2 !== 0)
      expect(tree.size()).toBe(remaining.length)
      expect(tree.inorder()).toEqual(remaining)
    })

    it('should handle interleaved insert and delete', () => {
      for (let i = 1; i <= 20; i++) {
        tree.insert(i)
      }
      for (let i = 1; i <= 10; i++) {
        tree.delete(i)
      }
      for (let i = 21; i <= 30; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(20)
      const order = tree.inorder()
      expect(order[0]).toBe(11)
      expect(order[order.length - 1]).toBe(30)
    })

    it('should survive stress test', () => {
      const inserted = new Set<number>()
      for (let i = 0; i < 200; i++) {
        const val = Math.floor(Math.random() * 100)
        tree.insert(val)
        inserted.add(val)
      }
      expect(tree.size()).toBe(inserted.size)
      for (const v of inserted) {
        expect(tree.search(v)).toBe(true)
      }
      for (const v of inserted) {
        tree.delete(v)
      }
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('sequential insert (worst case for BSTs)', () => {
    it('should maintain low height for sequential inserts', () => {
      for (let i = 1; i <= 100; i++) {
        tree.insert(i)
      }
      expect(tree.height()).toBeLessThanOrEqual(Math.ceil(Math.log2(100)) + 1)
    })

    it('should produce correct inorder for sequential inserts', () => {
      for (let i = 1; i <= 20; i++) {
        tree.insert(i)
      }
      expect(tree.inorder()).toEqual(
        Array.from({ length: 20 }, (_, i) => i + 1),
      )
    })

    it('should produce correct min/max for sequential inserts', () => {
      for (let i = 1; i <= 50; i++) {
        tree.insert(i)
      }
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(50)
    })

    it('should handle reverse sequential inserts', () => {
      for (let i = 100; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.height()).toBeLessThanOrEqual(Math.ceil(Math.log2(100)) + 1)
      expect(tree.min()).toBe(1)
      expect(tree.max()).toBe(100)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_COMPARE', () => {
      expect(DEFAULT_COMPARE).toBeDefined()
      expect(DEFAULT_COMPARE(1, 2)).toBe(-1)
      expect(DEFAULT_COMPARE(2, 1)).toBe(1)
      expect(DEFAULT_COMPARE(1, 1)).toBe(0)
    })
  })
})
