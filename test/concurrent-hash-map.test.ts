import { ConcurrentHashMap, DEFAULT_CONCURRENT_HASH_MAP_OPTIONS } from '../src/core/concurrent-hash-map/concurrent-hash-map.js'
import type { ConcurrentHashMapOptions, ConcurrentHashMapStatistics } from '../src/core/concurrent-hash-map/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('ConcurrentHashMap', () => {
  describe('constructor', () => {
    it('creates an empty map with default options', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates a map with custom concurrency level', () => {
      const map = new ConcurrentHashMap<string, number>({ concurrencyLevel: 4 })
      expect(map.concurrencyLevel()).toBe(4)
      expect(map.size).toBe(0)
    })

    it('creates a map with custom initial capacity', () => {
      const map = new ConcurrentHashMap<string, number>({ initialCapacity: 128 })
      expect(map.size).toBe(0)
    })

    it('creates a map with custom load factor', () => {
      const map = new ConcurrentHashMap<string, number>({ loadFactor: 0.5 })
      expect(map.size).toBe(0)
    })

    it('creates a map with custom hash function', () => {
      let called = false
      const map = new ConcurrentHashMap<string, number>({
        hashFn: (key: string) => {
          called = true
          return key.length
        },
      })
      map.set('hello', 1)
      expect(called).toBe(true)
    })

    it('uses default options when no options provided', () => {
      const map = new ConcurrentHashMap()
      expect(map.concurrencyLevel()).toBe(DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.concurrencyLevel)
    })

    it('handles concurrencyLevel of 1', () => {
      const map = new ConcurrentHashMap<string, number>({ concurrencyLevel: 1, initialCapacity: 4 })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
    })

    it('handles partial options with defaults', () => {
      const map = new ConcurrentHashMap<string, number>({ concurrencyLevel: 8 })
      expect(map.concurrencyLevel()).toBe(8)
      expect(map.size).toBe(0)
    })
  })

  // ─── Default Options ──────────────────────────────────────────────────

  describe('DEFAULT_CONCURRENT_HASH_MAP_OPTIONS', () => {
    it('has correct default initialCapacity', () => {
      expect(DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.initialCapacity).toBe(64)
    })

    it('has correct default concurrencyLevel', () => {
      expect(DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.concurrencyLevel).toBe(16)
    })

    it('has correct default loadFactor', () => {
      expect(DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.loadFactor).toBe(0.75)
    })

    it('has a default hashFn that returns a number', () => {
      const hash = DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.hashFn('test')
      expect(typeof hash).toBe('number')
    })

    it('default hashFn produces consistent results', () => {
      const a = DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.hashFn('hello')
      const b = DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.hashFn('hello')
      expect(a).toBe(b)
    })

    it('default hashFn produces different results for different keys', () => {
      const a = DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.hashFn('hello')
      const b = DEFAULT_CONCURRENT_HASH_MAP_OPTIONS.hashFn('world')
      expect(a).not.toBe(b)
    })
  })

  // ─── get / set ────────────────────────────────────────────────────────

  describe('get and set', () => {
    it('sets and gets a value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('returns undefined for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing key with new value', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('handles multiple keys correctly', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('handles numeric keys', () => {
      const map = new ConcurrentHashMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
    })

    it('handles object values', () => {
      const map = new ConcurrentHashMap<string, { id: number }>()
      map.set('obj', { id: 42 })
      expect(map.get('obj')).toEqual({ id: 42 })
    })

    it('handles undefined value stored', () => {
      const map = new ConcurrentHashMap<string, number | undefined>()
      map.set('key', undefined)
      expect(map.get('key')).toBeUndefined()
      expect(map.has('key')).toBe(true)
    })

    it('handles null value', () => {
      const map = new ConcurrentHashMap<string, null>()
      map.set('key', null)
      expect(map.get('key')).toBeNull()
    })

    it('set does not increase size when overwriting', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      expect(map.size).toBe(1)
      map.set('key', 2)
      expect(map.size).toBe(1)
    })

    it('get on empty map returns undefined', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.get('anything')).toBeUndefined()
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      expect(map.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.has('missing')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.has('anything')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.delete('key')
      expect(map.has('key')).toBe(false)
    })

    it('returns true for key with undefined value', () => {
      const map = new ConcurrentHashMap<string, number | undefined>()
      map.set('key', undefined)
      expect(map.has('key')).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes an existing key and returns true', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      expect(map.delete('key')).toBe(true)
      expect(map.get('key')).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.delete('anything')).toBe(false)
    })

    it('decrements size when removing', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('deleting same key twice returns true then false', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      expect(map.delete('key')).toBe(true)
      expect(map.delete('key')).toBe(false)
    })

    it('does not affect other keys when deleting', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.get('a')).toBe(1)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(2)
    })
  })

  // ─── size / isEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.size).toBe(0)
    })

    it('isEmpty is true for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.isEmpty).toBe(true)
    })

    it('size increments on set of new key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
    })

    it('isEmpty becomes false after insertion', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      expect(map.isEmpty).toBe(false)
    })

    it('size returns to 0 after delete all', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('clear on empty map is a no-op', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('allows new entries after clear', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.size).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('old keys are gone after clear', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      expect(map.has('a')).toBe(false)
      expect(map.get('a')).toBeUndefined()
    })
  })

  // ─── keys / values / entries ──────────────────────────────────────────

  describe('keys', () => {
    it('returns empty array for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.keys()).toEqual([])
    })

    it('returns all keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = map.keys()
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.values()).toEqual([])
    })

    it('returns all values', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const values = map.values()
      expect(values.sort()).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.entries()).toEqual([])
    })

    it('returns all key-value pairs', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries).toHaveLength(2)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      let callCount = 0
      map.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })

    it('iterates over all entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const result: Array<[string, number]> = []
      map.forEach((value, key) => { result.push([key, value]) })
      expect(result).toHaveLength(3)
      expect(result).toContainEqual(['a', 1])
      expect(result).toContainEqual(['b', 2])
      expect(result).toContainEqual(['c', 3])
    })

    it('passes the map instance as third argument', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      let received: ConcurrentHashMap<string, number> | undefined
      map.forEach((_v, _k, m) => { received = m })
      expect(received).toBe(map)
    })
  })

  // ─── Symbol.iterator ─────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('iterates over all entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result = [...map]
      expect(result).toHaveLength(2)
      expect(result).toContainEqual(['a', 1])
      expect(result).toContainEqual(['b', 2])
    })

    it('works with for-of loop', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      const result: Array<[string, number]> = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toHaveLength(2)
    })
  })

  // ─── computeIfAbsent ─────────────────────────────────────────────────

  describe('computeIfAbsent', () => {
    it('computes and stores value for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.computeIfAbsent('key', () => 42)
      expect(result).toBe(42)
      expect(map.get('key')).toBe(42)
    })

    it('returns existing value without computing', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      let fnCalled = false
      const result = map.computeIfAbsent('key', () => { fnCalled = true; return 2 })
      expect(result).toBe(1)
      expect(fnCalled).toBe(false)
    })

    it('increments size when new key is added', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.computeIfAbsent('key', () => 42)
      expect(map.size).toBe(1)
    })

    it('does not increment size for existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.computeIfAbsent('key', () => 2)
      expect(map.size).toBe(1)
    })
  })

  // ─── computeIfPresent ────────────────────────────────────────────────

  describe('computeIfPresent', () => {
    it('updates value for existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      const result = map.computeIfPresent('key', (v) => v * 10)
      expect(result).toBe(10)
      expect(map.get('key')).toBe(10)
    })

    it('returns undefined for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.computeIfPresent('missing', (v) => v)
      expect(result).toBeUndefined()
    })

    it('does not call fn for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      let fnCalled = false
      map.computeIfPresent('missing', () => { fnCalled = true; return 0 })
      expect(fnCalled).toBe(false)
    })

    it('does not change size', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.computeIfPresent('key', (v) => v + 1)
      expect(map.size).toBe(1)
    })
  })

  // ─── putIfAbsent ─────────────────────────────────────────────────────

  describe('putIfAbsent', () => {
    it('puts value for missing key and returns undefined', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.putIfAbsent('key', 42)
      expect(result).toBeUndefined()
      expect(map.get('key')).toBe(42)
    })

    it('returns existing value without putting', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      const result = map.putIfAbsent('key', 2)
      expect(result).toBe(1)
      expect(map.get('key')).toBe(1)
    })

    it('increments size only when key is absent', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.putIfAbsent('key', 1)
      expect(map.size).toBe(1)
      map.putIfAbsent('key', 2)
      expect(map.size).toBe(1)
    })
  })

  // ─── replace ─────────────────────────────────────────────────────────

  describe('replace', () => {
    it('replaces value when old value matches', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      expect(map.replace('key', 1, 2)).toBe(true)
      expect(map.get('key')).toBe(2)
    })

    it('returns false when old value does not match', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      expect(map.replace('key', 99, 2)).toBe(false)
      expect(map.get('key')).toBe(1)
    })

    it('returns false when key does not exist', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.replace('missing', 1, 2)).toBe(false)
    })

    it('does not change size on successful replace', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.replace('key', 1, 2)
      expect(map.size).toBe(1)
    })
  })

  // ─── getOrDefault ────────────────────────────────────────────────────

  describe('getOrDefault', () => {
    it('returns value for existing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 42)
      expect(map.getOrDefault('key', 0)).toBe(42)
    })

    it('returns default for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.getOrDefault('missing', 99)).toBe(99)
    })

    it('returns default on empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.getOrDefault('anything', -1)).toBe(-1)
    })
  })

  // ─── merge ───────────────────────────────────────────────────────────

  describe('merge', () => {
    it('inserts value for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      const result = map.merge('key', 10, (old, newVal) => old + newVal)
      expect(result).toBe(10)
      expect(map.get('key')).toBe(10)
    })

    it('merges with existing value using remapping function', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 5)
      const result = map.merge('key', 10, (old, newVal) => old + newVal)
      expect(result).toBe(15)
      expect(map.get('key')).toBe(15)
    })

    it('increments size only when key is absent', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.merge('key', 1, (a, b) => a + b)
      expect(map.size).toBe(1)
      map.merge('key', 2, (a, b) => a + b)
      expect(map.size).toBe(1)
    })
  })

  // ─── resize ──────────────────────────────────────────────────────────

  describe('resize', () => {
    it('resizes to a larger capacity', () => {
      const map = new ConcurrentHashMap<string, number>({ initialCapacity: 4, concurrencyLevel: 2 })
      map.set('a', 1)
      map.set('b', 2)
      map.resize(32)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(2)
    })

    it('preserves all data after resize', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
      map.resize(256)
      for (let i = 0; i < 10; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })
  })

  // ─── concurrencyLevel ────────────────────────────────────────────────

  describe('concurrencyLevel', () => {
    it('returns the configured concurrency level', () => {
      const map = new ConcurrentHashMap<string, number>({ concurrencyLevel: 8 })
      expect(map.concurrencyLevel()).toBe(8)
    })

    it('returns default concurrency level when not specified', () => {
      const map = new ConcurrentHashMap<string, number>()
      expect(map.concurrencyLevel()).toBe(16)
    })
  })

  // ─── getStatistics ───────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns initial statistics with all zeros', () => {
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

    it('tracks get operations and hits', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.get('key')
      map.get('key')
      const stats = map.getStatistics()
      expect(stats.gets).toBe(2)
      expect(stats.hits).toBe(2)
    })

    it('tracks get misses', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.get('missing')
      expect(map.getStatistics().misses).toBe(1)
    })

    it('tracks set operations', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getStatistics().sets).toBe(2)
    })

    it('tracks delete operations', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.delete('key')
      map.delete('missing')
      expect(map.getStatistics().deletes).toBe(2)
    })

    it('tracks putIfAbsentCalls', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.putIfAbsent('key', 1)
      expect(map.getStatistics().putIfAbsentCalls).toBe(1)
    })

    it('tracks computeIfAbsentCalls', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.computeIfAbsent('key', () => 1)
      expect(map.getStatistics().computeIfAbsentCalls).toBe(1)
    })

    it('returns a copy of statistics', () => {
      const map = new ConcurrentHashMap<string, number>()
      const stats1 = map.getStatistics()
      stats1.gets = 999
      const stats2 = map.getStatistics()
      expect(stats2.gets).toBe(0)
    })

    it('statistics type has correct shape', () => {
      const map = new ConcurrentHashMap<string, number>()
      const stats: ConcurrentHashMapStatistics = map.getStatistics()
      expect(typeof stats.gets).toBe('number')
      expect(typeof stats.sets).toBe('number')
      expect(typeof stats.deletes).toBe('number')
      expect(typeof stats.hits).toBe('number')
      expect(typeof stats.misses).toBe('number')
      expect(typeof stats.resizes).toBe('number')
      expect(typeof stats.putIfAbsentCalls).toBe('number')
      expect(typeof stats.computeIfAbsentCalls).toBe('number')
      expect(typeof stats.segmentLockContentions).toBe('number')
    })
  })

  // ─── toJSON / fromJSON ───────────────────────────────────────────────

  describe('toJSON and fromJSON', () => {
    it('toJSON returns entries array', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const json = map.toJSON()
      expect(json).toEqual({ entries: [['a', 1], ['b', 2]] })
    })

    it('toJSON returns empty entries for empty map', () => {
      const map = new ConcurrentHashMap<string, number>()
      const json = map.toJSON()
      expect(json).toEqual({ entries: [] })
    })

    it('fromJSON creates a map from serialized data', () => {
      const data: { entries: Array<[string, number]> } = { entries: [['a', 1], ['b', 2]] }
      const map = ConcurrentHashMap.fromJSON<string, number>(data)
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('fromJSON creates empty map from empty data', () => {
      const map = ConcurrentHashMap.fromJSON<string, number>({ entries: [] })
      expect(map.size).toBe(0)
    })

    it('round-trip preserves data', () => {
      const original = new ConcurrentHashMap<string, number>()
      original.set('x', 10)
      original.set('y', 20)
      const json = original.toJSON() as { entries: Array<[string, number]> }
      const restored = ConcurrentHashMap.fromJSON<string, number>(json)
      expect(restored.size).toBe(original.size)
      expect(restored.get('x')).toBe(10)
      expect(restored.get('y')).toBe(20)
    })
  })

  // ─── Hash Collisions ─────────────────────────────────────────────────

  describe('hash collisions', () => {
    it('handles keys with same hash correctly', () => {
      const map = new ConcurrentHashMap<string, number>({
        concurrencyLevel: 1,
        initialCapacity: 1,
        hashFn: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('deletes from colliding entries correctly', () => {
      const map = new ConcurrentHashMap<string, number>({
        concurrencyLevel: 1,
        initialCapacity: 1,
        hashFn: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.delete('b')).toBe(true)
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('c')).toBe(3)
      expect(map.get('b')).toBeUndefined()
    })

    it('overwrites correct key in collision chain', () => {
      const map = new ConcurrentHashMap<string, number>({
        concurrencyLevel: 1,
        initialCapacity: 1,
        hashFn: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      map.set('a', 99)
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(99)
      expect(map.get('b')).toBe(2)
    })

    it('deletes head of collision chain', () => {
      const map = new ConcurrentHashMap<string, number>({
        concurrencyLevel: 1,
        initialCapacity: 1,
        hashFn: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.delete('a')).toBe(true)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  // ─── Load Factor / Auto-Resize ───────────────────────────────────────

  describe('load factor and auto-resize', () => {
    it('triggers resize when load factor exceeded', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 2,
        concurrencyLevel: 1,
        loadFactor: 0.75,
      })
      map.set('a', 1)
      map.set('b', 2)
      // load factor = 2/2 = 1.0 >= 0.75, should resize
      expect(map.getStatistics().resizes).toBeGreaterThan(0)
    })

    it('does not resize when under load factor', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 100,
        concurrencyLevel: 1,
        loadFactor: 0.75,
      })
      map.set('a', 1)
      expect(map.getStatistics().resizes).toBe(0)
    })

    it('data preserved after auto-resize', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 2,
        concurrencyLevel: 1,
        loadFactor: 0.75,
      })
      for (let i = 0; i < 20; i++) {
        map.set(`key${i}`, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
      expect(map.size).toBe(20)
    })

    it('custom load factor of 1.0 delays resize', () => {
      const map = new ConcurrentHashMap<string, number>({
        initialCapacity: 4,
        concurrencyLevel: 1,
        loadFactor: 1.0,
      })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      // 3/4 = 0.75 < 1.0, no resize yet
      expect(map.getStatistics().resizes).toBe(0)
      map.set('d', 4)
      // 4/4 = 1.0 >= 1.0, should resize
      expect(map.getStatistics().resizes).toBeGreaterThan(0)
    })
  })

  // ─── Rapid Sequential Access (Concurrent-like) ───────────────────────

  describe('rapid sequential access', () => {
    it('handles many insertions and deletions', () => {
      const map = new ConcurrentHashMap<number, string>()
      for (let i = 0; i < 100; i++) {
        map.set(i, `val${i}`)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(50)
      expect(map.get(50)).toBe('val50')
      expect(map.get(0)).toBeUndefined()
    })

    it('handles interleaved operations', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.set('c', 3)
      map.set('b', 20)
      expect(map.size).toBe(2)
      expect(map.get('b')).toBe(20)
      expect(map.get('c')).toBe(3)
      expect(map.has('a')).toBe(false)
    })

    it('handles putIfAbsent and computeIfAbsent interleaved', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.putIfAbsent('a', 1)
      map.computeIfAbsent('b', () => 2)
      map.putIfAbsent('a', 99)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('handles merge after multiple sets', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('counter', 0)
      for (let i = 0; i < 10; i++) {
        map.merge('counter', 1, (old, newVal) => old + newVal)
      }
      expect(map.get('counter')).toBe(10)
    })

    it('handles replace after set and delete cycle', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.replace('key', 1, 2)
      map.delete('key')
      expect(map.replace('key', 2, 3)).toBe(false)
      map.set('key', 10)
      expect(map.replace('key', 10, 20)).toBe(true)
      expect(map.get('key')).toBe(20)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty string as key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('', 42)
      expect(map.get('')).toBe(42)
      expect(map.has('')).toBe(true)
    })

    it('handles boolean keys', () => {
      const map = new ConcurrentHashMap<boolean, string>()
      map.set(true, 'yes')
      map.set(false, 'no')
      expect(map.get(true)).toBe('yes')
      expect(map.get(false)).toBe('no')
    })

    it('handles zero as key', () => {
      const map = new ConcurrentHashMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('clear and re-populate', () => {
      const map = new ConcurrentHashMap<string, number>()
      for (let i = 0; i < 10; i++) map.set(`k${i}`, i)
      map.clear()
      expect(map.size).toBe(0)
      for (let i = 0; i < 5; i++) map.set(`new${i}`, i)
      expect(map.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(map.get(`new${i}`)).toBe(i)
      }
    })

    it('forEach after clear does not iterate old entries', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      const keys: string[] = []
      map.forEach((_v, k) => keys.push(k))
      expect(keys).toEqual(['b'])
    })

    it('keys/values/entries consistent after modifications', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const keys = map.keys().sort()
      const values = map.values().sort()
      const entries = map.entries().sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      expect(keys).toEqual(['a', 'c'])
      expect(values).toEqual([1, 3])
      expect(entries).toEqual([['a', 1], ['c', 3]])
    })

    it('getOrDefault does not affect statistics misses for found keys', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.set('key', 1)
      map.getOrDefault('key', 0)
      const stats = map.getStatistics()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(0)
    })

    it('getOrDefault increments misses for missing key', () => {
      const map = new ConcurrentHashMap<string, number>()
      map.getOrDefault('missing', 42)
      expect(map.getStatistics().misses).toBe(1)
    })

    it('many entries with custom hash distributing across segments', () => {
      const map = new ConcurrentHashMap<string, number>({ concurrencyLevel: 4 })
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })

    it('computeIfPresent can set value to undefined', () => {
      const map = new ConcurrentHashMap<string, number | undefined>()
      map.set('key', 1)
      const result = map.computeIfPresent('key', () => undefined)
      expect(result).toBeUndefined()
      expect(map.get('key')).toBeUndefined()
      expect(map.has('key')).toBe(true)
    })
  })
})
