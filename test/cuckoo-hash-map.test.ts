import { CuckooHashMap } from '../src/core/cuckoo-hash-map/cuckoo-hash-map.js'
import type { CuckooHashMapOptions, CuckooHashMapStats, CuckooEntry } from '../src/core/cuckoo-hash-map/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CuckooHashMap', () => {
  describe('constructor', () => {
    it('creates an empty map with default options', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates a map with custom capacity', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 32 })
      const stats = map.getStats()
      expect(stats.capacity).toBe(32)
    })

    it('creates a map with custom maxKicks', () => {
      const map = new CuckooHashMap<string, number>({ maxKicks: 100 })
      expect(map.getStats().capacity).toBe(16)
    })

    it('creates a map with both custom options', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 64, maxKicks: 20 })
      const stats = map.getStats()
      expect(stats.capacity).toBe(64)
    })

    it('clamps capacity to minimum of 2', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 1 })
      expect(map.getStats().capacity).toBe(2)
    })

    it('clamps capacity to 2 when given 0', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 0 })
      expect(map.getStats().capacity).toBe(2)
    })

    it('clamps capacity to 2 when given negative', () => {
      const map = new CuckooHashMap<string, number>({ capacity: -10 })
      expect(map.getStats().capacity).toBe(2)
    })

    it('accepts undefined options', () => {
      const map = new CuckooHashMap<string, number>(undefined)
      expect(map.size).toBe(0)
    })
  })

  // ─── set ─────────────────────────────────────────────────────────────

  describe('set', () => {
    it('stores a key-value pair', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('stores multiple key-value pairs', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('overwrites existing key with new value', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 99)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(99)
    })

    it('overriting does not increase size', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      map.set('a', 3)
      expect(map.size).toBe(1)
    })

    it('handles numeric keys', () => {
      const map = new CuckooHashMap<number, string>()
      map.set(1, 'one')
      map.set(2, 'two')
      expect(map.get(1)).toBe('one')
      expect(map.get(2)).toBe('two')
    })

    it('handles object values', () => {
      const map = new CuckooHashMap<string, { x: number }>()
      map.set('point', { x: 42 })
      expect(map.get('point')!.x).toBe(42)
    })

    it('handles null values', () => {
      const map = new CuckooHashMap<string, null>()
      map.set('a', null)
      expect(map.get('a')).toBeNull()
    })

    it('handles undefined values', () => {
      const map = new CuckooHashMap<string, number | undefined>()
      map.set('a', undefined)
      expect(map.get('a')).toBeUndefined()
    })

    it('handles boolean keys', () => {
      const map = new CuckooHashMap<boolean, string>()
      map.set(true, 'yes')
      map.set(false, 'no')
      expect(map.get(true)).toBe('yes')
      expect(map.get(false)).toBe('no')
    })

    it('stores many entries triggering resize', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 4 })
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
    })

    it('handles empty string key', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('', 42)
      expect(map.get('')).toBe(42)
      expect(map.size).toBe(1)
    })
  })

  // ─── get ─────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns value for existing key', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('key', 42)
      expect(map.get('key')).toBe(42)
    })

    it('returns undefined for missing key', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.get('missing')).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.get('anything')).toBeUndefined()
    })

    it('returns updated value after overwrite', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('returns undefined after key is deleted', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.get('a')).toBeUndefined()
    })
  })

  // ─── has ─────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.has('missing')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.has('anything')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })

    it('returns true after value overwrite', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for key that was never added', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.has('b')).toBe(false)
    })
  })

  // ─── delete ──────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes an existing key and returns true', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.delete('missing')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.delete('anything')).toBe(false)
    })

    it('does not affect other entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('c')).toBe(3)
      expect(map.has('b')).toBe(false)
    })

    it('allows re-adding a deleted key', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      map.set('a', 99)
      expect(map.get('a')).toBe(99)
      expect(map.size).toBe(1)
    })

    it('deletes only the first occurrence (does not corrupt)', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      expect(map.delete('x')).toBe(true)
      expect(map.delete('x')).toBe(false)
      expect(map.get('y')).toBe(20)
    })
  })

  // ─── size and isEmpty ────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for new map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.size).toBe(0)
    })

    it('isEmpty is true for new map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.isEmpty).toBe(true)
    })

    it('size increments on set', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
    })

    it('isEmpty becomes false after set', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      expect(map.isEmpty).toBe(false)
    })

    it('size decrements on delete', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('isEmpty becomes true after deleting all', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      expect(map.isEmpty).toBe(true)
    })

    it('size does not change on overwrite', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('size does not change on failed delete', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.delete('b')
      expect(map.size).toBe(1)
    })
  })

  // ─── loadFactor ──────────────────────────────────────────────────────

  describe('loadFactor', () => {
    it('is 0 for empty map', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      expect(map.loadFactor).toBe(0)
    })

    it('increases as entries are added', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      expect(map.loadFactor).toBeGreaterThan(0)
      expect(map.loadFactor).toBe(1 / 16)
    })

    it('decreases after delete', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      map.set('b', 2)
      const lfBefore = map.loadFactor
      map.delete('a')
      expect(map.loadFactor).toBeLessThan(lfBefore)
    })

    it('returns 0 after clear', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.loadFactor).toBe(0)
    })
  })

  // ─── clear ───────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('makes all keys unreachable', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.get('a')).toBeUndefined()
      expect(map.get('b')).toBeUndefined()
    })

    it('allows adding after clear', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.size).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('clears an already empty map without error', () => {
      const map = new CuckooHashMap<string, number>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('resets loadFactor to 0', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      expect(map.loadFactor).toBe(0)
    })
  })

  // ─── forEach ─────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const result: Array<[string, number]> = []
      map.forEach((key, value) => {
        result.push([key, value])
      })
      expect(result.length).toBe(3)
      const keys = result.map((r) => r[0])
      const values = result.map((r) => r[1])
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('does not call callback on empty map', () => {
      const map = new CuckooHashMap<string, number>()
      let callCount = 0
      map.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('provides correct key-value pairs', () => {
      const map = new CuckooHashMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      const collected: Record<number, string> = {}
      map.forEach((key, value) => {
        collected[key] = value
      })
      expect(collected[10]).toBe('ten')
      expect(collected[20]).toBe('twenty')
    })

    it('iterates after delete', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const keys: string[] = []
      map.forEach((key) => keys.push(key))
      expect(keys.length).toBe(2)
      expect(keys).toContain('a')
      expect(keys).toContain('c')
      expect(keys).not.toContain('b')
    })
  })

  // ─── keys ────────────────────────────────────────────────────────────

  describe('keys', () => {
    it('returns all keys', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = map.keys()
      expect(keys.length).toBe(3)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('returns empty array for empty map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.keys()).toEqual([])
    })

    it('does not include deleted keys', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const keys = map.keys()
      expect(keys).toEqual(['b'])
    })

    it('returns updated set after re-adding', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.delete('a')
      map.set('a', 99)
      expect(map.keys()).toEqual(['a'])
    })
  })

  // ─── values ──────────────────────────────────────────────────────────

  describe('values', () => {
    it('returns all values', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const values = map.values()
      expect(values.length).toBe(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('returns empty array for empty map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.values()).toEqual([])
    })

    it('returns updated value after overwrite', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('a', 99)
      const values = map.values()
      expect(values).toEqual([99])
    })

    it('does not include values of deleted keys', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const values = map.values()
      expect(values).toEqual([2])
    })
  })

  // ─── entries ─────────────────────────────────────────────────────────

  describe('entries', () => {
    it('returns all key-value pairs', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries.length).toBe(2)
      const asMap = new Map(entries)
      expect(asMap.get('a')).toBe(1)
      expect(asMap.get('b')).toBe(2)
    })

    it('returns empty array for empty map', () => {
      const map = new CuckooHashMap<string, number>()
      expect(map.entries()).toEqual([])
    })

    it('returns correct entries after delete', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      const entries = map.entries()
      expect(entries.length).toBe(2)
      const keys = entries.map((e) => e[0])
      expect(keys).toContain('a')
      expect(keys).toContain('c')
      expect(keys).not.toContain('b')
    })
  })

  // ─── Symbol.iterator ─────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over all entries with for-of', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const result: Array<[string, number]> = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result.length).toBe(2)
      const asMap = new Map(result)
      expect(asMap.get('a')).toBe(1)
      expect(asMap.get('b')).toBe(2)
    })

    it('produces no iterations on empty map', () => {
      const map = new CuckooHashMap<string, number>()
      const result: Array<[string, number]> = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toEqual([])
    })

    it('works with spread into array', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('x', 10)
      map.set('y', 20)
      const spread = [...map]
      expect(spread.length).toBe(2)
      const keys = spread.map((e) => e[0])
      expect(keys).toContain('x')
      expect(keys).toContain('y')
    })
  })

  // ─── rehash ──────────────────────────────────────────────────────────

  describe('rehash', () => {
    it('preserves all entries after rehash', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.rehash(32)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('increases capacity', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 8 })
      map.rehash(32)
      expect(map.getStats().capacity).toBe(32)
    })

    it('clamps new capacity to minimum of 2', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.rehash(1)
      expect(map.getStats().capacity).toBe(2)
    })

    it('uses current capacity when no argument given', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      map.rehash()
      expect(map.getStats().capacity).toBe(16)
      expect(map.get('a')).toBe(1)
    })

    it('can rehash empty map', () => {
      const map = new CuckooHashMap<string, number>()
      map.rehash(64)
      expect(map.getStats().capacity).toBe(64)
      expect(map.size).toBe(0)
    })
  })

  // ─── getStats ────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns correct stats for empty map', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      const stats = map.getStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(0)
      expect(stats.maxKicksUsed).toBe(0)
    })

    it('returns updated stats after insertions', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 16 })
      map.set('a', 1)
      map.set('b', 2)
      const stats = map.getStats()
      expect(stats.size).toBe(2)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBeGreaterThan(0)
    })

    it('returns correct stats after clear', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.clear()
      const stats = map.getStats()
      expect(stats.size).toBe(0)
      expect(stats.maxKicksUsed).toBe(0)
    })

    it('tracks maxKicksUsed', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 4 })
      for (let i = 0; i < 20; i++) {
        map.set(i, i)
      }
      const stats = map.getStats()
      expect(stats.maxKicksUsed).toBeGreaterThanOrEqual(0)
    })

    it('stats has all required fields', () => {
      const map = new CuckooHashMap<string, number>()
      const stats: CuckooHashMapStats = map.getStats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('capacity')
      expect(stats).toHaveProperty('loadFactor')
      expect(stats).toHaveProperty('maxKicksUsed')
    })
  })

  // ─── Collisions and Eviction ─────────────────────────────────────────

  describe('collisions and eviction', () => {
    it('handles many keys with small capacity', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 4, maxKicks: 100 })
      for (let i = 0; i < 50; i++) {
        map.set(i, i * 2)
      }
      expect(map.size).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(map.get(i)).toBe(i * 2)
      }
    })

    it('handles eviction chain with rehash', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 4, maxKicks: 8 })
      for (let i = 0; i < 30; i++) {
        map.set(i, i)
      }
      expect(map.size).toBe(30)
      for (let i = 0; i < 30; i++) {
        expect(map.has(i)).toBe(true)
      }
    })

    it('handles deleting from a full map and re-adding', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 4 })
      for (let i = 0; i < 8; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 4; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(4)
      for (let i = 0; i < 4; i++) {
        map.set(i, i * 100)
      }
      expect(map.size).toBe(8)
      for (let i = 0; i < 4; i++) {
        expect(map.get(i)).toBe(i * 100)
      }
    })

    it('overwrites do not cause eviction', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      map.set('a', 1)
      map.set('b', 2)
      const kicksBefore = map.getStats().maxKicksUsed
      for (let i = 0; i < 10; i++) {
        map.set('a', i)
        map.set('b', i)
      }
      expect(map.size).toBe(2)
      expect(map.getStats().maxKicksUsed).toBe(kicksBefore)
    })
  })

  // ─── Edge Cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles string keys that look similar', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('ab', 2)
      map.set('abc', 3)
      map.set('abcd', 4)
      expect(map.get('a')).toBe(1)
      expect(map.get('ab')).toBe(2)
      expect(map.get('abc')).toBe(3)
      expect(map.get('abcd')).toBe(4)
    })

    it('handles keys with special characters', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('hello world', 1)
      map.set('hello\nworld', 2)
      map.set('\t\t', 3)
      map.set('🎉', 4)
      expect(map.get('hello world')).toBe(1)
      expect(map.get('hello\nworld')).toBe(2)
      expect(map.get('\t\t')).toBe(3)
      expect(map.get('🎉')).toBe(4)
    })

    it('handles key type of number 0', () => {
      const map = new CuckooHashMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('handles NaN as key', () => {
      const map = new CuckooHashMap<number, string>()
      map.set(NaN, 'not-a-number')
      expect(map.size).toBe(1)
    })

    it('survives set-delete-set cycle many times', () => {
      const map = new CuckooHashMap<string, number>({ capacity: 4 })
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          map.set(`key-${i}`, i)
        }
        for (let i = 0; i < 10; i++) {
          expect(map.get(`key-${i}`)).toBe(i)
        }
        for (let i = 0; i < 10; i++) {
          map.delete(`key-${i}`)
        }
        expect(map.size).toBe(0)
      }
    })

    it('handles large number of entries', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 16 })
      const count = 200
      for (let i = 0; i < count; i++) {
        map.set(i, i * i)
      }
      expect(map.size).toBe(count)
      for (let i = 0; i < count; i++) {
        expect(map.get(i)).toBe(i * i)
      }
    })

    it('handles adding entries after clear', () => {
      const map = new CuckooHashMap<string, number>()
      for (let i = 0; i < 10; i++) {
        map.set(`key-${i}`, i)
      }
      map.clear()
      expect(map.size).toBe(0)
      map.set('fresh', 42)
      expect(map.size).toBe(1)
      expect(map.get('fresh')).toBe(42)
    })

    it('iterators work correctly after mutations', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      map.set('d', 4)
      const keys = map.keys()
      expect(keys.sort()).toEqual(['a', 'c', 'd'])
    })

    it('forEach sees correct state at iteration time', () => {
      const map = new CuckooHashMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      const keys: string[] = []
      map.forEach((key) => {
        keys.push(key)
      })
      expect(keys.length).toBe(2)
      expect(keys.sort()).toEqual(['a', 'b'])
    })

    it('handles map with number keys where some are strings of numbers', () => {
      const numMap = new CuckooHashMap<number, string>()
      numMap.set(1, 'number-one')
      expect(numMap.get(1)).toBe('number-one')
      expect(numMap.size).toBe(1)
    })

    it('getStats returns increasing capacity after resizes', () => {
      const map = new CuckooHashMap<number, number>({ capacity: 4 })
      const initialCapacity = map.getStats().capacity
      for (let i = 0; i < 50; i++) {
        map.set(i, i)
      }
      const finalCapacity = map.getStats().capacity
      expect(finalCapacity).toBeGreaterThan(initialCapacity)
    })

    it('supports multiple types of values in the same map', () => {
      const map = new CuckooHashMap<string, string | number | boolean>()
      map.set('str', 'hello')
      map.set('num', 42)
      map.set('bool', true)
      expect(map.get('str')).toBe('hello')
      expect(map.get('num')).toBe(42)
      expect(map.get('bool')).toBe(true)
    })
  })

  // ─── Type Imports ────────────────────────────────────────────────────

  describe('type exports', () => {
    it('CuckooHashMapOptions type is usable', () => {
      const opts: CuckooHashMapOptions = { capacity: 32, maxKicks: 100 }
      const map = new CuckooHashMap<string, number>(opts)
      expect(map.getStats().capacity).toBe(32)
    })

    it('CuckooHashMapStats type is returned from getStats', () => {
      const map = new CuckooHashMap<string, number>()
      const stats: CuckooHashMapStats = map.getStats()
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.capacity).toBe('number')
      expect(typeof stats.loadFactor).toBe('number')
      expect(typeof stats.maxKicksUsed).toBe('number')
    })

    it('CuckooEntry type is exported', () => {
      const entry: CuckooEntry<string, number> = { key: 'test', value: 42 }
      expect(entry.key).toBe('test')
      expect(entry.value).toBe(42)
    })
  })
})
