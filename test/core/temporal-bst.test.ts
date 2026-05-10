import { describe, it, expect, beforeEach } from 'vitest'
import { TemporalBST } from '../../src/core/temporal-bst/temporal-bst.js'
import type { TemporalEntry } from '../../src/core/temporal-bst/types.js'

describe('TemporalBST', () => {
  let tbst: TemporalBST<number, string>

  beforeEach(() => {
    tbst = new TemporalBST<number, string>()
  })

  describe('constructor', () => {
    it('should create empty temporal BST', () => {
      const t = new TemporalBST<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should create with initial entries', () => {
      const t = new TemporalBST<number, string>({
        entries: [
          [5, 'five', 100],
          [3, 'three', 200],
          [7, 'seven', 300],
        ],
      })
      expect(t.size()).toBe(3)
      expect(t.get(5)).toBe('five')
      expect(t.get(3)).toBe('three')
      expect(t.get(7)).toBe('seven')
    })

    it('should create with custom comparator', () => {
      const t = new TemporalBST<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      t.insert('Hello', 1, 100)
      t.insert('hello', 2, 200)
      expect(t.size()).toBe(1)
      expect(t.get('Hello')).toBe(2)
    })

    it('should handle empty options object', () => {
      const t = new TemporalBST<number, string>({})
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should handle same key with different timestamps in entries', () => {
      const t = new TemporalBST<number, string>({
        entries: [
          [1, 'a', 100],
          [1, 'b', 200],
        ],
      })
      expect(t.size()).toBe(1)
      expect(t.get(1)).toBe('b')
      expect(t.get(1, 100)).toBe('a')
    })

    it('should handle same key same timestamp in entries (last wins)', () => {
      const t = new TemporalBST<number, string>({
        entries: [
          [1, 'a', 100],
          [1, 'b', 100],
        ],
      })
      expect(t.size()).toBe(1)
      expect(t.get(1)).toBe('b')
    })

    it('should handle no options argument', () => {
      const t = new TemporalBST<number, string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should maintain sorted order with initial entries', () => {
      const t = new TemporalBST<number, string>({
        entries: [
          [5, 'five', 100],
          [2, 'two', 200],
          [8, 'eight', 300],
          [1, 'one', 400],
          [3, 'three', 500],
        ],
      })
      expect(t.keys()).toEqual([1, 2, 3, 5, 8])
    })
  })

  describe('insert/get', () => {
    it('should insert and get single entry', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.get(1)).toBe('one')
    })

    it('should insert and get multiple entries', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(2, 'two', 200)
      tbst.insert(3, 'three', 300)
      expect(tbst.get(1)).toBe('one')
      expect(tbst.get(2)).toBe('two')
      expect(tbst.get(3)).toBe('three')
    })

    it('should return latest value when no timestamp given', () => {
      tbst.insert(1, 'old', 100)
      tbst.insert(1, 'mid', 200)
      tbst.insert(1, 'new', 300)
      expect(tbst.get(1)).toBe('new')
    })

    it('should return exact value with timestamp', () => {
      tbst.insert(1, 'old', 100)
      tbst.insert(1, 'new', 200)
      expect(tbst.get(1, 100)).toBe('old')
      expect(tbst.get(1, 200)).toBe('new')
    })

    it('should return undefined for non-existent timestamp', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.get(1, 999)).toBeUndefined()
    })

    it('should return undefined for non-existent key', () => {
      expect(tbst.get(99)).toBeUndefined()
    })

    it('should handle multiple timestamps for same key', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(1, 'v3', 300)
      expect(tbst.get(1, 100)).toBe('v1')
      expect(tbst.get(1, 200)).toBe('v2')
      expect(tbst.get(1, 300)).toBe('v3')
    })

    it('should overwrite at same timestamp', () => {
      tbst.insert(1, 'original', 100)
      tbst.insert(1, 'overwritten', 100)
      expect(tbst.get(1)).toBe('overwritten')
      expect(tbst.get(1, 100)).toBe('overwritten')
    })

    it('should handle string keys', () => {
      const strTree = new TemporalBST<string, number>()
      strTree.insert('banana', 2, 100)
      strTree.insert('apple', 1, 200)
      strTree.insert('cherry', 3, 300)
      expect(strTree.get('banana')).toBe(2)
      expect(strTree.get('apple')).toBe(1)
      expect(strTree.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle object values', () => {
      const objTree = new TemporalBST<number, { name: string }>()
      objTree.insert(1, { name: 'test' }, 100)
      expect(objTree.get(1)?.name).toBe('test')
    })

    it('should return undefined for get on empty tree', () => {
      expect(tbst.get(1)).toBeUndefined()
    })

    it('should maintain sorted order across inserts', () => {
      for (let i = 10; i >= 1; i--) {
        tbst.insert(i, `val-${i}`, i * 10)
      }
      expect(tbst.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('getAt', () => {
    it('should return exact match when timestamp matches', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(1, 'v3', 300)
      expect(tbst.getAt(1, 200)).toBe('v2')
    })

    it('should return most recent before timestamp', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(1, 'v3', 300)
      expect(tbst.getAt(1, 250)).toBe('v2')
    })

    it('should return undefined when no entry before timestamp', () => {
      tbst.insert(1, 'v1', 200)
      expect(tbst.getAt(1, 100)).toBeUndefined()
    })

    it('should return undefined for non-existent key', () => {
      expect(tbst.getAt(99, 100)).toBeUndefined()
    })

    it('should work with multiple timestamps', () => {
      tbst.insert(1, 'a', 100)
      tbst.insert(1, 'b', 300)
      tbst.insert(1, 'c', 500)
      expect(tbst.getAt(1, 100)).toBe('a')
      expect(tbst.getAt(1, 200)).toBe('a')
      expect(tbst.getAt(1, 300)).toBe('b')
      expect(tbst.getAt(1, 400)).toBe('b')
      expect(tbst.getAt(1, 500)).toBe('c')
      expect(tbst.getAt(1, 600)).toBe('c')
    })

    it('should handle timestamp equal to earliest entry', () => {
      tbst.insert(1, 'earliest', 100)
      tbst.insert(1, 'latest', 200)
      expect(tbst.getAt(1, 100)).toBe('earliest')
    })

    it('should handle timestamp between two entries', () => {
      tbst.insert(1, 'low', 100)
      tbst.insert(1, 'high', 300)
      expect(tbst.getAt(1, 200)).toBe('low')
    })

    it('should handle timestamp equal to latest entry', () => {
      tbst.insert(1, 'low', 100)
      tbst.insert(1, 'high', 300)
      expect(tbst.getAt(1, 300)).toBe('high')
    })

    it('should handle timestamp before all entries', () => {
      tbst.insert(1, 'v', 100)
      expect(tbst.getAt(1, 50)).toBeUndefined()
    })

    it('should handle timestamp after all entries', () => {
      tbst.insert(1, 'v', 100)
      expect(tbst.getAt(1, 200)).toBe('v')
    })
  })

  describe('getHistory', () => {
    it('should return empty for non-existent key', () => {
      expect(tbst.getHistory(99)).toEqual([])
    })

    it('should return single entry', () => {
      tbst.insert(1, 'one', 100)
      const history = tbst.getHistory(1)
      expect(history).toEqual([{ timestamp: 100, value: 'one' }])
    })

    it('should return entries sorted by timestamp', () => {
      tbst.insert(1, 'c', 300)
      tbst.insert(1, 'a', 100)
      tbst.insert(1, 'b', 200)
      const history = tbst.getHistory(1)
      expect(history).toEqual([
        { timestamp: 100, value: 'a' },
        { timestamp: 200, value: 'b' },
        { timestamp: 300, value: 'c' },
      ])
    })

    it('should return all entries for key', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(1, 'v3', 300)
      expect(tbst.getHistory(1).length).toBe(3)
    })

    it('should reflect overwrites at same timestamp', () => {
      tbst.insert(1, 'original', 100)
      tbst.insert(1, 'overwritten', 100)
      const history = tbst.getHistory(1)
      expect(history).toEqual([{ timestamp: 100, value: 'overwritten' }])
    })

    it('should preserve history across different timestamps', () => {
      tbst.insert(1, 'a', 100)
      tbst.insert(1, 'b', 200)
      tbst.insert(1, 'c', 300)
      const history = tbst.getHistory(1)
      const values: string[] = []
      for (const entry of history) {
        values.push(entry.value)
      }
      expect(values).toEqual(['a', 'b', 'c'])
    })

    it('should not affect other keys', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(2, 'two', 200)
      expect(tbst.getHistory(1).length).toBe(1)
      expect(tbst.getHistory(2).length).toBe(1)
    })

    it('should return entries typed as TemporalEntry', () => {
      tbst.insert(1, 'v', 100)
      const entries: TemporalEntry<string>[] = tbst.getHistory(1)
      expect(entries[0]!.timestamp).toBe(100)
      expect(entries[0]!.value).toBe('v')
    })
  })

  describe('remove', () => {
    it('should remove existing key', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.remove(1)).toBe(true)
      expect(tbst.get(1)).toBeUndefined()
      expect(tbst.size()).toBe(0)
    })

    it('should return true for existing key', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.remove(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(tbst.remove(99)).toBe(false)
    })

    it('should remove from tree with multiple keys', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(2, 'two', 200)
      tbst.insert(3, 'three', 300)
      expect(tbst.remove(2)).toBe(true)
      expect(tbst.size()).toBe(2)
      expect(tbst.get(2)).toBeUndefined()
    })

    it('should maintain sorted order after removal', () => {
      tbst.insert(5, 'five', 100)
      tbst.insert(3, 'three', 200)
      tbst.insert(7, 'seven', 300)
      tbst.insert(1, 'one', 400)
      tbst.insert(9, 'nine', 500)
      tbst.remove(5)
      expect(tbst.keys()).toEqual([1, 3, 7, 9])
    })

    it('should handle removing root with two children', () => {
      tbst.insert(5, 'five', 100)
      tbst.insert(3, 'three', 200)
      tbst.insert(7, 'seven', 300)
      tbst.remove(5)
      expect(tbst.size()).toBe(2)
      expect(tbst.get(5)).toBeUndefined()
      expect(tbst.keys()).toEqual([3, 7])
    })

    it('should handle removing all keys', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(2, 'two', 200)
      tbst.remove(1)
      tbst.remove(2)
      expect(tbst.size()).toBe(0)
      expect(tbst.isEmpty()).toBe(true)
    })

    it('should remove timeline along with key', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(1, 'v3', 300)
      tbst.remove(1)
      expect(tbst.getHistory(1)).toEqual([])
    })

    it('should handle removing leaf node', () => {
      tbst.insert(2, 'two', 100)
      tbst.insert(1, 'one', 200)
      tbst.insert(3, 'three', 300)
      tbst.remove(1)
      expect(tbst.keys()).toEqual([2, 3])
    })

    it('should handle removing node with one child', () => {
      tbst.insert(5, 'five', 100)
      tbst.insert(3, 'three', 200)
      tbst.insert(7, 'seven', 300)
      tbst.insert(6, 'six', 400)
      tbst.remove(7)
      expect(tbst.keys()).toEqual([3, 5, 6])
    })

    it('should handle removing from empty tree', () => {
      expect(tbst.remove(1)).toBe(false)
    })

    it('should handle removing non-existent key from populated tree', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.remove(99)).toBe(false)
      expect(tbst.size()).toBe(1)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.has(1)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(tbst.has(99)).toBe(false)
    })

    it('should return false after removal', () => {
      tbst.insert(1, 'one', 100)
      tbst.remove(1)
      expect(tbst.has(1)).toBe(false)
    })

    it('should return false on empty tree', () => {
      expect(tbst.has(1)).toBe(false)
    })

    it('should return true for key with multiple timestamps', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      expect(tbst.has(1)).toBe(true)
    })
  })

  describe('size/isEmpty', () => {
    it('should return 0 for empty tree', () => {
      expect(tbst.size()).toBe(0)
    })

    it('should increase with new keys', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.size()).toBe(1)
      tbst.insert(2, 'two', 200)
      expect(tbst.size()).toBe(2)
    })

    it('should not change when adding timestamp to existing key', () => {
      tbst.insert(1, 'v1', 100)
      expect(tbst.size()).toBe(1)
      tbst.insert(1, 'v2', 200)
      expect(tbst.size()).toBe(1)
    })

    it('should decrease on removal', () => {
      tbst.insert(1, 'one', 100)
      tbst.remove(1)
      expect(tbst.size()).toBe(0)
    })

    it('should reflect isEmpty correctly', () => {
      expect(tbst.isEmpty()).toBe(true)
      tbst.insert(1, 'one', 100)
      expect(tbst.isEmpty()).toBe(false)
      tbst.remove(1)
      expect(tbst.isEmpty()).toBe(true)
    })

    it('should not be empty with single key', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(2, 'two', 200)
      tbst.insert(3, 'three', 300)
      tbst.clear()
      expect(tbst.size()).toBe(0)
      expect(tbst.isEmpty()).toBe(true)
      expect(tbst.get(1)).toBeUndefined()
    })

    it('should clear empty tree', () => {
      tbst.clear()
      expect(tbst.size()).toBe(0)
      expect(tbst.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      tbst.insert(1, 'one', 100)
      tbst.clear()
      tbst.insert(2, 'two', 200)
      expect(tbst.size()).toBe(1)
      expect(tbst.get(2)).toBe('two')
    })

    it('should reset historical size', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(2, 'v3', 300)
      tbst.clear()
      expect(tbst.historicalSize()).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty for empty tree', () => {
      expect(tbst.keys()).toEqual([])
    })

    it('should return keys in sorted order', () => {
      tbst.insert(3, 'three', 100)
      tbst.insert(1, 'one', 200)
      tbst.insert(2, 'two', 300)
      expect(tbst.keys()).toEqual([1, 2, 3])
    })

    it('should return correct keys after operations', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(2, 'two', 200)
      tbst.insert(3, 'three', 300)
      tbst.remove(2)
      expect(tbst.keys()).toEqual([1, 3])
    })

    it('should handle single key', () => {
      tbst.insert(5, 'five', 100)
      expect(tbst.keys()).toEqual([5])
    })
  })

  describe('minKey/maxKey', () => {
    it('should return undefined for empty tree', () => {
      expect(tbst.minKey()).toBeUndefined()
      expect(tbst.maxKey()).toBeUndefined()
    })

    it('should return min and max keys', () => {
      tbst.insert(5, 'five', 100)
      tbst.insert(3, 'three', 200)
      tbst.insert(7, 'seven', 300)
      expect(tbst.minKey()).toBe(3)
      expect(tbst.maxKey()).toBe(7)
    })

    it('should return same key for single element', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.minKey()).toBe(1)
      expect(tbst.maxKey()).toBe(1)
    })

    it('should update after removal', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(5, 'five', 200)
      tbst.insert(10, 'ten', 300)
      tbst.remove(1)
      expect(tbst.minKey()).toBe(5)
      tbst.remove(10)
      expect(tbst.maxKey()).toBe(5)
    })

    it('should handle left-skewed tree', () => {
      tbst.insert(5, 'five', 100)
      tbst.insert(4, 'four', 200)
      tbst.insert(3, 'three', 300)
      tbst.insert(2, 'two', 400)
      tbst.insert(1, 'one', 500)
      expect(tbst.minKey()).toBe(1)
      expect(tbst.maxKey()).toBe(5)
    })

    it('should handle right-skewed tree', () => {
      tbst.insert(1, 'one', 100)
      tbst.insert(2, 'two', 200)
      tbst.insert(3, 'three', 300)
      tbst.insert(4, 'four', 400)
      tbst.insert(5, 'five', 500)
      expect(tbst.minKey()).toBe(1)
      expect(tbst.maxKey()).toBe(5)
    })

    it('should work with string keys', () => {
      const strTree = new TemporalBST<string, number>()
      strTree.insert('cherry', 3, 100)
      strTree.insert('apple', 1, 200)
      strTree.insert('banana', 2, 300)
      expect(strTree.minKey()).toBe('apple')
      expect(strTree.maxKey()).toBe('cherry')
    })
  })

  describe('rangeQuery', () => {
    beforeEach(() => {
      tbst.insert(1, 'one', 100)
      tbst.insert(3, 'three', 100)
      tbst.insert(5, 'five', 100)
      tbst.insert(7, 'seven', 100)
      tbst.insert(9, 'nine', 100)
    })

    it('should return entries in range', () => {
      const result = tbst.rangeQuery(3, 7)
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 5, value: 'five' },
        { key: 7, value: 'seven' },
      ])
    })

    it('should return single entry for equal bounds', () => {
      const result = tbst.rangeQuery(5, 5)
      expect(result).toEqual([{ key: 5, value: 'five' }])
    })

    it('should return empty for invalid range', () => {
      expect(tbst.rangeQuery(7, 3)).toEqual([])
    })

    it('should return empty when no keys in range', () => {
      expect(tbst.rangeQuery(10, 20)).toEqual([])
    })

    it('should return all for full range', () => {
      const result = tbst.rangeQuery(1, 9)
      expect(result.length).toBe(5)
    })

    it('should return empty for empty tree', () => {
      const empty = new TemporalBST<number, string>()
      expect(empty.rangeQuery(1, 5)).toEqual([])
    })

    it('should return latest values for each key', () => {
      tbst.insert(3, 'three-v2', 200)
      tbst.insert(7, 'seven-v2', 200)
      const result = tbst.rangeQuery(3, 7)
      expect(result).toEqual([
        { key: 3, value: 'three-v2' },
        { key: 5, value: 'five' },
        { key: 7, value: 'seven-v2' },
      ])
    })

    it('should handle partial overlap at start', () => {
      const result = tbst.rangeQuery(0, 3)
      expect(result).toEqual([{ key: 1, value: 'one' }, { key: 3, value: 'three' }])
    })

    it('should handle partial overlap at end', () => {
      const result = tbst.rangeQuery(7, 15)
      expect(result).toEqual([{ key: 7, value: 'seven' }, { key: 9, value: 'nine' }])
    })

    it('should handle non-existent boundary keys', () => {
      const result = tbst.rangeQuery(2, 8)
      expect(result).toEqual([
        { key: 3, value: 'three' },
        { key: 5, value: 'five' },
        { key: 7, value: 'seven' },
      ])
    })
  })

  describe('getAtTime', () => {
    beforeEach(() => {
      tbst.insert(1, 'one-v1', 100)
      tbst.insert(1, 'one-v2', 300)
      tbst.insert(2, 'two-v1', 150)
      tbst.insert(2, 'two-v2', 250)
      tbst.insert(3, 'three-v1', 200)
    })

    it('should return empty for empty tree', () => {
      const empty = new TemporalBST<number, string>()
      expect(empty.getAtTime(100)).toEqual([])
    })

    it('should return all entries at given time', () => {
      const result = tbst.getAtTime(200)
      expect(result.length).toBe(3)
    })

    it('should return entries sorted by key', () => {
      const result = tbst.getAtTime(200)
      expect(result.map((e) => e.key)).toEqual([1, 2, 3])
    })

    it('should return most recent value per key', () => {
      const result = tbst.getAtTime(250)
      const entry1 = result.find((e) => e.key === 1)
      const entry2 = result.find((e) => e.key === 2)
      expect(entry1?.value).toBe('one-v1')
      expect(entry2?.value).toBe('two-v2')
    })

    it('should exclude keys with no entry at or before time', () => {
      const result = tbst.getAtTime(50)
      expect(result).toEqual([])
    })

    it('should handle time before any entries', () => {
      expect(tbst.getAtTime(0)).toEqual([])
    })

    it('should handle time after all entries', () => {
      const result = tbst.getAtTime(1000)
      expect(result.length).toBe(3)
    })

    it('should handle exact timestamp match', () => {
      const result = tbst.getAtTime(100)
      expect(result).toEqual([{ key: 1, value: 'one-v1' }])
    })

    it('should handle time between snapshots', () => {
      const result = tbst.getAtTime(175)
      expect(result).toEqual([
        { key: 1, value: 'one-v1' },
        { key: 2, value: 'two-v1' },
      ])
    })

    it('should handle multiple keys with different timelines', () => {
      tbst.insert(1, 'one-v3', 500)
      const result = tbst.getAtTime(400)
      const entry1 = result.find((e) => e.key === 1)
      expect(entry1?.value).toBe('one-v2')
    })
  })

  describe('currentSize/historicalSize', () => {
    it('currentSize equals number of keys', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(2, 'v2', 200)
      tbst.insert(3, 'v3', 300)
      expect(tbst.currentSize()).toBe(3)
    })

    it('historicalSize equals total timestamp entries', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(2, 'v3', 300)
      expect(tbst.historicalSize()).toBe(3)
    })

    it('currentSize increases with new keys only', () => {
      tbst.insert(1, 'v1', 100)
      expect(tbst.currentSize()).toBe(1)
      tbst.insert(1, 'v2', 200)
      expect(tbst.currentSize()).toBe(1)
      tbst.insert(2, 'v3', 300)
      expect(tbst.currentSize()).toBe(2)
    })

    it('historicalSize increases with each new timestamp', () => {
      tbst.insert(1, 'v1', 100)
      expect(tbst.historicalSize()).toBe(1)
      tbst.insert(1, 'v2', 200)
      expect(tbst.historicalSize()).toBe(2)
      tbst.insert(2, 'v3', 300)
      expect(tbst.historicalSize()).toBe(3)
    })

    it('currentSize decreases on remove', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(2, 'v2', 200)
      tbst.remove(1)
      expect(tbst.currentSize()).toBe(1)
    })

    it('historicalSize decreases by timeline size on remove', () => {
      tbst.insert(1, 'v1', 100)
      tbst.insert(1, 'v2', 200)
      tbst.insert(1, 'v3', 300)
      expect(tbst.historicalSize()).toBe(3)
      tbst.remove(1)
      expect(tbst.historicalSize()).toBe(0)
    })

    it('overwriting same timestamp does not increase historicalSize', () => {
      tbst.insert(1, 'v1', 100)
      expect(tbst.historicalSize()).toBe(1)
      tbst.insert(1, 'v2', 100)
      expect(tbst.historicalSize()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      tbst.insert(1, 'one', 100)
      expect(tbst.size()).toBe(1)
      expect(tbst.isEmpty()).toBe(false)
      expect(tbst.minKey()).toBe(1)
      expect(tbst.maxKey()).toBe(1)
      expect(tbst.get(1)).toBe('one')
      expect(tbst.getAt(1, 100)).toBe('one')
      expect(tbst.getAt(1, 50)).toBeUndefined()
      expect(tbst.getHistory(1).length).toBe(1)
      expect(tbst.remove(1)).toBe(true)
      expect(tbst.isEmpty()).toBe(true)
    })

    it('should handle two elements', () => {
      tbst.insert(2, 'two', 100)
      tbst.insert(1, 'one', 200)
      expect(tbst.keys()).toEqual([1, 2])
      expect(tbst.minKey()).toBe(1)
      expect(tbst.maxKey()).toBe(2)
    })

    it('should handle negative timestamps', () => {
      tbst.insert(1, 'negative', -100)
      tbst.insert(1, 'positive', 100)
      expect(tbst.getAt(1, -50)).toBe('negative')
      expect(tbst.getAt(1, 150)).toBe('positive')
      expect(tbst.getAt(1, 50)).toBe('negative')
    })

    it('should handle zero timestamp', () => {
      tbst.insert(1, 'zero', 0)
      expect(tbst.get(1, 0)).toBe('zero')
      expect(tbst.getAt(1, 0)).toBe('zero')
    })

    it('should handle very large timestamps', () => {
      const bigTs = Number.MAX_SAFE_INTEGER
      tbst.insert(1, 'big', bigTs)
      expect(tbst.get(1)).toBe('big')
      expect(tbst.getAt(1, bigTs)).toBe('big')
    })

    it('should handle float timestamps', () => {
      tbst.insert(1, 'float1', 100.5)
      tbst.insert(1, 'float2', 200.7)
      expect(tbst.getAt(1, 150)).toBe('float1')
      expect(tbst.getAt(1, 200.7)).toBe('float2')
    })

    it('should handle random insert pattern', () => {
      const keys = [5, 2, 8, 1, 3, 7, 9, 4, 6]
      for (const k of keys) {
        tbst.insert(k, `val-${k}`, k * 10)
      }
      expect(tbst.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should handle single key with many timestamps', () => {
      for (let i = 0; i < 50; i++) {
        tbst.insert(1, `v${i}`, i * 10)
      }
      expect(tbst.size()).toBe(1)
      expect(tbst.historicalSize()).toBe(50)
      expect(tbst.get(1)).toBe('v49')
      expect(tbst.getAt(1, 250)).toBe('v25')
      expect(tbst.getHistory(1).length).toBe(50)
    })
  })

  describe('stress', () => {
    it('should handle 1000 sequential inserts', () => {
      const n = 1000
      const t = new TemporalBST<number, number>()
      for (let i = 0; i < n; i++) {
        t.insert(i, i * 10, i * 100)
      }
      expect(t.size()).toBe(n)
      const allKeys = t.keys()
      expect(allKeys.length).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(allKeys[i]).toBe(i)
        expect(t.get(i)).toBe(i * 10)
      }
    })

    it('should handle 1000 random inserts', () => {
      const n = 1000
      const t = new TemporalBST<number, number>()
      const keyArr = Array.from({ length: n }, (_, i) => i)
      for (let i = keyArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = keyArr[i]!
        keyArr[i] = keyArr[j]!
        keyArr[j] = tmp
      }
      for (const k of keyArr) {
        t.insert(k, k, k * 10)
      }
      expect(t.size()).toBe(n)
      const allKeys = t.keys()
      for (let i = 0; i < n; i++) {
        expect(allKeys[i]).toBe(i)
      }
    })

    it('should handle bulk delete and maintain order', () => {
      const n = 500
      const t = new TemporalBST<number, number>()
      for (let i = 0; i < n; i++) {
        t.insert(i, i, i * 10)
      }
      for (let i = 0; i < n; i += 2) {
        t.remove(i)
      }
      expect(t.size()).toBe(250)
      const allKeys = t.keys()
      for (const k of allKeys) {
        expect(k % 2).toBe(1)
      }
    })

    it('should handle many timestamps per key', () => {
      const n = 200
      for (let i = 0; i < n; i++) {
        tbst.insert(1, `v${i}`, i)
      }
      expect(tbst.size()).toBe(1)
      expect(tbst.historicalSize()).toBe(n)
      expect(tbst.get(1)).toBe(`v${n - 1}`)
      expect(tbst.getAt(1, 100)).toBe('v100')
      expect(tbst.getHistory(1).length).toBe(n)
    })

    it('should handle range query on large tree', () => {
      const n = 200
      for (let i = 0; i < n; i++) {
        tbst.insert(i, `val-${i}`, 100)
      }
      const result = tbst.rangeQuery(50, 60)
      expect(result.length).toBe(11)
      expect(result[0]!.key).toBe(50)
      expect(result[10]!.key).toBe(60)
    })

    it('should handle getAtTime on large tree', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        tbst.insert(i, `v1-${i}`, 100)
        tbst.insert(i, `v2-${i}`, 200)
      }
      const result = tbst.getAtTime(150)
      expect(result.length).toBe(n)
      for (const entry of result) {
        expect(entry.value).toBe(`v1-${entry.key}`)
      }
    })

    it('should delete all elements one by one', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        tbst.insert(i, `val-${i}`, i * 10)
      }
      for (let i = 0; i < n; i++) {
        expect(tbst.remove(i)).toBe(true)
      }
      expect(tbst.size()).toBe(0)
      expect(tbst.isEmpty()).toBe(true)
      expect(tbst.historicalSize()).toBe(0)
    })

    it('should delete all elements in reverse order', () => {
      const n = 100
      for (let i = 0; i < n; i++) {
        tbst.insert(i, `val-${i}`, i * 10)
      }
      for (let i = n - 1; i >= 0; i--) {
        expect(tbst.remove(i)).toBe(true)
      }
      expect(tbst.size()).toBe(0)
      expect(tbst.isEmpty()).toBe(true)
    })

    it('should handle alternating insert and delete', () => {
      const t = new TemporalBST<number, string>()
      for (let i = 0; i < 200; i++) {
        t.insert(i, `val-${i}`, i * 10)
        if (i > 0 && i % 3 === 0) {
          t.remove(i - 1)
        }
      }
      expect(t.size()).toBeGreaterThan(0)
    })

    it('should handle minKey/maxKey on large tree', () => {
      const n = 200
      for (let i = 0; i < n; i++) {
        tbst.insert(i, `val-${i}`, i * 10)
      }
      expect(tbst.minKey()).toBe(0)
      expect(tbst.maxKey()).toBe(n - 1)
      tbst.remove(0)
      expect(tbst.minKey()).toBe(1)
      tbst.remove(n - 1)
      expect(tbst.maxKey()).toBe(n - 2)
    })

    it('should handle historical tracking across operations', () => {
      const t = new TemporalBST<number, string>()
      for (let i = 0; i < 50; i++) {
        t.insert(i, `v1`, 100)
        t.insert(i, `v2`, 200)
        t.insert(i, `v3`, 300)
      }
      expect(t.size()).toBe(50)
      expect(t.historicalSize()).toBe(150)
      t.remove(25)
      expect(t.size()).toBe(49)
      expect(t.historicalSize()).toBe(147)
      t.clear()
      expect(t.historicalSize()).toBe(0)
    })
  })

  describe('exports', () => {
    it('should export TemporalEntry type', () => {
      const entry: TemporalEntry<string> = { timestamp: 100, value: 'test' }
      expect(entry.timestamp).toBe(100)
      expect(entry.value).toBe('test')
    })
  })
})
