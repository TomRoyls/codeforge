import { describe, it, expect, beforeEach } from 'vitest'
import { BatchMap } from '../../src/core/batch-map/batch-map.js'
import { DEFAULT_BATCH_MAP_OPTIONS } from '../../src/core/batch-map/types.js'
import type { BatchMapOptions, BatchMapStatistics } from '../../src/core/batch-map/types.js'

describe('BatchMap', () => {
  let map: BatchMap<string, number>

  beforeEach(() => {
    map = new BatchMap<string, number>()
  })

  describe('constructor', () => {
    it('should create a map with default options', () => {
      const m = new BatchMap<string, number>()
      expect(m.size).toBe(0)
    })

    it('should accept custom initialCapacity option', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 128 })
      expect(m.size).toBe(0)
    })

    it('should accept custom loadFactor option', () => {
      const m = new BatchMap<string, number>({ loadFactor: 0.5 })
      expect(m.size).toBe(0)
    })

    it('should accept partial options', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 32 })
      expect(m.size).toBe(0)
    })

    it('should accept all options combined', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 8, loadFactor: 0.9 })
      expect(m.size).toBe(0)
    })

    it('should use default options when none provided', () => {
      expect(DEFAULT_BATCH_MAP_OPTIONS.initialCapacity).toBe(64)
      expect(DEFAULT_BATCH_MAP_OPTIONS.loadFactor).toBe(0.75)
    })
  })

  describe('set', () => {
    it('should add a key-value pair', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('should overwrite existing key', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('should increase size when adding new key', () => {
      map.set('a', 1)
      expect(map.size).toBe(1)
    })

    it('should not increase size when overwriting', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('should handle multiple keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
    })

    it('should handle undefined value', () => {
      map.set('a', undefined as unknown as number)
      expect(map.get('a')).toBeUndefined()
    })

    it('should handle zero value', () => {
      map.set('a', 0)
      expect(map.get('a')).toBe(0)
    })

    it('should handle null key', () => {
      map.set(null as unknown as string, 42)
      expect(map.get(null as unknown as string)).toBe(42)
    })

    it('should update statistics on set', () => {
      map.set('a', 1)
      const stats = map.getStatistics()
      expect(stats.sets).toBe(1)
      expect(stats.totalItemsProcessed).toBe(1)
    })

    it('should update statistics on overwrite', () => {
      map.set('a', 1)
      map.set('a', 2)
      const stats = map.getStatistics()
      expect(stats.sets).toBe(2)
      expect(stats.totalItemsProcessed).toBe(2)
    })
  })

  describe('get', () => {
    it('should return value for existing key', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('should return undefined for non-existing key', () => {
      expect(map.get('x')).toBeUndefined()
    })

    it('should return undefined on empty map', () => {
      expect(map.get('a')).toBeUndefined()
    })

    it('should get correct value after overwrite', () => {
      map.set('a', 1)
      map.set('a', 99)
      expect(map.get('a')).toBe(99)
    })

    it('should update statistics on get', () => {
      map.set('a', 1)
      map.get('a')
      const stats = map.getStatistics()
      expect(stats.gets).toBe(1)
    })

    it('should update statistics even on miss', () => {
      map.get('nonexistent')
      const stats = map.getStatistics()
      expect(stats.gets).toBe(1)
      expect(stats.totalItemsProcessed).toBe(1)
    })

    it('should get values for multiple keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })
  })

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(map.delete('x')).toBe(false)
    })

    it('should decrease size on delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.size).toBe(0)
    })

    it('should not decrease size on failed delete', () => {
      map.set('a', 1)
      map.delete('x')
      expect(map.size).toBe(1)
    })

    it('should make key inaccessible after delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.get('a')).toBeUndefined()
    })

    it('should update statistics on delete', () => {
      map.set('a', 1)
      map.delete('a')
      const stats = map.getStatistics()
      expect(stats.deletes).toBe(1)
    })

    it('should update statistics on failed delete', () => {
      map.delete('x')
      const stats = map.getStatistics()
      expect(stats.deletes).toBe(1)
    })

    it('should handle delete from empty map', () => {
      expect(map.delete('a')).toBe(false)
    })

    it('should delete from chain correctly', () => {
      for (let i = 0; i < 20; i++) {
        map.set(`key${i}`, i)
      }
      map.delete('key10')
      expect(map.has('key10')).toBe(false)
      expect(map.has('key9')).toBe(true)
      expect(map.has('key11')).toBe(true)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(map.has('x')).toBe(false)
    })

    it('should return false on empty map', () => {
      expect(map.has('a')).toBe(false)
    })

    it('should return false after delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })

    it('should return true after overwrite', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.has('a')).toBe(true)
    })
  })

  describe('batchSet', () => {
    it('should set multiple entries', () => {
      map.batchSet([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(map.size).toBe(3)
    })

    it('should handle empty array', () => {
      map.batchSet([])
      expect(map.size).toBe(0)
    })

    it('should overwrite existing keys', () => {
      map.set('a', 1)
      map.batchSet([['a', 99]])
      expect(map.get('a')).toBe(99)
      expect(map.size).toBe(1)
    })

    it('should mix new and existing keys', () => {
      map.set('a', 1)
      map.batchSet([
        ['a', 10],
        ['b', 20],
      ])
      expect(map.get('a')).toBe(10)
      expect(map.get('b')).toBe(20)
      expect(map.size).toBe(2)
    })

    it('should update statistics', () => {
      map.batchSet([
        ['a', 1],
        ['b', 2],
      ])
      const stats = map.getStatistics()
      expect(stats.batchSets).toBe(1)
      expect(stats.totalItemsProcessed).toBe(2)
    })

    it('should handle duplicate keys in batch', () => {
      map.batchSet([
        ['a', 1],
        ['a', 2],
      ])
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('should handle large batch', () => {
      const entries: Array<[string, number]> = []
      for (let i = 0; i < 100; i++) {
        entries.push([`key${i}`, i])
      }
      map.batchSet(entries)
      expect(map.size).toBe(100)
    })

    it('should trigger resize when needed', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
      m.batchSet([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(m.size).toBe(3)
    })
  })

  describe('batchGet', () => {
    it('should get multiple values', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const results = map.batchGet(['a', 'b', 'c'])
      expect(results).toEqual([1, 2, 3])
    })

    it('should return undefined for missing keys', () => {
      map.set('a', 1)
      const results = map.batchGet(['a', 'x', 'y'])
      expect(results).toEqual([1, undefined, undefined])
    })

    it('should handle empty array', () => {
      const results = map.batchGet([])
      expect(results).toEqual([])
    })

    it('should handle all missing keys', () => {
      const results = map.batchGet(['x', 'y', 'z'])
      expect(results).toEqual([undefined, undefined, undefined])
    })

    it('should update statistics', () => {
      map.set('a', 1)
      map.batchGet(['a', 'b'])
      const stats = map.getStatistics()
      expect(stats.batchGets).toBe(1)
      expect(stats.totalItemsProcessed).toBe(3)
    })

    it('should preserve key order in results', () => {
      map.set('c', 3)
      map.set('a', 1)
      map.set('b', 2)
      const results = map.batchGet(['c', 'a', 'b'])
      expect(results).toEqual([3, 1, 2])
    })

    it('should handle duplicate keys in batch get', () => {
      map.set('a', 1)
      const results = map.batchGet(['a', 'a', 'a'])
      expect(results).toEqual([1, 1, 1])
    })
  })

  describe('batchDelete', () => {
    it('should delete multiple keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const results = map.batchDelete(['a', 'b', 'c'])
      expect(results).toEqual([true, true, true])
      expect(map.size).toBe(0)
    })

    it('should handle mix of existing and missing keys', () => {
      map.set('a', 1)
      map.set('c', 3)
      const results = map.batchDelete(['a', 'b', 'c'])
      expect(results).toEqual([true, false, true])
      expect(map.size).toBe(0)
    })

    it('should handle empty array', () => {
      const results = map.batchDelete([])
      expect(results).toEqual([])
    })

    it('should handle all missing keys', () => {
      const results = map.batchDelete(['x', 'y', 'z'])
      expect(results).toEqual([false, false, false])
    })

    it('should update statistics', () => {
      map.set('a', 1)
      map.batchDelete(['a', 'b'])
      const stats = map.getStatistics()
      expect(stats.batchDeletes).toBe(1)
      expect(stats.totalItemsProcessed).toBe(3)
    })

    it('should handle duplicate keys in batch delete', () => {
      map.set('a', 1)
      const results = map.batchDelete(['a', 'a'])
      expect(results[0]).toBe(true)
      expect(results[1]).toBe(false)
    })
  })

  describe('batchHas', () => {
    it('should check multiple keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      const results = map.batchHas(['a', 'b', 'c'])
      expect(results).toEqual([true, true, false])
    })

    it('should handle empty array', () => {
      const results = map.batchHas([])
      expect(results).toEqual([])
    })

    it('should handle all existing keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      const results = map.batchHas(['a', 'b'])
      expect(results).toEqual([true, true])
    })

    it('should handle all missing keys', () => {
      const results = map.batchHas(['x', 'y'])
      expect(results).toEqual([false, false])
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size).toBe(0)
    })

    it('should return correct size after operations', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false for non-empty map', () => {
      map.set('a', 1)
      expect(map.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      map.set('a', 1)
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })

    it('should return true after deleting all', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should work on empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('should not affect statistics', () => {
      map.set('a', 1)
      map.clear()
      const stats = map.getStatistics()
      expect(stats.sets).toBe(1)
    })
  })

  describe('keys', () => {
    it('should return empty iterator for empty map', () => {
      expect([...map.keys()]).toEqual([])
    })

    it('should return all keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = [...map.keys()]
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should not include deleted keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const keys = [...map.keys()]
      expect(keys).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('should return empty iterator for empty map', () => {
      expect([...map.values()]).toEqual([])
    })

    it('should return all values', () => {
      map.set('a', 1)
      map.set('b', 2)
      const values = [...map.values()]
      expect(values.sort()).toEqual([1, 2])
    })

    it('should reflect overwrites', () => {
      map.set('a', 1)
      map.set('a', 99)
      const values = [...map.values()]
      expect(values).toEqual([99])
    })
  })

  describe('entries', () => {
    it('should return empty iterator for empty map', () => {
      expect([...map.entries()]).toEqual([])
    })

    it('should return all entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      const entries = [...map.entries()]
      expect(entries.length).toBe(2)
    })

    it('should return correct key-value pairs', () => {
      map.set('x', 42)
      const entries = [...map.entries()]
      expect(entries).toEqual([['x', 42]])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      const collected: Array<[string, number]> = []
      map.forEach((value, key) => {
        collected.push([key, value])
      })
      expect(collected.length).toBe(2)
    })

    it('should pass the map as third argument', () => {
      map.set('a', 1)
      let received: BatchMap<string, number> | undefined
      map.forEach((_value, _key, m) => {
        received = m
      })
      expect(received).toBe(map)
    })

    it('should not iterate on empty map', () => {
      let count = 0
      map.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('should handle single entry', () => {
      map.set('a', 1)
      let sum = 0
      map.forEach((value) => {
        sum += value
      })
      expect(sum).toBe(1)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      map.set('a', 1)
      map.set('b', 2)
      const result = [...map]
      expect(result.length).toBe(2)
    })

    it('should return entries like entries()', () => {
      map.set('a', 1)
      const fromIterator = [...map]
      const fromEntries = [...map.entries()]
      expect(fromIterator).toEqual(fromEntries)
    })

    it('should work with for...of', () => {
      map.set('a', 1)
      map.set('b', 2)
      const collected: Array<[string, number]> = []
      for (const entry of map) {
        collected.push(entry)
      }
      expect(collected.length).toBe(2)
    })

    it('should work with spread in empty map', () => {
      expect([...map]).toEqual([])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('should return all entries as array', () => {
      map.set('a', 1)
      map.set('b', 2)
      const arr = map.toArray()
      expect(arr.length).toBe(2)
    })

    it('should return correct key-value pairs', () => {
      map.set('x', 42)
      expect(map.toArray()).toEqual([['x', 42]])
    })

    it('should not include deleted entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.toArray()).toEqual([['b', 2]])
    })
  })

  describe('merge', () => {
    it('should merge entries from another map', () => {
      const other = new BatchMap<string, number>()
      other.set('a', 1)
      other.set('b', 2)
      map.merge(other)
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('should overwrite existing keys with source values', () => {
      map.set('a', 1)
      const other = new BatchMap<string, number>()
      other.set('a', 99)
      map.merge(other)
      expect(map.get('a')).toBe(99)
    })

    it('should merge into empty map', () => {
      const other = new BatchMap<string, number>()
      other.set('a', 1)
      map.merge(other)
      expect(map.size).toBe(1)
    })

    it('should merge from empty map', () => {
      map.set('a', 1)
      const other = new BatchMap<string, number>()
      map.merge(other)
      expect(map.size).toBe(1)
    })

    it('should handle merging large maps', () => {
      const other = new BatchMap<string, number>()
      for (let i = 0; i < 50; i++) {
        other.set(`key${i}`, i)
      }
      map.merge(other)
      expect(map.size).toBe(50)
    })

    it('should not modify source map', () => {
      const other = new BatchMap<string, number>()
      other.set('a', 1)
      map.merge(other)
      expect(other.size).toBe(1)
      expect(other.get('a')).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = map.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.batchSets).toBe(0)
      expect(stats.batchGets).toBe(0)
      expect(stats.batchDeletes).toBe(0)
      expect(stats.totalItemsProcessed).toBe(0)
    })

    it('should track sets', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getStatistics().sets).toBe(2)
    })

    it('should track gets', () => {
      map.get('a')
      map.get('b')
      expect(map.getStatistics().gets).toBe(2)
    })

    it('should track deletes', () => {
      map.delete('a')
      map.delete('b')
      expect(map.getStatistics().deletes).toBe(2)
    })

    it('should track batchSets', () => {
      map.batchSet([['a', 1]])
      map.batchSet([['b', 2]])
      expect(map.getStatistics().batchSets).toBe(2)
    })

    it('should track batchGets', () => {
      map.batchGet(['a'])
      map.batchGet(['b'])
      expect(map.getStatistics().batchGets).toBe(2)
    })

    it('should track batchDeletes', () => {
      map.batchDelete(['a'])
      map.batchDelete(['b'])
      expect(map.getStatistics().batchDeletes).toBe(2)
    })

    it('should track totalItemsProcessed across operations', () => {
      map.set('a', 1)
      map.get('a')
      map.delete('a')
      expect(map.getStatistics().totalItemsProcessed).toBe(3)
    })

    it('should track totalItemsProcessed across batch operations', () => {
      map.batchSet([
        ['a', 1],
        ['b', 2],
      ])
      map.batchGet(['a', 'b'])
      map.batchDelete(['a'])
      expect(map.getStatistics().totalItemsProcessed).toBe(5)
    })

    it('should return a copy of statistics', () => {
      map.set('a', 1)
      const stats1 = map.getStatistics()
      map.set('b', 2)
      const stats2 = map.getStatistics()
      expect(stats1.sets).toBe(1)
      expect(stats2.sets).toBe(2)
    })
  })

  describe('resize', () => {
    it('should handle many insertions beyond initial capacity', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
      for (let i = 0; i < 100; i++) {
        m.set(`key${i}`, i)
      }
      expect(m.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(m.get(`key${i}`)).toBe(i)
      }
    })

    it('should preserve all entries after resize', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 4, loadFactor: 0.5 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      m.set('d', 4)
      m.set('e', 5)
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBe(2)
      expect(m.get('c')).toBe(3)
      expect(m.get('d')).toBe(4)
      expect(m.get('e')).toBe(5)
    })

    it('should resize during batchSet', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
      const entries: Array<[string, number]> = []
      for (let i = 0; i < 50; i++) {
        entries.push([`key${i}`, i])
      }
      m.batchSet(entries)
      expect(m.size).toBe(50)
    })
  })

  describe('type variants', () => {
    it('should work with number keys', () => {
      const m = new BatchMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('should work with boolean keys', () => {
      const m = new BatchMap<boolean, string>()
      m.set(true, 'yes')
      m.set(false, 'no')
      expect(m.get(true)).toBe('yes')
      expect(m.get(false)).toBe('no')
    })

    it('should work with object values', () => {
      const m = new BatchMap<string, { name: string }>()
      m.set('a', { name: 'Alice' })
      expect(m.get('a')!.name).toBe('Alice')
    })

    it('should work with array values', () => {
      const m = new BatchMap<string, number[]>()
      m.set('a', [1, 2, 3])
      expect(m.get('a')).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      map.set('', 42)
      expect(map.get('')).toBe(42)
      expect(map.has('')).toBe(true)
    })

    it('should handle string "0" key vs number 0 key', () => {
      const numMap = new BatchMap<number, string>()
      numMap.set(0, 'zero')
      expect(numMap.get(0)).toBe('zero')
    })

    it('should handle setting same key many times', () => {
      for (let i = 0; i < 100; i++) {
        map.set('a', i)
      }
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(99)
    })

    it('should handle delete then re-add', () => {
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('should handle many collisions', () => {
      const m = new BatchMap<string, number>({ initialCapacity: 1, loadFactor: 2 })
      for (let i = 0; i < 10; i++) {
        m.set(`key${i}`, i)
      }
      expect(m.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(m.get(`key${i}`)).toBe(i)
      }
    })

    it('should handle batchSet then individual get for each', () => {
      const entries: Array<[string, number]> = []
      for (let i = 0; i < 50; i++) {
        entries.push([`k${i}`, i])
      }
      map.batchSet(entries)
      for (let i = 0; i < 50; i++) {
        expect(map.get(`k${i}`)).toBe(i)
      }
    })

    it('should handle batch operations interleaved with individual operations', () => {
      map.set('a', 1)
      map.batchSet([['b', 2]])
      map.set('c', 3)
      map.batchGet(['a', 'b', 'c'])
      map.batchDelete(['a'])
      expect(map.size).toBe(2)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('should return consistent statistics snapshot', () => {
      map.set('a', 1)
      map.batchSet([['b', 2]])
      const stats = map.getStatistics()
      expect(stats).toEqual({
        sets: 1,
        gets: 0,
        deletes: 0,
        batchSets: 1,
        batchGets: 0,
        batchDeletes: 0,
        totalItemsProcessed: 2,
      })
    })

    it('should handle merge with overlapping keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      const other = new BatchMap<string, number>()
      other.set('b', 20)
      other.set('c', 30)
      map.merge(other)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(20)
      expect(map.get('c')).toBe(30)
      expect(map.size).toBe(3)
    })

    it('should handle forEach with delete during iteration not affecting iteration', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys: string[] = []
      map.forEach((_, key) => {
        keys.push(key)
      })
      expect(keys.length).toBe(3)
    })

    it('should handle toArray after batch operations', () => {
      map.batchSet([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      map.batchDelete(['b'])
      const arr = map.toArray()
      expect(arr.length).toBe(2)
      const sorted = arr.sort((a, b) => a[0].localeCompare(b[0]))
      expect(sorted).toEqual([
        ['a', 1],
        ['c', 3],
      ])
    })

    it('should handle merge of two large maps', () => {
      const other = new BatchMap<string, number>()
      for (let i = 0; i < 50; i++) {
        map.set(`left${i}`, i)
        other.set(`right${i}`, i)
      }
      map.merge(other)
      expect(map.size).toBe(100)
    })

    it('should handle clear then reuse', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.isEmpty()).toBe(true)
      map.set('c', 3)
      expect(map.size).toBe(1)
      expect(map.get('c')).toBe(3)
    })

    it('should handle batchHas after batchDelete', () => {
      map.batchSet([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      map.batchDelete(['a', 'c'])
      const results = map.batchHas(['a', 'b', 'c'])
      expect(results).toEqual([false, true, false])
    })

    it('should handle numeric string keys correctly', () => {
      map.set('0', 1)
      map.set('1', 2)
      expect(map.get('0')).toBe(1)
      expect(map.get('1')).toBe(2)
    })

    it('should handle long string keys', () => {
      const longKey = 'a'.repeat(1000)
      map.set(longKey, 42)
      expect(map.get(longKey)).toBe(42)
    })

    it('should handle special character keys', () => {
      map.set('key with spaces', 1)
      map.set('key\twith\ttabs', 2)
      map.set('key\nwith\nnewlines', 3)
      expect(map.get('key with spaces')).toBe(1)
      expect(map.get('key\twith\ttabs')).toBe(2)
      expect(map.get('key\nwith\nnewlines')).toBe(3)
    })
  })
})
