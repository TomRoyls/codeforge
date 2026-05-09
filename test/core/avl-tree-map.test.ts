import { describe, it, expect, beforeEach } from 'vitest'
import { AVLTreeMap } from '../../src/core/avl-tree-map/avl-tree-map.js'
import { defaultComparator } from '../../src/core/avl-tree-map/types.js'
import type { AVLTreeEntry, AVLTreeMapOptions } from '../../src/core/avl-tree-map/types.js'

describe('AVLTreeMap', () => {
  let tree: AVLTreeMap<number, string>

  beforeEach(() => {
    tree = new AVLTreeMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new AVLTreeMap<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create tree with initial entries', () => {
      const t = new AVLTreeMap<number, string>({
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
      const t = new AVLTreeMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('Hello', 1)
      t.set('hello', 2)
      expect(t.size()).toBe(1)
      expect(t.get('Hello')).toBe(2)
      expect(t.get('hello')).toBe(2)
    })

    it('should handle empty options object', () => {
      const t = new AVLTreeMap<number, string>({})
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle initial entries with duplicates (last wins)', () => {
      const t = new AVLTreeMap<number, string>({
        entries: [
          [1, 'a'],
          [1, 'b'],
        ],
      })
      expect(t.size()).toBe(1)
      expect(t.get(1)).toBe('b')
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

    it('should return undefined for non-existent key', () => {
      expect(tree.get(99)).toBeUndefined()
    })

    it('should handle various value types', () => {
      const numTree = new AVLTreeMap<string, number>()
      numTree.set('a', 1)
      numTree.set('b', 2)
      expect(numTree.get('a')).toBe(1)
    })

    it('should handle object values', () => {
      const objTree = new AVLTreeMap<number, { name: string }>()
      objTree.set(1, { name: 'test' })
      expect(objTree.get(1)?.name).toBe('test')
    })

    it('should handle null values', () => {
      const nullTree = new AVLTreeMap<number, string | null>()
      nullTree.set(1, null)
      expect(nullTree.get(1)).toBeNull()
    })

    it('should preserve size after overwrite', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(1, 'c')
      expect(tree.size()).toBe(2)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      tree.set(1, 'one')
      expect(tree.has(1)).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(tree.has(1)).toBe(false)
    })

    it('should return false after deletion', () => {
      tree.set(1, 'one')
      tree.delete(1)
      expect(tree.has(1)).toBe(false)
    })

    it('should return true for multiple keys', () => {
      tree.set(1, 'one')
      tree.set(2, 'two')
      tree.set(3, 'three')
      expect(tree.has(1)).toBe(true)
      expect(tree.has(2)).toBe(true)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(4)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      tree.set(1, 'one')
      expect(tree.delete(1)).toBe(true)
      expect(tree.has(1)).toBe(false)
      expect(tree.size()).toBe(0)
    })

    it('should return false for non-existing key', () => {
      expect(tree.delete(99)).toBe(false)
    })

    it('should delete from larger tree', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
      expect(tree.delete(3)).toBe(true)
      expect(tree.size()).toBe(4)
      expect(tree.has(3)).toBe(false)
      expect(tree.isValid()).toBe(true)
    })

    it('should delete all elements sequentially', () => {
      const keys = [5, 3, 7, 1, 9, 4, 6, 8]
      for (const k of keys) tree.set(k, String(k))
      for (const k of keys) {
        expect(tree.delete(k)).toBe(true)
      }
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should maintain balance after deletion', () => {
      for (let i = 1; i <= 20; i++) tree.set(i, String(i))
      for (let i = 1; i <= 10; i++) tree.delete(i)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle deleting root', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size()).toBe(2)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle deleting leaf', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      expect(tree.delete(3)).toBe(true)
      expect(tree.has(3)).toBe(false)
    })
  })

  describe('size/isEmpty/clear', () => {
    it('should report correct size', () => {
      expect(tree.size()).toBe(0)
      tree.set(1, 'a')
      expect(tree.size()).toBe(1)
      tree.set(2, 'b')
      expect(tree.size()).toBe(2)
    })

    it('should report isEmpty correctly', () => {
      expect(tree.isEmpty()).toBe(true)
      tree.set(1, 'a')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should clear the tree', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(3, 'c')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.get(1)).toBeUndefined()
    })

    it('should allow operations after clear', () => {
      tree.set(1, 'a')
      tree.clear()
      tree.set(2, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.get(2)).toBe('b')
    })
  })

  describe('getMin/getMax', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.getMin()).toBeUndefined()
      expect(tree.getMax()).toBeUndefined()
    })

    it('should return min/max for single element', () => {
      tree.set(5, 'five')
      expect(tree.getMin()).toEqual({ key: 5, value: 'five' })
      expect(tree.getMax()).toEqual({ key: 5, value: 'five' })
    })

    it('should return correct min/max after operations', () => {
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
    it('should return undefined for empty tree', () => {
      expect(tree.extractMin()).toBeUndefined()
      expect(tree.extractMax()).toBeUndefined()
    })

    it('should extract min and remove it', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      const min = tree.extractMin()
      expect(min).toEqual({ key: 3, value: 'three' })
      expect(tree.has(3)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should extract max and remove it', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      const max = tree.extractMax()
      expect(max).toEqual({ key: 7, value: 'seven' })
      expect(tree.has(7)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('should extract all elements from min', () => {
      const keys = [5, 3, 7, 1, 9]
      for (const k of keys) tree.set(k, String(k))
      const extracted: number[] = []
      while (!tree.isEmpty()) {
        const e = tree.extractMin()!
        extracted.push(e.key)
      }
      expect(extracted).toEqual([1, 3, 5, 7, 9])
    })

    it('should extract all elements from max', () => {
      const keys = [5, 3, 7, 1, 9]
      for (const k of keys) tree.set(k, String(k))
      const extracted: number[] = []
      while (!tree.isEmpty()) {
        const e = tree.extractMax()!
        extracted.push(e.key)
      }
      expect(extracted).toEqual([9, 7, 5, 3, 1])
    })

    it('should maintain validity after extractMin', () => {
      for (let i = 0; i < 50; i++) tree.set(i, String(i))
      for (let i = 0; i < 25; i++) tree.extractMin()
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(25)
    })

    it('should maintain validity after extractMax', () => {
      for (let i = 0; i < 50; i++) tree.set(i, String(i))
      for (let i = 0; i < 25; i++) tree.extractMax()
      expect(tree.isValid()).toBe(true)
      expect(tree.size()).toBe(25)
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

    it('should find predecessor of middle key', () => {
      expect(tree.predecessor(5)).toEqual({ key: 3, value: 'three' })
    })

    it('should find successor of middle key', () => {
      expect(tree.successor(5)).toEqual({ key: 7, value: 'seven' })
    })

    it('should return undefined for predecessor of min', () => {
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for successor of max', () => {
      expect(tree.successor(9)).toBeUndefined()
    })

    it('should find predecessor of non-existent key', () => {
      expect(tree.predecessor(6)).toEqual({ key: 5, value: 'five' })
    })

    it('should find successor of non-existent key', () => {
      expect(tree.successor(6)).toEqual({ key: 7, value: 'seven' })
    })

    it('should return undefined for predecessor of key below min', () => {
      expect(tree.predecessor(0)).toBeUndefined()
    })

    it('should return undefined for successor of key above max', () => {
      expect(tree.successor(10)).toBeUndefined()
    })

    it('should find predecessor of exact max', () => {
      expect(tree.predecessor(9)).toEqual({ key: 7, value: 'seven' })
    })

    it('should find successor of exact min', () => {
      expect(tree.successor(1)).toEqual({ key: 3, value: 'three' })
    })

    it('should return undefined predecessor on empty tree', () => {
      const empty = new AVLTreeMap<number, string>()
      expect(empty.predecessor(1)).toBeUndefined()
    })

    it('should return undefined successor on empty tree', () => {
      const empty = new AVLTreeMap<number, string>()
      expect(empty.successor(1)).toBeUndefined()
    })
  })

  describe('range', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) tree.set(i, String(i))
    })

    it('should return entries in inclusive range', () => {
      const result = tree.range(3, 7)
      expect(result.map((e) => e.key)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element range', () => {
      const result = tree.range(5, 5)
      expect(result).toEqual([{ key: 5, value: '5' }])
    })

    it('should return empty range when start > end', () => {
      const result = tree.range(7, 3)
      expect(result).toEqual([])
    })

    it('should return full range', () => {
      const result = tree.range(1, 10)
      expect(result.length).toBe(10)
    })

    it('should handle range with non-existent bounds', () => {
      const result = tree.range(2, 8)
      expect(result.map((e) => e.key)).toEqual([2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle range outside tree bounds', () => {
      const result = tree.range(0, 20)
      expect(result.length).toBe(10)
    })

    it('should handle range with no matches', () => {
      const result = tree.range(20, 30)
      expect(result).toEqual([])
    })

    it('should return correct values', () => {
      const result = tree.range(3, 5)
      expect(result.map((e) => e.value)).toEqual(['3', '4', '5'])
    })
  })

  describe('keys/values/entries', () => {
    beforeEach(() => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
    })

    it('should return keys in sorted order', () => {
      expect(tree.keys()).toEqual([1, 3, 5, 7, 9])
    })

    it('should return values in key order', () => {
      expect(tree.values()).toEqual(['one', 'three', 'five', 'seven', 'nine'])
    })

    it('should return entries in key order', () => {
      const entries = tree.entries()
      expect(entries.map((e) => e.key)).toEqual([1, 3, 5, 7, 9])
      expect(entries.map((e) => e.value)).toEqual(['one', 'three', 'five', 'seven', 'nine'])
    })

    it('should return empty arrays for empty tree', () => {
      const empty = new AVLTreeMap<number, string>()
      expect(empty.keys()).toEqual([])
      expect(empty.values()).toEqual([])
      expect(empty.entries()).toEqual([])
    })
  })

  describe('atIndex/indexOf', () => {
    beforeEach(() => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
    })

    it('should return entry at index 0', () => {
      expect(tree.atIndex(0)).toEqual({ key: 1, value: 'one' })
    })

    it('should return entry at last index', () => {
      expect(tree.atIndex(4)).toEqual({ key: 9, value: 'nine' })
    })

    it('should return entry at middle index', () => {
      expect(tree.atIndex(2)).toEqual({ key: 5, value: 'five' })
    })

    it('should return undefined for out of bounds (negative)', () => {
      expect(tree.atIndex(-1)).toBeUndefined()
    })

    it('should return undefined for out of bounds (too large)', () => {
      expect(tree.atIndex(5)).toBeUndefined()
    })

    it('should return index of existing key', () => {
      expect(tree.indexOf(1)).toBe(0)
      expect(tree.indexOf(5)).toBe(2)
      expect(tree.indexOf(9)).toBe(4)
    })

    it('should return -1 for non-existent key', () => {
      expect(tree.indexOf(99)).toBe(-1)
    })

    it('should return undefined for empty tree atIndex', () => {
      const empty = new AVLTreeMap<number, string>()
      expect(empty.atIndex(0)).toBeUndefined()
    })

    it('should return -1 for empty tree indexOf', () => {
      const empty = new AVLTreeMap<number, string>()
      expect(empty.indexOf(1)).toBe(-1)
    })

    it('should maintain correct indices after deletion', () => {
      tree.delete(3)
      expect(tree.indexOf(5)).toBe(1)
      expect(tree.indexOf(7)).toBe(2)
      expect(tree.atIndex(0)).toEqual({ key: 1, value: 'one' })
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      const cloned = tree.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get(1)).toBe('a')
      expect(cloned.get(2)).toBe('b')
    })

    it('should be independent from original', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      const cloned = tree.clone()
      cloned.set(1, 'modified')
      cloned.delete(2)
      expect(tree.get(1)).toBe('a')
      expect(tree.has(2)).toBe(true)
      expect(cloned.get(1)).toBe('modified')
      expect(cloned.has(2)).toBe(false)
    })

    it('should clone empty tree', () => {
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const t = new AVLTreeMap<string, number>({
        comparator: (a, b) => b.localeCompare(a),
      })
      t.set('a', 1)
      t.set('b', 2)
      const cloned = t.clone()
      expect(cloned.keys()).toEqual(['b', 'a'])
    })
  })

  describe('merge', () => {
    it('should merge two non-overlapping maps', () => {
      tree.set(1, 'a')
      tree.set(3, 'c')
      const other = new AVLTreeMap<number, string>()
      other.set(2, 'b')
      other.set(4, 'd')
      const merged = tree.merge(other)
      expect(merged.size()).toBe(4)
      expect(merged.keys()).toEqual([1, 2, 3, 4])
    })

    it('should merge with overlapping keys (other wins)', () => {
      tree.set(1, 'a')
      tree.set(2, 'b-original')
      const other = new AVLTreeMap<number, string>()
      other.set(2, 'b-updated')
      other.set(3, 'c')
      const merged = tree.merge(other)
      expect(merged.size()).toBe(3)
      expect(merged.get(2)).toBe('b-updated')
    })

    it('should merge with empty map', () => {
      tree.set(1, 'a')
      const empty = new AVLTreeMap<number, string>()
      const merged = tree.merge(empty)
      expect(merged.size()).toBe(1)
      expect(merged.get(1)).toBe('a')
    })

    it('should merge into empty map', () => {
      const other = new AVLTreeMap<number, string>()
      other.set(1, 'a')
      const merged = tree.merge(other)
      expect(merged.size()).toBe(1)
    })

    it('should not modify original maps', () => {
      tree.set(1, 'a')
      const other = new AVLTreeMap<number, string>()
      other.set(2, 'b')
      tree.merge(other)
      expect(tree.size()).toBe(1)
      expect(other.size()).toBe(1)
    })
  })

  describe('forEach', () => {
    it('should iterate in order', () => {
      tree.set(3, 'c')
      tree.set(1, 'a')
      tree.set(2, 'b')
      const collected: string[] = []
      tree.forEach((entry) => collected.push(entry.value))
      expect(collected).toEqual(['a', 'b', 'c'])
    })

    it('should provide correct indices', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(3, 'c')
      const indices: number[] = []
      tree.forEach((_entry, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback for empty tree', () => {
      let called = false
      tree.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })
  })

  describe('iterator', () => {
    it('should iterate in order with for-of', () => {
      tree.set(3, 'c')
      tree.set(1, 'a')
      tree.set(2, 'b')
      const collected: string[] = []
      for (const entry of tree) {
        collected.push(entry.value)
      }
      expect(collected).toEqual(['a', 'b', 'c'])
    })

    it('should work with spread operator', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      const entries = [...tree]
      expect(entries.length).toBe(2)
      expect(entries[0]!.key).toBe(1)
      expect(entries[1]!.key).toBe(2)
    })

    it('should handle empty tree iteration', () => {
      const entries = [...tree]
      expect(entries).toEqual([])
    })
  })

  describe('isValid', () => {
    it('should return true for empty tree', () => {
      expect(tree.isValid()).toBe(true)
    })

    it('should return true for single element', () => {
      tree.set(1, 'a')
      expect(tree.isValid()).toBe(true)
    })

    it('should return true after insertions', () => {
      for (let i = 0; i < 100; i++) tree.set(i, String(i))
      expect(tree.isValid()).toBe(true)
    })

    it('should return true after deletions', () => {
      for (let i = 0; i < 100; i++) tree.set(i, String(i))
      for (let i = 0; i < 50; i += 2) tree.delete(i)
      expect(tree.isValid()).toBe(true)
    })

    it('should return true after mixed operations', () => {
      for (let i = 0; i < 50; i++) tree.set(i, String(i))
      for (let i = 0; i < 25; i++) tree.delete(i)
      for (let i = 50; i < 75; i++) tree.set(i, String(i))
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.getHeight()).toBe(0)
    })

    it('should return 1 for single element', () => {
      tree.set(1, 'a')
      expect(tree.getHeight()).toBe(1)
    })

    it('should return balanced height for sequential insertions', () => {
      for (let i = 0; i < 100; i++) tree.set(i, String(i))
      const height = tree.getHeight()
      expect(height).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(100 + 2)))
    })

    it('should maintain O(log n) height', () => {
      for (let i = 0; i < 1000; i++) tree.set(i, String(i))
      const height = tree.getHeight()
      expect(height).toBeLessThanOrEqual(20)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return entries in order', () => {
      tree.set(3, 'c')
      tree.set(1, 'a')
      tree.set(2, 'b')
      expect(tree.toArray()).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 sequential keys (worst case for BST)', () => {
      for (let i = 0; i < 1000; i++) tree.set(i, String(i))
      expect(tree.size()).toBe(1000)
      expect(tree.isValid()).toBe(true)
      const height = tree.getHeight()
      expect(height).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(1002)))
      const keys = tree.keys()
      for (let i = 0; i < 1000; i++) {
        expect(keys[i]).toBe(i)
      }
    })

    it('should handle 1000 random keys, delete 500, verify sorted', () => {
      const randomKeys = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000))
      const uniqueKeys = [...new Set(randomKeys)]
      for (const k of uniqueKeys) tree.set(k, String(k))
      const half = uniqueKeys.slice(0, Math.floor(uniqueKeys.length / 2))
      for (const k of half) tree.delete(k)
      expect(tree.isValid()).toBe(true)
      const remaining = tree.keys()
      const sorted = [...remaining].sort((a, b) => a - b)
      expect(remaining).toEqual(sorted)
    })

    it('should handle alternating insert/delete', () => {
      for (let i = 0; i < 500; i++) {
        tree.set(i, String(i))
        if (i > 0 && i % 3 === 0) tree.delete(i - 1)
      }
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse order comparator', () => {
      const t = new AVLTreeMap<number, string>({
        comparator: (a, b) => b - a,
      })
      t.set(1, 'one')
      t.set(5, 'five')
      t.set(3, 'three')
      expect(t.keys()).toEqual([5, 3, 1])
    })

    it('should work with case-insensitive string comparator', () => {
      const t = new AVLTreeMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('Banana', 1)
      t.set('apple', 2)
      t.set('Cherry', 3)
      expect(t.keys()).toEqual(['apple', 'Banana', 'Cherry'])
    })

    it('should use default comparator for numbers', () => {
      const t = new AVLTreeMap<number, string>()
      t.set(3, 'c')
      t.set(1, 'a')
      t.set(2, 'b')
      expect(t.keys()).toEqual([1, 2, 3])
    })

    it('should use default comparator for strings', () => {
      const t = new AVLTreeMap<string, number>()
      t.set('c', 3)
      t.set('a', 1)
      t.set('b', 2)
      expect(t.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      tree.set(1, 'one')
      expect(tree.size()).toBe(1)
      expect(tree.getMin()).toEqual({ key: 1, value: 'one' })
      expect(tree.getMax()).toEqual({ key: 1, value: 'one' })
      expect(tree.extractMin()).toEqual({ key: 1, value: 'one' })
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle duplicate key overwrite preserving balance', () => {
      tree.set(5, 'a')
      tree.set(3, 'b')
      tree.set(7, 'c')
      tree.set(5, 'updated')
      expect(tree.size()).toBe(3)
      expect(tree.isValid()).toBe(true)
      expect(tree.get(5)).toBe('updated')
    })

    it('should handle two elements', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      expect(tree.size()).toBe(2)
      expect(tree.keys()).toEqual([1, 2])
      expect(tree.isValid()).toBe(true)
    })

    it('should handle deleting down to empty', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.delete(1)
      tree.delete(2)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle operations on empty tree gracefully', () => {
      expect(tree.delete(1)).toBe(false)
      expect(tree.get(1)).toBeUndefined()
      expect(tree.has(1)).toBe(false)
      expect(tree.getMin()).toBeUndefined()
      expect(tree.getMax()).toBeUndefined()
      expect(tree.extractMin()).toBeUndefined()
      expect(tree.extractMax()).toBeUndefined()
      expect(tree.predecessor(1)).toBeUndefined()
      expect(tree.successor(1)).toBeUndefined()
      expect(tree.range(1, 10)).toEqual([])
      expect(tree.atIndex(0)).toBeUndefined()
      expect(tree.indexOf(1)).toBe(-1)
      expect(tree.getHeight()).toBe(0)
      expect(tree.isValid()).toBe(true)
    })

    it('should handle negative keys', () => {
      tree.set(-5, 'neg5')
      tree.set(0, 'zero')
      tree.set(5, 'pos5')
      expect(tree.keys()).toEqual([-5, 0, 5])
    })

    it('should handle zero as key', () => {
      tree.set(0, 'zero')
      expect(tree.get(0)).toBe('zero')
      expect(tree.has(0)).toBe(true)
    })
  })

  describe('defaultComparator', () => {
    it('should compare numbers correctly', () => {
      expect(defaultComparator(1, 2)).toBe(-1)
      expect(defaultComparator(2, 1)).toBe(1)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should compare strings correctly', () => {
      expect(defaultComparator('a', 'b')).toBe(-1)
      expect(defaultComparator('b', 'a')).toBe(1)
      expect(defaultComparator('a', 'a')).toBe(0)
    })
  })

  describe('index-based after modifications', () => {
    it('should maintain correct indices after insertions', () => {
      tree.set(10, 'ten')
      tree.set(5, 'five')
      tree.set(15, 'fifteen')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      expect(tree.atIndex(0)?.key).toBe(3)
      expect(tree.atIndex(1)?.key).toBe(5)
      expect(tree.atIndex(2)?.key).toBe(7)
      expect(tree.atIndex(3)?.key).toBe(10)
      expect(tree.atIndex(4)?.key).toBe(15)
    })

    it('should handle large number of elements with atIndex', () => {
      for (let i = 0; i < 100; i++) tree.set(i, String(i))
      expect(tree.atIndex(0)?.key).toBe(0)
      expect(tree.atIndex(50)?.key).toBe(50)
      expect(tree.atIndex(99)?.key).toBe(99)
    })

    it('should handle large number of elements with indexOf', () => {
      for (let i = 0; i < 100; i++) tree.set(i, String(i))
      expect(tree.indexOf(0)).toBe(0)
      expect(tree.indexOf(50)).toBe(50)
      expect(tree.indexOf(99)).toBe(99)
    })
  })

  describe('merge preserves comparator', () => {
    it('should produce sorted result matching comparator', () => {
      const t = new AVLTreeMap<number, string>({
        comparator: (a, b) => b - a,
      })
      t.set(1, 'a')
      t.set(3, 'c')
      const other = new AVLTreeMap<number, string>({
        comparator: (a, b) => b - a,
      })
      other.set(2, 'b')
      const merged = t.merge(other)
      expect(merged.keys()).toEqual([3, 2, 1])
    })
  })

  describe('range edge cases', () => {
    it('should return all elements when range covers entire tree', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(3, 'c')
      const result = tree.range(-100, 100)
      expect(result.length).toBe(3)
    })

    it('should handle range on empty tree', () => {
      expect(tree.range(1, 10)).toEqual([])
    })

    it('should handle range on single element tree', () => {
      tree.set(5, 'five')
      expect(tree.range(1, 10)).toEqual([{ key: 5, value: 'five' }])
      expect(tree.range(5, 5)).toEqual([{ key: 5, value: 'five' }])
      expect(tree.range(6, 10)).toEqual([])
    })
  })

  describe('forEach and iterator completeness', () => {
    it('forEach should visit all elements', () => {
      for (let i = 0; i < 20; i++) tree.set(i, String(i))
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(20)
    })

    it('iterator should yield all elements', () => {
      for (let i = 0; i < 20; i++) tree.set(i, String(i))
      const arr = [...tree]
      expect(arr.length).toBe(20)
    })

    it('iterator should yield in correct order', () => {
      const keys = [50, 30, 70, 20, 40, 60, 80]
      for (const k of keys) tree.set(k, String(k))
      const iterated = [...tree].map((e) => e.key)
      expect(iterated).toEqual([...keys].sort((a, b) => a - b))
    })
  })

  describe('AVLTreeEntry type', () => {
    it('should return entries with key and value properties', () => {
      tree.set(1, 'one')
      const entry = tree.getMin()!
      expect(entry).toHaveProperty('key', 1)
      expect(entry).toHaveProperty('value', 'one')
    })
  })
})
