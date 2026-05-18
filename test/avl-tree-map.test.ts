import { AVLTreeMap } from '../src/core/avl-tree-map/avl-tree-map.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('AVLTreeMap', () => {
  describe('constructor', () => {
    it('creates an empty map with default comparator', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates an empty map with custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const map = new AVLTreeMap<number, string>(reverseCmp)
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([2, 1])
    })

    it('accepts a comparator that compares strings', () => {
      const map = new AVLTreeMap<string, number>()
      map.set('banana', 2)
      map.set('apple', 1)
      map.set('cherry', 3)
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── static fromEntries ─────────────────────────────────────────────

  describe('static fromEntries', () => {
    it('creates a map from an array of entries', () => {
      const map = AVLTreeMap.fromEntries([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(map.size).toBe(3)
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })

    it('creates an empty map from empty array', () => {
      const map = AVLTreeMap.fromEntries<number, string>([])
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates a map with custom comparator', () => {
      const map = AVLTreeMap.fromEntries(
        [
          [1, 'a'],
          [2, 'b'],
        ],
        (a, b) => b - a,
      )
      expect(map.keys()).toEqual([2, 1])
    })

    it('preserves last value for duplicate keys', () => {
      const map = AVLTreeMap.fromEntries([
        [1, 'first'],
        [1, 'second'],
      ])
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('second')
    })
  })

  // ─── set / get ──────────────────────────────────────────────────────

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'hello')
      expect(map.get(1)).toBe('hello')
    })

    it('returns undefined for missing key', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.get(999)).toBeUndefined()
    })

    it('returns undefined for get on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.get(1)).toBeUndefined()
    })

    it('overwrites existing key with new value', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.get(1)).toBe('new')
      expect(map.size).toBe(1)
    })

    it('sets multiple keys maintaining sorted order', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(5, 'e')
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(4, 'd')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3, 4, 5])
      expect(map.values()).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('handles string keys in sorted order', () => {
      const map = new AVLTreeMap<string, number>()
      map.set('cherry', 3)
      map.set('apple', 1)
      map.set('banana', 2)
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles object values', () => {
      const map = new AVLTreeMap<number, { name: string }>()
      map.set(1, { name: 'Alice' })
      map.set(2, { name: 'Bob' })
      expect(map.get(1)).toEqual({ name: 'Alice' })
      expect(map.get(2)).toEqual({ name: 'Bob' })
    })

    it('handles null and undefined values', () => {
      const map = new AVLTreeMap<number, string | null | undefined>()
      map.set(1, null)
      map.set(2, undefined)
      expect(map.get(1)).toBeNull()
      expect(map.get(2)).toBeUndefined()
    })
  })

  // ─── has ────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(42, 'answer')
      expect(map.has(42)).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      expect(map.has(999)).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  // ─── delete ─────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      expect(map.delete(1)).toBe(true)
      expect(map.get(1)).toBeUndefined()
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.delete(999)).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.delete(1)).toBe(false)
    })

    it('maintains order after deletion', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.keys()).toEqual([1, 3])
      expect(map.values()).toEqual(['a', 'c'])
    })

    it('can delete min key', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      expect(map.keys()).toEqual([2, 3])
      expect(map.min()).toEqual([2, 'b'])
    })

    it('can delete max key', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(3)
      expect(map.keys()).toEqual([1, 2])
      expect(map.max()).toEqual([2, 'b'])
    })

    it('can delete all entries one by one', () => {
      const map = new AVLTreeMap<number, string>()
      for (let i = 1; i <= 5; i++) map.set(i, `v${i}`)
      for (let i = 1; i <= 5; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles delete with two children (successor replacement)', () => {
      const map = new AVLTreeMap<number, string>()
      // Build a tree where node 3 has both children
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(4, 'd')
      map.set(6, 'f')
      map.delete(3)
      expect(map.size).toBe(4)
      expect(map.has(3)).toBe(false)
      expect(map.keys()).toEqual([1, 4, 5, 6])
    })
  })

  // ─── size / isEmpty / clear ─────────────────────────────────────────

  describe('size, isEmpty, clear', () => {
    it('size is 0 for empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.size).toBe(0)
    })

    it('isEmpty returns true for empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.isEmpty()).toBe(true)
    })

    it('size increments on set', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      expect(map.size).toBe(1)
      map.set(2, 'b')
      expect(map.size).toBe(2)
    })

    it('size does not increment on overwrite', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('clear removes all entries', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.get(1)).toBeUndefined()
      expect(map.keys()).toEqual([])
    })

    it('clear on empty map is a no-op', () => {
      const map = new AVLTreeMap<number, string>()
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('map is usable after clear', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('b')
    })
  })

  // ─── min / max ──────────────────────────────────────────────────────

  describe('min and max', () => {
    it('min returns undefined on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.min()).toBeUndefined()
    })

    it('max returns undefined on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.max()).toBeUndefined()
    })

    it('min and max return the same entry for single entry', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(42, 'answer')
      expect(map.min()).toEqual([42, 'answer'])
      expect(map.max()).toEqual([42, 'answer'])
    })

    it('min returns smallest key entry', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(5, 'e')
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.min()).toEqual([1, 'a'])
    })

    it('max returns largest key entry', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(5, 'e')
      map.set(1, 'a')
      map.set(3, 'c')
      expect(map.max()).toEqual([5, 'e'])
    })

    it('min and max update after deletion', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(1)
      expect(map.min()).toEqual([2, 'b'])
      map.delete(3)
      expect(map.max()).toEqual([2, 'b'])
    })

    it('min and max work with string keys', () => {
      const map = new AVLTreeMap<string, number>()
      map.set('cherry', 3)
      map.set('apple', 1)
      map.set('banana', 2)
      expect(map.min()).toEqual(['apple', 1])
      expect(map.max()).toEqual(['cherry', 3])
    })
  })

  // ─── keys / values / entries ────────────────────────────────────────

  describe('keys, values, entries', () => {
    it('keys returns empty array for empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.keys()).toEqual([])
    })

    it('values returns empty array for empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.values()).toEqual([])
    })

    it('entries returns empty array for empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.entries()).toEqual([])
    })

    it('keys returns sorted keys', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('values returns values in key order', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('entries returns key-value pairs in key order', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('entries reflect overwrites', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'old')
      map.set(1, 'new')
      expect(map.entries()).toEqual([[1, 'new']])
    })

    it('entries reflect deletions', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.delete(2)
      expect(map.entries()).toEqual([
        [1, 'a'],
        [3, 'c'],
      ])
    })
  })

  // ─── forEach ────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries in key order', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const results: Array<{ key: number; value: string }> = []
      map.forEach((value, key) => {
        results.push({ key, value })
      })
      expect(results).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('does not call callback on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      let callCount = 0
      map.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates single entry', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'only')
      const results: string[] = []
      map.forEach((value) => results.push(value))
      expect(results).toEqual(['only'])
    })
  })

  // ─── clone ──────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      expect(cloned.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
      expect(cloned.size).toBe(2)
    })

    it('modifications to clone do not affect original', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(2, 'b')
      expect(map.size).toBe(1)
      expect(cloned.size).toBe(2)
      expect(map.has(2)).toBe(false)
    })

    it('modifications to original do not affect clone', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      map.delete(1)
      expect(cloned.size).toBe(2)
      expect(cloned.has(1)).toBe(true)
    })

    it('clones empty map', () => {
      const map = new AVLTreeMap<number, string>()
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone preserves comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const map = new AVLTreeMap<number, string>(reverseCmp)
      map.set(1, 'a')
      map.set(2, 'b')
      const cloned = map.clone()
      expect(cloned.keys()).toEqual([2, 1])
    })
  })

  // ─── lowerBound / upperBound ────────────────────────────────────────

  describe('lowerBound and upperBound', () => {
    it('lowerBound returns first entry with key >= target', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.lowerBound(15)).toEqual([20, 'b'])
    })

    it('lowerBound returns exact match', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.lowerBound(20)).toEqual([20, 'b'])
    })

    it('lowerBound returns min for very small target', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      expect(map.lowerBound(1)).toEqual([10, 'a'])
    })

    it('lowerBound returns undefined if all keys are smaller', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      expect(map.lowerBound(100)).toBeUndefined()
    })

    it('lowerBound returns undefined on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.lowerBound(1)).toBeUndefined()
    })

    it('upperBound returns first entry with key > target', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.upperBound(20)).toEqual([30, 'c'])
    })

    it('upperBound skips exact match', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      expect(map.upperBound(10)).toEqual([20, 'b'])
    })

    it('upperBound returns undefined if no key is greater', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(10, 'a')
      map.set(20, 'b')
      expect(map.upperBound(20)).toBeUndefined()
    })

    it('upperBound returns undefined on empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.upperBound(1)).toBeUndefined()
    })
  })

  // ─── range ──────────────────────────────────────────────────────────

  describe('range', () => {
    it('returns entries within range inclusive', () => {
      const map = new AVLTreeMap<number, string>()
      for (let i = 1; i <= 10; i++) map.set(i, `v${i}`)
      expect(map.range(3, 7)).toEqual([
        [3, 'v3'],
        [4, 'v4'],
        [5, 'v5'],
        [6, 'v6'],
        [7, 'v7'],
      ])
    })

    it('returns single entry when start equals end', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.range(2, 2)).toEqual([[2, 'b']])
    })

    it('returns empty array when start > end', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.range(5, 3)).toEqual([])
    })

    it('returns empty array for empty map', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.range(1, 10)).toEqual([])
    })

    it('returns entries within range even if boundaries are outside map range', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(3, 'c')
      map.set(5, 'e')
      map.set(7, 'g')
      expect(map.range(0, 10)).toEqual([
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
      ])
    })

    it('returns entries clipped to available range', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(3, 'c')
      map.set(5, 'e')
      map.set(7, 'g')
      expect(map.range(4, 6)).toEqual([[5, 'e']])
    })

    it('returns empty when range has no matching keys', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(10, 'j')
      expect(map.range(4, 6)).toEqual([])
    })
  })

  // ─── Symbol.iterator ───────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates entries in key order', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const result = [...map]
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('returns no entries for empty map', () => {
      const map = new AVLTreeMap<number, string>()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('works with for-of loop', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const keys: number[] = []
      for (const [key] of map) {
        keys.push(key)
      }
      expect(keys).toEqual([1, 2])
    })
  })

  // ─── getHeight ──────────────────────────────────────────────────────

  describe('getHeight', () => {
    it('returns 0 for empty tree', () => {
      const map = new AVLTreeMap<number, string>()
      expect(map.getHeight()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      expect(map.getHeight()).toBe(1)
    })

    it('height is O(log n) for balanced tree', () => {
      const map = new AVLTreeMap<number, string>()
      const n = 100
      for (let i = 0; i < n; i++) map.set(i, `v${i}`)
      const height = map.getHeight()
      // AVL tree height is bounded by ~1.44 * log2(n+2)
      const maxExpected = Math.ceil(1.44 * Math.log2(n + 2))
      expect(height).toBeLessThanOrEqual(maxExpected)
      expect(height).toBeGreaterThan(0)
    })

    it('height stays balanced after many deletions', () => {
      const map = new AVLTreeMap<number, string>()
      for (let i = 0; i < 50; i++) map.set(i, `v${i}`)
      for (let i = 0; i < 40; i++) map.delete(i)
      const height = map.getHeight()
      // 10 remaining nodes should have small height
      expect(height).toBeLessThanOrEqual(5)
    })
  })

  // ─── In-order traversal correctness ─────────────────────────────────

  describe('in-order traversal correctness', () => {
    it('maintains sorted order for ascending insertions', () => {
      const map = new AVLTreeMap<number, string>()
      for (let i = 0; i < 20; i++) map.set(i, `v${i}`)
      expect(map.keys()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('maintains sorted order for descending insertions', () => {
      const map = new AVLTreeMap<number, string>()
      for (let i = 19; i >= 0; i--) map.set(i, `v${i}`)
      expect(map.keys()).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('maintains sorted order for random insertions', () => {
      const map = new AVLTreeMap<number, string>()
      const keys = [42, 17, 88, 5, 23, 67, 91, 3, 12, 55]
      for (const k of keys) map.set(k, `v${k}`)
      const sorted = [...keys].sort((a, b) => a - b)
      expect(map.keys()).toEqual(sorted)
    })

    it('maintains sorted order after interleaved set and delete', () => {
      const map = new AVLTreeMap<number, string>()
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
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'only')
      expect(map.get(1)).toBe('only')
      expect(map.has(1)).toBe(true)
      expect(map.min()).toEqual([1, 'only'])
      expect(map.max()).toEqual([1, 'only'])
      expect(map.size).toBe(1)
      expect(map.isEmpty()).toBe(false)
      expect(map.keys()).toEqual([1])
      expect(map.values()).toEqual(['only'])
      expect(map.entries()).toEqual([[1, 'only']])
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles many inserts and deletes maintaining AVL balance', () => {
      const map = new AVLTreeMap<number, number>()
      // Insert 100 entries
      for (let i = 0; i < 100; i++) map.set(i, i * 10)
      expect(map.size).toBe(100)

      // Delete even keys
      for (let i = 0; i < 100; i += 2) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(50)

      // Verify remaining entries are odd keys in order
      const keys = map.keys()
      for (let i = 0; i < keys.length; i++) {
        expect(keys[i]).toBe(2 * i + 1)
      }
    })

    it('handles inserting same key multiple times', () => {
      const map = new AVLTreeMap<number, string>()
      for (let i = 0; i < 10; i++) map.set(1, `value${i}`)
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('value9')
    })

    it('handles negative number keys', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(-3, 'c')
      map.set(-1, 'a')
      map.set(-2, 'b')
      map.set(0, 'z')
      map.set(1, 'x')
      expect(map.keys()).toEqual([-3, -2, -1, 0, 1])
    })

    it('handles floating point keys', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1.5, 'a')
      map.set(1.1, 'b')
      map.set(2.0, 'c')
      expect(map.keys()).toEqual([1.1, 1.5, 2.0])
    })

    it('handles large number of elements', () => {
      const map = new AVLTreeMap<number, number>()
      const n = 1000
      for (let i = 0; i < n; i++) map.set(i, i)
      expect(map.size).toBe(n)
      expect(map.min()).toEqual([0, 0])
      expect(map.max()).toEqual([n - 1, n - 1])
      // Verify all entries in order
      const entries = map.entries()
      for (let i = 0; i < n; i++) {
        expect(entries[i]).toEqual([i, i])
      }
    })

    it('handles delete of root node with two children', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(5, 'root')
      map.set(3, 'left')
      map.set(7, 'right')
      map.set(6, 'rl')
      map.set(8, 'rr')
      map.delete(5)
      expect(map.size).toBe(4)
      expect(map.has(5)).toBe(false)
      // Remaining should still be sorted
      const keys = map.keys()
      const sorted = [...keys].sort((a, b) => a - b)
      expect(keys).toEqual(sorted)
    })

    it('clear and rebuild', () => {
      const map = new AVLTreeMap<number, string>()
      for (let i = 0; i < 10; i++) map.set(i, `v${i}`)
      map.clear()
      expect(map.size).toBe(0)
      for (let i = 100; i < 105; i++) map.set(i, `new${i}`)
      expect(map.size).toBe(5)
      expect(map.min()).toEqual([100, 'new100'])
      expect(map.max()).toEqual([104, 'new104'])
    })

    it('works with custom object keys via comparator', () => {
      interface Point {
        x: number
        y: number
      }
      const map = new AVLTreeMap<Point, string>((a, b) => {
        const diff = a.x - b.x
        return diff !== 0 ? diff : a.y - b.y
      })
      map.set({ x: 1, y: 2 }, 'a')
      map.set({ x: 1, y: 5 }, 'b')
      map.set({ x: 3, y: 0 }, 'c')
      expect(map.size).toBe(3)
      const keys = map.keys()
      expect(keys[0]).toEqual({ x: 1, y: 2 })
      expect(keys[1]).toEqual({ x: 1, y: 5 })
      expect(keys[2]).toEqual({ x: 3, y: 0 })
    })

    it('range query with string keys', () => {
      const map = new AVLTreeMap<string, number>()
      map.set('apple', 1)
      map.set('banana', 2)
      map.set('cherry', 3)
      map.set('date', 4)
      map.set('elderberry', 5)
      const result = map.range('banana', 'date')
      expect(result).toEqual([
        ['banana', 2],
        ['cherry', 3],
        ['date', 4],
      ])
    })

    it('forEach callback receives correct value and key pairs', () => {
      const map = new AVLTreeMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      map.set('z', 30)
      const collected: string[] = []
      map.forEach((value, key) => {
        collected.push(`${key}:${value}`)
      })
      expect(collected).toEqual(['x:10', 'y:20', 'z:30'])
    })

    it('clone of clone works correctly', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      const clone1 = map.clone()
      const clone2 = clone1.clone()
      clone2.set(3, 'c')
      expect(map.size).toBe(2)
      expect(clone1.size).toBe(2)
      expect(clone2.size).toBe(3)
    })

    it('fromEntries with many duplicate keys keeps last', () => {
      const map = AVLTreeMap.fromEntries([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [2, 'd'],
        [2, 'e'],
      ])
      expect(map.size).toBe(2)
      expect(map.get(1)).toBe('c')
      expect(map.get(2)).toBe('e')
    })

    it('lowerBound and upperBound on single-entry map', () => {
      const map = new AVLTreeMap<number, string>()
      map.set(5, 'five')
      expect(map.lowerBound(5)).toEqual([5, 'five'])
      expect(map.lowerBound(1)).toEqual([5, 'five'])
      expect(map.lowerBound(10)).toBeUndefined()
      expect(map.upperBound(5)).toBeUndefined()
      expect(map.upperBound(1)).toEqual([5, 'five'])
    })
  })
})
