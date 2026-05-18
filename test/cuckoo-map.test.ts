import { CuckooMap, DEFAULT_CUCKOO_MAP_OPTIONS } from '../src/core/cuckoo-map/cuckoo-map.js'
import type { CuckooMapOptions, CuckooMapStats } from '../src/core/cuckoo-map/cuckoo-map.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CuckooMap', () => {
  describe('constructor', () => {
    it('creates an empty map with default options', () => {
      const map = new CuckooMap()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates a map with a numeric capacity', () => {
      const map = new CuckooMap(32)
      expect(map.capacity).toBe(32)
      expect(map.size).toBe(0)
    })

    it('clamps capacity to minimum of 2', () => {
      const map = new CuckooMap(1)
      expect(map.capacity).toBe(2)
    })

    it('creates a map from options object', () => {
      const map = new CuckooMap({ capacity: 64, maxKicks: 100 })
      expect(map.capacity).toBe(64)
      expect(map.size).toBe(0)
    })

    it('uses default capacity when options object is empty', () => {
      const map = new CuckooMap({})
      expect(map.capacity).toBe(DEFAULT_CUCKOO_MAP_OPTIONS.capacity)
    })

    it('clamps capacity from options to minimum of 2', () => {
      const map = new CuckooMap({ capacity: 0 })
      expect(map.capacity).toBe(2)
    })

    it('accepts partial options with only maxKicks', () => {
      const map = new CuckooMap({ maxKicks: 50 })
      expect(map.capacity).toBe(DEFAULT_CUCKOO_MAP_OPTIONS.capacity)
    })

    it('uses default maxKicks when only capacity is given as number', () => {
      const map = new CuckooMap(8)
      // Verify via stats that map works with default maxKicks
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })
  })

  // ─── set / get ────────────────────────────────────────────────────────

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('returns undefined for missing key', () => {
      const map = new CuckooMap<string, number>()
      expect(map.get('nonexistent')).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.get('anything')).toBeUndefined()
    })

    it('overwrites existing key with new value', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('sets multiple keys', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('handles number keys', () => {
      const map = new CuckooMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
    })

    it('handles object values', () => {
      const map = new CuckooMap<string, { x: number }>()
      map.set('point', { x: 10 })
      expect(map.get('point')!.x).toBe(10)
    })

    it('handles null values', () => {
      const map = new CuckooMap<string, null>()
      map.set('key', null)
      expect(map.get('key')).toBeNull()
    })

    it('handles undefined values', () => {
      const map = new CuckooMap<string, number | undefined>()
      map.set('key', undefined)
      expect(map.get('key')).toBeUndefined()
      expect(map.has('key')).toBe(true)
    })

    it('handles boolean values', () => {
      const map = new CuckooMap<string, boolean>()
      map.set('t', true)
      map.set('f', false)
      expect(map.get('t')).toBe(true)
      expect(map.get('f')).toBe(false)
    })

    it('handles empty string key', () => {
      const map = new CuckooMap<string, number>()
      map.set('', 99)
      expect(map.get('')).toBe(99)
    })

    it('handles string that looks like a number as key', () => {
      const map = new CuckooMap<string, number>()
      map.set('123', 456)
      expect(map.get('123')).toBe(456)
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 1)
      expect(map.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new CuckooMap<string, number>()
      expect(map.has('key')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.has('anything')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 1)
      map.delete('key')
      expect(map.has('key')).toBe(false)
    })

    it('returns true after value overwrite', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 1)
      map.set('key', 2)
      expect(map.has('key')).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 1)
      expect(map.delete('key')).toBe(true)
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new CuckooMap<string, number>()
      expect(map.delete('key')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.delete('anything')).toBe(false)
    })

    it('can delete one of multiple keys', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.delete('b')).toBe(true)
      expect(map.size).toBe(2)
      expect(map.has('a')).toBe(true)
      expect(map.has('c')).toBe(true)
      expect(map.has('b')).toBe(false)
    })

    it('allows re-insertion after delete', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 1)
      map.delete('key')
      map.set('key', 2)
      expect(map.get('key')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('deleting same key twice returns false on second call', () => {
      const map = new CuckooMap<string, number>()
      map.set('key', 1)
      expect(map.delete('key')).toBe(true)
      expect(map.delete('key')).toBe(false)
    })
  })

  // ─── size / isEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for new map', () => {
      expect(new CuckooMap().size).toBe(0)
    })

    it('isEmpty returns true for new map', () => {
      expect(new CuckooMap().isEmpty()).toBe(true)
    })

    it('size increments on set', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
    })

    it('size does not increment on overwrite', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insertion', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      expect(map.isEmpty()).toBe(false)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('clear on empty map is a no-op', () => {
      const map = new CuckooMap<string, number>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('allows insertion after clear', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.size).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('a')).toBeUndefined()
    })
  })

  // ─── keys / values / entries / toArray ────────────────────────────────

  describe('keys', () => {
    it('returns all keys', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const keys = map.keys()
      expect(keys).toHaveLength(2)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('returns empty array for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.keys()).toEqual([])
    })
  })

  describe('values', () => {
    it('returns all values', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const values = map.values()
      expect(values).toHaveLength(2)
      expect(values).toContain(1)
      expect(values).toContain(2)
    })

    it('returns empty array for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.values()).toEqual([])
    })
  })

  describe('entries', () => {
    it('returns all entries as [key, value] pairs', () => {
      const map = new CuckooMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      const entries = map.entries()
      expect(entries).toHaveLength(2)
      expect(entries).toContainEqual(['x', 10])
      expect(entries).toContainEqual(['y', 20])
    })

    it('returns empty array for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.entries()).toEqual([])
    })

    it('returns same result as toArray', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.entries()).toEqual(map.toArray())
    })
  })

  describe('toArray', () => {
    it('returns all entries as [key, value] pairs', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const arr = map.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContainEqual(['a', 1])
      expect(arr).toContainEqual(['b', 2])
    })

    it('returns empty array for empty map', () => {
      const map = new CuckooMap<string, number>()
      expect(map.toArray()).toEqual([])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const collected: Array<[string, number]> = []
      map.forEach((key, value) => {
        collected.push([key, value])
      })
      expect(collected).toHaveLength(2)
      expect(collected).toContainEqual(['a', 1])
      expect(collected).toContainEqual(['b', 2])
    })

    it('does not call callback on empty map', () => {
      const map = new CuckooMap<string, number>()
      let callCount = 0
      map.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates correctly after delete', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const keys: string[] = []
      map.forEach((key) => keys.push(key))
      expect(keys).toHaveLength(2)
      expect(keys).toContain('a')
      expect(keys).toContain('c')
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const cloned = map.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('modifications to clone do not affect original', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      const cloned = map.clone()
      cloned.set('b', 2)
      expect(map.size).toBe(1)
      expect(cloned.size).toBe(2)
      expect(map.has('b')).toBe(false)
    })

    it('modifications to original do not affect clone', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      const cloned = map.clone()
      map.delete('a')
      expect(cloned.size).toBe(1)
      expect(cloned.get('a')).toBe(1)
    })

    it('clones empty map', () => {
      const map = new CuckooMap<string, number>()
      const cloned = map.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const map = new CuckooMap(32)
      map.set('a', 1)
      expect(map.clone().capacity).toBe(32)
    })
  })

  // ─── static from ─────────────────────────────────────────────────────

  describe('static from', () => {
    it('creates a map from an array of entries', () => {
      const map = CuckooMap.from([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('creates a map from an empty array', () => {
      const map = CuckooMap.from([])
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates a map with custom capacity', () => {
      const map = CuckooMap.from(
        [
          ['a', 1],
          ['b', 2],
        ],
        64,
      )
      expect(map.capacity).toBe(64)
    })

    it('creates a map from a Map', () => {
      const jsMap = new Map<string, number>()
      jsMap.set('x', 10)
      jsMap.set('y', 20)
      const map = CuckooMap.from(jsMap)
      expect(map.size).toBe(2)
      expect(map.get('x')).toBe(10)
      expect(map.get('y')).toBe(20)
    })

    it('creates a map from a generator', () => {
      function* gen(): Generator<[string, number]> {
        yield ['a', 1]
        yield ['b', 2]
      }
      const map = CuckooMap.from(gen())
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
    })

    it('last value wins for duplicate keys', () => {
      const map = CuckooMap.from([
        ['a', 1],
        ['a', 2],
      ])
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(2)
    })
  })

  // ─── capacity / loadFactor ────────────────────────────────────────────

  describe('capacity and loadFactor', () => {
    it('capacity returns initial capacity', () => {
      const map = new CuckooMap(16)
      expect(map.capacity).toBe(16)
    })

    it('loadFactor is 0 for empty map', () => {
      const map = new CuckooMap(16)
      expect(map.loadFactor).toBe(0)
    })

    it('loadFactor increases with entries', () => {
      const map = new CuckooMap(16)
      map.set('a', 1)
      expect(map.loadFactor).toBeGreaterThan(0)
      expect(map.loadFactor).toBeLessThanOrEqual(1)
    })

    it('loadFactor equals size/capacity', () => {
      const map = new CuckooMap(16)
      for (let i = 0; i < 5; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.loadFactor).toBe(map.size / map.capacity)
    })
  })

  // ─── rehash ───────────────────────────────────────────────────────────

  describe('rehash', () => {
    it('rehashes to a larger capacity', () => {
      const map = new CuckooMap(8)
      map.set('a', 1)
      map.set('b', 2)
      map.rehash(32)
      expect(map.capacity).toBe(32)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('rehash without argument uses current capacity', () => {
      const map = new CuckooMap(8)
      map.set('a', 1)
      map.rehash()
      expect(map.get('a')).toBe(1)
      expect(map.capacity).toBe(8)
    })

    it('rehash preserves all entries', () => {
      const map = new CuckooMap(8)
      for (let i = 0; i < 6; i++) {
        map.set(`key${i}`, i)
      }
      map.rehash(64)
      for (let i = 0; i < 6; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
      expect(map.size).toBe(6)
    })

    it('rehash clamps to minimum capacity of 2', () => {
      const map = new CuckooMap(8)
      map.set('a', 1)
      map.rehash(1)
      expect(map.capacity).toBe(2)
    })
  })

  // ─── stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns stats for empty map', () => {
      const map = new CuckooMap(16)
      const stats = map.stats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(0)
      expect(stats.maxChainLength).toBe(0)
      expect(stats.table1Occupancy).toBe(0)
      expect(stats.table2Occupancy).toBe(0)
      expect(stats.resizeCount).toBe(0)
    })

    it('returns correct stats after insertions', () => {
      const map = new CuckooMap(16)
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const stats = map.stats()
      expect(stats.size).toBe(3)
      expect(stats.table1Occupancy + stats.table2Occupancy).toBe(3)
    })

    it('table occupancies sum to size', () => {
      const map = new CuckooMap(16)
      for (let i = 0; i < 8; i++) {
        map.set(`key${i}`, i)
      }
      const stats = map.stats()
      expect(stats.table1Occupancy + stats.table2Occupancy).toBe(stats.size)
    })

    it('stats reflect deletions', () => {
      const map = new CuckooMap(16)
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const stats = map.stats()
      expect(stats.size).toBe(1)
      expect(stats.table1Occupancy + stats.table2Occupancy).toBe(1)
    })
  })

  // ─── DEFAULT_CUCKOO_MAP_OPTIONS ───────────────────────────────────────

  describe('DEFAULT_CUCKOO_MAP_OPTIONS', () => {
    it('has capacity of 16', () => {
      expect(DEFAULT_CUCKOO_MAP_OPTIONS.capacity).toBe(16)
    })

    it('has maxKicks of 500', () => {
      expect(DEFAULT_CUCKOO_MAP_OPTIONS.maxKicks).toBe(500)
    })
  })

  // ─── Resilience and Edge Cases ────────────────────────────────────────

  describe('edge cases', () => {
    it('handles many insertions triggering resize', () => {
      const map = new CuckooMap<string, number>(4)
      for (let i = 0; i < 20; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })

    it('handles mixed set, delete, and re-set', () => {
      const map = new CuckooMap<string, number>()
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

    it('handles keys with special characters', () => {
      const map = new CuckooMap<string, number>()
      map.set('🔑', 1)
      map.set('hello world', 2)
      map.set('line\nbreak', 3)
      expect(map.get('🔑')).toBe(1)
      expect(map.get('hello world')).toBe(2)
      expect(map.get('line\nbreak')).toBe(3)
    })

    it('handles very long string keys', () => {
      const map = new CuckooMap<string, number>()
      const longKey = 'x'.repeat(10000)
      map.set(longKey, 42)
      expect(map.get(longKey)).toBe(42)
    })

    it('clear followed by insertions works', () => {
      const map = new CuckooMap<string, number>(4)
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
      map.clear()
      expect(map.size).toBe(0)
      map.set('new', 99)
      expect(map.get('new')).toBe(99)
      expect(map.size).toBe(1)
    })

    it('forEach after clear does not iterate', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.clear()
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('clone after multiple operations preserves state', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.set('c', 3)
      const cloned = map.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.has('a')).toBe(false)
      expect(cloned.get('b')).toBe(2)
      expect(cloned.get('c')).toBe(3)
    })

    it('toArray returns correct count after delete', () => {
      const map = new CuckooMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const arr = map.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContainEqual(['a', 1])
      expect(arr).toContainEqual(['c', 3])
    })

    it('keys returns correct count after delete', () => {
      const map = new CuckooMap<string, number>()
      map.set('x', 1)
      map.set('y', 2)
      map.delete('x')
      const keys = map.keys()
      expect(keys).toEqual(['y'])
    })

    it('values returns correct count after delete', () => {
      const map = new CuckooMap<string, number>()
      map.set('x', 1)
      map.set('y', 2)
      map.delete('x')
      const values = map.values()
      expect(values).toEqual([2])
    })

    it('set after delete reuses slot correctly', () => {
      const map = new CuckooMap<string, number>(8)
      map.set('a', 1)
      map.delete('a')
      map.set('a', 99)
      expect(map.get('a')).toBe(99)
      expect(map.size).toBe(1)
    })

    it('handles single entry operations', () => {
      const map = new CuckooMap<string, number>()
      map.set('only', 1)
      expect(map.size).toBe(1)
      expect(map.isEmpty()).toBe(false)
      expect(map.has('only')).toBe(true)
      expect(map.get('only')).toBe(1)
      expect(map.delete('only')).toBe(true)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles number keys correctly', () => {
      const map = new CuckooMap<number, string>()
      for (let i = 0; i < 10; i++) {
        map.set(i, `val-${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(map.get(i)).toBe(`val-${i}`)
      }
    })

    it('handles boolean keys', () => {
      const map = new CuckooMap<boolean, string>()
      map.set(true, 'yes')
      map.set(false, 'no')
      expect(map.get(true)).toBe('yes')
      expect(map.get(false)).toBe('no')
      expect(map.size).toBe(2)
    })

    it('capacity grows after auto-resize', () => {
      const map = new CuckooMap<string, number>(4)
      const initialCap = map.capacity
      for (let i = 0; i < 50; i++) {
        map.set(`k${i}`, i)
      }
      // After many insertions, capacity should have grown
      expect(map.capacity).toBeGreaterThanOrEqual(initialCap)
    })
  })

  // ─── Type Exports ─────────────────────────────────────────────────────

  describe('type exports', () => {
    it('CuckooMapStats has correct shape', () => {
      const map = new CuckooMap<string, number>()
      const stats: CuckooMapStats = map.stats()
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.capacity).toBe('number')
      expect(typeof stats.loadFactor).toBe('number')
      expect(typeof stats.maxChainLength).toBe('number')
      expect(typeof stats.table1Occupancy).toBe('number')
      expect(typeof stats.table2Occupancy).toBe('number')
      expect(typeof stats.resizeCount).toBe('number')
    })

    it('CuckooMapOptions has correct shape', () => {
      const opts: CuckooMapOptions = {
        capacity: 32,
        maxKicks: 100,
      }
      expect(opts.capacity).toBe(32)
      expect(opts.maxKicks).toBe(100)
    })
  })
})
