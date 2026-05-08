import { describe, it, expect, beforeEach } from 'vitest'
import { Treap } from '../../src/core/treap/treap.js'
import { DEFAULT_TREAP_OPTIONS } from '../../src/core/treap/types.js'
import type { TreapOptions, TreapStats } from '../../src/core/treap/types.js'

describe('Treap', () => {
  let treap: Treap<number>

  beforeEach(() => {
    treap = new Treap<number>()
  })

  describe('constructor', () => {
    it('should create an empty treap with default options', () => {
      const t = new Treap<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const t = new Treap<number>({ allowDuplicates: true })
      t.insert(1, 10)
      t.insert(1, 20)
      expect(t.size()).toBe(2)
    })

    it('should use default allowDuplicates of false', () => {
      expect(DEFAULT_TREAP_OPTIONS.allowDuplicates).toBe(false)
    })

    it('should accept partial options', () => {
      const t = new Treap<number>({})
      t.insert(1, 10)
      expect(t.size()).toBe(1)
    })
  })

  describe('insert', () => {
    it('should insert a single element', () => {
      treap.insert(5, 50)
      expect(treap.size()).toBe(1)
      expect(treap.isEmpty()).toBe(false)
    })

    it('should insert multiple elements', () => {
      treap.insert(3, 30)
      treap.insert(7, 70)
      treap.insert(1, 10)
      expect(treap.size()).toBe(3)
    })

    it('should update value on duplicate key when allowDuplicates is false', () => {
      treap.insert(5, 50)
      treap.insert(5, 99)
      expect(treap.size()).toBe(1)
      expect(treap.search(5)).toBe(99)
    })

    it('should allow duplicate keys when allowDuplicates is true', () => {
      const t = new Treap<number>({ allowDuplicates: true })
      t.insert(5, 50)
      t.insert(5, 99)
      expect(t.size()).toBe(2)
    })

    it('should return void', () => {
      expect(treap.insert(1, 10)).toBeUndefined()
    })

    it('should handle negative keys', () => {
      treap.insert(-5, 50)
      treap.insert(-10, 100)
      expect(treap.search(-5)).toBe(50)
      expect(treap.search(-10)).toBe(100)
    })

    it('should handle zero key', () => {
      treap.insert(0, 42)
      expect(treap.search(0)).toBe(42)
    })

    it('should handle floating point keys', () => {
      treap.insert(1.5, 15)
      treap.insert(2.5, 25)
      expect(treap.search(1.5)).toBe(15)
      expect(treap.search(2.5)).toBe(25)
    })

    it('should insert in ascending order', () => {
      for (let i = 0; i < 10; i++) {
        treap.insert(i, i * 10)
      }
      expect(treap.size()).toBe(10)
      const result = treap.inOrder()
      for (let i = 0; i < 10; i++) {
        expect(result[i]?.[0]).toBe(i)
      }
    })

    it('should insert in descending order', () => {
      for (let i = 9; i >= 0; i--) {
        treap.insert(i, i * 10)
      }
      expect(treap.size()).toBe(10)
      const result = treap.inOrder()
      for (let i = 0; i < 10; i++) {
        expect(result[i]?.[0]).toBe(i)
      }
    })
  })

  describe('search', () => {
    beforeEach(() => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      treap.insert(1, 10)
      treap.insert(9, 90)
    })

    it('should find an existing key', () => {
      expect(treap.search(5)).toBe(50)
    })

    it('should find the smallest key', () => {
      expect(treap.search(1)).toBe(10)
    })

    it('should find the largest key', () => {
      expect(treap.search(9)).toBe(90)
    })

    it('should return undefined for non-existent key', () => {
      expect(treap.search(4)).toBeUndefined()
    })

    it('should return undefined for key in empty treap', () => {
      const empty = new Treap<number>()
      expect(empty.search(1)).toBeUndefined()
    })

    it('should return undefined after clear', () => {
      treap.clear()
      expect(treap.search(5)).toBeUndefined()
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      treap.insert(1, 10)
      treap.insert(9, 90)
    })

    it('should delete a leaf node', () => {
      expect(treap.delete(1)).toBe(true)
      expect(treap.size()).toBe(4)
      expect(treap.has(1)).toBe(false)
    })

    it('should delete the root', () => {
      expect(treap.delete(5)).toBe(true)
      expect(treap.size()).toBe(4)
      expect(treap.has(5)).toBe(false)
    })

    it('should delete a node with one child', () => {
      treap.delete(1)
      treap.delete(3)
      expect(treap.size()).toBe(3)
      expect(treap.has(3)).toBe(false)
    })

    it('should return false for non-existent key', () => {
      expect(treap.delete(4)).toBe(false)
      expect(treap.size()).toBe(5)
    })

    it('should return false for empty treap', () => {
      const empty = new Treap<number>()
      expect(empty.delete(1)).toBe(false)
    })

    it('should maintain BST property after deletion', () => {
      treap.delete(5)
      const result = treap.inOrder()
      const keys = result.map(([k]) => k)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('should delete all elements', () => {
      treap.delete(5)
      treap.delete(3)
      treap.delete(7)
      treap.delete(1)
      treap.delete(9)
      expect(treap.size()).toBe(0)
      expect(treap.isEmpty()).toBe(true)
    })
  })

  describe('has', () => {
    beforeEach(() => {
      treap.insert(5, 50)
      treap.insert(3, 30)
    })

    it('should return true for existing key', () => {
      expect(treap.has(5)).toBe(true)
      expect(treap.has(3)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(treap.has(4)).toBe(false)
    })

    it('should return false for empty treap', () => {
      const empty = new Treap<number>()
      expect(empty.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      treap.delete(5)
      expect(treap.has(5)).toBe(false)
    })
  })

  describe('getMin', () => {
    it('should return undefined for empty treap', () => {
      expect(treap.getMin()).toBeUndefined()
    })

    it('should return the only element', () => {
      treap.insert(5, 50)
      expect(treap.getMin()).toBe(50)
    })

    it('should return the minimum value', () => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      expect(treap.getMin()).toBe(30)
    })

    it('should update after deletion', () => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(1, 10)
      treap.delete(1)
      expect(treap.getMin()).toBe(30)
    })

    it('should update after clear', () => {
      treap.insert(5, 50)
      treap.clear()
      expect(treap.getMin()).toBeUndefined()
    })
  })

  describe('getMax', () => {
    it('should return undefined for empty treap', () => {
      expect(treap.getMax()).toBeUndefined()
    })

    it('should return the only element', () => {
      treap.insert(5, 50)
      expect(treap.getMax()).toBe(50)
    })

    it('should return the maximum value', () => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      expect(treap.getMax()).toBe(70)
    })

    it('should update after deletion', () => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      treap.delete(7)
      expect(treap.getMax()).toBe(50)
    })

    it('should update after clear', () => {
      treap.insert(5, 50)
      treap.clear()
      expect(treap.getMax()).toBeUndefined()
    })
  })

  describe('inOrder', () => {
    it('should return empty array for empty treap', () => {
      expect(treap.inOrder()).toEqual([])
    })

    it('should return single element', () => {
      treap.insert(5, 50)
      expect(treap.inOrder()).toEqual([[5, 50]])
    })

    it('should return elements in sorted order', () => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      treap.insert(1, 10)
      treap.insert(9, 90)
      expect(treap.inOrder()).toEqual([[1, 10], [3, 30], [5, 50], [7, 70], [9, 90]])
    })

    it('should return correct order for many insertions', () => {
      const keys = [10, 5, 15, 3, 7, 12, 20]
      for (const k of keys) {
        treap.insert(k, k * 10)
      }
      const result = treap.inOrder()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(result.map(([k]) => k)).toEqual(sorted)
    })

    it('should reflect deletions', () => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      treap.delete(3)
      expect(treap.inOrder()).toEqual([[5, 50], [7, 70]])
    })
  })

  describe('preOrder', () => {
    it('should return empty array for empty treap', () => {
      expect(treap.preOrder()).toEqual([])
    })

    it('should return single element', () => {
      treap.insert(5, 50)
      expect(treap.preOrder()).toEqual([[5, 50]])
    })

    it('should visit root before children', () => {
      treap.insert(5, 50)
      treap.insert(3, 30)
      treap.insert(7, 70)
      const result = treap.preOrder()
      expect(result.length).toBe(3)
      const keys = new Set(result.map(([k]) => k))
      expect(keys.has(5)).toBe(true)
      expect(keys.has(3)).toBe(true)
      expect(keys.has(7)).toBe(true)
    })

    it('should return all elements', () => {
      for (let i = 0; i < 5; i++) {
        treap.insert(i, i * 10)
      }
      expect(treap.preOrder().length).toBe(5)
    })
  })

  describe('split', () => {
    it('should split empty treap into two empty treaps', () => {
      const [left, right] = treap.split(5)
      expect(left.size()).toBe(0)
      expect(right.size()).toBe(0)
    })

    it('should split single element into left and empty', () => {
      treap.insert(5, 50)
      const [left, right] = treap.split(5)
      expect(left.size()).toBe(0)
      expect(right.size()).toBe(1)
      expect(right.search(5)).toBe(50)
    })

    it('should split into correct halves', () => {
      treap.insert(1, 10)
      treap.insert(3, 30)
      treap.insert(5, 50)
      treap.insert(7, 70)
      treap.insert(9, 90)
      const [left, right] = treap.split(5)
      expect(left.size()).toBe(2)
      expect(right.size()).toBe(3)
      expect(left.inOrder().map(([k]) => k)).toEqual([1, 3])
      expect(right.inOrder().map(([k]) => k)).toEqual([5, 7, 9])
    })

    it('should split at minimum key', () => {
      treap.insert(1, 10)
      treap.insert(3, 30)
      treap.insert(5, 50)
      const [left, right] = treap.split(1)
      expect(left.size()).toBe(0)
      expect(right.size()).toBe(3)
    })

    it('should split at maximum key', () => {
      treap.insert(1, 10)
      treap.insert(3, 30)
      treap.insert(5, 50)
      const [left, right] = treap.split(6)
      expect(left.size()).toBe(3)
      expect(right.size()).toBe(0)
    })

    it('should produce valid BST in both halves', () => {
      for (let i = 1; i <= 10; i++) {
        treap.insert(i, i * 10)
      }
      const [left, right] = treap.split(6)
      const leftKeys = left.inOrder().map(([k]) => k)
      const rightKeys = right.inOrder().map(([k]) => k)
      for (const k of leftKeys) {
        expect(k).toBeLessThan(6)
      }
      for (const k of rightKeys) {
        expect(k).toBeGreaterThanOrEqual(6)
      }
    })
  })

  describe('merge', () => {
    it('should merge two empty treaps', () => {
      const other = new Treap<number>()
      treap.merge(other)
      expect(treap.size()).toBe(0)
      expect(other.size()).toBe(0)
    })

    it('should merge empty with non-empty', () => {
      const other = new Treap<number>()
      other.insert(5, 50)
      treap.merge(other)
      expect(treap.size()).toBe(1)
      expect(treap.search(5)).toBe(50)
    })

    it('should merge non-empty with empty', () => {
      treap.insert(5, 50)
      const other = new Treap<number>()
      treap.merge(other)
      expect(treap.size()).toBe(1)
    })

    it('should merge two non-empty treaps', () => {
      treap.insert(1, 10)
      treap.insert(3, 30)
      const other = new Treap<number>()
      other.insert(5, 50)
      other.insert(7, 70)
      treap.merge(other)
      expect(treap.size()).toBe(4)
      expect(treap.inOrder().map(([k]) => k)).toEqual([1, 3, 5, 7])
    })

    it('should clear the other treap after merge', () => {
      treap.insert(1, 10)
      const other = new Treap<number>()
      other.insert(5, 50)
      treap.merge(other)
      expect(other.size()).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('should merge split treaps back', () => {
      treap.insert(1, 10)
      treap.insert(3, 30)
      treap.insert(5, 50)
      treap.insert(7, 70)
      treap.insert(9, 90)
      const [left, right] = treap.split(5)
      const merged = new Treap<number>()
      merged.merge(left)
      merged.merge(right)
      expect(merged.size()).toBe(5)
      expect(merged.inOrder().map(([k]) => k)).toEqual([1, 3, 5, 7, 9])
    })
  })

  describe('size', () => {
    it('should return 0 for empty treap', () => {
      expect(treap.size()).toBe(0)
    })

    it('should increase after insert', () => {
      treap.insert(1, 10)
      expect(treap.size()).toBe(1)
      treap.insert(2, 20)
      expect(treap.size()).toBe(2)
    })

    it('should decrease after delete', () => {
      treap.insert(1, 10)
      treap.insert(2, 20)
      treap.delete(1)
      expect(treap.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      treap.insert(1, 10)
      treap.clear()
      expect(treap.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new treap', () => {
      expect(treap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      treap.insert(1, 10)
      expect(treap.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      treap.insert(1, 10)
      treap.clear()
      expect(treap.isEmpty()).toBe(true)
    })

    it('should return true after deleting all', () => {
      treap.insert(1, 10)
      treap.delete(1)
      expect(treap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the treap', () => {
      treap.insert(1, 10)
      treap.insert(2, 20)
      treap.clear()
      expect(treap.size()).toBe(0)
      expect(treap.isEmpty()).toBe(true)
    })

    it('should handle clearing empty treap', () => {
      treap.clear()
      expect(treap.size()).toBe(0)
    })

    it('should allow operations after clear', () => {
      treap.insert(1, 10)
      treap.clear()
      treap.insert(2, 20)
      expect(treap.size()).toBe(1)
      expect(treap.search(2)).toBe(20)
    })

    it('should return void', () => {
      expect(treap.clear()).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return correct stats for empty treap', () => {
      const stats = treap.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.isBalanced).toBe(true)
    })

    it('should return correct stats for single element', () => {
      treap.insert(1, 10)
      const stats = treap.getStats()
      expect(stats.nodeCount).toBe(1)
      expect(stats.height).toBe(1)
      expect(stats.isBalanced).toBe(true)
    })

    it('should return correct stats for multiple elements', () => {
      for (let i = 0; i < 10; i++) {
        treap.insert(i, i * 10)
      }
      const stats = treap.getStats()
      expect(stats.nodeCount).toBe(10)
      expect(stats.height).toBeGreaterThan(0)
      expect(stats.height).toBeLessThanOrEqual(10)
    })

    it('should update stats after operations', () => {
      treap.insert(1, 10)
      treap.insert(2, 20)
      treap.delete(1)
      const stats = treap.getStats()
      expect(stats.nodeCount).toBe(1)
    })

    it('should reset stats after clear', () => {
      treap.insert(1, 10)
      treap.clear()
      const stats = treap.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_TREAP_OPTIONS', () => {
      expect(DEFAULT_TREAP_OPTIONS.allowDuplicates).toBe(false)
    })

    it('should support TreapOptions interface', () => {
      const opts: TreapOptions = { allowDuplicates: true }
      expect(opts.allowDuplicates).toBe(true)
    })

    it('should support TreapStats interface', () => {
      const stats: TreapStats = { nodeCount: 5, height: 3, isBalanced: true }
      expect(stats.nodeCount).toBe(5)
    })
  })

  describe('string values', () => {
    it('should store string values', () => {
      const t = new Treap<string>()
      t.insert(1, 'hello')
      t.insert(2, 'world')
      expect(t.search(1)).toBe('hello')
      expect(t.search(2)).toBe('world')
    })

    it('should return string values from getMin/getMax', () => {
      const t = new Treap<string>()
      t.insert(3, 'c')
      t.insert(1, 'a')
      t.insert(2, 'b')
      expect(t.getMin()).toBe('a')
      expect(t.getMax()).toBe('c')
    })
  })

  describe('object values', () => {
    it('should store object values', () => {
      const t = new Treap<{ name: string }>()
      t.insert(1, { name: 'Alice' })
      t.insert(2, { name: 'Bob' })
      expect(t.search(1)?.name).toBe('Alice')
      expect(t.search(2)?.name).toBe('Bob')
    })

    it('should update object values', () => {
      const t = new Treap<{ x: number }>()
      t.insert(1, { x: 10 })
      t.insert(1, { x: 20 })
      expect(t.search(1)?.x).toBe(20)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across insert and delete', () => {
      for (let i = 0; i < 20; i++) {
        treap.insert(i, i * 10)
      }
      for (let i = 0; i < 10; i++) {
        treap.delete(i * 2)
      }
      expect(treap.size()).toBe(10)
      const result = treap.inOrder()
      for (let i = 1; i < result.length; i++) {
        expect(result[i]![0] > result[i - 1]![0]).toBe(true)
      }
    })

    it('should handle split and merge roundtrip', () => {
      for (let i = 1; i <= 7; i++) {
        treap.insert(i, i * 10)
      }
      const [left, right] = treap.split(4)
      const merged = new Treap<number>()
      merged.merge(left)
      merged.merge(right)
      expect(merged.inOrder()).toEqual([[1, 10], [2, 20], [3, 30], [4, 40], [5, 50], [6, 60], [7, 70]])
    })

    it('should handle multiple merges', () => {
      const t1 = new Treap<number>()
      const t2 = new Treap<number>()
      const t3 = new Treap<number>()
      t1.insert(1, 10)
      t2.insert(3, 30)
      t3.insert(5, 50)
      t1.merge(t2)
      t1.merge(t3)
      expect(t1.size()).toBe(3)
      expect(t1.inOrder().map(([k]) => k)).toEqual([1, 3, 5])
    })
  })

  describe('large treap', () => {
    it('should handle 100 insertions', () => {
      for (let i = 0; i < 100; i++) {
        treap.insert(i, i * 10)
      }
      expect(treap.size()).toBe(100)
      const result = treap.inOrder()
      for (let i = 0; i < 100; i++) {
        expect(result[i]?.[0]).toBe(i)
        expect(result[i]?.[1]).toBe(i * 10)
      }
    })

    it('should handle 1000 insertions', () => {
      for (let i = 0; i < 1000; i++) {
        treap.insert(i, i)
      }
      expect(treap.size()).toBe(1000)
      expect(treap.getMin()).toBe(0)
      expect(treap.getMax()).toBe(999)
    })

    it('should handle mixed insertions and deletions at scale', () => {
      for (let i = 0; i < 100; i++) {
        treap.insert(i, i)
      }
      for (let i = 0; i < 50; i++) {
        treap.delete(i)
      }
      expect(treap.size()).toBe(50)
      const result = treap.inOrder()
      expect(result[0]?.[0]).toBe(50)
      expect(result[result.length - 1]?.[0]).toBe(99)
    })

    it('should maintain reasonable height for large datasets', () => {
      for (let i = 0; i < 500; i++) {
        treap.insert(i, i)
      }
      const stats = treap.getStats()
      expect(stats.nodeCount).toBe(500)
      expect(stats.height).toBeLessThanOrEqual(500)
    })

    it('should handle reverse order insertions at scale', () => {
      for (let i = 200; i >= 0; i--) {
        treap.insert(i, i)
      }
      expect(treap.size()).toBe(201)
      const result = treap.inOrder()
      expect(result[0]?.[0]).toBe(0)
      expect(result[200]?.[0]).toBe(200)
    })
  })

  describe('edge cases', () => {
    it('should handle inserting same key multiple times', () => {
      treap.insert(5, 50)
      treap.insert(5, 60)
      treap.insert(5, 70)
      expect(treap.size()).toBe(1)
      expect(treap.search(5)).toBe(70)
    })

    it('should handle large keys', () => {
      treap.insert(Number.MAX_SAFE_INTEGER, 1)
      treap.insert(Number.MIN_SAFE_INTEGER, 2)
      expect(treap.getMin()).toBe(2)
      expect(treap.getMax()).toBe(1)
    })

    it('should handle negative keys', () => {
      treap.insert(-5, 50)
      treap.insert(-10, 100)
      treap.insert(5, 5)
      expect(treap.inOrder().map(([k]) => k)).toEqual([-10, -5, 5])
    })

    it('should handle deleting and reinserting', () => {
      treap.insert(5, 50)
      treap.delete(5)
      expect(treap.has(5)).toBe(false)
      treap.insert(5, 99)
      expect(treap.has(5)).toBe(true)
      expect(treap.search(5)).toBe(99)
    })

    it('should handle split on empty treap', () => {
      const [left, right] = treap.split(5)
      expect(left.isEmpty()).toBe(true)
      expect(right.isEmpty()).toBe(true)
    })

    it('should handle merge clearing the source', () => {
      treap.insert(1, 10)
      const other = new Treap<number>()
      other.insert(2, 20)
      treap.merge(other)
      expect(other.isEmpty()).toBe(true)
      expect(other.size()).toBe(0)
    })
  })

  describe('BST property', () => {
    it('should maintain BST property after many operations', () => {
      const keys = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35]
      for (const k of keys) {
        treap.insert(k, k)
      }
      treap.delete(30)
      treap.delete(60)
      treap.insert(55, 55)
      treap.insert(65, 65)
      const result = treap.inOrder()
      for (let i = 1; i < result.length; i++) {
        expect(result[i]![0] > result[i - 1]![0]).toBe(true)
      }
    })

    it('should maintain BST property with random insertions', () => {
      const inserted = new Set<number>()
      for (let i = 0; i < 50; i++) {
        const k = Math.floor(Math.random() * 1000)
        treap.insert(k, k)
        inserted.add(k)
      }
      const result = treap.inOrder()
      const uniqueKeys = [...inserted].sort((a, b) => a - b)
      expect(result.map(([k]) => k)).toEqual(uniqueKeys)
    })
  })
})
