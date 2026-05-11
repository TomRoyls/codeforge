import { describe, it, expect } from 'vitest'
import { MergeableMap } from '../../src/core/mergeable-map/index.js'
import type { ConflictResolver } from '../../src/core/mergeable-map/types.js'

describe('MergeableMap', () => {
  describe('constructor', () => {
    it('creates an empty map with no arguments', () => {
      const map = new MergeableMap<string, number>()
      expect(map.size).toBe(0)
    })

    it('creates a map from entries', () => {
      const map = new MergeableMap([
        ['a', 1],
        ['b', 2],
      ])
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('creates a map from another map entries', () => {
      const native = new Map([
        ['x', 10],
        ['y', 20],
      ])
      const map = new MergeableMap(native.entries())
      expect(map.size).toBe(2)
      expect(map.get('x')).toBe(10)
    })

    it('creates a map from an array of tuples', () => {
      const map = new MergeableMap<number, string>([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ])
      expect(map.size).toBe(3)
    })

    it('handles empty iterable', () => {
      const map = new MergeableMap<string, number>([])
      expect(map.size).toBe(0)
    })

    it('keeps last value for duplicate keys in entries', () => {
      const map = new MergeableMap<string, number>([
        ['a', 1],
        ['a', 2],
      ])
      expect(map.get('a')).toBe(2)
    })
  })

  describe('set and get', () => {
    it('sets a value and retrieves it', () => {
      const map = new MergeableMap<string, number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('overwrites an existing value', () => {
      const map = new MergeableMap<string, number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
    })

    it('returns undefined for missing keys', () => {
      const map = new MergeableMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('handles number keys', () => {
      const map = new MergeableMap<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('handles object values', () => {
      const map = new MergeableMap<string, { name: string }>()
      map.set('user', { name: 'Alice' })
      expect(map.get('user')?.name).toBe('Alice')
    })

    it('handles undefined values correctly', () => {
      const map = new MergeableMap<string, number | undefined>()
      map.set('a', undefined)
      expect(map.has('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
    })

    it('handles null values', () => {
      const map = new MergeableMap<string, number | null>()
      map.set('a', null)
      expect(map.get('a')).toBeNull()
    })

    it('handles boolean keys', () => {
      const map = new MergeableMap<boolean, string>()
      map.set(true, 'yes')
      map.set(false, 'no')
      expect(map.get(true)).toBe('yes')
      expect(map.get(false)).toBe('no')
    })
  })

  describe('delete', () => {
    it('deletes an existing key', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.has('a')).toBe(false)
    })

    it('returns false for non-existent key', () => {
      const map = new MergeableMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('decreases size after deletion', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('can delete all entries', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new MergeableMap<string, number>()
      expect(map.has('a')).toBe(false)
    })

    it('returns true after overwrite', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.has('a')).toBe(true)
    })

    it('returns false after delete', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.size).toBe(0)
    })

    it('returns correct count after adds', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
    })

    it('does not increase for duplicate keys', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('updates correctly after mixed operations', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.set('c', 3)
      expect(map.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.isEmpty).toBe(true)
    })

    it('returns false after adding an entry', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      expect(map.isEmpty).toBe(false)
    })

    it('returns true after clearing all entries', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.clear()
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('works on already empty map', () => {
      const map = new MergeableMap<string, number>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.size).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('merge', () => {
    it('merges entries from another map', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      const result = map1.merge(map2)
      expect(map1.get('b')).toBe(2)
      expect(result.added).toBe(1)
    })

    it('uses other value on conflict by default', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 99)
      map1.merge(map2)
      expect(map1.get('a')).toBe(99)
    })

    it('uses conflict resolver when provided', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 10)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 20)
      const resolver: ConflictResolver<string, number> = (_key, current, other) =>
        current + other
      map1.merge(map2, resolver)
      expect(map1.get('a')).toBe(30)
    })

    it('uses conflict resolver that keeps current value', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 10)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 20)
      const resolver: ConflictResolver<string, number> = (_key, current) => current
      map1.merge(map2, resolver)
      expect(map1.get('a')).toBe(10)
    })

    it('returns correct merge result for non-overlapping maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('c', 3)
      map2.set('d', 4)
      const result = map1.merge(map2)
      expect(result.added).toBe(2)
      expect(result.updated).toBe(0)
      expect(result.removed).toBe(0)
    })

    it('returns correct merge result for overlapping maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 20)
      map2.set('c', 3)
      const result = map1.merge(map2)
      expect(result.added).toBe(1)
      expect(result.updated).toBe(1)
    })

    it('returns unchanged count for same values', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      const result = map1.merge(map2)
      expect(result.unchanged).toBe(1)
      expect(result.updated).toBe(0)
    })

    it('merges into empty map', () => {
      const map1 = new MergeableMap<string, number>()
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      map2.set('b', 2)
      const result = map1.merge(map2)
      expect(result.added).toBe(2)
      expect(map1.size).toBe(2)
    })

    it('merging empty map is a no-op', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      const result = map1.merge(map2)
      expect(result.added).toBe(0)
      expect(map1.size).toBe(1)
    })

    it('does not modify the source map', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 2)
      map2.set('b', 3)
      map1.merge(map2)
      expect(map2.size).toBe(2)
      expect(map2.get('a')).toBe(2)
    })

    it('conflict resolver receives correct key', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('x', 10)
      const map2 = new MergeableMap<string, number>()
      map2.set('x', 20)
      let receivedKey: string | undefined
      map1.merge(map2, (key) => {
        receivedKey = key
        return 0
      })
      expect(receivedKey).toBe('x')
    })

    it('handles merge with many entries', () => {
      const map1 = new MergeableMap<number, number>()
      for (let i = 0; i < 100; i++) map1.set(i, i)
      const map2 = new MergeableMap<number, number>()
      for (let i = 50; i < 150; i++) map2.set(i, i * 10)
      const result = map1.merge(map2)
      expect(result.added).toBe(50)
      expect(result.updated).toBe(50)
      expect(map1.size).toBe(150)
    })
  })

  describe('keys, values, entries', () => {
    it('keys returns all keys', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(Array.from(map.keys())).toEqual(['a', 'b'])
    })

    it('values returns all values', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(Array.from(map.values())).toEqual([1, 2])
    })

    it('entries returns all entries', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(Array.from(map.entries())).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('keys of empty map returns empty iterator', () => {
      const map = new MergeableMap<string, number>()
      expect(Array.from(map.keys())).toEqual([])
    })

    it('values of empty map returns empty iterator', () => {
      const map = new MergeableMap<string, number>()
      expect(Array.from(map.values())).toEqual([])
    })
  })

  describe('toArray', () => {
    it('converts to array of tuples', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const arr = map.toArray()
      expect(arr).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('returns empty array for empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.toArray()).toEqual([])
    })

    it('returns a new array each time', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      const arr1 = map.toArray()
      const arr2 = map.toArray()
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const collected: Array<[string, number]> = []
      map.forEach((value, key) => {
        collected.push([key, value])
      })
      expect(collected).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('passes the map as third argument', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      let received: MergeableMap<string, number> | undefined
      map.forEach((_v, _k, m) => {
        received = m
      })
      expect(received).toBe(map)
    })

    it('does not iterate on empty map', () => {
      const map = new MergeableMap<string, number>()
      let count = 0
      map.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result = [...map]
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('works with for-of', () => {
      const map = new MergeableMap<string, number>()
      map.set('x', 10)
      const collected: Array<[string, number]> = []
      for (const entry of map) {
        collected.push(entry)
      }
      expect(collected).toEqual([['x', 10]])
    })

    it('works with Array.from', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      expect(Array.from(map)).toEqual([['a', 1]])
    })
  })

  describe('clone', () => {
    it('creates a shallow copy', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const cloned = map.clone()
      expect(cloned.toArray()).toEqual(map.toArray())
    })

    it('clone is independent from original', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      const cloned = map.clone()
      cloned.set('a', 99)
      expect(map.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(99)
    })

    it('clone has same size', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.clone().size).toBe(3)
    })

    it('clone of empty map is empty', () => {
      const map = new MergeableMap<string, number>()
      expect(map.clone().isEmpty).toBe(true)
    })
  })

  describe('difference', () => {
    it('returns entries only in this map', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      const diff = map1.difference(map2)
      expect(diff.has('a')).toBe(true)
      expect(diff.has('b')).toBe(false)
    })

    it('returns empty when all keys shared', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 10)
      const diff = map1.difference(map2)
      expect(diff.isEmpty).toBe(true)
    })

    it('returns all when other is empty', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      const diff = map1.difference(map2)
      expect(diff.size).toBe(2)
    })

    it('returns empty when this is empty', () => {
      const map1 = new MergeableMap<string, number>()
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      const diff = map1.difference(map2)
      expect(diff.isEmpty).toBe(true)
    })

    it('does not modify original maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      map1.difference(map2)
      expect(map1.size).toBe(1)
      expect(map2.size).toBe(1)
    })

    it('difference is asymmetric', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      map2.set('c', 3)
      const diff1 = map1.difference(map2)
      const diff2 = map2.difference(map1)
      expect(diff1.has('a')).toBe(true)
      expect(diff1.has('c')).toBe(false)
      expect(diff2.has('c')).toBe(true)
      expect(diff2.has('a')).toBe(false)
    })
  })

  describe('intersection', () => {
    it('returns common keys with this values', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 20)
      map2.set('c', 3)
      const inter = map1.intersection(map2)
      expect(inter.has('b')).toBe(true)
      expect(inter.get('b')).toBe(2)
    })

    it('returns empty for disjoint maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      const inter = map1.intersection(map2)
      expect(inter.isEmpty).toBe(true)
    })

    it('returns all when maps are identical', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      map2.set('b', 2)
      const inter = map1.intersection(map2)
      expect(inter.size).toBe(2)
    })

    it('returns empty when one is empty', () => {
      const map1 = new MergeableMap<string, number>()
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      expect(map1.intersection(map2).isEmpty).toBe(true)
    })

    it('does not modify original maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 2)
      map1.intersection(map2)
      expect(map1.get('a')).toBe(1)
      expect(map2.get('a')).toBe(2)
    })
  })

  describe('union', () => {
    it('combines both maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      const union = map1.union(map2)
      expect(union.size).toBe(2)
      expect(union.get('a')).toBe(1)
      expect(union.get('b')).toBe(2)
    })

    it('uses other value on conflict by default', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 99)
      const union = map1.union(map2)
      expect(union.get('a')).toBe(99)
    })

    it('does not modify original maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 2)
      map1.union(map2)
      expect(map1.get('a')).toBe(1)
    })

    it('returns a new map', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const union = map1.union(new MergeableMap<string, number>())
      expect(union).not.toBe(map1)
    })
  })

  describe('detailedDifference', () => {
    it('categorizes entries correctly', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      map1.set('c', 3)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      map2.set('c', 30)
      map2.set('d', 4)
      const diff = map1.detailedDifference(map2)
      expect(diff.leftOnly).toEqual([{ key: 'a', value: 1 }])
      expect(diff.rightOnly).toEqual([{ key: 'd', value: 4 }])
      expect(diff.common).toEqual([{ key: 'b', value: 2 }])
      expect(diff.changed).toEqual([{ key: 'c', leftValue: 3, rightValue: 30 }])
    })

    it('returns empty for identical maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      const diff = map1.detailedDifference(map2)
      expect(diff.leftOnly).toEqual([])
      expect(diff.rightOnly).toEqual([])
      expect(diff.changed).toEqual([])
      expect(diff.common).toEqual([{ key: 'a', value: 1 }])
    })

    it('returns all as leftOnly when other is empty', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const diff = map1.detailedDifference(new MergeableMap<string, number>())
      expect(diff.leftOnly.length).toBe(1)
      expect(diff.rightOnly).toEqual([])
    })

    it('returns all as rightOnly when this is empty', () => {
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      const diff = new MergeableMap<string, number>().detailedDifference(map2)
      expect(diff.leftOnly).toEqual([])
      expect(diff.rightOnly.length).toBe(1)
    })
  })

  describe('equals', () => {
    it('returns true for identical maps', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 1)
      map2.set('b', 2)
      expect(map1.equals(map2)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      expect(map1.equals(map2)).toBe(false)
    })

    it('returns false for different values', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 2)
      expect(map1.equals(map2)).toBe(false)
    })

    it('returns true for two empty maps', () => {
      expect(
        new MergeableMap<string, number>().equals(
          new MergeableMap<string, number>(),
        ),
      ).toBe(true)
    })
  })

  describe('filter', () => {
    it('filters entries by predicate', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const filtered = map.filter((v) => v > 1)
      expect(filtered.has('a')).toBe(false)
      expect(filtered.has('b')).toBe(true)
      expect(filtered.has('c')).toBe(true)
    })

    it('returns empty when nothing matches', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      const filtered = map.filter((v) => v > 10)
      expect(filtered.isEmpty).toBe(true)
    })

    it('returns all when everything matches', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const filtered = map.filter(() => true)
      expect(filtered.size).toBe(2)
    })

    it('does not modify original', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.filter(() => false)
      expect(map.size).toBe(1)
    })

    it('predicate receives key as second arg', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('bb', 2)
      const filtered = map.filter((_v, k) => k.length === 1)
      expect(filtered.has('a')).toBe(true)
      expect(filtered.has('bb')).toBe(false)
    })
  })

  describe('mapValues', () => {
    it('maps values to new type', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const mapped = map.mapValues((v) => v * 10)
      expect(mapped.get('a')).toBe(10)
      expect(mapped.get('b')).toBe(20)
    })

    it('maps to different type', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      const mapped = map.mapValues((v) => `val:${v}`)
      expect(mapped.get('a')).toBe('val:1')
    })

    it('preserves keys', () => {
      const map = new MergeableMap<string, number>()
      map.set('x', 1)
      map.set('y', 2)
      const mapped = map.mapValues((v) => v + 1)
      expect(Array.from(mapped.keys())).toEqual(['x', 'y'])
    })

    it('does not modify original', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.mapValues((v) => v * 2)
      expect(map.get('a')).toBe(1)
    })
  })

  describe('some', () => {
    it('returns true when at least one matches', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.some((v) => v === 2)).toBe(true)
    })

    it('returns false when none match', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      expect(map.some((v) => v > 10)).toBe(false)
    })

    it('returns false for empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.some(() => true)).toBe(false)
    })
  })

  describe('every', () => {
    it('returns true when all match', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 2)
      map.set('b', 4)
      expect(map.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when one fails', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 2)
      map.set('b', 3)
      expect(map.every((v) => v % 2 === 0)).toBe(false)
    })

    it('returns true for empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.every(() => false)).toBe(true)
    })
  })

  describe('find', () => {
    it('finds first matching value', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.find((v) => v === 2)).toBe(2)
    })

    it('returns undefined when not found', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      expect(map.find((v) => v > 10)).toBeUndefined()
    })

    it('returns undefined for empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.find(() => true)).toBeUndefined()
    })
  })

  describe('reduce', () => {
    it('reduces values', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('returns initial value for empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('passes key to reducer', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result = map.reduce(
        (acc, v, k) => ({ ...acc, [k]: v }),
        {} as Record<string, number>,
      )
      expect(result).toEqual({ a: 1, b: 2 })
    })
  })

  describe('fromObject', () => {
    it('creates map from plain object', () => {
      const map = MergeableMap.fromObject({ a: 1, b: 2 })
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('handles empty object', () => {
      const map = MergeableMap.fromObject({})
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('toObject', () => {
    it('converts string-keyed map to object', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.toObject()).toEqual({ a: 1, b: 2 })
    })

    it('returns empty object for empty map', () => {
      const map = new MergeableMap<string, number>()
      expect(map.toObject()).toEqual({})
    })

    it('skips non-string keys', () => {
      const map = new MergeableMap<string | number, number>()
      map.set('a', 1)
      map.set(2 as unknown as string, 2)
      const obj = map.toObject()
      expect(obj).toEqual({ a: 1 })
    })
  })

  describe('chained operations', () => {
    it('supports chaining set calls', () => {
      const map = new MergeableMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
    })

    it('supports merge then filter', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      map2.set('c', 3)
      map1.merge(map2)
      const filtered = map1.filter((v) => v > 1)
      expect(filtered.size).toBe(2)
    })

    it('supports clone then merge', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      const cloned = map1.clone()
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 2)
      cloned.merge(map2)
      expect(map1.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('supports difference then union roundtrip', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 1)
      map1.set('b', 2)
      const map2 = new MergeableMap<string, number>()
      map2.set('b', 20)
      map2.set('c', 3)
      const diff = map1.difference(map2)
      const union = diff.union(map2)
      expect(union.has('a')).toBe(true)
      expect(union.has('b')).toBe(true)
      expect(union.has('c')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles NaN keys', () => {
      const map = new MergeableMap<number, string>()
      map.set(NaN, 'not a number')
      expect(map.has(NaN)).toBe(true)
      expect(map.get(NaN)).toBe('not a number')
    })

    it('handles empty string key', () => {
      const map = new MergeableMap<string, number>()
      map.set('', 0)
      expect(map.has('')).toBe(true)
      expect(map.get('')).toBe(0)
    })

    it('handles zero key', () => {
      const map = new MergeableMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('handles object identity keys', () => {
      const objKey = { id: 1 }
      const map = new MergeableMap<object, string>()
      map.set(objKey, 'value')
      expect(map.get(objKey)).toBe('value')
      expect(map.get({ id: 1 })).toBeUndefined()
    })

    it('handles large number of entries', () => {
      const map = new MergeableMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(i, i * 2)
      }
      expect(map.size).toBe(1000)
      expect(map.get(500)).toBe(1000)
    })

    it('merges with complex conflict resolver', () => {
      const map1 = new MergeableMap<string, number[]>()
      map1.set('a', [1, 2])
      const map2 = new MergeableMap<string, number[]>()
      map2.set('a', [3, 4])
      map1.merge(map2, (_k, current, other) => [...current, ...other])
      expect(map1.get('a')).toEqual([1, 2, 3, 4])
    })

    it('merge with resolver that always picks max', () => {
      const map1 = new MergeableMap<string, number>()
      map1.set('a', 10)
      map1.set('b', 5)
      const map2 = new MergeableMap<string, number>()
      map2.set('a', 3)
      map2.set('b', 15)
      map1.merge(map2, (_k, curr, other) => Math.max(curr, other))
      expect(map1.get('a')).toBe(10)
      expect(map1.get('b')).toBe(15)
    })
  })
})
