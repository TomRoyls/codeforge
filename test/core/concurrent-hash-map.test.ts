import { describe, it, expect } from 'vitest'
import { ConcurrentHashMap } from '../../src/core/concurrent-hash-map/concurrent-hash-map.js'
import { DEFAULT_CONCURRENT_HASH_MAP_OPTIONS } from '../../src/core/concurrent-hash-map/concurrent-hash-map.js'
import type { ConcurrentHashMapOptions, ConcurrentHashMapStatistics } from '../../src/core/concurrent-hash-map/concurrent-hash-map.js'

describe('ConcurrentHashMap', () => {
  describe('constructor', () => {
    it('creates map with default options', () => {
      const map = new ConcurrentHashMap()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates map with custom initial capacity', () => {
      const map = new ConcurrentHashMap({ initialCapacity: 128 })
      expect(map.size).toBe(0)
    })

    it('creates map with custom concurrency level', () => {
      const map = new ConcurrentHashMap({ concurrencyLevel: 4 })
      expect(map.concurrencyLevel()).toBe(4)
    })

    it('creates map with custom load factor', () => {
      const map = new ConcurrentHashMap({ loadFactor: 0.5 })
      expect(map.size).toBe(0)
    })

    it('creates map with custom hash function', () => {
      const map = new ConcurrentHashMap<string, number>({
        hashFn: () => 0,
        concurrencyLevel: 4,
      })
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('creates map with all options', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 32,
        concurrencyLevel: 8,
        loadFactor: 0.6,
        hashFn: (key) => key.length,
      })
      expect(map.concurrencyLevel()).toBe(8)
    })

    it('creates map with empty options', () => {
      const map = new ConcurrentHashMap({})
      expect(map.size).toBe(0)
    })

    it('creates map with partial options', () => {
      const map = new ConcurrentHashMap({ concurrencyLevel: 2 })
      expect(map.concurrencyLevel()).toBe(2)
    })

    it('handles concurrency level of 1', () => {
      const map = new ConcurrentHashMap({ concurrencyLevel: 1 })
      expect(map.concurrencyLevel()).toBe(1)
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('handles high concurrency level', () => {
      const map = new ConcurrentHashMap({ concurrencyLevel: 64 })
      expect(map.concurrencyLevel()).toBe(64)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('handles string values', () => {
      const map = new ConcurrentHashMap<string, string>()
      map.set('key', 'value')
      expect(map.get('key')).toBe('value')
    })

    it('handles object values', () => {
      const map = new ConcurrentHashMap<string, object>()
      const obj = { foo: 'bar' }
      map.set('key', obj)
      expect(map.get('key')).toBe(obj)
    })

    it('handles null values', () => {
      const map = new ConcurrentHashMap<string, null>()
      map.set('key', null)
      expect(map.get('key')).toBeNull()
    })

    it('handles undefined values', () => {
      const map = new ConcurrentHashMap<string, undefined>()
      map.set('key', undefined)
      expect(map.get('key')).toBeUndefined()
    })

    it('handles array values', () => {
      const map = new ConcurrentHashMap<string, number[]>()
      map.set('arr', [1, 2, 3])
      expect(map.get('arr')).toEqual([1, 2, 3])
    })

    it('handles boolean values', () => {
      const map = new ConcurrentHashMap<string, boolean>()
      map.set('t', true)
      map.set('f', false)
      expect(map.get('t')).toBe(true)
      expect(map.get('f')).toBe(false)
    })

    it('handles empty string key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('', 42)
      expect(map.get('')).toBe(42)
    })

    it('handles special character keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key-with-special!@#$%', 1)
      expect(map.get('key-with-special!@#$%')).toBe(1)
    })

    it('handles unicode keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('日本語', 1)
      expect(map.get('日本語')).toBe(1)
    })

    it('handles long keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      const longKey = 'a'.repeat(1000)
      map.set(longKey, 99)
      expect(map.get(longKey)).toBe(99)
    })

    it('handles number keys', () => {
      const map = new ConcurrentHashMap<number, string>()
      map.set(42, 'answer')
      expect(map.get(42)).toBe('answer')
    })

    it('handles object keys', () => {
      const objKey = { id: 1 }
      const map = new ConcurrentHashMap<object, string>()
      map.set(objKey, 'val')
      expect(map.get(objKey)).toBe('val')
    })

    it('handles null keys', () => {
      const map = new ConcurrentHashMap<null, string>()
      map.set(null, 'null-val')
      expect(map.get(null)).toBe('null-val')
    })

    it('handles undefined keys', () => {
      const map = new ConcurrentHashMap<undefined, string>()
      map.set(undefined, 'undef-val')
      expect(map.get(undefined)).toBe('undef-val')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })

    it('returns true for key with undefined value', () => {
      const map = new ConcurrentHashMap<string, undefined>()
      map.set('a', undefined)
      expect(map.has('a')).toBe(true)
    })

    it('returns true for key with null value', () => {
      const map = new ConcurrentHashMap<string, null>()
      map.set('a', null)
      expect(map.has('a')).toBe(true)
    })

    it('returns true after overwrite', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('can delete and re-add', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('only deletes specified key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.has('a')).toBe(false)
      expect(map.has('b')).toBe(true)
    })

    it('handles delete from empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.delete('x')).toBe(false)
    })

    it('deletes head of bucket chain', () => {
      const map = new ConcurrentHashMap<string, number>({
        hashFn: () => 0,
        concurrencyLevel: 1,
      })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.delete('a')).toBe(true)
      expect(map.has('a')).toBe(false)
      expect(map.has('b')).toBe(true)
    })

    it('deletes middle of bucket chain', () => {
      const map = new ConcurrentHashMap<string, number>({
        hashFn: () => 0,
        concurrencyLevel: 1,
      })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.delete('b')).toBe(true)
      expect(map.has('b')).toBe(false)
      expect(map.has('a')).toBe(true)
      expect(map.has('c')).toBe(true)
    })

    it('deletes tail of bucket chain', () => {
      const map = new ConcurrentHashMap<string, number>({
        hashFn: () => 0,
        concurrencyLevel: 1,
      })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.delete('b')).toBe(true)
      expect(map.has('b')).toBe(false)
      expect(map.has('a')).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.size).toBe(0)
    })

    it('returns 1 after one set', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.size).toBe(1)
    })

    it('returns correct size after multiple sets', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
    })

    it('does not increase on overwrite', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('decreases after delete', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
    })

    it('handles many entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 500; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(500)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.isEmpty).toBe(true)
    })

    it('returns false after set', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.isEmpty).toBe(false)
    })

    it('returns true after delete of only entry', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.get('a')).toBeUndefined()
      expect(map.get('b')).toBeUndefined()
      expect(map.get('c')).toBeUndefined()
    })

    it('clears empty map without error', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(() => map.clear()).not.toThrow()
    })

    it('allows adding after clear', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.size).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.keys()).toEqual([])
    })

    it('returns keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const keys = map.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys.length).toBe(2)
    })

    it('does not return deleted keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.values()).toEqual([])
    })

    it('returns values', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const vals = map.values()
      expect(vals).toContain(1)
      expect(vals).toContain(2)
      expect(vals.length).toBe(2)
    })

    it('does not return deleted values', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.entries()).toEqual([])
    })

    it('returns entries as [key, value] pairs', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries.length).toBe(2)
      const aEntry = entries.find((e) => e[0] === 'a')
      const bEntry = entries.find((e) => e[0] === 'b')
      expect(aEntry).toEqual(['a', 1])
      expect(bEntry).toEqual(['b', 2])
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      const calls: Array<[number, string]> = []
      map.forEach((v, k) => { calls.push([v, k]) })
      expect(calls).toEqual([])
    })

    it('calls callback for each entry', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const calls: Array<[number, string]> = []
      map.forEach((v, k) => { calls.push([v, k]) })
      expect(calls.length).toBe(2)
      expect(calls).toContainEqual([1, 'a'])
      expect(calls).toContainEqual([2, 'b'])
    })

    it('passes the map as third argument', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      let received: ConcurrentHashMap<string, number> | undefined
      map.forEach((_v, _k, m) => { received = m })
      expect(received).toBe(map)
    })

    it('iterates over entries after mutations', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const calls: Array<[number, string]> = []
      map.forEach((v, k) => { calls.push([v, k]) })
      expect(calls).toEqual([[2, 'b']])
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('iterates over entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result = [...map]
      expect(result.length).toBe(2)
    })

    it('works with for-of', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries: Array<[string, number]> = []
      for (const entry of map) {
        entries.push(entry)
      }
      expect(entries.length).toBe(2)
    })
  })

  describe('computeIfAbsent', () => {
    it('returns existing value if key present', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      let called = false
      const result = map.computeIfAbsent('a', () => { called = true; return 2 })
      expect(result).toBe(1)
      expect(called).toBe(false)
    })

    it('computes and stores value if key absent', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.computeIfAbsent('a', () => 42)
      expect(result).toBe(42)
      expect(map.get('a')).toBe(42)
    })

    it('increases size when computing new value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.computeIfAbsent('a', () => 1)
      expect(map.size).toBe(1)
    })

    it('does not increase size when key exists', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.computeIfAbsent('a', () => 2)
      expect(map.size).toBe(1)
    })

    it('tracks computeIfAbsentCalls', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.computeIfAbsent('a', () => 1)
      map.computeIfAbsent('b', () => 2)
      expect(map.getStatistics().computeIfAbsentCalls).toBe(2)
    })
  })

  describe('computeIfPresent', () => {
    it('transforms existing value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      const result = map.computeIfPresent('a', (v) => v * 2)
      expect(result).toBe(2)
      expect(map.get('a')).toBe(2)
    })

    it('returns undefined for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.computeIfPresent('a', (v) => v * 2)
      expect(result).toBeUndefined()
    })

    it('does not change size', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.computeIfPresent('a', (v) => v + 1)
      expect(map.size).toBe(1)
    })

    it('does not add entry for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.computeIfPresent('a', () => 99)
      expect(map.size).toBe(0)
    })

    it('can chain transformations', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.computeIfPresent('a', (v) => v + 10)
      map.computeIfPresent('a', (v) => v * 3)
      expect(map.get('a')).toBe(33)
    })
  })

  describe('putIfAbsent', () => {
    it('puts value if key absent', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.putIfAbsent('a', 1)
      expect(result).toBeUndefined()
      expect(map.get('a')).toBe(1)
    })

    it('returns existing value if key present', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      const result = map.putIfAbsent('a', 2)
      expect(result).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('increases size only when key absent', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.putIfAbsent('a', 1)
      expect(map.size).toBe(1)
      map.putIfAbsent('a', 2)
      expect(map.size).toBe(1)
    })

    it('tracks putIfAbsentCalls', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.putIfAbsent('a', 1)
      map.putIfAbsent('b', 2)
      expect(map.getStatistics().putIfAbsentCalls).toBe(2)
    })
  })

  describe('replace', () => {
    it('replaces value when oldValue matches', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      const result = map.replace('a', 1, 2)
      expect(result).toBe(true)
      expect(map.get('a')).toBe(2)
    })

    it('does not replace when oldValue does not match', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      const result = map.replace('a', 99, 2)
      expect(result).toBe(false)
      expect(map.get('a')).toBe(1)
    })

    it('does not replace when key is missing', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.replace('a', 1, 2)
      expect(result).toBe(false)
    })

    it('works with object values using reference equality', () => {
      const obj1 = { x: 1 }
      const obj2 = { x: 2 }
      const obj3 = { x: 3 }
      const map = new ConcurrentHashMap<string, object>()
      map.set('a', obj1)
      expect(map.replace('a', obj1, obj2)).toBe(true)
      expect(map.replace('a', obj1, obj3)).toBe(false)
    })
  })

  describe('getOrDefault', () => {
    it('returns value for existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.getOrDefault('a', 99)).toBe(1)
    })

    it('returns default for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.getOrDefault('a', 99)).toBe(99)
    })

    it('does not store the default value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.getOrDefault('a', 99)
      expect(map.has('a')).toBe(false)
    })

    it('tracks gets and misses for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.getOrDefault('x', 0)
      const stats = map.getStatistics()
      expect(stats.gets).toBe(1)
      expect(stats.misses).toBe(1)
    })

    it('tracks gets and hits for existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.getOrDefault('a', 0)
      const stats = map.getStatistics()
      expect(stats.gets).toBe(1)
      expect(stats.hits).toBe(1)
    })
  })

  describe('merge', () => {
    it('inserts value when key absent', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.merge('a', 1, (old, newV) => old + newV)
      expect(result).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('merges with existing value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 10)
      const result = map.merge('a', 5, (old, newV) => old + newV)
      expect(result).toBe(15)
      expect(map.get('a')).toBe(15)
    })

    it('increases size when key absent', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.merge('a', 1, (o, n) => o + n)
      expect(map.size).toBe(1)
    })

    it('does not increase size when key present', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.merge('a', 2, (o, n) => o + n)
      expect(map.size).toBe(1)
    })

    it('can be used for counting', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 5; i++) {
        map.merge('count', 1, (o, n) => o + n)
      }
      expect(map.get('count')).toBe(5)
    })

    it('uses remappingFn for merge logic', () => {
      const map = new ConcurrentHashMap<string, string>()
      map.set('a', 'hello')
      const result = map.merge('a', ' world', (old, newV) => old + newV)
      expect(result).toBe('hello world')
    })
  })

  describe('resize', () => {
    it('resizes to larger capacity', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.resize(256)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(2)
    })

    it('resizes to smaller capacity', () => {
      const map = new ConcurrentHashMap<string, number>({ initialCapacity: 128 })
      map.set('a', 1)
      map.set('b', 2)
      map.resize(16)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('tracks resizes in statistics', () => {
      const map = new ConcurrentHashMap<string, number>({ concurrencyLevel: 2 })
      map.set('a', 1)
      map.resize(128)
      expect(map.getStatistics().resizes).toBeGreaterThan(0)
    })

    it('preserves all entries after resize', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      map.resize(512)
      for (let i = 0; i < 100; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
      expect(map.size).toBe(100)
    })

    it('allows operations after resize', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.resize(128)
      map.set('b', 2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('striped locking behavior', () => {
    it('distributes keys across segments', () => {
      const map = new ConcurrentHashMap<string, number>({ concurrencyLevel: 4 })
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      const keys = map.keys()
      expect(keys.length).toBe(100)
    })

    it('all keys go to same segment with constant hash', () => {
      const map = new ConcurrentHashMap<string, number>({
        hashFn: () => 0,
        concurrencyLevel: 4,
      })
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(10)
    })

    it('segment lock contentions tracked', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.get('a')
      map.get('a')
      expect(typeof map.getStatistics().segmentLockContentions).toBe('number')
    })

    it('handles single segment', () => {
      const map = new ConcurrentHashMap<string, number>({
        concurrencyLevel: 1,
        hashFn: () => 0,
      })
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })
  })

  describe('auto-resize', () => {
    it('auto-resizes when load factor exceeded', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 4,
        concurrencyLevel: 1,
        loadFactor: 0.75,
      })
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })

    it('tracks auto-resizes in statistics', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 4,
        concurrencyLevel: 1,
        loadFactor: 0.5,
      })
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getStatistics().resizes).toBeGreaterThan(0)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const map = new ConcurrentHashMap<string, number>()
      const stats = map.getStatistics()
      expect(stats.gets).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.resizes).toBe(0)
      expect(stats.putIfAbsentCalls).toBe(0)
      expect(stats.computeIfAbsentCalls).toBe(0)
      expect(stats.segmentLockContentions).toBe(0)
    })

    it('tracks sets', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getStatistics().sets).toBe(2)
    })

    it('tracks gets', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.get('a')
      map.get('b')
      expect(map.getStatistics().gets).toBe(2)
    })

    it('tracks deletes', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.delete('a')
      map.delete('b')
      expect(map.getStatistics().deletes).toBe(2)
    })

    it('tracks hits', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.get('a')
      expect(map.getStatistics().hits).toBe(1)
    })

    it('tracks misses', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.get('missing')
      expect(map.getStatistics().misses).toBe(1)
    })

    it('returns a copy of statistics', () => {
      const map = new ConcurrentHashMap<string, number>()
      const stats1 = map.getStatistics()
      const stats2 = map.getStatistics()
      expect(stats1).not.toBe(stats2)
    })

    it('cumulative statistics across operations', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.get('a')
      map.get('a')
      map.delete('a')
      const stats = map.getStatistics()
      expect(stats.sets).toBe(1)
      expect(stats.gets).toBe(2)
      expect(stats.deletes).toBe(1)
      expect(stats.hits).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('serializes empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      const json = map.toJSON()
      expect(json).toEqual({ entries: [] })
    })

    it('serializes map with entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const json = map.toJSON()
      expect(json).toEqual({ entries: [['a', 1], ['b', 2]] })
    })

    it('serializes with JSON.stringify', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      const str = JSON.stringify(map.toJSON())
      expect(str).toContain('"a"')
      expect(str).toContain('1')
    })
  })

  describe('fromJSON', () => {
    it('deserializes empty map', () => {
      const map = ConcurrentHashMap.fromJSON<string, number>({ entries: [] })
      expect(map.size).toBe(0)
    })

    it('deserializes map with entries', () => {
      const map = ConcurrentHashMap.fromJSON<string, number>({
        entries: [['a', 1], ['b', 2]],
      })
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('round-trips through JSON serialization', () => {
      const original = new ConcurrentHashMap<string, number>()
      original.set('a', 1)
      original.set('b', 2)
      original.set('c', 3)
      const json = original.toJSON()
      const restored = ConcurrentHashMap.fromJSON<string, number>(json as { entries: Array<[string, number]> })
      expect(restored.size).toBe(3)
      expect(restored.get('a')).toBe(1)
      expect(restored.get('b')).toBe(2)
      expect(restored.get('c')).toBe(3)
    })

    it('round-trip preserves complex values', () => {
      const original = new ConcurrentHashMap<string, object>()
      original.set('obj', { nested: { deep: true } })
      const json = original.toJSON()
      const restored = ConcurrentHashMap.fromJSON<string, object>(json as { entries: Array<[string, object]> })
      expect(restored.get('obj')).toEqual({ nested: { deep: true } })
    })
  })

  describe('DEFAULT_CONCURRENT_HASH_MAP_OPTIONS', () => {
    it('has default initialCapacity of 64', () => {
      expect(DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.initialCapacity).toBe(64)
    })

    it('has default concurrencyLevel of 16', () => {
      expect(DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.concurrencyLevel).toBe(16)
    })

    it('has default loadFactor of 0.75', () => {
      expect(DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.loadFactor).toBe(0.75)
    })

    it('has default hashFn', () => {
      expect(typeof DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.hashFn).toBe('function')
    })
  })

  describe('type imports', () => {
    it('ConcurrentHashMapOptions type is usable', () => {
      const opts: ConcurrentHashMapOptions<string> = {
        initialCapacity: 32,
        concurrencyLevel: 4,
        loadFactor: 0.75,
        hashFn: (key) => key.length,
      }
      const map = new ConcurrentHashMap<string, number>(opts)
      expect(map.concurrencyLevel()).toBe(4)
    })

    it('ConcurrentHashMapStatistics type is usable', () => {
      const map = new ConcurrentHashMap<string, number>()
      const stats: ConcurrentHashMapStatistics = map.getStatistics()
      expect(typeof stats.gets).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('handles many entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 1000; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(1000)
    })

    it('handles many resizes', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 2,
        concurrencyLevel: 1,
        loadFactor: 0.5,
      })
      for (let i = 0; i < 200; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })

    it('set same key many times', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 100; i++) {
        map.set('a', i)
      }
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(99)
    })

    it('get, has, delete on empty map do not throw', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(() => map.get('x')).not.toThrow()
      expect(() => map.has('x')).not.toThrow()
      expect(() => map.delete('x')).not.toThrow()
    })

    it('delete non-existent key returns false', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.delete('nope')).toBe(false)
    })

    it('handles hash returning 0', () => {
      const map = new ConcurrentHashMap<string, number>({
        hashFn: () => 0,
        concurrencyLevel: 4,
      })
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('handles hash returning large numbers', () => {
      const map = new ConcurrentHashMap<string, number>({
        hashFn: () => 1000000,
        concurrencyLevel: 4,
      })
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('works with number type keys', () => {
      const map = new ConcurrentHashMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
    })

    it('works with boolean type keys', () => {
      const map = new ConcurrentHashMap<boolean, string>()
      map.set(true, 'yes')
      map.set(false, 'no')
      expect(map.get(true)).toBe('yes')
      expect(map.get(false)).toBe('no')
    })

    it('clear and reuse', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 50; i++) {
        map.set(`key${i}`, i)
      }
      map.clear()
      expect(map.size).toBe(0)
      for (let i = 0; i < 50; i++) {
        map.set(`new${i}`, i)
      }
      expect(map.size).toBe(50)
    })

    it('all methods work together', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.putIfAbsent('b', 2)
      map.computeIfAbsent('c', () => 3)
      expect(map.get('a')).toBe(1)
      expect(map.getOrDefault('b', 0)).toBe(2)
      expect(map.get('c')).toBe(3)
      map.computeIfPresent('a', (v) => v + 10)
      expect(map.get('a')).toBe(11)
      expect(map.replace('a', 11, 20)).toBe(true)
      expect(map.get('a')).toBe(20)
      map.merge('a', 5, (o, n) => o + n)
      expect(map.get('a')).toBe(25)
      expect(map.size).toBe(3)
      expect(map.isEmpty).toBe(false)
      expect(map.has('a')).toBe(true)
      expect(map.delete('a')).toBe(true)
      expect(map.size).toBe(2)
    })
  })
})
