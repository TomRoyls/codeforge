import { describe, it, expect, beforeEach } from 'vitest'
import { RedBlackTreeMap } from '../../src/core/red-black-tree/red-black-tree.js'
import type { RBColor, RBNode, CompareFunction } from '../../src/core/red-black-tree/types.js'

describe('RedBlackTreeMap', () => {
  let tree: RedBlackTreeMap<number, string>

  beforeEach(() => {
    tree = new RedBlackTreeMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty tree with no arguments', () => {
      const t = new RedBlackTreeMap<number, string>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const t = new RedBlackTreeMap<string, number>((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      )
      t.set('Hello', 1)
      t.set('hello', 2)
      expect(t.size).toBe(1)
      expect(t.get('Hello')).toBe(2)
    })

    it('should use default comparator for numbers', () => {
      const t = new RedBlackTreeMap<number, string>()
      t.set(3, 'c')
      t.set(1, 'a')
      t.set(2, 'b')
      expect(t.keys()).toEqual([1, 2, 3])
    })

    it('should use default comparator for strings', () => {
      const t = new RedBlackTreeMap<string, number>()
      t.set('c', 3)
      t.set('a', 1)
      t.set('b', 2)
      expect(t.keys()).toEqual(['a', 'b', 'c'])
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
      expect(tree.size).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      expect(tree.get(99)).toBeUndefined()
    })

    it('should return undefined when tree is empty', () => {
      expect(tree.get(1)).toBeUndefined()
    })

    it('should handle object values', () => {
      const objTree = new RedBlackTreeMap<number, { name: string }>()
      objTree.set(1, { name: 'test' })
      expect(objTree.get(1)!.name).toBe('test')
    })

    it('should handle null values', () => {
      const nullTree = new RedBlackTreeMap<number, string | null>()
      nullTree.set(1, null)
      expect(nullTree.get(1)).toBeNull()
    })

    it('should preserve size after overwrite', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(1, 'c')
      expect(tree.size).toBe(2)
    })

    it('should find keys after multiple insertions', () => {
      tree.set(10, 'ten')
      tree.set(20, 'twenty')
      tree.set(5, 'five')
      expect(tree.get(5)).toBe('five')
      expect(tree.get(10)).toBe('ten')
      expect(tree.get(20)).toBe('twenty')
    })

    it('should handle negative keys', () => {
      tree.set(-10, 'neg')
      tree.set(0, 'zero')
      tree.set(10, 'pos')
      expect(tree.get(-10)).toBe('neg')
      expect(tree.get(0)).toBe('zero')
      expect(tree.get(10)).toBe('pos')
    })

    it('should handle zero as key', () => {
      tree.set(0, 'zero')
      expect(tree.get(0)).toBe('zero')
      expect(tree.has(0)).toBe(true)
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

    it('should return false for empty tree', () => {
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
      expect(tree.size).toBe(0)
    })

    it('should return false for non-existing key', () => {
      expect(tree.delete(99)).toBe(false)
    })

    it('should return false for empty tree', () => {
      expect(tree.delete(1)).toBe(false)
    })

    it('should delete from larger tree', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
      expect(tree.delete(3)).toBe(true)
      expect(tree.size).toBe(4)
      expect(tree.has(3)).toBe(false)
    })

    it('should delete all elements sequentially', () => {
      const keys = [5, 3, 7, 1, 9, 4, 6, 8]
      for (const k of keys) tree.set(k, String(k))
      for (const k of keys) {
        expect(tree.delete(k)).toBe(true)
      }
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle deleting root', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size).toBe(2)
    })

    it('should handle deleting leaf', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      expect(tree.delete(3)).toBe(true)
      expect(tree.has(3)).toBe(false)
    })

    it('should handle deleting node with one child', () => {
      tree.set(10, 'ten')
      tree.set(5, 'five')
      tree.set(15, 'fifteen')
      tree.set(3, 'three')
      tree.delete(5)
      expect(tree.size).toBe(3)
      expect(tree.has(3)).toBe(true)
    })

    it('should handle deleting node with two children', () => {
      tree.set(10, 'ten')
      tree.set(5, 'five')
      tree.set(15, 'fifteen')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.delete(5)
      expect(tree.size).toBe(4)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(7)).toBe(true)
    })

    it('should maintain BST ordering after deletions', () => {
      for (let i = 1; i <= 20; i++) tree.set(i, String(i))
      for (let i = 1; i <= 10; i++) tree.delete(i)
      const keys = tree.keys()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('should handle reinserting deleted keys', () => {
      tree.set(10, 'ten')
      tree.set(5, 'five')
      tree.delete(10)
      tree.set(10, 'ten-updated')
      expect(tree.get(10)).toBe('ten-updated')
      expect(tree.size).toBe(2)
    })

    it('should handle deleting down to empty', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.delete(1)
      tree.delete(2)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size).toBe(0)
    })

    it('should return correct count after insertions', () => {
      tree.set(1, 'a')
      expect(tree.size).toBe(1)
      tree.set(2, 'b')
      expect(tree.size).toBe(2)
    })

    it('should decrease after deletion', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.delete(1)
      expect(tree.size).toBe(1)
    })

    it('should not change for duplicate key set', () => {
      tree.set(1, 'a')
      tree.set(1, 'b')
      expect(tree.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      tree.set(1, 'a')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after deleting all', () => {
      tree.set(1, 'a')
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all nodes', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(3, 'c')
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.get(1)).toBeUndefined()
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      tree.set(1, 'a')
      tree.clear()
      tree.set(2, 'b')
      expect(tree.size).toBe(1)
      expect(tree.get(2)).toBe('b')
      expect(tree.has(1)).toBe(false)
    })
  })

  describe('min/max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
    })

    it('should return entry for single element', () => {
      tree.set(5, 'five')
      expect(tree.min()).toEqual([5, 'five'])
      expect(tree.max()).toEqual([5, 'five'])
    })

    it('should return correct min and max', () => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
      expect(tree.min()).toEqual([1, 'one'])
      expect(tree.max()).toEqual([9, 'nine'])
    })

    it('should update after deletion of min', () => {
      tree.set(1, 'one')
      tree.set(5, 'five')
      tree.set(10, 'ten')
      tree.delete(1)
      expect(tree.min()).toEqual([5, 'five'])
    })

    it('should update after deletion of max', () => {
      tree.set(1, 'one')
      tree.set(5, 'five')
      tree.set(10, 'ten')
      tree.delete(10)
      expect(tree.max()).toEqual([5, 'five'])
    })

    it('should work with negative keys', () => {
      tree.set(-10, 'neg')
      tree.set(0, 'zero')
      tree.set(10, 'pos')
      expect(tree.min()).toEqual([-10, 'neg'])
      expect(tree.max()).toEqual([10, 'pos'])
    })
  })

  describe('forEach', () => {
    it('should iterate in order', () => {
      tree.set(3, 'c')
      tree.set(1, 'a')
      tree.set(2, 'b')
      const collected: string[] = []
      tree.forEach((value, key) => {
        collected.push(value)
      })
      expect(collected).toEqual(['a', 'b', 'c'])
    })

    it('should provide correct keys and values', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      tree.set(3, 'c')
      const keys: number[] = []
      const values: string[] = []
      tree.forEach((value, key) => {
        keys.push(key)
        values.push(value)
      })
      expect(keys).toEqual([1, 2, 3])
      expect(values).toEqual(['a', 'b', 'c'])
    })

    it('should not call callback for empty tree', () => {
      let called = false
      tree.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })

    it('should visit all elements', () => {
      for (let i = 0; i < 20; i++) tree.set(i, String(i))
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(20)
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
      expect(entries).toEqual([
        [1, 'one'],
        [3, 'three'],
        [5, 'five'],
        [7, 'seven'],
        [9, 'nine'],
      ])
    })

    it('should return empty arrays for empty tree', () => {
      const empty = new RedBlackTreeMap<number, string>()
      expect(empty.keys()).toEqual([])
      expect(empty.values()).toEqual([])
      expect(empty.entries()).toEqual([])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      const cloned = tree.clone()
      expect(cloned.size).toBe(2)
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
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const t = new RedBlackTreeMap<string, number>((a, b) => b.localeCompare(a))
      t.set('a', 1)
      t.set('b', 2)
      const cloned = t.clone()
      expect(cloned.keys()).toEqual(['b', 'a'])
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate in order with for-of', () => {
      tree.set(3, 'c')
      tree.set(1, 'a')
      tree.set(2, 'b')
      const collected: string[] = []
      for (const [, value] of tree) {
        collected.push(value)
      }
      expect(collected).toEqual(['a', 'b', 'c'])
    })

    it('should work with spread operator', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      const entries = [...tree]
      expect(entries.length).toBe(2)
      expect(entries[0]!).toEqual([1, 'a'])
      expect(entries[1]!).toEqual([2, 'b'])
    })

    it('should handle empty tree iteration', () => {
      const entries = [...tree]
      expect(entries).toEqual([])
    })

    it('should yield in correct order', () => {
      const keys = [50, 30, 70, 20, 40, 60, 80]
      for (const k of keys) tree.set(k, String(k))
      const iterated = [...tree].map(([k]) => k)
      expect(iterated).toEqual([...keys].sort((a, b) => a - b))
    })
  })

  describe('lowerBound', () => {
    beforeEach(() => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
    })

    it('should find exact key', () => {
      expect(tree.lowerBound(5)).toEqual([5, 'five'])
    })

    it('should find next greater when key not present', () => {
      expect(tree.lowerBound(4)).toEqual([5, 'five'])
    })

    it('should find exact min', () => {
      expect(tree.lowerBound(1)).toEqual([1, 'one'])
    })

    it('should return undefined when key above max', () => {
      expect(tree.lowerBound(10)).toBeUndefined()
    })

    it('should return undefined for empty tree', () => {
      const empty = new RedBlackTreeMap<number, string>()
      expect(empty.lowerBound(1)).toBeUndefined()
    })

    it('should return min for key below all', () => {
      expect(tree.lowerBound(0)).toEqual([1, 'one'])
    })
  })

  describe('upperBound', () => {
    beforeEach(() => {
      tree.set(5, 'five')
      tree.set(3, 'three')
      tree.set(7, 'seven')
      tree.set(1, 'one')
      tree.set(9, 'nine')
    })

    it('should find next greater for exact key', () => {
      expect(tree.upperBound(5)).toEqual([7, 'seven'])
    })

    it('should find next greater when key not present', () => {
      expect(tree.upperBound(4)).toEqual([5, 'five'])
    })

    it('should return undefined when key at max', () => {
      expect(tree.upperBound(9)).toBeUndefined()
    })

    it('should return undefined for empty tree', () => {
      const empty = new RedBlackTreeMap<number, string>()
      expect(empty.upperBound(1)).toBeUndefined()
    })

    it('should return min for key below all', () => {
      expect(tree.upperBound(0)).toEqual([1, 'one'])
    })

    it('should return undefined for key above max', () => {
      expect(tree.upperBound(10)).toBeUndefined()
    })
  })

  describe('range', () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) tree.set(i, String(i))
    })

    it('should return entries in inclusive range', () => {
      const result = tree.range(3, 7)
      expect(result.map(([k]) => k)).toEqual([3, 4, 5, 6, 7])
    })

    it('should return single element range', () => {
      const result = tree.range(5, 5)
      expect(result).toEqual([[5, '5']])
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
      expect(result.map(([k]) => k)).toEqual([2, 3, 4, 5, 6, 7, 8])
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
      expect(result.map(([, v]) => v)).toEqual(['3', '4', '5'])
    })

    it('should handle range on empty tree', () => {
      const empty = new RedBlackTreeMap<number, string>()
      expect(empty.range(1, 10)).toEqual([])
    })

    it('should handle range on single element tree', () => {
      const single = new RedBlackTreeMap<number, string>()
      single.set(5, 'five')
      expect(single.range(1, 10)).toEqual([[5, 'five']])
      expect(single.range(5, 5)).toEqual([[5, 'five']])
      expect(single.range(6, 10)).toEqual([])
    })
  })

  describe('static fromEntries', () => {
    it('should create tree from entries', () => {
      const t = RedBlackTreeMap.fromEntries([
        [5, 'five'],
        [3, 'three'],
        [7, 'seven'],
      ] as [number, string][])
      expect(t.size).toBe(3)
      expect(t.get(5)).toBe('five')
      expect(t.get(3)).toBe('three')
      expect(t.get(7)).toBe('seven')
    })

    it('should create tree with custom comparator', () => {
      const t = RedBlackTreeMap.fromEntries(
        [
          ['b', 2],
          ['a', 1],
          ['c', 3],
        ] as [string, number][],
        (a, b) => a.localeCompare(b),
      )
      expect(t.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty entries', () => {
      const t = RedBlackTreeMap.fromEntries<number, string>([])
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle duplicate keys (last wins)', () => {
      const t = RedBlackTreeMap.fromEntries([
        [1, 'a'],
        [1, 'b'],
      ] as [number, string][])
      expect(t.size).toBe(1)
      expect(t.get(1)).toBe('b')
    })

    it('should produce sorted keys', () => {
      const t = RedBlackTreeMap.fromEntries([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ] as [number, string][])
      expect(t.keys()).toEqual([1, 2, 3])
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse order comparator', () => {
      const t = new RedBlackTreeMap<number, string>((a, b) => b - a)
      t.set(1, 'one')
      t.set(5, 'five')
      t.set(3, 'three')
      expect(t.keys()).toEqual([5, 3, 1])
    })

    it('should work with case-insensitive string comparator', () => {
      const t = new RedBlackTreeMap<string, number>((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      )
      t.set('Banana', 1)
      t.set('apple', 2)
      t.set('Cherry', 3)
      expect(t.keys()).toEqual(['apple', 'Banana', 'Cherry'])
    })
  })

  describe('type exports', () => {
    it('should support RBColor type', () => {
      const red: RBColor = 'red'
      const black: RBColor = 'black'
      expect(red).toBe('red')
      expect(black).toBe('black')
    })

    it('should support RBNode interface', () => {
      const node: RBNode<number, string> = {
        key: 1,
        value: 'test',
        color: 'red',
        left: null,
        right: null,
        parent: null,
      }
      expect(node.key).toBe(1)
      expect(node.value).toBe('test')
      expect(node.color).toBe('red')
    })

    it('should support CompareFunction type', () => {
      const cmp: CompareFunction<number> = (a, b) => a - b
      expect(cmp(1, 2)).toBe(-1)
      expect(cmp(2, 1)).toBe(1)
      expect(cmp(1, 1)).toBe(0)
    })
  })

  describe('red-black tree invariants', () => {
    it('should maintain BST ordering after 100 sequential insertions', () => {
      for (let i = 0; i < 100; i++) tree.set(i, String(i))
      const keys = tree.keys()
      for (let i = 0; i < 99; i++) {
        expect(keys[i]! < keys[i + 1]!).toBe(true)
      }
    })

    it('should maintain BST ordering after mixed insertions and deletions', () => {
      for (let i = 0; i < 50; i++) tree.set(i, String(i))
      for (let i = 0; i < 25; i++) tree.delete(i)
      for (let i = 50; i < 75; i++) tree.set(i, String(i))
      const keys = tree.keys()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('should handle sequential insertions', () => {
      for (let i = 1; i <= 100; i++) tree.set(i, String(i))
      expect(tree.size).toBe(100)
      expect(tree.min()).toEqual([1, '1'])
      expect(tree.max()).toEqual([100, '100'])
    })

    it('should handle reverse sequential insertions', () => {
      for (let i = 100; i >= 1; i--) tree.set(i, String(i))
      expect(tree.size).toBe(100)
      expect(tree.min()).toEqual([1, '1'])
      expect(tree.max()).toEqual([100, '100'])
    })

    it('should maintain balance after alternating insert/delete', () => {
      for (let i = 0; i < 500; i++) {
        tree.set(i, String(i))
        if (i > 0 && i % 3 === 0) tree.delete(i - 1)
      }
      const keys = tree.keys()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      tree.set(1, 'one')
      expect(tree.size).toBe(1)
      expect(tree.min()).toEqual([1, 'one'])
      expect(tree.max()).toEqual([1, 'one'])
      expect(tree.delete(1)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle two elements', () => {
      tree.set(1, 'a')
      tree.set(2, 'b')
      expect(tree.size).toBe(2)
      expect(tree.keys()).toEqual([1, 2])
    })

    it('should handle operations on empty tree gracefully', () => {
      expect(tree.delete(1)).toBe(false)
      expect(tree.get(1)).toBeUndefined()
      expect(tree.has(1)).toBe(false)
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
      expect(tree.lowerBound(1)).toBeUndefined()
      expect(tree.upperBound(1)).toBeUndefined()
      expect(tree.range(1, 10)).toEqual([])
      expect(tree.keys()).toEqual([])
      expect(tree.values()).toEqual([])
      expect(tree.entries()).toEqual([])
    })

    it('should handle duplicate key overwrite preserving structure', () => {
      tree.set(5, 'a')
      tree.set(3, 'b')
      tree.set(7, 'c')
      tree.set(5, 'updated')
      expect(tree.size).toBe(3)
      expect(tree.get(5)).toBe('updated')
      expect(tree.keys()).toEqual([3, 5, 7])
    })

    it('should handle insert delete cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) tree.set(i, String(i))
        for (let i = 0; i < 20; i++) tree.delete(i)
        expect(tree.isEmpty()).toBe(true)
      }
    })

    it('should handle large range of keys', () => {
      tree.set(-1000, 'neg')
      tree.set(0, 'zero')
      tree.set(1000, 'pos')
      expect(tree.min()).toEqual([-1000, 'neg'])
      expect(tree.max()).toEqual([1000, 'pos'])
      expect(tree.get(0)).toBe('zero')
    })
  })

  describe('stress tests', () => {
    it('should handle 500 sequential insertions', () => {
      for (let i = 0; i < 500; i++) tree.set(i, String(i))
      expect(tree.size).toBe(500)
      const keys = tree.keys()
      for (let i = 0; i < 500; i++) {
        expect(keys[i]).toBe(i)
      }
    })

    it('should handle 500+ random insertions and deletions with BST verification', () => {
      const randomKeys = Array.from({ length: 600 }, () => Math.floor(Math.random() * 10000))
      const uniqueKeys = [...new Set(randomKeys)]
      for (const k of uniqueKeys) tree.set(k, String(k))
      expect(tree.size).toBe(uniqueKeys.length)
      const half = uniqueKeys.slice(0, Math.floor(uniqueKeys.length / 2))
      for (const k of half) tree.delete(k)
      const remaining = tree.keys()
      const sorted = [...remaining].sort((a, b) => a - b)
      expect(remaining).toEqual(sorted)
    })

    it('should handle 500 reverse sequential insertions', () => {
      for (let i = 500; i >= 0; i--) tree.set(i, String(i))
      expect(tree.size).toBe(501)
      const keys = tree.keys()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('should handle alternating insert/delete with 500 ops', () => {
      for (let i = 0; i < 500; i++) {
        tree.set(i, String(i))
        if (i > 0 && i % 2 === 0) tree.delete(i - 1)
      }
      const keys = tree.keys()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('should handle 1000 sequential keys (worst case for BST)', () => {
      for (let i = 0; i < 1000; i++) tree.set(i, String(i))
      expect(tree.size).toBe(1000)
      const keys = tree.keys()
      for (let i = 0; i < 1000; i++) {
        expect(keys[i]).toBe(i)
      }
    })

    it('should handle random insertions verify all present', () => {
      const keys = new Set<number>()
      for (let i = 0; i < 500; i++) {
        const k = Math.floor(Math.random() * 10000)
        keys.add(k)
        tree.set(k, String(k))
      }
      expect(tree.size).toBe(keys.size)
      for (const k of keys) {
        expect(tree.has(k)).toBe(true)
        expect(tree.get(k)).toBe(String(k))
      }
    })

    it('should handle delete all 500 elements one by one', () => {
      for (let i = 0; i < 500; i++) tree.set(i, String(i))
      for (let i = 0; i < 500; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should handle delete every other element from 500', () => {
      for (let i = 0; i < 500; i++) tree.set(i, String(i))
      for (let i = 0; i < 500; i += 2) tree.delete(i)
      expect(tree.size).toBe(250)
      const keys = tree.keys()
      for (const k of keys) {
        expect(k % 2).toBe(1)
      }
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })
  })
})
