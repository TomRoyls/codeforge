import { BatchMap } from '../src/core/batch-map/batch-map.js'
import { DEFAULT_BATCH_MAP_OPTIONS } from '../src/core/batch-map/types.js'
import type { BatchMapStatistics } from '../src/core/batch-map/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BatchMap', () => {
  describe('constructor', () => {
    it('creates a map with default options', () => {
      const map = new BatchMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates a map with custom initialCapacity', () => {
      const map = new BatchMap<string, number>({ initialCapacity: 128 })
      expect(map.size).toBe(0)
    })

    it('creates a map with custom loadFactor', () => {
      const map = new BatchMap<string, number>({ loadFactor: 0.5 })
      expect(map.size).toBe(0)
    })

    it('creates a map with both options overridden', () => {
      const map = new BatchMap<string, number>({ initialCapacity: 32, loadFactor: 0.6 })
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('uses DEFAULT_BATCH_MAP_OPTIONS when no arguments given', () => {
      expect(DEFAULT_BATCH_MAP_OPTIONS.initialCapacity).toBe(64)
      expect(DEFAULT_BATCH_MAP_OPTIONS.loadFactor).toBe(0.75)
    })
  })

  // ─── set / get ──────────────────────────────────────────────────────

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('returns undefined for a missing key', () => {
      const map = new BatchMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites an existing key with a new value', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 10)
      map.set('key', 20)
      expect(map.get('key')).toBe(20)
      expect(map.size).toBe(1)
    })

    it('handles multiple distinct keys', () => {
      const map = new BatchMap<string, number>()
      map.set('x', 1)
      map.set('y', 2)
      map.set('z', 3)
      expect(map.get('x')).toBe(1)
      expect(map.get('y')).toBe(2)
      expect(map.get('z')).toBe(3)
      expect(map.size).toBe(3)
    })

    it('handles number keys', () => {
      const map = new BatchMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
    })

    it('handles undefined as a stored value (via get returning undefined)', () => {
      const map = new BatchMap<string, number>()
      expect(map.get('nothing')).toBeUndefined()
    })

    it('stores zero as a value correctly', () => {
      const map = new BatchMap<string, number>()
      map.set('zero', 0)
      expect(map.get('zero')).toBe(0)
    })

    it('stores empty string as a key', () => {
      const map = new BatchMap<string, number>()
      map.set('', 42)
      expect(map.get('')).toBe(42)
    })

    it('stores false as a value', () => {
      const map = new BatchMap<string, boolean>()
      map.set('flag', false)
      expect(map.get('flag')).toBe(false)
    })

    it('stores null as a value', () => {
      const map = new BatchMap<string, null>()
      map.set('null', null)
      expect(map.get('null')).toBeNull()
    })
  })

  // ─── has ────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an existing key', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for a missing key', () => {
      const map = new BatchMap<string, number>()
      expect(map.has('missing')).toBe(false)
    })

    it('returns true after overwriting a key', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.has('key')).toBe(true)
    })

    it('returns false after deleting a key', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 1)
      map.delete('key')
      expect(map.has('key')).toBe(false)
    })
  })

  // ─── delete ─────────────────────────────────────────────────────────

  describe('delete', () => {
    it('returns true when deleting an existing key', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
    })

    it('returns false when deleting a missing key', () => {
      const map = new BatchMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('decrements size after deletion', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('removes the key so get returns undefined', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.get('a')).toBeUndefined()
    })

    it('handles deleting from an empty map', () => {
      const map = new BatchMap<string, number>()
      expect(map.delete('nothing')).toBe(false)
      expect(map.size).toBe(0)
    })

    it('does not affect other entries when deleting', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.get('a')).toBe(1)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(2)
    })
  })

  // ─── size / isEmpty ─────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for a new map', () => {
      const map = new BatchMap<string, number>()
      expect(map.size).toBe(0)
    })

    it('isEmpty returns true for a new map', () => {
      const map = new BatchMap<string, number>()
      expect(map.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after inserting an item', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 1)
      expect(map.isEmpty()).toBe(false)
    })

    it('size increments correctly with multiple inserts', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.set('c', 3)
      expect(map.size).toBe(3)
    })

    it('size does not increment when overwriting a key', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.size).toBe(1)
    })

    it('size returns to 0 after deleting all entries', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── clear ──────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('causes get to return undefined for all previous keys', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 42)
      map.clear()
      expect(map.get('key')).toBeUndefined()
    })

    it('allows reuse after clearing', () => {
      const map = new BatchMap<string, number>()
      map.set('first', 1)
      map.clear()
      map.set('second', 2)
      expect(map.get('second')).toBe(2)
      expect(map.get('first')).toBeUndefined()
      expect(map.size).toBe(1)
    })

    it('clear on an empty map is a no-op', () => {
      const map = new BatchMap<string, number>()
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── keys / values / entries iterators ──────────────────────────────

  describe('keys', () => {
    it('returns an empty iterator for an empty map', () => {
      const map = new BatchMap<string, number>()
      expect([...map.keys()]).toEqual([])
    })

    it('returns all keys', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = [...map.keys()]
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('values', () => {
    it('returns an empty iterator for an empty map', () => {
      const map = new BatchMap<string, number>()
      expect([...map.values()]).toEqual([])
    })

    it('returns all values', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const values = [...map.values()]
      expect(values.sort()).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('returns an empty iterator for an empty map', () => {
      const map = new BatchMap<string, number>()
      expect([...map.entries()]).toEqual([])
    })

    it('returns all key-value pairs', () => {
      const map = new BatchMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      const entries = [...map.entries()]
      expect(entries.sort((a, b) => a[1] - b[1])).toEqual([
        ['x', 10],
        ['y', 20],
      ])
    })
  })

  // ─── forEach ────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('calls callback for each entry', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const collected: Array<[string, number]> = []
      map.forEach((value, key) => {
        collected.push([key, value])
      })
      expect(collected.sort((a, b) => a[1] - b[1])).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('passes the map instance as third argument', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 1)
      let received: BatchMap<string, number> | undefined
      map.forEach((_value, _key, m) => {
        received = m
      })
      expect(received).toBe(map)
    })

    it('does not call callback for an empty map', () => {
      const map = new BatchMap<string, number>()
      let callCount = 0
      map.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })
  })

  // ─── Symbol.iterator ───────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('is iterable and yields entries', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result = [...map]
      expect(result.sort((a, b) => a[1] - b[1])).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('works in a for-of loop', () => {
      const map = new BatchMap<string, number>()
      map.set('x', 10)
      const entries: Array<[string, number]> = []
      for (const entry of map) {
        entries.push(entry)
      }
      expect(entries).toEqual([['x', 10]])
    })
  })

  // ─── toArray ────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns an empty array for an empty map', () => {
      const map = new BatchMap<string, number>()
      expect(map.toArray()).toEqual([])
    })

    it('returns all entries as an array', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const arr = map.toArray()
      expect(arr.sort((a, b) => a[1] - b[1])).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('returns a new array each time (not cached)', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      const arr1 = map.toArray()
      const arr2 = map.toArray()
      expect(arr1).not.toBe(arr2)
    })
  })

  // ─── batchSet ───────────────────────────────────────────────────────

  describe('batchSet', () => {
    it('inserts multiple entries at once', () => {
      const map = new BatchMap<string, number>()
      map.batchSet([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(3)
    })

    it('updates existing keys', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.batchSet([['a', 99]])
      expect(map.get('a')).toBe(99)
      expect(map.size).toBe(1)
    })

    it('handles an empty array', () => {
      const map = new BatchMap<string, number>()
      map.batchSet([])
      expect(map.size).toBe(0)
    })

    it('handles duplicate keys in a single batch (last wins)', () => {
      const map = new BatchMap<string, number>()
      map.batchSet([
        ['dup', 1],
        ['dup', 2],
        ['dup', 3],
      ])
      expect(map.get('dup')).toBe(3)
      expect(map.size).toBe(1)
    })

    it('handles a large batch', () => {
      const map = new BatchMap<number, number>()
      const entries: Array<readonly [number, number]> = []
      for (let i = 0; i < 200; i++) {
        entries.push([i, i * 10])
      }
      map.batchSet(entries)
      expect(map.size).toBe(200)
      expect(map.get(0)).toBe(0)
      expect(map.get(100)).toBe(1000)
      expect(map.get(199)).toBe(1990)
    })
  })

  // ─── batchGet ───────────────────────────────────────────────────────

  describe('batchGet', () => {
    it('returns values for existing keys', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const results = map.batchGet(['a', 'b'])
      expect(results).toEqual([1, 2])
    })

    it('returns undefined for missing keys', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      const results = map.batchGet(['a', 'missing'])
      expect(results).toEqual([1, undefined])
    })

    it('returns all undefined for an empty map', () => {
      const map = new BatchMap<string, number>()
      const results = map.batchGet(['x', 'y', 'z'])
      expect(results).toEqual([undefined, undefined, undefined])
    })

    it('handles an empty keys array', () => {
      const map = new BatchMap<string, number>()
      const results = map.batchGet([])
      expect(results).toEqual([])
    })

    it('returns results in the same order as input keys', () => {
      const map = new BatchMap<string, number>()
      map.set('c', 3)
      map.set('a', 1)
      map.set('b', 2)
      const results = map.batchGet(['a', 'b', 'c'])
      expect(results).toEqual([1, 2, 3])
    })
  })

  // ─── batchDelete ────────────────────────────────────────────────────

  describe('batchDelete', () => {
    it('deletes multiple keys and returns results', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const results = map.batchDelete(['a', 'c'])
      expect(results).toEqual([true, true])
      expect(map.get('a')).toBeUndefined()
      expect(map.get('c')).toBeUndefined()
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('returns false for missing keys', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      const results = map.batchDelete(['a', 'missing'])
      expect(results).toEqual([true, false])
    })

    it('handles an empty keys array', () => {
      const map = new BatchMap<string, number>()
      const results = map.batchDelete([])
      expect(results).toEqual([])
    })

    it('deleting all entries leaves an empty map', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.batchDelete(['a', 'b'])
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  // ─── batchHas ───────────────────────────────────────────────────────

  describe('batchHas', () => {
    it('returns true for existing keys', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const results = map.batchHas(['a', 'b'])
      expect(results).toEqual([true, true])
    })

    it('returns false for missing keys', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      const results = map.batchHas(['a', 'missing'])
      expect(results).toEqual([true, false])
    })

    it('handles an empty keys array', () => {
      const map = new BatchMap<string, number>()
      const results = map.batchHas([])
      expect(results).toEqual([])
    })

    it('returns all false for an empty map', () => {
      const map = new BatchMap<string, number>()
      const results = map.batchHas(['x', 'y'])
      expect(results).toEqual([false, false])
    })
  })

  // ─── merge ──────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges entries from another map', () => {
      const map1 = new BatchMap<string, number>()
      const map2 = new BatchMap<string, number>()
      map1.set('a', 1)
      map2.set('b', 2)
      map1.merge(map2)
      expect(map1.get('a')).toBe(1)
      expect(map1.get('b')).toBe(2)
    })

    it('overwrites existing keys with values from the other map', () => {
      const map1 = new BatchMap<string, number>()
      const map2 = new BatchMap<string, number>()
      map1.set('key', 10)
      map2.set('key', 20)
      map1.merge(map2)
      expect(map1.get('key')).toBe(20)
    })

    it('handles merging with an empty map', () => {
      const map1 = new BatchMap<string, number>()
      const map2 = new BatchMap<string, number>()
      map1.set('a', 1)
      map1.merge(map2)
      expect(map1.size).toBe(1)
      expect(map1.get('a')).toBe(1)
    })

    it('handles merging into an empty map', () => {
      const map1 = new BatchMap<string, number>()
      const map2 = new BatchMap<string, number>()
      map2.set('a', 1)
      map2.set('b', 2)
      map1.merge(map2)
      expect(map1.size).toBe(2)
      expect(map1.get('a')).toBe(1)
      expect(map1.get('b')).toBe(2)
    })

    it('does not modify the source map', () => {
      const map1 = new BatchMap<string, number>()
      const map2 = new BatchMap<string, number>()
      map2.set('x', 42)
      map1.merge(map2)
      expect(map2.size).toBe(1)
      expect(map2.get('x')).toBe(42)
    })
  })

  // ─── getStatistics ──────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns zeroed stats for a new map', () => {
      const map = new BatchMap<string, number>()
      const stats = map.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.batchSets).toBe(0)
      expect(stats.batchGets).toBe(0)
      expect(stats.batchDeletes).toBe(0)
      expect(stats.totalItemsProcessed).toBe(0)
    })

    it('tracks set operations', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getStatistics().sets).toBe(2)
    })

    it('tracks get operations', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.get('a')
      map.get('missing')
      expect(map.getStatistics().gets).toBe(2)
    })

    it('tracks delete operations', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      map.delete('missing')
      expect(map.getStatistics().deletes).toBe(2)
    })

    it('tracks batchSet operations', () => {
      const map = new BatchMap<string, number>()
      map.batchSet([
        ['a', 1],
        ['b', 2],
      ])
      map.batchSet([['c', 3]])
      expect(map.getStatistics().batchSets).toBe(2)
    })

    it('tracks batchGet operations', () => {
      const map = new BatchMap<string, number>()
      map.batchGet(['a', 'b'])
      map.batchGet(['c'])
      expect(map.getStatistics().batchGets).toBe(2)
    })

    it('tracks batchDelete operations', () => {
      const map = new BatchMap<string, number>()
      map.batchDelete(['a'])
      map.batchDelete(['b', 'c'])
      expect(map.getStatistics().batchDeletes).toBe(2)
    })

    it('tracks totalItemsProcessed across all operations', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.get('a')
      map.delete('a')
      map.batchSet([
        ['b', 2],
        ['c', 3],
      ])
      map.batchGet(['b', 'c', 'd'])
      map.batchDelete(['b'])
      expect(map.getStatistics().totalItemsProcessed).toBe(9)
    })

    it('returns a copy (not a reference)', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      const stats1 = map.getStatistics()
      map.set('b', 2)
      const stats2 = map.getStatistics()
      expect(stats1.sets).toBe(1)
      expect(stats2.sets).toBe(2)
    })

    it('has all required statistic fields', () => {
      const map = new BatchMap<string, number>()
      const stats: BatchMapStatistics = map.getStatistics()
      const keys = Object.keys(stats)
      expect(keys).toContain('sets')
      expect(keys).toContain('gets')
      expect(keys).toContain('deletes')
      expect(keys).toContain('batchSets')
      expect(keys).toContain('batchGets')
      expect(keys).toContain('batchDeletes')
      expect(keys).toContain('totalItemsProcessed')
    })
  })

  // ─── Resize / capacity management ───────────────────────────────────

  describe('resize and capacity management', () => {
    it('handles many insertions that trigger resize', () => {
      const map = new BatchMap<number, number>({ initialCapacity: 4, loadFactor: 0.75 })
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
    })

    it('resizes correctly with a low loadFactor', () => {
      const map = new BatchMap<number, number>({ initialCapacity: 8, loadFactor: 0.25 })
      for (let i = 0; i < 50; i++) {
        map.set(i, i)
      }
      expect(map.size).toBe(50)
      expect(map.get(25)).toBe(25)
    })

    it('maintains data integrity after multiple resizes via batchSet', () => {
      const map = new BatchMap<number, number>({ initialCapacity: 4, loadFactor: 0.5 })
      const entries: Array<readonly [number, number]> = []
      for (let i = 0; i < 200; i++) {
        entries.push([i, i * 5])
      }
      map.batchSet(entries)
      for (let i = 0; i < 200; i++) {
        expect(map.get(i)).toBe(i * 5)
      }
    })
  })

  // ─── Key collision handling ─────────────────────────────────────────

  describe('key collision handling', () => {
    it('handles keys that may hash to the same bucket', () => {
      const map = new BatchMap<string, number>({ initialCapacity: 1 })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(3)
    })

    it('can delete from a collision chain', () => {
      const map = new BatchMap<string, number>({ initialCapacity: 1 })
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBeUndefined()
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(2)
    })

    it('can delete the head of a collision chain', () => {
      const map = new BatchMap<string, number>({ initialCapacity: 1 })
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.get('a')).toBeUndefined()
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  // ─── Edge cases ─────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles special string characters in keys', () => {
      const map = new BatchMap<string, number>()
      map.set('hello\nworld', 1)
      map.set('tab\there', 2)
      map.set('quote"inside', 3)
      expect(map.get('hello\nworld')).toBe(1)
      expect(map.get('tab\there')).toBe(2)
      expect(map.get('quote"inside')).toBe(3)
    })

    it('handles large number of operations', () => {
      const map = new BatchMap<number, number>()
      for (let i = 0; i < 500; i++) {
        map.set(i, i)
      }
      expect(map.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(map.has(i)).toBe(true)
      }
      for (let i = 0; i < 250; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(250)
    })

    it('handles mixed single and batch operations', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.batchSet([
        ['b', 2],
        ['c', 3],
      ])
      map.set('d', 4)
      expect(map.size).toBe(4)
      const results = map.batchGet(['a', 'b', 'c', 'd'])
      expect(results).toEqual([1, 2, 3, 4])
    })

    it('handles insert-delete-reinsert cycle', () => {
      const map = new BatchMap<string, number>()
      map.set('key', 1)
      map.delete('key')
      expect(map.get('key')).toBeUndefined()
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('toArray after clear and reinsert', () => {
      const map = new BatchMap<string, number>()
      map.set('old', 1)
      map.clear()
      map.set('new', 2)
      const arr = map.toArray()
      expect(arr).toEqual([['new', 2]])
    })

    it('iterators reflect current state after mutations', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const keys = [...map.keys()]
      expect(keys.sort()).toEqual(['a', 'c'])
    })

    it('batch operations on an empty map', () => {
      const map = new BatchMap<string, number>()
      expect(map.batchGet(['x'])).toEqual([undefined])
      expect(map.batchDelete(['x'])).toEqual([false])
      expect(map.batchHas(['x'])).toEqual([false])
    })

    it('clear does not reset statistics', () => {
      const map = new BatchMap<string, number>()
      map.set('a', 1)
      map.get('a')
      map.clear()
      const stats = map.getStatistics()
      expect(stats.sets).toBe(1)
      expect(stats.gets).toBe(1)
    })

    it('forEach after batchSet iterates all entries', () => {
      const map = new BatchMap<string, number>()
      map.batchSet([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      let count = 0
      map.forEach(() => {
        count++
      })
      expect(count).toBe(3)
    })

    it('merge with overlapping keys uses source values', () => {
      const map1 = new BatchMap<string, number>()
      const map2 = new BatchMap<string, number>()
      map1.set('shared', 100)
      map1.set('only1', 1)
      map2.set('shared', 200)
      map2.set('only2', 2)
      map1.merge(map2)
      expect(map1.get('shared')).toBe(200)
      expect(map1.get('only1')).toBe(1)
      expect(map1.get('only2')).toBe(2)
      expect(map1.size).toBe(3)
    })
  })
})
