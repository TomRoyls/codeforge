import { describe, it, expect, beforeEach } from 'vitest'
import { ThreadedMap } from '../../src/core/threaded-map/index.js'
import type { Comparator, ThreadedMapOptions } from '../../src/core/threaded-map/types.js'

function isSorted<T>(arr: T[], cmp?: (a: T, b: T) => number): boolean {
  const c = cmp ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  for (let i = 1; i < arr.length; i++) {
    if (c(arr[i - 1]!, arr[i]!) > 0) return false
  }
  return true
}

describe('ThreadedMap', () => {
  let map: ThreadedMap<number, string>

  beforeEach(() => {
    map = new ThreadedMap<number, string>()
  })

  describe('constructor', () => {
    it('creates empty map with no arguments', () => {
      const m = new ThreadedMap<number, string>()
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('creates map from entries iterable', () => {
      const m = new ThreadedMap<number, string>([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(m.size).toBe(3)
      expect(m.get(1)).toBe('a')
      expect(m.get(2)).toBe('b')
      expect(m.get(3)).toBe('c')
    })

    it('creates map from empty iterable', () => {
      const m = new ThreadedMap<number, string>([])
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('accepts custom comparator via options', () => {
      const cmp: Comparator<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const m = new ThreadedMap<string, number>(undefined, { comparator: cmp })
      m.set('Hello', 1)
      m.set('hello', 2)
      expect(m.size).toBe(1)
      expect(m.get('Hello')).toBe(2)
    })

    it('accepts entries and options together', () => {
      const cmp: Comparator<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const m = new ThreadedMap<string, number>(
        [
          ['Hello', 1],
          ['hello', 2],
        ],
        { comparator: cmp },
      )
      expect(m.size).toBe(1)
      expect(m.get('hello')).toBe(2)
    })

    it('uses default comparator for numbers', () => {
      const m = new ThreadedMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('uses default comparator for strings', () => {
      const m = new ThreadedMap<string, number>()
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('set / insert', () => {
    it('inserts a single element', () => {
      map.set(1, 'one')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('one')
    })

    it('inserts multiple elements in any order', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.size).toBe(3)
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('overwrites existing key', () => {
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('uno')
    })

    it('insert is an alias for set', () => {
      map.insert(1, 'one')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('one')
    })

    it('insert overwrites like set', () => {
      map.insert(1, 'one')
      map.insert(1, 'uno')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('uno')
    })

    it('handles sequential insertions', () => {
      for (let i = 1; i <= 10; i++) {
        map.set(i, String(i))
      }
      expect(map.size).toBe(10)
      expect(map.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles reverse sequential insertions', () => {
      for (let i = 10; i >= 1; i--) {
        map.set(i, String(i))
      }
      expect(map.size).toBe(10)
      expect(map.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles random order insertions', () => {
      const keys = [5, 2, 8, 1, 9, 3, 7, 4, 6, 10]
      for (const k of keys) {
        map.set(k, String(k))
      }
      expect(map.size).toBe(10)
      expect(map.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles large number of insertions', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i, String(i))
      }
      expect(map.size).toBe(1000)
      const keys = map.keys()
      expect(isSorted(keys)).toBe(true)
    })
  })

  describe('get', () => {
    it('returns undefined for missing key in empty map', () => {
      expect(map.get(1)).toBeUndefined()
    })

    it('returns undefined for missing key in non-empty map', () => {
      map.set(1, 'one')
      expect(map.get(2)).toBeUndefined()
    })

    it('returns value for existing key', () => {
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('returns updated value after set', () => {
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.get(1)).toBe('uno')
    })

    it('returns values for all keys after multiple insertions', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
      expect(map.get(3)).toBe('three')
    })
  })

  describe('has', () => {
    it('returns false for empty map', () => {
      expect(map.has(1)).toBe(false)
    })

    it('returns true for existing key', () => {
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for missing key', () => {
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })

    it('returns false after deletion', () => {
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('returns false for missing key', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('returns false for empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('deletes a leaf node (right child)', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.has(1)).toBe(false)
    })

    it('deletes a leaf node (left child)', () => {
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.delete(3)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.has(3)).toBe(false)
    })

    it('deletes root when only node', () => {
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('deletes node with only left child', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.delete(3)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.keys()).toEqual([1, 2])
    })

    it('deletes node with only right child', () => {
      map.set(1, 'one')
      map.set(3, 'three')
      map.set(2, 'two')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.keys()).toEqual([2, 3])
    })

    it('deletes node with two children', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.delete(2)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.has(2)).toBe(false)
      expect(isSorted(map.keys())).toBe(true)
    })

    it('maintains in-order traversal after deletion', () => {
      for (let i = 1; i <= 10; i++) {
        map.set(i, String(i))
      }
      map.delete(5)
      map.delete(3)
      map.delete(7)
      expect(isSorted(map.keys())).toBe(true)
      expect(map.size).toBe(7)
    })

    it('handles deleting all elements', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      map.delete(1)
      map.delete(3)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles deletion in various orders', () => {
      for (let i = 1; i <= 5; i++) {
        map.set(i, String(i))
      }
      map.delete(3)
      map.delete(1)
      map.delete(5)
      expect(map.size).toBe(2)
      expect(isSorted(map.keys())).toBe(true)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty map', () => {
      expect(map.size).toBe(0)
    })

    it('isEmpty returns true for empty map', () => {
      expect(map.isEmpty()).toBe(true)
    })

    it('size increments with each insert', () => {
      map.set(1, 'one')
      expect(map.size).toBe(1)
      map.set(2, 'two')
      expect(map.size).toBe(2)
    })

    it('size does not increment on overwrite', () => {
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.size).toBe(1)
    })

    it('isEmpty returns false after insert', () => {
      map.set(1, 'one')
      expect(map.isEmpty()).toBe(false)
    })

    it('size decrements on delete', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(1)
      expect(map.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('clears non-empty map', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.get(1)).toBeUndefined()
    })

    it('allows insertions after clear', () => {
      map.set(1, 'one')
      map.clear()
      map.set(2, 'two')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('two')
    })
  })

  describe('clone', () => {
    it('clones empty map', () => {
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones non-empty map with all entries', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      const cloned = map.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.get(1)).toBe('one')
      expect(cloned.get(2)).toBe('two')
      expect(cloned.get(3)).toBe('three')
    })

    it('clone is independent of original', () => {
      map.set(1, 'one')
      const cloned = map.clone()
      cloned.set(1, 'uno')
      expect(map.get(1)).toBe('one')
      expect(cloned.get(1)).toBe('uno')
    })

    it('clone preserves comparator', () => {
      const cmp: Comparator<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const m = new ThreadedMap<string, number>(undefined, { comparator: cmp })
      m.set('Hello', 1)
      const cloned = m.clone()
      cloned.set('hello', 2)
      expect(cloned.size).toBe(1)
      expect(cloned.get('hello')).toBe(2)
    })
  })

  describe('min / max', () => {
    it('min returns undefined for empty map', () => {
      expect(map.min()).toBeUndefined()
    })

    it('max returns undefined for empty map', () => {
      expect(map.max()).toBeUndefined()
    })

    it('min returns smallest entry', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.min()).toEqual([1, 'one'])
    })

    it('max returns largest entry', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.max()).toEqual([3, 'three'])
    })

    it('min and max same for single element', () => {
      map.set(1, 'one')
      expect(map.min()).toEqual([1, 'one'])
      expect(map.max()).toEqual([1, 'one'])
    })

    it('min updates after deletion', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.min()).toEqual([2, 'two'])
    })

    it('max updates after deletion', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.max()).toEqual([2, 'two'])
    })
  })

  describe('first / last', () => {
    it('first returns undefined for empty map', () => {
      expect(map.first()).toBeUndefined()
    })

    it('last returns undefined for empty map', () => {
      expect(map.last()).toBeUndefined()
    })

    it('first returns smallest entry', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      expect(map.first()).toEqual([1, 'one'])
    })

    it('last returns largest entry', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      expect(map.last()).toEqual([3, 'three'])
    })
  })

  describe('update', () => {
    it('returns false for missing key', () => {
      expect(map.update(1, 'one')).toBe(false)
    })

    it('updates existing key value', () => {
      map.set(1, 'one')
      expect(map.update(1, 'uno')).toBe(true)
      expect(map.get(1)).toBe('uno')
    })

    it('does not change size on update', () => {
      map.set(1, 'one')
      map.update(1, 'uno')
      expect(map.size).toBe(1)
    })
  })

  describe('forEach', () => {
    it('does nothing for empty map', () => {
      const items: [number, string][] = []
      map.forEach((v, k) => items.push([k, v]))
      expect(items).toEqual([])
    })

    it('iterates in order', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      const items: [number, string][] = []
      map.forEach((v, k) => items.push([k, v]))
      expect(items).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('passes the map as third argument', () => {
      map.set(1, 'one')
      let received: ThreadedMap<number, string> | undefined
      map.forEach((_v, _k, m) => {
        received = m
      })
      expect(received).toBe(map)
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const items = [...map]
      expect(items).toEqual([])
    })

    it('iterates in order', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      const items = [...map]
      expect(items).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })

    it('works with for-of loop', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      const keys: number[] = []
      for (const [k] of map) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2, 3])
    })
  })

  describe('keys / values / entries', () => {
    it('keys returns empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('values returns empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('entries returns empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('keys returns sorted keys', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('values returns values in key order', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.values()).toEqual(['one', 'two', 'three'])
    })

    it('entries returns key-value pairs in key order', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.entries()).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
    })
  })

  describe('toArray / toArraySorted', () => {
    it('toArray returns empty for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('toArray returns entries in order', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      expect(map.toArray()).toEqual([
        [1, 'one'],
        [2, 'two'],
      ])
    })

    it('toArraySorted returns entries in order', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      expect(map.toArraySorted()).toEqual([
        [1, 'one'],
        [2, 'two'],
      ])
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty map', () => {
      expect(map.lowerBound(1)).toBeUndefined()
    })

    it('returns first element >= key', () => {
      map.set(1, 'one')
      map.set(3, 'three')
      map.set(5, 'five')
      expect(map.lowerBound(3)).toEqual([3, 'three'])
    })

    it('returns next larger when exact not found', () => {
      map.set(1, 'one')
      map.set(3, 'three')
      map.set(5, 'five')
      expect(map.lowerBound(2)).toEqual([3, 'three'])
    })

    it('returns undefined when all keys are less', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.lowerBound(5)).toBeUndefined()
    })

    it('returns first element when key is below all', () => {
      map.set(3, 'three')
      map.set(5, 'five')
      expect(map.lowerBound(1)).toEqual([3, 'three'])
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty map', () => {
      expect(map.upperBound(1)).toBeUndefined()
    })

    it('returns first element > key', () => {
      map.set(1, 'one')
      map.set(3, 'three')
      map.set(5, 'five')
      expect(map.upperBound(3)).toEqual([5, 'five'])
    })

    it('returns first element >= when not exact', () => {
      map.set(1, 'one')
      map.set(5, 'five')
      expect(map.upperBound(2)).toEqual([5, 'five'])
    })

    it('returns undefined when all keys are <= key', () => {
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.upperBound(5)).toBeUndefined()
    })
  })

  describe('predecessor / successor', () => {
    it('predecessor returns undefined for missing key', () => {
      map.set(1, 'one')
      expect(map.predecessor(2)).toBeUndefined()
    })

    it('successor returns undefined for missing key', () => {
      map.set(1, 'one')
      expect(map.successor(2)).toBeUndefined()
    })

    it('predecessor returns undefined for minimum key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.predecessor(1)).toBeUndefined()
    })

    it('successor returns undefined for maximum key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.successor(2)).toBeUndefined()
    })

    it('predecessor returns previous entry', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.predecessor(2)).toEqual([1, 'one'])
      expect(map.predecessor(3)).toEqual([2, 'two'])
    })

    it('successor returns next entry', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.successor(1)).toEqual([2, 'two'])
      expect(map.successor(2)).toEqual([3, 'three'])
    })

    it('predecessor/successor works after deletion', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      expect(map.successor(1)).toEqual([3, 'three'])
      expect(map.predecessor(3)).toEqual([1, 'one'])
    })
  })

  describe('rank', () => {
    it('returns -1 for missing key', () => {
      expect(map.rank(1)).toBe(-1)
    })

    it('returns -1 for empty map', () => {
      expect(map.rank(1)).toBe(-1)
    })

    it('returns 0 for minimum key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.rank(1)).toBe(0)
    })

    it('returns correct rank for middle key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.rank(2)).toBe(1)
    })

    it('returns correct rank for maximum key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.rank(3)).toBe(2)
    })

    it('rank is consistent across insertions', () => {
      for (let i = 1; i <= 10; i++) {
        map.set(i, String(i))
      }
      for (let i = 1; i <= 10; i++) {
        expect(map.rank(i)).toBe(i - 1)
      }
    })
  })

  describe('select', () => {
    it('returns undefined for empty map', () => {
      expect(map.select(0)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      map.set(1, 'one')
      expect(map.select(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds index', () => {
      map.set(1, 'one')
      expect(map.select(1)).toBeUndefined()
    })

    it('returns element at rank 0 (minimum)', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.select(0)).toEqual([1, 'one'])
    })

    it('returns element at last rank (maximum)', () => {
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.select(2)).toEqual([3, 'three'])
    })

    it('rank and select are inverses', () => {
      for (let i = 1; i <= 10; i++) {
        map.set(i, String(i))
      }
      for (let i = 0; i < 10; i++) {
        const entry = map.select(i)
        expect(entry).toBeDefined()
        expect(map.rank(entry![0])).toBe(i)
      }
    })
  })

  describe('static fromArray', () => {
    it('creates map from array of entries', () => {
      const m = ThreadedMap.fromArray([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(m.size).toBe(3)
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('creates empty map from empty array', () => {
      const m = ThreadedMap.fromArray<number, string>([])
      expect(m.size).toBe(0)
    })

    it('accepts options', () => {
      const cmp: Comparator<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const m = ThreadedMap.fromArray(
        [
          ['Hello', 1],
          ['hello', 2],
        ],
        { comparator: cmp },
      )
      expect(m.size).toBe(1)
      expect(m.get('hello')).toBe(2)
    })
  })

  describe('threaded iteration O(1) amortized', () => {
    it('iterates using threads through all nodes', () => {
      for (let i = 1; i <= 100; i++) {
        map.set(i, String(i))
      }
      const keys = map.keys()
      expect(keys.length).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(keys[i]).toBe(i + 1)
      }
    })

    it('forEach visits all nodes in order', () => {
      const visited: number[] = []
      for (let i = 1; i <= 50; i++) {
        map.set(i, String(i))
      }
      map.forEach((_v, k) => visited.push(k))
      expect(visited.length).toBe(50)
      expect(isSorted(visited)).toBe(true)
    })
  })

  describe('complex scenarios', () => {
    it('handles mixed operations', () => {
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      map.set(1, 'one')
      map.set(9, 'nine')
      map.delete(3)
      map.set(3, 'THREE')
      map.set(6, 'six')
      map.delete(7)
      expect(map.size).toBe(5)
      expect(isSorted(map.keys())).toBe(true)
      expect(map.get(3)).toBe('THREE')
      expect(map.get(6)).toBe('six')
    })

    it('handles stress test with many operations', () => {
      const keys = new Set<number>()
      for (let i = 0; i < 500; i++) {
        const k = Math.floor(Math.random() * 1000)
        map.set(k, String(k))
        keys.add(k)
      }
      expect(map.size).toBe(keys.size)
      expect(isSorted(map.keys())).toBe(true)

      const toDelete = [...keys].slice(0, 100)
      for (const k of toDelete) {
        map.delete(k)
        keys.delete(k)
      }
      expect(map.size).toBe(keys.size)
      expect(isSorted(map.keys())).toBe(true)
    })

    it('handles string keys', () => {
      const m = new ThreadedMap<string, number>()
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      m.set('date', 4)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry', 'date'])
      expect(m.min()).toEqual(['apple', 1])
      expect(m.max()).toEqual(['date', 4])
    })

    it('handles object values', () => {
      const m = new ThreadedMap<number, { name: string }>()
      m.set(1, { name: 'one' })
      m.set(2, { name: 'two' })
      expect(m.get(1)).toEqual({ name: 'one' })
      expect(m.get(2)).toEqual({ name: 'two' })
    })

    it('handles null and undefined values', () => {
      const m = new ThreadedMap<number, string | null>()
      m.set(1, null)
      m.set(2, 'two')
      expect(m.get(1)).toBeNull()
      expect(m.get(2)).toBe('two')
    })

    it('handles custom comparator (reverse)', () => {
      const cmp: Comparator<number> = (a, b) => b - a
      const m = new ThreadedMap<number, string>(undefined, { comparator: cmp })
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.keys()).toEqual([3, 2, 1])
      expect(m.min()).toEqual([3, 'three'])
      expect(m.max()).toEqual([1, 'one'])
    })

    it('handles duplicate keys with last-value wins', () => {
      map.set(1, 'first')
      map.set(1, 'second')
      map.set(1, 'third')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('third')
    })

    it('survives deletion of all elements one by one', () => {
      for (let i = 1; i <= 20; i++) {
        map.set(i, String(i))
      }
      for (let i = 1; i <= 20; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('survives deletion of all elements in reverse', () => {
      for (let i = 1; i <= 20; i++) {
        map.set(i, String(i))
      }
      for (let i = 20; i >= 1; i--) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles delete and re-insert', () => {
      map.set(1, 'one')
      map.delete(1)
      map.set(1, 'ONE')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('ONE')
    })

    it('handles alternating insert delete', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, String(i))
        if (i > 0 && i % 3 === 0) {
          map.delete(i - 1)
        }
      }
      expect(isSorted(map.keys())).toBe(true)
    })

    it('lowerBound/upperBound with single element', () => {
      map.set(5, 'five')
      expect(map.lowerBound(5)).toEqual([5, 'five'])
      expect(map.lowerBound(4)).toEqual([5, 'five'])
      expect(map.lowerBound(6)).toBeUndefined()
      expect(map.upperBound(5)).toBeUndefined()
      expect(map.upperBound(4)).toEqual([5, 'five'])
    })

    it('rank/select with single element', () => {
      map.set(5, 'five')
      expect(map.rank(5)).toBe(0)
      expect(map.rank(3)).toBe(-1)
      expect(map.select(0)).toEqual([5, 'five'])
      expect(map.select(1)).toBeUndefined()
    })

    it('predecessor/successor chain traversal', () => {
      for (let i = 1; i <= 5; i++) {
        map.set(i, String(i))
      }
      let current = map.successor(1)
      const chain: number[] = [1]
      while (current !== undefined) {
        chain.push(current[0])
        current = map.successor(current[0])
      }
      expect(chain).toEqual([1, 2, 3, 4, 5])
    })

    it('rank works after deletions', () => {
      for (let i = 1; i <= 10; i++) {
        map.set(i, String(i))
      }
      map.delete(5)
      map.delete(3)
      const keys = map.keys()
      for (let i = 0; i < keys.length; i++) {
        expect(map.rank(keys[i]!)).toBe(i)
      }
    })

    it('select works after deletions', () => {
      for (let i = 1; i <= 10; i++) {
        map.set(i, String(i))
      }
      map.delete(5)
      expect(map.select(0)).toEqual([1, '1'])
      expect(map.select(8)).toEqual([10, '10'])
      expect(map.select(9)).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      map.set(-1, 'neg-one')
      map.set(0, 'zero')
      map.set(1, 'one')
      expect(map.keys()).toEqual([-1, 0, 1])
      expect(map.min()).toEqual([-1, 'neg-one'])
      expect(map.max()).toEqual([1, 'one'])
    })

    it('handles float keys', () => {
      const m = new ThreadedMap<number, string>()
      m.set(1.5, 'one-five')
      m.set(2.5, 'two-five')
      m.set(0.5, 'half')
      expect(m.keys()).toEqual([0.5, 1.5, 2.5])
    })

    it('handles single element operations', () => {
      map.set(1, 'one')
      expect(map.min()).toEqual([1, 'one'])
      expect(map.max()).toEqual([1, 'one'])
      expect(map.first()).toEqual([1, 'one'])
      expect(map.last()).toEqual([1, 'one'])
      expect(map.lowerBound(1)).toEqual([1, 'one'])
      expect(map.upperBound(0)).toEqual([1, 'one'])
      expect(map.predecessor(1)).toBeUndefined()
      expect(map.successor(1)).toBeUndefined()
      expect(map.rank(1)).toBe(0)
      expect(map.select(0)).toEqual([1, 'one'])
    })

    it('handles two element map', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.predecessor(2)).toEqual([1, 'one'])
      expect(map.successor(1)).toEqual([2, 'two'])
      expect(map.rank(1)).toBe(0)
      expect(map.rank(2)).toBe(1)
    })

    it('clears and reuses map', () => {
      for (let i = 1; i <= 10; i++) {
        map.set(i, String(i))
      }
      map.clear()
      expect(map.size).toBe(0)
      map.set(100, 'hundred')
      expect(map.size).toBe(1)
      expect(map.get(100)).toBe('hundred')
    })

    it('clone after modifications', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.delete(1)
      const cloned = map.clone()
      expect(cloned.size).toBe(1)
      expect(cloned.has(2)).toBe(true)
      expect(cloned.has(1)).toBe(false)
    })

    it('forEach after modifications', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(2)
      const items: number[] = []
      map.forEach((_v, k) => items.push(k))
      expect(items).toEqual([1, 3])
    })

    it('entries from generator', () => {
      function* gen(): Generator<[number, string]> {
        yield [3, 'c']
        yield [1, 'a']
        yield [2, 'b']
      }
      const m = new ThreadedMap<number, string>(gen())
      expect(m.size).toBe(3)
      expect(m.keys()).toEqual([1, 2, 3])
    })
  })
})
