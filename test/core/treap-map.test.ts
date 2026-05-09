import { describe, it, expect, beforeEach } from 'vitest'
import { TreapMap } from '../../src/core/treap-map/treap-map.js'
import { defaultComparator } from '../../src/core/treap-map/types.js'
import type { TreapEntry, TreapMapOptions } from '../../src/core/treap-map/types.js'

describe('TreapMap', () => {
  let treap: TreapMap<number, string>

  beforeEach(() => {
    treap = new TreapMap<number, string>()
  })

  describe('constructor', () => {
    it('should create an empty treap', () => {
      const t = new TreapMap<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create treap with initial entries', () => {
      const t = new TreapMap<number, string>({
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

    it('should create treap with custom comparator', () => {
      const t = new TreapMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('Hello', 1)
      t.set('hello', 2)
      expect(t.size()).toBe(1)
      expect(t.get('Hello')).toBe(2)
    })

    it('should handle empty options object', () => {
      const t = new TreapMap<number, string>({})
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle initial entries with duplicates (last wins)', () => {
      const t = new TreapMap<number, string>({
        entries: [
          [1, 'a'],
          [1, 'b'],
        ],
      })
      expect(t.size()).toBe(1)
      expect(t.get(1)).toBe('b')
    })

    it('should handle no options argument', () => {
      const t = new TreapMap<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should maintain sorted order with initial entries', () => {
      const t = new TreapMap<number, string>({
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
      treap.set(1, 'one')
      expect(treap.get(1)).toBe('one')
    })

    it('should set and get multiple entries', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      expect(treap.get(1)).toBe('one')
      expect(treap.get(2)).toBe('two')
      expect(treap.get(3)).toBe('three')
    })

    it('should overwrite existing key', () => {
      treap.set(1, 'one')
      treap.set(1, 'updated')
      expect(treap.get(1)).toBe('updated')
      expect(treap.size()).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      expect(treap.get(99)).toBeUndefined()
    })

    it('should handle various value types', () => {
      const numTree = new TreapMap<string, number>()
      numTree.set('a', 1)
      numTree.set('b', 2)
      expect(numTree.get('a')).toBe(1)
    })

    it('should handle object values', () => {
      const objTree = new TreapMap<number, { name: string }>()
      objTree.set(1, { name: 'test' })
      expect(objTree.get(1)?.name).toBe('test')
    })

    it('should handle null values', () => {
      treap.set(1, null as unknown as string)
      expect(treap.get(1)).toBeNull()
    })

    it('should handle undefined values', () => {
      treap.set(1, undefined as unknown as string)
      expect(treap.get(1)).toBeUndefined()
    })

    it('should handle string keys', () => {
      const strTree = new TreapMap<string, number>()
      strTree.set('banana', 2)
      strTree.set('apple', 1)
      strTree.set('cherry', 3)
      expect(strTree.get('banana')).toBe(2)
      expect(strTree.get('apple')).toBe(1)
      expect(strTree.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should insert in reverse order and maintain sorted order', () => {
      for (let i = 10; i >= 1; i--) {
        treap.set(i, `val-${i}`)
      }
      expect(treap.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      treap.set(1, 'one')
      expect(treap.has(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(treap.has(99)).toBe(false)
    })

    it('should return false after key is deleted', () => {
      treap.set(1, 'one')
      treap.delete(1)
      expect(treap.has(1)).toBe(false)
    })

    it('should return true for multiple existing keys', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      expect(treap.has(1)).toBe(true)
      expect(treap.has(2)).toBe(true)
      expect(treap.has(3)).toBe(true)
    })

    it('should return false on empty treap', () => {
      expect(treap.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      treap.set(1, 'one')
      expect(treap.delete(1)).toBe(true)
      expect(treap.get(1)).toBeUndefined()
      expect(treap.size()).toBe(0)
    })

    it('should return false for non-existent key', () => {
      expect(treap.delete(99)).toBe(false)
    })

    it('should delete from treap with multiple entries', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      expect(treap.delete(2)).toBe(true)
      expect(treap.size()).toBe(2)
      expect(treap.get(2)).toBeUndefined()
    })

    it('should handle deleting root', () => {
      treap.set(5, 'five')
      treap.set(3, 'three')
      treap.set(7, 'seven')
      treap.delete(5)
      expect(treap.size()).toBe(2)
      expect(treap.get(5)).toBeUndefined()
      expect(treap.isValid()).toBe(true)
    })

    it('should handle deleting all entries', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.delete(1)
      treap.delete(2)
      expect(treap.size()).toBe(0)
      expect(treap.isEmpty()).toBe(true)
    })

    it('should maintain sorted order after deletion', () => {
      treap.set(5, 'five')
      treap.set(3, 'three')
      treap.set(7, 'seven')
      treap.set(1, 'one')
      treap.set(9, 'nine')
      treap.delete(5)
      expect(treap.keys()).toEqual([1, 3, 7, 9])
    })

    it('should handle deleting leaf node', () => {
      treap.set(2, 'two')
      treap.set(1, 'one')
      treap.set(3, 'three')
      treap.delete(1)
      expect(treap.size()).toBe(2)
      expect(treap.keys()).toEqual([2, 3])
    })

    it('should keep treap valid after each deletion', () => {
      for (let i = 0; i < 50; i++) {
        treap.set(i, `val-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        treap.delete(i)
        expect(treap.isValid()).toBe(true)
      }
    })
  })

  describe('size/isEmpty', () => {
    it('should return correct size after operations', () => {
      expect(treap.size()).toBe(0)
      treap.set(1, 'one')
      expect(treap.size()).toBe(1)
      treap.set(2, 'two')
      expect(treap.size()).toBe(2)
      treap.delete(1)
      expect(treap.size()).toBe(1)
    })

    it('should reflect isEmpty correctly', () => {
      expect(treap.isEmpty()).toBe(true)
      treap.set(1, 'one')
      expect(treap.isEmpty()).toBe(false)
      treap.delete(1)
      expect(treap.isEmpty()).toBe(true)
    })

    it('should not change size on overwrite', () => {
      treap.set(1, 'one')
      expect(treap.size()).toBe(1)
      treap.set(1, 'updated')
      expect(treap.size()).toBe(1)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      treap.clear()
      expect(treap.size()).toBe(0)
      expect(treap.isEmpty()).toBe(true)
      expect(treap.get(1)).toBeUndefined()
    })

    it('should handle clearing empty treap', () => {
      treap.clear()
      expect(treap.size()).toBe(0)
      expect(treap.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      treap.set(1, 'one')
      treap.clear()
      treap.set(2, 'two')
      expect(treap.size()).toBe(1)
      expect(treap.get(2)).toBe('two')
    })
  })

  describe('getMin/getMax', () => {
    it('should return undefined for empty treap', () => {
      expect(treap.getMin()).toBeUndefined()
      expect(treap.getMax()).toBeUndefined()
    })

    it('should return min entry', () => {
      treap.set(5, 'five')
      treap.set(3, 'three')
      treap.set(7, 'seven')
      expect(treap.getMin()).toEqual({ key: 3, value: 'three' })
    })

    it('should return max entry', () => {
      treap.set(5, 'five')
      treap.set(3, 'three')
      treap.set(7, 'seven')
      expect(treap.getMax()).toEqual({ key: 7, value: 'seven' })
    })

    it('should return same entry for single-element treap', () => {
      treap.set(1, 'one')
      expect(treap.getMin()).toEqual({ key: 1, value: 'one' })
      expect(treap.getMax()).toEqual({ key: 1, value: 'one' })
    })

    it('should update min/max after deletions', () => {
      treap.set(1, 'one')
      treap.set(5, 'five')
      treap.set(10, 'ten')
      treap.delete(1)
      expect(treap.getMin()).toEqual({ key: 5, value: 'five' })
      treap.delete(10)
      expect(treap.getMax()).toEqual({ key: 5, value: 'five' })
    })
  })

  describe('extractMin/extractMax', () => {
    it('should return undefined for empty treap', () => {
      expect(treap.extractMin()).toBeUndefined()
      expect(treap.extractMax()).toBeUndefined()
    })

    it('should extract and remove min entry', () => {
      treap.set(5, 'five')
      treap.set(3, 'three')
      treap.set(7, 'seven')
      const min = treap.extractMin()
      expect(min).toEqual({ key: 3, value: 'three' })
      expect(treap.has(3)).toBe(false)
      expect(treap.size()).toBe(2)
    })

    it('should extract and remove max entry', () => {
      treap.set(5, 'five')
      treap.set(3, 'three')
      treap.set(7, 'seven')
      const max = treap.extractMax()
      expect(max).toEqual({ key: 7, value: 'seven' })
      expect(treap.has(7)).toBe(false)
      expect(treap.size()).toBe(2)
    })

    it('should extract all elements in sorted order via extractMin', () => {
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      const result: TreapEntry<number, string>[] = []
      while (!treap.isEmpty()) {
        const entry = treap.extractMin()!
        result.push(entry)
      }
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should extract all elements in reverse sorted order via extractMax', () => {
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      const result: TreapEntry<number, string>[] = []
      while (!treap.isEmpty()) {
        const entry = treap.extractMax()!
        result.push(entry)
      }
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 2, value: 'two' },
        { key: 1, value: 'one' },
      ])
    })

    it('should keep treap valid after extraction', () => {
      for (let i = 0; i < 20; i++) {
        treap.set(i, `val-${i}`)
      }
      treap.extractMin()
      treap.extractMax()
      expect(treap.isValid()).toBe(true)
    })
  })

  describe('predecessor/successor', () => {
    beforeEach(() => {
      treap.set(1, 'one')
      treap.set(3, 'three')
      treap.set(5, 'five')
      treap.set(7, 'seven')
      treap.set(9, 'nine')
    })

    it('should return predecessor of a key', () => {
      expect(treap.predecessor(5)).toEqual({ key: 3, value: 'three' })
    })

    it('should return successor of a key', () => {
      expect(treap.successor(5)).toEqual({ key: 7, value: 'seven' })
    })

    it('should return undefined for predecessor of min key', () => {
      expect(treap.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for successor of max key', () => {
      expect(treap.successor(9)).toBeUndefined()
    })

    it('should return predecessor for non-existent key', () => {
      expect(treap.predecessor(6)).toEqual({ key: 5, value: 'five' })
    })

    it('should return successor for non-existent key', () => {
      expect(treap.successor(6)).toEqual({ key: 7, value: 'seven' })
    })

    it('should return undefined for predecessor on empty treap', () => {
      const empty = new TreapMap<number, string>()
      expect(empty.predecessor(1)).toBeUndefined()
    })

    it('should return undefined for successor on empty treap', () => {
      const empty = new TreapMap<number, string>()
      expect(empty.successor(1)).toBeUndefined()
    })

    it('should find predecessor below all keys', () => {
      expect(treap.predecessor(0)).toBeUndefined()
    })

    it('should find successor above all keys', () => {
      expect(treap.successor(10)).toBeUndefined()
    })
  })

  describe('range', () => {
    beforeEach(() => {
      treap.set(1, 'one')
      treap.set(3, 'three')
      treap.set(5, 'five')
      treap.set(7, 'seven')
      treap.set(9, 'nine')
    })

    it('should return entries in range [start, end]', () => {
      const result = treap.range(3, 7)
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 5, value: 'five' },
        { key: 7, value: 'seven' },
      ])
    })

    it('should return single entry for equal start and end', () => {
      const result = treap.range(5, 5)
      expect(result).toEqual([{ key: 5, value: 'five' }])
    })

    it('should return empty array for invalid range', () => {
      const result = treap.range(7, 3)
      expect(result).toEqual([])
    })

    it('should return empty array when no keys in range', () => {
      const result = treap.range(10, 20)
      expect(result).toEqual([])
    })

    it('should return all entries for full range', () => {
      const result = treap.range(1, 9)
      expect(result.length).toBe(5)
    })

    it('should return empty for empty treap', () => {
      const empty = new TreapMap<number, string>()
      expect(empty.range(1, 5)).toEqual([])
    })

    it('should handle partial overlap at start', () => {
      const result = treap.range(0, 3)
      expect(result).toEqual([{ key: 1, value: 'one' }, { key: 3, value: 'three' }])
    })

    it('should handle partial overlap at end', () => {
      const result = treap.range(7, 15)
      expect(result).toEqual([{ key: 7, value: 'seven' }, { key: 9, value: 'nine' }])
    })
  })

  describe('keys/values/entries', () => {
    it('should return keys in sorted order', () => {
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      expect(treap.keys()).toEqual([1, 2, 3])
    })

    it('should return values in key-sorted order', () => {
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      expect(treap.values()).toEqual(['one', 'two', 'three'])
    })

    it('should return entries in key-sorted order', () => {
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      expect(treap.entries()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should return empty arrays for empty treap', () => {
      expect(treap.keys()).toEqual([])
      expect(treap.values()).toEqual([])
      expect(treap.entries()).toEqual([])
    })
  })

  describe('atIndex/indexOf', () => {
    beforeEach(() => {
      treap.set(10, 'ten')
      treap.set(20, 'twenty')
      treap.set(30, 'thirty')
      treap.set(40, 'forty')
      treap.set(50, 'fifty')
    })

    it('should return entry at given index', () => {
      expect(treap.atIndex(0)).toEqual({ key: 10, value: 'ten' })
      expect(treap.atIndex(2)).toEqual({ key: 30, value: 'thirty' })
      expect(treap.atIndex(4)).toEqual({ key: 50, value: 'fifty' })
    })

    it('should return undefined for out of bounds index', () => {
      expect(treap.atIndex(-1)).toBeUndefined()
      expect(treap.atIndex(5)).toBeUndefined()
      expect(treap.atIndex(100)).toBeUndefined()
    })

    it('should return index of a key', () => {
      expect(treap.indexOf(10)).toBe(0)
      expect(treap.indexOf(30)).toBe(2)
      expect(treap.indexOf(50)).toBe(4)
    })

    it('should return -1 for non-existent key', () => {
      expect(treap.indexOf(99)).toBe(-1)
    })

    it('should return undefined for empty treap atIndex', () => {
      const empty = new TreapMap<number, string>()
      expect(empty.atIndex(0)).toBeUndefined()
    })

    it('should return -1 for empty treap indexOf', () => {
      const empty = new TreapMap<number, string>()
      expect(empty.indexOf(1)).toBe(-1)
    })

    it('should be inverse operations', () => {
      for (let i = 0; i < 5; i++) {
        const entry = treap.atIndex(i)
        expect(entry).toBeDefined()
        expect(treap.indexOf(entry!.key)).toBe(i)
      }
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      const cloned = treap.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get(1)).toBe('one')
      expect(cloned.get(2)).toBe('two')
    })

    it('should not affect original when modified', () => {
      treap.set(1, 'one')
      const cloned = treap.clone()
      cloned.set(2, 'two')
      expect(treap.size()).toBe(1)
      expect(treap.has(2)).toBe(false)
      expect(cloned.size()).toBe(2)
    })

    it('should clone empty treap', () => {
      const cloned = treap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve comparator in clone', () => {
      const t = new TreapMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.set('A', 1)
      const cloned = t.clone()
      cloned.set('a', 2)
      expect(cloned.size()).toBe(1)
      expect(cloned.get('a')).toBe(2)
    })
  })

  describe('merge', () => {
    it('should merge two treaps', () => {
      treap.set(1, 'one')
      treap.set(3, 'three')
      const other = new TreapMap<number, string>()
      other.set(2, 'two')
      other.set(4, 'four')
      const merged = treap.merge(other)
      expect(merged.size()).toBe(4)
      expect(merged.keys()).toEqual([1, 2, 3, 4])
    })

    it('should overwrite values from other on key conflict', () => {
      treap.set(1, 'one')
      treap.set(2, 'two-original')
      const other = new TreapMap<number, string>()
      other.set(2, 'two-updated')
      other.set(3, 'three')
      const merged = treap.merge(other)
      expect(merged.get(2)).toBe('two-updated')
      expect(merged.size()).toBe(3)
    })

    it('should not modify original treaps', () => {
      treap.set(1, 'one')
      const other = new TreapMap<number, string>()
      other.set(2, 'two')
      const merged = treap.merge(other)
      expect(treap.size()).toBe(1)
      expect(other.size()).toBe(1)
      expect(merged.size()).toBe(2)
    })

    it('should handle merging empty treaps', () => {
      const other = new TreapMap<number, string>()
      const merged = treap.merge(other)
      expect(merged.size()).toBe(0)
      expect(merged.isEmpty()).toBe(true)
    })

    it('should handle merging into empty treap', () => {
      const other = new TreapMap<number, string>()
      other.set(1, 'one')
      const merged = treap.merge(other)
      expect(merged.size()).toBe(1)
      expect(merged.get(1)).toBe('one')
    })
  })

  describe('split', () => {
    it('should split into keys < key and keys >= key', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      treap.set(4, 'four')
      treap.set(5, 'five')
      const [left, right] = treap.split(3)
      expect(left.keys()).toEqual([1, 2])
      expect(right.keys()).toEqual([3, 4, 5])
    })

    it('should produce empty left half when splitting at min', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      const [left, right] = treap.split(1)
      expect(left.size()).toBe(0)
      expect(right.keys()).toEqual([1, 2, 3])
    })

    it('should produce empty right half when splitting above max', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      const [left, right] = treap.split(4)
      expect(left.keys()).toEqual([1, 2, 3])
      expect(right.size()).toBe(0)
    })

    it('should produce both empty halves for empty treap', () => {
      const [left, right] = treap.split(5)
      expect(left.size()).toBe(0)
      expect(right.size()).toBe(0)
    })

    it('should produce valid treaps after split', () => {
      for (let i = 1; i <= 20; i++) {
        treap.set(i, `val-${i}`)
      }
      const [left, right] = treap.split(10)
      expect(left.isValid()).toBe(true)
      expect(right.isValid()).toBe(true)
    })

    it('should split single-element treap at element', () => {
      treap.set(5, 'five')
      const [left, right] = treap.split(5)
      expect(left.size()).toBe(0)
      expect(right.keys()).toEqual([5])
    })

    it('should split single-element treap below element', () => {
      treap.set(5, 'five')
      const [left, right] = treap.split(3)
      expect(left.size()).toBe(0)
      expect(right.keys()).toEqual([5])
    })

    it('should split single-element treap above element', () => {
      treap.set(5, 'five')
      const [left, right] = treap.split(7)
      expect(left.keys()).toEqual([5])
      expect(right.size()).toBe(0)
    })

    it('should preserve total size after split', () => {
      for (let i = 0; i < 50; i++) {
        treap.set(i, `val-${i}`)
      }
      const [left, right] = treap.split(25)
      expect(left.size() + right.size()).toBe(50)
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries in order', () => {
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      const result: TreapEntry<number, string>[] = []
      treap.forEach((entry) => result.push(entry))
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should provide correct indices', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      const indices: number[] = []
      treap.forEach((_entry, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not call callback for empty treap', () => {
      let callCount = 0
      treap.forEach(() => callCount++)
      expect(callCount).toBe(0)
    })
  })

  describe('iterator', () => {
    it('should iterate over all entries in sorted order', () => {
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      const result = [...treap]
      expect(result).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
      ])
    })

    it('should produce no entries for empty treap', () => {
      const result = [...treap]
      expect(result).toEqual([])
    })

    it('should work with for...of loop', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      const keys: number[] = []
      for (const entry of treap) {
        keys.push(entry.key)
      }
      expect(keys).toEqual([1, 2])
    })
  })

  describe('toArray', () => {
    it('should return entries as array', () => {
      treap.set(2, 'two')
      treap.set(1, 'one')
      expect(treap.toArray()).toEqual([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
      ])
    })

    it('should return empty array for empty treap', () => {
      expect(treap.toArray()).toEqual([])
    })

    it('should return same result as entries', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      expect(treap.toArray()).toEqual(treap.entries())
    })
  })

  describe('isValid', () => {
    it('should return true for empty treap', () => {
      expect(treap.isValid()).toBe(true)
    })

    it('should return true after inserts', () => {
      treap.set(1, 'one')
      expect(treap.isValid()).toBe(true)
    })

    it('should return true after many inserts', () => {
      for (let i = 0; i < 100; i++) {
        treap.set(i, `val-${i}`)
      }
      expect(treap.isValid()).toBe(true)
    })

    it('should return true after deletions', () => {
      for (let i = 0; i < 50; i++) {
        treap.set(i, `val-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        treap.delete(i)
      }
      expect(treap.isValid()).toBe(true)
    })

    it('should verify heap property', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      expect(treap.isValid()).toBe(true)
    })

    it('should verify BST property', () => {
      treap.set(5, 'five')
      treap.set(3, 'three')
      treap.set(7, 'seven')
      treap.set(1, 'one')
      treap.set(9, 'nine')
      expect(treap.isValid()).toBe(true)
    })
  })

  describe('getHeight', () => {
    it('should return 0 for empty treap', () => {
      expect(treap.getHeight()).toBe(0)
    })

    it('should return 1 for single element', () => {
      treap.set(1, 'one')
      expect(treap.getHeight()).toBe(1)
    })

    it('should return positive height for populated treap', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      expect(treap.getHeight()).toBeGreaterThan(0)
    })
  })

  describe('custom comparator', () => {
    it('should work with reverse comparator', () => {
      const t = new TreapMap<number, string>({
        comparator: (a, b) => b - a,
      })
      t.set(1, 'one')
      t.set(2, 'two')
      t.set(3, 'three')
      expect(t.keys()).toEqual([3, 2, 1])
      expect(t.getMin()).toEqual({ key: 3, value: 'three' })
      expect(t.getMax()).toEqual({ key: 1, value: 'one' })
    })

    it('should work with case-insensitive string comparator', () => {
      const t = new TreapMap<string, number>({
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
      treap.set(3, 'three')
      treap.set(1, 'one')
      treap.set(2, 'two')
      expect(treap.keys()).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      treap.set(1, 'one')
      expect(treap.size()).toBe(1)
      expect(treap.isEmpty()).toBe(false)
      expect(treap.getMin()).toEqual({ key: 1, value: 'one' })
      expect(treap.getMax()).toEqual({ key: 1, value: 'one' })
      expect(treap.predecessor(1)).toBeUndefined()
      expect(treap.successor(1)).toBeUndefined()
      expect(treap.delete(1)).toBe(true)
      expect(treap.isEmpty()).toBe(true)
    })

    it('should handle two elements', () => {
      treap.set(2, 'two')
      treap.set(1, 'one')
      expect(treap.keys()).toEqual([1, 2])
      expect(treap.predecessor(2)).toEqual({ key: 1, value: 'one' })
      expect(treap.successor(1)).toEqual({ key: 2, value: 'two' })
    })

    it('should handle setting same key multiple times', () => {
      treap.set(1, 'a')
      treap.set(1, 'b')
      treap.set(1, 'c')
      expect(treap.size()).toBe(1)
      expect(treap.get(1)).toBe('c')
    })

    it('should handle large number of operations', () => {
      for (let i = 0; i < 200; i++) {
        treap.set(i, `val-${i}`)
      }
      expect(treap.size()).toBe(200)
      expect(treap.isValid()).toBe(true)
      for (let i = 0; i < 100; i++) {
        treap.delete(i)
      }
      expect(treap.size()).toBe(100)
      expect(treap.isValid()).toBe(true)
    })

    it('should handle deleting non-existent keys from populated treap', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      expect(treap.delete(99)).toBe(false)
      expect(treap.size()).toBe(2)
    })

    it('should handle getMin/getMax on single element after deletions', () => {
      treap.set(1, 'one')
      treap.set(2, 'two')
      treap.set(3, 'three')
      treap.delete(1)
      treap.delete(3)
      expect(treap.getMin()).toEqual({ key: 2, value: 'two' })
      expect(treap.getMax()).toEqual({ key: 2, value: 'two' })
    })
  })

  describe('stress test', () => {
    it('should maintain O(log n) height for sequential inserts', () => {
      const n = 1000
      const t = new TreapMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i * 10)
      }
      expect(t.size()).toBe(n)
      expect(t.isValid()).toBe(true)
      const height = t.getHeight()
      const maxExpected = 4 * Math.ceil(Math.log2(n + 1))
      expect(height).toBeLessThanOrEqual(maxExpected)
    })

    it('should maintain O(log n) height for random inserts', () => {
      const n = 1000
      const t = new TreapMap<number, number>()
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
      expect(t.isValid()).toBe(true)
      const height = t.getHeight()
      const maxExpected = 4 * Math.ceil(Math.log2(n + 1))
      expect(height).toBeLessThanOrEqual(maxExpected)
    })

    it('should handle 1000 sequential inserts with correct traversal', () => {
      const n = 1000
      const t = new TreapMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i)
      }
      const allKeys = t.keys()
      expect(allKeys.length).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(allKeys[i]).toBe(i)
      }
    })

    it('should handle bulk delete and maintain integrity', () => {
      const n = 500
      const t = new TreapMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i, i)
      }
      for (let i = 0; i < n; i += 2) {
        t.delete(i)
      }
      expect(t.size()).toBe(250)
      expect(t.isValid()).toBe(true)
      const allKeys = t.keys()
      for (const k of allKeys) {
        expect(k % 2).toBe(1)
      }
    })

    it('should handle alternating insert and delete', () => {
      const t = new TreapMap<number, number>()
      for (let i = 0; i < 200; i++) {
        t.set(i, i)
        if (i > 0 && i % 3 === 0) {
          t.delete(i - 1)
        }
      }
      expect(t.isValid()).toBe(true)
    })

    it('should handle atIndex/indexOf for large treap', () => {
      const n = 200
      const t = new TreapMap<number, number>()
      for (let i = 0; i < n; i++) {
        t.set(i * 2, i)
      }
      for (let i = 0; i < n; i++) {
        const entry = t.atIndex(i)
        expect(entry).toBeDefined()
        expect(entry!.key).toBe(i * 2)
        expect(t.indexOf(i * 2)).toBe(i)
      }
    })
  })

  describe('exports', () => {
    it('should export defaultComparator', () => {
      expect(defaultComparator(1, 2)).toBeLessThan(0)
      expect(defaultComparator(2, 1)).toBeGreaterThan(0)
      expect(defaultComparator(1, 1)).toBe(0)
    })

    it('should export types', () => {
      const entry: TreapEntry<number, string> = { key: 1, value: 'one' }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe('one')
    })
  })
})
