import { describe, it, expect, beforeEach } from 'vitest'
import { RedBlackTreeMap } from '../../src/core/red-black-tree-map/red-black-tree-map.js'
import { defaultComparator } from '../../src/core/red-black-tree-map/types.js'
import type { RBTreeEntry, RBTreeMapOptions } from '../../src/core/red-black-tree-map/types.js'

describe('RedBlackTreeMap', () => {
  let tree: RedBlackTreeMap<number, string>

  beforeEach(() => {
    tree = new RedBlackTreeMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new RedBlackTreeMap<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create tree with initial entries', () => {
      const t = new RedBlackTreeMap<number, string>({
        entries: [
          [5, 'five'],
          [3, 'three'],
          [7, 'seven'],
        ],
      })
      expect(t.size()).toBe(3)
      expect(t.get(5)).toBe('five')
      expect(t.get(3)).toBe('three')
      expect(t.get(7)).toBe('seven')
    })

    it('should create tree with custom comparator', () => {
      const t = new RedBlackTreeMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('Hello', 1)
      t.set('hello', 2)
      expect(t.size()).toBe(1)
      expect(t.get('Hello')).toBe(2)
      expect(t.get('hello')).toBe(2)
    })

    it('should handle empty options object', () => {
      const t = new RedBlackTreeMap<number, string>({})
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle initial entries with duplicates (last wins)', () => {
      const t = new RedBlackTreeMap<number, string>({
        entries: [
          [1, 'a'],
          [1, 'b'],
        ],
      })
      expect(t.size()).toBe(1)
      expect(t.get(1)).toBe('b')
    })

    it('should be valid after construction with entries', () => {
      const t = new RedBlackTreeMap<number, string>({
        entries: [
          [5, 'five'],
          [3, 'three'],
          [7, 'seven'],
          [1, 'one'],
          [9, 'nine'],
        ],
      })
      expect(t.isValid()).toBe(true)
    })
  })

  describe('set/get', () => {
    it('should set and get a single entry', () => {
      tree.set(1, 'one')
      expect(tree.get(1)).toBe('one')
    })

    it('should set and get multiple entries', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      tree.set(3, 'three')
      expect(tree.get(1)).toBe('one')
      expect(tree.get(2)).toBe('two')
      expect(tree.get(3)).toBe('three')
    })

    it('should overwrite existing key', () => {
      tree.set(1, 'one')
      tree.set(1, 'updated')
      expect(tree.get(1)).toBe('updated')
      expect(tree.size()).toBe(1)
    })

    it('should return undefined for missing key', () => {
      expect(tree.get(999)).toBeUndefined()
    })

    it('should return undefined on empty tree', () => {
      expect(tree.get(1)).toBeUndefined()
    })

    it('should maintain valid tree after multiple sets', () => {
      for (let i = 0; i < 20; i++) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(20)
    })

    it('should handle reverse order inserts', () => {
      for (let i = 20; i >= 0; i--) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(21)
      for (let i = 0; i <= 20; i++) {
        expect(tree.get(i)).toBe(`val-${i}`)
      }
    })

    it('should handle string keys', () => {
      const t = new RedBlackTreeMap<string, number>()
      t.set('apple', 1)
      t.set('banana', 2)
      t.set('cherry', 3)
      expect(t.get('apple')).toBe(1)
      expect(t.get('banana')).toBe(2)
      expect(t.get('cherry')).toBe(3)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      tree.set(1, 'one')
      expect(tree.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      tree.set(1, 'one')
      expect(tree.has(2)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      tree.set(1, 'one')
      tree.delete(1)
      expect(tree.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete a leaf node', () => {
      tree.set(1, 'one')
      expect(tree.delete(1)).toBe(true)
      expect(tree.get(1)).toBeUndefined()
      expect(tree.size()).toBe(0)
    })

    it('should return false for missing key', () => {
      expect(tree.delete(999)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should delete root with one child', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.delete(5)
      expect(tree.get(5)).toBeUndefined()
      expect(tree.get(3)).toBe('three')
      expect(tree.size()).toBe(1)
    })

    it('should delete internal node with two children', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.delete(5)
      expect(tree.get(5)).toBeUndefined()
      expect(tree.size()).toBe(2)
      expect(tree.isValid()).toBe(true)
    })

    it('should maintain validity after multiple deletions', () => {
      for (let i = 0; i < 20; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 0; i < 10; i++) {
        tree.delete(i)
      }
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(10)
    })

    it('should handle delete all entries', () => {
      for (let i = 0; i < 10; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 0; i < 10; i++) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle alternating insert and delete', () => {
      tree.set(1, 'a')
      tree.delete(1)
      tree.set(1, 'b')
      tree.delete(1)
      tree.set(1, 'c')
      expect(tree.get(1)).toBe('c')
      expect(tree.size()).toBe(1)
    })

    it('should maintain BST order after deletions', () => {
      for (let i = 0; i < 10; i++) {
        tree.set(i, `val-${i}`)
      }
      tree.delete(3)
      tree.delete(7)
      tree.delete(0)
      tree.delete(9)
      const keys = tree.keys()
      expect(keys).toEqual([1, 2, 4, 5, 6, 8])
    })
  })

  describe('size/isEmpty/clear', () => {
    it('should report correct size', () => {
      expect(tree.size()).toBe(0)
      tree.set(1, 'one')
      expect(tree.size()).toBe(1)
      tree.set(2, 'two')
      expect(tree.size()).toBe(2)
    })

    it('should report isEmpty correctly', () => {
      expect(tree.isEmpty()).toBe(true)
      tree.set(1, 'one')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should clear the tree', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.get(1)).toBeUndefined()
    })

    it('should allow operations after clear', () => {
      tree.set(1, 'one')
      tree.clear()
      tree.set(2, 'two')
      expect(tree.get(2)).toBe('two')
      expect(tree.size()).toBe(1)
    })
  })

  describe('getMin/getMax', () => {
    it('should return undefined on empty tree', () => {
      expect(tree.getMin()).toBeUndefined()
      expect(tree.getMax()).toBeUndefined()
    })

    it('should return the only element', () => {
      tree.set(5, 'five')
      expect(tree.getMin()).toEqual({ key: 5, value: 'five' })
      expect(tree.getMax()).toEqual({ key: 5, value: 'five' })
    })

    it('should return min and max correctly', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
      expect(tree.getMin()).toEqual({ key: 1, value: 'one' })
      expect(tree.getMax()).toEqual({ key: 9, value: 'nine' })
    })

    it('should update min/max after deletion', () => {
      tree.set(1, 'one')
      tree.set(5, 'five')
      tree.set(10, 'ten')
      tree.delete(1)
      expect(tree.getMin()).toEqual({ key: 5, value: 'five' })
      tree.delete(10)
      expect(tree.getMax()).toEqual({ key: 5, value: 'five' })
    })
  })

  describe('extractMin/extractMax', () => {
    it('should return undefined on empty tree', () => {
      expect(tree.extractMin()).toBeUndefined()
      expect(tree.extractMax()).toBeUndefined()
    })

    it('should extract and remove min', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      const entry = tree.extractMin()
      expect(entry).toEqual({ key: 3, value: 'three' })
      expect(tree.has(3)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should extract and remove max', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      const entry = tree.extractMax()
      expect(entry).toEqual({ key: 7, value: 'seven' })
      expect(tree.has(7)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should keep tree valid after extract', () => {
      for (let i = 0; i < 20; i++) {
        tree.set(i, `val-${i}`)
      }
      tree.extractMin()
      tree.extractMax()
      expect(tree.isValid()).toBe(true)
    })

    it('should handle extracting all elements', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      tree.set(3, 'three')
      expect(tree.extractMin()).toEqual({ key: 1, value: 'one' })
      expect(tree.extractMin()).toEqual({ key: 2, value: 'two' })
      expect(tree.extractMin()).toEqual({ key: 3, value: 'three' })
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('predecessor/successor', () => {
    beforeEach(() => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
    })

    it('should return undefined for predecessor of min key', () => {
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for successor of max key', () => {
      expect(tree.successor(9)).toBeUndefined()
    })

    it('should return predecessor for existing key', () => {
      expect(tree.predecessor(5)).toEqual({ key: 3, value: 'three' })
      expect(tree.predecessor(7)).toEqual({ key: 5, value: 'five' })
    })

    it('should return successor for existing key', () => {
      expect(tree.successor(5)).toEqual({ key: 7, value: 'seven' })
      expect(tree.successor(3)).toEqual({ key: 5, value: 'five' })
    })

    it('should return predecessor for non-existing key', () => {
      expect(tree.predecessor(4)).toEqual({ key: 3, value: 'three' })
      expect(tree.predecessor(6)).toEqual({ key: 5, value: 'five' })
    })

    it('should return successor for non-existing key', () => {
      expect(tree.successor(4)).toEqual({ key: 5, value: 'five' })
      expect(tree.successor(6)).toEqual({ key: 7, value: 'seven' })
    })

    it('should return undefined predecessor on empty tree', () => {
      const t = new RedBlackTreeMap<number, string>()
      expect(t.predecessor(1)).toBeUndefined()
    })

    it('should return undefined successor on empty tree', () => {
      const t = new RedBlackTreeMap<number, string>()
      expect(t.successor(1)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('should return empty array on empty tree', () => {
      expect(tree.range(1, 10)).toEqual([])
    })

    it('should return entries in range', () => {
      for (let i = 0; i < 10; i++) {
        tree.set(i, `val-${i}`)
      }
      const result = tree.range(3, 7)
      expect(result.map(e => e.key)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single entry range', () => {
      tree.set(5, 'five')
      const result = tree.range(5, 5)
      expect(result).toEqual([{ key: 5, value: 'five' }])
    })

    it('should return empty for range with no matches', () => {
      tree.set(5, 'five')
      const result = tree.range(10, 20)
      expect(result).toEqual([])
    })

    it('should return full range', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(3, 'c')
      const result = tree.range(1, 3)
      expect(result.length).toBe(3)
    })
  })

  describe('keys/values/entries', () => {
    it('should return empty arrays on empty tree', () => {
      expect(tree.keys()).toEqual([])
      expect(tree.values()).toEqual([])
      expect(tree.entries()).toEqual([])
    })

    it('should return keys in sorted order', () => {
      tree.set(3, 'three')
      tree.set(1, 'one')
      tree.set(2, 'two')
      expect(tree.keys()).toEqual([1, 2, 3])
    })

    it('should return values in key order', () => {
      tree.set(3, 'three')
      tree.set(1, 'one')
      tree.set(2, 'two')
      expect(tree.values()).toEqual(['one', 'two', 'three'])
    })

    it('should return entries in key order', () => {
      tree.set(3, 'three')
      tree.set(1, 'one')
      tree.set(2, 'two')
      expect(tree.entries()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })
  })

  describe('atIndex/indexOf', () => {
    beforeEach(() => {
      tree.set(10, 'ten')
      tree.set(5, 'five')
      tree.set(15, 'fifteen')
      tree.set(3, 'three')
      tree.set(7, 'seven')
    })

    it('should return entry at index', () => {
      expect(tree.atIndex(0)).toEqual({ key: 3, value: 'three' })
      expect(tree.atIndex(1)).toEqual({ key: 5, value: 'five' })
      expect(tree.atIndex(2)).toEqual({ key: 7, value: 'seven' })
      expect(tree.atIndex(3)).toEqual({ key: 10, value: 'ten' })
      expect(tree.atIndex(4)).toEqual({ key: 15, value: 'fifteen' })
    })

    it('should return undefined for out of bounds', () => {
      expect(tree.atIndex(-1)).toBeUndefined()
      expect(tree.atIndex(5)).toBeUndefined()
      expect(tree.atIndex(100)).toBeUndefined()
    })

    it('should return index of key', () => {
      expect(tree.indexOf(3)).toBe(0)
      expect(tree.indexOf(5)).toBe(1)
      expect(tree.indexOf(7)).toBe(2)
      expect(tree.indexOf(10)).toBe(3)
      expect(tree.indexOf(15)).toBe(4)
    })

    it('should return -1 for missing key', () => {
      expect(tree.indexOf(999)).toBe(-1)
    })

    it('should return undefined/-1 on empty tree', () => {
      const t = new RedBlackTreeMap<number, string>()
      expect(t.atIndex(0)).toBeUndefined()
      expect(t.indexOf(1)).toBe(-1)
    })

    it('should update indices after deletion', () => {
      tree.delete(5)
      expect(tree.indexOf(3)).toBe(0)
      expect(tree.indexOf(7)).toBe(1)
      expect(tree.indexOf(10)).toBe(2)
      expect(tree.indexOf(15)).toBe(3)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      const cloned = tree.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get(1)).toBe('one')
      expect(cloned.get(2)).toBe('two')
    })

    it('should not affect original on modification', () => {
      tree.set(1, 'one')
      const cloned = tree.clone()
      cloned.set(2, 'two')
      expect(tree.has(2)).toBe(false)
      expect(cloned.has(2)).toBe(true)
    })

    it('should preserve comparator', () => {
      const t = new RedBlackTreeMap<string, number>({
        comparator: (a, b) => b.localeCompare(a),
      })
      t.set('a', 1)
      t.set('b', 2)
      const cloned = t.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
      expect(cloned.isValid()).toBe(true)
    })

    it('should clone empty tree', () => {
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })
  })

  describe('merge', () => {
    it('should merge two trees', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      const other = new RedBlackTreeMap<number, string>()
      other.set(3, 'three')
      other.set(4, 'four')
      const merged = tree.merge(other)
      expect(merged.size()).toBe(4)
      expect(merged.get(1)).toBe('one')
      expect(merged.get(3)).toBe('three')
    })

    it('should overwrite with other tree values for same keys', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      const other = new RedBlackTreeMap<number, string>()
      other.set(2, 'TWO')
      other.set(3, 'three')
      const merged = tree.merge(other)
      expect(merged.get(2)).toBe('TWO')
      expect(merged.size()).toBe(3)
    })

    it('should not modify original trees', () => {
      tree.set(1, 'one')
      const other = new RedBlackTreeMap<number, string>()
      other.set(2, 'two')
      tree.merge(other)
      expect(tree.has(2)).toBe(false)
      expect(other.has(1)).toBe(false)
    })

    it('should merge with empty tree', () => {
      tree.set(1, 'one')
      const empty = new RedBlackTreeMap<number, string>()
      const merged = tree.merge(empty)
      expect(merged.size()).toBe(1)
    })

    it('should merge into empty tree', () => {
      const other = new RedBlackTreeMap<number, string>()
      other.set(1, 'one')
      const merged = tree.merge(other)
      expect(merged.size()).toBe(1)
    })

    it('merged tree should be valid', () => {
      for (let i = 0; i < 10; i++) tree.set(i, `a-${i}`)
      const other = new RedBlackTreeMap<number, string>()
      for (let i = 5; i < 15; i++) other.set(i, `b-${i}`)
      const merged = tree.merge(other)
      expect(merged.isValid()).toBe(true)
    })
  })

  describe('forEach', () => {
    it('should iterate in order', () => {
      tree.set(3, 'three')
      tree.set(1, 'one')
      tree.set(2, 'two')
      const result: RBTreeEntry<number, string>[] = []
      tree.forEach((entry, index) => {
        result.push(entry)
        expect(index).toBe(result.length - 1)
      })
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should not call callback on empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should provide correct indices', () => {
      tree.set(10, 'a')
      tree.set(20, 'b')
      tree.set(30, 'c')
      const indices: number[] = []
      tree.forEach(() => { indices.push(indices.length) })
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('iterator', () => {
    it('should iterate in order', () => {
      tree.set(3, 'three')
      tree.set(1, 'one')
      tree.set(2, 'two')
      const result = [...tree]
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should produce nothing on empty tree', () => {
      const result = [...tree]
      expect(result).toEqual([])
    })

    it('should work with for-of', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      const keys: number[] = []
      for (const entry of tree) {
        keys.push(entry.key)
      }
      expect(keys).toEqual([1, 2])
    })
  })

  describe('toArray', () => {
    it('should return entries as array', () => {
      tree.set(3, 'three')
      tree.set(1, 'one')
      tree.set(2, 'two')
      expect(tree.toArray()).toEqual(tree.entries())
    })

    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })
  })

  describe('isValid', () => {
    it('should return true for empty tree', () => {
      expect(tree.isValid()).toBe(true)
    })

    it('should return true for single node', () => {
      tree.set(1, 'one')
      expect(tree.isValid()).toBe(true)
    })

    it('should return true after many operations', () => {
      for (let i = 0; i < 50; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        tree.delete(i * 2)
      }
      expect(tree.isValid()).toBe(true)
    })

    it('should return true after sequential inserts', () => {
      for (let i = 0; i < 100; i++) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.isValid()).toBe(true)
    })

    it('should return true after reverse inserts', () => {
      for (let i = 100; i >= 0; i--) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.getHeight()).toBe(0)
    })

    it('should return 1 for single node', () => {
      tree.set(1, 'one')
      expect(tree.getHeight()).toBe(1)
    })

    it('should return height > 1 for larger trees', () => {
      for (let i = 0; i < 10; i++) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.getHeight()).toBeGreaterThan(1)
    })

    it('should have balanced height for many nodes', () => {
      for (let i = 0; i < 1000; i++) {
        tree.set(i, `val-${i}`)
      }
      const height = tree.getHeight()
      expect(height).toBeLessThanOrEqual(2 * Math.ceil(Math.log2(1001)))
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const t = new RedBlackTreeMap<number, string>({
        comparator: (a, b) => b - a,
      })
      t.set(1, 'one')
      t.set(2, 'two')
      t.set(3, 'three')
      expect(t.keys()).toEqual([3, 2, 1])
    })

    it('should work with object keys', () => {
      interface Obj { id: number }
      const t = new RedBlackTreeMap<Obj, string>({
        comparator: (a, b) => a.id - b.id,
      })
      t.set({ id: 2 }, 'two')
      t.set({ id: 1 }, 'one')
      t.set({ id: 3 }, 'three')
      expect(t.keys().map(k => k.id)).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle single element lifecycle', () => {
      tree.set(1, 'one')
      expect(tree.size()).toBe(1)
      expect(tree.get(1)).toBe('one')
      expect(tree.has(1)).toBe(true)
      expect(tree.getMin()).toEqual({ key: 1, value: 'one' })
      expect(tree.getMax()).toEqual({ key: 1, value: 'one' })
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle two elements', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.keys()).toEqual([1, 2])
    })

    it('should handle setting same key multiple times', () => {
      tree.set(1, 'a')
      tree.set(1, 'b')
      tree.set(1, 'c')
      expect(tree.size()).toBe(1)
      expect(tree.get(1)).toBe('c')
    })

    it('should handle deleting non-existent keys', () => {
      tree.set(1, 'one')
      expect(tree.delete(2)).toBe(false)
      expect(tree.delete(1)).toBe(true)
      expect(tree.delete(1)).toBe(false)
    })

    it('should handle undefined values', () => {
      const t = new RedBlackTreeMap<number, string | undefined>()
      t.set(1, undefined)
      expect(t.get(1)).toBeUndefined()
      expect(t.has(1)).toBe(true)
      expect(t.size()).toBe(1)
    })

    it('should handle null values', () => {
      const t = new RedBlackTreeMap<number, string | null>()
      t.set(1, null)
      expect(t.get(1)).toBeNull()
      expect(t.has(1)).toBe(true)
    })

    it('should handle range on single element', () => {
      tree.set(5, 'five')
      expect(tree.range(5, 5)).toEqual([{ key: 5, value: 'five' }])
      expect(tree.range(1, 4)).toEqual([])
      expect(tree.range(6, 10)).toEqual([])
    })
  })

  describe('stress test', () => {
    it('should maintain balance with 1000 sequential inserts', () => {
      for (let i = 0; i < 1000; i++) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.size()).toBe(1000)
      expect(tree.isValid()).toBe(true)
      const height = tree.getHeight()
      expect(height).toBeLessThanOrEqual(2 * Math.ceil(Math.log2(1001)))
    })

    it('should maintain balance with 1000 reverse inserts', () => {
      for (let i = 999; i >= 0; i--) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.size()).toBe(1000)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle 1000 random operations', () => {
      const keys = new Set<number>()
      for (let i = 0; i < 500; i++) {
        const key = Math.floor(Math.random() * 200)
        tree.set(key, `val-${key}`)
        keys.add(key)
      }
      expect(tree.size()).toBe(keys.size)
      expect(tree.isValid()).toBe(true)
      for (const key of keys) {
        expect(tree.get(key)).toBe(`val-${key}`)
      }
    })

    it('should handle interleaved insert and delete', () => {
      for (let i = 0; i < 200; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        tree.delete(i)
      }
      for (let i = 200; i < 300; i++) {
        tree.set(i, `val-${i}`)
      }
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(200)
    })

    it('should handle deletion of all elements one by one', () => {
      for (let i = 0; i < 50; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(tree.delete(i)).toBe(true)
        expect(tree.isValid()).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deletion in reverse order', () => {
      for (let i = 0; i < 50; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 49; i >= 0; i--) {
        tree.delete(i)
      }
      expect(tree.isEmpty()).toBe(true)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle extracting all min then max', () => {
      for (let i = 0; i < 20; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 0; i < 5; i++) {
        tree.extractMin()
        tree.extractMax()
      }
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(10)
    })

    it('atIndex/indexOf consistency with 100 elements', () => {
      for (let i = 0; i < 100; i++) {
        tree.set(i, `val-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        const atIdx = tree.atIndex(i)
        expect(atIdx).toBeDefined()
        expect(atIdx!.key).toBe(i)
        expect(tree.indexOf(i)).toBe(i)
      }
    })

    it('range should return correct subset', () => {
      for (let i = 0; i < 100; i++) {
        tree.set(i, `val-${i}`)
      }
      const result = tree.range(25, 75)
      expect(result.length).toBe(51)
      expect(result[0]!.key).toBe(25)
      expect(result[50]!.key).toBe(75)
    })
  })

  describe('defaultComparator export', () => {
    it('should be importable', () => {
      expect(typeof defaultComparator).toBe('function')
      expect(defaultComparator(1, 2)).toBe(-1)
      expect(defaultComparator(2, 1)).toBe(1)
      expect(defaultComparator(1, 1)).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should allow typed usage', () => {
      const options: RBTreeMapOptions<number, string> = {
        comparator: (a, b) => a - b,
        entries: [[1, 'one']],
      }
      const t = new RedBlackTreeMap<number, string>(options)
      expect(t.get(1)).toBe('one')
    })

    it('should allow typed entries', () => {
      const entry: RBTreeEntry<number, string> = { key: 1, value: 'one' }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe('one')
    })
  })
})
