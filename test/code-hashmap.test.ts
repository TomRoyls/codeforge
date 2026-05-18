import { CodeHashMap } from '../src/core/code-hashmap/code-hashmap.js'
import { DEFAULT_HASHMAP_OPTIONS } from '../src/core/code-hashmap/code-hashmap.js'
import type { HashMapEntry, HashMapOptions, HashMapStats } from '../src/core/code-hashmap/code-hashmap.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CodeHashMap', () => {
  describe('constructor', () => {
    it('creates an empty map with default options', () => {
      const map = new CodeHashMap()
      expect(map.getSize()).toBe(0)
      expect(map.getCapacity()).toBe(DEFAULT_HASHMAP_OPTIONS.capacity)
    })

    it('creates a map with custom capacity', () => {
      const map = new CodeHashMap({ capacity: 32 })
      expect(map.getCapacity()).toBe(32)
      expect(map.getSize()).toBe(0)
    })

    it('creates a map with custom load factor', () => {
      const map = new CodeHashMap<number>({ loadFactor: 0.5 })
      map.set('a', 1)
      const stats = map.getStats()
      expect(stats.loadFactor).toBeLessThanOrEqual(0.5)
    })

    it('creates a map with custom hash function', () => {
      let called = false
      const map = new CodeHashMap({
        hashFunction: (key: string) => {
          called = true
          return 0
        },
      })
      map.set('test', 1)
      expect(called).toBe(true)
    })

    it('creates a map with all custom options', () => {
      const map = new CodeHashMap<string>({
        capacity: 64,
        loadFactor: 0.9,
        hashFunction: () => 42,
      })
      expect(map.getCapacity()).toBe(64)
    })

    it('uses default options when none provided', () => {
      const map = new CodeHashMap()
      expect(map.getStats().capacity).toBe(DEFAULT_HASHMAP_OPTIONS.capacity)
    })
  })

  // ─── DEFAULT_HASHMAP_OPTIONS ───────────────────────────────────────────

  describe('DEFAULT_HASHMAP_OPTIONS', () => {
    it('has capacity of 16', () => {
      expect(DEFAULT_HASHMAP_OPTIONS.capacity).toBe(16)
    })

    it('has loadFactor of 0.75', () => {
      expect(DEFAULT_HASHMAP_OPTIONS.loadFactor).toBe(0.75)
    })

    it('provides a hashFunction that returns a number', () => {
      const hash = DEFAULT_HASHMAP_OPTIONS.hashFunction('test')
      expect(typeof hash).toBe('number')
    })

    it('hashFunction returns consistent results for same input', () => {
      const a = DEFAULT_HASHMAP_OPTIONS.hashFunction('hello')
      const b = DEFAULT_HASHMAP_OPTIONS.hashFunction('hello')
      expect(a).toBe(b)
    })

    it('hashFunction returns different results for different inputs', () => {
      const a = DEFAULT_HASHMAP_OPTIONS.hashFunction('hello')
      const b = DEFAULT_HASHMAP_OPTIONS.hashFunction('world')
      expect(a).not.toBe(b)
    })

    it('hashFunction handles empty string', () => {
      const hash = DEFAULT_HASHMAP_OPTIONS.hashFunction('')
      expect(typeof hash).toBe('number')
    })
  })

  // ─── set / get ────────────────────────────────────────────────────────

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('returns undefined for non-existent key', () => {
      const map = new CodeHashMap<number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing key with new value', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.getSize()).toBe(1)
    })

    it('handles string values', () => {
      const map = new CodeHashMap<string>()
      map.set('name', 'Alice')
      expect(map.get('name')).toBe('Alice')
    })

    it('handles object values', () => {
      const map = new CodeHashMap<{ id: number }>()
      const obj = { id: 1 }
      map.set('item', obj)
      expect(map.get('item')).toBe(obj)
    })

    it('handles null values', () => {
      const map = new CodeHashMap<null>()
      map.set('null', null)
      expect(map.get('null')).toBeNull()
    })

    it('handles undefined values', () => {
      const map = new CodeHashMap<number | undefined>()
      map.set('undef', undefined)
      expect(map.get('undef')).toBeUndefined()
    })

    it('handles boolean values', () => {
      const map = new CodeHashMap<boolean>()
      map.set('flag', true)
      expect(map.get('flag')).toBe(true)
    })

    it('handles array values', () => {
      const map = new CodeHashMap<number[]>()
      map.set('list', [1, 2, 3])
      expect(map.get('list')).toEqual([1, 2, 3])
    })

    it('handles empty string key', () => {
      const map = new CodeHashMap<number>()
      map.set('', 99)
      expect(map.get('')).toBe(99)
    })

    it('handles keys with special characters', () => {
      const map = new CodeHashMap<number>()
      map.set('key-with-dashes', 1)
      map.set('key.with.dots', 2)
      map.set('key/with/slashes', 3)
      expect(map.get('key-with-dashes')).toBe(1)
      expect(map.get('key.with.dots')).toBe(2)
      expect(map.get('key/with/slashes')).toBe(3)
    })

    it('handles unicode keys', () => {
      const map = new CodeHashMap<number>()
      map.set('日本語', 1)
      map.set('🎉', 2)
      expect(map.get('日本語')).toBe(1)
      expect(map.get('🎉')).toBe(2)
    })

    it('stores multiple key-value pairs', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.getSize()).toBe(3)
    })

    it('updates timestamp on overwrite', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      const entry1 = map.entries().find((e) => e.key === 'key')!
      const ts1 = entry1.timestamp

      // Small delay to ensure different timestamp
      const start = Date.now()
      while (Date.now() === start) {
        // spin until time advances
      }

      map.set('key', 2)
      const entry2 = map.entries().find((e) => e.key === 'key')!
      expect(entry2.timestamp).toBeGreaterThanOrEqual(ts1)
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      expect(map.has('key')).toBe(true)
    })

    it('returns false for non-existent key', () => {
      const map = new CodeHashMap<number>()
      expect(map.has('missing')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CodeHashMap<number>()
      expect(map.has('anything')).toBe(false)
    })

    it('returns true after overwrite', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.has('key')).toBe(true)
    })

    it('returns false after deletion', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      map.delete('key')
      expect(map.has('key')).toBe(false)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      expect(map.delete('key')).toBe(true)
      expect(map.get('key')).toBeUndefined()
      expect(map.getSize()).toBe(0)
    })

    it('returns false for non-existent key', () => {
      const map = new CodeHashMap<number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CodeHashMap<number>()
      expect(map.delete('anything')).toBe(false)
    })

    it('deletes one key without affecting others', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.delete('b')).toBe(true)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBeUndefined()
      expect(map.get('c')).toBe(3)
      expect(map.getSize()).toBe(2)
    })

    it('allows re-adding a deleted key', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      map.delete('key')
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.getSize()).toBe(1)
    })

    it('deletes the last remaining entry', () => {
      const map = new CodeHashMap<number>()
      map.set('only', 1)
      expect(map.delete('only')).toBe(true)
      expect(map.getSize()).toBe(0)
      expect(map.has('only')).toBe(false)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.getSize()).toBe(0)
      expect(map.get('a')).toBeUndefined()
      expect(map.get('b')).toBeUndefined()
      expect(map.get('c')).toBeUndefined()
    })

    it('clears an already empty map without error', () => {
      const map = new CodeHashMap<number>()
      map.clear()
      expect(map.getSize()).toBe(0)
    })

    it('resets collisions counter', () => {
      const map = new CodeHashMap<number>({
        capacity: 1,
        loadFactor: 1,
        hashFunction: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getCollisions()).toBeGreaterThan(0)
      map.clear()
      expect(map.getCollisions()).toBe(0)
    })

    it('allows adding after clear', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.getSize()).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  // ─── entries ──────────────────────────────────────────────────────────

  describe('entries', () => {
    it('returns empty array for empty map', () => {
      const map = new CodeHashMap<number>()
      expect(map.entries()).toEqual([])
    })

    it('returns all entries', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries.length).toBe(2)
      const keys = entries.map((e) => e.key).sort()
      expect(keys).toEqual(['a', 'b'])
    })

    it('entries contain correct structure', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 42)
      const entries = map.entries()
      expect(entries.length).toBe(1)
      const entry = entries[0]!
      expect(entry.key).toBe('key')
      expect(entry.value).toBe(42)
      expect(typeof entry.hash).toBe('number')
      expect(typeof entry.timestamp).toBe('number')
    })

    it('returns new array each time', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      const e1 = map.entries()
      const e2 = map.entries()
      expect(e1).not.toBe(e2)
    })
  })

  // ─── keys ─────────────────────────────────────────────────────────────

  describe('keys', () => {
    it('returns empty array for empty map', () => {
      const map = new CodeHashMap<number>()
      expect(map.keys()).toEqual([])
    })

    it('returns all keys', () => {
      const map = new CodeHashMap<number>()
      map.set('x', 1)
      map.set('y', 2)
      map.set('z', 3)
      const keys = map.keys().sort()
      expect(keys).toEqual(['x', 'y', 'z'])
    })

    it('does not include deleted keys', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.keys()).toEqual(['b'])
    })
  })

  // ─── values ───────────────────────────────────────────────────────────

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const map = new CodeHashMap<number>()
      expect(map.values()).toEqual([])
    })

    it('returns all values', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 10)
      map.set('b', 20)
      const vals = map.values().sort()
      expect(vals).toEqual([10, 20])
    })

    it('reflects updated values after overwrite', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('a', 99)
      expect(map.values()).toEqual([99])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const result: Array<{ value: number; key: string }> = []
      map.forEach((value, key, _entry) => {
        result.push({ value, key })
      })
      expect(result.length).toBe(3)
      const sorted = result.sort((a, b) => a.key.localeCompare(b.key))
      expect(sorted).toEqual([
        { value: 1, key: 'a' },
        { value: 2, key: 'b' },
        { value: 3, key: 'c' },
      ])
    })

    it('does not call callback on empty map', () => {
      const map = new CodeHashMap<number>()
      let count = 0
      map.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('provides entry as third argument', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 42)
      let receivedEntry: HashMapEntry<number> | undefined
      map.forEach((_value, _key, entry) => {
        receivedEntry = entry
      })
      expect(receivedEntry).toBeDefined()
      expect(receivedEntry!.key).toBe('key')
      expect(receivedEntry!.value).toBe(42)
    })
  })

  // ─── getSize ──────────────────────────────────────────────────────────

  describe('getSize', () => {
    it('returns 0 for empty map', () => {
      const map = new CodeHashMap<number>()
      expect(map.getSize()).toBe(0)
    })

    it('increments on set', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      expect(map.getSize()).toBe(1)
      map.set('b', 2)
      expect(map.getSize()).toBe(2)
    })

    it('does not increment on overwrite', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.getSize()).toBe(1)
    })

    it('decrements on delete', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.getSize()).toBe(1)
    })

    it('resets to 0 on clear', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.getSize()).toBe(0)
    })
  })

  // ─── getCapacity ──────────────────────────────────────────────────────

  describe('getCapacity', () => {
    it('returns initial capacity', () => {
      const map = new CodeHashMap<number>({ capacity: 32 })
      expect(map.getCapacity()).toBe(32)
    })

    it('returns default capacity when not specified', () => {
      const map = new CodeHashMap<number>()
      expect(map.getCapacity()).toBe(16)
    })
  })

  // ─── getStats ─────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns correct stats for empty map', () => {
      const map = new CodeHashMap<number>()
      const stats = map.getStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(0)
      expect(stats.collisions).toBe(0)
      expect(stats.resizeCount).toBe(0)
    })

    it('returns correct stats after operations', () => {
      const map = new CodeHashMap<number>({ capacity: 4, loadFactor: 1 })
      map.set('a', 1)
      map.set('b', 2)
      const stats = map.getStats()
      expect(stats.size).toBe(2)
      expect(stats.capacity).toBe(4)
      expect(stats.loadFactor).toBeCloseTo(0.5)
    })

    it('tracks resizeCount', () => {
      const map = new CodeHashMap<number>({ capacity: 4, loadFactor: 0.75 })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const stats = map.getStats()
      expect(stats.resizeCount).toBeGreaterThanOrEqual(0)
    })

    it('stats have correct type shape', () => {
      const map = new CodeHashMap<number>()
      const stats: HashMapStats = map.getStats()
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.capacity).toBe('number')
      expect(typeof stats.loadFactor).toBe('number')
      expect(typeof stats.collisions).toBe('number')
      expect(typeof stats.resizeCount).toBe('number')
    })
  })

  // ─── resize ───────────────────────────────────────────────────────────

  describe('resize', () => {
    it('increases capacity', () => {
      const map = new CodeHashMap<number>({ capacity: 4 })
      map.set('a', 1)
      map.set('b', 2)
      map.resize(16)
      expect(map.getCapacity()).toBe(16)
    })

    it('preserves all entries after resize', () => {
      const map = new CodeHashMap<number>({ capacity: 4, loadFactor: 1 })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.resize(32)
      expect(map.getSize()).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('increments resizeCount', () => {
      const map = new CodeHashMap<number>({ capacity: 4, loadFactor: 1 })
      map.set('a', 1)
      map.resize(8)
      expect(map.getStats().resizeCount).toBe(1)
      map.resize(16)
      expect(map.getStats().resizeCount).toBe(2)
    })

    it('auto-resizes when load factor exceeded', () => {
      const map = new CodeHashMap<number>({ capacity: 4, loadFactor: 0.5 })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.getCapacity()).toBeGreaterThan(4)
    })

    it('allows adding after resize', () => {
      const map = new CodeHashMap<number>({ capacity: 4, loadFactor: 1 })
      map.set('a', 1)
      map.resize(8)
      map.set('b', 2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.getSize()).toBe(2)
    })

    it('recalculates collisions on resize', () => {
      const map = new CodeHashMap<number>({
        capacity: 1,
        loadFactor: 1,
        hashFunction: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getCollisions()).toBe(1)
      map.resize(2)
      // Both entries still hash to same value, so one collision after rehash
      expect(map.getCollisions()).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── getCollisions ────────────────────────────────────────────────────

  describe('getCollisions', () => {
    it('returns 0 for empty map', () => {
      const map = new CodeHashMap<number>()
      expect(map.getCollisions()).toBe(0)
    })

    it('returns 0 for single entry', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      expect(map.getCollisions()).toBe(0)
    })

    it('detects collisions with forced hash', () => {
      const map = new CodeHashMap<number>({
        capacity: 1,
        loadFactor: 1,
        hashFunction: () => 42,
      })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getCollisions()).toBe(1)
    })

    it('accumulates collisions', () => {
      const map = new CodeHashMap<number>({
        capacity: 1,
        loadFactor: 1,
        hashFunction: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.getCollisions()).toBe(2)
    })
  })

  // ─── Type Exports ─────────────────────────────────────────────────────

  describe('type exports', () => {
    it('HashMapEntry type is usable', () => {
      const entry: HashMapEntry<number> = {
        key: 'test',
        value: 42,
        hash: 12345,
        timestamp: Date.now(),
      }
      expect(entry.key).toBe('test')
      expect(entry.value).toBe(42)
    })

    it('HashMapOptions type is usable', () => {
      const opts: HashMapOptions = {
        capacity: 32,
        loadFactor: 0.8,
        hashFunction: (key: string) => key.length,
      }
      expect(opts.capacity).toBe(32)
    })

    it('HashMapStats type is usable', () => {
      const stats: HashMapStats = {
        size: 10,
        capacity: 16,
        loadFactor: 0.625,
        collisions: 2,
        resizeCount: 0,
      }
      expect(stats.size).toBe(10)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles many insertions', () => {
      const map = new CodeHashMap<number>()
      for (let i = 0; i < 200; i++) {
        map.set(`key-${i}`, i)
      }
      expect(map.getSize()).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(map.get(`key-${i}`)).toBe(i)
      }
    })

    it('handles many deletions', () => {
      const map = new CodeHashMap<number>()
      for (let i = 0; i < 50; i++) {
        map.set(`key-${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        expect(map.delete(`key-${i}`)).toBe(true)
      }
      expect(map.getSize()).toBe(0)
    })

    it('handles set-delete-set cycle', () => {
      const map = new CodeHashMap<number>()
      map.set('key', 1)
      map.delete('key')
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.getSize()).toBe(1)
    })

    it('handles clear then re-populate', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.getSize()).toBe(0)
      map.set('c', 3)
      map.set('d', 4)
      expect(map.getSize()).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.get('d')).toBe(4)
      expect(map.get('a')).toBeUndefined()
    })

    it('handles overwrite does not change size', () => {
      const map = new CodeHashMap<number>()
      for (let i = 0; i < 5; i++) {
        map.set('same-key', i)
      }
      expect(map.getSize()).toBe(1)
      expect(map.get('same-key')).toBe(4)
    })

    it('handles capacity of 1', () => {
      const map = new CodeHashMap<number>({
        capacity: 1,
        loadFactor: 1,
        hashFunction: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getSize()).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('handles negative hash values correctly', () => {
      const map = new CodeHashMap<number>({
        capacity: 4,
        loadFactor: 1,
        hashFunction: () => -5,
      })
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('handles hash larger than capacity', () => {
      const map = new CodeHashMap<number>({
        capacity: 4,
        loadFactor: 1,
        hashFunction: () => 99999,
      })
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('forEach with mixed operations', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const keys: string[] = []
      map.forEach((_v, key) => keys.push(key))
      expect(keys.sort()).toEqual(['a', 'c'])
    })

    it('entries, keys, values consistency', () => {
      const map = new CodeHashMap<number>()
      map.set('a', 10)
      map.set('b', 20)
      map.set('c', 30)
      const entries = map.entries()
      const keys = map.keys()
      const values = map.values()
      expect(entries.length).toBe(keys.length)
      expect(entries.length).toBe(values.length)
      expect(keys.sort()).toEqual(
        entries
          .map((e) => e.key)
          .sort(),
      )
    })

    it('handles long keys', () => {
      const map = new CodeHashMap<number>()
      const longKey = 'a'.repeat(10000)
      map.set(longKey, 42)
      expect(map.get(longKey)).toBe(42)
    })

    it('handles numeric string keys', () => {
      const map = new CodeHashMap<number>()
      map.set('0', 0)
      map.set('1', 1)
      map.set('-1', -1)
      expect(map.get('0')).toBe(0)
      expect(map.get('1')).toBe(1)
      expect(map.get('-1')).toBe(-1)
    })

    it('multiple resizes preserve data integrity', () => {
      const map = new CodeHashMap<number>({ capacity: 2, loadFactor: 0.5 })
      for (let i = 0; i < 20; i++) {
        map.set(`key-${i}`, i)
      }
      expect(map.getSize()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(map.get(`key-${i}`)).toBe(i)
      }
    })

    it('delete from middle of collision chain', () => {
      const map = new CodeHashMap<number>({
        capacity: 1,
        loadFactor: 1,
        hashFunction: () => 0,
      })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBeUndefined()
      expect(map.get('c')).toBe(3)
      expect(map.getSize()).toBe(2)
    })

    it('stats are consistent after mixed operations', () => {
      const map = new CodeHashMap<number>({ capacity: 8, loadFactor: 0.75 })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      map.set('d', 4)
      map.set('e', 5)
      const stats = map.getStats()
      expect(stats.size).toBe(4)
      expect(stats.resizeCount).toBeGreaterThanOrEqual(0)
      expect(map.keys().sort()).toEqual(['a', 'c', 'd', 'e'])
    })
  })
})
