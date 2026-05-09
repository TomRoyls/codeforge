import { describe, it, expect } from 'vitest'
import { SortedMap } from '../../src/core/sorted-map/sorted-map.js'

function assertBalanced<K, V>(m: SortedMap<K, V>): void {
  const stats = m.stats()
  if (stats.size === 0) {
    expect(stats.height).toBe(0)
    expect(stats.isBalanced).toBe(true)
    return
  }
  expect(stats.height).toBeGreaterThan(0)
  expect(stats.isBalanced).toBe(true)
  expect(stats.height).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(stats.size + 2)))
}

function assertOrdered<K, V>(m: SortedMap<K, V>): void {
  const keys = m.keys()
  for (let i = 1; i < keys.length; i++) {
    expect(keys[i]! > keys[i - 1]!).toBe(true)
  }
}

describe('SortedMap', () => {
  describe('construction', () => {
    it('should create empty map with no arguments', () => {
      const m = new SortedMap<number, string>()
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom comparator function', () => {
      const m = new SortedMap<number, string>((a, b) => b - a)
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.keys()).toEqual([3, 2, 1])
    })

    it('should accept options object with compare', () => {
      const m = new SortedMap<number, string>({ compare: (a, b) => b - a })
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([2, 1])
    })

    it('should accept empty options object', () => {
      const m = new SortedMap<number, string>({})
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should work with string keys by default', () => {
      const m = new SortedMap<string, number>()
      m.set('cherry', 3)
      m.set('apple', 1)
      m.set('banana', 2)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should accept string comparator', () => {
      const m = new SortedMap<string, number>((a, b) => a.localeCompare(b))
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('set/get/delete/has', () => {
    it('should set and get values', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
      expect(m.get(3)).toBe('three')
    })

    it('should return undefined for missing key', () => {
      const m = new SortedMap<number, string>()
      expect(m.get(1)).toBeUndefined()
    })

    it('should overwrite duplicate keys', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'old')
      m.set(1, 'new')
      expect(m.get(1)).toBe('new')
      expect(m.size).toBe(1)
    })

    it('should handle string keys with default comparator', () => {
      const m = new SortedMap<string, number>()
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      expect(m.get('a')).toBe(1)
      expect(m.get('c')).toBe(3)
    })

    it('should handle many insertions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(i, i * 10)
      }
      expect(m.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(m.get(i)).toBe(i * 10)
      }
    })

    it('should handle reverse order insertion', () => {
      const m = new SortedMap<number, string>()
      for (let i = 100; i >= 0; i--) {
        m.set(i, `v${i}`)
      }
      expect(m.size).toBe(101)
      expect(m.get(0)).toBe('v0')
      expect(m.get(100)).toBe('v100')
    })

    it('should handle negative keys', () => {
      const m = new SortedMap<number, string>()
      m.set(-3, 'neg3')
      m.set(0, 'zero')
      m.set(5, 'pos5')
      expect(m.get(-3)).toBe('neg3')
      expect(m.get(0)).toBe('zero')
      expect(m.get(5)).toBe('pos5')
    })

    it('should handle inserting same key multiple times', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(1, 'b')
      m.set(1, 'c')
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe('c')
    })

    it('should return true for has on existing key', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'one')
      expect(m.has(1)).toBe(true)
    })

    it('should return false for has on missing key', () => {
      const m = new SortedMap<number, string>()
      expect(m.has(1)).toBe(false)
    })

    it('should return false for has after delete', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'one')
      m.delete(1)
      expect(m.has(1)).toBe(false)
    })

    it('should delete existing key and return true', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.delete(1)).toBe(true)
      expect(m.size).toBe(1)
      expect(m.has(1)).toBe(false)
    })

    it('should return false when deleting missing key', () => {
      const m = new SortedMap<number, string>()
      expect(m.delete(1)).toBe(false)
    })

    it('should handle deleting all entries', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(2)
      m.delete(1)
      m.delete(3)
      expect(m.isEmpty()).toBe(true)
    })

    it('should maintain order after deletions', () => {
      const m = new SortedMap<number, string>()
      for (let i = 0; i < 20; i++) m.set(i, `v${i}`)
      m.delete(5)
      m.delete(10)
      m.delete(15)
      expect(m.size).toBe(17)
      assertOrdered(m)
    })

    it('should handle deleting root', () => {
      const m = new SortedMap<number, string>()
      m.set(2, 'root')
      m.set(1, 'left')
      m.set(3, 'right')
      m.delete(2)
      expect(m.size).toBe(2)
      expect(m.has(1)).toBe(true)
      expect(m.has(3)).toBe(true)
    })

    it('should handle deleting leaf', () => {
      const m = new SortedMap<number, string>()
      m.set(2, 'root')
      m.set(1, 'leaf')
      m.delete(1)
      expect(m.size).toBe(1)
      expect(m.get(2)).toBe('root')
    })

    it('should handle deleting only element', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'only')
      m.delete(1)
      expect(m.isEmpty()).toBe(true)
      expect(m.size).toBe(0)
    })

    it('should handle delete from empty map', () => {
      const m = new SortedMap<number, string>()
      expect(m.delete(1)).toBe(false)
      expect(m.size).toBe(0)
    })

    it('should handle set-delete-set cycle', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.delete(1)
      m.set(1, 'b')
      expect(m.get(1)).toBe('b')
      expect(m.size).toBe(1)
    })

    it('should handle delete with successor replacement', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      m.set(6, 'six')
      m.set(8, 'eight')
      m.delete(5)
      expect(m.size).toBe(4)
      expect(m.has(3)).toBe(true)
      expect(m.has(6)).toBe(true)
      expect(m.has(7)).toBe(true)
      expect(m.has(8)).toBe(true)
    })
  })

  describe('first/last', () => {
    it('should return first entry (min key)', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      expect(m.first()).toEqual([3, 'three'])
    })

    it('should return last entry (max key)', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      expect(m.last()).toEqual([7, 'seven'])
    })

    it('should return undefined for first on empty map', () => {
      const m = new SortedMap<number, string>()
      expect(m.first()).toBeUndefined()
    })

    it('should return undefined for last on empty map', () => {
      const m = new SortedMap<number, string>()
      expect(m.last()).toBeUndefined()
    })

    it('should return same entry for first and last on single entry map', () => {
      const m = new SortedMap<number, string>()
      m.set(42, 'answer')
      expect(m.first()).toEqual([42, 'answer'])
      expect(m.last()).toEqual([42, 'answer'])
    })

    it('should update first after deletion', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(1)
      expect(m.first()).toEqual([2, 'b'])
    })

    it('should update last after deletion', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(3)
      expect(m.last()).toEqual([2, 'b'])
    })

    it('should handle first/last with string keys', () => {
      const m = new SortedMap<string, number>()
      m.set('cherry', 3)
      m.set('apple', 1)
      m.set('banana', 2)
      expect(m.first()).toEqual(['apple', 1])
      expect(m.last()).toEqual(['cherry', 3])
    })
  })

  describe('lowerBound/upperBound', () => {
    it('should find exact key with lowerBound', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(3)).toEqual([3, 'c'])
    })

    it('should find next greater key with lowerBound', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(2)).toEqual([3, 'c'])
    })

    it('should return undefined from lowerBound if all keys smaller', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.lowerBound(5)).toBeUndefined()
    })

    it('should return undefined from lowerBound for empty map', () => {
      const m = new SortedMap<number, string>()
      expect(m.lowerBound(1)).toBeUndefined()
    })

    it('should return smallest key when lowerBound searching below min', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(1)).toEqual([5, 'e'])
    })

    it('should find exact min key with lowerBound', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(5)).toEqual([5, 'e'])
    })

    it('should find next greater key with upperBound', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.upperBound(3)).toEqual([5, 'e'])
    })

    it('should find next key from upperBound even if exact match exists', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      expect(m.upperBound(1)).toEqual([5, 'e'])
    })

    it('should return undefined from upperBound if no greater key', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.upperBound(5)).toBeUndefined()
    })

    it('should return undefined from upperBound for empty map', () => {
      const m = new SortedMap<number, string>()
      expect(m.upperBound(1)).toBeUndefined()
    })

    it('should return undefined from upperBound at max key', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      expect(m.upperBound(5)).toBeUndefined()
    })

    it('should correctly bound around a gap', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(3)).toEqual([5, 'e'])
      expect(m.upperBound(3)).toEqual([5, 'e'])
    })

    it('should handle boundary correctly', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(5)).toEqual([5, 'e'])
      expect(m.upperBound(5)).toEqual([10, 'j'])
    })
  })

  describe('range queries', () => {
    it('should return entries in range', () => {
      const m = new SortedMap<number, string>()
      for (let i = 0; i < 10; i++) m.set(i, `v${i}`)
      const r = m.range(3, 7)
      expect(r).toEqual([
        [3, 'v3'],
        [4, 'v4'],
        [5, 'v5'],
        [6, 'v6'],
        [7, 'v7'],
      ])
    })

    it('should return empty for no matches', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(10, 'b')
      expect(m.range(3, 5)).toEqual([])
    })

    it('should handle full range', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.range(1, 3)).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should return empty for inverted range', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.range(5, 1)).toEqual([])
    })

    it('should handle single element range', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.range(2, 2)).toEqual([[2, 'b']])
    })

    it('should handle range on empty map', () => {
      const m = new SortedMap<number, string>()
      expect(m.range(1, 5)).toEqual([])
    })

    it('should handle range at boundaries', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.range(0, 11)).toEqual([
        [1, 'a'],
        [5, 'e'],
        [10, 'j'],
      ])
    })

    it('should handle range with no matching keys in gap', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(10, 'j')
      expect(m.range(3, 5)).toEqual([])
    })

    it('should handle range that partially overlaps', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.range(3, 7)).toEqual([[5, 'e']])
    })

    it('should handle range outside tree keys', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      m.set(15, 'o')
      expect(m.range(0, 4)).toEqual([])
      expect(m.range(16, 20)).toEqual([])
    })

    it('should handle range covering all keys', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      m.set(15, 'o')
      expect(m.range(0, 20)).toEqual([
        [5, 'e'],
        [10, 'j'],
        [15, 'o'],
      ])
    })
  })

  describe('iteration', () => {
    it('forEach should iterate all entries in order', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      const result: [number, string][] = []
      m.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('forEach should not iterate empty map', () => {
      const m = new SortedMap<number, string>()
      let count = 0
      m.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('forEach should iterate single element', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      const result: [number, string][] = []
      m.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([[1, 'a']])
    })

    it('forEach should pass value first then key', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      const results: string[] = []
      m.forEach((value, key) => {
        results.push(`${key}:${value}`)
      })
      expect(results).toEqual(['1:one', '2:two'])
    })

    it('entries should return sorted entries', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('keys should return sorted keys', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('values should return values in key order', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.values()).toEqual(['a', 'b', 'c'])
    })

    it('entries, keys, values should return empty arrays for empty map', () => {
      const m = new SortedMap<number, string>()
      expect(m.entries()).toEqual([])
      expect(m.keys()).toEqual([])
      expect(m.values()).toEqual([])
    })

    it('should iterate with Symbol.iterator in order', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      const result = [...m]
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should iterate empty map', () => {
      const m = new SortedMap<number, string>()
      const result = [...m]
      expect(result).toEqual([])
    })

    it('should work with for of', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const keys: number[] = []
      for (const [k] of m) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2])
    })

    it('should work with destructuring in iterator', () => {
      const m = new SortedMap<string, number>()
      m.set('x', 1)
      m.set('y', 2)
      const keys: string[] = []
      const vals: number[] = []
      for (const [k, v] of m) {
        keys.push(k)
        vals.push(v)
      }
      expect(keys).toEqual(['x', 'y'])
      expect(vals).toEqual([1, 2])
    })
  })

  describe('size/isEmpty', () => {
    it('should track size through operations', () => {
      const m = new SortedMap<number, string>()
      expect(m.size).toBe(0)
      m.set(1, 'a')
      expect(m.size).toBe(1)
      m.set(2, 'b')
      expect(m.size).toBe(2)
      m.set(1, 'updated')
      expect(m.size).toBe(2)
      m.delete(1)
      expect(m.size).toBe(1)
      m.delete(999)
      expect(m.size).toBe(1)
      m.clear()
      expect(m.size).toBe(0)
    })

    it('isEmpty should reflect state', () => {
      const m = new SortedMap<number, string>()
      expect(m.isEmpty()).toBe(true)
      m.set(1, 'a')
      expect(m.isEmpty()).toBe(false)
      m.delete(1)
      expect(m.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.clear()
      expect(m.isEmpty()).toBe(true)
      expect(m.size).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.clear()
      m.set(2, 'b')
      expect(m.size).toBe(1)
      expect(m.get(2)).toBe('b')
    })

    it('should clear empty map without error', () => {
      const m = new SortedMap<number, string>()
      m.clear()
      expect(m.isEmpty()).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const c = m.clone()
      expect(c.size).toBe(2)
      expect(c.get(1)).toBe('a')
      c.set(3, 'c')
      expect(m.size).toBe(2)
      expect(c.size).toBe(3)
    })

    it('should clone empty map', () => {
      const m = new SortedMap<number, string>()
      const c = m.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const m = new SortedMap<number, string>((a, b) => b - a)
      m.set(1, 'a')
      m.set(2, 'b')
      const c = m.clone()
      c.set(3, 'c')
      expect(c.keys()).toEqual([3, 2, 1])
    })

    it('should not affect original when modifying clone', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      const c = m.clone()
      c.delete(2)
      c.set(4, 'd')
      expect(m.size).toBe(3)
      expect(m.has(2)).toBe(true)
      expect(m.has(4)).toBe(false)
      expect(c.size).toBe(3)
      expect(c.has(2)).toBe(false)
      expect(c.has(4)).toBe(true)
    })

    it('should not affect clone when modifying original', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const c = m.clone()
      m.delete(1)
      expect(c.has(1)).toBe(true)
      expect(c.size).toBe(2)
    })
  })

  describe('from factory', () => {
    it('should create map from entries', () => {
      const m = SortedMap.from([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(m.size).toBe(3)
      expect(m.get(1)).toBe('a')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should handle empty entries', () => {
      const m = SortedMap.from<number, string>([])
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const m = SortedMap.from(
        [
          [1, 'a'],
          [2, 'b'],
        ],
        (a, b) => b - a,
      )
      expect(m.keys()).toEqual([2, 1])
    })

    it('should accept options object', () => {
      const m = SortedMap.from(
        [
          [1, 'a'],
          [2, 'b'],
        ],
        { compare: (a, b) => b - a },
      )
      expect(m.keys()).toEqual([2, 1])
    })

    it('should handle duplicate keys in entries', () => {
      const m = SortedMap.from([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
      ])
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe('c')
    })

    it('should handle large number of entries', () => {
      const entries: [number, string][] = []
      for (let i = 0; i < 200; i++) entries.push([i, `v${i}`])
      const m = SortedMap.from(entries)
      expect(m.size).toBe(200)
      assertBalanced(m)
    })

    it('should handle reverse sorted entries', () => {
      const entries: [number, string][] = []
      for (let i = 200; i >= 0; i--) entries.push([i, `v${i}`])
      const m = SortedMap.from(entries)
      expect(m.size).toBe(201)
      assertBalanced(m)
      expect(m.keys()[0]).toBe(0)
      expect(m.keys()[200]).toBe(200)
    })
  })

  describe('set operations', () => {
    it('union should combine two maps', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      const b = new SortedMap<number, string>()
      b.set(2, 'b2')
      b.set(3, 'b3')
      const u = a.union(b)
      expect(u.size).toBe(3)
      expect(u.get(1)).toBe('a1')
      expect(u.get(2)).toBe('b2')
      expect(u.get(3)).toBe('b3')
    })

    it('union should not modify original maps', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      const b = new SortedMap<number, string>()
      b.set(2, 'b2')
      a.union(b)
      expect(a.size).toBe(1)
      expect(b.size).toBe(1)
    })

    it('union of map with itself should return clone', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      const u = a.union(a)
      expect(u.size).toBe(2)
      expect(u.get(1)).toBe('a1')
    })

    it('union with empty map should return clone', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      const b = new SortedMap<number, string>()
      const u = a.union(b)
      expect(u.size).toBe(1)
      expect(u.get(1)).toBe('a1')
    })

    it('union of two empty maps should return empty', () => {
      const a = new SortedMap<number, string>()
      const b = new SortedMap<number, string>()
      expect(a.union(b).isEmpty()).toBe(true)
    })

    it('union should produce sorted result', () => {
      const a = new SortedMap<number, string>()
      a.set(5, 'e')
      a.set(1, 'a')
      const b = new SortedMap<number, string>()
      b.set(3, 'c')
      b.set(7, 'g')
      const u = a.union(b)
      expect(u.keys()).toEqual([1, 3, 5, 7])
    })

    it('intersection should return common keys', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      a.set(3, 'a3')
      const b = new SortedMap<number, string>()
      b.set(2, 'b2')
      b.set(3, 'b3')
      b.set(4, 'b4')
      const inter = a.intersection(b)
      expect(inter.size).toBe(2)
      expect(inter.has(2)).toBe(true)
      expect(inter.has(3)).toBe(true)
      expect(inter.has(1)).toBe(false)
      expect(inter.has(4)).toBe(false)
    })

    it('intersection should keep values from first map', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      const b = new SortedMap<number, string>()
      b.set(2, 'b2')
      const inter = a.intersection(b)
      expect(inter.get(2)).toBe('a2')
    })

    it('intersection of map with itself should return clone', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      const inter = a.intersection(a)
      expect(inter.size).toBe(2)
      expect(inter.get(1)).toBe('a1')
    })

    it('intersection with empty map should return empty', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      const b = new SortedMap<number, string>()
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('intersection of disjoint maps should return empty', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      const b = new SortedMap<number, string>()
      b.set(2, 'b2')
      expect(a.intersection(b).isEmpty()).toBe(true)
    })

    it('difference should return keys in first but not second', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      a.set(3, 'a3')
      const b = new SortedMap<number, string>()
      b.set(2, 'b2')
      b.set(4, 'b4')
      const diff = a.difference(b)
      expect(diff.size).toBe(2)
      expect(diff.has(1)).toBe(true)
      expect(diff.has(3)).toBe(true)
      expect(diff.has(2)).toBe(false)
    })

    it('difference should keep values from first map', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      const b = new SortedMap<number, string>()
      b.set(1, 'b1')
      const diff = a.difference(b)
      expect(diff.get(2)).toBe('a2')
    })

    it('difference of map with itself should return empty', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      expect(a.difference(a).isEmpty()).toBe(true)
    })

    it('difference with empty map should return clone', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      const b = new SortedMap<number, string>()
      const diff = a.difference(b)
      expect(diff.size).toBe(1)
      expect(diff.get(1)).toBe('a1')
    })

    it('difference of empty map should return empty', () => {
      const a = new SortedMap<number, string>()
      const b = new SortedMap<number, string>()
      b.set(1, 'b1')
      expect(a.difference(b).isEmpty()).toBe(true)
    })

    it('difference should produce sorted result', () => {
      const a = new SortedMap<number, string>()
      a.set(5, 'e')
      a.set(1, 'a')
      a.set(3, 'c')
      const b = new SortedMap<number, string>()
      b.set(3, 'x')
      const diff = a.difference(b)
      expect(diff.keys()).toEqual([1, 5])
    })
  })

  describe('edge cases', () => {
    it('should handle undefined values', () => {
      const m = new SortedMap<number, string | undefined>()
      m.set(1, undefined)
      expect(m.get(1)).toBeUndefined()
      expect(m.has(1)).toBe(true)
    })

    it('should handle null values', () => {
      const m = new SortedMap<number, string | null>()
      m.set(1, null)
      expect(m.get(1)).toBeNull()
      expect(m.has(1)).toBe(true)
    })

    it('should handle zero as key', () => {
      const m = new SortedMap<number, string>()
      m.set(0, 'zero')
      expect(m.get(0)).toBe('zero')
      expect(m.has(0)).toBe(true)
    })

    it('should handle empty string as key', () => {
      const m = new SortedMap<string, number>()
      m.set('', 0)
      expect(m.get('')).toBe(0)
      expect(m.has('')).toBe(true)
    })

    it('should handle object values', () => {
      const m = new SortedMap<number, { name: string }>()
      m.set(1, { name: 'test' })
      expect(m.get(1)?.name).toBe('test')
    })

    it('should handle array values', () => {
      const m = new SortedMap<number, number[]>()
      m.set(1, [1, 2, 3])
      expect(m.get(1)).toEqual([1, 2, 3])
    })

    it('should handle many duplicate updates', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(1, i)
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe(99)
    })

    it('should handle single element', () => {
      const m = new SortedMap<number, string>()
      m.set(42, 'answer')
      expect(m.size).toBe(1)
      expect(m.get(42)).toBe('answer')
    })
  })

  describe('large maps', () => {
    it('should handle 10000+ entries', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        m.set(i, i * 10)
      }
      expect(m.size).toBe(10000)
      assertBalanced(m)
      expect(m.first()).toEqual([0, 0])
      expect(m.last()).toEqual([9999, 99990])
    })

    it('should handle 10000+ reverse order insertions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 10000; i >= 0; i--) {
        m.set(i, i)
      }
      expect(m.size).toBe(10001)
      assertBalanced(m)
      assertOrdered(m)
    })

    it('should handle 10000 insertions and deletions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 10000; i++) m.set(i, i)
      for (let i = 0; i < 5000; i++) m.delete(i)
      expect(m.size).toBe(5000)
      assertBalanced(m)
      assertOrdered(m)
    })

    it('should handle large sequential insertions and deletions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 5000; i++) m.set(i, i)
      for (let i = 0; i < 5000; i += 2) m.delete(i)
      expect(m.size).toBe(2500)
      assertBalanced(m)
      for (let i = 1; i < 5000; i += 2) {
        expect(m.get(i)).toBe(i)
      }
    })

    it('should handle large random operations', () => {
      const m = new SortedMap<number, number>()
      const reference = new Map<number, number>()
      for (let i = 0; i < 5000; i++) {
        const key = Math.floor(Math.random() * 1000)
        const op = Math.random()
        if (op < 0.7) {
          m.set(key, key * 2)
          reference.set(key, key * 2)
        } else {
          m.delete(key)
          reference.delete(key)
        }
      }
      expect(m.size).toBe(reference.size)
      for (const [k, v] of reference) {
        expect(m.get(k)).toBe(v)
      }
      assertBalanced(m)
    })

    it('should handle large scale insert then delete all', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 5000; i++) m.set(i, i)
      for (let i = 0; i < 5000; i++) m.delete(i)
      expect(m.isEmpty()).toBe(true)
      expect(m.stats().height).toBe(0)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty map', () => {
      const m = new SortedMap<number, string>()
      const stats = m.stats()
      expect(stats.size).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.isBalanced).toBe(true)
    })

    it('should return correct stats for single element', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      const stats = m.stats()
      expect(stats.size).toBe(1)
      expect(stats.height).toBe(1)
      expect(stats.isBalanced).toBe(true)
    })

    it('should return correct stats for balanced tree', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(i, i)
      const stats = m.stats()
      expect(stats.size).toBe(100)
      expect(stats.height).toBeGreaterThan(0)
      expect(stats.isBalanced).toBe(true)
    })

    it('should return correct height for sequential insertions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 1000; i++) m.set(i, i)
      const stats = m.stats()
      expect(stats.height).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(1001)))
    })

    it('should update stats after modifications', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      let stats = m.stats()
      expect(stats.size).toBe(3)
      expect(stats.height).toBe(2)
      m.delete(3)
      stats = m.stats()
      expect(stats.size).toBe(2)
      expect(stats.height).toBeLessThanOrEqual(stats.height)
    })

    it('should report balanced after large insertions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 5000; i++) m.set(i, i)
      expect(m.stats().isBalanced).toBe(true)
    })
  })

  describe('ordered traversal verification', () => {
    it('should maintain in-order traversal after mixed ops', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 30; i++) m.set(i, i)
      for (let i = 10; i < 20; i++) m.delete(i)
      for (let i = 10; i < 20; i++) m.set(i, i * 10)
      assertOrdered(m)
    })

    it('should maintain BST property after random operations', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(Math.floor(Math.random() * 200), i)
      }
      const keys = m.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! >= keys[i - 1]!).toBe(true)
      }
    })

    it('should maintain order through rotations (LL)', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'three')
      m.set(2, 'two')
      m.set(1, 'one')
      expect(m.keys()).toEqual([1, 2, 3])
      assertBalanced(m)
    })

    it('should maintain order through rotations (RR)', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.keys()).toEqual([1, 2, 3])
      assertBalanced(m)
    })

    it('should maintain order through rotations (LR)', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'three')
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.keys()).toEqual([1, 2, 3])
      assertBalanced(m)
    })

    it('should maintain order through rotations (RL)', () => {
      const m = new SortedMap<number, string>()
      m.set(1, 'one')
      m.set(3, 'three')
      m.set(2, 'two')
      expect(m.keys()).toEqual([1, 2, 3])
      assertBalanced(m)
    })

    it('should handle zig-zag insertion pattern', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 50; i++) {
        m.set(i, i)
        m.set(99 - i, 99 - i)
      }
      assertBalanced(m)
      expect(m.size).toBe(100)
      assertOrdered(m)
    })

    it('should handle alternating min max deletion', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(i, i)
      for (let i = 0; i < 50; i++) {
        m.delete(i)
        m.delete(99 - i)
      }
      expect(m.isEmpty()).toBe(true)
    })

    it('should handle mid-point deletion pattern', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(i, i)
      for (let i = 25; i < 75; i++) m.delete(i)
      assertBalanced(m)
      expect(m.size).toBe(50)
      assertOrdered(m)
    })
  })

  describe('AVL balance maintenance', () => {
    it('should maintain balance after complex LL scenario', () => {
      const m = new SortedMap<number, number>()
      for (let i = 10; i >= 1; i--) m.set(i, i)
      assertBalanced(m)
    })

    it('should maintain balance after complex RR scenario', () => {
      const m = new SortedMap<number, number>()
      for (let i = 1; i <= 10; i++) m.set(i, i)
      assertBalanced(m)
    })

    it('should rebalance after deletion causing LL', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'c')
      m.set(2, 'b')
      m.set(4, 'd')
      m.set(1, 'a')
      m.delete(4)
      assertBalanced(m)
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should rebalance after deletion causing RR', () => {
      const m = new SortedMap<number, string>()
      m.set(2, 'b')
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(4, 'd')
      m.delete(1)
      assertBalanced(m)
      expect(m.keys()).toEqual([2, 3, 4])
    })

    it('should rebalance after deletion causing LR', () => {
      const m = new SortedMap<number, string>()
      m.set(5, 'e')
      m.set(3, 'c')
      m.set(6, 'f')
      m.set(4, 'd')
      m.set(2, 'b')
      m.delete(6)
      assertBalanced(m)
    })

    it('should rebalance after deletion causing RL', () => {
      const m = new SortedMap<number, string>()
      m.set(2, 'b')
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(3, 'c')
      m.set(6, 'f')
      m.delete(1)
      assertBalanced(m)
    })

    it('should maintain balance after 500+ insertions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 500; i++) m.set(i, i * 3)
      expect(m.size).toBe(500)
      assertBalanced(m)
    })

    it('should maintain balance with alternating insertions and deletions', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(i, i)
        if (i % 3 === 0 && i > 0) {
          m.delete(i - 1)
        }
      }
      assertBalanced(m)
    })

    it('should handle reverse deletion', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 200; i++) m.set(i, i)
      for (let i = 199; i >= 0; i--) m.delete(i)
      expect(m.isEmpty()).toBe(true)
    })

    it('should handle interleaved operations with verification', () => {
      const m = new SortedMap<number, string>()
      for (let i = 0; i < 50; i++) m.set(i, `v${i}`)
      for (let i = 0; i < 50; i += 2) m.delete(i)
      expect(m.size).toBe(25)
      assertBalanced(m)
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          expect(m.has(i)).toBe(false)
        } else {
          expect(m.has(i)).toBe(true)
          expect(m.get(i)).toBe(`v${i}`)
        }
      }
      m.set(0, 'new0')
      m.set(2, 'new2')
      expect(m.size).toBe(27)
      assertBalanced(m)
    })
  })

  describe('mixed operations', () => {
    it('should handle large number of operations', () => {
      const m = new SortedMap<number, number>()
      const ref = new Map<number, number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 100; i++) {
          const key = (round * 100 + i) % 50
          m.set(key, round * 100 + i)
          ref.set(key, round * 100 + i)
        }
      }
      expect(m.size).toBe(ref.size)
      for (const [k, v] of ref) {
        expect(m.get(k)).toBe(v)
      }
      assertBalanced(m)
    })

    it('should handle find keys in large tree', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 50; i++) m.set(i, i)
      expect(m.has(0)).toBe(true)
      expect(m.has(49)).toBe(true)
      expect(m.has(25)).toBe(true)
      expect(m.has(50)).toBe(false)
    })

    it('should handle many operations maintaining correctness', () => {
      const m = new SortedMap<number, number>()
      for (let i = 0; i < 200; i++) m.set(i, i)
      for (let i = 0; i < 200; i += 2) m.delete(i)
      expect(m.size).toBe(100)
      for (let i = 1; i < 200; i += 2) {
        expect(m.get(i)).toBe(i)
      }
      assertBalanced(m)
    })
  })

  describe('default comparator', () => {
    it('should work with number keys by default', () => {
      const m = new SortedMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should work with string keys by default', () => {
      const m = new SortedMap<string, number>()
      m.set('cherry', 3)
      m.set('apple', 1)
      m.set('banana', 2)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('set operations with complex scenarios', () => {
    it('union should overwrite with second map values on conflict', () => {
      const a = new SortedMap<number, string>()
      a.set(1, 'a1')
      a.set(2, 'a2')
      const b = new SortedMap<number, string>()
      b.set(1, 'b1')
      b.set(3, 'b3')
      const u = a.union(b)
      expect(u.get(1)).toBe('b1')
      expect(u.get(2)).toBe('a2')
      expect(u.get(3)).toBe('b3')
    })

    it('intersection should produce sorted result', () => {
      const a = new SortedMap<number, string>()
      a.set(5, 'e')
      a.set(3, 'c')
      a.set(1, 'a')
      const b = new SortedMap<number, string>()
      b.set(3, 'x')
      b.set(5, 'y')
      const inter = a.intersection(b)
      expect(inter.keys()).toEqual([3, 5])
    })

    it('set operations should work with custom comparator', () => {
      const cmp = (a: number, b: number) => b - a
      const a = new SortedMap<number, string>(cmp)
      a.set(1, 'a1')
      a.set(2, 'a2')
      const b = new SortedMap<number, string>(cmp)
      b.set(2, 'b2')
      b.set(3, 'b3')
      const u = a.union(b)
      expect(u.keys()).toEqual([3, 2, 1])
    })
  })
})
