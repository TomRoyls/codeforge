import { describe, it, expect } from 'vitest'
import { PersistentMap } from '../../src/core/persistent-map/index.js'
import type { PersistentMapOptions } from '../../src/core/persistent-map/types.js'

function createMap<K, V>(): PersistentMap<K, V> {
  return new PersistentMap<K, V>()
}

function createMapWithHash<K, V>(hash: (key: K) => number): PersistentMap<K, V> {
  return new PersistentMap<K, V>({ hash })
}

function constantHash(): (key: string) => number {
  return (_key: string) => 42
}

describe('PersistentMap', () => {
  describe('constructor', () => {
    it('creates an empty map with no arguments', () => {
      const map = new PersistentMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates a map with options object', () => {
      const map = new PersistentMap<string, number>({})
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates a map with custom hash function', () => {
      const map = new PersistentMap<string, number>({
        hash: (key) => key.length,
      })
      const m = map.set('a', 1).set('bb', 2)
      expect(m.get('a')).toBe(1)
      expect(m.get('bb')).toBe(2)
    })

    it('handles undefined options', () => {
      const map = new PersistentMap<number, string>(undefined)
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates independent instances', () => {
      const m1 = new PersistentMap<number, number>()
      const m2 = new PersistentMap<number, number>()
      expect(m1.size).toBe(0)
      expect(m2.size).toBe(0)
    })
  })

  describe('set', () => {
    it('sets a single entry', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('returns a new map, leaving original unchanged', () => {
      const original = createMap<string, number>()
      const modified = original.set('a', 1)
      expect(original.size).toBe(0)
      expect(original.isEmpty).toBe(true)
      expect(modified.size).toBe(1)
      expect(modified.get('a')).toBe(1)
    })

    it('sets multiple entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('overwrites existing key', () => {
      const map = createMap<string, number>().set('a', 1).set('a', 2)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(2)
    })

    it('overwrite preserves size', () => {
      const m1 = createMap<string, number>().set('a', 1).set('b', 2)
      const m2 = m1.set('a', 10)
      expect(m1.get('a')).toBe(1)
      expect(m2.get('a')).toBe(10)
      expect(m2.size).toBe(2)
    })

    it('set with numeric keys', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })

    it('set with negative keys', () => {
      const map = createMap<number, string>().set(-1, 'neg').set(0, 'zero').set(1, 'pos')
      expect(map.get(-1)).toBe('neg')
      expect(map.get(0)).toBe('zero')
      expect(map.get(1)).toBe('pos')
    })

    it('set with object values', () => {
      const map = createMap<string, { x: number }>()
        .set('a', { x: 1 })
        .set('b', { x: 2 })
      expect(map.get('a')!.x).toBe(1)
      expect(map.get('b')!.x).toBe(2)
    })

    it('set with undefined value', () => {
      const map = createMap<string, number | undefined>().set('a', undefined)
      expect(map.has('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
    })

    it('set with null value', () => {
      const map = createMap<string, number | null>().set('a', null)
      expect(map.has('a')).toBe(true)
      expect(map.get('a')).toBeNull()
    })

    it('chain set preserves all previous versions', () => {
      const m0 = createMap<string, number>()
      const m1 = m0.set('a', 1)
      const m2 = m1.set('b', 2)
      const m3 = m2.set('c', 3)
      expect(m0.size).toBe(0)
      expect(m1.size).toBe(1)
      expect(m1.get('a')).toBe(1)
      expect(m2.size).toBe(2)
      expect(m2.get('b')).toBe(2)
      expect(m3.size).toBe(3)
      expect(m3.get('c')).toBe(3)
    })
  })

  describe('delete', () => {
    it('returns same map when deleting from empty map', () => {
      const map = createMap<string, number>()
      const result = map.delete('a')
      expect(result.size).toBe(0)
    })

    it('deletes a single entry', () => {
      const map = createMap<string, number>().set('a', 1)
      const result = map.delete('a')
      expect(result.size).toBe(0)
      expect(result.isEmpty).toBe(true)
    })

    it('returns a new map, leaving original unchanged', () => {
      const original = createMap<string, number>().set('a', 1).set('b', 2)
      const modified = original.delete('a')
      expect(original.size).toBe(2)
      expect(original.get('a')).toBe(1)
      expect(modified.size).toBe(1)
      expect(modified.has('a')).toBe(false)
    })

    it('deletes from middle of map', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const result = map.delete(2)
      expect(result.size).toBe(2)
      expect(result.get(1)).toBe('a')
      expect(result.has(2)).toBe(false)
      expect(result.get(3)).toBe('c')
    })

    it('deletes non-existent key returns same map', () => {
      const map = createMap<string, number>().set('a', 1)
      const result = map.delete('z')
      expect(result).toBe(map)
    })

    it('deletes and re-adds', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = m1.delete('a')
      const m3 = m2.set('a', 2)
      expect(m3.size).toBe(1)
      expect(m3.get('a')).toBe(2)
    })

    it('sequential deletes', () => {
      const m = createMap<number, number>().set(1, 10).set(2, 20).set(3, 30)
      const m2 = m.delete(2)
      const m3 = m2.delete(1)
      const m4 = m3.delete(3)
      expect(m4.isEmpty).toBe(true)
    })

    it('delete last remaining entry', () => {
      const m = createMap<string, number>().set('only', 42)
      const result = m.delete('only')
      expect(result.isEmpty).toBe(true)
      expect(result.size).toBe(0)
    })
  })

  describe('get', () => {
    it('returns undefined for missing key', () => {
      expect(createMap<string, number>().get('a')).toBeUndefined()
    })

    it('returns value for existing key', () => {
      expect(createMap<string, number>().set('a', 42).get('a')).toBe(42)
    })

    it('returns undefined after delete', () => {
      const map = createMap<string, number>().set('a', 1).delete('a')
      expect(map.get('a')).toBeUndefined()
    })

    it('returns overwritten value', () => {
      expect(createMap<string, number>().set('a', 1).set('a', 2).get('a')).toBe(2)
    })

    it('get on original after modification', () => {
      const original = createMap<string, number>().set('a', 1)
      const modified = original.set('a', 2)
      expect(original.get('a')).toBe(1)
      expect(modified.get('a')).toBe(2)
    })

    it('get with numeric keys', () => {
      const map = createMap<number, string>().set(42, 'answer')
      expect(map.get(42)).toBe('answer')
      expect(map.get(0)).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns false for empty map', () => {
      expect(createMap<string, number>().has('a')).toBe(false)
    })

    it('returns true for existing key', () => {
      expect(createMap<string, number>().set('a', 1).has('a')).toBe(true)
    })

    it('returns false after delete', () => {
      expect(createMap<string, number>().set('a', 1).delete('a').has('a')).toBe(false)
    })

    it('returns true after overwrite', () => {
      expect(createMap<string, number>().set('a', 1).set('a', 2).has('a')).toBe(true)
    })

    it('does not modify the map', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(map.has('a')).toBe(true)
      expect(map.size).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty map', () => {
      expect(createMap<string, number>().size).toBe(0)
    })

    it('size increases with set', () => {
      expect(createMap<string, number>().set('a', 1).size).toBe(1)
    })

    it('size does not increase on overwrite', () => {
      expect(createMap<string, number>().set('a', 1).set('a', 2).size).toBe(1)
    })

    it('size decreases with delete', () => {
      expect(createMap<string, number>().set('a', 1).set('b', 2).delete('a').size).toBe(1)
    })

    it('isEmpty is true for empty map', () => {
      expect(createMap<string, number>().isEmpty).toBe(true)
    })

    it('isEmpty is false after set', () => {
      expect(createMap<string, number>().set('a', 1).isEmpty).toBe(false)
    })

    it('isEmpty is true after deleting all', () => {
      expect(createMap<string, number>().set('a', 1).delete('a').isEmpty).toBe(true)
    })

    it('size is a getter', () => {
      expect(typeof createMap<string, number>().size).toBe('number')
    })

    it('isEmpty is a getter', () => {
      expect(typeof createMap<string, number>().isEmpty).toBe('boolean')
    })
  })

  describe('clear', () => {
    it('returns empty map', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const cleared = map.clear()
      expect(cleared.size).toBe(0)
      expect(cleared.isEmpty).toBe(true)
    })

    it('does not modify original', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const cleared = map.clear()
      expect(map.size).toBe(2)
      expect(cleared.size).toBe(0)
    })

    it('returns new instance', () => {
      const map = createMap<string, number>().set('a', 1)
      const cleared = map.clear()
      expect(cleared).not.toBe(map)
    })

    it('clear on empty map returns empty', () => {
      const map = createMap<string, number>()
      const cleared = map.clear()
      expect(cleared.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      expect(createMap<string, number>().toArray()).toEqual([])
    })

    it('returns entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const arr = map.toArray()
      expect(arr.length).toBe(2)
    })

    it('does not modify the map', () => {
      const map = createMap<string, number>().set('a', 1)
      const arr = map.toArray()
      expect(arr).toEqual([['a', 1]])
      expect(map.size).toBe(1)
    })

    it('multiple toArray calls return same result', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(map.toArray()).toEqual(map.toArray())
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      let count = 0
      createMap<string, number>().forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each entry', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const entries: [string, number][] = []
      map.forEach((v, k) => entries.push([k, v]))
      expect(entries.length).toBe(3)
    })

    it('provides correct map reference', () => {
      const map = createMap<string, number>().set('a', 1)
      let ref: PersistentMap<string, number> | undefined
      map.forEach((_v, _k, m) => { ref = m })
      expect(ref).toBe(map)
    })

    it('forEach does not modify map', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      map.forEach(() => {})
      expect(map.size).toBe(2)
    })

    it('forEach on single entry', () => {
      const map = createMap<string, number>().set('only', 42)
      const entries: [string, number][] = []
      map.forEach((v, k) => entries.push([k, v]))
      expect(entries).toEqual([['only', 42]])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('returns empty iterator for empty map', () => {
      expect([...createMap<string, number>()]).toEqual([])
    })

    it('iterates entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const entries = [...map]
      expect(entries.length).toBe(2)
    })

    it('works with for...of', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const entries: [string, number][] = []
      for (const entry of map) {
        entries.push(entry)
      }
      expect(entries.length).toBe(3)
    })

    it('can be used with Array.from', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(Array.from(map).length).toBe(1)
    })

    it('iterator does not modify map', () => {
      const map = createMap<string, number>().set('a', 1)
      ;[...map]
      expect(map.size).toBe(1)
    })

    it('iterator on single entry', () => {
      const map = createMap<string, number>().set('only', 42)
      expect([...map]).toEqual([['only', 42]])
    })
  })

  describe('keys/values/entries', () => {
    it('entries returns empty for empty map', () => {
      expect(createMap<string, number>().entries()).toEqual([])
    })

    it('entries returns all entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const e = map.entries()
      expect(e.length).toBe(2)
    })

    it('keys returns all keys', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const k = map.keys()
      expect(k).toContain('a')
      expect(k).toContain('b')
      expect(k.length).toBe(2)
    })

    it('values returns all values', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const v = map.values()
      expect(v).toContain(1)
      expect(v).toContain(2)
      expect(v.length).toBe(2)
    })

    it('keys returns empty for empty map', () => {
      expect(createMap<string, number>().keys()).toEqual([])
    })

    it('values returns empty for empty map', () => {
      expect(createMap<string, number>().values()).toEqual([])
    })

    it('entries after delete', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3).delete('b')
      expect(map.entries().length).toBe(2)
      expect(map.has('a')).toBe(true)
      expect(map.has('c')).toBe(true)
    })

    it('keys after delete', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3).delete('a')
      expect(map.keys().length).toBe(2)
      expect(map.keys()).not.toContain('a')
    })

    it('values after delete', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3).delete('c')
      expect(map.values().length).toBe(2)
      expect(map.values()).not.toContain(3)
    })
  })

  describe('clone', () => {
    it('returns same instance since persistent', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const cloned = map.clone()
      expect(cloned).toBe(map)
    })

    it('clone on empty map returns same', () => {
      const map = createMap<string, number>()
      expect(map.clone()).toBe(map)
    })
  })

  describe('fromArray', () => {
    it('creates empty map from empty array', () => {
      const map = PersistentMap.fromArray<string, number>([])
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates map from single entry', () => {
      const map = PersistentMap.fromArray([['a', 1]])
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('creates map from multiple entries', () => {
      const map = PersistentMap.fromArray([['c', 3], ['a', 1], ['b', 2]])
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('creates map with custom hash', () => {
      const map = PersistentMap.fromArray<string, number>(
        [['a', 1], ['b', 2]],
        { hash: (k) => k.charCodeAt(0) },
      )
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('last entry wins for duplicate keys', () => {
      const map = PersistentMap.fromArray([['a', 1], ['a', 2]])
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(2)
    })

    it('does not modify input array', () => {
      const arr: [string, number][] = [['a', 1], ['b', 2]]
      PersistentMap.fromArray(arr)
      expect(arr).toEqual([['a', 1], ['b', 2]])
    })

    it('creates map from numeric entries', () => {
      const map = PersistentMap.fromArray([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })
  })

  describe('merge', () => {
    it('merge two empty maps', () => {
      const m1 = createMap<string, number>()
      const m2 = createMap<string, number>()
      const merged = m1.merge(m2)
      expect(merged.size).toBe(0)
    })

    it('merge with empty map returns same entries', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = createMap<string, number>()
      const merged = m1.merge(m2)
      expect(merged.size).toBe(1)
      expect(merged.get('a')).toBe(1)
    })

    it('merge empty with non-empty', () => {
      const m1 = createMap<string, number>()
      const m2 = createMap<string, number>().set('a', 1)
      const merged = m1.merge(m2)
      expect(merged.size).toBe(1)
      expect(merged.get('a')).toBe(1)
    })

    it('merge two maps', () => {
      const m1 = createMap<string, number>().set('a', 1).set('b', 2)
      const m2 = createMap<string, number>().set('c', 3).set('d', 4)
      const merged = m1.merge(m2)
      expect(merged.size).toBe(4)
      expect(merged.get('a')).toBe(1)
      expect(merged.get('b')).toBe(2)
      expect(merged.get('c')).toBe(3)
      expect(merged.get('d')).toBe(4)
    })

    it('merge overwrites with other map values', () => {
      const m1 = createMap<string, number>().set('a', 1).set('b', 2)
      const m2 = createMap<string, number>().set('a', 10).set('c', 3)
      const merged = m1.merge(m2)
      expect(merged.size).toBe(3)
      expect(merged.get('a')).toBe(10)
      expect(merged.get('b')).toBe(2)
      expect(merged.get('c')).toBe(3)
    })

    it('merge does not modify originals', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = createMap<string, number>().set('b', 2)
      m1.merge(m2)
      expect(m1.size).toBe(1)
      expect(m2.size).toBe(1)
    })
  })

  describe('equals', () => {
    it('two empty maps are equal', () => {
      const m1 = createMap<string, number>()
      const m2 = createMap<string, number>()
      expect(m1.equals(m2)).toBe(true)
    })

    it('empty and non-empty are not equal', () => {
      const m1 = createMap<string, number>()
      const m2 = createMap<string, number>().set('a', 1)
      expect(m1.equals(m2)).toBe(false)
    })

    it('same entries are equal', () => {
      const m1 = createMap<string, number>().set('a', 1).set('b', 2)
      const m2 = createMap<string, number>().set('a', 1).set('b', 2)
      expect(m1.equals(m2)).toBe(true)
    })

    it('different values are not equal', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = createMap<string, number>().set('a', 2)
      expect(m1.equals(m2)).toBe(false)
    })

    it('different keys are not equal', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = createMap<string, number>().set('b', 1)
      expect(m1.equals(m2)).toBe(false)
    })

    it('different sizes are not equal', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = createMap<string, number>().set('a', 1).set('b', 2)
      expect(m1.equals(m2)).toBe(false)
    })

    it('deep equals with object values', () => {
      const m1 = createMap<string, { x: number }>().set('a', { x: 1 })
      const m2 = createMap<string, { x: number }>().set('a', { x: 1 })
      expect(m1.equals(m2)).toBe(true)
    })

    it('deep equals with array values', () => {
      const m1 = createMap<string, number[]>().set('a', [1, 2, 3])
      const m2 = createMap<string, number[]>().set('a', [1, 2, 3])
      expect(m1.equals(m2)).toBe(true)
    })

    it('not equal with different nested objects', () => {
      const m1 = createMap<string, { x: number }>().set('a', { x: 1 })
      const m2 = createMap<string, { x: number }>().set('a', { x: 2 })
      expect(m1.equals(m2)).toBe(false)
    })
  })

  describe('filter', () => {
    it('filter empty map returns empty', () => {
      const map = createMap<string, number>()
      const filtered = map.filter(() => true)
      expect(filtered.size).toBe(0)
    })

    it('filter removes entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const filtered = map.filter((v) => v > 1)
      expect(filtered.size).toBe(2)
      expect(filtered.has('a')).toBe(false)
      expect(filtered.has('b')).toBe(true)
      expect(filtered.has('c')).toBe(true)
    })

    it('filter keeps all entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const filtered = map.filter(() => true)
      expect(filtered.size).toBe(2)
    })

    it('filter removes all entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const filtered = map.filter(() => false)
      expect(filtered.size).toBe(0)
    })

    it('filter does not modify original', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      map.filter((v) => v > 1)
      expect(map.size).toBe(2)
    })

    it('filter uses key in predicate', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const filtered = map.filter((_v, k) => k === 'a')
      expect(filtered.size).toBe(1)
      expect(filtered.get('a')).toBe(1)
    })
  })

  describe('map', () => {
    it('map empty returns empty', () => {
      const map = createMap<string, number>()
      const mapped = map.map((v) => v * 2)
      expect(mapped.size).toBe(0)
    })

    it('map transforms values', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const mapped = map.map((v) => v * 10)
      expect(mapped.get('a')).toBe(10)
      expect(mapped.get('b')).toBe(20)
      expect(mapped.get('c')).toBe(30)
    })

    it('map does not modify original', () => {
      const map = createMap<string, number>().set('a', 1)
      map.map((v) => v * 2)
      expect(map.get('a')).toBe(1)
    })

    it('map uses key', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const mapped = map.map((_v, k) => k)
      expect(mapped.get('a')).toBe('a')
      expect(mapped.get('b')).toBe('b')
    })

    it('map changes value type', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const mapped = map.map((v) => String(v))
      expect(mapped.get('a')).toBe('1')
      expect(mapped.get('b')).toBe('2')
    })
  })

  describe('every', () => {
    it('returns true for empty map', () => {
      expect(createMap<string, number>().every(() => false)).toBe(true)
    })

    it('returns true when all pass', () => {
      const map = createMap<string, number>().set('a', 2).set('b', 4)
      expect(map.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when some fail', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      expect(map.every((v) => v % 2 === 0)).toBe(false)
    })
  })

  describe('some', () => {
    it('returns false for empty map', () => {
      expect(createMap<string, number>().some(() => true)).toBe(false)
    })

    it('returns true when some pass', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      expect(map.some((v) => v === 1)).toBe(true)
    })

    it('returns false when none pass', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      expect(map.some((v) => v > 10)).toBe(false)
    })
  })

  describe('find', () => {
    it('returns undefined for empty map', () => {
      expect(createMap<string, number>().find(() => true)).toBeUndefined()
    })

    it('returns matching value', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      expect(map.find((v) => v === 2)).toBe(2)
    })

    it('returns undefined when no match', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(map.find((v) => v > 10)).toBeUndefined()
    })

    it('uses key in predicate', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      expect(map.find((_v, k) => k === 'b')).toBe(2)
    })
  })

  describe('reduce', () => {
    it('returns initial for empty map', () => {
      const map = createMap<string, number>()
      expect(map.reduce((acc, v) => acc + v, 0)).toBe(0)
    })

    it('sums values', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      expect(map.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('builds object from entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const result = map.reduce<Record<string, number>>(
        (acc, v, k) => { acc[k] = v; return acc },
        {},
      )
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('does not modify original', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      map.reduce((acc, v) => acc + v, 0)
      expect(map.size).toBe(2)
    })
  })

  describe('update', () => {
    it('updates existing key', () => {
      const map = createMap<string, number>().set('a', 1)
      const updated = map.update('a', (v) => (v ?? 0) + 10)
      expect(updated.get('a')).toBe(11)
    })

    it('sets new key when missing', () => {
      const map = createMap<string, number>()
      const updated = map.update('a', (v) => (v ?? 0) + 1)
      expect(updated.get('a')).toBe(1)
    })

    it('does not modify original', () => {
      const map = createMap<string, number>().set('a', 1)
      map.update('a', (v) => (v ?? 0) + 1)
      expect(map.get('a')).toBe(1)
    })

    it('update increases size for new key', () => {
      const map = createMap<string, number>().set('a', 1)
      const updated = map.update('b', (v) => (v ?? 0) + 5)
      expect(updated.size).toBe(2)
      expect(updated.get('b')).toBe(5)
    })

    it('update on non-existent key', () => {
      const map = createMap<string, number>()
      const updated = map.update('new', () => 42)
      expect(updated.get('new')).toBe(42)
      expect(updated.size).toBe(1)
    })

    it('update preserves other entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const updated = map.update('a', (v) => (v ?? 0) * 10)
      expect(updated.get('a')).toBe(10)
      expect(updated.get('b')).toBe(2)
    })
  })

  describe('count', () => {
    it('returns 0 for empty map', () => {
      expect(createMap<string, number>().count()).toBe(0)
    })

    it('returns size for non-empty map', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      expect(map.count()).toBe(2)
    })

    it('equals size', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      expect(map.count()).toBe(map.size)
    })
  })

  describe('persistence verification', () => {
    it('original map unchanged after set', () => {
      const original = createMap<string, number>().set('a', 1).set('b', 2)
      const modified = original.set('c', 3)
      expect(original.size).toBe(2)
      expect(original.has('c')).toBe(false)
      expect(modified.size).toBe(3)
      expect(modified.get('c')).toBe(3)
    })

    it('original map unchanged after delete', () => {
      const original = createMap<string, number>().set('a', 1).set('b', 2)
      const modified = original.delete('a')
      expect(original.size).toBe(2)
      expect(original.get('a')).toBe(1)
      expect(modified.size).toBe(1)
      expect(modified.has('a')).toBe(false)
    })

    it('original map unchanged after overwrite', () => {
      const original = createMap<string, number>().set('a', 1)
      const modified = original.set('a', 2)
      expect(original.get('a')).toBe(1)
      expect(modified.get('a')).toBe(2)
    })

    it('all intermediate versions remain accessible', () => {
      const m0 = createMap<number, string>()
      const m1 = m0.set(3, 'c')
      const m2 = m1.set(1, 'a')
      const m3 = m2.set(2, 'b')
      expect(m0.entries()).toEqual([])
      expect(m1.size).toBe(1)
      expect(m2.size).toBe(2)
      expect(m3.size).toBe(3)
    })

    it('branching history from same ancestor', () => {
      const base = createMap<string, number>().set('a', 1).set('b', 2)
      const branchA = base.set('c', 3)
      const branchB = base.set('d', 4)
      expect(base.size).toBe(2)
      expect(branchA.get('c')).toBe(3)
      expect(branchA.has('d')).toBe(false)
      expect(branchB.get('d')).toBe(4)
      expect(branchB.has('c')).toBe(false)
    })

    it('delete branches independently', () => {
      const base = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const d1 = base.delete(1)
      const d2 = base.delete(3)
      expect(base.size).toBe(3)
      expect(d1.size).toBe(2)
      expect(d2.size).toBe(2)
    })

    it('complex branching scenario', () => {
      const root = createMap<string, number>().set('b', 2)
      const left = root.set('a', 1)
      const right = root.set('c', 3)
      expect(root.size).toBe(1)
      expect(left.size).toBe(2)
      expect(right.size).toBe(2)
    })

    it('set after delete from same base', () => {
      const base = createMap<string, number>().set('a', 1).set('b', 2)
      const d = base.delete('a')
      const s = d.set('c', 3)
      expect(base.size).toBe(2)
      expect(d.size).toBe(1)
      expect(s.size).toBe(2)
    })

    it('deep chain of mutations preserves all versions', () => {
      const maps: PersistentMap<number, number>[] = [createMap()]
      for (let i = 0; i < 10; i++) {
        maps.push(maps[maps.length - 1]!.set(i, i * 10))
      }
      for (let i = 0; i <= 10; i++) {
        expect(maps[i]!.size).toBe(i)
      }
    })
  })

  describe('collision handling', () => {
    it('handles hash collisions', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('overwrite in collision node', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('a', 2)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(2)
    })

    it('delete from collision node', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      const deleted = map.delete('b')
      expect(deleted.size).toBe(2)
      expect(deleted.get('a')).toBe(1)
      expect(deleted.get('c')).toBe(3)
      expect(deleted.has('b')).toBe(false)
    })

    it('collision to single leaf after deletes', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
      const deleted = map.delete('a')
      expect(deleted.size).toBe(1)
      expect(deleted.get('b')).toBe(2)
    })

    it('collision to empty after all deletes', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
      const d1 = map.delete('a')
      const d2 = d1.delete('b')
      expect(d2.isEmpty).toBe(true)
    })

    it('persistence with collisions', () => {
      const m1 = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
      const m2 = m1.set('c', 3)
      expect(m1.size).toBe(2)
      expect(m2.size).toBe(3)
      expect(m1.has('c')).toBe(false)
    })

    it('has works with collisions', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
      expect(map.has('a')).toBe(true)
      expect(map.has('b')).toBe(true)
      expect(map.has('c')).toBe(false)
    })

    it('entries with collisions', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      const entries = map.entries()
      expect(entries.length).toBe(3)
    })

    it('collision split when inserting different hash', () => {
      let map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
      const customMap = new PersistentMap<string, number>({
        hash: (k) => k === 'a' || k === 'b' ? 42 : 999,
      }).set('a', 1).set('b', 2).set('c', 3)
      expect(customMap.size).toBe(3)
      expect(customMap.get('a')).toBe(1)
      expect(customMap.get('b')).toBe(2)
      expect(customMap.get('c')).toBe(3)
    })

    it('filter on collision map', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
        .set('c', 3)
      const filtered = map.filter((v) => v > 1)
      expect(filtered.size).toBe(2)
      expect(filtered.has('a')).toBe(false)
    })

    it('map on collision map', () => {
      const map = createMapWithHash<string, number>(constantHash())
        .set('a', 1)
        .set('b', 2)
      const mapped = map.map((v) => v * 10)
      expect(mapped.get('a')).toBe(10)
      expect(mapped.get('b')).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('empty map operations', () => {
      const map = createMap<string, number>()
      expect(map.get('a')).toBeUndefined()
      expect(map.has('a')).toBe(false)
      expect(map.entries()).toEqual([])
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.toArray()).toEqual([])
    })

    it('single entry map', () => {
      const map = createMap<string, number>().set('only', 42)
      expect(map.size).toBe(1)
      expect(map.get('only')).toBe(42)
      expect(map.has('only')).toBe(true)
    })

    it('duplicate key overwrite preserves immutability', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = m1.set('a', 2)
      const m3 = m2.set('a', 3)
      expect(m1.get('a')).toBe(1)
      expect(m2.get('a')).toBe(2)
      expect(m3.get('a')).toBe(3)
      expect(m1.size).toBe(1)
      expect(m2.size).toBe(1)
      expect(m3.size).toBe(1)
    })

    it('works with empty string key', () => {
      const map = createMap<string, number>().set('', 0)
      expect(map.get('')).toBe(0)
      expect(map.has('')).toBe(true)
    })

    it('works with zero key', () => {
      const map = createMap<number, string>().set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('works with boolean values', () => {
      const map = createMap<string, boolean>().set('a', true).set('b', false)
      expect(map.get('a')).toBe(true)
      expect(map.get('b')).toBe(false)
    })

    it('works with array values', () => {
      const map = createMap<string, number[]>().set('a', [1, 2, 3])
      expect(map.get('a')).toEqual([1, 2, 3])
    })

    it('set delete set cycle', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = m1.delete('a')
      const m3 = m2.set('a', 2)
      expect(m1.get('a')).toBe(1)
      expect(m2.has('a')).toBe(false)
      expect(m3.get('a')).toBe(2)
    })

    it('many overwrites on same key', () => {
      let map = createMap<string, number>()
      for (let i = 0; i < 100; i++) {
        map = map.set('key', i)
      }
      expect(map.size).toBe(1)
      expect(map.get('key')).toBe(99)
    })

    it('handles alternating insert delete', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 100; i++) {
        map = map.set(i, i)
        if (i > 0 && i % 2 === 0) {
          map = map.delete(i - 1)
        }
      }
      expect(map.size).toBeGreaterThan(0)
    })

    it('delete non-existent does not create new instance', () => {
      const m = createMap<string, number>().set('a', 1)
      const result = m.delete('nonexistent')
      expect(result).toBe(m)
    })

    it('entries after overwrite maintain integrity', () => {
      const map = createMap<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('a', 10)
      expect(map.get('a')).toBe(10)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(2)
    })

    it('fromArray followed by chain of operations', () => {
      const m1 = PersistentMap.fromArray([['a', 1], ['b', 2], ['c', 3]])
      const m2 = m1.delete('b')
      const m3 = m2.set('d', 4)
      expect(m1.size).toBe(3)
      expect(m2.size).toBe(2)
      expect(m3.size).toBe(3)
    })

    it('forEach on large map', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 500; i++) map = map.set(i, i * 2)
      let count = 0
      map.forEach((v, k) => {
        count++
        expect(v).toBe(k * 2)
      })
      expect(count).toBe(500)
    })

    it('large map persistence snapshots', () => {
      const snapshots: PersistentMap<number, number>[] = []
      let map = createMap<number, number>()
      for (let i = 0; i < 200; i++) {
        map = map.set(i, i)
        if (i % 20 === 19) snapshots.push(map)
      }
      expect(snapshots.length).toBe(10)
      for (let s = 0; s < snapshots.length; s++) {
        expect(snapshots[s]!.size).toBe((s + 1) * 20)
      }
    })

    it('works with Map-like entries pattern', () => {
      const entries: [string, number][] = [['x', 10], ['y', 20], ['z', 30]]
      const map = PersistentMap.fromArray(entries)
      expect(map.size).toBe(3)
      expect(map.get('x')).toBe(10)
      expect(map.get('y')).toBe(20)
      expect(map.get('z')).toBe(30)
    })

    it('filter returns new instance', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const filtered = map.filter(() => true)
      expect(filtered).not.toBe(map)
    })

    it('map returns new instance', () => {
      const map = createMap<string, number>().set('a', 1)
      const mapped = map.map((v) => v)
      expect(mapped).not.toBe(map)
    })

    it('merge returns new instance', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = createMap<string, number>().set('b', 2)
      const merged = m1.merge(m2)
      expect(merged).not.toBe(m1)
      expect(merged).not.toBe(m2)
    })

    it('reduce with string accumulator', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const result = map.reduce((acc, v, k) => acc + k + v, '')
      expect(result).toContain('a1')
      expect(result).toContain('b2')
    })

    it('find returns first matching value', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const found = map.find((v) => v > 1)
      expect(found).toBeDefined()
      expect(found! > 1).toBe(true)
    })
  })

  describe('large maps', () => {
    it('handles 1000 sequential inserts', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map = map.set(i, i * 2)
      }
      expect(map.size).toBe(1000)
      expect(map.get(500)).toBe(1000)
    })

    it('handles 1000 inserts and 500 deletes', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map = map.set(i, i)
      }
      expect(map.size).toBe(1000)
      for (let i = 0; i < 500; i++) {
        map = map.delete(i)
      }
      expect(map.size).toBe(500)
      expect(map.has(0)).toBe(false)
      expect(map.has(499)).toBe(false)
      expect(map.has(500)).toBe(true)
    })

    it('persistence with large maps', () => {
      let map = createMap<number, number>()
      const snapshots: PersistentMap<number, number>[] = []
      for (let i = 0; i < 1000; i++) {
        map = map.set(i, i)
        if (i % 100 === 99) snapshots.push(map)
      }
      expect(snapshots.length).toBe(10)
      for (let s = 0; s < snapshots.length; s++) {
        expect(snapshots[s]!.size).toBe((s + 1) * 100)
      }
    })
  })

  describe('structural sharing', () => {
    it('set shares unmodified subtrees', () => {
      let base = createMap<number, number>()
      for (let i = 0; i < 100; i++) {
        base = base.set(i, i)
      }
      const modified = base.set(50, 999)
      expect(base.get(50)).toBe(50)
      expect(modified.get(50)).toBe(999)
      expect(base.size).toBe(100)
      expect(modified.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        if (i !== 50) {
          expect(modified.get(i)).toBe(i)
        }
      }
    })

    it('delete shares unmodified subtrees', () => {
      let base = createMap<number, number>()
      for (let i = 0; i < 100; i++) {
        base = base.set(i, i)
      }
      const modified = base.delete(50)
      expect(base.get(50)).toBe(50)
      expect(modified.has(50)).toBe(false)
      expect(base.size).toBe(100)
      expect(modified.size).toBe(99)
    })
  })

  describe('type safety', () => {
    it('works with number keys and string values', () => {
      const map = new PersistentMap<number, string>()
      const m = map.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })

    it('works with string keys and number values', () => {
      const map = new PersistentMap<string, number>()
      const m = map.set('a', 1)
      expect(m.get('a')).toBe(1)
    })

    it('works with custom type values', () => {
      type Item = { priority: number; label: string }
      const map = new PersistentMap<string, Item>()
      const m = map
        .set('a', { priority: 3, label: 'low' })
        .set('b', { priority: 1, label: 'high' })
      expect(m.get('b')!.label).toBe('high')
    })
  })

  describe('withDefault', () => {
    it('returns the map itself', () => {
      const map = createMap<string, number>().set('a', 1)
      const withDef = map.withDefault(0)
      expect(withDef).toBe(map)
    })

    it('returns same on empty map', () => {
      const map = createMap<string, number>()
      expect(map.withDefault(0)).toBe(map)
    })
  })

  describe('exports', () => {
    it('exports PersistentMapOptions type', () => {
      const opts: PersistentMapOptions<string> = { hash: (k) => k.length }
      const map = new PersistentMap<string, number>(opts)
      expect(map.size).toBe(0)
    })
  })
})
