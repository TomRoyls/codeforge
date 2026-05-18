import { BSTMap } from '../src/core/bst-map/bst-map.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BSTMap', () => {
  describe('constructor', () => {
    it('creates an empty map with default comparator', () => {
      const map = new BSTMap<number, string>()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates an empty map with custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const map = new BSTMap<number, string>({ comparator: reverseCmp })
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([2, 1])
    })

    it('creates a map with initial entries', () => {
      const map = new BSTMap<number, string>({
        entries: [
          [3, 'c'],
          [1, 'a'],
          [2, 'b'],
        ],
      })
      expect(map.size()).toBe(3)
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })

    it('creates an empty map from empty entries array', () => {
      const map = new BSTMap<number, string>({ entries: [] })
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('preserves last value for duplicate keys in entries', () => {
      const map = new BSTMap<number, string>({
        entries: [
          [1, 'first'],
          [1, 'second'],
        ],
      })
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('second')
    })

    it('creates a map with both comparator and entries', () => {
      const map = new BSTMap<number, string>({
        comparator: (a, b) => b - a,
        entries: [
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ],
      })
      expect(map.keys()).toEqual([3, 2, 1])
    })

    it('accepts a comparator that compares strings', () => {
      const map = new BSTMap<string, number>()
      map.set('banana', 2)
      map.set('apple', 1)
      map.set('cherry', 3)
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── set / get ──────────────────────────────────────────────────────

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'hello')
      expect(map.get(1)).toBe('hello')
    })

    it('returns undefined for missing key', () => {
      const map = new BSTMap<number, string>()
      expect(map.get(999)).toBeUndefined()
    })

    it('returns undefined for get on empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.get(1)).toBeUndefined()
    })

    it('overwrites existing key with new value', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.get(1)).toBe('new')
      expect(map.size()).toBe(1)
    })

    it('sets multiple keys maintaining sorted order', () => {
      const map = new BSTMap<number, string>()
      map.set(5, 'e')
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(4, 'd')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3, 4, 5])
      expect(map.values()).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('handles string keys in sorted order', () => {
      const map = new BSTMap<string, number>()
      map.set('cherry', 3)
      map.set('apple', 1)
      map.set('banana', 2)
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles object values', () => {
      const map = new BSTMap<number, { name: string }>()
      map.set(1, { name: 'Alice' })
      map.set(2, { name: 'Bob' })
      expect(map.get(1)).toEqual({ name: 'Alice' })
      expect(map.get(2)).toEqual({ name: 'Bob' })
    })

    it('handles null and undefined values', () => {
      const map = new BSTMap<number, string | null | undefined>()
      map.set(1, null)
      map.set(2, undefined)
      expect(map.get(1)).toBeNull()
      expect(map.get(2)).toBeUndefined()
    })
  })

  // ─── insert alias ────────────────────────────────────────────────────

  describe('insert', () => {
    it('insert is an alias for set', () => {
      const map = new BSTMap<number, string>()
      map.insert(1, 'a')
      map.insert(2, 'b')
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.size()).toBe(2)
    })

    it('insert overwrites existing key', () => {
      const map = new BSTMap<number, string>()
      map.insert(1, 'first')
      map.insert(1, 'second')
      expect(map.get(1)).toBe('second')
      expect(map.size()).toBe(1)
    })
  })

  // ─── has / contains ─────────────────────────────────────────────────

  describe('has and contains', () => {
    it('has returns true for existing key', () => {
      const map = new BSTMap<number, string>()
      map.set(42, 'answer')
      expect(map.has(42)).toBe(true)
    })

    it('has returns false for missing key', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      expect(map.has(999)).toBe(false)
    })

    it('has returns false on empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('has returns false after key is deleted', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('contains is an alias for has', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      expect(map.contains(1)).toBe(true)
      expect(map.contains(2)).toBe(false)
    })
  })

  // ─── delete ─────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      expect(map.delete(1)).toBe(true)
      expect(map.get(1)).toBeUndefined()
      expect(map.size()).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new BSTMap<number, string>()
      expect(map.delete(999)).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.delete(1)).toBe(false)
    })

    it('maintains order after deletion', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.keys()).toEqual([1, 3])
      expect(map.values()).toEqual(['a', 'c'])
    })

    it('can delete min key', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      expect(map.keys()).toEqual([2, 3])
      expect(map.getMin()).toEqual({ key: 2, value: 'b' })
    })

    it('can delete max key', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(3)
      expect(map.keys()).toEqual([1, 2])
      expect(map.getMax()).toEqual({ key: 2, value: 'b' })
    })

    it('can delete all entries one by one', () => {
      const map = new BSTMap<number, string>()
      for (let i = 1; i <= 5; i++) map.set(i, `v${i}`)
      for (let i = 1; i <= 5; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles delete with two children (successor replacement)', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(4, 'd')
      map.set(6, 'f')
      map.delete(3)
      expect(map.size()).toBe(4)
      expect(map.has(3)).toBe(false)
      expect(map.keys()).toEqual([1, 4, 5, 6])
    })

    it('deleting a leaf node', () => {
      const map = new BSTMap<number, string>()
      map.set(2, 'root')
      map.set(1, 'left')
      map.set(3, 'right')
      map.delete(1)
      expect(map.size()).toBe(2)
      expect(map.keys()).toEqual([2, 3])
    })

    it('deleting a node with only left child', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'root')
      map.set(1, 'left')
      map.set(2, 'left-right')
      map.delete(3)
      expect(map.has(3)).toBe(false)
      expect(map.size()).toBe(2)
      expect(map.keys()).toEqual([1, 2])
    })

    it('deleting a node with only right child', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'root')
      map.set(2, 'right')
      map.set(3, 'right-right')
      map.delete(1)
      expect(map.has(1)).toBe(false)
      expect(map.size()).toBe(2)
      expect(map.keys()).toEqual([2, 3])
    })
  })

  // ─── size / isEmpty / clear ─────────────────────────────────────────

  describe('size, isEmpty, clear', () => {
    it('size is 0 for empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.size()).toBe(0)
    })

    it('isEmpty returns true for empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.isEmpty()).toBe(true)
    })

    it('size increments on set', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      expect(map.size()).toBe(1)
      map.set(2, 'b')
      expect(map.size()).toBe(2)
    })

    it('size does not increment on overwrite', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size()).toBe(1)
    })

    it('size decrements on delete', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size()).toBe(1)
    })

    it('clear removes all entries', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.get(1)).toBeUndefined()
      expect(map.keys()).toEqual([])
    })

    it('clear on empty map is a no-op', () => {
      const map = new BSTMap<number, string>()
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('map is usable after clear', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size()).toBe(1)
      expect(map.get(2)).toBe('b')
    })
  })

  // ─── getMin / getMax ──────────────────────────────────────────────

  describe('getMin and getMax', () => {
    it('getMin returns undefined on empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.getMin()).toBeUndefined()
    })

    it('getMax returns undefined on empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.getMax()).toBeUndefined()
    })

    it('getMin and getMax return the same entry for single entry', () => {
      const map = new BSTMap<number, string>()
      map.set(42, 'answer')
      expect(map.getMin()).toEqual({ key: 42, value: 'answer' })
      expect(map.getMax()).toEqual({ key: 42, value: 'answer' })
    })

    it('getMin returns smallest key entry', () => {
      const map = new BSTMap<number, string>()
      map.set(5, 'e')
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.getMin()).toEqual({ key: 1, value: 'a' })
    })

    it('getMax returns largest key entry', () => {
      const map = new BSTMap<number, string>()
      map.set(5, 'e')
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.getMax()).toEqual({ key: 5, value: 'e' })
    })

    it('getMin and getMax update after deletion', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      expect(map.getMin()).toEqual({ key: 2, value: 'b' })
      map.delete(3)
      expect(map.getMax()).toEqual({ key: 2, value: 'b' })
    })

    it('getMin and getMax work with string keys', () => {
      const map = new BSTMap<string, number>()
      map.set('cherry', 3)
      map.set('apple', 1)
      map.set('banana', 2)
      expect(map.getMin()).toEqual({ key: 'apple', value: 1 })
      expect(map.getMax()).toEqual({ key: 'cherry', value: 3 })
    })
  })

  // ─── predecessor / successor ─────────────────────────────────────────

  describe('predecessor and successor', () => {
    it('predecessor returns the largest key less than the given key', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.predecessor(20)).toEqual({ key: 10, value: 'a' })
    })

    it('predecessor returns undefined if no smaller key exists', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      expect(map.predecessor(5)).toBeUndefined()
    })

    it('predecessor returns undefined on empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.predecessor(1)).toBeUndefined()
    })

    it('predecessor returns greatest key less than exact match', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.predecessor(30)).toEqual({ key: 20, value: 'b' })
    })

    it('successor returns the smallest key greater than the given key', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.successor(20)).toEqual({ key: 30, value: 'c' })
    })

    it('successor returns undefined if no larger key exists', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      expect(map.successor(25)).toBeUndefined()
    })

    it('successor returns undefined on empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.successor(1)).toBeUndefined()
    })

    it('successor returns smallest key greater than exact match', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.successor(10)).toEqual({ key: 20, value: 'b' })
    })

    it('predecessor and successor work with non-present search key', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(30, 'c')
      expect(map.predecessor(20)).toEqual({ key: 10, value: 'a' })
      expect(map.successor(20)).toEqual({ key: 30, value: 'c' })
    })
  })

  // ─── range ──────────────────────────────────────────────────────────

  describe('range', () => {
    it('returns entries within range inclusive', () => {
      const map = new BSTMap<number, string>()
      for (let i = 1; i <= 10; i++) map.set(i, `v${i}`)
      expect(map.range(3, 7)).toEqual([
        { key: 3, value: 'v3' },
        { key: 4, value: 'v4' },
        { key: 5, value: 'v5' },
        { key: 6, value: 'v6' },
        { key: 7, value: 'v7' },
      ])
    })

    it('returns single entry when start equals end', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.range(2, 2)).toEqual([{ key: 2, value: 'b' }])
    })

    it('returns empty array when start > end', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.range(5, 3)).toEqual([])
    })

    it('returns empty array for empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.range(1, 10)).toEqual([])
    })

    it('returns entries within range even if boundaries are outside map range', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(5, 'e')
      map.set(7, 'g')
      expect(map.range(0, 10)).toEqual([
        { key: 3, value: 'c' },
        { key: 5, value: 'e' },
        { key: 7, value: 'g' },
      ])
    })

    it('returns entries clipped to available range', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(5, 'e')
      map.set(7, 'g')
      expect(map.range(4, 6)).toEqual([{ key: 5, value: 'e' }])
    })

    it('returns empty when range has no matching keys', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(10, 'j')
      expect(map.range(4, 6)).toEqual([])
    })

    it('range query with string keys', () => {
      const map = new BSTMap<string, number>()
      map.set('apple', 1)
      map.set('banana', 2)
      map.set('cherry', 3)
      map.set('date', 4)
      map.set('elderberry', 5)
      const result = map.range('banana', 'date')
      expect(result).toEqual([
        { key: 'banana', value: 2 },
        { key: 'cherry', value: 3 },
        { key: 'date', value: 4 },
      ])
    })
  })

  // ─── keys / values / entries ────────────────────────────────────────

  describe('keys, values, entries', () => {
    it('keys returns empty array for empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.keys()).toEqual([])
    })

    it('values returns empty array for empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.values()).toEqual([])
    })

    it('entries returns empty array for empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.entries()).toEqual([])
    })

    it('keys returns sorted keys', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('values returns values in key order', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('entries returns key-value objects in key order', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('entries reflect overwrites', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.entries()).toEqual([{ key: 1, value: 'new' }])
    })

    it('entries reflect deletions', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.entries()).toEqual([
        { key: 1, value: 'a' },
        { key: 3, value: 'c' },
      ])
    })
  })

  // ─── toArray ─────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new BSTMap<number, string>()
      expect(map.toArray()).toEqual([])
    })

    it('returns entries as array', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
      ])
    })

    it('toArray returns same result as entries', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual(map.entries())
    })
  })

  // ─── forEach ────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries in key order with correct indices', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const results: Array<{ entry: { key: number; value: string }; index: number }> = []
      map.forEach((entry, index) => {
        results.push({ entry, index })
      })
      expect(results).toEqual([
        { entry: { key: 1, value: 'a' }, index: 0 },
        { entry: { key: 2, value: 'b' }, index: 1 },
        { entry: { key: 3, value: 'c' }, index: 2 },
      ])
    })

    it('does not call callback on empty map', () => {
      const map = new BSTMap<number, string>()
      let callCount = 0
      map.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates single entry', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'only')
      const results: string[] = []
      map.forEach((entry) => results.push(entry.value))
      expect(results).toEqual(['only'])
    })

    it('forEach callback receives correct index values', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      const indices: number[] = []
      map.forEach((_entry, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  // ─── clone ──────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      expect(cloned.entries()).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
      ])
      expect(cloned.size()).toBe(2)
    })

    it('modifications to clone do not affect original', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(2, 'b')
      expect(map.size()).toBe(1)
      expect(cloned.size()).toBe(2)
      expect(map.has(2)).toBe(false)
    })

    it('modifications to original do not affect clone', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      map.delete(1)
      expect(cloned.size()).toBe(2)
      expect(cloned.has(1)).toBe(true)
    })

    it('clones empty map', () => {
      const map = new BSTMap<number, string>()
      const cloned = map.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone preserves comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const map = new BSTMap<number, string>({ comparator: reverseCmp })
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      expect(cloned.keys()).toEqual([2, 1])
    })

    it('clone of clone works correctly', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const clone1 = map.clone()
      const clone2 = clone1.clone()
      clone2.set(3, 'c')
      expect(map.size()).toBe(2)
      expect(clone1.size()).toBe(2)
      expect(clone2.size()).toBe(3)
    })
  })

  // ─── Symbol.iterator ───────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates entries in key order', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const result = [...map]
      expect(result).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('returns no entries for empty map', () => {
      const map = new BSTMap<number, string>()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('works with for-of loop', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const keys: number[] = []
      for (const entry of map) {
        keys.push(entry.key)
      }
      expect(keys).toEqual([1, 2])
    })
  })

  // ─── getHeight ──────────────────────────────────────────────────────

  describe('getHeight', () => {
    it('returns 0 for empty tree', () => {
      const map = new BSTMap<number, string>()
      expect(map.getHeight()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      expect(map.getHeight()).toBe(1)
    })

    it('returns correct height for balanced-ish tree', () => {
      const map = new BSTMap<number, string>()
      map.set(2, 'root')
      map.set(1, 'left')
      map.set(3, 'right')
      expect(map.getHeight()).toBe(2)
    })

    it('returns correct height for right-skewed tree (unbalanced BST)', () => {
      const map = new BSTMap<number, string>()
      // Ascending insertion creates a right-skewed tree
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.set(4, 'd')
      map.set(5, 'e')
      // Unbalanced BST: height equals number of nodes
      expect(map.getHeight()).toBe(5)
    })

    it('returns correct height for left-skewed tree (unbalanced BST)', () => {
      const map = new BSTMap<number, string>()
      // Descending insertion creates a left-skewed tree
      map.set(5, 'e')
      map.set(4, 'd')
      map.set(3, 'c')
      map.set(2, 'b')
      map.set(1, 'a')
      expect(map.getHeight()).toBe(5)
    })

    it('height updates after deletion', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.getHeight()).toBe(2)
    })
  })

  // ─── In-order traversal correctness ─────────────────────────────────

  describe('in-order traversal correctness', () => {
    it('maintains sorted order for ascending insertions', () => {
      const map = new BSTMap<number, string>()
      for (let i = 0; i < 20; i++) map.set(i, `v${i}`)
      expect(map.keys()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('maintains sorted order for descending insertions', () => {
      const map = new BSTMap<number, string>()
      for (let i = 19; i >= 0; i--) map.set(i, `v${i}`)
      expect(map.keys()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('maintains sorted order for random insertions', () => {
      const map = new BSTMap<number, string>()
      const keys = [42, 17, 88, 5, 23, 67, 91, 3, 12, 55]
      for (const k of keys) map.set(k, `v${k}`)
      const sorted = [...keys].sort((a, b) => a - b)
      expect(map.keys()).toEqual(sorted)
    })

    it('maintains sorted order after interleaved set and delete', () => {
      const map = new BSTMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      map.delete(20)
      map.set(15, 'd')
      map.set(25, 'e')
      expect(map.keys()).toEqual([10, 15, 25, 30])
    })
  })

  // ─── Edge Cases ─────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single entry operations', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'only')
      expect(map.get(1)).toBe('only')
      expect(map.has(1)).toBe(true)
      expect(map.contains(1)).toBe(true)
      expect(map.getMin()).toEqual({ key: 1, value: 'only' })
      expect(map.getMax()).toEqual({ key: 1, value: 'only' })
      expect(map.size()).toBe(1)
      expect(map.isEmpty()).toBe(false)
      expect(map.keys()).toEqual([1])
      expect(map.values()).toEqual(['only'])
      expect(map.entries()).toEqual([{ key: 1, value: 'only' }])
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles many inserts and deletes', () => {
      const map = new BSTMap<number, number>()
      for (let i = 0; i < 100; i++) map.set(i, i * 10)
      expect(map.size()).toBe(100)

      // Delete even keys
      for (let i = 0; i < 100; i += 2) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size()).toBe(50)

      // Verify remaining entries are odd keys in order
      const keys = map.keys()
      for (let i = 0; i < keys.length; i++) {
        expect(keys[i]).toBe(2 * i + 1)
      }
    })

    it('handles inserting same key multiple times', () => {
      const map = new BSTMap<number, string>()
      for (let i = 0; i < 10; i++) map.set(1, `value${i}`)
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('value9')
    })

    it('handles negative number keys', () => {
      const map = new BSTMap<number, string>()
      map.set(-3, 'c')
      map.set(-1, 'a')
      map.set(-2, 'b')
      map.set(0, 'z')
      map.set(1, 'x')
      expect(map.keys()).toEqual([-3, -2, -1, 0, 1])
    })

    it('handles floating point keys', () => {
      const map = new BSTMap<number, string>()
      map.set(1.5, 'a')
      map.set(1.1, 'b')
      map.set(2.0, 'c')
      expect(map.keys()).toEqual([1.1, 1.5, 2.0])
    })

    it('handles large number of elements', () => {
      const map = new BSTMap<number, number>()
      const n = 1000
      for (let i = 0; i < n; i++) map.set(i, i)
      expect(map.size()).toBe(n)
      expect(map.getMin()).toEqual({ key: 0, value: 0 })
      expect(map.getMax()).toEqual({ key: n - 1, value: n - 1 })
      const entries = map.entries()
      for (let i = 0; i < n; i++) {
        expect(entries[i]).toEqual({ key: i, value: i })
      }
    })

    it('handles delete of root node with two children', () => {
      const map = new BSTMap<number, string>()
      map.set(5, 'root')
      map.set(3, 'left')
      map.set(7, 'right')
      map.set(6, 'rl')
      map.set(8, 'rr')
      map.delete(5)
      expect(map.size()).toBe(4)
      expect(map.has(5)).toBe(false)
      const keys = map.keys()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('clear and rebuild', () => {
      const map = new BSTMap<number, string>()
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      map.clear()
      expect(map.size()).toBe(0)
      for (let i = 100; i < 105; i++) map.set(i, `new${i}`)
      expect(map.size()).toBe(5)
      expect(map.getMin()).toEqual({ key: 100, value: 'new100' })
      expect(map.getMax()).toEqual({ key: 104, value: 'new104' })
    })

    it('works with custom object keys via comparator', () => {
      interface Point {
        x: number
        y: number
      }
      const map = new BSTMap<Point, string>({
        comparator: (a, b) => {
          const diff = a.x - b.x
          return diff !== 0 ? diff : a.y - b.y
        },
      })
      map.set({ x: 1, y: 2 }, 'a')
      map.set({ x: 1, y: 5 }, 'b')
      map.set({ x: 3, y: 0 }, 'c')
      expect(map.size()).toBe(3)
      const keys = map.keys()
      expect(keys[0]).toEqual({ x: 1, y: 2 })
      expect(keys[1]).toEqual({ x: 1, y: 5 })
      expect(keys[2]).toEqual({ x: 3, y: 0 })
    })

    it('fromEntries with many duplicate keys keeps last', () => {
      const map = new BSTMap<number, string>({
        entries: [
          [1, 'a'],
          [1, 'b'],
          [1, 'c'],
          [2, 'd'],
          [2, 'e'],
        ],
      })
      expect(map.size()).toBe(2)
      expect(map.get(1)).toBe('c')
      expect(map.get(2)).toBe('e')
    })

    it('predecessor and successor on single-entry map', () => {
      const map = new BSTMap<number, string>()
      map.set(5, 'five')
      expect(map.predecessor(5)).toBeUndefined()
      expect(map.predecessor(10)).toEqual({ key: 5, value: 'five' })
      expect(map.predecessor(1)).toBeUndefined()
      expect(map.successor(5)).toBeUndefined()
      expect(map.successor(1)).toEqual({ key: 5, value: 'five' })
    })

    it('deleting non-existent key from single-entry map does not change map', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      expect(map.delete(999)).toBe(false)
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('a')
    })

    it('re-inserting deleted key works correctly', () => {
      const map = new BSTMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      map.set(2, 'new-b')
      expect(map.size()).toBe(3)
      expect(map.get(2)).toBe('new-b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('iterating with for-of after modifications', () => {
      const map = new BSTMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      const result = [...map]
      expect(result).toEqual([
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('height for unbalanced BST with sorted input', () => {
      const map = new BSTMap<number, string>()
      // Sorted input creates a degenerate BST
      for (let i = 1; i <= 7; i++) map.set(i, `v${i}`)
      // Height should be 7 (completely unbalanced right-skewed)
      expect(map.getHeight()).toBe(7)
    })
  })
})
