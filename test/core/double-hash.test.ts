import { describe, it, expect } from 'vitest'
import { DoubleHashTable } from '../../src/core/double-hash/double-hash'

describe('DoubleHashTable', () => {
  describe('constructor', () => {
    it('creates table with default capacity 16', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.capacity()).toBe(16)
      expect(ht.size()).toBe(0)
    })

    it('creates table with custom capacity via options', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 32 })
      expect(ht.capacity()).toBe(32)
    })

    it('enforces minimum capacity of 16', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 4 })
      expect(ht.capacity()).toBe(16)
    })

    it('accepts custom load factor threshold', () => {
      const ht = new DoubleHashTable<string, number>({ loadFactorThreshold: 0.5 })
      expect(ht.loadFactor()).toBe(0)
    })

    it('accepts both capacity and load factor', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 64, loadFactorThreshold: 0.8 })
      expect(ht.capacity()).toBe(64)
    })

    it('creates empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.isEmpty()).toBe(true)
      expect(ht.size()).toBe(0)
    })
  })

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.get('missing')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('handles multiple keys', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
    })

    it('stores various value types', () => {
      const ht = new DoubleHashTable<string, string>()
      ht.set('hello', 'world')
      expect(ht.get('hello')).toBe('world')
    })

    it('returns undefined for get on empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.get('a')).toBeUndefined()
    })

    it('handles numeric keys', () => {
      const ht = new DoubleHashTable<number, string>()
      ht.set(1, 'one')
      ht.set(2, 'two')
      expect(ht.get(1)).toBe('one')
      expect(ht.get(2)).toBe('two')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.has('a')).toBe(false)
    })

    it('returns false after deletion', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.delete('a')
      expect(ht.has('a')).toBe(false)
    })

    it('returns true for key with undefined value stored', () => {
      const ht = new DoubleHashTable<string, number | undefined>()
      ht.set('a', undefined)
      expect(ht.has('a')).toBe(true)
    })

    it('returns false on empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.has('anything')).toBe(false)
    })
  })

  describe('delete', () => {
    it('removes an existing key', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.delete('a')).toBe(true)
      expect(ht.get('a')).toBeUndefined()
      expect(ht.size()).toBe(0)
    })

    it('returns false for missing key', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.delete('missing')).toBe(false)
    })

    it('does not affect other keys', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      expect(ht.get('a')).toBe(1)
      expect(ht.get('c')).toBe(3)
      expect(ht.size()).toBe(2)
    })

    it('handles delete on empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.delete('a')).toBe(false)
    })

    it('allows re-insert after delete', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.delete('a')
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('delete same key twice returns false second time', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.delete('a')).toBe(true)
      expect(ht.delete('a')).toBe(false)
    })

    it('handles multiple deletions', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('a')
      ht.delete('c')
      expect(ht.size()).toBe(1)
      expect(ht.get('b')).toBe(2)
    })
  })

  describe('size', () => {
    it('returns correct size', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.size()).toBe(0)
      ht.set('a', 1)
      expect(ht.size()).toBe(1)
      ht.set('b', 2)
      expect(ht.size()).toBe(2)
    })

    it('size does not increase on overwrite', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('a', 2)
      expect(ht.size()).toBe(1)
    })

    it('size decreases after delete', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      expect(ht.size()).toBe(1)
    })

    it('size stays at 0 after deleting from empty', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.delete('a')
      expect(ht.size()).toBe(0)
    })
  })

  describe('capacity', () => {
    it('returns initial capacity', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 32 })
      expect(ht.capacity()).toBe(32)
    })

    it('returns 16 for default construction', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.capacity()).toBe(16)
    })
  })

  describe('loadFactor', () => {
    it('is 0 for empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.loadFactor()).toBe(0)
    })

    it('increases with inserts', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      ht.set('a', 1)
      expect(ht.loadFactor()).toBeCloseTo(1 / 16)
      ht.set('b', 2)
      expect(ht.loadFactor()).toBeCloseTo(2 / 16)
    })

    it('decreases after delete', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      ht.set('a', 1)
      ht.set('b', 2)
      const lfBefore = ht.loadFactor()
      ht.delete('a')
      expect(ht.loadFactor()).toBeLessThan(lfBefore)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.isEmpty()).toBe(false)
    })

    it('returns true after deleting all entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.delete('a')
      expect(ht.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.clear()
      expect(ht.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.clear()
      expect(ht.size()).toBe(0)
      expect(ht.isEmpty()).toBe(true)
    })

    it('allows operations after clear', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.clear()
      ht.set('b', 2)
      expect(ht.get('b')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('clear on empty table is no-op', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.clear()
      expect(ht.size()).toBe(0)
    })

    it('clear resets tombstones', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.delete('a')
      ht.set('b', 2)
      ht.clear()
      expect(ht.size()).toBe(0)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const cloned = ht.clone()
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
      expect(cloned.size()).toBe(2)
    })

    it('clone is independent from original', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      const cloned = ht.clone()
      cloned.set('a', 99)
      expect(ht.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(99)
    })

    it('clone preserves capacity', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 32 })
      const cloned = ht.clone()
      expect(cloned.capacity()).toBe(32)
    })

    it('clone of empty table works', () => {
      const ht = new DoubleHashTable<string, number>()
      const cloned = ht.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone delete does not affect original', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      const cloned = ht.clone()
      cloned.delete('a')
      expect(ht.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })

    it('clone after clear is empty', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.clear()
      const cloned = ht.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clone after modifications', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      const cloned = ht.clone()
      expect(cloned.size()).toBe(1)
      expect(cloned.has('b')).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns entries as array', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const arr = ht.toArray()
      expect(arr).toHaveLength(2)
      expect(arr.some(([k, v]) => k === 'a' && v === 1)).toBe(true)
      expect(arr.some(([k, v]) => k === 'b' && v === 2)).toBe(true)
    })

    it('returns empty array for empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.toArray()).toEqual([])
    })
  })

  describe('keys', () => {
    it('returns all keys', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      expect(ht.keys().sort()).toEqual(['a', 'b', 'c'])
    })

    it('returns empty array for empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.keys()).toEqual([])
    })

    it('does not include deleted entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      const ks = ht.keys()
      expect(ks).not.toContain('b')
      expect(ks).toContain('a')
      expect(ks).toContain('c')
    })
  })

  describe('values', () => {
    it('returns all values', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      expect(ht.values().sort()).toEqual([1, 2, 3])
    })

    it('returns empty array for empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.values()).toEqual([])
    })

    it('does not include deleted entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      const vs = ht.values()
      expect(vs).not.toContain(2)
      expect(vs).toContain(1)
      expect(vs).toContain(3)
    })
  })

  describe('entries', () => {
    it('returns all key-value pairs', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const ents = ht.entries()
      expect(ents).toHaveLength(2)
      expect(ents.some(e => e[0] === 'a' && e[1] === 1)).toBe(true)
      expect(ents.some(e => e[0] === 'b' && e[1] === 2)).toBe(true)
    })

    it('returns empty array for empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.entries()).toEqual([])
    })

    it('does not include deleted entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('b')
      const es = ht.entries()
      expect(es).toHaveLength(1)
      expect(es[0]![0]).toBe('a')
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      const result: Array<[string, number]> = []
      ht.forEach((k, v) => result.push([k, v]))
      expect(result).toHaveLength(3)
    })

    it('does not iterate on empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      let count = 0
      ht.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('provides correct key-value pairs', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('x', 10)
      const result: Array<[string, number]> = []
      ht.forEach((k, v) => result.push([k, v]))
      expect(result).toEqual([['x', 10]])
    })

    it('visits correct number of entries after delete', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      let count = 0
      ht.forEach(() => { count++ })
      expect(count).toBe(2)
    })
  })

  describe('from factory', () => {
    it('creates table from entries', () => {
      const ht = DoubleHashTable.from([['a', 1], ['b', 2], ['c', 3]])
      expect(ht.size()).toBe(3)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
    })

    it('creates empty table from empty array', () => {
      const ht = DoubleHashTable.from<string, number>([])
      expect(ht.size()).toBe(0)
      expect(ht.isEmpty()).toBe(true)
    })

    it('accepts options', () => {
      const ht = DoubleHashTable.from([['a', 1]], { capacity: 64 })
      expect(ht.capacity()).toBe(64)
      expect(ht.get('a')).toBe(1)
    })

    it('handles duplicate keys by keeping last', () => {
      const ht = DoubleHashTable.from([['a', 1], ['a', 2]])
      expect(ht.get('a')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('creates table from number entries', () => {
      const ht = DoubleHashTable.from([[1, 'one'], [2, 'two']])
      expect(ht.get(1)).toBe('one')
      expect(ht.get(2)).toBe('two')
    })
  })

  describe('rehash', () => {
    it('preserves all entries on rehash', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.rehash(64)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
      expect(ht.size()).toBe(3)
      expect(ht.capacity()).toBe(64)
    })

    it('enforces minimum capacity on rehash', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.rehash(4)
      expect(ht.capacity()).toBe(16)
    })

    it('rehash to same capacity works', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      ht.set('a', 1)
      ht.set('b', 2)
      ht.rehash(16)
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
    })

    it('rehash without argument uses current capacity', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 32 })
      ht.set('a', 1)
      ht.rehash()
      expect(ht.capacity()).toBe(32)
      expect(ht.get('a')).toBe(1)
    })

    it('rehash clears tombstones', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      ht.rehash()
      expect(ht.get('b')).toBe(2)
      expect(ht.has('a')).toBe(false)
      const s = ht.stats()
      expect(s.tombstoneCount).toBe(0)
    })

    it('rehash after modifications', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      ht.rehash(64)
      expect(ht.get('b')).toBe(2)
      expect(ht.has('a')).toBe(false)
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty table', () => {
      const ht = new DoubleHashTable<string, number>()
      const s = ht.stats()
      expect(s.size).toBe(0)
      expect(s.capacity).toBe(16)
      expect(s.loadFactor).toBe(0)
      expect(s.tombstoneCount).toBe(0)
      expect(s.maxProbeLength).toBe(0)
      expect(s.averageProbeLength).toBe(0)
    })

    it('returns correct stats after inserts', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const s = ht.stats()
      expect(s.size).toBe(2)
      expect(s.loadFactor).toBeCloseTo(2 / 16)
      expect(s.tombstoneCount).toBe(0)
    })

    it('tracks tombstone count', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      const s = ht.stats()
      expect(s.tombstoneCount).toBe(1)
      expect(s.size).toBe(1)
    })

    it('tracks multiple tombstones', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('a')
      ht.delete('c')
      const s = ht.stats()
      expect(s.tombstoneCount).toBe(2)
      expect(s.size).toBe(1)
    })

    it('reports probe lengths', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 10; i++) {
        ht.set(`key${i}`, i)
      }
      const s = ht.stats()
      expect(s.maxProbeLength).toBeGreaterThanOrEqual(0)
      expect(s.averageProbeLength).toBeGreaterThanOrEqual(0)
    })

    it('average probe length is bounded by max', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 12; i++) {
        ht.set(`key${i}`, i)
      }
      const s = ht.stats()
      expect(s.averageProbeLength).toBeLessThanOrEqual(s.maxProbeLength)
    })
  })

  describe('toString', () => {
    it('returns empty representation', () => {
      const ht = new DoubleHashTable<string, number>()
      expect(ht.toString()).toBe('DoubleHashTable{}')
    })

    it('includes entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      const s = ht.toString()
      expect(s).toContain('DoubleHashTable{')
      expect(s).toContain('a:1')
    })

    it('handles multiple entries', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      const s = ht.toString()
      expect(s).toContain('a:1')
      expect(s).toContain('b:2')
    })

    it('handles complex values', () => {
      const ht = new DoubleHashTable<string, object>()
      ht.set('obj', { x: 1 })
      const s = ht.toString()
      expect(s).toContain('obj:')
    })
  })

  describe('tombstone handling', () => {
    it('can find keys after deleting from middle', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.set('d', 4)
      ht.delete('b')
      expect(ht.get('a')).toBe(1)
      expect(ht.get('c')).toBe(3)
      expect(ht.get('d')).toBe(4)
    })

    it('can find keys after deleting from start', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('a')
      expect(ht.get('b')).toBe(2)
      expect(ht.get('c')).toBe(3)
    })

    it('can find keys after deleting from end', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('c')
      expect(ht.get('a')).toBe(1)
      expect(ht.get('b')).toBe(2)
    })

    it('reuses tombstone slots on insert', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      expect(ht.stats().tombstoneCount).toBe(1)
      ht.set('b', 10)
      expect(ht.get('b')).toBe(10)
      expect(ht.stats().tombstoneCount).toBe(0)
    })

    it('handles many interleaved insert-deletes', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.delete('a')
      ht.set('c', 3)
      ht.delete('b')
      ht.set('d', 4)
      expect(ht.get('c')).toBe(3)
      expect(ht.get('d')).toBe(4)
      expect(ht.has('a')).toBe(false)
      expect(ht.has('b')).toBe(false)
      expect(ht.size()).toBe(2)
    })

    it('insert at deleted key position', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.delete('a')
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
      expect(ht.size()).toBe(1)
    })
  })

  describe('resize behavior', () => {
    it('auto-resizes at default 70% load factor', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 13; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.capacity()).toBeGreaterThan(16)
    })

    it('respects custom load factor threshold', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16, loadFactorThreshold: 0.5 })
      for (let i = 0; i < 9; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.capacity()).toBeGreaterThan(16)
    })

    it('preserves all data through resize', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 20; i++) {
        ht.set(`k${i}`, i)
      }
      for (let i = 0; i < 20; i++) {
        expect(ht.get(`k${i}`)).toBe(i)
      }
    })

    it('maintains correct size after resize', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 20; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.size()).toBe(20)
    })

    it('resizes with tombstones included in load', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i)
      }
      for (let i = 0; i < 5; i++) {
        ht.delete(`k${i}`)
      }
      for (let i = 10; i < 16; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.size()).toBe(11)
    })
  })

  describe('overwrite existing keys', () => {
    it('overwrites value without changing size', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
      expect(ht.size()).toBe(1)
    })

    it('handles many overwrites', () => {
      const ht = new DoubleHashTable<string, number>()
      for (let i = 0; i < 10; i++) {
        ht.set('key', i)
      }
      expect(ht.get('key')).toBe(9)
      expect(ht.size()).toBe(1)
    })

    it('overwrite during high load', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i)
      }
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i * 10)
      }
      expect(ht.size()).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(ht.get(`k${i}`)).toBe(i * 10)
      }
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('only', 42)
      expect(ht.get('only')).toBe(42)
      expect(ht.size()).toBe(1)
      ht.delete('only')
      expect(ht.isEmpty()).toBe(true)
    })

    it('handles empty string key', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('', 0)
      expect(ht.get('')).toBe(0)
      expect(ht.has('')).toBe(true)
    })

    it('handles zero as key', () => {
      const ht = new DoubleHashTable<number, string>()
      ht.set(0, 'zero')
      expect(ht.get(0)).toBe('zero')
    })

    it('handles null as key via stringification', () => {
      const ht = new DoubleHashTable<null, number>()
      ht.set(null, 1)
      expect(ht.get(null)).toBe(1)
    })

    it('handles various numeric key ranges', () => {
      const ht = new DoubleHashTable<number, string>()
      ht.set(1e10, 'big')
      ht.set(-1e10, 'negbig')
      ht.set(0.5, 'frac')
      expect(ht.get(1e10)).toBe('big')
      expect(ht.get(-1e10)).toBe('negbig')
      expect(ht.get(0.5)).toBe('frac')
    })

    it('handles boolean keys', () => {
      const ht = new DoubleHashTable<boolean, string>()
      ht.set(true, 'yes')
      ht.set(false, 'no')
      expect(ht.get(true)).toBe('yes')
      expect(ht.get(false)).toBe('no')
    })

    it('handles object identity keys', () => {
      const ht = new DoubleHashTable<object, number>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      ht.set(obj1, 100)
      ht.set(obj2, 200)
      expect(ht.get(obj1)).toBe(100)
      expect(ht.get(obj2)).toBe(200)
    })

    it('handles negative number keys', () => {
      const ht = new DoubleHashTable<number, string>()
      ht.set(-1, 'neg')
      ht.set(0, 'zero')
      ht.set(1, 'pos')
      expect(ht.get(-1)).toBe('neg')
      expect(ht.get(0)).toBe('zero')
      expect(ht.get(1)).toBe('pos')
    })

    it('get on deleted slot returns undefined', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.set('c', 3)
      ht.delete('b')
      expect(ht.get('b')).toBeUndefined()
      expect(ht.get('a')).toBe(1)
      expect(ht.get('c')).toBe(3)
    })
  })

  describe('large tables (10000+ entries)', () => {
    it('handles 10000 inserts with number keys', () => {
      const ht = new DoubleHashTable<number, number>()
      for (let i = 0; i < 10000; i++) {
        ht.set(i, i * 2)
      }
      expect(ht.size()).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(ht.get(i)).toBe(i * 2)
      }
    })

    it('handles 10000 inserts with string keys', () => {
      const ht = new DoubleHashTable<string, number>()
      for (let i = 0; i < 10000; i++) {
        ht.set(`key_${i}`, i)
      }
      expect(ht.size()).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(ht.has(`key_${i}`)).toBe(true)
      }
    })

    it('handles 10000 mixed insert-delete operations', () => {
      const ht = new DoubleHashTable<number, number>()
      for (let i = 0; i < 5000; i++) {
        ht.set(i, i)
      }
      for (let i = 0; i < 2500; i++) {
        ht.delete(i)
      }
      for (let i = 5000; i < 10000; i++) {
        ht.set(i, i)
      }
      expect(ht.size()).toBe(7500)
      for (let i = 2500; i < 10000; i++) {
        expect(ht.get(i)).toBe(i)
      }
    })

    it('maintains all data through multiple resizes', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 10000; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.size()).toBe(10000)
      for (let i = 0; i < 10000; i++) {
        expect(ht.get(`k${i}`)).toBe(i)
      }
    })
  })

  describe('collision handling', () => {
    it('handles sequential inserts correctly', () => {
      const ht = new DoubleHashTable<number, string>()
      for (let i = 0; i < 20; i++) {
        ht.set(i, `val${i}`)
      }
      for (let i = 0; i < 20; i++) {
        expect(ht.get(i)).toBe(`val${i}`)
      }
    })

    it('maintains integrity after many overwrites', () => {
      const ht = new DoubleHashTable<string, number>()
      for (let i = 0; i < 10; i++) {
        ht.set('key', i)
      }
      expect(ht.get('key')).toBe(9)
      expect(ht.size()).toBe(1)
    })

    it('handles sequential deletions in order', () => {
      const ht = new DoubleHashTable<number, number>()
      for (let i = 0; i < 10; i++) {
        ht.set(i, i)
      }
      for (let i = 0; i < 10; i++) {
        ht.delete(i)
      }
      expect(ht.size()).toBe(0)
      expect(ht.isEmpty()).toBe(true)
    })

    it('handles sequential deletions in reverse order', () => {
      const ht = new DoubleHashTable<number, number>()
      for (let i = 0; i < 10; i++) {
        ht.set(i, i)
      }
      for (let i = 9; i >= 0; i--) {
        ht.delete(i)
      }
      expect(ht.size()).toBe(0)
    })
  })

  describe('mixed operations', () => {
    it('set-get-delete-set cycle', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      expect(ht.get('a')).toBe(1)
      ht.delete('a')
      expect(ht.get('a')).toBeUndefined()
      ht.set('a', 2)
      expect(ht.get('a')).toBe(2)
    })

    it('multiple overwrites and deletes', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('a', 2)
      ht.set('a', 3)
      expect(ht.get('a')).toBe(3)
      ht.delete('a')
      expect(ht.get('a')).toBeUndefined()
      ht.set('a', 4)
      expect(ht.get('a')).toBe(4)
    })

    it('clear followed by new operations', () => {
      const ht = new DoubleHashTable<string, number>()
      ht.set('a', 1)
      ht.set('b', 2)
      ht.clear()
      ht.set('c', 3)
      expect(ht.size()).toBe(1)
      expect(ht.has('a')).toBe(false)
      expect(ht.has('c')).toBe(true)
    })

    it('delete non-existent key during high load', () => {
      const ht = new DoubleHashTable<string, number>({ capacity: 16 })
      for (let i = 0; i < 10; i++) {
        ht.set(`k${i}`, i)
      }
      expect(ht.delete('missing')).toBe(false)
      expect(ht.size()).toBe(10)
    })
  })

  describe('stress test', () => {
    it('insert-delete-reinsert pattern', () => {
      const ht = new DoubleHashTable<number, number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 50; i++) {
          ht.set(i, i + round * 100)
        }
        for (let i = 0; i < 25; i++) {
          ht.delete(i)
        }
      }
      for (let i = 25; i < 50; i++) {
        expect(ht.get(i)).toBe(i + 400)
      }
      expect(ht.size()).toBe(25)
    })

    it('handles many unique string keys', () => {
      const ht = new DoubleHashTable<string, number>()
      const keys: string[] = []
      for (let i = 0; i < 500; i++) {
        const key = `user_${i}@domain${i % 10}.com`
        ht.set(key, i)
        keys.push(key)
      }
      for (const key of keys) {
        expect(ht.has(key)).toBe(true)
      }
      expect(ht.size()).toBe(500)
    })

    it('1000 inserts then 1000 deletes then 1000 inserts', () => {
      const ht = new DoubleHashTable<number, number>()
      for (let i = 0; i < 1000; i++) {
        ht.set(i, i)
      }
      for (let i = 0; i < 1000; i++) {
        ht.delete(i)
      }
      expect(ht.isEmpty()).toBe(true)
      for (let i = 0; i < 1000; i++) {
        ht.set(i, i * 2)
      }
      expect(ht.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(ht.get(i)).toBe(i * 2)
      }
    })
  })

  describe('double hashing properties', () => {
    it('probe step size varies per key', () => {
      const ht = new DoubleHashTable<string, number>() as unknown as {
        hash2: (key: string) => number
      }
      const steps = new Set<number>()
      for (let i = 0; i < 20; i++) {
        steps.add((ht as unknown as { hash2(k: string): number }).hash2(`key${i}`))
      }
      expect(steps.size).toBeGreaterThan(1)
    })

    it('max probe length stays reasonable', () => {
      const ht = new DoubleHashTable<string, number>()
      for (let i = 0; i < 100; i++) {
        ht.set(`k${i}`, i)
      }
      const s = ht.stats()
      expect(s.maxProbeLength).toBeLessThan(30)
    })

    it('average probe length stays reasonable', () => {
      const ht = new DoubleHashTable<string, number>()
      for (let i = 0; i < 100; i++) {
        ht.set(`k${i}`, i)
      }
      const s = ht.stats()
      expect(s.averageProbeLength).toBeLessThan(10)
    })
  })
})
