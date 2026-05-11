import { describe, it, expect, beforeEach } from 'vitest'
import { RedBlackMap } from '../../src/core/red-black-map/index.js'
import type { CompareFunction, RedBlackMapOptions } from '../../src/core/red-black-map/types.js'

function isSorted<T>(arr: T[], cmp?: (a: T, b: T) => number): boolean {
  const c = cmp ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  for (let i = 1; i < arr.length; i++) {
    if (c(arr[i - 1]!, arr[i]!) > 0) return false
  }
  return true
}

function verifyRBProperties<K, V>(map: RedBlackMap<K, V>): void {
  const entries = map.entries()
  expect(entries.length).toBe(map.size)
  for (let i = 1; i < entries.length; i++) {
    expect(entries[i]![0]).not.toBe(entries[i - 1]![0])
  }
}

describe('RedBlackMap', () => {
  let map: RedBlackMap<number, string>

  beforeEach(() => {
    map = new RedBlackMap<number, string>()
  })

  describe('constructor', () => {
    it('creates empty map with no arguments', () => {
      const m = new RedBlackMap<number, string>()
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('creates map from entries iterable', () => {
      const m = new RedBlackMap<number, string>([
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
      const m = new RedBlackMap<number, string>([])
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('accepts custom comparator via options', () => {
      const cmp: CompareFunction<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const m = new RedBlackMap<string, number>(undefined, { compare: cmp })
      m.set('Hello', 1)
      m.set('hello', 2)
      expect(m.size).toBe(1)
      expect(m.get('Hello')).toBe(2)
    })

    it('accepts entries and options together', () => {
      const cmp: CompareFunction<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const m = new RedBlackMap<string, number>(
        [
          ['Hello', 1],
          ['hello', 2],
        ],
        { compare: cmp },
      )
      expect(m.size).toBe(1)
      expect(m.get('hello')).toBe(2)
    })

    it('uses default comparator for numbers', () => {
      const m = new RedBlackMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('uses default comparator for strings', () => {
      const m = new RedBlackMap<string, number>()
      m.set('c', 3)
      m.set('a', 1)
      m.set('b', 2)
      expect(m.keys()).toEqual(['a', 'b', 'c'])
    })

    it('handles duplicate keys in initial entries', () => {
      const m = new RedBlackMap<number, string>([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
      ])
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe('c')
    })
  })

  describe('set / get', () => {
    it('sets and gets a single entry', () => {
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('sets and gets multiple entries', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
      expect(map.get(3)).toBe('three')
    })

    it('overwrites existing key value', () => {
      map.set(1, 'one')
      map.set(1, 'updated')
      expect(map.get(1)).toBe('updated')
      expect(map.size).toBe(1)
    })

    it('returns undefined for non-existent key', () => {
      expect(map.get(99)).toBeUndefined()
    })

    it('returns undefined when map is empty', () => {
      expect(map.get(1)).toBeUndefined()
    })

    it('handles object values', () => {
      const objMap = new RedBlackMap<number, { name: string }>()
      objMap.set(1, { name: 'test' })
      expect(objMap.get(1)!.name).toBe('test')
    })

    it('handles null values', () => {
      const nullMap = new RedBlackMap<number, string | null>()
      nullMap.set(1, null)
      expect(nullMap.get(1)).toBeNull()
    })

    it('handles undefined values', () => {
      const undefMap = new RedBlackMap<number, string | undefined>()
      undefMap.set(1, undefined)
      expect(undefMap.get(1)).toBeUndefined()
      expect(undefMap.has(1)).toBe(true)
    })

    it('preserves size after overwrite', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(1, 'c')
      expect(map.size).toBe(2)
    })

    it('sets keys in reverse order', () => {
      map.set(3, 'c')
      map.set(2, 'b')
      map.set(1, 'a')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('sets keys with large gaps', () => {
      map.set(1000, 'a')
      map.set(1, 'b')
      map.set(500, 'c')
      expect(map.keys()).toEqual([1, 500, 1000])
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for non-existent key', () => {
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })

    it('returns false on empty map', () => {
      expect(map.has(1)).toBe(false)
    })

    it('returns true after overwrite', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.has(1)).toBe(true)
    })

    it('returns false after deletion', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes a leaf node', () => {
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get(1)).toBeUndefined()
    })

    it('deletes an internal node', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      map.set(3, 'three')
      expect(map.delete(2)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.get(2)).toBeUndefined()
      expect(map.get(1)).toBe('one')
      expect(map.get(3)).toBe('three')
    })

    it('returns false for non-existent key', () => {
      expect(map.delete(99)).toBe(false)
    })

    it('returns false on empty map', () => {
      expect(map.delete(1)).toBe(false)
    })

    it('deletes root with one child', () => {
      map.set(2, 'two')
      map.set(1, 'one')
      expect(map.delete(2)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('one')
    })

    it('deletes all entries', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      for (let i = 1; i <= 10; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('deletes alternating entries', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      for (let i = 1; i <= 10; i += 2) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size).toBe(5)
      for (let i = 2; i <= 10; i += 2) {
        expect(map.has(i)).toBe(true)
      }
      for (let i = 1; i <= 10; i += 2) {
        expect(map.has(i)).toBe(false)
      }
    })

    it('maintains sorted order after deletions', () => {
      for (let i = 1; i <= 20; i++) map.set(i, String(i))
      for (let i = 5; i <= 15; i++) map.delete(i)
      const keys = map.keys()
      expect(isSorted(keys)).toBe(true)
      expect(keys).toEqual([1, 2, 3, 4, 16, 17, 18, 19, 20])
    })

    it('handles delete after overwrite', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.delete(1)).toBe(true)
      expect(map.size).toBe(0)
    })
  })

  describe('min / max', () => {
    it('returns undefined for empty map', () => {
      expect(map.min()).toBeUndefined()
      expect(map.max()).toBeUndefined()
    })

    it('returns min and max for single entry', () => {
      map.set(5, 'five')
      expect(map.min()).toEqual([5, 'five'])
      expect(map.max()).toEqual([5, 'five'])
    })

    it('returns correct min and max after multiple sets', () => {
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      map.set(1, 'one')
      map.set(10, 'ten')
      expect(map.min()).toEqual([1, 'one'])
      expect(map.max()).toEqual([10, 'ten'])
    })

    it('updates min after deleting min key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(1)
      expect(map.min()).toEqual([2, 'two'])
    })

    it('updates max after deleting max key', () => {
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.delete(3)
      expect(map.max()).toEqual([2, 'two'])
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty map', () => {
      expect(map.lowerBound(1)).toBeUndefined()
    })

    it('returns exact key when present', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.lowerBound(3)).toEqual([3, 'c'])
    })

    it('returns next greater key when exact not present', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.lowerBound(2)).toEqual([3, 'c'])
    })

    it('returns undefined when all keys are less', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.lowerBound(10)).toBeUndefined()
    })

    it('returns smallest key for lowerBound of min', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.lowerBound(0)).toEqual([1, 'a'])
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty map', () => {
      expect(map.upperBound(1)).toBeUndefined()
    })

    it('returns next greater key when exact present', () => {
      map.set(1, 'a')
      map.set(3, 'c')
      map.set(5, 'e')
      expect(map.upperBound(3)).toEqual([5, 'e'])
    })

    it('returns next greater when exact not present', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.upperBound(2)).toEqual([5, 'e'])
    })

    it('returns undefined when all keys are less or equal', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.upperBound(5)).toBeUndefined()
    })
  })

  describe('floor', () => {
    it('returns undefined for empty map', () => {
      expect(map.floor(1)).toBeUndefined()
    })

    it('returns exact key when present', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.floor(5)).toEqual([5, 'e'])
    })

    it('returns largest key less than target', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.floor(7)).toEqual([5, 'e'])
    })

    it('returns undefined when all keys are greater', () => {
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.floor(3)).toBeUndefined()
    })

    it('returns max key for floor of large value', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.floor(100)).toEqual([5, 'e'])
    })
  })

  describe('ceil', () => {
    it('returns undefined for empty map', () => {
      expect(map.ceil(1)).toBeUndefined()
    })

    it('returns exact key when present', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.ceil(5)).toEqual([5, 'e'])
    })

    it('returns smallest key greater than target', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.ceil(3)).toEqual([5, 'e'])
    })

    it('returns undefined when all keys are less', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      expect(map.ceil(10)).toBeUndefined()
    })

    it('returns min key for ceil of small value', () => {
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.ceil(0)).toEqual([5, 'e'])
    })
  })

  describe('size / isEmpty', () => {
    it('size is 0 for new map', () => {
      expect(map.size).toBe(0)
    })

    it('isEmpty returns true for new map', () => {
      expect(map.isEmpty()).toBe(true)
    })

    it('size increments on set', () => {
      map.set(1, 'a')
      expect(map.size).toBe(1)
      map.set(2, 'b')
      expect(map.size).toBe(2)
    })

    it('size does not change on overwrite', () => {
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size).toBe(1)
    })

    it('size decrements on delete', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      expect(map.size).toBe(1)
    })

    it('isEmpty returns false after set', () => {
      map.set(1, 'a')
      expect(map.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after deleting all', () => {
      map.set(1, 'a')
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('clears non-empty map', () => {
      for (let i = 0; i < 10; i++) map.set(i, String(i))
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.get(5)).toBeUndefined()
    })

    it('allows operations after clear', () => {
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('b')
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
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('values returns values in key order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('entries returns sorted entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('returns snapshot (not affected by later mutations)', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const keys = map.keys()
      const vals = map.values()
      const ents = map.entries()
      map.set(3, 'c')
      expect(keys).toEqual([1, 2])
      expect(vals).toEqual(['a', 'b'])
      expect(ents).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('returns same as entries', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.toArray()).toEqual(map.entries())
    })

    it('returns sorted entries', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      expect(map.toArray()).toEqual([
        [1, 'a'],
        [3, 'c'],
      ])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates all entries in order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const result: string[] = []
      map.forEach((v, k) => {
        result.push(`${k}:${v}`)
      })
      expect(result).toEqual(['1:a', '2:b', '3:c'])
    })

    it('passes map as third argument', () => {
      map.set(1, 'a')
      let received: RedBlackMap<number, string> | undefined
      map.forEach((_v, _k, m) => {
        received = m
      })
      expect(received).toBe(map)
    })

    it('iterates correct number of times', () => {
      for (let i = 0; i < 5; i++) map.set(i, String(i))
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(5)
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const result: [number, string][] = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([])
    })

    it('iterates entries in order', () => {
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const result: [number, string][] = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('works with spread operator', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const result = [...map]
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })

    it('works with Array.from', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      const result = Array.from(map)
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })
  })

  describe('clone', () => {
    it('clones empty map', () => {
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones all entries', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const cloned = map.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.get(1)).toBe('a')
      expect(cloned.get(2)).toBe('b')
      expect(cloned.get(3)).toBe('c')
    })

    it('clone is independent of original', () => {
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(2, 'b')
      expect(map.size).toBe(1)
      expect(cloned.size).toBe(2)
      expect(map.has(2)).toBe(false)
    })

    it('clone preserves comparator', () => {
      const cmp: CompareFunction<string> = (a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      const original = new RedBlackMap<string, number>(undefined, { compare: cmp })
      original.set('A', 1)
      const cloned = original.clone()
      cloned.set('a', 2)
      expect(cloned.size).toBe(1)
      expect(cloned.get('A')).toBe(2)
    })
  })

  describe('rangeEntries', () => {
    it('returns empty for empty map', () => {
      expect(map.rangeEntries(1, 5)).toEqual([])
    })

    it('returns entries within range', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      const result = map.rangeEntries(3, 7)
      expect(result).toEqual([
        [3, '3'],
        [4, '4'],
        [5, '5'],
        [6, '6'],
        [7, '7'],
      ])
    })

    it('returns empty when from > to', () => {
      map.set(1, 'a')
      expect(map.rangeEntries(5, 3)).toEqual([])
    })

    it('returns single entry when from equals to', () => {
      map.set(5, 'five')
      expect(map.rangeEntries(5, 5)).toEqual([[5, 'five']])
    })

    it('returns empty when range has no matching keys', () => {
      map.set(1, 'a')
      map.set(10, 'j')
      expect(map.rangeEntries(3, 7)).toEqual([])
    })

    it('returns partial range at boundaries', () => {
      for (let i = 1; i <= 10; i++) map.set(i, String(i))
      expect(map.rangeEntries(0, 3)).toEqual([
        [1, '1'],
        [2, '2'],
        [3, '3'],
      ])
      expect(map.rangeEntries(8, 15)).toEqual([
        [8, '8'],
        [9, '9'],
        [10, '10'],
      ])
    })
  })

  describe('static fromEntries', () => {
    it('creates map from entries', () => {
      const m = RedBlackMap.fromEntries<number, string>([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(m.size).toBe(3)
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('creates map from empty entries', () => {
      const m = RedBlackMap.fromEntries<number, string>([])
      expect(m.size).toBe(0)
    })

    it('creates map with custom comparator', () => {
      const cmp: CompareFunction<string> = (a, b) => b.localeCompare(a)
      const m = RedBlackMap.fromEntries<string, number>(
        [
          ['a', 1],
          ['b', 2],
        ],
        { compare: cmp },
      )
      expect(m.keys()).toEqual(['b', 'a'])
    })
  })

  describe('static fromKeys', () => {
    it('creates map from keys', () => {
      const m = RedBlackMap.fromKeys<number>([3, 1, 2])
      expect(m.size).toBe(3)
      expect(m.get(1)).toBe(1)
      expect(m.get(2)).toBe(2)
      expect(m.get(3)).toBe(3)
    })

    it('creates map from empty keys', () => {
      const m = RedBlackMap.fromKeys<number>([])
      expect(m.size).toBe(0)
    })

    it('creates map with custom comparator', () => {
      const cmp: CompareFunction<string> = (a, b) => b.localeCompare(a)
      const m = RedBlackMap.fromKeys<string>(['a', 'b'], { compare: cmp })
      expect(m.keys()).toEqual(['b', 'a'])
    })

    it('deduplicates keys', () => {
      const m = RedBlackMap.fromKeys<number>([1, 2, 1, 3, 2])
      expect(m.size).toBe(3)
    })
  })

  describe('tree balancing - stress tests', () => {
    it('maintains sorted order for sequential insertions', () => {
      for (let i = 0; i < 100; i++) map.set(i, String(i))
      const keys = map.keys()
      expect(isSorted(keys)).toBe(true)
      expect(keys.length).toBe(100)
    })

    it('maintains sorted order for reverse sequential insertions', () => {
      for (let i = 99; i >= 0; i--) map.set(i, String(i))
      const keys = map.keys()
      expect(isSorted(keys)).toBe(true)
      expect(keys.length).toBe(100)
    })

    it('handles random insertions', () => {
      const nums = Array.from({ length: 100 }, (_, i) => i)
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[nums[i]!, nums[j]!] = [nums[j]!, nums[i]!]
      }
      for (const n of nums) map.set(n, String(n))
      const keys = map.keys()
      expect(isSorted(keys)).toBe(true)
      expect(keys.length).toBe(100)
    })

    it('maintains invariants after sequential deletions', () => {
      for (let i = 0; i < 50; i++) map.set(i, String(i))
      for (let i = 0; i < 50; i++) {
        map.delete(i)
        verifyRBProperties(map)
      }
      expect(map.size).toBe(0)
    })

    it('maintains invariants after reverse deletions', () => {
      for (let i = 0; i < 50; i++) map.set(i, String(i))
      for (let i = 49; i >= 0; i--) {
        map.delete(i)
        verifyRBProperties(map)
      }
      expect(map.size).toBe(0)
    })

    it('handles mixed insert and delete', () => {
      for (let i = 0; i < 50; i++) map.set(i, String(i))
      for (let i = 0; i < 25; i++) map.delete(i)
      for (let i = 50; i < 75; i++) map.set(i, String(i))
      expect(map.size).toBe(50)
      const keys = map.keys()
      expect(isSorted(keys)).toBe(true)
    })

    it('handles delete of non-existent keys in non-empty map', () => {
      for (let i = 0; i < 10; i += 2) map.set(i, String(i))
      for (let i = 1; i < 10; i += 2) {
        expect(map.delete(i)).toBe(false)
      }
      expect(map.size).toBe(5)
    })

    it('handles large batch insertions and deletions', () => {
      for (let i = 0; i < 500; i++) map.set(i, String(i))
      expect(map.size).toBe(500)
      for (let i = 0; i < 500; i += 2) map.delete(i)
      expect(map.size).toBe(250)
      const keys = map.keys()
      expect(isSorted(keys)).toBe(true)
      for (const k of keys) {
        expect(k % 2).toBe(1)
      }
    })
  })

  describe('custom comparator', () => {
    it('supports reverse ordering', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new RedBlackMap<number, string>(undefined, { compare: cmp })
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.keys()).toEqual([3, 2, 1])
      expect(m.min()).toEqual([3, 'c'])
      expect(m.max()).toEqual([1, 'a'])
    })

    it('supports string keys with custom comparator', () => {
      const m = new RedBlackMap<string, number>(undefined, {
        compare: (a, b) => a.length - b.length || a.localeCompare(b),
      })
      m.set('aa', 1)
      m.set('b', 2)
      m.set('ccc', 3)
      m.set('dd', 4)
      expect(m.keys()).toEqual(['b', 'aa', 'dd', 'ccc'])
    })

    it('custom comparator with floor', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new RedBlackMap<number, string>(undefined, { compare: cmp })
      m.set(10, 'a')
      m.set(20, 'b')
      m.set(30, 'c')
      expect(m.floor(25)).toEqual([30, 'c'])
    })

    it('custom comparator with ceil', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new RedBlackMap<number, string>(undefined, { compare: cmp })
      m.set(10, 'a')
      m.set(20, 'b')
      m.set(30, 'c')
      expect(m.ceil(25)).toEqual([20, 'b'])
    })

    it('custom comparator with rangeEntries', () => {
      const cmp: CompareFunction<number> = (a, b) => b - a
      const m = new RedBlackMap<number, string>(undefined, { compare: cmp })
      m.set(10, 'a')
      m.set(20, 'b')
      m.set(30, 'c')
      const result = m.rangeEntries(25, 10)
      expect(result).toEqual([
        [20, 'b'],
        [10, 'a'],
      ])
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      map.set(-1, 'neg')
      map.set(0, 'zero')
      map.set(1, 'pos')
      expect(map.keys()).toEqual([-1, 0, 1])
      expect(map.min()).toEqual([-1, 'neg'])
      expect(map.max()).toEqual([1, 'pos'])
    })

    it('handles floating point keys', () => {
      map.set(1.5, 'a')
      map.set(2.5, 'b')
      map.set(0.5, 'c')
      expect(map.keys()).toEqual([0.5, 1.5, 2.5])
    })

    it('handles string keys', () => {
      const m = new RedBlackMap<string, number>()
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles array value types', () => {
      const m = new RedBlackMap<number, number[]>()
      m.set(1, [1, 2, 3])
      m.set(2, [4, 5, 6])
      expect(m.get(1)).toEqual([1, 2, 3])
    })

    it('handles map value types', () => {
      const m = new RedBlackMap<number, Map<string, number>>()
      m.set(1, new Map([['a', 1]]))
      expect(m.get(1)!.get('a')).toBe(1)
    })

    it('handles boolean value types', () => {
      const m = new RedBlackMap<string, boolean>()
      m.set('a', true)
      m.set('b', false)
      expect(m.get('a')).toBe(true)
      expect(m.get('b')).toBe(false)
    })

    it('handles single element operations', () => {
      map.set(42, 'answer')
      expect(map.min()).toEqual([42, 'answer'])
      expect(map.max()).toEqual([42, 'answer'])
      expect(map.lowerBound(42)).toEqual([42, 'answer'])
      expect(map.upperBound(41)).toEqual([42, 'answer'])
      expect(map.floor(42)).toEqual([42, 'answer'])
      expect(map.ceil(42)).toEqual([42, 'answer'])
      expect(map.rangeEntries(42, 42)).toEqual([[42, 'answer']])
    })
  })

  describe('lowerBound / upperBound / floor / ceil interactions', () => {
    beforeEach(() => {
      map.set(10, 'a')
      map.set(20, 'b')
      map.set(30, 'c')
      map.set(40, 'd')
      map.set(50, 'e')
    })

    it('lowerBound vs ceil for existing key', () => {
      expect(map.lowerBound(30)).toEqual([30, 'c'])
      expect(map.ceil(30)).toEqual([30, 'c'])
    })

    it('lowerBound vs ceil for gap key', () => {
      expect(map.lowerBound(25)).toEqual([30, 'c'])
      expect(map.ceil(25)).toEqual([30, 'c'])
    })

    it('floor vs lowerBound for existing key', () => {
      expect(map.floor(30)).toEqual([30, 'c'])
      expect(map.lowerBound(30)).toEqual([30, 'c'])
    })

    it('floor vs lowerBound for gap key', () => {
      expect(map.floor(25)).toEqual([20, 'b'])
      expect(map.lowerBound(25)).toEqual([30, 'c'])
    })

    it('upperBound vs ceil differ at existing key', () => {
      expect(map.upperBound(30)).toEqual([40, 'd'])
      expect(map.ceil(30)).toEqual([30, 'c'])
    })

    it('upperBound vs ceil same for gap key', () => {
      expect(map.upperBound(25)).toEqual([30, 'c'])
      expect(map.ceil(25)).toEqual([30, 'c'])
    })
  })

  describe('delete edge cases', () => {
    it('delete root with two children', () => {
      map.set(10, 'a')
      map.set(5, 'b')
      map.set(15, 'c')
      expect(map.delete(10)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.keys()).toEqual([5, 15])
    })

    it('delete root with left child only', () => {
      map.set(10, 'a')
      map.set(5, 'b')
      expect(map.delete(10)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.get(5)).toBe('b')
    })

    it('delete root with right child only', () => {
      map.set(10, 'a')
      map.set(15, 'b')
      expect(map.delete(10)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.get(15)).toBe('b')
    })

    it('delete only node', () => {
      map.set(1, 'a')
      expect(map.delete(1)).toBe(true)
      expect(map.isEmpty()).toBe(true)
      expect(map.keys()).toEqual([])
    })

    it('delete left leaf', () => {
      map.set(10, 'a')
      map.set(5, 'b')
      map.set(15, 'c')
      expect(map.delete(5)).toBe(true)
      expect(map.keys()).toEqual([10, 15])
    })

    it('delete right leaf', () => {
      map.set(10, 'a')
      map.set(5, 'b')
      map.set(15, 'c')
      expect(map.delete(15)).toBe(true)
      expect(map.keys()).toEqual([5, 10])
    })
  })

  describe('rangeEntries edge cases', () => {
    it('returns all entries for wide range', () => {
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.rangeEntries(0, 10)).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('returns nothing for range between keys', () => {
      map.set(1, 'a')
      map.set(10, 'j')
      expect(map.rangeEntries(3, 7)).toEqual([])
    })

    it('inclusive on both ends', () => {
      map.set(1, 'a')
      map.set(5, 'e')
      map.set(10, 'j')
      expect(map.rangeEntries(1, 10)).toEqual([
        [1, 'a'],
        [5, 'e'],
        [10, 'j'],
      ])
    })
  })

  describe('iteration stability', () => {
    it('forEach after delete maintains order', () => {
      for (let i = 1; i <= 5; i++) map.set(i, String(i))
      map.delete(3)
      const result: string[] = []
      map.forEach((v) => result.push(v))
      expect(result).toEqual(['1', '2', '4', '5'])
    })

    it('entries after clear and re-insert', () => {
      for (let i = 1; i <= 3; i++) map.set(i, String(i))
      map.clear()
      for (let i = 10; i <= 12; i++) map.set(i, String(i))
      expect(map.entries()).toEqual([
        [10, '10'],
        [11, '11'],
        [12, '12'],
      ])
    })
  })

  describe('type exports', () => {
    it('CompareFunction type is usable', () => {
      const cmp: CompareFunction<number> = (a, b) => a - b
      expect(cmp(1, 2)).toBe(-1)
    })

    it('RedBlackMapOptions type is usable', () => {
      const opts: RedBlackMapOptions<number> = {
        compare: (a, b) => a - b,
      }
      const m = new RedBlackMap<number, string>(undefined, opts)
      m.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })
  })
})
