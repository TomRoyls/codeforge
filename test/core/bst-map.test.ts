import { describe, it, expect, beforeEach } from 'vitest'
import { BSTMap } from '../../src/core/bst-map/bst-map.js'
import { defaultComparator } from '../../src/core/bst-map/types.js'
import type { BSTEntry } from '../../src/core/bst-map/types.js'

describe('BSTMap', () => {
  let bst: BSTMap<number, string>

  beforeEach(() => {
    bst = new BSTMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty BST', () => {
      const t = new BSTMap<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create BST with initial entries', () => {
      const t = new BSTMap<number, string>({
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

    it('should create BST with custom comparator', () => {
      const t = new BSTMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('Hello', 1)
      t.set('hello', 2)
      expect(t.size()).toBe(1)
      expect(t.get('Hello')).toBe(2)
    })

    it('should handle empty options object', () => {
      const t = new BSTMap<number, string>({})
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle initial entries with duplicates (last wins)', () => {
      const t = new BSTMap<number, string>({
        entries: [
          [1, 'a'],
          [1, 'b'],
        ],
      })
      expect(t.size()).toBe(1)
      expect(t.get(1)).toBe('b')
    })

    it('should handle no options argument', () => {
      const t = new BSTMap<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should maintain sorted order with initial entries', () => {
      const t = new BSTMap<number, string>({
        entries: [
          [5, 'five'],
          [2, 'two'],
          [8, 'eight'],
          [1, 'one'],
          [3, 'three'],
        ],
      })
      expect(t.keys()).toEqual([1, 2, 3, 5, 8])
    })
  })

  describe('set/get', () => {
    it('should set and get a single entry', () => {
      bst.set(1, 'one')
      expect(bst.get(1)).toBe('one')
    })

    it('should set and get multiple entries', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      expect(bst.get(1)).toBe('one')
      expect(bst.get(2)).toBe('two')
      expect(bst.get(3)).toBe('three')
    })

    it('should overwrite existing key', () => {
      bst.set(1, 'one')
      bst.set(1, 'updated')
      expect(bst.get(1)).toBe('updated')
      expect(bst.size()).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      expect(bst.get(99)).toBeUndefined()
    })

    it('should handle string keys', () => {
      const strTree = new BSTMap<string, number>()
      strTree.set('banana', 2)
      strTree.set('apple', 1)
      strTree.set('cherry', 3)
      expect(strTree.get('banana')).toBe(2)
      expect(strTree.get('apple')).toBe(1)
      expect(strTree.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should insert in ascending order and maintain sorted order', () => {
      for (let i = 1; i <= 10; i++) {
        bst.set(i, `val-${i}`)
      }
      expect(bst.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should insert in descending order and maintain sorted order', () => {
      for (let i = 10; i >= 1; i--) {
        bst.set(i, `val-${i}`)
      }
      expect(bst.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('should return undefined for get on empty map', () => {
      expect(bst.get(1)).toBeUndefined()
    })

    it('should handle object values', () => {
      const objTree = new BSTMap<number, { name: string }>()
      objTree.set(1, { name: 'test' })
      expect(objTree.get(1)?.name).toBe('test')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      bst.set(1, 'one')
      expect(bst.has(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(bst.has(99)).toBe(false)
    })

    it('should return false after key is deleted', () => {
      bst.set(1, 'one')
      bst.delete(1)
      expect(bst.has(1)).toBe(false)
    })

    it('should return true for multiple existing keys', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      expect(bst.has(1)).toBe(true)
      expect(bst.has(2)).toBe(true)
      expect(bst.has(3)).toBe(true)
    })

    it('should return false on empty map', () => {
      expect(bst.has(1)).toBe(false)
    })
  })

  describe('contains (alias)', () => {
    it('should return true for existing key', () => {
      bst.set(1, 'one')
      expect(bst.contains(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(bst.contains(99)).toBe(false)
    })

    it('should behave identically to has', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.contains(1)).toBe(bst.has(1))
      expect(bst.contains(2)).toBe(bst.has(2))
      expect(bst.contains(3)).toBe(bst.has(3))
    })
  })

  describe('insert (alias)', () => {
    it('should insert a value like set', () => {
      bst.insert(1, 'one')
      expect(bst.get(1)).toBe('one')
      expect(bst.size()).toBe(1)
    })

    it('should overwrite like set', () => {
      bst.insert(1, 'one')
      bst.insert(1, 'two')
      expect(bst.get(1)).toBe('two')
      expect(bst.size()).toBe(1)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      bst.set(1, 'one')
      expect(bst.delete(1)).toBe(true)
      expect(bst.get(1)).toBeUndefined()
      expect(bst.size()).toBe(0)
    })

    it('should return false for non-existent key', () => {
      expect(bst.delete(99)).toBe(false)
    })

    it('should delete from map with multiple entries', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      expect(bst.delete(2)).toBe(true)
      expect(bst.size()).toBe(2)
      expect(bst.get(2)).toBeUndefined()
    })

    it('should handle deleting root with two children', () => {
      bst.set(5, 'five')
      bst.set(3, 'three')
      bst.set(7, 'seven')
      bst.delete(5)
      expect(bst.size()).toBe(2)
      expect(bst.get(5)).toBeUndefined()
      expect(bst.keys()).toEqual([3, 7])
    })

    it('should handle deleting all entries', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.delete(1)
      bst.delete(2)
      expect(bst.size()).toBe(0)
      expect(bst.isEmpty()).toBe(true)
    })

    it('should maintain sorted order after deletion', () => {
      bst.set(5, 'five')
      bst.set(3, 'three')
      bst.set(7, 'seven')
      bst.set(1, 'one')
      bst.set(9, 'nine')
      bst.delete(5)
      expect(bst.keys()).toEqual([1, 3, 7, 9])
    })

    it('should handle deleting leaf node', () => {
      bst.set(2, 'two')
      bst.set(1, 'one')
      bst.set(3, 'three')
      bst.delete(1)
      expect(bst.size()).toBe(2)
      expect(bst.keys()).toEqual([2, 3])
    })

    it('should handle deleting node with one child', () => {
      bst.set(5, 'five')
      bst.set(3, 'three')
      bst.set(7, 'seven')
      bst.set(6, 'six')
      bst.delete(7)
      expect(bst.keys()).toEqual([3, 5, 6])
    })

    it('should handle deleting non-existent keys from populated map', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.delete(99)).toBe(false)
      expect(bst.size()).toBe(2)
    })

    it('should handle deleting from empty map', () => {
      expect(bst.delete(1)).toBe(false)
    })
  })

  describe('size/isEmpty', () => {
    it('should return correct size after operations', () => {
      expect(bst.size()).toBe(0)
      bst.set(1, 'one')
      expect(bst.size()).toBe(1)
      bst.set(2, 'two')
      expect(bst.size()).toBe(2)
      bst.delete(1)
      expect(bst.size()).toBe(1)
    })

    it('should reflect isEmpty correctly', () => {
      expect(bst.isEmpty()).toBe(true)
      bst.set(1, 'one')
      expect(bst.isEmpty()).toBe(false)
      bst.delete(1)
      expect(bst.isEmpty()).toBe(true)
    })

    it('should not change size on overwrite', () => {
      bst.set(1, 'one')
      expect(bst.size()).toBe(1)
      bst.set(1, 'updated')
      expect(bst.size()).toBe(1)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      bst.clear()
      expect(bst.size()).toBe(0)
      expect(bst.isEmpty()).toBe(true)
      expect(bst.get(1)).toBeUndefined()
    })

    it('should handle clearing empty map', () => {
      bst.clear()
      expect(bst.size()).toBe(0)
      expect(bst.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      bst.set(1, 'one')
      bst.clear()
      bst.set(2, 'two')
      expect(bst.size()).toBe(1)
      expect(bst.get(2)).toBe('two')
    })
  })

  describe('getMin/getMax', () => {
    it('should return undefined for empty map', () => {
      expect(bst.getMin()).toBeUndefined()
      expect(bst.getMax()).toBeUndefined()
    })

    it('should return min entry', () => {
      bst.set(5, 'five')
      bst.set(3, 'three')
      bst.set(7, 'seven')
      expect(bst.getMin()).toEqual({ key: 3, value: 'three' })
    })

    it('should return max entry', () => {
      bst.set(5, 'five')
      bst.set(3, 'three')
      bst.set(7, 'seven')
      expect(bst.getMax()).toEqual({ key: 7, value: 'seven' })
    })

    it('should return same entry for single-element map', () => {
      bst.set(1, 'one')
      expect(bst.getMin()).toEqual({ key: 1, value: 'one' })
      expect(bst.getMax()).toEqual({ key: 1, value: 'one' })
    })

    it('should update min/max after deletions', () => {
      bst.set(1, 'one')
      bst.set(5, 'five')
      bst.set(10, 'ten')
      bst.delete(1)
      expect(bst.getMin()).toEqual({ key: 5, value: 'five' })
      bst.delete(10)
      expect(bst.getMax()).toEqual({ key: 5, value: 'five' })
    })

    it('should get min/max on single element after deletions', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      bst.delete(1)
      bst.delete(3)
      expect(bst.getMin()).toEqual({ key: 2, value: 'two' })
      expect(bst.getMax()).toEqual({ key: 2, value: 'two' })
    })

    it('should find min/max on left-skewed tree', () => {
      bst.set(5, 'five')
      bst.set(4, 'four')
      bst.set(3, 'three')
      bst.set(2, 'two')
      bst.set(1, 'one')
      expect(bst.getMin()).toEqual({ key: 1, value: 'one' })
      expect(bst.getMax()).toEqual({ key: 5, value: 'five' })
    })

    it('should find min/max on right-skewed tree', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      bst.set(4, 'four')
      bst.set(5, 'five')
      expect(bst.getMin()).toEqual({ key: 1, value: 'one' })
      expect(bst.getMax()).toEqual({ key: 5, value: 'five' })
    })
  })

  describe('predecessor/successor', () => {
    beforeEach(() => {
      bst.set(1, 'one')
      bst.set(3, 'three')
      bst.set(5, 'five')
      bst.set(7, 'seven')
      bst.set(9, 'nine')
    })

    it('should return predecessor of a key', () => {
      expect(bst.predecessor(5)).toEqual({ key: 3, value: 'three' })
    })

    it('should return successor of a key', () => {
      expect(bst.successor(5)).toEqual({ key: 7, value: 'seven' })
    })

    it('should return undefined for predecessor of min key', () => {
      expect(bst.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for successor of max key', () => {
      expect(bst.successor(9)).toBeUndefined()
    })

    it('should return predecessor for non-existent key', () => {
      expect(bst.predecessor(6)).toEqual({ key: 5, value: 'five' })
    })

    it('should return successor for non-existent key', () => {
      expect(bst.successor(6)).toEqual({ key: 7, value: 'seven' })
    })

    it('should return undefined for predecessor on empty map', () => {
      const empty = new BSTMap<number, string>()
      expect(empty.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for successor on empty map', () => {
      const empty = new BSTMap<number, string>()
      expect(empty.successor(1)).toBeUndefined()
    })

    it('should find predecessor below all keys', () => {
      expect(bst.predecessor(0)).toBeUndefined()
    })

    it('should find successor above all keys', () => {
      expect(bst.successor(10)).toBeUndefined()
    })

    it('should return predecessor for key equal to an existing key', () => {
      expect(bst.predecessor(3)).toEqual({ key: 1, value: 'one' })
    })

    it('should return successor for key equal to an existing key', () => {
      expect(bst.successor(3)).toEqual({ key: 5, value: 'five' })
    })
  })

  describe('range', () => {
    beforeEach(() => {
      bst.set(1, 'one')
      bst.set(3, 'three')
      bst.set(5, 'five')
      bst.set(7, 'seven')
      bst.set(9, 'nine')
    })

    it('should return entries in range [start, end]', () => {
      const result = bst.range(3, 7)
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 5, value: 'five' },
        { key: 7, value: 'seven' },
      ])
    })

    it('should return single entry for equal start and end', () => {
      const result = bst.range(5, 5)
      expect(result).toEqual([{ key: 5, value: 'five' }])
    })

    it('should return empty array for invalid range', () => {
      const result = bst.range(7, 3)
      expect(result).toEqual([])
    })

    it('should return empty array when no keys in range', () => {
      const result = bst.range(10, 20)
      expect(result).toEqual([])
    })

    it('should return all entries for full range', () => {
      const result = bst.range(1, 9)
      expect(result.length).toBe(5)
    })

    it('should return empty for empty map', () => {
      const empty = new BSTMap<number, string>()
      expect(empty.range(1, 5)).toEqual([])
    })

    it('should handle partial overlap at start', () => {
      const result = bst.range(0, 3)
      expect(result).toEqual([{ key: 1, value: 'one' }, { key: 3, value: 'three' }])
    })

    it('should handle partial overlap at end', () => {
      const result = bst.range(7, 15)
      expect(result).toEqual([{ key: 7, value: 'seven' }, { key: 9, value: 'nine' }])
    })

    it('should return entries in range with non-existent boundaries', () => {
      const result = bst.range(2, 8)
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 5, value: 'five' },
        { key: 7, value: 'seven' },
      ])
    })
  })

  describe('keys/values/entries', () => {
    it('should return keys in sorted order', () => {
      bst.set(3, 'three')
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.keys()).toEqual([1, 2, 3])
    })

    it('should return values in key-sorted order', () => {
      bst.set(3, 'three')
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.values()).toEqual(['one', 'two', 'three'])
    })

    it('should return entries in key-sorted order', () => {
      bst.set(3, 'three')
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.entries()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should return empty arrays for empty map', () => {
      expect(bst.keys()).toEqual([])
      expect(bst.values()).toEqual([])
      expect(bst.entries()).toEqual([])
    })

    it('should return correct keys after deletion', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      bst.delete(2)
      expect(bst.keys()).toEqual([1, 3])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries in order', () => {
      bst.set(3, 'three')
      bst.set(1, 'one')
      bst.set(2, 'two')
      const result: BSTEntry<number, string>[] = []
      bst.forEach((entry) => result.push(entry))
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should provide correct indices', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      const indices: number[] = []
      bst.forEach((_entry, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback for empty map', () => {
      let callCount = 0
      bst.forEach(() => callCount++)
      expect(callCount).toBe(0)
    })
  })

  describe('iterator', () => {
    it('should iterate over all entries in sorted order', () => {
      bst.set(3, 'three')
      bst.set(1, 'one')
      bst.set(2, 'two')
      const result = [...bst]
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should produce no entries for empty map', () => {
      const result = [...bst]
      expect(result).toEqual([])
    })

    it('should work with for...of loop', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      const keys: number[] = []
      for (const entry of bst) {
        keys.push(entry.key)
      }
      expect(keys).toEqual([1, 2])
    })

    it('should work with destructuring', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.set(3, 'three')
      const first = bst[Symbol.iterator]().next()
      expect(first.value).toEqual({ key: 1, value: 'one' })
      expect(first.done).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return entries as array', () => {
      bst.set(2, 'two')
      bst.set(1, 'one')
      expect(bst.toArray()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
      ])
    })

    it('should return empty array for empty map', () => {
      expect(bst.toArray()).toEqual([])
    })

    it('should return same result as entries', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.toArray()).toEqual(bst.entries())
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      const cloned = bst.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get(1)).toBe('one')
      expect(cloned.get(2)).toBe('two')
    })

    it('should not affect original when modified', () => {
      bst.set(1, 'one')
      const cloned = bst.clone()
      cloned.set(2, 'two')
      expect(bst.size()).toBe(1)
      expect(bst.has(2)).toBe(false)
      expect(cloned.size()).toBe(2)
    })

    it('should not affect original when deleted from clone', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      const cloned = bst.clone()
      cloned.delete(1)
      expect(bst.has(1)).toBe(true)
      expect(bst.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should clone empty map', () => {
      const cloned = bst.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator in clone', () => {
      const t = new BSTMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('A', 1)
      const cloned = t.clone()
      cloned.set('a', 2)
      expect(cloned.size()).toBe(1)
      expect(cloned.get('a')).toBe(2)
    })

    it('should produce deep structural independence', () => {
      for (let i = 0; i < 50; i++) {
        bst.set(i, `val-${i}`)
      }
      const cloned = bst.clone()
      cloned.delete(25)
      cloned.set(100, 'new')
      expect(bst.has(25)).toBe(true)
      expect(bst.has(100)).toBe(false)
      expect(cloned.has(25)).toBe(false)
      expect(cloned.has(100)).toBe(true)
    })
  })

  describe('getHeight', () => {
    it('should return 0 for empty map', () => {
      expect(bst.getHeight()).toBe(0)
    })

    it('should return 1 for single element', () => {
      bst.set(1, 'one')
      expect(bst.getHeight()).toBe(1)
    })

    it('should return n for sequential ascending inserts (worst case)', () => {
      for (let i = 1; i <= 5; i++) {
        bst.set(i, `val-${i}`)
      }
      expect(bst.getHeight()).toBe(5)
    })

    it('should return n for sequential descending inserts (worst case)', () => {
      for (let i = 5; i >= 1; i--) {
        bst.set(i, `val-${i}`)
      }
      expect(bst.getHeight()).toBe(5)
    })

    it('should return balanced height for random inserts', () => {
      bst.set(5, 'five')
      bst.set(3, 'three')
      bst.set(7, 'seven')
      bst.set(1, 'one')
      bst.set(9, 'nine')
      expect(bst.getHeight()).toBeLessThanOrEqual(3)
    })

    it('should return 0 after clearing', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      bst.clear()
      expect(bst.getHeight()).toBe(0)
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const t = new BSTMap<number, string>({
        comparator: (a, b) => b - a,
      })
      t.set(1, 'one')
      t.set(2, 'two')
      t.set(3, 'three')
      expect(t.keys()).toEqual([3, 2, 1])
      expect(t.getMin()).toEqual({ key: 3, value: 'three' })
      expect(t.getMax()).toEqual({ key: 1, value: 'one' })
    })

    it('should work with string keys using default comparator', () => {
      const t = new BSTMap<string, number>()
      t.set('banana', 2)
      t.set('apple', 1)
      t.set('cherry', 3)
      expect(t.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should work with case-insensitive string comparator', () => {
      const t = new BSTMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('Apple', 1)
      t.set('banana', 2)
      t.set('CHERRY', 3)
      expect(t.get('apple')).toBe(1)
      expect(t.get('BANANA')).toBe(2)
      expect(t.size()).toBe(3)
    })

    it('should use defaultComparator when none provided', () => {
      bst.set(3, 'three')
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.keys()).toEqual([1, 2, 3])
    })

    it('should work with reverse comparator predecessor/successor', () => {
      const t = new BSTMap<number, string>({
        comparator: (a, b) => b - a,
      })
      t.set(1, 'one')
      t.set(3, 'three')
      t.set(5, 'five')
      expect(t.predecessor(3)).toEqual({ key: 5, value: 'five' })
      expect(t.successor(3)).toEqual({ key: 1, value: 'one' })
    })

    it('should work with reverse comparator range', () => {
      const t = new BSTMap<number, string>({
        comparator: (a, b) => b - a,
      })
      t.set(1, 'one')
      t.set(3, 'three')
      t.set(5, 'five')
      const result = t.range(5, 1)
      expect(result).toEqual([
        { key: 5, value: 'five' },
        { key: 3, value: 'three' },
        { key: 1, value: 'one' },
      ])
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      bst.set(1, 'one')
      expect(bst.size()).toBe(1)
      expect(bst.isEmpty()).toBe(false)
      expect(bst.getMin()).toEqual({ key: 1, value: 'one' })
      expect(bst.getMax()).toEqual({ key: 1, value: 'one' })
      expect(bst.predecessor(1)).toBeUndefined()
      expect(bst.successor(1)).toBeUndefined()
      expect(bst.delete(1)).toBe(true)
      expect(bst.isEmpty()).toBe(true)
    })

    it('should handle two elements', () => {
      bst.set(2, 'two')
      bst.set(1, 'one')
      expect(bst.keys()).toEqual([1, 2])
      expect(bst.predecessor(2)).toEqual({ key: 1, value: 'one' })
      expect(bst.successor(1)).toEqual({ key: 2, value: 'two' })
    })

    it('should handle setting same key multiple times', () => {
      bst.set(1, 'a')
      bst.set(1, 'b')
      bst.set(1, 'c')
      expect(bst.size()).toBe(1)
      expect(bst.get(1)).toBe('c')
    })

    it('should handle deleting non-existent keys from populated map', () => {
      bst.set(1, 'one')
      bst.set(2, 'two')
      expect(bst.delete(99)).toBe(false)
      expect(bst.size()).toBe(2)
    })

    it('should handle random insert pattern', () => {
      const keys = [5, 2, 8, 1, 3, 7, 9, 4, 6]
      for (const k of keys) {
        bst.set(k, `val-${k}`)
      }
      expect(bst.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('stress test', () => {
    it('should handle 1000 sequential ascending inserts', () => {
      const n = 1000
      const t = new BSTMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i * 10)
      }
      expect(t.size()).toBe(n)
      const allKeys = t.keys()
      expect(allKeys.length).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(allKeys[i]).toBe(i)
        expect(t.get(i)).toBe(i * 10)
      }
    })

    it('should handle 1000 sequential descending inserts', () => {
      const n = 1000
      const t = new BSTMap<number, number>()
      for (let i = n - 1; i >= 0; i--) {
        t.set(i, i * 10)
      }
      expect(t.size()).toBe(n)
      expect(t.keys()[0]).toBe(0)
      expect(t.keys()[n - 1]).toBe(n - 1)
    })

    it('should have O(n) height for sequential inserts (worst case unbalanced)', () => {
      const n = 100
      const t = new BSTMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i)
      }
      expect(t.getHeight()).toBe(n)
    })

    it('should handle 1000 random inserts', () => {
      const n = 1000
      const t = new BSTMap<number, number>()
      const keys = Array.from({ length: n }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = keys[i]!
        keys[i] = keys[j]!
        keys[j] = temp
      }
      for (const k of keys) {
        t.set(k, k)
      }
      expect(t.size()).toBe(n)
      const allKeys = t.keys()
      for (let i = 0; i < n; i++) {
        expect(allKeys[i]).toBe(i)
      }
    })

    it('should handle bulk delete and maintain order', () => {
      const n = 500
      const t = new BSTMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i)
      }
      for (let i = 0; i < n; i += 2) {
        t.delete(i)
      }
      expect(t.size()).toBe(250)
      const allKeys = t.keys()
      for (const k of allKeys) {
        expect(k % 2).toBe(1)
      }
    })

    it('should handle alternating insert and delete', () => {
      const t = new BSTMap<number, number>()
      for (let i = 0; i < 200; i++) {
        t.set(i, i)
        if (i > 0 && i % 3 === 0) {
          t.delete(i - 1)
        }
      }
      expect(t.size()).toBeGreaterThan(0)
    })

    it('should handle delete all elements one by one', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        bst.set(i, `val-${i}`)
      }
      for (let i = 0; i < n; i++) {
        expect(bst.delete(i)).toBe(true)
      }
      expect(bst.size()).toBe(0)
      expect(bst.isEmpty()).toBe(true)
    })

    it('should handle delete all elements in reverse order', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        bst.set(i, `val-${i}`)
      }
      for (let i = n - 1; i >= 0; i--) {
        expect(bst.delete(i)).toBe(true)
      }
      expect(bst.size()).toBe(0)
      expect(bst.isEmpty()).toBe(true)
    })

    it('should handle predecessor/successor on large tree', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        bst.set(i, `val-${i}`)
      }
      for (let i = 1; i < n - 1; i++) {
        expect(bst.predecessor(i)).toEqual({ key: i - 1, value: `val-${i - 1}` })
        expect(bst.successor(i)).toEqual({ key: i + 1, value: `val-${i + 1}` })
      }
      expect(bst.predecessor(0)).toBeUndefined()
      expect(bst.successor(n - 1)).toBeUndefined()
    })

    it('should handle range queries on large tree', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        bst.set(i, `val-${i}`)
      }
      const result = bst.range(20, 30)
      expect(result.length).toBe(11)
      expect(result[0]).toEqual({ key: 20, value: 'val-20' })
      expect(result[10]).toEqual({ key: 30, value: 'val-30' })
    })

    it('should handle forEach on large tree', () => {
      const n = 500
      const t = new BSTMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i * 2)
      }
      let count = 0
      t.forEach((entry, index) => {
        expect(entry.key).toBe(index)
        expect(entry.value).toBe(index * 2)
        count++
      })
      expect(count).toBe(n)
    })

    it('should handle iterator on large tree', () => {
      const n = 500
      const t = new BSTMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i)
      }
      const arr = [...t]
      expect(arr.length).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(arr[i]?.key).toBe(i)
      }
    })

    it('should handle clone on large tree', () => {
      const n = 500
      const t = new BSTMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i)
      }
      const cloned = t.clone()
      expect(cloned.size()).toBe(n)
      cloned.delete(0)
      expect(t.has(0)).toBe(true)
      expect(cloned.has(0)).toBe(false)
    })
  })

  describe('exports', () => {
    it('should export defaultComparator', () => {
      expect(defaultComparator(1, 2)).toBeLessThan(0)
      expect(defaultComparator(2, 1)).toBeGreaterThan(0)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should export types', () => {
      const entry: BSTEntry<number, string> = { key: 1, value: 'one' }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe('one')
    })
  })
})
