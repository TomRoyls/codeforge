import { describe, it, expect, beforeEach } from 'vitest'
import { HashMap } from '../../src/core/hash-map/hash-map.js'
import { DEFAULT_HASHMAP_OPTIONS } from '../../src/core/hash-map/types.js'
import type { HashMapEntry, HashMapOptions } from '../../src/core/hash-map/types.js'

describe('HashMap', () => {
  let map: HashMap<string, number>

  beforeEach(() => {
    map = new HashMap<string, number>()
  })

  describe('constructor', () => {
    it('should create a map with default options', () => {
      const m = new HashMap<string, number>()
      expect(m.size()).toBe(0)
    })

    it('should accept custom initialCapacity option', () => {
      const m = new HashMap<string, number>({ initialCapacity: 32 })
      expect(m.capacity()).toBe(32)
    })

    it('should accept custom loadFactor option', () => {
      const m = new HashMap<string, number>({ loadFactor: 0.5 })
      expect(m.size()).toBe(0)
    })

    it('should accept partial options', () => {
      const m = new HashMap<string, number>({ initialCapacity: 8 })
      expect(m.capacity()).toBe(8)
    })

    it('should accept all options combined', () => {
      const m = new HashMap<string, number>({ initialCapacity: 4, loadFactor: 0.5 })
      expect(m.capacity()).toBe(4)
    })
  })

  describe('set and get', () => {
    it('should return undefined for missing key', () => {
      expect(map.get('missing')).toBeUndefined()
    })

    it('should store and retrieve a value', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('should overwrite existing key', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('should not increase size when overwriting', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size()).toBe(1)
    })

    it('should handle multiple keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('should handle numeric string keys', () => {
      map.set('0', 10)
      map.set('1', 20)
      expect(map.get('0')).toBe(10)
      expect(map.get('1')).toBe(20)
    })

    it('should return undefined for key not in map', () => {
      map.set('a', 1)
      expect(map.get('b')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(map.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('should return false after delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })

    it('should return true for multiple existing keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.has('a')).toBe(true)
      expect(map.has('b')).toBe(true)
    })

    it('should not affect size', () => {
      map.set('a', 1)
      map.has('a')
      expect(map.size()).toBe(1)
    })
  })

  describe('delete', () => {
    it('should return false for missing key', () => {
      expect(map.delete('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
    })

    it('should remove item from map', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.size()).toBe(0)
    })

    it('should only remove specified key', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.has('a')).toBe(false)
      expect(map.has('b')).toBe(true)
    })

    it('should handle deleting from empty map', () => {
      expect(map.delete('a')).toBe(false)
      expect(map.size()).toBe(0)
    })

    it('should handle deleting the same key twice', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.delete('a')).toBe(false)
    })

    it('should decrement size correctly', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      expect(map.size()).toBe(2)
    })

    it('should allow re-adding deleted key', () => {
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size()).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size()).toBe(0)
    })

    it('should return correct size after sets', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size()).toBe(2)
    })

    it('should return correct size after deletes', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size()).toBe(0)
    })

    it('should return correct size after overwrites', () => {
      map.set('a', 1)
      map.set('a', 2)
      map.set('b', 3)
      expect(map.size()).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty map', () => {
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false after adding item', () => {
      map.set('a', 1)
      expect(map.isEmpty()).toBe(false)
    })

    it('should return true after clearing all items', () => {
      map.set('a', 1)
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })

    it('should return true after deleting all items', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.isEmpty()).toBe(true)
    })

    it('should return false when items remain', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size()).toBe(0)
    })

    it('should allow set after clear', () => {
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.get('b')).toBe(2)
    })

    it('should handle clearing empty map', () => {
      map.clear()
      expect(map.size()).toBe(0)
    })

    it('should preserve capacity', () => {
      const initialCapacity = map.capacity()
      map.set('a', 1)
      map.clear()
      expect(map.capacity()).toBe(initialCapacity)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return all keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = map.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
      expect(keys.length).toBe(3)
    })

    it('should reflect deletions', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.keys()).toEqual(['b'])
    })

    it('should reflect overwrites', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.keys()).toEqual(['a'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return all values', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const values = map.values()
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
      expect(values.length).toBe(3)
    })

    it('should reflect updated values', () => {
      map.set('a', 1)
      map.set('a', 99)
      expect(map.values()).toEqual([99])
    })

    it('should reflect deletions', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return all entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries.length).toBe(2)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
    })

    it('should reflect updates', () => {
      map.set('a', 1)
      map.set('a', 99)
      expect(map.entries()).toEqual([['a', 99]])
    })

    it('should reflect deletions', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.entries()).toEqual([['b', 2]])
    })
  })

  describe('forEach', () => {
    it('should iterate over empty map without calling callback', () => {
      const items: Array<[string, number]> = []
      map.forEach((key, value) => items.push([key, value]))
      expect(items).toEqual([])
    })

    it('should iterate over all items', () => {
      map.set('a', 1)
      map.set('b', 2)
      const items: Array<[string, number]> = []
      map.forEach((key, value) => items.push([key, value]))
      expect(items.length).toBe(2)
      expect(items).toContainEqual(['a', 1])
      expect(items).toContainEqual(['b', 2])
    })

    it('should provide correct key and value', () => {
      map.set('x', 42)
      map.forEach((key, value) => {
        expect(key).toBe('x')
        expect(value).toBe(42)
      })
    })

    it('should iterate over many items', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key-${i}`, i)
      }
      const items: Array<[string, number]> = []
      map.forEach((key, value) => items.push([key, value]))
      expect(items.length).toBe(50)
    })
  })

  describe('resize', () => {
    it('should change capacity', () => {
      map.resize(32)
      expect(map.capacity()).toBe(32)
    })

    it('should preserve all entries after resize', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.resize(64)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.size()).toBe(3)
    })

    it('should allow shrinking', () => {
      const m = new HashMap<string, number>({ initialCapacity: 16, loadFactor: 1.0 })
      m.set('a', 1)
      m.set('b', 2)
      m.resize(4)
      expect(m.capacity()).toBe(4)
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBe(2)
    })

    it('should work after resizing to same capacity', () => {
      map.set('a', 1)
      const cap = map.capacity()
      map.resize(cap)
      expect(map.get('a')).toBe(1)
      expect(map.capacity()).toBe(cap)
    })
  })

  describe('load', () => {
    it('should return 0 for empty map', () => {
      expect(map.load()).toBe(0)
    })

    it('should increase as items are added', () => {
      const cap = map.capacity()
      map.set('a', 1)
      expect(map.load()).toBe(1 / cap)
    })

    it('should decrease as items are deleted', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const cap = map.capacity()
      expect(map.load()).toBe(1 / cap)
    })

    it('should return 0 after clear', () => {
      map.set('a', 1)
      map.clear()
      expect(map.load()).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return default capacity', () => {
      expect(map.capacity()).toBe(DEFAULT_HASHMAP_OPTIONS.initialCapacity)
    })

    it('should return custom capacity', () => {
      const m = new HashMap<string, number>({ initialCapacity: 32 })
      expect(m.capacity()).toBe(32)
    })

    it('should reflect resize', () => {
      map.resize(64)
      expect(map.capacity()).toBe(64)
    })
  })

  describe('auto-resize', () => {
    it('should auto-resize when load factor exceeded', () => {
      const m = new HashMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      expect(m.capacity()).toBeGreaterThan(4)
    })

    it('should preserve entries after auto-resize', () => {
      const m = new HashMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBe(2)
      expect(m.get('c')).toBe(3)
    })

    it('should maintain correct size after auto-resize', () => {
      const m = new HashMap<string, number>({ initialCapacity: 4, loadFactor: 0.75 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      expect(m.size()).toBe(3)
    })

    it('should auto-resize multiple times', () => {
      const m = new HashMap<string, number>({ initialCapacity: 2, loadFactor: 0.75 })
      for (let i = 0; i < 20; i++) {
        m.set(`key-${i}`, i)
      }
      expect(m.size()).toBe(20)
      expect(m.capacity()).toBeGreaterThan(2)
      for (let i = 0; i < 20; i++) {
        expect(m.get(`key-${i}`)).toBe(i)
      }
    })
  })

  describe('collision handling (separate chaining)', () => {
    it('should handle collisions by chaining', () => {
      const m = new HashMap<string, number>({ initialCapacity: 1, loadFactor: 1.0 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBe(2)
      expect(m.get('c')).toBe(3)
    })

    it('should handle deleting from chain', () => {
      const m = new HashMap<string, number>({ initialCapacity: 1, loadFactor: 1.0 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      m.delete('b')
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBeUndefined()
      expect(m.get('c')).toBe(3)
    })

    it('should handle deleting head of chain', () => {
      const m = new HashMap<string, number>({ initialCapacity: 1, loadFactor: 1.0 })
      m.set('a', 1)
      m.set('b', 2)
      m.delete('a')
      expect(m.get('a')).toBeUndefined()
      expect(m.get('b')).toBe(2)
    })

    it('should handle deleting tail of chain', () => {
      const m = new HashMap<string, number>({ initialCapacity: 1, loadFactor: 1.0 })
      m.set('a', 1)
      m.set('b', 2)
      m.delete('b')
      expect(m.get('a')).toBe(1)
      expect(m.get('b')).toBeUndefined()
    })

    it('should handle overwriting in chain', () => {
      const m = new HashMap<string, number>({ initialCapacity: 1, loadFactor: 1.0 })
      m.set('a', 1)
      m.set('b', 2)
      m.set('a', 99)
      expect(m.get('a')).toBe(99)
      expect(m.get('b')).toBe(2)
      expect(m.size()).toBe(2)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_HASHMAP_OPTIONS', () => {
      expect(DEFAULT_HASHMAP_OPTIONS.initialCapacity).toBe(16)
      expect(DEFAULT_HASHMAP_OPTIONS.loadFactor).toBe(0.75)
    })

    it('should re-export types from hash-map module', () => {
      const entry: HashMapEntry<string, number> = {
        key: 'test',
        value: 42,
        next: null,
      }
      expect(entry.key).toBe('test')
      expect(entry.value).toBe(42)

      const opts: HashMapOptions = {
        initialCapacity: 32,
        loadFactor: 0.5,
      }
      expect(opts.initialCapacity).toBe(32)
    })

    it('should allow creating HashMapEntry with different types', () => {
      const entry: HashMapEntry<number, string> = {
        key: 1,
        value: 'one',
        next: null,
      }
      expect(entry.key).toBe(1)
      expect(entry.value).toBe('one')
    })

    it('should support HashMapEntry chaining', () => {
      const third: HashMapEntry<string, number> = { key: 'c', value: 3, next: null }
      const second: HashMapEntry<string, number> = { key: 'b', value: 2, next: third }
      const first: HashMapEntry<string, number> = { key: 'a', value: 1, next: second }
      expect(first.next?.next?.key).toBe('c')
    })
  })

  describe('edge cases', () => {
    it('should handle empty map operations', () => {
      expect(map.get('a')).toBeUndefined()
      expect(map.delete('a')).toBe(false)
      expect(map.has('a')).toBe(false)
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.entries()).toEqual([])
    })

    it('should handle single item', () => {
      map.set('only', 42)
      expect(map.get('only')).toBe(42)
      expect(map.has('only')).toBe(true)
      expect(map.size()).toBe(1)
      expect(map.keys()).toEqual(['only'])
    })

    it('should handle numeric keys', () => {
      const m = new HashMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('should handle object values', () => {
      const m = new HashMap<string, { id: number }>()
      const obj = { id: 1 }
      m.set('a', obj)
      expect(m.get('a')?.id).toBe(1)
    })

    it('should handle null values', () => {
      const m = new HashMap<string, number | null>()
      m.set('a', null)
      expect(m.get('a')).toBeNull()
      expect(m.has('a')).toBe(true)
    })

    it('should handle undefined values', () => {
      const m = new HashMap<string, number | undefined>()
      m.set('a', undefined)
      expect(m.get('a')).toBeUndefined()
      expect(m.has('a')).toBe(true)
      expect(m.size()).toBe(1)
    })

    it('should handle boolean values', () => {
      const m = new HashMap<string, boolean>()
      m.set('a', true)
      m.set('b', false)
      expect(m.get('a')).toBe(true)
      expect(m.get('b')).toBe(false)
    })

    it('should handle many items', () => {
      const m = new HashMap<string, number>()
      for (let i = 0; i < 200; i++) {
        m.set(`key-${i}`, i)
      }
      expect(m.size()).toBe(200)
      expect(m.get('key-0')).toBe(0)
      expect(m.get('key-199')).toBe(199)
    })

    it('should handle get after delete and re-add', () => {
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('should handle set-delete-set cycle', () => {
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size()).toBe(1)
    })
  })

  describe('stress testing', () => {
    it('should handle large number of operations', () => {
      const m = new HashMap<number, number>({ initialCapacity: 8 })
      for (let i = 0; i < 1000; i++) {
        m.set(i, i * 2)
      }
      expect(m.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(m.get(i)).toBe(i * 2)
      }
    })

    it('should handle mixed operations', () => {
      const m = new HashMap<string, number>({ initialCapacity: 4 })
      m.set('a', 1)
      m.set('b', 2)
      m.delete('a')
      m.set('c', 3)
      m.set('d', 4)
      m.set('b', 20)
      expect(m.size()).toBe(3)
      expect(m.get('b')).toBe(20)
      expect(m.get('c')).toBe(3)
      expect(m.get('d')).toBe(4)
    })

    it('should handle bulk delete', () => {
      for (let i = 0; i < 50; i++) {
        map.set(`key-${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(`key-${i}`)
      }
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('array method consistency', () => {
    it('should have consistent keys, values, and entries lengths', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.keys().length).toBe(3)
      expect(map.values().length).toBe(3)
      expect(map.entries().length).toBe(3)
    })

    it('should have matching keys and values in entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      for (const [key, value] of entries) {
        expect(map.get(key)).toBe(value)
      }
    })

    it('should reflect all mutations consistently', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.delete('b')
      map.set('a', 10)
      expect(map.keys().length).toBe(2)
      expect(map.values().length).toBe(2)
      expect(map.entries().length).toBe(2)
      expect(map.get('a')).toBe(10)
      expect(map.get('c')).toBe(3)
    })
  })
})
